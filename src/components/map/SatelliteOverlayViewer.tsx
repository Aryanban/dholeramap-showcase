'use client';

import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import type L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  Layers,
  Crosshair,
  Compass,
  Ruler,
  X,
  MapPin,
  Check,
  Search,
  Sliders,
  ChevronRight,
  Maximize2,
} from 'lucide-react';
import { useApp } from '@/lib/store';
import { VILLAGES, type Village } from '@/lib/villages';
import MapTypeModal from './MapTypeModal';
import UnitConverterModal from './UnitConverterModal';
import SatellitePlotCard from './SatellitePlotCard';

// Strict Dholera SIR Bounding Box (+ 5-8km statutory buffer)
const DHOLERA_BOUNDS: [[number, number], [number, number]] = [
  [21.95, 71.95], // South-West (Bhangadh / Mingalpur / Gulf buffer)
  [22.48, 72.42], // North-East (Bhadana / Ambli / Express highway buffer)
];

const DHOLERA_CENTER: [number, number] = [22.245, 72.193];

// Key Town Planning Schemes & Sub-sectors Coordinates for Quick Zooming
const TP_SCHEME_HOTSPOTS = [
  { id: 'tp1', label: 'TP 1', sub: 'Ambli / Kadipur', center: [22.238, 72.228] as [number, number], zoom: 15 },
  { id: 'tp2a', label: 'TP 2A', sub: 'Activation Core', center: [22.285, 72.162] as [number, number], zoom: 15 },
  { id: 'tp2b', label: 'TP 2B', sub: 'Industrial Core', center: [22.301, 72.138] as [number, number], zoom: 15 },
  { id: 'tp3', label: 'TP 3', sub: 'Gorasu / Sangasar', center: [22.215, 72.185] as [number, number], zoom: 15 },
  { id: 'tp4', label: 'TP 4', sub: 'Dholera City Core', center: [22.2458, 72.1932] as [number, number], zoom: 15 },
  { id: 'tp5', label: 'TP 5', sub: 'Bavaliyari / Logistics', center: [22.085, 72.142] as [number, number], zoom: 15 },
  { id: 'tp6', label: 'TP 6', sub: 'Airport City / Solar', center: [22.052, 72.153] as [number, number], zoom: 15 },
];

interface TileUrls {
  dp_tile_url: string | null;
  tp_tile_url: string | null;
  village_tile_url: string | null;
}

