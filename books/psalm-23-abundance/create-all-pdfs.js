const puppeteer = require('puppeteer');
const path = require('path');

const translations = [
  { lang: 'es', title: 'La Promesa del Pastor' },
  { lang: 'fr', title: 'La Promesse du Berger' },
  { lang: 'de', title: 'Das Versprechen des Hirten' },
  { lang: 'ko', title: '목자의 약속' }
];

async function createPDF(lang, title) {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  const htmlPath = path.join(__dirname, `book-${lang}.html`);
  const pdfPath = path.join(__dirname, `psalm-23-abundance-${lang}.pdf`);

  await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle0' });

  await page.pdf({
    path: pdfPath,
    format: 'A4',
    printBackground: true,
    margin: { top: 0, right: 0, bottom: 0, left: 0 }
  });

  await browser.close();
  console.log(`Created: ${title} (${lang}) -> ${pdfPath}`);
}

async function createAllPDFs() {
  console.log('Creating PDFs for all translations...\n');

  for (const { lang, title } of translations) {
    await createPDF(lang, title);
  }

  console.log('\nAll PDFs created successfully!');
}

createAllPDFs().catch(console.error);
