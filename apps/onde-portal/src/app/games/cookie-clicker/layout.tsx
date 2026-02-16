import type { Metadata } from 'next';
import Script from 'next/script';

const gameJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Free Cookie Clicker Game Online - Idle Clicker',
  description:
    'Play Cookie Clicker free online! Click to bake cookies, buy upgrades, hire grandmas, build factories. Addictive idle clicker game. No download, no ads!',
  url: 'https://onde.la/games/cookie-clicker/',
  applicationCategory: 'GameApplication',
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
  title: 'Cookie Clicker Free Online - Idle Clicker Game | Onde',
  description:
    'Play Cookie Clicker free online! Click to bake cookies, buy upgrades, hire grandmas, build cookie factories. Addictive idle clicker game. No download, no ads, works on mobile!',
  keywords: [
    'cookie clicker',
    'cookie clicker free',
    'idle clicker game',
    'clicker game online',
    'cookie clicker online',
    'idle game free',
    'cookie game',
    'baking game online',
    'incremental game',
    'clicker game no download',
    'free idle games',
    'cookie clicker unblocked',
  ],
  openGraph: {
    title: 'Cookie Clicker Free Online - Idle Clicker Game | Onde',
    description:
      'Click to bake cookies, buy upgrades, hire grandmas, build factories! Free idle clicker game online.',
    url: 'https://onde.la/games/cookie-clicker/',
    type: 'website',
    images: [
      {
        url: 'https://onde.la/og-games.png',
        width: 1200,
        height: 630,
        alt: 'Cookie Clicker Game',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cookie Clicker Free Online | Onde',
    description: 'Bake cookies, buy upgrades, build your cookie empire! Free idle game.',
  },
  alternates: {
    canonical: 'https://onde.la/games/cookie-clicker/',
  },
};

export default function CookieClickerLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Script
        id="cookie-clicker-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(gameJsonLd) }}
      />
      {children}
    </>
  );
}
