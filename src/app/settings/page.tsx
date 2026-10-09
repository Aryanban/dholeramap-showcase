'use client';

import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { initiateAdBoostCheckout } from '@/lib/razorpay';
import Link from 'next/link';
import SiteHeader from '@/components/panels/SiteHeader';
import SiteFooter from '@/components/panels/SiteFooter';
import {
  User,
  Palette,
  Sliders,
  HardDrive,
  Award,
  TrendingUp,
  Building2,
  Plus,
  Trash2,
  ExternalLink,
  CheckCircle2,
  ShieldCheck,
  Zap,
  ArrowUpRight,
  FileText,
  Camera,
  MapPin,
  Eye,
  Sparkles,
  Crown,
  ChevronRight,
  X,
  Share2,
  Users,
} from 'lucide-react';
import { useApp } from '@/lib/store';
import type { UserProfile } from '@/lib/types';
import { currentUserId, fileToLogoDataUrl, getBranding, saveBranding } from '@/lib/dossier/branding';
import { compressBrokerPhoto } from '@/lib/image-compress';
import {
  BrokerProfile,
  BrokerProperty,
  getUserBrokerProfile,
  saveUserBrokerProfile,
  getRankedBrokers,
  boostBrokerAdSpend,
  addBrokerProperty,
  deleteBrokerProperty,
} from '@/lib/brokers';

