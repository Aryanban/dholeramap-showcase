/**
 * POST /api/entitlements/finalize-dossier
 *
 * Server-authoritative dossier stamping and provenance registration.
 * 1. Requires authenticated Clerk session.
 * 2. Executes atomic quota decrement via PostgreSQL `consume_pdfs` RPC (or admin bypass).
 * 3. Mints a unique statutory dossier identifier.
 * 4. Appends an authoritative cryptographic verification page with dynamic QR code
 *    linking to https://dholeramap.com/verify/[dossierId].
 * 5. Computes SHA-256 fingerprint of the stamped document.
 * 6. Inserts the provenance record into the Supabase `dossiers` table.
 * 7. Returns the stamped PDF bytes with custom provenance headers.
 */
import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import QRCode from 'qrcode';
import { createHash } from 'node:crypto';
import {
  PLANS,
  TRIAL_PDF_CAP,
  deriveFlags,
  isTrialActive,
  parseEntitlements,
} from '@/lib/entitlements';
import {
  readEntitlements,
  requireUserId,
  syncEntitlements,
} from '@/lib/razorpay-server';
import { isAdminUser } from '@/lib/admin';
import { consumePdfsAtomic, insertDossier } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function generateDossierId(parcel: Record<string, unknown>): string {
  const tp = String(parcel?.tpScheme || 'TP1')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '');
  const fp = String(parcel?.finalPlot || parcel?.surveyNo || 'PLT')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '');
  const rand = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `DHO-${tp || 'TP1'}-${fp || '399'}-${rand}`;
}

