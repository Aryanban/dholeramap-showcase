/**
 * Server-only admin authorization.
 *
 * Admin membership is defined by the account's *verified email addresses*
 * (lib/entitlements.ts ADMIN_EMAILS + the ADMIN_EMAILS env var) — never by the
 * self-settable profile role, which any user could change in Settings. Every
 * privileged route and the /admin layout re-verify through here, so a spoofed
 * client role grants nothing.
 */
import { auth } from '@clerk/nextjs/server';
import { isAdminEmail } from './entitlements';
import { getCachedUser } from './clerk-user-cache';

/**
 * Every *verified* email on the account (lower-cased). Only delivery-verified
 * addresses are trustworthy as an admin identity: an unverified address can be
 * added to any account by anyone, so counting it would let a non-admin claim
 * the console by attaching an admin address they cannot receive mail at.
 */
export async function userEmails(userId: string): Promise<string[]> {
  const u = await getCachedUser(userId);
  return (u.emailAddresses || [])
    .filter((e) => e.verification?.status === 'verified')
    .map((e) => (e.emailAddress || '').trim().toLowerCase())
    .filter(Boolean);
}

export async function isAdminUser(userId: string): Promise<boolean> {
  try {
    const emails = await userEmails(userId);
    return emails.some((e) => isAdminEmail(e));
  } catch {
    // If Clerk is unreachable, fail closed — never grant admin on an error.
    return false;
  }
}

/**
 * Gate for privileged API routes: a Clerk session whose account carries an
 * admin email. Anything else is 401/403.
 */
export async function requireAdmin(): Promise<
  { ok: true; userId: string } | { ok: false; response: Response }
> {
  const { userId } = await auth();
  if (!userId) {
    return {
      ok: false,
      response: Response.json({ error: 'unauthorized' }, { status: 401 }),
    };
  }
  if (!(await isAdminUser(userId))) {
    return {
      ok: false,
      response: Response.json({ error: 'forbidden' }, { status: 403 }),
    };
  }
  return { ok: true, userId };
}
