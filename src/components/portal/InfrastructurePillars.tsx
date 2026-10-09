import React from 'react';
import Link from 'next/link';
import { Cpu, Route, Plane, Layers, Sparkles, MapPin } from 'lucide-react';

interface Pillar {
  title: string;
  badge: string;
  badgeColor: string;
  stat: string;
  statLabel: string;
  description: string;
  location: string;
  link: string;
  icon: React.ReactNode;
}

const PILLARS: Pillar[] = [
  {
    title: 'Tata Semiconductor Mega-Fab',
    badge: 'Flagship Anchor',
    badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
    stat: '₹91,000 Cr',
    statLabel: 'Capital Investment',
    description:
      'India’s first commercial semiconductor fabrication facility in partnership with Powerchip (PSMC) Taiwan. Producing 50,000 wafers per month for AI, defense, electric vehicles, and high-performance computing.',
    location: 'TP 2 (Activation Area · Kadipur / Hebatpur)',
    link: '/tata-semiconductor-dholera-map',
    icon: <Cpu className="w-6 h-6 text-blue-600" />,
  },
  {
    title: '109 km Ahmedabad–Dholera Expressway',
    badge: 'Direct Connectivity',
    badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    stat: '40 Mins',
    statLabel: 'Transit Time from Ahmedabad',
    description:
      'High-speed 4-lane access-controlled expressway connecting Ahmedabad (Sarkhej–Bhavnagar Highway) directly to Dholera SIR and the international airport, featuring an integrated RRTS corridor.',
    location: 'Expressway Interchanges · TP 1 to TP 6',
    link: '/dholera-expressway-airport-map',
    icon: <Route className="w-6 h-6 text-emerald-600" />,
  },
  {
    title: 'Greenfield International Airport',
    badge: 'Global Aviation Gateway',
    badgeColor: 'bg-sky-50 text-sky-700 border-sky-200',
    stat: '1,426 Ha',
    statLabel: 'Dedicated Aerotropolis Land',
    description:
      'Greenfield airport at Navagam equipped with twin 4,000m and 2,900m parallel runways capable of handling Code-F aircraft, designed as an international passenger and multi-modal air cargo hub.',
    location: 'Navagam / TP 6 Logistics Corridor',
    link: '/dholera-expressway-airport-map',
    icon: <Plane className="w-6 h-6 text-sky-600" />,
  },
  {
    title: 'Underground Smart City Utilities',
    badge: 'World-Class Infrastructure',
    badgeColor: 'bg-amber-50 text-amber-800 border-amber-200',
    stat: '100% In-Ground',
    statLabel: 'Zero Overhead Cables',
    description:
      'The 22.5 sq km Activation Area operates on fully subterranean trunk corridors: dual potable and recycled water mains, automated SCADA sensors, gas grids, and high-speed optical fiber communications.',
    location: 'Statutory DSIRDA Sanction · Gujarat SIR Act 2009',
    link: '/guide',
    icon: <Layers className="w-6 h-6 text-amber-600" />,
  },
];

export default function InfrastructurePillars() {
  return (
    <section className="py-16 sm:py-24 bg-white border-y border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Mega-Scale Catalyst Projects</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 leading-tight">
            Why Dholera SIR is India’s Premier Greenfield Smart City
          </h2>
          <p className="mt-3 text-base text-slate-600 leading-relaxed">
            Administered under the statutory Gujarat SIR Act 2009 by DSIRDA and DICDL, Dholera spans
            920 square kilometers of master-planned industrial, logistics, and residential zones.
            Trunk infrastructure is operational in the Activation Area.
          </p>
        </div>

        {/* 4 Bento Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {PILLARS.map((p) => (
            <div
              key={p.title}
              className="group relative rounded-2xl border border-slate-200/90 bg-slate-50/50 p-6 sm:p-8 hover:bg-white hover:border-blue-300 hover:shadow-xl transition duration-300 flex flex-col justify-between"
            >
              <div>
                {/* Card Top: Icon, Title & Badge */}
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 shadow-2xs flex items-center justify-center group-hover:scale-110 transition shrink-0">
                    {p.icon}
                  </div>
                  <span
                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${p.badgeColor}`}
                  >
                    {p.badge}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-slate-900 tracking-tight group-hover:text-blue-600 transition">
                  {p.title}
                </h3>

                <p className="mt-2.5 text-xs text-slate-500 font-semibold flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{p.location}</span>
                </p>

                <p className="mt-3 text-sm text-slate-600 leading-relaxed">
                  {p.description}
                </p>
              </div>

              {/* Card Bottom: Metric & Link */}
              <div className="mt-6 pt-5 border-t border-slate-200/80 flex items-end justify-between">
                <div>
                  <span className="text-2xl font-black text-slate-900 tracking-tight block">
                    {p.stat}
                  </span>
                  <span className="text-[11px] font-medium text-slate-500">
                    {p.statLabel}
                  </span>
                </div>

                <Link
                  href={p.link}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 group-hover:translate-x-0.5 transition"
                >
                  <span>Explore blueprint</span>
                  <span>→</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
