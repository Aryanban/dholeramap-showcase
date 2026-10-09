import React from 'react';
import Link from 'next/link';
import { Layers } from 'lucide-react';

interface SchemeInfo {
  sid: string;
  code: string;
  name: string;
  area: string;
  stage: string;
  focus: string;
  villages: string[];
  roads: string;
  badgeColor: string;
}

const SCHEMES: SchemeInfo[] = [
  {
    sid: 'tp1-1',
    code: 'TP 1',
    name: 'Activation Area & Residential Core',
    area: '51.0 sq km',
    stage: 'Sanctioned Preliminary',
    focus: 'Commercial, High-Density Residential (R-1) & Administrative Civic Center',
    villages: ['Kadipur', 'Ambli', 'Bhadana', 'Gogla'],
    roads: '250m Spine · 55m / 30m Arterials',
    badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  },
  {
    sid: 'tp2-1',
    code: 'TP 2',
    name: 'High-Tech Industrial & Fab Zone',
    area: '102.3 sq km',
    stage: 'Sanctioned Preliminary',
    focus: 'Semiconductor Fabrication (Tata Fab), Heavy Industry & Ancillary Parks',
    villages: ['Gorasu', 'Bhimnath', 'Bhadiyad', 'Otariya'],
    roads: '250m Central Spine · 70m Primary Arterials',
    badgeColor: 'bg-indigo-50 text-indigo-800 border-indigo-200',
  },
  {
    sid: 'tp3',
    code: 'TP 3',
    name: 'Logistics, Port City & Mixed Use',
    area: '66.5 sq km',
    stage: 'Draft Scheme Sanctioned',
    focus: 'General Manufacturing, Inland Container Depots & Coastal Commercial',
    villages: ['Dholera', 'Cher', 'Sangasar'],
    roads: '55m Inter-Sector Highway · 30m Grid',
    badgeColor: 'bg-blue-50 text-blue-800 border-blue-200',
  },
  {
    sid: 'tp4-1',
    code: 'TP 4',
    name: 'Solar Park & Knowledge Corridor',
    area: '60.0 sq km',
    stage: 'Draft Scheme Sanctioned',
    focus: 'Solar Energy (5,000 MW Ultra-Mega Park), Clean Tech & University Campus',
    villages: ['Bhangadh', 'Mundi', 'Sandhida'],
    roads: '45m Connecting Arterials · 25m Collectors',
    badgeColor: 'bg-amber-50 text-amber-800 border-amber-200',
  },
  {
    sid: 'tp5-1',
    code: 'TP 5',
    name: 'Expressway Frontage & Mega Industrial',
    area: '74.8 sq km',
    stage: 'Sanctioned Preliminary',
    focus: 'Expressway-Facing Commercial & Large-Footprint Heavy Industry',
    villages: ['Hebatpur', 'Bavaliyari', 'Zankhi'],
    roads: '250m Expressway Spine · 55m Corridors',
    badgeColor: 'bg-purple-50 text-purple-800 border-purple-200',
  },
  {
    sid: 'tp6',
    code: 'TP 6',
    name: 'Aerotropolis & Airport City',
    area: '67.2 sq km',
    stage: 'Draft Scheme Sanctioned',
    focus: 'Aviation MRO, Cargo Logistics, Air Freight & Hotel Corridors',
    villages: ['Zankhi', 'Bavaliyari', 'Navagam'],
    roads: 'Airport Expressway Spine · Multi-Modal Transit',
    badgeColor: 'bg-sky-50 text-sky-800 border-sky-200',
  },
];

export default function TpSchemesMatrix() {
  return (
    <section className="py-16 sm:py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 sm:mb-16 gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold uppercase tracking-wider mb-3">
              <Layers className="w-3.5 h-3.5 text-blue-600" />
              <span>Town Planning Framework</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 leading-tight">
              Six Statutory Town Planning Schemes (TP 1 to TP 6)
            </h2>
            <p className="mt-3 text-base text-slate-600 leading-relaxed">
              Every survey number inside Dholera SIR is assigned to a sanctioned Town Planning scheme,
              governing road frontage, statutory area reconstitution, and DGDCR 2024 FAR limits.
            </p>
          </div>

          <Link
            href="/dholera-tp-map"
            className="inline-flex items-center gap-2 text-xs font-bold text-blue-600 hover:text-blue-700 bg-white border border-slate-200 hover:border-blue-300 px-4 py-2.5 rounded-xl shadow-2xs transition shrink-0"
          >
            <span>View Full TP Comparison Guide</span>
            <span>→</span>
          </Link>
        </div>

        {/* 6 Schemes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {SCHEMES.map((scheme) => (
            <div
              key={scheme.code}
              className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs hover:shadow-lg hover:border-blue-300 transition duration-300 flex flex-col justify-between"
            >
              <div>
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                  <span className="text-lg font-black text-slate-900 tracking-tight">
                    {scheme.code}
                  </span>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${scheme.badgeColor}`}
                  >
                    {scheme.area}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 leading-snug">
                  {scheme.name}
                </h3>

                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  {scheme.focus}
                </p>

                {/* Key Details */}
                <div className="mt-4 pt-3 border-t border-slate-100 space-y-2 text-xs">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-slate-600 font-semibold">Villages:</span>
                    <span className="font-semibold text-slate-800 text-right">
                      {scheme.villages.join(', ')}
                    </span>
                  </div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-slate-600 font-semibold">Corridors:</span>
                    <span className="font-semibold text-slate-800 text-right">
                      {scheme.roads}
                    </span>
                  </div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-slate-600 font-semibold">Sanction:</span>
                    <span className="font-semibold text-emerald-700">
                      ✓ {scheme.stage}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-6 pt-4 border-t border-slate-100">
                <Link
                  href={`/map?sid=${scheme.sid}`}
                  aria-label={`Launch ${scheme.code} (${scheme.name}) on Interactive Map`}
                  className="w-full py-2.5 rounded-xl bg-slate-50 hover:bg-blue-50 text-slate-800 hover:text-blue-700 border border-slate-200 hover:border-blue-200 font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <span>Launch {scheme.code} on Interactive Map</span>
                  <span>→</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
