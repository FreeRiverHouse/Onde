const puppeteer = require('puppeteer');
const path = require('path');

async function createPDF() {
  console.log('Launching browser...');
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();

  const htmlPath = path.resolve(__dirname, 'output/AIKO-book-v2.html');
  console.log('Loading HTML:', htmlPath);

  await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle0' });

  // Wait for images to load
  await page.waitForSelector('img');
  await new Promise(resolve => setTimeout(resolve, 2000));

  console.log('Generating PDF...');
  await page.pdf({
    path: 'output/AIKO-AI-Explained-to-Children.pdf',
    format: 'Letter',
    printBackground: true,
    margin: { top: 0, right: 0, bottom: 0, left: 0 }
  });

  await browser.close();
  console.log('PDF created: output/AIKO-AI-Explained-to-Children.pdf');
}

createPDF().catch(console.error);
