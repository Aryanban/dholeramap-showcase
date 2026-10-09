/**
 * Statutory DGDCR (Dholera Greenfield Development Control Regulations) envelope.
 *
 * The single source of truth for FAR / height / coverage / setbacks on BOTH the
 * search path (`sheets.ts`) and the click path (`TilePyramidViewer.tsx`), so a
 * plot can no longer show two different answers depending on how you reached it.
 *
 * Two tiers, and this distinction is deliberate:
 *
 *  - **TP1 has the only machine-verified road-width -> DGDCR table** in the repo
 *    (`scripts/build_tp1_calibrated_cadastre.py:63-146`). It is ported below as
 *    `getStatutoryDGDCR` and reproduces the shipped TP1 per-record values at
 *    90-97% (measured against `public/tiles/tp1/plots.json`, 3,871 records).
 *
 *  - **TP2-6 ship one constant envelope per scheme** citing DGDCR Tables 10-4
 *    (High-Tech Industrial), 10-5 (Heavy Industrial), 10-6 (Renewable &
 *    Knowledge), 10-7 (Defense & Aerospace) and 10-9 (Logistics & Airport).
 *    Those tables live only in `DP_Report_2.pdf`, a 274-page *scan*, so they are
 *    ASSERTED, not verified (docs/03 §5, docs/05 B.4 risk 3). They are
 *    centralised here as `SCHEME_ENVELOPE` and flagged `isEstimated` so the UI
 *    can say so, instead of being duplicated across four stale copies
 *    (search_index.json `profiles`, InfoPanel fallbacks, TilePyramidViewer
 *    fallbacks, and the Python generators).
 *
 * Applying the TP1 residential table to TP2-6 was considered and REJECTED: it
 * disagrees with the shipped industrial envelopes on 84-100% of records and would
 * silently rewrite every industrial/logistics FAR from an unverified residential
 * table. That is Option B's job, once the DGDCR scan is OCR-verified.
 */

export interface DgdcrResult {
  zone: string;
  zoneCode: string;
  maxFAR: number;
  maxHeightM: number;
  heightDesc: string;
  groundCoveragePct: number;
  setbacks: string;
  permittedUses: string;
  statutoryTable: string;
}

export interface SchemeDgdcrResult extends DgdcrResult {
  /** true when the envelope is asserted rather than road-width-derived/verified */
  isEstimated: boolean;
  dataSource: 'statutory' | 'estimated';
}

