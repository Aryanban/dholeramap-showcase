/**
 * Local map-snapshot renderer.
 *
 * Stitches the app's own DeepZoom tile pyramid (`/tiles/tpN/{z}/{y}/{x}.webp`)
 * into framed, annotated snapshot images for the dossier — wide TP view,
 * sub-sector view, zoning crop, exact plot crop, OP/FP pair, and zoom grid.
 * Everything is same-origin canvas work: no uploads, no external services.
 */

import type { DossierMapView, DossierQuality, DossierSnapshot } from './types';
import { subSectorBounds } from './parcel';

export const TILE_SIZE = 1024;
export const MAXZ = 4;
const TILE_VERSION = '10x';

const NATIVE_DIMS: Record<string, { w: number; h: number }> = {
  '1': { w: 23840, h: 16840 },
  '2': { w: 23840, h: 16840 },
  '3': { w: 23840, h: 16840 },
  '4': { w: 23840, h: 16840 },
  '5': { w: 23840, h: 16840 },
  '6': { w: 20220, h: 14304 },
};

export interface SnapshotRequest {
  schemeNum: string;
  /** Center in native (z=4) cadastral pixels. */
  cx: number;
  cy: number;
  /** Window size in native pixels. */
  winW: number;
  winH: number;
  view: DossierMapView;
  label: string;
  /** Pin positions in native pixels (defaults to center). */
  pins?: { x: number; y: number; text: string; color?: string }[];
  quality: DossierQuality;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`tile load failed: ${src}`));
    img.src = src;
  });
}

function pickZoom(winW: number, winH: number, targetOut: number): number {
  // Deepest zoom where the window still fits in a small tile set.
  for (let z = MAXZ; z >= 0; z--) {
    const scale = 2 ** (z - MAXZ);
    if (winW * scale <= targetOut * 2.2 && winH * scale <= targetOut * 2.2) return z;
  }
  return 0;
}

function drawPin(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  text: string,
  color = '#d31245'
) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x - 26, y);
  ctx.lineTo(x + 26, y);
  ctx.moveTo(x, y - 26);
  ctx.lineTo(x, y + 26);
  ctx.stroke();
  ctx.fillStyle = 'rgba(211,18,69,0.25)';
  ctx.beginPath();
  ctx.arc(x, y, 20, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(x, y, 2.6, 0, Math.PI * 2);
  ctx.fill();
  if (text) {
    ctx.font = '700 22px Helvetica, Arial, sans-serif';
    const tw = ctx.measureText(text).width;
    const bx = Math.min(Math.max(x - tw / 2 - 12, 8), ctx.canvas.width - tw - 24);
    const by = Math.max(y - 64, 8);
    ctx.fillStyle = 'rgba(15,18,35,0.92)';
    ctx.fillRect(bx, by, tw + 24, 34);
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.strokeRect(bx, by, tw + 24, 34);
    ctx.fillStyle = '#ffffff';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, bx + 12, by + 18);
  }
  ctx.restore();
}

function drawCaption(ctx: CanvasRenderingContext2D, text: string) {
  ctx.save();
  ctx.font = '700 20px Helvetica, Arial, sans-serif';
  const tw = ctx.measureText(text).width;
  const x = 10;
  const y = ctx.canvas.height - 40;
  ctx.fillStyle = 'rgba(15,18,35,0.88)';
  ctx.fillRect(x, y, tw + 24, 30);
  ctx.fillStyle = '#ffd23f';
  ctx.fillRect(x, y, 5, 30);
  ctx.fillStyle = '#ffffff';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, x + 14, y + 16);
  ctx.restore();
}

