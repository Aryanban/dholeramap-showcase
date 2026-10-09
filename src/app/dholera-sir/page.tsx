import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  MapPin,
  Building2,
  Scale,
  FileCheck,
  Landmark,
  HelpCircle,
  Layers,
} from 'lucide-react';
import SiteHeader from '@/components/panels/SiteHeader';
import SiteFooter from '@/components/panels/SiteFooter';
import { VILLAGES } from '@/lib/villages';
import { DOMAIN, SITE_NAME, OG_IMAGE, OG_IMAGE_DIMS, VILLAGE_COUNT, hreflang, pageDescription } from '@/lib/brand';

const URL = `${DOMAIN}/dholera-sir`;

/**
 * SEO: this page exists to OWN the head term "dholera sir".
 *
 * Before this page, three URLs competed for it: the homepage (whose keywords
 * array listed "Dholera SIR full form" and "what is Dholera SIR"), the blog
 * post /blog/dholera-sir-full-form, and /guide. GSC showed "dholera sir" at
 * position 90, "dholera map" at 46.5 and "dholera smart city map" at 67.5 —
 * classic cannibalisation: three relevant pages, none authoritative enough to
 * win, so Google ranked all of them low.
 *
 * The split is now: THIS page owns the definitional/head intent ("what is
 * Dholera SIR", "dholera sir full form", "where is Dholera SIR"), while the
 * blog post keeps long-tail explainer intent and links up to this page.
 */
