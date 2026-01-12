import { books } from '@/data/books'
import BookReaderClient from './BookReaderClient'

// Generate static params for all books
export function generateStaticParams() {
  return books.map((book) => ({
    id: book.id,
  }))
}

interface Props {
  params: Promise<{ id: string }>
}

export default async function BookPage({ params }: Props) {
  const { id } = await params
  return <BookReaderClient bookId={id} />
}
