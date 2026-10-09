import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Billing & Invoices | DholeraMap',
  description: 'Manage your PlotBook subscription, payment methods, and GST tax invoices.',
  robots: {
    index: false,
    follow: false,
  },
  alternates: {
    canonical: 'https://dholeramap.com/billing',
  },
};

import { redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';

export default async function BillingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');
  return <>{children}</>;
}
