/**
 * Extract RAW materials from AIKO HTML
 * - Extracts all images as separate files
 * - Extracts all text content
 */

const fs = require('fs');
const path = require('path');

const INPUT_FILE = '/Users/mattiapetrucciani/CascadeProjects/Onde/books/aiko-ai-children/output/AIKO-Elegant-Final.html';
const RAW_DIR = '/Users/mattiapetrucciani/CascadeProjects/Onde/books/aiko-ai-children/RAW';
const IMAGES_DIR = path.join(RAW_DIR, 'images');

// Ensure directories exist
if (!fs.existsSync(RAW_DIR)) fs.mkdirSync(RAW_DIR, { recursive: true });
if (!fs.existsSync(IMAGES_DIR)) fs.mkdirSync(IMAGES_DIR, { recursive: true });

console.log('📦 Extracting RAW materials from AIKO...\n');

// Read HTML
const html = fs.readFileSync(INPUT_FILE, 'utf8');

// Extract cover image
const coverMatch = html.match(/class="cover-image"[^>]*src="data:image\/([^;]+);base64,([^"]+)"/);
if (coverMatch) {
  const ext = coverMatch[1] === 'jpeg' ? 'jpg' : coverMatch[1];
  const data = Buffer.from(coverMatch[2], 'base64');
  fs.writeFileSync(path.join(IMAGES_DIR, `00-cover.${ext}`), data);
  console.log('✅ Extracted: 00-cover.' + ext);
}

// Extract chapter images
const chapterPattern = /class="chapter-image"[^>]*src="data:image\/([^;]+);base64,([^"]+)"/g;
let match;
let chapterNum = 0;
while ((match = chapterPattern.exec(html)) !== null) {
  chapterNum++;
  const ext = match[1] === 'jpeg' ? 'jpg' : match[1];
  const data = Buffer.from(match[2], 'base64');
  const filename = `chapter-${chapterNum.toString().padStart(2, '0')}.${ext}`;
  fs.writeFileSync(path.join(IMAGES_DIR, filename), data);
  console.log(`✅ Extracted: ${filename}`);
}

// Extract text content
const chapters = [];

// Cover info
const titleMatch = html.match(/class="cover-title">([^<]+)</);
const subtitleMatch = html.match(/class="cover-subtitle">([^<]+)</);
const authorMatch = html.match(/class="cover-author">([^<]+)</);

chapters.push({
  type: 'cover',
  title: titleMatch ? titleMatch[1] : 'AIKO',
  subtitle: subtitleMatch ? subtitleMatch[1] : '',
  author: authorMatch ? authorMatch[1].replace(/<br[^>]*>/g, '\n') : ''
});

// Dedication
const dedicationMatch = html.match(/class="dedication-text">([^<]+(?:<em>[^<]+<\/em>[^<]*)*)/);
if (dedicationMatch) {
  chapters.push({
    type: 'dedication',
    text: dedicationMatch[1].replace(/<\/?em>/g, '').trim()
  });
}

// Chapter content - extract from chapter-page divs
const chapterPagePattern = /<div class="page chapter-page">([\s\S]*?)<\/div>\s*(?=<div class="page|$)/g;
let chapterMatch;
let chNum = 0;

while ((chapterMatch = chapterPagePattern.exec(html)) !== null) {
  chNum++;
  const content = chapterMatch[1];

  // Extract chapter number and title
  const numMatch = content.match(/class="chapter-number">([^<]+)</);
  const titleMatch = content.match(/class="chapter-title">([^<]+)</);

  // Extract paragraphs
  const paragraphs = [];
  const pPattern = /<p>([^<]+)<\/p>/g;
  let pMatch;
  while ((pMatch = pPattern.exec(content)) !== null) {
    paragraphs.push(pMatch[1].trim());
  }

  chapters.push({
    type: 'chapter',
    number: numMatch ? numMatch[1] : `Chapter ${chNum}`,
    title: titleMatch ? titleMatch[1] : '',
    text: paragraphs.join('\n\n')
  });
}

// Save text content
let textContent = `# AIKO - AI Explained to Children
## Raw Text Content

---

`;

chapters.forEach(ch => {
  if (ch.type === 'cover') {
    textContent += `# ${ch.title}\n${ch.subtitle}\n\n${ch.author}\n\n---\n\n`;
  } else if (ch.type === 'dedication') {
    textContent += `## Dedication\n\n${ch.text}\n\n---\n\n`;
  } else if (ch.type === 'chapter') {
    textContent += `## ${ch.number}: ${ch.title}\n\n${ch.text}\n\n---\n\n`;
  }
});

fs.writeFileSync(path.join(RAW_DIR, 'text-content.md'), textContent);
console.log('\n✅ Extracted: text-content.md');

// Save chapter mapping
const mapping = {
  cover: '00-cover.jpg',
  chapters: Array.from({length: chapterNum}, (_, i) => ({
    number: i + 1,
    image: `chapter-${(i+1).toString().padStart(2, '0')}.jpg`
  }))
};
fs.writeFileSync(path.join(RAW_DIR, 'image-mapping.json'), JSON.stringify(mapping, null, 2));
console.log('✅ Extracted: image-mapping.json');

console.log(`\n📊 Summary:
- Cover image: 1
- Chapter images: ${chapterNum}
- Text chapters: ${chapters.filter(c => c.type === 'chapter').length}
- Output dir: ${RAW_DIR}`);
