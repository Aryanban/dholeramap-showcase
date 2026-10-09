'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import SiteHeader from '@/components/panels/SiteHeader';
import SiteFooter from '@/components/panels/SiteFooter';
import { ShieldCheck, CreditCard, Zap } from 'lucide-react';
import { initiateSubscriptionCheckout, initiateCreditPackCheckout } from '@/lib/razorpay';
import { useApp } from '@/lib/store';
import { useEntitlements } from '@/hooks/useEntitlements';
import { PLANS, TRIAL_DAYS, TRIAL_PDF_CAP } from '@/lib/entitlements';

export default function PricingPage() {
  const [busyTier, setBusyTier] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  /** Buyer's billing choice: recurring mandate (with discounts) or one-time month. */
  const [recurring, setRecurring] = useState<boolean>(true);
  const user = useApp((s) => s.user);
  const ent = useEntitlements();

  async function handleCheckout(tier: 'investor' | 'pro' | 'max') {
    if (!user) {
      setToastMsg('Sign in to purchase — your access travels with your account.');
      return;
    }
    setBusyTier(tier);
    try {
      await initiateSubscriptionCheckout({
        plan: tier,
        planName:
          tier === 'investor'
            ? 'Investor Pass'
            : tier === 'pro'
            ? 'Dealer Pro'
            : 'Enterprise Max',
        billingCycle: 'monthly',
        recurring: tier === 'investor' ? false : recurring,
        userEmail: user.email || '',
        userName: user.name || '',
        userPhone: user.phone || '',
        onSuccess: (paymentId) => {
          setToastMsg(
            tier === 'investor'
              ? `Investor Due-Diligence Pass unlocked (Payment ${paymentId.slice(0, 14)}…). DGDCR zoning & 1 dossier PDF unlocked for 30 days!`
              : recurring
              ? `Recurring ${tier.toUpperCase()} activated (Payment ${paymentId.slice(0, 14)}…). It auto-renews each cycle — cancel anytime from /billing.`
              : `${tier.toUpperCase()} unlocked for one month (Payment ${paymentId.slice(0, 14)}…). No auto-renewal — resubscribe anytime.`
          );
          setBusyTier(null);
          // Reload after a moment so Clerk hydrates the new metadata into the store
          setTimeout(() => {
            window.location.reload();
          }, 1200);
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

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col font-sans">
      <SiteHeader activePage="pricing" />

      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-[2000] p-4 bg-slate-900 text-white text-xs font-bold rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in">
          <span>{toastMsg}</span>
          <button onClick={() => setToastMsg(null)} className="text-slate-400 hover:text-white cursor-pointer">✕</button>
        </div>
      )}

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold">
            <span>Official Interactive CRM &amp; Land Registry</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-950">
            Pricing for Property Dealers &amp; Investors
          </h1>
          <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 text-xs sm:text-sm text-slate-700 leading-relaxed text-left">
            <strong className="block text-xs uppercase tracking-wider font-black text-blue-900 mb-1">
              PlotBook Subscription Framework
            </strong>
            <p className="font-medium text-slate-900">
              Free forever for viewing and searching the Dholera SIR interactive map. Dealer Pro unlocks plot analysis,
              saved plots, the CRM dashboard and client dossier PDFs. Enterprise Max adds white-label branding,
              print-quality maps, premium templates, and a larger monthly quota that rolls over.
            </p>
          </div>
        </div>

        {/* 7-Day Trial Banner */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-md">
                {TRIAL_DAYS}-Day Free Trial
              </span>
              <span className="text-xs font-semibold text-blue-100">Sign-in required · 2 PDF credits · No card needed</span>
            </div>
            <p className="text-xs text-blue-50 pt-1">
              Sign in or create an account to instantly activate the <strong>Free Trial</strong>. Unlocks <strong>all features and everything</strong> — DGDCR zoning &amp; FAR clearance, saved plots CRM, high-DPI map renders, white-label branding, and <strong>{TRIAL_PDF_CAP} PDF dossier credits</strong>!
            </p>
          </div>
          {ent.isFree ? (
            <Link
              href="/sign-in"
              className="self-start sm:self-auto px-4 py-2 rounded-xl bg-white text-blue-700 text-xs font-bold hover:bg-blue-50 transition shadow-xs cursor-pointer whitespace-nowrap"
            >
              {ent.isTrialExpired ? 'Trial ended — subscribe' : 'Start free trial'} →
            </Link>
          ) : (
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <span className="text-xs font-bold bg-white/15 px-3 py-2 rounded-xl whitespace-nowrap">
                {ent.isTrialing
                  ? `${ent.trialDaysLeft} day${ent.trialDaysLeft === 1 ? '' : 's'} left · ${ent.pdfsAvailable} PDF${ent.pdfsAvailable === 1 ? '' : 's'} available`
                  : 'Plan active'}
              </span>
            </div>
          )}
        </div>

        {/* Pricing Section */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <h2 className="text-xl font-black text-slate-900 text-center sm:text-left">
              Subscription Tiers &amp; Pricing Plans
            </h2>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-black self-center sm:self-auto animate-pulse">
              <span>⚡ Flat ₹100 OFF on Pro · Flat ₹300 OFF on Max with Recurring!</span>
            </div>
          </div>

          {/* Billing-mode choice: one-time month vs recurring mandate */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3.5 rounded-2xl bg-white border-2 border-blue-500/30 shadow-xs">
            <div className="text-xs text-slate-600">
              <strong className="text-slate-900 block sm:inline">Choose billing mode:</strong>{' '}
              {recurring ? (
                <span className="text-emerald-700 font-bold">
                  ✓ Recurring Monthly active: Flat ₹100 OFF on Pro (₹900/mo) and Flat ₹300 OFF on Max (₹2,200/mo). Auto-renews; cancel anytime.
                </span>
              ) : (
                <span>
                  One-time pass: Pay once for 30 days of access. No auto-renewal. (Switch to Recurring to save up to ₹300/mo!)
                </span>
              )}
            </div>
            <div className="inline-flex rounded-xl border border-slate-200 bg-slate-100 p-1 self-start sm:self-auto shrink-0">
              <button
                type="button"
                onClick={() => setRecurring(true)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-black transition cursor-pointer flex items-center gap-1.5 ${
                  recurring
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>Recurring monthly</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-sm ${recurring ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-800'}`}>
                  Save ₹300
                </span>
              </button>
              <button
                type="button"
                onClick={() => setRecurring(false)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  !recurring
                    ? 'bg-slate-800 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                One-time · 1 month
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* 1. Free */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="space-y-1">
                  <h3 className="text-lg font-black text-slate-900">Interactive Free</h3>
                  <p className="text-xs text-slate-500">For casual land buyers &amp; exploratory research</p>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl sm:text-4xl font-black text-slate-900">₹0</span>
                  <span className="text-xs text-slate-400 font-medium">/ lifetime</span>
                </div>
                <ul className="space-y-2.5 text-xs text-slate-600 pt-2 border-t border-slate-100">
                  <li className="flex items-center gap-2"><span className="text-emerald-600 font-bold">✓</span><span>Full 60 FPS vector tile blueprints (TP 1–6)</span></li>
                  <li className="flex items-center gap-2"><span className="text-emerald-600 font-bold">✓</span><span>Search 18,161 revenue survey parcels</span></li>
                  <li className="flex items-center gap-2"><span className="text-emerald-600 font-bold">✓</span><span>Plot number &amp; location on click</span></li>
                  <li className="flex items-center gap-2 text-slate-400"><span>✕</span><span className="line-through">DGDCR FAR &amp; zoning analysis</span></li>
                  <li className="flex items-center gap-2 text-slate-400"><span>✕</span><span className="line-through">Save plots &amp; CRM dashboard</span></li>
                  <li className="flex items-center gap-2 text-slate-400"><span>✕</span><span className="line-through">Dossier PDF generation</span></li>
                </ul>
              </div>
              <Link href="/" className="w-full py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold text-center hover:bg-slate-50 transition cursor-pointer">
                Start Free Map
              </Link>
            </div>

            {/* 2. Investor Pass (One-Time) */}
            <div id="investor" className="p-6 rounded-3xl bg-gradient-to-b from-amber-50/60 to-white border-2 border-amber-500 shadow-xl flex flex-col justify-between space-y-6 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-amber-600 text-white text-[10px] font-black uppercase tracking-wider shadow-sm whitespace-nowrap">
                For Land Buyers &amp; NRIs
              </div>
              <div className="space-y-4">
                <div className="space-y-1">
                  <h3 className="text-lg font-black text-slate-900">Investor Pass</h3>
                  <p className="text-xs text-slate-500">For individual buyers verifying 1–2 plots</p>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl sm:text-4xl font-black text-slate-900">₹{PLANS.investor.priceInr.toLocaleString('en-IN')}</span>
                  <span className="text-xs text-slate-500 font-medium">/ 30-day pass</span>
                </div>
                <div className="inline-block px-2.5 py-1 rounded-lg bg-amber-100/70 border border-amber-200 text-amber-900 text-[10px] font-black uppercase tracking-wider">
                  One-time · No auto-renew
                </div>
                <ul className="space-y-2.5 text-xs text-slate-700 pt-2 border-t border-slate-100">
                  <li className="flex items-center gap-2"><span className="text-amber-600 font-bold">✓</span><strong>1 Official 15-Page Dossier PDF</strong> included</li>
                  <li className="flex items-center gap-2"><span className="text-amber-600 font-bold">✓</span><span>DGDCR FAR, max height, setbacks &amp; zoning for all plots</span></li>
                  <li className="flex items-center gap-2"><span className="text-amber-600 font-bold">✓</span><span>OP vs FP 50% deduction &amp; net buildable area check</span></li>
                  <li className="flex items-center gap-2"><span className="text-amber-600 font-bold">✓</span><span>Save up to 5 plots to shortlist and compare</span></li>
                  <li className="flex items-center gap-2"><span className="text-amber-600 font-bold">✓</span><span>Top-up credits available at ₹{PLANS.investor.creditPriceInr} each</span></li>
                  <li className="flex items-center gap-2 text-slate-400"><span>✕</span><span className="line-through">No dealer branding or CRM (personal use)</span></li>
                </ul>
              </div>
              <button
                onClick={() => handleCheckout('investor')}
                disabled={busyTier === 'investor'}
                className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition shadow-md cursor-pointer disabled:opacity-50"
              >
                {busyTier === 'investor'
                  ? 'Opening Razorpay…'
                  : ent.plan === 'investor'
                  ? 'Current plan · Active'
                  : 'Unlock for ₹199 · One-Time'}
              </button>
            </div>

            {/* 3. Dealer Pro (Popular) */}
            <div className="p-6 rounded-3xl bg-white border-2 border-blue-600 shadow-xl flex flex-col justify-between space-y-6 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-black uppercase tracking-wider shadow-sm">
                Most Popular for Brokers
              </div>
              <div className="space-y-4">
                <div className="space-y-1">
                  <h3 className="text-lg font-black text-slate-900">Dealer Pro</h3>
                  <p className="text-xs text-slate-500">For active real estate brokers &amp; land advisors</p>
                </div>
                {recurring ? (
                  <div className="space-y-1">
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl sm:text-4xl font-black text-blue-600">
                        ₹{PLANS.pro.recurringPriceInr.toLocaleString('en-IN')}
                      </span>
                      <span className="text-sm text-slate-400 line-through font-semibold">
                        ₹{PLANS.pro.priceInr.toLocaleString('en-IN')}
                      </span>
                      <span className="text-xs text-slate-500 font-medium">/ month</span>
                    </div>
                    <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-black tracking-wide">
                      ⚡ Flat ₹100 OFF with Recurring Mandate
                    </div>
                  </div>
                ) : (
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl sm:text-4xl font-black text-slate-900">
                      ₹{PLANS.pro.priceInr.toLocaleString('en-IN')}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">/ month (one-time)</span>
                  </div>
                )}
                <ul className="space-y-2.5 text-xs text-slate-700 pt-2 border-t border-slate-100">
                  <li className="flex items-center gap-2"><span className="text-blue-600 font-bold">✓</span><strong>{PLANS.pro.pdfsPerCycle} dossier PDFs / month</strong> (unused reset monthly)</li>
                  <li className="flex items-center gap-2"><span className="text-blue-600 font-bold">✓</span><span>DGDCR FAR, height, setbacks &amp; zoning for every plot</span></li>
                  <li className="flex items-center gap-2"><span className="text-blue-600 font-bold">✓</span><span>Unlimited saved plots &amp; CRM dashboard</span></li>
                  <li className="flex items-center gap-2"><span className="text-blue-600 font-bold">✓</span><span>Contact block on dossiers + WhatsApp sharing</span></li>
                  <li className="flex items-center gap-2"><span className="text-blue-600 font-bold">✓</span><span>IndexedDB registry vault &amp; encrypted backup</span></li>
                  <li className="flex items-center gap-2"><span className="text-blue-600 font-bold">✓</span><span>Top-up credits at ₹{PLANS.pro.creditPriceInr} each</span></li>
                  <li className="flex items-center gap-2"><span className="text-blue-600 font-bold">✓</span><span>Use on {PLANS.pro.seats} devices</span></li>
                </ul>
              </div>
              <button
                onClick={() => handleCheckout('pro')}
                disabled={busyTier === 'pro'}
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-md cursor-pointer disabled:opacity-50"
              >
                {busyTier === 'pro'
                  ? 'Opening Razorpay…'
                  : ent.isPro && !ent.isTrialing
                  ? 'Current plan · Resubscribe'
                  : recurring
                  ? `Subscribe at ₹${PLANS.pro.recurringPriceInr}/mo (Save ₹100)`
                  : `Pay once · ₹${PLANS.pro.priceInr.toLocaleString('en-IN')} for 1 month`}
              </button>
            </div>

            {/* 3. Enterprise Max */}
            <div className="p-6 rounded-3xl bg-gradient-to-b from-purple-50/60 to-white border-2 border-purple-500 shadow-xl flex flex-col justify-between space-y-6 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-purple-600 text-white text-[10px] font-black uppercase tracking-wider shadow-sm">
                Best Value per PDF
              </div>
              <div className="space-y-4">
                <div className="space-y-1">
                  <h3 className="text-lg font-black text-slate-900">Enterprise Max</h3>
                  <p className="text-xs text-slate-500">For syndicates, funds &amp; top agencies</p>
                </div>
                {recurring ? (
                  <div className="space-y-1">
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl sm:text-4xl font-black text-purple-700">
                        ₹{PLANS.max.recurringPriceInr.toLocaleString('en-IN')}
                      </span>
                      <span className="text-sm text-slate-400 line-through font-semibold">
                        ₹{PLANS.max.priceInr.toLocaleString('en-IN')}
                      </span>
                      <span className="text-xs text-slate-500 font-medium">/ month</span>
                    </div>
                    <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-100 text-purple-800 border border-purple-200 text-[10px] font-black tracking-wide">
                      ⚡ Flat ₹300 OFF with Recurring Mandate
                    </div>
                  </div>
                ) : (
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl sm:text-4xl font-black text-slate-900">
                      ₹{PLANS.max.priceInr.toLocaleString('en-IN')}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">/ month (one-time)</span>
                  </div>
                )}
                <ul className="space-y-2.5 text-xs text-slate-700 pt-2 border-t border-slate-100">
                  <li className="flex items-center gap-2"><span className="text-purple-600 font-bold">✓</span><strong>{PLANS.max.pdfsPerCycle} dossier PDFs / month</strong> — <strong className="text-purple-700">unused roll over</strong> (capped at {PLANS.max.rolloverCap})</li>
                  <li className="flex items-center gap-2"><span className="text-purple-600 font-bold">✓</span><strong>Full white-label branding</strong> — your logo, agency name, no PlotBook credit</li>
                  <li className="flex items-center gap-2"><span className="text-purple-600 font-bold">✓</span><strong>High-DPI print-quality</strong> map renders</li>
                  <li className="flex items-center gap-2"><span className="text-purple-600 font-bold">✓</span><strong>Premium dossier templates</strong> &amp; investor-grade annexures</li>
                  <li className="flex items-center gap-2"><span className="text-purple-600 font-bold">✓</span><span>Top-up credits at <strong>₹{PLANS.max.creditPriceInr} each</strong> (never expire)</span></li>
                  <li className="flex items-center gap-2"><span className="text-purple-600 font-bold">✓</span><span>Everything in Pro · up to {PLANS.max.seats} team devices</span></li>
                </ul>
              </div>
              <button
                onClick={() => handleCheckout('max')}
                disabled={busyTier === 'max'}
                className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition shadow-md cursor-pointer disabled:opacity-50"
              >
                {busyTier === 'max'
                  ? 'Opening Razorpay…'
                  : ent.isMax && !ent.isTrialing
                  ? 'Current plan · Active'
                  : recurring
                  ? `Subscribe at ₹${PLANS.max.recurringPriceInr}/mo (Save ₹300)`
                  : `Pay once · ₹${PLANS.max.priceInr.toLocaleString('en-IN')} for 1 month`}
              </button>
            </div>
          </div>

          {/* Savings callout: why Max over Pro */}
          <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-200 text-xs sm:text-sm text-purple-950 leading-relaxed">
            <strong className="block text-xs uppercase tracking-wider font-black text-purple-700 mb-1">
              Why dealers pick Max
            </strong>
            <p className="font-medium">
              {PLANS.max.pdfsPerCycle} PDFs at ₹{PLANS.max.priceInr.toLocaleString('en-IN')} is about <strong>₹{Math.round(PLANS.max.priceInr / PLANS.max.pdfsPerCycle)} per dossier</strong> versus
              ₹{Math.round(PLANS.pro.priceInr / PLANS.pro.pdfsPerCycle)} on Pro — and Max quota that you don&rsquo;t use stays yours, so a slow month is never money lost. White-label dossiers
              also keep your agency front-of-mind with every client you send one to.
            </p>
          </div>
        </section>

        {/* Credit Packs */}
        <section className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
            <div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900">Top-up credit packs</h2>
              <p className="text-xs text-slate-500">
                Only for active Pro / Max subscribers. Credits never expire. {ent.canBuyCredits ? `You pay ₹${ent.creditPriceInr} each.` : 'Upgrade to buy.'}
              </p>
            </div>
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
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">PDF credits</div>
                <div className="text-xs font-black text-blue-700 mt-1">
                  ₹{(n * (ent.canBuyCredits ? ent.creditPriceInr : PLANS.pro.creditPriceInr)).toLocaleString('en-IN')}
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Comparison Matrix */}
        <section className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
          <h2 className="text-lg sm:text-xl font-black text-slate-900">Plan feature comparison matrix</h2>
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-700 border-b border-slate-200 font-bold">
                  <th className="p-3">Feature capability</th>
                  <th className="p-3">Free</th>
                  <th className="p-3">Dealer Pro</th>
                  <th className="p-3">Enterprise Max</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-600">
                <Row label="Map view + parcel search" v={['✓ Unlimited', '✓ Unlimited', '✓ Unlimited']} strong />
                <Row label="DGDCR analysis (FAR, zone, setbacks)" v={['✕ Locked', '✓', '✓']} />
                <Row label="Save plots & CRM dashboard" v={['✕', '✓ Unlimited', '✓ Unlimited']} />
                <Row label="Dossier PDFs / month" v={['—', `${PLANS.pro.pdfsPerCycle} (reset monthly)`, `${PLANS.max.pdfsPerCycle} + rollover (cap ${PLANS.max.rolloverCap})`]} />
                <Row label="Credit price per extra PDF" v={['—', `₹${PLANS.pro.creditPriceInr}`, `₹${PLANS.max.creditPriceInr}`]} />
                <Row label="Branding on dossiers" v={['—', 'Contact block only', 'Full white-label, no credit']} />
                <Row label="Map render quality" v={['—', 'Standard', 'High-DPI print']} />
                <Row label="Premium templates" v={['—', '✕', '✓']} />
                <Row label="Devices" v={['1', '2', '5']} />
                <Row label="Monthly recurring rate" v={['Free', `₹${PLANS.pro.recurringPriceInr}/mo (Flat ₹100 OFF)`, `₹${PLANS.max.recurringPriceInr}/mo (Flat ₹300 OFF)`]} strong />
                <Row label="One-time month rate" v={['Free', `₹${PLANS.pro.priceInr}/mo`, `₹${PLANS.max.priceInr}/mo`]} />
                <Row label="Free trial" v={[`${TRIAL_DAYS} days · ${TRIAL_PDF_CAP} PDF credits (All features)`, 'Includes trial', 'Includes trial']} />
              </tbody>
            </table>
          </div>
        </section>

        {/* Payment & Privacy */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-base font-black text-slate-900">Payment &amp; privacy guarantees</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-600">
            <div className="space-y-1.5">
              <strong className="text-slate-900 flex items-center gap-1.5 font-bold text-xs uppercase tracking-wide">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>Local-First Privacy (IndexedDB)</span>
              </strong>
              <span>Your uploaded title deeds, 7/12 extracts, and purchase prices remain on your local device. They are never uploaded to public cloud servers.</span>
            </div>
            <div className="space-y-1.5">
              <strong className="text-slate-900 flex items-center gap-1.5 font-bold text-xs uppercase tracking-wide">
                <CreditCard className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>Razorpay Recurring Mandates</span>
              </strong>
              <span>Recurring subscriptions run through UPI autopay (GPay, PhonePe, Paytm, BHIM) and cards. Cancel anytime from the billing portal; access continues to the end of the paid cycle.</span>
            </div>
            <div className="space-y-1.5">
              <strong className="text-slate-900 flex items-center gap-1.5 font-bold text-xs uppercase tracking-wide">
                <Zap className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>Instant Activation &amp; Invoices</span>
              </strong>
              <span>Quota activates the moment Razorpay confirms. GST-compliant invoices are available in the /billing portal.</span>
            </div>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}

function Row({ label, v, strong }: { label: string; v: [string, string, string]; strong?: boolean }) {
  return (
    <tr>
      <td className={`p-3 ${strong ? 'font-bold text-slate-900' : 'font-semibold text-slate-900'}`}>{label}</td>
      {v.map((cell, i) => (
        <td key={i} className={`p-3 ${cell.startsWith('✓') ? 'text-emerald-600 font-bold' : cell.startsWith('✕') ? 'text-slate-300' : 'text-slate-600'}`}>
          {cell}
        </td>
      ))}
    </tr>
  );
}
