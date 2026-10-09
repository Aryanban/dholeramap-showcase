'use client';

import React, { useState } from 'react';


export interface RazorpayCheckoutButtonProps {
  /** Amount in INR (e.g., 100 for ₹100) or in Paise if amountInPaise is true */
  amount: number;
  /** Set to true if the amount prop is already in paise (min 100 paise) */
  amountInPaise?: boolean;
  currency?: string;
  name?: string;
  description?: string;
  receipt?: string;
  notes?: Record<string, string>;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  themeColor?: string;
  buttonText?: string;
  className?: string;
  disabled?: boolean;
  onSuccess?: (verifyResult: {
    success: boolean;
    message: string;
    payment_id: string;
    order_id: string;
  }) => void;
  onFailure?: (error: { message: string; details?: any }) => void;
  onDismiss?: () => void;
}

/**
 * Loads the standard Razorpay checkout.js script asynchronously if not already present.
 */
function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') return resolve(false);
    if (window.Razorpay) return resolve(true);

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

export default function RazorpayCheckoutButton({
  amount,
  amountInPaise = false,
  currency = 'INR',
  name = 'DholeraMap Standard Checkout',
  description = 'Online Payment Transaction',
  receipt,
  notes,
  prefill,
  themeColor = '#1e3a8a',
  buttonText,
  className,
  disabled = false,
  onSuccess,
  onFailure,
  onDismiss,
}: RazorpayCheckoutButtonProps) {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Compute amount in paise (min 100 paise = ₹1.00)
  const finalAmountPaise = Math.round(amountInPaise ? amount : amount * 100);

  async function handleCheckout() {
    if (disabled || loading) return;
    setErrorMsg(null);
    setLoading(true);

    try {
      // 1. Ensure Razorpay checkout.js script is loaded
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded || !window.Razorpay) {
        throw new Error('Failed to load Razorpay SDK. Please check your internet connection.');
      }

      // 2. Step 1: Call backend /api/create-order
      const orderRes = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: finalAmountPaise,
          currency,
          receipt,
          notes,
        }),
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok || !orderData.order_id) {
        throw new Error(orderData.error || 'Failed to create payment order');
      }

      // 3. Step 2: Configure Razorpay modal options
      const keyId =
        orderData.key_id || orderData.keyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
      if (!keyId) throw new Error('Razorpay key not configured');

      const options = {
        key: keyId,
        amount: orderData.amount,
        currency: orderData.currency || 'INR',
        name,
        description,
        order_id: orderData.order_id,
        prefill: {
          name: prefill?.name || '',
          email: prefill?.email || '',
          contact: prefill?.contact || '',
        },
        notes: notes || {},
        theme: {
          color: themeColor,
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
            if (onDismiss) onDismiss();
          },
        },
        handler: async (response: {
          razorpay_payment_id: string;
          razorpay_order_id: string;
          razorpay_signature: string;
        }) => {
          try {
            // 4. Step 3: Call backend /api/verify-payment to verify cryptographic signature
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
            setLoading(false);

            if (verifyRes.ok && verifyData.success) {
              if (onSuccess) {
                onSuccess(verifyData);
              }
            } else {
              const err = new Error(verifyData.error || 'Payment signature verification failed.');
              setErrorMsg(err.message);
              if (onFailure) {
                onFailure({ message: err.message, details: verifyData });
              }
            }
          } catch (err: any) {
            setLoading(false);
            const msg = err?.message || 'Error communicating with verification server.';
            setErrorMsg(msg);
            if (onFailure) {
              onFailure({ message: msg, details: err });
            }
          }
        },
      };

      const rzpInstance = new window.Razorpay(options);

      // Handle payment failure event
      rzpInstance.on('payment.failed', (response: any) => {
        setLoading(false);
        const failMessage =
          response?.error?.description ||
          response?.error?.reason ||
          'Payment failed. Please try again.';
        setErrorMsg(failMessage);
        if (onFailure) {
          onFailure({ message: failMessage, details: response.error });
        }
      });

      rzpInstance.open();
    } catch (err: any) {
      setLoading(false);
      const msg = err?.message || 'Failed to initialize Razorpay checkout.';
      setErrorMsg(msg);
      if (onFailure) {
        onFailure({ message: msg, details: err });
      }
    }
  }

  const defaultBtnText = buttonText || `Pay ₹${(finalAmountPaise / 100).toLocaleString('en-IN')}`;

  return (
    <div className="inline-flex flex-col items-start gap-1">
      <button
        type="button"
        onClick={handleCheckout}
        disabled={disabled || loading}
        className={
          className ||
          'inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer'
        }
      >
        {loading ? (
          <>
            <svg
              className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8H4z"
              />
            </svg>
            Processing...
          </>
        ) : (
          defaultBtnText
        )}
      </button>

      {errorMsg && (
        <span className="text-xs text-rose-600 font-medium mt-1">
          {errorMsg}
        </span>
      )}
    </div>
  );
}
