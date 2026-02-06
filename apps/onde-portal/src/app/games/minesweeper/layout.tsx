import type { Metadata } from 'next';
import Script from 'next/script';

const gameJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'VideoGame',
  name: 'Minesweeper',
  description:
    'Classic logic puzzle! Clear the minefield without hitting a mine. Multiple difficulty levels.',
  url: 'https://onde.la/games/minesweeper/',
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
  title: 'Minesweeper - Free Online Game | Onde',
  description:
    'Classic logic puzzle! Clear the minefield without hitting a mine. Multiple difficulty levels.',
  keywords: 'minesweeper, logic puzzle, strategy game, classic game',
  openGraph: {
    title: '🎮 Minesweeper - Play Free Online!',
    description:
      'Classic logic puzzle! Clear the minefield without hitting a mine. Multiple difficulty levels.',
    url: 'https://onde.la/games/minesweeper/',
    siteName: 'Onde',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: '🎮 Minesweeper - Free Online Game',
    description:
      'Classic logic puzzle! Clear the minefield without hitting a mine. Multiple difficulty levels.',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Script
        id="minesweeper-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(gameJsonLd) }}
      />
      {children}
    </>
  );
}
