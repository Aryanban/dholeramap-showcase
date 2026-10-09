'use client';

/**
 * PropertyFilters — interactive inventory grid for /properties.
 *
 * Same contract as BrokersDirectory: the server passes the full listing set in
 * and the first render (with no filter applied) emits every card into the
 * static HTML. Filtering then narrows the list in place. Without the
 * server-supplied initial state this component would ship an empty page.
 */

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  MapPin,
  ExternalLink,
  FileText,
  MessageCircle,
  Building2,
  Ruler,
  IndianRupee,
  Search,
} from 'lucide-react';

export interface Listing {
  id: string;
  title: string;
  village: string;
  tpScheme: string;
  sid: string;
  fp: string;
  survey: string;
  zone: string;
  roadWidth: string;
  pricePerSqYd: string;
  totalDemand: string;
  highlights: string[];
  hasBrochure: boolean;
  status: string;
  listedDate: string;
  /** Parent broker, flattened so the card can link to the profile. */
  brokerName: string;
  brokerAgency: string;
  brokerId: string;
  brokerWhatsapp: string;
  brokerPhotoUrl: string;
}

const SCHEMES = ['All', 'TP 1', 'TP 2', 'TP 3', 'TP 4', 'TP 5', 'TP 6'];

const STATUS_LABEL: Record<string, string> = {
  available: 'Available',
  under_token: 'Under Token',
  sold: 'Sold',
};

