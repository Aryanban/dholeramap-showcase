'use client';

import React, { useEffect, useMemo, useState, useRef } from 'react';
import { useApp } from '@/lib/store';
import { loadManifest } from '@/lib/sheets';
import type { PlanSheet, Bookmark, Facing, DealIntent, DealOutcome, AttachedDoc, AttachedDocType } from '@/lib/types';
import { getDocsByPin, saveDoc, deleteDoc, DOC_TYPE_INFO, formatFileSize, fileToDataUrl } from '@/lib/doc-storage';
import { setCorrection, loadCorrections } from '@/lib/corrections';
import {
  Crosshair,
  Share2,
  Tag,
  ChevronUp,
  ChevronDown,
  Bookmark as BookmarkIcon,
  Route,
  Maximize2,
  Building2,
  Factory,
  Home,
  Sun,
  GraduationCap,
  Plane,
  Lock,
  FolderCheck,
  FileText,
  Edit3,
  Info,
  Map,
  Plus,
  Save,
  Compass,
} from 'lucide-react';
import { useEntitlements } from '@/hooks/useEntitlements';
import Paywall from '@/components/Paywall';

/**
 * Inline correction control (doc 17 §4.1). Shown only where the generated assignment is
 * missing or unverified, so a broker can record the true number. Stored locally; the value
 * is applied over the base data on the next plots hydratation and flagged user-verified.
 */
