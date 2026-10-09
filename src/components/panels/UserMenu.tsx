'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useApp } from '@/lib/store';
import { isAdminEmail } from '@/lib/entitlements';
import { SignInButton, Show, UserButton, useUser } from '@clerk/nextjs';
import { useClerkReady, requestClerk } from '@/components/providers/ClerkGate';
import { Bookmark, Settings, CreditCard, Shield, HelpCircle, LogOut } from 'lucide-react';

/**
 * Account control, safe to render from ANY route.
 *
 * Anonymous visitors do not have <ClerkProvider /> mounted (see ClerkGate), and
 * every hook below (useUser/Show/UserButton/SignInButton) throws without one.
 * Rather than requiring each call site to remember that, the guard lives here
 * so a new <UserMenu /> in some future toolbar cannot crash the page. Until
 * Clerk is ready we render a plain link to /sign-in, which needs no Clerk JS.
 */
export default function UserMenu() {
  const clerkReady = useClerkReady();

  if (!clerkReady) {
    return (
      <Link
        href="/sign-in"
        className="inline-flex items-center gap-1.5 h-8.5 rounded-xl border border-slate-200 px-3 text-xs font-bold text-slate-700 hover:text-blue-600 hover:bg-blue-50/50 hover:border-blue-300 transition cursor-pointer shrink-0"
        title="Sign in or register"
        onMouseEnter={requestClerk}
        onFocus={requestClerk}
      >
        <svg className="w-3.5 h-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
        <span className="hidden xs:inline">Sign In</span>
      </Link>
    );
  }

  // No Clerk key configured (local/demo build) -> use the local-store menu.
  if (typeof process === 'undefined' || !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    return <LocalUserMenu />;
  }

  return <UserMenuInner />;
}

function UserMenuInner() {
  const bookmarks = useApp((s) => s.bookmarks);
  const setUser = useApp((s) => s.setUser);
  const hydrateEntitlements = useApp((s) => s.hydrateEntitlements);
  const clearEntitlements = useApp((s) => s.clearEntitlements);
  const userEmail = useApp((s) => s.user?.email);
  const { isLoaded, isSignedIn, user: clerkUser } = useUser();

  useEffect(() => {
    if (isLoaded && isSignedIn && clerkUser) {
      const verifiedPrimary =
        clerkUser.primaryEmailAddress?.verification?.status === 'verified'
          ? clerkUser.primaryEmailAddress.emailAddress
          : clerkUser.emailAddresses?.find((e) => e.verification?.status === 'verified')?.emailAddress || '';

      setUser({
        id: clerkUser.id,
        name: clerkUser.fullName || clerkUser.firstName || 'Dholera Investor',
        email: verifiedPrimary,
        phone: clerkUser.primaryPhoneNumber?.phoneNumber || '',
        role: (clerkUser.publicMetadata?.role as any) || 'investor',
        createdAt: clerkUser.createdAt ? new Date(clerkUser.createdAt).getTime() : Date.now(),
      });
      // Entitlements are server-written into publicMetadata (the webhook owns
      // the private copy). Hydrated here so gating resolves without a fetch.
      hydrateEntitlements(clerkUser.publicMetadata);
    } else if (isLoaded && !isSignedIn) {
      setUser(null);
      clearEntitlements();
    }
  }, [isLoaded, isSignedIn, clerkUser, setUser, hydrateEntitlements, clearEntitlements]);

  return (
    <div className="relative shrink-0 flex items-center gap-1.5 min-w-[76px] min-h-[34px] justify-end">
      {!isLoaded && (
        <div className="h-8.5 w-[76px] rounded-xl bg-slate-100 border border-slate-200/80 animate-pulse" />
      )}
      {isLoaded && (
        <>
          <Show when="signed-in">
            <UserButton
              appearance={{
                elements: {
                  avatarBox: 'w-8 h-8 rounded-xl ring-2 ring-blue-500/20 shadow-xs',
                },
              }}
            >
              <UserButton.MenuItems>
                <UserButton.Link
                  label={bookmarks.length > 0 ? `Saved Plots CRM (${bookmarks.length})` : 'Saved Plots CRM'}
                  labelIcon={<Bookmark className="w-4 h-4 text-blue-600" />}
                  href="/dashboard"
                />
                <UserButton.Link
                  label="Profile & Settings"
                  labelIcon={<Settings className="w-4 h-4 text-slate-600" />}
                  href="/settings"
                />
                <UserButton.Link
                  label="Plans & Billing"
                  labelIcon={<CreditCard className="w-4 h-4 text-slate-600" />}
                  href="/billing"
                />
                {isAdminEmail(userEmail) && (
                  <UserButton.Link
                    label="Admin Console"
                    labelIcon={<Shield className="w-4 h-4 text-purple-600" />}
                    href="/admin"
                  />
                )}
                <UserButton.Link
                  label="Support & Feedback"
                  labelIcon={<HelpCircle className="w-4 h-4 text-slate-600" />}
                  href="/contact"
                />
              </UserButton.MenuItems>
            </UserButton>
          </Show>
          <Show when="signed-out">
            <SignInButton mode="modal">
              <button
                className="inline-flex items-center gap-1.5 h-8.5 rounded-xl border border-slate-200 px-3 text-xs font-bold text-slate-700 hover:text-blue-600 hover:bg-blue-50/50 hover:border-blue-300 transition cursor-pointer"
                title="Sign in or register"
              >
                <svg className="w-3.5 h-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span>Sign In</span>
              </button>
            </SignInButton>
          </Show>
        </>
      )}
    </div>
  );
}

