import { useRef, useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';

interface DrawingPadProps {
  onComplete: (score: number) => void;
  onBack: () => void;
  lang: 'it' | 'en';
}

const colors = [
  '#ff6b6b', '#ffd93d', '#6bcb77', '#4d96ff', '#9d4edd',
  '#ff85a1', '#ffc08c', '#98d8c8', '#7eb7da', '#dda0dd',
  '#ffffff', '#000000'
];

const brushSizes = [4, 8, 16, 24];

export default function DrawingPad({ onComplete, onBack, lang }: DrawingPadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentColor, setCurrentColor] = useState('#ff6b6b');
  const [brushSize, setBrushSize] = useState(8);
  const [tool, setTool] = useState<'brush' | 'eraser'>('brush');
  const [hasDrawn, setHasDrawn] = useState(false);
  
  const t = {
    it: { 
      title: '🎨 Disegna!', 
      back: '← Indietro', 
      clear: '🗑️ Cancella',
      save: '💾 Fatto!',
      brush: '🖌️',
      eraser: '🧹',
      colors: 'Colori',
      size: 'Dimensione'
    },
    en: { 
      title: '🎨 Draw!', 
      back: '← Back',
      clear: '🗑️ Clear',
      save: '💾 Done!',
      brush: '🖌️',
      eraser: '🧹',
      colors: 'Colors',
      size: 'Size'
    }
  }[lang];

  const setupCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas size
    const container = canvas.parentElement;
    if (container) {
      const rect = container.getBoundingClientRect();
      canvas.width = Math.min(rect.width - 32, 350);
      canvas.height = Math.min(350, window.innerHeight * 0.4);
    }
    
    // Fill with white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  useEffect(() => {
    setupCanvas();
    window.addEventListener('resize', setupCanvas);
    return () => window.removeEventListener('resize', setupCanvas);
  }, [setupCanvas]);

  const getCoords = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    
    if ('touches' in e) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top
      };
    }
    
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;
    
    setIsDrawing(true);
    setHasDrawn(true);
    
    const { x, y } = getCoords(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;
    
    const { x, y } = getCoords(e);
    
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    if (tool === 'eraser') {
      ctx.strokeStyle = '#ffffff';
    } else {
      ctx.strokeStyle = currentColor;
    }
    
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;
    
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  };

  const saveDrawing = () => {
    // Award points based on drawing activity
    const score = hasDrawn ? 50 : 10;
    onComplete(score);
  };

  return (
    <div className="mini-game-overlay">
      <div className="drawing-container glass-card">
        <div className="drawing-header">
          <button className="back-btn" onClick={onBack}>{t.back}</button>
          <h2>{t.title}</h2>
          <button className="save-btn" onClick={saveDrawing}>{t.save}</button>
        </div>
        
        <div className="canvas-wrapper">
          <canvas
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
            style={{
              borderRadius: '12px',
              boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.2)',
              touchAction: 'none'
            }}
          />
        </div>
        
        <div className="drawing-tools">
          <div className="tool-section">
            <div className="tool-buttons">
              <button 
                className={`tool-btn ${tool === 'brush' ? 'active' : ''}`}
                onClick={() => setTool('brush')}
              >
                {t.brush}
              </button>
              <button 
                className={`tool-btn ${tool === 'eraser' ? 'active' : ''}`}
                onClick={() => setTool('eraser')}
              >
                {t.eraser}
              </button>
              <button className="tool-btn clear-btn" onClick={clearCanvas}>
                {t.clear}
              </button>
            </div>
          </div>
          
          <div className="tool-section">
            <span className="tool-label">{t.size}</span>
            <div className="size-buttons">
              {brushSizes.map(size => (
                <motion.button
                  key={size}
                  whileTap={{ scale: 0.9 }}
                  className={`size-btn ${brushSize === size ? 'active' : ''}`}
                  onClick={() => setBrushSize(size)}
                >
                  <span style={{ 
                    width: size, 
                    height: size, 
                    borderRadius: '50%', 
                    background: currentColor,
                    display: 'block'
                  }} />
                </motion.button>
              ))}
            </div>
          </div>
          
          <div className="tool-section">
            <span className="tool-label">{t.colors}</span>
            <div className="color-palette">
              {colors.map(color => (
                <motion.button
                  key={color}
                  whileTap={{ scale: 0.9 }}
                  className={`color-btn ${currentColor === color ? 'active' : ''}`}
                  onClick={() => { setCurrentColor(color); setTool('brush'); }}
                  style={{ 
                    background: color,
                    border: color === '#ffffff' ? '2px solid #ccc' : 'none'
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
      
      <style>{`
        .drawing-container {
          max-width: 420px;
          width: 95%;
          margin: 0 auto;
          padding: 16px;
          max-height: 90vh;
          overflow-y: auto;
        }
        .drawing-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }
        .drawing-header h2 {
          margin: 0;
          font-size: 1.3rem;
        }
        .canvas-wrapper {
          display: flex;
          justify-content: center;
          margin-bottom: 16px;
        }
        .drawing-tools {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .tool-section {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .tool-label {
          font-size: 0.85rem;
          opacity: 0.8;
        }
        .tool-buttons {
          display: flex;
          gap: 8px;
        }
        .tool-btn {
          padding: 8px 16px;
          border-radius: 8px;
          border: 2px solid transparent;
          background: rgba(255,255,255,0.1);
          color: white;
          cursor: pointer;
          font-size: 1rem;
          transition: all 0.2s;
        }
        .tool-btn.active {
          border-color: #ffd93d;
          background: rgba(255,217,61,0.2);
        }
        .tool-btn:hover {
          background: rgba(255,255,255,0.2);
        }
        .clear-btn {
          margin-left: auto;
        }
        .size-buttons {
          display: flex;
          gap: 8px;
          align-items: center;
        }
        .size-btn {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          border: 2px solid transparent;
          background: rgba(255,255,255,0.1);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .size-btn.active {
          border-color: #ffd93d;
        }
        .color-palette {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }
        .color-btn {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
          transition: transform 0.2s;
        }
        .color-btn.active {
          transform: scale(1.2);
          box-shadow: 0 0 0 3px #ffd93d;
        }
        .save-btn {
          padding: 8px 16px;
          border-radius: 8px;
          background: linear-gradient(135deg, #6ee7b7, #3b82f6);
          border: none;
          color: white;
          font-weight: bold;
          cursor: pointer;
        }
        .back-btn {
          padding: 8px 12px;
          border-radius: 8px;
          background: rgba(255,255,255,0.1);
          border: none;
          color: white;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}
