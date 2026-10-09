import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import SiteHeader from '@/components/panels/SiteHeader';
import SiteFooter from '@/components/panels/SiteFooter';
import {
  Phone,
  MessageCircle,
  Mail,
  MapPin,
  ShieldCheck,
  Award,
  Crown,
  Share2,
  FileText,
  ExternalLink,
  ChevronLeft,
  Building,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { SEEDED_BROKERS, getRankedBrokers, getBrokerById } from '@/lib/brokers';
import BrokerInquiryForm from '@/components/brokers/BrokerInquiryForm';
import type { Metadata } from 'next';
import { DOMAIN, SITE_NAME, OG_IMAGE, OG_IMAGE_DIMS, pageTitle, pageDescription } from '@/lib/brand';

export async function generateStaticParams() {
  const brokers = SEEDED_BROKERS;
  return [...brokers.map((b) => ({ id: b.id })), { id: 'user-broker' }];
}

// Seeded profiles are build-time constants — fully static, no ISR reads.
// dynamicParams=false means unknown /brokers/<id> 404s at the edge instead
// of rendering on demand at origin.
export const dynamicParams = false;
export const revalidate = false;

interface PageProps {
  params: Promise<{ id: string }>;
}

// Unique per-broker metadata. Without this every broker profile inherits the
// homepage title, which Google reads as duplicate content and deindexes.
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const broker = getBrokerById(id) ?? SEEDED_BROKERS.find((b) => b.id === id);
  if (!broker) {
    return {
      title: `Dholera SIR Real Estate Agent | ${SITE_NAME}`,
      description:
        'Profile of a Dholera SIR real estate agent with RERA registration, TP scheme specialisations and listed land parcels.',
      alternates: { canonical: `${DOMAIN}/brokers` },
    };
  }

  const schemes = broker.tpSchemes.join(', ');
  // Width-capped at the template so no broker name or agency length can push
  // the title past the 60-char SERP window.
  const title = pageTitle(`${broker.name} — Dholera SIR RERA Agent`);
  const description = pageDescription(
    `${broker.name}, ${broker.agency} — Gujarat RERA agent (${broker.reraNumber}), ${schemes} plots. ${broker.experienceYears}+ yrs, ${broker.dealsClosed} deals closed.`,
    `${broker.name}, ${broker.agency} — Gujarat RERA agent (${broker.reraNumber}), ${schemes} plots, ${broker.experienceYears}+ years in Dholera.`,
  );
  const url = `${DOMAIN}/brokers/${broker.id}`;

  return {
    title,
    description,
    keywords: [
      `${broker.name} Dholera`,
      `${broker.agency} Dholera`,
      'Dholera real estate agent',
      'Dholera SIR broker',
      'RERA registered agent Dholera',
      broker.reraNumber,
      `${broker.name} ${SITE_NAME}`,
      ...broker.tpSchemes.map((s) => `Dholera ${s} plot agent`),
    ],
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      type: 'profile',
      images: [
        {
          url: OG_IMAGE,
          width: OG_IMAGE_DIMS.width,
          height: OG_IMAGE_DIMS.height,
          alt: `${broker.agency} — Dholera SIR real estate agent profile`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [OG_IMAGE],
    },
  };
}
/** The FAQ array is the single source of truth for both the FAQPage JSON-LD
 *  above and the visible FAQ section below, so the two can never drift. */
function brokerFaqs(broker: { name: string; agency: string; reraNumber: string; phone: string; headOffice: string; tpSchemes: string[]; experienceYears: number; dealsClosed: string }) {
  return [
    {
      q: `Is ${broker.agency} a RERA registered real estate agent in Dholera SIR?`,
      a: `Yes. ${broker.name} of ${broker.agency} is registered with Gujarat RERA under number ${broker.reraNumber}, specialising in ${broker.tpSchemes.join(', ')} plots in the Dholera Special Investment Region.`,
    },
    {
      q: `Which Town Planning schemes does ${broker.agency} cover?`,
      a: `${broker.agency} covers ${broker.tpSchemes.join(', ')} across the Dholera SIR with ${broker.experienceYears}+ years of local transaction experience and ${broker.dealsClosed} deals closed.`,
    },
    {
      q: `How do I contact ${broker.name} about a Dholera plot?`,
      a: `Call ${broker.phone}, message on WhatsApp, or use the inquiry form on this profile. The office is at ${broker.headOffice}.`,
    },
  ];
}

export default async function BrokerDetailPage({ params }: PageProps) {
  const { id } = await params;
  const allRanked = getRankedBrokers();
  const brokerIndex = allRanked.findIndex((b) => b.id === id);
  const broker = allRanked[brokerIndex] || getBrokerById(id) || SEEDED_BROKERS.find((b) => b.id === id);

  if (!broker) {
    notFound();
  }

  const rank = brokerIndex >= 0 ? brokerIndex + 1 : 1;

  const BROKER_FAQS = brokerFaqs(broker);

  // Structured data for the agent entity itself. The directory layout used to
  // emit a generic WebPage node for /brokers on every profile, so none of these
  // pages ever described the actual agent — the thing a "property dealer in
  // Dholera" query is really asking for. Each profile now owns a
  // RealEstateAgent node whose @id matches the page URL, plus the listings it
  // publishes and a breadcrumb trail.
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'RealEstateAgent',
        '@id': `${DOMAIN}/brokers/${broker.id}#agent`,
        url: `${DOMAIN}/brokers/${broker.id}`,
        name: broker.agency,
        alternateName: broker.name,
        description: `${broker.description} ${broker.name} is a Gujarat RERA registered real estate agent (${broker.reraNumber}) operating in the Dholera Special Investment Region, covering ${broker.tpSchemes.join(', ')} with ${broker.experienceYears} years of experience.`,
        telephone: broker.phone,
        email: broker.email,
        image: broker.photoUrl || undefined,
        priceRange: '₹₹',
        areaServed: 'Dholera Special Investment Region, Gujarat, India',
        knowsAbout: [...broker.tpSchemes, ...broker.propertyTypes],
        address: {
          '@type': 'PostalAddress',
          streetAddress: broker.headOffice,
          addressLocality: 'Dholera SIR',
          addressRegion: 'Gujarat',
          addressCountry: 'IN',
        },
        parentOrganization: { '@id': `${DOMAIN}/#organization` },
        ...(broker.properties.length > 0
          ? {
              makesOffer: broker.properties.map((p) => ({
                '@type': 'Offer',
                '@id': `${DOMAIN}/brokers/${broker.id}#${p.id}`,
                name: p.title,
                description: `${p.title} in ${p.village}, ${p.tpScheme}. Zone ${p.zone}, fronting ${p.roadWidth}. Final Plot ${p.fp}, revenue survey ${p.survey}.`,
                price: p.totalDemand,
                priceCurrency: 'INR',
                url: `${DOMAIN}/map?sid=${p.sid}&fp=${p.fp}&survey=${p.survey}&village=${p.village}`,
                availability:
                  p.status === 'sold'
                    ? 'https://schema.org/SoldOut'
                    : p.status === 'under_token'
                    ? 'https://schema.org/LimitedAvailability'
                    : 'https://schema.org/InStock',
                itemOffered: {
                  '@type': 'RealEstateListing',
                  name: p.title,
                  category: 'Land / Plot',
                  additionalProperty: [
                    { '@type': 'PropertyValue', name: 'Final Plot number', value: p.fp },
                    { '@type': 'PropertyValue', name: 'Revenue survey number', value: p.survey },
                    { '@type': 'PropertyValue', name: 'Zone', value: p.zone },
                    { '@type': 'PropertyValue', name: 'Abutting road width', value: p.roadWidth },
                  ],
                },
              })),
            }
          : {}),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: SITE_NAME, item: DOMAIN },
          { '@type': 'ListItem', position: 2, name: 'Brokers', item: `${DOMAIN}/brokers` },
          {
            '@type': 'ListItem',
            position: 3,
            name: broker.agency,
            item: `${DOMAIN}/brokers/${broker.id}`,
          },
        ],
      },
      {
        '@type': 'FAQPage',
        '@id': `${DOMAIN}/brokers/${broker.id}#faq`,
        mainEntity: brokerFaqs(broker).map((f) => ({
          '@type': 'Question',
          name: f.q,
          acceptedAnswer: { '@type': 'Answer', text: f.a },
        })),
      },
    ],
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 pb-20 font-sans flex flex-col">
      <SiteHeader activePage="brokers" />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Breadcrumb & Navigation */}
      <div className="max-w-6xl mx-auto px-4 pt-6 pb-2 w-full">
        <Link
          href="/brokers"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-blue-600 transition group"
        >
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition" />
          <span>Back to Top Ranked Brokers Directory</span>
        </Link>
      </div>

      <main className="max-w-6xl mx-auto px-4 pt-2 pb-12 w-full space-y-6">
        {/* 1. Hero Broker Profile Showcase Card */}
        <section className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs relative overflow-hidden">
          {/* Top Rank Banner Ribbon */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-6 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                  rank === 1
                    ? 'bg-amber-100 text-amber-900 border border-amber-300'
                    : rank === 2
                    ? 'bg-blue-100 text-blue-900 border border-blue-300'
                    : 'bg-slate-100 text-slate-800 border border-slate-200'
                }`}
              >
                {rank === 1 && <Crown className="w-3.5 h-3.5 text-amber-600 shrink-0" />}
                {rank === 2 && <Award className="w-3.5 h-3.5 text-blue-600 shrink-0" />}
                {rank > 2 && <Sparkles className="w-3.5 h-3.5 text-slate-500 shrink-0" />}
                <span>
                  Rank #{rank} · {rank === 1 ? 'Top Ranked Sponsor' : rank <= 3 ? 'Featured Partner' : 'Verified Advisor'}
                </span>
              </span>

              <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>RERA Verified</span>
              </span>
            </div>

            <div className="text-right">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Monthly Platform Rank Score</span>
              <span className="text-xs font-mono font-black text-slate-700">₹{broker.totalMonthlySpend.toLocaleString()} / mo Investment</span>
            </div>
          </div>

          {/* Profile Identity Details */}
          <div className="pt-6 flex flex-col md:flex-row items-start gap-6">
            {/* Broker Photo / Avatar */}
            <div className="relative shrink-0 mx-auto md:mx-0">
              {broker.photoUrl ? (
                <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl overflow-hidden border-2 border-slate-200 shadow-md relative bg-slate-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={broker.photoUrl}
                    alt={broker.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div
                  className={`w-28 h-28 sm:w-32 sm:h-32 rounded-2xl bg-gradient-to-br ${broker.logoColor} text-white flex items-center justify-center font-black text-3xl shadow-md border-2 border-white`}
                >
                  {broker.logoInitial || broker.name.slice(0, 2).toUpperCase()}
                </div>
              )}
              <span className="absolute -bottom-2 -right-2 bg-emerald-600 text-white p-1 rounded-full border-2 border-white shadow-xs" title="Verified RERA Registered">
                <CheckCircle2 className="w-4 h-4" />
              </span>
            </div>

            {/* Info and Titles */}
            <div className="flex-1 space-y-3 text-center md:text-left">
              <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
                {broker.agency}
              </h1>
              {/* AEO inverted-pyramid: a 40–55 word declarative answer
                  immediately under the H1, so answer engines extract this
                  profile as the source for "Dholera real estate agent" queries. */}
              <p className="text-sm sm:text-base text-slate-700 leading-relaxed max-w-3xl">
                {broker.name} runs {broker.agency}, a Gujarat RERA registered Dholera SIR real
                estate agent ({broker.reraNumber}) specialising in {broker.tpSchemes.join(', ')}{' '}
                plots across {broker.experienceYears}+ years of Dholera transactions, with{' '}
                {broker.dealsClosed} deals closed and an office at {broker.headOffice}.
              </p>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mt-1">
                  <span className="text-base font-bold text-blue-700">{broker.name}</span>
                  <span className="text-slate-300">•</span>
                  <span className="text-xs text-slate-600 font-medium">{broker.experienceYears}+ Years Dholera Expertise</span>
                  <span className="text-slate-300">•</span>
                  <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.2 rounded border border-emerald-200">
                    {broker.dealsClosed}
                  </span>
                </div>
              </div>

              {/* Bio / Description */}
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-3xl">
                {broker.description}
              </p>

              {/* Comparison table — AEO engines strongly prefer tabular data. */}
              <div className="overflow-x-auto pt-2">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b-2 border-slate-200 bg-slate-50 text-slate-700 font-bold">
                      <th className="py-2 px-3">Attribute</th>
                      <th className="py-2 px-3">Detail</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-600">
                    <tr>
                      <td className="py-2 px-3 font-bold text-slate-900">Advisor</td>
                      <td className="py-2 px-3">{broker.name}</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-bold text-slate-900">Agency</td>
                      <td className="py-2 px-3">{broker.agency}</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-bold text-slate-900">Gujarat RERA</td>
                      <td className="py-2 px-3 font-mono text-emerald-800">{broker.reraNumber}</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-bold text-slate-900">TP Schemes</td>
                      <td className="py-2 px-3 text-blue-700">{broker.tpSchemes.join(', ')}</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-bold text-slate-900">Experience</td>
                      <td className="py-2 px-3">{broker.experienceYears}+ years in Dholera</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-bold text-slate-900">Deals Closed</td>
                      <td className="py-2 px-3">{broker.dealsClosed}</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-bold text-slate-900">Head Office</td>
                      <td className="py-2 px-3">{broker.headOffice}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Meta details: RERA and Head Office */}
              <div className="pt-2 flex flex-wrap items-center justify-center md:justify-start gap-y-2 gap-x-4 text-xs text-slate-600">
                <div className="flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="text-slate-400">RERA:</span>
                  <span className="font-mono font-bold text-slate-800">{broker.reraNumber}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="text-slate-700">{broker.headOffice}</span>
                </div>
              </div>

              {/* Specialization Chips */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-1.5 pt-1">
                {broker.tpSchemes.map((s) => (
                  <span key={s} className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-md">
                    {s}
                  </span>
                ))}
                {broker.propertyTypes.map((p) => (
                  <span key={p} className="text-[10px] font-medium text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md">
                    {p}
                  </span>
                ))}
              </div>
            </div>

            {/* Direct Contact Action Panel */}
            <div className="w-full md:w-60 bg-slate-50 border border-slate-200 p-4 rounded-2xl flex flex-col gap-2 shrink-0">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide text-center">Direct Advisory Contact</span>
              <a
                href={`tel:${broker.phone}`}
                className="w-full h-10 rounded-xl bg-slate-900 hover:bg-black text-white font-bold text-xs flex items-center justify-center gap-2 transition active:scale-[0.98] shadow-xs cursor-pointer"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call {broker.phone}</span>
              </a>

              <a
                href={`https://wa.me/${broker.whatsapp}?text=${encodeURIComponent(
                  `Hello ${broker.name}, I am viewing your verified profile on DholeraMap.com. I would like to inquire about your available properties in Dholera SIR.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full h-10 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition active:scale-[0.98] shadow-xs cursor-pointer"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>Chat on WhatsApp</span>
              </a>

              {broker.email && (
                <a
                  href={`mailto:${broker.email}`}
                  className="w-full h-9 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-semibold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>Send Email</span>
                </a>
              )}
            </div>
          </div>
        </section>

        {/* 2. Listed Properties For Sale Portfolio */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Selling Properties Portfolio
                </h2>
                <span className="text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
                  {broker.properties?.length || 0} Listed
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Statutory parcels listed for sale by {broker.agency}. Direct coordinates cross-referenced from DholeraMap.com.
              </p>
            </div>

            <Link
              href="/map"
              className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 self-start sm:self-auto"
            >
              <span>Explore Master GIS Map</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>

          {broker.properties && broker.properties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {broker.properties.map((prop) => (
                <div
                  key={prop.id}
                  className="bg-white rounded-2xl border border-slate-200 hover:border-blue-300 p-5 shadow-xs hover:shadow-md transition flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    {/* Header: Title and Status */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-md inline-block mb-1.5">
                          {prop.tpScheme}
                        </span>
                        <h3 className="text-base font-bold text-slate-900 leading-snug">
                          {prop.title}
                        </h3>
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full shrink-0">
                        {prop.status === 'available' ? 'Available' : 'Under Token'}
                      </span>
                    </div>

                    {/* Property Specifications Grid */}
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Final Plot (FP)</span>
                        <span className="font-black text-slate-900 text-sm">FP-{prop.fp}</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Revenue Survey</span>
                        <span className="font-bold text-slate-800">Survey {prop.survey}</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Village / Moje</span>
                        <span className="font-semibold text-slate-800">{prop.village}</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Asking Rate</span>
                        <span className="font-black text-amber-700 text-sm">{prop.pricePerSqYd}</span>
                      </div>
                    </div>

                    {/* Frontage & Zone */}
                    <div className="space-y-1 text-xs text-slate-600">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Road Corridor:</span>
                        <span className="font-bold text-slate-800 text-right truncate max-w-[190px]">{prop.roadWidth}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Statutory Zone:</span>
                        <span className="font-bold text-blue-700 text-right truncate max-w-[190px]">{prop.zone}</span>
                      </div>
                    </div>

                    {/* Highlights */}
                    {prop.highlights && prop.highlights.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {prop.highlights.map((h) => (
                          <span key={h} className="text-[10px] font-medium text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded">
                            ✓ {h}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Actions: View on Map, Download PDF, Share */}
                  <div className="mt-5 pt-3 border-t border-slate-100 grid grid-cols-3 gap-2">
                    <Link
                      href={`/map?sid=${prop.sid}&fp=${prop.fp}&survey=${prop.survey}&village=${prop.village}`}
                      className="h-9 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1 transition"
                      title="Inspect parcel on DholeraMap"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>Map</span>
                    </Link>

                    <Link
                      href={`/map?sid=${prop.sid}&fp=${prop.fp}&survey=${prop.survey}&village=${prop.village}`}
                      className="h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-1 transition"
                      title="Download PDF Property Dossier"
                    >
                      <FileText className="w-3 h-3 text-blue-600" />
                      <span>Brochure</span>
                    </Link>

                    <a
                      href={`https://wa.me/?text=${encodeURIComponent(
                        `Check out this verified plot in Dholera SIR listed by ${broker.agency}: ${prop.title} (${prop.village}, Survey ${prop.survey}, FP-${prop.fp}) · ${prop.roadWidth} · ${prop.zone}. View on DholeraMap: https://dholeramap.com/map?sid=${prop.sid}&fp=${prop.fp}`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="h-9 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 font-bold text-xs flex items-center justify-center gap-1 transition cursor-pointer"
                      title="Share this property with others on WhatsApp"
                    >
                      <Share2 className="w-3 h-3 text-emerald-600" />
                      <span>Share</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center text-slate-500">
              <Building className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-800">No properties currently listed in public showcase</p>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Contact {broker.name} directly via WhatsApp or phone to request off-market property inventory and title-checked plots.
              </p>
            </div>
          )}
        </section>

        {/* 3. Direct Advisory Message Form */}
        <section className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">
          <div className="max-w-2xl">
            <h3 className="text-lg font-black text-slate-900 tracking-tight">
              Inquire Directly with {broker.name}
            </h3>
            <p className="text-xs text-slate-600 mt-1">
              Send a direct land inquiry or schedule a physical site visit in Dholera SIR.
            </p>
            <BrokerInquiryForm brokerName={broker.name} brokerWhatsapp={broker.whatsapp} />
          </div>
        </section>

        {/* 4. FAQ rendered from the same array that feeds the FAQPage schema,
            so visible copy and structured data can never drift apart. */}
        <section className="max-w-6xl mx-auto w-full">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mb-4">
              About {broker.agency}
            </h2>
            <div className="space-y-4 divide-y divide-slate-100">
              {BROKER_FAQS.map((f) => (
                <div key={f.q} className="pt-4 first:pt-0">
                  <h3 className="text-sm font-bold text-slate-900">{f.q}</h3>
                  <p className="text-xs sm:text-sm text-slate-600 mt-1.5 leading-relaxed">{f.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
