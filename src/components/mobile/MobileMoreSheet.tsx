'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { X, Home, LayoutDashboard, Users, Code2, Settings, HelpCircle, Bell, FileText } from 'lucide-react';
import { useApp } from '@/lib/store';
import { useClerkReady } from '@/components/providers/ClerkGate';
export default function MobileMoreSheet() {
  const open = useApp((s) => s.mobileMoreOpen);
  const setMobileMoreOpen = useApp((s) => s.setMobileMoreOpen);
  const notifications = useApp((s) => s.notifications);
  const markNotifsRead = useApp((s) => s.markNotifsRead);
  const bookmarks = useApp((s) => s.bookmarks);
  const clerkReady = useClerkReady();
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setMobileMoreOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, setMobileMoreOpen]);
  // Show the sign-in CTA for anonymous visitors even when Clerk is mounted.
  // Same cookie heuristic ClerkGate uses, so no Clerk hook is needed here.
  const [hasSession, setHasSession] = useState(false);
  useEffect(() => {
    if (!open) return;
    try {
      setHasSession(document.cookie.includes('__session') || document.cookie.includes('__client_uat'));
    } catch {
      setHasSession(false);
    }
  }, [open]);
  const showSignIn = !clerkReady || !hasSession;
  if (!open) return null;
  const close = () => setMobileMoreOpen(false);
  return (
    <div className="md:hidden fixed inset-0 z-[1140]" role="dialog" aria-modal="true" aria-label="More options">
      <div className="absolute inset-0 bg-slate-950/40" onClick={close} />
      <div className="absolute inset-x-0 bottom-0 bg-white rounded-t-3xl shadow-2xl max-h-[82dvh] flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-200" style={{ marginBottom: 'calc(64px + env(safe-area-inset-bottom))' }}>
        <div className="pt-2 flex justify-center shrink-0"><div className="w-10 h-1.5 rounded-full bg-slate-300" /></div>
        <div className="flex items-center justify-between px-4 py-2 shrink-0">
          <h2 className="text-[15px] font-black text-slate-900">Menu</h2>
          <button onClick={close} aria-label="Close menu" className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500"><X className="w-4 h-4" /></button>
        </div>
        <div className="flex-1 overflow-y-auto px-3 pb-4 space-y-1">
          <div className="rounded-2xl border border-slate-200 overflow-hidden">
            <div className="px-3.5 py-2 bg-slate-50 flex items-center justify-between">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5"><Bell className="w-3.5 h-3.5" /> Notifications</span>
              {notifications.filter((n) => !n.read).length > 0 ? (<button onClick={markNotifsRead} className="text-[11px] font-bold text-blue-600">Mark read</button>) : null}
            </div>
            <div className="divide-y divide-slate-100 max-h-44 overflow-y-auto">
              {notifications.length === 0 ? (<p className="p-3 text-xs text-slate-400">No notifications.</p>) : notifications.slice(0,5).map((n) => (
                <div key={n.id} className="px-3.5 py-2.5">
                  <p className="text-[13px] font-bold text-slate-900">{n.title}</p>
                  <p className="text-[12px] text-slate-500 leading-snug mt-0.5">{n.message}</p>
                </div>
              ))}
            </div>
          </div>
          <MenuLink href="/" icon={<Home className="w-5 h-5" />} title="Home portal" sub="Guides, prices, TP explorer" onClick={close} />
          <MenuLink href="/dashboard" icon={<LayoutDashboard className="w-5 h-5" />} title="Saved plots CRM" sub={bookmarks.length ? bookmarks.length + ' saved' : 'Dashboard'} onClick={close} />
          <MenuLink href="/brokers" icon={<Users className="w-5 h-5" />} title="Brokers" sub="Verified consultants" onClick={close} />
          <MenuLink href="/embed" icon={<Code2 className="w-5 h-5" />} title="Embed map" sub="Free widget" onClick={close} />
          <MenuLink href="/guide" icon={<FileText className="w-5 h-5" />} title="DGDCR guide" sub="FAR, setbacks, rules" onClick={close} />
          <MenuLink href="/settings" icon={<Settings className="w-5 h-5" />} title="Settings" sub="Profile & prefs" onClick={close} />
          <MenuLink href="/contact" icon={<HelpCircle className="w-5 h-5" />} title="Support" sub="Help & feedback" onClick={close} />
          {showSignIn ? (
            <Link href="/sign-in" onClick={close} className="flex items-center justify-center w-full py-3 rounded-2xl bg-slate-900 text-white text-sm font-bold mt-2">Sign in / Register</Link>
          ) : null}
        </div>
      </div>
    </div>
  );
}
function MenuLink({ href, icon, title, sub, onClick }: any) {
  return (
    <Link href={href} onClick={onClick} className="flex items-center gap-3 p-3 rounded-2xl border border-slate-200 bg-white active:bg-slate-50">
      <span className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">{icon}</span>
      <span className="flex-1 min-w-0"><span className="block text-[14px] font-bold text-slate-900">{title}</span><span className="block text-[12px] text-slate-500 truncate">{sub}</span></span>
      <span className="text-slate-300 font-bold text-lg">›</span>
    </Link>
  );
}
