/**
 * Line-by-Line Translator - Procedura Traduzione BOMBA
 * 
 * Traduce testi EN→IT (e altre lingue) riga per riga per massima precisione.
 * Backend: Claude (oggi) → Local LLM (domani con Radeon)
 * 
 * Features:
 * - Traduzione riga per riga (non blocchi)
 * - Preserva nomi propri, termini tecnici
 * - Glossario personalizzabile
 * - Batch processing con rate limiting
 * - Quality check automatico
 * - Fallback se una riga fallisce
 */

export interface TranslationOptions {
  sourceLang?: string;
  targetLang?: string;
  glossary?: Record<string, string>;  // Termini da NON tradurre o tradurre in modo specifico
  preserveNames?: boolean;            // Preserva nomi propri
  style?: 'formal' | 'casual' | 'literary' | 'children';
  batchSize?: number;                 // Righe per batch (per rate limiting)
  onProgress?: (current: number, total: number) => void;
}

export interface TranslationResult {
  original: string;
  translated: string;
  lineCount: number;
  errors: Array<{ line: number; error: string }>;
  glossaryUsed: string[];
}

export interface LLMBackend {
  translate(text: string, systemPrompt: string): Promise<string>;
}

// Claude backend (default per stasera)
export class ClaudeBackend implements LLMBackend {
  async translate(text: string, systemPrompt: string): Promise<string> {
    // Usa Claude CLI via subprocess
    const { exec } = await import('child_process');
    const { promisify } = await import('util');
    const execAsync = promisify(exec);
    
    const prompt = `${systemPrompt}\n\nTesto da tradurre:\n${text}`;
    const escaped = prompt.replace(/'/g, "'\\''");
    
    try {
      const { stdout } = await execAsync(
        `echo '${escaped}' | claude --print -m haiku`,
        { maxBuffer: 1024 * 1024, timeout: 30000 }
      );
      return stdout.trim();
    } catch (error) {
      console.error('Claude translation error:', error);
      throw error;
    }
  }
}

// Ollama backend (per domani con Radeon)
export class OllamaBackend implements LLMBackend {
  private model: string;
  
  constructor(model: string = 'qwen2.5:7b') {
    this.model = model;
  }
  
  async translate(text: string, systemPrompt: string): Promise<string> {
    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: this.model,
        prompt: `${systemPrompt}\n\nTesto da tradurre:\n${text}`,
        stream: false,
        options: { temperature: 0.3 }
      })
    });
    
    if (!response.ok) {
      throw new Error(`Ollama error: ${response.status}`);
    }
    
    const data = await response.json() as { response: string };
    return data.response.trim();
  }
}

// System prompts per stile
const STYLE_PROMPTS: Record<string, string> = {
  formal: `Sei un traduttore professionale. Traduci con tono formale e preciso.
Mantieni la struttura delle frasi. Non aggiungere o rimuovere contenuto.`,
  
  casual: `Sei un traduttore. Traduci con tono naturale e colloquiale.
Il testo deve suonare fluido in italiano.`,
  
  literary: `Sei un traduttore letterario esperto. Traduci preservando:
- Ritmo e musicalità del testo
- Figure retoriche e metafore
- Tono emotivo dell'originale
Priorità alla bellezza della lingua italiana.`,
  
  children: `Sei un traduttore per libri per bambini (5-8 anni).
- Linguaggio SEMPLICE e chiaro
- Frasi corte
- Parole concrete, non astratte
- Tono caldo e rassicurante`
};

export class LineByLineTranslator {
  private backend: LLMBackend;
  private defaultOptions: TranslationOptions = {
    sourceLang: 'inglese',
    targetLang: 'italiano',
    preserveNames: true,
    style: 'literary',
    batchSize: 5
  };
  
  constructor(backend?: LLMBackend) {
    this.backend = backend || new ClaudeBackend();
  }
  
