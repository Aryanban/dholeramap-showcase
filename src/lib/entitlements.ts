/**
 * Entitlement engine — the single source of truth for plan limits, quota math
 * and the trial clock. Kept free of React/Next imports so it runs identically
 * on client (gating) and server (quota enforcement).
 *
 * Persistence split (doc: subscriptions):
 *   - privateMetadata : webhook-written accounting (plan, periodEnd, used, credits)
 *   - publicMetadata  : the mirror the client is allowed to read for gating
 * The client never writes either; only the webhook / server routes do, which
 * makes the PDF counter server-authoritative rather than cosmetic.
 */

export type PlanId = 'free' | 'trial' | 'investor' | 'pro' | 'max';
export type SubscriptionStatus = 'active' | 'trialing' | 'past_due' | 'cancelled' | 'none';

/**
 * Owner/admin accounts. Membership is by email only — never by a self-settable
 * profile role — and it is re-checked server-side before any gated action
 * (see lib/admin.ts). An admin effectively has every Max capability unlocked
 * without subscribing, and is never quota-counted.
 *
 * ADMIN_EMAILS in .env (comma separated) extends this list.
 */
export const ADMIN_EMAILS = ['aryanbanc@gmail.com', 'aryan24120@iiitd.ac.in'];

/** Client-safe membership check (UI only — the server verifies independently). */
export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const list = (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  const all = new Set([...ADMIN_EMAILS.map((e) => e.toLowerCase()), ...list]);
  return all.has(email.trim().toLowerCase());
}


/** Billing mode: test keys during build, live keys at launch. */
export const RAZORPAY_MODE: 'test' | 'live' =
  (process.env.RAZORPAY_MODE as 'test' | 'live') || 'test';

export interface PlanDefinition {
  id: PlanId;
  name: string;
  /** One-time monthly price in INR (whole rupees; Razorpay wants paisa at the API). */
  priceInr: number;
  /** Discounted recurring monthly price in INR when subscribing via recurring mandate. */
  recurringPriceInr: number;
  /** Flat discount in INR when subscribing via recurring mandate. */
  recurringDiscountInr: number;
  /** Included dossier PDFs per billing cycle. 0 = none. */
  pdfsPerCycle: number;
  /** Unused included PDFs carry forward. Pro resets; Max rolls over. */
  rollover: boolean;
  /** Cap on accumulated rollover, in PDFs. */
  rolloverCap: number;
  /** Per-PDF credit price in INR by plan. */
  creditPriceInr: number;
  /** Full white-label branding (logo, name, company, tagline, no credit). */
  whiteLabel: boolean;
  /** Contact block (phone + email) on the dossier. Pro gets only this. */
  contactBlock: boolean;
  /** High-DPI print-quality map render in dossiers. */
  highDpi: boolean;
  /** Premium dossier templates unlocked. */
  premiumTemplates: boolean;
  /** Simultaneous device seats. */
  seats: number;
  /** Razorpay plan id for the recurring subscription (env-configured). */
  get razorpayPlanId(): string;
}

function planIdFromEnv(v: string | undefined): string {
  return (v || '').trim();
}

