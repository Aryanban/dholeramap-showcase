/**
 * POST /api/entitlements/consume-pdf
 *
 * Server-authoritative quota check + decrement. The client asks for
 * permission to generate one dossier PDF; this route decides against Clerk
 * metadata and decrements in place. Without a server-side counter the
 * included limits would be cosmetic (editable in browser state).
 *
 * Spend order: included quota first, then rollover, then purchased credits.
 * Returns the remaining balance so the UI can update without a refetch.
 */
import { NextRequest } from 'next/server';
import {
  PLANS,
  TRIAL_PDF_CAP,
  deriveFlags,
  isTrialActive,
  parseEntitlements,
} from '@/lib/entitlements';
import {
  readEntitlements,
  requireUserId,
  syncEntitlements,
} from '@/lib/razorpay-server';
import { isAdminUser } from '@/lib/admin';

export const runtime = 'nodejs';

export async function GET() {
  const authed = await requireUserId();
  if (!authed.ok) return authed.response;
  const userId = authed.userId;

  // The admin check (Clerk) and the entitlement read (Supabase) are
  // independent — running them concurrently turns two serial round trips into
  // one, which is what makes the "Checking quota…" step feel instant.
  const [isAdmin, stored] = await Promise.all([
    isAdminUser(userId),
    readEntitlements(userId),
  ]);

  if (isAdmin) {
    return Response.json({
      ok: true,
      admin: true,
      pdfsAvailable: 999_999,
      includedRemaining: 999_999,
      rolloverBank: 0,
      credits: 0,
    });
  }

  const state = parseEntitlements(stored);
  const flags = deriveFlags(state);

  if (!flags.canExportPdf || flags.pdfsAvailable < 1) {
    return Response.json(
      {
        ok: false,
        reason: flags.isFree ? 'upgrade_required' : 'quota_exhausted',
        pdfsAvailable: 0,
        includedRemaining: flags.includedRemaining,
        rolloverBank: state.rolloverBank,
        credits: state.credits,
      },
      { status: 402 }
    );
  }

  return Response.json({
    ok: true,
    pdfsAvailable: flags.pdfsAvailable,
    includedRemaining: flags.includedRemaining,
    rolloverBank: state.rolloverBank,
    credits: state.credits,
  });
}

export async function POST(req: NextRequest) {
  const authed = await requireUserId();
  if (!authed.ok) return authed.response;
  const userId = authed.userId;

  // Optional: allow callers to pass an explicit count or checkOnly flag
  let count = 1;
  let checkOnly = false;
  try {
    const body = await req.json();
    if (body?.checkOnly) checkOnly = true;
    if (Number.isFinite(Number(body?.count)) && Number(body.count) > 0) {
      count = Math.min(50, Math.floor(Number(body.count)));
    }
  } catch {
    // empty body is fine
  }

  if (checkOnly) {
    return GET();
  }

  // Owner/admin accounts are unlimited: nothing is counted or decremented.
  // Membership is verified server-side from the account's verified emails.
  if (await isAdminUser(userId)) {
    return Response.json({
      ok: true,
      consumed: 0,
      admin: true,
      pdfsAvailable: 999_999,
      includedRemaining: 999_999,
      rolloverBank: 0,
      credits: 0,
    });
  }

  const stored = await readEntitlements(userId);
  const state = parseEntitlements(stored);
  const flags = deriveFlags(state);

  if (!flags.canExportPdf) {
    return Response.json(
      {
        ok: false,
        reason: flags.isFree ? 'upgrade_required' : 'quota_exhausted',
        pdfsAvailable: 0,
      },
      { status: 402 }
    );
  }

  if (flags.pdfsAvailable < count) {
    return Response.json(
      {
        ok: false,
        reason: 'quota_exhausted',
        pdfsAvailable: flags.pdfsAvailable,
      },
      { status: 402 }
    );
  }

  // Spend included first, then rollover, then credits.
  const plan = PLANS[flags.plan];
  const trialing = isTrialActive(state);
  const includedCap = trialing ? TRIAL_PDF_CAP : plan.pdfsPerCycle;
  const includedRemaining = Math.max(0, includedCap - state.pdfsUsed);
  const rolloverAvailable = plan.rollover ? state.rolloverBank : 0;

  let remaining = count;
  const usedNow = Math.min(includedRemaining, remaining);
  remaining -= usedNow;

  let rolloverNow = 0;
  if (remaining > 0 && rolloverAvailable > 0) {
    rolloverNow = Math.min(rolloverAvailable, remaining);
    remaining -= rolloverNow;
  }

  const creditsNow = remaining;

  await syncEntitlements(
    userId,
    {
      pdfsUsed: state.pdfsUsed + usedNow,
      rolloverBank: state.rolloverBank - rolloverNow,
      credits: state.credits - creditsNow,
    },
    state
  );

  const updated = parseEntitlements(await readEntitlements(userId));
  const after = deriveFlags(updated);

  return Response.json({
    ok: true,
    consumed: count,
    pdfsAvailable: after.pdfsAvailable,
    includedRemaining: after.includedRemaining,
    rolloverBank: updated.rolloverBank,
    credits: updated.credits,
  });
}
