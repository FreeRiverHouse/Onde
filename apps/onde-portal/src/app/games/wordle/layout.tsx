import type { Metadata } from 'next';
import Script from 'next/script';

const gameJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'VideoGame',
  name: 'Wordle',
  description:
    'Guess the five-letter word in six tries! Color-coded hints guide you to the answer. The addictive daily word game everyone loves.',
  url: 'https://onde.la/games/wordle/',
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
  title: 'Wordle - Free Online Word Game | Onde',
  description:
    'Guess the five-letter word in six tries! Color-coded hints guide you to the answer. The addictive daily word game everyone loves.',
  keywords:
    'wordle, word game, five letter word, daily word game, guess the word',
  openGraph: {
    title: '🟩 Wordle - Play Free Online!',
    description:
      'Guess the five-letter word in six tries! Color-coded hints guide you. The addictive word game.',
    url: 'https://onde.la/games/wordle/',
    siteName: 'Onde',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: '🟩 Wordle - Free Online Word Game',
    description:
      'Guess the five-letter word in six tries! The addictive daily word game. Free to play.',
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
