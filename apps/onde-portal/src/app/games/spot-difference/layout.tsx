import type { Metadata } from 'next';
import Script from 'next/script';

const gameJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'VideoGame',
  name: 'Spot the Difference',
  description:
    'Find the hidden differences between two pictures! A classic observation game.',
  url: 'https://onde.la/games/spot-difference/',
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
  title: 'Spot the Difference - Free Online Game | Onde',
  description:
    'Find the hidden differences between two pictures! A classic observation game.',
  keywords: 'spot difference, find difference, observation game',
  openGraph: {
    title: '🎮 Spot the Difference - Play Free Online!',
    description:
      'Find the hidden differences between two pictures! A classic observation game.',
    url: 'https://onde.la/games/spot-difference/',
    siteName: 'Onde',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: '🎮 Spot the Difference - Free Online Game',
    description:
      'Find the hidden differences between two pictures! A classic observation game.',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Script
        id="spot-difference-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(gameJsonLd) }}
      />
      {children}
    </>
  );
}
