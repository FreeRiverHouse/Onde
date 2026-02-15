import type { Metadata } from 'next';
import Script from 'next/script';

const gameJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'VideoGame',
  name: 'Moonlight Magic House',
  description:
    'Explore a magical house full of surprises and interactive rooms! A cozy adventure game.',
  url: 'https://onde.la/games/moonlight-magic-house/',
  genre: ['Adventure', 'Educational'],
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
  name: 'Moonlight Magic House',
  description:
    'Explore a magical house full of surprises and interactive rooms! A cozy adventure game.',
  url: 'https://onde.la/games/moonlight-magic-house/',
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
  title: 'Moonlight Magic House - Free Online Game | Onde',
  description:
    'Explore a magical house full of surprises and interactive rooms! A cozy adventure game.',
  keywords: 'magic house, exploration, adventure game',
  openGraph: {
    title: '🎮 Moonlight Magic House - Play Free Online!',
    description:
      'Explore a magical house full of surprises and interactive rooms! A cozy adventure game.',
    url: 'https://onde.la/games/moonlight-magic-house/',
    siteName: 'Onde',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: '🎮 Moonlight Magic House - Free Online Game',
    description:
      'Explore a magical house full of surprises and interactive rooms! A cozy adventure game.',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Script
        id="moonlight-magic-house-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(gameJsonLd) }}
      />
      <Script
        id="moonlight-magic-house-software-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareAppJsonLd) }}
      />
      {children}
    </>
  );
}
