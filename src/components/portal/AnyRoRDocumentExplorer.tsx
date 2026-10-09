'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  FileText, 
  CheckSquare, 
  Square, 
  ShieldAlert, 
  ShieldCheck, 
  ExternalLink, 
  FileCheck2, 
  BookOpen, 
  Scroll, 
  Search, 
  ChevronRight,
  Stamp,
  CheckCircle2
} from 'lucide-react';

interface RevenueDoc {
  id: string;
  name: string;
  gujaratiName: string;
  badge: string;
  purpose: string;
  criticalFields: string[];
  investorAdvice: string;
}

const REVENUE_DOCS: RevenueDoc[] = [
  {
    id: 'vf7',
    name: 'Village Form 7 (VF-7 / 7/12 Extract)',
    gujaratiName: 'ગામ નમૂનો ૭ (અધિકાર પત્રક)',
    badge: 'Primary Ownership Record',
    purpose: 'The fundamental document identifying survey number, plot area in Hectare-Are-Sqm, tenure classification, and registered landowners (Khatedar).',
    criticalFields: [
      'Survey Number / Block Number',
      'Tenure (Juni Sharat / Navi Sharat)',
      'Total Area (Ha - Are - Sqm)',
      'Assessment Tax (Aakarnai)',
      'Current Occupant / Owner Names'
    ],
    investorAdvice: 'Verify whether the tenure is "Old Tenure" (Juni Sharat). If listed as "New Tenure" (Navi Sharat), land cannot be transferred or converted to non-agricultural (NA) without paying a substantial premium to the District Collector.'
  },
  {
    id: 'vf8a',
    name: 'Village Form 8A (Khata Bahi)',
    gujaratiName: 'ગામ નમૂનો ૮-અ (ખાતા વહી)',
    badge: 'Tax & Holding Ledger',
    purpose: 'The consolidated tax ledger representing a landowner’s complete agricultural land portfolio within a specific revenue village.',
    criticalFields: [
      'Khata Number (Account Number)',
      'List of all Survey Numbers held under this Khata',
      'Individual & Total Area of each parcel',
      'Annual land revenue liability'
    ],
    investorAdvice: 'Always match the Khata Number on VF-8A with the entry on VF-7. If a survey number appears on VF-7 but is missing from VF-8A, it signals an unpromulgated or disputed title partition.'
  },
  {
    id: 'vf6',
    name: 'Village Form 6 (Hakk Patrak / Mutation Register)',
    gujaratiName: 'ગામ નમૂનો ૬ (હક્ક પત્રક)',
    badge: 'Title Chain & Encumbrances',
    purpose: 'The master chronological ledger recording every transaction, legal succession, sale deed, mortgage, court decree, and government notice affecting the land.',
    criticalFields: [
      'Mutation Entry Number (Nondh No.)',
      'Date of Entry & Date of Certification (Pramaanit)',
      'Nature of Mutation (Sale, Will, Inheritance, Bank Lien)',
      'Notice issuance under Section 135-D of Gujarat Land Revenue Code'
    ],
    investorAdvice: 'Look for "Pramaanit" (Certified) entries. Beware of "Kachhi Nondh" (provisional entries) or "Takrari Nondh" (disputed entries pending before the Mamlatdar or Deputy Collector).'
  },
  {
    id: 'form5',
    name: 'GTPUD Form 4 & Form 5 (Town Planning Reconstitution)',
    gujaratiName: 'નગર રચના યોજના ફોર્મ ૪ અને ૫',
    badge: 'Statutory Urban Allotment',
    purpose: 'Official gazetted Town Planning forms under GTPUD Act 1976 that reconstitute agricultural Original Plots (OP) into urban Final Plots (FP).',
    criticalFields: [
      'Original Plot (OP) Number & Original Area',
      'Final Plot (FP) Number & Sanctioned Final Area',
      'Statutory Infrastructure Deduction Ratio (40–50%)',
      'Town Planning Contribution / Incremental Value (Bettering Charges)'
    ],
    investorAdvice: 'Form 5 is the legal proof of Final Plot allotment in Dholera SIR. Without Form 5, an agricultural survey number cannot be physically demarcated inside a sanctioned Town Planning scheme.'
  }
];

