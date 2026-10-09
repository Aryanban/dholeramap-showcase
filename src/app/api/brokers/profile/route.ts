/**
 * /api/brokers/profile
 *
 * Broker Directory profile management backed by Supabase.
 * - GET: Retrieves a broker profile (current user's or requested by ?userId=).
 * - POST: Upserts the authenticated user's broker directory profile.
 */
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { requireUserId } from '@/lib/razorpay-server';
import {
  readBrokerProfile,
  upsertBrokerProfile,
  readBrokerProperties,
  readEntitlementRow,
  BrokerProfileRow,
} from '@/lib/db';
import type { BrokerProfile } from '@/lib/brokers';

export const dynamic = 'force-dynamic';

function rowToProfile(row: BrokerProfileRow, adSpend: number = 0, properties: any[] = []): BrokerProfile {
  const initials =
    row.logo_initial ||
    (row.name || 'Broker')
      .split(' ')
      .map((w) => w[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();

  const totalMonthlySpend = adSpend; // Base spend plus verified ad-spend
  let sponsorTier: BrokerProfile['sponsorTier'] = 'verified';
  if (totalMonthlySpend >= 20000) sponsorTier = 'platinum';
  else if (totalMonthlySpend >= 10000) sponsorTier = 'gold';
  else if (totalMonthlySpend >= 5000) sponsorTier = 'silver';

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
    totalMonthlySpend,
    sponsorTier,
    verified: true,
    properties,
  };
}

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    let targetUserId = url.searchParams.get('userId');

    if (!targetUserId) {
      const session = await auth();
      targetUserId = session.userId || null;
    }

    if (!targetUserId) {
      return NextResponse.json({ profile: null }, { status: 200 });
    }

    const row = await readBrokerProfile(targetUserId);
    if (!row) {
      return NextResponse.json({ profile: null }, { status: 200 });
    }

    const ent = await readEntitlementRow(targetUserId);
    const properties = await readBrokerProperties(targetUserId);
    const profile = rowToProfile(row, ent?.ad_spend_total || 0, properties);

    return NextResponse.json({ profile });
  } catch (err) {
    console.error('[brokers/profile] GET error:', err);
    return NextResponse.json({ error: 'Failed to fetch broker profile' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const authed = await requireUserId();
  if (!authed.ok) return authed.response;

  try {
    const body = await req.json();
    const userId = authed.userId;

    const row = await upsertBrokerProfile(userId, {
      name: body.name || 'Verified Broker',
      agency: body.agency || null,
      rera_number: body.reraNumber || null,
      experience_years: Number(body.experienceYears) || 0,
      tp_schemes: Array.isArray(body.tpSchemes) ? body.tpSchemes : [],
      property_types: Array.isArray(body.propertyTypes) ? body.propertyTypes : [],
      head_office: body.headOffice || null,
      phone: body.phone || null,
      whatsapp: body.whatsapp || null,
      email: body.email || null,
      bio: body.description || body.bio || null,
      photo_url: body.photoUrl || null,
      logo_initial: body.logoInitial || null,
      deals_closed: body.dealsClosed || null,
      is_public: body.isPublic !== false,
    });

    if (!row) {
      throw new Error('Failed to upsert profile in database');
    }

    const ent = await readEntitlementRow(userId);
    const properties = await readBrokerProperties(userId);
    const profile = rowToProfile(row, ent?.ad_spend_total || 0, properties);

    return NextResponse.json({ success: true, profile });
  } catch (err) {
    console.error('[brokers/profile] POST error:', err);
    return NextResponse.json({ error: 'Failed to save broker profile' }, { status: 500 });
  }
}
