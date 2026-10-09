import type { Metadata } from 'next';
import EmbeddableMap from '@/components/embed/EmbeddableMap';

/**
 * The iframe target third-party sites embed. Deliberately chrome-free and
 * self-contained: no site header/footer, no Clerk, no global store.
 *
 * The route is indexable but carries a canonical back to the main atlas so it
 * can never compete with the real map for rankings.
 */
export const metadata: Metadata = {
  title: 'Dholera SIR Interactive Map Widget | DholeraMap',
  description:
    'Embeddable interactive Dholera SIR map covering TP 1-6. Free for brokers, bloggers and news sites to embed.',
  alternates: { canonical: 'https://dholeramap.com/embed/map' },
  openGraph: {
    title: 'Dholera SIR Interactive Map Widget | DholeraMap',
    description: 'Embeddable interactive Dholera SIR map (TP 1-6). Free to embed.',
    url: 'https://dholeramap.com/embed/map',
    siteName: 'DholeraMap',
    images: ['/og-image.png'],
    locale: 'en_IN',
  },
};

export default function EmbedMapPage() {
  return (
    <div className="h-screen w-screen overflow-hidden bg-slate-100">
      <EmbeddableMap />
    </div>
  );
}
