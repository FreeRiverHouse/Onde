import type { Metadata } from 'next';
import Script from 'next/script';

const gameJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'VideoGame',
  name: 'Sudoku',
  description:
    'Solve number puzzles! Classic Sudoku with multiple difficulty levels. Train your brain for free.',
  url: 'https://onde.la/games/sudoku/',
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
  title: 'Sudoku - Free Online Game | Onde',
  description:
    'Solve number puzzles! Classic Sudoku with multiple difficulty levels. Train your brain for free.',
  keywords: 'sudoku, number puzzle, brain game, logic puzzle',
  openGraph: {
    title: '🎮 Sudoku - Play Free Online!',
    description:
      'Solve number puzzles! Classic Sudoku with multiple difficulty levels. Train your brain for free.',
    url: 'https://onde.la/games/sudoku/',
    siteName: 'Onde',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: '🎮 Sudoku - Free Online Game',
    description:
      'Solve number puzzles! Classic Sudoku with multiple difficulty levels. Train your brain for free.',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Script
        id="sudoku-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(gameJsonLd) }}
      />
      {children}
    </>
  );
}
