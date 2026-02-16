import type { Metadata } from 'next';
import Script from 'next/script';

const gameJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Free Minecraft Name Generator - Cool Username Ideas',
  description:
    'Generate cool, funny, and unique Minecraft usernames instantly. Over 10,000+ combinations. Choose from cool, funny, pro, cute, and scary styles. Free, no ads!',
  url: 'https://onde.la/games/name-generator/',
  applicationCategory: 'UtilitiesApplication',
  operatingSystem: 'Web Browser',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
  },
  audience: {
    '@type': 'PeopleAudience',
    suggestedMinAge: 6,
  },
  publisher: {
    '@type': 'Organization',
    name: 'Onde',
    url: 'https://onde.la',
  },
  inLanguage: 'en',
};

export const metadata: Metadata = {
  title: 'Free Minecraft Name Generator - Cool, Funny & Unique Usernames | Onde',
  description: 'Generate cool, funny, and unique Minecraft usernames instantly! Over 10,000+ combinations with cool, funny, pro, cute, and scary styles. Copy & use in-game. Free, no ads, no download!',
  keywords: [
    'minecraft name generator',
    'minecraft username generator',
    'cool minecraft names',
    'funny minecraft names',
    'minecraft gamertag generator',
    'minecraft name ideas',
    'unique minecraft usernames',
    'minecraft username ideas',
    'mc name generator',
    'minecraft ign generator',
    'cool gaming names',
    'gaming name generator',
    'minecraft name maker',
    'best minecraft names',
    'epic minecraft usernames',
  ],
  openGraph: {
    title: '⚒️ Free Minecraft Name Generator - Cool & Unique Usernames | Onde',
    description: 'Generate 10,000+ cool, funny, and unique Minecraft usernames instantly. Choose your style, copy, and use in-game!',
    url: 'https://onde.la/games/name-generator/',
    siteName: 'Onde',
    images: [
      {
        url: '/images/og-name-generator.png',
        width: 1200,
        height: 630,
        alt: 'Minecraft Name Generator - Generate Cool Usernames Free',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '⚒️ Free Minecraft Name Generator | Onde',
    description: 'Generate cool, funny & unique Minecraft usernames instantly. 10,000+ combos. Free, no ads!',
    images: ['/images/og-name-generator.png'],
    creator: '@Onde_FRH',
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: 'https://onde.la/games/name-generator/',
  },
};

export default function NameGeneratorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Script
        id="name-generator-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(gameJsonLd) }}
      />
      {children}
    </>
  );
}
