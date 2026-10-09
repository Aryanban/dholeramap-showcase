'use client';

import React from 'react';
import Link from 'next/link';
import { useEntitlements } from '@/hooks/useEntitlements';

interface QuotaGuardProps {
  /** Called after the server confirms a unit may be consumed. */
  onAllowed: () => Promise<void> | void;
  /** Content of the trigger button. */
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

/**
 * Guards a PDF-generating action behind the server-side quota. It POSTs to
 * /api/entitlements/consume-pdf and only fires onAllowed() when the server
 * says ok — so the included 10/30 caps cannot be bypassed in the browser.
 *
 * When the quota is exhausted it offers either credits (Pro/Max may buy them)
 * or an upgrade, instead of a dead-end error.
 */
export default function QuotaGuard({
  onAllowed,
  children,
  className,
  disabled,
}: QuotaGuardProps) {
  const e = useEntitlements();
  const [busy, setBusy] = React.useState(false);
  const [msg, setMsg] = React.useState<string | null>(null);

  async function handleClick() {
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch('/api/entitlements/consume-pdf', {
        method: 'GET',
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok) {
        await onAllowed();
        return;
      }
      if (data?.reason === 'upgrade_required') {
        setMsg('Upgrade to Dealer Pro to generate dossiers.');
      } else if (data?.reason === 'quota_exhausted') {
        setMsg(
          e.canBuyCredits
            ? 'Included PDFs exhausted — buy credits or upgrade to Enterprise Max.'
            : 'Included PDFs exhausted — upgrade for more.'
        );
      } else {
        setMsg('Could not verify your quota right now. Please try again.');
      }
    } catch {
      setMsg('Network error while checking quota. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-1.5 items-stretch">
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled || busy}
        className={className}
      >
        {busy ? 'Checking quota…' : children}
      </button>
      {msg && (
        <div className="text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-1 rounded-lg flex items-center justify-between gap-2">
          <span>{msg}</span>
          <Link href="/pricing" className="font-black underline whitespace-nowrap">
            Upgrade
          </Link>
        </div>
      )}
    </div>
  );
}
