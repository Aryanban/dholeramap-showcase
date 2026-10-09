/**
 * Known developer template definitions & flagship generated decks.
 *
 * Each template has its own unique visual identity, theme colors, card architecture,
 * and typographic hierarchy. All 4 flagship templates are fully generated vector decks:
 * they load instantaneously, have zero dependencies on external raster PDFs, and contain
 * ZERO third-party branding (only DholeraMap or dealer white-label).
 *
 * Each template follows the presentation narrative structure:
 * Educates the buyer/investor on "What is Dholera SIR" (macro scale, 920 sq km,
 * DSIRDA authority, expressway/airport connectivity, Tata Semiconductor Fab, TP 1-6 reconstitution)
 * BEFORE diving into parcel-specific cadastre and due diligence.
 */

import type { DossierTemplateDefinition, DossierSourcePage } from './types';

export const HEBATPUR_TEMPLATE_ID = 'hebatpur-industrial-v1';
export const PALM_TEMPLATE_ID = 'palm-greens-residential-v1';
export const INVESTOR_TEMPLATE_ID = 'investor-executive-v1';
export const PREMIUM_TEMPLATE_ID = 'dholeramap-premium-v1';

/**
 * Developer template decks bundled with the site.
 * Fully generated decks have generated: true and url: '', loading instantly.
 */
export interface BuiltinTemplate {
  storageId: string;
  name: string;
  blurb: string;
  url: string;
  definitionId: string;
  premium?: boolean;
  generated?: boolean;
}

export const BUILTIN_TEMPLATES: BuiltinTemplate[] = [
  {
    storageId: 'builtin-template-1',
    name: 'Industrial Masterclass · CAD Blueprint',
    blurb: '15-page precision CAD engineering deck in royal burgundy & steel with macro Dholera intelligence & cadastre.',
    url: '',
    definitionId: HEBATPUR_TEMPLATE_ID,
    generated: true,
  },
  {
    storageId: 'builtin-palm',
    name: 'Eco Sanctuary · Residential Villa Deck',
    blurb: '15-page architectural eco-township deck in forest jade & emerald with green infrastructure & connectivity.',
    url: '',
    definitionId: PALM_TEMPLATE_ID,
    generated: true,
  },
  {
    storageId: 'builtin-investor-executive',
    name: 'Investor Executive · Institutional Memorandum',
    blurb: '15-page Wall Street institutional memorandum in obsidian navy & bullion gold with macro catalysts & live QR verification.',
    url: '',
    definitionId: INVESTOR_TEMPLATE_ID,
    generated: true,
  },
  {
    storageId: 'builtin-premium',
    name: 'Aurum Signature · Sovereign Gold Luxury',
    blurb: '15-page ultra-high-net-worth private client presentation in warm alabaster & sovereign gold with double hairline frames.',
    url: '',
    definitionId: PREMIUM_TEMPLATE_ID,
    generated: true,
    premium: true,
  },
];

