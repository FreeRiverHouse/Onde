/**
 * Whisper Speech-to-Text Service
 *
 * Converte l'audio registrato in testo usando OpenAI Whisper API.
 *
 * Funzionalita':
 * 1. Prende l'audio registrato (URI del file)
 * 2. Lo manda a OpenAI Whisper API
 * 3. Ritorna il testo trascritto
 */

import * as FileSystem from 'expo-file-system';

const WHISPER_API_URL = 'https://api.openai.com/v1/audio/transcriptions';

export interface TranscriptionResult {
  success: boolean;
  text: string;
  language?: string;
  duration?: number;
  error?: string;
}

export interface WhisperConfig {
  apiKey: string;
  model?: string;
  language?: string;
}

/**
 * WhisperService class for speech-to-text transcription
 */
export class WhisperService {
  private apiKey: string;
  private model: string;
  private language: string;

  constructor(config: WhisperConfig) {
    this.apiKey = config.apiKey;
    this.model = config.model || 'whisper-1';
    this.language = config.language || 'it';
  }

  /**
   * Transcribes audio file to text
   * @param audioUri - URI of the audio file (from expo-av recording)
   * @returns TranscriptionResult with text or error
   */
  async transcribe(audioUri: string): Promise<TranscriptionResult> {
    try {
      // Validate file exists
      const isValid = await this.validateAudioFile(audioUri);
      if (!isValid) {
        return {
          success: false,
          text: '',
          error: 'File audio non valido o non trovato',
        };
      }

      // Create form data for multipart upload
      const formData = new FormData();

      // Append the audio file
      // React Native FormData accepts this format
      formData.append('file', {
        uri: audioUri,
        type: 'audio/m4a',
        name: 'recording.m4a',
      } as unknown as Blob);

      formData.append('model', this.model);
      formData.append('language', this.language);
      formData.append('response_format', 'json');

      console.log('[Whisper] Sending audio to API...');

      // Send to Whisper API
      const response = await fetch(WHISPER_API_URL, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          // Note: Don't set Content-Type for FormData, browser/RN will set it with boundary
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `HTTP ${response.status}`;

        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.error?.message || errorMessage;
        } catch {
          errorMessage = errorText || errorMessage;
        }

        console.error('[Whisper] API error:', errorMessage);
        return {
          success: false,
          text: '',
          error: `Whisper API error: ${errorMessage}`,
        };
      }

      const result = await response.json();

      console.log('[Whisper] Transcription complete:', result.text?.substring(0, 50) + '...');

      return {
        success: true,
        text: result.text || '',
        language: result.language,
        duration: result.duration,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Errore sconosciuto';
      console.error('[Whisper] Transcription error:', errorMessage);

      return {
        success: false,
        text: '',
        error: errorMessage,
      };
    }
  }

  /**
   * Validates audio file before transcription
   * @param audioUri - URI of the audio file
   * @returns true if file is valid, false otherwise
   */
  async validateAudioFile(audioUri: string): Promise<boolean> {
    try {
      const fileInfo = await FileSystem.getInfoAsync(audioUri);

      if (!fileInfo.exists) {
        console.warn('[Whisper] Audio file does not exist:', audioUri);
        return false;
      }

      // Check file size (max 25MB for Whisper API)
      if ('size' in fileInfo && fileInfo.size) {
        const maxSize = 25 * 1024 * 1024; // 25MB
        if (fileInfo.size > maxSize) {
          console.warn('[Whisper] Audio file too large:', fileInfo.size, 'bytes');
          return false;
        }

        // Also warn if file is too small (might be empty)
        if (fileInfo.size < 100) {
          console.warn('[Whisper] Audio file too small:', fileInfo.size, 'bytes');
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error('[Whisper] Error validating audio file:', error);
      return false;
    }
  }
}

// ============================================================================
// Singleton instance management
// ============================================================================

let whisperInstance: WhisperService | null = null;

/**
 * Initialize the Whisper service with API key
 * Must be called before using transcribeAudio()
 */
export function initWhisper(apiKey: string, language: string = 'it'): WhisperService {
  whisperInstance = new WhisperService({ apiKey, language });
  console.log('[Whisper] Service initialized');
  return whisperInstance;
}

/**
 * Get the initialized Whisper service instance
 * @throws Error if service not initialized
 */
export function getWhisper(): WhisperService {
  if (!whisperInstance) {
    throw new Error(
      'Whisper service not initialized. Call initWhisper(apiKey) first.'
    );
  }
  return whisperInstance;
}

/**
 * Check if Whisper service is initialized
 */
export function isWhisperInitialized(): boolean {
  return whisperInstance !== null;
}

// ============================================================================
// Convenience functions
// ============================================================================

/**
 * Simple function to transcribe audio
 * This is the main function to use from the app.
 *
 * @param audioUri - URI of the recorded audio file
 * @returns TranscriptionResult with text or error
 *
 * @example
 * ```typescript
 * // Initialize once at app startup
 * initWhisper(OPENAI_API_KEY);
 *
 * // Use in component
 * const result = await transcribeAudio(audioUri);
 * if (result.success) {
 *   console.log('Transcribed:', result.text);
 * } else {
 *   console.error('Error:', result.error);
 * }
 * ```
 */
export async function transcribeAudio(audioUri: string): Promise<TranscriptionResult> {
  const service = getWhisper();
  return service.transcribe(audioUri);
}

/**
 * Transcribe audio with custom API key (without using singleton)
 * Useful for one-off transcriptions or when managing multiple API keys
 */
export async function transcribeAudioWithKey(
  audioUri: string,
  apiKey: string,
  language: string = 'it'
): Promise<TranscriptionResult> {
  const service = new WhisperService({ apiKey, language });
  return service.transcribe(audioUri);
}

// Default export
export default {
  WhisperService,
  initWhisper,
  getWhisper,
  isWhisperInitialized,
  transcribeAudio,
  transcribeAudioWithKey,
};
