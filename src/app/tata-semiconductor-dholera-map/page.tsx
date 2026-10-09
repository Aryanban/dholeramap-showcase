import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Cpu, MapPin, Zap, CheckCircle2, ArrowRight, ShieldCheck, Factory, HelpCircle, Layers, Building2, Sparkles } from 'lucide-react';
import SiteHeader from '@/components/panels/SiteHeader';
import SiteFooter from '@/components/panels/SiteFooter';
import TataFabExplorer from '@/components/portal/TataFabExplorer';
import { hreflang, pageDescription } from '@/lib/brand';

export const metadata: Metadata = {
  // Title front-loaded: GSC shows pos 4.96 with 27 impressions but only 1 click,
  // which is a truncation problem, not a ranking problem. The old 85-char title
  // cut off after "Exact Location…" and buried the TP 2 commercial hook.
  // Kept under ~58 chars before the brand suffix so the searchable phrase and the
  // differentiator both survive the SERP fold.
  title: 'Tata Semiconductor Dholera Plant Map: Exact Location & TP 2 | DholeraMap',
  description: pageDescription(
    'Exact location map of the ₹91,000 Cr Tata Semiconductor plant in Dholera SIR: TP 2 Activation Area coordinates, site boundary, nearby villages and vendor plots on interactive GIS.',
    'Tata Semiconductor plant location in Dholera SIR: TP 2 Activation Area site boundary, nearby villages and surrounding plots on the interactive map.',
  ),
  keywords: [
    'tata semiconductor plant dholera location',
    'Tata Semiconductor Dholera',
    'Tata semiconductor fab Dholera map',
    'Dholera semiconductor plant location',
    'Tata Dholera fab TP 2',
    'Dholera SIR semiconductor hub',
    'Tata Electronics Dholera',
    'Dholera fab plots map',
  ],
  alternates: {
    canonical: 'https://dholeramap.com/tata-semiconductor-dholera-map',
    languages: hreflang('https://dholeramap.com/tata-semiconductor-dholera-map'),
  },
  openGraph: {
    title: 'Tata Semiconductor Dholera Map: Plant & TP 2 | DholeraMap',
    description: pageDescription(
      'Tata Semiconductor plant location in Dholera SIR: TP 2 Activation Area site boundary, nearby villages and surrounding plots on the interactive map.',
    ),
    url: 'https://dholeramap.com/tata-semiconductor-dholera-map',
    siteName: 'DholeraMap',
    images: ['/og-image.png'],
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tata Semiconductor Dholera Map: Plant & TP 2 | DholeraMap',
    description: pageDescription(
      'Tata Semiconductor plant in Dholera SIR: TP 2 Activation Area coordinates and surrounding plots on the interactive map.',
    ),
    images: ['/og-image.png'],
  },
};

const tataJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@context': 'https://schema.org',
      '@type': 'Article',
      '@id': 'https://dholeramap.com/tata-semiconductor-dholera-map#article',
      url: 'https://dholeramap.com/tata-semiconductor-dholera-map',
      headline: 'Tata Semiconductor Fab in Dholera SIR: Exact Map Location & Real Estate Impact',
      description:
        'Geospatial analysis, plot coordinates, and real estate investment dynamics surrounding the ₹91,000 Crore Tata Electronics semiconductor plant in Dholera Activation Area.',
      author: {
        '@type': 'Person',
        name: 'Aryan Bansal',
        url: 'https://dholeramap.com/about',
      },
      datePublished: '2026-09-12',
      dateModified: '2026-09-19',
      publisher: {
        '@type': 'Organization',
        name: 'PlotBook DholeraMap',
        url: 'https://dholeramap.com',
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'Place',
      '@id': 'https://dholeramap.com/tata-semiconductor-dholera-map#place',
      name: 'Tata Electronics Semiconductor Fabrication Facility',
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Activation Area, TP 2',
        addressRegion: 'Gujarat',
        addressCountry: 'IN',
      },
      geo: {
        '@type': 'GeoCoordinates',
        latitude: '22.2530',
        longitude: '72.1850',
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      '@id': 'https://dholeramap.com/tata-semiconductor-dholera-map#faq',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'Where is the Tata Semiconductor plant located in Dholera?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'The Tata Electronics semiconductor plant is situated in the 22.54 sq. km Activation Area within Town Planning Scheme 2 (TP 2) in Dholera SIR, Gujarat. It sits adjacent to the 250m Central Spine Road with dedicated high-voltage power sub-stations and industrial water pipelines.',
          },
        },
        {
          '@type': 'Question',
          name: 'What is the total investment in the Tata Dholera semiconductor fab?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'The plant represents a joint capital investment of ₹91,000 Crore (approx. $11 Billion USD) by Tata Electronics and Taiwan’s Powerchip Semiconductor Manufacturing Corporation (PSMC), subsidized under the Government of India’s India Semiconductor Mission (ISM).',
          },
        },
        {
          '@type': 'Question',
          name: 'Which residential zones and villages are closest to the Tata Fab?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'The closest residential and high-access zones are situated in TP 1 and the western sectors of TP 2, covering revenue villages including Kadipur, Bhimnath, Ambli, and Hebatpur. These areas are master-planned for engineer townships, executive housing, and commercial hospitality.',
          },
        },
        {
          '@type': 'Question',
          name: 'What types of semiconductor chips will be manufactured at Dholera?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'The fab will manufacture power management ICs, display drivers, microcontrollers (MCUs), and high-performance computing chips using 28nm, 40nm, 55nm, and 90nm process nodes, serving automotive, computing, telecommunications, and defense sectors.',
          },
        },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      '@id': 'https://dholeramap.com/tata-semiconductor-dholera-map#breadcrumb',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: 'https://dholeramap.com',
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Tata Semiconductor Map',
          item: 'https://dholeramap.com/tata-semiconductor-dholera-map',
        },
      ],
    },
  ],
};

