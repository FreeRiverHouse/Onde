// Onde Studio Books - Our original content only

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
    id: 'meditations-en',
    title: 'Meditations',
    author: 'Marcus Aurelius',
    category: 'filosofia-adulti',
    lang: 'en',
    source: 'onde-studio',
    pages: 120,
    readingTime: '~2 hours',
    coverImage: '/images/books/meditations-cover.jpg',
    epubUrl: '/books/epub/meditations-en.epub',
  },
  {
    id: 'meditations-it',
    title: 'Meditazioni',
    author: 'Marco Aurelio',
    category: 'filosofia-adulti',
    lang: 'it',
    source: 'onde-studio',
    pages: 120,
    readingTime: '~2 ore',
    coverImage: '/images/books/meditations-cover.jpg',
    epubUrl: '/books/epub/meditations-it.epub',
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
