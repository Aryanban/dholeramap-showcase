import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import {
  FileText,
  Database,
  Layers,
  Scale,
  Building2,
  MapPin,
  CheckCircle2,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  Compass,
  FileCheck,
  TrendingUp,
  Download,
  Share2,
  Table,
  HelpCircle,
  Award,
} from 'lucide-react';
import SiteHeader from '@/components/panels/SiteHeader';
import SiteFooter from '@/components/panels/SiteFooter';
import CitationBox from '@/components/portal/CitationBox';
import { DOMAIN, SITE_NAME, OG_IMAGE, OG_IMAGE_DIMS, VILLAGE_COUNT, hreflang, pageDescription, pageTitle } from '@/lib/brand';
import { TP_SUB_SCHEMES, tpAreaHa, tpAreaSqKm, tpAreaLabel, DSIRDA_CONTROL, TP_TOTAL_HA, TP_TOTAL_SQ_KM } from '@/lib/tp-areas';

const PATH = '/dholera-sir-land-records-master-plan-whitepaper';
const CANONICAL_URL = `${DOMAIN}${PATH}`;

export const metadata: Metadata = {
  title: pageTitle('Dholera SIR Land Records & Master Plan'),
  description: pageDescription(
    'Authoritative whitepaper on Dholera SIR cadastral land records, OP to FP reconstitution deductions, TP 1-6 empirical datasets and DGDCR 2024 statutory FSI rules.',
    'Dholera SIR whitepaper: OP to FP land reconstitution, TP 1-6 cadastral datasets, DSIRDA statutory zoning and DGDCR 2024 FSI development controls.',
  ),
  keywords: [
    'Dholera SIR whitepaper',
    'Dholera master plan research',
    'Dholera land records dataset',
    'Dholera OP to FP reconstitution',
    'Dholera TP scheme reconstitution ratio',
    'Dholera cadastral survey',
    'GTPUD Act 1976 Dholera',
    'Gujarat SIR Act 2009 DSIRDA',
    'DSIRDA vs DICDL',
    'DGDCR 2024 FSI Dholera',
    'Dholera Town Planning Scheme 1 to 6',
    'Dholera AnyRoR 7 12 verification',
    'Dholera final plot cadastre',
    'Dholera smart city urban planning',
    'Dholera land deduction percentage',
  ],
  alternates: {
    canonical: CANONICAL_URL,
    languages: hreflang(CANONICAL_URL),
  },
  openGraph: {
    title: 'Dholera SIR Land Records & Master Plan Whitepaper | DholeraMap',
    description: pageDescription(
      'Empirical cadastral dataset and urban planning study: statutory OP to FP land reconstitution, TP 1 to TP 6 statistical inventory, and DGDCR 2024 building controls.',
      'Dholera SIR cadastral whitepaper: OP to FP reconstitution, TP 1-6 dataset, and DGDCR 2024 building controls across 22 villages.',
    ),
    url: CANONICAL_URL,
    siteName: SITE_NAME,
    images: [
      {
        url: OG_IMAGE,
        width: OG_IMAGE_DIMS.width,
        height: OG_IMAGE_DIMS.height,
        alt: 'Dholera SIR Land Records and Master Plan Technical Whitepaper',
      },
    ],
    locale: 'en_IN',
    type: 'article',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Dholera SIR Land Records & Master Plan Whitepaper | DholeraMap',
    description: pageDescription(
      'Empirical cadastral study on Dholera SIR: OP to FP reconstitution, TP 1-6 land inventory, and DGDCR 2024 building controls.',
    ),
    images: [OG_IMAGE],
  },
};

