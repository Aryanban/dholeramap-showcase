'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useApp } from '@/lib/store';
import { loadManifest } from '@/lib/sheets';
import type { SheetsManifest, PlanSheet } from '@/lib/types';
import dynamic from 'next/dynamic';
import SearchBox from './SearchBox';

const UserMenu = dynamic(() => import('./UserMenu'), {
  ssr: false,
  loading: () => (
    <div className="min-w-[76px] min-h-[34px] flex items-center justify-end shrink-0">
      <div className="h-8.5 w-[76px] rounded-xl bg-slate-100 border border-slate-200/80 animate-pulse" />
    </div>
  ),
});

const NotificationCenter = dynamic(() => import('./NotificationCenter'), {
  ssr: false,
  loading: () => (
    <div className="w-9 h-9 rounded-lg border border-slate-200/80 bg-slate-100 animate-pulse shrink-0" />
  ),
});

const AuthModal = dynamic(() => import('./AuthModal'), {
  ssr: false,
});

export default function Toolbar() {
  const browserOpen = useApp((s) => s.browserOpen);
  const setBrowserOpen = useApp((s) => s.setBrowserOpen);
  const activeSid = useApp((s) => s.activeSid);
  const infoSheetOpen = useApp((s) => s.infoSheetOpen);
  const setInfoSheetOpen = useApp((s) => s.setInfoSheetOpen);
  const bookmarks = useApp((s) => s.bookmarks);
  const mapViewMode = useApp((s) => s.mapViewMode);
  const setMapViewMode = useApp((s) => s.setMapViewMode);

  const [manifest, setManifest] = useState<SheetsManifest | null>(null);

  useEffect(() => {
    loadManifest().then(setManifest);
  }, []);

  const currentSheet: PlanSheet | null = manifest && activeSid ? manifest.sheets[activeSid] || null : null;

  return (
    <>
      <header className="absolute top-0 inset-x-0 z-[1060] hidden md:flex items-center gap-2 sm:gap-3 h-14 px-2.5 sm:px-4 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
        {/* DholeraMap Brand */}
        <Link
          href="/"
          title="DholeraMap — Return to Main Portal"
          className="shrink-0 flex items-center gap-2 group text-left hover:opacity-95 transition cursor-pointer"
        >
          <Image
            src="/icon-96.png"
            alt="DholeraMap — Master Interactive Atlas and TP Maps"
            width={34}
            height={34}
            className="h-8 w-8 object-contain shrink-0 rounded-lg group-hover:scale-105 transition"
            priority
          />
          <div className="flex flex-col justify-center leading-none min-w-0 mr-1">
            <div className="flex items-center gap-1.5">
              <span className="text-[13px] sm:text-[14.5px] font-black tracking-tight text-slate-950 group-hover:text-blue-600 transition truncate">
                Dholera<span className="text-blue-600">Map</span>
              </span>
              <span className="hidden min-[480px]:inline text-[8.5px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-blue-600 text-white shadow-2xs leading-none">
                GIS
              </span>
            </div>
            <span className="hidden sm:block text-[10px] text-slate-500 font-medium truncate max-w-[140px] lg:max-w-[190px]">
              {currentSheet ? currentSheet.label : 'Official Master Map'}
            </span>
          </div>
        </Link>

        {/* Maps Catalog Button */}
        <button
          onClick={() => setBrowserOpen(!browserOpen)}
          className={`shrink-0 inline-flex items-center gap-1.5 rounded-lg h-9 px-2 sm:px-2.5 text-xs sm:text-sm font-semibold transition cursor-pointer ${
            browserOpen
              ? 'bg-blue-600 text-white shadow-xs border border-blue-600'
              : 'text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
          title="Town Planning Schemes & Sub-Maps"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          <span className="hidden min-[420px]:inline">Maps</span>
        </button>

        {/* Map View Mode Switcher (Cadastral vs Satellite) */}
        <div className="shrink-0 flex items-center bg-slate-100/90 p-0.5 rounded-xl border border-slate-200 shadow-2xs">
          <button
            type="button"
            onClick={() => setMapViewMode('cadastral')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              mapViewMode === 'cadastral'
                ? 'bg-white text-slate-900 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            title="Switch to High-Resolution Cadastral Planning Sheets"
          >
            <span>Cadastral</span>
          </button>

          <button
            type="button"
            onClick={() => setMapViewMode('satellite')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              mapViewMode === 'satellite'
                ? 'bg-purple-600 text-white shadow-xs font-bold'
                : 'text-slate-600 hover:text-purple-700'
            }`}
            title="Switch to Esri Satellite Imagery + TP Overlays"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Satellite</span>
          </button>
        </div>

        {/* Center Search */}
        <div className="flex-1 flex justify-center min-w-0 px-1">
          <SearchBox />
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          {/* Saved Dashboard Shortcut (Hidden on mobile, present in bottom nav) */}
          <Link
            href="/dashboard"
            className="hidden sm:inline-flex shrink-0 items-center gap-1.5 rounded-lg h-9 px-2 sm:px-2.5 text-xs sm:text-sm font-semibold text-slate-700 hover:text-blue-600 hover:bg-blue-50/50 border border-slate-200 hover:border-blue-300 transition shadow-2xs cursor-pointer group"
            title="Saved Plots & CRM Dashboard"
          >
            <svg className="w-4 h-4 text-slate-500 group-hover:text-blue-600 transition shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
            <span className="hidden lg:inline">Saved</span>
            {bookmarks.length > 0 && (
              <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-1.5 py-0.2 rounded-full">
                {bookmarks.length}
              </span>
            )}
          </Link>

          {/* Top Brokers Directory */}
          <Link
            href="/brokers"
            className="hidden sm:inline-flex shrink-0 items-center gap-1.5 rounded-lg h-9 px-2 sm:px-2.5 text-xs sm:text-sm font-semibold text-slate-700 hover:text-blue-600 hover:bg-blue-50/50 border border-slate-200 hover:border-blue-300 transition shadow-2xs cursor-pointer group"
            title="Top Dholera Real Estate Brokers & Consultancies"
          >
            <svg className="w-4 h-4 text-slate-500 group-hover:text-blue-600 transition shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2M12 7a4 4 0 11-8 0 4 4 0 018 0zM16 11l2 2 4-4" />
            </svg>
            <span className="hidden md:inline">Brokers</span>
          </Link>

          {/* Embed Map Shortcut */}
          <Link
            href="/embed"
            className="hidden lg:inline-flex shrink-0 items-center gap-1.5 rounded-lg h-9 px-2 sm:px-2.5 text-xs sm:text-sm font-semibold text-slate-700 hover:text-blue-600 hover:bg-blue-50/50 border border-slate-200 hover:border-blue-300 transition shadow-2xs cursor-pointer group"
            title="Embed Dholera Map on your website (Free Widget)"
          >
            <svg className="w-4 h-4 text-slate-500 group-hover:text-blue-600 transition shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
            <span className="hidden xl:inline">Embed</span>
          </Link>

          {/* Plot Details Toggle (Hidden on mobile, present in bottom nav) */}
          <button
            onClick={() => setInfoSheetOpen(!infoSheetOpen)}
            className={`hidden sm:inline-flex shrink-0 items-center gap-1.5 rounded-lg h-9 px-2 sm:px-2.5 text-xs sm:text-sm font-semibold transition cursor-pointer ${
              infoSheetOpen
                ? 'bg-blue-600 text-white shadow-xs border border-blue-600'
                : 'text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
            title="Toggle Interactive Plot Details"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="hidden xl:inline">Plot Details</span>
          </button>

          <div className="hidden sm:block w-px h-6 bg-slate-200 mx-0.5" />

          {/* Notification Bell */}
          <NotificationCenter />

          {/* User Account Menu */}
          <UserMenu />
        </div>
      </header>

      {/* Global Auth Modal for Toolbar */}
      <AuthModal />
    </>
  );
}
