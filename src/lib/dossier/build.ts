/**
 * Landscape dossier assembler.
 *
 * Loads the user-uploaded template PDF, copies static/marketing pages
 * verbatim (scaled to the requested output size), generates plot-specific
 * pages for the dossier parcel, appends DGDCR / documents / closing pages,
 * and returns a share-ready PDF blob. Fully local via pdf-lib.
 */

import { PDFDocument, PDFImage, StandardFonts, rgb } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import type {
  ContentPlan,
  DossierBranding,
  DossierBuildResult,
  DossierDocItem,
  DossierOptions,
  DossierParcel,
  DossierSnapshot,
  DossierTemplateDefinition,
  StoredDossierTemplate,
} from './types';
import { matchesExemplar } from './templates';
import { renderParcelSnapshots } from './maps';
import {
  closingPage,
  dgdcrPage,
  documentsPage,
  drawBrandingFooter,
  loadStaticImage,
  hebatpurCover,
  hebatpurLand,
  hebatpurOpFp,
  hebatpurProperty,
  hebatpurTpLocation,
  hebatpurZoning,
  hebatpurZoomGrid,
  palmCover,
  palmHighlights,
  palmLocation,
  type RenderCtx,
  type RenderFonts,
} from './render';
import {
  industrialCover,
  industrialExecutiveSummary,
  industrialAboutDholera,
  industrialConnectivity,
  industrialMegaProjects,
  industrialTpPlanning,
  industrialProperty,
  industrialLand,
  industrialTpLocation,
  industrialZoning,
  industrialOpFp,
  industrialZoomGrid,
  industrialDgdcr,
  industrialDocuments,
  industrialClosing,
} from './industrial';
import {
  ecoCover,
  ecoExecutiveSummary,
  ecoAboutDholera,
  ecoConnectivity,
  ecoMegaProjects,
  ecoTpPlanning,
  ecoProperty,
  ecoLand,
  ecoTpLocation,
  ecoZoning,
  ecoOpFp,
  ecoZoomGrid,
  ecoDgdcr,
  ecoDocuments,
  ecoClosing,
} from './eco';
import {
  investorCover,
  investorExecutiveSummary,
  investorAboutDholera,
  investorConnectivity,
  investorMegaProjects,
  investorTpPlanning,
  investorProperty,
  investorLand,
  investorTpLocation,
  investorZoning,
  investorOpFp,
  investorZoomGrid,
  investorDgdcr,
  investorDocuments,
  investorClosing,
} from './investor';
import {
  premiumCover,
  premiumExecutiveSummary,
  premiumAboutDholera,
  premiumConnectivity,
  premiumMegaProjects,
  premiumTpPlanning,
  premiumProperty,
  premiumLand,
  premiumTpLocation,
  premiumZoning,
  premiumOpFp,
  premiumZoomGrid,
  premiumDgdcr,
  premiumDocuments,
  premiumClosing,
} from './premium';
import { HEBATPUR_TEMPLATE_ID, INVESTOR_TEMPLATE_ID, PALM_TEMPLATE_ID, PREMIUM_TEMPLATE_ID } from './templates';

export type ProgressFn = (message: string, done: number, total: number) => void;

const OUTPUT_SIZES: Record<string, [number, number]> = {
  'presentation-16x9': [960, 540],
  'a4-landscape': [841.89, 595.28],
  'a4-portrait': [595.28, 841.89],
};

function sanitize(s: string): string {
  return (s || 'plot')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '_')
    .slice(0, 80);
}

/**
 * Embed the bundled Noto Sans (Unicode) so the rupee sign, the check glyph and
 * Indian numeral grouping all render. Falls back to the base-14 Helvetica if the
 * font file is unreachable -- those decks lose ₹/✓ but still build.
 */
