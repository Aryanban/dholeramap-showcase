import { NextResponse } from 'next/server';

export const dynamic = 'force-static';
export const revalidate = false;

export async function GET() {
  const catalog = {
    linkset: [
      {
        anchor: 'https://dholeramap.com/api',
        'service-desc': [
          {
            href: 'https://dholeramap.com/openapi.json',
            type: 'application/json',
          },
        ],
        'service-doc': [
          {
            href: 'https://dholeramap.com/guide',
            type: 'text/html',
          },
        ],
        status: [
          {
            href: 'https://dholeramap.com/api/health',
            type: 'application/json',
          },
        ],
      },
    ],
  };

  return new NextResponse(JSON.stringify(catalog, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/linkset+json',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
    },
  });
}
