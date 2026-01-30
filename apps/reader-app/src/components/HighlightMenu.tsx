'use client';

import { useState } from 'react';
import { HighlightColor, useReaderStore } from '@/store/readerStore';
import { DictionaryPopup } from './DictionaryPopup';

interface HighlightMenuProps {
  position: { x: number; y: number };
  selectedText: string;
  cfi: string;
  bookId: string;
  onClose: () => void;
}

// Check if selection is a single word (for dictionary lookup)
function isSingleWord(text: string): boolean {
  const cleanText = text.trim();
  // Allow hyphenated words and apostrophes (e.g., "don't", "self-aware")
  return /^[a-zA-Z]+(['-][a-zA-Z]+)*$/.test(cleanText) && cleanText.length >= 2;
}

const HIGHLIGHT_COLORS: { color: HighlightColor; label: string; bg: string }[] = [
  { color: 'yellow', label: 'Yellow', bg: 'bg-yellow-300' },
  { color: 'green', label: 'Green', bg: 'bg-green-300' },
  { color: 'blue', label: 'Blue', bg: 'bg-blue-300' },
  { color: 'pink', label: 'Pink', bg: 'bg-pink-300' },
];

export function HighlightMenu({ position, selectedText, cfi, bookId, onClose }: HighlightMenuProps) {
  const { addHighlight } = useReaderStore();
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [showDictionary, setShowDictionary] = useState(false);
  const [note, setNote] = useState('');
  const [selectedColor, setSelectedColor] = useState<HighlightColor>('yellow');
  
  const canLookup = isSingleWord(selectedText);

  const handleHighlight = (color: HighlightColor, addNote = false) => {
    if (addNote) {
      setSelectedColor(color);
      setShowNoteInput(true);
    } else {
      addHighlight({
        bookId,
        cfi,
        text: selectedText,
        color,
      });
      onClose();
    }
  };

  const handleSaveWithNote = () => {
    addHighlight({
      bookId,
      cfi,
      text: selectedText,
      color: selectedColor,
      note: note.trim() || undefined,
    });
    onClose();
  };

  // Calculate menu position (ensure it stays on screen)
  const menuStyle = {
    left: Math.min(position.x, window.innerWidth - 200),
    top: Math.max(position.y - 60, 10),
  };

  return (
    <div 
      className="fixed z-[100] animate-in fade-in zoom-in-95 duration-150"
      style={menuStyle}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        {!showNoteInput ? (
          <>
            {/* Color selection */}
            <div className="flex items-center gap-1 p-2 border-b border-gray-100 dark:border-gray-700">
              {HIGHLIGHT_COLORS.map(({ color, label, bg }) => (
                <button
                  key={color}
                  onClick={() => handleHighlight(color)}
                  className={`w-8 h-8 rounded-full ${bg} hover:scale-110 transition-transform`}
                  title={label}
                />
              ))}
            </div>
            
            {/* Actions */}
            <div className="p-1">
              {canLookup && (
                <button
                  onClick={() => setShowDictionary(true)}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg flex items-center gap-2 text-blue-600 dark:text-blue-400 font-medium"
                >
                  <span>📖</span>
                  <span>Look up "{selectedText.trim()}"</span>
                </button>
              )}
              <button
                onClick={() => {
                  setShowNoteInput(true);
                }}
                className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg flex items-center gap-2"
              >
                <span>📝</span>
                <span>Add note...</span>
              </button>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(selectedText);
                  onClose();
                }}
                className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg flex items-center gap-2"
              >
                <span>📋</span>
                <span>Copy text</span>
              </button>
            </div>
          </>
        ) : (
          <div className="p-3 min-w-[280px]">
            {/* Color picker in note mode */}
            <div className="flex items-center gap-1 mb-3">
              {HIGHLIGHT_COLORS.map(({ color, bg }) => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className={`w-7 h-7 rounded-full ${bg} transition-all ${
                    selectedColor === color 
                      ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' 
                      : 'hover:scale-105'
                  }`}
                />
              ))}
            </div>
            
            {/* Selected text preview */}
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-2 line-clamp-2 italic">
              "{selectedText.slice(0, 100)}{selectedText.length > 100 ? '...' : ''}"
            </div>
            
            {/* Note input */}
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add a note..."
              className="w-full p-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg 
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                         focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows={3}
              autoFocus
            />
            
            {/* Buttons */}
            <div className="flex justify-end gap-2 mt-2">
              <button
                onClick={onClose}
                className="px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveWithNote}
                className="px-3 py-1.5 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Save
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Dictionary Popup */}
      {showDictionary && (
        <DictionaryPopup
          word={selectedText.trim()}
          position={{ x: position.x + 20, y: position.y + 60 }}
          cfi={cfi}
          bookId={bookId}
          onClose={() => setShowDictionary(false)}
          onHighlightWithNote={(note) => {
            addHighlight({
              bookId,
              cfi,
              text: selectedText.trim(),
              color: 'blue',
              note,
            });
            onClose();
          }}
        />
      )}
    </div>
  );
}
