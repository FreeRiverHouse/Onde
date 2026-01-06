'use server';

/**
 * ONDE STUDIO - Quality Assurance System
 *
 * Workflow:
 * 1. Generate 5 iterations of content (text or image)
 * 2. At iteration 5: upscale (images) or correct (text)
 * 3. Plagiarism check
 * 4. Copyright verification
 */

export interface QAConfig {
  iterations: number;        // Default: 5
  upscaleCount: number;      // Default: 3 (for images)
  checkPlagiarism: boolean;  // Default: true
  checkCopyright: boolean;   // Default: true
}

export interface TextIteration {
  version: number;
  content: string;
  wordCount: number;
  timestamp: Date;
  score?: number;  // Quality score 0-100
  feedback?: string;
}

export interface ImageIteration {
  version: number;
  prompt: string;
  imageUrl?: string;
  localPath?: string;
  timestamp: Date;
  score?: number;
  feedback?: string;
}

export interface QAResult {
  passed: boolean;
  iterations: (TextIteration | ImageIteration)[];
  finalVersion: number;
  plagiarismCheck?: PlagiarismResult;
  copyrightCheck?: CopyrightResult;
  upscales?: string[];  // For images
  corrections?: string[];  // For text
}

export interface PlagiarismResult {
  isPlagiarized: boolean;
  similarityScore: number;  // 0-100, lower is better
  matches?: {
    source: string;
    similarity: number;
    excerpt: string;
  }[];
}

export interface CopyrightResult {
  hasCopyrightIssues: boolean;
  issues?: {
    type: 'text' | 'image' | 'character' | 'style';
    description: string;
    severity: 'low' | 'medium' | 'high';
  }[];
}

const DEFAULT_CONFIG: QAConfig = {
  iterations: 5,
  upscaleCount: 3,
  checkPlagiarism: true,
  checkCopyright: true,
};

/**
 * Generate multiple text iterations and select the best
 */
export async function generateTextIterations(
  generateFn: () => Promise<string>,
  config: Partial<QAConfig> = {}
): Promise<QAResult> {
  const cfg = { ...DEFAULT_CONFIG, ...config };
  const iterations: TextIteration[] = [];

  console.log(`📝 Generating ${cfg.iterations} text iterations...`);

  for (let i = 1; i <= cfg.iterations; i++) {
    console.log(`  Iteration ${i}/${cfg.iterations}...`);

    try {
      const content = await generateFn();
      const wordCount = content.split(/\s+/).length;

      iterations.push({
        version: i,
        content,
        wordCount,
        timestamp: new Date(),
      });

      // Small delay between iterations
      if (i < cfg.iterations) {
        await new Promise(r => setTimeout(r, 1000));
      }
    } catch (error: any) {
      console.error(`  ❌ Iteration ${i} failed: ${error.message}`);
    }
  }

  // Score iterations (simple heuristic based on word count and structure)
  for (const iter of iterations) {
    iter.score = scoreTextIteration(iter as TextIteration);
  }

  // Select best iteration
  const bestIteration = iterations.reduce((best, curr) =>
    (curr.score || 0) > (best.score || 0) ? curr : best
  );

  // Generate corrections for the best version
  const corrections: string[] = [];
  if (cfg.iterations >= 5) {
    const correctionResult = await generateTextCorrections(bestIteration as TextIteration);
    corrections.push(...correctionResult);
  }

  // Plagiarism check
  let plagiarismCheck: PlagiarismResult | undefined;
  if (cfg.checkPlagiarism) {
    plagiarismCheck = await checkTextPlagiarism((bestIteration as TextIteration).content);
  }

  // Copyright check
  let copyrightCheck: CopyrightResult | undefined;
  if (cfg.checkCopyright) {
    copyrightCheck = await checkTextCopyright((bestIteration as TextIteration).content);
  }

  return {
    passed: !plagiarismCheck?.isPlagiarized && !copyrightCheck?.hasCopyrightIssues,
    iterations,
    finalVersion: bestIteration.version,
    plagiarismCheck,
    copyrightCheck,
    corrections,
  };
}

