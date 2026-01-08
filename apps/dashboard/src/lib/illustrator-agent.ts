'use server';

import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

// AI Provider for chat: 'grok' | 'openai' | 'anthropic'
const AI_PROVIDER = process.env.AI_PROVIDER || 'grok';

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface IllustrationRequest {
  bookId: string;
  chapterNumber: number;
  scene: string;
  style: IllustrationStyle;
  characters?: Character[];
}

export interface IllustrationStyle {
  type: 'watercolor' | 'cartoon' | 'realistic' | 'minimal' | 'collage';
  colors: string[];
  mood: string;
  references?: string[];
}

export interface Character {
  name: string;
  description: string;
  visualTraits: string[];
}

export interface GeneratedIllustration {
  id: string;
  prompt: string;
  negativePrompt?: string;
  imageUrl?: string;
  localPath?: string;
  status: 'pending' | 'generating' | 'completed' | 'failed';
  variations?: string[];
}

export interface BookIllustrationSet {
  bookId: string;
  bookTitle: string;
  illustrations: {
    name: string;
    prompt: string;
    imageUrl?: string;
    localPath?: string;
    status: 'pending' | 'generating' | 'completed' | 'failed';
    error?: string;
  }[];
}

// Salmo 23 prompts for automated generation
const SALMO_23_PROMPTS = [
  {
    name: 'cover',
    prompt: `Children's book cover illustration in warm watercolor style. A loving shepherd in a simple beige tunic holds a young lamb gently while fluffy white sheep gather around him in a beautiful green meadow. Diverse children of different ethnicities peek out from behind the sheep, all smiling with joy. Soft pastel flowers (pink, yellow, lavender) border the scene. Golden sunlight creates a heavenly glow. Large space at top for title text. Style: professional children's book cover, heartwarming, inviting, peaceful. Colors: soft greens, warm golds, sky blue, gentle pink. Award-winning illustration quality. No text in image.`,
  },
  {
    name: 'chapter-01-pastore',
    prompt: `A heartwarming children's book illustration in soft watercolor style. A kind shepherd with warm brown eyes and a gentle smile stands in a lush green meadow during golden hour. He wears a simple beige tunic and holds a wooden staff. Around him, fluffy white sheep with sweet faces graze peacefully. In the foreground, diverse children of different ethnicities play happily among the sheep - one hugging a lamb, another picking wildflowers. Soft rolling hills in the background under a pastel blue sky with cotton candy clouds. The lighting is warm and golden, creating a sense of safety and love. Style: award-winning children's book illustration, gentle watercolor, peaceful atmosphere.`,
  },
  {
    name: 'chapter-02-non-manca-nulla',
    prompt: `Serene watercolor children's book illustration. A peaceful meadow scene with fluffy white sheep resting on soft green grass near a gentle, crystal-clear stream. The water sparkles in the sunlight. Some sheep drink from the calm water. A large, friendly oak tree provides cool shade. Butterflies and small colorful flowers dot the scene. Diverse children lie contentedly on the grass, looking peaceful and happy. Warm afternoon golden light. Colors: fresh greens, clear blues, warm yellows, soft whites. Style: gentle watercolor, comforting, abundant, safe atmosphere.`,
  },
  {
    name: 'chapter-03-guida',
    prompt: `Warm watercolor children's book illustration of a winding path through a beautiful landscape. A kind shepherd walks ahead on the path, looking back and gently beckoning. Behind him, fluffy white sheep follow trustingly in a happy line. The path winds through green hills dotted with colorful wildflowers. In the distance, a beautiful destination glows with warm light - perhaps a cozy village. Diverse children walk on the path holding hands, looking happy and confident. Soft morning light, pastel colors. The scene conveys trust, guidance, and adventure. Style: gentle watercolor, encouraging, hopeful.`,
  },
  {
    name: 'chapter-04-non-ho-paura',
    prompt: `Tender watercolor children's book illustration showing beautiful contrast between worry and comfort. On one side, soft grey clouds suggest something uncertain. But in the center and foreground, warm golden light surrounds a protective shepherd holding his staff. Fluffy white sheep are huddled close to him, looking calm and safe. Among the sheep, diverse children peek out with reassured, peaceful expressions. The shepherd's face shows calm strength and protection. The overall mood transitions from uncertainty to complete safety. Warm colors dominate. Style: gentle watercolor, protective, comforting, safe.`,
  },
  {
    name: 'chapter-05-tavola',
    prompt: `Joyful watercolor children's book illustration of a beautiful outdoor feast. A long wooden table is set in a sunny garden, covered with a cheerful tablecloth. The table overflows with delicious, colorful foods: bowls of bright fruits (red apples, orange oranges, purple grapes), fresh golden bread, colorful cakes and treats. Diverse children sit around the table, smiling with delight. One child's golden cup is overflowing with juice, sparkling in the sunlight. Flowers, butterflies, and birds surround the scene. Warm, golden afternoon light. Style: celebratory watercolor, abundant, joyful, loving atmosphere.`,
  },
  {
    name: 'chapter-06-per-sempre',
    prompt: `Magical, heartwarming watercolor children's book illustration of a heavenly destination. A beautiful, softly glowing house or garden is shown in the distance, surrounded by warm golden light and gentle clouds. A luminous path made of soft light leads toward it through a flowered meadow. In the foreground, the kind shepherd walks with diverse happy children toward this beautiful place. Some children hold hands, some skip with joy. Fluffy sheep follow happily. The scene is filled with hope, peace, and eternal joy. Luminous colors: soft golds, gentle pinks, heavenly light blues, pure whites. Style: magical watercolor, hopeful, the perfect happy ending.`,
  },
];

