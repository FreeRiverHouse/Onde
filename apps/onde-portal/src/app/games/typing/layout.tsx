import type { Metadata } from 'next';
import Script from 'next/script';

const gameJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'VideoGame',
  name: 'Typing Games for Kids Free Online',
  description:
    'Free typing games for kids online. Type falling words before they reach the bottom! Easy to hard difficulty, speed tracking. Learn to type while having fun. No ads.',
  url: 'https://onde.la/games/typing/',
  genre: ['Educational', 'Language'],
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
    suggestedMinAge: 5,
  },
  publisher: {
    '@type': 'Organization',
    name: 'Onde',
    url: 'https://onde.la',
  },
  inLanguage: 'en',
};

export const metadata: Metadata = {
  title: 'Typing Games for Kids Free Online - Learn to Type with Fun | Onde',
  description:
    'Free typing games for kids online. Type falling words before they reach the bottom! Easy to hard difficulty, speed tracking, combos. Learn to type while having fun. No download, no ads.',
  keywords: [
    'typing games for kids',
    'typing games for kids free',
    'typing games for kids online',
    'typing practice online',
    'learn to type for kids',
    'typing speed game',
    'keyboard skills game',
    'typing game free',
    'typing test game online for kids',
    'typing no ads',
  ],
  openGraph: {
    title: '⌨️ Typing Games for Kids Free Online - Learn to Type | Onde',
    description:
      'Free typing games for kids online! Learn to type while having fun. Speed tracking & combos. No download, no ads!',
    url: 'https://onde.la/games/typing/',
    siteName: 'Onde',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: '⌨️ Typing Games for Kids Free Online | Onde',
    description:
      'Free typing games for kids. Learn to type while having fun! No download, no ads.',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Script
        id="typing-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(gameJsonLd) }}
      />
      {children}
    </>
  );
}
