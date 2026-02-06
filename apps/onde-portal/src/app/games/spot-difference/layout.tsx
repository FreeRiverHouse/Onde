import type { Metadata } from 'next';
import Script from 'next/script';

const gameJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'VideoGame',
  name: 'Spot the Difference',
  description:
    'Compare two pictures and find all the differences! Sharpen your observation skills with increasingly tricky puzzles. Fun for the whole family.',
  url: 'https://onde.la/games/spot-difference/',
  genre: ['Educational', 'Puzzle'],
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
  title: 'Spot the Difference - Free Online Puzzle | Onde',
  description:
    'Compare two pictures and find all the differences! Sharpen your observation skills with increasingly tricky puzzles. Fun for the whole family.',
  keywords:
    'spot the difference, find differences, observation game, visual puzzle, picture puzzle',
  openGraph: {
    title: '🔍 Spot the Difference - Play Free Online!',
    description:
      'Compare two pictures and find all the differences! Sharpen your observation skills.',
    url: 'https://onde.la/games/spot-difference/',
    siteName: 'Onde',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: '🔍 Spot the Difference - Free Online Puzzle',
    description:
      'Compare two pictures and find all the differences! Fun for the whole family. Free to play.',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Script
        id="spot-difference-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(gameJsonLd) }}
      />
      {children}
    </>
  );
}
