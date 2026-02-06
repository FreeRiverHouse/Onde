import type { Metadata } from 'next';
import Script from 'next/script';

const gameJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'VideoGame',
  name: 'Lucky Slots',
  description:
    'Spin the reels and match symbols! Fun slot machine game with colorful themes and exciting animations. Kid-friendly with virtual coins.',
  url: 'https://onde.la/games/slots/',
  genre: ['Arcade', 'Casual'],
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

export const metadata: Metadata = {
  title: 'Lucky Slots - Free Online Slot Game | Onde',
  description:
    'Spin the reels and match symbols! Fun slot machine game with colorful themes and exciting animations. Kid-friendly with virtual coins.',
  keywords:
    'slot machine, spin game, matching game, arcade game, fun slots',
  openGraph: {
    title: '🎰 Lucky Slots - Play Free Online!',
    description:
      'Spin the reels and match symbols! Fun slot machine game with colorful themes.',
    url: 'https://onde.la/games/slots/',
    siteName: 'Onde',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: '🎰 Lucky Slots - Free Online Slot Game',
    description:
      'Spin the reels and match symbols! Fun slot machine game. Free to play.',
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
