import Link from 'next/link';
import { SearchX, MapPin, ArrowRight } from 'lucide-react';
import VillageRecoveryLink from './village-recovery-link';

/**
 * Route-scoped 404 for /survey/[village]/[surveyNo].
 *
 * WHY THIS EXISTS: a request for a parcel absent from the gazetted registry used
 * to return HTTP 200 with a `noindex, follow` "not in the live dataset" stub —
 * a soft-404. GSC had already served four such URLs with impressions
 * (/survey/pipli/320, /survey/bhimnath/105, /survey/rahtalav/120,
 * /survey/bhadana/102), and the homepage linked to five more. Google was being
 * invited to spend crawl budget on URLs that can never exist.
 *
 * The URL space is unbounded (22 villages x any survey number), so serving
 * 200+noindex across it is unbounded waste. A real 404 lets Google drop the URL
 * immediately and stop returning to it.
 *
 * The useful half of the old stub is not lost. "This village exists, it has N
 * parcels, search here" now lives on the village page, where it is crawlable and
 * has one canonical home, and this page routes the visitor straight there.
 *
 * Deliberately a SERVER component: an earlier version was 'use client' and, in
 * the not-found boundary, rendered an empty document (HTTP 404 with a blank
 * body). Server-rendering this keeps the recovery path visible without
 * JavaScript. Only the village-name link needs the client, so it is isolated in
 * ./village-recovery-link.tsx.
 */
export default function SurveyNotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <main className="flex-1 max-w-2xl w-full mx-auto p-6 sm:p-10 md:p-16 space-y-6">
        <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 border border-amber-200 px-3 py-1 text-xs font-bold text-amber-800">
          <SearchX className="w-3.5 h-3.5" />
          Survey number not found
        </div>

        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
          That survey number is not in the live dataset
        </h1>

        <p className="text-sm text-slate-600 leading-relaxed">
          DholeraMap publishes only revenue survey numbers that appear in the gazetted
          record for that village. If the number you tried is not listed, either it belongs
          to a different village, or it has not yet been promulgated into the digital
          register.
        </p>

        <VillageRecoveryLink />

        <div className="flex flex-wrap gap-3 pt-2">
          <Link
            href="/map"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition cursor-pointer"
          >
            <MapPin className="w-4 h-4" />
            Search the interactive map
          </Link>
          <Link
            href="/dholera-sir"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-800 text-sm font-bold rounded-xl border border-slate-300 transition cursor-pointer"
          >
            Browse all 22 villages
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </main>
    </div>
  );
}