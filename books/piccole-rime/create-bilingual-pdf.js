const puppeteer = require('puppeteer');
const path = require('path');

async function createBilingualPDF() {
    console.log('Creazione PDF Piccole Rime BILINGUE (IT-EN)...');

    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();

    // Carica il file HTML bilingue
    const htmlPath = path.join(__dirname, 'output', 'piccole-rime-bilingual.html');
    console.log('Caricamento HTML bilingue da:', htmlPath);

    await page.goto(`file://${htmlPath}`, {
        waitUntil: 'networkidle0'
    });

    // Aspetta che le immagini siano caricate
    console.log('Attendo caricamento immagini...');
    await page.waitForSelector('img', { timeout: 10000 });
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Genera il PDF
    const pdfPath = path.join(__dirname, 'output', 'Piccole-Rime-Bilingual-IT-EN.pdf');
    console.log('Generazione PDF bilingue...');

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

    console.log('✅ PDF BILINGUE creato:', pdfPath);

    await browser.close();
}

createBilingualPDF().catch(console.error);
