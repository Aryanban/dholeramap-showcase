/**
 * Build-time lookup of a real cadastral record for the statically pre-rendered
 * survey pages (`src/app/survey/[village]/[surveyNo]`).
 *
 * Before this existed, those pages invented `roadWidthM`, area and FAR from the
 * survey number modulo (`page.tsx` ex-:59-65) — false values that were then
 * emitted into JSON-LD structured data. This reads the *real*
 * `search_index.json` the live map already serves, so a survey page can only
 * state a number the map actually carries, and must otherwise say it is
 * estimated (docs/04 §A.5).
 */

import fs from 'fs';
import path from 'path';
import { getSchemeDGDCR } from './dgdcr';
import { surveysForVillage, allSurveyPairs } from './gazetted-surveys';

export interface SurveyLookup {
  surveyNo: string;
  finalPlot: string;
  village: string;
  schemeId: string;
  subSector: string;
  roadWidthM: number;
  allottedAreaSqM?: number;
  /** True when allottedAreaSqM was measured off the digitised polygon rather
   *  than read from the statutory register — the page must mark it indicative. */
  areaDerived?: boolean;
  maxFAR: number;
  maxHeightM: number;
  heightDesc: string;
  groundCoveragePct: number;
  statutoryTable: string;
  isEstimated: boolean;
  found: boolean;
  /** True when search_index.json carries SEVERAL different Final Plot numbers
   *  for this survey number. The page must not assert one of them; it discloses
   *  the conflict instead. See chooseRow(). */
  fpAmbiguous?: boolean;
}

let cache: Map<string, SurveyLookup[]> | null = null;

function loadIndex(): Map<string, SurveyLookup[]> {
  if (cache) return cache;
  const filePath = path.join(process.cwd(), 'public', 'data', 'search_index.json');
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8')) as {
    items: [string, string, string, string, string, string, number, number, number, number][];
  };
  const map = new Map<string, SurveyLookup[]>();
  for (const [id, surveyNo, finalPlot, village, schemeId, subSector, , , roadWidthM, allottedAreaSqM] of data.items) {
    const width = Number(roadWidthM);
    const w = Number.isFinite(width) && width > 0 ? width : 18;
    const d = getSchemeDGDCR(schemeId, w);
    const rec: SurveyLookup = {
      surveyNo: String(surveyNo || ''),
      finalPlot: String(finalPlot || ''),
      village: String(village || ''),
      schemeId,
      subSector: String(subSector || ''),
      roadWidthM: w,
      allottedAreaSqM: Number(allottedAreaSqM) > 0 ? Number(allottedAreaSqM) : undefined,
      maxFAR: d.maxFAR,
      maxHeightM: d.maxHeightM,
      heightDesc: d.heightDesc,
      groundCoveragePct: d.groundCoveragePct,
      statutoryTable: d.statutoryTable,
      isEstimated: d.isEstimated,
      found: true,
    };
    const key = `${rec.village.toLowerCase()}|${rec.surveyNo}`;
    const list = map.get(key);
    if (list) list.push(rec);
    else map.set(key, [rec]);
  }
  cache = map;
  return cache;
}

/**
 * Picks the row to render for a survey number.
 *
 * `search_index.json` holds ONE ROW PER CANVAS POSITION, not per parcel, so a
 * single (village, surveyNo) legitimately maps to several rows — the same
 * survey number is stamped at multiple points on the plan sheet.
 *
 * `scripts/build_gazetted_surveys.py` already knows this and says so at line
 * 109: "A survey number can map to several final plots; keep the one that
 * carries a final plot, else the first seen." This function previously ignored
 * that rule and always took `hits[0]`, so 692 parcels rendered with NO Final
 * Plot number even though the correct one was sitting in the same result set.
 * On a cadastral site the FP number is the whole point of the page, and the §8
 * quality gate treats its absence as grounds for noindex.
 *
 * SAFENESS: 666 pairs carry genuinely DIFFERENT FP values across their rows
 * (e.g. ambli/82 -> both 'FP-77' and 'FP-851'; bhadiyad -> 110 rows spanning
 * D-15, D-16, D-39/1, D-40). Publishing a Final Plot number is a statutory
 * claim, so where the index disagrees with itself we do NOT pick a winner —
 * we keep the original `hits[0]` behaviour and let the page say it has none.
 * Only a single, unanimous FP value is promoted.
 *
 * Returns { rec, fpAmbiguous } so the caller can disclose the ambiguity.
 */
