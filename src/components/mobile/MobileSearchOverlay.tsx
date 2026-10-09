'use client';
import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Search, X, MapPin, Tag, Building2, Map as MapIcon, Clock } from 'lucide-react';
import { useApp } from '@/lib/store';
import { loadManifest, loadSurveys, searchPlansGrouped } from '@/lib/sheets';
import { prewarmFlyTiles } from '@/lib/tile-prewarm';
import type { SearchHit, SheetsManifest, CadastralSurveyPoint, SplitSearchResults } from '@/lib/types';
const LS_RECENT = 'dholera-recent-searches';
function getRecents(): string[] {
  try { const raw = localStorage.getItem(LS_RECENT); return raw ? (JSON.parse(raw) as string[]).slice(0,5) : []; } catch { return []; }
}
function pushRecent(q: string) {
  try { const prev = getRecents().filter((r) => r.toLowerCase() !== q.toLowerCase()); localStorage.setItem(LS_RECENT, JSON.stringify([q, ...prev].slice(0,5))); } catch {}
}
export default function MobileSearchOverlay() {
  const open = useApp((s) => s.mobileSearchOpen);
  const setMobileSearchOpen = useApp((s) => s.setMobileSearchOpen);
  const activeSid = useApp((s) => s.activeSid);
  const openSheet = useApp((s) => s.openSheet);
  const issueFly = useApp((s) => s.issueFly);
  const setClickedPt = useApp((s) => s.setClickedPt);
  const [q, setQ] = useState('');
  const [results, setResults] = useState<SplitSearchResults | null>(null);
  const [recents, setRecents] = useState<string[]>([]);
  const [ready, setReady] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const manifestRef = useRef<SheetsManifest | null>(null);
  const surveysRef = useRef<Record<string, CadastralSurveyPoint[]>>({});
  useEffect(() => {
    if (!open) return;
    setRecents(getRecents()); setQ(''); setResults(null);
    const t = setTimeout(() => inputRef.current?.focus(), 80);
    return () => clearTimeout(t);
  }, [open]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setMobileSearchOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, setMobileSearchOpen]);
  useEffect(() => {
    let live = true;
    loadManifest().then((m) => { if (live) manifestRef.current = m; }).catch(() => {});
    loadSurveys().then((s) => { if (live) { surveysRef.current = s; setReady(true); } }).catch(() => {});
    return () => { live = false; };
  }, []);
  useEffect(() => {
    const t = setTimeout(() => {
      const trimmed = q.trim();
      if (!trimmed || !manifestRef.current) { setResults(null); return; }
      setResults(searchPlansGrouped(trimmed, manifestRef.current, surveysRef.current, 18, activeSid));
    }, 140);
    return () => clearTimeout(t);
  }, [q, activeSid, ready]);
  if (!open) return null;
  function commit(hitOrQuery: SearchHit | string) {
    let target: SearchHit | undefined;
    if (typeof hitOrQuery === 'string') {
      pushRecent(hitOrQuery);
      if (manifestRef.current) {
        const res = searchPlansGrouped(hitOrQuery, manifestRef.current, surveysRef.current, 1, activeSid);
        target = res.finalPlots[0] || res.surveyNumbers[0] || res.schemesAndVillages[0] || res.outsideTPSurveys[0];
      }
    } else { target = hitOrQuery; pushRecent(target.title); }
    if (!target?.sid) return;
    setMobileSearchOpen(false);
    if (target.sid !== activeSid) openSheet(target.sid);
    const isParcel = target.hitCategory !== 'scheme_village' && Boolean(target.plotNumber || target.surveyNumber || target.surveyData);
    const zoom = target.sid.startsWith('tp') ? (isParcel ? 3.8 : 3.6) : 2.5;
    prewarmFlyTiles(target.sid, target.x, target.y, zoom);
    issueFly(target.sid, target.x, target.y, zoom, isParcel, target.subMapLabel);
    if (isParcel && target.surveyData) setClickedPt({ x: target.x, y: target.y }, target.surveyData);
    else if (isParcel) setClickedPt({ x: target.x, y: target.y }, null);
    else setClickedPt(null, null);
    try { (navigator as any).vibrate?.(12); } catch {}
  }
  const flat: SearchHit[] = results ? [...results.finalPlots.slice(0,6), ...results.surveyNumbers.slice(0,6), ...results.schemesAndVillages.slice(0,3), ...results.outsideTPSurveys.slice(0,3)] : [];
  return (
    <div className="md:hidden fixed inset-0 z-[1150] bg-slate-50 flex flex-col" role="dialog" aria-label="Search Dholera map">
      <div className="px-3 pt-[max(0.6rem,env(safe-area-inset-top))] pb-2 bg-white border-b border-slate-200 shadow-sm">
        <div className="flex items-center gap-2">
          <button onClick={() => setMobileSearchOpen(false)} aria-label="Back to map" className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-700 hover:bg-slate-100 active:scale-95 transition shrink-0">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1 flex items-center gap-2 h-11 px-3.5 rounded-2xl bg-slate-100 border border-slate-200 focus-within:border-blue-400 focus-within:bg-white transition">
            <Search className="w-[18px] h-[18px] text-slate-400 shrink-0" />
            <input ref={inputRef} value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && flat[0]) commit(flat[0]); if (e.key === 'Escape') setMobileSearchOpen(false); }} placeholder="Survey no, FP, village..." className="flex-1 min-w-0 bg-transparent outline-none text-[15px] text-slate-900 placeholder:text-slate-400" enterKeyHint="search" autoComplete="off" />
            {q ? (<button onClick={() => setQ('')} aria-label="Clear search" className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center shrink-0"><X className="w-3.5 h-3.5 text-slate-600" /></button>) : null}
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto overscroll-contain">
        {!q.trim() ? (
          <div className="p-4 space-y-5">
            {recents.length > 0 ? (
              <section>
                <h3 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Recent</h3>
                <div className="space-y-1">
                  {recents.map((r) => (
                    <button key={r} onClick={() => commit(r)} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white border border-slate-200 text-left active:bg-slate-50">
                      <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                      <span className="text-sm font-semibold text-slate-800 truncate">{r}</span>
                    </button>
                  ))}
                </div>
              </section>
            ) : null}
            <section>
              <h3 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 mb-2">Try</h3>
              <div className="flex flex-wrap gap-2">
                {['FP 21', 'Survey 399', 'Ambli', 'TP 3', 'Airport'].map((chip) => (
                  <button key={chip} onClick={() => setQ(chip.replace('FP ', '').replace('Survey ', ''))} className="px-3.5 py-2 rounded-full bg-white border border-slate-200 text-[13px] font-semibold text-slate-700 shadow-sm active:bg-blue-50 active:border-blue-300">{chip}</button>
                ))}
              </div>
            </section>
            <section className="rounded-2xl bg-blue-600 text-white p-4">
              <p className="text-sm font-bold">18,161 parcels - TP 1-6 - 22 villages</p>
              <p className="text-[12.5px] text-blue-100 mt-1 leading-snug">Type a Final Plot (FP) number, revenue survey number, or village name to jump straight to the parcel.</p>
            </section>
          </div>
        ) : flat.length === 0 ? (
          <div className="p-10 text-center">
            <Search className="w-8 h-8 mx-auto text-slate-300 mb-2" />
            <p className="text-sm font-bold text-slate-700">No matches</p>
            <p className="text-xs text-slate-500 mt-1">Try just the number.</p>
          </div>
        ) : (
          <div className="p-3 space-y-2">
            <p className="px-1 text-[11px] font-bold text-slate-500 uppercase tracking-wider">{flat.length} results</p>
            {flat.map((hit) => (
              <button key={hit.id} onClick={() => commit(hit)} className="w-full text-left p-3 rounded-2xl bg-white border border-slate-200 shadow-sm active:bg-blue-50/60 flex items-center gap-3">
                <span className={"w-10 h-10 rounded-xl flex items-center justify-center shrink-0 " + (hit.hitCategory === 'final_plot' ? 'bg-emerald-50 text-emerald-600' : hit.hitCategory === 'scheme_village' ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-600')}>
                  {hit.hitCategory === 'final_plot' ? <Tag className="w-5 h-5" /> : hit.hitCategory === 'scheme_village' ? (hit.type === 'village' ? <Building2 className="w-5 h-5" /> : <MapIcon className="w-5 h-5" />) : <MapPin className="w-5 h-5" />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[14px] font-bold text-slate-900 truncate">{hit.title}</span>
                  <span className="block text-[12px] text-slate-500 truncate mt-0.5">{hit.villageName} - {hit.tpSchemeName || hit.subtitle}</span>
                </span>
                <span className="text-blue-600 font-bold text-lg shrink-0">›</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
