/**
 * SMART LOOP v2 - Integrato con Editore Capo
 *
 * Rispetta:
 * - PROGRESS.md come fonte di verità
 * - BOOK_FACTORY.md per workflow
 * - Blocco immagini se stile non approvato
 * - Sistema agenti (Editore Capo, Pina Pennello, Gianni Parola)
 */

import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';
import { execSync } from 'child_process';

// ============================================================================
// CONFIGURATION
// ============================================================================

const TELEGRAM_TOKEN = process.env.ONDE_PR_TELEGRAM_TOKEN || '8272332520:AAF7zrKpqOCnFMqOlF1GJCLycJFk3IPO6ps';
const CHAT_ID = process.env.ONDE_PR_CHAT_ID || '7505631979';
const POLL_INTERVAL = 3000;

const chatQueueDir = path.join(__dirname, '../chat_queue');
const mediaDir = path.join(__dirname, '../media');
const processedDir = path.join(__dirname, '../processed');
const ondeRoot = '/Users/mattiapetrucciani/CascadeProjects/Onde';
const booksDir = path.join(ondeRoot, 'books');
const progressFile = path.join(ondeRoot, 'PROGRESS.md');

// Ensure directories exist
[chatQueueDir, mediaDir, processedDir].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// ============================================================================
// BOOK REGISTRY - Source of truth from actual folders
// ============================================================================

interface BookInfo {
  key: string;           // Short key for commands
  folder: string;        // Actual folder name
  title: string;         // Display title
  chapters: number;      // Expected chapters
  keywords: string[];    // Ways to refer to this book
  styleApproved: boolean; // Can we generate PDF?
}

const bookRegistry: BookInfo[] = [
  // MILO AI - Robot arancione, design Tesla/minimalista, stile Luzzati (upgrade da AIKO)
  {
    key: 'milo-ai',
    folder: 'milo',  // Same folder, different subfolder for AI book
    title: 'MILO: AI Explained to Children',
    chapters: 8,
    keywords: ['milo ai', 'milo 1', 'ai spiegata', 'ai explained'],
    styleApproved: false  // Prompt pronti, immagini da generare
  },
  // MILO Internet - Robot arancione, design Tesla/minimalista, stile Luzzati
  {
    key: 'milo-internet',
    folder: 'milo',
    title: 'MILO: Come Funziona Internet',
    chapters: 10,
    keywords: ['milo internet', 'milo 2', 'internet'],
    styleApproved: false  // IN CORSO - rigenerazione immagini
  },
  {
    key: 'salmo',
    folder: 'salmo-23-bambini',
    title: 'Il Salmo 23 per Bambini',
    chapters: 6,
    keywords: ['salmo', 'salmo 23', 'psalm', 'pastore'],
    styleApproved: true
  },
  {
    key: 'piccole-rime',
    folder: 'piccole-rime',
    title: 'Piccole Rime - Poesie Italiane',
    chapters: 10,
    keywords: ['piccole rime', 'rime', 'poesie', 'filastrocche'],
    styleApproved: true
  }
];

function findBook(text: string): BookInfo | null {
  const lower = text.toLowerCase();
  for (const book of bookRegistry) {
    for (const kw of book.keywords) {
      if (lower.includes(kw)) return book;
    }
  }
  return null;
}

function getBookPath(book: BookInfo): string {
  return path.join(booksDir, book.folder);
}

// ============================================================================
// CONTEXT MEMORY
// ============================================================================

interface WorkContext {
  currentBook: string | null;
  lastChapter: number | null;
  lastActivity: Date;
  pendingPhotos: string[];
}

let context: WorkContext = {
  currentBook: null,
  lastChapter: null,
  lastActivity: new Date(),
  pendingPhotos: []
};

const contextFile = path.join(__dirname, '../context.json');

function saveContext() {
  fs.writeFileSync(contextFile, JSON.stringify(context, null, 2));
}

function loadContext() {
  if (fs.existsSync(contextFile)) {
    try {
      context = JSON.parse(fs.readFileSync(contextFile, 'utf-8'));
      context.lastActivity = new Date(context.lastActivity);
    } catch (e) { }
  }
}

// ============================================================================
// CHAPTER DETECTION
// ============================================================================

function detectChapter(text: string): number | null {
  const lower = text.toLowerCase();

  if (lower.includes('cover') || lower.includes('copertina')) return 0;

  const patterns = [
    /ch(?:apter)?\s*\.?\s*(\d+)/i,
    /cap(?:itolo)?\s*\.?\s*(\d+)/i,
    /#\s*(\d+)/,
    /(\d+)\s*$/,
  ];

  for (const p of patterns) {
    const m = lower.match(p);
    if (m) return parseInt(m[1], 10);
  }
  return null;
}

// ============================================================================
// BOOK STATUS - Reads actual files
// ============================================================================

