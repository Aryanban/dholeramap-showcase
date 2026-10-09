/**
 * src/lib/brokers.ts
 *
 * Broker Directory, Dynamic Spend-Based Ranking Engine, and Properties Portfolio
 *
 * Ranking is computed dynamically:
 * Total Monthly Investment = Monthly Subscription Plan + Credits Purchased + Active Ad Campaign Spend
 * The highest spender ranks at #1 as "Top Ranked Sponsor".
 */

export interface BrokerProperty {
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
  status: 'available' | 'under_token' | 'sold';
  listedDate: string;
  featured?: boolean;
  featuredStatus?: 'pending' | 'approved' | 'rejected';
}

export interface BrokerProfile {
  id: string;
  name: string;
  agency: string;
  photoUrl: string;
  logoInitial: string;
  logoColor: string;
  avatarBg: string;
  reraNumber: string;
  experienceYears: number;
  tpSchemes: string[];
  propertyTypes: string[];
  headOffice: string;
  phone: string;
  whatsapp: string;
  email: string;
  description: string;
  dealsClosed: string;
  subscriptionSpend: number; // Monthly plan (e.g. ₹1,999 or ₹5,999)
  creditsSpend: number;      // Monthly credits/carrots purchased (e.g. ₹2,500)
  adSpend: number;           // Profile boost & advertisement spend (e.g. ₹10,000)
  totalMonthlySpend: number; // Computed: subscription + credits + adSpend
  sponsorTier: 'platinum' | 'gold' | 'silver' | 'verified';
  verified: boolean;
  properties: BrokerProperty[];
}

