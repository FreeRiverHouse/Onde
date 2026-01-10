#!/usr/bin/env node
/**
 * Content Matrix Generator
 *
 * Genera automaticamente una matrice completa di contenuti derivati da un libro.
 *
 * Usage:
 *   node generate-matrix.js --book <book-path> [--output <output-path>]
 *   node generate-matrix.js --title "Titolo Libro" --author "Autore" --content <content-file>
 *
 * Outputs:
 *   - Audiobook specs
 *   - Podcast episode specs
 *   - YouTube Long video specs
 *   - 5 YouTube Shorts specs
 *   - 5 TikTok specs
 *   - 5 IG Reels specs
 *   - 10 Tweet specs
 *   - Spotify track specs
 *   - Cartone animato specs
 */

const fs = require('fs');
const path = require('path');

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const result = {};

  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith('--')) {
      const key = args[i].substring(2);
      result[key] = args[i + 1] || true;
      i++;
    }
  }

  return result;
}

// Load book from path or create from arguments
async function loadBook(args) {
  if (args.book) {
    return loadBookFromPath(args.book);
  } else if (args.title) {
    return {
      id: generateSlug(args.title),
      title: args.title,
      slug: generateSlug(args.title),
      author: args.author || 'Onde Publishing',
      content: args.content ? fs.readFileSync(args.content, 'utf8') : '',
      chapters: []
    };
  }

  throw new Error('Please provide --book <path> or --title "Title"');
}

// Load book from directory
function loadBookFromPath(bookPath) {
  const fullPath = path.resolve(bookPath);

  // Try to find metadata
  const metadataFiles = ['metadata.json', 'book.json', 'config.json'];
  let metadata = {};

  for (const file of metadataFiles) {
    const filePath = path.join(fullPath, file);
    if (fs.existsSync(filePath)) {
      metadata = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      break;
    }
  }

  // Load chapters
  const chapters = [];
  const chaptersDir = path.join(fullPath, 'chapters');

  if (fs.existsSync(chaptersDir)) {
    const files = fs.readdirSync(chaptersDir).filter(f => f.endsWith('.md'));
    for (const file of files.sort()) {
      const content = fs.readFileSync(path.join(chaptersDir, file), 'utf8');
      chapters.push({ file, content });
    }
  }

  // Fallback to any .md file
  if (chapters.length === 0) {
    const mdFiles = fs.readdirSync(fullPath).filter(f => f.endsWith('.md') && f !== 'README.md');
    for (const file of mdFiles) {
      const content = fs.readFileSync(path.join(fullPath, file), 'utf8');
      chapters.push({ file, content });
    }
  }

  // Get full content
  const fullContent = chapters.map(c => c.content).join('\n\n');

  return {
    id: metadata.id || generateSlug(metadata.title || path.basename(fullPath)),
    title: metadata.title || path.basename(fullPath),
    slug: metadata.slug || generateSlug(metadata.title || path.basename(fullPath)),
    author: metadata.author || 'Onde Publishing',
    illustrator: metadata.illustrator || 'Pina Pennello',
    narrator: metadata.narrator || 'Gianni Parola',
    language: metadata.language || 'it',
    target_age: metadata.target_age || '3-8',
    genre: metadata.genre || '',
    themes: metadata.themes || extractThemes(fullContent),
    characters: metadata.characters || extractCharacters(fullContent),
    synopsis: metadata.synopsis || generateSynopsis(fullContent),
    cover_image: findCoverImage(fullPath),
    chapters: chapters,
    content: fullContent,
    path: fullPath
  };
}

// Generate URL-safe slug
function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

