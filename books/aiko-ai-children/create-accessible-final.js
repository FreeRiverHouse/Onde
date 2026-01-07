const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const { exec } = require('child_process');

const htmlPath = '/Users/mattiapetrucciani/CascadeProjects/Onde/books/aiko-ai-children/output/AIKO-Elegant-NewCover.html';
const outputDir = '/Users/mattiapetrucciani/CascadeProjects/Onde/books/aiko-ai-children/output';

// Alt text descriptions for each image
const altTexts = {
  'cover-image': 'Sofia (7-year-old girl with curly brown hair), Luca (5-year-old boy with short brown hair) and AIKO (friendly white robot with blue LED eyes) reading together. Soft watercolor illustration style.',
  'chapter1': 'Sofia discovers AIKO in a mysterious glowing box on a sunny morning. Her room is filled with warm morning light. Watercolor children\'s book illustration.',
  'chapter2': 'Split view comparing a human brain with colorful neural connections and AIKO\'s digital circuits. Educational watercolor illustration showing how AI processes information.',
  'chapter3': 'AIKO learning to see by looking at photos of Whiskers the cat. Multiple photos showing how AI recognizes patterns. Soft watercolor style.',
  'chapter4': 'AIKO surrounded by floating books and text, learning to understand language. Magical watercolor illustration of AI learning to talk.',
  'chapter5': 'AIKO helping with various tasks - math homework, reading stories, organizing. Happy watercolor illustration showing AI as a helpful friend.',
  'chapter6': 'Sofia showing her creative drawing of a purple dragon eating ice cream to confused AIKO. Whimsical watercolor illustration about creativity.',
  'chapter7': 'AIKO displaying four safety rules: a padlock for privacy, a checkmark for safety, books for learning, and a heart for kindness. Educational watercolor.',
  'chapter8': 'Sofia, Luca and AIKO together looking at a beautiful golden sunset, imagining the future. Heartwarming watercolor finale.'
};

async function createAccessibleVersion() {
  console.log('Creating accessible version with alt text...\n');

  // Read HTML
  let html = fs.readFileSync(htmlPath, 'utf8');

  // Add alt text to cover image
  html = html.replace(
    /<img class="cover-image" src="([^"]+)"([^>]*)>/g,
    `<img class="cover-image" src="$1" alt="${altTexts['cover-image']}"$2>`
  );

  // Add alt text to chapter images (they have chapter-image class)
  let chapterNum = 0;
  html = html.replace(
    /<img class="chapter-image" src="([^"]+)"([^>]*)>/g,
    (match, src, rest) => {
      chapterNum++;
      const altKey = `chapter${chapterNum}`;
      const alt = altTexts[altKey] || `Chapter ${chapterNum} illustration. Watercolor style.`;
      return `<img class="chapter-image" src="${src}" alt="${alt}"${rest}>`;
    }
  );

  // Save accessible HTML
  const accessibleHtmlPath = path.join(outputDir, 'AIKO-Final-Accessible.html');
  fs.writeFileSync(accessibleHtmlPath, html);
  console.log('✓ Created HTML with alt text');

  // Generate PDF
  console.log('Generating PDF...');
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.goto(`file://${accessibleHtmlPath}`, { waitUntil: 'networkidle0' });
  await page.waitForSelector('img');
  await new Promise(r => setTimeout(r, 2000));

  const pdfPath = path.join(outputDir, 'AIKO-Final-Accessible.pdf');
  await page.pdf({
    path: pdfPath,
    format: 'Letter',
    printBackground: true,
    margin: { top: 0, right: 0, bottom: 0, left: 0 }
  });
  await browser.close();
  console.log(`✓ PDF created: ${pdfPath}`);
  console.log(`  Size: ${(fs.statSync(pdfPath).size / 1024 / 1024).toFixed(1)} MB`);

  // Generate ePub using pandoc
  console.log('\nGenerating ePub...');
  const epubPath = path.join(outputDir, 'AIKO-Final-Accessible.epub');

  // Create metadata file for pandoc
  const metadataPath = path.join(outputDir, 'metadata.yaml');
  const metadata = `---
title: "AIKO"
subtitle: "AI Explained to Children"
author: "Gianni Parola"
illustrator: "Pino Pennello"
publisher: "Onde - Free River House"
lang: en
---`;
  fs.writeFileSync(metadataPath, metadata);

  return new Promise((resolve, reject) => {
    exec(`pandoc "${accessibleHtmlPath}" -o "${epubPath}" --metadata-file="${metadataPath}" --epub-chapter-level=1`, (error, stdout, stderr) => {
      if (error) {
        console.log('Note: pandoc not available, skipping ePub generation');
        resolve({ pdfPath, accessibleHtmlPath });
      } else {
        console.log(`✓ ePub created: ${epubPath}`);
        console.log(`  Size: ${(fs.statSync(epubPath).size / 1024 / 1024).toFixed(1)} MB`);
        resolve({ pdfPath, epubPath, accessibleHtmlPath });
      }
    });
  });
}

createAccessibleVersion().then(result => {
  console.log('\n' + '='.repeat(50));
  console.log('DONE! Files created:');
  console.log('='.repeat(50));
  console.log(`HTML: ${result.accessibleHtmlPath}`);
  console.log(`PDF: ${result.pdfPath}`);
  if (result.epubPath) console.log(`ePub: ${result.epubPath}`);
}).catch(console.error);
