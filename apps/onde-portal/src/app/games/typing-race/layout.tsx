import type { Metadata } from 'next';
import Script from 'next/script';

const gameJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'VideoGame',
  name: 'Typing Race',
  description:
    'Race against the clock by typing words! Improve your typing speed and accuracy.',
  url: 'https://onde.la/games/typing-race/',
  genre: ['Educational'],
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
  title: 'Typing Race - Free Online Game | Onde',
  description:
    'Race against the clock by typing words! Improve your typing speed and accuracy.',
  keywords: 'typing race, speed typing, keyboard game',
  openGraph: {
    title: '🎮 Typing Race - Play Free Online!',
    description:
      'Race against the clock by typing words! Improve your typing speed and accuracy.',
    url: 'https://onde.la/games/typing-race/',
    siteName: 'Onde',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: '🎮 Typing Race - Free Online Game',
    description:
      'Race against the clock by typing words! Improve your typing speed and accuracy.',
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
