/**
 * Editable content plan.
 *
 * Before the PDF is built the dealer reviews every generated page: table rows
 * can be corrected or dropped, checklist items ticked, highlight bullets
 * rewritten. This module derives the plan from the same resolved parcel data
 * the renderers use, so the editable rows are exactly what would render — and
 * the renderers read the edited plan back (see RenderCtx.plan).
 */

import type { ContentPlan, DossierDocItem, DossierParcel, DossierPageRole, PlanCheck, PlanRow } from './types';

let seq = 0;
function rowId(prefix: string): string {
  seq += 1;
  return `${prefix}-${seq.toString(36)}`;
}

function r(prefix: string, label: string, value: string, checked = false): PlanRow {
  return { id: rowId(prefix), label, value, checked, included: true };
}

function empty(): { rows: PlanRow[]; checks: PlanCheck[]; bullets: PlanRow[] } {
  return { rows: [], checks: [], bullets: [] };
}

/**
 * Roles whose content the dealer can edit for a given template + option set.
 * Only pages the engine actually generates are included — copied developer
 * artwork is not editable, and system pages (DGDCR / documents / closing) are
 * listed only when their output toggle is on.
 */
export function editableRoles(
  definition: { pages: { role: DossierPageRole; mode: string }[] },
  options: { includeDgdcr: boolean; includeDocuments: boolean; includeImages: boolean; includeClosing: boolean }
): DossierPageRole[] {
  const fromPlan = definition.pages
    .filter((p) => p.mode === 'generate' || p.mode === 'exemplar-copy')
    .map((p) => p.role);
  const roles = new Set<DossierPageRole>(fromPlan as DossierPageRole[]);
  if (options.includeDgdcr) roles.add('dgdcr');
  if (options.includeDocuments) roles.add('documents');
  if (options.includeImages) roles.add('images');
  if (options.includeClosing) roles.add('closing');
  return Array.from(roles);
}