function getBookStatus(book: BookInfo): {
  hasCover: boolean;
  chapters: number[];
  missing: number[];
  complete: boolean;
} {
  const imagesDir = path.join(getBookPath(book), 'images');

  if (!fs.existsSync(imagesDir)) {
    return {
      hasCover: false,
      chapters: [],
      missing: Array.from({ length: book.chapters }, (_, i) => i + 1),
      complete: false
    };
  }

  const files = fs.readdirSync(imagesDir);
  const hasCover = files.some(f => f.toLowerCase().includes('cover'));

  const chapters: number[] = [];
  const missing: number[] = [];

  for (let i = 1; i <= book.chapters; i++) {
    const padded = i.toString().padStart(2, '0');
    const found = files.some(f => {
      const l = f.toLowerCase();
      return l.includes(`ch${padded}`) || l.includes(`ch${i}-`) || l.includes(`ch${i}.`) ||
        l.includes(`chapter${i}`) || l.includes(`cap${i}`);
    });
    if (found) chapters.push(i);
    else missing.push(i);
  }

  return {
    hasCover,
    chapters,
    missing,
    complete: hasCover && missing.length === 0
  };
}

// ============================================================================
// TELEGRAM HELPERS
// ============================================================================

async function sendTelegram(text: string): Promise<boolean> {
  return new Promise((resolve) => {
    const safeText = text.replace(/[_*`]/g, '');
    const data = JSON.stringify({ chat_id: CHAT_ID, text: safeText });

    const req = https.request({
      hostname: 'api.telegram.org',
      path: `/bot${TELEGRAM_TOKEN}/sendMessage`,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) }
    }, (res) => {
      res.on('data', () => { });
      res.on('end', () => resolve(res.statusCode === 200));
    });

    req.on('error', () => resolve(false));
    req.write(data);
    req.end();
  });
}

// ============================================================================
// IMAGE SAVING
// ============================================================================

function saveImageToBook(book: BookInfo, sourcePath: string, chapter: number): string {
  const bookPath = getBookPath(book);
  const imagesDir = path.join(bookPath, 'images');

  if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir, { recursive: true });
  }

  const ext = path.extname(sourcePath) || '.jpg';
  // Use naming convention: emilio-ch01-description.jpg or cover.jpg
  const fileName = chapter === 0
    ? `${book.key}-cover${ext}`
    : `${book.key}-ch${chapter.toString().padStart(2, '0')}${ext}`;

  const destPath = path.join(imagesDir, fileName);
  fs.copyFileSync(sourcePath, destPath);

  return destPath;
}

// ============================================================================
// MESSAGE PROCESSING
// ============================================================================

interface QueueMessage {
  id: string;
  from: string;
  type?: string;
  message: string;
  caption?: string;
  mediaPath?: string;
  timestamp: string;
  status: string;
}

async function processMessage(msg: QueueMessage): Promise<void> {
  const text = msg.caption || msg.message || '';
  console.log(`📨 [${msg.id}] ${msg.type || 'text'}: "${text.slice(0, 50)}"`);

  const book = findBook(text);
  const chapter = detectChapter(text);

  // Update context if book mentioned
  if (book) {
    context.currentBook = book.key;
    context.lastActivity = new Date();
    saveContext();
  }

  // Handle PHOTO
  if (msg.type === 'photo' && msg.mediaPath && fs.existsSync(msg.mediaPath)) {
    const targetBook = book || (context.currentBook ? bookRegistry.find(b => b.key === context.currentBook) : null);

    if (!targetBook) {
      context.pendingPhotos.push(msg.mediaPath);
      saveContext();

      const bookList = bookRegistry.map(b => `• ${b.key} (${b.title.split('-')[0].trim()})`).join('\n');
      await sendTelegram(`📷 Foto ricevuta!

Per quale libro? Scrivi il nome o manda con caption tipo "emilio ch 3"

Libri:
${bookList}`);
      return;
    }

    // Determine chapter
    let targetChapter = chapter;
    if (targetChapter === null) {
      const status = getBookStatus(targetBook);
      if (!status.hasCover) targetChapter = 0;
      else if (status.missing.length > 0) targetChapter = status.missing[0];
      else targetChapter = status.chapters.length + 1;
    }

    // Save image
    const savedPath = saveImageToBook(targetBook, msg.mediaPath, targetChapter);
    const chapterName = targetChapter === 0 ? 'COVER' : `Cap ${targetChapter}`;

    const status = getBookStatus(targetBook);
    const progressBar = `${status.hasCover ? '✓' : '○'} cover | ${status.chapters.length}/${targetBook.chapters} cap`;

    let response = `✅ ${targetBook.title}
${chapterName} salvato!

📊 ${progressBar}`;

    if (status.missing.length > 0) {
      response += `\nMancano: ${status.missing.join(', ')}`;
    }

    // Check if complete
    if (status.complete) {
      if (targetBook.styleApproved) {
        response += `\n\n🎉 COMPLETO! Scrivi "genera pdf" per creare il libro.`;
      } else {
        response += `\n\n⏸️ Immagini complete ma STILE NON APPROVATO.
Quando lo stile e approvato, scrivi "genera pdf".`;
      }
    }

    await sendTelegram(response);

    context.lastChapter = targetChapter;
    saveContext();
    return;
  }

  // Handle TEXT commands
  const lower = text.toLowerCase();

  // STATO
  if (lower.includes('stato') || lower.includes('status')) {
    const targetBook = book || (context.currentBook ? bookRegistry.find(b => b.key === context.currentBook) : null);

    if (targetBook) {
      const status = getBookStatus(targetBook);
      const styleStatus = targetBook.styleApproved ? '✅ Approvato' : '⏸️ In definizione';

      await sendTelegram(`📊 ${targetBook.title}

Cover: ${status.hasCover ? '✅' : '❌'}
Capitoli: ${status.chapters.length}/${targetBook.chapters}
${status.chapters.length > 0 ? `Presenti: ${status.chapters.join(', ')}` : ''}
${status.missing.length > 0 ? `Mancanti: ${status.missing.join(', ')}` : ''}

Stile: ${styleStatus}
${status.complete ? (targetBook.styleApproved ? '\n🎉 Pronto per PDF!' : '\n⏸️ Aspetta approvazione stile') : ''}`);
    } else {
      // All books status
      let msg = '📚 DASHBOARD LIBRI\n\n';
      for (const b of bookRegistry) {
        const s = getBookStatus(b);
        const prog = s.hasCover ? s.chapters.length + 1 : s.chapters.length;
        const total = b.chapters + 1;
        const pct = Math.round((prog / total) * 100);
        const bar = s.complete ? '✅' : (b.styleApproved ? '🟢' : '🟡');
        msg += `${bar} ${b.key}: ${pct}% (${prog}/${total})\n`;
      }
      msg += '\nScrivi "stato [libro]" per dettagli';
      await sendTelegram(msg);
    }
    return;
  }

  // CONTEXT SET: "per emilio", "lavoro su aiko"
  if (lower.startsWith('per ') || lower.includes('lavoro su')) {
    if (book) {
      context.currentBook = book.key;
      saveContext();

      // Process pending photos
      if (context.pendingPhotos.length > 0) {
        const status = getBookStatus(book);
        let nextCh = status.hasCover ? (status.missing[0] || status.chapters.length + 1) : 0;

        for (const photo of context.pendingPhotos) {
          saveImageToBook(book, photo, nextCh);
          nextCh = nextCh === 0 ? 1 : nextCh + 1;
        }

        const newStatus = getBookStatus(book);
        const count = context.pendingPhotos.length;
        context.pendingPhotos = [];
        saveContext();

        await sendTelegram(`✅ Contesto: ${book.title}

Salvate ${count} foto in attesa.
📊 ${newStatus.hasCover ? '✓' : '○'} cover | ${newStatus.chapters.length}/${book.chapters} cap`);
      } else {
        await sendTelegram(`✅ Contesto: ${book.title}

Ora manda le foto e le salvo automaticamente.
Stile: ${book.styleApproved ? '✅ Approvato' : '⏸️ In definizione'}`);
      }
    }
    return;
  }

  // HELP
  await sendTelegram(`📚 EDITORE CAPO - Smart Loop

Comandi:
• Manda foto con "emilio ch 3" o "aiko cover"
• "per emilio" - imposta contesto
• "stato" - vedi tutti i libri
• "stato emilio" - dettaglio libro

Libri attivi:
${bookRegistry.map(b => `• ${b.key}${b.styleApproved ? '' : ' (stile in definizione)'}`).join('\n')}`);
}

// ============================================================================
// MAIN LOOP
// ============================================================================

async function loop(): Promise<void> {
  console.log('📚 Smart Loop v2 - Editore Capo');
  console.log(`   Libri: ${bookRegistry.map(b => b.key).join(', ')}`);
  console.log('');

  loadContext();

  await sendTelegram(`📚 EDITORE CAPO attivo!

Manda foto con caption:
• "emilio ch 1" - salva capitolo
• "aiko cover" - salva copertina

Comandi:
• "stato" - vedi dashboard
• "per emilio" - imposta contesto

Libri in lavorazione:
${bookRegistry.filter(b => !b.styleApproved).map(b => `• ${b.key} (stile in definizione)`).join('\n') || '(nessuno)'}

Libri pronti:
${bookRegistry.filter(b => b.styleApproved).map(b => `• ${b.key}`).join('\n')}`);

  while (true) {
    try {
      const files = fs.readdirSync(chatQueueDir).filter(f => f.endsWith('.json'));

      for (const file of files) {
        try {
          const filePath = path.join(chatQueueDir, file);
          const msg: QueueMessage = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

          if (msg.status === 'pending') {
            await processMessage(msg);

            msg.status = 'processed';
            fs.writeFileSync(path.join(processedDir, file), JSON.stringify(msg, null, 2));
            fs.unlinkSync(filePath);
          }
        } catch (e) {
          console.error(`Error: ${file}`, e);
        }
      }
    } catch (e) {
      console.error('Loop error:', e);
    }

    await new Promise(r => setTimeout(r, POLL_INTERVAL));
  }
}

loop().catch(console.error);
