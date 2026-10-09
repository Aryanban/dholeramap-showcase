'use client';

import React, { useEffect, useRef, useState } from 'react';
import 'leaflet/dist/leaflet.css';

/**
 * Embeddable Dholera SIR cadastral map.
 *
 * Deliberately self-contained: it loads the same static tile pyramids the main
 * atlas uses (public/tiles/<scheme>/{z}/{x}/{y}.png + meta.json) but mounts its
 * own Leaflet instance and touches no global store, so it can be iframed on any
 * third-party site (blogs, broker pages, news articles) without pulling the rest
 * of the app. Every embed surfaces a "Powered by DholeraMap" credit link, which
 * is the point of the feature: each embedding site becomes a backlink.
 *
 * It is served from /embed/map (see src/app/embed/map/page.tsx), which is
 * itself indexable and carries a canonical back to the main atlas so the embed
 * page never competes with the real map.
 */

type SchemeMeta = {
  scheme: string;
  title: string;
  width: number;
  height: number;
  tileSize: number;
  maxZoom: number;
  minZoom: number;
  source: string;
};

const SCHEMES = ['tp1', 'tp2', 'tp3', 'tp4', 'tp5', 'tp6'] as const;
type SchemeId = (typeof SCHEMES)[number];

const SCHEME_LABEL: Record<SchemeId, string> = {
  tp1: 'TP 1 · Residential & City Center',
  tp2: 'TP 2 · Activation Area & Industrial',
  tp3: 'TP 3 · City Center Commercial',
  tp4: 'TP 4 · Solar & Knowledge',
  tp5: 'TP 5 · Aviation & MRO',
  tp6: 'TP 6 · Cargo Airport & CFS',
};