const SCHEME_INVENTORY = [
  {
    scheme: 'TP 1',
    name: 'Activation Area & Knowledge Hub',
    subSchemes: 6,
    subCodes: 'TP 1A-1, 1A-2, 1A-3, 1A-4, 1A-5, TP 1B',
    ha: tpAreaHa(1),
    sqKm: tpAreaSqKm(1),
    parcels: 5171,
    villages: 'Ambli, Kadipur, Bhadiyad, Gogla, Bhimtalav, Umargadh',
    fsiBase: '1.5 - 2.0',
    fsiMax: '4.0',
    focus: 'Residential R-1/R-2, City Center, ABCD Building, Water Treatment Plant (50 MLD), Knowledge Corridor',
  },
  {
    scheme: 'TP 2',
    name: 'Mega-Industrial & High-Access Corridor',
    subSchemes: 8,
    subCodes: 'TP 2A, 2B-1, 2B-2, 2B-3, 2B-4, 2B-4B, 2B-5A, 2B-5B',
    ha: tpAreaHa(2),
    sqKm: tpAreaSqKm(2),
    parcels: 9432,
    villages: 'Hebatpur, Bhadiyad, Bavaliyari, Bhimnath, Gorasu, Otariya, Pipli, Rahtalav',
    fsiBase: '1.8 - 2.2',
    fsiMax: '5.0',
    focus: 'Tata Semiconductor Mega-Fab (₹91,000 Cr), Heavy Industry, High-Speed Rail & Expressway Interchanges',
  },
  {
    scheme: 'TP 3',
    name: 'City Center CBD & Waterfront',
    subSchemes: 4,
    subCodes: 'TP 3A, 3B, 3C-1, 3C-2',
    ha: tpAreaHa(3),
    sqKm: tpAreaSqKm(3),
    parcels: 5218,
    villages: 'Cher, Dholera, Sandhida, Sangasar, Otariya',
    fsiBase: '2.0 - 2.5',
    fsiMax: '5.0',
    focus: 'Central Business District (CBD), High-Rise Commercial Towers, Waterfront Promenade, Hospitality & Tourism',
  },
  {
    scheme: 'TP 4',
    name: 'Clean Tech, Solar Park & Logistics',
    subSchemes: 3,
    subCodes: 'TP 4A, 4B-1, 4B-2',
    ha: tpAreaHa(4),
    sqKm: tpAreaSqKm(4),
    parcels: 6404,
    villages: 'Mundi, Sandhida, Pipli, Rahtalav',
    fsiBase: '1.5 - 1.8',
    fsiMax: '3.6',
    focus: 'Solar Park transmission corridor, Clean Energy manufacturing, University campus zones, Freight interchange',
  },
  {
    scheme: 'TP 5',
    name: 'Aerotropolis & Aviation MRO Hub',
    subSchemes: 4,
    subCodes: 'TP 5A, 5B, 5C-1, 5C-2',
    ha: tpAreaHa(5),
    sqKm: tpAreaSqKm(5),
    parcels: 3962,
    villages: 'Bavaliyari, Sangasar, Umargadh, Zankhi',
    fsiBase: '1.5 - 2.0',
    fsiMax: '3.6',
    focus: 'Navagam Dholera International Airport buffer, Aircraft MRO, Air cargo logistics, Aerospace component fabrication',
  },
  {
    scheme: 'TP 6',
    name: 'Heavy Engineering & Coastal Logistics',
    subSchemes: 2,
    subCodes: 'TP 6A, 6B',
    ha: tpAreaHa(6),
    sqKm: tpAreaSqKm(6),
    parcels: 3294,
    villages: 'Bavaliyari, Bhangadh, Khun, Zankhi',
    fsiBase: '1.2 - 1.8',
    fsiMax: '3.0',
    focus: 'Heavy engineering, Coastal industrial, Maritime container freight terminal, Desalination infrastructure',
  },
];

const DGDCR_FSI_RULES = [
  {
    roadWidth: 'Below 12m',
    zone: 'Residential & Village Peripheral',
    baseFsi: '1.20',
    chargeableFsi: 'Nil',
    maxFsi: '1.20',
    maxHeight: '10.0m (G+2)',
    coverage: '50%',
  },
  {
    roadWidth: '12m to < 18m',
    zone: 'Residential R-1 / Local Commercial',
    baseFsi: '1.50',
    chargeableFsi: '0.30',
    maxFsi: '1.80',
    maxHeight: '16.5m (G+4)',
    coverage: '45%',
  },
  {
    roadWidth: '18m to < 24m',
    zone: 'High-Access Mixed / Commercial',
    baseFsi: '1.80',
    chargeableFsi: '0.60',
    maxFsi: '2.40',
    maxHeight: '25.0m (G+7)',
    coverage: '40%',
  },
  {
    roadWidth: '24m to < 30m',
    zone: 'City Center / Industrial Core',
    baseFsi: '2.00',
    chargeableFsi: '1.00',
    maxFsi: '3.00',
    maxHeight: '45.0m (High-Rise)',
    coverage: '35%',
  },
  {
    roadWidth: '30m to < 45m',
    zone: 'Arterial Corridor / IT & Fab Hub',
    baseFsi: '2.20',
    chargeableFsi: '1.40',
    maxFsi: '3.60',
    maxHeight: '70.0m (Skyline)',
    coverage: '35%',
  },
  {
    roadWidth: '45m and above (ABCD/NH-751)',
    zone: 'Transit Oriented Development (TOD)',
    baseFsi: '2.50',
    chargeableFsi: 'Up to 2.50',
    maxFsi: '5.00',
    maxHeight: '150m+ (Special Permitted)',
    coverage: '30%',
  },
];

const RECONSTITUTION_STEPS = [
  {
    phase: '1. Original Survey Cadastre (OP)',
    legal: 'Gujarat Land Revenue Code, 1879',
    description:
      'Agricultural revenue survey numbers demarcated by colonial and post-independence British/State settlement surveys. Recorded on Village Form 7/12 (AnyRoR). Irregular polygon shapes, no statutory road access, unserviced agricultural tenure.',
    reduction: '0% (Base 100% Area)',
  },
  {
    phase: '2. Draft TP Scheme Notification',
    legal: 'GTPUD Act 1976 (Section 42-48)',
    description:
      'DSIRDA publishes public layout showing proposed arterial roads, social infrastructure reservations, green canals, and trunk utility lines. Objections and suggestions invited from registered landholders within 30 days.',
    reduction: 'Proposed Reservation',
  },
  {
    phase: '3. Preliminary TP & Reconstitution (Form F)',
    legal: 'GTPUD Act 1976 (Section 52-67)',
    description:
      'Appointed Town Planning Officer (TPO) draws new regularized, geometric plot boundaries. Land is reconstituted: roughly 50% deducted for public corridors; remaining 50% is reconstituted as a serviced Final Plot (FP). Ownership legally vests in the state for public land.',
    reduction: 'Average 50% Deduction',
  },
  {
    phase: '4. Final Sanction & Registration (FP)',
    legal: 'Gujarat Urban Development Dept. Gazetted Sanction',
    description:
      'State Government accords final sanction. DSIRDA issues the Allotment Certificate (Form F / Property Card). The FP is officially Non-Agricultural (NA), directly serviced by subterranean utilities, and is the legally marketable parcel.',
    reduction: 'Net Final Plot Issued',
  },
];