export async function renderSnapshot(req: SnapshotRequest): Promise<DossierSnapshot> {
  const dims = NATIVE_DIMS[req.schemeNum] || NATIVE_DIMS['1'];
  const maxOut = req.quality === 'print' ? 2200 : 1500;
  const aspect = req.winW / req.winH;
  const outW = Math.min(maxOut, Math.round(Math.min(maxOut, 1600) * 1));
  const outH = Math.round(outW / aspect);
  const z = pickZoom(req.winW, req.winH, outW);
  const scale = 2 ** (z - MAXZ);

  const x0 = Math.min(Math.max(req.cx - req.winW / 2, 0), Math.max(dims.w - req.winW, 0));
  const y0 = Math.min(Math.max(req.cy - req.winH / 2, 0), Math.max(dims.h - req.winH, 0));
  const x0s = x0 * scale;
  const y0s = y0 * scale;
  const x1s = (x0 + req.winW) * scale;
  const y1s = (y0 + req.winH) * scale;

  const col0 = Math.max(0, Math.floor(x0s / TILE_SIZE));
  const col1 = Math.floor((x1s - 1) / TILE_SIZE);
  const row0 = Math.max(0, Math.floor(y0s / TILE_SIZE));
  const row1 = Math.floor((y1s - 1) / TILE_SIZE);

  const canvas = document.createElement('canvas');
  canvas.width = outW;
  canvas.height = outH;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#eef0f4';
  ctx.fillRect(0, 0, outW, outH);

  const jobs: Promise<void>[] = [];
  for (let row = row0; row <= row1; row++) {
    for (let col = col0; col <= col1; col++) {
      const url = `/tiles/tp${req.schemeNum}/${z}/${row}/${col}.webp?v=${TILE_VERSION}`;
      jobs.push(
        loadImage(url)
          .then((img) => {
            const ix0 = Math.max(col * TILE_SIZE, x0s);
            const iy0 = Math.max(row * TILE_SIZE, y0s);
            const ix1 = Math.min((col + 1) * TILE_SIZE, x1s);
            const iy1 = Math.min((row + 1) * TILE_SIZE, y1s);
            if (ix1 <= ix0 || iy1 <= iy0) return;
            const sx = ix0 - col * TILE_SIZE;
            const sy = iy0 - row * TILE_SIZE;
            const dx = ((ix0 - x0s) / (x1s - x0s)) * outW;
            const dy = ((iy0 - y0s) / (y1s - y0s)) * outH;
            const dw = ((ix1 - ix0) / (x1s - x0s)) * outW;
            const dh = ((iy1 - iy0) / (y1s - y0s)) * outH;
            try {
              ctx.drawImage(img, sx, sy, ix1 - ix0, iy1 - iy0, dx, dy, dw, dh);
            } catch {
              /* skip corrupt tile */
            }
          })
          .catch(() => {
            /* missing tile: leave matte */
          })
      );
    }
  }
  await Promise.all(jobs);

  const toOut = (nx: number, ny: number) => ({
    x: ((nx - x0) / req.winW) * outW,
    y: ((ny - y0) / req.winH) * outH,
  });

  const pins = req.pins?.length
    ? req.pins
    : [{ x: req.cx, y: req.cy, text: req.label }];
  for (const p of pins) {
    const pt = toOut(p.x, p.y);
    if (pt.x < -40 || pt.y < -40 || pt.x > outW + 40 || pt.y > outH + 40) continue;
    drawPin(ctx, pt.x, pt.y, p.text, p.color);
  }
  if (req.label && req.view !== 'exact') drawCaption(ctx, req.label);

  const dataUrl = canvas.toDataURL('image/jpeg', req.quality === 'print' ? 0.9 : 0.82);
  return { view: req.view, label: req.label, dataUrl, width: outW, height: outH };
}

/**
 * Full-scheme JPG snapshot with a proportional marker (macro / TP-location view).
 *
 * The scheme JPG always depicts the complete native cadastral extent (its aspect
 * ratio matches NATIVE_DIMS), so the marker maps over with a single proportion —
 * no intermediate JPG-pixel scale factor. The old factor broke when the JPGs were
 * re-exported at a different resolution and pulled every pin toward the top-left.
 */
