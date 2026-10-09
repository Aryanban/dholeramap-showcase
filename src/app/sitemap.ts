import type { MetadataRoute } from "next";
import { VILLAGES } from "@/lib/villages";
import { getPublishedArticles } from "@/lib/articles";
import { SEEDED_BROKERS } from "@/lib/brokers";
import { allSurveyPairs, surveysForVillage } from "@/lib/gazetted-surveys";
import { indexableSurveyPairs } from "@/lib/survey-lookup";

const BASE_URL = "https://dholeramap.com";

// A stable "last regenerated" reference for the atlas. Pages are deterministic
// per-parcel, so a fixed, honest lastmod is far better for crawl prioritisation
// than stamping every URL with the build time, which Google learns to ignore.
const ATLAS_UPDATED = new Date("2026-09-21T00:00:00.000Z");
// Fresh timestamp for high-intent hub pages and village directories updated in October 2026.
const HUB_UPDATED = new Date("2026-10-02T00:00:00.000Z");

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const articles = await getPublishedArticles();

  const entries: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: HUB_UPDATED,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/map`,
      lastModified: ATLAS_UPDATED,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      // The dedicated head-term hub. It owns "Dholera SIR" / "dholera sir full
      // form" / "where is Dholera SIR" so the homepage, the blog post and
      // /guide stop competing for the same definitional intent.
      url: `${BASE_URL}/dholera-sir`,
      lastModified: HUB_UPDATED,
      changeFrequency: "weekly",
      priority: 0.98,
    },
    {
      // Open research whitepaper & dataset hub for journalists, researchers, and due-diligence teams.
      url: `${BASE_URL}/dholera-sir-land-records-master-plan-whitepaper`,
      lastModified: HUB_UPDATED,
      changeFrequency: "weekly",
      priority: 0.98,
    },
    {
      url: `${BASE_URL}/dholera-tp-map`,
      lastModified: HUB_UPDATED,
      changeFrequency: "weekly",
      priority: 0.98,
    },
    {
      url: `${BASE_URL}/dholera-tp-1-map`,
      lastModified: HUB_UPDATED,
      changeFrequency: "weekly",
      priority: 0.95,
    },
    {
      url: `${BASE_URL}/dholera-tp-2-map`,
      lastModified: HUB_UPDATED,
      changeFrequency: "weekly",
      priority: 0.95,
    },
    {
      url: `${BASE_URL}/dholera-tp-3-map`,
      lastModified: HUB_UPDATED,
      changeFrequency: "weekly",
      priority: 0.95,
    },
    {
      url: `${BASE_URL}/dholera-tp-4-map`,
      lastModified: HUB_UPDATED,
      changeFrequency: "weekly",
      priority: 0.95,
    },
    {
      url: `${BASE_URL}/dholera-tp-5-map`,
      lastModified: HUB_UPDATED,
      changeFrequency: "weekly",
      priority: 0.95,
    },
    {
      url: `${BASE_URL}/dholera-tp-6-map`,
      lastModified: HUB_UPDATED,
      changeFrequency: "weekly",
      priority: 0.95,
    },
    {
      url: `${BASE_URL}/dholera-plot-price`,
      lastModified: HUB_UPDATED,
      changeFrequency: "weekly",
      priority: 0.98,
    },
    {
      url: `${BASE_URL}/tata-semiconductor-dholera-map`,
      lastModified: HUB_UPDATED,
      changeFrequency: "weekly",
      priority: 0.95,
    },
    {
      url: `${BASE_URL}/dholera-expressway-airport-map`,
      lastModified: HUB_UPDATED,
      changeFrequency: "weekly",
      priority: 0.95,
    },
    {
      url: `${BASE_URL}/dholera-7-12-anyror-land-records`,
      lastModified: HUB_UPDATED,
      changeFrequency: "weekly",
      priority: 0.95,
    },
    {
      url: `${BASE_URL}/guide`,
      lastModified: HUB_UPDATED,
      changeFrequency: "weekly",
      priority: 0.95,
    },
    {
      // The blog index is the hub of the content cluster and the page Google's
      // "Top pages" shows, but it was absent from the sitemap, so it was only
      // reachable via in-page links.
      url: `${BASE_URL}/blog`,
      lastModified: ATLAS_UPDATED,
      changeFrequency: "daily",
      priority: 0.95,
    },
    {
      url: `${BASE_URL}/brokers`,
      lastModified: ATLAS_UPDATED,
      changeFrequency: "weekly",
      priority: 0.95,
    },
    {
      // The inventory hub for "plots for sale in Dholera" queries. Without it
      // the broker listings were only reachable by filtering client-side.
      url: `${BASE_URL}/properties`,
      lastModified: ATLAS_UPDATED,
      changeFrequency: "daily",
      priority: 0.95,
    },
    {
      url: `${BASE_URL}/pricing`,
      lastModified: ATLAS_UPDATED,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/contact`,
      lastModified: ATLAS_UPDATED,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/about`,
      lastModified: ATLAS_UPDATED,
      changeFrequency: "monthly",
      priority: 0.85,
    },
    {
      url: `${BASE_URL}/terms`,
      lastModified: ATLAS_UPDATED,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/privacy`,
      lastModified: ATLAS_UPDATED,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/refund`,
      lastModified: ATLAS_UPDATED,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/shipping`,
      lastModified: ATLAS_UPDATED,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/disclaimer`,
      lastModified: ATLAS_UPDATED,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      // The embeddable map widget is an indexable standalone page (it carries
      // its own metadata and is linked from the embed code snippet), so it
      // belongs in the sitemap rather than being left to crawl discovery.
      url: `${BASE_URL}/embed`,
      lastModified: ATLAS_UPDATED,
      changeFrequency: "monthly",
      priority: 0.6,
    },
  ];

  // Village pages — every declared village keeps a page; those without
  // published parcels still serve an honest directory, so they stay indexed.
  for (const v of VILLAGES) {
    entries.push({
      url: `${BASE_URL}/village/${v.slug}`,
      lastModified: HUB_UPDATED,
      changeFrequency: "weekly",
      priority: 0.85,
    });
  }

  // Survey parcel pages — ONLY real (village, surveyNo) pairs from the
  // generated registry that ALSO pass the §8 quality gate.
  //
  // The gate matters for the sitemap specifically: a noindex URL listed here is
  // the exact contradiction GSC reports as "Excluded by 'noindex' tag /
  // Failed" (which is what /properties was doing). Weak-but-real pages stay
  // crawlable and internally linked, they just leave the sitemap.
  for (const p of indexableSurveyPairs()) {
    entries.push({
      url: `${BASE_URL}/survey/${p.village}/${p.surveyNo}`,
      lastModified: ATLAS_UPDATED,
      changeFrequency: "monthly",
      priority: 0.7,
    });
  }

  // Individual broker profiles. These are the money pages for
  // "Dholera property dealer" / "real estate agent Dholera" queries, and they
  // were previously absent from the sitemap entirely — only the /brokers hub
  // was listed, so the profiles had to be discovered purely by crawling.
  for (const b of SEEDED_BROKERS) {
    entries.push({
      url: `${BASE_URL}/brokers/${b.id}`,
      lastModified: ATLAS_UPDATED,
      changeFrequency: "weekly",
      priority: 0.8,
    });
  }

  for (const a of articles) {
    entries.push({
      url: `${BASE_URL}/blog/${a.slug}`,
      lastModified: new Date(a.updated ?? a.date),
      changeFrequency: "monthly",
      priority: 0.8,
    });
  }

  return entries;
}

// Kept so tooling that diffs the village universe against the registry can see
// which villages currently have published parcels without importing app code.
export const _villagesWithSurveys = () =>
  VILLAGES.map((v) => ({ slug: v.slug, count: surveysForVillage(v.slug).length }));

// ---------------------------------------------------------------------------
// IMAGE SITEMAP REGISTRY
// ---------------------------------------------------------------------------
// The Search Appearance tab in GSC was completely empty because the sitemap
// emitted <loc> only. Google Image Search is a real discovery channel for a
// planning/map site: "dholera tp map", "dholera town planning scheme map" and
// "dholera plot layout map" are overwhelmingly image-search intents.
//
// DELIBERATELY EXCLUDED, and this matters as much as what is included:
//
//   1. public/tiles/**  (3,173 .webp raster tiles). These are map-tile pyramids
//      sliced for Leaflet, not standalone illustrations. Each tile is an
//      arbitrary crop with no meaning of its own, several are only a few KB,
//      and submitting them would bury the ~20 images that actually represent
//      content. This is the single biggest reason image sitemaps fail.
//   2. The public/dholera_intro/** diagrams. They are genuinely excellent
//      planning imagery, but grep confirms they are referenced ONLY from
//      src/lib/dossier/** (PDF generation) and from no React page. Listing an
//      image on a page that does not render it is a mismatch signal, so they
//      are intentionally not claimed until they are actually placed on-page.
//
// Every entry below IS rendered in server HTML on the page it is filed under,
// carries intrinsic width/height (required for valid image sitemap entries),
// and has a real human-readable title and caption for the image:title /
// image:caption nodes.

export interface ImageSitemapEntry {
  /** Page path that renders this image. */
  page: string;
  /** Image path. */
  loc: string;
  title: string;
  caption: string;
  width: number;
  height: number;
}

/** The sanctioned Town Planning scheme blueprints, from the rendered data. */
const TP_SCHEME_IMAGES: ImageSitemapEntry[] = [
  {
    page: '/dholera-tp-map',
    loc: '/maps/schemes/dholera_tp1.jpg',
    title: 'Dholera TP 1 Town Planning Scheme Map — Residential & Knowledge',
    caption:
      'Sanctioned Town Planning Scheme 1 blueprint for Dholera SIR showing Final Plot boundaries, the 55m arterial ring road and 30m sector links across Ambli, Kadipur, Bhadiyad and Gogla.',
    width: 7152,
    height: 5052,
  },
  {
    page: '/dholera-tp-map',
    loc: '/maps/schemes/dholera_tp2.jpg',
    title: 'Dholera TP 2 Town Planning Scheme Map — Activation Area & Mega-Fab Hub',
    caption:
      'Town Planning Scheme 2 blueprint for Dholera SIR: the 250m Central Spine Corridor, the Tata Semiconductor fab site and the ABCD Administrative Complex across Kadipur, Bhimnath, Ambli and Gorasu.',
    width: 7152,
    height: 5052,
  },
  {
    page: '/dholera-tp-map',
    loc: '/maps/schemes/dholera_tp3.jpg',
    title: 'Dholera TP 3 Town Planning Scheme Map — City Centre & Commercial Core',
    caption:
      'Town Planning Scheme 3 blueprint for Dholera SIR covering the heavy industrial and general industrial zones with plotted road hierarchy and abutting road widths.',
    width: 7152,
    height: 5052,
  },
  {
    page: '/dholera-tp-map',
    loc: '/maps/schemes/dholera_tp4.jpg',
    title: 'Dholera TP 4 Town Planning Scheme Map — Solar Park & Knowledge Corridor',
    caption:
      'Town Planning Scheme 4 blueprint for Dholera SIR showing the solar park and knowledge corridor layout with preliminary plot boundaries.',
    width: 7152,
    height: 5052,
  },
  {
    page: '/dholera-tp-map',
    loc: '/maps/schemes/dholera_tp5.jpg',
    title: 'Dholera TP 5 Town Planning Scheme Map — Mega Industrial & Aerospace',
    caption:
      'Town Planning Scheme 5 blueprint for Dholera SIR covering mega industrial parcels and the defense aerospace zone with sanctioned internal road widths.',
    width: 7152,
    height: 5052,
  },
  {
    page: '/dholera-tp-map',
    loc: '/maps/schemes/dholera_tp6.jpg',
    title: 'Dholera TP 6 Town Planning Scheme Map — Logistics CFS & Cargo Airport City',
    caption:
      'Town Planning Scheme 6 blueprint for Dholera SIR mapping the logistics CFS and cargo airport city blocks, a key freight and warehousing zone.',
    width: 6740,
    height: 4768,
  },
  {
    page: '/dholera-tp-map',
    loc: '/maps/schemes/macro_villages.jpg',
    title: 'Dholera SIR Map — All 22 Revenue Villages Overview',
    caption:
      'Regional overview map of the Dholera Special Investment Region showing the location of all 22 revenue villages relative to the six town planning schemes.',
    width: 5960,
    height: 4210,
  },
  {
    // The regional overview is also the hero image on /dholera-sir, which owns
    // the "dholera map" head term. Both pages genuinely render it.
    page: '/dholera-sir',
    loc: '/maps/schemes/macro_villages.jpg',
    title: 'Dholera SIR Map — Special Investment Region Overview',
    caption:
      'Regional map of the Dholera Special Investment Region, a 920 sq km statutory area under the Gujarat SIR Act 2009, showing all 22 revenue villages against the six town planning schemes.',
    width: 5960,
    height: 4210,
  },
  {
    page: '/dholera-tp-map',
    loc: '/maps/schemes/macro_split.jpg',
    title: 'Dholera TP Sub-Scheme Split Map — TP 1A to TP 6B with Hectare Areas',
    caption:
      'Sub-scheme boundary map of Dholera SIR showing all 27 sanctioned town planning sub-schemes with their hectare areas, from TP 1A-1 (1,198.46 HC) and TP 3C-2 (3,976.67 HC) through TP 5C-1 (4,375.41 HC) and TP 6B (6,091.78 HC).',
    width: 2142,
    height: 2772,
  },
  {
    page: '/dholera-tp-map',
    loc: '/maps/schemes/macro_land_use.jpg',
    title: 'Dholera SIR Master Land Use & Regional Framework Map',
    caption:
      'Master land use and regional framework map for Dholera SIR, the statutory planning context for the TP 1 to TP 6 town planning schemes.',
    width: 2526,
    height: 3573,
  },
];

/** Showcase imagery rendered on the pillar pages. */
const SHOWCASE_IMAGES: ImageSitemapEntry[] = [
  {
    page: '/tata-semiconductor-dholera-map',
    loc: '/assets/showcase/tata_semiconductor_fab.jpg',
    title: 'Tata Semiconductor Fab Plant Location Map — Dholera SIR TP 2',
    caption:
      'Location of the ₹91,000 crore Tata Semiconductor fabrication plant inside the Dholera SIR TP 2 Activation Area, with the site boundary, nearby villages and surrounding plots.',
    width: 1376,
    height: 768,
  },
  {
    page: '/dholera-expressway-airport-map',
    loc: '/assets/showcase/dholera_airport_expressway.jpg',
    title: 'Dholera Expressway NE 8 and Airport Map',
    caption:
      'Ahmedabad to Dholera Expressway (NE 8) route map showing interchanges, entry exits and the Greenfield International Airport terminal location.',
    width: 1376,
    height: 768,
  },
  {
    page: '/dholera-7-12-anyror-land-records',
    loc: '/assets/showcase/dholera_land_records.jpg',
    title: 'Dholera 7/12 Land Record and AnyRoR Survey Map',
    caption:
      'How a Dholera 7/12 extract and AnyRoR survey number is matched to a plotted parcel on the interactive cadastral map.',
    width: 1376,
    height: 768,
  },
  {
    page: '/dholera-plot-price',
    loc: '/assets/showcase/dholera_investment_board.jpg',
    title: 'Dholera Plot Price Rate Card by Village and TP Scheme',
    caption:
      'Dholera land rate card comparing indicative plot prices across villages, town planning schemes and road widths for 2026.',
    width: 1376,
    height: 768,
  },
];

/**
 * Full image sitemap set, ordered by the page they belong to so the output stays
 * stable and diffable between builds. Well under Google's 1,000-image ceiling,
 * so no sitemap index sharding is required.
 */
export const IMAGE_SITEMAP: ImageSitemapEntry[] = [...TP_SCHEME_IMAGES, ...SHOWCASE_IMAGES];

/** Fully-qualified absolute form consumed by the image-sitemap route. */
export const imageSitemapUrls = () =>
  IMAGE_SITEMAP.map((i) => ({
    ...i,
    page: `${BASE_URL}${i.page}`,
    loc: `${BASE_URL}${i.loc}`,
  }));
