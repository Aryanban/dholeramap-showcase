/**
 * Short-lived memo for Clerk Backend `users.getUser`.
 *
 * A single dossier export looks the same user up repeatedly — the admin check
 * reads `emailAddresses`, the entitlement fallback reads `privateMetadata` —
 * and every call is a network round trip to the identical record. Memoizing it
 * for a few seconds collapses those into one fetch without risking a stale
 * decision after a write: `syncEntitlements` drops the entry whenever it
 * writes metadata back, so a subsequent read always sees fresh data.
 */
import { clerkClient } from '@clerk/nextjs/server';

const TTL_MS = 5_000;

type ClerkUser = Awaited<ReturnType<Awaited<ReturnType<typeof clerkClient>>['users']['getUser']>>;

interface Entry {
  user: ClerkUser;
  expires: number;
}

const cache = new Map<string, Entry>();

/** Read the user through the memo. Callers must never mutate the result. */
export async function getCachedUser(userId: string): Promise<ClerkUser> {
  const now = Date.now();
  const hit = cache.get(userId);
  if (hit && hit.expires > now) return hit.user;

  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  cache.set(userId, { user, expires: now + TTL_MS });
  return user;
}

/** Drop a cached user so the next read reflects a metadata write. */
export function invalidateUser(userId: string): void {
  cache.delete(userId);
}
