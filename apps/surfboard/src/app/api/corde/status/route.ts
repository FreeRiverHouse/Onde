import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

// Path to CORDE books directory
const CORDE_BOOKS_PATH = '/Users/mattiapetrucciani/CascadeProjects/corde/books'
const CORDE_AUTHORS_PATH = '/Users/mattiapetrucciani/CascadeProjects/corde/config/authors.json'

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

export async function GET() {
  const books: Book[] = []
  const authors: Author[] = []

  try {
    // Read books from CORDE directory
    if (fs.existsSync(CORDE_BOOKS_PATH)) {
      const bookDirs = fs.readdirSync(CORDE_BOOKS_PATH).filter(dir =>
        fs.statSync(path.join(CORDE_BOOKS_PATH, dir)).isDirectory()
      )

      for (const bookDir of bookDirs) {
        const metadataPath = path.join(CORDE_BOOKS_PATH, bookDir, 'metadata.json')
        if (fs.existsSync(metadataPath)) {
          try {
            const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf-8'))

            // Count images in images folder if exists
            let imagesReady = 0
            const imagesPath = path.join(CORDE_BOOKS_PATH, bookDir, 'images')
            const imagesNanobPath = path.join(CORDE_BOOKS_PATH, bookDir, 'images-nanob')
            if (fs.existsSync(imagesNanobPath)) {
              imagesReady = fs.readdirSync(imagesNanobPath).filter(f => f.endsWith('.png') || f.endsWith('.jpg')).length
            } else if (fs.existsSync(imagesPath)) {
              imagesReady = fs.readdirSync(imagesPath).filter(f => f.endsWith('.png') || f.endsWith('.jpg')).length
            }

            // Calculate progress based on status
            const statusProgress: Record<string, number> = {
              concept: 10,
              testo_in_corso: 25,
              testo_completo: 40,
              illustrazioni: 70,
              layout: 85,
              review: 95,
              pubblicato: 100
            }

            const progress = statusProgress[metadata.status] || 0
            const imagesTotal = metadata.chapters || 10

            books.push({
              id: bookDir,
              title: metadata.title || bookDir,
              author: metadata.author || 'Unknown',
              illustrator: metadata.illustrator || 'Unknown',
              status: metadata.status || 'concept',
              progress,
              chapters: metadata.chapters || 10,
              chaptersReady: metadata.chapters || 10, // Assume chapters ready if testo_completo or later
              imagesReady,
              imagesTotal
            })
          } catch {
            // Skip invalid metadata
          }
        }
      }
    }

    // Read authors from config
    if (fs.existsSync(CORDE_AUTHORS_PATH)) {
      try {
        const authorsData = JSON.parse(fs.readFileSync(CORDE_AUTHORS_PATH, 'utf-8'))

        // Add writers
        if (authorsData.writers) {
          for (const [id, writer] of Object.entries(authorsData.writers) as [string, { name: string; style: string }][]) {
            const activeBooks = books.filter(b => b.author === writer.name).length
            authors.push({
              id,
              name: writer.name,
              role: 'writer',
              style: writer.style,
              activeBooks
            })
          }
        }

        // Add illustrators
        if (authorsData.illustrators) {
          for (const [id, illustrator] of Object.entries(authorsData.illustrators) as [string, { name: string; style: string }][]) {
            const activeBooks = books.filter(b => b.illustrator === illustrator.name).length
            authors.push({
              id,
              name: illustrator.name,
              role: 'illustrator',
              style: illustrator.style,
              activeBooks
            })
          }
        }
      } catch {
        // Use default authors
      }
    }

    // If no data found, use fallback
    if (books.length === 0) {
      books.push({
        id: 'marco-aurelio-bambini',
        title: 'Marco Aurelio per Bambini',
        author: 'Gianni Parola',
        illustrator: 'Pina Pennello',
        status: 'testo_completo',
        progress: 40,
        chapters: 10,
        chaptersReady: 10,
        imagesReady: 0,
        imagesTotal: 10
      })
    }

    if (authors.length === 0) {
      authors.push(
        { id: 'gianni-parola', name: 'Gianni Parola', role: 'writer', style: 'Narrativa per bambini', activeBooks: 1 },
        { id: 'pina-pennello', name: 'Pina Pennello', role: 'illustrator', style: 'Acquarello europeo', activeBooks: 1 }
      )
    }
  } catch {
    // Return empty on error
  }

  return NextResponse.json({ books, authors })
}
