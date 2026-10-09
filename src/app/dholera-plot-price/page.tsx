import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { TrendingUp, AlertTriangle, CheckCircle2, ArrowRight, DollarSign, Calculator, HelpCircle, MapPin, Layers } from 'lucide-react';
import SiteHeader from '@/components/panels/SiteHeader';
import SiteFooter from '@/components/panels/SiteFooter';
import PlotPriceCalculator from '@/components/portal/PlotPriceCalculator';
import { VILLAGE_COUNT, OG_IMAGE, OG_IMAGE_DIMS, DOMAIN } from '@/lib/brand';

export const metadata: Metadata = {
  title: 'Dholera Plot Price 2026: Land Rates per Sq Yd & Circle Rates | DholeraMap',
  description:
    `2026 Dholera SIR plot prices per sq. yard: compare land rates across TP 1–6, Activation Area, and ${VILLAGE_COUNT} villages with official DICDL circle rates and OP-to-FP deductions.`,
  keywords: [
    'Dholera plot price 2026',
    'Dholera land rate per sq yard',
    'Dholera circle rates',
    'Dholera plot rate per sq yard',
    'Dholera SIR plot price 2026',
    'Dholera land price TP 1',
    'Dholera commercial plot price',
    'Dholera industrial plot rate',
    'Dholera plot for sale rate',
    'ધોલેરા પ્લોટ ભાવ 2026',
    'ધોલેરા જમીન ના ભાવ',
    'ડીઆઈસીડીએલ જમીન દર',
  ],
  alternates: {
    canonical: `${DOMAIN}/dholera-plot-price`,
  },
  openGraph: {
    title: 'Dholera Plot Price 2026: Land Rate Card | DholeraMap',
    description:
      `2026 Dholera SIR plot prices per sq. yard: compare land rates across TP 1–6, Activation Area, and ${VILLAGE_COUNT} villages with OP-to-FP deductions.`,
    url: `${DOMAIN}/dholera-plot-price`,
    siteName: 'DholeraMap',
    images: [
      {
        url: OG_IMAGE,
        width: OG_IMAGE_DIMS.width,
        height: OG_IMAGE_DIMS.height,
        alt: 'Dholera SIR Plot Price 2026 Land Rate Card',
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Dholera Plot Price 2026: Land Rate Card | DholeraMap',
    description:
      `2026 Dholera SIR plot prices per sq. yard: compare land rates across TP 1–6, Activation Area, and ${VILLAGE_COUNT} villages with OP-to-FP deductions.`,
    images: [OG_IMAGE],
  },
};

const priceJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@context': 'https://schema.org',
      '@type': 'Article',
      '@id': 'https://dholeramap.com/dholera-plot-price#article',
      url: 'https://dholeramap.com/dholera-plot-price',
      headline: 'Dholera Plot Price 2026: Verified Land Rate Card & Valuation Guide',
      description:
        `Comprehensive 2026 land valuation matrix and interactive rate card for plots across Dholera SIR TP schemes 1 to 6 and ${VILLAGE_COUNT} revenue villages.`,
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
      '@id': 'https://dholeramap.com/dholera-plot-price#dataset',
      name: 'Dholera SIR 2026 Land Price & Valuation Matrix',
      description:
        'Interactive valuation figures, road width pricing tiers, and statutory reconstitution deduction estimates for Dholera smart city.',
      url: 'https://dholeramap.com/dholera-plot-price',
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      '@id': 'https://dholeramap.com/dholera-plot-price#faq',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'What is the current plot price in Dholera Smart City in 2026?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'In 2026, plot prices in Dholera SIR range from ₹2,500 to ₹18,000 per sq. yard. Prime industrial plots in the TP 2 Activation Area command ₹12,000–₹18,000/sq.yd, TP 1 residential plots trade at ₹8,000–₹14,000/sq.yd, and peripheral village agricultural lands range from ₹2,500–₹6,000/sq.yd.',
          },
        },
        {
          '@type': 'Question',
          name: 'Why is there a big difference between agricultural and Final Plot (FP) prices?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Agricultural Original Plots (OP) undergo a 40% to 50% statutory land deduction by DSIRDA for roads and public utilities. In contrast, Final Plots (FP) are non-agricultural (NA), clear-title, geometrically demarcated parcels with immediate 18m–70m asphalt road access, underground power, and water connections.',
          },
        },
        {
          '@type': 'Question',
          name: 'How does road width affect plot prices in Dholera?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Under DGDCR regulations, plots abutting 55m and 70m arterial roads receive higher permissible Floor Space Index (FSI/FAR up to 5.0) and allow high-rise commercial development, commanding a 30% to 50% premium over plots on 18m internal roads.',
          },
        },
        {
          '@type': 'Question',
          name: 'Is investing in Dholera land safe from title fraud?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Investing in Dholera is safe when buying legally reconstituted Final Plots (FPs) under sanctioned Town Planning schemes. Buyers should always cross-verify survey numbers against the DSIRDA interactive blueprint and AnyRoR 7/12 records to ensure the parcel is not situated in a CRZ tidal basin or green buffer.',
          },
        },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      '@id': 'https://dholeramap.com/dholera-plot-price#breadcrumb',
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
          name: 'Dholera Plot Price 2026',
          item: 'https://dholeramap.com/dholera-plot-price',
        },
      ],
    },
  ],
};

