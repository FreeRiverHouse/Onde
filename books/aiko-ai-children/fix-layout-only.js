/**
 * FIX LAYOUT ONLY - Non tocca le immagini!
 * Modifica solo il CSS per evitare overlapping
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const puppeteer = require('puppeteer');

const INPUT_FILE = '/Users/mattiapetrucciani/CascadeProjects/Onde/books/aiko-ai-children/output/AIKO-Elegant-Final.html';
const OUTPUT_DIR = '/Users/mattiapetrucciani/CascadeProjects/Onde/books/aiko-ai-children/output';
const BACKUP_DIR = '/Users/mattiapetrucciani/CascadeProjects/Onde/books/aiko-ai-children/backups';

// Ensure backup dir exists
if (!fs.existsSync(BACKUP_DIR)) fs.mkdirSync(BACKUP_DIR, { recursive: true });

async function fixLayoutOnly() {
  console.log('🔧 FIXING LAYOUT ONLY (images are LOCKED)\n');

  // 1. Read input
  let html = fs.readFileSync(INPUT_FILE, 'utf8');

  // 2. Extract all image src hashes BEFORE modification
  const beforeHashes = [];
  const imgMatches = html.match(/src="data:image[^"]+"/g) || [];
  imgMatches.forEach(m => {
    beforeHashes.push(crypto.createHash('md5').update(m.slice(0, 200)).digest('hex'));
  });
  console.log(`🔐 Locked ${beforeHashes.length} images`);

  // 3. CSS FIXES - Only modify styling, not content
  const cssReplacements = [
    // Reduce image max-height from 4.2in to 3.5in
    {
      old: 'max-height: 4.2in;',
      new: 'max-height: 3.2in;'
    },
    // Reduce chapter text font slightly
    {
      old: 'font-size: 14.5px;',
      new: 'font-size: 13px;'
    },
    // Reduce line-height
    {
      old: 'line-height: 1.75;',
      new: 'line-height: 1.6;'
    },
    // Add overflow hidden to chapter-text
    {
      old: '.chapter-text {',
      new: '.chapter-text {\n      overflow: hidden;\n      max-height: 4.5in;'
    },
    // Reduce chapter title size
    {
      old: 'font-size: 30px;\n      color: #2c3e50;\n      margin-top: 6px;',
      new: 'font-size: 26px;\n      color: #2c3e50;\n      margin-top: 4px;'
    },
    // Reduce margins
    {
      old: 'margin: 15px 0;',
      new: 'margin: 10px 0;'
    },
    // Reduce chapter header margin
    {
      old: 'margin-bottom: 20px;',
      new: 'margin-bottom: 12px;'
    },
    // Reduce paragraph margin
    {
      old: 'margin-bottom: 10px;',
      new: 'margin-bottom: 6px;'
    },
    // Reduce text indent
    {
      old: 'text-indent: 22px;',
      new: 'text-indent: 16px;'
    }
  ];

  // Apply CSS fixes
  let fixCount = 0;
  cssReplacements.forEach(r => {
    if (html.includes(r.old)) {
      html = html.replace(r.old, r.new);
      fixCount++;
    }
  });
  console.log(`✅ Applied ${fixCount} CSS fixes`);

  // 4. Verify images unchanged
  const afterHashes = [];
  const imgMatchesAfter = html.match(/src="data:image[^"]+"/g) || [];
  imgMatchesAfter.forEach(m => {
    afterHashes.push(crypto.createHash('md5').update(m.slice(0, 200)).digest('hex'));
  });

  let imagesChanged = false;
  for (let i = 0; i < beforeHashes.length; i++) {
    if (beforeHashes[i] !== afterHashes[i]) {
      console.error(`❌ Image ${i + 1} changed! ABORTING!`);
      imagesChanged = true;
    }
  }

  if (imagesChanged) {
    console.error('❌ IMAGES WERE MODIFIED - OPERATION CANCELLED');
    return null;
  }
  console.log('✅ All images verified UNCHANGED');

  // 5. Save fixed HTML
  const outputPath = path.join(OUTPUT_DIR, 'AIKO-Layout-Fixed.html');
  fs.writeFileSync(outputPath, html);
  console.log(`✅ Saved: ${outputPath}`);

  // 6. Generate PDF
  console.log('\n📄 Generating PDF...');
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.goto(`file://${outputPath}`, { waitUntil: 'networkidle0' });
  await page.waitForSelector('img');
  await new Promise(r => setTimeout(r, 2500));

  const pdfPath = path.join(OUTPUT_DIR, 'AIKO-Layout-Fixed.pdf');
  await page.pdf({
    path: pdfPath,
    format: 'Letter',
    printBackground: true,
    margin: { top: 0, right: 0, bottom: 0, left: 0 }
  });
  await browser.close();

  console.log(`✅ PDF: ${pdfPath} (${(fs.statSync(pdfPath).size / 1024 / 1024).toFixed(1)} MB)`);

  // 7. Generate ePub
  const { exec } = require('child_process');
  const epubPath = path.join(OUTPUT_DIR, 'AIKO-Layout-Fixed.epub');

  await new Promise(resolve => {
    exec(`pandoc "${outputPath}" -o "${epubPath}" --metadata title="AIKO" --metadata author="Gianni Parola"`, () => {
      if (fs.existsSync(epubPath)) {
        console.log(`✅ ePub: ${epubPath} (${(fs.statSync(epubPath).size / 1024 / 1024).toFixed(1)} MB)`);
      }
      resolve();
    });
  });

  console.log('\n✅ LAYOUT FIX COMPLETE - Images untouched!');
  return { pdfPath, epubPath };
}

fixLayoutOnly().catch(console.error);
