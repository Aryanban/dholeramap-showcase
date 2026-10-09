import { imageSitemapUrls } from '../sitemap';

/** XML text escaping. Image titles/captions contain "&" (e.g. "TP 1 & TP 2"),
 *  which is legal UTF-8 but MUST be entity-escaped or the document is malformed
 *  XML and Google rejects the entire file. */
function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * GET /image-sitemap.xml — Google Image Search sitemap.
 *
 * Implemented as a route handler rather than a `sitemap.ts` MetadataRoute
 * because Next's typed sitemap API only emits <loc>; the xmlns:image extension
 * namespace has to be written by hand.
 *
 * Each <image:image> carries <image:loc> (the image URL, required),
 * <image:caption> (the page that renders it, required) plus <image:title> for
 * the relevance match. See the IMAGE_SITEMAP registry in ../sitemap.ts for the
 * inclusion AND exclusion rules — notably the 3,173 Leaflet raster tiles under
 * public/tiles/** are deliberately not submitted.
 */
export const dynamic = 'force-static';

export function GET() {
  const entries = imageSitemapUrls();

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${entries
  .map(
    (e) => `  <url>
    <loc>${esc(e.page)}</loc>
    <image:image>
      <image:loc>${esc(e.loc)}</image:loc>
      <image:title>${esc(e.title)}</image:title>
      <image:caption>${esc(e.caption)}</image:caption>
    </image:image>
  </url>`
  )
  .join('\n')}
</urlset>
`;

  return new Response(body, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      // The entries come from static build-time registries (imageSitemapUrls
      // reads no runtime data), so the document is identical for the life of
      // the deploy. A long immutable lifetime lets the CDN serve it without a
      // revalidation round trip on every crawler hit; the deploy hash changes
      // on rebuild, so staleness across deploys is not a concern.
      'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
    },
  });
}