/** Standard 15-page narrative sequence for all generated templates */
const STANDARD_15_PAGES: DossierSourcePage[] = [
  { sourceIndex: -1, role: 'cover', mode: 'generate', label: '1. Cover & Parcel Identity', includeByDefault: true },
  { sourceIndex: -1, role: 'executive-summary', mode: 'generate', label: '2. Executive Summary & Scorecard', includeByDefault: true },
  { sourceIndex: -1, role: 'property-details', mode: 'generate', label: '3. Property Specifications', includeByDefault: true },
  { sourceIndex: -1, role: 'land-details', mode: 'generate', label: '4. Land Registry & Statutory Title', includeByDefault: true },
  { sourceIndex: -1, role: 'tp-location', mode: 'generate', label: '5. TP Scheme Georeferenced Atlas', includeByDefault: true },
  { sourceIndex: -1, role: 'zoning', mode: 'generate', label: '6. Zoning & DGDCR Permissibility', includeByDefault: true },
  { sourceIndex: -1, role: 'op-fp', mode: 'generate', label: '7. Cadastral OP vs FP Reconstitution', includeByDefault: true },
  { sourceIndex: -1, role: 'parcel-zooms', mode: 'generate', label: '8. Micro-Cadastral Zoom Grid', includeByDefault: true },
  { sourceIndex: -1, role: 'about-dholera', mode: 'generate', label: '9. What is Dholera SIR? (Macro Scale)', includeByDefault: true },
  { sourceIndex: -1, role: 'connectivity', mode: 'generate', label: '10. Strategic Connectivity Corridors', includeByDefault: true },
  { sourceIndex: -1, role: 'mega-projects', mode: 'generate', label: '11. Mega Catalysts & Tata Fab', includeByDefault: true },
  { sourceIndex: -1, role: 'tp-scheme-planning', mode: 'generate', label: '12. TP Scheme & Reconstitution', includeByDefault: true },
  { sourceIndex: -1, role: 'dgdcr', mode: 'generate', label: '13. DGDCR Regulatory Schedule', includeByDefault: true },
  { sourceIndex: -1, role: 'documents', mode: 'generate', label: '14. Statutory Due Diligence Checklist', includeByDefault: true },
  { sourceIndex: -1, role: 'closing', mode: 'generate', label: '15. Transaction Sign-Off & Live QR', includeByDefault: true },
  { sourceIndex: -1, role: 'images', mode: 'generate', label: 'Site photos (if attached)', includeByDefault: false },
];

/**
 * Fallback definition for custom uploaded developer PDFs.
 */
export function buildGenericDefinition(
  name: string,
  pageCount: number,
  width: number,
  height: number
): DossierTemplateDefinition {
  return {
    id: `custom-${Date.now().toString(36)}`,
    name,
    developer: 'Developer-supplied template',
    fingerprint: { sha256: '', pages: pageCount, width, height },
    pageSize: [width, height],
    theme: {
      primary: '#1e3a5f',
      primaryDark: '#0f2237',
      accent: '#c9a227',
      banner: '#f2c230',
      ink: '#1c2430',
      muted: '#5d6774',
      paper: '#ffffff',
      panel: '#eef2f7',
    },
    footerNote: 'Client dossier · verify measurements against statutory records before transacting.',
    pages: [
      { sourceIndex: -1, role: 'cover', mode: 'generate', label: 'Cover', includeByDefault: true },
      { sourceIndex: -1, role: 'property-details', mode: 'generate', label: 'Property details', includeByDefault: true },
      { sourceIndex: -1, role: 'tp-location', mode: 'generate', label: 'TP location', includeByDefault: true },
      { sourceIndex: -1, role: 'zoning', mode: 'generate', label: 'Zoning', includeByDefault: true },
      { sourceIndex: -1, role: 'op-fp', mode: 'generate', label: 'O.P / F.P snapshots', includeByDefault: true },
      { sourceIndex: -1, role: 'parcel-zooms', mode: 'generate', label: 'Parcel zooms', includeByDefault: true },
      ...Array.from({ length: pageCount }, (_, i) => ({
        sourceIndex: i,
        role: 'marketing' as const,
        mode: 'copy' as const,
        label: `Source page ${i + 1}`,
        includeByDefault: true,
      })),
    ],
  };
}

