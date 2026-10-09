/**
 * Real per-village survey registry.
 *
 * EVERY (village, surveyNo) pair in this map is guaranteed to exist in
 * `public/data/search_index.json` — the registry is generated from that ground
 * truth by `scripts/build_gazetted_surveys.py` (largest net area per village,
 * deduplicated, numeric survey numbers only).
 *
 * Do NOT hand-edit this list. Re-run the generator after regenerating
 * search_index.json:
 *     python3 scripts/build_gazetted_surveys.py
 *
 * Historical note: this replaced a hardcoded `GAZETTED_SURVEYS` array that was
 * cross-multiplied across all 22 villages, which produced 396 pages of which
 * 283 were near-identical "no record" boilerplate — the direct cause of the
 * 271 "Discovered - currently not indexed" pages in Search Console.
 */

import fs from 'fs';
import path from 'path';

export interface GazettedSurvey {
  surveyNo: string;
  finalPlot: string;
  schemeId: string;
  subSector: string;
  roadWidthM: number;
  area: number;
}

type Registry = Record<string, GazettedSurvey[]>;

let cache: Registry | null = null;

const DATA_FILE = path.join(process.cwd(), 'public', 'data', 'gazetted_surveys.json');

function load(): Registry {
  if (cache) return cache;
  try {
    cache = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')) as Registry;
  } catch {
    // During a fresh clone before the generator has run, degrade to nothing
    // rather than fabricating pages.
    cache = {};
  }
  return cache;
}

/** All villages that genuinely have parcels, with their real survey records. */
export function villagesWithSurveys(): string[] {
  return Object.keys(load()).sort();
}

/** Real survey records for a village slug, largest area first. Empty if none. */
export function surveysForVillage(villageSlug: string): GazettedSurvey[] {
  return load()[villageSlug.toLowerCase()] || [];
}

/** True only when the (village, surveyNo) pair exists in the live dataset. */
export function isRealSurvey(villageSlug: string, surveyNo: string): boolean {
  const key = String(surveyNo || '').trim();
  if (!key) return false;
  return surveysForVillage(villageSlug).some((s) => s.surveyNo === key);
}

/**
 * Every real (village, surveyNo) pair — for `generateStaticParams` and the
 * sitemap. This is the complete set of legitimate survey URLs on the site.
 */
export function allSurveyPairs(): { village: string; surveyNo: string }[] {
  const out: { village: string; surveyNo: string }[] = [];
  for (const [village, surveys] of Object.entries(load())) {
    for (const s of surveys) out.push({ village, surveyNo: s.surveyNo });
  }
  return out;
}
