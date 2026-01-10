const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    
    const htmlPath = path.join(__dirname, '../docs/Onde-Report-Dettagliato-2026.html');
    await page.goto('file://' + htmlPath, { waitUntil: 'networkidle0' });
    
    await page.pdf({
        path: path.join(__dirname, '../docs/Onde-Report-Dettagliato-2026.pdf'),
        format: 'A4',
        printBackground: true,
        margin: { top: '20px', right: '20px', bottom: '20px', left: '20px' }
    });
    
    console.log('Report PDF created!');
    await browser.close();
})();
