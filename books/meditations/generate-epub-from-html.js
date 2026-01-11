const Epub = require('epub-gen');
const fs = require('fs');
const path = require('path');

// Book metadata
const booksEN = [
  { num: 1, title: 'Gratitude', theme: 'Lessons from Teachers and Family' },
  { num: 2, title: 'Acceptance', theme: 'On the River Gran, Among the Quadi' },
  { num: 3, title: 'Self-Mastery', theme: 'In Carnuntum' },
  { num: 4, title: 'The Inner Citadel', theme: 'Retreat Within Yourself' },
  { num: 5, title: 'Duty', theme: 'At Dawn, When You Awake' },
  { num: 6, title: 'Living with Nature', theme: 'The Universe and Change' },
  { num: 7, title: 'Resilience', theme: 'Pain, Pleasure, and Death' },
  { num: 8, title: 'The Present Moment', theme: 'Remember How Long' },
  { num: 9, title: 'Justice', theme: 'Injustice and Impiety' },
  { num: 10, title: 'A Healthy Mind', theme: "The Soul's Aspiration" },
  { num: 11, title: 'Improving the Soul', theme: 'The Rational Soul' },
  { num: 12, title: 'Graceful Acceptance', theme: 'All That You Pray For' }
];

const bookNamesEN = ['One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve'];

function extractChaptersFromHtml(htmlPath) {
  const html = fs.readFileSync(htmlPath, 'utf-8');
  const chapters = [];

  // Add forward as first chapter
  const forwardMatch = html.match(/<div class="page forward-page">([\s\S]*?)<\/div>/);
  if (forwardMatch) {
    let forwardContent = forwardMatch[1]
      .replace(/<p>/g, '<p style="font-style: italic; margin-bottom: 1.5em;">')
      .replace(/<div class="forward-signature">/g, '<p style="margin-top: 2em; text-align: right;">')
      .replace(/<\/div>/g, '</p>')
      .replace(/<br>/g, '<br/>');

    chapters.push({
      title: 'Forward',
      data: forwardContent
    });
  }

  // Extract each book's content
  for (let i = 0; i < 12; i++) {
    const bookNum = i + 1;
    const bookName = bookNamesEN[i];
    const bookTitle = booksEN[i].title;
    const bookTheme = booksEN[i].theme;

    // Find the book opener
    const openerRegex = new RegExp(`<div class="page book-opener">[\\s\\S]*?<div class="book-number">Book ${bookName}</div>[\\s\\S]*?<div class="book-title">${bookTitle}</div>[\\s\\S]*?<div class="book-theme">${bookTheme.replace(/[()]/g, '\\$&')}</div>`, 'i');
    const match = html.match(openerRegex);

    if (match) {
      const startIdx = match.index + match[0].length;

      // Find end (next book opener or end-page)
      let endIdx;
      if (i < 11) {
        const nextBookName = bookNamesEN[i + 1];
        const nextOpenerRegex = new RegExp(`<div class="page book-opener">[\\s\\S]*?<div class="book-number">Book ${nextBookName}</div>`, 'i');
        const nextMatch = html.substring(startIdx).match(nextOpenerRegex);
        endIdx = nextMatch ? startIdx + nextMatch.index : html.indexOf('end-page', startIdx);
      } else {
        endIdx = html.indexOf('end-page', startIdx);
      }

      const bookSection = html.substring(startIdx, endIdx > startIdx ? endIdx : undefined);

      // Extract all content divs
      let content = '';
      const contentRegex = /<div class="content">([\s\S]*?)<\/div>/g;
      let contentMatch;
      while ((contentMatch = contentRegex.exec(bookSection)) !== null) {
        content += contentMatch[1];
      }

      // Clean up content for EPUB
      content = content
        .replace(/<p>/g, '<p style="margin-bottom: 1em; text-indent: 1.5em;">')
        .replace(/&amp;/g, '&')
        .trim();

      chapters.push({
        title: `Book ${bookName}: ${bookTitle}`,
        data: `<h2 style="font-style: italic; color: #666; margin-bottom: 1em;">${bookTheme}</h2>${content || '<p>Content pending.</p>'}`
      });

      console.log(`Book ${bookNum}: Extracted content (${content.length} chars)`);
    } else {
      console.log(`Book ${bookNum}: Could not find opener`);
    }
  }

  return chapters;
}

async function generateEnglishEpub() {
  console.log('Generating English EPUB from HTML...');

  const htmlPath = path.join(__dirname, 'meditations-george-long.html');
  if (!fs.existsSync(htmlPath)) {
    console.error('HTML file not found:', htmlPath);
    return;
  }

  const chapters = extractChaptersFromHtml(htmlPath);
  console.log(`Extracted ${chapters.length} chapters`);

  const coverPath = path.join(__dirname, 'images/cover.jpg');

  const options = {
    title: 'Meditations',
    author: 'Marcus Aurelius',
    publisher: 'Onde Classics',
    cover: fs.existsSync(coverPath) ? coverPath : undefined,
    content: chapters,
    appendChapterTitles: false,
    lang: 'en',
    tocTitle: 'Contents',
    version: 3
  };

  const outputPath = path.join(__dirname, 'Meditations-Marcus-Aurelius-George-Long.epub');

  try {
    await new Epub(options, outputPath).promise;
    console.log(`English EPUB saved: ${outputPath}`);
  } catch (err) {
    console.error('Error generating English EPUB:', err);
  }
}

async function main() {
  await generateEnglishEpub();
  console.log('Done!');
}

main().catch(console.error);
