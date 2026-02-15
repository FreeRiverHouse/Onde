import type { Metadata } from 'next';
import Script from 'next/script';

const gameJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'VideoGame',
  name: 'Tic Tac Toe Online Free',
  description:
    'Play Tic Tac Toe online free against the computer or a friend. Classic X and O strategy game. No download, no ads. Perfect for kids!',
  url: 'https://onde.la/games/tictactoe/',
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


const softwareAppJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Tic Tac Toe Online Free',
  description:
    'Play Tic Tac Toe online free against the computer or a friend. Classic X and O strategy game. No download, no ads. Perfect for kids!',
  url: 'https://onde.la/games/tictactoe/',
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
  title: 'Tic Tac Toe Online Free - Play vs Computer or Friends | Onde',
  description:
    'Play Tic Tac Toe online free against the computer or a friend. Classic X and O strategy game. No download, no ads. Perfect for kids!',
  keywords: [
    'tic tac toe online',
    'tic tac toe online free',
    'tic tac toe online vs computer',
    'noughts and crosses online',
    'x and o game free',
    'tic tac toe for kids',
    'strategy game free',
    'tic tac toe no ads',
  ],
  openGraph: {
    title: '❌⭕ Tic Tac Toe Online Free - vs Computer or Friends | Onde',
    description:
      'Play Tic Tac Toe online free vs computer or friends! Classic X and O strategy. No download, no ads!',
    url: 'https://onde.la/games/tictactoe/',
    siteName: 'Onde',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: '❌⭕ Tic Tac Toe Online Free - vs Computer | Onde',
    description:
      'Play Tic Tac Toe online free vs computer or friends! No download, no ads. Fun for kids!',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Script
        id="tictactoe-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(gameJsonLd) }}
      />
      <Script
        id="tictactoe-software-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareAppJsonLd) }}
      />
      {children}
    </>
  );
}