const PRICE_MATRIX = [
  {
    location: 'TP 2 - Activation Area Core',
    zone: 'Industrial / Commercial / Tech Fab',
    rateSqYd: '₹12,000 – ₹18,000',
    rateSqM: '₹14,350 – ₹21,500',
    status: 'Ready Possession & Plug-and-Play',
    roadWidth: '30m, 55m, 70m, 250m Spine',
  },
  {
    location: 'TP 1 - High Access Corridor',
    zone: 'City Center Commercial / R1 Residential',
    rateSqYd: '₹8,500 – ₹14,500',
    rateSqM: '₹10,150 – ₹17,350',
    status: 'Preliminary Sanctioned (Sub-TP 1A1)',
    roadWidth: '18m, 30m, 55m',
  },
  {
    location: 'TP 2 - Hebatpur / Ambli Fringe',
    zone: 'Residential / Knowledge Hub',
    rateSqYd: '₹7,000 – ₹11,500',
    rateSqM: '₹8,350 – ₹13,750',
    status: 'Sanctioned Sub-TP 2B1–2B3',
    roadWidth: '18m, 30m',
  },
  {
    location: 'TP 4 - Aerotropolis & Logistics',
    zone: 'Aviation, Freight & Warehousing',
    rateSqYd: '₹6,000 – ₹9,500',
    rateSqM: '₹7,150 – ₹11,350',
    status: 'Preliminary Sanctioned (Sub-TP 4B1)',
    roadWidth: '24m, 45m, 70m',
  },
  {
    location: 'TP 3 & TP 5 - Expansion Sectors',
    zone: 'Mixed Use / Tourism / Solar Belt',
    rateSqYd: '₹4,500 – ₹7,500',
    rateSqM: '₹5,380 – ₹8,970',
    status: 'Draft Stage / OP Stage',
    roadWidth: '18m, 30m',
  },
  {
    location: '15 Peripheral Revenue Villages',
    zone: 'Agricultural Land (Pre-TP Boundary)',
    rateSqYd: '₹2,500 – ₹5,000',
    rateSqM: '₹2,990 – ₹5,980',
    status: 'AnyRoR 7/12 Revenue Land',
    roadWidth: 'Village Gaam-talav Roads',
  },
];

