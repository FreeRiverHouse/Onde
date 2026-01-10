#!/usr/bin/env node
/**
 * Cross-Pollination Engine
 *
 * UN LIBRO = TUTTO:
 * - ebook (già esiste)
 * - audiobook (ElevenLabs)
 * - podcast episode
 * - 5 video brevi (TikTok/Shorts)
 * - 1 video lungo (YouTube)
 * - 10 post social (X, IG, etc.)
 * - cartone personaggi
 * - musica tema
 *
 * Usage: node pollinate.js --book <book-path>
 */

const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  outputDir: '/Users/mattia/Projects/Onde/content/pollinated',
  elevenLabsKey: process.env.ELEVENLABS_API_KEY,
  telegramChatId: '7505631979',
  telegramBotToken: process.env.TELEGRAM_BOT_TOKEN
};

// Parse command line arguments
const args = process.argv.slice(2);
const bookPath = args.find((arg, i) => args[i - 1] === '--book') || args[0];

if (!bookPath) {
  console.log(`
Usage: node pollinate.js --book <book-path>

Example: node pollinate.js --book books/tech/aiko/

This will generate all derivative content from a single book.
  `);
  process.exit(1);
}

// Main orchestrator
async function pollinate(bookPath) {
  console.log(`\n🌊 Cross-Pollination Engine Starting...`);
  console.log(`📚 Source: ${bookPath}\n`);

  // 1. Load book metadata
  const book = await loadBook(bookPath);
  if (!book) {
    console.error('❌ Could not load book');
    process.exit(1);
  }

  console.log(`📖 Title: ${book.title}`);
  console.log(`👤 Author: ${book.author}`);
  console.log(`📝 Chapters: ${book.chapters?.length || 0}\n`);

  // Create output directory
  const outputPath = path.join(CONFIG.outputDir, book.slug);
  fs.mkdirSync(outputPath, { recursive: true });

  // 2. Generate all derivative content
  const results = {
    audiobook: null,
    podcast: null,
    videoShorts: [],
    videoLong: null,
    socialPosts: [],
    characterArt: null,
    themeMusic: null
  };

  // Track what to generate
  const tasks = [
    { name: 'Audiobook', fn: () => generateAudiobook(book, outputPath) },
    { name: 'Podcast Episode', fn: () => generatePodcastEpisode(book, outputPath) },
    { name: 'Video Shorts (5)', fn: () => generateVideoShorts(book, outputPath) },
    { name: 'Video Long', fn: () => generateVideoLong(book, outputPath) },
    { name: 'Social Posts (10)', fn: () => generateSocialPosts(book, outputPath) },
    { name: 'Character Art', fn: () => generateCharacterArt(book, outputPath) },
    { name: 'Theme Music', fn: () => generateThemeMusic(book, outputPath) }
  ];

  // Execute tasks
  for (const task of tasks) {
    console.log(`⏳ Generating: ${task.name}...`);
    try {
      const result = await task.fn();
      console.log(`✅ ${task.name}: Done`);
    } catch (err) {
      console.log(`⚠️ ${task.name}: Skipped (${err.message})`);
    }
  }

  // 3. Generate manifest
  const manifest = {
    book: book.title,
    generatedAt: new Date().toISOString(),
    outputs: results,
    path: outputPath
  };

  fs.writeFileSync(
    path.join(outputPath, 'manifest.json'),
    JSON.stringify(manifest, null, 2)
  );

  console.log(`\n🎉 Cross-Pollination Complete!`);
  console.log(`📁 Output: ${outputPath}`);
  console.log(`📋 Manifest: ${path.join(outputPath, 'manifest.json')}\n`);

  return manifest;
}

// Load book from path
async function loadBook(bookPath) {
  const fullPath = path.resolve(bookPath);

  // Try to find book metadata
  const metadataFiles = ['metadata.json', 'book.json', 'config.json'];
  let metadata = null;

  for (const file of metadataFiles) {
    const filePath = path.join(fullPath, file);
    if (fs.existsSync(filePath)) {
      metadata = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      break;
    }
  }

  // Try to find chapters
  const chapters = [];
  const chaptersDir = path.join(fullPath, 'chapters');
  if (fs.existsSync(chaptersDir)) {
    const files = fs.readdirSync(chaptersDir).filter(f => f.endsWith('.md'));
    for (const file of files.sort()) {
      const content = fs.readFileSync(path.join(chaptersDir, file), 'utf8');
      chapters.push({ file, content });
    }
  }

  // Fallback: read any .md file
  if (chapters.length === 0) {
    const mdFiles = fs.readdirSync(fullPath).filter(f => f.endsWith('.md'));
    for (const file of mdFiles) {
      const content = fs.readFileSync(path.join(fullPath, file), 'utf8');
      chapters.push({ file, content });
    }
  }

  return {
    title: metadata?.title || path.basename(fullPath),
    author: metadata?.author || 'Onde Publishing',
    slug: metadata?.slug || path.basename(fullPath).toLowerCase().replace(/\s+/g, '-'),
    chapters,
    metadata,
    path: fullPath
  };
}

// Generate audiobook (requires ElevenLabs API)
async function generateAudiobook(book, outputPath) {
  // Placeholder - would use ElevenLabs API
  const script = book.chapters.map(c => c.content).join('\n\n');
  fs.writeFileSync(path.join(outputPath, 'audiobook-script.txt'), script);
  return { status: 'script-ready', file: 'audiobook-script.txt' };
}