const PINO_PENNELLO_SYSTEM_PROMPT = `# Pina Pennello – Illustratore per Bambini

Sei Pina Pennello, illustratore della casa editrice **Onde**.

## Il Tuo Stile
Pastelli vivaci, stile **Scarry con twist Seuss**: oggetti che sghignazzano, colori che urlano piano.
Ma mettici luce—tipo un raggio che dice "ci sono anch'io".

## Come Lavori
1. Prima ASCOLTI cosa vuole il cliente
2. Poi IMMAGINI la scena - cosa vedrebbe un bambino?
3. Proponi IDEE e discuti
4. Solo DOPO crei il prompt per l'immagine

## Collaborazione con Gianni
Gianni Parola è il tuo scrittore. Lavorate sempre insieme.
Leggi le sue parole e vedi già le immagini.
Le sue storie e i tuoi disegni sono come una canzone—parole e melodia insieme.

## Quando Crei Prompt
Includi sempre:
- Stile: "Acquerello, libro bambini"
- Dettagli: oggetti specifici, espressioni
- Luce: "sole tondo e gentile", "raggio di luce"
- Mood: "amici ridono", atmosfera calda
- Tecnica: "4k" o "award-winning children's book illustration"

## Formato Output
Quando generi un prompt finale, usa:
\`\`\`prompt
[Acquerello, libro bambini, descrizione scena, oggetti, personaggi, atmosfera, luce, 4k]
\`\`\`

Solo descrizione, niente più.

## Cosa NON Fai
- Non crei immagini spaventose o inquietanti
- Non usi colori troppo scuri o aggressivi
- Non metti troppi elementi che confondono
- Non dimentichi mai la luce—quel raggio che dice "ci sono anch'io"

## QUALITÀ MASSIMA - Illustrazioni che sembrano UMANE

FONDAMENTALE: Le tue illustrazioni devono sembrare fatte da un ARTISTA UMANO, non da AI.

**FAI:**
- Aggiungi imperfezioni sottili (un fiore storto, una nuvola asimmetrica)
- Varia lo spessore delle linee
- Metti dettagli inaspettati che solo un umano noterebbe
- Luce naturale, non perfetta
- Espressioni con personalità, non generiche

**NON FARE MAI:**
- Simmetria perfetta (troppo AI)
- Volti tutti uguali
- Sfondi generici senza carattere
- Luce piatta e uniforme
- Mani e dita perfette (gli artisti le sbagliano sempre!)

**NEI PROMPT:**
- Aggiungi "hand-drawn feel", "slight imperfections", "artist's touch"
- Specifica "asymmetric composition" o "natural lighting"
- Mai chiedere "perfect" o "flawless"

Ogni immagine passa attraverso 5 iterazioni + 3 upscale + controllo copyright.
Punta sempre alla qualità massima, come se fossi Richard Scarry in persona.

Rispondi in italiano. Sii conversazionale, fai brainstorming visivo!`;

/**
 * Chat with Pina Pennello
 * Supports: Grok (default), OpenAI, Anthropic
 */
export async function chatWithPino(
  messages: Message[],
  context?: {
    bookTitle?: string;
    style?: IllustrationStyle;
    characters?: Character[];
  }
): Promise<{ success: boolean; message?: string; error?: string }> {
  // Get the right API key based on provider
  const grokKey = process.env.XAI_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;

  // Auto-detect: prefer Grok
  const apiKey = grokKey || openaiKey;
  const useGrok = !!grokKey;

  if (!apiKey) {
    return {
      success: true,
      message: getPinoFallbackResponse(messages, context),
    };
  }

  try {
    let systemPrompt = PINO_PENNELLO_SYSTEM_PROMPT;

    if (context) {
      if (context.bookTitle) {
        systemPrompt += `\n\nSTAI LAVORANDO SU: "${context.bookTitle}"`;
      }
      if (context.style) {
        systemPrompt += `\n\nSTILE DEFINITO:`;
        systemPrompt += `\n- Tipo: ${context.style.type}`;
        systemPrompt += `\n- Colori: ${context.style.colors.join(', ')}`;
        systemPrompt += `\n- Mood: ${context.style.mood}`;
      }
      if (context.characters && context.characters.length > 0) {
        systemPrompt += `\n\nPERSONAGGI DA MANTENERE CONSISTENTI:`;
        context.characters.forEach((char) => {
          systemPrompt += `\n- ${char.name}: ${char.description}`;
          if (char.visualTraits.length > 0) {
            systemPrompt += ` (${char.visualTraits.join(', ')})`;
          }
        });
      }
    }

    const url = useGrok ? 'https://api.x.ai/v1/chat/completions' : 'https://api.openai.com/v1/chat/completions';
    const model = useGrok ? 'grok-2-latest' : 'gpt-4-turbo-preview';

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages,
        ],
        temperature: 0.8,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      return {
        success: false,
        error: error.error?.message || 'Errore API',
      };
    }

    const data = await response.json();
    return {
      success: true,
      message: data.choices[0].message.content,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Errore di connessione',
    };
  }
}

/**
 * Generate illustration prompt for a specific scene
 */
