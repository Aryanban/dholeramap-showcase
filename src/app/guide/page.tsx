import type { Metadata } from 'next';
import Link from 'next/link';
import SiteHeader from '@/components/panels/SiteHeader';
import SiteFooter from '@/components/panels/SiteFooter';
import DgdcrFarCalculator from '@/components/portal/DgdcrFarCalculator';
import { tpAreaLabel, TP_PHASE_ONE_SQ_KM } from '@/lib/tp-areas';
import RelatedReading from '@/components/portal/RelatedReading';
import { OG_IMAGE, OG_IMAGE_DIMS } from '@/lib/brand';

export const metadata: Metadata = {
  title: 'Dholera SIR TP Schemes (TP 1–6) & DGDCR Guide | DholeraMap',
  description:
    'Statutory guide to Dholera SIR Town Planning Schemes (TP 1–6), GTPUD Act parcel deductions, road widths (18m–250m), and DGDCR building regulations.',
  keywords: [
    'Dholera TP scheme map',
    'Dholera SIR TP 1 TP 2 TP 3 TP 4 TP 5 TP 6',
    'Dholera interactive survey map',
    'DGDCR 2024 building regulations Dholera',
    'Dholera FAR FSI road width',
    'Dholera revenue survey final plot deduction',
    'Dholera smart city master plan map',
  ],
  alternates: {
    canonical: 'https://dholeramap.com/guide',
  },
  openGraph: {
  title: 'Dholera SIR TP Schemes (TP 1–6) & DGDCR Guide | DholeraMap',
    description:
      'Statutory guide to Dholera SIR TP schemes, road widths, and DGDCR regulations.',
    url: 'https://dholeramap.com/guide',
    siteName: 'DholeraMap',
    images: [
      {
        url: OG_IMAGE,
        width: OG_IMAGE_DIMS.width,
        height: OG_IMAGE_DIMS.height,
        alt: 'Dholera SIR Town Planning Schemes Interactive Guide',
      },
    ],
    locale: 'en_IN',
    type: 'article',
  },
};

const TP_SCHEMES = [
  {
    name: 'Town Planning Scheme 1 (TP 1)',
    sheetId: 'tp1',
    areaHa: tpAreaLabel(1),
    villages: 'Ambli, Kadipur, Bhadiyad, Gogla',
    status: 'Sanctioned Preliminary',
    primaryRoads: '18m, 30m, 55m, 70m',
    dominantZone: 'Residential R1 & Knowledge / IT Hub',
    description:
      'Part of the immediate Activation Area. Features completed underground plug-and-play trunk utilities including recycled water, sensor SCADA, and optic fiber.',
  },
  {
    name: 'Town Planning Scheme 2 (TP 2A & 2B)',
    sheetId: 'tp2',
    areaHa: tpAreaLabel(2),
    villages: 'Hebatpur, Bhadiyad, Bavaliyari',
    status: 'Sanctioned Preliminary',
    primaryRoads: '18m, 30m, 55m, 70m, 250m Expressway',
    dominantZone: 'High Access Corridor, Heavy Industrial & Logistics',
    description:
      'Home to the 250-meter Central Expressway and dedicated freight rail spine. Houses major semiconductor fab clusters and heavy manufacturing zones.',
  },
  {
    name: 'Town Planning Scheme 3 (TP 3)',
    sheetId: 'tp3',
    areaHa: tpAreaLabel(3),
    villages: 'Gorasu, Sandhida, Dholera Central',
    status: 'Sanctioned Draft / Preliminary Review',
    primaryRoads: '18m, 30m, 55m',
    dominantZone: 'Commercial City Center & Mixed-Use Urban',
    description:
      'Central commercial core adjacent to the ancient port town of Dholera. Designated for institutional offices, financial services, and retail high-rises.',
  },
  {
    name: 'Town Planning Scheme 4 (TP 4)',
    sheetId: 'tp4',
    areaHa: tpAreaLabel(4),
    villages: 'Bhangadh, Bhimtalav, Mundi',
    status: 'Sanctioned Preliminary',
    primaryRoads: '18m, 30m, 55m, 70m',
    dominantZone: 'Solar & Renewable Energy, Solar Park Logistics',
    description:
      'Directly abuts the 5,000 MW Dholera Solar Park on the Gulf of Khambhat coastline. Prime location for green hydrogen and clean-tech assemblies.',
  },
  {
    name: 'Town Planning Scheme 5 (TP 5)',
    sheetId: 'tp5',
    areaHa: tpAreaLabel(5),
    villages: 'Sangasar, Umargadh, Zankhi',
    status: 'Sanctioned Draft',
    primaryRoads: '18m, 30m, 55m',
    dominantZone: 'Aerotropolis Support, Aviation MRO & Logistics',
    description:
      'Positioned along the northern boundary approaching the Dholera International Airport at Navagam. Optimized for air cargo, packaging, and aerospace supply lines.',
  },
  {
    name: 'Town Planning Scheme 6 (TP 6)',
    sheetId: 'tp6',
    areaHa: tpAreaLabel(6),
    villages: 'Khun, Bavaliyari South, Otariya',
    status: 'Sanctioned Draft',
    primaryRoads: '18m, 30m, 55m',
    dominantZone: 'Coastal Industrial & Heavy Engineering Hub',
    description:
      'Southernmost industrial zone providing logistical gateway connections toward Bhavnagar and the deep-sea shipping maritime channels.',
  },
];

