'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import SiteHeader from '@/components/panels/SiteHeader';
import SiteFooter from '@/components/panels/SiteFooter';
import { useApp } from '@/lib/store';
import type { Bookmark, Facing, DealIntent, DealOutcome, AttachedDoc, AttachedDocType } from '@/lib/types';
import {
  getDocsByPin,
  saveDoc,
  deleteDoc,
  DOC_TYPE_INFO,
  formatFileSize,
  fileToDataUrl,
} from '@/lib/doc-storage';
import { Crosshair, FolderCheck, Edit3, Share2, FileText } from 'lucide-react';
import dynamic from 'next/dynamic';
// The export modal pulls the whole pdf-lib / qrcode / fontkit graph (~450 kB).
// It is only needed once the dealer actually opens the export, so it is split
// out of the dashboard's first load and fetched on demand.
const DossierExportModal = dynamic(() => import('@/components/dossier/DossierExportModal'), {
  ssr: false,
  loading: () => null,
});
import { useEntitlements } from '@/hooks/useEntitlements';
import Paywall from '@/components/Paywall';

export default function DashboardPage() {
  const bookmarks = useApp((s) => s.bookmarks);
  const updateBookmark = useApp((s) => s.updateBookmark);
  const removeBookmark = useApp((s) => s.removeBookmark);
  const hydrateBookmarks = useApp((s) => s.hydrateBookmarks);
  const syncBookmarksWithCloud = useApp((s) => s.syncBookmarksWithCloud);
  const hydrateUser = useApp((s) => s.hydrateUser);
  const ent = useEntitlements();

  // Test hook: the map viewer exposes the same handle. Lets the perf test seed
  // a saved plot without going through Clerk.
  useEffect(() => {
    (window as unknown as { __useApp: typeof useApp }).__useApp = useApp;
  }, []);

  // Search, filter & sort state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedScheme, setSelectedScheme] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'price_desc' | 'price_asc' | 'area_desc'>('newest');

  // Editing state for inline modal
  const [editingPin, setEditingPin] = useState<Bookmark | null>(null);
  const [editName, setEditName] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editFacing, setEditFacing] = useState<Facing | string>('');
  const [editIntent, setEditIntent] = useState<DealIntent>('watching');
  const [editOutcome, setEditOutcome] = useState<DealOutcome>('available');
  const [editDesc, setEditDesc] = useState('');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Documents & Registry Modal State
  const [docModalPin, setDocModalPin] = useState<Bookmark | null>(null);
  // Client dossier export modal
  const [dossierPin, setDossierPin] = useState<Bookmark | null>(null);
  const [attachedDocs, setAttachedDocs] = useState<AttachedDoc[]>([]);
  const [newDocFile, setNewDocFile] = useState<File | null>(null);
  const [newDocName, setNewDocName] = useState('');
  const [newDocType, setNewDocType] = useState<AttachedDocType>('registry');
  const [newDocNotes, setNewDocNotes] = useState('');
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [includeDocsInShare, setIncludeDocsInShare] = useState(true);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('dholera-bookmarks-v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          hydrateBookmarks(parsed);
        }
      }
    } catch {}
    syncBookmarksWithCloud();
    // Hydrate the saved profile so per-user dossier branding can load its logo
    // and contact details without a separate visit to Settings.
    hydrateUser();
  }, [hydrateBookmarks, hydrateUser, syncBookmarksWithCloud]);

  useEffect(() => {
    if (!toastMsg) return;
    const t = setTimeout(() => setToastMsg(null), 3000);
    return () => clearTimeout(t);
  }, [toastMsg]);

  // Open Edit Modal
  function handleOpenEdit(b: Bookmark) {
    setEditingPin(b);
    setEditName(b.customName || '');
    setEditPrice(b.price || '');
    setEditFacing(b.facing || '');
    setEditIntent(b.intent || 'watching');
    setEditOutcome(b.outcome || 'available');
    setEditDesc(b.description || b.note || '');
  }

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

  function handleSaveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingPin) return;
    updateBookmark(editingPin.id, {
      customName: editName.trim() || undefined,
      price: editPrice.trim() || undefined,
      priceLakh: parsePriceLakh(editPrice),
      facing: editFacing || undefined,
      intent: editIntent || undefined,
      outcome: editOutcome || undefined,
      description: editDesc.trim() || undefined,
      note: editDesc.trim() || undefined,
    });
    setToastMsg(`Updated details for ${editName.trim() || editingPin.label}`);
    setEditingPin(null);
  }

  // Cross-page fly to map
  function handleFlyToMap(b: Bookmark) {
    try {
      sessionStorage.setItem(
        'dholera-pending-goto',
        JSON.stringify({ sid: b.sid, x: b.x, y: b.y, surveyNo: b.surveyNo, finalPlot: b.finalPlot })
      );
    } catch {}
    window.location.href = `/map?sid=${b.sid}`;
  }

  // Documents & Registry Modal Handlers
  async function handleOpenDocs(b: Bookmark) {
    setDocModalPin(b);
    setNewDocFile(null);
    setNewDocName('');
    setNewDocType('registry');
    setNewDocNotes('');
    try {
      const docs = await getDocsByPin(b.id);
      setAttachedDocs(docs);
    } catch {
      setAttachedDocs([]);
    }
  }

  async function handleUploadDoc(e: React.FormEvent) {
    e.preventDefault();
    if (!docModalPin || !newDocFile) return;

    setUploadingDoc(true);
    try {
      const dataUrl = await fileToDataUrl(newDocFile);
      const newDoc: AttachedDoc = {
        id: `doc-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        pinId: docModalPin.id,
        name: newDocName.trim() || newDocFile.name.replace(/\.[^/.]+$/, ''),
        type: newDocType,
        fileType: newDocFile.type || 'application/octet-stream',
        size: newDocFile.size,
        dataUrl,
        uploadedAt: Date.now(),
        notes: newDocNotes.trim() || undefined,
      };

      await saveDoc(newDoc);
      const updatedDocs = await getDocsByPin(docModalPin.id);
      setAttachedDocs(updatedDocs);

      updateBookmark(docModalPin.id, {
        documentCount: updatedDocs.length,
        documentTypes: Array.from(new Set(updatedDocs.map((d) => d.type))),
      });

      setNewDocFile(null);
      setNewDocName('');
      setNewDocNotes('');
      setToastMsg(`Saved "${newDoc.name}" to local IndexedDB registry!`);
    } catch (err) {
      setToastMsg(err instanceof Error ? err.message : 'Failed to save document');
    } finally {
      setUploadingDoc(false);
    }
  }

  async function handleDeleteDoc(docId: string) {
    if (!docModalPin) return;
    try {
      await deleteDoc(docId);
      const updatedDocs = await getDocsByPin(docModalPin.id);
      setAttachedDocs(updatedDocs);
      updateBookmark(docModalPin.id, {
        documentCount: updatedDocs.length,
        documentTypes: Array.from(new Set(updatedDocs.map((d) => d.type))),
      });
      setToastMsg('Document removed from local registry');
    } catch {
      setToastMsg('Failed to delete document');
    }
  }

  // Share via WhatsApp with optional document manifest
  async function handleShareWhatsApp(b: Bookmark) {
    let docsText = '';
    if (includeDocsInShare) {
      try {
        const docs = await getDocsByPin(b.id);
        if (docs.length > 0) {
          docsText = `\n\n[Verified Documents in Registry (${docs.length})]:\n` +
            docs.map((d, i) => `  ${i + 1}. ${d.name} (${DOC_TYPE_INFO[d.type]?.short || d.type})`).join('\n');
        }
      } catch {}
    }

    const text = `DholeraMap Official Dholera SIR Interactive Dossier:\n• Plot: ${b.customName || b.label}\n• Scheme: ${b.sid.toUpperCase()}\n• Village: ${b.village || 'Dholera SIR'}\n• Final Plot (FP): ${b.finalPlot || '—'}\n• Survey No: ${b.surveyNo || '—'}\n• Reconstituted Area: ${b.areaSqM ? `${b.areaSqM} m²` : '— not measured on plan'}\n• Road Frontage: ${b.roadWidthM || 30}m TP Road\n• Facing: ${b.facing || 'Standard'}\n• Asking Price: ${b.price || 'Price on Request'}${docsText}\n\nInspect on Live Vector Map:\nhttps://dholeramap.com/?sid=${b.sid}&survey=${b.surveyNo || ''}`;

    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  }

  // Export CSV
  function handleExportCSV() {
    if (bookmarks.length === 0) return;
    const headers = ['Plot Label', 'Custom Name', 'TP Scheme', 'Village', 'Final Plot (FP)', 'Survey No', 'Area (Sq.M)', 'Road Frontage (M)', 'Price', 'Facing', 'Intent', 'Status', 'Notes'];
    const rows = bookmarks.map((b) => [
      `"${b.label || ''}"`,
      `"${b.customName || ''}"`,
      `"${b.sid || ''}"`,
      `"${b.village || ''}"`,
      `"${b.finalPlot || ''}"`,
      `"${b.surveyNo || ''}"`,
      `"${b.areaSqM || ''}"`,
      `"${b.roadWidthM || ''}"`,
      `"${b.price || ''}"`,
      `"${b.facing || ''}"`,
      `"${b.intent || ''}"`,
      `"${b.outcome || ''}"`,
      `"${(b.description || b.note || '').replace(/"/g, '""')}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `dholera_saved_plots_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // KPIs
  const totalValueLakh = useMemo(() => {
    return bookmarks.reduce((acc, b) => acc + (b.priceLakh || 0), 0);
  }, [bookmarks]);

  const sellingCount = useMemo(() => bookmarks.filter((b) => b.intent === 'selling').length, [bookmarks]);
  const buyingCount = useMemo(() => bookmarks.filter((b) => b.intent === 'buying').length, [bookmarks]);

  // Schemes available
  const schemesList = ['All', 'TP 1', 'TP 2', 'TP 3', 'TP 4', 'TP 5', 'TP 6'];

  // Filtered & Sorted list
  const filteredPins = useMemo(() => {
    let list = [...bookmarks];

    if (selectedScheme !== 'All') {
      const sKey = selectedScheme.toLowerCase().replace(/\s+/g, '');
      list = list.filter((b) => b.sid.toLowerCase().includes(sKey) || (b.label && b.label.toLowerCase().includes(selectedScheme.toLowerCase())));
    }

    if (selectedStatus !== 'all') {
      if (selectedStatus === 'selling') list = list.filter((b) => b.intent === 'selling');
      else if (selectedStatus === 'buying') list = list.filter((b) => b.intent === 'buying');
      else if (selectedStatus === 'watching') list = list.filter((b) => !b.intent || b.intent === 'watching');
      else if (selectedStatus === 'completed') list = list.filter((b) => b.outcome === 'sold' || b.outcome === 'bought');
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((b) => {
        const name = (b.customName || '').toLowerCase();
        const lbl = (b.label || '').toLowerCase();
        const fp = (b.finalPlot || '').toLowerCase();
        const surv = (b.surveyNo || '').toLowerCase();
        const vil = (b.village || '').toLowerCase();
        const desc = (b.description || b.note || '').toLowerCase();
        const pr = (b.price || '').toLowerCase();
        return name.includes(q) || lbl.includes(q) || fp.includes(q) || surv.includes(q) || vil.includes(q) || desc.includes(q) || pr.includes(q);
      });
    }

    list.sort((a, b) => {
      if (sortBy === 'newest') return (b.createdAt || 0) - (a.createdAt || 0);
      if (sortBy === 'oldest') return (a.createdAt || 0) - (b.createdAt || 0);
      if (sortBy === 'price_desc') return (b.priceLakh || 0) - (a.priceLakh || 0);
      if (sortBy === 'price_asc') return (a.priceLakh || 0) - (b.priceLakh || 0);
      if (sortBy === 'area_desc') return (b.areaSqM || 0) - (a.areaSqM || 0);
      return 0;
    });

    return list;
  }, [bookmarks, selectedScheme, selectedStatus, searchQuery, sortBy]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col font-sans">
      <SiteHeader activePage="dashboard" />

      {/* Toast */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-[2000] p-3.5 bg-slate-900 text-white text-xs font-bold rounded-2xl shadow-xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2">
          <span>{toastMsg}</span>
          <button onClick={() => setToastMsg(null)} className="text-slate-400 hover:text-white cursor-pointer">✕</button>
        </div>
      )}

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* The dashboard is a Pro surface. Free (or expired-trial) users get
            the paywall instead of the CRM; the route still renders so deep
            links land somewhere useful rather than erroring. */}
        {ent.isFree ? (
          <div className="max-w-2xl mx-auto pt-8">
            <Paywall feature="dashboard" />
          </div>
        ) : (
        <>
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
                Saved Plots CRM &amp; Dashboard
              </h1>
              <span className="text-xs font-bold bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded-full">
                {bookmarks.length} Plots Shortlisted
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Shortlisted interactive final plots, demand valuations, deal status, and direct map navigation.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              disabled={bookmarks.length === 0}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 shadow-2xs transition cursor-pointer disabled:opacity-40 flex items-center gap-1.5"
            >
              <span>📥</span>
              <span>Export CSV</span>
            </button>
            <Link
              href="/map"
              className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition cursor-pointer flex items-center gap-1.5"
            >
              <span>🗺️</span>
              <span>Explore Map</span>
            </Link>
          </div>
        </div>

        {/* Top KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Total Saved Plots</span>
            <div className="text-2xl font-black text-slate-900">{bookmarks.length}</div>
            <span className="text-[11px] text-slate-500 block">Across Dholera SIR Schemes</span>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
            <span className="text-[10px] uppercase font-bold text-emerald-600 tracking-wider">Total Tracked Value</span>
            <div className="text-2xl font-black text-emerald-700">
              {totalValueLakh > 0
                ? totalValueLakh >= 100
                  ? `₹${(totalValueLakh / 100).toFixed(2)} Cr`
                  : `₹${totalValueLakh} Lakh`
                : '—'}
            </div>
            <span className="text-[11px] text-slate-500 block">Estimated Deal Pipeline</span>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
            <span className="text-[10px] uppercase font-bold text-blue-600 tracking-wider">Selling Listings</span>
            <div className="text-2xl font-black text-blue-800">{sellingCount}</div>
            <span className="text-[11px] text-slate-500 block">Active Market Offerings</span>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
            <span className="text-[10px] uppercase font-bold text-purple-600 tracking-wider">Buyer Inquiries</span>
            <div className="text-2xl font-black text-purple-800">{buyingCount}</div>
            <span className="text-[11px] text-slate-500 block">Target Acquisition Reqs</span>
          </div>
        </div>

        {/* Filter & Search Toolbar */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by custom name, FP, survey number, village, price, notes..."
                className="w-full h-10 rounded-xl border border-slate-200 pl-9 pr-3 text-xs outline-none bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
              />
              <svg className="w-4 h-4 text-slate-400 absolute left-3 top-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs font-bold text-slate-500">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="h-10 rounded-xl border border-slate-200 px-3 text-xs font-semibold bg-white outline-none focus:border-blue-500"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="area_desc">Area: Largest</option>
              </select>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
            {/* Scheme Filter */}
            <div className="flex flex-wrap items-center gap-1">
              <span className="text-[11px] font-bold text-slate-400 mr-1">Scheme:</span>
              {schemesList.map((sch) => (
                <button
                  key={sch}
                  onClick={() => setSelectedScheme(sch)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                    selectedScheme === sch
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {sch}
                </button>
              ))}
            </div>

            {/* Deal Status Filter */}
            <div className="flex flex-wrap items-center gap-1">
              <span className="text-[11px] font-bold text-slate-400 mr-1">Status:</span>
              {(
                [
                  ['all', 'All'],
                  ['selling', 'Selling'],
                  ['buying', 'Buying'],
                  ['watching', 'Watching'],
                  ['completed', 'Completed'],
                ] as const
              ).map(([st, lbl]) => (
                <button
                  key={st}
                  onClick={() => setSelectedStatus(st)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                    selectedStatus === st
                      ? 'bg-slate-900 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {lbl}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Plot Cards Grid */}
        {filteredPins.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center text-3xl mx-auto shadow-2xs">
              📂
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-black text-slate-900">No Saved Plots Found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {bookmarks.length === 0
                  ? 'Click any plot on the interactive map and click Save Plot to add it to your shortlist.'
                  : 'No plots match the current filter or search criteria.'}
              </p>
            </div>
            <Link
              href="/map"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition"
            >
              <span>Explore Interactive Map</span>
              <span>→</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPins.map((b) => (
              <div
                key={b.id}
                className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-blue-300 hover:shadow-md transition flex flex-col justify-between space-y-3 group"
              >
                {/* Top Title & Scheme Badge */}
                <div className="space-y-1.5">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-black text-slate-900 line-clamp-1">
                      {b.customName || b.label || `Survey ${b.surveyNo}`}
                    </h3>
                    <button
                      onClick={() => removeBookmark(b.id)}
                      className="text-slate-300 hover:text-red-500 text-sm p-1 rounded hover:bg-red-50 transition cursor-pointer"
                      title="Remove plot"
                    >
                      ✕
                    </button>
                  </div>

                  {/* Badges */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-md">
                      {b.sid.toUpperCase()}
                    </span>
                    {b.finalPlot && b.finalPlot !== '—' && (
                      <span className="text-[10px] font-bold bg-slate-100 text-slate-800 border border-slate-200 px-2 py-0.5 rounded-md">
                        {b.finalPlot.startsWith('FP-') || b.finalPlot.startsWith('D-') ? b.finalPlot : `FP-${b.finalPlot}`}
                      </span>
                    )}
                    {b.surveyNo && b.surveyNo !== '—' && (
                      <span className="text-[10px] font-semibold bg-slate-50 text-slate-600 border border-slate-200 px-2 py-0.5 rounded-md">
                        Survey {b.surveyNo}
                      </span>
                    )}
                    <span className="text-[10px] text-slate-500 font-medium ml-auto">
                      {b.village || 'Dholera'}
                    </span>
                  </div>
                </div>

                {/* Price & Demand */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Target Demand</span>
                  <span className="text-sm font-black text-emerald-700">
                    {b.price || 'Price on Request'}
                  </span>
                </div>

                {/* Specs Grid */}
                <div className="grid grid-cols-2 gap-2 text-xs py-1 border-t border-b border-slate-100">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">Reconstituted Area</span>
                    <span className="font-bold text-slate-900 mt-0.5 block">
                      {b.areaSqM ? `${b.areaSqM} m²` : '— not measured'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">TP Road Frontage</span>
                    <span className="font-bold text-blue-900 mt-0.5 block">
                      {b.roadWidthM ? `${b.roadWidthM}m Corridor` : '30m TP Road'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">Plot Facing</span>
                    <span className="font-bold text-slate-800 mt-0.5 block capitalize">
                      {b.facing || 'Standard'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">Deal Intent</span>
                    <span className="font-bold text-indigo-700 mt-0.5 block uppercase text-[10px] tracking-wider">
                      {b.intent || 'Watching'}
                    </span>
                  </div>
                </div>

                {/* Description */}
                {(b.description || b.note) && (
                  <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed bg-slate-50/70 p-2 rounded-lg border border-slate-100">
                    {b.description || b.note}
                  </p>
                )}

                {/* Actions */}
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5 pt-1">
                  <button
                    onClick={() => handleFlyToMap(b)}
                    className="h-8 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] transition shadow-2xs cursor-pointer flex items-center justify-center gap-1.5"
                    title="Locate plot on interactive vector map"
                  >
                    <Crosshair className="w-3.5 h-3.5 shrink-0" />
                    <span>Fly</span>
                  </button>

                  <button
                    onClick={() => handleOpenDocs(b)}
                    className="h-8 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 font-bold text-[11px] transition cursor-pointer flex items-center justify-center gap-1.5"
                    title="Manage Registry & Documents in IndexedDB"
                  >
                    <FolderCheck className="w-3.5 h-3.5 shrink-0" />
                    <span>Docs {b.documentCount ? `(${b.documentCount})` : ''}</span>
                  </button>

                  <button
                    onClick={() => handleOpenEdit(b)}
                    className="h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] transition cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Edit3 className="w-3.5 h-3.5 shrink-0" />
                    <span>Edit</span>
                  </button>

                  <button
                    onClick={() => handleShareWhatsApp(b)}
                    className="h-8 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-[11px] transition cursor-pointer flex items-center justify-center gap-1.5"
                    title="Share details & documents via WhatsApp"
                  >
                    <Share2 className="w-3.5 h-3.5 shrink-0" />
                    <span>WhatsApp</span>
                  </button>

                  <button
                    onClick={() => setDossierPin(b)}
                    className="h-8 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 font-bold text-[11px] transition cursor-pointer flex items-center justify-center gap-1.5"
                    title="Generate client-ready landscape PDF dossier from developer template"
                  >
                    <FileText className="w-3.5 h-3.5 shrink-0" />
                    <span>PDF</span>
                  </button>
                </div>
              </div>
            ))}
        </div>
        )}
        </>
        )}
      </main>

      {/* Inline Edit Modal */}
      {editingPin && (
        <div className="fixed inset-0 z-[2000] grid place-items-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div
            className="fixed inset-0"
            onClick={() => setEditingPin(null)}
            aria-hidden="true"
          />
          <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 z-10 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-black text-slate-900">
                  Edit Saved Plot Details
                </h3>
                <p className="text-[11px] text-slate-500">
                  {editingPin.label} · {editingPin.village}
                </p>
              </div>
              <button
                onClick={() => setEditingPin(null)}
                className="w-7 h-7 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center transition cursor-pointer text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Custom Name / Heading <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="e.g. Prime Corner Plot near Expressway"
                  className="w-full h-9 rounded-xl border border-slate-200 px-3 text-xs outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Price / Demand <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={editPrice}
                    onChange={(e) => setEditPrice(e.target.value)}
                    placeholder="e.g. ₹45 Lakh"
                    className="w-full h-9 rounded-xl border border-slate-200 px-3 text-xs outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Facing <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <select
                    value={editFacing}
                    onChange={(e) => setEditFacing(e.target.value)}
                    className="w-full h-9 rounded-xl border border-slate-200 px-2 text-xs outline-none bg-white focus:border-blue-500"
                  >
                    <option value="">Select Facing</option>
                    <option value="north">North Facing</option>
                    <option value="northeast">North-East (Ishan)</option>
                    <option value="east">East Facing</option>
                    <option value="southeast">South-East Facing</option>
                    <option value="south">South Facing</option>
                    <option value="southwest">South-West Facing</option>
                    <option value="west">West Facing</option>
                    <option value="northwest">North-West Facing</option>
                    <option value="corner">Corner Plot</option>
                    <option value="park">Park Facing</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Intent</label>
                  <select
                    value={editIntent}
                    onChange={(e) => setEditIntent(e.target.value as any)}
                    className="w-full h-9 rounded-xl border border-slate-200 px-2 text-xs outline-none bg-white focus:border-blue-500"
                  >
                    <option value="watching">Watching</option>
                    <option value="selling">Selling</option>
                    <option value="buying">Buying</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Status</label>
                  <select
                    value={editOutcome}
                    onChange={(e) => setEditOutcome(e.target.value as any)}
                    className="w-full h-9 rounded-xl border border-slate-200 px-2 text-xs outline-none bg-white focus:border-blue-500"
                  >
                    <option value="available">Available</option>
                    <option value="sold">Sold</option>
                    <option value="looking">Looking</option>
                    <option value="bought">Bought</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Description &amp; Private Remarks <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <textarea
                  rows={3}
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  placeholder="Notes, registry verification, client observations..."
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-200 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingPin(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Local Land Registry & Documents Modal */}
      {docModalPin && (
        <div className="fixed inset-0 z-[2000] grid place-items-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div
            className="fixed inset-0"
            onClick={() => setDocModalPin(null)}
            aria-hidden="true"
          />
          <div className="relative w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl border border-slate-200 z-10 space-y-5 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-black text-slate-900">
                    Local Land Registry &amp; Document Vault
                  </h3>
                  <span className="text-[10px] font-bold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full">
                    🔒 IndexedDB (Local-First)
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  {docModalPin.customName || docModalPin.label} · {docModalPin.village} (Scheme {docModalPin.sid.toUpperCase()})
                </p>
              </div>
              <button
                onClick={() => setDocModalPin(null)}
                className="w-8 h-8 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center transition cursor-pointer text-sm"
              >
                ✕
              </button>
            </div>

            {/* Privacy notice banner */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600 flex items-start gap-2.5">
              <span className="text-base">🛡️</span>
              <div className="space-y-0.5">
                <strong className="text-slate-900 font-bold block">100% Private to Your Device</strong>
                <p className="text-[11px] text-slate-500">
                  Documents are stored exclusively in your browser’s IndexedDB database. They never touch any cloud server, ensuring absolute privacy for your title deeds and 7/12 records.
                </p>
              </div>
            </div>

            {/* List of Attached Documents */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Attached Documents ({attachedDocs.length})
                </h4>
                {attachedDocs.length > 0 && (
                  <span className="text-[11px] text-slate-400 font-mono">
                    Total: {formatFileSize(attachedDocs.reduce((acc, d) => acc + (d.size || 0), 0))}
                  </span>
                )}
              </div>

              {attachedDocs.length === 0 ? (
                <div className="p-6 rounded-2xl border-2 border-dashed border-slate-200 text-center space-y-1">
                  <div className="text-2xl">📑</div>
                  <div className="text-xs font-bold text-slate-700">No documents attached yet</div>
                  <p className="text-[11px] text-slate-400">
                    Upload your Registered Sale Deed, Form 7/12 Satbara extract, or DGDCR Blueprint below.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {attachedDocs.map((doc) => {
                    const info = DOC_TYPE_INFO[doc.type] || DOC_TYPE_INFO.other;
                    return (
                      <div
                        key={doc.id}
                        className="p-3 rounded-2xl border border-slate-200 bg-white hover:border-blue-300 transition flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <FolderCheck className="w-5 h-5 text-blue-600 shrink-0" />
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-slate-900 truncate">
                                {doc.name}
                              </span>
                              <span className={`text-[9px] font-bold uppercase px-1.5 py-0.2 rounded border ${info.color}`}>
                                {info.short}
                              </span>
                            </div>
                            <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5">
                              <span>{formatFileSize(doc.size)}</span>
                              <span>·</span>
                              <span>Uploaded {new Date(doc.uploadedAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                              {doc.notes && (
                                <>
                                  <span>·</span>
                                  <span className="italic truncate">&ldquo;{doc.notes}&rdquo;</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <a
                            href={doc.dataUrl}
                            download={doc.name}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2.5 py-1.5 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold text-[11px] transition cursor-pointer"
                            title="View / Download Document"
                          >
                            Download
                          </a>
                          <button
                            onClick={() => handleDeleteDoc(doc.id)}
                            className="w-7 h-7 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition cursor-pointer flex items-center justify-center text-xs"
                            title="Delete document"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Upload Form */}
            <form onSubmit={handleUploadDoc} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <span>➕</span>
                <span>Attach New Land Record or Document</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Select File <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="file"
                    accept=".pdf,image/png,image/jpeg,image/webp"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      setNewDocFile(file);
                      if (file && !newDocName) {
                        setNewDocName(file.name.replace(/\.[^/.]+$/, ''));
                      }
                    }}
                    className="w-full text-xs text-slate-600 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer"
                    required
                  />
                  <span className="text-[10px] text-slate-400 block mt-0.5">Supports PDF, JPG, PNG (Max 20MB)</span>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Document Category
                  </label>
                  <select
                    value={newDocType}
                    onChange={(e) => setNewDocType(e.target.value as AttachedDocType)}
                    className="w-full h-9 rounded-xl border border-slate-200 px-2 text-xs outline-none bg-white focus:border-blue-500"
                  >
                    <option value="registry">Registered Sale Deed / Title Deed</option>
                    <option value="satbara">Form 7/12 (Satbara) &amp; 8A Extract</option>
                    <option value="allotment">Statutory Allotment Letter (Form 4/5)</option>
                    <option value="possession">Possession Slip / Kabja Receipt</option>
                    <option value="noc">Authority NOC / Title Search Report</option>
                    <option value="mutation">Revenue Mutation Entry (Form 6)</option>
                    <option value="sanction">Sanctioned Blueprint / DGDCR Plan</option>
                    <option value="photo">Ground Demarcation Photo</option>
                    <option value="other">Other Supporting Legal Document</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Document Name / Label
                </label>
                <input
                  type="text"
                  value={newDocName}
                  onChange={(e) => setNewDocName(e.target.value)}
                  placeholder="e.g. Registered Sale Deed SRO Bavaliyari 2024"
                  className="w-full h-9 rounded-xl border border-slate-200 px-3 text-xs outline-none bg-white focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Private Notes &amp; Verification Remarks <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={newDocNotes}
                  onChange={(e) => setNewDocNotes(e.target.value)}
                  placeholder="e.g. Verified with Sub-Registrar records; zero encumbrance."
                  className="w-full h-9 rounded-xl border border-slate-200 px-3 text-xs outline-none bg-white focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  disabled={uploadingDoc || !newDocFile}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {uploadingDoc ? 'Saving to IndexedDB...' : 'Save Document to Local Registry'}
                </button>
              </div>
            </form>

            {/* WhatsApp Share Action inside Docs Modal */}
            <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-emerald-900 block">
                  Send Plot Dossier &amp; Document Checklist via WhatsApp
                </span>
                <label className="flex items-center gap-1.5 text-[11px] text-emerald-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeDocsInShare}
                    onChange={(e) => setIncludeDocsInShare(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>Include list of attached documents in WhatsApp message</span>
                </label>
              </div>

              <button
                onClick={() => handleShareWhatsApp(docModalPin)}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition shadow-xs cursor-pointer flex items-center gap-1.5 whitespace-nowrap"
              >
                <span>💬</span>
                <span>Share on WhatsApp</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Client Dossier Export Modal */}
      {dossierPin && (
        <DossierExportModal pin={dossierPin} onClose={() => setDossierPin(null)} />
      )}

      <SiteFooter />
    </div>
  );
}
