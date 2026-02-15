import type { Metadata } from 'next';
import Script from 'next/script';

const gameJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'VideoGame',
  name: '2048 Game Online Free',
  description:
    'Play 2048 online free. Swipe to merge tiles and reach 2048! Addictive number puzzle game. No download, no ads.',
  url: 'https://onde.la/games/2048/',
  genre: ['Educational', 'Math'],
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
  name: '2048 Game Online Free',
  description:
    'Play 2048 online free. Swipe to merge tiles and reach 2048! Addictive number puzzle game. No download, no ads.',
  url: 'https://onde.la/games/2048/',
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
  title: '2048 Game Online Free - Play the Number Puzzle No Download | Onde',
  description:
    'Play 2048 online free - the addictive number puzzle game. Swipe to merge tiles and reach 2048! Undo button, high score tracking. No download, no ads.',
  keywords: [
    '2048 game online',
    '2048 game online free',
    '2048 game online free no download',
    '2048 number puzzle',
    '2048 math game',
    '2048 brain teaser',
    '2048 sliding puzzle',
    '2048 for kids',
    '2048 no ads',
  ],
  openGraph: {
    title: '🔢 2048 Game Online Free - Number Puzzle No Download | Onde',
    description:
      'Play 2048 online free! Swipe to merge tiles and reach 2048. Undo button, high scores. No download, no ads!',
    url: 'https://onde.la/games/2048/',
    siteName: 'Onde',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: '🔢 2048 Game Online Free - No Download | Onde',
    description:
      'Play 2048 online free - merge tiles to reach 2048! No download, no ads. Addictive number puzzle.',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Script
        id="2048-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(gameJsonLd) }}
      />
      <Script
        id="2048-software-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareAppJsonLd) }}
      />
      {children}
    </>
  );
}
