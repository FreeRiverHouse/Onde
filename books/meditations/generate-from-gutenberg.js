const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

// Book metadata with themes
const books = [
  { num: 1, name: 'One', title: 'Gratitude', theme: 'Lessons from Teachers and Family', start: 'THE FIRST BOOK', end: 'THE SECOND BOOK' },
  { num: 2, name: 'Two', title: 'Acceptance', theme: 'On the River Gran, Among the Quadi', start: 'THE SECOND BOOK', end: 'THE THIRD BOOK' },
  { num: 3, name: 'Three', title: 'Self-Mastery', theme: 'In Carnuntum', start: 'THE THIRD BOOK', end: 'THE FOURTH BOOK' },
  { num: 4, name: 'Four', title: 'The Inner Citadel', theme: 'Retreat Within Yourself', start: 'THE FOURTH BOOK', end: 'THE FIFTH BOOK' },
  { num: 5, name: 'Five', title: 'Duty', theme: 'At Dawn, When You Awake', start: 'THE FIFTH BOOK', end: 'THE SIXTH BOOK' },
  { num: 6, name: 'Six', title: 'Living with Nature', theme: 'The Universe and Change', start: 'THE SIXTH BOOK', end: 'THE SEVENTH BOOK' },
  { num: 7, name: 'Seven', title: 'Resilience', theme: 'Pain, Pleasure, and Death', start: 'THE SEVENTH BOOK', end: 'THE EIGHTH BOOK' },
  { num: 8, name: 'Eight', title: 'The Present Moment', theme: 'Remember How Long', start: 'THE EIGHTH BOOK', end: 'THE NINTH BOOK' },
  { num: 9, name: 'Nine', title: 'Justice', theme: 'Injustice and Impiety', start: 'THE NINTH BOOK', end: 'THE TENTH BOOK' },
  { num: 10, name: 'Ten', title: 'A Healthy Mind', theme: "The Soul's Aspiration", start: 'THE TENTH BOOK', end: 'THE ELEVENTH BOOK' },
  { num: 11, name: 'Eleven', title: 'Improving the Soul', theme: 'The Rational Soul', start: 'THE ELEVENTH BOOK', end: 'THE TWELFTH BOOK' },
  { num: 12, name: 'Twelve', title: 'Graceful Acceptance', theme: 'All That You Pray For', start: 'THE TWELFTH BOOK', end: 'APPENDIX' }
];

function extractBookText(fullText, startMarker, endMarker) {
  const startIdx = fullText.indexOf(startMarker);
  if (startIdx === -1) return [];

  let text = fullText.substring(startIdx + startMarker.length);
  const endIdx = text.indexOf(endMarker);
  if (endIdx !== -1) {
    text = text.substring(0, endIdx);
  }

  // Split into paragraphs based on Roman numeral sections
  const paragraphs = [];
  let currentPara = '';

  const lines = text.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();

    // Check if this is a new numbered section (Roman numerals)
    if (/^[IVXLC]+\.\s/.test(trimmed)) {
      if (currentPara) {
        paragraphs.push(currentPara.trim());
      }
      currentPara = trimmed;
    } else if (trimmed === '') {
      if (currentPara) {
        paragraphs.push(currentPara.trim());
        currentPara = '';
      }
    } else {
      currentPara += (currentPara ? ' ' : '') + trimmed;
    }
  }
  if (currentPara) {
    paragraphs.push(currentPara.trim());
  }

  // Filter out very short paragraphs and clean up
  return paragraphs.filter(p => p.length > 30);
}

