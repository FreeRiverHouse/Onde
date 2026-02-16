import type { Metadata } from 'next';
import Script from 'next/script';

const gameJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Free Virtual Pet Game Online - Tamagotchi Style',
  description:
    'Adopt and care for your virtual pet online! Feed, play, clean, and watch it grow. Free Tamagotchi-style pet game. No download, no ads!',
  url: 'https://onde.la/games/virtual-pet/',
  applicationCategory: 'GameApplication',
  operatingSystem: 'Web Browser',
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
  title: 'Free Virtual Pet Game Online - Tamagotchi Style | Onde',
  description:
    'Adopt and care for your virtual pet! Feed, play, clean, and watch it grow and evolve. Free online Tamagotchi-style game. No download, no ads, works on mobile!',
  keywords: [
    'virtual pet game',
    'virtual pet online free',
    'online tamagotchi',
    'pet game for kids',
    'free pet game',
    'virtual pet simulator',
    'tamagotchi online',
    'adopt a pet game',
    'pet care game',
    'digital pet game free',
  ],
  openGraph: {
    title: 'Free Virtual Pet Game Online | Onde',
    description: 'Adopt and care for your virtual pet! Feed, play, and watch it grow. Free online!',
    url: 'https://onde.la/games/virtual-pet/',
    type: 'website',
    images: [{ url: 'https://onde.la/og-games.png', width: 1200, height: 630, alt: 'Virtual Pet Game' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Virtual Pet Game Online | Onde',
    description: 'Adopt your virtual pet! Feed, play, clean, and watch it evolve. Free online!',
  },
  alternates: { canonical: 'https://onde.la/games/virtual-pet/' },
};

export default function VirtualPetLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Script
        id="virtual-pet-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(gameJsonLd) }}
      />
      {children}
    </>
  );
}