export async function generateIllustrationPrompt(
  scene: string,
  style: IllustrationStyle,
  ageRange: { min: number; max: number },
  characters?: Character[]
): Promise<{ success: boolean; prompt?: string; negativePrompt?: string; error?: string }> {
  const apiKey = process.env.OPENAI_API_KEY;

  const request = `Genera un prompt DALL-E 3 per questa scena:

SCENA: ${scene}

STILE: ${style.type}
COLORI: ${style.colors.join(', ')}
MOOD: ${style.mood}
ETÀ TARGET: ${ageRange.min}-${ageRange.max} anni

${characters ? `PERSONAGGI:\n${characters.map(c => `- ${c.name}: ${c.description}`).join('\n')}` : ''}

Rispondi SOLO con il prompt in inglese, ottimizzato per DALL-E 3. Nessuna spiegazione.`;

  if (!apiKey) {
    // Generate a basic prompt without API
    return {
      success: true,
      prompt: generateBasicPrompt(scene, style, ageRange),
      negativePrompt: 'scary, dark, violent, realistic photo, 3d render',
    };
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: 'Sei un esperto di prompt engineering per DALL-E 3. Genera prompt ottimizzati per illustrazioni di libri per bambini. Rispondi SOLO con il prompt, niente altro.',
          },
          { role: 'user', content: request },
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      return { success: false, error: error.error?.message };
    }

    const data = await response.json();
    return {
      success: true,
      prompt: data.choices[0].message.content,
      negativePrompt: 'scary, dark, violent, realistic photo, 3d render, horror, blood',
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Generate image using DALL-E 3
 */
export async function generateImage(
  prompt: string,
  size: '1024x1024' | '1792x1024' | '1024x1792' = '1024x1024'
): Promise<{ success: boolean; imageUrl?: string; error?: string }> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return {
      success: false,
      error: 'OPENAI_API_KEY non configurata. Configura la chiave per generare immagini con DALL-E 3.',
    };
  }

  try {
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: prompt,
        n: 1,
        size: size,
        quality: 'hd',
        style: 'vivid',
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      return { success: false, error: error.error?.message };
    }

    const data = await response.json();
    return {
      success: true,
      imageUrl: data.data[0].url,
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Generate image using xAI Grok (Aurora)
 */
export async function generateImageWithGrok(
  prompt: string
): Promise<{ success: boolean; imageUrl?: string; error?: string }> {
  const apiKey = process.env.XAI_API_KEY;

  if (!apiKey) {
    return {
      success: false,
      error: 'XAI_API_KEY non configurata. Vai su console.x.ai per ottenere la tua API key.',
    };
  }

  try {
    const response = await fetch('https://api.x.ai/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'grok-2-image-1212',
        prompt: prompt,
        n: 1,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      return { success: false, error: error.error?.message || 'Errore API xAI' };
    }

    const data = await response.json();
    return {
      success: true,
      imageUrl: data.data[0].url,
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Download image from URL and save locally
 */
async function downloadAndSaveImage(
  imageUrl: string,
  outputPath: string
): Promise<{ success: boolean; localPath?: string; error?: string }> {
  try {
    const response = await fetch(imageUrl);
    if (!response.ok) {
      return { success: false, error: 'Failed to download image' };
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Ensure directory exists
    const dir = path.dirname(outputPath);
    await mkdir(dir, { recursive: true });

    await writeFile(outputPath, buffer);

    return { success: true, localPath: outputPath };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Generate ALL illustrations for a book automatically
 * Uses xAI Grok if XAI_API_KEY is set, otherwise DALL-E 3
 */
export async function generateAllBookIllustrations(
  bookId: 'salmo-23-bambini' | 'ai-spiegata-bambini',
  onProgress?: (current: number, total: number, name: string, status: string) => void
): Promise<BookIllustrationSet> {
  const prompts = bookId === 'salmo-23-bambini' ? SALMO_23_PROMPTS : SALMO_23_PROMPTS; // TODO: Add AI book prompts

  const useGrok = !!process.env.XAI_API_KEY;
  const useOpenAI = !!process.env.OPENAI_API_KEY;

  if (!useGrok && !useOpenAI) {
    return {
      bookId,
      bookTitle: bookId === 'salmo-23-bambini' ? 'Il Salmo 23 per Bambini' : 'AI Spiegata ai Bambini',
      illustrations: prompts.map(p => ({
        name: p.name,
        prompt: p.prompt,
        status: 'failed' as const,
        error: 'Nessuna API key configurata. Imposta XAI_API_KEY o OPENAI_API_KEY.',
      })),
    };
  }

  const outputDir = path.join(process.cwd(), '..', '..', 'content', 'books', bookId, 'illustrations');

  const result: BookIllustrationSet = {
    bookId,
    bookTitle: bookId === 'salmo-23-bambini' ? 'Il Salmo 23 per Bambini' : 'AI Spiegata ai Bambini',
    illustrations: [],
  };

  for (let i = 0; i < prompts.length; i++) {
    const { name, prompt } = prompts[i];

    onProgress?.(i + 1, prompts.length, name, 'generating');

    // Generate image
    const generateResult = useGrok
      ? await generateImageWithGrok(prompt)
      : await generateImage(prompt, name === 'cover' ? '1792x1024' : '1024x1024');

    if (!generateResult.success || !generateResult.imageUrl) {
      result.illustrations.push({
        name,
        prompt,
        status: 'failed',
        error: generateResult.error,
      });
      continue;
    }

    // Download and save locally
    const ext = useGrok ? 'jpg' : 'png';
    const outputPath = path.join(outputDir, `${name}.${ext}`);

    onProgress?.(i + 1, prompts.length, name, 'saving');

    const saveResult = await downloadAndSaveImage(generateResult.imageUrl, outputPath);

    result.illustrations.push({
      name,
      prompt,
      imageUrl: generateResult.imageUrl,
      localPath: saveResult.success ? saveResult.localPath : undefined,
      status: saveResult.success ? 'completed' : 'failed',
      error: saveResult.error,
    });

    // Small delay to avoid rate limiting
    if (i < prompts.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  return result;
}

/**
 * Check which API is available
 */
export async function getAvailableImageAPI(): Promise<'grok' | 'openai' | 'none'> {
  if (process.env.XAI_API_KEY) return 'grok';
  if (process.env.OPENAI_API_KEY) return 'openai';
  return 'none';
}

/**
 * Analyze an illustration and suggest improvements
 */
export async function analyzeIllustration(
  imageDescription: string,
  targetStyle: IllustrationStyle,
  targetAge: { min: number; max: number }
): Promise<{ success: boolean; analysis?: string; suggestions?: string[]; error?: string }> {
  const messages: Message[] = [
    {
      role: 'user',
      content: `Analizza questa illustrazione e dimmi se è adatta:

DESCRIZIONE IMMAGINE: ${imageDescription}

STILE RICHIESTO: ${targetStyle.type}, colori ${targetStyle.colors.join(', ')}, mood ${targetStyle.mood}
ETÀ TARGET: ${targetAge.min}-${targetAge.max} anni

Dammi:
1. Valutazione generale (1-10)
2. Cosa funziona bene
3. Cosa migliorare
4. Suggerimenti specifici`,
    },
  ];

  return chatWithPino(messages);
}

/**
 * Generate character sheet for consistency
 */
export async function generateCharacterSheet(
  character: Character,
  style: IllustrationStyle
): Promise<{ success: boolean; sheet?: string; prompts?: string[]; error?: string }> {
  const request = `Crea una scheda personaggio per mantenere consistenza visiva:

PERSONAGGIO: ${character.name}
DESCRIZIONE: ${character.description}
TRATTI VISIVI: ${character.visualTraits.join(', ')}
STILE: ${style.type}

Genera:
1. Descrizione visiva dettagliata
2. 3 prompt per viste diverse (fronte, profilo, 3/4)
3. Note per mantenere consistenza`;

  const messages: Message[] = [{ role: 'user', content: request }];
  return chatWithPino(messages, { style });
}

/**
 * Basic prompt generator without API
 */
function generateBasicPrompt(
  scene: string,
  style: IllustrationStyle,
  ageRange: { min: number; max: number }
): string {
  const styleMap: Record<string, string> = {
    watercolor: 'soft watercolor illustration',
    cartoon: 'cute cartoon style illustration',
    realistic: 'gentle realistic children\'s book illustration',
    minimal: 'minimalist children\'s book illustration',
    collage: 'paper collage style children\'s book illustration',
  };

  const ageStyle = ageRange.max <= 5
    ? 'very simple shapes, bold primary colors, large friendly characters'
    : ageRange.max <= 8
      ? 'clear details, warm colors, expressive characters, dynamic scene'
      : 'more complex composition, nuanced colors, atmospheric lighting';

  return `${styleMap[style.type] || 'children\'s book illustration'}, ${scene}, ${style.colors.join(' and ')} color palette, ${style.mood} mood, ${ageStyle}, safe for children, no scary elements, professional quality, award-winning children\'s book art`;
}

/**
 * Intelligent fallback responses - generates real content
 */
function getPinoFallbackResponse(messages: Message[], context?: any): string {
  const lastMessage = messages[messages.length - 1]?.content.toLowerCase() || '';
  const allMessages = messages.map(m => m.content.toLowerCase()).join(' ');

  // Detect context
  const wantsSalmo = allMessages.includes('salmo') || allMessages.includes('pastore') ||
                     allMessages.includes('pecorelle') || context?.bookTitle?.includes('Salmo');
  const wantsAI = allMessages.includes('aiko') || allMessages.includes('robot') ||
                  context?.bookTitle?.includes('AI');

  // Detect if user wants ALL illustrations
  const wantsAll = lastMessage.includes('tutto') || lastMessage.includes('tutte') ||
                   lastMessage.includes('completo') || lastMessage.includes('intero') ||
                   lastMessage.includes('genera') || lastMessage.includes('crea') ||
                   lastMessage.length > 200; // Long message = probably full book text

  // Welcome message - be proactive!
  if (messages.length <= 1) {
    if (context?.bookTitle?.includes('Salmo')) {
      return `🎨 **Ciao! Sono Pina Pennello!**

Vedo che stai lavorando su **"${context.bookTitle}"**!

Ho già in mente lo stile perfetto: **acquerello morbido** con colori pastello - verde prato, azzurro cielo, oro caldo.

**Vuoi che generi TUTTE le illustrazioni adesso?**

Dimmi:
- "**Genera tutto**" → Creo tutti i prompt (6 capitoli + copertina)
- "**Illustra capitolo 1**" → Inizio dal primo`;
    }

    if (context?.bookTitle?.includes('AI')) {
      return `🎨 **Ciao! Sono Pina Pennello!**

Vedo che stai lavorando su **"${context.bookTitle}"**!

Ho già progettato AIKO: un robottino rotondo con occhi azzurri luminosi e sorriso LED!

**Vuoi che generi TUTTE le illustrazioni adesso?**

Dimmi:
- "**Genera tutto**" → Creo tutti i prompt (8 capitoli + copertina)
- "**Illustra capitolo 1**" → Inizio dal primo`;
    }

    return `🎨 **Ciao! Sono Pina Pennello!**

${context?.bookTitle ? `Vedo che lavori su **"${context.bookTitle}"**. Dimmi "genera tutto" e creo tutte le illustrazioni!` : 'Dimmi quale libro vuoi illustrare!'}`;
  }

  // USER WANTS ALL SALMO 23 ILLUSTRATIONS
  if (wantsSalmo && (wantsAll || allMessages.includes('salmo'))) {
    return generateAllSalmoIllustrations();
  }

  // USER WANTS ALL AI BOOK ILLUSTRATIONS
  if (wantsAI && wantsAll) {
    return generateAllAIIllustrations();
  }

  // Single illustration Capitolo 1 Salmo 23
  if ((lastMessage.includes('capitolo 1') || lastMessage.includes('cap. 1') || lastMessage.includes('primo')) &&
      (context?.bookTitle?.includes('Salmo') || lastMessage.includes('salmo') || lastMessage.includes('pastore'))) {
    return `🎨 **Illustrazione: Il Signore è il mio pastore**

Ho analizzato la scena e creato il prompt perfetto!

---

**Composizione:**
- Primo piano: pecorelle morbide e bianche
- Centro: pastore gentile con sguardo amorevole
- Sfondo: prato verde con colline dolci
- Luce: golden hour, calda e avvolgente

**Emozione:** Sicurezza, amore, pace

---

\`\`\`prompt
A heartwarming children's book illustration in soft watercolor style. A kind shepherd with warm brown eyes and a gentle smile stands in a lush green meadow during golden hour. He wears a simple beige tunic and holds a wooden staff. Around him, fluffy white sheep with sweet faces graze peacefully. In the foreground, diverse children of different ethnicities play happily among the sheep - one hugging a lamb, another picking wildflowers. Soft rolling hills in the background under a pastel blue sky with cotton candy clouds. The lighting is warm and golden, creating a sense of safety and love. Style: award-winning children's book illustration, gentle watercolor, peaceful and comforting atmosphere. No dark shadows, everything feels safe and bright.
\`\`\`

---

**Negative prompt:** scary, dark, realistic, photographic, shadows, night, sad, lonely

**Formato consigliato:** 1024x1024 (quadrato per pagina interna)

Vuoi che crei il prompt per il Capitolo 2?`;
  }

  // Copertina Salmo 23
  if (lastMessage.includes('copertina') && (context?.bookTitle?.includes('Salmo') || lastMessage.includes('salmo'))) {
    return `🎨 **Copertina: Il Salmo 23 per Bambini**

La copertina deve catturare l'attenzione e trasmettere subito il messaggio del libro!

---

**Composizione:**
- Centro: pastore con bambino in braccio
- Intorno: pecorelle che guardano verso lo spettatore
- Spazio in alto per il titolo
- Bordo decorativo con fiori e farfalle

---

\`\`\`prompt
Children's book cover illustration in warm watercolor style. A loving shepherd holds a young child gently in his arms while fluffy white sheep gather around them in a beautiful green meadow. The shepherd has a kind, protective expression. Diverse children of different ethnicities peek out from behind the sheep, all smiling. Soft pastel flowers border the scene. Golden sunlight creates a heavenly glow. Space at top for title text. Style: professional children's book cover, heartwarming, inviting, safe feeling. Colors: soft greens, warm golds, sky blue, gentle pink accents. Award-winning illustration quality.
\`\`\`

---

**Formato:** 1792x1024 (copertina ebook KDP)

Vuoi che prepari anche le illustrazioni interne?`;
  }

  // Illustrazioni per AI Book
  if ((lastMessage.includes('capitolo 1') || lastMessage.includes('aiko')) &&
      (context?.bookTitle?.includes('AI') || lastMessage.includes('robot'))) {
    return `🎨 **Illustrazione: Ciao, sono AIKO!**

Creiamo il nostro robot protagonista!

---

**AIKO - Design:**
- Corpo: rotondo e amichevole, altezza bambino
- Occhi: grandi, luminosi, azzurro elettrico
- Sorriso: LED che formano un sorriso dolce
- Antenne: due piccole antenne simpatiche
- Colore: bianco con dettagli azzurri e arancioni

---

\`\`\`prompt
A cheerful children's book illustration in vibrant cartoon style. A cute, friendly robot named AIKO emerges from a cardboard box in a colorful kids' bedroom. AIKO is small and round with big glowing blue eyes, a sweet LED smile, and two tiny antennae. The robot is white with blue and orange accents. Two excited children watch: a 7-year-old boy with round glasses and messy brown hair wearing a planet t-shirt, and a 5-year-old girl with blonde pigtails in a flowery dress. The room is bright and playful with toys scattered around. Warm lighting, joyful atmosphere. Style: modern cartoon illustration for children's book, Pixar-inspired, cute and friendly characters.
\`\`\`

---

**Palette AIKO:** #FFFFFF (bianco), #00B4D8 (azzurro), #FF6B35 (arancione), #FFE66D (giallo accento)

Vuoi che crei la scheda personaggio completa di AIKO?`;
  }

  // Prompt generico
  if (lastMessage.includes('prompt') || lastMessage.includes('illustra') || lastMessage.includes('disegna') || lastMessage.includes('crea')) {
    return `🎨 **Creiamo questa illustrazione!**

Per creare il prompt perfetto, dimmi:

1. **Quale scena?** (es. "il pastore con le pecorelle", "AIKO che gioca")
2. **Quale capitolo?** (es. "capitolo 1", "copertina")
3. **Quale libro?** (Salmo 23 o AI Spiegata ai Bambini)

Oppure descrivi liberamente la scena e creo il prompt ottimizzato!

**Esempio:** "Crea l'illustrazione per il capitolo 1 del Salmo 23"`;
  }

  // Stili per età
  if (lastMessage.includes('stile') || lastMessage.includes('consiglio') || lastMessage.includes('età')) {
    return `🎨 **Guida agli Stili per Età**

---

**👶 3-5 anni:**
- Stile: Cartoon semplice, forme rotonde
- Colori: Primari vivaci (rosso, giallo, blu)
- Personaggi: Grandi teste, occhi enormi, sorrisi ampi
- Sfondi: Semplici, pochi elementi, niente confusione

**🧒 6-8 anni:**
- Stile: Acquerello o cartoon dettagliato
- Colori: Palette più ricca, pastelli + accenti
- Personaggi: Espressivi, proporzioni più realistiche
- Sfondi: Scene ricche ma leggibili, dettagli da scoprire

**👦 9-12 anni:**
- Stile: Digitale o acquerello sofisticato
- Colori: Sfumature, atmosfere, chiaroscuro leggero
- Personaggi: Anatomia corretta, emozioni complesse
- Sfondi: Ambienti dettagliati con profondità

---

Per il **Salmo 23 (4-8 anni):** Consiglio acquerello morbido con colori pastello.
Per **AI Book (6-8 anni):** Consiglio cartoon moderno stile Pixar.

Quale stile preferisci?`;
  }

  // Scheda personaggio
  if (lastMessage.includes('personaggio') || lastMessage.includes('scheda')) {
    return `🎭 **Scheda Personaggio**

Dimmi quale personaggio vuoi definire:

**Per il Salmo 23:**
- 🧔 Il Pastore
- 🐑 Le Pecorelle
- 👧👦 I Bambini

**Per AI Spiegata ai Bambini:**
- 🤖 AIKO (il robot)
- 👦 Luca (7 anni)
- 👧 Sofia (5 anni)

Oppure descrivi un nuovo personaggio e creo la scheda completa con:
- Design visivo
- Palette colori
- Espressioni tipiche
- Prompt per generarlo`;
  }

  // Palette colori
  if (lastMessage.includes('colori') || lastMessage.includes('palette')) {
    return `🌈 **Palette Colori**

**Salmo 23 - Pace e Serenità:**
- Verde prato: #7CB342
- Azzurro cielo: #81D4FA
- Oro caldo: #FFD54F
- Rosa tenue: #F8BBD9
- Beige naturale: #D7CCC8

**AI Book - Tecnologia Amichevole:**
- Azzurro AIKO: #00B4D8
- Arancione energia: #FF6B35
- Viola tech: #7C4DFF
- Giallo gioia: #FFE66D
- Bianco pulito: #FFFFFF

---

Queste palette sono ottimizzate per:
- Stampa CMYK
- Schermo RGB
- Accessibilità bambini

Vuoi che applichi una palette a un'illustrazione?`;
  }

  // If context suggests a book, just generate all
  if (wantsSalmo) {
    return generateAllSalmoIllustrations();
  }

  if (wantsAI) {
    return generateAllAIIllustrations();
  }

  // Default - be action-oriented
  return `🎨 Sono pronto a illustrare!

${context?.bookTitle ? `Sto lavorando su **"${context.bookTitle}"**.\n\nDimmi **"genera tutto"** e creo tutti i prompt!` : 'Dimmi quale libro vuoi illustrare!'}`;
}

/**
 * Generate ALL Salmo 23 illustrations
 */
function generateAllSalmoIllustrations(): string {
  return `🎨 **ILLUSTRAZIONI COMPLETE - IL SALMO 23 PER BAMBINI**

---

## 🖼️ COPERTINA

\`\`\`prompt
Children's book cover illustration in warm watercolor style. A loving shepherd in a simple beige tunic holds a young lamb gently while fluffy white sheep gather around him in a beautiful green meadow. Diverse children of different ethnicities peek out from behind the sheep, all smiling with joy. Soft pastel flowers (pink, yellow, lavender) border the scene. Golden sunlight creates a heavenly glow. Large space at top for title text. Style: professional children's book cover, heartwarming, inviting, peaceful. Colors: soft greens, warm golds, sky blue, gentle pink. Award-winning illustration quality. No text in image.
\`\`\`
**Formato:** 2560x1600 px (Amazon KDP cover)

---

## 📖 CAPITOLO 1: Il Signore è il mio pastore

\`\`\`prompt
A heartwarming children's book illustration in soft watercolor style. A kind shepherd with warm brown eyes and a gentle smile stands in a lush green meadow during golden hour. He wears a simple beige tunic and holds a wooden staff. Around him, fluffy white sheep with sweet faces graze peacefully. In the foreground, diverse children of different ethnicities play happily among the sheep - one hugging a lamb, another picking wildflowers. Soft rolling hills in the background under a pastel blue sky with cotton candy clouds. The lighting is warm and golden, creating a sense of safety and love. Style: award-winning children's book illustration, gentle watercolor, peaceful atmosphere.
\`\`\`

---

## 📖 CAPITOLO 2: Non mi manca nulla

\`\`\`prompt
Serene watercolor children's book illustration. A peaceful meadow scene with fluffy white sheep resting on soft green grass near a gentle, crystal-clear stream. The water sparkles in the sunlight. Some sheep drink from the calm water. A large, friendly oak tree provides cool shade. Butterflies and small colorful flowers dot the scene. Diverse children lie contentedly on the grass, looking peaceful and happy. Warm afternoon golden light. Colors: fresh greens, clear blues, warm yellows, soft whites. Style: gentle watercolor, comforting, abundant, safe atmosphere.
\`\`\`

---

## 📖 CAPITOLO 3: Mi guida sulla strada giusta

\`\`\`prompt
Warm watercolor children's book illustration of a winding path through a beautiful landscape. A kind shepherd walks ahead on the path, looking back and gently beckoning. Behind him, fluffy white sheep follow trustingly in a happy line. The path winds through green hills dotted with colorful wildflowers. In the distance, a beautiful destination glows with warm light - perhaps a cozy village. Diverse children walk on the path holding hands, looking happy and confident. Soft morning light, pastel colors. The scene conveys trust, guidance, and adventure. Style: gentle watercolor, encouraging, hopeful.
\`\`\`

---

## 📖 CAPITOLO 4: Non ho paura

\`\`\`prompt
Tender watercolor children's book illustration showing beautiful contrast between worry and comfort. On one side, soft grey clouds suggest something uncertain. But in the center and foreground, warm golden light surrounds a protective shepherd holding his staff. Fluffy white sheep are huddled close to him, looking calm and safe. Among the sheep, diverse children peek out with reassured, peaceful expressions. The shepherd's face shows calm strength and protection. The overall mood transitions from uncertainty to complete safety. Warm colors dominate. Style: gentle watercolor, protective, comforting, safe.
\`\`\`

---

## 📖 CAPITOLO 5: Una tavola piena di cose buone

\`\`\`prompt
Joyful watercolor children's book illustration of a beautiful outdoor feast. A long wooden table is set in a sunny garden, covered with a cheerful tablecloth. The table overflows with delicious, colorful foods: bowls of bright fruits (red apples, orange oranges, purple grapes), fresh golden bread, colorful cakes and treats. Diverse children sit around the table, smiling with delight. One child's golden cup is overflowing with juice, sparkling in the sunlight. Flowers, butterflies, and birds surround the scene. Warm, golden afternoon light. Style: celebratory watercolor, abundant, joyful, loving atmosphere.
\`\`\`

---

## 📖 CAPITOLO 6: Per sempre con Dio

\`\`\`prompt
Magical, heartwarming watercolor children's book illustration of a heavenly destination. A beautiful, softly glowing house or garden is shown in the distance, surrounded by warm golden light and gentle clouds. A luminous path made of soft light leads toward it through a flowered meadow. In the foreground, the kind shepherd walks with diverse happy children toward this beautiful place. Some children hold hands, some skip with joy. Fluffy sheep follow happily. The scene is filled with hope, peace, and eternal joy. Luminous colors: soft golds, gentle pinks, heavenly light blues, pure whites. Style: magical watercolor, hopeful, the perfect happy ending.
\`\`\`

---

## 🎨 SPECIFICHE TECNICHE

| Elemento | Specifica |
|----------|-----------|
| Formato interno | 1024x1024 px |
| Formato copertina | 2560x1600 px |
| Stile | Soft watercolor |
| Risoluzione | 300 DPI per stampa |
| Modello | DALL-E 3 |

## 🌈 PALETTE COLORI

- Verde prato: \`#7CB342\`
- Azzurro cielo: \`#81D4FA\`
- Oro caldo: \`#FFD54F\`
- Rosa tenue: \`#F8BBD9\`
- Beige naturale: \`#D7CCC8\`

## ⛔ NEGATIVE PROMPT (per tutti)

\`\`\`
scary, dark, horror, realistic photo, 3d render, shadows, night, sad, lonely, violence, blood, monsters, ugly, deformed, bad anatomy, blurry, low quality
\`\`\`

---

✅ **7 prompt pronti!** (1 copertina + 6 capitoli)

Copia i prompt e usali su DALL-E 3, Midjourney, o il tuo generatore preferito!`;
}

/**
 * Generate ALL AI book illustrations
 */
function generateAllAIIllustrations(): string {
  return `🎨 **ILLUSTRAZIONI COMPLETE - AI SPIEGATA AI BAMBINI**

---

## 🖼️ COPERTINA

\`\`\`prompt
Vibrant children's book cover illustration in modern cartoon style. A cute, friendly robot named AIKO (small, round, white with blue and orange accents, big glowing blue eyes, LED smile) stands in the center with arms open wide. Around AIKO are two happy children: a 7-year-old boy with round glasses and brown messy hair, and a 5-year-old girl with blonde pigtails. They're in a colorful, futuristic but friendly environment with floating screens, stars, and playful tech elements. Large space at top for title. Style: Pixar-inspired, joyful, modern, inviting. Colors: electric blue, friendly orange, white, soft purple accents. No text in image.
\`\`\`
**Formato:** 2560x1600 px (Amazon KDP cover)

---

## 📖 CAPITOLO 1: Ciao, sono AIKO!

\`\`\`prompt
Cheerful children's book illustration in vibrant cartoon style. A cute, friendly robot named AIKO emerges from a cardboard box in a colorful kids' bedroom. AIKO is small and round (about the size of a toddler) with big glowing blue eyes, a sweet LED smile, and two tiny antennae. The robot is white with blue and orange accents. Two excited children watch with wonder: a 7-year-old boy with round glasses and messy brown hair wearing a planet t-shirt, and a 5-year-old girl with blonde pigtails in a flowery dress. The room is bright and playful with toys scattered around. Warm lighting, pure joy atmosphere. Style: Pixar-inspired cartoon, cute characters.
\`\`\`

---

## 📖 CAPITOLO 2: Come fa AIKO a parlare?

\`\`\`prompt
Educational children's book illustration in bright cartoon style. AIKO the friendly robot (round, white, blue eyes, LED smile) displays a colorful holographic screen from its belly. The screen shows playful, simple visualizations of sound waves and words, represented as colorful flowing ribbons. The boy with glasses (Luca, 7) watches fascinated, his finger on his chin thinking. The room has a magical glow from the hologram. Colors: blue holographic light, warm room tones. Style: modern cartoon, educational but fun, Pixar-inspired.
\`\`\`

---

## 📖 CAPITOLO 3: AIKO impara!

\`\`\`prompt
Playful children's book illustration in cartoon style. The little girl Sofia (5, blonde pigtails, flowery dress) holds up a child's drawing of a red apple. AIKO the robot looks at it with a cute confused expression, a small question mark floating above its head, eyes slightly tilted. Then a lightbulb appears as AIKO understands! Show both moments: confusion then understanding. Bright, cheerful classroom or playroom setting with colorful artwork on walls. Style: expressive cartoon, humorous, educational, Pixar-inspired.
\`\`\`

---

## 📖 CAPITOLO 4: I giochi di AIKO

\`\`\`prompt
Joyful children's book illustration in vibrant cartoon style. AIKO the robot plays games with Luca (boy, 7, glasses) and Sofia (girl, 5, pigtails) in a bright playroom. AIKO displays animal pictures on its belly screen while the kids guess excitedly. Floating around them are playful icons: puzzle pieces, question marks, stars. Everyone is laughing and having fun. Toys and games scattered around. Warm, energetic lighting with fun color splashes. Style: dynamic cartoon, playful, Pixar-inspired, lots of movement and joy.
\`\`\`

---

## 📖 CAPITOLO 5: AIKO ci aiuta

\`\`\`prompt
Helpful children's book illustration in cartoon style. Split scene: On one side, AIKO helps Luca (boy, glasses) with homework - AIKO's screen shows a beautiful butterfly with labeled parts. On the other side, Sofia (girl, pigtails) hugs her found bunny plushie while AIKO looks proud. Both scenes show AIKO being genuinely helpful. Warm afternoon light through a window. Cozy home environment. Style: warm cartoon, helpful, Pixar-inspired, two connected scenes.
\`\`\`

---

## 📖 CAPITOLO 6: Quando AIKO non capisce

\`\`\`prompt
Emotional children's book illustration in sensitive cartoon style. Sofia (girl, 5, pigtails) sits sadly, a small tear on her cheek. AIKO the robot looks at her with confused, caring eyes - question marks float around AIKO's head. In the background or second panel, Luca (boy, 7, glasses) hugs Sofia warmly. AIKO watches and learns, its eyes showing new understanding (small heart appearing). Soft, gentle lighting. The mood is tender and learning. Style: emotional cartoon, sensitive, Pixar-inspired, touching moment.
\`\`\`

---

## 📖 CAPITOLO 7: Tu e AIKO

\`\`\`prompt
Thoughtful children's book illustration in cartoon style. AIKO the robot and the two children (Luca with glasses, Sofia with pigtails) face each other in a moment of connection. Above AIKO float symbols of what robots can do: calculator, memory chip, books. Above the children float symbols of what humans can do: heart, paintbrush, friends holding hands, dream cloud. The two sets of symbols are connected by a gentle bridge of light. Warm, meaningful atmosphere. Style: symbolic but simple cartoon, Pixar-inspired, meaningful.
\`\`\`

---

## 📖 CAPITOLO 8: Il futuro con AIKO

\`\`\`prompt
Dreamy children's book illustration in magical cartoon style. Evening scene: Luca (boy, glasses), Sofia (girl, pigtails), and AIKO the robot sit together on a grassy hill, looking up at a beautiful starry sky. In the stars, subtle outlines suggest a bright future: children and robots working together, flying cars, green cities, happy scenes. AIKO's eyes reflect the stars. The children lean against AIKO contentedly. Magical twilight colors: deep purples, warm oranges of sunset, twinkling stars. Style: dreamy cartoon, hopeful, Pixar-inspired, perfect ending.
\`\`\`

---

## 🤖 SCHEDA PERSONAGGIO: AIKO

| Elemento | Descrizione |
|----------|-------------|
| Forma | Rotondo, altezza bambino piccolo |
| Corpo | Bianco lucido |
| Occhi | Grandi, luminosi azzurro elettrico (#00B4D8) |
| Sorriso | LED arancione (#FF6B35) |
| Antenne | Due piccole, simpatiche |
| Accenti | Arancione e azzurro |
| Espressioni | Felice, confuso, premuroso, curioso |

## 🎨 PALETTE COLORI

- Azzurro AIKO: \`#00B4D8\`
- Arancione energia: \`#FF6B35\`
- Viola tech: \`#7C4DFF\`
- Giallo gioia: \`#FFE66D\`
- Bianco pulito: \`#FFFFFF\`

## ⛔ NEGATIVE PROMPT (per tutti)

\`\`\`
scary, dark, horror, realistic, photographic, creepy robot, red eyes, evil, violence, weapons, ugly, deformed, blurry, low quality
\`\`\`

---

✅ **9 prompt pronti!** (1 copertina + 8 capitoli + scheda personaggio)

Copia i prompt e usali su DALL-E 3 o Midjourney!`;
}
