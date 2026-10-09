import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import QRCode from 'qrcode';
import type { Bookmark, PlanSheet } from './types';

const CROP_W = 1200;
const CROP_H = 700;

async function loadUnicodeFont(doc: PDFDocument, file: string, fallback: StandardFonts) {
  try {
    const res = await fetch(file);
    if (!res.ok) return await doc.embedFont(fallback);
    return await doc.embedFont(new Uint8Array(await res.arrayBuffer()));
  } catch {
    return await doc.embedFont(fallback);
  }
}

function cropWindow(sheet: PlanSheet, x: number, y: number): { x: number; y: number; w: number; h: number } {
  const side = Math.min(Math.max(Math.min(sheet.width, sheet.height) * 0.35, 500), 2000);
  let w = side * (CROP_W / CROP_H);
  let h = side;
  if (w > sheet.width) {
    w = sheet.width;
    h = Math.min(sheet.height, w * (CROP_H / CROP_W));
  }
  if (h > sheet.height) {
    h = sheet.height;
    w = Math.min(sheet.width, h * (CROP_W / CROP_H));
  }
  const cx = Math.min(Math.max(x, w / 2), sheet.width - w / 2);
  const cy = Math.min(Math.max(y, h / 2), sheet.height - h / 2);
  return {
    x: Math.round(cx - w / 2),
    y: Math.round(cy - h / 2),
    w: Math.round(w),
    h: Math.round(h),
  };
}

async function loadImg(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
    img.src = src;
  });
}

async function composeCrop(
  img: HTMLImageElement,
  bm: Bookmark,
  win: { x: number; y: number; w: number; h: number }
): Promise<string> {
  const canvas = document.createElement('canvas');
  canvas.width = CROP_W;
  canvas.height = CROP_H;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, CROP_W, CROP_H);
  ctx.drawImage(img, win.x, win.y, win.w, win.h, 0, 0, CROP_W, CROP_H);

  // Pin coords relative to crop
  const px = ((bm.x - win.x) / win.w) * CROP_W;
  const py = ((bm.y - win.y) / win.h) * CROP_H;

  // Crosshair
  ctx.strokeStyle = 'rgba(245, 158, 11, 0.7)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(px - 30, py);
  ctx.lineTo(px + 30, py);
  ctx.moveTo(px, py - 30);
  ctx.lineTo(px, py + 30);
  ctx.stroke();

  // Outer gold pulse ring
  ctx.fillStyle = 'rgba(251, 191, 36, 0.35)';
  ctx.beginPath();
  ctx.arc(px, py, 22, 0, Math.PI * 2);
  ctx.fill();

  // Center gold dot
  ctx.fillStyle = '#D97706';
  ctx.beginPath();
  ctx.arc(px, py, 8, 0, Math.PI * 2);
  ctx.fill();

  // White core
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(px, py, 3, 0, Math.PI * 2);
  ctx.fill();

  // Plot Label Callout
  const labelText = bm.plotNo ? `Plot ${bm.plotNo}` : bm.surveyNo ? `Survey ${bm.surveyNo}` : 'Selected Plot';
  ctx.font = 'bold 16px sans-serif';
  const textW = ctx.measureText(labelText).width;
  
  ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
  ctx.fillRect(px - textW / 2 - 10, py - 48, textW + 20, 26);
  ctx.strokeStyle = '#F59E0B';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(px - textW / 2 - 10, py - 48, textW + 20, 26);

  ctx.fillStyle = '#FFFFFF';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(labelText, px, py - 35);

  return canvas.toDataURL('image/jpeg', 0.88);
}

