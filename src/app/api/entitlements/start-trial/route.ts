/**
 * POST /api/entitlements/start-trial
 * GET  /api/entitlements/start-trial
 *
 * Starts the 7-day Free Trial for the signed-in user. Idempotent: if a trial
 * already exists (active or expired) it is returned untouched, so the client
 * can call this on every sign-in without re-entitling anyone.
 * The trial grants ALL features (DGDCR, CRM, dossiers, white-label) with a
 * strict 2-credit PDF generation limit. No credit card is taken.
 */
import { NextRequest } from 'next/server';
import { TRIAL_DAYS, parseEntitlements, type EntitlementState } from '@/lib/entitlements';
import { readEntitlements, requireUserId, syncEntitlements } from '@/lib/razorpay-server';

export const runtime = 'nodejs';

export async function POST(_req: NextRequest) {
  const authed = await requireUserId();
  if (!authed.ok) return authed.response;
  const userId = authed.userId;

  const stored = await readEntitlements(userId);
  const state = parseEntitlements(stored);

  // Already trialed or already paying — never re-grant.
  if (state.trialStartedAt) {
    return Response.json({
      ok: true,
      trialStartedAt: state.trialStartedAt,
      already: true,
      entitlements: state,
    });
  }
  if (state.status === 'active' && state.plan !== 'free') {
    return Response.json({
      ok: true,
      alreadySubscribed: true,
      entitlements: state,
    });
  }

  const startedAt = new Date().toISOString();
  const periodEnd = new Date(Date.now() + TRIAL_DAYS * 86_400_000).toISOString();
  const nextDoc: EntitlementState = {
    plan: 'trial',
    status: 'trialing',
    trialStartedAt: startedAt,
    periodEnd,
    pdfsUsed: 0,
    rolloverBank: 0,
    credits: 0,
    lastCreditPaymentId: null,
  };

  await syncEntitlements(
    userId,
    nextDoc,
    state
  );

  return Response.json({
    ok: true,
    trialStartedAt: startedAt,
    days: TRIAL_DAYS,
    entitlements: nextDoc,
  });
}

export async function GET(req: NextRequest) {
  return POST(req);
}

