/**
 * EPUB Parser for VR Reader
 * 
 * Extracts plain text from EPUB files for rendering in 3D space.
 * Uses epub.js for parsing but extracts plain text for VR text rendering.
 */

import ePub from 'epubjs';
import type { Book, Section } from 'epubjs';

export interface BookMetadata {
  title: string;
  author: string;
  publisher?: string;
  language?: string;
  coverUrl?: string;
}

export interface Chapter {
  title: string;
  href: string;
  content: string; // Plain text content
  pages: string[]; // Split into VR-sized pages
}

export interface ParsedBook {
  metadata: BookMetadata;
  chapters: Chapter[];
  totalPages: number;
}

// Characters per VR page (optimized for comfortable reading distance)
const CHARS_PER_PAGE = 800;

/**
 * Extract plain text from HTML content
 */
function htmlToPlainText(html: string): string {
  // Create a temporary div to parse HTML
  if (typeof document === 'undefined') {
    // SSR fallback - basic regex stripping
    return html
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/\s+/g, ' ')
      .trim();
  }
  
  const div = document.createElement('div');
  div.innerHTML = html;
  
  // Remove script and style elements
  div.querySelectorAll('script, style').forEach(el => el.remove());
  
  // Get text content and clean up whitespace
  return (div.textContent || div.innerText || '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Split text into VR-sized pages
 * Tries to break at paragraph or sentence boundaries
 */
function paginateText(text: string, charsPerPage: number = CHARS_PER_PAGE): string[] {
  const pages: string[] = [];
  let remaining = text.trim();
  
  while (remaining.length > 0) {
    if (remaining.length <= charsPerPage) {
      pages.push(remaining);
      break;
    }
    
    // Find a good break point
    let breakPoint = charsPerPage;
    
    // Try to break at paragraph
    const paragraphBreak = remaining.lastIndexOf('\n\n', charsPerPage);
    if (paragraphBreak > charsPerPage * 0.5) {
      breakPoint = paragraphBreak;
    } else {
      // Try to break at sentence
      const sentenceBreak = Math.max(
        remaining.lastIndexOf('. ', charsPerPage),
        remaining.lastIndexOf('! ', charsPerPage),
        remaining.lastIndexOf('? ', charsPerPage)
      );
      if (sentenceBreak > charsPerPage * 0.5) {
        breakPoint = sentenceBreak + 1;
      } else {
        // Fall back to word boundary
        const wordBreak = remaining.lastIndexOf(' ', charsPerPage);
        if (wordBreak > 0) {
          breakPoint = wordBreak;
        }
      }
    }
    
    pages.push(remaining.slice(0, breakPoint).trim());
    remaining = remaining.slice(breakPoint).trim();
  }
  
  return pages;
}

/**
 * Load and parse an EPUB file for VR reading
 */
export async function parseEpub(source: string | ArrayBuffer): Promise<ParsedBook> {
  const book: Book = ePub(source);
  await book.ready;
  
  // Get metadata
  const metadata: BookMetadata = {
    title: book.packaging?.metadata?.title || 'Untitled',
    author: book.packaging?.metadata?.creator || 'Unknown Author',
    publisher: book.packaging?.metadata?.publisher,
    language: book.packaging?.metadata?.language,
  };
  
  // Try to get cover
  try {
    const coverUrl = await book.coverUrl();
    if (coverUrl) {
      metadata.coverUrl = coverUrl;
    }
  } catch {
    // No cover available
  }
  
  // Get spine items (chapters in reading order)
  const spine = book.spine;
  const chapters: Chapter[] = [];
  let totalPages = 0;
  
  // Load navigation for chapter titles
  const nav = await book.loaded.navigation;
  const tocMap = new Map<string, string>();
  
  if (nav?.toc) {
    for (const item of nav.toc) {
      tocMap.set(item.href, item.label);
    }
  }
  
  // Process each spine item
  await spine.each(async (section: Section) => {
    try {
      // Load section content
      const contents = await section.load(book.load.bind(book));
      const doc = contents as Document;
      
      // Get HTML content
      const html = doc.body?.innerHTML || '';
      
      // Convert to plain text
      const plainText = htmlToPlainText(html);
      
      if (plainText.length > 10) { // Skip nearly empty chapters
        // Get chapter title from ToC or use generic
        const title = tocMap.get(section.href) || 
                     tocMap.get(section.href.split('#')[0]) ||
                     `Chapter ${chapters.length + 1}`;
        
        // Paginate for VR
        const pages = paginateText(plainText);
        
        chapters.push({
          title,
          href: section.href,
          content: plainText,
          pages,
        });
        
        totalPages += pages.length;
      }
    } catch (err) {
      console.warn(`Failed to load chapter ${section.href}:`, err);
    }
  });
  
  return {
    metadata,
    chapters,
    totalPages,
  };
}

/**
 * Load EPUB from URL
 */
export async function loadEpubFromUrl(url: string): Promise<ParsedBook> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch EPUB: ${response.status}`);
  }
  const buffer = await response.arrayBuffer();
  return parseEpub(buffer);
}

/**
 * Get a specific page from parsed book
 */
export function getPage(book: ParsedBook, pageNumber: number): { 
  text: string; 
  chapter: string; 
  chapterIndex: number;
  pageInChapter: number;
  totalPagesInChapter: number;
} | null {
  let currentPage = 0;
  
  for (let i = 0; i < book.chapters.length; i++) {
    const chapter = book.chapters[i];
    const pagesInChapter = chapter.pages.length;
    
    if (currentPage + pagesInChapter > pageNumber) {
      const pageInChapter = pageNumber - currentPage;
      return {
        text: chapter.pages[pageInChapter],
        chapter: chapter.title,
        chapterIndex: i,
        pageInChapter,
        totalPagesInChapter: pagesInChapter,
      };
    }
    
    currentPage += pagesInChapter;
  }
  
  return null;
}
