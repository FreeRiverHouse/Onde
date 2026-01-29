import { books } from '@/data/books'

// Static export compatibility
export const dynamic = 'force-static'

const SITE_URL = 'https://onde.la'
const SITE_TITLE = 'Onde Books'
const SITE_DESCRIPTION = 'Free illustrated classics and new books from Onde Publishing House'

// Get featured/recent books for the feed (limit to prevent huge feeds)
function getFeaturedBooks() {
  // Featured categories for Atom feed
  const featuredCategories = ['classici', 'fiabe', 'favole', 'romanzi']
  
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
    
    return `
  <entry>
    <title>${escapeXml(book.title)}</title>
    <link href="${bookUrl}" rel="alternate" type="text/html"/>
    <id>${bookId}</id>
    <updated>${updatedDate}</updated>
    <author>
      <name>${escapeXml(book.author)}</name>
    </author>
    <summary>${escapeXml(`Read "${book.title}" by ${book.author} - free illustrated edition from Onde Books.`)}</summary>
    <category term="${escapeXml(book.category)}"/>
    <content type="html">${escapeXml(`<p>Free illustrated edition of <strong>${book.title}</strong> by ${book.author}.</p><p>Category: ${book.category}</p><p><a href="${bookUrl}">Read now on Onde Books</a></p>`)}</content>
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
