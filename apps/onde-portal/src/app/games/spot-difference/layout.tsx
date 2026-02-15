import type { Metadata } from 'next';
import Script from 'next/script';

const gameJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'VideoGame',
  name: 'Spot the Difference Game Online Free',
  description:
    'Play spot the difference game online free. Find hidden differences between two images! Fun observation game for kids and adults. No download, no ads.',
  url: 'https://onde.la/games/spot-difference/',
  genre: ['Educational', 'Puzzle'],
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
  name: 'Spot the Difference Game Online Free',
  description:
    'Play spot the difference game online free. Find hidden differences between two images! Fun observation game for kids and adults. No download, no ads.',
  url: 'https://onde.la/games/spot-difference/',
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
  title: 'Spot the Difference Game Online Free - Find Differences for Kids | Onde',
  description:
    'Play spot the difference game online free. Find hidden differences between two images! Fun observation game for kids and adults. No download, no ads.',
  keywords: [
    'spot the difference game online',
    'spot the difference game online for kids',
    'find the difference game online free',
    'spot the difference free',
    'observation game for kids',
    'visual puzzle game',
    'picture puzzle online',
    'spot difference no ads',
  ],
  openGraph: {
    title: '🔍 Spot the Difference Game Online Free for Kids | Onde',
    description:
      'Play spot the difference online free! Find hidden differences between images. Fun for kids & adults. No ads!',
    url: 'https://onde.la/games/spot-difference/',
    siteName: 'Onde',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: '🔍 Spot the Difference Game Online Free | Onde',
    description:
      'Find hidden differences between two images! Fun for kids & adults. No download, no ads.',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Script
        id="spot-difference-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(gameJsonLd) }}
      />
      <Script
        id="spot-difference-software-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareAppJsonLd) }}
      />
      {children}
    </>
  );
}
