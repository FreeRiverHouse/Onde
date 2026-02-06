import type { Metadata } from 'next';
import Script from 'next/script';

const gameJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'VideoGame',
  name: 'Sliding Puzzle',
  description:
    'Slide tiles into the correct order to complete the picture! Classic sliding puzzle with multiple images and sizes. Train your spatial skills.',
  url: 'https://onde.la/games/puzzle/',
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
  title: 'Sliding Puzzle - Free Online Puzzle Game | Onde',
  description:
    'Slide tiles into the correct order to complete the picture! Classic sliding puzzle with multiple images and sizes. Train your spatial skills.',
  keywords:
    'sliding puzzle, tile puzzle, picture puzzle, brain game, spatial reasoning',
  openGraph: {
    title: '🧩 Sliding Puzzle - Play Free Online!',
    description:
      'Slide tiles into the correct order to complete the picture! Classic sliding puzzle.',
    url: 'https://onde.la/games/puzzle/',
    siteName: 'Onde',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: '🧩 Sliding Puzzle - Free Online Puzzle Game',
    description:
      'Slide tiles into the correct order! Classic sliding puzzle. Free to play.',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Script
        id="puzzle-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(gameJsonLd) }}
      />
      {children}
    </>
  );
}
