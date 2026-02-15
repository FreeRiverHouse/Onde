import type { Metadata } from 'next';
import Script from 'next/script';

const gameJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'VideoGame',
  name: 'Fortune Cookie',
  description:
    'Crack open a virtual fortune cookie and discover your fortune! Fun daily wisdom, lucky numbers, and inspiring messages for kids.',
  url: 'https://onde.la/games/fortune-cookie/',
  genre: ['Educational', 'Casual'],
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
  name: 'Fortune Cookie',
  description:
    'Crack open a virtual fortune cookie and discover your fortune! Fun daily wisdom, lucky numbers, and inspiring messages for kids.',
  url: 'https://onde.la/games/fortune-cookie/',
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
  title: 'Fortune Cookie - Free Online Fun | Onde',
  description:
    'Crack open a virtual fortune cookie and discover your fortune! Fun daily wisdom, lucky numbers, and inspiring messages for kids.',
  keywords:
    'fortune cookie, daily fortune, lucky numbers, fun game, kids game',
  openGraph: {
    title: '🥠 Fortune Cookie - Discover Your Fortune!',
    description:
      'Crack open a virtual fortune cookie! Fun daily wisdom, lucky numbers, and inspiring messages.',
    url: 'https://onde.la/games/fortune-cookie/',
    siteName: 'Onde',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: '🥠 Fortune Cookie - Free Online Fun',
    description:
      'Crack open a virtual fortune cookie and discover your fortune! Free to play.',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Script
        id="fortune-cookie-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(gameJsonLd) }}
      />
      <Script
        id="fortune-cookie-software-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareAppJsonLd) }}
      />
      {children}
    </>
  );
}
