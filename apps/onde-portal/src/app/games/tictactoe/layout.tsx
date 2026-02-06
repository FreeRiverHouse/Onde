import type { Metadata } from 'next';
import Script from 'next/script';

const gameJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'VideoGame',
  name: 'Tic Tac Toe',
  description:
    'Classic X and O game! Play against a friend or challenge the computer.',
  url: 'https://onde.la/games/tictactoe/',
  genre: ['Strategy'],
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
  title: 'Tic Tac Toe - Free Online Game | Onde',
  description:
    'Classic X and O game! Play against a friend or challenge the computer.',
  keywords: 'tic tac toe, noughts and crosses, x and o',
  openGraph: {
    title: '🎮 Tic Tac Toe - Play Free Online!',
    description:
      'Classic X and O game! Play against a friend or challenge the computer.',
    url: 'https://onde.la/games/tictactoe/',
    siteName: 'Onde',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: '🎮 Tic Tac Toe - Free Online Game',
    description:
      'Classic X and O game! Play against a friend or challenge the computer.',
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
