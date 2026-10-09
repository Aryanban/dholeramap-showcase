/**
 * Razorpay Standard Web Checkout Client Utilities
 * Allows property dealers and investors to subscribe to Pro / Max plans
 * via UPI (GPay, PhonePe, Paytm, BHIM), NetBanking, and Cards.
 */

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => {
      open: () => void;
      on: (event: string, handler: (response: any) => void) => void;
      close?: () => void;
    };
  }
}

export function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve(false);
      return;
    }
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const existingScript = document.querySelector(
      'script[src="https://checkout.razorpay.com/v1/checkout.js"]'
    );
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(true));
      existingScript.addEventListener('error', () => resolve(false));
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export interface CheckoutParams {
  planId: 'pro' | 'max';
  planName: string;
  amount: number; // in INR
  billingCycle: 'monthly' | 'annual';
  userEmail?: string;
  userName?: string;
  userPhone?: string;
  onSuccess?: (paymentId: string, orderId?: string) => void;
  onFailure?: (error: Error) => void;
}

export interface SubscriptionCheckoutParams {
  plan: 'investor' | 'pro' | 'max';
  planName: string;
  billingCycle: 'monthly' | 'annual';
  /**
   * Buyer's billing choice. true = a true Razorpay recurring mandate that
   * auto-charges each cycle; false (default) = a one-time month with no
   * auto-renewal. The server falls back to a one-time order when a recurring
   * mandate can't be created (missing plan id, key scope, etc.).
   */
  recurring?: boolean;
  userEmail?: string;
  userName?: string;
  userPhone?: string;
  onSuccess?: (paymentId: string, orderId?: string) => void;
  onFailure?: (error: Error) => void;
}

/**
 * Quick helper to initiate an Investor Pass checkout (₹199 one-time).
 */
export async function initiateInvestorPassCheckout(params: {
  userEmail?: string;
  userName?: string;
  userPhone?: string;
  onSuccess?: (paymentId: string) => void;
  onFailure?: (error: Error) => void;
}): Promise<void> {
  await initiateSubscriptionCheckout({
    plan: 'investor',
    planName: 'Investor Due-Diligence Pass',
    billingCycle: 'monthly',
    recurring: false,
    userEmail: params.userEmail,
    userName: params.userName,
    userPhone: params.userPhone,
    onSuccess: (pId) => params.onSuccess?.(pId),
    onFailure: params.onFailure,
  });
}

/**
 * Recurring subscription checkout. Creates a Razorpay Subscription server-side
 * (the client must never hold the key secret), then opens the checkout with
 * the returned subscription id — Razorpay then charges the mandate each cycle.
 *
 * Returns the subscription id so callers can record the pending plan locally
 * (the webhook remains the source of truth for activation).
 */
export async function initiateSubscriptionCheckout(
  params: SubscriptionCheckoutParams
): Promise<{ subscriptionId?: string; orderId?: string } | null> {
  const res = await fetch('/api/razorpay/create-subscription', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ plan: params.plan, recurring: params.recurring === true }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({ error: 'Unknown error' }));
    const msg = data?.detail ? `${data.error} (${data.detail})` : (data?.error || `Could not start subscription`);
    throw new Error(msg);
  }
  const data = await res.json();
  const { subscriptionId, orderId, amountPaisa, keyId } = data;
  if (!subscriptionId && !orderId) throw new Error('No subscription or order id returned');

  await openRazorpay({
    keyId,
    subscriptionId,
    orderId,
    amountPaisa,
    description:
      params.plan === 'investor'
        ? `${params.planName} (30-day access · 1 Dossier PDF)`
        : `${params.planName} (${subscriptionId ? 'recurring monthly subscription' : 'monthly pass'})`,
    prefill: {
      name: params.userName || '',
      email: params.userEmail || '',
      contact: params.userPhone || '',
    },
    onVerify: async (paymentId, _refId, signature) => {
      const verifyRes = await fetch('/api/razorpay/verify-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan: params.plan,
          razorpay_order_id: orderId || undefined,
          razorpay_subscription_id: subscriptionId || undefined,
          razorpay_payment_id: paymentId,
          razorpay_signature: signature,
        }),
      });
      const vData = await verifyRes.json().catch(() => ({}));
      if (!verifyRes.ok || !vData?.success) {
        throw new Error(vData?.error || 'Subscription verification failed');
      }
    },
    onSuccess: (paymentId, refId) => params.onSuccess?.(paymentId, refId),
    onFailure: (err) => params.onFailure?.(err),
  });

  return { subscriptionId, orderId };
}

