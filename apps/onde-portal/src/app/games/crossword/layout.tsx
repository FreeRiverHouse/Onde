import type { Metadata } from 'next';
import Script from 'next/script';

const gameJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'VideoGame',
  name: 'Crossword',
  description:
    'Solve crossword puzzles with kid-friendly clues! Build vocabulary and spelling skills while having fun. New puzzles every time.',
  url: 'https://onde.la/games/crossword/',
  genre: ['Educational', 'Language'],
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
    suggestedMinAge: 6,
  },
  publisher: {
    '@type': 'Organization',
    name: 'Onde',
    url: 'https://onde.la',
  },
  inLanguage: 'en',
};

export const metadata: Metadata = {
  title: 'Crossword Puzzle - Free Online Word Game | Onde',
  description:
    'Solve crossword puzzles with kid-friendly clues! Build vocabulary and spelling skills while having fun. New puzzles every time.',
  keywords:
    'crossword puzzle, word game, vocabulary builder, spelling game, educational puzzle',
  openGraph: {
    title: '✏️ Crossword Puzzle - Play Free Online!',
    description:
      'Solve crossword puzzles with kid-friendly clues! Build vocabulary and spelling skills.',
    url: 'https://onde.la/games/crossword/',
    siteName: 'Onde',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: '✏️ Crossword Puzzle - Free Online Word Game',
    description:
      'Solve crossword puzzles with kid-friendly clues! Build vocabulary and spelling skills. Free to play.',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Script
        id="crossword-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(gameJsonLd) }}
      />
      {children}
    </>
  );
}
