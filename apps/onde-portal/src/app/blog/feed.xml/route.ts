import { blogPosts, SITE_URL, BLOG_TITLE, BLOG_DESCRIPTION } from '@/data/blog-posts'

// Static export compatibility — generate at build time
export const dynamic = 'force-static'

/**
 * Escape XML special characters
 */
function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

/**
 * Generate RSS 2.0 XML feed for the /blog (Tech) section
 */
function generateRss(): string {
  const items = blogPosts
    .map((post) => {
      const link = `${SITE_URL}/blog/${post.slug}/`
      const pubDate = new Date(post.dateISO).toUTCString()
      const categories = post.tags.map((tag) => `      <category>${escapeXml(tag)}</category>`).join('\n')

      // Use contentHtml if available, otherwise fall back to excerpt
      const contentEncoded = post.contentHtml
        ? `<![CDATA[${post.contentHtml}]]>`
        : `<![CDATA[<p>${escapeXml(post.excerpt)}</p><p><a href="${link}">Read the full article →</a></p>]]>`

      return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <description>${escapeXml(post.description || post.excerpt)}</description>
      <content:encoded>${contentEncoded}</content:encoded>
      <pubDate>${pubDate}</pubDate>
${categories}
      <author>tech@onde.la (Onde Tech)</author>
    </item>`
    })
    .join('\n')

  const lastBuildDate = new Date().toUTCString()

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
  xmlns:content="http://purl.org/rss/1.0/modules/content/"
  xmlns:atom="http://www.w3.org/2005/Atom"
>
  <channel>
    <title>${escapeXml(BLOG_TITLE)}</title>
    <link>${SITE_URL}/blog/</link>
    <description>${escapeXml(BLOG_DESCRIPTION)}</description>
    <language>en</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <atom:link href="${SITE_URL}/blog/feed.xml/" rel="self" type="application/rss+xml" />
    <image>
      <url>${SITE_URL}/icon.svg</url>
      <title>${escapeXml(BLOG_TITLE)}</title>
      <link>${SITE_URL}/blog/</link>
    </image>
${items}
  </channel>
</rss>`
}

export function GET() {
  const xml = generateRss()

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  })
}
