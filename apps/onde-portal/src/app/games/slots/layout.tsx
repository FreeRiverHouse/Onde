import type { Metadata } from 'next';
import Script from 'next/script';

const gameJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'VideoGame',
  name: 'Lucky Slots',
  description:
    'Spin the reels for fun! A kid-friendly slot machine game with cute symbols.',
  url: 'https://onde.la/games/slots/',
  genre: ['Casual'],
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
  title: 'Lucky Slots - Free Online Game | Onde',
  description:
    'Spin the reels for fun! A kid-friendly slot machine game with cute symbols.',
  keywords: 'slot machine, spin game, lucky game',
  openGraph: {
    title: '🎮 Lucky Slots - Play Free Online!',
    description:
      'Spin the reels for fun! A kid-friendly slot machine game with cute symbols.',
    url: 'https://onde.la/games/slots/',
    siteName: 'Onde',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: '🎮 Lucky Slots - Free Online Game',
    description:
      'Spin the reels for fun! A kid-friendly slot machine game with cute symbols.',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Script
        id="slots-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(gameJsonLd) }}
      />
      {children}
    </>
  );
}
