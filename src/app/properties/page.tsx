import type { Metadata } from 'next';
import Link from 'next/link';
import SiteHeader from '@/components/panels/SiteHeader';
import SiteFooter from '@/components/panels/SiteFooter';
import PropertyFilters, { type Listing } from '@/components/properties/PropertyFilters';
import { getAllBrokerProperties } from '@/lib/brokers';
import { VILLAGES } from '@/lib/villages';
import { DOMAIN, SITE_NAME, OG_IMAGE, OG_IMAGE_DIMS, pageTitle, pageDescription } from '@/lib/brand';
import { ArrowRight, ShieldCheck, MapPin, HelpCircle } from 'lucide-react';

const TITLE = pageTitle('Plots for Sale in Dholera SIR');
const DESCRIPTION = pageDescription(
  'Browse verified plots for sale in Dholera SIR. Filter by village, Town Planning scheme, zone and road width. Every listing links to its survey number, Final Plot and cadastral record.',
  'Verified plots for sale in Dholera SIR. Filter by village, TP scheme, zone and road width; every listing links to its cadastral record.',
);

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    'plots for sale in Dholera',
    'Dholera plots for sale',
    'property for sale Dholera SIR',
    'Dholera land for sale',
    'Dholera SIR plots available',
    'buy plot in Dholera',
    'Dholera residential plot sale',
    'Dholera commercial plot for sale',
    'Dholera TP 1 plot for sale',
    'Dholera industrial plot sale',
  ],
  alternates: { canonical: `${DOMAIN}/properties` },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: `${DOMAIN}/properties`,
    siteName: SITE_NAME,
    images: [
      {
        url: OG_IMAGE,
        width: OG_IMAGE_DIMS.width,
        height: OG_IMAGE_DIMS.height,
        alt: 'Plots for sale in Dholera SIR',
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
    q: 'How do I verify a Dholera plot listed for sale?',
    a: 'Take the Final Plot (FP) number and revenue survey number from the listing, open the DholeraMap interactive atlas and confirm the parcel sits inside the correct Town Planning scheme, check the abutting sanctioned road width, and ask the seller for a 30-year title search report and encumbrance certificate before paying any earnest money.',
  },
  {
    q: 'What is the difference between an OP number and an FP number in Dholera?',
    a: 'An OP (Original Plot) number is the pre-reconstitution survey unit. An FP (Final Plot) number is the post-Town-Planning reconstituted parcel, reconstituted by DSIRDA. Only the FP number is the legally saleable, mappable unit, and it is the number you should verify and register against.',
  },
  {
    q: 'Which Dholera villages have the best plot availability?',
    a: 'Availability is concentrated in the Activation Area villages such as Kadipur, Bhadiyad, Ambli and Dholera, where TP 1 and TP 2 reconstituted plots are already in the cadastral record. Corridor villages along the Dholera Expressway and the airport ring road, including Bavaliyari, Pipli and Zankhi, carry lower rates with higher future upside.',
  },
  {
    q: 'Do I need a DGDCR-approved layout before buying a plot?',
    a: 'Yes. Under DGDCR 2024 rules the sanctioned road hierarchy, plot setbacks and coverage govern what can be built. Never buy on the strength of a broker brochure alone — pull the parcel on the interactive Dholera map to see its sanctioned road width and zone before you commit.',
  },
];

/**
 * Flatten the broker + property pairs into a single serialisable inventory so
 * the server can hand the whole set to the client filter as props. Each
 * listing's cadastral identifiers (FP + survey) are what make it a distinct,
 * verifiable search target rather than generic marketing copy.
 */
const LISTINGS: Listing[] = getAllBrokerProperties()
  .map(({ broker, property }) => ({
    id: property.id,
    title: property.title,
    village: property.village,
    tpScheme: property.tpScheme,
    sid: property.sid,
    fp: property.fp,
    survey: property.survey,
    zone: property.zone,
    roadWidth: property.roadWidth,
    pricePerSqYd: property.pricePerSqYd,
    totalDemand: property.totalDemand,
    highlights: property.highlights ?? [],
    hasBrochure: property.hasBrochure,
    status: property.status,
    listedDate: property.listedDate,
    brokerName: broker.name,
    brokerAgency: broker.agency,
    brokerId: broker.id,
    brokerWhatsapp: broker.whatsapp,
    brokerPhotoUrl: broker.photoUrl,
  }))
  .sort((a, b) => (a.village || '').localeCompare(b.village || ''));

