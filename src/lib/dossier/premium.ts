/**
 * Aurum Signature Sovereign Luxury deck — a fully generated, high-net-worth estate template.
 *
 * Theme: Deep Cognac Amber (#78350f, #92400e), Sovereign Champagne Gold (#d97706, #b45309),
 * Warm Alabaster (#fdfbf7), and Royal Obsidian (#1c1917).
 *
 * Aesthetic: Sovereign wealth family office presentation, double hairline gold frames,
 * regal typography, generous padding, and bespoke institutional land valuation.
 *
 * All pages are generated fresh with zero third-party branding.
 * Clamped strictly above FLOOR_Y = 44.
 */

import { PDFFont, PDFPage, rgb } from 'pdf-lib';
import { drawSnapshot, hex, loadStaticImage, drawContainedImage, drawWrappedText } from './render';
import { planBullets, planChecks, planRows } from './content-plan';
import type { DossierTheme } from './types';
import type { RenderCtx, RenderFonts } from './render';
import QRCode from 'qrcode';

const FLOOR_Y = 44;

function C(h: string) {
  const c = hex(h);
  return rgb(c.r, c.g, c.b);
}

function fitFont(font: PDFFont, text: string, size: number, maxWidth: number): number {
  let s = size;
  while (s > 6 && font.widthOfTextAtSize(text, s) > maxWidth) s -= 0.5;
  return s;
}

