/**
 * Landscape dossier page renderer (pdf-lib vector drawing).
 *
 * Draws plot-specific pages in each template's visual language:
 * covers, detail tables, tenure badges, map pages with captions,
 * DGDCR policy pages, document checklists, and QR closing pages.
 */

import { PDFDocument, PDFFont, PDFImage, PDFPage, rgb } from 'pdf-lib';
import QRCode from 'qrcode';
import type { ContentPlan, DossierBranding, DossierDocItem, DossierParcel, DossierSnapshot, DossierTheme } from './types';

export interface RenderFonts {
  regular: PDFFont;
  bold: PDFFont;
}

export interface RenderCtx {
  doc: PDFDocument;
  fonts: RenderFonts;
  theme: DossierTheme;
  footerNote: string;
  W: number;
  H: number;
  snapshots: Map<string, DossierSnapshot>;
  parcel: DossierParcel;
  docs: DossierDocItem[];
  /** Per-user branding (logo + contact). Optional — absent for anonymous users. */
  branding?: DossierBranding | null;
  /** DholeraMap site logo, embedded once and drawn in every page footer. */
  siteLogo?: PDFImage;
  /**
   * The dealer's reviewed/edited content. Only the generated Investor deck
   * reads this back; the Hebatpur/Palm pages keep drawing from the parcel.
   */
  plan?: ContentPlan;
}

export function hex(h: string): { r: number; g: number; b: number } {
  const v = h.replace('#', '');
  const n = parseInt(v.length === 3 ? v.split('').map((c) => c + c).join('') : v, 16);
  return { r: ((n >> 16) & 255) / 255, g: ((n >> 8) & 255) / 255, b: (n & 255) / 255 };
}

function C(h: string) {
  const c = hex(h);
  return rgb(c.r, c.g, c.b);
}

/** Minimum y that drawn content must stay above (branding footer clearance). */
const FLOOR_Y = 44;

export function fitFont(font: PDFFont, text: string, size: number, maxWidth: number): number {
  let s = size;
  while (s > 6 && font.widthOfTextAtSize(text, s) > maxWidth) s -= 0.5;
  return s;
}

export function cleanText(font: PDFFont, text: string): string {
  try {
    font.encodeText(text);
    return text;
  } catch {
    return text
      .replace(/₹/g, 'Rs. ')
      .replace(/✓/g, '[v]')
      .replace(/[▸▪•]/g, '-')
      .replace(/[“”]/g, '"')
      .replace(/[‘’]/g, "'")
      .replace(/[—–]/g, '-')
      .replace(/[^\x00-\xFF]/g, ' ');
  }
}

export function drawText(
  page: PDFPage,
  fonts: RenderFonts,
  text: string,
  x: number,
  y: number,
  opts: { size?: number; bold?: boolean; color?: string; maxWidth?: number; align?: 'left' | 'center' | 'right' } = {}
) {
  const font = opts.bold ? fonts.bold : fonts.regular;
  let str = String(text ?? '');
  if (!str) return;
  str = cleanText(font, str);
  let size = opts.size ?? 12;
  if (opts.maxWidth) size = fitFont(font, str, size, opts.maxWidth);
  let dx = x;
  if (opts.align === 'center') dx = x - font.widthOfTextAtSize(str, size) / 2;
  if (opts.align === 'right') dx = x - font.widthOfTextAtSize(str, size);
  page.drawText(str, { x: dx, y: y - size, font, size, color: C(opts.color || '#1c1c28') });
}

export function drawWrappedText(
  page: PDFPage,
  fonts: RenderFonts,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  opts: {
    size?: number;
    bold?: boolean;
    color?: string;
    lineHeight?: number;
    align?: 'left' | 'center' | 'right';
    maxLines?: number;
  } = {}
): number {
  const font = opts.bold ? fonts.bold : fonts.regular;
  const size = opts.size ?? 10;
  const lineHeight = opts.lineHeight ?? size * 1.35;
  const color = opts.color || '#0f172a';
  const clean = cleanText(font, text);
  const words = clean.split(/\s+/);
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const testWidth = font.widthOfTextAtSize(testLine, size);
    if (testWidth > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
      if (opts.maxLines && lines.length >= opts.maxLines) break;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine && (!opts.maxLines || lines.length < opts.maxLines)) {
    lines.push(currentLine);
  }

  let curY = y;
  for (const line of lines) {
    drawText(page, fonts, line, x, curY, {
      size,
      bold: opts.bold,
      color,
      maxWidth,
      align: opts.align,
    });
    curY -= lineHeight;
  }

  return lines.length * lineHeight;
}

const staticImageCache = new WeakMap<PDFDocument, Map<string, PDFImage>>();

/**
 * Loads and embeds an image from public static assets (e.g. /assets/dholera_intro/...)
 * Works seamlessly in both browser (via fetch) and Node.js (via fs.readFile).
 */
