import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TailWaggingProps {
  isHappy: boolean;
  isIdle: boolean;  // true when Luna idle for 3+ seconds
  onWagComplete?: () => void;
}

/**
 * Cute tail wagging animation for Luna!
 * Generated with help from local Radeon LLM (qwen2.5-coder:7b)
 * Task T876 - Moonlight Magic House Evolution
 */
export default function TailWagging({ isHappy, isIdle, onWagComplete }: TailWaggingProps) {
  const [isWagging, setIsWagging] = useState(false);
  const [wagCount, setWagCount] = useState(0);
  
  const MAX_WAGS = 4; // 3-4 wags then stop
  
  // Trigger wag when conditions met
  useEffect(() => {
    if ((isHappy || isIdle) && !isWagging && wagCount === 0) {
      setIsWagging(true);
    }
  }, [isHappy, isIdle, isWagging, wagCount]);
  
  // Count wags and stop after MAX_WAGS
  const handleWagCycle = () => {
    setWagCount(prev => {
      const next = prev + 1;
      if (next >= MAX_WAGS) {
        setIsWagging(false);
        onWagComplete?.();
        // Reset after a delay so it can wag again
        setTimeout(() => setWagCount(0), 3000);
        return 0;
      }
      return next;
    });
  };
  
  const tailVariants = {
    idle: {
      rotate: 0,
      scale: 1,
    },
    wagging: {
      rotate: [-20, 25, -20],
      scale: [1, 1.05, 1],
      transition: {
        duration: 0.3,
        ease: "easeInOut" as const,
        repeat: 0,
      },
    },
  };

  return (
    <AnimatePresence>
      {isWagging && (
        <motion.div
          className="tail-wag-container"
          style={{
            position: 'absolute',
            bottom: '-5%',
            left: '50%',
            transformOrigin: 'top center',
            zIndex: 10,
            pointerEvents: 'none',
          }}
        >
          <motion.div
            className="luna-tail"
            variants={tailVariants}
            initial="idle"
            animate="wagging"
            onAnimationComplete={handleWagCycle}
            style={{
              fontSize: '1.5rem',
              filter: 'drop-shadow(0 0 4px rgba(255, 200, 100, 0.6))',
            }}
          >
            🐾
          </motion.div>
          
          {/* Sparkles during wag */}
          {wagCount > 0 && (
            <motion.span
              initial={{ opacity: 1, scale: 0.5, y: 0 }}
              animate={{ opacity: 0, scale: 1.2, y: -20 }}
              transition={{ duration: 0.4 }}
              style={{
                position: 'absolute',
                fontSize: '0.8rem',
              }}
            >
              ✨
            </motion.span>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
