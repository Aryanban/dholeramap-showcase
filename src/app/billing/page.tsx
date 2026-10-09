'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import SiteHeader from '@/components/panels/SiteHeader';
import SiteFooter from '@/components/panels/SiteFooter';
import { initiateSubscriptionCheckout, initiateCreditPackCheckout } from '@/lib/razorpay';
import { useApp } from '@/lib/store';
import { useEntitlements } from '@/hooks/useEntitlements';
import { PLANS, TRIAL_DAYS, TRIAL_PDF_CAP } from '@/lib/entitlements';

export default function BillingPage() {
  const [busyTier, setBusyTier] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  /** Buyer's billing choice: recurring mandate (with discounts) or one month only. */
  const [recurring, setRecurring] = useState<boolean>(true);
  const user = useApp((s) => s.user);
  const ent = useEntitlements();

  async function handleCheckout(tier: 'pro' | 'max') {
    if (!user) {
      setToastMsg('Sign in to manage a subscription.');
      return;
    }
    setBusyTier(tier);
    try {
      await initiateSubscriptionCheckout({
        plan: tier,
        planName: tier === 'pro' ? 'Dealer Pro' : 'Enterprise Max',
        billingCycle: 'monthly',
        recurring,
        userEmail: user.email || '',
        userName: user.name || '',
        userPhone: user.phone || '',
        onSuccess: (paymentId) => {
          setToastMsg(
            recurring
              ? `Recurring ${tier.toUpperCase()} activated (${paymentId.slice(0, 14)}…). Auto-renews each cycle — cancel anytime.`
              : `${tier.toUpperCase()} unlocked for one month (${paymentId.slice(0, 14)}…). No auto-renewal.`
          );
          setBusyTier(null);
        },
        onFailure: (err) => {
          setToastMsg(`Checkout closed: ${err.message}`);
          setBusyTier(null);
        },
      });
    } catch (err) {
      setToastMsg(err instanceof Error ? err.message : 'Unable to connect to Razorpay.');
      setBusyTier(null);
    }
  }

  async function handleBuyCredits(credits: number) {
    if (!user) {
      setToastMsg('Sign in to buy credits.');
      return;
    }
    setBusyTier(`credits-${credits}`);
    try {
      await initiateCreditPackCheckout({
        credits,
        userEmail: user.email || '',
        userName: user.name || '',
        userPhone: user.phone || '',
        onSuccess: (n) => {
          setToastMsg(`${n} PDF credits added to your account.`);
          setBusyTier(null);
        },
        onFailure: (err) => {
          setToastMsg(`Checkout closed: ${err.message}`);
          setBusyTier(null);
        },
      });
    } catch (err) {
      setToastMsg(err instanceof Error ? err.message : 'Unable to connect to Razorpay.');
      setBusyTier(null);
    }
  }

  const planDef = PLANS[ent.plan];
  const periodEnd = useApp((s) => s.entitlements.periodEnd);
  const rolloverBank = useApp((s) => s.entitlements.rolloverBank);
  const credits = useApp((s) => s.entitlements.credits);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col font-sans">
      <SiteHeader activePage="billing" />

      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-[2000] p-4 bg-slate-900 text-white text-xs font-bold rounded-2xl shadow-2xl flex items-center gap-3">
          <span>{toastMsg}</span>
          <button onClick={() => setToastMsg(null)} className="text-slate-400 hover:text-white cursor-pointer">✕</button>
        </div>
      )}

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-950">Billing &amp; usage</h1>
          <p className="text-xs text-slate-500 mt-1">
            Your subscription, dossier quota and credits. Recurring mandates are handled by Razorpay; cancel anytime.
          </p>
        </div>

        {/* Current plan card */}
        <section className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-slate-900">{planDef.name}</h2>
                {ent.isTrialing && (
                  <span className="text-[10px] font-black uppercase tracking-wider bg-blue-100 text-blue-800 border border-blue-300 px-2 py-0.5 rounded-full">
                    Trial · {ent.trialDaysLeft}d left
                  </span>
                )}
                {ent.isMax && !ent.isTrialing && (
                  <span className="text-[10px] font-black uppercase tracking-wider bg-purple-100 text-purple-800 border border-purple-300 px-2 py-0.5 rounded-full">
                    Active
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {ent.isFree
                  ? 'You are on the free tier — map and search only.'
                  : `₹${planDef.priceInr.toLocaleString('en-IN')} / month${
                      periodEnd ? ` · renews ${new Date(periodEnd).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}` : ''
                    }`}
              </p>
            </div>
            {ent.isFree ? (
              <Link href="/pricing" className="self-start sm:self-auto px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs cursor-pointer">
                Choose a plan →
              </Link>
            ) : (
              <div className="flex flex-col sm:items-end gap-2">
                {!ent.isMax && (
                  <button
                    onClick={() => handleCheckout('max')}
                    disabled={busyTier === 'max'}
                    className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-xs cursor-pointer disabled:opacity-50"
                  >
                    {busyTier === 'max'
                      ? 'Opening…'
                      : recurring
                      ? `Upgrade to Max · ₹${PLANS.max.recurringPriceInr}/mo (Save ₹300)`
                      : `Upgrade to Max · ₹${PLANS.max.priceInr}/mo (1 Month)`}
                  </button>
                )}
                {/* Billing-mode choice: one-time month vs recurring mandate */}
                <div className="inline-flex rounded-xl border border-slate-200 bg-slate-50 p-0.5">
                  <button
                    type="button"
                    onClick={() => setRecurring(false)}
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                      !recurring ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    One-time · 1 month
                  </button>
                  <button
                    type="button"
                    onClick={() => setRecurring(true)}
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                      recurring ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Recurring monthly (Save ₹300)
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Quota meter */}
          {ent.isFree ? (
            <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200 text-xs text-blue-900">
              <strong className="block mb-0.5">Free tier limits</strong>
              View the map and search parcels. DGDCR analysis, saved plots, the CRM dashboard and dossier PDFs unlock on Dealer Pro.
              <Link href="/pricing" className="font-black underline ml-1">See plans</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {ent.isTrialing && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-[11px] font-semibold text-amber-800">
                  Free Trial includes all features with a strict <strong>{TRIAL_PDF_CAP} PDF dossier limit</strong>. Subscribe to lift the cap to {PLANS.pro.pdfsPerCycle}/month.
                </div>
              )}
              <QuotaBar
                label={`Included dossier PDFs this cycle (${ent.includedCap - ent.includedRemaining} of ${ent.includedCap} used)`}
                used={ent.includedCap - ent.includedRemaining}
                total={ent.includedCap}
              />
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-white border border-slate-200">
                  <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Rolled over</div>
                  <div className="text-lg font-black text-purple-700">{ent.isMax ? rolloverBank : 0}</div>
                  <div className="text-[10px] text-slate-500">
                    {ent.isMax ? `Unused included PDFs carry forward (cap ${PLANS.max.rolloverCap})` : 'Rollover is Enterprise Max'}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-white border border-slate-200">
                  <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Purchased credits</div>
                  <div className="text-lg font-black text-blue-700">{credits}</div>
                  <div className="text-[10px] text-slate-500">Never expire · ₹{ent.creditPriceInr} each</div>
                </div>
              </div>
              <div className="text-[11px] font-bold text-slate-700">
                Total available now: <span className="text-blue-700">{ent.pdfsAvailable}</span> PDF{ent.pdfsAvailable === 1 ? '' : 's'}
              </div>
            </div>
          )}
        </section>

        {/* Credit packs */}
        <section className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
          <div>
            <h2 className="text-base font-black text-slate-900">Top-up credits</h2>
            <p className="text-xs text-slate-500">
              Available to active Pro / Max subscribers only. {ent.canBuyCredits ? `Your rate: ₹${ent.creditPriceInr} per PDF.` : 'Subscribe to buy credits.'}
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[5, 10, 25, 50].map((n) => (
              <button
                key={n}
                onClick={() => handleBuyCredits(n)}
                disabled={busyTier === `credits-${n}` || !ent.canBuyCredits}
                className="p-4 rounded-2xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/40 transition text-center cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="text-2xl font-black text-slate-900">{n}</div>
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">credits</div>
                <div className="text-xs font-black text-blue-700 mt-1">
                  ₹{(n * (ent.canBuyCredits ? ent.creditPriceInr : PLANS.pro.creditPriceInr)).toLocaleString('en-IN')}
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Invoices / legacy */}
        <section className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-3">
          <h2 className="text-base font-black text-slate-900">Invoices &amp; receipts</h2>
          <p className="text-xs text-slate-500">
            GST-compliant invoices for each Razorpay charge are emailed to <strong>{user?.email || 'your account email'}</strong>.
            Need a copy or a mandate changed? Reach out from the contact page and quote your payment id.
          </p>
          <Link href="/contact" className="inline-flex px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 cursor-pointer">
            Contact billing support
          </Link>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}

function QuotaBar({ label, used, total }: { label: string; used: number; total: number }) {
  const pct = total > 0 ? Math.min(100, Math.round((used / total) * 100)) : 0;
  const remaining = Math.max(0, total - used);
  const low = remaining <= 2;
  return (
    <div>
      <div className="flex items-center justify-between text-[11px] font-bold mb-1">
        <span className="text-slate-700">{label}</span>
        <span className={low ? 'text-amber-700' : 'text-emerald-700'}>{remaining} left</span>
      </div>
      <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${low ? 'bg-amber-500' : 'bg-emerald-500'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
