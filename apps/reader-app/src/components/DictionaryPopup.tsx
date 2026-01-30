'use client';

import { useState, useEffect } from 'react';
import { useReaderStore } from '@/store/readerStore';

interface DictionaryEntry {
  word: string;
  phonetic?: string;
  phonetics?: { text?: string; audio?: string }[];
  meanings: {
    partOfSpeech: string;
    definitions: {
      definition: string;
      example?: string;
      synonyms?: string[];
    }[];
  }[];
}

interface DictionaryPopupProps {
  word: string;
  position: { x: number; y: number };
  cfi?: string;
  bookId?: string;
  onClose: () => void;
  onHighlightWithNote?: (note: string) => void;
}

export function DictionaryPopup({ 
  word, 
  position, 
  cfi,
  bookId,
  onClose, 
  onHighlightWithNote 
}: DictionaryPopupProps) {
  const { addHighlight, addVocabularyWord } = useReaderStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [entry, setEntry] = useState<DictionaryEntry | null>(null);
  const [playingAudio, setPlayingAudio] = useState(false);
  const [saved, setSaved] = useState(false);

  // Clean the word (remove punctuation, lowercase)
  const cleanWord = word.trim().toLowerCase().replace(/[^a-zA-Z'-]/g, '');

  useEffect(() => {
    async function fetchDefinition() {
      if (!cleanWord) {
        setError('Invalid word');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(
          `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(cleanWord)}`
        );
        
        if (!response.ok) {
          if (response.status === 404) {
            setError('Word not found');
          } else {
            setError('Failed to fetch definition');
          }
          setLoading(false);
          return;
        }
        
        const data: DictionaryEntry[] = await response.json();
        if (data && data.length > 0) {
          setEntry(data[0]);
        }
      } catch (err) {
        console.error('Dictionary lookup error:', err);
        setError('Network error');
      } finally {
        setLoading(false);
      }
    }

    fetchDefinition();
  }, [cleanWord]);

  const playPronunciation = () => {
    const audioUrl = entry?.phonetics?.find(p => p.audio)?.audio;
    if (audioUrl) {
      setPlayingAudio(true);
      const audio = new Audio(audioUrl);
      audio.onended = () => setPlayingAudio(false);
      audio.onerror = () => setPlayingAudio(false);
      audio.play().catch(() => setPlayingAudio(false));
    }
  };

  const handleAddToVocabulary = () => {
    if (entry) {
      const firstMeaning = entry.meanings[0]?.definitions[0]?.definition || '';
      addVocabularyWord({
        word: cleanWord,
        definition: firstMeaning,
        phonetic: entry.phonetic || entry.phonetics?.find(p => p.text)?.text,
        bookId,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  const handleSaveAsHighlight = () => {
    if (entry && cfi && bookId) {
      const firstMeaning = entry.meanings[0]?.definitions[0]?.definition || '';
      const note = `📖 ${entry.phonetic || ''}\n${firstMeaning}`;
      
      if (onHighlightWithNote) {
        onHighlightWithNote(note);
      } else {
        addHighlight({
          bookId,
          cfi,
          text: cleanWord,
          color: 'blue',
          note,
        });
        onClose();
      }
    }
  };

  // Calculate popup position
  const menuStyle: React.CSSProperties = {
    left: Math.min(Math.max(position.x - 150, 10), window.innerWidth - 320),
    top: Math.max(position.y + 10, 10),
    maxHeight: window.innerHeight - position.y - 40,
  };

  const phonetic = entry?.phonetic || entry?.phonetics?.find(p => p.text)?.text;
  const hasAudio = entry?.phonetics?.some(p => p.audio);

  return (
    <div 
      className="fixed z-[100] animate-in fade-in slide-in-from-top-2 duration-200"
      style={menuStyle}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 
                      w-[300px] max-w-[calc(100vw-20px)] overflow-hidden">
        {/* Header */}
        <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg font-semibold text-gray-900 dark:text-white capitalize">
                {cleanWord}
              </span>
              {phonetic && (
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {phonetic}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {hasAudio && (
                <button
                  onClick={playPronunciation}
                  disabled={playingAudio}
                  className="p-1.5 hover:bg-white/50 dark:hover:bg-gray-700/50 rounded-full transition-colors"
                  title="Play pronunciation"
                >
                  {playingAudio ? '🔊' : '🔈'}
                </button>
              )}
              <button
                onClick={onClose}
                className="p-1.5 hover:bg-white/50 dark:hover:bg-gray-700/50 rounded-full transition-colors text-gray-500"
              >
                ✕
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 max-h-[300px] overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : error ? (
            <div className="text-center py-6">
              <span className="text-4xl mb-2 block">📚</span>
              <p className="text-gray-500 dark:text-gray-400">{error}</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                Try selecting a different word
              </p>
            </div>
          ) : entry ? (
            <div className="space-y-3">
              {entry.meanings.slice(0, 3).map((meaning, i) => (
                <div key={i}>
                  <span className="inline-block px-2 py-0.5 text-xs font-medium bg-gray-100 dark:bg-gray-700 
                                   text-gray-600 dark:text-gray-300 rounded-full mb-1">
                    {meaning.partOfSpeech}
                  </span>
                  <ol className="list-decimal list-inside space-y-1">
                    {meaning.definitions.slice(0, 2).map((def, j) => (
                      <li key={j} className="text-sm text-gray-700 dark:text-gray-300">
                        {def.definition}
                        {def.example && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 ml-4 mt-0.5 italic">
                            "{def.example}"
                          </p>
                        )}
                      </li>
                    ))}
                  </ol>
                </div>
              ))}
            </div>
          ) : null}
        </div>

        {/* Actions */}
        {entry && (
          <div className="px-3 py-2 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex gap-2">
            <button
              onClick={handleAddToVocabulary}
              disabled={saved}
              className="flex-1 px-3 py-1.5 text-sm bg-gradient-to-r from-amber-400 to-orange-400 
                         text-white rounded-lg hover:from-amber-500 hover:to-orange-500 
                         transition-all flex items-center justify-center gap-1.5
                         disabled:opacity-50 disabled:cursor-default"
            >
              {saved ? (
                <>✓ Saved</>
              ) : (
                <>📚 Add to Vocabulary</>
              )}
            </button>
            {cfi && bookId && (
              <button
                onClick={handleSaveAsHighlight}
                className="px-3 py-1.5 text-sm bg-blue-500 text-white rounded-lg 
                           hover:bg-blue-600 transition-colors flex items-center gap-1.5"
                title="Save as highlight with definition"
              >
                💡
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
