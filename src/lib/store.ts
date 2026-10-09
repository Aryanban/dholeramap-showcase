import { create } from 'zustand';
import type { Bookmark, CadastralSurveyPoint, UserProfile, AppNotification, UserFeedback } from './types';
import { SUBSECTOR_FLY_MAP } from './sheets';
import { prewarmFlyTiles } from './tile-prewarm';
import {
  FREE_ENTITLEMENTS,
  deriveFlags,
  isAdminEmail,
  parseEntitlements,
  type EntitlementState,
} from './entitlements';

export interface ViewportInfo {
  zoomPct: number;
  cx: number;
  cy: number;
}

export interface MapFilters {
  brightness: number; // 50 - 150 (default 100)
  contrast: number;   // 50 - 200 (default 100)
  invert: boolean;     // night mode
  sharpen: boolean;
}

export interface FlyTarget {
  sid: string;
  x: number;
  y: number;
  zoom?: number;
  isParcelSelection?: boolean;
  subSectorTitle?: string;
}

export interface SatellitePlotFeature {
  surveyNo: string;
  oldSurveyNo?: string;
  finalPlot?: string;
  areaSqM: number;
  fpAreaSqM?: number;
  village: string;
  taluka: string; // e.g. Dhandhuka
  zone?: string;
  lat: number;
  lng: number;
  roadWidthM?: number;
  schemeId?: string;
  subSector?: string;
  geometry?: any;
  fpGeometry?: any;
}

export interface AppState {
  activeSid: string;
  activeSubSector: string | null;
  flyTarget: FlyTarget | null;
  clickedPt: { x: number; y: number } | null;
  selectedSurvey: CadastralSurveyPoint | null;
  browserOpen: boolean;
  infoSheetOpen: boolean;
  showMinimap: boolean;
  viewInfo: ViewportInfo;
  filters: MapFilters;
  bookmarks: Bookmark[];
  editPin: Bookmark | null;
  infoTab: 'plot' | 'edit' | 'saved';

  // ── Satellite GIS & Layer Controls (TownPlanMap Mode) ──
  mapViewMode: 'cadastral' | 'satellite';
  satelliteBaseMap: 'default' | 'satellite';
  layerOpacity: number; // 0.1 to 1.0 (default 0.75)
  satelliteLayers: {
    survey: boolean;
    finalPlot: boolean;
    village: boolean;
    tp: boolean;
  };
  satelliteOverlayOrder: "satelliteOnTop" | "tpOnTop";
  satelliteBlendMode: "multiply" | "normal";
  gisViewport: { center: [number, number]; zoom: number };
  mapTypeModalOpen: boolean;
  unitConverterOpen: boolean;
  selectedSatellitePlot: SatellitePlotFeature | null;

  // ── Mobile-first bottom-sheet navigation (one surface at a time) ──
  mobileSheet: 'none' | 'plot' | 'schemes' | 'saved';
  mobileSearchOpen: boolean;
  mobileMoreOpen: boolean;

  // User & Auth State
  user: UserProfile | null;
  notifications: AppNotification[];
  feedbackList: UserFeedback[];

  // Actions
  setActiveSid: (sid: string) => void;
  setActiveSubSector: (title: string | null) => void;
  openSheet: (sid: string) => void;
  issueFly: (
    sid: string,
    x?: number,
    y?: number,
    zoom?: number,
    isParcelSelection?: boolean,
    subSectorTitle?: string
  ) => void;
  clearFly: () => void;
  setClickedPt: (pt: { x: number; y: number } | null, survey?: CadastralSurveyPoint | null) => void;
  setBrowserOpen: (open: boolean) => void;
  setInfoSheetOpen: (open: boolean) => void;
  setInfoTab: (tab: 'plot' | 'edit' | 'saved') => void;
  setEditPin: (pin: Bookmark | null) => void;

  // Satellite GIS Actions
  setMapViewMode: (mode: 'cadastral' | 'satellite') => void;
  setSatelliteBaseMap: (base: 'default' | 'satellite') => void;
  setLayerOpacity: (opacity: number) => void;
  setSatelliteOverlayOrder: (order: "satelliteOnTop" | "tpOnTop") => void;
  setSatelliteBlendMode: (mode: "multiply" | "normal") => void;
  toggleSatelliteLayer: (layer: 'survey' | 'finalPlot' | 'village' | 'tp') => void;
  setGisViewport: (vp: { center: [number, number]; zoom: number }) => void;
  setMapTypeModalOpen: (open: boolean) => void;
  setUnitConverterOpen: (open: boolean) => void;
  setSelectedSatellitePlot: (plot: SatellitePlotFeature | null) => void;

