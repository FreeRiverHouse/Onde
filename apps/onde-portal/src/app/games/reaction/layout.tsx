import type { Metadata } from 'next';
import Script from 'next/script';

const gameJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'VideoGame',
  name: 'Reaction Time',
  description:
    'How fast are you? Test your reflexes in this lightning-fast reaction time game!',
  url: 'https://onde.la/games/reaction/',
  genre: ['Arcade'],
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
    suggestedMinAge: 6,
  },
  publisher: {
    '@type': 'Organization',
    name: 'Onde',
    url: 'https://onde.la',
  },
  inLanguage: 'en',
};

export const metadata: Metadata = {
  title: 'Reaction Time - Free Online Game | Onde',
  description:
    'How fast are you? Test your reflexes in this lightning-fast reaction time game!',
  keywords: 'reaction time, reflex test, speed game',
  openGraph: {
    title: '🎮 Reaction Time - Play Free Online!',
    description:
      'How fast are you? Test your reflexes in this lightning-fast reaction time game!',
    url: 'https://onde.la/games/reaction/',
    siteName: 'Onde',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: '🎮 Reaction Time - Free Online Game',
    description:
      'How fast are you? Test your reflexes in this lightning-fast reaction time game!',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Script
        id="reaction-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(gameJsonLd) }}
      />
      {children}
    </>
  );
}
