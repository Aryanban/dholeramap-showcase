/**
 * GET /api/admin/payments
 *
 * Lists the most recent payment transactions claimed by the server,
 * helping the owner audit subscriptions, top-ups, and customer payments.
 */
import { NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/admin';
import { db } from '@/lib/db';

export const runtime = 'nodejs';

export async function GET(_req: NextRequest) {
  const authed = await requireAdmin();
  if (!authed.ok) return authed.response;

  try {
    const client = db();
    const { data, error } = await client
      .from('payments')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(60);

    if (error) {
      console.warn('[admin/payments] db read warning:', error);
      return Response.json({ ok: true, payments: [] });
    }

    return Response.json({ ok: true, payments: data || [] });
  } catch (err) {
    console.error('[admin/payments] error:', err);
    return Response.json({ ok: true, payments: [] });
  }
}
