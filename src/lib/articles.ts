import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { remark } from 'remark';
import remarkHtml from 'remark-html';

const CONTENT_DIR = path.join(process.cwd(), 'src', 'content');

export interface ArticleMeta {
  slug: string;
  title: string;
  description: string;
  date: string;
  updated?: string;
  keywords?: string[];
  category: string;
  readingTime?: string;
  draft?: boolean;
}

export interface Article extends ArticleMeta {
  /** Markdown source (frontmatter stripped). */
  content: string;
  /** Pre-rendered HTML for the article body. */
  html: string;
}

let cache: Article[] | null = null;

async function toHtml(markdown: string): Promise<string> {
  const file = await remark().use(remarkHtml).process(markdown);
  return String(file);
}

/** Reads every .mdx under src/content, sorted newest-first. HTML is rendered
 *  once and cached for the lifetime of the server process. */
export async function getAllArticles(): Promise<Article[]> {
  if (cache) return cache;

  if (!fs.existsSync(CONTENT_DIR)) {
    cache = [];
    return cache;
  }

  const files = fs.readdirSync(CONTENT_DIR).filter((f) => f.endsWith('.mdx'));

  const articles = await Promise.all(
    files.map(async (file) => {
      const raw = fs.readFileSync(path.join(CONTENT_DIR, file), 'utf8');
      const { data, content } = matter(raw);
      const slug = file.replace(/\.mdx$/, '');
      return {
        slug,
        title: String(data.title ?? slug),
        description: String(data.description ?? ''),
        date: String(data.date ?? '1970-01-01'),
        updated: data.updated ? String(data.updated) : undefined,
        keywords: Array.isArray(data.keywords) ? data.keywords.map(String) : undefined,
        category: String(data.category ?? 'Dholera SIR'),
        readingTime: data.readingTime ? String(data.readingTime) : undefined,
        draft: Boolean(data.draft),
        content,
        html: await toHtml(content),
      };
    }),
  );

  cache = articles.sort((a, b) => (a.date < b.date ? 1 : -1));
  return cache;
}

/** Published articles only (draft:true excluded). For listing + sitemap. */
export async function getPublishedArticles(): Promise<Article[]> {
  return (await getAllArticles()).filter((a) => !a.draft);
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  return (await getAllArticles()).find((a) => a.slug === slug) ?? null;
}

export async function getArticleSlugs(): Promise<string[]> {
  return (await getPublishedArticles()).map((a) => a.slug);
}
