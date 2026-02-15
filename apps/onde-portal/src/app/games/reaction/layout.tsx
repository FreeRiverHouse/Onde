import type { Metadata } from 'next';
import Script from 'next/script';

const gameJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'VideoGame',
  name: 'Reaction Time',
  description:
    'How fast are your reflexes? Test your reaction time with this quick-fire challenge! Compete against yourself and beat your best score.',
  url: 'https://onde.la/games/reaction/',
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
  name: 'Reaction Time',
  description:
    'How fast are your reflexes? Test your reaction time with this quick-fire challenge! Compete against yourself and beat your best score.',
  url: 'https://onde.la/games/reaction/',
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
  title: 'Reaction Time Test - Free Online Game | Onde',
  description:
    'How fast are your reflexes? Test your reaction time with this quick-fire challenge! Compete against yourself and beat your best score.',
  keywords:
    'reaction time, reflex test, speed test, reaction game, brain speed',
  openGraph: {
    title: '⚡ Reaction Time Test - Play Free Online!',
    description:
      'How fast are your reflexes? Test your reaction time with this quick-fire challenge!',
    url: 'https://onde.la/games/reaction/',
    siteName: 'Onde',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: '⚡ Reaction Time Test - Free Online Game',
    description:
      'How fast are your reflexes? Test your reaction time! Free to play.',
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
      <Script
        id="reaction-software-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareAppJsonLd) }}
      />
      {children}
    </>
  );
}