const DUE_DILIGENCE_CHECKS = [
  { id: 1, text: 'Tenure Verification: Confirmed land is "Juni Sharat" (Old Tenure) or valid Collector NA order exists.' },
  { id: 2, text: '30-Year Title Search: Scrutinized VF-6 Mutation history for clean, unbroken hereditary or sale deed succession.' },
  { id: 3, text: 'Boja Mukti (Zero Encumbrance): Checked Column 12 of VF-7 for active agricultural bank loans, mortgages, or government attachments.' },
  { id: 4, text: 'No Pending Takrari Nondh: Verified no pending civil court stay, inheritance challenge, or revenue appeal under Section 135-D.' },
  { id: 5, text: 'GTPUD Form 5 Reconstitution: Confirmed the Final Plot (FP) number, area deduction percentage, and road alignment.' },
  { id: 6, text: 'Physical Access & Right of Way: Ground-checked that plot has legal access via sanctioned 12m–70m TP road, not blocked by water-logged mudflats.' },
  { id: 7, text: 'Digital RoR Barcode: Downloaded official tamper-proof digitally signed extract directly from AnyRoR Gujarat portal.' },
];

export default function AnyRoRDocumentExplorer() {
  const [activeTab, setActiveTab] = useState<string>('vf7');
  const [checkedItems, setCheckedItems] = useState<Record<number, boolean>>({ 1: true, 2: true });

  const currentDoc = REVENUE_DOCS.find(d => d.id === activeTab) || REVENUE_DOCS[0];

  function toggleCheck(id: number) {
    setCheckedItems(prev => ({ ...prev, [id]: !prev[id] }));
  }

  const completedCount = Object.values(checkedItems).filter(Boolean).length;

  return (
    <div className="space-y-12">
      {/* 1. OFFICIAL REVENUE DEED SHOWCASE HERO */}
      <div className="relative rounded-3xl overflow-hidden border border-amber-200/90 bg-white shadow-xl">
        <div className="relative h-72 sm:h-96 w-full">
          <Image
            src="/assets/showcase/dholera_land_records.jpg"
            alt="Official AnyRoR Gujarat 7/12 Land Records and Town Planning Blueprints"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-900/30 to-transparent" />
          
          {/* Top Badges */}
          <div className="absolute top-4 left-4 z-10 flex flex-wrap gap-2">
            <span className="px-3 py-1 rounded-full bg-amber-500/95 text-slate-950 font-black text-xs uppercase tracking-wider backdrop-blur-md shadow-sm flex items-center gap-1.5">
              <Stamp className="w-3.5 h-3.5" />
              <span>Gujarat Revenue Department (AnyRoR)</span>
            </span>
            <span className="px-3 py-1 rounded-full bg-white/95 text-slate-900 font-bold text-xs uppercase tracking-wider backdrop-blur-md">
              22 Dholera SIR Revenue Villages
            </span>
          </div>

          <div className="absolute bottom-5 left-5 right-5 z-10 text-white">
            <h2 className="text-xl sm:text-3xl font-black tracking-tight text-white drop-shadow-md">
              Statutory 7/12, 8A &amp; Form 5 Title Verification Manual
            </h2>
            <p className="text-xs sm:text-sm text-amber-100 font-medium mt-1 max-w-2xl line-clamp-2 drop-shadow">
              Master the legal anatomy of Gujarat revenue certificates, spot title defects before token payment, and cross-reference Town Planning allotments.
            </p>
          </div>
        </div>

        {/* Verification Authority Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-slate-100 bg-slate-50/70 p-4 border-t border-slate-100 text-center">
          <div className="p-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Total Revenue Villages</span>
            <span className="text-base sm:text-lg font-black text-slate-900">22 Villages</span>
            <span className="text-[10px] text-slate-500 block">Ahmedabad &amp; Botad Districts</span>
          </div>
          <div className="p-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Total Survey Parcels</span>
            <span className="text-base sm:text-lg font-black text-amber-800">18,161+</span>
            <span className="text-[10px] text-slate-500 block">Statutory Survey Numbers</span>
          </div>
          <div className="p-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Primary Risk Factor</span>
            <span className="text-base sm:text-lg font-black text-rose-700">New Tenure</span>
            <span className="text-[10px] text-slate-500 block">Requires Collector Clearance</span>
          </div>
          <div className="p-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">TP Reconstitution</span>
            <span className="text-base sm:text-lg font-black text-emerald-700">Form 4 &amp; 5</span>
            <span className="text-[10px] text-slate-500 block">GTPUD Act 1976 Sanctioned</span>
          </div>
        </div>
      </div>

      {/* 2. INTERACTIVE REVENUE DOCUMENT ANATOMY EXPLORER */}
      <section className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-amber-800 mb-1">
              <Scroll className="w-4 h-4 text-amber-700" />
              <span>Document Anatomy</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900">
              Anatomy of Gujarat Land Records (Interactive Guide)
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Select a revenue document to learn its critical inspection fields, legal significance, and red flags.
            </p>
          </div>

          {/* Doc Switcher Pills */}
          <div className="flex flex-wrap gap-1.5 p-1 bg-slate-100 rounded-2xl shrink-0">
            {REVENUE_DOCS.map((doc) => (
              <button
                key={doc.id}
                type="button"
                onClick={() => setActiveTab(doc.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer ${
                  activeTab === doc.id
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-slate-700 hover:text-slate-900 hover:bg-white/80'
                }`}
              >
                {doc.id.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Selected Doc Anatomy Card */}
        <div className="rounded-2xl bg-gradient-to-br from-amber-50/50 via-slate-50 to-orange-50/30 border border-amber-200 p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-200/80 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 px-2 py-0.5 rounded-md bg-amber-100 border border-amber-200">
                  {currentDoc.badge}
                </span>
                <span className="text-xs font-medium text-slate-500">{currentDoc.gujaratiName}</span>
              </div>
              <h4 className="text-lg font-black text-slate-900 mt-1">{currentDoc.name}</h4>
            </div>
            <a
              href="https://anyror.gujarat.gov.in"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-800 hover:text-amber-950 underline"
            >
              <span>Verify on AnyRoR Portal</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
            {currentDoc.purpose}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-xl p-4 border border-amber-100 space-y-2">
              <span className="text-xs font-bold text-slate-900 block">Critical Data Columns to Verify</span>
              <ul className="space-y-1.5 text-xs text-slate-600">
                {currentDoc.criticalFields.map((field, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>{field}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white rounded-xl p-4 border border-amber-100 space-y-2">
              <span className="text-xs font-bold text-slate-900 block flex items-center gap-1.5 text-amber-900">
                <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Legal Due Diligence Rule</span>
              </span>
              <p className="text-xs text-slate-600 leading-relaxed bg-amber-50/60 p-3 rounded-lg border border-amber-200/60">
                {currentDoc.investorAdvice}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. INTERACTIVE 7-POINT LAND FRAUD PREVENTION CHECKLIST */}
      <section className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-emerald-700 mb-1">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Investor Risk Shield</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900">
              Interactive 7-Point Land Title Due Diligence Checklist
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Click to check off verified items when scrutinizing any land parcel in Dholera SIR.
            </p>
          </div>

          <div className="px-4 py-2 rounded-2xl bg-slate-100 border border-slate-200 text-center shrink-0">
            <span className="text-[10px] font-bold uppercase text-slate-500 block">Title Verification Score</span>
            <span className="text-base font-black text-emerald-700">
              {completedCount} of {DUE_DILIGENCE_CHECKS.length} Verified
            </span>
          </div>
        </div>

        <div className="space-y-2.5">
          {DUE_DILIGENCE_CHECKS.map((check) => {
            const isChecked = Boolean(checkedItems[check.id]);
            return (
              <button
                key={check.id}
                type="button"
                onClick={() => toggleCheck(check.id)}
                className={`w-full p-4 rounded-xl border text-left text-xs sm:text-sm transition cursor-pointer flex items-start gap-3 ${
                  isChecked
                    ? 'bg-emerald-50/80 border-emerald-300 text-slate-900 shadow-2xs'
                    : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-600'
                }`}
              >
                <div className="mt-0.5 shrink-0">
                  {isChecked ? (
                    <CheckSquare className="w-5 h-5 text-emerald-600" />
                  ) : (
                    <Square className="w-5 h-5 text-slate-400" />
                  )}
                </div>
                <span className={isChecked ? 'font-semibold text-slate-900' : 'text-slate-600'}>
                  {check.text}
                </span>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}
