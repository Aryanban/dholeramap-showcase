/**
 * Admin user serializers shared by the admin routes.
 */
import type { User } from '@clerk/backend';
import { deriveFlags, isAdminEmail, parseEntitlements } from './entitlements';

export interface AdminUserView {
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

export function toAdminUser(u: User): AdminUserView {
  const emailObjs = u.emailAddresses || [];
  // Only verified addresses carry the admin grant — see lib/admin.ts.
  const verified = emailObjs.filter((e) => e.verification?.status === 'verified');
  const primaryObj = verified.find((e) => e.id === u.primaryEmailAddressId) || verified[0];
  const emails = verified
    .map((e) => (e.emailAddress || '').trim().toLowerCase())
    .filter(Boolean);
  const primary = (primaryObj?.emailAddress || '').trim().toLowerCase();
  const admin = isAdminEmail(primary) || emails.some((e) => isAdminEmail(e));

  const phoneObjs = u.phoneNumbers || [];
  const primaryPhone =
    phoneObjs.find((p) => p.id === u.primaryPhoneNumberId)?.phoneNumber ||
    phoneObjs[0]?.phoneNumber ||
    '';

  const meta = (u.publicMetadata || {}) as Record<string, unknown>;
  const privateMeta = (u.privateMetadata || {}) as Record<string, unknown>;
  const state = parseEntitlements(u.publicMetadata);
  const flags = deriveFlags(state, { isAdmin: admin });

  let billingType = 'Free';
  if (admin) {
    billingType = 'Admin Grant';
  } else if (flags.isTrialing || state.plan === 'trial') {
    billingType = 'Free Trial (2 Credits)';
  } else if (state.plan === 'investor') {
    billingType = 'One-Time Pass (30d)';
  } else if (meta.razorpaySubscriptionId || privateMeta.razorpaySubscriptionId) {
    billingType = 'Recurring Mandate';
  } else if (state.status === 'active') {
    billingType = 'One-Time / Pass';
  } else if (state.plan !== 'free') {
    billingType = 'Inactive / Expired';
  }

  let periodEndFormatted: string | null = null;
  let daysRemaining: number | null = null;
  if (state.periodEnd) {
    const endMs = new Date(state.periodEnd).getTime();
    if (Number.isFinite(endMs)) {
      periodEndFormatted = new Date(endMs).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
      daysRemaining = Math.ceil((endMs - Date.now()) / (1000 * 60 * 60 * 24));
    }
  }

  const lastPaymentId =
    (meta.lastPaymentId as string) ||
    (privateMeta.lastPaymentId as string) ||
    null;

  return {
    id: u.id,
    name: u.fullName || u.firstName || u.username || emails[0] || 'Unnamed user',
    email: primary,
    emails,
    phone: primaryPhone,
    imageUrl: u.imageUrl || null,
    username: u.username || null,
    banned: Boolean(u.banned),
    createdAt: u.createdAt ? new Date(u.createdAt).getTime() : 0,
    lastSignInAt: u.lastSignInAt ? new Date(u.lastSignInAt).getTime() : null,
    role: String((u.publicMetadata as Record<string, unknown>)?.role || 'investor'),
    plan: flags.plan,
    status: state.status,
    periodEnd: state.periodEnd,
    periodEndFormatted,
    daysRemaining,
    trialStartedAt: state.trialStartedAt,
    trialDaysLeft: flags.trialDaysLeft,
    isTrialExpired: flags.isTrialExpired,
    billingType,
    lastPaymentId,
    lastCreditPaymentId: state.lastCreditPaymentId,
    pdfsUsed: state.pdfsUsed,
    credits: state.credits,
    rolloverBank: state.rolloverBank,
    pdfsAvailable: flags.pdfsAvailable,
    includedCap: flags.includedCap,
    includedRemaining: flags.includedRemaining,
    canExportPdf: flags.canExportPdf,
    canBuyCredits: flags.canBuyCredits,
    canSavePlots: flags.canSavePlots,
    canViewDetails: flags.canViewDetails,
    isAdmin: admin,
  };
}
