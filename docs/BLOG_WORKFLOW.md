# DholeraMap Blog — Editorial Workflow

Everything below is the complete operating procedure for the `/blog` content hub.
No CMS, no database — articles are plain `.mdx` files in `src/content/`, and the
publishing pipeline is fully automated.

---

## 1. Add an article (one command)

```bash
npm run new:article -- "Your Article Title"
```

Optional flags:

```bash
npm run new:article -- "Tata Fab Update" --category "Infrastructure"
npm run new:article -- "Draft Idea" --draft          # marks it draft:true
```

This creates `src/content/your-article-title.mdx` with the correct frontmatter,
today's date, a kebab-case slug, and a pre-wired internal-link block.

## 2. Fill in the frontmatter

```yaml
---
title: 'Dholera Plot Price August 2026 Update'      # appears in the <title> + H1
description: 'August 2026 Dholera SIR plot rates...'  # MUST be >= 40 chars
date: '2026-08-01'                                   # ISO date, sort order
category: 'Plot Prices'                              # shown as the article kicker
readingTime: '6 min read'                            # optional, shown on cards
keywords:                                            # >= 2 required
  - Dholera plot price
  - Dholera land rate
updated: '2026-08-15'                                # optional; feeds dateModified
draft: true                                          # optional; exclude from sitemap
---
```

The build-time guard (`npm run test:brand`) **fails the deploy** if any article is
missing `title`, `description` (≥40 chars), `date`, `category`, or 2+ keywords —
so an incomplete post can never ship.

## 3. Write the body in Markdown

Standard Markdown: headings, tables, lists, links, `code`. Styled automatically by
the `.article-prose` rules in `src/app/globals.css`. No JSX needed.

## 4. Publish

```bash
git add src/content/your-article-title.mdx
git commit -m "blog: your article title"
git push
```

That's the entire publish step. On push:
- CI runs lint + build + the brand/SEO guard
- Vercel deploys
- the article appears at `dholeramap.com/blog/your-article-title`
- it is added to `/sitemap.xml` automatically
- it appears on the `/blog` listing, newest-first

No manual sitemap edits, no route registration, no meta-tag wiring.

---

## Internal linking rule (topical authority)

Every article must link to **3+ tool pages** in its body or footer. This is what
feeds equity from the informational keywords into the money pages. The built-in
footer already links to the map, the guide, the price card, and back to `/blog`;
add at least one in-text contextual link.

| Page | URL |
| --- | --- |
| Cadastral atlas | `https://dholeramap.com` |
| TP schemes guide | `https://dholeramap.com/guide` |
| 2026 plot price card | `https://dholeramap.com/dholera-plot-price` |
| TP 1–6 map | `https://dholeramap.com/dholera-tp-map` |
| 7/12 land records | `https://dholeramap.com/dholera-7-12-anyror-land-records` |
| Tata fab map | `https://dholeramap.com/tata-semiconductor-dholera-map` |
| Expressway & airport | `https://dholeramap.com/dholera-expressway-airport-map` |

## Content calendar suggestion

A sustainable cadence is **1–2 posts per month**, prioritised by search intent:

1. **Update articles** (refresh an existing page when data moves) — highest ROI,
   since they refresh `dateModified` on a URL that already has equity.
2. **Price/quarterly updates** — "Dholera Plot Price <Month> <Year>" is a
   recurring commercial query.
3. **Infrastructure milestones** — expressway/airport/fab status changes.
4. **Evergreen explainers** — TP schemes, DGDCR, 7/12 verification.

## Automation already in place

| Task | Automated by |
| --- | --- |
| Sitemap entries | `src/app/sitemap.ts` reads `getAllArticles()` |
| Meta tags + OG | `generateMetadata` in `src/app/blog/[slug]/page.tsx` |
| Article JSON-LD | same file (Article + BreadcrumbList) |
| Listing page | `src/app/blog/page.tsx` |
| Frontmatter validation | `scripts/verify_brand.js` (fails CI) |
| Social preview image | `public/og-image.png` (shared, 1200x630) |

## What only you can supply

Statutory data accuracy. The repo cannot know today's per-sq-yard rate, the Tata
fab construction status, or expressway opening dates. For those, send the figure
or status and I will draft the article around it.
