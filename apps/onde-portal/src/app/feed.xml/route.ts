import { books } from '@/data/books'

// Static export compatibility
export const dynamic = 'force-static'

const SITE_URL = 'https://onde.la'
const SITE_TITLE = 'Onde Books'
const SITE_DESCRIPTION = 'Free illustrated classics and new books from Onde Publishing House'

// Get featured/recent books for the feed (limit to prevent huge feeds)
function getFeaturedBooks() {
  // Featured categories for RSS
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
  const buildDate = new Date().toUTCString()
  
  const rssItems = featuredBooks.map(book => {
    const bookUrl = `${SITE_URL}/libro/${book.id}`
    const pubDate = new Date().toUTCString() // Use current date as placeholder
    
    return `
    <item>
      <title>${escapeXml(book.title)}</title>
      <link>${bookUrl}</link>
      <guid isPermaLink="true">${bookUrl}</guid>
      <description>${escapeXml(`Read "${book.title}" by ${book.author} - free illustrated edition from Onde Books.`)}</description>
      <author>${escapeXml(book.author)}</author>
      <category>${escapeXml(book.category)}</category>
      <pubDate>${pubDate}</pubDate>
    </item>`
  }).join('')

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${SITE_TITLE}</title>
    <link>${SITE_URL}</link>
    <description>${SITE_DESCRIPTION}</description>
    <language>en</language>
    <lastBuildDate>${buildDate}</lastBuildDate>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml"/>
    <image>
      <url>${SITE_URL}/icon.svg</url>
      <title>${SITE_TITLE}</title>
      <link>${SITE_URL}</link>
    </image>
    ${rssItems}
  </channel>
</rss>`

  return new Response(rss, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  })
}
