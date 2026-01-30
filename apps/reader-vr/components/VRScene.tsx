'use client';

import { Canvas } from '@react-three/fiber';
import { 
  Environment, 
  Sky, 
  OrbitControls,
  PerspectiveCamera,
} from '@react-three/drei';
import { XR, createXRStore, XROrigin } from '@react-three/xr';
import { Suspense, useState, useCallback } from 'react';
import { FloatingBook } from './FloatingBook';
import { ReadingEnvironment } from './ReadingEnvironment';
import { VRControls } from './VRControls';

// XR Store for session management
const store = createXRStore();

export default function VRScene() {
  const [currentPage, setCurrentPage] = useState(0);
  const [fontSize, setFontSize] = useState(0.045);
  const [bookDistance, setBookDistance] = useState(1.5);
  
  const nextPage = useCallback(() => {
    setCurrentPage(p => p + 1);
  }, []);
  
  const prevPage = useCallback(() => {
    setCurrentPage(p => Math.max(0, p - 1));
  }, []);

  const adjustFontSize = useCallback((delta: number) => {
    setFontSize(s => Math.max(0.02, Math.min(0.08, s + delta)));
  }, []);

  return (
    <div className="h-full w-full relative">
      {/* VR Entry Button */}
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
      
      {/* Controls Panel */}
      <div className="absolute top-4 right-4 z-10 bg-black/50 backdrop-blur-sm p-4 rounded-lg text-white">
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
          <div className="text-xs">Page: {currentPage + 1}</div>
        </div>
      </div>

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
            <ReadingEnvironment />
            
            {/* The floating book/text panel */}
            <FloatingBook 
              currentPage={currentPage}
              fontSize={fontSize}
              distance={bookDistance}
              onNextPage={nextPage}
              onPrevPage={prevPage}
            />
            
            {/* VR Controller interactions */}
            <VRControls 
              onNextPage={nextPage}
              onPrevPage={prevPage}
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
        onNextPage={nextPage} 
        onPrevPage={prevPage}
        onFontIncrease={() => adjustFontSize(0.005)}
        onFontDecrease={() => adjustFontSize(-0.005)}
      />
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
  // Use effect for keyboard events
  if (typeof window !== 'undefined') {
    window.onkeydown = (e) => {
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
  }
  return null;
}
