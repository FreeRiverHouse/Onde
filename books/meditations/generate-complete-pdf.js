const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

// Read the raw text
const rawText = fs.readFileSync(path.join(__dirname, 'meditations-raw.txt'), 'utf-8');
const lines = rawText.split('\n');

// Book structure (line numbers from raw file)
const books = [
  { num: 1, title: 'Gratitude', theme: 'Lessons from Loved Ones', start: 575, end: 906 },
  { num: 2, title: 'Acceptance', theme: 'The Common Nature of Mankind', start: 907, end: 1105 },
  { num: 3, title: 'Rational Analysis', theme: 'The Examination of Impressions', start: 1106, end: 1398 },
  { num: 4, title: 'The Inner Citadel', theme: 'Retreat Within Yourself', start: 1399, end: 1892 },
  { num: 5, title: 'Obstacles into Opportunities', theme: 'Virtue Through Duty', start: 1893, end: 2369 },
  { num: 6, title: 'Living with Nature', theme: 'Agreement with the Universe', start: 2370, end: 2885 },
  { num: 7, title: 'Resilience', theme: 'Interconnectedness and Endurance', start: 2886, end: 3424 },
  { num: 8, title: 'The Present Moment', theme: 'Detachment from Fame', start: 3425, end: 3972 },
  { num: 9, title: 'Justice', theme: 'The Common Good', start: 3973, end: 4455 },
  { num: 10, title: 'A Healthy Mind', theme: 'Trust in Providence', start: 4456, end: 4995 },
  { num: 11, title: 'Improving the Soul', theme: 'Judgment and Acceptance', start: 4996, end: 5398 },
  { num: 12, title: 'Graceful Acceptance', theme: 'Death and Divine Order', start: 5399, end: 5732 }
];