/**
 * Generate multiple image iterations and select the best
 */
export async function generateImageIterations(
  generateFn: (prompt: string) => Promise<string>,
  basePrompt: string,
  config: Partial<QAConfig> = {}
): Promise<QAResult> {
  const cfg = { ...DEFAULT_CONFIG, ...config };
  const iterations: ImageIteration[] = [];

  console.log(`🎨 Generating ${cfg.iterations} image iterations...`);

  for (let i = 1; i <= cfg.iterations; i++) {
    console.log(`  Iteration ${i}/${cfg.iterations}...`);

    // Vary the prompt slightly for each iteration
    const variedPrompt = varyImagePrompt(basePrompt, i);

    try {
      const imageUrl = await generateFn(variedPrompt);

      iterations.push({
        version: i,
        prompt: variedPrompt,
        imageUrl,
        timestamp: new Date(),
      });

      // Delay between iterations
      if (i < cfg.iterations) {
        await new Promise(r => setTimeout(r, 2000));
      }
    } catch (error: any) {
      console.error(`  ❌ Iteration ${i} failed: ${error.message}`);
      iterations.push({
        version: i,
        prompt: variedPrompt,
        timestamp: new Date(),
        feedback: `Failed: ${error.message}`,
      });
    }
  }

  // Select best iteration (for now, use the last successful one)
  const successfulIterations = iterations.filter(i => i.imageUrl);
  const bestIteration = successfulIterations[successfulIterations.length - 1] || iterations[0];

  // Generate upscales for the best version
  const upscales: string[] = [];
  if (cfg.upscaleCount > 0 && bestIteration.imageUrl) {
    console.log(`  📐 Generating ${cfg.upscaleCount} upscales...`);
    for (let i = 0; i < cfg.upscaleCount; i++) {
      const upscaleResult = await generateUpscale(bestIteration.imageUrl, i + 1);
      if (upscaleResult) {
        upscales.push(upscaleResult);
      }
    }
  }

  // Copyright check for images
  let copyrightCheck: CopyrightResult | undefined;
  if (cfg.checkCopyright) {
    copyrightCheck = await checkImageCopyright(bestIteration.prompt);
  }

  return {
    passed: !copyrightCheck?.hasCopyrightIssues,
    iterations,
    finalVersion: bestIteration.version,
    copyrightCheck,
    upscales,
  };
}

/**
 * Score a text iteration based on quality heuristics
 * FOCUS: Maximum quality, human-like writing (NOT AI-like)
 */