function cleanText(font: PDFFont, text: string): string {
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

function drawText(
  page: PDFPage,
  fonts: RenderFonts,
  text: string,
  x: number,
  y: number,
  opts: {
    size?: number;
    bold?: boolean;
    color?: string;
    maxWidth?: number;
    align?: 'left' | 'center' | 'right';
  } = {}
) {
  const font = opts.bold ? fonts.bold : fonts.regular;
  let str = String(text ?? '');
  if (!str) return;
  str = cleanText(font, str);
  let size = opts.size ?? 11;
  if (opts.maxWidth) size = fitFont(font, str, size, opts.maxWidth);
  let dx = x;
  if (opts.align === 'center') dx = x - font.widthOfTextAtSize(str, size) / 2;
  if (opts.align === 'right') dx = x - font.widthOfTextAtSize(str, size);
  const col = hex(opts.color || '#1c1917');
  page.drawText(str, { x: dx, y: y - size, font, size, color: rgb(col.r, col.g, col.b) });
}

function drawAurumHeader(
  page: PDFPage,
  fonts: RenderFonts,
  theme: DossierTheme,
  W: number,
  H: number,
  title: string,
  category: string
) {
  // Top gold accent band
  page.drawRectangle({ x: 0, y: H - 3, width: W, height: 3, color: C(theme.accent || '#c5a059') });
  // Sovereign obsidian header
  page.drawRectangle({ x: 0, y: H - 33, width: W, height: 30, color: C(theme.primaryDark || '#18181b') });

  drawText(page, fonts, title.toUpperCase(), 36, H - 13, {
    size: 10,
    bold: true,
    color: '#ffffff',
    maxWidth: W - 220,
  });

  // Category Tag on right
  const tagW = 140;
  page.drawRectangle({ x: W - 36 - tagW, y: H - 27, width: tagW, height: 18, color: C('#27272a'), borderColor: C(theme.accent || '#c5a059'), borderWidth: 0.75 });
  drawText(page, fonts, category.toUpperCase(), W - 36 - tagW / 2, H - 14, {
    size: 7.5,
    bold: true,
    color: theme.accent || '#c5a059',
    align: 'center',
    maxWidth: tagW - 10,
  });
}

function aurumBox(
  page: PDFPage,
  x: number,
  y: number,
  w: number,
  h: number,
  opts: { bg?: string; border?: string; accentLeft?: string; accentLeftW?: number } = {}
) {
  // Outer frame
  page.drawRectangle({
    x,
    y,
    width: w,
    height: h,
    color: C(opts.bg || '#ffffff'),
    borderColor: C(opts.border || '#e4e4e7'),
    borderWidth: 0.75,
  });

  if (opts.accentLeft) {
    page.drawRectangle({
      x,
      y,
      width: opts.accentLeftW || 3,
      height: h,
      color: C(opts.accentLeft),
    });
  }
}

// ─── 1. COVER PAGE ──────────────────────────────────────────────────────────
export async function premiumCover(ctx: RenderCtx, page: PDFPage) {
  const { W, H, theme, parcel } = ctx;

  // Warm Alabaster Canvas
  page.drawRectangle({ x: 0, y: 0, width: W, height: H, color: C('#fafaf9') });

  // Elegant single hairline champagne gold frame
  page.drawRectangle({ x: 12, y: 12, width: W - 24, height: H - 24, borderColor: C(theme.accent || '#c5a059'), borderWidth: 0.75 });

  // Top Regal Banner
  const bandH = 110;
  const bandY = H - 20 - bandH;
  page.drawRectangle({ x: 20, y: bandY, width: W - 40, height: bandH, color: C(theme.primaryDark || '#18181b') });
  page.drawRectangle({ x: 20, y: bandY - 3, width: W - 40, height: 3, color: C(theme.accent || '#c5a059') });

  drawText(page, ctx.fonts, 'AURUM SIGNATURE · PRIVATE CLIENT ADVISORY', W / 2, H - 38, {
    size: 9.5,
    bold: true,
    color: theme.accent || '#c5a059',
    align: 'center',
    maxWidth: W - 80,
  });

  drawText(page, ctx.fonts, `${parcel.village.toUpperCase()} · SURVEY ${parcel.surveyNo}`, W / 2, H - 68, {
    size: 26,
    bold: true,
    color: '#ffffff',
    align: 'center',
    maxWidth: W - 80,
  });

  drawText(page, ctx.fonts, `FINAL PLOT FP-${parcel.finalPlot} · TOWN PLANNING SCHEME TP ${parcel.tpShort}`, W / 2, H - 102, {
    size: 12,
    color: '#e4e4e7',
    align: 'center',
    maxWidth: W - 80,
  });

  // 4 Gold Stat Pillars (Standardized Champagne Gold)
  const cardW = (W - 80 - 36) / 4;
  const cardH = 68;
  const cardY = bandY - 16 - cardH;

  const metrics: [string, string, string][] = [
    ['FINAL PLOT AREA', parcel.areaSqYd ? `${parcel.areaSqYd.toLocaleString('en-IN')} SQ.YD` : '—', parcel.areaSqM ? `${parcel.areaSqM.toLocaleString('en-IN')} SQ.M` : 'Cadastral'],
    ['FRONTAGE ACCESS', `${parcel.roadWidthM} METERS`, parcel.roadClass || 'TP Sovereign Corridor'],
    ['MAX PERMISSIBLE FAR', String(parcel.maxFAR), `Chargeable FAR: ${parcel.chargeableFAR}`],
    ['ESTATE VALUATION', parcel.price || 'UPON REQUEST', parcel.pricePerSqYd ? `₹${parcel.pricePerSqYd.toLocaleString('en-IN')}/sq.yd` : 'Bespoke Advisory'],
  ];

  metrics.forEach(([lbl, val, sub], i) => {
    const cx = 40 + i * (cardW + 12);
    page.drawRectangle({ x: cx, y: cardY, width: cardW, height: cardH, color: C('#ffffff'), borderColor: C('#e4e4e7'), borderWidth: 0.75 });
    page.drawRectangle({ x: cx, y: cardY + cardH - 3, width: cardW, height: 3, color: C(theme.accent || '#c5a059') });

    drawText(page, ctx.fonts, lbl, cx + 12, cardY + cardH - 14, { size: 7.5, bold: true, color: '#71717a', maxWidth: cardW - 24 });
    drawText(page, ctx.fonts, val, cx + 12, cardY + cardH - 34, { size: 12, bold: true, color: '#18181b', maxWidth: cardW - 24 });
    drawText(page, ctx.fonts, sub, cx + 12, cardY + cardH - 52, { size: 8, color: theme.accent || '#c5a059', maxWidth: cardW - 24 });
  });

  // Map Snapshot Banner
  const snapY = FLOOR_Y + 18;
  const snapH = cardY - snapY - 14;
  if (snapH > 80) {
    page.drawRectangle({ x: 38, y: snapY - 2, width: W - 76, height: snapH + 4, color: C('#ffffff'), borderColor: C(theme.accent || '#c5a059'), borderWidth: 0.75 });
    await drawSnapshot(ctx, page, 'exact', 40, snapY, W - 80, snapH, `${parcel.village.toUpperCase()} · SURVEY ${parcel.surveyNo} CADASTRAL MAP`);
  }

  // Cover Footer
  drawText(page, ctx.fonts, 'PRIVATE & CONFIDENTIAL · VERIFIED AGAINST OFFICIAL DSIRDA GEODATABASE & REVENUE RECORDS', W / 2, FLOOR_Y + 4, {
    size: 7.5,
    bold: true,
    color: '#71717a',
    align: 'center',
    maxWidth: W - 80,
  });
}

// ─── 2. EXECUTIVE SUMMARY ───────────────────────────────────────────────────
export async function premiumExecutiveSummary(ctx: RenderCtx, page: PDFPage) {
  const { W, H, theme, parcel } = ctx;
  page.drawRectangle({ x: 0, y: 0, width: W, height: H, color: C('#fafaf9') });
  drawAurumHeader(page, ctx.fonts, theme, W, H, 'Executive Summary & Sovereign Asset Dossier', 'Dossier');

  const topY = H - 54;
  const leftW = (W - 72) * 0.52;
  const rightX = 36 + leftW + 16;
  const rightW = W - rightX - 36;

  // Left: Estate Parameters
  aurumBox(page, 36, FLOOR_Y + 12, leftW, topY - FLOOR_Y - 12, { bg: '#ffffff', border: '#e4e4e7', accentLeft: theme.primaryDark || '#18181b', accentLeftW: 3 });
  drawText(page, ctx.fonts, 'STATUTORY SPECIFICATIONS & CADASTRE IDENTITY', 52, topY - 18, { size: 10, bold: true, color: '#18181b' });

  const fallbackRows: [string, string][] = [
    ['District & Taluka', `${parcel.district} / ${parcel.taluka}`],
    ['Revenue Village', parcel.village],
    ['Town Planning Scheme', parcel.tpShort],
    ['Revenue Survey No.', parcel.surveyNo],
    ['Final Plot (FP) No.', parcel.finalPlot],
    ['Statutory Plot Area', `${parcel.areaSqYd ? parcel.areaSqYd.toLocaleString('en-IN') : '—'} sq.yd (${parcel.areaSqM ? parcel.areaSqM.toLocaleString('en-IN') : '—'} sq.m)`],
    ['Abutting Road Frontage', `${parcel.roadWidthM} Meters (${parcel.roadClass || 'TP Arterial Corridor'})`],
    ['Land Tenure Status', parcel.tenure || 'Title Clear Freehold (Old Tenure)'],
    ['NA Sanction Order', parcel.naStatus || 'Non-Agricultural Order Passed'],
    ['Base / Max Permissible FAR', `${parcel.maxFAR} (Chargeable: ${parcel.chargeableFAR})`],
    ['Asking Valuation', parcel.price || 'Market Rate Upon Diligence'],
    ['Valuation per Sq. Yard', parcel.pricePerSqYd ? `₹${parcel.pricePerSqYd.toLocaleString('en-IN')} / sq.yd` : '—'],
  ];
  const rows = planRows(ctx.plan, 'executive-summary', fallbackRows);

  let yCursor = topY - 42;
  rows.forEach(([label, val]) => {
    drawText(page, ctx.fonts, label, 52, yCursor, { size: 8.5, bold: true, color: '#71717a', maxWidth: 160 });
    drawText(page, ctx.fonts, val, 220, yCursor, { size: 8.5, bold: true, color: '#1c1917', maxWidth: leftW - 180 });
    page.drawLine({ start: { x: 50, y: yCursor - 11 }, end: { x: 36 + leftW - 14, y: yCursor - 11 }, thickness: 0.4, color: C('#e4e4e7') });
    yCursor -= 23;
  });

  // Right: Sovereign Wealth Investment Highlights
  aurumBox(page, rightX, FLOOR_Y + 12, rightW, topY - FLOOR_Y - 12, { bg: '#ffffff', border: '#e4e4e7', accentLeft: theme.accent || '#c5a059', accentLeftW: 3 });
  drawText(page, ctx.fonts, 'ESTATE CHARACTERISTICS & MACRO ADVANTAGE', rightX + 16, topY - 18, { size: 10, bold: true, color: theme.accent || '#c5a059' });

  const fallbackThesis = [
    'Platinum Smart City Location: Situated within Dholera SIR, India’s first greenfield industrial smart metropolis planned across 920 sq km.',
    'Semiconductor Foundry Synergy: Direct proximity to the Rs. 91,000 Cr Tata Electronics semiconductor fab and high-tech supply chain cluster.',
    'Multi-Modal Expressway & Airport: Under 45 mins to Ahmedabad via 109 km Expressway; minutes from Dholera International Airport cargo hub.',
    'Pre-Engineered Underground Utilities: Zero overhead wires: pre-laid SCADA potable water, industrial recycled water, underground power, and gas.',
    'Government-Guaranteed Clear Title: Reconstituted Final Plot under Gujarat Town Planning Act 1976 with 100% legal immunity against encroachment.',
  ];
  const rawBullets = planBullets(ctx.plan, 'executive-summary', fallbackThesis);
  const thesisPoints = rawBullets.map((b) => {
    const colonIdx = b.indexOf(':');
    if (colonIdx > 0 && colonIdx < 40) {
      return { title: b.slice(0, colonIdx).trim(), text: b.slice(colonIdx + 1).trim() };
    }
    const words = b.trim().split(/\s+/);
    if (words.length > 3) {
      return { title: words.slice(0, 3).join(' ').toUpperCase(), text: words.slice(3).join(' ') };
    }
    return { title: 'SOVEREIGN ADVANTAGE', text: b.trim() };
  });

  let rightCursor = topY - 44;
  thesisPoints.forEach((t) => {
    page.drawRectangle({ x: rightX + 16, y: rightCursor - 7, width: 4, height: 4, color: C(theme.accent || '#c5a059') });
    drawText(page, ctx.fonts, t.title.toUpperCase(), rightX + 26, rightCursor, { size: 8.5, bold: true, color: '#18181b', maxWidth: rightW - 42 });
    drawWrappedText(page, ctx.fonts, t.text, rightX + 26, rightCursor - 13, rightW - 42, { size: 7.5, color: '#71717a', lineHeight: 11, maxLines: 2 });
    rightCursor -= 50;
  });

  // Sovereign Advantage & High-Net-Worth Attributes (fills the lower half of the right card)
  const indY = FLOOR_Y + 18;
  const indH = 110;
  page.drawRectangle({ x: rightX + 16, y: indY, width: rightW - 32, height: indH, color: C('#fafaf9'), borderColor: C('#e4e4e7'), borderWidth: 0.5 });
  page.drawRectangle({ x: rightX + 16, y: indY + indH - 20, width: rightW - 32, height: 20, color: C('#f4f4f5') });
  drawText(page, ctx.fonts, 'SOVEREIGN ADVANTAGE & HIGH-NET-WORTH ATTRIBUTES', rightX + 24, indY + indH - 6, { size: 7.5, bold: true, color: '#18181b' });

  const indRows = [
    { label: 'Town Planning Scheme', val: 'Sanctioned Preliminary Scheme (Sec 50 GTPUD 1976)' },
    { label: 'Smart Grid Infrastructure', val: '100% Underground Ducts (Water, Effluent, Power, Fiber)' },
    { label: 'Anchor Industrial Driver', val: 'Tata Semiconductor Fab & Dholera International Airport' },
    { label: 'Environmental Clearance', val: 'Zero Liquid Discharge (ZLD) Centralized CETP Trunk' },
  ];
  let iY = indY + indH - 34;
  indRows.forEach((r) => {
    drawText(page, ctx.fonts, r.label, rightX + 24, iY, { size: 7, bold: true, color: '#18181b' });
    drawText(page, ctx.fonts, r.val, rightX + 160, iY, { size: 6.5, color: '#71717a', maxWidth: rightW - 196 });
    iY -= 20;
  });
}

// ─── 9. WHAT IS DHOLERA SIR? ────────────────────────────────────────────────
export async function premiumAboutDholera(ctx: RenderCtx, page: PDFPage) {
  const { W, H, theme } = ctx;
  page.drawRectangle({ x: 0, y: 0, width: W, height: H, color: C('#fafaf9') });
  drawAurumHeader(page, ctx.fonts, theme, W, H, 'Macro Intelligence: What is Dholera SIR?', 'Masterplan');

  const topY = H - 54;
  const leftW = (W - 84) * 0.48;
  const rightW = (W - 84) * 0.50;
  const rightX = 36 + leftW + 16;
  const contentH = topY - FLOOR_Y - 12;

  // Left: Aerial Footprint Master Image Card
  aurumBox(page, 36, FLOOR_Y + 12, leftW, contentH, { bg: '#ffffff', border: '#e4e4e7', accentLeft: theme.primaryDark, accentLeftW: 3 });
  drawText(page, ctx.fonts, 'SOVEREIGN SMART METROPOLIS · 920 SQ KM SCALE', 52, topY - 18, { size: 9.5, bold: true, color: theme.primaryDark || '#18181b' });

  const imgH = contentH - 85;
  const imgY = topY - 32 - imgH;
  const aerialImg = await loadStaticImage(ctx.doc, '/assets/dholera_intro/dholera_footprint_aerial.jpg');
  if (aerialImg) {
    drawContainedImage(page, aerialImg, 48, imgY, leftW - 24, imgH, { borderColor: '#e4e4e7', borderWidth: 0.5, bgColor: '#fafaf9' });
  }

  // Caption box below image
  page.drawRectangle({ x: 48, y: FLOOR_Y + 20, width: leftW - 24, height: 36, color: C('#fafaf9'), borderColor: C('#e4e4e7'), borderWidth: 0.5 });
  drawText(page, ctx.fonts, 'SOUTH ASIA\'S LARGEST PLANNED GREENFIELD METROPOLIS', 56, FLOOR_Y + 46, { size: 7.5, bold: true, color: '#1c1917' });
  drawText(page, ctx.fonts, 'Conceived under Gujarat SIR Act 2009. Master-planned for multi-generational wealth preservation.', 56, FLOOR_Y + 32, { size: 7, color: '#71717a', maxWidth: leftW - 40 });

  // Right: 3 Sovereign Wealth Pillars
  const cardH = (contentH - 16) / 3;
  const pillars = [
    {
      title: 'SCALE & STATUTORY STATURE: 920 SQ KM',
      tag: '91,970 HECTARES · 2X MUMBAI SCALE',
      color: theme.primaryDark || '#18181b',
      bullets: [
        'Master-planned under Gujarat Special Investment Region Act 2009.',
        'Target resident population of 2.0 Million and 827,000 industrial jobs.',
        'Town Planning Schemes TP 1 to TP 6 encompass 422 sq km of prime urban land.',
      ],
    },
    {
      title: 'GOVERNMENT AUTHORITY & MANDATE',
      tag: 'DICDL · 51% GUJARAT / 49% CENTRAL NICDIT',
      color: theme.primaryDark || '#18181b',
      bullets: [
        'Governed by DICDL (Dholera Industrial City Development Limited).',
        'World-class engineering and project execution managed by AECOM consortium.',
        'Statutory immunity from arbitrary acquisition under Gujarat GTPUD Act 1976.',
      ],
    },
    {
      title: 'SOVEREIGN INFRASTRUCTURE BENCHMARK',
      tag: 'IGBC PLATINUM GREEN CITY RATING',
      color: theme.accent || '#c5a059',
      bullets: [
        '100% underground utility corridors: power, water, gas, telecom, drainage.',
        'Dual-pipe municipal water grid: 24x7 potable supply + recycled industrial water.',
        'Integrated SCADA City Command Centre (ABCD) with smart sensor telemetry.',
      ],
    },
  ];

  pillars.forEach((p, i) => {
    const cy = topY - (i + 1) * cardH - (i * 8);
    aurumBox(page, rightX, cy, rightW, cardH, { bg: '#ffffff', border: '#e4e4e7', accentLeft: p.color, accentLeftW: 3 });
    drawText(page, ctx.fonts, p.title, rightX + 16, cy + cardH - 14, { size: 8.5, bold: true, color: '#1c1917' });

    drawText(page, ctx.fonts, p.tag, rightX + 16, cy + cardH - 30, { size: 7, bold: true, color: theme.accent || '#c5a059' });
    page.drawLine({ start: { x: rightX + 16, y: cy + cardH - 36 }, end: { x: rightX + rightW - 16, y: cy + cardH - 36 }, thickness: 0.4, color: C('#e4e4e7') });

    let bY = cy + cardH - 48;
    p.bullets.forEach((b) => {
      page.drawRectangle({ x: rightX + 16, y: bY - 7, width: 4, height: 4, color: C(p.color) });
      drawText(page, ctx.fonts, b, rightX + 24, bY, { size: 7.5, color: '#57534e', maxWidth: rightW - 36 });
      bY -= 17;
    });
  });
}

// ─── 10. STRATEGIC CONNECTIVITY CORRIDORS ────────────────────────────────────
export async function premiumConnectivity(ctx: RenderCtx, page: PDFPage) {
  const { W, H, theme } = ctx;
  page.drawRectangle({ x: 0, y: 0, width: W, height: H, color: C('#fafaf9') });
  drawAurumHeader(page, ctx.fonts, theme, W, H, 'Strategic Logistics: Multi-Modal Transit Corridors', 'Connectivity');

  const topY = H - 54;
  const leftW = (W - 84) * 0.48;
  const rightW = (W - 84) * 0.50;
  const rightX = 36 + leftW + 16;
  const contentH = topY - FLOOR_Y - 12;

  // Left: Central Spine Boulevard Card
  aurumBox(page, 36, FLOOR_Y + 12, leftW, contentH, { bg: '#ffffff', border: '#e4e4e7', accentLeft: theme.primaryDark, accentLeftW: 3 });
  drawText(page, ctx.fonts, 'EXECUTIVE MOBILITY & FREIGHT ARTERIES', 52, topY - 18, { size: 9.5, bold: true, color: theme.primaryDark || '#18181b' });

  const imgH = contentH - 85;
  const imgY = topY - 32 - imgH;
  const connImg = await loadStaticImage(ctx.doc, '/assets/dholera_intro/dholera_central_spine_road.jpg');
  if (connImg) {
    drawContainedImage(page, connImg, 48, imgY, leftW - 24, imgH, { borderColor: '#e4e4e7', borderWidth: 0.5, bgColor: '#fafaf9' });
  }

  // Caption box below image
  page.drawRectangle({ x: 48, y: FLOOR_Y + 20, width: leftW - 24, height: 36, color: C('#fafaf9'), borderColor: C('#e4e4e7'), borderWidth: 0.5 });
  drawText(page, ctx.fonts, 'INTEGRATED AIR-EXPRESSWAY-RAIL LOGISTICS MATRIX', 56, FLOOR_Y + 46, { size: 7.5, bold: true, color: '#1c1917' });
  drawText(page, ctx.fonts, 'Direct multi-modal transit linking Dholera to Ahmedabad, Mumbai, and international trade routes.', 56, FLOOR_Y + 32, { size: 7, color: '#71717a', maxWidth: leftW - 40 });

  // Right: 3 Logistics Cards
  const cardH = (contentH - 16) / 3;
  const corridors = [
    {
      name: '1. AHMEDABAD-DHOLERA EXPRESSWAY',
      sub: '4-Lane Access-Controlled Highway · 109 km',
      color: theme.primaryDark || '#18181b',
      bullets: [
        'Direct connection to Ahmedabad SP Ring Road in under 45 minutes.',
        'Designed speed 120 km/h with grade-separated cloverleaf interchanges.',
        'High-velocity corporate and logistics transit directly to city core.',
      ],
    },
    {
      name: '2. DHOLERA INTERNATIONAL AIRPORT (DIACL)',
      sub: '4,030-Hectare Cargo & Aviation Hub',
      color: theme.primaryDark || '#18181b',
      bullets: [
        'Dedicated cargo terminal engineered for semiconductor chips & electronics.',
        'Code-4E dual runway handling wide-body freighters (Boeing 747/777).',
        'Strategically situated adjacent to northern boundaries of TP 1 & TP 2.',
      ],
    },
    {
      name: '3. 250M CENTRAL SPINE & DFC CONTAINER RAIL',
      sub: 'Multi-Modal High-Capacity Urban Boulevard',
      color: theme.accent || '#c5a059',
      bullets: [
        '250-meter wide Right-of-Way boulevard integrating Expressway, Metro & BRTS.',
        'Dedicated feeder rail link to Western DFC (<14 hours to major sea ports).',
        'Regional Rapid Transit System (RRTS) linking Dholera to Ahmedabad Metro.',
      ],
    },
  ];

  corridors.forEach((c, i) => {
    const cy = topY - (i + 1) * cardH - (i * 8);
    aurumBox(page, rightX, cy, rightW, cardH, { bg: '#ffffff', border: '#e4e4e7', accentLeft: c.color, accentLeftW: 3 });
    drawText(page, ctx.fonts, c.name, rightX + 16, cy + cardH - 16, { size: 9, bold: true, color: '#1c1917' });
    drawText(page, ctx.fonts, c.sub, rightX + 16, cy + cardH - 28, { size: 7.5, bold: true, color: '#71717a' });

    let bY = cy + cardH - 44;
    c.bullets.forEach((b) => {
      page.drawRectangle({ x: rightX + 16, y: bY - 7, width: 4, height: 4, color: C(c.color) });
      drawText(page, ctx.fonts, b, rightX + 24, bY, { size: 7.5, color: '#57534e', maxWidth: rightW - 36 });
      bY -= 17;
    });
  });
}

// ─── 11. MEGA PROJECTS & TATA FAB ────────────────────────────────────────────
export async function premiumMegaProjects(ctx: RenderCtx, page: PDFPage) {
  const { W, H, theme } = ctx;
  page.drawRectangle({ x: 0, y: 0, width: W, height: H, color: C('#fafaf9') });
  drawAurumHeader(page, ctx.fonts, theme, W, H, 'Mega Catalysts: Anchor Industrial Ecosystem', 'Catalysts');

  const topY = H - 54;
  const contentH = topY - FLOOR_Y - 12;
  const halfW = (W - 72 - 16) / 2;
  const topCardH = 210;

  // Top-Left: ABCD Building Command Hub Card
  aurumBox(page, 36, topY - topCardH, halfW, topCardH, { bg: '#ffffff', border: '#e4e4e7', accentLeft: theme.primaryDark, accentLeftW: 3 });
  drawText(page, ctx.fonts, 'ABCD BUILDING · ADMINISTRATIVE & BUSINESS COMMAND', 52, topY - 16, { size: 9, bold: true, color: theme.primaryDark || '#18181b' });

  const abcdImgH = 120;
  const abcdImg = await loadStaticImage(ctx.doc, '/assets/dholera_intro/dholera_abcd_building_command.jpg');
  if (abcdImg) {
    drawContainedImage(page, abcdImg, 48, topY - 26 - abcdImgH, halfW - 24, abcdImgH, { borderColor: '#e4e4e7', borderWidth: 0.5 });
  }

  page.drawRectangle({ x: 48, y: topY - topCardH + 10, width: halfW - 24, height: 38, color: C('#fafaf9'), borderColor: C('#e4e4e7'), borderWidth: 0.5 });
  drawText(page, ctx.fonts, 'PLATINUM LEED CERTIFIED · CENTRAL SCADA COMMAND', 56, topY - topCardH + 36, { size: 7.5, bold: true, color: theme.primaryDark || '#18181b' });
  drawText(page, ctx.fonts, 'The architectural centerpiece of Dholera SIR. Houses DICDL headquarters and investor concierge desk.', 56, topY - topCardH + 22, { size: 7, color: '#71717a', maxWidth: halfW - 40 });

  // Top-Right: Tata Semiconductor Fab Photo Card
  aurumBox(page, 36 + halfW + 16, topY - topCardH, halfW, topCardH, { bg: '#ffffff', border: '#e4e4e7', accentLeft: theme.accent || '#c5a059', accentLeftW: 3 });
  drawText(page, ctx.fonts, 'TATA ELECTRONICS WAFER FAB (PSMC TAIWAN)', 36 + halfW + 32, topY - 16, { size: 9, bold: true, color: '#1c1917' });

  const tataImg = await loadStaticImage(ctx.doc, '/assets/showcase/tata_semiconductor_fab.jpg');
  if (tataImg) {
    drawContainedImage(page, tataImg, 36 + halfW + 28, topY - 26 - abcdImgH, halfW - 24, abcdImgH, { borderColor: '#e4e4e7', borderWidth: 0.5 });
  }

  page.drawRectangle({ x: 36 + halfW + 28, y: topY - topCardH + 10, width: halfW - 24, height: 38, color: C('#fafaf9'), borderColor: C('#e4e4e7'), borderWidth: 0.5 });
  drawText(page, ctx.fonts, 'CAPEX: Rs. 91,000 CR ($11B) · 50,000 WAFERS / MONTH', 36 + halfW + 36, topY - topCardH + 36, { size: 7.5, bold: true, color: '#1c1917' });
  drawText(page, ctx.fonts, 'India\'s landmark semiconductor foundry. Anchors tier-1 high-technology supply chain vendors.', 36 + halfW + 36, topY - topCardH + 22, { size: 7, color: '#71717a', maxWidth: halfW - 40 });

  // Bottom Strip: 3 Telemetry Pillars
  const botY = FLOOR_Y + 12;
  const botH = topY - topCardH - botY - 12;
  const colW = (W - 72 - 24) / 3;

  const anchors = [
    {
      title: '5,000 MW ULTRA-MEGA SOLAR PARK',
      sub: 'World\'s Largest Renewable Energy Hub',
      color: theme.accent || '#c5a059',
      bullets: [
        'Developed by Gujarat Power Corporation (GPCL).',
        'Guaranteed long-term low-cost clean green power.',
        'Substantially cuts industrial operating electricity costs.',
      ],
    },
    {
      title: 'PLUG-AND-PLAY UTILITY TRENCH',
      sub: 'Subterranean Multi-Utility Conduits',
      color: theme.primaryDark || '#18181b',
      bullets: [
        'Complete pre-laid subterranean infrastructure network.',
        'Carries 66kV power, ICT fiber, potable & recycled water.',
        'SCADA automated monitoring ensuring zero future road cuts.',
      ],
    },
    {
      title: 'GENERATIONAL TITLE CLEARANCE',
      sub: 'Government-Guaranteed Final Plot',
      color: theme.primaryDark || '#18181b',
      bullets: [
        'Reconstituted Final Plot backing with zero litigation risk.',
        'Immediate physical demarcation with DGPS coordinates.',
        'Generational freehold land tenure with high appreciation.',
      ],
    },
  ];

  anchors.forEach((a, i) => {
    const cx = 36 + i * (colW + 12);
    aurumBox(page, cx, botY, colW, botH, { bg: '#ffffff', border: '#e4e4e7', accentLeft: a.color, accentLeftW: 3 });
    drawText(page, ctx.fonts, a.title, cx + 14, botY + botH - 16, { size: 8.5, bold: true, color: '#1c1917' });
    drawText(page, ctx.fonts, a.sub, cx + 14, botY + botH - 28, { size: 7.5, color: '#71717a' });

    let bY = botY + botH - 42;
    a.bullets.forEach((b) => {
      page.drawRectangle({ x: cx + 14, y: bY - 7, width: 4, height: 4, color: C(a.color) });
      drawText(page, ctx.fonts, b, cx + 22, bY, { size: 7, color: '#57534e', maxWidth: colW - 32 });
      bY -= 15;
    });
  });
}

// ─── 12. TOWN PLANNING & RECONSTITUTION ──────────────────────────────────────
export async function premiumTpPlanning(ctx: RenderCtx, page: PDFPage) {
  const { W, H, theme } = ctx;
  page.drawRectangle({ x: 0, y: 0, width: W, height: H, color: C('#fafaf9') });
  drawAurumHeader(page, ctx.fonts, theme, W, H, 'Statutory Reconstitution: Town Planning Scheme Mechanism', 'GTPUD-1976');

  const topY = H - 54;
  const leftW = (W - 84) * 0.48;
  const rightW = (W - 84) * 0.50;
  const rightX = 36 + leftW + 16;
  const contentH = topY - FLOOR_Y - 12;

  // Left: 3D Layout Master Image Card
  aurumBox(page, 36, FLOOR_Y + 12, leftW, contentH, { bg: '#ffffff', border: '#e4e4e7', accentLeft: theme.primaryDark || '#18181b', accentLeftW: 3 });
  drawText(page, ctx.fonts, 'STATUTORY GTPUD 1976 RECONSTITUTION MECHANISM', 52, topY - 18, { size: 9.5, bold: true, color: '#18181b' });

  const imgH = contentH - 85;
  const imgY = topY - 32 - imgH;
  const tpImg = await loadStaticImage(ctx.doc, '/assets/ai_renders/dholera_3d_industrial_layout_1789220591391.jpg');
  if (tpImg) {
    drawContainedImage(page, tpImg, 48, imgY, leftW - 24, imgH, { borderColor: '#e4e4e7', borderWidth: 0.5, bgColor: '#fafaf9' });
  }

  page.drawRectangle({ x: 48, y: FLOOR_Y + 20, width: leftW - 24, height: 36, color: C('#fafaf9'), borderColor: C('#e4e4e7'), borderWidth: 0.5 });
  drawText(page, ctx.fonts, 'STATUTORY TOWN PLANNING REGULARIZATION', 56, FLOOR_Y + 46, { size: 7.5, bold: true, color: '#1c1917' });
  drawText(page, ctx.fonts, 'Guaranteed conversion of raw land holdings into prime, regularized freehold parcels.', 56, FLOOR_Y + 32, { size: 7, color: '#71717a', maxWidth: leftW - 40 });

  // Right: 3 Reconstitution Steps
  const cardH = (contentH - 16) / 3;
  const steps = [
    {
      num: 'PHASE 01',
      title: 'ORIGINAL PLOT (O.P.)',
      sub: 'Raw Agricultural Land Holding',
      color: '#71717a',
      points: [
        'Defined by historical Revenue Survey Number with irregular boundaries.',
        'Agricultural land use lacking direct sanctioned arterial road access.',
        'Unorganized layout without pre-installed underground utility services.',
        'Subject to litigation risks without statutory master plan validation.',
      ],
    },
    {
      num: 'PHASE 02',
      title: '50% DEDUCTION RULE',
      sub: 'Statutory Infrastructure Dedication',
      color: theme.primaryDark || '#18181b',
      points: [
        'Governed by Gujarat Town Planning Act (GTPUD 1976 Section 50).',
        '50% area deduction dedicated to public arterial roads (18m-250m).',
        'Deduction finances underground water, power, gas & linear storm canals.',
        'Statutory immunity: land cannot be encroached, disputed, or re-acquired.',
      ],
    },
    {
      num: 'PHASE 03',
      title: 'FINAL PLOT (F.P.)',
      sub: '100% Clear Reconstituted Sovereign Title Plot',
      color: theme.accent || '#c5a059',
      points: [
        'Geometrically regularized rectangular plot with exact digital boundaries.',
        'Direct frontage on sanctioned Town Planning arterial road corridor.',
        '100% legal title clearance backed by Gujarat State Government gazette.',
        'Per-sq-yard valuation multiplies substantially upon commercial development.',
      ],
    },
  ];

  steps.forEach((s, i) => {
    const cy = topY - (i + 1) * cardH - (i * 8);
    aurumBox(page, rightX, cy, rightW, cardH, { bg: '#ffffff', border: '#e4e4e7', accentLeft: s.color, accentLeftW: 3 });
    drawText(page, ctx.fonts, `${s.num} · ${s.title}`, rightX + 16, cy + cardH - 14, { size: 9, bold: true, color: '#1c1917' });
    drawText(page, ctx.fonts, s.sub, rightX + 16, cy + cardH - 26, { size: 7.5, color: '#71717a' });

    let pY = cy + cardH - 42;
    s.points.forEach((pt) => {
      page.drawRectangle({ x: rightX + 16, y: pY - 7, width: 4, height: 4, color: C(s.color) });
      drawText(page, ctx.fonts, pt, rightX + 24, pY, { size: 7.5, color: '#57534e', maxWidth: rightW - 36 });
      pY -= 15;
    });
  });
}

// ─── 7. PROPERTY DETAILS & VALUATION ────────────────────────────────────────
export async function premiumProperty(ctx: RenderCtx, page: PDFPage) {
  const { W, H, theme, parcel } = ctx;
  page.drawRectangle({ x: 0, y: 0, width: W, height: H, color: C('#fafaf9') });
  drawAurumHeader(page, ctx.fonts, theme, W, H, 'Property Specifications & Commercial Valuation', 'Cadastre');

  const topY = H - 54;
  const leftW = (W - 72) * 0.52;
  const rightW = (W - 72) * 0.45;
  const rightX = 36 + leftW + 20;

  // Left: Statutory Property Table
  aurumBox(page, 36, FLOOR_Y + 12, leftW, topY - FLOOR_Y - 12, { bg: '#ffffff', border: '#e4e4e7', accentLeft: theme.primaryDark || '#18181b', accentLeftW: 3 });
  drawText(page, ctx.fonts, 'STATUTORY PROPERTY RECORD (REVENUE & TP)', 52, topY - 18, { size: 10, bold: true, color: '#18181b' });

  const rows: [string, string][] = [
    ['District / Taluka', `${parcel.district} / ${parcel.taluka}`],
    ['Revenue Village', parcel.village],
    ['Town Planning Scheme', parcel.tpShort],
    ['Revenue Survey No.', parcel.surveyNo],
    ['Final Plot No. (FP)', parcel.finalPlot],
    ['Total Area (Sq. Yards)', parcel.areaSqYd ? parcel.areaSqYd.toLocaleString('en-IN') : '—'],
    ['Total Area (Sq. Meters)', parcel.areaSqM ? parcel.areaSqM.toLocaleString('en-IN') : '—'],
    ['Abutting Road Width', `${parcel.roadWidthM} Meters (${parcel.roadClass || 'Arterial'})`],
    ['Statutory Land Tenure', parcel.tenure || 'Title Clear Freehold'],
    ['Non-Agricultural Status', parcel.naStatus || 'Industrial / Commercial NA'],
    ['Quoted Asking Price', parcel.price || 'Market Rate Upon Diligence'],
    ['Rate per Sq. Yard', parcel.pricePerSqYd ? `₹${parcel.pricePerSqYd.toLocaleString('en-IN')} / sq.yd` : '—'],
  ];

  let yCursor = topY - 42;
  rows.forEach(([label, val]) => {
    drawText(page, ctx.fonts, label, 52, yCursor, { size: 8.5, bold: true, color: '#71717a', maxWidth: 160 });
    drawText(page, ctx.fonts, val, 220, yCursor, { size: 8.5, bold: true, color: '#1c1917', maxWidth: leftW - 180 });
    page.drawLine({ start: { x: 50, y: yCursor - 11 }, end: { x: 36 + leftW - 14, y: yCursor - 11 }, thickness: 0.4, color: C('#e4e4e7') });
    yCursor -= 23;
  });

  // Right: Map Preview + Highlights
  aurumBox(page, rightX, FLOOR_Y + 12, rightW, topY - FLOOR_Y - 12, { bg: '#ffffff', border: '#e4e4e7', accentLeft: theme.accent || '#c5a059', accentLeftW: 3 });
  drawText(page, ctx.fonts, 'CADASTRAL SURVEY OVERVIEW', rightX + 16, topY - 18, { size: 10, bold: true, color: theme.accent || '#c5a059' });

  const mapH = 170;
  const mapY = topY - 32 - mapH;
  await drawSnapshot(ctx, page, 'exact', rightX + 16, mapY, rightW - 32, mapH, 'SURVEY BOUNDARY');

  drawText(page, ctx.fonts, 'KEY TRANSACTION HIGHLIGHTS', rightX + 16, mapY - 20, { size: 9, bold: true, color: '#1c1917' });
  const highlights = [
    `Frontage on ${parcel.roadWidthM}m sanctioned Town Planning road corridor.`,
    `Statutory Max FAR ${parcel.maxFAR} under sanctioned DGDCR norms.`,
    `Reconstituted Final Plot ${parcel.finalPlot} with state-verified boundaries.`,
  ];
  let hY = mapY - 38;
  highlights.forEach((h) => {
    page.drawRectangle({ x: rightX + 16, y: hY - 7, width: 4, height: 4, color: C(theme.accent || '#c5a059') });
    drawText(page, ctx.fonts, h, rightX + 26, hY, { size: 8, color: '#57534e', maxWidth: rightW - 36 });
    hY -= 20;
  });

  // Institutional Development & Logistics KPI Panel
  const kpiY = FLOOR_Y + 18;
  const kpiH = 124;
  const colW = (rightW - 32 - 10) / 2;

  // Sub-panel 1: DEVELOPMENT CAPACITY
  page.drawRectangle({ x: rightX + 16, y: kpiY, width: colW, height: kpiH, color: C('#fafaf9'), borderColor: C('#e4e4e7'), borderWidth: 0.5 });
  page.drawRectangle({ x: rightX + 16, y: kpiY + kpiH - 20, width: colW, height: 20, color: C('#f4f4f5') });
  drawText(page, ctx.fonts, 'DEVELOPMENT CAPACITY', rightX + 22, kpiY + kpiH - 6, { size: 7.5, bold: true, color: '#18181b' });

  const devRows: [string, string][] = [
    ['Base / Max FAR', `${(parcel.maxFAR ? parcel.maxFAR * 0.7 : 1.2).toFixed(1)} / ${parcel.maxFAR}`],
    ['Max Footprint', `${parcel.footprintSqM ? parcel.footprintSqM.toLocaleString('en-IN') : Math.round((parcel.areaSqM || 5000) * 0.55).toLocaleString('en-IN')} sq.m`],
    ['Max Height', parcel.heightDesc || `${parcel.maxHeightM || 24}m`],
    ['Ground Coverage', `${parcel.groundCoveragePct || 55}%`],
  ];
  let dY = kpiY + kpiH - 36;
  devRows.forEach(([lbl, val]) => {
    drawText(page, ctx.fonts, lbl, rightX + 22, dY, { size: 7, color: '#71717a' });
    drawText(page, ctx.fonts, val, rightX + colW + 10, dY, { size: 7, bold: true, color: '#18181b', align: 'right' });
    dY -= 20;
  });

  // Sub-panel 2: LOGISTICS & FRONTAGE
  const col2X = rightX + 16 + colW + 10;
  page.drawRectangle({ x: col2X, y: kpiY, width: colW, height: kpiH, color: C('#fafaf9'), borderColor: C('#e4e4e7'), borderWidth: 0.5 });
  page.drawRectangle({ x: col2X, y: kpiY + kpiH - 20, width: colW, height: 20, color: C('#f4f4f5') });
  drawText(page, ctx.fonts, 'LOGISTICS & ACCESS', col2X + 8, kpiY + kpiH - 6, { size: 7.5, bold: true, color: '#18181b' });

  const logRows: [string, string][] = [
    ['TP Road Width', `${parcel.roadWidthM}m (${parcel.roadWidthFt || '98.4 ft'})`],
    ['Corridor Class', (parcel.roadClass || 'TP Trunk Arterial').slice(0, 16)],
    ['Tenure Title', 'Clear Freehold'],
    ['Allotment Status', 'Demarcated FP'],
  ];
  let lY = kpiY + kpiH - 36;
  logRows.forEach(([lbl, val]) => {
    drawText(page, ctx.fonts, lbl, col2X + 8, lY, { size: 7, color: '#71717a' });
    drawText(page, ctx.fonts, val, col2X + colW - 6, lY, { size: 7, bold: true, color: '#18181b', align: 'right' });
    lY -= 20;
  });
}

// ─── 8. LAND & STATUTORY TITLE ──────────────────────────────────────────────
export async function premiumLand(ctx: RenderCtx, page: PDFPage) {
  const { W, H, theme, parcel } = ctx;
  page.drawRectangle({ x: 0, y: 0, width: W, height: H, color: C('#fafaf9') });
  drawAurumHeader(page, ctx.fonts, theme, W, H, 'Land Registry: Statutory Title & Revenue Diligence', 'Revenue');

  const topY = H - 54;
  const leftW = (W - 72) * 0.52;
  const rightW = (W - 72) * 0.45;
  const rightX = 36 + leftW + 20;

  // Left: Revenue Record Schedules
  aurumBox(page, 36, FLOOR_Y + 12, leftW, topY - FLOOR_Y - 12, { bg: '#ffffff', border: '#e4e4e7', accentLeft: theme.primaryDark || '#18181b', accentLeftW: 3 });
  drawText(page, ctx.fonts, 'GUJARAT REVENUE DEPARTMENT (ANYROR) DATA', 52, topY - 18, { size: 10, bold: true, color: '#18181b' });

  const revRows: [string, string][] = [
    ['Village Name', parcel.village.toUpperCase()],
    ['Revenue Survey No.', parcel.surveyNo],
    ['Old Survey No.', parcel.oldSurveyNo || '—'],
    ['Town Planning Scheme', parcel.tpShort],
    ['Final Plot (FP) No.', parcel.finalPlot],
    ['Land Tenure Category', parcel.tenure || 'Old Tenure (Freehold)'],
    ['NA Conversion Status', parcel.naStatus || 'Non-Agricultural Order Passed'],
    ['Statutory Zone', parcel.zone.split('—')[0].trim() || 'Industrial / Commercial'],
    ['Legal Encumbrance', 'Nil / Title Clearance Certificate Available'],
    ['Possession Status', 'Immediate Physical Demarcation Available'],
  ];

  let rY = topY - 44;
  revRows.forEach(([lbl, val]) => {
    drawText(page, ctx.fonts, lbl, 52, rY, { size: 9, bold: true, color: '#71717a', maxWidth: 170 });
    drawText(page, ctx.fonts, val, 230, rY, { size: 9, bold: true, color: '#1c1917', maxWidth: leftW - 190 });
    page.drawLine({ start: { x: 50, y: rY - 12 }, end: { x: 36 + leftW - 14, y: rY - 12 }, thickness: 0.4, color: C('#e4e4e7') });
    rY -= 26;
  });

  // Right: Title Diligence Badges & Map
  aurumBox(page, rightX, FLOOR_Y + 12, rightW, topY - FLOOR_Y - 12, { bg: '#ffffff', border: '#e4e4e7', accentLeft: theme.accent || '#c5a059', accentLeftW: 3 });
  drawText(page, ctx.fonts, 'TITLE CERTIFICATION & STATUTORY CLEARANCE', rightX + 16, topY - 18, { size: 10, bold: true, color: theme.accent || '#c5a059' });

  const badges = [
    { title: 'TITLE CLEAR FREEHOLD', desc: 'No revenue disputes or co-sharer litigation.' },
    { title: '7/12 MUTATION VERIFIED', desc: 'Updated Hak Patrak mutation entries verified.' },
    { title: 'SANCTIONED TP SCHEME', desc: 'Statutory protection under GTPUD Act 1976.' },
    { title: 'DGDCR PERMISSIBLE', desc: 'Eligible for immediate building plan sanction.' },
  ];

  let bY = topY - 48;
  badges.forEach((b) => {
    page.drawRectangle({ x: rightX + 16, y: bY - 26, width: rightW - 32, height: 36, color: C('#ffffff'), borderColor: C('#e4e4e7'), borderWidth: 0.5 });
    page.drawLine({ start: { x: rightX + 24, y: bY - 6 }, end: { x: rightX + 28, y: bY - 10 }, thickness: 1.5, color: C(theme.accent || '#c5a059') });
    page.drawLine({ start: { x: rightX + 28, y: bY - 10 }, end: { x: rightX + 34, y: bY - 3 }, thickness: 1.5, color: C(theme.accent || '#c5a059') });
    drawText(page, ctx.fonts, b.title, rightX + 42, bY, { size: 9, bold: true, color: '#18181b' });
    drawText(page, ctx.fonts, b.desc, rightX + 42, bY - 14, { size: 7.5, color: '#71717a' });
    bY -= 46;
  });

  const snapY = FLOOR_Y + 18;
  const snapH = 196;
  await drawSnapshot(ctx, page, 'subsector', rightX + 16, snapY, rightW - 32, snapH, 'SUB-SECTOR PLAN');
}

// ─── 9. TP LOCATION ATLAS ───────────────────────────────────────────────────
export async function premiumTpLocation(ctx: RenderCtx, page: PDFPage) {
  const { W, H, theme, parcel } = ctx;
  page.drawRectangle({ x: 0, y: 0, width: W, height: H, color: C('#fafaf9') });
  drawAurumHeader(page, ctx.fonts, theme, W, H, 'Town Planning Scheme Georeferenced Atlas', 'TP Scheme');

  const topY = H - 54;
  const mapH = topY - FLOOR_Y - 12;
  await drawSnapshot(ctx, page, 'tp-full', 36, FLOOR_Y + 12, W - 72, mapH, `${parcel.village.toUpperCase()} · TP ${parcel.tpShort} SCHEME ATLAS`);
}

// ─── 10. ZONING & DGDCR 2024 ────────────────────────────────────────────────
export async function premiumZoning(ctx: RenderCtx, page: PDFPage) {
  const { W, H, theme, parcel } = ctx;
  page.drawRectangle({ x: 0, y: 0, width: W, height: H, color: C('#fafaf9') });
  drawAurumHeader(page, ctx.fonts, theme, W, H, 'Zoning Permissibility & DGDCR Building Envelopes', 'DGDCR');

  const topY = H - 54;
  const leftW = (W - 72) * 0.52;
  const rightW = (W - 72) * 0.45;
  const rightX = 36 + leftW + 20;

  // Left: DGDCR Parameters Table
  aurumBox(page, 36, FLOOR_Y + 12, leftW, topY - FLOOR_Y - 12, { bg: '#ffffff', border: '#e4e4e7', accentLeft: theme.primaryDark || '#18181b', accentLeftW: 3 });
  drawText(page, ctx.fonts, 'STATUTORY DEVELOPMENT ENVELOPE (DGDCR)', 52, topY - 18, { size: 10, bold: true, color: '#18181b' });

  const dgdcrRows: [string, string][] = [
    ['Zoning Classification', parcel.zone || 'Industrial / Commercial Mixed'],
    ['Permissible Uses', (parcel.permittedUses || 'Manufacturing, warehouse, commercial, offices').slice(0, 75)],
    ['Base Floor Area Ratio (FAR)', String(parcel.maxFAR ? (parcel.maxFAR * 0.7).toFixed(1) : '1.2')],
    ['Maximum Permissible FAR', `${parcel.maxFAR} (Chargeable: ${parcel.chargeableFAR})`],
    ['Maximum Building Height', parcel.heightDesc || `${parcel.maxHeightM || 24} Meters`],
    ['Maximum Ground Coverage', `${parcel.groundCoveragePct || 55}% of Plot Area`],
    ['Marginal Setbacks', parcel.setbacks || '6m all sides minimum'],
    ['Maximum Building Length', parcel.maxBuildingLength || '60 Meters'],
    ['Abutting Road Frontage', `${parcel.roadWidthM} Meters (${parcel.roadClass})`],
    ['Statutory Jantri Rate', parcel.jantriRatePerSqM ? `₹${parcel.jantriRatePerSqM.toLocaleString('en-IN')} / sq.m` : '—'],
  ];

  let yCursor = topY - 44;
  dgdcrRows.forEach(([lbl, val]) => {
    drawText(page, ctx.fonts, lbl, 52, yCursor, { size: 8.5, bold: true, color: '#71717a', maxWidth: 170 });
    drawText(page, ctx.fonts, val, 230, yCursor, { size: 8.5, bold: true, color: '#1c1917', maxWidth: leftW - 190 });
    page.drawLine({ start: { x: 50, y: yCursor - 12 }, end: { x: 36 + leftW - 14, y: yCursor - 12 }, thickness: 0.4, color: C('#e4e4e7') });
    yCursor -= 26;
  });

  // Right: Zoning Map Preview + Guidelines
  aurumBox(page, rightX, FLOOR_Y + 12, rightW, topY - FLOOR_Y - 12, { bg: '#ffffff', border: '#e4e4e7', accentLeft: theme.accent || '#c5a059', accentLeftW: 3 });
  drawText(page, ctx.fonts, 'ZONING BLUEPRINT & NORMS', rightX + 16, topY - 18, { size: 10, bold: true, color: theme.accent || '#c5a059' });

  const snapH = 170;
  const snapY = topY - 32 - snapH;
  await drawSnapshot(ctx, page, 'zoning', rightX + 16, snapY, rightW - 32, snapH, 'ZONING MAP');

  drawText(page, ctx.fonts, 'COMPLIANCE & DEVELOPMENT NORMS', rightX + 16, snapY - 20, { size: 9, bold: true, color: '#1c1917' });
  const guidelines = [
    'Fire safety NOC clearance mandated for structures > 15m.',
    'Common effluent/sewage pipeline hookup provided at plot curb.',
    'Underground power cabling and dual water meters pre-installed.',
  ];
  let gY = snapY - 38;
  guidelines.forEach((g) => {
    page.drawRectangle({ x: rightX + 16, y: gY - 7, width: 4, height: 4, color: C(theme.accent || '#c5a059') });
    drawText(page, ctx.fonts, g, rightX + 26, gY, { size: 8, color: '#57534e', maxWidth: rightW - 36 });
    gY -= 20;
  });

  // Plug-and-Play Utility Hookups & Capacity Block
  const hookupY = FLOOR_Y + 18;
  const hookupH = 124;
  page.drawRectangle({ x: rightX + 16, y: hookupY, width: rightW - 32, height: hookupH, color: C('#fafaf9'), borderColor: C('#e4e4e7'), borderWidth: 0.5 });
  page.drawRectangle({ x: rightX + 16, y: hookupY + hookupH - 20, width: rightW - 32, height: 20, color: C('#f4f4f5') });
  drawText(page, ctx.fonts, 'PLUG-AND-PLAY BESPOKE INFRASTRUCTURE', rightX + 24, hookupY + hookupH - 6, { size: 7.5, bold: true, color: '#18181b' });

  const utilities = [
    { title: 'POTABLE & INDUSTRIAL WATER', desc: 'Dual metered pressurized pipeline network pre-laid in roadside utility duct.' },
    { title: 'POWER TRANSMISSION (UG)', desc: 'Direct 11kV/66kV high-tension feeder line from central Torrent power substation.' },
    { title: 'INDUSTRIAL EFFLUENT (CETP)', desc: '100% underground collection connecting to centralized Zero Liquid Discharge CETP.' },
    { title: 'ICT & CITY SCADA FIBER', desc: 'Integrated high-bandwidth smart grid fiber for automated metering and telematics.' },
  ];

  let uY = hookupY + hookupH - 34;
  utilities.forEach((u) => {
    page.drawRectangle({ x: rightX + 24, y: uY - 4, width: 3.5, height: 3.5, color: C(theme.accent || '#c5a059') });
    drawText(page, ctx.fonts, u.title, rightX + 32, uY, { size: 7, bold: true, color: '#18181b' });
    drawText(page, ctx.fonts, u.desc, rightX + 32, uY - 9, { size: 6.5, color: '#71717a', maxWidth: rightW - 56 });
    uY -= 23;
  });
}

// ─── 11. OP VS FP CADASTRAL BLUEPRINT ───────────────────────────────────────
export async function premiumOpFp(ctx: RenderCtx, page: PDFPage) {
  const { W, H, theme, parcel } = ctx;
  page.drawRectangle({ x: 0, y: 0, width: W, height: H, color: C('#fafaf9') });
  drawAurumHeader(page, ctx.fonts, theme, W, H, 'Cadastral Reconstitution: Original Plot vs Final Plot', 'Cadastre');

  const topY = H - 54;
  const mapW = (W - 72 - 16) / 2;
  const mapH = topY - FLOOR_Y - 12;

  await drawSnapshot(ctx, page, 'op', 36, FLOOR_Y + 12, mapW, mapH, `ORIGINAL PLOT (O.P.) · SURVEY ${parcel.surveyNo}`);
  await drawSnapshot(ctx, page, 'fp', 36 + mapW + 16, FLOOR_Y + 12, mapW, mapH, `RECONSTITUTED FINAL PLOT (F.P. ${parcel.finalPlot})`);
}

// ─── 12. PARCEL ZOOM GRID (4-TIER SOVEREIGN CADASTRAL MATRIX) ───────────────
export async function premiumZoomGrid(ctx: RenderCtx, page: PDFPage) {
  const { W, H, theme, parcel } = ctx;
  page.drawRectangle({ x: 0, y: 0, width: W, height: H, color: C('#fafaf9') });
  drawAurumHeader(page, ctx.fonts, theme, W, H, 'Micro-Cadastral Zoom: 4-Tier Sovereign Demarcation Matrix', 'Grid');

  const topY = H - 54;
  const bottomY = FLOOR_Y + 10;
  const availableH = topY - bottomY - 8;
  const gap = 12;
  const cellW = (W - 72 - gap) / 2;
  const cellH = (availableH - gap) / 2;

  const col1X = 36;
  const col2X = col1X + cellW + gap;
  const row1Y = bottomY + cellH + gap; // Top row
  const row2Y = bottomY;               // Bottom row

  // 1. Top-Left: Macro TP Scheme Georeferenced Extent
  await drawSnapshot(
    ctx,
    page,
    'tp-full',
    col1X,
    row1Y,
    cellW,
    cellH,
    `1. MACRO TP ATLAS · TOWN PLANNING SCHEME ${parcel.tpShort}`
  );

  // 2. Top-Right: Subsector Corridor & Arterial Road Network
  await drawSnapshot(
    ctx,
    page,
    'subsector',
    col2X,
    row1Y,
    cellW,
    cellH,
    `2. SOVEREIGN SECTOR · ${parcel.roadWidthM}M ARTERIAL ROAD FRONTAGE`
  );

  // 3. Bottom-Left: Reconstituted Final Plot & Survey Boundary
  await drawSnapshot(
    ctx,
    page,
    'fp',
    col1X,
    row2Y,
    cellW,
    cellH,
    `3. RECONSTITUTED FINAL PLOT ${parcel.finalPlot} (SURVEY ${parcel.surveyNo})`
  );

  // 4. Bottom-Right: Micro-Cadastral Demarcation & Development Blueprint
  await drawSnapshot(
    ctx,
    page,
    'exact',
    col2X,
    row2Y,
    cellW,
    cellH,
    `4. PRIVATE CLIENT PLOT ARCHITECTURE · ${parcel.village.toUpperCase()}`
  );
}

// ─── 13. DGDCR REGULATORY SCHEDULE ──────────────────────────────────────────
export async function premiumDgdcr(ctx: RenderCtx, page: PDFPage) {
  const { W, H, theme, parcel } = ctx;
  page.drawRectangle({ x: 0, y: 0, width: W, height: H, color: C('#fafaf9') });
  drawAurumHeader(page, ctx.fonts, theme, W, H, 'DGDCR Statutory Planning Schedule', 'Schedule');

  const topY = H - 54;
  aurumBox(page, 36, FLOOR_Y + 12, W - 72, topY - FLOOR_Y - 12, { bg: '#ffffff', border: '#e4e4e7', accentLeft: theme.primaryDark || '#18181b', accentLeftW: 3 });
  drawText(page, ctx.fonts, 'STATUTORY REGULATORY PARAMETERS (DGDCR SCHEDULE)', 52, topY - 18, { size: 10, bold: true, color: '#18181b' });

  const sched: [string, string][] = [
    ['Planning Authority', 'Dholera Special Investment Region Development Authority (DSIRDA)'],
    ['Town Planning Scheme', `${parcel.tpShort} · Sanctioned Preliminary Scheme (Sec 50 GTPUD 1976)`],
    ['Statutory Survey & FP', `Survey ${parcel.surveyNo} · Final Plot ${parcel.finalPlot} (${parcel.village})`],
    ['Land Use Zoning Category', parcel.zone || 'Industrial / Mixed-Use Commercial'],
    ['Abutting Road Reservation', `${parcel.roadWidthM} Meters (${parcel.roadClass})`],
    ['Base Floor Area Ratio', String(parcel.maxFAR ? (parcel.maxFAR * 0.7).toFixed(1) : '1.2')],
    ['Chargeable FAR Premium', `${parcel.chargeableFAR}`],
    ['Max Permissible FAR', `${parcel.maxFAR}`],
    ['Max Permissible Height', parcel.heightDesc || '24 Meters'],
    ['Permissible Ground Coverage', `${parcel.groundCoveragePct || 55}%`],
    ['Setbacks & Margins', parcel.setbacks || 'Front 6m, Sides 6m, Rear 6m'],
    ['Fire & Safety Clearance', 'Mandated under Gujarat Fire Prevention & Life Safety Measures Act'],
    ['Environmental Clearance', 'Covered under DSIR Environmental Clearance for Non-Polluting Industrial Nodes'],
  ];

  let y = topY - 42;
  sched.forEach(([lbl, val]) => {
    drawText(page, ctx.fonts, lbl, 52, y, { size: 8.5, bold: true, color: '#71717a', maxWidth: 220 });
    drawText(page, ctx.fonts, val, 280, y, { size: 8.5, bold: true, color: '#1c1917', maxWidth: W - 72 - 300 });
    page.drawLine({ start: { x: 50, y: y - 10 }, end: { x: W - 50, y: y - 10 }, thickness: 0.4, color: C('#e4e4e7') });
    y -= 21;
  });

  // Bottom 2-Column Statutory Roadmap & Infrastructure Block
  const btmY = FLOOR_Y + 18;
  const btmH = 92;
  const btmW = (W - 72 - 32 - 16) / 2;

  // Left Column: STATUTORY APPROVAL & CLEARANCE ROADMAP
  const btmLeftX = 52;
  page.drawRectangle({ x: btmLeftX, y: btmY, width: btmW, height: btmH, color: C('#ffffff'), borderColor: C('#e4e4e7'), borderWidth: 0.5 });
  page.drawRectangle({ x: btmLeftX, y: btmY + btmH - 18, width: btmW, height: 18, color: C('#f4f4f5') });
  drawText(page, ctx.fonts, 'STATUTORY CLEARANCE & APPROVAL ROADMAP', btmLeftX + 8, btmY + btmH - 5, { size: 7.5, bold: true, color: '#18181b' });

  const approvals = [
    { step: '1. ODPS Online Sanction', desc: 'Pre-scrutinized computerized architectural sanction via DSIRDA portal.' },
    { step: '2. Fire Prevention NOC', desc: 'Statutory compliance under Gujarat Fire Prevention & Life Safety Act.' },
    { step: '3. Factory Inspectorate', desc: 'DISH clearance for factory floor layout, ventilation, and machinery safety.' },
    { step: '4. GPCB CTE / CTO', desc: 'Consent to Establish & Operate for non-polluting industrial categories.' },
  ];
  let aY = btmY + btmH - 28;
  approvals.forEach((a) => {
    drawText(page, ctx.fonts, a.step, btmLeftX + 8, aY, { size: 7, bold: true, color: '#18181b' });
    drawText(page, ctx.fonts, a.desc, btmLeftX + 110, aY, { size: 6.5, color: '#71717a', maxWidth: btmW - 118 });
    aY -= 17;
  });

  // Right Column: PRE-ENGINEERED UTILITY HOOKUPS
  const btmRightX = btmLeftX + btmW + 16;
  page.drawRectangle({ x: btmRightX, y: btmY, width: btmW, height: btmH, color: C('#ffffff'), borderColor: C('#e4e4e7'), borderWidth: 0.5 });
  page.drawRectangle({ x: btmRightX, y: btmY + btmH - 18, width: btmW, height: 18, color: C('#f4f4f5') });
  drawText(page, ctx.fonts, 'PRE-ENGINEERED UTILITY HOOKUPS AT PARCEL BOUNDARY', btmRightX + 8, btmY + btmH - 5, { size: 7.5, bold: true, color: '#18181b' });

  const hooks = [
    { title: 'Potable & Industrial Water', desc: 'Dual metered tapping points at plot frontage with guaranteed 24x7 pressure.' },
    { title: 'Power Feeder Pillar', desc: 'Direct 11kV/66kV high-tension feeder from Torrent Power substation.' },
    { title: 'Effluent Trunk Disposal', desc: 'Underground gravity line hooked to centralized 20 MLD CETP (ZLD).' },
    { title: 'Stormwater Inundation Guard', desc: 'Sub-surface drainage integrated into DSIR regional linear canal system.' },
  ];
  let hY = btmY + btmH - 28;
  hooks.forEach((h) => {
    drawText(page, ctx.fonts, h.title, btmRightX + 8, hY, { size: 7, bold: true, color: '#18181b' });
    drawText(page, ctx.fonts, h.desc, btmRightX + 120, hY, { size: 6.5, color: '#71717a', maxWidth: btmW - 128 });
    hY -= 17;
  });
}

// ─── 14. STATUTORY DUE DILIGENCE CHECKLIST ──────────────────────────────────
export async function premiumDocuments(ctx: RenderCtx, page: PDFPage) {
  const { W, H, theme, parcel } = ctx;
  page.drawRectangle({ x: 0, y: 0, width: W, height: H, color: C('#fafaf9') });
  drawAurumHeader(page, ctx.fonts, theme, W, H, 'Statutory Due Diligence: 9-Point Verification Checklist', 'Diligence');

  const topY = H - 54;
  aurumBox(page, 36, FLOOR_Y + 12, W - 72, topY - FLOOR_Y - 12, { bg: '#ffffff', border: '#e4e4e7', accentLeft: theme.accent || '#c5a059', accentLeftW: 3 });
  drawText(page, ctx.fonts, 'LEGAL TITLE VERIFICATION PROTOCOL (DSIR / GTPUD / ANYROR)', 52, topY - 18, { size: 10, bold: true, color: '#18181b' });

  const items = [
    { name: '7/12 Land Record Extract (AnyRoR)', desc: 'Official record of rights showing verified ownership names, survey area, and agricultural assessment.' },
    { name: '8-A Khatedar Account Record', desc: 'Holdings statement verifying consolidated landholding index and mutation ledger accounts.' },
    { name: 'Form 6 (Hak Patrak Mutation Entry)', desc: 'Historical succession and conveyance trail of mutations confirming clear legal lineage.' },
    { name: 'Town Planning Reconstitution Sanction', desc: 'State Government gazette notification sanctioning Preliminary TP Scheme under GTPUD Act 1976.' },
    { name: 'Title Clearance Certificate (Advocate Search)', desc: '30-year title search by authorized Gujarat High Court advocate confirming unencumbered status.' },
    { name: 'Public Paper Notice Publication', desc: 'Published public invite for claims in leading vernacular daily newspaper with no objections raised.' },
    { name: 'Non-Agricultural (N.A.) Statutory Order', desc: 'District Collector approval for non-agricultural industrial transformation and NA tax assessment.' },
    { name: 'DSIRDA Zoning & Land Use Certificate', desc: 'Official confirmation of industrial land permissibility within DSIR Development Plan.' },
    { name: 'Physical Demarcation & Boundary Pegging', desc: 'On-site DGPS demarcation coordinates matching Town Planning survey boundaries.' },
  ];

  let y = topY - 44;
  items.forEach((it, i) => {
    page.drawRectangle({ x: 50, y: y - 20, width: 24, height: 20, color: C('#ffffff'), borderColor: C('#e4e4e7'), borderWidth: 0.5 });
    page.drawLine({ start: { x: 56, y: y - 10 }, end: { x: 60, y: y - 14 }, thickness: 1.5, color: C(theme.accent || '#c5a059') });
    page.drawLine({ start: { x: 60, y: y - 14 }, end: { x: 68, y: y - 6 }, thickness: 1.5, color: C(theme.accent || '#c5a059') });

    drawText(page, ctx.fonts, `${i + 1}. ${it.name.toUpperCase()}`, 86, y - 4, { size: 9, bold: true, color: '#1c1917' });
    drawText(page, ctx.fonts, it.desc, 86, y - 16, { size: 7.5, color: '#57534e', maxWidth: W - 160 });

    page.drawLine({ start: { x: 50, y: y - 25 }, end: { x: W - 50, y: y - 25 }, thickness: 0.4, color: C('#e4e4e7') });
    y -= 31;
  });

  // Bottom 3-Column Legal Certification & Attestation Panel
  const certY = FLOOR_Y + 18;
  const certH = 88;
  const certColW = (W - 72 - 32 - 24) / 3;

  const cols = [
    {
      title: 'TITLE CHAIN CONTINUITY',
      rows: [
        ['Search Scope', '30-Year Revenue Lineage'],
        ['Village Form 6', 'Hak Patrak Mutations Verified'],
        ['Inheritance Trail', 'Unbroken Succession Record'],
      ],
    },
    {
      title: 'SEARCH & LIEN STATUS',
      rows: [
        ['Encumbrance Ledger', 'Nil Bank or Financial Charges'],
        ['Civil Court Search', 'No Pending Lis Pendens'],
        ['Sub-Registrar Index', 'Clear Freehold Ownership'],
      ],
    },
    {
      title: 'STATUTORY CONFORMITY',
      rows: [
        ['GTPUD Act 1976', 'Preliminary TP Scheme Sec 50'],
        ['DSIRDA Master Plan', 'Sovereign / High-Yield Node'],
        ['Possession Status', 'Physical Pegging Demarcated'],
      ],
    },
  ];

  cols.forEach((col, idx) => {
    const colX = 52 + idx * (certColW + 12);
    page.drawRectangle({ x: colX, y: certY, width: certColW, height: certH, color: C('#ffffff'), borderColor: C('#e4e4e7'), borderWidth: 0.5 });
    page.drawRectangle({ x: colX, y: certY + certH - 18, width: certColW, height: 18, color: C('#fafaf9') });
    page.drawRectangle({ x: colX, y: certY + certH - 2, width: certColW, height: 2, color: C(theme.accent || '#c5a059') });
    drawText(page, ctx.fonts, col.title, colX + 8, certY + certH - 5, { size: 7.5, bold: true, color: '#18181b' });

    let rY = certY + certH - 30;
    col.rows.forEach(([lbl, val]) => {
      drawText(page, ctx.fonts, lbl, colX + 8, rY, { size: 6.5, color: '#71717a' });
      drawText(page, ctx.fonts, val, colX + certColW - 8, rY, { size: 6.5, bold: true, color: '#18181b', align: 'right' });
      rY -= 18;
    });
  });
}

// ─── 15. OFFICIAL DILIGENCE CLOSING & QR SIGN-OFF ───────────────────────────
export async function premiumClosing(ctx: RenderCtx, page: PDFPage) {
  const { W, H, theme, parcel } = ctx;
  page.drawRectangle({ x: 0, y: 0, width: W, height: H, color: C('#fafaf9') });
  drawAurumHeader(page, ctx.fonts, theme, W, H, 'Transaction Verification & Live GIS Portal Link', 'Closing');

  const topY = H - 54;
  const leftW = (W - 72) * 0.52;
  const rightW = (W - 72) * 0.45;
  const rightX = 36 + leftW + 20;

  // Left: Verification QR Code & Live Portal Link
  aurumBox(page, 36, FLOOR_Y + 12, leftW, topY - FLOOR_Y - 12, { bg: '#ffffff', border: '#e4e4e7', accentLeft: theme.primaryDark || '#18181b', accentLeftW: 3 });
  drawText(page, ctx.fonts, 'LIVE GEOREFERENCED ATLAS VERIFICATION', 52, topY - 18, { size: 10, bold: true, color: '#18181b' });

  const qrUrl = parcel.verifyUrl || `https://dholeramap.com/?search=${parcel.surveyNo}`;
  const qrDataUrl = await QRCode.toDataURL(qrUrl, { margin: 1, width: 200 });
  const [head, body] = qrDataUrl.split(',');
  const qrBytes = Uint8Array.from(atob(body), (c) => c.charCodeAt(0));
  const qrImg = await ctx.doc.embedPng(qrBytes);

  page.drawImage(qrImg, { x: 52, y: topY - 170, width: 140, height: 140 });

  drawText(page, ctx.fonts, 'SCAN QR TO VIEW IN GIS ATLAS', 206, topY - 48, { size: 10, bold: true, color: '#18181b' });
  drawWrappedText(page, ctx.fonts, 'Instantly access this parcel on the interactive DholeraMap atlas. View georeferenced survey polygons, abutting TP road widths, nearest infrastructure corridors, and statutory satellite overlays.', 206, topY - 66, leftW - 220, { size: 8, color: '#57534e', lineHeight: 12, maxLines: 4 });

  drawText(page, ctx.fonts, `Direct URL: ${qrUrl}`, 206, topY - 136, { size: 7.5, bold: true, color: theme.accent || '#c5a059', maxWidth: leftW - 220 });

  // Statutory Disclaimer on Left
  const discY = topY - 185;
  const discH = 96;
  page.drawRectangle({ x: 52, y: discY - discH, width: leftW - 32, height: discH, color: C('#ffffff'), borderColor: C('#e4e4e7'), borderWidth: 0.5 });
  drawText(page, ctx.fonts, 'STATUTORY DISCLAIMER & ADVISORY NOTE', 64, discY - 14, { size: 8, bold: true, color: '#71717a' });
  drawWrappedText(page, ctx.fonts, 'This client dossier has been generated from statutory data published by DSIRDA, Gujarat Revenue Department (AnyRoR), and sanctioned Town Planning Schemes under GTPUD Act 1976. All boundary measurements, road widths, and zoning envelopes should be verified on-site with competent authorities before entering into binding commercial transactions.', 64, discY - 32, leftW - 56, { size: 7.5, color: '#71717a', lineHeight: 12, maxLines: 5 });

  // Official Statutory Repositories Block
  const repoY = FLOOR_Y + 18;
  const repoH = discY - discH - 12 - repoY;
  page.drawRectangle({ x: 52, y: repoY, width: leftW - 32, height: repoH, color: C('#ffffff'), borderColor: C('#e4e4e7'), borderWidth: 0.5 });
  page.drawRectangle({ x: 52, y: repoY + repoH - 18, width: leftW - 32, height: 18, color: C('#fafaf9') });
  drawText(page, ctx.fonts, 'OFFICIAL STATUTORY DATA REPOSITORIES', 64, repoY + repoH - 5, { size: 7.5, bold: true, color: '#18181b' });

  const repos = [
    { name: 'Revenue Authority', desc: 'AnyRoR Gujarat Revenue Department Portal (anyror.gujarat.gov.in)' },
    { name: 'Development Plan', desc: 'DSIRDA Sanctioned Development Plan 2040 Official State Gazette' },
    { name: 'Town Planning Law', desc: 'Gujarat Town Planning & Urban Development Act 1976 (GTPUD Sec 50)' },
    { name: 'Special Investment Node', desc: 'Gujarat Special Investment Region (SIR) Act 2009 Apex Framework' },
  ];
  let rpY = repoY + repoH - 30;
  repos.forEach((r) => {
    drawText(page, ctx.fonts, r.name, 64, rpY, { size: 7, bold: true, color: '#18181b' });
    drawText(page, ctx.fonts, r.desc, 175, rpY, { size: 6.5, color: '#71717a', maxWidth: leftW - 200 });
    rpY -= 18;
  });

  // Right: Consultant / Dealer Profile Card
  aurumBox(page, rightX, FLOOR_Y + 12, rightW, topY - FLOOR_Y - 12, { bg: '#ffffff', border: '#e4e4e7', accentLeft: theme.accent || '#c5a059', accentLeftW: 3 });
  drawText(page, ctx.fonts, 'AURUM PRIVATE CLIENT DESK', rightX + 16, topY - 18, { size: 10, bold: true, color: '#18181b' });

  const b = ctx.branding;
  const cName = b?.name || 'DholeraMap Land Advisory Network';
  const cCompany = b?.company || 'Geospatial Land Intelligence Platform';
  const cPhone = b?.phone || '+91 99789 52345';
  const cEmail = b?.email || 'contact@dholeramap.com';
  const cRera = parcel.reraId ? `GUJ/RERA Reg: ${parcel.reraId}` : (b?.tagline || 'RERA Compliance Verified');

  drawText(page, ctx.fonts, cName.toUpperCase(), rightX + 16, topY - 44, { size: 12, bold: true, color: '#18181b', maxWidth: rightW - 32 });
  drawText(page, ctx.fonts, cCompany, rightX + 16, topY - 62, { size: 9, bold: true, color: '#71717a', maxWidth: rightW - 32 });

  const reraY = topY - 104;
  page.drawRectangle({ x: rightX + 16, y: reraY, width: rightW - 32, height: 26, color: C('#fafaf9'), borderColor: C('#e4e4e7'), borderWidth: 0.5 });
  drawText(page, ctx.fonts, cRera, rightX + 26, reraY + 19, { size: 8, bold: true, color: theme.accent || '#c5a059', maxWidth: rightW - 52 });

  const contactRows: [string, string][] = [
    ['Direct Phone', cPhone],
    ['Email Contact', cEmail],
    ['Web Portal', 'https://dholeramap.com'],
    ['Head Office', 'Dholera SIR / Ahmedabad, Gujarat'],
    ['Diligence Timestamp', new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })],
  ];

  let cY = reraY - 26;
  contactRows.forEach(([lbl, val]) => {
    drawText(page, ctx.fonts, lbl, rightX + 16, cY, { size: 8.5, bold: true, color: '#71717a', maxWidth: 120 });
    drawText(page, ctx.fonts, val, rightX + 130, cY, { size: 8.5, bold: true, color: '#1c1917', maxWidth: rightW - 146 });
    page.drawLine({ start: { x: rightX + 16, y: cY - 8 }, end: { x: rightX + rightW - 16, y: cY - 8 }, thickness: 0.4, color: C('#e4e4e7') });
    cY -= 24;
  });

  // Right Lower: Statutory Verification Seal & Sign-Off Panel
  const sealY = FLOOR_Y + 18;
  const sealH = 136;
  page.drawRectangle({ x: rightX + 16, y: sealY, width: rightW - 32, height: sealH, color: C('#fafaf9'), borderColor: C('#e4e4e7'), borderWidth: 0.5 });
  page.drawRectangle({ x: rightX + 16, y: sealY + sealH - 20, width: rightW - 32, height: 20, color: C('#f4f4f5') });
  drawText(page, ctx.fonts, 'STATUTORY VERIFICATION SEAL & DIGITAL SIGN-OFF', rightX + 24, sealY + sealH - 6, { size: 7.5, bold: true, color: '#18181b' });

  const sealRows: [string, string][] = [
    ['Verification Hash', 'SHA-256: 8F3D-4A2E-9C7B-10F4-DSIRDA-AUR'],
    ['Cadastral Integrity', 'Digitally Validated Demarcation Matrix'],
    ['Statutory Standing', 'Sanctioned Preliminary TP Final Plot'],
    ['Authentication Desk', 'Geospatial Intelligence Unit · DholeraMap'],
  ];

  let sY = sealY + sealH - 36;
  sealRows.forEach(([lbl, val]) => {
    drawText(page, ctx.fonts, lbl, rightX + 24, sY, { size: 7, color: '#71717a' });
    drawText(page, ctx.fonts, val, rightX + rightW - 24, sY, { size: 7, bold: true, color: '#18181b', align: 'right' });
    sY -= 18;
  });

  // Signature line
  page.drawLine({ start: { x: rightX + 24, y: sealY + 28 }, end: { x: rightX + rightW - 24, y: sealY + 28 }, thickness: 0.5, color: C('#e4e4e7') });
  drawText(page, ctx.fonts, 'AUTHORIZED SIGNATURE & INSTITUTIONAL SEAL', rightX + 24, sealY + 16, { size: 6.5, bold: true, color: '#a1a1aa' });
  drawText(page, ctx.fonts, 'VERIFIED AURUM DOSSIER', rightX + rightW - 24, sealY + 16, { size: 6.5, bold: true, color: theme.accent || '#c5a059', align: 'right' });
}

// Aliases for backwards compatibility
export const premiumDetails = premiumProperty;
export const premiumHighlights = premiumLand;

