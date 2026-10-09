import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Saved Plots & Registry Vault | DholeraMap',
  description: 'Manage your saved Dholera SIR plots, 7/12 land records, and interactive bookmarks.',
  robots: {
    index: false,
    follow: false,
  },
  alternates: {
    canonical: 'https://dholeramap.com/dashboard',
  },
};

import { redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');
  return <>{children}</>;
}
