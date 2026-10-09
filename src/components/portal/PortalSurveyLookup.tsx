'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Route } from 'lucide-react';
import { VILLAGES } from '@/lib/villages';

interface SampleLookup {
  village: string;
  surveyNo: string;
  fpNo?: string;
  tpScheme: string;
  zone: string;
  roadWidth: string;
  sid: string;
}

const SAMPLE_LOOKUPS: SampleLookup[] = [
  {
    village: 'Hebatpur',
    surveyNo: '399',
    fpNo: 'FP-324',
    tpScheme: 'TP 5 (Sub-sector 1)',
    zone: 'High-Tech Industrial & Semiconductor',
    roadWidth: '250m Central Spine Expressway',
    sid: 'tp5-1',
  },
  {
    village: 'Kadipur',
    surveyNo: '124',
    fpNo: 'FP-102',
    tpScheme: 'TP 1 (Activation Area)',
    zone: 'Activation Industrial & Manufacturing',
    roadWidth: '55m Arterial Highway',
    sid: 'tp1-1',
  },
  {
    village: 'Ambli',
    surveyNo: '699',
    fpNo: 'FP-45',
    tpScheme: 'TP 1 / TP 2',
    zone: 'Residential & Knowledge Corridor',
    roadWidth: '30m Sector Collector Road',
    sid: 'tp1-2',
  },
  {
    village: 'Bhadiyad',
    surveyNo: '45',
    fpNo: 'FP-18',
    tpScheme: 'TP 2 (High-Access)',
    zone: 'Commercial & High-Access Mixed',
    roadWidth: '45m Inter-Sector Arterial',
    sid: 'tp2-1',
  },
];

