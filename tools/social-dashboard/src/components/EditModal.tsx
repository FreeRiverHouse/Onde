import { useState, useEffect } from 'react';
import type { Post } from '../types';

interface EditModalProps {
  post: Post | null;
  onClose: () => void;
  onSave: (post: Post, newText: string) => void;
}

const MAX_CHARS = 280;

export function EditModal({ post, onClose, onSave }: EditModalProps) {
  const [text, setText] = useState('');

  useEffect(() => {
    if (post) {
      setText(post.text);
    }
  }, [post]);

  if (!post) return null;

  const charCount = text.length;
  const isOverLimit = charCount > MAX_CHARS;

  const handleSave = () => {
    if (!isOverLimit) {
      onSave(post, text);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey) && !isOverLimit) {
      handleSave();
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} onKeyDown={handleKeyDown}>
        <div className="modal-header">
          <h2>Edit Post</h2>
          <button className="modal-close" onClick={onClose}>
            &times;
          </button>
        </div>
        <div className="modal-body">
          <textarea
            className="edit-textarea"
            value={text}
            onChange={(e) => setText(e.target.value)}
            autoFocus
            placeholder="What's happening?"
          />
          <div className={`char-count ${isOverLimit ? 'over-limit' : ''}`}>
            {charCount} / {MAX_CHARS}
            {isOverLimit && ` (${charCount - MAX_CHARS} over limit)`}
          </div>
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            <strong>Tip:</strong> Press Cmd/Ctrl + Enter to save, or Escape to cancel.
          </div>
        </div>
        <div className="modal-footer">
          <button className="modal-btn cancel" onClick={onClose}>
            Cancel
          </button>
          <button className="modal-btn save" onClick={handleSave} disabled={isOverLimit}>
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
