/**
 * src/lib/tp-areas.ts — SINGLE SOURCE OF TRUTH for Dholera SIR Town Planning
 * Scheme areas.
 *
 * WHY THIS FILE EXISTS
 * --------------------
 * Three surfaces used to publish a hectare figure for the same scheme and all
 * three disagreed:
 *
 *   sub-scheme sheet (macro_split.jpg)   TP1 5,109  TP2 10,232  TP6 6,726
 *   src/app/guide/page.tsx               TP1 5,100  TP2 10,200  TP6 8,150
 *   TownPlanningExplorer.tsx             TP1 15,400 TP2 10,200  TP6 13,900
 *
 * On a cadastral site that is a trust failure: three pages, three answers, for
 * the same statutory quantity.
 *
 * THE RULING, AND HOW IT WAS REACHED
 * ----------------------------------
 * The official DSIRDA / DICDL site (dholera.gujarat.gov.in, "Development
 * Highlights") states two control totals:
 *
 *     "DSIR, under Town Planning Schemes 1 to 6, covers an area of 422 sq km"
 *     "Phase I covers 153 sq km of TP1 and TP2"
 *
 * Checking each candidate against those control totals:
 *
 *   candidate            TP1-6 total   vs 422 sq km   TP1+2   vs 153 sq km
 *   sub-scheme sheet        421.5 sq km      0.13% off   153.4      0.27% off
 *   guide/page.tsx          433.0 sq km      2.6% off   153.0      exact
 *   TownPlanningExplorer    698.0 sq km     65% over    256.0      67% over
 *
 * The sub-scheme sheet is the gazetted drawing itself and it reproduces BOTH
 * official control totals to within a quarter of a percent. That is not a
 * coincidence: the parent scheme area is simply the sum of its gazetted
 * sub-schemes. So the sheet is authoritative, and the parent totals below are
 * COMPUTED from it rather than typed in.
 *
 * TownPlanningExplorer's set is impossible, not merely different — its TP1+TP2
 * alone (256 sq km) is 67% larger than the official Phase I figure for those
 * two schemes combined, and its TP1-6 total (698 sq km) exceeds the official
 * area covered by all six (422 sq km) by 65%. It appears to double-count, most
 * likely by adding village areas to scheme areas.
 *
 * If this ever needs revisiting, re-check against the two DSIRDA control
 * totals quoted above. `scripts/verify_brand.js` check [6] fails the build if
 * any surface drifts from these numbers.
 */

export interface TpSubScheme {
  /** Sub-scheme code exactly as printed on the gazetted sheet, e.g. "TP 1A-1". */
  code: string;
  /** Area in hectares, as printed on the gazetted sheet. */
  ha: number;
  /** Parent Town Planning scheme. */
  parent: TpSchemeId;
}

export type TpSchemeId = 1 | 2 | 3 | 4 | 5 | 6;

/**
 * All 27 sanctioned sub-schemes, transcribed from the published sub-scheme
 * boundary sheet (public/maps/schemes/macro_split.jpg). `ha` is the figure
 * printed on that drawing, in hectares.
 *
 * Do not round, rescale or "correct" these: the whole set is validated by the
 * DSIRDA control totals, and they are what the sheet says.
 */
export const TP_SUB_SCHEMES: TpSubScheme[] = [
  { code: 'TP 1A-1', ha: 1198.46, parent: 1 },
  { code: 'TP 1A-2', ha: 867.98, parent: 1 },
  { code: 'TP 1A-3', ha: 886.45, parent: 1 },
  { code: 'TP 1A-4', ha: 186.21, parent: 1 },
  { code: 'TP 1A-5', ha: 510.38, parent: 1 },
  { code: 'TP 1B', ha: 1459.62, parent: 1 },
  { code: 'TP 2A', ha: 1720.69, parent: 2 },
  { code: 'TP 2B-1', ha: 1585.5, parent: 2 },
  { code: 'TP 2B-2', ha: 682.18, parent: 2 },
  { code: 'TP 2B-3', ha: 650.0, parent: 2 },
  { code: 'TP 2B-4', ha: 1027.35, parent: 2 },
  { code: 'TP 2B-4B', ha: 1648.04, parent: 2 },
  { code: 'TP 2B-5A', ha: 1403.89, parent: 2 },
  { code: 'TP 2B-5B', ha: 1514.83, parent: 2 },
  { code: 'TP 3A', ha: 939.31, parent: 3 },
  { code: 'TP 3B', ha: 488.88, parent: 3 },
  { code: 'TP 3C-1', ha: 1227.04, parent: 3 },
  { code: 'TP 3C-2', ha: 3976.67, parent: 3 },
  { code: 'TP 4A', ha: 527.12, parent: 4 },
  { code: 'TP 4B-1', ha: 1069.56, parent: 4 },
  { code: 'TP 4B-2', ha: 4425.27, parent: 4 },
  { code: 'TP 5A', ha: 1316.9, parent: 5 },
  { code: 'TP 5B', ha: 948.3, parent: 5 },
  { code: 'TP 5C-1', ha: 4375.41, parent: 5 },
  { code: 'TP 5C-2', ha: 784.64, parent: 5 },
  { code: 'TP 6A', ha: 634.1, parent: 6 },
  { code: 'TP 6B', ha: 6091.78, parent: 6 },
];

/** The two DSIRDA control totals, used to validate the set. */
export const DSIRDA_CONTROL = {
  /** "under Town Planning Schemes 1 to 6, covers an area of 422 sq km" */
  allSchemesSqKm: 422,
  /** "Phase I covers 153 sq km of TP1 and TP2" */
  phaseOneTp1Tp2SqKm: 153,
};

const sumHa = (parent: TpSchemeId) =>
  TP_SUB_SCHEMES.filter((s) => s.parent === parent).reduce((a, s) => a + s.ha, 0);

/** Canonical area of a scheme in hectares, computed from its sub-schemes. */
export const tpAreaHa = (id: TpSchemeId): number => sumHa(id);

/** Canonical area of a scheme in sq km, rounded to one decimal. */
export const tpAreaSqKm = (id: TpSchemeId): number => Math.round(sumHa(id) / 100) / 10;

/** Human-facing hectare string, e.g. "5,109 Ha". Derived, never typed. */
export const tpAreaLabel = (id: TpSchemeId): string =>
  `${Math.round(sumHa(id)).toLocaleString('en-IN')} Ha`;

/** Sub-schemes belonging to a scheme, in sheet order. */
export const tpSubSchemes = (id: TpSchemeId): TpSubScheme[] =>
  TP_SUB_SCHEMES.filter((s) => s.parent === id);

/** Totals across all six schemes. */
export const TP_TOTAL_HA = TP_SUB_SCHEMES.reduce((a, s) => a + s.ha, 0);
export const TP_TOTAL_SQ_KM = Math.round(TP_TOTAL_HA / 100) / 10;
export const TP_PHASE_ONE_HA = sumHa(1) + sumHa(2);
export const TP_PHASE_ONE_SQ_KM = Math.round(TP_PHASE_ONE_HA / 100) / 10;