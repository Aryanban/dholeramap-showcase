'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Calculator, 
  TrendingUp, 
  DollarSign, 
  CheckCircle2, 
  HelpCircle, 
  ShieldCheck, 
  ArrowRight, 
  Building2, 
  Scale, 
  PieChart,
  Percent
} from 'lucide-react';

interface SchemeRate {
  id: string;
  name: string;
  baseRateSqYd: number;
  jantriRateSqm: number;
  zoneType: string;
  highlights: string;
}

const SCHEME_RATES: SchemeRate[] = [
  {
    id: 'tp1',
    name: 'TP 1 — High-Access Residential & Knowledge',
    baseRateSqYd: 9500,
    jantriRateSqm: 1850,
    zoneType: 'Residential R-1 / Knowledge Core',
    highlights: 'High livability index, 55m ring roads, educational campuses.'
  },
  {
    id: 'tp2',
    name: 'TP 2 — Activation Area (High-Tech & Fab Core)',
    baseRateSqYd: 14500,
    jantriRateSqm: 2450,
    zoneType: 'High-Tech Industrial & Commercial',
    highlights: 'Home to ₹91,000 Cr Tata Semiconductor Fab and ABCD Building.'
  },
  {
    id: 'tp3',
    name: 'TP 3 — City Centre & Commercial Hub',
    baseRateSqYd: 11000,
    jantriRateSqm: 2100,
    zoneType: 'Commercial C-1 / Mixed-Use',
    highlights: 'Central Business District, corporate headquarters, retail.'
  },
  {
    id: 'tp4',
    name: 'TP 4 — Solar Park & Knowledge Corridor',
    baseRateSqYd: 7800,
    jantriRateSqm: 1600,
    zoneType: 'Green Tech & Solar Logistics',
    highlights: '5000MW Ultra Mega Solar Park buffer, research parks.'
  },
  {
    id: 'tp5',
    name: 'TP 5 — Heavy Manufacturing & Expressway Spine',
    baseRateSqYd: 8900,
    jantriRateSqm: 1750,
    zoneType: 'Heavy Industrial / Manufacturing',
    highlights: 'Large contiguous industrial mega-parcels, direct spine link.'
  },
  {
    id: 'tp6',
    name: 'TP 6 — Cargo Airport & Aerotropolis',
    baseRateSqYd: 12500,
    jantriRateSqm: 2200,
    zoneType: 'Aviation Logistics & MMLP',
    highlights: 'Direct runway abutting parcels, air-cargo warehousing.'
  },
  {
    id: 'outside',
    name: 'Outside-TP 22 Villages Agricultural Land',
    baseRateSqYd: 3200,
    jantriRateSqm: 850,
    zoneType: 'Agricultural / Future TP Phase',
    highlights: 'Long-term land banking before Town Planning reconstitution.'
  }
];

const CORRIDORS = [
  { id: '250m', name: '250m Expressway Central Spine Frontage', multiplier: 1.35, desc: '+35% premium for maximum visibility & FAR' },
  { id: '70m', name: '70m/55m Sanctioned Arterial Corridor', multiplier: 1.20, desc: '+20% premium for commercial access' },
  { id: '30m', name: '30m Sub-Arterial Sector Road', multiplier: 1.00, desc: 'Standard baseline town planning road' },
  { id: '18m', name: '18m/12m Internal Residential Road', multiplier: 0.90, desc: 'Quiet residential access (-10% cost)' },
];