function chooseRow(hits: SurveyLookup[]): { rec: SurveyLookup; fpAmbiguous: boolean } {
  const rec = hits[0];
  if (rec.finalPlot && String(rec.finalPlot).trim()) {
    return { rec, fpAmbiguous: false };
  }

  const withFp = hits.filter((h) => h.finalPlot && String(h.finalPlot).trim());
  if (withFp.length === 0) return { rec, fpAmbiguous: false };

  const distinct = new Set(withFp.map((h) => String(h.finalPlot).trim()));
  if (distinct.size > 1) {
    // The index contradicts itself for this survey number. Do not invent a
    // statutory answer; keep the incumbent row and record the conflict.
    return { rec, fpAmbiguous: true };
  }

  return { rec: withFp[0], fpAmbiguous: false };
}

/**
 * Returns the real record for a village slug + survey number, or a clearly
 * labelled estimate when no such parcel exists in the live dataset (9 of 22
 * "villages" have zero parcels — docs/03 §1).
 */
export function lookupSurvey(villageSlug: string, surveyNo: string): SurveyLookup {
  const map = loadIndex();
  const hits = map.get(`${villageSlug.toLowerCase()}|${surveyNo}`) || map.get(`${villageSlug.toLowerCase()}|${String(parseInt(surveyNo, 10) || 0)}`);
  if (hits && hits.length) {
    const { rec, fpAmbiguous } = chooseRow(hits);
    // The index's own area tuple is always empty (the plan sheets are printed
    // "not to scale"), so the measured polygon area stamped on the registry by
    // scripts/build_parcel_areas.py is the only real number available. It is
    // digitised geometry, not the statutory register value.
    const measured = surveysForVillage(villageSlug).find(
      (s) => s.surveyNo === String(surveyNo || ''),
    )?.area;
    if (measured && measured > 0 && !(rec.allottedAreaSqM && rec.allottedAreaSqM > 0)) {
      rec.allottedAreaSqM = measured;
      rec.areaDerived = true;
    }
    if (fpAmbiguous) rec.fpAmbiguous = true;
    return rec;
  }
  // No real parcel: honest fallback, flagged, never a modulo fabrication.
  const d = getSchemeDGDCR('dholera_tp1', 18);
  return {
    surveyNo,
    finalPlot: '',
    village: villageSlug.charAt(0).toUpperCase() + villageSlug.slice(1),
    schemeId: '',
    subSector: '',
    roadWidthM: 18,
    allottedAreaSqM: undefined,
    maxFAR: d.maxFAR,
    maxHeightM: d.maxHeightM,
    heightDesc: d.heightDesc,
    groundCoveragePct: d.groundCoveragePct,
    statutoryTable: d.statutoryTable,
    isEstimated: true,
    found: false,
  };
}

