import type { Metadata } from 'next';
import Script from 'next/script';

const gameJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'VideoGame',
  name: 'Hangman Game Online Free',
  description:
    'Play Hangman online free - guess the word letter by letter! Fun word game for kids and adults. No download, no ads. Educational vocabulary builder.',
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


const softwareAppJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Hangman Game Online Free',
  description:
    'Play Hangman online free - guess the word letter by letter! Fun word game for kids and adults. No download, no ads. Educational vocabulary builder.',
  url: 'https://onde.la/games/hangman/',
  applicationCategory: 'GameApplication',
  operatingSystem: 'Web Browser',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
  },
  publisher: {
    '@type': 'Organization',
    name: 'Onde',
    url: 'https://onde.la',
  },
  inLanguage: 'en',
};

export const metadata: Metadata = {
  title: 'Hangman Game Online Free - Word Guessing Game for Kids | Onde',
  description:
    'Play Hangman online free - guess the word letter by letter! Fun word game for kids and adults with categories and hints. No download, no ads. Educational vocabulary builder.',
  keywords: [
    'hangman game online',
    'hangman game online free',
    'hangman game online for kids',
    'word guessing game',
    'vocabulary game for kids',
    'spelling game online',
    'hangman no ads',
    'hangman free',
  ],
  openGraph: {
    title: '🔤 Hangman Game Online Free - Word Game for Kids | Onde',
    description:
      'Play Hangman online free! Guess the word letter by letter. Categories & hints. No download, no ads!',
    url: 'https://onde.la/games/hangman/',
    siteName: 'Onde',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: '🔤 Hangman Game Online Free for Kids | Onde',
    description:
      'Play Hangman online free! Guess the word letter by letter. Word game for kids. No download, no ads.',
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
      <Script
        id="hangman-software-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareAppJsonLd) }}
      />
      {children}
    </>
  );
}
