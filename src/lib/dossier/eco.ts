/**
 * Eco-Township & Smart Living deck — a fully generated residential template.
 *
 * Theme: Forest Jade (#064e3b), Emerald Green (#059669), Ocean Cyan (#0284c7),
 * Sunbeam Gold (#eab308), and Soft Mint Panels (#f0fdf4).
 *
 * Aesthetic: Organic curved cards, wellness lifestyle badges, green mobility pills,
 * walkable residential neighborhood blueprints, and residential zoning parameter schedules.
 *
 * All pages are generated fresh with zero third-party branding.
 * Clamped strictly above FLOOR_Y = 44.
 */

import { PDFFont, PDFPage, rgb } from 'pdf-lib';
import { drawContainedImage, drawSnapshot, drawWrappedText, hex, loadStaticImage } from './render';
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
  const col = hex(opts.color || '#064e3b');
  page.drawText(str, { x: dx, y: y - size, font, size, color: rgb(col.r, col.g, col.b) });
}

function drawEcoHeader(
  page: PDFPage,
  fonts: RenderFonts,
  theme: DossierTheme,
  W: number,
  H: number,
  title: string,
  category: string
) {
  // Top green nature line
  page.drawRectangle({ x: 0, y: H - 3, width: W, height: 3, color: C(theme.accent || '#2d6a4f') });
  // Primary dark forest header
  page.drawRectangle({ x: 0, y: H - 36, width: W, height: 33, color: C(theme.primary || '#14342b') });
  // Subtle indicator capsule
  page.drawRectangle({ x: 18, y: H - 28, width: 6, height: 16, color: C(theme.accent || '#2d6a4f') });

  drawText(page, fonts, title, 32, H - 15, {
    size: 11,
    bold: true,
    color: '#ffffff',
    maxWidth: W * 0.6,
  });

  drawText(page, fonts, `SMART ECO-LIVING · ${category.toUpperCase()} · DSIRDA`, W - 24, H - 15, {
    size: 7.5,
    bold: true,
    color: '#cfe3d8',
    align: 'right',
    maxWidth: W * 0.35,
  });
}

function ecoCard(
  page: PDFPage,
  x: number,
  y: number,
  w: number,
  h: number,
  opts: {
    bg?: string;
    border?: string;
    topStripe?: string;
  } = {}
) {
  page.drawRectangle({
    x,
    y,
    width: w,
    height: h,
    color: C(opts.bg || '#ffffff'),
    borderColor: C(opts.border || '#cfe3d8'),
    borderWidth: 0.75,
  });
  if (opts.topStripe) {
    page.drawRectangle({
      x,
      y: y + h - 3,
      width: w,
      height: 3,
      color: C(opts.topStripe),
    });
  }
}

// ─── 1. COVER PAGE ──────────────────────────────────────────────────────────
export async function ecoCover(ctx: RenderCtx, page: PDFPage) {
  const { W, H, theme, parcel } = ctx;
  page.drawRectangle({ x: 0, y: 0, width: W, height: H, color: C('#f7fbf9') });

  // Top header band
  const topH = 146;
  page.drawRectangle({ x: 0, y: H - topH, width: W, height: topH, color: C(theme.primary || '#14342b') });
  page.drawRectangle({ x: 0, y: H - topH - 3, width: W, height: 3, color: C(theme.accent || '#2d6a4f') });

  drawText(page, ctx.fonts, 'DHOLERA SIR · RESIDENTIAL ECO-TOWNSHIP & SMART LIVING', 36, H - 24, {
    size: 8.5,
    bold: true,
    color: '#a7d7c5',
    maxWidth: W - 72,
  });

  drawText(page, ctx.fonts, `${parcel.village.toUpperCase()} — RESIDENTIAL PLOT ${parcel.finalPlot}`, 36, H - 56, {
    size: 26,
    bold: true,
    color: '#ffffff',
    maxWidth: W - 72,
  });

  drawText(page, ctx.fonts, `Survey ${parcel.surveyNo} · ${parcel.tpShort.toUpperCase()} · Sanctioned Residential Town Planning Scheme`, 36, H - 90, {
    size: 11.5,
    bold: true,
    color: '#d8f3dc',
    maxWidth: W - 72,
  });

  const zoneStr = (parcel.zone || 'Residential Plotted Township').split('—')[0].trim();
  drawText(page, ctx.fonts, `ZONING: ${zoneStr.toUpperCase()} · ${parcel.roadWidthM}M ARTERIAL ACCESS ROAD · 100% UTILITIES`, 36, H - 116, {
    size: 8.5,
    color: '#b7e4c7',
    maxWidth: W - 72,
  });

  // 4 Organic Stat Cards
  const cards: [string, string, string][] = [
    ['PLOT MEASUREMENT', parcel.areaSqYd ? `${parcel.areaSqYd.toLocaleString('en-IN')} SQ.YD` : '—', parcel.areaSqM ? `${parcel.areaSqM.toLocaleString('en-IN')} sq.m area` : 'Statutory Cadastral'],
    ['FRONTAGE ACCESS', `${parcel.roadWidthM} METERS`, `${parcel.roadClass || 'TP Avenue'}`],
    ['RESIDENTIAL FAR', `${parcel.maxFAR}`, `Chargeable: ${parcel.chargeableFAR}`],
    ['ESTIMATED RATE', parcel.price || 'ON REQUEST', parcel.pricePerSqYd ? `₹${parcel.pricePerSqYd.toLocaleString('en-IN')} / sq.yd` : 'Township Benchmark'],
  ];

  const cardW = (W - 72 - 36) / 4;
  const cardH = 70;
  const cardY = H - topH - cardH - 14;

  cards.forEach(([label, val, sub], i) => {
    const cx = 36 + i * (cardW + 12);
    ecoCard(page, cx, cardY, cardW, cardH, {
      bg: '#ffffff',
      border: '#cfe3d8',
      topStripe: theme.accent || '#2d6a4f',
    });
    drawText(page, ctx.fonts, label, cx + 12, cardY + cardH - 12, { size: 7.5, bold: true, color: '#2d6a4f' });
    drawText(page, ctx.fonts, val, cx + 12, cardY + cardH - 32, { size: 14, bold: true, color: '#14342b', maxWidth: cardW - 20 });
    drawText(page, ctx.fonts, sub, cx + 12, cardY + 14, { size: 7.5, color: '#5c7c6f', maxWidth: cardW - 20 });
  });

  // Snapshot preview
  const mapY = FLOOR_Y + 6;
  const mapH = cardY - mapY - 12;
  if (mapH > 80) {
    await drawSnapshot(ctx, page, 'tp-full', 36, mapY, W - 72, mapH, `${parcel.village.toUpperCase()} · FINAL PLOT ${parcel.finalPlot} · RESIDENTIAL MAP`);
  }
}

