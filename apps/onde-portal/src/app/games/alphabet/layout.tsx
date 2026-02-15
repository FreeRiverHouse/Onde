import type { Metadata } from 'next';
import Script from 'next/script';

const gameJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'VideoGame',
  name: 'Alphabet Game for Kids Online Free',
  description:
    'Fun alphabet learning game for kids online. Learn ABC letters with interactive activities. Free, educational, no download, no ads. Perfect for preschool & kindergarten.',
  url: 'https://onde.la/games/alphabet/',
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
  title: 'Alphabet Game for Kids Online Free - Learn ABC Letters | Onde',
  description:
    'Fun alphabet learning game for kids online. Learn ABC letters with interactive activities. Trace letters, match sounds, build vocabulary. Free, no download, no ads. Perfect for preschool & kindergarten.',
  keywords: [
    'alphabet game for kids',
    'alphabet game for kids online',
    'learn ABC letters',
    'letter tracing game',
    'phonics game for kids',
    'alphabet learning free',
    'ABC game for kids',
    'preschool alphabet game',
    'kindergarten letter game',
    'alphabet no ads',
  ],
  openGraph: {
    title: '🔤 Alphabet Game for Kids Online Free - Learn ABC | Onde',
    description:
      'Fun alphabet learning game for kids! Learn ABC letters with interactive activities. Free, no download, no ads!',
    url: 'https://onde.la/games/alphabet/',
    siteName: 'Onde',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: '🔤 Alphabet Game for Kids Free Online | Onde',
    description:
      'Fun alphabet game for kids. Learn ABC letters interactively. Free, no download, no ads.',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Script
        id="alphabet-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(gameJsonLd) }}
      />
      {children}
    </>
  );
}
