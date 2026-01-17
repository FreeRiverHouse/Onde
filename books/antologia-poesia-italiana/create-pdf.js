const puppeteer = require('puppeteer');
const path = require('path');

async function createPDF() {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    const htmlPath = path.join(__dirname, 'antologia-sample.html');
    await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle0' });

    await page.pdf({
        path: path.join(__dirname, 'output', 'Antologia-3-Stili-Sample.pdf'),
        format: 'A4',
        printBackground: true,
        margin: {
            top: '1cm',
            bottom: '1cm',
            left: '1cm',
            right: '1cm'
        }
    });

    await browser.close();
    console.log('PDF created successfully!');
}

createPDF().catch(console.error);
