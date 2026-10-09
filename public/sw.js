/**
 * PlotBook — Asset-only Service Worker (Map Performance Plan, Phase 2)
 *
 * Deliberately minimal so it CANNOT break auth, SEO, or streaming:
 *   - cache-first       for immutable /tiles/* and /maps/*  (busted by ?v= on deploy)
 *   - stale-while-revalidate for /data/search_index.json + /data/dholera_sheets.json
 *   - everything else (HTML navigations, /api, /trpc, cross-origin Clerk/Vercel) passes
 *     straight through — zero navigation control, zero HTML caching.
 *
 * Served as a plain static file: the Clerk middleware matcher excludes `js(?!on)`,
 * so /sw.js never reaches Clerk.
 */

const SW_TAG = 'pb-sw-v1';
const C_TILES = `${SW_TAG}-tiles`;
const C_DATA = `${SW_TAG}-data`;

const TILE_RE = /^\/tiles\/tp([1-6])\/(\d+)\/(\d+)\/(\d+)\.webp$/;
const IMMUTABLE_RE = /^\/(tiles|maps)\//;
const DATA_RE = /^\/data\/(search_index|dholera_sheets)\.json$/;

/* keep in lockstep with the tileLayer cache-buster in TilePyramidViewer.tsx.
   Learned from live requests after the first tile is served, so a deploy-time
   bump is picked up automatically. Exact-URL (query-sensitive) matching means a
   ?v bump always re-fetches fresh tiles — never stale ones. */
let ACTIVE_TILE_VERSION = '10x';

/* Full-pyramid geometry per scheme (mirrors the viewer's own bounds constants).
   Used ONLY for best-effort background backfill; never required for correctness. */
const GEOMETRY = {
  1: { w: 23840, h: 16840 },
  2: { w: 23840, h: 16840 },
  3: { w: 23840, h: 16840 },
  4: { w: 23840, h: 16840 },
  5: { w: 23840, h: 16840 },
  6: { w: 20220, h: 14304 },
};
const TILE_SIZE = 1024;
const MAX_ZOOM = 4;

/* observed tile-coordinate bbox per scheme/zoom, used to target backfill */
const observed = new Map();

function gridFor(scheme, z) {
  const g = GEOMETRY[scheme];
  if (!g) return null;
  const denom = TILE_SIZE << (MAX_ZOOM - z);
  return { cols: Math.ceil(g.w / denom), rows: Math.ceil(g.h / denom) };
}

function tileURL(scheme, z, y, x) {
  return `/tiles/tp${scheme}/${z}/${y}/${x}.webp?v=${ACTIVE_TILE_VERSION}`;
}

function trackObserved(scheme, z, x, y) {
  let byZoom = observed.get(scheme);
  if (!byZoom) {
    byZoom = {};
    observed.set(scheme, byZoom);
  }
  const b = byZoom[z] || (byZoom[z] = { minX: x, maxX: x, minY: y, maxY: y });
  b.minX = Math.min(b.minX, x);
  b.maxX = Math.max(b.maxX, x);
  b.minY = Math.min(b.minY, y);
  b.maxY = Math.max(b.maxY, y);
}

/* ------------------------------------------------------------------ install */
self.addEventListener('install', (event) => {
  // Take over from any older worker immediately so caching starts on first visit.
  self.skipWaiting();
  event.waitUntil(precacheOverviews());
});

/* ---------------------------------------------------------------- activate */
self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      // Drop caches from previous SW generations.
      const keep = new Set([C_TILES, C_DATA]);
      for (const name of await caches.keys()) {
        if (!keep.has(name)) await caches.delete(name);
      }
      await self.clients.claim();
    })()
  );
});

/* Precache the z0 overview tile of every scheme (~1.1 MB total) so each TP
   overview is instant and offline-ready after the first visit. */
async function precacheOverviews() {
  const cache = await caches.open(C_TILES);
  const urls = [];
  for (const scheme of Object.keys(GEOMETRY)) {
    const g = gridFor(scheme, 0);
    if (!g) continue;
    for (let y = 0; y < g.rows; y++) {
      for (let x = 0; x < g.cols; x++) {
        urls.push(tileURL(scheme, 0, y, x));
      }
    }
  }
  await Promise.all(
    urls.map(async (u) => {
      try {
        // Skip if a request for this exact URL is already cached.
        if (await cache.match(u)) return;
        const res = await fetch(u, { priority: 'low' });
        if (res && res.ok && res.type === 'basic') await cache.put(u, res.clone());
      } catch {
        /* best effort — a missing/changed tile is harmless */
      }
    })
  );
}

