
const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.goto('file:///Users/mattiapetrucciani/CascadeProjects/Onde/books/milo-ai/output/milo-ai.html', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 2000));
  await page.pdf({ path: '/Users/mattiapetrucciani/CascadeProjects/Onde/books/milo-ai/output/MILO-AI.pdf', format: 'A4', printBackground: true, margin: { top: 0, right: 0, bottom: 0, left: 0 } });
  await browser.close();
  console.log('PDF generated: MILO-AI.pdf');
})();