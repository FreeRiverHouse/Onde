import type { Metadata } from 'next';
import Script from 'next/script';

const gameJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'VideoGame',
  name: 'Snake Game Online Free',
  description:
    'Play Snake online free! Classic snake game - eat food, grow longer, don\'t hit walls. Retro arcade fun for kids and adults. No download, no ads.',
  url: 'https://onde.la/games/snake/',
  genre: ['Arcade', 'Retro'],
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
  name: 'Snake Game Online Free',
  description:
    'Play the classic Snake game online for free. Control the snake, eat food, grow longer! Touch controls for mobile. No download needed.',
  url: 'https://onde.la/games/snake/',
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
  title: 'Snake Game Online Free - Play Classic Snake No Download | Onde',
  description:
    'Play Snake online free - the classic arcade game! Control the snake, eat food, grow longer. Touch controls for mobile. High scores. No download, no ads.',
  keywords: [
    'snake game',
    'snake game online',
    'snake game online free',
    'play snake',
    'classic snake game',
    'snake game no download',
    'snake game for kids',
    'retro snake game',
    'snake game browser',
    'google snake game',
  ],
  openGraph: {
    title: '🐍 Snake Game Online Free - Classic Arcade | Onde',
    description:
      'Play Snake online free! Classic arcade game - eat food, grow longer, beat your high score. Touch controls for mobile. No download!',
    url: 'https://onde.la/games/snake/',
    siteName: 'Onde',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: '🐍 Snake Game Online Free - No Download | Onde',
    description:
      'Play the classic Snake game online free. Control the snake, eat food, grow longer! No download, no ads.',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Script
        id="snake-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(gameJsonLd) }}
      />
      <Script
        id="snake-software-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareAppJsonLd) }}
      />
      {children}
    </>
  );
}
