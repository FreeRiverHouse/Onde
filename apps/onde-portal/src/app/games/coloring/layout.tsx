import type { Metadata } from 'next';
import Script from 'next/script';

const gameJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'VideoGame',
  name: 'Coloring Pages Online Free for Kids',
  description:
    'Free online coloring pages for kids. Digital coloring book with beautiful pictures. Tap to color, choose colors, and create! No download, no ads.',
  url: 'https://onde.la/games/coloring/',
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
  title: 'Coloring Pages Online Free for Kids - Digital Coloring Book | Onde',
  description:
    'Free online coloring pages for kids. Digital coloring book with beautiful pictures. Tap to color, choose colors, and create! No download, no ads needed.',
  keywords: [
    'coloring pages online free for kids',
    'coloring book online free',
    'digital coloring book',
    'kids coloring game',
    'coloring game online',
    'coloring for kids free',
    'coloring no ads',
    'creative game for kids',
  ],
  openGraph: {
    title: '🖍️ Coloring Pages Online Free for Kids - Digital Coloring Book | Onde',
    description:
      'Free online coloring pages for kids! Beautiful pictures, tap to color. No download, no ads!',
    url: 'https://onde.la/games/coloring/',
    siteName: 'Onde',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: '🖍️ Coloring Pages Online Free for Kids | Onde',
    description:
      'Free online coloring pages for kids! Digital coloring book. No download, no ads.',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Script
        id="coloring-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(gameJsonLd) }}
      />
      {children}
    </>
  );
}
