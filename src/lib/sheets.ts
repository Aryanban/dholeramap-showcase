import type { SheetsManifest, PlanSheet, SearchHit, CadastralSurveyPoint, SplitSearchResults } from './types';
import { readSearchIndex, writeSearchIndex } from './search-cache';
import { getSchemeDGDCR } from './dgdcr';

let cachedManifest: SheetsManifest | null = null;
let manifestPromise: Promise<SheetsManifest> | null = null;
let cachedSurveys: Record<string, CadastralSurveyPoint[]> | null = null;
let surveysPromise: Promise<Record<string, CadastralSurveyPoint[]>> | null = null;

export const DATA_VERSION = 'v=20260921-b6c2';

const fallbackManifest: SheetsManifest = {
  source: 'fallback',
  version: 1,
  totalSheets: 0,
  groups: [],
  sectors: {},
  sheets: {},
};

export async function loadManifest(): Promise<SheetsManifest> {
  if (cachedManifest) return cachedManifest;
  if (manifestPromise) return manifestPromise;
  manifestPromise = (async () => {
    try {
      const res = await fetch(`/data/dholera_sheets.json?${DATA_VERSION}`);
      if (!res.ok) {
        console.warn(`HTTP ${res.status}: Failed to load dholera_sheets.json, using fallback`);
        return fallbackManifest;
      }
      const data = await res.json();
      cachedManifest = data as SheetsManifest;
      return cachedManifest;
    } catch (err) {
      console.error('Failed to load dholera_sheets.json:', err);
      return fallbackManifest;
    } finally {
      manifestPromise = null;
    }
  })();
  return manifestPromise;
}

function parseSearchIndex(data: any): Record<string, CadastralSurveyPoint[]> {
  const profiles = data.profiles || {};
  const byScheme: Record<string, CadastralSurveyPoint[]> = {};
  for (const item of (data.items || [])) {
    const [id, surveyNo, finalPlot, village, schemeId, subSector, x, y, roadWidthM, allottedAreaSqM] = item;
    if (!byScheme[schemeId]) {
      byScheme[schemeId] = [];
    }
    const prof = profiles[schemeId] || {};
    const schemeLabel = schemeId === 'dholera_tp1'
      ? 'Town Planning Scheme 1'
      : schemeId === 'dholera_tp2'
      ? 'Town Planning Scheme 2'
      : schemeId === 'dholera_tp3'
      ? 'Town Planning Scheme 3'
      : schemeId === 'dholera_tp4'
      ? 'Town Planning Scheme 4'
      : schemeId === 'dholera_tp5'
      ? 'Town Planning Scheme 5'
      : schemeId === 'dholera_tp6'
      ? 'Town Planning Scheme 6'
      : 'Town Planning Scheme';
    // DGDCR envelope from the single source of truth (docs/04 §A.1-2), so the
    // search path can no longer disagree with the click path. The stale
    // per-scheme `profiles` FAR/height block is no longer used for numerics.
    const rawWidth = Number(roadWidthM);
    const width = Number.isFinite(rawWidth) && rawWidth > 0 ? rawWidth : 18;
    const d = getSchemeDGDCR(schemeId, width);

    byScheme[schemeId].push({
      id,
      surveyNo: surveyNo || '',
      finalPlot: finalPlot || '',
      village: village || '',
      schemeId,
      schemeName: schemeLabel,
      subSector: subSector || '',
      cadastralX: x,
      cadastralY: y,
      roadWidthM: width,
      allottedAreaSqM: Number(allottedAreaSqM) > 0 ? Number(allottedAreaSqM) : undefined,
      allottedAreaSqYd: Number(allottedAreaSqM) > 0 ? Math.round(Number(allottedAreaSqM) * 1.196) : undefined,
      zone: d.zone,
      zoneCode: d.zoneCode,
      maxFAR: d.maxFAR,
      maxHeightM: d.maxHeightM,
      heightDesc: d.heightDesc,
      groundCoveragePct: d.groundCoveragePct,
      setbacks: d.setbacks,
      permittedUses: d.permittedUses,
      statutoryTable: d.statutoryTable,
      isEstimated: d.isEstimated,
      dataSource: d.dataSource,
      legalStatus: prof.stat || 'Sanctioned Preliminary Scheme',
    } as any);
  }
  return byScheme;
}

