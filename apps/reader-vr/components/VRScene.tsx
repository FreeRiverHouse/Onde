'use client';

import { Canvas } from '@react-three/fiber';
import { 
  OrbitControls,
  PerspectiveCamera,
} from '@react-three/drei';
import { XR, createXRStore, XROrigin } from '@react-three/xr';
import { Suspense, useState, useCallback, useEffect, useRef } from 'react';
import { FloatingBook } from './FloatingBook';
import { ReadingEnvironment } from './ReadingEnvironment';
import { VRControls } from './VRControls';
import { BookSelector } from './BookSelector';
import { useBookStore, SAMPLE_PAGES } from '@/store/bookStore';
import useAmbientSoundscapes from './AmbientSoundscapes';

// XR Store for session management
const store = createXRStore();

type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night';

export default function VRScene() {
  const [showBookSelector, setShowBookSelector] = useState(false);
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>('evening');
  const [isMuted, setIsMuted] = useState(false);
  const [ambientVolume, setAmbientVolume] = useState(0.5);
  const pageTurnRef = useRef<() => void>(() => {});
  
  // Ambient soundscapes hook
  const { playPageTurn } = useAmbientSoundscapes({
    timeOfDay,
    isMuted,
    volume: ambientVolume,
  });
  
  // Store page turn callback
  useEffect(() => {
    pageTurnRef.current = playPageTurn;
  }, [playPageTurn]);
  
  // Get state and actions from book store
  const { 
    currentBook,
    currentPage,
    fontSize,
    bookDistance,
    isLoading,
    nextPage,
    prevPage,
    setFontSize,
  } = useBookStore();
  
  // Cycle through times of day
  const cycleTimeOfDay = useCallback(() => {
    setTimeOfDay(prev => {
      const order: TimeOfDay[] = ['morning', 'afternoon', 'evening', 'night'];
      const idx = order.indexOf(prev);
      return order[(idx + 1) % order.length];
    });
  }, []);
  
  // Calculate total pages
  const totalPages = currentBook?.totalPages || SAMPLE_PAGES.length;
  
  // Font size adjustment
  const adjustFontSize = useCallback((delta: number) => {
    setFontSize(fontSize + delta);
  }, [fontSize, setFontSize]);
  
  // Wrapped page navigation with sound
  const handleNextPage = useCallback(() => {
    nextPage();
    pageTurnRef.current();
  }, [nextPage]);
  
  const handlePrevPage = useCallback(() => {
    prevPage();
    pageTurnRef.current();
  }, [prevPage]);

  return (
    <div className="h-full w-full relative">
      {/* VR Entry Buttons */}
      <div className="absolute top-4 left-4 z-10 flex gap-2">
        <button
          onClick={() => store.enterVR()}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium 
                     shadow-lg transition-all flex items-center gap-2"
        >
          <span className="text-xl">🥽</span>
          Enter VR
        </button>
        <button
          onClick={() => store.enterAR()}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium 
                     shadow-lg transition-all flex items-center gap-2"
        >
          <span className="text-xl">📱</span>
          Enter AR
        </button>
      </div>
      
      {/* Book Selection Button */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 flex gap-2">
        <button
          onClick={() => setShowBookSelector(true)}
          className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-medium 
                     shadow-lg transition-all flex items-center gap-2 border border-purple-500/30"
        >
          <span className="text-xl">📖</span>
          {currentBook ? currentBook.metadata.title : 'Select Book'}
        </button>
        
        {/* Time of Day Toggle */}
        <button
          onClick={cycleTimeOfDay}
          className="px-3 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-medium 
                     shadow-lg transition-all flex items-center gap-2 border border-amber-500/30"
          title="Change time of day"
        >
          <span className="text-xl">
            {timeOfDay === 'morning' ? '🌅' : 
             timeOfDay === 'afternoon' ? '☀️' : 
             timeOfDay === 'evening' ? '🌆' : '🌙'}
          </span>
          <span className="text-sm capitalize hidden sm:inline">{timeOfDay}</span>
        </button>
        
        {/* Audio Controls */}
        <div className="flex items-center gap-1 bg-gray-800 rounded-lg px-2 py-1 border border-gray-600/30">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="px-2 py-1 hover:bg-gray-700 rounded text-xl transition-colors"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? '🔇' : '🔊'}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={ambientVolume}
            onChange={(e) => setAmbientVolume(parseFloat(e.target.value))}
            disabled={isMuted}
            className="w-16 h-1.5 rounded-lg appearance-none cursor-pointer accent-amber-500
                       bg-gray-600 disabled:opacity-50"
            title="Ambient volume"
          />
        </div>
      </div>
      
      {/* Controls Panel */}
      <div className="absolute top-4 right-4 z-10 bg-black/50 backdrop-blur-sm p-4 rounded-lg text-white max-w-xs">
        <h3 className="font-bold mb-2">Controls</h3>
        <div className="text-sm space-y-1">
          <p>← → Arrow keys: Turn pages</p>
          <p>+/- keys: Font size</p>
          <p>Mouse: Look around</p>
          <p>VR: Trigger to turn pages</p>
        </div>
        <div className="mt-3 space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs">Font:</span>
            <button 
              onClick={() => adjustFontSize(-0.005)}
              className="px-2 py-1 bg-gray-700 rounded text-xs hover:bg-gray-600"
            >
              A-
            </button>
            <button 
              onClick={() => adjustFontSize(0.005)}
              className="px-2 py-1 bg-gray-700 rounded text-xs hover:bg-gray-600"
            >
              A+
            </button>
          </div>
          <div className="text-xs">
            Page: {currentPage + 1} / {totalPages}
          </div>
          {currentBook && (
            <div className="text-xs text-purple-300 truncate">
              {currentBook.metadata.title}
            </div>
          )}
        </div>
      </div>
      
      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-black/50 z-20 flex items-center justify-center">
          <div className="text-white flex items-center gap-3">
            <span className="animate-spin text-3xl">⏳</span>
            <span className="text-xl">Loading book...</span>
          </div>
        </div>
      )}

      {/* 3D Canvas */}
      <Canvas
        gl={{ antialias: true, alpha: false }}
        camera={{ position: [0, 1.6, 0], fov: 70 }}
      >
        <XR store={store}>
          <Suspense fallback={null}>
            {/* Camera for non-VR mode */}
            <PerspectiveCamera makeDefault position={[0, 1.6, 0]} />
            
            {/* XR Origin - where the user stands in VR */}
            <XROrigin position={[0, 0, 0]} />
            
            {/* Environment & Lighting */}
            <ReadingEnvironment timeOfDay={timeOfDay} />
            
            {/* The floating book/text panel */}
            <FloatingBook 
              currentPage={currentPage}
              fontSize={fontSize}
              distance={bookDistance}
              onNextPage={handleNextPage}
              onPrevPage={handlePrevPage}
            />
            
            {/* VR Controller interactions */}
            <VRControls 
              onNextPage={handleNextPage}
              onPrevPage={handlePrevPage}
              onFontIncrease={() => adjustFontSize(0.005)}
              onFontDecrease={() => adjustFontSize(-0.005)}
            />
            
            {/* Non-VR orbit controls */}
            <OrbitControls 
              target={[0, 1.4, -bookDistance]} 
              enablePan={false}
              minDistance={0.5}
              maxDistance={4}
            />
          </Suspense>
        </XR>
      </Canvas>
      
      {/* Keyboard event handler */}
      <KeyboardHandler 
        onNextPage={handleNextPage} 
        onPrevPage={handlePrevPage}
        onFontIncrease={() => adjustFontSize(0.005)}
        onFontDecrease={() => adjustFontSize(-0.005)}
      />
      
      {/* Book Selector Modal */}
      {showBookSelector && (
        <BookSelector onClose={() => setShowBookSelector(false)} />
      )}
    </div>
  );
}

// Keyboard handler component
function KeyboardHandler({ 
  onNextPage, 
  onPrevPage,
  onFontIncrease,
  onFontDecrease,
}: { 
  onNextPage: () => void;
  onPrevPage: () => void;
  onFontIncrease: () => void;
  onFontDecrease: () => void;
}) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        onNextPage();
      } else if (e.key === 'ArrowLeft') {
        onPrevPage();
      } else if (e.key === '+' || e.key === '=') {
        onFontIncrease();
      } else if (e.key === '-') {
        onFontDecrease();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onNextPage, onPrevPage, onFontIncrease, onFontDecrease]);
  
  return null;
}
