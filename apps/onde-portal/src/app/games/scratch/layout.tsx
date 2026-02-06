import type { Metadata } from 'next';
import Script from 'next/script';

const gameJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'VideoGame',
  name: 'Scratch Card',
  description:
    'Scratch to reveal hidden surprises! A fun digital scratch card experience.',
  url: 'https://onde.la/games/scratch/',
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
  title: 'Scratch Card - Free Online Game | Onde',
  description:
    'Scratch to reveal hidden surprises! A fun digital scratch card experience.',
  keywords: 'scratch card, reveal game, surprise',
  openGraph: {
    title: '🎮 Scratch Card - Play Free Online!',
    description:
      'Scratch to reveal hidden surprises! A fun digital scratch card experience.',
    url: 'https://onde.la/games/scratch/',
    siteName: 'Onde',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: '🎮 Scratch Card - Free Online Game',
    description:
      'Scratch to reveal hidden surprises! A fun digital scratch card experience.',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Script
        id="scratch-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(gameJsonLd) }}
      />
      {children}
    </>
  );
}