export function getStatutoryDGDCR(
  baseZone: string,
  roadWidthM: number,
  isGamtalBuffer = false
): DgdcrResult {
  const road = Number(roadWidthM) || 0;

  if (isGamtalBuffer) {
    return {
      zone: 'Village Buffer Zone (Gamtal Extension)',
      zoneCode: 'VB',
      maxFAR: 1.0,
      maxHeightM: 10,
      heightDesc: 'G+2 (10m max)',
      groundCoveragePct: 70,
      setbacks: '2m Front / 2m Rear / 1.5m Sides',
      permittedUses:
        'Residential Townhouses, Detached Villas, Local Retail, Neighborhood Services',
      statutoryTable: 'DGDCR Table 10-8 (Village Buffer Regulations)',
    };
  }

  if (
    (baseZone && (baseZone.includes('Commercial') || baseZone.includes('City Center'))) ||
    road >= 55
  ) {
    if (road >= 55) {
      return {
        zone: 'High Access Corridor & City Center (HAC/CC)',
        zoneCode: 'HAC_CC',
        maxFAR: 5.0,
        maxHeightM: 150,
        heightDesc: 'Up to 150m (High-Rise Iconic)',
        groundCoveragePct: 40,
        setbacks: '10m Front / 8m Rear / 6m Sides',
        permittedUses:
          'High-Rise Mixed-Use, Corporate Headquarters, Serviced Apartments, Retail Malls',
        statutoryTable:
          'DGDCR Table 10-2 / 10-3 (High Access Corridor & City Centre)',
      };
    }
    return {
      zone: 'City Center & Commercial Core',
      zoneCode: 'CC',
      maxFAR: 2.5,
      maxHeightM: 20,
      heightDesc: 'Up to 20m (G+5)',
      groundCoveragePct: 40,
      setbacks: '8m Front / 6m Rear / 6m Sides',
      permittedUses: 'Commercial Complexes, Retail Malls, Office Spaces, Restaurants',
      statutoryTable: 'DGDCR Table 10-3 (City Centre Regulations)',
    };
  }

  // Standard Residential Zone (DGDCR Table 10-1)
  if (road >= 55) {
    return {
      zone: 'Residential Zone (R-1) — Wide Corridor',
      zoneCode: 'R1_WIDE',
      maxFAR: 2.0,
      maxHeightM: 18,
      heightDesc: 'G+5 (18m max)',
      groundCoveragePct: 60,
      setbacks: '5m Front / 6m Rear / 6m Sides',
      permittedUses:
        'Multi-Storey Apartments, Retail Mall, Petrol Pump, Hospital, Educational Campus',
      statutoryTable: 'DGDCR Table 10-1 (Residential Zone — 55m+ Road)',
    };
  }
  if (road >= 25) {
    return {
      zone: 'Residential Zone (R-1) — Primary Sector Road',
      zoneCode: 'R1_MID',
      maxFAR: 1.5,
      maxHeightM: 15,
      heightDesc: 'G+3 (15m max)',
      groundCoveragePct: 60,
      setbacks: '5m Front / 5m Rear / 5m Sides',
      permittedUses:
        'Neighbourhood Retail, Commercial Centre, Secondary School, Multi-Storey Apartments',
      statutoryTable: 'DGDCR Table 10-1 (Residential Zone — 25m to 55m Road)',
    };
  }
  return {
    zone: 'Residential Zone (R-1) — Internal Sector Access',
    zoneCode: 'R1_INT',
    maxFAR: 1.0,
    maxHeightM: 10,
    heightDesc: 'G+2 (10m max)',
    groundCoveragePct: 50,
    setbacks: '3m Front / 3m Rear / 3m Sides',
    permittedUses:
      'Multi-Storey Apartments, Row-Houses, Detached Villas / Bungalows, Primary Schools',
    statutoryTable: 'DGDCR Table 10-1 (Residential Zone — Below 25m Road)',
  };
}

/**
 * Per-scheme envelopes for TP2-6. Transcribed exactly from the shipped
 * `search_index.json` `profiles` block (which no script regenerates — see
 * docs/04 §A.2) so the values are unchanged, but now owned in one place.
 * ASSERTED, not verified: DP_Report_2.pdf is a scan (docs/03 §5).
 */
