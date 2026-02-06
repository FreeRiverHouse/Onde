import type { Metadata } from 'next';
import Script from 'next/script';

const gameJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'VideoGame',
  name: 'Hangman',
  description:
    'Guess the hidden word letter by letter! Classic word guessing game with categories and hints. Build your vocabulary while playing.',
  url: 'https://onde.la/games/hangman/',
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
    suggestedMinAge: 5,
  },
  publisher: {
    '@type': 'Organization',
    name: 'Onde',
    url: 'https://onde.la',
  },
  inLanguage: 'en',
};

export const metadata: Metadata = {
  title: 'Hangman - Free Online Word Game | Onde',
  description:
    'Guess the hidden word letter by letter! Classic word guessing game with categories and hints. Build your vocabulary while playing.',
  keywords:
    'hangman, word guessing game, vocabulary game, spelling game, letter game',
  openGraph: {
    title: '🔤 Hangman - Play Free Online!',
    description:
      'Guess the hidden word letter by letter! Classic word guessing game with categories and hints.',
    url: 'https://onde.la/games/hangman/',
    siteName: 'Onde',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: '🔤 Hangman - Free Online Word Game',
    description:
      'Guess the hidden word letter by letter! Classic word guessing game. Free to play.',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Script
        id="hangman-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(gameJsonLd) }}
      />
      {children}
    </>
  );
}