export async function generatePinReport(
  bm: Bookmark,
  sheet: PlanSheet
): Promise<{ filename: string; blob: Blob }> {
  const pdfDoc = await PDFDocument.create();
  pdfDoc.registerFontkit(fontkit);
  // Unicode (Noto Sans) so the rupee sign and checkmarks render instead of
  // throwing; Helvetica keeps the deck buildable if the font is unreachable.
  const fontBold = await loadUnicodeFont(pdfDoc, '/fonts/NotoSans-Bold.ttf', StandardFonts.HelveticaBold);
  const fontRegular = await loadUnicodeFont(pdfDoc, '/fonts/NotoSans-Regular.ttf', StandardFonts.Helvetica);

  // 1. Crop High-Res Blueprint
  const sheetImg = await loadImg(sheet.url);
  const win = cropWindow(sheet, bm.x, bm.y);
  const cropDataUrl = await composeCrop(sheetImg, bm, win);
  const cropBytes = await (await fetch(cropDataUrl)).arrayBuffer();
  const cropPdfImg = await pdfDoc.embedJpg(cropBytes);

  // 2. Generate QR Code
  const qrUrl = `https://dholeramap.com/viewer?sheet=${sheet.sid}&x=${bm.x}&y=${bm.y}`;
  const qrDataUrl = await QRCode.toDataURL(qrUrl, { margin: 1, width: 200 });
  const qrBytes = await (await fetch(qrDataUrl)).arrayBuffer();
  const qrPdfImg = await pdfDoc.embedPng(qrBytes);

  // PAGE 1: Executive Cover & Blueprint
  const page1 = pdfDoc.addPage([595.28, 841.89]); // A4
  const { width, height } = page1.getSize();

  // Top Navy Header Bar
  page1.drawRectangle({
    x: 0,
    y: height - 80,
    width: width,
    height: 80,
    color: rgb(0.06, 0.09, 0.16),
  });

  page1.drawText('DHOLERA SPECIAL INVESTMENT REGIONAL DEVELOPMENT AUTHORITY', {
    x: 30,
    y: height - 35,
    size: 11,
    font: fontBold,
    color: rgb(0.96, 0.75, 0.2), // Gold
  });

  page1.drawText('STATUTORY TOWN PLANNING INTERACTIVE INTELLIGENCE DOSSIER', {
    x: 30,
    y: height - 52,
    size: 13,
    font: fontBold,
    color: rgb(1, 1, 1),
  });

  page1.drawText(`DSIRDA Form 4/5 Gazette Sanction · Town Planning Scheme: ${sheet.sector}`, {
    x: 30,
    y: height - 68,
    size: 9,
    font: fontRegular,
    color: rgb(0.7, 0.75, 0.8),
  });

  // Plot Title Box
  const plotHeading = bm.finalPlot ? `Final Plot: ${bm.finalPlot}` : `Survey Number: ${bm.surveyNo || 'N/A'}`;
  page1.drawText(plotHeading, {
    x: 30,
    y: height - 110,
    size: 18,
    font: fontBold,
    color: rgb(0.1, 0.15, 0.25),
  });

  page1.drawText(`Village: ${bm.village || 'Dholera SIR'}  |  Scheme: ${sheet.label}`, {
    x: 30,
    y: height - 128,
    size: 10,
    font: fontRegular,
    color: rgb(0.4, 0.45, 0.5),
  });

  // High-Res Map Crop
  const mapDisplayW = width - 60;
  const mapDisplayH = (mapDisplayW * CROP_H) / CROP_W;
  const mapY = height - 145 - mapDisplayH;

  page1.drawImage(cropPdfImg, {
    x: 30,
    y: mapY,
    width: mapDisplayW,
    height: mapDisplayH,
  });

  // Border around map
  page1.drawRectangle({
    x: 30,
    y: mapY,
    width: mapDisplayW,
    height: mapDisplayH,
    borderColor: rgb(0.8, 0.85, 0.9),
    borderWidth: 1,
  });

  // Specifications Grid (Below Map)
  const specY = mapY - 25;
  page1.drawText('STATUTORY CAD / GAZETTE SPECIFICATIONS', {
    x: 30,
    y: specY,
    size: 11,
    font: fontBold,
    color: rgb(0.06, 0.09, 0.16),
  });

  const specs = [
    ['Survey Number', bm.surveyNo || 'Verified on Sheet', 'Statutory Zone', bm.zone || 'R1 Residential / Mixed Use'],
    ['Final Plot (FP)', bm.finalPlot || 'Allotted Reconstituted', 'Road Width', `${bm.roadWidthM || 30} Meters Multi-Modal`],
    ['Village Anchor', bm.village || 'DSIR Sanctioned', 'Max Permissible FAR', '1.80 – 2.50 (DGDCR)'],
    ['Allotted Plot Area', bm.allottedAreaSqM ? `${bm.allottedAreaSqM} m² (${bm.allottedAreaSqYd || Math.round(bm.allottedAreaSqM * 1.196)} sq.yd)` : '— not measured on plan', 'Max Building Height', '15m – 45m (As per Zone)'],
  ];

  let currentY = specY - 20;
  for (const row of specs) {
    page1.drawText(row[0], { x: 35, y: currentY, size: 9, font: fontRegular, color: rgb(0.4, 0.45, 0.5) });
    page1.drawText(row[1], { x: 150, y: currentY, size: 9, font: fontBold, color: rgb(0.1, 0.15, 0.25) });

    page1.drawText(row[2], { x: 300, y: currentY, size: 9, font: fontRegular, color: rgb(0.4, 0.45, 0.5) });
    page1.drawText(row[3], { x: 420, y: currentY, size: 9, font: fontBold, color: rgb(0.1, 0.15, 0.25) });
    currentY -= 18;
  }

  // Bottom QR Code & Verification Banner
  page1.drawRectangle({
    x: 30,
    y: 35,
    width: width - 60,
    height: 75,
    color: rgb(0.96, 0.97, 0.98),
    borderColor: rgb(0.85, 0.88, 0.92),
    borderWidth: 1,
  });

  page1.drawImage(qrPdfImg, {
    x: 40,
    y: 40,
    width: 65,
    height: 65,
  });

  page1.drawText('INSTITUTIONAL QR VERIFICATION & LIVE DIGITAL ATLAS', {
    x: 120,
    y: 92,
    size: 10,
    font: fontBold,
    color: rgb(0.06, 0.09, 0.16),
  });

  page1.drawText('Scan with smartphone camera to view this exact plot coordinate in full 60 FPS deep-zoom on DholeraMap.com.', {
    x: 120,
    y: 77,
    size: 8.5,
    font: fontRegular,
    color: rgb(0.35, 0.4, 0.45),
  });

  page1.drawText('Non-Promoter Property Extract: Generated strictly for due-diligence and statutory verification purposes.', {
    x: 120,
    y: 50,
    size: 7.5,
    font: fontRegular,
    color: rgb(0.5, 0.55, 0.6),
  });

  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' });
  const filename = `DholeraMap_Dossier_Survey_${bm.surveyNo || 'Plot'}_${sheet.sector.replace(/\s+/g, '_')}.pdf`;

  return { filename, blob };
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 2000);
}

