'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Tutorial step definition
interface TutorialStep {
  id: string;
  title: string;
  description: string;
  emoji: string;
  targetSelector?: string; // CSS selector for element to highlight
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  action?: 'click' | 'draw' | 'select' | 'none'; // Action user needs to take
  actionHint?: string;
  celebrate?: boolean; // Show confetti/celebration on complete
}

// All tutorial steps
const TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to Skin Creator! 🎨',
    description: "Let's create an awesome Minecraft skin together! I'll show you how everything works.",
    emoji: '👋',
    position: 'center',
    action: 'none',
  },
  {
    id: 'canvas',
    title: 'The Canvas',
    description: 'This is where you draw your skin! Each square is a pixel on your character.',
    emoji: '🖼️',
    targetSelector: '[data-tutorial="canvas"]',
    position: 'right',
    action: 'none',
  },
  {
    id: 'colors',
    title: 'Pick a Color',
    description: 'Click any color to select it. Try picking your favorite color!',
    emoji: '🎨',
    targetSelector: '[data-tutorial="colors"]',
    position: 'top',
    action: 'click',
    actionHint: 'Click a color to continue',
  },
  {
    id: 'tools',
    title: 'Drawing Tools',
    description: 'Use Brush to paint, Eraser to remove, and Fill to color big areas fast!',
    emoji: '🖌️',
    targetSelector: '[data-tutorial="tools"]',
    position: 'bottom',
    action: 'none',
  },
  {
    id: 'draw',
    title: 'Draw Something!',
    description: 'Click and drag on the canvas to paint. Try drawing on your character!',
    emoji: '✏️',
    targetSelector: '[data-tutorial="canvas"]',
    position: 'right',
    action: 'draw',
    actionHint: 'Draw on the canvas to continue',
  },
  {
    id: 'preview3d',
    title: '3D Preview',
    description: 'See your skin come to life! Drag to rotate and see all angles.',
    emoji: '🎮',
    targetSelector: '[data-tutorial="preview3d"]',
    position: 'left',
    action: 'none',
  },
  {
    id: 'templates',
    title: 'Quick Templates',
    description: "Don't want to start from scratch? Pick a template to get a head start!",
    emoji: '👤',
    targetSelector: '[data-tutorial="templates"]',
    position: 'bottom',
    action: 'none',
  },
  {
    id: 'layers',
    title: 'Layers',
    description: 'Use layers to separate Base, Clothing, and Accessories. Like drawing on transparent paper!',
    emoji: '📚',
    targetSelector: '[data-tutorial="layers"]',
    position: 'left',
    action: 'none',
  },
  {
    id: 'ai',
    title: 'AI Magic ✨',
    description: 'Type what you want and let AI create a skin for you! Try "ninja with fire powers"!',
    emoji: '🤖',
    targetSelector: '[data-tutorial="ai-button"]',
    position: 'bottom',
    action: 'none',
  },
  {
    id: 'download',
    title: 'Download & Share',
    description: "When you're done, download your skin to use in Minecraft!",
    emoji: '⬇️',
    targetSelector: '[data-tutorial="download"]',
    position: 'left',
    action: 'none',
    celebrate: true,
  },
  {
    id: 'complete',
    title: "You're Ready! 🚀",
    description: "Now go create something amazing! Remember: you can always access this tutorial from the menu.",
    emoji: '🎉',
    position: 'center',
    action: 'none',
    celebrate: true,
  },
];

// Mini confetti for celebrations
function MiniConfetti() {
  const particles = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    x: 50 + (Math.random() - 0.5) * 60,
    delay: Math.random() * 0.3,
    duration: 1 + Math.random() * 1,
    color: ['#FFD700', '#FF6B6B', '#4ECDC4', '#A855F7', '#22C55E', '#3B82F6'][Math.floor(Math.random() * 6)],
    size: 6 + Math.random() * 8,
  }));

  return (
    <div className="fixed inset-0 pointer-events-none z-[60] overflow-hidden">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute"
          style={{
            left: `${p.x}%`,
            top: '30%',
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            borderRadius: Math.random() > 0.5 ? '50%' : '2px',
          }}
          initial={{ y: 0, opacity: 1, rotate: 0, scale: 1 }}
          animate={{
            y: [0, -80, 250],
            opacity: [1, 1, 0],
            rotate: [0, 180, 360],
            scale: [1, 1.2, 0.8],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            ease: 'easeOut',
          }}
        />
      ))}
    </div>
  );
}

