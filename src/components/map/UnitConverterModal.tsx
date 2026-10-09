'use client';

import React, { useState } from 'react';
import { X, Calculator, ArrowRightLeft } from 'lucide-react';
import { useApp } from '@/lib/store';
import {
  convertFromSqMeters,
  convertFromSqYards,
  convertFromVigha,
  formatArea,
} from '@/lib/land-units';

type UnitType = 'sqYards' | 'sqMeters' | 'vigha' | 'acres' | 'sqFeet';

export default function UnitConverterModal() {
  const { unitConverterOpen, setUnitConverterOpen } = useApp();
  const [val, setVal] = useState<string>('1000');
  const [unit, setUnit] = useState<UnitType>('sqYards');

  if (!unitConverterOpen) return null;

  const num = parseFloat(val) || 0;
  let res = convertFromSqYards(num);
  if (unit === 'sqMeters') res = convertFromSqMeters(num);
  else if (unit === 'vigha') res = convertFromVigha(num);
  else if (unit === 'acres') res = convertFromSqMeters(num * 4046.856);
  else if (unit === 'sqFeet') res = convertFromSqMeters(num / 10.7639);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden text-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-purple-50/50">
          <div className="flex items-center gap-2 text-purple-900 font-semibold text-base">
            <Calculator className="w-5 h-5 text-purple-600" />
            <h3>Gujarat Land Unit Converter</h3>
          </div>
          <button
            onClick={() => setUnitConverterOpen(false)}
            className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-700 hover:bg-white transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Input & Unit Row */}
          <div className="flex gap-2.5">
            <div className="flex-1">
              <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Enter Plot Size
              </label>
              <input
                type="number"
                value={val}
                onChange={(e) => setVal(e.target.value)}
                placeholder="1000"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-mono text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
              />
            </div>
            <div className="w-40">
              <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Unit
              </label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value as UnitType)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 cursor-pointer"
              >
                <option value="sqYards">Sq. Yards (Vaar)</option>
                <option value="sqMeters">Sq. Meters</option>
                <option value="vigha">Vigha (Ahmedabad)</option>
                <option value="acres">Acres</option>
                <option value="sqFeet">Sq. Feet</option>
              </select>
            </div>
          </div>

          {/* Results Grid */}
          <div className="rounded-xl border border-purple-100 bg-purple-50/30 p-3.5 space-y-2.5">
            <div className="text-[11px] font-semibold text-purple-900 uppercase tracking-wider flex items-center justify-between">
              <span>Standard Regional Conversion</span>
              <span className="text-[10px] text-purple-600 font-normal">Dholera SIR / GTPUD</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-white p-2.5 rounded-lg border border-purple-100/60 shadow-xs">
                <span className="text-[10px] text-slate-500 block uppercase font-medium">Sq. Yards (Vaar)</span>
                <span className="text-sm font-bold text-slate-900 font-mono">
                  {formatArea(res.sqYards)} yd²
                </span>
              </div>

              <div className="bg-white p-2.5 rounded-lg border border-purple-100/60 shadow-xs">
                <span className="text-[10px] text-slate-500 block uppercase font-medium">Sq. Meters</span>
                <span className="text-sm font-bold text-slate-900 font-mono">
                  {formatArea(res.sqMeters)} m²
                </span>
              </div>

              <div className="bg-white p-2.5 rounded-lg border border-purple-100/60 shadow-xs">
                <span className="text-[10px] text-slate-500 block uppercase font-medium">Vigha (Gujarat)</span>
                <span className="text-sm font-bold text-purple-700 font-mono">
                  {formatArea(res.vigha, 3)} Vigha
                </span>
              </div>

              <div className="bg-white p-2.5 rounded-lg border border-purple-100/60 shadow-xs">
                <span className="text-[10px] text-slate-500 block uppercase font-medium">Guntha</span>
                <span className="text-sm font-bold text-slate-900 font-mono">
                  {formatArea(res.guntha, 2)} Guntha
                </span>
              </div>

              <div className="bg-white p-2.5 rounded-lg border border-purple-100/60 shadow-xs">
                <span className="text-[10px] text-slate-500 block uppercase font-medium">Acres</span>
                <span className="text-sm font-bold text-slate-900 font-mono">
                  {formatArea(res.acres, 3)} Ac
                </span>
              </div>

              <div className="bg-white p-2.5 rounded-lg border border-purple-100/60 shadow-xs">
                <span className="text-[10px] text-slate-500 block uppercase font-medium">Sq. Feet</span>
                <span className="text-sm font-bold text-slate-900 font-mono">
                  {formatArea(res.sqFeet)} ft²
                </span>
              </div>
            </div>
          </div>

          <div className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
            <strong>Statutory Reference:</strong> 1 Vigha in Ahmedabad / Dholera region equals 1,618.7 m² (16 Gunthas / 1,936 Sq. Yards), aligned with Gujarat Revenue Department standards.
          </div>
        </div>
      </div>
    </div>
  );
}
