'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// Example skin template definitions
interface ExampleSkin {
  id: string;
  name: string;
  emoji: string;
  description: string;
  colors: {
    skin: string;
    hair: string;
    shirt: string;
    pants: string;
    shoes: string;
    accent: string;
  };
}

const EXAMPLE_SKINS: ExampleSkin[] = [
  {
    id: 'knight',
    name: 'Knight',
    emoji: '⚔️',
    description: 'Armored warrior ready for battle',
    colors: {
      skin: '#d4a76a',
      hair: '#4a3728',
      shirt: '#7f8c8d',
      pants: '#5d6d7e',
      shoes: '#2c3e50',
      accent: '#c0c0c0',
    },
  },
  {
    id: 'wizard',
    name: 'Wizard',
    emoji: '🧙',
    description: 'Mystical mage with magical powers',
    colors: {
      skin: '#e8d5c4',
      hair: '#c0c0c0',
      shirt: '#4B0082',
      pants: '#2E0854',
      shoes: '#1a1a2e',
      accent: '#9b59b6',
    },
  },
  {
    id: 'robot',
    name: 'Robot',
    emoji: '🤖',
    description: 'Futuristic android companion',
    colors: {
      skin: '#8a8a8a',
      hair: '#444444',
      shirt: '#3498db',
      pants: '#2c3e50',
      shoes: '#1a1a1a',
      accent: '#00ff00',
    },
  },
  {
    id: 'ninja',
    name: 'Ninja',
    emoji: '🥷',
    description: 'Stealthy shadow warrior',
    colors: {
      skin: '#c4a57b',
      hair: '#1a1a1a',
      shirt: '#1a1a1a',
      pants: '#2c2c2c',
      shoes: '#1a1a1a',
      accent: '#8b0000',
    },
  },
  {
    id: 'princess',
    name: 'Princess',
    emoji: '👸',
    description: 'Royal elegance and grace',
    colors: {
      skin: '#ffdfc4',
      hair: '#f1c40f',
      shirt: '#e91e63',
      pants: '#9c27b0',
      shoes: '#ff69b4',
      accent: '#ffd700',
    },
  },
  {
    id: 'alien',
    name: 'Alien',
    emoji: '👽',
    description: 'Visitor from another world',
    colors: {
      skin: '#7dcea0',
      hair: '#27ae60',
      shirt: '#9b59b6',
      pants: '#8e44ad',
      shoes: '#6c3483',
      accent: '#00ffff',
    },
  },
  {
    id: 'pirate',
    name: 'Pirate',
    emoji: '🏴‍☠️',
    description: 'Swashbuckling sea adventurer',
    colors: {
      skin: '#c4956a',
      hair: '#1a1a1a',
      shirt: '#8b0000',
      pants: '#2c2c2c',
      shoes: '#3d2314',
      accent: '#ffd700',
    },
  },
  {
    id: 'superhero',
    name: 'Superhero',
    emoji: '🦸',
    description: 'Caped crusader saving the day',
    colors: {
      skin: '#d4a76a',
      hair: '#2c1810',
      shirt: '#dc143c',
      pants: '#00008b',
      shoes: '#ffd700',
      accent: '#ffff00',
    },
  },
];

// Generate a mini skin preview grid (8x8 simplified representation)
function SkinPreviewGrid({ colors, size = 96 }: { colors: ExampleSkin['colors']; size?: number }) {
  const cellSize = size / 8;
  
  // Simplified 8x8 grid representing a skin character
  // Row 0-1: Hair, Row 2-3: Face, Row 4-5: Shirt, Row 6: Pants, Row 7: Shoes
  const grid = [
    // Row 0: Top of hair
    [colors.hair, colors.hair, colors.hair, colors.hair, colors.hair, colors.hair, colors.hair, colors.hair],
    // Row 1: Hair
    [colors.hair, colors.hair, colors.hair, colors.hair, colors.hair, colors.hair, colors.hair, colors.hair],
    // Row 2: Face with eyes
    [colors.skin, colors.skin, '#fff', colors.skin, colors.skin, '#fff', colors.skin, colors.skin],
    // Row 3: Face with mouth
    [colors.skin, colors.skin, colors.skin, '#c4856a', '#c4856a', colors.skin, colors.skin, colors.skin],
    // Row 4: Shirt top
    [colors.shirt, colors.shirt, colors.shirt, colors.accent, colors.accent, colors.shirt, colors.shirt, colors.shirt],
    // Row 5: Shirt bottom + arms
    [colors.skin, colors.shirt, colors.shirt, colors.shirt, colors.shirt, colors.shirt, colors.shirt, colors.skin],
    // Row 6: Pants
    [colors.pants, colors.pants, colors.pants, colors.pants, colors.pants, colors.pants, colors.pants, colors.pants],
    // Row 7: Shoes
    [colors.shoes, colors.shoes, colors.shoes, 'transparent', 'transparent', colors.shoes, colors.shoes, colors.shoes],
  ];

  return (
    <div 
      className="grid border-2 border-gray-300 rounded-lg overflow-hidden shadow-inner"
      style={{ 
        gridTemplateColumns: `repeat(8, ${cellSize}px)`,
        width: size,
        height: size,
      }}
    >
      {grid.flat().map((color, i) => (
        <div
          key={i}
          style={{
            width: cellSize,
            height: cellSize,
            backgroundColor: color === 'transparent' ? 'transparent' : color,
            boxShadow: color !== 'transparent' ? 'inset 0 0 0 0.5px rgba(0,0,0,0.1)' : 'none',
          }}
        />
      ))}
    </div>
  );
}

