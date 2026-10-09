'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MapPin } from 'lucide-react';

/**
 * Village-aware recovery link for the /survey 404.
 *
 * `not-found.tsx` receives no route params, so the village slug is recovered
 * from the pathname. Isolated into its own client module so the surrounding 404
 * can stay a server component — an all-client not-found boundary rendered an
 * empty document.
 *
 * Renders nothing until mounted, which is fine: the parent 404 is fully
 * server-rendered and carries its own static "Browse all 22 villages" link.
 */
export default function VillageRecoveryLink() {
  const pathname = usePathname();
  const match = pathname?.match(/^\/survey\/([a-z0-9-]+)\//i);
  if (!match) return null;

  const slug = match[1];
  const name = slug.charAt(0).toUpperCase() + slug.slice(1);

  return (
    <Link
      href={`/village/${slug}`}
      className="inline-flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-800 text-sm font-bold rounded-xl border border-slate-300 transition cursor-pointer"
    >
      <MapPin className="w-4 h-4 text-blue-600" />
      See every published parcel in {name}
    </Link>
  );
}