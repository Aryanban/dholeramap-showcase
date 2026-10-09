'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useApp } from '@/lib/store';
import type { UserProfile } from '@/lib/types';

export default function AuthModal() {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<UserProfile['role']>('broker');
  const [company, setCompany] = useState('');
  const [city, setCity] = useState('Ahmedabad');
  const setUser = useApp((s) => s.setUser);

  useEffect(() => {
    const handleOpen = (e: Event) => {
      const detail = (e as CustomEvent)?.detail;
      if (detail?.mode) setMode(detail.mode);
      setOpen(true);
    };
    window.addEventListener('dholera-open-auth', handleOpen);
    return () => window.removeEventListener('dholera-open-auth', handleOpen);
  }, []);

  if (!open) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const cleanEmail = email.trim() || 'user@dholeramap.com';
    const cleanName = name.trim() || cleanEmail.split('@')[0];
    const isOwner =
      cleanEmail.toLowerCase() === 'aryanbanc@gmail.com' ||
      cleanEmail.toLowerCase().includes('owner') ||
      cleanEmail.toLowerCase().includes('admin');

    const profile: UserProfile = {
      id: `usr-${Date.now().toString(36)}`,
      name: cleanName,
      email: cleanEmail,
      phone: phone.trim() || '+91 98250 12345',
      company: company.trim() || 'Independent Real Estate Advisory',
      city: city.trim() || 'Ahmedabad',
      role: isOwner ? 'owner' : role,
      unitPreference: 'sqyd',
      notificationsEnabled: true,
      createdAt: Date.now(),
    };

    setUser(profile);
    setOpen(false);
  }

  function handleDemoLogin(demoRole: 'owner' | 'broker' | 'investor') {
    const profile: UserProfile = {
      id: `usr-demo-${demoRole}`,
      name: demoRole === 'owner' ? 'Aryan Bansal (Super Administrator)' : demoRole === 'broker' ? 'Rajesh Patel (Advisory)' : 'Vikramaditya Singhania',
      email: demoRole === 'owner' ? 'aryanbanc@gmail.com' : `${demoRole}@dholeramap.com`,
      phone: demoRole === 'owner' ? '+91 98765 43210' : '+91 98250 88990',
      company: demoRole === 'owner' ? 'Dholera SIR GIS Authority' : demoRole === 'broker' ? 'Apex Land Advisory Dholera' : 'Singhania Real Estate Fund',
      city: 'Ahmedabad & Dholera SIR',
      role: demoRole,
      unitPreference: 'sqyd',
      notificationsEnabled: true,
      createdAt: Date.now(),
    };
    setUser(profile);
    setOpen(false);
  }

  return (
    <div className="fixed inset-0 z-[2000] grid place-items-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="fixed inset-0"
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 z-10 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <Image
              src="/logo.png"
              alt="PlotBook Logo"
              width={28}
              height={28}
              className="h-7 w-7 object-contain rounded"
            />
            <div>
              <h3 className="text-sm font-black text-slate-900 leading-tight">
                {mode === 'login' ? 'Sign In to PlotBook' : 'Create PlotBook Account'}
              </h3>
              <p className="text-[11px] text-slate-500">Official Dholera SIR Interactive GIS &amp; CRM</p>
            </div>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="w-7 h-7 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center transition cursor-pointer text-xs"
          >
            ✕
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex bg-slate-100 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setMode('login')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition ${
              mode === 'login' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setMode('signup')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition ${
              mode === 'signup' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Register Profile
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          {mode === 'signup' && (
            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Rajesh Patel"
                className="w-full h-9 rounded-xl border border-slate-200 px-3 text-xs outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                required
              />
            </div>
          )}

          <div>
            <label className="text-[11px] font-bold text-slate-700 block mb-1">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. rajesh@apexland.in"
              className="w-full h-9 rounded-xl border border-slate-200 px-3 text-xs outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              required
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-700 block mb-1">Mobile / WhatsApp Number</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 98250 12345"
              className="w-full h-9 rounded-xl border border-slate-200 px-3 text-xs outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {mode === 'signup' && (
            <>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Role / Profile</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as any)}
                    className="w-full h-9 rounded-xl border border-slate-200 px-2 text-xs outline-none bg-white focus:border-blue-500"
                  >
                    <option value="broker">Real Estate Broker</option>
                    <option value="investor">Land Investor</option>
                    <option value="developer">Builder / Developer</option>
                    <option value="owner">Landowner</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">City</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Ahmedabad"
                    className="w-full h-9 rounded-xl border border-slate-200 px-3 text-xs outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Company / Agency Name (Optional)</label>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="e.g. Dholera Land Consultants"
                  className="w-full h-9 rounded-xl border border-slate-200 px-3 text-xs outline-none focus:border-blue-500"
                />
              </div>
            </>
          )}

          <button
            type="submit"
            className="w-full h-9 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition cursor-pointer"
          >
            {mode === 'login' ? 'Sign In & Access Saved Plots' : 'Complete Registration'}
          </button>
        </form>

        {/* Quick Demo Credentials */}
        <div className="pt-3 border-t border-slate-100">
          <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider text-center mb-2">
            One-Click Instant Access
          </p>
          <div className="grid grid-cols-3 gap-1.5">
            <button
              type="button"
              onClick={() => handleDemoLogin('broker')}
              className="py-1.5 px-2 text-[10px] font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition cursor-pointer text-center"
            >
              Broker Demo
            </button>
            <button
              type="button"
              onClick={() => handleDemoLogin('investor')}
              className="py-1.5 px-2 text-[10px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition cursor-pointer text-center"
            >
              Investor Demo
            </button>
            <button
              type="button"
              onClick={() => handleDemoLogin('owner')}
              className="py-1.5 px-2 text-[10px] font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg transition cursor-pointer text-center"
            >
              Admin Demo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