// Extract potential themes from content
function extractThemes(content) {
  const themeKeywords = {
    'amicizia': ['amico', 'amici', 'amicizia', 'insieme'],
    'famiglia': ['mamma', 'papa', 'famiglia', 'fratello', 'sorella', 'nonno', 'nonna'],
    'natura': ['albero', 'fiore', 'animale', 'sole', 'luna', 'stelle', 'mare', 'montagna'],
    'avventura': ['viaggio', 'scoperta', 'esplora', 'avventura'],
    'crescita': ['impara', 'crescere', 'grande', 'cambia'],
    'tecnologia': ['robot', 'computer', 'tecnologia', 'intelligenza artificiale', 'AI'],
    'spiritualita': ['Dio', 'preghiera', 'anima', 'cuore', 'amore']
  };

  const themes = [];
  const lowerContent = content.toLowerCase();

  for (const [theme, keywords] of Object.entries(themeKeywords)) {
    if (keywords.some(kw => lowerContent.includes(kw))) {
      themes.push(theme);
    }
  }

  return themes.slice(0, 5);
}

// Extract character names from content
function extractCharacters(content) {
  const namePattern = /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\b/g;
  const matches = content.match(namePattern) || [];
  const filtered = matches.filter(name =>
    !['Il', 'La', 'Lo', 'Gli', 'Le', 'Un', 'Una', 'Uno', 'Chapter', 'Capitolo'].includes(name)
  );
  return [...new Set(filtered)].slice(0, 10);
}

// Generate synopsis from content
function generateSynopsis(content) {
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 20);
  return sentences.slice(0, 3).join('. ').trim() + '.';
}

// Find cover image in book directory
function findCoverImage(bookPath) {
  const coverPatterns = ['cover.jpg', 'cover.png', 'copertina.jpg', 'copertina.png', '00-cover.jpg'];
  const imagesDir = path.join(bookPath, 'images');

  for (const pattern of coverPatterns) {
    const directPath = path.join(bookPath, pattern);
    const imagesPath = path.join(imagesDir, pattern);

    if (fs.existsSync(directPath)) return directPath;
    if (fs.existsSync(imagesPath)) return imagesPath;
  }

  return '';
}

// Generate complete content matrix
function generateMatrix(book) {
  const now = new Date().toISOString();
  const estimatedReadingMinutes = Math.ceil(book.content.split(/\s+/).length / 150);

  return {
    "$schema": "content-matrix-schema.json",
    "version": "1.0.0",
    "description": `Content Matrix for "${book.title}"`,

    "book": {
      id: book.id,
      title: book.title,
      slug: book.slug,
      author: book.author,
      illustrator: book.illustrator,
      narrator: book.narrator,
      language: book.language,
      target_age: book.target_age,
      genre: book.genre,
      themes: book.themes,
      characters: book.characters,
      synopsis: book.synopsis,
      cover_image: book.cover_image,
      chapters: book.chapters.map((c, i) => ({
        number: i + 1,
        title: extractChapterTitle(c.content) || `Capitolo ${i + 1}`,
        word_count: c.content.split(/\s+/).length
      }))
    },

    "audiobook": generateAudiobookSpecs(book, estimatedReadingMinutes),
    "podcast": generatePodcastSpecs(book, estimatedReadingMinutes),
    "youtube_long": generateYouTubeLongSpecs(book, estimatedReadingMinutes),
    "youtube_shorts": generateYouTubeShortsSpecs(book),
    "tiktok": generateTikTokSpecs(book),
    "instagram_reels": generateInstagramReelsSpecs(book),
    "tweets": generateTweetSpecs(book),
    "spotify_track": generateSpotifySpecs(book),
    "cartoon": generateCartoonSpecs(book),

    "metadata": {
      created_at: now,
      updated_at: now,
      generated_by: "content-matrix-generator",
      version: "1.0.0",
      status: "draft",
      notes: ""
    },

    "generation_queue": {
      priority: 1,
      batch_id: `batch-${Date.now()}`,
      dependencies: [],
      estimated_time_hours: calculateEstimatedTime(book),
      assigned_worker: null
    }
  };
}