export const SCHEME_ENVELOPE: Record<string, DgdcrResult> = {
  dholera_tp2: {
    zone: 'High-Tech Industrial & Knowledge Hub',
    zoneCode: 'IND_IT',
    maxFAR: 2.5,
    maxHeightM: 45,
    heightDesc: 'Up to 45m (Mid-Rise Industrial)',
    groundCoveragePct: 40,
    setbacks: '8m Front / 6m Rear / 6m Sides',
    permittedUses:
      'Semiconductor Fabrication, High-Tech Electronics, Software Technology Parks, R&D Labs',
    statutoryTable: 'DGDCR Table 10-4 (High-Tech Industrial)',
  },
  dholera_tp3: {
    zone: 'Heavy & General Industrial Zone',
    zoneCode: 'IND_HEAVY',
    maxFAR: 1.6,
    maxHeightM: 25,
    heightDesc: 'Up to 25m (Industrial Plant)',
    groundCoveragePct: 50,
    setbacks: '8m Front / 8m Rear / 6m Sides',
    permittedUses:
      'Heavy Engineering, Machinery Fabrication, Auto Ancillaries, Warehousing & Logistics',
    statutoryTable: 'DGDCR Table 10-5 (Heavy Industrial)',
  },
  dholera_tp4: {
    zone: 'Solar Power Park & Knowledge Corridor',
    zoneCode: 'SOLAR_KNOW',
    maxFAR: 2,
    maxHeightM: 32,
    heightDesc: 'Up to 32m (Commercial/Institutional)',
    groundCoveragePct: 35,
    setbacks: '6m Front / 6m Rear / 6m Sides',
    permittedUses:
      'Solar Power Equipment, Renewable Energy Research, Higher Educational Institutes',
    statutoryTable: 'DGDCR Table 10-6 (Renewable & Knowledge Zone)',
  },
  dholera_tp5: {
    zone: 'Mega Industrial & Defense Aerospace',
    zoneCode: 'IND_DEFENSE',
    maxFAR: 1.8,
    maxHeightM: 25,
    heightDesc: 'Up to 25m (Industrial/Aerospace)',
    groundCoveragePct: 50,
    setbacks: '8m Front / 8m Rear / 6m Sides',
    permittedUses:
      'Defense Manufacturing, Aerospace Components, Large Fabrication Yards, MRO Facilities',
    statutoryTable: 'DGDCR Table 10-7 (Defense & Aerospace)',
  },
  dholera_tp6: {
    zone: 'Logistics CFS & Cargo Airport City',
    zoneCode: 'LOGISTICS_AIR',
    maxFAR: 1,
    maxHeightM: 25,
    heightDesc: 'Up to 25m (CFS & Cargo Logistics)',
    groundCoveragePct: 30,
    setbacks: '6m Front / 6m Rear / 6m Sides',
    permittedUses:
      'Cargo Terminal Operations, Container Freight Station, Bonded Warehousing, Cold Chain',
    statutoryTable: 'DGDCR Table 10-9 (Logistics & Airport City)',
  },
};

/**
 * The envelope for a record, given its scheme and road width.
 *
 * - TP1: road-width-derived from the verified table (baseZone is unknown per
 *   record in the search index, so the width-only residential branch is used —
 *   matches shipped TP1 data at 90%; the residual is City-Centre records on
 *   <55 m roads, which only per-record zone data can resolve → Option B).
 * - TP2-6: the asserted per-scheme envelope, flagged estimated.
 * - TP6's width is additionally suspect: 2,766/3,294 records carry the
 *   hard-coded 30 m fallthrough (`recalibrate…:126`), so those are estimated
 *   even though the envelope itself is not width-derived.
 */
export function getSchemeDGDCR(
  schemeId: string,
  roadWidthM: number,
  baseZone = ''
): SchemeDgdcrResult {
  const width = Number(roadWidthM);
  const hasRealWidth = Number.isFinite(width) && width > 0;
  const effectiveWidth = hasRealWidth ? width : 18;

  if (schemeId === 'dholera_tp1') {
    const d = getStatutoryDGDCR(baseZone, effectiveWidth);
    const isEstimated = !hasRealWidth;
    return { ...d, isEstimated, dataSource: isEstimated ? 'estimated' : 'statutory' };
  }

  const env = SCHEME_ENVELOPE[schemeId];
  if (env) {
    // These envelopes are per-scheme constants, not derived from the record's
    // road width, and their source (DP_Report_2.pdf) is a scan — asserted, not
    // verified (see header). They are therefore always flagged estimated.
    // TP6's width is additionally the hard-coded 30 m fallthrough for most
    // records (`recalibrate…:126`), so those are suspect twice over.
    const isEstimated = true;
    return { ...env, isEstimated, dataSource: 'estimated' };
  }

  // Unknown scheme: fall back to the width-only residential table, flagged.
  const d = getStatutoryDGDCR(baseZone, effectiveWidth);
  return { ...d, isEstimated: true, dataSource: 'estimated' };
}
