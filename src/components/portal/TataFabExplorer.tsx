'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Cpu, 
  MapPin, 
  Zap, 
  Droplets, 
  Flame, 
  Truck, 
  CheckCircle2, 
  ArrowRight, 
  ChevronRight, 
  Factory, 
  Layers, 
  Building2, 
  Calendar,
  Sparkles,
  ExternalLink
} from 'lucide-react';

interface ProcessNode {
  id: string;
  name: string;
  category: string;
  applications: string[];
  waferCapacity: string;
  primaryBuyers: string;
  marketRole: string;
}

const NODES: ProcessNode[] = [
  {
    id: '28nm',
    name: '28nm High-Performance Mobile & Auto',
    category: 'High-Density Logic & EV Computing',
    applications: ['Automotive Engine Control Units (ECUs)', 'Advanced Driver-Assistance Systems (ADAS)', 'Edge AI Accelerators', '5G Baseband Modules'],
    waferCapacity: '18,000 Wafers / month',
    primaryBuyers: 'Tata Motors, Tejas Networks, Global Tier-1 EV Manufacturers',
    marketRole: 'The highest-margin node at the facility, addressing India’s massive import deficit in automotive microcontrollers.'
  },
  {
    id: '40nm',
    name: '40nm Ultra-Low Power IoT',
    category: 'Power Management & Telematics',
    applications: ['Smart Metering Infrastructure (RDSS)', 'Smart City Sensor Grids', 'Wearables & Telematics', 'Connected Home Controllers'],
    waferCapacity: '15,000 Wafers / month',
    primaryBuyers: 'Tata Power, Consumer Electronics, Industrial Automation OEMs',
    marketRole: 'Critical for India’s 25 Crore smart prepaid meter rollout and IoT sensor networks.'
  },
  {
    id: '55nm',
    name: '55nm Display & Sensor ICs',
    category: 'Mixed-Signal & Display Drivers',
    applications: ['OLED & LCD Display Driver ICs (DDIC)', 'Touch Screen Controllers', 'Automotive Lighting Management', 'Power Delivery Systems'],
    waferCapacity: '10,000 Wafers / month',
    primaryBuyers: 'Consumer Electronics Brands, Display Panel Integrators',
    marketRole: 'Supplies display drivers for mobile devices, commercial monitors, and digital instrument clusters.'
  },
  {
    id: '90nm',
    name: '90nm Industrial & Analog',
    category: 'Legacy Analog & Power Semiconductor',
    applications: ['Solar Inverter Controllers', 'Heavy Industrial Switching', 'Railways Locomotive Signaling', 'Defense Avionics Components'],
    waferCapacity: '7,000 Wafers / month',
    primaryBuyers: 'Indian Railways, Heavy Engineering Corridors, Defense Contractors',
    marketRole: 'Robust, radiation-hardened analog architectures built for extreme durability in industrial and grid applications.'
  }
];

const PHASES = [
  {
    phase: 'Phase 1: Clearances & Statutory Ground',
    timing: 'Q1 2024 (Completed)',
    status: 'completed',
    title: 'Union Cabinet & ISM Sanction',
    description: 'Received ₹91,000 Cr financial approval under India Semiconductor Mission. 160-acre plot allotment finalized in TP 2 Activation Area.'
  },
  {
    phase: 'Phase 2: Heavy Civil & EPC Erection',
    timing: 'Q3 2024 – Q4 2025 (Active)',
    status: 'active',
    title: 'L&T Cleanroom & Structural Erection',
    description: 'Deep vibro-replacement piling complete for vibration-free lithography foundations. 400kV dual-feed grid & 100 MLD RO UPW water lines interconnected.'
  },
  {
    phase: 'Phase 3: Cleanroom Tool Move-in',
    timing: 'Q1 – Q3 2026',
    status: 'upcoming',
    title: 'ASML / Applied Materials Tool Hook-Up',
    description: 'Installation of extreme-purity gas manifolds, immersion lithography scanners, chemical vapor deposition (CVD), and wafer handling robotics.'
  },
  {
    phase: 'Phase 4: Commercial Wafer Ramp',
    timing: 'Late 2026 onwards',
    status: 'upcoming',
    title: 'First 300mm Silicon Wafer Output',
    description: 'Pilot qualification runs with Tata Motors & global auto clients, scaling towards 50,000 wafer starts per month (WSPM).'
  }
];

