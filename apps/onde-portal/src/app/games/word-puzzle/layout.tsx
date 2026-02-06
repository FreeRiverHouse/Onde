import type { Metadata } from 'next';
import Script from 'next/script';

const gameJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'VideoGame',
  name: 'Word Puzzle',
  description:
    'Unscramble letters to form words! A fun word game that builds vocabulary.',
  url: 'https://onde.la/games/word-puzzle/',
  genre: ['Puzzle', 'Educational'],
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
  title: 'Word Puzzle - Free Online Game | Onde',
  description:
    'Unscramble letters to form words! A fun word game that builds vocabulary.',
  keywords: 'word puzzle, word scramble, vocabulary game',
  openGraph: {
    title: '🎮 Word Puzzle - Play Free Online!',
    description:
      'Unscramble letters to form words! A fun word game that builds vocabulary.',
    url: 'https://onde.la/games/word-puzzle/',
    siteName: 'Onde',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: '🎮 Word Puzzle - Free Online Game',
    description:
      'Unscramble letters to form words! A fun word game that builds vocabulary.',
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