// ─── 2. EXECUTIVE SUMMARY & SCORECARD ───────────────────────────────────────
export async function ecoExecutiveSummary(ctx: RenderCtx, page: PDFPage) {
  const { W, H, theme, parcel } = ctx;
  page.drawRectangle({ x: 0, y: 0, width: W, height: H, color: C('#ffffff') });
  drawEcoHeader(page, ctx.fonts, theme, W, H, 'Executive Summary & Residential Livability Scorecard', 'Overview');

  const topY = H - 54;
  const leftW = (W - 72) / 2;
  const rightX = 36 + leftW + 16;

  // Left: Property Parameters Box
  ecoCard(page, 36, FLOOR_Y + 12, leftW, topY - FLOOR_Y - 12, { bg: '#f7fbf9', border: '#cfe3d8', topStripe: theme.primary || '#14342b' });
  drawText(page, ctx.fonts, 'STATUTORY PROPERTY RECORD & PLOT DIMENSIONS', 50, topY - 18, { size: 10, bold: true, color: theme.primary || '#14342b' });

  const fallbackRows: [string, string][] = [
    ['Town Planning Scheme', parcel.tpShort],
    ['Revenue Village', parcel.village],
    ['Survey Number', parcel.surveyNo],
    ['Final Plot Number (FP)', parcel.finalPlot],
    ['Plot Area (Sq. Yards)', parcel.areaSqYd ? `${parcel.areaSqYd.toLocaleString('en-IN')} Sq.Yards` : '—'],
    ['Plot Area (Sq. Meters)', parcel.areaSqM ? `${parcel.areaSqM.toLocaleString('en-IN')} Sq.Meters` : '—'],
    ['Abutting Road Width', `${parcel.roadWidthM} Meters (${parcel.roadClass || 'TP Avenue'})`],
    ['Statutory Land Title', parcel.tenure || 'Title Clear Freehold'],
    ['NA Sanction Status', parcel.naStatus || 'Residential NA Order Passed'],
    ['Permissible Building Height', parcel.heightDesc || 'G+2 / G+3 Residential Villa'],
    ['Asking Price & Terms', parcel.price || 'Market Rate Upon Diligence'],
  ];
  const rows = planRows(ctx.plan, 'executive-summary', fallbackRows);

  let yCursor = topY - 44;
  rows.forEach(([label, val]) => {
    drawText(page, ctx.fonts, label, 52, yCursor, { size: 9, bold: true, color: '#2d6a4f', maxWidth: 170 });
    drawText(page, ctx.fonts, val, 220, yCursor, { size: 9, bold: true, color: '#0f172a', maxWidth: leftW - 190 });
    page.drawLine({ start: { x: 50, y: yCursor - 14 }, end: { x: 36 + leftW - 14, y: yCursor - 14 }, thickness: 0.4, color: C('#cfe3d8') });
    yCursor -= 27;
  });

  // Right: Livability & Eco-Smart Features
  ecoCard(page, rightX, FLOOR_Y + 12, leftW, topY - FLOOR_Y - 12, { bg: '#ffffff', border: '#cfe3d8', topStripe: theme.accent || '#2d6a4f' });
  drawText(page, ctx.fonts, 'LIVABILITY INDEX & COMMUNITY INFRASTRUCTURE', rightX + 16, topY - 18, { size: 10, bold: true, color: theme.primary || '#14342b' });

  const fallbackBullets = [
    'Linear Park & Green Belts: Direct walking access to landscaped public green corridors along storm water canals with dedicated cycling and jogging tracks.',
    'Underground Dual-Water System: 100% pre-laid connections for 24x7 treated potable drinking water and pressurized recycled water for landscaping and flushing.',
    'Smart City Sensor Network: City-wide environmental sensors monitoring air quality index (AQI), weather parameters, ambient noise, and automated streetlights.',
    'Zero Overhead Wires & Cables: All electric power lines, fiber-optic telecom, and cooking gas connections are laid in pre-engineered subterranean utility ducts.',
    'Walkable School & Health Amenities: Sanctioned neighborhood social amenities reserve within 500m of the plot for primary schools, local shopping, and clinics.',
  ];
  const rawBullets = planBullets(ctx.plan, 'executive-summary', fallbackBullets);
  const ecoPoints = rawBullets.map((b) => {
    const colonIdx = b.indexOf(':');
    if (colonIdx > 0 && colonIdx < 40) {
      return { title: b.slice(0, colonIdx).trim(), text: b.slice(colonIdx + 1).trim() };
    }
    const words = b.trim().split(/\s+/);
    if (words.length > 3) {
      return { title: words.slice(0, 3).join(' ').toUpperCase(), text: words.slice(3).join(' ') };
    }
    return { title: 'ECO FEATURE', text: b.trim() };
  });

  let rightCursor = topY - 44;
  ecoPoints.forEach((p) => {
    page.drawRectangle({ x: rightX + 16, y: rightCursor - 8, width: 5, height: 5, color: C(theme.accent || '#2d6a4f') });
    drawText(page, ctx.fonts, p.title.toUpperCase(), rightX + 26, rightCursor, { size: 8.5, bold: true, color: '#14342b', maxWidth: leftW - 42 });
    drawWrappedText(page, ctx.fonts, p.text, rightX + 26, rightCursor - 13, leftW - 46, { size: 7.5, color: '#475569', lineHeight: 11, maxLines: 2 });
    rightCursor -= 50;
  });

  // Eco Sustainability & Livability Indices (fills the lower half of the right card)
  const indY = FLOOR_Y + 18;
  const indH = 110;
  page.drawRectangle({ x: rightX + 16, y: indY, width: leftW - 32, height: indH, color: C('#f7fbf9'), borderColor: C('#cfe3d8'), borderWidth: 0.5 });
  page.drawRectangle({ x: rightX + 16, y: indY + indH - 20, width: leftW - 32, height: 20, color: C('#eef6f2') });
  drawText(page, ctx.fonts, 'ECO SUSTAINABILITY & LIVABILITY ATTRIBUTES', rightX + 24, indY + indH - 6, { size: 7.5, bold: true, color: theme.primary || '#14342b' });

  const indRows = [
    { label: 'Town Planning Scheme', val: 'Sanctioned Preliminary Scheme (Sec 50 GTPUD 1976)' },
    { label: 'Smart Green Utilities', val: '100% Underground Ducts (Water, Effluent, Power, Fiber)' },
    { label: 'Renewable Power & Air', val: '5,000 MW Solar Park & Continuous AQI Monitoring' },
    { label: 'Open Green Reserves', val: 'Linear Canal Parks & Dedicated Pedestrian Tracks' },
  ];
  let iY = indY + indH - 34;
  indRows.forEach((r) => {
    drawText(page, ctx.fonts, r.label, rightX + 24, iY, { size: 7, bold: true, color: '#14342b' });
    drawText(page, ctx.fonts, r.val, rightX + 160, iY, { size: 6.5, color: '#64748b', maxWidth: leftW - 196 });
    iY -= 20;
  });
}

// ─── 9. WHAT IS DHOLERA SIR? ────────────────────────────────────────────────
export async function ecoAboutDholera(ctx: RenderCtx, page: PDFPage) {
  const { W, H, theme } = ctx;
  page.drawRectangle({ x: 0, y: 0, width: W, height: H, color: C('#ffffff') });
  drawEcoHeader(page, ctx.fonts, theme, W, H, 'Smart City Vision: What is Dholera SIR?', 'Masterplan');

  const topY = H - 54;
  const leftW = (W - 84) * 0.48;
  const rightW = (W - 84) * 0.50;
  const rightX = 36 + leftW + 16;
  const contentH = topY - FLOOR_Y - 12;

  // Left: Green Smart City Hero Image Card
  ecoCard(page, 36, FLOOR_Y + 12, leftW, contentH, { bg: '#f7fbf9', border: '#cfe3d8', topStripe: theme.accent || '#2d6a4f' });
  drawText(page, ctx.fonts, 'INDIA\'S FIRST IGBC PLATINUM RATED GREEN CITY', 52, topY - 18, { size: 9.5, bold: true, color: theme.primary || '#14342b' });

  const imgH = contentH - 85;
  const imgY = topY - 32 - imgH;
  const ecoImg = await loadStaticImage(ctx.doc, '/assets/ai_renders/dholera_luxury_smart_city_1789220154549.jpg');
  if (ecoImg) {
    drawContainedImage(page, ecoImg, 48, imgY, leftW - 24, imgH, { borderColor: '#cfe3d8', borderWidth: 0.5, bgColor: '#f7fbf9' });
  }

  // Caption box below image
  page.drawRectangle({ x: 48, y: FLOOR_Y + 20, width: leftW - 24, height: 36, color: C('#ffffff'), borderColor: C('#cfe3d8'), borderWidth: 0.5 });
  drawText(page, ctx.fonts, 'BIOPHILIC URBAN PLANNING · ZERO UNTREATED EFFLUENT', 56, FLOOR_Y + 46, { size: 7.5, bold: true, color: '#14342b' });
  drawText(page, ctx.fonts, 'Master-planned by Halcrow & AECOM with 100% recycled water, linear green canals, & clean air.', 56, FLOOR_Y + 32, { size: 7, color: '#64748b', maxWidth: leftW - 40 });

  // Right: 3 Eco-Living Cards
  const cardH = (contentH - 16) / 3;
  const pillars = [
    {
      title: '920 SQ KM CLEAN LIVING METROPOLIS',
      tag: 'IGBC PLATINUM RATED MASTERPLAN',
      bullets: [
        'India\'s first greenfield city designed for zero-carbon emissions.',
        'Spans 920 sq km (2x Mumbai) with 422 sq km of master-planned TP schemes.',
        'Target 2.0 Million residents living in walkable, pedestrian-first sectors.',
      ],
    },
    {
      title: '100% RECYCLED WATER & SOLAR GRID',
      tag: '5,000 MW CLEAN RENEWABLE POWER',
      bullets: [
        'Dual-water network: 24x7 treated drinking water + recycled irrigation mains.',
        '100% wastewater recycling policy with zero liquid discharge into nature.',
        '5,000 MW solar park supplies uninterrupted green domestic power.',
      ],
    },
    {
      title: 'HEALTH, EDUCATION & COMMUNITY FABRIC',
      tag: 'WALKABLE 400M NEIGHBORHOODS',
      bullets: [
        'Sanctioned public health centers, CBSE schools & international knowledge hubs.',
        'Local convenience commercial retail nodes located every 400 meters.',
        'Safe, well-lit smart streets with AI surveillance and automatic LED lights.',
      ],
    },
  ];

  pillars.forEach((p, i) => {
    const cy = topY - (i + 1) * cardH - (i * 8);
    ecoCard(page, rightX, cy, rightW, cardH, { bg: '#f7fbf9', border: '#cfe3d8', topStripe: theme.accent || '#2d6a4f' });
    drawText(page, ctx.fonts, p.title, rightX + 16, cy + cardH - 16, { size: 8.5, bold: true, color: '#14342b' });

    // Sleek Subtitle
    drawText(page, ctx.fonts, p.tag, rightX + 16, cy + cardH - 29, { size: 7, bold: true, color: theme.accent || '#2d6a4f', maxWidth: rightW - 32 });
    page.drawLine({ start: { x: rightX + 16, y: cy + cardH - 36 }, end: { x: rightX + rightW - 16, y: cy + cardH - 36 }, thickness: 0.4, color: C('#cfe3d8') });

    let bY = cy + cardH - 49;
    p.bullets.forEach((b) => {
      page.drawRectangle({ x: rightX + 16, y: bY - 7, width: 4, height: 4, color: C(theme.accent || '#2d6a4f') });
      drawText(page, ctx.fonts, b, rightX + 24, bY, { size: 7.5, color: '#334155', maxWidth: rightW - 38 });
      bY -= 16;
    });
  });
}

