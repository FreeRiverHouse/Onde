'use client';

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import Link from 'next/link';

/* ─── Types ─────────────────────────────────────────────── */

interface AvatarConfig {
  bodyShape: number;
  skinColor: string;
  hairStyle: number;
  hairColor: string;
  face: number;
  shirtStyle: number;
  shirtColor: string;
  pantsStyle: number;
  pantsColor: string;
  hat: number;
  glasses: number;
  accessory: number;
  pet: number;
  background: number;
}

type TabId = 'body' | 'hair' | 'face' | 'shirt' | 'pants' | 'hat' | 'glasses' | 'accessory' | 'pet' | 'background';

/* ─── Data ──────────────────────────────────────────────── */

const SKIN_COLORS = [
  '#FFDBB4', '#E8B898', '#D4956B', '#C68642', '#8D5524', '#5C3317',
  '#FFE0BD', '#F1C27D', '#FFDBAC', '#F5CBA7', '#784212', '#3B1F0B',
];

const HAIR_COLORS = [
  '#2C1810', '#4A2C17', '#8B4513', '#D2691E', '#DAA520', '#FFD700',
  '#FF6347', '#FF1493', '#8A2BE2', '#00CED1', '#32CD32', '#808080',
];

const SHIRT_COLORS = [
  '#FF4444', '#FF8800', '#FFDD00', '#44BB44', '#2299FF', '#8844DD',
  '#FF69B4', '#00CED1', '#333333', '#FFFFFF', '#FF6347', '#7B68EE',
];

const PANTS_COLORS = [
  '#1a1a4e', '#2C3E50', '#4A4A4A', '#8B4513', '#556B2F', '#191970',
  '#696969', '#F5F5DC', '#800000', '#008080', '#4B0082', '#2F4F4F',
];

const BODY_SHAPES = [
  { id: 0, name: 'Classic', desc: 'The OG blocky style' },
  { id: 1, name: 'Slim', desc: 'Sleek and thin' },
  { id: 2, name: 'Strong', desc: 'Beefy and powerful' },
  { id: 3, name: 'Round', desc: 'Cute and chubby' },
  { id: 4, name: 'Tall', desc: 'Extra height!' },
];

const HAIR_STYLES = [
  { id: 0, name: 'None', emoji: '🚫' },
  { id: 1, name: 'Spiky', emoji: '⚡' },
  { id: 2, name: 'Flowing', emoji: '💇' },
  { id: 3, name: 'Curly', emoji: '🌀' },
  { id: 4, name: 'Ponytail', emoji: '🎀' },
  { id: 5, name: 'Mohawk', emoji: '🦅' },
  { id: 6, name: 'Afro', emoji: '☁️' },
  { id: 7, name: 'Pigtails', emoji: '🎀' },
  { id: 8, name: 'Buzz Cut', emoji: '✂️' },
  { id: 9, name: 'Long', emoji: '🧜' },
  { id: 10, name: 'Side Part', emoji: '💈' },
  { id: 11, name: 'Messy', emoji: '💥' },
];

const FACES = [
  { id: 0, name: 'Happy', eyes: '◕ ◕', mouth: '⌣', emoji: '😊' },
  { id: 1, name: 'Cool', eyes: '⊘ ⊘', mouth: '▬', emoji: '😎' },
  { id: 2, name: 'Wink', eyes: '◕ ◡', mouth: '⌣', emoji: '😉' },
  { id: 3, name: 'Surprised', eyes: '⊙ ⊙', mouth: 'O', emoji: '😮' },
  { id: 4, name: 'Angry', eyes: '▼ ▼', mouth: '∧', emoji: '😠' },
  { id: 5, name: 'Silly', eyes: '◑ ◐', mouth: 'P', emoji: '😜' },
  { id: 6, name: 'Sleepy', eyes: '— —', mouth: '∪', emoji: '😴' },
  { id: 7, name: 'Cat', eyes: '^ ^', mouth: 'ω', emoji: '😺' },
  { id: 8, name: 'Robot', eyes: '◻ ◻', mouth: '═', emoji: '🤖' },
  { id: 9, name: 'Star Eyes', eyes: '★ ★', mouth: '⌣', emoji: '🤩' },
  { id: 10, name: 'Heart', eyes: '♥ ♥', mouth: '⌣', emoji: '😍' },
  { id: 11, name: 'Smirk', eyes: '◕ ◕', mouth: '⌐', emoji: '😏' },
];

const SHIRT_STYLES = [
  { id: 0, name: 'Plain Tee', emoji: '👕' },
  { id: 1, name: 'Hoodie', emoji: '🧥' },
  { id: 2, name: 'Jacket', emoji: '🧥' },
  { id: 3, name: 'Tank Top', emoji: '🎽' },
  { id: 4, name: 'Stripe Tee', emoji: '👕' },
  { id: 5, name: 'V-Neck', emoji: '👕' },
  { id: 6, name: 'Polo', emoji: '👔' },
  { id: 7, name: 'Jersey', emoji: '🎽' },
];

const PANTS_STYLES = [
  { id: 0, name: 'Jeans', emoji: '👖' },
  { id: 1, name: 'Shorts', emoji: '🩳' },
  { id: 2, name: 'Cargo', emoji: '👖' },
  { id: 3, name: 'Skirt', emoji: '👗' },
  { id: 4, name: 'Joggers', emoji: '👖' },
  { id: 5, name: 'Overalls', emoji: '🥻' },
];

const HATS = [
  { id: 0, name: 'None', render: '' },
  { id: 1, name: 'Cap', render: '🧢' },
  { id: 2, name: 'Crown', render: '👑' },
  { id: 3, name: 'Top Hat', render: '🎩' },
  { id: 4, name: 'Beanie', render: '🧶' },
  { id: 5, name: 'Viking', render: '⚔️' },
  { id: 6, name: 'Wizard', render: '🧙' },
  { id: 7, name: 'Bunny Ears', render: '🐰' },
  { id: 8, name: 'Cat Ears', render: '🐱' },
  { id: 9, name: 'Headband', render: '🎗️' },
  { id: 10, name: 'Tiara', render: '👸' },
  { id: 11, name: 'Helmet', render: '⛑️' },
];

const GLASSES_LIST = [
  { id: 0, name: 'None', render: '' },
  { id: 1, name: 'Round', render: '👓' },
  { id: 2, name: 'Sunglasses', render: '🕶️' },
  { id: 3, name: 'Monocle', render: '🧐' },
  { id: 4, name: 'Nerd', render: '🤓' },
  { id: 5, name: 'Sport', render: '🥽' },
  { id: 6, name: 'Star', render: '⭐' },
  { id: 7, name: 'Heart', render: '💖' },
];

const ACCESSORIES = [
  { id: 0, name: 'None', render: '' },
  { id: 1, name: 'Wings', render: '🪽' },
  { id: 2, name: 'Cape', render: '🦸' },
  { id: 3, name: 'Sword', render: '⚔️' },
  { id: 4, name: 'Shield', render: '🛡️' },
  { id: 5, name: 'Guitar', render: '🎸' },
  { id: 6, name: 'Wand', render: '🪄' },
  { id: 7, name: 'Backpack', render: '🎒' },
  { id: 8, name: 'Skateboard', render: '🛹' },
  { id: 9, name: 'Balloon', render: '🎈' },
  { id: 10, name: 'Boombox', render: '📻' },
];

const PETS = [
  { id: 0, name: 'None', render: '' },
  { id: 1, name: 'Dog', render: '🐕' },
  { id: 2, name: 'Cat', render: '🐈' },
  { id: 3, name: 'Dragon', render: '🐲' },
  { id: 4, name: 'Unicorn', render: '🦄' },
  { id: 5, name: 'Fox', render: '🦊' },
  { id: 6, name: 'Penguin', render: '🐧' },
  { id: 7, name: 'Parrot', render: '🦜' },
  { id: 8, name: 'Bunny', render: '🐇' },
  { id: 9, name: 'Panda', render: '🐼' },
];

