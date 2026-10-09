/**
 * Resolves everything a dossier needs for one parcel:
 * saved bookmark fields + cadastral survey record + plots.json coordinates
 * (OP vs FP) + attached documents + InfoPanel-style policy derivations.
 */

import type { Bookmark, CadastralSurveyPoint } from '../types';
import { loadSurveys, DATA_VERSION } from '../sheets';
import { getDocsByPin } from '../doc-storage';
import { expandPlots } from '../plots-expand';
import type { DossierDocItem, DossierParcel } from './types';
import { DOC_TYPE_INFO } from '../doc-storage';

export interface ParcelOverrides {
  district?: string;
  taluka?: string;
  tenure?: string;
  naStatus?: string;
  fpRoad?: string;
  oldSurveyNo?: string;
  price?: string;
  pricePerSqYd?: number;
  reraId?: string;
}

const SCHEME_ID_BY_NUM: Record<string, string> = {
  '1': 'dholera_tp1',
  '2': 'dholera_tp2',
  '3': 'dholera_tp3',
  '4': 'dholera_tp4',
  '5': 'dholera_tp5',
  '6': 'dholera_tp6',
};

export function schemeNumFromSid(sid: string): string {
  const m = /^tp([1-6])/.exec(sid || '');
  return m ? m[1] : '1';
}

function digits(v: string | undefined): string {
  return (v || '').replace(/[^0-9]/g, '');
}

function cleanFp(v: string | undefined): string {
  if (!v || v === '—') return '';
  return v;
}

function roadClassFor(w: number): string {
  if (w >= 200) return '250.00 MT National Expressway & Central Spine Corridor';
  if (w >= 70) return 'Primary Arterial Expressway Spine';
  if (w >= 55) return 'Sub-Arterial Sector Highway Corridor';
  if (w >= 45) return 'Inter-Sector Connecting Arterial Road';
  if (w >= 30) return 'Primary Sector Collector Road';
  if (w >= 25) return 'Secondary Sector Collector Road';
  if (w >= 18) return 'Internal TP Sub-Sector Access Road';
  return 'Local Service Access Lane';
}

interface PlotEntry {
  type?: string;
  surveyNo?: string;
  finalPlot?: string;
  x?: number;
  y?: number;
  cadastralX?: number;
  cadastralY?: number;
  subSector?: string;
  village?: string;
  bounds?: [number, number, number, number];
}

async function loadPlotEntries(schemeNum: string): Promise<PlotEntry[]> {
  try {
    const res = await fetch(`/tiles/tp${schemeNum}/plots.json?v=${DATA_VERSION}`);
    if (!res.ok) return [];
    const raw = await res.json();
    // B6 part 2: the index ships compacted (hoisted constants + enum tables);
    // expand before any consumer sees the records.
    const data = expandPlots(raw);
    const out: PlotEntry[] = [];
    for (const items of Object.values(data) as PlotEntry[][]) {
      if (Array.isArray(items)) out.push(...items);
    }
    return out;
  } catch {
    return [];
  }
}

function findSurveyRecord(
  surveys: Record<string, CadastralSurveyPoint[]>,
  schemeNum: string,
  b: Bookmark
): CadastralSurveyPoint | null {
  const list = surveys[SCHEME_ID_BY_NUM[schemeNum]] || [];
  const bFp = digits(b.finalPlot);
  const bSv = digits(b.surveyNo);
  let best: CadastralSurveyPoint | null = null;
  for (const s of list) {
    const fpMatch = bFp && digits(s.finalPlot) === bFp;
    const svMatch = bSv && digits(s.surveyNo) === bSv;
    if (fpMatch || svMatch) {
      if (fpMatch && svMatch) return s;
      best = best || s;
    }
  }
  return best;
}

