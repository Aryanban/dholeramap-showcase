import type { NextConfig } from "next";
import createMDX from '@next/mdx';

const securityHeaders = [
  {
    key: "Content-Security-Policy",
    value: "upgrade-insecure-requests; object-src 'none'; base-uri 'self';",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "X-Frame-Options",
    value: "SAMEORIGIN",
  },
  {
    key: "Cross-Origin-Opener-Policy",
    value: "same-origin-allow-popups",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(self)",
  },
  {
    key: "Vary",
    value: "Accept",
  },
  {
    key: "Link",
    value: '</.well-known/api-catalog>; rel="api-catalog", </openapi.json>; rel="service-desc"; type="application/json", </guide>; rel="service-doc"; type="text/html", </llms.txt>; rel="describedby"; type="text/plain"',
  },
];

const embedSecurityHeaders = [
  {
    key: "Content-Security-Policy",
    value: "upgrade-insecure-requests; frame-ancestors *; object-src 'none';",
  },
  {
    key: "Access-Control-Allow-Origin",
    value: "*",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  devIndicators: false,
  pageExtensions: ['ts', 'tsx', 'js', 'jsx', 'md', 'mdx'],
  images: {
    formats: ['image/avif', 'image/webp'],
    // Next's default image cache TTL is 60s — every optimized variant expired
    // almost immediately and re-ran the optimizer on origin (Image Opt. +
    // Fast Origin Transfer on every hit). Blueprints/showcase JPGs never
    // change without a deploy, so cache optimized variants for 31 days.
    minimumCacheTTL: 2678400,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  experimental: {
    optimizePackageImports: ['lucide-react', '@clerk/nextjs'],
  },

  async redirects() {
    return [
      // Permanently redirect www → apex so Google sees exactly one canonical
      // identity and confidently assigns the favicon to dholeramap.com.
      // 308 preserves the HTTP method (safe for any Razorpay POST callbacks).
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'www.dholeramap.com' }],
        destination: 'https://dholeramap.com/:path*',
        permanent: true,
      },
      {
        source: '/whitepaper',
        destination: '/dholera-sir-land-records-master-plan-whitepaper',
        permanent: false,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/((?!embed/map).*)",
        headers: securityHeaders,
      },
      {
        source: "/embed/map",
        headers: embedSecurityHeaders,
      },
      {
        // Raster tiles (.webp/.png): generated once from the PDF, never change
        // without a deploy + ?v= bump. Year-long immutable = zero origin
        // transfer on repeat views.
        source: "/tiles/:path(.*\\.(?:png|webp|jpg|jpeg|avif|gif|svg))",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        // Mutable data blobs — plots.json (1.5–4.1 MB), parcels.bin,
        // tp*_cadastre.json. 60-day fresh + 30-day SWR: repeat views serve
        // from edge with zero origin transfer, and content self-refreshes at
        // most 60 days after a fix even if you forget the ?v= bump. Bumping
        // DATA_VERSION on a fix is still recommended (instant refresh via new
        // cache key) but no longer mandatory to avoid year-long staleness.
        source: "/tiles/:path(.*\\.(?:bin|json))",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=5184000, stale-while-revalidate=2592000",
          },
        ],
      },
      {
        source: "/maps/:path(.*\\.(?:png|webp|jpg|jpeg|avif|gif|svg))",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        // /data/*.json (search_index.json 3.1 MB, dholera_sheets.json): app
        // fetches carry ?v=DATA_VERSION. Same 60d + 30d SWR as tile JSON —
        // cheap repeat views, self-heals within 60 days if you forget the bump.
        source: "/data/:path(.*\\.json)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=5184000, stale-while-revalidate=2592000",
          },
        ],
      },
      {
        // Brand marks are re-uploaded on the order of once a year, and the
        // filename is stable, so a long TTL with immutable is safe here and
        // lets Lighthouse drop the "efficient cache lifetimes" finding.
        source: "/:file(logo.*|favicon.*|icon.*|apple-touch-icon.*|apple-icon.*|manifest.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/auth.md",
        headers: [
          {
            key: "Content-Type",
            value: "text/markdown; charset=utf-8",
          },
          {
            key: "Cache-Control",
            value: "public, max-age=3600, stale-while-revalidate=86400",
          },
        ],
      },
      {
        // Static discovery & XML files: tell Cloudflare edge to cache for 30 days
        source: "/:file(sitemap\\.xml|image-sitemap\\.xml|robots\\.txt|llms\\.txt|llms-full\\.txt)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400, stale-while-revalidate=604800",
          },
          {
            key: "Cloudflare-CDN-Cache-Control",
            value: "public, max-age=2592000, stale-while-revalidate=604800",
          },
          {
            key: "CDN-Cache-Control",
            value: "public, s-maxage=2592000, stale-while-revalidate=604800",
          },
        ],
      },
      {
        // Tell Cloudflare edge CDN to cache all public static pages for 30 days.
        // Private routes (/map, /dashboard, /admin, /settings, /checkout, /sign-in, /sign-up, /verify, /embed/map, /api) are excluded.
        source: "/((?!api|map|dashboard|admin|settings|checkout|sign-in|sign-up|verify|embed/map|_next).*)",
        headers: [
          {
            key: "Cloudflare-CDN-Cache-Control",
            value: "public, max-age=2592000, stale-while-revalidate=86400",
          },
          {
            key: "CDN-Cache-Control",
            value: "public, s-maxage=2592000, stale-while-revalidate=86400",
          },
        ],
      },
    ];
  },
};

export default createMDX({
  mdxLoaderOptions: {
    // MDX 3 runs React Server Components by default in the App Router.
  },
})(nextConfig);
