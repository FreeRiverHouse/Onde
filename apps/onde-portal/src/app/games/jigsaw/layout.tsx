import type { Metadata } from 'next';
import Script from 'next/script';

const gameJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'VideoGame',
  name: 'Jigsaw Puzzle Online Free',
  description:
    'Play free jigsaw puzzles online. Multiple images, drag & drop puzzle game for kids and adults. No download, no ads, works on mobile.',
  url: 'https://onde.la/games/jigsaw/',
  genre: ['Puzzle'],
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
    suggestedMinAge: 4,
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
  name: 'Jigsaw Puzzle Online Free',
  description:
    'Play free jigsaw puzzles online. Multiple images, drag & drop puzzle game for kids and adults. No download, no ads, works on mobile.',
  url: 'https://onde.la/games/jigsaw/',
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
  title: 'Jigsaw Puzzle Online Free - Play Puzzle Games for Kids No Download | Onde',
  description:
    'Play free jigsaw puzzles online. Multiple images, 3x3 to 6x6 difficulty. Drag & drop puzzle game for kids and adults. No download, no ads, works on mobile.',
  keywords: [
    'jigsaw puzzle online free',
    'jigsaw puzzle online free for kids',
    'jigsaw puzzle online free no download',
    'puzzle game for kids',
    'picture puzzle online',
    'drag and drop puzzle',
    'jigsaw game free',
    'jigsaw no ads',
  ],
  openGraph: {
    title: '🧩 Jigsaw Puzzle Online Free - For Kids & Adults | Onde',
    description:
      'Play free jigsaw puzzles online! Multiple images & difficulty levels. Drag & drop. No download, no ads!',
    url: 'https://onde.la/games/jigsaw/',
    siteName: 'Onde',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: '🧩 Jigsaw Puzzle Online Free - No Download | Onde',
    description:
      'Play free jigsaw puzzles online. Drag & drop, multiple difficulty levels. No download, no ads!',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Script
        id="jigsaw-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(gameJsonLd) }}
      />
      <Script
        id="jigsaw-software-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareAppJsonLd) }}
      />
      {children}
    </>
  );
}