/**
 * QUALITY GATE — decides whether a survey page is worth indexing.
 *
 * Implements the "SSR Quality Gate" specified in docs/IMPLEMENTATION_PLAN.md §8:
 * parcels carrying all core information signals emit `index, follow`; incomplete
 * records emit `noindex, follow` so crawl equity concentrates on the pages that
 * can actually rank.
 *
 * WHY THIS EXISTS: GSC reported 41 "Crawled - currently not indexed" against
 * 3,635 survey URLs that differ only by interpolated numbers. Google read them
 * as scaled-content permutations. The plan's target is 40%-60% selective
 * indexing of survey endpoints — and the data's own natural break lands at
 * ~44%, which is the signal this gate keys on.
 *
 * The three signals, mapped to what the data can actually evidence. Note the
 * third differs from the plan's wording, and the deviation is deliberate:
 *
 *   1. "Verified road access node"  -> a resolvable Final Plot (FP) number.
 *      The FP is the statutory, saleable, mappable unit; a page that cannot
 *      name it is not describing a purchasable parcel.
 *   2. "DGDCR simulation matrix"     -> a resolved scheme + a non-fallback
 *      road width, so the FAR/height/coverage table is computed from real
 *      inputs rather than the `isEstimated` stub.
 *   3. "Distance isochrones"         -> NOT YET IMPLEMENTED anywhere in this
 *      codebase; there is no isochrone data to assert. The nearest available
 *      signal is measured parcel geometry (digitised polygon area), used here
 *      as the spatial-confidence proxy. When isochrones land, swap this arm.
 *
 * Read from `search_index.json` — the SAME source the page renders from — so the
 * gate can never certify a record the page is unable to display. Scoring off
 * gazetted_surveys.json instead would certify ~69% while only ~44% of pages
 * actually show a Final Plot.
 *
 * `noindex, follow` (not `nofollow`) is used deliberately: weak pages stay fully
 * crawlable and keep passing link equity, they simply stop competing for
 * impressions. That satisfies the plan's "100% crawlable link paths".
 */
export function isIndexableSurvey(villageSlug: string, surveyNo: string): boolean {
  const map = loadIndex();
  const hits =
    map.get(`${villageSlug.toLowerCase()}|${surveyNo}`) ||
    map.get(`${villageSlug.toLowerCase()}|${String(parseInt(surveyNo, 10) || 0)}`);
  if (!hits || !hits.length) return false;

  // Must use the SAME row-selection rule as lookupSurvey(), or the gate would
  // certify or reject parcels on a different basis from the one the page
  // actually renders. Using hits[0] here while the page used chooseRow() was
  // leaving 692 parcels noindexed despite the page being able to show their
  // Final Plot number.
  const { rec } = chooseRow(hits);
  const measured = surveysForVillage(villageSlug).find(
    (s) => s.surveyNo === String(surveyNo || ''),
  )?.area;

  // 1. Verified road access node: a resolvable FP number.
  if (!rec.finalPlot || !String(rec.finalPlot).trim()) return false;

  // 2. DGDCR simulation matrix: the page must render a complete, resolved
  //    envelope for this parcel's real scheme.
  //
  //    NOTE: this deliberately does NOT require `isEstimated === false`.
  //    `isEstimated` is a PROVENANCE flag — it is true for every TP2-TP6 record
  //    because those envelopes were transcribed from a scanned PDF rather than
  //    a statutory table (see getSchemeDGDCR, dgdcr.ts:242-251). Gating on it
  //    would noindex the entire Tata Semiconductor fab corridor (TP2 /
  //    Hebatpur), i.e. the most commercially valuable pages on the site, for
  //    having an honestly-labelled source rather than a thin one. The page
  //    already marks those figures as estimated; that disclosure is the correct
  //    behaviour, not grounds for exclusion.
  if (!rec.schemeId) return false;
  if (!/^dholera_tp[1-6]$/.test(rec.schemeId)) return false;
  if (!Number.isFinite(rec.roadWidthM) || rec.roadWidthM <= 0) return false;
  if (!rec.maxFAR || !rec.maxHeightM || !rec.groundCoveragePct || !rec.statutoryTable) {
    return false;
  }

  // 3. Spatial confidence: measured geometry (isochrone proxy).
  const area = rec.allottedAreaSqM && rec.allottedAreaSqM > 0 ? rec.allottedAreaSqM : measured;
  if (!area || !(area > 0)) return false;

  return true;
}

