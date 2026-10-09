'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Map, Building2, Tag, Route, Search, FileText } from 'lucide-react';
import { useApp } from '@/lib/store';
import { loadManifest, loadSurveys, searchPlansGrouped } from '@/lib/sheets';
import { prewarmFlyTiles } from '@/lib/tile-prewarm';
import type { SearchHit, SheetsManifest, CadastralSurveyPoint, SplitSearchResults } from '@/lib/types';

const LS_RECENT = 'dholera-recent-searches';

function getRecents(): string[] {
  try {
    const raw = localStorage.getItem(LS_RECENT);
    return raw ? (JSON.parse(raw) as string[]).slice(0, 6) : [];
  } catch {
    return [];
  }
}

function pushRecent(q: string) {
  try {
    const list = [q, ...getRecents().filter((r) => r.toLowerCase() !== q.toLowerCase())].slice(0, 6);
    localStorage.setItem(LS_RECENT, JSON.stringify(list));
  } catch {}
}

const POPULAR_CHIPS = [
  { q: '333', label: 'Test 333 (FP vs Survey)' },
  { q: '21', label: 'FP-21' },
  { q: '399', label: 'Survey 399' },
  { q: 'D-10', label: 'Displaced Plot D-10' },
  { q: '145', label: 'FP-145 (TP 3)' },
  { q: '201', label: 'FP-201 (TP 5)' },
  { q: '284', label: 'Survey 284 (TP 6 Airport)' },
  { q: 'Ambli', label: 'Ambli Village' },
  { q: 'Otariya', label: 'Otariya (Non-TP)' },
];