  /**
   * Traduce un testo completo riga per riga
   */
  async translate(
    text: string,
    options: TranslationOptions = {}
  ): Promise<TranslationResult> {
    const opts = { ...this.defaultOptions, ...options };
    const lines = text.split('\n');
    const translatedLines: string[] = [];
    const errors: Array<{ line: number; error: string }> = [];
    const glossaryUsed: string[] = [];
    
    // Costruisci system prompt
    const systemPrompt = this.buildSystemPrompt(opts);
    
    // Traduci in batch per efficienza
    const batches = this.chunkArray(lines, opts.batchSize || 5);
    let processedLines = 0;
    
    for (const batch of batches) {
      const batchResults = await Promise.all(
        batch.map(async (line, batchIndex) => {
          const lineNumber = processedLines + batchIndex;
          
          // Skip righe vuote
          if (!line.trim()) {
            return { line: '', lineNumber };
          }
          
          // Applica glossario pre-traduzione
          let processedLine = line;
          if (opts.glossary) {
            for (const [term, replacement] of Object.entries(opts.glossary)) {
              if (processedLine.includes(term)) {
                processedLine = processedLine.replace(
                  new RegExp(term, 'gi'),
                  `__GLOSSARY_${term}__`
                );
                if (!glossaryUsed.includes(term)) {
                  glossaryUsed.push(term);
                }
              }
            }
          }
          
          try {
            let translated = await this.backend.translate(processedLine, systemPrompt);
            
            // Ripristina termini glossario
            if (opts.glossary) {
              for (const [term, replacement] of Object.entries(opts.glossary)) {
                translated = translated.replace(
                  new RegExp(`__GLOSSARY_${term}__`, 'gi'),
                  replacement || term
                );
              }
            }
            
            return { line: translated, lineNumber };
          } catch (error) {
            errors.push({
              line: lineNumber,
              error: error instanceof Error ? error.message : 'Unknown error'
            });
            // Fallback: mantieni originale
            return { line: `[UNTRANSLATED] ${line}`, lineNumber };
          }
        })
      );
      
      for (const result of batchResults) {
        translatedLines[result.lineNumber] = result.line;
      }
      
      processedLines += batch.length;
      
      if (opts.onProgress) {
        opts.onProgress(processedLines, lines.length);
      }
      
      // Rate limiting - pausa tra batch
      if (batches.indexOf(batch) < batches.length - 1) {
        await this.sleep(500);
      }
    }
    
    return {
      original: text,
      translated: translatedLines.join('\n'),
      lineCount: lines.length,
      errors,
      glossaryUsed
    };
  }
  
  /**
   * Traduce un singolo paragrafo (per test veloci)
   */
  async translateParagraph(
    text: string,
    options: TranslationOptions = {}
  ): Promise<string> {
    const opts = { ...this.defaultOptions, ...options };
    const systemPrompt = this.buildSystemPrompt(opts);
    return this.backend.translate(text, systemPrompt);
  }
  
  /**
   * Quality check: confronta lunghezza e struttura
   */
  qualityCheck(original: string, translated: string): {
    passed: boolean;
    warnings: string[];
  } {
    const warnings: string[] = [];
    
    const origLines = original.split('\n').filter(l => l.trim());
    const transLines = translated.split('\n').filter(l => l.trim());
    
    // Check numero righe
    if (origLines.length !== transLines.length) {
      warnings.push(
        `Numero righe diverso: originale ${origLines.length}, tradotto ${transLines.length}`
      );
    }
    
    // Check lunghezza media (italiano tende a essere 10-20% più lungo)
    const origLen = original.length;
    const transLen = translated.length;
    const ratio = transLen / origLen;
    
    if (ratio < 0.8) {
      warnings.push(`Traduzione troppo corta (${Math.round(ratio * 100)}% dell'originale)`);
    }
    if (ratio > 1.5) {
      warnings.push(`Traduzione troppo lunga (${Math.round(ratio * 100)}% dell'originale)`);
    }
    
    // Check [UNTRANSLATED] markers
    const untranslated = (translated.match(/\[UNTRANSLATED\]/g) || []).length;
    if (untranslated > 0) {
      warnings.push(`${untranslated} righe non tradotte`);
    }
    
    return {
      passed: warnings.length === 0,
      warnings
    };
  }
  
  private buildSystemPrompt(opts: TranslationOptions): string {
    const stylePrompt = STYLE_PROMPTS[opts.style || 'literary'];
    
    let prompt = `${stylePrompt}

Traduci da ${opts.sourceLang} a ${opts.targetLang}.

REGOLE ASSOLUTE:
1. Traduci SOLO il testo, non aggiungere commenti
2. Mantieni la formattazione (newline, spazi)
3. NON tradurre i termini tecnici/brand marcati con __GLOSSARY_xxx__`;

    if (opts.preserveNames) {
      prompt += `
4. Preserva i nomi propri di persona e luogo nell'originale`;
    }
    
    if (opts.glossary && Object.keys(opts.glossary).length > 0) {
      prompt += `

GLOSSARIO (usa queste traduzioni specifiche):
${Object.entries(opts.glossary)
  .map(([en, it]) => `- "${en}" → "${it}"`)
  .join('\n')}`;
    }
    
    prompt += `

Rispondi SOLO con la traduzione, nient'altro.`;
    
    return prompt;
  }
  
  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }
  
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Glossario default Onde (termini da preservare/tradurre specificamente)
export const ONDE_GLOSSARY: Record<string, string> = {
  'Onde': 'Onde',           // Brand - non tradurre
  'FreeRiver': 'FreeRiver', // Brand
  'Emilio': 'Emilio',       // Personaggio
  'Moonlight': 'Moonlight', // Personaggio
  'mindfulness': 'mindfulness', // Termine tecnico
  'stoic': 'stoico',
  'stoicism': 'stoicismo',
};

// Export singleton per uso rapido
let defaultTranslator: LineByLineTranslator | null = null;

export function getTranslator(): LineByLineTranslator {
  if (!defaultTranslator) {
    defaultTranslator = new LineByLineTranslator();
  }
  return defaultTranslator;
}

export default LineByLineTranslator;
