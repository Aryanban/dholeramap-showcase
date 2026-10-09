'use client';

import React from 'react';
import Link from 'next/link';
import { Lock } from 'lucide-react';
import { useEntitlements } from '@/hooks/useEntitlements';

interface PaywallProps {
  /** Which capability is gated, for the upgrade copy. */
  feature: 'details' | 'save' | 'export' | 'dashboard';
  /** Content to render when the user IS entitled (optional for pure lock UI). */
  children?: React.ReactNode;
  /** Compact inline variant (used inside the InfoPanel rows). */
  inline?: boolean;
  className?: string;
}

const COPY: Record<PaywallProps['feature'], { title: string; body: string }> = {
  details: {
    title: 'Unlock DGDCR plot analysis',
    body: 'FAR, height, setbacks, zone and road width for every parcel — upgrade to Dealer Pro.',
  },
  save: {
    title: 'Save plots to your CRM',
    body: 'Bookmark parcels, track deal intent and export a pipeline CSV with Dealer Pro.',
  },
  export: {
    title: 'Generate client dossiers',
    body: 'Branded PDF dossiers with DGDCR envelopes and WhatsApp sharing — Dealer Pro.',
  },
  dashboard: {
    title: 'Open your dealer dashboard',
    body: 'Saved plots, deal pipeline and registry vault are part of Dealer Pro.',
  },
};

/**
 * Renders children only when the user is entitled; otherwise shows a locked
 * teaser pointing at /pricing. Free users keep seeing plot identity + location
 * (it is what the SEO pages rank on) — this locks the analysis, not the map.
 */
export default function Paywall({ feature, children, inline, className }: PaywallProps) {
  const e = useEntitlements();
  if (!e.isFree) return <>{children}</>;

  const c = COPY[feature];

  if (inline) {
    return (
      <div
        className={`rounded-xl border border-dashed border-blue-300 bg-blue-50/70 p-3 sm:p-4 ${className || ''}`}
      >
        <div className="flex items-start gap-2.5">
          <Lock className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <div className="min-w-0 space-y-1">
            <h4 className="text-xs font-black text-blue-950 tracking-tight">{c.title}</h4>
            <p className="text-[11px] text-blue-900/80 leading-relaxed">{c.body}</p>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <Link
                href="/pricing#investor"
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-[10px] font-bold transition cursor-pointer shadow-xs"
              >
                Unlock for ₹199 (Investor Pass) <span aria-hidden>→</span>
              </Link>
              <Link
                href="/pricing"
                className="inline-flex items-center gap-1 text-[10px] font-semibold text-blue-800 hover:text-blue-950 underline"
              >
                Dealer Pro (From ₹900/mo)
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50/60 p-5 sm:p-6 ${className || ''}`}
    >
      <div className="flex items-start gap-3">
        <Lock className="w-6 h-6 text-blue-600 shrink-0 mt-0.5" />
        <div className="min-w-0 space-y-1.5">
          <h3 className="text-sm font-black text-blue-950 tracking-tight">{c.title}</h3>
          <p className="text-xs text-blue-900/80 leading-relaxed">{c.body}</p>
          <div className="flex flex-wrap items-center gap-2 pt-2">
            <Link
              href="/pricing#investor"
              className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition cursor-pointer shadow-sm"
            >
              Unlock for ₹199 (Investor Pass) <span aria-hidden>→</span>
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 text-xs font-bold transition cursor-pointer shadow-xs"
            >
              Dealer Pro from ₹900/mo <span aria-hidden>→</span>
            </Link>
            {e.isTrialExpired && (
              <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                7-day Free Trial ended · Upgrade to continue
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
