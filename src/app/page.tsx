import React from 'react';
import Link from 'next/link';
import SiteHeader from '@/components/panels/SiteHeader';
import SiteFooter from '@/components/panels/SiteFooter';
import PortalSurveyLookup from '@/components/portal/PortalSurveyLookup';
import InfrastructurePillars from '@/components/portal/InfrastructurePillars';
import MapShowcaseBanner from '@/components/portal/MapShowcaseBanner';
import TpSchemesMatrix from '@/components/portal/TpSchemesMatrix';
import FeaturedParcels from '@/components/portal/FeaturedParcels';
import CadastralTools from '@/components/portal/CadastralTools';
import FaqSection from '@/components/portal/FaqSection';
import SurveyRecordsNav from '@/components/ui/SurveyRecordsNav';
import { SITE_NAME, PRODUCT_NAME, VILLAGE_COUNT } from '@/lib/brand';
import { VILLAGES } from '@/lib/villages';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-blue-100 selection:text-blue-900">
      {/* 1. Global Navigation Header with WhatsApp & User Menu */}
      <SiteHeader />

      {/* Main Landmark for Screen Readers & Assistive Navigation */}
      <main id="main-content" className="flex-1">
        {/* 2. Hero Section: Direct Value Prop + Embedded Survey Lookup */}
        <section className="relative overflow-hidden bg-white border-b border-slate-200/80 pt-10 pb-16 sm:pt-16 sm:pb-24 lg:pt-20 lg:pb-28">
        {/* Soft Ambient Radial Background */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-70"
          style={{
            backgroundImage:
              'radial-gradient(circle at 15% 18%, rgba(16,185,129,0.12) 0%, transparent 45%), radial-gradient(circle at 85% 24%, rgba(245,158,11,0.15) 0%, transparent 40%), radial-gradient(circle at 50% 90%, rgba(2,132,199,0.10) 0%, transparent 50%)',
          }}
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Left Hero Column */}
            <div className="lg:col-span-7 space-y-6">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50/80 px-3 py-1 text-xs font-bold uppercase tracking-wider text-blue-800">
                  <span className="h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
                  Official Interactive Atlas
                </span>
                <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-xs font-bold uppercase tracking-wider text-slate-600 shadow-2xs">
                  {VILLAGE_COUNT} Villages · 18,161 Parcels
                </span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 leading-[1.08]">
                DholeraMap — Dholera City Map &amp; SIR GIS Atlas
              </h1>

              <p className="text-base sm:text-lg text-slate-600 max-w-2xl leading-relaxed">
                India’s premier open-access interactive GIS intelligence platform for{' '}
                <strong>Dholera Special Investment Region (SIR)</strong>. Search any revenue survey
                number or Final Plot, inspect TP 1–6 town planning schemes, verify abutting road widths,
                and review DGDCR 2024 building control envelopes.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                <Link
                  href="/map"
                  className="px-6 py-3.5 rounded-full bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-bold text-sm shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Explore Interactive GIS Map</span>
                  <span>→</span>
                </Link>

                <Link
                  href="/dholera-tp-map"
                  className="px-6 py-3.5 rounded-full bg-white hover:bg-slate-100 border border-slate-200 text-slate-800 font-bold text-sm shadow-2xs transition flex items-center justify-center cursor-pointer"
                >
                  Browse TP 1–6 Blueprints
                </Link>
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-4 border-t border-slate-100 text-xs font-semibold text-slate-600">
                <div className="flex items-center gap-2">
                  <span className="text-emerald-600 font-black">✓</span>
                  <span>100% Statutory Linework</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-emerald-600 font-black">✓</span>
                  <span>OP to FP Reconstitution</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-emerald-600 font-black">✓</span>
                  <span>DGDCR 2024 Compliant</span>
                </div>
              </div>
            </div>

            {/* Right Hero Column: Interactive Quick-Lookup Widget */}
            <div className="lg:col-span-5 flex justify-center lg:justify-end">
              <PortalSurveyLookup />
            </div>
          </div>
        </div>
      </section>

      {/* 3. Live Regional Stats Strip (100% Light Mode) */}
      <section className="bg-white py-7 border-b border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 text-center divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
            <div className="p-2">
              <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono tracking-tight">920 km²</div>
              <div className="text-[11px] text-slate-500 font-bold uppercase tracking-wider mt-1">
                Total SIR Area
              </div>
            </div>
            <div className="p-2">
              <div className="text-2xl sm:text-3xl font-black text-emerald-600 font-mono tracking-tight">22</div>
              <div className="text-[11px] text-slate-500 font-bold uppercase tracking-wider mt-1">
                Revenue Villages
              </div>
            </div>
            <div className="p-2">
              <div className="text-2xl sm:text-3xl font-black text-blue-600 font-mono tracking-tight">6</div>
              <div className="text-[11px] text-slate-500 font-bold uppercase tracking-wider mt-1">
                Town Planning Schemes
              </div>
            </div>
            <div className="p-2">
              <div className="text-2xl sm:text-3xl font-black text-amber-600 font-mono tracking-tight">18,161+</div>
              <div className="text-[11px] text-slate-500 font-bold uppercase tracking-wider mt-1">
                Interactive Parcels
              </div>
            </div>
            <div className="p-2">
              <div className="text-2xl sm:text-3xl font-black text-indigo-600 font-mono tracking-tight">₹91k Cr</div>
              <div className="text-[11px] text-slate-500 font-bold uppercase tracking-wider mt-1">
                Tata Mega-Fab
              </div>
            </div>
            <div className="p-2">
              <div className="text-2xl sm:text-3xl font-black text-violet-600 font-mono tracking-tight">109 km</div>
              <div className="text-[11px] text-slate-500 font-bold uppercase tracking-wider mt-1">
                Access Expressway
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Infrastructure Catalysts Bento Grid */}
      <InfrastructurePillars />

      {/* 5. Interactive GIS Atlas Showcase Preview Banner */}
      <MapShowcaseBanner />

      {/* 6. Town Planning Schemes Framework (TP 1 - TP 6) */}
      <TpSchemesMatrix />

      {/* 7. Featured Verified Parcels Showcase */}
      <FeaturedParcels />

      {/* 8. Institutional Due-Diligence & Interactive Tools Suite */}
      <CadastralTools />

      {/* 9. FAQ Accordion */}
      <FaqSection />

      {/* 10. Indexable Statutory Interactive Reference & Authority Block */}
      <section
        aria-label="Dholera SIR Interactive Reference"
        className="relative bg-white border-t border-slate-200 px-6 py-14"
      >
        <div className="max-w-5xl mx-auto space-y-8">
          <header>
            <h2 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900 mb-3">
              {SITE_NAME} — Master Interactive Atlas &amp; Statutory Land Records
            </h2>
            <p className="text-slate-600 leading-relaxed">
              The {SITE_NAME} platform is an open-access geospatial interactive atlas and due diligence
              engine covering all {VILLAGE_COUNT} revenue villages in the Dholera Special Investment Region.
              Cross-verify survey numbers against gazetted Form 4 and Form 5 reconstitution schedules,
              inspect municipal road widths, and model permissible building envelopes under DGDCR 2024.
            </p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm text-slate-600">
            <div>
              <h3 className="font-bold text-slate-900 mb-2">What is Dholera SIR?</h3>
              <p className="leading-relaxed">
                Dholera SIR stands for Dholera Special Investment Region, created under the Gujarat Special
                Investment Region Act, 2009. Governed by DSIRDA and DICDL, it represents India’s largest
                greenfield industrial smart city, anchored by the Tata semiconductor fab, the 109 km
                Ahmedabad–Dholera Expressway, and the greenfield international airport at Navagam.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-slate-900 mb-2">Town Planning Scheme Reconstitution</h3>
              <p className="leading-relaxed">
                Under statutory town planning, agricultural survey parcels (OP) are reconstituted into clear-titled,
                serviced Final Plots (FP) with approximately 50% land contribution towards public roads, parks,
                and underground trunk utilities. Each Final Plot enjoys direct access to sanctioned TP roads.
              </p>
            </div>
          </div>

          {/* Directory Links */}
          <div className="pt-6 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs">
            <div>
              <h4 className="font-bold uppercase tracking-wider text-slate-900 mb-2">
                Revenue Village Maps
              </h4>
              <ul className="grid grid-cols-2 gap-x-3 gap-y-1 text-slate-600">
                {VILLAGES.map((v) => (
                  <li key={v.slug}>
                    <Link
                      href={`/village/${v.slug}`}
                      className="text-blue-600 hover:underline py-1.5 px-0.5 inline-block"
                      aria-label={`${v.name} Village Dholera SIR Map & Parcels`}
                    >
                      {v.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-bold uppercase tracking-wider text-slate-900 mb-2">
                Interactive Knowledge Hubs
              </h4>
              <ul className="space-y-1 text-slate-600">
                <li>
                  <Link href="/map" className="text-blue-600 hover:underline py-1 inline-block" aria-label="Explore Interactive GIS Vector Map">
                    Interactive GIS Vector Map
                  </Link>
                </li>
                <li>
                  <Link href="/dholera-tp-map" className="text-blue-600 hover:underline py-1 inline-block" aria-label="View TP 1 to TP 6 Blueprints">
                    TP 1 to TP 6 Blueprints
                  </Link>
                </li>
                <li>
                  <Link href="/dholera-expressway-airport-map" className="text-blue-600 hover:underline py-1 inline-block" aria-label="Ahmedabad-Dholera Expressway and Airport Route Map">
                    Expressway &amp; Airport Route Map
                  </Link>
                </li>
                <li>
                  <Link href="/dholera-plot-price" className="text-blue-600 hover:underline py-1 inline-block" aria-label="Check 2026 Plot Price Rate Card">
                    2026 Plot Price Rate Card
                  </Link>
                </li>
                <li>
                  <Link href="/blog/dholera-village-wise-land-prices" className="text-blue-600 hover:underline py-1 inline-block" aria-label="Village-wise land prices across all 22 Dholera villages">
                    Village-Wise Land Prices (22 Villages)
                  </Link>
                </li>
                <li>
                  <Link href="/blog/plots-for-sale-in-dholera" className="text-blue-600 hover:underline py-1 inline-block" aria-label="How to evaluate plots for sale in Dholera SIR">
                    Plots for Sale: Buyer Evaluation Guide
                  </Link>
                </li>
                <li>
                  <Link href="/blog/nri-investment-guide-dholera" className="text-blue-600 hover:underline py-1 inline-block" aria-label="NRI guide to buying land in Dholera SIR">
                    NRI Investment Guide
                  </Link>
                </li>
                <li>
                  <Link href="/dholera-7-12-anyror-land-records" className="text-blue-600 hover:underline py-1 inline-block" aria-label="Gujarat AnyRoR 7/12 Land Records Guide">
                    AnyRoR 7/12 Land Records Guide
                  </Link>
                </li>
                <li>
                  <Link href="/tata-semiconductor-dholera-map" className="text-blue-600 hover:underline py-1 inline-block" aria-label="Tata Semiconductor Mega Fab Map and Industrial Corridor">
                    Tata Fab Map &amp; Corridor
                  </Link>
                </li>
                <li>
                  <Link href="/blog/dholera-sir-full-form" className="text-blue-600 hover:underline py-1 inline-block" aria-label="What is Dholera SIR full form">
                    Dholera SIR Full Form Guide
                  </Link>
                </li>
                <li>
                  <Link href="/guide" className="text-blue-600 hover:underline py-1 inline-block" aria-label="Dholera SIR TP Schemes and DGDCR Guide">
                    TP Schemes &amp; DGDCR Guide
                  </Link>
                </li>
                <li>
                  <Link href="/brokers" className="text-blue-600 hover:underline py-1 inline-block" aria-label="Registered Land Brokers Directory">
                    Registered Brokers Directory
                  </Link>
                </li>
                <li>
                  <Link href="/pricing" className="text-blue-600 hover:underline py-1 inline-block" aria-label="PlotBook Pro Subscription Plans">
                    {PRODUCT_NAME} Pro Subscription Plans
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold uppercase tracking-wider text-slate-900 mb-2">
                Published Land Records
              </h4>
              <SurveyRecordsNav limit={10} />
            </div>
          </div>
        </div>
      </section>
      </main>

      {/* 11. Footer */}
      <SiteFooter />
    </div>
  );
}
