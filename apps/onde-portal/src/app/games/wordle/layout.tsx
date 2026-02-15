import type { Metadata } from 'next';
import Script from 'next/script';

const gameJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'VideoGame',
  name: 'Wordle Online Free',
  description:
    'Play Wordle online free. Guess the 5-letter word in 6 tries! Color-coded hints, daily challenge + unlimited practice. No download, no ads. Fun for kids & adults.',
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


const softwareAppJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Wordle Online Free',
  description:
    'Play Wordle online free. Guess the 5-letter word in 6 tries! Color-coded hints, daily challenge + unlimited practice. No download, no ads. Fun for kids & adults.',
  url: 'https://onde.la/games/wordle/',
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
  title: 'Wordle Online Free - Play Word Guessing Game for Kids & Adults | Onde',
  description:
    'Play Wordle online free - no download, no ads! Guess the 5-letter word in 6 tries. Daily challenge + unlimited practice mode. Kid-friendly word game for all ages.',
  keywords: [
    'wordle online free',
    'wordle online free for kids',
    'wordle play online',
    'wordle free no download',
    'word guessing game online',
    'wordle game free',
    'five letter word game',
    'daily word game free',
    'wordle for kids',
    'wordle no ads',
  ],
  openGraph: {
    title: '🟩 Wordle Online Free - Word Guessing Game for Kids & Adults | Onde',
    description:
      'Play Wordle online free! Guess the 5-letter word in 6 tries. Daily challenge + unlimited practice. No download, no ads!',
    url: 'https://onde.la/games/wordle/',
    siteName: 'Onde',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: '🟩 Wordle Online Free - Word Guessing Game | Onde',
    description:
      'Play Wordle online free - guess the 5-letter word in 6 tries! No download, no ads. Fun for kids & adults.',
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
      <Script
        id="wordle-software-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareAppJsonLd) }}
      />
      {children}
    </>
  );
}
