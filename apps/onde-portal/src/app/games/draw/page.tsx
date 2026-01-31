'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import Link from 'next/link'

// Color palette - 12 kid-friendly colors
const COLORS = [
  '#FF0000', // Red
  '#FF8800', // Orange
  '#FFFF00', // Yellow
  '#00FF00', // Green
  '#00FFFF', // Cyan
  '#0088FF', // Light Blue
  '#0000FF', // Blue
  '#8800FF', // Purple
  '#FF00FF', // Magenta
  '#FF69B4', // Pink
  '#FFFFFF', // White
  '#000000', // Black
]

// History state type
interface HistoryState {
  dataUrl: string
}

export default function DrawingPad() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [selectedColor, setSelectedColor] = useState('#FF0000')
  const [brushSize, setBrushSize] = useState(8)
  const [tool, setTool] = useState<'brush' | 'eraser'>('brush')
  const [history, setHistory] = useState<HistoryState[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 })
  const [showSaved, setShowSaved] = useState(false)
  const [showCleared, setShowCleared] = useState(false)
  const lastPos = useRef<{ x: number; y: number } | null>(null)

  // Calculate canvas size based on container
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const container = containerRef.current
        const rect = container.getBoundingClientRect()
        // Leave some padding
        const maxWidth = Math.min(rect.width - 32, 1200)
        const maxHeight = Math.min(window.innerHeight - 280, 800)
        setCanvasSize({
          width: maxWidth,
          height: Math.max(300, maxHeight)
        })
      }
    }

    updateSize()
    window.addEventListener('resize', updateSize)
    return () => window.removeEventListener('resize', updateSize)
  }, [])

  // Initialize canvas with white background
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.fillStyle = '#FFFFFF'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    saveState()
  }, [canvasSize])

  // Save current state to history
  const saveState = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const dataUrl = canvas.toDataURL('image/png')
    setHistory(prev => {
      // Remove any states after current index (for when we've undone)
      const newHistory = prev.slice(0, historyIndex + 1)
      newHistory.push({ dataUrl })
      // Keep only last 10 states
      if (newHistory.length > 10) {
        newHistory.shift()
        return newHistory
      }
      return newHistory
    })
    setHistoryIndex(prev => Math.min(prev + 1, 9))
  }, [historyIndex])

  // Undo action
  const undo = useCallback(() => {
    if (historyIndex <= 0) return
    
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const newIndex = historyIndex - 1
    const img = new Image()
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(img, 0, 0)
      setHistoryIndex(newIndex)
    }
    img.src = history[newIndex].dataUrl
  }, [history, historyIndex])

  // Redo action
  const redo = useCallback(() => {
    if (historyIndex >= history.length - 1) return
    
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const newIndex = historyIndex + 1
    const img = new Image()
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(img, 0, 0)
      setHistoryIndex(newIndex)
    }
    img.src = history[newIndex].dataUrl
  }, [history, historyIndex])

  // Clear canvas
  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.fillStyle = '#FFFFFF'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    saveState()
    
    setShowCleared(true)
    setTimeout(() => setShowCleared(false), 1500)
  }, [saveState])

  // Get position from event (mouse or touch)
  const getPosition = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current
    if (!canvas) return null

    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height

    if ('touches' in e) {
      const touch = e.touches[0]
      return {
        x: (touch.clientX - rect.left) * scaleX,
        y: (touch.clientY - rect.top) * scaleY
      }
    } else {
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY
      }
    }
  }, [])

  // Draw line between two points
  const drawLine = useCallback((from: { x: number; y: number }, to: { x: number; y: number }) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.beginPath()
    ctx.moveTo(from.x, from.y)
    ctx.lineTo(to.x, to.y)
    ctx.strokeStyle = tool === 'eraser' ? '#FFFFFF' : selectedColor
    ctx.lineWidth = brushSize
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.stroke()
  }, [selectedColor, brushSize, tool])

  // Start drawing
  const handleStart = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault()
    const pos = getPosition(e)
    if (!pos) return

    setIsDrawing(true)
    lastPos.current = pos

    // Draw a dot for single clicks
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.beginPath()
    ctx.arc(pos.x, pos.y, brushSize / 2, 0, Math.PI * 2)
    ctx.fillStyle = tool === 'eraser' ? '#FFFFFF' : selectedColor
    ctx.fill()
  }, [getPosition, brushSize, selectedColor, tool])

  // Continue drawing
  const handleMove = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return
    e.preventDefault()
    
    const pos = getPosition(e)
    if (!pos || !lastPos.current) return

    drawLine(lastPos.current, pos)
    lastPos.current = pos
  }, [isDrawing, getPosition, drawLine])

  // Stop drawing
  const handleEnd = useCallback(() => {
    if (isDrawing) {
      setIsDrawing(false)
      lastPos.current = null
      saveState()
    }
  }, [isDrawing, saveState])

  // Save as PNG
  const saveAsPNG = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const link = document.createElement('a')
    link.download = `drawing-${Date.now()}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()

    setShowSaved(true)
    setTimeout(() => setShowSaved(false), 2000)
  }, [])

  // Share drawing
  const shareDrawing = useCallback(async () => {
    const canvas = canvasRef.current
    if (!canvas) return

    try {
      // Convert canvas to blob
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((b) => resolve(b!), 'image/png')
      })

      const file = new File([blob], 'drawing.png', { type: 'image/png' })

      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: 'My Drawing! 🎨',
          text: 'Check out my drawing!',
          files: [file]
        })
      } else if (navigator.share) {
        // Fallback: share without file
        await navigator.share({
          title: 'My Drawing! 🎨',
          text: 'I made a cool drawing on Drawing Pad! 🎨',
          url: window.location.href
        })
      } else {
        // Final fallback: copy to clipboard
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob })
        ])
        alert('Drawing copied to clipboard! 📋')
      }
    } catch (err) {
      console.error('Share failed:', err)
    }
  }, [])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return

      switch(e.key.toLowerCase()) {
        case 'b': setTool('brush'); break
        case 'e': setTool('eraser'); break
        case 'z':
          if (e.metaKey || e.ctrlKey) {
            e.preventDefault()
            if (e.shiftKey) redo()
            else undo()
          }
          break
        case 'y':
          if (e.metaKey || e.ctrlKey) {
            e.preventDefault()
            redo()
          }
          break
        case 's':
          if (e.metaKey || e.ctrlKey) {
            e.preventDefault()
            saveAsPNG()
          }
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [undo, redo, saveAsPNG])

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-300 via-pink-200 to-yellow-200 flex flex-col items-center p-4">
      {/* Header */}
      <Link 
        href="/games" 
        className="absolute top-4 left-4 bg-white/80 px-4 py-2 rounded-full font-bold text-purple-700 shadow-lg hover:scale-105 transition-all z-10"
      >
        ← Games
      </Link>

      {/* Title */}
      <h1 className="text-3xl md:text-4xl font-black text-purple-800 mb-2 text-center drop-shadow-lg mt-12 md:mt-0">
        🎨 Drawing Pad
      </h1>
      <p className="text-purple-600 mb-4 text-center">
        Draw, create, and share your masterpiece!
      </p>

      {/* Main content */}
      <div ref={containerRef} className="w-full max-w-5xl flex flex-col gap-4">
        {/* Toolbar */}
        <div className="bg-white/90 rounded-2xl p-4 shadow-lg flex flex-wrap gap-4 items-center justify-center">
          {/* Tools */}
          <div className="flex gap-2">
            <button
              onClick={() => setTool('brush')}
              className={`p-3 rounded-xl text-2xl transition-all ${
                tool === 'brush'
                  ? 'bg-purple-500 text-white shadow-lg scale-110'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
              title="Brush (B)"
            >
              🖌️
            </button>
            <button
              onClick={() => setTool('eraser')}
              className={`p-3 rounded-xl text-2xl transition-all ${
                tool === 'eraser'
                  ? 'bg-purple-500 text-white shadow-lg scale-110'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
              title="Eraser (E)"
            >
              🧹
            </button>
          </div>

          {/* Brush size */}
          <div className="flex items-center gap-2 bg-gray-100 rounded-xl px-4 py-2">
            <span className="text-sm">🔵</span>
            <input
              type="range"
              min="2"
              max="50"
              value={brushSize}
              onChange={(e) => setBrushSize(parseInt(e.target.value))}
              className="w-24 md:w-32 accent-purple-500"
            />
            <span className="text-sm font-bold text-gray-600 w-8">{brushSize}</span>
          </div>

          {/* Undo/Redo */}
          <div className="flex gap-2">
            <button
              onClick={undo}
              disabled={historyIndex <= 0}
              className={`p-3 rounded-xl text-xl transition-all ${
                historyIndex <= 0
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-100 hover:bg-blue-200 text-blue-600'
              }`}
              title="Undo (Ctrl+Z)"
            >
              ↩️
            </button>
            <button
              onClick={redo}
              disabled={historyIndex >= history.length - 1}
              className={`p-3 rounded-xl text-xl transition-all ${
                historyIndex >= history.length - 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-100 hover:bg-blue-200 text-blue-600'
              }`}
              title="Redo (Ctrl+Shift+Z)"
            >
              ↪️
            </button>
          </div>

          {/* Clear */}
          <button
            onClick={clearCanvas}
            className="p-3 rounded-xl text-xl bg-red-100 hover:bg-red-200 text-red-600 transition-all"
            title="Clear Canvas"
          >
            🗑️
          </button>

          {/* Save & Share */}
          <div className="flex gap-2">
            <button
              onClick={saveAsPNG}
              className="p-3 rounded-xl text-xl bg-green-100 hover:bg-green-200 text-green-600 transition-all"
              title="Save as PNG (Ctrl+S)"
            >
              💾
            </button>
            <button
              onClick={shareDrawing}
              className="p-3 rounded-xl text-xl bg-purple-100 hover:bg-purple-200 text-purple-600 transition-all"
              title="Share Drawing"
            >
              📤
            </button>
          </div>
        </div>

        {/* Color palette */}
        <div className="bg-white/90 rounded-2xl p-4 shadow-lg">
          <div className="flex flex-wrap gap-2 justify-center">
            {COLORS.map((color) => (
              <button
                key={color}
                onClick={() => {
                  setSelectedColor(color)
                  setTool('brush')
                }}
                className={`w-10 h-10 md:w-12 md:h-12 rounded-full transition-all border-4 ${
                  selectedColor === color && tool === 'brush'
                    ? 'border-purple-500 scale-125 shadow-lg'
                    : 'border-white hover:scale-110 shadow-md'
                }`}
                style={{ 
                  backgroundColor: color,
                  boxShadow: color === '#FFFFFF' ? 'inset 0 0 0 1px #ddd' : undefined
                }}
                title={color}
              />
            ))}
          </div>
        </div>

        {/* Canvas */}
        <div className="bg-white rounded-2xl shadow-2xl p-2 overflow-hidden">
          <canvas
            ref={canvasRef}
            width={canvasSize.width}
            height={canvasSize.height}
            onMouseDown={handleStart}
            onMouseMove={handleMove}
            onMouseUp={handleEnd}
            onMouseLeave={handleEnd}
            onTouchStart={handleStart}
            onTouchMove={handleMove}
            onTouchEnd={handleEnd}
            className="w-full cursor-crosshair touch-none rounded-xl"
            style={{ 
              maxHeight: canvasSize.height,
              aspectRatio: `${canvasSize.width} / ${canvasSize.height}`
            }}
          />
        </div>

        {/* Current brush preview */}
        <div className="fixed bottom-6 right-6 bg-white/90 rounded-full p-3 shadow-lg flex items-center gap-2">
          <div
            className="rounded-full border-2 border-gray-300"
            style={{
              width: Math.min(brushSize, 40),
              height: Math.min(brushSize, 40),
              backgroundColor: tool === 'eraser' ? '#FFFFFF' : selectedColor,
              boxShadow: tool === 'eraser' ? 'inset 0 0 0 1px #ddd' : undefined
            }}
          />
          <span className="text-sm font-bold text-gray-600">
            {tool === 'eraser' ? '🧹' : '🖌️'}
          </span>
        </div>
      </div>

      {/* Toast notifications */}
      {showSaved && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-full font-bold shadow-lg animate-bounce z-50">
          ✅ Saved to Downloads!
        </div>
      )}

      {showCleared && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-purple-500 text-white px-6 py-3 rounded-full font-bold shadow-lg animate-bounce z-50">
          🗑️ Canvas Cleared!
        </div>
      )}

      {/* Decorative elements */}
      <div className="fixed bottom-10 left-10 text-4xl animate-bounce opacity-60 pointer-events-none">🖍️</div>
      <div className="fixed top-20 right-10 text-3xl animate-bounce opacity-50 pointer-events-none" style={{ animationDelay: '0.3s' }}>🌈</div>
      <div className="fixed bottom-20 right-20 text-3xl animate-bounce opacity-50 pointer-events-none" style={{ animationDelay: '0.6s' }}>⭐</div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.8); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}
