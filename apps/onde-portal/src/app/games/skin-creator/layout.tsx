import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Skin Studio - Free Minecraft Skin Maker Online | Onde',
  description: 'Create custom Minecraft & Roblox skins with our free online skin maker! AI-powered skin creator with 3D preview, layers, templates, and community gallery. No download required.',
  keywords: ['minecraft skin maker', 'minecraft skin creator', 'skin editor online', 'roblox skin maker', 'free minecraft skins', 'custom skin creator', 'minecraft skin generator', 'pixel skin maker'],
  openGraph: {
    title: '🎨 Skin Studio - Create Minecraft & Roblox Skins!',
    description: 'AI-powered skin editor with 3D preview, layers, and community gallery. Create your perfect character skin!',
    url: 'https://onde.la/games/skin-creator/',
    siteName: 'Onde',
    images: [
      {
        url: '/images/og-skin-creator.png',
        width: 1200,
        height: 630,
        alt: 'Skin Studio - Minecraft & Roblox Skin Creator',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '🎨 Skin Studio - Create Minecraft & Roblox Skins!',
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
  return children;
}
