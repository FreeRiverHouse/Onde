const puppeteer = require('puppeteer');
const path = require('path');

async function createPDF() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // Load the HTML file
  await page.goto('http://localhost:3333/posts-preview.html', {
    waitUntil: 'networkidle0'
  });

  // Generate PDF
  const pdfPath = path.join(__dirname, 'OndePR-Posts-Approvazione.pdf');
  await page.pdf({
    path: pdfPath,
    format: 'A4',
    printBackground: true,
    margin: {
      top: '20mm',
      right: '15mm',
      bottom: '20mm',
      left: '15mm'
    }
  });

  await browser.close();
  console.log('PDF created:', pdfPath);
  return pdfPath;
}

createPDF().catch(console.error);