async function main() {
  console.log('Reading George Long translation from Project Gutenberg...');

  // Read from the classics folder where we have verified Gutenberg text
  const gutenbergPath = path.join(__dirname, '..', 'classics', 'meditations', 'raw-gutenberg.txt');
  const fullText = fs.readFileSync(gutenbergPath, 'utf-8');

  console.log(`Read ${fullText.length} characters`);

  // Extract each book
  const bookTexts = [];
  for (const book of books) {
    const sections = extractBookText(fullText, book.start, book.end);
    bookTexts.push(sections);
    console.log(`Book ${book.num}: ${sections.length} sections extracted`);
  }

  // CSS styling
  const css = `
    @page { size: A4; margin: 0; }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Libre Baskerville', Georgia, serif; background: #faf8f3; color: #2c2c2c; line-height: 1.75; font-size: 11pt; }
    .page { width: 210mm; min-height: 297mm; background: #faf8f3; page-break-after: always; position: relative; padding: 20mm 25mm; }

    .cover { padding: 0; }
    .cover-image { width: 100%; height: 100%; object-fit: cover; }

    .title-page { display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; }
    .title-page h1 { font-family: 'Cinzel', serif; font-size: 36pt; color: #2c1810; letter-spacing: 4px; margin-bottom: 10mm; }
    .title-page .subtitle { font-size: 14pt; font-style: italic; color: #5a4a3a; margin-bottom: 15mm; }
    .title-page .author { font-family: 'Cinzel', serif; font-size: 18pt; color: #3d2d1d; letter-spacing: 3px; margin-bottom: 5mm; }
    .title-page .dates { font-size: 11pt; color: #8b7355; margin-bottom: 30mm; }
    .title-page .edition { font-size: 11pt; color: #5a4a3a; margin-top: 20mm; }
    .title-page .publisher-info { margin-top: auto; font-family: 'Cinzel', serif; font-size: 11pt; color: #8b7355; letter-spacing: 2px; }
    .ornament { font-size: 24pt; color: #d4af37; margin: 10mm 0; }

    .forward-page { padding: 25mm 30mm; }
    .forward-page p { font-style: italic; font-size: 11pt; color: #5a4a3a; line-height: 2.2; text-align: left; margin-bottom: 4mm; }
    .forward-signature { margin-top: 15mm; text-align: right; font-style: normal; color: #8b7355; }

    .book-opener { display: flex; flex-direction: column; align-items: center; padding-top: 15mm; }
    .book-opener img { width: 100%; max-height: 150mm; object-fit: contain; margin-bottom: 12mm; border-radius: 2mm; }
    .book-number { font-family: 'Cinzel', serif; font-size: 12pt; color: #8b7355; letter-spacing: 4px; text-transform: uppercase; margin-bottom: 3mm; }
    .book-title { font-family: 'Cinzel', serif; font-size: 24pt; color: #2c1810; letter-spacing: 2px; margin-bottom: 3mm; text-align: center; }
    .book-theme { font-style: italic; font-size: 12pt; color: #8b7355; text-align: center; }

    .content { text-align: justify; }
    .content p { margin-bottom: 4mm; text-indent: 6mm; }
    .content p:first-child { text-indent: 0; }

    .page-num { position: absolute; bottom: 12mm; left: 0; right: 0; text-align: center; font-family: 'Cinzel', serif; font-size: 10pt; color: #8b7355; }

    .end-page { display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; }
    .finis { font-family: 'Cinzel', serif; font-size: 18pt; color: #2c1810; letter-spacing: 4px; margin-bottom: 20mm; }
    .credits { font-size: 10pt; color: #8b7355; line-height: 2.2; }
    .credits strong { color: #5a4a3a; }
  `;

  // Build HTML document
  let html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Meditations - Marcus Aurelius - George Long Translation</title>
  <link href="https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Cinzel:wght@400;600;700&display=swap" rel="stylesheet">
  <style>${css}</style>
</head>
<body>

<div class="page cover">
  <img src="images/cover.jpg" alt="Meditations Cover" class="cover-image">
</div>

<div class="page title-page">
  <div class="ornament">\u2726</div>
  <h1>MEDITATIONS</h1>
  <div class="subtitle">Thoughts to Himself</div>
  <div class="author">MARCUS AURELIUS ANTONINUS</div>
  <div class="dates">Emperor of Rome, 161\u2013180 AD</div>
  <div class="ornament">\u2726 \u2726 \u2726</div>
  <div class="edition">Complete Illustrated Edition<br>Translated by George Long (1862)</div>
  <div class="publisher-info">ONDE CLASSICS<br>Los Angeles, 2026</div>
</div>

<div class="page title-page">
  <div class="ornament">\u2726</div>
  <p style="font-style: italic; font-size: 14pt; color: #5a4a3a; max-width: 120mm; line-height: 2;">
    To all who seek wisdom<br>in times of turmoil,<br>and peace<br>in the midst of chaos.
  </p>
  <div class="ornament">\u2726</div>
</div>

<div class="page forward-page">
  <p>You found this. Or maybe it found you.</p>
  <p>A Roman emperor wrote these words two thousand years ago, alone in his tent, after long days of war. They were never meant to be read by anyone else. Just a man trying to stay sane, stay kind, stay human\u2014while the weight of an empire pressed down on him.</p>
  <p>And somehow, here they are. In your hands.</p>
  <p>We\u2019re Onde, a small publishing house in Los Angeles. The rest is between you and Marcus.</p>
  <div class="forward-signature">\u2014 Gianni Parola<br>Editor, Onde Classics</div>
</div>

`;

  let pageNum = 1;
  const CHARS_PER_PAGE = 2600;

  // Generate each book
  for (let b = 0; b < 12; b++) {
    const book = books[b];
    const sections = bookTexts[b];

    // Book opener page with illustration
    html += `
<div class="page book-opener">
  <img src="images/book${book.num}.jpg" alt="Book ${book.num} Illustration">
  <div class="book-number">Book ${book.name}</div>
  <div class="book-title">${book.title}</div>
  <div class="book-theme">${book.theme}</div>
  <div class="page-num">${pageNum++}</div>
</div>
`;

    // Content pages
    let currentContent = '';

    for (const section of sections) {
      const escaped = section
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
      const sectionHTML = `<p>${escaped}</p>\n`;

      if ((currentContent + sectionHTML).length > CHARS_PER_PAGE && currentContent.length > 0) {
        html += `
<div class="page">
  <div class="content">${currentContent}</div>
  <div class="page-num">${pageNum++}</div>
</div>
`;
        currentContent = sectionHTML;
      } else {
        currentContent += sectionHTML;
      }
    }

    if (currentContent.length > 0) {
      html += `
<div class="page">
  <div class="content">${currentContent}</div>
  <div class="page-num">${pageNum++}</div>
</div>
`;
    }
  }

  // End page
  html += `
<div class="page end-page">
  <div class="ornament">\u2726</div>
  <div class="finis">FINIS</div>
  <div class="ornament">\u2726 \u2726 \u2726</div>
  <div class="credits">
    <strong>Meditations</strong><br>
    Marcus Aurelius Antoninus<br><br>
    Translated by George Long (1862)<br>
    Public Domain<br><br>
    <strong>Illustrations</strong><br>
    Generated with Grok AI<br>
    Art Direction by Pina Pennello<br><br>
    <strong>Published by</strong><br>
    Onde Classics<br>
    Los Angeles, 2026<br><br>
    <em>onde.la</em>
  </div>
</div>

</body>
</html>`;

  // Save HTML
  const htmlPath = path.join(__dirname, 'meditations-george-long.html');
  fs.writeFileSync(htmlPath, html);
  console.log(`HTML saved: ${htmlPath}`);
  console.log(`Total pages: ${pageNum}`);

  // Generate PDF
  console.log('Generating PDF...');
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle0' });

  const pdfPath = path.join(__dirname, 'Meditations-Marcus-Aurelius-George-Long.pdf');
  await page.pdf({
    path: pdfPath,
    format: 'A4',
    printBackground: true,
    margin: { top: 0, right: 0, bottom: 0, left: 0 }
  });

  await browser.close();
  console.log(`PDF saved: ${pdfPath}`);
}

main().catch(console.error);
