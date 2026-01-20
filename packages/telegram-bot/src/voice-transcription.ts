/**
 * Voice Transcription Module
 *
 * Trascrive messaggi vocali Telegram usando OpenAI Whisper API.
 * Supporta italiano e inglese con rilevamento automatico.
 */

import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';

// OpenAI Whisper API endpoint
const WHISPER_API_URL = 'https://api.openai.com/v1/audio/transcriptions';

export interface TranscriptionResult {
  success: boolean;
  text?: string;
  language?: string;
  duration?: number;
  error?: string;
}

/**
 * Scarica un file audio da Telegram
 */
export async function downloadAudioFile(fileUrl: string, localPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(localPath);
    https.get(fileUrl, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(localPath, () => {});
      reject(err);
    });
  });
}

/**
 * Trascrive un file audio usando OpenAI Whisper API
 *
 * @param audioPath - Path al file audio (ogg, mp3, m4a, wav, webm)
 * @param language - Lingua (opzionale): 'it' per italiano, 'en' per inglese, undefined per auto-detect
 */
export async function transcribeAudio(
  audioPath: string,
  language?: 'it' | 'en'
): Promise<TranscriptionResult> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return {
      success: false,
      error: 'OPENAI_API_KEY non configurata. Aggiungi la chiave al .env'
    };
  }

  if (!fs.existsSync(audioPath)) {
    return {
      success: false,
      error: `File audio non trovato: ${audioPath}`
    };
  }

  try {
    // Leggi il file audio
    const audioData = fs.readFileSync(audioPath);
    const fileName = path.basename(audioPath);

    // Prepara il form data manualmente (no dipendenze extra)
    const boundary = '----FormBoundary' + Math.random().toString(36).substring(2);

    let formBody = '';

    // Campo model
    formBody += `--${boundary}\r\n`;
    formBody += 'Content-Disposition: form-data; name="model"\r\n\r\n';
    formBody += 'whisper-1\r\n';

    // Campo language (se specificato)
    if (language) {
      formBody += `--${boundary}\r\n`;
      formBody += 'Content-Disposition: form-data; name="language"\r\n\r\n';
      formBody += `${language}\r\n`;
    }

    // Campo response_format
    formBody += `--${boundary}\r\n`;
    formBody += 'Content-Disposition: form-data; name="response_format"\r\n\r\n';
    formBody += 'verbose_json\r\n';

    // Campo file (binary)
    const fileHeader = `--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="${fileName}"\r\nContent-Type: audio/ogg\r\n\r\n`;
    const fileFooter = `\r\n--${boundary}--\r\n`;

    // Combina tutto in un buffer
    const headerBuffer = Buffer.from(formBody + fileHeader, 'utf-8');
    const footerBuffer = Buffer.from(fileFooter, 'utf-8');
    const requestBody = Buffer.concat([headerBuffer, audioData, footerBuffer]);

    // Fai la richiesta HTTP
    const response = await new Promise<any>((resolve, reject) => {
      const url = new URL(WHISPER_API_URL);
      const options = {
        hostname: url.hostname,
        path: url.pathname,
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': `multipart/form-data; boundary=${boundary}`,
          'Content-Length': requestBody.length,
        },
      };

      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            if (res.statusCode === 200) {
              resolve(parsed);
            } else {
              reject(new Error(parsed.error?.message || `HTTP ${res.statusCode}: ${data}`));
            }
          } catch (e) {
            reject(new Error(`Risposta non valida: ${data}`));
          }
        });
      });

      req.on('error', reject);
      req.write(requestBody);
      req.end();
    });

    return {
      success: true,
      text: response.text?.trim(),
      language: response.language,
      duration: response.duration,
    };

  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Errore durante la trascrizione'
    };
  }
}

/**
 * Determina la lingua in base al testo o contesto
 */
export function detectLanguageHint(text?: string): 'it' | 'en' | undefined {
  if (!text) return undefined;

  const lower = text.toLowerCase();

  // Pattern italiani
  const italianPatterns = [
    /\b(che|per|con|non|sono|come|questo|quello|della|delle)\b/,
    /\b(posta|scrivi|manda|fai|vai)\b/,
  ];

  // Pattern inglesi
  const englishPatterns = [
    /\b(the|and|for|with|this|that|from|have|are)\b/,
    /\b(post|write|send|make|go)\b/,
  ];

  const italianScore = italianPatterns.filter(p => p.test(lower)).length;
  const englishScore = englishPatterns.filter(p => p.test(lower)).length;

  if (italianScore > englishScore) return 'it';
  if (englishScore > italianScore) return 'en';
  return undefined;
}

/**
 * Pulisce il file audio temporaneo
 */
export function cleanupAudioFile(audioPath: string): void {
  try {
    if (fs.existsSync(audioPath)) {
      fs.unlinkSync(audioPath);
    }
  } catch (e) {
    // Ignora errori di cleanup
  }
}

/**
 * Controlla se Whisper API è disponibile
 */
export function isWhisperAvailable(): boolean {
  return !!process.env.OPENAI_API_KEY;
}
