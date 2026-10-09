import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import SiteHeader from '@/components/panels/SiteHeader';
import SiteFooter from '@/components/panels/SiteFooter';
import { getArticleBySlug, getArticleSlugs } from '@/lib/articles';
import { SITE_NAME, PRODUCT_NAME, OG_IMAGE, OG_IMAGE_DIMS, DOMAIN, hreflang, pageDescription, pageTitle } from '@/lib/brand';
import './article.css';

interface ArticlePageProps {
  params: Promise<{ slug: string }>;
}

// Fully static: articles are git-tracked MDX rendered at build time.
// dynamicParams=false closes the on-demand ISR path (unknown slugs 404
// without an origin render), which is the direct ISR-read saver.
export const dynamicParams = false;
export const revalidate = false;

export async function generateStaticParams() {
  return (await getArticleSlugs()).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) return {};

  const url = `${DOMAIN}/blog/${article.slug}`;
  // Article frontmatter titles regularly run past the 60-char SERP window, so
  // they are capped here at the template rather than copy-edited per article.
  const title = pageTitle(article.title);
  const description = pageDescription(article.description);
  return {
    title,
    description,
    keywords: article.keywords,
    alternates: { canonical: url, languages: hreflang(url) },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      images: [
        {
          url: OG_IMAGE,
          width: OG_IMAGE_DIMS.width,
          height: OG_IMAGE_DIMS.height,
          alt: article.title,
        },
      ],
      locale: 'en_IN',
      type: 'article',
      publishedTime: article.date,
      modifiedTime: article.updated ?? article.date,
      authors: [`${SITE_NAME} GIS Desk`],
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.description,
      images: [OG_IMAGE],
    },
  };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article || article.draft) notFound();

  const url = `${DOMAIN}/blog/${article.slug}`;
  const fmt = (d: string) =>
    new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Article',
        '@id': `${url}#article`,
        headline: article.title,
        description: article.description,
        url,
        datePublished: article.date,
        dateModified: article.updated ?? article.date,
        inLanguage: 'en',
        keywords: (article.keywords ?? []).join(', '),
        author: {
          '@type': 'Organization',
          name: `${SITE_NAME} GIS Desk`,
          url: DOMAIN,
        },
        publisher: { '@id': `${DOMAIN}/#organization` },
        isPartOf: { '@id': `${DOMAIN}/#website` },
        mainEntityOfPage: { '@type': 'WebPage', '@id': url },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: SITE_NAME, item: DOMAIN },
          { '@type': 'ListItem', position: 2, name: 'Blog', item: `${DOMAIN}/blog` },
          { '@type': 'ListItem', position: 3, name: article.title, item: url },
        ],
      },
    ],
  };

  return (
    <>
      <SiteHeader activePage="guide" />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="min-h-screen bg-[#ece9e2] pt-14">
        <article className="max-w-3xl mx-auto px-6 py-16">
          <nav aria-label="Breadcrumb" className="text-sm text-slate-500 mb-8">
            <Link href="/" className="hover:text-blue-600">{SITE_NAME}</Link>
            {' / '}
            <Link href="/blog" className="hover:text-blue-600">Blog</Link>
            {' / '}
            <span className="text-slate-700">{article.title}</span>
          </nav>

          <header className="mb-10">
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-3">
              <span className="font-semibold text-blue-700 uppercase tracking-wider">
                {article.category}
              </span>
              <span>·</span>
              <time dateTime={article.date}>{fmt(article.date)}</time>
            </div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 mb-4">
              {article.title}
            </h1>
            <p className="text-lg text-slate-600 leading-relaxed">{article.description}</p>
            <p className="text-sm text-slate-400 mt-4">
              By the {SITE_NAME} GIS Desk · {PRODUCT_NAME} editorial team
            </p>
          </header>

          <div
            className="article-prose"
            dangerouslySetInnerHTML={{ __html: article.html }}
          />

          <footer className="mt-16 pt-8 border-t border-slate-200">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Explore the interactive map</h2>
            <p className="text-slate-600 text-sm mb-4">
              Every parcel referenced in this article is searchable on the interactive{' '}
              {SITE_NAME} atlas.
            </p>
            <div className="flex flex-wrap gap-3 text-sm">
              <Link href="/" className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition">
                Open the map
              </Link>
              <Link href="/guide" className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-semibold hover:bg-white transition">
                TP schemes guide
              </Link>
              <Link href="/dholera-plot-price" className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-semibold hover:bg-white transition">
                Plot prices 2026
              </Link>
              <Link href="/blog" className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-semibold hover:bg-white transition">
                More articles
              </Link>
            </div>
          </footer>
        </article>
      </main>
      <SiteFooter />
    </>
  );
}
