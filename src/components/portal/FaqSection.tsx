'use client';

import React, { useState } from 'react';
import { HelpCircle, ChevronDown } from 'lucide-react';

interface FaqItem {
  q: string;
  a: string;
}

const FAQS: FaqItem[] = [
  {
    q: 'What is Dholera SIR and what authority regulates it?',
    a: 'Dholera SIR (Special Investment Region) is a 920 sq km master-planned greenfield industrial smart city in Gujarat, India. It is governed statutorily by the Dholera Special Investment Region Development Authority (DSIRDA) under the Gujarat SIR Act 2009. Trunk infrastructure is implemented by Dholera Industrial City Development Limited (DICDL).',
  },
  {
    q: 'What is the difference between Survey Number (OP) and Final Plot (FP)?',
    a: 'An Original Plot (OP) corresponds to the historic agricultural revenue survey number recorded in village revenue records (AnyRoR 7/12). Under Gujarat Town Planning legislation, when a TP scheme is sanctioned, the government reconstitutes these lands, typically deducting 40% to 50% of the land area to build roads, utility corridors, and social infrastructure. The resulting demarcated parcel allotted back to the owner is the Final Plot (FP), which is clear-titled and Non-Agricultural (NA).',
  },
  {
    q: 'How does DholeraMap ensure parcel accuracy?',
    a: 'DholeraMap digitizes the statutory, sanctioned Town Planning blueprint sheets issued by DSIRDA using high-resolution CRS.Simple deep-zoom tile pyramids. Every boundary, abutting road width, and DGDCR zoning rule is indexed directly from gazetted plans across all 22 revenue villages.',
  },
  {
    q: 'Can I generate customized investment dossiers for clients?',
    a: 'Yes! DholeraMap offers 3 bespoke PDF Dossier themes: Investor Executive, DholeraMap Premium, and Hebatpur Exemplar. You can customize asking prices, add private remarks, attach revenue documents, and embed your own agency name, logo, contact number, and RERA registration.',
  },
  {
    q: 'Which TP schemes are in the Activation Area?',
    a: 'The initial 22.5 sq km Activation Area is located in Town Planning Scheme 1 (TP 1) and Town Planning Scheme 2 (TP 2A). It features complete underground utility corridors, automated SCADA monitoring, dual-supply potable/recycled water, and hosts major anchors like the Tata Semiconductor Mega-Fab.',
  },
];

export default function FaqSection() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <section className="py-16 sm:py-24 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold uppercase tracking-wider mb-3">
            <HelpCircle className="w-3.5 h-3.5 text-blue-600" />
            <span>Frequently Asked Questions</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 leading-tight">
            Everything You Need to Know About Dholera Land &amp; Maps
          </h2>
          <p className="mt-3 text-base text-slate-600 max-w-2xl mx-auto">
            Clear answers to common questions about statutory town planning, survey numbers,
            reconstitution deductions, and land investment in Dholera SIR.
          </p>
        </div>

        <div className="space-y-3">
          {FAQS.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={faq.q}
                className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-2xs transition"
              >
                <button
                  type="button"
                  onClick={() => setOpenIdx(isOpen ? null : idx)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between gap-4 font-bold text-slate-900 hover:text-blue-600 transition cursor-pointer text-sm sm:text-base"
                >
                  <span>{faq.q}</span>
                  <span
                    className={`w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center transition-transform shrink-0 ${
                      isOpen ? 'rotate-180 bg-blue-50 text-blue-600' : 'text-slate-500'
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </span>
                </button>

                {isOpen && (
                  <div className="px-6 pb-5 pt-1 text-slate-600 text-xs sm:text-sm leading-relaxed border-t border-slate-100 animate-in fade-in duration-200">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
