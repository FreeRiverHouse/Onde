import { NextResponse } from 'next/server'

export const runtime = 'edge'

interface Book {
  id: string
  title: string
  author: string
  illustrator: string
  status: string
  progress: number
  chapters: number
  chaptersReady: number
  imagesReady: number
  imagesTotal: number
}

interface Author {
  id: string
  name: string
  role: 'writer' | 'illustrator'
  style: string
  activeBooks: number
}

// DASH-001: No fake/demo data - return empty arrays until real data source is connected
export async function GET() {
  const books: Book[] = []
  const authors: Author[] = []

  return NextResponse.json({ 
    books, 
    authors,
    note: 'No data source configured. Connect a database or external API for real CORDE data.'
  })
}