// Generate podcast episode
async function generatePodcastEpisode(book, outputPath) {
  // Create podcast episode format
  const intro = `Welcome to Onde Stories. Today we're reading: ${book.title}`;
  const content = book.chapters.map(c => c.content).join('\n\n');
  const outro = `Thank you for listening to Onde Stories. Subscribe for more bedtime stories.`;

  const podcastScript = `${intro}\n\n${content}\n\n${outro}`;
  fs.writeFileSync(path.join(outputPath, 'podcast-episode.txt'), podcastScript);
  return { status: 'script-ready', file: 'podcast-episode.txt' };
}

// Generate 5 short videos (for TikTok/Shorts)
async function generateVideoShorts(book, outputPath) {
  const shorts = [];
  const chapters = book.chapters.slice(0, 5); // First 5 chapters

  for (let i = 0; i < chapters.length; i++) {
    const chapter = chapters[i];
    // Extract first 100 words for short video
    const words = chapter.content.split(/\s+/).slice(0, 100).join(' ');
    const shortScript = {
      title: `${book.title} - Part ${i + 1}`,
      script: words,
      duration: '30-60 seconds',
      format: '9:16 vertical'
    };
    shorts.push(shortScript);
  }

  fs.writeFileSync(
    path.join(outputPath, 'video-shorts.json'),
    JSON.stringify(shorts, null, 2)
  );
  return { status: 'scripts-ready', count: shorts.length, file: 'video-shorts.json' };
}

// Generate 1 long video (for YouTube)
async function generateVideoLong(book, outputPath) {
  const videoScript = {
    title: book.title,
    author: book.author,
    chapters: book.chapters.map((c, i) => ({
      number: i + 1,
      content: c.content
    })),
    estimatedDuration: `${book.chapters.length * 2} minutes`,
    format: '16:9 horizontal'
  };

  fs.writeFileSync(
    path.join(outputPath, 'video-long.json'),
    JSON.stringify(videoScript, null, 2)
  );
  return { status: 'script-ready', file: 'video-long.json' };
}

// Generate 10 social media posts
async function generateSocialPosts(book, outputPath) {
  const posts = [];

  // Post types
  const templates = [
    { type: 'announcement', template: `New book: "${book.title}" by ${book.author} is now available!` },
    { type: 'quote', template: null }, // Extract from chapters
    { type: 'behind-scenes', template: `The inspiration behind "${book.title}"...` },
    { type: 'character', template: `Meet the characters of "${book.title}"` },
    { type: 'educational', template: `What kids learn from "${book.title}"` },
  ];

  // Generate 10 posts
  for (let i = 0; i < 10; i++) {
    const template = templates[i % templates.length];
    let content = template.template;

    // Extract quotes from chapters
    if (template.type === 'quote' && book.chapters[i % book.chapters.length]) {
      const chapter = book.chapters[i % book.chapters.length];
      const sentences = chapter.content.split(/[.!?]+/).filter(s => s.trim().length > 20);
      content = sentences[0]?.trim() || `A moment from "${book.title}"`;
    }

    posts.push({
      id: i + 1,
      type: template.type,
      content: content,
      hashtags: [], // No hashtags per Onde rules
      platforms: ['x', 'instagram', 'facebook']
    });
  }

  fs.writeFileSync(
    path.join(outputPath, 'social-posts.json'),
    JSON.stringify(posts, null, 2)
  );
  return { status: 'ready', count: posts.length, file: 'social-posts.json' };
}

// Generate character art prompts
async function generateCharacterArt(book, outputPath) {
  // Extract character names from content (basic extraction)
  const allContent = book.chapters.map(c => c.content).join(' ');

  // Look for capitalized names (simple heuristic)
  const namePattern = /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\b/g;
  const names = [...new Set(allContent.match(namePattern) || [])].slice(0, 5);

  const prompts = names.map(name => ({
    character: name,
    prompt: `Children's book illustration in painterly watercolor style, ${name} character, European storybook aesthetic, warm golden light, natural complexion without rosy cheeks, NOT Pixar NOT 3D NOT cartoon, 4k`
  }));

  fs.writeFileSync(
    path.join(outputPath, 'character-prompts.json'),
    JSON.stringify(prompts, null, 2)
  );
  return { status: 'prompts-ready', characters: names, file: 'character-prompts.json' };
}

// Generate theme music prompt
async function generateThemeMusic(book, outputPath) {
  const musicPrompt = {
    title: `${book.title} Theme`,
    style: 'Gentle lullaby, Italian watercolor feeling, soft piano and strings',
    mood: 'Warm, comforting, magical but not overwhelming',
    duration: '2-3 minutes',
    platform: 'Suno AI',
    prompt: `Gentle children's lullaby, soft piano melody, light strings, Italian folk influence, warm and comforting, bedtime story feeling, instrumental, ${book.title} theme`
  };

  fs.writeFileSync(
    path.join(outputPath, 'music-prompt.json'),
    JSON.stringify(musicPrompt, null, 2)
  );
  return { status: 'prompt-ready', file: 'music-prompt.json' };
}

// Run
pollinate(bookPath).catch(console.error);
