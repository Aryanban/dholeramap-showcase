# DholeraMap — Map Viewer Performance Implementation Plan

**Scope:** TP1–TP6 map viewer (`src/components/map/TilePyramidViewer.tsx`) and the
search → fly-to path. Goal: eliminate the 20–30 s "zoomed page" load, make search
redirects near-instant, and make repeat devices progressively faster on every visit.

**Status:** Audited and source-verified against the current codebase (Leaflet 1.9.4,
Next 15, React 19). Every change below has a confirmed blast radius.

**Progress:** Phase 0 ✅ shipped. Phase 2 ✅ shipped (asset-only service worker).
Phase 4.3 ✅ shipped (IndexedDB-backed search index). Phases 1, 3, and the
remainder of 4 are deferred — **the map viewer and tile pipeline are intentionally
frozen** (verified working; not modified in this pass).

---

## 1. Root-Cause Diagnosis (quantified)

The active viewer is `src/components/map/TilePyramidViewer.tsx`, mounted at
`src/app/page.tsx:209`. It serves a Leaflet `CRS.Simple` tile pyramid.

| Finding | Evidence | Impact |
|---|---|---|
| **Tiles are 1024px** | `TilePyramidViewer.tsx:289` `tileSize: 1024`; avg 35 KB, dense CAD tiles up to 300 KB | **Root cause of the 20–30 s zoom** |
| **`keepBuffer: 3`** (`:295`) | Buffer is measured in *tile units* → 3 × 1024px = 3072px over-fetch ring | One 1080p "zoomed page" requests ~40–60 tiles = 1.5–9 MB, serialized over the browser's ~6 concurrent connections |
| **Search always loads the heaviest level** | `_clampZoom` uses `Math.round(zoom)` (`leaflet-src.js:11654`); search flies to zoom 3.6/3.8 → `Math.round(3.6) = 4` | Every search loads the full **z4** pyramid level |
| **No durable client cache** | Only HTTP cache headers (`next.config.ts:39-46`); no service worker | Repeat devices do not get progressively faster |
| **No prewarm before fly** | `issueFly` moves the camera, *then* tiles begin loading | Search redirect feels sluggish |
| **`plots.json` 1.4–6.8 MB per scheme** | `fetch().then(r => r.json())` on the main thread (`:306`); TP1 = 3,871 items | 100–300 ms parse jank on every sheet switch |
| **O(n) click hit-test** | Linear scan over all plots (`:458-473`) | Laggy parcel selection on large schemes (TP2 = 6.8 MB) |
| **1.73 MB search index re-fetched per visit** | `search_index.json` = 18,161 items; gates `dataReady` (`SearchBox.tsx:70-79`) | First-visit search latency + wasted bandwidth on every return |
| **Sequential bootstrap** | `await import('leaflet')` → `await loadManifest()` → re-render → tile layer (`:144-199`) | Delays first tile by ~1 round trip + a render cycle |

### Corrections made during verification

Two early suggestions were proven wrong by reading the Leaflet source and were **retracted**:

- **`updateWhenZooming: false` — RETRACTED.** At `leaflet-src.js:11662`,
  `tileZoomChanged = this.options.updateWhenZooming && (tileZoom !== this._tileZoom)`.
  During the 0.8 s `flyTo`, `true` is what lets the grid *progressively* load z2→z3→z4
  during the glide. Setting `false` would defer all tile loading until after the
  animation lands — making search **slower**, contradicting the goal. Keep `true`.
- **"Search scans 21K items per keystroke" — downgraded.** The per-keystroke scan is
  ~5–15 ms (not a bottleneck). The real cost is the 1.73 MB fetch + parse gating
  `dataReady` on first visit, and re-fetching it on every visit.

---

## 2. Verified-Safe Change Register