/** Razorpay option set shared by subscription and one-time checkouts. */
async function openRazorpay(opts: {
  keyId?: string;
  subscriptionId?: string;
  orderId?: string;
  amountPaisa?: number;
  description: string;
  prefill: { name: string; email: string; contact: string };
  onSuccess?: (paymentId: string, orderId?: string) => void;
  /** Verify the signature server-side, return the result. */
  onVerify?: (
    paymentId: string,
    orderId: string,
    signature: string
  ) => Promise<number | void>;
  /** Fired after a successful verification (credit packs). */
  onCredits?: (credits: number) => void;
  onFailure?: (error: Error) => void;
}): Promise<void> {
  const loaded = await loadRazorpayScript();
  if (!loaded) {
    throw new Error('Failed to load Razorpay payment gateway. Please check your internet connection.');
  }

  const keyId = opts.keyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  if (!keyId) throw new Error('Razorpay key not configured');

  const handler = function (response: {
    razorpay_payment_id?: string;
    razorpay_order_id?: string;
    razorpay_subscription_id?: string;
    razorpay_signature?: string;
  }) {
    const paymentId = response.razorpay_payment_id || '';
    const orderId = response.razorpay_order_id || '';
    const subscriptionId = response.razorpay_subscription_id || '';
    const signature = response.razorpay_signature || '';
    const refId = orderId || subscriptionId;

    if (opts.onVerify) {
      opts
        .onVerify(paymentId, refId, signature)
        .then((result) => {
          if (typeof result === 'number') opts.onCredits?.(result);
          else opts.onSuccess?.(paymentId, refId);
        })
        .catch((err) => opts.onFailure?.(err));
    } else {
      opts.onSuccess?.(paymentId, refId);
    }
  };

  const options: Record<string, unknown> = {
    key: keyId,
    currency: 'INR',
    name: 'PlotBook Dholera SIR',
    description: opts.description,
    image: 'https://dholeramap.com/logo.png',
    prefill: opts.prefill,
    theme: { color: '#2563EB' },
    handler,
    modal: {
      ondismiss: function () {
        opts.onFailure?.(new Error('Payment window closed by user'));
      },
    },
  };
  if (opts.subscriptionId) {
    options.subscription_id = opts.subscriptionId;
  } else if (opts.orderId) {
    options.order_id = opts.orderId;
    options.amount = opts.amountPaisa;
  }

  if (!window.Razorpay) {
    throw new Error('Razorpay SDK unavailable');
  }

  const rzp = new window.Razorpay(options);
  rzp.open();
}

/**
 * One-time credit-pack checkout. The order (and its price) is created
 * server-side so the amount can never be tampered with in the browser. The
 * checkout handler posts the returned signature to /verify-payment, which
 * cryptographically confirms the payment before credits are granted.
 */
export async function initiateCreditPackCheckout(params: {
  credits: number;
  userEmail?: string;
  userName?: string;
  userPhone?: string;
  onSuccess?: (credits: number) => void;
  onFailure?: (error: Error) => void;
}): Promise<void> {
  const res = await fetch('/api/razorpay/credits', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ credits: params.credits }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({ error: 'Unknown error' }));
    const msg = data?.detail ? `${data.error} (${data.detail})` : (data?.error || `Could not create credit order`);
    throw new Error(msg);
  }
  const { orderId, amountPaisa, credits, keyId } = await res.json();

  await openRazorpay({
    keyId,
    orderId,
    amountPaisa,
    description: `${credits} Dossier PDF credits`,
    prefill: {
      name: params.userName || '',
      email: params.userEmail || '',
      contact: params.userPhone || '',
    },
    // Verify the signature server-side before treating the payment as real.
    onVerify: async (paymentId, orderId, signature) => {
      const verifyRes = await fetch('/api/razorpay/verify-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          razorpay_order_id: orderId,
          razorpay_payment_id: paymentId,
          razorpay_signature: signature,
          credits,
        }),
      });
      const data = await verifyRes.json().catch(() => ({}));
      if (!verifyRes.ok || !data?.success) {
        throw new Error(data?.error || 'Payment verification failed');
      }
      return data.credits ?? credits;
    },
    onCredits: (n) => params.onSuccess?.(n),
    onFailure: (err) => params.onFailure?.(err),
  });
}

/**
 * Legacy one-time payment path (kept for the existing billing page flow until
 * it migrates to subscriptions). New callers should use the subscription or
 * credit-pack helpers above.
 */
export async function initiateRazorpayCheckout(params: CheckoutParams): Promise<void> {
  const loaded = await loadRazorpayScript();
  if (!loaded) {
    throw new Error('Failed to load Razorpay payment gateway. Please check your internet connection.');
  }

  const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  if (!keyId) throw new Error('Razorpay key not configured');

  const options: Record<string, unknown> = {
    key: keyId,
    amount: params.amount * 100, // amount in paisa
    currency: 'INR',
    name: 'PlotBook Dholera SIR',
    description: `${params.planName} (${params.billingCycle === 'annual' ? 'Annual Pass' : 'Monthly'})`,
    image: 'https://dholeramap.com/logo.png',
    prefill: {
      name: params.userName || '',
      email: params.userEmail || '',
      contact: params.userPhone || '',
    },
    theme: {
      color: '#2563EB', // blue-600
    },
    handler: function (response: { razorpay_payment_id?: string; razorpay_order_id?: string }) {
      params.onSuccess?.(response.razorpay_payment_id || '', response.razorpay_order_id);
    },
    modal: {
      ondismiss: function () {
        params.onFailure?.(new Error('Payment window closed by user'));
      },
    },
  };

  if (!window.Razorpay) {
    throw new Error('Razorpay SDK unavailable');
  }

  const rzp = new window.Razorpay(options);
  rzp.open();
}

