/**
 * GET /api/admin/users
 *
 * Real Clerk roster for the owner console: every signed-up account with its
 * server-written entitlements. Supports email search (Clerk's case-insensitive
 * partial match) and pagination.
 */
import { NextRequest } from 'next/server';
import { clerkClient } from '@clerk/nextjs/server';
import { requireAdmin } from '@/lib/admin';
import { toAdminUser } from '@/lib/admin-serializer';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const authed = await requireAdmin();
  if (!authed.ok) return authed.response;

  const { searchParams } = new URL(req.url);
  const search = (searchParams.get('search') || '').trim();
  const limit = Math.min(100, Math.max(1, Number(searchParams.get('limit')) || 50));
  const offset = Math.max(0, Number(searchParams.get('offset')) || 0);

  const client = await clerkClient();
  const page = await client.users.getUserList({
    limit,
    offset,
    ...(search ? { emailAddress: [search] } : {}),
  });
  const users = (page.data || []).map(toAdminUser);

  return Response.json({
    ok: true,
    users,
    totalCount: page.totalCount ?? users.length,
    offset,
    limit,
  });
}