async function loadFonts(doc: PDFDocument): Promise<RenderFonts> {
  const tryEmbed = async (file: string) => {
    try {
      let buf: Uint8Array | null = null;
      if (typeof window === 'undefined') {
        try {
          const fs = await import('fs/promises');
          const path = await import('path');
          const localPath = path.join(process.cwd(), 'public', file.replace(/^\//, ''));
          const nodeBuf = await fs.readFile(localPath);
          buf = new Uint8Array(nodeBuf);
        } catch {}
      }
      if (!buf) {
        const res = await fetch(file);
        if (!res.ok) return null;
        buf = new Uint8Array(await res.arrayBuffer());
      }
      return await doc.embedFont(buf);
    } catch {
      return null;
    }
  };
  const [regular, bold] = await Promise.all([tryEmbed('/fonts/NotoSans-Regular.ttf'), tryEmbed('/fonts/NotoSans-Bold.ttf')]);
  return {
    regular: regular || (await doc.embedFont(StandardFonts.Helvetica)),
    bold: bold || (await doc.embedFont(StandardFonts.HelveticaBold)),
  };
}

export async function buildDossier(args: {
  stored?: StoredDossierTemplate;
  definition: DossierTemplateDefinition;
  parcel: DossierParcel;
  docs: DossierDocItem[];
  options: DossierOptions;
  branding?: DossierBranding | null;
  /** The dealer's reviewed/edited page content; renderers read it back. */
  plan?: ContentPlan;
  onProgress?: ProgressFn;
}): Promise<DossierBuildResult> {
  const { stored, definition, parcel, docs, options, branding, plan, onProgress } = args;
  const warnings: string[] = [];
  const report = (m: string, d: number, t: number) => onProgress?.(m, d, t);

  const [W, H] =
    options.pageSize === 'template-native'
      ? definition.pageSize
      : OUTPUT_SIZES[options.pageSize] || definition.pageSize;

  // 1. Map snapshots (local tile stitching).
  report('Rendering map snapshots from local tiles…', 1, 10);
  const label = `${parcel.village.toUpperCase()} ${parcel.surveyNo}`.trim();
  let snapshots: DossierSnapshot[] = [];
  if (typeof window !== 'undefined') {
    try {
      snapshots = await renderParcelSnapshots({
        schemeNum: parcel.schemeNum,
        x: parcel.x,
        y: parcel.y,
        opX: parcel.opX,
        opY: parcel.opY,
        fpX: parcel.fpX,
        fpY: parcel.fpY,
        subSector: parcel.subSector,
        label,
        quality: options.quality,
      });
    } catch (e) {
      warnings.push(`Map snapshot capture failed: ${e instanceof Error ? e.message : String(e)}`);
    }
  }
  const snapMap = new Map(snapshots.map((s) => [s.view, s]));

  // 2. Load + validate the uploaded template source (generated decks skip this:
  //    they have no source PDF, so every page is drawn by the engine).
  let src: PDFDocument | null = null;
  if (stored) {
    report('Loading template source…', 3, 10);
    src = await PDFDocument.load(stored.sourceBytes.slice(), { ignoreEncryption: true });
    if (src.getPageCount() !== definition.fingerprint.pages) {
      throw new Error(
        `Template page mismatch: expected ${definition.fingerprint.pages}, found ${src.getPageCount()}. Re-upload the original file.`
      );
    }
    const s0 = src.getPage(0);
    if (
      Math.abs(s0.getWidth() - definition.fingerprint.width) > 1 ||
      Math.abs(s0.getHeight() - definition.fingerprint.height) > 1
    ) {
      throw new Error('Template page size mismatch. Re-upload the original file.');
    }
  }

  const out = await PDFDocument.create();
  out.registerFontkit(fontkit);
  const fonts: RenderFonts = await loadFonts(out);
  // DholeraMap logo for the page footers (embedded once, drawn on every page).
  let siteLogo: PDFImage | undefined;
  try {
    siteLogo = (await loadStaticImage(out, '/logo-transparent.png')) || (await loadStaticImage(out, '/logo.png')) || undefined;
  } catch {
    /* site logo is optional */
  }
  const ctx: RenderCtx = {
    doc: out,
    fonts,
    theme: definition.theme,
    footerNote: definition.footerNote,
    W,
    H,
    snapshots: snapMap,
    parcel,
    docs,
    branding,
    plan,
    siteLogo,
  };

  const isExemplar = matchesExemplar(definition.exemplar, {
    village: parcel.village,
    surveyNo: parcel.surveyNo,
    finalPlot: parcel.finalPlot,
    tpShort: parcel.tpShort,
  });
  if (!isExemplar && definition.exemplar) {
    warnings.push('Parcel differs from the template worked example — plot pages were generated fresh; example-only pages were replaced.');
  }

  // 3. Decide which source pages to embed.
  const embedIndices: number[] = [];
  for (const p of definition.pages) {
    if (p.mode === 'copy') {
      if (p.role === 'marketing' && !options.includeMarketing) continue;
      embedIndices.push(p.sourceIndex);
    } else if (p.mode === 'exemplar-copy' && isExemplar) {
      embedIndices.push(p.sourceIndex);
    }
  }
  const embedded = src && embedIndices.length ? await out.embedPdf(src, embedIndices) : [];
  const embeddedByIndex = new Map(embedIndices.map((idx, i) => [idx, embedded[i]]));

  const drawEmbedded = (pageIdx: number) => {
    const emb = embeddedByIndex.get(pageIdx);
    if (!emb) return;
    const srcW = definition.pageSize[0];
    const srcH = definition.pageSize[1];
    const s = Math.min(W / srcW, H / srcH);
    const dw = srcW * s;
    const dh = srcH * s;
    const page = out.addPage([W, H]);
    page.drawRectangle({ x: 0, y: 0, width: W, height: H, color: rgb(1, 1, 1) });
    page.drawPage(emb, { x: (W - dw) / 2, y: (H - dh) / 2, width: dw, height: dh });
  };

  /**
   * One page per attached photo. Lives outside the role switch because a single
   * role can yield several pages, and the dealer may add or drop the whole
   * gallery from the output options.
   */
  async function appendImagePages() {
    const images = docs.filter((d) => d.fileType.startsWith('image/')).slice(0, 10);
    if (docs.filter((d) => d.fileType.startsWith('image/')).length > 10) {
      warnings.push('Only the first 10 attached images were embedded.');
    }
    // Decoding + embedding each photo is independent of the others, so they
    // all run at once; the pages are still drawn in order afterwards.
    const embedded = await Promise.all(
      images.map(async (img, i) => {
        try {
          const [, body] = img.dataUrl.split(',');
          const bytes = Uint8Array.from(atob(body), (c) => c.charCodeAt(0));
          const emb = img.fileType.includes('png') ? await out.embedPng(bytes) : await out.embedJpg(bytes);
          return { i, emb, img };
        } catch {
          warnings.push(`Could not embed image “${img.name}”.`);
          return null;
        }
      })
    );
    for (const item of embedded) {
      if (!item) continue;
      const page = out.addPage([W, H]);
      page.drawRectangle({ x: 0, y: 0, width: W, height: H, color: rgb(1, 1, 1) });
      const s = Math.min((W - 80) / item.emb.width, (H - 120) / item.emb.height);
      const dw = item.emb.width * s;
      const dh = item.emb.height * s;
      page.drawImage(item.emb, { x: (W - dw) / 2, y: 60 + (H - 120 - dh) / 2, width: dw, height: dh });
      await drawBrandingFooter(ctx, page);
    }
  }

  // 4. Dynamic page renderers per template.
  const isHebatpur = definition.id === HEBATPUR_TEMPLATE_ID;
  const isPalm = definition.id === PALM_TEMPLATE_ID;
  const isInvestor = definition.id === INVESTOR_TEMPLATE_ID;
  const isPremium = definition.id === PREMIUM_TEMPLATE_ID;

  async function renderGenerated(role: string) {
    const page = out.addPage([W, H]);
    // render() returns false when the page should be discarded (option off, or
    // artwork that cannot be generated).
    const render = async (): Promise<boolean> => {
      if (isHebatpur) {
        switch (role) {
          case 'cover': await industrialCover(ctx, page); return true;
          case 'executive-summary': await industrialExecutiveSummary(ctx, page); return true;
          case 'about-dholera': await industrialAboutDholera(ctx, page); return true;
          case 'connectivity': await industrialConnectivity(ctx, page); return true;
          case 'mega-projects': await industrialMegaProjects(ctx, page); return true;
          case 'tp-scheme-planning': await industrialTpPlanning(ctx, page); return true;
          case 'property-details': await industrialProperty(ctx, page); return true;
          case 'land-details': await industrialLand(ctx, page); return true;
          case 'tp-location': await industrialTpLocation(ctx, page); return true;
          case 'zoning': await industrialZoning(ctx, page); return true;
          case 'op-fp': await industrialOpFp(ctx, page); return true;
          case 'parcel-zooms': await industrialZoomGrid(ctx, page); return true;
          case 'dgdcr':
            if (!options.includeDgdcr) return false;
            await industrialDgdcr(ctx, page); return true;
          case 'documents':
            if (!options.includeDocuments) return false;
            await industrialDocuments(ctx, page); return true;
          case 'closing':
            if (!options.includeClosing) return false;
            await industrialClosing(ctx, page); return true;
          default: await industrialTpLocation(ctx, page); return true;
        }
      }

      if (isPalm) {
        switch (role) {
          case 'cover': await ecoCover(ctx, page); return true;
          case 'executive-summary': await ecoExecutiveSummary(ctx, page); return true;
          case 'about-dholera': await ecoAboutDholera(ctx, page); return true;
          case 'connectivity': await ecoConnectivity(ctx, page); return true;
          case 'mega-projects': await ecoMegaProjects(ctx, page); return true;
          case 'tp-scheme-planning': await ecoTpPlanning(ctx, page); return true;
          case 'property-details': await ecoProperty(ctx, page); return true;
          case 'land-details': await ecoLand(ctx, page); return true;
          case 'tp-location': await ecoTpLocation(ctx, page); return true;
          case 'zoning': await ecoZoning(ctx, page); return true;
          case 'op-fp': await ecoOpFp(ctx, page); return true;
          case 'parcel-zooms': await ecoZoomGrid(ctx, page); return true;
          case 'dgdcr':
            if (!options.includeDgdcr) return false;
            await ecoDgdcr(ctx, page); return true;
          case 'documents':
            if (!options.includeDocuments) return false;
            await ecoDocuments(ctx, page); return true;
          case 'closing':
            if (!options.includeClosing) return false;
            await ecoClosing(ctx, page); return true;
          default: await ecoTpLocation(ctx, page); return true;
        }
      }

      if (isInvestor) {
        switch (role) {
          case 'cover': await investorCover(ctx, page); return true;
          case 'executive-summary': await investorExecutiveSummary(ctx, page); return true;
          case 'about-dholera': await investorAboutDholera(ctx, page); return true;
          case 'connectivity': await investorConnectivity(ctx, page); return true;
          case 'mega-projects': await investorMegaProjects(ctx, page); return true;
          case 'tp-scheme-planning': await investorTpPlanning(ctx, page); return true;
          case 'property-details': await investorProperty(ctx, page); return true;
          case 'land-details': await investorLand(ctx, page); return true;
          case 'tp-location': await investorTpLocation(ctx, page); return true;
          case 'zoning': await investorZoning(ctx, page); return true;
          case 'op-fp': await investorOpFp(ctx, page); return true;
          case 'parcel-zooms': await investorZoomGrid(ctx, page); return true;
          case 'dgdcr':
            if (!options.includeDgdcr) return false;
            await investorDgdcr(ctx, page); return true;
          case 'documents':
            if (!options.includeDocuments) return false;
            await investorDocuments(ctx, page); return true;
          case 'closing':
            if (!options.includeClosing) return false;
            await investorClosing(ctx, page); return true;
          default: await investorTpLocation(ctx, page); return true;
        }
      }

      if (isPremium) {
        switch (role) {
          case 'cover': await premiumCover(ctx, page); return true;
          case 'executive-summary': await premiumExecutiveSummary(ctx, page); return true;
          case 'about-dholera': await premiumAboutDholera(ctx, page); return true;
          case 'connectivity': await premiumConnectivity(ctx, page); return true;
          case 'mega-projects': await premiumMegaProjects(ctx, page); return true;
          case 'tp-scheme-planning': await premiumTpPlanning(ctx, page); return true;
          case 'property-details': await premiumProperty(ctx, page); return true;
          case 'land-details': await premiumLand(ctx, page); return true;
          case 'tp-location': await premiumTpLocation(ctx, page); return true;
          case 'zoning': await premiumZoning(ctx, page); return true;
          case 'op-fp': await premiumOpFp(ctx, page); return true;
          case 'parcel-zooms': await premiumZoomGrid(ctx, page); return true;
          case 'dgdcr':
            if (!options.includeDgdcr) return false;
            await premiumDgdcr(ctx, page); return true;
          case 'documents':
            if (!options.includeDocuments) return false;
            await premiumDocuments(ctx, page); return true;
          case 'closing':
            if (!options.includeClosing) return false;
            await premiumClosing(ctx, page); return true;
          default: await premiumTpLocation(ctx, page); return true;
        }
      }

      if (role === 'dgdcr') {
        if (!options.includeDgdcr) return false;
        await dgdcrPage(ctx, page);
        return true;
      }
      if (role === 'documents') {
        if (!options.includeDocuments) return false;
        await documentsPage(ctx, page);
        return true;
      }
      if (role === 'closing') {
        if (!options.includeClosing) return false;
        await closingPage(ctx, page);
        return true;
      }
      if (role === 'marketing') return false;

      // Generic fallback for custom uploaded templates
      switch (role) {
        case 'cover': await industrialCover(ctx, page); return true;
        case 'property-details':
        case 'land-details': await industrialProperty(ctx, page); return true;
        case 'zoning': await industrialZoning(ctx, page); return true;
        case 'op-fp': await industrialOpFp(ctx, page); return true;
        case 'parcel-zooms': await industrialZoomGrid(ctx, page); return true;
        default: await industrialTpLocation(ctx, page); return true;
      }
    };
    if (await render()) {
      await drawBrandingFooter(ctx, page);
    } else {
      out.removePage(out.getPageCount() - 1);
    }
  }

  // 5. Walk the template page plan in order.
  report('Composing dossier pages…', 5, 10);

  // A template may ship its own closing page: copied verbatim ('copy'), reused
  // only for the exemplar parcel ('exemplar-copy'), or generated ('generate').
  // When it does not, the QR closing page is appended after the walk so that
  // every dossier — exemplar included — ends on a verification page.
  // The same rule applies to the DGDCR / documents / gallery pages so a deck
  // that lists them in its page plan does not also get the system append.
  const suppliesRole = (role: string) =>
    definition.pages.some(
      (p) => p.role === role && (p.mode === 'generate' || p.mode === 'copy' || (p.mode === 'exemplar-copy' && isExemplar))
    );
  const templateSuppliesClosing = suppliesRole('closing');

  for (const p of definition.pages) {
    if (p.mode === 'copy') {
      if (p.role === 'marketing' && !options.includeMarketing) continue;
      if (embeddedByIndex.has(p.sourceIndex)) drawEmbedded(p.sourceIndex);
      continue;
    }
    if (p.mode === 'generate') {
      if (p.role === 'images') {
        if (options.includeImages) await appendImagePages();
        continue;
      }
      await renderGenerated(p.role);
      continue;
    }
    // exemplar-copy
    if (isExemplar) {
      if (p.role === 'closing' && !options.includeClosing) continue;
      if (p.role === 'images' && !options.includeImages) continue;
      if (embeddedByIndex.has(p.sourceIndex)) drawEmbedded(p.sourceIndex);
      continue;
    }
    if (p.role === 'closing') continue; // generated closing appended below
    if (p.role === 'images') {
      if (options.includeImages) await appendImagePages();
      continue;
    }
    await renderGenerated(p.role);
  }

  // 6. System pages: appended only when the page plan did not already supply
  //    them, so toggles stay single-sourced and the deck never duplicates.
  if (options.includeDgdcr && !suppliesRole('dgdcr')) {
    report('Adding development-control page…', 7, 10);
    const p = out.addPage([W, H]);
    await dgdcrPage(ctx, p);
    await drawBrandingFooter(ctx, p);
  }
  if (options.includeDocuments && !suppliesRole('documents')) {
    report('Adding documents page…', 8, 10);
    const p = out.addPage([W, H]);
    await documentsPage(ctx, p);
    await drawBrandingFooter(ctx, p);
  }
  if (options.includeImages && !suppliesRole('images')) {
    await appendImagePages();
  }
  if (options.includeClosing && !templateSuppliesClosing) {
    const p = out.addPage([W, H]);
    await closingPage(ctx, p);
    await drawBrandingFooter(ctx, p);
  }

  out.setTitle(`${parcel.title} — client dossier`);
  out.setSubject(`Plot dossier for ${parcel.village} survey ${parcel.surveyNo}, FP ${parcel.finalPlot}`);
  out.setProducer('DholeraMap PlotBook (local dossier engine)');
  out.setCreator(`Template: ${definition.name}`);

  report('Finalizing PDF…', 9, 10);
  const bytes = await out.save();
  const blob = new Blob([bytes as unknown as BlobPart], { type: 'application/pdf' });
  const filename = `${sanitize(parcel.village)}_${sanitize(parcel.surveyNo)}_FP${sanitize(parcel.finalPlot)}_Dossier.pdf`;
  report('Done', 10, 10);

  const ordered: DossierSnapshot[] = [];
  for (const v of ['tp-full', 'subsector', 'zoning', 'exact', 'op', 'fp'] as const) {
    const s = snapMap.get(v);
    if (s) ordered.push(s);
  }
  return { filename, blob, bytes: bytes.length, pageCount: out.getPageCount(), pageSize: [W, H], warnings, snapshots: ordered };
}