async function fetchSearchIndex(): Promise<Record<string, CadastralSurveyPoint[]>> {
  try {
    const res = await fetch(`/data/search_index.json?${DATA_VERSION}`);
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: Failed to load search_index.json`);
    }
    const data = await res.json();
    return parseSearchIndex(data);
  } catch (err) {
    console.error('Failed to load search_index.json:', err);
    return {};
  }
}

export async function loadSurveys(): Promise<Record<string, CadastralSurveyPoint[]>> {
  if (cachedSurveys) return cachedSurveys;
  if (surveysPromise) return surveysPromise;
  surveysPromise = (async () => {
    // Repeat visit: serve the already-parsed index from IndexedDB — no fetch,
    // no 1.73 MB JSON.parse on the main thread.
    const persisted = await readSearchIndex(DATA_VERSION);
    if (persisted && Object.keys(persisted).length) {
      cachedSurveys = persisted;
      // Background revalidation keeps the persisted copy fresh (non-blocking);
      // the in-memory object is left untouched as the data version is unchanged.
      void fetchSearchIndex().then((fresh) => {
        if (Object.keys(fresh).length) void writeSearchIndex(DATA_VERSION, fresh);
      });
      return cachedSurveys;
    }
    // Cold visit: fetch + parse, then persist so the next visit is instant.
    const fresh = await fetchSearchIndex();
    cachedSurveys = fresh;
    if (Object.keys(fresh).length) {
      void writeSearchIndex(DATA_VERSION, fresh);
    }
    return cachedSurveys;
  })();
  surveysPromise.finally(() => {
    surveysPromise = null;
  });
  return surveysPromise;
}

export interface SubSectorDef {
  id: string;
  name: string;
  sub: string;
  masterSid: string;
  x: number;
  y: number;
  zoom: number;
  badge?: string;
}

export const SUBSECTOR_FLY_MAP: Record<string, SubSectorDef> = {
  // TP 1 Sub-sectors (calibrated to tp1 DeepZoom Tile Pyramid 23,840 x 16,840)
  'tp1-1a1': {
    id: 'tp1-1a1',
    name: 'TP 1A-1',
    sub: 'Ambli Village Core & Civic Center (2,735.63 Ha)',
    masterSid: 'tp1-master',
    x: 9192,
    y: 5815,
    zoom: 3.6,
    badge: 'Ambli Core',
  },
  'tp1-1a2': {
    id: 'tp1-1a2',
    name: 'TP 1A-2',
    sub: 'Kadipur & Bhadiyad Sector (1,403.89 Ha)',
    masterSid: 'tp1-master',
    x: 5478,
    y: 11940,
    zoom: 3.6,
    badge: 'Kadipur Sector',
  },
  'tp1-1a3': {
    id: 'tp1-1a3',
    name: 'TP 1A-3',
    sub: 'Bhimtalav & Valinda Sector (3,976.67 Ha)',
    masterSid: 'tp1-master',
    x: 6328,
    y: 3895,
    zoom: 3.6,
    badge: 'Bhimtalav & Valinda',
  },
  'tp1-1a4': {
    id: 'tp1-1a4',
    name: 'TP 1A-4',
    sub: 'Gogla Village & Commercial East (1,648.04 Ha)',
    masterSid: 'tp1-master',
    x: 12305,
    y: 4578,
    zoom: 3.6,
    badge: 'Gogla Sector',
  },
  'tp1-1a5': {
    id: 'tp1-1a5',
    name: 'TP 1A-5',
    sub: 'Khun & Expressway Commercial Spine (1,027.35 Ha)',
    masterSid: 'tp1-master',
    x: 9955,
    y: 11320,
    zoom: 3.6,
    badge: 'North Spine',
  },
  'tp1-1b': {
    id: 'tp1-1b',
    name: 'TP 1B',
    sub: 'Umargadh & Central Civic Plaza (1,514.83 Ha)',
    masterSid: 'tp1-master',
    x: 12485,
    y: 7435,
    zoom: 3.6,
    badge: 'Central Plaza',
  },

  // TP 2 Sub-sectors (calibrated to tp2 DeepZoom Tile Pyramid 23,840 x 16,840)
  'tp2-2a': {
    id: 'tp2-2a',
    name: 'TP 2A',
    sub: 'Activation Core & Administration (1,316.90 Ha)',
    masterSid: 'tp2-master',
    x: 11678,
    y: 9212,
    zoom: 3.6,
    badge: 'Activation Core',
  },
  'tp2-2b1': {
    id: 'tp2-2b1',
    name: 'TP 2B-1',
    sub: 'High-Tech Industrial Zone Part 1 (4,375.41 Ha)',
    masterSid: 'tp2-master',
    x: 10390,
    y: 4805,
    zoom: 3.6,
    badge: 'Industrial Part 1',
  },
  'tp2-2b2': {
    id: 'tp2-2b2',
    name: 'TP 2B-2',
    sub: 'High-Tech Industrial Corridors Part 2 (6,091.78 Ha)',
    masterSid: 'tp2-master',
    x: 8702,
    y: 6655,
    zoom: 3.6,
    badge: 'Industrial Part 2',
  },
  'tp2-2b3': {
    id: 'tp2-2b3',
    name: 'TP 2B-3',
    sub: 'Tata Semiconductor Fab Hub & ABCD (4,425.27 Ha)',
    masterSid: 'tp2-master',
    x: 8645,
    y: 8255,
    zoom: 3.6,
    badge: 'Tata Fab Hub',
  },
  'tp2-2b4a': {
    id: 'tp2-2b4a',
    name: 'TP 2B-4A',
    sub: 'Gorasu West Industrial Sector (948.30 Ha)',
    masterSid: 'tp2-master',
    x: 5462,
    y: 6885,
    zoom: 3.6,
    badge: 'Gorasu West',
  },
  'tp2-2b4b': {
    id: 'tp2-2b4b',
    name: 'TP 2B-4B',
    sub: 'Gorasu Northwest & Riverfront (886.45 Ha)',
    masterSid: 'tp2-master',
    x: 6862,
    y: 3985,
    zoom: 3.6,
    badge: 'Gorasu North',
  },
  'tp2-2b5a': {
    id: 'tp2-2b5a',
    name: 'TP 2B-5A',
    sub: 'Hebatpur North Sector (634.10 Ha)',
    masterSid: 'tp2-master',
    x: 14478,
    y: 7035,
    zoom: 3.6,
    badge: 'Hebatpur North',
  },
  'tp2-2b5b': {
    id: 'tp2-2b5b',
    name: 'TP 2B-5B',
    sub: 'Hebatpur South Sector (784.64 Ha)',
    masterSid: 'tp2-master',
    x: 15738,
    y: 11530,
    zoom: 3.6,
    badge: 'Hebatpur South',
  },

  // TP 3 Sub-sectors (calibrated to tp3 DeepZoom Tile Pyramid 23,840 x 16,840)
  'tp3-3a': {
    id: 'tp3-3a',
    name: 'TP 3A',
    sub: 'Heavy Industrial Corridor (939.31 Ha)',
    masterSid: 'tp3-master',
    x: 17272,
    y: 9442,
    zoom: 3.6,
    badge: 'Heavy Industrial',
  },
  'tp3-3b': {
    id: 'tp3-3b',
    name: 'TP 3B',
    sub: 'General Industrial & Ancillary (488.88 Ha)',
    masterSid: 'tp3-master',
    x: 15730,
    y: 13002,
    zoom: 3.6,
    badge: 'General Industrial',
  },
  'tp3-3c1': {
    id: 'tp3-3c1',
    name: 'TP 3C-1',
    sub: 'Engineering Hub & Central Corridor (541.10 Ha)',
    masterSid: 'tp3-master',
    x: 13822,
    y: 7370,
    zoom: 3.6,
    badge: 'Engineering Hub',
  },
  'tp3-3c2': {
    id: 'tp3-3c2',
    name: 'TP 3C-2',
    sub: 'Heavy Manufacturing & Logistics Part 2 (461.50 Ha)',
    masterSid: 'tp3-master',
    x: 11955,
    y: 10410,
    zoom: 3.6,
    badge: 'Mega Logistics',
  },

  // TP 4 Sub-sectors (calibrated to tp4 DeepZoom Tile Pyramid 23,840 x 16,840)
  'tp4-4a': {
    id: 'tp4-4a',
    name: 'TP 4A',
    sub: 'Knowledge Corridor & IT City (1,720.69 Ha)',
    masterSid: 'tp4-master',
    x: 15358,
    y: 6368,
    zoom: 3.6,
    badge: 'Knowledge & IT',
  },
  'tp4-4b1': {
    id: 'tp4-4b1',
    name: 'TP 4B-1',
    sub: 'Solar Park & Green Energy (1,069.56 Ha)',
    masterSid: 'tp4-master',
    x: 5538,
    y: 9445,
    zoom: 3.6,
    badge: 'Solar Park',
  },
  'tp4-4b2': {
    id: 'tp4-4b2',
    name: 'TP 4B-2',
    sub: 'Renewable Energy Zone & Mahadevpura (879.80 Ha)',
    masterSid: 'tp4-master',
    x: 11892,
    y: 9930,
    zoom: 3.6,
    badge: 'Renewable Zone',
  },

  // TP 5 Sub-sectors (calibrated to tp5 DeepZoom Tile Pyramid 23,840 x 16,840)
  'tp5-5a': {
    id: 'tp5-5a',
    name: 'TP 5A',
    sub: 'Defense Aerospace Hub (867.98 Ha)',
    masterSid: 'tp5-master',
    x: 14130,
    y: 6885,
    zoom: 3.6,
    badge: 'Defense Aerospace',
  },
  'tp5-5b': {
    id: 'tp5-5b',
    name: 'TP 5B',
    sub: 'Heavy Manufacturing & Mega Yard (1,198.46 Ha)',
    masterSid: 'tp5-master',
    x: 12748,
    y: 11230,
    zoom: 3.6,
    badge: 'Mega Manufacturing',
  },
  'tp5-5c1': {
    id: 'tp5-5c1',
    name: 'TP 5C-1',
    sub: 'Mega Industrial Zone Part 1 (385.20 Ha)',
    masterSid: 'tp5-master',
    x: 11472,
    y: 6208,
    zoom: 3.6,
    badge: 'Industrial 5C-1',
  },
  'tp5-5c2': {
    id: 'tp5-5c2',
    name: 'TP 5C-2',
    sub: 'Aviation & Mega Fabrication Part 2 (313.20 Ha)',
    masterSid: 'tp5-master',
    x: 10432,
    y: 12175,
    zoom: 3.6,
    badge: 'Aviation 5C-2',
  },

  // TP 6 Sub-sectors (calibrated to tp6 DeepZoom Tile Pyramid 20,220 x 14,304)
  'tp6-6a': {
    id: 'tp6-6a',
    name: 'TP 6A',
    sub: 'Airport City & CFS Hub (516.00 Ha)',
    masterSid: 'tp6-master',
    x: 7100,
    y: 7850,
    zoom: 3.6,
    badge: 'Airport & CFS',
  },
  'tp6-6b': {
    id: 'tp6-6b',
    name: 'TP 6B',
    sub: 'International Cargo Airport Core & Logistics (739.40 Ha)',
    masterSid: 'tp6-master',
    x: 13222,
    y: 6315,
    zoom: 3.6,
    badge: 'Cargo Airport Hub',
  },
};

export function surveyToPixel(
  s: CadastralSurveyPoint,
  _sheet?: PlanSheet
): { x: number; y: number } {
  return { x: Math.round(s.cadastralX), y: Math.round(s.cadastralY) };
}

export const DHOLERA_22_VILLAGES = [
  { name: 'Ambli', tp: 'TP 1', sid: 'tp1-master', x: 2431, y: 3541 },
  { name: 'Kadipur', tp: 'TP 1', sid: 'tp1-master', x: 4268, y: 7993 },
  { name: 'Bhadiyad', tp: 'TP 1', sid: 'tp1-master', x: 3800, y: 7500 },
  { name: 'Gogla', tp: 'TP 1', sid: 'tp1-master', x: 5100, y: 9200 },
  { name: 'Khun', tp: 'TP 1', sid: 'tp1-master', x: 4900, y: 8100 },
  { name: 'Umargadh', tp: 'TP 1', sid: 'tp1-master', x: 2900, y: 3300 },
  { name: 'Bhimtalav', tp: 'TP 1', sid: 'tp1-master', x: 2500, y: 12800 },
  { name: 'Valinda', tp: 'TP 1', sid: 'tp1-master', x: 3100, y: 13200 },
  { name: 'Dholera', tp: 'TP 2 / Core City', sid: 'tp2-master', x: 5900, y: 6500 },
  { name: 'Hebatpur', tp: 'TP 2 (Activation)', sid: 'tp2-master', x: 6200, y: 6700 },
  { name: 'Gorasu', tp: 'TP 2 (Industrial)', sid: 'tp2-master', x: 7100, y: 5800 },
  { name: 'Sangasar', tp: 'TP 3 (Heavy Ind)', sid: 'tp3-master', x: 17000, y: 8300 },
  { name: 'Mundi', tp: 'TP 4 (Solar & Knowledge)', sid: 'tp4-master', x: 7800, y: 3100 },
  { name: 'Mahadevpura', tp: 'TP 4 (Renewable)', sid: 'tp4-master', x: 8200, y: 3400 },
  { name: 'Bavaliyari', tp: 'TP 5 / TP 6 (Aerotropolis)', sid: 'tp6-master', x: 18400, y: 8000 },
  { name: 'Zankhi', tp: 'TP 6 (Logistics)', sid: 'tp6-master', x: 17500, y: 7500 },
  { name: 'Bhangadh', tp: 'TP 6 (Airport City)', sid: 'tp6-master', x: 18000, y: 7200 },
  // Regional Plan / Outside Core TP 1-6 Schemes
  { name: 'Otariya', tp: 'Regional Plan (Outside TP)', sid: 'macro-villages', x: 2980, y: 2105, isOutsideTP: true },
  { name: 'Panchhi', tp: 'Regional Plan (Outside TP)', sid: 'macro-villages', x: 2980, y: 2105, isOutsideTP: true },
  { name: 'Rahtalav', tp: 'Regional Plan (Outside TP)', sid: 'macro-villages', x: 2980, y: 2105, isOutsideTP: true },
  { name: 'Sandhida', tp: 'Regional Plan (Outside TP)', sid: 'macro-villages', x: 2980, y: 2105, isOutsideTP: true },
  { name: 'Sodhi', tp: 'Regional Plan (Outside TP)', sid: 'macro-villages', x: 2980, y: 2105, isOutsideTP: true },
  { name: 'Cher', tp: 'Regional Plan (Outside TP)', sid: 'macro-villages', x: 2980, y: 2105, isOutsideTP: true },
  { name: 'Mingalpur', tp: 'Regional Plan (Outside TP)', sid: 'macro-villages', x: 2980, y: 2105, isOutsideTP: true },
];

export function searchPlansGrouped(
  query: string,
  manifest: SheetsManifest,
  surveys: Record<string, CadastralSurveyPoint[]>,
  limitPerCategory: number = 30,
  activeSid: string = 'tp1-master'
): SplitSearchResults {
  const q = query.trim().toLowerCase();
  if (!q) {
    return {
      finalPlots: [],
      surveyNumbers: [],
      schemesAndVillages: [],
      outsideTPSurveys: [],
      totalCount: 0,
    };
  }

  const currentSheetObj = manifest.sheets[activeSid];
  const activeSector = currentSheetObj?.sector; // e.g. "TP 1", "TP 2"

  const schemeToSid: Record<string, string> = {
    dholera_tp1: 'tp1-master',
    dholera_tp2: 'tp2-master',
    dholera_tp3: 'tp3-master',
    dholera_tp4: 'tp4-master',
    dholera_tp5: 'tp5-master',
    dholera_tp6: 'tp6-master',
  };

  // 1. Schemes, Sub-Maps & 22 Villages matching
  const schemesAndVillages: SearchHit[] = [];

  for (const [sid, sh] of Object.entries(manifest.sheets)) {
    const lLabel = sh.label.toLowerCase();
    const lSector = sh.sector.toLowerCase();
    const lPocket = (sh.pocketId || '').toLowerCase();
    const lDesc = sh.description.toLowerCase();

    if (
      lLabel.includes(q) ||
      lSector.includes(q) ||
      lPocket.includes(q) ||
      lDesc.includes(q) ||
      q.includes(sh.pocketId?.toLowerCase() || '')
    ) {
      const subDef = SUBSECTOR_FLY_MAP[sid];
      if (subDef) {
        schemesAndVillages.push({
          id: `sheet-${sid}`,
          title: sh.label,
          subtitle: `${sh.sector} · ${sh.pocketId ? `Sub-Map ${sh.pocketId} · ` : ''}${sh.description}`,
          type: 'scheme',
          hitCategory: 'scheme_village',
          sid: subDef.masterSid,
          x: subDef.x,
          y: subDef.y,
          subMapLabel: subDef.name,
          isCurrentSheet: subDef.masterSid === activeSid,
        });
      } else {
        schemesAndVillages.push({
          id: `sheet-${sid}`,
          title: sh.label,
          subtitle: `${sh.sector} · ${sh.pocketId ? `Sub-Map ${sh.pocketId} · ` : ''}${sh.description}`,
          type: 'scheme',
          hitCategory: 'scheme_village',
          sid: sid,
          x: Math.round(sh.width / 2),
          y: Math.round(sh.height / 2),
          subMapLabel: sh.pocketId && sh.pocketId !== 'Master' ? sh.pocketId : sh.sector,
          isCurrentSheet: sid === activeSid,
        });
      }
    }
  }

  for (const v of DHOLERA_22_VILLAGES) {
    const vName = v.name.toLowerCase();
    if (vName.includes(q) || q.includes(vName)) {
      schemesAndVillages.push({
        id: `village-${v.name.toLowerCase()}`,
        title: `${v.name} Village Interactive Boundary`,
        subtitle: `${v.tp} · 22 Revenue Villages Interactive Atlas`,
        type: 'village',
        hitCategory: 'scheme_village',
        sid: v.sid,
        x: v.x,
        y: v.y,
        isOutsideTP: v.isOutsideTP,
        villageName: v.name,
        tpSchemeName: v.tp,
        subMapLabel: v.tp,
        isCurrentSheet: v.sid === activeSid,
      });
    }
  }

  // 2. Plot & Survey matching
  const cleanQ = q.replace(/^(survey|survey no|s\.no|rs|plot|fp|final plot|\#)\s*/i, '').trim();
  const numOnlyQ = cleanQ.replace(/[^0-9]/g, '');

  interface ScoredHit {
    hit: SearchHit;
    score: number;
    key: string;
  }

  const fpCandidates: ScoredHit[] = [];
  const surveyCandidates: ScoredHit[] = [];
  const outsideTPCandidates: ScoredHit[] = [];

  const seenFpKeys = new Set<string>();
  const seenSurveyKeys = new Set<string>();

  for (const [schemeId, items] of Object.entries(surveys)) {
    const sid = schemeToSid[schemeId];
    if (!sid) continue;
    const sheet = manifest.sheets[sid];
    if (!sheet) continue;

    const isThisSchemeActive = sheet.sector === activeSector;

    for (const item of items) {
      const pt = surveyToPixel(item, sheet);

      // --- EVALUATE FINAL PLOT (FP) ---
      const fp = (item.finalPlot || '').toLowerCase();
      const fpClean = fp.replace(/^(fp-|d-)/i, '').trim();
      const fpNumOnly = fpClean.replace(/[^0-9]/g, '');

      if (fp && fp !== '—' && !fp.includes('pending') && cleanQ) {
        let fpScore = 0;
        if (fp === cleanQ || fpClean === cleanQ || (numOnlyQ && fpNumOnly === numOnlyQ && cleanQ === numOnlyQ)) {
          fpScore = 100;
        } else if (fpClean.startsWith(cleanQ + '/') || fpClean.startsWith(cleanQ + '-') || fp.startsWith(cleanQ)) {
          fpScore = 85;
        } else if (fpClean.startsWith(cleanQ) || (numOnlyQ.length >= 2 && fpNumOnly.startsWith(numOnlyQ))) {
          fpScore = 75;
        } else if (fpClean.includes(cleanQ)) {
          fpScore = 55;
        }

        if (fpScore > 0) {
          if (isThisSchemeActive) fpScore += 20;
          if (item.village.toLowerCase() === q) fpScore += 10;

          const fpDisplay = item.finalPlot.startsWith('FP-') || item.finalPlot.startsWith('D-') ? item.finalPlot : `FP-${item.finalPlot}`;
          const fpKey = `${sheet.sector}-${item.village}-${item.finalPlot}`;

          if (!seenFpKeys.has(fpKey)) {
            seenFpKeys.add(fpKey);

            const subParts: string[] = [];
            if (item.surveyNo && item.surveyNo !== 'Original Survey Unspecified') {
              subParts.push(`Allotted from Survey ${item.surveyNo}`);
            }
            if (item.village) subParts.push(item.village);
            const sectorTag = (item.subSector && item.subSector.split('(')[0].trim()) || item.schemeName || sheet.sector;
            if (sectorTag) subParts.push(sectorTag);

            fpCandidates.push({
              score: fpScore,
              key: fpKey,
              hit: {
                id: `fp-${sid}-${item.id}`,
                title: `${fpDisplay} · Final Reconstituted Plot`,
                subtitle: subParts.join(' · '),
                type: 'plot',
                hitCategory: 'final_plot',
                sid,
                x: pt.x,
                y: pt.y,
                subMapLabel: sectorTag,
                isCurrentSheet: isThisSchemeActive,
                surveyData: item,
                plotNumber: item.finalPlot,
                surveyNumber: item.surveyNo,
                villageName: item.village,
                tpSchemeName: sheet.sector || item.schemeName,
                roadWidthM: item.roadWidthM,
                areaSqM: item.allottedAreaSqM || item.areaSqM,
                zone: item.zone,
              },
            });
          }
        }
      }

      // --- EVALUATE REVENUE SURVEY (RS) ---
      const sNo = (item.surveyNo || '').toLowerCase();
      const sNoClean = sNo.replace(/[^0-9]/g, '');

      if (sNo && sNo !== '—' && !sNo.includes('unspecified') && cleanQ) {
        let surveyScore = 0;
        if (sNo === cleanQ || (numOnlyQ && sNoClean === numOnlyQ && cleanQ === numOnlyQ)) {
          surveyScore = 100;
        } else if (sNo.startsWith(cleanQ + '/') || sNo.startsWith(cleanQ + '-')) {
          surveyScore = 85;
        } else if (sNo.startsWith(cleanQ) || (numOnlyQ.length >= 2 && sNoClean.startsWith(numOnlyQ))) {
          surveyScore = 75;
        } else if (sNo.includes(cleanQ)) {
          surveyScore = 55;
        }

        if (surveyScore > 0) {
          if (isThisSchemeActive) surveyScore += 20;
          if (item.village.toLowerCase() === q) surveyScore += 10;

          const isPendingOrUnreconstituted = item.finalPlot.toLowerCase().includes('pending') || item.finalPlot === '—' || !item.finalPlot;
          const isOutsideTP = isPendingOrUnreconstituted;

          const surveyKey = `${item.village}-Survey-${item.surveyNo}-${item.finalPlot}`;

          if (!seenSurveyKeys.has(surveyKey)) {
            seenSurveyKeys.add(surveyKey);

            const subParts: string[] = [];
            if (!isOutsideTP && item.finalPlot) {
              subParts.push(`Allotted to ${item.finalPlot}`);
            } else {
              subParts.push(`Agricultural / Pre-Reconstitution Survey`);
            }
            if (item.village) subParts.push(item.village);
            const sectorTag = isOutsideTP
              ? 'Outside Sanctioned TP Schemes'
              : ((item.subSector && item.subSector.split('(')[0].trim()) || item.schemeName || sheet.sector);
            if (sectorTag) subParts.push(sectorTag);

            const hitItem: SearchHit = {
              id: `survey-${sid}-${item.id}`,
              title: `Survey ${item.surveyNo} · Revenue Survey`,
              subtitle: subParts.join(' · '),
              type: 'survey',
              hitCategory: 'survey_number',
              sid,
              x: pt.x,
              y: pt.y,
              subMapLabel: sectorTag,
              isCurrentSheet: isThisSchemeActive,
              surveyData: item,
              isOutsideTP,
              plotNumber: item.finalPlot,
              surveyNumber: item.surveyNo,
              villageName: item.village,
              tpSchemeName: isOutsideTP ? 'Regional / Non-TP' : (sheet.sector || item.schemeName),
              roadWidthM: item.roadWidthM,
              areaSqM: item.allottedAreaSqM || item.areaSqM,
              zone: isOutsideTP ? 'Agricultural / Revenue Land' : item.zone,
            };

            if (isOutsideTP) {
              outsideTPCandidates.push({ score: surveyScore, key: surveyKey, hit: hitItem });
            } else {
              surveyCandidates.push({ score: surveyScore, key: surveyKey, hit: hitItem });
            }
          }
        }
      }
    }
  }

  // Sort by score descending
  fpCandidates.sort((a, b) => b.score - a.score);
  surveyCandidates.sort((a, b) => b.score - a.score);
  outsideTPCandidates.sort((a, b) => b.score - a.score);

  const finalPlots = fpCandidates.slice(0, limitPerCategory).map((c) => c.hit);
  const surveyNumbers = surveyCandidates.slice(0, limitPerCategory).map((c) => c.hit);
  const outsideTPSurveys = outsideTPCandidates.slice(0, limitPerCategory).map((c) => c.hit);

  const totalCount =
    finalPlots.length + surveyNumbers.length + schemesAndVillages.length + outsideTPSurveys.length;

  return {
    finalPlots,
    surveyNumbers,
    schemesAndVillages,
    outsideTPSurveys,
    totalCount,
  };
}

export function searchPlans(
  query: string,
  manifest: SheetsManifest,
  surveys: Record<string, CadastralSurveyPoint[]>,
  limit: number = 20,
  activeSid: string = 'tp1-master'
): SearchHit[] {
  const grouped = searchPlansGrouped(query, manifest, surveys, limit, activeSid);
  return [
    ...grouped.schemesAndVillages,
    ...grouped.finalPlots,
    ...grouped.surveyNumbers,
    ...grouped.outsideTPSurveys,
  ].slice(0, limit);
}
