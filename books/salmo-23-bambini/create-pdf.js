const puppeteer = require('puppeteer');
const path = require('path');

async function createPDF() {
    const version = process.argv[2] || 'v2';
    const htmlFile = version === 'v1' ? 'libro.html' : 'libro-v2.html';
    const pdfFile = `libro-${version}.pdf`;

    console.log(`Creazione PDF ${version}...`);

    const browser = await puppeteer.launch({
        headless: 'new'
    });

    const page = await browser.newPage();

    // Carica il file HTML locale
    const htmlPath = path.join(__dirname, htmlFile);
    await page.goto(`file://${htmlPath}`, {
        waitUntil: 'networkidle0'
    });

    // Aspetta che le immagini siano caricate
    await page.waitForSelector('img');
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Genera il PDF
    await page.pdf({
        path: path.join(__dirname, pdfFile),
        format: 'A4',
        printBackground: true,
        margin: {
            top: '0',
            right: '0',
            bottom: '0',
            left: '0'
        },
        preferCSSPageSize: true
    });

    console.log(`PDF creato: ${pdfFile}`);

    await browser.close();
}

createPDF().catch(console.error);
