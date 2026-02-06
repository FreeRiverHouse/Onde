import type { Metadata } from 'next';
import Script from 'next/script';

const gameJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'VideoGame',
  name: 'Whack-a-Mole',
  description:
    'Whack the moles as they pop up! A fast-paced arcade classic that tests your reflexes.',
  url: 'https://onde.la/games/whack/',
  genre: ['Arcade'],
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
  title: 'Whack-a-Mole - Free Online Game | Onde',
  description:
    'Whack the moles as they pop up! A fast-paced arcade classic that tests your reflexes.',
  keywords: 'whack a mole, arcade game, reflex game',
  openGraph: {
    title: '🎮 Whack-a-Mole - Play Free Online!',
    description:
      'Whack the moles as they pop up! A fast-paced arcade classic that tests your reflexes.',
    url: 'https://onde.la/games/whack/',
    siteName: 'Onde',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: '🎮 Whack-a-Mole - Free Online Game',
    description:
      'Whack the moles as they pop up! A fast-paced arcade classic that tests your reflexes.',
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
      {children}
    </>
  );
}