/**
 * One Offer node per listing. Prices are quoted as strings in the source data
 * (e.g. "₹48.5 Lakhs"), which is valid schema.org `price`, so nothing is
 * invented or rounded here.
 */
const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebPage',
      '@id': `${DOMAIN}/properties#webpage`,
      url: `${DOMAIN}/properties`,
      name: TITLE,
      description: DESCRIPTION,
      isPartOf: { '@id': `${DOMAIN}/#website` },
      about: { '@id': `${DOMAIN}/#organization` },
      inLanguage: 'en-IN',
    },
    {
      '@type': 'ItemList',
      '@id': `${DOMAIN}/properties#listings`,
      name: 'Verified Plots for Sale in Dholera SIR',
      description:
        'Final Plot and survey-identified land listings across the Dholera Special Investment Region, each cross-referenced to the DholeraMap interactive cadastral atlas.',
      numberOfItems: LISTINGS.length,
      itemListElement: LISTINGS.map((l, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        item: {
          '@type': 'RealEstateListing',
          name: l.title,
          description: `${l.title} in ${l.village}, ${l.tpScheme}. Zone ${l.zone}. Fronting ${l.roadWidth}. Final Plot ${l.fp}, revenue survey ${l.survey}. Listed by ${l.brokerAgency}.`,
          category: 'Land / Plot',
          url: `${DOMAIN}/map?sid=${l.sid}&fp=${l.fp}&survey=${l.survey}&village=${l.village}`,
          offers: {
            '@type': 'Offer',
            price: l.totalDemand,
            priceCurrency: 'INR',
            availability:
              l.status === 'sold'
                ? 'https://schema.org/SoldOut'
                : l.status === 'under_token'
                ? 'https://schema.org/LimitedAvailability'
                : 'https://schema.org/InStock',
            url: `${DOMAIN}/map?sid=${l.sid}&fp=${l.fp}&survey=${l.survey}&village=${l.village}`,
            seller: {
              '@type': 'RealEstateAgent',
              name: l.brokerAgency,
              url: `${DOMAIN}/brokers/${l.brokerId}`,
            },
          },
          additionalProperty: [
            {
              '@type': 'PropertyValue',
              name: 'Final Plot number',
              value: l.fp,
            },
            { '@type': 'PropertyValue', name: 'Revenue survey number', value: l.survey },
            { '@type': 'PropertyValue', name: 'Zone', value: l.zone },
            { '@type': 'PropertyValue', name: 'Abutting road width', value: l.roadWidth },
            { '@type': 'PropertyValue', name: 'Rate per sq. yard', value: l.pricePerSqYd },
          ],
        },
      })),
    },
    {
      '@type': 'FAQPage',
      '@id': `${DOMAIN}/properties#faq`,
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
        { '@type': 'ListItem', position: 2, name: 'Properties', item: `${DOMAIN}/properties` },
      ],
    },
  ],
};

