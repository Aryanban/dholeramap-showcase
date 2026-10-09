'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { Map, Building2, TrendingUp, Bookmark, Users, BookOpen, Sparkles, Landmark } from 'lucide-react';
import { useApp } from '@/lib/store';
import { useClerkReady, requestClerk } from '@/components/providers/ClerkGate';

const UserMenu = dynamic(() => import('./UserMenu'), {
  ssr: false,
  loading: () => (
    <div className="min-w-[76px] min-h-[34px] flex items-center justify-end shrink-0">
      <div className="h-8.5 w-[76px] rounded-xl bg-slate-100 border border-slate-200/80 animate-pulse" />
    </div>
  ),
});

/**
 * Anonymous visitors never mount <ClerkProvider /> (see ClerkGate), and
 * UserMenu calls useUser()/Show, which throw outside a provider. Until the
 * visitor signals intent we render a plain link to /sign-in — a real, working
 * navigation that needs no Clerk JavaScript at all.
 *
 * Hover/focus dispatches requestClerk() so Clerk is already loading by the
 * time the pointer reaches the control; the swap to the real Clerk menu then
 * happens without a visible delay.
 */
function LazyUserMenu() {
  const clerkReady = useClerkReady();
  const warmClerk = () => requestClerk();

  if (!clerkReady) {
    return (
      <Link
        href="/sign-in"
        className="inline-flex items-center gap-1.5 h-8.5 rounded-xl border border-slate-200 px-3 text-xs font-bold text-slate-700 hover:text-blue-600 hover:bg-blue-50/50 hover:border-blue-300 transition cursor-pointer shrink-0"
        title="Sign in or register"
        onMouseEnter={warmClerk}
        onFocus={warmClerk}
      >
        <svg className="w-3.5 h-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
        <span className="hidden xs:inline">Sign In</span>
      </Link>
    );
  }

  return <UserMenu />;
}

const NotificationCenter = dynamic(() => import('./NotificationCenter'), {
  ssr: false,
  loading: () => (
    <div className="w-9 h-9 rounded-lg border border-slate-200/80 bg-slate-100 animate-pulse shrink-0" />
  ),
});

const AuthModal = dynamic(() => import('./AuthModal'), {
  ssr: false,
});

interface SiteHeaderProps {
  activePage?:
    | 'dashboard'
    | 'settings'
    | 'admin'
    | 'contact'
    | 'brokers'
    | 'properties'
    | 'guide'
    | 'pricing'
    | 'billing'
    | 'dholera-sir'
    | 'whitepaper';
}

export default function SiteHeader({ activePage }: SiteHeaderProps) {
  const bookmarks = useApp((s) => s.bookmarks);

  return (
    <>
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-xs px-3 sm:px-8 h-14 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <Link href="/" className="flex items-center gap-2 group cursor-pointer min-w-0" title="Return to Main Portal">
            <Image
              src="/icon-96.png"
              alt="DholeraMap — Official Dholera SIR Interactive GIS Atlas"
              width={34}
              height={34}
              className="h-7.5 w-7.5 sm:h-8.5 sm:w-8.5 object-contain rounded-lg group-hover:scale-105 transition shrink-0"
              priority
              unoptimized
            />
            <div className="flex flex-col leading-none min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-base sm:text-[17px] font-black tracking-tight text-slate-950 group-hover:text-blue-600 transition truncate">
                  Dholera<span className="text-blue-600">Map</span>
                </span>
                <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-blue-600 text-white shadow-2xs leading-none shrink-0">
                  GIS
                </span>
              </div>
              <span className="hidden xs:block text-[9.5px] font-semibold text-slate-500 tracking-wider uppercase truncate">
                Interactive Land Registry &amp; Atlas
              </span>
            </div>
          </Link>
        </div>

        {/* Center Nav */}
        <nav className="hidden md:flex items-center gap-1">
          <Link
            href="/"
            className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-600 hover:text-blue-600 hover:bg-slate-100 transition cursor-pointer"
          >
            Home
          </Link>

          <Link
            href="/map"
            className="px-3 py-1.5 rounded-xl text-xs font-bold text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition cursor-pointer flex items-center gap-1.5"
          >
            <Map className="w-3.5 h-3.5" />
            <span>Map Viewer</span>
          </Link>

          <Link
            href="/dholera-tp-map"
            className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-600 hover:text-blue-600 hover:bg-slate-100 transition cursor-pointer flex items-center gap-1.5"
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>TP Maps</span>
          </Link>

          <Link
            href="/dholera-plot-price"
            className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-600 hover:text-blue-600 hover:bg-slate-100 transition cursor-pointer flex items-center gap-1.5"
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Plot Prices</span>
          </Link>

          <Link
            href="/dashboard"
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              activePage === 'dashboard'
                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                : 'text-slate-600 hover:text-blue-600 hover:bg-slate-100'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>Saved</span>
            {bookmarks.length > 0 && (
              <span className="text-[10px] bg-blue-600 text-white font-black px-1.5 py-0.2 rounded-full leading-none">
                {bookmarks.length}
              </span>
            )}
          </Link>

          <Link
            href="/properties"
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              activePage === 'properties'
                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                : 'text-slate-600 hover:text-blue-600 hover:bg-slate-100'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Properties</span>
          </Link>

          <Link
            href="/brokers"
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              activePage === 'brokers'
                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                : 'text-slate-600 hover:text-blue-600 hover:bg-slate-100'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Brokers</span>
          </Link>

          <Link
            href="/dholera-sir"
            className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition cursor-pointer hidden xl:flex items-center gap-1.5"
          >
            <Landmark className="w-3.5 h-3.5" />
            <span>Dholera SIR</span>
          </Link>

          <Link
            href="/guide"
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              activePage === 'guide'
                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                : 'text-slate-600 hover:text-blue-600 hover:bg-slate-100'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Guide</span>
          </Link>

          <Link
            href="/pricing"
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              activePage === 'pricing'
                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                : 'text-slate-600 hover:text-blue-600 hover:bg-slate-100'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Pricing</span>
          </Link>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <Link
            href="/map"
            aria-label="Open Interactive GIS Map Viewer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition cursor-pointer shrink-0"
            title="Open Interactive GIS Map"
          >
            <Map className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Open Map</span>
            <span className="sm:hidden">Map</span>
          </Link>

          <NotificationCenter />
          <LazyUserMenu />
        </div>
      </header>

      {/* Global Auth Modal */}
      <AuthModal />
    </>
  );
}
