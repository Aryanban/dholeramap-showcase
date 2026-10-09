/**
 * PlotBook — best-effort prewarming of DeepZoom tiles and per-scheme plot
 * indices (Map Performance Plan, Phase 3 + plots.json warm-ahead).
 *
 * Camera moves (search commit, sub-sector jump, cross-page pending-goto) issue
 * their fly immediately, but the tiles at the destination only start loading
 * once the camera begins to move. By fetching the destination tile ring during
 * the ~0.8 s glide they land in the service-worker / HTTP cache first, so the
 * target paints on arrival instead of loading after the animation lands.
 *
 * These helpers only READ the viewer's constants — the map itself is untouched.
 * Everything is fire-and-forget: redundant fetches are absorbed by the SW's
 * cache-first handler or the browser's HTTP cache, so they are near-free.
 */

export const TILE_VERSION = '10x'; // keep in lockstep with TilePyramidViewer.tsx:291
export const TILE_SIZE = 1024;
export const MAXZ = 4;

/** Full-pyramid pixel geometry per scheme (mirrors the viewer's own bounds). */
const GEOMETRY: Record<string, { w: number; h: number }> = {
  '1': { w: 23840, h: 16840 },
  '2': { w: 23840, h: 16840 },
  '3': { w: 23840, h: 16840 },
  '4': { w: 23840, h: 16840 },
  '5': { w: 23840, h: 16840 },
  '6': { w: 20220, h: 14304 },
};

/** Extract the TP scheme number (1-6) from a sheet id, or null if none. */
function schemeOf(sid: string): string | null {
  const m = /^tp([1-6])(?:-|$)/.exec(sid);
  return m ? m[1] : null;
}

/**
 * Prewarm the tile ring around a destination point.
 *
 * @param sid    target sheet id (e.g. "tp2-master")
 * @param x      destination x in full-pyramid pixels
 * @param y      destination y in full-pyramid pixels
 * @param zoom   the fly zoom level (rounded + clamped like Leaflet does)
 * @param radius tiles beyond the centre tile per axis (1 = 3x3 ring)
 */
export function prewarmFlyTiles(
  sid: string,
  x: number,
  y: number,
  zoom: number,
  radius = 1
): void {
  if (typeof window === 'undefined') return;
  const scheme = schemeOf(sid);
  if (scheme === null) return;
  const geo = GEOMETRY[scheme];
  if (!geo || !Number.isFinite(x) || !Number.isFinite(y)) return;

  // Leaflet requests tiles at Math.round(zoom), capped at maxNativeZoom.
  const z = Math.max(0, Math.min(MAXZ, Math.round(zoom)));
  // Full-pyramid pixels spanned by one tile at this zoom level.
  const denom = TILE_SIZE * 2 ** (MAXZ - z);
  const cols = Math.ceil(geo.w / denom);
  const rows = Math.ceil(geo.h / denom);

  const cCol = Math.max(0, Math.min(cols - 1, Math.floor(x / denom)));
  const cRow = Math.max(0, Math.min(rows - 1, Math.floor(y / denom)));

  const urls: string[] = [];
  for (let r = cRow - radius; r <= cRow + radius; r++) {
    if (r < 0 || r > rows - 1) continue;
    for (let c = cCol - radius; c <= cCol + radius; c++) {
      if (c < 0 || c > cols - 1) continue;
      urls.push(`/tiles/tp${scheme}/${z}/${r}/${c}.webp?v=${TILE_VERSION}`);
    }
  }

  void Promise.allSettled(urls.map((u) => fetch(u, { cache: 'force-cache' })));
}

/**
 * Warm the per-scheme plots index into cache before the map requests it, so the
 * first sheet switch does not stall on a 1.4-6.8 MB network fetch.
 */
export function prewarmPlotIndex(sid: string, dataVersion: string): void {
  if (typeof window === 'undefined') return;
  const scheme = schemeOf(sid);
  if (!scheme) return;
  fetch(`/tiles/tp${scheme}/plots.json?v=${dataVersion}`, { cache: 'force-cache' }).catch(
    () => {}
  );
}
