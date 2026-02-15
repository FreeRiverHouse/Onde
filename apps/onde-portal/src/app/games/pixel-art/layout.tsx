import type { Metadata } from 'next';
import Script from 'next/script';

const gameJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Free Pixel Art Maker Online - Minecraft Image to Blocks',
  description:
    'Convert any image to Minecraft block pixel art. Free online pixel art maker with wool, concrete & terracotta palettes. Adjustable grid sizes from 16x16 to 128x128. No ads.',
  url: 'https://onde.la/games/pixel-art/',
  genre: ['Creative', 'Educational'],
  applicationCategory: 'DesignApplication',
  operatingSystem: 'Any',
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

const breadcrumbJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://onde.la' },
    { '@type': 'ListItem', position: 2, name: 'Games', item: 'https://onde.la/games' },
    { '@type': 'ListItem', position: 3, name: 'Pixel Art Generator', item: 'https://onde.la/games/pixel-art/' },
  ],
};


const softwareAppJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Free Pixel Art Maker Online - Minecraft Image to Blocks',
  description:
    'Convert any image to Minecraft block pixel art. Free online pixel art maker with wool, concrete & terracotta palettes. Adjustable grid sizes from 16x16 to 128x128. No ads.',
  url: 'https://onde.la/games/pixel-art/',
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
  title: 'Free Pixel Art Maker Online - Minecraft Image to Blocks Generator | Onde',
  description:
    'Convert any image to Minecraft block pixel art. Free online pixel art maker with wool, concrete & terracotta palettes. Adjustable sizes (16x16 to 128x128). No download, no ads.',
  keywords: [
    'minecraft pixel art generator',
    'minecraft pixel art from image',
    'image to minecraft blocks',
    'minecraft block art generator',
    'minecraft pixel art maker',
    'minecraft pixel art converter',
    'photo to minecraft blocks',
    'minecraft pixel art tool',
    'minecraft pixel art online',
    'minecraft pixel art free',
    'minecraft art generator',
    'image to pixel art minecraft',
    'minecraft block palette',
    'minecraft wool art',
    'minecraft concrete art',
  ],
  openGraph: {
    title: '🎨 Free Pixel Art Maker Online - Minecraft Image to Blocks | Onde',
    description:
      'Convert any image to Minecraft block pixel art. Free online pixel art maker with wool, concrete & terracotta. No download, no ads!',
    url: 'https://onde.la/games/pixel-art/',
    siteName: 'Onde',
    images: [
      {
        url: '/images/og-pixel-art.png',
        width: 1200,
        height: 630,
        alt: 'Minecraft Pixel Art Generator - Convert Images to Blocks',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '🎨 Free Pixel Art Maker Online - Minecraft Image to Blocks | Onde',
    description: 'Convert any image to Minecraft block pixel art. Free online maker, no download, no ads!',
    images: ['/images/og-pixel-art.png'],
    creator: '@Onde_FRH',
  },
  robots: { index: true, follow: true },
  alternates: { canonical: 'https://onde.la/games/pixel-art/' },
};

export default function PixelArtLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Script
        id="pixel-art-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(gameJsonLd) }}
      />
      <Script
        id="pixel-art-breadcrumb"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <Script
        id="pixel-art-software-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareAppJsonLd) }}
      />
      {children}
    </>
  );
}
