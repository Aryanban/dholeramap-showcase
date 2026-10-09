'use client';

import React, { useState } from 'react';
import { Navigation, Bookmark as BookmarkIcon, Share2, X, MapPin, Copy, Check, Compass, Layers } from 'lucide-react';
import { useApp } from '@/lib/store';
import { convertFromSqMeters, formatArea } from '@/lib/land-units';

export default function SatellitePlotCard() {
  const {
    selectedSatellitePlot,
    setSelectedSatellitePlot,
    addBookmark,
    bookmarks,
  } = useApp();

  const [unitMode, setUnitMode] = useState<'sqYd' | 'sqM' | 'vigha' | 'guntha'>('sqYd');
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCoords, setCopiedCoords] = useState(false);

  if (!selectedSatellitePlot) return null;

  const plot = selectedSatellitePlot;
  // If final plot area exists, use it for the plot card, else fallback to survey area
  const displayAreaSqM = plot.fpAreaSqM || plot.areaSqM || 13378;
  const conv = convertFromSqMeters(displayAreaSqM);
  const surveyConv = convertFromSqMeters(plot.areaSqM || displayAreaSqM);

  const isSaved = bookmarks.some(
    (b) => b.surveyNo === plot.surveyNo && b.village && b.village.toLowerCase() === plot.village.toLowerCase()
  );

  const latFormatted = plot.lat.toFixed(6);
  const lngFormatted = plot.lng.toFixed(6);

  const handleCopyCoords = () => {
    navigator.clipboard.writeText(`${latFormatted}, ${lngFormatted}`);
    setCopiedCoords(true);
    setTimeout(() => setCopiedCoords(false), 2000);
  };

  const handleShare = () => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    if (navigator.share) {
      navigator.share({
        title: `Dholera Survey ${plot.surveyNo} / ${plot.finalPlot || 'FP'} - ${plot.village}`,
        text: `Plot in ${plot.village}, Dholera SIR (${formatArea(conv.sqYards)} yd² / ${conv.vigha.toFixed(2)} Vigha). Nav: https://maps.google.com/?q=${latFormatted},${lngFormatted}`,
        url,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleDirections = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${latFormatted},${lngFormatted}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleBookmark = () => {
    addBookmark({
      id: `sat-${plot.village}-${plot.surveyNo}-${Date.now()}`,
      sid: plot.schemeId || 'dholera_tp',
      label: `Survey ${plot.surveyNo}, ${plot.village}`,
      x: 0,
      y: 0,
      surveyNo: plot.surveyNo,
      village: plot.village,
      finalPlot: plot.finalPlot || '',
      roadWidthM: plot.roadWidthM || 18,
      zone: plot.zone || 'Residential',
      areaSqM: plot.areaSqM,
      note: `Satellite GIS parcel in ${plot.village}, Dholera SIR. Coordinates: ${latFormatted}, ${lngFormatted}`,
    });
  };

  return (
    <aside aria-label="Selected Land Parcel Details" className="absolute bottom-5 left-4 right-4 md:left-6 md:right-auto md:w-[420px] z-[1100] animate-in slide-in-from-bottom-5 duration-300">
      <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-200/90 overflow-hidden text-slate-800">
        {/* Card Header Strip with Green & Red Badges */}
        <div className="px-4 py-3 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-black tracking-wide uppercase text-slate-200">
              Town Planning Cadastre
            </span>
          </div>
          <button
            onClick={() => setSelectedSatellitePlot(null)}
            className="w-7 h-7 flex items-center justify-center rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
            aria-label="Close parcel card"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 space-y-3.5">
          {/* Key Identifiers: Survey No (Green) & Final Plot No (Red) */}
          <div className="grid grid-cols-2 gap-2.5">
            {/* Survey Number (Agricultural Parent Cadastre - Green Line) */}
            <div className="p-2.5 rounded-xl bg-emerald-50/90 border border-emerald-300/80">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800">
                  Survey Number
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-500" title="Green Boundary Line" />
              </div>
              <div className="text-xl font-black text-emerald-950 font-mono">
                {plot.surveyNo}
              </div>
              <span className="text-[10px] text-emerald-700/80 font-medium">
                Revenue Survey Boundary
              </span>
            </div>

            {/* Final Plot Number (TP Reconstituted Parcel - Red Line) */}
            <div className="p-2.5 rounded-xl bg-rose-50/90 border border-rose-300/80">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-800">
                  FP Number
                </span>
                <span className="w-2 h-2 rounded-full bg-rose-500" title="Red Boundary Line" />
              </div>
              <div className="text-xl font-black text-rose-950 font-mono">
                {plot.finalPlot || `FP-${plot.surveyNo}`}
              </div>
              <span className="text-[10px] text-rose-700/80 font-medium">
                Town Planning Final Plot
              </span>
            </div>
          </div>

          {/* Plot Size Box with Conversions */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wider">
                Plot Size (Statutory Area)
              </span>
              {/* Unit Switcher */}
              <div className="inline-flex items-center bg-slate-200/80 rounded-lg p-0.5 text-[10px] font-bold">
                <button
                  type="button"
                  onClick={() => setUnitMode('sqYd')}
                  className={`px-1.5 py-0.5 rounded cursor-pointer ${
                    unitMode === 'sqYd' ? 'bg-white text-purple-700 shadow-2xs' : 'text-slate-600'
                  }`}
                >
                  yd²
                </button>
                <button
                  type="button"
                  onClick={() => setUnitMode('sqM')}
                  className={`px-1.5 py-0.5 rounded cursor-pointer ${
                    unitMode === 'sqM' ? 'bg-white text-purple-700 shadow-2xs' : 'text-slate-600'
                  }`}
                >
                  m²
                </button>
                <button
                  type="button"
                  onClick={() => setUnitMode('vigha')}
                  className={`px-1.5 py-0.5 rounded cursor-pointer ${
                    unitMode === 'vigha' ? 'bg-white text-purple-700 shadow-2xs' : 'text-slate-600'
                  }`}
                >
                  Vigha
                </button>
                <button
                  type="button"
                  onClick={() => setUnitMode('guntha')}
                  className={`px-1.5 py-0.5 rounded cursor-pointer ${
                    unitMode === 'guntha' ? 'bg-white text-purple-700 shadow-2xs' : 'text-slate-600'
                  }`}
                >
                  Gu
                </button>
              </div>
            </div>

            {/* Prominent Area Display */}
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900 font-mono tracking-tight">
                {unitMode === 'sqYd' && `${formatArea(conv.sqYards)} yd²`}
                {unitMode === 'sqM' && `${formatArea(conv.sqMeters)} m²`}
                {unitMode === 'vigha' && `${conv.vigha.toFixed(2)} Vigha`}
                {unitMode === 'guntha' && `${conv.guntha.toFixed(1)} Guntha`}
              </span>
              <span className="text-xs text-slate-400 font-medium">
                {unitMode === 'sqYd'
                  ? `(${formatArea(conv.sqMeters)} m² / ${conv.vigha.toFixed(2)} Vigha)`
                  : `(${formatArea(conv.sqYards)} yd²)`}
              </span>
            </div>

            {plot.fpAreaSqM && plot.areaSqM && plot.fpAreaSqM !== plot.areaSqM && (
              <div className="text-[10px] text-slate-500 mt-1 pt-1 border-t border-slate-200/60 flex items-center justify-between">
                <span>Original Survey Area:</span>
                <span className="font-semibold text-slate-700 font-mono">
                  {formatArea(surveyConv.sqYards)} yd² ({formatArea(surveyConv.sqMeters)} m²)
                </span>
              </div>
            )}
          </div>

          {/* Location & Statutory Planning Info */}
          <div className="space-y-1.5 text-xs">
            <div className="flex items-center gap-1.5 text-slate-700">
              <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span className="font-bold text-slate-900">{plot.village}</span>
              <span className="text-slate-400">•</span>
              <span>{plot.taluka || 'Dholera'} Taluka, Ahmedabad District</span>
            </div>

            {plot.subSector && (
              <div className="flex items-center gap-1.5 text-slate-600">
                <Layers className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                <span className="font-semibold text-purple-900">{plot.subSector}</span>
              </div>
            )}

            <div className="flex items-center gap-2 pt-1">
              {plot.zone && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-50 text-purple-800 border border-purple-200">
                  {plot.zone}
                </span>
              )}
              {plot.roadWidthM && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-900 border border-amber-200">
                  {plot.roadWidthM}m Road Facing
                </span>
              )}
            </div>
          </div>

          {/* Exact WGS84 Coordinates with 1-click Copy */}
          <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-100/90 text-slate-700 border border-slate-200 text-xs font-mono">
            <div className="flex items-center gap-1.5 truncate">
              <Compass className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span className="text-[11px] font-semibold tracking-tight text-slate-800">
                {latFormatted}° N, {lngFormatted}° E
              </span>
            </div>
            <button
              type="button"
              onClick={handleCopyCoords}
              className="inline-flex items-center gap-1 px-2 py-1 rounded bg-white hover:bg-slate-50 text-[10px] font-bold text-slate-700 border border-slate-200 shadow-2xs transition cursor-pointer"
              title="Copy GPS coordinates to clipboard"
            >
              {copiedCoords ? (
                <>
                  <Check className="w-3 h-3 text-emerald-600" />
                  <span className="text-emerald-700">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3 text-slate-500" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>

          {/* Action CTAs: Google Maps Navigation + Bookmark + Share */}
          <div className="grid grid-cols-3 gap-2 pt-1">
            {/* Google Maps Directions Navigation Button */}
            <button
              type="button"
              onClick={handleDirections}
              className="col-span-2 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/25 transition cursor-pointer"
              title="Open Turn-by-Turn Navigation in Google Maps"
            >
              <Navigation className="w-4 h-4 fill-white" />
              <span>Google Nav</span>
            </button>

            {/* Save Bookmark */}
            <button
              type="button"
              onClick={handleBookmark}
              className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl border text-xs font-bold transition cursor-pointer ${
                isSaved
                  ? 'bg-amber-500 text-white border-amber-600'
                  : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
              }`}
              title="Save Plot to Dashboard"
            >
              <BookmarkIcon className={`w-3.5 h-3.5 ${isSaved ? 'fill-white' : ''}`} />
              <span>{isSaved ? 'Saved' : 'Save'}</span>
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
