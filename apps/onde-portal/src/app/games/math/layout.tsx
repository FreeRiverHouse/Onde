import type { Metadata } from 'next';
import Script from 'next/script';

const gameJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'VideoGame',
  name: 'Math Challenge',
  description:
    'Test your math skills with fun arithmetic puzzles! Addition, subtraction, multiplication and division.',
  url: 'https://onde.la/games/math/',
  genre: ['Educational'],
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
  title: 'Math Challenge - Free Online Game | Onde',
  description:
    'Test your math skills with fun arithmetic puzzles! Addition, subtraction, multiplication and division.',
  keywords: 'math game, arithmetic, educational math',
  openGraph: {
    title: '🎮 Math Challenge - Play Free Online!',
    description:
      'Test your math skills with fun arithmetic puzzles! Addition, subtraction, multiplication and division.',
    url: 'https://onde.la/games/math/',
    siteName: 'Onde',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: '🎮 Math Challenge - Free Online Game',
    description:
      'Test your math skills with fun arithmetic puzzles! Addition, subtraction, multiplication and division.',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Script
        id="math-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(gameJsonLd) }}
      />
      {children}
    </>
  );
}
