'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '@/lib/store';

export default function NotificationCenter() {
  const [open, setOpen] = useState(false);
  const notifications = useApp((s) => s.notifications);
  const markNotifsRead = useApp((s) => s.markNotifsRead);
  const hydrateNotifications = useApp((s) => s.hydrateNotifications);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    hydrateNotifications();
  }, [hydrateNotifications]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    window.addEventListener('mousedown', handleClick);
    return () => window.removeEventListener('mousedown', handleClick);
  }, [open]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  function timeAgo(ms: number) {
    const diff = Date.now() - ms;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  }

  return (
    <div className="relative shrink-0" ref={dropdownRef}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Notifications"
        className="relative inline-flex items-center justify-center w-9 h-9 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 transition cursor-pointer"
        title="Notifications & System Announcements"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 10-12 0v3.2a2 2 0 01-.6 1.4L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-rose-600 px-1 text-[9px] font-extrabold text-white shadow-xs animate-in zoom-in-75">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 max-w-[92vw] rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden z-[1300] animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                Notifications
              </h3>
              {unreadCount > 0 && (
                <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-1.5 py-0.2 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markNotifsRead}
                className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 transition cursor-pointer"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                No notifications right now. System updates will appear here.
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`p-3 transition ${
                    n.read ? 'bg-white opacity-85' : 'bg-blue-50/40 font-medium'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`w-2 h-2 rounded-full shrink-0 ${
                          n.type === 'broadcast'
                            ? 'bg-purple-600'
                            : n.type === 'system'
                            ? 'bg-rose-500'
                            : 'bg-blue-600'
                        }`}
                      />
                      <h4 className="text-xs font-bold text-slate-900">{n.title}</h4>
                    </div>
                    <span className="text-[10px] text-slate-400 whitespace-nowrap shrink-0">
                      {timeAgo(n.timestamp)}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1 leading-snug pl-3.5">
                    {n.message}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
