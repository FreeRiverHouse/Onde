import type { Metadata } from 'next';
import Script from 'next/script';

const gameJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'VideoGame',
  name: 'Simon Says',
  description:
    'Follow the pattern of lights and sounds! Classic Simon memory game that gets harder with each round. How long can you remember?',
  url: 'https://onde.la/games/simon/',
  genre: ['Educational', 'Puzzle'],
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
  title: 'Simon Says - Free Online Memory Game | Onde',
  description:
    'Follow the pattern of lights and sounds! Classic Simon memory game that gets harder with each round. How long can you remember?',
  keywords:
    'simon says, simon game, pattern memory, sequence game, memory challenge',
  openGraph: {
    title: '🔴🟢🔵🟡 Simon Says - Play Free Online!',
    description:
      'Follow the pattern of lights and sounds! Classic Simon memory game. How long can you remember?',
    url: 'https://onde.la/games/simon/',
    siteName: 'Onde',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: '🔴🟢🔵🟡 Simon Says - Free Online Memory Game',
    description:
      'Follow the pattern of lights and sounds! Classic Simon memory game. Free to play.',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Script
        id="simon-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(gameJsonLd) }}
      />
      {children}
    </>
  );
}
