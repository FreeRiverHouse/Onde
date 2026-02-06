import type { Metadata } from 'next';
import Script from 'next/script';

const gameJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'VideoGame',
  name: 'Jigsaw Puzzle',
  description:
    'Drag and drop pieces to complete beautiful jigsaw puzzles! Multiple difficulty levels for all ages.',
  url: 'https://onde.la/games/jigsaw/',
  genre: ['Puzzle'],
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
  title: 'Jigsaw Puzzle - Free Online Game | Onde',
  description:
    'Drag and drop pieces to complete beautiful jigsaw puzzles! Multiple difficulty levels for all ages.',
  keywords: 'jigsaw puzzle, picture puzzle, drag and drop',
  openGraph: {
    title: '🎮 Jigsaw Puzzle - Play Free Online!',
    description:
      'Drag and drop pieces to complete beautiful jigsaw puzzles! Multiple difficulty levels for all ages.',
    url: 'https://onde.la/games/jigsaw/',
    siteName: 'Onde',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: '🎮 Jigsaw Puzzle - Free Online Game',
    description:
      'Drag and drop pieces to complete beautiful jigsaw puzzles! Multiple difficulty levels for all ages.',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Script
        id="jigsaw-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(gameJsonLd) }}
      />
      {children}
    </>
  );
}