  // Mobile one-surface-at-a-time helpers
  setMobileSheet: (sheet: 'none' | 'plot' | 'schemes' | 'saved') => void;
  setMobileSearchOpen: (open: boolean) => void;
  setMobileMoreOpen: (open: boolean) => void;
  closeAllMobile: () => void;
  toggleMinimap: () => void;
  setViewInfo: (info: ViewportInfo) => void;
  setFilter: <K extends keyof MapFilters>(key: K, val: MapFilters[K]) => void;
  resetFilters: () => void;
  addBookmark: (bm: Bookmark) => void;
  updateBookmark: (id: string, patch: Partial<Bookmark>) => void;
  removeBookmark: (id: string) => void;
  hydrateBookmarks: (list: Bookmark[]) => void;
  syncBookmarksWithCloud: () => Promise<void>;

  // User actions
  setUser: (u: UserProfile | null) => void;
  hydrateUser: () => void;

  // Notification actions
  setNotifications: (notifs: AppNotification[]) => void;
  markNotifsRead: () => void;
  addNotification: (notif: AppNotification) => void;
  hydrateNotifications: () => void;

  // Feedback actions
  submitFeedback: (fb: Omit<UserFeedback, 'id' | 'createdAt' | 'status'>) => void;
  updateFeedbackStatus: (id: string, status: UserFeedback['status']) => void;
  hydrateFeedback: () => void;

  // Entitlements
  entitlements: EntitlementState;
  hydrateEntitlements: (meta: unknown) => void;
  clearEntitlements: () => void;
}

export function getGisCoordinatesForSheet(sid: string, subSectorTitle?: string | null): { center: [number, number]; zoom: number } {
  const s = (sid || "").toLowerCase();
  const sub = (subSectorTitle || "").toLowerCase();

  if (s.includes("tp1-1a1") || sub.includes("ambli")) return { center: [22.2421, 72.2314], zoom: 15.5 };
  if (s.includes("tp1-1a2") || sub.includes("kadipur") || sub.includes("bhadiyad")) return { center: [22.2350, 72.2150], zoom: 15.5 };
  if (s.includes("tp1-1a3") || sub.includes("bhimtalav") || sub.includes("valinda")) return { center: [22.1950, 72.1850], zoom: 15.5 };
  if (s.includes("tp1-1a4") || sub.includes("gogla")) return { center: [22.2284, 72.2536], zoom: 15.5 };
  if (s.includes("tp1-1a5") || sub.includes("khun")) return { center: [22.2180, 72.2380], zoom: 15.5 };
  if (s.includes("tp1-1b") || sub.includes("umargadh") || sub.includes("central plaza")) return { center: [22.2400, 72.2100], zoom: 15.5 };
  if (s.includes("tp1")) return { center: [22.238, 72.228], zoom: 14.5 };

  if (s.includes("tp2-2a") || sub.includes("activation core") || sub.includes("hebatpur")) return { center: [22.2850, 72.1620], zoom: 15.5 };
  if (s.includes("tp2-2b") || sub.includes("industrial core") || sub.includes("bhimnath") || sub.includes("pachham")) return { center: [22.3015, 72.1382], zoom: 15.5 };
  if (s.includes("tp2")) return { center: [22.2850, 72.1620], zoom: 14.5 };

  if (s.includes("tp3") || sub.includes("gorasu") || sub.includes("sangasar")) return { center: [22.2150, 72.1850], zoom: 14.5 };
  if (s.includes("tp4") || sub.includes("mundi") || sub.includes("dholera town")) return { center: [22.2458, 72.1932], zoom: 14.5 };
  if (s.includes("tp5") || sub.includes("bavaliyari") || sub.includes("sandhida")) return { center: [22.0853, 72.1420], zoom: 14.5 };
  if (s.includes("tp6") || sub.includes("bhangadh") || sub.includes("mingalpur") || sub.includes("zankhi")) return { center: [22.0520, 72.1534], zoom: 14.5 };

  return { center: [22.245, 72.193], zoom: 13.5 };
}

