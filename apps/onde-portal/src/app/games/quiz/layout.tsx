import type { Metadata } from 'next';
import Script from 'next/script';

const gameJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'VideoGame',
  name: 'Quiz Games for Kids Online Free',
  description:
    'Play fun quiz games for kids online free. Educational trivia, general knowledge, and learning quizzes. No download, no ads. Perfect for classroom or home.',
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


const softwareAppJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Quiz Games for Kids Online Free',
  description:
    'Play fun quiz games for kids online free. Educational trivia, general knowledge, and learning quizzes. No download, no ads. Perfect for classroom or home.',
  url: 'https://onde.la/games/quiz/',
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
  title: 'Quiz Games for Kids Online Free - Fun Trivia & Learning | Onde',
  description:
    'Play fun quiz games for kids online free. Educational trivia, general knowledge, science, history & more. No download, no ads. Perfect for classroom or home.',
  keywords: [
    'quiz games for kids online',
    'quiz games for kids free',
    'trivia games for kids online',
    'educational quiz free',
    'knowledge test for kids',
    'trivia game online',
    'kids trivia free',
    'quiz no ads',
  ],
  openGraph: {
    title: '❓ Quiz Games for Kids Online Free - Trivia & Learning | Onde',
    description:
      'Fun quiz & trivia games for kids online free! Science, history, general knowledge. No download, no ads!',
    url: 'https://onde.la/games/quiz/',
    siteName: 'Onde',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: '❓ Quiz Games for Kids Online Free | Onde',
    description:
      'Fun quiz & trivia games for kids online free! Educational. No download, no ads.',
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
      <Script
        id="quiz-software-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareAppJsonLd) }}
      />
      {children}
    </>
  );
}
