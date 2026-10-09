/**
 * POST /api/razorpay/verify-ad-boost
 *
 * Verifies the Razorpay checkout signature for an ad-budget boost, then
 * records the payment against the signed-in user so the directory ranking is
 * authoritative and tamper-proof.
 *
 * The amount credited is what Razorpay reports as *paid* for the order — never
 * a client-supplied figure, since a checkout signature covers only
 * `<order_id>|<payment_id>` and says nothing about money. The order's notes
 * must also name this user and an ad-boost kind, so a signature from one
 * account cannot be replayed to rank another.
 *
 * Body: { razorpay_order_id, razorpay_payment_id, razorpay_signature }
 */
import { NextRequest } from 'next/server';
import { revalidatePath } from 'next/cache';
import { AD_BOOST_MAX_INR, AD_BOOST_MIN_INR } from '@/lib/entitlements';
import {
  addAdBoostIdempotent,
  fetchOrder,
  requireUserId,
  razorpayKeySecret,
  verifyPaymentSignature,
} from '@/lib/razorpay-server';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const authed = await requireUserId();
  if (!authed.ok) return authed.response;
  const userId = authed.userId;

  let body: {
    razorpay_order_id?: string;
    razorpay_payment_id?: string;
    razorpay_signature?: string;
  };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: 'invalid body' }, { status: 400 });
  }

  const {
    razorpay_order_id: orderId,
    razorpay_payment_id: paymentId,
    razorpay_signature: signature,
  } = body;

  if (!orderId || !paymentId || !signature) {
    return Response.json({ error: 'missing payment fields' }, { status: 400 });
  }

  // Verify signature
  let secret: string;
  try {
    secret = razorpayKeySecret();
  } catch (err) {
    console.error('[razorpay/verify-ad-boost] secret not configured:', err);
    return Response.json(
      { error: 'payment verification not configured' },
      { status: 500 }
    );
  }

  let valid = false;
  try {
    valid = verifyPaymentSignature(orderId, paymentId, signature, secret);
  } catch {
    valid = false;
  }

  if (!valid) {
    return Response.json({ error: 'Invalid payment signature' }, { status: 400 });
  }

  // The signature proves a payment happened; only the order proves how much and
  // for whom. Fetch it rather than trusting the request body.
  let order;
  try {
    order = await fetchOrder(orderId);
  } catch (err) {
    console.error('[razorpay/verify-ad-boost] order fetch failed:', err);
    return Response.json(
      { error: 'could not confirm the paid amount' },
      { status: 502 }
    );
  }

  if (order.notes?.clerkUserId !== userId) {
    return Response.json(
      { error: 'payment does not belong to this account' },
      { status: 403 }
    );
  }
  if (order.notes?.kind !== 'ad_boost') {
    return Response.json(
      { error: 'payment is not an ad-budget boost' },
      { status: 400 }
    );
  }
  // amount_due === 0 means the order was fully captured (no partial settle).
  if (order.amount_due !== 0 || order.amount_paid <= 0) {
    return Response.json(
      { error: 'payment was not fully captured' },
      { status: 402 }
    );
  }

  const amountInr = Math.round(order.amount_paid / 100);

  // Re-check the guardrails against the authoritative amount. The order was
  // created inside these bounds, so a legitimate payment always passes and a
  // replayed or partial capture does not.
  if (amountInr < AD_BOOST_MIN_INR || amountInr > AD_BOOST_MAX_INR) {
    return Response.json(
      { error: `boost amount must be between ₹${AD_BOOST_MIN_INR} and ₹${AD_BOOST_MAX_INR.toLocaleString('en-IN')}` },
      { status: 400 }
    );
  }

  // Payment is cryptographically verified and the amount is authoritative —
  // record it against the user. Idempotent on the payment id.
  const result = await addAdBoostIdempotent(userId, paymentId, amountInr, orderId);

  // The ranking route is ISR with a 1h window so it doesn't run 3 Supabase
  // queries per page mount. Spend just changed, so bust it now rather than
  // making the buyer wait up to an hour to see their rank move. This is the
  // only mutation path that affects public ranking order.
  if (result.added) {
    revalidatePath('/api/brokers/ranking');
    revalidatePath('/brokers', 'page');
  }

  return Response.json({
    success: true,
    totalAdSpend: result.total,
    boostApplied: result.boostApplied,
    alreadyRecorded: !result.added,
  });
}