export const PLANS: Record<PlanId, PlanDefinition> = {
  free: {
    id: 'free',
    name: 'Interactive Free',
    priceInr: 0,
    recurringPriceInr: 0,
    recurringDiscountInr: 0,
    pdfsPerCycle: 0,
    rollover: false,
    rolloverCap: 0,
    creditPriceInr: 200,
    whiteLabel: false,
    contactBlock: false,
    highDpi: false,
    premiumTemplates: false,
    seats: 1,
    get razorpayPlanId() {
      return '';
    },
  },
  trial: {
    id: 'trial',
    name: 'Free Trial',
    priceInr: 0,
    recurringPriceInr: 0,
    recurringDiscountInr: 0,
    pdfsPerCycle: 2,
    rollover: false,
    rolloverCap: 0,
    creditPriceInr: 200,
    whiteLabel: true,
    contactBlock: true,
    highDpi: true,
    premiumTemplates: true,
    seats: 5,
    get razorpayPlanId() {
      return '';
    },
  },
  investor: {
    id: 'investor',
    name: 'Investor Pass',
    priceInr: 199,
    recurringPriceInr: 199,
    recurringDiscountInr: 0,
    pdfsPerCycle: 1,
    rollover: false,
    rolloverCap: 0,
    creditPriceInr: 200,
    whiteLabel: false,
    contactBlock: false,
    highDpi: false,
    premiumTemplates: false,
    seats: 1,
    get razorpayPlanId() {
      return '';
    },
  },
  pro: {
    id: 'pro',
    name: 'Dealer Pro',
    priceInr: 1000,
    recurringPriceInr: 900,
    recurringDiscountInr: 100,
    pdfsPerCycle: 5,
    rollover: false,
    rolloverCap: 0,
    creditPriceInr: 200,
    whiteLabel: false,
    contactBlock: true,
    highDpi: false,
    premiumTemplates: false,
    seats: 2,
    get razorpayPlanId() {
      return planIdFromEnv(
        RAZORPAY_MODE === 'test'
          ? process.env.RAZORPAY_TEST_PLAN_PRO
          : process.env.RAZORPAY_LIVE_PLAN_PRO
      );
    },
  },
  max: {
    id: 'max',
    name: 'Enterprise Max',
    priceInr: 2500,
    recurringPriceInr: 2200,
    recurringDiscountInr: 300,
    pdfsPerCycle: 15,
    rollover: true,
    rolloverCap: 15,
    creditPriceInr: 200,
    whiteLabel: true,
    contactBlock: true,
    highDpi: true,
    premiumTemplates: true,
    seats: 5,
    get razorpayPlanId() {
      return planIdFromEnv(
        RAZORPAY_MODE === 'test'
          ? process.env.RAZORPAY_TEST_PLAN_MAX
          : process.env.RAZORPAY_LIVE_PLAN_MAX
      );
    },
  },
};

export const TRIAL_DAYS = 7;
/** Trial users get all features with exactly two dossier PDFs cap. */
export const TRIAL_PDF_CAP = 2;
/** Grace window after a failed recurring charge before downgrade. */
export const GRACE_DAYS = 3;

/**
 * One-time purchase guardrails, shared by the order-creation and the
 * verification routes so the two can never disagree. Verification re-checks
 * these against the amount Razorpay reports as paid.
 */
export const CREDIT_PACK_SIZES = [1, 5, 10, 25, 50];
export const AD_BOOST_MIN_INR = 500;
export const AD_BOOST_MAX_INR = 500_000;

export interface EntitlementState {
  plan: PlanId;
  status: SubscriptionStatus;
  /** ISO date of the current billing period end (Razorpay cycle anniversary). */
  periodEnd: string | null;
  /** Included PDFs consumed in the current cycle. */
  pdfsUsed: number;
  /** Banked rollover PDFs (Max only). */
  rolloverBank: number;
  /** Purchased credits — never expire, Pro/Max only. */
  credits: number;
  /** Razorpay payment id of the last credited one-time purchase (idempotency
   * key, so the instant verify-payment path and the webhook never double-count). */
  lastCreditPaymentId: string | null;
  /** ISO date the 7-day trial started, if ever. */
  trialStartedAt: string | null;
}

export const FREE_ENTITLEMENTS: EntitlementState = {
  plan: 'free',
  status: 'none',
  periodEnd: null,
  pdfsUsed: 0,
  rolloverBank: 0,
  credits: 0,
  lastCreditPaymentId: null,
  trialStartedAt: null,
};

/**
 * Trial state is derived, not stored: a signed-in user with no subscription and
 * a trialStartedAt inside the window is trialing. Expiry is hard.
 */
export function trialDaysLeft(state: EntitlementState): number {
  if (!state.trialStartedAt) return 0;
  const startedAt = new Date(state.trialStartedAt).getTime();
  if (!Number.isFinite(startedAt)) return 0;
  const elapsedDays = (Date.now() - startedAt) / 86_400_000;
  return Math.max(0, Math.ceil(TRIAL_DAYS - elapsedDays));
}