const SURROUNDING_VILLAGES = [
  { name: 'Kadipur', distance: '1.2 km', role: 'Direct Fab Western Border', tp: 'TP 2 (Activation Core)', impact: 'Highest land appreciation; prime zone for executive housing & engineering hotels.' },
  { name: 'Bhadiyad', distance: '2.8 km', role: 'Northern Logistics Link', tp: 'TP 1 / TP 2 Boundary', impact: 'Direct connection to 70m arterial ring; high-density residential (R-1/R-2) townships.' },
  { name: 'Ambli', distance: '4.5 km', role: 'Administrative Core Core', tp: 'TP 1 Core', impact: 'Adjacent to ABCD Building and SCADA headquarters; commercial & tech incubator campuses.' },
  { name: 'Hebatpur', distance: '6.2 km', role: 'Expressway Frontage Corridor', tp: 'TP 5 / TP 2 Connector', impact: 'Warehousing, chemical storage, clean packaging (ATMP), and vendor supply parks.' }
];

export default function TataFabExplorer() {
  const [activeNode, setActiveNode] = useState<string>('28nm');
  const currentNode = NODES.find(n => n.id === activeNode) || NODES[0];

  return (
    <div className="space-y-12">
      {/* 1. PHOTOREALISTIC MEGA-FACILITY SHOWCASE HERO CARD */}
      <div className="relative rounded-3xl overflow-hidden border border-cyan-200/80 bg-white shadow-xl">
        <div className="relative h-72 sm:h-96 w-full">
          <Image
            src="/assets/showcase/tata_semiconductor_fab.jpg"
            alt="Tata Semiconductor Mega Fabrication Plant in Dholera SIR Activation Area"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-900/30 to-transparent" />
          
          {/* Floating Pill on Image */}
          <div className="absolute top-4 left-4 z-10 flex flex-wrap gap-2">
            <span className="px-3 py-1 rounded-full bg-cyan-500/90 text-slate-950 font-black text-xs uppercase tracking-wider backdrop-blur-md shadow-sm">
              ₹91,000 Cr Investment
            </span>
            <span className="px-3 py-1 rounded-full bg-white/90 text-slate-900 font-bold text-xs uppercase tracking-wider backdrop-blur-md">
              160-Acre Footprint · TP 2 Activation Area
            </span>
          </div>

          <div className="absolute bottom-5 left-5 right-5 z-10 text-white">
            <h2 className="text-xl sm:text-3xl font-black tracking-tight text-white drop-shadow-md">
              Tata Electronics &amp; PSMC 300mm Semiconductor Fab
            </h2>
            <p className="text-xs sm:text-sm text-cyan-100 font-medium mt-1 max-w-2xl line-clamp-2 drop-shadow">
              India&apos;s first commercial semiconductor fabrication plant, co-developed with Taiwan’s Powerchip Semiconductor (PSMC) in Town Planning Scheme 2.
            </p>
          </div>
        </div>

        {/* Live Facility Quick-Spec Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-slate-100 bg-slate-50/70 p-4 border-t border-slate-100 text-center">
          <div className="p-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Peak Production</span>
            <span className="text-base sm:text-lg font-black text-slate-900">50,000 WSPM</span>
            <span className="text-[10px] text-slate-500 block">300mm Silicon Wafers</span>
          </div>
          <div className="p-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Cleanroom Grade</span>
            <span className="text-base sm:text-lg font-black text-cyan-700">Class 1 &amp; 10</span>
            <span className="text-[10px] text-slate-500 block">ISO 14644-1 Spec</span>
          </div>
          <div className="p-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Power Infrastructure</span>
            <span className="text-base sm:text-lg font-black text-slate-900">400kV Dual-Grid</span>
            <span className="text-[10px] text-slate-500 block">5000MW Solar Park Tied</span>
          </div>
          <div className="p-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">High-Tech Employment</span>
            <span className="text-base sm:text-lg font-black text-emerald-700">20,000+ Jobs</span>
            <span className="text-[10px] text-slate-500 block">Engineers &amp; Specialists</span>
          </div>
        </div>
      </div>

      {/* 2. INTERACTIVE PROCESS NODE & WAFER PRODUCTION EXPLORER */}
      <section className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-cyan-700 mb-1">
              <Cpu className="w-4 h-4 text-cyan-600" />
              <span>Technology Architecture</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900">
              Interactive Silicon Node &amp; Wafer Production Matrix
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Select a semiconductor fabrication node to inspect specific wafer applications, target buyers, and industry impact.
            </p>
          </div>

          {/* Node Selector Pills */}
          <div className="flex flex-wrap gap-1.5 p-1 bg-slate-100 rounded-2xl shrink-0">
            {NODES.map((node) => (
              <button
                key={node.id}
                type="button"
                onClick={() => setActiveNode(node.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition cursor-pointer ${
                  activeNode === node.id
                    ? 'bg-cyan-600 text-white shadow-xs'
                    : 'text-slate-700 hover:text-slate-900 hover:bg-white/80'
                }`}
              >
                {node.id}
              </button>
            ))}
          </div>
        </div>

        {/* Active Node Detail Card */}
        <div className="rounded-2xl bg-gradient-to-br from-cyan-50/50 via-slate-50 to-blue-50/40 border border-cyan-200 p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-cyan-100 pb-3">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-cyan-700 px-2 py-0.5 rounded-md bg-cyan-100/70 border border-cyan-200">
                {currentNode.category}
              </span>
              <h4 className="text-lg font-black text-slate-900 mt-1">{currentNode.name}</h4>
            </div>
            <div className="text-left sm:text-right">
              <span className="text-[10px] font-bold text-slate-400 block uppercase">Dedicated Node Capacity</span>
              <span className="text-sm font-black text-cyan-800">{currentNode.waferCapacity}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-xl p-4 border border-cyan-100 shadow-2xs space-y-2">
              <span className="text-xs font-bold text-slate-800 block">End-Market Applications</span>
              <ul className="space-y-1 text-xs text-slate-600">
                {currentNode.applications.map((app, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-cyan-600 shrink-0" />
                    <span>{app}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white rounded-xl p-4 border border-cyan-100 shadow-2xs space-y-2">
              <span className="text-xs font-bold text-slate-800 block">Key Industrial Off-Takers</span>
              <p className="text-xs text-slate-700 font-medium">{currentNode.primaryBuyers}</p>
              <div className="pt-2 border-t border-slate-100">
                <span className="text-[11px] font-bold text-slate-400 block uppercase">Strategic National Role</span>
                <p className="text-xs text-slate-600 mt-0.5">{currentNode.marketRole}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. FOUR-STAGE CONSTRUCTION MILESTONES TRACKER */}
      <section className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-blue-700 mb-1">
            <Calendar className="w-4 h-4 text-blue-600" />
            <span>Project Milestones</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900">
            Four-Stage Construction &amp; Commissioning Roadmap
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Verified status tracking based on DSIRDA gazette announcements and Gujarat industrial progress logs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {PHASES.map((p, idx) => (
            <div
              key={idx}
              className={`rounded-2xl p-5 border flex flex-col justify-between transition ${
                p.status === 'completed'
                  ? 'bg-emerald-50/50 border-emerald-200'
                  : p.status === 'active'
                  ? 'bg-cyan-50/70 border-cyan-300 ring-2 ring-cyan-400/20 shadow-sm'
                  : 'bg-slate-50/70 border-slate-200'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                    Step 0{idx + 1}
                  </span>
                  <span
                    className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      p.status === 'completed'
                        ? 'bg-emerald-100 text-emerald-800'
                        : p.status === 'active'
                        ? 'bg-cyan-600 text-white animate-pulse'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {p.status === 'completed' ? '✓ Completed' : p.status === 'active' ? '● In Progress' : 'Pending'}
                  </span>
                </div>
                <h4 className="text-sm font-black text-slate-900 leading-tight">{p.title}</h4>
                <span className="text-[11px] font-bold text-cyan-800 block mt-1">{p.timing}</span>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">{p.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. SURROUNDING VILLAGES & HIGH-IMPACT BENEFICIARY RADAR */}
      <section className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-emerald-700 mb-1">
            <MapPin className="w-4 h-4 text-emerald-600" />
            <span>Land Appreciation Catalyst</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900">
            Surrounding Revenue Villages: Direct Beneficiary Proximity Radar
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Agricultural revenue parcels within 1 to 6 km of the Tata Fab boundary undergo accelerated Town Planning reconstitution and road widening.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {SURROUNDING_VILLAGES.map((v) => (
            <div key={v.name} className="p-4 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-blue-50/30 transition flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between">
                  <h4 className="text-base font-black text-slate-900">{v.name}</h4>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    {v.distance}
                  </span>
                </div>
                <span className="text-[11px] font-bold text-blue-700 block mt-0.5">{v.tp}</span>
                <span className="text-[10px] text-slate-500 block">{v.role}</span>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">{v.impact}</p>
              </div>

              <Link
                href={`/village/${v.name.toLowerCase()}`}
                className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800 pt-2 border-t border-slate-200"
              >
                <span>Explore {v.name} Surveys</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
