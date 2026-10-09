import React from 'react';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Map, Layers, Download, CheckCircle2, ArrowRight, Compass, FileText, ChevronRight, HelpCircle } from 'lucide-react';
import SiteHeader from '@/components/panels/SiteHeader';
import SiteFooter from '@/components/panels/SiteFooter';
import TownPlanningExplorer from '@/components/portal/TownPlanningExplorer';
import RelatedReading from '@/components/portal/RelatedReading';
import { hreflang, pageDescription } from '@/lib/brand';
import { TP_SUB_SCHEMES, tpAreaLabel } from '@/lib/tp-areas';

export const metadata: Metadata = {
  // 18 impressions at pos 21.33 with 0 clicks. Tightened from 65 chars so
  // Front-load "Dholera TP Map PDF Download" — highest-volume search intent
  title: 'Dholera TP Map PDF Download: TP 1, 2, 3, 4, 5, 6 Maps | DholeraMap',
  description: pageDescription(
    'Download official Dholera SIR TP map PDF & interactive GIS: sanctioned TP 1 to TP 6 scheme blueprints, Final Plots, road widths and DGDCR zoning across 22 villages.',
    'Download official Dholera SIR TP map PDF: sanctioned TP 1-6 scheme blueprints, Final Plots, road widths and interactive GIS.',
  ),
  keywords: [
    'Dholera SIR map PDF',
    'Dholera map PDF',
    'TP map in Dholera',
    'Town planning map in Dholera',
    'Dholera TP map',
    'Dholera TP scheme map',
    'Dholera TP 1 TP 2 TP 3 TP 4 TP 5 TP 6',
    'Dholera town planning scheme map',
    'Dholera final plot map',
    'Dholera interactive map TP schemes',
    'Dholera master plan PDF',
    'Dholera SIR planning map',
  ],
  alternates: {
    canonical: 'https://dholeramap.com/dholera-tp-map',
    // "dholera map", "dholera tp map" and "nh 751 highway route map" all draw
    // international impressions (NL/CH/KR/ID at pos 3-7.5) that converted to
    // zero clicks. Consolidating the language/locale signals recovers them.
    languages: hreflang('https://dholeramap.com/dholera-tp-map'),
  },
  openGraph: {
    title: 'Dholera SIR Map PDF & TP Map (TP 1-6) | DholeraMap',
    description:
      'The town planning map in Dholera: download the Dholera SIR map PDF and inspect sanctioned TP 1-6 scheme blueprints, Final Plots and interactive GIS.',
    url: 'https://dholeramap.com/dholera-tp-map',
    siteName: 'DholeraMap',
    images: ['/og-image.png'],
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Dholera SIR Map PDF & TP Map (TP 1-6) | DholeraMap',
    description:
      'Download the Dholera SIR map PDF and explore the town planning map in Dholera across TP 1-6 schemes.',
    images: ['/og-image.png'],
  },
};

/**
 * Server-rendered blueprint gallery data for the image sitemap.
 *
 * Kept in this page (a server component) rather than reusing the client
 * component's internal SCHEMES array, so the images are present in the initial
 * HTML response and are independently crawlable. The `image` paths here MUST
 * stay in sync with the IMAGE_SITEMAP registry in src/app/sitemap.ts.
 */
