import type { Metadata } from 'next';
import Script from 'next/script';

const gameJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'VideoGame',
  name: 'Bubble Pop',
  description:
    'Pop colorful bubbles by matching three or more! Satisfying chain reactions and special combos. Fun for all ages.',
  url: 'https://onde.la/games/bubble-pop/',
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
    suggestedMinAge: 3,
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
  name: 'Bubble Pop',
  description:
    'Pop colorful bubbles by matching three or more! Satisfying chain reactions and special combos. Fun for all ages.',
  url: 'https://onde.la/games/bubble-pop/',
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
  title: 'Bubble Pop - Free Online Game | Onde',
  description:
    'Pop colorful bubbles by matching three or more! Satisfying chain reactions and special combos. Fun for all ages.',
  keywords:
    'bubble pop, bubble shooter, match 3, casual game, kids game',
  openGraph: {
    title: '🫧 Bubble Pop - Play Free Online!',
    description:
      'Pop colorful bubbles by matching three or more! Satisfying chain reactions and special combos.',
    url: 'https://onde.la/games/bubble-pop/',
    siteName: 'Onde',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: '🫧 Bubble Pop - Free Online Game',
    description:
      'Pop colorful bubbles by matching three or more! Fun for all ages. Free to play.',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Script
        id="bubble-pop-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(gameJsonLd) }}
      />
      <Script
        id="bubble-pop-software-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareAppJsonLd) }}
      />
      {children}
    </>
  );
}
