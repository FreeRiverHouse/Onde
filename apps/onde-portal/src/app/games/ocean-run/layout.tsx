import type { Metadata } from 'next';
import Script from 'next/script';

const gameJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'VideoGame',
  name: 'Ocean Run - Endless Runner Game Online Free',
  description:
    'Play Ocean Run online free! Jump over waves and obstacles in this addictive endless runner game. Like the dinosaur game but on the ocean! No download, no ads.',
  url: 'https://onde.la/games/ocean-run/',
  genre: ['Arcade', 'Endless Runner', 'Action'],
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
  name: 'Ocean Run - Endless Runner Game Online Free',
  description:
    'Addictive endless runner game set in the ocean. Jump, dodge, and run as far as you can! Free browser game, no download needed.',
  url: 'https://onde.la/games/ocean-run/',
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
  title: 'Ocean Run - Endless Runner Game Online Free No Download | Onde',
  description:
    'Play Ocean Run online free - an addictive endless runner game! Jump over waves and obstacles. Like the dinosaur game but on the ocean. Touch controls for mobile. No download, no ads.',
  keywords: [
    'endless runner game',
    'running game online',
    'endless runner game online free',
    'dinosaur game alternative',
    'jump game online',
    'ocean run game',
    'side scrolling game',
    'free running game browser',
    'runner game for kids',
    'dino game online',
  ],
  openGraph: {
    title: '🏃 Ocean Run - Endless Runner Game Online Free | Onde',
    description:
      'Play Ocean Run online free! Jump over waves, dodge obstacles, run as far as you can. Like the dino game but on the ocean! No download!',
    url: 'https://onde.la/games/ocean-run/',
    siteName: 'Onde',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: '🏃 Ocean Run - Endless Runner Free | Onde',
    description:
      'Addictive endless runner game on the ocean! Jump, dodge, and run. Free, no download, no ads.',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Script
        id="ocean-run-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(gameJsonLd) }}
      />
      <Script
        id="ocean-run-software-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareAppJsonLd) }}
      />
      {children}
    </>
  );
}