function CorrectionField({ recordId, field, placeholder }: {
  recordId: string;
  field: 'finalPlot' | 'surveyNo';
  placeholder: string;
}) {
  const [val, setVal] = useState('');
  const [saved, setSaved] = useState<string | null>(null);

  useEffect(() => {
    const c = loadCorrections()[recordId];
    setSaved(c && c[field] ? c[field]! : null);
  }, [recordId, field]);

  const submit = () => {
    const v = val.trim();
    if (!v) return;
    setCorrection(recordId, { [field]: v });
    setSaved(v);
    setVal('');
  };

  if (saved) {
    return (
      <span className="text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded inline-flex items-center gap-1 mt-1 font-medium">
        ✓ you verified: {saved}
        <button
          onClick={() => { setCorrection(recordId, { [field]: '' }); setSaved(null); }}
          className="text-emerald-500 hover:text-emerald-700 ml-0.5"
          title="Clear this correction"
        >✕</button>
      </span>
    );
  }
  return (
    <div className="mt-1 flex items-center gap-1 min-w-0">
      <input
        value={val}
        onChange={(e) => setVal(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') submit(); }}
        placeholder={placeholder}
        className="text-[11px] px-1.5 py-0.5 border border-dashed border-slate-300 rounded text-slate-700 min-w-0 flex-1 focus:outline-none focus:border-blue-400"
      />
      <button
        onClick={submit}
        className="text-[10px] font-bold text-blue-700 hover:text-blue-900"
        title="Save this correction locally"
      >Save</button>
    </div>
  );
}

export default function InfoPanel() {
  const open = useApp((s) => s.infoSheetOpen);
  const setOpen = useApp((s) => s.setInfoSheetOpen);
  const activeSid = useApp((s) => s.activeSid);
  const clickedPt = useApp((s) => s.clickedPt);
  const selectedSurvey = useApp((s) => s.selectedSurvey);
  const bookmarks = useApp((s) => s.bookmarks);
  const addBookmark = useApp((s) => s.addBookmark);
  const updateBookmark = useApp((s) => s.updateBookmark);
  const removeBookmark = useApp((s) => s.removeBookmark);
  const issueFly = useApp((s) => s.issueFly);
  const editPin = useApp((s) => s.editPin);
  const setEditPin = useApp((s) => s.setEditPin);

  const [sheet, setSheet] = useState<PlanSheet | null>(null);
  const tab = useApp((s) => s.infoTab);
  const setTab = useApp((s) => s.setInfoTab);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Edit / Customization Form State (ALL OPTIONAL)
  const [customName, setCustomName] = useState('');
  const [price, setPrice] = useState('');
  const [pricePerSqYd, setPricePerSqYd] = useState('');
  const [reraId, setReraId] = useState('');
  const [highlights, setHighlights] = useState<string[]>([]);
  const [landmarks, setLandmarks] = useState<{ name: string; distance: string }[]>([]);
  const [facing, setFacing] = useState<Facing | string>('');
  const [intent, setIntent] = useState<DealIntent>('watching');
  const [outcome, setOutcome] = useState<DealOutcome>('available');
  const [description, setDescription] = useState('');

  const [savedQuery, setSavedQuery] = useState('');
  const [mobileMode, setMobileMode] = useState<'peek' | 'half' | 'full'>('peek');
  const [desktopCollapsed, setDesktopCollapsed] = useState(false);
  const touchStartY = useRef<number>(0);

  useEffect(() => {
    if (selectedSurvey) {
      setMobileMode('peek');
      setDesktopCollapsed(false);
    }
  }, [selectedSurvey]);

  useEffect(() => {
    if (tab === 'saved' || tab === 'edit') {
      setMobileMode('half');
    }
  }, [tab]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = e.changedTouches[0].clientY - touchStartY.current;
    if (diff > 45) {
      // Swiped down
      if (mobileMode === 'full') {
        setMobileMode('half');
      } else if (mobileMode === 'half') {
        if (selectedSurvey) setMobileMode('peek');
        else closePanel();
      } else {
        closePanel();
      }
    } else if (diff < -45) {
      // Swiped up
      if (mobileMode === 'peek') {
        setMobileMode('half');
      } else if (mobileMode === 'half') {
        setMobileMode('full');
      }
    }
  };

  useEffect(() => {
    if (!activeSid) return;
    loadManifest().then((m) => setSheet(m.sheets[activeSid] || null));
  }, [activeSid]);

  // Toast auto-clear
  useEffect(() => {
    if (!toastMsg) return;
    const t = setTimeout(() => setToastMsg(null), 3000);
    return () => clearTimeout(t);
  }, [toastMsg]);

  function closePanel() {
    setOpen(false);
  }

  // Active cadastral plot details
  const hasSelectedParcel = Boolean(selectedSurvey);
  const ent = useEntitlements();
  // Doc 18 legend model: a parcel carries three distinct numbers -- the OLD survey
  // number (black ink), the Original Plot number (green ink) and the Final Plot number
  // (red ink). Each link is only shown as fact when the generator marked it 'confirmed'
  // (mutual-nearest pair); 'unverified' candidates are displayed as such and a missing
  // partner is shown as not allotted rather than inheriting a neighbour.
  const rawConf = (selectedSurvey as any)?.assignmentConfidence as string | undefined;
  const rawFpCandidate = (selectedSurvey as any)?.finalPlotCandidate as string | undefined;
  const rawSurveyCandidate = (selectedSurvey as any)?.surveyCandidate as string | undefined;
  const rawOpCandidate = (selectedSurvey as any)?.originalPlotCandidate as string | undefined;
  const rawOp = (selectedSurvey as any)?.originalPlot as string | undefined;
  const opUnverified = (selectedSurvey as any)?.originalPlotConfidence === 'unverified' && !rawOp;
  const surveyNo = selectedSurvey?.surveyNo || (rawSurveyCandidate ? '' : '—');
  const finalPlot = selectedSurvey?.finalPlot || (rawFpCandidate ? '' : '—');
  const originalPlot = rawOp || (opUnverified ? '' : '—');
  const fpUnverified = rawConf === 'unverified' && !selectedSurvey?.finalPlot;
  const surveyUnverified = (selectedSurvey as any)?.surveyConfidence === 'unverified' && !selectedSurvey?.surveyNo;
  const village = selectedSurvey?.village || (sheet?.sector === 'TP 6' ? 'Bavaliyari' : sheet?.sector === 'TP 2' ? 'Hebatpur' : 'Ambli');
  const subSector = selectedSurvey?.subSector || sheet?.pocketId || sheet?.sector || 'Town Planning Scheme';
  const zone = selectedSurvey?.zone || (sheet?.sector === 'TP 6' ? 'Logistics CFS & Cargo Airport City' : sheet?.sector === 'TP 2' ? 'High-Tech Industrial & Knowledge Hub' : 'Residential Zone (R-1) & Commercial');
  const roadWidth = typeof selectedSurvey?.roadWidthM === 'number' || typeof selectedSurvey?.roadWidthM === 'string' ? selectedSurvey.roadWidthM : 30;
  // Area is never invented. The sheets carry no scale bar ("SCALE: Not to
  // scale") and no georeference, so plan area cannot be converted to m²; the
  // field stays empty unless a real source (e.g. a broker correction) sets it.
  const areaSqM = typeof selectedSurvey?.allottedAreaSqM === 'number' && selectedSurvey.allottedAreaSqM > 0
    ? selectedSurvey.allottedAreaSqM
    : (typeof selectedSurvey?.areaSqM === 'number' && selectedSurvey.areaSqM > 0 ? selectedSurvey.areaSqM : undefined);
  const areaSqYd = typeof selectedSurvey?.allottedAreaSqYd === 'number' && selectedSurvey.allottedAreaSqYd > 0
    ? selectedSurvey.allottedAreaSqYd
    : (areaSqM ? Math.round(areaSqM * 1.196) : undefined);
  const maxFAR = typeof selectedSurvey?.maxFAR === 'number' || typeof selectedSurvey?.maxFAR === 'string' ? selectedSurvey.maxFAR : (sheet?.sector === 'TP 6' ? 1.0 : sheet?.sector === 'TP 2' ? 2.5 : 1.8);
  const maxHeightM = typeof selectedSurvey?.maxHeightM === 'number' || typeof selectedSurvey?.maxHeightM === 'string' ? selectedSurvey.maxHeightM : (sheet?.sector === 'TP 6' ? 25 : sheet?.sector === 'TP 2' ? 45 : 15);
  const heightDesc = typeof (selectedSurvey as any)?.heightDesc === 'string' ? (selectedSurvey as any).heightDesc : `${maxHeightM} Meters`;

  // Safely parse and format setbacks
  const rawSetbacks = (selectedSurvey as any)?.setbacks;
  const setbacks = typeof rawSetbacks === 'string'
    ? rawSetbacks
    : rawSetbacks && typeof rawSetbacks === 'object'
    ? `${rawSetbacks.front ?? 3}m Front / ${rawSetbacks.rear ?? 3}m Rear / ${rawSetbacks.side ?? 3}m Sides`
    : '3m Front / 3m Rear / 3m Sides';

  const permittedUses = typeof (selectedSurvey as any)?.permittedUses === 'string' ? (selectedSurvey as any).permittedUses : (sheet?.sector === 'TP 6' ? 'Cargo Terminal Operations, Container Freight Station, Bonded Warehousing, Cold Chain, Air Cargo Logistics' : 'Multi-Storey Apartments, Row-Houses, Detached Villas');
  const statutoryTable = typeof (selectedSurvey as any)?.statutoryTable === 'string' ? (selectedSurvey as any).statutoryTable : (sheet?.sector === 'TP 6' ? 'DGDCR Table 10-9 (Logistics & Airport City)' : sheet?.sector === 'TP 2' ? 'DGDCR Table 10-4 (High-Tech Industrial)' : 'DGDCR Table 10-1 (Residential Zone)');
  const allottedFromSurvey = typeof (selectedSurvey as any)?.allottedFromSurvey === 'string' ? (selectedSurvey as any).allottedFromSurvey : '';
  const groundCoveragePct = typeof selectedSurvey?.groundCoveragePct === 'number' || typeof selectedSurvey?.groundCoveragePct === 'string' ? selectedSurvey.groundCoveragePct : (sheet?.sector === 'TP 6' ? 30 : sheet?.sector === 'TP 2' ? 40 : 45);
  const legalStatus = typeof selectedSurvey?.legalStatus === 'string' ? selectedSurvey.legalStatus : 'Sanctioned Preliminary Scheme (Sec 50 Act 1976)';

  // Property Classification
  const isLogistics = sheet?.sector === 'TP 6' || zone.toLowerCase().includes('cargo') || zone.toLowerCase().includes('logistics') || zone.toLowerCase().includes('airport');
  const isIndustrial = sheet?.sector === 'TP 2' || sheet?.sector === 'TP 3' || sheet?.sector === 'TP 5' || zone.toLowerCase().includes('ind');
  const isResidential = sheet?.sector === 'TP 1' || zone.toLowerCase().includes('res');
  const isSolar = sheet?.sector === 'TP 4' && (subSector.includes('4B') || subSector.includes('Solar'));
  const isKnowledge = (sheet?.sector === 'TP 4' && !isSolar) || zone.toLowerCase().includes('knowledge') || /\b(it|it hub|information technology)\b/i.test(zone);

  const propertyCategory = isLogistics
    ? 'Logistics, CFS & Cargo Airport City'
    : isIndustrial
    ? 'High-Tech Industrial & Manufacturing'
    : isResidential
    ? 'Residential & Urban Living (R-1)'
    : isSolar
    ? 'Solar & Renewable Energy Park'
    : isKnowledge
    ? 'Knowledge Corridor & IT Hub'
    : 'Commercial & Mixed-Use Corridor';

  const renderPropertyIcon = (className = 'w-3 h-3') => {
    if (isLogistics) return <Plane className={className} />;
    if (isIndustrial) return <Factory className={className} />;
    if (isResidential) return <Home className={className} />;
    if (isSolar) return <Sun className={className} />;
    if (isKnowledge) return <GraduationCap className={className} />;
    return <Building2 className={className} />;
  };

  const propertyBadgeClass = isIndustrial
    ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
    : isResidential
    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
    : isSolar
    ? 'bg-amber-50 text-amber-800 border-amber-200'
    : isKnowledge
    ? 'bg-cyan-50 text-cyan-700 border-cyan-200'
    : isLogistics
    ? 'bg-blue-50 text-blue-700 border-blue-200'
    : 'bg-purple-50 text-purple-700 border-purple-200';

  // Road Frontage & Hierarchy
  const roadWidthNum = Number(roadWidth) || 30;
  // Honest provenance (docs/04 §A.3): the record's own flag wins; fall back to
  // the documented TP6 30 m fallthrough cohort (2,766/3,294 records).
  const isEstimated =
    Boolean((selectedSurvey as any)?.isEstimated) ||
    (selectedSurvey?.dataSource === 'estimated') ||
    (sheet?.sector === 'TP 6' && roadWidthNum === 30);
  const estimatedBadge = isEstimated ? (
    <span
      className="text-[9px] font-bold text-amber-800 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200 align-middle"
      title="This value is estimated, not measured: the road width came from a fallback or an unverified per-scheme envelope, and the DGDCR source (DP_Report_2.pdf) is a scan that has not been machine-verified."
    >
      estimated
    </span>
  ) : null;
  const roadWidthFt = (roadWidthNum * 3.28084).toFixed(1);
  const roadClassification = roadWidthNum >= 200
    ? '250.00 MT National Expressway & Central Spine Corridor'
    : roadWidthNum >= 70
    ? 'Primary Arterial Expressway Spine'
    : roadWidthNum >= 55
    ? 'Sub-Arterial Sector Highway Corridor'
    : roadWidthNum >= 45
    ? 'Inter-Sector Connecting Arterial Road'
    : roadWidthNum >= 30
    ? 'Primary Sector Collector Road'
    : roadWidthNum >= 25
    ? 'Secondary Sector Collector Road'
    : roadWidthNum >= 18
    ? 'Internal TP Sub-Sector Access Road'
    : 'Local Service Access Lane';

  const accessNodeStatus = roadWidthNum >= 200
    ? 'Direct Access via Sanctioned 250m Central Spine Expressway Corridor'
    : `Direct Cut-Upon Proposed ${roadWidthNum}m TP Road Grid`;

  const maxBuildingLengthDesc = isIndustrial
    ? '60.00 Meters (Max continuous building facade without fire separation / expansion joint)'
    : isResidential
    ? '35.00 Meters (Max continuous building depth without light well / courtyard)'
    : '50.00 Meters (Max continuous facade frontage)';

  // Check if active parcel is bookmarked
  const existingBookmark = useMemo(() => {
    return bookmarks.find(
      (b) =>
        (b.surveyNo === surveyNo && b.finalPlot === finalPlot && b.sid === activeSid) ||
        (finalPlot !== '—' && b.finalPlot === finalPlot) ||
        (surveyNo !== '—' && b.surveyNo === surveyNo && b.village === village)
    );
  }, [bookmarks, surveyNo, finalPlot, activeSid, village]);

  const isBookmarked = Boolean(existingBookmark);

  // Sync form when editPin or active parcel changes
  const activePinForEdit = editPin || existingBookmark;
  const lastLoadedPinIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (activePinForEdit && activePinForEdit.id !== lastLoadedPinIdRef.current) {
      lastLoadedPinIdRef.current = activePinForEdit.id;
      setCustomName(activePinForEdit.customName || '');
      setPrice(activePinForEdit.price || '');
      setPricePerSqYd(activePinForEdit.pricePerSqYd ? String(activePinForEdit.pricePerSqYd) : '');
      setReraId(activePinForEdit.reraId || '');
      setHighlights(Array.isArray(activePinForEdit.highlights) ? activePinForEdit.highlights.slice(0, 6) : []);
      setLandmarks(Array.isArray(activePinForEdit.landmarks) ? activePinForEdit.landmarks.filter((l) => l && l.name).slice(0, 6) : []);
      setFacing(activePinForEdit.facing || '');
      setIntent(activePinForEdit.intent || 'watching');
      setOutcome(activePinForEdit.outcome || 'available');
      setDescription(activePinForEdit.description || activePinForEdit.note || '');
    } else if (!activePinForEdit) {
      lastLoadedPinIdRef.current = null;
      setCustomName('');
      setPrice('');
      setPricePerSqYd('');
      setReraId('');
      setHighlights([]);
      setLandmarks([]);
      setFacing('');
      setIntent('watching');
      setOutcome('available');
      setDescription('');
    }
  }, [activePinForEdit]);

  /** Cleaned dealer inputs for the dossier (empty entries dropped). */
  function cleanDossierFields() {
    const rate = Number(pricePerSqYd.replace(/[^0-9.]/g, ''));
    return {
      pricePerSqYd: rate > 0 ? rate : undefined,
      reraId: reraId.trim() || undefined,
      highlights: highlights.map((h) => h.trim()).filter(Boolean).slice(0, 6),
      landmarks: landmarks
        .map((l) => ({ name: l.name.trim(), distance: l.distance.trim() }))
        .filter((l) => l.name)
        .slice(0, 6),
    };
  }

  // Parse numeric lakh from price text if possible
  function parsePriceLakh(val: string): number | undefined {
    if (!val) return undefined;
    const clean = val.toLowerCase().replace(/,/g, '').trim();
    const crMatch = clean.match(/([\d.]+)\s*(?:cr|crore)/);
    if (crMatch) return Math.round(parseFloat(crMatch[1]) * 100);
    const lakhMatch = clean.match(/([\d.]+)\s*(?:lakh|lac|l)/);
    if (lakhMatch) return parseFloat(lakhMatch[1]);
    const numMatch = clean.match(/[\d.]+/);
    if (numMatch) {
      const num = parseFloat(numMatch[0]);
      if (num >= 100000) return Math.round(num / 100000);
      return num;
    }
    return undefined;
  }

  // Handle Quick Save / Toggle
  function handleToggleBookmark() {
    if (isBookmarked && existingBookmark) {
      removeBookmark(existingBookmark.id);
      setToastMsg(`${finalPlot !== '—' ? finalPlot : `Survey ${surveyNo}`} removed from bookmarks`);
    } else {
      const defaultTitle = `${sheet?.sector || 'TP Scheme'} · ${finalPlot !== '—' ? (finalPlot.startsWith('FP-') || finalPlot.startsWith('D-') ? finalPlot : `FP-${finalPlot}`) : `Survey ${surveyNo}`}`;
      const newBookmark: Bookmark = {
        id: `plot-${surveyNo}-${Date.now()}`,
        sid: activeSid,
        label: defaultTitle,
        customName: customName.trim() || undefined,
        x: clickedPt?.x || 1500,
        y: clickedPt?.y || 1200,
        surveyNo,
        finalPlot,
        village,
        zone,
        areaSqM,
        roadWidthM: roadWidth,
        price: price.trim() || undefined,
        priceLakh: parsePriceLakh(price),
        ...cleanDossierFields(),
        facing: facing || undefined,
        intent: intent || undefined,
        outcome: outcome || undefined,
        description: description.trim() || undefined,
        createdAt: Date.now(),
      };
      addBookmark(newBookmark);
      setToastMsg(`Saved ${newBookmark.customName || defaultTitle} to bookmarks!`);
    }
  }

  // Attached documents state
  const [attachedDocs, setAttachedDocs] = useState<AttachedDoc[]>([]);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [docType, setDocType] = useState<AttachedDocType>('registry');
  const [docTitle, setDocTitle] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync documents when activePinForEdit changes
  useEffect(() => {
    if (activePinForEdit?.id) {
      getDocsByPin(activePinForEdit.id)
        .then(setAttachedDocs)
        .catch(() => setAttachedDocs([]));
    } else {
      setAttachedDocs([]);
    }
  }, [activePinForEdit?.id]);

  // Handle Document Upload into IndexedDB
  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!activePinForEdit?.id) {
      setToastMsg('Please save the plot first before attaching documents');
      return;
    }
    setUploadingDoc(true);
    try {
      const dataUrl = await fileToDataUrl(file);
      const newDoc: AttachedDoc = {
        id: `doc_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        pinId: activePinForEdit.id,
        name: docTitle.trim() || file.name.replace(/\.[^/.]+$/, ''),
        type: docType,
        fileType: file.type || 'application/octet-stream',
        size: file.size,
        dataUrl,
        uploadedAt: Date.now(),
      };
      await saveDoc(newDoc);
      const updated = await getDocsByPin(activePinForEdit.id);
      setAttachedDocs(updated);
      setDocTitle('');
      if (fileInputRef.current) fileInputRef.current.value = '';

      const docTypes = Array.from(new Set(updated.map((d) => d.type)));
      updateBookmark(activePinForEdit.id, {
        documentCount: updated.length,
        documentTypes: docTypes,
      });
      setToastMsg(`Attached ${DOC_TYPE_INFO[docType]?.short || 'document'} to plot!`);
    } catch (err) {
      console.error('Failed to attach document:', err);
      setToastMsg('Error attaching document to local vault');
    } finally {
      setUploadingDoc(false);
    }
  }

  // Delete Document
  async function handleDeleteDoc(docId: string) {
    if (!activePinForEdit?.id) return;
    try {
      await deleteDoc(docId);
      const updated = await getDocsByPin(activePinForEdit.id);
      setAttachedDocs(updated);
      const docTypes = Array.from(new Set(updated.map((d) => d.type)));
      updateBookmark(activePinForEdit.id, {
        documentCount: updated.length,
        documentTypes: docTypes,
      });
      setToastMsg('Document removed from local vault');
    } catch (err) {
      console.error('Failed to delete doc:', err);
    }
  }

  // 1-Tap WhatsApp Cadastral Dossier Share
  function handleShareWhatsApp(targetPin: Bookmark, docsList?: AttachedDoc[]) {
    const pinLabel = targetPin.customName || targetPin.label || `Survey ${targetPin.surveyNo}`;
    const fpText = targetPin.finalPlot && targetPin.finalPlot !== '—'
      ? (targetPin.finalPlot.startsWith('FP-') || targetPin.finalPlot.startsWith('D-') ? targetPin.finalPlot : `FP-${targetPin.finalPlot}`)
      : `Survey ${targetPin.surveyNo}`;

    const docsToInclude = docsList && docsList.length > 0 ? docsList : [];

    let text = `*DHOLERA SIR PROPERTY DOSSIER*\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `• *Plot:* ${pinLabel}\n` +
      `• *Final Plot / Survey:* ${fpText} (Survey ${targetPin.surveyNo || '—'})\n` +
      `• *TP Scheme:* ${targetPin.sector || sheet?.sector || 'TP Scheme'}\n` +
      `• *Village:* ${targetPin.village || village || 'Dholera'}\n` +
      `• *Road Frontage:* ${targetPin.roadWidthM || roadWidth || 30}m TP Road Corridor\n`;

    if (targetPin.price) {
      text += `• *Demand / Price:* ${targetPin.price}\n`;
    }
    if (targetPin.facing) {
      text += `• *Facing:* ${targetPin.facing.toUpperCase()}\n`;
    }
    if (targetPin.intent) {
      text += `• *Intent:* ${targetPin.intent.toUpperCase()} (${targetPin.outcome || 'Available'})\n`;
    }
    if (targetPin.description) {
      text += `• *Notes:* ${targetPin.description}\n`;
    }

    if (docsToInclude.length > 0) {
      text += `\n[STATUTORY DOCUMENTS HELD (${docsToInclude.length})]:\n`;
      docsToInclude.forEach((d, idx) => {
        const typeInfo = DOC_TYPE_INFO[d.type];
        text += `  ${idx + 1}. ${d.name} (${typeInfo?.short || d.type})\n`;
      });
    }

    text += `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `*Verify Property Boundary on GIS Atlas:*\n` +
      `https://dholeramap.com/map?sheet=${targetPin.sid || activeSid}&x=${targetPin.x}&y=${targetPin.y}&zoom=2.5\n\n` +
      `_Generated via DholeraMap · Official Land Intelligence_`;

    const waUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(waUrl, '_blank');
  }

  // Handle Detailed Save from Edit Details Tab
  function handleSaveDetails(e?: React.FormEvent) {
    if (e) e.preventDefault();
    const defaultTitle = `${sheet?.sector || 'TP Scheme'} · ${finalPlot !== '—' ? (finalPlot.startsWith('FP-') || finalPlot.startsWith('D-') ? finalPlot : `FP-${finalPlot}`) : `Survey ${surveyNo}`}`;
    const targetId = activePinForEdit?.id;

    if (targetId) {
      updateBookmark(targetId, {
        customName: customName.trim() || undefined,
        price: price.trim() || undefined,
        priceLakh: parsePriceLakh(price),
        ...cleanDossierFields(),
        facing: facing || undefined,
        intent: intent || undefined,
        outcome: outcome || undefined,
        description: description.trim() || undefined,
        note: description.trim() || undefined,
      });
      setToastMsg(`Updated details for ${customName.trim() || defaultTitle}`);
    } else {
      const newBookmark: Bookmark = {
        id: `plot-${surveyNo}-${Date.now()}`,
        sid: activeSid,
        label: defaultTitle,
        customName: customName.trim() || undefined,
        x: clickedPt?.x || 1500,
        y: clickedPt?.y || 1200,
        surveyNo,
        finalPlot,
        village,
        zone,
        areaSqM,
        roadWidthM: roadWidth,
        price: price.trim() || undefined,
        priceLakh: parsePriceLakh(price),
        ...cleanDossierFields(),
        facing: facing || undefined,
        intent: intent || undefined,
        outcome: outcome || undefined,
        description: description.trim() || undefined,
        createdAt: Date.now(),
        documentCount: 0,
        documentTypes: [],
      };
      addBookmark(newBookmark);
      setEditPin(newBookmark);
      setToastMsg(`Saved ${newBookmark.customName || defaultTitle}! You can now attach documents.`);
    }
  }

  // Filter bookmarks in saved tab
  const filteredBookmarks = useMemo(() => {
    if (!savedQuery.trim()) return bookmarks;
    const q = savedQuery.toLowerCase().trim();
    return bookmarks.filter((b) => {
      const name = (b.customName || '').toLowerCase();
      const lbl = (b.label || '').toLowerCase();
      const fp = (b.finalPlot || '').toLowerCase();
      const surv = (b.surveyNo || '').toLowerCase();
      const vil = (b.village || '').toLowerCase();
      const desc = (b.description || b.note || '').toLowerCase();
      const pr = (b.price || '').toLowerCase();
      return name.includes(q) || lbl.includes(q) || fp.includes(q) || surv.includes(q) || vil.includes(q) || desc.includes(q) || pr.includes(q);
    });
  }, [bookmarks, savedQuery]);

  const currentPlotAsBookmark: Bookmark = useMemo(() => {
    if (existingBookmark) return existingBookmark;
    return {
      id: `plot-${surveyNo}-${Date.now()}`,
      sid: activeSid || '',
      label: `${sheet?.sector || 'TP Scheme'} · ${finalPlot !== '—' ? (finalPlot.startsWith('FP-') || finalPlot.startsWith('D-') ? finalPlot : `FP-${finalPlot}`) : `Survey ${surveyNo}`}`,
      customName: customName.trim() || undefined,
      x: clickedPt?.x || 1500,
      y: clickedPt?.y || 1200,
      surveyNo,
      finalPlot,
      village,
      zone,
      areaSqM,
      roadWidthM: typeof roadWidth === 'number' ? roadWidth : undefined,
      price: price.trim() || undefined,
      priceLakh: parsePriceLakh(price),
      ...cleanDossierFields(),
      facing: facing || undefined,
      intent: intent || undefined,
      outcome: outcome || undefined,
      description: description.trim() || undefined,
      createdAt: Date.now(),
      documentCount: attachedDocs.length,
      documentTypes: attachedDocs.map((d) => d.type),
    };
    // cleanDossierFields reads only the state listed below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existingBookmark, surveyNo, finalPlot, activeSid, sheet?.sector, customName, clickedPt, village, zone, areaSqM, roadWidth, price, pricePerSqYd, reraId, highlights, landmarks, facing, intent, outcome, description, attachedDocs]);

  function renderPanelBody() {
    return (
      <>

        {/* Scheme Banner (Desktop Only to maximize mobile viewport) */}
        {sheet && (
          <div className="hidden md:block px-4 py-2.5 bg-slate-50 border-b border-slate-100 shrink-0">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 truncate">{sheet.label}</span>
              <span className="text-[10px] font-mono font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded">
                {sheet.sector}
              </span>
            </div>
            <p className="text-[10px] text-slate-500 truncate mt-0.5">{sheet.description}</p>
          </div>
        )}

        {/* Toast Notification */}
        {toastMsg && (
          <div className="mx-3 mt-2 p-2.5 bg-slate-800 text-white text-xs font-semibold rounded-xl shadow-md flex items-center justify-between animate-in fade-in slide-in-from-top-2 duration-150">
            <span>{toastMsg}</span>
            <button onClick={() => setToastMsg(null)} className="ml-2 text-slate-400 hover:text-white">✕</button>
          </div>
        )}

        {/* 3 Tabs: Plot Specs, Edit Details, Saved Bookmarks */}
        <div className="flex border-b border-slate-100 shrink-0 bg-white">
          {(
            [
              ['plot', 'Plot Specs'],
              ['edit', 'Edit Details'],
              ['saved', `Saved (${bookmarks.length})`],
            ] as const
          ).map(([k, label]) => (
            <button
              key={k}
              onClick={() => {
                setTab(k);
              }}
              className={`flex-1 py-2.5 text-xs font-bold transition border-b-2 cursor-pointer ${
                tab === k
                  ? 'text-blue-600 border-blue-600 bg-blue-50/20'
                  : 'text-slate-400 hover:text-slate-600 border-transparent'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* TAB 1: PLOT SPECS */}
          {tab === 'plot' && (
            <>
              {hasSelectedParcel ? (
                <div className="space-y-3">
                  {/* Compact Quick Action Toolbar */}
                  <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200 shadow-2xs">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border flex items-center gap-1 min-w-0 ${propertyBadgeClass}`}>
                        {renderPropertyIcon('w-3 h-3 shrink-0')}
                        <span className="truncate">{propertyCategory}</span>
                      </span>
                      {existingBookmark?.price && (
                        <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded truncate">
                          {existingBookmark.price}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => {
                          if (activeSid && clickedPt) {
                            issueFly(activeSid, clickedPt.x, clickedPt.y, 3);
                          }
                        }}
                        className="h-7 px-2.5 rounded-lg bg-white border border-slate-200 text-blue-700 font-bold text-[10px] flex items-center gap-1 hover:bg-blue-50 transition cursor-pointer shadow-2xs"
                        title="Zoom & Focus on CAD blueprint"
                      >
                        <Crosshair className="w-3 h-3 shrink-0" />
                        <span>Focus</span>
                      </button>

                      <button
                        onClick={() => handleShareWhatsApp(currentPlotAsBookmark)}
                        className="h-7 px-2.5 rounded-lg bg-emerald-600 text-white font-bold text-[10px] flex items-center gap-1 hover:bg-emerald-700 transition cursor-pointer shadow-2xs"
                        title="Share Plot Dossier on WhatsApp"
                      >
                        <Share2 className="w-3 h-3 shrink-0" />
                        <span>Share</span>
                      </button>

                      <button
                        onClick={() => setTab('edit')}
                        className="h-7 px-2.5 rounded-lg bg-white hover:bg-amber-50 border border-slate-200 text-amber-800 font-bold text-[10px] flex items-center gap-1 transition cursor-pointer shadow-2xs"
                        title="Add price, remarks or documents"
                      >
                        <Tag className="w-3 h-3 shrink-0" />
                        <span>Price</span>
                      </button>
                    </div>
                  </div>

                  {/* Statutory Cadastral Specification Table (Pure Tabular Architecture) */}
                  <div className="rounded-2xl border border-slate-200 overflow-hidden bg-white shadow-xs">
                    <div className="bg-slate-50/80 px-3.5 py-2.5 border-b border-slate-200 flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span>Statutory Specifications</span>
                      </span>
                      <span className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
                        {sheet?.sector || 'TP Scheme'}
                      </span>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-left border-collapse">
                        <tbody className="divide-y divide-slate-100 text-[11px]">
                          <tr className="hover:bg-slate-50/60 transition-colors">
                            <td className="py-2.5 px-3 text-slate-500 font-semibold w-2/5 align-top">Final Plot (FP)</td>
                            <td className="py-2.5 px-3 text-slate-900 font-black">
                              <div className="flex flex-col gap-1">
                                <span className="text-sm font-black text-slate-900">
                                  {finalPlot !== '—' ? (finalPlot.startsWith('FP-') || finalPlot.startsWith('D-') ? finalPlot : `FP-${finalPlot}`) : 'Not Allotted'}
                                </span>
                                {allottedFromSurvey && (
                                  <span className="text-[10px] font-medium text-blue-700 bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded inline-block w-fit">
                                    {allottedFromSurvey}
                                  </span>
                                )}
                                {(fpUnverified || finalPlot === '—') && selectedSurvey?.id && (
                                  <CorrectionField
                                    recordId={selectedSurvey.id}
                                    field="finalPlot"
                                    placeholder={rawFpCandidate ? `confirm FP (candidate ${rawFpCandidate})` : 'enter real FP no.'}
                                  />
                                )}
                              </div>
                            </td>
                          </tr>
                          <tr className="hover:bg-slate-50/60 transition-colors bg-slate-50/40">
                            <td className="py-2.5 px-3 text-slate-500 font-semibold align-top">Revenue Survey</td>
                            <td className="py-2.5 px-3 text-slate-900 font-bold">
                              <div className="flex flex-col gap-1">
                                <span className="text-sm font-bold text-slate-900">
                                  {surveyNo !== '—' ? (surveyNo.startsWith('Survey') ? surveyNo : `Survey ${surveyNo}`) : 'Not Identified'}
                                </span>
                                {surveyNo === '—' && selectedSurvey?.id && (
                                  <CorrectionField
                                    recordId={selectedSurvey.id}
                                    field="surveyNo"
                                    placeholder={rawSurveyCandidate ? `confirm Survey (candidate ${rawSurveyCandidate})` : 'enter real survey no.'}
                                  />
                                )}
                              </div>
                            </td>
                          </tr>
                          <tr className="hover:bg-slate-50/60 transition-colors">
                            <td className="py-2 px-3 text-slate-500 font-medium">Original Plot (OP)</td>
                            <td className="py-2 px-3 text-slate-800 font-semibold">{originalPlot !== '—' ? `OP ${originalPlot}` : '—'}</td>
                          </tr>
                          <tr className="hover:bg-slate-50/60 transition-colors bg-slate-50/40">
                            <td className="py-2 px-3 text-slate-500 font-medium">Village / Moje</td>
                            <td className="py-2 px-3 text-slate-900 font-bold">{village}</td>
                          </tr>
                          <tr className="hover:bg-slate-50/60 transition-colors">
                            <td className="py-2 px-3 text-slate-500 font-medium">TP Scheme / Sector</td>
                            <td className="py-2 px-3 text-slate-900 font-semibold">{subSector}</td>
                          </tr>
                          <tr className="hover:bg-slate-50/60 transition-colors bg-slate-50/40">
                            <td className="py-2 px-3 text-slate-500 font-medium">Statutory Land Use</td>
                            <td className="py-2 px-3 text-blue-900 font-bold leading-tight">{zone}</td>
                          </tr>
                          <tr className="hover:bg-slate-50/60 transition-colors">
                            <td className="py-2 px-3 text-slate-500 font-medium">Road Frontage</td>
                            <td className="py-2 px-3 text-slate-900 font-bold">
                              {roadWidthNum}.00 MT ({roadWidthFt} Feet) Corridor
                            </td>
                          </tr>
                          <tr className="hover:bg-slate-50/60 transition-colors bg-slate-50/40">
                            <td className="py-2 px-3 text-slate-500 font-medium">Road Hierarchy</td>
                            <td className="py-2 px-3 text-slate-800 font-medium">{roadClassification}</td>
                          </tr>
                          <tr className="hover:bg-slate-50/60 transition-colors">
                            <td className="py-2 px-3 text-slate-500 font-medium">Boundary Linework</td>
                            <td className="py-2 px-3">
                              {selectedSurvey && (selectedSurvey as any).ringEstimated ? (
                                <span className="text-[10px] font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                                  <span>⬠</span>
                                  <span>Estimated (Free Space)</span>
                                </span>
                              ) : (
                                <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                                  <span>⬠</span>
                                  <span>Verified from CAD Linework</span>
                                </span>
                              )}
                            </td>
                          </tr>
                          {ent.isFree ? (
                            <tr>
                              <td colSpan={2} className="p-3 bg-slate-50/80">
                                <Paywall feature="details" inline />
                              </td>
                            </tr>
                          ) : (
                            <>
                              <tr className="hover:bg-slate-50/60 transition-colors">
                                <td className="py-2 px-3 text-slate-500 font-medium">Permissible FAR / FSI</td>
                                <td className="py-2 px-3 text-slate-900 font-bold">
                                  {maxFAR} (Base) · Up to {(Number(maxFAR) + 0.6).toFixed(1)} Chargeable
                                </td>
                              </tr>
                              <tr className="hover:bg-slate-50/60 transition-colors bg-slate-50/40">
                                <td className="py-2 px-3 text-slate-500 font-medium">Max Permitted Height</td>
                                <td className="py-2 px-3 text-slate-900 font-semibold">{heightDesc}</td>
                              </tr>
                              <tr className="hover:bg-slate-50/60 transition-colors">
                                <td className="py-2 px-3 text-slate-500 font-medium">Ground Coverage</td>
                                <td className="py-2 px-3 text-slate-900 font-semibold">{groundCoveragePct}% Max Permissible</td>
                              </tr>
                              <tr className="hover:bg-slate-50/60 transition-colors bg-slate-50/40">
                                <td className="py-2 px-3 text-slate-500 font-medium">Statutory Setbacks</td>
                                <td className="py-2 px-3 text-slate-800 font-medium">{setbacks}</td>
                              </tr>
                              <tr className="hover:bg-slate-50/60 transition-colors">
                                <td className="py-2 px-3 text-slate-500 font-medium">Permitted Uses</td>
                                <td className="py-2 px-3 text-slate-700 font-medium leading-tight">{permittedUses}</td>
                              </tr>
                              <tr className="hover:bg-slate-50/60 transition-colors bg-slate-50/40">
                                <td className="py-2 px-3 text-slate-500 font-medium">Sanctioned Stage</td>
                                <td className="py-2 px-3 text-emerald-800 font-bold leading-tight">{legalStatus}</td>
                              </tr>
                              <tr className="hover:bg-slate-50/60 transition-colors">
                                <td className="py-2 px-3 text-slate-500 font-medium">DGDCR Schedule</td>
                                <td className="py-2 px-3 text-slate-700 font-mono text-[10px]">{statutoryTable}</td>
                              </tr>
                            </>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-6 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/70 text-center space-y-2">
                  <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center mx-auto shadow-2xs">
                    <Map className="w-5 h-5 stroke-[1.75]" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-800">Select Any Plot on Map</h4>
                  <p className="text-xs text-slate-500 max-w-[240px] mx-auto">
                    Click any plot or survey number on the CAD blueprint to inspect its statutory final plot number, revenue survey, zoning, and TP road frontage.
                  </p>
                </div>
              )}
            </>
          )}

          {/* TAB 2: EDIT DETAILS (ALL OPTIONAL FIELDS) */}
          {tab === 'edit' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
                      {activePinForEdit ? 'Customize Saved Plot' : 'Customize Plot Details'}
                    </h3>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                    All Fields Optional
                  </span>
                </div>

                {hasSelectedParcel && (
                  <div className="p-2.5 bg-blue-50/60 rounded-xl border border-blue-100 text-xs text-slate-700">
                    <span className="font-bold text-blue-900 block">
                      Target: {finalPlot !== '—' ? (finalPlot.startsWith('FP-') || finalPlot.startsWith('D-') ? finalPlot : `FP-${finalPlot}`) : `Survey ${surveyNo}`}
                    </span>
                    <span className="text-[11px] text-slate-500 block mt-0.5">
                      {sheet?.sector} · {village} · {roadWidth}m TP Road
                    </span>
                  </div>
                )}

                <form onSubmit={handleSaveDetails} className="space-y-3 pt-1">
                  {/* 1. Custom Name / Title */}
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      Custom Plot Name / Label <span className="text-slate-400 font-normal">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                      placeholder={hasSelectedParcel ? `${sheet?.sector} · FP-${finalPlot} (Survey ${surveyNo})` : 'e.g. Prime Corner Plot near 250m Spine'}
                      className="w-full h-9 rounded-xl border border-slate-200 px-3 text-xs outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">Leave empty to use official statutory plot label.</p>
                  </div>

                  {/* 2. Price in ₹ / Lakhs */}
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      Price / Demand <span className="text-slate-400 font-normal">(Optional)</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        placeholder="e.g. ₹45 Lakh or ₹1.2 Cr"
                        className="w-full h-9 rounded-xl border border-slate-200 px-3 text-xs outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <div>
                        <label className="text-[10px] font-bold text-slate-600 block mb-1">Rate / sq. yd</label>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={pricePerSqYd}
                          onChange={(e) => setPricePerSqYd(e.target.value)}
                          placeholder="e.g. 4500"
                          className="w-full h-9 rounded-xl border border-slate-200 px-3 text-xs outline-none focus:border-blue-500 transition"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-600 block mb-1">RERA / agent id</label>
                        <input
                          type="text"
                          value={reraId}
                          onChange={(e) => setReraId(e.target.value)}
                          placeholder="e.g. GUJ/RERA/…"
                          className="w-full h-9 rounded-xl border border-slate-200 px-3 text-xs outline-none focus:border-blue-500 transition"
                        />
                      </div>
                    </div>
                  </div>

                  {/* 2b. Selling-point highlights for the dossier */}
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      Dossier Highlights <span className="text-slate-400 font-normal">(up to 6)</span>
                    </label>
                    <div className="space-y-1.5">
                      {highlights.map((h, i) => (
                        <div key={i} className="flex items-center gap-1.5">
                          <span className="w-5 h-5 rounded-md bg-amber-100 text-amber-700 text-[10px] font-black flex items-center justify-center shrink-0">
                            {i + 1}
                          </span>
                          <input
                            type="text"
                            value={h}
                            onChange={(e) => setHighlights((prev) => prev.map((x, j) => (j === i ? e.target.value : x)))}
                            placeholder="e.g. Corner plot on 55m TP road"
                            className="flex-1 h-9 rounded-xl border border-slate-200 px-3 text-xs outline-none focus:border-blue-500 transition"
                          />
                          <button
                            type="button"
                            onClick={() => setHighlights((prev) => prev.filter((_, j) => j !== i))}
                            className="w-7 h-7 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 cursor-pointer shrink-0"
                            title="Remove highlight"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                    {highlights.length < 6 && (
                      <button
                        type="button"
                        onClick={() => setHighlights((prev) => [...prev, ''])}
                        className="mt-1.5 text-[11px] font-bold text-blue-700 hover:underline cursor-pointer"
                      >
                        ＋ Add highlight
                      </button>
                    )}
                  </div>

                  {/* 2c. Nearby landmarks with distance, for the connectivity table */}
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      Nearby Landmarks <span className="text-slate-400 font-normal">(up to 6)</span>
                    </label>
                    <div className="space-y-1.5">
                      {landmarks.map((l, i) => (
                        <div key={i} className="flex items-center gap-1.5">
                          <input
                            type="text"
                            value={l.name}
                            onChange={(e) => setLandmarks((prev) => prev.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))}
                            placeholder="Landmark (e.g. ABCD Building)"
                            className="flex-1 h-9 rounded-xl border border-slate-200 px-3 text-xs outline-none focus:border-blue-500 transition"
                          />
                          <input
                            type="text"
                            value={l.distance}
                            onChange={(e) => setLandmarks((prev) => prev.map((x, j) => (j === i ? { ...x, distance: e.target.value } : x)))}
                            placeholder="Distance (e.g. 4 km)"
                            className="w-24 h-9 rounded-xl border border-slate-200 px-3 text-xs outline-none focus:border-blue-500 transition"
                          />
                          <button
                            type="button"
                            onClick={() => setLandmarks((prev) => prev.filter((_, j) => j !== i))}
                            className="w-7 h-7 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 cursor-pointer shrink-0"
                            title="Remove landmark"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                    {landmarks.length < 6 && (
                      <button
                        type="button"
                        onClick={() => setLandmarks((prev) => [...prev, { name: '', distance: '' }])}
                        className="mt-1.5 text-[11px] font-bold text-blue-700 hover:underline cursor-pointer"
                      >
                        ＋ Add landmark
                      </button>
                    )}
                  </div>

                  {/* 3. Facing Direction */}
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      Plot Facing <span className="text-slate-400 font-normal">(Optional)</span>
                    </label>
                    <select
                      value={facing}
                      onChange={(e) => setFacing(e.target.value)}
                      className="w-full h-9 rounded-xl border border-slate-200 px-3 text-xs outline-none bg-white focus:border-blue-500 transition"
                    >
                      <option value="">Select Facing Direction (Optional)</option>
                      <option value="north">North Facing (Direct Frontage)</option>
                      <option value="northeast">North-East (Ishan Corner)</option>
                      <option value="east">East Facing</option>
                      <option value="southeast">South-East Facing</option>
                      <option value="south">South Facing</option>
                      <option value="southwest">South-West Facing</option>
                      <option value="west">West Facing</option>
                      <option value="northwest">North-West Facing</option>
                      <option value="corner">Corner Plot (Two-Side Open)</option>
                      <option value="park">Park Facing / Green Belt</option>
                    </select>
                  </div>

                  {/* 4. Deal Intent & Status */}
                  <div className="space-y-2 pt-1">
                    <label className="text-[11px] font-bold text-slate-700 block">
                      Deal Intent &amp; Status <span className="text-slate-400 font-normal">(Optional)</span>
                    </label>
                    <div className="flex gap-1.5">
                      {(
                        [
                          ['watching', 'Watching'],
                          ['selling', 'Selling'],
                          ['buying', 'Buying'],
                        ] as const
                      ).map(([val, lbl]) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => setIntent(val)}
                          className={`flex-1 py-1.5 rounded-lg text-xs font-bold border transition cursor-pointer ${
                            intent === val
                              ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          {lbl}
                        </button>
                      ))}
                    </div>

                    <div className="flex gap-1.5 pt-1">
                      {(
                        [
                          ['available', 'Available'],
                          ['sold', 'Sold'],
                          ['looking', 'Looking'],
                          ['bought', 'Bought'],
                        ] as const
                      ).map(([val, lbl]) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => setOutcome(val)}
                          className={`flex-1 py-1 text-[11px] font-bold rounded-lg border transition cursor-pointer ${
                            outcome === val
                              ? 'bg-slate-800 text-white border-slate-800'
                              : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {lbl}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 5. Description & Remarks */}
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      Description &amp; Private Remarks <span className="text-slate-400 font-normal">(Optional)</span>
                    </label>
                    <textarea
                      rows={3}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Add buyer inquiries, title scrutiny notes, seller expectations, or property remarks..."
                      className="w-full p-2.5 text-xs rounded-xl border border-slate-200 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 resize-none transition"
                    />
                  </div>

                  {/* 6. Local Land Registry Vault & Document Attachments */}
                  <div className="pt-2 border-t border-slate-200/80 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <FolderCheck className="w-4 h-4 text-blue-600 shrink-0" />
                        <h4 className="text-xs font-black uppercase tracking-wider text-slate-800">
                          Land Registry &amp; Documents Vault
                        </h4>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                        <Lock className="w-3 h-3 text-emerald-600 shrink-0" />
                        <span>100% Local Device Storage</span>
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      Store statutory property documents (Registered Sale Deed, Form 7/12 Satbara, Allotment Letter, Possession Slip, Site Photos). Stored securely on your device (IndexedDB) with zero cloud fees.
                    </p>

                    {/* Attached Documents List */}
                    {activePinForEdit ? (
                      <div className="space-y-2">
                        {attachedDocs.length > 0 ? (
                          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                            {attachedDocs.map((doc) => {
                              const info = DOC_TYPE_INFO[doc.type] || DOC_TYPE_INFO.other;
                              return (
                                <div
                                  key={doc.id}
                                  className="p-2 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between gap-2"
                                >
                                  <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-1.5">
                                      <FolderCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                                      <span className="text-xs font-bold text-slate-900 truncate">{doc.name}</span>
                                      <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded border ${info.color}`}>
                                        {info.short}
                                      </span>
                                    </div>
                                    <div className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-2">
                                      <span>{formatFileSize(doc.size)}</span>
                                      <span>·</span>
                                      <span>{new Date(doc.uploadedAt).toLocaleDateString()}</span>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-1 shrink-0">
                                    <a
                                      href={doc.dataUrl}
                                      download={doc.name}
                                      className="h-6 px-2 rounded-lg bg-white border border-slate-200 hover:border-blue-300 text-blue-600 text-[10px] font-bold flex items-center gap-1 transition"
                                      title="Download / View Document"
                                    >
                                      ⬇️ View
                                    </a>
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteDoc(doc.id)}
                                      className="h-6 w-6 rounded-lg bg-white border border-slate-200 hover:bg-rose-50 hover:border-rose-300 text-rose-500 text-[10px] font-bold flex items-center justify-center transition"
                                      title="Delete Document"
                                    >
                                      ✕
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="p-3 text-center rounded-xl border border-dashed border-slate-200 bg-slate-50/50 text-[11px] text-slate-400">
                            No documents attached to this plot yet.
                          </div>
                        )}

                        {/* Upload New Document Box */}
                        <div className="p-2.5 rounded-xl border border-blue-200 bg-blue-50/40 space-y-2">
                          <span className="text-[11px] font-bold text-blue-900 flex items-center gap-1.5">
                            <Plus className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                            <span>Attach Document to Plot</span>
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <div>
                              <label className="text-[10px] font-bold text-slate-600 block mb-0.5">
                                Document Category
                              </label>
                              <select
                                value={docType}
                                onChange={(e) => setDocType(e.target.value as AttachedDocType)}
                                className="w-full h-8 rounded-lg border border-slate-200 bg-white px-2 text-[11px] outline-none focus:border-blue-500"
                              >
                                <option value="registry">Sale Deed (Sub-Registrar)</option>
                                <option value="satbara">Form 7/12 &amp; 8A Extract</option>
                                <option value="allotment">Allotment Letter (Form 4/5)</option>
                                <option value="possession">Possession Slip / Kabja</option>
                                <option value="noc">Authority NOC / Clear Title</option>
                                <option value="mutation">Mutation Entry (Form 6)</option>
                                <option value="sanction">Sanction Blueprint</option>
                                <option value="photo">Site Demarcation Photo</option>
                                <option value="other">Other Legal Document</option>
                              </select>
                            </div>
                            <div>
                              <label className="text-[10px] font-bold text-slate-600 block mb-0.5">
                                Document Title
                              </label>
                              <input
                                type="text"
                                value={docTitle}
                                onChange={(e) => setDocTitle(e.target.value)}
                                placeholder="e.g. Registered Sale Deed 2024"
                                className="w-full h-8 rounded-lg border border-slate-200 bg-white px-2 text-[11px] outline-none focus:border-blue-500"
                              />
                            </div>
                          </div>

                          <div>
                            <input
                              type="file"
                              ref={fileInputRef}
                              onChange={handleFileUpload}
                              accept=".pdf,image/png,image/jpeg,image/webp"
                              disabled={uploadingDoc}
                              className="w-full text-xs file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-[11px] file:font-bold file:bg-blue-600 file:text-white hover:file:bg-blue-700 file:cursor-pointer text-slate-500 cursor-pointer"
                            />
                            <p className="text-[9px] text-slate-400 mt-1">
                              Accepts PDF, JPG, PNG up to 25MB. Saved directly to IndexedDB.
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 text-center rounded-xl border border-dashed border-slate-200 bg-slate-50/50 text-[11px] text-slate-500 flex items-center justify-center gap-1.5">
                        <Info className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span>Click <b>Save Plot &amp; Details</b> below first to enable local document attachments for this plot.</span>
                      </div>
                    )}
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="w-full h-10 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Save className="w-4 h-4 shrink-0" />
                    <span>{activePinForEdit ? 'Save Custom Details' : 'Save Plot & Details'}</span>
                  </button>

                  {/* 1-Tap WhatsApp Dossier Share */}
                  {activePinForEdit && (
                    <button
                      type="button"
                      onClick={() => handleShareWhatsApp(activePinForEdit, attachedDocs)}
                      className="w-full h-9 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
                    >
                      <Share2 className="w-4 h-4 shrink-0" />
                      <span>Share Property Dossier on WhatsApp</span>
                    </button>
                  )}
                </form>
              </div>
            </div>
          )}

          {/* TAB 3: REDESIGNED SAVED PLOTS & CRM */}
          {tab === 'saved' && (
            <div className="space-y-3">
              {/* Search Bar for Saved Plots */}
              {bookmarks.length > 0 && (
                <div className="relative">
                  <input
                    type="text"
                    value={savedQuery}
                    onChange={(e) => setSavedQuery(e.target.value)}
                    placeholder="Search saved by name, survey, price, village..."
                    className="w-full h-8.5 rounded-xl border border-slate-200 pl-8 pr-3 text-xs outline-none bg-slate-50 focus:bg-white focus:border-blue-400 transition"
                  />
                  <svg className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              )}

              {bookmarks.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs rounded-2xl border-2 border-dashed border-slate-200 space-y-2">
                  <BookmarkIcon className="w-8 h-8 mx-auto text-slate-300" />
                  <h4 className="font-bold text-slate-700">No Saved Plots Yet</h4>
                  <p className="max-w-[220px] mx-auto text-slate-400">
                    Click any plot or survey on the map and click <b>Save Plot</b> to track it here.
                  </p>
                </div>
              ) : filteredBookmarks.length === 0 ? (
                <div className="p-6 text-center text-slate-400 text-xs">
                  No saved plots matched &ldquo;{savedQuery}&rdquo;
                </div>
              ) : (
                filteredBookmarks.map((bm) => (
                  <div
                    key={bm.id}
                    className="p-3.5 rounded-2xl border border-slate-200 bg-white hover:border-blue-300 hover:shadow-sm transition space-y-2.5 group"
                  >
                    {/* Card Title & Delete */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <h4 className="text-xs font-black text-slate-900 truncate">
                          {bm.customName || bm.label || `Survey ${bm.surveyNo}`}
                        </h4>
                        <div className="flex flex-wrap items-center gap-1.5 mt-1">
                          {bm.finalPlot && bm.finalPlot !== '—' && (
                            <span className="text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 px-1.5 py-0.2 rounded">
                              {bm.finalPlot.startsWith('FP-') || bm.finalPlot.startsWith('D-') ? bm.finalPlot : `FP-${bm.finalPlot}`}
                            </span>
                          )}
                          {bm.surveyNo && bm.surveyNo !== '—' && (
                            <span className="text-[10px] font-semibold bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded">
                              Survey {bm.surveyNo}
                            </span>
                          )}
                          <span className="text-[10px] text-slate-500 font-medium">
                            {bm.village || 'Dholera'}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => removeBookmark(bm.id)}
                        className="text-slate-300 hover:text-red-500 text-sm p-1 rounded hover:bg-red-50 transition cursor-pointer"
                        title="Remove Bookmark"
                      >
                        ✕
                      </button>
                    </div>

                    {/* Metadata row: Price, Facing, Intent, Docs Count */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-slate-100">
                      {bm.price && (
                        <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                          <Tag className="w-3 h-3 text-emerald-600 shrink-0" />
                          <span>{bm.price}</span>
                        </span>
                      )}
                      {bm.facing && (
                        <span className="text-[10px] font-semibold text-slate-600 bg-slate-50 border border-slate-200 px-1.5 py-0.5 rounded-md flex items-center gap-1">
                          <Compass className="w-3 h-3 text-slate-500 shrink-0" />
                          <span>{bm.facing}</span>
                        </span>
                      )}
                      {bm.intent && (
                        <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded-md">
                          {bm.intent}
                        </span>
                      )}
                      {Boolean(bm.documentCount && bm.documentCount > 0) && (
                        <span className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded-md flex items-center gap-1">
                          <FolderCheck className="w-3 h-3 text-blue-600 shrink-0" />
                          <span>{bm.documentCount} Doc{bm.documentCount! > 1 ? 's' : ''}</span>
                        </span>
                      )}
                    </div>

                    {/* Description snippet */}
                    {bm.description && (
                      <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed bg-slate-50/70 p-2 rounded-lg border border-slate-100">
                        {bm.description}
                      </p>
                    )}

                    {/* Action buttons */}
                    <div className="grid grid-cols-2 gap-1.5 pt-1">
                      <button
                        onClick={() => issueFly(bm.sid, bm.x, bm.y, 2.5)}
                        className="h-7.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 font-bold text-[11px] transition cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <Crosshair className="w-3.5 h-3.5 shrink-0" />
                        <span>Fly to Plot</span>
                      </button>
                      <button
                        onClick={() => {
                          setEditPin(bm);
                          setTab('edit');
                        }}
                        className="h-7.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] transition cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <Edit3 className="w-3.5 h-3.5 shrink-0" />
                        <span>{bm.documentCount ? `Docs (${bm.documentCount}) & Edit` : 'Edit & Docs'}</span>
                      </button>
                    </div>

                    <button
                      onClick={() => handleShareWhatsApp(bm)}
                      className="w-full h-7.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 font-bold text-[11px] transition cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Share2 className="w-3.5 h-3.5 shrink-0" />
                      <span>Share Property Dossier on WhatsApp</span>
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </>
    );
  }

  if (!open) return null;

  return (
    <>
      {/* 1. LEGACY MOBILE VIEW - retired: mobile UI now lives in src/components/mobile/* (one surface at a time). Stays hidden so desktop is unchanged. */}
      {selectedSurvey && mobileMode === 'peek' ? (
        /* RETIRED mobile peek card - mobile now renders MobileBottomSheet; kept mounted but hidden so desktop code paths are untouched */
        <div
          data-testid="mobile-peek-card"
          className="hidden bg-white/98 backdrop-blur-md rounded-2xl border border-slate-200/90 shadow-2xl p-3 select-none animate-in slide-in-from-bottom-2 duration-200"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Peek drag handle */}
          <div
            className="flex items-center justify-center pb-1.5 cursor-pointer"
            onClick={() => setMobileMode('half')}
            title="Drag up to view specifications"
          >
            <span className="w-10 h-1 bg-slate-300 rounded-full" />
          </div>

          {/* Header row: Badge, Village, Save, Close */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border shrink-0 flex items-center gap-1.5 ${propertyBadgeClass}`}>
                {renderPropertyIcon('w-3 h-3 shrink-0')}
                <span className="truncate max-w-[110px]">{propertyCategory.split(' ')[0]}</span>
              </span>
              <h3 className="text-base font-black text-slate-900 tracking-tight truncate">
                {finalPlot !== '—'
                  ? (finalPlot.startsWith('FP-') || finalPlot.startsWith('D-') ? finalPlot : `FP-${finalPlot}`)
                  : `Survey ${surveyNo}`}
              </h3>
              <span className="text-[11px] font-semibold text-slate-500 truncate">
                {village}
              </span>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={handleToggleBookmark}
                className={`h-7 px-2.5 rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition cursor-pointer ${
                  isBookmarked
                    ? 'bg-blue-50 text-blue-700 border border-blue-300'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
                title={isBookmarked ? 'Saved' : 'Save Plot'}
              >
                <BookmarkIcon className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-current' : ''}`} />
                <span>{isBookmarked ? 'Saved' : 'Save'}</span>
              </button>

              <button
                onClick={closePanel}
                className="w-7 h-7 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center transition cursor-pointer text-xs"
                title="Close"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Metrics row (Road Corridor, TP Scheme, Zone) */}
          <div className="flex items-center gap-2 mt-2 pt-1.5 border-t border-slate-100 text-[11px] text-slate-600 font-medium overflow-x-auto scrollbar-none">
            <span className="bg-blue-50/80 border border-blue-200/80 px-2 py-0.5 rounded-md font-bold text-blue-800 shrink-0 flex items-center gap-1">
              <Route className="w-3 h-3 text-blue-600 shrink-0" />
              <span>{roadWidth}m Road</span>
            </span>
            <span className="bg-slate-50 border border-slate-200/80 px-2 py-0.5 rounded-md font-semibold text-slate-800 shrink-0">
              {sheet?.sector || 'TP Scheme'}
            </span>
            <span className="bg-slate-50 border border-slate-200/80 px-2 py-0.5 rounded-md font-medium text-slate-700 truncate shrink-0">
              {zone.split('&')[0].trim()}
            </span>
          </div>

          {/* 4 Action Buttons Row */}
          <div className="grid grid-cols-4 gap-1.5 mt-2.5">
            <button
              onClick={() => {
                if (activeSid && clickedPt) {
                  issueFly(activeSid, clickedPt.x, clickedPt.y, 3);
                }
              }}
              className="h-8 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-[11px] flex items-center justify-center gap-1.5 transition cursor-pointer"
              title="Zoom and focus on plot"
            >
              <Crosshair className="w-3.5 h-3.5 shrink-0" />
              <span>Focus</span>
            </button>

            <button
              onClick={() => handleShareWhatsApp(currentPlotAsBookmark)}
              className="h-8 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 font-bold text-[11px] flex items-center justify-center gap-1.5 transition cursor-pointer"
              title="Share on WhatsApp"
            >
              <Share2 className="w-3.5 h-3.5 shrink-0" />
              <span>Share</span>
            </button>

            <button
              onClick={() => {
                setTab('edit');
                setMobileMode('half');
              }}
              className="h-8 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold text-[11px] flex items-center justify-center gap-1.5 transition cursor-pointer"
              title="Add Price or Remarks"
            >
              <Tag className="w-3.5 h-3.5 shrink-0" />
              <span>Price</span>
            </button>

            <button
              onClick={() => setMobileMode('half')}
              className="h-8 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 font-bold text-[11px] flex items-center justify-center gap-1 transition cursor-pointer shadow-2xs"
              title="Expand specifications"
            >
              <span>Specs</span>
              <ChevronUp className="w-3.5 h-3.5 text-slate-600 shrink-0" />
            </button>
          </div>
        </div>
      ) : (
        /* EXPANDED MOBILE BOTTOM SHEET (Space-efficient max 38dvh, leaving >60% map visible) */
        <aside
          data-testid="info-panel-mobile-expanded"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className={`hidden ${
            mobileMode === 'half' ? 'max-h-[42dvh]' : 'max-h-[78dvh]'
          } bg-white/98 backdrop-blur-xl border-t border-slate-200/90 shadow-2xl rounded-t-3xl flex flex-col overflow-hidden transition-all duration-300 ease-out`}
        >
            {/* Drag handle */}
            <div
              className="flex items-center justify-center pt-2.5 pb-1 cursor-pointer"
              onClick={() => {
                if (mobileMode === 'half') setMobileMode('full');
                else if (selectedSurvey) setMobileMode('peek');
                else closePanel();
              }}
              title="Tap or drag to resize"
            >
              <span className="w-12 h-1.5 bg-slate-300 rounded-full" />
            </div>

            {/* Mobile Sheet Header */}
            <div className="flex items-center justify-between px-4 h-12 border-b border-slate-100 shrink-0">
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse shrink-0" />
                <h2 className="text-sm font-black text-slate-900 truncate">
                  {tab === 'plot'
                    ? (selectedSurvey ? (finalPlot !== '—' ? finalPlot : `Survey ${surveyNo}`) : 'Interactive Plot Specs')
                    : tab === 'edit'
                    ? 'Edit & Customize Plot'
                    : `Saved Plots (${bookmarks.length})`}
                </h2>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {/* Snap toggle button */}
                {selectedSurvey && (
                  <button
                    onClick={() => {
                      if (mobileMode === 'half') setMobileMode('full');
                      else setMobileMode('peek');
                    }}
                    className="px-2.5 py-1 rounded-lg text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition cursor-pointer flex items-center gap-1"
                    title={mobileMode === 'half' ? 'Expand to Full' : 'Minimize to Map'}
                  >
                    {mobileMode === 'half' ? (
                      <>
                        <ChevronUp className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span>Full</span>
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                        <span>Map</span>
                      </>
                    )}
                  </button>
                )}

                {hasSelectedParcel && (
                  <button
                    onClick={handleToggleBookmark}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                      isBookmarked
                        ? 'bg-blue-50 text-blue-700 border border-blue-300'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                  >
                    <BookmarkIcon className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-current' : ''}`} />
                    <span>{isBookmarked ? 'Saved' : 'Save'}</span>
                  </button>
                )}

                <button
                  onClick={closePanel}
                  data-testid="close-panel"
                  className="w-8 h-8 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center transition cursor-pointer text-sm"
                  title="Close Panel"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Panel Body */}
            {renderPanelBody()}
          </aside>
      )}

      {/* 2. DESKTOP VIEW (hidden md:flex) */}
      {desktopCollapsed ? (
        /* Collapsed Floating Pill */
        <button
          onClick={() => setDesktopCollapsed(false)}
          className="hidden md:flex fixed z-[1050] top-16 right-4 items-center gap-2 px-3.5 py-2 rounded-xl bg-white/95 backdrop-blur-md border border-slate-200 shadow-lg text-xs font-bold text-slate-800 hover:text-blue-600 hover:border-blue-300 transition cursor-pointer group"
          title="Open Plot Specifications"
        >
          <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
          <span>{selectedSurvey ? (finalPlot !== '—' ? finalPlot : `Survey ${surveyNo}`) : 'Plot Specs'}</span>
          <span className="text-slate-400 group-hover:text-blue-600 transition">◀</span>
        </button>
      ) : (
        /* Floating Glassmorphic Card */
        <aside
          data-testid="info-panel"
          className="hidden md:flex fixed z-[1050] top-16 right-4 bottom-4 w-[410px] max-w-[calc(100vw-2rem)] bg-white/95 backdrop-blur-xl border border-slate-200/90 shadow-2xl rounded-2xl flex-col overflow-hidden animate-in fade-in slide-in-from-right-3 duration-200"
        >
          {/* Panel Header */}
          <div className="flex items-center justify-between px-4 h-13 border-b border-slate-100 shrink-0 bg-white/90">
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse shrink-0" />
              <h2 className="text-sm font-black text-slate-900 truncate">
                {tab === 'plot'
                  ? (selectedSurvey ? (finalPlot !== '—' ? finalPlot : `Survey ${surveyNo}`) : 'Interactive Plot Specs')
                  : tab === 'edit'
                  ? 'Edit & Customize Plot'
                  : `Saved Plots (${bookmarks.length})`}
              </h2>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {hasSelectedParcel && (
                <button
                  onClick={handleToggleBookmark}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-xs cursor-pointer ${
                    isBookmarked
                      ? 'bg-blue-50 text-blue-700 border border-blue-300 hover:bg-blue-100'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                  title={isBookmarked ? 'Remove from bookmarks' : 'Save plot to bookmarks'}
                >
                  <BookmarkIcon className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-current' : ''}`} />
                  <span>{isBookmarked ? 'Saved' : 'Save Plot'}</span>
                </button>
              )}

              {/* Minimize to chip button */}
              <button
                onClick={() => setDesktopCollapsed(true)}
                className="w-8 h-8 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center transition cursor-pointer text-sm font-bold"
                title="Minimize Panel"
              >
                —
              </button>

              <button
                onClick={closePanel}
                data-testid="close-panel"
                className="w-8 h-8 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center transition cursor-pointer text-sm"
                title="Close Panel"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Panel Body */}
          {renderPanelBody()}
        </aside>
      )}
    </>
  );
}
