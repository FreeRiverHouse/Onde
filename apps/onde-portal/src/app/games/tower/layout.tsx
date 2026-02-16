import type { Metadata } from 'next';
import Script from 'next/script';

const gameJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'VideoGame',
  name: 'Tower Stack - Block Stacking Game Online Free',
  description:
    'Play Tower Stack online free! Stack blocks as high as you can. Timing-based arcade game. No download, no ads.',
  url: 'https://onde.la/games/tower/',
  genre: ['Arcade', 'Puzzle'],
  gamePlatform: ['Web Browser'],
  applicationCategory: 'Game',
  operatingSystem: 'Any',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  audience: { '@type': 'PeopleAudience', suggestedMinAge: 4 },
  publisher: { '@type': 'Organization', name: 'Onde', url: 'https://onde.la' },
  inLanguage: 'en',
};

const softwareAppJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Tower Stack - Block Stacking Game Online Free',
  description: 'Stack blocks as high as you can! Timing-based arcade game, free in your browser.',
  url: 'https://onde.la/games/tower/',
  applicationCategory: 'GameApplication',
  operatingSystem: 'Web Browser',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  publisher: { '@type': 'Organization', name: 'Onde', url: 'https://onde.la' },
  inLanguage: 'en',
};

export const metadata: Metadata = {
  title: 'Tower Stack - Block Stacking Game Online Free No Download | Onde',
  description:
    'Play Tower Stack online free - stack blocks as high as you can! Timing-based arcade game. Perfect blocks = bonus points. Touch controls for mobile. No download, no ads.',
  keywords: [
    'stacking game',
    'tower building game',
    'block stacking game online',
    'tower game online free',
    'stack game',
    'building game for kids',
    'block tower game',
    'stacking blocks game',
    'tower stack online',
  ],
  openGraph: {
    title: '🏗️ Tower Stack - Block Stacking Game Free | Onde',
    description: 'Stack blocks as high as you can! Timing-based arcade fun. Free, no download!',
    url: 'https://onde.la/games/tower/',
    siteName: 'Onde',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: '🏗️ Tower Stack - Stacking Game Free | Onde',
    description: 'Stack blocks as high as you can! Free arcade game, no download.',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Script id="tower-jsonld" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(gameJsonLd) }} />
      <Script id="tower-software-jsonld" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareAppJsonLd) }} />
      {children}
    </>
  );
}
