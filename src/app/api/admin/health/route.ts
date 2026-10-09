/**
 * GET /api/admin/health
 *
 * System health and diagnostic checks for the admin console:
 * - Razorpay credentials & webhook secret status
 * - Supabase database connectivity & latency ping
 * - Entitlements storage mode
 * - Server environment & region
 */
import { NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/admin';
import { RAZORPAY_MODE } from '@/lib/entitlements';
import { db } from '@/lib/db';

export const runtime = 'nodejs';

export async function GET(_req: NextRequest) {
  const authed = await requireAdmin();
  if (!authed.ok) return authed.response;

  const prefix = RAZORPAY_MODE === 'test' ? 'RAZORPAY_TEST' : 'RAZORPAY_LIVE';
  const keyId = process.env[`${prefix}_KEY_ID`] || process.env.RAZORPAY_KEY_ID || '';
  const hasKeySecret = Boolean(
    process.env[`${prefix}_KEY_SECRET`] || process.env.RAZORPAY_KEY_SECRET
  );
  const hasWebhookSecret = Boolean(process.env.RAZORPAY_WEBHOOK_SECRET);
  const entitlementsSource = process.env.ENTITLEMENTS_SOURCE || 'clerk';

  let dbOk = false;
  let dbLatencyMs = 0;
  let dbError: string | null = null;

  try {
    const start = Date.now();
    const client = db();
    const { error } = await client.from('entitlements').select('user_id').limit(1);
    dbLatencyMs = Date.now() - start;
    if (error) {
      dbError = error.message;
    } else {
      dbOk = true;
    }
  } catch (err) {
    dbError = err instanceof Error ? err.message : 'Database connection error';
  }

  return Response.json({
    ok: true,
    timestamp: Date.now(),
    gateway: {
      mode: RAZORPAY_MODE,
      keyIdPrefix: keyId ? keyId.slice(0, 8) + '…' : 'MISSING',
      hasKeySecret,
      hasWebhookSecret,
    },
    database: {
      mode: entitlementsSource,
      connected: dbOk,
      latencyMs: dbLatencyMs,
      error: dbError,
    },
    server: {
      region: process.env.VERCEL_REGION || 'bom1 (Mumbai)',
      nodeEnv: process.env.NODE_ENV || 'production',
    },
  });
}
