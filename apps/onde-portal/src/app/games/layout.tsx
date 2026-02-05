import type { Metadata } from 'next';
import Script from 'next/script';

// Structured data for games collection
const gamesJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: 'Onde Arcade - Educational Games for Kids',
  description: 'Fun educational games for kids! Math, words, puzzles, memory, drawing, music and more.',
  url: 'https://onde.la/games/arcade/',
  publisher: {
    '@type': 'Organization',
    name: 'Onde',
    url: 'https://onde.la',
  },
  hasPart: [
    {
      '@type': 'VideoGame',
      name: 'Math Quest',
      description: 'Fun math adventures for kids',
      url: 'https://onde.la/games/math/',
      genre: ['Educational', 'Math'],
      audience: { '@type': 'PeopleAudience', suggestedMinAge: 4 },
    },
    {
      '@type': 'VideoGame',
      name: 'ABC Fun',
      description: 'Learn the alphabet with fun games',
      url: 'https://onde.la/games/alphabet/',
      genre: ['Educational', 'Language'],
      audience: { '@type': 'PeopleAudience', suggestedMinAge: 3 },
    },
    {
      '@type': 'VideoGame',
      name: 'Memory',
      description: 'Match the pairs memory game',
      url: 'https://onde.la/games/memory/',
      genre: ['Educational', 'Puzzle'],
      audience: { '@type': 'PeopleAudience', suggestedMinAge: 3 },
    },
  ],
};

export const metadata: Metadata = {
  title: 'Onde Arcade - Educational Games for Kids | Onde',
  description: 'Fun educational games for kids! Math, words, puzzles, memory, drawing, music and more. Safe and ad-free learning games.',
  keywords: [
    'educational games for kids',
    'learning games',
    'kids games',
    'safe games for children',
    'math games',
    'puzzle games',
    'memory games',
    'drawing games',
  ],
  openGraph: {
    title: '🎮 Onde Arcade - Educational Games for Kids!',
    description: 'Fun educational games for children. Math, words, puzzles, memory, drawing, music and more. Safe and ad-free!',
    url: 'https://onde.la/games/arcade/',
    siteName: 'Onde',
    images: [
      {
        url: '/images/og-games.png',
        width: 1200,
        height: 630,
        alt: 'Onde Arcade - Educational Games for Kids',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '🎮 Onde Arcade - Educational Games for Kids!',
    description: 'Fun educational games for children. Safe and ad-free!',
    images: ['/images/og-games.png'],
    creator: '@Onde_FRH',
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: 'https://onde.la/games/arcade/',
  },
};

export default function GamesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Script
        id="games-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(gamesJsonLd) }}
      />
      {children}
    </>
  );
}