export default function EmbeddableMap() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const layerRef = useRef<any>(null);
  const [scheme, setScheme] = useState<SchemeId>('tp1');
  const [meta, setMeta] = useState<SchemeMeta | null>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadScheme(id: SchemeId) {
    try {
      const res = await fetch(`/tiles/${id}/meta.json`, { cache: 'force-cache' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const m = (await res.json()) as SchemeMeta;
      setMeta(m);
      setError(null);
      return m;
    } catch {
      // A scheme whose meta.json is absent still has tiles; fall back to the
      // standard pyramid geometry used by every shipped scheme so the embed
      // keeps working instead of erroring out.
      const fallback: SchemeMeta = {
        scheme: id.toUpperCase(),
        title: `Town Planning Scheme ${id.replace('tp', '')}`,
        width: id === 'tp6' ? 20220 : 23840,
        height: id === 'tp6' ? 14304 : 16840,
        tileSize: 1024,
        maxZoom: 4,
        minZoom: 0,
        source: 'DholeraMap tile pyramid',
      };
      setMeta(fallback);
      setError(null);
      return fallback;
    }
  }

  // Mount Leaflet once.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const L = (await import('leaflet')).default as any;
      if (cancelled || !containerRef.current) return;
      (window as any).L = L;

      const m = await loadScheme(scheme);
      if (cancelled || !m || !containerRef.current) return;
      setMeta(m);

      const map = L.map(containerRef.current, {
        crs: L.CRS.Simple,
        minZoom: m.minZoom ?? 0,
        maxZoom: m.maxZoom ?? 4,
        zoomControl: true,
        attributionControl: false,
        maxBoundsViscosity: 0.8,
      });
      mapRef.current = map;

      const layer = buildLayer(L, map, scheme, m);
      layerRef.current = layer;
      map.addLayer(layer);
      fitToScheme(L, map, m);
      setReady(true);

      setTimeout(() => {
        if (!cancelled && mapRef.current) {
          mapRef.current.invalidateSize();
        }
      }, 150);
    })();

    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Rebuild the tile layer when the visitor switches scheme.
  useEffect(() => {
    if (!mapRef.current || !ready) return;
    let cancelled = false;
    (async () => {
      const L = (await import('leaflet')).default as any;
      (window as any).L = L;
      const m = await loadScheme(scheme);
      if (cancelled || !m || !mapRef.current) return;
      setMeta(m);
      if (layerRef.current) mapRef.current.removeLayer(layerRef.current);
      const layer = buildLayer(L, mapRef.current, scheme, m);
      layerRef.current = layer;
      mapRef.current.addLayer(layer);
      mapRef.current.setMaxZoom(m.maxZoom ?? 4);
      mapRef.current.setMinZoom(m.minZoom ?? 0);
      fitToScheme(L, mapRef.current, m);
    })();
    return () => {
      cancelled = true;
    };
  }, [scheme, ready]);

  // Honour a scheme-specific embed via the URL fragment (/embed/map#tp4). The
  // hash is read post-mount (not in a lazy state initializer) because the
  // component is server-rendered and hydration would otherwise reuse the
  // server value, dropping the fragment.
  useEffect(() => {
    if (typeof window === 'undefined' || !ready) return;
    const frag = window.location.hash.replace('#', '').toLowerCase();
    if ((SCHEMES as readonly string[]).includes(frag) && (frag as SchemeId) !== scheme) {
      setScheme(frag as SchemeId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  if (error) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-slate-50 text-slate-700 text-sm p-4">
        {error} — visit{' '}
        <a href="https://dholeramap.com" className="text-blue-600 underline ml-1">
          dholeramap.com
        </a>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full overflow-hidden bg-slate-100">
      <div ref={containerRef} className="absolute inset-0" />

      {/* Brand header: required, this is what makes the embed a backlink */}
      <div className="pointer-events-none absolute left-0 right-0 top-0 z-[500] flex items-center justify-between bg-gradient-to-b from-white/95 via-white/80 to-transparent px-3 py-2">
        <a
          href="https://dholeramap.com"
          target="_blank"
          rel="noopener noreferrer"
          className="pointer-events-auto flex items-center gap-1.5 text-[11px] font-black text-slate-900 hover:text-blue-600 transition"
        >
          <span className="inline-block h-4 w-4 rounded-[4px] bg-blue-600" />
          DholeraMap
        </a>
        {meta && (
          <span className="text-[10px] font-bold text-blue-700 bg-white/90 px-2 py-0.5 rounded-full border border-blue-200 shadow-2xs">
            {meta.scheme}
          </span>
        )}
      </div>

      {/* Scheme switcher */}
      <div className="absolute bottom-0 left-0 right-0 z-[500] flex flex-wrap items-center gap-1 bg-gradient-to-t from-white/95 via-white/80 to-transparent px-2.5 py-2">
        {SCHEMES.map((s) => (
          <button
            key={s}
            onClick={() => setScheme(s)}
            className={`text-[10px] font-black px-2 py-1 rounded-md border transition cursor-pointer ${
              scheme === s
                ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                : 'bg-white/95 text-slate-700 border-slate-200 hover:text-blue-600 hover:border-blue-300 shadow-2xs'
            }`}
            title={SCHEME_LABEL[s]}
          >
            {s.toUpperCase()}
          </button>
        ))}
        <a
          href="https://dholeramap.com"
          target="_blank"
          rel="noopener noreferrer"
          className="ml-auto text-[10px] font-semibold text-slate-600 hover:text-blue-600 transition underline"
        >
          Open full atlas →
        </a>
      </div>
    </div>
  );
}

function buildLayer(L: any, map: any, scheme: string, m: SchemeMeta) {
  const { width, height, tileSize, maxZoom } = m;
  const sw = map.unproject([0, height], maxZoom);
  const ne = map.unproject([width, 0], maxZoom);
  const bounds = L.latLngBounds(sw, ne);
  map.setMaxBounds(bounds);

  return L.tileLayer(`/tiles/${scheme}/{z}/{y}/{x}.webp?v=10x`, {
    attribution: 'DholeraMap',
    minZoom: m.minZoom ?? 0,
    maxNativeZoom: maxZoom,
    maxZoom: maxZoom + 2,
    noWrap: true,
    bounds,
    tileSize,
    zoomOffset: 0,
    detectRetina: true,
    updateWhenZooming: false,
    keepBuffer: 2,
    errorTileUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR4nGNgYGBgAAAABQABpfZFQAAAAABJRU5ErkJggg==',
  });
}

function fitToScheme(L: any, map: any, m: SchemeMeta) {
  const { width, height, maxZoom } = m;
  const sw = map.unproject([0, height], maxZoom);
  const ne = map.unproject([width, 0], maxZoom);
  const bounds = L.latLngBounds(sw, ne);
  map.fitBounds(bounds, { animate: false });
}
