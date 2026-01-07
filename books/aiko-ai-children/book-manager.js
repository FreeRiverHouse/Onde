/**
 * AIKO Book Manager - Sistema con protezione e rollback
 *
 * REGOLE:
 * 1. MAI modificare file senza backup
 * 2. Ogni modifica = backup automatico
 * 3. Checksum per verificare integrità
 * 4. Rollback disponibile sempre
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const puppeteer = require('puppeteer');

const BOOK_DIR = '/Users/mattiapetrucciani/CascadeProjects/Onde/books/aiko-ai-children';
const OUTPUT_DIR = path.join(BOOK_DIR, 'output');
const BACKUP_DIR = path.join(BOOK_DIR, 'backups');
const MASTER_FILE = path.join(OUTPUT_DIR, 'AIKO-Elegant.html');

// Ensure backup directory exists
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

// Calculate file hash
function getHash(filepath) {
  const data = fs.readFileSync(filepath);
  return crypto.createHash('md5').update(data).digest('hex');
}

// Create timestamped backup
function createBackup(filepath, label = '') {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = path.basename(filepath);
  const backupName = `${timestamp}_${label}_${filename}`;
  const backupPath = path.join(BACKUP_DIR, backupName);

  fs.copyFileSync(filepath, backupPath);
  console.log(`📦 Backup created: ${backupName}`);

  // Save hash for verification
  const hash = getHash(filepath);
  const hashFile = path.join(BACKUP_DIR, `${backupName}.hash`);
  fs.writeFileSync(hashFile, hash);

  return { backupPath, hash };
}

// List all backups
function listBackups() {
  const files = fs.readdirSync(BACKUP_DIR)
    .filter(f => f.endsWith('.html') || f.endsWith('.pdf'))
    .sort()
    .reverse();

  console.log('\n📚 Available backups:');
  files.forEach((f, i) => console.log(`  ${i + 1}. ${f}`));
  return files;
}

// Rollback to specific backup
function rollback(backupFilename, targetPath) {
  const backupPath = path.join(BACKUP_DIR, backupFilename);
  if (!fs.existsSync(backupPath)) {
    console.error(`❌ Backup not found: ${backupFilename}`);
    return false;
  }

  // Backup current before rollback
  createBackup(targetPath, 'pre-rollback');

  // Restore
  fs.copyFileSync(backupPath, targetPath);
  console.log(`✅ Rolled back to: ${backupFilename}`);
  return true;
}

// PROTECTED: Change ONLY the cover image
async function changeCoverOnly(newCoverPath) {
  console.log('\n🔒 PROTECTED OPERATION: Changing ONLY cover image\n');

  // 1. Backup master file
  createBackup(MASTER_FILE, 'before-cover-change');

  // 2. Read master
  let html = fs.readFileSync(MASTER_FILE, 'utf8');

  // 3. Extract and save all chapter images hashes (for verification)
  const chapterImages = [];
  const imgPattern = /<img class="chapter-image"[^>]*src="([^"]+)"/g;
  let match;
  while ((match = imgPattern.exec(html)) !== null) {
    const imgHash = crypto.createHash('md5').update(match[1].slice(0, 100)).digest('hex');
    chapterImages.push(imgHash);
  }
  console.log(`🔐 Locked ${chapterImages.length} chapter images (will verify after change)`);

  // 4. Load new cover
  const newCoverData = fs.readFileSync(newCoverPath);
  const newCoverBase64 = `data:image/jpeg;base64,${newCoverData.toString('base64')}`;

  // 5. Replace ONLY cover (very specific pattern)
  const coverPattern = /(<img class="cover-image"[^>]*src=")data:image\/[^;]+;base64,[^"]+(")/;

  if (!coverPattern.test(html)) {
    console.error('❌ Cover pattern not found!');
    return null;
  }

  html = html.replace(coverPattern, `$1${newCoverBase64}$2`);
  console.log('✅ Cover image replaced');

  // 6. Verify chapter images unchanged
  const newChapterImages = [];
  imgPattern.lastIndex = 0;
  while ((match = imgPattern.exec(html)) !== null) {
    const imgHash = crypto.createHash('md5').update(match[1].slice(0, 100)).digest('hex');
    newChapterImages.push(imgHash);
  }

  let allSame = true;
  for (let i = 0; i < chapterImages.length; i++) {
    if (chapterImages[i] !== newChapterImages[i]) {
      console.error(`❌ Chapter ${i + 1} image changed! ABORTING!`);
      allSame = false;
    }
  }

  if (!allSame) {
    console.log('🔄 Rolling back due to unexpected changes...');
    return null;
  }

  console.log('✅ All chapter images verified unchanged');

  // 7. Save new file
  const outputPath = path.join(OUTPUT_DIR, 'AIKO-Elegant-Final.html');
  fs.writeFileSync(outputPath, html);
  console.log(`✅ Saved: ${outputPath}`);

  // 8. Generate PDF
  console.log('\n📄 Generating PDF...');
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.goto(`file://${outputPath}`, { waitUntil: 'networkidle0' });
  await page.waitForSelector('img');
  await new Promise(r => setTimeout(r, 2000));

  const pdfPath = path.join(OUTPUT_DIR, 'AIKO-Elegant-Final.pdf');
  await page.pdf({
    path: pdfPath,
    format: 'Letter',
    printBackground: true,
    margin: { top: 0, right: 0, bottom: 0, left: 0 }
  });
  await browser.close();

  console.log(`✅ PDF: ${pdfPath} (${(fs.statSync(pdfPath).size / 1024 / 1024).toFixed(1)} MB)`);

  // 9. Generate ePub
  const { exec } = require('child_process');
  const epubPath = path.join(OUTPUT_DIR, 'AIKO-Elegant-Final.epub');

  await new Promise(resolve => {
    exec(`pandoc "${outputPath}" -o "${epubPath}" --metadata title="AIKO" --metadata author="Gianni Parola"`, () => {
      if (fs.existsSync(epubPath)) {
        console.log(`✅ ePub: ${epubPath} (${(fs.statSync(epubPath).size / 1024 / 1024).toFixed(1)} MB)`);
      }
      resolve();
    });
  });

  console.log('\n✅ PROTECTED OPERATION COMPLETE');
  return { pdfPath, epubPath, htmlPath: outputPath };
}

// Export functions
module.exports = {
  createBackup,
  listBackups,
  rollback,
  changeCoverOnly,
  MASTER_FILE,
  BACKUP_DIR,
  OUTPUT_DIR
};

// CLI interface
const command = process.argv[2];

if (command === 'backup') {
  createBackup(MASTER_FILE, 'manual');
} else if (command === 'list') {
  listBackups();
} else if (command === 'rollback' && process.argv[3]) {
  rollback(process.argv[3], MASTER_FILE);
} else if (command === 'cover' && process.argv[3]) {
  changeCoverOnly(process.argv[3]).then(result => {
    if (result) {
      console.log('\n🎉 SUCCESS! Files ready.');
    }
  });
} else {
  console.log(`
AIKO Book Manager - Protezione e Rollback

Comandi:
  node book-manager.js backup              - Crea backup manuale
  node book-manager.js list                - Lista tutti i backup
  node book-manager.js rollback <file>     - Ripristina da backup
  node book-manager.js cover <image.jpg>   - Cambia SOLO la copertina (protetto)
  `);
}