const DGDCR_MATRIX = [
  { roadWidth: '12m to < 18m', baseFar: '1.20', maxFar: '1.80', maxCover: '45%', maxHeight: '16.5m (G+4)' },
  { roadWidth: '18m to < 30m', baseFar: '1.50', maxFar: '2.10', maxCover: '40%', maxHeight: '25.0m (G+7)' },
  { roadWidth: '30m to < 55m', baseFar: '1.80', maxFar: '2.50', maxCover: '35%', maxHeight: '45.0m (G+14)' },
  { roadWidth: '55m to 70m', baseFar: '2.00', maxFar: '3.00', maxCover: '30%', maxHeight: '70.0m+' },
  { roadWidth: '250m Expressway', baseFar: '2.50', maxFar: '4.00', maxCover: '30%', maxHeight: 'Iconic / High-Rise G+24+' },
];

const FAQS = [
  {
    q: 'How does an agricultural Revenue Survey Number convert into a Final Plot (FP)?',
    a: 'Under the Gujarat Town Planning and Urban Development (GTPUD) Act 1976, original revenue survey agricultural parcels (Original Plots or OP) undergo statutory reconstitution. An average 50% land contribution is deducted for arterial roads, civic amenities, green open spaces, and utility corridors. The land owner is allotted a regularized, fully serviced Final Plot (FP) representing the remaining ~50% net area, cross-referenced in statutory Form 4 and Form 5 Gazette schedules.',
  },
  {
    q: 'What is the width of the central arterial expressway in Dholera TP 2?',
    a: 'The central arterial spine running through Town Planning Scheme 2A and 2B is a 250-meter-wide multi-modal transit corridor. It integrates a 10-lane access-controlled expressway, high-speed regional rapid rail (RRTS) connectivity to Ahmedabad, dedicated freight rail lines, and underground utility conduits.',
  },
  {
    q: 'What are the permissible Floor Area Ratio (FAR / FSI) limits under DGDCR?',
    a: 'Permissible FAR is governed by abutting road right-of-way under the Comprehensive General Development Control Regulations (DGDCR). Roads under 18m allow a base FAR of 1.2 to 1.5, while roads of 30m to 70m permit maximum chargeable FAR ranging from 2.50 to 3.00, enabling commercial high-rises up to 45m to 70m.',
  },
  {
    q: 'Can NRIs and institutional buyers verify plot boundaries online?',
    a: 'Yes. PlotBook at dholeramap.com provides an open-access 60 FPS vector tile interactive atlas covering 18,161 revenue survey parcels and all six Town Planning schemes. Users can search by Revenue Survey Number or Final Plot (FP) number to instantly locate parcels, inspect boundary dimensions, and review abutting road widths.',
  },
  {
    q: 'What is the statutory difference between TP 1 and TP 2 in Dholera SIR?',
    a: `TP 1 (${tpAreaLabel(1)}) represents the primary residential and administrative Activation Area with plug-and-play ABCD building headquarters, whereas TP 2 (${tpAreaLabel(2)}) is the manufacturing mega-hub featuring the semiconductor wafer fab corridor, 250m expressway frontage, and heavy logistics zoning. Together the two form Phase I, ${TP_PHASE_ONE_SQ_KM} sq km of the SIR.`,
  },
];

