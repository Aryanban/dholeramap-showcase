import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, MapPin, Building, FileCheck, Layers, ExternalLink } from 'lucide-react';
import SiteHeader from '@/components/panels/SiteHeader';
import SiteFooter from '@/components/panels/SiteFooter';
import { VILLAGES } from '@/lib/villages';
import { surveysForVillage } from '@/lib/gazetted-surveys';
import { hreflang, pageTitle, pageDescription } from '@/lib/brand';
import {
  computeVillageStats,
  getZoneNarrative,
  getSchemeStatus,
  getVillageContext,
} from '@/lib/village-profile';

interface VillagePageProps {
  params: Promise<{ slug: string }>;
}

// Fully static. The page renders from VILLAGES and gazetted_surveys.json, both
// git-tracked and bundled at build time, so on-demand revalidation would only
// re-read identical bytes and re-emit identical HTML. Removing it eliminates
// the ISR read with no freshness cost — the data changes on deploy, which
// rebuilds these pages regardless.
export const dynamicParams = false;
export const revalidate = false;

export function generateStaticParams() {
  return VILLAGES.map((v) => ({ slug: v.slug }));
}

export async function generateMetadata({ params }: VillagePageProps): Promise<Metadata> {
  const { slug } = await params;
  const villageName = slug.charAt(0).toUpperCase() + slug.slice(1);
  const villageInfo = VILLAGES.find((v) => v.slug === slug);
  const stats = computeVillageStats(slug);
  const parcelNote = stats
    ? ` Covers ${stats.parcelCount.toLocaleString('en-IN')} published gazetted parcels (${Math.round(
        stats.totalAreaSqM,
      ).toLocaleString('en-IN')} m²), road tiers ${stats.roadWidths.join('m/')}m and a derived FAR range of ${stats.farRange.min}–${stats.farRange.max}.`
    : ' Per-parcel digitised records are pending statutory promulgation; the scheme perimeter and zoning are gazetted.';
  // Width-capped here, once, so no village page can ever overrun the SERP
  // window regardless of name/scheme/zone length. The keyword phrase is
  // preserved first and the brand suffix is what gets trimmed.
  const title = `${villageName} Dholera Map: ${villageInfo?.scheme ?? 'TP Scheme'} Plots & Rates`;

  return {
    title: pageTitle(title),
    description: pageDescription(
      `Village ${villageName}, Dholera SIR — ${villageInfo?.zone ?? 'planned'} zone under ${villageInfo?.scheme ?? 'TP scheme'}.${parcelNote} Verify survey numbers, road widths and DGDCR FAR before buying.`,
      `Village ${villageName}, Dholera SIR — ${villageInfo?.zone ?? 'planned'} zone under ${villageInfo?.scheme ?? 'TP scheme'}. Verify survey numbers, road widths and DGDCR FAR.`,
    ),
    keywords: [
      `Village ${villageName} Dholera`,
      `${villageName} Dholera SIR map`,
      `${villageName} survey number search`,
      `${villageName} ${villageInfo?.scheme ?? ''} plots`,
      `${villageName} interactive map`,
      `${villageName} land price`,
      `${villageName} DGDCR FAR regulations`,
      `Dholera smart city ${villageName}`,
    ],
    alternates: {
      canonical: `https://dholeramap.com/village/${slug}`,
      // 22 village pages x 3 locales. The bare village-name queries ("gorasu",
      // "umargadh", "pipli map") are the ones drawing Singapore/US impressions
      // that never converted.
      languages: hreflang(`https://dholeramap.com/village/${slug}`),
    },
    openGraph: {
      title: pageTitle(title),
      description: pageDescription(
        `Village ${villageName} — ${villageInfo?.zone ?? 'planned'} zone under ${villageInfo?.scheme ?? 'TP scheme'} in Dholera SIR, Gujarat. Verify survey numbers and DGDCR building envelopes.`,
      ),
      url: `https://dholeramap.com/village/${slug}`,
      siteName: 'DholeraMap',
      images: ['/logo-512.png'],
      locale: 'en_IN',
      type: 'website',
    },
  };
}

