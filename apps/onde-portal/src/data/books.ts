// Onde Studio Books - Our original content only
// No more fake Gutenberg catalog

export type BookSource = 'onde-studio'

export interface Book {
  id: string
  title: string
  author: string
  category: string
  lang?: string
  source: BookSource
  pages?: number
  readingTime?: string
  coverImage?: string
  epubUrl?: string
  pdfUrl?: string
}

export function getBookReadingEstimate(book: Book): { pages: number; time: string } {
  return { 
    pages: book.pages || 32, 
    time: book.readingTime || '~10 min' 
  }
}

export const books: Book[] = [
  {
    id: 'meditations',
    title: 'Meditations',
    author: 'Marco Aurelio (Onde Edition)',
    category: 'filosofia',
    lang: 'en',
    source: 'onde-studio',
    pages: 48,
    readingTime: '~15 min',
    coverImage: '/books/meditations-cover.jpg',
    epubUrl: '/books/epub/meditations-en.epub',
  },
  {
    id: 'salmo-23-it',
    title: 'Il Salmo 23',
    author: 'Onde',
    category: 'spiritualita',
    lang: 'it',
    source: 'onde-studio',
    pages: 32,
    readingTime: '~10 min',
    coverImage: '/books/shepherds-promise-cover.jpg',
    epubUrl: '/books/epub/salmo-23-bambini-it.epub',
  },
  {
    id: 'salmo-23-en',
    title: 'Psalm 23',
    author: 'Onde',
    category: 'spiritualita',
    lang: 'en',
    source: 'onde-studio',
    pages: 32,
    readingTime: '~10 min',
    coverImage: '/books/shepherds-promise-cover.jpg',
    epubUrl: '/books/epub/salmo-23-bambini-en.epub',
  },
  {
    id: 'shepherds-promise',
    title: "The Shepherd's Promise",
    author: 'Onde',
    category: 'spiritualita',
    lang: 'en',
    source: 'onde-studio',
    pages: 32,
    readingTime: '~10 min',
    coverImage: '/books/shepherds-promise-cover.jpg',
    epubUrl: '/books/epub/the-shepherds-promise.epub',
  },
]

export const bookCount = books.length
