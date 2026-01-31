'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  getSkinOfTheDay,
  getTimeUntilNextSkin,
  getRandomFeaturedSkins,
  generateSkinPreviewFromPalette,
  FeaturedSkin,
  SKIN_CATEGORIES,
  DIFFICULTY_INFO,
} from '../data/featuredSkins';

// =============================================================================
// 🌟 SKIN OF THE DAY COMPONENT
// Featured skin rotation displayed prominently on the homepage
// =============================================================================

interface SkinOfTheDayProps {
  onUseSkin?: (skinData: string, skinName: string) => void;
  compact?: boolean;
}

export default function SkinOfTheDay({ onUseSkin, compact = false }: SkinOfTheDayProps) {
  const [skinOfTheDay, setSkinOfTheDay] = useState<FeaturedSkin | null>(null);
  const [skinPreview, setSkinPreview] = useState<string>('');
  const [countdown, setCountdown] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [suggestions, setSuggestions] = useState<FeaturedSkin[]>([]);
  const [suggestionPreviews, setSuggestionPreviews] = useState<Record<string, string>>({});
  const [showAllSuggestions, setShowAllSuggestions] = useState(false);

  // Initialize skin of the day
  useEffect(() => {
    const skin = getSkinOfTheDay();
    setSkinOfTheDay(skin);
    
    // Generate preview
    const preview = generateSkinPreviewFromPalette(skin);
    setSkinPreview(preview);
    
    // Get suggestions
    if (!compact) {
      const randomSkins = getRandomFeaturedSkins(skin.id, 4);
      setSuggestions(randomSkins);
      
      // Generate previews for suggestions
      const previews: Record<string, string> = {};
      randomSkins.forEach(s => {
        previews[s.id] = generateSkinPreviewFromPalette(s);
      });
      setSuggestionPreviews(previews);
    }
  }, [compact]);

  // Countdown timer
  useEffect(() => {
    const updateCountdown = () => {
      setCountdown(getTimeUntilNextSkin());
    };
    
    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  // Handle using the skin
  const handleUseSkin = useCallback(() => {
    if (skinOfTheDay && skinPreview && onUseSkin) {
      onUseSkin(skinPreview, skinOfTheDay.name);
    }
  }, [skinOfTheDay, skinPreview, onUseSkin]);

  // Handle using a suggestion
  const handleUseSuggestion = useCallback((skin: FeaturedSkin) => {
    if (onUseSkin && suggestionPreviews[skin.id]) {
      onUseSkin(suggestionPreviews[skin.id], skin.name);
    }
  }, [onUseSkin, suggestionPreviews]);

  // Get category info
  const categoryInfo = useMemo(() => {
    if (!skinOfTheDay) return null;
    return SKIN_CATEGORIES.find(c => c.id === skinOfTheDay.category);
  }, [skinOfTheDay]);

  // Get difficulty info
  const difficultyInfo = useMemo(() => {
    if (!skinOfTheDay) return null;
    return DIFFICULTY_INFO[skinOfTheDay.difficulty];
  }, [skinOfTheDay]);

  if (!skinOfTheDay) {
    return (
      <div className="animate-pulse bg-gradient-to-r from-purple-100 to-pink-100 rounded-3xl p-8">
        <div className="h-8 bg-purple-200 rounded w-48 mb-4" />
        <div className="h-32 bg-purple-200 rounded mb-4" />
        <div className="h-4 bg-purple-200 rounded w-3/4" />
      </div>
    );
  }

  // Compact version for sidebar/small spaces
  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-amber-50 via-orange-50 to-pink-50 rounded-2xl p-4 border-2 border-amber-200 shadow-lg"
      >
        <div className="flex items-center gap-3">
          {/* Mini Preview */}
          <div className="relative w-16 h-16 bg-white rounded-xl overflow-hidden border-2 border-amber-300 shadow-inner flex-shrink-0">
            {skinPreview && (
              <img
                src={skinPreview}
                alt={skinOfTheDay.name}
                className="w-full h-full object-contain"
                style={{ imageRendering: 'pixelated' }}
              />
            )}
            <div className="absolute -top-1 -right-1 bg-amber-400 text-white text-xs px-1.5 py-0.5 rounded-full font-bold shadow-sm">
              ✨
            </div>
          </div>
          
          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1 mb-0.5">
              <span className="text-amber-500 text-xs font-bold">⭐ SKIN OF THE DAY</span>
            </div>
            <h3 className="font-bold text-gray-800 truncate">{skinOfTheDay.name}</h3>
            <p className="text-xs text-gray-500 truncate">{skinOfTheDay.description}</p>
          </div>
        </div>
        
        {/* Action button */}
        <button
          onClick={handleUseSkin}
          className="w-full mt-3 py-2 bg-gradient-to-r from-amber-400 to-orange-400 text-white font-bold rounded-xl hover:from-amber-500 hover:to-orange-500 transition-all shadow-md hover:shadow-lg"
        >
          ✨ Use This Skin
        </button>
      </motion.div>
    );
  }

  // Full version
  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="relative overflow-hidden"
    >
      {/* Main Featured Card */}
      <div 
        className="relative bg-gradient-to-br from-amber-100 via-orange-50 to-pink-100 rounded-3xl p-6 md:p-8 border-2 border-amber-200 shadow-2xl"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-amber-200/30 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-pink-200/30 to-transparent rounded-full blur-2xl" />
        
        {/* Header */}
        <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <motion.div 
              className="inline-flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-amber-400 to-orange-400 text-white rounded-full font-bold text-sm shadow-lg mb-2"
              animate={{ scale: isHovered ? 1.05 : 1 }}
            >
              <motion.span
                animate={{ rotate: [0, 15, -15, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                ⭐
              </motion.span>
              SKIN OF THE DAY
              <motion.span
                animate={{ rotate: [0, -15, 15, 0] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
              >
                ⭐
              </motion.span>
            </motion.div>
            <h2 className="text-3xl md:text-4xl font-black text-gray-800">
              {skinOfTheDay.name}
            </h2>
            <p className="text-gray-600 mt-1">by <span className="font-semibold text-purple-600">{skinOfTheDay.author}</span></p>
          </div>
          
          {/* Countdown */}
          <div className="flex flex-col items-end">
            <span className="text-xs text-amber-600 font-medium mb-1">Next skin in:</span>
            <div className="flex gap-2">
              {[
                { value: countdown.hours, label: 'h' },
                { value: countdown.minutes, label: 'm' },
                { value: countdown.seconds, label: 's' },
              ].map((item, i) => (
                <div key={i} className="bg-white/80 backdrop-blur rounded-lg px-3 py-1.5 shadow-inner border border-amber-200">
                  <span className="text-lg font-mono font-bold text-amber-600">
                    {String(item.value).padStart(2, '0')}
                  </span>
                  <span className="text-xs text-amber-500">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="relative grid md:grid-cols-2 gap-6 md:gap-8">
          {/* Skin Preview */}
          <div className="flex flex-col items-center">
            <motion.div 
              className="relative w-48 h-48 md:w-64 md:h-64 bg-white rounded-3xl overflow-hidden border-4 border-amber-300 shadow-2xl"
              animate={{ 
                rotateY: isHovered ? [0, 5, -5, 0] : 0,
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {/* Glow effect */}
              {skinOfTheDay.hasGlow && (
                <div className="absolute inset-0 bg-gradient-to-br from-amber-200/50 to-pink-200/50 animate-pulse" />
              )}
              
              {skinPreview && (
                <img
                  src={skinPreview}
                  alt={skinOfTheDay.name}
                  className="w-full h-full object-contain p-4"
                  style={{ imageRendering: 'pixelated' }}
                />
              )}
              
              {/* Sparkle decorations */}
              <motion.div
                className="absolute top-4 right-4 text-2xl"
                animate={{ scale: [1, 1.3, 1], opacity: [1, 0.5, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                ✨
              </motion.div>
              <motion.div
                className="absolute bottom-4 left-4 text-xl"
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
              >
                💫
              </motion.div>
            </motion.div>
            
            {/* Tags */}
            <div className="flex flex-wrap gap-2 mt-4 justify-center">
              {skinOfTheDay.tags.map(tag => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-white/80 text-purple-600 rounded-full text-sm font-medium shadow-sm border border-purple-100"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>

          {/* Info & Actions */}
          <div className="flex flex-col justify-between">
            {/* Description */}
            <div>
              <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                {skinOfTheDay.description}
              </p>
              
              {/* Meta info */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-white/60 rounded-2xl p-4 border border-amber-100">
                  <span className="text-sm text-gray-500 block mb-1">Category</span>
                  <span className="font-bold text-gray-800 flex items-center gap-2">
                    <span className="text-xl">{categoryInfo?.emoji}</span>
                    {categoryInfo?.name}
                  </span>
                </div>
                <div className="bg-white/60 rounded-2xl p-4 border border-amber-100">
                  <span className="text-sm text-gray-500 block mb-1">Difficulty</span>
                  <span className={`font-bold flex items-center gap-2 ${difficultyInfo?.color}`}>
                    {difficultyInfo?.emoji}
                    <span className="text-gray-800">{difficultyInfo?.label}</span>
                  </span>
                </div>
              </div>
              
              {/* Special features */}
              {(skinOfTheDay.hasGlow || skinOfTheDay.hasPattern) && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {skinOfTheDay.hasGlow && (
                    <span className="px-3 py-1.5 bg-gradient-to-r from-yellow-100 to-amber-100 text-amber-700 rounded-full text-sm font-medium border border-amber-200">
                      ✨ Glow Effect
                    </span>
                  )}
                  {skinOfTheDay.hasPattern && (
                    <span className="px-3 py-1.5 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 rounded-full text-sm font-medium border border-purple-200">
                      🎨 {skinOfTheDay.hasPattern.charAt(0).toUpperCase() + skinOfTheDay.hasPattern.slice(1)} Pattern
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <motion.button
                onClick={handleUseSkin}
                className="flex-1 py-4 px-6 bg-gradient-to-r from-amber-400 via-orange-400 to-pink-400 text-white font-bold text-lg rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="text-xl">🎨</span>
                Use This Skin
              </motion.button>
              <Link
                href="/games/skin-creator/gallery"
                className="flex-1 py-4 px-6 bg-white/80 hover:bg-white text-gray-700 font-bold text-lg rounded-2xl border-2 border-amber-200 hover:border-amber-300 transition-all flex items-center justify-center gap-2"
              >
                <span className="text-xl">🖼️</span>
                View Gallery
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Suggestions Section */}
      {suggestions.length > 0 && (
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <span>💡</span> You might also like
            </h3>
            <button
              onClick={() => setShowAllSuggestions(!showAllSuggestions)}
              className="text-purple-600 hover:text-purple-700 font-medium text-sm flex items-center gap-1 transition-colors"
            >
              {showAllSuggestions ? 'Show less' : 'Show more'}
              <motion.span
                animate={{ rotate: showAllSuggestions ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                ↓
              </motion.span>
            </button>
          </div>
          
          <AnimatePresence>
            <motion.div 
              className="grid grid-cols-2 md:grid-cols-4 gap-4"
              layout
            >
              {(showAllSuggestions ? suggestions : suggestions.slice(0, 4)).map((skin, index) => {
                const catInfo = SKIN_CATEGORIES.find(c => c.id === skin.category);
                return (
                  <motion.div
                    key={skin.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.1 }}
                    className="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all overflow-hidden border-2 border-transparent hover:border-purple-200"
                  >
                    {/* Preview */}
                    <div className="relative aspect-square bg-gradient-to-br from-gray-50 to-gray-100 p-3">
                      {suggestionPreviews[skin.id] && (
                        <img
                          src={suggestionPreviews[skin.id]}
                          alt={skin.name}
                          className="w-full h-full object-contain transition-transform group-hover:scale-110"
                          style={{ imageRendering: 'pixelated' }}
                        />
                      )}
                      
                      {/* Category badge */}
                      <span className="absolute top-2 right-2 bg-white/90 rounded-full w-8 h-8 flex items-center justify-center shadow-sm text-lg">
                        {catInfo?.emoji}
                      </span>
                      
                      {/* Hover overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-purple-600/80 to-transparent opacity-0 group-hover:opacity-100 transition-all flex items-end justify-center pb-4">
                        <button
                          onClick={() => handleUseSuggestion(skin)}
                          className="px-4 py-2 bg-white text-purple-600 font-bold rounded-xl shadow-lg hover:scale-105 transition-transform"
                        >
                          ✨ Use
                        </button>
                      </div>
                    </div>
                    
                    {/* Info */}
                    <div className="p-3">
                      <h4 className="font-bold text-gray-800 truncate">{skin.name}</h4>
                      <p className="text-xs text-gray-500 truncate">{skin.description}</p>
                      <div className="flex gap-1 mt-2 flex-wrap">
                        {skin.tags.slice(0, 2).map(tag => (
                          <span
                            key={tag}
                            className="px-2 py-0.5 bg-purple-50 text-purple-500 rounded-full text-xs"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </AnimatePresence>
        </div>
      )}
    </motion.section>
  );
}

// =============================================================================
// MINI VERSION FOR INLINE USE
// =============================================================================

export function SkinOfTheDayMini({ onUseSkin }: { onUseSkin?: (skinData: string, skinName: string) => void }) {
  return <SkinOfTheDay onUseSkin={onUseSkin} compact />;
}

// =============================================================================
// BANNER VERSION FOR TOP OF PAGE
// =============================================================================

interface SkinOfTheDayBannerProps {
  onUseSkin?: (skinData: string, skinName: string) => void;
  onDismiss?: () => void;
}

export function SkinOfTheDayBanner({ onUseSkin, onDismiss }: SkinOfTheDayBannerProps) {
  const [skinOfTheDay, setSkinOfTheDay] = useState<FeaturedSkin | null>(null);
  const [skinPreview, setSkinPreview] = useState<string>('');
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Check if already dismissed today
    const dismissedDate = localStorage.getItem('skin-of-day-banner-dismissed');
    if (dismissedDate) {
      const today = new Date().toDateString();
      if (dismissedDate === today) {
        setIsDismissed(true);
        return;
      }
    }
    
    const skin = getSkinOfTheDay();
    setSkinOfTheDay(skin);
    setSkinPreview(generateSkinPreviewFromPalette(skin));
  }, []);

  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem('skin-of-day-banner-dismissed', new Date().toDateString());
    onDismiss?.();
  };

  const handleUseSkin = () => {
    if (skinOfTheDay && skinPreview && onUseSkin) {
      onUseSkin(skinPreview, skinOfTheDay.name);
      handleDismiss();
    }
  };

  if (isDismissed || !skinOfTheDay) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -100, opacity: 0 }}
        className="relative bg-gradient-to-r from-amber-400 via-orange-400 to-pink-400 shadow-lg overflow-hidden"
      >
        {/* Decorative pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-1/4 w-32 h-32 bg-white rounded-full blur-2xl" />
          <div className="absolute bottom-0 right-1/4 w-24 h-24 bg-white rounded-full blur-xl" />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            {/* Content */}
            <div className="flex items-center gap-4 flex-1">
              {/* Mini preview */}
              <div className="hidden sm:block w-12 h-12 bg-white/20 rounded-xl overflow-hidden border-2 border-white/40 flex-shrink-0">
                {skinPreview && (
                  <img
                    src={skinPreview}
                    alt={skinOfTheDay.name}
                    className="w-full h-full object-contain"
                    style={{ imageRendering: 'pixelated' }}
                  />
                )}
              </div>
              
              {/* Text */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="bg-white/20 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    ⭐ SKIN OF THE DAY
                  </span>
                  <span className="text-white font-bold truncate">{skinOfTheDay.name}</span>
                  <span className="hidden md:inline text-white/80 text-sm truncate">
                    — {skinOfTheDay.description}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleUseSkin}
                className="px-4 py-1.5 bg-white text-orange-500 font-bold rounded-full hover:bg-orange-50 transition-colors shadow-md text-sm"
              >
                ✨ Try Now
              </button>
              <button
                onClick={handleDismiss}
                className="p-1.5 text-white/80 hover:text-white hover:bg-white/20 rounded-full transition-colors"
                aria-label="Dismiss"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
