const puppeteer = require('puppeteer');
const path = require('path');

async function generatePDFs() {
    console.log('Launching browser...');
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    // Generate Report PDF
    console.log('Generating Report PDF...');
    const reportPage = await browser.newPage();
    await reportPage.goto('file://' + path.join(__dirname, 'Onde-Book-Report-2026.html'), {
        waitUntil: 'networkidle0'
    });
    await reportPage.pdf({
        path: path.join(__dirname, 'Onde-Book-Report-2026.pdf'),
        format: 'A4',
        printBackground: true,
        margin: { top: '0', right: '0', bottom: '0', left: '0' }
    });
    console.log('Report PDF created: Onde-Book-Report-2026.pdf');

    // Generate Presentation PDF
    console.log('Generating Presentation PDF...');
    const presPage = await browser.newPage();
    await presPage.goto('file://' + path.join(__dirname, 'Onde-Book-Presentation-2026.html'), {
        waitUntil: 'networkidle0'
    });
    await presPage.pdf({
        path: path.join(__dirname, 'Onde-Book-Presentation-2026.pdf'),
        format: 'A4',
        landscape: true,
        printBackground: true,
        margin: { top: '0', right: '0', bottom: '0', left: '0' }
    });
    console.log('Presentation PDF created: Onde-Book-Presentation-2026.pdf');

    await browser.close();
    console.log('Done!');
}

generatePDFs().catch(err => {
    console.error('Error:', err);
    process.exit(1);
});
