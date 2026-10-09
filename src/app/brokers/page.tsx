import type { Metadata } from 'next';
import Link from 'next/link';
import SiteHeader from '@/components/panels/SiteHeader';
import SiteFooter from '@/components/panels/SiteFooter';
import BrokersDirectory from '@/components/brokers/BrokersDirectory';
import { getRankedBrokers, type BrokerProfile } from '@/lib/brokers';
import { VILLAGES } from '@/lib/villages';
import { DOMAIN, SITE_NAME, OG_IMAGE, OG_IMAGE_DIMS, pageDescription } from '@/lib/brand';
import { ArrowRight, TrendingUp, ShieldCheck, MapPin } from 'lucide-react';

/**
 * The directory used for every server-rendered surface (headline counts, the
 * comparison table, the schema.org ItemList and the internal links below).
 *
 * `getRankedBrokers()` is deterministic on the server because its localStorage
 * merge is guarded by `typeof window !== 'undefined'`, so the pre-rendered HTML
 * and the structured data always agree. A mismatch between those two is exactly
 * what makes Google discard an ItemList.
 */
const RANKED: BrokerProfile[] = getRankedBrokers();

const TITLE = 'Brokers & Property Dealers in Dholera (RERA) | DholeraMap';
const DESCRIPTION = pageDescription(
  'Verified directory of top RERA real estate brokers, property dealers, and land consultants in Dholera SIR. Compare Gujarat RERA numbers, TP scheme coverage and listed plots.',
  'Verified directory of RERA real estate brokers and property dealers in Dholera SIR. Compare RERA numbers and TP scheme coverage.',
);

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    'dealer in dholera',
    'broker in dholera',
    'Dholera real estate brokers',
    'Dholera property dealer',
    'property dealers in Dholera',
    'dholera real estate agent contact',
    'Dholera top brokers',
    'Dholera TP 1 property dealer',
    'Dholera land consultant',
    'Dholera RERA brokers',
    'Dholera SIR investment advisory',
    'Dholera plot agent',
    'real estate agent Dholera SIR',
  ],
  alternates: { canonical: `${DOMAIN}/brokers` },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: `${DOMAIN}/brokers`,
    siteName: SITE_NAME,
    images: [
      {
        url: OG_IMAGE,
        width: OG_IMAGE_DIMS.width,
        height: OG_IMAGE_DIMS.height,
        alt: 'Top Real Estate Brokers in Dholera SIR',
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
    images: [OG_IMAGE],
  },
};

const FAQS = [
  {
    q: 'How do I choose a reliable real estate broker in Dholera SIR?',
    a: 'Verify their Gujarat RERA registration number, ensure they provide official Town Planning (TP 1–6) F-Form/interactive survey maps, and confirm transparent title search reports before executing any conveyance deeds.',
  },
  {
    q: 'What services do Dholera property advisors offer?',
    a: 'Top Dholera real estate brokers offer interactive plot identification, NA/NOC title verification, industrial land procurement, circle rate due diligence, and Town Planning scheme boundary demarcation.',
  },
  {
    q: 'Which Town Planning (TP) schemes offer the highest liquidity?',
    a: 'TP 1 and TP 2 (Activation Zone) are currently the most liquid and infrastructure-ready schemes with operational ABCD Building and subterranean trunk utilities. TP 6A/6B surrounding the Dholera International Airport offer high capital appreciation for cargo and logistics corridors.',
  },
  {
    q: 'How does the ranking system work on DholeraMap?',
    a: 'Brokers are ranked transparently according to their monthly platform investment—including active enterprise subscriptions, verified title-check credits, and profile promotional campaigns. Top ranked sponsors enjoy premier placement and direct investor inquiries.',
  },
];


/**
 * The ItemList is generated from the same RANKED array that renders the visible
 * directory, so every node in it has a real, indexable profile URL behind it.
 * The previous hand-written version described only two agents and pointed at no
 * page at all.
 */
