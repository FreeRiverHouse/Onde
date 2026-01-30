/**
 * OPDS (Open Publication Distribution System) parser and fetcher
 * Supports OPDS 1.x catalogs for browsing and downloading ebooks
 */

export interface OPDSEntry {
  id: string;
  title: string;
  author?: string;
  summary?: string;
  coverUrl?: string;
  thumbnailUrl?: string;
  epubUrl?: string;
  mobiUrl?: string;
  pdfUrl?: string;
  language?: string;
  published?: string;
  categories?: string[];
  links: OPDSLink[];
}

export interface OPDSLink {
  href: string;
  rel?: string;
  type?: string;
  title?: string;
}

export interface OPDSFeed {
  id: string;
  title: string;
  updated?: string;
  entries: OPDSEntry[];
  links: OPDSLink[];
  totalResults?: number;
  itemsPerPage?: number;
  startIndex?: number;
}

export interface OPDSCatalog {
  id: string;
  name: string;
  url: string;
  icon?: string;
  description?: string;
  searchUrl?: string;
}

// Pre-configured OPDS catalogs (public domain / free books)
export const DEFAULT_CATALOGS: OPDSCatalog[] = [
  {
    id: 'gutenberg',
    name: 'Project Gutenberg',
    url: 'https://m.gutenberg.org/ebooks.opds/',
    icon: '📚',
    description: 'Over 70,000 free eBooks',
    searchUrl: 'https://m.gutenberg.org/ebooks/search.opds/?query={searchTerms}',
  },
  {
    id: 'standardebooks',
    name: 'Standard Ebooks',
    url: 'https://standardebooks.org/opds',
    icon: '📖',
    description: 'High-quality, carefully formatted public domain ebooks',
  },
  {
    id: 'feedbooks-pd',
    name: 'Feedbooks (Public Domain)',
    url: 'https://catalog.feedbooks.com/publicdomain/browse/en/top.atom',
    icon: '📕',
    description: 'Popular public domain books',
  },
  {
    id: 'manybooks',
    name: 'ManyBooks',
    url: 'https://manybooks.net/opds/index.php',
    icon: '📗',
    description: 'Free eBooks for your ebook reader',
  },
];

/**
 * Parse an OPDS Atom feed from XML string
 */
export function parseOPDSFeed(xmlString: string, baseUrl: string): OPDSFeed {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlString, 'application/xml');
  
  // Check for parsing errors
  const parseError = doc.querySelector('parsererror');
  if (parseError) {
    throw new Error(`Failed to parse OPDS feed: ${parseError.textContent}`);
  }
  
  // Extract feed metadata
  const feedId = doc.querySelector('feed > id')?.textContent || baseUrl;
  const feedTitle = doc.querySelector('feed > title')?.textContent || 'OPDS Catalog';
  const feedUpdated = doc.querySelector('feed > updated')?.textContent || undefined;
  
  // OpenSearch pagination info
  const totalResults = parseInt(doc.querySelector('feed > totalResults')?.textContent || '0', 10) || undefined;
  const itemsPerPage = parseInt(doc.querySelector('feed > itemsPerPage')?.textContent || '0', 10) || undefined;
  const startIndex = parseInt(doc.querySelector('feed > startIndex')?.textContent || '0', 10) || undefined;
  
  // Parse feed-level links
  const feedLinks = parseFeedLinks(doc, baseUrl);
  
  // Parse entries
  const entryElements = doc.querySelectorAll('feed > entry');
  const entries: OPDSEntry[] = [];
  
  entryElements.forEach((entry) => {
    entries.push(parseEntry(entry, baseUrl));
  });
  
  return {
    id: feedId,
    title: feedTitle,
    updated: feedUpdated,
    entries,
    links: feedLinks,
    totalResults,
    itemsPerPage,
    startIndex,
  };
}

function parseFeedLinks(doc: Document, baseUrl: string): OPDSLink[] {
  const links: OPDSLink[] = [];
  const linkElements = doc.querySelectorAll('feed > link');
  
  linkElements.forEach((link) => {
    links.push({
      href: resolveUrl(link.getAttribute('href') || '', baseUrl),
      rel: link.getAttribute('rel') || undefined,
      type: link.getAttribute('type') || undefined,
      title: link.getAttribute('title') || undefined,
    });
  });
  
  return links;
}