export const metadata: Metadata = {
  title: 'Dholera SIR Full Form, Map & Meaning (2026) | DholeraMap',
  description: pageDescription(
    'Dholera SIR stands for Dholera Special Investment Region — a 920 sq km statutory region under the Gujarat SIR Act 2009. View the full map, all 6 TP schemes, 22 villages and plot rules.',
    'Dholera SIR: a 920 sq km statutory Special Investment Region under the Gujarat SIR Act 2009. Map, 6 TP schemes, 22 villages and plot rules.',
  ),
  keywords: [
    'Dholera SIR',
    'Dholera SIR full form',
    'Dholera full form',
    'what is Dholera SIR',
    'what does SIR stand for',
    'Dholera Special Investment Region',
    'Dholera SIR map',
    'Dholera SIR area',
    'Dholera SIR vs SEZ',
    'where is Dholera SIR',
    'Dholera SIR location',
    'Dholera SIR TP schemes',
    'Dholera SIR villages',
    'DSIRDA',
    'Dholera SIR Act 2009',
  ],
  alternates: {
    canonical: URL,
    languages: hreflang(URL),
  },
  openGraph: {
    title: 'Dholera SIR: Map, Area & TP Schemes | DholeraMap',
    description: pageDescription(
      'The definitive guide to Dholera Special Investment Region: 920 sq km under the Gujarat SIR Act 2009, six TP schemes, 22 villages, and the FAR and road-width rules that decide what you can build.',
      'Dholera Special Investment Region: 920 sq km, six TP schemes, 22 villages, and the plot rules that decide what you can build.',
    ),
    url: URL,
    siteName: SITE_NAME,
    images: [
      {
        url: OG_IMAGE,
        width: OG_IMAGE_DIMS.width,
        height: OG_IMAGE_DIMS.height,
        alt: 'Dholera Special Investment Region (SIR) map and town planning schemes',
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Dholera SIR: Map, Area & TP Schemes | DholeraMap',
    description: pageDescription(
      '920 sq km statutory region under the Gujarat SIR Act 2009 — six TP schemes, 22 villages, and the plot rules that decide what you can build.',
    ),
    images: [OG_IMAGE],
  },
};

const SIR_FACTS = [
  {
    icon: Scale,
    label: 'Full form',
    value: 'Dholera Special Investment Region',
    detail: 'Statutory designation under the Gujarat Special Investment Region Act, 2009 — not a marketing label.',
  },
  {
    icon: MapPin,
    label: 'Area',
    value: '~920 sq km',
    detail: 'South-west of Ahmedabad district, Gujarat, on the Gulf of Khambhat coast, ~100 km from Ahmedabad city.',
  },
  {
    icon: Layers,
    label: 'Structure',
    value: '6 Town Planning schemes',
    detail: 'TP 1 to TP 6, each with its own zoning, road hierarchy and DGDCR building envelope.',
  },
  {
    icon: Building2,
    label: 'Villages',
    value: `${VILLAGE_COUNT} revenue villages`,
    detail: 'Plotted, digitised and searchable by revenue survey number and Final Plot on the interactive atlas.',
  },
  {
    icon: Landmark,
    label: 'Planning authority',
    value: 'DSIRDA',
    detail: 'Dholera SIR Development Authority sanctions schemes and building permissions. DICDL builds trunk infrastructure.',
  },
  {
    icon: FileCheck,
    label: 'Plot identity',
    value: 'Final Plot (FP) number',
    detail: 'Agricultural survey parcels are reconstituted into serviced FP numbers under the GTPUD Act 1976.',
  },
];

const SIR_VS = [
  {
    term: 'SIR',
    full: 'Special Investment Region',
    allows:
      'A statutory region under the Gujarat SIR Act 2009. Spans industrial, residential, commercial and civic zones with a dedicated development authority and master plan.',
  },
  {
    term: 'SEZ',
    full: 'Special Economic Zone',
    allows:
      'A fenced enclave with customs duty and tax benefits for export-oriented units only. Not a city — no residential or civic master planning.',
  },
  {
    term: 'Smart city',
    full: 'Smart Cities Mission label',
    allows:
      'An urban development concept. Dholera is called a greenfield smart city because it is built from scratch with integrated utilities rather than retrofitted.',
  },
];

const FAQS = [
  {
    q: 'What does SIR stand for in Dholera?',
    a: 'Dholera SIR stands for Dholera Special Investment Region. It is a statutory planning designation created by the Gujarat Special Investment Region Act, 2009, covering roughly 920 square kilometres across 22 revenue villages in Ahmedabad district, Gujarat. Land inside an SIR is planned, zoned and regulated by the Dholera SIR Development Authority (DSIRDA) rather than by ordinary municipal or panchayat rules.',
  },
  {
    q: 'Is Dholera SIR an SEZ?',
    a: 'No. An SIR is a statutory region; an SEZ is a fenced enclave offering customs duty and tax benefits to export-oriented units. A Dholera plot can sit inside the SIR and benefit from smart-city infrastructure, but SIR membership does not automatically make it an SEZ. If an agent promises SEZ benefits, ask which gazetted notification they mean.',
  },
  {
    q: 'How many Town Planning schemes are in Dholera SIR?',
    a: 'Six: TP 1, TP 2 (divided into TP 2A and TP 2B), TP 3, TP 4, TP 5 and TP 6. The scheme your plot falls inside determines its zoning, abutting road width, permissible FAR and maximum building height.',
  },
  {
    q: 'What is the difference between an OP number and an FP number?',
    a: 'An OP (Original Plot) number is the pre-reconstitution survey unit. An FP (Final Plot) number is the post-Town-Planning parcel reconstituted by DSIRDA under the GTPUD Act 1976. Only the FP number is the legally saleable, mappable unit and is the number you should verify and register against.',
  },
  {
    q: 'Who administers Dholera SIR — DSIRDA or DICDL?',
    a: 'Both, with different remits. DSIRDA (Dholera SIR Development Authority) is the statutory planning authority that sanctions town planning schemes and building permissions. DICDL (Dholera Industrial City Development Limited) is the project execution company that builds trunk roads, utilities and SCADA networks. Village-level 7/12 revenue records still originate from the Gujarat revenue department.',
  },
  {
    q: 'How do I verify a plot in Dholera SIR before buying?',
    a: 'Take the Final Plot number and revenue survey number from the listing, open the interactive Dholera map and confirm the parcel sits inside the correct TP scheme, then check its abutting sanctioned road width and zone. Ask the seller for a 30-year title search report and encumbrance certificate before paying any earnest money.',
  },
];

/** The six schemes, matching the published cadastre labels in src/lib/villages.ts. */
const SCHEME_LINKS = [
  { id: 'TP 1', focus: 'Residential R-1, city centre & Activation Area', villages: 'Ambli, Kadipur, Bhadiyad, Gogla' },
  { id: 'TP 2', focus: 'High-access corridor, semiconductor fab & heavy industry', villages: 'Hebatpur, Bhadiyad, Bavaliyari' },
  { id: 'TP 3', focus: 'Commercial city centre & general industrial', villages: 'Gorasu, Sandhida, Dholera' },
  { id: 'TP 4', focus: 'Renewable energy, solar park & knowledge corridor', villages: 'Bhangadh, Bhimtalav, Mundi' },
  { id: 'TP 5', focus: 'Aerotropolis — airport support, MRO & cargo', villages: 'Sangasar, Umargadh, Zankhi' },
  { id: 'TP 6', focus: 'Heavy engineering & coastal industrial', villages: 'Khun, Otariya, Bavaliyari' },
];

const sirJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Article',
      '@id': `${URL}#article`,
      headline: 'Dholera SIR: Map, Area & TP Schemes',
      description:
        'Dholera Special Investment Region explained: the Gujarat SIR Act 2009 designation, 920 sq km of planned land across 22 villages, six town planning schemes and the DGDCR building rules.',
      datePublished: '2026-09-21',
      dateModified: '2026-09-29',
      author: {
        '@type': 'Organization',
        '@id': `${DOMAIN}/#organization`,
        name: `${SITE_NAME} GIS Desk`,
      },
      publisher: { '@id': `${DOMAIN}/#organization` },
      about: { '@type': 'Place', name: 'Dholera Special Investment Region, Gujarat, India' },
    },
    {
      '@type': 'Place',
      '@id': `${URL}#place`,
      name: 'Dholera Special Investment Region',
      alternateName: ['Dholera SIR', 'Dholera SIR Act 2009 region'],
      description:
        'A 920 square kilometre statutory Special Investment Region in Ahmedabad district, Gujarat, planned through six Town Planning schemes.',
      geo: { '@type': 'GeoCoordinates', latitude: 22.25, longitude: 72.18 },
      area: { '@type': 'QuantitativeValue', value: 920, unitCode: 'KMK' },
    },
    {
      '@type': 'FAQPage',
      '@id': `${URL}#faq`,
      mainEntity: FAQS.map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a },
      })),
    },
    {
      '@type': 'BreadcrumbList',
      '@id': `${URL}#breadcrumb`,
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: DOMAIN },
        { '@type': 'ListItem', position: 2, name: 'Dholera SIR', item: URL },
      ],
    },
  ],
};