// Spotlight overlay component
function Spotlight({ 
  targetRect, 
  padding = 12 
}: { 
  targetRect: DOMRect | null;
  padding?: number;
}) {
  if (!targetRect) {
    return (
      <div className="fixed inset-0 bg-black/70 z-[51]" />
    );
  }

  const x = targetRect.left - padding;
  const y = targetRect.top - padding;
  const width = targetRect.width + padding * 2;
  const height = targetRect.height + padding * 2;

  return (
    <div className="fixed inset-0 z-[51] pointer-events-none">
      {/* Dark overlay with cutout */}
      <svg width="100%" height="100%" className="absolute inset-0">
        <defs>
          <mask id="spotlight-mask">
            <rect width="100%" height="100%" fill="white" />
            <rect
              x={x}
              y={y}
              width={width}
              height={height}
              rx="16"
              fill="black"
            />
          </mask>
        </defs>
        <rect
          width="100%"
          height="100%"
          fill="rgba(0,0,0,0.75)"
          mask="url(#spotlight-mask)"
        />
      </svg>

      {/* Glow effect around spotlight */}
      <motion.div
        className="absolute border-4 border-purple-400 rounded-2xl pointer-events-none"
        style={{
          left: x,
          top: y,
          width: width,
          height: height,
        }}
        animate={{
          boxShadow: [
            '0 0 20px rgba(168, 85, 247, 0.5)',
            '0 0 40px rgba(168, 85, 247, 0.8)',
            '0 0 20px rgba(168, 85, 247, 0.5)',
          ],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Pulse ring animation */}
      <motion.div
        className="absolute rounded-2xl pointer-events-none border-2 border-purple-300"
        style={{
          left: x - 4,
          top: y - 4,
          width: width + 8,
          height: height + 8,
        }}
        animate={{
          scale: [1, 1.05, 1],
          opacity: [0.5, 0.2, 0.5],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
    </div>
  );
}

// Tooltip/popup component
function TutorialPopup({
  step,
  targetRect,
  currentIndex,
  totalSteps,
  onNext,
  onPrev,
  onSkip,
  canProceed,
}: {
  step: TutorialStep;
  targetRect: DOMRect | null;
  currentIndex: number;
  totalSteps: number;
  onNext: () => void;
  onPrev: () => void;
  onSkip: () => void;
  canProceed: boolean;
}) {
  const getPosition = () => {
    if (!targetRect || step.position === 'center') {
      return {
        position: 'fixed' as const,
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
      };
    }

    const padding = 24;
    const popupWidth = 320;
    const popupHeight = 280;

    switch (step.position) {
      case 'right':
        return {
          position: 'fixed' as const,
          top: Math.max(16, Math.min(targetRect.top, window.innerHeight - popupHeight - 16)),
          left: Math.min(targetRect.right + padding, window.innerWidth - popupWidth - 16),
        };
      case 'left':
        return {
          position: 'fixed' as const,
          top: Math.max(16, Math.min(targetRect.top, window.innerHeight - popupHeight - 16)),
          left: Math.max(16, targetRect.left - popupWidth - padding),
        };
      case 'bottom':
        return {
          position: 'fixed' as const,
          top: Math.min(targetRect.bottom + padding, window.innerHeight - popupHeight - 16),
          left: Math.max(16, Math.min(targetRect.left + targetRect.width / 2 - popupWidth / 2, window.innerWidth - popupWidth - 16)),
        };
      case 'top':
        return {
          position: 'fixed' as const,
          top: Math.max(16, targetRect.top - popupHeight - padding),
          left: Math.max(16, Math.min(targetRect.left + targetRect.width / 2 - popupWidth / 2, window.innerWidth - popupWidth - 16)),
        };
      default:
        return {
          position: 'fixed' as const,
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        };
    }
  };

  const positionStyle = getPosition();

  return (
    <motion.div
      className="z-[52] bg-white rounded-3xl shadow-2xl p-5 w-80 max-w-[calc(100vw-32px)]"
      style={positionStyle}
      initial={{ opacity: 0, scale: 0.9, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: -10 }}
      transition={{ type: 'spring', damping: 20, stiffness: 300 }}
    >
      {/* Progress bar */}
      <div className="flex gap-1 mb-4">
        {Array.from({ length: totalSteps }, (_, i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-all ${
              i < currentIndex
                ? 'bg-green-400'
                : i === currentIndex
                ? 'bg-gradient-to-r from-purple-500 to-pink-500'
                : 'bg-gray-200'
            }`}
          />
        ))}
      </div>

      {/* Content */}
      <div className="text-center mb-4">
        <motion.span
          className="text-5xl block mb-3"
          animate={{ 
            scale: [1, 1.1, 1],
            rotate: step.celebrate ? [0, -10, 10, 0] : 0,
          }}
          transition={{ 
            duration: 0.5,
            repeat: step.celebrate ? 3 : 0,
          }}
        >
          {step.emoji}
        </motion.span>
        <h3 className="text-xl font-black bg-gradient-to-r from-purple-600 to-pink-600 text-transparent bg-clip-text mb-2">
          {step.title}
        </h3>
        <p className="text-gray-600 text-sm leading-relaxed">
          {step.description}
        </p>
      </div>

      {/* Action hint */}
      {step.action !== 'none' && step.actionHint && !canProceed && (
        <motion.div
          className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl px-4 py-2 mb-4 border border-amber-200"
          animate={{ scale: [1, 1.02, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <p className="text-amber-700 text-sm font-medium flex items-center justify-center gap-2">
            <span className="animate-bounce">👆</span>
            {step.actionHint}
          </p>
        </motion.div>
      )}

      {/* Success indicator when action completed */}
      {step.action !== 'none' && canProceed && (
        <motion.div
          className="bg-green-50 rounded-xl px-4 py-2 mb-4 border border-green-200"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          <p className="text-green-700 text-sm font-medium flex items-center justify-center gap-2">
            <span>✅</span>
            Great job! Click Next to continue
          </p>
        </motion.div>
      )}

      {/* Navigation buttons */}
      <div className="flex gap-2">
        {currentIndex > 0 && (
          <button
            onClick={onPrev}
            className="flex-1 py-2.5 rounded-xl font-bold bg-gray-100 hover:bg-gray-200 text-gray-700 transition-all active:scale-95"
          >
            ← Back
          </button>
        )}
        <button
          onClick={onNext}
          disabled={step.action !== 'none' && !canProceed}
          className={`flex-1 py-2.5 rounded-xl font-bold transition-all active:scale-95 ${
            step.action === 'none' || canProceed
              ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-lg hover:scale-[1.02]'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          {currentIndex === totalSteps - 1 ? "Let's Go! 🚀" : 'Next →'}
        </button>
      </div>

      {/* Skip button */}
      <button
        onClick={onSkip}
        className="w-full mt-3 text-sm text-gray-400 hover:text-gray-600 transition-colors"
      >
        Skip tutorial
      </button>

      {/* Step counter */}
      <p className="text-center text-xs text-gray-400 mt-2">
        Step {currentIndex + 1} of {totalSteps}
      </p>
    </motion.div>
  );
}

// Main Interactive Tutorial Component
interface InteractiveTutorialProps {
  isOpen: boolean;
  onClose: () => void;
  onColorSelected?: () => void;
  onCanvasDrawn?: () => void;
}

export default function InteractiveTutorial({
  isOpen,
  onClose,
  onColorSelected,
  onCanvasDrawn,
}: InteractiveTutorialProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [actionCompleted, setActionCompleted] = useState(false);
  const resizeObserver = useRef<ResizeObserver | null>(null);

  const step = TUTORIAL_STEPS[currentStep];

  // Find and track the target element
  const updateTargetRect = useCallback(() => {
    if (!step.targetSelector) {
      setTargetRect(null);
      return;
    }

    const element = document.querySelector(step.targetSelector);
    if (element) {
      const rect = element.getBoundingClientRect();
      setTargetRect(rect);
    } else {
      setTargetRect(null);
    }
  }, [step.targetSelector]);

  // Update target rect on step change and window resize
  useEffect(() => {
    if (!isOpen) return;

    updateTargetRect();

    // Update on resize
    const handleResize = () => updateTargetRect();
    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleResize, true);

    // Use ResizeObserver for element size changes
    if (step.targetSelector) {
      const element = document.querySelector(step.targetSelector);
      if (element) {
        resizeObserver.current = new ResizeObserver(updateTargetRect);
        resizeObserver.current.observe(element);
      }
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleResize, true);
      resizeObserver.current?.disconnect();
    };
  }, [isOpen, currentStep, step.targetSelector, updateTargetRect]);

  // Reset action completed when step changes
  useEffect(() => {
    setActionCompleted(false);
  }, [currentStep]);

  // Listen for actions from parent
  useEffect(() => {
    if (!isOpen) return;

    if (step.id === 'colors' && onColorSelected) {
      // Color was selected
      setActionCompleted(true);
    }
  }, [isOpen, step.id, onColorSelected]);

  useEffect(() => {
    if (!isOpen) return;

    if (step.id === 'draw' && onCanvasDrawn) {
      setActionCompleted(true);
    }
  }, [isOpen, step.id, onCanvasDrawn]);

  // Handle next step
  const handleNext = useCallback(() => {
    if (currentStep < TUTORIAL_STEPS.length - 1) {
      // Check for celebration
      if (TUTORIAL_STEPS[currentStep + 1].celebrate) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 2000);
      }
      setCurrentStep(currentStep + 1);
    } else {
      // Complete tutorial
      localStorage.setItem('skin-creator-tutorial-complete', 'true');
      localStorage.setItem('skin-creator-tutorial-seen', 'true');
      onClose();
    }
  }, [currentStep, onClose]);

  // Handle prev step
  const handlePrev = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  }, [currentStep]);

  // Handle skip
  const handleSkip = useCallback(() => {
    localStorage.setItem('skin-creator-tutorial-seen', 'true');
    onClose();
  }, [onClose]);

  // Check if current action is completed
  const canProceed = step.action === 'none' || actionCompleted;

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50">
        {/* Spotlight overlay */}
        <Spotlight targetRect={targetRect} />

        {/* Tutorial popup */}
        <TutorialPopup
          step={step}
          targetRect={targetRect}
          currentIndex={currentStep}
          totalSteps={TUTORIAL_STEPS.length}
          onNext={handleNext}
          onPrev={handlePrev}
          onSkip={handleSkip}
          canProceed={canProceed}
        />

        {/* Confetti celebration */}
        {showConfetti && <MiniConfetti />}

        {/* Allow clicking on highlighted element */}
        {targetRect && (
          <div
            className="fixed z-[52] pointer-events-auto"
            style={{
              left: targetRect.left - 12,
              top: targetRect.top - 12,
              width: targetRect.width + 24,
              height: targetRect.height + 24,
              background: 'transparent',
            }}
          />
        )}
      </div>
    </>
  );
}

