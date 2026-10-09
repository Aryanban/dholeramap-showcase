import React, { useEffect, useRef, useState } from 'react';
import { useApp } from '@/lib/store';
import { loadManifest, loadSurveys, DATA_VERSION } from '@/lib/sheets';
import { getSchemeDGDCR } from '@/lib/dgdcr';
import { SUBSECTOR_FLY_MAP } from '@/components/panels/BrowserDrawer';
import type { SheetsManifest, PlanSheet, CadastralSurveyPoint } from '@/lib/types';
import { expandPlots } from '@/lib/plots-expand';
import 'leaflet/dist/leaflet.css';

interface PlotCoordinate {
  raw: string;
  x: number;
  y: number;
  w: number;
  h: number;
  type?: string;
  village?: string;
  finalPlot?: string;
  surveyNo?: string;
  subSector?: string;
  /** exact label bounding box [x0, y0, x1, y1] in canvas units, TP1-5 only */
  bounds?: [number, number, number, number];
}

function createReticleIcon(L: any, label: string, isFP: boolean = true) {
  const badgeBg = isFP ? 'bg-slate-950 text-emerald-300 border-slate-700' : 'bg-rose-950 text-rose-200 border-rose-700';
  const strokeColor = isFP ? '#10B981' : '#F43F5E';
  const haloColor = isFP ? 'rgba(16, 185, 129, 0.16)' : 'rgba(244, 63, 94, 0.16)';

  const html = `
    <div style="width: 72px; height: 72px; position: relative; pointer-events: none;">
      <!-- Floating Label Pill -->
      <div style="position: absolute; top: -30px; left: 50%; transform: translateX(-50%); white-space: nowrap;">
        <div class="px-2.5 py-0.5 rounded-full text-[11px] font-black shadow-2xl border ${badgeBg} flex items-center gap-1.5 animate-bounce">
          <span class="w-1.5 h-1.5 rounded-full ${isFP ? 'bg-emerald-400' : 'bg-rose-400'} animate-ping"></span>
          <span>${label}</span>
        </div>
        <div style="width: 0; height: 0; border-left: 5px solid transparent; border-right: 5px solid transparent; border-top: 5px solid ${isFP ? '#020617' : '#4c0519'}; margin: 0 auto;"></div>
      </div>

      <!-- Concentric Non-Obscuring SVG Reticle -->
      <svg width="72" height="72" viewBox="0 0 72 72" style="position: absolute; inset: 0;">
        <circle cx="36" cy="36" r="30" fill="${haloColor}" stroke="${strokeColor}" stroke-width="1.5" stroke-dasharray="4 2" opacity="0.8">
          <animate attributeName="r" values="26;32;26" dur="2s" repeatCount="indefinite"/>
          <animate attributeName="opacity" values="0.8;0.3;0.8" dur="2s" repeatCount="indefinite"/>
        </circle>
        <circle cx="36" cy="36" r="18" fill="none" stroke="${strokeColor}" stroke-width="2.2" />
        <line x1="36" y1="4" x2="36" y2="14" stroke="${strokeColor}" stroke-width="2" stroke-linecap="round" />
        <line x1="36" y1="58" x2="36" y2="68" stroke="${strokeColor}" stroke-width="2" stroke-linecap="round" />
        <line x1="4" y1="36" x2="14" y2="36" stroke="${strokeColor}" stroke-width="2" stroke-linecap="round" />
        <line x1="58" y1="36" x2="68" y2="36" stroke="${strokeColor}" stroke-width="2" stroke-linecap="round" />
        <path d="M 22 28 L 22 22 L 28 22" fill="none" stroke="${strokeColor}" stroke-width="1.5" />
        <path d="M 50 28 L 50 22 L 44 22" fill="none" stroke="${strokeColor}" stroke-width="1.5" />
        <path d="M 22 44 L 22 50 L 28 50" fill="none" stroke="${strokeColor}" stroke-width="1.5" />
        <path d="M 50 44 L 50 50 L 44 50" fill="none" stroke="${strokeColor}" stroke-width="1.5" />
      </svg>
    </div>
  `;

  return L.divIcon({
    className: 'cadastral-reticle-marker',
    html: html,
    iconSize: [72, 72],
    iconAnchor: [36, 36],
  });
}