export function isTrialActive(state: EntitlementState): boolean {
  return state.status === 'trialing' && trialDaysLeft(state) > 0;
}

export function isTrialExpired(state: EntitlementState): boolean {
  return Boolean(state.trialStartedAt) && !isTrialActive(state) && state.status === 'trialing';
}

/**
 * Effective plan for gating decisions. A trialing user reads as trial (all features
 * unlocked with 2 PDF cap); an expired trial collapses to free.
 */
export function effectivePlan(state: EntitlementState): PlanId {
  if (state.status === 'active') return state.plan;
  if (isTrialActive(state)) return 'trial';
  return 'free';
}

/** Grace: a past_due subscription keeps paid features for GRACE_DAYS days. */
export function isWithinGrace(state: EntitlementState): boolean {
  if (state.status !== 'past_due' || !state.periodEnd) return false;
  const overdueBy = Date.now() - new Date(state.periodEnd).getTime();
  return overdueBy < GRACE_DAYS * 86_400_000;
}

export interface EntitlementFlags {
  plan: PlanId;
  isTrial: boolean;
  isInvestor: boolean;
  isPro: boolean;
  isMax: boolean;
  isTrialing: boolean;
  isTrialExpired: boolean;
  /** Free (or expired trial / lapsed beyond grace): map + search only. */
  isFree: boolean;
  /** View DGDCR details in the InfoPanel. */
  canViewDetails: boolean;
  /** Save plots / bookmarks and open the dashboard. */
  canSavePlots: boolean;
  /** Generate dossier PDFs at all. */
  canExportPdf: boolean;
  /** Buy top-up credits — Pro and Max only. */
  canBuyCredits: boolean;
  /** Included PDFs remaining this cycle. */
  includedRemaining: number;
  /** Total PDFs available now: included remainder + rollover + credits. */
  pdfsAvailable: number;
  /** Effective included cap for the current cycle (trial = 2). */
  includedCap: number;
  /** Days left in the trial (0 outside trial). */
  trialDaysLeft: number;
  whiteLabel: boolean;
  contactBlock: boolean;
  highDpi: boolean;
  premiumTemplates: boolean;
  seats: number;
  creditPriceInr: number;
  priceInr: number;
  recurringPriceInr: number;
  /** True for an owner/admin email: every capability unlocked, unlimited PDFs. */
  isAdmin: boolean;
}

/** Sentinel used where a quota number is shown for admins (rendered "Unlimited"). */
export const ADMIN_QUOTA = 999_999;

function adminFlags(): EntitlementFlags {
  return {
    plan: 'max',
    isTrial: false,
    isInvestor: false,
    isPro: true,
    isMax: true,
    isTrialing: false,
    isTrialExpired: false,
    isFree: false,
    isAdmin: true,
    canViewDetails: true,
    canSavePlots: true,
    canExportPdf: true,
    // Admins never need to buy credits — the quota is unlimited.
    canBuyCredits: false,
    includedRemaining: ADMIN_QUOTA,
    pdfsAvailable: ADMIN_QUOTA,
    includedCap: ADMIN_QUOTA,
    trialDaysLeft: 0,
    whiteLabel: true,
    contactBlock: true,
    highDpi: true,
    premiumTemplates: true,
    seats: 99,
    creditPriceInr: 0,
    priceInr: 0,
    recurringPriceInr: 0,
  };
}

/**
 * Resolve entitlement flags. `opts.isAdmin` is the owner/admin override: an
 * admin email gets every Max capability and unlimited PDFs regardless of any
 * subscription state, so the console and dossiers just work.
 */
