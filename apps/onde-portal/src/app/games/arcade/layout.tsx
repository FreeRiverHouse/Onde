import type { Metadata } from 'next';
import Script from 'next/script';

const gameJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'VideoGame',
  name: 'Onde Arcade',
  description:
    'The ultimate arcade hub! Play dozens of free mini-games: classics, puzzles, brain teasers and more. All in one place.',
  url: 'https://onde.la/games/arcade/',
  genre: ['Arcade', 'Educational'],
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
  title: 'Onde Arcade - Free Mini Games Collection | Onde',
  description:
    'The ultimate arcade hub! Play dozens of free mini-games: classics, puzzles, brain teasers and more. All in one place.',
  keywords:
    'arcade games, mini games, free games collection, online arcade, play free',
  openGraph: {
    title: '🕹️ Onde Arcade - Free Mini Games!',
    description:
      'The ultimate arcade hub! Play dozens of free mini-games: classics, puzzles, brain teasers and more.',
    url: 'https://onde.la/games/arcade/',
    siteName: 'Onde',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: '🕹️ Onde Arcade - Free Mini Games Collection',
    description:
      'The ultimate arcade hub! Play dozens of free mini-games. All in one place. Free to play.',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Script
        id="arcade-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(gameJsonLd) }}
      />
      {children}
    </>
  );
}