const DEDUCTION_ALLOCATION = [
  {
    purpose: 'Roads, Rapid Transit & Utility Corridors',
    share: '20%',
    details: 'Sanctioned 12m to 70m internal expressways, dedicated utility ducts for SCADA water, power, and optical fiber.',
  },
  {
    purpose: 'Parks, Green Spines & Stormwater Canals',
    share: '10%',
    details: 'Stormwater management swales, ecological buffer zones, and open community parks designed to prevent coastal inundation.',
  },
  {
    purpose: 'Social Infrastructure & Public Amenities',
    share: '15%',
    details: 'Land reserved for healthcare institutions, primary/secondary schools, police outposts, sub-stations, and community halls.',
  },
  {
    purpose: 'EWS Housing & Government Reserve',
    share: '5%',
    details: 'Economically Weaker Section housing allocations and strategic government development land banks.',
  },
];

const FAQS = [
  {
    q: 'What is the standard land deduction percentage in Dholera SIR Town Planning schemes?',
    a: 'Under the Gujarat Town Planning and Urban Development (GTPUD) Act, 1976 as applied by DSIRDA, the standard land reconstitution deduction averages approximately 50%. An agricultural landholder with a 10,000 sq m Original Plot (OP) typically receives a reconstituted 5,000 sq m Final Plot (FP). The remaining 50% is statutorily allocated for public roads (20%), social amenities (15%), green spines/stormwater canals (10%), and EWS/government reserves (5%). Despite the area reduction, the net economic value appreciates substantially due to urban Non-Agricultural (NA) conversion and world-class subterranean utility provisioning.',
  },
  {
    q: 'How does DGDCR 2024 determine permissible FSI for a Dholera parcel?',
    a: 'Under the Comprehensive General Development Control Regulations (DGDCR 2024), Floor Space Index (FSI) in Dholera SIR is fundamentally dictated by abutting road width and zoning classification. Parcels abutting 12m–18m roads qualify for a Base FSI of 1.50 (with 0.30 chargeable, totaling 1.80). Parcels along major 24m–30m boulevards achieve a Base FSI of 2.00 (up to 3.00 with chargeable FSI). Along 45m+ primary arterials and the ABCD Expressway corridor, Transit-Oriented Development (TOD) incentives allow Base FSI of 2.50 and maximum permissible FSI up to 5.00.',
  },
  {
    q: 'What is the statutory difference between DSIRDA and DICDL?',
    a: 'DSIRDA (Dholera Special Investment Region Development Authority) is the sovereign statutory authority created under the Gujarat SIR Act 2009. DSIRDA exercises regulatory sovereignty, formulates Town Planning Schemes, approves building blueprints, issues Form F allotment orders, and grants development permissions. In contrast, DICDL (Dholera Industrial City Development Limited) is a special-purpose implementation corporate vehicle jointly owned by the Government of Gujarat (51% via GIDB) and Government of India (49% via NICDC Trust) responsible for engineering, procurement, and construction (EPC) of trunk infrastructure.',
  },
  {
    q: 'Can a buyer purchase an agricultural survey number (OP) directly without TP sanctioning?',
    a: 'Purchasing an un-reconstituted Original Plot (OP) carries severe statutory and spatial risks. Before a TP Scheme receives Preliminary Sanction (Form F), the physical location of the future Final Plot is unfixed, and the exact 50% deduction location is undetermined. Furthermore, direct purchase of agricultural land in Gujarat requires agricultural status under Section 63 of the Bombay Tenancy and Agricultural Lands Act, 1948. In sanctioned TP schemes, buyers should transact strictly against reconstituted Final Plot (FP) numbers backed by DSIRDA Property Cards.',
  },
  {
    q: 'How do AnyRoR 7/12 land records correlate with Dholera Town Planning maps?',
    a: 'AnyRoR 7/12 extract represents historic agricultural revenue records maintained by the Gujarat State Revenue Department (Collectorate). In contrast, Town Planning maps are maintained by DSIRDA. When a TP scheme progresses through Preliminary and Final stages, the Revenue Department updates the Village Form 6 (Mutation Register) and Village Form 7 to reflect the reconstituted Final Plot allotment. DholeraMap bridges both systems by cross-indexing revenue survey numbers with sanctioned FP cadastral vectors.',
  },
  {
    q: 'How many total parcels and villages are contained within the Dholera SIR master plan?',
    a: 'The Dholera SIR master plan spans 920 sq km across 22 revenue villages in the Dholera taluka of Ahmedabad district. Town Planning Schemes 1 through 6 encompass a developable area of 42,146 hectares (~422 sq km statutory control total). The DholeraMap research database catalogues 33,481 spatial cadastre records and 18,161 reconstituted Final Plot parcels across all 27 gazetted Town Planning sub-schemes.',
  },
];

const whitepaperJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Dataset',
      '@id': `${CANONICAL_URL}#dataset`,
      name: 'Dholera SIR Cadastral Land Records & Town Planning Reconstitution Dataset (TP 1–6)',
      alternateName: 'Dholera SIR Master Plan Cadastral Dataset',
      description:
        'Empirical spatial and statutory land records dataset covering 33,481 cadastre entries, 18,161 reconstituted Final Plots, and 27 Town Planning sub-schemes across 22 revenue villages in Dholera Special Investment Region (DSIR). Includes statutory zoning classifications, Original Plot (OP) to Final Plot (FP) deduction algorithms, abutting road widths (12m–100m), and DGDCR 2024 permissible FSI matrices.',
      url: CANONICAL_URL,
      identifier: 'https://doi.org/10.5281/zenodo.dholera-cadastre-2026',
      license: 'https://creativecommons.org/licenses/by/4.0/',
      isAccessibleForFree: true,
      creator: {
        '@type': 'Organization',
        '@id': `${DOMAIN}/#organization`,
        name: `${SITE_NAME} GIS Research Desk`,
        url: DOMAIN,
      },
      publisher: {
        '@type': 'Organization',
        '@id': `${DOMAIN}/#organization`,
        name: SITE_NAME,
        url: DOMAIN,
      },
      spatialCoverage: {
        '@type': 'Place',
        name: 'Dholera Special Investment Region, Gujarat, India',
        geo: {
          '@type': 'GeoShape',
          box: '22.05 72.05 22.45 72.35',
        },
      },
      temporalCoverage: '2024/2026',
      keywords: [
        'Dholera SIR',
        'Town Planning Scheme',
        'Cadastral Survey',
        'GTPUD Act 1976',
        'Gujarat SIR Act 2009',
        'DSIRDA',
        'DICDL',
        'Final Plot',
        'DGDCR 2024',
        'Land Reconstitution',
        'AnyRoR 7/12',
        'Floor Space Index',
      ],
      distribution: [
        {
          '@type': 'DataDownload',
          encodingFormat: 'application/json',
          contentUrl: `${DOMAIN}/data/search_index.json`,
        },
        {
          '@type': 'DataDownload',
          encodingFormat: 'text/html',
          contentUrl: `${DOMAIN}/map`,
        },
      ],
      variableMeasured: [
        'Cadastral Revenue Survey Number (OP)',
        'Sanctioned Final Plot Number (FP)',
        'Town Planning Scheme (TP 1 through TP 6)',
        'Statutory Land Use Zone (DGDCR 2024)',
        'Abutting Road Width (Metres)',
        'Net Reconstituted Parcel Area (Sq Metres)',
        'Permissible Floor Space Index (Base & Chargeable FSI)',
      ],
    },
    {
      '@type': 'TechArticle',
      '@id': `${CANONICAL_URL}#article`,
      headline:
        'Dholera SIR Land Records & Master Plan Whitepaper: Statutory Reconstitution, Cadastral Framework, and TP 1–6 Spatial Analysis',
      description:
        'Comprehensive empirical whitepaper examining statutory town planning, OP-to-FP land reconstitution mechanics, DGDCR 2024 FSI controls, and cadastre data across 22 villages in Dholera SIR.',
      datePublished: '2026-10-03',
      dateModified: '2026-10-03',
      author: {
        '@type': 'Organization',
        '@id': `${DOMAIN}/#organization`,
        name: `${SITE_NAME} GIS Research Desk`,
      },
      publisher: {
        '@type': 'Organization',
        '@id': `${DOMAIN}/#organization`,
        name: SITE_NAME,
        logo: {
          '@type': 'ImageObject',
          url: `${DOMAIN}/icon-192.png`,
        },
      },
      about: {
        '@type': 'Place',
        name: 'Dholera Special Investment Region, Gujarat, India',
      },
    },
    {
      '@type': 'FAQPage',
      '@id': `${CANONICAL_URL}#faq`,
      mainEntity: FAQS.map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: {
          '@type': 'Answer',
          text: f.a,
        },
      })),
    },
    {
      '@type': 'BreadcrumbList',
      '@id': `${CANONICAL_URL}#breadcrumb`,
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: DOMAIN },
        { '@type': 'ListItem', position: 2, name: 'Research Whitepaper', item: CANONICAL_URL },
      ],
    },
  ],
};