export default function DholeraPlotPricePage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(priceJsonLd) }}
      />
      <SiteHeader />

      {/* Hero */}
      <section className="bg-gradient-to-b from-emerald-50/60 via-slate-50 to-white text-slate-900 py-12 sm:py-16 px-4 sm:px-6 lg:px-8 border-b border-slate-200">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold tracking-wide uppercase">
            <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
            2026 Updated Market Rate Card
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight text-slate-900">
            Dholera Plot Price 2026: Official Land Rate Card &amp; Valuation Guide
          </h1>

          {/* Inverted Pyramid AEO Direct-Answer Block */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs">
            <div className="text-xs font-black uppercase tracking-wider text-emerald-700 mb-2 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              Direct Market Summary &amp; Valuation Range
            </div>
            <p className="text-sm sm:text-base leading-relaxed text-slate-700 font-medium">
              Dholera plot prices in 2026 range from ₹2,500 to ₹18,000 per sq. yard depending on Town Planning status and zone. Inside the TP 2 Activation Area, plug-and-play industrial parcels command ₹12,000–₹18,000/sq.yd, while TP 1 residential plots trade at ₹8,000–₹14,000/sq.yd, and peripheral village agricultural tracts average ₹2,500–₹6,000/sq.yd. Confirm which TP scheme and road width a parcel belongs to on the <Link href="/dholera-tp-map" className="text-blue-600 font-semibold underline decoration-blue-500/60 underline-offset-2 hover:text-blue-700">TP map in Dholera</Link> before quoting a rate.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm shadow-md shadow-emerald-700/20 transition transform hover:-translate-y-0.5"
            >
              <MapPin className="w-4 h-4" />
              Verify Plot Price on Interactive Map
            </Link>
            <Link
              href="/dholera-tp-map"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-bold text-sm shadow-xs transition"
            >
              <Layers className="w-4 h-4 text-slate-500" />
              Inspect TP 1–6 Schematics
            </Link>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
        {/* Interactive Acquisition & Outlay Calculator */}
        <PlotPriceCalculator />

        {/* Section 1: Valuation Matrix Table */}
        <section className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              2026 Interactive Valuation Matrix Across Schemes &amp; Zones
            </h2>
            <p className="text-sm text-slate-600">
              Rates reflect genuine transaction benchmarks for verified clear-title parcels and gazetted Town Planning schemes.
            </p>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-2xl bg-white shadow-xs">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="bg-slate-100/80 text-slate-700 font-bold border-b border-slate-200">
                  <th className="p-4">Location &amp; TP Scheme</th>
                  <th className="p-4">Permitted Zone</th>
                  <th className="p-4">Rate per Sq. Yard</th>
                  <th className="p-4">Rate per Sq. Meter</th>
                  <th className="p-4">Road Width Access</th>
                  <th className="p-4">Legal Readiness</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {PRICE_MATRIX.map((item, idx) => (
                  <tr key={idx} className="hover:bg-blue-50/40 transition">
                    <td className="p-4 font-bold text-slate-900">{item.location}</td>
                    <td className="p-4 text-slate-600">{item.zone}</td>
                    <td className="p-4 font-mono font-bold text-blue-700">{item.rateSqYd}</td>
                    <td className="p-4 font-mono text-slate-600">{item.rateSqM}</td>
                    <td className="p-4 font-mono text-slate-500">{item.roadWidth}</td>
                    <td className="p-4">
                      <span className="inline-block px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200 text-xs font-medium">
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Section 2: Key Price Drivers */}
        <section className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              What Governs Land Value in Dholera SIR?
            </h2>
            <p className="text-sm text-slate-600">
              Four fundamental factors determine whether a plot is worth ₹3,000 or ₹18,000 per sq. yard:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                1
              </div>
              <h3 className="text-base font-bold text-slate-900">Arterial Road Frontage (18m vs 70m)</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Under DGDCR 2024 regulations, plots abutting 55m and 70m TP roads allow higher maximum heights (up to 150m towers) and maximum FAR up to 5.0. Plots on 18m internal roads are limited to lower FAR (1.8 to 2.2).
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                2
              </div>
              <h3 className="text-base font-bold text-slate-900">Original Plot (OP) vs Final Plot (FP) Status</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Raw agricultural survey parcels (OP) carry a 40–50% future land deduction risk during town planning reconstitution. Final Plots (FP) have already completed reconstitution and represent 100% net buildable land.
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                3
              </div>
              <h3 className="text-base font-bold text-slate-900">Proximity to Mega Catalysts</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Parcels within 5 km of the ₹91k Cr Tata Semiconductor Fab or the Ahmedabad-Dholera Expressway interchange command a 40% value premium due to immediate industrial demand and executive housing requirements.
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                4
              </div>
              <h3 className="text-base font-bold text-slate-900">Topography &amp; CRZ Coastal Limits</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Land located in tidal salt pans or low-lying coastal regulation zones (CRZ) faces building restrictions and higher land filling costs. Checking topographical elevation prevents buying waterlogged parcels.
              </p>
            </div>
          </div>
        </section>

        {/* Section 3: Scams and Pricing Traps to Avoid */}
        <section className="bg-amber-50/70 border border-amber-200 rounded-3xl p-8 space-y-5">
          <div className="flex items-center gap-2.5 text-amber-800 font-black text-sm uppercase tracking-wider">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            Critical Investor Due Diligence Warning
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">
            3 Common Real Estate Pricing Traps in Dholera
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 text-xs text-slate-700 leading-relaxed">
            <div className="bg-white/80 border border-amber-200/60 rounded-xl p-4 space-y-1.5">
              <strong className="text-slate-900 block text-sm">1. Outside SIR Boundary Trap</strong>
              Selling agricultural land in outside peripheral villages claiming it is &ldquo;inside Dholera Smart City&rdquo;. Outside parcels do not get government smart utilities or TP roads.
            </div>
            <div className="bg-white/80 border border-amber-200/60 rounded-xl p-4 space-y-1.5">
              <strong className="text-slate-900 block text-sm">2. Selling OP as FP Area</strong>
              Selling 1,000 sq. yards of raw survey land without disclosing that 400–500 sq. yards will be deducted by DSIRDA when the final Town Planning scheme is sanctioned.
            </div>
            <div className="bg-white/80 border border-amber-200/60 rounded-xl p-4 space-y-1.5">
              <strong className="text-slate-900 block text-sm">3. Green / Water Buffer Lands</strong>
              Marketing un-buildable parcels situated inside green conservation belts or stormwater canals at artificially discounted &ldquo;bargain&rdquo; rates.
            </div>
          </div>
          <div className="pt-2">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 font-bold text-blue-700 hover:text-blue-900 text-xs"
            >
              Verify any plot boundary and zoning on DholeraMap before sending earnest money
              <ArrowRight className="w-3.5 h-3.5" />
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
              Dholera Plot Pricing &amp; Land Investment FAQs
            </h2>
          </div>

          <div className="space-y-4">
            {[
              {
                q: 'What is the current plot price in Dholera Smart City in 2026?',
                a: 'In 2026, plot prices in Dholera SIR range from ₹2,500 to ₹18,000 per sq. yard. Prime industrial plots in the TP 2 Activation Area command ₹12,000–₹18,000/sq.yd, TP 1 residential plots trade at ₹8,000–₹14,000/sq.yd, and peripheral village agricultural lands range from ₹2,500–₹6,000/sq.yd.',
              },
              {
                q: 'Why is there a big difference between agricultural and Final Plot (FP) prices?',
                a: 'Agricultural Original Plots (OP) undergo a 40% to 50% statutory land deduction by DSIRDA for roads and public utilities. In contrast, Final Plots (FP) are non-agricultural (NA), clear-title, geometrically demarcated parcels with immediate 18m–70m asphalt road access, underground power, and water connections.',
              },
              {
                q: 'How does road width affect plot prices in Dholera?',
                a: 'Under DGDCR regulations, plots abutting 55m and 70m arterial roads receive higher permissible Floor Space Index (FSI/FAR up to 5.0) and allow high-rise commercial development, commanding a 30% to 50% premium over plots on 18m internal roads.',
              },
              {
                q: 'Is investing in Dholera land safe from title fraud?',
                a: 'Investing in Dholera is safe when buying legally reconstituted Final Plots (FPs) under sanctioned Town Planning schemes. Buyers should always cross-verify survey numbers against the DSIRDA interactive blueprint and AnyRoR 7/12 records to ensure the parcel is not situated in a CRZ tidal basin or green buffer.',
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