const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebPage',
      '@id': `${DOMAIN}/brokers#webpage`,
      url: `${DOMAIN}/brokers`,
      name: TITLE,
      description: DESCRIPTION,
      isPartOf: { '@id': `${DOMAIN}/#website` },
      about: { '@id': `${DOMAIN}/#organization` },
      inLanguage: 'en-IN',
    },
    {
      '@type': 'ItemList',
      '@id': `${DOMAIN}/brokers#brokerlist`,
      name: 'Verified Real Estate Agents in Dholera SIR',
      description:
        'Ranked directory of RERA-registered brokers, property dealers and land consultants operating across Dholera Town Planning schemes TP 1 to TP 6.',
      numberOfItems: RANKED.length,
      itemListElement: RANKED.map((b, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        item: {
          '@type': 'RealEstateAgent',
          '@id': `${DOMAIN}/brokers/${b.id}#agent`,
          url: `${DOMAIN}/brokers/${b.id}`,
          name: b.agency,
          description: `${b.description} ${b.name} is a Gujarat RERA registered (${b.reraNumber}) Dholera SIR real estate agent with ${b.experienceYears}+ years of experience, covering ${b.tpSchemes.join(', ')}.`,
          telephone: b.phone,
          email: b.email,
          areaServed: 'Dholera Special Investment Region, Gujarat, India',
          knowsAbout: [...b.tpSchemes, ...b.propertyTypes],
          address: {
            '@type': 'PostalAddress',
            streetAddress: b.headOffice,
            addressLocality: 'Dholera SIR',
            addressRegion: 'Gujarat',
            addressCountry: 'IN',
          },
          parentOrganization: { '@id': `${DOMAIN}/#organization` },
        },
      })),
    },
    {
      '@type': 'FAQPage',
      '@id': `${DOMAIN}/brokers#faq`,
      mainEntity: FAQS.map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a },
      })),
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: SITE_NAME, item: DOMAIN },
        { '@type': 'ListItem', position: 2, name: 'Brokers', item: `${DOMAIN}/brokers` },
      ],
    },
  ],
};

/**
 * Server-rendered comparison table. A <table> of RERA numbers and TP coverage
 * is the most link-dense, keyword-dense block on the page and is what search
 * engines use to understand the directory's contents, so it stays in the HTML
 * rather than depending on client state.
 */
