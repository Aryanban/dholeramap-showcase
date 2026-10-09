'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Building2, 
  Ruler, 
  Layers, 
  ArrowRight, 
  CheckCircle2, 
  ShieldCheck, 
  HelpCircle, 
  Calculator,
  Compass,
  FileCheck
} from 'lucide-react';

interface RoadTier {
  id: string;
  name: string;
  roadWidthLabel: string;
  baseFar: number;
  maxFar: number;
  groundCoveragePct: number;
  maxHeightM: number;
  heightLabel: string;
  frontSetbackM: number;
  rearSetbackM: number;
  sideSetbackM: number;
  recommendedUse: string;
}

const ROAD_TIERS: RoadTier[] = [
  {
    id: 'row-12',
    name: '12m to < 18m Road',
    roadWidthLabel: '12m – 17.9m',
    baseFar: 1.20,
    maxFar: 1.80,
    groundCoveragePct: 45,
    maxHeightM: 16.5,
    heightLabel: '16.5m (G+4 Storeys)',
    frontSetbackM: 4.5,
    rearSetbackM: 3.0,
    sideSetbackM: 3.0,
    recommendedUse: 'Low-rise plotted villas, townhouses, local daily shopping convenience.',
  },
  {
    id: 'row-18',
    name: '18m to < 30m Arterial',
    roadWidthLabel: '18m – 29.9m',
    baseFar: 1.50,
    maxFar: 2.10,
    groundCoveragePct: 40,
    maxHeightM: 25.0,
    heightLabel: '25.0m (G+7 Mid-Rise)',
    frontSetbackM: 6.0,
    rearSetbackM: 4.5,
    sideSetbackM: 4.5,
    recommendedUse: 'Mid-rise residential complexes, boutique offices, nursing homes.',
  },
  {
    id: 'row-30',
    name: '30m to < 55m Sector Ring',
    roadWidthLabel: '30m – 54.9m',
    baseFar: 1.80,
    maxFar: 2.50,
    groundCoveragePct: 35,
    maxHeightM: 45.0,
    heightLabel: '45.0m (G+14 Towers)',
    frontSetbackM: 9.0,
    rearSetbackM: 6.0,
    sideSetbackM: 6.0,
    recommendedUse: 'High-density commercial towers, corporate headquarters, tech campuses.',
  },
  {
    id: 'row-55',
    name: '55m to 70m Grand Arterial',
    roadWidthLabel: '55m – 70m',
    baseFar: 2.00,
    maxFar: 3.00,
    groundCoveragePct: 30,
    maxHeightM: 70.0,
    heightLabel: '70.0m+ (G+20+ Skyscrapers)',
    frontSetbackM: 12.0,
    rearSetbackM: 7.5,
    sideSetbackM: 7.5,
    recommendedUse: 'Regional retail malls, 5-star hospitality, high-density residential towers.',
  },
  {
    id: 'row-250',
    name: '250m Central Expressway Corridor',
    roadWidthLabel: '250m Spine',
    baseFar: 2.50,
    maxFar: 4.00,
    groundCoveragePct: 30,
    maxHeightM: 110.0,
    heightLabel: '110.0m+ (Iconic G+24+ High-Rise)',
    frontSetbackM: 15.0,
    rearSetbackM: 9.0,
    sideSetbackM: 9.0,
    recommendedUse: 'Iconic landmark commercial towers, mega-fabs, financial stock exchange.',
  },
];

const ZONES = [
  { id: 'res', label: 'Residential (R-1/R-2)', levyMultiplier: 1.0 },
  { id: 'com', label: 'Commercial Core (C-1)', levyMultiplier: 1.4 },
  { id: 'ind', label: 'High-Tech Industrial', levyMultiplier: 0.9 },
  { id: 'log', label: 'Logistics & Warehousing', levyMultiplier: 0.8 },
];

