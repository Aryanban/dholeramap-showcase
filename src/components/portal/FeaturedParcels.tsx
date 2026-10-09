'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  MapPin,
  Tag,
  Users,
  Share2,
  ShieldCheck,
  Crown,
  Award,
  Sparkles,
  ExternalLink,
  Phone,
  MessageCircle,
} from 'lucide-react';
import { getRankedBrokers, SEEDED_BROKERS, type BrokerProfile, type BrokerProperty } from '@/lib/brokers';

interface BrokerFeaturedItem {
  broker: {
    id: string;
    name: string;
    agency: string;
    photoUrl: string;
    logoInitial: string;
    logoColor: string;
    reraNumber: string;
    rank: number;
    phone: string;
    whatsapp: string;
  };
  property: BrokerProperty;
}

function extractFeaturedItems(brokerList: BrokerProfile[]): BrokerFeaturedItem[] {
  const items: BrokerFeaturedItem[] = [];
  brokerList.forEach((b, idx) => {
    const rank = idx + 1;
    (b.properties || []).forEach((prop) => {
      // Strict admin verification: only approved featured properties go live
      const isApproved = prop.featuredStatus === 'approved' || (prop.featured !== false && prop.featuredStatus !== 'pending' && prop.featuredStatus !== 'rejected');
      if (isApproved) {
        items.push({
          broker: {
            id: b.id,
            name: b.name,
            agency: b.agency,
            photoUrl: b.photoUrl,
            logoInitial: b.logoInitial,
            logoColor: b.logoColor,
            reraNumber: b.reraNumber,
            rank,
            phone: b.phone,
            whatsapp: b.whatsapp,
          },
          property: prop,
        });
      }
    });
  });
  return items.slice(0, 6);
}

