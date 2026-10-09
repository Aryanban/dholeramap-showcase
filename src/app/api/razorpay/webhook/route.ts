/**
 * POST /api/razorpay/webhook
 *
 * The authoritative subscription state machine. Razorpay calls this on every
 * lifecycle event; we translate each into a Clerk metadata update that the
 * client then hydrates for gating.
 *
 *   subscription.charged    -> renew quota, status active, advance periodEnd
 *   subscription.cancelled  -> downgrade to free
 *   payment.failed          -> status past_due (3-day grace via isWithinGrace)
 *
 * Signatures are verified with the webhook secret registered in the Razorpay
 * dashboard. A replay attempt with a bad signature is rejected.
 */
import { NextRequest } from 'next/server';
import {
  GRACE_DAYS,
  PLANS,
  computeRollover,
  oneMonthAhead,
  parseEntitlements,
  type EntitlementState,
  type PlanId,
} from '@/lib/entitlements';
import {
  addAdBoostIdempotent,
  addCreditsIdempotent,
  readEntitlements,
  syncEntitlements,
  verifyWebhookSignature,
} from '@/lib/razorpay-server';
import { claimPayment } from '@/lib/db';
export const runtime = 'nodejs';

interface RazorpaySubscriptionEvent {
  event: string;
  payload: {
    subscription?: {
      entity?: {
        id: string;
        plan_id?: string;
        status?: string;
        current_end?: number;
        ended_at?: number | null;
        notes?: Record<string, string>;
      };
    };
    payment?: {
      entity?: {
        id: string;
        amount: number;
        status?: string;
        notes?: Record<string, string>;
      };
    };
  };
}

function planIdFromNotes(notes?: Record<string, string>): PlanId | null {
  if (!notes) return null;
  return notes.plan === 'max'
    ? 'max'
    : notes.plan === 'investor'
    ? 'investor'
    : notes.plan === 'pro'
    ? 'pro'
    : null;
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get('X-Razorpay-Signature');
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

  if (!secret) {
    console.error('[razorpay/webhook] RAZORPAY_WEBHOOK_SECRET not configured');
    return Response.json({ error: 'webhook not configured' }, { status: 500 });
  }

  if (!verifyWebhookSignature(rawBody, signature, secret)) {
    console.warn('[razorpay/webhook] signature verification failed');
    return Response.json({ error: 'invalid signature' }, { status: 401 });
  }

  let event: RazorpaySubscriptionEvent;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return Response.json({ error: 'invalid json' }, { status: 400 });
  }

  const sub = event.payload?.subscription?.entity;
  const notes = sub?.notes;
  const userId = notes?.clerkUserId;
  const planId = planIdFromNotes(notes);

  // Credit-pack purchases and ad-budget boosts (both one-time payments) also
  // route here; handle them before the subscription branches since they carry
  // a payment entity only.
  if (event.event === 'payment.captured' && !sub) {
    // userId comes from the payment entity's notes, not the subscription's.
    const paymentNotes = event.payload?.payment?.entity?.notes;
    const paymentUserId = paymentNotes?.clerkUserId;
    if (paymentNotes?.kind === 'ad_boost') {
      return handleAdBoostPurchase(event, paymentUserId);
    }
    if (paymentNotes?.kind === 'subscription_order') {
      return handleSubscriptionOrderPurchase(event, paymentUserId);
    }
    return handleCreditPurchase(event, paymentUserId);
  }

  if (!userId || !planId || !sub) {
    // Nothing actionable (e.g. an event for an object we did not create).
    return Response.json({ received: true, ignored: true });
  }

  const previous = await readEntitlements(userId);
  const prevState: Partial<EntitlementState> = previous
    ? parseEntitlements(previous)
    : {};

  switch (event.event) {
    case 'subscription.charged': {
      // Renew: reset the included counter, bank rollover (Max only), and
      // extend the period to Razorpay's current_end when available.
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
          rolloverBank: computeRollover(
            planId,
            prevState.pdfsUsed ?? 0,
            prevState.rolloverBank ?? 0
          ),
        },
        prevState
      );

      const chargedPayment = event.payload?.payment?.entity;
      if (chargedPayment?.id) {
        await claimPayment(chargedPayment.id, {
          payment_id: chargedPayment.id,
          user_id: userId,
          kind: 'subscription',
          amount_paisa: chargedPayment.amount || 0,
          razorpay_subscription_id: sub.id,
        }).catch((e) => console.warn('[webhook] subscription payment record error:', e));
      }
      break;
    }
    case 'payment.failed': {
      // Keep paid features live for the grace window; the client's
      // isWithinGrace flips to free after GRACE_DAYS.
      await syncEntitlements(
        userId,
        {
          status: 'past_due',
          periodEnd: prevState.periodEnd ?? oneMonthAhead(),
        },
        prevState
      );
      break;
    }
    case 'subscription.cancelled':
    case 'subscription.expired': {
      await syncEntitlements(
        userId,
        { plan: 'free', status: 'cancelled', pdfsUsed: 0, rolloverBank: 0 },
        prevState
      );
      break;
    }
    default:
      return Response.json({ received: true, unhandled: event.event });
  }

  return Response.json({ received: true });
}