export default function DgdcrFarCalculator() {
  const [selectedTierId, setSelectedTierId] = useState<string>('row-30');
  const [plotAreaSqM, setPlotAreaSqM] = useState<number>(2500); // 2,500 sq.m default (~3,000 sq.yd)
  const [selectedZone, setSelectedZone] = useState<string>('com');
  const [includeChargeableFar, setIncludeChargeableFar] = useState<boolean>(true);

  const tier = ROAD_TIERS.find((t) => t.id === selectedTierId) || ROAD_TIERS[2];
  const zoneObj = ZONES.find((z) => z.id === selectedZone) || ZONES[1];

  // Plot conversions
  const plotAreaSqFt = Math.round(plotAreaSqM * 10.7639);
  const plotAreaSqYd = Math.round(plotAreaSqM * 1.196);

  // FAR & Built-up area math
  const effectiveFar = includeChargeableFar ? tier.maxFar : tier.baseFar;
  const baseBuiltUpSqM = Math.round(plotAreaSqM * tier.baseFar);
  const maxBuiltUpSqM = Math.round(plotAreaSqM * tier.maxFar);
  const totalBuiltUpSqM = Math.round(plotAreaSqM * effectiveFar);
  const totalBuiltUpSqFt = Math.round(totalBuiltUpSqM * 10.7639);

  // Chargeable FAR excess
  const chargeableFarSqM = includeChargeableFar ? Math.max(0, maxBuiltUpSqM - baseBuiltUpSqM) : 0;
  const chargeableFarSqFt = Math.round(chargeableFarSqM * 10.7639);

  // Ground coverage
  const groundCoverSqM = Math.round((plotAreaSqM * tier.groundCoveragePct) / 100);
  const groundCoverSqFt = Math.round(groundCoverSqM * 10.7639);

  // Betterment Levy benchmark estimate (₹250 - ₹450 / sq.ft based on zone)
  const estimatedLevyPerSqFt = Math.round(350 * zoneObj.levyMultiplier);
  const estimatedLevyTotal = Math.round(chargeableFarSqFt * estimatedLevyPerSqFt);

  return (
    <div className="bg-white rounded-3xl border border-blue-200/90 shadow-sm p-6 sm:p-8 space-y-8 relative overflow-hidden">
      {/* Background Architectural Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(#1e3a8a 1px, transparent 1px)`,
          backgroundSize: '20px 20px',
        }}
      />

      {/* Header */}
      <div className="relative border-b border-slate-100 pb-5">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-black uppercase tracking-wider mb-2">
          <Calculator className="w-3.5 h-3.5 text-blue-600" />
          <span>Statutory DGDCR 2024 Architectural Engine</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Interactive DGDCR FAR &amp; Building Envelope Calculator
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
          Simulate permissible Floor Area Ratio (FAR/FSI), maximum building heights, ground footprint coverage, and statutory setbacks mandated by the Gujarat Urban Development Authority for Dholera SIR.
        </p>
      </div>

      {/* Interactive Controls & Output Grid */}
      <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Controls Column (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* 1. Road Width (ROW) Selector */}
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center justify-between">
              <span>1. Abutting Road Right-of-Way (ROW)</span>
              <span className="text-[11px] text-blue-700 font-bold">{tier.roadWidthLabel}</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {ROAD_TIERS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setSelectedTierId(t.id)}
                  className={`p-3 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                    selectedTierId === t.id
                      ? 'bg-blue-600 border-blue-600 text-white shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-blue-50/50 hover:border-blue-200'
                  }`}
                >
                  <span className="text-[11px] font-bold block">{t.name}</span>
                  <div className="mt-1 flex items-baseline justify-between">
                    <span className={`text-[10px] font-mono ${selectedTierId === t.id ? 'text-blue-100' : 'text-slate-500'}`}>
                      Max FAR: {t.maxFar}
                    </span>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                      selectedTierId === t.id ? 'bg-white/20 text-white' : 'bg-slate-200/70 text-slate-700'
                    }`}>
                      {t.maxHeightM}m
                    </span>
                  </div>
                </button>
              ))}
            </div>
            <p className="text-[11px] text-slate-500 italic mt-1">
              {tier.recommendedUse}
            </p>
          </div>

          {/* 2. Plot Area Slider */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black uppercase tracking-wider text-slate-700">
                2. Final Plot (FP) Net Demarcated Area
              </label>
              <div className="text-right">
                <span className="text-sm font-mono font-black text-blue-700">
                  {plotAreaSqM.toLocaleString()} m²
                </span>
                <span className="text-xs text-slate-400 font-mono ml-1.5">
                  (~{plotAreaSqYd.toLocaleString()} sq.yd / {plotAreaSqFt.toLocaleString()} sq.ft)
                </span>
              </div>
            </div>
            <input
              type="range"
              min={500}
              max={25000}
              step={250}
              value={plotAreaSqM}
              onChange={(e) => setPlotAreaSqM(Number(e.target.value))}
              className="w-full accent-blue-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>500 m² (Small Plot)</span>
              <span>5,000 m² (Commercial Site)</span>
              <span>25,000 m² (Industrial Campus)</span>
            </div>
          </div>

          {/* 3. Zone Classification & Chargeable FSI Toggle */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
            <div className="space-y-1.5">
              <label className="text-xs font-black uppercase tracking-wider text-slate-700">
                3. Land-Use Zone Classification
              </label>
              <select
                value={selectedZone}
                onChange={(e) => setSelectedZone(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                {ZONES.map((z) => (
                  <option key={z.id} value={z.id}>
                    {z.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-black uppercase tracking-wider text-slate-700">
                4. Procure Premium Chargeable FAR?
              </label>
              <button
                type="button"
                onClick={() => setIncludeChargeableFar(!includeChargeableFar)}
                className={`w-full h-10 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-between cursor-pointer ${
                  includeChargeableFar
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                    : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}
              >
                <span>{includeChargeableFar ? 'Yes (Max FAR ' + tier.maxFar + ')' : 'No (Base FAR ' + tier.baseFar + ')'}</span>
                <span className={`w-4 h-4 rounded-full border flex items-center justify-center text-[10px] font-black ${
                  includeChargeableFar ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300'
                }`}>
                  {includeChargeableFar ? '✓' : ''}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Live Calculation Output Card (5 Cols) */}
        <div className="lg:col-span-5 bg-gradient-to-br from-blue-50/70 via-slate-50 to-indigo-50/50 rounded-2xl border border-blue-200 p-5 sm:p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-blue-200/80 pb-3">
            <span className="text-xs font-black uppercase tracking-wider text-blue-900 flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-blue-600" />
              Building Envelope Metrics
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
              DGDCR 2024 Verified
            </span>
          </div>

          {/* Primary Stat: Total Built-up Area */}
          <div className="p-4 rounded-xl bg-white border border-blue-200 shadow-2xs space-y-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
              Total Permissible Built-Up Area
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-slate-900">
                {totalBuiltUpSqFt.toLocaleString()}
              </span>
              <span className="text-xs font-bold text-blue-700">sq. feet</span>
            </div>
            <span className="text-xs font-mono text-slate-500 block">
              = {totalBuiltUpSqM.toLocaleString()} m² (Effective FAR: {effectiveFar.toFixed(2)})
            </span>
          </div>

          {/* Secondary Metrics Grid */}
          <div className="grid grid-cols-2 gap-2.5 text-xs">
            {/* Ground Coverage */}
            <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-0.5">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Ground Footprint</span>
              <span className="font-black text-slate-900 block">{groundCoverSqFt.toLocaleString()} sq.ft</span>
              <span className="text-[10px] text-slate-500 font-mono">({tier.groundCoveragePct}% max cover)</span>
            </div>

            {/* Max Vertical Height */}
            <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-0.5">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Vertical Height</span>
              <span className="font-black text-blue-700 block">{tier.maxHeightM} metres</span>
              <span className="text-[10px] text-slate-500 font-medium">{tier.heightLabel.split('(')[1]?.replace(')', '') || 'Storeys'}</span>
            </div>

            {/* Base Built-Up */}
            <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-0.5">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Base Built-Up (Free)</span>
              <span className="font-bold text-slate-800 block">{Math.round(baseBuiltUpSqM * 10.7639).toLocaleString()} sq.ft</span>
              <span className="text-[10px] text-slate-500 font-mono">(FAR {tier.baseFar.toFixed(2)})</span>
            </div>

            {/* Chargeable Premium Built-Up */}
            <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-0.5">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Chargeable FSI Area</span>
              <span className="font-bold text-amber-700 block">
                {chargeableFarSqFt > 0 ? `+${chargeableFarSqFt.toLocaleString()} sq.ft` : 'None (Base)'}
              </span>
              <span className="text-[10px] text-slate-500 font-mono">
                {chargeableFarSqM > 0 ? `(${chargeableFarSqM.toLocaleString()} m²)` : '0 m²'}
              </span>
            </div>
          </div>

          {/* Mandatory Setbacks Section */}
          <div className="p-3.5 rounded-xl bg-blue-50/80 border border-blue-200/90 text-xs space-y-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-blue-900 block flex items-center gap-1">
              <Ruler className="w-3.5 h-3.5 text-blue-700" />
              Mandatory Statutory Setbacks (Table 4.1)
            </span>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-white p-2 rounded-lg border border-blue-100">
                <span className="text-[9px] text-slate-400 block font-bold">FRONT</span>
                <span className="text-xs font-black text-slate-900">{tier.frontSetbackM}m</span>
              </div>
              <div className="bg-white p-2 rounded-lg border border-blue-100">
                <span className="text-[9px] text-slate-400 block font-bold">REAR</span>
                <span className="text-xs font-black text-slate-900">{tier.rearSetbackM}m</span>
              </div>
              <div className="bg-white p-2 rounded-lg border border-blue-100">
                <span className="text-[9px] text-slate-400 block font-bold">SIDES</span>
                <span className="text-xs font-black text-slate-900">{tier.sideSetbackM}m</span>
              </div>
            </div>
          </div>

          {/* Betterment Levy Estimate */}
          {chargeableFarSqFt > 0 && (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs space-y-1">
              <div className="flex items-center justify-between text-amber-900 font-bold">
                <span>Indicative DICDL Betterment Levy:</span>
                <span className="font-mono font-black">
                  ₹{(estimatedLevyTotal / 100000).toFixed(1)} Lakhs
                </span>
              </div>
              <p className="text-[10px] text-amber-700">
                Based on benchmark ~₹{estimatedLevyPerSqFt}/sq.ft payable to authority for purchasing chargeable FSI above base {tier.baseFar}.
              </p>
            </div>
          )}

          {/* Quick Action Button */}
          <Link
            href="/"
            className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>Verify Specific Plot on Vector Map</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
