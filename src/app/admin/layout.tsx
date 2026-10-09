import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import { isAdminUser } from '@/lib/admin';

// Admin is a private console. It must never be indexed: it carries the
// homepage's title/canonical by default, which would otherwise create a
// duplicate-content entry under /admin. robots.txt disallows crawling it, but
// a discovered URL can still be indexed, so the directive is stated here too.
export const metadata: Metadata = {
  title: 'Admin Console | DholeraMap',
  robots: { index: false, follow: true },
};

/**
 * Server-side gate. Both Clerk middleware and this layout gate demand an
 * authenticated session, and membership is verified by verified email here —
 * not by the self-settable profile role, so no user can reach the console by
 * editing their profile. Non-admins get a 404 rather than a hint that the
 * console exists.
 */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');
  if (!(await isAdminUser(userId))) notFound();
  return children;
}
