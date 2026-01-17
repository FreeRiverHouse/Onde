const puppeteer = require('puppeteer');
const path = require('path');

async function createPDF() {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    
    const htmlPath = path.join(__dirname, 'book.html');
    await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle0' });
    
    await page.pdf({
        path: 'My-Good-Shepherd-Psalm23.pdf',
        format: 'A4',
        printBackground: true,
        margin: { top: 0, right: 0, bottom: 0, left: 0 }
    });
    
    await browser.close();
    console.log('PDF created: My-Good-Shepherd-Psalm23.pdf');
}

createPDF().catch(console.error);
