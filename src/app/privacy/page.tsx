import React from 'react';
import type { Metadata } from 'next';
import SiteHeader from '@/components/panels/SiteHeader';
import SiteFooter from '@/components/panels/SiteFooter';
import { Lock } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Privacy Policy | DholeraMap',
  description: 'Privacy policy, local-first data protection, and zero-cloud land document security terms for DholeraMap Interactive Atlas (dholeramap.com).',
  alternates: {
    canonical: 'https://dholeramap.com/privacy',
  },
  openGraph: {
    title: 'Privacy Policy | DholeraMap',
    description: 'Privacy policy, local-first data protection, and zero-cloud land document security terms for DholeraMap Interactive Atlas (dholeramap.com).',
    url: 'https://dholeramap.com/privacy',
    siteName: 'DholeraMap',
    images: ['/logo-512.png'],
    locale: 'en_IN',
    type: 'article',
  },
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col font-sans">
      <SiteHeader />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              Privacy &amp; Data Security
            </span>
            <span className="text-[11px] text-slate-400">Last Updated: September 2026</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
            Privacy Policy
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
            At DholeraMap (dholeramap.com), we adhere to a strict local-first architecture to protect the confidentiality of your land investments and statutory documents.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs text-xs sm:text-sm text-slate-700 leading-relaxed">
          {/* Section 1: Local First Architecture */}
          <section className="space-y-2">
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
              <h2 className="text-sm font-black text-emerald-950 flex items-center gap-2">
                <Lock className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>Our Core Privacy Guarantee: Local-First Document Storage</span>
              </h2>
              <p className="text-xs text-emerald-900 mt-1 leading-relaxed">
                When you upload statutory records (such as 7/12 Satbara, title deeds, allotment letters, or site photos) to your saved plots, <strong>these files are stored exclusively inside your browser’s IndexedDB storage</strong>. They are never uploaded, backed up, or processed on our cloud servers.
              </p>
            </div>
          </section>

          {/* Section 2 */}
          <section className="space-y-2">
            <h2 className="text-base font-black text-slate-900">1. Information We Collect</h2>
            <p>
              Depending on how you use PlotBook, we may collect the following information:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
              <li>
                <strong>Account Information:</strong> When registering via Clerk, we collect your name, email address, and optionally your phone number and professional role (investor, broker, or developer).
              </li>
              <li>
                <strong>Billing Information:</strong> Payments are processed directly through Razorpay’s PCI-DSS Level 1 compliant gateway. We do not receive, process, or store your credit card numbers, CVVs, or UPI PINs.
              </li>
              <li>
                <strong>Support Inquiries:</strong> Messages, feedback, or map error reports submitted via our contact forms.
              </li>
              <li>
                <strong>Anonymous Analytics:</strong> Telemetry such as page load speed, tile pyramid caching status, and device viewport dimensions via Vercel Analytics to ensure responsive mobile performance.
              </li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="space-y-2">
            <h2 className="text-base font-black text-slate-900">2. How We Use Your Information</h2>
            <p>
              We use the collected information exclusively to:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-slate-600">
              <li>Authenticate your identity and manage your active account session.</li>
              <li>Enable plot bookmarking and cross-device CRM synchronization.</li>
              <li>Process subscriptions and provide billing receipts.</li>
              <li>Respond to support requests and customer service tickets.</li>
              <li>Detect and prevent fraud, unauthorized tile scraping, and abuse.</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="space-y-2">
            <h2 className="text-base font-black text-slate-900">3. Information Sharing &amp; Third Parties</h2>
            <p>
              <strong>We do not sell, rent, or trade your personal information or shortlisted plot portfolios to any third-party real estate brokers, marketing agencies, or advertisers.</strong>
            </p>
            <p className="mt-2 text-slate-600">
              We only share data with essential service infrastructure providers strictly necessary to deliver the service:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-slate-600">
              <li><strong>Clerk:</strong> For secure authentication and session management.</li>
              <li><strong>Razorpay:</strong> For payment execution and tax invoicing.</li>
              <li><strong>Vercel:</strong> For edge computing and web application hosting.</li>
            </ul>
          </section>

          {/* Section 5 */}
          <section className="space-y-2">
            <h2 className="text-base font-black text-slate-900">4. Data Security &amp; Retention</h2>
            <p>
              All traffic between your device and PlotBook is encrypted in transit using industry-standard TLS 1.3 encryption. We retain your account data for as long as your account remains active. You may request permanent deletion of your account and associated profile information at any time.
            </p>
          </section>

          {/* Section 6 */}
          <section className="space-y-2">
            <h2 className="text-base font-black text-slate-900">5. Your Data Rights</h2>
            <p>
              You have the right to:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-slate-600">
              <li>Access and review the personal information associated with your account.</li>
              <li>Export your saved plots and property notes.</li>
              <li>Wipe your local IndexedDB document vault directly from your browser settings.</li>
              <li>Request full deletion of your user profile and authentication credentials.</li>
            </ul>
          </section>

          {/* Section 7 */}
          <section className="space-y-2 pt-2 border-t border-slate-100">
            <h2 className="text-base font-black text-slate-900">6. Contact &amp; Grievance Officer</h2>
            <p>
              For privacy-related inquiries, data deletion requests, or questions regarding this Privacy Policy, please contact:
            </p>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-mono text-slate-700">
              Privacy Officer: Aryan Bansal<br />
              Email: <a href="mailto:aryanbanc@gmail.com" className="text-blue-600 font-bold hover:underline">aryanbanc@gmail.com</a><br />
              Entity: PlotBook Dholera SIR<br />
              Platform: https://dholeramap.com
            </div>
          </section>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
