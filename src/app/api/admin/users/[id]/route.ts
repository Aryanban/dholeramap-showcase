/**
 * GET  /api/admin/users/:id   — one account with its entitlements.
 * PATCH /api/admin/users/:id  — grant a plan, adjust credits, reset the quota,
 *                              set the profile role, or ban/unban the account.
 *
 * Only admin emails may call this (requireAdmin). Granting a plan writes the
 * same Clerk metadata the payment webhook writes, so the client gating and the
 * PDF quota pick it up immediately.
 */
import { NextRequest } from 'next/server';
import { clerkClient } from '@clerk/nextjs/server';
import { requireAdmin } from '@/lib/admin';
import { toAdminUser } from '@/lib/admin-serializer';
import { readEntitlements, syncEntitlements } from '@/lib/razorpay-server';
import { oneMonthAhead, parseEntitlements } from '@/lib/entitlements';

export const runtime = 'nodejs';

type Params = { params: Promise<{ id: string }> };

const PLANS = ['free', 'trial', 'investor', 'pro', 'max'] as const;
const ROLES = ['investor', 'broker', 'developer', 'owner'] as const;

export async function GET(_req: NextRequest, { params }: Params) {
  const authed = await requireAdmin();
  if (!authed.ok) return authed.response;

  const { id } = await params;
  const client = await clerkClient();
  const user = await client.users.getUser(id);
  return Response.json({ ok: true, user: toAdminUser(user) });
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const authed = await requireAdmin();
  if (!authed.ok) return authed.response;

  const { id } = await params;
  let body: Record<string, unknown> = {};
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return Response.json({ ok: false, error: 'invalid body' }, { status: 400 });
  }

  const client = await clerkClient();

  // 1) Entitlement changes: merge into the current doc so nothing else resets.
  const planRaw = typeof body.plan === 'string' ? body.plan : null;
  const plan = planRaw && (PLANS as readonly string[]).includes(planRaw) ? (planRaw as (typeof PLANS)[number]) : null;
  const creditsDelta = Number(body.creditsDelta);
  const resetQuota = body.resetQuota === true;
  const extendDays = Number(body.extendDays);
  const periodEndRaw = typeof body.periodEnd === 'string' ? body.periodEnd : null;

  if (plan || Number.isFinite(creditsDelta) || resetQuota || Number.isFinite(extendDays) || periodEndRaw) {
    const previous = parseEntitlements(await readEntitlements(id));
    const next: Record<string, unknown> = {};
    if (plan) {
      next.plan = plan;
      next.status = plan === 'free' ? 'none' : 'active';
      if (plan !== 'free') {
        const isExpired = !previous.periodEnd || new Date(previous.periodEnd).getTime() <= Date.now();
        if (isExpired) {
          next.periodEnd = oneMonthAhead();
        }
      } else {
        next.periodEnd = null;
      }
    }
    if (Number.isFinite(extendDays) && extendDays !== 0) {
      const baseMs =
        previous.periodEnd && new Date(previous.periodEnd).getTime() > Date.now()
          ? new Date(previous.periodEnd).getTime()
          : Date.now();
      next.periodEnd = new Date(baseMs + extendDays * 86_400_000).toISOString();
      next.status = 'active';
    } else if (periodEndRaw) {
      next.periodEnd = new Date(periodEndRaw).toISOString();
      next.status = 'active';
    }
    if (Number.isFinite(creditsDelta)) {
      next.credits = Math.max(0, previous.credits + Math.trunc(creditsDelta));
    }
    if (resetQuota) next.pdfsUsed = 0;
    await syncEntitlements(id, next, previous);
  }

  // 2) Profile role (cosmetic categorization only — never grants entitlements).
  const roleRaw = typeof body.role === 'string' ? body.role : null;
  if (roleRaw && (ROLES as readonly string[]).includes(roleRaw)) {
    await client.users.updateUserMetadata(id, { publicMetadata: { role: roleRaw } });
  }

  // 3) Ban / unban the account (Clerk blocks sign-in for banned users).
  if (typeof body.banned === 'boolean') {
    if (body.banned) await client.users.banUser(id);
    else await client.users.unbanUser(id);
  }

  const user = await client.users.getUser(id);
  return Response.json({ ok: true, user: toAdminUser(user) });
}
