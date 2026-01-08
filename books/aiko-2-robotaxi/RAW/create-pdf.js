const puppeteer = require('puppeteer');
const fs = require('fs');

async function createPDF() {
  const text = fs.readFileSync('/Users/mattia/Projects/Onde/books/aiko-2-robotaxi/RAW/aiko-2-full-text.txt', 'utf8');

  const cleanText = text
    .replace(/\[ILLUSTRATION:[^\]]+\]/g, '')
    .replace(/═+/g, '─────────────────────────')
    .replace(/\n{3,}/g, '\n\n');

  const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
@page { margin: 1in; }
body { font-family: Georgia, serif; font-size: 12pt; line-height: 1.8; color: #333; }
h1 { text-align: center; font-size: 28pt; margin-bottom: 5px; }
h2 { text-align: center; font-size: 16pt; font-weight: normal; font-style: italic; color: #666; }
.meta { text-align: center; margin: 20px 0; font-size: 11pt; }
.dedication { text-align: center; font-style: italic; margin: 40px 20px; padding: 20px; border-top: 1px solid #999; border-bottom: 1px solid #999; }
.content { white-space: pre-wrap; font-family: Georgia, serif; }
</style>
</head>
<body>
<h1>AIKO 2</h1>
<h2>The Robotaxi Adventure</h2>
<div class="meta">Written by Gianni Parola<br>Illustrated by Pina Pennello<br>Published by Onde, Free River House<br><br><em>A sequel to "AIKO - AI Explained to Children"</em></div>
<div class="dedication">For every child who looks out the car window<br>and wonders:<br><strong>"What if the car could drive itself?"</strong><br><br>The future is closer than you think.</div>
<div class="content">${cleanText.split('─────────────────────────').slice(2).join('\n\n─────────────────────────\n\n')}</div>
</body>
</html>`;

  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'networkidle0' });
  await page.pdf({
    path: '/Users/mattia/Projects/Onde/books/aiko-2-robotaxi/RAW/AIKO-2-Robotaxi-DRAFT.pdf',
    format: 'A4',
    printBackground: true,
    margin: { top: '1in', right: '1in', bottom: '1in', left: '1in' }
  });
  await browser.close();
  console.log('PDF created!');
}

createPDF().catch(console.error);
