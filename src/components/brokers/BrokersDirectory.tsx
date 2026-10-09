'use client';

/**
 * BrokersDirectory — the interactive half of /brokers.
 *
 * This used to be the whole page. It seeded `useState([])` and filled the list
 * in a `useEffect` fetch, so the HTML Google received contained zero broker
 * names, zero RERA numbers and zero links to /brokers/[id]. The directory is
 * now seeded by the server page via `initialBrokers`, so the crawlable markup
 * ships in the first response and hydration then upgrades it with live
 * spend-based ranking, filtering and paid boosting.
 */

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Phone,
  MessageCircle,
  Crown,
  Award,
  Sparkles,
  ShieldCheck,
  ArrowRight,
  TrendingUp,
  Lock,
  Zap,
} from 'lucide-react';
import {
  getRankedBrokers,
  getUserBrokerProfile,
  type BrokerProfile,
} from '@/lib/brokers';
import { useEntitlements } from '@/hooks/useEntitlements';
import { useUser } from '@clerk/nextjs';
import { initiateAdBoostCheckout } from '@/lib/razorpay';

const SCHEMES = ['All', 'TP 1', 'TP 2', 'TP 3', 'TP 4', 'TP 5', 'TP 6'];

export default function BrokersDirectory({
  initialBrokers,
}: {
  initialBrokers: BrokerProfile[];
}) {
  const ent = useEntitlements();
  const canSeeSpend = ent.isPro || ent.isMax || ent.isAdmin;
  const { user: clerkUser } = useUser();
  const [brokers, setBrokers] = useState<BrokerProfile[]>(initialBrokers);
  const [userBroker, setUserBroker] = useState<BrokerProfile | null>(null);
  const [selectedScheme, setSelectedScheme] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [biddingBroker, setBiddingBroker] = useState<BrokerProfile | null>(null);
  const [bidAmount, setBidAmount] = useState<number>(2500);
  const [bidBusy, setBidBusy] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  async function fetchRanking() {
    try {
      const res = await fetch('/api/brokers/ranking');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.brokers) && data.brokers.length > 0) {
          setBrokers(data.brokers);
          const myProfile =
            (clerkUser ? data.brokers.find((b: BrokerProfile) => b.id === clerkUser.id) : null) ||
            getUserBrokerProfile();
          setUserBroker(myProfile);
          return;
        }
      }
    } catch {
      // Keep the server-rendered ranking already on screen.
    }
    setBrokers(getRankedBrokers());
    setUserBroker(getUserBrokerProfile());
  }

  useEffect(() => {
    fetchRanking();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clerkUser?.publicMetadata?.adBoostTotal, clerkUser?.id]);

  function handleOpenBid(broker: BrokerProfile) {
    if (!canSeeSpend) return;
    if (!clerkUser) {
      setToastMessage('Sign in to a Pro or Max account to place an outrank bid.');
      setTimeout(() => setToastMessage(null), 5000);
      return;
    }
    setBiddingBroker(broker);
    // Suggest the smallest bid that lifts the signed-in user's own profile
    // above the broker they are targeting.
    const mine = userBroker || getUserBrokerProfile();
    const diff = broker.totalMonthlySpend - mine.totalMonthlySpend;
    setBidAmount(Math.max(1000, diff + 1));
  }

  /**
   * Places a real outrank bid: a Razorpay checkout whose signature is verified
   * server-side before a single rupee of ad spend is credited. The rank only
   * moves once the payment is confirmed, and the boost always applies to the
   * signed-in user's own directory profile.
   */
  async function handleApplyBid() {
    if (!biddingBroker || bidAmount <= 0 || bidBusy) return;
    if (!clerkUser) {
      setToastMessage('Sign in to a Pro or Max account to place an outrank bid.');
      setTimeout(() => setToastMessage(null), 5000);
      return;
    }
    setBidBusy(true);
    try {
      await initiateAdBoostCheckout({
        amountInr: bidAmount,
        userEmail: clerkUser.primaryEmailAddress?.emailAddress || '',
        userName: clerkUser.fullName || userBroker?.name || '',
        userPhone: userBroker?.phone || '',
        onSuccess: async (result) => {
          // This only runs after the server verified the payment, so the
          // boost is real money. Refresh authoritative server ranking.
          await fetchRanking();
          const freshList = getRankedBrokers();
          const myIdx = freshList.findIndex((b) => b.id === 'user-broker');
          const newRank = myIdx >= 0 ? myIdx + 1 : 1;
          setToastMessage(
            result.alreadyRecorded
              ? `Payment already applied — you are Rank #${newRank}.`
              : `✅ Payment verified! +₹${result.boostApplied.toLocaleString(
                  'en-IN'
                )} added. You are now Rank #${newRank}.`
          );
          setTimeout(() => setToastMessage(null), 6000);
          setBiddingBroker(null);
        },
        onFailure: (err) => {
          setToastMessage(`❌ Payment failed: ${err.message}`);
          setTimeout(() => setToastMessage(null), 6000);
        },
      });
    } catch (err) {
      setToastMessage(`❌ ${err instanceof Error ? err.message : 'Payment failed'}`);
      setTimeout(() => setToastMessage(null), 6000);
    } finally {
      setBidBusy(false);
    }
  }

  const filteredBrokers = brokers.filter((b) => {
    if (selectedScheme !== 'All' && !b.tpSchemes.some((s) => s.includes(selectedScheme))) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        b.name.toLowerCase().includes(q) ||
        b.agency.toLowerCase().includes(q) ||
        b.headOffice.toLowerCase().includes(q) ||
        b.propertyTypes.some((p) => p.toLowerCase().includes(q)) ||
        b.reraNumber.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  return (
    <>
      {/* Search & TP Scheme Filter Controls */}
      <section className="max-w-6xl mx-auto px-4 mb-6">
        <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
            <span className="text-xs font-bold text-slate-400 mr-1 shrink-0">Scheme:</span>
            {SCHEMES.map((scheme) => (
              <button
                key={scheme}
                onClick={() => setSelectedScheme(scheme)}
                aria-pressed={selectedScheme === scheme}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                  selectedScheme === scheme
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {scheme}
              </button>
            ))}
          </div>

          <div className="w-full md:w-72 relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search broker, firm, or area…"
              aria-label="Search Dholera SIR brokers by name, agency, RERA number or area"
              className="w-full h-8 pl-8 pr-3 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition font-medium"
            />
            <svg
              className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-400 pointer-events-none"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </section>

      {/* Verified Brokers Directory Grid (Dynamic Spend-Ranked) */}
      <section className="max-w-6xl mx-auto px-4">
        {filteredBrokers.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500">
            <div className="text-3xl mb-2">🔍</div>
            <p className="text-sm font-bold text-slate-800">No brokers found matching your filter</p>
            <p className="text-xs mt-1">Try switching to &ldquo;All&rdquo; schemes or clearing your search keywords.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredBrokers.map((broker, idx) => {
              const rank = idx + 1;
              return (
                <div
                  key={broker.id}
                  className={`p-5 rounded-3xl bg-white border transition duration-200 flex flex-col justify-between shadow-xs ${
                    rank === 1
                      ? 'border-amber-300 ring-2 ring-amber-100 hover:border-amber-400'
                      : rank === 2
                      ? 'border-blue-300 hover:border-blue-400'
                      : 'border-slate-200 hover:border-blue-300'
                  }`}
                >
                  <div className="space-y-3.5">
                    {/* Top Rank Ribbon & Verified Badge */}
                    <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-100">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            rank === 1
                              ? 'bg-amber-100 text-amber-950 border border-amber-300'
                              : rank === 2
                              ? 'bg-blue-100 text-blue-900 border border-blue-200'
                              : 'bg-slate-100 text-slate-700 border border-slate-200'
                          }`}
                        >
                          {rank === 1 && <Crown className="w-3 h-3 text-amber-600 shrink-0" />}
                          {rank === 2 && <Award className="w-3 h-3 text-blue-600 shrink-0" />}
                          {rank > 2 && <Sparkles className="w-3 h-3 text-slate-400 shrink-0" />}
                          <span>
                            Rank #{rank} · {rank === 1 ? 'Top Sponsor' : rank <= 3 ? 'Featured Partner' : 'Verified'}
                          </span>
                        </span>

                        {broker.properties && broker.properties.length > 0 && (
                          <span className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
                            {broker.properties.length} Properties
                          </span>
                        )}
                      </div>

                      <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full shrink-0">
                        <ShieldCheck className="w-3 h-3 text-emerald-600" />
                        <span>RERA Verified</span>
                      </span>
                    </div>


                    {/* Agency Header with Photo / Monogram */}
                    <div className="flex items-start gap-3">
                      {broker.photoUrl ? (
                        <div className="w-14 h-14 rounded-2xl overflow-hidden border border-slate-200 shadow-2xs shrink-0 bg-slate-100">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={broker.photoUrl}
                            alt={`${broker.name} — Dholera SIR real estate agent`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div
                          className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${broker.logoColor} text-white flex items-center justify-center font-black text-base shadow-2xs shrink-0`}
                        >
                          {broker.logoInitial}
                        </div>
                      )}

                      <div className="min-w-0 flex-1">
                        <Link
                          href={`/brokers/${broker.id}`}
                          className="text-base sm:text-lg font-black text-slate-900 hover:text-blue-600 transition tracking-tight leading-snug block truncate"
                        >
                          {broker.agency}
                        </Link>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-xs font-semibold text-blue-700 truncate">
                            {broker.name}
                          </span>
                          <span className="text-slate-300">•</span>
                          <span className="text-[11px] text-slate-500 font-medium shrink-0">
                            {broker.experienceYears}+ Yrs Active
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-slate-600 leading-relaxed font-normal line-clamp-2">
                      {broker.description}
                    </p>

                    {/* Badges / Schemes & Land Types */}
                    <div className="flex flex-wrap gap-1.5 pt-0.5">
                      {broker.tpSchemes.map((s) => (
                        <span
                          key={s}
                          className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-md"
                        >
                          {s}
                        </span>
                      ))}
                      {broker.propertyTypes.slice(0, 2).map((pt) => (
                        <span
                          key={pt}
                          className="text-[10px] font-medium text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md truncate max-w-[170px]"
                        >
                          {pt}
                        </span>
                      ))}
                    </div>


                    {/* RERA and Office info */}
                    <div className="pt-2.5 border-t border-slate-100 space-y-1 text-[11px] text-slate-600">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-slate-400 font-medium shrink-0">RERA Registration:</span>
                        <span className="font-mono font-bold text-slate-800 truncate text-right">
                          {broker.reraNumber}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-slate-400 font-medium shrink-0">Direct Contact:</span>
                        <span className="font-mono font-bold text-blue-700">{broker.phone}</span>
                      </div>
                    </div>
                    {/* Dynamic Spend & Bidding (Gated to Pro / Max only) */}
                    {canSeeSpend ? (
                      <div className="mt-3 p-3 rounded-2xl bg-gradient-to-r from-blue-50/70 to-indigo-50/70 border border-blue-200/80 space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-900 flex items-center gap-1">
                            <TrendingUp className="w-3 h-3 text-blue-600" />
                            <span>Verified Monthly Investment</span>
                          </span>
                          <span className="text-xs font-black text-blue-700 font-mono">
                            ₹{broker.totalMonthlySpend.toLocaleString('en-IN')}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-500 flex items-center justify-between font-medium">
                          <span>Ad Bid: ₹{broker.adSpend.toLocaleString('en-IN')}</span>
                          <span>Sub: ₹{broker.subscriptionSpend.toLocaleString('en-IN')}</span>
                          <span>Credits: ₹{broker.creditsSpend.toLocaleString('en-IN')}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleOpenBid(broker)}
                          className="w-full py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] flex items-center justify-center gap-1 transition shadow-xs cursor-pointer"
                        >
                          <Sparkles className="w-3 h-3 text-amber-300" />
                          <span>{broker.id === 'user-broker' ? 'Boost My Rank' : 'Outrank Broker / Place Bid'}</span>
                        </button>
                      </div>
                    ) : (
                      <div className="mt-3 p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-600 flex items-center gap-1">
                            <Lock className="w-3 h-3 text-slate-400" />
                            <span>Monthly Bid &amp; Spend</span>
                          </span>
                          <span className="text-[10px] font-bold text-slate-400 font-mono bg-slate-200/70 px-2 py-0.5 rounded-md">
                            •••••• (Pro/Max Only)
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500">
                          Broker ranking positions are determined by monthly platform spend. Exact bid analytics are restricted to Pro &amp; Max subscribers.
                        </p>
                        <Link
                          href="/pricing"
                          className="w-full mt-1 py-1.5 rounded-xl bg-slate-900 hover:bg-blue-600 text-white font-bold text-[11px] flex items-center justify-center gap-1 transition shadow-xs cursor-pointer"
                        >
                          <Crown className="w-3 h-3 text-amber-400" />
                          <span>Unlock Bidding &amp; Outranking</span>
                        </Link>
                      </div>
                    )}
                  </div>


                  {/* Action Buttons: View Profile, Call, WhatsApp */}
                  <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
                    <Link
                      href={`/brokers/${broker.id}`}
                      className="w-full h-10 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-[0.98] shadow-xs cursor-pointer"
                    >
                      <span>View Profile &amp; Properties</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>

                    <div className="grid grid-cols-2 gap-2">
                      <a
                        href={`tel:${broker.phone}`}
                        className="h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-[0.98] cursor-pointer"
                      >
                        <Phone className="w-3.5 h-3.5 shrink-0" />
                        <span>Call</span>
                      </a>
                      <a
                        href={`https://wa.me/${broker.whatsapp}?text=${encodeURIComponent(
                          `Hello ${broker.name}, I discovered your verified listing on DholeraMap.com. I would like to inquire about plot and land investment opportunities in Dholera SIR.`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="h-9 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition active:scale-[0.98] cursor-pointer"
                      >
                        <MessageCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>WhatsApp</span>
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[2200] max-w-md bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 text-xs font-bold flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Bidding & Outrank Modal (Pro & Max Exclusive) */}
      {biddingBroker && (
        <div className="fixed inset-0 z-[2100] grid place-items-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="fixed inset-0" onClick={() => setBiddingBroker(null)} aria-hidden="true" />
          <div className="relative w-full max-w-lg rounded-3xl bg-white shadow-2xl border border-slate-200 p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-black">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">Place Outrank Bid</h3>
                  <p className="text-[11px] text-slate-500">Live platform auction for top placement in Dholera SIR directory.</p>
                </div>
              </div>
              <button
                onClick={() => setBiddingBroker(null)}
                className="w-8 h-8 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 cursor-pointer flex items-center justify-center font-bold"
                aria-label="Close bidding dialog"
              >
                ✕
              </button>
            </div>



            {/* Target Broker Summary */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block">
                    Outranking
                  </span>
                  <span className="text-sm font-black text-slate-900">{biddingBroker.agency}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block">
                    Their Rank
                  </span>
                  <span className="text-sm font-black text-blue-700">
                    #{brokers.findIndex((b) => b.id === biddingBroker.id) + 1}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between text-[11px] font-medium text-slate-600 pt-2 border-t border-slate-200">
                <span>Their monthly investment</span>
                <span className="font-mono font-bold text-slate-800">
                  ₹{biddingBroker.totalMonthlySpend.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Custom Bid Amount */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5" htmlFor="bid-amount">
                Your Outrank Bid Amount (₹)
              </label>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500">Custom Bid: ₹</span>
                <input
                  id="bid-amount"
                  type="number"
                  min={500}
                  step={500}
                  value={bidAmount}
                  disabled={bidBusy}
                  onChange={(e) => setBidAmount(Math.max(0, Number(e.target.value)))}
                  className="flex-1 h-9 rounded-xl border border-slate-200 px-3 text-xs font-black text-slate-900 outline-none focus:border-blue-500 disabled:opacity-50"
                />
              </div>
              {bidAmount < 500 && (
                <p className="text-[10px] text-rose-600 font-bold mt-1">Minimum boost amount is ₹500.</p>
              )}
            </div>


            {/* Estimated Projected Rank */}
            <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-200 text-xs flex items-center justify-between">
              <div>
                <span className="font-bold text-blue-900 block">Your Projected Total Monthly Spend:</span>
                <span className="text-[11px] text-blue-700">
                  ₹{((userBroker || getUserBrokerProfile()).totalMonthlySpend + bidAmount).toLocaleString('en-IN')} (Includes +₹{bidAmount.toLocaleString('en-IN')} Boost)
                </span>
              </div>
              <span className="px-2.5 py-1 rounded-lg bg-blue-600 text-white font-black text-xs">
                Instant Rank Boost
              </span>
            </div>

            <p className="text-[10px] text-slate-400 text-center">
              Secure checkout via Razorpay (UPI, Cards, NetBanking). Your rank updates only after the payment is cryptographically verified.
            </p>

            <div className="pt-1 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setBiddingBroker(null)}
                disabled={bidBusy}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApplyBid}
                disabled={bidBusy || bidAmount < 500}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed text-white text-xs font-black shadow-md transition flex items-center gap-1.5 cursor-pointer"
              >
                {bidBusy ? (
                  <span className="flex items-center gap-1.5">
                    <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>
                    Processing payment…
                  </span>
                ) : (
                  <>
                    <Zap className="w-3.5 h-3.5 text-amber-300" />
                    <span>Pay ₹{bidAmount.toLocaleString('en-IN')} &amp; Boost Rank</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

