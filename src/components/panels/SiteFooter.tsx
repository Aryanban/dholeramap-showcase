import React from 'react';
import Link from 'next/link';
import { VILLAGES } from '@/lib/villages';

export default function SiteFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white text-slate-600 font-sans text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          {/* Column 1: Platform & Regulatory Badge */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-blue-600 text-white font-black text-xs flex items-center justify-center">
                D
              </span>
              <span className="font-black text-slate-900 text-sm tracking-tight">
                DholeraMap
              </span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Official Interactive GIS &amp; Real Estate Intelligence Portal for Dholera SIR. Real-time Town Planning scheme blueprints, 18,161+ statutory village revenue survey parcels, and local-first land registry document vault.
            </p>
            <div className="pt-2">
              <span className="inline-block px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold">
                ✓ Razorpay Verified Merchant
              </span>
            </div>
          </div>

          {/* Column 2: Market & Due Diligence Hubs */}
          <div className="space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
              Market &amp; Schemes
            </h3>
            <ul className="space-y-1 text-xs">
              <li>
                <Link href="/dholera-tp-map" className="hover:text-blue-600 transition font-medium text-slate-900 py-1.5 inline-block">
                  Dholera TP Maps (TP 1–6)
                </Link>
              </li>
              <li>
                <Link href="/dholera-plot-price" className="hover:text-blue-600 transition font-medium text-slate-900 py-1.5 inline-block">
                  2026 Plot Price Rate Card
                </Link>
              </li>
              <li>
                <Link href="/tata-semiconductor-dholera-map" className="hover:text-blue-600 transition py-1.5 inline-block">
                  Tata Semiconductor Fab Map
                </Link>
              </li>
              <li>
                <Link href="/dholera-expressway-airport-map" className="hover:text-blue-600 transition py-1.5 inline-block">
                  Expressway &amp; Airport Route
                </Link>
              </li>
              <li>
                <Link href="/dholera-7-12-anyror-land-records" className="hover:text-blue-600 transition py-1.5 inline-block">
                  AnyRoR 7/12 Land Records
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Interactive Tools & Schemes */}
          <div className="space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
              Interactive Tools
            </h3>
            <ul className="space-y-1 text-xs">
              <li>
                <Link href="/map" className="hover:text-blue-600 transition py-1.5 inline-block">
                  Interactive Vector Map (TP 1–6)
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-blue-600 transition py-1.5 inline-block">
                  Saved Plots &amp; Registry Vault
                </Link>
              </li>
              <li>
                <Link href="/dholera-sir" className="hover:text-blue-600 transition py-1.5 inline-block">
                  What is Dholera SIR?
                </Link>
              </li>
              <li>
                <Link href="/guide" className="hover:text-blue-600 transition py-1.5 inline-block">
                  Town Planning &amp; FAR Guide
                </Link>
              </li>
              <li>
                <Link href="/properties" className="hover:text-blue-600 transition py-1.5 inline-block">
                  Plots for Sale in Dholera
                </Link>
              </li>
              <li>
                <Link href="/brokers" className="hover:text-blue-600 transition py-1.5 inline-block">
                  RERA Broker Directory
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-blue-600 transition py-1.5 inline-block">
                  About DholeraMap
                </Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-blue-600 transition font-medium py-1.5 inline-block">
                  Land Intelligence Blog
                </Link>
              </li>
              <li>
                <Link href="/verify/DHO-TP1_RESIDENTIAL_R1-101-AUTH" rel="nofollow" prefetch={false} className="hover:text-blue-600 transition py-1.5 inline-block">
                  Audit Dossier Verification
                </Link>
              </li>
              <li>
                <Link href="/embed" className="hover:text-blue-600 transition font-medium py-1.5 inline-block text-blue-600">
                  Embed Map Widget (Free)
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Legal & Razorpay Compliance */}
          <div className="space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
              Legal &amp; Policies
            </h3>
            <ul className="space-y-1 text-xs">
              <li>
                <Link href="/terms" className="hover:text-blue-600 transition font-medium py-1.5 inline-block">
                  Terms &amp; Conditions
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-blue-600 transition font-medium py-1.5 inline-block">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/refund" className="hover:text-blue-600 transition font-medium text-slate-800 py-1.5 inline-block">
                  Cancellation &amp; Refund Policy
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="hover:text-blue-600 transition font-medium text-slate-800 py-1.5 inline-block">
                  Shipping &amp; Delivery Terms
                </Link>
              </li>
              <li>
                <Link href="/disclaimer" className="hover:text-blue-600 transition py-1.5 inline-block">
                  Interactive &amp; RERA Disclaimer
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 5: Billing, Support & Nodal Desk */}
          <div className="space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
              Billing &amp; Support
            </h3>
            <ul className="space-y-1 text-xs">
              <li>
                <Link href="/pricing" className="hover:text-blue-600 transition py-1.5 inline-block">
                  Subscription Pricing (INR ₹)
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-blue-600 transition font-medium text-slate-800 py-1.5 inline-block">
                  Contact &amp; Grievance Redressal
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-blue-600 transition py-1.5 inline-block">
                  About DholeraMap Platform
                </Link>
              </li>
              <li>
                <Link href="/guide" className="hover:text-blue-600 transition py-1.5 inline-block">
                  Interactive &amp; Zoning Guide
                </Link>
              </li>
              <li>
                <Link href="/brokers" className="hover:text-blue-600 transition py-1.5 inline-block">
                  Verified Broker Network
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Town Planning Schemes Quick Nav */}
        <div className="pt-8 border-t border-slate-200/80 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
              Dholera Town Planning Schemes (TP 1–6 Maps)
            </h3>
            <span className="text-[11px] text-slate-500">
              Statutory GTPUD 1976 Draft &amp; Final Scheme Boundaries
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
            {[
              { label: 'TP 1 Map', href: '/dholera-tp-1-map', desc: 'Activation Area' },
              { label: 'TP 2 Map', href: '/dholera-tp-2-map', desc: 'Tata Fab Core' },
              { label: 'TP 3 Map', href: '/dholera-tp-3-map', desc: 'City Center Hub' },
              { label: 'TP 4 Map', href: '/dholera-tp-4-map', desc: 'Expressway Corridor' },
              { label: 'TP 5 Map', href: '/dholera-tp-5-map', desc: 'Logistics Park' },
              { label: 'TP 6 Map', href: '/dholera-tp-6-map', desc: 'Clean Tech Zone' },
            ].map((scheme) => (
              <Link
                key={scheme.label}
                href={scheme.href}
                className="p-2.5 rounded-lg border border-slate-200/80 bg-slate-50/60 hover:bg-blue-50/60 hover:border-blue-300 transition group"
              >
                <div className="font-semibold text-slate-900 text-xs group-hover:text-blue-600 transition">
                  {scheme.label}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  {scheme.desc}
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* 22 Revenue Villages Directory (Programmatic PageRank Silo) */}
        <div className="pt-6 border-t border-slate-200/80 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
              Dholera SIR Revenue Villages (22 Gazetted Villages)
            </h3>
            <span className="text-[11px] text-slate-500">
              18,161+ statutory revenue survey parcels indexed across 22 villages
            </span>
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed mb-3">
            Explore cadastral maps, Town Planning scheme allocations, land valuation benchmarks, and digitized AnyRoR 7/12 land records for each gazetted village:
          </p>
          <div className="flex flex-wrap gap-1.5">
            {VILLAGES.map((village) => (
              <Link
                key={village.slug}
                href={`/village/${village.slug}`}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-100/90 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 text-slate-700 text-[11px] font-medium transition border border-slate-200/70"
                title={`${village.name} Village Land Map & TP Scheme (${village.scheme})`}
              >
                <span>{village.name}</span>
                <span className="text-[10px] text-slate-400 font-normal">({village.scheme})</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-600">
          <div className="text-center sm:text-left leading-relaxed">
            © 2026 DholeraMap · Dholera SIR Interactive Portal. All rights reserved.
            <br className="hidden sm:inline" />
            <span className="text-[11px] text-slate-600">
              Geospatial boundaries aligned with Gujarat Town Planning &amp; Urban Development Act (GTPUD 1976) and DGDCR 2024 regulations.
            </span>
          </div>
          <div className="flex items-center gap-3 text-slate-600 font-semibold text-xs">
            <span>Secure 256-bit SSL</span>
            <span>·</span>
            <span>PCI-DSS Level 1 via Razorpay</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
