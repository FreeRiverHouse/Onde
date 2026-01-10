/**
 * useTTS Hook - React Native Hook per Text-to-Speech
 *
 * Features:
 * - Gestione coda di messaggi
 * - Interruzione riproduzione
 * - Stato: idle | speaking | loading | error
 * - Supporto expo-speech e ElevenLabs
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { tts, TTSStatus, TTSOptions, TTSProvider } from '../services/tts';

// ============================================
// TYPES
// ============================================

export interface UseTTSOptions {
  /** Provider da usare (default: expo-speech) */
  provider?: TTSProvider;
  /** Lingua per expo-speech (default: it-IT) */
  language?: string;
  /** Voice ID per ElevenLabs */
  voiceId?: string;
  /** Auto-play quando si aggiunge alla coda (default: true) */
  autoPlay?: boolean;
  /** Callback quando inizia a parlare */
  onStart?: () => void;
  /** Callback quando finisce di parlare */
  onEnd?: () => void;
  /** Callback su errore */
  onError?: (error: Error) => void;
}

export interface QueueItem {
  id: string;
  text: string;
  options?: TTSOptions;
}

export interface UseTTSReturn {
  /** Stato corrente: idle | speaking | loading | error */
  status: TTSStatus;
  /** Se sta parlando */
  isSpeaking: boolean;
  /** Se sta caricando (ElevenLabs) */
  isLoading: boolean;
  /** Coda di messaggi */
  queue: QueueItem[];
  /** Messaggio corrente in riproduzione */
  currentMessage: QueueItem | null;

  // Actions
  /** Parla un testo (aggiunge alla coda se gia in riproduzione) */
  speak: (text: string, options?: TTSOptions) => void;
  /** Parla immediatamente interrompendo tutto */
  speakNow: (text: string, options?: TTSOptions) => Promise<void>;
  /** Ferma tutto e svuota la coda */
  stop: () => Promise<void>;
  /** Ferma solo il messaggio corrente, passa al prossimo */
  skip: () => Promise<void>;
  /** Svuota la coda senza fermare il corrente */
  clearQueue: () => void;
  /** Mette in pausa (solo ElevenLabs) */
  pause: () => Promise<void>;
  /** Riprende (solo ElevenLabs) */
  resume: () => Promise<void>;
}

// ============================================
// HOOK IMPLEMENTATION
// ============================================

export function useTTS(hookOptions: UseTTSOptions = {}): UseTTSReturn {
  const {
    provider = 'expo-speech',
    language = 'it-IT',
    voiceId,
    autoPlay = true,
    onStart,
    onEnd,
    onError,
  } = hookOptions;

  // State
  const [status, setStatus] = useState<TTSStatus>('idle');
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [currentMessage, setCurrentMessage] = useState<QueueItem | null>(null);

  // Refs
  const isProcessingRef = useRef(false);
  const queueRef = useRef<QueueItem[]>([]);

  // Keep queueRef in sync
  useEffect(() => {
    queueRef.current = queue;
  }, [queue]);

  // Subscribe to TTS status changes
  useEffect(() => {
    const unsubscribe = tts.onStatusChange((newStatus) => {
      setStatus(newStatus);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // ----------------------------------------
  // Queue Processing
  // ----------------------------------------

  const processQueue = useCallback(async () => {
    if (isProcessingRef.current) return;
    if (queueRef.current.length === 0) {
      setCurrentMessage(null);
      onEnd?.();
      return;
    }

    isProcessingRef.current = true;
    const nextItem = queueRef.current[0];

    // Remove from queue
    setQueue((prev) => prev.slice(1));
    setCurrentMessage(nextItem);

    try {
      onStart?.();

      await tts.speak(nextItem.text, {
        provider,
        language,
        voiceId,
        ...nextItem.options,
      });

    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      onError?.(err);
      console.error('[useTTS] Error:', err.message);
    } finally {
      isProcessingRef.current = false;
      // Process next item
      processQueue();
    }
  }, [provider, language, voiceId, onStart, onEnd, onError]);

  // Auto-process queue when items are added
  useEffect(() => {
    if (autoPlay && queue.length > 0 && !isProcessingRef.current && status === 'idle') {
      processQueue();
    }
  }, [queue, autoPlay, status, processQueue]);

  // ----------------------------------------
  // Actions
  // ----------------------------------------

  /**
   * Aggiunge testo alla coda (o parla subito se coda vuota)
   */
  const speak = useCallback((text: string, options?: TTSOptions) => {
    if (!text.trim()) return;

    const item: QueueItem = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      text: text.trim(),
      options,
    };

    setQueue((prev) => [...prev, item]);
  }, []);

  /**
   * Parla immediatamente, interrompendo tutto
   */
  const speakNow = useCallback(async (text: string, options?: TTSOptions) => {
    if (!text.trim()) return;

    // Stop current and clear queue
    await tts.stop();
    setQueue([]);
    isProcessingRef.current = false;

    const item: QueueItem = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      text: text.trim(),
      options,
    };

    setCurrentMessage(item);
    isProcessingRef.current = true;

    try {
      onStart?.();
      await tts.speak(item.text, {
        provider,
        language,
        voiceId,
        ...options,
      });
      onEnd?.();
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      onError?.(err);
    } finally {
      isProcessingRef.current = false;
      setCurrentMessage(null);
    }
  }, [provider, language, voiceId, onStart, onEnd, onError]);

  /**
   * Ferma tutto e svuota la coda
   */
  const stop = useCallback(async () => {
    await tts.stop();
    setQueue([]);
    setCurrentMessage(null);
    isProcessingRef.current = false;
  }, []);

  /**
   * Salta il messaggio corrente, passa al prossimo
   */
  const skip = useCallback(async () => {
    await tts.stop();
    isProcessingRef.current = false;
    // processQueue verra chiamato automaticamente
    processQueue();
  }, [processQueue]);

  /**
   * Svuota la coda senza fermare il corrente
   */
  const clearQueue = useCallback(() => {
    setQueue([]);
  }, []);

  /**
   * Mette in pausa (solo ElevenLabs)
   */
  const pause = useCallback(async () => {
    await tts.pause();
  }, []);

  /**
   * Riprende la riproduzione (solo ElevenLabs)
   */
  const resume = useCallback(async () => {
    await tts.resume();
  }, []);

  // ----------------------------------------
  // Return
  // ----------------------------------------

  return {
    status,
    isSpeaking: status === 'speaking',
    isLoading: status === 'loading',
    queue,
    currentMessage,
    speak,
    speakNow,
    stop,
    skip,
    clearQueue,
    pause,
    resume,
  };
}

// ============================================
// CONVENIENCE HOOKS
// ============================================

/**
 * Hook semplificato per usare solo expo-speech
 */
export function useExpoSpeech(options: Omit<UseTTSOptions, 'provider'> = {}) {
  return useTTS({ ...options, provider: 'expo-speech' });
}

/**
 * Hook semplificato per usare solo ElevenLabs
 */
export function useElevenLabs(options: Omit<UseTTSOptions, 'provider'> = {}) {
  return useTTS({ ...options, provider: 'elevenlabs' });
}

// Export di default
export default useTTS;