export const SEEDED_BROKERS: BrokerProfile[] = [
  {
    id: 'b1',
    name: 'Rajesh V. Patel',
    agency: 'Dholera Apex Land Advisory & Infra',
    photoUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&auto=format&fit=crop&q=80',
    logoInitial: 'DA',
    logoColor: 'from-blue-600 to-indigo-600',
    avatarBg: 'bg-blue-100 text-blue-800',
    reraNumber: 'PR/GJ/AHMEDABAD/AA00941/2024',
    experienceYears: 12,
    tpSchemes: ['TP 1', 'TP 2A', 'TP 2B'],
    propertyTypes: ['Residential Plots (R-1)', 'Commercial Hubs', 'High-FAR Final Plots'],
    headOffice: 'Unit 402, ABCD Building, Activation Zone, Dholera SIR, Gujarat',
    phone: '+919825012345',
    whatsapp: '919825012345',
    email: 'rajesh@dholeraapex.com',
    description: 'Premier land consultancy specializing in Town Planning Scheme 1 & 2 final plot acquisitions, GTPUD Form 4/5 title cross-referencing, and direct investor land portfolios.',
    dealsClosed: '140+ Property Deeds Closed',
    subscriptionSpend: 5999, // Enterprise Plan
    creditsSpend: 6500,     // 200 dossier export credits
    adSpend: 15000,         // Premium Top-Rank Ad Campaign
    totalMonthlySpend: 27499,
    sponsorTier: 'platinum',
    verified: true,
    properties: [
      {
        id: 'prop-b1-1',
        title: 'Final Plot 324/1 — Prime 18m Corridor Corner',
        village: 'Bhadiyad',
        tpScheme: 'TP 1 (Sub-sector 1A-2)',
        sid: 'tp1-1',
        fp: '324/1',
        survey: '337',
        zone: 'Residential Zone (R-1)',
        roadWidth: '18m Sanctioned Sub-Sector Access Road',
        pricePerSqYd: '₹14,500 / sq.yd',
        totalDemand: '₹48.5 Lakhs',
        highlights: ['Clear Title Deed', 'Form 5 Sanctioned', 'Immediate Possession'],
        hasBrochure: true,
        status: 'available',
        listedDate: 'Sep 2026',
      },
      {
        id: 'prop-b1-2',
        title: 'Final Plot 88 — ABCD Tech Hub Commercial Corner',
        village: 'Kadipur',
        tpScheme: 'TP 1 (Activation Core)',
        sid: 'tp1-1',
        fp: '88',
        survey: '104',
        zone: 'Commercial & Mixed-Use (C-1)',
        roadWidth: '55m Sanctioned Arterial Corridor',
        pricePerSqYd: '₹22,000 / sq.yd',
        totalDemand: '₹1.15 Cr',
        highlights: ['Opposite ABCD Building', 'SCADA Utility Duct Ready', '2.5 Base FAR'],
        hasBrochure: true,
        status: 'available',
        listedDate: 'Sep 2026',
      },
    ],
  },
  {
    id: 'b2',
    name: 'Siddharth Mehta',
    agency: 'Gujarat Industrial Land Syndicate',
    photoUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&auto=format&fit=crop&q=80',
    logoInitial: 'GI',
    logoColor: 'from-slate-700 to-slate-900',
    avatarBg: 'bg-slate-100 text-slate-800',
    reraNumber: 'PR/GJ/BOTAD/AA01284/2023',
    experienceYears: 15,
    tpSchemes: ['TP 2', 'TP 4', 'TP 5'],
    propertyTypes: ['Industrial Mega-Parcels', 'Solar & Tech Logistics', 'Manufacturing Yards'],
    headOffice: 'Iscon Elegance, SG Highway, Ahmedabad & Dholera Express Junction',
    phone: '+919879054321',
    whatsapp: '919879054321',
    email: 'siddharth@gujaratindustrialland.com',
    description: 'Corporate land procurement specialists servicing Tier-1 vendors for the Tata Electronics Semiconductor Fab, Torrent Power corridor, and heavy engineering zones.',
    dealsClosed: '500+ Acres Procured',
    subscriptionSpend: 5999,
    creditsSpend: 4000,
    adSpend: 10000,
    totalMonthlySpend: 19999,
    sponsorTier: 'gold',
    verified: true,
    properties: [
      {
        id: 'prop-b2-1',
        title: 'Final Plot 324 — Expressway Spine Industrial Yard',
        village: 'Hebatpur',
        tpScheme: 'TP 5 (Sub-sector 1)',
        sid: 'tp5-1',
        fp: '324',
        survey: '399',
        zone: 'High-Tech Industrial & Fab Support',
        roadWidth: '250m Expressway Spine Frontage',
        pricePerSqYd: '₹16,500 / sq.yd',
        totalDemand: '₹1.85 Cr',
        highlights: ['Expressway Frontage', 'GIDC Pipeline Adjacent', 'Heavy Power Sanctioned'],
        hasBrochure: true,
        status: 'available',
        listedDate: 'Sep 2026',
      },
    ],
  },
  {
    id: 'b3',
    name: 'Devang K. Shah',
    agency: 'Smart City Land Consultants',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    logoInitial: 'SC',
    logoColor: 'from-blue-700 to-cyan-600',
    avatarBg: 'bg-cyan-100 text-cyan-800',
    reraNumber: 'PR/GJ/AHMEDABAD/AA00512/2024',
    experienceYears: 9,
    tpSchemes: ['TP 1', 'TP 3', 'TP 6'],
    propertyTypes: ['Ambli Core Plots', 'Cargo Airport Hubs', 'Township Land'],
    headOffice: 'Near Ambli Gram Panchayat, Dholera SIR & Prahlad Nagar, Ahmedabad',
    phone: '+919426098765',
    whatsapp: '919426098765',
    email: 'devang@smartcityland.in',
    description: 'Specialists in Ambli, Kadipur, and Bhadiyad revenue survey borders with instant digitized Form 5 scrutiny, clear title guarantees, and boundary pinning.',
    dealsClosed: '98.8% Title Scrutiny Record',
    subscriptionSpend: 1999,
    creditsSpend: 2500,
    adSpend: 7500,
    totalMonthlySpend: 11999,
    sponsorTier: 'silver',
    verified: true,
    properties: [
      {
        id: 'prop-b3-1',
        title: 'Final Plot 45 — Knowledge & Residential R-1',
        village: 'Ambli',
        tpScheme: 'TP 1 / TP 2 Border',
        sid: 'tp1-2',
        fp: '45',
        survey: '699',
        zone: 'High-Density Residential & Educational',
        roadWidth: '30m Sector Collector Corridor',
        pricePerSqYd: '₹12,750 / sq.yd',
        totalDemand: '₹55.0 Lakhs',
        highlights: ['DGDCR 2.0 FAR', 'Freehold Title', 'Immediate Demarcation'],
        hasBrochure: true,
        status: 'available',
        listedDate: 'Sep 2026',
      },
    ],
  },
  {
    id: 'b4',
    name: 'Ananya Sharma',
    agency: 'Dholera Aerotropolis Realty Hub',
    photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
    logoInitial: 'AR',
    logoColor: 'from-sky-600 to-blue-700',
    avatarBg: 'bg-sky-100 text-sky-800',
    reraNumber: 'PR/GJ/AHMEDABAD/AA01419/2025',
    experienceYears: 8,
    tpSchemes: ['TP 6A', 'TP 6B', 'TP 5'],
    propertyTypes: ['Cargo City Logistics', 'Aviation Support', 'Expressway Frontage'],
    headOffice: 'Airport Road, Dholera International Airport Corridor, Navagam, Gujarat',
    phone: '+919909011223',
    whatsapp: '919909011223',
    email: 'ananya@dholeraaerotropolis.com',
    description: 'Dedicated focus on the Dholera International Cargo Airport corridor, Container Freight Stations (CFS), and 250m expressway connectivity nodes.',
    dealsClosed: 'Airport Node Specialists',
    subscriptionSpend: 1999,
    creditsSpend: 1500,
    adSpend: 5000,
    totalMonthlySpend: 8499,
    sponsorTier: 'silver',
    verified: true,
    properties: [],
  },
  {
    id: 'b5',
    name: 'Harshil R. Joshi',
    agency: 'Prime Gujarat Land Capital',
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
    logoInitial: 'PG',
    logoColor: 'from-indigo-600 to-blue-800',
    avatarBg: 'bg-indigo-100 text-indigo-800',
    reraNumber: 'PR/GJ/BHAVNAGAR/AA00778/2023',
    experienceYears: 11,
    tpSchemes: ['TP 1', 'TP 2', 'TP 3', 'TP 4'],
    propertyTypes: ['High-Yield Freehold Land', 'Pre-Allotted Final Plots', 'Commercial Corners'],
    headOffice: 'Bhavnagar-Dholera Highway Node & Satellite Road, Ahmedabad',
    phone: '+919824033445',
    whatsapp: '919824033445',
    email: 'harshil@primegujaratland.com',
    description: 'Full-service legal due diligence, circle rate valuation matching, and bespoke property syndication for domestic and NRI investor groups.',
    dealsClosed: 'Pan-Gujarat Advisory',
    subscriptionSpend: 1999,
    creditsSpend: 1000,
    adSpend: 2500,
    totalMonthlySpend: 5499,
    sponsorTier: 'verified',
    verified: true,
    properties: [],
  },
  {
    id: 'b6',
    name: 'Kiritbhai G. Vaghela',
    agency: 'Bhal Regional Land & Agritech Advisory',
    photoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&auto=format&fit=crop&q=80',
    logoInitial: 'BR',
    logoColor: 'from-teal-600 to-emerald-700',
    avatarBg: 'bg-teal-100 text-teal-800',
    reraNumber: 'PR/GJ/AHMEDABAD/AA01092/2023',
    experienceYears: 18,
    tpSchemes: ['TP 1', 'TP 2', 'TP 3', 'TP 5'],
    propertyTypes: ['Original Revenue Surveys', 'F-Form Scrutiny', 'Agricultural Conversions'],
    headOffice: 'Dholera Main Bazaar Road, Opp. Taluka Seva Sadan, Dholera',
    phone: '+919825488990',
    whatsapp: '919825488990',
    email: 'kiritbhai@bhalregional.com',
    description: 'Native Dholera land authority with multi-decade generational expertise across 22 revenue villages, Khatavahi land title history, and revenue survey boundary verification.',
    dealsClosed: '250+ Village Survey Clearances',
    subscriptionSpend: 0,
    creditsSpend: 500,
    adSpend: 1000,
    totalMonthlySpend: 1500,
    sponsorTier: 'verified',
    verified: true,
    properties: [],
  },
];

