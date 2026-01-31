import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Skin Studio - Skins for Minecraft & Roblox | Moonlight',
  description: 'Create awesome custom skins for Minecraft & Roblox with AI! Free skin editor with 3D preview, layer system, and one-click export. Child-friendly and ad-free.',
  keywords: 'minecraft,skin,editor,creator,skins,maker,3d,roblox,avatar,custom,free,pe,bedrock,java,cape,armor,ai',
  authors: [{ name: 'Moonlight', url: 'https://onde.la' }],
  creator: 'Moonlight',
  publisher: 'Onde',
  applicationName: 'Skin Studio',
  appleWebApp: {
    capable: true,
    title: 'Skin Studio',
    statusBarStyle: 'black-translucent',
  },
  openGraph: {
    title: 'Skin Studio - AI Skin Creator for Minecraft & Roblox',
    description: 'Create custom skins with AI! Free editor with 3D preview, layers, and templates.',
    type: 'website',
    siteName: 'Moonlight',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Skin Studio - AI Skin Creator',
    description: 'Create custom Minecraft & Roblox skins with AI! 🎨',
  },
  robots: {
    index: true,
    follow: true,
  },
  category: 'games',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#8b5cf6' },
    { media: '(prefers-color-scheme: dark)', color: '#1e1b4b' },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body className="antialiased bg-gradient-to-br from-green-400 via-blue-500 to-purple-600 min-h-screen">
        {children}
      </body>
    </html>
  );
}
