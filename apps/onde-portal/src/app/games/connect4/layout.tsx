import type { Metadata } from 'next';
import Script from 'next/script';

const gameJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'VideoGame',
  name: 'Connect Four Online Free',
  description:
    'Play Connect Four online free against the computer or friends. Classic 4-in-a-row strategy game. No download, no ads. Fun for kids and adults!',
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
  title: 'Connect Four Online Free - Play Connect 4 vs Computer | Onde',
  description:
    'Play Connect Four online free against the computer or friends. Classic 4-in-a-row strategy board game. No download, no ads. Fun for kids and adults!',
  keywords: [
    'connect four online',
    'connect four online free',
    'connect four online vs computer',
    'connect 4 online free',
    'four in a row game',
    'strategy board game online',
    'connect four for kids',
    'connect 4 no ads',
  ],
  openGraph: {
    title: '🔴 Connect Four Online Free - Play vs Computer | Onde',
    description:
      'Play Connect Four online free vs computer or friends! Classic 4-in-a-row strategy game. No download, no ads!',
    url: 'https://onde.la/games/connect4/',
    siteName: 'Onde',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: '🔴 Connect Four Online Free - vs Computer | Onde',
    description:
      'Play Connect Four online free vs computer or friends! No download, no ads. Fun for kids!',
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