export default function PropertiesPage() {
  const availableCount = LISTINGS.filter((l) => l.status === 'available').length;
  const villageCount = new Set(LISTINGS.map((l) => l.village).filter(Boolean)).size;

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 pb-20 font-sans flex flex-col">
      <SiteHeader activePage="properties" />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 pt-8 pb-6 sm:pt-12 sm:pb-8 text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold mb-4">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Every listing carries its Final Plot and revenue survey number</span>
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight max-w-3xl mx-auto leading-tight">
          Plots for Sale in <span className="text-blue-600">Dholera SIR</span>
        </h1>

        <p className="mt-4 text-xs sm:text-sm text-slate-700 max-w-3xl mx-auto leading-relaxed font-medium bg-white border border-slate-200 p-4 rounded-2xl text-left sm:text-center shadow-xs">
          Every plot below is published with its Final Plot (FP) number, revenue survey number, zone and
          abutting sanctioned road width. Open any listing on the DholeraMap interactive cadastral atlas to
          confirm the parcel boundaries, road hierarchy and DGDCR 2024 building envelope before you commit
          any earnest money.
        </p>

        <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto">
          <div className="p-3.5 rounded-2xl bg-white border border-slate-200 text-center shadow-xs">
            <span className="text-xl sm:text-2xl font-black text-blue-600 block">{LISTINGS.length}</span>
            <span className="text-[11px] font-bold text-slate-600">Total Listings</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-white border border-slate-200 text-center shadow-xs">
            <span className="text-xl sm:text-2xl font-black text-emerald-600 block">{availableCount}</span>
            <span className="text-[11px] font-bold text-slate-600">Available Now</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-white border border-slate-200 text-center shadow-xs">
            <span className="text-xl sm:text-2xl font-black text-slate-900 block">{villageCount}</span>
            <span className="text-[11px] font-bold text-slate-600">Villages Covered</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-white border border-slate-200 text-center shadow-xs">
            <span className="text-xl sm:text-2xl font-black text-amber-600 block">TP 1–6</span>
            <span className="text-[11px] font-bold text-slate-600">Scheme Coverage</span>
          </div>
        </div>
      </section>

      <PropertyFilters initialListings={LISTINGS} />


      {/* Village deep-links. "Plot for sale in <village>" is a distinct
          long-tail query per village, and each village page carries that
          village's own zone narrative and price band. */}
      <section className="max-w-6xl mx-auto px-4 mt-12 mb-10">
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mb-2">
            Plots by Village in Dholera SIR
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mb-5">
            Dholera&apos;s {VILLAGES.length} revenue villages differ sharply in zoning, infrastructure
            readiness and rate. Open a village to see its cadastral coverage, zone classification and
            development outlook.
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


      {/* Buying guide — the "info" half of the property query, which is what
          makes this page a useful destination rather than a bare list. */}
      <section className="max-w-6xl mx-auto px-4 mb-10">
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mb-4">
            How to Buy a Plot in Dholera SIR: A Five-Step Verification
          </h2>
          <ol className="space-y-4">
            {[
              {
                t: 'Pull the parcel on the interactive map',
                d: 'Search the Final Plot or revenue survey number in the DholeraMap atlas. Confirm the parcel sits inside the Dholera Special Investment Region boundary and inside the Town Planning scheme the seller claims.',
              },
              {
                t: 'Check the sanctioned road width against the parcel',
                d: 'Road width drives frontage, FAR and therefore valuation. A plot marketed as an 18m or 24m road parcel that the cadastre shows against a 9m service road is materially mispriced.',
              },
              {
                t: 'Obtain an independent title search',
                d: 'Ask for a 30-year title search report and an encumbrance certificate covering the vendor chain. In Dholera, also verify whether the plot is free of any DSIRDA allotment conditions or pending acquisition proceedings.',
              },
              {
                t: 'Reconcile OP area against FP area',
                d: 'Reconstitution from Original Plot to Final Plot frequently changes the sellable area. Ask for both figures and the effective rate per square yard on the FP area, not the larger OP area.',
              },
              {
                t: 'Verify the building envelope before you design',
                d: 'Zone, permitted FAR, setbacks and coverage are fixed by the DGDCR 2024 regulations for that sub-sector. Confirm them on the parcel view so your construction plan is legal from day one.',
              },
            ].map((step, i) => (
              <li key={step.t} className="flex gap-3">
                <span className="shrink-0 w-7 h-7 rounded-xl bg-blue-600 text-white font-black text-xs flex items-center justify-center">
                  {i + 1}
                </span>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{step.t}</h3>
                  <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">{step.d}</p>
                </div>
              </li>
            ))}
          </ol>


          <div className="mt-6 pt-5 border-t border-slate-100 flex flex-wrap gap-2">
            <Link
              href="/dholera-plot-price"
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-blue-600 text-white text-xs font-bold transition flex items-center gap-1.5"
            >
              <span>Check Dholera plot prices</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              href="/brokers"
              className="px-4 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-800 text-xs font-bold transition flex items-center gap-1.5"
            >
              <span>Browse verified Dholera brokers</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              href="/dholera-7-12-anyror-land-records"
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition flex items-center gap-1.5"
            >
              <span>7/12 and Anyor land records</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ — rendered from the same array that feeds the FAQPage schema, so
          visible copy and structured data can never drift. */}
      <section className="max-w-6xl mx-auto px-4 mb-12">
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mb-4 flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-blue-600" />
            Frequently Asked Questions About Dholera Plots
          </h2>
          <div className="space-y-4 divide-y divide-slate-100">
            {FAQS.map((f) => (
              <div key={f.q} className="pt-4 first:pt-0">
                <h3 className="text-sm font-bold text-slate-900">{f.q}</h3>
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
