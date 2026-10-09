import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'DholeraMap Plans & Pricing | Dholera SIR Land GIS',
  description:
    'Transparent pricing for Dholera SIR brokers and investors: access vector TP maps, interactive search, and local title deed vaults.',
  keywords: [
    'Dholera real estate software pricing',
    'Dholera interactive map subscription',
    'Dholera SIR broker CRM pricing',
    'Dholera land registry tool cost',
    'Dholera TP map download pass',
    'Dholera survey number search pricing',
  ],
  alternates: {
    canonical: 'https://dholeramap.com/pricing',
  },
  openGraph: {
    title: 'DholeraMap Plans & Pricing | Dholera SIR Land GIS',
    description:
      'Transparent subscription plans for Dholera SIR interactive maps and plot registry CRM.',
    url: 'https://dholeramap.com/pricing',
    siteName: 'DholeraMap',
    images: [
      {
        url: '/logo-512.png',
        width: 512,
        height: 512,
        alt: 'PlotBook Dholera Pricing Plans',
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
};

const pricingJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: 'PlotBook Dholera Dealer Pro Subscription',
      description:
        'Interactive GIS intelligence and land registry CRM for Dholera SIR. Real-time TP 1-6 schemes, 18,161 survey parcels, and DGDCR FAR calculator.',
      brand: {
        '@context': 'https://schema.org',
        '@type': 'Brand',
        name: 'PlotBook',
      },
      offers: [
        {
          '@context': 'https://schema.org',
          '@type': 'Offer',
          name: 'Interactive Free Starter',
          price: '0',
          priceCurrency: 'INR',
          availability: 'https://schema.org/InStock',
          url: 'https://dholeramap.com/pricing',
        },
        {
          '@context': 'https://schema.org',
          '@type': 'Offer',
          name: 'Investor Due-Diligence Pass (30-Day)',
          price: '199',
          priceCurrency: 'INR',
          availability: 'https://schema.org/InStock',
          url: 'https://dholeramap.com/pricing#investor',
        },
        {
          '@context': 'https://schema.org',
          '@type': 'Offer',
          name: 'Dealer Pro Monthly',
          price: '1000',
          priceCurrency: 'INR',
          availability: 'https://schema.org/InStock',
          url: 'https://dholeramap.com/pricing',
        },
        {
          '@context': 'https://schema.org',
          '@type': 'Offer',
          name: 'Enterprise Max Monthly',
          price: '2499',
          priceCurrency: 'INR',
          availability: 'https://schema.org/InStock',
          url: 'https://dholeramap.com/pricing',
        },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'Are PlotBook Dholera subscriptions billed in Indian Rupees?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes, all PlotBook Dholera plans are billed in Indian Rupees (INR ₹) with GST compliance and instant digital activation via Razorpay.',
          },
        },
        {
          '@type': 'Question',
          name: 'Is there a free tier for inspecting Dholera survey numbers?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes, the Interactive Free tier allows unlimited searches across 18,161 revenue survey parcels and 60 FPS vector map navigation at zero cost.',
          },
        },
      ],
    },
  ],
};

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pricingJsonLd) }}
      />
      {children}
    </>
  );
}
