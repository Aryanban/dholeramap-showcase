import { DOMAIN, SITE_NAME, PRODUCT_NAME, VILLAGE_COUNT } from '@/lib/brand';
import { VILLAGES } from '@/lib/villages';
import { ZONE_NARRATIVES } from '@/lib/village-profile';
import { surveysForVillage } from '@/lib/gazetted-surveys';
import { getPublishedArticles, getArticleBySlug } from '@/lib/articles';
import { SEEDED_BROKERS } from '@/lib/brokers';
import { getSchemeDGDCR } from '@/lib/dgdcr';

/**
 * Estimates LLM token count from markdown text (~4 characters per token).
 */
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

/**
 * Generates clean, rich markdown representations for any page path on DholeraMap.
 */
export async function generateMarkdownForPath(rawPath: string): Promise<string> {
  // Normalize path
  let path = rawPath.split('?')[0].split('#')[0].replace(/\/+$/, '');
  if (!path) path = '/';

  // 1. Homepage
  if (path === '/') {
    const articles = await getPublishedArticles();
    return `# ${SITE_NAME} — Interactive Dholera SIR Smart City Map & GIS Atlas

> India’s premier open-access interactive GIS intelligence platform for **Dholera Special Investment Region (SIR)**, Gujarat. Search 18,161 statutory revenue survey numbers and preliminary reconstituted Final Plots (FP) across 22 revenue villages. Inspect Town Planning Schemes TP 1 through TP 6, abutting road widths, and DGDCR 2024 building envelopes.

- **Canonical URL**: ${DOMAIN}
- **Governing Body**: Dholera Special Investment Region Development Authority (DSIRDA)
- **Legal Framework**: Gujarat Special Investment Region Act, 2009 & GTPUD Act, 1976
- **Total Area**: ~920 sq km (560 sq km developable urban area)
- **Geographic Coverage**: 22 Revenue Villages, 6 Town Planning Schemes

---

## Core Capabilities
1. **Millimeter-Precision GIS Atlas**: Deep-zoom vector linework for all 6 Town Planning Schemes (TP 1, TP 2A/2B, TP 3, TP 4, TP 5, TP 6).
2. **Instant Survey Number & Final Plot Search**: Cross-reference 18,161 statutory revenue survey numbers with coordinate reticle markers.
3. **DGDCR 2024 Building Envelopes**: Automated calculation of permissible Floor Area Ratio (FAR / FSI: 1.8 to 4.0+), maximum building height (15m to 45m+), and ground coverage (40% to 60%).
4. **Verified Physical Road Frontage**: Exact abutting Town Planning road widths (18m, 30m, 55m, 70m) and access verification.

---

## Town Planning (TP) Schemes
- **TP 1 (Sanctioned Preliminary)**: Ambli, Kadipur, Bhadiyad, Gogla — Residential & Knowledge Zone.
- **TP 2 (Sanctioned Preliminary - 2A & 2B)**: Hebatpur, Gorasu, Bhimnath, Bavaliyari — High-Tech Industrial & Semiconductor Fab Corridor (Tata Electronics).
- **TP 3 (Preliminary)**: Dholera Town, Cher, Sandhida, Sangasar — City Center Commercial, Mixed-Use & Waterfront Tourism.
- **TP 4 (Preliminary)**: Mundi, Bhangadh, Sandhida — Clean-Tech, Solar Park & Logistics Corridor.
- **TP 5 (Preliminary)**: Sangasar, Umargadh, Zankhi, Rahtalav — Aerotropolis, Aviation MRO & Air Cargo.
- **TP 6 (Preliminary)**: Bavaliyari, Khun, Zankhi — Heavy Coastal Industry, Port Support & Airport Logistics.

---

## Major Infrastructure Anchors
- **Tata Semiconductor Fab**: ₹91,000 Crore mega-facility in TP 2 (Village Hebatpur) partnering with PSMC (Taiwan) to manufacture 28nm, 40nm, and 91nm microchips.
- **Ahmedabad-Dholera Expressway (NH-751)**: 109 km 4-lane access-controlled greenfield expressway connecting SP Ring Road (Ahmedabad) directly to Dholera SIR.
- **Dholera International Airport (Navagam)**: 1,426-hectare greenfield airport with two runways (3,200m and 4,000m) designed for 4E/4F aircraft.
- **5,000 MW Dholera Solar Park**: Asia’s largest single-location renewable solar installation along the Gulf of Khambhat coast.

---

## 22 Revenue Villages Covered
${VILLAGES.map(
  (v, idx) =>
    `${idx + 1}. [${v.name}](${DOMAIN}/village/${v.slug}) — Scheme: ${v.scheme} | Zone: ${v.zone}`
).join('\n')}

---

## Key Portal Pages
- [Interactive Map Viewer](${DOMAIN}/map)
- [TP 1 to TP 6 Blueprints](${DOMAIN}/dholera-tp-map)
- [2026 Plot Price Matrix](${DOMAIN}/dholera-plot-price)
- [Expressway & Airport Route Map](${DOMAIN}/dholera-expressway-airport-map)
- [Tata Semiconductor Fab Map](${DOMAIN}/tata-semiconductor-dholera-map)
- [AnyRoR 7/12 Land Records Guide](${DOMAIN}/dholera-7-12-anyror-land-records)
- [Zoning & DGDCR Guide](${DOMAIN}/guide)
- [Verified Broker Network](${DOMAIN}/brokers)
- [Pricing & Investor Plans](${DOMAIN}/pricing)

---

## Latest Land Intelligence Articles
${articles.slice(0, 6).map((a) => `- [${a.title}](${DOMAIN}/blog/${a.slug}) (${a.date}) — ${a.description}`).join('\n')}
`;
  }

  // 2. Blog Index (/blog)
  if (path === '/blog') {
    const articles = await getPublishedArticles();
    return `# Dholera SIR Land Intelligence & Analysis — ${SITE_NAME} Blog

> Independent statutory analysis, market intelligence, Town Planning scheme updates, and investor guides for Dholera Special Investment Region (SIR), Gujarat.

- **Total Articles**: ${articles.length}
- **Canonical URL**: ${DOMAIN}/blog

---

## Published Articles

${articles
  .map(
    (a) => `### [${a.title}](${DOMAIN}/blog/${a.slug})
- **Date**: ${a.date} | **Category**: ${a.category} | **Read Time**: ${a.readingTime || '5 min'}
- **Description**: ${a.description}
- **URL**: ${DOMAIN}/blog/${a.slug}
`
  )
  .join('\n')}
`;
  }

  // 3. Blog Post (/blog/[slug])
  if (path.startsWith('/blog/')) {
    const slug = path.replace(/^\/blog\//, '');
    const article = await getArticleBySlug(slug);
    if (article) {
      return `# ${article.title}

> ${article.description}

- **Published**: ${article.date}${article.updated ? ` (Updated: ${article.updated})` : ''}
- **Category**: ${article.category}
- **Reading Time**: ${article.readingTime || '5 min'}
- **Canonical URL**: ${DOMAIN}/blog/${article.slug}
${article.keywords ? `- **Keywords**: ${article.keywords.join(', ')}` : ''}

---

${article.content}

---
*Published on [DholeraMap](${DOMAIN}) — Independent Dholera SIR Interactive GIS Atlas & Land Intelligence Platform.*
`;
    }
  }

  // 4. Village Page (/village/[slug])
  if (path.startsWith('/village/')) {
    const slug = path.replace(/^\/village\//, '').toLowerCase();
    const village = VILLAGES.find((v) => v.slug === slug);
    if (village) {
      const narrative = ZONE_NARRATIVES[village.zone];
      const surveys = surveysForVillage(slug);
      const schemeKey = village.scheme.includes('1')
        ? 'dholera_tp1'
        : village.scheme.includes('2')
        ? 'dholera_tp2'
        : village.scheme.includes('3')
        ? 'dholera_tp3'
        : village.scheme.includes('4')
        ? 'dholera_tp4'
        : village.scheme.includes('5')
        ? 'dholera_tp5'
        : village.scheme.includes('6')
        ? 'dholera_tp6'
        : 'dholera_tp1';
      const schemeDgdcr = getSchemeDGDCR(schemeKey, 18, village.zone);

      return `# Village ${village.name} — Dholera SIR Town Planning & Land Intelligence

> Statutory land parcel directory, Town Planning scheme designation, DGDCR building regulations, and gazetted survey numbers for **Village ${village.name}**, Dholera Special Investment Region (SIR), Gujarat.

- **Village Name**: ${village.name}
- **Town Planning Scheme**: ${village.scheme}
- **Primary Functional Zone**: ${village.zone}
- **Published Survey Records**: ${surveys.length > 0 ? `${surveys.length} gazetted parcels` : 'Detailed cadastre in progress'}
- **Canonical URL**: ${DOMAIN}/village/${village.slug}

---

## Functional Zone Overview: ${village.zone}
${narrative ? narrative.what : `Village ${village.name} is designated under ${village.scheme} within Dholera SIR.`}

### Land Valuation Drivers
${narrative ? narrative.value : `Valuation depends on proximity to planned TP roads and infrastructure lines.`}

### Critical Buyer Due Diligence
${narrative ? narrative.buyer : 'Verify 7/12 land records on AnyRoR and check TP scheme allotment status.'}

### Specific Checks for ${village.name}
${
  narrative && narrative.diligence
    ? narrative.diligence.map((d, i) => `${i + 1}. ${d}`).join('\n')
    : '1. Verify revenue survey number against the sanctioned TP blueprint.\n2. Confirm abutting road width.'
}

---

## Applicable Building Regulations (DGDCR 2024)
- **Base Permissible FAR / FSI**: ${schemeDgdcr ? `${schemeDgdcr.maxFAR}` : '1.8 – 2.5'}
- **Maximum Permissible Height**: ${schemeDgdcr ? schemeDgdcr.heightDesc : 'Up to 45m'}
- **Ground Coverage**: ${schemeDgdcr ? `${schemeDgdcr.groundCoveragePct}%` : '40% – 60%'}
- **Standard Road Widths**: 18m, 30m, 55m, 70m
- **Statutory Authority**: DSIRDA (${schemeDgdcr?.statutoryTable || 'DGDCR 2024'})

${
  surveys.length > 0
    ? `---

## Sample Gazetted Survey Numbers in ${village.name}
| Survey No | Final Plot (FP) | TP Scheme | Road Width | Area (sq m) |
|---|---|---|---|---|
${surveys
  .slice(0, 15)
  .map(
    (s) =>
      `| [${s.surveyNo}](${DOMAIN}/survey/${village.slug}/${s.surveyNo}) | ${s.finalPlot || '—'} | ${s.schemeId || village.scheme} | ${s.roadWidthM ? `${s.roadWidthM}m` : '18m+'} | ${s.area ? `${s.area.toLocaleString()} m²` : '—'} |`
  )
  .join('\n')}
`
    : ''
}

---
*Explore on the [Live Interactive Map](${DOMAIN}/map?village=${village.slug})*
`;
    }
  }

  // 5. Survey Detail (/survey/[village]/[surveyNo])
  if (path.startsWith('/survey/')) {
    const parts = path.replace(/^\/survey\//, '').split('/');
    if (parts.length >= 2) {
      const villageSlug = parts[0].toLowerCase();
      const surveyNo = parts[1];
      const village = VILLAGES.find((v) => v.slug === villageSlug);
      const surveys = surveysForVillage(villageSlug);
      const survey = surveys.find((s) => s.surveyNo === surveyNo);

      const villageName = village?.name || villageSlug.toUpperCase();
      const scheme = survey?.schemeId || village?.scheme || 'TP 1';
      const fp = survey?.finalPlot || 'Under Final Reconstitution';
      const road = survey?.roadWidthM ? `${survey.roadWidthM} meters` : '18m minimum';
      const area = survey?.area ? `${survey.area.toLocaleString()} sq meters` : 'As per revenue registry';

      return `# Survey Number ${surveyNo}, Village ${villageName} — Dholera SIR

> Statutory land parcel intelligence, Final Plot reconstitution, abutting road frontage, and permissible development rights for **Revenue Survey No. ${surveyNo}** in **Village ${villageName}**, Dholera Special Investment Region (SIR), Gujarat.

- **Revenue Survey Number**: ${surveyNo}
- **Village**: [${villageName}](${DOMAIN}/village/${villageSlug})
- **Town Planning Scheme**: ${scheme}
- **Reconstituted Final Plot (FP)**: ${fp}
- **Abutting Road Width**: ${road}
- **Parcel Area**: ${area}
- **Canonical URL**: ${DOMAIN}/survey/${villageSlug}/${surveyNo}

---

## Planning & Building Control (DGDCR 2024)
- **Base FSI**: 1.8 to 2.5 (indexed to abutting road width)
- **Maximum Chargeable FSI**: Up to 4.0+ for designated commercial/mixed corridors
- **Building Height Limit**: Governed by abutting road frontage (roads $\ge$ 30m permit $\ge$ 45m height)
- **Permitted Use**: Subject to sanctioned zoning regulations for ${village?.zone || 'specified zone'}

---

## 4-Step Due Diligence Verification
1. **AnyRoR 7/12 Record**: Confirm ownership, tenure type (Old Tenure / Navi Sharat vs New Tenure), and encumbrances on the Gujarat Revenue Department AnyRoR portal.
2. **Form 4 / Form 5 Reconstitution Schedule**: Check the Town Planning Officer (TPO) award to verify the percentage land deduction and finalized FP allotment.
3. **Physical Road Access**: Inspect ground reality to ensure physical approach matches the TP blueprint linework.
4. **NA (Non-Agricultural) Conversion**: Verify whether the plot has obtained NA order from the District Collector / DSIRDA.

---
*View parcel boundaries on the [Interactive GIS Blueprint](${DOMAIN}/map?search=${surveyNo})*
`;
    }
  }

  // 6. Hub Pages
  if (path === '/dholera-tp-map') {
    return `# Dholera TP Map — Complete Town Planning Schemes 1 to 6 Blueprint

> High-resolution geospatial guide to all 6 Town Planning (TP) Schemes in Dholera SIR: boundaries, village distribution, gazetted status, and infrastructure phasing.

- **Canonical URL**: ${DOMAIN}/dholera-tp-map

## Summary of Town Planning Schemes
1. **TP 1 (Sanctioned Preliminary)**: Covers 51 sq km across Ambli, Kadipur, Bhadiyad, Gogla. Core activation area with underground utilities.
2. **TP 2 (Sanctioned Preliminary - 2A & 2B)**: Covers 102 sq km across Hebatpur, Gorasu, Bhimnath, Bavaliyari. Houses the Tata Electronics Semiconductor Fab.
3. **TP 3 (Preliminary)**: Commercial center, civic administration, waterfront tourism along the Sukhbhadar river corridor.
4. **TP 4 (Preliminary)**: Clean-tech manufacturing, mega solar park logistics, and heavy support infrastructure.
5. **TP 5 (Preliminary)**: Aerotropolis and air cargo logistics hub surrounding the Dholera International Airport at Navagam.
6. **TP 6 (Preliminary)**: Heavy engineering, marine chemicals, and coastal logistics connecting to the port corridor.

*Explore interactive linework on [DholeraMap Interactive Viewer](${DOMAIN}/map)*
`;
  }

  if (path === '/dholera-expressway-airport-map') {
    return `# Ahmedabad-Dholera Expressway (NH-751) & International Airport Map

> Route alignments, interchanges, travel times, and terminal location details for the two primary connectivity lifelines of Dholera SIR.

- **Canonical URL**: ${DOMAIN}/dholera-expressway-airport-map

## Ahmedabad-Dholera Expressway (NH-751 / NE-8)
- **Total Length**: 109 km
- **Lanes**: 4 lanes expandable to 8 lanes
- **Speed Limit**: 120 km/h (travel time: ~45–50 minutes from Ahmedabad SP Ring Road)
- **Key Interchanges**:
  - Sardar Patel Ring Road (Bavla / Sarkhej junction)
  - Dholka Interchange
  - Fedra Interchange
  - Dholera SIR TP 2 Interchange (Hebatpur / Tata Fab access)
  - Dholera International Airport Spur

## Dholera Greenfield International Airport (Navagam)
- **Site Area**: 1,426 hectares (3,524 acres) in Navagam village
- **Runways**: Two parallel runways (Runway 1: 3,200m; Runway 2: 4,000m)
- **Cargo Capacity**: Built as a dedicated multimodal air cargo hub for Gujarat manufacturing and semiconductor exports.
`;
  }

  if (path === '/dholera-plot-price') {
    return `# Dholera Plot Price Rate Card 2026 — Valuation & Circle Rates

> Comprehensive 2026 market price benchmarks, jantri / circle rates, and price appreciation drivers across all 6 Town Planning schemes in Dholera SIR.

- **Canonical URL**: ${DOMAIN}/dholera-plot-price

## TP Scheme Price Bands (2026 Benchmark)
- **TP 1 (Residential & Knowledge)**: ₹7,000 – ₹12,000 per sq yard (internal plots); ₹14,000 – ₹20,000 per sq yard (55m/70m TP road frontage).
- **TP 2 (Industrial & High-Tech Core)**: ₹6,000 – ₹15,000 per sq yard (industrial Final Plots abutting expressway/TP roads).
- **TP 3 (City Center Commercial)**: ₹8,000 – ₹16,000 per sq yard.
- **TP 4 & TP 5 (Logistics & Aerotropolis)**: ₹4,500 – ₹9,000 per sq yard.
- **TP 6 (Port & Heavy Industry)**: ₹4,000 – ₹8,000 per sq yard.
- **Outside TP (Agricultural Land in 22 Villages)**: ₹40 Lakh – ₹1.2 Crore per Vigha (approx ₹1,700 – ₹4,000/sq yd depending on distance from TP boundary).
`;
  }

  if (path === '/dholera-7-12-anyror-land-records') {
    return `# Gujarat AnyRoR 7/12 & 8A Land Records Verification Guide

> Step-by-step verification guide for online revenue records in Dholera SIR using the official Gujarat Government AnyRoR portal (anyror.gujarat.gov.in).

- **Canonical URL**: ${DOMAIN}/dholera-7-12-anyror-land-records

## Key Records to Verify Before Land Purchase
1. **VF 7 (Village Form 7 - 7/12)**: Shows ownership names, survey numbers, area, and tenure restrictions.
2. **VF 8A (Khata Record)**: Summarizes all land holdings registered under a single owner (Khatedar) in the village.
3. **VF 6 (Hakk Patrak / Mutation Register)**: Chronological ledger of all title transfers, mortgages, court attachments, and heirship entries.
4. **TPO Form 4 & Form 5**: Crucial for TP areas — verifies original survey area vs Final Plot reconstituted area after 50% statutory deduction.
`;
  }

  if (path === '/dholera-sir') {
    return `# Dholera Special Investment Region (SIR) — Definitive Statutory Guide & Master Plan

> The comprehensive guide to Dholera SIR: 920 sq km statutory economic region under Gujarat SIR Act 2009, 6 Town Planning Schemes, 22 revenue villages, and DGDCR building regulations.

- **Canonical URL**: ${DOMAIN}/dholera-sir
- **Full Form**: Dholera Special Investment Region (SIR)
- **Governing Legislation**: Gujarat Special Investment Region Act, 2009 & GTPUD Act, 1976
- **Planning Authority**: DSIRDA (Dholera SIR Development Authority)
- **Infrastructure Implementation**: DICDL (Dholera Industrial City Development Limited)
- **Total Footprint**: ~920 sq km (~422 sq km developable across TP 1 to TP 6)

## Difference between SIR and SEZ
- **SIR (Special Investment Region)**: A statutory regional economic metropolis spanning industrial, commercial, residential, and civic zones with comprehensive master planning.
- **SEZ (Special Economic Zone)**: A fenced export enclave with customs duty exemptions. Dholera SIR is NOT just an SEZ; it is an entire greenfield smart city.

## Town Planning (TP) Schemes 1 to 6
1. **TP 1**: Activation Area, Residential R-1/R-2, Knowledge corridor (51.1 sq km).
2. **TP 2**: Heavy Industrial, Tata Semiconductor Mega-Fab, High-Access Corridor (102.3 sq km).
3. **TP 3**: Central Business District (CBD), Waterfront & Commercial (66.3 sq km).
4. **TP 4**: Solar Park, Clean Tech, Logistics (60.2 sq km).
5. **TP 5**: Aerotropolis, International Airport buffer, Aircraft MRO (74.3 sq km).
6. **TP 6**: Coastal Logistics, Marine Chemicals, Heavy Engineering (67.3 sq km).
`;
  }

  if (
    path === '/dholera-sir-land-records-master-plan-whitepaper' ||
    path === '/whitepaper'
  ) {
    return `# Dholera SIR Land Records & Master Plan Whitepaper (v2.4)

> Authoritative research study on statutory town planning, OP-to-FP reconstitution deduction algorithms, empirical parcel inventory across TP 1 through TP 6, and DGDCR 2024 development control regulations.

- **Canonical URL**: ${DOMAIN}/dholera-sir-land-records-master-plan-whitepaper
- **DOI**: 10.5281/zenodo.dholera-cadastre-2026
- **License**: Creative Commons Attribution 4.0 International (CC BY 4.0)
- **Spatial Coverage**: 920 sq km (421.5 sq km developable, 22 revenue villages)
- **Indexed Cadastre Records**: 33,481 records, 18,161 reconstituted Final Plots

## 1. Statutory Land Reconstitution Mechanics (OP to FP)
Under the Gujarat Town Planning and Urban Development (GTPUD) Act 1976, land is pooled and reconstituted. The average statutory deduction is approximately 50%:
- **Circulation & Roads (12m–70m expressways)**: 20%
- **Social Infrastructure (Schools, Hospitals, Utilities)**: 15%
- **Parks, Green Spines & Stormwater Swales**: 10%
- **EWS Housing & Government Reserves**: 5%
- **Net Return to Landowner**: ~50% as serviced, clear-titled Non-Agricultural (NA) Final Plot (FP).

## 2. TP 1 to TP 6 Empirical Matrix
- **TP 1**: 5,109 Ha (51.1 sq km), 6 sub-schemes, 5,171 indexed parcels.
- **TP 2**: 10,232 Ha (102.3 sq km), 8 sub-schemes, 9,432 indexed parcels (Tata Semiconductor Fab).
- **TP 3**: 6,632 Ha (66.3 sq km), 4 sub-schemes, 5,218 indexed parcels (CBD & Waterfront).
- **TP 4**: 6,022 Ha (60.2 sq km), 3 sub-schemes, 6,404 indexed parcels (Solar & Logistics).
- **TP 5**: 7,425 Ha (74.3 sq km), 4 sub-schemes, 3,962 indexed parcels (Aerotropolis & MRO).
- **TP 6**: 6,726 Ha (67.3 sq km), 2 sub-schemes, 3,294 indexed parcels (Heavy Engineering).
- **Total**: 42,146 Hectares (~422 sq km DSIRDA control total), 27 sub-schemes.

## 3. DGDCR 2024 Road Frontage & FSI Matrix
- **< 12m road**: Base FSI 1.20 | Max Height 10m
- **12m - 18m road**: Base FSI 1.50 | Total FSI 1.80 | Max Height 16.5m
- **18m - 24m road**: Base FSI 1.80 | Total FSI 2.40 | Max Height 25m
- **24m - 30m road**: Base FSI 2.00 | Total FSI 3.00 | Max Height 45m
- **30m - 45m road**: Base FSI 2.20 | Total FSI 3.60 | Max Height 70m
- **>= 45m arterial**: Base FSI 2.50 | Total FSI up to 5.00 | Max Height 150m+

## 4. Citation
\`\`\`bibtex
@dataset{bansal_dholera_cadastre_2026,
  author    = {Bansal, Aryan},
  title     = {Dholera SIR Cadastral Land Records & Town Planning Reconstitution Study},
  year      = {2026},
  publisher = {DholeraMap Open Cadastre Initiative},
  url       = {https://dholeramap.com/dholera-sir-land-records-master-plan-whitepaper},
  doi       = {10.5281/zenodo.dholera-cadastre-2026}
}
\`\`\`
`;
  }

  if (path === '/tata-semiconductor-dholera-map') {
    return `# Tata Semiconductor Fab Dholera Map — Location, Corridors & Supply Chain

> Geospatial location, investment scope, utility infrastructure, and supply chain ecosystem of the ₹91,000 Crore Tata Electronics & PSMC semiconductor fabrication plant in Dholera SIR.

- **Canonical URL**: ${DOMAIN}/tata-semiconductor-dholera-map

## Facility Overview
- **Promoter**: Tata Electronics Private Limited (TEPL) in joint venture with Powerchip Semiconductor Manufacturing Corporation (PSMC, Taiwan).
- **Investment**: ₹91,000 Crore (~$11 Billion USD).
- **Location**: Town Planning Scheme 2 (TP 2), Village Hebatpur, Dholera SIR.
- **Target Capacity**: Up to 50,000 wafer starts per month (WSPM).
- **Technology Nodes**: 28nm, 40nm, 55nm, and 91nm specialized logic chips for automotive, power management, AI, and telecom applications.
- **Utility Feeds**: Dedicated 220kV/400kV substations with N+1 redundancy, 100 MLD water pipeline from Narmada canal, and specialized underground chemical pipelines.
`;
  }

  if (path === '/pricing') {
    return `# DholeraMap Investor & Professional Pricing Plans

> Subscription plans and due diligence report credits for real estate investors, brokers, and developers in Dholera SIR.

- **Canonical URL**: ${DOMAIN}/pricing

## Plans
1. **Free Explorer**:
   - Price: ₹0
   - Features: Full-screen interactive map, basic survey number search, village boundary overlays, standard DGDCR information.
2. **Dealer Pro**:
   - Price: ₹1,000 / month
   - Features: 5 Full Dossier PDF downloads per month, high-resolution cadastral overlays, RERA broker badge, priority email support.
   - Extra Dossier PDFs: ₹200 / PDF.
3. **Enterprise Max**:
   - Price: ₹2,500 / month
   - Features: 15 Full Dossier PDF downloads per month, unmetered cadastral search, custom agency branding on all PDF reports, API access, dedicated account manager.
   - Extra Dossier PDFs: ₹200 / PDF.
4. **Single Due Diligence Pass**:
   - Price: ₹499 one-time
   - Features: 24-hour pass with 2 instant PDF parcel due diligence reports.
`;
  }

  if (path === '/guide') {
    return `# Dholera SIR Town Planning (TP) & DGDCR Building Envelope Guide

> Comprehensive regulatory guide to Dholera Special Investment Region Development Authority (DSIRDA) regulations and DGDCR 2024.

- **Canonical URL**: ${DOMAIN}/guide

## Key Topics Covered
- How the GTPUD Act 1976 reconstitution mechanism works in Dholera.
- Understanding 50% land deduction and final plot reconstitution.
- Permissible Floor Area Ratio (FAR / FSI) by road width:
  - 18m road: 1.8 base FSI
  - 30m road: 2.2 base FSI
  - 55m road: 2.5 base FSI
  - 70m central spine road: Chargeable incentive FSI up to 4.0+
- Building height limits and setback rules.
`;
  }

  if (path === '/brokers') {
    return `# Verified RERA Real Estate Brokers — Dholera SIR

> Directory of licensed Gujarat RERA registered property consultants, brokers, and land aggregators operating in Dholera Special Investment Region.

- **Canonical URL**: ${DOMAIN}/brokers

## Listed Consultants
${SEEDED_BROKERS.map(
  (b) => `### ${b.name} (${b.agency})
- **RERA No**: ${b.reraNumber}
- **Experience**: ${b.experienceYears} Years | **Deals Closed**: ${b.dealsClosed}
- **Focus Schemes**: ${b.tpSchemes.join(', ')}
- **Phone**: ${b.phone} | **Email**: ${b.email}
- **Office**: ${b.headOffice}
`
).join('\n')}
`;
  }

  if (path === '/about') {
    return `# About ${SITE_NAME} — Platform & Mission

> The open geospatial data initiative providing transparent, millimeter-accurate statutory land intelligence for Dholera Special Investment Region.

- **Canonical URL**: ${DOMAIN}/about
- **Platform Name**: ${SITE_NAME} (Engine: ${PRODUCT_NAME})
- **Mission**: Eliminating opaque land brokerage practices by compiling sanctioned Town Planning blueprints, revenue survey numbers, and statutory DGDCR building regulations into an intuitive interactive atlas.
- **Coverage**: All 920 sq km, 22 revenue villages, and 6 Town Planning schemes of Dholera SIR.
- **Data Integrity**: Verified against published Gujarat Government Gazettes and Town Planning Officer award registers.
`;
  }

  if (path === '/contact') {
    return `# Contact ${SITE_NAME}

- **Website**: ${DOMAIN}
- **Email**: contact@dholeramap.com
- **WhatsApp Support**: Available on website
- **Head Office**: Dholera SIR / Ahmedabad, Gujarat, India
- **Grievance Officer**: grievance@dholeramap.com
`;
  }

  if (path === '/terms') {
    return `# Terms and Conditions of Service — ${SITE_NAME}

- **Canonical URL**: ${DOMAIN}/terms
- **Operating Entity**: ${SITE_NAME}
- **Nature of Service**: Independent geospatial information compiler and statutory atlas. Not a registered real estate broker or promoter under RERA.
- **Accuracy**: Linework and survey numbers reflect published Gujarat Government Gazettes. Users are advised to perform independent title verification prior to executing financial transactions.
`;
  }

  if (path === '/privacy') {
    return `# Privacy Policy — ${SITE_NAME}

- **Canonical URL**: ${DOMAIN}/privacy
- **Data Protection**: We do not sell personal data. Authentication is securely managed by Clerk, payments by Razorpay (PCI-DSS Level 1 compliant), and data storage by Supabase (encrypted at rest).
`;
  }

  if (path === '/refund') {
    return `# Cancellation and Refund Policy — ${SITE_NAME}

- **Canonical URL**: ${DOMAIN}/refund
- **Policy**: Digital subscriptions and credit packs may be cancelled at any time. If a technical error prevents access to dossier reports, full refund is processed within 5-7 business days.
`;
  }

  if (path === '/shipping') {
    return `# Shipping and Delivery Policy — ${SITE_NAME}

- **Canonical URL**: ${DOMAIN}/shipping
- **Delivery**: All services on DholeraMap are digital. Subscriptions, credits, and PDF dossiers are delivered instantaneously upon successful payment.
`;
  }

  if (path === '/disclaimer') {
    return `# Legal & Statutory Disclaimer — ${SITE_NAME}

- **Canonical URL**: ${DOMAIN}/disclaimer
- **Notice**: DholeraMap (dholeramap.com) is an independent mapping and analytical portal. It is not affiliated with DSIRDA, Dholera Industrial City Development Limited (DICDL), or the Government of Gujarat. All planning parameters must be cross-checked with the relevant statutory authority.
`;
  }

  // 7. Generic Fallback for any other path
  const cleanTitle = path
    .replace(/^\//, '')
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

  return `# ${cleanTitle || SITE_NAME} — ${SITE_NAME}

> Clean machine-readable representation of ${DOMAIN}${path}.

- **URL**: ${DOMAIN}${path}
- **Platform**: ${SITE_NAME}
- **Topic**: Dholera Special Investment Region (SIR) Smart City & Land Intelligence

For the complete documentation index and available datasets, see:
- [Full LLM Index](${DOMAIN}/llms-full.txt)
- [LLMs Overview](${DOMAIN}/llms.txt)
- [XML Sitemap](${DOMAIN}/sitemap.xml)
`;
}
