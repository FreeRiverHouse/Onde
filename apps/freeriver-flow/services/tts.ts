/**
 * Text-to-Speech Service for FreeRiver Flow
 *
 * Supporta due provider:
 * 1. expo-speech (built-in, gratuito)
 * 2. ElevenLabs API (qualita' migliore, richiede API key)
 */

import * as Speech from 'expo-speech';
import { Audio } from 'expo-av';

// ============================================
// TYPES
// ============================================

export type TTSProvider = 'expo-speech' | 'elevenlabs';

export type TTSStatus = 'idle' | 'speaking' | 'loading' | 'error';

export interface TTSOptions {
  provider?: TTSProvider;
  // Expo Speech options
  language?: string;
  pitch?: number;
  rate?: number;
  // ElevenLabs options
  voiceId?: string;
  modelId?: string;
  stability?: number;
  similarityBoost?: number;
}

export interface TTSConfig {
  defaultProvider: TTSProvider;
  elevenLabsApiKey?: string;
  defaultVoiceId?: string;
  defaultLanguage?: string;
}

// ============================================
// CONSTANTS
// ============================================

// ElevenLabs default voices (alcune voci popolari)
export const ELEVENLABS_VOICES = {
  // Voci multilingua
  RACHEL: 'EXAVITQu4vr4xnSDxMaL', // Rachel - voce femminile calda
  ADAM: 'IKne3meq5aSn9XLyUdCD', // Adam - voce maschile
  DOMI: 'AZnzlk1XvdvUeBnXmlld', // Domi - voce femminile giovane
  ELLI: 'MF3mGyEYCl7XYWbV9V6O', // Elli - voce femminile
  JOSH: 'TxGEqnHWrfWFTfGW9XjX', // Josh - voce maschile profonda
  ARNOLD: 'VR6AewLTigWG4xSOukaG', // Arnold - voce maschile caratteristica
  // Voci italiane (se disponibili)
  ITALIAN_FEMALE: 'pqHfZKP75CvOlQylNhV4', // Esempio - verifica su ElevenLabs
  ITALIAN_MALE: '21m00Tcm4TlvDq8ikWAM', // Esempio - verifica su ElevenLabs
} as const;

export const ELEVENLABS_MODELS = {
  MULTILINGUAL_V2: 'eleven_multilingual_v2', // Migliore per italiano
  TURBO_V2: 'eleven_turbo_v2', // Piu veloce
  MONOLINGUAL_V1: 'eleven_monolingual_v1', // Solo inglese
} as const;

// ============================================
// TTS SERVICE CLASS
// ============================================

class TTSService {
  private config: TTSConfig = {
    defaultProvider: 'expo-speech',
    defaultLanguage: 'it-IT',
  };

  private sound: Audio.Sound | null = null;
  private currentStatus: TTSStatus = 'idle';
  private statusListeners: Set<(status: TTSStatus) => void> = new Set();

  // ----------------------------------------
  // Configuration
  // ----------------------------------------