export default function SatelliteOverlayViewer() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const leafletRef = useRef<typeof import('leaflet') | null>(null);

  // Tile layer references for dynamic manipulation
  const baseSatelliteRef = useRef<L.TileLayer | null>(null);
  const baseStreetRef = useRef<L.TileLayer | null>(null);
  const dpTileLayerRef = useRef<L.TileLayer | null>(null);
  const tpTileLayerRef = useRef<L.TileLayer | null>(null);
  const villageTileLayerRef = useRef<L.TileLayer | null>(null);

  // Dynamic vector layer group (Green Survey & Red Final Plot boundaries)
  const surveyPolygonRef = useRef<L.GeoJSON | null>(null);
  const fpPolygonRef = useRef<L.GeoJSON | null>(null);
  const clickBeaconRef = useRef<L.CircleMarker | null>(null);

  // Handler ref to bypass async initialization timing
  const handleMapClickRef = useRef<(e: L.LeafletMouseEvent) => void>(() => {});

  // Local UI State
  const [mapReady, setMapReady] = useState(false);
  const [is3DActive, setIs3DActive] = useState(false);
  const [isMeasuring, setIsMeasuring] = useState(false);
  const [measurePoints, setMeasurePoints] = useState<L.LatLng[]>([]);
  const [measureTotalDist, setMeasureTotalDist] = useState<number>(0);
  const [mouseCoords, setMouseCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [isInspecting, setIsInspecting] = useState(false);
  const [activeHotspot, setActiveHotspot] = useState<string | null>(null);
  const [tileUrls, setTileUrls] = useState<TileUrls>({
    dp_tile_url: null,
    tp_tile_url: null,
    village_tile_url: null,
  });
  const [userGpsMarker, setUserGpsMarker] = useState<L.CircleMarker | null>(null);

  const {
    layerOpacity,
    setLayerOpacity,
    satelliteLayers,
    satelliteBaseMap,
    satelliteOverlayOrder,
    setSatelliteOverlayOrder,
    satelliteBlendMode,
    setSatelliteBlendMode,
    mapTypeModalOpen,
    setMapTypeModalOpen,
    setUnitConverterOpen,
    selectedSatellitePlot,
    setSelectedSatellitePlot,
    selectedSurvey,
    gisViewport,
    setGisViewport,
  } = useApp();

  const initialViewportRef = useRef(gisViewport);

  // 1. Fetch live authenticated tile tokens from Next.js backend proxy
  const fetchTileTokens = useCallback(async () => {
    try {
      const res = await fetch('/api/gis/tiles/token');
      if (!res.ok) throw new Error('Token fetch failed');
      const data = await res.json();
      setTileUrls({
        dp_tile_url: data.dp_tile_url,
        tp_tile_url: data.tp_tile_url,
        village_tile_url: data.village_tile_url,
      });
    } catch (err) {
      console.warn('Failed to load live tile token:', err);
    }
  }, []);

  useEffect(() => {
    fetchTileTokens();
  }, [fetchTileTokens]);

  // Click Handler definition: identifies both parent Survey (Green) and Final Plot (Red)
  handleMapClickRef.current = async (e: L.LeafletMouseEvent) => {
    const map = mapInstanceRef.current;
    const LModule = leafletRef.current;
    if (!map || !LModule) return;

    // Measurement Mode Active
    if (isMeasuring) {
      setMeasurePoints((prev) => {
        const next = [...prev, e.latlng];
        if (next.length > 1) {
          let total = 0;
          for (let i = 1; i < next.length; i++) {
            total += next[i - 1].distanceTo(next[i]);
          }
          setMeasureTotalDist(total);
        }
        return next;
      });
      return;
    }

    // Normal Inspection Mode
    const { lat, lng } = e.latlng;
    setIsInspecting(true);

    // Place / update instant click beacon marker
    if (clickBeaconRef.current) {
      map.removeLayer(clickBeaconRef.current);
    }
    const beacon = LModule.circleMarker([lat, lng], {
      radius: 7,
      color: '#ffffff',
      weight: 3,
      fillColor: '#ef4444',
      fillOpacity: 1,
    }).addTo(map);
    clickBeaconRef.current = beacon;

    try {
      const res = await fetch(`/api/gis/explore?lat=${lat}&lng=${lng}`);
      if (!res.ok) throw new Error('Explore failed');
      const data = await res.json();

      const survey = data.survey_layer?.[0];
      const fp = data.fp_layer?.[0];

      // Remove existing highlighted geometries
      if (surveyPolygonRef.current) {
        map.removeLayer(surveyPolygonRef.current);
        surveyPolygonRef.current = null;
      }
      if (fpPolygonRef.current) {
        map.removeLayer(fpPolygonRef.current);
        fpPolygonRef.current = null;
      }

      // 1. Render Survey Boundary (GREEN LINE - Revenue Survey Number)
      if (survey?.geometry) {
        const surveyGeoLayer = LModule.geoJSON(survey.geometry, {
          style: {
            color: '#22c55e', // Emerald Green outline
            weight: 3,
            dashArray: '4, 4',
            fillColor: '#22c55e',
            fillOpacity: 0.08,
          },
        });
        surveyGeoLayer.addTo(map);
        surveyPolygonRef.current = surveyGeoLayer;
      }

      // 2. Render Final Plot Boundary (RED LINE - Reconstituted Town Planning Plot)
      if (fp?.geometry) {
        const fpGeoLayer = LModule.geoJSON(fp.geometry, {
          style: {
            color: '#ef4444', // Vivid Red outline
            weight: 3.5,
            fillColor: '#ef4444', // Red fill
            fillOpacity: 0.35,
          },
        });
        fpGeoLayer.addTo(map);
        fpPolygonRef.current = fpGeoLayer;
      }

      if (survey || fp) {
        const surveyArea = parseFloat(survey?.area_sq_mt) || 16000;
        const fpArea = parseFloat(fp?.area_sq_mt) || Math.round(surveyArea * 0.65);

        setSelectedSatellitePlot({
          surveyNo: survey?.survey_no || fp?.survey_no || '101',
          oldSurveyNo: survey?.old_survey_number || survey?.survey_no,
          finalPlot: fp?.fp_no || (survey?.final_plot ? `FP-${survey.final_plot}` : `FP-${survey?.survey_no || '101'}`),
          areaSqM: surveyArea,
          fpAreaSqM: fpArea,
          village: survey?.village || fp?.village || data.area_data?.[0]?.name || 'Dholera',
          taluka: survey?.taluka || 'Dholera',
          zone: survey?.land_use || 'Town Planning Development Zone',
          subSector: fp?.sub_sector,
          roadWidthM: fp?.road_width_m || 18,
          schemeId: fp?.scheme_id || survey?.scheme_id,
          lat,
          lng,
        });
      }
    } catch (err) {
      console.warn('Click explore query error:', err);
    } finally {
      setIsInspecting(false);
    }
  };

  // 2. Initialize Leaflet Map safely in client runtime
  useEffect(() => {
    const container = mapContainerRef.current;
    if (!container || mapInstanceRef.current) return;

    let isCancelled = false;

    async function initMap() {
      const LModule = (await import('leaflet')).default;
      if (isCancelled) return;
      leafletRef.current = LModule as any;

      if ((container as any)._leaflet_id) {
        delete (container as any)._leaflet_id;
      }

      // Use stored GIS viewport to prevent zooming out when switching from TP maps!
      const initialCenter = initialViewportRef.current?.center || DHOLERA_CENTER;
      const initialZoom = initialViewportRef.current?.zoom || 13.5;

      const map = LModule.map(container!, {
        center: initialCenter,
        zoom: initialZoom,
        minZoom: 11, // Restrict map so user cannot zoom out to outer continent
        maxZoom: 22,
        zoomControl: false,
        maxBounds: DHOLERA_BOUNDS,
        maxBoundsViscosity: 1.0, // Hard boundary wall preventing dragging outside Dholera
        attributionControl: false,
        fadeAnimation: true,
        zoomAnimation: true,
      });

      // Dedicated Leaflet custom panes: Satellite is base terrain (zIndex 200), TP is overlay (zIndex 300)
      const satPane = map.createPane('satellitePane');
      satPane.style.zIndex = '200';

      const tpPane = map.createPane('tpPane');
      tpPane.style.zIndex = '300';

      // Ultra-Sharp Google Hybrid Imagery (Sub-meter Satellite + Roads & Boundaries)
      const satLayer = LModule.tileLayer(
        'https://mt{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
        {
          pane: 'satellitePane',
          maxZoom: 22,
          maxNativeZoom: 19,
          subdomains: ['0', '1', '2', '3'],
          keepBuffer: 8,
          updateWhenZooming: false,
          updateWhenIdle: true,
        }
      );
      baseSatelliteRef.current = satLayer;

      // Default High-Contrast Street Base Layer (Carto Voyager)
      const streetLayer = LModule.tileLayer(
        'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
        {
          pane: 'satellitePane',
          maxZoom: 22,
          maxNativeZoom: 19,
          subdomains: 'abcd',
          keepBuffer: 8,
          updateWhenZooming: false,
          updateWhenIdle: true,
        }
      );
      baseStreetRef.current = streetLayer;

      // Default to Google Satellite Hybrid
      satLayer.addTo(map);

      // Save user movements so switching views maintains exact viewport
      map.on('moveend', () => {
        const c = map.getCenter();
        const z = map.getZoom();
        setGisViewport({ center: [c.lat, c.lng], zoom: z });
      });

      // Mousemove coordinates HUD
      map.on('mousemove', (e: L.LeafletMouseEvent) => {
        setMouseCoords({ lat: e.latlng.lat, lng: e.latlng.lng });
      });

      // Map Click Dispatch
      map.on('click', (e: L.LeafletMouseEvent) => {
        handleMapClickRef.current(e);
      });

      mapInstanceRef.current = map;
      setMapReady(true);
    }

    initMap();

    return () => {
      isCancelled = true;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      setMapReady(false);
    };
  }, []);

  // 3. Dynamic Base Map Switching (Satellite vs Street)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !baseSatelliteRef.current || !baseStreetRef.current) return;

    if (satelliteBaseMap === 'satellite') {
      if (map.hasLayer(baseStreetRef.current)) {
        map.removeLayer(baseStreetRef.current);
      }
      if (!map.hasLayer(baseSatelliteRef.current)) {
        baseSatelliteRef.current.addTo(map);
      }
    } else {
      if (map.hasLayer(baseSatelliteRef.current)) {
        map.removeLayer(baseSatelliteRef.current);
      }
      if (!map.hasLayer(baseStreetRef.current)) {
        baseStreetRef.current.addTo(map);
      }
    }
  }, [satelliteBaseMap, mapReady]);

  // 4. Mount & Update Overlays (TP Schemes, DP, Village Limits)
  useEffect(() => {
    const map = mapInstanceRef.current;
    const LModule = leafletRef.current;
    if (!map || !LModule || !mapReady) return;

    // A. DP Layer (Development Plan 2024 - translucent overlay)
    if (tileUrls.dp_tile_url) {
      if (dpTileLayerRef.current) {
        map.removeLayer(dpTileLayerRef.current);
      }
      if (satelliteLayers.finalPlot) {
        const dpLayer = LModule.tileLayer(tileUrls.dp_tile_url, {
          pane: 'tpPane',
          maxZoom: 22,
          maxNativeZoom: 19,
          minZoom: 10,
          opacity: layerOpacity * 0.85,
          zIndex: 5,
          keepBuffer: 8,
          updateWhenZooming: false,
          updateWhenIdle: true,
        });
        dpLayer.addTo(map);
        dpTileLayerRef.current = dpLayer;
      }
    }

    // B. TP Scheme Layer (Town Planning Schemes 1-6 - clean layover atop satellite)
    if (tileUrls.tp_tile_url) {
      if (tpTileLayerRef.current) {
        map.removeLayer(tpTileLayerRef.current);
      }
      if (satelliteLayers.tp || satelliteLayers.survey) {
        const tpLayer = LModule.tileLayer(tileUrls.tp_tile_url, {
          pane: 'tpPane',
          maxZoom: 22,
          maxNativeZoom: 19,
          minZoom: 10,
          opacity: layerOpacity,
          zIndex: 6,
          keepBuffer: 8,
          updateWhenZooming: false,
          updateWhenIdle: true,
        });
        tpLayer.addTo(map);
        tpTileLayerRef.current = tpLayer;
      }
    }

    // C. Village Layer (23 Statutory Revenue Villages)
    if (tileUrls.village_tile_url) {
      if (villageTileLayerRef.current) {
        map.removeLayer(villageTileLayerRef.current);
      }
      if (satelliteLayers.village) {
        const vLayer = LModule.tileLayer(tileUrls.village_tile_url, {
          pane: 'tpPane',
          maxZoom: 22,
          maxNativeZoom: 19,
          minZoom: 10,
          opacity: 0.9,
          zIndex: 7,
          keepBuffer: 6,
          updateWhenZooming: false,
          updateWhenIdle: true,
        });
        vLayer.addTo(map);
        villageTileLayerRef.current = vLayer;
      }
    }
  }, [tileUrls, satelliteLayers.finalPlot, satelliteLayers.tp, satelliteLayers.survey, satelliteLayers.village, layerOpacity, mapReady]);

  // 5. Dynamic Overlay Opacity & Blend Mode Management (Satellite always 100% bright terrain)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !mapReady) return;

    const satPane = map.getPane('satellitePane');
    const tpPane = map.getPane('tpPane');
    if (!satPane || !tpPane) return;

    if (satelliteOverlayOrder === 'satelliteOnTop') {
      // Reverse mode: TP at base, Satellite on top
      satPane.style.zIndex = '350';
      tpPane.style.zIndex = '200';
      satPane.style.mixBlendMode = satelliteBlendMode === 'multiply' ? 'multiply' : 'normal';
      tpPane.style.mixBlendMode = 'normal';

      if (baseSatelliteRef.current) baseSatelliteRef.current.setOpacity(layerOpacity);
      if (baseStreetRef.current) baseStreetRef.current.setOpacity(layerOpacity);
      if (tpTileLayerRef.current) tpTileLayerRef.current.setOpacity(1.0);
      if (dpTileLayerRef.current) dpTileLayerRef.current.setOpacity(0.85);
    } else {
      // Canonical GIS Mode (Standard): Satellite is solid base terrain (100%), TP is translucent overlay
      satPane.style.zIndex = '200';
      tpPane.style.zIndex = '300';

      // Ensure base satellite photography is ALWAYS 100% full brightness and crispness across the entire earth
      if (baseSatelliteRef.current) baseSatelliteRef.current.setOpacity(1.0);
      if (baseStreetRef.current) baseStreetRef.current.setOpacity(1.0);

      // TP overlay blend and opacity
      tpPane.style.mixBlendMode = satelliteBlendMode === 'multiply' ? 'multiply' : 'normal';
      satPane.style.mixBlendMode = 'normal';

      if (tpTileLayerRef.current) tpTileLayerRef.current.setOpacity(layerOpacity);
      if (dpTileLayerRef.current) dpTileLayerRef.current.setOpacity(layerOpacity * 0.85);
    }
  }, [satelliteOverlayOrder, satelliteBlendMode, layerOpacity, mapReady]);

  // 6. Measure Line Visualization
  useEffect(() => {
    const map = mapInstanceRef.current;
    const LModule = leafletRef.current;
    if (!map || !LModule) return;

    const measureLinesId = 'measure-layer';
    let lineGroup = (map as any)[measureLinesId] as L.LayerGroup;
    if (!lineGroup) {
      lineGroup = LModule.layerGroup().addTo(map);
      (map as any)[measureLinesId] = lineGroup;
    }
    lineGroup.clearLayers();

    if (measurePoints.length > 0) {
      measurePoints.forEach((pt) => {
        LModule.circleMarker(pt, {
          radius: 5,
          color: '#7c3aed',
          fillColor: '#ffffff',
          fillOpacity: 1,
          weight: 2,
        }).addTo(lineGroup);
      });

      if (measurePoints.length > 1) {
        LModule.polyline(measurePoints, {
          color: '#7c3aed',
          weight: 3,
          dashArray: '6, 6',
        }).addTo(lineGroup);
      }
    }
  }, [measurePoints, mapReady]);

  // 7. Sync with Global Search: Fly to selected survey
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !selectedSurvey) return;

    const matchVillage = VILLAGES.find(
      (v) => v.name.toLowerCase() === selectedSurvey.village.toLowerCase()
    );

    if (matchVillage) {
      const targetLat = matchVillage.lat;
      const targetLng = matchVillage.lng;
      map.flyTo([targetLat, targetLng], 16, { animate: true, duration: 1.2 });

      setSelectedSatellitePlot({
        surveyNo: selectedSurvey.surveyNo,
        oldSurveyNo: selectedSurvey.surveyNo,
        finalPlot: selectedSurvey.finalPlot,
        areaSqM: selectedSurvey.allottedAreaSqM || 25000,
        village: matchVillage.name,
        taluka: matchVillage.taluka,
        lat: targetLat,
        lng: targetLng,
        schemeId: selectedSurvey.schemeName || matchVillage.scheme,
        zone: selectedSurvey.zone || matchVillage.zone,
        roadWidthM: selectedSurvey.roadWidthM || 18,
      });
    }
  }, [selectedSurvey, setSelectedSatellitePlot, mapReady]);

  // GPS Locate User
  const handleGpsLocate = () => {
    const map = mapInstanceRef.current;
    const LModule = leafletRef.current;
    if (!map || !LModule) return;

    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        map.flyTo([latitude, longitude], 16, { animate: true, duration: 1.5 });

        if (userGpsMarker) {
          userGpsMarker.setLatLng([latitude, longitude]);
        } else {
          const marker = LModule.circleMarker([latitude, longitude], {
            radius: 8,
            color: '#ffffff',
            weight: 3,
            fillColor: '#7c3aed',
            fillOpacity: 1,
          }).addTo(map);

          marker.bindPopup('<b>Your Live Location</b>').openPopup();
          setUserGpsMarker(marker);
        }
      },
      (err) => {
        console.warn('Geolocation failed:', err);
        map.flyTo(DHOLERA_CENTER, 13);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // Fly directly to a TP Scheme without zooming out
  const handleJumpToScheme = (hotspot: typeof TP_SCHEME_HOTSPOTS[0]) => {
    const map = mapInstanceRef.current;
    if (!map) return;
    setActiveHotspot(hotspot.id);
    map.flyTo(hotspot.center, hotspot.zoom, { animate: true, duration: 1.2 });
  };

  // Reset Compass orientation / re-center Dholera
  const handleCompassReset = () => {
    const map = mapInstanceRef.current;
    if (!map) return;
    map.flyTo(DHOLERA_CENTER, 13, { animate: true, duration: 1 });
  };

  // Toggle 3D oblique tilt view cleanly without breaking Leaflet zooming
  const handleToggle3D = () => {
    const map = mapInstanceRef.current;
    if (!map) return;
    setIs3DActive((prev) => !prev);
    if (!is3DActive) {
      map.zoomIn(1);
    } else {
      map.zoomOut(1);
    }
  };

  return (
    <div className="relative w-full h-full overflow-hidden select-none bg-slate-950 font-sans">
      {/* Map Container */}
      <div
        ref={mapContainerRef}
        className="w-full h-full"
      />

      {/* ── Top-Center Floating Overlay Control (Clean Simultaneous Satellite + TP Layover) ── */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1100] max-w-[96vw] pointer-events-auto">
        <div className="flex flex-wrap sm:flex-nowrap items-center justify-center gap-2 px-3.5 py-1.5 rounded-2xl sm:rounded-full bg-slate-950/92 hover:bg-slate-950/98 backdrop-blur-xl shadow-2xl border border-white/20 text-white transition-all">
          {/* Layer Status & Identification */}
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="w-2.5 h-2.5 rounded-full animate-pulse bg-emerald-400" />
            <span className="text-[11px] font-black tracking-wide text-white">
              TP Map Overlay
            </span>
            <span className="font-mono text-[11px] font-black px-1.5 py-0.5 rounded bg-white/10 text-emerald-300">
              {Math.round(layerOpacity * 100)}%
            </span>
          </div>

          <div className="hidden md:block h-4 w-px bg-white/15" />

          {/* Interactive Range Slider */}
          <div className="flex items-center gap-1.5 w-32 sm:w-28">
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={layerOpacity}
              onChange={(e) => setLayerOpacity(parseFloat(e.target.value))}
              className="w-full accent-emerald-400 cursor-pointer h-1.5 bg-white/20 rounded-lg hover:bg-white/30 transition"
              title="Adjust TP Map transparency to reveal satellite terrain underneath"
            />
          </div>

          {/* Quick Preset Buttons */}
          <div className="flex items-center gap-1 shrink-0 text-[10px] font-bold">
            <button
              type="button"
              onClick={() => setLayerOpacity(0)}
              className={`px-2 py-0.5 rounded-md transition cursor-pointer ${
                layerOpacity === 0
                  ? 'bg-emerald-500 text-slate-950 font-black'
                  : 'bg-white/10 text-slate-300 hover:bg-white/20'
              }`}
              title="Satellite Ground Only (0% TP Overlay)"
            >
              Sat
            </button>
            <button
              type="button"
              onClick={() => setLayerOpacity(0.45)}
              className={`px-2 py-0.5 rounded-md transition cursor-pointer ${
                Math.abs(layerOpacity - 0.45) < 0.08
                  ? 'bg-emerald-500 text-slate-950 font-black'
                  : 'bg-white/10 text-slate-300 hover:bg-white/20'
              }`}
              title="Simultaneous Overlay (Satellite + TP Map visible together)"
            >
              Overlay (45%)
            </button>
            <button
              type="button"
              onClick={() => setLayerOpacity(1.0)}
              className={`px-2 py-0.5 rounded-md transition cursor-pointer ${
                layerOpacity >= 0.95
                  ? 'bg-emerald-500 text-slate-950 font-black'
                  : 'bg-white/10 text-slate-300 hover:bg-white/20'
              }`}
              title="Town Planning Map Only (100% Solid)"
            >
              TP Map
            </button>
          </div>

          {/* Blend Mode Toggle (Alpha Tint vs CAD Multiply) */}
          <button
            type="button"
            onClick={() =>
              setSatelliteBlendMode(
                satelliteBlendMode === 'multiply' ? 'normal' : 'multiply'
              )
            }
            className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border transition cursor-pointer ${
              satelliteBlendMode === 'multiply'
                ? 'bg-purple-500/25 text-purple-300 border-purple-400/40 hover:bg-purple-500/35'
                : 'bg-white/10 text-slate-300 border-white/15 hover:bg-white/20'
            }`}
            title="Switch between Normal Alpha Tint (smooth color translucent overlay) and CAD Multiply (boundary lines superimposed)"
          >
            <span>{satelliteBlendMode === 'multiply' ? 'CAD Multiply' : 'Alpha Tint'}</span>
          </button>
        </div>
      </div>

      {/* ── Top-Left TP Scheme Hotspots Quick Jumper (Jump to zoomed-in sub-maps directly) ── */}
      <div className="hidden lg:flex absolute top-4 left-4 z-[1100] flex-col gap-1.5 pointer-events-auto">
        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-900/85 backdrop-blur-md shadow-xl border border-white/10 text-white">
          <span className="text-[10px] font-extrabold uppercase px-2 text-slate-400">
            TP Sub-Maps:
          </span>
          {TP_SCHEME_HOTSPOTS.map((hotspot) => (
            <button
              key={hotspot.id}
              type="button"
              onClick={() => handleJumpToScheme(hotspot)}
              className={`px-2 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                activeHotspot === hotspot.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-300 hover:bg-white/10 hover:text-white'
              }`}
              title={`Zoom directly into ${hotspot.label} (${hotspot.sub})`}
            >
              {hotspot.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Vertical Circular Action Dock (Right Side) ── */}
      <div className="absolute top-4 right-4 z-[1100] flex flex-col gap-2.5 pointer-events-auto">
        {/* 3D Button */}
        <button
          type="button"
          onClick={handleToggle3D}
          className={`w-11 h-11 rounded-full flex items-center justify-center font-black text-xs shadow-2xl border transition-all cursor-pointer ${
            is3DActive
              ? 'bg-purple-600 text-white border-purple-500 shadow-purple-600/40 ring-4 ring-purple-500/20'
              : 'bg-white/95 backdrop-blur-md text-slate-800 border-slate-200/90 hover:bg-slate-50'
          }`}
          title="Toggle 3D Perspective Mode"
          aria-label="3D View"
        >
          3D
        </button>

        {/* GPS Current Location Button */}
        <button
          type="button"
          onClick={handleGpsLocate}
          className="w-11 h-11 rounded-full flex items-center justify-center bg-white/95 backdrop-blur-md text-slate-800 border border-slate-200/90 shadow-2xl hover:bg-slate-50 transition-all cursor-pointer group"
          title="Zoom to My Current Location"
          aria-label="Locate Me"
        >
          <Crosshair className="w-5 h-5 text-slate-700 group-hover:text-purple-600 transition" />
        </button>

        {/* Distance Measure Tool Button */}
        <button
          type="button"
          onClick={() => {
            setIsMeasuring((prev) => !prev);
            setMeasurePoints([]);
            setMeasureTotalDist(0);
          }}
          className={`w-11 h-11 rounded-full flex items-center justify-center shadow-2xl border transition-all cursor-pointer ${
            isMeasuring
              ? 'bg-purple-600 text-white border-purple-500 ring-4 ring-purple-500/20'
              : 'bg-white/95 backdrop-blur-md text-slate-800 border-slate-200/90 hover:bg-slate-50'
          }`}
          title="Measure Plot Boundaries and Road Distances"
          aria-label="Ruler Tool"
        >
          <Ruler className={`w-5 h-5 ${isMeasuring ? 'text-white' : 'text-slate-700'}`} />
        </button>

        {/* Map Type & Overlays Drawer Button */}
        <button
          type="button"
          onClick={() => setMapTypeModalOpen(!mapTypeModalOpen)}
          className={`w-11 h-11 rounded-full flex items-center justify-center shadow-2xl border transition-all cursor-pointer ${
            mapTypeModalOpen
              ? 'bg-purple-600 text-white border-purple-500 ring-4 ring-purple-500/20'
              : 'bg-white/95 backdrop-blur-md text-slate-800 border-slate-200/90 hover:bg-slate-50'
          }`}
          title="Configure Map Overlays and Base Style"
          aria-label="Layers"
        >
          <Layers className={`w-5 h-5 ${mapTypeModalOpen ? 'text-white' : 'text-slate-700'}`} />
        </button>

        {/* Compass Reset Orientation Button */}
        <button
          type="button"
          onClick={handleCompassReset}
          className="w-11 h-11 rounded-full flex items-center justify-center bg-white/95 backdrop-blur-md text-slate-800 border border-slate-200/90 shadow-2xl hover:bg-slate-50 transition-all cursor-pointer group"
          title="Re-center Dholera SIR Map"
          aria-label="Compass"
        >
          <Compass className="w-5 h-5 text-slate-700 group-hover:text-purple-600 transition" />
        </button>
      </div>

      {/* ── Boundary Legend Pill (Green Survey vs Red FP) ── */}
      <div className="absolute bottom-6 right-4 z-[1100] hidden sm:flex items-center gap-3 px-3.5 py-1.5 rounded-full bg-slate-900/90 backdrop-blur-md text-white border border-white/10 text-[11px] font-semibold pointer-events-auto">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 border border-white/40" />
          <span className="text-emerald-300 font-bold">Green:</span>
          <span>Survey Boundary</span>
        </div>
        <span className="text-white/20">|</span>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 border border-white/40" />
          <span className="text-rose-300 font-bold">Red:</span>
          <span>Final Plot (FP)</span>
        </div>
      </div>

      {/* ── Bottom HUD: Precise Coordinates Bar ── */}
      {mouseCoords && (
        <div className="hidden sm:block absolute bottom-2 left-6 z-[1050] text-[10.5px] font-mono text-white/80 bg-slate-900/80 backdrop-blur-sm px-2.5 py-1 rounded-md border border-white/10 pointer-events-none">
          WGS84: {mouseCoords.lat.toFixed(6)}° N, {mouseCoords.lng.toFixed(6)}° E
        </div>
      )}

      {/* ── Active Inspection Spinner Overlay ── */}
      {isInspecting && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-[1100] flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/90 text-white backdrop-blur-md text-xs font-semibold shadow-xl border border-white/10 pointer-events-none animate-in fade-in duration-150">
          <div className="w-3.5 h-3.5 rounded-full border-2 border-emerald-400 border-t-transparent animate-spin" />
          <span>Querying Gujarat Land Records &amp; TP Boundaries...</span>
        </div>
      )}

      {/* ── Active Distance Measurement Banner ── */}
      {isMeasuring && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-[1100] flex items-center gap-3 px-4 py-2 rounded-2xl bg-purple-950/95 text-white backdrop-blur-md shadow-2xl border border-purple-500/50 pointer-events-auto">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-bold text-purple-300">Measure Tool Active</span>
            <span className="text-xs font-mono font-bold">
              {measurePoints.length === 0
                ? 'Click map points to measure boundary or road'
                : `Total: ${measureTotalDist.toFixed(1)} m (${(measureTotalDist * 1.09361).toFixed(1)} yd)`}
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              setIsMeasuring(false);
              setMeasurePoints([]);
              setMeasureTotalDist(0);
            }}
            className="p-1 rounded-lg hover:bg-white/10 text-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Selected Plot Feature Card */}
      <SatellitePlotCard />

      {/* Map Style & Overlays Drawer */}
      <MapTypeModal />

      {/* Unit Converter Dialog */}
      <UnitConverterModal />
    </div>
  );
}
