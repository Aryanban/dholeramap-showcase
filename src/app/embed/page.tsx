import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Code2, Map, ExternalLink, Globe, Zap, ShieldCheck } from 'lucide-react';
import SiteHeader from '@/components/panels/SiteHeader';
import SiteFooter from '@/components/panels/SiteFooter';
import CopyBlock from '@/components/embed/CopyBlock';
import { DOMAIN, OG_IMAGE, OG_IMAGE_DIMS, pageDescription } from '@/lib/brand';

export const metadata: Metadata = {
  title: 'Embed the Dholera SIR Map (Free Widget) | DholeraMap',
  description: pageDescription(
    'Free embeddable interactive Dholera SIR map widget. Add live TP 1-6 town planning maps to your blog, broker site or news article in 30 seconds with one line of code.',
    'Free embeddable interactive Dholera SIR map widget. One line of code, TP 1-6 schemes, always current.',
  ),
  keywords: [
    'Dholera map embed',
    'Dholera SIR map widget',
    'embed Dholera map',
    'Dholera interactive map iframe',
    'Dholera TP map for website',
    'free map widget Dholera',
    'Dholera smart city map embed code',
  ],
  alternates: { canonical: `${DOMAIN}/embed` },
  openGraph: {
    title: 'Embed the Dholera SIR Map (Free Widget) | DholeraMap',
    description: pageDescription(
      'Free embeddable interactive Dholera SIR map. One line of code, TP 1-6 schemes, always current.',
    ),
    url: `${DOMAIN}/embed`,
    siteName: 'DholeraMap',
    images: [{ url: OG_IMAGE, width: OG_IMAGE_DIMS.width, height: OG_IMAGE_DIMS.height }],
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Embed the Dholera SIR Map (Free Widget) | DholeraMap',
    description: pageDescription('Free embeddable interactive Dholera SIR map. One line of code.'),
    images: [OG_IMAGE],
  },
};

const EMBED_SNIPPET = `<iframe src="https://dholeramap.com/embed/map" width="100%" height="520" style="border:0; border-radius:12px; overflow:hidden; width:100%; max-width:100%;" loading="lazy" title="Dholera SIR Interactive Map — DholeraMap"></iframe>
<p style="font-size:11px;color:#64748b;margin-top:6px;text-align:right">Interactive GIS Map by <a href="https://dholeramap.com" target="_blank" rel="noopener" style="color:#2563eb;font-weight:600;text-decoration:underline">DholeraMap.com</a></p>`;

const embedJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'SoftwareApplication',
      name: 'DholeraMap Embeddable Interactive Widget',
      applicationCategory: 'MapApplication',
      operatingSystem: 'Any (web)',
      description:
        'Free embeddable interactive Dholera SIR map widget covering Town Planning schemes TP 1-6.',
      url: `${DOMAIN}/embed`,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' },
      publisher: { '@type': 'Organization', name: 'DholeraMap', url: DOMAIN },
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'Is the Dholera SIR map widget free to embed?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes. The widget is free for any website, blog, broker page or news article. There is no usage limit, API key or subscription; copy the snippet and publish.',
          },
        },
        {
          '@type': 'Question',
          name: 'How do I embed the Dholera map on my website?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Copy the iframe snippet from this page and paste it into your page HTML where you want the map to appear. Set width and height to suit your layout; the map is responsive and loads lazily.',
          },
        },
        {
          '@type': 'Question',
          name: 'Does the embedded map stay up to date?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes. The widget is served from dholeramap.com and renders the same tile pyramids as the main atlas, so visitors always see the current boundary data and Town Planning schemes without you ever updating the code.',
          },
        },
        {
          '@type': 'Question',
          name: 'Can I embed a specific Town Planning scheme?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'The widget ships with a TP 1-6 switcher so visitors can choose any scheme. For a scheme-specific embed, append the scheme fragment to the iframe URL or contact us for a pre-configured variant.',
          },
        },
      ],
    },
  ],
};

