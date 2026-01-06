#!/usr/bin/env npx ts-node

/**
 * ONDE STUDIO - Automated Children's Book Generator
 *
 * Genera automaticamente:
 * 1. Tutte le illustrazioni (DALL-E 3 o Stability AI)
 * 2. EPUB italiano
 * 3. EPUB inglese
 * 4. File pronti per Amazon KDP
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import epub from 'epub-gen-memory';

const BOOK_ID = 'salmo-23-bambini';
const CONTENT_DIR = path.join(__dirname, '..', 'content', 'books', BOOK_ID);
const ILLUSTRATIONS_DIR = path.join(CONTENT_DIR, 'illustrations');

// Prompts per le illustrazioni
const ILLUSTRATION_PROMPTS = [
  {
    name: 'cover',
    prompt: `Children's book cover illustration in warm watercolor style. A loving shepherd in a simple beige tunic holds a young lamb gently while fluffy white sheep gather around him in a beautiful green meadow. Diverse children of different ethnicities peek out from behind the sheep, all smiling with joy. Soft pastel flowers (pink, yellow, lavender) border the scene. Golden sunlight creates a heavenly glow. Large space at top for title text. Style: professional children's book cover, heartwarming, inviting, peaceful. Colors: soft greens, warm golds, sky blue, gentle pink. Award-winning illustration quality. No text in image.`,
    size: '1792x1024' as const, // Cover size
  },
  {
    name: 'chapter-01',
    prompt: `A heartwarming children's book illustration in soft watercolor style. A kind shepherd with warm brown eyes and a gentle smile stands in a lush green meadow during golden hour. He wears a simple beige tunic and holds a wooden staff. Around him, fluffy white sheep with sweet faces graze peacefully. In the foreground, diverse children of different ethnicities play happily among the sheep. Soft rolling hills in the background under a pastel blue sky. Style: award-winning children's book illustration, gentle watercolor, peaceful atmosphere.`,
    size: '1024x1024' as const,
  },
  {
    name: 'chapter-02',
    prompt: `Serene watercolor children's book illustration. A peaceful meadow scene with fluffy white sheep resting on soft green grass near a gentle, crystal-clear stream. The water sparkles in the sunlight. A large, friendly oak tree provides cool shade. Butterflies and small colorful flowers dot the scene. Diverse children lie contentedly on the grass, looking peaceful and happy. Warm afternoon golden light. Colors: fresh greens, clear blues, warm yellows. Style: gentle watercolor, comforting, abundant atmosphere.`,
    size: '1024x1024' as const,
  },
  {
    name: 'chapter-03',
    prompt: `Warm watercolor children's book illustration of a winding path through a beautiful landscape. A kind shepherd walks ahead on the path, looking back and gently beckoning. Behind him, fluffy white sheep follow trustingly in a happy line. The path winds through green hills dotted with colorful wildflowers. Diverse children walk on the path holding hands, looking happy and confident. Soft morning light, pastel colors. Style: gentle watercolor, encouraging, hopeful.`,
    size: '1024x1024' as const,
  },
  {
    name: 'chapter-04',
    prompt: `Tender watercolor children's book illustration showing contrast between worry and comfort. Soft grey clouds on one side, but warm golden light surrounds a protective shepherd in the center. Fluffy white sheep are huddled close to him, looking calm and safe. Among the sheep, diverse children peek out with reassured expressions. The overall mood transitions from uncertainty to complete safety. Warm colors dominate. Style: gentle watercolor, protective, comforting.`,
    size: '1024x1024' as const,
  },
  {
    name: 'chapter-05',
    prompt: `Joyful watercolor children's book illustration of a beautiful outdoor feast. A long wooden table set in a sunny garden, covered with a cheerful tablecloth. The table overflows with colorful foods: bowls of bright fruits, fresh golden bread, colorful treats. Diverse children sit around the table, smiling with delight. One child's golden cup is overflowing. Flowers, butterflies, and birds surround the scene. Warm golden afternoon light. Style: celebratory watercolor, abundant, joyful.`,
    size: '1024x1024' as const,
  },
  {
    name: 'chapter-06',
    prompt: `Magical watercolor children's book illustration of a heavenly destination. A beautiful, softly glowing garden in the distance, surrounded by warm golden light and gentle clouds. A luminous path leads toward it through a flowered meadow. The kind shepherd walks with diverse happy children toward this beautiful place. Some children hold hands, some skip with joy. Fluffy sheep follow happily. Luminous colors: soft golds, gentle pinks, heavenly light blues. Style: magical watercolor, hopeful, perfect happy ending.`,
    size: '1024x1024' as const,
  },
];

/**
 * Generate image using OpenAI DALL-E 3
 */