/**
 * One-time credit-pack purchase: a captured payment whose notes carry a
 * credit count. Credits never expire and are spendable on any plan that
 * allows buying them (Pro / Max).
 *
 * This is the safety net for the client-side verify-payment call (which fires
 * first and credits instantly). The payment id is the idempotency key, so if
 * the client already credited, this no-ops.
 */
async function handleCreditPurchase(
  event: RazorpaySubscriptionEvent,
  userId: string | undefined
) {
  if (!userId) return Response.json({ received: true, ignored: true });
  const paymentNotes = event.payload?.payment?.entity?.notes;
  const credits = Number(paymentNotes?.credits);
  if (!Number.isFinite(credits) || credits <= 0) {
    return Response.json({ received: true, ignored: true });
  }
  const payment = event.payload?.payment?.entity;
  const paymentId = payment?.id;
  if (!paymentId) {
    return Response.json({ received: true, ignored: true });
  }
  const amountPaisa = payment.amount || 0;
  const orderId = (payment as Record<string, unknown>).order_id as string | undefined;
  const result = await addCreditsIdempotent(
    userId,
    paymentId,
    credits,
    amountPaisa,
    orderId
  );
  return Response.json({
    received: true,
    creditsAdded: result.added ? credits : 0,
  });
}

/**
 * One-time ad-budget boost: a captured payment whose notes mark it as an
 * ad boost. The amount credited is the payment's own captured amount, so the
 * broker ranking reflects real money even when the browser's verify-ad-boost
 * call never lands (closed tab, network drop). The payment id is the
 * idempotency key against the client path, so the two never double-count.
 */
async function handleAdBoostPurchase(
  event: RazorpaySubscriptionEvent,
  userId: string | undefined
) {
  if (!userId) return Response.json({ received: true, ignored: true });
  const payment = event.payload?.payment?.entity;
  const paymentId = payment?.id;
  if (!paymentId) return Response.json({ received: true, ignored: true });
  const amountInr = Math.round((payment.amount ?? 0) / 100);
  if (!Number.isFinite(amountInr) || amountInr <= 0) {
    return Response.json({ received: true, ignored: true });
  }
  const orderId = (payment as Record<string, unknown>).order_id as string | undefined;
  const result = await addAdBoostIdempotent(userId, paymentId, amountInr, orderId);

  // Mirror the client-path bust in verify-ad-boost: the ranking route is ISR
  // (1h), so a webhook-recorded boost must purge it or the buyer's rank stays
  // stale until the window expires.
  if (result.added) {
    const { revalidatePath } = await import('next/cache');
    revalidatePath('/api/brokers/ranking');
    revalidatePath('/brokers', 'page');
  }

  return Response.json({
    received: true,
    adBoostAdded: result.added ? amountInr : 0,
  });
}

/**
 * One-time subscription order purchase (standard checkout fallback/test mode).
 * Activates the plan idempotently if the client verification hasn't already done so.
 */
async function handleSubscriptionOrderPurchase(
  event: RazorpaySubscriptionEvent,
  userId: string | undefined
) {
  if (!userId) return Response.json({ received: true, ignored: true });
  const payment = event.payload?.payment?.entity;
  const paymentId = payment?.id;
  if (!paymentId) return Response.json({ received: true, ignored: true });
  const paymentNotes = payment.notes;
  const planId = (
    paymentNotes?.plan === 'max'
      ? 'max'
      : paymentNotes?.plan === 'investor'
      ? 'investor'
      : 'pro'
  ) as PlanId;
  const orderId = (payment as Record<string, unknown>).order_id as string | undefined;

  try {
    await claimPayment(paymentId, {
      payment_id: paymentId,
      user_id: userId,
      kind: 'subscription',
      amount_paisa: payment.amount || 0,
      razorpay_order_id: orderId,
    });
  } catch (err) {
    console.warn('[webhook] claimPayment error in handleSubscriptionOrderPurchase:', err);
  }

  const previous = await readEntitlements(userId);
  const prevState: Partial<EntitlementState> = previous
    ? parseEntitlements(previous)
    : {};

  await syncEntitlements(
    userId,
    {
      plan: planId,
      status: 'active',
      periodEnd: oneMonthAhead(),
      pdfsUsed: 0,
      rolloverBank: 0,
    },
    prevState
  );

  return Response.json({ received: true, subscriptionActivated: planId });
}

