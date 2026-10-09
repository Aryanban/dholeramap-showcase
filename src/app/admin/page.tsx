'use client';

import React, { useState, useEffect, useCallback } from 'react';
import SiteHeader from '@/components/panels/SiteHeader';
import SiteFooter from '@/components/panels/SiteFooter';
import { useApp } from '@/lib/store';
import type { AppNotification, UserFeedback } from '@/lib/types';
import {
  getAllBrokerProperties,
  updatePropertyFeaturedStatus,
  togglePropertyFeatured,
  type BrokerProfile,
  type BrokerProperty,
} from '@/lib/brokers';

type AdminTab = 'overview' | 'users' | 'payments' | 'health' | 'featured' | 'broadcasts' | 'feedback';

interface AdminUser {
  id: string;
  name: string;
  email: string;
  emails: string[];
  phone: string;
  imageUrl: string | null;
  username: string | null;
  banned: boolean;
  createdAt: number;
  lastSignInAt: number | null;
  role: string;
  plan: string;
  status: string;
  periodEnd: string | null;
  periodEndFormatted: string | null;
  daysRemaining: number | null;
  trialStartedAt: string | null;
  trialDaysLeft: number;
  isTrialExpired: boolean;
  billingType: string;
  lastPaymentId: string | null;
  lastCreditPaymentId: string | null;
  pdfsUsed: number;
  credits: number;
  rolloverBank: number;
  pdfsAvailable: number;
  includedCap: number;
  includedRemaining: number;
  canExportPdf: boolean;
  canBuyCredits: boolean;
  canSavePlots: boolean;
  canViewDetails: boolean;
  isAdmin: boolean;
}

interface AdminStats {
  totalUsers: number;
  sampled: number;
  sampledTruncated: boolean;
  byPlan: Record<string, number>;
  paying: number;
  trialing: number;
  creditsIssued: number;
  pdfsUsed: number;
  admins: number;
  banned: number;
}

interface PaymentRecord {
  payment_id: string;
  user_id: string;
  kind: 'subscription' | 'credit_pack' | 'ad_boost';
  amount_paisa: number;
  credits?: number;
  razorpay_order_id?: string | null;
  razorpay_subscription_id?: string | null;
  created_at: string;
}

interface SystemHealth {
  gateway: {
    mode: 'test' | 'live';
    keyIdPrefix: string;
    hasKeySecret: boolean;
    hasWebhookSecret: boolean;
  };
  database: {
    mode: string;
    connected: boolean;
    latencyMs: number;
    error: string | null;
  };
  server: {
    region: string;
    nodeEnv: string;
  };
}

const PLAN_BADGE: Record<string, string> = {
  free: 'bg-slate-100 text-slate-700 border-slate-200',
  trial: 'bg-indigo-50 text-indigo-700 border-indigo-200 font-bold',
  investor: 'bg-amber-50 text-amber-800 border-amber-300 font-black',
  pro: 'bg-blue-50 text-blue-700 border-blue-200 font-bold',
  max: 'bg-purple-50 text-purple-700 border-purple-200 font-black',
};

const BILLING_BADGE: Record<string, string> = {
  'One-Time Pass (30d)': 'bg-amber-100/70 text-amber-900 border-amber-300',
  'One-Time / Pass': 'bg-blue-50 text-blue-800 border-blue-200',
  'Recurring Mandate': 'bg-emerald-50 text-emerald-800 border-emerald-300',
  '7-Day Free Trial': 'bg-indigo-50 text-indigo-700 border-indigo-200',
  'Free Trial (2 Credits)': 'bg-indigo-50 text-indigo-700 border-indigo-200',
  'Admin Grant': 'bg-purple-100 text-purple-800 border-purple-300',
  'Free': 'bg-slate-100 text-slate-600 border-slate-200',
  'Inactive / Expired': 'bg-rose-50 text-rose-700 border-rose-200',
};

