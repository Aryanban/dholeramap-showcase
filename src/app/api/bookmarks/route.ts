/**
 * /api/bookmarks
 *
 * Synchronizes saved plots across devices per authenticated user via Supabase.
 * - GET: Retrieves user's bookmarks from Supabase.
 * - POST: Upserts single or batch bookmarks.
 * - DELETE: Removes a bookmark by id.
 */
import { NextRequest, NextResponse } from 'next/server';
import { requireUserId } from '@/lib/razorpay-server';
import {
  readUserBookmarks,
  upsertUserBookmarks,
  deleteUserBookmark,
  BookmarkRow,
} from '@/lib/db';
import type { Bookmark } from '@/lib/types';

export const dynamic = 'force-dynamic';

function rowToBookmark(row: BookmarkRow): Bookmark {
  const extra = (row.data || {}) as Record<string, any>;
  return {
    id: row.id,
    sid: row.sid,
    label: row.label,
    x: Number(row.x),
    y: Number(row.y),
    customName: row.custom_name || undefined,
    ...extra,
    createdAt: row.created_at ? new Date(row.created_at).getTime() : extra.createdAt,
  };
}

function bookmarkToRow(userId: string, b: Bookmark): BookmarkRow {
  const { id, sid, label, x, y, customName, ...rest } = b;
  return {
    id,
    user_id: userId,
    sid: sid || 'tp1-master',
    label: label || 'Plot',
    x: Number(x) || 0,
    y: Number(y) || 0,
    custom_name: customName || null,
    data: rest,
  };
}

export async function GET() {
  const auth = await requireUserId();
  if (!auth.ok) return auth.response;

  try {
    const rows = await readUserBookmarks(auth.userId);
    const bookmarks = rows.map(rowToBookmark);
    return NextResponse.json({ bookmarks, total: bookmarks.length });
  } catch (err) {
    console.error('[bookmarks] GET error:', err);
    return NextResponse.json({ error: 'Failed to fetch bookmarks' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireUserId();
  if (!auth.ok) return auth.response;

  try {
    const body = await req.json();
    let toUpsert: Bookmark[] = [];
    if (Array.isArray(body.bookmarks)) {
      toUpsert = body.bookmarks;
    } else if (body.bookmark) {
      toUpsert = [body.bookmark];
    } else if (body.id && body.sid) {
      toUpsert = [body];
    }

    if (toUpsert.length === 0) {
      return NextResponse.json({ error: 'No bookmarks provided' }, { status: 400 });
    }

    const rows = toUpsert.map((b) => bookmarkToRow(auth.userId, b));
    await upsertUserBookmarks(auth.userId, rows);

    return NextResponse.json({ success: true, count: rows.length });
  } catch (err) {
    console.error('[bookmarks] POST error:', err);
    return NextResponse.json({ error: 'Failed to save bookmarks' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const auth = await requireUserId();
  if (!auth.ok) return auth.response;

  try {
    const url = new URL(req.url);
    let id = url.searchParams.get('id');
    if (!id) {
      const body = await req.json().catch(() => ({}));
      id = body.id;
    }

    if (!id) {
      return NextResponse.json({ error: 'Missing bookmark id' }, { status: 400 });
    }

    const ok = await deleteUserBookmark(auth.userId, id);
    return NextResponse.json({ success: ok });
  } catch (err) {
    console.error('[bookmarks] DELETE error:', err);
    return NextResponse.json({ error: 'Failed to delete bookmark' }, { status: 500 });
  }
}