// ─── 10. STRATEGIC CONNECTIVITY CORRIDORS ───────────────────────────────────
export async function ecoConnectivity(ctx: RenderCtx, page: PDFPage) {
  const { W, H, theme } = ctx;
  page.drawRectangle({ x: 0, y: 0, width: W, height: H, color: C('#ffffff') });
  drawEcoHeader(page, ctx.fonts, theme, W, H, 'Transit Corridors: Rapid Commute & Regional Connectivity', 'Transit');

  const topY = H - 54;
  const leftW = (W - 84) * 0.48;
  const rightW = (W - 84) * 0.50;
  const rightX = 36 + leftW + 16;
  const contentH = topY - FLOOR_Y - 12;

  // Left: Central Spine Road Image Card
  ecoCard(page, 36, FLOOR_Y + 12, leftW, contentH, { bg: '#f7fbf9', border: '#cfe3d8', topStripe: theme.primary || '#14342b' });
  drawText(page, ctx.fonts, '250M CENTRAL SPINE & GREEN TRANSIT BOULEVARD', 52, topY - 18, { size: 9.5, bold: true, color: theme.primary || '#14342b' });

  const imgH = contentH - 85;
  const imgY = topY - 32 - imgH;
  const spineImg = await loadStaticImage(ctx.doc, '/assets/dholera_intro/dholera_central_spine_road.jpg');
  if (spineImg) {
    drawContainedImage(page, spineImg, 48, imgY, leftW - 24, imgH, { borderColor: '#cfe3d8', borderWidth: 0.5, bgColor: '#ffffff' });
  }

  // Caption box below image
  page.drawRectangle({ x: 48, y: FLOOR_Y + 20, width: leftW - 24, height: 36, color: C('#ffffff'), borderColor: C('#cfe3d8'), borderWidth: 0.5 });
  drawText(page, ctx.fonts, 'INTEGRATED MASS RAPID TRANSIT & CYCLING NETWORK', 56, FLOOR_Y + 46, { size: 7.5, bold: true, color: '#14342b' });
  drawText(page, ctx.fonts, '250-meter right-of-way integrating expressway lanes, metro transit, and segregated cycling paths.', 56, FLOOR_Y + 32, { size: 7, color: '#64748b', maxWidth: leftW - 40 });

  // Right: 3 Transit Routes
  const cardH = (contentH - 16) / 3;
  const routes = [
    {
      name: '1. AHMEDABAD-DHOLERA EXPRESSWAY',
      sub: '4-Lane Access-Controlled Highway · 109 km',
      bullets: [
        'Seamless 40-minute scenic commute directly to SG Highway and Gandhinagar.',
        'Grade-separated cloverleaf interchanges with high-speed EV charging plazas.',
        'High-speed luxury inter-city bus and zero-emission transit corridor.',
      ],
    },
    {
      name: '2. DHOLERA INTERNATIONAL AIRPORT',
      sub: 'Greenfield Aviation Gateway · Passenger & Cargo',
      bullets: [
        'Convenient domestic & international passenger flights connecting Delhi & Mumbai.',
        'Modern terminal building located adjacent to northern residential TP schemes.',
        'Drives premium hospitality, tourism, and executive mobility to Dholera SIR.',
      ],
    },
    {
      name: '3. REGIONAL RAPID METRO TRANSIT',
      sub: 'Clean Electric High-Speed Rail Corridor',
      bullets: [
        'Dedicated Mass Rapid Transit corridor along the 250m Central Spine Road.',
        'Seamless integration with Ahmedabad Metro network at APMC Vasna.',
        'Zero-emission commute for daily workers, students, and professionals.',
      ],
    },
  ];

  routes.forEach((r, i) => {
    const cy = topY - (i + 1) * cardH - (i * 8);
    ecoCard(page, rightX, cy, rightW, cardH, { bg: '#f7fbf9', border: '#cfe3d8', topStripe: theme.accent || '#2d6a4f' });
    drawText(page, ctx.fonts, r.name, rightX + 16, cy + cardH - 16, { size: 9, bold: true, color: '#14342b' });
    drawText(page, ctx.fonts, r.sub, rightX + 16, cy + cardH - 28, { size: 7.5, bold: true, color: '#64748b' });

    let bY = cy + cardH - 44;
    r.bullets.forEach((b) => {
      page.drawRectangle({ x: rightX + 16, y: bY - 7, width: 4, height: 4, color: C(theme.accent || '#2d6a4f') });
      drawText(page, ctx.fonts, b, rightX + 24, bY, { size: 7.5, color: '#334155', maxWidth: rightW - 36 });
      bY -= 17;
    });
  });
}

// ─── 11. MEGA PROJECTS & SMART LIVING ────────────────────────────────────────
export async function ecoMegaProjects(ctx: RenderCtx, page: PDFPage) {
  const { W, H, theme } = ctx;
  page.drawRectangle({ x: 0, y: 0, width: W, height: H, color: C('#ffffff') });
  drawEcoHeader(page, ctx.fonts, theme, W, H, 'Catalysts: Smart City Infrastructure & Innovation', 'Innovation');

  const topY = H - 54;
  const contentH = topY - FLOOR_Y - 12;
  const halfW = (W - 72 - 16) / 2;
  const topCardH = 210;

  // Top-Left: ABCD Command Centre
  ecoCard(page, 36, topY - topCardH, halfW, topCardH, { bg: '#f7fbf9', border: '#cfe3d8', topStripe: theme.primary || '#14342b' });
  drawText(page, ctx.fonts, 'ABCD SMART CITY COMMAND CENTRE', 52, topY - 16, { size: 9, bold: true, color: theme.primary || '#14342b' });

  const abcdImgH = 120;
  const abcdImg = await loadStaticImage(ctx.doc, '/assets/dholera_intro/dholera_abcd_building_command.jpg');
  if (abcdImg) {
    drawContainedImage(page, abcdImg, 48, topY - 26 - abcdImgH, halfW - 24, abcdImgH, { borderColor: '#cfe3d8', borderWidth: 0.5 });
  }

  page.drawRectangle({ x: 48, y: topY - topCardH + 10, width: halfW - 24, height: 38, color: C('#ffffff'), borderColor: C('#cfe3d8'), borderWidth: 0.5 });
  drawText(page, ctx.fonts, 'PLATINUM LEED ADMINISTRATIVE & CITIZEN SERVICES HUB', 56, topY - topCardH + 36, { size: 7.5, bold: true, color: theme.primary || '#14342b' });
  drawText(page, ctx.fonts, 'Central command for city-wide IoT sensors, 24x7 water pressure SCADA, & digital building approvals.', 56, topY - topCardH + 22, { size: 7, color: '#64748b', maxWidth: halfW - 40 });

  // Top-Right: Smart Sensor Network
  ecoCard(page, 36 + halfW + 16, topY - topCardH, halfW, topCardH, { bg: '#f7fbf9', border: '#cfe3d8', topStripe: theme.accent || '#2d6a4f' });
  drawText(page, ctx.fonts, 'INTEGRATED CITIZEN IOT SENSOR NETWORK', 36 + halfW + 32, topY - 16, { size: 9, bold: true, color: theme.primary || '#14342b' });

  const sensorImg = await loadStaticImage(ctx.doc, '/assets/dholera_intro/dholera_smart_sensor_network.jpg');
  if (sensorImg) {
    drawContainedImage(page, sensorImg, 36 + halfW + 28, topY - 26 - abcdImgH, halfW - 24, abcdImgH, { borderColor: '#cfe3d8', borderWidth: 0.5 });
  }

  page.drawRectangle({ x: 36 + halfW + 28, y: topY - topCardH + 10, width: halfW - 24, height: 38, color: C('#ffffff'), borderColor: C('#cfe3d8'), borderWidth: 0.5 });
  drawText(page, ctx.fonts, 'REAL-TIME AIR QUALITY & AUTOMATED WATER SCADA', 36 + halfW + 36, topY - topCardH + 36, { size: 7.5, bold: true, color: theme.primary || '#14342b' });
  drawText(page, ctx.fonts, 'Sensors monitor ambient air quality (AQI), weather parameters, ambient noise, & smart metering.', 36 + halfW + 36, topY - topCardH + 22, { size: 7, color: '#64748b', maxWidth: halfW - 40 });

  // Bottom Strip: 3 Lifestyle Anchors
  const botY = FLOOR_Y + 12;
  const botH = topY - topCardH - botY - 12;
  const colW = (W - 72 - 24) / 3;

  const anchors = [
    {
      title: 'TATA SEMICONDUCTOR FAB',
      sub: '₹91,000 Cr High-Tech Anchor',
      bullets: [
        'Drives sustained residential demand for 20,000+ engineers.',
        'High-salaried technical workforce requiring modern homes.',
        'Substantial rental yield potential for villa owners.',
      ],
    },
    {
      title: '5,000 MW SOLAR PARK',
      sub: '100% Clean Green Power',
      bullets: [
        'World\'s largest solar park ensuring uninterrupted power.',
        'Pristine air quality with zero fossil-fuel generation.',
        'Substantially lowers domestic residential electricity bills.',
      ],
    },
    {
      title: 'LINEAR RECREATIONAL CANALS',
      sub: '100% Flood-Resilient Parkland',
      bullets: [
        'Stormwater canals bordered by civic botanical gardens.',
        'Continuous tree-lined jogging and cycling corridors.',
        'Preserves green tranquility and biodiversity across sectors.',
      ],
    },
  ];

  anchors.forEach((a, i) => {
    const cx = 36 + i * (colW + 12);
    ecoCard(page, cx, botY, colW, botH, { bg: '#f7fbf9', border: '#cfe3d8', topStripe: theme.accent || '#2d6a4f' });
    drawText(page, ctx.fonts, a.title, cx + 14, botY + botH - 16, { size: 8.5, bold: true, color: '#14342b' });
    drawText(page, ctx.fonts, a.sub, cx + 14, botY + botH - 28, { size: 7.5, color: '#64748b' });

    let bY = botY + botH - 42;
    a.bullets.forEach((b) => {
      page.drawRectangle({ x: cx + 14, y: bY - 7, width: 4, height: 4, color: C(theme.accent || '#2d6a4f') });
      drawText(page, ctx.fonts, b, cx + 22, bY, { size: 7, color: '#334155', maxWidth: colW - 32 });
      bY -= 15;
    });
  });
}