export default function SkinGalleryPage() {
  const router = useRouter();
  const [selectedSkin, setSelectedSkin] = useState<string | null>(null);
  const [hoveredSkin, setHoveredSkin] = useState<string | null>(null);

  // Handle template selection - saves to localStorage and redirects
  const handleUseTemplate = useCallback((skin: ExampleSkin) => {
    // Store template choice in localStorage for the editor to pick up
    localStorage.setItem('skin-template-choice', JSON.stringify({
      id: skin.id,
      colors: skin.colors,
      timestamp: Date.now(),
    }));
    
    // Navigate to editor
    router.push('/games/skin-creator');
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-purple-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link 
              href="/games/skin-creator"
              className="flex items-center gap-2 text-purple-600 hover:text-purple-800 transition-colors"
            >
              <span className="text-2xl">←</span>
              <span className="font-medium">Back to Editor</span>
            </Link>
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            🎨 Skin Gallery
          </h1>
          <div className="w-32" /> {/* Spacer for centering */}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Introduction */}
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-800 mb-3">
            Choose a Template to Start! ✨
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Pick one of these example skins as a starting point, then customize it in the editor
            to make it truly your own!
          </p>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {EXAMPLE_SKINS.map((skin) => (
            <div
              key={skin.id}
              className={`
                bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300 cursor-pointer
                ${hoveredSkin === skin.id ? 'scale-105 shadow-2xl' : ''}
                ${selectedSkin === skin.id ? 'ring-4 ring-purple-500 ring-offset-2' : ''}
              `}
              onMouseEnter={() => setHoveredSkin(skin.id)}
              onMouseLeave={() => setHoveredSkin(null)}
              onClick={() => setSelectedSkin(selectedSkin === skin.id ? null : skin.id)}
            >
              {/* Preview Area */}
              <div className="bg-gradient-to-br from-gray-100 to-gray-200 p-6 flex items-center justify-center">
                <div className="transform transition-transform duration-300 hover:rotate-3">
                  <SkinPreviewGrid colors={skin.colors} size={112} />
                </div>
              </div>

              {/* Info Area */}
              <div className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-2xl">{skin.emoji}</span>
                  <h3 className="text-lg font-bold text-gray-800">{skin.name}</h3>
                </div>
                <p className="text-sm text-gray-500 mb-3">{skin.description}</p>

                {/* Color Swatches */}
                <div className="flex gap-1 mb-4">
                  {Object.values(skin.colors).map((color, i) => (
                    <div
                      key={i}
                      className="w-5 h-5 rounded-full border-2 border-white shadow-sm"
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>

                {/* Use Template Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleUseTemplate(skin);
                  }}
                  className="w-full py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-xl 
                    hover:from-purple-600 hover:to-pink-600 transition-all shadow-md hover:shadow-lg
                    active:scale-95 flex items-center justify-center gap-2"
                >
                  <span>✏️</span>
                  <span>Use as Template</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Tips Section */}
        <div className="mt-12 bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span>💡</span> Tips for Creating Great Skins
          </h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex items-start gap-3">
              <span className="text-2xl">🎨</span>
              <div>
                <h4 className="font-semibold text-gray-800">Start Simple</h4>
                <p className="text-sm text-gray-600">Begin with a template and change colors one at a time</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">🪄</span>
              <div>
                <h4 className="font-semibold text-gray-800">Use Layers</h4>
                <p className="text-sm text-gray-600">Separate base, clothing, and accessories for easier editing</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">💾</span>
              <div>
                <h4 className="font-semibold text-gray-800">Save Often</h4>
                <p className="text-sm text-gray-600">Your work auto-saves, but export backups!</p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA to create from scratch */}
        <div className="mt-8 text-center">
          <p className="text-gray-600 mb-3">Want to start from scratch instead?</p>
          <Link
            href="/games/skin-creator"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-800 text-white font-bold rounded-xl 
              hover:bg-gray-900 transition-all shadow-md hover:shadow-lg"
          >
            <span>🆕</span>
            <span>Create Blank Skin</span>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white/50 border-t border-purple-100 py-6 mt-12">
        <div className="max-w-6xl mx-auto px-4 text-center text-gray-500 text-sm">
          <p>Made with 💜 by Onde • <Link href="/games" className="hover:text-purple-600">More Games</Link></p>
        </div>
      </footer>
    </div>
  );
}
