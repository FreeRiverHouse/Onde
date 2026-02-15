import type { Metadata } from 'next';
import Script from 'next/script';

const gameJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'VideoGame',
  name: 'Rhythm Game',
  description:
    'Hit the beats in time with the music! Tap along to catchy tunes and score points for accuracy. A musical challenge for all ages.',
  url: 'https://onde.la/games/rhythm/',
  genre: ['Educational', 'Music'],
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


const softwareAppJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Rhythm Game',
  description:
    'Hit the beats in time with the music! Tap along to catchy tunes and score points for accuracy. A musical challenge for all ages.',
  url: 'https://onde.la/games/rhythm/',
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
  title: 'Rhythm Game - Free Online Music Game | Onde',
  description:
    'Hit the beats in time with the music! Tap along to catchy tunes and score points for accuracy. A musical challenge for all ages.',
  keywords:
    'rhythm game, music game, beat game, tap to music, timing game',
  openGraph: {
    title: '🎶 Rhythm Game - Play Free Online!',
    description:
      'Hit the beats in time with the music! Tap along to catchy tunes and score points.',
    url: 'https://onde.la/games/rhythm/',
    siteName: 'Onde',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: '🎶 Rhythm Game - Free Online Music Game',
    description:
      'Hit the beats in time with the music! A musical challenge for all ages. Free to play.',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Script
        id="rhythm-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(gameJsonLd) }}
      />
      <Script
        id="rhythm-software-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareAppJsonLd) }}
      />
      {children}
    </>
  );
}