// Extract chapter title from content
function extractChapterTitle(content) {
  const lines = content.split('\n').filter(l => l.trim());
  const firstLine = lines[0] || '';

  if (firstLine.startsWith('#')) {
    return firstLine.replace(/^#+\s*/, '').trim();
  }

  return null;
}

// Generate audiobook specifications
function generateAudiobookSpecs(book, duration) {
  return {
    enabled: true,
    specs: {
      format: "m4b",
      bitrate: "128kbps",
      sample_rate: "44100Hz",
      channels: "stereo",
      voice_id: "gianni-parola-v1",
      voice_provider: "ElevenLabs",
      estimated_duration_minutes: duration,
      intro_music: "onde-audiobook-intro.mp3",
      outro_music: "onde-audiobook-outro.mp3",
      background_music: "soft-ambient-piano.mp3",
      background_volume: 0.15
    },
    chapters: book.chapters.map((c, i) => ({
      number: i + 1,
      title: extractChapterTitle(c.content) || `Capitolo ${i + 1}`,
      text: c.content,
      estimated_duration_seconds: Math.ceil(c.content.split(/\s+/).length / 2.5)
    })),
    output: {
      filename: `${book.slug}-audiobook.m4b`,
      path: "output/audiobooks/",
      cover: book.cover_image,
      metadata: {
        album: book.title,
        artist: book.narrator,
        album_artist: "Onde Publishing",
        genre: "Audiobook",
        year: 2026,
        copyright: "Onde Publishing 2026"
      }
    },
    distribution: {
      platforms: ["Audible", "Apple Books", "Spotify", "Google Play"],
      price_usd: 4.99,
      isbn: ""
    }
  };
}

// Generate podcast episode specifications
function generatePodcastSpecs(book, duration) {
  return {
    enabled: true,
    specs: {
      format: "mp3",
      bitrate: "192kbps",
      show_name: "Onde Stories - Storie della Buonanotte",
      episode_type: "full",
      intro_duration_seconds: 15,
      outro_duration_seconds: 10,
      host_voice_id: "gianni-parola-v1",
      jingle: "onde-podcast-jingle.mp3"
    },
    episode: {
      title: `${book.title} - Storia Completa`,
      number: 0,
      season: 1,
      description: `Ascolta la storia completa di "${book.title}" narrata da Gianni Parola. ${book.synopsis}`,
      script: {
        intro: `Benvenuti a Onde Stories, le storie della buonanotte. Sono Gianni Parola e oggi vi leggo: "${book.title}".`,
        content: book.content,
        outro: "Grazie per aver ascoltato Onde Stories. Se ti e' piaciuta questa storia, iscriviti per nuove avventure ogni settimana. Buonanotte, piccoli sognatori!"
      },
      tags: book.themes,
      explicit: false
    },
    output: {
      filename: `${book.slug}-podcast-episode.mp3`,
      path: "output/podcasts/",
      cover: book.cover_image
    },
    distribution: {
      platforms: ["Spotify", "Apple Podcasts", "Google Podcasts", "Amazon Music"],
      rss_feed: "https://onde.la/podcast/rss.xml"
    }
  };
}

// Generate YouTube Long video specifications
function generateYouTubeLongSpecs(book, duration) {
  return {
    enabled: true,
    specs: {
      format: "mp4",
      resolution: "1920x1080",
      aspect_ratio: "16:9",
      frame_rate: 30,
      codec: "h264",
      audio_codec: "aac",
      estimated_duration_minutes: duration,
      intro_video: "onde-youtube-intro.mp4",
      outro_video: "onde-youtube-outro.mp4"
    },
    video: {
      title: `${book.title} | Storia Completa per Bambini | Onde Stories`,
      description: generateYouTubeDescription(book),
      tags: [...book.themes, "storie per bambini", "favole", "buonanotte", "onde stories"],
      category: "Education",
      playlist: "Storie della Buonanotte",
      thumbnail_prompt: `Children's book thumbnail, "${book.title}", European watercolor style, warm golden light, magical atmosphere, text overlay with title, Beatrix Potter style, 4k`,
      scenes: book.chapters.map((c, i) => ({
        chapter: i + 1,
        description: extractChapterTitle(c.content) || `Scena ${i + 1}`,
        visual_prompt: generateScenePrompt(c.content, book),
        duration_seconds: Math.ceil(c.content.split(/\s+/).length / 2.5)
      })),
      background_style: "animated-illustrations",
      narrator_visible: false,
      subtitles: true,
      subtitles_languages: ["it", "en"]
    },
    output: {
      filename: `${book.slug}-youtube-long.mp4`,
      path: "output/youtube/long/",
      thumbnail: `${book.slug}-thumbnail.jpg`
    },
    distribution: {
      channel: "Onde Publishing",
      channel_id: "",
      visibility: "public",
      schedule: null,
      monetization: true,
      end_screen: true,
      cards: []
    }
  };
}

// Generate YouTube description
function generateYouTubeDescription(book) {
  return `${book.synopsis}

Benvenuti a Onde Stories! Storie della buonanotte per bambini e famiglie.

${book.title}
Scritto da: ${book.author}
Illustrato da: ${book.illustrator}
Narrato da: ${book.narrator}

Temi: ${book.themes.join(', ')}

Iscriviti per nuove storie ogni settimana!

#StoriePerBambini #Buonanotte #OndeStories #FavoleItaliane`;
}

// Generate scene visual prompt
function generateScenePrompt(content, book) {
  const words = content.split(/\s+/).slice(0, 20).join(' ');
  return `Children's book illustration, scene from "${book.title}", ${words}..., European watercolor style, Beatrix Potter meets Luzzati, warm golden light, natural colors, NOT Pixar NOT 3D, 4k`;
}

// Generate YouTube Shorts specifications
function generateYouTubeShortsSpecs(book) {
  const shorts = [];
  const shortConcepts = [
    { concept: 'opening-hook', hook: 'Come inizia questa storia...' },
    { concept: 'character-intro', hook: 'Ti presento...' },
    { concept: 'key-moment', hook: 'Il momento che cambio tutto...' },
    { concept: 'lesson', hook: 'Cosa ci insegna questa storia...' },
    { concept: 'ending-teaser', hook: 'Come finisce? Scoprilo...' }
  ];

  for (let i = 0; i < 5; i++) {
    const concept = shortConcepts[i];
    const chapter = book.chapters[i] || book.chapters[0];
    const excerpt = chapter ? chapter.content.split(/\s+/).slice(0, 50).join(' ') : '';

    shorts.push({
      id: i + 1,
      title: `${book.title} - ${concept.concept}`,
      hook: concept.hook,
      script: excerpt,
      scene_description: generateScenePrompt(excerpt, book),
      music_style: ['upbeat-children', 'gentle-lullaby', 'magical-whimsical', 'adventure', 'emotional'][i],
      text_overlay: concept.hook,
      call_to_action: [
        'Link al libro completo in bio!',
        'Iscriviti per altre storie!',
        "Qual e' la tua parte preferita?",
        'Condividi con un amico!',
        'Buonanotte!'
      ][i]
    });
  }

  return {
    enabled: true,
    count: 5,
    specs: {
      format: "mp4",
      resolution: "1080x1920",
      aspect_ratio: "9:16",
      frame_rate: 30,
      max_duration_seconds: 60,
      codec: "h264"
    },
    shorts: shorts,
    output: {
      path: "output/youtube/shorts/",
      naming_pattern: `${book.slug}-short-{id}.mp4`
    }
  };
}

// Generate TikTok specifications
function generateTikTokSpecs(book) {
  const videos = [];
  const tiktokConcepts = [
    { concept: 'story-teaser', hook: 'Una storia che devi conoscere...' },
    { concept: 'character-intro', hook: 'POV: Sei il protagonista di questa storia' },
    { concept: 'moral-lesson', hook: 'La lezione piu importante...' },
    { concept: 'behind-scenes', hook: 'Come nasce un libro illustrato...' },
    { concept: 'reading-moment', hook: 'Storie della buonanotte' }
  ];

  for (let i = 0; i < 5; i++) {
    const concept = tiktokConcepts[i];
    videos.push({
      id: i + 1,
      concept: concept.concept,
      title: `${book.title} - TikTok ${i + 1}`,
      hook_text: concept.hook,
      script: extractTikTokScript(book, i),
      visual_style: ['animated-watercolor', 'character-spotlight', 'text-animation', 'illustration-process', 'cozy-reading'][i],
      sound_suggestion: ['trending-lullaby', 'cute-instrumental', 'inspirational', 'lofi-beats', 'ambient-fireplace'][i],
      hashtags_suggestion: book.themes.slice(0, 3)
    });
  }

  return {
    enabled: true,
    count: 5,
    specs: {
      format: "mp4",
      resolution: "1080x1920",
      aspect_ratio: "9:16",
      max_duration_seconds: 60,
      trending_sounds: true
    },
    videos: videos,
    output: {
      path: "output/tiktok/",
      naming_pattern: `${book.slug}-tiktok-{id}.mp4`
    },
    distribution: {
      account: "@onde",
      schedule_days_apart: 2
    }
  };
}

// Extract TikTok script
function extractTikTokScript(book, index) {
  if (book.chapters[index]) {
    return book.chapters[index].content.split(/\s+/).slice(0, 30).join(' ') + '...';
  }
  return book.synopsis.split(/\s+/).slice(0, 30).join(' ') + '...';
}

// Generate Instagram Reels specifications
function generateInstagramReelsSpecs(book) {
  const reels = [];
  const reelsConcepts = [
    { concept: 'story-highlight', caption: 'Una storia che scalda il cuore' },
    { concept: 'illustration-showcase', caption: 'L\'arte di raccontare storie' },
    { concept: 'reading-asmr', caption: 'Storie della buonanotte' },
    { concept: 'quote-animation', caption: 'Parole che restano' },
    { concept: 'family-moment', caption: 'Momenti da ricordare' }
  ];

  for (let i = 0; i < 5; i++) {
    const concept = reelsConcepts[i];
    reels.push({
      id: i + 1,
      concept: concept.concept,
      title: `${book.title} - Reel ${i + 1}`,
      caption: `${concept.caption}\n\n${book.synopsis.split('.')[0]}.\n\nLink in bio per la storia completa!`,
      script: extractTikTokScript(book, i),
      visual_style: ['cinematic-watercolor', 'art-gallery', 'cozy-ambient', 'text-on-illustration', 'warm-lifestyle'][i],
      audio: ['original', 'trending', 'voiceover', 'soft-piano', 'gentle-acoustic'][i],
      cover_text: concept.caption
    });
  }

  return {
    enabled: true,
    count: 5,
    specs: {
      format: "mp4",
      resolution: "1080x1920",
      aspect_ratio: "9:16",
      max_duration_seconds: 90,
      cover_frame: "custom"
    },
    reels: reels,
    output: {
      path: "output/instagram/reels/",
      naming_pattern: `${book.slug}-reel-{id}.mp4`
    },
    distribution: {
      account: "@onde_publishing",
      cross_post_facebook: true
    }
  };
}

// Generate Tweet specifications
function generateTweetSpecs(book) {
  const tweetTemplates = [
    { type: 'announcement', template: `Nuovo libro! "${book.title}" e' ora disponibile. ${book.synopsis.split('.')[0]}.` },
    { type: 'quote', template: `"${extractQuote(book)}"` },
    { type: 'behind-scenes', template: `Come nasce "${book.title}"? Mesi di lavoro, amore, e tante illustrazioni...` },
    { type: 'character', template: `Ti presento i personaggi di "${book.title}": ${book.characters.slice(0, 3).join(', ')}` },
    { type: 'educational', template: `Cosa imparano i bambini da "${book.title}"? ${book.themes.slice(0, 2).join(' e ')}.` },
    { type: 'engagement', template: `Qual e' la vostra storia della buonanotte preferita? La nostra e' "${book.title}"!` },
    { type: 'testimonial', template: `"Una storia bellissima per i miei bambini" - Recensione di "${book.title}"` },
    { type: 'fun-fact', template: `Lo sapevi? "${book.title}" ha ${book.chapters.length} capitoli pieni di avventure!` },
    { type: 'milestone', template: `Grazie a tutti voi! "${book.title}" sta raggiungendo tanti piccoli lettori!` },
    { type: 'throwback', template: `Vi ricordate quando abbiamo pubblicato "${book.title}"? Che viaggio!` }
  ];

  return {
    enabled: true,
    count: 10,
    specs: {
      max_characters: 280,
      include_media: true,
      thread_capable: true
    },
    tweets: tweetTemplates.map((t, i) => ({
      id: i + 1,
      type: t.type,
      content: t.template.substring(0, 280),
      media: ['cover', 'illustration', 'process', 'character-art', 'infographic', 'poll-image', 'review-graphic', 'fact-card', 'celebration', 'compilation'][i],
      schedule_day: [0, 1, 2, 3, 4, 5, 7, 10, 14, 30][i]
    })),
    output: {
      path: "output/tweets/",
      filename: `${book.slug}-tweets.json`
    },
    distribution: {
      accounts: ["@Onde_FRH"],
      use_api: true
    }
  };
}

// Extract a quote from the book
function extractQuote(book) {
  const sentences = book.content.split(/[.!?]+/).filter(s =>
    s.trim().length > 30 && s.trim().length < 100
  );
  return sentences[Math.floor(Math.random() * sentences.length)]?.trim() || book.synopsis.split('.')[0];
}

// Generate Spotify track specifications
function generateSpotifySpecs(book) {
  return {
    enabled: true,
    specs: {
      format: "wav",
      sample_rate: "44100Hz",
      bit_depth: "16bit",
      duration_minutes: 3,
      genre: "Children's Music",
      ai_generator: "Suno"
    },
    track: {
      title: `${book.title} - Tema`,
      type: "theme-song",
      style: "gentle Italian lullaby, soft piano, light strings, warm and comforting",
      mood: "peaceful, magical, bedtime",
      tempo: "slow",
      vocals: "instrumental",
      prompt: `Gentle children's lullaby for "${book.title}", soft piano melody, light acoustic guitar, warm strings, Italian folk influence, magical and comforting, perfect for bedtime, instrumental only, ${book.themes.join(', ')} feeling`,
      lyrics: ""
    },
    output: {
      filename: `${book.slug}-theme.wav`,
      path: "output/spotify/",
      cover: book.cover_image
    },
    distribution: {
      distributor: "DistroKid",
      platforms: ["Spotify", "Apple Music", "Amazon Music", "YouTube Music"],
      isrc: "",
      release_date: ""
    }
  };
}

// Generate Cartoon specifications
function generateCartoonSpecs(book) {
  return {
    enabled: true,
    specs: {
      format: "mp4",
      resolution: "1920x1080",
      duration_minutes: Math.min(10, book.chapters.length * 2),
      style: "2D animated watercolor",
      frame_rate: 24
    },
    episode: {
      title: `${book.title} - Cartone Animato`,
      synopsis: book.synopsis,
      characters: book.characters.map(name => ({
        name: name,
        voice_prompt: `${name} character from "${book.title}", European watercolor style, warm golden light, Beatrix Potter aesthetic, NOT Pixar NOT 3D, 4k`
      })),
      voice_actors: {
        narrator: "gianni-parola-v1",
        characters: book.characters.reduce((acc, char) => {
          acc[char] = "elevenlabs-child-voice";
          return acc;
        }, {})
      },
      scenes: book.chapters.map((c, i) => ({
        number: i + 1,
        title: extractChapterTitle(c.content) || `Scena ${i + 1}`,
        description: c.content.split(/\s+/).slice(0, 50).join(' ') + '...',
        visual_prompt: generateScenePrompt(c.content, book),
        duration_seconds: Math.ceil(c.content.split(/\s+/).length / 3)
      })),
      storyboard_prompts: book.chapters.map((c, i) => ({
        scene: i + 1,
        prompt: generateScenePrompt(c.content, book)
      })),
      background_music: "gentle-orchestral",
      sound_effects: true
    },
    output: {
      filename: `${book.slug}-cartoon.mp4`,
      path: "output/cartoons/",
      thumbnail: `${book.slug}-cartoon-thumb.jpg`,
      storyboard_path: `output/cartoons/${book.slug}-storyboard/`
    },
    distribution: {
      platforms: ["YouTube", "Amazon Prime Video Kids"],
      age_rating: "G",
      series_name: "Onde Stories Animated"
    }
  };
}

// Calculate estimated generation time
function calculateEstimatedTime(book) {
  const baseTime = 2; // Base hours
  const perChapter = 0.5;
  return baseTime + (book.chapters.length * perChapter);
}

// Main function
async function main() {
  console.log('\n====================================');
  console.log('  CONTENT MATRIX GENERATOR');
  console.log('  Onde Publishing');
  console.log('====================================\n');

  const args = parseArgs();

  if (!args.book && !args.title) {
    console.log(`
Usage:
  node generate-matrix.js --book <book-path>
  node generate-matrix.js --title "Titolo" --author "Autore" --content <file.md>

Options:
  --book      Path to book directory
  --title     Book title (if not using --book)
  --author    Book author
  --content   Path to content file
  --output    Output directory (default: current directory)

Example:
  node generate-matrix.js --book /Users/mattia/Projects/Onde/books/aiko-ai-children/
    `);
    process.exit(1);
  }

  try {
    // Load book
    console.log('Loading book...');
    const book = await loadBook(args);
    console.log(`Title: ${book.title}`);
    console.log(`Author: ${book.author}`);
    console.log(`Chapters: ${book.chapters.length}`);
    console.log(`Characters: ${book.characters.join(', ')}`);
    console.log(`Themes: ${book.themes.join(', ')}\n`);

    // Generate matrix
    console.log('Generating content matrix...');
    const matrix = generateMatrix(book);

    // Determine output path
    const outputDir = args.output || path.join(process.cwd(), 'output', 'matrices');
    fs.mkdirSync(outputDir, { recursive: true });

    const outputFile = path.join(outputDir, `${book.slug}-content-matrix.json`);
    fs.writeFileSync(outputFile, JSON.stringify(matrix, null, 2));

    console.log('\nContent Matrix Generated Successfully!');
    console.log('=====================================');
    console.log(`Output: ${outputFile}\n`);

    // Summary
    console.log('Generated specs for:');
    console.log(`  - Audiobook: ${matrix.audiobook.specs.estimated_duration_minutes} minutes`);
    console.log(`  - Podcast Episode: 1 episode`);
    console.log(`  - YouTube Long: 1 video`);
    console.log(`  - YouTube Shorts: ${matrix.youtube_shorts.count} videos`);
    console.log(`  - TikTok: ${matrix.tiktok.count} videos`);
    console.log(`  - Instagram Reels: ${matrix.instagram_reels.count} reels`);
    console.log(`  - Tweets: ${matrix.tweets.count} tweets`);
    console.log(`  - Spotify Track: 1 theme song`);
    console.log(`  - Cartoon: 1 animated episode\n`);

    console.log(`Estimated production time: ${matrix.generation_queue.estimated_time_hours} hours\n`);

  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

// Run
main();
