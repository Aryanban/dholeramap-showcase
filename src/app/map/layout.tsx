import type { Metadata } from 'next';
import { SITE_NAME, DOMAIN, OG_IMAGE, OG_IMAGE_DIMS, hreflang, pageTitle, pageDescription } from '@/lib/brand';

const TITLE = pageTitle('Dholera Map — Interactive SIR GIS Atlas');

export const metadata: Metadata = {
  title: TITLE,
  description: pageDescription(
    'The interactive Dholera map: search 18,161 survey numbers, Final Plots, TP 1-6 boundaries, abutting road widths and DGDCR building regulations across 22 villages.',
    'Search 18,161 survey numbers and Final Plots on the interactive Dholera SIR map. TP 1-6 boundaries, road widths, DGDCR zoning.',
  ),
  alternates: {
    canonical: `${DOMAIN}/map`,
    languages: hreflang(`${DOMAIN}/map`),
  },
  openGraph: {
    title: TITLE,
    description: pageDescription(
      'Search any revenue survey number or Final Plot across 22 villages on the interactive Dholera SIR map and city map atlas.',
      'Search any survey number or Final Plot across 22 villages on the interactive Dholera SIR map.',
    ),
    url: `${DOMAIN}/map`,
    siteName: SITE_NAME,
    images: [
      {
        url: OG_IMAGE,
        width: OG_IMAGE_DIMS.width,
        height: OG_IMAGE_DIMS.height,
        alt: 'DholeraMap interactive Dholera SIR map and GIS atlas preview',
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: pageDescription(
      'Search 18,161 survey numbers on the interactive Dholera map. TP 1-6 boundaries, road widths, DGDCR zoning.',
    ),
    images: [OG_IMAGE],
  },
};

export default function MapLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