function parseEntry(entry: Element, baseUrl: string): OPDSEntry {
  const id = entry.querySelector('id')?.textContent || '';
  const title = entry.querySelector('title')?.textContent || 'Untitled';
  
  // Author can be in different formats
  const authorElement = entry.querySelector('author > name');
  const author = authorElement?.textContent || undefined;
  
  // Summary/description
  const summary = entry.querySelector('summary')?.textContent || 
                  entry.querySelector('content')?.textContent || undefined;
  
  // Published date
  const published = entry.querySelector('published')?.textContent ||
                    entry.querySelector('updated')?.textContent || undefined;
  
  // Language
  const language = entry.querySelector('language')?.textContent ||
                   entry.querySelector('dc\\:language, language')?.textContent || undefined;
  
  // Categories
  const categoryElements = entry.querySelectorAll('category');
  const categories: string[] = [];
  categoryElements.forEach((cat) => {
    const term = cat.getAttribute('term') || cat.getAttribute('label');
    if (term) categories.push(term);
  });
  
  // Parse links
  const links: OPDSLink[] = [];
  const linkElements = entry.querySelectorAll('link');
  
  let coverUrl: string | undefined;
  let thumbnailUrl: string | undefined;
  let epubUrl: string | undefined;
  let mobiUrl: string | undefined;
  let pdfUrl: string | undefined;
  
  linkElements.forEach((link) => {
    const href = resolveUrl(link.getAttribute('href') || '', baseUrl);
    const rel = link.getAttribute('rel') || '';
    const type = link.getAttribute('type') || '';
    const linkTitle = link.getAttribute('title') || undefined;
    
    links.push({ href, rel, type, title: linkTitle });
    
    // Identify cover images
    if (rel.includes('image') || rel.includes('thumbnail') || rel.includes('cover')) {
      if (rel.includes('thumbnail') || type.includes('thumbnail')) {
        thumbnailUrl = href;
      } else {
        coverUrl = href;
      }
    }
    
    // Identify downloadable formats
    if (rel.includes('acquisition') || !rel) {
      if (type.includes('epub')) {
        epubUrl = href;
      } else if (type.includes('mobi') || type.includes('x-mobipocket')) {
        mobiUrl = href;
      } else if (type.includes('pdf')) {
        pdfUrl = href;
      }
    }
  });
  
  return {
    id,
    title,
    author,
    summary,
    coverUrl: coverUrl || thumbnailUrl,
    thumbnailUrl,
    epubUrl,
    mobiUrl,
    pdfUrl,
    language,
    published,
    categories,
    links,
  };
}

/**
 * Resolve a potentially relative URL against a base URL
 */
function resolveUrl(url: string, baseUrl: string): string {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  try {
    return new URL(url, baseUrl).href;
  } catch {
    return url;
  }
}

/**
 * Fetch and parse an OPDS feed
 */
export async function fetchOPDSFeed(url: string): Promise<OPDSFeed> {
  // Use a CORS proxy for cross-origin requests
  const proxyUrl = getCorsProxyUrl(url);
  
  const response = await fetch(proxyUrl, {
    headers: {
      'Accept': 'application/atom+xml, application/xml, text/xml, */*',
    },
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch OPDS feed: ${response.status} ${response.statusText}`);
  }
  
  const xmlText = await response.text();
  return parseOPDSFeed(xmlText, url);
}

/**
 * Search an OPDS catalog using its OpenSearch template
 */
export async function searchOPDSCatalog(
  catalog: OPDSCatalog,
  query: string
): Promise<OPDSFeed> {
  if (!catalog.searchUrl) {
    throw new Error(`Catalog ${catalog.name} does not support search`);
  }
  
  const searchUrl = catalog.searchUrl.replace('{searchTerms}', encodeURIComponent(query));
  return fetchOPDSFeed(searchUrl);
}

/**
 * Find the search URL in an OPDS feed
 */
export function findSearchUrl(feed: OPDSFeed): string | undefined {
  // Look for OpenSearch description link
  const searchLink = feed.links.find(
    (link) => link.rel === 'search' && link.type?.includes('opensearch')
  );
  
  if (searchLink) {
    return searchLink.href;
  }
  
  // Some feeds include search directly
  const directSearch = feed.links.find(
    (link) => link.rel === 'search' || link.title?.toLowerCase().includes('search')
  );
  
  return directSearch?.href;
}

/**
 * Get navigation links from a feed
 */
export function getNavigationLinks(feed: OPDSFeed): {
  next?: string;
  previous?: string;
  first?: string;
  last?: string;
  self?: string;
  up?: string;
} {
  return {
    next: feed.links.find((l) => l.rel === 'next')?.href,
    previous: feed.links.find((l) => l.rel === 'previous' || l.rel === 'prev')?.href,
    first: feed.links.find((l) => l.rel === 'first')?.href,
    last: feed.links.find((l) => l.rel === 'last')?.href,
    self: feed.links.find((l) => l.rel === 'self')?.href,
    up: feed.links.find((l) => l.rel === 'up' || l.rel === 'start')?.href,
  };
}

/**
 * Get subsections/categories from a navigation feed
 */
export function getSubsections(feed: OPDSFeed): OPDSLink[] {
  return feed.links.filter(
    (link) =>
      link.rel?.includes('subsection') ||
      link.type?.includes('navigation') ||
      link.type?.includes('kind=navigation')
  );
}

/**
 * Download an EPUB file and return it as a Blob
 */
export async function downloadEpub(url: string): Promise<Blob> {
  const proxyUrl = getCorsProxyUrl(url);
  
  const response = await fetch(proxyUrl);
  
  if (!response.ok) {
    throw new Error(`Failed to download EPUB: ${response.status}`);
  }
  
  return response.blob();
}

/**
 * Get a CORS proxy URL for cross-origin requests
 * Using a free public proxy; in production, you'd want your own
 */
function getCorsProxyUrl(url: string): string {
  // For development/demo: use corsproxy.io (free, rate-limited)
  // In production, set up your own proxy on Cloudflare Workers or similar
  
  // Check if we're on localhost or the actual domain
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    
    // If local development, use a proxy
    if (host === 'localhost' || host === '127.0.0.1') {
      return `https://corsproxy.io/?${encodeURIComponent(url)}`;
    }
    
    // For production, we'll use our own proxy endpoint
    // For now, still use the public proxy
    return `https://corsproxy.io/?${encodeURIComponent(url)}`;
  }
  
  return url;
}

/**
 * Validate if a URL is a valid OPDS catalog
 */
export async function validateOPDSCatalog(url: string): Promise<{
  valid: boolean;
  title?: string;
  error?: string;
}> {
  try {
    const feed = await fetchOPDSFeed(url);
    return {
      valid: true,
      title: feed.title,
    };
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
