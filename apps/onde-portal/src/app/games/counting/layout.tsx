import type { Metadata } from 'next';
import Script from 'next/script';

const gameJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'VideoGame',
  name: 'Counting Fun',
  description:
    'Learn to count with colorful objects and fun animations! Perfect for preschoolers learning numbers 1-20. Interactive and engaging.',
  url: 'https://onde.la/games/counting/',
  genre: ['Educational', 'Math'],
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

export const metadata: Metadata = {
  title: 'Counting Fun - Learn Numbers for Kids | Onde',
  description:
    'Learn to count with colorful objects and fun animations! Perfect for preschoolers learning numbers 1-20. Interactive and engaging.',
  keywords:
    'counting game, learn numbers, preschool math, kids counting, number recognition',
  openGraph: {
    title: '🔢 Counting Fun - Learn Numbers!',
    description:
      'Learn to count with colorful objects and fun animations! Perfect for preschoolers.',
    url: 'https://onde.la/games/counting/',
    siteName: 'Onde',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: '🔢 Counting Fun - Learn Numbers for Kids',
    description:
      'Learn to count with colorful objects and fun animations! Perfect for preschoolers. Free to play.',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Script
        id="counting-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(gameJsonLd) }}
      />
      {children}
    </>
  );
}
