import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { MapPin, Building2, ExternalLink, Navigation, Ruler, Layers, TrendingUp } from 'lucide-react';
import SiteHeader from '@/components/panels/SiteHeader';
import SiteFooter from '@/components/panels/SiteFooter';
import { surveysForVillage, isRealSurvey } from '@/lib/gazetted-surveys';
import { lookupSurvey, compareParcelInVillage, isIndexableSurvey } from '@/lib/survey-lookup';
import { getSchemeDGDCR } from '@/lib/dgdcr';

interface SurveyPageProps {
  params: Promise<{ village: string; surveyNo: string }>;
}

// Fully static. Every byte these pages render comes from git-tracked,
// build-time data (public/data/gazetted_surveys.json + search_index.json), so
// an on-demand revalidation could only ever re-read the same bytes and emit
// the same HTML. Serving them statically removes that ISR read entirely with
// no loss of freshness — the data changes on deploy, which regenerates the
// pages anyway. Params outside generateStaticParams hit the static not-found
// page, matching the previous notFound() path for unknown surveys.
export const dynamicParams = false;
export const revalidate = false;

export function generateStaticParams() {
  const { allSurveyPairs } = require('@/lib/gazetted-surveys') as typeof import('@/lib/gazetted-surveys');
  return allSurveyPairs().map((p) => ({ village: p.village, surveyNo: p.surveyNo }));
}

export async function generateMetadata({ params }: SurveyPageProps): Promise<Metadata> {
  const { village, surveyNo } = await params;
  const villageName = village.charAt(0).toUpperCase() + village.slice(1);

  // A URL not in the registry now returns a real 404 from the page body, so
  // this branch only shapes the <head> of that 404 document. No canonical is
  // emitted: a self-referencing canonical on a 404 is meaningless and can
  // invite the dead URL back into the index. `noindex` is kept as belt-and-
  // braces in case a crawler ever renders the 200 response.
  if (!isRealSurvey(village, surveyNo)) {
    return {
      title: `Survey ${surveyNo}, ${villageName} | DholeraMap`,
      description: `Survey No. ${surveyNo} in Village ${villageName} is not present in the live Dholera SIR interactive dataset. Search the interactive map for parcels that are.`,
      robots: { index: false, follow: true },
    };
  }

  const rec = lookupSurvey(village, surveyNo);
  const roadWidthM = rec.roadWidthM;
  const maxFAR = rec.maxFAR;
  const areaSqM = rec.allottedAreaSqM;
  const areaSqYd = areaSqM ? Math.round(areaSqM * 1.196) : undefined;
  const schemeLabel = rec.schemeId.replace('dholera_tp', 'TP ');

  return {
    title: `Survey ${surveyNo}, ${villageName} Dholera Map & Plot Record | DholeraMap`,
    description: `Survey No. ${surveyNo}, Village ${villageName}, Dholera SIR: ${areaSqM ? `${areaSqM.toLocaleString()} m² (~${areaSqYd!.toLocaleString()} sq.yd) net Final Plot, ` : ''}${roadWidthM}m TP road, FAR ${maxFAR} under DGDCR 2024 (${schemeLabel}).`,
    // Quality gate (docs/IMPLEMENTATION_PLAN.md §8). Parcels missing a core
    // information signal emit `noindex, follow` so crawl equity concentrates on
    // the records that can actually rank. `follow` is kept: weak pages stay
    // crawlable and keep passing link equity, they just stop competing for
    // impressions. See isIndexableSurvey() in src/lib/survey-lookup.ts.
    robots: { index: isIndexableSurvey(village, surveyNo), follow: true },
    keywords: [
      `Survey ${surveyNo} ${villageName} Dholera`,
      `Dholera survey number ${surveyNo}`,
      `Village ${villageName} survey ${surveyNo} map`,
      `Dholera FAR road width survey ${surveyNo}`,
      `Final plot FP ${rec.finalPlot || surveyNo} Dholera SIR`,
      `Gujarat land records 7 12 ${villageName}`,
    ],
    alternates: {
      canonical: `https://dholeramap.com/survey/${village}/${surveyNo}`,
    },
    openGraph: {
      title: `Survey ${surveyNo}, ${villageName} Land Record | DholeraMap`,
      description: `Interactive parcel Survey ${surveyNo} in Village ${villageName}, Dholera SIR${areaSqM ? `: ${areaSqM.toLocaleString()} m² net area` : ''}, abutting a ${roadWidthM}m Town Planning road.`,
      url: `https://dholeramap.com/survey/${village}/${surveyNo}`,
      siteName: 'DholeraMap',
      images: ['/og-image.png'],
      locale: 'en_IN',
      type: 'website',
    },
  };
}

