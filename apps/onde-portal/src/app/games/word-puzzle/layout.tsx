import type { Metadata } from 'next';
import Script from 'next/script';

const gameJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'VideoGame',
  name: 'Word Puzzle Games Online Free',
  description:
    'Play free word puzzle games online. Build vocabulary, solve word challenges, and learn new words. Educational fun for kids. No download, no ads.',
  url: 'https://onde.la/games/word-puzzle/',
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
  name: 'Word Puzzle Games Online Free',
  description:
    'Play free word puzzle games online. Build vocabulary, solve word challenges, and learn new words. Educational fun for kids. No download, no ads.',
  url: 'https://onde.la/games/word-puzzle/',
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
  title: 'Word Puzzle Games Online Free - Vocabulary Builder for Kids | Onde',
  description:
    'Play free word puzzle games online. Unscramble letters, find hidden words, build vocabulary & spelling skills. Educational fun for kids. No download, no ads.',
  keywords: [
    'word puzzle games online',
    'word puzzle games online free',
    'word puzzle games online for kids',
    'word scramble game',
    'vocabulary builder game',
    'spelling game for kids',
    'word game free',
    'word puzzle no ads',
  ],
  openGraph: {
    title: '📝 Word Puzzle Games Online Free - For Kids | Onde',
    description:
      'Play free word puzzle games online! Build vocabulary & spelling skills. Educational fun for kids. No ads!',
    url: 'https://onde.la/games/word-puzzle/',
    siteName: 'Onde',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: '📝 Word Puzzle Games Online Free for Kids | Onde',
    description:
      'Free word puzzle games online. Build vocabulary & spelling skills. No download, no ads.',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Script
        id="word-puzzle-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(gameJsonLd) }}
      />
      <Script
        id="word-puzzle-software-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareAppJsonLd) }}
      />
      {children}
    </>
  );
}