// Export a hook to manage tutorial state
export function useTutorial() {
  const [isOpen, setIsOpen] = useState(false);
  const [colorSelected, setColorSelected] = useState(false);
  const [canvasDrawn, setCanvasDrawn] = useState(false);

  // Check if should auto-open on mount
  useEffect(() => {
    const seen = localStorage.getItem('skin-creator-tutorial-seen');
    const visited = localStorage.getItem('skin-studio-visited');
    
    // Show tutorial on first visit after dismissing welcome hints
    if (visited && !seen) {
      setTimeout(() => setIsOpen(true), 500);
    }
  }, []);

  const openTutorial = useCallback(() => {
    setColorSelected(false);
    setCanvasDrawn(false);
    setIsOpen(true);
  }, []);

  const closeTutorial = useCallback(() => {
    setIsOpen(false);
  }, []);

  const notifyColorSelected = useCallback(() => {
    setColorSelected(true);
  }, []);

  const notifyCanvasDrawn = useCallback(() => {
    setCanvasDrawn(true);
  }, []);

  return {
    isOpen,
    openTutorial,
    closeTutorial,
    colorSelected,
    canvasDrawn,
    notifyColorSelected,
    notifyCanvasDrawn,
  };
}

// Quick Start Guide Component - Simpler alternative to full tutorial
export function QuickStartGuide({ 
  isOpen, 
  onClose 
}: { 
  isOpen: boolean;
  onClose: () => void;
}) {
  const steps = [
    { emoji: '🎨', title: 'Pick a Color', desc: 'Choose from the palette' },
    { emoji: '🖌️', title: 'Draw on Canvas', desc: 'Click and drag to paint' },
    { emoji: '👀', title: 'Check 3D Preview', desc: 'See your skin live!' },
    { emoji: '⬇️', title: 'Download', desc: 'Save your creation' },
  ];

  if (!isOpen) return null;

  return (
    <motion.div
      className="fixed bottom-4 right-4 z-40 bg-white rounded-2xl shadow-xl p-4 max-w-xs"
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 50, scale: 0.9 }}
    >
      <div className="flex justify-between items-start mb-3">
        <h4 className="font-bold text-gray-800">Quick Start 🚀</h4>
        <button 
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 text-xl leading-none"
        >
          ×
        </button>
      </div>
      <div className="space-y-2">
        {steps.map((s, i) => (
          <div key={i} className="flex items-center gap-3 text-sm">
            <span className="text-xl">{s.emoji}</span>
            <div>
              <p className="font-medium text-gray-700">{s.title}</p>
              <p className="text-gray-500 text-xs">{s.desc}</p>
            </div>
          </div>
        ))}
      </div>
      <button
        onClick={onClose}
        className="w-full mt-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-bold text-sm hover:shadow-lg transition-all"
      >
        Got it! ✨
      </button>
    </motion.div>
  );
}
