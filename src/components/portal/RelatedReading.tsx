import Link from 'next/link';
import { BookOpen, ArrowRight } from 'lucide-react';
import { getPublishedArticles } from '@/lib/articles';
import { SITE_NAME } from '@/lib/brand';

/**
 * RelatedReading — contextual links from a pillar page down into the blog.
 *
 * Why this exists: the pillar pages (/guide, /dholera-tp-map) are the most
 * authoritative documents on the site, but they shipped with ZERO outbound links
 * to the article cluster. That left the articles structurally orphaned from the
 * pages that actually carry authority — including two that sit on page 1 in GSC
 * with almost no clicks (/blog/tata-semiconductor-dholera-fab-status at pos
 * 4.88, /blog/dholera-sir-full-form at pos 27.8). Ranking authority flows
 * through internal links; the pillars were withholding all of theirs.
 *
 * Articles are selected by `categories` (the frontmatter category) rather than
 * by hand-picked slugs, so a new article in a category automatically appears in
 * the relevant pillar. `excludeSlug` prevents a pillar linking to itself when
 * the pillar is a blog post.
 */
export default async function RelatedReading({
  categories,
  excludeSlug,
  title = 'Deeper reading',
  intro,
}: {
  categories: string[];
  excludeSlug?: string;
  title?: string;
  intro?: string;
}) {
  const wanted = new Set(categories.map((c) => c.toLowerCase()));
  const articles = (await getPublishedArticles())
    .filter((a) => a.slug !== excludeSlug)
    .filter((a) => wanted.has(a.category.toLowerCase()))
    .slice(0, 4);

  if (articles.length === 0) return null;

  return (
    <section
      className="space-y-5"
      aria-labelledby="related-reading-heading"
    >
      <div className="space-y-2">
        <h2
          id="related-reading-heading"
          className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 flex items-center gap-2"
        >
          <BookOpen className="w-6 h-6 text-blue-600" />
          {title}
        </h2>
        <p className="text-sm text-slate-600 leading-relaxed max-w-3xl">
          {intro ??
            `Long-form guides from the ${SITE_NAME} editorial desk that go deeper on the topics above.`}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {articles.map((a) => (
          <Link
            key={a.slug}
            href={`/blog/${a.slug}`}
            className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-xs hover:border-blue-300 transition cursor-pointer"
          >
            <span className="text-[10px] font-black uppercase tracking-wider text-blue-700">
              {a.category}
            </span>
            <h3 className="mt-1.5 text-sm font-black text-slate-900 leading-snug group-hover:text-blue-700 transition">
              {a.title}
            </h3>
            <p className="mt-2 text-xs text-slate-600 leading-relaxed line-clamp-3">
              {a.description}
            </p>
            <span className="mt-3 inline-flex items-center gap-1 text-[11px] font-bold text-blue-700">
              Read the guide
              <ArrowRight className="w-3 h-3 transition group-hover:translate-x-0.5" />
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}