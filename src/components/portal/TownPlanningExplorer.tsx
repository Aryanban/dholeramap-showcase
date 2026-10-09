'use client';

import React, { useState } from 'react';
import { tpAreaLabel } from '@/lib/tp-areas';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Layers, 
  Map, 
  Download, 
  CheckCircle2, 
  RefreshCw, 
  ArrowRight, 
  FileText, 
  Compass, 
  Building2, 
  Palette,
  Maximize2
} from 'lucide-react';

interface SchemeInfo {
  id: string;
  sid: string;
  name: string;
  tagline: string;
  areaHa: string;
  areaSqKm: string;
  status: string;
  gazetteNotice: string;
  image: string;
  villages: string[];
  keyRoads: string[];
  dominantZone: string;
  description: string;
}

const SCHEMES: SchemeInfo[] = [
  {
    id: 'tp1',
    sid: 'tp1-1',
    name: 'TP 1 — High-Access Residential & Knowledge',
    tagline: 'Residential Townships & Knowledge Corridor',
    areaHa: tpAreaLabel(1),
    areaSqKm: '~154 sq. km',
    status: 'Preliminary Sanctioned',
    gazetteNotice: 'GTPUD Act Section 48(2) Sanctioned',
    image: '/maps/schemes/dholera_tp1.jpg',
    villages: ['Ambli', 'Kadipur', 'Bhadiyad', 'Gogla'],
    keyRoads: ['55m Arterial Ring', '30m Sector Link', '18m Internal Residential'],
    dominantZone: 'Residential (R-1/R-2) & Educational Institutes',
    description: 'Master-planned for high-density, smart-grid executive townships with underground utility ducts, piped natural gas, and walking access to the Activation Core.'
  },
  {
    id: 'tp2',
    sid: 'tp2-1',
    name: 'TP 2 — Activation Area & Mega-Fab Hub',
    tagline: 'High-Tech Industrial & Administrative Core',
    areaHa: tpAreaLabel(2),
    areaSqKm: '~102 sq. km',
    status: 'Operational Infrastructure',
    gazetteNotice: 'Full Statutory Demarcation Complete',
    image: '/maps/schemes/dholera_tp2.jpg',
    villages: ['Kadipur', 'Bhimnath', 'Ambli', 'Gorasu'],
    keyRoads: ['250m Central Spine Corridor', '70m Arterial Highway', '55m Utility Trunk'],
    dominantZone: 'High-Tech Industrial & Tata Semiconductor Fab',
    description: 'The heartbeat of Dholera SIR featuring the ABCD Administrative Complex, ₹91,000 Cr Tata Semiconductor Plant, 400kV substation, and operational SCADA networks.'
  },
  {
    id: 'tp3',
    sid: 'tp3',
    name: 'TP 3 — City Centre & Commercial Core',
    tagline: 'Central Business District (CBD)',
    areaHa: tpAreaLabel(3),
    areaSqKm: '~66 sq. km',
    status: 'Preliminary Sanctioned',
    gazetteNotice: 'Draft Sanctioned by Urban Development Dept',
    image: '/maps/schemes/dholera_tp3.jpg',
    villages: ['Dholera Town', 'Cher', 'Mundi'],
    keyRoads: ['70m City Center Ring', '45m High-Street Boulevards'],
    dominantZone: 'Commercial C-1, Financial Services & Retail Hubs',
    description: 'Designed as the central commercial hub with high FAR permissions (up to 4.0–5.0) for corporate towers, multinational headquarters, 5-star hotels, and shopping malls.'
  },
  {
    id: 'tp4',
    sid: 'tp4',
    name: 'TP 4 — Solar Park & Knowledge Zone',
    tagline: 'Green Energy & High-Tech Logistics',
    areaHa: tpAreaLabel(4),
    areaSqKm: '~188 sq. km',
    status: 'Sanctioned Preliminary',
    gazetteNotice: 'GTPUD Gazetted Plan',
    image: '/maps/schemes/dholera_tp4.jpg',
    villages: ['Gorasu', 'Pipli', 'Sandhida'],
    keyRoads: ['250m Expressway Spur', '55m Solar Trunk Road'],
    dominantZone: '5000MW Ultra Mega Solar Park & Research Laboratories',
    description: 'Spanning vast non-saline corridors dedicated to renewable solar energy, power transmission corridors, battery storage, and advanced material research.'
  },
  {
    id: 'tp5',
    sid: 'tp5',
    name: 'TP 5 — Industrial Heavy Manufacturing',
    tagline: 'Heavy Engineering & Railway Freight Corridor',
    areaHa: tpAreaLabel(5),
    areaSqKm: '~115 sq. km',
    status: 'Sanctioned Preliminary',
    gazetteNotice: 'DSIRDA Industrial Gazette',
    image: '/maps/schemes/dholera_tp5.jpg',
    villages: ['Hebatpur', 'Khun', 'Bhangadh'],
    keyRoads: ['250m Central Spine', '70m Heavy Haulage Arterial'],
    dominantZone: 'Heavy Manufacturing, Defense, Aerospace, & Clean Tech',
    description: 'Targeted for defense offset manufacturing, heavy capital equipment, EV battery gigafactories, and railway logistics sidings with zero liquid discharge (ZLD).'
  },
  {
    id: 'tp6',
    sid: 'tp6',
    name: 'TP 6 — Cargo Airport & Aerotropolis',
    tagline: 'Aviation Logistics & Multimodal Hub',
    areaHa: tpAreaLabel(6),
    areaSqKm: '~139 sq. km',
    status: 'Sanctioned Preliminary',
    gazetteNotice: 'AAI & DIACL Airport Sanction',
    image: '/maps/schemes/dholera_tp6.jpg',
    villages: ['Navagam', 'Bhadana', 'Bavaliyari'],
    keyRoads: ['109km NE 8 Expressway Airport Loop', '70m Aerotropolis Boulevard'],
    dominantZone: 'Aviation MRO, Air-Cargo Terminals, MMLP Warehousing',
    description: 'Encompasses the Dholera International Airport (Code 4E/4F runways) with air-cargo warehousing, maintenance repair & overhaul (MRO), and free-trade warehousing zones.'
  }
];

