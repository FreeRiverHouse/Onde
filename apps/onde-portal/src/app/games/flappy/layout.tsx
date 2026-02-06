import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Flappy Bird - Free Online Game | Onde',
  description: 'Tap to fly through pipes! Addictive one-button game. How far can you go? Free to play.',
  keywords: 'flappy bird, tap game, casual game, addictive game',
  openGraph: {
    title: '🎮 Flappy Bird - Play Free Online!',
    description: 'Tap to fly through pipes! Addictive one-button game. How far can you go? Free to play.',
    url: 'https://onde.la/games/flappy/',
    siteName: 'Onde',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: '🎮 Flappy Bird - Free Online Game',
    description: 'Tap to fly through pipes! Addictive one-button game. How far can you go? Free to play.',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
