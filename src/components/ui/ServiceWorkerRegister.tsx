'use client';

import { useEffect } from 'react';

/**
 * Registers the asset-only service worker (Map Performance Plan, Phase 2).
 *
 * Runs post-hydration and only in production, so HMR/dev assets are never
 * cached. The worker is scoped to '/' so it can intercept /tiles, /maps and
 * /data — it never touches HTML navigations, /api, /trpc, or cross-origin
 * Clerk/Vercel traffic.
 */
export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (
      typeof window === 'undefined' ||
      !('serviceWorker' in navigator) ||
      process.env.NODE_ENV !== 'production'
    ) {
      return;
    }

    // Note: we intentionally do NOT reload on `controllerchange`. The worker
    // calls skipWaiting() + clients.claim(), which fires controllerchange on
    // FIRST INSTALL too — reloading then would flash the load screen a second
    // time (~400ms) after the map already appeared. On a genuine update the new
    // worker takes over the current tab via claim() and serves its own caches,
    // so a reload is unnecessary either way.
    const register = async () => {
      try {
        await navigator.serviceWorker.register('/sw.js', { scope: '/' });
      } catch (err) {
        console.warn('Service worker registration failed (non-fatal):', err);
      }
    };
    // Defer until the browser is idle so first-visit tile bandwidth is untouched.
    const hasIdle = typeof (window as Window & typeof globalThis).requestIdleCallback === 'function';
    if (hasIdle) {
      (window as Window & typeof globalThis).requestIdleCallback(register);
    } else {
      setTimeout(register, 1200);
    }

    return () => {};
  }, []);

  return null;
}
