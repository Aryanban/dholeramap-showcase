import type { MetadataRoute } from 'next'
import { SITE_NAME, PRODUCT_NAME } from '@/lib/brand'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${SITE_NAME} — Dholera SIR Town Planning Schemes & Interactive GIS`,
    short_name: SITE_NAME,
    description: `Explore 18,161 statutory survey numbers, sanctioned preliminary town planning plots, DGDCR building regulations, and road access nodes across Dholera Special Investment Region (SIR), Gujarat. Powered by the ${PRODUCT_NAME} interactive engine.`,
    start_url: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#ffffff',
    theme_color: '#2563eb',
    icons: [
      {
        src: '/icon-48.png',
        sizes: '48x48',
        type: 'image/png',
      },
      {
        src: '/icon-96.png',
        sizes: '96x96',
        type: 'image/png',
      },
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/apple-icon.png',
        sizes: '180x180',
        type: 'image/png',
      },
      {
        src: '/logo-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  }
}
