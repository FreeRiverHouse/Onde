import type { Metadata } from 'next';
import Script from 'next/script';

const gameJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'VideoGame',
  name: 'Typing Practice',
  description:
    'Learn to type faster! Fun typing exercises to improve your keyboard skills.',
  url: 'https://onde.la/games/typing/',
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
  title: 'Typing Practice - Free Online Game | Onde',
  description:
    'Learn to type faster! Fun typing exercises to improve your keyboard skills.',
  keywords: 'typing practice, learn typing, keyboard skills',
  openGraph: {
    title: '🎮 Typing Practice - Play Free Online!',
    description:
      'Learn to type faster! Fun typing exercises to improve your keyboard skills.',
    url: 'https://onde.la/games/typing/',
    siteName: 'Onde',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: '🎮 Typing Practice - Free Online Game',
    description:
      'Learn to type faster! Fun typing exercises to improve your keyboard skills.',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Script
        id="typing-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(gameJsonLd) }}
      />
      {children}
    </>
  );
}