const STORAGE_KEY = 'dholera-ranked-brokers-v2';
const USER_BROKER_KEY = 'dholera-user-broker-profile-v1';

/**
 * Returns all brokers sorted dynamically by total monthly platform investment
 * (subscription + credits bought + ad campaign spend).
 * Top spender is #1.
 */
export function getRankedBrokers(): BrokerProfile[] {
  let list = [...SEEDED_BROKERS];

  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          list = parsed;
        }
      }

      // Check if user has an active broker profile
      const userBroker = getUserBrokerProfile();
      if (userBroker && userBroker.name && userBroker.agency) {
        const existingIdx = list.findIndex((b) => b.id === userBroker.id);
        if (existingIdx >= 0) {
          list[existingIdx] = userBroker;
        } else {
          list.push(userBroker);
        }
      }
    } catch (e) {
      console.warn('Failed to load ranked brokers from localStorage:', e);
    }
  }

  // Recalculate total monthly spend and sort descending
  return list
    .map((b) => {
      const total = (b.subscriptionSpend || 0) + (b.creditsSpend || 0) + (b.adSpend || 0);
      let tier: BrokerProfile['sponsorTier'] = 'verified';
      if (total >= 25000) tier = 'platinum';
      else if (total >= 15000) tier = 'gold';
      else if (total >= 7000) tier = 'silver';

      return {
        ...b,
        totalMonthlySpend: total,
        sponsorTier: tier,
      };
    })
    .sort((a, b) => b.totalMonthlySpend - a.totalMonthlySpend);
}

