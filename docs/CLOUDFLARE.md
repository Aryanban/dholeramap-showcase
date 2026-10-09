# Cloudflare configuration for dholeramap.com (source of truth)

> Read this before changing ANY caching, header, or fetch behaviour.
> Vercel Hobby quota (1M ISR Reads/month) is the binding constraint.
> Cloudflare Free sits in front of Vercel and absorbs ~90% of origin hits.
> Breaking these rules = 503 DEPLOYMENT_PAUSED for all visitors.

## Architecture

```
visitor/bot -> Cloudflare edge (cache) -> Vercel origin (only on MISS)
Vercel Serverless Functions Region: bom1 (Mumbai, India) via vercel.json
```

## DNS (Cloudflare is source of truth; Spaceship DNS is dead)

| Host | Type | Value | Proxy |
|---|---|---|---|
| `@` | A | 76.76.21.21 | Proxied (orange) |
| `www` | CNAME | cname.vercel-dns.com | Proxied (orange) |
| MX/TXT/DKIM (`resend._domainkey`) | — | as imported | DNS only (grey) |
| SPF `"v=spf1 ~all"` | TXT | keep, do not touch | DNS only |
| `clerk.*` CNAME/TXT (if added) | — | exact copy from Clerk Dashboard | DNS only (grey) — NEVER proxied |

- Nameservers point to Cloudflare. All future DNS edits happen here.
- SSL/TLS mode: **Full (strict)**. Never Flexible (redirect loop with Vercel).
- Edge Certificates: Always Use HTTPS ON, Auto HTTPS Rewrites ON, TLS 1.3 ON,
  Minimum TLS 1.2, **HSTS OFF** (origin already sends HSTS via next.config.ts).

## Cache Rules (order matters — first match wins)

1. `bypass-private-api-and-agents` —
   Expression: `(starts_with(http.request.uri.path, "/api/") and not http.request.uri.path eq "/api/brokers/ranking") or http.request.uri.path eq "/api" or ends_with(http.request.uri.path, ".md") or any(http.request.headers["accept"][*] contains "text/markdown")` → **Bypass cache**.
   *Note: Mutating APIs (Razorpay, auth, payments, bookmarks, user feedback) and AI Markdown content negotiation bypass cache. Static /.well-known/ and read-only /api/brokers/ranking are now eligible for edge caching.*

2. `cache-brokers-ranking` —
   Expression: `http.request.uri.path eq "/api/brokers/ranking"` →
   Eligible, Edge TTL **Ignore origin → 1 hour**.
   *Absorbs repeat calls from visitors browsing /brokers so Vercel Data Cache is read at most once per hour globally.*

3. `cut-isr-reads-atlas` (Catch-all for all static public pages) —
   Expression: `not starts_with(http.request.uri.path, "/api") and not starts_with(http.request.uri.path, "/_next") and not http.request.uri.path in {"/map" "/dashboard" "/admin" "/settings" "/checkout" "/sign-in" "/sign-up" "/embed/map"} and not starts_with(http.request.uri.path, "/verify") and not ends_with(http.request.uri.path, ".md")` →
   Eligible, Edge TTL **Ignore origin → 1 month** (or 14 days),
   Browser TTL: **Override origin → 1 day** (86,400s),
   Serve-stale-while-revalidate: ON.
   *CRITICAL: Inverting from a fragile whitelist to a blacklist ensures EVERY public page (including /privacy, /terms, /refund, /disclaimer, /embed, trailing slashes /guide/, and all 3,635 survey pages) is 100% cached at Cloudflare edge.*

4. `cache-static-blobs` —
   Expression: `starts_with(http.request.uri.path, "/tiles/") or starts_with(http.request.uri.path, "/maps/") or starts_with(http.request.uri.path, "/data/") or starts_with(http.request.uri.path, "/.well-known/") or http.request.uri.path in {"/favicon.ico" "/manifest.webmanifest" "/robots.txt" "/sitemap.xml" "/image-sitemap.xml" "/llms.txt" "/llms-full.txt"}` →
   Eligible, Edge TTL **Ignore origin → 1 month**. Browser TTL: Respect origin.

5. `cache-next-static` — `/_next/static/*` →
   Eligible, Edge TTL override 1 year, Browser TTL override 1 year.
   Safe: filenames are content-hashed, new deploy = new filenames.

Never cache: `/map`, `/dashboard`, `/admin`, `/settings`, `/checkout`,
`/verify/*`, `/sign-in`, `/sign-up`, `/embed/map` (live/dynamic/personal).

## Caching / Speed / Network / Security

- Caching Level: Standard. Browser TTL: Respect Existing Headers.
- **Always Online: ON** (serves cached copy if Vercel pauses — prevents Cloudflare 5xx/524 errors).
- **Tiered Cache: Smart Tiered Cache ON** (CRITICAL for Cache Hit Ratio).
  - Without Tiered Cache, Cloudflare has 300+ independent POPs with 0% shared cache, resulting in a ~28% hit ratio.
  - Enabling Smart Tiered Cache (free in Caching > Tiered Cache) pools edge cache through central regional POPs, lifting cache hit ratio to 85%+.
- Speed: Early Hints ON, HTTP/3 ON, 0-RTT ON (improves TTFB on repeat visits), **Rocket Loader OFF**
  (breaks Leaflet), Auto Minify all OFF (Next minifies at build).