export async function renderSchemeSnapshot(
  schemeNum: string,
  nx: number,
  ny: number,
  label: string,
  quality: DossierQuality,
  view: DossierMapView = 'tp-full'
): Promise<DossierSnapshot> {
  const native = NATIVE_DIMS[schemeNum] || NATIVE_DIMS['1'];
  const img = await loadImage(`/maps/schemes/dholera_tp${schemeNum}.jpg`);
  const outW = quality === 'print' ? 2000 : 1400;
  const outH = Math.round((outW * img.naturalHeight) / img.naturalWidth);
  const canvas = document.createElement('canvas');
  canvas.width = outW;
  canvas.height = outH;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(img, 0, 0, outW, outH);
  const px = (nx / native.w) * outW;
  const py = (ny / native.h) * outH;
  drawPin(ctx, px, py, label);
  drawCaption(ctx, label);
  const dataUrl = canvas.toDataURL('image/jpeg', quality === 'print' ? 0.9 : 0.82);
  return { view, label, dataUrl, width: outW, height: outH };
}

export interface ParcelMapInput {
  schemeNum: string;
  x: number;
  y: number;
  opX: number | null;
  opY: number | null;
  fpX: number | null;
  fpY: number | null;
  subSector: string;
  label: string;
  quality: DossierQuality;
}

export async function renderParcelSnapshots(p: ParcelMapInput): Promise<DossierSnapshot[]> {
  const dims = NATIVE_DIMS[p.schemeNum] || NATIVE_DIMS['1'];

  // Every snapshot is independent (own canvas, own tile set), but they were
  // awaited one at a time, so the whole render was 7x network + 7x JPEG
  // encode in series. Firing them at once makes the tile fetches share the
  // connection pool and lets the encodes overlap; the order is preserved so
  // the returned array keeps its original page sequence.
  const subSectorSnapshot = subSectorBounds(p.schemeNum, p.subSector)
    .catch(() => null)
    .then((box) => {
      if (box) {
        const pad = 600;
        const cx = (box.x0 + box.x1) / 2;
        const cy = (box.y0 + box.y1) / 2;
        return renderSnapshot({
          schemeNum: p.schemeNum,
          cx,
          cy,
          winW: Math.min(box.x1 - box.x0 + pad * 2, dims.w),
          winH: Math.min(box.y1 - box.y0 + pad * 2, dims.h),
          view: 'subsector',
          label: p.label,
          pins: [{ x: p.x, y: p.y, text: p.label }],
          quality: p.quality,
        });
      }
      return renderSnapshot({
        schemeNum: p.schemeNum,
        cx: p.x,
        cy: p.y,
        winW: Math.min(dims.w * 0.22, 5200),
        winH: Math.min(dims.h * 0.22, 3700),
        view: 'subsector',
        label: p.label,
        quality: p.quality,
      });
    });

  const opX = p.opX ?? p.x;
  const opY = p.opY ?? p.y;
  const fpX = p.fpX ?? p.x;
  const fpY = p.fpY ?? p.y;

  const [tpFull, subsector, zoning, exact, op, fp, zoomGrid] = await Promise.all([
    renderSchemeSnapshot(p.schemeNum, p.x, p.y, p.label, p.quality, 'tp-full'),
    subSectorSnapshot,
    renderSnapshot({
      schemeNum: p.schemeNum,
      cx: p.x,
      cy: p.y,
      winW: 2600,
      winH: 1700,
      view: 'zoning',
      label: p.label,
      quality: p.quality,
    }),
    renderSnapshot({
      schemeNum: p.schemeNum,
      cx: p.x,
      cy: p.y,
      winW: 1250,
      winH: 850,
      view: 'exact',
      label: p.label,
      quality: p.quality,
    }),
    renderSnapshot({
      schemeNum: p.schemeNum,
      cx: opX,
      cy: opY,
      winW: 1900,
      winH: 1250,
      view: 'op',
      label: `O.P · ${p.label}`,
      quality: p.quality,
    }),
    renderSnapshot({
      schemeNum: p.schemeNum,
      cx: fpX,
      cy: fpY,
      winW: 1900,
      winH: 1250,
      view: 'fp',
      label: `F.P · ${p.label}`,
      quality: p.quality,
    }),
    renderSnapshot({
      schemeNum: p.schemeNum,
      cx: p.x,
      cy: p.y,
      winW: 3200,
      winH: 2100,
      view: 'zoom-grid',
      label: `GRID · ${p.label}`,
      quality: p.quality,
    }),
  ]);

  return [tpFull, subsector, zoning, exact, op, fp, zoomGrid];
}
