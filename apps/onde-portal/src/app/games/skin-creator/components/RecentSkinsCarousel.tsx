'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

/**
 * 🎨 Recent Skins Carousel
 * A sleek horizontal carousel showing the user's most recently created skins
 * for quick access and loading into the editor.
 */

interface SavedSkin {
  id: string;
  name: string;
  dataUrl: string;
  timestamp: number;
  tags?: string[];
  rating?: number;
  isFavorite?: boolean;
}

interface RecentSkinsCarouselProps {
  skins: SavedSkin[];
  onLoadSkin: (skin: SavedSkin) => void;
  onDeleteSkin?: (id: string) => void;
  maxVisible?: number;
  playSound?: (sound: string) => void;
  darkMode?: boolean;
}

export default function RecentSkinsCarousel({
  skins,
  onLoadSkin,
  onDeleteSkin,
  maxVisible = 10,
  playSound = () => {},
  darkMode = false,
}: RecentSkinsCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [hoveredSkin, setHoveredSkin] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(true);

  // Get recent skins sorted by timestamp (newest first)
  const recentSkins = [...skins]
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, maxVisible);

  // Check scroll state
  const updateScrollState = useCallback(() => {
    const container = scrollRef.current;
    if (!container) return;
    
    setCanScrollLeft(container.scrollLeft > 0);
    setCanScrollRight(
      container.scrollLeft < container.scrollWidth - container.clientWidth - 5
    );
  }, []);

  useEffect(() => {
    updateScrollState();
    const container = scrollRef.current;
    if (container) {
      container.addEventListener('scroll', updateScrollState);
      window.addEventListener('resize', updateScrollState);
      return () => {
        container.removeEventListener('scroll', updateScrollState);
        window.removeEventListener('resize', updateScrollState);
      };
    }
  }, [updateScrollState, recentSkins.length]);

  // Scroll handlers
  const scrollLeft = () => {
    scrollRef.current?.scrollBy({ left: -200, behavior: 'smooth' });
    playSound('click');
  };

  const scrollRight = () => {
    scrollRef.current?.scrollBy({ left: 200, behavior: 'smooth' });
    playSound('click');
  };

  // Format relative time
  const formatRelativeTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  if (recentSkins.length === 0) {
    return null; // Don't show if no skins
  }

  return (
    <div className={`w-full max-w-6xl mx-auto mb-4 transition-all duration-300 ${
      isExpanded ? 'opacity-100' : 'opacity-60'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between px-2 mb-2">
        <button
          onClick={() => { setIsExpanded(!isExpanded); playSound('click'); }}
          className="flex items-center gap-2 text-white/90 hover:text-white transition-colors group"
        >
          <span className="text-lg">🕒</span>
          <span className="font-bold text-sm tracking-wide">
            Recent Creations
          </span>
          <span className="text-xs px-2 py-0.5 bg-white/20 rounded-full">
            {recentSkins.length}
          </span>
          <span className={`text-sm transition-transform duration-200 ${
            isExpanded ? 'rotate-180' : ''
          }`}>
            ▼
          </span>
        </button>

        {isExpanded && (
          <div className="flex items-center gap-1">
            <span className="text-white/50 text-xs mr-2 hidden sm:inline">
              Click to load
            </span>
          </div>
        )}
      </div>

      {/* Carousel Container */}
      <div className={`relative transition-all duration-300 ${
        isExpanded ? 'h-auto opacity-100' : 'h-0 opacity-0 overflow-hidden'
      }`}>
        {/* Scroll Left Button */}
        {canScrollLeft && (
          <button
            onClick={scrollLeft}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 
              w-8 h-8 rounded-full bg-black/50 hover:bg-black/70 
              text-white flex items-center justify-center
              transition-all duration-200 hover:scale-110
              backdrop-blur-sm shadow-lg"
            aria-label="Scroll left"
          >
            ◀
          </button>
        )}

        {/* Scroll Right Button */}
        {canScrollRight && (
          <button
            onClick={scrollRight}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 
              w-8 h-8 rounded-full bg-black/50 hover:bg-black/70 
              text-white flex items-center justify-center
              transition-all duration-200 hover:scale-110
              backdrop-blur-sm shadow-lg"
            aria-label="Scroll right"
          >
            ▶
          </button>
        )}

        {/* Skins Carousel */}
        <div
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto pb-2 px-1 scrollbar-hide"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          {recentSkins.map((skin, index) => (
            <div
              key={skin.id}
              className="flex-shrink-0 group relative"
              onMouseEnter={() => setHoveredSkin(skin.id)}
              onMouseLeave={() => setHoveredSkin(null)}
              style={{
                animation: `fadeSlideIn 0.3s ease-out ${index * 0.05}s both`,
              }}
            >
              {/* Skin Card */}
              <button
                onClick={() => {
                  onLoadSkin(skin);
                  playSound('click');
                }}
                className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden
                  border-2 transition-all duration-200
                  hover:scale-110 hover:shadow-xl hover:z-10
                  ${hoveredSkin === skin.id 
                    ? 'border-yellow-400 shadow-yellow-400/30 shadow-lg' 
                    : 'border-white/30 hover:border-white/60'
                  }
                  ${darkMode ? 'bg-slate-800' : 'bg-white/90'}
                `}
              >
                {/* Skin Image */}
                <img
                  src={skin.dataUrl}
                  alt={skin.name}
                  className="w-full h-full object-contain pixelated"
                  style={{ imageRendering: 'pixelated' }}
                  draggable={false}
                />

                {/* Favorite Star */}
                {skin.isFavorite && (
                  <div className="absolute top-0.5 right-0.5 text-yellow-400 text-xs drop-shadow">
                    ⭐
                  </div>
                )}

                {/* Hover Overlay */}
                <div className={`absolute inset-0 bg-black/60 flex items-center justify-center
                  transition-opacity duration-200 ${
                    hoveredSkin === skin.id ? 'opacity-100' : 'opacity-0'
                  }`}
                >
                  <span className="text-white text-lg">▶</span>
                </div>
              </button>

              {/* Tooltip */}
              <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2
                pointer-events-none transition-all duration-200 z-20
                ${hoveredSkin === skin.id 
                  ? 'opacity-100 translate-y-0' 
                  : 'opacity-0 translate-y-2'
                }`}
              >
                <div className="bg-slate-900 text-white text-xs px-3 py-2 rounded-lg 
                  whitespace-nowrap shadow-xl min-w-max"
                >
                  <div className="font-bold truncate max-w-[120px]">
                    {skin.name}
                  </div>
                  <div className="text-white/60 text-[10px]">
                    {formatRelativeTime(skin.timestamp)}
                  </div>
                  {/* Arrow */}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 
                    border-4 border-transparent border-t-slate-900" />
                </div>
              </div>

              {/* Delete button (on hover) */}
              {onDeleteSkin && hoveredSkin === skin.id && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm(`Delete "${skin.name}"?`)) {
                      onDeleteSkin(skin.id);
                      playSound('click');
                    }
                  }}
                  className="absolute -top-1 -right-1 w-5 h-5 rounded-full 
                    bg-red-500 hover:bg-red-600 text-white text-xs
                    flex items-center justify-center shadow-lg
                    transition-all duration-200 hover:scale-110 z-20"
                  title="Delete skin"
                >
                  ×
                </button>
              )}
            </div>
          ))}

          {/* "Create New" card at the end */}
          <div className="flex-shrink-0">
            <div
              className={`w-16 h-16 sm:w-20 sm:h-20 rounded-xl 
                border-2 border-dashed border-white/30 
                flex items-center justify-center
                transition-all duration-200
                ${darkMode ? 'bg-white/5' : 'bg-white/20'}
              `}
            >
              <span className="text-white/40 text-2xl">+</span>
            </div>
            <p className="text-white/40 text-[10px] text-center mt-1">Create</p>
          </div>
        </div>
      </div>

      {/* CSS for animations */}
      <style jsx>{`
        @keyframes fadeSlideIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        
        .pixelated {
          image-rendering: pixelated;
          image-rendering: crisp-edges;
        }
      `}</style>
    </div>
  );
}
