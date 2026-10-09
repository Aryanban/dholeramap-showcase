import React from 'react';
import Link from 'next/link';
import { VILLAGES } from '@/lib/villages';
import { surveysForVillage } from '@/lib/gazetted-surveys';
import { isIndexableSurvey } from '@/lib/survey-lookup';

/**
 * Server component providing internal links to published statutory survey records.
 * Renders static HTML on the server, eliminating client-side JSON downloads and hydration delays.
 *
 * DERIVED FROM THE REGISTRY, NOT HARDCODED.
 *
 * The previous version carried a hand-written list of ten (village, surveyNo)
 * pairs. Five of them did not exist in the gazetted record:
 * kadipur/124, gorasu/88, dholera/210, otariya/15, zankhi/50. Because this
 * component renders on the HOMEPAGE, that meant the site's highest-authority
 * page was permanently linking to five soft-404 URLs, inviting Google to spend
 * crawl budget on parcels that do not exist.
 *
 * Records are now selected at build time from parcels that pass the §8 quality
 * gate, so a link can never point at a phantom and the list stays correct as the
 * registry grows. Villages with no qualifying parcel (gorasu, dholera, otariya
 * currently have none) are simply skipped.
 */
interface FeaturedRecord {
  village: string;
  name: string;
  surveyNo: string;
}

function buildFeatured(limit: number): FeaturedRecord[] {
  const out: FeaturedRecord[] = [];
  for (const v of VILLAGES) {
    if (out.length >= limit) break;
    // Prefer the largest published villages so the links are to substantive
    // pages rather than one-parcel hamlets.
    const parcels = surveysForVillage(v.slug);
    if (!parcels.length) continue;
    const pick = parcels.find((p) => isIndexableSurvey(v.slug, p.surveyNo));
    if (pick) out.push({ village: v.slug, name: v.name, surveyNo: pick.surveyNo });
  }
  return out;
}

export default function SurveyRecordsNav({ limit = 10 }: { limit?: number }) {
  const records = buildFeatured(limit);

  if (records.length === 0) return null;

  return (
    <ul className="space-y-1 text-slate-600">
      {records.map((r) => (
        <li key={`${r.village}/${r.surveyNo}`}>
          <Link
            href={`/survey/${r.village}/${r.surveyNo}`}
            prefetch={false}
            className="text-blue-600 hover:underline py-1 inline-block"
            aria-label={`${r.name} Revenue Survey No. ${r.surveyNo} Land Record`}
          >
            {r.name} Survey No. {r.surveyNo}
          </Link>
        </li>
      ))}
    </ul>
  );
}

