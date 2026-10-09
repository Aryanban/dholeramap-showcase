/**
 * GET /api/admin/stats
 *
 * Real console figures from Clerk: total accounts and a plan/status breakdown.
 * The per-plan counts are computed from the users fetched (capped at 100 by
 * the roster route), so the totals are labelled as sampled when the instance
 * grows past that.
 */
import { clerkClient } from '@clerk/nextjs/server';
import { requireAdmin } from '@/lib/admin';
import { toAdminUser } from '@/lib/admin-serializer';

export const runtime = 'nodejs';

export async function GET() {
  const authed = await requireAdmin();
  if (!authed.ok) return authed.response;

  const client = await clerkClient();
  const [page, countRes] = await Promise.all([
    client.users.getUserList({ limit: 100 }),
    client.users.getCount().catch(() => 0),
  ]);
  const users = (page.data || []).map(toAdminUser);

  const byPlan: Record<string, number> = {};
  let creditsIssued = 0;
  let pdfsUsed = 0;
  let admins = 0;
  let banned = 0;
  let paying = 0;
  let trialing = 0;
  for (const u of users) {
    // byPlan tracks the *effective* plan only — a trialing account reads as Pro
    // everywhere in the app, so it is counted in byPlan.pro AND surfaced
    // separately below. Adding status keys to this same map (as the old code
    // did) mixed units into one lookup and made the plan bars meaningless.
    byPlan[u.plan] = (byPlan[u.plan] || 0) + 1;
    if (u.status === 'active' && (u.plan === 'pro' || u.plan === 'max')) paying += 1;
    if (u.status === 'trialing') trialing += 1;
    creditsIssued += u.credits;
    pdfsUsed += u.pdfsUsed;
    if (u.isAdmin) admins += 1;
    if (u.banned) banned += 1;
  }

  return Response.json({
    ok: true,
    totalUsers: countRes || page.totalCount || users.length,
    sampled: users.length,
    sampledTruncated: users.length === 100,
    byPlan,
    // Distinct counters so the console never presents a trialing account as
    // paying: "Paying" is an active subscription, "Trialing" is a free trial.
    paying,
    trialing,
    creditsIssued,
    pdfsUsed,
    admins,
    banned,
  });
}
