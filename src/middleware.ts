import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse, type NextRequest } from 'next/server';

const hasClerk = Boolean(
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY
);

// Public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  '/',
  '/map(.*)',
  '/embed(.*)',
  '/about(.*)',
  '/contact(.*)',
  '/pricing(.*)',
  '/terms(.*)',
  '/privacy(.*)',
  '/refund(.*)',
  '/shipping(.*)',
  '/disclaimer(.*)',
  '/guide(.*)',
  '/dholera-sir(.*)',
  '/brokers(.*)',
  '/properties(.*)',
  '/blog(.*)',
  '/village(.*)',
  '/survey(.*)',
  '/tata-semiconductor-dholera-map(.*)',
  '/dholera-expressway-airport-map(.*)',
  '/dholera-tp-map(.*)',
  '/dholera-plot-price(.*)',
  '/dholera-7-12-anyror-land-records(.*)',
  '/checkout(.*)',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/gis(.*)',
  '/api/create-order(.*)',
  '/api/verify-payment(.*)',
  '/api/bookmarks(.*)',
  '/api/feedback(.*)',
  '/api/indexnow(.*)',
  '/api/user(.*)',
  '/api/entitlements(.*)',
  '/api/razorpay/(.*)',
  '/api/razorpay/webhook(.*)',
  '/api/markdown(.*)',
  '/api/health(.*)',
  '/api/admin/health(.*)',
  '/sitemap.xml',
  '/image-sitemap.xml',
  '/manifest.webmanifest',
  '/.well-known/(.*)',
  '/verify(.*)',
]);

// 301 Permanent Redirects for legacy / renamed paths
const LEGACY_301_REDIRECTS: Record<string, string> = {
  '/privacy-policy': '/privacy',
  '/terms-and-conditions': '/terms',
  '/terms-of-service': '/terms',
  '/cancellation-and-refund': '/refund',
  '/refund-policy': '/refund',
  '/shipping-and-delivery': '/shipping',
};

const middleware = hasClerk
  ? clerkMiddleware(async (auth, req) => {
      const { pathname } = req.nextUrl;

      // Hostname canonicalization: redirect www. and *.vercel.app directly to dholeramap.com
      const host = req.headers.get('host') || req.nextUrl.host;
      if (host.startsWith('www.') || host.includes('vercel.app')) {
        const canonicalUrl = req.nextUrl.clone();
        canonicalUrl.host = 'dholeramap.com';
        canonicalUrl.port = '';
        canonicalUrl.protocol = 'https:';
        return NextResponse.redirect(canonicalUrl, 301);
      }

      // Block SEOForgeBot at edge before any page execution
      const userAgent = req.headers.get('user-agent') || '';
      if (/seoforge/i.test(userAgent)) {
        return new NextResponse('Crawler blocked by robots policy', { status: 403 });
      }

      // Fast check for 301 legacy redirects
      if (LEGACY_301_REDIRECTS[pathname]) {
        const url = req.nextUrl.clone();
        url.pathname = LEGACY_301_REDIRECTS[pathname];
        return NextResponse.redirect(url, 301);
      }

      // Static auth.md must always pass through directly to public/auth.md
      if (pathname === '/auth.md') {
        return NextResponse.next();
      }

      // Markdown for Agents: content negotiation OR direct .md URL request
      const acceptHeader = req.headers.get('accept') || '';
      const isDirectMarkdownUrl = pathname.endsWith('.md');
      const wantsMarkdown =
        acceptHeader.includes('text/markdown') ||
        acceptHeader.includes('text/x-markdown');

      if (
        (wantsMarkdown || isDirectMarkdownUrl) &&
        !pathname.startsWith('/api') &&
        !pathname.startsWith('/_next')
      ) {
        if (!isPublicRoute(req)) {
          await auth.protect();
        }
        let effectivePath = isDirectMarkdownUrl
          ? (pathname.replace(/\.md$/, '') || '/')
          : pathname;
        if (effectivePath === '/index') effectivePath = '/';

        const rewriteUrl = req.nextUrl.clone();
        rewriteUrl.pathname = '/api/markdown';
        rewriteUrl.searchParams.set('path', effectivePath);

        const requestHeaders = new Headers(req.headers);
        requestHeaders.set('x-forwarded-path', effectivePath);

        return NextResponse.rewrite(rewriteUrl, {
          request: {
            headers: requestHeaders,
          },
        });
      }

      if (!isPublicRoute(req)) {
        await auth.protect();
      }

      return NextResponse.next();
    })
  : function noClerkMiddleware(req: NextRequest) {
      const { pathname } = req.nextUrl;

      const host = req.headers.get('host') || req.nextUrl.host;
      if (host.startsWith('www.') || host.includes('vercel.app')) {
        const canonicalUrl = req.nextUrl.clone();
        canonicalUrl.host = 'dholeramap.com';
        canonicalUrl.port = '';
        canonicalUrl.protocol = 'https:';
        return NextResponse.redirect(canonicalUrl, 301);
      }

      const userAgent = req.headers.get('user-agent') || '';
      if (/seoforge/i.test(userAgent)) {
        return new NextResponse('Crawler blocked by robots policy', { status: 403 });
      }

      if (LEGACY_301_REDIRECTS[pathname]) {
        const url = req.nextUrl.clone();
        url.pathname = LEGACY_301_REDIRECTS[pathname];
        return NextResponse.redirect(url, 301);
      }

      if (pathname === '/auth.md') {
        return NextResponse.next();
      }

      const acceptHeader = req.headers.get('accept') || '';
      const isDirectMarkdownUrl = pathname.endsWith('.md');
      const wantsMarkdown =
        acceptHeader.includes('text/markdown') ||
        acceptHeader.includes('text/x-markdown');

      if (
        (wantsMarkdown || isDirectMarkdownUrl) &&
        !pathname.startsWith('/api') &&
        !pathname.startsWith('/_next')
      ) {
        let effectivePath = isDirectMarkdownUrl
          ? (pathname.replace(/\.md$/, '') || '/')
          : pathname;
        if (effectivePath === '/index') effectivePath = '/';

        const rewriteUrl = req.nextUrl.clone();
        rewriteUrl.pathname = '/api/markdown';
        rewriteUrl.searchParams.set('path', effectivePath);

        const requestHeaders = new Headers(req.headers);
        requestHeaders.set('x-forwarded-path', effectivePath);

        return NextResponse.rewrite(rewriteUrl, {
          request: {
            headers: requestHeaders,
          },
        });
      }

      return NextResponse.next();
    };

export default middleware;

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|json|bin|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest|xml|txt|pdf)).*)',
    '/(api|trpc)(.*)',
    '/__clerk/:path*',
  ],
};