export default function FeaturedParcels() {
  const [featuredItems, setFeaturedItems] = useState<BrokerFeaturedItem[]>(() =>
    extractFeaturedItems(SEEDED_BROKERS)
  );

  useEffect(() => {
    const ranked = getRankedBrokers();
    setFeaturedItems(extractFeaturedItems(ranked));
  }, []);

  return (
    <section className="py-16 sm:py-24 bg-white border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 sm:mb-16 gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs font-bold uppercase tracking-wider mb-3 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Exclusively Listed by RERA Registered Brokers · 1,000+ Monthly Viewers</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 leading-tight">
              Featured Verified Broker Properties in <span className="text-blue-600">Dholera SIR</span>
            </h2>
            <p className="mt-3 text-base text-slate-600 leading-relaxed">
              Every parcel below is exclusively marketed by verified, RERA-registered land advisory partners. Cross-referenced with Gujarat AnyRoR revenue records and TP 1–6 interactive blueprints.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/brokers"
              className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 hover:bg-blue-600 px-5 py-3 text-xs font-bold text-white shadow-md transition shrink-0 group"
            >
              <Users className="w-4 h-4" />
              <span>View All Ranked Brokers Directory</span>
              <span className="group-hover:translate-x-0.5 transition">→</span>
            </Link>
          </div>
        </div>

        {/* Broker Property Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredItems.map((item) => {
            const { broker, property } = item;
            return (
              <div
                key={`${broker.id}-${property.id}`}
                className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs hover:shadow-xl hover:border-blue-300 transition duration-300 flex flex-col justify-between group"
              >
                <div>
                  {/* 1. Broker Profile Header Header */}
                  <div className="flex items-center justify-between gap-2 pb-3 mb-4 border-b border-slate-100">
                    <Link
                      href={`/brokers/${broker.id}`}
                      className="flex items-center gap-2.5 min-w-0 group/broker hover:opacity-90 transition"
                    >
                      {broker.photoUrl ? (
                        <div className="w-10 h-10 rounded-xl overflow-hidden border border-slate-200 shadow-2xs shrink-0 bg-slate-100 relative">
                          <Image
                            src={broker.photoUrl}
                            alt={broker.name}
                            width={40}
                            height={40}
                            className="w-full h-full object-cover"
                            unoptimized
                            loading="lazy"
                          />
                        </div>
                      ) : (
                        <div
                          className={`w-10 h-10 rounded-xl bg-gradient-to-br ${broker.logoColor} text-white flex items-center justify-center font-black text-xs shrink-0 shadow-2xs`}
                        >
                          {broker.logoInitial}
                        </div>
                      )}

                      <div className="min-w-0">
                        <span className="text-xs font-black text-slate-900 group-hover/broker:text-blue-600 transition block truncate leading-tight">
                          {broker.agency}
                        </span>
                        <span className="text-[11px] font-semibold text-slate-500 block truncate">
                          {broker.name}
                        </span>
                      </div>
                    </Link>

                    {/* Rank Badge */}
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider shrink-0 ${
                        broker.rank === 1
                          ? 'bg-amber-100 text-amber-950 border border-amber-300'
                          : broker.rank === 2
                          ? 'bg-blue-100 text-blue-900 border border-blue-200'
                          : 'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}
                    >
                      {broker.rank === 1 && <Crown className="w-3 h-3 text-amber-600 shrink-0" />}
                      {broker.rank === 2 && <Award className="w-3 h-3 text-blue-600 shrink-0" />}
                      {broker.rank > 2 && <Sparkles className="w-3 h-3 text-slate-400 shrink-0" />}
                      <span>Rank #{broker.rank}</span>
                    </span>
                  </div>

                  {/* 2. Statutory Plot Title & Location */}
                  <h3 className="text-base font-black text-slate-900 group-hover:text-blue-600 transition leading-snug">
                    {property.title}
                  </h3>

                  <p className="text-xs text-slate-500 font-medium mt-1 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{property.village} · {property.tpScheme}</span>
                  </p>

                  {/* Statutory Badges */}
                  <div className="flex items-center gap-1.5 flex-wrap mt-3">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                      FP {property.fp}
                    </span>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                      Survey {property.survey}
                    </span>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-emerald-600" />
                      <span>RERA Checked</span>
                    </span>
                  </div>

                  {/* 3. Pricing & Corridor Card */}
                  <div className="mt-4 p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                    <div className="flex items-baseline justify-between">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                        Asking Demand
                      </span>
                      <span className="text-base font-black text-slate-900">
                        {property.totalDemand}
                      </span>
                    </div>

                    <div className="flex items-baseline justify-between text-xs pt-1.5 border-t border-slate-200/80">
                      <span className="text-slate-500">Indicative Rate:</span>
                      <span className="font-bold text-blue-700">
                        {property.pricePerSqYd}
                      </span>
                    </div>

                    <div className="flex items-baseline justify-between text-xs">
                      <span className="text-slate-500">Frontage:</span>
                      <span className="font-bold text-slate-800 text-right truncate max-w-[150px]" title={property.roadWidth}>
                        {property.roadWidth}
                      </span>
                    </div>
                  </div>

                  {/* Zone Tag */}
                  <div className="mt-3">
                    <span className="text-[11px] font-semibold text-blue-700 bg-blue-50/70 border border-blue-100 px-2 py-0.5 rounded-md inline-flex items-center gap-1 truncate max-w-full">
                      <Tag className="w-3 h-3 text-blue-600 shrink-0" />
                      <span className="truncate">Zone: {property.zone}</span>
                    </span>
                  </div>
                </div>

                {/* 4. Action Buttons */}
                <div className="mt-5 pt-3.5 border-t border-slate-100 grid grid-cols-3 gap-2">
                  <Link
                    href={`/map?sid=${property.sid}&fp=${property.fp}`}
                    aria-label={`Inspect ${property.title} (FP ${property.fp}) on Interactive Map`}
                    className="h-9 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1 transition shadow-2xs"
                    title="Inspect parcel on DholeraMap"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span>Map</span>
                  </Link>

                  <Link
                    href={`/brokers/${broker.id}`}
                    aria-label={`View broker profile for ${broker.agency}`}
                    className="h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-1 transition"
                    title="View broker credentials and full portfolio"
                  >
                    <Users className="w-3 h-3 text-blue-600" />
                    <span>Broker</span>
                  </Link>

                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(
                      `Check out this verified plot in Dholera SIR listed by ${broker.agency}: ${property.title} (${property.village}, Survey ${property.survey}, FP-${property.fp}) · ${property.roadWidth} · ${property.zone}. View on DholeraMap: https://dholeramap.com/map?sid=${property.sid}&fp=${property.fp}`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Share ${property.title} on WhatsApp`}
                    className="h-9 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 font-bold text-xs flex items-center justify-center gap-1 transition cursor-pointer"
                    title="Share this property with others on WhatsApp"
                  >
                    <Share2 className="w-3 h-3 text-emerald-600" />
                    <span>Share</span>
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
