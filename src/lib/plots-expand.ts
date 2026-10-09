/**
 * B6 part 2: expand a compacted plots.json back to the record shape consumers
 * expect.
 *
 * `extract/compact_plots.py` rewrites each scheme's plots.json as
 *   { v: 2, constants: {...}, enums: {...}, records: { key: [ ...slim ] } }
 * where each slim record omits scheme-constant fields (they are hoisted into
 * `constants`) and low-cardinality fields are stored as an index into
 * `enums[field]`. This function reverses both transforms in one pass.
 *
 * The compaction is asserted lossless at write time, so this only restores.
 */
export type PlotRecord = Record<string, unknown>;

interface CompactedPlots {
  v: number;
  constants: Record<string, unknown>;
  enums: Record<string, unknown[]>;
  records: Record<string, PlotRecord[]>;
}

export function expandPlots(data: unknown): Record<string, PlotRecord[]> {
  if (!data || typeof data !== 'object') return {};
  const c = data as CompactedPlots;
  // v1 (uncompacted) data is already in the consumer shape; pass through.
  if (!('v' in c) || c.v !== 2 || !c.records) {
    return data as Record<string, PlotRecord[]>;
  }
  const { constants, enums, records } = c;
  const enumKeys = Object.keys(enums);
  for (const key of Object.keys(records)) {
    const slim = records[key];
    for (let i = 0; i < slim.length; i++) {
      const r = slim[i];
      const out: PlotRecord = { ...constants };
      for (const k of Object.keys(r)) {
        const v = r[k];
        out[k] = enumKeys.includes(k) && typeof v === 'number' && v >= 0
          ? enums[k][v]
          : v;
      }
      slim[i] = out;
    }
  }
  return records;
}
