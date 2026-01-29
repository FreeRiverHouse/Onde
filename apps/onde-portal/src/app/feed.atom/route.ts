import { books, getBookReadingEstimate, Book } from '@/data/books'

// Static export compatibility
export const dynamic = 'force-static'

const SITE_URL = 'https://onde.la'
const SITE_TITLE = 'Onde Books'
const SITE_DESCRIPTION = 'Free illustrated classics and new books from Onde Publishing House'

// Category descriptions for richer feed content
const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  'fiabe': 'A timeless fairy tale brought to life with beautiful illustrations',
  'favole': 'A classic fable with moral lessons for all ages',
  'classici': 'A literary classic reimagined with stunning artwork',
  'romanzi': 'A captivating novel beautifully illustrated',
  'avventura': 'An exciting adventure tale with vivid illustrations',
  'fantascienza': 'A science fiction classic with imaginative artwork',
  'horror': 'A chilling tale accompanied by atmospheric illustrations',
  'mistero': 'A gripping mystery enhanced with evocative artwork',
  'filosofia': 'Timeless philosophical wisdom, illustrated',
  'storia': 'Historical narrative brought to life through art',
  'poesia': 'Beautiful poetry paired with artistic interpretations',
  'teatro': 'Classic drama with theatrical illustrations',
  'spiritualita': 'Spiritual wisdom illuminated through art',
  'miti': 'Mythological stories with epic illustrations',
}

// Generate dynamic description based on book metadata
function getBookSummary(book: Book): string {
  const estimate = getBookReadingEstimate(book)
  const categoryDesc = CATEGORY_DESCRIPTIONS[book.category] || 'A classic work beautifully illustrated'
  
  return `"${book.title}" by ${book.author}. ${categoryDesc}. Approximately ${estimate.pages} pages (${estimate.time} read). Free PDF and EPUB download.`
}

// Generate HTML content for feed
function getBookContent(book: Book): string {
  const estimate = getBookReadingEstimate(book)
  const bookUrl = `${SITE_URL}/libro/${book.id}`
  const categoryDesc = CATEGORY_DESCRIPTIONS[book.category] || 'A beautifully illustrated edition'
  
  return `<p><strong>${book.title}</strong> by ${book.author}</p>
<p>${categoryDesc}.</p>
<ul>
<li>Category: ${book.category}</li>
<li>Pages: ~${estimate.pages}</li>
<li>Reading time: ${estimate.time}</li>
</ul>
<p><a href="${bookUrl}">Read now on Onde Books</a> - Free PDF &amp; EPUB downloads available.</p>`
}

// Get featured/recent books for the feed (limit to prevent huge feeds)
function getFeaturedBooks() {
  // Featured categories for Atom feed
  const featuredCategories = ['classici', 'fiabe', 'favole', 'romanzi', 'filosofia', 'poesia']
  
  // Get a diverse selection of books
  const featured = books
    .filter(book => featuredCategories.includes(book.category))
    .slice(0, 50) // Limit to 50 most relevant
  
  return featured
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

export async function GET() {
  const featuredBooks = getFeaturedBooks()
  const updatedDate = new Date().toISOString()
  
  const atomEntries = featuredBooks.map(book => {
    const bookUrl = `${SITE_URL}/libro/${book.id}`
    const bookId = `urn:onde:book:${book.id}`
    const summary = getBookSummary(book)
    const content = getBookContent(book)
    
    return `
  <entry>
    <title>${escapeXml(book.title)}</title>
    <link href="${bookUrl}" rel="alternate" type="text/html"/>
    <id>${bookId}</id>
    <updated>${updatedDate}</updated>
    <author>
      <name>${escapeXml(book.author)}</name>
    </author>
    <summary>${escapeXml(summary)}</summary>
    <category term="${escapeXml(book.category)}"/>
    <content type="html">${escapeXml(content)}</content>
  </entry>`
  }).join('')

  const atom = `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>${SITE_TITLE}</title>
  <subtitle>${SITE_DESCRIPTION}</subtitle>
  <link href="${SITE_URL}" rel="alternate" type="text/html"/>
  <link href="${SITE_URL}/feed.atom" rel="self" type="application/atom+xml"/>
  <id>urn:onde:feed:books</id>
  <updated>${updatedDate}</updated>
  <author>
    <name>Onde Publishing</name>
    <uri>${SITE_URL}</uri>
  </author>
  <icon>${SITE_URL}/favicon-32.png</icon>
  <logo>${SITE_URL}/icon.svg</logo>
  <rights>Free for personal use</rights>
  <generator uri="${SITE_URL}">Onde Books</generator>
  ${atomEntries}
</feed>`

  return new Response(atom, {
    headers: {
      'Content-Type': 'application/atom+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  })
}
