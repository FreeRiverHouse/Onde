import type { Metadata } from 'next';
import Script from 'next/script';

const gameJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'VideoGame',
  name: 'Catch',
  description:
    'Catch falling objects before they hit the ground! Fast reflexes and quick thinking required. A fun arcade challenge for all ages.',
  url: 'https://onde.la/games/catch/',
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

export const metadata: Metadata = {
  title: 'Catch - Free Online Arcade Game | Onde',
  description:
    'Catch falling objects before they hit the ground! Fast reflexes and quick thinking required. A fun arcade challenge for all ages.',
  keywords: 'catch game, falling objects, reflex game, arcade game, kids game',
  openGraph: {
    title: '🎮 Catch - Play Free Online!',
    description:
      'Catch falling objects before they hit the ground! Fast reflexes and quick thinking required.',
    url: 'https://onde.la/games/catch/',
    siteName: 'Onde',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: '🎮 Catch - Free Online Arcade Game',
    description:
      'Catch falling objects before they hit the ground! A fun arcade challenge. Free to play.',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Script
        id="catch-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(gameJsonLd) }}
      />
      {children}
    </>
  );
}
