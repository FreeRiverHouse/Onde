'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useReaderStore } from '@/store/readerStore';

interface TextToSpeechProps {
  text: string;
  isOpen: boolean;
  onClose: () => void;
  onSentenceChange?: (sentenceIndex: number, sentence: string) => void;
  onPageComplete?: () => void;
}

export function TextToSpeech({ text, isOpen, onClose, onSentenceChange, onPageComplete }: TextToSpeechProps) {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [currentVoice, setCurrentVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);
  const [sentences, setSentences] = useState<string[]>([]);
  const [waitingForNextPage, setWaitingForNextPage] = useState(false);
  
  // Use persisted TTS settings from store
  const { ttsSettings, updateTtsSettings } = useReaderStore();
  const isAutoPageEnabled = ttsSettings.autoPageTurn;
  
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const shouldAutoContinueRef = useRef(false);
  const isPlayingRef = useRef(false);

  // Keep isPlayingRef in sync
  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  // Load available voices and restore saved voice
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    synthRef.current = window.speechSynthesis;
    
    const loadVoices = () => {
      const availableVoices = synthRef.current?.getVoices() || [];
      setVoices(availableVoices);
      
      // Restore saved voice by name, or fallback to default English voice
      if (availableVoices.length > 0) {
        const savedVoice = ttsSettings.voiceName 
          ? availableVoices.find((v) => v.name === ttsSettings.voiceName)
          : null;
        
        if (savedVoice) {
          setCurrentVoice(savedVoice);
        } else if (!currentVoice) {
          // Set default voice (prefer local English voices)
          const englishVoice = availableVoices.find(
            (v) => v.lang.startsWith('en') && v.localService
          ) || availableVoices[0];
          setCurrentVoice(englishVoice);
          updateTtsSettings({ voiceName: englishVoice.name });
        }
      }
    };

    loadVoices();
    synthRef.current?.addEventListener('voiceschanged', loadVoices);
    
    return () => {
      synthRef.current?.removeEventListener('voiceschanged', loadVoices);
    };
  }, [ttsSettings.voiceName, updateTtsSettings]);

  // Speak a sentence
  const speakSentence = useCallback((index: number) => {
    if (!synthRef.current || index >= sentences.length) {
      // Finished all sentences on this page
      if (isAutoPageEnabled && onPageComplete && isPlayingRef.current) {
        // Request next page and wait for new text
        setWaitingForNextPage(true);
        onPageComplete();
      } else {
        setIsPlaying(false);
        setIsPaused(false);
      }
      return;
    }

    const sentence = sentences[index];
    const utterance = new SpeechSynthesisUtterance(sentence);
    
    if (currentVoice) utterance.voice = currentVoice;
    utterance.rate = ttsSettings.rate;
    utterance.pitch = ttsSettings.pitch;
    utterance.volume = ttsSettings.volume;

    utterance.onstart = () => {
      setCurrentSentenceIndex(index);
      onSentenceChange?.(index, sentence);
    };

    utterance.onend = () => {
      // Auto-advance to next sentence
      if (isPlayingRef.current && !isPaused) {
        speakSentence(index + 1);
      }
    };

    utterance.onerror = (event) => {
      console.error('TTS Error:', event);
      setIsPlaying(false);
    };

    utteranceRef.current = utterance;
    synthRef.current.speak(utterance);
  }, [sentences, currentVoice, ttsSettings.rate, ttsSettings.pitch, ttsSettings.volume, isPaused, onSentenceChange, isAutoPageEnabled, onPageComplete]);

  // Split text into sentences
  useEffect(() => {
    if (text) {
      // Split on sentence-ending punctuation followed by space or end
      const splitSentences = text
        .split(/(?<=[.!?])\s+/)
        .filter((s) => s.trim().length > 0);
      setSentences(splitSentences);
      
      // Auto-continue from page turn
      if (waitingForNextPage && splitSentences.length > 0) {
        setWaitingForNextPage(false);
        setCurrentSentenceIndex(0);
        shouldAutoContinueRef.current = true;
      }
    }
  }, [text, waitingForNextPage]);

  // Auto-continue after page turn (when sentences update)
  useEffect(() => {
    if (shouldAutoContinueRef.current && sentences.length > 0 && isPlaying && synthRef.current) {
      shouldAutoContinueRef.current = false;
      // Small delay to let state settle
      const timer = setTimeout(() => {
        speakSentence(0);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [sentences, isPlaying, speakSentence]);

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
          updateTtsSettings({ rate: Math.min(ttsSettings.rate + 0.1, 2.0) });
          break;
        case 'ArrowDown': // Decrease speed
          e.preventDefault();
          updateTtsSettings({ rate: Math.max(ttsSettings.rate - 0.1, 0.5) });
          break;
        case 'm':
        case 'M': // Mute/unmute
          e.preventDefault();
          updateTtsSettings({ volume: ttsSettings.volume > 0 ? 0 : 1.0 });
          break;
        case '1': // Speed preset: Slow (0.75x)
          e.preventDefault();
          updateTtsSettings({ rate: 0.75 });
          break;
        case '2': // Speed preset: Normal (1.0x)
          e.preventDefault();
          updateTtsSettings({ rate: 1.0 });
          break;
        case '3': // Speed preset: Fast (1.5x)
          e.preventDefault();
          updateTtsSettings({ rate: 1.5 });
          break;
        case '4': // Speed preset: 2x
          e.preventDefault();
          updateTtsSettings({ rate: 2.0 });
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isPlaying, isPaused, play, pause, onClose, skipBackward, skipForward, ttsSettings.rate, ttsSettings.volume, updateTtsSettings]);

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
            disabled={currentSentenceIndex >= sentences.length - 1 && !isAutoPageEnabled}
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
              value={currentVoice?.name || ''}
              onChange={(e) => {
                const voice = voices.find((v) => v.name === e.target.value);
                if (voice) {
                  setCurrentVoice(voice);
                  updateTtsSettings({ voiceName: voice.name });
                }
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

          {/* Speed presets and slider */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Speed: {ttsSettings.rate.toFixed(1)}x
            </label>
            {/* Preset buttons */}
            <div className="flex gap-2 mb-2">
              {[
                { rate: 0.75, emoji: '🐢', label: 'Slow', key: '1' },
                { rate: 1.0, emoji: '▶️', label: 'Normal', key: '2' },
                { rate: 1.5, emoji: '🐇', label: 'Fast', key: '3' },
                { rate: 2.0, emoji: '⚡', label: '2x', key: '4' },
              ].map((preset) => (
                <button
                  key={preset.rate}
                  onClick={() => updateTtsSettings({ rate: preset.rate })}
                  className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-medium transition-colors ${
                    Math.abs(ttsSettings.rate - preset.rate) < 0.05
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300'
                  }`}
                  title={`${preset.label} (${preset.rate}x) - Press ${preset.key}`}
                >
                  <span className="block">{preset.emoji}</span>
                  <span className="block opacity-70">{preset.rate}x</span>
                </button>
              ))}
            </div>
            {/* Fine-tune slider */}
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={ttsSettings.rate}
              onChange={(e) => updateTtsSettings({ rate: parseFloat(e.target.value) })}
              className="w-full accent-blue-500"
            />
          </div>

          {/* Pitch slider */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Pitch: {ttsSettings.pitch.toFixed(1)}
            </label>
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={ttsSettings.pitch}
              onChange={(e) => updateTtsSettings({ pitch: parseFloat(e.target.value) })}
              className="w-full accent-blue-500"
            />
          </div>

          {/* Volume slider */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Volume: {Math.round(ttsSettings.volume * 100)}%
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={ttsSettings.volume}
              onChange={(e) => updateTtsSettings({ volume: parseFloat(e.target.value) })}
              className="w-full accent-blue-500"
            />
          </div>

          {/* Auto page turn toggle */}
          {onPageComplete && (
            <div className="mt-4 flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Auto page turn
              </label>
              <button
                onClick={() => updateTtsSettings({ autoPageTurn: !isAutoPageEnabled })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  isAutoPageEnabled ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    isAutoPageEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          )}
        </div>

        {/* Loading next page indicator */}
        {waitingForNextPage && (
          <div className="px-4 py-2 bg-blue-50 dark:bg-blue-900/30 text-center text-sm text-blue-600 dark:text-blue-400 border-t border-blue-200 dark:border-blue-800">
            <span className="animate-pulse">📖 Loading next page...</span>
          </div>
        )}

        {/* Keyboard shortcuts hint */}
        <div className="px-4 py-2 text-center text-xs text-gray-500 border-t border-gray-200 dark:border-gray-700">
          <div className="flex flex-wrap justify-center gap-x-3 gap-y-1">
            <span><kbd className="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded">Space</kbd> Play/Pause</span>
            <span><kbd className="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded">←</kbd><kbd className="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded">→</kbd> Prev/Next</span>
            <span><kbd className="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded">1</kbd>-<kbd className="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded">4</kbd> Speed</span>
            <span><kbd className="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded">M</kbd> Mute</span>
            <span><kbd className="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded">Esc</kbd> Close</span>
          </div>
        </div>
      </div>
    </div>
  );
}
