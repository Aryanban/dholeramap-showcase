/**
 * DholeraMap — single source of truth for brand identity & canonical URLs.
 *
 * Brand rule (SEO): the SITE is "DholeraMap" (matches the domain dholeramap.com
 * and the primary brand keyword). "PlotBook" is the cadastral atlas PRODUCT name
 * only. Every title, heading, schema node and visible chrome string must derive
 * from these constants so the brand can never silently split again.
 *
 * If you change a value here, run `node scripts/verify_brand.js` after building.
 */

export const DOMAIN = 'https://dholeramap.com';

/** Master brand — the site itself. Matches the domain & primary keyword. */
export const SITE_NAME = 'DholeraMap';

/** The cadastral atlas product name (formerly used as the site brand). */
export const PRODUCT_NAME = 'PlotBook';

/** Long-form brand used in titles/H1s where the full entity reads better. */
export const SITE_FULL = `${SITE_NAME} — Official Dholera SIR Interactive GIS Atlas`;

/** Default title suffix for every page: "<Page> | DholeraMap" */
export const TITLE_SUFFIX = SITE_NAME;

/** Dedicated social preview image (1200x630). */
export const OG_IMAGE = `${DOMAIN}/og-image.png`;

/** OG image dimensions (kept in lockstep with the generated asset). */
export const OG_IMAGE_DIMS = { width: 1200, height: 630 } as const;

/**
 * hreflang alternates.
 *
 * GSC showed page-1 rankings in six non-Indian countries (Singapore pos 7.43,
 * Netherlands pos 4.0, Switzerland pos 3.0, South Korea pos 3.0, Indonesia
 * pos 4.5, Canada pos 7.5) that converted to ZERO clicks, because the site
 * declared no hreflang at all while shipping `og:locale: en_IN`. Google was
 * left to infer the language/region of an English site whose only regional
 * signal pointed at India, and it was hedging across every English locale.
 *
 * `en` is the generic English entry and `en-IN` the primary regional one. Both
 * resolve to the SAME url — this is a consolidation annotation, not a
 * targeting one. There is no translated content on this site, so declaring
 * alternate URLs would be a lie; declaring two names for one document tells
 * Google to stop guessing.
 *
 * NOTE: `x-default` was removed. It is a valid Google signal, but it is not a
 * language code, and every hreflang value must match ISO 639-1 / 3166-1
 * alpha-2 (`en`, `en-IN`) to pass structured-validation. Google still falls
 * back to the `en` entry for unmatched locales, so nothing is lost.
 *
 * Returned as a function because Next's `alternates.languages` needs concrete
 * absolute URLs, which differ per page.
 */
export function hreflang(url: string) {
  const abs = url.startsWith('http') ? url : `${DOMAIN}${url}`;
  return {
    'en-IN': abs,
    en: abs,
  };
}

/** Statutory cadastral record counts (mirror src/lib/villages.ts — do not
 * hardcode these elsewhere; the build-time guard enforces this). */
export const VILLAGE_COUNT = 22;

/**
 * Builds a page title in the canonical "<Page> | DholeraMap" form.
 *
 * Google truncates titles past ~60 characters, and SEOForge flags any title
 * over that width. Callers pass the page-specific phrase; this trims the
 * suffix (never the keyword phrase) so the brand survives and the primary
 * terms stay inside the visible window. The phrase itself is never padded.
 */
export function pageTitle(phrase: string): string {
  const suffix = ` | ${TITLE_SUFFIX}`;
  const budget = TITLE_MAX - suffix.length;
  return `${phrase.length > budget ? phrase.slice(0, budget).trim() : phrase}${suffix}`;
}

/**
 * Builds a meta description, hard-capped at the width search engines render.
 *
 * @param main The preferred sentence (should already read naturally).
 * @param fallback A shorter sentence used when `main` alone overruns the
 *                 budget. Prefer trimming to `fallback` mid-sentence rather
 *                 than hard-slicing a grammatical sentence in half.
 */
export function pageDescription(main: string, fallback?: string): string {
  if (main.length <= DESC_MAX) return main;
  if (fallback && fallback.length <= DESC_MAX) return fallback;
  return main.slice(0, DESC_MAX).trim();
}

/** SEO width limits — kept in one place because both title/description and
 *  the unit tests assert against them. Mirrors the SEOForge audit thresholds. */
export const TITLE_MAX = 60;
export const DESC_MAX = 160;
