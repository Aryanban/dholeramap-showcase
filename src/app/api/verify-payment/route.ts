/**
 * POST /api/verify-payment
 *
 * Razorpay Standard Web Checkout - Signature Verification Endpoint
 *
 * Algorithm: HMAC-SHA256(order_id + "|" + payment_id, KEY_SECRET)
 * Compares generated digest with razorpay_signature using timing-safe comparison.
 */
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'node:crypto';

export const dynamic = 'force-dynamic';

function getCandidateSecrets(): string[] {
  // Secrets come exclusively from env — a key secret must never be committed.
  const secrets = new Set<string>();
  if (process.env.RAZORPAY_TEST_KEY_SECRET) secrets.add(process.env.RAZORPAY_TEST_KEY_SECRET);
  if (process.env.RAZORPAY_KEY_SECRET) secrets.add(process.env.RAZORPAY_KEY_SECRET);
  if (process.env.RAZORPAY_LIVE_KEY_SECRET) secrets.add(process.env.RAZORPAY_LIVE_KEY_SECRET);
  return Array.from(secrets).filter(Boolean);
}

export async function POST(req: NextRequest) {
  try {
    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON request body' },
        { status: 400 }
      );
    }

    const orderId = body.razorpay_order_id || body.order_id;
    const paymentId = body.razorpay_payment_id || body.payment_id;
    const signature = body.razorpay_signature || body.signature;

    if (!orderId || !paymentId || !signature) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required payment verification fields (order_id, payment_id, signature)',
        },
        { status: 400 }
      );
    }

    const secrets = getCandidateSecrets();
    if (secrets.length === 0) {
      console.error('[verify-payment] No RAZORPAY_KEY_SECRET is configured');
      return NextResponse.json(
        { error: 'Payment verification secret not configured' },
        { status: 500 }
      );
    }

    // Verify HMAC-SHA256 signature: order_id + "|" + payment_id
    let isMatch = false;
    for (const secret of secrets) {
      const generatedSignature = crypto
        .createHmac('sha256', secret)
        .update(`${orderId}|${paymentId}`)
        .digest('hex');

      try {
        const generatedBuf = Buffer.from(generatedSignature, 'utf8');
        const receivedBuf = Buffer.from(String(signature), 'utf8');
        if (generatedBuf.length === receivedBuf.length && crypto.timingSafeEqual(generatedBuf, receivedBuf)) {
          isMatch = true;
          break;
        }
      } catch {
        // try next secret
      }
    }

    if (!isMatch) {
      console.warn(`[verify-payment] Signature mismatch for order: ${orderId}, payment: ${paymentId}`);
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid payment signature. Verification failed.',
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Payment verified successfully',
      order_id: orderId,
      payment_id: paymentId,
    });
  } catch (err: any) {
    console.error('[verify-payment] Error:', err);
    return NextResponse.json(
      {
        success: false,
        error: err?.message || 'Internal error during payment verification',
      },
      { status: 500 }
    );
  }
}
