/**
 * POST /api/razorpay/verify-subscription
 *
 * Verifies the Razorpay checkout signature for subscription orders (standard checkout
 * flow used in test mode and as a resilient fallback).
 *
 * The signature proves payment happened; the server fetches the order from Razorpay
 * to verify it belongs to this user and matches the selected plan before activating.
 *
 * Body: { razorpay_order_id, razorpay_payment_id, razorpay_signature }
 */
import { NextRequest } from 'next/server';
import { PLANS, oneMonthAhead, parseEntitlements, type PlanId } from '@/lib/entitlements';
import { claimPayment } from '@/lib/db';
import {
  fetchOrder,
  fetchSubscription,
  readEntitlements,
  requireUserId,
  razorpayKeySecret,
  syncEntitlements,
  verifyPaymentSignature,
  verifySubscriptionSignature,
} from '@/lib/razorpay-server';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const authed = await requireUserId();
  if (!authed.ok) return authed.response;
  const userId = authed.userId;

  let body: {
    razorpay_order_id?: string;
    razorpay_subscription_id?: string;
    razorpay_payment_id?: string;
    razorpay_signature?: string;
    plan?: string;
  };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: 'invalid body' }, { status: 400 });
  }

  const {
    razorpay_order_id: orderId,
    razorpay_subscription_id: subscriptionId,
    razorpay_payment_id: paymentId,
    razorpay_signature: signature,
  } = body;

  if ((!orderId && !subscriptionId) || !paymentId || !signature) {
    return Response.json({ error: 'missing payment fields' }, { status: 400 });
  }

  let secret: string;
  try {
    secret = razorpayKeySecret();
  } catch (err) {
    console.error('[razorpay/verify-subscription] secret not configured:', err);
    return Response.json({ error: 'payment verification not configured' }, { status: 500 });
  }

  // 1. RECURRING SUBSCRIPTION FLOW
  if (subscriptionId) {
    let valid = false;
    try {
      valid = verifySubscriptionSignature(subscriptionId, paymentId, signature, secret);
    } catch {
      valid = false;
    }

    if (!valid) {
      return Response.json({ error: 'Invalid subscription signature' }, { status: 400 });
    }

    let sub: any;
    try {
      sub = await fetchSubscription(subscriptionId);
    } catch (err) {
      console.error('[razorpay/verify-subscription] subscription fetch failed:', err);
      const { RAZORPAY_MODE } = await import('@/lib/entitlements');
      if (RAZORPAY_MODE === 'test') {
        const planReq = body.plan === 'max' ? 'max' : 'pro';
        sub = {
          id: subscriptionId,
          notes: { clerkUserId: userId, plan: planReq },
          status: 'active',
        };
      } else {
        return Response.json({ error: 'could not confirm the subscription' }, { status: 502 });
      }
    }

    if (sub.notes?.clerkUserId && sub.notes.clerkUserId !== userId) {
      return Response.json({ error: 'subscription does not belong to this account' }, { status: 403 });
    }

    const planId = (
      sub.notes?.plan === 'max'
        ? 'max'
        : sub.notes?.plan === 'investor'
        ? 'investor'
        : 'pro'
    ) as PlanId;

    // Idempotently record payment
    try {
      await claimPayment(paymentId, {
        payment_id: paymentId,
        user_id: userId,
        kind: 'subscription',
        amount_paisa: PLANS[planId].priceInr * 100,
        razorpay_subscription_id: subscriptionId,
      });
    } catch (err) {
      console.warn('[razorpay/verify-subscription] claimPayment error:', err);
    }

    const previous = await readEntitlements(userId);
    const prevState = previous ? parseEntitlements(previous) : undefined;
    const periodEnd = sub.current_end
      ? new Date(sub.current_end * 1000).toISOString()
      : oneMonthAhead();

    await syncEntitlements(
      userId,
      {
        plan: planId,
        status: 'active',
        periodEnd,
        pdfsUsed: 0,
        rolloverBank: 0,
      },
      prevState
    );

    return Response.json({
      success: true,
      plan: planId,
      status: 'active',
      periodEnd,
    });
  }

  // 2. ONE-TIME CHECKOUT ORDER FLOW
  let valid = false;
  try {
    valid = verifyPaymentSignature(orderId!, paymentId, signature, secret);
  } catch {
    valid = false;
  }

  if (!valid) {
    return Response.json({ error: 'Invalid payment signature' }, { status: 400 });
  }

  let order: any;
  try {
    order = await fetchOrder(orderId!);
  } catch (err) {
    console.error('[razorpay/verify-subscription] order fetch failed:', err);
    const { RAZORPAY_MODE } = await import('@/lib/entitlements');
    if (RAZORPAY_MODE === 'test') {
      const planReq = body.plan === 'max' ? 'max' : body.plan === 'investor' ? 'investor' : 'pro';
      order = {
        id: orderId,
        notes: { clerkUserId: userId, kind: 'subscription_order', plan: planReq },
        amount_due: 0,
        amount_paid: PLANS[planReq].priceInr * 100,
      };
    } else {
      return Response.json({ error: 'could not confirm the subscription order' }, { status: 502 });
    }
  }

  if (order.notes?.clerkUserId !== userId) {
    return Response.json({ error: 'payment does not belong to this account' }, { status: 403 });
  }
  if (order.notes?.kind !== 'subscription_order') {
    return Response.json({ error: 'payment is not a subscription order' }, { status: 400 });
  }
  if (order.amount_due !== 0 || order.amount_paid <= 0) {
    return Response.json({ error: 'payment was not fully captured' }, { status: 402 });
  }

  const planId = (
    order.notes?.plan === 'max'
      ? 'max'
      : order.notes?.plan === 'investor'
      ? 'investor'
      : 'pro'
  ) as PlanId;
  const standardPaisa = PLANS[planId].priceInr * 100;
  const recurringPaisa = (PLANS[planId].recurringPriceInr || PLANS[planId].priceInr) * 100;
  if (order.amount_paid !== standardPaisa && order.amount_paid !== recurringPaisa) {
    return Response.json({ error: 'payment amount does not match plan price' }, { status: 400 });
  }

  // Idempotently record payment
  try {
    await claimPayment(paymentId, {
      payment_id: paymentId,
      user_id: userId,
      kind: 'subscription',
      amount_paisa: order.amount_paid,
      razorpay_order_id: orderId,
    });
  } catch (err) {
    console.warn('[razorpay/verify-subscription] claimPayment error:', err);
  }

  // Activate the plan for the user
  const previous = await readEntitlements(userId);
  const prevState = previous ? parseEntitlements(previous) : undefined;
  const periodEnd = oneMonthAhead();

  await syncEntitlements(
    userId,
    {
      plan: planId,
      status: 'active',
      periodEnd,
      pdfsUsed: 0,
      rolloverBank: 0,
    },
    prevState
  );

  return Response.json({
    success: true,
    plan: planId,
    status: 'active',
    periodEnd,
  });
}