export async function loadStaticImage(doc: PDFDocument, urlOrPath: string): Promise<PDFImage | null> {
  let docMap = staticImageCache.get(doc);
  if (!docMap) {
    docMap = new Map();
    staticImageCache.set(doc, docMap);
  }
  if (docMap.has(urlOrPath)) {
    return docMap.get(urlOrPath)!;
  }
  try {
    let bytes: Uint8Array | null = null;
    if (typeof window === 'undefined') {
      try {
        const fs = await import('fs/promises');
        const path = await import('path');
        const localPath = path.join(process.cwd(), 'public', urlOrPath.replace(/^\//, ''));
        const buf = await fs.readFile(localPath);
        bytes = new Uint8Array(buf);
      } catch (err) {
        // fallback to fetch
      }
    }
    if (!bytes) {
      const res = await fetch(urlOrPath);
      if (!res.ok) return null;
      bytes = new Uint8Array(await res.arrayBuffer());
    }
    if (!bytes || bytes.length === 0) return null;
    let img: PDFImage;
    if (urlOrPath.toLowerCase().endsWith('.png')) {
      img = await doc.embedPng(bytes);
    } else {
      img = await doc.embedJpg(bytes);
    }
    docMap.set(urlOrPath, img);
    return img;
  } catch (err) {
    console.warn('Failed to embed static image:', urlOrPath, err);
    return null;
  }
}

export function drawContainedImage(
  page: PDFPage,
  img: PDFImage,
  x: number,
  y: number,
  w: number,
  h: number,
  opts: {
    borderColor?: string;
    borderWidth?: number;
    bgColor?: string;
  } = {}
) {
  if (opts.bgColor) {
    page.drawRectangle({ x, y, width: w, height: h, color: C(opts.bgColor) });
  }
  const s = Math.min(w / img.width, h / img.height);
  const dw = img.width * s;
  const dh = img.height * s;
  const dx = x + (w - dw) / 2;
  const dy = y + (h - dh) / 2;
  page.drawImage(img, { x: dx, y: dy, width: dw, height: dh });
  if (opts.borderColor) {
    page.drawRectangle({
      x,
      y,
      width: w,
      height: h,
      borderColor: C(opts.borderColor),
      borderWidth: opts.borderWidth ?? 1,
    });
  }
}

async function embedDataUrl(doc: PDFDocument, dataUrl: string) {
  const [head, body] = dataUrl.split(',');
  const bytes = Uint8Array.from(atob(body), (c) => c.charCodeAt(0));
  if (head.includes('image/png')) return doc.embedPng(bytes);
  return doc.embedJpg(bytes);
}

export async function drawSnapshot(
  ctx: RenderCtx,
  page: PDFPage,
  view: string,
  x: number,
  y: number,
  w: number,
  h: number,
  caption?: string
) {
  const snap = ctx.snapshots.get(view);
  const captionH = caption ? 24 : 0;
  const imgY = y;
  const imgH = h - captionH;

  page.drawRectangle({ x, y, width: w, height: h, color: C('#f8fafc') });

  let drawn = false;
  if (snap) {
    try {
      const img = await embedDataUrl(ctx.doc, snap.dataUrl);
      const s = Math.min(w / snap.width, imgH / snap.height);
      const dw = snap.width * s;
      const dh = snap.height * s;
      page.drawImage(img, { x: x + (w - dw) / 2, y: imgY + (imgH - dh) / 2, width: dw, height: dh });
      drawn = true;
    } catch (e) {
      console.warn('Failed to embed snapshot dataUrl:', e);
    }
  }

  // Robust fallback: if snapshot is not available in canvas/node, load canonical static map/diagram!
  if (!drawn) {
    const tpNum = (ctx.parcel.schemeNum || ctx.parcel.tpShort?.replace(/[^0-9]/g, '') || '1');
    let fallbackPath = `/maps/schemes/dholera_tp${tpNum}.jpg`;

    if (view === 'subsector' || view === 'zoom-grid') {
      fallbackPath = '/assets/dholera_intro/dholera_activation_area_masterplan.jpg';
    } else if (view === 'zoning') {
      fallbackPath = '/assets/dholera_intro/dholera_tp_scheme_diagram.png';
    } else if (view === 'op') {
      fallbackPath = '/assets/dholera_intro/dholera_tp_scheme_diagram.png';
    } else if (view === 'fp') {
      fallbackPath = '/assets/dholera_intro/dholera_tp_scheme_page10.png';
    } else if (view === 'exact') {
      const pColor = ctx.theme.primary.toLowerCase();
      if (pColor.includes('1e3a') || pColor.includes('green') || pColor.includes('4e87')) {
        fallbackPath = '/assets/ai_renders/dholera_3d_residential_layout_1789220629729.jpg';
      } else if (pColor.includes('1a18') || pColor.includes('gold') || pColor.includes('d4af')) {
        fallbackPath = '/assets/ai_renders/dholera_luxury_smart_city_1789220154549.jpg';
      } else if (pColor.includes('1e29') || pColor.includes('slate') || pColor.includes('blue')) {
        fallbackPath = '/assets/showcase/tata_semiconductor_fab.jpg';
      } else {
        fallbackPath = '/assets/ai_renders/dholera_3d_industrial_layout_1789220591391.jpg';
      }
    }

    const img = (await loadStaticImage(ctx.doc, fallbackPath)) ||
                (await loadStaticImage(ctx.doc, `/maps/schemes/dholera_tp1.jpg`)) ||
                (await loadStaticImage(ctx.doc, '/assets/dholera_intro/dholera_activation_area_masterplan.jpg'));
    if (img) {
      drawContainedImage(page, img, x + 2, imgY + 2, w - 4, imgH - 4, { bgColor: '#f8fafc' });
      drawn = true;
    }
  }

  page.drawRectangle({ x, y, width: w, height: h, borderColor: C(ctx.theme.primaryDark), borderWidth: 1.25 });
  if (caption) {
    page.drawRectangle({ x, y: y + h - captionH, width: w, height: captionH, color: C(ctx.theme.primaryDark) });
    drawText(page, ctx.fonts, caption, x + w / 2, y + h - 6, {
      size: 9.5, bold: true, color: '#ffffff', align: 'center', maxWidth: w - 16,
    });
  }
}

/**
 * Branding footer drawn on every generated page. Left side carries the user's
 * branding (their logo + name); the right side carries the DholeraMap brand
 * (our logo, title, and dholeramap.com). The site side always renders.
 */
export async function drawBrandingFooter(ctx: RenderCtx, page: PDFPage) {
  const { W, fonts, siteLogo } = ctx;
  const b = ctx.branding;
  const cy = 16; // vertical centre of the footer strip
  const size = 7.5;
  const ink = '#6b7280';

  // Right side first (its width bounds the left side): logo + "DholeraMap · dholeramap.com".
  const siteText = 'DholeraMap · dholeramap.com';
  let rx = W - 22;
  if (siteLogo) {
    const h = 13;
    const w = (siteLogo.width / siteLogo.height) * h;
    rx -= w;
    page.drawImage(siteLogo, { x: rx, y: cy - h / 2, width: w, height: h });
    rx -= 8;
  }
  drawText(page, fonts, siteText, rx, cy + size / 2 + 1, { size, bold: true, color: ink, align: 'right' });
  const rightBlockLeft = rx - fonts.bold.widthOfTextAtSize(siteText, size);

  // Left side: user's logo + comprehensive dealer contact details (name, company, phone, email, RERA)
  let lx = 22;
  if (b?.logoDataUrl) {
    try {
      const logo = await embedDataUrl(ctx.doc, b.logoDataUrl);
      const h = 13;
      const s = h / logo.height;
      const w = Math.min(logo.width * s, 90);
      page.drawImage(logo, { x: lx, y: cy - h / 2, width: w, height: h });
      lx += w + 8;
    } catch {
      /* user logo is optional */
    }
  }

  const parts: string[] = [];
  if (b?.name) parts.push(b.name);
  if (b?.company) parts.push(b.company);
  if (b?.phone) parts.push(b.phone);
  if (b?.email) parts.push(b.email);
  if (ctx.parcel?.reraId) parts.push(`RERA: ${ctx.parcel.reraId}`);

  const userLine = parts.filter(Boolean).join(' · ');
  if (userLine) {
    const leftMax = rightBlockLeft - lx - 16;
    if (leftMax > 40) {
      drawText(page, fonts, userLine, lx, cy + size / 2 + 1, { size, color: ink, maxWidth: leftMax });
    }
  }
}

function drawCheck(page: PDFPage, x: number, y: number, size: number, color = '#15803d') {
  page.drawLine({ start: { x, y }, end: { x: x + size * 0.4, y: y - size * 0.45 }, thickness: 2.2, color: C(color) });
  page.drawLine({ start: { x: x + size * 0.4, y: y - size * 0.45 }, end: { x: x + size, y: y + size * 0.35 }, thickness: 2.2, color: C(color) });
}

function table(
  page: PDFPage,
  fonts: RenderFonts,
  theme: DossierTheme,
  x: number,
  yTop: number,
  w: number,
  labelW: number,
  rows: [string, string][],
  opts: { size?: number; rowH?: number; labelBold?: boolean } = {}
) {
  const size = opts.size ?? 11;
  const rowH = opts.rowH ?? 26;
  let y = yTop;
  rows.forEach(([label, rawValue], i) => {
    // A trailing ' ✓' marker is drawn as a vector check (WinAnsi has no check glyph).
    let value = rawValue;
    let check = false;
    if (value.endsWith(' ✓')) {
      value = value.slice(0, -2);
      check = true;
    }
    const bg = i % 2 === 0 ? theme.panel : '#ffffff';
    page.drawRectangle({ x, y: y - rowH, width: w, height: rowH, color: C(bg), borderColor: C('#c9ccd6'), borderWidth: 0.75 });
    page.drawLine({ start: { x: x + labelW, y }, end: { x: x + labelW, y: y - rowH }, thickness: 0.75, color: C('#c9ccd6') });
    drawText(page, fonts, label, x + 10, y - 6, { size, bold: opts.labelBold ?? true, color: theme.ink, maxWidth: labelW - 20 });
    const vFont = fonts.bold;
    drawText(page, fonts, value || '—', x + labelW + 10, y - 6, { size, bold: true, color: theme.ink, maxWidth: w - labelW - (check ? 44 : 20) });
    if (check) {
      const vx = x + labelW + 14 + vFont.widthOfTextAtSize(value || '—', size);
      drawCheck(page, vx, y - 8, 11);
    }
    y -= rowH;
  });
  return y;
}

function sectionTitle(page: PDFPage, fonts: RenderFonts, theme: DossierTheme, text: string, cx: number, y: number, size = 17) {
  drawText(page, fonts, text, cx, y, { size, bold: true, color: theme.primaryDark, align: 'center', maxWidth: 700 });
  const w = fonts.bold.widthOfTextAtSize(text, size);
  page.drawLine({ start: { x: cx - w / 2, y: y - size - 4 }, end: { x: cx + w / 2, y: y - size - 4 }, thickness: 1.5, color: C(theme.accent) });
}

/* ------------------------------- HEBATPUR theme pages ------------------------------- */

export async function hebatpurCover(ctx: RenderCtx, page: PDFPage) {
  const { W, H, theme, parcel } = ctx;
  const portrait = W < H;
  page.drawRectangle({ x: 0, y: 0, width: W, height: H, color: C('#f8f9fc') });

  if (portrait) {
    // Full-width dark header with accent rule
    page.drawRectangle({ x: 0, y: H - 155, width: W, height: 155, color: C(theme.primaryDark) });
    page.drawRectangle({ x: 0, y: H - 160, width: W, height: 5, color: C(theme.accent) });
    // Left accent stripe
    page.drawRectangle({ x: 0, y: 0, width: 8, height: H, color: C(theme.accent) });
    drawText(page, ctx.fonts, 'DHOLERA SIR', 28, H - 32, { size: 11, bold: true, color: theme.accent, maxWidth: W - 48 });
    drawText(page, ctx.fonts, `${parcel.village.toUpperCase()} — ${parcel.surveyNo}`, 26, H - 80, {
      size: 30, bold: true, color: '#ffffff', maxWidth: W - 48,
    });
    const zoneLabel = (parcel.zone || 'INDUSTRIAL').toUpperCase().split('—')[0].trim();
    page.drawRectangle({ x: 26, y: H - 140, width: Math.min(zoneLabel.length * 10 + 28, W - 56), height: 30, color: C(theme.accent) });
    drawText(page, ctx.fonts, zoneLabel.slice(0, 28), 40, H - 118, { size: 13, bold: true, color: theme.primaryDark, maxWidth: W - 80 });
    // Stat grid (2×2)
    const stats: [string, string][] = [
      ['TP SCHEME', parcel.tpShort],
      ['SURVEY NO.', parcel.surveyNo],
      ['FINAL PLOT', parcel.finalPlot],
      ['AREA', parcel.areaSqYd ? `${parcel.areaSqYd.toLocaleString('en-IN')} sq.yd` : '—'],
    ];
    const sw = (W - 48) / 2;
    stats.forEach(([label, value], i) => {
      const sx = 24 + (i % 2) * (sw + 8);
      const sy = H - 190 - Math.floor(i / 2) * 58;
      page.drawRectangle({ x: sx, y: sy - 46, width: sw, height: 46, color: C(theme.panel), borderColor: C('#d0d5e0'), borderWidth: 0.75 });
      page.drawRectangle({ x: sx, y: sy - 4, width: sw, height: 4, color: C(theme.accent) });
      drawText(page, ctx.fonts, label, sx + 10, sy - 16, { size: 7.5, bold: true, color: theme.muted, maxWidth: sw - 20 });
      drawText(page, ctx.fonts, value, sx + 10, sy - 36, { size: 13, bold: true, color: theme.ink, maxWidth: sw - 16 });
    });
    const snapY = H - 200 - 2 * 58 - 12;
    const snapH = Math.max(60, snapY - FLOOR_Y - 10);
    await drawSnapshot(ctx, page, 'tp-full', 24, FLOOR_Y + 8, W - 48, snapH, `${parcel.village.toUpperCase()} ${parcel.surveyNo}`);
    return;
  }

  // ── Landscape: left dark panel + right map ────────────────────────────────
  const panelW = W * 0.42;
  page.drawRectangle({ x: 0, y: 0, width: panelW, height: H, color: C(theme.primaryDark) });
  page.drawRectangle({ x: panelW, y: 0, width: 6, height: H, color: C(theme.accent) });

  drawText(page, ctx.fonts, 'DHOLERA SIR', 38, H - 38, { size: 11, bold: true, color: theme.accent, maxWidth: panelW - 60 });
  drawText(page, ctx.fonts, `${parcel.village.toUpperCase()}`, 36, H - 84, {
    size: 38, bold: true, color: '#ffffff', maxWidth: panelW - 60,
  });
  drawText(page, ctx.fonts, `SURVEY ${parcel.surveyNo}`, 36, H - 124, {
    size: 20, bold: true, color: '#7a95be', maxWidth: panelW - 60,
  });

  const zoneLabel = (parcel.zone || 'INDUSTRIAL').toUpperCase().split('—')[0].trim();
  page.drawRectangle({ x: 36, y: H - 172, width: Math.min(zoneLabel.length * 10 + 24, panelW - 60), height: 32, color: C(theme.accent) });
  drawText(page, ctx.fonts, zoneLabel.slice(0, 26), 48, H - 149, { size: 14, bold: true, color: theme.primaryDark, maxWidth: panelW - 90 });

  // Four stat blocks
  const stats: [string, string, string][] = [
    ['T.P. SCHEME', parcel.tpShort, ''],
    ['SURVEY NO.', parcel.surveyNo, ''],
    ['FINAL PLOT', parcel.finalPlot, ''],
    ['F.P. AREA', parcel.areaSqYd ? `${parcel.areaSqYd.toLocaleString('en-IN')}` : '—', 'sq. yards'],
  ];
  const sw = (panelW - 84) / 2;
  stats.forEach(([label, value, sub], i) => {
    const sx = 36 + (i % 2) * (sw + 12);
    const sy = H - 202 - Math.floor(i / 2) * 68;
    page.drawRectangle({ x: sx, y: sy - 56, width: sw, height: 56, color: C('#0e2d4e'), borderColor: C('#1e4060'), borderWidth: 0.75 });
    page.drawRectangle({ x: sx, y: sy - 4, width: sw, height: 4, color: C(theme.accent) });
    drawText(page, ctx.fonts, label, sx + 10, sy - 18, { size: 7, bold: true, color: '#5a7fa0', maxWidth: sw - 20 });
    drawText(page, ctx.fonts, value, sx + 10, sy - 40, { size: 14, bold: true, color: '#ffffff', maxWidth: sw - 16 });
    if (sub) drawText(page, ctx.fonts, sub, sx + 10, sy - 54, { size: 7.5, color: '#4a6880', maxWidth: sw - 16 });
  });

  // Road + price row
  let rowY = H - 202 - 2 * 68 - 12;
  page.drawLine({ start: { x: 36, y: rowY + 2 }, end: { x: panelW - 36, y: rowY + 2 }, thickness: 0.75, color: C('#1e4060') });
  rowY -= 16;
  drawText(page, ctx.fonts, `Road: ${parcel.roadWidthM} m  ·  FAR: ${parcel.maxFAR}  ·  ${parcel.tenure || 'Title Clear'}`, 36, rowY, {
    size: 9, color: '#6b8aaa', maxWidth: panelW - 72,
  });
  if (parcel.price) {
    rowY -= 22;
    drawText(page, ctx.fonts, parcel.price, 36, rowY, { size: 12, bold: true, color: theme.accent, maxWidth: panelW - 72 });
  }

  // Footer note on panel
  drawText(page, ctx.fonts, 'Verify all statutory values with DSIRDA.', 36, FLOOR_Y + 14, {
    size: 7.5, color: '#4a6880', maxWidth: panelW - 60,
  });

  // Right side: full-height map
  await drawSnapshot(ctx, page, 'tp-full', panelW + 10, FLOOR_Y, W - panelW - 18, H - FLOOR_Y - 6,
    `${parcel.village.toUpperCase()}  ·  SURVEY ${parcel.surveyNo}`);
}

export async function hebatpurProperty(ctx: RenderCtx, page: PDFPage) {
  const { W, H, theme, parcel } = ctx;
  const portrait = W < H;
  page.drawRectangle({ x: 0, y: 0, width: W, height: H, color: C('#ffffff') });
  page.drawRectangle({ x: 0, y: 0, width: W, height: 44, color: C('#dfe9f5') });
  const propRows: [string, string][] = [
    ['District', parcel.district],
    ['Taluka', parcel.taluka],
    ['Village', parcel.village],
    ['Tenure', parcel.tenure ? `${parcel.tenure}${parcel.naStatus ? ` (${parcel.naStatus})` : ''}` : '—'],
    ['Zoning', parcel.zone.split('—')[0].trim() || '—'],
    ['T.P.', parcel.tpShort],
    ['F.P. Road', parcel.fpRoad],
    ['Survey No.', `${parcel.surveyNo} ✓`],
    ['Final Plot No.', `${parcel.finalPlot} ✓`],
    ['F.P. Sq. Yrds.', `${parcel.areaSqYd ? parcel.areaSqYd.toLocaleString('en-IN') : '—'} ✓`],
  ];
  const legal = ['Paper Notice', 'Title Clear Certificate', 'Certified Entries', 'Zoning Certificate', 'Development Plan', 'Town Planning', 'Non Agriculture (N.A.)', 'Registry', '7/12 Entry (Mutation)'];
  if (portrait) {
    // Stack the two tables full-width; side-by-side is too cramped on a page.
    sectionTitle(page, ctx.fonts, theme, 'PROPERTY DETAILS', W / 2, H - 40, 15);
    table(page, ctx.fonts, theme, 30, H - 74, W - 60, 150, propRows, { size: 10.5, rowH: 28 });
    sectionTitle(page, ctx.fonts, theme, 'LEGAL PROCESS', W / 2, H - 404, 15);
    table(page, ctx.fonts, theme, 30, H - 438, W - 60, 150, legal.map((l) => ['', l] as [string, string]), { size: 10.5, rowH: 28, labelBold: false });
    return;
  }
  sectionTitle(page, ctx.fonts, theme, 'PROPERTY DETAILS', W * 0.25, H - 28, 16);
  sectionTitle(page, ctx.fonts, theme, 'LEGAL PROCESS', W * 0.75, H - 28, 16);
  table(page, ctx.fonts, theme, 30, H - 60, W * 0.44, 150, propRows, { size: 10.5, rowH: 30 });
  table(page, ctx.fonts, theme, W * 0.53, H - 60, W * 0.42, 40, legal.map((l) => ['✓', l] as [string, string]), { size: 10.5, rowH: 30, labelBold: true });
}

export async function hebatpurLand(ctx: RenderCtx, page: PDFPage) {
  const { W, H, theme, parcel } = ctx;
  page.drawRectangle({ x: 0, y: 0, width: W, height: H, color: C('#ffffff') });
  page.drawRectangle({ x: 0, y: 0, width: 8, height: H, color: C(theme.banner) });
  page.drawRectangle({ x: W - 8, y: 0, width: 8, height: H, color: C(theme.banner) });
  const px = W * 0.33, py = H - 60, pw = W * 0.6, ph = H - 250;
  page.drawRectangle({ x: px, y: py - ph, width: pw, height: ph, color: C('#ffffff'), borderColor: C(theme.banner), borderWidth: 6 });
  const rows: [string, string][] = [
    ['VILLAGE NAME', parcel.village.toUpperCase()],
    ['NEW SURVEY NO.', parcel.surveyNo],
    ['FP NO.', parcel.finalPlot],
    ['TP', parcel.tpShort],
    ['ZONING', parcel.zone.split('—')[0].trim() || '—'],
    ['AREA', parcel.areaSqYd ? `${parcel.areaSqYd.toLocaleString('en-IN')} Sq. Yards` : '—'],
    ['ROAD', parcel.fpRoad],
  ];
  let y = py - 38;
  for (const [k, v] of rows) {
    drawText(page, ctx.fonts, k, px + 30, y, { size: 13, bold: true, color: '#2c2c34', maxWidth: 200 });
    drawText(page, ctx.fonts, ':', px + 240, y, { size: 13, bold: true, color: '#2c2c34' });
    drawText(page, ctx.fonts, v, px + 260, y, { size: 14, bold: true, color: theme.ink, maxWidth: pw - 280 });
    y -= 34;
  }
  const badges: string[] = [
    parcel.tenure ? `TITLE CLEAR LAND · ${parcel.tenure.toUpperCase()}` : 'TITLE CLEAR LAND',
    parcel.naStatus ? `FREE HOLD REGISTRY · ${parcel.naStatus.toUpperCase()}` : 'FREE HOLD REGISTRY',
  ];
  let bwy = py - ph - 20;
  for (const badgeText of badges) {
    page.drawRectangle({
      x: px,
      y: bwy - 36,
      width: pw,
      height: 36,
      color: C(theme.ink),
      borderColor: C(theme.banner),
      borderWidth: 2,
    });
    drawText(page, ctx.fonts, badgeText, px + pw / 2, bwy - 12, {
      size: 13,
      bold: true,
      color: '#ffffff',
      align: 'center',
      maxWidth: pw - 30,
    });
    bwy -= 46;
  }
  drawText(page, ctx.fonts, 'LAND', 120, H - 240, { size: 30, bold: true, color: theme.ink, maxWidth: 220 });
  drawText(page, ctx.fonts, 'DETAILS', 120, H - 280, { size: 30, bold: true, color: theme.ink, maxWidth: 220 });
}

export async function hebatpurTpLocation(ctx: RenderCtx, page: PDFPage) {
  const { W, H } = ctx;
  page.drawRectangle({ x: 0, y: 0, width: W, height: H, color: C('#ffffff') });
  await drawSnapshot(ctx, page, 'tp-full', 40, 30, W - 80, H - 60, `${ctx.parcel.village.toUpperCase()} ${ctx.parcel.surveyNo}`);
}

export async function hebatpurZoning(ctx: RenderCtx, page: PDFPage) {
  const { W, H, theme, parcel } = ctx;
  page.drawRectangle({ x: 0, y: 0, width: W, height: H, color: C('#ffffff') });
  sectionTitle(page, ctx.fonts, theme, 'ZONING', W / 2, H - 24, 20);
  page.drawRectangle({ x: 20, y: H - 130, width: W * 0.34, height: 84, color: C('#bcd7f5'), borderColor: C(theme.primary), borderWidth: 1 });
  const stats = [`New Survey No. - ${parcel.surveyNo}`, `Final Plot - ${parcel.finalPlot}`, `Sq. Yards. - ${parcel.areaSqYd ? parcel.areaSqYd.toLocaleString('en-IN') : '—'}`];
  let sy = H - 58;
  for (const s of stats) {
    drawText(page, ctx.fonts, s, 32, sy, { size: 12, bold: true, color: '#111', maxWidth: W * 0.32 });
    sy -= 24;
  }
  await drawSnapshot(ctx, page, 'subsector', 20, 30, W * 0.36, H - 190, `${parcel.subSector || parcel.tpShort}`);
  await drawSnapshot(ctx, page, 'zoning', W * 0.4, 30, W * 0.57, H - 90, `SURVEY ${parcel.surveyNo}`);
}

export async function hebatpurOpFp(ctx: RenderCtx, page: PDFPage) {
  const { W, H } = ctx;
  page.drawRectangle({ x: 0, y: 0, width: W, height: H, color: C('#ffffff') });
  await drawSnapshot(ctx, page, 'op', 20, 40, W * 0.46, H - 120, 'O.P SNAPSHOT');
  await drawSnapshot(ctx, page, 'fp', W * 0.52, 40, W * 0.46, H - 120, 'F.P SNAPSHOT');
  page.drawLine({ start: { x: W * 0.48, y: H / 2 }, end: { x: W * 0.52, y: H / 2 }, thickness: 2.5, color: C('#111111') });
}

export async function hebatpurZoomGrid(ctx: RenderCtx, page: PDFPage) {
  const { W, H } = ctx;
  page.drawRectangle({ x: 0, y: 0, width: W, height: H, color: C('#ffffff') });
  const cells: [string, string][] = [['tp-full', 'TP VIEW'], ['subsector', 'ZONE VIEW'], ['zoning', 'SECTOR ZOOM'], ['exact', 'EXACT PLOT']];
  const cw = (W - 60) / 2, ch = (H - 60) / 2;
  for (let i = 0; i < cells.length; i++) {
    const [view, cap] = cells[i];
    const x = 20 + (i % 2) * (cw + 20);
    const y = 20 + (i < 2 ? ch + 20 : 0);
    await drawSnapshot(ctx, page, view, x, y, cw, ch, `${cap} · ${ctx.parcel.surveyNo}`);
  }
}

/* ------------------------------- shared system pages ------------------------------- */

export async function dgdcrPage(ctx: RenderCtx, page: PDFPage) {
  const { W, H, theme, parcel } = ctx;
  page.drawRectangle({ x: 0, y: 0, width: W, height: H, color: C('#f8f9fc') });
  // Header
  page.drawRectangle({ x: 0, y: H - 6, width: W, height: 6, color: C(theme.accent) });
  page.drawRectangle({ x: 0, y: H - 58, width: W, height: 52, color: C(theme.primaryDark) });
  drawText(page, ctx.fonts, 'DEVELOPMENT CONTROL & REGULATORY FRAMEWORK', W / 2, H - 18, {
    size: 16, bold: true, color: '#ffffff', align: 'center', maxWidth: W - 60,
  });
  drawText(page, ctx.fonts, `${parcel.statutoryTable || 'DGDCR statutory controls'}  ·  ${parcel.legalStatus}`, W / 2, H - 44, {
    size: 9, color: '#7a95be', align: 'center', maxWidth: W - 80,
  });

  // ── Left: full policy table ──────────────────────────────────────────────
  const leftW = W * 0.55;
  table(page, ctx.fonts, theme, 28, H - 74, leftW - 20, 190, [
    ['Village / TP', `${parcel.village}  ·  ${parcel.tpShort}${parcel.subSector ? `  ·  ${parcel.subSector}` : ''}`],
    ['Survey / Final Plot', `Survey ${parcel.surveyNo}  ·  FP ${parcel.finalPlot}`],
    ['Land use zone', parcel.zone || '—'],
    ['Permitted uses', (parcel.permittedUses || '—').slice(0, 120)],
    ['Road frontage', `${parcel.roadWidthM} m (${parcel.roadWidthFt} ft)  ·  ${parcel.roadClass}`],
    ['Access', parcel.accessNote],
    ['Setbacks', parcel.setbacks || '—'],
    ['Max building length', parcel.maxBuildingLength],
    ['Plot area', parcel.areaSqM ? `${parcel.areaSqM.toLocaleString('en-IN')} sq.m  (${parcel.areaSqYd.toLocaleString('en-IN')} sq.yd)` : '—'],
    ...(parcel.jantriRatePerSqM ? [['Jantri rate', `₹${parcel.jantriRatePerSqM.toLocaleString('en-IN')} / sq. m`] as [string, string]] : []),
  ], { size: 9.5, rowH: 28 });

  // ── Right: quick-reference stat cards ───────────────────────────────────
  const rx = leftW + 16;
  const rw = W - rx - 28;
  const cards: [string, string, string, string][] = [
    ['Max FAR', String(parcel.maxFAR), `Chargeable ${parcel.chargeableFAR}`, theme.accent],
    ['Max Height', parcel.heightDesc || String(parcel.maxHeightM || '—'), 'as per DGDCR', theme.primaryDark],
    ['Ground Coverage', `${parcel.groundCoveragePct || '—'}`, parcel.footprintSqM ? `${parcel.footprintSqM.toLocaleString('en-IN')} sq.m footprint` : 'of plot area', '#15803d'],
    ['Road Frontage', `${parcel.roadWidthM} m`, parcel.roadClass.split(' ').slice(0, 3).join(' ') || 'TP road', '#0369a1'],
  ];
  const cardH = Math.min(76, (H - 74 - FLOOR_Y - 14 - (cards.length - 1) * 10) / cards.length);
  let cy = H - 74;
  for (const [label, value, sub, accent] of cards) {
    page.drawRectangle({ x: rx, y: cy - cardH, width: rw, height: cardH, color: C('#ffffff'), borderColor: C('#d5dbe6'), borderWidth: 0.75 });
    page.drawRectangle({ x: rx, y: cy - 5, width: rw, height: 5, color: C(accent) });
    drawText(page, ctx.fonts, label.toUpperCase(), rx + 12, cy - 18, { size: 7.5, bold: true, color: theme.muted, maxWidth: rw - 24 });
    drawText(page, ctx.fonts, value, rx + 12, cy - 46, { size: 18, bold: true, color: theme.primaryDark, maxWidth: rw - 20 });
    drawText(page, ctx.fonts, sub, rx + 12, cy - cardH + 8, { size: 8, color: theme.muted, maxWidth: rw - 20 });
    cy -= cardH + 10;
  }

  drawText(page, ctx.fonts, 'Values reflect the app information panel and statutory tables on record; confirm with DSIRDA before design or transaction.', 28, FLOOR_Y + 14, {
    size: 8, color: theme.muted, maxWidth: W - 56,
  });
}

export async function documentsPage(ctx: RenderCtx, page: PDFPage) {
  const { W, H, theme } = ctx;
  page.drawRectangle({ x: 0, y: 0, width: W, height: H, color: C('#ffffff') });
  sectionTitle(page, ctx.fonts, theme, 'DOCUMENTS & LEGAL CHECKLIST', W / 2, H - 30, 17);
  if (!ctx.docs.length) {
    drawText(page, ctx.fonts, 'No documents attached to this saved plot yet. Attach sale deed, 7/12, mutation, NOC, or site photos from the dashboard vault.', 60, H - 90, {
      size: 12, color: theme.muted, maxWidth: W - 120,
    });
    return;
  }
  const rows = ctx.docs.slice(0, 12).map((d) => [
    `${d.typeLabel} — ${d.name}`,
    `${new Date(d.uploadedAt).toLocaleDateString('en-IN')} · ${(d.size / 1024).toFixed(0)} KB${d.notes ? ` · ${d.notes}` : ''}`,
  ] as [string, string]);
  table(page, ctx.fonts, theme, 40, H - 70, W - 80, W - 340, rows, { size: 10, rowH: 30 });
}

export async function closingPage(ctx: RenderCtx, page: PDFPage) {
  const { W, H, theme, parcel } = ctx;
  const b = ctx.branding;
  page.drawRectangle({ x: 0, y: 0, width: W, height: H, color: C(theme.primaryDark) });
  // Accent top bar
  page.drawRectangle({ x: 0, y: H - 5, width: W, height: 5, color: C(theme.accent) });
  // Left accent stripe
  page.drawRectangle({ x: 0, y: 0, width: 6, height: H, color: C(theme.accent) });

  // ── Parcel identity ──────────────────────────────────────────────────────
  drawText(page, ctx.fonts, `${parcel.village.toUpperCase()}  ·  SURVEY ${parcel.surveyNo}  ·  FP ${parcel.finalPlot}`, W / 2, H - 34, {
    size: 18, bold: true, color: '#ffffff', align: 'center', maxWidth: W - 80,
  });
  drawText(page, ctx.fonts, `${parcel.areaSqYd ? parcel.areaSqYd.toLocaleString('en-IN') : '—'} sq.yd  ·  ${parcel.tpShort}${parcel.price ? `  ·  ${parcel.price}` : ''}`, W / 2, H - 62, {
    size: 12, color: '#e8b54d', align: 'center', maxWidth: W - 80,
  });

  // ── QR code (centred) ────────────────────────────────────────────────────
  try {
    const qrUrl = await QRCode.toDataURL(parcel.verifyUrl, { margin: 1, width: 280 });
    const [, body] = qrUrl.split(',');
    const bytes = Uint8Array.from(atob(body), (c) => c.charCodeAt(0));
    const qr = await ctx.doc.embedPng(bytes);
    const qs = 155;
    page.drawImage(qr, { x: W / 2 - qs / 2, y: H / 2 - 20, width: qs, height: qs });
  } catch {
    /* QR optional */
  }
  drawText(page, ctx.fonts, 'Scan to verify this plot on the live interactive map', W / 2, H / 2 - 22, {
    size: 10, color: '#9fd0ff', align: 'center', maxWidth: W - 80,
  });
  drawText(page, ctx.fonts, parcel.verifyUrl, W / 2, H / 2 - 40, { size: 8.5, color: '#6b8aaa', align: 'center', maxWidth: W - 80 });

  // ── Divider ──────────────────────────────────────────────────────────────
  const divY = H / 2 - 55;
  page.drawLine({ start: { x: 80, y: divY }, end: { x: W - 80, y: divY }, thickness: 0.75, color: C('#1e3a5f') });

  // ── Dealer contact block ─────────────────────────────────────────────────
  if (b && (b.name || b.phone || b.email)) {
    const contactY = divY - 18;
    const colA = W / 2 - 120;
    const colB = W / 2 + 20;
    drawText(page, ctx.fonts, 'YOUR AGENT', colA, contactY, { size: 7.5, bold: true, color: '#4a6880', maxWidth: 200 });
    let lineY = contactY - 20;
    if (b.name) {
      drawText(page, ctx.fonts, b.name, colA, lineY, { size: 13, bold: true, color: '#ffffff', maxWidth: 200 });
      lineY -= 18;
    }
    if (b.company) {
      drawText(page, ctx.fonts, b.company, colA, lineY, { size: 9.5, color: '#7a95be', maxWidth: 200 });
      lineY -= 16;
    }
    if (b.tagline) {
      drawText(page, ctx.fonts, b.tagline, colA, lineY, { size: 8.5, color: '#4a6880', maxWidth: 200 });
    }
    let cY = contactY - 20;
    if (b.phone) {
      drawText(page, ctx.fonts, b.phone, colB, cY, { size: 11, bold: true, color: '#ffffff', maxWidth: 180 });
      cY -= 18;
    }
    if (b.email) {
      drawText(page, ctx.fonts, b.email, colB, cY, { size: 9, color: '#7a95be', maxWidth: 180 });
      cY -= 16;
    }
    if (parcel.reraId) {
      drawText(page, ctx.fonts, `RERA: ${parcel.reraId}`, colB, cY, { size: 8.5, color: '#4a6880', maxWidth: 180 });
    }
  }

  // ── Legal disclaimer ─────────────────────────────────────────────────────
  drawText(page, ctx.fonts, 'Independent due-diligence dossier. Verify title, 7/12, FP allotment, and DGDCR controls with statutory authorities before transacting.', 48, 70, {
    size: 8.5, color: '#4a5568', maxWidth: W - 96,
  });
  drawText(page, ctx.fonts, ctx.footerNote, 48, 46, { size: 7.5, color: '#374151', maxWidth: W - 96 });
}

/* ------------------------------- PALM theme pages ------------------------------- */

export async function palmCover(ctx: RenderCtx, page: PDFPage) {
  const { W, H, theme, parcel } = ctx;
  page.drawRectangle({ x: 0, y: 0, width: W, height: H, color: C('#ffffff') });
  page.drawRectangle({ x: 0, y: H - 120, width: W, height: 120, color: C(theme.panel) });
  drawText(page, ctx.fonts, 'Palm Greens', W / 2, H - 40, { size: 30, bold: true, color: theme.primaryDark, align: 'center' });
  drawText(page, ctx.fonts, 'P l a t i n u m - 2', W / 2, H - 70, { size: 14, bold: true, color: theme.primary, align: 'center' });
  drawText(page, ctx.fonts, 'Premium Residential Plot', W / 2, H - 100, { size: 13, color: theme.muted, align: 'center' });
  await drawSnapshot(ctx, page, 'tp-full', 60, 120, W - 120, H - 280, `Final Plot ${parcel.finalPlot} · Old ${parcel.oldSurveyNo || parcel.surveyNo} · TP-${parcel.tpShort.replace(/[^0-9]/g, '') || parcel.schemeNum}`);
  page.drawRectangle({ x: 60, y: 60, width: W - 120, height: 44, color: C(theme.accent) });
  drawText(page, ctx.fonts, `Final Plot No: ${parcel.finalPlot} · Old ${parcel.oldSurveyNo || parcel.surveyNo} · TP-${parcel.tpShort.replace(/[^0-9]/g, '') || parcel.schemeNum}`, W / 2, 92, {
    size: 13, bold: true, color: '#ffffff', align: 'center', maxWidth: W - 160,
  });
}

export async function palmHighlights(ctx: RenderCtx, page: PDFPage) {
  const { W, H, theme, parcel } = ctx;
  page.drawRectangle({ x: 0, y: 0, width: W, height: H, color: C('#ffffff') });
  sectionTitle(page, ctx.fonts, theme, 'PROJECT HIGHLIGHTS', W / 2, H - 30, 17);
  const left: [string, string][] = [
    [`${parcel.roadWidthM} Meter TP Road`, parcel.roadClass],
    ['Plot Identity', `FP ${parcel.finalPlot} · Survey ${parcel.surveyNo}`],
    ['Area', parcel.areaSqYd ? `${parcel.areaSqYd.toLocaleString('en-IN')} sq.yd (${parcel.areaSqM.toLocaleString('en-IN')} sq.m)` : '—'],
    ['Zone', parcel.zone || '—'],
    ['Tenure', parcel.tenure || '—'],
  ];
  const right: [string, string][] = [
    ['Access', parcel.accessNote],
    ['FAR / Height', `${parcel.maxFAR} FAR · ${parcel.heightDesc || parcel.maxHeightM || '—'}`],
    ['Coverage / Setbacks', `${parcel.groundCoveragePct || '—'} · ${parcel.setbacks || '—'}`],
    ['Price', parcel.price || 'On request'],
    ['Facing', parcel.facing || '—'],
  ];
  table(page, ctx.fonts, theme, 40, H - 70, (W - 100) / 2, 130, left, { size: 10, rowH: 34 });
  table(page, ctx.fonts, theme, 60 + (W - 100) / 2, H - 70, (W - 100) / 2, 150, right, { size: 10, rowH: 34 });
  drawText(page, ctx.fonts, parcel.description || 'Premium residential plotting inside Dholera SIR with planned TP road access and trunk infrastructure.', 40, 90, {
    size: 10.5, color: theme.muted, maxWidth: W - 80,
  });
}

export async function palmLocation(ctx: RenderCtx, page: PDFPage) {
  const { W, H, theme } = ctx;
  page.drawRectangle({ x: 0, y: 0, width: W, height: H, color: C('#ffffff') });
  sectionTitle(page, ctx.fonts, theme, 'LOCATION ADVANTAGE', W / 2, H - 30, 17);
  await drawSnapshot(ctx, page, 'subsector', 40, H / 2 - 10, (W - 100) / 2, H / 2 - 60, 'PROJECT LOCATION');
  await drawSnapshot(ctx, page, 'exact', 60 + (W - 100) / 2, H / 2 - 10, (W - 100) / 2, H / 2 - 60, `FP ${ctx.parcel.finalPlot}`);
  table(page, ctx.fonts, theme, 40, H / 2 - 40, W - 80, 200, [
    ['TP road', `${ctx.parcel.roadWidthM} m · ${ctx.parcel.roadClass}`],
    ['FP / Survey', `FP ${ctx.parcel.finalPlot} · Survey ${ctx.parcel.surveyNo}`],
    ['Village / TP', `${ctx.parcel.village} · ${ctx.parcel.tpShort}`],
  ], { size: 10, rowH: 30 });
}
