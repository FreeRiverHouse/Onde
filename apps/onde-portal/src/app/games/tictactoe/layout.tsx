import type { Metadata } from 'next';
import Script from 'next/script';

const gameJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'VideoGame',
  name: 'Tic Tac Toe',
  description:
    'Classic X and O strategy game! Play against the computer or a friend. Simple to learn, fun to master. Three in a row wins!',
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

export const metadata: Metadata = {
  title: 'Tic Tac Toe - Free Online Strategy Game | Onde',
  description:
    'Classic X and O strategy game! Play against the computer or a friend. Simple to learn, fun to master. Three in a row wins!',
  keywords:
    'tic tac toe, noughts and crosses, X and O, strategy game, two player',
  openGraph: {
    title: '❌⭕ Tic Tac Toe - Play Free Online!',
    description:
      'Classic X and O strategy game! Play against the computer or a friend. Three in a row wins!',
    url: 'https://onde.la/games/tictactoe/',
    siteName: 'Onde',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: '❌⭕ Tic Tac Toe - Free Online Strategy Game',
    description:
      'Classic X and O strategy game! Simple to learn, fun to master. Free to play.',
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
      {children}
    </>
  );
}
