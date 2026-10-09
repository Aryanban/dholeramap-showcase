import React from 'react';
import type { Metadata } from 'next';
import SiteHeader from '@/components/panels/SiteHeader';
import SiteFooter from '@/components/panels/SiteFooter';

export const metadata: Metadata = {
  title: 'Interactive Map & Legal Disclaimer | DholeraMap',
  description:
    'Statutory disclaimer regarding GIS spatial data, Gujarat Town Planning schemes (TP 1–6), DSIRDA master plan alignments, and Gujarat RERA compliance.',
  alternates: {
    canonical: 'https://dholeramap.com/disclaimer',
  },
  openGraph: {
    title: 'Interactive Map & Legal Disclaimer | DholeraMap',
    description:
      'Statutory disclaimer regarding GIS spatial data, Gujarat Town Planning schemes (TP 1–6), DSIRDA master plan alignments, and Gujarat RERA compliance.',
    url: 'https://dholeramap.com/disclaimer',
    siteName: 'DholeraMap',
    images: ['/logo-512.png'],
    locale: 'en_IN',
    type: 'website',
  },
};

export default function DisclaimerPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col font-sans">
      <SiteHeader activePage="guide" />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        {/* Header */}
        <div className="space-y-2 border-b border-slate-200 pb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold">
            <span>Statutory GIS &amp; Real Estate Notice</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-950">
            Interactive Map &amp; Regulatory Disclaimer
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Last updated: September 18, 2026 · Notice on Geospatial Data Accuracy and Regulatory Compliance.
          </p>
        </div>

        {/* Content */}
        <div className="space-y-8 text-xs sm:text-sm text-slate-700 leading-relaxed bg-white p-6 sm:p-10 rounded-3xl border border-slate-200 shadow-xs">
          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-black text-slate-900">
              1. Non-Governmental Entity Disclosure
            </h2>
            <p>
              PlotBook Dholera (<span className="font-semibold text-slate-900">dholeramap.com</span>) is an independent private geographic information system (GIS) and real estate software platform developed by PlotBook Technologies.
            </p>
            <p className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-amber-900 text-xs sm:text-sm">
              <strong>Important Notice:</strong> This website is <strong>NOT</strong> an official portal of, nor is it directly affiliated with, sponsored by, or operated by the <strong>Dholera Special Investment Region Development Authority (DSIRDA)</strong>, the <strong>Gujarat Industrial Development Corporation (GIDC)</strong>, the <strong>Revenue Department of the Government of Gujarat</strong>, or any other state or central government instrumentality.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-black text-slate-900">
              2. Informational Geospatial Reference Only
            </h2>
            <p>
              All spatial boundaries, village survey maps, Town Planning scheme overlays (Draft/Sanctioned TP Schemes 1 through 6), zoning classifications, and road right-of-way dimensions displayed on this platform are compiled from public records, statutory town planning notifications under the <em>Gujarat Town Planning and Urban Development Act, 1976 (GTPUDA)</em>, and georeferenced satellite imagery.
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
              <li>
                <strong>No Official Certified Extract:</strong> The maps, coordinate readouts, and downloadable dossiers provided by this website do not constitute legal title certificates, certified 7/12 Satbara extracts, Form 8A records, or certified Town Planning Form 4/5 allotment orders.
              </li>
              <li>
                <strong>Official Verification:</strong> For legally binding transactions, conveyance deeds, mortgage registrations, or building permission applications, users must obtain official certified copies from the competent authority (DSIRDA, City Survey Superintendent, Mamlatdar, or the AnyRoR / e-Dhara revenue portal of Gujarat).
              </li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-black text-slate-900">
              3. GujRERA Non-Brokerage &amp; Non-Promoter Disclaimer
            </h2>
            <p>
              Under the <em>Real Estate (Regulation and Development) Act, 2016 (RERA)</em> and Gujarat RERA rules:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
              <li>
                PlotBook operates exclusively as a technology software provider, data visualization suite, and directory. PlotBook does not solicit investments, act as an unlicensed real estate broker, or hold escrow funds for land acquisitions.
              </li>
              <li>
                Independent brokers and consultants featured on the platform directory are solely responsible for maintaining their active Gujarat RERA registration numbers and complying with local commercial laws.
              </li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-black text-slate-900">
              4. Limitation of Liability
            </h2>
            <p>
              While reasonable efforts are made to ensure the highest degree of georeferencing precision, survey boundary lines may be subject to minor distortions arising from map sheet scanning, projection transformations, or pending government boundary reconciliations. PlotBook Technologies and its contributors expressly disclaim liability for any direct, indirect, consequential, or financial damages resulting from reliance on the geospatial data presented herein.
            </p>
          </section>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
