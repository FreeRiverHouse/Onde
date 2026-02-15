import type { Metadata } from 'next';
import Script from 'next/script';

const gameJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'VideoGame',
  name: 'Memory Game Online Free for Kids',
  description:
    'Play memory card matching game online free. Multiple grid sizes. Fun brain training for kids. Timer, move counter. No download, no ads.',
  url: 'https://onde.la/games/memory/',
  genre: ['Puzzle', 'Educational'],
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
  title: 'Memory Game Online Free for Kids - Match Cards Brain Training | Onde',
  description:
    'Play memory card matching game online free. Multiple grid sizes (4x4 to 8x8). Fun brain training for kids. Timer, move counter, hints. No download, no ads.',
  keywords: [
    'memory game online',
    'memory game online free',
    'memory game online for kids',
    'card matching game',
    'brain training game',
    'memory match free',
    'memory game no ads',
    'kids memory game',
  ],
  openGraph: {
    title: '🧠 Memory Game Online Free for Kids - Brain Training | Onde',
    description:
      'Play memory card matching game online free! Multiple grid sizes. Fun brain training for kids. No download, no ads!',
    url: 'https://onde.la/games/memory/',
    siteName: 'Onde',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: '🧠 Memory Game Online Free for Kids | Onde',
    description:
      'Play memory card matching game free. Brain training for kids. No download, no ads.',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Script
        id="memory-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(gameJsonLd) }}
      />
      {children}
    </>
  );
}