export default function EmbedPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      <SiteHeader />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(embedJsonLd) }}
      />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        <header className="space-y-4">
          <div className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-200 px-2.5 py-1 rounded-full">
            <Code2 className="w-3.5 h-3.5" /> Free Widget
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
            Embed the Dholera SIR Map on Your Site
          </h1>
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl">
            Add the interactive Dholera Special Investment Region map to your blog,
            broker website or news article in under a minute. One line of code, always current,
            no API key and no cost.
          </p>
        </header>

        {/* Live preview */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Map className="w-5 h-5 text-amber-600" /> Live Preview
          </h2>
          <p className="text-sm text-slate-600">
            This is exactly what your visitors will see (interactive, zoomable, TP 1&ndash;6).
          </p>
          <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-md bg-white">
            <iframe
              src={`${DOMAIN}/embed/map`}
              width="100%"
              height="520"
              style={{ border: 0, display: 'block' }}
              loading="lazy"
              title="Dholera SIR Interactive Map — DholeraMap"
            />
          </div>
        </section>

        {/* Copy-paste code */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold">Embed Code</h2>
          <p className="text-sm text-slate-600">
            Copy this snippet and paste it into your page HTML wherever you want the map.
          </p>
          <CopyBlock code={EMBED_SNIPPET} />
        </section>

        {/* Why embed */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold">Why Embed the DholeraMap Widget?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                icon: Zap,
                title: 'Zero maintenance',
                body: 'Served from dholeramap.com — your map updates automatically whenever the map data improves.',
              },
              {
                icon: Globe,
                title: 'Works anywhere',
                body: 'Plain HTML iframe. WordPress, Blogger, Webflow, custom sites and news CMSes all support it.',
              },
              {
                icon: ShieldCheck,
                title: 'Free & unrestricted',
                body: 'No API key, no rate limit, no subscription. Free for commercial and editorial use.',
              },
            ].map((f) => (
              <div
                key={f.title}
                className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2"
              >
                <f.icon className="w-5 h-5 text-amber-600" />
                <h3 className="text-sm font-black">{f.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{f.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Embedding guide */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold">Step-by-Step Instructions</h2>
          <ol className="space-y-3 text-sm text-slate-700">
            <li className="flex gap-3">
              <span className="shrink-0 w-6 h-6 rounded-full bg-slate-900 text-white text-xs font-black flex items-center justify-center">
                1
              </span>
              <span>Copy the embed code above using the copy button.</span>
            </li>
            <li className="flex gap-3">
              <span className="shrink-0 w-6 h-6 rounded-full bg-slate-900 text-white text-xs font-black flex items-center justify-center">
                2
              </span>
              <span>
                Open the page or post where you want the map, switch to the HTML / code editor,
                and paste the snippet where the map should appear.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="shrink-0 w-6 h-6 rounded-full bg-slate-900 text-white text-xs font-black flex items-center justify-center">
                3
              </span>
              <span>
                Adjust <code className="px-1.5 py-0.5 bg-slate-100 rounded font-mono text-xs">height</code> and{' '}
                <code className="px-1.5 py-0.5 bg-slate-100 rounded font-mono text-xs">width</code> to fit
                your layout. A height of 520&ndash;640px works well for article pages.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="shrink-0 w-6 h-6 rounded-full bg-slate-900 text-white text-xs font-black flex items-center justify-center">
                4
              </span>
              <span>
                Publish. The map loads lazily, so it never slows down your page, and it always
                shows the current Dholera SIR interactive atlas.
              </span>
            </li>
          </ol>
        </section>

        {/* For developers */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold">For Developers</h2>
          <p className="text-sm text-slate-600">
            Prefer a scheme-specific embed or a native-size map? These optional variants work
            without any key:
          </p>
          <CopyBlock
            code={`<!-- Scheme-specific: opens on TP 2 Activation Area -->
<iframe src="https://dholeramap.com/embed/map#tp2" width="100%" height="520" style="border:0; border-radius:12px; overflow:hidden; width:100%; max-width:100%;" loading="lazy" title="Dholera SIR TP 2 Map — DholeraMap"></iframe>
<p style="font-size:11px;color:#64748b;margin-top:6px;text-align:right">TP 2 Activation Area Map by <a href="https://dholeramap.com" target="_blank" rel="noopener" style="color:#2563eb;font-weight:600;text-decoration:underline">DholeraMap.com</a></p>`}
          />
          <p className="text-xs text-slate-500">
            The widget endpoint is{' '}
            <code className="px-1.5 py-0.5 bg-slate-100 rounded font-mono">
              https://dholeramap.com/embed/map
            </code>{' '}
            and accepts any width/height. Attribution (&ldquo;DholeraMap&rdquo;) must remain
            visible, as it identifies the data source.
          </p>
        </section>

        <section className="rounded-3xl bg-white border border-slate-200 text-slate-900 p-8 space-y-4 text-center shadow-xs">
          <h2 className="text-xl font-black text-slate-900">Built on the full interactive atlas</h2>
          <p className="text-sm text-slate-600 max-w-xl mx-auto">
            The widget renders the same georeferenced Town Planning blueprints as the main
            DholeraMap atlas — 18,161 statutory survey numbers across 22 revenue villages.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 py-2.5 px-6 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md transition"
          >
            Explore the full atlas <ExternalLink className="w-4 h-4" />
          </Link>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
