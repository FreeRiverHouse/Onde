import type { Metadata } from 'next';
import Script from 'next/script';

const gameJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'VideoGame',
  name: 'Connect 4',
  description:
    'Drop discs to connect four in a row! Classic strategy board game against the computer. Think ahead to win!',
  url: 'https://onde.la/games/connect4/',
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
  title: 'Connect 4 - Free Online Strategy Game | Onde',
  description:
    'Drop discs to connect four in a row! Classic strategy board game against the computer. Think ahead to win!',
  keywords:
    'connect 4, four in a row, strategy game, board game, two player game',
  openGraph: {
    title: '🔴 Connect 4 - Play Free Online!',
    description:
      'Drop discs to connect four in a row! Classic strategy board game. Think ahead to win!',
    url: 'https://onde.la/games/connect4/',
    siteName: 'Onde',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: '🔴 Connect 4 - Free Online Strategy Game',
    description:
      'Drop discs to connect four in a row! Classic strategy board game. Free to play.',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Script
        id="connect4-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(gameJsonLd) }}
      />
      {children}
    </>
  );
}
