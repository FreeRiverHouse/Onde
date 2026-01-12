/**
 * SAFE PDF GENERATOR
 * Generates PDF from EXISTING HTML without regenerating/overwriting it.
 * Use this for surgical upgrades to preserve manual modifications.
 */
const puppeteer = require('puppeteer');
const path = require('path');

async function generatePdfFromHtml(htmlFile, pdfFile) {
  console.log(`\n📖 Reading existing HTML: ${htmlFile}`);
  console.log(`📄 Will generate PDF: ${pdfFile}`);
  console.log(`⚠️  HTML will NOT be modified or regenerated\n`);

  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();

  // Load existing HTML file
  const htmlPath = path.resolve(__dirname, htmlFile);
  await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle0' });

  // Generate PDF
  const pdfPath = path.resolve(__dirname, pdfFile);
  await page.pdf({
    path: pdfPath,
    format: 'A4',
    printBackground: true,
    margin: { top: 0, right: 0, bottom: 0, left: 0 }
  });

  await browser.close();
  console.log(`✅ PDF saved: ${pdfPath}`);
  console.log(`\n🔍 VERIFY: Check that PDF has all expected elements before sending!`);
}

// Default: generate from george-long HTML (the correct one with forward)
const htmlFile = process.argv[2] || 'meditations-george-long.html';
const pdfFile = process.argv[3] || 'Meditations-Marcus-Aurelius-George-Long.pdf';

generatePdfFromHtml(htmlFile, pdfFile).catch(console.error);
