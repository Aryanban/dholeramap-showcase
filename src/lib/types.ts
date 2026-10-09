/** Core types for DholeraMap Cadastral Atlas */

export interface PlanSheet {
  sid: string;
  folder: string;
  file: string;
  sector: string;
  pocketId: string;
  kind: 'overview' | 'pocket';
  label: string;
  schemeId: string;
  description: string;
  width: number;
  height: number;
  url: string;
}

export interface SheetGroup {
  name: string;
  sectors: string[];
}

export interface SheetsManifest {
  source: string;
  version: number;
  totalSheets?: number;
  groups: SheetGroup[];
  sectors: Record<string, string[]>;
  sheets: Record<string, PlanSheet>;
  zoneOverview?: PlanSheet;
}

export interface CadastralSurveyPoint {
  id: string;
  type?: string;
  displayLabel?: string;
  surveyNo: string;
  finalPlot: string;
  schemeId: string;
  schemeName: string;
  village: string;
  cadastralX: number;
  cadastralY: number;
  lat: number;
  lng: number;
  zone: string;
  zoneCode: string;
  roadWidthM: number;
  maxFAR: number;
  maxHeightM: number;
  heightDesc?: string;
  groundCoveragePct: number;
  setbacks?: string;
  permittedUses?: string;
  statutoryTable?: string;
  allottedFromSurvey?: string;
  allottedAreaSqM?: number;
  allottedAreaSqYd?: number;
  areaSqM?: number;
  jantriRatePerSqM?: number;
  legalStatus?: string;
  subSector?: string;
  /** true when FAR/height/coverage come from an asserted or fallback envelope
   * rather than a road-width-derived, verified DGDCR table (docs/04 §A.3) */
  isEstimated?: boolean;
  dataSource?: 'statutory' | 'estimated';
}

export type Facing = 'north' | 'northeast' | 'east' | 'southeast' | 'south' | 'southwest' | 'west' | 'northwest' | 'park' | 'corner' | 'unknown';
export type DealIntent = 'selling' | 'buying' | 'watching' | '';
export type DealOutcome = 'available' | 'sold' | 'looking' | 'bought' | '';

export interface Bookmark {
  id: string;
  sid: string;
  label: string;
  x: number;
  y: number;
  surveyNo?: string;
  finalPlot?: string;
  village?: string;
  sector?: string;
  zone?: string;
  roadWidthM?: number;
  allottedAreaSqM?: number;
  allottedAreaSqYd?: number;
  areaSqM?: number;
  jantriRatePerSqM?: number;
  note?: string;
  plotNo?: string;
  customName?: string;
  price?: string;
  priceLakh?: number;
  district?: string;
  taluka?: string;
  tenure?: string;
  naStatus?: string;
  fpRoad?: string;
  oldSurveyNo?: string;
  intent?: DealIntent;
  outcome?: DealOutcome;
  outcomeAt?: number;
  facing?: Facing | string;
  description?: string;
  /** Numeric per-square-yard asking rate a dealer enters for investor decks. */
  pricePerSqYd?: number;
  /** RERA / agent registration id shown in the dossier contact block. */
  reraId?: string;
  /** Dealer-authored USP bullets for the dossier highlights page. */
  highlights?: string[];
  /** Named nearby landmarks with distance, for the connectivity table. */
  landmarks?: { name: string; distance: string }[];
  documentCount?: number;
  documentTypes?: string[];
  createdAt?: number;
}

export type AttachedDocType =
  | 'registry'
  | 'satbara'
  | 'allotment'
  | 'possession'
  | 'noc'
  | 'mutation'
  | 'sanction'
  | 'photo'
  | 'other';

export interface AttachedDoc {
  id: string;
  pinId: string;
  name: string;
  type: AttachedDocType;
  fileType: string;
  size: number;
  dataUrl: string;
  uploadedAt: number;
  notes?: string;
}

export type SubscriptionTier = 'free' | 'pro' | 'max';

export interface UserProfile {
  id: string;
  name: string;
  phone: string;
  email: string;
  company?: string;
  city?: string;
  role?: 'investor' | 'broker' | 'developer' | 'owner' | 'admin';
  unitPreference?: 'sqyd' | 'sqm';
  defaultScheme?: string;
  notificationsEnabled?: boolean;
  createdAt?: number;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'broadcast' | 'system' | 'deal' | 'update';
  timestamp: number;
  read: boolean;
  link?: string;
}

export interface UserFeedback {
  id: string;
  name: string;
  contact: string;
  category: 'bug' | 'data' | 'feature' | 'inquiry' | 'partnership';
  message: string;
  createdAt: number;
  status: 'new' | 'reviewed' | 'resolved';
}

export interface SearchHit {
  id: string;
  title: string;
  subtitle: string;
  type: 'scheme' | 'survey' | 'plot' | 'village' | 'bookmark';
  sid: string;
  x: number;
  y: number;
  subMapLabel?: string;
  isCurrentSheet?: boolean;
  surveyData?: CadastralSurveyPoint;
  hitCategory?: 'final_plot' | 'survey_number' | 'scheme_village';
  isOutsideTP?: boolean;
  plotNumber?: string;
  surveyNumber?: string;
  villageName?: string;
  tpSchemeName?: string;
  roadWidthM?: number;
  areaSqM?: number;
  zone?: string;
}

export interface SplitSearchResults {
  finalPlots: SearchHit[];
  surveyNumbers: SearchHit[];
  schemesAndVillages: SearchHit[];
  outsideTPSurveys: SearchHit[];
  totalCount: number;
}
