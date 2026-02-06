import type { Metadata } from 'next';
import Script from 'next/script';

const gameJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'VideoGame',
  name: 'Spin the Wheel',
  description:
    'Spin the colorful wheel and see where it lands! Customize with your own options.',
  url: 'https://onde.la/games/wheel/',
  genre: ['Casual'],
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
  title: 'Spin the Wheel - Free Online Game | Onde',
  description:
    'Spin the colorful wheel and see where it lands! Customize with your own options.',
  keywords: 'spin wheel, fortune wheel, random picker',
  openGraph: {
    title: '🎮 Spin the Wheel - Play Free Online!',
    description:
      'Spin the colorful wheel and see where it lands! Customize with your own options.',
    url: 'https://onde.la/games/wheel/',
    siteName: 'Onde',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: '🎮 Spin the Wheel - Free Online Game',
    description:
      'Spin the colorful wheel and see where it lands! Customize with your own options.',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Script
        id="wheel-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(gameJsonLd) }}
      />
      {children}
    </>
  );
}
