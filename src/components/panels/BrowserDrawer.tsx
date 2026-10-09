'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useApp } from '@/lib/store';
import { loadManifest } from '@/lib/sheets';
import type { SheetsManifest } from '@/lib/types';
import { SUBSECTOR_FLY_MAP, type SubSectorDef } from '@/lib/sheets';
export { SUBSECTOR_FLY_MAP, type SubSectorDef };

export default function BrowserDrawer() {
  const open = useApp((s) => s.browserOpen);
  const setOpen = useApp((s) => s.setBrowserOpen);
  const activeSid = useApp((s) => s.activeSid);
  const openSheet = useApp((s) => s.openSheet);
  const issueFly = useApp((s) => s.issueFly);

  const [manifest, setManifest] = useState<SheetsManifest | null>(null);
  const [filter, setFilter] = useState('');
  const [openSectors, setOpenSectors] = useState<Set<string>>(
    new Set(['TP 1', 'TP 2', 'TP 3', 'TP 4', 'TP 5', 'TP 6'])
  );

  useEffect(() => {
    loadManifest().then((m) => {
      setManifest(m);
    });
  }, []);

  // Ensure active sector is expanded
  useEffect(() => {
    if (!manifest || !activeSid) return;
    const sh = manifest.sheets[activeSid];
    if (!sh) return;
    setOpenSectors((prev) => {
      const next = new Set(prev);
      next.add(sh.sector);
      return next;
    });
  }, [manifest, activeSid]);

  const toggleSector = (sec: string) => {
    setOpenSectors((prev) => {
      const next = new Set(prev);
      if (next.has(sec)) {
        next.delete(sec);
      } else {
        next.add(sec);
      }
      return next;
    });
  };

  const filteredGroups = useMemo(() => {
    if (!manifest) return [];
    const f = filter.trim().toLowerCase();
    if (!f) return manifest.groups;

    return manifest.groups
      .map((g) => ({
        ...g,
        sectors: g.sectors.filter((sec) => {
          if (sec.toLowerCase().includes(f)) return true;
          const sids = manifest.sectors[sec] || [];
          return sids.some((sid) => {
            const sh = manifest.sheets[sid];
            return (
              sh?.label.toLowerCase().includes(f) ||
              sh?.pocketId?.toLowerCase().includes(f) ||
              sh?.description.toLowerCase().includes(f)
            );
          });
        }),
      }))
      .filter((g) => g.sectors.length > 0);
  }, [manifest, filter]);

  function handleSelectSheet(sid: string) {
    const subDef = SUBSECTOR_FLY_MAP[sid];
    if (subDef) {
      // Stay on English master blueprint and fly directly to sub-sector!
      // isParcelSelection: false -> Clean camera pan/zoom directly to title without selecting any parcel!
      issueFly(subDef.masterSid, subDef.x, subDef.y, subDef.zoom, false, `${subDef.name} • ${subDef.sub}`);
    } else {
      openSheet(sid);
    }
    setOpen(false);
  }

  return (
    <div className="hidden md:contents">
      {/* Left-docked floating quick-access pill on the map (Desktop only, mobile has bottom bar) */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="hidden md:flex fixed left-3 top-28 z-[950] px-3 py-2 rounded-xl bg-white/95 backdrop-blur-md border border-slate-200 shadow-md text-slate-800 hover:text-blue-600 hover:border-blue-300 font-bold text-xs items-center gap-2 transition cursor-pointer group"
          title="Open Town Planning Schemes & Sub-Maps (TP 1 - TP 6)"
        >
          <svg className="w-4 h-4 text-blue-600 group-hover:scale-110 transition" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
          <span className="hidden sm:inline">TP Schemes & Sub-Parts</span>
          <span className="sm:hidden">Schemes</span>
          <span className="text-[10px] bg-blue-50 text-blue-700 px-1.5 py-0.2 rounded font-semibold border border-blue-200">
            TP 1-6
          </span>
        </button>
      )}

      {/* Backdrop */}
      {open && (
        <div
          className="fixed top-14 inset-x-0 bottom-0 z-[1040] bg-slate-900/30 backdrop-blur-xs transition-opacity duration-200"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Slide-out Drawer (Desktop: Left Drawer, Mobile: Bottom Sheet) */}
      {open && (
        <aside
          className="fixed z-[1050] md:top-14 md:bottom-0 md:left-0 md:w-[350px] md:max-w-[350px] md:border-r md:rounded-none inset-x-0 bottom-14 max-h-[50dvh] md:max-h-none bg-white border-t md:border-t-0 border-slate-200 shadow-2xl rounded-t-2xl transition-all duration-300 ease-out flex flex-col"
        >
        {/* Mobile Drag Handle */}
        <div
          className="md:hidden flex items-center justify-center pt-2 pb-1 cursor-pointer shrink-0"
          onClick={() => setOpen(false)}
          title="Tap to close"
        >
          <span className="w-12 h-1.5 bg-slate-300 rounded-full" />
        </div>

        {/* Drawer Header & Filter */}
        <div className="p-3 border-b border-slate-100 bg-slate-50/70 shrink-0">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse" />
              <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                DholeraMap Atlas &amp; Schemes
              </h2>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="w-7 h-7 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-700 flex items-center justify-center transition text-sm cursor-pointer"
              title="Close Drawer"
            >
              ✕
            </button>
          </div>

          {/* Quick TP Sector Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
            {['TP 1', 'TP 2', 'TP 3', 'TP 4', 'TP 5', 'TP 6'].map((sec) => (
              <button
                key={sec}
                onClick={() => toggleSector(sec)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold shrink-0 transition cursor-pointer ${
                  openSectors.has(sec)
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                {sec}
              </button>
            ))}
          </div>

          <div className="relative">
            <input
              type="text"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Filter TP 1, TP 2A, Sub-Map, Airport…"
              className="w-full h-8 pl-8 pr-3 text-xs bg-white border border-slate-200 rounded-lg outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
            />
            <svg
              className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-400 pointer-events-none"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Sheet Groups List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          {filteredGroups.map((group) => (
            <div key={group.name} className="space-y-1">
              <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1 pt-1">
                {group.name}
              </h3>
              {group.sectors.map((sec) => {
                const sids = manifest?.sectors[sec] || [];
                const isOpen = openSectors.has(sec) || Boolean(filter.trim());

                return (
                  <div key={sec} className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-xs">
                    {/* Sector Collapsible Header */}
                    <button
                      onClick={() => toggleSector(sec)}
                      className="w-full flex items-center justify-between px-3 py-2 bg-slate-50/80 hover:bg-slate-100 transition cursor-pointer text-left"
                    >
                      <div className="flex items-center gap-2">
                        <svg
                          className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                            isOpen ? 'rotate-90' : ''
                          }`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                        <span className="text-xs font-bold text-slate-800">{sec}</span>
                      </div>
                      <span className="text-[10px] font-bold text-slate-500 bg-white border border-slate-200 px-1.5 py-0.2 rounded-full">
                        {sids.length} maps
                      </span>
                    </button>

                    {/* Sub-maps List */}
                    {isOpen && (
                      <div className="p-1.5 space-y-1 divide-y divide-slate-100">
                        {sids.map((sid) => {
                          const sh = manifest?.sheets[sid];
                          if (!sh) return null;
                          const isActive = sid === activeSid;
                          const subDef = SUBSECTOR_FLY_MAP[sid];

                          return (
                            <button
                              key={sid}
                              onClick={() => handleSelectSheet(sid)}
                              className={`w-full text-left p-2 rounded-lg transition flex items-start gap-2.5 cursor-pointer ${
                                isActive
                                  ? 'bg-blue-50 border border-blue-300 ring-1 ring-blue-300/40 text-blue-950'
                                  : 'hover:bg-slate-50 border border-transparent'
                              }`}
                            >
                              {/* Vector Cadastral Badge */}
                              <div
                                className={`relative w-12 h-12 rounded-lg shrink-0 flex flex-col items-center justify-center border transition ${
                                  isActive
                                    ? 'bg-blue-600 border-blue-700 text-white shadow-xs'
                                    : 'bg-slate-100 border-slate-200 text-slate-700'
                                }`}
                              >
                                <svg
                                  className={`w-4 h-4 mb-0.5 ${isActive ? 'text-white' : 'text-blue-600'}`}
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1.8}
                                    d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                                  />
                                </svg>
                                <span
                                  className={`text-[9px] font-black tracking-tighter uppercase font-mono ${
                                    isActive ? 'text-white' : 'text-slate-800'
                                  }`}
                                >
                                  {sh.sector ? sh.sector.replace(' ', '') : 'CAD'}
                                </span>
                                {isActive && (
                                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
                                )}
                              </div>

                              {/* Info */}
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center justify-between gap-1">
                                  <span className={`text-xs font-bold truncate ${isActive ? 'text-blue-900' : 'text-slate-900'}`}>
                                    {subDef ? subDef.name : (sh.pocketId && sh.pocketId !== 'Master' && sh.pocketId !== 'All' ? sh.pocketId : 'Master Blueprint')}
                                  </span>
                                  {subDef?.badge ? (
                                    <span className="text-[9px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.2 rounded shrink-0">
                                      {subDef.badge}
                                    </span>
                                  ) : (
                                    <span className="text-[9px] font-mono text-slate-400 shrink-0">
                                      English CAD
                                    </span>
                                  )}
                                </div>
                                <p className="text-[11px] font-medium text-slate-700 truncate mt-0.5">
                                  {subDef ? subDef.sub : sh.label.replace(/^Town Planning Scheme \d+ — |^Dholera SIR — /, '')}
                                </p>
                                <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                                  {sh.description}
                                </p>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/70 text-[11px] text-slate-500 flex items-center justify-between">
          <span>{manifest?.totalSheets || 28} Official English Schemes</span>
          <span className="text-[10px] font-mono bg-blue-50 text-blue-700 font-bold border border-blue-200 px-1.5 py-0.5 rounded">
            21K+ CAD Parcels
          </span>
        </div>
      </aside>
    )}
  </div>
);
}