/* ------------------------------------------------------------------- fetch */
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  // Cross-origin (Clerk, Vercel Analytics/Speed Insights) never touches us.
  if (url.origin !== self.location.origin) return;
  // Never intercept page navigations / data routes / auth.
  if (req.mode === 'navigate') return;
  const path = url.pathname;
  if (path.startsWith('/api') || path.startsWith('/trpc') || path.startsWith('/_next/data'))
    return;

  if (IMMUTABLE_RE.test(path)) {
    const m = path.match(TILE_RE);
    if (m) {
      const v = url.searchParams.get('v');
      if (v) ACTIVE_TILE_VERSION = v;
      trackObserved(m[1], Number(m[2]), Number(m[4]), Number(m[3]));
      scheduleBackfill(m[1]);
    }
    event.respondWith(cacheFirst(req, C_TILES));
    return;
  }

  if (DATA_RE.test(path)) {
    event.respondWith(staleWhileRevalidate(req, C_DATA));
    return;
  }
  // Everything else: straight to the network, nothing cached.
});

async function cacheFirst(req, cacheName) {
  const cache = await caches.open(cacheName);
  const hit = await cache.match(req); // exact URL incl. ?v — safe against stale tiles
  if (hit) return hit;
  try {
    const res = await fetch(req);
    if (res && res.ok && res.type === 'basic') await cache.put(req, res.clone());
    return res;
  } catch {
    return new Response('', { status: 504, statusText: 'Gateway Timeout' });
  }
}

async function staleWhileRevalidate(req, cacheName) {
  const cache = await caches.open(cacheName);
  const hit = await cache.match(req);
  const revalidate = (async () => {
    try {
      const res = await fetch(req);
      if (res && res.ok && res.type === 'basic') await cache.put(req, res.clone());
    } catch {
      /* offline or stale — keep serving the cached copy */
    }
  })();
  if (hit) {
    void revalidate; // fire and forget
    return hit;
  }
  try {
    return await revalidate.then(() => cache.match(req)).then((r) => r || fetch(req));
  } catch {
    return new Response('', { status: 504, statusText: 'Gateway Timeout' });
  }
}

/* ------------------------------------------------------------- backfill */
let backfillQueued = new Set();
function scheduleBackfill(scheme) {
  if (backfillQueued.has(scheme)) return;
  backfillQueued.add(scheme);
  // Wait for panning to settle before spending bandwidth.
  setTimeout(() => {
    backfillQueued.delete(scheme);
    void backfillScheme(scheme);
  }, 2500);
}

/* Trickle-fetch the active scheme's lower zooms so panning becomes cache-only.
   Strictly best-effort: bounded, low priority, and every 404 is skipped. */
async function backfillScheme(scheme) {
  const cache = await caches.open(C_TILES);
  const targets = [];
  const push = (z, x, y) => targets.push({ z, x, y });

  // z1 + z2 in full (small, ~39 tiles/scheme) for smooth overview panning.
  for (const z of [1, 2]) {
    const g = gridFor(scheme, z);
    if (!g) continue;
    for (let y = 0; y < g.rows; y++) for (let x = 0; x < g.cols; x++) push(z, x, y);
  }

  // Deeper zooms: only within the rectangle the user actually viewed, scaled
  // up through the pyramid.
  const byZoom = observed.get(scheme);
  if (byZoom) {
    const deepest = Object.keys(byZoom)
      .map(Number)
      .filter((z) => z >= 1)
      .sort((a, b) => b - a)[0];
    if (deepest !== undefined && deepest < MAX_ZOOM) {
      const box = byZoom[deepest];
      const base = gridFor(scheme, deepest);
      for (let z = deepest + 1; z <= MAX_ZOOM; z++) {
        const g = gridFor(scheme, z);
        if (!g || !base) break;
        const sx = g.cols / base.cols;
        const sy = g.rows / base.rows;
        const x0 = Math.max(0, Math.floor(box.minX * sx) - 1);
        const x1 = Math.min(g.cols - 1, Math.ceil(box.maxX * sx) + 1);
        const y0 = Math.max(0, Math.floor(box.minY * sy) - 1);
        const y1 = Math.min(g.rows - 1, Math.ceil(box.maxY * sy) + 1);
        for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) push(z, x, y);
      }
    }
  }

  // Cap the work per run and fetch sequentially at low priority.
  const queue = targets.slice(0, 160);
  for (const t of queue) {
    const u = tileURL(scheme, t.z, t.y, t.x);
    try {
      if (await cache.match(u)) continue;
      const res = await fetch(u, { priority: 'low' });
      if (res && res.ok && res.type === 'basic') await cache.put(u, res.clone());
    } catch {
      /* skip — tile may not exist at this coordinate */
    }
  }
}
