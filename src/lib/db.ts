/**
 * Server-only Supabase client and database primitives.
 * The service role key bypasses RLS, so this module must NEVER be imported
 * by a client component (no NEXT_PUBLIC_ prefix).
 */
import { createClient, SupabaseClient } from '@supabase/supabase-js';

let _client: SupabaseClient | null = null;

export function db(): SupabaseClient {
  if (_client) return _client;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error('SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY not configured');
  }
  _client = createClient(url, key, {
    auth: { persistSession: false },
  });
  return _client;
}

export interface EntitlementRow {
  user_id: string;
  plan: string;
  status: string;
  period_end: string | null;
  pdfs_used: number;
  rollover_bank: number;
  credits: number;
  trial_started_at: string | null;
  ad_spend_total: number;
  updated_at?: string;
}

export interface PaymentInsert {
  payment_id: string;
  user_id: string;
  kind: 'credit_pack' | 'ad_boost' | 'subscription';
  amount_paisa: number;
  credits?: number;
  razorpay_order_id?: string | null;
  razorpay_subscription_id?: string | null;
}

export interface DossierRow {
  dossier_id: string;
  user_id: string;
  parcel: Record<string, unknown>;
  plan: string;
  pdf_sha256: string;
  created_at: string;
}

export async function readEntitlementRow(userId: string): Promise<EntitlementRow | null> {
  const client = db();
  const { data, error } = await client
    .from('entitlements')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    console.error('[db] readEntitlementRow error:', error);
    return null;
  }
  return data as EntitlementRow | null;
}

