import React from 'react';
import Link from 'next/link';
import { Calculator, RefreshCw, FileCheck, FileSpreadsheet, Sliders } from 'lucide-react';

interface ToolCard {
  title: string;
  badge: string;
  badgeColor: string;
  description: string;
  features: string[];
  link: string;
  ctaText: string;
  icon: React.ReactNode;
}

const TOOLS: ToolCard[] = [
  {
    title: 'DGDCR 2024 FAR & Height Engine',
    badge: 'Statutory Regulations',
    badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
    description:
      'Instantly calculate permissible Base FSI, chargeable FSI, and Civil Aviation NOC height constraints for any plot based on abutting road width (12m to 250m).',
    features: ['Base vs Chargeable FAR', 'Setback boundary envelopes', 'Permitted land-use zoning'],
    link: '/guide',
    ctaText: 'Calculate FAR Rules',
    icon: <Calculator className="w-5 h-5 text-blue-600" />,
  },
  {
    title: 'OP to FP Reconstitution Calculator',
    badge: 'Town Planning Math',
    badgeColor: 'bg-amber-50 text-amber-800 border-amber-200',
    description:
      'Understand how original revenue survey parcels (OP) are reconstituted into Town Planning Final Plots (FP) with statutory 40–50% area deductions for infrastructure.',
    features: ['Original Plot vs Final Plot ratio', 'Statutory deduction estimates', 'Mutual nearest-neighbor pairing'],
    link: '/dholera-7-12-anyror-land-records',
    ctaText: 'Verify Deduction Ratio',
    icon: <RefreshCw className="w-5 h-5 text-amber-600" />,
  },
  {
    title: 'AnyRoR 7/12 Land Records Guide',
    badge: 'Revenue Due Diligence',
    badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    description:
      'Step-by-step verification guide for Gujarat revenue records (Village Form 7, 12, 8A, and Promulgation Registers) across all 22 Dholera SIR villages.',
    features: ['Khatiyan & mutation check', 'Tenure (New vs Old) clearance', 'Government encumbrance audit'],
    link: '/dholera-7-12-anyror-land-records',
    ctaText: 'Check 7/12 Records',
    icon: <FileCheck className="w-5 h-5 text-emerald-600" />,
  },
  {
    title: 'Executive PDF Dossier Generator',
    badge: 'Presentation Ready',
    badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
    description:
      'Generate institutional-grade investment reports in 3 curated visual themes (Investor Executive, DholeraMap Premium, Hebatpur Exemplar) with live vector QR codes.',
    features: ['High-res interactive snapshots', 'Statutory DGDCR audit table', 'Agent branding & RERA credentials'],
    link: '/map',
    ctaText: 'Generate Sample Dossier',
    icon: <FileSpreadsheet className="w-5 h-5 text-purple-600" />,
  },
];

export default function CadastralTools() {
  return (
    <section className="py-16 sm:py-24 bg-slate-50 border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold uppercase tracking-wider mb-3">
            <Sliders className="w-3.5 h-3.5 text-blue-600" />
            <span>Due Diligence &amp; Analytics Suite</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 leading-tight">
            Institutional Interactive Tools for Land Investors &amp; Brokers
          </h2>
          <p className="mt-3 text-base text-slate-600 leading-relaxed">
            Eliminate guesswork before purchasing land. Cross-reference municipal blueprints,
            calculate building potential under DGDCR 2024, and verify title legitimacy.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {TOOLS.map((tool) => (
            <div
              key={tool.title}
              className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs hover:shadow-lg hover:border-blue-300 transition duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0">
                    {tool.icon}
                  </div>
                  <span
                    className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${tool.badgeColor}`}
                  >
                    {tool.badge}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 leading-snug">
                  {tool.title}
                </h3>

                <p className="text-xs text-slate-600 mt-2.5 leading-relaxed">
                  {tool.description}
                </p>

                <ul className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-500">
                  {tool.features.map((f) => (
                    <li key={f} className="flex items-center gap-1.5 font-medium">
                      <span className="text-emerald-500">✓</span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100">
                <Link
                  href={tool.link}
                  className="w-full py-2.5 rounded-xl bg-slate-50 hover:bg-blue-600 hover:text-white text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5 transition border border-slate-200 hover:border-blue-600"
                >
                  <span>{tool.ctaText}</span>
                  <span>→</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
