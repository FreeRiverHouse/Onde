import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dino Runner - Free Online Game | Onde',
  description: 'Run, jump, and dodge obstacles with the pixel dinosaur! Chrome-style endless runner. Free online.',
  keywords: 'dino game, dinosaur runner, chrome dino, endless runner',
  openGraph: {
    title: '🎮 Dino Runner - Play Free Online!',
    description: 'Run, jump, and dodge obstacles with the pixel dinosaur! Chrome-style endless runner. Free online.',
    url: 'https://onde.la/games/dino/',
    siteName: 'Onde',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: '🎮 Dino Runner - Free Online Game',
    description: 'Run, jump, and dodge obstacles with the pixel dinosaur! Chrome-style endless runner. Free online.',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
