import type { Metadata } from 'next';
import Script from 'next/script';

const gameJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'VideoGame',
  name: 'Dino Runner',
  description:
    'Run, jump, and dodge obstacles with the pixel dinosaur! Chrome-style endless runner. Free online.',
  url: 'https://onde.la/games/dino/',
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
  name: 'Dino Runner',
  description:
    'Run, jump, and dodge obstacles with the pixel dinosaur! Chrome-style endless runner. Free online.',
  url: 'https://onde.la/games/dino/',
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
  title: 'Dino Runner - Free Online Game | Onde',
  description:
    'Run, jump, and dodge obstacles with the pixel dinosaur! Chrome-style endless runner. Free online.',
  keywords: 'dino game, dinosaur runner, chrome dino, endless runner',
  openGraph: {
    title: '🎮 Dino Runner - Play Free Online!',
    description:
      'Run, jump, and dodge obstacles with the pixel dinosaur! Chrome-style endless runner. Free online.',
    url: 'https://onde.la/games/dino/',
    siteName: 'Onde',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: '🎮 Dino Runner - Free Online Game',
    description:
      'Run, jump, and dodge obstacles with the pixel dinosaur! Chrome-style endless runner. Free online.',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Script
        id="dino-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(gameJsonLd) }}
      />
      <Script
        id="dino-software-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareAppJsonLd) }}
      />
      {children}
    </>
  );
}
