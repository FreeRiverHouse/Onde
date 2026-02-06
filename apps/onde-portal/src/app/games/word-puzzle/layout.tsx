import type { Metadata } from 'next';
import Script from 'next/script';

const gameJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'VideoGame',
  name: 'Word Puzzle',
  description:
    'Unscramble letters and find hidden words! Engaging word puzzle that builds vocabulary and spelling skills. New challenges every time.',
  url: 'https://onde.la/games/word-puzzle/',
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
    suggestedMinAge: 5,
  },
  publisher: {
    '@type': 'Organization',
    name: 'Onde',
    url: 'https://onde.la',
  },
  inLanguage: 'en',
};

export const metadata: Metadata = {
  title: 'Word Puzzle - Free Online Word Game | Onde',
  description:
    'Unscramble letters and find hidden words! Engaging word puzzle that builds vocabulary and spelling skills. New challenges every time.',
  keywords:
    'word puzzle, word scramble, vocabulary game, spelling game, word search',
  openGraph: {
    title: '🔤 Word Puzzle - Play Free Online!',
    description:
      'Unscramble letters and find hidden words! Engaging word puzzle that builds vocabulary.',
    url: 'https://onde.la/games/word-puzzle/',
    siteName: 'Onde',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: '🔤 Word Puzzle - Free Online Word Game',
    description:
      'Unscramble letters and find hidden words! Builds vocabulary and spelling. Free to play.',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Script
        id="word-puzzle-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(gameJsonLd) }}
      />
      {children}
    </>
  );
}
