/**
 * Shared server-side Razorpay helpers.
 *
 * Recurring subscriptions need server calls: the client cannot create a
 * Subscription or verify a webhook signature without the key secret, which
 * must never ship to the browser. Both live here behind auth().
 *
 * Keys are resolved per RAZORPAY_MODE (test during build, live at launch).
 */
import { auth, clerkClient } from '@clerk/nextjs/server';
import Razorpay from 'razorpay';
import { RAZORPAY_MODE, parseEntitlements } from '@/lib/entitlements';
import { getCachedUser, invalidateUser } from './clerk-user-cache';

export function razorpayCreds() {
  const prefix = RAZORPAY_MODE === 'test' ? 'RAZORPAY_TEST' : 'RAZORPAY_LIVE';
  const keyId = process.env[`${prefix}_KEY_ID`] || process.env.RAZORPAY_KEY_ID || '';
  const keySecret =
    process.env[`${prefix}_KEY_SECRET`] || process.env.RAZORPAY_KEY_SECRET || '';
  if (!keyId || !keySecret) {
    throw new Error(
      `Razorpay ${RAZORPAY_MODE} credentials missing: set ${prefix}_KEY_ID and ${prefix}_KEY_SECRET`
    );
  }
  return { keyId, keySecret };
}

export function razorpayAuthHeader(): string {
  const { keyId, keySecret } = razorpayCreds();
  return 'Basic ' + Buffer.from(`${keyId}:${keySecret}`).toString('base64');
}

/** Razorpay API base for v1. */
export const RAZORPAY_API = 'https://api.razorpay.com/v1';

/**
 * An order as Razorpay returns it. The money fields are in paisa.
 * `notes` is the only place the purchaser and the purchased item are recorded,
 * so verification must read them back from here, never from the client.
 */
export interface RazorpayOrderFetch {
  id: string;
  entity: string;
  amount: number;
  currency: string;
  status: string;
  amount_paid: number;
  amount_due: number;
  notes?: Record<string, string>;
  receipt?: string;
}

/**
 * The official SDK's typings lag the real v1 API (e.g. `customer_id` on
 * subscription create, and the error shape). This is the surface we actually
 * call, so routes stay typed without `any`.
 */
type RazorpayClient = {
  orders: {
    create: (p: Record<string, unknown>) => Promise<{ id: string }>;
    fetch: (id: string) => Promise<RazorpayOrderFetch>;
  };
  customers: { create: (p: Record<string, unknown>) => Promise<{ id: string }> };
  subscriptions: {
    create: (p: Record<string, unknown>) => Promise<{ id: string; short_url?: string }>;
    fetch: (id: string) => Promise<RazorpaySubscriptionFetch>;
  };
};

export interface RazorpaySubscriptionFetch {
  id: string;
  entity: string;
  plan_id: string;
  customer_id: string;
  status: string;
  current_start?: number;
  current_end?: number;
  ended_at?: number | null;
  charge_at?: number;
  start_at?: number;
  end_at?: number;
  total_count?: number;
  paid_count?: number;
  remaining_count?: number;
  notes?: Record<string, string>;
}

export async function fetchSubscription(id: string): Promise<RazorpaySubscriptionFetch> {
  const rzp = razorpayClient();
  return (await rzp.subscriptions.fetch(id)) as RazorpaySubscriptionFetch;
}

/** Authenticated SDK instance. Server-only — carries the key secret. */
export function razorpayClient(): RazorpayClient {
  const { keyId, keySecret } = razorpayCreds();
  return new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  }) as unknown as RazorpayClient;
}

/** The SDK rejects with an untyped object; pull a human-readable detail out. */
export function razorpayErrDetail(err: unknown): string {
  const e = err as { error?: { description?: string }; message?: string } | undefined;
  return e?.error?.description || e?.message || 'unknown error';
}

import {
  readEntitlementRow,
  upsertEntitlement,
  claimPayment,
} from '@/lib/db';

const ENTITLEMENTS_SOURCE: 'clerk' | 'dual' | 'supabase' =
  (process.env.ENTITLEMENTS_SOURCE as 'clerk' | 'dual' | 'supabase') || 'clerk';

/** Shape of the payload we persist to Clerk publicMetadata (client-readable). */
export interface EntitlementDoc {
  plan: string;
  status: string;
  periodEnd: string | null;
  pdfsUsed: number;
  rolloverBank: number;
  credits: number;
  lastCreditPaymentId: string | null;
  trialStartedAt: string | null;
}

