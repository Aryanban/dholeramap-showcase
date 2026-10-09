'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Plane, 
  Navigation, 
  Clock, 
  ShieldCheck, 
  Train, 
  Truck, 
  ChevronRight, 
  CheckCircle2, 
  Compass, 
  Building2,
  MapPin
} from 'lucide-react';

interface Interchange {
  km: string;
  name: string;
  timeFromAhmd: string;
  connectingRoute: string;
  keyFeature: string;
  tpAccess: string;
}

const INTERCHANGES: Interchange[] = [
  {
    km: '0 km',
    name: 'Ahmedabad SP Ring Road (SPRR)',
    timeFromAhmd: '0 mins (Origin)',
    connectingRoute: 'Sardar Patel Ring Road / SG Highway Junction',
    keyFeature: 'Starting origin point with 8-lane elevated flyovers bypassing city congestion.',
    tpAccess: 'Direct high-speed gateway from Ahmedabad, Sanand, and GIFT City.'
  },
  {
    km: '42 km',
    name: 'Dholka - Kheda Interchange',
    timeFromAhmd: '22 mins',
    connectingRoute: 'State Highway 142 / Kheda Link',
    keyFeature: 'Connects agricultural food processing belts and industrial corridors.',
    tpAccess: 'Major feeder interchange for heavy logistics vehicles.'
  },
  {
    km: '71 km',
    name: 'Fedra Central Toll Interchange',
    timeFromAhmd: '38 mins',
    connectingRoute: 'SH-6 (Bhavnagar Highway) & Pipli Junction',
    keyFeature: 'Key junction bifurcating traffic toward Bhavnagar, Botad, and Dholera SIR.',
    tpAccess: 'Northern gateway to Dholera SIR Town Planning Scheme 1 & 4.'
  },
  {
    km: '92 km',
    name: 'Bhadana Toll Plaza (Core SIR Exit)',
    timeFromAhmd: '50 mins',
    connectingRoute: '250m Central Spine Corridor Access',
    keyFeature: 'Primary entrance to the 22.54 sq. km Activation Area, ABCD Building & Tata Fab.',
    tpAccess: 'Immediate off-ramp to TP 1, TP 2A, and TP 2B high-tech industrial parks.'
  },
  {
    km: '109 km',
    name: 'Navagam International Airport Loop',
    timeFromAhmd: '60 mins',
    connectingRoute: 'Airport Aerotropolis Expressway Spur',
    keyFeature: 'Direct flyover into the passenger terminal departure and cargo handling aprons.',
    tpAccess: 'Connects directly to TP 6 Aerotropolis & Multi-Modal Logistics Hub.'
  }
];