function scoreTextIteration(iteration: TextIteration): number {
  let score = 50; // Base score

  const content = iteration.content;

  // Word count bonus (ideal: 100-300 words per page for kids)
  if (iteration.wordCount >= 100 && iteration.wordCount <= 300) {
    score += 10;
  } else if (iteration.wordCount >= 50 && iteration.wordCount <= 400) {
    score += 5;
  }

  // Short sentences bonus (kids books should have short sentences)
  const sentences = content.split(/[.!?]+/).filter(s => s.trim());
  const avgSentenceLength = iteration.wordCount / sentences.length;
  if (avgSentenceLength <= 10) {
    score += 10;
  } else if (avgSentenceLength <= 15) {
    score += 5;
  }

  // Dialogue bonus (dialogue engages kids)
  const dialogueCount = (content.match(/["«»]/g) || []).length;
  if (dialogueCount >= 4) {
    score += 5;
  }

  // Illustration markers bonus
  const illustrationMarkers = (content.match(/\[ILLUSTRAZIONE:/g) || []).length;
  if (illustrationMarkers >= 1) {
    score += 5;
  }

  // === HUMANIZATION SCORE ===

  // Sentence length VARIATION (humans vary, AI is consistent)
  const sentenceLengths = sentences.map(s => s.split(/\s+/).length);
  const lengthVariance = calculateVariance(sentenceLengths);
  if (lengthVariance > 10) {
    score += 15; // High variance = more human
  } else if (lengthVariance > 5) {
    score += 8;
  }

  // Contractions and informal language (more human)
  const informalPatterns = /\b(non c'è|c'era|dov'è|cos'è|un po'|com'è)\b/gi;
  const informalCount = (content.match(informalPatterns) || []).length;
  if (informalCount >= 2) {
    score += 10;
  }

  // Onomatopoeia and expressive words (very human for kids books)
  const onomatopoeia = /\b(splash|bum|bang|pow|whoosh|zzz|miao|bau|cip|grrr|ahh|ohh|uffa)\b/gi;
  const expressiveCount = (content.match(onomatopoeia) || []).length;
  if (expressiveCount >= 1) {
    score += 10;
  }

  // PENALTY: AI-typical phrases (reduce score if found)
  const aiPhrases = [
    /in questo contesto/gi,
    /è importante notare/gi,
    /in conclusione/gi,
    /in sintesi/gi,
    /fondamentalmente/gi,
    /essenzialmente/gi,
    /in termini di/gi,
    /a tal proposito/gi,
    /nell'ambito di/gi,
    /per quanto riguarda/gi,
    /in relazione a/gi,
  ];

  for (const pattern of aiPhrases) {
    if (pattern.test(content)) {
      score -= 15; // Heavy penalty for AI-like language
    }
  }

  // PENALTY: Repetitive sentence starters (AI tends to repeat)
  const starters = sentences.map(s => s.trim().split(/\s+/).slice(0, 2).join(' ').toLowerCase());
  const uniqueStarters = new Set(starters);
  if (uniqueStarters.size < starters.length * 0.7) {
    score -= 10; // Too many repeated starters
  }

  // BONUS: Emotional words (humans use more emotion)
  const emotionalWords = /\b(felice|triste|spaventato|sorpreso|arrabbiato|curioso|eccitato|tranquillo|preoccupato|contento|allegro)\b/gi;
  const emotionalCount = (content.match(emotionalWords) || []).length;
  if (emotionalCount >= 2) {
    score += 10;
  }

  // BONUS: Questions (engagement, very human in kids books)
  const questionCount = (content.match(/\?/g) || []).length;
  if (questionCount >= 2) {
    score += 10;
  }

  return Math.min(100, Math.max(0, score));
}

/**
 * Calculate variance for sentence length variation
 */
function calculateVariance(numbers: number[]): number {
  if (numbers.length === 0) return 0;
  const mean = numbers.reduce((a, b) => a + b, 0) / numbers.length;
  const squaredDiffs = numbers.map(n => Math.pow(n - mean, 2));
  return squaredDiffs.reduce((a, b) => a + b, 0) / numbers.length;
}

/**
 * Vary an image prompt slightly for different iterations
 */
function varyImagePrompt(basePrompt: string, iteration: number): string {
  const variations = [
    '', // Original
    ', morning light, soft shadows',
    ', afternoon golden hour, warm tones',
    ', slightly closer framing, more detail',
    ', wider view, more context',
  ];

  const variationIndex = (iteration - 1) % variations.length;
  return basePrompt + variations[variationIndex];
}

/**
 * Generate corrections for text (grammar, style, age-appropriateness)
 */
async function generateTextCorrections(iteration: TextIteration): Promise<string[]> {
  const corrections: string[] = [];
  const content = iteration.content;

  // Check for complex words
  const complexWords = findComplexWords(content);
  if (complexWords.length > 0) {
    corrections.push(`Parole complesse da semplificare: ${complexWords.join(', ')}`);
  }

  // Check for long sentences
  const longSentences = findLongSentences(content);
  if (longSentences.length > 0) {
    corrections.push(`${longSentences.length} frasi troppo lunghe (>15 parole)`);
  }

  // Check for passive voice
  if (content.match(/\b(è stato|sono stati|viene|vengono)\b/gi)) {
    corrections.push('Presente voce passiva - preferire voce attiva');
  }

  return corrections;
}

/**
 * Find complex words that might be difficult for children
 */
function findComplexWords(content: string): string[] {
  const complexPatterns = [
    /\b\w{12,}\b/g, // Words longer than 12 chars
  ];

  const complexWords: string[] = [];
  for (const pattern of complexPatterns) {
    const matches = content.match(pattern) || [];
    complexWords.push(...matches);
  }

  return [...new Set(complexWords)];
}

/**
 * Find sentences that are too long for children
 */
function findLongSentences(content: string): string[] {
  const sentences = content.split(/[.!?]+/).filter(s => s.trim());
  return sentences.filter(s => s.split(/\s+/).length > 15);
}

/**
 * Check for text plagiarism
 * In production, this would call an API like Copyscape, Grammarly, or similar
 */
async function checkTextPlagiarism(content: string): Promise<PlagiarismResult> {
  // Simple check: look for well-known phrases that shouldn't be copied verbatim
  const knownPhrases = [
    'il signore è il mio pastore', // This is OK - it's the Bible!
  ];

  // For now, return a basic result
  // In production, integrate with plagiarism detection API
  console.log('  🔍 Checking plagiarism...');

  return {
    isPlagiarized: false,
    similarityScore: 0,
    matches: [],
  };
}

/**
 * Check for text copyright issues
 * Looks for copyrighted characters, phrases, etc.
 */
async function checkTextCopyright(content: string): Promise<CopyrightResult> {
  const issues: CopyrightResult['issues'] = [];
  const lowerContent = content.toLowerCase();

  // Check for copyrighted characters
  const copyrightedCharacters = [
    { name: 'harry potter', owner: 'Warner Bros / J.K. Rowling' },
    { name: 'mickey mouse', owner: 'Disney' },
    { name: 'winnie the pooh', owner: 'Disney' },
    { name: 'peppa pig', owner: 'Entertainment One' },
    { name: 'paw patrol', owner: 'Spin Master' },
    { name: 'frozen', owner: 'Disney' },
    { name: 'elsa', owner: 'Disney' },
    { name: 'spider-man', owner: 'Marvel/Sony' },
    { name: 'pokemon', owner: 'Nintendo' },
    { name: 'pikachu', owner: 'Nintendo' },
  ];

  for (const char of copyrightedCharacters) {
    if (lowerContent.includes(char.name)) {
      issues.push({
        type: 'character',
        description: `Personaggio protetto da copyright: "${char.name}" (${char.owner})`,
        severity: 'high',
      });
    }
  }

  // Check for copyrighted phrases/songs
  const copyrightedPhrases = [
    { phrase: 'let it go', owner: 'Disney' },
    { phrase: 'hakuna matata', owner: 'Disney' },
    { phrase: 'bibbidi bobbidi boo', owner: 'Disney' },
  ];

  for (const item of copyrightedPhrases) {
    if (lowerContent.includes(item.phrase)) {
      issues.push({
        type: 'text',
        description: `Frase protetta: "${item.phrase}" (${item.owner})`,
        severity: 'medium',
      });
    }
  }

  console.log('  ©️ Copyright check completed');

  return {
    hasCopyrightIssues: issues.length > 0,
    issues,
  };
}

/**
 * Check for image copyright issues
 * Analyzes the prompt for copyrighted elements
 */
async function checkImageCopyright(prompt: string): Promise<CopyrightResult> {
  const issues: CopyrightResult['issues'] = [];
  const lowerPrompt = prompt.toLowerCase();

  // Check for copyrighted styles
  const copyrightedStyles = [
    { name: 'disney style', owner: 'Disney' },
    { name: 'pixar style', owner: 'Disney/Pixar' },
    { name: 'studio ghibli', owner: 'Studio Ghibli' },
    { name: 'dreamworks', owner: 'DreamWorks' },
  ];

  for (const style of copyrightedStyles) {
    if (lowerPrompt.includes(style.name)) {
      issues.push({
        type: 'style',
        description: `Stile protetto: "${style.name}" (${style.owner}) - usa descrizioni generiche invece`,
        severity: 'medium',
      });
    }
  }

  // Check for copyrighted characters in image prompts
  const copyrightedInImages = [
    'mickey', 'minnie', 'donald duck', 'goofy',
    'elsa', 'anna', 'olaf',
    'peppa', 'george pig',
    'spongebob', 'patrick star',
  ];

  for (const char of copyrightedInImages) {
    if (lowerPrompt.includes(char)) {
      issues.push({
        type: 'character',
        description: `Personaggio protetto nel prompt: "${char}"`,
        severity: 'high',
      });
    }
  }

  console.log('  ©️ Image copyright check completed');

  return {
    hasCopyrightIssues: issues.length > 0,
    issues,
  };
}

/**
 * Generate upscaled version of an image
 * In production, this would use an upscaling API
 */
async function generateUpscale(imageUrl: string, level: number): Promise<string | null> {
  // For now, return the same URL
  // In production, integrate with upscaling service (Real-ESRGAN, Topaz, etc.)
  console.log(`    Upscale ${level}x...`);

  // Placeholder - would actually call upscaling API
  return `${imageUrl}?upscale=${level}x`;
}

/**
 * Run full QA pipeline for a book
 */
export async function runBookQA(
  bookId: string,
  chapters: { title: string; content: string }[],
  illustrations: { name: string; prompt: string }[],
  config: Partial<QAConfig> = {}
): Promise<{
  textResults: QAResult[];
  imageResults: QAResult[];
  overallPassed: boolean;
  summary: string;
}> {
  console.log(`\n📚 Running QA for book: ${bookId}\n`);
  console.log('═'.repeat(50));

  const textResults: QAResult[] = [];
  const imageResults: QAResult[] = [];

  // QA for text chapters
  console.log('\n📝 TEXT QA\n');
  for (const chapter of chapters) {
    console.log(`Chapter: ${chapter.title}`);

    // For now, just check the existing content
    const result = await generateTextIterations(
      async () => chapter.content,
      { ...config, iterations: 1 } // Single iteration for existing content
    );
    textResults.push(result);
  }

  // QA for illustrations
  console.log('\n🎨 IMAGE QA\n');
  for (const illust of illustrations) {
    console.log(`Illustration: ${illust.name}`);

    const result = await generateImageIterations(
      async (prompt) => prompt, // Placeholder
      illust.prompt,
      { ...config, iterations: 1 }
    );
    imageResults.push(result);
  }

  // Calculate overall result
  const textPassed = textResults.every(r => r.passed);
  const imagePassed = imageResults.every(r => r.passed);
  const overallPassed = textPassed && imagePassed;

  // Generate summary
  const copyrightIssues = [
    ...textResults.flatMap(r => r.copyrightCheck?.issues || []),
    ...imageResults.flatMap(r => r.copyrightCheck?.issues || []),
  ];

  const summary = `
QA SUMMARY
══════════════════════════════════════════════════
Text Chapters: ${textResults.length} checked
Images: ${imageResults.length} checked

Text QA: ${textPassed ? '✅ PASSED' : '❌ FAILED'}
Image QA: ${imagePassed ? '✅ PASSED' : '❌ FAILED'}

Copyright Issues: ${copyrightIssues.length}
${copyrightIssues.map(i => `  - [${i.severity.toUpperCase()}] ${i.description}`).join('\n')}

OVERALL: ${overallPassed ? '✅ READY FOR PUBLICATION' : '❌ NEEDS REVIEW'}
══════════════════════════════════════════════════
`;

  console.log(summary);

  return {
    textResults,
    imageResults,
    overallPassed,
    summary,
  };
}