/**
 * Write the authoritative entitlement copy to PostgreSQL (Supabase) when in
 * dual/supabase mode, and always mirror the gating copy to Clerk metadata.
 */
export async function syncEntitlements(
  userId: string,
  doc: Partial<EntitlementDoc>,
  previous: Partial<EntitlementDoc> = {}
): Promise<void> {
  const merged: EntitlementDoc = {
    plan: doc.plan ?? previous.plan ?? 'free',
    status: doc.status ?? previous.status ?? 'none',
    periodEnd: doc.periodEnd ?? previous.periodEnd ?? null,
    pdfsUsed: doc.pdfsUsed ?? previous.pdfsUsed ?? 0,
    rolloverBank: doc.rolloverBank ?? previous.rolloverBank ?? 0,
    credits: doc.credits ?? previous.credits ?? 0,
    lastCreditPaymentId:
      doc.lastCreditPaymentId ?? previous.lastCreditPaymentId ?? null,
    trialStartedAt: doc.trialStartedAt ?? previous.trialStartedAt ?? null,
  };

  // If dual or supabase mode is active, persist to database
  if (ENTITLEMENTS_SOURCE === 'supabase' || ENTITLEMENTS_SOURCE === 'dual') {
    try {
      await upsertEntitlement(userId, {
        plan: merged.plan,
        status: merged.status,
        period_end: merged.periodEnd,
        pdfs_used: merged.pdfsUsed,
        rollover_bank: merged.rolloverBank,
        credits: merged.credits,
        trial_started_at: merged.trialStartedAt,
      });
    } catch (err) {
      console.error('[razorpay-server] Supabase upsertEntitlement error:', err);
      if (ENTITLEMENTS_SOURCE === 'supabase') throw err;
    }
  }

  // Always mirror to Clerk for fast client hydration. The memo is dropped
  // first so a read later in the same request observes the written values.
  invalidateUser(userId);
  const client = await clerkClient();
  await client.users.updateUserMetadata(userId, {
    privateMetadata: merged as unknown as Record<string, unknown>,
    publicMetadata: merged as unknown as Record<string, unknown>,
  });
}

export async function readEntitlements(userId: string): Promise<EntitlementDoc | null> {
  if (ENTITLEMENTS_SOURCE === 'supabase' || ENTITLEMENTS_SOURCE === 'dual') {
    try {
      const row = await readEntitlementRow(userId);
      if (row) {
        const doc: EntitlementDoc = {
          plan: row.plan || 'free',
          status: row.status || 'none',
          periodEnd: row.period_end,
          pdfsUsed: row.pdfs_used || 0,
          rolloverBank: row.rollover_bank || 0,
          credits: row.credits || 0,
          lastCreditPaymentId: null,
          trialStartedAt: row.trial_started_at,
        };
        // Auto-initialize free trial if user has never trialed and is not paying
        if (!doc.trialStartedAt && (doc.status === 'none' || doc.plan === 'free')) {
          const startedAt = new Date().toISOString();
          const trialDoc: EntitlementDoc = {
            ...doc,
            plan: 'trial',
            status: 'trialing',
            trialStartedAt: startedAt,
            periodEnd: new Date(Date.now() + 7 * 86_400_000).toISOString(),
            pdfsUsed: 0,
          };
          syncEntitlements(userId, trialDoc, doc).catch((e) =>
            console.warn('[readEntitlements] auto-start trial sync error:', e)
          );
          return trialDoc;
        }
        return doc;
      }
      if (ENTITLEMENTS_SOURCE === 'supabase') return null;
    } catch (err) {
      console.error('[razorpay-server] error reading from Supabase:', err);
      if (ENTITLEMENTS_SOURCE === 'supabase') throw err;
    }
  }

  const u = await getCachedUser(userId);
  const src =
    (u.privateMetadata as unknown as EntitlementDoc) ||
    (u.publicMetadata as unknown as EntitlementDoc) ||
    null;

  // Auto-initialize free trial if user has never trialed and is not paying
  if (src && !src.trialStartedAt && (src.status === 'none' || !src.status || src.plan === 'free')) {
    const startedAt = new Date().toISOString();
    const trialDoc: EntitlementDoc = {
      plan: 'trial',
      status: 'trialing',
      periodEnd: new Date(Date.now() + 7 * 86_400_000).toISOString(),
      pdfsUsed: 0,
      rolloverBank: 0,
      credits: 0,
      lastCreditPaymentId: null,
      trialStartedAt: startedAt,
    };
    syncEntitlements(userId, trialDoc, src).catch((e) =>
      console.warn('[readEntitlements] auto-start trial sync error:', e)
    );
    return trialDoc;
  }

  return src;
}

