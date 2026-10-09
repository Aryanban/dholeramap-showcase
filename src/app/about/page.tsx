import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import SiteHeader from '@/components/panels/SiteHeader';
import SiteFooter from '@/components/panels/SiteFooter';
import { Map, Zap, ShieldCheck } from 'lucide-react';

export const metadata: Metadata = {
  title: 'About DholeraMap | Dholera SIR Interactive GIS Atlas',
  description:
    'About DholeraMap: the geospatial platform digitizing 18,161 survey numbers, TP 1–6 town planning schemes, and DGDCR building regulations.',
  alternates: {
    canonical: 'https://dholeramap.com/about',
  },
  openGraph: {
    title: 'About DholeraMap | Dholera SIR Interactive GIS Atlas',
    description:
      'About DholeraMap: the geospatial platform digitizing 18,161 survey numbers, TP 1–6 town planning schemes, and DGDCR building regulations.',
    url: 'https://dholeramap.com/about',
    siteName: 'DholeraMap',
    images: ['/logo-512.png'],
    locale: 'en_IN',
    type: 'website',
  },
};

const aboutJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@context': 'https://schema.org',
      '@type': 'AboutPage',
      '@id': 'https://dholeramap.com/about#webpage',
      url: 'https://dholeramap.com/about',
      name: 'About DholeraMap | Dholera SIR Interactive GIS Atlas',
      description:
        'PlotBook Dholera is the authoritative geospatial interactive map and town planning atlas for Dholera Special Investment Region, Gujarat.',
      publisher: {
        '@type': 'Organization',
        name: 'PlotBook Technologies',
        url: 'https://dholeramap.com',
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'What is PlotBook Dholera?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'PlotBook Dholera is an open-access geospatial intelligence platform for Dholera SIR, Gujarat. It digitizes 18,161 revenue survey numbers, six Town Planning schemes (TP 1–6), and DGDCR regulations.',
          },
        },
        {
          '@type': 'Question',
          name: 'How does PlotBook verify land parcels in Dholera SIR?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'PlotBook cross-references statutory Gujarat Revenue Department village maps with sanctioned DSIRDA Town Planning scheme draft blueprints to verify road widths, zoning, and reconstituted final plot boundaries.',
          },
        },
      ],
    },
  ],
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col font-sans">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutJsonLd) }}
      />
      <SiteHeader activePage="guide" />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        {/* Hero */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold">
            <span>Geospatial Intelligence for India&apos;s 1st Greenfield Smart City</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-950">
            Digitizing Interactive Land Intelligence for Dholera SIR
          </h1>
          {/* Direct-Answer Inverted Pyramid Box */}
          <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 text-left text-xs sm:text-sm text-slate-700 leading-relaxed">
            <strong className="block text-xs uppercase tracking-wider font-black text-blue-900 mb-1">
              Authoritative Platform Definition
            </strong>
            <p className="font-medium text-slate-900">
              DholeraMap is an open-access geospatial intelligence platform for Dholera Special Investment Region (SIR), Gujarat. It digitizes 18,161 statutory revenue survey numbers, six Town Planning schemes (TP 1–6), and DGDCR building regulations to deliver instant interactive due diligence for real estate investors and developers.
            </p>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            DholeraMap (<span className="font-semibold text-slate-900">dholeramap.com</span>) bridges the gap between complex government revenue survey records, Town Planning scheme blueprints, and modern digital real estate transactions.
          </p>
        </div>

        {/* Section 1: Core Platform Capabilities */}
        <section className="space-y-6">
          <h2 className="text-xl font-black text-slate-900 text-center sm:text-left">
            Core Platform Capabilities
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Map className="w-5 h-5 stroke-[1.75]" />
              </div>
              <h3 className="text-base font-black text-slate-900">18,161+ Georeferenced Parcels</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                We have indexed statutory village revenue survey numbers across 22 revenue villages including Ambli, Hebatpur, Bavaliyari, Bhadiyad, Kadipur, and Dholera Town, aligned precisely with Town Planning (TP 1 through TP 6) blueprints.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Zap className="w-5 h-5 stroke-[1.75]" />
              </div>
              <h3 className="text-base font-black text-slate-900">60 FPS Vector GIS Engine</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Replacing slow, unreadable scanned paper maps with smooth web-tiled vector pyramids. Instant search by Village Name, Survey/Block Number, or Town Planning Final Plot (FP) identifier.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 stroke-[1.75]" />
              </div>
              <h3 className="text-base font-black text-slate-900">Local-First Privacy Architecture</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Real estate documents, 7/12 Satbara extracts, and client negotiation notes are stored exclusively in your browser&apos;s IndexedDB encrypted storage. Zero cloud exposure of your private deal records.
              </p>
            </div>
          </div>
        </section>

        {/* Section 2: Specifications Table (AEO) */}
        <section className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
          <h2 className="text-lg sm:text-xl font-black text-slate-900">
            Platform Specifications &amp; Data Verification
          </h2>
          <p className="text-xs text-slate-500">
            Comparative analysis of PlotBook GIS atlas capabilities versus traditional revenue map inspections.
          </p>
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-700 border-b border-slate-200 font-bold">
                  <th className="p-3">Feature Parameter</th>
                  <th className="p-3">PlotBook Digital GIS</th>
                  <th className="p-3">Traditional Paper Blueprint</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-600">
                <tr>
                  <td className="p-3 font-semibold text-slate-900">Interactive Search</td>
                  <td className="p-3 text-blue-700 font-semibold">Instant by Survey / FP Number</td>
                  <td className="p-3">Manual Sheet Cross-Referencing</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-slate-900">TP Scheme Frontage</td>
                  <td className="p-3 text-blue-700 font-semibold">18m, 30m, 55m, 70m Measured</td>
                  <td className="p-3">Physical Scale Ruler Required</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-slate-900">Zoning Envelope</td>
                  <td className="p-3 text-blue-700 font-semibold">Automated DGDCR 2024 FAR / Height</td>
                  <td className="p-3">Manual Gazette Consultation</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-slate-900">Device Mobility</td>
                  <td className="p-3 text-blue-700 font-semibold">Mobile GIS with Live GPS On-Site</td>
                  <td className="p-3">Bulky Cloth/Paper Scans Only</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Section 3: Detailed Mission & Purpose */}
        <section className="p-8 sm:p-10 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-6 text-xs sm:text-sm text-slate-700 leading-relaxed">
          <div className="space-y-2 border-b border-slate-100 pb-4">
            <h2 className="text-lg sm:text-xl font-black text-slate-900">Our Mission &amp; Purpose</h2>
            <p className="text-xs text-slate-500">Transforming physical land verification into instant, verifiable spatial truth.</p>
          </div>

          <p>
            The Dholera Special Investment Region (SIR) spans over 920 square kilometers of planned industrial, residential, and high-tech manufacturing zones (including India’s premier semiconductor fabrication ecosystem). Traditionally, evaluating land title, zoning permissions, and road right-of-way required weeks of manual cross-referencing between Revenue Department village maps and DSIRDA Town Planning Draft Schemes.
          </p>
          <p>
            PlotBook was created to provide investors, property consultants, industrial developers, and local landowners with an authoritative, unified geospatial platform:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <strong className="text-slate-900 block">DGDCR 2024 Building Regulations</strong>
              <span className="text-slate-600 text-xs">Calculates permissible Floor Area Ratio (FAR), maximum building heights, and setbacks based on abutting road widths.</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <strong className="text-slate-900 block">WhatsApp Client Dossier Sharing</strong>
              <span className="text-slate-600 text-xs">Enables certified brokers to generate instant, branded plot dossiers with live coordinates and satellite imagery for clients.</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <strong className="text-slate-900 block">Statutory Revenue Alignment</strong>
              <span className="text-slate-600 text-xs">Cross-indexes Form 4 (original survey) to Form 5 (reconstituted final plot) under the Gujarat Town Planning Act.</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <strong className="text-slate-900 block">Secure Indian Banking &amp; Razorpay</strong>
              <span className="text-slate-600 text-xs">Supports frictionless payments via UPI, RuPay, Visa, Mastercard, and NetBanking with automated GST invoicing.</span>
            </div>
          </div>
        </section>

        {/* CTA Bar */}
        <div className="p-8 rounded-3xl bg-gradient-to-r from-blue-700 to-indigo-800 text-white shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-1">
            <h2 className="text-lg font-black">Explore Dholera SIR on the Interactive Map</h2>
            <p className="text-xs text-blue-100">Access vector interactive boundaries, zoning layers, and high-resolution satellite imagery.</p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="px-5 py-2.5 rounded-xl bg-white text-blue-700 text-xs font-bold hover:bg-blue-50 transition shadow-sm cursor-pointer whitespace-nowrap"
            >
              Launch Interactive Map →
            </Link>
            <Link
              href="/pricing"
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold border border-blue-400/40 transition cursor-pointer whitespace-nowrap"
            >
              View Plans
            </Link>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