/**
 * Fallback account menu used only when NO Clerk publishable key is configured
 * (local/demo builds). It reads the locally-stored profile from the zustand
 * store. When Clerk IS configured the outer UserMenu renders <UserMenuInner />
 * instead, which uses the real Clerk hooks.
 */
function LocalUserMenu() {
  const [open, setOpen] = useState(false);
  const user = useApp((s) => s.user);
  const setUser = useApp((s) => s.setUser);
  const hydrateUser = useApp((s) => s.hydrateUser);
  const bookmarks = useApp((s) => s.bookmarks);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    hydrateUser();
  }, [hydrateUser]);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    window.addEventListener('mousedown', handleClick);
    return () => window.removeEventListener('mousedown', handleClick);
  }, [open]);

  function openAuth(mode: 'login' | 'signup' = 'login') {
    window.dispatchEvent(new CustomEvent('dholera-open-auth', { detail: { mode } }));
  }

  function handleSignOut() {
    setUser(null);
    setOpen(false);
  }

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((p) => p[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'PB';

  return (
    <div className="relative shrink-0" ref={menuRef}>
      {user ? (
        <button
          onClick={() => setOpen((v) => !v)}
          className="inline-flex items-center gap-2 h-9 rounded-xl border border-slate-200 pl-1.5 pr-2.5 hover:bg-slate-100 transition cursor-pointer"
          title="Account Menu"
        >
          <span className="inline-flex h-6.5 w-6.5 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 text-[11px] font-extrabold text-white">
            {initials}
          </span>
          <span className="hidden sm:inline text-xs font-bold text-slate-800 max-w-[100px] truncate">
            {user.name.split(' ')[0]}
          </span>
          <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      ) : (
        <button
          onClick={() => openAuth('login')}
          className="inline-flex items-center gap-1.5 h-9 rounded-xl border border-slate-200 px-3 text-xs font-bold text-slate-700 hover:text-blue-600 hover:bg-blue-50/50 hover:border-blue-300 transition cursor-pointer"
          title="Sign in to save plots and access CRM"
        >
          <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span>Sign In</span>
        </button>
      )}

      {open && user && (
        <div className="absolute right-0 mt-2 w-72 rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden z-[1300] animate-in fade-in slide-in-from-top-2 duration-150">
          {/* User Profile Header */}
          <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50/50 border-b border-slate-100 flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-sm font-extrabold text-white shadow-2xs">
              {initials}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-1">
                <h4 className="text-xs font-black text-slate-900 truncate">{user.name}</h4>
                <span
                  className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded border ${
                    user.role === 'owner'
                      ? 'bg-purple-50 text-purple-700 border-purple-200'
                      : user.role === 'investor'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-blue-50 text-blue-700 border-blue-200'
                  }`}
                >
                  {user.role}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 truncate mt-0.5">{user.email}</p>
            </div>
          </div>

          {/* Quick links */}
          <div className="p-2 space-y-0.5 text-xs font-semibold text-slate-700">
            <Link
              href="/dashboard"
              onClick={() => setOpen(false)}
              className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-slate-100 transition cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <Bookmark className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Saved Plots CRM</span>
              </div>
              <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                {bookmarks.length}
              </span>
            </Link>

            <Link
              href="/settings"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-100 transition cursor-pointer"
            >
              <Settings className="w-4 h-4 text-slate-600 shrink-0" />
              <span>Profile &amp; Settings</span>
            </Link>

            {isAdminEmail(user?.email) && (
              <Link
                href="/admin"
                onClick={() => setOpen(false)}
                className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-purple-50 text-purple-800 transition cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Shield className="w-4 h-4 text-purple-600 shrink-0" />
                  <span>Admin Console</span>
                </div>
                <span className="text-[9px] font-bold uppercase tracking-wider bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded">
                  Owner
                </span>
              </Link>
            )}

            <Link
              href="/contact"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-100 transition cursor-pointer"
            >
              <HelpCircle className="w-4 h-4 text-slate-600 shrink-0" />
              <span>Support &amp; Feedback</span>
            </Link>

            <div className="pt-1.5 border-t border-slate-100 mt-1">
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 transition cursor-pointer text-left"
              >
                <LogOut className="w-4 h-4 text-rose-500 shrink-0" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
