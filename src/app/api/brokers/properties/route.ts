/**
 * /api/brokers/properties
 *
 * Manage property listings for brokers in Supabase.
 * - GET: Retrieves properties for a broker (by ?brokerId= or authenticated user).
 * - POST: Adds or updates a property listing for the authenticated broker.
 * - DELETE: Removes a property listing owned by the authenticated broker.
 */
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { requireUserId } from '@/lib/razorpay-server';
import {
  readBrokerProperties,
  upsertBrokerProperty,
  deleteBrokerProperty,
  BrokerPropertyRow,
} from '@/lib/db';
import type { BrokerProperty } from '@/lib/brokers';

export const dynamic = 'force-dynamic';

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

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    let targetBrokerId = url.searchParams.get('brokerId');

    if (!targetBrokerId) {
      const session = await auth();
      targetBrokerId = session.userId || null;
    }

    if (!targetBrokerId) {
      return NextResponse.json({ properties: [] }, { status: 200 });
    }

    const rows = await readBrokerProperties(targetBrokerId);
    const properties = rows.map(rowToProperty);

    return NextResponse.json({ properties, total: properties.length });
  } catch (err) {
    console.error('[brokers/properties] GET error:', err);
    return NextResponse.json({ error: 'Failed to fetch properties' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const authed = await requireUserId();
  if (!authed.ok) return authed.response;

  try {
    const body = await req.json();
    const propId = body.id || `prop-${Date.now()}`;

    const row = await upsertBrokerProperty(authed.userId, {
      id: propId,
      title: body.title || 'Dholera Plot Listing',
      village: body.village || null,
      tp_scheme: body.tpScheme || null,
      sid: body.sid || null,
      fp: body.fp || null,
      survey: body.survey || null,
      zone: body.zone || null,
      road_width: body.roadWidth || null,
      price_per_sqyd: body.pricePerSqYd || null,
      total_demand: body.totalDemand || null,
      highlights: Array.isArray(body.highlights) ? body.highlights : [],
      has_brochure: Boolean(body.hasBrochure),
      status: body.status || 'available',
      listed_date: body.listedDate || 'Sep 2026',
      featured: Boolean(body.featured),
      featured_status: body.featuredStatus || 'pending',
    });

    if (!row) {
      throw new Error('Failed to upsert property in database');
    }

    return NextResponse.json({ success: true, property: rowToProperty(row) });
  } catch (err) {
    console.error('[brokers/properties] POST error:', err);
    return NextResponse.json({ error: 'Failed to save property listing' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const authed = await requireUserId();
  if (!authed.ok) return authed.response;

  try {
    const url = new URL(req.url);
    let id = url.searchParams.get('id');
    if (!id) {
      const body = await req.json().catch(() => ({}));
      id = body.id;
    }

    if (!id) {
      return NextResponse.json({ error: 'Missing property id' }, { status: 400 });
    }

    const ok = await deleteBrokerProperty(authed.userId, id);
    return NextResponse.json({ success: ok });
  } catch (err) {
    console.error('[brokers/properties] DELETE error:', err);
    return NextResponse.json({ error: 'Failed to delete property' }, { status: 500 });
  }
}
