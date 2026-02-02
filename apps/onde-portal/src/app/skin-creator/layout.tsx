import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Free Skin Creator | Minecraft & Roblox Skin Maker Online',
  description: 'Create custom Minecraft and Roblox skins for free! Easy-to-use pixel editor with 3D preview, AI generation, layers, and instant download. No signup required.',
  keywords: ['minecraft skin creator', 'roblox skin maker', 'free skin editor', 'pixel art', 'character customizer', 'skin generator', 'minecraft skin maker online', 'roblox avatar creator'],
  openGraph: {
    title: 'Free Skin Creator | Minecraft & Roblox Skin Maker',
    description: 'Create stunning custom skins for Minecraft and Roblox. Free online editor with 3D preview and AI generation.',
    type: 'website',
    url: 'https://onde.la/skin-creator',
    images: [
      {
        url: 'https://onde.la/og/skin-creator.png',
        width: 1200,
        height: 630,
        alt: 'Skin Creator - Free Minecraft & Roblox Skin Maker',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Skin Creator | Minecraft & Roblox',
    description: 'Create custom skins with AI & 3D preview. 100% free!',
  },
  alternates: {
    canonical: 'https://onde.la/skin-creator',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function SkinCreatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Skin Creator',
    description: 'Free online skin creator for Minecraft and Roblox with 3D preview and AI generation',
    url: 'https://onde.la/skin-creator',
    applicationCategory: 'GameApplication',
    operatingSystem: 'Web Browser',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    featureList: [
      'Minecraft skin editor',
      'Roblox skin maker', 
      '3D real-time preview',
      'AI skin generation',
      'Layer system',
      'Export to PNG',
      'No signup required',
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {children}
    </>
  );
}