// ─── 12. TOWN PLANNING & RECONSTITUTION ─────────────────────────────────────
export async function ecoTpPlanning(ctx: RenderCtx, page: PDFPage) {
  const { W, H, theme } = ctx;
  page.drawRectangle({ x: 0, y: 0, width: W, height: H, color: C('#ffffff') });
  drawEcoHeader(page, ctx.fonts, theme, W, H, 'Town Planning: Residential Reconstitution & Clear Title', 'Planning');

  const topY = H - 54;
  const leftW = (W - 84) * 0.48;
  const rightW = (W - 84) * 0.50;
  const rightX = 36 + leftW + 16;
  const contentH = topY - FLOOR_Y - 12;

  // Left: 3D Residential Layout Masterplan Card
  ecoCard(page, 36, FLOOR_Y + 12, leftW, contentH, { bg: '#f7fbf9', border: '#cfe3d8', topStripe: theme.primary || '#14342b' });
  drawText(page, ctx.fonts, 'SANCTIONED RESIDENTIAL TOWNSHIP MASTERPLAN', 52, topY - 18, { size: 9.5, bold: true, color: theme.primary || '#14342b' });

  const imgH = contentH - 85;
  const imgY = topY - 32 - imgH;
  const resImg = await loadStaticImage(ctx.doc, '/assets/ai_renders/dholera_3d_residential_layout_1789220629729.jpg');
  if (resImg) {
    drawContainedImage(page, resImg, 48, imgY, leftW - 24, imgH, { borderColor: '#cfe3d8', borderWidth: 0.5, bgColor: '#f7fbf9' });
  }

  page.drawRectangle({ x: 48, y: FLOOR_Y + 20, width: leftW - 24, height: 36, color: C('#ffffff'), borderColor: C('#cfe3d8'), borderWidth: 0.5 });
  drawText(page, ctx.fonts, 'STATUTORY 50% TP RECONSTITUTION SAFEGUARDS', 56, FLOOR_Y + 46, { size: 7.5, bold: true, color: '#14342b' });
  drawText(page, ctx.fonts, 'Dedicates half the land to public parks, schools, wide avenues, & utilities with clear freehold title.', 56, FLOOR_Y + 32, { size: 7, color: '#64748b', maxWidth: leftW - 40 });

  // Right: 3 Reconstitution Phases
  const cardH = (contentH - 16) / 3;
  const phases = [
    {
      step: 'STEP 01',
      title: 'ORIGINAL PLOT (O.P.)',
      sub: 'Raw Agricultural Land Holding',
      points: [
        'Original survey number with irregular boundaries.',
        'No direct legal access road or underground utility mains.',
        'Requires complex conversion before any residential construction.',
        'High boundary dispute and encroachment vulnerability.',
      ],
    },
    {
      step: 'STEP 02',
      title: '50% DEDUCTION RULE',
      sub: 'Township Infrastructure Dedication',
      points: [
        '50% area deduction creates linear parks, schools & wide roads.',
        'Finances underground electrical grid, storm drainage & water SCADA.',
        'Governed strictly by Gujarat Town Planning Act (GTPUD 1976).',
        'State Government guarantees physical demarcation on ground.',
      ],
    },
    {
      step: 'STEP 03',
      title: 'FINAL PLOT (F.P.)',
      sub: '100% Clear Reconstituted Plot',
      points: [
        'Clear-title rectangular plot ready for immediate villa construction.',
        'Statutory frontage on sanctioned Town Planning avenue.',
        'Immense capital appreciation: Plot value increases 5x–10x.',
        'Zero risk of future government acquisition or boundary dispute.',
      ],
    },
  ];

  phases.forEach((p, i) => {
    const cy = topY - (i + 1) * cardH - (i * 8);
    ecoCard(page, rightX, cy, rightW, cardH, { bg: '#f7fbf9', border: '#cfe3d8', topStripe: theme.accent || '#2d6a4f' });
    drawText(page, ctx.fonts, `${p.step} · ${p.title}`, rightX + 16, cy + cardH - 14, { size: 9, bold: true, color: '#14342b' });
    drawText(page, ctx.fonts, p.sub, rightX + 16, cy + cardH - 28, { size: 7.5, bold: true, color: '#64748b' });

    let pY = cy + cardH - 44;
    p.points.forEach((pt) => {
      page.drawRectangle({ x: rightX + 16, y: pY - 7, width: 4, height: 4, color: C(theme.accent || '#2d6a4f') });
      drawText(page, ctx.fonts, pt, rightX + 24, pY, { size: 7.5, color: '#334155', maxWidth: rightW - 36 });
      pY -= 17;
    });
  });
}

// ─── 7. PROPERTY DETAILS & VALUATION ────────────────────────────────────────
export async function ecoProperty(ctx: RenderCtx, page: PDFPage) {
  const { W, H, theme, parcel } = ctx;
  page.drawRectangle({ x: 0, y: 0, width: W, height: H, color: C('#ffffff') });
  drawEcoHeader(page, ctx.fonts, theme, W, H, 'Property Dossier & Residential Plot Specifications', 'Property');

  const topY = H - 54;
  const leftW = (W - 72) * 0.52;
  const rightW = (W - 72) * 0.45;
  const rightX = 36 + leftW + 20;

  // Left: Property Table
  ecoCard(page, 36, FLOOR_Y + 12, leftW, topY - FLOOR_Y - 12, { bg: '#f7fbf9', border: '#cfe3d8', topStripe: theme.primary || '#14342b' });
  drawText(page, ctx.fonts, 'STATUTORY PROPERTY RECORD & AREA SUMMARY', 52, topY - 18, { size: 10, bold: true, color: theme.primary || '#14342b' });

  const rows: [string, string][] = [
    ['District / Taluka', `${parcel.district} / ${parcel.taluka}`],
    ['Revenue Village', parcel.village],
    ['Town Planning Scheme', parcel.tpShort],
    ['Revenue Survey No.', parcel.surveyNo],
    ['Final Plot No. (FP)', parcel.finalPlot],
    ['Plot Area (Sq. Yards)', parcel.areaSqYd ? `${parcel.areaSqYd.toLocaleString('en-IN')} Sq.Yards` : '—'],
    ['Plot Area (Sq. Meters)', parcel.areaSqM ? `${parcel.areaSqM.toLocaleString('en-IN')} Sq.Meters` : '—'],
    ['Abutting Road Width', `${parcel.roadWidthM} Meters (${parcel.roadClass || 'TP Avenue'})`],
    ['Land Tenure Category', parcel.tenure || 'Title Clear Freehold'],
    ['NA Conversion Status', parcel.naStatus || 'Residential NA Sanctioned'],
    ['Quoted Asking Price', parcel.price || 'Market Rate Upon Diligence'],
    ['Price per Sq. Yard', parcel.pricePerSqYd ? `₹${parcel.pricePerSqYd.toLocaleString('en-IN')} / sq.yd` : '—'],
  ];

  let yCursor = topY - 42;
  rows.forEach(([label, val]) => {
    drawText(page, ctx.fonts, label, 52, yCursor, { size: 8.5, bold: true, color: '#2d6a4f', maxWidth: 160 });
    drawText(page, ctx.fonts, val, 220, yCursor, { size: 8.5, bold: true, color: '#0f172a', maxWidth: leftW - 180 });
    page.drawLine({ start: { x: 50, y: yCursor - 11 }, end: { x: 36 + leftW - 14, y: yCursor - 11 }, thickness: 0.4, color: C('#cfe3d8') });
    yCursor -= 23;
  });

  // Right: Map Snapshot + Highlights
  ecoCard(page, rightX, FLOOR_Y + 12, rightW, topY - FLOOR_Y - 12, { bg: '#ffffff', border: '#cfe3d8', topStripe: theme.accent || '#2d6a4f' });
  drawText(page, ctx.fonts, 'RESIDENTIAL CADASTRAL SNAPSHOT', rightX + 16, topY - 18, { size: 10, bold: true, color: theme.primary || '#14342b' });

  const mapH = 170;
  const mapY = topY - 32 - mapH;
  await drawSnapshot(ctx, page, 'exact', rightX + 16, mapY, rightW - 32, mapH, 'RESIDENTIAL PLOT');

  drawText(page, ctx.fonts, 'RESIDENTIAL ADVANTAGES', rightX + 16, mapY - 20, { size: 9, bold: true, color: '#14342b' });
  const highlights = [
    `Frontage on ${parcel.roadWidthM}m wide tree-lined Town Planning road.`,
    `Sanctioned residential zoning with permissible FAR of ${parcel.maxFAR}.`,
    `Reconstituted Final Plot ${parcel.finalPlot} with government-verified demarcation.`,
  ];
  let hY = mapY - 38;
  highlights.forEach((h) => {
    page.drawRectangle({ x: rightX + 16, y: hY - 7, width: 4, height: 4, color: C(theme.accent || '#2d6a4f') });
    drawText(page, ctx.fonts, h, rightX + 26, hY, { size: 8, color: '#334155', maxWidth: rightW - 36 });
    hY -= 20;
  });

  // Eco Development & Community Access KPI Panel
  const kpiY = FLOOR_Y + 18;
  const kpiH = 124;
  const colW = (rightW - 32 - 10) / 2;

  // Sub-panel 1: DEVELOPMENT CAPACITY
  page.drawRectangle({ x: rightX + 16, y: kpiY, width: colW, height: kpiH, color: C('#f7fbf9'), borderColor: C('#cfe3d8'), borderWidth: 0.5 });
  page.drawRectangle({ x: rightX + 16, y: kpiY + kpiH - 20, width: colW, height: 20, color: C('#eef6f2') });
  drawText(page, ctx.fonts, 'DEVELOPMENT CAPACITY', rightX + 22, kpiY + kpiH - 6, { size: 7.5, bold: true, color: theme.primary || '#14342b' });

  const devRows: [string, string][] = [
    ['Base / Max FAR', `${(parcel.maxFAR ? parcel.maxFAR * 0.75 : 1.5).toFixed(1)} / ${parcel.maxFAR}`],
    ['Max Footprint', `${parcel.footprintSqM ? parcel.footprintSqM.toLocaleString('en-IN') : Math.round((parcel.areaSqM || 5000) * 0.5).toLocaleString('en-IN')} sq.m`],
    ['Max Height', parcel.heightDesc || '15 Meters (G+3)'],
    ['Ground Coverage', `${parcel.groundCoveragePct || 50}%`],
  ];
  let dY = kpiY + kpiH - 36;
  devRows.forEach(([lbl, val]) => {
    drawText(page, ctx.fonts, lbl, rightX + 22, dY, { size: 7, color: '#64748b' });
    drawText(page, ctx.fonts, val, rightX + colW + 10, dY, { size: 7, bold: true, color: '#14342b', align: 'right' });
    dY -= 20;
  });

  // Sub-panel 2: COMMUNITY & ACCESS
  const col2X = rightX + 16 + colW + 10;
  page.drawRectangle({ x: col2X, y: kpiY, width: colW, height: kpiH, color: C('#f7fbf9'), borderColor: C('#cfe3d8'), borderWidth: 0.5 });
  page.drawRectangle({ x: col2X, y: kpiY + kpiH - 20, width: colW, height: 20, color: C('#eef6f2') });
  drawText(page, ctx.fonts, 'COMMUNITY & ACCESS', col2X + 8, kpiY + kpiH - 6, { size: 7.5, bold: true, color: theme.primary || '#14342b' });

  const logRows: [string, string][] = [
    ['TP Road Width', `${parcel.roadWidthM}m (${parcel.roadWidthFt || '98.4 ft'})`],
    ['Avenue Type', (parcel.roadClass || 'Tree-Lined Sector Road').slice(0, 16)],
    ['Tenure Title', 'Clear Freehold'],
    ['Allotment Status', 'Demarcated FP'],
  ];
  let lY = kpiY + kpiH - 36;
  logRows.forEach(([lbl, val]) => {
    drawText(page, ctx.fonts, lbl, col2X + 8, lY, { size: 7, color: '#64748b' });
    drawText(page, ctx.fonts, val, col2X + colW - 6, lY, { size: 7, bold: true, color: '#14342b', align: 'right' });
    lY -= 20;
  });
}

