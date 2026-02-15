import type { Metadata } from 'next';
import Script from 'next/script';

const gameJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'VideoGame',
  name: 'Minesweeper Online Free',
  description:
    'Play Minesweeper online free. Classic mine sweeper game with easy, medium, and hard modes. No download, no ads. Mobile-friendly.',
  url: 'https://onde.la/games/minesweeper/',
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
  title: 'Minesweeper Online Free - Play Classic Mine Sweeper Game | Onde',
  description:
    'Play Minesweeper online free with easy, medium, and hard modes. Classic mine sweeper logic game. No download, no ads. Mobile-friendly with flag mode.',
  keywords: [
    'minesweeper online',
    'minesweeper online free',
    'minesweeper game free',
    'mine sweeper online',
    'minesweeper classic',
    'minesweeper online mobile',
    'logic puzzle free',
    'minesweeper no ads',
  ],
  openGraph: {
    title: '💣 Minesweeper Online Free - Classic Mine Sweeper Game | Onde',
    description:
      'Play Minesweeper online free! Easy, medium & hard modes. Classic logic puzzle. No download, no ads!',
    url: 'https://onde.la/games/minesweeper/',
    siteName: 'Onde',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: '💣 Minesweeper Online Free - Classic Game | Onde',
    description:
      'Play Minesweeper online free. Easy, medium & hard modes. No download, no ads. Mobile-friendly.',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Script
        id="minesweeper-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(gameJsonLd) }}
      />
      {children}
    </>
  );
}
