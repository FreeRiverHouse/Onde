import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '🎨 Skin Studio - Minecraft & Roblox Skin Creator | Onde',
  description: 'Create awesome Minecraft & Roblox skins with AI-powered tools! Free online skin editor with 3D preview, layers, and community gallery.',
  keywords: ['minecraft skin creator', 'roblox skin maker', 'minecraft skin editor', 'skin generator', 'free skin maker'],
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