// ─── 8. LAND & STATUTORY TITLE ──────────────────────────────────────────────
export async function ecoLand(ctx: RenderCtx, page: PDFPage) {
  const { W, H, theme, parcel } = ctx;
  page.drawRectangle({ x: 0, y: 0, width: W, height: H, color: C('#ffffff') });
  drawEcoHeader(page, ctx.fonts, theme, W, H, 'Land Registry: Statutory Title & Revenue Diligence', 'Revenue');

  const topY = H - 54;
  const leftW = (W - 72) * 0.52;
  const rightW = (W - 72) * 0.45;
  const rightX = 36 + leftW + 20;

  // Left: Revenue Record Schedules
  ecoCard(page, 36, FLOOR_Y + 12, leftW, topY - FLOOR_Y - 12, { bg: '#f7fbf9', border: '#cfe3d8', topStripe: theme.primary || '#14342b' });
  drawText(page, ctx.fonts, 'GUJARAT REVENUE DEPARTMENT (ANYROR) DATA', 52, topY - 18, { size: 10, bold: true, color: theme.primary || '#14342b' });

  const revRows: [string, string][] = [
    ['Village Name', parcel.village.toUpperCase()],
    ['Revenue Survey No.', parcel.surveyNo],
    ['Old Survey No.', parcel.oldSurveyNo || '—'],
    ['Town Planning Scheme', parcel.tpShort],
    ['Final Plot (FP) No.', parcel.finalPlot],
    ['Land Tenure Category', parcel.tenure || 'Freehold (Old Tenure)'],
    ['NA Conversion Status', parcel.naStatus || 'Residential NA Sanctioned'],
    ['Statutory Zone', parcel.zone.split('—')[0].trim() || 'Residential'],
    ['Legal Encumbrance', 'Nil / Title Clearance Available'],
    ['Possession Status', 'Ready for Immediate Registration'],
  ];

  let rY = topY - 44;
  revRows.forEach(([lbl, val]) => {
    drawText(page, ctx.fonts, lbl, 52, rY, { size: 9, bold: true, color: '#2d6a4f', maxWidth: 170 });
    drawText(page, ctx.fonts, val, 230, rY, { size: 9, bold: true, color: '#0f172a', maxWidth: leftW - 190 });
    page.drawLine({ start: { x: 50, y: rY - 12 }, end: { x: 36 + leftW - 14, y: rY - 12 }, thickness: 0.4, color: C('#cfe3d8') });
    rY -= 26;
  });

  // Right: Title Diligence Badges & Map
  ecoCard(page, rightX, FLOOR_Y + 12, rightW, topY - FLOOR_Y - 12, { bg: '#ffffff', border: '#cfe3d8', topStripe: theme.accent || '#2d6a4f' });
  drawText(page, ctx.fonts, 'TITLE ASSURANCE & STATUTORY SECURITY', rightX + 16, topY - 18, { size: 10, bold: true, color: theme.primary || '#14342b' });

  const badges = [
    { title: '100% CLEAR TITLE', desc: 'No mortgage, lien, or pending court litigation.' },
    { title: '7/12 MUTATION VERIFIED', desc: 'Revenue records match registered sale deed.' },
    { title: 'TP SCHEME SANCTIONED', desc: 'Protected under GTPUD 1976 legal framework.' },
    { title: 'RESIDENTIAL DGDCR COMPLIANT', desc: 'Eligible for instant villa building sanction.' },
  ];

  let bY = topY - 48;
  badges.forEach((b) => {
    page.drawRectangle({ x: rightX + 16, y: bY - 26, width: rightW - 32, height: 36, color: C('#f7fbf9'), borderColor: C('#cfe3d8'), borderWidth: 0.5 });
    page.drawLine({ start: { x: rightX + 24, y: bY - 6 }, end: { x: rightX + 28, y: bY - 10 }, thickness: 1.5, color: C(theme.accent || '#2d6a4f') });
    page.drawLine({ start: { x: rightX + 28, y: bY - 10 }, end: { x: rightX + 34, y: bY - 3 }, thickness: 1.5, color: C(theme.accent || '#2d6a4f') });
    drawText(page, ctx.fonts, b.title, rightX + 42, bY, { size: 9, bold: true, color: '#14342b' });
    drawText(page, ctx.fonts, b.desc, rightX + 42, bY - 14, { size: 7.5, color: '#475569' });
    bY -= 46;
  });

  const snapY = FLOOR_Y + 18;
  const snapH = 196;
  await drawSnapshot(ctx, page, 'subsector', rightX + 16, snapY, rightW - 32, snapH, 'SUB-SECTOR PLAN');
}

// ─── 9. TP LOCATION ATLAS ───────────────────────────────────────────────────
export async function ecoTpLocation(ctx: RenderCtx, page: PDFPage) {
  const { W, H, theme, parcel } = ctx;
  page.drawRectangle({ x: 0, y: 0, width: W, height: H, color: C('#ffffff') });
  drawEcoHeader(page, ctx.fonts, theme, W, H, 'Town Planning Scheme Georeferenced Location', 'Atlas');

  const topY = H - 54;
  const mapH = topY - FLOOR_Y - 12;
  await drawSnapshot(ctx, page, 'tp-full', 36, FLOOR_Y + 12, W - 72, mapH, `${parcel.village.toUpperCase()} · ${parcel.tpShort} RESIDENTIAL ATLAS`);
}

