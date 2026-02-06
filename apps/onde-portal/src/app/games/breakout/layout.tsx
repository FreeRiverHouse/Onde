import type { Metadata } from 'next';
import Script from 'next/script';

const gameJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'VideoGame',
  name: 'Breakout',
  description:
    'Smash bricks with a bouncing ball! Classic arcade breakout game with power-ups and multiple levels. Free online, no download.',
  url: 'https://onde.la/games/breakout/',
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
  title: 'Breakout - Free Online Game | Onde',
  description:
    'Smash bricks with a bouncing ball! Classic arcade breakout game with power-ups and multiple levels. Free online, no download.',
  keywords: 'breakout game, brick breaker, arcade game',
  openGraph: {
    title: '🎮 Breakout - Play Free Online!',
    description:
      'Smash bricks with a bouncing ball! Classic arcade breakout game with power-ups and multiple levels. Free online, no download.',
    url: 'https://onde.la/games/breakout/',
    siteName: 'Onde',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: '🎮 Breakout - Free Online Game',
    description:
      'Smash bricks with a bouncing ball! Classic arcade breakout game with power-ups and multiple levels. Free online, no download.',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Script
        id="breakout-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(gameJsonLd) }}
      />
      {children}
    </>
  );
}
