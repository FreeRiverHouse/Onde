import type { Metadata } from 'next';
import Script from 'next/script';

const gameJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Minecraft Banner Maker Online Free',
  description:
    'Create custom Minecraft banners free online. Design banners with 16 colors, 40+ patterns, crafting recipes. Compatible with Java & Bedrock 1.21. No ads.',
  url: 'https://onde.la/games/banner-maker/',
  genre: ['Educational', 'Creative'],
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
    { '@type': 'ListItem', position: 3, name: 'Banner Maker', item: 'https://onde.la/games/banner-maker/' },
  ],
};


const softwareAppJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Minecraft Banner Maker Online Free',
  description:
    'Create custom Minecraft banners free online. Design banners with 16 colors, 40+ patterns, crafting recipes. Compatible with Java & Bedrock 1.21. No ads.',
  url: 'https://onde.la/games/banner-maker/',
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
  title: 'Minecraft Banner Maker Online Free - Design Banners for Java & Bedrock 1.21 | Onde',
  description:
    'Create custom Minecraft banners with our free online banner maker. 16 colors, 40+ patterns, crafting recipes, /give commands. Compatible with Java & Bedrock Edition 1.21. No download, no ads.',
  keywords: [
    'minecraft banner maker',
    'minecraft banner maker online',
    'minecraft banner creator',
    'minecraft banner designer',
    'minecraft banner editor',
    'minecraft banner generator',
    'free minecraft banner maker',
    'minecraft banner patterns',
    'minecraft banner recipe',
    'minecraft banner maker bedrock',
    'minecraft banner maker java',
    'minecraft banner craft',
    'custom minecraft banner',
    'minecraft banner from image',
    'minecraft banner letters',
  ],
  openGraph: {
    title: '🏳️ Minecraft Banner Maker Online Free - Java & Bedrock 1.21 | Onde',
    description:
      'Design custom Minecraft banners with 16 colors, 40+ patterns & crafting recipes. Free, no ads, works with Java & Bedrock 1.21!',
    url: 'https://onde.la/games/banner-maker/',
    siteName: 'Onde',
    images: [
      {
        url: '/images/og-banner-maker.png',
        width: 1200,
        height: 630,
        alt: 'Minecraft Banner Maker - Create Custom Banners',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '🏳️ Minecraft Banner Maker Online Free - Java & Bedrock 1.21 | Onde',
    description: 'Create custom Minecraft banners with 40+ patterns & crafting recipes. Free, no ads, no download!',
    images: ['/images/og-banner-maker.png'],
    creator: '@Onde_FRH',
  },
  robots: { index: true, follow: true },
  alternates: { canonical: 'https://onde.la/games/banner-maker/' },
};

export default function BannerMakerLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Script
        id="banner-maker-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(gameJsonLd) }}
      />
      <Script
        id="banner-maker-breadcrumb"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <Script
        id="banner-maker-software-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareAppJsonLd) }}
      />
      {children}
    </>
  );
}
