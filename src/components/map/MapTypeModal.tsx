'use client';

import React from 'react';
import { X, Layers, Sliders, Map, Globe, Maximize2, Calculator } from 'lucide-react';
import { useApp } from '@/lib/store';

export default function MapTypeModal() {
  const {
    satelliteBaseMap,
    setSatelliteBaseMap,
    layerOpacity,
    setLayerOpacity,
    satelliteLayers,
    toggleSatelliteLayer,
    mapTypeModalOpen,
    setMapTypeModalOpen,
    setUnitConverterOpen,
  } = useApp();

  if (!mapTypeModalOpen) return null;

  return (
    <div className="fixed inset-0 z-[1150] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      {/* Click outside backdrop */}
      <div
        className="absolute inset-0"
        onClick={() => setMapTypeModalOpen(false)}
      />

      {/* Modal Dialog Card */}
      <div className="relative w-full max-w-sm rounded-3xl bg-white/95 backdrop-blur-md shadow-2xl border border-slate-200/90 p-5 text-slate-800 space-y-5 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-purple-600" />
            <h3 className="font-bold text-sm text-slate-900 tracking-tight">
              Map Layers &amp; Style
            </h3>
          </div>
          <button
            type="button"
            onClick={() => setMapTypeModalOpen(false)}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Base Map Switcher */}
        <div>
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
            Base Imagery Style
          </span>
          <div className="grid grid-cols-2 gap-2">
            {/* Street Map */}
            <button
              type="button"
              onClick={() => setSatelliteBaseMap('default')}
              className={`flex items-center gap-2.5 p-2.5 rounded-2xl border text-left transition-all cursor-pointer ${
                satelliteBaseMap === 'default'
                  ? 'border-purple-600 bg-purple-50/70 text-purple-900 font-bold ring-2 ring-purple-500/20'
                  : 'border-slate-200 text-slate-700 bg-slate-50 hover:bg-slate-100'
              }`}
            >
              <Map className="w-4 h-4 text-purple-600 shrink-0" />
              <div>
                <div className="text-xs">Street Map</div>
                <div className="text-[10px] text-slate-400 font-normal">Carto Roads</div>
              </div>
            </button>

            {/* HD Satellite */}
            <button
              type="button"
              onClick={() => setSatelliteBaseMap('satellite')}
              className={`flex items-center gap-2.5 p-2.5 rounded-2xl border text-left transition-all cursor-pointer ${
                satelliteBaseMap === 'satellite'
                  ? 'border-purple-600 bg-purple-50/70 text-purple-900 font-bold ring-2 ring-purple-500/20'
                  : 'border-slate-200 text-slate-700 bg-slate-50 hover:bg-slate-100'
              }`}
            >
              <Globe className="w-4 h-4 text-purple-600 shrink-0" />
              <div>
                <div className="text-xs">HD Satellite</div>
                <div className="text-[10px] text-slate-400 font-normal">Sub-meter Aerial</div>
              </div>
            </button>
          </div>
        </div>

        {/* Master Plan Overlays Switcher */}
        <div>
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
            Town Planning &amp; DP Overlays
          </span>
          <div className="grid grid-cols-2 gap-2">
            {/* DP Layer */}
            <button
              type="button"
              onClick={() => toggleSatelliteLayer('finalPlot')}
              className={`flex items-center gap-2 p-2 rounded-xl border text-left transition-all cursor-pointer ${
                satelliteLayers.finalPlot
                  ? 'border-purple-300 bg-purple-50/60 text-purple-950 font-bold'
                  : 'border-slate-200 text-slate-600 bg-slate-50 hover:bg-slate-100'
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
              <div className="min-w-0">
                <div className="text-xs truncate">DP Master Plan</div>
                <div className="text-[9.5px] text-slate-400 font-normal">2024 Final</div>
              </div>
            </button>

            {/* TP Scheme Layer */}
            <button
              type="button"
              onClick={() => toggleSatelliteLayer('tp')}
              className={`flex items-center gap-2 p-2 rounded-xl border text-left transition-all cursor-pointer ${
                satelliteLayers.tp
                  ? 'border-purple-300 bg-purple-50/60 text-purple-950 font-bold'
                  : 'border-slate-200 text-slate-600 bg-slate-50 hover:bg-slate-100'
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full bg-purple-600 shrink-0" />
              <div className="min-w-0">
                <div className="text-xs truncate">TP Schemes 1-6</div>
                <div className="text-[9.5px] text-slate-400 font-normal">Plots &amp; Roads</div>
              </div>
            </button>

            {/* Survey Numbers */}
            <button
              type="button"
              onClick={() => toggleSatelliteLayer('survey')}
              className={`flex items-center gap-2 p-2 rounded-xl border text-left transition-all cursor-pointer ${
                satelliteLayers.survey
                  ? 'border-purple-300 bg-purple-50/60 text-purple-950 font-bold'
                  : 'border-slate-200 text-slate-600 bg-slate-50 hover:bg-slate-100'
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0" />
              <div className="min-w-0">
                <div className="text-xs truncate">Survey Numbers</div>
                <div className="text-[9.5px] text-slate-400 font-normal">18,161 Cadastres</div>
              </div>
            </button>

            {/* Village Layer */}
            <button
              type="button"
              onClick={() => toggleSatelliteLayer('village')}
              className={`flex items-center gap-2 p-2 rounded-xl border text-left transition-all cursor-pointer ${
                satelliteLayers.village
                  ? 'border-purple-300 bg-purple-50/60 text-purple-950 font-bold'
                  : 'border-slate-200 text-slate-600 bg-slate-50 hover:bg-slate-100'
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
              <div className="min-w-0">
                <div className="text-xs truncate">Villages (23)</div>
                <div className="text-[9.5px] text-slate-400 font-normal">Revenue Limits</div>
              </div>
            </button>
          </div>
        </div>

        {/* Opacity Slider */}
        <div className="space-y-2 pt-1 border-t border-slate-100">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
            <span className="flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-purple-600" />
              Overlay Opacity
            </span>
            <span className="font-mono text-purple-700">{Math.round(layerOpacity * 100)}%</span>
          </div>
          <input
            type="range"
            min="0.1"
            max="1"
            step="0.05"
            value={layerOpacity}
            onChange={(e) => setLayerOpacity(parseFloat(e.target.value))}
            className="w-full accent-purple-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
          />
        </div>

        {/* Land Unit Converter shortcut */}
        <div className="pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={() => {
              setMapTypeModalOpen(false);
              setUnitConverterOpen(true);
            }}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-purple-50 hover:bg-purple-100/80 text-purple-800 text-xs font-bold transition-colors cursor-pointer"
          >
            <Calculator className="w-4 h-4 text-purple-600" />
            Open Dholera Land Unit Converter
          </button>
        </div>
      </div>
    </div>
  );
}