function createSubsectorBadgeIcon(L: any, name: string, badge: string) {
  // Semi-transparent, compact, subtle circle marker:
  // "almost be visible but just enough not visible to be able to notice it"
  const html = `
    <div class="group" style="position: relative; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; cursor: pointer; pointer-events: auto;">
      <!-- Subtle Semi-Transparent Marker Circle -->
      <div style="
        width: 13px;
        height: 13px;
        border-radius: 50%;
        background: rgba(59, 130, 246, 0.12);
        border: 1.2px solid rgba(59, 130, 246, 0.35);
        box-shadow: 0 0 4px rgba(59, 130, 246, 0.15);
        backdrop-filter: blur(1px);
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      " class="group-hover:scale-125 group-hover:bg-blue-500/25 group-hover:border-blue-500/60 group-hover:shadow-blue-500/30">
        <!-- Delicate center target core -->
        <span style="
          width: 3px;
          height: 3px;
          border-radius: 50%;
          background: rgba(59, 130, 246, 0.4);
          display: block;
        " class="group-hover:bg-blue-400"></span>
      </div>

      <!-- Sleek Floating Tooltip on Hover -->
      <div class="opacity-0 group-hover:opacity-100 group-hover:-translate-y-1 pointer-events-none absolute bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap transition-all duration-150 z-50">
        <div class="px-2 py-0.5 rounded-full text-[10px] font-bold text-white bg-slate-900/95 border border-slate-700 shadow-xl backdrop-blur-md flex items-center gap-1">
          <span class="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
          <span>${name}</span>
          <span class="text-[9px] text-slate-400 font-normal">· ${badge}</span>
        </div>
      </div>
    </div>
  `;
  return L.divIcon({
    className: 'subsector-cad-label-marker',
    html: html,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
}

const MAXZ = 4;

// Even-odd ray casting. Retained as the reference implementation for tests that
// build rings in JS; the live path now runs in the parcels worker (B6), which
// decodes the delta-int32 binary once and answers hits off the main thread.
function _pointInPolygon(x: number, y: number, ring: number[][]): boolean {
  let inside = false;
  const n = ring.length;
  for (let i = 0, j = n - 1; i < n; j = i++) {
    const xi = ring[i][0], yi = ring[i][1];
    const xj = ring[j][0], yj = ring[j][1];
    const intersect = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

type ParcelsHandle = {
  hit: (x: number, y: number) => Promise<ParcelHit | null>;
  probe: () => Promise<ParcelProbeItem[]>;
};
type ParcelHit = {
  key: string;
  isEstimated: boolean;
  centroid: [number, number];
  nVertices: number;
};
type ParcelProbeItem = { key: string; cx: number; cy: number; n: number; est: boolean };

// One worker per scheme, lazily created. The ArrayBuffer is transferred
// (zero-copy) so decoding never stalls the main thread.
function loadParcelsBinary(scheme: number): Promise<ParcelsHandle> {
  const W: Worker = new Worker(new URL('../../lib/parcels-worker.ts', import.meta.url), {
    type: 'module',
  });
  let seq = 0;
  const pending = new Map<number, (h: any) => void>();
  W.onmessage = (e: MessageEvent) => {
    const m = e.data;
    if (m.type === 'hit' || m.type === 'probe') {
      const cb = pending.get(m.id);
      if (cb) {
        pending.delete(m.id);
        cb(m.type === 'hit' ? (m.hit && m.scheme === scheme ? m.hit : null) : m.items);
      }
    }
  };
  return fetch(`/tiles/tp${scheme}/parcels.bin?${DATA_VERSION}`)
    .then((r) => {
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return r.arrayBuffer();
    })
    .then((buf) => {
      W.postMessage({ type: 'load', scheme, buffer: buf }, [buf]);
      return {
        hit: (x: number, y: number) =>
          new Promise<ParcelHit | null>((resolve) => {
            const id = ++seq;
            pending.set(id, resolve);
            W.postMessage({ type: 'hit', id, x, y });
          }),
        probe: () =>
          new Promise<ParcelProbeItem[]>((resolve) => {
            const id = ++seq;
            pending.set(id, resolve);
            W.postMessage({ type: 'probe', id });
          }),
      };
    })
    .catch((err) => {
      console.warn(`Failed loading parcels binary for TP ${scheme}:`, err);
      return { hit: async () => null, probe: async () => [] as ParcelProbeItem[] };
    });
}

export default function TilePyramidViewer() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const layerRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const subsectorLayerRef = useRef<any>(null);
  const plotsRef = useRef<Record<string, PlotCoordinate[]>>({});
  const plotsCacheRef = useRef<Record<string, Record<string, PlotCoordinate[]>>>({});
  const plotsPromiseCacheRef = useRef<Record<string, Promise<Record<string, PlotCoordinate[]>> | null>>({});
  const surveysRef = useRef<Record<string, CadastralSurveyPoint[]>>({});
  const parcelsWorkerRef = useRef<Record<number, Promise<ParcelsHandle>>>({});
  const activeParcelsRef = useRef<ParcelsHandle | null>(null);
  const manifestRef = useRef<SheetsManifest | null>(null);
  const sheetBoundsRef = useRef<any>(null);

  const activeSid = useApp((s) => s.activeSid);
  const activeSubSector = useApp((s) => s.activeSubSector);
  const flyTarget = useApp((s) => s.flyTarget);
  const clearFly = useApp((s) => s.clearFly);
  const selectedSurvey = useApp((s) => s.selectedSurvey);
  const setClickedPt = useApp((s) => s.setClickedPt);
  const setInfoSheetOpen = useApp((s) => s.setInfoSheetOpen);

  const [loaded, setLoaded] = useState(false);
  const [zoomLevel, setZoomLevel] = useState<number>(0);
  const [activeSheet, setActiveSheet] = useState<PlanSheet | null>(null);

  // 1. Initial Leaflet Map Setup (CRS.Simple) with High-Speed Zoom & Instant Tile Hydration
  useEffect(() => {
    let mapInstance: any = null;
    let isDestroyed = false;
    const container = mapContainerRef.current;

    async function init() {
      if (typeof window === 'undefined' || !container) return;
      // Kick off the lightweight manifest fetch in parallel with the Leaflet dynamic
      // import so neither network round trip waits on the other.
      const manifestPromise = loadManifest();
      const L = (await import('leaflet')).default;
      if (isDestroyed) return;
      (window as any).L = L;

      if ((container as any)._leaflet_id) {
        return;
      }

      const map = L.map(container, {
        crs: L.CRS.Simple,
        zoomControl: false,
        attributionControl: false,
        minZoom: 0,
        maxZoom: MAXZ + 2,
        zoomSnap: 0.5,
        zoomDelta: 1.0,
        wheelPxPerZoomLevel: 50,
        wheelDebounceTime: 40,
        preferCanvas: true,
        maxBoundsViscosity: 1.0,
      });

      // Establish initial coordinates immediately so Leaflet's internal _loaded state is true from moment 0
      map.setView(map.unproject([11920, 8420], MAXZ), 1);

      map.on('zoomend', () => {
        const z = map.getZoom();
        setZoomLevel(z);
        if (subsectorLayerRef.current) {
          if (z >= 4.0) {
            map.removeLayer(subsectorLayerRef.current);
          } else if (!map.hasLayer(subsectorLayerRef.current)) {
            map.addLayer(subsectorLayerRef.current);
          }
        }
      });

      mapInstance = map;
      mapRef.current = map;
      (window as any).__mapInstance = map;
      (window as any).__useApp = useApp;

      // Ultra-Fast Initial Bootstrap: load lightweight manifest (16 KB) and mount immediately
      try {
        const m = await manifestPromise;
        if (isDestroyed) return;
        manifestRef.current = m;
        setLoaded(true);
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('plotbook:map-ready'));
        }
      } catch (err) {
        console.error('Failed to load initial manifest:', err);
      }

      // Hydrate surveys in background on idle
      const prefetchCadastre = () => {
        if (isDestroyed) return;
        loadSurveys()
          .then((s) => {
            if (!isDestroyed) surveysRef.current = s;
          })
          .catch((err) => {
            console.warn('Prefetch surveys failed:', err);
          });
      };

      if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
        (window as any).requestIdleCallback(prefetchCadastre);
      } else {
        setTimeout(prefetchCadastre, 800);
      }
      if (isDestroyed) {
        try {
          map.remove();
        } catch {}
        return;
      }
    }

    init();

    return () => {
      isDestroyed = true;
      const map = mapRef.current || mapInstance;
      mapRef.current = null;
      mapInstance = null;
      if (map) {
        try {
          map.remove();
        } catch {}
      }
      if (container) {
        try {
          delete (container as any)._leaflet_id;
        } catch {}
      }
    };
  }, []);

  // 2. Reactive Sheet Switching when activeSid changes (Enforcing 100% English Blueprints)
  useEffect(() => {
    if (!loaded || !mapRef.current || !manifestRef.current) return;
    const L = (window as any).L;
    if (!L) return;

    const map = mapRef.current;
    const manifest = manifestRef.current;
    const sheet = manifest.sheets[activeSid] || manifest.sheets['tp1-master'];
    if (!sheet) return;

    setActiveSheet(sheet);

    // Purge ALL previous tile layers and image overlays to prevent duplicate or multi-map rendering
    map.eachLayer((l: any) => {
      if (l instanceof L.TileLayer || l instanceof L.ImageOverlay) {
        map.removeLayer(l);
      }
    });
    layerRef.current = null;

    // Remove previous marker on sheet change if not part of a fly
    if (markerRef.current && (!flyTarget || flyTarget.sid !== activeSid)) {
      map.removeLayer(markerRef.current);
      markerRef.current = null;
    }

    let bounds: any;
    const schemeMatch = sheet.sid.match(/^tp([1-6])/);

    if (schemeMatch) {
      const schemeNum = schemeMatch[1];
      const scheme = Number(schemeNum);
      let W = 23840;
      let H = 16840;
      if (schemeNum === '6') {
        W = 20220;
        H = 14304;
      }

      bounds = L.latLngBounds(map.unproject([0, 0], MAXZ), map.unproject([W, H], MAXZ));
      sheetBoundsRef.current = bounds;

      layerRef.current = L.tileLayer(`/tiles/tp${schemeNum}/{z}/{y}/{x}.webp?v=10x`, {
        tileSize: 1024,
        minZoom: 0,
        maxZoom: MAXZ + 2,
        maxNativeZoom: MAXZ,
        noWrap: true,
        bounds: bounds,
        keepBuffer: 2,
        updateWhenIdle: false,
        updateInterval: 150,
        errorTileUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+ip1sAAAAASUVORK5CYII=',
      }).addTo(map);

      // Hydrate plots.json for this active scheme with deduplication
      if (plotsCacheRef.current[schemeNum]) {
        plotsRef.current = plotsCacheRef.current[schemeNum];
      } else {
        if (!plotsPromiseCacheRef.current[schemeNum]) {
          plotsPromiseCacheRef.current[schemeNum] = fetch(`/tiles/tp${schemeNum}/plots.json?${DATA_VERSION}`)
            .then((r) => {
              if (!r.ok) throw new Error(`HTTP ${r.status}`);
              return r.json();
            })
            .then((raw) => {
              // B6 part 2: expand the compacted (constants + enum-indexed)
              // form back to the full record shape, in place.
              const data = expandPlots(raw) as unknown as Record<string, PlotCoordinate[]>;
              plotsCacheRef.current[schemeNum] = data;
              return data;
            })
            .catch((err) => {
              console.warn(`Failed loading plots for TP ${schemeNum}:`, err);
              return {};
            })
            .finally(() => {
              plotsPromiseCacheRef.current[schemeNum] = null;
            });
        }
        plotsPromiseCacheRef.current[schemeNum]!.then((data) => {
          const curMatch = useApp.getState().activeSid.match(/^tp([1-6])/);
          if (curMatch && curMatch[1] === schemeNum) {
            // Apply locally-entered corrections (doc 17) over the generated assignments,
            // so a broker's verified final-plot/survey numbers win over the base data.
            import('../../lib/corrections').then(({ applyCorrections }) => {
              try {
                const n = applyCorrections(data as Record<string, unknown[]>);
                if (n) console.info(`Applied ${n} local cadastral correction(s) for TP ${schemeNum}.`);
              } catch (err) {
                console.warn('Failed applying local corrections:', err);
              }
              plotsRef.current = data;
              // Testability hook: lets the verifier (and debugging) inspect the
              // exact plot index the click handler scans. No functional use.
              (window as any).__plotsData = data;
            });
          }
        });
      }

      // B6: hydrate the compact binary ring index in a worker. Geometry is now
      // decoded off the main thread; a click asks the worker instead of
      // scanning every record's inline ring array.
      const workers = parcelsWorkerRef.current;
      if (!workers[scheme]) {
        workers[scheme] = loadParcelsBinary(scheme);
      }
      workers[scheme].then((w: ParcelsHandle) => {
        const curMatch = useApp.getState().activeSid.match(/^tp([1-6])/);
        if (curMatch && Number(curMatch[1]) === scheme) {
          activeParcelsRef.current = w;
          // Testability hook: the verifier probes parcel centroids through this
          // to pick a click target away from any label (verify_ring_click.js).
          (window as any).__parcels = w;
        }
      });
    } else {
      // Macro overview sheets
      const W = sheet.width || 7152;
      const H = sheet.height || 5052;
      bounds = L.latLngBounds(map.unproject([0, 0], MAXZ), map.unproject([W, H], MAXZ));
      sheetBoundsRef.current = bounds;

      layerRef.current = L.imageOverlay(sheet.url, bounds, {
        interactive: true,
        alt: sheet.label,
      }).addTo(map);
    }

    // Mount on-map markers for all subsectors belonging to this active scheme
    if (subsectorLayerRef.current) {
      map.removeLayer(subsectorLayerRef.current);
      subsectorLayerRef.current = null;
    }

    const subsectorGroup = L.layerGroup();
    const currentMasterSid = sheet.sid.endsWith('-master') ? sheet.sid : `${sheet.sid.split('-')[0]}-master`;

    for (const [, def] of Object.entries(SUBSECTOR_FLY_MAP)) {
      if (def.masterSid === currentMasterSid || def.masterSid === sheet.sid) {
        const markerLatLng = map.unproject([def.x, def.y], MAXZ);
        const icon = createSubsectorBadgeIcon(L, def.name, def.badge || 'Sub-Map');
        const m = L.marker(markerLatLng, { icon, zIndexOffset: 300 });
        m.on('click', (e: any) => {
          L.DomEvent.stopPropagation(e);
          useApp.getState().issueFly(def.masterSid, def.x, def.y, 3.6, false, `${def.name} • ${def.sub}`);
        });
        subsectorGroup.addLayer(m);
      }
    }

    subsectorGroup.addTo(map);
    subsectorLayerRef.current = subsectorGroup;

    // Release previous maxBounds so Leaflet does not clamp/abort camera repositioning across different sheet coordinate systems
    map.setMaxBounds(null);

    // If there is no immediate fly target for this sheet, fit the whole blueprint in view
    const pendingFly = useApp.getState().flyTarget;
    if (!pendingFly || pendingFly.sid !== activeSid) {
      try {
        map.fitBounds(bounds);
      } catch {}
    } else {
      const targetLatLng = map.unproject([pendingFly.x, pendingFly.y], MAXZ);
      const isLargeVectorScheme = sheet.sid.startsWith('tp');
      const zoomToUse = pendingFly.zoom || (isLargeVectorScheme ? 3.8 : 3.6);
      try {
        map.setView(targetLatLng, zoomToUse);
      } catch {}

      // Place reticle marker immediately if parcel selection
      if (pendingFly.isParcelSelection) {
        if (markerRef.current) {
          map.removeLayer(markerRef.current);
          markerRef.current = null;
        }
        const sel = useApp.getState().selectedSurvey;
        const label =
          sel?.displayLabel ||
          sel?.finalPlot ||
          (sel?.surveyNo ? `Survey ${sel.surveyNo}` : 'Plot');
        const isFP = sel?.type === 'plot';
        const icon = createReticleIcon(L, label, isFP);
        if (icon) {
          markerRef.current = L.marker(targetLatLng, { icon }).addTo(map);
        }
      }
    }

    map.setMaxBounds(bounds.pad(0.005));
    return () => {
      if (subsectorLayerRef.current) {
        try {
          map.removeLayer(subsectorLayerRef.current);
        } catch {}
        subsectorLayerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSid, loaded]);

  // 3. Precision Map Click Hit Testing
  useEffect(() => {
    if (!loaded || !mapRef.current) return;
    const map = mapRef.current;
    const L = (window as any).L;

    async function handleClick(e: any) {
      if (!activeSheet) return;
      clearFly(); // Ensure no lingering flyTarget can redirect map

      // Always clear previous reticle marker on any map click
      if (markerRef.current) {
        map.removeLayer(markerRef.current);
        markerRef.current = null;
      }

      const p = map.project(e.latlng, MAXZ);
      const xy = { x: Math.round(p.x), y: Math.round(p.y) };

      const schemeMatch = activeSheet.sid.match(/^tp([1-6])/);
      let W = activeSheet.width || 7152;
      let H = activeSheet.height || 5052;
      if (schemeMatch) {
        const sNum = schemeMatch[1];
        if (sNum === '6') {
          W = 20220;
          H = 14304;
        } else {
          W = 23840;
          H = 16840;
        }
      }
      if (xy.x < 0 || xy.x > W || xy.y < 0 || xy.y > H) {
        setClickedPt(null, null);
        return;
      }

      let bestParcel: any = null;
      let minDist = 220;
      let minD2 = minDist * minDist;

      // 1a. Precise box hit-test. TP1-5 store each label's exact bounding box
      // (`bounds`, 100% of 16,514 parcels — docs/10 §A+1). A 220 px radius ball
      // is ~13x wider than a typical label, so the old scan grabbed the
      // nearest label *centre* — usually the neighbour. Testing against the
      // real box selects the label you actually clicked, and makes nearly
      // every label selectable. Adjacent label boxes overlap at corners, so
      // among containing boxes we take the one whose CENTRE is nearest the
      // click (area only as a tiebreak) — that is the label the click is
      // most inside. TP6 carries no boxes and is handled by 1b.
      const seenBoxIds = new Set<string>();
      if (plotsRef.current && Object.keys(plotsRef.current).length > 0) {
        let boxHit: any = null;
        let boxCentreD = Infinity;
        let boxArea = Infinity;
        const BOX_PAD = 6;
        for (const [, items] of Object.entries(plotsRef.current)) {
          for (const item of items) {
            const b = item.bounds;
            if (!b || b.length !== 4) continue;
            const boxId = `${item.raw}|${item.x},${item.y}`;
            if (seenBoxIds.has(boxId)) continue;
            seenBoxIds.add(boxId);
            const bx0 = Math.min(b[0], b[2]) - BOX_PAD;
            const bx1 = Math.max(b[0], b[2]) + BOX_PAD;
            const by0 = Math.min(b[1], b[3]) - BOX_PAD;
            const by1 = Math.max(b[1], b[3]) + BOX_PAD;
            if (xy.x >= bx0 && xy.x <= bx1 && xy.y >= by0 && xy.y <= by1) {
              const cdx = item.x - xy.x;
              const cdy = item.y - xy.y;
              const cd = cdx * cdx + cdy * cdy;
              const a = (bx1 - bx0) * (by1 - by0);
              // nearest centre wins; area only breaks an exact tie
              if (cd < boxCentreD || (cd === boxCentreD && a < boxArea)) {
                boxCentreD = cd;
                boxArea = a;
                boxHit = item;
              }
            }
          }
        }
        if (boxHit) bestParcel = boxHit;
      }

      // 1a-bis. Polygon hit-test (Option B, doc 19 B3/B6). Where the scheme has
      // real parcel rings (extracted from the sheet's boundary linework), a
      // click inside the polygon selects that parcel by containment -- not by
      // label proximity. Geometry ships as a delta-int32 binary decoded in a Web
      // Worker (0.89 MB across six schemes, vs 43.4 MB of inline JSON rings);
      // the hit is joined back to a record by the plot number the worker
      // returns. The label-box and nearest-point scans below stay as the
      // fallback for records without a ring.
      if (!bestParcel && activeParcelsRef.current) {
        const hit = await activeParcelsRef.current.hit(xy.x, xy.y);
        if (hit) {
          // join the ring back to a plots.json record by number
          const num = hit.key;
          for (const [, items] of Object.entries(plotsRef.current || {})) {
            const m = items.find((it: any) =>
              String(it.number) === num ||
              String(it.finalPlot || '').replace('FP-', '') === num);
            if (m) {
              bestParcel = m;
              (bestParcel as any).__ringEstimated = hit.isEstimated;
              (bestParcel as any).__ringCentroid = hit.centroid;
              (bestParcel as any).__ringVertices = hit.nVertices;
              break;
            }
          }
        }
      }

      // 1b. Nearest-point scan: TP6 (no label boxes) and any click that fell
      // in a gap between labels. TP6's generator indexes each record under
      // both `284` and `FP-284` (recalibrate_expressway_and_tp6.py:189-193),
      // so the scan would test every anchor twice — dedupe by record id.
      const seenPlotIds = new Set<string>();
      if (!bestParcel && plotsRef.current && Object.keys(plotsRef.current).length > 0) {
        for (const [, items] of Object.entries(plotsRef.current)) {
          for (const item of items) {
            const itemId = `${item.raw}|${item.x},${item.y}`;
            if (seenPlotIds.has(itemId)) continue;
            seenPlotIds.add(itemId);
            const dx = item.x - xy.x;
            if (Math.abs(dx) > minDist) continue;
            const dy = item.y - xy.y;
            if (Math.abs(dy) > minDist) continue;
            const d2 = dx * dx + dy * dy;
            if (d2 < minD2) {
              minD2 = d2;
              minDist = Math.sqrt(d2);
              bestParcel = item;
            }
          }
        }
      }

      // 2. Fallback to loaded surveys if no direct plot hit
      if (!bestParcel && schemeMatch) {
        const schemeKey = `dholera_tp${schemeMatch[1]}`;
        const surveyList = surveysRef.current[schemeKey] || [];
        for (const item of surveyList) {
          const dx = item.cadastralX - xy.x;
          if (Math.abs(dx) > minDist) continue;
          const dy = item.cadastralY - xy.y;
          if (Math.abs(dy) > minDist) continue;
          const d2 = dx * dx + dy * dy;
          if (d2 < minD2) {
            minD2 = d2;
            minDist = Math.sqrt(d2);
            bestParcel = {
              ...item,
              x: item.cadastralX,
              y: item.cadastralY,
              raw: item.finalPlot.replace(/[^0-9]/g, '') || item.surveyNo,
              type: item.finalPlot && !item.finalPlot.includes('Pending') ? 'fp' : 'survey',
            };
          }
        }
      }

      if (bestParcel) {
        const label =
          bestParcel.displayLabel ||
          bestParcel.finalPlot ||
          (bestParcel.surveyNo ? `Survey ${bestParcel.surveyNo}` : `Plot ${bestParcel.number || bestParcel.raw}`);
        const isFP = bestParcel.type === 'plot';
        const icon = createReticleIcon(L, label, isFP);

        const targetCoord: [number, number] = [bestParcel.x, bestParcel.y];
        const markerLatLng = map.unproject(targetCoord, MAXZ);
        markerRef.current = L.marker(markerLatLng, { icon }).addTo(map);

        // Single source of truth for the statutory envelope (docs/04 §A.2):
        // the click path and the search path must not disagree. Width falls
        // back to 18 when the record has none; getSchemeDGDCR flags the result.
        const clickSchemeId =
          bestParcel.schemeId || activeSheet.schemeId || `dholera_tp${schemeMatch ? schemeMatch[1] : '1'}`;
        const clickWidth = Number(bestParcel.roadWidthM);
        const d = getSchemeDGDCR(clickSchemeId, Number.isFinite(clickWidth) && clickWidth > 0 ? clickWidth : 18);

        setClickedPt(
          { x: bestParcel.x, y: bestParcel.y },
          {
            id: bestParcel.id || `${activeSheet.sid}-${bestParcel.raw || bestParcel.number || bestParcel.surveyNo}`,
            surveyNo: bestParcel.surveyNo || '—',
            finalPlot: bestParcel.finalPlot || `FP-${bestParcel.raw || bestParcel.number}`,
            schemeId: clickSchemeId,
            schemeName: bestParcel.schemeName || activeSheet.label,
            village: bestParcel.village || (activeSheet.sector === 'TP 6' ? 'Bavaliyari' : activeSheet.sector === 'TP 2' ? 'Hebatpur' : 'Ambli'),
            subSector: bestParcel.subSector || activeSubSector || activeSheet.pocketId || activeSheet.sector,
            cadastralX: bestParcel.x,
            cadastralY: bestParcel.y,
            lat: bestParcel.lat || 22.25,
            lng: bestParcel.lng || 72.18,
            zone: bestParcel.zone || d.zone,
            zoneCode: bestParcel.zoneCode || d.zoneCode,
            roadWidthM: Number.isFinite(clickWidth) && clickWidth > 0 ? clickWidth : 18,
            maxFAR: d.maxFAR,
            maxHeightM: d.maxHeightM,
            heightDesc: d.heightDesc,
            groundCoveragePct: d.groundCoveragePct,
            setbacks: d.setbacks,
            permittedUses: bestParcel.permittedUses || d.permittedUses,
            statutoryTable: d.statutoryTable,
            isEstimated: d.isEstimated,
            dataSource: d.dataSource,
            allottedAreaSqM: bestParcel.allottedAreaSqM || undefined,
            allottedAreaSqYd: bestParcel.allottedAreaSqYd || undefined,
            legalStatus: bestParcel.legalStatus || 'Sanctioned Preliminary Scheme (Sec 50 Act 1976)',
            allottedFromSurvey: bestParcel.allottedFromSurvey || '',
            // Option B (doc 19 B3/B6): carry the measured boundary ring through
            // to the panel so it can disclose verified geometry. Since B6 the
            // ring itself lives in the binary (worker-side); the panel only
            // needs the estimated flag and centroid.
            ringEstimated: !!(bestParcel as any).__ringEstimated || !!(bestParcel as any).ringEstimated,
            ringCentroid: ((bestParcel as any).__ringCentroid as [number, number] | undefined) || undefined,
            ringVertexCount: ((bestParcel as any).__ringVertices as number | undefined) ?? 0,
          } as any
        );
        setInfoSheetOpen(true);
      } else {
        setClickedPt(null, null);
      }
    }

    map.on('click', handleClick);
    return () => {
      try {
        map.off('click', handleClick);
      } catch {}
    };
  }, [loaded, activeSheet, activeSubSector, clearFly, setClickedPt, setInfoSheetOpen]);

  // 4. Handle fly requests with fast smooth camera glides
  useEffect(() => {
    if (!mapRef.current || !flyTarget || !loaded || !activeSheet) return;
    const L = (window as any).L;
    if (!L) return;

    // Wait until sheet has changed to fly target's masterSid
    if (activeSheet.sid !== flyTarget.sid) return;

    const map = mapRef.current;
    const targetLatLng = map.unproject([flyTarget.x, flyTarget.y], MAXZ);
    const zoomToUse = flyTarget.zoom || 3.6;

    try {
      if ((map as any)._loaded) {
        map.flyTo(targetLatLng, zoomToUse, {
          duration: 0.8, // Fast smooth camera glide
          easeLinearity: 0.25,
        });
      } else {
        map.setView(targetLatLng, zoomToUse);
      }
    } catch (err) {
      console.warn('flyTo protected execution:', err);
      try {
        map.setView(targetLatLng, zoomToUse);
      } catch {}
    }

    // Remove any previous marker
    if (markerRef.current) {
      try {
        map.removeLayer(markerRef.current);
      } catch {}
      markerRef.current = null;
    }

    // ONLY drop a reticle marker if explicitly requested as a parcel selection (e.g. from search)
    if (flyTarget.isParcelSelection) {
      const label =
        selectedSurvey?.displayLabel ||
        selectedSurvey?.finalPlot ||
        (selectedSurvey?.surveyNo ? `Survey ${selectedSurvey.surveyNo}` : 'Plot');
      const isFP = selectedSurvey?.type === 'plot';
      const icon = createReticleIcon(L, label, isFP);

      if (icon) {
        try {
          markerRef.current = L.marker(targetLatLng, { icon }).addTo(map);
        } catch {}
      }
    }

    const timer = setTimeout(() => {
      clearFly();
    }, 850);

    return () => clearTimeout(timer);
  }, [flyTarget, activeSheet, loaded, selectedSurvey, clearFly]);

  return (
    <div className="relative w-full h-full bg-[#ece9e2]">
      {/* Leaflet Container */}
      <div ref={mapContainerRef} className="w-full h-full outline-hidden" />

      {/* Floating Active Scheme Status Badge */}
      <div className="hidden md:flex absolute top-3 left-3 z-[900] bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-2 text-xs font-bold text-slate-800 max-w-[90vw] sm:max-w-xl">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping shrink-0" />
        <span className="truncate">
          {activeSubSector
            ? activeSubSector
            : activeSheet?.pocketId && activeSheet.pocketId !== 'Master'
            ? `${activeSheet.sector} • Sub-Map ${activeSheet.pocketId}`
            : activeSheet?.label || 'Dholera Interactive Blueprint'}
        </span>

        <span className="hidden sm:inline-block text-[10px] text-slate-500 font-medium px-1.5 py-0.5 bg-slate-100 rounded-md shrink-0 ml-auto">
          Zoom {(zoomLevel || 0).toFixed(1)}x
        </span>
      </div>

      {/* High-Speed Zoom / Fit Controls (Desktop only - mobile uses pinch-to-zoom and bottom nav) */}
      <div className="hidden md:flex absolute bottom-6 left-1/2 -translate-x-1/2 z-[900] items-center gap-1 bg-white/95 backdrop-blur-md px-2 py-1.5 rounded-2xl border border-slate-200 shadow-lg">
        <button
          onClick={() => mapRef.current?.zoomIn(1)}
          className="w-8 h-8 rounded-xl hover:bg-slate-100 text-slate-700 font-black text-base flex items-center justify-center transition cursor-pointer"
          title="Zoom In (Fast)"
        >
          +
        </button>
        <button
          onClick={() => mapRef.current?.zoomOut(1)}
          className="w-8 h-8 rounded-xl hover:bg-slate-100 text-slate-700 font-black text-base flex items-center justify-center transition cursor-pointer"
          title="Zoom Out (Fast)"
        >
          −
        </button>
        <div className="w-px h-5 bg-slate-200 mx-1" />
        <button
          onClick={() => {
            if (mapRef.current && sheetBoundsRef.current) {
              mapRef.current.fitBounds(sheetBoundsRef.current);
            }
          }}
          className="px-3 h-8 rounded-xl hover:bg-slate-100 text-slate-700 font-semibold text-xs flex items-center justify-center transition cursor-pointer whitespace-nowrap"
        >
          Fit {activeSheet?.pocketId && activeSheet.pocketId !== 'Master' ? activeSheet.pocketId : activeSheet?.sector || 'Map'}
        </button>
      </div>
    </div>
  );
}