export default function PropertyFilters({ initialListings }: { initialListings: Listing[] }) {
  const [village, setVillage] = useState<string>('All');
  const [scheme, setScheme] = useState<string>('All');
  const [status, setStatus] = useState<string>('available');
  const [query, setQuery] = useState<string>('');

  const villages = useMemo(() => {
    const set = new Set<string>();
    for (const l of initialListings) if (l.village) set.add(l.village);
    return Array.from(set).sort();
  }, [initialListings]);

  const filtered = useMemo(
    () =>
      initialListings.filter((l) => {
        if (status !== 'all' && l.status !== status) return false;
        if (village !== 'All' && l.village !== village) return false;
        if (scheme !== 'All' && !l.tpScheme.includes(scheme)) return false;
        if (query.trim()) {
          const q = query.toLowerCase();
          const hay = `${l.title} ${l.village} ${l.fp} ${l.survey} ${l.zone} ${l.brokerAgency}`.toLowerCase();
          if (!hay.includes(q)) return false;
        }
        return true;
      }),
    [initialListings, village, scheme, status, query]
  );

  const reset = () => {
    setVillage('All');
    setScheme('All');
    setStatus('available');
    setQuery('');
  };

  return (
    <>
      {/* Filter toolbar */}
      <section className="max-w-6xl mx-auto px-4 mb-8">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
          <div className="flex flex-col lg:flex-row gap-3 lg:items-center">
            {/* Free-text search over FP / survey / village / zone */}
            <div className="w-full lg:w-72 relative">
              <Search
                className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-400 pointer-events-none"
                aria-hidden="true"
              />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search FP, survey no, village or zone…"
                aria-label="Search Dholera plot listings by Final Plot number, survey number, village or zone"
                className="w-full h-9 pl-8 pr-3 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition font-medium"
              />
            </div>

            {/* Village */}
            <label className="flex items-center gap-2 text-xs font-bold text-slate-500">
              Village
              <select
                value={village}
                onChange={(e) => setVillage(e.target.value)}
                className="h-9 px-2.5 text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              >
                <option value="All">All villages</option>
                {villages.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </label>

            {/* Availability */}
            <label className="flex items-center gap-2 text-xs font-bold text-slate-500">
              Status
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="h-9 px-2.5 text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              >
                <option value="available">Available now</option>
                <option value="under_token">Under token</option>
                <option value="sold">Sold</option>
                <option value="all">Any status</option>
              </select>
            </label>

            <div className="lg:ml-auto flex items-center gap-3">
              <span className="text-xs font-bold text-slate-500" aria-live="polite">
                {filtered.length} {filtered.length === 1 ? 'plot' : 'plots'}
              </span>
              {(village !== 'All' || scheme !== 'All' || status !== 'available' || query) && (
                <button
                  type="button"
                  onClick={reset}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                >
                  Clear filters
                </button>
              )}
            </div>
          </div>

          {/* TP scheme chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-xs font-bold text-slate-400 mr-1 shrink-0">TP Scheme:</span>
            {SCHEMES.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setScheme(s)}
                aria-pressed={scheme === s}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                  scheme === s
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </section>


      {/* Inventory grid */}
      <section className="max-w-6xl mx-auto px-4">
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mb-4">
          Verified Dholera SIR Plot Listings
        </h2>
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500">
            <Building2 className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-800">No plots match these filters</p>
            <p className="text-xs mt-1">
              Try widening the status filter, switching the TP scheme back to All, or clearing your search.
            </p>
            <button
              type="button"
              onClick={reset}
              className="mt-4 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition cursor-pointer"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filtered.map((p) => {
              const mapHref = `/map?sid=${p.sid}&fp=${p.fp}&survey=${p.survey}&village=${p.village}`;
              return (
                <article
                  key={`${p.brokerId}-${p.id}`}
                  className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs flex flex-col hover:border-blue-300 transition"
                >
                  {/* Price + status header */}
                  <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-100">
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                        Asking Price
                      </span>
                      <span className="text-lg font-black text-slate-900 flex items-center gap-0.5">
                        <IndianRupee className="w-4 h-4 text-slate-400" />
                        {p.totalDemand.replace('₹', '')}
                      </span>
                      <span className="text-[11px] font-medium text-slate-500">{p.pricePerSqYd}</span>
                    </div>
                    <span
                      className={`shrink-0 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                        p.status === 'available'
                          ? 'text-emerald-800 bg-emerald-50 border-emerald-200'
                          : p.status === 'under_token'
                          ? 'text-amber-800 bg-amber-50 border-amber-200'
                          : 'text-slate-500 bg-slate-100 border-slate-200'
                      }`}
                    >
                      {STATUS_LABEL[p.status] ?? p.status}
                    </span>
                  </div>

                  {/* Title + location */}
                  <h3 className="mt-3 text-sm font-black text-slate-900 leading-snug">{p.title}</h3>
                  <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-600">
                    <span className="inline-flex items-center gap-1 font-bold text-blue-700">
                      <MapPin className="w-3 h-3" />
                      {p.village || 'Dholera SIR'}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Building2 className="w-3 h-3 text-slate-400" />
                      {p.tpScheme}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Ruler className="w-3 h-3 text-slate-400" />
                      {p.roadWidth}
                    </span>
                  </div>


                  {/* Cadastral identifiers — the concrete, verifiable detail
                      that makes each listing a distinct search target. */}
                  <dl className="mt-3 grid grid-cols-2 gap-2 p-3 rounded-2xl bg-slate-50 border border-slate-200 text-[11px]">
                    <div>
                      <dt className="font-bold text-slate-400">Final Plot</dt>
                      <dd className="font-mono font-black text-slate-800">{p.fp}</dd>
                    </div>
                    <div>
                      <dt className="font-bold text-slate-400">Survey No</dt>
                      <dd className="font-mono font-black text-slate-800">{p.survey}</dd>
                    </div>
                    <div className="col-span-2">
                      <dt className="font-bold text-slate-400">Zone</dt>
                      <dd className="font-semibold text-slate-800">{p.zone}</dd>
                    </div>
                  </dl>

                  {p.highlights.length > 0 && (
                    <ul className="mt-3 flex flex-wrap gap-1.5">
                      {p.highlights.map((h) => (
                        <li
                          key={h}
                          className="text-[10px] font-medium text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md"
                        >
                          {h}
                        </li>
                      ))}
                    </ul>
                  )}

                  {/* Listed-by broker: an internal link into the directory, so
                      every property also passes authority to its agent page. */}
                  <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-2">
                    {p.brokerPhotoUrl ? (
                      <Image
                        src={p.brokerPhotoUrl}
                        alt={`${p.brokerName}, ${p.brokerAgency}`}
                        width={28}
                        height={28}
                        className="w-7 h-7 rounded-full object-cover border border-slate-200"
                      />
                    ) : (
                      <span className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200" />
                    )}
                    <span className="min-w-0 flex-1 text-[11px] text-slate-500">
                      Listed by{' '}
                      <Link
                        href={`/brokers/${p.brokerId}`}
                        className="font-bold text-blue-700 hover:text-blue-900 transition"
                      >
                        {p.brokerAgency}
                      </Link>
                    </span>
                    <span className="text-[10px] text-slate-400 shrink-0">{p.listedDate}</span>
                  </div>


                  {/* Actions */}
                  <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-3 gap-2">
                    <Link
                      href={mapHref}
                      className="h-9 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1 transition"
                      title="Inspect this parcel on the DholeraMap interactive atlas"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>Map</span>
                    </Link>

                    <Link
                      href={mapHref}
                      className="h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-1 transition"
                      title="Open the parcel record and brochure dossier"
                    >
                      <FileText className="w-3 h-3 text-blue-600" />
                      <span>Details</span>
                    </Link>

                    <a
                      href={`https://wa.me/${p.brokerWhatsapp}?text=${encodeURIComponent(
                        `Hello ${p.brokerName}, I found this Dholera SIR plot on DholeraMap: ${p.title} (${p.village}, Survey ${p.survey}, FP-${p.fp}). Is it still available?`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="h-9 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 font-bold text-xs flex items-center justify-center gap-1 transition cursor-pointer"
                      title="Ask the listing agent about this plot on WhatsApp"
                    >
                      <MessageCircle className="w-3 h-3 text-emerald-600" />
                      <span>Enquire</span>
                    </a>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </>
  );
}