export async function upsertEntitlement(
  userId: string,
  patch: Partial<Omit<EntitlementRow, 'user_id' | 'updated_at'>>
): Promise<EntitlementRow | null> {
  const client = db();
  const payload = {
    user_id: userId,
    ...patch,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await client
    .from('entitlements')
    .upsert(payload, { onConflict: 'user_id' })
    .select()
    .single();

  if (error) {
    console.error('[db] upsertEntitlement error:', error);
    throw error;
  }
  return data as EntitlementRow;
}

/**
 * Atomic payment claim: INSERT ... ON CONFLICT (payment_id) DO NOTHING.
 * Returns { inserted: true } if this is the first time the payment is processed.
 * Returns { inserted: false } if the payment was already claimed (idempotency lock).
 */
export async function claimPayment(
  paymentId: string,
  cols: PaymentInsert
): Promise<{ inserted: boolean }> {
  const client = db();
  const payload = {
    payment_id: paymentId,
    user_id: cols.user_id,
    kind: cols.kind,
    amount_paisa: cols.amount_paisa,
    credits: cols.credits ?? 0,
    razorpay_order_id: cols.razorpay_order_id ?? null,
    razorpay_subscription_id: cols.razorpay_subscription_id ?? null,
  };

  const { data, error } = await client
    .from('payments')
    .insert(payload)
    .select('payment_id');

  if (error) {
    // 23505 is PostgreSQL unique_violation error code
    if (error.code === '23505' || error.message?.includes('duplicate key')) {
      return { inserted: false };
    }
    console.error('[db] claimPayment error:', error);
    throw error;
  }

  return { inserted: Boolean(data && data.length > 0) };
}

/**
 * Calls PostgreSQL stored procedure consume_pdfs with row-level locking (FOR UPDATE).
 */
export async function consumePdfsAtomic(
  userId: string,
  count: number,
  includedCap: number
): Promise<{
  ok: boolean;
  consumed: number;
  pdfsAvailable: number;
  includedRemaining: number;
  rolloverBank: number;
  credits: number;
}> {
  const client = db();
  const { data, error } = await client.rpc('consume_pdfs', {
    p_user_id: userId,
    p_count: count,
    p_included_cap: includedCap,
  });

  if (error) {
    console.error('[db] consume_pdfs error:', error);
    throw error;
  }

  const row = Array.isArray(data) ? data[0] : data;
  if (!row) {
    return {
      ok: false,
      consumed: 0,
      pdfsAvailable: 0,
      includedRemaining: 0,
      rolloverBank: 0,
      credits: 0,
    };
  }

  return {
    ok: Boolean(row.ok),
    consumed: Number(row.consumed || 0),
    pdfsAvailable: Number(row.pdfs_available || 0),
    includedRemaining: Number(row.included_remaining || 0),
    rolloverBank: Number(row.rollover_bank || 0),
    credits: Number(row.credits || 0),
  };
}

export async function insertDossier(row: {
  dossier_id: string;
  user_id: string;
  parcel: Record<string, unknown>;
  plan: string;
  pdf_sha256: string;
}): Promise<DossierRow> {
  const client = db();
  const { data, error } = await client
    .from('dossiers')
    .insert(row)
    .select()
    .single();

  if (error) {
    console.error('[db] insertDossier error:', error);
    throw error;
  }
  return data as DossierRow;
}

export async function readDossier(dossierId: string): Promise<DossierRow | null> {
  return readDossierLive(dossierId);
}

async function readDossierLive(dossierId: string): Promise<DossierRow | null> {
  const client = db();
  const { data, error } = await client
    .from('dossiers')
    .select('*')
    .eq('dossier_id', dossierId)
    .maybeSingle();

  if (error) {
    console.error('[db] readDossier error:', error);
    return null;
  }
  return data as DossierRow | null;
}

export async function readVerifiedBrokerSpends(): Promise<
  { user_id: string; ad_spend_total: number }[]
> {
  const client = db();
  const { data, error } = await client
    .from('entitlements')
    .select('user_id, ad_spend_total')
    .gt('ad_spend_total', 0)
    .order('ad_spend_total', { ascending: false });

  if (error) {
    console.error('[db] readVerifiedBrokerSpends error:', error);
    return [];
  }
  return (data || []) as { user_id: string; ad_spend_total: number }[];
}

export interface BookmarkRow {
  id: string;
  user_id: string;
  sid: string;
  label: string;
  x: number;
  y: number;
  custom_name?: string | null;
  data: Record<string, unknown>;
  created_at?: string;
  updated_at?: string;
}

export interface BrokerProfileRow {
  user_id: string;
  name: string;
  agency?: string | null;
  rera_number?: string | null;
  experience_years?: number;
  tp_schemes?: string[];
  property_types?: string[];
  head_office?: string | null;
  phone?: string | null;
  whatsapp?: string | null;
  email?: string | null;
  bio?: string | null;
  photo_url?: string | null;
  logo_initial?: string | null;
  deals_closed?: string | null;
  is_public?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface BrokerPropertyRow {
  id: string;
  broker_id: string;
  title: string;
  village?: string | null;
  tp_scheme?: string | null;
  sid?: string | null;
  fp?: string | null;
  survey?: string | null;
  zone?: string | null;
  road_width?: string | null;
  price_per_sqyd?: string | null;
  total_demand?: string | null;
  highlights?: string[];
  has_brochure?: boolean;
  status?: string;
  listed_date?: string | null;
  featured?: boolean;
  featured_status?: string;
  created_at?: string;
  updated_at?: string;
}

export interface UserBrandingRow {
  user_id: string;
  name?: string | null;
  company?: string | null;
  phone?: string | null;
  email?: string | null;
  tagline?: string | null;
  logo_data_url?: string | null;
  updated_at?: string;
}

export interface FeedbackRow {
  id: string;
  user_id?: string | null;
  email?: string | null;
  name?: string | null;
  message: string;
  category?: string;
  rating?: number;
  status?: string;
  created_at?: string;
}

/* ---------------- Bookmarks ---------------- */

export async function readUserBookmarks(userId: string): Promise<BookmarkRow[]> {
  const client = db();
  const { data, error } = await client
    .from('bookmarks')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('[db] readUserBookmarks error:', error);
    return [];
  }
  return (data || []) as BookmarkRow[];
}

export async function upsertUserBookmarks(userId: string, rows: BookmarkRow[]): Promise<void> {
  if (!rows || rows.length === 0) return;
  const client = db();
  const payload = rows.map((r) => ({
    id: r.id,
    user_id: userId,
    sid: r.sid,
    label: r.label,
    x: r.x,
    y: r.y,
    custom_name: r.custom_name || null,
    data: r.data || {},
    updated_at: new Date().toISOString(),
  }));

  const { error } = await client
    .from('bookmarks')
    .upsert(payload, { onConflict: 'id' });

  if (error) {
    console.error('[db] upsertUserBookmarks error:', error);
    throw error;
  }
}

export async function deleteUserBookmark(userId: string, bookmarkId: string): Promise<boolean> {
  const client = db();
  const { error } = await client
    .from('bookmarks')
    .delete()
    .eq('id', bookmarkId)
    .eq('user_id', userId);

  if (error) {
    console.error('[db] deleteUserBookmark error:', error);
    return false;
  }
  return true;
}

/* ---------------- Broker Profiles & Properties ---------------- */

export async function readBrokerProfile(userId: string): Promise<BrokerProfileRow | null> {
  const client = db();
  const { data, error } = await client
    .from('broker_profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    console.error('[db] readBrokerProfile error:', error);
    return null;
  }
  return data as BrokerProfileRow | null;
}

export async function upsertBrokerProfile(
  userId: string,
  profile: Partial<BrokerProfileRow>
): Promise<BrokerProfileRow | null> {
  const client = db();
  const payload = {
    ...profile,
    user_id: userId,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await client
    .from('broker_profiles')
    .upsert(payload, { onConflict: 'user_id' })
    .select()
    .single();

  if (error) {
    console.error('[db] upsertBrokerProfile error:', error);
    throw error;
  }
  return data as BrokerProfileRow;
}

export async function readAllPublicBrokers(): Promise<BrokerProfileRow[]> {
  const client = db();
  const { data, error } = await client
    .from('broker_profiles')
    .select('*')
    .eq('is_public', true)
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('[db] readAllPublicBrokers error:', error);
    return [];
  }
  return (data || []) as BrokerProfileRow[];
}

export async function readBrokerProperties(brokerId: string): Promise<BrokerPropertyRow[]> {
  const client = db();
  const { data, error } = await client
    .from('broker_properties')
    .select('*')
    .eq('broker_id', brokerId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[db] readBrokerProperties error:', error);
    return [];
  }
  return (data || []) as BrokerPropertyRow[];
}

export async function readAllPublicProperties(): Promise<BrokerPropertyRow[]> {
  const client = db();
  const { data, error } = await client
    .from('broker_properties')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[db] readAllPublicProperties error:', error);
    return [];
  }
  return (data || []) as BrokerPropertyRow[];
}

