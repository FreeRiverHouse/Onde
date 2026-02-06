import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Minesweeper - Free Online Game | Onde',
  description: 'Classic logic puzzle! Clear the minefield without hitting a mine. Multiple difficulty levels.',
  keywords: 'minesweeper, logic puzzle, strategy game, classic game',
  openGraph: {
    title: '🎮 Minesweeper - Play Free Online!',
    description: 'Classic logic puzzle! Clear the minefield without hitting a mine. Multiple difficulty levels.',
    url: 'https://onde.la/games/minesweeper/',
    siteName: 'Onde',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: '🎮 Minesweeper - Free Online Game',
    description: 'Classic logic puzzle! Clear the minefield without hitting a mine. Multiple difficulty levels.',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