export default function AdminPage() {
  const [tab, setTab] = useState<AdminTab>('overview');
  const notifications = useApp((s) => s.notifications);
  const addNotification = useApp((s) => s.addNotification);
  const feedbackList = useApp((s) => s.feedbackList);
  const updateFeedbackStatus = useApp((s) => s.updateFeedbackStatus);
  const hydrateFeedback = useApp((s) => s.hydrateFeedback);
  const currentUserEmail = useApp((s) => s.user?.email);

  // Users Roster
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [totalUsers, setTotalUsers] = useState(0);

  // Inspector Modal
  const [inspectUser, setInspectUser] = useState<AdminUser | null>(null);

  // User Filter & Sort
  const [userPlanFilter, setUserPlanFilter] = useState<'all' | 'max' | 'pro' | 'investor' | 'trial' | 'free' | 'banned'>('all');
  const [userSortBy, setUserSortBy] = useState<'created' | 'expiry' | 'credits' | 'pdfs' | 'name'>('created');
  const [userSortDir, setUserSortDir] = useState<'asc' | 'desc'>('desc');

  // Payments Audit
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [paymentsLoading, setPaymentsLoading] = useState(false);
  const [paymentSearch, setPaymentSearch] = useState('');

  // System Health
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [healthLoading, setHealthLoading] = useState(false);

  // Featured Properties review queue state
  const [brokerProps, setBrokerProps] = useState<{ broker: BrokerProfile; property: BrokerProperty }[]>([]);
  const [featuredFilter, setFeaturedFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  // Broadcast state
  const [bTitle, setBTitle] = useState('');
  const [bMessage, setBMessage] = useState('');
  const [bType, setBType] = useState<AppNotification['type']>('broadcast');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // IndexNow state
  const [indexNowBusy, setIndexNowBusy] = useState(false);
  const [indexNowStatus, setIndexNowStatus] = useState<string | null>(null);

  const loadUsers = useCallback(async (q?: string) => {
    setLoading(true);
    setError(null);
    try {
      const url = '/api/admin/users' + (q ? `?search=${encodeURIComponent(q)}` : '');
      const res = await fetch(url);
      if (!res.ok) throw new Error(res.status === 403 ? 'Your account is not an admin.' : 'Could not load users.');
      const data = await res.json();
      setUsers(data.users);
      setTotalUsers(data.totalCount);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load users.');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadStats = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/stats');
      if (res.ok) setStats(await res.json());
    } catch {
      /* stats are best-effort */
    }
  }, []);

  const loadPayments = useCallback(async () => {
    setPaymentsLoading(true);
    try {
      const res = await fetch('/api/admin/payments');
      if (res.ok) {
        const data = await res.json();
        setPayments(data.payments || []);
      }
    } catch (e) {
      console.warn('Failed to load payments:', e);
    } finally {
      setPaymentsLoading(false);
    }
  }, []);

  const loadHealth = useCallback(async () => {
    setHealthLoading(true);
    try {
      const res = await fetch('/api/admin/health');
      if (res.ok) {
        const data = await res.json();
        setHealth(data);
      }
    } catch (e) {
      console.warn('Failed to load health:', e);
    } finally {
      setHealthLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadUsers();
    void loadStats();
    void loadPayments();
    void loadHealth();
  }, [loadUsers, loadStats, loadPayments, loadHealth]);

  const loadBrokerProps = useCallback(() => {
    setBrokerProps(getAllBrokerProperties());
  }, []);

  useEffect(() => {
    loadBrokerProps();
  }, [loadBrokerProps]);

  function handleApproveProperty(brokerId: string, propertyId: string) {
    const ok = updatePropertyFeaturedStatus(brokerId, propertyId, 'approved');
    if (ok) {
      loadBrokerProps();
      setToastMsg('Property approved and live on Featured showcase!');
    }
  }

  function handleRejectProperty(brokerId: string, propertyId: string) {
    const ok = updatePropertyFeaturedStatus(brokerId, propertyId, 'rejected');
    if (ok) {
      loadBrokerProps();
      setToastMsg('Property rejected from featured placement.');
    }
  }

  function handleTogglePropertyFeatured(brokerId: string, propertyId: string) {
    const ok = togglePropertyFeatured(brokerId, propertyId);
    if (ok) {
      loadBrokerProps();
      setToastMsg('Property featured status toggled.');
    }
  }

  // Filtered and sorted users
  const filteredAndSortedUsers = React.useMemo(() => {
    let list = [...users];
    if (userPlanFilter === 'trial') list = list.filter((u) => u.plan === 'trial');
    else if (userPlanFilter === 'pro') list = list.filter((u) => u.plan === 'pro');
    else if (userPlanFilter === 'max') list = list.filter((u) => u.plan === 'max');
    else if (userPlanFilter === 'investor') list = list.filter((u) => u.plan === 'investor');
    else if (userPlanFilter === 'free') list = list.filter((u) => u.plan === 'free');
    else if (userPlanFilter === 'banned') list = list.filter((u) => u.banned);

    list.sort((a, b) => {
      let diff = 0;
      if (userSortBy === 'expiry') {
        const aExp = a.periodEnd ? new Date(a.periodEnd).getTime() : 0;
        const bExp = b.periodEnd ? new Date(b.periodEnd).getTime() : 0;
        diff = aExp - bExp;
      } else if (userSortBy === 'credits') {
        diff = (a.credits || 0) - (b.credits || 0);
      } else if (userSortBy === 'pdfs') {
        diff = (a.pdfsUsed || 0) - (b.pdfsUsed || 0);
      } else if (userSortBy === 'created') {
        diff = (a.createdAt || 0) - (b.createdAt || 0);
      } else if (userSortBy === 'name') {
        diff = (a.name || '').localeCompare(b.name || '');
      }
      return userSortDir === 'desc' ? -diff : diff;
    });
    return list;
  }, [users, userPlanFilter, userSortBy, userSortDir]);

  // Filtered Payments
  const filteredPayments = React.useMemo(() => {
    if (!paymentSearch.trim()) return payments;
    const q = paymentSearch.trim().toLowerCase();
    return payments.filter(
      (p) =>
        p.payment_id.toLowerCase().includes(q) ||
        p.user_id.toLowerCase().includes(q) ||
        (p.razorpay_order_id && p.razorpay_order_id.toLowerCase().includes(q)) ||
        (p.razorpay_subscription_id && p.razorpay_subscription_id.toLowerCase().includes(q))
    );
  }, [payments, paymentSearch]);

  // Featured review stats
  const pendingFeaturedCount = brokerProps.filter(
    (p) => (p.property.featuredStatus || (p.property.featured ? 'approved' : 'pending')) === 'pending'
  ).length;
  const approvedFeaturedCount = brokerProps.filter(
    (p) => (p.property.featuredStatus || (p.property.featured ? 'approved' : 'pending')) === 'approved'
  ).length;
  const rejectedFeaturedCount = brokerProps.filter(
    (p) => p.property.featuredStatus === 'rejected'
  ).length;

  const filteredBrokerProps = React.useMemo(() => {
    return brokerProps.filter(({ property }) => {
      const status = property.featuredStatus || (property.featured ? 'approved' : 'pending');
      if (featuredFilter === 'all') return true;
      return status === featuredFilter;
    });
  }, [brokerProps, featuredFilter]);

  useEffect(() => {
    hydrateFeedback();
  }, [hydrateFeedback]);

  useEffect(() => {
    if (!toastMsg) return;
    const t = setTimeout(() => setToastMsg(null), 3000);
    return () => clearTimeout(t);
  }, [toastMsg]);

  /** Apply a management change to one account and splice the result back in. */
  async function mutate(id: string, body: Record<string, unknown>, label: string) {
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(`Could not ${label.toLowerCase()}.`);
      const data = await res.json();
      setUsers((prev) => prev.map((u) => (u.id === id ? data.user : u)));
      if (inspectUser && inspectUser.id === id) {
        setInspectUser(data.user);
      }
      setToastMsg(`${label} applied to ${data.user.name}.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : `Could not ${label.toLowerCase()}.`);
    } finally {
      setBusyId(null);
    }
  }

  function handleSendBroadcast(e: React.FormEvent) {
    e.preventDefault();
    if (!bTitle.trim() || !bMessage.trim()) return;

    const notif: AppNotification = {
      id: `broadcast-${Date.now()}`,
      title: bTitle.trim(),
      message: bMessage.trim(),
      type: bType,
      timestamp: Date.now(),
      read: false,
    };

    addNotification(notif);
    setToastMsg(`Broadcast "${bTitle}" published to all users!`);
    setBTitle('');
    setBMessage('');
  }

  const [serverFeedback, setServerFeedback] = useState<UserFeedback[]>([]);

  async function fetchFeedback() {
    try {
      const res = await fetch('/api/feedback');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.feedback)) {
          const mapped: UserFeedback[] = data.feedback.map((f: any) => ({
            id: f.id,
            name: f.name || 'Anonymous User',
            contact: f.email || '—',
            category: f.category || 'general',
            message: f.message,
            createdAt: f.created_at ? new Date(f.created_at).getTime() : Date.now(),
            status: f.status || 'new',
          }));
          setServerFeedback(mapped);
        }
      }
    } catch (e) {
      console.warn('Failed to load feedback from server:', e);
    }
  }

  useEffect(() => {
    fetchFeedback();
  }, []);

  async function handleUpdateFeedbackStatus(id: string, status: UserFeedback['status']) {
    updateFeedbackStatus(id, status);
    setServerFeedback((prev) => prev.map((f) => (f.id === id ? { ...f, status } : f)));
    try {
      await fetch('/api/feedback', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
    } catch (err) {
      console.warn('Failed to update status on server:', err);
    }
  }

  async function handleIndexNowSubmit(fullSite: boolean = true) {
    setIndexNowBusy(true);
    setIndexNowStatus('Submitting to IndexNow protocol (api.indexnow.org & Bing)...');
    try {
      const res = await fetch('/api/indexnow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullSite }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setIndexNowStatus(`✓ Successfully submitted ${data.submittedCount || 3676} URLs to IndexNow!`);
        setToastMsg(`IndexNow submission completed! ${data.submittedCount || 3676} URLs queued for rapid search crawl.`);
      } else {
        setIndexNowStatus(`Response (${res.status}): ${data.message || data.error || 'Verification pending deploy.'}`);
        setToastMsg(data.message || 'IndexNow request sent.');
      }
    } catch (e) {
      setIndexNowStatus(`Error: ${e instanceof Error ? e.message : 'Failed to reach /api/indexnow'}`);
    } finally {
      setIndexNowBusy(false);
    }
  }

  const activeFeedback = serverFeedback.length > 0 ? serverFeedback : feedbackList;

  function copyToClipboard(text: string, label: string) {
    navigator.clipboard.writeText(text);
    setToastMsg(`Copied ${label} to clipboard!`);
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col font-sans">
      <SiteHeader activePage="admin" />

      {/* Toast */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-[2000] p-3.5 bg-slate-900 text-white text-xs font-bold rounded-2xl shadow-xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2">
          <span>{toastMsg}</span>
          <button onClick={() => setToastMsg(null)} className="text-slate-400 hover:text-white cursor-pointer">✕</button>
        </div>
      )}

      {/* USER DETAILS INSPECTOR MODAL */}
      {inspectUser && (
        <div className="fixed inset-0 z-[1500] bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
              <div className="flex items-center gap-3 min-w-0">
                {inspectUser.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={inspectUser.imageUrl} alt="" className="w-12 h-12 rounded-2xl object-cover border border-slate-200" />
                ) : (
                  <div className="w-12 h-12 rounded-2xl bg-purple-600 text-white text-base font-black flex items-center justify-center shadow-xs">
                    {inspectUser.name[0]?.toUpperCase() || '?'}
                  </div>
                )}
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base font-black text-slate-900 truncate">{inspectUser.name}</h3>
                    <span className={`text-[10px] uppercase font-black px-2 py-0.5 rounded-full border ${PLAN_BADGE[inspectUser.plan] || PLAN_BADGE.free}`}>
                      {inspectUser.plan}
                    </span>
                    {inspectUser.isAdmin && (
                      <span className="text-[10px] font-black uppercase bg-purple-100 text-purple-800 border border-purple-200 px-2 py-0.5 rounded-full">Admin</span>
                    )}
                    {inspectUser.banned && (
                      <span className="text-[10px] font-black uppercase bg-rose-100 text-rose-800 border border-rose-200 px-2 py-0.5 rounded-full">Banned</span>
                    )}
                  </div>
                  <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                    <span>{inspectUser.email}</span>
                    {inspectUser.phone && <span>· 📞 {inspectUser.phone}</span>}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setInspectUser(null)}
                className="w-8 h-8 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-600 flex items-center justify-center text-sm font-bold transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-700">
              {/* IDs & Identity */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Clerk User ID</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="font-mono text-[11px] font-bold text-slate-800 truncate">{inspectUser.id}</span>
                    <button
                      onClick={() => copyToClipboard(inspectUser.id, 'User ID')}
                      className="px-1.5 py-0.5 text-[10px] font-bold bg-white border border-slate-200 hover:bg-slate-100 rounded text-slate-600 cursor-pointer"
                    >
                      Copy
                    </button>
                  </div>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Registered Date</span>
                  <span className="font-medium text-slate-800">
                    {new Date(inspectUser.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                {inspectUser.lastPaymentId && (
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Last Payment ID</span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="font-mono text-[11px] font-bold text-emerald-700">{inspectUser.lastPaymentId}</span>
                      <button
                        onClick={() => copyToClipboard(inspectUser.lastPaymentId!, 'Payment ID')}
                        className="px-1.5 py-0.5 text-[10px] font-bold bg-white border border-slate-200 hover:bg-slate-100 rounded text-slate-600 cursor-pointer"
                      >
                        Copy
                      </button>
                    </div>
                  </div>
                )}
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Last Sign-in</span>
                  <span className="font-medium text-slate-800">
                    {inspectUser.lastSignInAt
                      ? new Date(inspectUser.lastSignInAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : 'Never'}
                  </span>
                </div>
              </div>

              {/* Subscription & Lifecycle Card */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h4 className="font-black text-slate-900 uppercase text-[11px] tracking-wider">Subscription &amp; Validity</h4>
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider border ${BILLING_BADGE[inspectUser.billingType] || BILLING_BADGE.Free}`}>
                    {inspectUser.billingType}
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Status</span>
                    <span className="font-black text-slate-900 uppercase mt-0.5 block">{inspectUser.status}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Plan Expiry Date</span>
                    <span className="font-bold text-slate-900 mt-0.5 block">
                      {inspectUser.periodEndFormatted || '—'}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Days Left</span>
                    <span className={`font-black text-sm mt-0.5 block ${
                      inspectUser.daysRemaining !== null && inspectUser.daysRemaining <= 3
                        ? 'text-rose-600'
                        : 'text-slate-900'
                    }`}>
                      {inspectUser.daysRemaining !== null ? `${inspectUser.daysRemaining} days` : 'Unlimited'}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Purchased Date</span>
                    <span className="font-medium text-slate-800 mt-0.5 block">
                      {inspectUser.trialStartedAt
                        ? new Date(inspectUser.trialStartedAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })
                        : new Date(inspectUser.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Quotas & Entitlements Breakdown */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
                <h4 className="font-black text-slate-900 uppercase text-[11px] tracking-wider border-b border-slate-100 pb-2">
                  Dossier PDF Quota &amp; Balances
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  <div className="p-2.5 rounded-xl bg-blue-50/50 border border-blue-100">
                    <span className="text-[10px] uppercase font-bold text-blue-600 block">Included Used</span>
                    <span className="font-black text-blue-900 text-sm mt-0.5 block">
                      {inspectUser.isAdmin ? '0 (Unlimited)' : `${inspectUser.pdfsUsed} / ${inspectUser.includedCap}`}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-emerald-50/50 border border-emerald-100">
                    <span className="text-[10px] uppercase font-bold text-emerald-600 block">Remaining Cycle</span>
                    <span className="font-black text-emerald-900 text-sm mt-0.5 block">
                      {inspectUser.isAdmin ? 'Unlimited' : inspectUser.includedRemaining}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-purple-50/50 border border-purple-100">
                    <span className="text-[10px] uppercase font-bold text-purple-600 block">Rollover Bank</span>
                    <span className="font-black text-purple-900 text-sm mt-0.5 block">
                      {inspectUser.rolloverBank}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-amber-50/50 border border-amber-100">
                    <span className="text-[10px] uppercase font-bold text-amber-700 block">Paid PDF Credits</span>
                    <span className="font-black text-amber-900 text-sm mt-0.5 block">
                      {inspectUser.credits}
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Support & Debugging Tools */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <h4 className="font-black text-slate-900 uppercase text-[11px] tracking-wider">
                  Admin Support &amp; Debugging Actions
                </h4>
                <div className="flex flex-wrap items-center gap-2">
                  {/* Plan Switcher */}
                  <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-500 pl-1">Plan:</span>
                    <select
                      value={inspectUser.plan}
                      disabled={busyId === inspectUser.id}
                      onChange={(e) => void mutate(inspectUser.id, { plan: e.target.value }, `Change to ${e.target.value}`)}
                      className="text-xs font-bold bg-transparent outline-none cursor-pointer"
                    >
                      <option value="free">Free</option>
                      <option value="trial">Free Trial (2 Credits)</option>
                      <option value="investor">Investor Pass (₹199)</option>
                      <option value="pro">Dealer Pro (₹1,000 / ₹900)</option>
                      <option value="max">Enterprise Max (₹2,500 / ₹2,200)</option>
                    </select>
                  </div>

                  {/* Extend Expiry */}
                  <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-500 pl-1">Extend:</span>
                    <button
                      onClick={() => void mutate(inspectUser.id, { extendDays: 7 }, '+7 Days Access')}
                      disabled={busyId === inspectUser.id}
                      className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-[10px] font-bold cursor-pointer"
                    >
                      +7D
                    </button>
                    <button
                      onClick={() => void mutate(inspectUser.id, { extendDays: 30 }, '+30 Days Access')}
                      disabled={busyId === inspectUser.id}
                      className="px-2 py-1 rounded bg-amber-100 text-amber-900 hover:bg-amber-200 text-[10px] font-bold cursor-pointer"
                    >
                      +30D
                    </button>
                    <button
                      onClick={() => void mutate(inspectUser.id, { extendDays: 90 }, '+90 Days Access')}
                      disabled={busyId === inspectUser.id}
                      className="px-2 py-1 rounded bg-purple-100 text-purple-900 hover:bg-purple-200 text-[10px] font-bold cursor-pointer"
                    >
                      +90D
                    </button>
                  </div>

                  {/* Credits */}
                  <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-500 pl-1">Credits:</span>
                    <button
                      onClick={() => void mutate(inspectUser.id, { creditsDelta: 1 }, '+1 Credit')}
                      disabled={busyId === inspectUser.id}
                      className="px-2 py-1 rounded bg-emerald-50 text-emerald-800 hover:bg-emerald-100 text-[10px] font-bold cursor-pointer"
                    >
                      +1
                    </button>
                    <button
                      onClick={() => void mutate(inspectUser.id, { creditsDelta: 5 }, '+5 Credits')}
                      disabled={busyId === inspectUser.id}
                      className="px-2 py-1 rounded bg-emerald-100 text-emerald-900 hover:bg-emerald-200 text-[10px] font-bold cursor-pointer"
                    >
                      +5
                    </button>
                    <button
                      onClick={() => void mutate(inspectUser.id, { creditsDelta: -1 }, '-1 Credit')}
                      disabled={busyId === inspectUser.id || inspectUser.credits <= 0}
                      className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-[10px] font-bold cursor-pointer disabled:opacity-40"
                    >
                      -1
                    </button>
                  </div>

                  {/* Reset Quota */}
                  <button
                    onClick={() => void mutate(inspectUser.id, { resetQuota: true }, 'Reset Quota')}
                    disabled={busyId === inspectUser.id}
                    className="px-3 py-1.5 rounded-xl border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 text-[10px] font-bold cursor-pointer"
                  >
                    Reset Used PDFs (0)
                  </button>

                  {/* Ban/Unban */}
                  <button
                    onClick={() => void mutate(inspectUser.id, { banned: !inspectUser.banned }, inspectUser.banned ? 'Unban' : 'Ban')}
                    disabled={busyId === inspectUser.id}
                    className={`px-3 py-1.5 rounded-xl border text-[10px] font-bold cursor-pointer ${
                      inspectUser.banned
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                        : 'bg-rose-50 text-rose-700 border-rose-300'
                    }`}
                  >
                    {inspectUser.banned ? 'Unban User' : 'Ban User'}
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
              <span className="text-[10px] text-slate-400">
                Mutations sync directly to Clerk metadata and Supabase entitlements in real time.
              </span>
              <button
                onClick={() => setInspectUser(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition cursor-pointer"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
                Administrator Control &amp; Health Hub
              </h1>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-purple-100 text-purple-700 border border-purple-200 px-2.5 py-0.5 rounded-full">
                Owner Access
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Signed in as <span className="font-bold text-slate-700">{currentUserEmail || 'admin'}</span>. Manage customer entitlements, audit live payments, inspect gateway health, and debug users.
            </p>
          </div>
        </div>

        {/* Top KPIs — real figures from Clerk & Supabase */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Registered Accounts</span>
            <div className="text-2xl font-black text-slate-900">{totalUsers || stats?.totalUsers || 0}</div>
            <span className="text-[11px] text-slate-500 block">Total customer profiles</span>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
            <span className="text-[10px] uppercase font-bold text-purple-600 tracking-wider">Paid Subscribers</span>
            <div className="text-2xl font-black text-purple-800">{stats ? stats.paying : '—'}</div>
            <span className="text-[11px] text-slate-500 block">
              Active Max &amp; Pro{stats?.trialing ? ` · ${stats.trialing} on trial` : ''}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
            <span className="text-[10px] uppercase font-bold text-amber-600 tracking-wider">Investor Passes &amp; Credits</span>
            <div className="text-2xl font-black text-amber-800">{stats ? stats.creditsIssued : '—'}</div>
            <span className="text-[11px] text-slate-500 block">Active credits / passes held</span>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
            <span className="text-[10px] uppercase font-bold text-emerald-600 tracking-wider">Dossier PDFs Built</span>
            <div className="text-2xl font-black text-emerald-700">{stats ? stats.pdfsUsed : '—'}</div>
            <span className="text-[11px] text-slate-500 block">Total verified dossiers exported</span>
          </div>
        </div>

        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs font-bold text-rose-700">
            {error}
          </div>
        )}

        {/* Admin Navigation Tabs */}
        <div className="flex bg-white p-1 rounded-2xl border border-slate-200 shadow-xs overflow-x-auto">
          {(
            [
              ['overview', '📊 Overview'],
              ['users', `👥 Users (${users.length})`],
              ['payments', `💳 Payments (${payments.length})`],
              ['health', '🛡️ Gateway & Health'],
              ['featured', `⭐ Featured Queue${pendingFeaturedCount > 0 ? ` (${pendingFeaturedCount})` : ''}`],
              ['broadcasts', '📢 Broadcasts'],
              ['feedback', `💬 Feedback (${activeFeedback.length})`],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex-1 min-w-[110px] py-2.5 text-xs font-bold rounded-xl transition cursor-pointer whitespace-nowrap text-center ${
                tab === key
                  ? 'bg-purple-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* TAB 1: OVERVIEW */}
        {tab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-sm font-black text-slate-900">Plan &amp; Customer Distribution</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Breakdown across the sampled {stats?.sampled ?? 0} active accounts.
                </p>
              </div>
              {stats ? (
                <div className="space-y-3">
                  {['max', 'pro', 'investor', 'free'].map((p) => {
                    const n = stats.byPlan[p] || 0;
                    const pct = stats.sampled ? Math.round((n / stats.sampled) * 100) : 0;
                    return (
                      <div key={p}>
                        <div className="flex items-center justify-between text-xs font-bold mb-1">
                          <span className={`uppercase tracking-wider px-2 py-0.5 rounded border ${PLAN_BADGE[p] || PLAN_BADGE.free}`}>{p}</span>
                          <span className="text-slate-600">{n} accounts · {pct}%</span>
                        </div>
                        <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              p === 'max' ? 'bg-purple-500' : p === 'pro' ? 'bg-blue-500' : p === 'investor' ? 'bg-amber-500' : 'bg-slate-300'
                            }`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                  <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 space-y-1">
                    <div>Trialing now: <b className="text-slate-700">{stats.byPlan.trialing || 0}</b></div>
                    <div>Admin accounts: <b className="text-slate-700">{stats.admins}</b></div>
                    <div>Banned accounts: <b className="text-slate-700">{stats.banned}</b></div>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-400">Loading stats…</p>
              )}
            </div>

            {/* Quick Diagnostic Card on Overview */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="text-sm font-black text-slate-900">System Gateway Snapshot</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Live configuration status for billing and edge networking.</p>
                </div>
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
                    <span className="font-bold text-xs text-slate-700">Razorpay Gateway Mode</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                      health?.gateway.mode === 'live' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {health?.gateway.mode || 'Loading…'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
                    <span className="font-bold text-xs text-slate-700">Database Connection</span>
                    <span className="font-bold text-xs text-emerald-700 flex items-center gap-1">
                      ● {health?.database.connected ? `Connected (${health.database.latencyMs}ms)` : 'Checking…'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
                    <span className="font-bold text-xs text-slate-700">Webhook Secret</span>
                    <span className="font-bold text-xs text-emerald-700">
                      {health?.gateway.hasWebhookSecret ? '✓ Registered' : '⚠️ Missing'}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setTab('health')}
                className="w-full py-2.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-xs transition cursor-pointer"
              >
                Open Full Diagnostics &amp; Health Hub →
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: USERS ROSTER & DEEP INSPECTOR */}
        {tab === 'users' && (
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-black text-slate-900">Registered Accounts &amp; Entitlements</h3>
                <p className="text-xs text-slate-500">
                  Every Clerk user with live plan expiry dates, bought dates, billing types, and usage controls.
                </p>
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  void loadUsers(search);
                }}
                className="flex items-center gap-2"
              >
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name, email, or user ID…"
                  className="h-9 w-60 rounded-xl border border-slate-200 px-3 text-xs outline-none focus:border-purple-500"
                />
                <button type="submit" className="h-9 px-3.5 rounded-xl bg-slate-900 text-white text-xs font-bold cursor-pointer hover:bg-slate-800">
                  Search
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSearch('');
                    void loadUsers();
                  }}
                  className="h-9 px-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 cursor-pointer hover:bg-slate-50"
                >
                  All
                </button>
              </form>
            </div>

            {/* Filter Pills & Sorting Controls */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mr-1">Filter:</span>
                {(['all', 'max', 'pro', 'investor', 'trial', 'free', 'banned'] as const).map((filter) => {
                  const count =
                    filter === 'all'
                      ? users.length
                      : filter === 'banned'
                      ? users.filter((u) => u.banned).length
                      : users.filter((u) => u.plan === filter).length;
                  const active = userPlanFilter === filter;
                  return (
                    <button
                      key={filter}
                      type="button"
                      onClick={() => setUserPlanFilter(filter)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                        active
                          ? 'bg-slate-900 text-white shadow-2xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {filter.toUpperCase()} ({count})
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Sort:</span>
                <select
                  value={userSortBy}
                  onChange={(e) => setUserSortBy(e.target.value as any)}
                  className="h-8 rounded-lg border border-slate-200 bg-white px-2 text-xs font-medium text-slate-700 outline-none focus:border-purple-500"
                >
                  <option value="created">Date Created</option>
                  <option value="expiry">Plan Expiry Date</option>
                  <option value="credits">Credits Held</option>
                  <option value="pdfs">PDFs Generated</option>
                  <option value="name">Name / Email</option>
                </select>
                <button
                  type="button"
                  onClick={() => setUserSortDir((d) => (d === 'desc' ? 'asc' : 'desc'))}
                  className="h-8 px-2.5 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer shadow-2xs"
                  title="Toggle Sort Direction"
                >
                  {userSortDir === 'desc' ? 'Desc ↓' : 'Asc ↑'}
                </button>
              </div>
            </div>

            {loading ? (
              <p className="text-xs text-slate-400 py-12 text-center">Loading customer accounts from Clerk…</p>
            ) : filteredAndSortedUsers.length === 0 ? (
              <p className="text-xs text-slate-400 py-12 text-center">
                No accounts match the current filter. {search ? 'Try clearing the search query.' : 'Select "All".'}
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px] font-bold tracking-wider">
                      <th className="py-2.5 px-3">User &amp; Contact</th>
                      <th className="py-2.5 px-3">Plan &amp; Billing</th>
                      <th className="py-2.5 px-3">Validity &amp; Expiry</th>
                      <th className="py-2.5 px-3">Quota Usage</th>
                      <th className="py-2.5 px-3">Credits</th>
                      <th className="py-2.5 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredAndSortedUsers.map((u) => (
                      <tr key={u.id} className={`hover:bg-slate-50/70 transition ${u.banned ? 'opacity-60 bg-rose-50/20' : ''}`}>
                        {/* User Identity */}
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2.5">
                            {u.imageUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={u.imageUrl} alt="" className="w-9 h-9 rounded-xl object-cover shrink-0" />
                            ) : (
                              <span className="w-9 h-9 rounded-xl bg-slate-100 text-slate-600 font-black flex items-center justify-center shrink-0">
                                {u.name[0]?.toUpperCase() || '?'}
                              </span>
                            )}
                            <div className="min-w-0">
                              <div className="font-bold text-slate-900 flex items-center gap-1.5 flex-wrap">
                                <span className="truncate max-w-[150px]">{u.name}</span>
                                {u.isAdmin && (
                                  <span className="text-[9px] font-black uppercase bg-purple-100 text-purple-700 border border-purple-200 px-1.5 py-0.2 rounded">Admin</span>
                                )}
                                {u.banned && (
                                  <span className="text-[9px] font-black uppercase bg-rose-100 text-rose-700 border border-rose-200 px-1.5 py-0.2 rounded">Banned</span>
                                )}
                              </div>
                              <div className="text-[10px] text-slate-400 truncate max-w-[200px]">{u.email}</div>
                              {u.phone && <div className="text-[10px] text-blue-600 font-medium">📞 {u.phone}</div>}
                            </div>
                          </div>
                        </td>

                        {/* Plan & Billing Mode */}
                        <td className="py-3 px-3">
                          <div className="space-y-1">
                            <span className={`inline-block text-[10px] uppercase font-black px-2 py-0.5 rounded border ${PLAN_BADGE[u.plan] || PLAN_BADGE.free}`}>
                              {u.plan}
                            </span>
                            <div className="text-[10px] text-slate-500 font-medium">
                              {u.billingType}
                            </div>
                          </div>
                        </td>

                        {/* Validity & Expiry */}
                        <td className="py-3 px-3">
                          {u.isAdmin ? (
                            <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded">Unlimited</span>
                          ) : u.periodEndFormatted ? (
                            <div className="space-y-0.5">
                              <div className="font-bold text-slate-900 text-[11px]">{u.periodEndFormatted}</div>
                              <div className={`text-[10px] font-semibold ${
                                u.daysRemaining !== null && u.daysRemaining <= 0
                                  ? 'text-rose-600'
                                  : u.daysRemaining !== null && u.daysRemaining <= 5
                                  ? 'text-amber-600'
                                  : 'text-slate-500'
                              }`}>
                                {u.daysRemaining !== null && u.daysRemaining > 0
                                  ? `(${u.daysRemaining}d left)`
                                  : '(Expired)'}
                              </div>
                            </div>
                          ) : u.trialDaysLeft > 0 ? (
                            <div className="space-y-0.5">
                              <div className="font-bold text-indigo-700 text-[11px]">Trial Active</div>
                              <div className="text-[10px] text-slate-500">({u.trialDaysLeft}d remaining)</div>
                            </div>
                          ) : (
                            <span className="text-[10px] text-slate-400">—</span>
                          )}
                        </td>

                        {/* Quota Usage */}
                        <td className="py-3 px-3">
                          <div className="space-y-1 font-mono">
                            <div className="font-bold text-blue-700 text-[11px]">
                              {u.isAdmin ? 'Unlimited' : `${u.pdfsUsed} / ${u.includedCap}`}
                            </div>
                            {u.rolloverBank > 0 && (
                              <div className="text-[9px] text-purple-600 font-sans font-medium">
                                +{u.rolloverBank} rollover
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Credits */}
                        <td className="py-3 px-3 font-mono font-bold text-slate-700">
                          {u.isAdmin ? '—' : u.credits}
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5 flex-wrap">
                            <button
                              onClick={() => setInspectUser(u)}
                              className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-[10px] transition cursor-pointer shadow-xs"
                            >
                              Inspect
                            </button>
                            <button
                              disabled={busyId === u.id || u.isAdmin}
                              onClick={() => void mutate(u.id, { extendDays: 30 }, '+30 Days Access')}
                              className="px-2 py-1 rounded-lg border border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100 font-bold text-[10px] transition cursor-pointer disabled:opacity-40"
                              title="Extend plan by 30 days"
                            >
                              +30D
                            </button>
                            <button
                              disabled={busyId === u.id || u.isAdmin}
                              onClick={() => void mutate(u.id, { creditsDelta: 5 }, '+5 Credits')}
                              className="px-2 py-1 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 font-bold text-[10px] transition cursor-pointer disabled:opacity-40"
                              title="Add 5 Credits"
                            >
                              +5
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <p className="text-[10px] text-slate-400">
              Showing {filteredAndSortedUsers.length} of {totalUsers} accounts. Click &ldquo;Inspect&rdquo; on any row to open the full support and debug panel.
            </p>
          </div>
        )}

        {/* TAB 3: PAYMENTS AUDIT & TRANSACTIONS */}
        {tab === 'payments' && (
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-black text-slate-900">Payment Transactions Audit Log</h3>
                <p className="text-xs text-slate-500">
                  Every payment claimed idempotently by your server via Checkout or Webhook.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <input
                  value={paymentSearch}
                  onChange={(e) => setPaymentSearch(e.target.value)}
                  placeholder="Filter by payment ID or user ID…"
                  className="h-9 w-64 rounded-xl border border-slate-200 px-3 text-xs outline-none focus:border-purple-500"
                />
                <button
                  onClick={loadPayments}
                  disabled={paymentsLoading}
                  className="h-9 px-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  {paymentsLoading ? 'Refreshing…' : 'Refresh'}
                </button>
              </div>
            </div>

            {/* Quick Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Claimed Transactions</span>
                <span className="text-2xl font-black text-slate-900">{payments.length}</span>
              </div>
              <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-1">
                <span className="text-[10px] uppercase font-bold text-emerald-700 block">Total Revenue Recorded</span>
                <span className="text-2xl font-black text-emerald-800">
                  ₹{(payments.reduce((acc, p) => acc + (p.amount_paisa || 0), 0) / 100).toLocaleString('en-IN')}
                </span>
              </div>
              <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200 space-y-1">
                <span className="text-[10px] uppercase font-bold text-blue-700 block">Subscriptions vs Top-ups</span>
                <span className="text-2xl font-black text-blue-800">
                  {payments.filter((p) => p.kind === 'subscription').length} / {payments.filter((p) => p.kind === 'credit_pack').length}
                </span>
              </div>
            </div>

            {paymentsLoading ? (
              <p className="text-xs text-slate-400 py-12 text-center">Loading transactions from database…</p>
            ) : filteredPayments.length === 0 ? (
              <p className="text-xs text-slate-400 py-12 text-center">No payment records found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px] font-bold tracking-wider">
                      <th className="py-2.5 px-3">Payment ID</th>
                      <th className="py-2.5 px-3">Customer User ID</th>
                      <th className="py-2.5 px-3">Kind</th>
                      <th className="py-2.5 px-3">Amount</th>
                      <th className="py-2.5 px-3">Order / Subscription</th>
                      <th className="py-2.5 px-3">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredPayments.map((p) => (
                      <tr key={p.payment_id} className="hover:bg-slate-50/70 transition">
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-1.5 font-mono font-bold text-slate-900">
                            <span>{p.payment_id}</span>
                            <button
                              onClick={() => copyToClipboard(p.payment_id, 'Payment ID')}
                              className="px-1 text-[9px] font-sans font-bold bg-slate-100 rounded text-slate-500 hover:text-slate-800"
                            >
                              Copy
                            </button>
                          </div>
                        </td>
                        <td className="py-3 px-3 font-mono text-[11px] text-slate-600">
                          {p.user_id}
                        </td>
                        <td className="py-3 px-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                            p.kind === 'subscription' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {p.kind}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-mono font-black text-emerald-700 text-sm">
                          ₹{((p.amount_paisa || 0) / 100).toLocaleString('en-IN')}
                        </td>
                        <td className="py-3 px-3 font-mono text-[10px] text-slate-500">
                          {p.razorpay_order_id || p.razorpay_subscription_id || '—'}
                        </td>
                        <td className="py-3 px-3 text-slate-500 text-[11px]" suppressHydrationWarning>
                          {p.created_at ? new Date(p.created_at).toLocaleString('en-IN') : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: SYSTEM HEALTH & GATEWAY DIAGNOSTICS */}
        {tab === 'health' && (
          <div className="space-y-6">
            {/* Cloudflare Bot Fight Mode Warning Notice */}
            <div className="p-5 rounded-3xl bg-amber-50 border-2 border-amber-300 text-amber-950 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xl">⚠️</span>
                <h4 className="font-black text-sm">Critical Cloudflare Setting Notice</h4>
              </div>
              <p className="text-xs leading-relaxed text-amber-900">
                On Cloudflare Free plans, <strong>Bot Fight Mode</strong> blocks automated external webhook requests (like Razorpay&rsquo;s renewal and payment notifications) with an HTTP 403 Managed Challenge.
                Ensure that <strong>Bot Fight Mode</strong> is turned <strong>OFF</strong> in your Cloudflare dashboard (under <strong>Security → Bots</strong>).
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Razorpay Gateway Card */}
              <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
                <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                  <h3 className="text-sm font-black text-slate-900">Razorpay Payment Integration</h3>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                    health?.gateway.mode === 'live' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {health?.gateway.mode || 'Loading'}
                  </span>
                </div>
                <div className="space-y-2.5 text-xs text-slate-700">
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50">
                    <span className="font-medium text-slate-500">Key ID Prefix:</span>
                    <span className="font-mono font-bold text-slate-900">{health?.gateway.keyIdPrefix || 'Checking…'}</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50">
                    <span className="font-medium text-slate-500">Key Secret:</span>
                    <span className="font-bold text-emerald-700">
                      {health?.gateway.hasKeySecret ? '✓ Configured' : '✕ Missing'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50">
                    <span className="font-medium text-slate-500">Webhook Secret:</span>
                    <span className="font-bold text-emerald-700">
                      {health?.gateway.hasWebhookSecret ? '✓ Registered' : '⚠️ Missing'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50">
                    <span className="font-medium text-slate-500">Webhook Endpoint:</span>
                    <span className="font-mono text-[11px] font-bold text-slate-800">/api/razorpay/webhook</span>
                  </div>
                </div>
              </div>

              {/* Database & Runtime Card */}
              <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
                <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                  <h3 className="text-sm font-black text-slate-900">Database &amp; Compute Runtime</h3>
                  <span className="text-emerald-700 font-bold text-xs">● Live</span>
                </div>
                <div className="space-y-2.5 text-xs text-slate-700">
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50">
                    <span className="font-medium text-slate-500">Supabase Connection:</span>
                    <span className="font-bold text-emerald-700">
                      {health?.database.connected ? `✓ Connected (${health.database.latencyMs}ms)` : '✕ Error'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50">
                    <span className="font-medium text-slate-500">Entitlements Sync Mode:</span>
                    <span className="font-bold uppercase text-slate-800">{health?.database.mode || 'clerk'}</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50">
                    <span className="font-medium text-slate-500">Origin Compute Region:</span>
                    <span className="font-bold text-slate-900">{health?.server.region || 'bom1 (Mumbai)'}</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50">
                    <span className="font-medium text-slate-500">Node Environment:</span>
                    <span className="font-bold text-slate-900">{health?.server.nodeEnv || 'production'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* IndexNow Rapid Crawl Dispatch Card */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-sm font-black text-slate-900">IndexNow Search Engine Dispatch</h3>
                  <p className="text-xs text-slate-500">Rapidly notify Bing, Yandex, and IndexNow crawlers of new map parcels.</p>
                </div>
                <button
                  onClick={() => void handleIndexNowSubmit(true)}
                  disabled={indexNowBusy}
                  className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 cursor-pointer disabled:opacity-50"
                >
                  {indexNowBusy ? 'Submitting…' : 'Submit 3,676 URLs Now'}
                </button>
              </div>
              {indexNowStatus && (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-700">
                  {indexNowStatus}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 5: FEATURED PROPERTIES QUEUE */}
        {tab === 'featured' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Total Submissions</span>
                <div className="text-2xl font-black text-slate-900">{brokerProps.length}</div>
              </div>
              <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 shadow-xs space-y-1">
                <span className="text-[10px] uppercase font-bold text-amber-700 tracking-wider">Pending Review</span>
                <div className="text-2xl font-black text-amber-800">{pendingFeaturedCount}</div>
              </div>
              <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 shadow-xs space-y-1">
                <span className="text-[10px] uppercase font-bold text-emerald-700 tracking-wider">Live on Showcase</span>
                <div className="text-2xl font-black text-emerald-800">{approvedFeaturedCount}</div>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 shadow-xs space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Rejected</span>
                <div className="text-2xl font-black text-slate-700">{rejectedFeaturedCount}</div>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-base font-black text-slate-900">Featured Properties Verification</h3>
                  <p className="text-xs text-slate-500 mt-1">Review broker listings before approving for public map placement.</p>
                </div>
                <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
                  {(
                    [
                      ['all', `All (${brokerProps.length})`],
                      ['pending', `Pending (${pendingFeaturedCount})`],
                      ['approved', `Approved (${approvedFeaturedCount})`],
                      ['rejected', `Rejected (${rejectedFeaturedCount})`],
                    ] as const
                  ).map(([filterKey, label]) => (
                    <button
                      key={filterKey}
                      type="button"
                      onClick={() => setFeaturedFilter(filterKey)}
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${
                        featuredFilter === filterKey ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {filteredBrokerProps.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400">No properties found in this filter view.</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredBrokerProps.map(({ broker, property }) => {
                    const status = property.featuredStatus || (property.featured ? 'approved' : 'pending');
                    return (
                      <div
                        key={`${broker.id}-${property.id}`}
                        className={`p-5 rounded-2xl border transition space-y-3.5 ${
                          status === 'approved'
                            ? 'bg-emerald-50/20 border-emerald-200'
                            : status === 'pending'
                            ? 'bg-amber-50/20 border-amber-200'
                            : 'bg-slate-50/40 border-slate-200'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <span className="font-bold text-xs text-slate-900">{broker.name}</span>
                            <div className="text-[10px] text-slate-400">{broker.agency}</div>
                          </div>
                          <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${
                            status === 'approved' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : 'bg-amber-100 text-amber-800 border-amber-200'
                          }`}>
                            {status}
                          </span>
                        </div>
                        <h4 className="text-xs font-black text-slate-900">{property.title}</h4>
                        <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                          {status !== 'approved' && (
                            <button
                              onClick={() => handleApproveProperty(broker.id, property.id)}
                              className="px-3 py-1 rounded-lg bg-emerald-600 text-white font-bold text-[10px] cursor-pointer"
                            >
                              Approve
                            </button>
                          )}
                          {status !== 'rejected' && (
                            <button
                              onClick={() => handleRejectProperty(broker.id, property.id)}
                              className="px-3 py-1 rounded-lg border border-rose-200 text-rose-700 font-bold text-[10px] cursor-pointer"
                            >
                              Reject
                            </button>
                          )}
                          <button
                            onClick={() => handleTogglePropertyFeatured(broker.id, property.id)}
                            className="px-3 py-1 rounded-lg border border-slate-200 text-slate-600 font-bold text-[10px] cursor-pointer"
                          >
                            Toggle
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 6: BROADCASTS */}
        {tab === 'broadcasts' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 p-5 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
              <h3 className="text-sm font-black text-slate-900">Publish System Broadcast</h3>
              <form onSubmit={handleSendBroadcast} className="space-y-3">
                <input
                  type="text"
                  value={bTitle}
                  onChange={(e) => setBTitle(e.target.value)}
                  placeholder="Headline / Title"
                  className="w-full h-9 rounded-xl border border-slate-200 px-3 text-xs outline-none"
                  required
                />
                <select
                  value={bType}
                  onChange={(e) => setBType(e.target.value as any)}
                  className="w-full h-9 rounded-xl border border-slate-200 px-2 text-xs outline-none bg-white"
                >
                  <option value="broadcast">Official Announcement</option>
                  <option value="update">New Feature / Dataset</option>
                  <option value="system">System Notice</option>
                </select>
                <textarea
                  rows={4}
                  value={bMessage}
                  onChange={(e) => setBMessage(e.target.value)}
                  placeholder="Message body..."
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-200 outline-none resize-none"
                  required
                />
                <button
                  type="submit"
                  className="w-full h-10 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs transition cursor-pointer"
                >
                  Send Announcement Now
                </button>
              </form>
            </div>
            <div className="lg:col-span-2 p-5 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
              <h3 className="text-sm font-black text-slate-900">Active Notifications ({notifications.length})</h3>
              <div className="space-y-3">
                {notifications.map((n) => (
                  <div key={n.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase bg-purple-100 text-purple-800 px-2 py-0.5 rounded">
                        {n.type}
                      </span>
                      <span className="text-[10px] text-slate-400" suppressHydrationWarning>
                        {new Date(n.timestamp).toLocaleDateString('en-IN')}
                      </span>
                    </div>
                    <h4 className="text-xs font-black text-slate-900">{n.title}</h4>
                    <p className="text-xs text-slate-600">{n.message}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 7: FEEDBACK */}
        {tab === 'feedback' && (
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-black text-slate-900">User Inquiries &amp; Support Tickets ({activeFeedback.length})</h3>
            <div className="space-y-3">
              {activeFeedback.length === 0 ? (
                <p className="text-xs text-slate-400 py-8 text-center">No inquiries yet.</p>
              ) : (
                activeFeedback.map((fb) => (
                  <div key={fb.id} className="p-4 rounded-2xl border border-slate-200 bg-white space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-900">{fb.name} ({fb.contact})</span>
                      <span className="text-[10px] font-bold uppercase bg-slate-100 px-2 py-0.5 rounded">{fb.status}</span>
                    </div>
                    <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl">{fb.message}</p>
                    <div className="flex items-center justify-end gap-2">
                      {fb.status !== 'resolved' && (
                        <button
                          onClick={() => handleUpdateFeedbackStatus(fb.id, 'resolved')}
                          className="text-xs font-bold text-emerald-600 hover:underline cursor-pointer"
                        >
                          Mark Resolved
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}
