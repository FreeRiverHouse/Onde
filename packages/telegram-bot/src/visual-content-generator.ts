#!/usr/bin/env npx ts-node
/**
 * Visual Content Generator
 *
 * Generates Grok prompts for images and videos based on post content.
 * Outputs ready-to-use prompts for x.com/i/grok
 */

import * as fs from 'fs';
import * as path from 'path';

const VISUAL_SYSTEM_FILE = path.join(__dirname, '../data/visual-content-system.json');
const CONTENT_QUEUE_FILE = path.join(__dirname, '../data/content-queue.json');
const OUTPUT_DIR = path.join(__dirname, '../output');

interface VisualSystem {
  grokPrompts: {
    quoteCards: Record<string, { style: string; variations: string[] }>;
    behindTheScenes: Record<string, string[]>;
    reflections: Record<string, string[]>;
    techProgress: Record<string, string[]>;
  };
  grokVideoPrompts: {
    stoicQuotes: Array<{ description: string; prompt: string; duration: string }>;
    behindTheScenes: Array<{ description: string; prompt: string; duration: string }>;
    techProgress: Array<{ description: string; prompt: string; duration: string }>;
  };
  existingImages: Record<string, Record<string, string[]>>;
}

interface ContentItem {
  id: string;
  text: string;
  account: 'onde' | 'frh';
  type: string;
  status: 'queued' | 'posted' | 'skipped';
  metadata?: { author?: string };
}

interface ContentQueue {
  onde: ContentItem[];
  frh: ContentItem[];
}

function loadVisualSystem(): VisualSystem {
  return JSON.parse(fs.readFileSync(VISUAL_SYSTEM_FILE, 'utf-8'));
}

function loadContentQueue(): ContentQueue {
  return JSON.parse(fs.readFileSync(CONTENT_QUEUE_FILE, 'utf-8'));
}

function getImagePromptForPost(post: ContentItem, visual: VisualSystem): string {
  if (post.account === 'onde') {
    if (post.type === 'citazione') {
      const author = post.metadata?.author?.toLowerCase() || '';
      if (author.includes('marcus') || author.includes('aurelius')) {
        const prompts = visual.grokPrompts.quoteCards.marcus_aurelius;
        return prompts.variations[Math.floor(Math.random() * prompts.variations.length)];
      } else if (author.includes('seneca')) {
        const prompts = visual.grokPrompts.quoteCards.seneca;
        return prompts.variations[Math.floor(Math.random() * prompts.variations.length)];
      } else if (author.includes('epictetus')) {
        const prompts = visual.grokPrompts.quoteCards.epictetus;
        return prompts.variations[Math.floor(Math.random() * prompts.variations.length)];
      }
      return visual.grokPrompts.quoteCards.marcus_aurelius.style;
    } else if (post.type === 'dietro_le_quinte') {
      const prompts = visual.grokPrompts.behindTheScenes.publishing_house;
      return prompts[Math.floor(Math.random() * prompts.length)];
    } else if (post.type === 'riflessione') {
      const prompts = visual.grokPrompts.reflections.about_books;
      return prompts[Math.floor(Math.random() * prompts.length)];
    }
  } else if (post.account === 'frh') {
    if (post.type === 'progress' || post.type === 'tool') {
      const prompts = visual.grokPrompts.techProgress.building_in_public;
      return prompts[Math.floor(Math.random() * prompts.length)];
    } else if (post.type === 'lesson') {
      const prompts = visual.grokPrompts.techProgress.lessons_learned;
      return prompts[Math.floor(Math.random() * prompts.length)];
    }
  }
  return '';
}

function getVideoPromptForPost(post: ContentItem, visual: VisualSystem): { description: string; prompt: string } | null {
  if (post.account === 'onde') {
    if (post.type === 'citazione') {
      const videos = visual.grokVideoPrompts.stoicQuotes;
      return videos[Math.floor(Math.random() * videos.length)];
    } else if (post.type === 'dietro_le_quinte' || post.type === 'riflessione') {
      const videos = visual.grokVideoPrompts.behindTheScenes;
      return videos[Math.floor(Math.random() * videos.length)];
    }
  } else if (post.account === 'frh') {
    const videos = visual.grokVideoPrompts.techProgress;
    return videos[Math.floor(Math.random() * videos.length)];
  }
  return null;
}

function getExistingImageForPost(post: ContentItem, visual: VisualSystem): string | null {
  if (post.account === 'onde') {
    if (post.type === 'citazione') {
      const images = visual.existingImages.stoic_quotes?.marcus_aurelius || [];
      if (images.length > 0) {
        return images[Math.floor(Math.random() * images.length)];
      }
    } else if (post.type === 'dietro_le_quinte') {
      const portraits = visual.existingImages.behind_the_scenes?.author_portraits || [];
      const art = visual.existingImages.behind_the_scenes?.character_art || [];
      const all = [...portraits, ...art];
      if (all.length > 0) {
        return all[Math.floor(Math.random() * all.length)];
      }
    } else if (post.type === 'riflessione') {
      const aiko = visual.existingImages.childrens_books?.aiko || [];
      const rime = visual.existingImages.childrens_books?.piccole_rime || [];
      const all = [...aiko, ...rime];
      if (all.length > 0) {
        return all[Math.floor(Math.random() * all.length)];
      }
    }
  }
  return null;
}

