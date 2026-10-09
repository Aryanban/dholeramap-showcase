import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import SiteHeader from '@/components/panels/SiteHeader';
import SiteFooter from '@/components/panels/SiteFooter';

export const metadata: Metadata = {
  title: 'Cancellation & Refund Policy | DholeraMap',
  description:
    'Cancellation and refund policy for PlotBook Dholera interactive map subscriptions, Dealer Pro passes, and digital title dossier services.',
  alternates: {
    canonical: 'https://dholeramap.com/refund',
  },
  openGraph: {
    title: 'Cancellation & Refund Policy | DholeraMap',
    description:
      'Cancellation and refund policy for PlotBook Dholera interactive map subscriptions, Dealer Pro passes, and digital title dossier services.',
    url: 'https://dholeramap.com/refund',
    siteName: 'DholeraMap',
    images: ['/logo-512.png'],
    locale: 'en_IN',
    type: 'website',
  },
};

export default function RefundPage() {
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
            Cancellation &amp; Refund Policy
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Last updated: September 18, 2026 · Effective for all subscriptions, passes, and digital reports.
          </p>
        </div>

        {/* Content Sections */}
        <div className="space-y-8 text-xs sm:text-sm text-slate-700 leading-relaxed bg-white p-6 sm:p-10 rounded-3xl border border-slate-200 shadow-xs">
          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-black text-slate-900">
              1. Overview of Services
            </h2>
            <p>
              PlotBook Dholera (<span className="font-semibold text-slate-900">dholeramap.com</span>) provides digital interactive geographic information system (GIS) mapping, Town Planning scheme blueprints (TP 1–6), revenue survey boundary analytics, local-first land registry document tools, and automated interactive title dossiers for the Dholera Special Investment Region (SIR), Gujarat, India.
            </p>
            <p>
              Payments on our platform are processed securely through our authorized payment aggregator,{' '}
              <span className="font-semibold text-slate-900">Razorpay Software Private Limited</span>, adhering to Reserve Bank of India (RBI) regulations and PCI-DSS standards.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-black text-slate-900">
              2. Subscription Cancellation Policy
            </h2>
            <p>
              Users subscribing to our recurring plans (such as <strong>Dealer Pro</strong> or <strong>Enterprise Max</strong>) may cancel their renewal at any time without incurring any cancellation fees or penalty charges.
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
              <li>
                <strong>Self-Service Cancellation:</strong> You can manage or cancel your auto-renewal directly from your <Link href="/dashboard" className="text-blue-600 underline font-semibold">account dashboard</Link> (open Billing &amp; Invoices) or by sending an email with your registered email ID to <a href="mailto:aryanbanc@gmail.com" className="text-blue-600 font-semibold">aryanbanc@gmail.com</a>.
              </li>
              <li>
                <strong>Access Period:</strong> Upon cancellation, your account privileges will remain active until the conclusion of your current billing period (monthly or annual). Your card or UPI mandate will not be debited for any subsequent renewal cycles.
              </li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-black text-slate-900">
              3. Refund Eligibility &amp; 7-Day Money-Back Guarantee
            </h2>
            <p>
              We stand firmly behind the quality and speed of our interactive GIS platform. We offer a transparent refund process:
            </p>
            <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 text-blue-900 space-y-2">
              <strong className="block text-xs uppercase tracking-wider font-black text-blue-800">
                7-Day Money-Back Guarantee (First-Time Subscriptions)
              </strong>
              <p className="text-xs sm:text-sm text-blue-900 leading-relaxed">
                If you purchase a monthly or annual Dealer Pro or Enterprise subscription and find that our GIS mapping tools do not meet your business requirements, you may request a 100% refund within <strong>7 days</strong> of your initial transaction date.
              </p>
            </div>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
              <li>
                <strong>Digital Title Dossiers &amp; Instant PDF Reports:</strong> Single-purchase digital title dossiers are non-refundable once the file generation and cryptographic hash have been successfully issued, as digital delivery occurs instantaneously. However, if a dossier fails to generate due to an infrastructure outage or contains a verified system corruption, a full refund or free re-generation will be provided immediately upon notice.
              </li>
              <li>
                <strong>Duplicate Charges:</strong> In the event of an accidental double debit caused by network latency or payment gateway timeout, the duplicate charge is automatically flagged and refunded in full.
              </li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-black text-slate-900">
              4. Refund Processing Timeline &amp; Method
            </h2>
            <p>
              Once your refund request is verified and approved by our billing desk:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
              <li>
                <strong>Refund Initiation:</strong> The refund will be initiated via the Razorpay payment gateway within <strong>24 to 48 business hours</strong> of approval.
              </li>
              <li>
                <strong>Credit to Source Account:</strong> The funds will be credited back to your original mode of payment (UPI ID, Debit/Credit Card, or NetBanking account) within <strong>5 to 7 working days</strong>, subject to your issuing bank&apos;s processing cycles.
              </li>
              <li>
                <strong>Notification:</strong> You will receive an automated refund acknowledgment email containing the Razorpay Refund Reference Number (RRN) to track the credit with your bank.
              </li>
            </ul>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-black text-slate-900">
              5. How to Initiate a Refund Request
            </h2>
            <p>
              To request a cancellation or refund, please contact our support desk with your transaction details:
            </p>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
              <div><strong className="text-slate-900">Email:</strong> <a href="mailto:aryanbanc@gmail.com" className="text-blue-600 font-semibold">aryanbanc@gmail.com</a></div>
              <div><strong className="text-slate-900">Subject:</strong> Refund Request - [Your Registered Email / Payment ID]</div>
              <div><strong className="text-slate-900">Required Details:</strong> Razorpay Payment ID (e.g., pay_xxxxxxxx), Date of Transaction, and Reason for Refund.</div>
              <div><strong className="text-slate-900">Support Desk Hours:</strong> Monday – Saturday, 9:30 AM – 6:30 PM IST (Response within 24 hours).</div>
            </div>
          </section>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
