'use client';

import React, { useState } from 'react';
import { Copy, Check, BookOpen, Quote, FileCode, CheckCircle2 } from 'lucide-react';

interface CitationFormat {
  id: string;
  name: string;
  text: string;
}

const CITATIONS: CitationFormat[] = [
  {
    id: 'apa',
    name: 'APA (7th ed.)',
    text: `Bansal, A. (2026). Dholera SIR Cadastral Land Records & Town Planning Reconstitution Study (v2.4) [Dataset & Whitepaper]. DholeraMap Open Cadastre Initiative. https://dholeramap.com/dholera-sir-land-records-master-plan-whitepaper`,
  },
  {
    id: 'bibtex',
    name: 'BibTeX',
    text: `@dataset{bansal_dholera_cadastre_2026,
  author       = {Bansal, Aryan},
  title        = {Dholera SIR Cadastral Land Records \\& Town Planning Reconstitution Study},
  year         = {2026},
  version      = {2.4},
  publisher    = {DholeraMap Open Cadastre Initiative},
  url          = {https://dholeramap.com/dholera-sir-land-records-master-plan-whitepaper},
  doi          = {10.5281/zenodo.dholera-cadastre-2026},
  note         = {Cadastral spatial analysis across 22 villages and 27 Town Planning sub-schemes}
}`,
  },
  {
    id: 'mla',
    name: 'MLA (9th ed.)',
    text: `Bansal, Aryan. "Dholera SIR Cadastral Land Records & Town Planning Reconstitution Study." DholeraMap Open Cadastre Initiative, Oct. 2026, dholeramap.com/dholera-sir-land-records-master-plan-whitepaper.`,
  },
  {
    id: 'chicago',
    name: 'Chicago (17th ed.)',
    text: `Bansal, Aryan. 2026. "Dholera SIR Cadastral Land Records & Town Planning Reconstitution Study." DholeraMap Open Cadastre Initiative. October 2026. https://dholeramap.com/dholera-sir-land-records-master-plan-whitepaper.`,
  },
  {
    id: 'harvard',
    name: 'Harvard',
    text: `Bansal, A., 2026. Dholera SIR Cadastral Land Records & Town Planning Reconstitution Study (v2.4). DholeraMap Open Cadastre Initiative. Available at: <https://dholeramap.com/dholera-sir-land-records-master-plan-whitepaper> [Accessed ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}].`,
  },
];

export default function CitationBox() {
  const [activeFormat, setActiveFormat] = useState<string>('apa');
  const [copied, setCopied] = useState<boolean>(false);

  const selectedCitation = CITATIONS.find((c) => c.id === activeFormat) || CITATIONS[0];

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(selectedCitation.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      // Fallback
      setCopied(false);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-7 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider mb-1">
            <Quote className="w-3.5 h-3.5" />
            <span>Academic &amp; Media Citation Reference</span>
          </div>
          <h3 className="text-lg font-bold text-slate-900">
            Cite this Research Whitepaper &amp; Dataset
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Published under Creative Commons Attribution 4.0 International (CC BY 4.0).
            Free to cite, share, and redistribute with credit to DholeraMap.
          </p>
        </div>

        {/* Copy Button */}
        <button
          onClick={handleCopy}
          className={`inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition shadow-xs shrink-0 cursor-pointer ${
            copied
              ? 'bg-emerald-600 text-white hover:bg-emerald-700'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
          title="Copy formatted citation to clipboard"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 text-emerald-100" />
              <span>Copied to Clipboard!</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              <span>Copy Citation</span>
            </>
          )}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pt-4 pb-3 scrollbar-none">
        {CITATIONS.map((cit) => (
          <button
            key={cit.id}
            onClick={() => setActiveFormat(cit.id)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition whitespace-nowrap cursor-pointer ${
              activeFormat === cit.id
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            {cit.name}
          </button>
        ))}
      </div>

      {/* Citation Box Body */}
      <div className="relative mt-1">
        <pre className="p-4 rounded-xl bg-slate-900 text-slate-100 text-xs font-mono leading-relaxed overflow-x-auto whitespace-pre-wrap selection:bg-blue-500 selection:text-white border border-slate-800">
          {selectedCitation.text}
        </pre>
      </div>

      {/* License & Data Access Notice */}
      <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-200/60">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            <strong>Open Access:</strong> Re-use authorized for news reports, academic papers, and market feasibility studies.
          </span>
        </div>
        <div className="font-mono text-[11px] text-slate-500 shrink-0">
          DOI: 10.5281/zenodo.dholera-cadastre-2026
        </div>
      </div>
    </div>
  );
}
