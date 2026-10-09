/**
 * POST /api/razorpay/ad-boost
 *
 * Creates a one-time Razorpay order for a broker ad-budget boost.
 * The amount (in INR) is validated server-side so the client cannot
 * name an arbitrary price. After checkout the client sends the
 * signature to /api/razorpay/verify-ad-boost for cryptographic
 * confirmation before we credit the ad spend.
 *
 * Body: { amount: number }  — amount in INR (min ₹500)
 */
import { NextRequest } from 'next/server';
import { AD_BOOST_MAX_INR, AD_BOOST_MIN_INR } from '@/lib/entitlements';
import {
  razorpayClient,
  razorpayCreds,
  razorpayErrDetail,
  requireUserId,
} from '@/lib/razorpay-server';

export const runtime = 'nodejs';

const MIN_BOOST_INR = AD_BOOST_MIN_INR;
const MAX_BOOST_INR = AD_BOOST_MAX_INR;

export async function POST(req: NextRequest) {
  const authed = await requireUserId();
  if (!authed.ok) return authed.response;
  const userId = authed.userId;

  let body: { amount?: number };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: 'invalid body' }, { status: 400 });
  }

  const amount = Math.floor(Number(body.amount) || 0);
  if (amount < MIN_BOOST_INR) {
    return Response.json(
      { error: `Minimum boost amount is ₹${MIN_BOOST_INR}` },
      { status: 400 }
    );
  }
  if (amount > MAX_BOOST_INR) {
    return Response.json(
      { error: `Maximum boost amount is ₹${MAX_BOOST_INR.toLocaleString('en-IN')}` },
      { status: 400 }
    );
  }

  const amountPaisa = amount * 100;
  const rzp = razorpayClient();

  let order;
  try {
    order = await rzp.orders.create({
      amount: amountPaisa,
      currency: 'INR',
      receipt: `adboost-${userId.slice(0, 16)}-${amount}`,
      notes: {
        clerkUserId: userId,
        amountInr: String(amount),
        kind: 'ad_boost',
      },
    });
  } catch (err) {
    return Response.json(
      { error: 'order creation failed', detail: razorpayErrDetail(err) },
      { status: 502 }
    );
  }

  return Response.json({
    orderId: order.id,
    amountPaisa,
    amountInr: amount,
    keyId: razorpayCreds().keyId,
  });
}
