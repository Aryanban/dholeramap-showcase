import type { Metadata } from 'next';

// Private settings screen — same rationale as admin/layout.tsx: never index,
// and never compete with the homepage canonical.
export const metadata: Metadata = {
  title: 'Settings | DholeraMap',
  robots: { index: false, follow: true },
};

import { redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';

export default async function SettingsLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');
  return children;
}
