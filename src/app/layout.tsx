import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import ServiceWorkerRegister from "@/components/ui/ServiceWorkerRegister";
import ClerkGate from "@/components/providers/ClerkGate";
import {
  DOMAIN,
  SITE_NAME,
  SITE_FULL,
  PRODUCT_NAME,
  OG_IMAGE,
  OG_IMAGE_DIMS,
  VILLAGE_COUNT,
  hreflang,
  pageDescription,
} from "@/lib/brand";
import "./globals.css";

// Width-capped once, in one place. The homepage title leads with the two
// highest-volume terms ("dholera smart city map", "dholera sir map") and the brand
// suffix is trimmed — not the keywords — so the SERP never cuts the phrase.
const HOME_TITLE = "Dholera Smart City Map 2026: Interactive SIR Map | " + SITE_NAME;

export const metadata: Metadata = {
  metadataBase: new URL(DOMAIN),
  title: HOME_TITLE,
  description: pageDescription(
    "Dholera Smart City map and Dholera SIR cadastral map 2026: search 18,161 survey numbers and Final Plots, view TP 1-6 boundaries, road widths and DGDCR zoning across 22 villages.",
    "Search 18,161 survey numbers and Final Plots on the interactive Dholera Smart City map and Dholera SIR map. TP 1-6 boundaries, road widths, DGDCR zoning.",
  ),
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  // The homepage deliberately does NOT claim the definitional head terms
  // ("Dholera SIR full form", "what is Dholera SIR"). Those belong to
  // /dholera-sir, which was built specifically to own them. GSC showed the
  // homepage at pos 46.5 for "dholera map" and pos 90 for "dholera sir" because
  // three pages (homepage, blog post, /guide) all targeted the same intent and
  // Google split the signal between them. One page per intent.
  keywords: [
    "Dholera map online",
    "Dholera SIR map online",
    "Dholera Map",
    "Dholera SIR Map",
    "Dholera smart city",
    "Dholera smart city map",
    "Dholera TP Map",
    "Dholera Interactive Map",
    "Dholera GIS map",
    "Dholera survey number map",
    "Dholera TP 1 TP 2 TP 3 TP 4 TP 5 TP 6",
    "Dholera Town Planning Schemes",
    "Dholera Land Survey",
    "Dholera Smart City Map",
    "Dholera Survey Number",
    "Dholera Final Plot FP",
    "ધોલેરા સ્માર્ટ સિટી નકશો",
    "ધોલેરા મેપ",
    "ધોલેરા જમીન ભાવ",
    "ધોલેરા ૭/૧૨ એનીરોર",
    SITE_NAME,
    PRODUCT_NAME,
  ],
  alternates: {
    canonical: DOMAIN,
    // en-IN / en / x-default all point at the homepage. Declaring one document
    // under three English locales stops Google from fragmenting the homepage's
    // already-weak head-term rankings ("dholera map" pos 46.5) across competing
    // regional variants. See hreflang() in src/lib/brand.ts.
    languages: hreflang(DOMAIN),
  },
  openGraph: {
    title: HOME_TITLE,
    description: pageDescription(
      "Dholera city map and Dholera SIR smart city map: search 18,161 survey numbers and Final Plots across 22 villages. TP 1-6 boundaries, road widths and DGDCR zoning.",
      "Search 18,161 survey numbers and Final Plots on the Dholera city map. TP 1-6 boundaries, road widths, DGDCR zoning.",
    ),
    url: DOMAIN,
    siteName: SITE_NAME,
    images: [
      {
        url: OG_IMAGE,
        width: OG_IMAGE_DIMS.width,
        height: OG_IMAGE_DIMS.height,
        alt: `${SITE_FULL} — interactive map preview`,
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: HOME_TITLE,
    description: pageDescription(
      "Dholera city map and Dholera SIR smart city map: search 18,161 survey numbers across 22 villages. TP 1-6 boundaries, road widths and DGDCR zoning.",
      "Search 18,161 survey numbers on the Dholera city map. TP 1-6 boundaries, road widths, DGDCR zoning.",
    ),
    images: [OG_IMAGE],
  },
  icons: {
    // Google Search Favicon Guidelines: icon must be a multiple of 48px square
    // (48x48, 96x96, 144x144, 192x192). Placing 48px and 96px first guarantees
    // Google-Favicon bot captures the high-res transparent glyph instead of falling
    // back to a default grey globe placeholder.
    icon: [
      { url: '/icon-48.png', type: 'image/png', sizes: '48x48' },
      { url: '/icon-96.png', type: 'image/png', sizes: '96x96' },
      { url: '/icon-144.png', type: 'image/png', sizes: '144x144' },
      { url: '/icon-192.png', type: 'image/png', sizes: '192x192' },
      { url: '/favicon.ico', sizes: '48x48 32x32 16x16' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
    ],
    shortcut: ['/favicon.ico'],
  },
  manifest: '/manifest.webmanifest',
};

export const viewport: Viewport = {
  themeColor: "#2563eb",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "@id": `${DOMAIN}/#website`,
      "url": `${DOMAIN}/`,
      "name": SITE_NAME,
      "alternateName": ["DholeraMap", "Dholera Map", "Dholera SIR Map", "ધોલેરા મેપ", "ધોલેરા સ્માર્ટ સિટી નકશો", "dholeramap.com"],
      "description": "Interactive GIS map and statutory planning atlas covering 18,161 survey numbers, Town Planning schemes TP 1 through TP 6, and DGDCR regulations across Dholera Special Investment Region.",
      "inLanguage": "en",
      "publisher": { "@id": `${DOMAIN}/#organization` },
      "potentialAction": {
        "@type": "SearchAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": `${DOMAIN}/?search={search_term_string}`
        },
        "query-input": "required name=search_term_string"
      }
    },
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      "@id": `${DOMAIN}/#organization`,
      "name": SITE_NAME,
      "url": DOMAIN,
      "description": "Official geospatial interactive atlas and statutory land intelligence platform for the Dholera Special Investment Region, Gujarat, India.",
      "logo": {
        "@type": "ImageObject",
        "url": `${DOMAIN}/logo-512.png`,
        "width": 512,
        "height": 512,
        "creator": { "@id": `${DOMAIN}/#organization` },
        "copyrightNotice": `© ${new Date().getFullYear()} ${SITE_NAME}. All rights reserved.`,
        "creditText": SITE_FULL,
        "license": `${DOMAIN}/terms`,
        "acquireLicensePage": `${DOMAIN}/terms`
      }
    },
    {
      "@context": "https://schema.org",
      "@type": "Dataset",
      "@id": `${DOMAIN}/#dataset`,
      "name": "Dholera SIR Interactive Land Parcel Records & TP Scheme GIS Database",
      "description": `Geospatial database of 18,161 statutory survey numbers, preliminary town planning plots, DGDCR 2024 zoning parameters, and road network frontage across ${VILLAGE_COUNT} revenue villages in Dholera SIR.`,
      "url": DOMAIN,
      "creator": { "@id": `${DOMAIN}/#organization` },
      "license": `${DOMAIN}/terms`,
      "keywords": [
        "Dholera SIR",
        "Interactive Map",
        "Town Planning Schemes",
        "TP 1", "TP 2", "TP 3", "TP 4", "TP 5", "TP 6",
        "DGDCR 2024",
        "Gujarat Land Records",
        "Dholera Smart City"
      ],
      "spatialCoverage": {
        "@type": "Place",
        "name": "Dholera Special Investment Region (SIR), Gujarat, India",
        "geo": {
          "@type": "GeoCoordinates",
          "latitude": 22.25,
          "longitude": 72.18
        }
      }
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "@id": "https://dholeramap.com/#faq",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "What is Dholera SIR and what does SIR stand for?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Dholera SIR stands for Dholera Special Investment Region — a 920 sq km greenfield industrial smart city in Ahmedabad district, Gujarat, created as a statutory planning designation under the Gujarat Special Investment Region Act, 2009. Land inside the SIR is planned, zoned and regulated by the Dholera Special Investment Region Development Authority (DSIRDA) rather than by ordinary municipal or panchayat rules."
          }
        },
        {
          "@type": "Question",
          "name": "Where is the Dholera smart city map?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "The Dholera smart city map is the interactive atlas at dholeramap.com. It covers the full 920 sq km Dholera Special Investment Region across 22 revenue villages and six Town Planning schemes (TP 1 to TP 6), letting you search any revenue survey number or Final Plot and inspect TP boundaries, abutting road widths and DGDCR 2024 building envelopes."
          }
        },
        {
          "@type": "Question",
          "name": "What Town Planning schemes are active in Dholera SIR?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Dholera SIR comprises six major Town Planning (TP) schemes: TP 1, TP 2 (divided into TP 2A and TP 2B), TP 3, TP 4, TP 5, and TP 6, encompassing thousands of reconstituted Final Plots (FP) and statutory revenue survey numbers."
          }
        },
        {
          "@type": "Question",
          "name": "How do I find my Survey Number and Final Plot in Dholera?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Using DholeraMap at dholeramap.com, you can search by revenue survey number, village name (e.g. Ambli, Hebatpur, Bhadiyad), or Final Plot (FP) number to instantly locate the parcel on the high-resolution interactive blueprint, view nearest TP road widths, and inspect DGDCR building regulations."
          }
        },
        {
          "@type": "Question",
          "name": "What is the plot price in Dholera SIR in 2026?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "In 2026, the official DICDL allotment floor rate ranges from ₹4,000/sq m (~₹3,344/sq yd) for industrial use to ₹6,000/sq m (~₹5,016/sq yd) for residential and ₹8,000/sq m (~₹6,690/sq yd) for commercial CBD plots. In the secondary market, developed and serviced residential plots in TP 1 and TP 2 trade between ₹11,000 and ₹16,000+ per sq yard depending on road frontage."
          }
        },
        {
          "@type": "Question",
          "name": "Where is the Tata Semiconductor Fab plant located in Dholera?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "The ₹91,000-crore Tata Electronics and PSMC semiconductor fabrication plant is situated on a 160-acre statutory industrial plot in Town Planning Scheme 2 (TP 2A) within the Dholera Activation Area, directly connected to the Ahmedabad-Dholera Expressway and dedicated utility trunk corridors."
          }
        }
      ]
    }
  ]
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Preconnect & DNS prefetch for lightning-fast Google Satellite & TownPlanMap raster tiles */}
        <link rel="preconnect" href="https://mt0.google.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://mt1.google.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://mt2.google.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://mt3.google.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://tiledata.townplanmap.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://tiledata.townplanmap.com" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {/* Machine-readable discovery links per RFC 9727 and RFC 8288 */}
        <link rel="api-catalog" href="/.well-known/api-catalog" />
        <link rel="service-desc" href="/openapi.json" type="application/json" />
        <link rel="service-doc" href="/guide" />
        <link rel="describedby" href="/llms.txt" type="text/plain" />
        <link rel="dns-prefetch" href="https://scripts.clarity.ms" />
        <link rel="dns-prefetch" href="https://www.clarity.ms" />
      </head>
      <body className="antialiased bg-slate-50 text-slate-900 min-h-screen w-screen font-sans selection:bg-blue-100 selection:text-blue-900">
        {/* Microsoft Clarity analytics for https://dholeramap.com/ */}
        <Script
          id="microsoft-clarity"
          strategy="lazyOnload"
          dangerouslySetInnerHTML={{
            __html: `(function(c,l,a,r,i,t,y){
        c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
        t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i+"?ref=bwt";
        y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
    })(window, document, "clarity", "script", "ykvs69445n");`,
          }}
        />
        <ServiceWorkerRegister />
        <ClerkGate>
          {children}
        </ClerkGate>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