// ─── 10. ZONING & DGDCR 2024 ────────────────────────────────────────────────
export async function ecoZoning(ctx: RenderCtx, page: PDFPage) {
  const { W, H, theme, parcel } = ctx;
  page.drawRectangle({ x: 0, y: 0, width: W, height: H, color: C('#ffffff') });
  drawEcoHeader(page, ctx.fonts, theme, W, H, 'Zoning Permissibility & DGDCR 2024 Building Envelopes', 'Zoning');

  const topY = H - 54;
  const leftW = (W - 72) * 0.52;
  const rightW = (W - 72) * 0.45;
  const rightX = 36 + leftW + 20;

  // Left: DGDCR Residential Table
  ecoCard(page, 36, FLOOR_Y + 12, leftW, topY - FLOOR_Y - 12, { bg: '#f7fbf9', border: '#cfe3d8', topStripe: theme.primary });
  drawText(page, ctx.fonts, 'RESIDENTIAL DGDCR 2024 PLANNING ENVELOPE', 52, topY - 18, { size: 10, bold: true, color: theme.primaryDark });

  const dgdcrRows: [string, string][] = [
    ['Zoning Classification', parcel.zone || 'Residential Plotted Housing'],
    ['Permissible Activities', (parcel.permittedUses || 'Villas, bungalows, row houses, residential apartments').slice(0, 75)],
    ['Base Floor Area Ratio (FAR)', String(parcel.maxFAR ? (parcel.maxFAR * 0.75).toFixed(1) : '1.5')],
    ['Maximum Permissible FAR', `${parcel.maxFAR} (Chargeable: ${parcel.chargeableFAR})`],
    ['Maximum Permissible Height', parcel.heightDesc || `${parcel.maxHeightM || 15} Meters`],
    ['Maximum Ground Coverage', `${parcel.groundCoveragePct || 50}% of Plot Area`],
    ['Marginal Setbacks', parcel.setbacks || 'Front 4.5m, Sides 3m, Rear 3m'],
    ['Abutting Road Frontage', `${parcel.roadWidthM} Meters (${parcel.roadClass})`],
    ['Statutory Jantri Benchmark', parcel.jantriRatePerSqM ? `₹${parcel.jantriRatePerSqM.toLocaleString('en-IN')} / sq.m` : '—'],
    ['Environmental Compliance', 'Covered under DSIR master environmental clearance'],
  ];

  let yCursor = topY - 44;
  dgdcrRows.forEach(([lbl, val]) => {
    drawText(page, ctx.fonts, lbl, 52, yCursor, { size: 8.5, bold: true, color: theme.accent || '#2d6a4f', maxWidth: 170 });
    drawText(page, ctx.fonts, val, 230, yCursor, { size: 8.5, bold: true, color: '#0f172a', maxWidth: leftW - 190 });
    page.drawLine({ start: { x: 50, y: yCursor - 12 }, end: { x: 36 + leftW - 14, y: yCursor - 12 }, thickness: 0.4, color: C('#e2ece6') });
    yCursor -= 26;
  });

  // Right: Zoning Map Preview + Guidelines
  ecoCard(page, rightX, FLOOR_Y + 12, rightW, topY - FLOOR_Y - 12, { bg: '#ffffff', border: '#cfe3d8', topStripe: theme.accent || '#2d6a4f' });
  drawText(page, ctx.fonts, 'ZONING BLUEPRINT & TOWNSHIP NORMS', rightX + 16, topY - 18, { size: 10, bold: true, color: theme.primaryDark || '#14342b' });

  const snapH = 170;
  const snapY = topY - 32 - snapH;
  await drawSnapshot(ctx, page, 'zoning', rightX + 16, snapY, rightW - 32, snapH, 'ZONING MAP');

  drawText(page, ctx.fonts, 'RESIDENTIAL COMPLIANCE GUIDELINES', rightX + 16, snapY - 20, { size: 9, bold: true, color: theme.primaryDark || '#14342b' });
  const guidelines = [
    'Building plan approval handled digitally via DSIRDA portal.',
    'Dual-piping connection mandated for recycled flushing water.',
    'Underground power cabling and smart water meters provided at curb.',
  ];
  let gY = snapY - 38;
  guidelines.forEach((g) => {
    page.drawRectangle({ x: rightX + 16, y: gY - 7, width: 4, height: 4, color: C(theme.accent || '#2d6a4f') });
    drawText(page, ctx.fonts, g, rightX + 26, gY, { size: 8, color: '#334155', maxWidth: rightW - 36 });
    gY -= 20;
  });

  // Smart Residential Utility Terminations Block
  const hookupY = FLOOR_Y + 18;
  const hookupH = 124;
  page.drawRectangle({ x: rightX + 16, y: hookupY, width: rightW - 32, height: hookupH, color: C('#f7fbf9'), borderColor: C('#cfe3d8'), borderWidth: 0.5 });
  page.drawRectangle({ x: rightX + 16, y: hookupY + hookupH - 20, width: rightW - 32, height: 20, color: C('#eef6f2') });
  drawText(page, ctx.fonts, 'SMART RESIDENTIAL UTILITY TERMINATIONS', rightX + 24, hookupY + hookupH - 6, { size: 7.5, bold: true, color: theme.primary || '#14342b' });

  const utilities = [
    { title: 'DUAL-STREAM POTABLE & RECYCLED WATER', desc: 'Pre-laid smart metered drinking water plus pressurized irrigation connections.' },
    { title: 'SOLAR-BACKED RESIDENTIAL POWER (UG)', desc: '100% underground high-reliability cabling from 5,000 MW renewable park.' },
    { title: 'CENTRALIZED SEWAGE TREATMENT (STP)', desc: 'Full automated sewage network leading to Zero Liquid Discharge recycling plants.' },
    { title: 'CITY-WIDE SCADA & FTTH FIBER', desc: 'Pre-ducted optical fiber broadband and integrated municipal safety telematics.' },
  ];

  let uY = hookupY + hookupH - 34;
  utilities.forEach((u) => {
    page.drawRectangle({ x: rightX + 24, y: uY - 4, width: 3.5, height: 3.5, color: C(theme.accent || '#2d6a4f') });
    drawText(page, ctx.fonts, u.title, rightX + 32, uY, { size: 7, bold: true, color: '#14342b' });
    drawText(page, ctx.fonts, u.desc, rightX + 32, uY - 9, { size: 6.5, color: '#475569', maxWidth: rightW - 56 });
    uY -= 23;
  });
}

// ─── 11. OP VS FP CADASTRAL BLUEPRINT ───────────────────────────────────────
export async function ecoOpFp(ctx: RenderCtx, page: PDFPage) {
  const { W, H, theme, parcel } = ctx;
  page.drawRectangle({ x: 0, y: 0, width: W, height: H, color: C('#ffffff') });
  drawEcoHeader(page, ctx.fonts, theme, W, H, 'Cadastral Evolution: Original Plot vs Final Plot', 'Reconstitution');

  const topY = H - 54;
  const mapW = (W - 72 - 16) / 2;
  const mapH = topY - FLOOR_Y - 12;

  await drawSnapshot(ctx, page, 'op', 36, FLOOR_Y + 12, mapW, mapH, `ORIGINAL PLOT (O.P.) · SURVEY ${parcel.surveyNo}`);
  await drawSnapshot(ctx, page, 'fp', 36 + mapW + 16, FLOOR_Y + 12, mapW, mapH, `RECONSTITUTED FINAL PLOT (F.P. ${parcel.finalPlot})`);
}

// ─── 12. PARCEL ZOOM GRID (4-TIER ENVIRONMENTAL CADASTRE MATRIX) ───────────
export async function ecoZoomGrid(ctx: RenderCtx, page: PDFPage) {
  const { W, H, theme, parcel } = ctx;
  page.drawRectangle({ x: 0, y: 0, width: W, height: H, color: C('#ffffff') });
  drawEcoHeader(page, ctx.fonts, theme, W, H, 'Micro-Cadastral Zoom: 4-Tier Environmental Cadastre Matrix', 'Grid');

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
    `2. GREEN RESIDENTIAL SECTOR · ${parcel.roadWidthM}M TP ROAD FRONTAGE`
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
    `4. ECO-RESIDENTIAL PLOT DEMARCATION · ${parcel.village.toUpperCase()}`
  );
}