async function generateWithDallE(prompt: string, size: string): Promise<Buffer> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OPENAI_API_KEY not set');

  const response = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'dall-e-3',
      prompt,
      n: 1,
      size,
      quality: 'hd',
      response_format: 'b64_json',
    }),
  });

  if (!response.ok) {
    const error = await response.json() as { error?: { message?: string } };
    throw new Error(`DALL-E error: ${error.error?.message}`);
  }

  const data = await response.json() as { data: Array<{ b64_json: string }> };
  return Buffer.from(data.data[0].b64_json, 'base64');
}

/**
 * Generate image using Stability AI
 */
async function generateWithStability(prompt: string): Promise<Buffer> {
  const apiKey = process.env.STABILITY_API_KEY;
  if (!apiKey) throw new Error('STABILITY_API_KEY not set');

  const response = await fetch('https://api.stability.ai/v2beta/stable-image/generate/core', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Accept': 'image/*',
    },
    body: (() => {
      const formData = new FormData();
      formData.append('prompt', prompt);
      formData.append('output_format', 'png');
      return formData;
    })(),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Stability AI error: ${error}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

/**
 * Generate image using xAI Grok
 */
async function generateWithGrok(prompt: string): Promise<Buffer> {
  const apiKey = process.env.XAI_API_KEY;
  if (!apiKey) throw new Error('XAI_API_KEY not set');

  const response = await fetch('https://api.x.ai/v1/images/generations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'grok-2-image-1212',
      prompt,
      n: 1,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Grok API error response:', errorText);
    throw new Error(`Grok error (${response.status}): ${errorText}`);
  }

  const data = await response.json() as { data: Array<{ url: string }> };
  const imageUrl = data.data[0].url;

  // Download image
  const imageResponse = await fetch(imageUrl);
  const arrayBuffer = await imageResponse.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

/**
 * Generate all illustrations
 */
async function generateAllIllustrations() {
  console.log('🎨 Generating illustrations...\n');

  // Ensure directory exists
  await fs.mkdir(ILLUSTRATIONS_DIR, { recursive: true });

  // Check available APIs
  const hasGrok = !!process.env.XAI_API_KEY;
  const hasOpenAI = !!process.env.OPENAI_API_KEY;
  const hasStability = !!process.env.STABILITY_API_KEY;

  if (!hasGrok && !hasOpenAI && !hasStability) {
    console.warn('⚠️  No image API key found - skipping image generation');
    console.log('\nTo generate images, add ONE of these to your .env.local:');
    console.log('  XAI_API_KEY=xai-...       (Grok - requires credits)');
    console.log('  OPENAI_API_KEY=sk-...     (DALL-E 3 - ~$0.04/image)');
    console.log('  STABILITY_API_KEY=sk-...  (Stability AI - ~$0.03/image, 25 FREE credits!)');
    console.log('\n💡 Tip: Stability AI gives 25 free credits = ~8 free images!');
    console.log('   Get key at: https://platform.stability.ai/account/keys\n');
    return; // Skip image generation but continue with EPUB
  }

  // Allow forcing a specific provider via env var
  const forceProvider = process.env.IMAGE_PROVIDER;

  // Determine which provider to use
  let provider: 'grok' | 'openai' | 'stability';
  if (forceProvider === 'stability' && hasStability) {
    provider = 'stability';
  } else if (forceProvider === 'openai' && hasOpenAI) {
    provider = 'openai';
  } else if (forceProvider === 'grok' && hasGrok) {
    provider = 'grok';
  } else if (hasGrok) {
    provider = 'grok';
  } else if (hasOpenAI) {
    provider = 'openai';
  } else {
    provider = 'stability';
  }

  const providerNames = { grok: 'Grok', openai: 'DALL-E 3', stability: 'Stability AI' };
  console.log(`Using: ${providerNames[provider]}\n`);

  for (let i = 0; i < ILLUSTRATION_PROMPTS.length; i++) {
    const { name, prompt, size } = ILLUSTRATION_PROMPTS[i];
    const outputPath = path.join(ILLUSTRATIONS_DIR, `${name}.png`);

    // Check if already exists
    try {
      await fs.access(outputPath);
      console.log(`✅ ${name}.png (already exists)`);
      continue;
    } catch {
      // File doesn't exist, generate it
    }

    console.log(`⏳ Generating ${name}...`);

    try {
      let imageBuffer: Buffer;

      if (provider === 'grok') {
        imageBuffer = await generateWithGrok(prompt);
      } else if (provider === 'openai') {
        imageBuffer = await generateWithDallE(prompt, size);
      } else {
        imageBuffer = await generateWithStability(prompt);
      }

      await fs.writeFile(outputPath, imageBuffer);
      console.log(`✅ ${name}.png saved!`);

      // Small delay to avoid rate limits
      if (i < ILLUSTRATION_PROMPTS.length - 1) {
        await new Promise(r => setTimeout(r, 2000));
      }
    } catch (error: any) {
      console.error(`❌ Failed to generate ${name}: ${error.message}`);
    }
  }

  console.log('\n🎨 Illustrations complete!\n');
}

interface ChapterContent {
  title: string;
  content: string;
  illustration?: string;
}

/**
 * Extract Italian or English content from markdown
 */
function extractContent(markdown: string, lang: 'it' | 'en'): string {
  if (lang === 'it') {
    const match = markdown.match(/## Testo per bambini \(IT\)\s*\n([\s\S]*?)(?=\n---|\n## Text for children)/);
    return match ? match[1].trim() : '';
  } else {
    const match = markdown.match(/## Text for children \(EN\)\s*\n([\s\S]*?)(?=\n---|\n## Illustrazione|$)/);
    return match ? match[1].trim() : '';
  }
}

/**
 * Convert markdown to simple HTML
 */
function mdToHtml(md: string): string {
  return md
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/^> (.*?)$/gm, '<blockquote>$1</blockquote>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/^(.+)$/gm, (match) => {
      if (match.startsWith('<')) return match;
      return match;
    });
}

/**
 * Generate EPUB for a specific language
 */
async function generateEPUBForLanguage(lang: 'it' | 'en') {

  const metadataJson = await fs.readFile(path.join(CONTENT_DIR, 'metadata.json'), 'utf-8');
  const metadata = JSON.parse(metadataJson);

  const title = lang === 'it' ? metadata.title : metadata.titleEn;
  const subtitle = lang === 'it' ? metadata.subtitle : metadata.subtitleEn;

  // Read intro
  const introMd = await fs.readFile(path.join(CONTENT_DIR, 'intro.md'), 'utf-8');
  const introSection = lang === 'it'
    ? introMd.match(/## Per i genitori\s*\n([\s\S]*?)(?=\n---)/)?.[1] || ''
    : introMd.match(/## For Parents\s*\n([\s\S]*?)$/)?.[1] || '';

  // Read chapters
  const chapters: Array<{ title: string; content: string }> = [];

  // Add intro
  chapters.push({
    title: lang === 'it' ? 'Per i Genitori' : 'For Parents',
    content: `<p>${mdToHtml(introSection.trim())}</p>`
  });

  // Add each chapter
  const chapterFiles = [
    '01-il-signore-e-il-mio-pastore.md',
    '02-non-mi-manca-nulla.md',
    '03-mi-guida-sulla-strada-giusta.md',
    '04-non-ho-paura.md',
    '05-una-tavola-piena.md',
    '06-per-sempre-con-dio.md',
  ];

  const chapterTitles = {
    it: [
      'Il Signore è il mio pastore',
      'Non mi manca nulla',
      'Mi guida sulla strada giusta',
      'Non ho paura',
      'Una tavola piena di cose buone',
      'Per sempre con Dio'
    ],
    en: [
      'The Lord is my shepherd',
      'I have everything I need',
      'He guides me on the right path',
      'I am not afraid',
      'A table full of good things',
      'Forever with God'
    ]
  };

  const illustrationFiles = [
    'chapter-01.png',
    'chapter-02.png',
    'chapter-03.png',
    'chapter-04.png',
    'chapter-05.png',
    'chapter-06.png',
  ];

  for (let i = 0; i < chapterFiles.length; i++) {
    const chapterPath = path.join(CONTENT_DIR, 'chapters', chapterFiles[i]);
    const chapterMd = await fs.readFile(chapterPath, 'utf-8');
    const chapterContent = extractContent(chapterMd, lang);

    // Check if illustration exists
    const illustrationPath = path.join(ILLUSTRATIONS_DIR, illustrationFiles[i]);
    let illustrationHtml = '';
    try {
      await fs.access(illustrationPath);
      const imgData = await fs.readFile(illustrationPath);
      const base64 = imgData.toString('base64');
      illustrationHtml = `<img src="data:image/png;base64,${base64}" style="max-width:100%;height:auto;display:block;margin:20px auto;" />`;
    } catch {
      // No illustration available
    }

    chapters.push({
      title: chapterTitles[lang][i],
      content: `${illustrationHtml}<div style="font-size:1.2em;line-height:1.6;">${mdToHtml(chapterContent)}</div>`
    });
  }

  // Generate EPUB
  const epubOptions: any = {
    title: `${title} - ${subtitle}`,
    author: metadata.author,
    publisher: 'Onde',
    lang: lang === 'it' ? 'it' : 'en',
    tocTitle: lang === 'it' ? 'Indice' : 'Contents',
  };

  // Check for cover
  const coverPath = path.join(ILLUSTRATIONS_DIR, 'cover.png');
  try {
    await fs.access(coverPath);
    epubOptions.cover = coverPath;
  } catch {
    // No cover available
  }

  const epubBuffer = await epub(epubOptions, chapters);

  const outputPath = path.join(CONTENT_DIR, `salmo-23-bambini-${lang}.epub`);
  await fs.writeFile(outputPath, epubBuffer);
  console.log(`✅ ${lang.toUpperCase()} EPUB: ${outputPath}`);
}

/**
 * Generate EPUBs for both languages
 */
async function generateEPUB() {
  console.log('📚 Generating EPUB files...\n');

  try {
    await generateEPUBForLanguage('it');
    await generateEPUBForLanguage('en');
    console.log('\n📚 EPUB generation complete!\n');
  } catch (error: any) {
    console.error(`❌ EPUB generation failed: ${error.message}`);
    console.log('   Make sure epub-gen-memory is installed: npm install epub-gen-memory');
  }
}

/**
 * Main execution
 */
async function main() {
  console.log('╔════════════════════════════════════════╗');
  console.log('║     ONDE STUDIO - Book Generator       ║');
  console.log('║     Il Salmo 23 per Bambini            ║');
  console.log('╚════════════════════════════════════════╝\n');

  // Step 1: Generate illustrations
  await generateAllIllustrations();

  // Step 2: Generate EPUB
  await generateEPUB();

  console.log('✅ Book generation complete!');
  console.log(`\n📁 Output: ${CONTENT_DIR}`);
}

main().catch(console.error);
