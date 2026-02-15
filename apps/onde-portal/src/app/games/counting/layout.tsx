import type { Metadata } from 'next';
import Script from 'next/script';

const gameJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'VideoGame',
  name: 'Counting Game for Kids Online Free',
  description:
    'Free counting game for kids online. Learn numbers with fun interactive challenges. Perfect for preschool and early learners. No download, no ads.',
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


const softwareAppJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Counting Game for Kids Online Free',
  description:
    'Free counting game for kids online. Learn numbers with fun interactive challenges. Perfect for preschool and early learners. No download, no ads.',
  url: 'https://onde.la/games/counting/',
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
  title: 'Counting Game for Kids Online Free - Learn Numbers 1-100 | Onde',
  description:
    'Free counting game for kids online. Learn numbers 1-20 with colorful objects and fun animations. Interactive, engaging. Perfect for preschool and early learners. No download, no ads.',
  keywords: [
    'counting game for kids',
    'counting game for kids online',
    'number game for kids online',
    'learn numbers game',
    'preschool counting game',
    'kids counting free',
    'number recognition game',
    'counting no ads',
  ],
  openGraph: {
    title: '🔢 Counting Game for Kids Online Free - Learn Numbers | Onde',
    description:
      'Free counting game for kids! Learn numbers with fun interactive challenges. Perfect for preschool. No download, no ads!',
    url: 'https://onde.la/games/counting/',
    siteName: 'Onde',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: '🔢 Counting Game for Kids Free Online | Onde',
    description:
      'Free counting game for kids. Learn numbers interactively. Perfect for preschool. No download, no ads.',
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
      <Script
        id="counting-software-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareAppJsonLd) }}
      />
      {children}
    </>
  );
}
