'use client'

import GameWrapper, { useGameContext } from '@/app/games/components/GameWrapper'

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

// Brush types with their rendering characteristics
type BrushType = 'brush' | 'spray' | 'marker' | 'crayon' | 'eraser'

const BRUSH_INFO: Record<BrushType, { name: string; emoji: string; description: string }> = {
  brush: { name: 'Brush', emoji: '🖌️', description: 'Smooth lines' },
  spray: { name: 'Spray', emoji: '💨', description: 'Spray paint effect' },
  marker: { name: 'Marker', emoji: '🖊️', description: 'Bold strokes' },
  crayon: { name: 'Crayon', emoji: '🖍️', description: 'Textured lines' },
  eraser: { name: 'Eraser', emoji: '🧹', description: 'Erase drawing' },
}

// Stickers/stamps collection
const STICKERS = [
  { emoji: '⭐', name: 'Star' },
  { emoji: '❤️', name: 'Heart' },
  { emoji: '🌈', name: 'Rainbow' },
  { emoji: '🌸', name: 'Flower' },
  { emoji: '🦋', name: 'Butterfly' },
  { emoji: '🐱', name: 'Cat' },
  { emoji: '🐶', name: 'Dog' },
  { emoji: '🦄', name: 'Unicorn' },
  { emoji: '🚀', name: 'Rocket' },
  { emoji: '🎈', name: 'Balloon' },
  { emoji: '🌙', name: 'Moon' },
  { emoji: '☀️', name: 'Sun' },
  { emoji: '🎀', name: 'Bow' },
  { emoji: '👑', name: 'Crown' },
  { emoji: '🍎', name: 'Apple' },
  { emoji: '🌺', name: 'Hibiscus' },
]

// Templates for tracing
const TEMPLATES = [
  { id: 'none', name: 'Blank', emoji: '📄' },
  { id: 'circle', name: 'Circle', emoji: '⭕' },
  { id: 'star', name: 'Star', emoji: '⭐' },
  { id: 'heart', name: 'Heart', emoji: '💗' },
  { id: 'house', name: 'House', emoji: '🏠' },
  { id: 'tree', name: 'Tree', emoji: '🌳' },
  { id: 'butterfly', name: 'Butterfly', emoji: '🦋' },
  { id: 'cat', name: 'Cat Face', emoji: '🐱' },
  { id: 'rainbow', name: 'Rainbow', emoji: '🌈' },
  { id: 'flower', name: 'Flower', emoji: '🌸' },
]

// Layer interface
interface Layer {
  id: string
  name: string
  visible: boolean
  canvas: HTMLCanvasElement | null
}

// History state type
interface HistoryState {
  layers: { id: string; dataUrl: string }[]
}

