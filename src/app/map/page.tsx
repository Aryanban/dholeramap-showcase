'use client';

import React, { Suspense } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { VILLAGES } from '@/lib/villages';
import { useApp } from '@/lib/store';

// ── Critical Components (Synchronous / Eager) ──
import Toolbar from '@/components/panels/Toolbar';
import MobileTopBar from '@/components/mobile/MobileTopBar';
import MobileTabBar from '@/components/mobile/MobileTabBar';
import PlotIndexWarmer from '@/components/ui/PlotIndexWarmer';

// ── Heavy Panels & Modals (Code Split & Dynamically Loaded) ──
const BrowserDrawer = dynamic(
  () => import('@/components/panels/BrowserDrawer'),
  { ssr: false }
);

const InfoPanel = dynamic(
  () => import('@/components/panels/InfoPanel'),
  { ssr: false }
);

const MobileBottomSheet = dynamic(
  () => import('@/components/mobile/MobileBottomSheet'),
  { ssr: false }
);

const MobileSearchOverlay = dynamic(
  () => import('@/components/mobile/MobileSearchOverlay'),
  { ssr: false }
);

const MobileMoreSheet = dynamic(
  () => import('@/components/mobile/MobileMoreSheet'),
  { ssr: false }
);

// ── Map Viewers ──
const TilePyramidViewer = dynamic(
  () => import('@/components/map/TilePyramidViewer'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex flex-col items-center justify-center bg-slate-950 text-slate-400 gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
        <span className="text-xs font-mono font-medium tracking-wide">
          Loading High-Resolution Cadastral Canvas...
        </span>
      </div>
    ),
  }
);

const SatelliteOverlayViewer = dynamic(
  () => import('@/components/map/SatelliteOverlayViewer'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex flex-col items-center justify-center bg-slate-950 text-purple-400 gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
        <span className="text-xs font-mono font-medium tracking-wide">
          Loading Dholera SIR Satellite GIS Engine...
        </span>
      </div>
    ),
  }
);



function MapUrlHandler() {
  const searchParams = useSearchParams();
  const issueFly = useApp((s) => s.issueFly);
  const setMapViewMode = useApp((s) => s.setMapViewMode);

  React.useEffect(() => {
    const mode = searchParams.get('mode');
    if (mode === 'satellite') {
      setMapViewMode('satellite');
    } else if (mode === 'cadastral') {
      setMapViewMode('cadastral');
    }

    const scheme = searchParams.get('scheme');
    const x = searchParams.get('x');
    const y = searchParams.get('y');
    const zoom = searchParams.get('zoom');
    const survey = searchParams.get('survey');

    if (scheme && x && y) {
      issueFly(
        scheme,
        parseFloat(x),
        parseFloat(y),
        zoom ? parseFloat(zoom) : 2,
        Boolean(survey),
        survey ? `Survey No. ${survey}` : undefined
      );
    }
  }, [searchParams, issueFly, setMapViewMode]);

  return null;
}

function InitialLoader() {
  const [visible, setVisible] = React.useState(true);

  React.useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 900);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-sm pointer-events-none transition-opacity duration-500"
    >
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
        <div className="text-center">
          <p className="text-sm font-semibold text-white">PlotBook Dholera</p>
          <p className="text-xs text-slate-400 font-mono">Initializing GIS spatial index...</p>
        </div>
      </div>
    </div>
  );
}

export default function MapPage() {
  const mapViewMode = useApp((s) => s.mapViewMode);

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-slate-950 flex flex-col">
      {/* ── Semantic SEO header for indexers & accessibility ── */}
      <header className="sr-only">
        <h1>Dholera SIR Interactive Cadastral Map &amp; TP Master Plan</h1>
        <p>
          Official interactive GIS mapping atlas for Dholera Special Investment Region (SIR).
          Explore Town Planning Schemes 1 through 6, 23 revenue villages, and survey parcels.
        </p>
        <nav aria-label="Dholera Revenue Villages">
          <h2>Revenue Villages Directory</h2>
          <ul>
            {VILLAGES.map((v) => (
              <li key={v.slug}>
                <Link href={`/village/${v.slug}`}>
                  Village {v.name} ({v.scheme}) Interactive Survey Directory
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </header>

      {/* URL query params & cross-page navigation handler */}
      <Suspense fallback={null}>
        <MapUrlHandler />
      </Suspense>

      {/* Initial interactive tile loader */}
      <InitialLoader />

      {/* Warms the active scheme's plots index into cache ahead of the map */}
      <PlotIndexWarmer />

      {/* 1. Global Navigation Chrome (Always visible across Cadastral and Satellite modes) */}
      <Toolbar />
      <MobileTopBar />
      <BrowserDrawer />

      {/* 2. Full-bleed map viewer */}
      <div className="relative w-full flex-1 h-[calc(100dvh-3.5rem)] mt-14 overflow-hidden">
        {mapViewMode === 'satellite' ? <SatelliteOverlayViewer /> : <TilePyramidViewer />}
      </div>

      {/* 3. Cadastral Inspection Panels */}
      {mapViewMode === 'cadastral' && (
        <>
          <InfoPanel />
          <MobileBottomSheet />
        </>
      )}

      {/* 4. Global Mobile Overlays */}
      <MobileSearchOverlay />
      <MobileMoreSheet />

      {/* 5. Mobile Tab Bar (Bottom) */}
      <MobileTabBar />
    </main>
  );
}