const SCHEME_GALLERY = [
  {
    id: 'tp1',
    name: 'TP 1 — Residential & Knowledge',
    tagline: 'Residential townships, knowledge corridor and executive housing.',
    areaHa: tpAreaLabel(1),
    status: 'Preliminary Sanctioned',
    image: '/maps/schemes/dholera_tp1.jpg',
  },
  {
    id: 'tp2',
    name: 'TP 2 — Activation Area & Mega-Fab Hub',
    tagline: 'High-tech industrial core, the Tata fab site and the ABCD complex.',
    areaHa: tpAreaLabel(2),
    status: 'Operational Infrastructure',
    image: '/maps/schemes/dholera_tp2.jpg',
  },
  {
    id: 'tp3',
    name: 'TP 3 — City Centre & Commercial',
    tagline: 'City centre commercial core and general industrial belt.',
    areaHa: tpAreaLabel(3),
    status: 'Preliminary Sanctioned',
    image: '/maps/schemes/dholera_tp3.jpg',
  },
  {
    id: 'tp4',
    name: 'TP 4 — Solar Park & Knowledge',
    tagline: 'Solar park, logistics corridor and the knowledge corridor.',
    areaHa: tpAreaLabel(4),
    status: 'Sanctioned Preliminary',
    image: '/maps/schemes/dholera_tp4.jpg',
  },
  {
    id: 'tp5',
    name: 'TP 5 — Mega Industrial & Aerospace',
    tagline: 'Mega industrial parcels, defense aerospace and port-linked industry.',
    areaHa: tpAreaLabel(5),
    status: 'Sanctioned Preliminary',
    image: '/maps/schemes/dholera_tp5.jpg',
  },
  {
    id: 'tp6',
    name: 'TP 6 — Logistics CFS & Cargo City',
    tagline: 'Cargo airport city, MRO, free-trade warehousing and CFS plots.',
    areaHa: tpAreaLabel(6),
    status: 'Sanctioned Preliminary',
    image: '/maps/schemes/dholera_tp6.jpg',
  },
  // Regional overviews. These are the highest-intent image-search assets on the
  // site ("dholera map", "dholera village map") and were previously only
  // reachable as Leaflet tiles, i.e. invisible to image indexing.
  {
    id: 'macro-villages',
    name: 'Dholera SIR — All 22 Villages',
    tagline: 'Regional overview of every revenue village against the six TP schemes.',
    areaHa: '920 sq km SIR',
    status: 'Statutory Regional Framework',
    image: '/maps/schemes/macro_villages.jpg',
  },
  {
    id: 'macro-split',
    name: 'TP Sub-Scheme Split Map (TP 1A to TP 6B)',
    tagline: 'All 27 sanctioned sub-schemes with hectare areas, from TP 1A-1 through TP 6B.',
    areaHa: 'TP 1A-1 to TP 6B',
    status: 'Sub-Scheme Boundaries & Areas',
    image: '/maps/schemes/macro_split.jpg',
  },
  {
    id: 'macro-land-use',
    name: 'Dholera SIR Master Land Use',
    tagline: 'Statutory land use and regional framework for the Special Investment Region.',
    areaHa: '920 sq km SIR',
    status: 'Statutory Regional Framework',
    image: '/maps/schemes/macro_land_use.jpg',
  },
];

/**
 * The 27 sanctioned sub-schemes, transcribed from the published sub-scheme
 * boundary sheet (public/maps/schemes/macro_split.jpg) so the boundaries and
 * hectare areas are machine-readable rather than locked inside a bitmap.
 *
 * This is the data the "Dholera SIR map PDF" sub-TP queries ask for, and it
 * directly supports the FAQ on this page about downloading sub-TP blueprints.
 * `hc` is the source sheet's own unit (hectare, as printed on the gazetted
 * drawing) — do NOT silently convert to sq km; buyers compare against the
 * drawing itself.
 */
// Sub-scheme data now lives in src/lib/tp-areas.ts, which is the single
// source of truth and is validated against the two DSIRDA control totals
// (422 sq km for TP 1-6, 153 sq km for Phase I / TP1+TP2). This page must not
// keep a private copy — that is how the three surfaces drifted apart in the
// first place. `hc` is rendered via a small adapter because the table header
// says "Area (Ha)" and the sheet's own figures are hectare values.
const SUB_SCHEMES = TP_SUB_SCHEMES.map((s) => ({
  code: s.code,
  hc: s.ha.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }),
  parent: `TP ${s.parent}`,
}));

const tpJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@context': 'https://schema.org',
      '@type': 'Article',
      '@id': 'https://dholeramap.com/dholera-tp-map#article',
      url: 'https://dholeramap.com/dholera-tp-map',
      headline: 'Dholera SIR Map PDF & TP Map in Dholera: Town Planning Schemes 1 to 6',
      description:
        'Authoritative guide and high-resolution blueprint repository for Dholera SIR Town Planning schemes TP 1 through TP 6.',
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
      '@type': 'Dataset',
      '@id': 'https://dholeramap.com/dholera-tp-map#dataset',
      name: 'Dholera SIR Town Planning Schemes 1–6 Interactive GIS Dataset',
      description:
        'Digitized interactive and reconstitutive boundary spatial data for all sanctioned and preliminary sub-TP schemes across Dholera SIR.',
      url: 'https://dholeramap.com/dholera-tp-map',
      spatialCoverage: {
        '@type': 'Place',
        name: 'Dholera Special Investment Region, Gujarat, India',
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      '@id': 'https://dholeramap.com/dholera-tp-map#faq',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'What is a Dholera TP Map?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'A Dholera TP (Town Planning) map is an official statutory master layout sanctioned under the Gujarat Town Planning and Urban Development (GTPUD) Act 1976. It reconstitutes irregular agricultural survey parcels into serviced, demarcated Final Plots (FPs) with defined road access and zoning.',
          },
        },
        {
          '@type': 'Question',
          name: 'Which TP scheme in Dholera is currently the most developed?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'TP 2 (specifically TP 2A and the 22.54 sq. km Activation Area) is the most developed scheme. It features completed underground utility ducts, 250m and 70m trunk roads, water treatment plants, the ABCD administrative complex, and the ₹91,000 Cr Tata Semiconductor Fab.',
          },
        },
        {
          '@type': 'Question',
          name: 'What is the land deduction percentage in Dholera Town Planning schemes?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Under DSIRDA regulations, land deduction typically ranges between 40% to 50%. When an Original Plot (OP) is converted to a Final Plot (FP), the owner receives approximately 50% to 60% of the original land area as a fully serviced, non-agricultural commercial or residential parcel with infrastructure access.',
          },
        },
        {
          '@type': 'Question',
          name: 'How can I download official Dholera TP map PDFs?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'The Dholera SIR map PDF is available on DholeraMap: download the gazetted high-resolution blueprints for Sub-TPs 1A1, 1A2, 2B1-2B3, 3A, 4B1, 5A, and 6A without lead gates, or inspect every survey plot in the interactive TP map in Dholera at 60fps.',
          },
        },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      '@id': 'https://dholeramap.com/dholera-tp-map#breadcrumb',
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
          name: 'Dholera TP Map',
          item: 'https://dholeramap.com/dholera-tp-map',
        },
      ],
    },
  ],
};

