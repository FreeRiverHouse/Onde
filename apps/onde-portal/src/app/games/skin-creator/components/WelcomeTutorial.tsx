'use client';

interface WelcomeTutorialProps {
  show: boolean;
  onClose: () => void;
  tutorialStep: number;
  setTutorialStep: (step: number) => void;
}

export default function WelcomeTutorial({ show, onClose, tutorialStep, setTutorialStep }: WelcomeTutorialProps) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl transform animate-bounce-in">
        {tutorialStep === 0 && (
          <>
            <div className="text-center mb-6">
              <span className="text-6xl animate-bounce-soft">🎨</span>
              <h2 className="text-3xl font-black mt-4 bg-gradient-to-r from-purple-600 to-pink-600 text-transparent bg-clip-text">
                Welcome to Skin Creator!
              </h2>
              <p className="text-gray-600 mt-2">Create awesome Minecraft & Roblox skins in minutes!</p>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-xl">
                <span className="text-2xl">🖌️</span>
                <div>
                  <p className="font-bold">Draw on the Canvas</p>
                  <p className="text-sm text-gray-500">Use tools to paint your character</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl">
                <span className="text-2xl">👀</span>
                <div>
                  <p className="font-bold">Live 3D Preview</p>
                  <p className="text-sm text-gray-500">See your skin come to life!</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-xl">
                <span className="text-2xl">🎨</span>
                <div>
                  <p className="font-bold">Layers System</p>
                  <p className="text-sm text-gray-500">Base, Clothing, and Accessories</p>
                </div>
              </div>
            </div>
          </>
        )}
        {tutorialStep === 1 && (
          <>
            <div className="text-center mb-6">
              <span className="text-6xl">✨</span>
              <h2 className="text-2xl font-black mt-4">Pro Tips!</h2>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-xl">
                <span className="text-2xl">⌨️</span>
                <div>
                  <p className="font-bold">Keyboard Shortcuts</p>
                  <p className="text-sm text-gray-500">B=Brush, E=Eraser, F=Fill, ?=Help</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-xl">
                <span className="text-2xl">📱</span>
                <div>
                  <p className="font-bold">Touch Gestures</p>
                  <p className="text-sm text-gray-500">Pinch to zoom • Tap to draw • Long-press for color</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-pink-50 rounded-xl">
                <span className="text-2xl">🤖</span>
                <div>
                  <p className="font-bold">AI Generation</p>
                  <p className="text-sm text-gray-500">Let AI create skins for you!</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-cyan-50 rounded-xl">
                <span className="text-2xl">🖼️</span>
                <div>
                  <p className="font-bold">Community Gallery</p>
                  <p className="text-sm text-gray-500">Browse and share skins!</p>
                </div>
              </div>
              <a
                href="https://youtube.com/@OndeUniverse"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 bg-red-50 rounded-xl hover:bg-red-100 transition-colors"
              >
                <span className="text-2xl">📺</span>
                <div>
                  <p className="font-bold">Video Tutorials</p>
                  <p className="text-sm text-gray-500">Watch step-by-step guides!</p>
                </div>
              </a>
            </div>
          </>
        )}
        <div className="flex gap-3 mt-6">
          {tutorialStep > 0 && (
            <button
              onClick={() => setTutorialStep(tutorialStep - 1)}
              className="flex-1 py-3 rounded-xl font-bold bg-gray-200 hover:bg-gray-300 transition-all"
            >
              ← Back
            </button>
          )}
          {tutorialStep < 1 ? (
            <button
              onClick={() => setTutorialStep(1)}
              className="flex-1 py-3 rounded-xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-lg transition-all"
            >
              Next →
            </button>
          ) : (
            <button
              onClick={() => {
                onClose();
                localStorage.setItem('skin-creator-tutorial-seen', 'true');
              }}
              className="flex-1 py-3 rounded-xl font-bold bg-gradient-to-r from-green-500 to-teal-500 text-white hover:shadow-lg transition-all"
            >
              🚀 Start Creating!
            </button>
          )}
        </div>
        <button
          onClick={() => {
            onClose();
            localStorage.setItem('skin-creator-tutorial-seen', 'true');
          }}
          className="w-full mt-3 text-sm text-gray-400 hover:text-gray-600"
        >
          Skip tutorial
        </button>
      </div>
    </div>
  );
}
