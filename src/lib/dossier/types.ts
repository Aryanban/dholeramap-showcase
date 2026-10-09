/**
 * Client-ready landscape dossier engine — shared types.
 *
 * Everything runs locally in the browser: no server round-trips, no AI.
 * Developer PDFs are uploaded by the user, stored in IndexedDB, and used as
 * template sources (static pages are copied verbatim; plot-specific pages are
 * generated from saved-plot + survey data + locally stitched map snapshots).
 */

export type DossierPageSizeId = 'template-native' | 'presentation-16x9' | 'a4-landscape';

export type DossierQuality = 'whatsapp' | 'print';

export type DossierMapView =
  | 'cover-wide'
  | 'tp-full'
  | 'subsector'
  | 'zoning'
  | 'exact'
  | 'op'
  | 'fp'
  | 'zoom-grid';

export type DossierPageRole =
  | 'cover'
  | 'executive-summary'
  | 'about-dholera'
  | 'connectivity'
  | 'mega-projects'
  | 'tp-scheme-planning'
  | 'property-details'
  | 'land-details'
  | 'tp-location'
  | 'zoning'
  | 'op-fp'
  | 'layout-plan'
  | 'parcel-zooms'
  | 'dgdcr'
  | 'documents'
  | 'images'
  | 'closing'
  | 'marketing';

export interface DossierRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** A page in the source template PDF and how the engine treats it. */
export interface DossierSourcePage {
  /** 0-based index into the source PDF. */
  sourceIndex: number;
  role: DossierPageRole;
  /**
   * - copy: page is plot-independent marketing/static — copied verbatim.
   * - exemplar-copy: plot-specific page copied ONLY when the dossier parcel
   *   matches the template's exemplar parcel; otherwise a generated page
   *   replaces it.
   * - generate: always generated fresh for the parcel (no source reuse).
   */
  mode: 'copy' | 'exemplar-copy' | 'generate';
  label: string;
  includeByDefault: boolean;
}

export interface DossierTheme {
  primary: string;
  primaryDark: string;
  accent: string;
  banner: string;
  ink: string;
  muted: string;
  paper: string;
  panel: string;
}

export interface DossierExemplarParcel {
  village: string;
  surveyNo: string;
  finalPlot: string;
  tp: string;
}

export interface DossierTemplateDefinition {
  id: string;
  name: string;
  developer: string;
  project?: string;
  fingerprint: {
    sha256: string;
    pages: number;
    width: number;
    height: number;
  };
  /** Native page size of the source PDF, in PDF points. */
  pageSize: [number, number];
  pages: DossierSourcePage[];
  theme: DossierTheme;
  exemplar?: DossierExemplarParcel;
  footerNote: string;
}

export interface StoredDossierTemplate {
  id: string;
  definitionId: string | null;
  name: string;
  developer: string;
  sourceFileName: string;
  sourceBytes: Uint8Array;
  sha256: string;
  pageCount: number;
  width: number;
  height: number;
  createdAt: number;
  updatedAt: number;
}

/** Fully resolved, export-ready parcel data for one dossier. */
export interface DossierParcel {
  title: string;
  village: string;
  subSector: string;
  schemeLabel: string;
  tpShort: string;
  sid: string;
  schemeNum: string;
  x: number;
  y: number;
  opX: number | null;
  opY: number | null;
  fpX: number | null;
  fpY: number | null;
  surveyNo: string;
  finalPlot: string;
  oldSurveyNo: string;
  district: string;
  taluka: string;
  tenure: string;
  naStatus: string;
  fpRoad: string;
  zone: string;
  permittedUses: string;
  statutoryTable: string;
  legalStatus: string;
  roadWidthM: number;
  roadWidthFt: string;
  roadClass: string;
  accessNote: string;
  areaSqM: number;
  areaSqYd: number;
  maxFAR: number;
  chargeableFAR: number;
  maxHeightM: number | string;
  heightDesc: string;
  groundCoveragePct: number | string;
  footprintSqM: number | null;
  setbacks: string;
  maxBuildingLength: string;
  price: string;
  /** Numeric per-square-yard rate, when the dealer entered one. */
  pricePerSqYd: number | null;
  /** RERA / agent registration id for the contact block. */
  reraId: string;
  /** Dealer-authored USP bullets shown on the highlights page. */
  highlights: string[];
  /** Named nearby landmarks with their distance, for the connectivity table. */
  landmarks: { name: string; distance: string }[];
  facing: string;
  description: string;
  jantriRatePerSqM: number | null;
  allottedFromSurvey: string;
  lat: number | null;
  lng: number | null;
  verifyUrl: string;
}

export interface DossierDocItem {
  id: string;
  name: string;
  type: string;
  typeLabel: string;
  size: number;
  uploadedAt: number;
  notes?: string;
  dataUrl: string;
  fileType: string;
}

export interface DossierOptions {
  templateId: string;
  pageSize: DossierPageSizeId;
  quality: DossierQuality;
  includeMarketing: boolean;
  includeDgdcr: boolean;
  includeDocuments: boolean;
  includeImages: boolean;
  includeClosing: boolean;
}

export interface DossierSnapshot {
  view: DossierMapView;
  label: string;
  dataUrl: string;
  width: number;
  height: number;
}

export interface DossierBuildResult {
  filename: string;
  blob: Blob;
  bytes: number;
  pageCount: number;
  pageSize: [number, number];
  warnings: string[];
  snapshots: DossierSnapshot[];
}

/**
 * Per-user branding applied to generated dossiers. Saved once from Settings,
 * then drawn on the cover, the closing page, and the footer of every page.
 */
export interface DossierBranding {
  userId: string;
  /** Square-ish logo as a data URL (PNG/JPEG). */
  logoDataUrl: string | null;
  name: string;
  phone: string;
  email: string;
  company: string;
  /** Optional one-line tagline shown under the name on the closing page. */
  tagline: string;
  updatedAt: number;
}

/* ------------------------- editable content plan -------------------------
 * The dealer reviews every generated page before the PDF is built: each table
 * row can be edited or dropped, every checklist item can be ticked, and the
 * highlight bullets can be rewritten. Renderers read the plan back, so what
 * the dealer edits is exactly what renders. */

/** One row of a two-column detail table. */
export interface PlanRow {
  id: string;
  label: string;
  value: string;
  /** Drawn as a vector checkmark beside the value (e.g. "verified"). */
  checked?: boolean;
  /** Unticked rows are dropped from the page but kept in the plan. */
  included: boolean;
}

/** One item of the documents / legal checklist. */
export interface PlanCheck {
  id: string;
  label: string;
  detail: string;
  checked: boolean;
}

export interface PagePlan {
  rows: PlanRow[];
  checks: PlanCheck[];
  /** Highlight bullets (value carries the text; label is unused). */
  bullets: PlanRow[];
}

/** Keyed by DossierPageRole — only roles the engine generates are present. */
export type ContentPlan = Record<string, PagePlan>;
