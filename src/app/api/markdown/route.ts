import { NextRequest, NextResponse } from 'next/server';
import { generateMarkdownForPath, estimateTokens } from '@/lib/markdown-generator';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  try {
    const rawPath =
      req.headers.get('x-markdown-path') ||
      req.nextUrl.searchParams.get('path') ||
      '/';
    const markdown = await generateMarkdownForPath(rawPath);
    const tokenCount = estimateTokens(markdown);

    return new NextResponse(markdown, {
      status: 200,
      headers: {
        'Content-Type': 'text/markdown; charset=utf-8',
        'x-markdown-tokens': String(tokenCount),
        'Vary': 'Accept',
        'Link': '</.well-known/api-catalog>; rel="api-catalog", </openapi.json>; rel="service-desc"; type="application/json", </guide>; rel="service-doc"; type="text/html", </llms.txt>; rel="describedby"; type="text/plain"',
        'Cache-Control': 'no-cache, no-store, max-age=0, must-revalidate',
        'CDN-Cache-Control': 'no-store',
        'Cloudflare-CDN-Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    console.error('Error generating markdown representation:', error);
    const fallback = `# DholeraMap — Machine-Readable Intelligence

We were unable to generate markdown for the requested path. Please refer to our site overview and LLM feeds below:

- [LLMs Overview](https://dholeramap.com/llms.txt)
- [Full LLM Index](https://dholeramap.com/llms-full.txt)
- [XML Sitemap](https://dholeramap.com/sitemap.xml)
`;
    return new NextResponse(fallback, {
      status: 200,
      headers: {
        'Content-Type': 'text/markdown; charset=utf-8',
        'x-markdown-tokens': String(estimateTokens(fallback)),
        'Vary': 'Accept',
      },
    });
  }
}