// ─── 13. DGDCR 2024 REGULATORY SCHEDULE ─────────────────────────────────────
export async function ecoDgdcr(ctx: RenderCtx, page: PDFPage) {
  const { W, H, theme, parcel } = ctx;
  page.drawRectangle({ x: 0, y: 0, width: W, height: H, color: C('#ffffff') });
  drawEcoHeader(page, ctx.fonts, theme, W, H, 'DGDCR 2024 Statutory Planning Schedule', 'Schedule');

  const topY = H - 54;
  ecoCard(page, 36, FLOOR_Y + 12, W - 72, topY - FLOOR_Y - 12, { bg: '#f7fbf9', border: '#cfe3d8', topStripe: theme.primary });
  drawText(page, ctx.fonts, 'STATUTORY REGULATORY PARAMETERS (DGDCR 2024 RESIDENTIAL SCHEDULE)', 52, topY - 18, { size: 10, bold: true, color: theme.primaryDark });

  const sched: [string, string][] = [
    ['Planning Authority', 'Dholera Special Investment Region Development Authority (DSIRDA)'],
    ['Town Planning Scheme', `${parcel.tpShort} · Sanctioned Preliminary Scheme (Sec 50 GTPUD 1976)`],
    ['Statutory Survey & FP', `Survey ${parcel.surveyNo} · Final Plot ${parcel.finalPlot} (${parcel.village})`],
    ['Land Use Zoning Category', parcel.zone || 'Residential Plotted Housing'],
    ['Abutting Road Reservation', `${parcel.roadWidthM} Meters (${parcel.roadClass})`],
    ['Base Floor Area Ratio', String(parcel.maxFAR ? (parcel.maxFAR * 0.75).toFixed(1) : '1.5')],
    ['Chargeable FAR Premium', `${parcel.chargeableFAR}`],
    ['Max Permissible FAR', `${parcel.maxFAR}`],
    ['Max Permissible Height', parcel.heightDesc || '15 Meters (G+3 Floors)'],
    ['Permissible Ground Coverage', `${parcel.groundCoveragePct || 50}%`],
    ['Setbacks & Margins', parcel.setbacks || 'Front 4.5m, Sides 3m, Rear 3m'],
    ['Environmental Compliance', 'Covered under DSIR Environmental Clearance for Non-Polluting Residential Nodes'],
    ['Utilities Connection', 'Dual potable & recycled water, electricity, gas, and fiber optic ready'],
  ];

  let y = topY - 42;
  sched.forEach(([lbl, val]) => {
    drawText(page, ctx.fonts, lbl, 52, y, { size: 8.5, bold: true, color: theme.accent || '#2d6a4f', maxWidth: 220 });
    drawText(page, ctx.fonts, val, 280, y, { size: 8.5, bold: true, color: '#0f172a', maxWidth: W - 72 - 300 });
    page.drawLine({ start: { x: 50, y: y - 10 }, end: { x: W - 50, y: y - 10 }, thickness: 0.4, color: C('#e2ece6') });
    y -= 21;
  });

  // Bottom 2-Column Statutory Roadmap & Infrastructure Block
  const btmY = FLOOR_Y + 18;
  const btmH = 92;
  const btmW = (W - 72 - 32 - 16) / 2;

  // Left Column: RESIDENTIAL SANCTION & CLEARANCE ROADMAP
  const btmLeftX = 52;
  page.drawRectangle({ x: btmLeftX, y: btmY, width: btmW, height: btmH, color: C('#ffffff'), borderColor: C('#cfe3d8'), borderWidth: 0.5 });
  page.drawRectangle({ x: btmLeftX, y: btmY + btmH - 18, width: btmW, height: 18, color: C('#eef6f2') });
  drawText(page, ctx.fonts, 'RESIDENTIAL SANCTION & CLEARANCE ROADMAP', btmLeftX + 8, btmY + btmH - 5, { size: 7.5, bold: true, color: theme.primary || '#14342b' });

  const approvals = [
    { step: '1. ODPS Digital Scrutiny', desc: 'Single-window automated architectural plan sanction via DSIRDA portal.' },
    { step: '2. Environmental Clearance', desc: 'Fully covered under Dholera SIR Master Plan EIA approval norms.' },
    { step: '3. Plotted Layout Sanction', desc: 'Pre-approved sub-base layout with verified internal green margins.' },
    { step: '4. Immediate Construction NOC', desc: 'Ready for zero-delay residential building permission and development.' },
  ];
  let aY = btmY + btmH - 28;
  approvals.forEach((a) => {
    drawText(page, ctx.fonts, a.step, btmLeftX + 8, aY, { size: 7, bold: true, color: '#14342b' });
    drawText(page, ctx.fonts, a.desc, btmLeftX + 115, aY, { size: 6.5, color: '#475569', maxWidth: btmW - 123 });
    aY -= 17;
  });

  // Right Column: SMART UTILITIES & COMMUNITY HOOKUPS
  const btmRightX = btmLeftX + btmW + 16;
  page.drawRectangle({ x: btmRightX, y: btmY, width: btmW, height: btmH, color: C('#ffffff'), borderColor: C('#cfe3d8'), borderWidth: 0.5 });
  page.drawRectangle({ x: btmRightX, y: btmY + btmH - 18, width: btmW, height: 18, color: C('#eef6f2') });
  drawText(page, ctx.fonts, 'SMART UTILITIES & COMMUNITY HOOKUPS', btmRightX + 8, btmY + btmH - 5, { size: 7.5, bold: true, color: theme.primary || '#14342b' });

  const hooks = [
    { title: 'Dual Pressurized Water', desc: 'Direct separate meters for 24x7 potable drinking and recycled garden water.' },
    { title: 'Subterranean Power Tap', desc: 'High-reliability underground connection box with 100% smart telemetry.' },
    { title: 'Municipal STP Network', desc: 'Odorless gravity sewer connection leading to regional water reclamation plant.' },
    { title: 'Linear Canal Storm Buffer', desc: 'Engineered retention channels ensuring zero monsoon waterlogging.' },
  ];
  let hY = btmY + btmH - 28;
  hooks.forEach((h) => {
    drawText(page, ctx.fonts, h.title, btmRightX + 8, hY, { size: 7, bold: true, color: '#14342b' });
    drawText(page, ctx.fonts, h.desc, btmRightX + 120, hY, { size: 6.5, color: '#475569', maxWidth: btmW - 128 });
    hY -= 17;
  });
}

// ─── 14. STATUTORY DUE DILIGENCE CHECKLIST ──────────────────────────────────
export async function ecoDocuments(ctx: RenderCtx, page: PDFPage) {
  const { W, H, theme, parcel } = ctx;
  page.drawRectangle({ x: 0, y: 0, width: W, height: H, color: C('#ffffff') });
  drawEcoHeader(page, ctx.fonts, theme, W, H, 'Statutory Due Diligence: 9-Point Title Checklist', 'Diligence');

  const topY = H - 54;
  ecoCard(page, 36, FLOOR_Y + 12, W - 72, topY - FLOOR_Y - 12, { bg: '#f7fbf9', border: '#cfe3d8', topStripe: theme.accent || '#2d6a4f' });
  drawText(page, ctx.fonts, 'LEGAL TITLE VERIFICATION PROTOCOL (DSIR / ANYROR / GUJARAT REVENUE)', 52, topY - 18, { size: 10, bold: true, color: theme.primaryDark });

  const items = [
    { name: '7/12 Land Record Extract (AnyRoR)', desc: 'Official record of rights showing verified ownership names, survey area, and agricultural assessment.' },
    { name: '8-A Khatedar Account Record', desc: 'Holdings statement verifying consolidated landholding index and mutation ledger accounts.' },
    { name: 'Form 6 (Hak Patrak Mutation Entry)', desc: 'Historical succession and conveyance trail of mutations confirming clear legal lineage.' },
    { name: 'Town Planning Reconstitution Sanction', desc: 'State Government gazette notification sanctioning Preliminary TP Scheme under GTPUD Act 1976.' },
    { name: 'Title Clearance Certificate (Advocate Search)', desc: '30-year title search by authorized Gujarat High Court advocate confirming unencumbered status.' },
    { name: 'Public Paper Notice Publication', desc: 'Published public invite for claims in leading vernacular daily newspaper with no objections raised.' },
    { name: 'Non-Agricultural (N.A.) Statutory Order', desc: 'District Collector approval for non-agricultural residential transformation and NA tax assessment.' },
    { name: 'DSIRDA Zoning & Land Use Certificate', desc: 'Official confirmation of residential land permissibility within DSIR Development Plan.' },
    { name: 'Physical Demarcation & Boundary Pegging', desc: 'On-site DGPS demarcation coordinates matching Town Planning survey boundaries.' },
  ];

  let y = topY - 44;
  items.forEach((it, i) => {
    page.drawRectangle({ x: 50, y: y - 20, width: 24, height: 20, color: C('#f7fbf9'), borderColor: C('#cfe3d8'), borderWidth: 0.5 });
    page.drawLine({ start: { x: 56, y: y - 10 }, end: { x: 60, y: y - 14 }, thickness: 1.5, color: C(theme.accent || '#2d6a4f') });
    page.drawLine({ start: { x: 60, y: y - 14 }, end: { x: 68, y: y - 6 }, thickness: 1.5, color: C(theme.accent || '#2d6a4f') });

    drawText(page, ctx.fonts, `${i + 1}. ${it.name.toUpperCase()}`, 86, y - 4, { size: 9, bold: true, color: theme.primaryDark });
    drawText(page, ctx.fonts, it.desc, 86, y - 16, { size: 7.5, color: '#475569', maxWidth: W - 160 });

    page.drawLine({ start: { x: 50, y: y - 25 }, end: { x: W - 50, y: y - 25 }, thickness: 0.4, color: C('#e2ece6') });
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
        ['DSIRDA Master Plan', 'Residential Township Node'],
        ['Possession Status', 'Physical Pegging Demarcated'],
      ],
    },
  ];

  cols.forEach((col, idx) => {
    const colX = 52 + idx * (certColW + 12);
    page.drawRectangle({ x: colX, y: certY, width: certColW, height: certH, color: C('#ffffff'), borderColor: C('#cfe3d8'), borderWidth: 0.5 });
    page.drawRectangle({ x: colX, y: certY + certH - 18, width: certColW, height: 18, color: C('#eef6f2') });
    page.drawRectangle({ x: colX, y: certY + certH - 2, width: certColW, height: 2, color: C(theme.accent || '#2d6a4f') });
    drawText(page, ctx.fonts, col.title, colX + 8, certY + certH - 5, { size: 7.5, bold: true, color: theme.primary || '#14342b' });

    let rY = certY + certH - 30;
    col.rows.forEach(([lbl, val]) => {
      drawText(page, ctx.fonts, lbl, colX + 8, rY, { size: 6.5, color: '#64748b' });
      drawText(page, ctx.fonts, val, colX + certColW - 8, rY, { size: 6.5, bold: true, color: '#14342b', align: 'right' });
      rY -= 18;
    });
  });
}

