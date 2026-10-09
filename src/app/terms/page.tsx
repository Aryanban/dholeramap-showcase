import React from 'react';
import type { Metadata } from 'next';
import SiteHeader from '@/components/panels/SiteHeader';
import SiteFooter from '@/components/panels/SiteFooter';

export const metadata: Metadata = {
  title: 'Terms of Service | DholeraMap',
  description: 'Terms of Service, user agreement, geospatial data disclaimers, and service conditions for PlotBook Dholera SIR Interactive Atlas (dholeramap.com).',
  alternates: {
    canonical: 'https://dholeramap.com/terms',
  },
  openGraph: {
    title: 'Terms of Service | DholeraMap',
    description: 'Terms of Service, user agreement, geospatial data disclaimers, and service conditions for PlotBook Dholera SIR Interactive Atlas (dholeramap.com).',
    url: 'https://dholeramap.com/terms',
    siteName: 'DholeraMap',
    images: ['/logo-512.png'],
    locale: 'en_IN',
    type: 'article',
  },
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col font-sans">
      <SiteHeader />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              Legal &amp; Compliance
            </span>
            <span className="text-[11px] text-slate-400">Effective Date: September 2026</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
            Terms of Service
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Please review the statutory terms and operational conditions governing the use of PlotBook (dholeramap.com) interactive GIS intelligence platform.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs text-xs sm:text-sm text-slate-700 leading-relaxed">
          {/* Section 1 */}
          <section className="space-y-2">
            <h2 className="text-base font-black text-slate-900">1. Acceptance of Terms</h2>
            <p>
              By accessing, browsing, or using <strong>PlotBook</strong> (&ldquo;dholeramap.com&rdquo;, &ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;platform&rdquo;), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-2">
            <h2 className="text-base font-black text-slate-900">2. Description of Service &amp; Interactive Cartography</h2>
            <p>
              PlotBook is a specialized geospatial visualization platform and digital real estate CRM designed for the <strong>Dholera Special Investment Region (SIR)</strong>, Gujarat. The service provides interactive map tiles, statutory survey cross-referencing, Town Planning scheme overlays (TP 1 through TP 6), DGDCR zoning specifications, road width analyses, and local document management tools.
            </p>
          </section>

          {/* Section 3 */}
          <section className="space-y-2">
            <h2 className="text-base font-black text-slate-900">3. Statutory Disclaimer &amp; RERA Notice</h2>
            <p>
              PlotBook operates strictly as an independent geospatial compiler and analytics platform. PlotBook:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-slate-600">
              <li>Is not a real estate promoter, broker, or agent under the Real Estate (Regulation and Development) Act (RERA).</li>
              <li>Does not warrant the statutory legal ownership of individual plots. Cartographic boundaries and Form 4/5 survey allocations are compiled from public Gujarat Government Gazette notifications and DSIRDA development plans.</li>
              <li>Strongly advises all investors, purchasers, and developers to perform formal legal due diligence through the relevant sub-registrar office, revenue authorities, and DSIRDA before entering into binding commercial transactions.</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="space-y-2">
            <h2 className="text-base font-black text-slate-900">4. Local-First Document Storage (IndexedDB)</h2>
            <p>
              Statutory documents attached to your saved plots (e.g., Satbara 7/12 extracts, allotment letters, possession receipts, or title deeds) are processed and stored <strong>exclusively in your local browser’s IndexedDB vault</strong> via client-side encryption. They are not transmitted to or stored on PlotBook cloud servers, ensuring strict confidentiality of your title assets.
            </p>
          </section>

          {/* Section 5 */}
          <section className="space-y-2">
            <h2 className="text-base font-black text-slate-900">5. Subscriptions, Payments &amp; Billing</h2>
            <p>
              Certain advanced geospatial intelligence features, CRM capacity, and export tools require an active subscription (Pro or Max). All payments are securely processed via <strong>Razorpay</strong>. Subscriptions are billed on a recurring monthly or annual basis as specified during checkout. You may cancel your subscription at any time through your Account &amp; Billing dashboard.
            </p>
          </section>

          {/* Section 6 */}
          <section className="space-y-2">
            <h2 className="text-base font-black text-slate-900">6. User Accounts &amp; Authentication</h2>
            <p>
              Authentication is provided via <strong>Clerk</strong>. You are responsible for safeguarding your login credentials and for all activities that occur under your account. We reserve the right to suspend or terminate accounts that engage in automated scraping, denial of service attacks, or unauthorized tampering with map assets.
            </p>
          </section>

          {/* Section 7 */}
          <section className="space-y-2">
            <h2 className="text-base font-black text-slate-900">7. Intellectual Property</h2>
            <p>
              All software, UI design, vector tile pipelines, indexing algorithms, and branding elements associated with PlotBook are the intellectual property of PlotBook. You may not reverse-engineer, decompile, or scrape tile pyramids for unauthorized commercial distribution without written consent.
            </p>
          </section>

          {/* Section 8 */}
          <section className="space-y-2">
            <h2 className="text-base font-black text-slate-900">8. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by applicable law, PlotBook and its operators shall not be liable for any indirect, incidental, or consequential damages, loss of profits, or land dispute expenses arising from reliance on maps or data provided on the platform.
            </p>
          </section>

          {/* Section 9 */}
          <section className="space-y-2">
            <h2 className="text-base font-black text-slate-900">9. Governing Law &amp; Jurisdiction</h2>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of India. Any disputes arising in connection with these Terms shall be subject to the exclusive jurisdiction of the courts of Gujarat, India.
            </p>
          </section>

          {/* Section 10 */}
          <section className="space-y-2 pt-2 border-t border-slate-100">
            <h2 className="text-base font-black text-slate-900">10. Contact Us</h2>
            <p>
              If you have any questions regarding these Terms of Service, please contact us at:
            </p>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-mono text-slate-700">
              Email: <a href="mailto:aryanbanc@gmail.com" className="text-blue-600 font-bold hover:underline">aryanbanc@gmail.com</a><br />
              Entity: PlotBook Operations Desk<br />
              Platform: https://dholeramap.com
            </div>
          </section>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
