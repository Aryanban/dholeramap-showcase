import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Search, FileCheck, AlertTriangle, ArrowRight, ShieldCheck, MapPin, Database, HelpCircle, CheckCircle2 } from 'lucide-react';
import SiteHeader from '@/components/panels/SiteHeader';
import SiteFooter from '@/components/panels/SiteFooter';
import AnyRoRDocumentExplorer from '@/components/portal/AnyRoRDocumentExplorer';
import { VILLAGES } from '@/lib/villages';

export const metadata: Metadata = {
  title: 'Dholera 7/12 AnyRoR Gujarat: Land Records & Satbara Online | DholeraMap',
  description:
    'Search Dholera 7/12 AnyRoR Gujarat land records online: cross-reference 18,161 revenue survey numbers with Town Planning Final Plots (FP) in Dholera SIR.',
  keywords: [
    'Dholera 7/12',
    'Dholera AnyRoR',
    'Dholera land records',
    'Dholera survey number search',
    '7 12 Dholera SIR',
    'Dholera satbara utara',
    'Dholera revenue survey map',
    'Gujarat land records Dholera',
    'ધોલેરા ૭/૧૨ જમીન રેકોર્ડ',
    'એનીરોર ગુજરાત ધોલેરા',
    'સાતબારા આઠઅ ઓનલાઇન',
    'ધોલેરા સર્વે નંબર',
  ],
  alternates: {
    canonical: 'https://dholeramap.com/dholera-7-12-anyror-land-records',
  },
  openGraph: {
    title: 'Dholera 7/12 Land Records & AnyRoR Survey Map | DholeraMap',
    description:
      'Search Dholera 7/12 AnyRoR land records: cross-reference 18,161 revenue survey numbers with Town Planning Final Plots (FP) in Gujarat SIR.',
    url: 'https://dholeramap.com/dholera-7-12-anyror-land-records',
    siteName: 'DholeraMap',
    images: ['/logo-512.png'],
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Dholera 7/12 Land Records & AnyRoR Survey Map | DholeraMap',
    description:
      'Search Dholera 7/12 AnyRoR land records: cross-reference 18,161 revenue survey numbers with Town Planning Final Plots.',
    images: ['/logo-512.png'],
  },
};

const anyrorJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@context': 'https://schema.org',
      '@type': 'Article',
      '@id': 'https://dholeramap.com/dholera-7-12-anyror-land-records#article',
      url: 'https://dholeramap.com/dholera-7-12-anyror-land-records',
      headline: 'Dholera 7/12 Land Records: How to Cross-Verify AnyRoR Surveys with Town Planning Schemes',
      description:
        'Investor due diligence guide to verifying Gujarat AnyRoR 7/12 agricultural records, Pramanit Nond, and DSIRDA Town Planning Final Plot reconstitution in Dholera SIR.',
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
      '@id': 'https://dholeramap.com/dholera-7-12-anyror-land-records#dataset',
      name: 'Dholera SIR 18,161 Revenue Survey Numbers to Town Planning Final Plot Index',
      description:
        'Digitized interactive cross-reference registry mapping Gujarat AnyRoR revenue surveys to sanctioned DSIRDA Town Planning schemes.',
      url: 'https://dholeramap.com/dholera-7-12-anyror-land-records',
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      '@id': 'https://dholeramap.com/dholera-7-12-anyror-land-records#faq',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'What is an AnyRoR 7/12 record in Dholera, Gujarat?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'An AnyRoR 7/12 record (Satbara Utbara) is an official extract from the Gujarat Land Revenue Register. Form 7 contains ownership details, survey numbers, and tenancy, while Form 12 details crop cultivation, water sources, and encumbrances.',
          },
        },
        {
          '@type': 'Question',
          name: 'How do I check if a 7/12 survey number in Dholera has a Final Plot (FP)?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Enter the village name and survey number into the DholeraMap search engine (or browse our Village Directory). If the parcel falls within a sanctioned preliminary scheme like TP 1 or TP 2, our engine displays the reconstituted Final Plot number, net buildable area, and road width.',
          },
        },
        {
          '@type': 'Question',
          name: 'What is Section 73AA restriction in Gujarat land records?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Section 73AA of the Gujarat Land Revenue Code restricts the sale or transfer of land owned by Scheduled Tribes to non-tribal individuals without prior written sanction from the District Collector. Buyers must verify that the 7/12 record does not carry a 73AA restriction.',
          },
        },
        {
          '@type': 'Question',
          name: 'What does Pramanit Nond mean in AnyRoR 6-Hakki Patrak?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Pramanit Nond signifies a certified mutation entry confirmed by the Mamlatdar or Revenue Officer, legally validating title transfers, inheritance, or land acquisition. Uncertified entries (Kacchi Nond) remain subject to legal dispute.',
          },
        },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      '@id': 'https://dholeramap.com/dholera-7-12-anyror-land-records#breadcrumb',
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
          name: 'Dholera 7/12 Land Records',
          item: 'https://dholeramap.com/dholera-7-12-anyror-land-records',
        },
      ],
    },
  ],
};