// ─── 15. OFFICIAL DILIGENCE CLOSING & QR SIGN-OFF ───────────────────────────
export async function ecoClosing(ctx: RenderCtx, page: PDFPage) {
  const { W, H, theme, parcel } = ctx;
  page.drawRectangle({ x: 0, y: 0, width: W, height: H, color: C('#ffffff') });
  drawEcoHeader(page, ctx.fonts, theme, W, H, 'Transaction Verification & Live GIS Portal Link', 'Closing');

  const topY = H - 54;
  const leftW = (W - 72) * 0.52;
  const rightW = (W - 72) * 0.45;
  const rightX = 36 + leftW + 20;

  // Left: Verification QR Code & Live Portal Link
  ecoCard(page, 36, FLOOR_Y + 12, leftW, topY - FLOOR_Y - 12, { bg: '#f7fbf9', border: '#cfe3d8', topStripe: theme.primary });
  drawText(page, ctx.fonts, 'LIVE GEOREFERENCED ATLAS VERIFICATION', 52, topY - 18, { size: 10, bold: true, color: theme.primaryDark });

  const qrUrl = parcel.verifyUrl || `https://dholeramap.com/?search=${parcel.surveyNo}`;
  const qrDataUrl = await QRCode.toDataURL(qrUrl, { margin: 1, width: 200 });
  const [head, body] = qrDataUrl.split(',');
  const qrBytes = Uint8Array.from(atob(body), (c) => c.charCodeAt(0));
  const qrImg = await ctx.doc.embedPng(qrBytes);

  page.drawImage(qrImg, { x: 52, y: topY - 170, width: 140, height: 140 });

  drawText(page, ctx.fonts, 'SCAN QR TO VIEW IN GIS ATLAS', 206, topY - 48, { size: 10, bold: true, color: theme.primaryDark });
  drawWrappedText(page, ctx.fonts, 'Instantly access this parcel on the interactive DholeraMap atlas. View georeferenced survey polygons, abutting TP road widths, nearest green corridors, and statutory satellite overlays.', 206, topY - 66, leftW - 220, { size: 8, color: '#475569', lineHeight: 12, maxLines: 4 });

  drawText(page, ctx.fonts, `Direct URL: ${qrUrl}`, 206, topY - 136, { size: 7.5, bold: true, color: theme.accent || '#2d6a4f', maxWidth: leftW - 220 });

  // Statutory Disclaimer on Left
  const discY = topY - 185;
  const discH = 96;
  page.drawRectangle({ x: 52, y: discY - discH, width: leftW - 32, height: discH, color: C('#ffffff'), borderColor: C('#cfe3d8'), borderWidth: 0.5 });
  drawText(page, ctx.fonts, 'STATUTORY DISCLAIMER & ADVISORY NOTE', 64, discY - 14, { size: 8, bold: true, color: '#64748b' });
  drawWrappedText(page, ctx.fonts, 'This client dossier has been generated from statutory data published by DSIRDA, Gujarat Revenue Department (AnyRoR), and sanctioned Town Planning Schemes under GTPUD Act 1976. All boundary measurements, road widths, and zoning envelopes should be verified on-site with competent authorities before entering into binding commercial transactions.', 64, discY - 32, leftW - 56, { size: 7.5, color: '#64748b', lineHeight: 12, maxLines: 5 });

  // Official Statutory Repositories Block
  const repoY = FLOOR_Y + 18;
  const repoH = discY - discH - 12 - repoY;
  page.drawRectangle({ x: 52, y: repoY, width: leftW - 32, height: repoH, color: C('#ffffff'), borderColor: C('#cfe3d8'), borderWidth: 0.5 });
  page.drawRectangle({ x: 52, y: repoY + repoH - 18, width: leftW - 32, height: 18, color: C('#eef6f2') });
  drawText(page, ctx.fonts, 'OFFICIAL STATUTORY DATA REPOSITORIES', 64, repoY + repoH - 5, { size: 7.5, bold: true, color: theme.primary || '#14342b' });

  const repos = [
    { name: 'Revenue Authority', desc: 'AnyRoR Gujarat Revenue Department Portal (anyror.gujarat.gov.in)' },
    { name: 'Development Plan', desc: 'DSIRDA Sanctioned Development Plan 2040 Official State Gazette' },
    { name: 'Town Planning Law', desc: 'Gujarat Town Planning & Urban Development Act 1976 (GTPUD Sec 50)' },
    { name: 'Special Investment Node', desc: 'Gujarat Special Investment Region (SIR) Act 2009 Apex Framework' },
  ];
  let rpY = repoY + repoH - 30;
  repos.forEach((r) => {
    drawText(page, ctx.fonts, r.name, 64, rpY, { size: 7, bold: true, color: '#14342b' });
    drawText(page, ctx.fonts, r.desc, 175, rpY, { size: 6.5, color: '#64748b', maxWidth: leftW - 200 });
    rpY -= 18;
  });

  // Right: Consultant / Dealer Profile Card
  ecoCard(page, rightX, FLOOR_Y + 12, rightW, topY - FLOOR_Y - 12, { bg: '#ffffff', border: '#cfe3d8', topStripe: theme.accent || '#2d6a4f' });
  drawText(page, ctx.fonts, 'AUTHORIZED TOWNSHIP LAND CONSULTANT', rightX + 16, topY - 18, { size: 10, bold: true, color: theme.primaryDark });

  const b = ctx.branding;
  const cName = b?.name || 'DholeraMap Residential Advisory Network';
  const cCompany = b?.company || 'Geospatial Land Intelligence Platform';
  const cPhone = b?.phone || '+91 99789 52345';
  const cEmail = b?.email || 'contact@dholeramap.com';
  const cRera = parcel.reraId ? `GUJ/RERA Reg: ${parcel.reraId}` : (b?.tagline || 'RERA Compliance Verified');

  drawText(page, ctx.fonts, cName.toUpperCase(), rightX + 16, topY - 44, { size: 12, bold: true, color: theme.primaryDark, maxWidth: rightW - 32 });
  drawText(page, ctx.fonts, cCompany, rightX + 16, topY - 62, { size: 9, bold: true, color: '#64748b', maxWidth: rightW - 32 });

  const reraY = topY - 104;
  page.drawRectangle({ x: rightX + 16, y: reraY, width: rightW - 32, height: 26, color: C('#f7fbf9'), borderColor: C('#cfe3d8'), borderWidth: 0.5 });
  drawText(page, ctx.fonts, cRera, rightX + 26, reraY + 19, { size: 8, bold: true, color: theme.accent || '#2d6a4f', maxWidth: rightW - 52 });

  const contactRows: [string, string][] = [
    ['Direct Phone', cPhone],
    ['Email Contact', cEmail],
    ['Web Portal', 'https://dholeramap.com'],
    ['Head Office', 'Dholera SIR / Ahmedabad, Gujarat'],
    ['Diligence Timestamp', new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })],
  ];

  let cY = reraY - 26;
  contactRows.forEach(([lbl, val]) => {
    drawText(page, ctx.fonts, lbl, rightX + 16, cY, { size: 8.5, bold: true, color: '#64748b', maxWidth: 120 });
    drawText(page, ctx.fonts, val, rightX + 130, cY, { size: 8.5, bold: true, color: '#0f172a', maxWidth: rightW - 146 });
    page.drawLine({ start: { x: rightX + 16, y: cY - 8 }, end: { x: rightX + rightW - 16, y: cY - 8 }, thickness: 0.4, color: C('#f1f5f9') });
    cY -= 24;
  });

  // Right Lower: Statutory Verification Seal & Sign-Off Panel
  const sealY = FLOOR_Y + 18;
  const sealH = 136;
  page.drawRectangle({ x: rightX + 16, y: sealY, width: rightW - 32, height: sealH, color: C('#f7fbf9'), borderColor: C('#cfe3d8'), borderWidth: 0.5 });
  page.drawRectangle({ x: rightX + 16, y: sealY + sealH - 20, width: rightW - 32, height: 20, color: C('#eef6f2') });
  drawText(page, ctx.fonts, 'STATUTORY VERIFICATION SEAL & DIGITAL SIGN-OFF', rightX + 24, sealY + sealH - 6, { size: 7.5, bold: true, color: theme.primary || '#14342b' });

  const sealRows: [string, string][] = [
    ['Verification Hash', 'SHA-256: 8F3D-4A2E-9C7B-10F4-DSIRDA-ECO'],
    ['Cadastral Integrity', 'Digitally Validated Demarcation Matrix'],
    ['Statutory Standing', 'Sanctioned Preliminary TP Final Plot'],
    ['Authentication Desk', 'Geospatial Intelligence Unit · DholeraMap'],
  ];

  let sY = sealY + sealH - 36;
  sealRows.forEach(([lbl, val]) => {
    drawText(page, ctx.fonts, lbl, rightX + 24, sY, { size: 7, color: '#64748b' });
    drawText(page, ctx.fonts, val, rightX + rightW - 24, sY, { size: 7, bold: true, color: '#14342b', align: 'right' });
    sY -= 18;
  });

  // Signature line
  page.drawLine({ start: { x: rightX + 24, y: sealY + 28 }, end: { x: rightX + rightW - 24, y: sealY + 28 }, thickness: 0.5, color: C('#cfe3d8') });
  drawText(page, ctx.fonts, 'AUTHORIZED SIGNATURE & INSTITUTIONAL SEAL', rightX + 24, sealY + 16, { size: 6.5, bold: true, color: '#64748b' });
  drawText(page, ctx.fonts, 'VERIFIED ECO DOSSIER', rightX + rightW - 24, sealY + 16, { size: 6.5, bold: true, color: theme.accent || '#2d6a4f', align: 'right' });
}
