import type { Metadata } from 'next';
import Script from 'next/script';

const gameJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'VideoGame',
  name: 'Typing Practice',
  description:
    'Improve your typing speed and accuracy! Fun typing exercises with words, sentences, and timed challenges. Track your progress over time.',
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
  title: 'Typing Practice - Free Online Typing Game | Onde',
  description:
    'Improve your typing speed and accuracy! Fun typing exercises with words, sentences, and timed challenges. Track your progress over time.',
  keywords:
    'typing practice, typing game, keyboard skills, typing speed, learn to type',
  openGraph: {
    title: '⌨️ Typing Practice - Play Free Online!',
    description:
      'Improve your typing speed and accuracy! Fun typing exercises with timed challenges.',
    url: 'https://onde.la/games/typing/',
    siteName: 'Onde',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: '⌨️ Typing Practice - Free Online Typing Game',
    description:
      'Improve your typing speed and accuracy! Fun typing exercises. Free to play.',
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