const TP_SCHEMES_DATA = [
  {
    id: 'tp1',
    name: 'TP 1 (Knowledge & High Access Corridor)',
    area: '~154 sq. km',
    focus: 'Knowledge & IT, High-Access Commercial, Residential',
    status: 'Preliminary Sanctioned (Sub-TP 1A1, 1A2)',
    subSchemes: ['1A1', '1A2'],
    roadWidths: '18m, 30m, 55m, 70m',
    highlight: 'Bordering Expressway, connects Ahmedabad corridor with educational university campuses.',
  },
  {
    id: 'tp2',
    name: 'TP 2 (Activation Area & Industrial Core)',
    area: '~142 sq. km (22.5 sq. km Activation)',
    focus: 'Semiconductor Fab, Heavy Industrial, Commercial, ABCD Complex',
    status: 'Sanctioned & Operational (Sub-TP 2A, 2B1, 2B2, 2B3)',
    subSchemes: ['2A', '2B1', '2B2', '2B3'],
    roadWidths: '18m, 30m, 55m, 70m, 250m Central Spine',
    highlight: 'Home to Tata-PSMC ₹91,000 Cr Semiconductor Fab, 24x7 treated water, and plug-and-play utilities.',
  },
  {
    id: 'tp3',
    name: 'TP 3 (Greenfield Industrial Expansion)',
    area: '~128 sq. km',
    focus: 'Solar Park Ancillaries, Logistics Hub, Manufacturing',
    status: 'Preliminary Draft Published (Sub-TP 3A, 3B, 3C)',
    subSchemes: ['3A', '3B', '3C'],
    roadWidths: '18m, 30m, 55m',
    highlight: 'Directly adjacent to the 5,000 MW Dholera Solar Park and Dedicated Freight Corridor spur.',
  },
  {
    id: 'tp4',
    name: 'TP 4 (Cargo Logistics & Airport Aerotropolis)',
    area: '~135 sq. km',
    focus: 'Aerospace & Aviation, Warehousing, Multi-Modal Logistics',
    status: 'Preliminary Sanctioned (Sub-TP 4A, 4B1, 4B2)',
    subSchemes: ['4A', '4B1', '4B2'],
    roadWidths: '24m, 45m, 70m',
    highlight: 'Surrounding the 1,426-hectare Greenfield Dholera International Airport cargo terminal.',
  },
  {
    id: 'tp5',
    name: 'TP 5 (Residential & Waterfront City)',
    area: '~160 sq. km',
    focus: 'High-Density Residential, Tourism, Waterfront Parks',
    status: 'Draft Published (Sub-TP 5A, 5B)',
    subSchemes: ['5A', '5B'],
    roadWidths: '18m, 30m, 55m',
    highlight: 'Planned eco-tourism recreation zones along Sukhbhadar riverfront canal network.',
  },
  {
    id: 'tp6',
    name: 'TP 6 (Heavy Infrastructure & Port Logistics)',
    area: '~180 sq. km',
    focus: 'Port-Based Industries, Heavy Chemical, Freight Terminals',
    status: 'Draft Stage (Sub-TP 6A)',
    subSchemes: ['6A'],
    roadWidths: '30m, 55m, 70m',
    highlight: 'Direct access to Gulf of Khambhat coastline and prospective coastal shipping docks.',
  },
];