function generateVisualGuide(): string {
  const visual = loadVisualSystem();
  const queue = loadContentQueue();

  let output = `# Visual Content Guide
Generated: ${new Date().toLocaleString()}

## Overview
This guide provides Grok prompts for each scheduled post.
Use x.com/i/grok to generate images and videos.

---

`;

  // Onde posts
  output += `# ONDE POSTS (@Onde_FRH)\n\n`;

  const ondeQueued = queue.onde.filter(p => p.status === 'queued');
  ondeQueued.forEach((post, i) => {
    const existingImage = getExistingImageForPost(post, visual);
    const imagePrompt = getImagePromptForPost(post, visual);
    const videoPrompt = getVideoPromptForPost(post, visual);

    output += `## Post ${i + 1}: ${post.type.toUpperCase()}\n\n`;
    output += `**Text Preview:**\n> ${post.text.substring(0, 150)}...\n\n`;

    if (existingImage) {
      output += `**Existing Image:**\n\`${existingImage}\`\n\n`;
    }

    if (imagePrompt) {
      output += `**Grok Image Prompt:**\n\`\`\`\n${imagePrompt}\n\`\`\`\n\n`;
    }

    if (videoPrompt) {
      output += `**Grok Video Prompt (${videoPrompt.description}):**\n\`\`\`\n${videoPrompt.prompt}\n\`\`\`\n\n`;
    }

    output += `---\n\n`;
  });

  // FRH posts
  output += `\n# FRH POSTS (@FreeRiverHouse)\n\n`;

  const frhQueued = queue.frh.filter(p => p.status === 'queued');
  frhQueued.forEach((post, i) => {
    const imagePrompt = getImagePromptForPost(post, visual);
    const videoPrompt = getVideoPromptForPost(post, visual);

    output += `## Post ${i + 1}: ${post.type.toUpperCase()}\n\n`;
    output += `**Text Preview:**\n> ${post.text.substring(0, 150)}...\n\n`;

    if (imagePrompt) {
      output += `**Grok Image Prompt:**\n\`\`\`\n${imagePrompt}\n\`\`\`\n\n`;
    }

    if (videoPrompt) {
      output += `**Grok Video Prompt (${videoPrompt.description}):**\n\`\`\`\n${videoPrompt.prompt}\n\`\`\`\n\n`;
    }

    output += `---\n\n`;
  });

  return output;
}

function generateQuickPrompts(): string {
  const visual = loadVisualSystem();

  let output = `# Quick Grok Prompts
Copy-paste ready prompts for x.com/i/grok

---

## STOIC QUOTE CARDS

### Marcus Aurelius
\`\`\`
${visual.grokPrompts.quoteCards.marcus_aurelius.variations[0]}
\`\`\`

### Seneca
\`\`\`
${visual.grokPrompts.quoteCards.seneca.variations[0]}
\`\`\`

### Epictetus
\`\`\`
${visual.grokPrompts.quoteCards.epictetus.variations[0]}
\`\`\`

---

## BEHIND THE SCENES

### Publishing House
\`\`\`
${visual.grokPrompts.behindTheScenes.publishing_house[0]}
\`\`\`

### Illustration Studio
\`\`\`
${visual.grokPrompts.behindTheScenes.illustration_studio[0]}
\`\`\`

---

## TECH / BUILDING IN PUBLIC

### Coding Vibes
\`\`\`
${visual.grokPrompts.techProgress.building_in_public[0]}
\`\`\`

### Automation
\`\`\`
${visual.grokPrompts.techProgress.building_in_public[2]}
\`\`\`

---

## VIDEOS

### Stoic Night Writing
\`\`\`
${visual.grokVideoPrompts.stoicQuotes[0].prompt}
\`\`\`

### Publishing House Morning
\`\`\`
${visual.grokVideoPrompts.behindTheScenes[0].prompt}
\`\`\`

### Illustration Coming to Life
\`\`\`
${visual.grokVideoPrompts.behindTheScenes[1].prompt}
\`\`\`

### Code Becoming Poetry
\`\`\`
${visual.grokVideoPrompts.techProgress[0].prompt}
\`\`\`

`;

  return output;
}

// Main
if (require.main === module) {
  const args = process.argv.slice(2);

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  if (args[0] === 'guide') {
    const guide = generateVisualGuide();
    const outputPath = path.join(OUTPUT_DIR, 'visual-content-guide.md');
    fs.writeFileSync(outputPath, guide);
    console.log(`✅ Visual guide generated: ${outputPath}`);
  } else if (args[0] === 'prompts') {
    const prompts = generateQuickPrompts();
    const outputPath = path.join(OUTPUT_DIR, 'quick-grok-prompts.md');
    fs.writeFileSync(outputPath, prompts);
    console.log(`✅ Quick prompts generated: ${outputPath}`);
  } else {
    console.log(`
Visual Content Generator

Commands:
  guide   - Generate full visual guide for all posts
  prompts - Generate quick copy-paste Grok prompts

Examples:
  npx ts-node visual-content-generator.ts guide
  npx ts-node visual-content-generator.ts prompts
`);
  }
}

export { generateVisualGuide, generateQuickPrompts, getImagePromptForPost, getVideoPromptForPost };
