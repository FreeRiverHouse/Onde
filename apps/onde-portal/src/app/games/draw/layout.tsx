import type { Metadata } from 'next';
import Script from 'next/script';

const gameJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'VideoGame',
  name: 'Draw',
  description:
    'Unleash your inner artist! Free drawing canvas with brushes, colors, and tools. Create, save, and share your masterpieces.',
  url: 'https://onde.la/games/draw/',
  genre: ['Educational', 'Creative'],
  gamePlatform: ['Web Browser'],
  applicationCategory: 'Game',
  operatingSystem: 'Any',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
  },
  audience: {
    '@type': 'PeopleAudience',
    suggestedMinAge: 3,
  },
  publisher: {
    '@type': 'Organization',
    name: 'Onde',
    url: 'https://onde.la',
  },
  inLanguage: 'en',
};

export const metadata: Metadata = {
  title: 'Draw - Free Online Drawing Canvas | Onde',
  description:
    'Unleash your inner artist! Free drawing canvas with brushes, colors, and tools. Create, save, and share your masterpieces.',
  keywords:
    'drawing game, online canvas, digital art, kids drawing, creative tool',
  openGraph: {
    title: '🎨 Draw - Free Online Drawing Canvas!',
    description:
      'Unleash your inner artist! Free drawing canvas with brushes, colors, and tools.',
    url: 'https://onde.la/games/draw/',
    siteName: 'Onde',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: '🎨 Draw - Free Online Drawing Canvas',
    description:
      'Unleash your inner artist! Free drawing canvas with brushes, colors, and tools. Free to play.',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Script
        id="draw-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(gameJsonLd) }}
      />
      {children}
    </>
  );
}
