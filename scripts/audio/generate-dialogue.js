/**
 * generate-dialogue.js
 *
 * Genera audio multi-voce per dialoghi AIKO usando ElevenLabs API.
 *
 * Usage:
 *   node generate-dialogue.js <script-file.txt> <output-dir>
 *
 * Script format:
 *   [NARRATOR]: It was a sunny day.
 *   [SOFIA]: "Wow, that's amazing!"
 *   [AIKO]: "Let me explain, Sofia."
 *
 * Requires:
 *   - ELEVENLABS_API_KEY in .env
 *   - Voice IDs configured in .env
 */

require('dotenv').config({ path: '/Users/mattia/Projects/Onde/.env' });
const fs = require('fs');
const path = require('path');

// Voice configuration
const VOICES = {
  narrator: {
    id: process.env.ELEVENLABS_VOICE_NARRATOR || 'EXAVITQu4vr4xnSDxMaL', // Default: Rachel
    settings: { stability: 0.50, similarity_boost: 0.75, style: 0.30 }
  },
  sofia: {
    id: process.env.ELEVENLABS_VOICE_SOFIA || 'XB0fDUnXU5powFXDhCwa', // Default: Charlotte
    settings: { stability: 0.45, similarity_boost: 0.80, style: 0.35 }
  },
  aiko: {
    id: process.env.ELEVENLABS_VOICE_AIKO || 'onwK4e9ZLuTAKqWW03F9', // Default: Daniel
    settings: { stability: 0.65, similarity_boost: 0.85, style: 0.20 }
  },
  mom: {
    id: process.env.ELEVENLABS_VOICE_MOM || 'EXAVITQu4vr4xnSDxMaL', // Default: Rachel
    settings: { stability: 0.55, similarity_boost: 0.75, style: 0.30 }
  },
  grandma: {
    id: process.env.ELEVENLABS_VOICE_GRANDMA || 'ThT5KcBeYPX3keUQqHPh', // Default: Dorothy
    settings: { stability: 0.60, similarity_boost: 0.75, style: 0.35 }
  },
  robotaxi: {
    id: process.env.ELEVENLABS_VOICE_ROBOTAXI || 'TxGEqnHWrfWFTfGW9XjX', // Default: Josh
    settings: { stability: 0.70, similarity_boost: 0.80, style: 0.15 }
  }
};

const API_KEY = process.env.ELEVENLABS_API_KEY;

if (!API_KEY) {
  console.error('ERROR: ELEVENLABS_API_KEY not found in .env');
  console.log('\nAdd to /Users/mattia/Projects/Onde/.env:');
  console.log('ELEVENLABS_API_KEY=your_api_key_here');
  process.exit(1);
}

/**
 * Parse script file into dialogue segments
 */
function parseScript(content) {
  const lines = content.split('\n').filter(line => line.trim());
  const segments = [];

  const regex = /^\[([A-Z]+)\]:\s*(.+)$/;

  for (const line of lines) {
    const match = line.match(regex);
    if (match) {
      const character = match[1].toLowerCase();
      let text = match[2].trim();

      // Remove surrounding quotes if present
      if (text.startsWith('"') && text.endsWith('"')) {
        text = text.slice(1, -1);
      }

      if (VOICES[character]) {
        segments.push({ character, text });
      } else {
        console.warn(`Warning: Unknown character "${character}", using narrator`);
        segments.push({ character: 'narrator', text });
      }
    }
  }

  return segments;
}

/**
 * Generate audio for a single segment using ElevenLabs API
 */
async function generateAudio(segment, outputPath) {
  const voice = VOICES[segment.character];

  const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice.id}`, {
    method: 'POST',
    headers: {
      'Accept': 'audio/mpeg',
      'Content-Type': 'application/json',
      'xi-api-key': API_KEY
    },
    body: JSON.stringify({
      text: segment.text,
      model_id: 'eleven_monolingual_v1',
      voice_settings: voice.settings
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`ElevenLabs API error: ${response.status} - ${error}`);
  }

  const buffer = await response.arrayBuffer();
  fs.writeFileSync(outputPath, Buffer.from(buffer));

  return outputPath;
}

/**
 * Main function
 */
async function main() {
  const args = process.argv.slice(2);

  if (args.length < 2) {
    console.log('Usage: node generate-dialogue.js <script-file.txt> <output-dir>');
    console.log('\nScript format:');
    console.log('  [NARRATOR]: It was a sunny day.');
    console.log('  [SOFIA]: "Wow, that\'s amazing!"');
    console.log('  [AIKO]: "Let me explain, Sofia."');
    console.log('\nSupported characters: narrator, sofia, aiko, mom, grandma, robotaxi');
    process.exit(1);
  }

  const scriptFile = args[0];
  const outputDir = args[1];

  if (!fs.existsSync(scriptFile)) {
    console.error(`ERROR: Script file not found: ${scriptFile}`);
    process.exit(1);
  }

  // Create output directory
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Parse script
  const content = fs.readFileSync(scriptFile, 'utf-8');
  const segments = parseScript(content);

  console.log(`Found ${segments.length} dialogue segments`);
  console.log('');

  // Generate audio for each segment
  const outputs = [];

  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i];
    const filename = `${String(i + 1).padStart(3, '0')}_${segment.character}.mp3`;
    const outputPath = path.join(outputDir, filename);

    console.log(`[${i + 1}/${segments.length}] ${segment.character.toUpperCase()}: "${segment.text.substring(0, 50)}..."`);

    try {
      await generateAudio(segment, outputPath);
      outputs.push(outputPath);
      console.log(`  ✓ Saved: ${filename}`);
    } catch (error) {
      console.error(`  ✗ Error: ${error.message}`);
    }

    // Rate limiting - wait 500ms between requests
    if (i < segments.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  console.log('');
  console.log(`Generated ${outputs.length}/${segments.length} audio files`);
  console.log(`Output directory: ${outputDir}`);

  // Create concatenation list for ffmpeg
  const listPath = path.join(outputDir, 'concat.txt');
  const listContent = outputs.map(p => `file '${path.basename(p)}'`).join('\n');
  fs.writeFileSync(listPath, listContent);

  console.log('');
  console.log('To concatenate all files:');
  console.log(`  cd ${outputDir}`);
  console.log('  ffmpeg -f concat -safe 0 -i concat.txt -c copy output.mp3');
}

main().catch(console.error);