export default function PortalSurveyLookup() {
  const router = useRouter();
  const [selectedVillage, setSelectedVillage] = useState(SAMPLE_LOOKUPS[0].village);
  const [surveyInput, setSurveyInput] = useState(SAMPLE_LOOKUPS[0].surveyNo);

  // Active preview computation
  const activeSample = SAMPLE_LOOKUPS.find(
    (s) =>
      s.village.toLowerCase() === selectedVillage.toLowerCase() &&
      (s.surveyNo === surveyInput.trim() || s.fpNo?.toLowerCase() === surveyInput.trim().toLowerCase())
  );

  const villageObj = VILLAGES.find((v) => v.name.toLowerCase() === selectedVillage.toLowerCase());

  const currentPreview: SampleLookup = activeSample || {
    village: selectedVillage,
    surveyNo: surveyInput.trim() || '101',
    fpNo: surveyInput.trim() ? `FP-${surveyInput.trim()}` : 'FP-—',
    tpScheme: villageObj ? villageObj.scheme : 'TP 1 / TP 2',
    zone: villageObj ? villageObj.zone : 'Mixed-Use Zone',
    roadWidth: '30m Sanctioned Sector Road',
    sid: 'tp1-1',
  };

  const mapUrl = (() => {
    const query = new URLSearchParams();
    query.set('village', selectedVillage.toLowerCase());
    if (surveyInput.trim()) {
      query.set('survey', surveyInput.trim());
    }
    if (currentPreview.sid) {
      query.set('sid', currentPreview.sid);
    }
    return `/map?${query.toString()}`;
  })();

  const handleLaunchMap = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    router.push(mapUrl);
  };

  const selectQuickSample = (sample: SampleLookup) => {
    setSelectedVillage(sample.village);
    setSurveyInput(sample.surveyNo);
  };

  return (
    <div className="relative w-full max-w-lg rounded-[28px] border border-slate-200/90 bg-white/95 p-5 sm:p-6 shadow-[0_24px_60px_-15px_rgba(10,37,64,0.12)] backdrop-blur-xl">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[11px] font-black uppercase tracking-wider text-slate-800">
            Survey / OP &amp; FP Lookup
          </span>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
          22 Villages Live
        </span>
      </div>

      {/* Lookup Form */}
      <form onSubmit={handleLaunchMap} className="mt-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {/* Village Selector */}
          <div>
            <label htmlFor="portal-village-select" className="block text-[11px] font-bold text-slate-700 mb-1">
              Select Village / Moje
            </label>
            <select
              id="portal-village-select"
              name="village"
              aria-label="Select Village / Moje"
              value={selectedVillage}
              onChange={(e) => setSelectedVillage(e.target.value)}
              className="w-full h-11 px-3 rounded-xl border border-slate-200 bg-slate-50/70 text-slate-900 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition cursor-pointer"
            >
              {VILLAGES.map((v) => (
                <option key={v.slug} value={v.name}>
                  {v.name} ({v.scheme})
                </option>
              ))}
            </select>
          </div>

          {/* Survey / FP Input */}
          <div>
            <label htmlFor="portal-survey-input" className="block text-[11px] font-bold text-slate-700 mb-1">
              Survey No or Final Plot
            </label>
            <input
              id="portal-survey-input"
              name="survey"
              aria-label="Survey Number or Final Plot"
              type="text"
              value={surveyInput}
              onChange={(e) => setSurveyInput(e.target.value)}
              placeholder="e.g. 399 or 324"
              className="w-full h-11 px-3 rounded-xl border border-slate-200 bg-slate-50/70 text-slate-900 text-sm font-bold placeholder:text-slate-500 placeholder:font-normal focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
            />
          </div>
        </div>

        {/* Quick Sample Pills */}
        <div className="flex items-center gap-1.5 flex-wrap pt-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 mr-1">
            Try:
          </span>
          {SAMPLE_LOOKUPS.map((sample) => {
            const isCurrent =
              sample.village.toLowerCase() === selectedVillage.toLowerCase() &&
              sample.surveyNo === surveyInput.trim();
            return (
              <button
                key={`${sample.village}-${sample.surveyNo}`}
                type="button"
                onClick={() => selectQuickSample(sample)}
                className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border transition cursor-pointer ${
                  isCurrent
                    ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                {sample.village} {sample.surveyNo}
              </button>
            );
          })}
        </div>
      </form>

      {/* Live Result Preview Card */}
      <div className="mt-4 p-4 rounded-2xl bg-gradient-to-br from-slate-50 via-blue-50/20 to-emerald-50/20 border border-slate-200/90 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 block">
              Property Identity
            </span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-base font-black text-slate-900">
                {currentPreview.village}
              </span>
              <span className="text-xs font-bold text-blue-700">
                Survey {currentPreview.surveyNo} {currentPreview.fpNo && `· ${currentPreview.fpNo}`}
              </span>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 border border-emerald-200 text-emerald-800">
            ✓ Statutory Record
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-2.5 bg-white rounded-xl border border-slate-100">
            <span className="text-[10px] text-slate-600 block font-semibold">Planned Zone</span>
            <span className="font-bold text-slate-900 truncate block mt-0.5" title={currentPreview.zone}>
              {currentPreview.zone}
            </span>
          </div>

          <div className="p-2.5 bg-white rounded-xl border border-slate-100">
            <span className="text-[10px] text-slate-600 block font-semibold">Town Planning</span>
            <span className="font-bold text-slate-900 truncate block mt-0.5">
              {currentPreview.tpScheme}
            </span>
          </div>
        </div>

        <div className="p-2.5 bg-white rounded-xl border border-slate-100 flex items-center justify-between">
          <div className="min-w-0 pr-2">
            <span className="text-[10px] text-slate-600 block font-semibold">Road Frontage</span>
            <span className="font-bold text-slate-800 text-xs truncate flex items-center gap-1.5 mt-0.5">
              <Route className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span className="truncate">{currentPreview.roadWidth}</span>
            </span>
          </div>
          <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100 shrink-0">
            Sanctioned
          </span>
        </div>

        {/* Direct Action Link */}
        <Link
          href={mapUrl}
          aria-label={`Inspect ${currentPreview.village} Survey ${currentPreview.surveyNo} on Interactive GIS Map`}
          className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-bold text-xs shadow-sm hover:shadow transition flex items-center justify-center gap-2 cursor-pointer text-center"
        >
          <span>Inspect on Interactive GIS Map</span>
          <span>→</span>
        </Link>
      </div>

      <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500 font-medium">
        <span>18,161 statutory parcels indexed</span>
        <Link
          href="/map"
          className="text-blue-600 hover:underline font-bold"
        >
          Open full-screen atlas →
        </Link>
      </div>
    </div>
  );
}
