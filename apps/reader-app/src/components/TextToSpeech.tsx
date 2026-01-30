'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

export interface TTSSettings {
  voice: SpeechSynthesisVoice | null;
  rate: number; // 0.5-2.0
  pitch: number; // 0.5-2.0
  volume: number; // 0-1
}

interface TextToSpeechProps {
  text: string;
  isOpen: boolean;
  onClose: () => void;
  onSentenceChange?: (sentenceIndex: number, sentence: string) => void;
}

export function TextToSpeech({ text, isOpen, onClose, onSentenceChange }: TextToSpeechProps) {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [settings, setSettings] = useState<TTSSettings>({
    voice: null,
    rate: 1.0,
    pitch: 1.0,
    volume: 1.0,
  });
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);
  const [sentences, setSentences] = useState<string[]>([]);
  
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  // Split text into sentences
  useEffect(() => {
    if (text) {
      // Split on sentence-ending punctuation followed by space or end
      const splitSentences = text
        .split(/(?<=[.!?])\s+/)
        .filter((s) => s.trim().length > 0);
      setSentences(splitSentences);
    }
  }, [text]);

  // Load available voices
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    synthRef.current = window.speechSynthesis;
    
    const loadVoices = () => {
      const availableVoices = synthRef.current?.getVoices() || [];
      setVoices(availableVoices);
      
      // Set default voice (prefer English voices)
      if (availableVoices.length > 0 && !settings.voice) {
        const englishVoice = availableVoices.find(
          (v) => v.lang.startsWith('en') && v.localService
        ) || availableVoices[0];
        setSettings((s) => ({ ...s, voice: englishVoice }));
      }
    };

    loadVoices();
    synthRef.current?.addEventListener('voiceschanged', loadVoices);
    
    return () => {
      synthRef.current?.removeEventListener('voiceschanged', loadVoices);
    };
  }, []);

  // Speak a sentence
  const speakSentence = useCallback((index: number) => {
    if (!synthRef.current || index >= sentences.length) {
      setIsPlaying(false);
      setIsPaused(false);
      return;
    }

    const sentence = sentences[index];
    const utterance = new SpeechSynthesisUtterance(sentence);
    
    if (settings.voice) utterance.voice = settings.voice;
    utterance.rate = settings.rate;
    utterance.pitch = settings.pitch;
    utterance.volume = settings.volume;

    utterance.onstart = () => {
      setCurrentSentenceIndex(index);
      onSentenceChange?.(index, sentence);
    };

    utterance.onend = () => {
      // Auto-advance to next sentence
      if (isPlaying && !isPaused) {
        speakSentence(index + 1);
      }
    };

    utterance.onerror = (event) => {
      console.error('TTS Error:', event);
      setIsPlaying(false);
    };

    utteranceRef.current = utterance;
    synthRef.current.speak(utterance);
  }, [sentences, settings, isPlaying, isPaused, onSentenceChange]);

  // Play/Resume
  const play = useCallback(() => {
    if (!synthRef.current) return;

    if (isPaused) {
      synthRef.current.resume();
      setIsPaused(false);
    } else {
      setIsPlaying(true);
      speakSentence(currentSentenceIndex);
    }
  }, [isPaused, currentSentenceIndex, speakSentence]);

  // Pause
  const pause = useCallback(() => {
    if (synthRef.current) {
      synthRef.current.pause();
      setIsPaused(true);
    }
  }, []);

  // Stop
  const stop = useCallback(() => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsPlaying(false);
      setIsPaused(false);
      setCurrentSentenceIndex(0);
    }
  }, []);

  // Skip forward (next sentence)
  const skipForward = useCallback(() => {
    if (synthRef.current) {
      synthRef.current.cancel();
      const nextIndex = Math.min(currentSentenceIndex + 1, sentences.length - 1);
      setCurrentSentenceIndex(nextIndex);
      if (isPlaying) {
        speakSentence(nextIndex);
      }
    }
  }, [currentSentenceIndex, sentences.length, isPlaying, speakSentence]);

  // Skip backward (previous sentence)
  const skipBackward = useCallback(() => {
    if (synthRef.current) {
      synthRef.current.cancel();
      const prevIndex = Math.max(currentSentenceIndex - 1, 0);
      setCurrentSentenceIndex(prevIndex);
      if (isPlaying) {
        speakSentence(prevIndex);
      }
    }
  }, [currentSentenceIndex, isPlaying, speakSentence]);

  // Skip to specific sentence (exported for future timeline UI)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _skipTo = useCallback((index: number) => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setCurrentSentenceIndex(index);
      if (isPlaying) {
        speakSentence(index);
      }
    }
  }, [isPlaying, speakSentence]);

  // Cleanup on unmount or close
  useEffect(() => {
    if (!isOpen) {
      stop();
    }
    return () => {
      synthRef.current?.cancel();
    };
  }, [isOpen, stop]);

  // Keyboard shortcuts
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't handle if typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement) {
        return;
      }

      switch (e.key) {
        case ' ': // Space - Play/Pause
          e.preventDefault();
          if (isPlaying && !isPaused) {
            pause();
          } else {
            play();
          }
          break;
        case 'Escape': // Close panel
          e.preventDefault();
          onClose();
          break;
        case 'ArrowLeft': // Previous sentence
          e.preventDefault();
          skipBackward();
          break;
        case 'ArrowRight': // Next sentence
          e.preventDefault();
          skipForward();
          break;
        case 'ArrowUp': // Increase speed
          e.preventDefault();
          setSettings((s) => ({ ...s, rate: Math.min(s.rate + 0.1, 2.0) }));
          break;
        case 'ArrowDown': // Decrease speed
          e.preventDefault();
          setSettings((s) => ({ ...s, rate: Math.max(s.rate - 0.1, 0.5) }));
          break;
        case 'm':
        case 'M': // Mute/unmute
          e.preventDefault();
          setSettings((s) => ({ ...s, volume: s.volume > 0 ? 0 : 1.0 }));
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isPlaying, isPaused, play, pause, onClose, skipBackward, skipForward]);

  // Group voices by language
  const groupedVoices = voices.reduce((acc, voice) => {
    const lang = voice.lang.split('-')[0];
    if (!acc[lang]) acc[lang] = [];
    acc[lang].push(voice);
    return acc;
  }, {} as Record<string, SpeechSynthesisVoice[]>);

  if (!isOpen) return null;

  const progress = sentences.length > 0 
    ? ((currentSentenceIndex + 1) / sentences.length) * 100 
    : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-2xl mx-4 mb-4 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <span className="text-xl">🎧</span>
            <h3 className="font-semibold text-gray-900 dark:text-white">Audiobook Mode</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-gray-200 dark:bg-gray-700">
          <div 
            className="h-full bg-blue-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Current sentence display */}
        <div className="px-4 py-4 min-h-[100px] max-h-[200px] overflow-y-auto">
          <p className="text-lg text-gray-800 dark:text-gray-200 leading-relaxed">
            {sentences[currentSentenceIndex] || 'No text to read'}
          </p>
          <p className="mt-2 text-sm text-gray-500">
            Sentence {currentSentenceIndex + 1} of {sentences.length}
          </p>
        </div>

        {/* Playback controls */}
        <div className="flex items-center justify-center gap-4 px-4 py-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={skipBackward}
            disabled={currentSentenceIndex === 0}
            className="p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors disabled:opacity-40"
            title="Previous sentence"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/>
            </svg>
          </button>
          
          <button
            onClick={isPlaying && !isPaused ? pause : play}
            className="p-4 bg-blue-500 hover:bg-blue-600 text-white rounded-full transition-colors shadow-lg"
            title={isPlaying && !isPaused ? 'Pause' : 'Play'}
          >
            {isPlaying && !isPaused ? (
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 4h4v16H6zm8 0h4v16h-4z"/>
              </svg>
            ) : (
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
            )}
          </button>
          
          <button
            onClick={stop}
            disabled={!isPlaying && !isPaused}
            className="p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors disabled:opacity-40"
            title="Stop"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 6h12v12H6z"/>
            </svg>
          </button>
          
          <button
            onClick={skipForward}
            disabled={currentSentenceIndex >= sentences.length - 1}
            className="p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors disabled:opacity-40"
            title="Next sentence"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 18l8.5-6L6 6v12zm8.5-6v6h2V6h-2v6z"/>
            </svg>
          </button>
        </div>

        {/* Settings */}
        <div className="px-4 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          {/* Voice selector */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Voice
            </label>
            <select
              value={settings.voice?.name || ''}
              onChange={(e) => {
                const voice = voices.find((v) => v.name === e.target.value);
                setSettings((s) => ({ ...s, voice: voice || null }));
              }}
              className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm"
            >
              {Object.entries(groupedVoices).map(([lang, langVoices]) => (
                <optgroup key={lang} label={lang.toUpperCase()}>
                  {langVoices.map((voice) => (
                    <option key={voice.name} value={voice.name}>
                      {voice.name} {voice.localService ? '(Local)' : '(Network)'}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>

          {/* Speed and Pitch sliders */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Speed: {settings.rate.toFixed(1)}x
              </label>
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={settings.rate}
                onChange={(e) => setSettings((s) => ({ ...s, rate: parseFloat(e.target.value) }))}
                className="w-full accent-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Pitch: {settings.pitch.toFixed(1)}
              </label>
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={settings.pitch}
                onChange={(e) => setSettings((s) => ({ ...s, pitch: parseFloat(e.target.value) }))}
                className="w-full accent-blue-500"
              />
            </div>
          </div>

          {/* Volume slider */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Volume: {Math.round(settings.volume * 100)}%
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={settings.volume}
              onChange={(e) => setSettings((s) => ({ ...s, volume: parseFloat(e.target.value) }))}
              className="w-full accent-blue-500"
            />
          </div>
        </div>

        {/* Keyboard shortcuts hint */}
        <div className="px-4 py-2 text-center text-xs text-gray-500 border-t border-gray-200 dark:border-gray-700">
          <div className="flex flex-wrap justify-center gap-x-3 gap-y-1">
            <span><kbd className="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded">Space</kbd> Play/Pause</span>
            <span><kbd className="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded">←</kbd><kbd className="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded">→</kbd> Prev/Next</span>
            <span><kbd className="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded">↑</kbd><kbd className="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded">↓</kbd> Speed</span>
            <span><kbd className="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded">M</kbd> Mute</span>
            <span><kbd className="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded">Esc</kbd> Close</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Note: Page text extraction is done directly in EpubReader.tsx via the 'rendered' event