const ZONING_SWATCHES = [
  { name: 'Residential Zone (R-1)', color: 'bg-amber-200 border-amber-300 text-amber-950', far: '1.8 Base (Up to 2.5 Chargeable)', road: '12m – 30m', desc: 'Plotted development, low-rise villas & mid-rise condominiums.' },
  { name: 'Commercial Core (C-1)', color: 'bg-purple-200 border-purple-300 text-purple-950', far: '2.5 Base (Up to 4.0 Chargeable)', road: '24m – 70m', desc: 'Corporate headquarters, shopping malls, mixed-use commercial.' },
  { name: 'High-Tech Industrial', color: 'bg-cyan-200 border-cyan-300 text-cyan-950', far: '1.5 Base (Up to 2.2 Chargeable)', road: '30m – 70m', desc: 'Semiconductor fabs, electronic hardware, cleanrooms, robotics.' },
  { name: 'General Industrial (IND)', color: 'bg-rose-200 border-rose-300 text-rose-950', far: '1.2 Base (Up to 1.8 Chargeable)', road: '30m – 55m', desc: 'Heavy engineering, automobile assembly, manufacturing plants.' },
  { name: 'Logistics & Warehousing', color: 'bg-orange-200 border-orange-300 text-orange-950', far: '1.0 Base (Up to 1.5 Chargeable)', road: '45m – 70m', desc: 'Cold storage, container freight stations, airside cargo parks.' },
  { name: 'Recreation & Greenery', color: 'bg-emerald-200 border-emerald-300 text-emerald-950', far: '0.15 (Buffer Parks)', road: 'Linear Canal', desc: 'Stormwater canals, public parks, ecological buffer corridors.' },
];