export async function upsertBrokerProperty(
  brokerId: string,
  prop: Partial<BrokerPropertyRow> & { id: string; title: string }
): Promise<BrokerPropertyRow | null> {
  const client = db();
  const payload = {
    ...prop,
    broker_id: brokerId,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await client
    .from('broker_properties')
    .upsert(payload, { onConflict: 'id' })
    .select()
    .single();

  if (error) {
    console.error('[db] upsertBrokerProperty error:', error);
    throw error;
  }
  return data as BrokerPropertyRow;
}

export async function deleteBrokerProperty(brokerId: string, propertyId: string): Promise<boolean> {
  const client = db();
  const { error } = await client
    .from('broker_properties')
    .delete()
    .eq('id', propertyId)
    .eq('broker_id', brokerId);

  if (error) {
    console.error('[db] deleteBrokerProperty error:', error);
    return false;
  }
  return true;
}

/* ---------------- User Branding ---------------- */

export async function readUserBranding(userId: string): Promise<UserBrandingRow | null> {
  const client = db();
  const { data, error } = await client
    .from('user_branding')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    console.error('[db] readUserBranding error:', error);
    return null;
  }
  return data as UserBrandingRow | null;
}

export async function upsertUserBranding(
  userId: string,
  branding: Partial<UserBrandingRow>
): Promise<UserBrandingRow | null> {
  const client = db();
  const payload = {
    ...branding,
    user_id: userId,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await client
    .from('user_branding')
    .upsert(payload, { onConflict: 'user_id' })
    .select()
    .single();

  if (error) {
    console.error('[db] upsertUserBranding error:', error);
    throw error;
  }
  return data as UserBrandingRow;
}

/* ---------------- Feedback ---------------- */

export async function insertFeedback(fb: FeedbackRow): Promise<void> {
  const client = db();
  const { error } = await client.from('user_feedback').insert(fb);
  if (error) {
    console.error('[db] insertFeedback error:', error);
    throw error;
  }
}

export async function readAllFeedback(): Promise<FeedbackRow[]> {
  const client = db();
  const { data, error } = await client
    .from('user_feedback')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[db] readAllFeedback error:', error);
    return [];
  }
  return (data || []) as FeedbackRow[];
}

export async function updateFeedbackStatus(id: string, status: string): Promise<boolean> {
  const client = db();
  const { error } = await client
    .from('user_feedback')
    .update({ status })
    .eq('id', id);

  if (error) {
    console.error('[db] updateFeedbackStatus error:', error);
    return false;
  }
  return true;
}