/**
 * Credit a one-time purchase exactly once.
 * Atomic DB claimPayment lock prevents double-crediting if client and webhook race.
 */
export async function addCreditsIdempotent(
  userId: string,
  paymentId: string,
  credits: number,
  amountPaisa: number = 0,
  orderId?: string | null
): Promise<{ added: boolean; total: number }> {
  if (ENTITLEMENTS_SOURCE === 'supabase' || ENTITLEMENTS_SOURCE === 'dual') {
    try {
      const claim = await claimPayment(paymentId, {
        payment_id: paymentId,
        user_id: userId,
        kind: 'credit_pack',
        amount_paisa: amountPaisa,
        credits,
        razorpay_order_id: orderId,
      });
      if (!claim.inserted) {
        const current = parseEntitlements(await readEntitlements(userId));
        return { added: false, total: current.credits };
      }
    } catch (err) {
      console.error('[razorpay-server] claimPayment error in addCreditsIdempotent:', err);
      if (ENTITLEMENTS_SOURCE === 'supabase') throw err;
    }
  }

  const current = parseEntitlements(await readEntitlements(userId));
  if (current.lastCreditPaymentId === paymentId) {
    return { added: false, total: current.credits };
  }
  const total = current.credits + credits;
  await syncEntitlements(
    userId,
    { credits: total, lastCreditPaymentId: paymentId },
    current
  );
  return { added: true, total };
}

/**
 * Demand an authenticated Clerk session. Returns the user id, or a 401-shaped
 * rejection callers can turn into a Response.
 */
export async function requireUserId(): Promise<
  { ok: true; userId: string } | { ok: false; response: Response }
> {
  const { userId } = await auth();
  if (!userId) {
    return {
      ok: false,
      response: Response.json({ error: 'unauthorized' }, { status: 401 }),
    };
  }
  return { ok: true, userId };
}

/**
 * Fetch an order straight from Razorpay. Server-only: the amount actually paid
 * and the order notes (which name the purchaser and the item) are authoritative
 * only here. A checkout signature covers just `<order_id>|<payment_id>`, so the
 * browser's word on how much it paid or what it bought is not admissible.
 */
export async function fetchOrder(orderId: string): Promise<RazorpayOrderFetch> {
  const rzp = razorpayClient();
  return rzp.orders.fetch(orderId);
}

/**
 * Ad-spend ledger persisted to Clerk. Every boost payment is appended once; the
 * Razorpay payment id is the idempotency key shared by the instant client
 * verify path and the webhook, so a payment can never be counted twice.
 */
export interface AdBoostPayment {
  paymentId: string;
  /** Amount credited, in whole rupees. */
  amount: number;
  ts: string;
}
export interface AdBoostMeta {
  totalAdSpend: number;
  payments: AdBoostPayment[];
}

export async function readAdBoostMeta(userId: string): Promise<AdBoostMeta> {
  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const existing = (user.privateMetadata?.adBoost as AdBoostMeta | undefined) || null;
  if (existing && Array.isArray(existing.payments)) return existing;
  return { totalAdSpend: 0, payments: [] };
}

/**
 * Credit an ad-budget boost exactly once. Returns the delta actually credited
 * (`added: false` + `boostApplied` 0 when the payment was already recorded), so
 * callers never re-apply a payment the webhook already processed.
 *
 * Like addCreditsIdempotent this is a read-modify-write on Clerk metadata; the
 * client verify and the webhook arrive seconds apart, which the payment-id
 * guard covers.
 */