/**
 * Ad-budget boost checkout. Creates a server-side Razorpay order for the
 * specified INR amount, opens checkout, then verifies the signature
 * server-side before crediting the broker's ad spend. The ranking increase
 * only happens after cryptographic payment proof.
 */
export async function initiateAdBoostCheckout(params: {
  amountInr: number;
  userEmail?: string;
  userName?: string;
  userPhone?: string;
  onSuccess?: (result: {
    totalAdSpend: number;
    /** Rupees actually credited (0 if the webhook had already recorded it). */
    boostApplied: number;
    alreadyRecorded?: boolean;
  }) => void;
  onFailure?: (error: Error) => void;
}): Promise<void> {
  // 1. Create the order server-side (the amount is validated there too)
  const res = await fetch('/api/razorpay/ad-boost', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount: params.amountInr }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({ error: 'Unknown error' }));
    const msg = data?.detail ? `${data.error} (${data.detail})` : (data?.error || `Could not create ad-boost order`);
    throw new Error(msg);
  }
  const { orderId, amountPaisa, amountInr, keyId } = await res.json();

  // 2. Open Razorpay checkout with verified signature flow
  await openRazorpay({
    keyId,
    orderId,
    amountPaisa,
    description: `₹${amountInr.toLocaleString('en-IN')} Ad Budget Boost — Broker Directory Ranking`,
    prefill: {
      name: params.userName || '',
      email: params.userEmail || '',
      contact: params.userPhone || '',
    },
    onVerify: async (paymentId, orderId, signature) => {
      // The server credits only the amount Razorpay reports as paid for this
      // order, so nothing the browser sends here can inflate the ranking.
      const verifyRes = await fetch('/api/razorpay/verify-ad-boost', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          razorpay_order_id: orderId,
          razorpay_payment_id: paymentId,
          razorpay_signature: signature,
          amount: params.amountInr,
        }),
      });
      const data = await verifyRes.json().catch(() => ({}));
      if (!verifyRes.ok || !data?.success) {
        throw new Error(data?.error || 'Payment verification failed');
      }
      params.onSuccess?.({
        totalAdSpend: data.totalAdSpend,
        boostApplied: Number(data.boostApplied) || 0,
        alreadyRecorded: Boolean(data.alreadyRecorded),
      });
      // Return void (not a number) so openRazorpay skips onCredits
      return;
    },
    onFailure: (err) => params.onFailure?.(err),
  });
}

export interface StandardCheckoutParams {
  amountPaise: number;
  currency?: string;
  name?: string;
  description?: string;
  notes?: Record<string, string>;
  receipt?: string;
  userEmail?: string;
  userName?: string;
  userPhone?: string;
  onSuccess?: (result: { paymentId: string; orderId: string; message: string }) => void;
  onFailure?: (error: Error) => void;
}

export async function initiateStandardCheckout(params: StandardCheckoutParams): Promise<void> {
  const loaded = await loadRazorpayScript();
  if (!loaded || typeof window === 'undefined' || !window.Razorpay) {
    throw new Error('Failed to load Razorpay SDK');
  }

  const res = await fetch('/api/create-order', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      amount: params.amountPaise,
      currency: params.currency || 'INR',
      receipt: params.receipt,
      notes: params.notes,
    }),
  });

  const order = await res.json();
  if (!res.ok || !order.order_id) {
    throw new Error(order.error || 'Failed to create order');
  }

  const keyId = order.key_id || order.keyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  if (!keyId) throw new Error('Razorpay key not configured');

  const rzp = new window.Razorpay({
    key: keyId,
    amount: order.amount,
    currency: order.currency || 'INR',
    name: params.name || 'DholeraMap Standard Checkout',
    description: params.description || `Order ${order.order_id}`,
    order_id: order.order_id,
    prefill: {
      name: params.userName || '',
      email: params.userEmail || '',
      contact: params.userPhone || '',
    },
    notes: params.notes || {},
    handler: async (response: {
      razorpay_payment_id: string;
      razorpay_order_id: string;
      razorpay_signature: string;
    }) => {
      try {
        const verifyRes = await fetch('/api/verify-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          }),
        });
        const verifyData = await verifyRes.json();
        if (verifyRes.ok && verifyData.success) {
          params.onSuccess?.({
            paymentId: response.razorpay_payment_id,
            orderId: response.razorpay_order_id,
            message: verifyData.message || 'Payment verified',
          });
        } else {
          throw new Error(verifyData.error || 'Payment signature verification failed');
        }
      } catch (err: any) {
        params.onFailure?.(err instanceof Error ? err : new Error(String(err)));
      }
    },
    modal: {
      ondismiss: () => {},
    },
  });

  rzp.open();
}