- Network: HTTP/3 ON, WebSockets ON, IP Geolocation ON, gRPC OFF.
- **AI Crawl Control & Bot Settings**:
  - In Security > Bots: allow verified AI bots (GPTBot, ClaudeBot, PerplexityBot, Applebot, Google-Extended).
  - In Security > AI Crawl Control: ensure origin markdown is delivered cleanly without bot blocking.

## AI Agent Readiness & Machine Discovery

The platform implements open standards for automated agent discovery and interaction:

1. **RFC 9727 API Catalog**:
   - Live URL: `https://dholeramap.com/.well-known/api-catalog`
   - Content-Type: `application/linkset+json`
2. **RFC 8414 & RFC 9470 OAuth Metadata**:
   - `https://dholeramap.com/.well-known/oauth-authorization-server`
   - `https://dholeramap.com/.well-known/oauth-protected-resource`
   - `https://dholeramap.com/.well-known/openid-configuration`
3. **Agent Auth Manifest**:
   - `https://dholeramap.com/auth.md` (Content-Type: `text/markdown; charset=utf-8`)
4. **Markdown Content Negotiation & Direct Extension**:
   - Header negotiation: `Accept: text/markdown` on any page (`/`, `/guide`, `/pricing`, `/village/*`, `/survey/*`, etc.)
   - Direct URL extension: appending `.md` (e.g. `/guide.md`, `/pricing.md`, `/dholera-sir.md`, `/index.md`) routes cleanly to `/api/markdown`
5. **Agent LLM Summaries**:
   - `https://dholeramap.com/llms.txt` and `https://dholeramap.com/llms-full.txt`
6. **Cloudflare MCP Integration**:
   - Configured in `.cursor/mcp.json`, `.vscode/mcp.json`, and agent MCP environments:
     - `cloudflare`: `https://mcp.cloudflare.com/mcp`
     - `cloudflare-docs`: `https://docs.mcp.cloudflare.com/mcp`
     - `cloudflare-bindings`: `https://bindings.mcp.cloudflare.com/mcp`
     - `cloudflare-builds`: `https://builds.mcp.cloudflare.com/mcp`
     - `cloudflare-observability`: `https://observability.mcp.cloudflare.com/mcp`
   - Installed 14 official Cloudflare skills in `.agents/skills/`.

## Transform Rules (Modify Response Headers)

- **Add Link Headers for Agent Discovery (RFC 8288 / RFC 9727)**:
  - If desired at Cloudflare edge: Rule Name `Add Link Headers for Agents`
  - Filter: `http.request.uri.path eq "/"`
  - Set static header: `Link`
  - Value: `</.well-known/api-catalog>; rel="api-catalog", </openapi.json>; rel="service-desc"; type="application/json", </guide>; rel="service-doc"; type="text/html", </llms.txt>; rel="describedby"; type="text/plain"`
  - *Origin contract*: Next.js (`next.config.ts`, `src/middleware.ts`, `layout.tsx`) already sends this natively.

## Origin contract (next.config.ts — do not weaken)

- `/tiles/*.{images}` → `public, max-age=31536000, immutable` (never change).
- `/tiles/*.{bin,json}` + `/data/*.json` →
  `public, max-age=5184000, stale-while-revalidate=2592000` (60d + 30d SWR).
- `images.minimumCacheTTL = 2678400` (31d). `/api/brokers/ranking`:
  `s-maxage=3600, SWR=86400`. Blog/broker pages: `dynamicParams=false`.
- Every app fetch of tiles/data carries `?v=` (TILE_VERSION / DATA_VERSION).
  New URL = new cache key = instant refresh. **Bump the version on any
  content fix.** Forgetting the bump self-heals in ≤60d (never a year).

## Spaceship to Cloudflare Migration Checklist

- [x] Nameservers shifted from Spaceship to Cloudflare.
- [x] Apex `@` A record pointed to `76.76.21.21` (Proxied / Orange Cloud).
- [x] `www` CNAME pointed to `cname.vercel-dns.com` (Proxied / Orange Cloud).
- [x] Clerk CNAME/TXT records set to **DNS Only** (Grey Cloud, unproxied).
- [x] SSL/TLS set to **Full (strict)**.
- [x] Smart Tiered Cache enabled.
- [x] Always Online enabled.
- [x] Cache Rule #1 configured to bypass cache for mutating `/api/`, `*.md`, and `Accept: text/markdown` (`.well-known` & `/api/brokers/ranking` cached).
- [x] Hostname canonicalization in `src/middleware.ts` 301 redirects all `*.vercel.app` requests to `dholeramap.com`.
- [x] Aggressive scrapers (SemrushBot, Bytespider, AhrefsBot, MJ12bot) blocked in `public/robots.txt`.
- [x] Next.js viewport link prefetching disabled (`prefetch={false}`) on large village/survey parcel grids.
- [x] Vercel Serverless Function compute region pinned to `bom1` (Mumbai, India) via `vercel.json`.

## Deploy discipline

1. Batch changes — every Vercel deploy rewrites ~3,700 static pages (ISR writes).
   No `chore(deploy): trigger rebuild` commits.
2. After any major content deploy: Cloudflare > Caching > **Purge Everything**.
   (Avoid purging on small fixes: purging evicts all 310 edge POPs and causes crawlers to re-hit origin.)
3. Verify after infra changes:
   `curl -sI <url> | grep cf-cache-status` → pages/blobs HIT on repeat,
   `/api/*`, `/map`, `/sign-in` always DYNAMIC/MISS.
