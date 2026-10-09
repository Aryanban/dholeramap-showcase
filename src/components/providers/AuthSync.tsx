'use client';

import { useEffect, useRef } from 'react';
import { useUser } from '@clerk/nextjs';
import { useApp } from '@/lib/store';

/**
 * Global authentication and entitlement synchronizer.
 * Mounts inside <ClerkProvider> across the entire application.
 *
 * Responsibilities:
 * 1. Synchronizes authenticated user profile into the Zustand store on sign-in.
 * 2. Hydrates entitlements from Clerk metadata into client gating state.
 * 3. Automatically starts the 7-day Free Trial (with 2 PDF credits and all features)
 *    the exact moment a user registers or logs in if not already trialed.
 * 4. Cleans up store state on sign-out.
 */
export default function AuthSync() {
  const { isLoaded, isSignedIn, user } = useUser();
  const setUser = useApp((s) => s.setUser);
  const hydrateEntitlements = useApp((s) => s.hydrateEntitlements);
  const clearEntitlements = useApp((s) => s.clearEntitlements);
  const startingTrialRef = useRef(false);

  useEffect(() => {
    if (!isLoaded) return;

    if (isSignedIn && user) {
      const verifiedPrimary =
        user.primaryEmailAddress?.verification?.status === 'verified'
          ? user.primaryEmailAddress.emailAddress
          : user.emailAddresses?.find((e) => e.verification?.status === 'verified')?.emailAddress || '';

      setUser({
        id: user.id,
        name: user.fullName || user.firstName || 'Dholera Investor',
        email: verifiedPrimary,
        phone: user.primaryPhoneNumber?.phoneNumber || '',
        role: (user.publicMetadata?.role as any) || 'investor',
        createdAt: user.createdAt ? new Date(user.createdAt).getTime() : Date.now(),
      });

      // Hydrate currently stored entitlements
      hydrateEntitlements(user.publicMetadata);

      // Check if user has already trialed or is an active subscriber
      const meta = (user.publicMetadata || {}) as Record<string, unknown>;
      const hasTrial = Boolean(meta.trialStartedAt);
      const isPaid = meta.status === 'active' && meta.plan && meta.plan !== 'free';

      if (!hasTrial && !isPaid && !startingTrialRef.current) {
        startingTrialRef.current = true;
        fetch('/api/entitlements/start-trial', { method: 'POST' })
          .then((res) => res.json())
          .then((data) => {
            if (data?.ok && data.entitlements) {
              hydrateEntitlements(data.entitlements);
              user.reload?.().catch(() => {});
            }
          })
          .catch((err) => {
            console.error('[AuthSync] Auto-starting free trial failed:', err);
          })
          .finally(() => {
            startingTrialRef.current = false;
          });
      }
    } else {
      setUser(null);
      clearEntitlements();
    }
  }, [isLoaded, isSignedIn, user, setUser, hydrateEntitlements, clearEntitlements]);

  return null;
}
