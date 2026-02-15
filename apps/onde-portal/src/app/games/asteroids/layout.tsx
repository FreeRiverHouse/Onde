import type { Metadata } from 'next';
import Script from 'next/script';

const gameJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'VideoGame',
  name: 'Asteroids',
  description:
    'Navigate through space and destroy asteroids! Classic vector-style arcade game. Free online.',
  url: 'https://onde.la/games/asteroids/',
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
  name: 'Asteroids',
  description:
    'Navigate through space and destroy asteroids! Classic vector-style arcade game. Free online.',
  url: 'https://onde.la/games/asteroids/',
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
  title: 'Asteroids - Free Online Game | Onde',
  description:
    'Navigate through space and destroy asteroids! Classic vector-style arcade game. Free online.',
  keywords: 'asteroids game, space shooter, arcade classic, retro game',
  openGraph: {
    title: '🎮 Asteroids - Play Free Online!',
    description:
      'Navigate through space and destroy asteroids! Classic vector-style arcade game. Free online.',
    url: 'https://onde.la/games/asteroids/',
    siteName: 'Onde',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: '🎮 Asteroids - Free Online Game',
    description:
      'Navigate through space and destroy asteroids! Classic vector-style arcade game. Free online.',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Script
        id="asteroids-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(gameJsonLd) }}
      />
      <Script
        id="asteroids-software-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareAppJsonLd) }}
      />
      {children}
    </>
  );
}
