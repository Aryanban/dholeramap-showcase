'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Route } from 'lucide-react';

interface SchemePreview {
  sid: string;
  name: string;
  badge: string;
  road: string;
  focus: string;
  samplePlot: string;
  zone: string;
}

const SCHEME_PREVIEWS: SchemePreview[] = [
  {
    sid: 'tp1-1',
    name: 'TP 1 — Activation Area',
    badge: 'Immediate Trunk Utilities',
    road: '250m Central Spine · 55m Corridor',
    focus: 'Commercial, Residential (R-1) & Administration',
    samplePlot: 'FP-102 (Kadipur)',
    zone: 'Activation Industrial & Mixed',
  },
  {
    sid: 'tp2-1',
    name: 'TP 2 — Semiconductor Mega-Fab',
    badge: 'Tata ₹91,000 Cr Fab Node',
    road: '70m Primary Arterial Expressway',
    focus: 'Heavy Manufacturing & Ancillary Clusters',
    samplePlot: 'FP-88 (Gorasu)',
    zone: 'High-Tech Industrial Zone',
  },
  {
    sid: 'tp5-1',
    name: 'TP 5 — Expressway Spine',
    badge: 'Direct Highway Cut-Through',
    road: '250m National Expressway Spine',
    focus: 'Mega Logistics, Commercial Showrooms & Heavy Industry',
    samplePlot: 'FP-324 (Hebatpur)',
    zone: 'High-Tech Industrial',
  },
  {
    sid: 'tp6',
    name: 'TP 6 — Airport City & Aerotropolis',
    badge: 'Navagam International Airport Gateway',
    road: 'Multi-Modal Airport Expressway',
    focus: 'Air Cargo, Customs CFS & Hospitality',
    samplePlot: 'FP-14 (Zankhi)',
    zone: 'Logistics & Aerotropolis',
  },
];

export default function MapShowcaseBanner() {
  const [activeTab, setActiveTab] = useState<number>(0);
  const active = SCHEME_PREVIEWS[activeTab];

  return (
    <section className="py-16 sm:py-24 bg-gradient-to-b from-white via-slate-50 to-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Banner Container (100% Light Mode) */}
        <div className="relative rounded-[32px] bg-gradient-to-br from-blue-50/70 via-white to-slate-50 text-slate-900 p-8 sm:p-12 lg:p-16 shadow-xl overflow-hidden border border-blue-100">
          {/* Subtle Ambient Radial Glows */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-24 -left-24 w-96 h-96 rounded-full opacity-40 blur-3xl"
            style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)' }}
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-24 -right-24 w-96 h-96 rounded-full opacity-35 blur-3xl"
            style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.15) 0%, transparent 70%)' }}
          />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Column: Heading & Value Proposition */}
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                <span>DeepZoom CRS.Simple Tile Pyramid</span>
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight text-slate-900">
                Inspect Statutory Interactive Linework Down to the Millimeter
              </h2>

              <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                Experience India’s most advanced spatial land intelligence viewer. Switch between all
                six Town Planning schemes, inspect statutory OP-to-FP reconstitution, examine abutting
                road widths, and verify DGDCR building regulations across all 22 villages.
              </p>

              {/* Scheme Picker Pills */}
              <div className="flex flex-wrap gap-2 pt-2">
                {SCHEME_PREVIEWS.map((s, idx) => (
                  <button
                    key={s.sid}
                    type="button"
                    onClick={() => setActiveTab(idx)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                      activeTab === idx
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 shadow-2xs'
                    }`}
                  >
                    {s.name.split('—')[0].trim()}
                  </button>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-4">
                <Link
                  href={`/map?sid=${active.sid}`}
                  className="px-6 py-3.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Launch Interactive GIS Map</span>
                  <span>→</span>
                </Link>

                <Link
                  href="/dholera-tp-map"
                  className="px-5 py-3.5 rounded-full bg-white hover:bg-slate-100 border border-slate-200 text-slate-800 font-semibold text-sm transition flex items-center justify-center cursor-pointer shadow-2xs"
                >
                  Browse Scheme Blueprints
                </Link>
              </div>
            </div>

            {/* Right Column: Live Simulated Cadastral Card HUD */}
            <div className="lg:col-span-6">
              <div className="rounded-2xl border border-slate-200/90 bg-white/95 backdrop-blur-xl p-6 sm:p-8 shadow-xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 block">
                      Active Map Sheet
                    </span>
                    <h3 className="text-xl font-black text-slate-900 mt-0.5">
                      {active.name}
                    </h3>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 border border-emerald-200 text-emerald-800">
                    {active.badge}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] text-slate-500 block font-semibold">Exemplar Parcel</span>
                    <span className="font-bold text-slate-900 text-sm block mt-0.5">{active.samplePlot}</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] text-slate-500 block font-semibold">Zoning Classification</span>
                    <span className="font-bold text-blue-700 text-xs block mt-0.5 truncate" title={active.zone}>
                      {active.zone}
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-slate-500 block font-semibold">Statutory Road Frontage</span>
                  <span className="font-bold text-slate-800 text-xs flex items-center gap-1.5 mt-0.5">
                    <Route className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>{active.road}</span>
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-slate-500 block font-semibold">Permitted Development</span>
                  <span className="text-slate-600 text-xs block mt-0.5 leading-snug">
                    {active.focus}
                  </span>
                </div>

                <div className="pt-2 flex items-center justify-between text-xs text-slate-500">
                  <span>✓ DSIRDA Statutory Sanctioned linework</span>
                  <span className="text-blue-700 font-bold">1:1 Native Resolution</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
