import type { Metadata } from 'next';
import Script from 'next/script';

const gameJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'VideoGame',
  name: 'Pong',
  description:
    'Classic table tennis arcade game! Play Pong online for free. Simple, addictive, timeless.',
  url: 'https://onde.la/games/pong/',
  genre: ['Arcade', 'Educational'],
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


const softwareAppJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Pong',
  description:
    'Classic table tennis arcade game! Play Pong online for free. Simple, addictive, timeless.',
  url: 'https://onde.la/games/pong/',
  applicationCategory: 'GameApplication',
  operatingSystem: 'Web Browser',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
  },
  publisher: {
    '@type': 'Organization',
    name: 'Onde',
    url: 'https://onde.la',
  },
  inLanguage: 'en',
};

export const metadata: Metadata = {
  title: 'Pong - Free Online Game | Onde',
  description:
    'Classic table tennis arcade game! Play Pong online for free. Simple, addictive, timeless.',
  keywords: 'pong game, table tennis, classic arcade, retro game',
  openGraph: {
    title: '🎮 Pong - Play Free Online!',
    description:
      'Classic table tennis arcade game! Play Pong online for free. Simple, addictive, timeless.',
    url: 'https://onde.la/games/pong/',
    siteName: 'Onde',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: '🎮 Pong - Free Online Game',
    description:
      'Classic table tennis arcade game! Play Pong online for free. Simple, addictive, timeless.',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Script
        id="pong-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(gameJsonLd) }}
      />
      <Script
        id="pong-software-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareAppJsonLd) }}
      />
      {children}
    </>
  );
}
