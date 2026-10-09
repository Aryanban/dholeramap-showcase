'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Search, Bell } from 'lucide-react';
import { useApp } from '@/lib/store';
import { loadManifest } from '@/lib/sheets';
import type { SheetsManifest } from '@/lib/types';

/**
 * Mobile-only floating top bar (Google Maps / Zillow pattern).
 * One row: brand dot + tappable search pill + compact bell + satellite mode toggle.
 * Everything else (account, brokers, embed, saved-full) moves into
 * the More sheet so this bar never wraps or clusters.
 */
export default function MobileTopBar() {
  const setMobileSearchOpen = useApp((s) => s.setMobileSearchOpen);
  const setMobileMoreOpen = useApp((s) => s.setMobileMoreOpen);
  const mobileMoreOpen = useApp((s) => s.mobileMoreOpen);
  const activeSid = useApp((s) => s.activeSid);
  const notifications = useApp((s) => s.notifications);
  const mapViewMode = useApp((s) => s.mapViewMode);
  const setMapViewMode = useApp((s) => s.setMapViewMode);
  const unread = notifications.filter((n) => !n.read).length;

  const [label, setLabel] = useState('Official Master Map');

  useEffect(() => {
    loadManifest()
      .then((m: SheetsManifest) => {
        const sh = m.sheets[activeSid];
        if (sh) setLabel(sh.sector || sh.label);
      })
      .catch(() => {});
  }, [activeSid]);

  return (
    <div className="md:hidden absolute top-0 inset-x-0 z-[1040] px-3 pt-[max(0.6rem,env(safe-area-inset-top))] pointer-events-none">
      <div className="flex items-center gap-2">
        {/* Brand chip — compact, links home */}
        <Link
          href="/"
          aria-label="DholeraMap home"
          className="pointer-events-auto shrink-0 flex items-center gap-1.5 h-11 pl-1.5 pr-2.5 rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.08)]"
        >
          <Image src="/icon-96.png" alt="DholeraMap" width={30} height={30} className="h-[30px] w-[30px] rounded-[10px] object-contain" priority />
          <span className="flex flex-col leading-none">
            <span className="text-[12.5px] font-black tracking-tight text-slate-950">
              Dholera<span className="text-blue-600">Map</span>
            </span>
            <span className="text-[9px] font-semibold text-slate-500 truncate max-w-[76px]">{label}</span>
          </span>
        </Link>

        {/* Search pill — the single primary action */}
        <button
          onClick={() => setMobileSearchOpen(true)}
          className="pointer-events-auto flex-1 min-w-0 flex items-center gap-2 h-11 px-3.5 rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.08)] text-left active:scale-[0.99] transition"
          aria-label="Search plots, surveys, villages"
        >
          <Search className="w-[18px] h-[18px] text-slate-400 shrink-0" strokeWidth={2.2} />
          <span className="text-[13.5px] text-slate-400 font-medium truncate">Search FP, survey…</span>
        </button>

        {/* Satellite Mode Toggle */}
        <button
          onClick={() => setMapViewMode(mapViewMode === 'satellite' ? 'cadastral' : 'satellite')}
          aria-label="Toggle Satellite Map Mode"
          className={`pointer-events-auto relative shrink-0 h-11 px-3 rounded-2xl backdrop-blur-md border shadow-[0_2px_12px_rgba(0,0,0,0.08)] flex items-center justify-center gap-1 active:scale-95 transition ${
            mapViewMode === 'satellite'
              ? 'bg-purple-600 text-white border-purple-500 font-bold'
              : 'bg-white/95 text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
          title="Toggle Satellite GIS View"
        >
          <span className="text-[11px] font-bold tracking-tight">
            {mapViewMode === 'satellite' ? '🛰️ Sat' : '🗺️ Map'}
          </span>
        </button>

        {/* Bell — badge only, opens More sheet section */}
        <button
          onClick={() => setMobileMoreOpen(!mobileMoreOpen)}
          aria-label="Notifications and more"
          className="pointer-events-auto relative shrink-0 w-11 h-11 rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.08)] flex items-center justify-center text-slate-700 active:scale-95 transition"
        >
          <Bell className="w-5 h-5" strokeWidth={1.9} />
          {unread > 0 && (
            <span className="absolute top-1.5 right-1.5 min-w-[17px] h-[17px] px-1 rounded-full bg-rose-600 text-white text-[10px] font-extrabold flex items-center justify-center">
              {unread > 9 ? '9+' : unread}
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
