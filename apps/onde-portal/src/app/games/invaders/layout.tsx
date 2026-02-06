import type { Metadata } from 'next';
import Script from 'next/script';

const gameJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'VideoGame',
  name: 'Space Invaders',
  description:
    'Defend Earth from alien invaders! Classic space shooter with waves of enemies. Free to play online.',
  url: 'https://onde.la/games/invaders/',
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
  title: 'Space Invaders - Free Online Game | Onde',
  description:
    'Defend Earth from alien invaders! Classic space shooter with waves of enemies. Free to play online.',
  keywords: 'space invaders, alien shooter, arcade game, retro game',
  openGraph: {
    title: '🎮 Space Invaders - Play Free Online!',
    description:
      'Defend Earth from alien invaders! Classic space shooter with waves of enemies. Free to play online.',
    url: 'https://onde.la/games/invaders/',
    siteName: 'Onde',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: '🎮 Space Invaders - Free Online Game',
    description:
      'Defend Earth from alien invaders! Classic space shooter with waves of enemies. Free to play online.',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Script
        id="invaders-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(gameJsonLd) }}
      />
      {children}
    </>
  );
}