  /**
   * Configura il servizio TTS
   */
  configure(config: Partial<TTSConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Imposta API key per ElevenLabs
   */
  setElevenLabsApiKey(apiKey: string): void {
    this.config.elevenLabsApiKey = apiKey;
  }

  /**
   * Ottiene la configurazione corrente
   */
  getConfig(): TTSConfig {
    return { ...this.config };
  }

  // ----------------------------------------
  // Status Management
  // ----------------------------------------

  /**
   * Ottiene lo stato corrente
   */
  getStatus(): TTSStatus {
    return this.currentStatus;
  }

  /**
   * Sottoscrive ai cambiamenti di stato
   */
  onStatusChange(listener: (status: TTSStatus) => void): () => void {
    this.statusListeners.add(listener);
    return () => this.statusListeners.delete(listener);
  }

  private setStatus(status: TTSStatus): void {
    this.currentStatus = status;
    this.statusListeners.forEach(listener => listener(status));
  }

  // ----------------------------------------
  // Main TTS Methods
  // ----------------------------------------

  /**
   * Parla il testo usando il provider configurato
   */
  async speak(text: string, options: TTSOptions = {}): Promise<void> {
    const provider = options.provider || this.config.defaultProvider;

    if (provider === 'elevenlabs') {
      return this.speakWithElevenLabs(text, options);
    } else {
      return this.speakWithExpoSpeech(text, options);
    }
  }

  /**
   * Interrompe la riproduzione corrente
   */
  async stop(): Promise<void> {
    // Stop expo-speech
    await Speech.stop();

    // Stop audio (ElevenLabs)
    if (this.sound) {
      await this.sound.stopAsync();
      await this.sound.unloadAsync();
      this.sound = null;
    }

    this.setStatus('idle');
  }

  /**
   * Mette in pausa (solo ElevenLabs)
   */
  async pause(): Promise<void> {
    if (this.sound) {
      await this.sound.pauseAsync();
    }
    // expo-speech non supporta pause, solo stop
  }

  /**
   * Riprende (solo ElevenLabs)
   */
  async resume(): Promise<void> {
    if (this.sound) {
      await this.sound.playAsync();
      this.setStatus('speaking');
    }
  }

  /**
   * Verifica se sta parlando
   */
  isSpeaking(): boolean {
    return this.currentStatus === 'speaking';
  }

  // ----------------------------------------
  // Expo Speech Provider
  // ----------------------------------------

  private async speakWithExpoSpeech(text: string, options: TTSOptions): Promise<void> {
    return new Promise((resolve, reject) => {
      this.setStatus('speaking');

      Speech.speak(text, {
        language: options.language || this.config.defaultLanguage || 'it-IT',
        pitch: options.pitch ?? 1.0,
        rate: options.rate ?? 0.9, // Leggermente piu lento per chiarezza
        onStart: () => {
          this.setStatus('speaking');
        },
        onDone: () => {
          this.setStatus('idle');
          resolve();
        },
        onStopped: () => {
          this.setStatus('idle');
          resolve();
        },
        onError: (error) => {
          this.setStatus('error');
          reject(new Error(`Expo Speech error: ${error}`));
        },
      });
    });
  }

  /**
   * Ottiene le voci disponibili per expo-speech
   */
  async getAvailableVoices(): Promise<Speech.Voice[]> {
    return Speech.getAvailableVoicesAsync();
  }

  // ----------------------------------------
  // ElevenLabs Provider
  // ----------------------------------------

  private async speakWithElevenLabs(text: string, options: TTSOptions): Promise<void> {
    if (!this.config.elevenLabsApiKey) {
      throw new Error('ElevenLabs API key non configurata. Usa tts.setElevenLabsApiKey(key)');
    }

    try {
      this.setStatus('loading');

      const voiceId = options.voiceId || this.config.defaultVoiceId || ELEVENLABS_VOICES.RACHEL;
      const modelId = options.modelId || ELEVENLABS_MODELS.MULTILINGUAL_V2;

      const response = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
        {
          method: 'POST',
          headers: {
            'Accept': 'audio/mpeg',
            'Content-Type': 'application/json',
            'xi-api-key': this.config.elevenLabsApiKey,
          },
          body: JSON.stringify({
            text,
            model_id: modelId,
            voice_settings: {
              stability: options.stability ?? 0.5,
              similarity_boost: options.similarityBoost ?? 0.75,
            },
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`ElevenLabs API error: ${response.status} - ${errorText}`);
      }

      // Converti response in blob e poi in URI
      const audioBlob = await response.blob();
      const audioUri = await this.blobToBase64Uri(audioBlob);

      // Riproduci audio
      await this.playAudio(audioUri);

    } catch (error) {
      this.setStatus('error');
      throw error;
    }
  }

  private async blobToBase64Uri(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  private async playAudio(uri: string): Promise<void> {
    // Configura audio mode
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
      shouldDuckAndroid: true,
    });

    // Scarica e prepara suono
    const { sound } = await Audio.Sound.createAsync(
      { uri },
      { shouldPlay: true }
    );

    this.sound = sound;
    this.setStatus('speaking');

    // Ascolta completamento
    sound.setOnPlaybackStatusUpdate((status) => {
      if (status.isLoaded && status.didJustFinish) {
        this.setStatus('idle');
        sound.unloadAsync();
        this.sound = null;
      }
    });
  }

  // ----------------------------------------
  // Utility Methods
  // ----------------------------------------

  /**
   * Suddivide testo lungo in chunks per evitare timeout
   */
  splitTextIntoChunks(text: string, maxLength: number = 500): string[] {
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
    const chunks: string[] = [];
    let currentChunk = '';

    for (const sentence of sentences) {
      if (currentChunk.length + sentence.length > maxLength) {
        if (currentChunk) chunks.push(currentChunk.trim());
        currentChunk = sentence;
      } else {
        currentChunk += sentence;
      }
    }

    if (currentChunk) chunks.push(currentChunk.trim());
    return chunks;
  }

  /**
   * Parla testo lungo dividendolo in parti
   */
  async speakLong(text: string, options: TTSOptions = {}): Promise<void> {
    const chunks = this.splitTextIntoChunks(text);

    for (const chunk of chunks) {
      // Check if stopped
      if (this.currentStatus === 'idle') break;
      await this.speak(chunk, options);
    }
  }
}

// ============================================
// SINGLETON EXPORT
// ============================================

export const tts = new TTSService();

// Export anche la classe per casi speciali
export { TTSService };
