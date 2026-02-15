'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import Link from 'next/link';
import Breadcrumb from '@/components/ui/Breadcrumb';
import { MINECRAFT_BLOCKS, type MinecraftBlock, findClosestBlock, colorDistance } from './blocks';

type GridSize = 16 | 32 | 64 | 128;
type BlockCategory = 'all' | 'wool' | 'concrete' | 'terracotta';

interface PixelBlock {
  block: MinecraftBlock;
  x: number;
  y: number;
}

interface BlockCount {
  block: MinecraftBlock;
  count: number;
}

export default function PixelArtPage() {
  const [gridSize, setGridSize] = useState<GridSize>(32);
  const [category, setCategory] = useState<BlockCategory>('all');
  const [pixelGrid, setPixelGrid] = useState<PixelBlock[][] | null>(null);
  const [blockCounts, setBlockCounts] = useState<BlockCount[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [showGrid, setShowGrid] = useState(true);
  const [hoveredBlock, setHoveredBlock] = useState<PixelBlock | null>(null);
  const [zoom, setZoom] = useState(1);
  const [showBlockList, setShowBlockList] = useState(false);
  const [dithering, setDithering] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const resultCanvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  const filteredBlocks = MINECRAFT_BLOCKS.filter((b) => {
    if (category === 'all') return true;
    return b.category === category;
  });

  const processImage = useCallback(
    (imgSrc: string) => {
      setIsProcessing(true);
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        imageRef.current = img;

        // Draw image onto a hidden canvas at grid size
        const canvas = canvasRef.current;
        if (!canvas) return;

        canvas.width = gridSize;
        canvas.height = gridSize;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) return;

        // Calculate aspect ratio to fit
        const aspect = img.width / img.height;
        let drawW: number = gridSize;
        let drawH: number = gridSize;
        let offsetX = 0;
        let offsetY = 0;

        if (aspect > 1) {
          drawH = Math.round(gridSize / aspect);
          offsetY = Math.floor((gridSize - drawH) / 2);
        } else if (aspect < 1) {
          drawW = Math.round(gridSize * aspect);
          offsetX = Math.floor((gridSize - drawW) / 2);
        }

        // Clear with transparent
        ctx.clearRect(0, 0, gridSize, gridSize);
        ctx.drawImage(img, offsetX, offsetY, drawW, drawH);

        const imageData = ctx.getImageData(0, 0, gridSize, gridSize);
        const data = imageData.data;

        const blocks = filteredBlocks;
        const grid: PixelBlock[][] = [];
        const counts = new Map<string, { block: MinecraftBlock; count: number }>();

        if (dithering) {
          // Floyd-Steinberg dithering
          const errors = new Float32Array(gridSize * gridSize * 3);
          
          for (let y = 0; y < gridSize; y++) {
            const row: PixelBlock[] = [];
            for (let x = 0; x < gridSize; x++) {
              const idx = (y * gridSize + x) * 4;
              const eIdx = (y * gridSize + x) * 3;
              const a = data[idx + 3];

              if (a < 128) {
                // Transparent pixel - use air/empty
                row.push({
                  block: { id: 'air', name: 'Air', color: [0, 0, 0], hex: '#000000', category: 'wool' },
                  x,
                  y,
                });
                continue;
              }

              const r = Math.max(0, Math.min(255, data[idx] + errors[eIdx]));
              const g = Math.max(0, Math.min(255, data[idx + 1] + errors[eIdx + 1]));
              const b = Math.max(0, Math.min(255, data[idx + 2] + errors[eIdx + 2]));

              const closest = findClosestBlock([r, g, b], blocks);
              row.push({ block: closest, x, y });

              const existing = counts.get(closest.id);
              if (existing) existing.count++;
              else counts.set(closest.id, { block: closest, count: 1 });

              // Calculate error
              const errR = r - closest.color[0];
              const errG = g - closest.color[1];
              const errB = b - closest.color[2];

              // Distribute error
              const distribute = (dx: number, dy: number, factor: number) => {
                const nx = x + dx;
                const ny = y + dy;
                if (nx >= 0 && nx < gridSize && ny >= 0 && ny < gridSize) {
                  const nIdx = (ny * gridSize + nx) * 3;
                  errors[nIdx] += errR * factor;
                  errors[nIdx + 1] += errG * factor;
                  errors[nIdx + 2] += errB * factor;
                }
              };

              distribute(1, 0, 7 / 16);
              distribute(-1, 1, 3 / 16);
              distribute(0, 1, 5 / 16);
              distribute(1, 1, 1 / 16);
            }
            grid.push(row);
          }
        } else {
          // Simple nearest color matching
          for (let y = 0; y < gridSize; y++) {
            const row: PixelBlock[] = [];
            for (let x = 0; x < gridSize; x++) {
              const idx = (y * gridSize + x) * 4;
              const r = data[idx];
              const g = data[idx + 1];
              const b = data[idx + 2];
              const a = data[idx + 3];

              if (a < 128) {
                row.push({
                  block: { id: 'air', name: 'Air', color: [0, 0, 0], hex: '#000000', category: 'wool' },
                  x,
                  y,
                });
                continue;
              }

              const closest = findClosestBlock([r, g, b], blocks);
              row.push({ block: closest, x, y });

              const existing = counts.get(closest.id);
              if (existing) existing.count++;
              else counts.set(closest.id, { block: closest, count: 1 });
            }
            grid.push(row);
          }
        }

        setPixelGrid(grid);
        setBlockCounts(
          Array.from(counts.values()).sort((a, b) => b.count - a.count)
        );
        setIsProcessing(false);
        renderResult(grid);
      };
      img.src = imgSrc;
    },
    [gridSize, filteredBlocks, dithering]
  );

  // Re-process when settings change
  useEffect(() => {
    if (uploadedImage) {
      processImage(uploadedImage);
    }
  }, [gridSize, category, dithering]);

  const renderResult = useCallback(
    (grid: PixelBlock[][]) => {
      const canvas = resultCanvasRef.current;
      if (!canvas || !grid.length) return;

      const blockPixelSize = 16;
      const size = grid.length;
      canvas.width = size * blockPixelSize;
      canvas.height = size * blockPixelSize;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
          const pixel = grid[y][x];
          if (pixel.block.id === 'air') {
            // Draw checkerboard for transparency
            const isLight = (x + y) % 2 === 0;
            ctx.fillStyle = isLight ? '#2a2a2a' : '#1a1a1a';
          } else {
            ctx.fillStyle = pixel.block.hex;
          }
          ctx.fillRect(
            x * blockPixelSize,
            y * blockPixelSize,
            blockPixelSize,
            blockPixelSize
          );

          if (showGrid && pixel.block.id !== 'air') {
            ctx.strokeStyle = 'rgba(0,0,0,0.15)';
            ctx.lineWidth = 0.5;
            ctx.strokeRect(
              x * blockPixelSize,
              y * blockPixelSize,
              blockPixelSize,
              blockPixelSize
            );
          }
        }
      }
    },
    [showGrid]
  );

  useEffect(() => {
    if (pixelGrid) renderResult(pixelGrid);
  }, [showGrid, pixelGrid, renderResult]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      setUploadedImage(result);
      processImage(result);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files?.[0];
      if (!file || !file.type.startsWith('image/')) return;

      const reader = new FileReader();
      reader.onload = (ev) => {
        const result = ev.target?.result as string;
        setUploadedImage(result);
        processImage(result);
      };
      reader.readAsDataURL(file);
    },
    [processImage]
  );

  const downloadPNG = () => {
    const canvas = resultCanvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `minecraft-pixel-art-${gridSize}x${gridSize}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const totalBlocks = blockCounts.reduce((sum, bc) => sum + bc.count, 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950">
      {/* Header */}
      <div className="border-b border-white/10 bg-black/30 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <Breadcrumb
            items={[
              { label: 'Home', href: '/', emoji: '🏠' },
              { label: 'Games', href: '/games', emoji: '🎮' },
              { label: 'Pixel Art Generator', emoji: '🎨' },
            ]}
            className="[&_a]:text-gray-400 [&_a:hover]:text-white [&_span.text-gray-700]:text-white [&_span.text-gray-400]:text-gray-600"
          />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 md:py-10">
        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-5xl font-black text-white mb-3">
            <span className="bg-gradient-to-r from-green-400 via-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              Minecraft Pixel Art
            </span>{' '}
            Generator
          </h1>
          <p className="text-gray-400 text-sm md:text-base max-w-2xl mx-auto">
            Upload any image and convert it to Minecraft block pixel art. Get a
            block-by-block guide with wool, concrete, and terracotta.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel - Controls */}
          <div className="space-y-4">
            {/* Upload */}
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5">
              <h2 className="text-white font-bold text-lg mb-3 flex items-center gap-2">
                📤 Upload Image
              </h2>
              <div
                className="border-2 border-dashed border-white/20 rounded-xl p-6 text-center cursor-pointer hover:border-green-400/50 hover:bg-green-400/5 transition-all"
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
              >
                {uploadedImage ? (
                  <div className="space-y-2">
                    <img
                      src={uploadedImage}
                      alt="Uploaded"
                      className="max-h-32 mx-auto rounded-lg shadow-lg"
                    />
                    <p className="text-gray-400 text-xs">Click or drop to replace</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="text-4xl">🖼️</div>
                    <p className="text-gray-300 font-medium">
                      Drop an image here
                    </p>
                    <p className="text-gray-500 text-xs">
                      or click to browse • PNG, JPG, WEBP
                    </p>
                  </div>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>

            {/* Grid Size */}
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5">
              <h2 className="text-white font-bold text-lg mb-3 flex items-center gap-2">
                📐 Grid Size
              </h2>
              <div className="grid grid-cols-4 gap-2">
                {([16, 32, 64, 128] as GridSize[]).map((size) => (
                  <button
                    key={size}
                    onClick={() => setGridSize(size)}
                    className={`px-3 py-2 rounded-lg text-sm font-bold transition-all ${
                      gridSize === size
                        ? 'bg-green-500 text-white shadow-lg shadow-green-500/30'
                        : 'bg-white/10 text-gray-300 hover:bg-white/20'
                    }`}
                  >
                    {size}×{size}
                  </button>
                ))}
              </div>
              <p className="text-gray-500 text-xs mt-2">
                Larger = more detail, more blocks needed
              </p>
            </div>

            {/* Block Palette */}
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5">
              <h2 className="text-white font-bold text-lg mb-3 flex items-center gap-2">
                🧱 Block Palette
              </h2>
              <div className="grid grid-cols-2 gap-2">
                {(
                  [
                    ['all', '🎨 All Blocks'],
                    ['wool', '🧶 Wool'],
                    ['concrete', '🧱 Concrete'],
                    ['terracotta', '🏺 Terracotta'],
                  ] as [BlockCategory, string][]
                ).map(([cat, label]) => (
                  <button
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className={`px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                      category === cat
                        ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                        : 'bg-white/10 text-gray-300 hover:bg-white/20'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <p className="text-gray-500 text-xs mt-2">
                {filteredBlocks.length} blocks available
              </p>
            </div>

            {/* Options */}
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5">
              <h2 className="text-white font-bold text-lg mb-3 flex items-center gap-2">
                ⚙️ Options
              </h2>
              <div className="space-y-3">
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-gray-300 text-sm">Show Grid Lines</span>
                  <div
                    className={`w-10 h-6 rounded-full transition-all ${
                      showGrid ? 'bg-green-500' : 'bg-white/20'
                    } relative`}
                    onClick={() => setShowGrid(!showGrid)}
                  >
                    <div
                      className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${
                        showGrid ? 'left-5' : 'left-1'
                      }`}
                    />
                  </div>
                </label>
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-gray-300 text-sm">Dithering</span>
                  <div
                    className={`w-10 h-6 rounded-full transition-all ${
                      dithering ? 'bg-green-500' : 'bg-white/20'
                    } relative`}
                    onClick={() => setDithering(!dithering)}
                  >
                    <div
                      className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${
                        dithering ? 'left-5' : 'left-1'
                      }`}
                    />
                  </div>
                </label>
              </div>
              <p className="text-gray-500 text-xs mt-2">
                Dithering creates smoother color transitions
              </p>
            </div>

            {/* Zoom */}
            {pixelGrid && (
              <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5">
                <h2 className="text-white font-bold text-lg mb-3 flex items-center gap-2">
                  🔍 Zoom
                </h2>
                <input
                  type="range"
                  min={0.5}
                  max={4}
                  step={0.25}
                  value={zoom}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="w-full accent-green-500"
                />
                <div className="flex justify-between text-gray-500 text-xs mt-1">
                  <span>50%</span>
                  <span className="text-green-400 font-bold">{Math.round(zoom * 100)}%</span>
                  <span>400%</span>
                </div>
              </div>
            )}
          </div>

          {/* Center - Result Preview */}
          <div className="lg:col-span-2 space-y-4">
            {isProcessing && (
              <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-12 text-center">
                <div className="animate-spin text-4xl mb-3">⚙️</div>
                <p className="text-white font-bold">Processing image...</p>
                <p className="text-gray-400 text-sm">
                  Matching {gridSize * gridSize} pixels to Minecraft blocks
                </p>
              </div>
            )}

            {!pixelGrid && !isProcessing && (
              <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-12 text-center">
                <div className="text-6xl mb-4">⛏️</div>
                <h2 className="text-white text-xl font-bold mb-2">
                  Upload an image to get started
                </h2>
                <p className="text-gray-400 max-w-md mx-auto">
                  Your image will be converted to Minecraft blocks. Try photos,
                  drawings, pixel art, logos, or flags!
                </p>
                <div className="flex flex-wrap gap-2 justify-center mt-4">
                  {['🏞️ Photos', '🎨 Drawings', '🖼️ Pixel Art', '🏳️ Flags', '😀 Icons'].map(
                    (tag) => (
                      <span
                        key={tag}
                        className="bg-white/10 text-gray-300 px-3 py-1 rounded-full text-xs"
                      >
                        {tag}
                      </span>
                    )
                  )}
                </div>
              </div>
            )}

            {pixelGrid && !isProcessing && (
              <>
                {/* Action Bar */}
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={downloadPNG}
                    className="bg-green-500 hover:bg-green-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg shadow-green-500/30 flex items-center gap-2"
                  >
                    📥 Download PNG
                  </button>
                  <button
                    onClick={() => setShowBlockList(!showBlockList)}
                    className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
                      showBlockList
                        ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30'
                        : 'bg-white/10 text-gray-300 hover:bg-white/20'
                    }`}
                  >
                    📋 Block List ({blockCounts.length})
                  </button>
                  <div className="ml-auto text-gray-400 text-sm">
                    <span className="text-white font-bold">{totalBlocks}</span> blocks total •{' '}
                    <span className="text-white font-bold">{gridSize}×{gridSize}</span> grid
                  </div>
                </div>

                {/* Result Canvas */}
                <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 overflow-auto">
                  <div
                    className="relative mx-auto"
                    style={{
                      width: `${gridSize * 16 * zoom}px`,
                      height: `${gridSize * 16 * zoom}px`,
                      maxWidth: '100%',
                    }}
                  >
                    <canvas
                      ref={resultCanvasRef}
                      className="w-full h-full rounded-lg"
                      style={{ imageRendering: 'pixelated' }}
                      onMouseMove={(e) => {
                        if (!pixelGrid) return;
                        const rect = e.currentTarget.getBoundingClientRect();
                        const scaleX = gridSize / rect.width;
                        const scaleY = gridSize / rect.height;
                        const x = Math.floor((e.clientX - rect.left) * scaleX);
                        const y = Math.floor((e.clientY - rect.top) * scaleY);
                        if (x >= 0 && x < gridSize && y >= 0 && y < gridSize) {
                          setHoveredBlock(pixelGrid[y][x]);
                        }
                      }}
                      onMouseLeave={() => setHoveredBlock(null)}
                    />
                  </div>

                  {/* Hover info */}
                  {hoveredBlock && hoveredBlock.block.id !== 'air' && (
                    <div className="mt-3 flex items-center gap-3 bg-black/40 rounded-xl px-4 py-2">
                      <div
                        className="w-8 h-8 rounded-md border border-white/20 shadow-inner"
                        style={{ backgroundColor: hoveredBlock.block.hex }}
                      />
                      <div>
                        <p className="text-white text-sm font-bold">
                          {hoveredBlock.block.name}
                        </p>
                        <p className="text-gray-400 text-xs">
                          Position: ({hoveredBlock.x}, {hoveredBlock.y}) •{' '}
                          {hoveredBlock.block.hex} •{' '}
                          {hoveredBlock.block.category}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Block List */}
                {showBlockList && (
                  <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5">
                    <h2 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                      📋 Block List — {blockCounts.length} unique blocks
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-96 overflow-y-auto pr-2">
                      {blockCounts.map(({ block, count }) => (
                        <div
                          key={block.id}
                          className="flex items-center gap-3 bg-black/30 rounded-lg px-3 py-2 hover:bg-white/10 transition-all"
                        >
                          <div
                            className="w-8 h-8 rounded-md border border-white/20 flex-shrink-0 shadow-inner"
                            style={{ backgroundColor: block.hex }}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-white text-sm font-medium truncate">
                              {block.name}
                            </p>
                            <p className="text-gray-500 text-xs">
                              {block.category}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-green-400 font-bold text-sm">
                              ×{count}
                            </p>
                            <p className="text-gray-500 text-xs">
                              {Math.ceil(count / 64)} stacks
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Summary */}
                    <div className="mt-4 pt-4 border-t border-white/10">
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <p className="text-2xl font-black text-white">
                            {totalBlocks}
                          </p>
                          <p className="text-gray-400 text-xs">Total Blocks</p>
                        </div>
                        <div>
                          <p className="text-2xl font-black text-white">
                            {Math.ceil(totalBlocks / 64)}
                          </p>
                          <p className="text-gray-400 text-xs">Stacks</p>
                        </div>
                        <div>
                          <p className="text-2xl font-black text-white">
                            {blockCounts.length}
                          </p>
                          <p className="text-gray-400 text-xs">Unique Types</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Hidden processing canvas */}
        <canvas ref={canvasRef} className="hidden" />

        {/* SEO Content */}
        <div className="mt-16 space-y-8 max-w-3xl mx-auto">
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 md:p-8">
            <h2 className="text-white font-bold text-xl mb-4">
              How to Make Minecraft Pixel Art from Any Image
            </h2>
            <div className="space-y-3 text-gray-400 text-sm leading-relaxed">
              <p>
                Our <strong className="text-white">Minecraft Pixel Art Generator</strong> converts
                any photo or drawing into a block-by-block building guide. Simply
                upload your image, choose your grid size and block palette, and
                get an instant preview of your creation.
              </p>
              <p>
                The tool matches each pixel to the closest Minecraft block color
                using <strong className="text-white">wool</strong>,{' '}
                <strong className="text-white">concrete</strong>, and{' '}
                <strong className="text-white">terracotta</strong> blocks.
                Enable dithering for smoother color gradients, especially useful
                for photographs and complex artwork.
              </p>
              <h3 className="text-white font-bold text-lg pt-2">
                Tips for Great Pixel Art
              </h3>
              <ul className="list-disc list-inside space-y-1">
                <li>Start with 32×32 for a good balance of detail and build time</li>
                <li>High-contrast images work best with limited block palettes</li>
                <li>Use &quot;Concrete&quot; palette for the most vibrant colors</li>
                <li>Enable dithering for smoother photographs</li>
                <li>Flags, logos, and pixel art convert exceptionally well</li>
              </ul>
              <h3 className="text-white font-bold text-lg pt-2">
                Block Palettes Explained
              </h3>
              <p>
                <strong className="text-white">Wool</strong> — 16 colors, easy to obtain in
                survival mode. Great for beginners.
              </p>
              <p>
                <strong className="text-white">Concrete</strong> — 16 vibrant colors with no
                texture grain. Best for clean, modern pixel art.
              </p>
              <p>
                <strong className="text-white">Terracotta</strong> — 16 earthy, muted tones.
                Perfect for natural scenes and portraits.
              </p>
              <p>
                <strong className="text-white">All Blocks</strong> — Combines all 48 block colors
                for maximum accuracy. Use this for the best possible color matching.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
