/**
 * Onde Books VR - ePub Parser
 *
 * Simple ePub parser for loading books into the VR reader.
 * Uses JSZip for extracting ePub contents.
 *
 * ePub Structure:
 * - mimetype (must be first, uncompressed)
 * - META-INF/container.xml (points to content.opf)
 * - content.opf (metadata, manifest, spine)
 * - OEBPS/ or content/ (actual content files)
 */

class EpubParser {
  constructor() {
    this.zip = null;
    this.metadata = {};
    this.chapters = [];
    this.currentChapterIndex = 0;
  }

  /**
   * Load an ePub file from URL or File object
   * @param {string|File} source - URL or File object
   * @returns {Promise<object>} - Parsed book data
   */
  async load(source) {
    try {
      // Load JSZip if not already loaded
      if (typeof JSZip === 'undefined') {
        await this.loadScript('https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js');
      }

      let data;
      if (typeof source === 'string') {
        // URL
        const response = await fetch(source);
        data = await response.arrayBuffer();
      } else if (source instanceof File) {
        // File object
        data = await source.arrayBuffer();
      } else {
        throw new Error('Invalid source: must be URL string or File object');
      }

      this.zip = await JSZip.loadAsync(data);

      // Parse container.xml to find content.opf
      const containerPath = 'META-INF/container.xml';
      const containerXml = await this.zip.file(containerPath).async('text');
      const opfPath = this.parseContainer(containerXml);

      // Parse content.opf for metadata and spine
      const opfContent = await this.zip.file(opfPath).async('text');
      const opfDir = opfPath.substring(0, opfPath.lastIndexOf('/') + 1);

      const { metadata, spine, manifest } = this.parseOPF(opfContent);
      this.metadata = metadata;

      // Load chapters based on spine order
      this.chapters = [];
      for (const itemRef of spine) {
        const item = manifest.find(m => m.id === itemRef);
        if (item && item.mediaType === 'application/xhtml+xml') {
          const chapterPath = opfDir + item.href;
          const chapterContent = await this.zip.file(chapterPath)?.async('text');
          if (chapterContent) {
            const text = this.extractText(chapterContent);
            this.chapters.push({
              id: item.id,
              title: item.title || `Chapter ${this.chapters.length + 1}`,
              content: text
            });
          }
        }
      }

      return {
        title: this.metadata.title || 'Untitled',
        author: this.metadata.creator || 'Unknown Author',
        chapters: this.chapters,
        pages: this.paginateForVR()
      };
    } catch (error) {
      console.error('Error loading ePub:', error);
      throw error;
    }
  }

  /**
   * Parse container.xml to find rootfile path
   */
  parseContainer(xml) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xml, 'application/xml');
    const rootfile = doc.querySelector('rootfile');
    return rootfile?.getAttribute('full-path') || 'OEBPS/content.opf';
  }

  /**
   * Parse OPF file for metadata, manifest, and spine
   */
  parseOPF(xml) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xml, 'application/xml');

    // Metadata
    const metadata = {};
    const metadataEl = doc.querySelector('metadata');
    if (metadataEl) {
      const title = metadataEl.querySelector('title');
      const creator = metadataEl.querySelector('creator');
      const language = metadataEl.querySelector('language');
      const publisher = metadataEl.querySelector('publisher');

      metadata.title = title?.textContent;
      metadata.creator = creator?.textContent;
      metadata.language = language?.textContent;
      metadata.publisher = publisher?.textContent;
    }

    // Manifest
    const manifest = [];
    const manifestEl = doc.querySelector('manifest');
    if (manifestEl) {
      manifestEl.querySelectorAll('item').forEach(item => {
        manifest.push({
          id: item.getAttribute('id'),
          href: item.getAttribute('href'),
          mediaType: item.getAttribute('media-type')
        });
      });
    }

    // Spine
    const spine = [];
    const spineEl = doc.querySelector('spine');
    if (spineEl) {
      spineEl.querySelectorAll('itemref').forEach(itemref => {
        spine.push(itemref.getAttribute('idref'));
      });
    }

    return { metadata, manifest, spine };
  }

  /**
   * Extract plain text from XHTML content
   */
  extractText(xhtml) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xhtml, 'application/xhtml+xml');

    // Remove scripts, styles, etc.
    doc.querySelectorAll('script, style, meta, link').forEach(el => el.remove());

    // Get text content, preserving some structure
    const body = doc.body || doc.documentElement;
    let text = '';

    const processNode = (node, depth = 0) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const trimmed = node.textContent.trim();
        if (trimmed) {
          text += trimmed + ' ';
        }
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const tag = node.tagName.toLowerCase();

        // Add line breaks for block elements
        if (['p', 'div', 'br', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(tag)) {
          text += '\n';
        }

        // Add extra breaks for headings
        if (['h1', 'h2'].includes(tag)) {
          text += '\n';
        }

        node.childNodes.forEach(child => processNode(child, depth + 1));

        if (['p', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(tag)) {
          text += '\n';
        }
      }
    };

    processNode(body);

    // Clean up extra whitespace
    return text
      .replace(/\n\s*\n\s*\n/g, '\n\n')
      .replace(/  +/g, ' ')
      .trim();
  }

  /**
   * Paginate content for VR display
   * Returns array of page spreads (left + right)
   */
  paginateForVR(charsPerPage = 300) {
    const pages = [];
    let allText = '';

    // Combine all chapter content
    this.chapters.forEach((chapter, index) => {
      if (index > 0) allText += '\n\n---\n\n';
      allText += chapter.content;
    });

    // Title page
    pages.push({
      left: '',
      right: `${this.metadata.title || 'Libro'}\n\n${this.metadata.creator || ''}\n\n\nOnde Books VR`
    });

    // Split into pages
    const words = allText.split(/\s+/);
    let currentLeft = '';
    let currentRight = '';
    let isLeft = true;

    words.forEach(word => {
      const target = isLeft ? currentLeft : currentRight;
      const newTarget = target + (target ? ' ' : '') + word;

      if (newTarget.length > charsPerPage) {
        if (isLeft) {
          currentLeft = newTarget;
          isLeft = false;
        } else {
          pages.push({
            left: currentLeft.trim(),
            right: currentRight.trim()
          });
          currentLeft = word;
          currentRight = '';
          isLeft = false;
        }
      } else {
        if (isLeft) {
          currentLeft = newTarget;
        } else {
          currentRight = newTarget;
        }
      }
    });

    // Add remaining content
    if (currentLeft || currentRight) {
      pages.push({
        left: currentLeft.trim(),
        right: currentRight.trim()
      });
    }

    // End page
    pages.push({
      left: '',
      right: 'FINE\n\n\nGrazie per aver letto\ncon Onde Books VR\n\n\nonde-books.com'
    });

    return pages;
  }

  /**
   * Load external script dynamically
   */
  loadScript(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }
}

// Export for use in browser
if (typeof window !== 'undefined') {
  window.EpubParser = EpubParser;
}

// Export for Node.js/ES modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = EpubParser;
}
