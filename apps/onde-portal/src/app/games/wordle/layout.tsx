import type { Metadata } from 'next';
import Script from 'next/script';

const gameJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'VideoGame',
  name: 'Wordle',
  description:
    'Guess the 5-letter word in 6 tries! The viral word guessing game.',
  url: 'https://onde.la/games/wordle/',
  genre: ['Puzzle'],
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
    suggestedMinAge: 8,
  },
  publisher: {
    '@type': 'Organization',
    name: 'Onde',
    url: 'https://onde.la',
  },
  inLanguage: 'en',
};

export const metadata: Metadata = {
  title: 'Wordle - Free Online Game | Onde',
  description:
    'Guess the 5-letter word in 6 tries! The viral word guessing game.',
  keywords: 'wordle, word guess, daily word game',
  openGraph: {
    title: '🎮 Wordle - Play Free Online!',
    description:
      'Guess the 5-letter word in 6 tries! The viral word guessing game.',
    url: 'https://onde.la/games/wordle/',
    siteName: 'Onde',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: '🎮 Wordle - Free Online Game',
    description:
      'Guess the 5-letter word in 6 tries! The viral word guessing game.',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Script
        id="wordle-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(gameJsonLd) }}
      />
      {children}
    </>
  );
}