export default function SearchBox() {
  const activeSid = useApp((s) => s.activeSid);
  const openSheet = useApp((s) => s.openSheet);
  const issueFly = useApp((s) => s.issueFly);
  const setClickedPt = useApp((s) => s.setClickedPt);

  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const [mobileTab, setMobileTab] = useState<'all' | 'fp' | 'survey'>('all');
  const [results, setResults] = useState<SplitSearchResults>({
    finalPlots: [],
    surveyNumbers: [],
    schemesAndVillages: [],
    outsideTPSurveys: [],
    totalCount: 0,
  });
  const [recents, setRecents] = useState<string[]>([]);
  const [dataReady, setDataReady] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const manifestRef = useRef<SheetsManifest | null>(null);
  const surveysRef = useRef<Record<string, CadastralSurveyPoint[]>>({});

  useEffect(() => {
    let active = true;
    loadManifest()
      .then((m) => {
        if (active) manifestRef.current = m;
      })
      .catch((err) => console.warn('Failed to load search manifest:', err));

    // Defer 1.8MB survey index until browser idle to give 100% initial bandwidth to map tiles
    const prefetchSurveys = () => {
      loadSurveys()
        .then((s) => {
          if (active) {
            surveysRef.current = s;
            setDataReady(true);
          }
        })
        .catch((err) => console.warn('Failed to load survey search data:', err));
    };

    let timer: any = null;
    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      (window as any).requestIdleCallback(prefetchSurveys);
    } else {
      timer = setTimeout(prefetchSurveys, 800);
    }

    setRecents(getRecents());
    return () => {
      active = false;
      if (timer) clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      const trimmed = q.trim();
      if (!trimmed || !manifestRef.current) {
        setResults({
          finalPlots: [],
          surveyNumbers: [],
          schemesAndVillages: [],
          outsideTPSurveys: [],
          totalCount: 0,
        });
        return;
      }
      const res = searchPlansGrouped(trimmed, manifestRef.current, surveysRef.current, 25, activeSid);
      setResults(res);
    }, 120);
    return () => clearTimeout(t);
  }, [q, activeSid, dataReady]);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (
        (e.key === '/' || (e.ctrlKey && e.key === 'k') || (e.metaKey && e.key === 'k')) &&
        document.activeElement?.tagName !== 'INPUT'
      ) {
        e.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }
    };
    window.addEventListener('keydown', onKey);
    const onClickAway = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    window.addEventListener('mousedown', onClickAway);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('mousedown', onClickAway);
    };
  }, []);

  function commit(hitOrQuery: SearchHit | string) {
    let target: SearchHit | undefined;
    if (typeof hitOrQuery === 'string') {
      pushRecent(hitOrQuery);
      setQ(hitOrQuery);
      if (manifestRef.current) {
        const res = searchPlansGrouped(hitOrQuery, manifestRef.current, surveysRef.current, 1, activeSid);
        target = res.finalPlots[0] || res.surveyNumbers[0] || res.schemesAndVillages[0] || res.outsideTPSurveys[0];
      }
    } else {
      target = hitOrQuery;
      pushRecent(target.title);
      setQ(target.plotNumber || target.surveyNumber || target.title.split('·')[0].trim());
    }

    if (!target || !target.sid) return;

    setOpen(false);
    inputRef.current?.blur();

    // 1. If plot belongs to another sheet, switch to that sheet
    if (target.sid !== activeSid) {
      openSheet(target.sid);
    }

    // 2. Fly to target coordinate with precision reticle
    const isParcel = target.hitCategory !== 'scheme_village' && Boolean(target.plotNumber || target.surveyNumber || target.surveyData);
    const zoomLevel = target.sid.startsWith('tp') ? (isParcel ? 3.8 : 3.6) : 2.5;
    // Prewarm the destination tiles now so they stream in during the fly glide
    // and the target paints on arrival instead of after the animation lands.
    prewarmFlyTiles(target.sid, target.x, target.y, zoomLevel);
    issueFly(target.sid, target.x, target.y, zoomLevel, isParcel, target.subMapLabel);

    // 3. Set clicked point and selected survey for cadastral details drawer
    if (isParcel && target.surveyData) {
      setClickedPt({ x: target.x, y: target.y }, target.surveyData);
      useApp.getState().setInfoSheetOpen(true);
    } else if (isParcel) {
      setClickedPt({ x: target.x, y: target.y }, null);
      useApp.getState().setInfoSheetOpen(true);
    } else {
      setClickedPt(null, null);
    }

    void navigator.vibrate?.(12);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (!open && (e.key === 'ArrowDown' || e.key === 'Enter')) {
      setOpen(true);
      return;
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      // Pick first hit available in priority: FP, then Survey, then Scheme
      const firstHit =
        results.finalPlots[0] ||
        results.surveyNumbers[0] ||
        results.schemesAndVillages[0] ||
        results.outsideTPSurveys[0];
      if (firstHit) {
        commit(firstHit);
      }
    } else if (e.key === 'Escape') {
      setOpen(false);
      inputRef.current?.blur();
    }
  }

  const allSurveysCount = results.surveyNumbers.length + results.outsideTPSurveys.length;

  return (
    <div ref={boxRef} className="relative w-full max-w-xl">
      {/* Search Input Field */}
      <div className="relative flex items-center">
        <svg
          className="absolute left-3 w-4 h-4 text-slate-400 pointer-events-none"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>

        <input
          ref={inputRef}
          data-search-input
          type="text"
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setOpen(true);
          }}
          onFocus={() => {
            setOpen(true);
            if (!dataReady) {
              loadSurveys().then((s) => {
                surveysRef.current = s;
                setDataReady(true);
              });
            }
          }}
          onKeyDown={onKeyDown}
          placeholder="Search Plot (FP) or Survey (e.g. 333, 21)..."
          className="w-full h-9 pl-9 pr-14 rounded-lg bg-slate-100 hover:bg-slate-50 focus:bg-white border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 outline-none transition font-medium"
        />

        {q ? (
          <button
            onClick={() => {
              setQ('');
              setResults({
                finalPlots: [],
                surveyNumbers: [],
                schemesAndVillages: [],
                outsideTPSurveys: [],
                totalCount: 0,
              });
              inputRef.current?.focus();
            }}
            className="absolute right-3 w-5 h-5 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-600 flex items-center justify-center text-xs leading-none transition cursor-pointer"
            title="Clear search"
          >
            ✕
          </button>
        ) : (
          <div className="absolute right-2.5 hidden sm:flex items-center gap-0.5 text-[10px] font-mono text-slate-400 bg-white border border-slate-200 px-1.5 py-0.5 rounded shadow-xs pointer-events-none">
            <span>⌘K</span>
          </div>
        )}
      </div>

      {/* Autocomplete Split-Screen Dropdown & Quick Search Panel */}
      {open && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1.5 w-[94vw] sm:w-[720px] md:w-[780px] lg:w-[860px] bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 overflow-hidden max-h-[82vh] flex flex-col animate-in fade-in zoom-in-95 duration-100 text-slate-900">
          {/* 1. Quick Suggestion Chips Header */}
          <div className="p-2.5 bg-slate-50 border-b border-slate-100 flex items-center gap-1.5 overflow-x-auto scrollbar-none shrink-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 shrink-0 mr-1">
              Popular:
            </span>
            {POPULAR_CHIPS.map((chip) => (
              <button
                key={chip.q}
                onClick={() => commit(chip.q)}
                className="shrink-0 px-2 py-0.5 text-[11px] font-semibold bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 hover:border-blue-300 rounded-md transition cursor-pointer shadow-2xs"
              >
                {chip.label}
              </button>
            ))}
          </div>

          {/* 2. Search Status & Dual Category Bar */}
          {q.trim() && (
            <div className="px-3.5 py-2 bg-slate-100/70 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 shrink-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-slate-800">
                  Search &ldquo;<span className="text-blue-600">{q}</span>&rdquo;
                </span>
                <span className="text-[11px] text-slate-500 font-medium">({results.totalCount} matches)</span>
              </div>

              {/* Mobile Category Segmented Tabs */}
              <div className="flex md:hidden items-center gap-1 p-0.5 bg-white rounded-lg border border-slate-200 text-[10px] font-bold">
                <button
                  onClick={() => setMobileTab('all')}
                  className={`px-2 py-1 rounded transition cursor-pointer ${
                    mobileTab === 'all' ? 'bg-blue-600 text-white' : 'text-slate-600'
                  }`}
                >
                  All ({results.totalCount})
                </button>
                <button
                  onClick={() => setMobileTab('fp')}
                  className={`px-2 py-1 rounded transition cursor-pointer ${
                    mobileTab === 'fp' ? 'bg-emerald-600 text-white' : 'text-slate-600'
                  }`}
                >
                  FP ({results.finalPlots.length})
                </button>
                <button
                  onClick={() => setMobileTab('survey')}
                  className={`px-2 py-1 rounded transition cursor-pointer ${
                    mobileTab === 'survey' ? 'bg-blue-600 text-white' : 'text-slate-600'
                  }`}
                >
                  Surveys ({allSurveysCount})
                </button>
              </div>

              {/* Desktop Dual Column Stats Indicator */}
              <div className="hidden md:flex items-center gap-3 text-xs font-semibold">
                <span className="flex items-center gap-1 text-emerald-700">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>{results.finalPlots.length} Final Plots (FP)</span>
                </span>
                <span className="text-slate-300">|</span>
                <span className="flex items-center gap-1 text-blue-700">
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                  <span>{allSurveysCount} Revenue Surveys</span>
                </span>
              </div>
            </div>
          )}

          {/* 3. Town Planning Schemes & 22 Villages Top Section (if matched) */}
          {results.schemesAndVillages.length > 0 && (
            <div className="p-2.5 bg-blue-50/50 border-b border-blue-100 shrink-0">
              <div className="text-[10px] font-extrabold uppercase tracking-wider text-blue-900 mb-1.5 flex items-center gap-1.5">
                <Map className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>Town Planning Schemes &amp; 22 Revenue Villages ({results.schemesAndVillages.length})</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-28 overflow-y-auto">
                {results.schemesAndVillages.map((hit) => (
                  <SchemeOrVillageCard key={hit.id} hit={hit} onClick={() => commit(hit)} />
                ))}
              </div>
            </div>
          )}

          {/* 4. Main Results Area */}
          {results.totalCount > 0 ? (
            <div className="flex-1 overflow-y-auto">
              {/* DESKTOP SPLIT-SCREEN VIEW (2 Balanced Columns) */}
              <div className="hidden md:grid md:grid-cols-2 divide-x divide-slate-200 min-h-[300px]">
                {/* Left Column: Final Plots (FP) */}
                <div className="p-3 flex flex-col bg-slate-50/30">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200 shrink-0">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                      <h3 className="text-xs font-black uppercase tracking-wider text-emerald-950">
                        Final Plot Numbers (FP)
                      </h3>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                      {results.finalPlots.length} Plots
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 mb-2 shrink-0">
                    Reconstituted urban plots allotted under Gujarat TP Schemes (TP 1–6)
                  </p>

                  <div className="space-y-2 overflow-y-auto max-h-[50vh] pr-1">
                    {results.finalPlots.length > 0 ? (
                      results.finalPlots.map((hit) => (
                        <FinalPlotCard key={hit.id} hit={hit} onClick={() => commit(hit)} />
                      ))
                    ) : (
                      <div className="py-8 text-center text-slate-400">
                        <Tag className="w-6 h-6 mx-auto mb-1 text-slate-300" />
                        <p className="text-xs font-semibold text-slate-600">No Final Plot matching &ldquo;{q}&rdquo;</p>
                        <p className="text-[11px] mt-0.5">Check the Revenue Survey column on the right →</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Column: Revenue Survey Numbers */}
                <div className="p-3 flex flex-col bg-slate-50/30">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200 shrink-0">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                      <h3 className="text-xs font-black uppercase tracking-wider text-blue-950">
                        Revenue Survey Numbers (RS)
                      </h3>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-300">
                      {allSurveysCount} Surveys
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 mb-2 shrink-0">
                    Original survey farm/village records &amp; outside-TP parcels
                  </p>

                  <div className="space-y-2 overflow-y-auto max-h-[50vh] pr-1">
                    {allSurveysCount > 0 ? (
                      <>
                        {results.surveyNumbers.map((hit) => (
                          <SurveyCard key={hit.id} hit={hit} onClick={() => commit(hit)} />
                        ))}
                        {results.outsideTPSurveys.map((hit) => (
                          <SurveyCard key={hit.id} hit={hit} onClick={() => commit(hit)} />
                        ))}
                      </>
                    ) : (
                      <div className="py-8 text-center text-slate-400">
                        <FileText className="w-6 h-6 mx-auto mb-1 text-slate-300" />
                        <p className="text-xs font-semibold text-slate-600">No Revenue Survey matching &ldquo;{q}&rdquo;</p>
                        <p className="text-[11px] mt-0.5">Check the Final Plot column on the left ←</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* MOBILE RESPONSIVE ADAPTIVE VIEW */}
              <div className="md:hidden p-3 space-y-4">
                {(mobileTab === 'all' || mobileTab === 'fp') && results.finalPlots.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-slate-200">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-600" />
                        <h3 className="text-xs font-black uppercase tracking-wider text-emerald-950">
                          Final Plots (FP) ({results.finalPlots.length})
                        </h3>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {results.finalPlots.map((hit) => (
                        <FinalPlotCard key={hit.id} hit={hit} onClick={() => commit(hit)} />
                      ))}
                    </div>
                  </div>
                )}

                {(mobileTab === 'all' || mobileTab === 'survey') && allSurveysCount > 0 && (
                  <div>
                    <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-slate-200">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-blue-600" />
                        <h3 className="text-xs font-black uppercase tracking-wider text-blue-950">
                          Revenue Survey Numbers ({allSurveysCount})
                        </h3>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {results.surveyNumbers.map((hit) => (
                        <SurveyCard key={hit.id} hit={hit} onClick={() => commit(hit)} />
                      ))}
                      {results.outsideTPSurveys.map((hit) => (
                        <SurveyCard key={hit.id} hit={hit} onClick={() => commit(hit)} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : q.trim() ? (
            <div className="p-8 text-center text-slate-500">
              <Search className="w-8 h-8 mx-auto mb-2 text-slate-300" />
              <p className="text-sm font-bold text-slate-800">No property matches found for &ldquo;{q}&rdquo;</p>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Try searching a numeric plot number (e.g. <strong>333</strong>, <strong>21</strong>, <strong>399</strong>, <strong>510</strong>), a village name (e.g. <strong>Ambli</strong>, <strong>Hebatpur</strong>, <strong>Otariya</strong>), or a TP scheme.
              </p>
            </div>
          ) : (
            <div className="p-4 space-y-3">
              {recents.length > 0 && (
                <div>
                  <p className="px-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Recent Searches
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                    {recents.map((r, i) => (
                      <button
                        key={`${r}-${i}`}
                        onClick={() => commit(r)}
                        className="text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-blue-700 flex items-center gap-2 transition cursor-pointer border border-transparent hover:border-slate-200"
                      >
                        <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="truncate">{r}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 5. Footer Shortcuts & Legend */}
          <div className="px-3.5 py-2 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500 shrink-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                <span className="font-semibold text-slate-700">FP:</span> Reconstituted Plot
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
                <span className="font-semibold text-slate-700">Survey:</span> Revenue Number
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-slate-500 inline-block" />
                <span className="font-semibold text-slate-700">Outside TP:</span> Regional
              </span>
            </div>
            <span className="hidden sm:inline text-slate-400 font-mono text-[10px]">
              Click any item to inspect &amp; fly
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

function FinalPlotCard({ hit, onClick }: { hit: SearchHit; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left p-2.5 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/40 transition group cursor-pointer bg-white flex flex-col gap-1 shadow-2xs"
    >
      <div className="flex items-center justify-between gap-1.5 flex-wrap">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-black bg-emerald-100 text-emerald-950 border border-emerald-300 px-2 py-0.5 rounded-lg shadow-2xs">
            {hit.title.split('·')[0].trim()}
          </span>
          <span className="text-[10px] font-bold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
            {hit.tpSchemeName || 'TP Scheme'}
          </span>
          {hit.isCurrentSheet && (
            <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded bg-emerald-600 text-white leading-tight shadow-2xs">
              Active Map
            </span>
          )}
        </div>
        <span className="text-[10px] font-bold text-blue-600 group-hover:translate-x-0.5 transition flex items-center gap-0.5">
          Jump <span>→</span>
        </span>
      </div>

      <div className="text-[11px] text-slate-700 font-medium mt-0.5">
        <span className="text-slate-900 font-bold">{hit.villageName}</span>
        {hit.surveyNumber && hit.surveyNumber !== 'Original Survey Unspecified' && (
          <span className="text-slate-500 ml-1">
            (Allotted from Survey <strong className="text-slate-800 font-semibold">{hit.surveyNumber}</strong>)
          </span>
        )}
      </div>

      <div className="flex items-center gap-1.5 flex-wrap text-[10px] text-slate-500 pt-0.5">
        {hit.roadWidthM ? (
          <span className="px-1.5 py-0.2 rounded bg-blue-50 text-blue-700 border border-blue-200 font-bold flex items-center gap-1">
            <Route className="w-3 h-3 text-blue-600 shrink-0" />
            <span>{hit.roadWidthM >= 200 ? '250m Expressway' : `${hit.roadWidthM}m Road`}</span>
          </span>
        ) : null}
        {hit.zone ? (
          <span className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-800 border border-slate-200 truncate max-w-[130px] font-medium">
            {hit.zone.includes('Ind')
              ? 'Industrial'
              : hit.zone.includes('Res')
              ? 'Residential'
              : hit.zone.includes('Solar')
              ? 'Solar'
              : hit.zone.includes('Cargo') || hit.zone.includes('Airport')
              ? 'Logistics'
              : 'Mixed Zone'}
          </span>
        ) : null}
      </div>
    </button>
  );
}

function SurveyCard({ hit, onClick }: { hit: SearchHit; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-2.5 rounded-xl border transition group cursor-pointer bg-white flex flex-col gap-1 shadow-2xs ${
        hit.isOutsideTP
          ? 'border-slate-200 hover:border-blue-500 hover:bg-slate-50'
          : 'border-slate-200 hover:border-blue-500 hover:bg-blue-50/40'
      }`}
    >
      <div className="flex items-center justify-between gap-1.5 flex-wrap">
        <div className="flex items-center gap-1.5">
          <span
            className={`text-xs font-black px-2 py-0.5 rounded-lg border shadow-2xs ${
              hit.isOutsideTP
                ? 'bg-slate-100 text-slate-800 border-slate-300'
                : 'bg-blue-100 text-blue-950 border-blue-300'
            }`}
          >
            {hit.title.split('·')[0].trim()}
          </span>
          {hit.isOutsideTP ? (
            <span className="text-[9px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">
              Outside TP
            </span>
          ) : (
            <span className="text-[10px] font-bold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
              {hit.tpSchemeName || 'TP Scheme'}
            </span>
          )}
          {hit.isCurrentSheet && (
            <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded bg-emerald-600 text-white leading-tight shadow-2xs">
              Active Map
            </span>
          )}
        </div>
        <span className="text-[10px] font-bold text-blue-600 group-hover:translate-x-0.5 transition flex items-center gap-0.5">
          Jump <span>→</span>
        </span>
      </div>

      <div className="text-[11px] text-slate-700 font-medium mt-0.5">
        <span className="text-slate-900 font-bold">{hit.villageName}</span>
        {hit.plotNumber && !hit.plotNumber.includes('Pending') ? (
          <span className="text-slate-500 ml-1">
            → Reconstituted into <strong className="text-emerald-700 font-bold">{hit.plotNumber}</strong>
          </span>
        ) : (
          <span className="text-slate-500 ml-1 font-medium">
            (Pre-Reconstitution Agricultural Survey)
          </span>
        )}
      </div>

      <div className="flex items-center gap-1.5 flex-wrap text-[10px] text-slate-500 pt-0.5">
        {hit.subMapLabel && (
          <span className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 truncate max-w-[190px]">
            {hit.subMapLabel}
          </span>
        )}
        {hit.roadWidthM && !hit.isOutsideTP ? (
          <span className="px-1.5 py-0.2 rounded bg-blue-50 text-blue-700 border border-blue-200 font-bold flex items-center gap-1">
            <Route className="w-3 h-3 text-blue-600 shrink-0" />
            <span>{hit.roadWidthM >= 200 ? '250m Expressway' : `${hit.roadWidthM}m Road`}</span>
          </span>
        ) : null}
      </div>
    </button>
  );
}

function SchemeOrVillageCard({ hit, onClick }: { hit: SearchHit; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="text-left px-3 py-2 rounded-xl bg-white hover:bg-blue-50/80 border border-slate-200 hover:border-blue-300 transition group cursor-pointer flex items-center justify-between gap-2 shadow-2xs"
    >
      <div className="flex items-center gap-2 min-w-0">
        <div className="w-6 h-6 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
          {hit.type === 'village' ? <Building2 className="w-3.5 h-3.5" /> : <Map className="w-3.5 h-3.5" />}
        </div>
        <div className="min-w-0">
          <div className="text-xs font-bold text-slate-900 truncate group-hover:text-blue-600 transition">
            {hit.title}
          </div>
          <div className="text-[10px] text-slate-500 truncate">{hit.subtitle}</div>
        </div>
      </div>
      <span className="text-[10px] font-bold text-blue-600 shrink-0">Open Map →</span>
    </button>
  );
}