const BACKGROUNDS = [
  { id: 0, name: 'Sky Blue', colors: ['#87CEEB', '#B0E0E6'] },
  { id: 1, name: 'Sunset', colors: ['#FF7E5F', '#FEB47B'] },
  { id: 2, name: 'Forest', colors: ['#134E5E', '#71B280'] },
  { id: 3, name: 'Galaxy', colors: ['#0F0C29', '#302B63', '#24243E'] },
  { id: 4, name: 'Candy', colors: ['#FF9A9E', '#FECFEF', '#FFECD2'] },
  { id: 5, name: 'Ocean', colors: ['#2193b0', '#6dd5ed'] },
  { id: 6, name: 'Lava', colors: ['#f12711', '#f5af19'] },
  { id: 7, name: 'Neon', colors: ['#0ff', '#f0f', '#ff0'] },
  { id: 8, name: 'Arctic', colors: ['#E0EAFC', '#CFDEF3'] },
  { id: 9, name: 'Rainbow', colors: ['#ff0000', '#ff8800', '#ffff00', '#00ff00', '#0088ff', '#8800ff'] },
];

const TABS: { id: TabId; name: string; emoji: string }[] = [
  { id: 'body', name: 'Body', emoji: '🧍' },
  { id: 'hair', name: 'Hair', emoji: '💇' },
  { id: 'face', name: 'Face', emoji: '😊' },
  { id: 'shirt', name: 'Shirt', emoji: '👕' },
  { id: 'pants', name: 'Pants', emoji: '👖' },
  { id: 'hat', name: 'Hat', emoji: '🎩' },
  { id: 'glasses', name: 'Glasses', emoji: '🕶️' },
  { id: 'accessory', name: 'Extra', emoji: '⚔️' },
  { id: 'pet', name: 'Pet', emoji: '🐾' },
  { id: 'background', name: 'BG', emoji: '🖼️' },
];

const DEFAULT_CONFIG: AvatarConfig = {
  bodyShape: 0,
  skinColor: '#FFDBB4',
  hairStyle: 1,
  hairColor: '#2C1810',
  face: 0,
  shirtStyle: 0,
  shirtColor: '#2299FF',
  pantsStyle: 0,
  pantsColor: '#1a1a4e',
  hat: 0,
  glasses: 0,
  accessory: 0,
  pet: 0,
  background: 0,
};

/* ─── Helpers ───────────────────────────────────────────── */

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function encodeConfig(config: AvatarConfig): string {
  const vals = [
    config.bodyShape,
    SKIN_COLORS.indexOf(config.skinColor),
    config.hairStyle,
    HAIR_COLORS.indexOf(config.hairColor),
    config.face,
    config.shirtStyle,
    SHIRT_COLORS.indexOf(config.shirtColor),
    config.pantsStyle,
    PANTS_COLORS.indexOf(config.pantsColor),
    config.hat,
    config.glasses,
    config.accessory,
    config.pet,
    config.background,
  ];
  return vals.join('-');
}

function decodeConfig(str: string): AvatarConfig | null {
  try {
    const parts = str.split('-').map(Number);
    if (parts.length !== 14 || parts.some(isNaN)) return null;
    return {
      bodyShape: parts[0],
      skinColor: SKIN_COLORS[parts[1]] || SKIN_COLORS[0],
      hairStyle: parts[2],
      hairColor: HAIR_COLORS[parts[3]] || HAIR_COLORS[0],
      face: parts[4],
      shirtStyle: parts[5],
      shirtColor: SHIRT_COLORS[parts[6]] || SHIRT_COLORS[0],
      pantsStyle: parts[7],
      pantsColor: PANTS_COLORS[parts[8]] || PANTS_COLORS[0],
      hat: parts[9],
      glasses: parts[10],
      accessory: parts[11],
      pet: parts[12],
      background: parts[13],
    };
  } catch {
    return null;
  }
}