export default function InteractiveGuidePage() {
  const schemaArticle = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'Dholera SIR Town Planning Schemes (TP 1–6) & DGDCR Building Regulations (2026)',
    description:
      'Authoritative statutory guide to Dholera SIR Town Planning Schemes, parcel deduction math, abutting road widths, and DGDCR 2024 building control envelope parameters.',
    author: {
      '@type': 'Person',
      name: 'Aryan Bansal',
      url: 'https://www.webforge.me/',
    },
    publisher: {
      '@type': 'Organization',
      name: 'PlotBook Dholera Interactive Authority',
      url: 'https://dholeramap.com',
      logo: {
        '@type': 'ImageObject',
        url: 'https://dholeramap.com/logo.png',
        creator: {
          '@type': 'Organization',
          name: 'PlotBook Dholera Interactive Authority',
          url: 'https://dholeramap.com',
        },
        copyrightNotice: '© 2026 DholeraMap. All rights reserved.',
        creditText: 'DholeraMap — Official Dholera SIR Interactive GIS Atlas',
        license: 'https://dholeramap.com/terms',
        acquireLicensePage: 'https://dholeramap.com/terms',
      },
    },
    datePublished: '2026-09-17T00:00:00+05:30',
    dateModified: '2026-09-17T15:30:00+05:30',
    mainEntityOfPage: 'https://dholeramap.com/guide',
  };

  const schemaFaq = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQS.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: f.a,
      },
    })),
  };

  const schemaBreadcrumbs = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://dholeramap.com/',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Interactive Guide',
        item: 'https://dholeramap.com/guide',
      },
    ],
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col font-sans">
      {/* Microdata Scripts */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaArticle) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaFaq) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaBreadcrumbs) }}
      />

      <SiteHeader activePage="guide" />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-xs font-semibold text-slate-400">
          <Link href="/" className="hover:text-blue-600 transition">Home</Link>
          <span>/</span>
          <span className="text-slate-700">Authoritative Interactive Guide</span>
        </nav>

        {/* Hero Header */}
        <header className="space-y-4 border-b border-slate-200 pb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold">
            <span>Official Interactive Research</span>
            <span>·</span>
            <span>Updated September 2026</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-950 leading-tight">
            Dholera SIR Town Planning Schemes (TP 1–6) &amp; DGDCR Building Regulations Explained
          </h1>

          {/* AEO Inverted Pyramid Definition Paragraph (45-55 words) */}
          <div className="p-5 rounded-2xl bg-blue-50/60 border border-blue-200/80 text-slate-800 text-sm sm:text-base leading-relaxed font-medium">
            <strong className="text-blue-900 block mb-1 text-xs uppercase tracking-wider font-black">Direct Interactive Definition</strong>
            Dholera SIR Town Planning Schemes (TP 1 to TP 6) constitute the statutory land reconstitution framework under the Gujarat Town Planning and Urban Development (GTPUD) Act 1976. They divide 920 sq km into sanctioned sub-sectors with standardized 18m to 250m arterial roads, designated land zones, and statutory FSI from 1.8 to 2.5. Inspect every Final Plot on the <Link href="/dholera-tp-map" className="text-blue-700 font-semibold underline decoration-blue-300 underline-offset-2 hover:text-blue-900">TP map in Dholera</Link>, or download the gazetted <Link href="/dholera-tp-map" className="text-blue-700 font-semibold underline decoration-blue-300 underline-offset-2 hover:text-blue-900">Dholera SIR map PDF</Link> for offline reference.
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-2">
            <span>By <strong>Aryan Bansal</strong></span>
            <span>·</span>
            <span>GIS Specialist</span>
            <span>·</span>
            <span>Peer-Reviewed by Statutory GTPUD Gazettes</span>
          </div>
        </header>

        {/* Section 1: Overview & Land Deduction Math */}
        <section className="space-y-4">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            1. The Statutory Land Reconstitution Mechanism (OP to FP)
          </h2>
          <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
            When developing greenfield smart cities in Gujarat, the state enacts Town Planning (TP) Schemes under the <strong>Gujarat Town Planning and Urban Development Act (GTPUD) 1976</strong>. Unlike compulsory land acquisition, Town Planning uses a democratic reconstitution model:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <span className="text-[10px] font-bold uppercase text-slate-400">Step 1: Original Plot</span>
              <h3 className="text-base font-black text-slate-900 mt-1">Revenue Survey (OP)</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Irregularly shaped agricultural land parcel with historic revenue village records (e.g., Ambli Survey 102).
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <span className="text-[10px] font-bold uppercase text-amber-500">Step 2: 50% Deduction</span>
              <h3 className="text-base font-black text-slate-900 mt-1">Statutory Contribution</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                ~50% of the land area is surrendered for public utilities: 18m–70m roads, water treatment plants, power substations, and civic parks.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <span className="text-[10px] font-bold uppercase text-emerald-600">Step 3: Final Plot</span>
              <h3 className="text-base font-black text-slate-900 mt-1">Sanctioned FP</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Geometric, regularized parcel allotted back to the owner with road frontage, higher commercial valuation, and immediate non-agricultural building rights.
              </p>
            </div>
          </div>
        </section>

        {/* Section 2: TP 1 to TP 6 Detailed Comparison Table */}
        <section className="space-y-4">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            2. Complete Breakdown of Town Planning Schemes (TP 1 to TP 6)
          </h2>
          <p className="text-sm text-slate-600">
            The table below synthesizes the sanctioned spatial parameters for all 6 TP schemes across the 22 revenue villages in the Dholera Special Investment Region. Every scheme boundary, survey number and Final Plot shown here can be searched on the interactive <Link href="/" className="text-blue-600 font-semibold underline decoration-blue-300 underline-offset-2 hover:text-blue-900">Dholera map</Link>.
          </p>

          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-xs">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold">
                  <th className="p-3.5">TP Scheme</th>
                  <th className="p-3.5">Covered Villages</th>
                  <th className="p-3.5">Area (Ha)</th>
                  <th className="p-3.5">Road Network</th>
                  <th className="p-3.5">Dominant Zone</th>
                  <th className="p-3.5 text-right">Interactive Atlas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {TP_SCHEMES.map((tp) => (
                  <tr key={tp.sheetId} className="hover:bg-slate-50/75 transition">
                    <td className="p-3.5 font-bold text-slate-950">{tp.name}</td>
                    <td className="p-3.5 text-slate-600">{tp.villages}</td>
                    <td className="p-3.5 font-mono text-slate-800">{tp.areaHa}</td>
                    <td className="p-3.5">{tp.primaryRoads}</td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-medium text-[11px] border border-blue-100">
                        {tp.dominantZone.split('&')[0]}
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      <Link
                        href={`/?sheet=${tp.sheetId}`}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-lg transition"
                      >
                        <span>Fly Map</span>
                        <span>→</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Section 3: DGDCR Building Envelope & FAR Matrix */}
        <section className="space-y-6">
          <DgdcrFarCalculator />

          <div className="space-y-2 pt-4">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              DGDCR Statutory Reference Table (Comprehensive Regulations)
            </h2>
            <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
              The <strong>Comprehensive General Development Control Regulations (DGDCR)</strong> control maximum permissible built-up area (Floor Area Ratio / FAR) and vertical building heights based on abutting road right-of-way (ROW):
            </p>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-xs">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold">
                  <th className="p-3.5">Abutting Road Width (ROW)</th>
                  <th className="p-3.5">Base FAR</th>
                  <th className="p-3.5">Maximum Chargeable FAR</th>
                  <th className="p-3.5">Max Ground Coverage</th>
                  <th className="p-3.5">Max Permissible Height</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-slate-700">
                {DGDCR_MATRIX.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/75 transition">
                    <td className="p-3.5 font-sans font-bold text-slate-950">{row.roadWidth}</td>
                    <td className="p-3.5">{row.baseFar}</td>
                    <td className="p-3.5 font-bold text-blue-700">{row.maxFar}</td>
                    <td className="p-3.5">{row.maxCover}</td>
                    <td className="p-3.5 font-sans font-semibold text-slate-800">{row.maxHeight}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs leading-relaxed space-y-1">
            <strong>Key Statutory Rule:</strong> Chargeable FAR beyond the base allowance is procured via payment of Betterment Levy / FSI Purchase charges directly to the Dholera Industrial City Development Limited (DICDL) authority account prior to issuance of the Commencement Certificate.
          </div>
        </section>

        {/* Section 4: Deep Interactive Search Interactive CTA */}
        <section className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 text-slate-900 shadow-xs space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200">
            <span>18,161 Verified Parcels</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
            Verify Any Dholera Plot or Survey Number Instantly
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
            Search by revenue survey number, village name (e.g. Hebatpur, Bhadiyad, Ambli), or Final Plot (FP) number to open the high-resolution vector tile interactive map, measure frontage road width, and calculate estimated DGDCR built-up potential.
          </p>
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <Link
              href="/"
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-md shadow-blue-600/20 inline-flex items-center gap-2 cursor-pointer"
            >
              <span>Launch Interactive Map</span>
              <span>→</span>
            </Link>
            <Link
              href="/dashboard"
              className="px-5 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition border border-slate-300 inline-flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <span>Saved Plots Portfolio CRM</span>
            </Link>
          </div>
        </section>

        {/* Section 5: Authoritative FAQs (Structured for AEO) */}
        <section className="space-y-6">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            4. Frequently Asked Questions (Statutory &amp; Investment Inquiries)
          </h2>

          <div className="space-y-4">
            {FAQS.map((faq, idx) => (
              <div key={idx} className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
                <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-start gap-2">
                  <span className="text-blue-600 font-mono">Q:</span>
                  <span>{faq.q}</span>
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pl-6">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* SEO: pass internal authority from this pillar down into the article
            cluster. This page shipped with zero outbound links to /blog, which
            left page-1-ranking articles (e.g. the Tata fab status post at
            position 4.88) structurally orphaned from the site's most
            authoritative planning document. */}
        <RelatedReading
          categories={['Town Planning', 'Building Regulations', 'Land Records']}
          title="Town planning guides"
          intro="Long-form guides from the DholeraMap editorial desk on the schemes, zoning rules and land records covered above."
        />
      </main>

      <SiteFooter />
    </div>
  );
}
