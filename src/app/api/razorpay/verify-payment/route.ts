/**
 * POST /api/razorpay/verify-payment
 *
 * Verifies the signature Razorpay's checkout returns to the browser, for the
 * one-time credit-pack flow. The client cannot forge this without the key
 * secret, so a valid signature is proof of payment.
 *
 * The pack size is read back from the order's notes (written server-side when
 * the order was created against the validated price table) and the order must
 * belong to this user, so the client can neither rename its purchase nor spend
 * another account's payment.
 *
 * Body: { razorpay_order_id, razorpay_payment_id, razorpay_signature }
 *
 * Note: the subscription flow does NOT use this route — recurring charges are
 * authorised by the webhook alone (subscription.charged). This endpoint exists
 * because credit packs are captured instantly and the UX should not wait for
 * the webhook round trip.
 */
import { NextRequest } from 'next/server';
import { CREDIT_PACK_SIZES } from '@/lib/entitlements';
import {
  addCreditsIdempotent,
  fetchOrder,
  readEntitlements,
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

  const { razorpay_order_id: orderId, razorpay_payment_id: paymentId, razorpay_signature: signature } = body;

  if (!orderId || !paymentId || !signature) {
    return Response.json({ error: 'missing payment fields' }, { status: 400 });
  }

  let secret: string;
  try {
    secret = razorpayKeySecret();
  } catch (err) {
    console.error('[razorpay/verify-payment] secret not configured:', err);
    return Response.json({ error: 'payment verification not configured' }, { status: 500 });
  }

  let valid = false;
  try {
    valid = verifyPaymentSignature(orderId, paymentId, signature, secret);
  } catch {
    // A malformed signature (wrong length / non-hex) throws; treat as invalid.
    valid = false;
  }

  if (!valid) {
    return Response.json({ error: 'Invalid payment signature' }, { status: 400 });
  }

  // The signature proves a payment happened; only the order proves what was
  // bought and for whom.
  let order;
  try {
    order = await fetchOrder(orderId);
  } catch (err) {
    console.error('[razorpay/verify-payment] order fetch failed:', err);
    return Response.json({ error: 'could not confirm the credit pack' }, { status: 502 });
  }

  if (order.notes?.clerkUserId !== userId) {
    return Response.json({ error: 'payment does not belong to this account' }, { status: 403 });
  }
  if (order.notes?.kind !== 'credit_pack') {
    return Response.json({ error: 'payment is not a credit pack' }, { status: 400 });
  }
  if (order.amount_due !== 0 || order.amount_paid <= 0) {
    return Response.json({ error: 'payment was not fully captured' }, { status: 402 });
  }

  // Pack size was validated when the order was created; read it back rather
  // than trusting the client.
  const credits = Math.floor(Number(order.notes?.credits) || 0);
  if (!CREDIT_PACK_SIZES.includes(credits)) {
    return Response.json({ error: 'credit pack size is not offered' }, { status: 400 });
  }
  // Prove the granted quantity matches what was charged: the order notes carry
  // the unit price stamped at creation, so a replay that swaps in a bigger
  // pack cannot also match the money.
  const unitPriceInr = Number(order.notes?.unitPriceInr) || 0;
  if (
    !Number.isFinite(unitPriceInr) ||
    unitPriceInr <= 0 ||
    unitPriceInr * credits * 100 !== order.amount_paid
  ) {
    return Response.json(
      { error: 'payment amount does not match the credit pack' },
      { status: 400 }
    );
  }

  // Signature is proof of payment: credit the account. The payment id is the
  // idempotency key, so the webhook arriving later does not double-count.
  const result = await addCreditsIdempotent(
    userId,
    paymentId,
    credits,
    order.amount_paid,
    orderId
  );

  return Response.json({ success: true, credits: result.total });
}