export default function SettingsPage() {
  const user = useApp((s) => s.user);
  const setUser = useApp((s) => s.setUser);
  const hydrateUser = useApp((s) => s.hydrateUser);
  const bookmarks = useApp((s) => s.bookmarks);
  const { user: clerkUser } = useUser();

  // Ad Boost state
  const [boostAmount, setBoostAmount] = useState('');
  const [boostBusy, setBoostBusy] = useState(false);

  // Active section tab
  const [activeTab, setActiveTab] = useState<'profile' | 'broker' | 'branding' | 'preferences'>('broker');

  // Personal Profile State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [city, setCity] = useState('');
  const [role, setRole] = useState<UserProfile['role']>('broker');
  const [unitPreference, setUnitPreference] = useState<'sqyd' | 'sqm'>('sqyd');
  const [defaultScheme, setDefaultScheme] = useState('TP 1');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Dossier branding (logo + contact)
  const [logo, setLogo] = useState<string | null>(null);
  const [bName, setBName] = useState('');
  const [bPhone, setBPhone] = useState('');
  const [bEmail, setBEmail] = useState('');
  const [bCompany, setBCompany] = useState('');
  const [bTagline, setBTagline] = useState('');
  const [logoBusy, setLogoBusy] = useState(false);

  // Broker Directory Profile State
  const [brokerProfile, setBrokerProfile] = useState<BrokerProfile | null>(null);
  const [brokerName, setBrokerName] = useState('');
  const [brokerAgency, setBrokerAgency] = useState('');
  const [brokerRera, setBrokerRera] = useState('');
  const [brokerPhone, setBrokerPhone] = useState('');
  const [brokerWhatsapp, setBrokerWhatsapp] = useState('');
  const [brokerEmail, setBrokerEmail] = useState('');
  const [brokerOffice, setBrokerOffice] = useState('');
  const [brokerExp, setBrokerExp] = useState(7);
  const [brokerSchemes, setBrokerSchemes] = useState('TP 1, TP 2A, TP 3');
  const [brokerBio, setBrokerBio] = useState('');
  const [brokerPhoto, setBrokerPhoto] = useState('');
  const [photoBusy, setPhotoBusy] = useState(false);

  // Property Manager State
  const [isAddingProp, setIsAddingProp] = useState(false);
  const [propTitle, setPropTitle] = useState('');
  const [propVillage, setPropVillage] = useState('Bhadiyad');
  const [propTpScheme, setPropTpScheme] = useState('TP 1');
  const [propFP, setPropFP] = useState('');
  const [propSurvey, setPropSurvey] = useState('');
  const [propZone, setPropZone] = useState('Residential Zone (R-1)');
  const [propRoad, setPropRoad] = useState('18m Sanctioned TP Road');
  const [propRate, setPropRate] = useState('₹15,000 / sq.yd');
  const [propDemand, setPropDemand] = useState('₹48.0 Lakhs');
  const [propHighlights, setPropHighlights] = useState('Clear Title Deed, Form 5 Sanctioned, Immediate Possession');

  useEffect(() => {
    hydrateUser();
  }, [hydrateUser]);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
      setCompany(user.company || '');
      setCity(user.city || '');
      setRole(user.role || 'broker');
      setUnitPreference(user.unitPreference || 'sqyd');
      setDefaultScheme(user.defaultScheme || 'TP 1');
      setNotificationsEnabled(user.notificationsEnabled ?? true);
    }
  }, [user]);

  // Load broker profile from storage and Supabase
  useEffect(() => {
    // The ad-spend total in Clerk is the authoritative one (written by the
    // verified-payment route). Adopt it whenever it is ahead of the local
    // copy so the ranking reflects money actually paid, on any device.
    const authoritative = Number(clerkUser?.publicMetadata?.adBoostTotal) || 0;
    if (authoritative > 0) {
      const local = getUserBrokerProfile();
      if (authoritative > (local.adSpend || 0)) {
        saveUserBrokerProfile({ adSpend: authoritative });
      }
    }
    const bp = getUserBrokerProfile();
    if (bp) {
      setBrokerProfile(bp);
      setBrokerName(bp.name || '');
      setBrokerAgency(bp.agency || '');
      setBrokerRera(bp.reraNumber || '');
      setBrokerPhone(bp.phone || '');
      setBrokerWhatsapp(bp.whatsapp || '');
      setBrokerEmail(bp.email || '');
      setBrokerOffice(bp.headOffice || '');
      setBrokerExp(bp.experienceYears || 7);
      setBrokerSchemes(bp.tpSchemes ? bp.tpSchemes.join(', ') : 'TP 1, TP 2A');
      setBrokerBio(bp.description || '');
      setBrokerPhoto(bp.photoUrl || '');
    }

    if (clerkUser) {
      fetch('/api/brokers/profile')
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.profile) {
            const serverProfile = data.profile;
            setBrokerProfile(serverProfile);
            setBrokerName(serverProfile.name || '');
            setBrokerAgency(serverProfile.agency || '');
            setBrokerRera(serverProfile.reraNumber || '');
            setBrokerPhone(serverProfile.phone || '');
            setBrokerWhatsapp(serverProfile.whatsapp || '');
            setBrokerEmail(serverProfile.email || '');
            setBrokerOffice(serverProfile.headOffice || '');
            setBrokerExp(serverProfile.experienceYears || 7);
            setBrokerSchemes(
              serverProfile.tpSchemes && serverProfile.tpSchemes.length > 0
                ? serverProfile.tpSchemes.join(', ')
                : 'TP 1, TP 2A'
            );
            setBrokerBio(serverProfile.description || '');
            if (serverProfile.photoUrl) setBrokerPhoto(serverProfile.photoUrl);
            saveUserBrokerProfile(serverProfile);
          }
        })
        .catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clerkUser?.publicMetadata?.adBoostTotal, clerkUser]);

  useEffect(() => {
    if (!toastMsg) return;
    const t = setTimeout(() => setToastMsg(null), 3500);
    return () => clearTimeout(t);
  }, [toastMsg]);

  // Load saved branding from IndexedDB and Supabase
  useEffect(() => {
    const bid = currentUserId(user);
    if (!bid) return;
    void getBranding(bid).then((b) => {
      if (b) {
        setLogo(b.logoDataUrl);
        setBName(b.name);
        setBPhone(b.phone);
        setBEmail(b.email);
        setBCompany(b.company);
        setBTagline(b.tagline);
      } else {
        setBName(user?.name || '');
        setBPhone(user?.phone || '');
        setBEmail(user?.email || '');
        setBCompany(user?.company || '');
      }
    });

    if (clerkUser) {
      fetch('/api/user/branding')
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.branding) {
            const b = data.branding;
            setLogo(b.logoDataUrl);
            setBName(b.name);
            setBPhone(b.phone);
            setBEmail(b.email);
            setBCompany(b.company);
            setBTagline(b.tagline);
            saveBranding(b).catch(() => {});
          }
        })
        .catch(() => {});
    }
  }, [user, clerkUser]);

  // Photo uploader for broker profile with client-side downscaling and strict size limits
  async function handleBrokerPhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoBusy(true);
    try {
      // Compresses to max 400x400 at 85% quality, strict 5MB input ceiling
      const result = await compressBrokerPhoto(file, 400, 0.85);
      setBrokerPhoto(result.dataUrl);
      const updated = saveUserBrokerProfile({ photoUrl: result.dataUrl });
      setBrokerProfile(updated);
      if (clerkUser) {
        fetch('/api/brokers/profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...updated, photoUrl: result.dataUrl }),
        }).catch(() => {});
      }
      setToastMsg(`Photo optimized to ${result.compressedSizeKb} KB (${result.compressionRatio}% smaller)! Zero server load.`);
    } catch (err: any) {
      setToastMsg(err?.message || 'Could not process that photo. Please choose a smaller image.');
    } finally {
      setPhotoBusy(false);
      e.target.value = '';
    }
  }

  function handleSaveBrokerProfile(e: React.FormEvent) {
    e.preventDefault();
    const profilePayload = {
      name: brokerName.trim() || 'Apex Advisory & Land Partner',
      agency: brokerAgency.trim() || 'Dholera Premier Realty Advisory',
      reraNumber: brokerRera.trim() || 'PR/GJ/AHMEDABAD/AA01099/2025',
      phone: brokerPhone.trim() || '+919825012345',
      whatsapp: brokerWhatsapp.trim() || '919825012345',
      email: brokerEmail.trim() || 'partner@dholerapremier.com',
      headOffice: brokerOffice.trim() || 'Commercial Hub, TP 1, Dholera SIR',
      experienceYears: Number(brokerExp) || 7,
      tpSchemes: brokerSchemes.split(',').map((s) => s.trim()).filter(Boolean),
      description: brokerBio.trim(),
      photoUrl: brokerPhoto,
    };
    const updated = saveUserBrokerProfile(profilePayload);
    setBrokerProfile(updated);
    if (clerkUser) {
      fetch('/api/brokers/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profilePayload),
      }).catch(() => {});
    }
    setToastMsg('Broker directory profile saved! Public showcase page updated.');
  }

  // Dynamic ranking calculation
  const [rankedBrokers, setRankedBrokers] = useState<BrokerProfile[]>(() => getRankedBrokers());

  async function refreshRanking() {
    try {
      const res = await fetch('/api/brokers/ranking');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.brokers)) {
          setRankedBrokers(data.brokers);
          return;
        }
      }
    } catch {
      // Fallback
    }
    setRankedBrokers(getRankedBrokers());
  }

  useEffect(() => {
    refreshRanking();
  }, []);

  const brokerRankIdx = rankedBrokers.findIndex((b) => b.id === clerkUser?.id || b.id === 'user-broker');
  const currentRank = brokerRankIdx >= 0 ? brokerRankIdx + 1 : rankedBrokers.length;
  const topBroker = rankedBrokers[0];
  const topBrokerSpend = topBroker ? topBroker.totalMonthlySpend : 25000;
  const userSpend = brokerProfile?.totalMonthlySpend || 9499;
  const gapToTop = Math.max(0, topBrokerSpend - userSpend + 500);

  async function handleBoostSpend(amount: number) {
    if (amount < 500) {
      setToastMsg('Minimum boost amount is ₹500');
      return;
    }
    setBoostBusy(true);
    try {
      await initiateAdBoostCheckout({
        amountInr: amount,
        userEmail: clerkUser?.primaryEmailAddress?.emailAddress || '',
        userName: clerkUser?.fullName || brokerProfile?.name || '',
        userPhone: brokerProfile?.phone || '',
        onSuccess: async (result) => {
          // Update local state after verified payment
          await refreshRanking();
          setBrokerProfile(getUserBrokerProfile());
          const freshList = getRankedBrokers();
          const newIdx = freshList.findIndex((b) => b.id === 'user-broker');
          const newRank = newIdx >= 0 ? newIdx + 1 : 1;
          setToastMsg(
            result.alreadyRecorded
              ? `Payment already applied — you are Rank #${newRank}.`
              : `✅ Payment Verified! +₹${result.boostApplied.toLocaleString('en-IN')} added. You are now Rank #${newRank}!`
          );
          setBoostAmount('');
          setBoostBusy(false);
        },
        onFailure: (err) => {
          setToastMsg(`❌ Payment failed: ${err.message}`);
          setBoostBusy(false);
        },
      });
    } catch (err) {
      setToastMsg(`❌ ${err instanceof Error ? err.message : 'Payment failed'}`);
      setBoostBusy(false);
    }
  }

  // Property Manager Handlers
  function handleAddProperty(e: React.FormEvent) {
    e.preventDefault();
    if (!propTitle.trim() || !propFP.trim() || !propVillage.trim()) {
      setToastMsg('Please enter Property Title, Village, and Final Plot (FP) number.');
      return;
    }

    const propPayload = {
      title: propTitle.trim(),
      village: propVillage.trim(),
      tpScheme: propTpScheme.trim() || 'TP 1',
      sid: propTpScheme.toLowerCase().replace(/\s+/g, '') || 'tp1',
      fp: propFP.trim(),
      survey: propSurvey.trim() || '—',
      zone: propZone.trim() || 'Residential Zone (R-1)',
      roadWidth: propRoad.trim() || '18m Sanctioned TP Road',
      pricePerSqYd: propRate.trim() || '₹15,000 / sq.yd',
      totalDemand: propDemand.trim() || '₹48.0 Lakhs',
      highlights: propHighlights
        ? propHighlights.split(',').map((h) => h.trim()).filter(Boolean)
        : ['Clear Title Deed', 'Form 5 Sanctioned', 'Immediate Possession'],
      hasBrochure: true,
      status: 'available' as const,
    };

    const newProp = addBrokerProperty('user-broker', propPayload);

    if (clerkUser) {
      fetch('/api/brokers/properties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...propPayload, id: newProp.id }),
      }).catch(() => {});
    }

    setBrokerProfile(getUserBrokerProfile());
    setIsAddingProp(false);
    setPropTitle('');
    setPropFP('');
    setPropSurvey('');
    setToastMsg('Property added to your public broker showcase page!');
  }

  function handleDeleteProperty(propId: string) {
    if (confirm('Remove this property listing from your public showcase page?')) {
      deleteBrokerProperty('user-broker', propId);
      if (clerkUser) {
        fetch(`/api/brokers/properties?id=${encodeURIComponent(propId)}`, {
          method: 'DELETE',
        }).catch(() => {});
      }
      setBrokerProfile(getUserBrokerProfile());
      setToastMsg('Property listing removed.');
    }
  }

  async function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setLogoBusy(true);
    try {
      setLogo(await fileToLogoDataUrl(f));
    } catch {
      setToastMsg('Could not load that image. Use a PNG or JPG logo.');
    } finally {
      setLogoBusy(false);
      e.target.value = '';
    }
  }

  async function handleSaveBranding(e: React.FormEvent) {
    e.preventDefault();
    const bid = currentUserId(user);
    if (!bid) return;
    const brandingPayload = {
      userId: bid,
      logoDataUrl: logo,
      name: bName.trim(),
      phone: bPhone.trim(),
      email: bEmail.trim(),
      company: bCompany.trim(),
      tagline: bTagline.trim(),
    };
    try {
      await saveBranding(brandingPayload);
      if (clerkUser) {
        fetch('/api/user/branding', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(brandingPayload),
        }).catch(() => {});
      }
      setToastMsg('Dossier branding saved — applied to generated PDFs.');
    } catch {
      setToastMsg('Could not save branding. Please try again.');
    }
  }

  function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    const updated: UserProfile = {
      id: user?.id || `usr-${Date.now().toString(36)}`,
      name: name.trim() || 'Dholera Investor',
      email: email.trim() || 'investor@dholeramap.com',
      phone: phone.trim() || '+91 98250 12345',
      company: company.trim() || undefined,
      city: city.trim() || 'Ahmedabad',
      role,
      unitPreference,
      defaultScheme,
      notificationsEnabled,
      createdAt: user?.createdAt || Date.now(),
    };
    setUser(updated);
    setToastMsg('Profile and preferences updated successfully!');
  }

  function handleExportBackup() {
    const data = {
      profile: user,
      brokerProfile: getUserBrokerProfile(),
      bookmarks,
      exportedAt: new Date().toISOString(),
      source: 'DholeraMap Interactive Blueprint GIS',
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dholeramap_backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setToastMsg('Data backup downloaded successfully.');
  }

  function handleClearData() {
    if (confirm('Are you sure you want to clear your locally saved bookmarks and broker data? This action cannot be undone.')) {
      try {
        localStorage.removeItem('dholera-bookmarks-v1');
        localStorage.removeItem('dholera-user-profile');
        localStorage.removeItem('dholera-user-broker-profile');
        localStorage.removeItem('dholera-ranked-brokers');
        localStorage.removeItem('dholera-notifications');
      } catch {}
      window.location.reload();
    }
  }

  const card = 'p-6 sm:p-7 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-6';

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col font-sans">
      <SiteHeader activePage="settings" />

      {/* Floating Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-[2000] p-4 bg-slate-950 text-white text-xs font-bold rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-800 animate-in fade-in slide-in-from-bottom-2">
          <span>{toastMsg}</span>
          <button onClick={() => setToastMsg(null)} className="text-slate-400 hover:text-white cursor-pointer ml-1">✕</button>
        </div>
      )}

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
              Account &amp; Broker Studio
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Manage your public broker showcase, monthly directory spend ranking, listed properties, and interactive map preferences.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/brokers/user-broker"
              target="_blank"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold text-xs border border-blue-200 transition"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Preview My Broker Page</span>
              <ExternalLink className="w-3 h-3 ml-0.5" />
            </Link>
          </div>
        </div>

        {/* Tab Navigation Navigation */}
        <div className="flex items-center gap-2 p-1.5 bg-slate-100 rounded-2xl overflow-x-auto scrollbar-none border border-slate-200/80">
          <button
            onClick={() => setActiveTab('broker')}
            className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition cursor-pointer whitespace-nowrap ${
              activeTab === 'broker'
                ? 'bg-white text-blue-700 shadow-xs border border-slate-200/60'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <Crown className="w-3.5 h-3.5 text-amber-500" />
            <span>Broker Directory &amp; Ranking</span>
            <span className="px-1.5 py-0.2 bg-amber-100 text-amber-800 rounded text-[10px] font-bold">
              Rank #{currentRank}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition cursor-pointer whitespace-nowrap ${
              activeTab === 'profile'
                ? 'bg-white text-blue-700 shadow-xs border border-slate-200/60'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <User className="w-3.5 h-3.5 text-slate-500" />
            <span>Personal Profile</span>
          </button>

          <button
            onClick={() => setActiveTab('branding')}
            className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition cursor-pointer whitespace-nowrap ${
              activeTab === 'branding'
                ? 'bg-white text-blue-700 shadow-xs border border-slate-200/60'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <Palette className="w-3.5 h-3.5 text-purple-500" />
            <span>Dossier PDF Branding</span>
          </button>

          <button
            onClick={() => setActiveTab('preferences')}
            className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition cursor-pointer whitespace-nowrap ${
              activeTab === 'preferences'
                ? 'bg-white text-blue-700 shadow-xs border border-slate-200/60'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <Sliders className="w-3.5 h-3.5 text-emerald-500" />
            <span>GIS &amp; Preferences</span>
          </button>
        </div>

        {/* ======================================================== */}
        {/* TAB 1: BROKER DIRECTORY, SPEND RANKING & PROPERTIES     */}
        {/* ======================================================== */}
        {activeTab === 'broker' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* 1. Dynamic Ranking Booster Banner */}
            <section className="bg-white text-slate-900 rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs relative overflow-hidden">
              <div className="absolute right-0 top-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2 max-w-xl">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-xs font-black uppercase tracking-wider">
                      <Crown className="w-3.5 h-3.5 text-amber-600" />
                      Dynamic Spend-Based Ranking
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
                      <Users className="w-3.5 h-3.5 text-emerald-600" />
                      1,000+ Monthly Active Viewers
                    </span>
                  </div>

                  <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
                    Directory Rank: #{currentRank} of {rankedBrokers.length} Brokers
                  </h2>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    Brokers on DholeraMap are ranked strictly by total monthly platform investment (Monthly Subscription + Carrots/Credits + Advertisement Budget). The highest spender ranks at #1 as the Top Sponsor, gaining prime front-page exposure in front of 1,000+ high-net-worth investors and buyers actively looking for verified final plots in Dholera SIR every month.
                  </p>
                </div>

                {/* Spend Score Card */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 flex flex-col items-center md:items-end shrink-0 text-center md:text-right">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Your Total Monthly Spend
                  </span>
                  <span className="text-2xl sm:text-3xl font-black text-amber-600 mt-1">
                    ₹{(userSpend || 0).toLocaleString('en-IN')}
                    <span className="text-xs font-normal text-slate-400">/mo</span>
                  </span>
                  <span className="text-[11px] text-emerald-700 font-semibold mt-1">
                    {currentRank === 1 ? '👑 Leading the Broker Directory at #1' : `₹${gapToTop.toLocaleString('en-IN')} more to take #1`}
                  </span>
                </div>
              </div>

              {/* Spend Breakdown Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-6 mt-6 border-t border-slate-100">
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/80">
                  <span className="text-[10px] text-slate-500 block font-semibold">1. Monthly Subscription</span>
                  <span className="text-sm font-bold text-slate-900 mt-0.5 block">
                    ₹{(brokerProfile?.subscriptionSpend || 1999).toLocaleString('en-IN')}/mo
                  </span>
                  <span className="text-[10px] text-slate-500">Pro GIS &amp; Broker Studio</span>
                </div>

                <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/80">
                  <span className="text-[10px] text-slate-500 block font-semibold">2. Credits / Carrots</span>
                  <span className="text-sm font-bold text-slate-900 mt-0.5 block">
                    ₹{(brokerProfile?.creditsSpend || 2500).toLocaleString('en-IN')}/mo
                  </span>
                  <span className="text-[10px] text-slate-500">Dossier PDF exports</span>
                </div>

                <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/80">
                  <span className="text-[10px] text-slate-500 block font-semibold">3. Active Ad Campaign Budget</span>
                  <span className="text-sm font-bold text-amber-700 mt-0.5 block">
                    ₹{(brokerProfile?.adSpend || 0).toLocaleString('en-IN')}/mo
                  </span>
                  <span className="text-[10px] text-slate-500">Direct ranking elevation</span>
                </div>
              </div>

              {/* ── Boost Your Rank (Razorpay Integrated) ── */}
              <div className="pt-6 mt-6 border-t border-slate-200">
                <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-5 sm:p-6 text-white">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center">
                      <Zap className="w-4 h-4 text-amber-400" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">Boost Your Rank</h3>
                      <p className="text-[11px] text-slate-400">Pay to increase your ad budget &amp; climb the directory</p>
                    </div>
                  </div>

                  {/* Custom Amount Input */}
                  <div className="mt-4">
                    <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                      Enter Boost Amount (₹)
                    </label>
                    <div className="flex items-stretch gap-2">
                      <div className="relative flex-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">₹</span>
                        <input
                          type="number"
                          min="500"
                          step="500"
                          placeholder="5,000"
                          value={boostAmount}
                          onChange={(e) => setBoostAmount(e.target.value)}
                          disabled={boostBusy}
                          className="w-full pl-8 pr-3 py-2.5 rounded-xl bg-white/10 border border-white/15 text-white font-bold text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition disabled:opacity-50"
                        />
                      </div>
                      <button
                        type="button"
                        disabled={boostBusy || !boostAmount || Number(boostAmount) < 500}
                        onClick={() => handleBoostSpend(Number(boostAmount))}
                        className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:bg-slate-600 disabled:text-slate-400 text-slate-950 font-black text-sm transition cursor-pointer active:scale-95 disabled:cursor-not-allowed flex items-center gap-1.5 shrink-0"
                      >
                        {boostBusy ? (
                          <span className="flex items-center gap-1.5">
                            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>
                            Processing…
                          </span>
                        ) : (
                          <>
                            <ShieldCheck className="w-4 h-4" />
                            Pay &amp; Boost
                          </>
                        )}
                      </button>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1.5">Minimum ₹500 · Secure payment via Razorpay (UPI, Cards, NetBanking)</p>
                  </div>

                  {/* Quick-Pick Presets */}
                  <div className="flex flex-wrap items-center gap-2 mt-3">
                    <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mr-1">Quick:</span>
                    {[1000, 2000, 5000, 10000].map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        disabled={boostBusy}
                        onClick={() => setBoostAmount(String(amt))}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer active:scale-95 ${
                          boostAmount === String(amt)
                            ? 'bg-amber-500/30 text-amber-300 border border-amber-500/50'
                            : 'bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10'
                        }`}
                      >
                        ₹{amt.toLocaleString('en-IN')}
                      </button>
                    ))}
                    {gapToTop > 0 && currentRank > 1 && (
                      <button
                        type="button"
                        disabled={boostBusy}
                        onClick={() => setBoostAmount(String(gapToTop))}
                        className="px-3 py-1 rounded-lg bg-gradient-to-r from-amber-600/30 to-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold transition cursor-pointer active:scale-95 flex items-center gap-1"
                      >
                        <Crown className="w-3 h-3" />
                        ₹{gapToTop.toLocaleString('en-IN')} to #1
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </section>

            {/* 2. Broker Public Profile Form */}
            <section className={card}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-black text-sm">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-base font-black text-slate-900">
                      Public Broker Profile &amp; Directory Listing
                    </h2>
                    <p className="text-xs text-slate-400">
                      This information and photo is displayed publicly on <Link href="/brokers" className="text-blue-600 hover:underline">/brokers</Link> and your dedicated showcase page.
                    </p>
                  </div>
                </div>

                <Link
                  href="/brokers/user-broker"
                  target="_blank"
                  className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 transition"
                >
                  <span>View Public Page</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>

              <form onSubmit={handleSaveBrokerProfile} className="space-y-5">
                {/* Photo Uploader */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="relative w-20 h-20 rounded-full border-2 border-slate-300 bg-white overflow-hidden shadow-xs shrink-0 flex items-center justify-center">
                    {brokerPhoto ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={brokerPhoto} alt="Broker Profile" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-8 h-8 text-slate-300" />
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-xs font-bold text-slate-800 block">
                      Profile Photo (Visible to Investors)
                    </span>
                    <p className="text-[11px] text-slate-500">
                      Upload a high-resolution professional portrait. Recommended 400x400 JPG or PNG.
                    </p>

                    <div className="flex items-center gap-2 pt-1">
                      <label className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 transition cursor-pointer shadow-2xs">
                        {photoBusy ? 'Processing…' : brokerPhoto ? 'Change Photo' : 'Upload Photo'}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleBrokerPhotoUpload}
                          disabled={photoBusy}
                        />
                      </label>
                      {brokerPhoto && (
                        <button
                          type="button"
                          onClick={() => {
                            setBrokerPhoto('');
                            saveUserBrokerProfile({ photoUrl: '' });
                            setToastMsg('Photo removed.');
                          }}
                          className="text-xs font-semibold text-rose-600 hover:text-rose-700 cursor-pointer px-2"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Form Fields Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Broker / Advisor Full Name
                    </label>
                    <input
                      type="text"
                      value={brokerName}
                      onChange={(e) => setBrokerName(e.target.value)}
                      placeholder="e.g. Rajesh V. Patel"
                      className="w-full h-10 rounded-xl border border-slate-200 px-3 text-xs outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Agency / Firm Name
                    </label>
                    <input
                      type="text"
                      value={brokerAgency}
                      onChange={(e) => setBrokerAgency(e.target.value)}
                      placeholder="e.g. Dholera Apex Land Advisory & Infra"
                      className="w-full h-10 rounded-xl border border-slate-200 px-3 text-xs outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      RERA Registration Number
                    </label>
                    <input
                      type="text"
                      value={brokerRera}
                      onChange={(e) => setBrokerRera(e.target.value)}
                      placeholder="e.g. PR/GJ/AHMEDABAD/AA00941/2024"
                      className="w-full h-10 rounded-xl border border-slate-200 px-3 text-xs font-mono outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Years of Experience in Dholera SIR
                    </label>
                    <input
                      type="number"
                      value={brokerExp}
                      onChange={(e) => setBrokerExp(Number(e.target.value))}
                      placeholder="7"
                      min={1}
                      max={40}
                      className="w-full h-10 rounded-xl border border-slate-200 px-3 text-xs outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Direct Phone Number
                    </label>
                    <input
                      type="tel"
                      value={brokerPhone}
                      onChange={(e) => setBrokerPhone(e.target.value)}
                      placeholder="+91 98250 12345"
                      className="w-full h-10 rounded-xl border border-slate-200 px-3 text-xs outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      WhatsApp Number (For Direct Investor Inquiries)
                    </label>
                    <input
                      type="text"
                      value={brokerWhatsapp}
                      onChange={(e) => setBrokerWhatsapp(e.target.value)}
                      placeholder="919825012345"
                      className="w-full h-10 rounded-xl border border-slate-200 px-3 text-xs outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Official Email Address
                    </label>
                    <input
                      type="email"
                      value={brokerEmail}
                      onChange={(e) => setBrokerEmail(e.target.value)}
                      placeholder="advisory@dholerapremier.com"
                      className="w-full h-10 rounded-xl border border-slate-200 px-3 text-xs outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Primary TP Schemes Handled (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={brokerSchemes}
                      onChange={(e) => setBrokerSchemes(e.target.value)}
                      placeholder="TP 1, TP 2A, TP 2B, TP 3"
                      className="w-full h-10 rounded-xl border border-slate-200 px-3 text-xs outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Head Office / Physical Address
                  </label>
                  <input
                    type="text"
                    value={brokerOffice}
                    onChange={(e) => setBrokerOffice(e.target.value)}
                    placeholder="Unit 402, ABCD Building, Activation Zone, Dholera SIR, Gujarat"
                    className="w-full h-10 rounded-xl border border-slate-200 px-3 text-xs outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Advisory Description &amp; Track Record
                  </label>
                  <textarea
                    rows={3}
                    value={brokerBio}
                    onChange={(e) => setBrokerBio(e.target.value)}
                    placeholder="Specialist advisory providing direct verified investor access to Town Planning 1 & 2 parcels with complete GTPUD Form 4/5 cross-verification."
                    className="w-full rounded-xl border border-slate-200 p-3 text-xs outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition leading-relaxed"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition active:scale-[0.98] cursor-pointer"
                  >
                    Save Public Broker Profile
                  </button>
                </div>
              </form>
            </section>

            {/* 3. My Listed Selling Properties Portfolio */}
            <section className={card}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-black text-slate-900">
                      My Listed Selling Properties
                    </h2>
                    <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-black border border-blue-200">
                      {(brokerProfile?.properties || []).length} Parcels Listed
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Showcase your verified Dholera parcels on your broker profile. Investors can inspect them directly on the interactive blueprint or download PDF brochures.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsAddingProp(!isAddingProp)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition cursor-pointer self-start sm:self-auto"
                >
                  <Plus className="w-4 h-4" />
                  <span>{isAddingProp ? 'Cancel' : '＋ Add New Property'}</span>
                </button>
              </div>

              {/* Add Property Collapsible Drawer */}
              {isAddingProp && (
                <form
                  onSubmit={handleAddProperty}
                  className="p-5 rounded-2xl bg-blue-50/50 border border-blue-200 space-y-4 animate-in fade-in"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-blue-200/60">
                    <span className="text-xs font-black text-blue-900 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                      List a New Dholera Final Plot (Derived from Official Blueprint)
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsAddingProp(false)}
                      className="text-xs font-bold text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="sm:col-span-2">
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">
                        Listing Title
                      </label>
                      <input
                        type="text"
                        value={propTitle}
                        onChange={(e) => setPropTitle(e.target.value)}
                        placeholder="e.g. FP 412 — Prime 18m Corridor Corner Commercial Parcel"
                        className="w-full h-9 rounded-xl border border-slate-200 bg-white px-3 text-xs outline-none focus:border-blue-500 transition"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">
                        Village Name
                      </label>
                      <select
                        value={propVillage}
                        onChange={(e) => setPropVillage(e.target.value)}
                        className="w-full h-9 rounded-xl border border-slate-200 bg-white px-3 text-xs outline-none focus:border-blue-500 transition"
                      >
                        <option value="Bhadiyad">Bhadiyad</option>
                        <option value="Kadipur">Kadipur</option>
                        <option value="Otariya">Otariya</option>
                        <option value="Ambli">Ambli</option>
                        <option value="Fedra">Fedra</option>
                        <option value="Bavliyari">Bavliyari</option>
                        <option value="Gorasu">Gorasu</option>
                        <option value="Hebatpur">Hebatpur</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">
                        Town Planning Scheme
                      </label>
                      <select
                        value={propTpScheme}
                        onChange={(e) => setPropTpScheme(e.target.value)}
                        className="w-full h-9 rounded-xl border border-slate-200 bg-white px-3 text-xs outline-none focus:border-blue-500 transition"
                      >
                        <option value="TP 1">TP 1 (Town Planning Scheme 1)</option>
                        <option value="TP 2A">TP 2A (Industrial &amp; Logistics)</option>
                        <option value="TP 2B">TP 2B (High-Tech &amp; Mixed)</option>
                        <option value="TP 3">TP 3 (City Centre &amp; Commercial)</option>
                        <option value="TP 4">TP 4 (Solar &amp; Knowledge Park)</option>
                        <option value="TP 5">TP 5 (Corridor East)</option>
                        <option value="TP 6">TP 6 (Airport &amp; Aerocity)</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">
                        Final Plot (FP) Number
                      </label>
                      <input
                        type="text"
                        value={propFP}
                        onChange={(e) => setPropFP(e.target.value)}
                        placeholder="e.g. 412"
                        className="w-full h-9 rounded-xl border border-slate-200 bg-white px-3 text-xs font-mono outline-none focus:border-blue-500 transition"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">
                        Revenue Survey (RS) Number
                      </label>
                      <input
                        type="text"
                        value={propSurvey}
                        onChange={(e) => setPropSurvey(e.target.value)}
                        placeholder="e.g. 210"
                        className="w-full h-9 rounded-xl border border-slate-200 bg-white px-3 text-xs font-mono outline-none focus:border-blue-500 transition"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">
                        Zoning Classification
                      </label>
                      <select
                        value={propZone}
                        onChange={(e) => setPropZone(e.target.value)}
                        className="w-full h-9 rounded-xl border border-slate-200 bg-white px-3 text-xs outline-none focus:border-blue-500 transition"
                      >
                        <option value="Residential Zone (R-1)">Residential Zone (R-1)</option>
                        <option value="Commercial Zone (C-1)">Commercial Zone (C-1)</option>
                        <option value="High-FAR Commercial Corridor">High-FAR Commercial Corridor</option>
                        <option value="Industrial / General Manufacturing">Industrial / General Manufacturing</option>
                        <option value="Logistics & Warehousing">Logistics &amp; Warehousing</option>
                        <option value="Knowledge & IT Park">Knowledge &amp; IT Park</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">
                        Road Frontage Width
                      </label>
                      <input
                        type="text"
                        value={propRoad}
                        onChange={(e) => setPropRoad(e.target.value)}
                        placeholder="e.g. 18m Sanctioned TP Road"
                        className="w-full h-9 rounded-xl border border-slate-200 bg-white px-3 text-xs outline-none focus:border-blue-500 transition"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">
                        Indicative Rate per sq.yd
                      </label>
                      <input
                        type="text"
                        value={propRate}
                        onChange={(e) => setPropRate(e.target.value)}
                        placeholder="e.g. ₹15,000 / sq.yd"
                        className="w-full h-9 rounded-xl border border-slate-200 bg-white px-3 text-xs outline-none focus:border-blue-500 transition"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">
                        Total Asking Demand
                      </label>
                      <input
                        type="text"
                        value={propDemand}
                        onChange={(e) => setPropDemand(e.target.value)}
                        placeholder="e.g. ₹51.0 Lakhs"
                        className="w-full h-9 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-900 outline-none focus:border-blue-500 transition"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">
                        Highlights (comma-separated tags)
                      </label>
                      <input
                        type="text"
                        value={propHighlights}
                        onChange={(e) => setPropHighlights(e.target.value)}
                        placeholder="Clear Title Deed, Form 5 Sanctioned, Immediate Possession"
                        className="w-full h-9 rounded-xl border border-slate-200 bg-white px-3 text-xs outline-none focus:border-blue-500 transition"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsAddingProp(false)}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition cursor-pointer"
                    >
                      Save &amp; Publish Property
                    </button>
                  </div>
                </form>
              )}

              {/* Property Cards List */}
              {(!brokerProfile?.properties || brokerProfile.properties.length === 0) ? (
                <div className="text-center py-10 border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                  <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <span className="text-xs font-bold text-slate-700 block">No Properties Listed Yet</span>
                  <p className="text-[11px] text-slate-400 mt-1 max-w-sm mx-auto">
                    Click &ldquo;Add New Property&rdquo; above to list verified Dholera parcels on your public showcase profile.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {brokerProfile.properties.map((prop) => (
                    <div
                      key={prop.id}
                      className="rounded-2xl border border-slate-200 bg-white p-4.5 hover:border-slate-300 hover:shadow-xs transition space-y-3 flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-xs font-black text-slate-900 leading-snug">
                            {prop.title}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleDeleteProperty(prop.id)}
                            className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer shrink-0"
                            title="Delete listing"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Statutory Property Badges */}
                        <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
                          <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-bold border border-blue-200">
                            FP {prop.fp}
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-semibold">
                            Survey {prop.survey}
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-semibold">
                            {prop.village} · {prop.tpScheme}
                          </span>
                        </div>

                        {/* Pricing & Road */}
                        <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-slate-50 text-[11px]">
                          <div>
                            <span className="text-slate-400 block text-[10px]">Asking Demand</span>
                            <span className="font-black text-slate-900">{prop.totalDemand}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[10px]">Frontage</span>
                            <span className="font-semibold text-slate-700 truncate block">{prop.roadWidth}</span>
                          </div>
                        </div>
                      </div>

                      {/* Card Actions */}
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold">
                        <Link
                          href={`/map?scheme=${encodeURIComponent(prop.tpScheme)}&fp=${prop.fp}`}
                          className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Inspect on Map</span>
                        </Link>

                        <div className="flex items-center gap-1 text-slate-400 text-[10px]">
                          <FileText className="w-3 h-3 text-emerald-600" />
                          <span>PDF Ready</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 2: PERSONAL & PROFESSIONAL PROFILE                  */}
        {/* ======================================================== */}
        {activeTab === 'profile' && (
          <section className={card}>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <User className="w-5 h-5 text-blue-600 shrink-0" />
                <h2 className="text-sm font-black text-slate-900">Personal &amp; Professional Profile</h2>
              </div>
              {user?.role && (
                <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full">
                  {user.role}
                </span>
              )}
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Rajesh Patel"
                    className="w-full h-9 rounded-xl border border-slate-200 px-3 text-xs outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
                    required
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. rajesh@apexland.in"
                    className="w-full h-9 rounded-xl border border-slate-200 px-3 text-xs outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Mobile / WhatsApp</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98250 12345"
                    className="w-full h-9 rounded-xl border border-slate-200 px-3 text-xs outline-none focus:border-blue-500 transition"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Role / Persona</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as any)}
                    className="w-full h-9 rounded-xl border border-slate-200 px-2 text-xs outline-none bg-white focus:border-blue-500 transition"
                  >
                    <option value="broker">Real Estate Broker</option>
                    <option value="investor">Land Investor</option>
                    <option value="developer">Builder / Developer</option>
                    <option value="owner">Landowner</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Operating City</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Ahmedabad &amp; Dholera"
                    className="w-full h-9 rounded-xl border border-slate-200 px-3 text-xs outline-none focus:border-blue-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Company / Consultancy Name</label>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="e.g. Dholera Land Advisory &amp; Investments"
                  className="w-full h-9 rounded-xl border border-slate-200 px-3 text-xs outline-none focus:border-blue-500 transition"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition active:scale-[0.98] cursor-pointer"
                >
                  Save Profile Changes
                </button>
              </div>
            </form>
          </section>
        )}

        {/* ======================================================== */}
        {/* TAB 3: DOSSIER BRANDING (PDF LOGO & TAGLINE)            */}
        {/* ======================================================== */}
        {activeTab === 'branding' && (
          <section className={card}>
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
              <Palette className="w-5 h-5 text-purple-600 shrink-0" />
              <div>
                <h2 className="text-sm font-black text-slate-900">Dossier Branding</h2>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Your logo + contact details, applied automatically to every PDF dossier you generate for saved plots.
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveBranding} className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-2xl border border-slate-200 bg-slate-50 grid place-items-center overflow-hidden shrink-0">
                  {logo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={logo} alt="Your logo" className="w-full h-full object-contain" />
                  ) : (
                    <span className="text-[10px] text-slate-400 text-center px-1">No logo yet</span>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <label className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer w-fit">
                    {logoBusy ? 'Processing…' : logo ? 'Replace logo' : '＋ Upload logo'}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleLogoChange}
                      disabled={logoBusy}
                    />
                  </label>
                  {logo && (
                    <button
                      type="button"
                      onClick={() => setLogo(null)}
                      className="text-[11px] font-bold text-rose-500 hover:text-rose-700 cursor-pointer w-fit"
                    >
                      Remove logo
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Brand / Agent Name</label>
                  <input
                    type="text"
                    value={bName}
                    onChange={(e) => setBName(e.target.value)}
                    placeholder="e.g. Rajesh Patel"
                    className="w-full h-9 rounded-xl border border-slate-200 px-3 text-xs outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Company / Agency</label>
                  <input
                    type="text"
                    value={bCompany}
                    onChange={(e) => setBCompany(e.target.value)}
                    placeholder="e.g. Apex Land Advisory"
                    className="w-full h-9 rounded-xl border border-slate-200 px-3 text-xs outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Mobile / WhatsApp</label>
                  <input
                    type="tel"
                    value={bPhone}
                    onChange={(e) => setBPhone(e.target.value)}
                    placeholder="+91 98250 12345"
                    className="w-full h-9 rounded-xl border border-slate-200 px-3 text-xs outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Email</label>
                  <input
                    type="email"
                    value={bEmail}
                    onChange={(e) => setBEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full h-9 rounded-xl border border-slate-200 px-3 text-xs outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Tagline <span className="font-medium text-slate-400">(optional)</span>
                </label>
                <input
                  type="text"
                  value={bTagline}
                  onChange={(e) => setBTagline(e.target.value)}
                  placeholder="e.g. Dholera SIR Land Specialist"
                  className="w-full h-9 rounded-xl border border-slate-200 px-3 text-xs outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition active:scale-[0.98] cursor-pointer"
                >
                  Save Branding
                </button>
              </div>
            </form>
          </section>
        )}

        {/* ======================================================== */}
        {/* TAB 4: GIS & INTERACTIVE MAP PREFERENCES              */}
        {/* ======================================================== */}
        {activeTab === 'preferences' && (
          <div className="space-y-6">
            <section className={card}>
              <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
                <Sliders className="w-5 h-5 text-emerald-600 shrink-0" />
                <h2 className="text-sm font-black text-slate-900">GIS &amp; Interactive Display Preferences</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Area Units Display</label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setUnitPreference('sqyd')}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                        unitPreference === 'sqyd'
                          ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      Square Yards (Var / Vigha)
                    </button>
                    <button
                      type="button"
                      onClick={() => setUnitPreference('sqm')}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                        unitPreference === 'sqm'
                          ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      Square Metres (m²)
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Default Town Planning Scheme</label>
                  <select
                    value={defaultScheme}
                    onChange={(e) => setDefaultScheme(e.target.value)}
                    className="w-full h-9 rounded-xl border border-slate-200 px-3 text-xs outline-none bg-white focus:border-blue-500"
                  >
                    <option value="TP 1">Town Planning Scheme 1 (Residential R-1)</option>
                    <option value="TP 2">Town Planning Scheme 2 (High-Tech &amp; Industrial)</option>
                    <option value="TP 3">Town Planning Scheme 3 (City Centre &amp; Mixed Use)</option>
                    <option value="TP 4">Town Planning Scheme 4 (Solar &amp; Knowledge Park)</option>
                    <option value="TP 5">Town Planning Scheme 5 (Industrial Corridor)</option>
                    <option value="TP 6">Town Planning Scheme 6 (Cargo Airport &amp; Logistics)</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-800 block">System Notifications &amp; Alerts</span>
                  <span className="text-[11px] text-slate-400">Receive owner broadcasts, road alignment verifications, and regulatory updates.</span>
                </div>
                <input
                  type="checkbox"
                  checked={notificationsEnabled}
                  onChange={(e) => setNotificationsEnabled(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
              </div>
            </section>

            {/* Storage & Data Backup */}
            <section className={card}>
              <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
                <HardDrive className="w-5 h-5 text-slate-700 shrink-0" />
                <h2 className="text-sm font-black text-slate-900">Local Storage &amp; Data Security</h2>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <span className="text-xs font-bold text-slate-800 block">
                    Saved Property Bookmarks: {bookmarks.length} plots
                  </span>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Saved locally on this device via browser storage. Export a JSON backup to transfer to another device.
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={handleExportBackup}
                    className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                  >
                    Export Backup (JSON)
                  </button>

                  <button
                    type="button"
                    onClick={handleClearData}
                    className="px-3.5 py-2 rounded-xl text-xs font-bold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition cursor-pointer"
                  >
                    Clear Local Cache
                  </button>
                </div>
              </div>
            </section>
          </div>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}