export default function ExpresswayAirportNavigator() {
  const [selectedExit, setSelectedExit] = useState<number>(3); // Default to Bhadana Core
  const currentExit = INTERCHANGES[selectedExit];

  return (
    <div className="space-y-12">
      {/* 1. PANORAMIC AEROTROPOLIS SHOWCASE HERO */}
      <div className="relative rounded-3xl overflow-hidden border border-sky-200/90 bg-white shadow-xl">
        <div className="relative h-72 sm:h-96 w-full">
          <Image
            src="/assets/showcase/dholera_airport_expressway.jpg"
            alt="Dholera International Airport and NE 8 Access Expressway Infrastructure"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-900/30 to-transparent" />
          
          {/* Top Badges */}
          <div className="absolute top-4 left-4 z-10 flex flex-wrap gap-2">
            <span className="px-3 py-1 rounded-full bg-sky-500/95 text-slate-950 font-black text-xs uppercase tracking-wider backdrop-blur-md shadow-sm flex items-center gap-1.5">
              <Plane className="w-3.5 h-3.5" />
              <span>Dholera International Airport (DIAC)</span>
            </span>
            <span className="px-3 py-1 rounded-full bg-white/95 text-slate-900 font-bold text-xs uppercase tracking-wider backdrop-blur-md">
              NE 8 — 109 km Access Corridor
            </span>
          </div>

          <div className="absolute bottom-5 left-5 right-5 z-10 text-white">
            <h2 className="text-xl sm:text-3xl font-black tracking-tight text-white drop-shadow-md">
              45-Minute Connectivity: Ahmedabad to Dholera SIR Core
            </h2>
            <p className="text-xs sm:text-sm text-sky-100 font-medium mt-1 max-w-2xl line-clamp-2 drop-shadow">
              Twin Code 4E/4F international runways, air-cargo logistics park, and access-controlled 4-to-8 lane greenfield expressway.
            </p>
          </div>
        </div>

        {/* Technical Transit Gauge Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-slate-100 bg-slate-50/70 p-4 border-t border-slate-100 text-center">
          <div className="p-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Expressway Length</span>
            <span className="text-base sm:text-lg font-black text-slate-900">109 km</span>
            <span className="text-[10px] text-slate-500 block">Greenfield NE 8</span>
          </div>
          <div className="p-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Travel Speed Limit</span>
            <span className="text-base sm:text-lg font-black text-sky-700">120 km/h</span>
            <span className="text-[10px] text-slate-500 block">Access-Controlled Tollway</span>
          </div>
          <div className="p-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Main Runway Length</span>
            <span className="text-base sm:text-lg font-black text-slate-900">3,200m &amp; 4,000m</span>
            <span className="text-[10px] text-slate-500 block">Code 4E/4F Wide-Body</span>
          </div>
          <div className="p-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Air Cargo Capacity</span>
            <span className="text-base sm:text-lg font-black text-emerald-700">1.5M Tonnes</span>
            <span className="text-[10px] text-slate-500 block">Annual Cargo Throughput</span>
          </div>
        </div>
      </div>

      {/* 2. INTERACTIVE NE 8 EXPRESSWAY MILEPOST INTERCHANGE NAVIGATOR */}
      <section className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-sky-700 mb-1">
            <Navigation className="w-4 h-4 text-sky-600" />
            <span>Interactive Route Guide</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900">
            NE 8 Ahmedabad–Dholera Expressway Interchange Navigator
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Click any interchange to view precise travel times, connecting routes, and direct town planning access ramps.
          </p>
        </div>

        {/* Milepost Stepper Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {INTERCHANGES.map((exit, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setSelectedExit(idx)}
              className={`p-3 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between ${
                selectedExit === idx
                  ? 'bg-sky-50 border-sky-400 ring-2 ring-sky-300/40 shadow-xs'
                  : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-sky-700 font-mono">{exit.km}</span>
                <span className={`w-2 h-2 rounded-full ${selectedExit === idx ? 'bg-sky-600' : 'bg-slate-300'}`} />
              </div>
              <span className="text-xs font-bold text-slate-900 line-clamp-1 mt-1">{exit.name.split('(')[0]}</span>
              <span className="text-[10px] text-slate-500 mt-0.5">{exit.timeFromAhmd}</span>
            </button>
          ))}
        </div>

        {/* Selected Interchange Card */}
        <div className="rounded-2xl bg-gradient-to-br from-sky-50/60 via-slate-50 to-blue-50/30 border border-sky-200 p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-sky-100 pb-3">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-sky-800 px-2 py-0.5 rounded-md bg-sky-100 border border-sky-200">
                {currentExit.km} Milestone
              </span>
              <h4 className="text-lg font-black text-slate-900 mt-1">{currentExit.name}</h4>
              <span className="text-xs text-slate-500 font-medium">{currentExit.connectingRoute}</span>
            </div>
            <div className="text-left sm:text-right">
              <span className="text-[10px] font-bold text-slate-400 block uppercase">Travel Time from Ahmedabad</span>
              <span className="text-base font-black text-sky-900 flex items-center gap-1 sm:justify-end">
                <Clock className="w-4 h-4 text-sky-600" />
                {currentExit.timeFromAhmd}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="bg-white rounded-xl p-4 border border-sky-100 space-y-1">
              <span className="font-bold text-slate-900 block">Key Infrastructure Feature</span>
              <p className="text-slate-600 leading-relaxed">{currentExit.keyFeature}</p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-sky-100 space-y-1">
              <span className="font-bold text-slate-900 block">Town Planning Zone Access</span>
              <p className="text-slate-600 leading-relaxed">{currentExit.tpAccess}</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. DHOLERA INTERNATIONAL AIRPORT (DIAC) RUNWAY & AEROTROPOLIS SPECIFICATIONS */}
      <section className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-indigo-700 mb-1">
            <Plane className="w-4 h-4 text-indigo-600" />
            <span>Aerotropolis Engineering</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900">
            Dholera International Airport: Runway &amp; Cargo Hub Specifications
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Developed by Dholera International Airport Company Limited (DIACL) — a joint venture of AAI (51%), Gujarat Government (33%), and NICDC (16%).
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/80 space-y-3">
            <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center font-black">
              01
            </div>
            <h4 className="text-sm font-black text-slate-900">Primary Runway (Phase 1)</h4>
            <ul className="space-y-1.5 text-xs text-slate-600">
              <li>• Length: <strong>3,200 metres</strong> (10,500 ft)</li>
              <li>• Width: <strong>45 metres</strong> standard asphalt</li>
              <li>• Category: <strong>Code 4E</strong> compliance</li>
              <li>• Aircraft: Boeing 777-300ER, Airbus A350, Dreamliner</li>
              <li>• Operations: 24x7 all-weather CAT-III ILS avionics</li>
            </ul>
          </div>

          <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/80 space-y-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-black">
              02
            </div>
            <h4 className="text-sm font-black text-slate-900">Secondary Mega Runway (Phase 2)</h4>
            <ul className="space-y-1.5 text-xs text-slate-600">
              <li>• Length: <strong>4,000 metres</strong> (13,123 ft)</li>
              <li>• Width: <strong>60 metres</strong> heavy load-bearing</li>
              <li>• Category: <strong>Code 4F</strong> maximum civil spec</li>
              <li>• Aircraft: Airbus A380 &amp; Antonov An-124 cargo</li>
              <li>• Spacing: Parallel runway for simultaneous takeoffs</li>
            </ul>
          </div>

          <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/80 space-y-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-black">
              03
            </div>
            <h4 className="text-sm font-black text-slate-900">MMLP Air Cargo Terminal</h4>
            <ul className="space-y-1.5 text-xs text-slate-600">
              <li>• Footprint: <strong>1,426 Hectares</strong> dedicated cargo zone</li>
              <li>• Cold-Chain: Perishable agricultural &amp; pharma docks</li>
              <li>• Direct Railway: Dedicated airside freight siding</li>
              <li>• Semiconductor Bay: Vibration-free clean cargo handling</li>
              <li>• Clearance: On-site digital customs &amp; bonded warehouse</li>
            </ul>
          </div>
        </div>
      </section>

      {/* 4. VANDE METRO RAPID TRANSIT CORRIDOR */}
      <section className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-indigo-800/80 pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-sky-400 mb-1">
              <Train className="w-4 h-4 text-sky-400" />
              <span>Mass Rapid Transit (MRTS)</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white">
              Ahmedabad–Dholera Vande Metro Rail Link
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
              100 km elevated commuter railway running along the Expressway right-of-way (ROW).
            </p>
          </div>
          <span className="px-3.5 py-1.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-400/30 text-xs font-black tracking-wide shrink-0">
            Speed: 160 km/h · 40 Mins Transit
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-white/10 border border-white/10">
            <span className="text-[10px] text-sky-300 font-bold block uppercase">Station 1</span>
            <span className="text-sm font-black text-white mt-0.5 block">Kalupur Central</span>
            <p className="text-[11px] text-slate-300 mt-1">Interchange with Mumbai–Ahmedabad Bullet Train.</p>
          </div>
          <div className="p-3.5 rounded-xl bg-white/10 border border-white/10">
            <span className="text-[10px] text-sky-300 font-bold block uppercase">Station 2</span>
            <span className="text-sm font-black text-white mt-0.5 block">APMC / Vasna</span>
            <p className="text-[11px] text-slate-300 mt-1">Ahmedabad Metro Phase 1 north-south line integration.</p>
          </div>
          <div className="p-3.5 rounded-xl bg-white/10 border border-white/10">
            <span className="text-[10px] text-sky-300 font-bold block uppercase">Station 3</span>
            <span className="text-sm font-black text-white mt-0.5 block">Dholera Airport</span>
            <p className="text-[11px] text-slate-300 mt-1">Direct underground transit terminal inside departures.</p>
          </div>
          <div className="p-3.5 rounded-xl bg-white/10 border border-white/10">
            <span className="text-[10px] text-sky-300 font-bold block uppercase">Station 4</span>
            <span className="text-sm font-black text-white mt-0.5 block">ABCD Central Hub</span>
            <p className="text-[11px] text-slate-300 mt-1">Terminal hub inside the TP 2 administrative district.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
