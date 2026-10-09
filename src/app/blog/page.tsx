import type { Metadata } from 'next';
import Link from 'next/link';
import SiteHeader from '@/components/panels/SiteHeader';
import SiteFooter from '@/components/panels/SiteFooter';
import { getPublishedArticles } from '@/lib/articles';
import { SITE_NAME, OG_IMAGE, OG_IMAGE_DIMS, DOMAIN, pageDescription } from '@/lib/brand';

export const metadata: Metadata = {
  title: 'Dholera Smart City News, Updates & Guides 2026 | DholeraMap',
  description: pageDescription(
    'Authoritative Dholera SIR articles: town planning schemes TP 1–6, plot prices, 7/12 land records, DGDCR zoning, expressway & airport updates, and investment analysis.',
    'Authoritative Dholera SIR articles on TP 1–6 town planning, plot prices, land records and investment analysis.',
  ),
  keywords: [
    'Dholera SIR blog',
    'Dholera latest news',
    'Dholera plot price guide',
    'Dholera town planning schemes explained',
    'Dholera investment analysis',
    'Dholera smart city update',
  ],
  alternates: {
    canonical: `${DOMAIN}/blog`,
  },
  openGraph: {
    title: 'Dholera SIR Land Intelligence Blog | DholeraMap',
    description:
      'Authoritative Dholera SIR articles: town planning, plot prices, land records, and investment analysis.',
    url: `${DOMAIN}/blog`,
    siteName: SITE_NAME,
    images: [
      {
        url: OG_IMAGE,
        width: OG_IMAGE_DIMS.width,
        height: OG_IMAGE_DIMS.height,
        alt: 'DholeraMap — Dholera SIR Land Intelligence Blog',
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Dholera SIR Land Intelligence Blog | DholeraMap',
    description: 'Authoritative Dholera SIR articles on town planning, prices, and investment.',
    images: [OG_IMAGE],
  },
};

export default async function BlogIndexPage() {
  const articles = await getPublishedArticles();

  const collectionJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Dholera SIR Land Intelligence Blog',
    url: `${DOMAIN}/blog`,
    description:
      'Authoritative Dholera SIR articles on town planning schemes, plot prices, land records and investment.',
    isPartOf: { '@id': `${DOMAIN}/#website` },
    hasPart: articles.map((a) => ({
      '@type': 'Article',
      headline: a.title,
      url: `${DOMAIN}/blog/${a.slug}`,
      datePublished: a.date,
    })),
  };

  return (
    <>
      <SiteHeader activePage="guide" />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }}
      />
      <main className="min-h-screen bg-[#ece9e2] pt-14">
        <div className="max-w-3xl mx-auto px-6 py-16">
          <header className="mb-12">
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 mb-3">
              Dholera SIR Land Intelligence
            </h1>
            <p className="text-slate-600 leading-relaxed">
              Statutory-grade analysis of Dholera Special Investment Region — town planning
              schemes, interactive survey records, plot pricing, and infrastructure timelines, written
              from the same GIS database that powers the {SITE_NAME} atlas.
            </p>
          </header>

          {articles.length === 0 ? (
            <p className="text-slate-500">Articles coming soon.</p>
          ) : (
            <ul className="space-y-8">
              {articles.map((a) => (
                <li key={a.slug} className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md transition">
                  <Link href={`/blog/${a.slug}`} className="block group">
                    <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
                      <span className="font-semibold text-blue-700 uppercase tracking-wider">
                        {a.category}
                      </span>
                      <span>·</span>
                      <time dateTime={a.date}>
                        {new Date(a.date).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </time>
                      {a.readingTime ? <><span>·</span><span>{a.readingTime}</span></> : null}
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition mb-2">
                      {a.title}
                    </h2>
                    <p className="text-slate-600 text-sm leading-relaxed">{a.description}</p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
