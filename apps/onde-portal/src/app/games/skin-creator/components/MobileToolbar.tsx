'use client';

import type { ToolType, SoundType } from './types';

interface MobileToolbarProps {
  tool: ToolType;
  setTool: (tool: ToolType) => void;
  historyIndex: number;
  undo: () => void;
  downloadSkin: (useSelectedLayers: boolean) => void;
  setShowMobile3DPreview: (v: boolean) => void;
  playSound: (type: SoundType) => void;
}

export default function MobileToolbar({
  tool, setTool, historyIndex, undo,
  downloadSkin, setShowMobile3DPreview, playSound,
}: MobileToolbarProps) {
  return (
    <div className="md:hidden skin-mobile-toolbar">
      <button
        onClick={() => setTool('brush')}
        className={`skin-mobile-toolbar-btn ${tool === 'brush' ? 'active' : ''}`}
        title="Draw"
      >
        🖌️
      </button>
      <button
        onClick={() => setTool('eraser')}
        className={`skin-mobile-toolbar-btn ${tool === 'eraser' ? 'active' : ''}`}
        title="Erase"
      >
        🧽
      </button>
      <button
        onClick={() => setTool('fill')}
        className={`skin-mobile-toolbar-btn ${tool === 'fill' ? 'active' : ''}`}
        title="Fill"
      >
        🪣
      </button>
      <button
        onClick={() => setShowMobile3DPreview(true)}
        className="skin-mobile-toolbar-btn"
        style={{ background: 'linear-gradient(145deg, #8B5CF6, #6D28D9)', color: 'white' }}
        title="3D Preview"
      >
        🎮
      </button>
      <button
        onClick={() => { undo(); playSound('undo'); }}
        className="skin-mobile-toolbar-btn"
        disabled={historyIndex <= 0}
        title="Undo"
      >
        ↩️
      </button>
      <button
        onClick={() => downloadSkin(false)}
        className="skin-mobile-toolbar-btn"
        style={{ background: 'linear-gradient(145deg, #10B981, #059669)', color: 'white' }}
        title="Save"
      >
        💾
      </button>
    </div>
  );
}
