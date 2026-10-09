/**
 * POST /api/razorpay/credits
 *
 * Creates a one-time Razorpay order for a credit pack. Pro and Max only —
 * free users must upgrade first. The pack size is validated against the
 * server-side price table, so the client cannot name its own price.
 *
 * Body: { credits: number }
 */
import { NextRequest } from 'next/server';
import { CREDIT_PACK_SIZES, PLANS, deriveFlags, parseEntitlements } from '@/lib/entitlements';
import {
  razorpayClient,
  razorpayCreds,
  razorpayErrDetail,
  readEntitlements,
  requireUserId,
} from '@/lib/razorpay-server';

export const runtime = 'nodejs';

/** Allowed pack sizes — mirrored from entitlements so the two routes agree. */
const PACK_SIZES = CREDIT_PACK_SIZES;

export async function POST(req: NextRequest) {
  const authed = await requireUserId();
  if (!authed.ok) return authed.response;
  const userId = authed.userId;

  let body: { credits?: number };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: 'invalid body' }, { status: 400 });
  }

  const credits = Math.floor(Number(body.credits) || 0);
  if (!PACK_SIZES.includes(credits)) {
    return Response.json(
      { error: `credits must be one of ${PACK_SIZES.join(', ')}` },
      { status: 400 }
    );
  }

  // Enforce "credits are Pro/Max only" server-side, not just in the UI.
  const state = parseEntitlements(await readEntitlements(userId));
  const flags = deriveFlags(state);
  if (!flags.canBuyCredits) {
    return Response.json(
      { ok: false, reason: flags.isFree ? 'upgrade_required' : 'not_eligible' },
      { status: 402 }
    );
  }

  const amountPaisa = credits * flags.creditPriceInr * 100;
  const rzp = razorpayClient();

  let order;
  try {
    order = await rzp.orders.create({
      amount: amountPaisa,
      currency: 'INR',
      receipt: `credits-${userId.slice(0, 20)}-${credits}`,
      // The unit price is stamped here so verification can later prove the
      // granted credits match what was actually charged, without trusting the
      // browser.
      notes: {
        clerkUserId: userId,
        credits: String(credits),
        unitPriceInr: String(flags.creditPriceInr),
        kind: 'credit_pack',
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
    // Name matches what the client destructures (razorpay.ts reads amountPaisa).
    amountPaisa,
    credits,
    unitPriceInr: flags.creditPriceInr,
    keyId: razorpayCreds().keyId,
  });
}
