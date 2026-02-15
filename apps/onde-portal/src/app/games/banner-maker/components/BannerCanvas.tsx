'use client';

import { useRef, useEffect } from 'react';

// Minecraft banner is 20x40 pixels (1:2 ratio), rendered at scale
const BANNER_W = 20;
const BANNER_H = 40;

interface BannerLayer {
  pattern: string;
  color: string;
}

interface BannerCanvasProps {
  baseColor: string;
  layers: BannerLayer[];
  scale?: number;
}

// All 16 Minecraft dye colors with their hex values
export const MC_COLORS: Record<string, string> = {
  white: '#F9FFFE',
  orange: '#F9801D',
  magenta: '#C74EBD',
  light_blue: '#3AB3DA',
  yellow: '#FED83D',
  lime: '#80C71F',
  pink: '#F38BAA',
  gray: '#474F52',
  light_gray: '#9D9D97',
  cyan: '#169C9C',
  purple: '#8932B8',
  blue: '#3C44AA',
  brown: '#835432',
  green: '#5E7C16',
  red: '#B02E26',
  black: '#1D1D21',
};

// Banner pattern definitions - each returns a function that determines
// if a pixel at (x, y) should be colored
type PatternFn = (x: number, y: number, w: number, h: number) => boolean;

export const PATTERNS: Record<string, { name: string; icon: string; fn: PatternFn }> = {
  base: { name: 'Base', icon: '⬛', fn: () => true },
  stripe_bottom: { name: 'Bottom Stripe', icon: '▃', fn: (_x, y, _w, h) => y >= h * 0.667 },
  stripe_top: { name: 'Top Stripe', icon: '▀', fn: (_x, y, _w, h) => y < h * 0.333 },
  stripe_left: { name: 'Left Stripe', icon: '▌', fn: (x, _y, w) => x < w * 0.333 },
  stripe_right: { name: 'Right Stripe', icon: '▐', fn: (x, _y, w) => x >= w * 0.667 },
  stripe_center: { name: 'Center Stripe (V)', icon: '┃', fn: (x, _y, w) => x >= w * 0.333 && x < w * 0.667 },
  stripe_middle: { name: 'Middle Stripe (H)', icon: '━', fn: (_x, y, _w, h) => y >= h * 0.333 && y < h * 0.667 },
  stripe_downright: {
    name: 'Down Right Diagonal',
    icon: '╲',
    fn: (x, y, w, h) => {
      const ratio = x / w - y / h;
      return Math.abs(ratio) < 0.2;
    },
  },
  stripe_downleft: {
    name: 'Down Left Diagonal',
    icon: '╱',
    fn: (x, y, w, h) => {
      const ratio = (w - x) / w - y / h;
      return Math.abs(ratio) < 0.2;
    },
  },
  cross: {
    name: 'Diagonal Cross',
    icon: '╳',
    fn: (x, y, w, h) => {
      const r1 = x / w - y / h;
      const r2 = (w - x) / w - y / h;
      return Math.abs(r1) < 0.2 || Math.abs(r2) < 0.2;
    },
  },
  straight_cross: {
    name: 'Plus Cross',
    icon: '✚',
    fn: (x, y, w, h) =>
      (x >= w * 0.333 && x < w * 0.667) || (y >= h * 0.333 && y < h * 0.667),
  },
  triangle_bottom: {
    name: 'Bottom Triangle',
    icon: '▽',
    fn: (x, y, w, h) => {
      const progress = (y - h * 0.5) / (h * 0.5);
      if (progress < 0) return false;
      const halfWidth = progress * w * 0.5;
      return x >= w * 0.5 - halfWidth && x < w * 0.5 + halfWidth;
    },
  },
  triangle_top: {
    name: 'Top Triangle',
    icon: '△',
    fn: (x, y, w, h) => {
      const progress = 1 - y / (h * 0.5);
      if (progress < 0) return false;
      const halfWidth = progress * w * 0.5;
      return x >= w * 0.5 - halfWidth && x < w * 0.5 + halfWidth;
    },
  },
  square_bottom_left: {
    name: 'Bottom Left Corner',
    icon: '◣',
    fn: (x, y, w, h) => x < w * 0.5 && y >= h * 0.5,
  },
  square_bottom_right: {
    name: 'Bottom Right Corner',
    icon: '◢',
    fn: (x, y, w, h) => x >= w * 0.5 && y >= h * 0.5,
  },
  square_top_left: {
    name: 'Top Left Corner',
    icon: '◤',
    fn: (x, y, w) => x < w * 0.5 && y < 20,
  },
  square_top_right: {
    name: 'Top Right Corner',
    icon: '◥',
    fn: (x, y, w) => x >= w * 0.5 && y < 20,
  },
  half_horizontal: {
    name: 'Top Half',
    icon: '⬒',
    fn: (_x, y, _w, h) => y < h * 0.5,
  },
  half_horizontal_bottom: {
    name: 'Bottom Half',
    icon: '⬓',
    fn: (_x, y, _w, h) => y >= h * 0.5,
  },
  half_vertical: {
    name: 'Left Half',
    icon: '◧',
    fn: (x, _y, w) => x < w * 0.5,
  },
  half_vertical_right: {
    name: 'Right Half',
    icon: '◨',
    fn: (x, _y, w) => x >= w * 0.5,
  },
  rhombus: {
    name: 'Diamond',
    icon: '◆',
    fn: (x, y, w, h) => {
      const dx = Math.abs(x - w * 0.5) / (w * 0.5);
      const dy = Math.abs(y - h * 0.5) / (h * 0.5);
      return dx + dy < 0.7;
    },
  },
  circle: {
    name: 'Circle',
    icon: '●',
    fn: (x, y, w, h) => {
      const dx = (x - w * 0.5) / (w * 0.4);
      const dy = (y - h * 0.5) / (h * 0.4);
      return dx * dx + dy * dy < 1;
    },
  },
  border: {
    name: 'Border',
    icon: '▣',
    fn: (x, y, w, h) => x < 2 || x >= w - 2 || y < 2 || y >= h - 2,
  },
  curly_border: {
    name: 'Curly Border',
    icon: '❧',
    fn: (x, y, w, h) => {
      if (x < 3 || x >= w - 3 || y < 3 || y >= h - 3) return true;
      // Wavy effect
      const wave = Math.sin(((x + y) / 3) * Math.PI) > 0.5;
      return wave && (x < 5 || x >= w - 5 || y < 5 || y >= h - 5);
    },
  },
  gradient: {
    name: 'Gradient Top',
    icon: '▓',
    fn: (_x, y, _w, h) => Math.random() < 1 - y / h,
  },
  gradient_up: {
    name: 'Gradient Bottom',
    icon: '░',
    fn: (_x, y, _w, h) => Math.random() < y / h,
  },
  bricks: {
    name: 'Bricks',
    icon: '🧱',
    fn: (x, y) => {
      const row = Math.floor(y / 4);
      const offset = row % 2 === 0 ? 0 : 5;
      return y % 4 === 0 || (x + offset) % 10 === 0;
    },
  },
  creeper: {
    name: 'Creeper Face',
    icon: '💚',
    fn: (x, y, w, h) => {
      const px = Math.floor((x / w) * 8);
      const py = Math.floor((y / h) * 8);
      // Simple creeper face pattern
      if (py === 2 && (px === 1 || px === 2 || px === 5 || px === 6)) return true;
      if (py === 3 && (px === 1 || px === 2 || px === 5 || px === 6)) return true;
      if (py === 4 && (px === 3 || px === 4)) return true;
      if (py === 5 && px >= 2 && px <= 5) return true;
      if (py === 6 && (px === 2 || px === 3 || px === 4 || px === 5)) return true;
      return false;
    },
  },
  skull: {
    name: 'Skull',
    icon: '💀',
    fn: (x, y, w, h) => {
      const px = Math.floor((x / w) * 8);
      const py = Math.floor((y / h) * 8);
      if (py === 1 && px >= 2 && px <= 5) return true;
      if (py === 2 && px >= 1 && px <= 6) return true;
      if (py === 3 && (px === 1 || px === 2 || px === 5 || px === 6)) return true;
      if (py === 4 && px >= 1 && px <= 6) return true;
      if (py === 5 && (px === 2 || px === 4 || px === 5)) return true;
      if (py === 6 && px >= 2 && px <= 5) return true;
      return false;
    },
  },
  flower: {
    name: 'Flower',
    icon: '🌸',
    fn: (x, y, w, h) => {
      const cx = w * 0.5, cy = h * 0.45;
      const dx = x - cx, dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const angle = Math.atan2(dy, dx);
      const petal = Math.abs(Math.sin(angle * 3)) * 6;
      return dist < petal + 2;
    },
  },
  mojang: {
    name: 'Thing',
    icon: '⚙️',
    fn: (x, y, w, h) => {
      const px = Math.floor((x / w) * 10);
      const py = Math.floor((y / h) * 10);
      // Simple "thing" / Mojang logo pattern
      if (py >= 3 && py <= 6 && px >= 2 && px <= 7) return true;
      if (py === 2 && px >= 3 && px <= 6) return true;
      if (py === 7 && px >= 3 && px <= 6) return true;
      return false;
    },
  },
  globe: {
    name: 'Globe',
    icon: '🌍',
    fn: (x, y, w, h) => {
      const dx = (x - w * 0.5) / (w * 0.35);
      const dy = (y - h * 0.4) / (h * 0.35);
      if (dx * dx + dy * dy > 1) return false;
      // Add some "continent" shapes
      return Math.sin(dx * 5 + dy * 3) > 0;
    },
  },
  piglin: {
    name: 'Snout',
    icon: '🐽',
    fn: (x, y, w, h) => {
      const px = Math.floor((x / w) * 8);
      const py = Math.floor((y / h) * 8);
      if (py >= 3 && py <= 5 && px >= 2 && px <= 5) return true;
      if (py === 4 && (px === 3 || px === 4)) return true;
      return false;
    },
  },
};

