import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Support & Grievance Desk | DholeraMap',
  description:
    'Contact PlotBook Dholera support desk for survey parcel scrutiny, TP road alignment verification, billing inquiries, and grievance redressal.',
  keywords: [
    'Dholera map support',
    'Dholera SIR GIS contact',
    'PlotBook helpline',
    'Dholera interactive map inquiry',
    'Dholera land record verification support',
  ],
  alternates: {
    canonical: 'https://dholeramap.com/contact',
  },
  openGraph: {
    title: 'Contact Support & Grievance Desk | DholeraMap',
    description:
      'Contact PlotBook Dholera support desk for survey parcel scrutiny, TP road alignment verification, and grievance redressal.',
    url: 'https://dholeramap.com/contact',
    siteName: 'DholeraMap',
    images: ['/logo-512.png'],
    locale: 'en_IN',
    type: 'website',
  },
};

const contactJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'ContactPage',
  name: 'PlotBook Dholera Contact & Grievance Redressal',
  url: 'https://dholeramap.com/contact',
  mainEntity: {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'PlotBook Technologies',
    url: 'https://dholeramap.com',
    contactPoint: [
      {
        '@type': 'ContactPoint',
        telephone: '+91-98250-12345',
        contactType: 'customer support',
        email: 'aryanbanc@gmail.com',
        areaServed: 'IN',
        availableLanguage: ['English', 'Hindi', 'Gujarati'],
      },
    ],
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(contactJsonLd) }}
      />
      {children}
    </>
  );
}
