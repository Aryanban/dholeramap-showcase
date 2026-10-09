'use client';

import React, { useState } from 'react';
import SiteHeader from '@/components/panels/SiteHeader';
import SiteFooter from '@/components/panels/SiteFooter';
import { Mail, Building2, Phone, Scale } from 'lucide-react';
import { useApp } from '@/lib/store';
import type { UserFeedback } from '@/lib/types';

export default function ContactPage() {
  const submitFeedback = useApp((s) => s.submitFeedback);
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [category, setCategory] = useState<UserFeedback['category']>('inquiry');
  const [message, setMessage] = useState('');
  const [submittedId, setSubmittedId] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !contact.trim() || !message.trim()) return;

    submitFeedback({
      name: name.trim(),
      contact: contact.trim(),
      category,
      message: message.trim(),
    });

    setSubmittedId(`TICK-${Date.now().toString(36).toUpperCase()}`);
    setName('');
    setContact('');
    setMessage('');
  }

  const SUPPORT_CHANNELS = [
    {
      title: 'Interactive Map & Scrutiny Support',
      desc: 'Form 4/5 survey boundary questions, road width verification, and map corrections.',
      email: 'aryanbanc@gmail.com',
      badge: 'GIS Desk',
    },
    {
      title: 'Broker Advisory & Listings Desk',
      desc: 'Brokerage onboarding, enterprise portfolio features, and investor shortlist syndication.',
      email: 'aryanbanc@gmail.com',
      badge: 'Advisory Desk',
    },
    {
      title: 'General Inquiries & Platform Feedback',
      desc: 'Feature requests, offline map export questions, and technical support.',
      email: 'aryanbanc@gmail.com',
      badge: 'Operations',
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col font-sans">
      <SiteHeader activePage="contact" />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Title */}
        <div className="space-y-4">
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
            Contact PlotBook Support &amp; GIS Operations
          </h1>
          {/* Direct-Answer Inverted Pyramid Box */}
          <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 text-xs sm:text-sm text-slate-700 leading-relaxed">
            <strong className="block text-xs uppercase tracking-wider font-black text-blue-900 mb-1">
              Official Support &amp; Grievance Redressal
            </strong>
            <p className="font-medium text-slate-900">
              PlotBook Dholera support desk provides assistance for survey plot verification, TP 1–6 road alignment inquiries, subscriber billing, and statutory grievance redressal. Our dedicated GIS engineers and Grievance Officer respond within 24–48 business hours via official email and phone.
            </p>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl leading-relaxed">
            Get in touch with the Dholera SIR Operations team for title scrutiny, town planning road alignment verification, broker inquiries, or platform feedback.
          </p>
        </div>

        {/* Support Channels */}
        <section className="space-y-4">
          <h2 className="text-lg font-black text-slate-900">Support Channels &amp; Helpdesks</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {SUPPORT_CHANNELS.map((ch) => (
              <div key={ch.title} className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-3 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-md inline-block mb-2">
                    {ch.badge}
                  </span>
                  <h3 className="text-sm font-black text-slate-900 leading-tight">{ch.title}</h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">{ch.desc}</p>
                </div>

                <a
                  href={`mailto:${ch.email}?subject=${encodeURIComponent(`DholeraMap — ${ch.title}`)}`}
                  className="inline-flex items-center gap-2 text-xs font-bold text-blue-600 hover:text-blue-800 transition"
                >
                  <Mail className="w-3.5 h-3.5 shrink-0" />
                  <span>{ch.email}</span>
                </a>
              </div>
            ))}
          </div>
        </section>

        {/* SLA Table (AEO) */}
        <section className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-3">
          <h2 className="text-base font-black text-slate-900">Official Support Turnaround SLAs</h2>
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-700 border-b border-slate-200 font-bold">
                  <th className="p-3">Department</th>
                  <th className="p-3">Primary Contact</th>
                  <th className="p-3">Turnaround SLA</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-600">
                <tr>
                  <td className="p-3 font-semibold text-slate-900">GIS &amp; Survey Scrutiny</td>
                  <td className="p-3 font-mono text-blue-600">aryanbanc@gmail.com</td>
                  <td className="p-3 font-semibold text-emerald-700">24 Business Hours</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-slate-900">Billing &amp; Tax Invoices</td>
                  <td className="p-3 font-mono text-blue-600">aryanbanc@gmail.com</td>
                  <td className="p-3 font-semibold text-emerald-700">12–24 Hours</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-slate-900">Grievance Redressal Officer</td>
                  <td className="p-3 font-mono text-blue-600">aryanbanc@gmail.com</td>
                  <td className="p-3 font-semibold text-emerald-700">48 Hours Statutory</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Official Merchant & Grievance Redressal Card (Razorpay & IT Act Compliance) */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-md inline-block mb-1">
              Registered Merchant &amp; Statutory Grievance Desk
            </span>
            <h2 className="text-lg font-black text-slate-900">Merchant Operations &amp; Nodal Office</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Statutory contact information in accordance with Rule 4(1)(a) of the Consumer Protection (E-Commerce) Rules, 2020 and IT Rules, 2021.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 text-xs text-slate-600">
            <div className="space-y-1.5">
              <strong className="text-slate-900 flex items-center gap-1.5 font-bold text-xs uppercase tracking-wide">
                <Building2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>Operational Address</span>
              </strong>
              <p className="leading-relaxed">
                DholeraMap Headquarters<br />
                Near Activation Area, Dholera SIR<br />
                Ahmedabad District, Gujarat — 382455, India
              </p>
            </div>

            <div className="space-y-1.5">
              <strong className="text-slate-900 flex items-center gap-1.5 font-bold text-xs uppercase tracking-wide">
                <Phone className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>Helpline &amp; Timings</span>
              </strong>
              <p className="leading-relaxed">
                <strong>Helpline:</strong> <a href="tel:+919825012345" className="text-blue-600 font-semibold">+91 98250 12345</a><br />
                <strong>Direct Desk:</strong> <a href="mailto:aryanbanc@gmail.com" className="text-blue-600 font-semibold">aryanbanc@gmail.com</a><br />
                <strong>Working Hours:</strong> Mon – Sat: 9:30 AM – 6:30 PM IST<br />
                <span className="text-[11px] text-slate-400">(Closed on National Holidays)</span>
              </p>
            </div>

            <div className="space-y-1.5">
              <strong className="text-slate-900 flex items-center gap-1.5 font-bold text-xs uppercase tracking-wide">
                <Scale className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>Designated Grievance Officer</span>
              </strong>
              <p className="leading-relaxed">
                <strong>Officer:</strong> Aryan Bansal<br />
                <strong>Designation:</strong> Nodal Grievance &amp; Compliance Officer<br />
                <strong>Email:</strong> <a href="mailto:aryanbanc@gmail.com?subject=Grievance%20Redressal" className="text-blue-600 font-semibold">aryanbanc@gmail.com</a><br />
                <strong>SLA:</strong> Acknowledgment within 24h, resolution within 48h
              </p>
            </div>
          </div>
        </div>

        {/* Feedback / Ticket Submission Form */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-lg font-black text-slate-900">Send an Inquiry or Report an Issue</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Submissions directly land in the Owner &amp; Administrator console for prompt review and resolution.
            </p>
          </div>

          {submittedId ? (
            <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 font-black text-xl flex items-center justify-center mx-auto">
                ✓
              </div>
              <h3 className="text-sm font-black text-emerald-900">Inquiry Submitted Successfully</h3>
              <p className="text-xs text-emerald-700 max-w-md mx-auto leading-relaxed">
                Your message has been assigned Ticket ID <code className="font-mono font-bold bg-white px-1.5 py-0.5 rounded border border-emerald-300">{submittedId}</code> and forwarded to the administrator console.
              </p>
              <button
                onClick={() => setSubmittedId(null)}
                className="mt-2 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition cursor-pointer"
              >
                Submit Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Your Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Vikramaditya Singhania"
                    className="w-full h-10 rounded-xl border border-slate-200 px-3 text-xs outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
                    required
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Email or Mobile Number</label>
                  <input
                    type="text"
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    placeholder="+91 98250 12345 or vikram@fund.com"
                    className="w-full h-10 rounded-xl border border-slate-200 px-3 text-xs outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Inquiry / Issue Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full h-10 rounded-xl border border-slate-200 px-3 text-xs outline-none bg-white focus:border-blue-500 transition"
                >
                  <option value="inquiry">Land Acquisition / Plot Inquiry</option>
                  <option value="data">Map Data or Road Width Correction</option>
                  <option value="bug">Map / Technical Bug Report</option>
                  <option value="feature">Feature or Dataset Request</option>
                  <option value="partnership">Brokerage &amp; Institutional Partnership</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Message &amp; Particulars</label>
                <textarea
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Describe your parcel requirements, survey number discrepancy, or feedback in detail..."
                  className="w-full p-3 text-xs rounded-xl border border-slate-200 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 resize-none transition"
                  required
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition active:scale-[0.98] cursor-pointer"
                >
                  Submit Inquiry to Admin
                </button>
              </div>
            </form>
          )}
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
