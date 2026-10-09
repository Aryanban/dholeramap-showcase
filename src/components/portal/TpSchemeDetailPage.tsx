import React from 'react';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import {
  Map,
  Download,
  ArrowRight,
  Compass,
  FileText,
  ChevronRight,
  HelpCircle,
  Layers,
  Building2,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react';
import SiteHeader from '@/components/panels/SiteHeader';
import SiteFooter from '@/components/panels/SiteFooter';
import { VILLAGES } from '@/lib/villages';
import { TP_SUB_SCHEMES, type TpSchemeId } from '@/lib/tp-areas';
import { DOMAIN, SITE_NAME, hreflang, pageDescription } from '@/lib/brand';

export interface TpSchemeConfig {
  schemeNumber: TpSchemeId;
  name: string;
  shortName: string;
  tagline: string;
  title: string;
  description: string;
  areaHa: string;
  status: string;
  dominantZone: string;
  roadWidths: string[];
  farRange: string;
  priceBand: string;
  image: string;
  villageSlugs: string[];
  faqs: { q: string; a: string }[];
}

export const TP_SCHEMES_CONFIG: Record<TpSchemeId, TpSchemeConfig> = {
  1: {
    schemeNumber: 1,
    name: 'Town Planning Scheme 1 (TP 1)',
    shortName: 'TP 1',
    tagline: 'Primary serviced activation residential, knowledge, and high-access corridor.',
    title: 'Dholera TP 1 Map PDF Download: Activation Area & Plots | DholeraMap',
    description: 'Download official Dholera TP 1 map PDF & inspect interactive cadastre: 5,109 hectares, residential zones, road tiers (18m-55m) and Final Plots in Ambli, Kadipur, Bhadana.',
    areaHa: '5,109 Ha (~12,624 Acres)',
    status: 'Preliminary Sanctioned (Operational Utilities)',
    dominantZone: 'Residential, Knowledge & High Access Mixed Use',
    roadWidths: ['18m', '25m', '30m', '55m', '70m'],
    farRange: '1.5 – 2.2 (Base) up to 4.0 (High Access)',
    priceBand: '₹11,000 – ₹16,500+ / sq yd',
    image: '/maps/schemes/dholera_tp1.jpg',
    villageSlugs: ['ambli', 'kadipur', 'bhadana', 'bhadiyad', 'bhimtalav', 'gogla', 'khun', 'umargadh'],
    faqs: [
      {
        q: 'What is Dholera TP 1 known for?',
        a: 'TP 1 is the primary residential and educational hub of Dholera SIR, encompassing 5,109 hectares. It features fully functional underground smart city utilities (SCADA-controlled water, vacuum sewerage, power ducts) and high-value residential plotting schemes.',
      },
      {
        q: 'Where can I download the Dholera TP 1 Map PDF?',
        a: 'You can download the high-resolution official Dholera TP 1 scheme map blueprint directly from DholeraMap.com, or inspect interactive reconstituted Final Plots (FP) with survey cross-referencing on the vector GIS viewer.',
      },
      {
        q: 'Which villages fall under TP 1 in Dholera SIR?',
        a: 'TP 1 encompasses gazetted land across Ambli, Kadipur, Bhadana, Bhadiyad, Bhimtalav, Gogla, Khun, and Umargadh villages.',
      },
    ],
  },
  2: {
    schemeNumber: 2,
    name: 'Town Planning Scheme 2 (TP 2)',
    shortName: 'TP 2',
    tagline: 'High-tech industrial core, ₹91k Cr Tata Semiconductor Fab corridor, and ABCD administrative center.',
    title: 'Dholera TP 2 Map PDF Download: Tata Fab & Final Plots | DholeraMap',
    description: 'Download official Dholera TP 2 map PDF & inspect interactive cadastre: 10,232 hectares, ₹91k Cr Tata Semiconductor Fab, ABCD building, and industrial Final Plots.',
    areaHa: '10,232 Ha (~25,283 Acres)',
    status: 'Operational Trunk Infrastructure',
    dominantZone: 'Industrial & High-Tech Semiconductor Core',
    roadWidths: ['18m', '30m', '55m', '70m', '250m Central Spine'],
    farRange: '2.0 – 4.0',
    priceBand: '₹11,000 – ₹15,000 / sq yd (Industrial up to ₹21,000)',
    image: '/maps/schemes/dholera_tp2.jpg',
    villageSlugs: ['hebatpur', 'bhimnath', 'gorasu', 'otariya', 'pipli', 'rahtalav'],
    faqs: [
      {
        q: 'Where is the Tata Semiconductor plant located in TP 2?',
        a: 'The ₹91,000-crore Tata Electronics & PSMC semiconductor fab is situated on a 160-acre plot in TP 2A within the Dholera Activation Area, directly abutting the Central Spine road and Expressway interchange.',
      },
      {
        q: 'How many sub-schemes make up Dholera TP 2?',
        a: 'TP 2 is partitioned into 8 statutory sub-schemes: TP 2A, TP 2B-1, TP 2B-2, TP 2B-3, TP 2B-4, TP 2B-4B, TP 2B-5A, and TP 2B-5B, totaling 10,232 hectares.',
      },
      {
        q: 'What infrastructure is currently operational in TP 2?',
        a: 'TP 2 contains the operational ABCD administrative command center, 100 MLD water treatment plant, 220 kV sub-station, and multi-lane asphalted arterial roads with subterranean sensor networks.',
      },
    ],
  },
  3: {
    schemeNumber: 3,
    name: 'Town Planning Scheme 3 (TP 3)',
    shortName: 'TP 3',
    tagline: 'Central Business District (CBD), city center commercial hub, and tourism waterfront.',
    title: 'Dholera TP 3 Map PDF Download: City Center & Commercial | DholeraMap',
    description: 'Download official Dholera TP 3 map PDF & inspect interactive cadastre: 6,632 hectares, Central Business District (CBD), high access corridor, and commercial plots.',
    areaHa: '6,632 Ha (~16,388 Acres)',
    status: 'Sanctioned Preliminary',
    dominantZone: 'Commercial CBD, High Access Corridor & Mixed Use',
    roadWidths: ['18m', '30m', '55m', '70m'],
    farRange: '2.5 – 5.0 (CBD Maximum)',
    priceBand: '₹9,500 – ₹13,000 / sq yd',
    image: '/maps/schemes/dholera_tp3.jpg',
    villageSlugs: ['dholera', 'cher', 'otariya', 'sandhida', 'sangasar'],
    faqs: [
      {
        q: 'What is the primary function of Dholera TP 3?',
        a: 'TP 3 represents the urban core of Dholera SIR, housing the Central Business District (CBD), regional retail malls, corporate headquarters, and high-density residential towers.',
      },
      {
        q: 'What is the permissible FAR in Dholera TP 3 CBD?',
        a: 'Permissible Floor Area Ratio in the TP 3 CBD reaches up to 5.0 on 55m and 70m arterial corridors, allowing iconic skyscraper developments under DGDCR 2024 regulations.',
      },
      {
        q: 'Which villages are part of TP 3?',
        a: 'TP 3 encompasses historical Dholera town, Cher, Otariya, Sandhida, and Sangasar.',
      },
    ],
  },
  4: {
    schemeNumber: 4,
    name: 'Town Planning Scheme 4 (TP 4)',
    shortName: 'TP 4',
    tagline: 'Expressway interchange hub, multimodal logistics, and knowledge corridor.',
    title: 'Dholera TP 4 Map PDF Download: Expressway & Logistics | DholeraMap',
    description: 'Download official Dholera TP 4 map PDF & inspect interactive cadastre: 6,022 hectares, NE 8 expressway interchange, logistics parks, and solar development.',
    areaHa: '6,022 Ha (~14,880 Acres)',
    status: 'Sanctioned Preliminary',
    dominantZone: 'Logistics, Solar & Knowledge Corridor',
    roadWidths: ['18m', '30m', '55m', '70m'],
    farRange: '1.8 – 3.0',
    priceBand: '₹9,000 – ₹12,000 / sq yd',
    image: '/maps/schemes/dholera_tp4.jpg',
    villageSlugs: ['mundi', 'pipli', 'rahtalav', 'sandhida'],
    faqs: [
      {
        q: 'How does TP 4 connect to the Ahmedabad-Dholera Expressway?',
        a: 'TP 4 features a primary grade-separated trumpet interchange connecting the 109 km National Expressway 8 directly into Dholera SIR internal 70m arterial networks.',
      },
      {
        q: 'What are the main investment opportunities in TP 4?',
        a: 'TP 4 offers prime parcels for warehousing, freight forwarding, cold chain storage, and ancillary engineering workshops supporting the industrial core.',
      },
      {
        q: 'Which sub-schemes constitute TP 4?',
        a: 'TP 4 is divided into TP 4A (527 Ha), TP 4B-1 (1,070 Ha), and TP 4B-2 (4,425 Ha).',
      },
    ],
  },
  5: {
    schemeNumber: 5,
    name: 'Town Planning Scheme 5 (TP 5)',
    shortName: 'TP 5',
    tagline: 'Aerotropolis catchment, aviation MRO, cold storage logistics, and heavy manufacturing.',
    title: 'Dholera TP 5 Map PDF Download: Aerotropolis & Logistics | DholeraMap',
    description: 'Download official Dholera TP 5 map PDF & inspect interactive cadastre: 7,425 hectares, international airport support, MRO zone, and logistics freight corridors.',
    areaHa: '7,425 Ha (~18,347 Acres)',
    status: 'Sanctioned Preliminary',
    dominantZone: 'Aerotropolis, Cargo Logistics & Heavy Manufacturing',
    roadWidths: ['18m', '30m', '55m', '70m'],
    farRange: '2.0 – 3.5',
    priceBand: '₹8,000 – ₹10,500 / sq yd',
    image: '/maps/schemes/dholera_tp5.jpg',
    villageSlugs: ['bavaliyari', 'sangasar', 'umargadh'],
    faqs: [
      {
        q: 'What is the TP 5 Aerotropolis in Dholera SIR?',
        a: 'TP 5 is the dedicated aviation and freight logistics zone directly bordering the Dholera International Airport at Navagam, planned for aircraft MRO, air cargo forwarding, and aerospace supply chain units.',
      },
      {
        q: 'Are building heights restricted in TP 5?',
        a: 'Yes, because TP 5 abuts the international airport, permissible building heights are strictly governed by DGCA Obstacle Limitation Surfaces (OLS) and Colour Coded Zoning Maps (CCZM).',
      },
      {
        q: 'How large is TP 5 in total area?',
        a: 'TP 5 covers 7,425 hectares across four sanctioned sub-schemes: TP 5A, TP 5B, TP 5C-1, and TP 5C-2.',
      },
    ],
  },
  6: {
    schemeNumber: 6,
    name: 'Town Planning Scheme 6 (TP 6)',
    shortName: 'TP 6',
    tagline: 'Renewable energy park, 5,000 MW mega solar park, clean tech, and coastal logistics.',
    title: 'Dholera TP 6 Map PDF Download: Solar Park & Clean Tech | DholeraMap',
    description: 'Download official Dholera TP 6 map PDF & inspect interactive cadastre: 6,726 hectares, 5,000 MW solar park, clean tech manufacturing, and coastal logistics.',
    areaHa: '6,726 Ha (~16,620 Acres)',
    status: 'Sanctioned Preliminary',
    dominantZone: 'Renewable Clean Tech & Coastal Logistics',
    roadWidths: ['18m', '30m', '55m'],
    farRange: '1.5 – 2.5',
    priceBand: '₹8,000 – ₹9,500 / sq yd',
    image: '/maps/schemes/dholera_tp6.jpg',
    villageSlugs: ['bhangadh', 'bavaliyari', 'zankhi'],
    faqs: [
      {
        q: 'What is the anchor project in Dholera TP 6?',
        a: 'TP 6 is anchored by the 5,000 MW Dholera Solar Park — one of the worlds largest ultra-mega solar power generation facilities — alongside green hydrogen and clean technology manufacturing.',
      },
      {
        q: 'Can private residential villas be developed in TP 6?',
        a: 'Most of TP 6 is zoned for clean technology, solar utilities, and green coastal buffers. Residential housing is permitted only in designated peripheral residential enclaves.',
      },
      {
        q: 'Which villages fall under TP 6?',
        a: 'TP 6 comprises Bhangadh, Bavaliyari, and Zankhi villages in the southern sector of Dholera SIR.',
      },
    ],
  },
};

export function getTpSchemeMetadata(schemeNumber: TpSchemeId): Metadata {
  const config = TP_SCHEMES_CONFIG[schemeNumber];
  const url = `${DOMAIN}/dholera-tp-${schemeNumber}-map`;

  return {
    title: config.title,
    description: pageDescription(config.description),
    keywords: [
      `Dholera ${config.shortName} map`,
      `Dholera ${config.shortName} map PDF download`,
      `Dholera TP ${schemeNumber} map`,
      `Dholera ${config.shortName} plots`,
      `Dholera ${config.shortName} final plots`,
      `Dholera ${config.shortName} survey numbers`,
      `Town Planning Scheme ${schemeNumber} Dholera`,
      `Dholera SIR ${config.shortName} rate`,
      `Dholera SIR map PDF`,
      `ધોલેરા ${config.shortName} મેપ`,
    ],
    alternates: {
      canonical: url,
      languages: hreflang(url),
    },
    openGraph: {
      title: config.title,
      description: config.description,
      url,
      siteName: SITE_NAME,
      images: [config.image],
      locale: 'en_IN',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: config.title,
      description: config.description,
      images: [config.image],
    },
  };
}

export default function TpSchemeDetailPage({ schemeNumber }: { schemeNumber: TpSchemeId }) {
  const config = TP_SCHEMES_CONFIG[schemeNumber];
  const subSchemes = TP_SUB_SCHEMES.filter((s) => s.parent === schemeNumber);
  const villages = VILLAGES.filter((v) => config.villageSlugs.includes(v.slug));
  const url = `${DOMAIN}/dholera-tp-${schemeNumber}-map`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Place',
        name: `${config.name}, Dholera Special Investment Region`,
        description: config.description,
        url,
        geo: {
          '@type': 'GeoCoordinates',
          latitude: '22.25',
          longitude: '72.18',
        },
      },
      {
        '@type': 'ImageObject',
        name: `Official ${config.name} Blueprint Map`,
        contentUrl: `${DOMAIN}${config.image}`,
        thumbnailUrl: `${DOMAIN}${config.image}`,
        description: `Official statutory Town Planning scheme blueprint for ${config.name} in Dholera SIR under GTPUD Act 1976.`,
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: `${DOMAIN}/`,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Town Planning Maps',
            item: `${DOMAIN}/dholera-tp-map`,
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: config.shortName,
            item: url,
          },
        ],
      },
      {
        '@type': 'FAQPage',
        mainEntity: config.faqs.map((f) => ({
          '@type': 'Question',
          name: f.q,
          acceptedAnswer: {
            '@type': 'Answer',
            text: f.a,
          },
        })),
      },
    ],
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SiteHeader />

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-blue-50/70 via-slate-50 to-white py-12 sm:py-16 px-4 sm:px-6 lg:px-8 border-b border-slate-200">
        <div className="max-w-5xl mx-auto space-y-6">
          <nav className="flex items-center gap-2 text-xs font-semibold text-slate-400">
            <Link href="/" className="hover:text-blue-600 transition">
              Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href="/dholera-tp-map" className="hover:text-blue-600 transition">
              TP Maps (TP 1–6)
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-slate-700">{config.shortName}</span>
          </nav>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100/80 border border-blue-200 text-blue-900 text-xs font-black tracking-wide uppercase">
            <Map className="w-3.5 h-3.5 text-blue-700" />
            Statutory GTPUD 1976 Sanctioned Scheme
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            {config.name} Blueprint &amp; Final Plots Map
          </h1>

          <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-3xl">
            {config.tagline} Download the official statutory blueprint PDF, review sanctioned road widths, DGDCR 2024 building envelopes, and cross-reference Final Plots on the interactive GIS atlas.
          </p>

          <div className="flex flex-wrap gap-3 pt-2">
            <a
              href={config.image}
              download={`dholera_${config.shortName.toLowerCase().replace(' ', '')}_map.jpg`}
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-600/20 transition transform hover:-translate-y-0.5"
            >
              <Download className="w-4 h-4" />
              Download {config.shortName} Map Blueprint (Full Resolution)
            </a>
            <Link
              href={`/map?tp=${schemeNumber}`}
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 font-bold text-sm shadow-xs transition"
            >
              <Compass className="w-4 h-4 text-blue-600" />
              Open in Vector GIS Viewer
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </Link>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12 flex-1">
        {/* Blueprint Showcase */}
        <section className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                Official {config.shortName} Scheme Cadastral Blueprint
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Gazetted layout sheet showing statutory reconstituted Final Plots, arterial road tiers, and reservation pockets.
              </p>
            </div>
            <a
              href={config.image}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline"
            >
              <span>View Fullscreen (5MB JPG)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="relative aspect-4/3 w-full rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 group">
            <Image
              src={config.image}
              alt={`Official ${config.name} Scheme Blueprint Map`}
              fill
              className="object-cover group-hover:scale-102 transition duration-500"
              priority
              sizes="(max-w-7xl) 100vw, 1200px"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition flex items-end p-6">
              <a
                href={config.image}
                download
                className="px-4 py-2 rounded-lg bg-white text-slate-900 text-xs font-bold shadow-lg"
              >
                Click to Download Original Blueprint
              </a>
            </div>
          </div>
        </section>

        {/* Scheme Technical Matrix */}
        <section className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">
            {config.shortName} Statutory Planning Matrix
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-[11px] font-bold uppercase text-slate-500">Statutory Area</span>
              <div className="text-lg font-black text-slate-900 mt-1">{config.areaHa}</div>
              <span className="text-[10px] text-slate-500">{subSchemes.length} Sanctioned Sub-Schemes</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-[11px] font-bold uppercase text-slate-500">Zoning Designation</span>
              <div className="text-sm font-black text-blue-700 mt-1">{config.dominantZone}</div>
              <span className="text-[10px] text-slate-500">DGDCR 2024 Regulatory Zone</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-[11px] font-bold uppercase text-slate-500">Asking Price Benchmark</span>
              <div className="text-base font-black text-emerald-700 mt-1">{config.priceBand}</div>
              <span className="text-[10px] text-slate-500">Secondary Market Broker Rate</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-[11px] font-bold uppercase text-slate-500">Sanctioned Road Tiers</span>
              <div className="text-base font-black text-slate-900 mt-1">{config.roadWidths.join(' / ')}</div>
              <span className="text-[10px] text-slate-500">Town Planning Road Widths</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-[11px] font-bold uppercase text-slate-500">Permissible FAR / FSI</span>
              <div className="text-base font-black text-slate-900 mt-1">{config.farRange}</div>
              <span className="text-[10px] text-slate-500">Based on Abutting Road Width</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-[11px] font-bold uppercase text-slate-500">Implementation Status</span>
              <div className="text-sm font-black text-indigo-700 mt-1">{config.status}</div>
              <span className="text-[10px] text-slate-500">Gujarat Gazette Notified</span>
            </div>
          </div>
        </section>

        {/* Sub-Schemes Breakdown Table */}
        <section className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              {config.shortName} Gazetted Sub-Schemes Schedule
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Sub-scheme boundaries transcribed directly from the official DSIRDA town planning declaration sheet.
            </p>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-2xl">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <th className="p-3.5">Sub-Scheme Code</th>
                  <th className="p-3.5">Area in Hectares (Ha)</th>
                  <th className="p-3.5">Approx Area (Acres)</th>
                  <th className="p-3.5">Statutory Jurisdiction</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {subSchemes.map((sub) => (
                  <tr key={sub.code} className="hover:bg-blue-50/40 transition">
                    <td className="p-3.5 font-bold text-slate-900">{sub.code}</td>
                    <td className="p-3.5 font-mono text-slate-700">{sub.ha.toLocaleString('en-IN')} Ha</td>
                    <td className="p-3.5 font-mono text-slate-600">
                      {Math.round(sub.ha * 2.47105).toLocaleString('en-IN')} Acres
                    </td>
                    <td className="p-3.5 text-slate-600">DSIRDA / GTPUD Act 1976</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Revenue Villages in this TP Scheme */}
        <section className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">
            Revenue Villages in {config.shortName}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Parcels in {config.shortName} are derived from statutory survey numbers belonging to these gazetted revenue villages. Click on any village to inspect cadastral survey boundaries:
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            {villages.map((v) => (
              <Link
                key={v.slug}
                href={`/village/${v.slug}`}
                className="p-3 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-blue-50 hover:border-blue-300 transition group"
              >
                <div className="font-bold text-slate-900 text-xs sm:text-sm group-hover:text-blue-600 transition">
                  {v.name}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">{v.zone}</div>
              </Link>
            ))}
          </div>
        </section>

        {/* FAQs */}
        <section className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-blue-600">
            <HelpCircle className="w-4 h-4" />
            Frequently Asked Questions
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">
            {config.shortName} Town Planning Scheme FAQs
          </h2>

          <div className="space-y-4">
            {config.faqs.map((faq, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <h3 className="font-bold text-slate-900 text-sm sm:text-base">{faq.q}</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Cross-navigation to all other TP Schemes */}
        <section className="bg-slate-100/70 border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-4">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-700">
            Explore All 6 Dholera Town Planning Schemes
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 pt-1">
            {([1, 2, 3, 4, 5, 6] as TpSchemeId[]).map((num) => {
              const item = TP_SCHEMES_CONFIG[num];
              const isCurrent = num === schemeNumber;
              return (
                <Link
                  key={num}
                  href={`/dholera-tp-${num}-map`}
                  className={`p-3 rounded-xl border text-center transition ${
                    isCurrent
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                      : 'bg-white text-slate-800 border-slate-200 hover:border-blue-300 hover:bg-blue-50/50'
                  }`}
                >
                  <div className="font-black text-xs">{item.shortName} Map</div>
                  <div className={`text-[10px] mt-0.5 ${isCurrent ? 'text-blue-100' : 'text-slate-500'}`}>
                    {item.dominantZone.split(' ')[0]}
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
