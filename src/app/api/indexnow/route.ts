import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin';
import { 
  INDEXNOW_HOST, 
  INDEXNOW_KEY, 
  INDEXNOW_KEY_LOCATION, 
  STATIC_PRIMARY_ROUTES,
  getAllIndexableUrls, 
  submitToIndexNow 
} from '@/lib/indexnow';

export const dynamic = 'force-dynamic';

const ALLOWED_ENDPOINTS = ['api.indexnow.org', 'www.bing.com'] as const;
type AllowedEndpoint = (typeof ALLOWED_ENDPOINTS)[number];
const MAX_SUBMIT_URLS = 10_000;

export async function GET() {
  const admin = await requireAdmin();
  if (!admin.ok) return admin.response;

  const allUrls = getAllIndexableUrls();

  return NextResponse.json({
    status: 'configured',
    host: INDEXNOW_HOST,
    keyLocation: INDEXNOW_KEY_LOCATION,
    totalIndexableUrls: allUrls.length,
    samplePrimaryRoutes: STATIC_PRIMARY_ROUTES.slice(0, 10),
    instructions: {
      postFullSite: 'POST /api/indexnow with body: { "fullSite": true }',
      postSpecificUrls: 'POST /api/indexnow with body: { "urls": ["https://dholeramap.com/dholera-tp-map"] }',
    },
  });
}

export async function POST(req: Request) {
  const admin = await requireAdmin();
  if (!admin.ok) return admin.response;

  try {
    let body: { fullSite?: boolean; urls?: string[]; targetEndpoint?: string } = {};
    try {
      body = await req.json();
    } catch {
      body = { fullSite: true };
    }

    const endpointInput = body.targetEndpoint || 'api.indexnow.org';
    if (!ALLOWED_ENDPOINTS.includes(endpointInput as AllowedEndpoint)) {
      return NextResponse.json(
        { error: `Invalid targetEndpoint. Allowed: ${ALLOWED_ENDPOINTS.join(', ')}` },
        { status: 400 }
      );
    }
    const endpoint = endpointInput as AllowedEndpoint;

    let urlsToSubmit: string[] = [];

    if (body.urls && Array.isArray(body.urls) && body.urls.length > 0) {
      if (body.urls.length > MAX_SUBMIT_URLS) {
        return NextResponse.json(
          { error: `Too many URLs. Maximum allowed is ${MAX_SUBMIT_URLS}` },
          { status: 400 }
        );
      }

      // Reject any submitted URL whose host does not match dholeramap.com
      for (const u of body.urls) {
        try {
          const parsed = new URL(u);
          if (parsed.hostname !== 'dholeramap.com' && parsed.hostname !== 'www.dholeramap.com') {
            return NextResponse.json(
              { error: `Host forbidden: ${parsed.hostname}. Only dholeramap.com URLs permitted.` },
              { status: 400 }
            );
          }
        } catch {
          return NextResponse.json({ error: `Malformed URL: ${u}` }, { status: 400 });
        }
      }
      urlsToSubmit = body.urls;
    } else {
      urlsToSubmit = getAllIndexableUrls();
    }

    const result = await submitToIndexNow(urlsToSubmit, endpoint);

    return NextResponse.json({
      success: result.success,
      statusCode: result.statusCode,
      submittedCount: result.submittedCount,
      endpoint: result.endpoint,
      message: result.message,
      timestamp: result.timestamp,
    }, { status: result.success ? 200 : result.statusCode >= 400 && result.statusCode < 600 ? result.statusCode : 500 });
  } catch (err) {
    return NextResponse.json({
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error during IndexNow processing',
    }, { status: 500 });
  }
}