export default function PlotPriceCalculator() {
  const [selectedSchemeId, setSelectedSchemeId] = useState<string>('tp2');
  const [areaSqYd, setAreaSqYd] = useState<number>(500);
  const [corridorId, setCorridorId] = useState<string>('70m');
  const [isFemaleOwner, setIsFemaleOwner] = useState<boolean>(false);

  const currentScheme = SCHEME_RATES.find(s => s.id === selectedSchemeId) || SCHEME_RATES[0];
  const currentCorridor = CORRIDORS.find(c => c.id === corridorId) || CORRIDORS[1];

  const calculation = useMemo(() => {
    const effectiveRate = Math.round(currentScheme.baseRateSqYd * currentCorridor.multiplier);
    const grossLandValue = Math.round(effectiveRate * areaSqYd);
    
    // Gujarat Revenue Department Stamp Duty: Male 4.9%, Female 3.9%
    const stampDutyRate = isFemaleOwner ? 0.039 : 0.049;
    const stampDuty = Math.round(grossLandValue * stampDutyRate);
    
    // Gujarat Registration surcharge: 1%
    const registrationFee = Math.round(grossLandValue * 0.01);
    
    // Estimated legal diligence & AnyRoR title search reserve
    const legalTitleFee = 25000;
    
    const totalOutlay = grossLandValue + stampDuty + registrationFee + legalTitleFee;

    // Convert gross and total to Lakhs / Crores string
    const formatINR = (val: number) => {
      if (val >= 10000000) {
        return `₹${(val / 10000000).toFixed(2)} Cr`;
      }
      return `₹${(val / 100000).toFixed(2)} Lakh`;
    };

    return {
      effectiveRate,
      grossLandValue,
      grossFormatted: formatINR(grossLandValue),
      stampDuty,
      stampDutyFormatted: `₹${(stampDuty / 1000).toFixed(0)}k`,
      stampDutyRateText: isFemaleOwner ? '3.9% (Female Concession)' : '4.9% (Standard Male)',
      registrationFee,
      registrationFormatted: `₹${(registrationFee / 1000).toFixed(0)}k`,
      legalTitleFee,
      totalOutlay,
      totalFormatted: formatINR(totalOutlay),
    };
  }, [currentScheme, currentCorridor, areaSqYd, isFemaleOwner]);

  return (
    <div className="space-y-12">
      {/* 1. FINANCIAL EXECUTIVE PRESENTATION HERO */}
      <div className="relative rounded-3xl overflow-hidden border border-emerald-200/90 bg-white shadow-xl">
        <div className="relative h-72 sm:h-96 w-full">
          <Image
            src="/assets/showcase/dholera_investment_board.jpg"
            alt="Dholera Smart City Land Investment Valuation Board and Rate Card"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-900/30 to-transparent" />
          
          {/* Top Badges */}
          <div className="absolute top-4 left-4 z-10 flex flex-wrap gap-2">
            <span className="px-3 py-1 rounded-full bg-emerald-500/95 text-slate-950 font-black text-xs uppercase tracking-wider backdrop-blur-md shadow-sm flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>2026 Valuation Index</span>
            </span>
            <span className="px-3 py-1 rounded-full bg-white/95 text-slate-900 font-bold text-xs uppercase tracking-wider backdrop-blur-md">
              Gujarat Jantri vs Open Market Rate Card
            </span>
          </div>

          <div className="absolute bottom-5 left-5 right-5 z-10 text-white">
            <h2 className="text-xl sm:text-3xl font-black tracking-tight text-white drop-shadow-md">
              Statutory 2026 Land Pricing &amp; Acquisition Matrix
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100 font-medium mt-1 max-w-2xl line-clamp-2 drop-shadow">
              Empirical rate evaluation across TP 1 to TP 6 schemes, roadside frontage premiums, and Gujarat Revenue Department stamp duty concessions.
            </p>
          </div>
        </div>

        {/* Live Market Benchmark Ticker */}
        <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-slate-100 bg-slate-50/70 p-4 border-t border-slate-100 text-center">
          <div className="p-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">TP 2 Activation Benchmark</span>
            <span className="text-base sm:text-lg font-black text-emerald-800">₹12k – ₹18k</span>
            <span className="text-[10px] text-slate-500 block">per Sq. Yard (FP Sanctioned)</span>
          </div>
          <div className="p-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">TP 1 Residential Median</span>
            <span className="text-base sm:text-lg font-black text-slate-900">₹8.5k – ₹12k</span>
            <span className="text-[10px] text-slate-500 block">per Sq. Yard (R-1 Zone)</span>
          </div>
          <div className="p-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">5-Year Capital Appreciation</span>
            <span className="text-base sm:text-lg font-black text-emerald-700">28.4% CAGR</span>
            <span className="text-[10px] text-slate-500 block">Since Expressway Groundwork</span>
          </div>
          <div className="p-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Gujarat Stamp Duty Rate</span>
            <span className="text-base sm:text-lg font-black text-slate-900">4.9% / 3.9%</span>
            <span className="text-[10px] text-slate-500 block">+1% Registration Fee</span>
          </div>
        </div>
      </div>

      {/* 2. INTERACTIVE 2026 PLOT ACQUISITION & OUTLAY CALCULATOR */}
      <section className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-emerald-700 mb-1">
            <Calculator className="w-4 h-4 text-emerald-600" />
            <span>Interactive Financial Engine</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900">
            2026 Plot Acquisition &amp; Statutory Outlay Calculator
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Configure your scheme, parcel dimensions, and road frontage to calculate true acquisition costs including Gujarat state government duties.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Controls Column */}
          <div className="lg:col-span-7 space-y-5">
            {/* Scheme Selector */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">
                Select Town Planning Scheme
              </label>
              <select
                value={selectedSchemeId}
                onChange={(e) => setSelectedSchemeId(e.target.value)}
                className="w-full h-11 rounded-xl border border-slate-200 px-3 text-xs sm:text-sm outline-none bg-slate-50 focus:border-emerald-500 focus:bg-white transition"
              >
                {SCHEME_RATES.map((scheme) => (
                  <option key={scheme.id} value={scheme.id}>
                    {scheme.name} (Base ~₹{scheme.baseRateSqYd.toLocaleString()}/sq.yd)
                  </option>
                ))}
              </select>
              <span className="text-[11px] text-slate-400 mt-1 block">
                {currentScheme.highlights}
              </span>
            </div>

            {/* Plot Area Slider & Input */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Plot Area in Square Yards (Var)
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-emerald-700">
                    {(areaSqYd / 1742).toFixed(2)} Vigha
                  </span>
                  <span className="text-xs text-slate-400">|</span>
                  <span className="text-xs font-mono font-bold text-slate-900">
                    {areaSqYd.toLocaleString()} sq.yd
                  </span>
                </div>
              </div>
              <input
                type="range"
                min={100}
                max={5000}
                step={50}
                value={areaSqYd}
                onChange={(e) => setAreaSqYd(Number(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>100 sq.yd (Sub-plot)</span>
                <span>500 sq.yd (Villa Plot)</span>
                <span>1,500 sq.yd (Commercial)</span>
                <span>5,000 sq.yd (Industrial)</span>
              </div>
            </div>

            {/* Road Corridor Frontage Selector */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">
                Abutting Road Frontage Category
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {CORRIDORS.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setCorridorId(c.id)}
                    className={`p-3 rounded-xl border text-left text-xs transition cursor-pointer flex flex-col justify-between ${
                      corridorId === c.id
                        ? 'bg-emerald-50 border-emerald-500 ring-1 ring-emerald-400/40 text-emerald-950 shadow-2xs'
                        : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                    }`}
                  >
                    <span className="font-bold">{c.name}</span>
                    <span className="text-[10px] text-slate-400 mt-1">{c.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Female Buyer Concession Toggle */}
            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-800 block">Female Ownership Concession</span>
                <span className="text-[11px] text-slate-500">Gujarat Revenue Code offers a 1.0% concession on stamp duty (3.9% vs 4.9%).</span>
              </div>
              <input
                type="checkbox"
                checked={isFemaleOwner}
                onChange={(e) => setIsFemaleOwner(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer shrink-0"
              />
            </div>
          </div>

          {/* Results Summary Box */}
          <div className="lg:col-span-5 bg-gradient-to-br from-emerald-50/80 via-slate-50 to-blue-50/40 rounded-2xl border border-emerald-200 p-6 flex flex-col justify-between space-y-6">
            <div>
              <div className="flex items-center justify-between border-b border-emerald-200/80 pb-3">
                <span className="text-xs font-black uppercase tracking-wider text-emerald-800">
                  Acquisition Cost Breakdown
                </span>
                <span className="text-xs font-mono font-bold text-slate-700">
                  ₹{calculation.effectiveRate.toLocaleString()} / sq.yd
                </span>
              </div>

              <div className="divide-y divide-emerald-100 text-xs mt-3">
                <div className="py-2.5 flex items-center justify-between">
                  <span className="text-slate-600">Base Land Value ({areaSqYd} sq.yd)</span>
                  <span className="font-black text-slate-900">{calculation.grossFormatted}</span>
                </div>
                <div className="py-2.5 flex items-center justify-between">
                  <div>
                    <span className="text-slate-600 block">Gujarat Stamp Duty</span>
                    <span className="text-[10px] text-slate-400">{calculation.stampDutyRateText}</span>
                  </div>
                  <span className="font-bold text-slate-800">{calculation.stampDutyFormatted}</span>
                </div>
                <div className="py-2.5 flex items-center justify-between">
                  <span className="text-slate-600">State Registration Fee (1.0%)</span>
                  <span className="font-bold text-slate-800">{calculation.registrationFormatted}</span>
                </div>
                <div className="py-2.5 flex items-center justify-between">
                  <span className="text-slate-600">AnyRoR &amp; Title Verification Fund</span>
                  <span className="font-bold text-slate-800">₹25,000</span>
                </div>
              </div>
            </div>

            {/* Total Highlight */}
            <div className="pt-4 border-t border-emerald-300/80">
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 block">
                Total Estimated All-In Acquisition Budget
              </span>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-2xl sm:text-3xl font-black text-emerald-950">
                  {calculation.totalFormatted}
                </span>
                <span className="text-xs font-semibold text-slate-500">
                  (Includes all taxes)
                </span>
              </div>

              <Link
                href="/brokers"
                className="mt-4 w-full h-10 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Connect with Verified Brokers in {currentScheme.id.toUpperCase()}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 3. MULTI-REGION GUJARAT INDUSTRIAL YIELD COMPARISON */}
      <section className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-blue-700 mb-1">
            <Scale className="w-4 h-4 text-blue-600" />
            <span>Regional Valuation Benchmark</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900">
            Dholera SIR vs. Gujarat Economic Hubs (2026 Comparison)
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            How Dholera’s entry valuations compare against mature nodes like GIFT City, Sanand Auto Hub, and Changodar.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl border-2 border-emerald-500 bg-emerald-50/30 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-emerald-600 text-white">Recommended</span>
              <span className="text-xs font-black text-emerald-700">Highest Alpha</span>
            </div>
            <h4 className="text-base font-black text-slate-900 mt-1">Dholera SIR</h4>
            <span className="text-xs text-slate-600 block">Entry: <strong>₹8k – ₹18k / sq.yd</strong></span>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Early-stage greenfield node with maximum statutory reconstitution upside and central government mega-investments.
            </p>
          </div>

          <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50 space-y-2">
            <span className="text-[10px] font-bold uppercase text-slate-400 block">Mature Node</span>
            <h4 className="text-base font-black text-slate-900">Sanand Industrial</h4>
            <span className="text-xs text-slate-600 block">Entry: <strong>₹25k – ₹35k / sq.yd</strong></span>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Established automotive hub (Tata Motors, Micron ATMP). Limited contiguous industrial land remaining.
            </p>
          </div>

          <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50 space-y-2">
            <span className="text-[10px] font-bold uppercase text-slate-400 block">Financial Core</span>
            <h4 className="text-base font-black text-slate-900">GIFT City</h4>
            <span className="text-xs text-slate-600 block">Entry: <strong>₹55k – ₹90k / sq.yd</strong></span>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Premium high-rise financial services SEZ. High entry ticket size tailored for institutional developers.
            </p>
          </div>

          <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50 space-y-2">
            <span className="text-[10px] font-bold uppercase text-slate-400 block">Logistics Hub</span>
            <h4 className="text-base font-black text-slate-900">Changodar</h4>
            <span className="text-xs text-slate-600 block">Entry: <strong>₹18k – ₹28k / sq.yd</strong></span>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Primary warehousing and pharmaceutical freight corridor on NH-8A. Stable moderate appreciation.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