const FAB_SPECS = [
  { label: 'Total Capital Outlay', value: '₹91,000 Crore (~$11 Billion USD)' },
  { label: 'Joint Venture Partner', value: 'PSMC (Powerchip Semiconductor, Taiwan)' },
  { label: 'Location Zone', value: 'TP 2 Activation Area, Industrial Zone' },
  { label: 'Site Land Area', value: '~160 Acres (Dedicated Mega Parcel)' },
  { label: 'Monthly Production Capacity', value: 'Up to 50,000 Wafers / Month' },
  { label: 'Technology Nodes', value: '28nm, 40nm, 55nm, 90nm' },
  { label: 'Direct & Indirect Jobs', value: '20,000+ Skilled Engineering Roles' },
  { label: 'Power & Water Supply', value: 'Dual-feed 400kV Grid + 100 MLD Recycled RO Water' },
];

export default function TataSemiconductorDholeraPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(tataJsonLd) }}
      />
      <SiteHeader />

      {/* Hero */}
      <section className="bg-gradient-to-b from-cyan-50/70 via-slate-50 to-white text-slate-900 py-12 sm:py-16 px-4 sm:px-6 lg:px-8 border-b border-cyan-100">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-100/80 border border-cyan-200 text-cyan-900 text-xs font-black tracking-wide uppercase">
            <Cpu className="w-3.5 h-3.5 text-cyan-700" />
            ₹91,000 Cr Semiconductor Catalyst · TP 2 Activation Area
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            Tata Semiconductor Dholera Plant Map: Exact Location &amp; Surrounding Plots
          </h1>

          {/* Inverted Pyramid AEO Direct-Answer Block */}
          <div className="bg-white border border-cyan-200/90 rounded-2xl p-5 sm:p-6 shadow-xs">
            <div className="text-xs font-black uppercase tracking-wider text-cyan-800 mb-2 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-cyan-600" />
              Geospatial Coordinates &amp; Project Footprint
            </div>
            <p className="text-sm sm:text-base leading-relaxed text-slate-700 font-medium">
              The Tata Semiconductor Fab is located in the TP 2 Activation Area of Dholera SIR, Gujarat (approx. 22.25°N, 72.18°E). Spanning over 160 acres with a ₹91,000 Crore investment with Powerchip Semiconductor (PSMC), the facility is flanked by a 70m arterial road and connects directly to the 250m Central Spine. Trace the fab&apos;s exact plot boundary and abutting road widths on the <Link href="/dholera-tp-map" className="text-blue-600 font-semibold underline decoration-blue-500/60 underline-offset-2 hover:text-blue-800">TP map in Dholera</Link>.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-cyan-700 hover:bg-cyan-800 text-white font-bold text-sm shadow-md shadow-cyan-700/20 transition transform hover:-translate-y-0.5"
            >
              <Cpu className="w-4 h-4" />
              Inspect Tata Fab Site in Vector Map
            </Link>
            <Link
              href="/dholera-plot-price"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-bold text-sm shadow-xs transition"
            >
              View TP 2 Land Valuation
              <ArrowRight className="w-4 h-4 text-slate-500" />
            </Link>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
        {/* Interactive Showcase & Wafer Explorer */}
        <TataFabExplorer />

        {/* Section 1: Project Specs Table */}
        <section className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Tata-PSMC Semiconductor Mega Fab: Project Specifications
            </h2>
            <p className="text-sm text-slate-600">
              Approved under the India Semiconductor Mission (ISM) with central and Gujarat state government capital incentives.
            </p>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-2xl bg-white shadow-xs">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="bg-slate-100/80 text-slate-700 font-bold border-b border-slate-200">
                  <th className="p-4">Key Parameter</th>
                  <th className="p-4">Official Project Specification</th>
                  <th className="p-4">Interactive / Infrastructure Impact</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {FAB_SPECS.map((spec, idx) => (
                  <tr key={idx} className="hover:bg-blue-50/40 transition">
                    <td className="p-4 font-bold text-slate-900">{spec.label}</td>
                    <td className="p-4 font-mono font-bold text-blue-700">{spec.value}</td>
                    <td className="p-4 text-xs text-slate-600">
                      {idx === 0 && 'Drives immediate industrial land appreciation across entire TP 2.'}
                      {idx === 1 && 'Brings global Taiwanese semiconductor manufacturing supply chain.'}
                      {idx === 2 && 'Fully developed underground ICT ducts, drainage, and effluent systems.'}
                      {idx === 3 && 'Largest single manufacturing land allotment in Dholera SIR to date.'}
                      {idx === 4 && 'High continuous demand for clean water, clean electricity, and gases.'}
                      {idx === 5 && 'Covers critical automotive EV, smartphone, and smart grid components.'}
                      {idx === 6 && 'Creates massive demand for executive housing in TP 1 and TP 2 residential zones.'}
                      {idx === 7 && 'Dedicated non-stop power grid directly tied to 5000MW Dholera Solar Park.'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Section 2: Real Estate Impact on Surrounding Zones */}
        <section className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Real Estate Catalyst Impact: Which Plots Benefit Most?
            </h2>
            <p className="text-sm text-slate-600">
              The establishment of India&apos;s first commercial semiconductor fab triggers a direct ripple effect on land values across four key areas:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <Building2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">TP 1 &amp; TP 2 Residential Zones (R1 / R2)</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                With an estimated 20,000+ engineers, researchers, and technician families relocating to Dholera, residential parcels in TP 1 (along the 55m and 70m access roads) and TP 2 are experiencing high developer acquisition for gated townships and executive villas.
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center font-bold">
                <Factory className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Ancillary &amp; Vendor Supply Chain Parks</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Semiconductor manufacturing requires hundreds of Tier-1 and Tier-2 suppliers for specialty gases, ultrapure chemicals, wafer testing, packaging, and clean room equipment. Industrial plots abutting the 70m corridor in TP 2 and TP 4 are slated for these supplier parks.
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <MapPin className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Revenue Villages: Kadipur, Bhimnath &amp; Ambli</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Agricultural revenue surveys bordering the Activation Area in Kadipur, Bhimnath, and Ambli are the primary beneficiaries of road widening and early Town Planning reconstitution, making them top targets for long-term land banking.
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">High-Access Commercial Corridors (HAC)</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Parcels along the 250m Central Spine connecting the Tata Fab to the Ahmedabad-Dholera Expressway allow high FAR (up to 5.0) and are designated for corporate offices, business hotels, retail malls, and logistics centers.
              </p>
            </div>
          </div>
        </section>

        {/* Section 3: Interactive Verification Banner */}
        <section className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-10 shadow-sm space-y-6">
          <div className="space-y-3">
            <span className="text-xs font-black uppercase tracking-wider text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200 inline-block">
              Interactive Geospatial Due Diligence
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              Inspect Land Parcels Near the Tata Fab on DholeraMap
            </h2>
            <p className="text-sm text-slate-600 max-w-3xl leading-relaxed">
              Use our live 60fps vector viewer to cross-reference any survey number or Final Plot in TP 2. Check exact road frontage, distance to the semiconductor plant boundary, and DGDCR setback regulations.
            </p>
          </div>
          <div className="pt-2 flex flex-wrap gap-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs shadow-md transition"
            >
              <Cpu className="w-4 h-4 text-white" />
              Open Interactive Tata Fab Map
            </Link>
            <Link
              href="/dholera-tp-map"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs border border-slate-300 shadow-xs transition"
            >
              Download TP 2 Blueprint PDF
            </Link>
          </div>
        </section>

        {/* Section 4: FAQ Section */}
        <section className="space-y-6 pt-4 border-t border-slate-200">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-blue-600">
              <HelpCircle className="w-4 h-4" />
              Frequently Asked Questions
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Tata Semiconductor Plant in Dholera FAQs
            </h2>
          </div>

          <div className="space-y-4">
            {[
              {
                q: 'Where is the Tata Semiconductor plant located in Dholera?',
                a: 'The Tata Electronics semiconductor plant is situated in the 22.54 sq. km Activation Area within Town Planning Scheme 2 (TP 2) in Dholera SIR, Gujarat. It sits adjacent to the 250m Central Spine Road with dedicated high-voltage power sub-stations and industrial water pipelines.',
              },
              {
                q: 'What is the total investment in the Tata Dholera semiconductor fab?',
                a: 'The plant represents a joint capital investment of ₹91,000 Crore (approx. $11 Billion USD) by Tata Electronics and Taiwan’s Powerchip Semiconductor Manufacturing Corporation (PSMC), subsidized under the Government of India’s India Semiconductor Mission (ISM).',
              },
              {
                q: 'Which residential zones and villages are closest to the Tata Fab?',
                a: 'The closest residential and high-access zones are situated in TP 1 and the western sectors of TP 2, covering revenue villages including Kadipur, Bhimnath, Ambli, and Hebatpur. These areas are master-planned for engineer townships, executive housing, and commercial hospitality.',
              },
              {
                q: 'What types of semiconductor chips will be manufactured at Dholera?',
                a: 'The fab will manufacture power management ICs, display drivers, microcontrollers (MCUs), and high-performance computing chips using 28nm, 40nm, 55nm, and 90nm process nodes, serving automotive, computing, telecommunications, and defense sectors.',
              },
            ].map((faq, idx) => (
              <div key={idx} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-2">
                <h3 className="text-sm sm:text-base font-bold text-slate-900">{faq.q}</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