export function deriveFlags(
  state: EntitlementState,
  opts?: { isAdmin?: boolean }
): EntitlementFlags {
  if (opts?.isAdmin) return adminFlags();
  const plan = effectivePlan(state);
  const def = PLANS[plan] || PLANS.free;
  const trialing = isTrialActive(state);
  const withinGrace = isWithinGrace(state);

  // A trial has a 2 PDF cap; other plans follow their definition.
  const includedCap = trialing ? TRIAL_PDF_CAP : def.pdfsPerCycle;
  const includedRemaining = Math.max(0, includedCap - state.pdfsUsed);
  const rolloverAvailable = def.rollover ? state.rolloverBank : 0;
  const pdfsAvailable = includedRemaining + rolloverAvailable + state.credits;

  // Any paid state (active, trialing, or within the failure grace window)
  // unlocks full paid features. Free is map + search only.
  const hasPaidAccess =
    state.status === 'active' || trialing || withinGrace;

  return {
    plan,
    isTrial: plan === 'trial',
    isInvestor: plan === 'investor',
    isPro: plan === 'pro' || plan === 'trial',
    isMax: plan === 'max' || plan === 'trial',
    isTrialing: trialing,
    isTrialExpired: isTrialExpired(state),
    isFree: !hasPaidAccess,
    isAdmin: false,
    canViewDetails: hasPaidAccess,
    canSavePlots: hasPaidAccess,
    canExportPdf: hasPaidAccess && pdfsAvailable > 0,
    canBuyCredits: state.status === 'active' && (plan === 'pro' || plan === 'max' || plan === 'investor'),
    includedRemaining,
    pdfsAvailable,
    includedCap,
    trialDaysLeft: trialDaysLeft(state),
    whiteLabel: (def?.whiteLabel ?? false) && hasPaidAccess,
    contactBlock: (def?.contactBlock ?? false) && hasPaidAccess,
    highDpi: (def?.highDpi ?? false) && hasPaidAccess,
    premiumTemplates: (def?.premiumTemplates ?? false) && hasPaidAccess,
    seats: def?.seats ?? 1,
    creditPriceInr: def?.creditPriceInr ?? 200,
    priceInr: def?.priceInr ?? 0,
    recurringPriceInr: def?.recurringPriceInr ?? 0,
  };
}

/**
 * Recompute the rollover bank at the end of a cycle. Unused included PDFs
 * carry forward only on Max, and only up to one cycle's quota.
 */
export function computeRollover(
  plan: PlanId,
  pdfsUsed: number,
  previousBank: number
): number {
  const def = PLANS[plan];
  if (!def.rollover) return 0;
  const unused = Math.max(0, def.pdfsPerCycle - pdfsUsed);
  return Math.min(def.rolloverCap, previousBank + unused);
}

/** Start a fresh cycle for a plan (called on subscription.charged). */
export function startCycle(plan: PlanId, previousBank: number): Partial<EntitlementState> {
  return {
    plan,
    status: 'active',
    pdfsUsed: 0,
    rolloverBank: computeRollover(plan, 0, previousBank),
  };
}

/** ISO timestamp one month ahead — used when a charge has no periodEnd. */
export function oneMonthAhead(from: Date = new Date()): string {
  const d = new Date(from.getTime());
  d.setMonth(d.getMonth() + 1);
  return d.toISOString();
}

/** Parse Clerk publicMetadata into a validated EntitlementState. */
export function parseEntitlements(meta: unknown): EntitlementState {
  const m = (meta || {}) as Record<string, unknown>;
  const plan = PLANS[m.plan as PlanId] ? (m.plan as PlanId) : 'free';
  const status = (['active', 'trialing', 'past_due', 'cancelled', 'none'].includes(
    String(m.status)
  )
    ? (m.status as SubscriptionStatus)
    : 'none');
  return {
    plan,
    status,
    periodEnd: typeof m.periodEnd === 'string' && m.periodEnd ? m.periodEnd : null,
    pdfsUsed: Number.isFinite(Number(m.pdfsUsed)) ? Number(m.pdfsUsed) : 0,
    rolloverBank: Number.isFinite(Number(m.rolloverBank)) ? Number(m.rolloverBank) : 0,
    credits: Number.isFinite(Number(m.credits)) ? Number(m.credits) : 0,
    lastCreditPaymentId:
      typeof m.lastCreditPaymentId === 'string' && m.lastCreditPaymentId
        ? m.lastCreditPaymentId
        : null,
    trialStartedAt:
      typeof m.trialStartedAt === 'string' && m.trialStartedAt ? m.trialStartedAt : null,
  };
}
