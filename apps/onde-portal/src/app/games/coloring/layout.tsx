import type { Metadata } from 'next';
import Script from 'next/script';

const gameJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'VideoGame',
  name: 'Coloring Book',
  description:
    'Express your creativity with a digital coloring book! Choose from beautiful templates, pick colors, and create art. Great for kids.',
  url: 'https://onde.la/games/coloring/',
  genre: ['Educational', 'Creative'],
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
  title: 'Coloring Book - Free Online for Kids | Onde',
  description:
    'Express your creativity with a digital coloring book! Choose from beautiful templates, pick colors, and create art. Great for kids.',
  keywords:
    'coloring book, kids coloring, digital art, creative game, drawing for kids',
  openGraph: {
    title: '🎨 Coloring Book - Free Online for Kids!',
    description:
      'Express your creativity with a digital coloring book! Choose from beautiful templates and create art.',
    url: 'https://onde.la/games/coloring/',
    siteName: 'Onde',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: '🎨 Coloring Book - Free Online for Kids',
    description:
      'Express your creativity with a digital coloring book! Great for kids. Free to play.',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Script
        id="coloring-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(gameJsonLd) }}
      />
      {children}
    </>
  );
}
