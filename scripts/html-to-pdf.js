const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    
    const htmlPath = path.join(__dirname, '../docs/Onde-Presentation-2026.html');
    await page.goto('file://' + htmlPath, { waitUntil: 'networkidle0' });
    
    await page.pdf({
        path: path.join(__dirname, '../docs/Onde-Presentation-2026.pdf'),
        width: '1280px',
        height: '720px',
        printBackground: true,
        margin: { top: 0, right: 0, bottom: 0, left: 0 }
    });
    
    console.log('PDF Slides created!');
    await browser.close();
})();