function BrokersComparisonTable({ ranked }: { ranked: BrokerProfile[] }) {
  return (
    <section className="max-w-6xl mx-auto px-4 mt-12 mb-10">
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="flex items-center gap-2 mb-2">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Verified Real Estate Consultancies in Dholera SIR
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-slate-600 mb-6">
          Compare verified Gujarat RERA registration numbers, Town Planning coverage, and official office locations across leading Dholera consultancies.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead>
              <tr className="border-b-2 border-slate-200 bg-slate-50 text-slate-700 font-bold">
                <th className="py-3 px-4">Rank</th>
                <th className="py-3 px-4">Consultancy Firm</th>
                <th className="py-3 px-4">Principal Advisor</th>
                <th className="py-3 px-4">Gujarat RERA Reg</th>
                <th className="py-3 px-4">TP Schemes Covered</th>
                <th className="py-3 px-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-600">
              {ranked.map((b, idx) => (
                <tr key={b.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-3 px-4 font-black text-slate-900">#{idx + 1}</td>
                  <td className="py-3 px-4 font-bold text-slate-900">
                    <Link href={`/brokers/${b.id}`} className="hover:text-blue-600 transition">
                      {b.agency}
                    </Link>
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-800">{b.name}</td>
                  <td className="py-3 px-4 font-mono text-[11px] text-emerald-800 font-semibold">{b.reraNumber}</td>
                  <td className="py-3 px-4 font-medium text-blue-700">{b.tpSchemes.join(', ')}</td>
                  <td className="py-3 px-4">
                    <Link
                      href={`/brokers/${b.id}`}
                      className="text-xs font-bold text-blue-600 hover:text-blue-800 inline-flex items-center gap-1"
                    >
                      <span>Profile</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}



export default function BrokersPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 pb-20 font-sans flex flex-col">
      <SiteHeader activePage="brokers" />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 pt-8 pb-6 sm:pt-12 sm:pb-8 text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold mb-4 shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>Official Directory of RERA Gujarat Registered Consultants · 1,000+ Monthly Active Viewers</span>
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight max-w-3xl mx-auto leading-tight">
          Top Real Estate Brokers in <span className="text-blue-600">Dholera SIR</span>
        </h1>

        <p className="mt-4 text-xs sm:text-sm text-slate-700 max-w-3xl mx-auto leading-relaxed font-medium bg-white border border-slate-200 p-4 rounded-2xl text-left sm:text-center shadow-xs">
          The Top Real Estate Brokers and Property Dealers in Dholera SIR represent verified, RERA-registered land advisory firms specializing in Town Planning Schemes (TP 1 to TP 6), industrial plot acquisitions, interactive survey verification, and high-yield commercial corridor investments across Gujarat&apos;s premier smart city ecosystem.
        </p>

        <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto">
          <div className="p-3.5 rounded-2xl bg-white border border-slate-200 text-center shadow-xs">
            <span className="text-xl sm:text-2xl font-black text-blue-600 block">1,000+</span>
            <span className="text-[11px] font-bold text-slate-600">Monthly Viewers</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-white border border-slate-200 text-center shadow-xs">
            <span className="text-xl sm:text-2xl font-black text-slate-900 block">3,635+</span>
            <span className="text-[11px] font-bold text-slate-600">Interactive Plots</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-white border border-slate-200 text-center shadow-xs">
            <span className="text-xl sm:text-2xl font-black text-emerald-600 block">100%</span>
            <span className="text-[11px] font-bold text-slate-600">RERA Verified</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-white border border-slate-200 text-center shadow-xs">
            <span className="text-xl sm:text-2xl font-black text-amber-600 block">{RANKED.length}</span>
            <span className="text-[11px] font-bold text-slate-600">Listed Agents</span>
          </div>
        </div>


        <div className="mt-5 max-w-3xl mx-auto p-4 rounded-2xl bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-50 border border-blue-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-left shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-black text-slate-900 block">
                Ranked by Monthly Platform Investment · 1,000+ Monthly Viewers
              </span>
              <span className="text-[11px] text-slate-600">
                Directory position is calculated from verified subscriptions, dossier credits, and active profile ad campaigns. Top-ranked sponsors receive prime front-page exposure in front of 1,000+ active monthly investors.
              </span>
            </div>
          </div>
          <Link
            href="/settings"
            className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition whitespace-nowrap shadow-xs shrink-0 flex items-center gap-1.5"
          >
            <span>Boost Your Rank</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </section>

      {/* The directory itself. Seeded with the server-computed ranking so the
          full agent list — names, RERA numbers, TP coverage and links to every
          profile — is present in the first HTML response. */}
      <BrokersDirectory initialBrokers={RANKED} />

      <BrokersComparisonTable ranked={RANKED} />

      {/* Village cross-links. Each village page is its own intent
          ("<village> property dealer"), so linking them from the directory
          spreads authority into 22 long-tail landing pages. */}
      <section className="max-w-6xl mx-auto px-4 mt-12 mb-10">
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mb-2">
            Find a Broker by Village
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mb-5">
            Each Dholera SIR revenue village has its own demand profile, zone classification and price band.
            Jump straight to the village you are investing in to see its cadastral coverage and current listings.
          </p>
          <div className="flex flex-wrap gap-2">
            {VILLAGES.map((v) => (
              <Link
                key={v.slug}
                href={`/village/${v.slug}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-xs font-bold text-slate-700 transition"
              >
                <MapPin className="w-3 h-3 text-slate-400" />
                <span>{v.name}</span>
                <span className="text-[10px] font-medium text-slate-400">{v.scheme}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ rendered from the same FAQS array that feeds the FAQPage schema,
          so visible copy and structured data can never drift apart. */}
      <section className="max-w-6xl mx-auto px-4 mb-12">
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mb-4">
            Frequently Asked Questions Regarding Dholera Property Brokers
          </h2>
          <div className="space-y-4 divide-y divide-slate-100">
            {FAQS.map((f) => (
              <div key={f.q} className="pt-4 first:pt-0">
                <h3 className="text-sm font-bold text-slate-900 flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  {f.q}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-1.5 leading-relaxed">{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
