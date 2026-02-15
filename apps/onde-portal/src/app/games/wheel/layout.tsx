import type { Metadata } from 'next';
import Script from 'next/script';

const gameJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'VideoGame',
  name: 'Spin the Wheel',
  description:
    'Spin the colorful wheel and see where it lands! Customizable wheel with fun categories and prizes. Great for decisions and party games.',
  url: 'https://onde.la/games/wheel/',
  genre: ['Arcade', 'Casual'],
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
  name: 'Spin the Wheel',
  description:
    'Spin the colorful wheel and see where it lands! Customizable wheel with fun categories and prizes. Great for decisions and party games.',
  url: 'https://onde.la/games/wheel/',
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
  title: 'Spin the Wheel - Free Online Random Picker | Onde',
  description:
    'Spin the colorful wheel and see where it lands! Customizable wheel with fun categories and prizes. Great for decisions and party games.',
  keywords:
    'spin the wheel, random picker, wheel spinner, decision maker, party game',
  openGraph: {
    title: '🎡 Spin the Wheel - Play Free Online!',
    description:
      'Spin the colorful wheel and see where it lands! Customizable wheel with fun categories.',
    url: 'https://onde.la/games/wheel/',
    siteName: 'Onde',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: '🎡 Spin the Wheel - Free Online Random Picker',
    description:
      'Spin the colorful wheel and see where it lands! Great for decisions and fun. Free to play.',
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
      <Script
        id="wheel-software-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareAppJsonLd) }}
      />
      {children}
    </>
  );
}