export function buildContentPlan(parcel: DossierParcel, docs: DossierDocItem[] = []): ContentPlan {
  const safeDocs = Array.isArray(docs) ? docs : [];
  const plan: ContentPlan = {};

  // 1. Cover
  plan['cover'] = empty();
  plan['cover'].rows = [
    r('cv', 'Title Headline', `${parcel.village.toUpperCase()} — ${parcel.surveyNo}`),
    r('cv', 'Subtitle', `Sanctioned Town Planning Scheme ${parcel.tpShort}`),
    r('cv', 'Zoning Classification', (parcel.zone || 'Industrial').toUpperCase().split('—')[0].trim()),
    r('cv', 'TP Scheme Code', parcel.tpShort),
    r('cv', 'Revenue Survey No.', parcel.surveyNo),
    r('cv', 'Final Plot (FP)', parcel.finalPlot),
    r('cv', 'Plot Area (Sq.Yards)', parcel.areaSqYd ? `${parcel.areaSqYd.toLocaleString('en-IN')} sq.yd` : '—'),
  ];

  // 2. Executive Summary
  plan['executive-summary'] = empty();
  plan['executive-summary'].rows = [
    r('es', 'District & Taluka', `${parcel.district} / ${parcel.taluka}`),
    r('es', 'Revenue Village', parcel.village),
    r('es', 'Town Planning Scheme', parcel.tpShort),
    r('es', 'Revenue Survey No.', parcel.surveyNo, true),
    r('es', 'Final Plot (FP) No.', parcel.finalPlot, true),
    r('es', 'Statutory Plot Area', `${parcel.areaSqYd ? parcel.areaSqYd.toLocaleString('en-IN') : '—'} sq.yd (${parcel.areaSqM ? parcel.areaSqM.toLocaleString('en-IN') : '—'} sq.m)`, true),
    r('es', 'Road Frontage Access', `${parcel.roadWidthM} Meters (${parcel.roadClass || 'TP Corridor'})`),
    r('es', 'Land Tenure Category', parcel.tenure || 'Title Clear Freehold'),
    r('es', 'NA Sanction Status', parcel.naStatus || 'Non-Agricultural Order Sanctioned'),
    r('es', 'Base / Max FAR', `${parcel.maxFAR} (Chargeable: ${parcel.chargeableFAR})`),
    r('es', 'Asking Valuation', parcel.price || 'Market Rate Upon Diligence'),
    r('es', 'Rate per Sq. Yard', parcel.pricePerSqYd ? `₹${parcel.pricePerSqYd.toLocaleString('en-IN')} / sq.yd` : '—'),
  ];
  plan['executive-summary'].bullets = [
    r('esb', 'Anchor Catalyst', 'Direct economic spillover from Tata Electronics Rs. 91,000 Cr chip fabrication foundry in TP 1.'),
    r('esb', 'Expressway & Airport', 'High-velocity logistics via 109 km 4-lane access-controlled Expressway and Dholera International Airport.'),
    r('esb', 'Statutory Reconstitution', '100% boundary regularisation under Gujarat Town Planning Act 1976 with state-guaranteed clear freehold title.'),
    r('esb', 'Underground Infrastructure', 'Pre-installed plug-and-play utilities: SCADA water, 66kV power feed, and fiber optic ducts.'),
    r('esb', 'Capital Appreciation', 'Compound land valuation growth backed by DSIRDA statutory infrastructure milestones.'),
  ];

  // 3. Property Details
  plan['property-details'] = empty();
  plan['property-details'].rows = [
    r('pd', 'District', parcel.district),
    r('pd', 'Taluka', parcel.taluka),
    r('pd', 'Village', parcel.village),
    r('pd', 'Tenure', parcel.tenure ? `${parcel.tenure}${parcel.naStatus ? ` (${parcel.naStatus})` : ''}` : '—'),
    r('pd', 'Zoning', parcel.zone.split('—')[0].trim() || '—'),
    r('pd', 'T.P.', parcel.tpShort),
    r('pd', 'F.P. Road', parcel.fpRoad),
    r('pd', 'Survey No.', parcel.surveyNo, true),
    r('pd', 'Final Plot No.', parcel.finalPlot, true),
    r('pd', 'F.P. Sq. Yrds.', parcel.areaSqYd ? parcel.areaSqYd.toLocaleString('en-IN') : '—', true),
    r('pd', 'Asking Price', parcel.price || 'On request'),
    r('pd', 'Rate', parcel.pricePerSqYd ? `₹${parcel.pricePerSqYd.toLocaleString('en-IN')} / sq. yd` : '—'),
    r('pd', 'Facing', parcel.facing || '—'),
  ];
  plan['property-details'].checks = [
    'Paper Notice',
    'Title Clear Certificate',
    'Certified Entries',
    'Zoning Certificate',
    'Development Plan',
    'Town Planning',
    'Non Agriculture (N.A.)',
    'Registry',
    '7/12 Entry (Mutation)',
  ].map((l) => ({ id: rowId('pc'), label: l, detail: '', checked: true }));
  plan['property-details'].bullets = (parcel.highlights?.length
    ? parcel.highlights.filter((b) => b.trim())
    : defaultHighlights(parcel)
  ).map((b) => r('hb', 'Highlight', b));

  // 4. Land Details
  plan['land-details'] = empty();
  plan['land-details'].rows = [
    r('ld', 'VILLAGE NAME', parcel.village.toUpperCase()),
    r('ld', 'NEW SURVEY NO.', parcel.surveyNo, true),
    r('ld', 'FP NO.', parcel.finalPlot, true),
    r('ld', 'TP', parcel.tpShort),
    r('ld', 'ZONING', parcel.zone.split('—')[0].trim() || '—'),
    r('ld', 'AREA', parcel.areaSqYd ? `${parcel.areaSqYd.toLocaleString('en-IN')} Sq. Yards` : '—'),
    r('ld', 'ROAD', parcel.fpRoad),
    r('ld', 'OLD SURVEY NO.', parcel.oldSurveyNo || '—'),
    r('ld', 'TENURE', parcel.tenure || '—'),
    r('ld', 'LEGAL STATUS', parcel.legalStatus || '—'),
  ];
  plan['land-details'].checks = [
    { id: rowId('lc'), label: parcel.tenure || 'TITLE CLEAR LAND', detail: 'Tenure badge on the land page', checked: true },
    { id: rowId('lc'), label: parcel.naStatus || 'Free Hold Registry', detail: 'Status badge on the land page', checked: true },
  ];

  // 5. TP Location & Landmarks
  plan['tp-location'] = empty();
  plan['tp-location'].rows = [
    r('tl', 'TP Scheme Area', `Town Planning Scheme ${parcel.tpShort}`),
    r('tl', 'Sub-Sector Corridor', parcel.subSector || 'Activation Core'),
    r('tl', 'Frontage Road Width', `${parcel.roadWidthM} Meters (${parcel.roadWidthFt})`),
    r('tl', 'Cadastral Authenticity', 'Verified against Gujarat AnyRoR & DSIRDA Registry'),
  ];
  plan['tp-location'].bullets = (parcel.landmarks?.length
    ? parcel.landmarks.map((l) => `${l.name} — ${l.distance}`)
    : defaultLandmarkBullets()
  ).map((b) => r('tlb', 'Corridor Link', b));

  // 6. Zoning & Permissibility
  plan['zoning'] = empty();
  plan['zoning'].rows = [
    r('zn', 'New Survey No.', parcel.surveyNo),
    r('zn', 'Final Plot', parcel.finalPlot),
    r('zn', 'Sq. Yards.', parcel.areaSqYd ? parcel.areaSqYd.toLocaleString('en-IN') : '—'),
    r('zn', 'Land use zone', parcel.zone || '—'),
    r('zn', 'Permitted uses', (parcel.permittedUses || '—').slice(0, 160)),
    r('zn', 'Road frontage', `${parcel.roadWidthM} m (${parcel.roadWidthFt} ft) · ${parcel.roadClass}`),
    r('zn', 'Access', parcel.accessNote),
  ];

  // 7. OP vs FP Reconstitution
  plan['op-fp'] = empty();
  plan['op-fp'].rows = [
    r('of', 'Original Plot (OP) Survey No.', parcel.surveyNo),
    r('of', 'Reconstituted Final Plot (FP)', parcel.finalPlot),
    r('of', 'Statutory 50% Deduction', 'Standard 50% Town Planning infrastructure deduction applied'),
    r('of', 'Net Retained Area', `${parcel.areaSqYd ? parcel.areaSqYd.toLocaleString('en-IN') : '—'} sq.yd (${parcel.areaSqM ? parcel.areaSqM.toLocaleString('en-IN') : '—'} sq.m)`),
    r('of', 'Frontage Corridor Class', parcel.fpRoad || `${parcel.roadWidthM}m TP Road`),
    r('of', 'Statutory Authority', 'DSIRDA / GTPUD Act 1976 Section 50 Sanction'),
  ];

  // 8. Micro-Cadastral Zoom Grid
  plan['parcel-zooms'] = empty();
  plan['parcel-zooms'].rows = [
    r('pz', 'Cadastral Demarcation Standard', '1:500 Georeferenced Survey Vector'),
    r('pz', 'Statutory Revenue Village', parcel.village),
    r('pz', 'Revenue Survey Identity', parcel.surveyNo),
    r('pz', 'Town Planning Allotment', `FP ${parcel.finalPlot} in TP ${parcel.tpShort}`),
    r('pz', 'Frontage Alignment', parcel.fpRoad || `${parcel.roadWidthM}m Corridor`),
    r('pz', 'Title State Guarantee', 'Statutory Form 4/5 Final Plot Ownership Regularisation'),
  ];

  // 9. About Dholera SIR (Macro Scale)
  plan['about-dholera'] = empty();
  plan['about-dholera'].rows = [
    r('ad', 'Total Planned Area', '920 sq. km (91,970 Hectares · 2X Mumbai Scale)'),
    r('ad', 'Developable Footprint', '422 sq. km across TP Schemes 1 through 6'),
    r('ad', 'Special Investment Region', 'Notified under Gujarat SIR Act 2009'),
    r('ad', 'Special Purpose Vehicle (SPV)', 'Dholera Industrial City Development Ltd (51% GoG : 49% NICDC)'),
    r('ad', 'Greenfield Certification', "India's 1st Platinum-Rated Greenfield Smart City (IGBC)"),
    r('ad', 'Central Command Hub', 'ABCD Building: 17-Acre SCADA & Integrated Command Centre'),
  ];
  plan['about-dholera'].bullets = [
    r('adb', 'Vision Scale', 'AECOM-designed master plan larger than Singapore and Bahrain.'),
    r('adb', 'Smart City Trunk', '100% pre-installed underground utility corridors with zero open drainage.'),
    r('adb', 'Global Capital Inflow', 'Over Rs. 100,000 Crore committed public-private infrastructure investment.'),
  ];

  // 10. Strategic Connectivity Corridors
  plan['connectivity'] = empty();
  plan['connectivity'].rows = [
    r('cn', 'Ahmedabad-Dholera Expressway', '109 km · 4-Lane Access-Controlled · 45 Min Travel Time'),
    r('cn', 'Dholera International Airport (DIACL)', '4,000m Runway · 4E/4F Cargo & Passenger Hub · Operational 2026'),
    r('cn', 'Dedicated Freight Corridor (Western DFC)', 'Bhimnath Freight Junction Link · Direct High-Speed Rail to JNPT Mumbai'),
    r('cn', 'Mass Rapid Transit System (MRTS)', 'High-Speed Regional Commuter Rail Connecting GIFT City & Ahmedabad'),
    r('cn', 'Bhavnagar-Pipavav Port Highway', 'Direct Heavy Industrial Port Access via Sanctioned Coastal Arterial'),
  ];
  plan['connectivity'].bullets = [
    r('cnb', 'Expressway Progress', 'NHAI package under advanced execution, directly reducing transit to SG Highway Ahmedabad to 45 mins.'),
    r('cnb', 'Airport Cargo Hub', 'Multi-modal air logistics with international customs clearance and export-import facilities.'),
  ];

  // 11. Mega Projects & Catalysts
  plan['mega-projects'] = empty();
  plan['mega-projects'].rows = [
    r('mp', 'Tata Semiconductor Fabrication Facility', 'Rs. 91,000 Cr ($11B) Capex · 50,000 Wafers/Month with PSMC Taiwan'),
    r('mp', 'Dholera Ultra-Mega Solar Park', "5,000 MW Capacity · Rs. 25,000 Cr · South Asia's Largest Clean Energy Hub"),
    r('mp', 'Administrative Central Hub (ABCD)', '17-Acre SCADA Command Centre · Tier-IV Datacenter & IBM Smart Grid'),
    r('mp', 'Torrent Power Substation Grid', 'Dedicated 400kV / 220kV High-Reliability Substation Transmission'),
  ];
  plan['mega-projects'].bullets = [
    r('mpb', 'Semiconductor Cluster', 'High-purity industrial supply chain anchors semiconductor assembly and testing units.'),
    r('mpb', 'Industrial Green Energy', 'Direct green power transmission tariff discounts under Gujarat Green Energy Policy.'),
  ];

  // 12. TP Scheme & Reconstitution
  plan['tp-scheme-planning'] = empty();
  plan['tp-scheme-planning'].rows = [
    r('tp', 'Statutory Urban Planning Act', 'Gujarat Town Planning & Urban Development (GTPUD) Act 1976'),
    r('tp', 'Sanctioned Phase 1 TP Schemes', 'TP 1 & TP 2 (150+ sq. km Priority Development Core)'),
    r('tp', '50% Land Reconstitution Model', 'Equitable 50% public infra deduction with 100% net title reconstitution'),
    r('tp', 'Social Infrastructure Allocation', 'Land reserved for parks, wide arterial roads, schools, hospitals & utilities'),
    r('tp', 'Allotment Certainty', 'Form 4/5 statutory title allotment with direct state-sanctioned ownership'),
  ];
  plan['tp-scheme-planning'].bullets = [
    r('tpb', 'Three-Stage Town Planning', 'Draft Scheme -> Preliminary Sanction -> Final Sanction with full state backing.'),
    r('tpb', 'Guaranteed Freehold Title', 'No agricultural conversion disputes; final plots carry statutory freehold status.'),
  ];

  // 13. DGDCR Policy
  plan['dgdcr'] = empty();
  plan['dgdcr'].rows = [
    r('dg', 'Village / TP', `${parcel.village} · ${parcel.tpShort}${parcel.subSector ? ` · ${parcel.subSector}` : ''}`),
    r('dg', 'Survey / Final Plot', `Survey ${parcel.surveyNo} · FP ${parcel.finalPlot}`),
    r('dg', 'Land use zone', parcel.zone || '—'),
    r('dg', 'Permitted uses', (parcel.permittedUses || '—').slice(0, 160)),
    r('dg', 'Road frontage', `${parcel.roadWidthM} m (${parcel.roadWidthFt} ft) · ${parcel.roadClass}`),
    r('dg', 'Access', parcel.accessNote),
    r('dg', 'Max FAR / chargeable', `${parcel.maxFAR} / ${parcel.chargeableFAR}`),
    r('dg', 'Max height', parcel.heightDesc || String(parcel.maxHeightM || '—')),
    r('dg', 'Ground coverage', `${parcel.groundCoveragePct || '—'}${parcel.footprintSqM ? ` · ${parcel.footprintSqM.toLocaleString('en-IN')} sq.m footprint` : ''}`),
    r('dg', 'Setbacks', parcel.setbacks || '—'),
    r('dg', 'Max building length', parcel.maxBuildingLength),
    r('dg', 'Plot area', parcel.areaSqM ? `${parcel.areaSqM.toLocaleString('en-IN')} sq.m (${parcel.areaSqYd.toLocaleString('en-IN')} sq.yd)` : '—'),
    r('dg', 'Jantri rate', parcel.jantriRatePerSqM ? `₹${parcel.jantriRatePerSqM.toLocaleString('en-IN')} / sq. m` : '—'),
  ];

  // 14. Documents Checklist
  plan['documents'] = empty();
  plan['documents'].checks = safeDocs.slice(0, 12).map((d) => ({
    id: rowId('dc'),
    label: `${d.typeLabel} — ${d.name}`,
    detail: `${new Date(d.uploadedAt).toLocaleDateString('en-IN')} · ${(d.size / 1024).toFixed(0)} KB${d.notes ? ` · ${d.notes}` : ''}`,
    checked: true,
  }));

  // 15. Closing & Verification
  plan['closing'] = empty();
  plan['closing'].rows = [
    r('cl', 'Advisory Partner', parcel.title || 'Dholera Land Advisory Network'),
    r('cl', 'Direct Portal Verification', parcel.verifyUrl || 'https://dholeramap.com'),
    r('cl', 'Gujarat RERA Registration', parcel.reraId || 'Verified Real Estate Agent'),
    r('cl', 'Statutory Disclaimer', 'Due diligence advisory dossier prepared for institutional evaluation.'),
    r('cl', 'Digital Signature Stamp', 'Statutorily Verified via DholeraMap Georeferenced Cadastre'),
  ];

  return plan;
}

