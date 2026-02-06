import type { Metadata } from 'next';
import Script from 'next/script';

const gameJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'VideoGame',
  name: 'Flappy Bird',
  description:
    'Tap to fly through pipes! Addictive one-button game. How far can you go? Free to play.',
  url: 'https://onde.la/games/flappy/',
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
  title: 'Flappy Bird - Free Online Game | Onde',
  description:
    'Tap to fly through pipes! Addictive one-button game. How far can you go? Free to play.',
  keywords: 'flappy bird, tap game, casual game, addictive game',
  openGraph: {
    title: '🎮 Flappy Bird - Play Free Online!',
    description:
      'Tap to fly through pipes! Addictive one-button game. How far can you go? Free to play.',
    url: 'https://onde.la/games/flappy/',
    siteName: 'Onde',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: '🎮 Flappy Bird - Free Online Game',
    description:
      'Tap to fly through pipes! Addictive one-button game. How far can you go? Free to play.',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Script
        id="flappy-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(gameJsonLd) }}
      />
      {children}
    </>
  );
}