export const DEFAULT_USER_BROKER: BrokerProfile = {
  id: 'user-broker',
  name: 'Apex Advisory & Land Partner',
  agency: 'Dholera Premier Realty Advisory',
  photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
  logoInitial: 'DP',
  logoColor: 'from-blue-600 to-indigo-600',
  avatarBg: 'bg-blue-100 text-blue-800',
  reraNumber: 'PR/GJ/AHMEDABAD/AA01099/2025',
  experienceYears: 7,
  tpSchemes: ['TP 1', 'TP 2A', 'TP 3'],
  propertyTypes: ['Residential Plots (R-1)', 'Commercial Corridors', 'Form 5 Sanctioned'],
  headOffice: 'Ground Floor, Commercial Complex, TP 1, Dholera SIR',
  phone: '+919825012345',
  whatsapp: '919825012345',
  email: 'partner@dholerapremier.com',
  description: 'Specialist advisory providing direct verified investor access to Town Planning 1 & 2 parcels with complete GTPUD Form 4/5 cross-verification.',
  dealsClosed: '30+ Verified Deeds',
  subscriptionSpend: 1999,
  creditsSpend: 2500,
  adSpend: 5000,
  totalMonthlySpend: 9499,
  sponsorTier: 'silver',
  verified: true,
  properties: [
    {
      id: 'prop-ub-1',
      title: 'Final Plot 412 — 18m Corridor Investment Parcel',
      village: 'Bhadiyad',
      tpScheme: 'TP 1',
      sid: 'tp1-1',
      fp: '412',
      survey: '210',
      zone: 'Residential Zone (R-1)',
      roadWidth: '18m Sanctioned TP Road',
      pricePerSqYd: '₹15,000 / sq.yd',
      totalDemand: '₹51.0 Lakhs',
      highlights: ['Clear Title Deed', 'Form 5 Sanctioned', 'Immediate Possession'],
      hasBrochure: true,
      status: 'available',
      listedDate: 'Sep 2026',
    },
  ],
};

/**
 * Get single broker by ID
 */
export function getBrokerById(id: string): BrokerProfile | null {
  const ranked = getRankedBrokers();
  const found = ranked.find((b) => b.id === id);
  if (found) return found;
  if (id === 'user-broker') return DEFAULT_USER_BROKER;
  return null;
}

/**
 * Get or initialize current user's broker profile
 */
export function getUserBrokerProfile(): BrokerProfile {
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem(USER_BROKER_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.warn('Failed to read user broker profile:', e);
    }
  }
  return DEFAULT_USER_BROKER;
}

/**
 * Save / Update user's broker profile
 */
export function saveUserBrokerProfile(profile: Partial<BrokerProfile>): BrokerProfile {
  const existing = getUserBrokerProfile();

  const updated: BrokerProfile = {
    ...existing,
    ...profile,
    totalMonthlySpend:
      (profile.subscriptionSpend ?? existing.subscriptionSpend ?? 0) +
      (profile.creditsSpend ?? existing.creditsSpend ?? 0) +
      (profile.adSpend ?? existing.adSpend ?? 0),
  };

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(USER_BROKER_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to save user broker profile:', e);
    }
  }

  return updated;
}

/**
 * Pull the user's ad spend up to the server-authoritative total that
 * /api/razorpay/verify-ad-boost writes into Clerk. Money state must never be
 * purely local: without this, signing in on a fresh device would rank the
 * seeded default instead of what was actually paid. It never lowers a local
 * total, so an in-flight boost is not clobbered.
 */
