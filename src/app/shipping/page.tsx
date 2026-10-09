import React from 'react';
import type { Metadata } from 'next';
import SiteHeader from '@/components/panels/SiteHeader';
import SiteFooter from '@/components/panels/SiteFooter';

export const metadata: Metadata = {
  title: 'Shipping & Digital Delivery Policy | DholeraMap',
  description:
    'Shipping and digital delivery policy for PlotBook Dholera interactive mapping services, Dealer Pro passes, and electronic title dossiers.',
  alternates: {
    canonical: 'https://dholeramap.com/shipping',
  },
  openGraph: {
    title: 'Shipping & Digital Delivery Policy | DholeraMap',
    description:
      'Shipping and digital delivery policy for PlotBook Dholera interactive mapping services, Dealer Pro passes, and electronic title dossiers.',
    url: 'https://dholeramap.com/shipping',
    siteName: 'DholeraMap',
    images: ['/logo-512.png'],
    locale: 'en_IN',
    type: 'website',
  },
};

export default function ShippingPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col font-sans">
      <SiteHeader activePage="billing" />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        {/* Header */}
        <div className="space-y-2 border-b border-slate-200 pb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold">
            <span>Razorpay Merchant &amp; Consumer Compliance</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-950">
            Shipping &amp; Digital Delivery Policy
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Last updated: September 18, 2026 · Electronic Delivery Standard for Cloud &amp; GIS Intelligence Products.
          </p>
        </div>

        {/* Content */}
        <div className="space-y-8 text-xs sm:text-sm text-slate-700 leading-relaxed bg-white p-6 sm:p-10 rounded-3xl border border-slate-200 shadow-xs">
          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-black text-slate-900">
              1. 100% Digital Delivery Mechanism
            </h2>
            <p>
              PlotBook Dholera (<span className="font-semibold text-slate-900">dholeramap.com</span>) is a cloud-native software-as-a-service (SaaS) and geospatial intelligence platform. All products, subscription tiers (such as <strong>Dealer Pro</strong> and <strong>Enterprise Max</strong>), and statutory land dossiers provided on this website are{' '}
              <strong>exclusively digital goods and services</strong>.
            </p>
            <p className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-amber-900 text-xs sm:text-sm">
              <strong>Notice on Physical Shipping:</strong> We do not dispatch physical parcel shipments, paper maps via postal courier, or tangible hardware. Consequently, no physical shipping fees, logistics surcharges, or courier transit times apply to any transactions on this website.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-black text-slate-900">
              2. Delivery Timeline &amp; Instant Fulfillment
            </h2>
            <p>
              Digital service delivery is structured as follows:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-slate-600">
              <li>
                <strong>SaaS Subscriptions &amp; Feature Access:</strong> Upon successful transaction authorization by Razorpay (UPI, Credit/Debit Card, or NetBanking), elevated privileges (unlimited plot bookmarks, FAR calculators, and local land registry document vaults) are unlocked <strong>instantaneously (within 0 to 60 seconds)</strong>.
              </li>
              <li>
                <strong>Interactive Title Dossiers &amp; PDF Scrutiny Reports:</strong> Automated parcel title dossiers and georeferenced survey boundary reports are compiled and made available for instant download in high-resolution PDF format immediately upon generation.
              </li>
              <li>
                <strong>Tax Invoices &amp; Transaction Slips:</strong> A GST-compliant electronic receipt and tax invoice containing the Razorpay Payment ID are generated and dispatched to your registered email address immediately following payment settlement.
              </li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-black text-slate-900">
              3. Shipping &amp; Handling Fees
            </h2>
            <p>
              Because all services are delivered over high-speed HTTPS infrastructure:
            </p>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-800 font-semibold text-xs flex items-center justify-between">
              <span>Standard Digital Delivery &amp; Server Bandwidth Charge</span>
              <span className="text-emerald-700 font-black">₹0.00 (FREE)</span>
            </div>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-black text-slate-900">
              4. Non-Receipt or Access Assistance
            </h2>
            <p>
              If you have completed a payment and do not see your subscription privileges active or are unable to download your generated dossier within 5 minutes of transaction completion:
            </p>
            <ol className="list-decimal pl-5 space-y-1.5 text-slate-600">
              <li>Refresh your browser session or re-authenticate via the sign-in portal.</li>
              <li>Check your spam/promotions folder for the Razorpay electronic receipt.</li>
              <li>Contact our technical operations desk with your Payment ID at <a href="mailto:aryanbanc@gmail.com" className="text-blue-600 font-semibold">aryanbanc@gmail.com</a>. Our engineering team resolves access tickets within 2 to 4 business hours.</li>
            </ol>
          </section>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
