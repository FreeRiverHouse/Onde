import type { Metadata } from 'next';
import Script from 'next/script';

const gameJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'VideoGame',
  name: 'Music Maker',
  description:
    'Create your own music with virtual instruments! Play piano, drums, and more. Explore rhythm and melody in a fun, interactive way.',
  url: 'https://onde.la/games/music/',
  genre: ['Educational', 'Music'],
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
  title: 'Music Maker - Free Online Music Game | Onde',
  description:
    'Create your own music with virtual instruments! Play piano, drums, and more. Explore rhythm and melody in a fun, interactive way.',
  keywords:
    'music game, virtual instruments, piano game, kids music, rhythm game',
  openGraph: {
    title: '🎵 Music Maker - Create Music Online!',
    description:
      'Create your own music with virtual instruments! Play piano, drums, and more.',
    url: 'https://onde.la/games/music/',
    siteName: 'Onde',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: '🎵 Music Maker - Free Online Music Game',
    description:
      'Create your own music with virtual instruments! Explore rhythm and melody. Free to play.',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Script
        id="music-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(gameJsonLd) }}
      />
      {children}
    </>
  );
}
