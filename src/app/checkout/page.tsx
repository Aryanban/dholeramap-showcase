// This page must stay a client component for the Razorpay payment flow, so
// route-level metadata cannot live here (a client module may not export
// `metadata`, and the 'use client' directive must come first). The sibling
// checkout/layout.tsx below carries the noindex directive for this route,
// and robots.txt disallows /checkout — which together keep this screen out
// of the index without duplicating the homepage title or canonical.
'use client';

import React, { useState } from 'react';
import SiteHeader from '@/components/panels/SiteHeader';
import SiteFooter from '@/components/panels/SiteFooter';
import RazorpayCheckoutButton from '@/components/payments/RazorpayCheckoutButton';
import {
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Lock,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export default function CheckoutPage() {
  const [amount, setAmount] = useState<number>(100);
  const [name, setName] = useState('Dholera Client');
  const [email, setEmail] = useState('investor@dholeramap.com');
  const [phone, setPhone] = useState('+919825012345');

  const [paymentResult, setPaymentResult] = useState<{
    success: boolean;
    order_id: string;
    payment_id: string;
    message: string;
  } | null>(null);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [dismissNotice, setDismissNotice] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col font-sans">
      <SiteHeader activePage="pricing" />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-12">
        {/* Header */}
        <div className="text-center max-w-xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs font-bold mb-3">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            Razorpay Standard Web Checkout
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Secure Payment Gateway
          </h1>
          <p className="text-sm text-slate-600 mt-2">
            Integrated with 256-bit encryption and cryptographic HMAC-SHA256 server verification.
          </p>
        </div>

        {/* Success Banner */}
        {paymentResult && (
          <div className="mb-8 p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 shadow-sm animate-in fade-in slide-in-from-top-3">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-black text-emerald-900">
                  Payment Verified Successfully!
                </h3>
                <p className="text-xs text-emerald-700 mt-1">
                  {paymentResult.message}
                </p>

                <div className="mt-4 p-4 rounded-xl bg-white border border-emerald-200 space-y-1.5 font-mono text-xs text-slate-800">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Razorpay Order ID:</span>
                    <span className="font-bold">{paymentResult.order_id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Razorpay Payment ID:</span>
                    <span className="font-bold text-emerald-700">{paymentResult.payment_id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Verification Status:</span>
                    <span className="font-bold text-emerald-600">HMAC-SHA256 Match (Valid)</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setPaymentResult(null)}
                  className="mt-4 text-xs font-bold text-emerald-800 hover:text-emerald-950 underline cursor-pointer"
                >
                  Make another transaction
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Error Notice */}
        {errorMessage && (
          <div className="mb-8 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Dismiss Notice */}
        {dismissNotice && (
          <div className="mb-8 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
            <span>{dismissNotice}</span>
          </div>
        )}

        {/* Checkout Card */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
          {/* Left Form: Amount & Customer Details */}
          <div className="md:col-span-3 space-y-6">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Select or Enter Amount (INR)
              </label>
              <div className="grid grid-cols-5 gap-2 mb-3">
                {[10, 100, 199, 500, 1000].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => {
                      setAmount(preset);
                      setPaymentResult(null);
                      setErrorMessage(null);
                    }}
                    className={`py-2 px-2.5 rounded-xl text-xs font-bold transition border cursor-pointer ${
                      amount === preset
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    ₹{preset}
                  </button>
                ))}
              </div>

              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
                  ₹
                </span>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={amount}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setAmount(val > 0 ? val : 1);
                    setPaymentResult(null);
                    setErrorMessage(null);
                  }}
                  className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  placeholder="Enter custom amount"
                />
              </div>
            </div>

            <div className="space-y-4 pt-2 border-t border-slate-100">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Customer Details (Prefill)
              </h3>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Summary & Pay Button */}
          <div className="md:col-span-2 flex flex-col justify-between p-5 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                <CreditCard className="w-4 h-4 text-blue-600" />
                Order Summary
              </div>

              <div className="space-y-2 text-xs border-b border-slate-200 pb-4">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span className="font-semibold text-slate-900">₹{amount.toLocaleString('en-IN')}.00</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Gateway Fee</span>
                  <span className="font-semibold text-emerald-600">FREE</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Amount in Paise</span>
                  <span className="font-mono text-slate-700">{(amount * 100).toLocaleString('en-IN')} paise</span>
                </div>
              </div>

              <div className="flex justify-between items-baseline pt-1">
                <span className="text-sm font-bold text-slate-900">Total Payable</span>
                <span className="text-2xl font-black text-blue-900">
                  ₹{amount.toLocaleString('en-IN')}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-100 text-[11px] text-blue-900 space-y-1">
                <div className="flex items-center gap-1.5 font-bold">
                  <Lock className="w-3.5 h-3.5 text-blue-700" />
                  Razorpay Modal Checkout
                </div>
                <p className="text-blue-700/80 leading-relaxed">
                  Opens UPI, NetBanking, Cards, and Wallets via standard checkout.js.
                </p>
              </div>
            </div>

            <div className="mt-6">
              <RazorpayCheckoutButton
                amount={amount}
                name="DholeraMap Portal"
                description={`Order for ₹${amount.toLocaleString('en-IN')}`}
                prefill={{
                  name,
                  email,
                  contact: phone,
                }}
                className="w-full py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                buttonText={`Proceed to Pay ₹${amount.toLocaleString('en-IN')}`}
                onSuccess={(result) => {
                  setErrorMessage(null);
                  setDismissNotice(null);
                  setPaymentResult(result);
                }}
                onFailure={(err) => {
                  setErrorMessage(err.message || 'Payment failed or signature invalid.');
                  setDismissNotice(null);
                }}
                onDismiss={() => {
                  setDismissNotice('Payment checkout was dismissed by the user.');
                }}
              />
            </div>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