function article(word: string | number): 'a' | 'an' {
  // Use "an" when the spoken form starts with a vowel sound.
  // Relevant TP road widths: 18 m → "eighteen" (vowel), 30/55/70 → consonant.
  const s = String(word);
  return /^(8|11|18|80|81|82|83|84|85|86|87|88|89)/.test(s) ? 'an' : 'a';
}

function defaultHighlights(parcel: DossierParcel): string[] {
  return [
    `Direct frontage on ${article(parcel.roadWidthM)} ${parcel.roadWidthM} m Town Planning road`,
    `Max permissible FAR ${parcel.maxFAR} under ${parcel.statutoryTable || 'DGDCR 2024'}`,
    `Reconstituted Final Plot ${parcel.finalPlot} in a sanctioned TP scheme`,
  ];
}

function defaultLandmarkBullets(): string[] {
  return [
    'Tata Electronics Semiconductor Fab — 1.8 km',
    'Ahmedabad-Dholera Expressway Interchange — 3.2 km',
    'ABCD Administrative Center — 4.5 km',
    'Dholera International Airport (DIACL) — 14.0 km',
    'Bhimnath Railway Freight Junction — 8.5 km',
  ];
}

function defaultLandmarks(parcel: DossierParcel): { name: string; distance: string }[] {
  const out: { name: string; distance: string }[] = [];
  if (parcel.subSector) out.push({ name: `${parcel.subSector} sector`, 'distance': 'Within the TP scheme' });
  out.push({ name: 'TP road frontage', distance: `${parcel.roadWidthM} m` });
  return out;
}

/** Rows of a plan page as [label, value, checked] tuples, unticked dropped. */
export function planRows(plan: ContentPlan | undefined, role: string, fallback: [string, string, boolean?][]): [string, string, boolean?][] {
  const page = plan?.[role];
  if (!page || !page.rows.length) return fallback;
  return page.rows.filter((r) => r.included).map((r) => [r.label, r.value, r.checked]);
}

/** Checked items of a plan page; falls back to the given list when empty. */
export function planChecks(
  plan: ContentPlan | undefined,
  role: string,
  fallback: { label: string; detail: string }[]
): { label: string; detail: string }[] {
  const page = plan?.[role];
  if (!page || !page.checks.length) return fallback;
  return page.checks.filter((c) => c.checked).map((c) => ({ label: c.label, detail: c.detail }));
}

/** Highlight bullets for a page, falling back to the parcel's own list. */
export function planBullets(plan: ContentPlan | undefined, role: string, fallback: string[]): string[] {
  const page = plan?.[role];
  if (!page || !page.bullets.length) return fallback;
  return page.bullets.filter((r) => r.included && r.value.trim()).map((r) => r.value);
}
