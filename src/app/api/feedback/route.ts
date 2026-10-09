/**
 * /api/feedback
 *
 * User feedback & bug report submission and management.
 * - POST: Public submission (optionally associates Clerk userId if signed in).
 * - GET: Admin-only retrieval of all feedback submissions.
 * - PATCH: Admin-only status updates ('new' | 'investigating' | 'resolved' | 'dismissed').
 */
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { requireAdmin } from '@/lib/admin';
import {
  insertFeedback,
  readAllFeedback,
  updateFeedbackStatus,
  FeedbackRow,
} from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const body = await req.json();

    if (!body.message || typeof body.message !== 'string') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const item: FeedbackRow = {
      id: body.id || `fb-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      user_id: session.userId || body.userId || null,
      email: body.email || body.contact || null,
      name: body.name || null,
      message: body.message,
      category: body.category || 'general',
      rating: Number(body.rating) || 5,
      status: 'new',
    };

    await insertFeedback(item);
    return NextResponse.json({ success: true, id: item.id });
  } catch (err) {
    console.error('[feedback] POST error:', err);
    return NextResponse.json({ error: 'Failed to record feedback' }, { status: 500 });
  }
}

export async function GET() {
  const authed = await requireAdmin();
  if (!authed.ok) return authed.response;

  try {
    const items = await readAllFeedback();
    return NextResponse.json({ feedback: items, total: items.length });
  } catch (err) {
    console.error('[feedback] GET error:', err);
    return NextResponse.json({ error: 'Failed to fetch feedback' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const authed = await requireAdmin();
  if (!authed.ok) return authed.response;

  try {
    const body = await req.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json({ error: 'Missing id or status' }, { status: 400 });
    }

    const ok = await updateFeedbackStatus(id, status);
    return NextResponse.json({ success: ok });
  } catch (err) {
    console.error('[feedback] PATCH error:', err);
    return NextResponse.json({ error: 'Failed to update feedback status' }, { status: 500 });
  }
}
