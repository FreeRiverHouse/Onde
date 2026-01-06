const puppeteer = require('puppeteer');
const path = require('path');

async function createPDF() {
    console.log('Creating PDF...');

    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();

    await page.goto(`file://${path.join(__dirname, 'book.html')}`, {
        waitUntil: 'networkidle0'
    });

    await page.waitForSelector('img');
    await new Promise(resolve => setTimeout(resolve, 3000));

    await page.pdf({
        path: path.join(__dirname, 'psalm-23-children.pdf'),
        format: 'A4',
        printBackground: true,
        margin: { top: '0', right: '0', bottom: '0', left: '0' },
        preferCSSPageSize: true
    });

    console.log('PDF created: psalm-23-children.pdf');
    await browser.close();
}

createPDF().catch(console.error);