export default function Dholera712RecordsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(anyrorJsonLd) }}
      />
      <SiteHeader />

      {/* Hero */}
      <section className="bg-gradient-to-b from-amber-50/70 via-slate-50 to-white text-slate-900 py-12 sm:py-16 px-4 sm:px-6 lg:px-8 border-b border-amber-200">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100/80 border border-amber-300 text-amber-900 text-xs font-black tracking-wide uppercase">
            <Database className="w-3.5 h-3.5 text-amber-700" />
            Statutory AnyRoR Gujarat Revenue Registry &amp; TP Reconstitution
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight text-slate-900">
            Dholera 7/12 Land Records: AnyRoR Revenue Survey to Final Plot Map
          </h1>

          {/* Inverted Pyramid AEO Direct-Answer Block */}
          <div className="bg-white border border-amber-200/90 rounded-2xl p-5 sm:p-6 shadow-xs">
            <div className="text-xs font-black uppercase tracking-wider text-amber-800 mb-2 flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-amber-600" />
              Statutory Land Record Definition
            </div>
            <p className="text-sm sm:text-base leading-relaxed text-slate-700 font-medium">
              Dholera 7/12 land records are official revenue documents published on Gujarat&apos;s AnyRoR portal (anyror.gujarat.gov.in) detailing agricultural land ownership, survey numbers, and tenancy. In Dholera SIR, each 7/12 survey parcel is reconstituted into a Town Planning Final Plot (FP) with statutory 40–50% area deductions. Cross-verify any reconstituted Final Plot against the sanctioned <Link href="/dholera-tp-map" className="text-blue-600 font-semibold underline decoration-blue-500/60 underline-offset-2 hover:text-blue-700">town planning map in Dholera</Link>, then locate the parcel on the interactive <Link href="/" className="text-blue-600 font-semibold underline decoration-blue-500/60 underline-offset-2 hover:text-blue-700">Dholera SIR map</Link>.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-bold text-sm shadow-md shadow-amber-700/20 transition transform hover:-translate-y-0.5"
            >
              <Search className="w-4 h-4" />
              Search 18,161 Survey Numbers on Live Map
            </Link>
            <Link
              href="/dholera-tp-map"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-bold text-sm shadow-xs transition"
            >
              View TP Schemes 1–6
              <ArrowRight className="w-4 h-4 text-slate-500" />
            </Link>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
        {/* Interactive Revenue Document & Due Diligence Explorer */}
        <AnyRoRDocumentExplorer />

        {/* Section 1: Step by Step Verification Guide */}
        <section className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              4-Step Due Diligence: Verifying AnyRoR Records Against TP Schemes
            </h2>
            <p className="text-sm text-slate-600">
              Follow this procedure before making any advance payment on property in Dholera SIR:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 font-black text-sm flex items-center justify-center">
                1
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Download AnyRoR 7/12 &amp; 8A</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Check the official landholder name, survey number, and ensure there are no active bank liens or court injunctions.
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 font-black text-sm flex items-center justify-center">
                2
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Search on DholeraMap</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Enter the village name and survey number into DholeraMap to locate the parcel’s exact vector coordinates on the official blueprint.
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 font-black text-sm flex items-center justify-center">
                3
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Verify Reconstituted FP</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Identify if the survey has been awarded a Final Plot (FP) in Form 4/5, and calculate the net buildable area after the 40–50% deduction.
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 font-black text-sm flex items-center justify-center">
                4
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Check Road Width &amp; FAR</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Verify that the planned road fronting the plot is at least 18m or 30m wide to secure full DGDCR commercial building permissions.
              </p>
            </div>
          </div>

          {/* AnyRoR vs TP Final Plot Comparison Table */}
          <div className="mt-8 bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
            <div className="p-5 border-b border-slate-200 bg-slate-50/50">
              <h3 className="text-lg font-bold text-slate-900">
                AnyRoR 7/12 Revenue Land vs Dholera Town Planning Final Plot (FP)
              </h3>
              <p className="text-xs text-slate-600 mt-1">
                Crucial statutory distinctions between raw agricultural revenue surveys and reconstituted Town Planning parcels.
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-100/75 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Parameter</th>
                    <th className="py-3 px-4">Gujarat AnyRoR 7/12 (OP)</th>
                    <th className="py-3 px-4">Dholera TP Final Plot (FP)</th>
                    <th className="py-3 px-4">Buyer Due Diligence Impact</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-600">
                  <tr className="hover:bg-slate-50/75">
                    <td className="py-3.5 px-4 font-semibold text-slate-900">Statutory Character</td>
                    <td className="py-3.5 px-4">Agricultural revenue holding (Record of Rights)</td>
                    <td className="py-3.5 px-4 font-semibold text-blue-700">Reconstituted urban parcel under GTPUD Act 1976</td>
                    <td className="py-3.5 px-4">FP has statutory title indemnity under Town Planning law</td>
                  </tr>
                  <tr className="hover:bg-slate-50/75">
                    <td className="py-3.5 px-4 font-semibold text-slate-900">Area &amp; Deduction</td>
                    <td className="py-3.5 px-4">100% gross agricultural acreage</td>
                    <td className="py-3.5 px-4 font-semibold text-blue-700">50% net reconstituted area (50% deducted for roads &amp; amenities)</td>
                    <td className="py-3.5 px-4">Never buy raw survey by sq. yard without factoring 50% deduction</td>
                  </tr>
                  <tr className="hover:bg-slate-50/75">
                    <td className="py-3.5 px-4 font-semibold text-slate-900">Boundary &amp; Access</td>
                    <td className="py-3.5 px-4">Approximate revenue stones; often landlocked</td>
                    <td className="py-3.5 px-4 font-semibold text-blue-700">DGPS coordinates with 18m, 30m, 55m, or 70m arterial road</td>
                    <td className="py-3.5 px-4">FP guarantees legal, unencumbered physical road access</td>
                  </tr>
                  <tr className="hover:bg-slate-50/75">
                    <td className="py-3.5 px-4 font-semibold text-slate-900">Building Permission (FAR)</td>
                    <td className="py-3.5 px-4">Requires tedious NA (Non-Agricultural) conversion</td>
                    <td className="py-3.5 px-4 font-semibold text-blue-700">Pre-zoned DGDCR building permissions (FAR 1.5 to 5.0)</td>
                    <td className="py-3.5 px-4">Instant development approval through single-window clearance</td>
                  </tr>
                  <tr className="hover:bg-slate-50/75">
                    <td className="py-3.5 px-4 font-semibold text-slate-900">Utility Infrastructure</td>
                    <td className="py-3.5 px-4">No water, drainage, or high-speed fiber conduits</td>
                    <td className="py-3.5 px-4 font-semibold text-blue-700">Plug-and-play smart ducts, ICT, treated water, gas pipelines</td>
                    <td className="py-3.5 px-4">Drastically reduces private construction and operational CAPEX</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Section 2: 15 Revenue Villages Directory */}
        <section className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              22 Gazetted Revenue Villages in Dholera SIR
            </h2>
            <p className="text-sm text-slate-600">
              Browse any village below to inspect digitized survey parcels, Town Planning schemes, and DGDCR building regulations:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {VILLAGES.map((v) => (
              <Link
                key={v.slug}
                href={`/village/${v.slug}`}
                className="bg-white border border-slate-200 hover:border-blue-500 rounded-2xl p-4 shadow-xs hover:shadow-md transition flex items-center justify-between group"
              >
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-blue-500" />
                    Village {v.name}
                  </h3>
                  <div className="text-[11px] font-mono text-slate-500">
                    Scheme: {v.scheme}
                  </div>
                  <div className="text-[11px] text-slate-600">
                    {v.zone}
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition" />
              </Link>
            ))}
          </div>
        </section>

        {/* Section 3: Legal Red Flags & Scams Checklist */}
        <section className="bg-amber-50/70 border border-amber-200 rounded-3xl p-8 space-y-5">
          <div className="flex items-center gap-2 text-amber-800 font-black text-sm uppercase tracking-wider">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            Gujarat Land Revenue Act Legal Traps
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">
            3 Critical Legal Restrictions to Check on 7/12 Extracts
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 text-xs text-slate-700 leading-relaxed">
            <div className="bg-white/80 border border-amber-200/60 rounded-xl p-4 space-y-1.5">
              <strong className="text-slate-900 block text-sm">1. Section 73AA / Tribal Land</strong>
              Land held under 73AA restrictions cannot be transferred to non-tribals without prior written permission from the District Collector. Unsanctioned deals are void.
            </div>
            <div className="bg-white/80 border border-amber-200/60 rounded-xl p-4 space-y-1.5">
              <strong className="text-slate-900 block text-sm">2. New Tenure vs Old Tenure</strong>
              New Tenure (Nayi Shart) land requires payment of statutory government premium (chhani/nazarana) before being converted into buildable freehold Non-Agricultural (NA) land.
            </div>
            <div className="bg-white/80 border border-amber-200/60 rounded-xl p-4 space-y-1.5">
              <strong className="text-slate-900 block text-sm">3. Pending Revenue Litigations</strong>
              Always inspect Form 6 (Hakki Patrak) for pending civil disputes or un-adjudicated heir inheritance claims (Varsai Nond).
            </div>
          </div>

          <div className="pt-2 border-t border-amber-200/70 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <span className="text-amber-900 font-medium">
              Want to see how an audited parcel title record looks with SHA-256 cryptographic verification?
            </span>
            <Link
              href="/verify/DHO-TP1_RESIDENTIAL_R1-101-AUTH"
              rel="nofollow"
              prefetch={false}
              className="px-4 py-2 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs shadow-xs transition shrink-0"
            >
              Inspect Sample Audit Dossier →
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
              Dholera 7/12 Records &amp; Land Verification FAQs
            </h2>
          </div>

          <div className="space-y-4">
            {[
              {
                q: 'What is an AnyRoR 7/12 record in Dholera, Gujarat?',
                a: 'An AnyRoR 7/12 record (Satbara Utbara) is an official extract from the Gujarat Land Revenue Register. Form 7 contains ownership details, survey numbers, and tenancy, while Form 12 details crop cultivation, water sources, and encumbrances.',
              },
              {
                q: 'How do I check if a 7/12 survey number in Dholera has a Final Plot (FP)?',
                a: 'Enter the village name and survey number into the DholeraMap search engine (or browse our Village Directory). If the parcel falls within a sanctioned preliminary scheme like TP 1 or TP 2, our engine displays the reconstituted Final Plot number, net buildable area, and road width.',
              },
              {
                q: 'What is Section 73AA restriction in Gujarat land records?',
                a: 'Section 73AA of the Gujarat Land Revenue Code restricts the sale or transfer of land owned by Scheduled Tribes to non-tribal individuals without prior written sanction from the District Collector. Buyers must verify that the 7/12 record does not carry a 73AA restriction.',
              },
              {
                q: 'What does Pramanit Nond mean in AnyRoR 6-Hakki Patrak?',
                a: 'Pramanit Nond signifies a certified mutation entry confirmed by the Mamlatdar or Revenue Officer, legally validating title transfers, inheritance, or land acquisition. Uncertified entries (Kacchi Nond) remain subject to legal dispute.',
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