const DEFAULT_FILTERS: MapFilters = {
  brightness: 100,
  contrast: 100,
  invert: false,
  sharpen: false,
};

const DEFAULT_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-welcome',
    title: 'Welcome to PlotBook Dholera',
    message: 'Official interactive atlas for Dholera Special Investment Region (SIR). Explore Town Planning Schemes 1 to 6.',
    type: 'system',
    timestamp: Date.now() - 3600000 * 24,
    read: false,
  },
  {
    id: 'notif-expressway',
    title: '250m Expressway Corridor Verified',
    message: 'Central Spine Expressway and Ahmedabad-Dholera Highway frontage alignment cross-referenced with GTPUD statutory plans.',
    type: 'broadcast',
    timestamp: Date.now() - 3600000 * 6,
    read: false,
  },
  {
    id: 'notif-dgder',
    title: 'DGDCR 2024 Planning Controls Active',
    message: 'Automated FSI, max continuous building length, and statutory setbacks enabled for all residential and industrial zones.',
    type: 'update',
    timestamp: Date.now() - 3600000 * 2,
    read: false,
  },
];

export const useApp = create<AppState>((set, get) => ({
  activeSid: 'tp1-master',
  activeSubSector: null,
  flyTarget: null,
  clickedPt: null,
  selectedSurvey: null,
  browserOpen: false,
  infoSheetOpen: false,
  showMinimap: true,
  viewInfo: { zoomPct: 100, cx: 0, cy: 0 },
  filters: DEFAULT_FILTERS,
  bookmarks: [],
  editPin: null,
  infoTab: 'plot',

  // ── Satellite GIS & Layer Controls Initial State (default to cadastral safe mode!) ──
  mapViewMode: 'cadastral',
  satelliteBaseMap: 'satellite',
  layerOpacity: 0.45,
  satelliteOverlayOrder: "tpOnTop",
  satelliteBlendMode: "normal",
  satelliteLayers: {
    survey: true,
    finalPlot: true,
    village: true,
    tp: true,
  },
  gisViewport: { center: [22.245, 72.193], zoom: 13.5 },
  mapTypeModalOpen: false,
  unitConverterOpen: false,
  selectedSatellitePlot: null,

  user: null,
  notifications: DEFAULT_NOTIFICATIONS,
  feedbackList: [],
  mobileSheet: 'none' as const,
  mobileSearchOpen: false,
  mobileMoreOpen: false,

  entitlements: FREE_ENTITLEMENTS,

  hydrateEntitlements: (meta) => {
    const parsed = parseEntitlements(meta);
    set({ entitlements: parsed });
  },
  clearEntitlements: () => {
    set({ entitlements: FREE_ENTITLEMENTS });
  },

  setActiveSid: (sid) => set({ activeSid: sid, activeSubSector: null }),
  setActiveSubSector: (title) => set({ activeSubSector: title }),
  openSheet: (sid) => {
    const subDef = SUBSECTOR_FLY_MAP[sid];
    if (subDef) {
      prewarmFlyTiles(subDef.masterSid, subDef.x, subDef.y, subDef.zoom);
      set({
        activeSid: subDef.masterSid,
        activeSubSector: `${subDef.name} • ${subDef.sub}`,
        flyTarget: {
          sid: subDef.masterSid,
          x: subDef.x,
          y: subDef.y,
          zoom: subDef.zoom,
          isParcelSelection: false,
          subSectorTitle: `${subDef.name} • ${subDef.sub}`,
        },
      });
    } else {
      set({ activeSid: sid, activeSubSector: null, flyTarget: null });
    }
  },
  issueFly: (sid, x = 1500, y = 1200, zoom = 1, isParcelSelection = false, subSectorTitle) =>
    set({
      activeSid: sid,
      activeSubSector: subSectorTitle || null,
      flyTarget: { sid, x, y, zoom, isParcelSelection, subSectorTitle },
    }),
  clearFly: () => set({ flyTarget: null }),
  setClickedPt: (pt, survey = null) => {
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    set({
      clickedPt: pt,
      selectedSurvey: survey,
      infoSheetOpen: pt !== null,
      ...(isMobile
        ? {
            mobileSheet: pt !== null ? ('plot' as const) : 'none' as const,
            mobileSearchOpen: false,
            mobileMoreOpen: false,
            browserOpen: false,
          }
        : {}),
    });
  },
  setBrowserOpen: (open) => {
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    if (isMobile && open) {
      set({ mobileSheet: 'schemes', mobileSearchOpen: false, mobileMoreOpen: false, infoSheetOpen: false });
      return;
    }
    set({ browserOpen: open });
  },
  setInfoSheetOpen: (open) => {
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    if (isMobile) {
      set({
        mobileSheet: open ? get().mobileSheet === 'none' ? 'plot' : get().mobileSheet : 'none',
        mobileSearchOpen: false,
        mobileMoreOpen: false,
        browserOpen: false,
      });
      return;
    }
    set({ infoSheetOpen: open });
  },
  setInfoTab: (tab) => {
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    if (isMobile && (tab === 'plot' || tab === 'saved')) {
      set({
        infoTab: tab,
        mobileSheet: tab,
        mobileSearchOpen: false,
        mobileMoreOpen: false,
        browserOpen: false,
      });
      return;
    }
    set({ infoTab: tab });
  },
  setEditPin: (pin) => set({ editPin: pin }),

  // Satellite GIS Actions
  setMapViewMode: (mode) => {
    if (mode === 'satellite') {
      const state = get();
      if (state.activeSid) {
        const geo = getGisCoordinatesForSheet(state.activeSid, state.activeSubSector);
        set({ mapViewMode: mode, gisViewport: geo });
        return;
      }
    }
    set({ mapViewMode: mode });
  },
  setSatelliteBaseMap: (base) => set({ satelliteBaseMap: base }),
  setLayerOpacity: (opacity) => set({ layerOpacity: Math.max(0, Math.min(1, opacity)) }),
  setSatelliteOverlayOrder: (order) => set({ satelliteOverlayOrder: order }),
  setSatelliteBlendMode: (mode) => set({ satelliteBlendMode: mode }),
  toggleSatelliteLayer: (layer) =>
    set((s) => ({
      satelliteLayers: {
        ...s.satelliteLayers,
        [layer]: !s.satelliteLayers[layer],
      },
    })),
  setGisViewport: (vp) => set({ gisViewport: vp }),
  setMapTypeModalOpen: (open) => set({ mapTypeModalOpen: open }),
  setUnitConverterOpen: (open) => set({ unitConverterOpen: open }),
  setSelectedSatellitePlot: (plot) => set({ selectedSatellitePlot: plot }),

  // ── Mobile one-surface-at-a-time primitives ──
  setMobileSheet: (sheet) =>
    set({
      mobileSheet: sheet,
      mobileSearchOpen: false,
      mobileMoreOpen: false,
      browserOpen: false,
      infoSheetOpen: sheet !== 'none',
      infoTab: sheet === 'saved' ? 'saved' : sheet === 'plot' ? 'plot' : get().infoTab,
    }),
  setMobileSearchOpen: (open) =>
    set({
      mobileSearchOpen: open,
      ...(open ? { mobileSheet: 'none' as const, mobileMoreOpen: false, browserOpen: false, infoSheetOpen: false } : {}),
    }),
  setMobileMoreOpen: (open) =>
    set({
      mobileMoreOpen: open,
      ...(open ? { mobileSheet: 'none' as const, mobileSearchOpen: false, browserOpen: false, infoSheetOpen: false } : {}),
    }),
  closeAllMobile: () =>
    set({ mobileSheet: 'none', mobileSearchOpen: false, mobileMoreOpen: false, browserOpen: false, infoSheetOpen: false }),
  toggleMinimap: () => set((s) => ({ showMinimap: !s.showMinimap })),
  setViewInfo: (info) => set({ viewInfo: info }),
  setFilter: (k, v) =>
    set((s) => ({
      filters: { ...s.filters, [k]: v },
    })),
  resetFilters: () => set({ filters: DEFAULT_FILTERS }),
  addBookmark: (bm) => {
    const isAdmin = isAdminEmail(get().user?.email);
    if (deriveFlags(get().entitlements, { isAdmin }).isFree) return;
    const next = [bm, ...get().bookmarks.filter((b) => b.id !== bm.id)];
    set({ bookmarks: next });
    try {
      localStorage.setItem('dholera-bookmarks-v1', JSON.stringify(next));
    } catch {}
    if (typeof window !== 'undefined') {
      fetch('/api/bookmarks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookmark: bm }),
      }).catch(() => {});
    }
  },
  updateBookmark: (id, patch) => {
    const next = get().bookmarks.map((b) => (b.id === id ? { ...b, ...patch } : b));
    set({ bookmarks: next });
    try {
      localStorage.setItem('dholera-bookmarks-v1', JSON.stringify(next));
    } catch {}
    const updated = next.find((b) => b.id === id);
    if (updated && typeof window !== 'undefined') {
      fetch('/api/bookmarks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookmark: updated }),
      }).catch(() => {});
    }
  },
  removeBookmark: (id) => {
    const next = get().bookmarks.filter((b) => b.id !== id);
    set({ bookmarks: next });
    try {
      localStorage.setItem('dholera-bookmarks-v1', JSON.stringify(next));
    } catch {}
    if (typeof window !== 'undefined') {
      fetch(`/api/bookmarks?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      }).catch(() => {});
    }
  },
  hydrateBookmarks: (list) => set({ bookmarks: list }),
  syncBookmarksWithCloud: async () => {
    if (typeof window === 'undefined') return;
    try {
      const res = await fetch('/api/bookmarks');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.bookmarks)) {
          const serverMap = new Map<string, Bookmark>(
            data.bookmarks.map((b: Bookmark) => [b.id, b])
          );
          const local = get().bookmarks;
          const missingOnServer = local.filter((b) => !serverMap.has(b.id));
          if (missingOnServer.length > 0) {
            fetch('/api/bookmarks', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ bookmarks: missingOnServer }),
            }).catch(() => {});
          }
          const combined = [...data.bookmarks];
          for (const b of local) {
            if (!serverMap.has(b.id)) {
              combined.push(b);
            }
          }
          set({ bookmarks: combined });
          try {
            localStorage.setItem('dholera-bookmarks-v1', JSON.stringify(combined));
          } catch {}
        }
      }
    } catch {}
  },

  setUser: (u) => {
    set({ user: u });
    try {
      if (u) localStorage.setItem('dholera-user-profile-v1', JSON.stringify(u));
      else localStorage.removeItem('dholera-user-profile-v1');
    } catch {}
  },
  hydrateUser: () => {
    try {
      const saved = localStorage.getItem('dholera-user-profile-v1');
      if (saved) set({ user: JSON.parse(saved) });
      const bms = localStorage.getItem('dholera-bookmarks-v1');
      if (bms) set({ bookmarks: JSON.parse(bms) });
      const notifs = localStorage.getItem('dholera-notifications-v1');
      if (notifs) set({ notifications: JSON.parse(notifs) });
      const fbs = localStorage.getItem('dholera-feedback-v1');
      if (fbs) set({ feedbackList: JSON.parse(fbs) });
    } catch {}
  },

  setNotifications: (notifs) => {
    set({ notifications: notifs });
    try {
      localStorage.setItem('dholera-notifications-v1', JSON.stringify(notifs));
    } catch {}
  },
  markNotifsRead: () => {
    const updated = get().notifications.map((n) => ({ ...n, read: true }));
    set({ notifications: updated });
    try {
      localStorage.setItem('dholera-notifications-v1', JSON.stringify(updated));
    } catch {}
  },
  addNotification: (notif) => {
    const updated = [notif, ...get().notifications];
    set({ notifications: updated });
    try {
      localStorage.setItem('dholera-notifications-v1', JSON.stringify(updated));
    } catch {}
  },
  hydrateNotifications: () => {},

  submitFeedback: (fb) => {
    const item: UserFeedback = {
      ...fb,
      id: `fb-${Date.now()}`,
      createdAt: Date.now(),
      status: 'new',
    };
    const updated = [item, ...get().feedbackList];
    set({ feedbackList: updated });
    try {
      localStorage.setItem('dholera-feedback-v1', JSON.stringify(updated));
    } catch {}
  },
  updateFeedbackStatus: (id, status) => {
    const updated = get().feedbackList.map((f) => (f.id === id ? { ...f, status } : f));
    set({ feedbackList: updated });
    try {
      localStorage.setItem('dholera-feedback-v1', JSON.stringify(updated));
    } catch {}
  },
  hydrateFeedback: () => {},
}));
