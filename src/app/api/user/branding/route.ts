/**
 * /api/user/branding
 *
 * Persists dossier custom branding (logo, contact info, tagline) to Supabase.
 * - GET: Retrieves branding for authenticated user.
 * - POST: Saves or updates dossier branding.
 */
import { NextRequest, NextResponse } from 'next/server';
import { requireUserId } from '@/lib/razorpay-server';
import { readUserBranding, upsertUserBranding } from '@/lib/db';
import type { DossierBranding } from '@/lib/dossier/types';

export const dynamic = 'force-dynamic';

export async function GET() {
  const authed = await requireUserId();
  if (!authed.ok) return authed.response;

  try {
    const row = await readUserBranding(authed.userId);
    if (!row) {
      return NextResponse.json({ branding: null });
    }

    const branding: DossierBranding = {
      userId: row.user_id,
      logoDataUrl: row.logo_data_url || null,
      name: row.name || '',
      phone: row.phone || '',
      email: row.email || '',
      company: row.company || '',
      tagline: row.tagline || '',
      updatedAt: row.updated_at ? new Date(row.updated_at).getTime() : Date.now(),
    };

    return NextResponse.json({ branding });
  } catch (err) {
    console.error('[user/branding] GET error:', err);
    return NextResponse.json({ error: 'Failed to fetch branding' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const authed = await requireUserId();
  if (!authed.ok) return authed.response;

  try {
    const body = await req.json();
    const row = await upsertUserBranding(authed.userId, {
      name: body.name || null,
      company: body.company || null,
      phone: body.phone || null,
      email: body.email || null,
      tagline: body.tagline || null,
      logo_data_url: body.logoDataUrl || null,
    });

    if (!row) {
      throw new Error('Failed to save branding in database');
    }

    const branding: DossierBranding = {
      userId: row.user_id,
      logoDataUrl: row.logo_data_url || null,
      name: row.name || '',
      phone: row.phone || '',
      email: row.email || '',
      company: row.company || '',
      tagline: row.tagline || '',
      updatedAt: row.updated_at ? new Date(row.updated_at).getTime() : Date.now(),
    };

    return NextResponse.json({ success: true, branding });
  } catch (err) {
    console.error('[user/branding] POST error:', err);
    return NextResponse.json({ error: 'Failed to save branding' }, { status: 500 });
  }
}