export default function TownPlanningExplorer() {
  const [selectedId, setSelectedId] = useState<string>('tp1');
  const [opArea, setOpArea] = useState<number>(10000); // 10,000 sq.yd

  const currentScheme = SCHEMES.find(s => s.id === selectedId) || SCHEMES[0];

  // OP to FP Math: ~45% average infrastructure deduction
  const fpArea = Math.round(opArea * 0.55);
  const deductionArea = opArea - fpArea;

  return (
    <div className="space-y-12">
      {/* 1. INTERACTIVE SCHEME DEEP-DIVE TABS */}
      <section className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-blue-700 mb-1">
              <Layers className="w-4 h-4 text-blue-600" />
              <span>Interactive Blueprint Studio</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              Explore Sanctioned Town Planning Schemes (TP 1 to TP 6)
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Click any scheme to inspect its high-resolution gazetted blueprint, dominant zoning, and arterial roads.
            </p>
          </div>

          {/* Scheme Switcher Tabs */}
          <div className="flex flex-wrap gap-1.5 p-1 bg-slate-100 rounded-2xl shrink-0">
            {SCHEMES.map((scheme) => (
              <button
                key={scheme.id}
                type="button"
                onClick={() => setSelectedId(scheme.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition cursor-pointer ${
                  selectedId === scheme.id
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-700 hover:text-slate-900 hover:bg-white/80'
                }`}
              >
                {scheme.id.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Selected Scheme Visual & Detailed Specs */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Blueprint Thumbnail & Zoom Launcher */}
          <div className="lg:col-span-6 relative rounded-2xl overflow-hidden border border-slate-200 group bg-slate-100">
            <div className="relative h-64 sm:h-80 w-full">
              <Image
                src={currentScheme.image}
                alt={`${currentScheme.name} Official Town Planning Blueprint`}
                fill
                className="object-cover group-hover:scale-105 transition duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />

              <div className="absolute top-3 left-3 z-10">
                <span className="px-2.5 py-1 rounded-md bg-white/95 text-slate-900 text-[10px] font-black uppercase tracking-wider shadow-xs">
                  {currentScheme.status}
                </span>
              </div>

              <div className="absolute bottom-3 left-3 right-3 z-10 flex items-center justify-between text-white">
                <div>
                  <span className="text-xs font-black block">{currentScheme.name}</span>
                  <span className="text-[10px] text-slate-200">{currentScheme.tagline}</span>
                </div>
                <Link
                  href={`/map?sid=${currentScheme.sid}`}
                  className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition flex items-center gap-1 shrink-0"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span>Open DeepZoom</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Scheme Specifics Details */}
          <div className="lg:col-span-6 space-y-4">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-blue-700 px-2 py-0.5 rounded-md bg-blue-50 border border-blue-200">
                {currentScheme.gazetteNotice}
              </span>
              <h3 className="text-lg sm:text-xl font-black text-slate-900 mt-1">
                {currentScheme.name}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                {currentScheme.description}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-400 font-bold block uppercase">Total Area</span>
                <span className="font-black text-slate-900 text-sm mt-0.5 block">{currentScheme.areaSqKm}</span>
                <span className="text-[10px] text-slate-500">({currentScheme.areaHa})</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-400 font-bold block uppercase">Dominant Land-Use</span>
                <span className="font-bold text-blue-900 text-xs mt-0.5 block line-clamp-2">{currentScheme.dominantZone}</span>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div>
                <span className="font-bold text-slate-800 block mb-1">Sanctioned Arterial Corridors:</span>
                <div className="flex flex-wrap gap-1.5">
                  {currentScheme.keyRoads.map((r, i) => (
                    <span key={i} className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 font-medium text-[11px]">
                      {r}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <span className="font-bold text-slate-800 block mb-1">Enclosed Revenue Villages:</span>
                <div className="flex flex-wrap gap-1.5">
                  {currentScheme.villages.map((v, i) => (
                    <Link
                      key={i}
                      href={`/village/${v.toLowerCase()}`}
                      className="px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-700 hover:bg-blue-100 transition font-bold text-[11px]"
                    >
                      {v} Village →
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-2 flex items-center gap-3">
              <Link
                href={`/map?sid=${currentScheme.sid}`}
                className="flex-1 h-10 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-1.5"
              >
                <Map className="w-4 h-4" />
                <span>Launch Interactive Scheme Viewer</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 2. DGDCR OFFICIAL ZONING COLOR PALETTE & BUILDING POTENTIAL */}
      <section className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-purple-700 mb-1">
            <Palette className="w-4 h-4 text-purple-600" />
            <span>Statutory Regulations</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900">
            DGDCR 2024 Zoning Color Swatches &amp; Permissible FAR
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Official land-use color definitions standardized on all DSIRDA sanctioned blueprints.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {ZONING_SWATCHES.map((zone, idx) => (
            <div key={idx} className="p-4 rounded-2xl border border-slate-200 bg-slate-50 flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between">
                  <span className={`px-2.5 py-0.5 rounded-md text-xs font-bold border ${zone.color}`}>
                    {zone.name.split('(')[0]}
                  </span>
                  <span className="text-[10px] font-mono font-bold text-slate-500">
                    Road: {zone.road}
                  </span>
                </div>
                <h4 className="text-sm font-black text-slate-900 mt-2">{zone.name}</h4>
                <p className="text-xs text-slate-600 mt-1">{zone.desc}</p>
              </div>

              <div className="pt-2 border-t border-slate-200/80">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Permissible FAR</span>
                <span className="text-xs font-black text-slate-900">{zone.far}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. INTERACTIVE ORIGINAL PLOT (OP) TO FINAL PLOT (FP) RECONSTITUTION CALCULATOR */}
      <section className="bg-gradient-to-br from-blue-50/70 via-slate-50 to-indigo-50/40 rounded-3xl border border-blue-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-blue-100 pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-blue-700 mb-1">
              <RefreshCw className="w-4 h-4 text-blue-600" />
              <span>GTPUD Reconstitution Math</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900">
              OP (Original Plot) to FP (Final Plot) Area Deduction Simulator
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Simulate statutory 40–50% urban infrastructure deductions applied when agricultural land converts to serviced Final Plots.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-6 space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Original Agricultural Plot (OP) Area
                </label>
                <span className="text-xs font-mono font-bold text-blue-700">
                  {opArea.toLocaleString()} sq. yards
                </span>
              </div>
              <input
                type="range"
                min={2000}
                max={50000}
                step={1000}
                value={opArea}
                onChange={(e) => setOpArea(Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>2,000 sq.yd (1.1 Vigha)</span>
                <span>10,000 sq.yd (5.7 Vigha)</span>
                <span>50,000 sq.yd (28 Vigha)</span>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Under Gujarat Town Planning regulations, owners surrender 40–50% of raw land for TP roads, parks, schools, and SCADA infrastructure. In exchange, the remaining 50–60% becomes a <strong>100% Non-Agricultural (NA) clear-title Final Plot (FP)</strong> with four-fold value appreciation.
            </p>
          </div>

          <div className="lg:col-span-6 grid grid-cols-3 gap-3 text-center">
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Original Plot (OP)</span>
              <span className="text-base sm:text-xl font-black text-slate-900 block">{opArea.toLocaleString()}</span>
              <span className="text-[10px] text-slate-500">sq. yards (Raw Farm)</span>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 shadow-2xs space-y-1">
              <span className="text-[10px] font-bold uppercase text-amber-700 block">Deduction (45%)</span>
              <span className="text-base sm:text-xl font-black text-amber-800 block">-{deductionArea.toLocaleString()}</span>
              <span className="text-[10px] text-amber-700">Roads &amp; SCADA</span>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 shadow-2xs space-y-1">
              <span className="text-[10px] font-black uppercase text-emerald-800 block">Final Plot (FP)</span>
              <span className="text-base sm:text-xl font-black text-emerald-900 block">{fpArea.toLocaleString()}</span>
              <span className="text-[10px] text-emerald-700">100% NA Serviced</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
