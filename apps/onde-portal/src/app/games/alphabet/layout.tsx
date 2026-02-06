import type { Metadata } from 'next';
import Script from 'next/script';

const gameJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'VideoGame',
  name: 'ABC Fun',
  description:
    'Learn the alphabet with fun interactive games! Trace letters, match sounds, and build vocabulary. Perfect for young learners.',
  url: 'https://onde.la/games/alphabet/',
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
    suggestedMinAge: 3,
  },
  publisher: {
    '@type': 'Organization',
    name: 'Onde',
    url: 'https://onde.la',
  },
  inLanguage: 'en',
};

export const metadata: Metadata = {
  title: 'ABC Fun - Learn the Alphabet | Onde',
  description:
    'Learn the alphabet with fun interactive games! Trace letters, match sounds, and build vocabulary. Perfect for young learners.',
  keywords:
    'alphabet game, learn ABC, letter tracing, phonics game, kids education',
  openGraph: {
    title: '🔤 ABC Fun - Learn the Alphabet!',
    description:
      'Learn the alphabet with fun interactive games! Trace letters, match sounds, and build vocabulary.',
    url: 'https://onde.la/games/alphabet/',
    siteName: 'Onde',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: '🔤 ABC Fun - Learn the Alphabet',
    description:
      'Learn the alphabet with fun interactive games! Perfect for young learners. Free to play.',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Script
        id="alphabet-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(gameJsonLd) }}
      />
      {children}
    </>
  );
}
