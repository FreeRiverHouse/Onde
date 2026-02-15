import type { Metadata } from 'next';
import Script from 'next/script';

const gameJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'VideoGame',
  name: 'Free Crossword Puzzle Online',
  description:
    'Play free crossword puzzles online. Easy to hard difficulty, kid-friendly clues. Educational word game. No download, no ads.',
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
  title: 'Free Crossword Puzzle Online - Easy Word Game for Kids & Adults | Onde',
  description:
    'Play crossword puzzles online free. Easy to hard difficulty with kid-friendly clues. Build vocabulary & spelling skills. No download, no ads. Perfect for kids and families.',
  keywords: [
    'crossword puzzle online free',
    'crossword puzzle online free kids',
    'crossword puzzle online free easy',
    'free crossword puzzle',
    'word game for kids',
    'vocabulary builder game',
    'spelling game online',
    'educational puzzle free',
    'crossword no ads',
  ],
  openGraph: {
    title: '✏️ Free Crossword Puzzle Online - For Kids & Adults | Onde',
    description:
      'Play crossword puzzles online free. Easy to hard difficulty, kid-friendly clues. No download, no ads!',
    url: 'https://onde.la/games/crossword/',
    siteName: 'Onde',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: '✏️ Free Crossword Puzzle Online - For Kids & Adults | Onde',
    description:
      'Play crossword puzzles online free. Easy to hard difficulty, kid-friendly clues. No download, no ads!',
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