// Extract book text
function getBookText(start, end) {
  // Line numbers in file are 1-indexed, array is 0-indexed
  const bookLines = lines.slice(start - 1, end);

  // Skip the book title line (e.g., "THE FIRST BOOK") and empty lines after it
  let textStart = 0;
  for (let i = 0; i < bookLines.length; i++) {
    if (bookLines[i].match(/^THE\s+(FIRST|SECOND|THIRD|FOURTH|FIFTH|SIXTH|SEVENTH|EIGHTH|NINTH|TENTH|ELEVENTH|TWELFTH)\s+BOOK/i)) {
      textStart = i + 1;
      // Skip empty lines after title
      while (textStart < bookLines.length && bookLines[textStart].trim() === '') {
        textStart++;
      }
      break;
    }
  }

  // Get text and format into paragraphs
  const text = bookLines.slice(textStart).join('\n');

  // Split into sections by Roman numerals (I., II., III., etc.)
  const sections = text.split(/\n(?=[IVXLC]+\.\s)/);

  return sections.map(section => {
    // Clean up the section
    const cleaned = section
      .replace(/\n+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    return cleaned;
  }).filter(s => s.length > 0);
}

// Generate HTML
function generateHTML() {
  const css = `
    @page { size: A4; margin: 0; }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Libre Baskerville', Georgia, serif; background: #faf8f3; color: #2c2c2c; line-height: 1.7; }

    .page { width: 210mm; min-height: 297mm; background: #faf8f3; page-break-after: always; position: relative; padding: 20mm 25mm; }
    .page-break { page-break-after: always; }

    /* Cover */
    .cover { padding: 0; display: flex; flex-direction: column; }
    .cover-image { width: 100%; height: 100%; object-fit: cover; }

    /* Title Page */
    .title-page { display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; }
    .title-page h1 { font-family: 'Cinzel', serif; font-size: 36pt; color: #2c1810; letter-spacing: 4px; margin-bottom: 10mm; }
    .title-page .subtitle { font-size: 14pt; font-style: italic; color: #5a4a3a; margin-bottom: 15mm; }
    .title-page .author { font-family: 'Cinzel', serif; font-size: 18pt; color: #3d2d1d; letter-spacing: 3px; margin-bottom: 5mm; }
    .title-page .dates { font-size: 11pt; color: #8b7355; margin-bottom: 30mm; }
    .title-page .edition { font-size: 11pt; color: #5a4a3a; margin-top: 20mm; }
    .title-page .publisher-info { margin-top: auto; font-family: 'Cinzel', serif; font-size: 11pt; color: #8b7355; letter-spacing: 2px; }
    .ornament { font-size: 24pt; color: #d4af37; margin: 10mm 0; }

    /* Book opener */
    .book-opener { display: flex; flex-direction: column; align-items: center; justify-content: flex-start; padding-top: 30mm; }
    .book-opener img { width: 100%; max-height: 160mm; object-fit: contain; margin-bottom: 15mm; border-radius: 2mm; }
    .book-number { font-family: 'Cinzel', serif; font-size: 12pt; color: #8b7355; letter-spacing: 4px; text-transform: uppercase; margin-bottom: 3mm; }
    .book-title { font-family: 'Cinzel', serif; font-size: 24pt; color: #2c1810; letter-spacing: 2px; margin-bottom: 3mm; text-align: center; }
    .book-theme { font-style: italic; font-size: 12pt; color: #8b7355; text-align: center; }

    /* Content pages */
    .content { font-size: 10.5pt; text-align: justify; column-count: 1; }
    .content p { margin-bottom: 3mm; text-indent: 6mm; }
    .content p:first-child { text-indent: 0; }
    .content .section-num { font-family: 'Cinzel', serif; font-weight: bold; color: #8b7355; margin-right: 2mm; }

    /* Page numbers */
    .page-num { position: absolute; bottom: 12mm; left: 0; right: 0; text-align: center; font-family: 'Cinzel', serif; font-size: 10pt; color: #8b7355; }

    /* End page */
    .end-page { display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; }
    .finis { font-family: 'Cinzel', serif; font-size: 18pt; color: #2c1810; letter-spacing: 4px; margin-bottom: 20mm; }
    .credits { font-size: 10pt; color: #8b7355; line-height: 2.2; }
    .credits strong { color: #5a4a3a; }
  `;

  let html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Meditations - Marcus Aurelius - Complete Integral Edition</title>
  <link href="https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Cinzel:wght@400;600;700&display=swap" rel="stylesheet">
  <style>${css}</style>
</head>
<body>

<!-- Cover -->
<div class="page cover">
  <img src="images/cover.jpg" alt="Meditations Cover" class="cover-image">
</div>

<!-- Title Page -->
<div class="page title-page">
  <div class="ornament">✦</div>
  <h1>MEDITATIONS</h1>
  <div class="subtitle">Thoughts to Himself</div>
  <div class="author">MARCUS AURELIUS ANTONINUS</div>
  <div class="dates">Emperor of Rome, 161-180 AD</div>
  <div class="ornament">✦ ✦ ✦</div>
  <div class="edition">Complete Integral Edition<br>Translated by Meric Casaubon (1634)</div>
  <div class="publisher-info">ONDE CLASSICS<br>Los Angeles, 2026</div>
</div>

<!-- Dedication -->
<div class="page title-page">
  <div class="ornament">✦</div>
  <p style="font-style: italic; font-size: 14pt; color: #5a4a3a; max-width: 120mm; line-height: 2;">
    To all who seek wisdom<br>in times of turmoil,<br>and peace<br>in the midst of chaos.
  </p>
  <div class="ornament">✦</div>
</div>
`;

  let pageNum = 1;

  // Generate each book
  for (const book of books) {
    const sections = getBookText(book.start, book.end);

    // Book opener page with illustration
    html += `
<!-- Book ${book.num} Opener -->
<div class="page book-opener">
  <img src="images/book${book.num}.jpg" alt="Book ${book.num} Illustration">
  <div class="book-number">Book ${['One','Two','Three','Four','Five','Six','Seven','Eight','Nine','Ten','Eleven','Twelve'][book.num-1]}</div>
  <div class="book-title">${book.title}</div>
  <div class="book-theme">${book.theme}</div>
  <div class="page-num">${pageNum++}</div>
</div>
`;

    // Content pages - estimate ~2500 chars per page
    let currentContent = '';
    const CHARS_PER_PAGE = 2800;

    for (let i = 0; i < sections.length; i++) {
      const section = sections[i];
      const sectionHTML = `<p><span class="section-num">${toRoman(i + 1)}.</span> ${escapeHTML(section.replace(/^[IVXLC]+\.\s*/, ''))}</p>\n`;

      if ((currentContent + sectionHTML).length > CHARS_PER_PAGE && currentContent.length > 0) {
        // Output current page
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

    // Output remaining content
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
<!-- End Page -->
<div class="page end-page">
  <div class="ornament">✦</div>
  <div class="finis">FINIS</div>
  <div class="ornament">✦ ✦ ✦</div>
  <div class="credits">
    <strong>Meditations</strong><br>
    Marcus Aurelius Antoninus<br><br>
    Complete Integral Edition<br>
    Translated by Meric Casaubon (1634)<br>
    Public Domain Text from Project Gutenberg<br><br>
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

  return html;
}

function toRoman(num) {
  const romanNumerals = [
    ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX'],
    ['', 'X', 'XX', 'XXX', 'XL', 'L', 'LX', 'LXX', 'LXXX', 'XC'],
    ['', 'C', 'CC', 'CCC', 'CD', 'D', 'DC', 'DCC', 'DCCC', 'CM']
  ];
  const digits = String(num).padStart(3, '0').split('');
  return digits.map((d, i) => romanNumerals[2-i][parseInt(d)]).join('');
}

function escapeHTML(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

async function generatePDF() {
  console.log('Generating complete integral HTML...');
  const html = generateHTML();

  const htmlPath = path.join(__dirname, 'meditations-complete.html');
  fs.writeFileSync(htmlPath, html);
  console.log(`HTML saved to: ${htmlPath}`);

  console.log('Launching browser for PDF generation...');
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();

  await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle0' });

  const pdfPath = path.join(__dirname, 'Meditations-Marcus-Aurelius-Complete.pdf');
  await page.pdf({
    path: pdfPath,
    format: 'A4',
    printBackground: true,
    margin: { top: 0, right: 0, bottom: 0, left: 0 }
  });

  await browser.close();
  console.log(`PDF saved to: ${pdfPath}`);
  console.log('Done! Complete integral edition generated.');
}

generatePDF().catch(console.error);