export async function POST(req: NextRequest) {
  const authed = await requireUserId();
  if (!authed.ok) return authed.response;
  const userId = authed.userId;

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch (err) {
    return NextResponse.json({ error: 'Multipart form data required' }, { status: 400 });
  }

  const pdfFile = formData.get('pdf') as File | null;
  const parcelStr = formData.get('parcel') as string | null;
  const planName = (formData.get('plan') as string) || 'pro';

  if (!pdfFile) {
    return NextResponse.json({ error: 'Missing PDF file in payload' }, { status: 400 });
  }

  let parcel: Record<string, unknown> = {};
  if (parcelStr) {
    try {
      parcel = JSON.parse(parcelStr);
    } catch {
      parcel = {};
    }
  }

  // The quota resolution (Clerk admin check + Supabase read) and the PDF
  // parse are independent, but were run one after the other. Parsing a
  // multi-megabyte dossier is the slow half of this route, so it starts now
  // and overlaps the quota round trips entirely.
  const pdfBytesPromise = pdfFile.arrayBuffer();
  const [isAdmin, stored] = await Promise.all([
    isAdminUser(userId),
    readEntitlements(userId),
  ]);

  // 1. Quota check & atomic decrement
  if (!isAdmin) {
    const state = parseEntitlements(stored);
    const flags = deriveFlags(state);

    if (!flags.canExportPdf || flags.pdfsAvailable < 1) {
      return NextResponse.json(
        {
          error: 'Quota exhausted',
          reason: flags.isFree ? 'upgrade_required' : 'quota_exhausted',
          pdfsAvailable: 0,
        },
        { status: 402 }
      );
    }

    const planConfig = PLANS[flags.plan] || PLANS.pro;
    const trialing = isTrialActive(state);
    const includedCap = trialing ? TRIAL_PDF_CAP : planConfig.pdfsPerCycle;

    // Calculate spend order: included first, then rollover, then credits
    const includedRemaining = Math.max(0, includedCap - state.pdfsUsed);
    const usedNow = includedRemaining > 0 ? 1 : 0;
    const rolloverNow = !usedNow && state.rolloverBank > 0 ? 1 : 0;
    const creditsNow = !usedNow && !rolloverNow ? 1 : 0;

    let dbConsumed = false;
    try {
      const consumeResult = await consumePdfsAtomic(userId, 1, includedCap);
      if (!consumeResult.ok) {
        return NextResponse.json(
          {
            error: 'Insufficient quota',
            reason: 'quota_exhausted',
            pdfsAvailable: consumeResult.pdfsAvailable,
          },
          { status: 402 }
        );
      }
      dbConsumed = true;
    } catch (e) {
      console.warn('[finalize-dossier] DB decrement failed or unavailable, falling back to syncEntitlements:', e);
    }

    // Always mirror to Clerk metadata
    try {
      await syncEntitlements(
        userId,
        {
          pdfsUsed: state.pdfsUsed + usedNow,
          rolloverBank: Math.max(0, state.rolloverBank - rolloverNow),
          credits: Math.max(0, state.credits - creditsNow),
        },
        state
      );
    } catch (syncErr) {
      console.error('[finalize-dossier] syncEntitlements error:', syncErr);
      if (!dbConsumed) {
        return NextResponse.json({ error: 'Failed to process quota decrement' }, { status: 500 });
      }
    }
  }

  // 2. Mint unique statutory dossier ID
  const dossierId = generateDossierId(parcel);
  const verifyUrl = `https://dholeramap.com/verify/${dossierId}`;

  // 3. Load PDF and append authoritative verification certificate page
  const arrayBuffer = await pdfBytesPromise;
  const pdfDoc = await PDFDocument.load(arrayBuffer);
  const pages = pdfDoc.getPages();
  const firstPage = pages[0];
  const { width, height } = firstPage ? firstPage.getSize() : { width: 841.89, height: 595.28 };

  // Generate QR Code PNG
  const qrDataUrl = await QRCode.toDataURL(verifyUrl, {
    margin: 1,
    width: 320,
    color: { dark: '#000000', light: '#ffffff' },
  });
  const qrBase64 = qrDataUrl.split(',')[1] || '';
  const qrImage = await pdfDoc.embedPng(Buffer.from(qrBase64, 'base64'));

  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  // Add Verification Page at end of deck
  const page = pdfDoc.addPage([width, height]);
  const W = width;
  const H = height;

  // Background dark navy styling
  page.drawRectangle({
    x: 0,
    y: 0,
    width: W,
    height: H,
    color: rgb(11 / 255, 23 / 255, 38 / 255), // #0b1726
  });

  // Left gold accent stripe
  page.drawRectangle({
    x: 0,
    y: 0,
    width: 8,
    height: H,
    color: rgb(217 / 255, 119 / 255, 6 / 255), // amber-600
  });

  // Header banner
  page.drawText('GOVERNMENT & STATUTORY PLANNING PROVENANCE AUDIT', {
    x: 50,
    y: H - 45,
    size: 9,
    font: helveticaBold,
    color: rgb(159 / 255, 208 / 255, 255 / 255),
  });

  page.drawText('STATUTORY DOSSIER VERIFICATION CERTIFICATE', {
    x: 50,
    y: H - 75,
    size: 20,
    font: helveticaBold,
    color: rgb(1, 1, 1),
  });

  const village = String(parcel?.village || 'Dholera SIR').toUpperCase();
  const survey = String(parcel?.surveyNo || '—');
  const fp = String(parcel?.finalPlot || '—');
  const tp = String(parcel?.tpScheme || 'Town Planning Scheme');

  page.drawText(`${village}  ·  SURVEY ${survey}  ·  FINAL PLOT ${fp}  ·  ${tp}`, {
    x: 50,
    y: H - 100,
    size: 11,
    font: helvetica,
    color: rgb(232 / 255, 181 / 255, 77 / 255), // #e8b54d
  });

  // Divider line
  page.drawLine({
    start: { x: 50, y: H - 118 },
    end: { x: W - 50, y: H - 118 },
    thickness: 1,
    color: rgb(30 / 255, 58 / 255, 95 / 255),
  });

  // Card Left: Details & Fingerprint
  const cardY = H - 140;
  page.drawText('OFFICIAL AUDIT IDENTIFIER', {
    x: 50,
    y: cardY,
    size: 8,
    font: helveticaBold,
    color: rgb(148 / 255, 163 / 255, 184 / 255),
  });
  page.drawText(dossierId, {
    x: 50,
    y: cardY - 20,
    size: 14,
    font: helveticaBold,
    color: rgb(56 / 255, 189 / 255, 248 / 255), // sky-400
  });

  page.drawText('ISSUED AUTHORITY', {
    x: 50,
    y: cardY - 55,
    size: 8,
    font: helveticaBold,
    color: rgb(148 / 255, 163 / 255, 184 / 255),
  });
  page.drawText('DholeraMap Geographic Engine (PlotBook Statutory Intelligence)', {
    x: 50,
    y: cardY - 72,
    size: 10,
    font: helvetica,
    color: rgb(1, 1, 1),
  });

  page.drawText('GENERATED DATE & TIMESTAMP', {
    x: 50,
    y: cardY - 105,
    size: 8,
    font: helveticaBold,
    color: rgb(148 / 255, 163 / 255, 184 / 255),
  });
  const nowStr = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
  page.drawText(`${nowStr} IST (Authentic Gazetted Snapshot)`, {
    x: 50,
    y: cardY - 122,
    size: 10,
    font: helvetica,
    color: rgb(1, 1, 1),
  });

  // QR Code Box (Right Side)
  const qrBoxX = W - 250;
  const qrBoxY = H - 360;
  page.drawRectangle({
    x: qrBoxX - 10,
    y: qrBoxY - 10,
    width: 200,
    height: 220,
    color: rgb(15 / 255, 30 / 255, 48 / 255),
    borderColor: rgb(30 / 255, 58 / 255, 95 / 255),
    borderWidth: 1,
  });

  page.drawImage(qrImage, {
    x: qrBoxX + 10,
    y: qrBoxY + 30,
    width: 160,
    height: 160,
  });

  page.drawText('SCAN TO VERIFY AUTHENTICITY', {
    x: qrBoxX + 8,
    y: qrBoxY + 12,
    size: 8,
    font: helveticaBold,
    color: rgb(255 / 255, 255 / 255, 255 / 255),
  });

  page.drawText('dholeramap.com/verify', {
    x: qrBoxX + 35,
    y: qrBoxY - 2,
    size: 7.5,
    font: helvetica,
    color: rgb(148 / 255, 163 / 255, 184 / 255),
  });

  // Statutory validity statement at bottom
  page.drawText(
    'Notice: This statutory land verification document contains gazetted Town Planning Scheme demarcations and revenue records. Verification record is registered in real-time in the DholeraMap statutory database.',
    {
      x: 50,
      y: 40,
      size: 7.5,
      font: helvetica,
      color: rgb(148 / 255, 163 / 255, 184 / 255),
      maxWidth: W - 100,
    }
  );

  // 4. Save stamped PDF and compute SHA-256
  const stampedBytes = await pdfDoc.save();
  const pdfSha256 = createHash('sha256').update(stampedBytes).digest('hex');

  // 5. Register in Supabase `dossiers` table
  try {
    await insertDossier({
      dossier_id: dossierId,
      user_id: userId,
      parcel,
      plan: planName,
      pdf_sha256: pdfSha256,
    });
    // NOTE: no revalidateTag('dossiers') here on purpose. readDossier() only
    // caches FOUND rows (misses throw and fall back to a live read), so a
    // verify scan made moments after this insert still reads the fresh row.
    // A global tag bust would purge every cached dossier and force a Supabase
    // re-read per ID on the next scan — pure ISR/data-cache churn.
  } catch (err) {
    console.error('[finalize-dossier] database insert error:', err);
    // Non-fatal if DB temporarily unreachable, but logged
  }

  // 6. Return stamped PDF stream with provenance headers
  return new Response(Buffer.from(stampedBytes), {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${dossierId}.pdf"`,
      'X-Dossier-Id': dossierId,
      'X-Dossier-Sha256': pdfSha256,
      'X-Verify-Url': verifyUrl,
    },
  });
}
