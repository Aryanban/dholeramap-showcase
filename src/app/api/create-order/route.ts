/**
 * POST /api/create-order
 *
 * Razorpay Standard Web Checkout - Order Creation Endpoint
 *
 * 1. Accepts: { amount (in paise), currency (default INR), receipt, notes }
 * 2. Validates amount >= 100 paise (₹1 minimum)
 * 3. Creates an order via Razorpay Orders API
 * 4. Returns: { order_id, amount, currency }
 */
import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { razorpayCreds, razorpayErrDetail } from '@/lib/razorpay-server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    let creds: { keyId: string; keySecret: string };
    try {
      creds = razorpayCreds();
    } catch {
      return NextResponse.json(
        { error: 'Razorpay credentials not configured' },
        { status: 401 }
      );
    }

    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON request body' },
        { status: 400 }
      );
    }

    const { amount, currency = 'INR', receipt, notes } = body;

    // Validate amount
    const parsedAmount = Number(amount);
    if (!Number.isFinite(parsedAmount) || parsedAmount < 100) {
      return NextResponse.json(
        { error: 'Amount must be at least 100 paise (₹1.00)' },
        { status: 400 }
      );
    }

    const rzp = new Razorpay({
      key_id: creds.keyId,
      key_secret: creds.keySecret,
    });

    const orderOptions = {
      amount: Math.round(parsedAmount),
      currency: currency || 'INR',
      receipt: receipt || `rcpt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      notes: notes || {},
    };

    const order = await rzp.orders.create(orderOptions);

    return NextResponse.json({
      order_id: order.id,
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt,
      status: order.status,
      key_id: creds.keyId,
    });
  } catch (err: any) {
    console.error('[create-order] Razorpay error:', err);
    return NextResponse.json(
      {
        error: razorpayErrDetail(err) || 'Failed to create Razorpay order',
      },
      { status: 500 }
    );
  }
}
