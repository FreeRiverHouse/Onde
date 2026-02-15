import type { Metadata } from 'next';
import Script from 'next/script';

const gameJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'VideoGame',
  name: 'Drawing Game Online Free for Kids',
  description:
    'Free online drawing game for kids. Digital art canvas with colors, brushes, and tools. No download, no ads. Save and share your drawings!',
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


const softwareAppJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Drawing Game Online Free for Kids',
  description:
    'Free online drawing game for kids. Digital art canvas with colors, brushes, and tools. No download, no ads. Save and share your drawings!',
  url: 'https://onde.la/games/draw/',
  applicationCategory: 'GameApplication',
  operatingSystem: 'Web Browser',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
  },
  publisher: {
    '@type': 'Organization',
    name: 'Onde',
    url: 'https://onde.la',
  },
  inLanguage: 'en',
};

export const metadata: Metadata = {
  title: 'Drawing Game Online Free for Kids - Creative Art Canvas | Onde',
  description:
    'Free online drawing game for kids. Digital art canvas with colors, brushes, stamps, and tools. Creative fun with no download, no ads. Save and share your drawings!',
  keywords: [
    'drawing game online',
    'drawing game online kids',
    'drawing game online free',
    'online drawing canvas',
    'digital art for kids',
    'kids drawing game',
    'creative drawing tool',
    'draw online free',
    'drawing no ads',
  ],
  openGraph: {
    title: '🎨 Drawing Game Online Free for Kids - Art Canvas | Onde',
    description:
      'Free online drawing game for kids! Digital art canvas with colors & brushes. No download, no ads!',
    url: 'https://onde.la/games/draw/',
    siteName: 'Onde',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: '🎨 Drawing Game Online Free for Kids | Onde',
    description:
      'Free online drawing game for kids! Digital canvas, colors & brushes. No download, no ads.',
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
      <Script
        id="draw-software-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareAppJsonLd) }}
      />
      {children}
    </>
  );
}
