import type { Metadata } from 'next';
import Script from 'next/script';

const gameJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'VideoGame',
  name: 'Maze Runner',
  description:
    'Navigate through challenging mazes! Find the exit before time runs out.',
  url: 'https://onde.la/games/maze/',
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


const softwareAppJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Maze Runner',
  description:
    'Navigate through challenging mazes! Find the exit before time runs out.',
  url: 'https://onde.la/games/maze/',
  applicationCategory: 'GameApplication',
  operatingSystem: 'Web Browser',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
  },
  publisher: {
    '@type': 'Organization',
    name: 'Onde',
    url: 'https://onde.la',
  },
  inLanguage: 'en',
};

export const metadata: Metadata = {
  title: 'Maze Runner - Free Online Game | Onde',
  description:
    'Navigate through challenging mazes! Find the exit before time runs out.',
  keywords: 'maze game, labyrinth, puzzle maze',
  openGraph: {
    title: '🎮 Maze Runner - Play Free Online!',
    description:
      'Navigate through challenging mazes! Find the exit before time runs out.',
    url: 'https://onde.la/games/maze/',
    siteName: 'Onde',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: '🎮 Maze Runner - Free Online Game',
    description:
      'Navigate through challenging mazes! Find the exit before time runs out.',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Script
        id="maze-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(gameJsonLd) }}
      />
      <Script
        id="maze-software-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareAppJsonLd) }}
      />
      {children}
    </>
  );
}