export async function sharePinReport(
  bm: Bookmark,
  sheet: PlanSheet,
  mode: 'share' | 'download'
): Promise<'shared' | 'downloaded'> {
  const { filename, blob } = await generatePinReport(bm, sheet);
  const fileToShare = new File([blob], filename, { type: 'application/pdf' });

  const shareText = `*DHOLERA SIR STATUTORY PLOT DOSSIER*\n` +
    `• Plot: Survey ${bm.surveyNo || bm.plotNo || 'Verified'} (${bm.finalPlot || 'Reconstituted'})\n` +
    `• Village: ${bm.village || 'Dholera SIR'}\n` +
    `• TP Scheme: ${sheet.label}\n` +
    `• Zone: ${bm.zone || 'Commercial / Industrial'}\n` +
    `• Road Width: ${bm.roadWidthM || 30}m Statutory Corridor\n\n` +
    `Official DSIRDA Blueprint crop & Jantri stamp duty analysis attached in PDF.\n` +
    `Interactive Atlas: https://dholeramap.com/viewer?sheet=${sheet.sid}&x=${bm.x}&y=${bm.y}`;

  if (mode === 'share') {
    try {
      if (typeof navigator !== 'undefined' && navigator.canShare?.({ files: [fileToShare] })) {
        await navigator.share({
          files: [fileToShare],
          title: `Dholera SIR Plot Dossier — Survey ${bm.surveyNo || ''}`,
          text: shareText,
        });
        return 'shared';
      }
    } catch (err) {
      if ((err as DOMException)?.name === 'AbortError') return 'shared';
    }

    // Fallback on Desktop or if file sharing not permitted: download and open WhatsApp Web
    downloadBlob(blob, filename);
    const waUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
    window.open(waUrl, '_blank', 'noopener');
    return 'downloaded';
  }

  downloadBlob(blob, filename);
  return 'downloaded';
}