export async function resolveDossierParcel(
  b: Bookmark,
  overrides: ParcelOverrides = {}
): Promise<{ parcel: DossierParcel; docs: DossierDocItem[]; warnings: string[] }> {
  const warnings: string[] = [];
  const schemeNum = schemeNumFromSid(b.sid);
  const surveys = await loadSurveys().catch(() => ({}));
  const record = findSurveyRecord(surveys, schemeNum, b);
  const entries = await loadPlotEntries(schemeNum);

  const bFp = digits(b.finalPlot);
  const bSv = digits(b.surveyNo);

  let op: PlotEntry | null = null;
  let fp: PlotEntry | null = null;
  let subSector = '';
  for (const e of entries) {
    const eFp = digits(e.finalPlot);
    const eSv = digits(e.surveyNo);
    const matches = (bFp && eFp === bFp) || (bSv && eSv === bSv);
    if (!matches) continue;
    if (e.type === 'survey' && !op) op = e;
    if (e.type !== 'survey' && !fp) fp = e;
    if (!subSector && e.subSector) subSector = e.subSector;
  }

  const surveyNo = b.surveyNo && b.surveyNo !== '—' ? b.surveyNo : record?.surveyNo || '';
  const finalPlot = cleanFp(b.finalPlot) || record?.finalPlot || '';
  const village = b.village || record?.village || 'Dholera';
  const zone = b.zone || record?.zone || '';
  const roadWidthM = Number(b.roadWidthM ?? record?.roadWidthM ?? 30) || 30;
  const areaSqM = Number(b.areaSqM ?? b.allottedAreaSqM ?? record?.allottedAreaSqM ?? record?.areaSqM ?? 0) || 0;
  const areaSqYd =
    Number(b.allottedAreaSqYd ?? record?.allottedAreaSqYd ?? 0) ||
    (areaSqM ? Math.round(areaSqM * 1.196) : 0);
  const maxFAR = Number(record?.maxFAR ?? 1.8) || 1.8;
  const groundCoveragePct = record?.groundCoveragePct ?? '';
  const footprintSqM =
    areaSqM && typeof groundCoveragePct === 'number'
      ? Math.round(areaSqM * (groundCoveragePct / 100))
      : null;

  const fpLabel = finalPlot
    ? finalPlot.startsWith('FP-') || finalPlot.startsWith('D-')
      ? finalPlot
      : `FP-${finalPlot}`
    : surveyNo
      ? `Survey ${surveyNo}`
      : b.customName || b.label || 'Dholera Plot';

  const title = b.customName || `${village} ${surveyNo || fpLabel}`.trim();

  const rawDocs = await getDocsByPin(b.id).catch(() => []);
  const docs: DossierDocItem[] = rawDocs.map((d) => ({
    id: d.id,
    name: d.name,
    type: d.type,
    typeLabel: DOC_TYPE_INFO[d.type]?.short || d.type,
    size: d.size,
    uploadedAt: d.uploadedAt,
    notes: d.notes,
    dataUrl: d.dataUrl,
    fileType: d.fileType,
  }));

  if (!surveyNo) warnings.push('Survey number is missing; survey callouts will show “—”.');
  if (!finalPlot) warnings.push('Final plot number is missing; FP callouts will show “—”.');
  if (!areaSqM) warnings.push('Plot area is missing; area fields will show “—”.');
  if (!op && !fp) warnings.push('No OP/FP coordinate match in the scheme index; snapshots center on the saved pin.');
  if (!record) warnings.push('No survey policy record matched; DGDCR values use scheme defaults.');

  const tpShort =
    b.sector ||
    (record?.schemeName?.replace('Town Planning Scheme', '').trim() ?? '') ||
    `TP ${schemeNum}`;

  const parcel: DossierParcel = {
    title,
    village,
    subSector: subSector || record?.subSector || '',
    schemeLabel: record?.schemeName || `Town Planning Scheme ${schemeNum}`,
    tpShort,
    sid: b.sid,
    schemeNum,
    x: b.x,
    y: b.y,
    opX: op ? Number(op.x ?? op.cadastralX) : null,
    opY: op ? Number(op.y ?? op.cadastralY) : null,
    fpX: fp ? Number(fp.x ?? fp.cadastralX) : null,
    fpY: fp ? Number(fp.y ?? fp.cadastralY) : null,
    surveyNo: surveyNo || '—',
    finalPlot: finalPlot || '—',
    oldSurveyNo: overrides.oldSurveyNo || b.oldSurveyNo || '',
    district: overrides.district || b.district || 'Ahmedabad',
    taluka: overrides.taluka || b.taluka || 'Dholera',
    tenure: overrides.tenure || b.tenure || '',
    naStatus: overrides.naStatus || b.naStatus || '',
    fpRoad:
      overrides.fpRoad ||
      b.fpRoad ||
      (roadWidthM >= 200 ? '250 MTRS EXPRESSWAY' : `${roadWidthM} MTRS TP ROAD`),
    zone,
    permittedUses: record?.permittedUses || '',
    statutoryTable: record?.statutoryTable || '',
    legalStatus: record?.legalStatus || 'Sanctioned Preliminary Scheme (Sec 50 Act 1976)',
    roadWidthM,
    roadWidthFt: (roadWidthM * 3.28084).toFixed(1),
    roadClass: roadClassFor(roadWidthM),
    accessNote:
      roadWidthM >= 200
        ? 'Direct access via sanctioned 250m central spine expressway corridor'
        : `Direct frontage on proposed ${roadWidthM}m TP road grid`,
    areaSqM,
    areaSqYd,
    maxFAR,
    chargeableFAR: Math.round((maxFAR + 0.6) * 10) / 10,
    maxHeightM: record?.maxHeightM ?? '',
    heightDesc: record?.heightDesc || '',
    groundCoveragePct,
    footprintSqM,
    setbacks: record?.setbacks || '',
    maxBuildingLength:
      /industrial/i.test(zone) || schemeNum === '2' || schemeNum === '5'
        ? '60.00 m max continuous facade (fire separation as per norms)'
        : /residential/i.test(zone) || schemeNum === '1'
          ? '35.00 m max continuous depth (light well / courtyard as per norms)'
          : '50.00 m max continuous facade frontage',
    price: overrides.price ?? b.price ?? '',
    pricePerSqYd:
      typeof overrides.pricePerSqYd === 'number' && overrides.pricePerSqYd > 0
        ? overrides.pricePerSqYd
        : typeof b.pricePerSqYd === 'number' && b.pricePerSqYd > 0
          ? b.pricePerSqYd
          : null,
    reraId: overrides.reraId ?? b.reraId ?? '',
    highlights: Array.isArray(b.highlights) ? b.highlights.filter((x) => typeof x === 'string' && x.trim()).slice(0, 6) : [],
    landmarks: Array.isArray(b.landmarks) ? b.landmarks.filter((x) => x && x.name).slice(0, 6) : [],
    facing: b.facing || '',
    description: b.description || b.note || '',
    jantriRatePerSqM: b.jantriRatePerSqM ?? null,
    allottedFromSurvey: record?.allottedFromSurvey || '',
    lat: record && typeof (record as { lat?: number }).lat === 'number' ? (record as { lat?: number }).lat as number : null,
    lng: record && typeof (record as { lng?: number }).lng === 'number' ? (record as { lng?: number }).lng as number : null,
    // A bookmark saved before native coords were captured has no sid/x/y; never
    // print "undefined"/"NaN" into a paid deliverable — fall back to the atlas.
    verifyUrl:
      b.sid && Number.isFinite(b.x) && Number.isFinite(b.y)
        ? `https://dholeramap.com/?sid=${b.sid}&x=${Math.round(b.x)}&y=${Math.round(b.y)}&zoom=2.5`
        : 'https://dholeramap.com',
  };

  return { parcel, docs, warnings };
}

/** Union bounds of all indexed plots in the parcel's sub-sector (for the zone view). */
export async function subSectorBounds(
  schemeNum: string,
  subSector: string
): Promise<{ x0: number; y0: number; x1: number; y1: number } | null> {
  if (!subSector) return null;
  const key = subSector.split('(')[0].trim().toLowerCase();
  const entries = await loadPlotEntries(schemeNum);
  let box: { x0: number; y0: number; x1: number; y1: number } | null = null;
  for (const e of entries) {
    if (!e.subSector || !e.bounds) continue;
    if (!e.subSector.split('(')[0].trim().toLowerCase().startsWith(key.split(' ')[0])) continue;
    const [x0, y0, x1, y1] = e.bounds;
    if (!box) box = { x0, y0, x1, y1 };
    else {
      box = {
        x0: Math.min(box.x0, x0),
        y0: Math.min(box.y0, y0),
        x1: Math.max(box.x1, x1),
        y1: Math.max(box.y1, y1),
      };
    }
  }
  return box;
}