function DrawingPadInner() {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasContainerRef = useRef<HTMLDivElement>(null)
  const templateCanvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [selectedColor, setSelectedColor] = useState('#FF0000')
  const [brushSize, setBrushSize] = useState(8)
  const [brushType, setBrushType] = useState<BrushType>('brush')
  const [history, setHistory] = useState<HistoryState[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 })
  const [showSaved, setShowSaved] = useState(false)
  const [showCleared, setShowCleared] = useState(false)
  const lastPos = useRef<{ x: number; y: number } | null>(null)
  
  // New Phase 2 state
  const [layers, setLayers] = useState<Layer[]>([
    { id: 'layer-1', name: 'Layer 1', visible: true, canvas: null }
  ])
  const [activeLayerId, setActiveLayerId] = useState('layer-1')
  const [selectedSticker, setSelectedSticker] = useState<string | null>(null)
  const [stickerSize, setStickerSize] = useState(50)
  const [selectedTemplate, setSelectedTemplate] = useState('none')
  const [showLayerPanel, setShowLayerPanel] = useState(false)
  const [showStickerPanel, setShowStickerPanel] = useState(false)
  const [showTemplatePanel, setShowTemplatePanel] = useState(false)
  const [showBrushPanel, setShowBrushPanel] = useState(false)
  
  const layerCanvasRefs = useRef<Map<string, HTMLCanvasElement>>(new Map())

  // Get active layer canvas
  const getActiveCanvas = useCallback(() => {
    return layerCanvasRefs.current.get(activeLayerId) || null
  }, [activeLayerId])

  // Calculate canvas size based on container
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const container = containerRef.current
        const rect = container.getBoundingClientRect()
        const maxWidth = Math.min(rect.width - 32, 1200)
        const maxHeight = Math.min(window.innerHeight - 320, 700)
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

  // Initialize layer canvases with white background on first layer
  useEffect(() => {
    layers.forEach((layer, index) => {
      const canvas = layerCanvasRefs.current.get(layer.id)
      if (canvas && canvas.width !== canvasSize.width) {
        canvas.width = canvasSize.width
        canvas.height = canvasSize.height
        const ctx = canvas.getContext('2d')
        if (ctx) {
          if (index === 0) {
            ctx.fillStyle = '#FFFFFF'
            ctx.fillRect(0, 0, canvas.width, canvas.height)
          }
        }
      }
    })
    
    // Draw template if selected
    drawTemplate()
    
    // Only save initial state once
    if (historyIndex === -1) {
      saveState()
    }
  }, [canvasSize, layers.length])

  // Draw template on template canvas
  const drawTemplate = useCallback(() => {
    const canvas = templateCanvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = canvasSize.width
    canvas.height = canvasSize.height
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    if (selectedTemplate === 'none') return

    ctx.strokeStyle = '#CCCCCC'
    ctx.lineWidth = 2
    ctx.setLineDash([5, 5])

    const cx = canvas.width / 2
    const cy = canvas.height / 2
    const size = Math.min(canvas.width, canvas.height) * 0.35

    switch (selectedTemplate) {
      case 'circle':
        ctx.beginPath()
        ctx.arc(cx, cy, size, 0, Math.PI * 2)
        ctx.stroke()
        break

      case 'star':
        drawStar(ctx, cx, cy, 5, size, size / 2)
        break

      case 'heart':
        drawHeart(ctx, cx, cy, size)
        break

      case 'house':
        drawHouse(ctx, cx, cy, size)
        break

      case 'tree':
        drawTree(ctx, cx, cy, size)
        break

      case 'butterfly':
        drawButterfly(ctx, cx, cy, size)
        break

      case 'cat':
        drawCatFace(ctx, cx, cy, size)
        break

      case 'rainbow':
        drawRainbowTemplate(ctx, cx, cy + size / 2, size)
        break

      case 'flower':
        drawFlower(ctx, cx, cy, size)
        break
    }
  }, [selectedTemplate, canvasSize])

  // Template drawing helpers
  function drawStar(ctx: CanvasRenderingContext2D, cx: number, cy: number, spikes: number, outerRadius: number, innerRadius: number) {
    ctx.beginPath()
    for (let i = 0; i < spikes * 2; i++) {
      const radius = i % 2 === 0 ? outerRadius : innerRadius
      const angle = (i * Math.PI) / spikes - Math.PI / 2
      const x = cx + Math.cos(angle) * radius
      const y = cy + Math.sin(angle) * radius
      if (i === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    }
    ctx.closePath()
    ctx.stroke()
  }

  function drawHeart(ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number) {
    ctx.beginPath()
    ctx.moveTo(cx, cy + size / 4)
    ctx.bezierCurveTo(cx - size, cy - size / 2, cx - size, cy + size / 2, cx, cy + size)
    ctx.bezierCurveTo(cx + size, cy + size / 2, cx + size, cy - size / 2, cx, cy + size / 4)
    ctx.stroke()
  }

  function drawHouse(ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number) {
    // Main body
    ctx.strokeRect(cx - size / 2, cy - size / 4, size, size * 0.75)
    // Roof
    ctx.beginPath()
    ctx.moveTo(cx - size / 2 - size / 6, cy - size / 4)
    ctx.lineTo(cx, cy - size)
    ctx.lineTo(cx + size / 2 + size / 6, cy - size / 4)
    ctx.stroke()
    // Door
    ctx.strokeRect(cx - size / 6, cy + size / 4, size / 3, size / 4)
    // Window
    ctx.strokeRect(cx - size / 3, cy - size / 8, size / 4, size / 4)
    ctx.strokeRect(cx + size / 12, cy - size / 8, size / 4, size / 4)
  }

  function drawTree(ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number) {
    // Trunk
    ctx.strokeRect(cx - size / 8, cy + size / 4, size / 4, size / 2)
    // Foliage (triangles)
    ctx.beginPath()
    ctx.moveTo(cx, cy - size)
    ctx.lineTo(cx - size / 2, cy + size / 4)
    ctx.lineTo(cx + size / 2, cy + size / 4)
    ctx.closePath()
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(cx, cy - size / 2)
    ctx.lineTo(cx - size / 3, cy)
    ctx.lineTo(cx + size / 3, cy)
    ctx.closePath()
    ctx.stroke()
  }

  function drawButterfly(ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number) {
    // Left wings
    ctx.beginPath()
    ctx.ellipse(cx - size / 2, cy - size / 4, size / 2, size / 3, -0.3, 0, Math.PI * 2)
    ctx.stroke()
    ctx.beginPath()
    ctx.ellipse(cx - size / 3, cy + size / 4, size / 3, size / 4, 0.3, 0, Math.PI * 2)
    ctx.stroke()
    // Right wings
    ctx.beginPath()
    ctx.ellipse(cx + size / 2, cy - size / 4, size / 2, size / 3, 0.3, 0, Math.PI * 2)
    ctx.stroke()
    ctx.beginPath()
    ctx.ellipse(cx + size / 3, cy + size / 4, size / 3, size / 4, -0.3, 0, Math.PI * 2)
    ctx.stroke()
    // Body
    ctx.beginPath()
    ctx.ellipse(cx, cy, size / 10, size / 2, 0, 0, Math.PI * 2)
    ctx.stroke()
  }

  function drawCatFace(ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number) {
    // Head
    ctx.beginPath()
    ctx.arc(cx, cy, size * 0.7, 0, Math.PI * 2)
    ctx.stroke()
    // Ears
    ctx.beginPath()
    ctx.moveTo(cx - size * 0.5, cy - size * 0.4)
    ctx.lineTo(cx - size * 0.7, cy - size)
    ctx.lineTo(cx - size * 0.2, cy - size * 0.6)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(cx + size * 0.5, cy - size * 0.4)
    ctx.lineTo(cx + size * 0.7, cy - size)
    ctx.lineTo(cx + size * 0.2, cy - size * 0.6)
    ctx.stroke()
    // Eyes
    ctx.beginPath()
    ctx.arc(cx - size * 0.25, cy - size * 0.1, size * 0.12, 0, Math.PI * 2)
    ctx.stroke()
    ctx.beginPath()
    ctx.arc(cx + size * 0.25, cy - size * 0.1, size * 0.12, 0, Math.PI * 2)
    ctx.stroke()
    // Nose
    ctx.beginPath()
    ctx.moveTo(cx, cy + size * 0.1)
    ctx.lineTo(cx - size * 0.1, cy + size * 0.25)
    ctx.lineTo(cx + size * 0.1, cy + size * 0.25)
    ctx.closePath()
    ctx.stroke()
    // Whiskers
    ctx.beginPath()
    ctx.moveTo(cx - size * 0.15, cy + size * 0.2)
    ctx.lineTo(cx - size * 0.6, cy + size * 0.15)
    ctx.moveTo(cx - size * 0.15, cy + size * 0.25)
    ctx.lineTo(cx - size * 0.6, cy + size * 0.3)
    ctx.moveTo(cx + size * 0.15, cy + size * 0.2)
    ctx.lineTo(cx + size * 0.6, cy + size * 0.15)
    ctx.moveTo(cx + size * 0.15, cy + size * 0.25)
    ctx.lineTo(cx + size * 0.6, cy + size * 0.3)
    ctx.stroke()
  }

  function drawRainbowTemplate(ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number) {
    const arcCount = 6
    for (let i = 0; i < arcCount; i++) {
      ctx.beginPath()
      ctx.arc(cx, cy, size - i * size / 8, Math.PI, 0)
      ctx.stroke()
    }
  }

  function drawFlower(ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number) {
    const petalCount = 6
    const petalSize = size / 2
    // Petals
    for (let i = 0; i < petalCount; i++) {
      const angle = (i / petalCount) * Math.PI * 2
      const px = cx + Math.cos(angle) * petalSize
      const py = cy + Math.sin(angle) * petalSize
      ctx.beginPath()
      ctx.ellipse(px, py, petalSize / 2, petalSize / 3, angle, 0, Math.PI * 2)
      ctx.stroke()
    }
    // Center
    ctx.beginPath()
    ctx.arc(cx, cy, size / 4, 0, Math.PI * 2)
    ctx.stroke()
    // Stem
    ctx.beginPath()
    ctx.moveTo(cx, cy + size / 4)
    ctx.lineTo(cx, cy + size)
    ctx.stroke()
    // Leaves
    ctx.beginPath()
    ctx.ellipse(cx - size / 4, cy + size * 0.6, size / 4, size / 8, -0.5, 0, Math.PI * 2)
    ctx.stroke()
    ctx.beginPath()
    ctx.ellipse(cx + size / 4, cy + size * 0.75, size / 4, size / 8, 0.5, 0, Math.PI * 2)
    ctx.stroke()
  }

  // Redraw template when changed
  useEffect(() => {
    drawTemplate()
  }, [selectedTemplate, drawTemplate])

  // Save current state to history
  const saveState = useCallback(() => {
    const layerData: { id: string; dataUrl: string }[] = []
    
    layers.forEach(layer => {
      const canvas = layerCanvasRefs.current.get(layer.id)
      if (canvas) {
        layerData.push({
          id: layer.id,
          dataUrl: canvas.toDataURL('image/png')
        })
      }
    })

    if (layerData.length === 0) return

    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1)
      newHistory.push({ layers: layerData })
      if (newHistory.length > 15) {
        newHistory.shift()
        return newHistory
      }
      return newHistory
    })
    setHistoryIndex(prev => Math.min(prev + 1, 14))
  }, [historyIndex, layers])

  // Undo action
  const undo = useCallback(() => {
    if (historyIndex <= 0) return
    
    const newIndex = historyIndex - 1
    const state = history[newIndex]
    
    state.layers.forEach(layerData => {
      const canvas = layerCanvasRefs.current.get(layerData.id)
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      
      const img = new Image()
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        ctx.drawImage(img, 0, 0)
      }
      img.src = layerData.dataUrl
    })
    
    setHistoryIndex(newIndex)
  }, [history, historyIndex])

  // Redo action
  const redo = useCallback(() => {
    if (historyIndex >= history.length - 1) return
    
    const newIndex = historyIndex + 1
    const state = history[newIndex]
    
    state.layers.forEach(layerData => {
      const canvas = layerCanvasRefs.current.get(layerData.id)
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      
      const img = new Image()
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        ctx.drawImage(img, 0, 0)
      }
      img.src = layerData.dataUrl
    })
    
    setHistoryIndex(newIndex)
  }, [history, historyIndex])

  // Clear canvas (current layer or all)
  const clearCanvas = useCallback((allLayers = false) => {
    if (allLayers) {
      layers.forEach((layer, index) => {
        const canvas = layerCanvasRefs.current.get(layer.id)
        if (!canvas) return
        const ctx = canvas.getContext('2d')
        if (!ctx) return
        
        if (index === 0) {
          ctx.fillStyle = '#FFFFFF'
          ctx.fillRect(0, 0, canvas.width, canvas.height)
        } else {
          ctx.clearRect(0, 0, canvas.width, canvas.height)
        }
      })
    } else {
      const canvas = getActiveCanvas()
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      
      const layerIndex = layers.findIndex(l => l.id === activeLayerId)
      if (layerIndex === 0) {
        ctx.fillStyle = '#FFFFFF'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
      }
    }
    
    saveState()
    setShowCleared(true)
    setTimeout(() => setShowCleared(false), 1500)
  }, [layers, activeLayerId, getActiveCanvas, saveState])

  // Get position from event
  const getPosition = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    const container = canvasContainerRef.current
    if (!container) return null

    const rect = container.getBoundingClientRect()
    const scaleX = canvasSize.width / rect.width
    const scaleY = canvasSize.height / rect.height

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
  }, [canvasSize])

  // Draw with different brush types
  const drawStroke = useCallback((from: { x: number; y: number }, to: { x: number; y: number }) => {
    const canvas = getActiveCanvas()
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const color = brushType === 'eraser' ? '#FFFFFF' : selectedColor

    switch (brushType) {
      case 'brush':
      case 'eraser':
        ctx.beginPath()
        ctx.moveTo(from.x, from.y)
        ctx.lineTo(to.x, to.y)
        ctx.strokeStyle = color
        ctx.lineWidth = brushSize
        ctx.lineCap = 'round'
        ctx.lineJoin = 'round'
        ctx.globalAlpha = 1
        ctx.stroke()
        break

      case 'spray':
        const density = brushSize * 2
        for (let i = 0; i < density; i++) {
          const angle = Math.random() * Math.PI * 2
          const radius = Math.random() * brushSize
          const x = to.x + Math.cos(angle) * radius
          const y = to.y + Math.sin(angle) * radius
          ctx.fillStyle = color
          ctx.globalAlpha = Math.random() * 0.5 + 0.2
          ctx.beginPath()
          ctx.arc(x, y, 1, 0, Math.PI * 2)
          ctx.fill()
        }
        ctx.globalAlpha = 1
        break

      case 'marker':
        ctx.beginPath()
        ctx.moveTo(from.x, from.y)
        ctx.lineTo(to.x, to.y)
        ctx.strokeStyle = color
        ctx.lineWidth = brushSize * 1.5
        ctx.lineCap = 'square'
        ctx.lineJoin = 'bevel'
        ctx.globalAlpha = 0.7
        ctx.stroke()
        ctx.globalAlpha = 1
        break

      case 'crayon':
        // Draw multiple offset lines for texture
        for (let i = 0; i < 3; i++) {
          const offsetX = (Math.random() - 0.5) * 3
          const offsetY = (Math.random() - 0.5) * 3
          ctx.beginPath()
          ctx.moveTo(from.x + offsetX, from.y + offsetY)
          ctx.lineTo(to.x + offsetX, to.y + offsetY)
          ctx.strokeStyle = color
          ctx.lineWidth = brushSize * 0.8
          ctx.lineCap = 'round'
          ctx.globalAlpha = 0.3 + Math.random() * 0.4
          ctx.stroke()
        }
        ctx.globalAlpha = 1
        break
    }
  }, [getActiveCanvas, selectedColor, brushSize, brushType])

  // Place sticker on canvas
  const placeSticker = useCallback((pos: { x: number; y: number }) => {
    if (!selectedSticker) return
    
    const canvas = getActiveCanvas()
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.font = `${stickerSize}px Arial`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(selectedSticker, pos.x, pos.y)
    
    saveState()
  }, [selectedSticker, stickerSize, getActiveCanvas, saveState])

  // Start drawing
  const handleStart = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault()
    const pos = getPosition(e)
    if (!pos) return

    if (selectedSticker) {
      placeSticker(pos)
      return
    }

    setIsDrawing(true)
    lastPos.current = pos

    // Draw a dot for single clicks
    const canvas = getActiveCanvas()
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    if (brushType === 'spray') {
      drawStroke(pos, pos)
    } else {
      const color = brushType === 'eraser' ? '#FFFFFF' : selectedColor
      ctx.beginPath()
      ctx.arc(pos.x, pos.y, brushSize / 2, 0, Math.PI * 2)
      ctx.fillStyle = color
      ctx.globalAlpha = brushType === 'marker' ? 0.7 : 1
      ctx.fill()
      ctx.globalAlpha = 1
    }
  }, [getPosition, brushSize, selectedColor, brushType, selectedSticker, placeSticker, getActiveCanvas, drawStroke])

  // Continue drawing
  const handleMove = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || selectedSticker) return
    e.preventDefault()
    
    const pos = getPosition(e)
    if (!pos || !lastPos.current) return

    drawStroke(lastPos.current, pos)
    lastPos.current = pos
  }, [isDrawing, selectedSticker, getPosition, drawStroke])

  // Stop drawing
  const handleEnd = useCallback(() => {
    if (isDrawing) {
      setIsDrawing(false)
      lastPos.current = null
      saveState()
    }
  }, [isDrawing, saveState])

  // Add new layer
  const addLayer = useCallback(() => {
    const newId = `layer-${Date.now()}`
    setLayers(prev => [...prev, {
      id: newId,
      name: `Layer ${prev.length + 1}`,
      visible: true,
      canvas: null
    }])
    setActiveLayerId(newId)
  }, [])

  // Delete layer
  const deleteLayer = useCallback((id: string) => {
    if (layers.length <= 1) return
    
    setLayers(prev => prev.filter(l => l.id !== id))
    layerCanvasRefs.current.delete(id)
    
    if (activeLayerId === id) {
      setActiveLayerId(layers[0].id === id ? layers[1]?.id : layers[0].id)
    }
  }, [layers, activeLayerId])

  // Toggle layer visibility
  const toggleLayerVisibility = useCallback((id: string) => {
    setLayers(prev => prev.map(l => 
      l.id === id ? { ...l, visible: !l.visible } : l
    ))
  }, [])

  // Merge all layers and save as PNG
  const saveAsPNG = useCallback(() => {
    const mergedCanvas = document.createElement('canvas')
    mergedCanvas.width = canvasSize.width
    mergedCanvas.height = canvasSize.height
    const ctx = mergedCanvas.getContext('2d')
    if (!ctx) return

    // Draw all visible layers in order
    layers.forEach(layer => {
      if (!layer.visible) return
      const canvas = layerCanvasRefs.current.get(layer.id)
      if (canvas) {
        ctx.drawImage(canvas, 0, 0)
      }
    })

    const link = document.createElement('a')
    link.download = `drawing-${Date.now()}.png`
    link.href = mergedCanvas.toDataURL('image/png')
    link.click()

    setShowSaved(true)
    setTimeout(() => setShowSaved(false), 2000)
  }, [canvasSize, layers])

  // Share drawing
  const shareDrawing = useCallback(async () => {
    const mergedCanvas = document.createElement('canvas')
    mergedCanvas.width = canvasSize.width
    mergedCanvas.height = canvasSize.height
    const ctx = mergedCanvas.getContext('2d')
    if (!ctx) return

    layers.forEach(layer => {
      if (!layer.visible) return
      const canvas = layerCanvasRefs.current.get(layer.id)
      if (canvas) {
        ctx.drawImage(canvas, 0, 0)
      }
    })

    try {
      const blob = await new Promise<Blob>((resolve) => {
        mergedCanvas.toBlob((b) => resolve(b!), 'image/png')
      })

      const file = new File([blob], 'drawing.png', { type: 'image/png' })

      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: 'My Drawing! 🎨',
          text: 'Check out my drawing!',
          files: [file]
        })
      } else if (navigator.share) {
        await navigator.share({
          title: 'My Drawing! 🎨',
          text: 'I made a cool drawing on Drawing Pad! 🎨',
          url: window.location.href
        })
      } else {
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob })
        ])
        alert('Drawing copied to clipboard! 📋')
      }
    } catch (err) {
      console.error('Share failed:', err)
    }
  }, [canvasSize, layers])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return

      switch(e.key.toLowerCase()) {
        case 'b': setBrushType('brush'); setSelectedSticker(null); break
        case 'e': setBrushType('eraser'); setSelectedSticker(null); break
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
        case 'escape':
          setSelectedSticker(null)
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [undo, redo, saveAsPNG])

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-300 via-pink-200 to-yellow-200 flex flex-col items-center p-4">

      <Link href="/games/arcade/" className="fixed top-4 left-4 z-50 flex items-center gap-2 bg-black/70 hover:bg-black/90 text-white px-4 py-2 rounded-full backdrop-blur-sm border border-white/20 transition-all active:scale-95 touch-manipulation"><span className="text-lg">←</span><span className="font-mono text-sm">Arcade</span></Link>
      {/* Header */}
      <Link 
        href="/games/arcade/" 
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
      <div ref={containerRef} className="w-full max-w-5xl flex flex-col gap-3">
        {/* Main Toolbar */}
        <div className="bg-white/90 rounded-2xl p-3 shadow-lg flex flex-wrap gap-3 items-center justify-center">
          {/* Brush Type Button */}
          <button
            onClick={() => {
              setShowBrushPanel(!showBrushPanel)
              setShowStickerPanel(false)
              setShowLayerPanel(false)
              setShowTemplatePanel(false)
            }}
            className={`p-3 rounded-xl text-2xl transition-all ${
              showBrushPanel || (!selectedSticker && brushType !== 'eraser')
                ? 'bg-purple-500 text-white shadow-lg scale-105'
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
            title="Brushes"
          >
            {BRUSH_INFO[brushType].emoji}
          </button>

          {/* Sticker Button */}
          <button
            onClick={() => {
              setShowStickerPanel(!showStickerPanel)
              setShowBrushPanel(false)
              setShowLayerPanel(false)
              setShowTemplatePanel(false)
            }}
            className={`p-3 rounded-xl text-2xl transition-all ${
              showStickerPanel || selectedSticker
                ? 'bg-pink-500 text-white shadow-lg scale-105'
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
            title="Stickers"
          >
            🎃
          </button>

          {/* Layer Button */}
          <button
            onClick={() => {
              setShowLayerPanel(!showLayerPanel)
              setShowBrushPanel(false)
              setShowStickerPanel(false)
              setShowTemplatePanel(false)
            }}
            className={`p-3 rounded-xl text-2xl transition-all ${
              showLayerPanel
                ? 'bg-blue-500 text-white shadow-lg scale-105'
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
            title="Layers"
          >
            📑
          </button>

          {/* Template Button */}
          <button
            onClick={() => {
              setShowTemplatePanel(!showTemplatePanel)
              setShowBrushPanel(false)
              setShowStickerPanel(false)
              setShowLayerPanel(false)
            }}
            className={`p-3 rounded-xl text-2xl transition-all ${
              showTemplatePanel || selectedTemplate !== 'none'
                ? 'bg-green-500 text-white shadow-lg scale-105'
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
            title="Templates"
          >
            📐
          </button>

          {/* Divider */}
          <div className="w-px h-8 bg-gray-300" />

          {/* Brush size */}
          <div className="flex items-center gap-2 bg-gray-100 rounded-xl px-3 py-2">
            <span className="text-sm">🔵</span>
            <input
              type="range"
              min="2"
              max="50"
              value={brushSize}
              onChange={(e) => setBrushSize(parseInt(e.target.value))}
              className="w-20 md:w-28 accent-purple-500"
            />
            <span className="text-sm font-bold text-gray-600 w-6">{brushSize}</span>
          </div>

          {/* Undo/Redo */}
          <div className="flex gap-1">
            <button
              onClick={undo}
              disabled={historyIndex <= 0}
              className={`p-2 rounded-xl text-lg transition-all ${
                historyIndex <= 0
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-100 hover:bg-blue-200 text-blue-600'
              }`}
              title="Undo"
            >
              ↩️
            </button>
            <button
              onClick={redo}
              disabled={historyIndex >= history.length - 1}
              className={`p-2 rounded-xl text-lg transition-all ${
                historyIndex >= history.length - 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-100 hover:bg-blue-200 text-blue-600'
              }`}
              title="Redo"
            >
              ↪️
            </button>
          </div>

          {/* Clear */}
          <button
            onClick={() => clearCanvas(false)}
            className="p-2 rounded-xl text-lg bg-red-100 hover:bg-red-200 text-red-600 transition-all"
            title="Clear Layer"
          >
            🗑️
          </button>

          {/* Save & Share */}
          <div className="flex gap-1">
            <button
              onClick={saveAsPNG}
              className="p-2 rounded-xl text-lg bg-green-100 hover:bg-green-200 text-green-600 transition-all"
              title="Save as PNG"
            >
              💾
            </button>
            <button
              onClick={shareDrawing}
              className="p-2 rounded-xl text-lg bg-purple-100 hover:bg-purple-200 text-purple-600 transition-all"
              title="Share"
            >
              📤
            </button>
          </div>
        </div>

        {/* Expandable Panels */}
        {/* Brush Panel */}
        {showBrushPanel && (
          <div className="bg-white/90 rounded-2xl p-4 shadow-lg animate-fadeIn">
            <h3 className="font-bold text-purple-800 mb-3">🖌️ Brush Types</h3>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(BRUSH_INFO) as BrushType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => {
                    setBrushType(type)
                    setSelectedSticker(null)
                  }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                    brushType === type
                      ? 'bg-purple-500 text-white shadow-lg scale-105'
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  <span className="text-xl">{BRUSH_INFO[type].emoji}</span>
                  <div className="text-left">
                    <div className="font-bold text-sm">{BRUSH_INFO[type].name}</div>
                    <div className="text-xs opacity-70">{BRUSH_INFO[type].description}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Sticker Panel */}
        {showStickerPanel && (
          <div className="bg-white/90 rounded-2xl p-4 shadow-lg animate-fadeIn">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-bold text-pink-800">🎃 Stickers</h3>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Size:</span>
                <input
                  type="range"
                  min="30"
                  max="100"
                  value={stickerSize}
                  onChange={(e) => setStickerSize(parseInt(e.target.value))}
                  className="w-20 accent-pink-500"
                />
                <span className="text-sm font-bold text-gray-600 w-8">{stickerSize}</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {STICKERS.map((sticker) => (
                <button
                  key={sticker.emoji}
                  onClick={() => setSelectedSticker(selectedSticker === sticker.emoji ? null : sticker.emoji)}
                  className={`p-3 rounded-xl text-2xl transition-all ${
                    selectedSticker === sticker.emoji
                      ? 'bg-pink-500 text-white shadow-lg scale-110'
                      : 'bg-gray-100 hover:bg-gray-200 hover:scale-105'
                  }`}
                  title={sticker.name}
                >
                  {sticker.emoji}
                </button>
              ))}
            </div>
            {selectedSticker && (
              <p className="text-sm text-pink-600 mt-2">
                ✨ Click on the canvas to place sticker! Press Escape to cancel.
              </p>
            )}
          </div>
        )}

        {/* Layer Panel */}
        {showLayerPanel && (
          <div className="bg-white/90 rounded-2xl p-4 shadow-lg animate-fadeIn">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-bold text-blue-800">📑 Layers</h3>
              <button
                onClick={addLayer}
                className="px-3 py-1 bg-blue-500 text-white rounded-lg text-sm font-bold hover:bg-blue-600 transition-all"
              >
                + Add Layer
              </button>
            </div>
            <div className="space-y-2">
              {[...layers].reverse().map((layer, idx) => (
                <div
                  key={layer.id}
                  className={`flex items-center gap-2 p-2 rounded-xl transition-all ${
                    activeLayerId === layer.id
                      ? 'bg-blue-100 border-2 border-blue-400'
                      : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
                  }`}
                >
                  <button
                    onClick={() => toggleLayerVisibility(layer.id)}
                    className="text-lg"
                    title={layer.visible ? 'Hide layer' : 'Show layer'}
                  >
                    {layer.visible ? '👁️' : '🙈'}
                  </button>
                  <button
                    onClick={() => setActiveLayerId(layer.id)}
                    className="flex-1 text-left font-medium text-sm"
                  >
                    {layer.name}
                    {idx === layers.length - 1 && ' (base)'}
                  </button>
                  {layers.length > 1 && (
                    <button
                      onClick={() => deleteLayer(layer.id)}
                      className="text-red-500 hover:text-red-700 text-sm"
                      title="Delete layer"
                    >
                      🗑️
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Template Panel */}
        {showTemplatePanel && (
          <div className="bg-white/90 rounded-2xl p-4 shadow-lg animate-fadeIn">
            <h3 className="font-bold text-green-800 mb-3">📐 Templates to Trace</h3>
            <div className="flex flex-wrap gap-2">
              {TEMPLATES.map((template) => (
                <button
                  key={template.id}
                  onClick={() => setSelectedTemplate(template.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                    selectedTemplate === template.id
                      ? 'bg-green-500 text-white shadow-lg scale-105'
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  <span className="text-xl">{template.emoji}</span>
                  <span className="font-medium text-sm">{template.name}</span>
                </button>
              ))}
            </div>
            {selectedTemplate !== 'none' && (
              <p className="text-sm text-green-600 mt-2">
                🎯 Trace over the dotted lines to practice drawing!
              </p>
            )}
          </div>
        )}

        {/* Color palette */}
        <div className="bg-white/90 rounded-2xl p-3 shadow-lg">
          <div className="flex flex-wrap gap-2 justify-center">
            {COLORS.map((color) => (
              <button
                key={color}
                onClick={() => {
                  setSelectedColor(color)
                  if (brushType === 'eraser') setBrushType('brush')
                  setSelectedSticker(null)
                }}
                className={`w-9 h-9 md:w-10 md:h-10 rounded-full transition-all border-4 ${
                  selectedColor === color && !selectedSticker && brushType !== 'eraser'
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

        {/* Canvas Container */}
        <div className="bg-white rounded-2xl shadow-2xl p-2 overflow-hidden">
          <div
            ref={canvasContainerRef}
            className="relative w-full cursor-crosshair"
            style={{ 
              height: canvasSize.height,
              aspectRatio: `${canvasSize.width} / ${canvasSize.height}`
            }}
            onMouseDown={handleStart}
            onMouseMove={handleMove}
            onMouseUp={handleEnd}
            onMouseLeave={handleEnd}
            onTouchStart={handleStart}
            onTouchMove={handleMove}
            onTouchEnd={handleEnd}
          >
            {/* Template canvas (bottom layer) */}
            <canvas
              ref={templateCanvasRef}
              width={canvasSize.width}
              height={canvasSize.height}
              className="absolute inset-0 w-full h-full pointer-events-none rounded-xl"
              style={{ zIndex: 0 }}
            />
            
            {/* Layer canvases */}
            {layers.map((layer, index) => (
              <canvas
                key={layer.id}
                ref={(el) => {
                  if (el) {
                    layerCanvasRefs.current.set(layer.id, el)
                    if (el.width !== canvasSize.width) {
                      el.width = canvasSize.width
                      el.height = canvasSize.height
                      const ctx = el.getContext('2d')
                      if (ctx && index === 0) {
                        ctx.fillStyle = '#FFFFFF'
                        ctx.fillRect(0, 0, el.width, el.height)
                      }
                    }
                  }
                }}
                width={canvasSize.width}
                height={canvasSize.height}
                className={`absolute inset-0 w-full h-full touch-none rounded-xl ${
                  !layer.visible ? 'invisible' : ''
                }`}
                style={{ zIndex: index + 1 }}
              />
            ))}
          </div>
        </div>

        {/* Current brush/sticker preview */}
        <div className="fixed bottom-6 right-6 bg-white/90 rounded-full p-3 shadow-lg flex items-center gap-2">
          {selectedSticker ? (
            <span className="text-2xl">{selectedSticker}</span>
          ) : (
            <div
              className="rounded-full border-2 border-gray-300"
              style={{
                width: Math.min(brushSize, 40),
                height: Math.min(brushSize, 40),
                backgroundColor: brushType === 'eraser' ? '#FFFFFF' : selectedColor,
                boxShadow: brushType === 'eraser' ? 'inset 0 0 0 1px #ddd' : undefined
              }}
            />
          )}
          <span className="text-sm font-bold text-gray-600">
            {selectedSticker ? '🎃' : BRUSH_INFO[brushType].emoji}
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
          🗑️ Layer Cleared!
        </div>
      )}

      {/* Decorative elements */}
      <div className="fixed bottom-10 left-10 text-4xl animate-bounce opacity-60 pointer-events-none">🖍️</div>
      <div className="fixed top-20 right-10 text-3xl animate-bounce opacity-50 pointer-events-none" style={{ animationDelay: '0.3s' }}>🌈</div>
      <div className="fixed bottom-20 right-20 text-3xl animate-bounce opacity-50 pointer-events-none" style={{ animationDelay: '0.6s' }}>⭐</div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>
    </div>
  )
}


// ============================================
// Game Wrapper with XP + Coins tracking
// ============================================
export default function DrawingPad() {
  return (
    <GameWrapper gameName="Draw" gameId="draw" emoji={"✏️"}>
      <DrawingPadInner />
    </GameWrapper>
  )
}