function hexToRgba(hex: string): [number, number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return [r, g, b, 255];
}

export default function BannerCanvas({ baseColor, layers, scale = 8 }: BannerCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Create offscreen buffer
    const imgData = ctx.createImageData(BANNER_W, BANNER_H);

    // Start with base color
    const baseRgba = hexToRgba(MC_COLORS[baseColor] || MC_COLORS.white);
    for (let y = 0; y < BANNER_H; y++) {
      for (let x = 0; x < BANNER_W; x++) {
        const idx = (y * BANNER_W + x) * 4;
        imgData.data[idx] = baseRgba[0];
        imgData.data[idx + 1] = baseRgba[1];
        imgData.data[idx + 2] = baseRgba[2];
        imgData.data[idx + 3] = baseRgba[3];
      }
    }

    // Apply each layer
    for (const layer of layers) {
      const patternDef = PATTERNS[layer.pattern];
      if (!patternDef) continue;
      const rgba = hexToRgba(MC_COLORS[layer.color] || MC_COLORS.white);
      for (let y = 0; y < BANNER_H; y++) {
        for (let x = 0; x < BANNER_W; x++) {
          if (patternDef.fn(x, y, BANNER_W, BANNER_H)) {
            const idx = (y * BANNER_W + x) * 4;
            imgData.data[idx] = rgba[0];
            imgData.data[idx + 1] = rgba[1];
            imgData.data[idx + 2] = rgba[2];
            imgData.data[idx + 3] = rgba[3];
          }
        }
      }
    }

    // Draw to canvas
    const tmpCanvas = document.createElement('canvas');
    tmpCanvas.width = BANNER_W;
    tmpCanvas.height = BANNER_H;
    const tmpCtx = tmpCanvas.getContext('2d')!;
    tmpCtx.putImageData(imgData, 0, 0);

    canvas.width = BANNER_W * scale;
    canvas.height = BANNER_H * scale;
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(tmpCanvas, 0, 0, BANNER_W * scale, BANNER_H * scale);

    // Draw banner pole
    ctx.fillStyle = '#8B4513';
    const poleX = BANNER_W * scale + 2;
    ctx.fillRect(BANNER_W * scale * 0.45, -scale, scale, BANNER_H * scale + scale * 2);
  }, [baseColor, layers, scale]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        imageRendering: 'pixelated',
        width: BANNER_W * scale,
        height: BANNER_H * scale,
      }}
      className="rounded-lg shadow-xl"
    />
  );
}
