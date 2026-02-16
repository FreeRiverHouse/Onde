import type { Metadata } from 'next';
import Script from 'next/script';

const gameJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Free Avatar Creator Online - Character Maker for Kids',
  description:
    'Create your own custom blocky avatar for free! Choose hairstyles, outfits, accessories, pets and more. Download as PNG or share with friends. No login required!',
  url: 'https://onde.la/games/roblox-avatar/',
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
  title: 'Free Avatar Creator Online - Blocky Character Maker for Kids | Onde',
  description:
    'Create your own custom blocky avatar for free! Choose from 12+ hairstyles, 12 face expressions, 8 shirt styles, 12 hats, 10 pets, and more. Download as PNG or share with friends. No download, no ads, no login!',
  keywords: [
    'avatar creator',
    'avatar creator free',
    'avatar maker free',
    'avatar maker online',
    'character creator online',
    'character creator free',
    'blocky avatar maker',
    'avatar creator for kids',
    'custom avatar maker',
    'avatar generator free',
    'character maker online free',
    'avatar designer',
    'create avatar online free',
    'avatar builder',
    'free character creator',
    'online avatar maker no download',
    'roblox avatar creator',
    'roblox avatar maker free',
    'roblox character creator online',
  ],
  openGraph: {
    title: 'Free Avatar Creator Online - Character Maker for Kids | Onde',
    description:
      'Create your own custom blocky avatar! 12+ hairstyles, outfits, hats, pets & more. Download as PNG or share. Free, no login!',
    url: 'https://onde.la/games/roblox-avatar/',
    type: 'website',
    images: [
      {
        url: 'https://onde.la/og-games.png',
        width: 1200,
        height: 630,
        alt: 'Avatar Creator - Free Online Character Maker',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Avatar Creator Online | Onde',
    description: 'Create custom blocky avatars with hairstyles, outfits, accessories & pets! Download as PNG.',
  },
  alternates: {
    canonical: 'https://onde.la/games/roblox-avatar/',
  },
};

export default function RobloxAvatarLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Script
        id="roblox-avatar-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(gameJsonLd) }}
      />
      {children}
    </>
  );
}
