import type { Metadata } from 'next';
import Script from 'next/script';

const gameJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'VideoGame',
  name: 'Whack-a-Mole',
  description:
    'Whack the moles as they pop up from their holes! Classic arcade reflex game with faster rounds and bonus targets. Test your speed!',
  url: 'https://onde.la/games/whack/',
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
  name: 'Whack-a-Mole',
  description:
    'Whack the moles as they pop up from their holes! Classic arcade reflex game with faster rounds and bonus targets. Test your speed!',
  url: 'https://onde.la/games/whack/',
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
  title: 'Whack-a-Mole - Free Online Arcade Game | Onde',
  description:
    'Whack the moles as they pop up from their holes! Classic arcade reflex game with faster rounds and bonus targets. Test your speed!',
  keywords:
    'whack a mole, reflex game, arcade game, tap game, speed game',
  openGraph: {
    title: '🔨 Whack-a-Mole - Play Free Online!',
    description:
      'Whack the moles as they pop up! Classic arcade reflex game with faster rounds.',
    url: 'https://onde.la/games/whack/',
    siteName: 'Onde',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: '🔨 Whack-a-Mole - Free Online Arcade Game',
    description:
      'Whack the moles as they pop up! Classic arcade reflex game. Free to play.',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Script
        id="whack-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(gameJsonLd) }}
      />
      <Script
        id="whack-software-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareAppJsonLd) }}
      />
      {children}
    </>
  );
}
