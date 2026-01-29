import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Libri | Onde - Free Illustrated Books',
  description: 'Download free illustrated editions of classic literature. Meditations by Marcus Aurelius, The Prophet by Kahlil Gibran, and more.',
  keywords: ['free ebooks', 'illustrated books', 'classic literature', 'Meditations', 'Marcus Aurelius', 'philosophy', 'public domain'],
  alternates: {
    canonical: '/libri',
  },
  openGraph: {
    title: 'Onde Libri - Free Illustrated Classics',
    description: 'Download free illustrated editions of timeless classics. Stoic philosophy, poetry, and more — beautifully designed.',
    url: 'https://onde.la/libri',
    siteName: 'Onde',
    images: [
      {
        url: 'https://onde.la/books/meditations-cover.jpg',
        width: 800,
        height: 1200,
        alt: 'Meditations by Marcus Aurelius - Illustrated Edition',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Onde Libri - Free Illustrated Classics',
    description: 'Download free illustrated editions of timeless classics.',
    images: ['https://onde.la/books/meditations-cover.jpg'],
  },
}

export default function LibriLayout({ children }: { children: React.ReactNode }) {
  return children
}
