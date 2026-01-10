#!/usr/bin/env node

/**
 * Audiobook Generator for Onde Books
 *
 * Genera audiobook usando ElevenLabs TTS.
 * Voice: Gianni Parola (narratore ufficiale Onde)
 *
 * Usage:
 *   node generate-audiobook.js --book <book-name>
 *   node generate-audiobook.js --book salmo-23-bambini
 *   node generate-audiobook.js --list
 *   node generate-audiobook.js --dry-run --book <book-name>
 *
 * Output: /Volumes/DATI-SSD/onde-audiobooks/<book-name>/
 */

require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const fs = require('fs');
const path = require('path');

// Paths
const ONDE_BASE = '/Users/mattia/Projects/Onde';
const BOOKS_PATHS = [
  path.join(ONDE_BASE, 'content/books'),
  path.join(ONDE_BASE, 'books')
];
const OUTPUT_BASE = '/Volumes/DATI-SSD/onde-audiobooks';

// ElevenLabs Configuration
const ELEVENLABS_API_URL = 'https://api.elevenlabs.io/v1';
const MODEL_ID = 'eleven_multilingual_v2';

// Voice settings for Gianni Parola
const GIANNI_VOICE_SETTINGS = {
  stability: 0.55,
  similarity_boost: 0.75,
  style: 0.25,
  use_speaker_boost: true
};

/**
 * Find all available books in the Onde project
 */
function findBooks() {
  const books = [];

  for (const basePath of BOOKS_PATHS) {
    if (!fs.existsSync(basePath)) continue;

    const entries = fs.readdirSync(basePath, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      if (entry.name.startsWith('.')) continue;

      const bookPath = path.join(basePath, entry.name);
      const textFile = findBookTextFile(bookPath);

      if (textFile) {
        books.push({
          name: entry.name,
          path: bookPath,
          textFile: textFile
        });
      }
    }
  }

  return books;
}

/**
 * Find the main text file for a book
 * Looks for: libro.md, text.md, book.md, testo.txt, audiobook-script.txt
 */
function findBookTextFile(bookPath) {
  const candidates = [
    'libro.md',
    'libro.txt',
    'text.md',
    'text.txt',
    'book.md',
    'book.txt',
    'testo.md',
    'testo.txt',
    'audiobook-script.txt',
    'storia-01-internet.md',  // For series like emilio
  ];

  for (const candidate of candidates) {
    const filePath = path.join(bookPath, candidate);
    if (fs.existsSync(filePath)) {
      return filePath;
    }
  }

  // Also check for any .md file with the book name
  const files = fs.readdirSync(bookPath);
  for (const file of files) {
    if (file.endsWith('.md') && !file.includes('CHECKLIST') && !file.includes('README')) {
      return path.join(bookPath, file);
    }
  }

  return null;
}

/**
 * Parse book text into chapters
 */
