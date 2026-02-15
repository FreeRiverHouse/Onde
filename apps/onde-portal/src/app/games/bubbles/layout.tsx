import type { Metadata } from 'next';
import Script from 'next/script';

const gameJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'VideoGame',
  name: 'Bubbles',
  description:
    'Tap and pop floating bubbles before they fly away! Relaxing and fun for toddlers and young kids. Trains hand-eye coordination.',
  url: 'https://onde.la/games/bubbles/',
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
    suggestedMinAge: 2,
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
  name: 'Bubbles',
  description:
    'Tap and pop floating bubbles before they fly away! Relaxing and fun for toddlers and young kids. Trains hand-eye coordination.',
  url: 'https://onde.la/games/bubbles/',
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
  title: 'Bubbles - Fun Popping Game for Kids | Onde',
  description:
    'Tap and pop floating bubbles before they fly away! Relaxing and fun for toddlers and young kids. Trains hand-eye coordination.',
  keywords:
    'bubbles game, pop bubbles, toddler game, baby game, hand-eye coordination',
  openGraph: {
    title: '🫧 Bubbles - Fun Popping Game for Kids!',
    description:
      'Tap and pop floating bubbles! Relaxing and fun for toddlers and young kids.',
    url: 'https://onde.la/games/bubbles/',
    siteName: 'Onde',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: '🫧 Bubbles - Fun Popping Game for Kids',
    description:
      'Tap and pop floating bubbles! Relaxing and fun for toddlers and young kids. Free to play.',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Script
        id="bubbles-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(gameJsonLd) }}
      />
      <Script
        id="bubbles-software-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareAppJsonLd) }}
      />
      {children}
    </>
  );
}
