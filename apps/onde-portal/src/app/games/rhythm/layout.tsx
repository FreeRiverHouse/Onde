import type { Metadata } from 'next';
import Script from 'next/script';

const gameJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'VideoGame',
  name: 'Rhythm Game',
  description:
    'Hit the notes to the beat! A musical rhythm game that tests your timing.',
  url: 'https://onde.la/games/rhythm/',
  genre: ['Music', 'Arcade'],
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
  title: 'Rhythm Game - Free Online Game | Onde',
  description:
    'Hit the notes to the beat! A musical rhythm game that tests your timing.',
  keywords: 'rhythm game, music beat, timing game',
  openGraph: {
    title: '🎮 Rhythm Game - Play Free Online!',
    description:
      'Hit the notes to the beat! A musical rhythm game that tests your timing.',
    url: 'https://onde.la/games/rhythm/',
    siteName: 'Onde',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: '🎮 Rhythm Game - Free Online Game',
    description:
      'Hit the notes to the beat! A musical rhythm game that tests your timing.',
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
      {children}
    </>
  );
}