function fmt(n?: number): string {
  if (n === undefined || n === null || !Number.isFinite(n)) return '—';
  return n.toLocaleString('en-IN');
}

// 1st / 2nd / 3rd / 4th… used by the village-relative ranking copy.
function ordinalSuffix(n: number): string {
  const v = Math.abs(n) % 100;
  if (v >= 11 && v <= 13) return 'th';
  switch (v % 10) {
    case 1:
      return 'st';
    case 2:
      return 'nd';
    case 3:
      return 'rd';
    default:
      return 'th';
  }
}

export default async function SurveyPage({ params }: SurveyPageProps) {
  const { village, surveyNo } = await params;
  const villageName = village.charAt(0).toUpperCase() + village.slice(1);

  // Non-existent parcel: return a REAL 404.
  //
  // This used to render a "not in the live dataset" page with HTTP 200 and
  // `noindex, follow` — a soft-404. GSC had already served four such URLs with
  // impressions, and the homepage linked to five more, so Google was spending
  // crawl budget on parcels that do not exist. Because the URL space is
  // unbounded (22 villages x any survey number), 200+noindex was unbounded
  // waste. The recovery UI now lives in ./not-found.tsx and routes the visitor
  // to the village page, which is the canonical home for that information.
  if (!isRealSurvey(village, surveyNo)) {
    notFound();
  }

  const rec = lookupSurvey(village, surveyNo);
  const areaSqM = rec.allottedAreaSqM;
  const areaSqYd = areaSqM ? Math.round(areaSqM * 1.196) : undefined;
  const roadWidthM = rec.roadWidthM;
  const maxFAR = rec.maxFAR;
  const maxHeightM = rec.maxHeightM;
  const groundCoveragePct = rec.groundCoveragePct;
  const schemeLabel = rec.schemeId.replace('dholera_tp', 'TP ') || 'TP scheme';
  const builtUp = areaSqM ? Math.round(areaSqM * maxFAR) : undefined;

  // Real neighbouring surveys in the same village for internal linking.
  const neighbours = surveysForVillage(village)
    .filter((s) => s.surveyNo !== surveyNo)
    .slice(0, 6);

  // Village-relative rankings. Every parcel in a (scheme, roadWidth) cluster
  // otherwise renders an identical DGDCR table and FAQ; these rankings are what
  // make each page's answer text genuinely distinct (see the Coverage drilldown
  // "Crawled - currently not indexed" clusters).
  const comparison = compareParcelInVillage(village, surveyNo, areaSqM);
  const isLargestDecile = comparison && comparison.areaPercentile !== undefined && comparison.areaPercentile >= 90;
  const isSmallestDecile = comparison && comparison.areaPercentile !== undefined && comparison.areaPercentile <= 10;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Place',
        name: `Survey No. ${surveyNo}, Village ${villageName}`,
        description: `Interactive land parcel in Village ${villageName}, Dholera Special Investment Region, Gujarat.${areaSqM ? ` Net allotted area ${fmt(areaSqM)} m²,` : ''} Abutting a ${roadWidthM}m Town Planning road.`,
        address: {
          '@type': 'PostalAddress',
          addressLocality: villageName,
          addressRegion: 'Gujarat',
          addressCountry: 'IN',
        },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://dholeramap.com/' },
          {
            '@type': 'ListItem',
            position: 2,
            name: `Village ${villageName}`,
            item: `https://dholeramap.com/village/${village}`,
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: `Survey ${surveyNo}`,
            item: `https://dholeramap.com/survey/${village}/${surveyNo}`,
          },
        ],
      },
      {
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: `What is the permissible FAR for Survey No. ${surveyNo} in Village ${villageName}?`,
            acceptedAnswer: {
              '@type': 'Answer',
              text: `Survey No. ${surveyNo} abuts a ${roadWidthM}-metre Town Planning road under ${schemeLabel}, permitting a maximum FAR of ${maxFAR} (${rec.statutoryTable}).${rec.isEstimated ? ' The envelope is indicative because the underlying road width is an estimate.' : ''}`,
            },
          },
          {
            '@type': 'Question',
            name: `What is the net allotted area of Survey No. ${surveyNo}?`,
            acceptedAnswer: {
              '@type': 'Answer',
              text: areaSqM
                ? rec.areaDerived
                  ? `The digitised final-plot geometry for Survey No. ${surveyNo} encloses approximately ${fmt(areaSqM)} m² (${fmt(areaSqYd)} square yards) net; the statutory net allotted area is set by the scheme's reconstitution register. Final Plot reference: ${rec.finalPlot || 'pending'}.`
                  : `The net reconstituted Final Plot area after the statutory ~50% TP deduction is ${fmt(areaSqM)} m² (approximately ${fmt(areaSqYd)} square yards). Final Plot reference: ${rec.finalPlot || 'pending'}.`
                : `The scheme plan sheet is printed "not to scale" and carries no scale bar or georeference, so the net allotted area cannot be derived from the drawing; it must be confirmed from the scheme's reconstitution register or added by the listing broker. Final Plot reference: ${rec.finalPlot || 'pending'}.`,
            },
          },
          ...(comparison
            ? [
                {
                  '@type': 'Question',
                  name: `How does Survey No. ${surveyNo} compare with other plots in Village ${villageName}?`,
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text:
                      `Of the ${comparison.villageParcels} published parcels in Village ${villageName}, ` +
                      (comparison.areaRank
                        ? `Survey No. ${surveyNo} ranks ${comparison.areaRank}${ordinalSuffix(comparison.areaRank)} by net area${
                            comparison.areaPercentile !== undefined
                              ? ` — ${comparison.areaPercentile >= 90 ? 'among the largest 10%' : comparison.areaPercentile <= 10 ? 'among the smallest 10%' : `larger than ${comparison.areaPercentile}% of village parcels`}`
                              : ''
                          }${
                            comparison.areaVsMedian
                              ? `, roughly ${comparison.areaVsMedian}× the Village ${villageName} median of about ${fmt(comparison.villageMedianArea)} m²`
                              : ''
                          }. `
                        : '') +
                      `Its ${roadWidthM}m abutting road is the ${comparison.roadTierRank}${ordinalSuffix(comparison.roadTierRank)} widest of the ${comparison.roadTiersInVillage} road tiers published in the village, shared by ${comparison.roadTierCount} parcel${comparison.roadTierCount === 1 ? '' : 's'}.`,
                  },
                },
              ]
            : []),
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

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs font-semibold text-slate-400">
          <Link href="/" className="hover:text-blue-600 transition">
            Interactive Map
          </Link>
          <span>/</span>
          <Link href={`/village/${village}`} className="hover:text-blue-600 transition">
            Village {villageName}
          </Link>
          <span>/</span>
          <span className="text-blue-600 font-bold">Survey No. {surveyNo}</span>
        </nav>

        {/* Main Parcel Card */}
        <article className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
          {/* Header */}
          <header className="flex flex-wrap items-start justify-between gap-4 pb-6 border-b border-slate-200">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700">
                  Statutory Interactive Record
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  Village {villageName} · {schemeLabel}
                  {rec.subSector ? ` · ${rec.subSector}` : ''}
                </span>
              </div>
              {/* The H1 carries the village name as well as the survey number.
                  Survey numbers repeat across villages — 3,153 of these pages
                  previously shared a bare "Revenue Survey No. N" heading with
                  at least one other page, so the single strongest on-page
                  relevance signal was identical across up to nine different
                  villages. */}
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
                Revenue Survey No. {surveyNo}, {villageName}
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 max-w-xl leading-relaxed">
                Survey No. {surveyNo} is a reconstituted revenue land parcel in Village{' '}
                {villageName}, Dholera SIR, sanctioned under the GTPUD Act 1976 as Final Plot{' '}
                {rec.finalPlot || 'pending'} under {schemeLabel}. It abuts a {roadWidthM}m planned
                Town Planning road, giving a maximum permissible FAR of {maxFAR} under DGDCR 2024.
                {rec.isEstimated
                  ? ' The road width is a fallback estimate, so the derived envelope is indicative.'
                  : ''}
              </p>
              {/* Statutory-honesty disclosure: search_index.json carries several
                  different FP numbers for this survey number. We refuse to pick
                  one, so say so rather than printing a number we cannot stand
                  behind. See chooseRow() in src/lib/survey-lookup.ts. */}
              {rec.fpAmbiguous && (
                <p className="mt-2 text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 max-w-xl">
                  <strong>Note:</strong> the source gazette extract records more than
                  one Final Plot reference for this survey number, so no single FP is
                  asserted here. Confirm the correct FP from the scheme reconstitution
                  register before relying on it for registration.
                </p>
              )}
            </div>

            <Link
              href={`/?search=${encodeURIComponent(`${villageName} ${surveyNo}`)}`}
              className="py-2.5 px-5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs tracking-wide transition shadow-md shadow-blue-600/20 text-center"
            >
              Locate on Vector Map →
            </Link>
          </header>

          {/* Legal Metrics Grid */}
          <section className="space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Interactive Boundary &amp; Reconstitution Metrics
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-1">
                <div className="text-xs text-slate-500 font-medium">Net Allotted Area</div>
                <div className="text-xl font-black text-slate-900">
                  {fmt(areaSqM)} m²
                </div>
                <div className="text-[11px] text-slate-500">
                  ~{fmt(areaSqYd)} sq.yd · Final Plot {rec.finalPlot || 'pending'}
                </div>
                {rec.areaDerived ? (
                  <div className="text-[10px] text-amber-700">
                    Measured from the digitised final-plot geometry — indicative, not the statutory register value.
                  </div>
                ) : null}
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-1">
                <div className="text-xs text-slate-500 font-medium">Abutting Road Right-of-Way</div>
                <div className="text-xl font-black text-blue-600">
                  {roadWidthM} Meters
                </div>
                <div className="text-[11px] text-slate-500">Town Planning ROW</div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-1">
                <div className="text-xs text-slate-500 font-medium">Town Planning Stage</div>
                <div className="text-sm font-bold text-emerald-700">
                  Sanctioned Preliminary
                </div>
                <div className="text-[11px] text-slate-500">Sec 52 GTPUD Act 1976</div>
              </div>
            </div>
          </section>

          {/* DGDCR Building Envelope Table */}
          <section className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-600" />
                <h2 className="text-sm font-bold text-slate-900">
                  DGDCR 2024 Building Control Envelope for Survey {surveyNo}
                </h2>
              </div>
              <span className="text-[10px] uppercase font-bold text-slate-600 bg-white border border-slate-200 px-2 py-0.5 rounded shadow-2xs">
                {rec.statutoryTable.split('(')[0].trim()}
              </span>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100/80 text-slate-700 border-b border-slate-200 font-bold">
                    <th className="p-3">Control Parameter</th>
                    <th className="p-3">Survey {surveyNo} Value</th>
                    <th className="p-3">Regulatory Guidance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 font-mono">
                  <tr>
                    <td className="p-3 font-sans font-semibold text-slate-900">Max Permissible FAR</td>
                    <td className="p-3 text-blue-600 font-bold">{maxFAR}</td>
                    <td className="p-3 font-sans text-slate-500">Based on {roadWidthM}m road ROW</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-sans font-semibold text-slate-900">Maximum Buildable Area</td>
                    <td className="p-3 text-blue-600 font-bold">{fmt(builtUp)} m²</td>
                    <td className="p-3 font-sans text-slate-500">
                      {fmt(areaSqM)} m² × FAR {maxFAR}
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 font-sans font-semibold text-slate-900">Maximum Height Limit</td>
                    <td className="p-3 text-slate-900 font-bold">{maxHeightM}m</td>
                    <td className="p-3 font-sans text-slate-500">Subject to Airport NOC</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-sans font-semibold text-slate-900">Ground Coverage</td>
                    <td className="p-3 text-slate-900 font-bold">{groundCoveragePct}%</td>
                    <td className="p-3 font-sans text-slate-500">Setback &amp; green area deduction</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p className="text-[11px] text-slate-500 leading-relaxed italic">
              {rec.isEstimated
                ? `Values are derived from ${rec.statutoryTable} on an estimated road width — indicative, not certified.`
                : `Values are derived from ${rec.statutoryTable}.`}{' '}
              Legal conveyance and construction permissions require formal Mamlatdar / DSIRDA
              certified scrutiny.
            </p>
          </section>

          {/* Parcel geometry summary */}
          <section className="p-5 rounded-2xl bg-white border border-slate-200 space-y-3 text-xs leading-relaxed text-slate-600">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Ruler className="w-4 h-4 text-blue-600" />
              Parcel Geometry &amp; Reconstitution Detail
            </h2>
            <p>
              Under the Gujarat Town Planning and Urban Development (GTPUD) Act 1976, the original
              agricultural holding of Survey No. {surveyNo} in Village {villageName} was
              reconstituted into Final Plot {rec.finalPlot || 'pending'} under {schemeLabel}. The
              scheme deducts approximately 50% of the gross agricultural area for planned civic
              infrastructure, stormwater drainage, utility ducts and town planning roads, leaving
              the net allotted area{areaSqM
                ? ` of ${fmt(areaSqM)} m² (~${fmt(areaSqYd)} sq.yd) carried here. At FAR ${maxFAR} the parcel supports up to ${fmt(builtUp)} m² of built-up floor area,`
                : ` recorded in the scheme's reconstitution register, not on the "not to scale" plan sheet, so no figure is stated here.`}
              {' '}subject to DGDCR 2024 setbacks and the {maxHeightM}m height cap. Read the full
              framework in our{' '}
              <Link href="/guide" className="text-blue-600 underline font-semibold hover:text-blue-700">
                Dholera SIR Interactive Guide
              </Link>
              .
            </p>
          </section>

          {/* Village-relative comparison */}
          {comparison && (
            <section className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-600" />
                How Survey No. {surveyNo} Ranks in Village {villageName}
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-1 shadow-2xs">
                  <div className="text-[10px] text-slate-500 font-medium">Village Parcels</div>
                  <div className="text-lg font-black text-slate-900">
                    {comparison.villageParcels.toLocaleString('en-IN')}
                  </div>
                  <div className="text-[10px] text-slate-400">published in {villageName}</div>
                </div>

                {comparison.areaRank ? (
                  <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-1 shadow-2xs">
                    <div className="text-[10px] text-slate-500 font-medium">Area Rank</div>
                    <div className="text-lg font-black text-blue-600">
                      {comparison.areaRank.toLocaleString('en-IN')}
                      <span className="text-xs font-bold text-slate-400">
                        {ordinalSuffix(comparison.areaRank)}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {isLargestDecile
                        ? 'largest 10% in village'
                        : isSmallestDecile
                          ? 'smallest 10% in village'
                          : `larger than ${comparison.areaPercentile}% of parcels`}
                    </div>
                  </div>
                ) : (
                  <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-1 shadow-2xs">
                    <div className="text-[10px] text-slate-500 font-medium">Area Rank</div>
                    <div className="text-lg font-black text-slate-400">—</div>
                    <div className="text-[10px] text-slate-400">register value pending</div>
                  </div>
                )}

                {comparison.areaVsMedian ? (
                  <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-1 shadow-2xs">
                    <div className="text-[10px] text-slate-500 font-medium">vs Village Median</div>
                    <div className="text-lg font-black text-blue-600">
                      {comparison.areaVsMedian}×
                    </div>
                    <div className="text-[10px] text-slate-400">
                      median ~{fmt(comparison.villageMedianArea)} m²
                    </div>
                  </div>
                ) : (
                  <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-1 shadow-2xs">
                    <div className="text-[10px] text-slate-500 font-medium">Road Tier</div>
                    <div className="text-lg font-black text-blue-600">
                      {comparison.roadTierRank}
                      <span className="text-xs font-bold text-slate-400">
                        {ordinalSuffix(comparison.roadTierRank)}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400">of {comparison.roadTiersInVillage} widths</div>
                  </div>
                )}

                <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-1 shadow-2xs">
                  <div className="text-[10px] text-slate-500 font-medium">Road Frontage</div>
                  <div className="text-lg font-black text-slate-900">{roadWidthM}m</div>
                  <div className="text-[10px] text-slate-400">
                    {comparison.isWidestTier
                      ? `widest tier · ${comparison.roadTierCount} parcel${comparison.roadTierCount === 1 ? '' : 's'}`
                      : `${comparison.roadTierCount} parcel${comparison.roadTierCount === 1 ? '' : 's'} at ${roadWidthM}m`}
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-slate-500 leading-relaxed">
                Rankings compare the digitised published interactive map for Village {villageName} only —
                parcels in other villages sit on different scheme sheets and are not like-for-like.
                Confirm the statutory net area and Final Plot reference against the reconstitution
                register before relying on any figure here.
              </p>
            </section>
          )}

          {/* Road Access Navigation */}
          <section className="p-5 rounded-2xl bg-blue-50/60 border border-blue-200/80 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Navigation className="w-6 h-6 text-blue-600 flex-shrink-0" />
              <div>
                <h2 className="text-sm font-bold text-slate-900">Locate Survey No. {surveyNo} on the Ground</h2>
                <div className="text-xs text-slate-600">
                  Open a named map search for this parcel in Village {villageName}, Dholera SIR
                </div>
              </div>
            </div>

            <a
              href={`https://maps.google.com/?q=${encodeURIComponent(
                `Survey No. ${surveyNo} Village ${villageName} Dholera SIR Gujarat`,
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="py-2 px-4 rounded-xl bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 transition border border-slate-200 shadow-2xs flex items-center gap-1.5"
            >
              <MapPin className="w-3.5 h-3.5 text-blue-600" />
              <span>Google Maps Search</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </a>
          </section>

          {/* Title Due Diligence & Buyer Verification Checklist */}
          <section className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 text-xs leading-relaxed text-slate-600">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-600" />
              Interactive Due Diligence &amp; Title Verification Checklist
            </h2>
            <p>
              Prior to executing financial transactions, title conveyances, or sale agreements for
              Survey No. {surveyNo} in Village {villageName}, verify: (1) Certified 7/12 Satbara and
              8-A land registry extracts from the Gujarat Revenue AnyRoR portal; (2) Promulgation
              entries, pedigree charts and encumbrance certificates from the local Taluka Mamlatdar
              office; (3) Final Plot reconstitution schedule and non-agricultural (NA) permissions
              under DSIRDA authority; and (4) Compliance with DGDCR 2024 setbacks and building
              height guidelines. You can also connect with certified property consultants in our{' '}
              <Link href="/brokers" className="text-blue-600 underline font-semibold hover:text-blue-700">
                Verified Brokers Directory
              </Link>{' '}
              for ground-level parcel scrutiny.
            </p>
          </section>

          {/* Internal Links: Related Survey Numbers in Village */}
          {neighbours.length > 0 && (
            <section className="pt-4 border-t border-slate-200 space-y-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Related Survey Plots in Village {villageName}
              </h2>
              <div className="flex flex-wrap gap-2">
                {neighbours.map((s) => (
                  <Link
                    key={s.surveyNo}
                    href={`/survey/${village}/${s.surveyNo}`}
                    prefetch={false}
                    className="px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-blue-50 border border-slate-200 text-xs font-semibold text-slate-700 hover:text-blue-700 transition"
                  >
                    Survey {s.surveyNo} ({fmt(s.area)} m²) →
                  </Link>
                ))}
                <Link
                  href={`/village/${village}`}
                  prefetch={false}
                  className="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 border border-blue-200 text-xs font-bold text-blue-700 transition"
                >
                  All {villageName} Surveys Directory →
                </Link>
              </div>
            </section>
          )}
        </article>
      </main>

      <SiteFooter />
    </div>
  );
}
