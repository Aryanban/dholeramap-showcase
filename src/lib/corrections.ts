/**
 * Local corrections layer for cadastral assignments (doc 17 §4.1).
 *
 * The generated data asserts a survey<->final-plot link only when it is a mutual-nearest
 * pair; the rest ship as `unverified` candidates or "not allotted". A broker who knows the
 * ground truth can correct the final-plot or survey number for a record locally. Corrections
 * live in localStorage, are applied over the base data at load time, and can be exported or
 * imported so one person's verified work can be shared (and eventually merged back into the
 * generated source data).
 */

const KEY = 'dholera-cadastral-corrections-v1';

export type Correction = {
  finalPlot?: string;
  surveyNo?: string;
  note?: string;
  updatedAt: string;
};

export type CorrectionMap = Record<string, Correction>;

/** Read the local correction set. Never throws. */
export function loadCorrections(): CorrectionMap {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as CorrectionMap) : {};
  } catch {
    return {};
  }
}

/** Persist the full correction set. */
export function saveCorrections(c: CorrectionMap): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(KEY, JSON.stringify(c));
}

/** Set the correction for one record id (recordId = e.g. "dholera_tp5-op-331-12"). */
export function setCorrection(recordId: string, patch: Partial<Correction>): CorrectionMap {
  const all = loadCorrections();
  all[recordId] = { ...all[recordId], ...patch, updatedAt: new Date().toISOString() };
  saveCorrections(all);
  return all;
}

export function clearCorrection(recordId: string): CorrectionMap {
  const all = loadCorrections();
  delete all[recordId];
  saveCorrections(all);
  return all;
}

/**
 * Apply corrections over a plots.json index (mutates records in place, returns the count).
 * Only overrides the fields the correction supplies; a corrected value is flagged so the UI
 * can show it as user-verified rather than generated truth.
 */
export function applyCorrections(index: Record<string, unknown[]>): number {
  const all = loadCorrections();
  let n = 0;
  for (const [id, patch] of Object.entries(all)) {
    for (const recs of Object.values(index)) {
      const hit = (recs as Record<string, unknown>[]).find((r) => r && r.id === id);
      if (!hit) continue;
      if (typeof patch.finalPlot === 'string' && patch.finalPlot) {
        hit.finalPlot = patch.finalPlot;
        hit.assignmentConfidence = 'user-verified';
      }
      if (typeof patch.surveyNo === 'string' && patch.surveyNo) {
        hit.surveyNo = patch.surveyNo;
        hit.surveyConfidence = 'user-verified';
      }
      n++;
      break;
    }
  }
  return n;
}

/** Serialise the correction set for download / sharing. */
export function exportCorrections(): string {
  return JSON.stringify(loadCorrections(), null, 2);
}
