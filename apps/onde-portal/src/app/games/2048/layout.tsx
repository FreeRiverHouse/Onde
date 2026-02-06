import type { Metadata } from 'next';
import Script from 'next/script';

const gameJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'VideoGame',
  name: '2048',
  description:
    'Slide numbered tiles to combine them and reach 2048! Addictive math puzzle game that trains your brain. Free to play online.',
  url: 'https://onde.la/games/2048/',
  genre: ['Educational', 'Math'],
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

export const metadata: Metadata = {
  title: '2048 - Free Online Math Puzzle | Onde',
  description:
    'Slide numbered tiles to combine them and reach 2048! Addictive math puzzle game that trains your brain. Free to play online.',
  keywords: '2048 game, number puzzle, math game, brain teaser, sliding puzzle',
  openGraph: {
    title: '🎮 2048 - Play Free Online!',
    description:
      'Slide numbered tiles to combine them and reach 2048! Addictive math puzzle that trains your brain.',
    url: 'https://onde.la/games/2048/',
    siteName: 'Onde',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: '🎮 2048 - Free Online Math Puzzle',
    description:
      'Slide numbered tiles to combine them and reach 2048! Addictive math puzzle game. Free to play.',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Script
        id="2048-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(gameJsonLd) }}
      />
      {children}
    </>
  );
}
