import type { Metadata } from 'next';
import Script from 'next/script';

const gameJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'VideoGame',
  name: 'Sudoku Online Free - No Ads',
  description:
    'Play Sudoku online free with no ads. Easy, medium, and hard difficulty. Timer, hints, notes mode. No download or signup needed.',
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
  title: 'Sudoku Online Free - Easy, Medium & Hard Puzzles No Ads | Onde',
  description:
    'Play Sudoku online free with no ads. Choose easy, medium, or hard difficulty. Timer, hints, notes mode. No download or signup needed. Clean, ad-free experience.',
  keywords: [
    'sudoku online free',
    'sudoku online free no ads',
    'sudoku online free easy',
    'sudoku online free hard',
    'sudoku game online',
    'sudoku puzzle free',
    'number puzzle online',
    'brain game sudoku',
    'logic puzzle free',
    'sudoku for kids',
  ],
  openGraph: {
    title: '🧩 Sudoku Online Free - Easy, Medium & Hard | No Ads | Onde',
    description:
      'Play Sudoku online free with no ads. Easy, medium & hard difficulty. Timer, hints, notes. No download needed!',
    url: 'https://onde.la/games/sudoku/',
    siteName: 'Onde',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: '🧩 Sudoku Online Free - No Ads | Onde',
    description:
      'Play Sudoku online free with no ads. Easy, medium & hard difficulty. No download or signup needed.',
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