export default function DholeraTpMapPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(tpJsonLd) }}
      />
      <SiteHeader />

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-blue-50/70 via-slate-50 to-white text-slate-900 py-12 sm:py-16 px-4 sm:px-6 lg:px-8 border-b border-slate-200">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold tracking-wide uppercase">
            <Layers className="w-3.5 h-3.5 text-blue-600" />
            Statutory Interactive Master Plans
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight text-slate-900">
            Dholera SIR Map PDF &amp; TP Map: Schemes 1–6
          </h1>

          {/* Inverted Pyramid AEO Direct-Answer Block */}
          <div className="bg-white border border-blue-200/80 rounded-2xl p-5 sm:p-6 shadow-xs">
            <div className="text-xs font-black uppercase tracking-wider text-blue-700 mb-2 flex items-center gap-2">
              <Compass className="w-4 h-4 text-blue-600" />
              Direct Definition &amp; Statutory Authority
            </div>
            <p className="text-sm sm:text-base leading-relaxed text-slate-700 font-medium">
              The TP map in Dholera shows the official Town Planning schemes (TP 1 to TP 6) sanctioned by the Gujarat Government under the GTPUD Act 1976. Spanning 920 sq. km, this town planning map in Dholera reconstitutes agricultural revenue surveys into demarcated Final Plots (FP) with planned 18m to 70m roads, zoning, and utilities. The Dholera SIR map PDF collects the same statutory blueprints for offline reference.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-600/20 transition transform hover:-translate-y-0.5"
            >
              <Map className="w-4 h-4" />
              Launch Interactive Vector Map (TP 1–6)
            </Link>
            <Link
              href="/dholera-plot-price"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-bold text-sm shadow-xs transition"
            >
              View 2026 Plot Price Rate Card
              <ArrowRight className="w-4 h-4 text-slate-500" />
            </Link>
          </div>
        </div>
      </section>

      {/* Main Content Grid */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
        {/* Interactive Town Planning Blueprint Studio & Reconstitution Simulator */}
        <TownPlanningExplorer />

        {/* SEO: server-rendered blueprint gallery.
            TownPlanningExplorer is a client component that only renders the
            *selected* scheme's image, so before this section existed TP 2-TP 6
            blueprints appeared nowhere in the server HTML. That made them
            un-crawlable for image search and invisible to any crawler that
            does not execute JS. Rendering all six here means every blueprint in
            the image sitemap is genuinely present in the first HTML response.
            `loading="lazy"` keeps them off the critical path, and next/image
            serves modern formats. Do not remove without updating
            IMAGE_SITEMAP in src/app/sitemap.ts. */}
        <section className="space-y-6" aria-labelledby="blueprint-gallery-heading">
          <div className="space-y-2">
            <h2
              id="blueprint-gallery-heading"
              className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight"
            >
              Sanctioned TP 1 to TP 6 Blueprint Gallery
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              The full set of gazetted town planning scheme blueprints for Dholera
              SIR. Open any scheme in the interactive studio above for plot-level
              detail, or use DeepZoom for the full-resolution sheet.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {SCHEME_GALLERY.map((s) => (
              <figure
                key={s.id}
                className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs"
              >
                <div className="relative h-44 w-full bg-slate-100">
                  <Image
                    src={s.image}
                    alt={`${s.name} map, Dholera SIR`}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    loading="lazy"
                    className="object-cover transition duration-500 group-hover:scale-105"
                  />
                </div>
                <figcaption className="p-4 space-y-1">
                  <h3 className="text-sm font-black text-slate-900">{s.name}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{s.tagline}</p>
                  <p className="text-[11px] font-semibold text-blue-700">
                    {s.areaHa} · {s.status}
                  </p>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>

        {/* Section 0: Sub-scheme split. Transcribed from the published
            sub-scheme boundary sheet (macro_split.jpg) so the 26 sub-schemes
            and their hectare areas are crawlable text rather than pixels. This
            is what the "Dholera SIR map PDF" / "sub TP" queries are asking for,
            and it backs the sub-TP download FAQ further down this page. */}
        <section className="space-y-5">
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Sub-Scheme Split: All {SUB_SCHEMES.length} Sanctioned Sub-TPs
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed max-w-3xl">
              Each Town Planning scheme is further divided into gazetted sub-schemes. The
              sub-scheme a plot falls inside is what appears on your Final Plot (FP) number
              and drives the exact FAR and abutting road width you are permitted — not the
              parent TP scheme alone. Areas below are as printed on the published boundary
              sheet, in hectares.
            </p>
          </div>
          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-xs">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-black">Sub-scheme</th>
                  <th className="px-4 py-3 font-black">Parent TP</th>
                  <th className="px-4 py-3 font-black text-right">Area (Ha)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {SUB_SCHEMES.map((s) => (
                  <tr key={s.code}>
                    <td className="px-4 py-2.5 font-black text-slate-900 whitespace-nowrap">
                      {s.code}
                    </td>
                    <td className="px-4 py-2.5 text-slate-600 whitespace-nowrap">{s.parent}</td>
                    <td className="px-4 py-2.5 text-right font-mono text-slate-700">
                      {s.hc}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Section 1: Scheme Comparison Matrix */}
        <section className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Town Planning Schemes 1 to 6: Comparison Matrix
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Every Town Planning scheme in Dholera SIR serves a specialized economic function defined by DSIRDA and the Gujarat Town Planning and Urban Development Act 1976.
            </p>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-2xl bg-white shadow-xs">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="bg-slate-100/80 text-slate-700 font-bold border-b border-slate-200">
                  <th className="p-4">TP Scheme</th>
                  <th className="p-4">Total Area</th>
                  <th className="p-4">Primary Land Use Focus</th>
                  <th className="p-4">Arterial Roads</th>
                  <th className="p-4">Statutory Status</th>
                  <th className="p-4 text-right">Interactive Tool</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {TP_SCHEMES_DATA.map((scheme) => (
                  <tr key={scheme.id} className="hover:bg-blue-50/40 transition">
                    <td className="p-4 font-black text-slate-900 whitespace-nowrap">
                      {scheme.id.toUpperCase()}
                    </td>
                    <td className="p-4 font-mono text-slate-600 whitespace-nowrap">{scheme.area}</td>
                    <td className="p-4 text-slate-700">{scheme.focus}</td>
                    <td className="p-4 font-mono text-slate-600 whitespace-nowrap">{scheme.roadWidths}</td>
                    <td className="p-4">
                      <span className="inline-block px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold text-xs">
                        {scheme.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <Link
                        href="/"
                        className="inline-flex items-center gap-1 font-bold text-blue-600 hover:text-blue-800 text-xs"
                      >
                        Inspect Map
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Section 2: Deep Dive into Each TP Scheme */}
        <section className="space-y-8">
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Detailed Breakdown of Dholera TP Schemes
            </h2>
            <p className="text-sm text-slate-600">
              Select any scheme below to understand plot reconstitution, road widths, and legal status.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {TP_SCHEMES_DATA.map((scheme) => (
              <div
                key={scheme.id}
                className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs hover:shadow-md transition space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-wider px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                      {scheme.id.toUpperCase()}
                    </span>
                    <span className="text-xs font-mono text-slate-500">{scheme.area}</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                    {scheme.name}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {scheme.highlight}
                  </p>
                  <div className="pt-2 border-t border-slate-100 space-y-1.5 text-xs text-slate-500">
                    <div>
                      <strong className="text-slate-700">Sub-Schemes:</strong>{' '}
                      {scheme.subSchemes.join(', ')}
                    </div>
                    <div>
                      <strong className="text-slate-700">Road Network:</strong> {scheme.roadWidths}
                    </div>
                  </div>
                </div>

                <div className="pt-3 flex items-center justify-between">
                  <Link
                    href="/"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-blue-600 text-white font-bold text-xs transition"
                  >
                    <Map className="w-3.5 h-3.5" />
                    Open in 60fps Viewer
                  </Link>
                  <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Sanctioned
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section 3: Understanding OP to FP Reconstitution */}
        <section className="bg-white border border-slate-200 text-slate-900 rounded-3xl p-8 sm:p-10 shadow-xs space-y-6">
          <div className="space-y-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold uppercase tracking-wider">
              Statutory Interactive Process
            </span>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
              How Original Plots (OP) Become Final Plots (FP) in Dholera
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Unlike haphazard private real estate colonies, Dholera SIR is developed strictly under the Gujarat Town Planning and Urban Development Act 1976. Understanding the difference between an OP and an FP is crucial to avoid purchasing un-demarcated agricultural land.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 space-y-2">
              <span className="text-blue-600 font-mono text-sm font-bold">Step 1</span>
              <h3 className="font-bold text-slate-900 text-sm">Original Plot (OP)</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                The original revenue survey number registered in Gujarat AnyRoR 7/12 records. Often irregular in shape with zero planned road access.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 space-y-2">
              <span className="text-blue-600 font-mono text-sm font-bold">Step 2</span>
              <h3 className="font-bold text-slate-900 text-sm">40–50% Deduction</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                DSIRDA deducts 40% to 50% of the land area to construct 70m trunk roads, stormwater drainage, power substations, and green parks.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 space-y-2">
              <span className="text-blue-600 font-mono text-sm font-bold">Step 3</span>
              <h3 className="font-bold text-slate-900 text-sm">Final Plot (FP) Allotment</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                The landholder receives a regularized, geometrically rectangular Final Plot with immediate all-weather road access and legal NA status.
              </p>
            </div>
          </div>
        </section>

        {/* Section 4: Official Gazette PDF Download Repository */}
        <section className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Official Gujarat Gazette Blueprint Downloads
            </h2>
            <p className="text-sm text-slate-600">
              Download the official Government of Gujarat statutory gazette notifications and preliminary Town Planning scheme blueprints.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { name: 'TP 1 - Sub Scheme 1A1 (Gazette)', size: '2.4 MB', code: 'TP1A1' },
              { name: 'TP 1 - Sub Scheme 1A2 (Gazette)', size: '2.8 MB', code: 'TP1A2' },
              { name: 'TP 2 - Sub Scheme 2B1 (Gazette)', size: '3.1 MB', code: 'TP2B1' },
              { name: 'TP 2 - Sub Scheme 2B2 (Gazette)', size: '2.6 MB', code: 'TP2B2' },
              { name: 'TP 2 - Sub Scheme 2B3 (Gazette)', size: '2.9 MB', code: 'TP2B3' },
              { name: 'TP 3 - Sub Scheme 3A (Gazette)', size: '3.4 MB', code: 'TP3A' },
              { name: 'TP 4 - Sub Scheme 4B1 (Gazette)', size: '3.0 MB', code: 'TP4B1' },
              { name: 'TP 5 - Sub Scheme 5A (Gazette)', size: '2.7 MB', code: 'TP5A' },
              { name: 'TP 6 - Sub Scheme 6A (Gazette)', size: '3.5 MB', code: 'TP6A' },
            ].map((doc) => (
              <div
                key={doc.code}
                className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between hover:border-blue-300 transition"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 leading-tight">{doc.name}</h3>
                    <span className="text-[10px] text-slate-500">{doc.size} · PDF Blueprint</span>
                  </div>
                </div>
                <Link
                  href="/"
                  className="p-2 rounded-lg bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-600 transition"
                  title="View online in interactive viewer"
                  aria-label="View this TP scheme map online in the interactive viewer"
                >
                  <Download className="w-4 h-4" />
                  <span className="sr-only">View online in interactive viewer</span>
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* Section 5: Frequently Asked Questions (AEO & FAQ Schema) */}
        <section className="space-y-6 pt-4 border-t border-slate-200">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-blue-600">
              <HelpCircle className="w-4 h-4" />
              Frequently Asked Questions
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Everything You Need to Know About Dholera TP Maps
            </h2>
          </div>

          <div className="space-y-4">
            {[
              {
                q: 'What is a Dholera TP Map?',
                a: 'A Dholera TP (Town Planning) map is an official statutory master layout sanctioned under the Gujarat Town Planning and Urban Development (GTPUD) Act 1976. It reconstitutes irregular agricultural survey parcels into serviced, demarcated Final Plots (FPs) with defined road access and zoning.',
              },
              {
                q: 'Which TP scheme in Dholera is currently the most developed?',
                a: 'TP 2 (specifically TP 2A and the 22.54 sq. km Activation Area) is the most developed scheme. It features completed underground utility ducts, 250m and 70m trunk roads, water treatment plants, the ABCD administrative complex, and the ₹91,000 Cr Tata Semiconductor Fab.',
              },
              {
                q: 'What is the land deduction percentage in Dholera Town Planning schemes?',
                a: 'Under DSIRDA regulations, land deduction typically ranges between 40% to 50%. When an Original Plot (OP) is converted to a Final Plot (FP), the owner receives approximately 50% to 60% of the original land area as a fully serviced, non-agricultural commercial or residential parcel with infrastructure access.',
              },
              {
                q: 'How can I download official Dholera TP map PDFs?',
                a: 'The Dholera SIR map PDF is available on DholeraMap: download the gazetted high-resolution blueprints for Sub-TPs 1A1, 1A2, 2B1-2B3, 3A, 4B1, 5A, and 6A without lead gates, or inspect every survey plot in the interactive TP map in Dholera at 60fps.',
              },
            ].map((faq, idx) => (
              <div key={idx} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-2">
                <h3 className="text-sm sm:text-base font-bold text-slate-900">{faq.q}</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* SEO: pass internal authority from this pillar down into the article
            cluster. /dholera-tp-map shipped with zero outbound links to /blog,
            which left the Tata fab status post (position 4.88, 8 impressions,
            0 clicks) isolated from the site's most-cited planning document. */}
        <RelatedReading
          categories={['Town Planning', 'Infrastructure', 'Investment']}
          title="Guides on the Dholera schemes"
          intro="Long-form guides covering scheme-level investment decisions, the infrastructure built inside each TP scheme, and what the road widths above mean for a plot."
        />
      </main>

      <SiteFooter />
    </div>
  );
}
