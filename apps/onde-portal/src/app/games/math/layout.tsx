import type { Metadata } from 'next';
import Script from 'next/script';

const gameJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'VideoGame',
  name: 'Math Games for Kids Free Online',
  description:
    'Free math games for kids online. Practice addition, subtraction, multiplication with timed challenges. Easy to hard difficulty. No ads, no download.',
  url: 'https://onde.la/games/math/',
  genre: ['Educational'],
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
  name: 'Math Games for Kids Free Online',
  description:
    'Free math games for kids online. Practice addition, subtraction, multiplication with timed challenges. Easy to hard difficulty. No ads, no download.',
  url: 'https://onde.la/games/math/',
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
  title: 'Math Games for Kids Free Online - Addition, Subtraction & More | Onde',
  description:
    'Free math games for kids online. Practice addition, subtraction, multiplication with timed challenges. Easy to hard difficulty. No ads, no download needed.',
  keywords: [
    'math games for kids',
    'math games for kids free',
    'math games for kids free online',
    'math games online',
    'addition game for kids',
    'subtraction game for kids',
    'multiplication game',
    'arithmetic game free',
    'educational math game',
    'math no ads',
  ],
  openGraph: {
    title: '➕ Math Games for Kids Free Online | Onde',
    description:
      'Free math games for kids! Practice addition, subtraction, multiplication. Easy to hard. No download, no ads!',
    url: 'https://onde.la/games/math/',
    siteName: 'Onde',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: '➕ Math Games for Kids Free Online | Onde',
    description:
      'Free math games for kids! Practice addition, subtraction, multiplication. No download, no ads.',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Script
        id="math-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(gameJsonLd) }}
      />
      <Script
        id="math-software-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareAppJsonLd) }}
      />
      {children}
    </>
  );
}