export async function addAdBoostIdempotent(
  userId: string,
  paymentId: string,
  amountInr: number,
  orderId?: string | null
): Promise<{ added: boolean; total: number; boostApplied: number }> {
  if (ENTITLEMENTS_SOURCE === 'supabase' || ENTITLEMENTS_SOURCE === 'dual') {
    try {
      const claim = await claimPayment(paymentId, {
        payment_id: paymentId,
        user_id: userId,
        kind: 'ad_boost',
        amount_paisa: amountInr * 100,
        credits: 0,
        razorpay_order_id: orderId,
      });
      if (!claim.inserted) {
        const row = await readEntitlementRow(userId);
        return { added: false, total: Number(row?.ad_spend_total || 0), boostApplied: 0 };
      }

      // Claimed! Update Supabase ad_spend_total
      const row = await readEntitlementRow(userId);
      const newTotal = Number(row?.ad_spend_total || 0) + amountInr;
      await upsertEntitlement(userId, { ad_spend_total: newTotal });

      // Mirror to Clerk for client hydration
      const existing = await readAdBoostMeta(userId);
      const updated: AdBoostMeta = {
        totalAdSpend: newTotal,
        payments: [
          ...existing.payments,
          { paymentId, amount: amountInr, ts: new Date().toISOString() },
        ],
      };
      const client = await clerkClient();
      await client.users.updateUserMetadata(userId, {
        privateMetadata: { adBoost: updated } as unknown as Record<string, unknown>,
        publicMetadata: {
          adBoostTotal: updated.totalAdSpend,
        } as unknown as Record<string, unknown>,
      });

      return { added: true, total: newTotal, boostApplied: amountInr };
    } catch (err) {
      console.error('[razorpay-server] addAdBoostIdempotent error:', err);
      if (ENTITLEMENTS_SOURCE === 'supabase') throw err;
    }
  }

  // Clerk fallback
  const existing = await readAdBoostMeta(userId);
  if (existing.payments.some((p) => p.paymentId === paymentId)) {
    return { added: false, total: existing.totalAdSpend, boostApplied: 0 };
  }
  const updated: AdBoostMeta = {
    totalAdSpend: existing.totalAdSpend + amountInr,
    payments: [
      ...existing.payments,
      { paymentId, amount: amountInr, ts: new Date().toISOString() },
    ],
  };
  const client = await clerkClient();
  await client.users.updateUserMetadata(userId, {
    privateMetadata: { adBoost: updated } as unknown as Record<string, unknown>,
    publicMetadata: {
      adBoostTotal: updated.totalAdSpend,
    } as unknown as Record<string, unknown>,
  });
  return { added: true, total: updated.totalAdSpend, boostApplied: amountInr };
}

/**
 * Verify a client-side checkout signature (Razorpay Standard Checkout).
 * Used by /api/razorpay/verify-payment for the one-time credit-pack flow.
 * HMAC-SHA256 over "<order_id>|<payment_id>" with the key secret.
 */
export function verifyPaymentSignature(
  orderId: string,
  paymentId: string,
  signature: string,
  secret: string
): boolean {
  const crypto = require('crypto') as typeof import('crypto');
  const digest = crypto
    .createHmac('sha256', secret)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');
  // Timing-safe compare so the digest is not leaked byte-by-byte.
  return crypto.timingSafeEqual(
    Buffer.from(digest, 'hex'),
    Buffer.from(signature, 'hex')
  );
}

/**
 * Verify a client-side subscription checkout signature (Razorpay Subscriptions).
 * HMAC-SHA256 over "<payment_id>|<subscription_id>" with the key secret.
 */
export function verifySubscriptionSignature(
  subscriptionId: string,
  paymentId: string,
  signature: string,
  secret: string
): boolean {
  const crypto = require('crypto') as typeof import('crypto');
  const digest = crypto
    .createHmac('sha256', secret)
    .update(`${paymentId}|${subscriptionId}`)
    .digest('hex');
  try {
    return crypto.timingSafeEqual(
      Buffer.from(digest, 'hex'),
      Buffer.from(signature, 'hex')
    );
  } catch {
    return false;
  }
}

/**
 * Resolve the key secret for the active mode. Server-only: this value must
 * never reach the browser (no NEXT_PUBLIC_ prefix on these names).
 */
export function razorpayKeySecret(): string {
  const prefix = RAZORPAY_MODE === 'test' ? 'RAZORPAY_TEST' : 'RAZORPAY_LIVE';
  const secret =
    process.env[`${prefix}_KEY_SECRET`] || process.env.RAZORPAY_KEY_SECRET || '';
  if (!secret) {
    throw new Error(`Razorpay ${RAZORPAY_MODE} key secret is not configured`);
  }
  return secret;
}

/** Constant-time webhook signature check (Razorpay HMAC SHA256). */
export function verifyWebhookSignature(
  body: string,
  signature: string | null,
  secret: string
): boolean {
  if (!signature || !secret) return false;
  const crypto = require('crypto') as typeof import('crypto');
  const digest = crypto
    .createHmac('sha256', secret)
    .update(body)
    .digest('hex');
  try {
    return crypto.timingSafeEqual(
      Buffer.from(digest, 'hex'),
      Buffer.from(signature, 'hex')
    );
  } catch {
    // Malformed signature (wrong length / non-hex): treat as invalid.
    return false;
  }
}
