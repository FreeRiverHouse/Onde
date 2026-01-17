const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

async function createCover() {
    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();

    // KDP recommended cover size: 1600x2560 (1:1.6 ratio)
    await page.setViewport({
        width: 1600,
        height: 2560,
        deviceScaleFactor: 1
    });

    const coverImagePath = '/Users/mattiapetrucciani/CascadeProjects/OndePRDB/clients/onde/books/the-shepherds-promise/images/00-copertina.jpg';

    const html = `
<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Quicksand:wght@400;500;600&display=swap');

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            width: 1600px;
            height: 2560px;
            background: linear-gradient(180deg, #f5d782 0%, #a8d4a0 50%, #7eb8da 100%);
            display: flex;
            flex-direction: column;
            align-items: center;
            font-family: 'Quicksand', sans-serif;
        }

        .cover-image {
            width: 1400px;
            height: auto;
            margin-top: 80px;
            border-radius: 30px;
            box-shadow: 0 30px 100px rgba(0,0,0,0.3);
            border: 10px solid white;
        }

        h1 {
            font-family: 'Libre Baskerville', serif;
            font-size: 100px;
            color: #2c5530;
            margin-top: 80px;
            text-shadow: 4px 4px 8px rgba(255,255,255,0.9);
            letter-spacing: 2px;
            text-align: center;
            padding: 0 60px;
        }

        h2 {
            font-size: 48px;
            color: #3d6b41;
            font-weight: 400;
            font-style: italic;
            margin-top: 30px;
            text-align: center;
        }

        .publisher {
            font-size: 36px;
            color: #4a6b4a;
            margin-top: auto;
            margin-bottom: 60px;
            text-align: center;
        }
    </style>
</head>
<body>
    <img class="cover-image" src="file://${coverImagePath}" alt="Copertina">
    <h1>La Promessa del Pastore</h1>
    <h2>Salmo 23: Una storia di abbondanza e fiducia</h2>
    <p class="publisher">Published by Onde, Free River House</p>
</body>
</html>`;

    await page.setContent(html, { waitUntil: 'networkidle0' });

    // Wait for fonts and image to load
    await page.evaluateHandle('document.fonts.ready');
    await new Promise(resolve => setTimeout(resolve, 2000));

    const outputPath = '/Users/mattiapetrucciani/CascadeProjects/OndePRDB/clients/onde/books/the-shepherds-promise/cover-kdp.jpg';

    await page.screenshot({
        path: outputPath,
        type: 'jpeg',
        quality: 95,
        fullPage: false
    });

    console.log(`Cover created: ${outputPath}`);

    await browser.close();
}

createCover().catch(console.error);
