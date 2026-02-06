import type { Metadata } from 'next';
import Script from 'next/script';

const gameJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'VideoGame',
  name: 'Quiz Challenge',
  description:
    'Test your knowledge with fun trivia questions! Multiple categories from science to history. Learn something new with every round.',
  url: 'https://onde.la/games/quiz/',
  genre: ['Educational', 'Puzzle'],
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
  title: 'Quiz Challenge - Free Trivia Game | Onde',
  description:
    'Test your knowledge with fun trivia questions! Multiple categories from science to history. Learn something new with every round.',
  keywords:
    'quiz game, trivia, knowledge test, educational quiz, kids trivia',
  openGraph: {
    title: '❓ Quiz Challenge - Play Free Online!',
    description:
      'Test your knowledge with fun trivia questions! Multiple categories. Learn something new every round.',
    url: 'https://onde.la/games/quiz/',
    siteName: 'Onde',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: '❓ Quiz Challenge - Free Trivia Game',
    description:
      'Test your knowledge with fun trivia questions! Learn something new. Free to play.',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Script
        id="quiz-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(gameJsonLd) }}
      />
      {children}
    </>
  );
}