| Change | Verified safe because |
|---|---|
| `tileSize` 1024 → 512 | **Single consumer** (`TilePyramidViewer.tsx:288`), **single hardcoded literal** (`:289`); `meta.json` `tileSize` is written from the same build constant; Playwright harness is tile-size agnostic (asserts `.leaflet-tile-pane` attached, zoom, reticle counts — never pixels) |
| Re-slice all 6 schemes | All source PDFs present in `data/dholera_raw/`; `.venv` has PIL 11.3.0 + pypdfium2; the master script `build_all_calibrated_cadastres_and_pyramids.py:27` is the one knob |
| `keepBuffer: 3 → 2` | `2` is Leaflet's own desktop default |
| `updateInterval: 50 → 150` | Leaflet default is `200`; only throttles the pan `move` listener, never `flyTo` |
| Service worker | `src/middleware.ts:71` matcher excludes `js(?!on)` → `/sw.js` is served as a static file, **bypassing Clerk entirely**; asset-only fetch handler touches zero HTML/auth routes |
| Plots/search worker | Additive — keeps the existing survey fallback while worker data is not yet ready |
| Flatbush hit-test | `flatbush` is already a dependency; preserves exact distance semantics (radius-220 query on point boxes) |

### Mandatory coupling

Bumping `tileSize` to 512 **requires** bumping the `?v=10x` cache-buster
(`TilePyramidViewer.tsx:288`) in the same change. Otherwise returning browsers serve
cached 1024px tiles into a 512px grid → **misaligned, broken map**. This is not optional.

---

## 3. Implementation Phases

### Phase 0 — Config-only, zero risk (ship now, ~1 hr)

All edits in `src/components/map/TilePyramidViewer.tsx`:

- `:295` — `keepBuffer: 3 → 2` (over-fetch ring 3072px → 2048px)
- `:297` — `updateInterval: 50 → 150`
- `:144-199` — parallelize with `Promise.all([import('leaflet'), loadManifest()])`
  instead of sequential awaits; hoist `map.setView(...)` above the manifest await so
  the container is map-ready immediately
- `src/app/layout.tsx` — add `<link rel="preload" as="fetch" href="/data/dholera_sheets.json">`

**Expected:** cold zoom 20–30 s → ~8–12 s. No data change, no rebuild, fully reversible.

---

### Phase 1 — Re-slice the pyramid to 512px (biggest win, ~0.5 day)

Edit the tile-size constant in all three generators:

- `scripts/build_all_calibrated_cadastres_and_pyramids.py:27` (master, TP2–TP6)
- `scripts/build_tp1_tile_pyramid.py:19`
- `scripts/build_tp6_tile_pyramid.py:18`

Change `TILE_SIZE = 1024 → 512`, then regenerate all six schemes.

- **Same 23,840 × 16,840 master image** — sharpness is identical; tiles are re-cropped
  from the same render into smaller boxes, so no quality loss.
- Each tile drops ~4× in bytes (avg 35 KB → ~9 KB). Visible-area bytes are similar,
  but over-fetch drops ~2× and tiles fill progressively → fast perceived pop-in.
- **In lockstep (mandatory):**
  - Bump `?v=10x` → `?v=11x` at `TilePyramidViewer.tsx:288`
  - Regenerate each `public/tiles/tp*/meta.json` (`tileSize` is written from the constant)
  - Change `:289` to read `tileSize` from `meta.json` so future re-slices need no code edit
- **Rollback:** keep the old set as `public/tiles-1024.bak`; restore `?v=10x` and
  `tileSize: 1024` to fully revert.

**Expected:** cold zoom → **2–4 s**; ~6–8× fewer bytes per zoomed screen.

---

### Phase 2 — Asset-only service worker = faster every repeat visit (~1 day)

Add `public/sw.js` and register it client-side in `src/app/layout.tsx`
(post-hydration, guarded by `typeof window`).

The fetch handler is deliberately minimal so it **cannot** break auth, SEO, or streaming:

- **Cache-first** for `/tiles/*`, `/maps/*` (immutable; the `?v=` query busts on deploy)
- **Stale-while-revalidate** for `/data/search_index.json`, `/data/dholera_sheets.json`
- **Everything else passes straight through** — no navigation control, no HTML caching

Additional behaviors:

- **Precache on idle:** all six schemes' `z0 + z1` tiles (~1.2 MB total) → every TP
  overview is instant and offline-ready after the first visit
- **Backfill prefetch:** after the active scheme's visible tiles finish, trickle-fetch
  its `z2–z4` into the SW cache at low priority via `requestIdleCallback`, so panning
  eventually becomes cache-only

**Expected:** repeat-visit zoomed view **< 300 ms**, and usable on flaky mobile networks.

---

### Phase 3 — Prewarm the search → fly path (instant redirect, ~0.5 day)

