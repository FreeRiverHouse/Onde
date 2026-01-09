import { NextRequest, NextResponse } from 'next/server'
import { books } from '@/data/books'

// Create lookup map
const booksMap: Record<string, typeof books[0]> = {}
books.forEach(book => {
  booksMap[book.id] = book
})

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const book = booksMap[params.id]

  if (!book) {
    return NextResponse.json({ error: 'Book not found' }, { status: 404 })
  }

  if (!book.gutenberg) {
    return NextResponse.json({ error: 'No Gutenberg ID' }, { status: 404 })
  }

  try {
    // Try multiple Gutenberg URL formats
    const urls = [
      `https://www.gutenberg.org/cache/epub/${book.gutenberg}/pg${book.gutenberg}.txt`,
      `https://www.gutenberg.org/files/${book.gutenberg}/${book.gutenberg}-0.txt`,
      `https://www.gutenberg.org/files/${book.gutenberg}/${book.gutenberg}.txt`,
    ]

    let text = ''
    let success = false

    for (const url of urls) {
      try {
        const response = await fetch(url, {
          headers: {
            'User-Agent': 'Onde-Portal/1.0 (ebook reader)',
          },
        })

        if (response.ok) {
          text = await response.text()
          success = true
          break
        }
      } catch {
        continue
      }
    }

    if (!success) {
      return NextResponse.json({ error: 'Content not available' }, { status: 503 })
    }

    // Clean up Gutenberg header/footer
    let cleanText = text

    // Find start marker
    const startMarkers = ['*** START OF', '***START OF', '*END*THE SMALL PRINT']
    for (const marker of startMarkers) {
      const startIdx = text.indexOf(marker)
      if (startIdx !== -1) {
        const afterStart = text.indexOf('\n', startIdx)
        if (afterStart !== -1) {
          cleanText = text.substring(afterStart + 1)
          break
        }
      }
    }

    // Find end marker
    const endMarkers = ['*** END OF', '***END OF', 'End of Project Gutenberg', 'End of the Project Gutenberg']
    for (const marker of endMarkers) {
      const endIdx = cleanText.indexOf(marker)
      if (endIdx !== -1) {
        cleanText = cleanText.substring(0, endIdx)
        break
      }
    }

    // Additional cleanup
    cleanText = cleanText.trim()

    // Split into chapters/sections for better rendering
    const chapters = splitIntoChapters(cleanText)

    return NextResponse.json({
      title: book.title,
      author: book.author,
      lang: book.lang || 'en',
      content: cleanText,
      chapters,
      wordCount: cleanText.split(/\s+/).length,
    })
  } catch (error) {
    console.error('Error fetching book:', error)
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 })
  }
}

function splitIntoChapters(text: string): { title: string; content: string }[] {
  // Common chapter patterns
  const chapterPatterns = [
    /^(CHAPTER\s+[IVXLCDM\d]+\.?.*?)$/gim,
    /^(Chapter\s+[IVXLCDM\d]+\.?.*?)$/gim,
    /^(CAPITOLO\s+[IVXLCDM\d]+\.?.*?)$/gim,
    /^(BOOK\s+[IVXLCDM\d]+\.?.*?)$/gim,
    /^(PART\s+[IVXLCDM\d]+\.?.*?)$/gim,
  ]

  const chapters: { title: string; content: string }[] = []

  for (const pattern of chapterPatterns) {
    const matches = [...text.matchAll(pattern)]
    if (matches.length > 2) {
      // Found chapter structure
      const positions = matches.map(m => ({
        title: m[1].trim(),
        index: m.index || 0
      }))

      for (let i = 0; i < positions.length; i++) {
        const start = positions[i].index
        const end = i < positions.length - 1 ? positions[i + 1].index : text.length
        chapters.push({
          title: positions[i].title,
          content: text.substring(start, end).trim()
        })
      }

      // Add intro if there's content before first chapter
      if (positions[0].index > 500) {
        chapters.unshift({
          title: 'Introduction',
          content: text.substring(0, positions[0].index).trim()
        })
      }

      return chapters
    }
  }

  // No chapters found, return as single block
  return [{ title: '', content: text }]
}