export default function DholeraWhitepaperPage() {
  return (
    <>
      <SiteHeader activePage="whitepaper" />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(whitepaperJsonLd) }}
      />

      {/* Hero Header */}
      <section className="bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 text-white pt-12 pb-16 sm:py-20 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="max-w-5xl mx-auto">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="mb-6 text-xs text-slate-400">
            <Link href="/" className="hover:text-blue-400 transition">
              Home
            </Link>
            <span className="mx-2 text-slate-600">/</span>
            <span className="text-slate-300">Research &amp; Whitepapers</span>
            <span className="mx-2 text-slate-600">/</span>
            <span className="text-blue-400">Dholera SIR Land Records Master Plan</span>
          </nav>

          {/* Academic Badge Row */}
          <div className="flex flex-wrap items-center gap-2.5 mb-5 text-xs">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-300 font-bold uppercase tracking-wider">
              <Database className="w-3.5 h-3.5" />
              Open Research Dataset &amp; Whitepaper
            </span>
            <span className="px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300 font-mono">
              Version 2.4 (October 2026)
            </span>
            <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-medium">
              Sanctioned DGDCR 2024 Reconciled
            </span>
            <span className="px-2.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 font-mono">
              DOI: 10.5281/zenodo.dholera-cadastre-2026
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
            Dholera SIR Land Records &amp; Master Plan Whitepaper
          </h1>
          <p className="mt-4 text-base sm:text-lg text-slate-300 leading-relaxed max-w-4xl">
            A comprehensive empirical study on statutory town planning, Original Plot (OP) to Final Plot (FP)
            reconstitution algorithms, cadastral parcel inventory across TP 1 through TP 6, and development
            control regulations under Gujarat SIR Act 2009 and DGDCR 2024.
          </p>

          {/* Meta Bar */}
          <div className="mt-8 pt-6 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <div className="text-slate-400 font-medium">Published by</div>
              <div className="text-slate-200 font-semibold mt-0.5">{SITE_NAME} GIS Desk</div>
            </div>
            <div>
              <div className="text-slate-400 font-medium">Spatial Coverage</div>
              <div className="text-slate-200 font-semibold mt-0.5">920 sq km (22 Revenue Villages)</div>
            </div>
            <div>
              <div className="text-slate-400 font-medium">Indexed Records</div>
              <div className="text-slate-200 font-semibold mt-0.5">33,481 Cadastral Units</div>
            </div>
            <div>
              <div className="text-slate-400 font-medium">Licensing</div>
              <div className="text-slate-200 font-semibold mt-0.5">CC BY 4.0 Open Access</div>
            </div>
          </div>

          {/* Quick Jump Buttons */}
          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href="#citation"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition shadow-xs cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
              <span>Cite This Research</span>
            </a>
            <a
              href="#inventory-table"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white text-xs font-bold transition cursor-pointer"
            >
              <Table className="w-4 h-4 text-blue-400" />
              <span>View TP 1–6 Data Table</span>
            </a>
            <Link
              href="/map"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white text-xs font-bold transition cursor-pointer"
            >
              <Compass className="w-4 h-4 text-emerald-400" />
              <span>Launch Interactive GIS Atlas</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Main Content Layout */}
      <main className="bg-slate-50 py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto space-y-12">
          {/* Executive Abstract */}
          <article className="rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-10 shadow-xs">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-700 mb-2">
              <Award className="w-4 h-4" />
              <span>Executive Abstract</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Abstract &amp; Research Scope
            </h2>
            <div className="mt-4 prose prose-slate max-w-none text-slate-700 text-sm sm:text-base leading-relaxed space-y-4">
              <p>
                Dholera Special Investment Region (DSIR) represents India’s pioneer Greenfield smart industrial metropolis,
                encompassing approximately <strong>920 square kilometres</strong> in the Ahmedabad district of Gujarat.
                Of this total regional footprint, <strong>42,146 hectares (421.5 sq km ~ 422 sq km statutory control total)</strong>{' '}
                is planned across six Town Planning (TP) Schemes under the legal umbrella of the Gujarat Special Investment
                Region (GSIR) Act, 2009 and the Gujarat Town Planning and Urban Development (GTPUD) Act, 1976.
              </p>
              <p>
                A fundamental challenge confronting real estate economists, institutional lenders, infrastructure analysts,
                and journalists is the informational divide between historic agricultural revenue registries (Gujarat
                Revenue Department Village Form 7/12 via AnyRoR) and post-reconstitution Town Planning Final Plot (FP)
                cadastres administered by the Dholera SIR Development Authority (DSIRDA).
              </p>
              <p>
                This technical whitepaper establishes an empirical reference framework synthesizing <strong>33,481 cadastre
                records</strong>, <strong>18,161 reconstituted Final Plots</strong>, 27 sanctioned sub-schemes, and the
                statutory 2024 Comprehensive General Development Control Regulations (DGDCR 2024). We provide rigorous
                mathematical formulations of the OP-to-FP land reconstitution algorithm, cross-tabulated zoning matrices, and
                statutory due-diligence protocols for public citation.
              </p>
            </div>

            {/* Metric Highlights */}
            <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-slate-100">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <div className="text-2xl sm:text-3xl font-black text-slate-900">920 km²</div>
                <div className="text-xs text-slate-500 font-medium mt-1">Regional Master Footprint</div>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <div className="text-2xl sm:text-3xl font-black text-blue-600">421.5 km²</div>
                <div className="text-xs text-slate-500 font-medium mt-1">TP 1–6 Developable Area</div>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <div className="text-2xl sm:text-3xl font-black text-slate-900">22</div>
                <div className="text-xs text-slate-500 font-medium mt-1">Revenue Villages</div>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <div className="text-2xl sm:text-3xl font-black text-emerald-600">~50%</div>
                <div className="text-xs text-slate-500 font-medium mt-1">Statutory OP-to-FP Return</div>
              </div>
            </div>
          </article>

          {/* Legal Governance & Tripartite Structure */}
          <section className="rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-10 shadow-xs">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-700 mb-2">
              <Scale className="w-4 h-4" />
              <span>Section 1: Statutory Framework</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Legal Governance Architecture: DSIRDA vs. DICDL vs. Revenue Department
            </h2>
            <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed">
              Urban governance in Dholera SIR is characterized by a tripartite division of statutory authority.
              Conflating these entities is the most frequent source of legal error in title verification and media reporting.
            </p>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* DSIRDA */}
              <div className="p-5 rounded-xl border border-blue-100 bg-blue-50/40 space-y-3">
                <div className="inline-flex p-2.5 rounded-lg bg-blue-600 text-white">
                  <Scale className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">DSIRDA (Planning Authority)</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Established under <strong>Gujarat SIR Act, 2009</strong>. Sovereign regulatory body.
                  Empowered to sanction Town Planning schemes, demarcate Final Plots, enact building bye-laws
                  (DGDCR), approve structural drawings, and issue building use (BU) permits.
                </p>
                <div className="text-xs font-semibold text-blue-700">Legal Document: Form F Allotment Order</div>
              </div>

              {/* DICDL */}
              <div className="p-5 rounded-xl border border-emerald-100 bg-emerald-50/40 space-y-3">
                <div className="inline-flex p-2.5 rounded-lg bg-emerald-600 text-white">
                  <Building2 className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">DICDL (Execution SPV)</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Joint Venture SPV (51% Gujarat Industrial Development Board, 49% National Industrial Corridor
                  Development Corporation Trust). Pure EPC entity. Builds 72km ABCD internal expressways, 20 MLD
                  CETP, subterranean utility ducts, and automated SCADA operations.
                </p>
                <div className="text-xs font-semibold text-emerald-700">Role: Trunk Infrastructure Delivery</div>
              </div>

              {/* Revenue Dept */}
              <div className="p-5 rounded-xl border border-amber-100 bg-amber-50/40 space-y-3">
                <div className="inline-flex p-2.5 rounded-lg bg-amber-600 text-white">
                  <FileText className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Revenue Dept (Collectorate)</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Administers historic land records under the <strong>Gujarat Land Revenue Code, 1879</strong>.
                  Maintains Village Form 7/12 (ownership, tenure, encumbrances) and Village Form 6 (mutation entries)
                  for pre-reconstitution agricultural survey numbers.
                </p>
                <div className="text-xs font-semibold text-amber-700">Portal: Gujarat AnyRoR System</div>
              </div>
            </div>
          </section>

          {/* The Cadastral Reconstitution Algorithm */}
          <section className="rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-10 shadow-xs">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-700 mb-2">
              <Layers className="w-4 h-4" />
              <span>Section 2: Land Reconstitution Mechanics</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              The OP-to-FP Reconstitution Mechanics &amp; Deduction Formula
            </h2>
            <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed">
              Unlike traditional eminent domain land acquisition which displaces original occupants, the Gujarat Town
              Planning model utilizes <em>land pooling and reconstitution</em> under Sections 42–67 of the GTPUD Act, 1976.
            </p>

            {/* Stages */}
            <div className="mt-6 space-y-4">
              {RECONSTITUTION_STEPS.map((step, i) => (
                <div
                  key={step.phase}
                  className="p-4 sm:p-5 rounded-xl border border-slate-200/80 bg-slate-50/50 flex flex-col sm:flex-row sm:items-start justify-between gap-4"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-bold text-slate-900">{step.phase}</span>
                      <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-200 text-slate-700">
                        {step.legal}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{step.description}</p>
                  </div>
                  <div className="sm:text-right shrink-0">
                    <span className="inline-block px-2.5 py-1 rounded-lg bg-blue-100 text-blue-800 text-xs font-bold">
                      {step.reduction}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Deduction Allocation Breakdown */}
            <div className="mt-8 pt-6 border-t border-slate-100">
              <h3 className="text-lg font-bold text-slate-900 mb-4">
                Statutory Breakdown of the 50% Public Land Deduction
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {DEDUCTION_ALLOCATION.map((item) => (
                  <div key={item.purpose} className="p-4 rounded-xl border border-slate-200 bg-white">
                    <div className="text-2xl font-black text-blue-600">{item.share}</div>
                    <div className="text-xs font-bold text-slate-900 mt-1">{item.purpose}</div>
                    <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed">{item.details}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Economic Justification */}
            <div className="mt-6 p-4 rounded-xl bg-blue-50/60 border border-blue-100 text-xs text-blue-900 leading-relaxed">
              <strong>The Urban Economic Equation:</strong> While the landholder surrenders ~50% of raw land area,
              the residual 50% transitions from unserviced agricultural land into serviced, bankable Non-Agricultural (NA)
              commercial/industrial property abutting sanctioned 12m–70m roads with plug-and-play subterranean utilities.
              Historical DSIRDA transaction records document an average 600% to 1,200% appreciation in per-sq-metre valuation
              between Draft notification and Final Plot gazetting.
            </div>
          </section>

          {/* Empirical Inventory Data Table */}
          <section id="inventory-table" className="rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-10 shadow-xs">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-700 mb-2">
              <Table className="w-4 h-4" />
              <span>Section 3: Empirical Cadastral Inventory</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  Town Planning Schemes 1 to 6 Empirical Matrix
                </h2>
                <p className="mt-1 text-xs sm:text-sm text-slate-600">
                  Transcribed directly from gazetted sub-scheme boundary sheets (macro_split.jpg) and DSIRDA cadastre indices.
                </p>
              </div>
              <div className="font-mono text-xs text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg shrink-0">
                DSIRDA Control: 422 sq km
              </div>
            </div>

            {/* Table */}
            <div className="mt-6 overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="bg-slate-900 text-white font-bold">
                    <th className="py-3 px-3 sm:px-4">Scheme</th>
                    <th className="py-3 px-3 sm:px-4">Sub-Schemes</th>
                    <th className="py-3 px-3 sm:px-4">Hectares</th>
                    <th className="py-3 px-3 sm:px-4">Area (km²)</th>
                    <th className="py-3 px-3 sm:px-4">Cadastre Parcels</th>
                    <th className="py-3 px-3 sm:px-4">Base FSI</th>
                    <th className="py-3 px-3 sm:px-4">Max FSI</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {SCHEME_INVENTORY.map((row) => (
                    <tr key={row.scheme} className="hover:bg-blue-50/30 transition">
                      <td className="py-3 px-3 sm:px-4 font-bold text-slate-900">
                        {row.scheme}
                        <div className="text-[11px] font-normal text-slate-500 hidden sm:block">{row.name}</div>
                      </td>
                      <td className="py-3 px-3 sm:px-4 font-mono text-xs text-slate-700">
                        {row.subSchemes} sub-schemes
                      </td>
                      <td className="py-3 px-3 sm:px-4 font-mono font-medium text-slate-900">
                        {Math.round(row.ha).toLocaleString('en-IN')} Ha
                      </td>
                      <td className="py-3 px-3 sm:px-4 font-mono font-bold text-blue-700">
                        {row.sqKm.toFixed(1)} km²
                      </td>
                      <td className="py-3 px-3 sm:px-4 font-mono font-medium text-slate-700">
                        {row.parcels.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-3 sm:px-4 font-mono text-slate-600">{row.fsiBase}</td>
                      <td className="py-3 px-3 sm:px-4 font-mono font-bold text-emerald-600">{row.fsiMax}</td>
                    </tr>
                  ))}
                  <tr className="bg-slate-100 font-bold text-slate-900 border-t-2 border-slate-300">
                    <td className="py-3 px-3 sm:px-4">Total / Control</td>
                    <td className="py-3 px-3 sm:px-4 font-mono text-xs">27 Sub-Schemes</td>
                    <td className="py-3 px-3 sm:px-4 font-mono">
                      {Math.round(TP_TOTAL_HA).toLocaleString('en-IN')} Ha
                    </td>
                    <td className="py-3 px-3 sm:px-4 font-mono text-blue-700">
                      {TP_TOTAL_SQ_KM.toFixed(1)} km²
                    </td>
                    <td className="py-3 px-3 sm:px-4 font-mono">
                      {SCHEME_INVENTORY.reduce((a, b) => a + b.parcels, 0).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-3 sm:px-4 font-mono">—</td>
                    <td className="py-3 px-3 sm:px-4 font-mono text-emerald-600">Up to 5.0</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Scheme Details Sub-section */}
            <div className="mt-8 space-y-3">
              <h3 className="text-base font-bold text-slate-900">Zoning &amp; Industrial Anchor Breakdown</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {SCHEME_INVENTORY.map((s) => (
                  <div key={s.scheme} className="p-4 rounded-xl border border-slate-200/80 bg-white">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-sm">{s.scheme}: {s.name}</span>
                      <span className="text-xs font-mono font-bold text-blue-600">{s.sqKm} km²</span>
                    </div>
                    <div className="mt-2 text-xs text-slate-600 space-y-1">
                      <div><strong>Sub-codes:</strong> {s.subCodes}</div>
                      <div><strong>Villages:</strong> {s.villages}</div>
                      <div><strong>Primary Focus:</strong> {s.focus}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* DGDCR 2024 Development Control Matrix */}
          <section className="rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-10 shadow-xs">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-700 mb-2">
              <Building2 className="w-4 h-4" />
              <span>Section 4: Statutory Building Bye-Laws</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              DGDCR 2024 Road Frontage &amp; Permissible FSI Regulations
            </h2>
            <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed">
              In Dholera SIR, permissible Floor Space Index (FSI / FAR), maximum building height, and ground
              coverage are governed by the abutting sanctioned road width as defined under DGDCR 2024.
            </p>

            <div className="mt-6 overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="bg-slate-900 text-white font-bold">
                    <th className="py-3 px-3 sm:px-4">Road Width (m)</th>
                    <th className="py-3 px-3 sm:px-4">Permitted Zone</th>
                    <th className="py-3 px-3 sm:px-4">Base FSI</th>
                    <th className="py-3 px-3 sm:px-4">Chargeable FSI</th>
                    <th className="py-3 px-3 sm:px-4">Max Achievable FSI</th>
                    <th className="py-3 px-3 sm:px-4">Max Building Height</th>
                    <th className="py-3 px-3 sm:px-4">Max Coverage</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {DGDCR_FSI_RULES.map((rule) => (
                    <tr key={rule.roadWidth} className="hover:bg-slate-50 transition">
                      <td className="py-3 px-3 sm:px-4 font-bold text-slate-900">{rule.roadWidth}</td>
                      <td className="py-3 px-3 sm:px-4 text-slate-700">{rule.zone}</td>
                      <td className="py-3 px-3 sm:px-4 font-mono font-medium text-slate-900">{rule.baseFsi}</td>
                      <td className="py-3 px-3 sm:px-4 font-mono text-slate-600">{rule.chargeableFsi}</td>
                      <td className="py-3 px-3 sm:px-4 font-mono font-bold text-emerald-600">{rule.maxFsi}</td>
                      <td className="py-3 px-3 sm:px-4 font-mono text-blue-700">{rule.maxHeight}</td>
                      <td className="py-3 px-3 sm:px-4 font-mono text-slate-600">{rule.coverage}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 text-xs text-slate-500 italic">
              * Note: Chargeable FSI is purchased from DSIRDA at notified Jantar rates. Heights exceeding 70 metres
              require mandatory clearance from the DSIRDA High-Rise Committee and Airport Authority of India (AAI)
              for proximity to the Navagam Dholera International Airport flight funnel.
            </div>
          </section>

          {/* 4-Point Due Diligence Protocol */}
          <section className="rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-10 shadow-xs">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-700 mb-2">
              <ShieldCheck className="w-4 h-4" />
              <span>Section 5: Investor &amp; Institutional Protocol</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Standard Due Diligence Protocol for Dholera Land Verification
            </h2>
            <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed">
              A 4-step spatial and statutory verification workflow recommended for institutional underwriters,
              legal counsels, and property buyers before executing any land agreement in Dholera SIR.
            </p>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                  <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs">
                    1
                  </span>
                  <span>AnyRoR 7/12 &amp; Mutation Ledger Audit</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Download the current digital 7/12 extract and Village Form 6 from Gujarat AnyRoR portal. Verify the
                  unbroken 30-year chain of title, confirm absence of revenue liens, Tenancy Act Section 63/73AA
                  tribal restrictions, or pending civil litigation.
                </p>
              </div>

              <div className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                  <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs">
                    2
                  </span>
                  <span>DSIRDA Form F (Property Card) Allotment</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Demand the official DSIRDA Form F Allotment Certificate issued by the Town Planning Officer.
                  Verify that the seller’s name matches the reconstituted Final Plot allotment ledger and that the
                  OP-to-FP reconstitution has attained Preliminary or Final statutory sanction.
                </p>
              </div>

              <div className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                  <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs">
                    3
                  </span>
                  <span>Sanctioned Road Frontage &amp; Easement Check</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Examine the sanctioned Town Planning blueprint sheet. Ensure the plot has direct, unhindered frontage
                  onto a sanctioned 12m–70m DSIRDA road. Confirm the parcel does not overlap high-tension electrical
                  lines, Narmada canal corridors, or coastal CRZ buffer setbacks.
                </p>
              </div>

              <div className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                  <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs">
                    4
                  </span>
                  <span>Spatial GIS Vector Validation on DholeraMap</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Search the survey number and FP on DholeraMap’s interactive GIS engine. Inspect high-precision
                  polygon boundaries, coordinate positions, abutting road widths, and proximity to major trunk
                  infrastructure anchors like the Tata Fab or ABCD Highway.
                </p>
              </div>
            </div>
          </section>

          {/* Citation Box Component */}
          <section id="citation">
            <CitationBox />
          </section>

          {/* FAQ Accordion Section */}
          <section className="rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-10 shadow-xs">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-700 mb-2">
              <HelpCircle className="w-4 h-4" />
              <span>Frequently Asked Questions</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Essential Questions on Dholera Land Records &amp; Town Planning
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Clear, definitive answers based on gazetted Gujarat state statutes and DSIRDA regulatory guidelines.
            </p>

            <div className="mt-8 space-y-4">
              {FAQS.map((faq) => (
                <div
                  key={faq.q}
                  className="p-5 rounded-xl border border-slate-200 bg-slate-50/40 space-y-2"
                >
                  <h3 className="text-base font-bold text-slate-900 flex items-start gap-2">
                    <span className="text-blue-600 font-extrabold shrink-0">Q:</span>
                    <span>{faq.q}</span>
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pl-5">
                    {faq.a}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Call to Action: Interactive Atlas */}
          <section className="rounded-2xl bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 text-white p-8 sm:p-12 shadow-sm border border-blue-800/40">
            <div className="max-w-3xl space-y-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold uppercase tracking-wider">
                <Compass className="w-3.5 h-3.5" />
                <span>Interactive Spatial Exploration</span>
              </span>
              <h2 className="text-2xl sm:text-4xl font-black text-white leading-tight">
                Query 33,481 Parcels &amp; 22 Villages on the Interactive GIS Atlas
              </h2>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                Inspect sanctioned Town Planning scheme sheets, search revenue survey numbers, measure abutting
                road widths, and verify DGDCR building regulations directly on our live high-performance GIS engine.
              </p>
              <div className="pt-2 flex flex-wrap gap-3">
                <Link
                  href="/map"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition shadow-xs cursor-pointer"
                >
                  <span>Launch Live Interactive Map</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/dholera-tp-map"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white text-xs font-bold transition cursor-pointer"
                >
                  <span>Download TP 1–6 Blueprint PDFs</span>
                  <Download className="w-4 h-4" />
                </Link>
                <Link
                  href="/embed"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white text-xs font-bold transition cursor-pointer"
                >
                  <span>Embed Map Widget on Your Site</span>
                  <ExternalLink className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </section>
        </div>
      </main>

      <SiteFooter />
    </>
  );
}
