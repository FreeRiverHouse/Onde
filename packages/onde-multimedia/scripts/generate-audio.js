#!/usr/bin/env node
/**
 * Onde Podcast - Audio Generator
 *
 * Genera audio da script usando ElevenLabs
 *
 * Uso:
 *   node generate-audio.js --script episode-01.md --voice gianni
 *
 * Richiede:
 *   ELEVENLABS_API_KEY nel .env
 */

const fs = require('fs');
const path = require('path');

// Voice IDs da configurare in ElevenLabs
const VOICES = {
  gianni: process.env.ELEVENLABS_VOICE_GIANNI || 'YOUR_GIANNI_VOICE_ID',
  pina: process.env.ELEVENLABS_VOICE_PINA || 'YOUR_PINA_VOICE_ID'
};

async function main() {
  const args = process.argv.slice(2);
  const scriptIndex = args.indexOf('--script');
  const voiceIndex = args.indexOf('--voice');

  if (scriptIndex === -1) {
    console.log('Uso: node generate-audio.js --script <file.md> --voice <gianni|pina>');
    console.log('\nEsempio:');
    console.log('  node generate-audio.js --script episode-01-stella-stellina.md --voice gianni');
    process.exit(1);
  }

  const scriptFile = args[scriptIndex + 1];
  const voice = voiceIndex !== -1 ? args[voiceIndex + 1] : 'gianni';

  console.log(`\n🎙️  Onde Podcast Audio Generator`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`Script: ${scriptFile}`);
  console.log(`Voice: ${voice}`);
  console.log(`Voice ID: ${VOICES[voice]}`);

  // Leggi script
  const scriptPath = path.join(__dirname, scriptFile);
  if (!fs.existsSync(scriptPath)) {
    console.error(`\n❌ Script non trovato: ${scriptPath}`);
    process.exit(1);
  }

  const content = fs.readFileSync(scriptPath, 'utf-8');

  // Estrai solo le parti di GIANNI/PINA (rimuovi metadata e istruzioni)
  const textToSpeak = extractSpeakableText(content);

  console.log(`\n📝 Testo da leggere (${textToSpeak.length} caratteri):`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(textToSpeak.substring(0, 200) + '...');

  // TODO: Integrazione ElevenLabs
  console.log(`\n⚠️  ElevenLabs integration coming soon!`);
  console.log(`Per ora: copia il testo su ElevenLabs manualmente.`);
  console.log(`\nTesto completo salvato in: /tmp/onde-podcast-text.txt`);

  fs.writeFileSync('/tmp/onde-podcast-text.txt', textToSpeak);
}

function extractSpeakableText(markdown) {
  // Rimuovi metadata (tutto prima di ## Script)
  const scriptStart = markdown.indexOf('## Script');
  if (scriptStart === -1) return markdown;

  let text = markdown.substring(scriptStart);

  // Rimuovi headers markdown
  text = text.replace(/^#+\s+.+$/gm, '');

  // Rimuovi istruzioni tra *[...]*
  text = text.replace(/\*\[.*?\]\*/g, '');

  // Rimuovi **GIANNI**: e **PINA**:
  text = text.replace(/\*\*[A-Z]+\*\*:\s*/g, '');

  // Rimuovi linee vuote multiple
  text = text.replace(/\n{3,}/g, '\n\n');

  // Rimuovi sezione Note Produzione
  const notesStart = text.indexOf('## Note Produzione');
  if (notesStart !== -1) {
    text = text.substring(0, notesStart);
  }

  return text.trim();
}

main().catch(console.error);
