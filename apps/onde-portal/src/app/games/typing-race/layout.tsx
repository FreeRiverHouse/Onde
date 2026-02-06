import type { Metadata } from 'next';
import Script from 'next/script';

const gameJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'VideoGame',
  name: 'Typing Race',
  description:
    'Race against time by typing words as fast as you can! Competitive typing game with leaderboards. Can you be the fastest typist?',
  url: 'https://onde.la/games/typing-race/',
  genre: ['Educational', 'Language'],
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
    suggestedMinAge: 6,
  },
  publisher: {
    '@type': 'Organization',
    name: 'Onde',
    url: 'https://onde.la',
  },
  inLanguage: 'en',
};

export const metadata: Metadata = {
  title: 'Typing Race - Free Online Speed Typing Game | Onde',
  description:
    'Race against time by typing words as fast as you can! Competitive typing game with leaderboards. Can you be the fastest typist?',
  keywords:
    'typing race, speed typing, typing competition, WPM test, fast typing game',
  openGraph: {
    title: '🏎️ Typing Race - Play Free Online!',
    description:
      'Race against time by typing words as fast as you can! Can you be the fastest typist?',
    url: 'https://onde.la/games/typing-race/',
    siteName: 'Onde',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: '🏎️ Typing Race - Free Online Speed Typing Game',
    description:
      'Race against time by typing words as fast as you can! Free to play.',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Script
        id="typing-race-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(gameJsonLd) }}
      />
      {children}
    </>
  );
}
