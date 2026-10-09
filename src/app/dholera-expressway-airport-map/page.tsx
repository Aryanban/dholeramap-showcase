import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Navigation, Plane, Car, ArrowRight, CheckCircle2, ShieldCheck, MapPin, Layers, HelpCircle } from 'lucide-react';
import SiteHeader from '@/components/panels/SiteHeader';
import SiteFooter from '@/components/panels/SiteFooter';
import ExpresswayAirportNavigator from '@/components/portal/ExpresswayAirportNavigator';
import { hreflang, pageDescription } from '@/lib/brand';

export const metadata: Metadata = {
  // 23 impressions at pos 18.57 with 0 clicks. The old 85-char title was being
  // truncated mid-keyword; this front-loads the two terms this page actually
  // ranks for ("NH 751 highway route map", "ahmedabad airport to expressway
  // distance") inside the ~58-char window that survives the fold.
  title: 'Ahmedabad Dholera Expressway & Airport Map 2026: Route & Status | DholeraMap',
  description: pageDescription(
    '109km Ahmedabad-Dholera Expressway (NE 8) route map with interchanges, entry-exits, toll distance and Greenfield International Airport terminal location on interactive GIS.',
    '109km Ahmedabad-Dholera Expressway (NE 8) route map with interchanges, toll distance and Greenfield International Airport location.',
  ),
  keywords: [
    'Dholera expressway map',
    'NE 8 expressway route map',
    'NH 751 highway route map',
    'Ahmedabad Dholera expressway NE 8',
    'Ahmedabad Dholera expressway route',
    'Ahmedabad airport to expressway distance',
    'Dholera international airport map',
    'Dholera expressway distance',
    'Dholera airport location',
    'Dholera connectivity map',
    'Dholera RRTS route',
  ],
  alternates: {
    canonical: 'https://dholeramap.com/dholera-expressway-airport-map',
    languages: hreflang('https://dholeramap.com/dholera-expressway-airport-map'),
  },
  openGraph: {
    title: 'Dholera Expressway Map: NE 8 & Airport | DholeraMap',
    description: pageDescription(
      '109km Ahmedabad-Dholera Expressway (NE 8) route map with interchanges, toll distance and Greenfield International Airport terminal location on interactive map.',
    ),
    url: 'https://dholeramap.com/dholera-expressway-airport-map',
    siteName: 'DholeraMap',
    images: ['/og-image.png'],
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Dholera Expressway Map: NE 8 & Airport | DholeraMap',
    description: pageDescription(
      '109km Ahmedabad-Dholera Expressway (NE 8) route, interchanges, and Greenfield International Airport location on interactive map.',
    ),
    images: ['/logo-512.png'],
  },
};

const infraJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@context': 'https://schema.org',
      '@type': 'Article',
      '@id': 'https://dholeramap.com/dholera-expressway-airport-map#article',
      url: 'https://dholeramap.com/dholera-expressway-airport-map',
      headline: 'Ahmedabad-Dholera Expressway & International Airport: Geospatial Route Guide',
      description:
        'Detailed infrastructure mapping, interchange exits, and land parcel investment potential along the 109km expressway and greenfield airport in Dholera SIR.',
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
      '@type': 'Place',
      '@id': 'https://dholeramap.com/dholera-expressway-airport-map#airport',
      name: 'Dholera International Airport (DIACL)',
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Navagam, Dholera SIR',
        addressRegion: 'Gujarat',
        addressCountry: 'IN',
      },
      geo: {
        '@type': 'GeoCoordinates',
        latitude: '22.3500',
        longitude: '72.2300',
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      '@id': 'https://dholeramap.com/dholera-expressway-airport-map#faq',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'What is the route of the Ahmedabad-Dholera Expressway?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'The Ahmedabad-Dholera Expressway, designated NE 8, starts at the Sardar Patel Ring Road (near Sarkhej / Kaneti) in Ahmedabad and travels 109 km south through Dholka, Sindhrej, and Dholera SIR, before connecting onwards to Adhelai in Bhavnagar district. It is distinct from NH-751, a separately notified 159 km national highway that runs broadly parallel in the same corridor.',
          },
        },
        {
          '@type': 'Question',
          name: 'How much does the expressway reduce travel time between Ahmedabad and Dholera?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'The expressway slashes driving time from over 2.5 hours via old state highways down to 40–45 minutes, with a designed speed limit of 120 km/h and four lanes expandable to eight lanes.',
          },
        },
        {
          '@type': 'Question',
          name: 'Where is the Dholera International Airport located?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'The Dholera Greenfield International Airport is situated near Navagam village, approximately 15 km north of the Activation Area and directly connected to the expressway. It covers 1,426 hectares and features two parallel runways (3,200m and 4,000m) capable of handling Code-F commercial aircraft like the Airbus A380 and Boeing 777.',
          },
        },
        {
          '@type': 'Question',
          name: 'Which Town Planning scheme connects directly to the Dholera Airport?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Town Planning Scheme 4 (TP 4) and TP 5 serve as the primary Aerotropolis zone surrounding the airport. It is designated for aviation maintenance, repair & overhaul (MRO), bonded warehousing, freight logistics, and airport city hospitality.',
          },
        },
        {
          '@type': 'Question',
          name: 'What is the NH 751 highway route in Dholera SIR?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'National Highway 751 (NH-751) is a 159 km notified national highway that connects Sarkhej in Ahmedabad to Bhavnagar via Vataman, Ambali, Dholera, and Bavaliyari. It runs broadly parallel to the access-controlled NE 8 Expressway but serves local regional traffic and village access.',
          },
        },
        {
          '@type': 'Question',
          name: 'What is the distance from Ahmedabad Airport to Dholera Expressway?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'The driving distance from Sardar Vallabhbhai Patel International Airport (SVPIA) in Ahmedabad to the starting toll interchange of the Ahmedabad-Dholera Expressway (NE 8) at Sardar Patel Ring Road (Sarkhej/Sanathal) is approximately 28 km, taking 35–45 minutes via the ring road.',
          },
        },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      '@id': 'https://dholeramap.com/dholera-expressway-airport-map#breadcrumb',
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
          name: 'Expressway & Airport Map',
          item: 'https://dholeramap.com/dholera-expressway-airport-map',
        },
      ],
    },
  ],
};

const CORRIDOR_SPECS = [
  { project: 'Ahmedabad-Dholera Expressway (NE 8)', length: '109 km', lanes: '4-lane (expandable to 8)', status: 'Operational 2026', speed: '120 km/h' },
  { project: 'National Highway 751 (NH-751)', length: '159 km', lanes: '4-lane National Highway', status: 'Operational Gazetted Route', speed: '80–100 km/h Regional Freight' },
  { project: 'Dholera Greenfield International Airport', length: '1,426 Hectares', lanes: '3,200m Runway (Ph 1)', status: 'Under Construction (Ph 1)', speed: 'Code-4E/Code-F Cargo' },
  { project: 'Dholera-Ahmedabad Monorail Corridor', length: '100 km', lanes: 'Elevated Dual-Track', status: 'Approved / Land Demarcated', speed: '160 km/h Rapid Transit' },
  { project: 'Dedicated Freight Corridor (DFC) Link', length: 'Spur to Bhimnath', lanes: 'Broad Gauge Freight Rail', status: 'Feasibility Completed', speed: 'Heavy Cargo Direct to Port' },
];

export default function DholeraExpresswayAirportPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(infraJsonLd) }}
      />
      <SiteHeader />

      {/* Hero */}
      <section className="bg-gradient-to-b from-sky-50/70 via-slate-50 to-white text-slate-900 py-12 sm:py-16 px-4 sm:px-6 lg:px-8 border-b border-sky-100">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-100/80 border border-sky-200 text-sky-900 text-xs font-black tracking-wide uppercase">
            <Plane className="w-3.5 h-3.5 text-sky-700" />
            109km NE 8 Expressway &amp; Code 4E/4F Aerotropolis
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            Ahmedabad-Dholera Expressway &amp; Airport Map: Routes, Exits &amp; Plots
          </h1>

          {/* Inverted Pyramid AEO Direct-Answer Block */}
          <div className="bg-white border border-sky-200/90 rounded-2xl p-5 sm:p-6 shadow-xs">
            <div className="text-xs font-black uppercase tracking-wider text-sky-800 mb-2 flex items-center gap-2">
              <Navigation className="w-4 h-4 text-sky-600" />
              Strategic Transit Summary
            </div>
            <p className="text-sm sm:text-base leading-relaxed text-slate-700 font-medium">
              The Ahmedabad-Dholera Expressway (NE 8) is a 109 km 4-lane access-controlled highway connecting SP Ring Road (Ahmedabad) directly to Dholera SIR and Bhavnagar. Running parallel to the Dholera International Airport at Navagam, it slashes travel time to 45 minutes and features key interchanges at Sindhrej, Dholera, and Activation Area. See which plots the corridor traverses on the <Link href="/dholera-tp-map" className="text-blue-600 font-semibold underline decoration-blue-500/60 underline-offset-2 hover:text-blue-800">TP map in Dholera</Link>, and cross-check the gazetted <Link href="/dholera-tp-map" className="text-blue-600 font-semibold underline decoration-blue-500/60 underline-offset-2 hover:text-blue-800">Dholera SIR map PDF</Link>.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-sky-700 hover:bg-sky-800 text-white font-bold text-sm shadow-md shadow-sky-700/20 transition transform hover:-translate-y-0.5"
            >
              <Navigation className="w-4 h-4" />
              View Expressway Route on Interactive Map
            </Link>
            <Link
              href="/dholera-tp-map"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-bold text-sm shadow-xs transition"
            >
              Inspect TP 4 Aerotropolis Plots
              <ArrowRight className="w-4 h-4 text-slate-500" />
            </Link>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
        {/* Interactive Airport & Expressway Navigator */}
        <ExpresswayAirportNavigator />

        {/* Section 1: Infrastructure Specs */}
        <section className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Connectivity Catalysts: Technical Specifications
            </h2>
            <p className="text-sm text-slate-600">
              High-speed multimodal transit arteries transforming Dholera into India’s best-connected greenfield industrial node.
            </p>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-2xl bg-white shadow-xs">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="bg-slate-100/80 text-slate-700 font-bold border-b border-slate-200">
                  <th className="p-4">Infrastructure Project</th>
                  <th className="p-4">Scale / Dimension</th>
                  <th className="p-4">Lane / Track Capacity</th>
                  <th className="p-4">Operating Speed</th>
                  <th className="p-4">Current Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {CORRIDOR_SPECS.map((row, idx) => (
                  <tr key={idx} className="hover:bg-blue-50/40 transition">
                    <td className="p-4 font-bold text-slate-900">{row.project}</td>
                    <td className="p-4 font-mono text-slate-600">{row.length}</td>
                    <td className="p-4 text-slate-700">{row.lanes}</td>
                    <td className="p-4 font-mono font-bold text-blue-700">{row.speed}</td>
                    <td className="p-4">
                      <span className="inline-block px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Section 2: Key Interchanges & Beneficiary Villages */}
        <section className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Expressway Interchanges &amp; High-Value Exit Points
            </h2>
            <p className="text-sm text-slate-600">
              Land value appreciation is highest within a 3–5 km radius of each official toll ramp and interchange:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-3">
              <span className="text-xs font-black uppercase tracking-wider text-blue-600">Exit 1</span>
              <h3 className="text-base font-bold text-slate-900">Navagam / Airport Interchange</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Direct entry ramp servicing the 1,426-Ha Greenfield Airport terminal, air-cargo logistics complexes, and hospitality hotel clusters in northern TP 4.
              </p>
              <div className="pt-2 text-[11px] font-medium text-slate-500">
                Beneficiary Villages: Navagam, Fedra, Pipli
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-3">
              <span className="text-xs font-black uppercase tracking-wider text-blue-600">Exit 2</span>
              <h3 className="text-base font-bold text-slate-900">Dholera Central / Knowledge City</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Servicing Town Planning Scheme 1 (TP 1) and connecting educational institutes, university campuses, and residential gated communities along 55m roads.
              </p>
              <div className="pt-2 text-[11px] font-medium text-slate-500">
                Beneficiary Villages: Ambli, Kadipur, Otariya
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-3">
              <span className="text-xs font-black uppercase tracking-wider text-blue-600">Exit 3</span>
              <h3 className="text-base font-bold text-slate-900">Activation Area / Central Spine</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Direct heavy commercial ramp feeding the 250m Central Spine Road, the ABCD administrative building, and the ₹91k Cr Tata Semiconductor Fab.
              </p>
              <div className="pt-2 text-[11px] font-medium text-slate-500">
                Beneficiary Villages: Hebatpur, Bhimnath, Gorasu
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: Airport City & TP 4 Aerotropolis */}
        <section className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-10 shadow-sm space-y-6">
          <div className="space-y-3">
            <span className="text-xs font-black uppercase tracking-wider text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200 inline-flex items-center gap-1.5">
              <Plane className="w-3.5 h-3.5" />
              Aerotropolis Development Zone
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              TP 4: The 135 Sq. Km Aviation &amp; Logistics Powerhouse
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed max-w-3xl">
              Unlike airports in congested metropolitan areas, Dholera International Airport is master-planned as a pure Aerotropolis. TP 4 features designated zones for cold-chain warehousing, aerospace component manufacturing, and executive business parks.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-1">
              <strong className="text-blue-700 text-sm block font-bold">Runway 1 (3,200m)</strong>
              <p className="text-xs text-slate-600">Phase 1 runway dedicated to handling domestic passenger traffic and international freight carriers.</p>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-1">
              <strong className="text-blue-700 text-sm block font-bold">Runway 2 (4,000m Future)</strong>
              <p className="text-xs text-slate-600">Long-haul Code-F intercontinental cargo runway for heavy wide-body aircraft like Boeing 747-8F.</p>
            </div>
          </div>

          <div className="pt-2">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition"
            >
              Inspect Airport Boundary on DholeraMap
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </section>

        {/* Section 4: NH 751 Route Map vs NE-8 Expressway */}
        <section className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-10 shadow-xs space-y-6">
          <div className="space-y-3">
            <span className="text-xs font-black uppercase tracking-wider text-amber-800 bg-amber-50 px-3 py-1 rounded-full border border-amber-200 inline-flex items-center gap-1.5">
              <Car className="w-3.5 h-3.5" />
              Regional Highway Corridor Comparison
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              NH 751 Highway Route Map vs NE 8 Expressway in Dholera SIR
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed max-w-3xl">
              Property brochures frequently confuse <strong>National Highway 751 (NH-751)</strong> with the access-controlled <strong>National Expressway 8 (NE 8)</strong>. Understanding the routing, access control, and village intersections between these two corridors is vital before valuing land:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <h3 className="font-bold text-slate-900 text-base">National Highway 751 (NH-751 Route)</h3>
              <ul className="space-y-2 text-xs text-slate-600 leading-relaxed">
                <li>• <strong>Total Length:</strong> 159 km gazetted national highway corridor.</li>
                <li>• <strong>Route Alignment:</strong> Sarkhej (Ahmedabad) – Sanand – Bavla – Vataman – Ambali – Dholera – Bavaliyari – Adhelai – Bhavnagar.</li>
                <li>• <strong>Access Permissibility:</strong> Non-access-controlled highway. Allows local commercial curb cuts, petrol pumps, and direct village approach roads.</li>
                <li>• <strong>Role:</strong> Serves regional passenger buses, intra-taluka freight, and local market centers across Dholera villages.</li>
              </ul>
            </div>

            <div className="p-6 rounded-2xl bg-blue-50/50 border border-blue-200 space-y-3">
              <h3 className="font-bold text-blue-900 text-base">Ahmedabad-Dholera Expressway (NE 8 Route)</h3>
              <ul className="space-y-2 text-xs text-slate-700 leading-relaxed">
                <li>• <strong>Total Length:</strong> 109 km dedicated greenfield access-controlled expressway.</li>
                <li>• <strong>Route Alignment:</strong> SP Ring Road (Ahmedabad) – Sindhrej – Navagam Airport – TP 1 Knowledge City – TP 2 Activation Area.</li>
                <li>• <strong>Access Permissibility:</strong> 100% access-controlled. Zero direct curb cuts. Access strictly via grade-separated trumpet interchanges.</li>
                <li>• <strong>Role:</strong> High-speed 120 km/h passenger corridor (45 mins) and heavy export freight to ports.</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Section 5: FAQ Section */}
        <section className="space-y-6 pt-4 border-t border-slate-200">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-blue-600">
              <HelpCircle className="w-4 h-4" />
              Frequently Asked Questions
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Expressway &amp; Airport Connectivity FAQs
            </h2>
          </div>

          <div className="space-y-4">
            {[
              {
                q: 'What is the route of the Ahmedabad-Dholera Expressway?',
                a: 'The Ahmedabad-Dholera Expressway, designated NE 8, starts at the Sardar Patel Ring Road (near Sarkhej / Kaneti) in Ahmedabad and travels 109 km south through Dholka, Sindhrej, and Dholera SIR, before connecting onwards to Adhelai in Bhavnagar district. It is distinct from NH-751, a separately notified 159 km national highway that runs broadly parallel in the same corridor.',
              },
              {
                q: 'How much does the expressway reduce travel time between Ahmedabad and Dholera?',
                a: 'The expressway slashes driving time from over 2.5 hours via old state highways down to 40–45 minutes, with a designed speed limit of 120 km/h and four lanes expandable to eight lanes.',
              },
              {
                q: 'Where is the Dholera International Airport located?',
                a: 'The Dholera Greenfield International Airport is situated near Navagam village, approximately 15 km north of the Activation Area and directly connected to the expressway. It covers 1,426 hectares and features two parallel runways (3,200m and 4,000m) capable of handling Code-F commercial aircraft like the Airbus A380 and Boeing 777.',
              },
              {
                q: 'Which Town Planning scheme connects directly to the Dholera Airport?',
                a: 'Town Planning Scheme 4 (TP 4) and TP 5 serve as the primary Aerotropolis zone surrounding the airport. It is designated for aviation maintenance, repair & overhaul (MRO), bonded warehousing, freight logistics, and airport city hospitality.',
              },
              {
                q: 'What is the NH 751 highway route in Dholera SIR?',
                a: 'National Highway 751 (NH-751) is a 159 km notified national highway that connects Sarkhej in Ahmedabad to Bhavnagar via Vataman, Ambali, Dholera, and Bavaliyari. It runs broadly parallel to the access-controlled NE 8 Expressway but serves local regional traffic and village access.',
              },
              {
                q: 'What is the distance from Ahmedabad Airport to Dholera Expressway?',
                a: 'The driving distance from Sardar Vallabhbhai Patel International Airport (SVPIA) in Ahmedabad to the starting toll interchange of the Ahmedabad-Dholera Expressway (NE 8) at Sardar Patel Ring Road (Sarkhej/Sanathal) is approximately 28 km, taking 35–45 minutes via the ring road.',
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
