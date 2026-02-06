import type { Metadata } from 'next';
import Script from 'next/script';

const skinCreatorJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Skin Creator - Minecraft & Roblox Skin Maker',
  description:
    'Create custom Minecraft skins for free with our online skin maker! AI-powered editor with 3D preview, layers, and easy export. Works with Java & Bedrock.',
  url: 'https://onde.la/games/skin-creator/',
  applicationCategory: 'DesignApplication',
  operatingSystem: 'Any',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
  },
  featureList: [
    'AI-powered skin generation',
    '3D real-time preview',
    'Layer-based editing',
    'Export for Java & Bedrock',
    'Community gallery',
    'Pixel-level editor',
  ],
  screenshot: 'https://onde.la/images/og-skin-creator.png',
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
  title: 'Free Minecraft Skin Creator Online - Make Custom Skins | Skin Creator',
  description: 'Create custom Minecraft skins for free with our online skin maker! AI-powered editor with 3D preview, layers, and easy export. Works with Java & Bedrock. No download required.',
  keywords: [
    'minecraft skin creator',
    'minecraft skin maker', 
    'free minecraft skin maker online',
    'minecraft skin editor',
    'minecraft skin generator',
    'ai minecraft skin creator',
    'custom minecraft skin',
    'minecraft java skin creator',
    'minecraft bedrock skin maker',
    'roblox skin maker',
    'online skin editor no download',
    'pixel skin maker',
    'minecraft skin creator free',
  ],
  openGraph: {
    title: '🎨 Skin Creator - Create Minecraft & Roblox Skins!',
    description: 'AI-powered skin editor with 3D preview, layers, and community gallery. Create your perfect character skin!',
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
    title: '🎨 Skin Creator - Create Minecraft & Roblox Skins!',
    description: 'AI-powered skin editor with 3D preview and community gallery. Free!',
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(skinCreatorJsonLd) }}
      />
      {children}
    </>
  );
}
