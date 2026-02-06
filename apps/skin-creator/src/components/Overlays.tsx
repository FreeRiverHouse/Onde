'use client';

import dynamic from 'next/dynamic';

const Confetti = dynamic(() => import('react-confetti'), { ssr: false });

interface OverlaysProps {
  // Confetti
  showConfetti: boolean;
  windowSize: { width: number; height: number };
  // Shortcuts
  showShortcuts: boolean;
  setShowShortcuts: (show: boolean) => void;
  // Achievement
  showAchievement: { id: string; name: string; emoji: string } | null;
  // Milestone
  showMilestone: boolean;
  // Particles
  particles: Array<{ id: number; x: number; y: number; color: string }>;
  // Help
  showHelp: boolean;
  setShowHelp: (show: boolean) => void;
}

export default function Overlays({
  showConfetti,
  windowSize,
  showShortcuts,
  setShowShortcuts,
  showAchievement,
  showMilestone,
  particles,
  showHelp,
  setShowHelp,
}: OverlaysProps) {
  return (
    <>
      {/* 🎉 Confetti celebration on download! */}
      {showConfetti && (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={false}
          numberOfPieces={500}
          gravity={0.3}
        />
      )}

      {/* ⌨️ Keyboard Shortcuts Help */}
      {showShortcuts && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50" onClick={() => setShowShortcuts(false)}>
          <div className="bg-gray-900 text-white p-6 rounded-2xl shadow-2xl max-w-md" onClick={e => e.stopPropagation()}>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">⌨️ Keyboard Shortcuts</h2>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="bg-gray-800 px-3 py-2 rounded">B</div><div className="py-2">Brush tool</div>
              <div className="bg-gray-800 px-3 py-2 rounded">E</div><div className="py-2">Eraser</div>
              <div className="bg-gray-800 px-3 py-2 rounded">F</div><div className="py-2">Fill bucket</div>
              <div className="bg-gray-800 px-3 py-2 rounded">I</div><div className="py-2">Eyedropper</div>
              <div className="bg-gray-800 px-3 py-2 rounded">1-5</div><div className="py-2">Brush size</div>
              <div className="bg-gray-800 px-3 py-2 rounded">⌘/Ctrl + Z</div><div className="py-2">Undo</div>
              <div className="bg-gray-800 px-3 py-2 rounded">⌘/Ctrl + Y</div><div className="py-2">Redo</div>
              <div className="bg-gray-800 px-3 py-2 rounded">⌘/Ctrl + S</div><div className="py-2">Save</div>
              <div className="bg-gray-800 px-3 py-2 rounded">?</div><div className="py-2">This help</div>
              <div className="bg-gray-800 px-3 py-2 rounded">Esc</div><div className="py-2">Close panels</div>
            </div>
            <p className="text-gray-400 text-xs mt-4 text-center">Press ? or Esc to close</p>
          </div>
        </div>
      )}

      {/* 🏆 Achievement Popup */}
      {showAchievement && (
        <div className="fixed top-20 right-4 z-50 animate-bounce">
          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3">
            <span className="text-4xl">{showAchievement.emoji}</span>
            <div>
              <p className="text-xs opacity-75">Achievement Unlocked!</p>
              <p className="font-bold text-lg">{showAchievement.name}</p>
            </div>
          </div>
        </div>
      )}

      {/* 🎉 T1000 MILESTONE POPUP */}
      {showMilestone && (
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
          <div className="bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-500 text-white px-8 py-6 rounded-3xl shadow-2xl animate-bounce">
            <div className="text-center">
              <div className="text-6xl mb-2">🎉</div>
              <h2 className="text-3xl font-black mb-2">TASK 1000!</h2>
              <p className="text-lg opacity-90">Milestone Reached!</p>
              <p className="text-sm opacity-75 mt-2">22+ features added today</p>
            </div>
          </div>
        </div>
      )}

      {/* ✨ Sparkle particles when drawing */}
      {particles.map(p => (
        <div
          key={p.id}
          className="fixed pointer-events-none animate-ping"
          style={{
            left: p.x - 8,
            top: p.y - 8,
            width: 16,
            height: 16,
            backgroundColor: p.color,
            borderRadius: '50%',
            boxShadow: `0 0 10px ${p.color}, 0 0 20px ${p.color}`,
            zIndex: 9999,
          }}
        />
      ))}

      {/* Help Modal */}
      {showHelp && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowHelp(false)}>
          <div className="bg-white rounded-2xl p-6 max-w-md m-4 shadow-2xl max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-bold mb-4">⌨️ Keyboard Shortcuts</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <span className="font-mono bg-gray-100 px-2 py-1 rounded">B</span><span>Brush</span>
              <span className="font-mono bg-gray-100 px-2 py-1 rounded">E</span><span>Eraser</span>
              <span className="font-mono bg-gray-100 px-2 py-1 rounded">F</span><span>Fill</span>
              <span className="font-mono bg-gray-100 px-2 py-1 rounded">G</span><span>Gradient</span>
              <span className="font-mono bg-gray-100 px-2 py-1 rounded">W</span><span>Glow</span>
              <span className="font-mono bg-gray-100 px-2 py-1 rounded">S</span><span>Stamp</span>
              <span className="font-mono bg-gray-100 px-2 py-1 rounded">I</span><span>Eyedropper</span>
              <span className="font-mono bg-gray-100 px-2 py-1 rounded">M</span><span>Mirror</span>
              <span className="font-mono bg-gray-100 px-2 py-1 rounded">D</span><span>Dark mode</span>
              <span className="font-mono bg-gray-100 px-2 py-1 rounded">1-3</span><span>Brush size</span>
              <span className="font-mono bg-gray-100 px-2 py-1 rounded">⌘Z</span><span>Undo</span>
              <span className="font-mono bg-gray-100 px-2 py-1 rounded">⌘Y</span><span>Redo</span>
            </div>
            <h4 className="text-lg font-bold mt-4 mb-2">🎨 Layer Shortcuts</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <span className="font-mono bg-gray-100 px-2 py-1 rounded">L</span><span>Toggle layer panel</span>
              <span className="font-mono bg-gray-100 px-2 py-1 rounded">[</span><span>Previous layer</span>
              <span className="font-mono bg-gray-100 px-2 py-1 rounded">]</span><span>Next layer</span>
              <span className="font-mono bg-gray-100 px-2 py-1 rounded">C</span><span>Duplicate layer</span>
            </div>
            <button onClick={() => setShowHelp(false)} className="mt-4 w-full py-2 bg-blue-500 text-white rounded-lg font-bold">
              Got it! 👍
            </button>
          </div>
        </div>
      )}
    </>
  );
}
