import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Skin Creator | Onde',
  description: 'Create awesome Minecraft skins! 🎨',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased bg-gradient-to-br from-green-400 via-blue-500 to-purple-600 min-h-screen">
        {children}
      </body>
    </html>
  );
}
