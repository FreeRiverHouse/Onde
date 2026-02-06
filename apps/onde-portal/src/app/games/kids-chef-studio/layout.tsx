import type { Metadata } from 'next';
import Script from 'next/script';

const gameJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'VideoGame',
  name: 'Kids Chef Studio',
  description:
    'Cook delicious virtual recipes! A fun cooking game for kids with step-by-step instructions.',
  url: 'https://onde.la/games/kids-chef-studio/',
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
  title: 'Kids Chef Studio - Free Online Game | Onde',
  description:
    'Cook delicious virtual recipes! A fun cooking game for kids with step-by-step instructions.',
  keywords: 'cooking game, kids chef, kitchen game',
  openGraph: {
    title: '🎮 Kids Chef Studio - Play Free Online!',
    description:
      'Cook delicious virtual recipes! A fun cooking game for kids with step-by-step instructions.',
    url: 'https://onde.la/games/kids-chef-studio/',
    siteName: 'Onde',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: '🎮 Kids Chef Studio - Free Online Game',
    description:
      'Cook delicious virtual recipes! A fun cooking game for kids with step-by-step instructions.',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Script
        id="kids-chef-studio-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(gameJsonLd) }}
      />
      {children}
    </>
  );
}
