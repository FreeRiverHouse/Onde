#!/usr/bin/env node
/**
 * ONDE ONE-CLICK PUBLISHING PIPELINE
 *
 * Orchestrates multi-platform publishing from a single command.
 *
 * Supported platforms:
 * - KDP (Kindle Direct Publishing) - ePub/PDF
 * - Spotify (Podcast/Audio) - MP3
 * - YouTube - Video MP4 + Thumbnail
 * - TikTok - Short video MP4
 * - Instagram - Image/Carousel + Reels
 * - X (Twitter) - Text + Image/Video
 *
 * Usage:
 *   node publish-all.js --book <book-id>
 *   node publish-all.js --book piccole-rime --platforms kdp,youtube
 *   node publish-all.js --manifest path/to/manifest.json
 *
 * @author Onde Factory
 * @version 1.0.0
 */

import { existsSync, readFileSync, writeFileSync, mkdirSync, readdirSync } from 'fs';
import { join, dirname, basename, extname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = join(__dirname, '../..');

// ═══════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════

const CONFIG = {
  // Directory paths
  booksDir: join(PROJECT_ROOT, 'books'),
  outputDir: join(PROJECT_ROOT, 'output'),
  logsDir: join(PROJECT_ROOT, 'logs'),

  // Factory scripts
  factoryDir: join(PROJECT_ROOT, 'scripts/factory'),

  // Platform configurations
  platforms: {
    kdp: {
      name: 'Kindle Direct Publishing',
      formats: ['epub', 'pdf'],
      metadataFields: ['title', 'author', 'description', 'categories', 'keywords', 'language', 'price'],
      enabled: true
    },
    spotify: {
      name: 'Spotify (Podcast)',
      formats: ['mp3'],
      metadataFields: ['title', 'description', 'episode_number', 'season', 'duration'],
      enabled: true
    },
    youtube: {
      name: 'YouTube',
      formats: ['mp4', 'thumbnail'],
      metadataFields: ['title', 'description', 'tags', 'category', 'privacy', 'language'],
      enabled: true
    },
    tiktok: {
      name: 'TikTok',
      formats: ['mp4_vertical'],
      metadataFields: ['caption', 'hashtags', 'sounds'],
      maxDuration: 180, // 3 minutes
      aspectRatio: '9:16',
      enabled: true
    },
    instagram: {
      name: 'Instagram',
      formats: ['image', 'carousel', 'reel'],
      metadataFields: ['caption', 'hashtags', 'location', 'alt_text'],
      enabled: true
    },
    x: {
      name: 'X (Twitter)',
      formats: ['text', 'image', 'video'],
      metadataFields: ['text', 'alt_text', 'reply_settings'],
      maxLength: 280,
      enabled: true
    }
  },

  // Default metadata
  defaults: {
    author: 'Onde Publishing',
    language: 'it',
    publisher: 'Onde',
    website: 'onde.la'
  }
};

// ═══════════════════════════════════════════════════════════
// LOGGING
// ═══════════════════════════════════════════════════════════

const LOG_LEVELS = { DEBUG: 0, INFO: 1, WARN: 2, ERROR: 3, ACTION: 4 };
let currentLogLevel = LOG_LEVELS.INFO;

function log(message, level = 'INFO', data = null) {
  if (LOG_LEVELS[level] < currentLogLevel) return;

  const timestamp = new Date().toISOString();
  const prefix = {
    DEBUG: '   ',
    INFO: '   ',
    WARN: '   ',
    ERROR: '   ',
    ACTION: '   '
  }[level];

  const logLine = `[${timestamp}] [${level}] ${prefix} ${message}`;
  console.log(logLine);

  // Also write to log file
  const logFile = join(CONFIG.logsDir, 'publish-all.log');
  if (!existsSync(CONFIG.logsDir)) mkdirSync(CONFIG.logsDir, { recursive: true });

  const logEntry = {
    timestamp,
    level,
    message,
    data
  };

  try {
    let logs = [];
    if (existsSync(logFile)) {
      const content = readFileSync(logFile, 'utf-8');
      logs = content.split('\n').filter(l => l).map(l => JSON.parse(l));
    }
    logs.push(logEntry);
    // Keep only last 1000 entries
    if (logs.length > 1000) logs = logs.slice(-1000);
    writeFileSync(logFile, logs.map(l => JSON.stringify(l)).join('\n'));
  } catch (e) {
    // Silent fail for logging
  }
}

// ═══════════════════════════════════════════════════════════
// BOOK LOADER
// ═══════════════════════════════════════════════════════════

function loadBook(bookId) {
  const bookDir = join(CONFIG.booksDir, bookId);

  if (!existsSync(bookDir)) {
    throw new Error(`Book not found: ${bookId} (looked in ${bookDir})`);
  }

  log(`Loading book: ${bookId}`, 'INFO');

  // Try to load metadata
  const metadataPath = join(bookDir, 'metadata.json');
  let metadata = {};

  if (existsSync(metadataPath)) {
    metadata = JSON.parse(readFileSync(metadataPath, 'utf-8'));
    log(`Loaded metadata from ${metadataPath}`, 'DEBUG');
  } else {
    log(`No metadata.json found, will use defaults`, 'WARN');
  }

  // Scan for assets
  const assets = {
    texts: [],
    images: [],
    audio: [],
    video: [],
    pdf: [],
    epub: []
  };

  const files = readdirSync(bookDir, { recursive: true });

  for (const file of files) {
    const ext = extname(file).toLowerCase();
    const filePath = join(bookDir, file);

    if (ext === '.md' || ext === '.txt') assets.texts.push(filePath);
    if (['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) assets.images.push(filePath);
    if (['.mp3', '.wav', '.m4a'].includes(ext)) assets.audio.push(filePath);
    if (['.mp4', '.mov', '.webm'].includes(ext)) assets.video.push(filePath);
    if (ext === '.pdf') assets.pdf.push(filePath);
    if (ext === '.epub') assets.epub.push(filePath);
  }

  log(`Found assets: ${assets.texts.length} texts, ${assets.images.length} images, ${assets.audio.length} audio, ${assets.video.length} video`, 'INFO');

  return {
    id: bookId,
    dir: bookDir,
    metadata: {
      ...CONFIG.defaults,
      ...metadata
    },
    assets
  };
}

// ═══════════════════════════════════════════════════════════
// FORMAT GENERATORS
// ═══════════════════════════════════════════════════════════

async function generateFormat(book, format) {
  const outputDir = join(CONFIG.outputDir, book.id);
  if (!existsSync(outputDir)) mkdirSync(outputDir, { recursive: true });

  switch (format) {
    case 'epub':
      return generateEpub(book, outputDir);
    case 'pdf':
      return generatePDF(book, outputDir);
    case 'mp3':
      return generateAudio(book, outputDir);
    case 'mp4':
      return generateVideo(book, outputDir);
    case 'mp4_vertical':
      return generateVerticalVideo(book, outputDir);
    case 'thumbnail':
      return generateThumbnail(book, outputDir);
    case 'image':
    case 'carousel':
      return prepareImages(book, outputDir);
    default:
      log(`Unknown format: ${format}`, 'WARN');
      return null;
  }
}

function generateEpub(book, outputDir) {
  log(`[ePub] Checking existing ePub...`, 'ACTION');

  if (book.assets.epub.length > 0) {
    log(`[ePub] Found existing: ${book.assets.epub[0]}`, 'INFO');
    return { path: book.assets.epub[0], status: 'existing' };
  }

  log(`[ePub] ACTION NEEDED: Generate ePub using scripts/factory/generate-epub.js`, 'ACTION');
  log(`[ePub] Command: node scripts/factory/generate-epub.js --book ${book.id}`, 'ACTION');

  return {
    path: null,
    status: 'needs_generation',
    action: `node scripts/factory/generate-epub.js --book ${book.id}`
  };
}

function generatePDF(book, outputDir) {
  log(`[PDF] Checking existing PDF...`, 'ACTION');

  if (book.assets.pdf.length > 0) {
    log(`[PDF] Found existing: ${book.assets.pdf[0]}`, 'INFO');
    return { path: book.assets.pdf[0], status: 'existing' };
  }

  log(`[PDF] ACTION NEEDED: Generate PDF from content`, 'ACTION');
  log(`[PDF] Suggested: Use puppeteer or wkhtmltopdf to convert HTML/MD to PDF`, 'ACTION');

  return {
    path: null,
    status: 'needs_generation',
    action: `Generate PDF for ${book.id}`
  };
}

function generateAudio(book, outputDir) {
  log(`[Audio] Checking existing audio...`, 'ACTION');

  if (book.assets.audio.length > 0) {
    log(`[Audio] Found existing: ${book.assets.audio[0]}`, 'INFO');
    return { path: book.assets.audio[0], status: 'existing' };
  }

  log(`[Audio] ACTION NEEDED: Generate audio using ElevenLabs`, 'ACTION');
  log(`[Audio] Command: node scripts/factory/generate-audio.js --book ${book.id}`, 'ACTION');

  return {
    path: null,
    status: 'needs_generation',
    action: `node scripts/factory/generate-audio.js --book ${book.id}`
  };
}

function generateVideo(book, outputDir) {
  log(`[Video] Checking existing video...`, 'ACTION');

  const mp4Files = book.assets.video.filter(v => v.endsWith('.mp4'));
  if (mp4Files.length > 0) {
    log(`[Video] Found existing: ${mp4Files[0]}`, 'INFO');
    return { path: mp4Files[0], status: 'existing' };
  }

  log(`[Video] ACTION NEEDED: Generate video from images + audio`, 'ACTION');
  log(`[Video] Suggested: Use FFmpeg to combine images and audio`, 'ACTION');

  return {
    path: null,
    status: 'needs_generation',
    action: `Generate video for ${book.id} using FFmpeg`
  };
}

function generateVerticalVideo(book, outputDir) {
  log(`[Vertical Video] Checking for 9:16 video...`, 'ACTION');

  // For TikTok/Reels we need vertical format
  log(`[Vertical Video] ACTION NEEDED: Create 9:16 vertical version`, 'ACTION');
  log(`[Vertical Video] Suggested: Use FFmpeg with -vf "crop=ih*9/16:ih,scale=1080:1920"`, 'ACTION');

  return {
    path: null,
    status: 'needs_generation',
    action: `Generate vertical video for ${book.id}`
  };
}

function generateThumbnail(book, outputDir) {
  log(`[Thumbnail] Checking for thumbnail...`, 'ACTION');

  // Look for a file named thumbnail or cover
  const thumbnails = book.assets.images.filter(i =>
    basename(i).toLowerCase().includes('thumbnail') ||
    basename(i).toLowerCase().includes('cover')
  );

  if (thumbnails.length > 0) {
    log(`[Thumbnail] Found: ${thumbnails[0]}`, 'INFO');
    return { path: thumbnails[0], status: 'existing' };
  }

  if (book.assets.images.length > 0) {
    log(`[Thumbnail] Using first image as thumbnail: ${book.assets.images[0]}`, 'INFO');
    return { path: book.assets.images[0], status: 'using_fallback' };
  }

  log(`[Thumbnail] ACTION NEEDED: Generate thumbnail with Grok`, 'ACTION');

  return {
    path: null,
    status: 'needs_generation',
    action: `Generate thumbnail for ${book.id}`
  };
}

function prepareImages(book, outputDir) {
  log(`[Images] Preparing images for social...`, 'ACTION');

  if (book.assets.images.length === 0) {
    log(`[Images] ACTION NEEDED: Generate images with Grok`, 'ACTION');
    return {
      paths: [],
      status: 'needs_generation',
      action: `Generate social images for ${book.id}`
    };
  }

  log(`[Images] Found ${book.assets.images.length} images`, 'INFO');
  return { paths: book.assets.images, status: 'existing' };
}

// ═══════════════════════════════════════════════════════════
// METADATA PREPARERS
// ═══════════════════════════════════════════════════════════

function prepareKDPMetadata(book) {
  return {
    title: book.metadata.title || book.id,
    author: book.metadata.author || CONFIG.defaults.author,
    description: book.metadata.description || '',
    categories: book.metadata.categories || ['Children\'s Books'],
    keywords: book.metadata.keywords || [],
    language: book.metadata.language || 'it',
    price: book.metadata.price || { amount: 2.99, currency: 'EUR' },
    isbn: book.metadata.isbn || null,
    asin: book.metadata.asin || null
  };
}

function prepareSpotifyMetadata(book) {
  return {
    title: book.metadata.title || book.id,
    description: book.metadata.description || '',
    episodeNumber: book.metadata.episodeNumber || 1,
    season: book.metadata.season || 1,
    explicit: false,
    language: book.metadata.language || 'it'
  };
}

function prepareYouTubeMetadata(book) {
  return {
    title: book.metadata.youtubeTitle || book.metadata.title || book.id,
    description: `${book.metadata.description || ''}\n\n${getYouTubeFooter(book)}`,
    tags: book.metadata.tags || ['bambini', 'storie', 'italiano', 'onde'],
    categoryId: '27', // Education
    privacyStatus: 'public',
    defaultLanguage: book.metadata.language || 'it',
    madeForKids: true
  };
}

function prepareTikTokMetadata(book) {
  const hashtags = book.metadata.hashtags || ['#storieperbambini', '#fiabe', '#onde'];
  return {
    caption: book.metadata.tiktokCaption || book.metadata.title || book.id,
    hashtags: hashtags.join(' '),
    sound: book.metadata.tiktokSound || null
  };
}

function prepareInstagramMetadata(book) {
  const hashtags = book.metadata.hashtags || ['#storieperbambini', '#fiabe', '#libriperbambini', '#onde'];
  return {
    caption: `${book.metadata.instagramCaption || book.metadata.title || book.id}\n\n${hashtags.join(' ')}`,
    altText: book.metadata.altText || `Illustrazione da ${book.metadata.title}`,
    location: book.metadata.location || null
  };
}

function prepareXMetadata(book) {
  // No hashtags on X (per Onde rules)
  return {
    text: book.metadata.xText || book.metadata.title || book.id,
    altText: book.metadata.altText || `Illustrazione da ${book.metadata.title}`,
    replySettings: 'everyone'
  };
}

function getYouTubeFooter(book) {
  return `
---
Onde Publishing | onde.la
Libri e storie per bambini

Iscriviti per altre storie!
  `.trim();
}

// ═══════════════════════════════════════════════════════════
// PLATFORM PUBLISHERS (LOGGING ONLY)
// ═══════════════════════════════════════════════════════════

function logPublishAction(platform, book, assets, metadata) {
  const platformConfig = CONFIG.platforms[platform];

  console.log(`\n${'='.repeat(60)}`);
  console.log(`PLATFORM: ${platformConfig.name.toUpperCase()}`);
  console.log('='.repeat(60));

  log(`[${platform}] Preparing to publish: ${book.metadata.title}`, 'ACTION');

  // Log metadata
  console.log('\nMetadata:');
  Object.entries(metadata).forEach(([key, value]) => {
    if (typeof value === 'object') {
      console.log(`  ${key}: ${JSON.stringify(value)}`);
    } else {
      console.log(`  ${key}: ${value}`);
    }
  });

  // Log assets
  console.log('\nAssets:');
  Object.entries(assets).forEach(([format, info]) => {
    if (info) {
      if (info.path) {
        console.log(`  ${format}: ${info.path} [${info.status}]`);
      } else if (info.paths) {
        console.log(`  ${format}: ${info.paths.length} files [${info.status}]`);
      } else if (info.action) {
        console.log(`  ${format}: NEEDS ACTION - ${info.action}`);
      }
    }
  });

  // Log required actions
  const neededActions = Object.entries(assets)
    .filter(([_, info]) => info && info.status === 'needs_generation')
    .map(([_, info]) => info.action);

  if (neededActions.length > 0) {
    console.log('\n  ACTIONS REQUIRED:');
    neededActions.forEach((action, i) => {
      console.log(`    ${i + 1}. ${action}`);
    });
  }

  // Log upload command (when ready)
  console.log('\n  UPLOAD (when assets ready):');
  switch (platform) {
    case 'kdp':
      console.log('    1. Go to https://kdp.amazon.com');
      console.log('    2. Create new Kindle eBook');
      console.log('    3. Upload ePub and PDF files');
      console.log('    4. Set pricing and publish');
      break;
    case 'spotify':
      console.log('    1. Go to https://podcasters.spotify.com');
      console.log('    2. Upload audio file');
      console.log('    3. Fill in episode details');
      console.log('    4. Publish');
      break;
    case 'youtube':
      console.log(`    node scripts/factory/youtube-upload.js --video <video.mp4> --title "${metadata.title}"`);
      break;
    case 'tiktok':
      console.log('    1. Open TikTok app');
      console.log('    2. Upload vertical video');
      console.log('    3. Add caption and hashtags');
      console.log('    4. Post');
      break;
    case 'instagram':
      console.log('    1. Use Meta Business Suite or app');
      console.log('    2. Upload images/reel');
      console.log('    3. Add caption');
      console.log('    4. Post');
      break;
    case 'x':
      console.log('    Use @OndePR_bot: /onde <text>');
      console.log('    Or API: POST /2/tweets');
      break;
  }
}

// ═══════════════════════════════════════════════════════════
// MAIN PIPELINE
// ═══════════════════════════════════════════════════════════

async function publishAll(bookId, platforms = null) {
  console.log(`
${'='.repeat(60)}
  ONDE ONE-CLICK PUBLISHING PIPELINE
${'='.repeat(60)}
  Book: ${bookId}
  Platforms: ${platforms ? platforms.join(', ') : 'ALL'}
  Time: ${new Date().toISOString()}
${'='.repeat(60)}
`);

  // Load book
  const book = loadBook(bookId);

  // Determine which platforms to publish to
  const targetPlatforms = platforms || Object.keys(CONFIG.platforms).filter(p => CONFIG.platforms[p].enabled);

  const results = {
    book: bookId,
    timestamp: new Date().toISOString(),
    platforms: {}
  };

  // Process each platform
  for (const platform of targetPlatforms) {
    const platformConfig = CONFIG.platforms[platform];

    if (!platformConfig) {
      log(`Unknown platform: ${platform}`, 'ERROR');
      continue;
    }

    if (!platformConfig.enabled) {
      log(`Platform disabled: ${platform}`, 'WARN');
      continue;
    }

    // Generate/check required formats
    const assets = {};
    for (const format of platformConfig.formats) {
      assets[format] = await generateFormat(book, format);
    }

    // Prepare metadata
    let metadata;
    switch (platform) {
      case 'kdp':
        metadata = prepareKDPMetadata(book);
        break;
      case 'spotify':
        metadata = prepareSpotifyMetadata(book);
        break;
      case 'youtube':
        metadata = prepareYouTubeMetadata(book);
        break;
      case 'tiktok':
        metadata = prepareTikTokMetadata(book);
        break;
      case 'instagram':
        metadata = prepareInstagramMetadata(book);
        break;
      case 'x':
        metadata = prepareXMetadata(book);
        break;
      default:
        metadata = book.metadata;
    }

    // Log the publish action
    logPublishAction(platform, book, assets, metadata);

    // Store results
    results.platforms[platform] = {
      assets,
      metadata,
      ready: Object.values(assets).every(a => a && a.status !== 'needs_generation')
    };
  }

  // Summary
  console.log(`\n${'='.repeat(60)}`);
  console.log('SUMMARY');
  console.log('='.repeat(60));

  let allReady = true;
  const actionsNeeded = [];

  Object.entries(results.platforms).forEach(([platform, result]) => {
    const status = result.ready ? 'READY' : 'NEEDS WORK';
    console.log(`  ${CONFIG.platforms[platform].name}: ${status}`);

    if (!result.ready) {
      allReady = false;
      Object.entries(result.assets).forEach(([format, asset]) => {
        if (asset && asset.status === 'needs_generation') {
          actionsNeeded.push(asset.action);
        }
      });
    }
  });

  if (!allReady) {
    console.log('\n  ACTIONS NEEDED BEFORE PUBLISHING:');
    [...new Set(actionsNeeded)].forEach((action, i) => {
      console.log(`    ${i + 1}. ${action}`);
    });
  }

  // Save manifest
  const manifestPath = join(CONFIG.outputDir, book.id, 'publish-manifest.json');
  mkdirSync(dirname(manifestPath), { recursive: true });
  writeFileSync(manifestPath, JSON.stringify(results, null, 2));
  console.log(`\n  Manifest saved: ${manifestPath}`);

  console.log(`\n${'='.repeat(60)}\n`);

  return results;
}

// ═══════════════════════════════════════════════════════════
// CLI
// ═══════════════════════════════════════════════════════════

async function main() {
  const args = process.argv.slice(2);

  if (args.includes('--help') || args.length === 0) {
    console.log(`
ONDE ONE-CLICK PUBLISHING PIPELINE

Orchestrates multi-platform publishing from a single command.

Usage:
  node publish-all.js --book <book-id>
  node publish-all.js --book <book-id> --platforms kdp,youtube
  node publish-all.js --manifest <path/to/manifest.json>
  node publish-all.js --list-platforms

Options:
  --book        Book ID (folder name in books/)
  --platforms   Comma-separated list of platforms (default: all)
  --manifest    Use existing manifest file
  --verbose     Show debug output
  --list-platforms  Show available platforms

Platforms:
  kdp       - Kindle Direct Publishing (ePub, PDF)
  spotify   - Spotify Podcast (MP3)
  youtube   - YouTube (MP4 + thumbnail)
  tiktok    - TikTok (vertical MP4)
  instagram - Instagram (images, reels)
  x         - X/Twitter (text, image, video)

Examples:
  node publish-all.js --book piccole-rime
  node publish-all.js --book aiko-ai-children --platforms youtube,tiktok
  node publish-all.js --list-platforms
`);
    return;
  }

  if (args.includes('--list-platforms')) {
    console.log('\nAvailable Platforms:\n');
    Object.entries(CONFIG.platforms).forEach(([id, config]) => {
      console.log(`  ${id.padEnd(12)} - ${config.name}`);
      console.log(`               Formats: ${config.formats.join(', ')}`);
      console.log(`               Enabled: ${config.enabled ? 'Yes' : 'No'}`);
      console.log();
    });
    return;
  }

  if (args.includes('--verbose')) {
    currentLogLevel = LOG_LEVELS.DEBUG;
  }

  const getArg = (name) => {
    const idx = args.indexOf(name);
    return idx > -1 ? args[idx + 1] : null;
  };

  const bookId = getArg('--book');
  const platformsArg = getArg('--platforms');
  const manifestPath = getArg('--manifest');

  if (manifestPath) {
    // Use existing manifest
    if (!existsSync(manifestPath)) {
      console.error(`Manifest not found: ${manifestPath}`);
      process.exit(1);
    }

    const manifest = JSON.parse(readFileSync(manifestPath, 'utf-8'));
    console.log(`Using manifest for: ${manifest.book}`);
    await publishAll(manifest.book, Object.keys(manifest.platforms));
    return;
  }

  if (!bookId) {
    console.error('Error: --book is required');
    console.error('Run with --help for usage');
    process.exit(1);
  }

  const platforms = platformsArg ? platformsArg.split(',') : null;

  try {
    await publishAll(bookId, platforms);
  } catch (error) {
    console.error(`\nError: ${error.message}`);
    process.exit(1);
  }
}

// Export for use as module
export { publishAll, loadBook, CONFIG };

// Run if executed directly
main().catch(err => {
  console.error('Fatal error:', err.message);
  process.exit(1);
});
