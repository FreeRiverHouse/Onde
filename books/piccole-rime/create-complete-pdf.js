const puppeteer = require('puppeteer');
const path = require('path');

async function createPDF() {
    console.log('Creazione PDF Piccole Rime completo...');

    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();

    // Carica il file HTML locale
    const htmlPath = path.join(__dirname, 'output', 'piccole-rime-complete.html');
    console.log('Caricamento HTML da:', htmlPath);

    await page.goto(`file://${htmlPath}`, {
        waitUntil: 'networkidle0'
    });

    // Aspetta che le immagini siano caricate
    console.log('Attendo caricamento immagini...');
    await page.waitForSelector('img', { timeout: 10000 });
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Genera il PDF
    const pdfPath = path.join(__dirname, 'output', 'Piccole-Rime-Complete.pdf');
    console.log('Generazione PDF...');

    await page.pdf({
        path: pdfPath,
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

    console.log('✅ PDF creato:', pdfPath);

    await browser.close();
}

createPDF().catch(console.error);
