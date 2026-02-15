import type { Metadata } from 'next';
import Script from 'next/script';

const gameJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'VideoGame',
  name: 'Free Minecraft Skin Creator & Editor Online',
  description:
    'Create custom Minecraft skins free online with our AI-powered skin maker & editor. 3D preview, layers, templates for Java & Bedrock. No download, no ads.',
  url: 'https://onde.la/games/skin-creator/',
  genre: ['Educational', 'Creative'],
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
  title: 'Free Minecraft Skin Creator & Editor Online - AI Skin Maker | Onde',
  description: 'Create custom Minecraft skins free online with our AI-powered skin maker & editor. 3D preview, layers, templates for Java & Bedrock. No download, no ads. Works on mobile!',
  keywords: [
    'minecraft skin creator',
    'minecraft skin maker',
    'minecraft skin editor online',
    'minecraft skin creator ai',
    'minecraft skin generator ai',
    'free minecraft skin maker online',
    'minecraft skin creator free',
    'minecraft skin creator online',
    'minecraft skin creator bedrock',
    'minecraft skin creator java',
    'minecraft skin creator 3d',
    'minecraft skin creator from image',
    'mc skin editor online',
    'custom minecraft skin',
    'minecraft skin designer online',
  ],
  openGraph: {
    title: '🎨 Free Minecraft Skin Creator & AI Editor Online | Onde',
    description: 'AI-powered skin maker & editor with 3D preview, layers, and community gallery. Create Minecraft skins for Java & Bedrock. Free, no ads!',
    url: 'https://onde.la/games/skin-creator/',
    siteName: 'Onde',
    images: [
      {
        url: '/images/og-skin-creator.png',
        width: 1200,
        height: 630,
        alt: 'Skin Creator - Minecraft & Roblox Skin Creator',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '🎨 Free Minecraft Skin Creator & AI Editor Online | Onde',
    description: 'AI-powered skin maker with 3D preview, layers & templates. Free, no ads, no download!',
    images: ['/images/og-skin-creator.png'],
    creator: '@Onde_FRH',
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: 'https://onde.la/games/skin-creator/',
  },
};

export default function SkinCreatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Script
        id="skin-creator-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(gameJsonLd) }}
      />
      {children}
    </>
  );
}
