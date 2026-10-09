'use client';

import { useApp } from '@/lib/store';
import { deriveFlags, isAdminEmail, type EntitlementFlags } from '@/lib/entitlements';

/**
 * Resolves the current entitlement flags from the store's hydrated Clerk
 * metadata. Server-written, client-read: nothing here can be forged in
 * browser state (the server re-checks before any PDF is generated).
 *
 * An admin email additionally unlocks every Max capability client-side; the
 * PDF route verifies that independently server-side.
 */
export function useEntitlements(): EntitlementFlags {
  const state = useApp((s) => s.entitlements);
  const email = useApp((s) => s.user?.email);
  return deriveFlags(state, { isAdmin: isAdminEmail(email) });
}
