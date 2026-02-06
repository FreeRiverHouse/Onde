import type { Metadata } from 'next';
import Script from 'next/script';

const gameJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'VideoGame',
  name: 'Scratch Card',
  description:
    'Scratch and reveal hidden surprises! Virtual scratch cards with fun themes and prizes. Exciting instant-win feeling for kids.',
  url: 'https://onde.la/games/scratch/',
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
  title: 'Scratch Card - Free Online Fun | Onde',
  description:
    'Scratch and reveal hidden surprises! Virtual scratch cards with fun themes and prizes. Exciting instant-win feeling for kids.',
  keywords:
    'scratch card, scratch off, reveal game, surprise game, kids game',
  openGraph: {
    title: '🎫 Scratch Card - Play Free Online!',
    description:
      'Scratch and reveal hidden surprises! Virtual scratch cards with fun themes and prizes.',
    url: 'https://onde.la/games/scratch/',
    siteName: 'Onde',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: '🎫 Scratch Card - Free Online Fun',
    description:
      'Scratch and reveal hidden surprises! Exciting instant-win feeling. Free to play.',
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