export function reconcileUserBrokerAdSpend(
  authoritativeAdSpend: number
): BrokerProfile | null {
  if (typeof window === 'undefined') return null;
  if (!Number.isFinite(authoritativeAdSpend) || authoritativeAdSpend <= 0) {
    return null;
  }
  const existing = getUserBrokerProfile();
  if (authoritativeAdSpend <= (existing.adSpend || 0)) return null;
  return saveUserBrokerProfile({ adSpend: authoritativeAdSpend });
}

/**
 * Boost broker's ad spend to increase rank in directory
 */
export function boostBrokerAdSpend(brokerId: string, additionalAmount: number): BrokerProfile | null {
  const ranked = getRankedBrokers();
  const broker = ranked.find((b) => b.id === brokerId);
  if (!broker) return null;

  broker.adSpend = (broker.adSpend || 0) + additionalAmount;
  broker.totalMonthlySpend = broker.subscriptionSpend + broker.creditsSpend + broker.adSpend;

  if (brokerId === 'user-broker') {
    saveUserBrokerProfile(broker);
  } else if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(ranked));
    } catch (e) {
      console.warn('Failed to persist boosted broker spend:', e);
    }
  }

  return broker;
}

/**
 * Add a listed property to a broker's portfolio
 */
export function addBrokerProperty(brokerId: string, property: Omit<BrokerProperty, 'id' | 'listedDate'>): BrokerProperty {
  const newProp: BrokerProperty = {
    ...property,
    id: `prop-${Date.now()}`,
    listedDate: 'Sep 2026',
  };

  const ranked = getRankedBrokers();
  const broker = ranked.find((b) => b.id === brokerId);
  if (broker) {
    broker.properties = [newProp, ...(broker.properties || [])];
    if (brokerId === 'user-broker') {
      saveUserBrokerProfile(broker);
    } else if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(ranked));
      } catch (e) {
        console.warn('Failed to save broker properties:', e);
      }
    }
  }

  return newProp;
}

/**
 * Retrieve all properties across all brokers with their parent broker profile
 */
export function getAllBrokerProperties(): { broker: BrokerProfile; property: BrokerProperty }[] {
  const ranked = getRankedBrokers();
  const list: { broker: BrokerProfile; property: BrokerProperty }[] = [];
  for (const b of ranked) {
    for (const p of b.properties || []) {
      list.push({ broker: b, property: p });
    }
  }
  return list;
}

/**
 * Update featured approval status for a broker's property (Admin superpower)
 */
export function updatePropertyFeaturedStatus(
  brokerId: string,
  propertyId: string,
  status: 'pending' | 'approved' | 'rejected'
): boolean {
  const ranked = getRankedBrokers();
  const broker = ranked.find((b) => b.id === brokerId);
  if (!broker || !broker.properties) return false;

  const prop = broker.properties.find((p) => p.id === propertyId);
  if (!prop) return false;

  prop.featuredStatus = status;
  prop.featured = status === 'approved';

  if (brokerId === 'user-broker') {
    saveUserBrokerProfile(broker);
  } else if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(ranked));
    } catch (e) {
      console.warn('Failed to update property featured status:', e);
    }
  }
  return true;
}

/**
 * Toggle featured state between approved and rejected/unfeatured
 */
export function togglePropertyFeatured(brokerId: string, propertyId: string): boolean {
  const ranked = getRankedBrokers();
  const broker = ranked.find((b) => b.id === brokerId);
  if (!broker || !broker.properties) return false;

  const prop = broker.properties.find((p) => p.id === propertyId);
  if (!prop) return false;

  const nextApproved = prop.featuredStatus !== 'approved';
  prop.featuredStatus = nextApproved ? 'approved' : 'rejected';
  prop.featured = nextApproved;

  if (brokerId === 'user-broker') {
    saveUserBrokerProfile(broker);
  } else if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(ranked));
    } catch (e) {
      console.warn('Failed to toggle property featured:', e);
    }
  }
  return true;
}

/**
 * Delete a listed property from a broker's portfolio
 */
export function deleteBrokerProperty(brokerId: string, propertyId: string): void {
  const ranked = getRankedBrokers();
  const broker = ranked.find((b) => b.id === brokerId);
  if (broker) {
    broker.properties = (broker.properties || []).filter((p) => p.id !== propertyId);
    if (brokerId === 'user-broker') {
      saveUserBrokerProfile(broker);
    } else if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(ranked));
      } catch (e) {
        console.warn('Failed to delete broker property:', e);
      }
    }
  }
}