function darken(hex: string, amount: number): string {
  const r = Math.max(0, parseInt(hex.slice(1, 3), 16) - amount);
  const g = Math.max(0, parseInt(hex.slice(3, 5), 16) - amount);
  const b = Math.max(0, parseInt(hex.slice(5, 7), 16) - amount);
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

function lighten(hex: string, amount: number): string {
  const r = Math.min(255, parseInt(hex.slice(1, 3), 16) + amount);
  const g = Math.min(255, parseInt(hex.slice(3, 5), 16) + amount);
  const b = Math.min(255, parseInt(hex.slice(5, 7), 16) + amount);
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

/* ─── Avatar Renderer (SVG-based) ───────────────────────── */

function AvatarSVG({ config, size = 300, id = 'avatar' }: { config: AvatarConfig; size?: number; id?: string }) {
  const bg = BACKGROUNDS[config.background] || BACKGROUNDS[0];
  const face = FACES[config.face] || FACES[0];
  const bodyShape = BODY_SHAPES[config.bodyShape] || BODY_SHAPES[0];

  // Body dimensions based on shape
  const bodyW = bodyShape.id === 1 ? 60 : bodyShape.id === 2 ? 80 : bodyShape.id === 3 ? 75 : 70;
  const bodyH = bodyShape.id === 4 ? 80 : bodyShape.id === 3 ? 60 : 70;
  const headSize = bodyShape.id === 3 ? 58 : 52;
  const legW = bodyShape.id === 1 ? 18 : bodyShape.id === 2 ? 26 : bodyShape.id === 3 ? 24 : 22;
  const armW = bodyShape.id === 1 ? 14 : bodyShape.id === 2 ? 22 : 16;

  const cx = 150;
  const headY = bodyShape.id === 4 ? 48 : 58;
  const bodyY = headY + headSize / 2 + 2;
  const legY = bodyY + bodyH;

  // Background gradient
  const bgGradId = `${id}-bg`;
  const skinShadow = darken(config.skinColor, 30);

  return (
    <svg width={size} height={size} viewBox="0 0 300 300" xmlns="http://www.w3.org/2000/svg">
      {/* Background */}
      <defs>
        <linearGradient id={bgGradId} x1="0%" y1="0%" x2="0%" y2="100%">
          {bg.colors.map((c, i) => (
            <stop key={i} offset={`${(i / (bg.colors.length - 1)) * 100}%`} stopColor={c} />
          ))}
        </linearGradient>
        <filter id={`${id}-shadow`}>
          <feDropShadow dx="2" dy="2" stdDeviation="2" floodOpacity="0.2" />
        </filter>
      </defs>

      <rect width="300" height="300" fill={`url(#${bgGradId})`} rx="16" />

      {/* Floor line */}
      <ellipse cx={cx} cy={legY + 42} rx="80" ry="8" fill="rgba(0,0,0,0.1)" />

      {/* === ACCESSORY (behind body) === */}
      {config.accessory === 1 && ( /* Wings */
        <>
          <ellipse cx={cx - 55} cy={bodyY + bodyH / 3} rx="25" ry="35" fill="rgba(255,255,255,0.7)" stroke="#ddd" strokeWidth="1" transform={`rotate(-15 ${cx - 55} ${bodyY + bodyH / 3})`} />
          <ellipse cx={cx + 55} cy={bodyY + bodyH / 3} rx="25" ry="35" fill="rgba(255,255,255,0.7)" stroke="#ddd" strokeWidth="1" transform={`rotate(15 ${cx + 55} ${bodyY + bodyH / 3})`} />
        </>
      )}
      {config.accessory === 2 && ( /* Cape */
        <path d={`M${cx - bodyW / 2 + 5} ${bodyY + 5} Q${cx} ${legY + 50} ${cx + bodyW / 2 - 5} ${bodyY + 5}`}
          fill="#CC0000" stroke="#990000" strokeWidth="1" opacity="0.85" />
      )}

      {/* === LEGS === */}
      <rect x={cx - legW - 4} y={legY} width={legW} height={38} rx="4"
        fill={config.pantsColor} stroke={darken(config.pantsColor, 30)} strokeWidth="1" />
      <rect x={cx + 4} y={legY} width={legW} height={38} rx="4"
        fill={config.pantsColor} stroke={darken(config.pantsColor, 30)} strokeWidth="1" />
      {/* Shoes */}
      <rect x={cx - legW - 6} y={legY + 32} width={legW + 4} height={10} rx="4"
        fill="#333" stroke="#222" strokeWidth="1" />
      <rect x={cx + 2} y={legY + 32} width={legW + 4} height={10} rx="4"
        fill="#333" stroke="#222" strokeWidth="1" />

      {/* Pants details */}
      {config.pantsStyle === 1 && ( /* Shorts - cover lower legs with skin */
        <>
          <rect x={cx - legW - 4} y={legY + 20} width={legW} height={18} rx="2" fill={config.skinColor} />
          <rect x={cx + 4} y={legY + 20} width={legW} height={18} rx="2" fill={config.skinColor} />
        </>
      )}
      {config.pantsStyle === 2 && ( /* Cargo pockets */
        <>
          <rect x={cx - legW - 1} y={legY + 12} width={10} height={8} rx="1" fill={lighten(config.pantsColor, 20)} stroke={darken(config.pantsColor, 15)} strokeWidth="0.5" />
          <rect x={cx + 7} y={legY + 12} width={10} height={8} rx="1" fill={lighten(config.pantsColor, 20)} stroke={darken(config.pantsColor, 15)} strokeWidth="0.5" />
        </>
      )}
      {config.pantsStyle === 3 && ( /* Skirt */
        <path d={`M${cx - bodyW / 2 + 2} ${legY - 2} L${cx - bodyW / 2 - 8} ${legY + 22} L${cx + bodyW / 2 + 8} ${legY + 22} L${cx + bodyW / 2 - 2} ${legY - 2} Z`}
          fill={config.pantsColor} stroke={darken(config.pantsColor, 30)} strokeWidth="1" />
      )}

      {/* === BODY (Torso) === */}
      <rect x={cx - bodyW / 2} y={bodyY} width={bodyW} height={bodyH} rx="6"
        fill={config.shirtColor} stroke={darken(config.shirtColor, 40)} strokeWidth="1.5"
        filter={`url(#${id}-shadow)`} />

      {/* Shirt details */}
      {config.shirtStyle === 0 && ( /* Plain Tee - collar */
        <path d={`M${cx - 12} ${bodyY} Q${cx} ${bodyY + 8} ${cx + 12} ${bodyY}`}
          fill="none" stroke={darken(config.shirtColor, 30)} strokeWidth="2" />
      )}
      {config.shirtStyle === 1 && ( /* Hoodie */
        <>
          <path d={`M${cx - 14} ${bodyY} Q${cx} ${bodyY + 12} ${cx + 14} ${bodyY}`}
            fill={darken(config.shirtColor, 15)} stroke={darken(config.shirtColor, 40)} strokeWidth="1.5" />
          <rect x={cx - 10} y={bodyY + bodyH / 2 - 6} width={20} height={12} rx="3"
            fill={darken(config.shirtColor, 20)} stroke={darken(config.shirtColor, 40)} strokeWidth="0.5" />
          <line x1={cx} y1={bodyY + 12} x2={cx} y2={bodyY + bodyH / 2 - 6}
            stroke={darken(config.shirtColor, 20)} strokeWidth="1" />
        </>
      )}
      {config.shirtStyle === 2 && ( /* Jacket - open front */
        <>
          <line x1={cx} y1={bodyY + 2} x2={cx} y2={bodyY + bodyH - 2}
            stroke={darken(config.shirtColor, 40)} strokeWidth="2" />
          <rect x={cx - bodyW / 2 + 4} y={bodyY + 4} width={bodyW / 2 - 8} height={bodyH - 8} rx="2"
            fill={darken(config.shirtColor, 10)} opacity="0.3" />
        </>
      )}
      {config.shirtStyle === 3 && ( /* Tank Top - expose arms */
        <>
          <rect x={cx - bodyW / 2} y={bodyY} width={10} height={bodyH} rx="2" fill={config.skinColor} />
          <rect x={cx + bodyW / 2 - 10} y={bodyY} width={10} height={bodyH} rx="2" fill={config.skinColor} />
        </>
      )}
      {config.shirtStyle === 4 && ( /* Stripe Tee */
        <>
          {[0, 1, 2, 3, 4].map(i => (
            <rect key={i} x={cx - bodyW / 2 + 2} y={bodyY + 8 + i * 12} width={bodyW - 4} height={5} rx="1"
              fill={darken(config.shirtColor, 30)} opacity="0.3" />
          ))}
        </>
      )}
      {config.shirtStyle === 5 && ( /* V-Neck */
        <path d={`M${cx - 14} ${bodyY} L${cx} ${bodyY + 18} L${cx + 14} ${bodyY}`}
          fill={config.skinColor} stroke={darken(config.shirtColor, 30)} strokeWidth="1" />
      )}
      {config.shirtStyle === 6 && ( /* Polo - collar + buttons */
        <>
          <path d={`M${cx - 16} ${bodyY - 2} L${cx - 8} ${bodyY + 8} L${cx} ${bodyY + 4} L${cx + 8} ${bodyY + 8} L${cx + 16} ${bodyY - 2}`}
            fill={lighten(config.shirtColor, 30)} stroke={darken(config.shirtColor, 20)} strokeWidth="1" />
          {[0, 1, 2].map(i => (
            <circle key={i} cx={cx} cy={bodyY + 14 + i * 10} r="2" fill={darken(config.shirtColor, 40)} />
          ))}
        </>
      )}
      {config.shirtStyle === 7 && ( /* Jersey - number */
        <text x={cx} y={bodyY + bodyH / 2 + 8} textAnchor="middle"
          fill="white" fontSize="24" fontWeight="bold" fontFamily="Arial, sans-serif"
          stroke={darken(config.shirtColor, 60)} strokeWidth="0.5">
          7
        </text>
      )}

      {/* === ARMS === */}
      <rect x={cx - bodyW / 2 - armW} y={bodyY + 4} width={armW} height={bodyH - 10} rx="4"
        fill={config.shirtColor} stroke={darken(config.shirtColor, 40)} strokeWidth="1" />
      <rect x={cx + bodyW / 2} y={bodyY + 4} width={armW} height={bodyH - 10} rx="4"
        fill={config.shirtColor} stroke={darken(config.shirtColor, 40)} strokeWidth="1" />
      {/* Hands */}
      <circle cx={cx - bodyW / 2 - armW / 2} cy={bodyY + bodyH - 4} r={armW / 2 + 1}
        fill={config.skinColor} stroke={skinShadow} strokeWidth="1" />
      <circle cx={cx + bodyW / 2 + armW / 2} cy={bodyY + bodyH - 4} r={armW / 2 + 1}
        fill={config.skinColor} stroke={skinShadow} strokeWidth="1" />

      {/* Accessory held in hand */}
      {config.accessory === 3 && ( /* Sword */
        <g transform={`translate(${cx + bodyW / 2 + armW + 2}, ${bodyY + 10}) rotate(30)`}>
          <rect x="-2" y="-30" width="4" height="35" fill="#B0B0B0" stroke="#888" strokeWidth="0.5" rx="1" />
          <rect x="-6" y="2" width="12" height="4" fill="#8B4513" rx="1" />
          <rect x="-1.5" y="6" width="3" height="12" fill="#8B4513" rx="1" />
        </g>
      )}
      {config.accessory === 4 && ( /* Shield */
        <g transform={`translate(${cx - bodyW / 2 - armW - 15}, ${bodyY + 15})`}>
          <path d="M0 0 L16 0 L16 18 L8 24 L0 18 Z" fill="#4488CC" stroke="#336699" strokeWidth="1.5" />
          <path d="M8 4 L12 10 L8 8 L4 10 Z" fill="#FFD700" />
        </g>
      )}
      {config.accessory === 5 && ( /* Guitar */
        <g transform={`translate(${cx + bodyW / 2 + 6}, ${bodyY + 20}) rotate(25)`}>
          <ellipse cx="0" cy="15" rx="10" ry="13" fill="#D2691E" stroke="#8B4513" strokeWidth="1" />
          <rect x="-2" y="-25" width="4" height="40" fill="#8B4513" rx="1" />
          <circle cx="0" cy="15" r="3" fill="#222" />
        </g>
      )}
      {config.accessory === 6 && ( /* Wand */
        <g transform={`translate(${cx + bodyW / 2 + armW + 2}, ${bodyY + 5}) rotate(20)`}>
          <rect x="-1.5" y="-5" width="3" height="35" fill="#4B0082" rx="1" />
          <polygon points="0,-12 4,-5 -4,-5" fill="#FFD700" />
          <circle cx="0" cy="-12" r="3" fill="#FFFF00" opacity="0.8" />
        </g>
      )}
      {config.accessory === 7 && ( /* Backpack */
        <rect x={cx - bodyW / 2 - 6} y={bodyY + 8} width={bodyW + 12} height={bodyH - 16} rx="6"
          fill="#FF6347" stroke="#CC4433" strokeWidth="1" opacity="0.7" />
      )}

      {/* === HEAD === */}
      <rect x={cx - headSize / 2} y={headY - headSize / 2} width={headSize} height={headSize} rx="8"
        fill={config.skinColor} stroke={skinShadow} strokeWidth="1.5"
        filter={`url(#${id}-shadow)`} />

      {/* === HAIR === */}
      {config.hairStyle === 1 && ( /* Spiky */
        <g>
          {[-18, -10, -2, 6, 14].map((dx, i) => (
            <polygon key={i}
              points={`${cx + dx - 3},${headY - headSize / 2 + 4} ${cx + dx + 3},${headY - headSize / 2 + 4} ${cx + dx},${headY - headSize / 2 - 12 - i * 2}`}
              fill={config.hairColor} />
          ))}
          <rect x={cx - headSize / 2 - 1} y={headY - headSize / 2 - 1} width={headSize + 2} height={12} rx="4"
            fill={config.hairColor} />
        </g>
      )}
      {config.hairStyle === 2 && ( /* Flowing */
        <g>
          <rect x={cx - headSize / 2 - 2} y={headY - headSize / 2 - 4} width={headSize + 4} height={16} rx="6"
            fill={config.hairColor} />
          <rect x={cx - headSize / 2 - 4} y={headY - headSize / 2} width={8} height={headSize + 12} rx="3"
            fill={config.hairColor} />
          <rect x={cx + headSize / 2 - 4} y={headY - headSize / 2} width={8} height={headSize + 12} rx="3"
            fill={config.hairColor} />
        </g>
      )}
      {config.hairStyle === 3 && ( /* Curly */
        <g>
          {[-16, -8, 0, 8, 16].map((dx, i) => (
            <circle key={i} cx={cx + dx} cy={headY - headSize / 2 + 2} r="8" fill={config.hairColor} />
          ))}
          <circle cx={cx - headSize / 2 + 2} cy={headY - 4} r="7" fill={config.hairColor} />
          <circle cx={cx + headSize / 2 - 2} cy={headY - 4} r="7" fill={config.hairColor} />
        </g>
      )}
      {config.hairStyle === 4 && ( /* Ponytail */
        <g>
          <rect x={cx - headSize / 2 - 1} y={headY - headSize / 2 - 2} width={headSize + 2} height={12} rx="5"
            fill={config.hairColor} />
          <ellipse cx={cx + 2} cy={headY + headSize / 2 + 12} rx="6" ry="16" fill={config.hairColor} />
          <circle cx={cx + 2} cy={headY + headSize / 2 - 2} r="5" fill={config.hairColor} />
        </g>
      )}
      {config.hairStyle === 5 && ( /* Mohawk */
        <g>
          {[-6, -2, 2, 6].map((dx, i) => (
            <rect key={i} x={cx + dx - 3} y={headY - headSize / 2 - 14 + Math.abs(dx)} width={6} height={16 - Math.abs(dx)} rx="2"
              fill={config.hairColor} />
          ))}
        </g>
      )}
      {config.hairStyle === 6 && ( /* Afro */
        <circle cx={cx} cy={headY - 4} r={headSize / 2 + 10} fill={config.hairColor} />
      )}
      {config.hairStyle === 7 && ( /* Pigtails */
        <g>
          <rect x={cx - headSize / 2 - 1} y={headY - headSize / 2 - 2} width={headSize + 2} height={10} rx="4"
            fill={config.hairColor} />
          <ellipse cx={cx - headSize / 2 - 4} cy={headY + 4} rx="7" ry="18" fill={config.hairColor} />
          <ellipse cx={cx + headSize / 2 + 4} cy={headY + 4} rx="7" ry="18" fill={config.hairColor} />
          <circle cx={cx - headSize / 2 - 4} cy={headY - 10} r="5" fill={config.hairColor} />
          <circle cx={cx + headSize / 2 + 4} cy={headY - 10} r="5" fill={config.hairColor} />
        </g>
      )}
      {config.hairStyle === 8 && ( /* Buzz Cut */
        <rect x={cx - headSize / 2 + 1} y={headY - headSize / 2 - 1} width={headSize - 2} height={headSize / 2 + 4} rx="8"
          fill={config.hairColor} opacity="0.6" />
      )}
      {config.hairStyle === 9 && ( /* Long */
        <g>
          <rect x={cx - headSize / 2 - 3} y={headY - headSize / 2 - 4} width={headSize + 6} height={14} rx="6"
            fill={config.hairColor} />
          <rect x={cx - headSize / 2 - 5} y={headY - headSize / 2} width={10} height={headSize + 30} rx="4"
            fill={config.hairColor} />
          <rect x={cx + headSize / 2 - 5} y={headY - headSize / 2} width={10} height={headSize + 30} rx="4"
            fill={config.hairColor} />
          <rect x={cx - 10} y={headY + headSize / 2 - 2} width={20} height={20} rx="4" fill={config.hairColor} />
        </g>
      )}
      {config.hairStyle === 10 && ( /* Side Part */
        <g>
          <rect x={cx - headSize / 2 - 1} y={headY - headSize / 2 - 3} width={headSize + 2} height={14} rx="5"
            fill={config.hairColor} />
          <rect x={cx - headSize / 2 - 3} y={headY - headSize / 2} width={12} height={20} rx="4"
            fill={config.hairColor} />
        </g>
      )}
      {config.hairStyle === 11 && ( /* Messy */
        <g>
          {Array.from({ length: 8 }).map((_, i) => {
            const angle = (i / 8) * Math.PI * 2 - Math.PI / 2;
            const dist = headSize / 2 + 4;
            const px = cx + Math.cos(angle) * dist;
            const py = headY + Math.sin(angle) * dist * 0.6;
            return (
              <rect key={i} x={px - 4} y={py - 8} width={8} height={14} rx="3"
                fill={config.hairColor} transform={`rotate(${(angle * 180) / Math.PI + 90} ${px} ${py})`} />
            );
          })}
          <rect x={cx - headSize / 2} y={headY - headSize / 2 - 2} width={headSize} height={12} rx="5"
            fill={config.hairColor} />
        </g>
      )}

      {/* === FACE === */}
      <text x={cx - 10} y={headY + 2} textAnchor="middle"
        fill="#333" fontSize="12" fontFamily="monospace" fontWeight="bold">
        {face.eyes.split(' ')[0]}
      </text>
      <text x={cx + 10} y={headY + 2} textAnchor="middle"
        fill="#333" fontSize="12" fontFamily="monospace" fontWeight="bold">
        {face.eyes.split(' ')[1]}
      </text>
      <text x={cx} y={headY + 16} textAnchor="middle"
        fill="#333" fontSize="11" fontFamily="monospace">
        {face.mouth}
      </text>

      {/* Blush on cheeks */}
      <circle cx={cx - 16} cy={headY + 8} r="5" fill="#FFB6C1" opacity="0.3" />
      <circle cx={cx + 16} cy={headY + 8} r="5" fill="#FFB6C1" opacity="0.3" />

      {/* === GLASSES === */}
      {config.glasses === 1 && ( /* Round */
        <g>
          <circle cx={cx - 10} cy={headY - 2} r="8" fill="none" stroke="#333" strokeWidth="2" />
          <circle cx={cx + 10} cy={headY - 2} r="8" fill="none" stroke="#333" strokeWidth="2" />
          <line x1={cx - 2} y1={headY - 2} x2={cx + 2} y2={headY - 2} stroke="#333" strokeWidth="2" />
        </g>
      )}
      {config.glasses === 2 && ( /* Sunglasses */
        <g>
          <rect x={cx - 19} y={headY - 8} width={16} height={11} rx="2" fill="#111" stroke="#333" strokeWidth="1.5" />
          <rect x={cx + 3} y={headY - 8} width={16} height={11} rx="2" fill="#111" stroke="#333" strokeWidth="1.5" />
          <line x1={cx - 3} y1={headY - 3} x2={cx + 3} y2={headY - 3} stroke="#333" strokeWidth="2" />
        </g>
      )}
      {config.glasses === 3 && ( /* Monocle */
        <circle cx={cx + 10} cy={headY - 1} r="9" fill="none" stroke="#DAA520" strokeWidth="2" />
      )}
      {config.glasses === 4 && ( /* Nerd */
        <g>
          <rect x={cx - 20} y={headY - 9} width={17} height={14} rx="3" fill="rgba(255,255,255,0.3)" stroke="#333" strokeWidth="2" />
          <rect x={cx + 3} y={headY - 9} width={17} height={14} rx="3" fill="rgba(255,255,255,0.3)" stroke="#333" strokeWidth="2" />
          <line x1={cx - 3} y1={headY - 2} x2={cx + 3} y2={headY - 2} stroke="#333" strokeWidth="2" />
        </g>
      )}
      {config.glasses === 5 && ( /* Sport */
        <path d={`M${cx - 22} ${headY - 4} Q${cx} ${headY - 10} ${cx + 22} ${headY - 4} L${cx + 20} ${headY + 4} Q${cx} ${headY + 1} ${cx - 20} ${headY + 4} Z`}
          fill="rgba(255,100,0,0.4)" stroke="#FF6600" strokeWidth="1.5" />
      )}
      {config.glasses === 6 && ( /* Star */
        <g>
          <text x={cx - 10} y={headY + 2} textAnchor="middle" fill="#FFD700" fontSize="16">⭐</text>
          <text x={cx + 10} y={headY + 2} textAnchor="middle" fill="#FFD700" fontSize="16">⭐</text>
        </g>
      )}
      {config.glasses === 7 && ( /* Heart */
        <g>
          <text x={cx - 10} y={headY + 3} textAnchor="middle" fill="#FF69B4" fontSize="14">♥</text>
          <text x={cx + 10} y={headY + 3} textAnchor="middle" fill="#FF69B4" fontSize="14">♥</text>
        </g>
      )}

      {/* === HAT === */}
      {config.hat === 1 && ( /* Cap */
        <g>
          <rect x={cx - headSize / 2 - 2} y={headY - headSize / 2 - 6} width={headSize + 4} height={14} rx="4"
            fill="#FF4444" stroke="#CC0000" strokeWidth="1" />
          <rect x={cx - headSize / 2 - 10} y={headY - headSize / 2 + 4} width={headSize / 2 + 10} height={4} rx="2"
            fill="#CC0000" />
        </g>
      )}
      {config.hat === 2 && ( /* Crown */
        <g>
          <rect x={cx - 18} y={headY - headSize / 2 - 8} width={36} height={14} rx="2" fill="#FFD700" stroke="#DAA520" strokeWidth="1" />
          <polygon points={`${cx - 18},${headY - headSize / 2 - 8} ${cx - 14},${headY - headSize / 2 - 18} ${cx - 8},${headY - headSize / 2 - 8}`} fill="#FFD700" />
          <polygon points={`${cx - 4},${headY - headSize / 2 - 8} ${cx},${headY - headSize / 2 - 20} ${cx + 4},${headY - headSize / 2 - 8}`} fill="#FFD700" />
          <polygon points={`${cx + 8},${headY - headSize / 2 - 8} ${cx + 14},${headY - headSize / 2 - 18} ${cx + 18},${headY - headSize / 2 - 8}`} fill="#FFD700" />
          <circle cx={cx - 14} cy={headY - headSize / 2 - 16} r="2" fill="#FF0000" />
          <circle cx={cx} cy={headY - headSize / 2 - 18} r="2.5" fill="#0066FF" />
          <circle cx={cx + 14} cy={headY - headSize / 2 - 16} r="2" fill="#00CC00" />
        </g>
      )}
      {config.hat === 3 && ( /* Top Hat */
        <g>
          <rect x={cx - 16} y={headY - headSize / 2 - 28} width={32} height={28} rx="3"
            fill="#222" stroke="#111" strokeWidth="1" />
          <rect x={cx - 22} y={headY - headSize / 2 - 4} width={44} height={6} rx="2"
            fill="#333" stroke="#111" strokeWidth="1" />
          <rect x={cx - 14} y={headY - headSize / 2 - 10} width={28} height={4} rx="1"
            fill="#8B0000" />
        </g>
      )}
      {config.hat === 4 && ( /* Beanie */
        <g>
          <ellipse cx={cx} cy={headY - headSize / 2 + 2} rx={headSize / 2 + 4} ry={headSize / 2 - 4}
            fill="#4488DD" stroke="#336699" strokeWidth="1" />
          <circle cx={cx} cy={headY - headSize / 2 - 14} r="5" fill="#4488DD" />
          {[0, 1, 2].map(i => (
            <line key={i} x1={cx - headSize / 2 + 4} y1={headY - headSize / 2 + 2 + i * 5}
              x2={cx + headSize / 2 - 4} y2={headY - headSize / 2 + 2 + i * 5}
              stroke="#336699" strokeWidth="1" opacity="0.5" />
          ))}
        </g>
      )}
      {config.hat === 5 && ( /* Viking */
        <g>
          <ellipse cx={cx} cy={headY - headSize / 2 + 4} rx={headSize / 2 + 6} ry={headSize / 2 - 6}
            fill="#8B7355" stroke="#5C3317" strokeWidth="1.5" />
          <ellipse cx={cx - headSize / 2 - 4} cy={headY - headSize / 2 - 2} rx="5" ry="14"
            fill="#F5F5DC" stroke="#D2B48C" strokeWidth="1" transform={`rotate(-15 ${cx - headSize / 2 - 4} ${headY - headSize / 2 - 2})`} />
          <ellipse cx={cx + headSize / 2 + 4} cy={headY - headSize / 2 - 2} rx="5" ry="14"
            fill="#F5F5DC" stroke="#D2B48C" strokeWidth="1" transform={`rotate(15 ${cx + headSize / 2 + 4} ${headY - headSize / 2 - 2})`} />
        </g>
      )}
      {config.hat === 6 && ( /* Wizard */
        <g>
          <polygon points={`${cx - 22},${headY - headSize / 2 + 4} ${cx},${headY - headSize / 2 - 40} ${cx + 22},${headY - headSize / 2 + 4}`}
            fill="#4B0082" stroke="#2E0854" strokeWidth="1" />
          <rect x={cx - 24} y={headY - headSize / 2 + 1} width={48} height={6} rx="2" fill="#4B0082" />
          <text x={cx} y={headY - headSize / 2 - 12} textAnchor="middle" fill="#FFD700" fontSize="10">★</text>
          <text x={cx - 8} y={headY - headSize / 2 - 20} textAnchor="middle" fill="#FFD700" fontSize="6">✦</text>
        </g>
      )}
      {config.hat === 7 && ( /* Bunny Ears */
        <g>
          <ellipse cx={cx - 12} cy={headY - headSize / 2 - 16} rx="6" ry="18" fill="#FFB6C1" stroke="#FF69B4" strokeWidth="1" />
          <ellipse cx={cx + 12} cy={headY - headSize / 2 - 16} rx="6" ry="18" fill="#FFB6C1" stroke="#FF69B4" strokeWidth="1" />
          <ellipse cx={cx - 12} cy={headY - headSize / 2 - 16} rx="3" ry="12" fill="#FF69B4" opacity="0.5" />
          <ellipse cx={cx + 12} cy={headY - headSize / 2 - 16} rx="3" ry="12" fill="#FF69B4" opacity="0.5" />
        </g>
      )}
      {config.hat === 8 && ( /* Cat Ears */
        <g>
          <polygon points={`${cx - 22},${headY - headSize / 2 + 2} ${cx - 14},${headY - headSize / 2 - 18} ${cx - 6},${headY - headSize / 2 + 2}`}
            fill="#333" stroke="#222" strokeWidth="1" />
          <polygon points={`${cx + 6},${headY - headSize / 2 + 2} ${cx + 14},${headY - headSize / 2 - 18} ${cx + 22},${headY - headSize / 2 + 2}`}
            fill="#333" stroke="#222" strokeWidth="1" />
          <polygon points={`${cx - 20},${headY - headSize / 2 + 2} ${cx - 14},${headY - headSize / 2 - 12} ${cx - 8},${headY - headSize / 2 + 2}`}
            fill="#FF69B4" opacity="0.6" />
          <polygon points={`${cx + 8},${headY - headSize / 2 + 2} ${cx + 14},${headY - headSize / 2 - 12} ${cx + 20},${headY - headSize / 2 + 2}`}
            fill="#FF69B4" opacity="0.6" />
        </g>
      )}
      {config.hat === 9 && ( /* Headband */
        <rect x={cx - headSize / 2 - 2} y={headY - headSize / 2 + 4} width={headSize + 4} height={6} rx="3"
          fill="#FF6347" stroke="#CC4433" strokeWidth="1" />
      )}
      {config.hat === 10 && ( /* Tiara */
        <g>
          <rect x={cx - 18} y={headY - headSize / 2 - 2} width={36} height={6} rx="2" fill="#C0C0C0" stroke="#999" strokeWidth="0.5" />
          <polygon points={`${cx - 8},${headY - headSize / 2 - 2} ${cx - 4},${headY - headSize / 2 - 10} ${cx},${headY - headSize / 2 - 2}`} fill="#C0C0C0" />
          <polygon points={`${cx},${headY - headSize / 2 - 2} ${cx + 4},${headY - headSize / 2 - 12} ${cx + 8},${headY - headSize / 2 - 2}`} fill="#C0C0C0" />
          <circle cx={cx + 4} cy={headY - headSize / 2 - 10} r="2" fill="#FF69B4" />
        </g>
      )}
      {config.hat === 11 && ( /* Helmet */
        <g>
          <ellipse cx={cx} cy={headY - headSize / 2 + 8} rx={headSize / 2 + 6} ry={headSize / 2 + 2}
            fill="#FF6600" stroke="#CC4400" strokeWidth="1.5" />
          <rect x={cx - headSize / 2 - 4} y={headY - 4} width={headSize + 8} height={4} rx="2"
            fill="#CC4400" />
        </g>
      )}

      {/* === PET === */}
      {config.pet > 0 && (
        <text x={cx + 65} y={legY + 36} textAnchor="middle" fontSize="28">
          {PETS[config.pet]?.render || ''}
        </text>
      )}

      {/* === FRONT ACCESSORIES === */}
      {config.accessory === 8 && ( /* Skateboard under feet */
        <g>
          <rect x={cx - 30} y={legY + 42} width={60} height={6} rx="3" fill="#FF6347" stroke="#CC4433" strokeWidth="1" />
          <circle cx={cx - 18} cy={legY + 50} r="3" fill="#333" />
          <circle cx={cx + 18} cy={legY + 50} r="3" fill="#333" />
        </g>
      )}
      {config.accessory === 9 && ( /* Balloon */
        <g>
          <line x1={cx + bodyW / 2 + armW / 2} y1={bodyY + bodyH - 4} x2={cx + bodyW / 2 + 20} y2={headY - 40} stroke="#888" strokeWidth="0.5" />
          <ellipse cx={cx + bodyW / 2 + 20} cy={headY - 52} rx="12" ry="14" fill="#FF1493" stroke="#CC1177" strokeWidth="0.5" />
          <ellipse cx={cx + bodyW / 2 + 17} cy={headY - 56} rx="4" ry="5" fill="rgba(255,255,255,0.3)" />
        </g>
      )}
      {config.accessory === 10 && ( /* Boombox */
        <g transform={`translate(${cx - bodyW / 2 - armW - 16}, ${bodyY + 15})`}>
          <rect x="0" y="0" width="22" height="14" rx="2" fill="#444" stroke="#222" strokeWidth="1" />
          <circle cx="6" cy="7" r="4" fill="#666" stroke="#555" strokeWidth="0.5" />
          <circle cx="16" cy="7" r="4" fill="#666" stroke="#555" strokeWidth="0.5" />
          <rect x="9" y="2" width="4" height="3" rx="0.5" fill="#888" />
        </g>
      )}

      {/* Overalls (pants style 5) goes on top */}
      {config.pantsStyle === 5 && (
        <g>
          <line x1={cx - 10} y1={bodyY + 10} x2={cx - 10} y2={bodyY - 4}
            stroke={config.pantsColor} strokeWidth="4" strokeLinecap="round" />
          <line x1={cx + 10} y1={bodyY + 10} x2={cx + 10} y2={bodyY - 4}
            stroke={config.pantsColor} strokeWidth="4" strokeLinecap="round" />
          <rect x={cx - 14} y={bodyY + 8} width={28} height={8} rx="2"
            fill={config.pantsColor} stroke={darken(config.pantsColor, 20)} strokeWidth="0.5" />
        </g>
      )}
    </svg>
  );
}

/* ─── Main Component ────────────────────────────────────── */

export default function RobloxAvatarCreator() {
  const [config, setConfig] = useState<AvatarConfig>(DEFAULT_CONFIG);
  const [activeTab, setActiveTab] = useState<TabId>('body');
  const [animKey, setAnimKey] = useState(0);
  const [copied, setCopied] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [showToast, setShowToast] = useState('');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Load config from URL params on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const avatarParam = params.get('avatar');
    if (avatarParam) {
      const decoded = decodeConfig(avatarParam);
      if (decoded) setConfig(decoded);
    }
  }, []);

  const triggerAnim = useCallback(() => {
    setAnimKey(k => k + 1);
  }, []);

  const toast = useCallback((msg: string) => {
    setShowToast(msg);
    setTimeout(() => setShowToast(''), 2000);
  }, []);

  const updateConfig = useCallback(<K extends keyof AvatarConfig>(key: K, value: AvatarConfig[K]) => {
    setConfig(prev => ({ ...prev, [key]: value }));
    triggerAnim();
  }, [triggerAnim]);

  const randomize = useCallback(() => {
    setConfig({
      bodyShape: Math.floor(Math.random() * BODY_SHAPES.length),
      skinColor: pick(SKIN_COLORS),
      hairStyle: Math.floor(Math.random() * HAIR_STYLES.length),
      hairColor: pick(HAIR_COLORS),
      face: Math.floor(Math.random() * FACES.length),
      shirtStyle: Math.floor(Math.random() * SHIRT_STYLES.length),
      shirtColor: pick(SHIRT_COLORS),
      pantsStyle: Math.floor(Math.random() * PANTS_STYLES.length),
      pantsColor: pick(PANTS_COLORS),
      hat: Math.floor(Math.random() * HATS.length),
      glasses: Math.floor(Math.random() * GLASSES_LIST.length),
      accessory: Math.floor(Math.random() * ACCESSORIES.length),
      pet: Math.floor(Math.random() * PETS.length),
      background: Math.floor(Math.random() * BACKGROUNDS.length),
    });
    triggerAnim();
    toast('🎲 Randomized!');
  }, [triggerAnim, toast]);

  const exportPNG = useCallback(async () => {
    setExporting(true);
    try {
      const svgEl = document.getElementById('avatar-main-svg');
      if (!svgEl) return;
      const svgData = new XMLSerializer().serializeToString(svgEl);
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        canvas.width = 600;
        canvas.height = 600;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.drawImage(img, 0, 0, 600, 600);
        URL.revokeObjectURL(url);
        const pngUrl = canvas.toDataURL('image/png');
        const a = document.createElement('a');
        a.href = pngUrl;
        a.download = 'my-avatar.png';
        a.click();
        toast('📥 Avatar downloaded!');
        setExporting(false);
      };
      img.onerror = () => { setExporting(false); };
      img.src = url;
    } catch {
      setExporting(false);
    }
  }, [toast]);

  const shareLink = useCallback(() => {
    const encoded = encodeConfig(config);
    const url = `${window.location.origin}${window.location.pathname}?avatar=${encoded}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
    }
    setCopied(true);
    toast('🔗 Link copied!');
    setTimeout(() => setCopied(false), 2000);
  }, [config, toast]);

  const bgGrad = useMemo(() => {
    const bg = BACKGROUNDS[config.background] || BACKGROUNDS[0];
    return `linear-gradient(135deg, ${bg.colors.join(', ')})`;
  }, [config.background]);

  // Render the active tab's controls
  const renderTabContent = () => {
    switch (activeTab) {
      case 'body':
        return (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-bold text-gray-700 mb-2 block">Body Shape</label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {BODY_SHAPES.map(b => (
                  <button key={b.id} onClick={() => updateConfig('bodyShape', b.id)}
                    className={`p-2 rounded-xl text-center transition-all ${config.bodyShape === b.id ? 'bg-blue-500 text-white shadow-lg scale-105' : 'bg-white hover:bg-blue-50 border border-gray-200'}`}>
                    <div className="text-xs font-bold">{b.name}</div>
                    <div className="text-[10px] opacity-70">{b.desc}</div>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-bold text-gray-700 mb-2 block">Skin Color</label>
              <div className="flex flex-wrap gap-2">
                {SKIN_COLORS.map(c => (
                  <button key={c} onClick={() => updateConfig('skinColor', c)}
                    className={`w-9 h-9 rounded-full border-2 transition-all hover:scale-110 ${config.skinColor === c ? 'border-blue-500 ring-2 ring-blue-300 scale-110' : 'border-gray-300'}`}
                    style={{ backgroundColor: c }} />
                ))}
              </div>
            </div>
          </div>
        );

      case 'hair':
        return (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-bold text-gray-700 mb-2 block">Hair Style</label>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {HAIR_STYLES.map(h => (
                  <button key={h.id} onClick={() => updateConfig('hairStyle', h.id)}
                    className={`p-2 rounded-xl text-center transition-all ${config.hairStyle === h.id ? 'bg-purple-500 text-white shadow-lg scale-105' : 'bg-white hover:bg-purple-50 border border-gray-200'}`}>
                    <div className="text-lg">{h.emoji}</div>
                    <div className="text-xs font-bold">{h.name}</div>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-bold text-gray-700 mb-2 block">Hair Color</label>
              <div className="flex flex-wrap gap-2">
                {HAIR_COLORS.map(c => (
                  <button key={c} onClick={() => updateConfig('hairColor', c)}
                    className={`w-9 h-9 rounded-full border-2 transition-all hover:scale-110 ${config.hairColor === c ? 'border-purple-500 ring-2 ring-purple-300 scale-110' : 'border-gray-300'}`}
                    style={{ backgroundColor: c }} />
                ))}
              </div>
            </div>
          </div>
        );

      case 'face':
        return (
          <div>
            <label className="text-sm font-bold text-gray-700 mb-2 block">Expression</label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {FACES.map(f => (
                <button key={f.id} onClick={() => updateConfig('face', f.id)}
                  className={`p-2 rounded-xl text-center transition-all ${config.face === f.id ? 'bg-yellow-400 text-gray-900 shadow-lg scale-105' : 'bg-white hover:bg-yellow-50 border border-gray-200'}`}>
                  <div className="text-2xl">{f.emoji}</div>
                  <div className="text-xs font-bold">{f.name}</div>
                </button>
              ))}
            </div>
          </div>
        );

      case 'shirt':
        return (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-bold text-gray-700 mb-2 block">Shirt Style</label>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {SHIRT_STYLES.map(s => (
                  <button key={s.id} onClick={() => updateConfig('shirtStyle', s.id)}
                    className={`p-2 rounded-xl text-center transition-all ${config.shirtStyle === s.id ? 'bg-green-500 text-white shadow-lg scale-105' : 'bg-white hover:bg-green-50 border border-gray-200'}`}>
                    <div className="text-lg">{s.emoji}</div>
                    <div className="text-xs font-bold">{s.name}</div>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-bold text-gray-700 mb-2 block">Shirt Color</label>
              <div className="flex flex-wrap gap-2">
                {SHIRT_COLORS.map(c => (
                  <button key={c} onClick={() => updateConfig('shirtColor', c)}
                    className={`w-9 h-9 rounded-full border-2 transition-all hover:scale-110 ${config.shirtColor === c ? 'border-green-500 ring-2 ring-green-300 scale-110' : 'border-gray-300'}`}
                    style={{ backgroundColor: c }} />
                ))}
              </div>
            </div>
          </div>
        );

      case 'pants':
        return (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-bold text-gray-700 mb-2 block">Pants Style</label>
              <div className="grid grid-cols-3 gap-2">
                {PANTS_STYLES.map(p => (
                  <button key={p.id} onClick={() => updateConfig('pantsStyle', p.id)}
                    className={`p-2 rounded-xl text-center transition-all ${config.pantsStyle === p.id ? 'bg-indigo-500 text-white shadow-lg scale-105' : 'bg-white hover:bg-indigo-50 border border-gray-200'}`}>
                    <div className="text-lg">{p.emoji}</div>
                    <div className="text-xs font-bold">{p.name}</div>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-bold text-gray-700 mb-2 block">Pants Color</label>
              <div className="flex flex-wrap gap-2">
                {PANTS_COLORS.map(c => (
                  <button key={c} onClick={() => updateConfig('pantsColor', c)}
                    className={`w-9 h-9 rounded-full border-2 transition-all hover:scale-110 ${config.pantsColor === c ? 'border-indigo-500 ring-2 ring-indigo-300 scale-110' : 'border-gray-300'}`}
                    style={{ backgroundColor: c }} />
                ))}
              </div>
            </div>
          </div>
        );

      case 'hat':
        return (
          <div>
            <label className="text-sm font-bold text-gray-700 mb-2 block">Hats & Headwear</label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {HATS.map(h => (
                <button key={h.id} onClick={() => updateConfig('hat', h.id)}
                  className={`p-2 rounded-xl text-center transition-all ${config.hat === h.id ? 'bg-red-500 text-white shadow-lg scale-105' : 'bg-white hover:bg-red-50 border border-gray-200'}`}>
                  <div className="text-2xl">{h.render || '❌'}</div>
                  <div className="text-xs font-bold">{h.name}</div>
                </button>
              ))}
            </div>
          </div>
        );

      case 'glasses':
        return (
          <div>
            <label className="text-sm font-bold text-gray-700 mb-2 block">Glasses & Eyewear</label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {GLASSES_LIST.map(g => (
                <button key={g.id} onClick={() => updateConfig('glasses', g.id)}
                  className={`p-2 rounded-xl text-center transition-all ${config.glasses === g.id ? 'bg-cyan-500 text-white shadow-lg scale-105' : 'bg-white hover:bg-cyan-50 border border-gray-200'}`}>
                  <div className="text-2xl">{g.render || '❌'}</div>
                  <div className="text-xs font-bold">{g.name}</div>
                </button>
              ))}
            </div>
          </div>
        );

      case 'accessory':
        return (
          <div>
            <label className="text-sm font-bold text-gray-700 mb-2 block">Accessories</label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {ACCESSORIES.map(a => (
                <button key={a.id} onClick={() => updateConfig('accessory', a.id)}
                  className={`p-2 rounded-xl text-center transition-all ${config.accessory === a.id ? 'bg-orange-500 text-white shadow-lg scale-105' : 'bg-white hover:bg-orange-50 border border-gray-200'}`}>
                  <div className="text-2xl">{a.render || '❌'}</div>
                  <div className="text-xs font-bold">{a.name}</div>
                </button>
              ))}
            </div>
          </div>
        );

      case 'pet':
        return (
          <div>
            <label className="text-sm font-bold text-gray-700 mb-2 block">Pet Buddy</label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {PETS.map(p => (
                <button key={p.id} onClick={() => updateConfig('pet', p.id)}
                  className={`p-2 rounded-xl text-center transition-all ${config.pet === p.id ? 'bg-pink-500 text-white shadow-lg scale-105' : 'bg-white hover:bg-pink-50 border border-gray-200'}`}>
                  <div className="text-2xl">{p.render || '❌'}</div>
                  <div className="text-xs font-bold">{p.name}</div>
                </button>
              ))}
            </div>
          </div>
        );

      case 'background':
        return (
          <div>
            <label className="text-sm font-bold text-gray-700 mb-2 block">Background</label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {BACKGROUNDS.map(b => (
                <button key={b.id} onClick={() => updateConfig('background', b.id)}
                  className={`p-3 rounded-xl text-center transition-all border-2 ${config.background === b.id ? 'border-white ring-2 ring-blue-400 scale-105 shadow-lg' : 'border-gray-200 hover:border-gray-400'}`}
                  style={{ background: `linear-gradient(135deg, ${b.colors.join(', ')})` }}>
                  <div className="text-xs font-bold text-white drop-shadow-md">{b.name}</div>
                </button>
              ))}
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 via-purple-50 to-pink-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/games" className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-full text-sm font-bold transition-all">
            ← Games
          </Link>
          <h1 className="text-lg sm:text-2xl font-black text-center flex items-center gap-2">
            <span className="text-2xl">🧍</span>
            <span className="hidden sm:inline">Avatar Creator</span>
            <span className="sm:hidden">Avatar</span>
            <span className="text-2xl">✨</span>
          </h1>
          <div className="w-20" />
        </div>
      </div>

      {/* Toast */}
      {showToast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white px-6 py-3 rounded-2xl shadow-xl text-sm font-bold animate-bounce">
          {showToast}
        </div>
      )}

      <div className="max-w-6xl mx-auto px-3 py-4 sm:py-6">
        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">

          {/* === AVATAR PREVIEW === */}
          <div className="lg:w-[340px] flex-shrink-0">
            <div className="sticky top-4">
              {/* Avatar display */}
              <div className="rounded-2xl overflow-hidden shadow-2xl border-4 border-white/50 relative" style={{ background: bgGrad }}>
                <div key={animKey} className="avatar-bounce">
                  <div id="avatar-main-svg">
                    <AvatarSVG config={config} size={340} id="avatar" />
                  </div>
                </div>
                {/* Sparkle effect on change */}
                <div key={`sparkle-${animKey}`} className="absolute inset-0 pointer-events-none sparkle-overlay" />
              </div>

              {/* Action buttons */}
              <div className="flex gap-2 mt-3">
                <button onClick={randomize}
                  className="flex-1 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white font-bold py-2.5 px-4 rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] active:scale-95 text-sm">
                  🎲 Randomize
                </button>
                <button onClick={exportPNG} disabled={exporting}
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-2.5 px-4 rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] active:scale-95 text-sm disabled:opacity-50">
                  {exporting ? '⏳' : '📥'} Download
                </button>
                <button onClick={shareLink}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-2.5 px-4 rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] active:scale-95 text-sm">
                  {copied ? '✅ Copied!' : '🔗 Share'}
                </button>
              </div>

              {/* Hidden canvas for export */}
              <canvas ref={canvasRef} className="hidden" />
            </div>
          </div>

          {/* === CUSTOMIZATION PANEL === */}
          <div className="flex-1 min-w-0">
            {/* Tab Navigation */}
            <div className="flex overflow-x-auto gap-1 pb-2 mb-4 scrollbar-hide -mx-1 px-1">
              {TABS.map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className={`flex-shrink-0 flex items-center gap-1 px-3 py-2 rounded-xl text-sm font-bold transition-all ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg scale-105'
                      : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200 hover:border-gray-300'
                  }`}>
                  <span>{tab.emoji}</span>
                  <span className="hidden sm:inline">{tab.name}</span>
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6 shadow-xl border border-white/50 min-h-[300px]">
              {renderTabContent()}
            </div>

            {/* SEO Content */}
            <div className="mt-6 bg-white/60 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-white/30">
              <h2 className="text-lg font-bold text-gray-800 mb-2">🎨 Free Avatar Creator Online</h2>
              <p className="text-sm text-gray-600 mb-3">
                Create your own custom blocky avatar with our free online character creator! Choose from dozens of
                hairstyles, face expressions, clothing options, hats, glasses, accessories, and pets. Design the
                perfect avatar for your gaming profile, social media, or just for fun!
              </p>
              <h3 className="text-md font-bold text-gray-700 mb-1">How to Use</h3>
              <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside mb-3">
                <li>Choose your body shape and skin color</li>
                <li>Pick a hairstyle and hair color</li>
                <li>Select a fun face expression</li>
                <li>Customize your outfit with shirts, pants, and accessories</li>
                <li>Add hats, glasses, pets, and more!</li>
                <li>Hit <strong>Randomize</strong> for instant inspiration</li>
                <li><strong>Download</strong> your avatar as a PNG image</li>
                <li><strong>Share</strong> your creation with friends via link</li>
              </ul>
              <h3 className="text-md font-bold text-gray-700 mb-1">Features</h3>
              <p className="text-sm text-gray-600">
                ✅ 5 body shapes · 12+ hair styles · 12 face expressions · 8 shirt styles · 6 pants styles ·
                12 hats · 8 glasses · 11 accessories · 10 pets · 10 backgrounds · Unlimited color combos ·
                Download as PNG · Share with friends · 100% free, no login required!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Animations */}
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }

        @keyframes avatar-bounce {
          0% { transform: scale(0.95); }
          50% { transform: scale(1.02); }
          100% { transform: scale(1); }
        }
        .avatar-bounce { animation: avatar-bounce 0.3s ease-out; }

        @keyframes sparkle {
          0% { opacity: 1; transform: scale(0.5) rotate(0deg); }
          100% { opacity: 0; transform: scale(1.5) rotate(180deg); }
        }
        .sparkle-overlay::before,
        .sparkle-overlay::after {
          content: '✨';
          position: absolute;
          font-size: 24px;
          animation: sparkle 0.6s ease-out forwards;
          pointer-events: none;
        }
        .sparkle-overlay::before { top: 20%; left: 20%; }
        .sparkle-overlay::after { top: 40%; right: 20%; animation-delay: 0.1s; }
      `}</style>
    </div>
  );
}
