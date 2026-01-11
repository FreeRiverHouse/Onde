const puppeteer = require('puppeteer');
const path = require('path');

async function generatePDF() {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    const htmlPath = path.join(__dirname, 'frankenstein.html');
    await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle0' });

    await page.pdf({
        path: path.join(__dirname, 'Frankenstein-MaryShelley-OndeClassics.pdf'),
        format: 'A4',
        printBackground: true,
        margin: { top: 0, right: 0, bottom: 0, left: 0 }
    });

    await browser.close();
    console.log('PDF generated: Frankenstein-MaryShelley-OndeClassics.pdf');
}

generatePDF().catch(console.error);