function parseBook(textFilePath) {
  const content = fs.readFileSync(textFilePath, 'utf-8');
  const chapters = [];

  // Split by chapter markers (## Capitolo, # CAPITOLO, [CAPITOLO], etc.)
  const chapterPatterns = [
    /^##\s*Capitolo\s*\d+[:\s]*/gmi,
    /^#\s*Capitolo\s*\d+[:\s]*/gmi,
    /^\[CAPITOLO\s*\d+\]/gmi,
    /^\[CHAPTER\s*\d+\]/gmi,
    /^---$/gm
  ];

  // Try to find chapter markers
  let lines = content.split('\n');
  let currentChapter = { title: 'Introduzione', text: '' };
  let inChapter = false;

  for (const line of lines) {
    // Check for chapter header
    const chapterMatch = line.match(/^#{1,2}\s*(Capitolo\s*\d+[:\s]*.*|Cap\s*\d+[:\s]*.*)/i);
    const chapterBracketMatch = line.match(/^\[(CAPITOLO|CHAPTER)\s*(\d+)\]/i);

    if (chapterMatch || chapterBracketMatch) {
      // Save previous chapter if it has content
      if (currentChapter.text.trim()) {
        chapters.push(currentChapter);
      }

      const title = chapterMatch
        ? chapterMatch[1].trim()
        : `Capitolo ${chapterBracketMatch[2]}`;

      currentChapter = { title, text: '' };
      inChapter = true;
      continue;
    }

    // Skip image references and metadata
    if (line.match(/^!\[.*\]\(.*\)/) ||
        line.match(/^\*Testi:/) ||
        line.match(/^\*Illustrazioni:/) ||
        line.match(/^\*Casa Editrice:/) ||
        line.match(/^---$/) ||
        line.match(/^\[PAUSA/) ||
        line.match(/^\[INTRO/) ||
        line.match(/^\[OUTRO/) ||
        line.match(/^#\s*NOTE TECNICHE/) ||
        line.match(/^#\s*MUSICA DI/)) {
      continue;
    }

    // Add content line (clean up markdown)
    let cleanLine = line
      .replace(/^#+\s*/, '')           // Remove headers
      .replace(/\*\*/g, '')            // Remove bold
      .replace(/\*/g, '')              // Remove italic
      .replace(/`/g, '')               // Remove code
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')  // Convert links to text
      .trim();

    if (cleanLine) {
      currentChapter.text += cleanLine + '\n';
    }
  }

  // Add last chapter
  if (currentChapter.text.trim()) {
    chapters.push(currentChapter);
  }

  // If no chapters found, treat entire content as single chapter
  if (chapters.length === 0) {
    chapters.push({
      title: 'Libro Completo',
      text: cleanText(content)
    });
  }

  return chapters;
}

/**
 * Clean text for TTS (remove markdown, special chars, etc.)
 */
function cleanText(text) {
  return text
    .replace(/^#+\s*/gm, '')           // Remove headers
    .replace(/!\[.*?\]\(.*?\)/g, '')   // Remove images
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')  // Convert links
    .replace(/\*\*/g, '')              // Remove bold
    .replace(/\*/g, '')                // Remove italic
    .replace(/`/g, '')                 // Remove code
    .replace(/^---$/gm, '')            // Remove horizontal rules
    .replace(/^\s*[-*]\s+/gm, '')      // Remove list bullets
    .replace(/\n{3,}/g, '\n\n')        // Normalize whitespace
    .trim();
}

/**
 * Generate speech with ElevenLabs API
 */
async function generateSpeech(text, voiceId) {
  const apiKey = process.env.ELEVENLABS_API_KEY;

  if (!apiKey) {
    throw new Error('ELEVENLABS_API_KEY not found in environment');
  }

  if (!voiceId) {
    throw new Error('Voice ID not provided. Set ELEVENLABS_VOICE_GIANNI in .env');
  }

  const response = await fetch(
    `${ELEVENLABS_API_URL}/text-to-speech/${voiceId}`,
    {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': apiKey
      },
      body: JSON.stringify({
        text: text,
        model_id: MODEL_ID,
        voice_settings: GIANNI_VOICE_SETTINGS
      })
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`ElevenLabs API error: ${response.status} - ${error}`);
  }

  return Buffer.from(await response.arrayBuffer());
}

/**
 * Calculate estimated cost
 */
function estimateCost(text) {
  const charCount = text.length;
  // ElevenLabs pricing: ~$0.30 per 1000 characters
  const cost = (charCount / 1000) * 0.30;
  return { charCount, cost: cost.toFixed(2) };
}

/**
 * Process a single book
 */
async function processBook(book, options = {}) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`  Processing: ${book.name}`);
  console.log(`${'='.repeat(60)}`);
  console.log(`  Source: ${book.textFile}`);

  // Parse book into chapters
  const chapters = parseBook(book.textFile);
  console.log(`  Chapters found: ${chapters.length}`);

  // Calculate total text and cost
  const totalText = chapters.map(c => c.text).join('\n\n');
  const { charCount, cost } = estimateCost(totalText);
  console.log(`  Total characters: ${charCount.toLocaleString()}`);
  console.log(`  Estimated cost: $${cost}`);

  // Create output directory
  const outputDir = path.join(OUTPUT_BASE, book.name);
  if (!options.dryRun) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  console.log(`  Output: ${outputDir}`);

  // Get voice ID
  const voiceId = process.env.ELEVENLABS_VOICE_GIANNI;
  if (!voiceId && !options.dryRun) {
    console.error('\n  ERROR: ELEVENLABS_VOICE_GIANNI not set in .env');
    console.log('  Add the following to your .env file:');
    console.log('  ELEVENLABS_VOICE_GIANNI=<your_voice_id>');
    return { success: false, error: 'Missing voice ID' };
  }

  // Process chapters
  const results = [];

  for (let i = 0; i < chapters.length; i++) {
    const chapter = chapters[i];
    const chapterNum = String(i + 1).padStart(2, '0');
    const outputFile = path.join(outputDir, `chapter-${chapterNum}.mp3`);

    console.log(`\n  Chapter ${i + 1}: ${chapter.title}`);
    console.log(`    Characters: ${chapter.text.length}`);
    console.log(`    Output: chapter-${chapterNum}.mp3`);

    if (options.dryRun) {
      console.log('    [DRY RUN] Would generate audio');
      results.push({ chapter: i + 1, status: 'dry-run' });
      continue;
    }

    try {
      console.log('    Generating audio...');
      const audioBuffer = await generateSpeech(chapter.text, voiceId);
      fs.writeFileSync(outputFile, audioBuffer);
      console.log(`    Saved: ${outputFile}`);
      results.push({ chapter: i + 1, status: 'success', file: outputFile });

      // Rate limiting - wait between API calls
      if (i < chapters.length - 1) {
        console.log('    Waiting 1s (rate limit)...');
        await sleep(1000);
      }
    } catch (error) {
      console.error(`    ERROR: ${error.message}`);
      results.push({ chapter: i + 1, status: 'error', error: error.message });
    }
  }

  // Save metadata
  const metadata = {
    book: book.name,
    source: book.textFile,
    generatedAt: new Date().toISOString(),
    chapters: chapters.map((c, i) => ({
      number: i + 1,
      title: c.title,
      characters: c.text.length
    })),
    totalCharacters: charCount,
    estimatedCost: cost,
    voice: 'Gianni Parola',
    model: MODEL_ID
  };

  if (!options.dryRun) {
    const metadataPath = path.join(outputDir, 'metadata.json');
    fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
    console.log(`\n  Metadata saved: ${metadataPath}`);
  }

  return {
    success: true,
    book: book.name,
    chapters: results,
    totalCharacters: charCount,
    estimatedCost: cost
  };
}

/**
 * List all available books
 */
function listBooks() {
  const books = findBooks();

  console.log('\n=== Available Books for Audiobook Generation ===\n');

  if (books.length === 0) {
    console.log('No books found.');
    return;
  }

  for (const book of books) {
    const chapters = parseBook(book.textFile);
    const totalText = chapters.map(c => c.text).join('\n\n');
    const { charCount, cost } = estimateCost(totalText);

    console.log(`  ${book.name}`);
    console.log(`    Path: ${book.path}`);
    console.log(`    Text: ${path.basename(book.textFile)}`);
    console.log(`    Chapters: ${chapters.length}`);
    console.log(`    Characters: ${charCount.toLocaleString()}`);
    console.log(`    Est. Cost: $${cost}`);
    console.log();
  }

  console.log(`Total books found: ${books.length}`);
}

/**
 * Helper: Sleep
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Main CLI
 */
async function main() {
  const args = process.argv.slice(2);

  // Parse arguments
  const options = {
    book: null,
    list: false,
    dryRun: false,
    all: false
  };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--book':
      case '-b':
        options.book = args[++i];
        break;
      case '--list':
      case '-l':
        options.list = true;
        break;
      case '--dry-run':
      case '-d':
        options.dryRun = true;
        break;
      case '--all':
      case '-a':
        options.all = true;
        break;
      case '--help':
      case '-h':
        printHelp();
        return;
    }
  }

  // List books
  if (options.list) {
    listBooks();
    return;
  }

  // Validate
  if (!options.book && !options.all) {
    console.error('Error: Please specify --book <name> or --all');
    console.log('Use --list to see available books');
    console.log('Use --help for more options');
    process.exit(1);
  }

  // Find books
  const allBooks = findBooks();

  if (allBooks.length === 0) {
    console.error('Error: No books found in the Onde project');
    process.exit(1);
  }

  // Select books to process
  let booksToProcess;
  if (options.all) {
    booksToProcess = allBooks;
  } else {
    const book = allBooks.find(b => b.name === options.book);
    if (!book) {
      console.error(`Error: Book "${options.book}" not found`);
      console.log('Available books:');
      allBooks.forEach(b => console.log(`  - ${b.name}`));
      process.exit(1);
    }
    booksToProcess = [book];
  }

  // Header
  console.log('\n' + '='.repeat(60));
  console.log('  ONDE AUDIOBOOK GENERATOR');
  console.log('  Voice: Gianni Parola');
  console.log('  Engine: ElevenLabs');
  console.log('='.repeat(60));

  if (options.dryRun) {
    console.log('\n  ** DRY RUN MODE - No audio will be generated **');
  }

  // Check output directory
  if (!fs.existsSync(OUTPUT_BASE)) {
    console.log(`\n  Creating output directory: ${OUTPUT_BASE}`);
    fs.mkdirSync(OUTPUT_BASE, { recursive: true });
  }

  // Process books
  const results = [];
  for (const book of booksToProcess) {
    const result = await processBook(book, { dryRun: options.dryRun });
    results.push(result);

    // Wait between books
    if (booksToProcess.indexOf(book) < booksToProcess.length - 1) {
      console.log('\n  Waiting 5s before next book...');
      await sleep(5000);
    }
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('  SUMMARY');
  console.log('='.repeat(60));

  let totalChars = 0;
  let totalCost = 0;

  for (const result of results) {
    console.log(`\n  ${result.book}:`);
    console.log(`    Characters: ${result.totalCharacters?.toLocaleString() || 'N/A'}`);
    console.log(`    Est. Cost: $${result.estimatedCost || 'N/A'}`);
    console.log(`    Status: ${result.success ? 'Success' : 'Failed'}`);

    if (result.totalCharacters) totalChars += result.totalCharacters;
    if (result.estimatedCost) totalCost += parseFloat(result.estimatedCost);
  }

  console.log('\n  TOTALS:');
  console.log(`    Books processed: ${results.length}`);
  console.log(`    Total characters: ${totalChars.toLocaleString()}`);
  console.log(`    Total est. cost: $${totalCost.toFixed(2)}`);

  console.log('\n  Done!');
}

/**
 * Print help
 */
function printHelp() {
  console.log(`
Onde Audiobook Generator
========================

Generates audiobooks from Onde books using ElevenLabs TTS.
Voice: Gianni Parola (official Onde narrator)

Usage:
  node generate-audiobook.js --book <book-name>
  node generate-audiobook.js --all
  node generate-audiobook.js --list

Options:
  --book, -b <name>   Generate audiobook for specific book
  --all, -a           Generate audiobooks for all books
  --list, -l          List all available books
  --dry-run, -d       Show what would be done without generating
  --help, -h          Show this help

Examples:
  # List all books
  node generate-audiobook.js --list

  # Generate for one book
  node generate-audiobook.js --book salmo-23-bambini

  # Dry run (preview)
  node generate-audiobook.js --dry-run --book salmo-23-bambini

  # Generate all books
  node generate-audiobook.js --all

Environment:
  ELEVENLABS_API_KEY      Your ElevenLabs API key
  ELEVENLABS_VOICE_GIANNI Voice ID for Gianni Parola

Output:
  /Volumes/DATI-SSD/onde-audiobooks/<book-name>/
    chapter-01.mp3
    chapter-02.mp3
    ...
    metadata.json
`);
}

// Run
main().catch(err => {
  console.error('Fatal error:', err.message);
  process.exit(1);
});