In `SearchBox.tsx` `commit()` (`:139-181`): **before** issuing the fly, compute the
target tile range from `target.x/y` + the fly zoom, and high-priority `fetch()` those
512px tiles. They land in the HTTP/SW cache *during* the 0.8 s glide, so the
destination paints on arrival instead of loading after.

Apply the same prewarm to:

- `openSheet` sub-sector jumps (`src/lib/store.ts:145`)
- The `sessionStorage` pending-goto path (`src/app/page.tsx:42-55`)

Also: defer the old tile-layer teardown at `TilePyramidViewer.tsx:260-264` until the new
layer's first tiles arrive → eliminates the white flash on sheet switch.

**Expected:** search redirect renders the target **almost instantly**.

---

### Phase 4 — Unblock the main thread (smoothness, ~1–1.5 days)

1. **`src/lib/plots.worker.ts`** — move the 1.4–6.8 MB `fetch` + `JSON.parse` off the
   main thread (kills the sheet-switch hitch). Replaces the logic at
   `TilePyramidViewer.tsx:301-329`. Keeps the existing survey fallback if the worker
   result has not arrived yet.
2. **Flatbush hit-test per scheme** (built in that same worker) — replace the O(n) loop
   at `TilePyramidViewer.tsx:458-473` with an O(log n) radius-220 query. Identical
   selection semantics, validated against `scripts/verify_all_tp_clicks.js`.
3. **Persist `search_index.json` to IndexedDB** using the existing Dexie pattern
   (`src/lib/doc-storage.ts`) → repeat visits skip the 1.73 MB fetch + parse entirely.
4. **Dead-code removal** (verified unused — only `src/app/page.tsx` mounts
   `TilePyramidViewer`): `components/map/OriginalViewer.tsx`,
   `components/MapViewer/CanvasMap.tsx`, `lib/spatial-index.ts`, `lib/columnar-index.ts`,
   `lib/data-loader.ts`, `store/map-store.ts`, `lib/device-tier.ts`. Re-run a final grep
   before deleting to confirm no imports remain.

**Expected:** jitter-free sheet switching, instant clicks, no first-visit search penalty.

---

## 4. Verification Gate (must stay green after every phase)

- `npm run test:ui` (`scripts/verify_ui.js`)
- `scripts/verify_all_tp_bounds_and_zoom.js`
- `scripts/verify_all_tp_clicks.js`
- `scripts/verify_deep_zoom_and_details.js`
- Extend `verify_all_tp_bounds_and_zoom.js` with timing assertions:
  sheet switch < 1.5 s, click → info panel < 300 ms
- Lighthouse / WebPageTest before and after each phase; gate on LCP and
  "time to first tile"

---

## 5. Sequencing & Guaranteed Outcomes

| Phase | Effort | Cold zoom | Repeat zoom | Breakage risk |
|---|---|---|---|---|
| 0 — Config | ~1 hr | 20–30 s → 8–12 s | unchanged | **None** (reversible flags) |
| 1 — 512px re-slice | ~0.5 day | → **2–4 s** | → < 1 s | Low — gated by the `?v` bump |
| 2 — SW cache | ~1 day | 2–4 s | → **< 300 ms** | Low — asset-only, no HTML |
| 3 — Prewarm fly | ~0.5 day | search instant | instant | None |
| 4 — Workers + index | ~1–1.5 days | jitter-free | jitter-free | Medium — guarded by fallbacks |

Every phase is independently shippable and independently reversible. Phases 0–3 compose;
Phase 4 is polish. If any phase regresses the verification harness, revert that phase
alone without affecting the others.

---

## 6. Rollback Procedure

1. **Phase 0:** restore the three original values (`keepBuffer: 3`, `updateInterval: 50`,
   sequential awaits); remove the preload link.
2. **Phase 1:** restore `public/tiles-1024.bak` to `public/tiles/`, revert `?v` to `10x`
   and `tileSize` to `1024`. Clear site cache or bump `?v` again to force re-fetch.
3. **Phase 2:** unregister the service worker
   (`navigator.serviceWorker.getRegistrations().then(r => r.forEach(x => x.unregister()))`)
   and delete `public/sw.js` + the registration call.
4. **Phase 3/4:** revert to the previous `commit()` logic / remove the worker files and
   restore the inline parse. The fallback paths are already in place, so removing the
   worker restores prior behavior automatically.
