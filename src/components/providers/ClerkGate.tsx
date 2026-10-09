'use client';

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { ClerkProvider } from '@clerk/nextjs';
import { usePathname } from 'next/navigation';
import AuthSync from './AuthSync';

/**
 * Defers Clerk entirely for anonymous visitors on public pages.
 *
 * WHY THIS EXISTS
 * Mounting <ClerkProvider /> unconditionally made every public page — most
 * importantly the SEO-critical homepage — download ~132 KB from
 * clerk.dholeramap.com (clerk.browser.js + ui.browser.js) and then execute it,
 * even though a logged-out reader never touches a single Clerk component.
 * Lighthouse attributed ~296 KiB of "reduce unused JavaScript" to that work, and
 * on a throttled Moto G Power it was the single largest contributor to the
 * blocking-time and LCP figures.
 *
 * The provider stays mounted — with the exact same props — the moment ANY of
 * these is true, so every code path that actually reads auth state is
 * unchanged:
 *
 *   1. The visitor already holds a Clerk session cookie. Signed-in users get
 *      their avatar, entitlements and bookmark sync on first paint exactly as
 *      before; only logged-out visitors pay the deferral.
 *   2. The route renders Clerk UI or requires a session (/dashboard, /brokers,
 *      the /sign-in family, ...). These pages are authenticated or
 *      auth-dependent by definition, so there is nothing to save by waiting.
 *   3. The visitor expresses intent — hovering or focusing the header account
 *      control dispatches REQUEST_CLERK. This warms Clerk just ahead of the
 *      click, so the interactive header feels instant.
 *
 * Because the provider is a client boundary in both cases, this is a pure
 * client-side mount: no server rendering or auth behaviour is altered.
 */

/**
 * Routes that mount Clerk immediately.
 *
 * Two groups qualify:
 *  - Auth-gated or auth-UI routes (/dashboard, /sign-in, ...). Clerk is the
 *    point of the page, so deferring it would only add a loading flash.
 *  - Routes whose UI reads entitlement/user state on first paint — /map renders
 *    Paywall and QuotaGuard around the parcel panel, and /brokers reads
 *    useUser() for the signed-in broker's own listing. Both need the provider
 *    present before their first render, not after user intent.
 *
 * Everything else (the whole SEO surface: /, /dholera-*, /blog, /village,
 * /survey, /guide, /pricing, ...) is public and stays Clerk-free until the
 * visitor asks to authenticate.
 */
const CLERK_ROUTES = [
  '/dashboard',
  '/settings',
  '/billing',
  '/checkout',
  '/admin',
  '/brokers',
  '/map',
  '/sign-in',
  '/sign-up',
];

/** Dispatched by the header to warm Clerk on user intent. */
const REQUEST_CLERK = 'dholera:request-clerk';

export function requestClerk() {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new Event(REQUEST_CLERK));
}

/**
 * True once <ClerkProvider /> is mounted. Components that call Clerk hooks
 * (useUser, Show, UserButton, SignInButton) MUST be gated on this: those hooks
 * throw when no provider is present in the tree.
 */
const ClerkReadyContext = createContext(false);

export function useClerkReady(): boolean {
  return useContext(ClerkReadyContext);
}

function matchesClerkRoute(pathname: string | null): boolean {
  if (!pathname) return false;
  return CLERK_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
}

/**
 * Clerk's session cookies. __session is httpOnly but is still sent to the
 * browser and readable via document.cookie in Clerk's current cookie format;
 * __client_uat is the long-standing signed-in marker. Checking both keeps this
 * working across Clerk's cookie-rotation changes.
 */
function hasSessionCookie(): boolean {
  if (typeof document === 'undefined') return false;
  return (
    document.cookie.includes('__session') ||
    document.cookie.includes('__client_uat')
  );
}

export default function ClerkGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [ready, setReady] = useState(false);

  // Routes that need auth render the provider on the very first client paint.
  const routeRequiresClerk = matchesClerkRoute(pathname);

  const enable = useCallback(() => setReady(true), []);

  useEffect(() => {
    if (routeRequiresClerk) {
      setReady(true);
      return;
    }
    // A returning signed-in visitor must not see the anonymous header flash.
    if (hasSessionCookie()) {
      setReady(true);
      return;
    }
    const onRequest = () => setReady(true);
    window.addEventListener(REQUEST_CLERK, onRequest);
    return () => window.removeEventListener(REQUEST_CLERK, onRequest);
  }, [routeRequiresClerk, pathname]);

  const active = ready || routeRequiresClerk;

  return (
    <ClerkReadyContext.Provider value={active}>
      {active ? (
        <ClerkProvider>
          <AuthSync />
          {children}
        </ClerkProvider>
      ) : (
        children
      )}
    </ClerkReadyContext.Provider>
  );
}
