const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

const originalHtml = '/Users/mattiapetrucciani/CascadeProjects/Onde/books/aiko-ai-children/output/AIKO-Elegant.html';
const newCoverPath = '/Users/mattiapetrucciani/CascadeProjects/Onde/books/aiko-ai-children/images/cover-aiko-family.jpg';
const outputDir = '/Users/mattiapetrucciani/CascadeProjects/Onde/books/aiko-ai-children/output';

async function fixCoverOnly() {
  console.log('Fixing ONLY the cover image in AIKO Elegant Edition...\n');

  // Load new cover
  const newCoverData = fs.readFileSync(newCoverPath);
  const newCoverBase64 = `data:image/jpeg;base64,${newCoverData.toString('base64')}`;
  console.log('✓ Loaded new cover (IMG_4090 - Sofia+Luca+AIKO)');

  // Read original Elegant HTML
  let html = fs.readFileSync(originalHtml, 'utf8');
  console.log('✓ Loaded original AIKO-Elegant.html (with correct chapter images)');

  // Replace ONLY the cover image (first img with class="cover-image")
  const coverPattern = /(<img class="cover-image"[^>]*src=")data:image\/[^;]+;base64,[^"]+(")/;
  
  if (coverPattern.test(html)) {
    html = html.replace(coverPattern, `$1${newCoverBase64}$2`);
    console.log('✓ Replaced ONLY the cover image');
  } else {
    console.error('ERROR: Could not find cover image');
    return;
  }

  // Add alt text to cover
  html = html.replace(
    /<img class="cover-image"/,
    '<img class="cover-image" alt="Sofia (7yo with curly brown hair), Luca (5yo) and AIKO robot reading together. Soft watercolor style."'
  );

  // Save
  const newHtmlPath = path.join(outputDir, 'AIKO-Elegant-Final.html');
  fs.writeFileSync(newHtmlPath, html);
  console.log(`✓ Saved: ${newHtmlPath}`);

  // Generate PDF
  console.log('\nGenerating PDF...');
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.goto(`file://${newHtmlPath}`, { waitUntil: 'networkidle0' });
  await page.waitForSelector('img');
  await new Promise(r => setTimeout(r, 2000));

  const pdfPath = path.join(outputDir, 'AIKO-Elegant-Final.pdf');
  await page.pdf({
    path: pdfPath,
    format: 'Letter',
    printBackground: true,
    margin: { top: 0, right: 0, bottom: 0, left: 0 }
  });
  await browser.close();

  console.log(`✓ PDF: ${pdfPath}`);
  console.log(`  Size: ${(fs.statSync(pdfPath).size / 1024 / 1024).toFixed(1)} MB`);

  // Generate ePub
  const { exec } = require('child_process');
  const epubPath = path.join(outputDir, 'AIKO-Elegant-Final.epub');
  
  exec(`pandoc "${newHtmlPath}" -o "${epubPath}" --metadata title="AIKO" --metadata author="Gianni Parola"`, (err) => {
    if (!err) {
      console.log(`✓ ePub: ${epubPath}`);
      console.log(`  Size: ${(fs.statSync(epubPath).size / 1024 / 1024).toFixed(1)} MB`);
    }
    console.log('\n✅ DONE - Only cover changed, all other images preserved!');
  });
}

fixCoverOnly().catch(console.error);
