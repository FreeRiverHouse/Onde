const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

// Paths
const elegantHtmlPath = '/Users/mattiapetrucciani/CascadeProjects/Onde/books/aiko-ai-children/output/AIKO-Elegant.html';
const newCoverPath = '/Users/mattiapetrucciani/CascadeProjects/Onde/books/aiko-ai-children/images/cover-aiko-family.jpg';
const outputDir = '/Users/mattiapetrucciani/CascadeProjects/Onde/books/aiko-ai-children/output';

async function updateCover() {
  console.log('Updating AIKO Elegant Edition with new family cover...\n');

  // Read the new cover image
  const newCoverData = fs.readFileSync(newCoverPath);
  const newCoverBase64 = `data:image/jpg;base64,${newCoverData.toString('base64')}`;
  console.log('✓ Loaded new cover image (Sofia + Luca + AIKO)');

  // Read the Elegant HTML
  let html = fs.readFileSync(elegantHtmlPath, 'utf8');
  console.log('✓ Loaded AIKO-Elegant.html');

  // Find and replace the cover image (it's the first img with class="cover-image")
  // The pattern: src="data:image/jpg;base64,..."
  const coverImgPattern = /(<img class="cover-image" src=")data:image\/jpg;base64,[^"]+(")/;

  if (coverImgPattern.test(html)) {
    html = html.replace(coverImgPattern, `$1${newCoverBase64}$2`);
    console.log('✓ Replaced cover image with new family cover');
  } else {
    console.error('ERROR: Could not find cover image pattern in HTML');
    return;
  }

  // Save updated HTML
  const newHtmlPath = path.join(outputDir, 'AIKO-Elegant-NewCover.html');
  fs.writeFileSync(newHtmlPath, html);
  console.log(`✓ Saved: ${newHtmlPath}`);

  // Generate PDF
  console.log('\nGenerating PDF...');
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.goto(`file://${newHtmlPath}`, { waitUntil: 'networkidle0' });
  await page.waitForSelector('img');
  await new Promise(r => setTimeout(r, 2000));

  const pdfPath = path.join(outputDir, 'AIKO-Elegant-NewCover.pdf');
  await page.pdf({
    path: pdfPath,
    format: 'Letter',
    printBackground: true,
    margin: { top: 0, right: 0, bottom: 0, left: 0 }
  });

  await browser.close();

  console.log('\n' + '='.repeat(50));
  console.log('DONE!');
  console.log('='.repeat(50));
  console.log(`\nPDF: ${pdfPath}`);
  console.log(`Size: ${(fs.statSync(pdfPath).size / 1024 / 1024).toFixed(1)} MB`);
}

updateCover().catch(console.error);
