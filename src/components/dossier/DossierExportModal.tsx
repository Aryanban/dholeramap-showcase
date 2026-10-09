'use client';

/**
 * Client dossier export workflow (dashboard).
 *
 * Pick one of the bundled developer templates (Template 1 / Template 2) or, as
 * an advanced path, upload a different developer PDF. Everything is stored and
 * processed locally in IndexedDB. Plot fields are optional — leave them blank to
 * use the system's resolved survey data; edit only what needs correcting.
 */

import React, { useEffect, useMemo, useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import { useApp } from '@/lib/store';
import { Crown, Download, Eye, Share2, Coins, Plus, Sparkles } from 'lucide-react';
import type { Bookmark } from '@/lib/types';
import { downloadBlob } from '@/lib/pin-pdf';
import { initiateCreditPackCheckout } from '@/lib/razorpay';
import {
  deleteDossierTemplate,
  getDossierTemplate,
  listDossierTemplates,
  saveDossierTemplate,
  sha256Hex,
} from '@/lib/dossier/storage';
import {
  buildGenericDefinition,
  BUILTIN_TEMPLATES,
  findGeneratedTemplate,
  findKnownTemplate,
  type BuiltinTemplate,
  KNOWN_TEMPLATES,
} from '@/lib/dossier/templates';
import type {
  ContentPlan,
  DossierBuildResult,
  DossierDocItem,
  DossierOptions,
  DossierParcel,
  DossierPageRole,
  DossierTemplateDefinition,
  PlanRow,
  StoredDossierTemplate,
} from '@/lib/dossier/types';
import { resolveDossierParcel, type ParcelOverrides } from '@/lib/dossier/parcel';
import { getBranding, currentUserId } from '@/lib/dossier/branding';
import { buildDossier } from '@/lib/dossier/build';
import { buildContentPlan, editableRoles } from '@/lib/dossier/content-plan';
import { useEntitlements } from '@/hooks/useEntitlements';
import Paywall from '@/components/Paywall';
import QuotaGuard from '@/components/QuotaGuard';

interface Props {
  pin: Bookmark;
  onClose: () => void;
}

function definitionFor(stored: StoredDossierTemplate): DossierTemplateDefinition {
  const known = KNOWN_TEMPLATES.find((t) => t.id === stored.definitionId);
  if (known) return known;
  return buildGenericDefinition(stored.name, stored.pageCount, stored.width, stored.height);
}

/** Human labels for the page roles shown in the review stage. */
const ROLE_LABELS: Record<string, string> = {
  cover: '1 · Cover & Title Identity',
  'executive-summary': '2 · Executive Summary & Scorecard',
  'property-details': '3 · Property Specifications',
  'land-details': '4 · Land Registry & Statutory Title',
  'tp-location': '5 · TP Scheme Georeferenced Atlas',
  zoning: '6 · Zoning & DGDCR Permissibility',
  'op-fp': '7 · Cadastral OP vs FP Reconstitution',
  'parcel-zooms': '8 · Micro-Cadastral Zoom Grid',
  'about-dholera': '9 · What is Dholera SIR? (Macro Scale)',
  connectivity: '10 · Strategic Connectivity Corridors',
  'mega-projects': '11 · Mega Catalysts & Tata Fab Ecosystem',
  'tp-scheme-planning': '12 · Town Planning & 50% Reconstitution',
  dgdcr: '13 · DGDCR Regulatory Schedule',
  documents: '14 · Statutory Due Diligence Checklist',
  closing: '15 · Transaction Sign-Off & Live QR',
  images: 'Site Photos & Infrastructure',
  marketing: 'Marketing Appendix',
};

export default function DossierExportModal({ pin, onClose }: Props) {
  const ent = useEntitlements();
  const currentEnt = useApp((s) => s.entitlements);
  const hydrateEntitlements = useApp((s) => s.hydrateEntitlements);
  const updateBookmark = useApp((s) => s.updateBookmark);
  const user = useApp((s) => s.user);
  const [templates, setTemplates] = useState<StoredDossierTemplate[]>([]);
  const [templateId, setTemplateId] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadErr, setUploadErr] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [loadingTemplate, setLoadingTemplate] = useState(false);

  const [district, setDistrict] = useState('');
  const [taluka, setTaluka] = useState('');
  const [tenure, setTenure] = useState('');
  const [naStatus, setNaStatus] = useState('');
  const [fpRoad, setFpRoad] = useState('');
  const [oldSurveyNo, setOldSurveyNo] = useState('');
  const [price, setPrice] = useState('');
  const [pricePerSqYd, setPricePerSqYd] = useState('');
  const [reraId, setReraId] = useState('');

  // Review stage: the resolved parcel + the editable per-page plan. Present
  // once the dealer has prepared the pages; the build then renders exactly it.
  const [reviewParcel, setReviewParcel] = useState<DossierParcel | null>(null);
  const [reviewDocs, setReviewDocs] = useState<DossierDocItem[]>([]);
  const [reviewWarnings, setReviewWarnings] = useState<string[]>([]);
  const [plan, setPlan] = useState<ContentPlan | null>(null);
  const [preparing, setPreparing] = useState(false);
  const [openPages, setOpenPages] = useState<Set<string>>(() => new Set(['property-details']));

  /** Any detail edit after preparing makes the prepared plan stale. */
  function invalidateReview() {
    if (plan || reviewParcel) {
      setPlan(null);
      setReviewParcel(null);
      setReviewDocs([]);
      setReviewWarnings([]);
    }
  }

  const [pageSize, setPageSize] = useState<DossierOptions['pageSize']>('template-native');
  const [quality, setQuality] = useState<DossierOptions['quality']>('whatsapp');
  const [includeMarketing, setIncludeMarketing] = useState(true);
  const [includeDgdcr, setIncludeDgdcr] = useState(true);
  const [includeDocuments, setIncludeDocuments] = useState(true);
  const [includeImages, setIncludeImages] = useState(true);
  const [includeClosing, setIncludeClosing] = useState(true);

  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState('');
  const [result, setResult] = useState<DossierBuildResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [showCreditModal, setShowCreditModal] = useState(false);
  const [buyingCredits, setBuyingCredits] = useState(false);
  const [creditErr, setCreditErr] = useState<string | null>(null);

  useEffect(() => {
    if (!pin) return;
    setResult(null);
    setError(null);
    setPlan(null);
    setReviewParcel(null);
    setReviewDocs([]);
    setDistrict(pin.district || '');
    setTaluka(pin.taluka || '');
    setTenure(pin.tenure || '');
    setNaStatus(pin.naStatus || '');
    setFpRoad(pin.fpRoad || '');
    setOldSurveyNo(pin.oldSurveyNo || '');
    setPrice(pin.price || '');
    setPricePerSqYd(pin.pricePerSqYd ? String(pin.pricePerSqYd) : '');
    setReraId(pin.reraId || '');
    void listDossierTemplates().then((list) => {
      setTemplates(list);
      if (templateId) return;
      // Prefer an already-cached built-in template so the user can generate
      // immediately without picking anything.
      const cachedBuiltin = BUILTIN_TEMPLATES.find((b) => list.some((t) => t.id === b.storageId));
      if (cachedBuiltin) setTemplateId(cachedBuiltin.storageId);
      else if (list.length > 0) setTemplateId(list[0].id);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pin?.id]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  const selectedTemplate = useMemo(
    () => templates.find((t) => t.id === templateId) || null,
    [templates, templateId]
  );

  // Uploaded templates, excluding the bundled ones (shown as their own cards).
  const customTemplates = useMemo(
    () => templates.filter((t) => !BUILTIN_TEMPLATES.some((b) => b.storageId === t.id)),
    [templates]
  );

  // True for a fully generated deck: nothing is stored locally, so the generate
  // button must not wait for a selected stored template.
  const isGeneratedSelected = useMemo(
    () => BUILTIN_TEMPLATES.some((b) => b.generated && b.storageId === templateId),
    [templateId]
  );

  // The definition the build will use (known/generated for built-ins, else the
  // generic one for an upload). Drives which pages are editable in the review.
  const definitionForReview = useMemo<DossierTemplateDefinition>(() => {
    const builtinGenerated = BUILTIN_TEMPLATES.find((b) => b.generated && b.storageId === templateId);
    if (builtinGenerated) {
      const gen = findGeneratedTemplate(builtinGenerated.definitionId);
      if (gen) return gen;
    }
    const stored = templates.find((t) => t.id === templateId) || null;
    if (!stored) return buildGenericDefinition('Template', 0, 960, 540);
    return definitionFor(stored);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [templateId, templates]);

  const activePin = pin;

  async function refreshTemplates(selectId?: string) {
    const list = await listDossierTemplates();
    setTemplates(list);
    if (selectId) setTemplateId(selectId);
    else if (list.length > 0 && !list.some((t) => t.id === templateId)) setTemplateId(list[0].id);
  }

  /** Fetch (once) + cache a bundled template, then select it. Cached after first use. */
  async function ensureBuiltin(item: BuiltinTemplate) {
    // A fully generated deck has nothing to download: selecting it is enough.
    if (item.generated) {
      setTemplateId(item.storageId);
      return;
    }
    const existing = templates.find((t) => t.id === item.storageId);
    if (existing) {
      setTemplateId(item.storageId);
      return;
    }
    setLoadingTemplate(true);
    setError(null);
    try {
      const res = await fetch(item.url);
      if (!res.ok) throw new Error('Could not download the bundled template.');
      const buf = new Uint8Array(await res.arrayBuffer());
      const sha = await sha256Hex(buf);
      const src = await PDFDocument.load(buf.slice(), { ignoreEncryption: true });
      const p0 = src.getPage(0);
      const known = findKnownTemplate(sha, src.getPageCount(), p0.getWidth(), p0.getHeight());
      const record: StoredDossierTemplate = {
        id: item.storageId,
        definitionId: known ? known.id : null,
        name: item.name,
        developer: known ? known.developer : 'Developer-supplied template',
        sourceFileName: item.url.split('/').pop() || 'template.pdf',
        sourceBytes: buf,
        sha256: sha,
        pageCount: src.getPageCount(),
        width: p0.getWidth(),
        height: p0.getHeight(),
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      await saveDossierTemplate(record);
      await refreshTemplates(record.id);
      setToast(known ? `${item.name} ready — calibrated slots applied.` : `${item.name} ready.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load the template.');
    } finally {
      setLoadingTemplate(false);
    }
  }

  async function handleUploadFile(file: File) {
    setUploading(true);
    setUploadErr(null);
    try {
      if (!file.name.toLowerCase().endsWith('.pdf')) throw new Error('Please upload a PDF template file.');
      if (file.size > 60 * 1024 * 1024) throw new Error('Template PDF exceeds the 60 MB local limit.');
      const buf = new Uint8Array(await file.arrayBuffer());
      const sha = await sha256Hex(buf);
      const src = await PDFDocument.load(buf.slice(), { ignoreEncryption: true });
      const p0 = src.getPage(0);
      const known = findKnownTemplate(sha, src.getPageCount(), p0.getWidth(), p0.getHeight());
      const record: StoredDossierTemplate = {
        id: `tmpl-${Date.now().toString(36)}`,
        definitionId: known ? known.id : null,
        name: known ? known.name : file.name.replace(/\.pdf$/i, ''),
        developer: known ? known.developer : 'Developer-supplied template',
        sourceFileName: file.name,
        sourceBytes: buf,
        sha256: sha,
        pageCount: src.getPageCount(),
        width: p0.getWidth(),
        height: p0.getHeight(),
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      await saveDossierTemplate(record);
      await refreshTemplates(record.id);
      setToast(known ? `Recognized “${known.name}” — calibrated slots applied.` : 'Template stored. It will use generated plot pages + your PDF as appendix.');
    } catch (err) {
      setUploadErr(err instanceof Error ? err.message : 'Failed to import template');
    } finally {
      setUploading(false);
    }
  }

  async function handleDeleteTemplate(id: string) {
    await deleteDossierTemplate(id);
    await refreshTemplates();
    setToast('Template removed from this device');
  }

  /** Field corrections + pricing the dealer entered; applied to the saved plot on generate. */
  function buildOverrides(): ParcelOverrides {
    const o: ParcelOverrides = {
      district: district.trim() || undefined,
      taluka: taluka.trim() || undefined,
      tenure: tenure.trim() || undefined,
      naStatus: naStatus.trim() || undefined,
      fpRoad: fpRoad.trim() || undefined,
      oldSurveyNo: oldSurveyNo.trim() || undefined,
      price: price.trim() || undefined,
      reraId: reraId.trim() || undefined,
    };
    const rate = Number(pricePerSqYd.replace(/[^0-9.]/g, ''));
    if (rate > 0) o.pricePerSqYd = rate;
    return o;
  }

  /**
   * Resolve the parcel and lay out every generated page as an editable plan,
   * so the dealer reviews and corrects each table before any PDF is built.
   * Cheaper than the build (no map stitching), so it is safe to re-run.
   */
  async function handlePrepareReview() {
    setPreparing(true);
    setError(null);
    try {
      const { parcel, docs, warnings } = await resolveDossierParcel(activePin, buildOverrides());
      setReviewParcel(parcel);
      setReviewDocs(docs);
      setReviewWarnings(warnings);
      setPlan(buildContentPlan(parcel, docs));
      setOpenPages(new Set(['property-details']));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not prepare the page content');
    } finally {
      setPreparing(false);
    }
  }

  function patchPage(role: string, fn: (page: ContentPlan[string]) => ContentPlan[string]) {
    setPlan((prev) => (prev && prev[role] ? { ...prev, [role]: fn(prev[role]) } : prev));
  }

  function updateRow(role: string, id: string, patch: Partial<PlanRow>) {
    patchPage(role, (p) => ({ ...p, rows: p.rows.map((r) => (r.id === id ? { ...r, ...patch } : r)) }));
  }

  function updateBullet(role: string, id: string, value: string) {
    patchPage(role, (p) => ({ ...p, bullets: p.bullets.map((r) => (r.id === id ? { ...r, value } : r)) }));
  }

  function addBullet(role: string) {
    patchPage(role, (p) => ({ ...p, bullets: [...p.bullets, { id: `hb-new-${Date.now().toString(36)}`, label: 'Highlight', value: '', checked: false, included: true }] }));
  }

  function toggleCheck(role: string, id: string) {
    patchPage(role, (p) => ({ ...p, checks: p.checks.map((c) => (c.id === id ? { ...c, checked: !c.checked } : c)) }));
  }

  async function handleGenerate() {
    setGenerating(true);
    setError(null);
    setResult(null);
    try {
      // A fully-generated deck needs no stored PDF: resolve its definition
      // directly and synthesise the template record the builder expects.
      const builtinGenerated = BUILTIN_TEMPLATES.find((b) => b.generated && b.storageId === templateId);
      let stored: StoredDossierTemplate | null | undefined;
      let definition: DossierTemplateDefinition;
      if (builtinGenerated) {
        const gen = findGeneratedTemplate(builtinGenerated.definitionId);
        if (!gen) throw new Error('The Investor Executive deck is unavailable.');
        stored = null;
        definition = gen;
      } else {
        if (!selectedTemplate) throw new Error('Upload a developer template PDF first.');
        stored = (await getDossierTemplate(selectedTemplate.id)) ?? null;
        if (!stored) throw new Error('Template not found in local storage.');
        definition = definitionFor(stored);
      }
      const overrides = buildOverrides();
      setProgress('Resolving plot + survey data…');
      // Reuse the parcel + plan the dealer already reviewed when the details
      // have not changed since preparing; otherwise resolve fresh.
      let parcel: DossierParcel;
      let docs: DossierDocItem[];
      let reviewPlan: ContentPlan | undefined;
      let resolveWarnings: string[] = [];
      if (plan && reviewParcel) {
        parcel = reviewParcel;
        docs = reviewDocs;
        reviewPlan = plan;
        resolveWarnings = reviewWarnings;
      } else {
        const resolved = await resolveDossierParcel(activePin, overrides);
        parcel = resolved.parcel;
        docs = resolved.docs;
        resolveWarnings = resolved.warnings;
      }
      // Persist field corrections back to the saved plot.
      const patch: Partial<Bookmark> = {};
      if (overrides.district) patch.district = overrides.district;
      if (overrides.taluka) patch.taluka = overrides.taluka;
      if (overrides.tenure) patch.tenure = overrides.tenure;
      if (overrides.naStatus) patch.naStatus = overrides.naStatus;
      if (overrides.fpRoad) patch.fpRoad = overrides.fpRoad;
      if (overrides.oldSurveyNo) patch.oldSurveyNo = overrides.oldSurveyNo;
      if (overrides.price) patch.price = overrides.price;
      if (overrides.pricePerSqYd) patch.pricePerSqYd = overrides.pricePerSqYd;
      if (overrides.reraId) patch.reraId = overrides.reraId;
      if (Object.keys(patch).length > 0) updateBookmark(activePin.id, patch);

      const options: DossierOptions = {
        templateId: stored ? stored.id : templateId,
        pageSize,
        // High-DPI render is a Max entitlement; enforced here as well as in
        // the (disabled) select so a stale value can't slip through.
        quality: ent.highDpi ? quality : 'whatsapp',
        includeMarketing,
        includeDgdcr,
        includeDocuments,
        includeImages,
        includeClosing,
      };
      const localBranding = (await getBranding(currentUserId(user)).catch(() => undefined)) || null;
      const effectiveBranding = localBranding || (user ? {
        userId: user.id || currentUserId(user),
        logoDataUrl: null,
        name: user.name || '',
        phone: user.phone || '',
        email: user.email || '',
        company: user.company || '',
        tagline: '',
        updatedAt: Date.now(),
      } : null);
      const built = await buildDossier({
        stored: stored || undefined,
        definition,
        parcel,
        docs,
        options,
        plan: reviewPlan,
        branding: effectiveBranding,
        onProgress: (m) => setProgress(m),
      });

      setProgress('Stamping official statutory certificate…');
      try {
        const formData = new FormData();
        formData.append('pdf', built.blob, built.filename);
        formData.append('parcel', JSON.stringify(parcel));
        formData.append('plan', ent.plan || 'pro');

        const finalizeRes = await fetch('/api/entitlements/finalize-dossier', {
          method: 'POST',
          body: formData,
        });

        if (finalizeRes.ok) {
          const stampedBlob = await finalizeRes.blob();
          setResult({
            ...built,
            blob: stampedBlob,
            pageCount: built.pageCount + 1,
            warnings: [...resolveWarnings, ...built.warnings],
          });
        } else {
          const errData = await finalizeRes.json().catch(() => ({}));
          if (finalizeRes.status === 402) {
            throw new Error(errData?.error || 'Quota exhausted — please upgrade to export');
          }
          setResult({ ...built, warnings: [...resolveWarnings, ...built.warnings] });
        }
      } catch (finalizeErr) {
        if (finalizeErr instanceof Error && finalizeErr.message.includes('Quota')) {
          throw finalizeErr;
        }
        setResult({ ...built, warnings: [...resolveWarnings, ...built.warnings] });
      }
      setProgress('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Dossier generation failed');
      setProgress('');
    } finally {
      setGenerating(false);
    }
  }

  async function handleShareWhatsApp() {
    if (!result) return;
    const file = new File([result.blob], result.filename, { type: 'application/pdf' });
    const text =
      `Client plot dossier: ${activePin.customName || activePin.label}\n` +
      `Survey ${activePin.surveyNo || '—'} · FP ${activePin.finalPlot || '—'} · ${activePin.village || ''}\n` +
      `Full landscape dossier attached (${result.pageCount} pages).`;
    try {
      if (typeof navigator !== 'undefined' && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: result.filename, text });
        setToast('Shared via system share sheet');
        return;
      }
    } catch (err) {
      if ((err as DOMException)?.name === 'AbortError') return;
    }
    downloadBlob(result.blob, result.filename);
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank', 'noopener');
    setToast('Downloaded — WhatsApp share opened');
  }

  return (
    <div className="fixed inset-0 z-[2000] grid place-items-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />
      <div className="relative w-full max-w-3xl rounded-3xl bg-white shadow-2xl border border-slate-200 max-h-[92vh] overflow-y-auto">
        <div className="sticky top-0 bg-white/95 backdrop-blur border-b border-slate-100 px-6 py-4 flex items-center justify-between z-10 gap-3">
          <div>
            <h3 className="text-base font-black text-slate-900">Client-Ready Plot Dossier</h3>
            <p className="text-xs text-slate-500">
              {activePin.customName || activePin.label} · Survey {activePin.surveyNo || '—'} · FP {activePin.finalPlot || '—'}
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Prominent Credit Counter on Top Right */}
            {ent.isAdmin ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-50 border border-purple-200 text-purple-700 text-xs font-black shadow-2xs">
                <Crown className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                <span>Unlimited (Admin)</span>
              </span>
            ) : ent.isPro || ent.isMax ? (
              <div className="flex items-center gap-1.5">
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black border shadow-2xs ${
                    ent.pdfsAvailable > 3
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      : ent.pdfsAvailable > 0
                        ? 'bg-amber-50 border-amber-200 text-amber-800'
                        : 'bg-rose-50 border-rose-200 text-rose-800'
                  }`}
                >
                  <Coins className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
                  <span>{ent.pdfsAvailable} Credits Left</span>
                </span>
                <button
                  type="button"
                  onClick={() => setShowCreditModal(true)}
                  className="px-2.5 py-1 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-xs flex items-center gap-1 cursor-pointer"
                  title="Buy additional PDF export credits"
                >
                  <Plus className="w-3 h-3" />
                  <span>Buy Credits</span>
                </button>
              </div>
            ) : (
              <a
                href="/pricing"
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold hover:bg-amber-100 transition shadow-2xs"
              >
                <span>Free Plan · Upgrade to Export</span>
              </a>
            )}

            <button onClick={onClose} className="w-8 h-8 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 cursor-pointer flex items-center justify-center font-bold">✕</button>
          </div>
        </div>

        {/* Credit Purchase Dialog */}
        {showCreditModal && (
          <div className="fixed inset-0 z-[2100] grid place-items-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <div className="fixed inset-0" onClick={() => setShowCreditModal(false)} aria-hidden="true" />
            <div className="relative w-full max-w-md rounded-3xl bg-white shadow-2xl border border-slate-200 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-black">
                    <Coins className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-900">Purchase Export Credits</h4>
                    <p className="text-[11px] text-slate-500">Credits never expire and roll over automatically.</p>
                  </div>
                </div>
                <button onClick={() => setShowCreditModal(false)} className="w-7 h-7 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 cursor-pointer flex items-center justify-center font-bold">✕</button>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                {[5, 10, 25, 50].map((count) => {
                  const cost = count * (ent.creditPriceInr || 200);
                  return (
                    <button
                      key={count}
                      type="button"
                      disabled={buyingCredits}
                      onClick={async () => {
                        setBuyingCredits(true);
                        setCreditErr(null);
                        try {
                          await initiateCreditPackCheckout({
                            credits: count,
                            userName: user?.name,
                            userEmail: user?.email,
                            userPhone: user?.phone,
                            onSuccess: (awarded) => {
                              setToast(`✓ Successfully added ${awarded} export credits!`);
                              setShowCreditModal(false);
                              if (currentEnt) {
                                hydrateEntitlements({
                                  ...currentEnt,
                                  credits: (currentEnt.credits || 0) + awarded,
                                });
                              }
                            },
                            onFailure: (err) => {
                              setCreditErr(err.message);
                            },
                          });
                        } catch (e) {
                          setCreditErr(e instanceof Error ? e.message : 'Credit purchase failed');
                        } finally {
                          setBuyingCredits(false);
                        }
                      }}
                      className="p-3.5 rounded-2xl border border-slate-200 hover:border-blue-500 bg-slate-50 hover:bg-blue-50/60 text-left transition cursor-pointer group disabled:opacity-50"
                    >
                      <div className="text-xs font-black text-slate-900 group-hover:text-blue-700 flex items-center justify-between">
                        <span>{count} Credits</span>
                        {count >= 25 && <span className="text-[9px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded-md">Best Value</span>}
                      </div>
                      <div className="text-base font-extrabold text-blue-600 mt-1">₹{cost.toLocaleString('en-IN')}</div>
                      <div className="text-[10px] text-slate-400">₹{(cost / count).toFixed(0)} / dossier</div>
                    </button>
                  );
                })}
              </div>

              {creditErr && <p className="text-xs font-bold text-red-600 bg-red-50 p-2 rounded-xl">{creditErr}</p>}
              {buyingCredits && <p className="text-xs font-bold text-blue-600 text-center animate-pulse">Launching secure Razorpay checkout…</p>}

              <div className="pt-1 text-center">
                <button
                  type="button"
                  onClick={() => setShowCreditModal(false)}
                  className="text-xs font-bold text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="px-6 py-5 space-y-5">
          {toast && (
            <div className="p-3 rounded-xl bg-slate-900 text-white text-xs font-bold">{toast}</div>
          )}

          {/* 1. Template */}
          <section className="space-y-2">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-500">1 · Template</h4>
            <div className="grid sm:grid-cols-2 gap-2">
              {BUILTIN_TEMPLATES.map((b) => {
                // A generated deck is always available; the others need a one-time download.
                const cached = b.generated || templates.some((t) => t.id === b.storageId);
                const selected = templateId === b.storageId;
                // Premium decks are Enterprise Max only; a non-Max user sees
                // the card but cannot select it.
                const locked = Boolean(b.premium) && !ent.premiumTemplates;
                return (
                  <button
                    key={b.storageId}
                    onClick={() => (locked ? null : void ensureBuiltin(b))}
                    disabled={loadingTemplate || locked}
                    title={locked ? 'Premium template — Enterprise Max' : ''}
                    className={`p-3 rounded-2xl border text-left cursor-pointer ${
                      locked
                        ? 'border-purple-200 bg-purple-50/40 cursor-not-allowed'
                        : selected
                          ? 'border-blue-600 bg-blue-50/60'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                    } disabled:opacity-60`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="text-xs font-black text-slate-900">{b.name}</div>
                      {locked ? (
                        <span className="text-[10px] font-bold text-purple-700 inline-flex items-center gap-1">
                          <Crown className="w-3 h-3 text-purple-600" />
                          <span>Max</span>
                        </span>
                      ) : loadingTemplate && selected ? (
                        <span className="text-[10px] font-bold text-blue-600">Loading…</span>
                      ) : cached ? (
                        <span className="text-[10px] font-bold text-emerald-600">✓ Ready</span>
                      ) : (
                        <span className="text-[10px] font-bold text-slate-400">Tap to load</span>
                      )}
                    </div>
                    {b.blurb && <div className="text-[11px] text-slate-500">{b.blurb}</div>}
                  </button>
                );
              })}
            </div>

            {customTemplates.length > 0 && (
              <div className="space-y-1.5 pt-1">
                <div className="text-[11px] font-bold text-slate-500">Your uploaded templates</div>
                {customTemplates.map((t) => (
                  <div
                    key={t.id}
                    className={`p-3 rounded-2xl border text-left ${t.id === templateId ? 'border-blue-600 bg-blue-50/60' : 'border-slate-200 bg-white'}`}
                  >
                    <button onClick={() => setTemplateId(t.id)} className="w-full text-left cursor-pointer">
                      <div className="text-xs font-black text-slate-900">{t.name}</div>
                      <div className="text-[11px] text-slate-500">{t.developer} · {t.pageCount} pages · {(t.sourceBytes.length / 1024 / 1024).toFixed(1)} MB</div>
                      <div className="text-[10px] text-slate-400 mt-0.5 truncate">{t.sourceFileName}</div>
                    </button>
                    <button onClick={() => handleDeleteTemplate(t.id)} className="mt-1.5 text-[11px] font-bold text-red-500 hover:text-red-700 cursor-pointer">Remove from device</button>
                  </div>
                ))}
              </div>
            )}

            {/* Advanced: use a different developer PDF */}
            <div className="pt-1">
              <button
                onClick={() => setShowAdvanced((v) => !v)}
                className="text-[11px] font-bold text-slate-500 hover:text-slate-800 cursor-pointer"
              >
                {showAdvanced ? '− Hide upload' : '＋ Use a different developer PDF'}
              </button>
              {showAdvanced && (
                <div className="mt-2 space-y-2">
                  <label className="flex items-center justify-center gap-2 p-3 rounded-2xl border-2 border-dashed border-slate-300 text-xs font-bold text-slate-600 cursor-pointer hover:border-blue-500 hover:text-blue-700">
                    <span>{uploading ? 'Importing…' : '＋ Upload developer template PDF'}</span>
                    <input
                      type="file"
                      accept="application/pdf,.pdf"
                      className="hidden"
                      disabled={uploading}
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) void handleUploadFile(f);
                        e.target.value = '';
                      }}
                    />
                  </label>
                  {uploadErr && <p className="text-xs font-bold text-red-600">{uploadErr}</p>}
                </div>
              )}
            </div>
          </section>

          {/* 2. Plot fields */}
          <section className="space-y-2">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-500">2 · Dossier details <span className="normal-case font-medium">(optional)</span></h4>
            <p className="text-[11px] text-slate-500">Leave blank to use the system’s resolved plot + survey data. Edit only what needs correcting — changes save back to the plot.</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {(
                [
                  ['District', district, setDistrict, 'Ahmedabad'],
                  ['Taluka', taluka, setTaluka, 'Dholera'],
                  ['Tenure', tenure, setTenure, 'e.g. Non Agriculture (N.A.)'],
                  ['NA status', naStatus, setNaStatus, 'e.g. DONE'],
                  ['F.P. road', fpRoad, setFpRoad, 'e.g. 250 MTRS EXPRESSWAY'],
                  ['Old survey no.', oldSurveyNo, setOldSurveyNo, 'e.g. 886'],
                  ['Asking price', price, setPrice, 'e.g. ₹45 Lakh or ₹1.2 Cr'],
                  ['Rate / sq. yd', pricePerSqYd, setPricePerSqYd, 'e.g. 4500'],
                  ['RERA / agent id', reraId, setReraId, 'e.g. GUJ/RERA/…'],
                ] as const
              ).map(([lbl, val, set, ph]) => (
                <div key={lbl}>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">{lbl}</label>
                  <input
                    value={val}
                    onChange={(e) => {
                      invalidateReview();
                      set(e.target.value);
                    }}
                    placeholder={ph}
                    className="w-full h-9 rounded-xl border border-slate-200 px-3 text-xs outline-none focus:border-blue-500"
                  />
                </div>
              ))}
            </div>
          </section>

          {/* 3. Review & edit: the dealer signs off every generated page before build */}
          <section className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-500">3 · Review &amp; edit pages</h4>
              <div className="flex items-center gap-2">
                {plan && (
                  <button
                    type="button"
                    onClick={() => {
                      const all = editableRoles(
                        { pages: definitionForReview.pages },
                        { includeDgdcr, includeDocuments, includeImages, includeClosing }
                      );
                      if (openPages.size >= all.length) {
                        setOpenPages(new Set());
                      } else {
                        setOpenPages(new Set(all));
                      }
                    }}
                    className="text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl px-3 py-2 cursor-pointer transition-colors"
                  >
                    {openPages.size > 0 ? 'Collapse All' : 'Expand All Pages'}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => void handlePrepareReview()}
                  disabled={preparing}
                  className={
                    plan
                      ? 'text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 rounded-xl px-3.5 py-2 hover:bg-blue-100 cursor-pointer disabled:opacity-60 transition-colors'
                      : 'text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-xl px-5 py-2.5 shadow-sm transition-all cursor-pointer disabled:opacity-60 flex items-center gap-1.5'
                  }
                >
                  {preparing ? 'Preparing…' : plan ? 'Refresh pages' : 'Edit pages'}
                </button>
              </div>
            </div>
            {plan && (
              <div className="space-y-2">
                {reviewWarnings.length > 0 && (
                  <ul className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded-xl p-2.5 space-y-1">
                    {reviewWarnings.map((w, i) => <li key={i}>⚠ {w}</li>)}
                  </ul>
                )}
                {editableRoles(
                  { pages: definitionForReview.pages },
                  { includeDgdcr, includeDocuments, includeImages, includeClosing }
                )
                  .filter((role) => {
                    const p = plan[role];
                    return p && (p.rows.length || p.checks.length || p.bullets.length);
                  })
                  .map((role) => {
                    const page = plan[role]!;
                    const open = openPages.has(role);
                    const includedRows = page.rows.filter((r) => r.included).length;
                    const checkedItems = page.checks.filter((c) => c.checked).length;
                    return (
                      <div key={role} className="rounded-2xl border border-slate-200 overflow-hidden">
                        <button
                          onClick={() =>
                            setOpenPages((prev) => {
                              const next = new Set(prev);
                              if (next.has(role)) next.delete(role);
                              else next.add(role);
                              return next;
                            })
                          }
                          className="w-full flex items-center justify-between gap-2 px-3 py-2.5 bg-slate-50 hover:bg-slate-100 cursor-pointer text-left"
                        >
                          <span className="text-xs font-black text-slate-800">{ROLE_LABELS[role] || role}</span>
                          <span className="text-[10px] font-bold text-slate-500">
                            {open ? '▲' : '▼'} {includedRows > 0 && `${includedRows} rows`}
                            {includedRows > 0 && checkedItems > 0 ? ' · ' : ''}
                            {checkedItems > 0 && `${checkedItems} ticked`}
                          </span>
                        </button>
                        {open && (
                          <div className="p-3 space-y-2 bg-white">
                            {page.rows.map((row) => (
                              <div key={row.id} className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  checked={row.included}
                                  onChange={() => updateRow(role, row.id, { included: !row.included })}
                                  title="Include this row in the page"
                                  className="w-4 h-4 accent-blue-600 shrink-0"
                                />
                                <input
                                  value={row.label}
                                  onChange={(e) => updateRow(role, row.id, { label: e.target.value })}
                                  className="w-2/5 h-8 rounded-lg border border-slate-200 px-2 text-[11px] font-bold outline-none focus:border-blue-500"
                                />
                                <input
                                  value={row.value}
                                  onChange={(e) => updateRow(role, row.id, { value: e.target.value })}
                                  className="flex-1 h-8 rounded-lg border border-slate-200 px-2 text-[11px] outline-none focus:border-blue-500"
                                />
                                <label className="flex items-center gap-1 text-[10px] font-bold text-slate-600 shrink-0 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={Boolean(row.checked)}
                                    onChange={() => updateRow(role, row.id, { checked: !row.checked })}
                                    className="w-3.5 h-3.5 accent-emerald-600"
                                  />
                                  ✓
                                </label>
                              </div>
                            ))}
                            {page.bullets.length > 0 && (
                              <div className="pt-1 border-t border-slate-100">
                                <div className="text-[10px] font-black uppercase tracking-wide text-slate-500 mb-1.5">Highlights</div>
                                <div className="space-y-1.5">
                                  {page.bullets.map((row) => (
                                    <div key={row.id} className="flex items-center gap-2">
                                      <input
                                        type="checkbox"
                                        checked={row.included}
                                        onChange={() => updateRow(role, row.id, { included: !row.included })}
                                        title="Include this highlight"
                                        className="w-4 h-4 accent-blue-600 shrink-0"
                                      />
                                      <input
                                        value={row.value}
                                        onChange={(e) => updateBullet(role, row.id, e.target.value)}
                                        placeholder="Add a highlight…"
                                        className="flex-1 h-8 rounded-lg border border-slate-200 px-2 text-[11px] outline-none focus:border-blue-500"
                                      />
                                    </div>
                                  ))}
                                </div>
                                {page.bullets.length < 6 && (
                                  <button onClick={() => addBullet(role)} className="mt-1.5 text-[10px] font-bold text-blue-700 hover:underline cursor-pointer">＋ Add highlight</button>
                                )}
                              </div>
                            )}
                            {page.checks.length > 0 && (
                              <div className="pt-1 border-t border-slate-100">
                                <div className="text-[10px] font-black uppercase tracking-wide text-slate-500 mb-1.5">Checklist</div>
                                <div className="space-y-1.5">
                                  {page.checks.map((check) => (
                                    <label key={check.id} className="flex items-center gap-2 cursor-pointer">
                                      <input
                                        type="checkbox"
                                        checked={check.checked}
                                        onChange={() => toggleCheck(role, check.id)}
                                        className="w-4 h-4 accent-emerald-600 shrink-0"
                                      />
                                      <span className={`text-[11px] font-bold ${check.checked ? 'text-slate-800' : 'text-slate-400 line-through'}`}>{check.label}</span>
                                      {check.detail && <span className="text-[10px] text-slate-400 truncate">{check.detail}</span>}
                                    </label>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            )}
          </section>

          {/* 4. Options */}
          <section className="space-y-2">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-500">4 · Output</h4>
            <div className="grid sm:grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Page size</label>
                <select value={pageSize} onChange={(e) => setPageSize(e.target.value as DossierOptions['pageSize'])} className="w-full h-9 rounded-xl border border-slate-200 px-2 text-xs bg-white">
                  <option value="template-native">Template native</option>
                  <option value="presentation-16x9">16:9 presentation</option>
                  <option value="a4-landscape">A4 landscape</option>
                  <option value="a4-portrait">A4 portrait</option>
                </select>
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Quality</label>
                <select
                  value={ent.highDpi ? quality : 'whatsapp'}
                  onChange={(e) => setQuality(e.target.value as DossierOptions['quality'])}
                  disabled={!ent.highDpi}
                  className="w-full h-9 rounded-xl border border-slate-200 px-2 text-xs bg-white disabled:opacity-60 disabled:cursor-not-allowed"
                  title={ent.highDpi ? '' : 'High-DPI print quality is Enterprise Max'}
                >
                  <option value="whatsapp">WhatsApp optimized</option>
                  <option value="print">High resolution (Max)</option>
                </select>
                {!ent.highDpi && (
                  <span className="text-[9px] text-purple-700 font-bold block mt-0.5">
                    Print-quality render unlocks on Enterprise Max
                  </span>
                )}
              </div>
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              {(
                [
                  ['Marketing appendix', includeMarketing, setIncludeMarketing],
                  ['DGDCR policy page', includeDgdcr, setIncludeDgdcr],
                  ['Documents checklist', includeDocuments, setIncludeDocuments],
                  ['Attached images', includeImages, setIncludeImages],
                  ['QR closing page', includeClosing, setIncludeClosing],
                ] as const
              ).map(([lbl, val, set]) => (
                <label key={lbl} className={`px-3 py-1.5 rounded-xl text-xs font-bold border cursor-pointer ${val ? 'bg-slate-900 text-white border-slate-900' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                  <input type="checkbox" checked={val} onChange={(e) => set(e.target.checked)} className="hidden" />
                  {val ? '✓ ' : ''}{lbl}
                </label>
              ))}
            </div>
          </section>

          {error && <p className="text-xs font-bold text-red-600">{error}</p>}

          <p className="text-[11px] text-slate-400 text-center">
            {ent.whiteLabel
              ? 'Your white-label branding (logo, agency name and contact) from '
              : ent.contactBlock
                ? 'Your contact details from '
                : 'Contact details are added on '}{' '}
            <a href="/settings" className="font-bold text-blue-600 hover:underline">Settings</a>{' '}
            {ent.whiteLabel
              ? 'are applied to every page, with no PlotBook credit.'
              : 'are applied to every page automatically.'}
            {!ent.whiteLabel && (
              <span className="block mt-1 text-[10px] text-purple-700 font-semibold">
                Full white-label branding (logo + agency name, no PlotBook credit) is Enterprise Max.
              </span>
            )}
          </p>

          {/* PDF generation is quota-gated server-side: the guard asks
              /api/entitlements/consume-pdf for a unit before building. */}
          {ent.isFree ? (
            <Paywall feature="export" />
          ) : (
            <QuotaGuard onAllowed={handleGenerate} className="w-full">
              <span
                className={`block w-full py-3 rounded-2xl text-white text-sm font-black cursor-pointer text-center ${
                  generating || loadingTemplate || (!selectedTemplate && !isGeneratedSelected)
                    ? 'bg-blue-400'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {generating ? (progress || 'Generating…') : loadingTemplate ? 'Loading template…' : 'Generate landscape dossier'}
              </span>
            </QuotaGuard>
          )}

          {ent.pdfsAvailable <= 3 && !ent.isFree && (
            <p className="text-[10px] text-amber-700 font-bold text-center">
              {ent.pdfsAvailable} PDF{ent.pdfsAvailable === 1 ? '' : 's'} left
              {ent.includedRemaining === 0 && ent.canBuyCredits
                ? ' — buy credits or upgrade to Enterprise Max.'
                : ' this cycle.'}
            </p>
          )}

          {result && (
            <section className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-black text-slate-900">{result.filename}</div>
                  <div className="text-[11px] text-slate-500">{result.pageCount} landscape pages · {(result.bytes / 1024 / 1024).toFixed(1)} MB · {result.pageSize[0].toFixed(0)}×{result.pageSize[1].toFixed(0)} pt</div>
                </div>
              </div>
              {result.warnings.length > 0 && (
                <ul className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded-xl p-2.5 space-y-1">
                  {result.warnings.map((w, i) => <li key={i}>⚠ {w}</li>)}
                </ul>
              )}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {result.snapshots.map((s) => (
                  <figure key={s.view} className="rounded-xl overflow-hidden border border-slate-200 bg-white">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={s.dataUrl} alt={s.label} className="w-full aspect-video object-cover" />
                    <figcaption className="text-[10px] font-bold text-slate-600 px-2 py-1 truncate">{s.label}</figcaption>
                  </figure>
                ))}
              </div>
              <div className="grid sm:grid-cols-3 gap-2">
                <button onClick={() => downloadBlob(result.blob, result.filename)} className="py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black cursor-pointer flex items-center justify-center gap-1.5 transition shadow-xs">
                  <Download className="w-3.5 h-3.5 shrink-0" />
                  <span>Download PDF</span>
                </button>
                <button onClick={() => window.open(URL.createObjectURL(result.blob), '_blank', 'noopener')} className="py-2.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-black cursor-pointer flex items-center justify-center gap-1.5 transition">
                  <Eye className="w-3.5 h-3.5 shrink-0" />
                  <span>Preview</span>
                </button>
                <button onClick={handleShareWhatsApp} className="py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black cursor-pointer flex items-center justify-center gap-1.5 transition shadow-xs">
                  <Share2 className="w-3.5 h-3.5 shrink-0" />
                  <span>WhatsApp</span>
                </button>
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
