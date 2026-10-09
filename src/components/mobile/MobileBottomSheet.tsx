'use client';
import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { VILLAGES } from '@/lib/villages';
import { X, Map as MapIcon, Bookmark as BookmarkIcon, FileText, ChevronRight, Share2, Navigation, Ruler, Building2, BookmarkCheck, Layers, ArrowUp } from 'lucide-react';
import { useApp } from '@/lib/store';
import { loadManifest } from '@/lib/sheets';
import type { SheetsManifest } from '@/lib/types';
import { SUBSECTOR_FLY_MAP } from '@/lib/sheets';
import { useEntitlements } from '@/hooks/useEntitlements';
type Snap = 'peek' | 'half' | 'full';
export default function MobileBottomSheet() {
  const sheet = useApp((s) => s.mobileSheet);
  const setMobileSheet = useApp((s) => s.setMobileSheet);
  const selectedSurvey = useApp((s) => s.selectedSurvey);
  const bookmarks = useApp((s) => s.bookmarks);
  const removeBookmark = useApp((s) => s.removeBookmark);
  const issueFly = useApp((s) => s.issueFly);
  const activeSid = useApp((s) => s.activeSid);
  const openSheet = useApp((s) => s.openSheet);
  const clickedPt = useApp((s) => s.clickedPt);
  const addBookmark = useApp((s) => s.addBookmark);
  const setInfoTab = useApp((s) => s.setInfoTab);
  const [snap, setSnap] = useState<Snap>('half');
  const [manifest, setManifest] = useState<SheetsManifest | null>(null);
  const [filter, setFilter] = useState('');
  const ent = useEntitlements();
  useEffect(() => { loadManifest().then(setManifest).catch(() => {}); }, []);
  useEffect(() => { setSnap(sheet === 'plot' && selectedSurvey ? 'half' : sheet === 'none' ? 'peek' : 'half'); // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sheet, selectedSurvey]);
  const open = sheet !== 'none';
  const groups = useMemo(() => {
    if (!manifest) return [];
    const f = filter.trim().toLowerCase();
    if (!f) return manifest.groups;
    return manifest.groups.map((g) => ({ ...g, sectors: g.sectors.filter((sec) => sec.toLowerCase().includes(f)) })).filter((g) => g.sectors.length > 0);
  }, [manifest, filter]);
  if (!open) return null;
  const height = snap === 'peek' ? 'max-h-[128px]' : snap === 'half' ? 'max-h-[42dvh]' : 'max-h-[calc(100dvh-96px-env(safe-area-inset-bottom))]';
  function sharePlot() {
    try {
      const s: any = selectedSurvey;
      const label = s?.displayLabel || s?.finalPlot || (s?.surveyNo ? ('Survey ' + s.surveyNo) : 'Dholera plot');
      const url = window.location.origin + '/map?sid=' + activeSid;
      if (navigator.share) navigator.share({ title: label + ' on DholeraMap', url }).catch(() => {});
      else { navigator.clipboard?.writeText(label + ' ' + url).catch(() => {}); }
    } catch {}
  }
  function toggleSavePlot() {
    try {
      const s: any = selectedSurvey;
      if (!s) return;
      const surveyNo = s.surveyNo || '';
      const fpRaw = s.finalPlot && !String(s.finalPlot).includes('Pending') ? String(s.finalPlot) : '';
      const id = 'plot-' + (surveyNo || fpRaw) + '-' + activeSid;
      const existing = bookmarks.find((b: any) => b.surveyNo === surveyNo && b.sid === activeSid) || bookmarks.find((b: any) => b.id === id);
      if (existing) { removeBookmark(existing.id); return; }
      const label = (manifest?.sheets[activeSid]?.sector ? manifest.sheets[activeSid].sector + ' · ' : '') + (fpRaw ? (fpRaw.startsWith('FP-') || fpRaw.startsWith('D-') ? fpRaw : 'FP-' + fpRaw) : ('Survey ' + surveyNo));
      addBookmark({
        id,
        sid: activeSid,
        label,
        x: clickedPt?.x ?? 1500,
        y: clickedPt?.y ?? 1200,
        surveyNo,
        finalPlot: fpRaw,
        village: s.village || undefined,
        zone: s.zone || undefined,
        areaSqM: s.areaSqM || undefined,
        roadWidthM: Number(s.roadWidthM) || undefined,
        createdAt: Date.now(),
      } as any);
    } catch {}
  }
  function isPlotSaved() {
    const s: any = selectedSurvey;
    if (!s) return false;
    return bookmarks.some((b: any) => (b.sid === activeSid && b.surveyNo && b.surveyNo === s.surveyNo) || (!!s.finalPlot && b.finalPlot === s.finalPlot && b.sid === activeSid));
  }
  function flyToBookmark(b: any) {
    issueFly(b.sid || activeSid, b.x, b.y, 3.6, true);
  }
  return (
    <div data-testid="mobile-sheet" role="region" aria-label="Map context sheet" className="md:hidden fixed inset-x-0 bottom-0 z-[1050] px-2" style={{ paddingBottom: 'calc(64px + max(0.4rem, env(safe-area-inset-bottom)))' }}>
      <div className={"bg-white rounded-3xl border border-slate-200 shadow-[0_-8px_40px_rgba(0,0,0,0.16)] overflow-hidden flex flex-col transition-all " + height}>
        <div className="pt-2 pb-1 flex flex-col items-center shrink-0" onClick={() => setSnap(snap === 'half' ? 'full' : snap === 'full' ? 'peek' : 'half')}>
          <div className="w-10 h-1.5 rounded-full bg-slate-300" />
        </div>
        <div className="flex items-center gap-1 px-2 pb-1 shrink-0">
          <SheetTab active={sheet==='plot'} onClick={() => setMobileSheet('plot')} icon={<FileText className="w-4 h-4" />} label="Plot" />
          <SheetTab active={sheet==='schemes'} onClick={() => setMobileSheet('schemes')} icon={<MapIcon className="w-4 h-4" />} label="Schemes" />
          <SheetTab active={sheet==='saved'} onClick={() => setMobileSheet('saved')} icon={<BookmarkIcon className="w-4 h-4" />} label={"Saved" + (bookmarks.length ? ' (' + bookmarks.length + ')' : '')} />
          <button onClick={() => setMobileSheet('none')} aria-label="Close panel" className="ml-auto w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 active:scale-95"><X className="w-4 h-4" /></button>
        </div>
        <div className="flex-1 overflow-y-auto overscroll-contain px-3 pb-3" style={{ WebkitOverflowScrolling: 'touch' }}>
          {sheet === 'plot' ? (
            <PlotTab selectedSurvey={selectedSurvey} activeSid={activeSid} sharePlot={sharePlot} setSnap={setSnap} ent={ent} snap={snap} savedPlot={isPlotSaved()} toggleSavePlot={toggleSavePlot} manifest={manifest} />
          ) : sheet === 'schemes' ? (
            <div className="space-y-2">
              <input value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="Filter TP 1-6..." className="w-full h-10 px-3.5 rounded-xl bg-slate-100 border border-transparent focus:border-blue-400 focus:bg-white outline-none text-sm" />
              {groups.map((g: any) => (
                <div key={g.title}>
                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 px-1 py-1">{g.title}</p>
                  <div className="space-y-1.5">
                    {g.sectors.flatMap((sec: string) => (manifest?.sectors[sec] || []).map((sid: string) => {
                      const sh = manifest?.sheets[sid]; if (!sh) return null;
                      const subDef = (SUBSECTOR_FLY_MAP as any)[sid];
                      const isActive = sid === activeSid;
                      return (
                        <button key={sid} onClick={() => { if (subDef) issueFly(subDef.masterSid, subDef.x, subDef.y, subDef.zoom, false, subDef.name + ' - ' + subDef.sub); else openSheet(sid); }} className={"w-full flex items-center gap-3 p-2.5 rounded-2xl border text-left active:scale-[0.99] transition " + (isActive ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-slate-200 text-slate-900')}>
                          <span className={"w-10 h-10 rounded-xl flex items-center justify-center text-[10px] font-black shrink-0 " + (isActive ? 'bg-white/20 text-white' : 'bg-slate-900 text-white')}>{sh.sector ? sh.sector.replace(' ', '') : 'CAD'}</span>
                          <span className="min-w-0 flex-1">
                            <span className={"block text-[13.5px] font-bold truncate " + (isActive ? 'text-white' : 'text-slate-900')}>{subDef ? subDef.name : (sh.pocketId && sh.pocketId !== 'Master' ? sh.pocketId : 'Master Blueprint')}</span>
                            <span className={"block text-[11.5px] truncate " + (isActive ? 'text-blue-100' : 'text-slate-500')}>{subDef ? subDef.sub : sh.label}</span>
                          </span>
                          <ChevronRight className={"w-4 h-4 shrink-0 " + (isActive ? 'text-white' : 'text-slate-300')} />
                        </button>
                      );
                    }))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {bookmarks.length === 0 ? (
                <div className="text-center py-6">
                  <BookmarkIcon className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                  <p className="text-sm font-bold text-slate-700">No saved plots yet</p>
                  <p className="text-xs text-slate-500 mt-1">Tap any parcel on the map, then save it here.</p>
                  <button onClick={() => setMobileSheet('plot')} className="mt-3 px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-bold">Explore map</button>
                </div>
              ) : (
                <>
                  <Link href="/dashboard" className="flex items-center justify-between p-3 rounded-2xl bg-slate-900 text-white active:scale-[0.99]">
                    <span className="text-[13px] font-bold">Open saved-plots CRM</span>
                    <span className="text-[11.5px] text-white/70">notes, price, docs, export ›</span>
                  </Link>
                  {bookmarks.map((b: any) => (
                <div key={b.id} className="flex items-center gap-2.5 p-2.5 rounded-2xl bg-white border border-slate-200">
                  <button onClick={() => flyToBookmark(b)} className="flex-1 min-w-0 text-left">
                    <p className="text-[13.5px] font-bold text-slate-900 truncate">{b.label || b.finalPlot || b.surveyNo || 'Saved plot'}</p>
                    <p className="text-[11.5px] text-slate-500 truncate">{b.village || ''} {b.roadWidthM ? ' - ' + b.roadWidthM + 'm road' : ''}</p>
                  </button>
                  <button onClick={() => flyToBookmark(b)} className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0" aria-label="Fly to plot"><Navigation className="w-4 h-4" /></button>
                  <button onClick={() => removeBookmark(b.id)} className="w-9 h-9 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center shrink-0" aria-label="Remove"><X className="w-4 h-4" /></button>
                </div>
              ))}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
function SheetTab({ active, onClick, icon, label }: any) {
  return (
    <button onClick={onClick} className={"flex items-center gap-1.5 px-3 h-9 rounded-full text-[13px] font-bold transition active:scale-95 " + (active ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600')}>{icon}<span>{label}</span></button>
  );
}
function PlotTab({ selectedSurvey, activeSid, sharePlot, setSnap, ent, snap, savedPlot, toggleSavePlot, manifest }: any) {
  const s: any = selectedSurvey;
  if (!s) {
    return (
      <div className="text-center py-4">
        <p className="text-sm font-bold text-slate-800">Tap any parcel to inspect it</p>
        <p className="text-xs text-slate-500 mt-1 leading-relaxed">Final Plot no, survey no, village,<br />road width, zone & DGDCR envelope.</p>
        <div className="flex gap-2 justify-center mt-3">
          <span className="px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-bold">FP numbers</span>
          <span className="px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-[11px] font-bold">Survey numbers</span>
          <span className="px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-600 text-[11px] font-bold">22 villages</span>
        </div>
      </div>
    );
  }
  const fp = s.finalPlot && !s.finalPlot.includes('Pending') ? s.finalPlot : null;
  const sv = s.surveyNo || null;
  const roadW = Number(s.roadWidthM) || 0;
  return (
    <div>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            {fp ? <span className="text-[11px] font-black px-2 py-0.5 rounded-lg bg-slate-900 text-emerald-300">{s.displayLabel || fp}</span> : null}
            {sv ? <span className="text-[11px] font-bold px-2 py-0.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-800">Survey {sv}</span> : null}
          </div>
          <h2 className="text-[17px] font-black text-slate-900 mt-1 leading-tight">{s.village ? s.village + ' Village' : (s.schemeName || 'Dholera SIR')}</h2>
          <p className="text-[12px] text-slate-500 font-medium">{s.schemeName || ''}{s.zone ? ' - ' + s.zone : ''}</p>
        </div>
        <button onClick={sharePlot} className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-700 shrink-0 active:scale-95" aria-label="Share plot"><Share2 className="w-[18px] h-[18px]" /></button>
      </div>
      <div className="grid grid-cols-3 gap-2 mt-3">
        <Stat icon={<Ruler className="w-4 h-4" />} label="Road" value={roadW ? roadW + ' m' : '—'} />
        <Stat icon={<Building2 className="w-4 h-4" />} label="FAR" value={s.maxFAR ? String(s.maxFAR) : '—'} />
        <Stat icon={<MapIcon className="w-4 h-4" />} label="Zone" value={s.zoneCode || (s.zone ? s.zone.slice(0,6) : '—')} />
      </div>
      {ent?.isFree ? (
        <a href="/pricing" className="mt-3 flex items-center justify-between p-3 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 text-white">
          <span><span className="block text-[13px] font-black">Unlock full dossier</span><span className="block text-[11.5px] opacity-90">FAR, height, coverage, setbacks, PDF</span></span>
          <ChevronRight className="w-5 h-5" />
        </a>
      ) : (
        <div className="mt-3 p-3 rounded-2xl bg-slate-50 border border-slate-200 text-[12.5px] text-slate-700 leading-relaxed">
          <p><b>Height:</b> {s.maxHeightM ? s.maxHeightM + ' m' : '—'} &nbsp; <b>Coverage:</b> {s.groundCoveragePct ? s.groundCoveragePct + '%' : '—'}</p>
          <p className="mt-1"><b>Status:</b> {s.legalStatus || 'Sanctioned scheme'}</p>
        </div>
      )}
      <div className="grid grid-cols-2 gap-2 mt-2">
        <button onClick={toggleSavePlot} disabled={!!ent?.isFree && !savedPlot} className={"flex items-center justify-center gap-1.5 py-2.5 rounded-2xl text-[13.5px] font-bold active:scale-[0.99] transition " + (savedPlot ? 'bg-emerald-50 border border-emerald-200 text-emerald-700' : ent?.isFree ? 'bg-slate-100 border border-slate-200 text-slate-400' : 'bg-slate-900 text-white')}>
          {savedPlot ? <BookmarkCheck className="w-4 h-4" /> : <BookmarkIcon className="w-4 h-4" />}
          <span>{savedPlot ? 'Saved' : ent?.isFree ? 'Save (Pro)' : 'Save plot'}</span>
        </button>
        {(() => {
          const v = (s.village || '').toLowerCase().replace(/[^a-z]+/g, '-').replace(/^-|-$/g, '');
          const match = VILLAGES.find((x: any) => x.slug === v || x.name.toLowerCase().replace(/\s+/g, '-') === v);
          return match ? (
            <Link href={`/village/${match.slug}`} className="flex items-center justify-center gap-1.5 py-2.5 rounded-2xl bg-slate-100 border border-slate-200 text-slate-800 text-[13.5px] font-bold active:scale-[0.99]">
              <Layers className="w-4 h-4" /><span>Village data</span>
            </Link>
          ) : (
            <button onClick={() => setSnap('full')} className="flex items-center justify-center gap-1.5 py-2.5 rounded-2xl bg-slate-100 border border-slate-200 text-slate-800 text-[13.5px] font-bold active:scale-[0.99]">
              <FileText className="w-4 h-4" /><span>Full record</span>
            </button>
          );
        })()}
      </div>
      {snap === 'full' ? (
        <div className="mt-3 rounded-2xl border border-slate-200 divide-y divide-slate-100 overflow-hidden text-[12.5px]">
          <Row k="Scheme" v={s.schemeName || manifest?.sheets?.[activeSid]?.label || '-'} />
          <Row k="Village" v={s.village || '-'} />
          <Row k="Survey No." v={sv || '-'} />
          <Row k="Final Plot" v={fp || 'Awaiting TP sanction'} />
          <Row k="Area" v={s.areaSqM ? s.areaSqM + ' sq.m' : '-'} />
          <Row k="Road width" v={roadW ? roadW + ' m' : '-'} />
          <Row k="Zone" v={s.zone || s.zoneCode || '-'} />
          <Row k="FAR / FSI" v={s.maxFAR || '-'} />
          <Row k="Max height" v={s.maxHeightM ? s.maxHeightM + ' m' : '-'} />
          <Row k="Coverage" v={s.groundCoveragePct ? s.groundCoveragePct + '%' : '-'} />
          <Row k="Legal status" v={s.legalStatus || 'Sanctioned TP scheme'} />
        </div>
      ) : null}
      <button onClick={() => setSnap(snap === 'full' ? 'half' : 'full')} className="mt-2 w-full py-2.5 rounded-2xl bg-slate-900 text-white text-[13.5px] font-bold active:scale-[0.99] flex items-center justify-center gap-1.5">
        <ArrowUp className={"w-4 h-4 " + (snap === 'full' ? 'rotate-180' : '')} />
        <span>{snap === 'full' ? 'Collapse' : 'View full details'}</span>
      </button>
    </div>
  );
}
function Row({ k, v }: any) {
  return (
    <div className="flex items-start justify-between gap-3 px-3 py-2">
      <span className="text-slate-500 font-semibold shrink-0">{k}</span>
      <span className="text-slate-900 font-bold text-right break-words">{v}</span>
    </div>
  );
}
function Stat({ icon, label, value }: any) {
  return (
    <div className="rounded-2xl bg-slate-50 border border-slate-200 p-2.5 text-center">
      <div className="flex justify-center text-slate-400 mb-1">{icon}</div>
      <div className="text-[14px] font-black text-slate-900 truncate">{value}</div>
      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</div>
    </div>
  );
}
