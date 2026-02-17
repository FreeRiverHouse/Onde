#!/usr/bin/env npx ts-node
/**
 * translate-book.ts - Script CLI per traduzione libri
 * 
 * Usage:
 *   npx ts-node scripts/translate-book.ts <input-file> [options]
 * 
 * Examples:
 *   npx ts-node scripts/translate-book.ts content/books/meditations.txt --to italiano
 *   npx ts-node scripts/translate-book.ts content/books/psalm23.txt --style children --to spagnolo
 */

import * as fs from 'fs';
import * as path from 'path';
import {
  LineByLineTranslator,
  ClaudeBackend,
  OllamaBackend,
  ONDE_GLOSSARY,
  type TranslationOptions
} from '../packages/core/src/translation/line-by-line-translator';

// Parse CLI args
const args = process.argv.slice(2);
const inputFile = args[0];

if (!inputFile) {
  console.log(`
📚 Onde Book Translator - Traduzione Riga per Riga

Usage:
  npx ts-node scripts/translate-book.ts <input-file> [options]

Options:
  --to <lang>       Lingua target (default: italiano)
  --from <lang>     Lingua source (default: inglese)
  --style <style>   Stile: formal, casual, literary, children (default: literary)
  --backend <name>  Backend: claude, ollama (default: claude)
  --model <model>   Modello Ollama (default: qwen2.5:7b)
  --output <file>   File output (default: <input>.<lang>.txt)
  --glossary <file> JSON con glossario custom

Examples:
  npx ts-node scripts/translate-book.ts book.txt --to italiano
  npx ts-node scripts/translate-book.ts book.txt --style children --to spagnolo
  npx ts-node scripts/translate-book.ts book.txt --backend ollama --model llama3.2
`);
  process.exit(1);
}

// Parse options
function getArg(name: string, defaultValue: string): string {
  const idx = args.indexOf(`--${name}`);
  return idx !== -1 && args[idx + 1] ? args[idx + 1] : defaultValue;
}

const targetLang = getArg('to', 'italiano');
const sourceLang = getArg('from', 'inglese');
const style = getArg('style', 'literary') as 'formal' | 'casual' | 'literary' | 'children';
const backendName = getArg('backend', 'claude');
const ollamaModel = getArg('model', 'qwen2.5:7b');
const outputFile = getArg('output', '');
const glossaryFile = getArg('glossary', '');

async function main() {
  // Verifica input
  if (!fs.existsSync(inputFile)) {
    console.error(`❌ File non trovato: ${inputFile}`);
    process.exit(1);
  }
  
  // Carica testo
  const text = fs.readFileSync(inputFile, 'utf-8');
  const lineCount = text.split('\n').length;
  
  console.log(`
📖 Onde Book Translator
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📄 Input:    ${inputFile}
📝 Righe:    ${lineCount}
🌐 Da:       ${sourceLang} → ${targetLang}
🎨 Stile:    ${style}
🤖 Backend:  ${backendName}${backendName === 'ollama' ? ` (${ollamaModel})` : ''}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);

  // Setup backend
  const backend = backendName === 'ollama' 
    ? new OllamaBackend(ollamaModel)
    : new ClaudeBackend();
  
  const translator = new LineByLineTranslator(backend);
  
  // Carica glossario
  let glossary = { ...ONDE_GLOSSARY };
  if (glossaryFile && fs.existsSync(glossaryFile)) {
    const customGlossary = JSON.parse(fs.readFileSync(glossaryFile, 'utf-8'));
    glossary = { ...glossary, ...customGlossary };
    console.log(`📚 Glossario caricato: ${Object.keys(customGlossary).length} termini`);
  }
  
  // Traduci con progress
  console.log('🔄 Traduzione in corso...\n');
  
  const startTime = Date.now();
  let lastProgress = 0;
  
  const options: TranslationOptions = {
    sourceLang,
    targetLang,
    style,
    glossary,
    preserveNames: true,
    batchSize: 3,
    onProgress: (current, total) => {
      const progress = Math.round((current / total) * 100);
      if (progress !== lastProgress && progress % 10 === 0) {
        const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
        const eta = ((Date.now() - startTime) / current * (total - current) / 1000).toFixed(0);
        console.log(`   ${progress}% (${current}/${total} righe) - ${elapsed}s elapsed, ~${eta}s remaining`);
        lastProgress = progress;
      }
    }
  };
  
  const result = await translator.translate(text, options);
  
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  
  // Quality check
  const quality = translator.qualityCheck(result.original, result.translated);
  
  console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Traduzione completata!

⏱️  Tempo:     ${elapsed}s
📝 Righe:     ${result.lineCount}
❌ Errori:    ${result.errors.length}
📚 Glossario: ${result.glossaryUsed.length} termini usati
`);

  if (!quality.passed) {
    console.log(`⚠️  Quality warnings:`);
    quality.warnings.forEach(w => console.log(`   - ${w}`));
  }
  
  if (result.errors.length > 0) {
    console.log(`\n❌ Errori di traduzione:`);
    result.errors.slice(0, 5).forEach(e => {
      console.log(`   Riga ${e.line}: ${e.error}`);
    });
    if (result.errors.length > 5) {
      console.log(`   ... e altri ${result.errors.length - 5} errori`);
    }
  }
  
  // Salva output
  const outPath = outputFile || inputFile.replace(/(\.[^.]+)$/, `.${targetLang}$1`);
  fs.writeFileSync(outPath, result.translated);
  
  console.log(`
💾 Output salvato: ${outPath}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);
}

main().catch(err => {
  console.error('❌ Errore:', err.message);
  process.exit(1);
});
