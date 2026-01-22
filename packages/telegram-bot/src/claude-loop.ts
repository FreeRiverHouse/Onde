/**
 * Claude Loop - Continuous message processor with real procedures
 *
 * Runs as a daemon, processes Telegram messages, executes:
 * - new_book: Creates new book following BOOK_FACTORY.md
 * - upgrade_book: Updates existing book, auto-generates PDF when complete
 * - new_app: Creates new app following NEW-APP-PROCEDURE.md
 * - upgrade_app: Updates existing app following UPGRADE-APP-PROCEDURE.md
 * - deploy_site: Deploys to onde.surf
 */

import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';
import { execSync, spawn } from 'child_process';

const TELEGRAM_TOKEN = process.env.ONDE_PR_TELEGRAM_TOKEN || '8272332520:AAF7zrKpqOCnFMqOlF1GJCLycJFk3IPO6ps';
const CHAT_ID = process.env.ONDE_PR_CHAT_ID || '7505631979';
const POLL_INTERVAL = 5000; // 5 seconds

const chatQueueDir = path.join(__dirname, '../chat_queue');
const mediaDir = path.join(__dirname, '../media');
const processedDir = path.join(__dirname, '../processed');
const booksDir = '/Users/mattia/Projects/Onde/books';
const appsDir = '/Users/mattia/Projects/Onde/apps';
const ondeRoot = '/Users/mattia/Projects/Onde';

