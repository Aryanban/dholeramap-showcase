/**
 * POST /api/razorpay/create-subscription
 *
 * Creates a Razorpay Subscription for the signed-in user against the plan's
 * recurring Plan id, and returns the subscription id for the client checkout.
 * The client never sees the key secret.
 *
 * Body: { plan: 'pro' | 'max' }
 */
import { NextRequest } from 'next/server';
import { PLANS } from '@/lib/entitlements';
import {
  razorpayClient,
  razorpayCreds,
  razorpayErrDetail,
  requireUserId,
} from '@/lib/razorpay-server';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const authed = await requireUserId();
  if (!authed.ok) return authed.response;
  const userId = authed.userId;

  let body: { plan?: string; recurring?: boolean };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: 'invalid body' }, { status: 400 });
  }

  const planId =
    body.plan === 'max'
      ? 'max'
      : body.plan === 'pro'
      ? 'pro'
      : body.plan === 'investor'
      ? 'investor'
      : null;
  if (!planId) {
    return Response.json(
      { error: 'plan must be "investor", "pro", or "max"' },
      { status: 400 }
    );
  }

  const plan = PLANS[planId];
  const planApiId = plan.razorpayPlanId;
  const rzp = razorpayClient();

  // The buyer chooses: a one-time month (a Checkout order — no mandate, no
  // auto-renewal) or a true recurring mandate (a Razorpay Subscription). A
  // recurring mandate additionally needs a configured plan id and a key whose
  // scope allows subscriptions; otherwise we fall back to an order so the
  // checkout still opens instead of hard-failing.
  const wantsRecurring = body.recurring === true;

  /** Create a Checkout order for this plan (one-time or recurring promotional rate). */
  const createOrder = async () => {
    const effectiveInr = wantsRecurring
      ? (plan.recurringPriceInr || plan.priceInr)
      : plan.priceInr;
    const amountPaisa = effectiveInr * 100;
    const order = await rzp.orders.create({
      amount: amountPaisa,
      currency: 'INR',
      receipt: `sub_${Date.now().toString(36)}_${planId}`,
      notes: {
        clerkUserId: userId,
        plan: planId,
        kind: 'subscription_order',
        amountInr: String(effectiveInr),
        isRecurringPromo: wantsRecurring ? 'true' : 'false',
      },
    });
    return Response.json({
      mode: 'order',
      recurring: wantsRecurring,
      orderId: order.id,
      amountPaisa,
      planId,
      keyId: razorpayCreds().keyId,
    });
  };

  if (!wantsRecurring || !planApiId) {
    try {
      return await createOrder();
    } catch (err) {
      return Response.json(
        { error: 'subscription order creation failed', detail: razorpayErrDetail(err) },
        { status: 502 }
      );
    }
  }

  // Create a customer so renewals attach to a stable record.
  let customer;
  try {
    customer = await rzp.customers.create({
      name: `user_${userId}`,
      notes: { clerkUserId: userId },
    });
  } catch (err) {
    // Customer creation failing usually means the key lacks the recurring
    // scope; fall back to a one-time order rather than blocking checkout.
    try {
      return await createOrder();
    } catch (orderErr) {
      return Response.json(
        { error: 'customer creation failed', detail: razorpayErrDetail(err) },
        { status: 502 }
      );
    }
  }

  // total_count is the number of cycles; 60 cycles = 5 years recurring.
  try {
    const subscription = await rzp.subscriptions.create({
      plan_id: planApiId,
      customer_id: customer.id,
      total_count: 60,
      customer_notify: 1,
      notes: { clerkUserId: userId, plan: planId },
    });
    return Response.json({
      mode: 'subscription',
      recurring: true,
      subscriptionId: subscription.id,
      planId,
      shortUrl: subscription.short_url || null,
      keyId: razorpayCreds().keyId,
    });
  } catch (err) {
    // If recurring subscription creation fails (missing plan id, key scope
    // without subscriptions, etc.), gracefully fall back to a one-time order.
    try {
      return await createOrder();
    } catch (orderErr) {
      return Response.json(
        { error: 'subscription creation failed', detail: razorpayErrDetail(orderErr) },
        { status: 502 }
      );
    }
  }
}