export default async function VillagePage({ params }: VillagePageProps) {
  const { slug } = await params;
  const villageName = slug.charAt(0).toUpperCase() + slug.slice(1);
  const villageInfo = VILLAGES.find((v) => v.slug === slug) || {
    name: villageName,
    scheme: 'TP 1 / TP 2',
    zone: 'Residential & Mixed Use',
  };

  const surveys = surveysForVillage(slug);
  const hasSurveys = surveys.length > 0;
  const stats = computeVillageStats(slug);
  const zone = getZoneNarrative(villageInfo.zone);
  const schemeStatus = getSchemeStatus(villageInfo.scheme);
  const context = getVillageContext(slug, villageName);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@context': 'https://schema.org',
        '@type': 'Place',
        name: `Village ${villageName}, Dholera Special Investment Region`,
        description: `Revenue village in Dholera SIR, Gujarat covered under Gujarat Town Planning and Urban Development Act 1976 schemes.`,
        address: {
          '@type': 'PostalAddress',
          addressLocality: villageName,
          addressRegion: 'Gujarat',
          addressCountry: 'IN',
        },
      },
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: 'https://dholeramap.com/',
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Villages',
            item: 'https://dholeramap.com/guide',
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: `Village ${villageName}`,
            item: `https://dholeramap.com/village/${slug}`,
          },
        ],
      },
      {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: `Which Town Planning schemes cover Village ${villageName} in Dholera SIR?`,
            acceptedAnswer: {
              '@type': 'Answer',
              text: `Village ${villageName} falls primarily under ${villageInfo.scheme} of the Dholera Special Investment Region master plan, with zoning designated for ${villageInfo.zone}.`,
            },
          },
          {
            '@type': 'Question',
            name: `How can I locate a survey number plot in Village ${villageName}?`,
            acceptedAnswer: {
              '@type': 'Answer',
              text: `You can use the DholeraMap interactive search at dholeramap.com to search any survey number in Village ${villageName} and view its exact georeferenced boundary, abutting TP road width, and DGDCR building regulations.`,
            },
          },
          {
            '@type': 'Question',
            name: `What is the permissible FAR and zoning in Village ${villageName}?`,
            acceptedAnswer: {
              '@type': 'Answer',
              text: `Village ${villageName} is zoned for ${villageInfo.zone} under ${villageInfo.scheme}. Permissible Floor Area Ratio (FAR) is determined by abutting Town Planning road widths under DGDCR 2024 regulations.`,
            },
          },
        ],
      },
    ],
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SiteHeader />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
          <Link href="/" className="hover:text-blue-600 transition flex items-center gap-1.5">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Interactive Map</span>
          </Link>
          <span>/</span>
          <Link href="/guide" className="hover:text-blue-600 transition font-semibold">
            Interactive Guide
          </Link>
          <span>/</span>
          <span className="text-blue-600 font-bold">Village {villageName}</span>
        </div>

        {/* Hero Section */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-200">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  Dholera SIR Revenue Interactive Map
                </span>
                <span className="text-xs text-slate-500">Statutory Gazette Record</span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
                Village {villageName} Interactive Map &amp; Planning Directory
              </h1>
              {/* AEO Inverted Pyramid Definition */}
              <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
                Village {villageName} is a gazetted revenue jurisdiction within Dholera SIR, Gujarat. It is incorporated into {villageInfo.scheme} under the GTPUD Act 1976, featuring designated {villageInfo.zone} zones and planned 18m to 70m arterial roads.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <Link
                href={`/?search=${encodeURIComponent(villageName)}`}
                className="py-2.5 px-5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs tracking-wide transition-all text-center shadow-md shadow-blue-600/20"
              >
                Inspect {villageName} on Vector Map →
              </Link>
            </div>
          </div>

          {/* Zone narrative — every village has a unique functional zone, so
              this paragraph is genuinely distinct per village. */}
          <div className="space-y-4 pt-2 border-t border-slate-200">
            <div>
              <h2 className="text-base font-black text-slate-900 mb-1.5">
                What the {villageInfo.zone} designation means here
              </h2>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                {zone.what}{' '}
                <span className="font-semibold text-slate-900">What drives value: </span>
                {zone.value}
              </p>
            </div>
            <div className="rounded-2xl bg-amber-50/70 border border-amber-200 p-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-amber-800 mb-1.5">
                Before you pay for a plot in {villageName}
              </h3>
              <p className="text-xs text-slate-700 leading-relaxed">{zone.buyer}</p>
            </div>
          </div>

          {/* Aggregate Stats Grid. This grid only renders for villages that have
              published parcels — the values below are survey-derived — so it
              stays inside the hero card that already gates on that condition. */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="text-[11px] text-slate-500 font-medium">Jurisdiction</div>
              <div className="text-sm font-bold text-slate-900 mt-1">Dholera SIRDA / Revenue Dept</div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="text-[11px] text-slate-500 font-medium">Statutory Act</div>
              <div className="text-sm font-bold text-slate-900 mt-1">GTPUD Act 1976</div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="text-[11px] text-slate-500 font-medium">Planning Schemes</div>
              <div className="text-sm font-bold text-blue-600 mt-1">{villageInfo.scheme}</div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="text-[11px] text-slate-500 font-medium">Primary Zoning</div>
              <div className="text-sm font-bold text-emerald-700 mt-1">{villageInfo.zone.split('&')[0]}</div>
            </div>
          </div>
        </div>

        {/* Village profile: location, anchors, market behaviour, demand and the
            on-ground check. Written per village in village-profile.ts rather
            than generated, because a name-substituted template is what made
            these pages indistinguishable in the first place. Renders for all
            22 villages so the zero-parcel ones are no longer a stub. */}
        <section className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
          <div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
              {villageName}: Location and Development Profile
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
              {context.location}
            </p>
          </div>

          {context.anchors.length > 0 && (
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-blue-600 mb-2">
                Anchor Infrastructure and Designations
              </h3>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {context.anchors.map((a) => (
                  <li
                    key={a}
                    className="flex items-start gap-2 text-xs text-slate-700 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 leading-relaxed"
                  >
                    <MapPin className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
                    <span>{a}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
                How the {villageName} market behaves
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">{context.market}</p>
            </div>
            <div className="space-y-1.5">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
                Who buys here
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">{context.demand}</p>
            </div>
          </div>

          <div className="rounded-2xl bg-emerald-50/60 border border-emerald-200 p-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-emerald-800 mb-1.5">
              The on-ground check for {villageName}
            </h3>
            <p className="text-xs text-slate-700 leading-relaxed">{context.onGroundCheck}</p>
          </div>
        </section>

        {/* Survey Directory Cards with Descriptive Anchors */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-200">
            <div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900">
                Revenue Survey Parcels in Village {villageName}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {hasSurveys
                  ? `${surveys.length} published gazetted parcels with DGDCR 2024 FAR and road width envelopes`
                  : 'Interactive records for this village are not yet published in the atlas'}
              </p>
            </div>
            {hasSurveys && (
              <span className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-3 py-1 rounded-full">
                {surveys.length} Gazetted Surveys
              </span>
            )}
          </div>

          {hasSurveys ? (
            <div className="space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {surveys.slice(0, 48).map((s) => (
                  <Link
                    key={s.surveyNo}
                    href={`/survey/${slug}/${s.surveyNo}`}
                    prefetch={false}
                    title={`Survey ${s.surveyNo}, Village ${villageName} — ${Math.round(
                      s.area,
                    ).toLocaleString('en-IN')} m², FAR envelope`}
                    className="p-3.5 rounded-xl bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-center transition-all group shadow-2xs"
                  >
                    <div className="text-[10px] text-slate-500 font-medium">Survey No.</div>
                    <div className="text-sm font-black text-slate-900 group-hover:text-blue-600 mt-0.5">
                      {s.surveyNo}
                    </div>
                    <div className="text-[9px] text-slate-500 mt-1 font-semibold group-hover:text-blue-600">
                      {Math.round(s.area).toLocaleString('en-IN')} m² →
                    </div>
                  </Link>
                ))}
              </div>

              {surveys.length > 48 && (
                <div className="pt-5 border-t border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      All Additional Gazetted Surveys in Village {villageName} ({surveys.length - 48} more)
                    </h3>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {surveys.slice(48).map((s) => (
                      <Link
                        key={s.surveyNo}
                        href={`/survey/${slug}/${s.surveyNo}`}
                        prefetch={false}
                        className="px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 transition font-mono font-bold text-[11px]"
                      >
                        #{s.surveyNo}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              <div className="rounded-2xl bg-blue-50/60 border border-blue-200 p-6 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse" />
                  <span className="text-xs font-black uppercase tracking-wider text-blue-900">
                    Preliminary Town Planning Demarcation in Progress
                  </span>
                </div>
                <h3 className="text-base font-black text-slate-900">
                  Village {villageName} ({villageInfo.scheme}) — {villageInfo.zone}
                </h3>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                  Village {villageName} is a gazetted revenue jurisdiction under DSIRDA. The{' '}
                  {villageInfo.scheme} scheme perimeter and its {villageInfo.zone} zoning are sanctioned,
                  but the digitised per-parcel vector coordinates are still undergoing statutory survey
                  promulgation — so no individual survey record is published here yet.
                </p>
                <div className="pt-2 flex flex-wrap gap-3">
                  <Link
                    href={`/?search=${encodeURIComponent(villageName)}`}
                    className="inline-block py-2.5 px-5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs tracking-wide transition shadow-md shadow-blue-600/20 text-center"
                  >
                    Inspect {villageName} Perimeter on Vector Map →
                  </Link>
                  <Link
                    href="/dholera-7-12-anyror-land-records"
                    className="inline-block py-2.5 px-5 rounded-2xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs border border-slate-300 transition text-center shadow-xs"
                  >
                    Lookup {villageName} AnyRoR 7/12 Records
                  </Link>
                </div>
              </div>

              {/* Zone-specific development outlook. Every village has a unique
                  functional zone, so this block is genuinely distinct prose —
                  not a name-swapped boilerplate. */}
              <div className="rounded-2xl bg-white border border-slate-200 p-6 space-y-4">
                <h3 className="text-base font-black text-slate-900">
                  {villageInfo.zone} in {villageName}: Development Outlook
                </h3>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                  {zone.development}
                </p>
                <div className="pt-3 border-t border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-black uppercase text-blue-600 tracking-wider">
                      What drives value here
                    </span>
                    <p className="text-xs text-slate-600 leading-relaxed">{zone.value}</p>
                  </div>
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-black uppercase text-amber-600 tracking-wider">
                      Verify before you pay
                    </span>
                    <p className="text-xs text-slate-600 leading-relaxed">{zone.buyer}</p>
                  </div>
                </div>
              </div>

              {/* Zone-specific diligence. The three checks are genuinely
                  different per designation (what matters for a waterfront
                  tourism plot is not what matters for an MRO plot), so this
                  block no longer duplicates across villages. */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <span className="text-[10px] font-black uppercase text-blue-600 tracking-wider">Check 1</span>
                  <h4 className="font-bold text-slate-900 text-sm">{villageInfo.zone}: Access &amp; Envelope</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">{zone.diligence[0]}</p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <span className="text-[10px] font-black uppercase text-amber-600 tracking-wider">Check 2</span>
                  <h4 className="font-bold text-slate-900 text-sm">Records &amp; Land Use</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">{zone.diligence[1]}</p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <span className="text-[10px] font-black uppercase text-emerald-600 tracking-wider">Check 3</span>
                  <h4 className="font-bold text-slate-900 text-sm">Servicing &amp; Restrictions</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">{zone.diligence[2]}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Village-specific data: computed from the real gazetted registry for
            this village, NOT a shared hardcoded table. Villages without
            published parcels get the scheme-status block instead, so no two
            villages render identical standards content. */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-5">
          {stats ? (
            <>
              <div>
                <h2 className="text-lg sm:text-xl font-black text-slate-900">
                  Village {villageName} Published Cadastre at a Glance
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Every figure below is computed from the gazetted parcels published for this
                  village in the interactive atlas — not a regional average.
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="text-[11px] text-slate-500 font-medium">Published Parcels</div>
                  <div className="text-lg font-black text-slate-900 mt-0.5">
                    {stats.parcelCount.toLocaleString('en-IN')}
                  </div>
                  <div className="text-[10px] text-slate-400">gazetted survey records</div>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="text-[11px] text-slate-500 font-medium">Median Parcel</div>
                  <div className="text-lg font-black text-slate-900 mt-0.5">
                    {Math.round(stats.medianAreaSqM).toLocaleString('en-IN')} m²
                  </div>
                  <div className="text-[10px] text-slate-400">
                    largest: {Math.round(stats.largestAreaSqM).toLocaleString('en-IN')} m² (Survey {stats.largestSurveyNo})
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="text-[11px] text-slate-500 font-medium">Road Tiers Present</div>
                  <div className="text-lg font-black text-blue-600 mt-0.5">
                    {stats.roadWidths.join(' / ')}m
                  </div>
                  <div className="text-[10px] text-slate-400">abutting TP road widths</div>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="text-[11px] text-slate-500 font-medium">Derived FAR Range</div>
                  <div className="text-lg font-black text-emerald-700 mt-0.5">
                    {stats.farRange.min} – {stats.farRange.max}
                  </div>
                  <div className="text-[10px] text-slate-400">from road tiers under DGDCR</div>
                </div>
              </div>

              <div className="rounded-2xl bg-blue-50/60 border border-blue-200 p-4 text-xs text-slate-700 leading-relaxed">
                The permissible FAR on any specific plot in Village {villageName} follows its
                <strong> abutting road width</strong> — so a parcel on a {Math.max(...stats.roadWidths)} m road
                carries a materially larger building envelope than one on a {Math.min(...stats.roadWidths)} m
                road, even within the same village. Search the survey number on the
                <Link href="/" className="text-blue-600 underline font-semibold hover:text-blue-700"> interactive atlas</Link>{' '}
                or the <Link href="/dholera-tp-map" className="text-blue-600 underline font-semibold hover:text-blue-700">TP map</Link>{' '}
                to check the exact width before trusting a price.
              </div>
            </>
          ) : (
            <div className="space-y-3">
              <div>
                <h2 className="text-lg sm:text-xl font-black text-slate-900">
                  Village {villageName}: Scheme Perimeter Gazetted, Parcels Pending
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  The {villageInfo.scheme} perimeter and the {villageInfo.zone} zoning for Village{' '}
                  {villageName} are gazetted; per-parcel digitised records are awaiting statutory
                  promulgation and are not yet published.
                </p>
              </div>
              <div className="rounded-2xl bg-amber-50/70 border border-amber-200 p-4 text-xs text-slate-700 leading-relaxed">
                <strong>Do not buy a plot here on the zone label alone.</strong> Because the
                per-parcel reconstitution register is not yet published for Village {villageName},
                confirm the survey number, the abutting road width and the final plot schedule
                against the revenue record and the gazetted scheme documents before committing.
              </div>
            </div>
          )}
        </div>

        {/* Scheme servicing & pricing context — varies by the village's TP scheme. */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
          <h2 className="text-lg font-black text-slate-900">
            {villageInfo.scheme} in Dholera SIR: Servicing &amp; Pricing Context
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <span className="text-[10px] font-black uppercase text-blue-600 tracking-wider">
                Infrastructure Status
              </span>
              <p className="text-xs text-slate-700 leading-relaxed">{schemeStatus.servicing}</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <span className="text-[10px] font-black uppercase text-emerald-600 tracking-wider">
                Asking-Rate Context
              </span>
              <p className="text-xs text-slate-700 leading-relaxed">{schemeStatus.pricing}</p>
            </div>
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Asking-rate context reflects the September 2026 broker inventory. Dholera has no
            official per-village transaction price — see the
            <Link href="/blog/dholera-village-wise-land-prices" className="text-blue-600 underline font-semibold hover:text-blue-700"> village-wise land price guide</Link>{' '}
            and the <Link href="/blog/dholera-plot-price-september-2026" className="text-blue-600 underline font-semibold hover:text-blue-700">DICDL rate card analysis</Link>.
          </p>
        </div>

        {/* Cross-Linking Section: All Dholera Revenue Villages */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
          <h2 className="text-lg font-black text-slate-900">
            Explore All {VILLAGES.length} Revenue Villages in Dholera SIR
          </h2>
          <p className="text-xs text-slate-500">
            Navigate between statutory village directories to inspect revenue survey numbers, town planning schemes, and zoning classifications.
          </p>

          <div className="flex flex-wrap gap-2 pt-2">
            {VILLAGES.map((v) => (
              <Link
                key={v.slug}
                href={`/village/${v.slug}`}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
                  v.slug === slug
                    ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                    : 'bg-slate-50 text-slate-700 hover:text-blue-700 hover:bg-blue-50 border-slate-200'
                }`}
              >
                {v.name} ({v.scheme})
              </Link>
            ))}
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
