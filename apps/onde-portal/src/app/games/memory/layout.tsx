import type { Metadata } from 'next';
import Script from 'next/script';

const gameJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'VideoGame',
  name: 'Memory Game',
  description:
    'Test your memory with card matching! Find all pairs in the fewest moves possible.',
  url: 'https://onde.la/games/memory/',
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
  title: 'Memory Game - Free Online Game | Onde',
  description:
    'Test your memory with card matching! Find all pairs in the fewest moves possible.',
  keywords: 'memory game, card pairs, brain training',
  openGraph: {
    title: '🎮 Memory Game - Play Free Online!',
    description:
      'Test your memory with card matching! Find all pairs in the fewest moves possible.',
    url: 'https://onde.la/games/memory/',
    siteName: 'Onde',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: '🎮 Memory Game - Free Online Game',
    description:
      'Test your memory with card matching! Find all pairs in the fewest moves possible.',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Script
        id="memory-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(gameJsonLd) }}
      />
      {children}
    </>
  );
}