export const KNOWN_TEMPLATES: DossierTemplateDefinition[] = [
  // ─── 1. HEBATPUR INDUSTRIAL MASTERCLASS ──────────────────────────────────
  {
    id: HEBATPUR_TEMPLATE_ID,
    name: 'Industrial Masterclass · CAD Blueprint',
    developer: 'DholeraMap Engineering Design',
    project: 'Dholera SIR Industrial & Logistics Corridor Masterclass',
    fingerprint: { sha256: '', pages: 0, width: 0, height: 0 },
    pageSize: [960, 540],
    theme: {
      primary: '#0f172a',
      primaryDark: '#090d16',
      accent: '#d97706',
      banner: '#b45309',
      ink: '#0f172a',
      muted: '#64748b',
      paper: '#ffffff',
      panel: '#f8fafc',
    },
    footerNote: 'Industrial Masterclass dossier · georeferenced from DSIRDA statutory data.',
    pages: STANDARD_15_PAGES,
  },

  // ─── 2. ECO SANCTUARY RESIDENTIAL VILLA DECK ─────────────────────────────
  {
    id: PALM_TEMPLATE_ID,
    name: 'Eco Sanctuary · Residential Villa Deck',
    developer: 'DholeraMap Urban Design',
    project: 'Dholera SIR Eco Sanctuary & Residential Township Masterplan',
    fingerprint: { sha256: '', pages: 0, width: 0, height: 0 },
    pageSize: [960, 540],
    theme: {
      primary: '#14342b',
      primaryDark: '#0d231d',
      accent: '#2d6a4f',
      banner: '#40916c',
      ink: '#14342b',
      muted: '#5c7c6f',
      paper: '#ffffff',
      panel: '#f7fbf9',
    },
    footerNote: 'Eco Sanctuary residential dossier · georeferenced from DSIRDA statutory data.',
    pages: STANDARD_15_PAGES,
  },

  // ─── 3. INVESTOR EXECUTIVE INSTITUTIONAL MEMORANDUM ──────────────────────
  {
    id: INVESTOR_TEMPLATE_ID,
    name: 'Investor Executive · Midnight Navy',
    developer: 'DholeraMap Capital Markets',
    project: 'Institutional Investment Memorandum & Cadastral Diligence',
    fingerprint: { sha256: '', pages: 0, width: 0, height: 0 },
    pageSize: [960, 540],
    theme: {
      primary: '#0a192f',
      primaryDark: '#06101e',
      accent: '#b45309',
      banner: '#d97706',
      ink: '#0a192f',
      muted: '#64748b',
      paper: '#ffffff',
      panel: '#f8fafc',
    },
    footerNote: 'Generated by DholeraMap PlotBook · verify every figure at dholeramap.com',
    pages: STANDARD_15_PAGES,
  },

  // ─── 4. AURUM SIGNATURE SOVEREIGN GOLD LUXURY ────────────────────────────
  {
    id: PREMIUM_TEMPLATE_ID,
    name: 'Aurum Signature · Sovereign Gold Luxury',
    developer: 'DholeraMap Private Client Desk',
    project: 'Sovereign Wealth Family Office Presentation & Cadastral Portfolio',
    fingerprint: { sha256: '', pages: 0, width: 0, height: 0 },
    pageSize: [960, 540],
    theme: {
      primary: '#18181b',
      primaryDark: '#09090b',
      accent: '#c5a059',
      banner: '#d4af37',
      ink: '#18181b',
      muted: '#71717a',
      paper: '#fafaf9',
      panel: '#f5f5f4',
    },
    footerNote: 'Generated by DholeraMap PlotBook Premium · verify every figure at dholeramap.com',
    pages: STANDARD_15_PAGES,
  },
];

export function findKnownTemplate(sha256: string, pages: number, width: number, height: number) {
  return (
    KNOWN_TEMPLATES.find(
      (t) =>
        t.fingerprint.sha256 === sha256 &&
        t.fingerprint.pages === pages &&
        Math.abs(t.fingerprint.width - width) < 1 &&
        Math.abs(t.fingerprint.height - height) < 1
    ) || null
  );
}

/** Definition for a fully-generated deck (no source PDF to fingerprint). */
export function findGeneratedTemplate(id: string): DossierTemplateDefinition | null {
  return KNOWN_TEMPLATES.find((t) => t.id === id && t.fingerprint.sha256 === '') || null;
}

function digits(v: string): string {
  return (v || '').replace(/[^0-9]/g, '');
}

/** True when the dossier parcel is the template's worked example — source pages can be reused verbatim. */
export function matchesExemplar(
  exemplar: { village: string; surveyNo: string; finalPlot: string; tp: string } | undefined,
  parcel: { village: string; surveyNo: string; finalPlot: string; tpShort: string }
): boolean {
  if (!exemplar) return false;
  if (digits(exemplar.surveyNo) !== digits(parcel.surveyNo)) return false;
  if (digits(exemplar.finalPlot) !== digits(parcel.finalPlot)) return false;
  if (digits(exemplar.tp) !== digits(parcel.tpShort)) return false;
  if (exemplar.village && exemplar.village.trim().toLowerCase() !== (parcel.village || '').trim().toLowerCase()) {
    return false;
  }
  return true;
}
