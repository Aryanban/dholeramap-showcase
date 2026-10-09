'use client';

import React, { useState } from 'react';
import { MessageSquare, CheckCircle2 } from 'lucide-react';

interface Props {
  brokerName: string;
  brokerWhatsapp: string;
}

export default function BrokerInquiryForm({ brokerName, brokerWhatsapp }: Props) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [msg, setMsg] = useState('');
  const [sent, setSent] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const cleanNumber = brokerWhatsapp.replace(/\D/g, '');
    const inquiryText = msg.trim()
      ? msg.trim()
      : `Hello ${brokerName}, I am interested in exploring verified property plots in Dholera SIR from your showcase profile.`;
    const fullText = encodeURIComponent(
      `*Inquiry from DholeraMap:*\nInvestor: ${name} (${phone})\nMessage: ${inquiryText}`
    );
    window.open(`https://wa.me/${cleanNumber}?text=${fullText}`, '_blank');
    setSent(true);
  }

  if (sent) {
    return (
      <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center gap-3 mt-4">
        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
        <span className="text-xs font-bold">
          Your inquiry has been directed to {brokerName}&apos;s verified WhatsApp channel.
        </span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your Name"
          className="h-10 rounded-xl border border-slate-200 px-3 text-xs outline-none focus:border-blue-500 bg-white"
        />
        <input
          type="tel"
          required
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Your Phone / WhatsApp"
          className="h-10 rounded-xl border border-slate-200 px-3 text-xs outline-none focus:border-blue-500 bg-white"
        />
      </div>
      <textarea
        rows={3}
        value={msg}
        onChange={(e) => setMsg(e.target.value)}
        placeholder={`Hello ${brokerName}, I am interested in exploring investment plots in Dholera SIR. Please contact me.`}
        className="w-full rounded-xl border border-slate-200 p-3 text-xs outline-none focus:border-blue-500 bg-white leading-relaxed"
      />
      <button
        type="submit"
        className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition cursor-pointer flex items-center gap-2 shadow-xs"
      >
        <MessageSquare className="w-4 h-4" />
        <span>Inquire Directly with {brokerName}</span>
      </button>
    </form>
  );
}