/** Every (village, surveyNo) pair that BOTH exists in the gazetted registry
 *  (i.e. is a real published parcel) AND passes the quality gate.
 *
 *  The registry intersection is essential: `loadIndex()` carries 33,481 rows,
 *  but only the ~3,635 registry pairs are real published parcels. Emitting
 *  indexable URLs from the index alone would invent thousands of pages that
 *  render the "not in the live dataset" stub.
 *
 *  This is what feeds the sitemap, so a noindex page can never be advertised
 *  there — the exact contradiction GSC flagged as "Excluded by noindex /
 *  Failed" on /properties. */
export function indexableSurveyPairs(): { village: string; surveyNo: string }[] {
  return allSurveyPairs().filter((p) => isIndexableSurvey(p.village, p.surveyNo));
}

/**
 * Village-relative comparison for a published parcel.
 *
 * Purpose: the /survey pages are programmatic, and Google's "Crawled -
 * currently not indexed" drilldown showed the refusals clustering by
 * (scheme, roadWidth) — every parcel in such a cluster renders an identical
 * DGDCR table, geometry paragraph and FAQ apart from the interpolated
 * survey number, so Google sees near-duplicates. These rankings are computed
 * from the same published registry the village pages already serve, so they
 * are unique per parcel (no two share rank + percentile + ratio) without
 * introducing any figure the map does not already carry.
 */
export interface ParcelComparison {
  villageParcels: number;
  /** 1 = largest published parcel in the village. */
  areaRank?: number;
  /** 0-100: share of village parcels strictly smaller than this one. */
  areaPercentile?: number;
  villageMedianArea?: number;
  /** This parcel's area divided by the village median, to one decimal. */
  areaVsMedian?: number;
  /** 1 = widest abutting road tier published in the village. */
  roadTierRank: number;
  /** Published parcels in the village sharing this exact road width. */
  roadTierCount: number;
  /** Distinct abutting road widths published in the village. */
  roadTiersInVillage: number;
  /** Share of village parcels on a road no wider than this one. */
  roadPercentile: number;
  isWidestTier: boolean;
}

export function compareParcelInVillage(
  villageSlug: string,
  surveyNo: string,
  areaSqM?: number,
): ParcelComparison | null {
  const list = surveysForVillage(villageSlug);
  if (list.length === 0) return null;

  const rec = list.find((s) => s.surveyNo === String(surveyNo ?? '').trim());
  const area = areaSqM && areaSqM > 0 ? areaSqM : rec?.area;

  const widths = list.map((s) => s.roadWidthM).filter((w) => w > 0);
  // widest first, so index 0 is the top tier
  const distinctWidths = [...new Set(widths)].sort((a, b) => b - a);
  const myWidth = rec?.roadWidthM ?? 0;
  const roadTierRank = myWidth > 0 ? distinctWidths.indexOf(myWidth) + 1 : distinctWidths.length;
  const roadTierCount = myWidth > 0 ? widths.filter((w) => w === myWidth).length : 0;
  const roadPercentile = myWidth > 0
    ? Math.round((widths.filter((w) => w <= myWidth).length / widths.length) * 100)
    : 0;

  const out: ParcelComparison = {
    villageParcels: list.length,
    roadTierRank,
    roadTierCount,
    roadTiersInVillage: distinctWidths.length,
    roadPercentile,
    isWidestTier: roadTierRank === 1 && myWidth > 0,
  };

  const areas = list.map((s) => s.area).filter((a) => a > 0);
  if (area && area > 0 && areas.length) {
    // rank = number of parcels strictly larger + 1 (ties share a rank)
    out.areaRank = areas.filter((a) => a > area).length + 1;
    out.areaPercentile = Math.round((areas.filter((a) => a < area).length / areas.length) * 100);
    const sorted = [...areas].sort((a, b) => b - a);
    const mid = Math.floor(sorted.length / 2);
    // Even village counts average the two middle parcels, which lands on x.5;
    // round to a whole number so the published copy never reads "8,100.5 m²".
    out.villageMedianArea = Math.round(
      sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2,
    );
    out.areaVsMedian = out.villageMedianArea
      ? Math.round((area / out.villageMedianArea) * 10) / 10
      : undefined;
  }

  return out;
}
