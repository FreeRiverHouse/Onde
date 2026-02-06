import type { Metadata } from 'next';
import Script from 'next/script';

const gameJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'VideoGame',
  name: 'Simon Says',
  description:
    'Follow the pattern of lights and sounds! Classic Simon memory game that gets harder each round.',
  url: 'https://onde.la/games/simon/',
  genre: ['Puzzle', 'Educational'],
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
  title: 'Simon Says - Free Online Game | Onde',
  description:
    'Follow the pattern of lights and sounds! Classic Simon memory game that gets harder each round.',
  keywords: 'simon says, pattern memory, sequence game',
  openGraph: {
    title: '🎮 Simon Says - Play Free Online!',
    description:
      'Follow the pattern of lights and sounds! Classic Simon memory game that gets harder each round.',
    url: 'https://onde.la/games/simon/',
    siteName: 'Onde',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: '🎮 Simon Says - Free Online Game',
    description:
      'Follow the pattern of lights and sounds! Classic Simon memory game that gets harder each round.',
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