export default function DholeraSirPage() {
  return (
    <>
      <SiteHeader activePage="dholera-sir" />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(sirJsonLd) }}
      />

      {/* Hero */}
      <section className="bg-gradient-to-b from-blue-50/70 via-slate-50 to-white text-slate-900 py-12 sm:py-16 px-4 sm:px-6 lg:px-8 border-b border-slate-200">
        <div className="max-w-5xl mx-auto">
          <nav aria-label="Breadcrumb" className="mb-5 text-xs text-slate-500">
            <Link href="/" className="hover:text-blue-700">Home</Link>
            <span className="mx-2">/</span>
            <span className="text-slate-700">Dholera SIR</span>
          </nav>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900">
            Dholera SIR — Special Investment Region
          </h1>
          <p className="mt-4 text-base sm:text-lg text-slate-700 max-w-3xl leading-relaxed">
            <strong>Dholera SIR</strong> stands for <strong>Dholera Special Investment
            Region</strong> — roughly <strong>920 square kilometres</strong> of planned land
            across <strong>{VILLAGE_COUNT} revenue villages</strong> in Ahmedabad district,
            Gujarat, created as a statutory planning designation under the{' '}
            <strong>Gujarat Special Investment Region Act, 2009</strong>.
          </p>
          <p className="mt-3 text-sm sm:text-base text-slate-600 max-w-3xl leading-relaxed">
            This is the single reference page for the region: what the designation legally
            means, how the six Town Planning schemes divide the land, who administers it, and
            how to verify a specific plot before you pay for it.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              href="/map"
              className="inline-flex items-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition cursor-pointer"
            >
              <MapPin className="w-4 h-4" />
              Open the Dholera SIR map
            </Link>
            <Link
              href="/dholera-tp-map"
              className="inline-flex items-center gap-2 px-5 py-3 bg-white hover:bg-slate-50 text-slate-800 font-bold rounded-xl border border-slate-300 transition cursor-pointer"
            >
              <Layers className="w-4 h-4" />
              View TP 1–6 schemes
            </Link>
          </div>
        </div>
      </section>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-14">
        {/* Key facts */}
        <section className="space-y-6">
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
            Dholera SIR at a glance
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {SIR_FACTS.map((f) => (
              <div
                key={f.label}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-2"
              >
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-blue-700">
                  <f.icon className="w-4 h-4" />
                  {f.label}
                </div>
                <p className="text-base font-black text-slate-900">{f.value}</p>
                <p className="text-xs text-slate-600 leading-relaxed">{f.detail}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Server-rendered regional map: keeps the "dholera map" head term
            anchored to a real HTML image instead of only existing inside Leaflet. */}
        <section className="space-y-5">
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
            Where is Dholera SIR?
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed max-w-3xl">
            Dholera SIR sits in the south-west of Ahmedabad district along the Gulf of
            Khambhat coast, roughly 100 km south-west of Ahmedabad city and about 130 km
            from Gandhinagar. It is a designated node on the Delhi–Mumbai Industrial
            Corridor (DMIC).
          </p>
          <figure className="rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-xs">
            <div className="relative h-64 sm:h-96 w-full bg-slate-100">
              <Image
                src="/maps/schemes/macro_villages.jpg"
                alt="Dholera SIR regional map, 22 villages and 6 TP schemes"
                fill
                sizes="(max-width: 1024px) 100vw, 1024px"
                className="object-cover"
              />
            </div>
            <figcaption className="p-4 text-xs text-slate-600">
              The Dholera SIR regional framework: all {VILLAGE_COUNT} revenue villages
              plotted against the TP 1 to TP 6 schemes.
            </figcaption>
          </figure>
        </section>

        {/* SIR vs SEZ */}
        <section className="space-y-5">
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
            SIR vs SEZ vs smart city
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed max-w-3xl">
            These three terms are constantly mixed up, and the difference directly affects
            what you are allowed to do with a plot.
          </p>
          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-xs">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-black">Term</th>
                  <th className="px-4 py-3 font-black">Full form</th>
                  <th className="px-4 py-3 font-black">What it allows</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {SIR_VS.map((r) => (
                  <tr key={r.term}>
                    <td className="px-4 py-3 font-black text-slate-900 whitespace-nowrap">{r.term}</td>
                    <td className="px-4 py-3 text-slate-700 whitespace-nowrap">{r.full}</td>
                    <td className="px-4 py-3 text-slate-600 leading-relaxed">{r.allows}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* TP schemes */}
        <section className="space-y-5">
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
            How Dholera SIR is structured: TP 1 to TP 6
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed max-w-3xl">
            The scheme your plot falls inside determines almost everything about it — road
            frontage, permissible height and zoning. Inspect every sanctioned boundary on the{' '}
            <Link href="/dholera-tp-map" className="text-blue-700 hover:underline font-semibold">
              Dholera TP map
            </Link>
            .
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {SCHEME_LINKS.map((s) => (
              <div
                key={s.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-1.5"
              >
                <h3 className="text-sm font-black text-slate-900">{s.id}</h3>
                <p className="text-xs text-slate-700 leading-relaxed">{s.focus}</p>
                <p className="text-[11px] text-slate-500">Villages: {s.villages}</p>
              </div>
            ))}
          </div>
        </section>

        {/* What SIR status means for a buyer */}
        <section className="space-y-5">
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
            What SIR status means for a land buyer
          </h2>
          <ol className="space-y-4">
            {[
              {
                t: 'Statutory reconstitution of plots',
                d: 'Under the Gujarat Town Planning and Urban Development (GTPUD) Act 1976, agricultural survey parcels inside a TP scheme are reconstituted. Roughly half the gross area is contributed to public infrastructure, and landowners receive a serviced Final Plot (FP) with legal road frontage and clear title.',
              },
              {
                t: 'Faster non-agricultural (NA) permissions',
                d: 'Because the region is pre-planned, NA approval for a serviced final plot is far more straightforward than for ordinary agricultural land outside an SIR.',
              },
              {
                t: 'Building controls follow the road',
                d: 'Under DGDCR development control regulations your permissible FAR (1.20 to 4.00) and maximum height (15 m to 70+ m) are determined by the width of the road your plot abuts — not by a flat zone-wide rule.',
              },
              {
                t: '7/12 remains the proof of title',
                d: 'Village-level revenue records still originate from the Gujarat revenue department, so a 7/12 (Satbara) check stays the statutory proof of ownership even inside the SIR.',
              },
            ].map((n, i) => (
              <li key={n.t} className="flex gap-4">
                <span className="shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white font-black text-sm flex items-center justify-center">
                  {i + 1}
                </span>
                <div>
                  <h3 className="text-sm font-black text-slate-900">{n.t}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed mt-1">{n.d}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* Village index — internal links into the programmatic cluster */}
        <section className="space-y-5">
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
            All {VILLAGE_COUNT} Dholera SIR villages
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed max-w-3xl">
            Every revenue village in the region has its own page with scheme, zoning, road
            tiers and a derived FAR range.
          </p>
          <div className="flex flex-wrap gap-2">
            {VILLAGES.map((v) => (
              <Link
                key={v.slug}
                href={`/village/${v.slug}`}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white border border-slate-200 text-slate-700 hover:border-blue-300 hover:text-blue-700 transition cursor-pointer"
              >
                {v.name}
                <span className="ml-1.5 text-[10px] text-slate-400">{v.scheme}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="space-y-5">
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 flex items-center gap-2">
            <HelpCircle className="w-6 h-6 text-blue-600" />
            Dholera SIR questions
          </h2>
          <div className="space-y-3">
            {FAQS.map((f) => (
              <details
                key={f.q}
                className="group rounded-2xl border border-slate-200 bg-white shadow-xs"
              >
                <summary className="cursor-pointer list-none px-5 py-4 text-sm font-black text-slate-900 flex items-center justify-between gap-4">
                  {f.q}
                  <span className="shrink-0 text-blue-600 transition group-open:rotate-45 text-lg leading-none">
                    +
                  </span>
                </summary>
                <p className="px-5 pb-4 text-sm text-slate-600 leading-relaxed">{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* Next steps */}
        <section className="rounded-3xl border border-slate-200 bg-white p-8 sm:p-10 shadow-xs space-y-5">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">
            Verify a specific plot
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed max-w-3xl">
            Now that you know what the designation means, check the parcel itself — its TP
            scheme, abutting road width and the FAR that road allows.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { href: '/map', label: 'Search the interactive map' },
              { href: '/dholera-7-12-anyror-land-records', label: 'Check 7/12 & AnyRoR records' },
              { href: '/dholera-plot-price', label: 'Compare plot prices' },
            ].map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="inline-flex items-center justify-between gap-2 px-4 py-3 rounded-xl border border-slate-200 text-sm font-bold text-slate-800 hover:border-blue-300 hover:text-blue-700 transition cursor-pointer"
              >
                {l.label}
                <ArrowRight className="w-4 h-4 shrink-0" />
              </Link>
            ))}
          </div>
          <p className="text-xs text-slate-500">
            Looking for the longer explainer?{' '}
            <Link
              href="/blog/dholera-sir-full-form"
              className="text-blue-700 hover:underline font-semibold"
            >
              Read the Dholera SIR full form article
            </Link>{' '}
            for the legal background on the SIR Act 2009.
          </p>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
