/**
 * Whisper Speech-to-Text Service
 *
 * Converte l'audio registrato in testo usando OpenAI Whisper API
 */

import * as FileSystem from 'expo-file-system';

const WHISPER_API_URL = 'https://api.openai.com/v1/audio/transcriptions';

interface TranscriptionResult {
  text: string;
  language?: string;
  duration?: number;
}

interface WhisperConfig {
  apiKey: string;
  model?: string;
  language?: string;
}

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
   */
  async transcribe(audioUri: string): Promise<TranscriptionResult> {
    try {
      // Read audio file as base64
      const audioBase64 = await FileSystem.readAsStringAsync(audioUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Create form data
      const formData = new FormData();
      formData.append('file', {
        uri: audioUri,
        type: 'audio/m4a',
        name: 'recording.m4a',
      } as unknown as Blob);
      formData.append('model', this.model);
      formData.append('language', this.language);
      formData.append('response_format', 'json');

      // Send to Whisper API
      const response = await fetch(WHISPER_API_URL, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Whisper API error: ${error}`);
      }

      const result = await response.json();

      return {
        text: result.text,
        language: result.language,
        duration: result.duration,
      };
    } catch (error) {
      console.error('Transcription error:', error);
      throw error;
    }
  }

  /**
   * Validates audio file before transcription
   */
  async validateAudioFile(audioUri: string): Promise<boolean> {
    try {
      const fileInfo = await FileSystem.getInfoAsync(audioUri);
      if (!fileInfo.exists) {
        return false;
      }

      // Check file size (max 25MB for Whisper)
      if ('size' in fileInfo && fileInfo.size && fileInfo.size > 25 * 1024 * 1024) {
        console.warn('Audio file too large for Whisper API');
        return false;
      }

      return true;
    } catch {
      return false;
    }
  }
}

// Default instance (requires API key to be set)
let whisperInstance: WhisperService | null = null;

export function initWhisper(apiKey: string): WhisperService {
  whisperInstance = new WhisperService({ apiKey });
  return whisperInstance;
}

export function getWhisper(): WhisperService {
  if (!whisperInstance) {
    throw new Error('Whisper service not initialized. Call initWhisper first.');
  }
  return whisperInstance;
}
