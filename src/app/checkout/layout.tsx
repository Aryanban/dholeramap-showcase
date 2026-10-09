import type { Metadata } from 'next';

/**
 * Checkout is a transactional payment screen, not a search destination. It
 * inherits the homepage title by default, so it must never be indexed: an
 * indexable URL with the homepage title and unrelated content is a
 * duplicate-title signal. robots.txt already disallows crawling /checkout,
 * but a discovered URL can still be indexed, so the directive is stated here
 * too. This is a server-component layout whose only job is to own this
 * metadata — the actual checkout UI in page.tsx must stay a client component
 * for the Razorpay flow.
 */
export const metadata: Metadata = {
  title: 'Secure Checkout | DholeraMap',
  robots: { index: false, follow: false },
};

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
