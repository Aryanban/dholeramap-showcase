/**
 * GET /api/brokers/ranking
 *
 * Public server-side broker ranking API.
 * Merges real registered brokers and their active listings from Supabase with
 * seeded demo profiles and verified ad-spend records.
 * Ranked strictly by totalMonthlySpend descending.
 *
 * Data freshness: broker registrations / ad-spend change on the order of
 * hours, not seconds. The old 60s s-maxage re-ran 3 Supabase queries ~1,440×
 * /day/region AND re-transferred the full JSON on each revalidation.
 *
 * `force-dynamic` was silently defeating the s-maxage header: Vercel can only
 * serve a route from the edge ISR cache when it is statically generatable, so
 * `force-dynamic` made every /brokers page mount a cold origin execution of
 * all three Supabase queries. `export const revalidate` makes the route truly
 * ISR — the first request populates the cache, then a full hour of traffic is
 * served from the edge with zero origin reads, and the next request refreshes
 * it in the background. Mutations call revalidatePath('/api/brokers/ranking')
 * when spend must be visible immediately.
 */
import { NextResponse } from 'next/server';
import { SEEDED_BROKERS, BrokerProfile, BrokerProperty } from '@/lib/brokers';
import {
  readVerifiedBrokerSpends,
  readAllPublicBrokers,
  readAllPublicProperties,
  BrokerPropertyRow,
} from '@/lib/db';

export const revalidate = 3600; // 1 hour — see header comment

function rowToProperty(row: BrokerPropertyRow): BrokerProperty {
  return {
    id: row.id,
    title: row.title,
    village: row.village || '',
    tpScheme: row.tp_scheme || '',
    sid: row.sid || '',
    fp: row.fp || '',
    survey: row.survey || '',
    zone: row.zone || '',
    roadWidth: row.road_width || '',
    pricePerSqYd: row.price_per_sqyd || '',
    totalDemand: row.total_demand || '',
    highlights: row.highlights || [],
    hasBrochure: Boolean(row.has_brochure),
    status: (row.status as BrokerProperty['status']) || 'available',
    listedDate: row.listed_date || 'Sep 2026',
    featured: Boolean(row.featured),
    featuredStatus: (row.featured_status as BrokerProperty['featuredStatus']) || 'pending',
  };
}

export async function GET() {
  try {
    const [verifiedSpends, dbBrokers, dbProps] = await Promise.all([
      readVerifiedBrokerSpends().catch((e) => {
        console.warn('[brokers/ranking] spends query failed:', e);
        return [];
      }),
      readAllPublicBrokers().catch((e) => {
        console.warn('[brokers/ranking] brokers query failed:', e);
        return [];
      }),
      readAllPublicProperties().catch((e) => {
        console.warn('[brokers/ranking] properties query failed:', e);
        return [];
      }),
    ]);

    // Map properties by broker_id
    const propsByBroker = new Map<string, BrokerProperty[]>();
    for (const p of dbProps) {
      const list = propsByBroker.get(p.broker_id) || [];
      list.push(rowToProperty(p));
      propsByBroker.set(p.broker_id, list);
    }

    // Map spend by user_id
    const spendByBroker = new Map<string, number>();
    for (const s of verifiedSpends) {
      spendByBroker.set(s.user_id, Number(s.ad_spend_total) || 0);
    }

    // Convert real DB brokers to BrokerProfile
    const registeredBrokers: BrokerProfile[] = dbBrokers.map((row) => {
      const adSpend = spendByBroker.get(row.user_id) || 0;
      const initials =
        row.logo_initial ||
        (row.name || 'Broker')
          .split(' ')
          .map((w) => w[0])
          .join('')
          .substring(0, 2)
          .toUpperCase();

      return {
        id: row.user_id,
        name: row.name,
        agency: row.agency || '',
        photoUrl: row.photo_url || '',
        logoInitial: initials,
        logoColor: 'from-blue-600 to-indigo-600',
        avatarBg: 'bg-blue-100 text-blue-800',
        reraNumber: row.rera_number || '',
        experienceYears: row.experience_years || 0,
        tpSchemes: row.tp_schemes || [],
        propertyTypes: row.property_types || [],
        headOffice: row.head_office || '',
        phone: row.phone || '',
        whatsapp: row.whatsapp || '',
        email: row.email || '',
        description: row.bio || '',
        dealsClosed: row.deals_closed || '',
        subscriptionSpend: 0,
        creditsSpend: 0,
        adSpend,
        totalMonthlySpend: adSpend,
        sponsorTier: 'verified',
        verified: true,
        properties: propsByBroker.get(row.user_id) || [],
      };
    });

    // Deep clone seeded brokers
    const seeded: BrokerProfile[] = JSON.parse(JSON.stringify(SEEDED_BROKERS));

    // Combine registered brokers and seeded brokers (registered replace any conflicting ID)
    const registeredIds = new Set(registeredBrokers.map((b) => b.id));
    const combined: BrokerProfile[] = [
      ...registeredBrokers,
      ...seeded.filter((b) => !registeredIds.has(b.id)),
    ];

    // Sort strictly by totalMonthlySpend descending
    combined.sort((a, b) => b.totalMonthlySpend - a.totalMonthlySpend);

    // Reassign sponsor tiers based on authoritative position
    combined.forEach((b, idx) => {
      if (idx === 0) b.sponsorTier = 'platinum';
      else if (idx === 1) b.sponsorTier = 'gold';
      else if (idx === 2) b.sponsorTier = 'silver';
      else b.sponsorTier = 'verified';
    });

    return NextResponse.json(
      { brokers: combined, total: combined.length },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
        },
      }
    );
  } catch (err) {
    console.error('[brokers/ranking] unexpected error:', err);
    return NextResponse.json(
      { brokers: SEEDED_BROKERS, total: SEEDED_BROKERS.length },
      { status: 200 }
    );
  }
}
