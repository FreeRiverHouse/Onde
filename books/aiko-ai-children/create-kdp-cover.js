const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const coverPath = '/Users/mattiapetrucciani/CascadeProjects/Onde/books/aiko-ai-children/images/cover-aiko-new.jpg';
const outputDir = '/Users/mattiapetrucciani/CascadeProjects/Onde/books/aiko-ai-children/output';

function imageToBase64(filePath) {
  const data = fs.readFileSync(filePath);
  return `data:image/jpeg;base64,${data.toString('base64')}`;
}

async function createCover() {
  console.log('Creating KDP Cover with title...\n');

  const coverHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;700&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      width: 1600px; height: 2560px;
      display: flex; flex-direction: column;
      align-items: center; justify-content: center;
      background: linear-gradient(180deg, #fef9e7 0%, #fdf6e3 100%);
      font-family: 'Nunito', sans-serif;
    }
    img {
      width: 1300px; height: auto; max-height: 1500px;
      object-fit: contain; border-radius: 40px;
      box-shadow: 0 30px 100px rgba(0,0,0,0.2);
    }
    h1 {
      margin-top: 60px; font-size: 180px; font-weight: 700;
      color: #2c3e50; letter-spacing: 15px;
    }
    .subtitle {
      margin-top: 20px; font-size: 55px; font-weight: 400;
      color: #5d6d7e; font-style: italic;
    }
    .author {
      margin-top: 70px; font-size: 38px; color: #7f8c8d; line-height: 1.5;
    }
    .publisher {
      margin-top: 40px; font-size: 32px; color: #95a5a6;
      letter-spacing: 8px; text-transform: uppercase;
    }
  </style>
</head>
<body>
  <img src="${imageToBase64(coverPath)}" alt="AIKO Cover - Sofia, Luca and AIKO reading together">
  <h1>AIKO</h1>
  <p class="subtitle">AI Explained to Children</p>
  <p class="author">Written by Gianni Parola<br>Illustrated by Pino Pennello</p>
  <p class="publisher">Onde &bull; Free River House</p>
</body>
</html>`;

  const tempHtmlPath = path.join(outputDir, 'cover-temp.html');
  fs.writeFileSync(tempHtmlPath, coverHtml);

  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.setViewport({ width: 1600, height: 2560 });
  await page.goto(`file://${tempHtmlPath}`, { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1000));

  const coverJpgPath = path.join(outputDir, 'AIKO-KDP-Cover-NewFamily.jpg');
  await page.screenshot({
    path: coverJpgPath,
    type: 'jpeg',
    quality: 95,
    fullPage: false
  });

  await browser.close();
  fs.unlinkSync(tempHtmlPath);

  console.log(`✓ KDP Cover saved: ${coverJpgPath}`);
  console.log(`  Size: ${(fs.statSync(coverJpgPath).size / 1024).toFixed(0)} KB`);
  console.log(`  Dimensions: 1600x2560 px`);
}

createCover().catch(console.error);
