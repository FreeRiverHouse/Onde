import type { Metadata } from 'next';
import Script from 'next/script';

// Structured data for games collection
const gamesJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: 'Gaming Island - Free Games for Kids',
  description: 'Play fun educational games for free! Puzzle, memory, drawing, music and more.',
  url: 'https://onde.la/games/',
  publisher: {
    '@type': 'Organization',
    name: 'Onde',
    url: 'https://onde.la',
  },
  hasPart: [
    {
      '@type': 'VideoGame',
      name: 'Moonlight Magic House',
      description: 'Virtual pet house game for kids',
      url: 'https://onde.la/games/moonlight-magic-house/',
      genre: ['Simulation', 'Educational'],
      audience: { '@type': 'PeopleAudience', suggestedMinAge: 4 },
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
    {
      '@type': 'VideoGame',
      name: 'Skin Creator',
      description: 'Create Minecraft skins with AI',
      url: 'https://onde.la/games/skin-creator/',
      genre: ['Creative', 'Design'],
      audience: { '@type': 'PeopleAudience', suggestedMinAge: 6 },
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
    {
      '@type': 'VideoGame',
      name: 'Kids Chef Studio',
      description: 'Fun cooking game for children',
      url: 'https://onde.la/games/kids-chef-studio/',
      genre: ['Simulation', 'Educational'],
      audience: { '@type': 'PeopleAudience', suggestedMinAge: 4 },
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

export const metadata: Metadata = {
  title: 'Gaming Island - Free Games for Kids | Onde',
  description: 'Play fun educational games for free! Puzzle, memory, drawing, music and more. Safe and ad-free gaming for children.',
  keywords: [
    'free games for kids',
    'educational games',
    'kids games online',
    'safe games for children',
    'learning games',
    'puzzle games',
    'memory games',
    'drawing games',
  ],
  openGraph: {
    title: '🏝️ Gaming Island - Free Games for Kids!',
    description: 'Fun educational games for children. Puzzle, memory, drawing, music and more. Safe and ad-free!',
    url: 'https://onde.la/games/',
    siteName: 'Onde',
    images: [
      {
        url: '/images/og-games.png',
        width: 1200,
        height: 630,
        alt: 'Gaming Island - Fun Games for Kids',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '🏝️ Gaming Island - Free Games for Kids!',
    description: 'Fun educational games for children. Safe and ad-free!',
    images: ['/images/og-games.png'],
    creator: '@Onde_FRH',
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: 'https://onde.la/games/',
  },
};

export default function GamesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Script
        id="games-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(gamesJsonLd) }}
      />
      {children}
    </>
  );
}