// Ensure directories exist
[chatQueueDir, mediaDir, processedDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

interface QueueMessage {
  id: string;
  from: string;
  type?: string;
  message: string;
  caption?: string;
  mediaPath?: string;
  timestamp: string;
  status: string;
  context?: {
    action?: string;
    target?: string;
    details?: string;
  };
}

interface BookConfig {
  title: string;
  subtitle?: string;
  author: string;
  illustrator: string;
  chapters: number;
  path: string;
}

// Book configurations
const bookConfigs: Record<string, BookConfig> = {
  'milo': {
    title: 'MILO',
    subtitle: 'Il Robot Amico',
    author: 'Gianni Parola',
    illustrator: 'Pina Pennello',
    chapters: 8,
    path: 'tech/milo'
  },
  'aiko': {
    title: 'AIKO',
    subtitle: 'AI Explained to Children',
    author: 'Gianni Parola',
    illustrator: 'Pina Pennello',
    chapters: 8,
    path: 'tech/aiko'
  },
  'salmo': {
    title: 'Il Salmo 23',
    subtitle: 'Per i Bambini',
    author: 'Gianni Parola',
    illustrator: 'Pina Pennello',
    chapters: 6,
    path: 'spirituality/salmo-23'
  },
  'piccole-rime': {
    title: 'Piccole Rime',
    subtitle: 'Poesie Italiane per Bambini',
    author: 'Antologia',
    illustrator: 'Pina Pennello',
    chapters: 10,
    path: 'poetry/italian/piccole-rime'
  }
};

/**
 * Escape Markdown special characters for Telegram
 */
function escapeMarkdown(text: string): string {
  return text.replace(/_/g, '\\_');
}

/**
 * Send message to Telegram (with proper escaping)
 */
async function sendTelegram(text: string, useMarkdown = true): Promise<boolean> {
  return new Promise((resolve) => {
    const data = JSON.stringify({
      chat_id: CHAT_ID,
      text: text,
      parse_mode: useMarkdown ? 'Markdown' : undefined
    });

    const options = {
      hostname: 'api.telegram.org',
      path: `/bot${TELEGRAM_TOKEN}/sendMessage`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        if (res.statusCode !== 200) {
          console.error('Telegram error:', body);
          if (useMarkdown) {
            sendTelegram(text.replace(/[*_`]/g, ''), false).then(resolve);
            return;
          }
        }
        resolve(res.statusCode === 200);
      });
    });

    req.on('error', () => resolve(false));
    req.write(data);
    req.end();
  });
}

/**
 * Send document to Telegram
 */
function sendDocument(filePath: string, caption?: string): boolean {
  try {
    const safeCaption = caption ? escapeMarkdown(caption).slice(0, 200) : '';
    const cmd = caption
      ? `curl -s -X POST "https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendDocument" -F "chat_id=${CHAT_ID}" -F "document=@${filePath}" -F "caption=${safeCaption.replace(/"/g, '\\"')}"`
      : `curl -s -X POST "https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendDocument" -F "chat_id=${CHAT_ID}" -F "document=@${filePath}"`;
    execSync(cmd, { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

/**
 * Execute shell command and return output
 */
function runCommand(cmd: string, cwd?: string): { success: boolean; output: string } {
  try {
    const output = execSync(cmd, {
      cwd: cwd || ondeRoot,
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe'],
      timeout: 120000 // 2 minutes
    });
    return { success: true, output: output.trim() };
  } catch (e: any) {
    return { success: false, output: e.stderr || e.message || 'Command failed' };
  }
}

// ============================================================================
// BOOK GENERATION SYSTEM
// ============================================================================

/**
 * Check which chapter images exist for a book
 */
function checkBookImages(bookPath: string, totalChapters: number): {
  complete: boolean;
  existing: number[];
  missing: number[];
  hasCover: boolean;
} {
  const imagesDir = path.join(bookPath, 'images');
  if (!fs.existsSync(imagesDir)) {
    return {
      complete: false,
      existing: [],
      missing: Array.from({ length: totalChapters }, (_, i) => i + 1),
      hasCover: false
    };
  }

  const files = fs.readdirSync(imagesDir);
  const existing: number[] = [];
  const missing: number[] = [];
  let hasCover = false;

  // Check for cover
  hasCover = files.some(f => f.toLowerCase().includes('cover'));

  // Check for chapters
  for (let i = 1; i <= totalChapters; i++) {
    const hasChapter = files.some(f => {
      const lower = f.toLowerCase();
      return lower.includes(`chapter${i}`) ||
             lower.includes(`chapter_${i}`) ||
             lower.includes(`ch${i}`) ||
             lower.includes(`capitolo${i}`);
    });
    if (hasChapter) {
      existing.push(i);
    } else {
      missing.push(i);
    }
  }

  return {
    complete: missing.length === 0 && hasCover,
    existing,
    missing,
    hasCover
  };
}

/**
 * Get image path for a chapter
 */
function getChapterImage(imagesDir: string, chapter: number): string | null {
  const files = fs.readdirSync(imagesDir);
  for (const f of files) {
    const lower = f.toLowerCase();
    if (lower.includes(`chapter${chapter}`) ||
        lower.includes(`chapter_${chapter}`) ||
        lower.includes(`ch${chapter}`) ||
        lower.includes(`capitolo${chapter}`)) {
      return path.join(imagesDir, f);
    }
  }
  return null;
}

/**
 * Get cover image path
 */
function getCoverImage(imagesDir: string): string | null {
  const files = fs.readdirSync(imagesDir);
  for (const f of files) {
    if (f.toLowerCase().includes('cover')) {
      return path.join(imagesDir, f);
    }
  }
  return null;
}

/**
 * Convert image to base64 data URI
 */
function imageToBase64(filePath: string): string {
  const data = fs.readFileSync(filePath);
  const ext = path.extname(filePath).slice(1) || 'jpg';
  return `data:image/${ext};base64,${data.toString('base64')}`;
}

/**
 * Generate PDF for a book
 */
async function generateBookPDF(bookKey: string): Promise<{ success: boolean; pdfPath?: string; error?: string }> {
  const config = bookConfigs[bookKey];
  if (!config) {
    return { success: false, error: `Unknown book: ${bookKey}` };
  }

  const bookPath = path.join(booksDir, config.path);
  const imagesDir = path.join(bookPath, 'images');
  const outputDir = path.join(bookPath, 'output');

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Get logo paths
  const logoFRH = path.join(booksDir, 'psalm-23-abundance/images/logo-frh.jpg');
  const logoOnde = path.join(booksDir, 'psalm-23-abundance/images/logo-onde.jpg');

  // Load images
  const coverPath = getCoverImage(imagesDir);
  if (!coverPath) {
    return { success: false, error: 'Cover image not found' };
  }

  const chapterImages: Record<number, string> = {};
  for (let i = 1; i <= config.chapters; i++) {
    const imgPath = getChapterImage(imagesDir, i);
    if (!imgPath) {
      return { success: false, error: `Chapter ${i} image not found` };
    }
    chapterImages[i] = imageToBase64(imgPath);
  }

  const coverImg = imageToBase64(coverPath);
  const logoFRHImg = fs.existsSync(logoFRH) ? imageToBase64(logoFRH) : '';
  const logoOndeImg = fs.existsSync(logoOnde) ? imageToBase64(logoOnde) : '';

  // Generate HTML
  let chaptersHTML = '';
  for (let i = 1; i <= config.chapters; i++) {
    chaptersHTML += `
  <div class="page chapter-page">
    <img src="${chapterImages[i]}" alt="Chapter ${i}">
    <div class="chapter-num">Capitolo ${i}</div>
    <h2>Capitolo ${i}</h2>
  </div>
`;
  }

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    @page { size: Letter; margin: 0; }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Georgia', serif; background: #fff; }
    .page {
      width: 8.5in; height: 11in;
      page-break-after: always;
      display: flex; flex-direction: column;
      align-items: center; justify-content: center;
      padding: 0.5in;
      background: linear-gradient(135deg, #fefefe 0%, #f8f5f0 100%);
    }
    .page:last-child { page-break-after: avoid; }
    .cover-page {
      background: linear-gradient(135deg, #f5f0e8 0%, #fff 50%, #f0e8dc 100%);
    }
    .cover-page img { max-width: 100%; max-height: 70%; object-fit: contain; border-radius: 8px; }
    .cover-page h1 { font-size: 48px; color: #2c3e50; margin-top: 20px; letter-spacing: 4px; }
    .cover-page .subtitle { font-size: 22px; color: #7f8c8d; margin-top: 8px; font-style: italic; }
    .cover-page .author { font-size: 14px; color: #95a5a6; margin-top: 20px; }
    .cover-page .logos { position: absolute; bottom: 30px; display: flex; gap: 30px; }
    .cover-page .logos img { height: 50px; width: auto; max-width: none; max-height: none; opacity: 0.85; }
    .chapter-page img { max-width: 90%; max-height: 60%; object-fit: contain; border-radius: 6px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
    .chapter-page h2 { font-size: 28px; color: #34495e; margin-top: 20px; }
    .chapter-page .chapter-num { font-size: 14px; color: #95a5a6; text-transform: uppercase; letter-spacing: 2px; margin-top: 15px; }
    .end-page { background: linear-gradient(135deg, #f5f0e8 0%, #fff 100%); }
    .end-page h2 { font-size: 36px; color: #34495e; }
    .end-page .credits { margin-top: 40px; font-size: 14px; color: #7f8c8d; text-align: center; line-height: 2; }
    .end-page .logos { margin-top: 40px; display: flex; gap: 40px; }
    .end-page .logos img { height: 70px; width: auto; opacity: 0.9; }
  </style>
</head>
<body>
  <div class="page cover-page">
    <img src="${coverImg}" alt="Cover">
    <h1>${config.title}</h1>
    ${config.subtitle ? `<div class="subtitle">${config.subtitle}</div>` : ''}
    <div class="author">Scritto da ${config.author} | Illustrato da ${config.illustrator}</div>
    <div class="logos">
      ${logoOndeImg ? `<img src="${logoOndeImg}" alt="Onde">` : ''}
      ${logoFRHImg ? `<img src="${logoFRHImg}" alt="Free River House">` : ''}
    </div>
  </div>

  ${chaptersHTML}

  <div class="page end-page">
    <h2>Fine</h2>
    <div class="credits">
      <p>Scritto da ${config.author}</p>
      <p>Illustrato da ${config.illustrator}</p>
      <p style="margin-top: 20px;">Pubblicato da Onde, Free River House</p>
      <p>Prima Edizione - 2026</p>
      <p style="margin-top: 30px; font-style: italic; color: #95a5a6;">Immagini generate con @grok</p>
    </div>
    <div class="logos">
      ${logoOndeImg ? `<img src="${logoOndeImg}" alt="Onde">` : ''}
      ${logoFRHImg ? `<img src="${logoFRHImg}" alt="Free River House">` : ''}
    </div>
  </div>
</body>
</html>
`;

  const htmlPath = path.join(outputDir, `${config.title.toLowerCase()}-auto.html`);
  const pdfPath = path.join(outputDir, `${config.title}-Auto-Generated.pdf`);

  fs.writeFileSync(htmlPath, html);

  // Generate PDF with puppeteer
  const puppeteerScript = `
const puppeteer = require('puppeteer');

async function run() {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.goto('file://${htmlPath}', { waitUntil: 'networkidle0' });
  await page.waitForSelector('img');
  await new Promise(r => setTimeout(r, 2000));
  await page.pdf({
    path: '${pdfPath}',
    format: 'Letter',
    printBackground: true,
    margin: { top: 0, right: 0, bottom: 0, left: 0 }
  });
  await browser.close();
  console.log('PDF created');
}

run().catch(e => { console.error(e); process.exit(1); });
`;

  const scriptPath = path.join(outputDir, 'generate-pdf.js');
  fs.writeFileSync(scriptPath, puppeteerScript);

  const result = runCommand(`node "${scriptPath}"`, outputDir);

  if (result.success && fs.existsSync(pdfPath)) {
    return { success: true, pdfPath };
  } else {
    return { success: false, error: result.output };
  }
}

/**
 * Deploy book to onde.surf
 */
async function deployBookToSite(bookKey: string, pdfPath: string): Promise<{ success: boolean; url?: string; error?: string }> {
  const config = bookConfigs[bookKey];
  if (!config) {
    return { success: false, error: `Unknown book: ${bookKey}` };
  }

  // Copy PDF to onde-portal public directory
  const portalBooksDir = path.join(ondeRoot, 'apps/onde-portal/public/books');
  if (!fs.existsSync(portalBooksDir)) {
    fs.mkdirSync(portalBooksDir, { recursive: true });
  }

  const destFileName = `${config.title.toLowerCase().replace(/\s+/g, '-')}.pdf`;
  const destPath = path.join(portalBooksDir, destFileName);
  fs.copyFileSync(pdfPath, destPath);

  // Deploy to onde.surf
  const deployScript = path.join(ondeRoot, 'tools/tech-support/deploy-onde-surf-preprod.sh');

  if (fs.existsSync(deployScript)) {
    await sendTelegram('🚀 Deploying libro su onde.surf...');
    const result = runCommand(`bash "${deployScript}"`, ondeRoot);

    if (result.success) {
      const url = `https://onde.surf/books/${destFileName}`;
      return { success: true, url };
    } else {
      return { success: false, error: result.output };
    }
  }

  return { success: true, url: `/books/${destFileName}` };
}

// ============================================================================
// PROCEDURE HANDLERS
// ============================================================================

/**
 * NEW BOOK - Following BOOK_FACTORY.md
 */
async function handleNewBook(msg: QueueMessage): Promise<string> {
  const { message, context } = msg;
  const bookName = context?.target || 'untitled';
  const cleanName = bookName.toLowerCase().replace(/\s+/g, '-');

  let collana = 'spirituality';
  const lower = message.toLowerCase();
  if (lower.includes('poesia') || lower.includes('poetry')) collana = 'poetry/italian';
  if (lower.includes('tech') || lower.includes('coding')) collana = 'tech';
  if (lower.includes('arte') || lower.includes('art')) collana = 'arte';

  const bookPath = path.join(booksDir, collana, cleanName);

  if (!fs.existsSync(bookPath)) {
    fs.mkdirSync(bookPath, { recursive: true });
    fs.mkdirSync(path.join(bookPath, 'images'), { recursive: true });
  }

  const draftContent = `# ${bookName}

## Collana: ${collana}
## Status: BOZZA 1

---

## Capitolo 1: [Titolo]

[ILLUSTRAZIONE: descrizione scena iniziale]

Testo del primo capitolo...

---

*Creato: ${new Date().toISOString()}*
*Da completare con Gianni Parola*
`;

  fs.writeFileSync(path.join(bookPath, `${cleanName}_draft1.md`), draftContent);

  return `📚 *NUOVO LIBRO CREATO*

📖 Titolo: *${bookName}*
📁 Collana: ${escapeMarkdown(collana)}
📂 Path: \`${bookPath}\`

✅ Creati:
• Cartella libro
• Cartella images/
• ${cleanName}\\_draft1.md

🎯 Invia le immagini con caption:
• "cover ${cleanName}"
• "per ${cleanName} capitolo 1"
• ...etc

Quando tutte le immagini sono pronte, genero automaticamente il PDF!`;
}

/**
 * UPGRADE BOOK - Add content/images, auto-generate when complete
 */
async function handleUpgradeBook(msg: QueueMessage): Promise<string> {
  const { mediaPath, context, message } = msg;
  const bookName = context?.target || '';

  // Find book key
  let bookKey = '';
  let bookPath = '';
  const lower = bookName.toLowerCase();

  for (const [key, config] of Object.entries(bookConfigs)) {
    if (lower.includes(key)) {
      bookKey = key;
      bookPath = path.join(booksDir, config.path);
      break;
    }
  }

  if (!bookKey || !bookPath || !fs.existsSync(bookPath)) {
    const searchResult = runCommand(`find ${booksDir} -type d -name "*${lower.split(' ')[0]}*" | head -1`);
    if (searchResult.success && searchResult.output) {
      bookPath = searchResult.output;
    } else {
      return `❓ Non trovo il libro "${bookName}". Libri configurati: ${Object.keys(bookConfigs).join(', ')}`;
    }
  }

  const config = bookConfigs[bookKey];

  // If there's an image, save it
  if (mediaPath && fs.existsSync(mediaPath)) {
    const imagesDir = path.join(bookPath, 'images');
    if (!fs.existsSync(imagesDir)) {
      fs.mkdirSync(imagesDir, { recursive: true });
    }

    const details = (context?.details || message).toLowerCase();
    const ext = path.extname(mediaPath) || '.jpg';
    let newFileName: string;

    // Determine filename
    const chapterMatch = details.match(/chapter\s*(\d+)|capitolo\s*(\d+)|ch\s*(\d+)/i);
    if (chapterMatch) {
      const chapterNum = chapterMatch[1] || chapterMatch[2] || chapterMatch[3];
      newFileName = `chapter${chapterNum}${ext}`;
    } else if (details.includes('cover') || details.includes('copertina')) {
      newFileName = `cover${ext}`;
    } else {
      newFileName = `image_${Date.now()}${ext}`;
    }

    const destPath = path.join(imagesDir, newFileName);
    fs.copyFileSync(mediaPath, destPath);

    // Check completeness
    const status = checkBookImages(bookPath, config?.chapters || 8);

    let response = `✅ *IMMAGINE SALVATA*

📚 Libro: *${config?.title || path.basename(bookPath)}*
🖼️ File: \`${newFileName}\`

📊 *Stato immagini:*
• Cover: ${status.hasCover ? '✅' : '❌'}
• Capitoli: ${status.existing.length}/${config?.chapters || 8}`;

    if (status.missing.length > 0) {
      response += `\n• Mancanti: ${status.missing.join(', ')}`;
    }

    // AUTO-GENERATE if complete!
    if (status.complete && bookKey) {
      response += `\n\n🎉 *LIBRO COMPLETO!*\n⏳ Genero il PDF...`;
      await sendTelegram(response);

      const pdfResult = await generateBookPDF(bookKey);

      if (pdfResult.success && pdfResult.pdfPath) {
        // Send PDF via Telegram
        sendDocument(pdfResult.pdfPath, `📚 ${config?.title} - PDF Generato Automaticamente`);

        // Deploy to site
        const deployResult = await deployBookToSite(bookKey, pdfResult.pdfPath);

        if (deployResult.success) {
          return `✅ *LIBRO PUBBLICATO!*

📚 ${config?.title}
📄 PDF: generato con successo
🌐 URL: ${deployResult.url}

Il libro è ora disponibile su onde.surf!`;
        } else {
          return `✅ *PDF GENERATO*

📚 ${config?.title}
📄 PDF inviato su Telegram

⚠️ Deploy fallito: ${deployResult.error}`;
        }
      } else {
        return `❌ Errore generazione PDF: ${pdfResult.error}`;
      }
    }

    return response;
  }

  // No image - show status
  const status = checkBookImages(bookPath, config?.chapters || 8);

  return `📊 *STATO LIBRO: ${config?.title || bookName}*

• Cover: ${status.hasCover ? '✅' : '❌'}
• Capitoli presenti: ${status.existing.join(', ') || 'nessuno'}
• Capitoli mancanti: ${status.missing.join(', ') || 'nessuno'}

Per aggiungere immagini, invia foto con caption:
• "cover ${bookKey}" per la copertina
• "per ${bookKey} capitolo N" per i capitoli`;
}

/**
 * NEW APP - Following NEW-APP-PROCEDURE.md
 */
async function handleNewApp(msg: QueueMessage): Promise<string> {
  const { context, message } = msg;
  const appName = context?.target || '';

  if (!appName) {
    return '❓ Specifica il nome dell\'app. Es: "nuova app moonlight-puzzle"';
  }

  const cleanName = appName.toLowerCase().replace(/\s+/g, '-');
  const appPath = path.join(appsDir, cleanName);

  if (fs.existsSync(appPath)) {
    return `⚠️ L'app "${cleanName}" esiste già in ${appPath}`;
  }

  const existingApps = fs.readdirSync(appsDir).filter(f =>
    fs.statSync(path.join(appsDir, f)).isDirectory()
  );
  const nextPort = 1114 + existingApps.length;
  const devPort = 8891 + existingApps.length;

  await sendTelegram(`🔄 Creo app "${cleanName}"...`);

  const createResult = runCommand(
    `npm create vite@latest ${cleanName} -- --template react-ts`,
    appsDir
  );

  if (!createResult.success) {
    return `❌ Errore creazione app: ${createResult.output}`;
  }

  const installResult = runCommand('npm install', appPath);
  if (!installResult.success) {
    return `❌ Errore npm install: ${installResult.output}`;
  }

  const indexCssPath = path.join(appPath, 'src/index.css');
  if (fs.existsSync(indexCssPath)) {
    const fixedCss = `/* Fixed CSS for full-page layout */
html, body, #root {
  margin: 0;
  padding: 0;
  min-height: 100vh;
  min-height: 100dvh;
  width: 100%;
  overflow-x: hidden;
}

body {
  font-family: Inter, system-ui, Avenir, Helvetica, Arial, sans-serif;
}
`;
    fs.writeFileSync(indexCssPath, fixedCss);
  }

  fs.mkdirSync(path.join(appPath, 'scripts'), { recursive: true });

  const briefContent = `# ${appName} - Creative Brief

## Vision
[Descrivi il concept]

## Porte
- DEV: ${devPort}
- PROD (LAN): ${nextPort}

## Come avviare
\`\`\`bash
npm run dev -- --port ${devPort} --host
\`\`\`

*Creato: ${new Date().toISOString()}*
`;
  fs.writeFileSync(path.join(appPath, 'CREATIVE-BRIEF.md'), briefContent);

  return `✅ *NUOVA APP CREATA*

📱 Nome: *${cleanName}*
📂 Path: \`${appPath}\`
🔌 Porte: DEV=${devPort}, PROD=${nextPort}

✅ Completati:
• Vite + React + TypeScript
• npm install
• Fix CSS full-page
• CREATIVE-BRIEF.md`;
}

/**
 * UPGRADE APP
 */
async function handleUpgradeApp(msg: QueueMessage): Promise<string> {
  const { context, message, mediaPath } = msg;
  const appName = context?.target || '';

  if (!appName) {
    return '❓ Specifica quale app aggiornare.';
  }

  const cleanName = appName.toLowerCase().replace(/\s+/g, '-');
  let appPath = path.join(appsDir, cleanName);

  if (!fs.existsSync(appPath)) {
    const searchResult = runCommand(`find ${appsDir} -maxdepth 1 -type d -name "*${cleanName}*" | head -1`);
    if (searchResult.success && searchResult.output) {
      appPath = searchResult.output;
    } else {
      const availableApps = fs.readdirSync(appsDir)
        .filter(f => fs.statSync(path.join(appsDir, f)).isDirectory())
        .join(', ');
      return `❓ App "${appName}" non trovata. Disponibili: ${availableApps}`;
    }
  }

  if (mediaPath && fs.existsSync(mediaPath)) {
    const assetsDir = path.join(appPath, 'public/assets');
    if (!fs.existsSync(assetsDir)) {
      fs.mkdirSync(assetsDir, { recursive: true });
    }

    const ext = path.extname(mediaPath) || '.jpg';
    const newFileName = `asset_${Date.now()}${ext}`;
    const destPath = path.join(assetsDir, newFileName);
    fs.copyFileSync(mediaPath, destPath);

    return `✅ *APP AGGIORNATA*

📱 App: *${path.basename(appPath)}*
🖼️ Asset: \`${newFileName}\``;
  }

  return `📝 Upgrade app "${path.basename(appPath)}" - invia immagini per aggiungere assets.`;
}

/**
 * DEPLOY SITE
 */
async function handleDeploySite(msg: QueueMessage): Promise<string> {
  const { context, message } = msg;
  const target = (context?.target || message).toLowerCase();

  let deployScript = path.join(ondeRoot, 'tools/tech-support/deploy-onde-surf-preprod.sh');
  let siteName = 'onde.surf (PREPROD)';

  if (target.includes('prod') || target.includes('onde.la')) {
    deployScript = path.join(ondeRoot, 'tools/tech-support/deploy-onde-la-prod.sh');
    siteName = 'onde.la (PROD)';
  }

  if (!fs.existsSync(deployScript)) {
    return `❌ Script deploy non trovato: ${deployScript}`;
  }

  await sendTelegram(`🚀 Avvio deploy su ${siteName}...`);

  const result = runCommand(`bash "${deployScript}"`, ondeRoot);

  if (result.success) {
    return `✅ *DEPLOY COMPLETATO*

🌐 Sito: *${siteName}*
⏱️ ${new Date().toISOString()}

🔗 https://${siteName.includes('surf') ? 'onde.surf' : 'onde.la'}`;
  } else {
    return `❌ *DEPLOY FALLITO*

${result.output.slice(-300)}`;
  }
}

// ============================================================================
// MAIN PROCESSOR
// ============================================================================

async function processMessage(msg: QueueMessage): Promise<void> {
  console.log(`📨 Processing: [${msg.id}] ${msg.type || 'text'} - action: ${msg.context?.action}`);

  let response = '';
  const action = msg.context?.action || '';

  try {
    switch (action) {
      case 'new_book':
        response = await handleNewBook(msg);
        break;

      case 'upgrade_book':
      case 'update_book':
      case 'add_to_chapter':
        response = await handleUpgradeBook(msg);
        break;

      case 'new_app':
        response = await handleNewApp(msg);
        break;

      case 'upgrade_app':
      case 'update_app':
      case 'fix_app':
        response = await handleUpgradeApp(msg);
        break;

      case 'deploy_site':
      case 'update_site':
        response = await handleDeploySite(msg);
        break;

      default:
        const lower = msg.message.toLowerCase();

        if (lower.includes('nuovo libro') || lower.includes('new book')) {
          msg.context = { action: 'new_book', target: msg.message, details: msg.message };
          response = await handleNewBook(msg);
        } else if (lower.includes('nuova app') || lower.includes('new app')) {
          msg.context = { action: 'new_app', target: msg.message, details: msg.message };
          response = await handleNewApp(msg);
        } else if (lower.includes('deploy') || lower.includes('pubblica') || lower.includes('carica')) {
          msg.context = { action: 'deploy_site', target: msg.message, details: msg.message };
          response = await handleDeploySite(msg);
        } else if (msg.type === 'photo' && msg.mediaPath) {
          response = `📷 Foto ricevuta!

Specifica il contesto:
• "per milo capitolo 2"
• "cover aiko"
• "per moonlight-house"`;
        } else {
          response = `💬 Ricevuto: "${msg.message.slice(0, 100)}..."

Comandi:
• nuovo libro [nome]
• nuova app [nome]
• per [libro] capitolo N
• deploy onde.surf`;
        }
    }
  } catch (e: any) {
    console.error('Processing error:', e);
    response = `❌ Errore: ${e.message || 'Errore sconosciuto'}`;
  }

  await sendTelegram(response);

  const srcPath = path.join(chatQueueDir, `${msg.id}.json`);
  const destPath = path.join(processedDir, `${msg.id}.json`);

  msg.status = 'processed';
  fs.writeFileSync(destPath, JSON.stringify(msg, null, 2));

  if (fs.existsSync(srcPath)) {
    fs.unlinkSync(srcPath);
  }

  console.log(`✅ Processed: [${msg.id}]`);
}

async function loop(): Promise<void> {
  console.log('🔄 Claude Loop starting (with auto-book generation)...');
  console.log(`   Poll interval: ${POLL_INTERVAL}ms`);
  console.log(`   Queue dir: ${chatQueueDir}`);
  console.log('');

  await sendTelegram(`🤖 *Claude Loop ATTIVO*

📚 Libri configurati: ${Object.keys(bookConfigs).join(', ')}

Invia immagini con caption:
• "cover [libro]" per copertina
• "per [libro] capitolo N" per capitoli

Quando tutte le immagini sono pronte, genero e pubblico automaticamente!`);

  while (true) {
    try {
      const files = fs.readdirSync(chatQueueDir).filter(f => f.endsWith('.json'));

      for (const file of files) {
        try {
          const filePath = path.join(chatQueueDir, file);
          const msg: QueueMessage = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

          if (msg.status === 'pending') {
            await processMessage(msg);
          }
        } catch (e) {
          console.error(`Error processing ${file}:`, e);
        }
      }
    } catch (e) {
      console.error('Loop error:', e);
    }

    await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL));
  }
}

loop().catch(console.error);
