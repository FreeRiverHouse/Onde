'use client';

import { isAIAvailable } from '../../lib/aiSkinGenerator';
import type { AIStyle, AIHistoryItem } from './types';

interface AIPanelProps {
  show: boolean;
  onClose: () => void;
  aiPrompt: string;
  setAiPrompt: (prompt: string) => void;
  aiStyle: AIStyle;
  setAiStyle: (style: AIStyle) => void;
  aiLoading: boolean;
  aiError: string | null;
  setAiError: (error: string | null) => void;
  useRealAI: boolean;
  setUseRealAI: (v: boolean) => void;
  enhancing: boolean;
  enhancePrompt: () => void;
  generateAISkin: () => void;
  localLLMAvailable: boolean;
  // History
  aiHistory: AIHistoryItem[];
  showAIHistory: boolean;
  setShowAIHistory: (v: boolean) => void;
  loadFromHistory: (item: AIHistoryItem) => void;
  regenerateFromHistory: (item: AIHistoryItem) => void;
  toggleFavorite: (id: string) => void;
  deleteFromHistory: (id: string) => void;
}

export default function AIPanel({
  show, onClose, aiPrompt, setAiPrompt, aiStyle, setAiStyle,
  aiLoading, aiError, setAiError, useRealAI, setUseRealAI,
  enhancing, enhancePrompt, generateAISkin,
  localLLMAvailable,
  aiHistory, showAIHistory, setShowAIHistory,
  loadFromHistory, regenerateFromHistory, toggleFavorite, deleteFromHistory,
}: AIPanelProps) {
  if (!show) return null;

  const promptCategories = [
    {
      id: 'heroes', emoji: '🦸', name: 'Heroes',
      color: 'bg-red-100 text-red-700 hover:bg-red-200',
      prompts: [
        { emoji: '🦸', text: 'superhero with cape', label: 'Superhero' },
        { emoji: '⚔️', text: 'brave knight in shining armor', label: 'Knight' },
        { emoji: '🥷', text: 'cool ninja with black outfit', label: 'Ninja' },
        { emoji: '🏴‍☠️', text: 'adventure pirate with bandana', label: 'Pirate' },
        { emoji: '🧙', text: 'powerful wizard with magic staff', label: 'Wizard' },
      ]
    },
    {
      id: 'animals', emoji: '🐾', name: 'Animals',
      color: 'bg-green-100 text-green-700 hover:bg-green-200',
      prompts: [
        { emoji: '🐺', text: 'wolf warrior with fur', label: 'Wolf' },
        { emoji: '🐱', text: 'cute cat person with whiskers', label: 'Cat' },
        { emoji: '🦊', text: 'clever fox with orange fur', label: 'Fox' },
        { emoji: '🐼', text: 'friendly panda bear', label: 'Panda' },
        { emoji: '🦁', text: 'brave lion with mane', label: 'Lion' },
      ]
    },
    {
      id: 'fantasy', emoji: '✨', name: 'Fantasy',
      color: 'bg-purple-100 text-purple-700 hover:bg-purple-200',
      prompts: [
        { emoji: '🧚', text: 'magical fairy with wings', label: 'Fairy' },
        { emoji: '🐉', text: 'dragon person with scales', label: 'Dragon' },
        { emoji: '🧜', text: 'mermaid with shiny tail', label: 'Mermaid' },
        { emoji: '🦄', text: 'unicorn with rainbow mane', label: 'Unicorn' },
        { emoji: '🧝', text: 'elf with pointy ears', label: 'Elf' },
      ]
    },
    {
      id: 'space', emoji: '🚀', name: 'Space',
      color: 'bg-blue-100 text-blue-700 hover:bg-blue-200',
      prompts: [
        { emoji: '🤖', text: 'friendly robot with glowing eyes', label: 'Robot' },
        { emoji: '👽', text: 'cool alien from outer space', label: 'Alien' },
        { emoji: '👨‍🚀', text: 'astronaut in space suit', label: 'Astronaut' },
        { emoji: '🌟', text: 'star guardian with cosmic powers', label: 'Star' },
        { emoji: '🛸', text: 'space explorer with laser gun', label: 'Explorer' },
      ]
    },
    {
      id: 'jobs', emoji: '👷', name: 'Jobs',
      color: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200',
      prompts: [
        { emoji: '👨‍🍳', text: 'chef with white hat and apron', label: 'Chef' },
        { emoji: '👨‍🚒', text: 'firefighter with helmet', label: 'Firefighter' },
        { emoji: '👮', text: 'police officer in uniform', label: 'Police' },
        { emoji: '👨‍⚕️', text: 'doctor with stethoscope', label: 'Doctor' },
        { emoji: '🧑‍🔬', text: 'scientist with lab coat', label: 'Scientist' },
      ]
    },
    {
      id: 'spooky', emoji: '👻', name: 'Spooky',
      color: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
      prompts: [
        { emoji: '🧟', text: 'zombie with torn clothes', label: 'Zombie' },
        { emoji: '🧛', text: 'vampire with cape and fangs', label: 'Vampire' },
        { emoji: '👻', text: 'friendly ghost with spooky glow', label: 'Ghost' },
        { emoji: '🎃', text: 'pumpkin head monster', label: 'Pumpkin' },
        { emoji: '💀', text: 'skeleton warrior', label: 'Skeleton' },
      ]
    },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-2xl p-6 max-w-md m-4 shadow-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <h3 className="text-xl font-bold mb-2">🤖 AI Skin Generator</h3>
        <p className="text-sm text-gray-600 mb-4">Describe your character and AI will create a skin!</p>

        {/* Prompt Input */}
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            placeholder="e.g., pirate with red bandana, wizard with purple robe..."
            className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 outline-none"
            onKeyDown={(e) => e.key === 'Enter' && generateAISkin()}
          />
          <button
            onClick={enhancePrompt}
            disabled={enhancing || !aiPrompt.trim()}
            className="px-3 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-xl font-bold hover:scale-105 transition-all disabled:opacity-50 disabled:hover:scale-100"
            title="Enhance with AI (local LLM)"
          >
            {enhancing ? '⏳' : '✨'}
          </button>
        </div>

        {/* Prompt Library */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">🎭 Pick an Idea!</label>
          <div className="space-y-2">
            {promptCategories.map(category => (
              <details key={category.id} className="group">
                <summary className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer ${category.color} font-medium`}>
                  <span className="text-lg">{category.emoji}</span>
                  <span>{category.name}</span>
                  <span className="ml-auto text-xs opacity-60">{category.prompts.length}</span>
                </summary>
                <div className="flex flex-wrap gap-1 mt-2 pl-2">
                  {category.prompts.map(prompt => (
                    <button
                      key={prompt.label}
                      onClick={() => setAiPrompt(prompt.text)}
                      className={`px-2 py-1 rounded-lg text-xs transition-all flex items-center gap-1 ${
                        aiPrompt === prompt.text
                          ? 'bg-purple-500 text-white scale-105'
                          : 'bg-white border border-gray-200 hover:border-purple-300 hover:bg-purple-50'
                      }`}
                    >
                      <span>{prompt.emoji}</span>
                      <span>{prompt.label}</span>
                    </button>
                  ))}
                </div>
              </details>
            ))}
          </div>
        </div>

        {/* Style Selection */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">🎨 Art Style</label>
          <div className="grid grid-cols-5 gap-2">
            {[
              { id: 'blocky', emoji: '🧱', name: 'Blocky' },
              { id: 'pixel-art', emoji: '👾', name: 'Pixel' },
              { id: 'cartoon', emoji: '🎨', name: 'Cartoon' },
              { id: 'anime', emoji: '✨', name: 'Anime' },
              { id: 'realistic', emoji: '📷', name: 'Real' },
            ].map(style => (
              <button
                key={style.id}
                onClick={() => setAiStyle(style.id as AIStyle)}
                className={`p-2 rounded-lg text-center transition-all ${
                  aiStyle === style.id
                    ? 'bg-purple-500 text-white ring-2 ring-purple-300'
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
                title={style.name}
              >
                <div className="text-xl">{style.emoji}</div>
                <div className="text-xs mt-1">{style.name}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Real AI Toggle */}
        <div className="mb-4 p-3 bg-gray-50 rounded-xl">
          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <span className="font-medium text-gray-700">🧠 Use Real AI (DALL-E 3)</span>
              <p className="text-xs text-gray-500 mt-1">
                {isAIAvailable()
                  ? 'API key configured ✓'
                  : 'Requires NEXT_PUBLIC_OPENAI_API_KEY'}
              </p>
            </div>
            <div className="relative">
              <input
                type="checkbox"
                checked={useRealAI}
                onChange={(e) => setUseRealAI(e.target.checked)}
                disabled={!isAIAvailable()}
                className="sr-only"
              />
              <div className={`w-11 h-6 rounded-full transition-colors ${
                useRealAI && isAIAvailable() ? 'bg-purple-500' : 'bg-gray-300'
              } ${!isAIAvailable() ? 'opacity-50' : ''}`}>
                <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                  useRealAI ? 'translate-x-5' : ''
                }`} />
              </div>
            </div>
          </label>
        </div>

        {/* Error Display */}
        {aiError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
            <strong>⚠️ Error:</strong> {aiError}
            <button onClick={() => setAiError(null)} className="ml-2 text-red-500 hover:text-red-700">✕</button>
          </div>
        )}

        {/* Generate Button */}
        <button
          onClick={generateAISkin}
          disabled={aiLoading || !aiPrompt.trim()}
          className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-bold disabled:opacity-50 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          {aiLoading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="animate-spin">🔄</span>
              {useRealAI ? 'AI is thinking...' : 'Generating...'}
            </span>
          ) : (
            '✨ Generate Skin'
          )}
        </button>

        {/* AI History & Favorites */}
        {aiHistory.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <button
              onClick={() => setShowAIHistory(!showAIHistory)}
              className="flex items-center justify-between w-full text-left"
            >
              <span className="font-medium text-gray-700">
                📚 History & Favorites ({aiHistory.length})
              </span>
              <span className="text-gray-400">{showAIHistory ? '▲' : '▼'}</span>
            </button>

            {showAIHistory && (
              <div className="mt-3 space-y-2 max-h-60 overflow-y-auto">
                {/* Favorites first */}
                {aiHistory.filter(item => item.isFavorite).length > 0 && (
                  <div className="mb-2">
                    <p className="text-xs text-yellow-600 font-semibold mb-1">⭐ Favorites</p>
                    {aiHistory.filter(item => item.isFavorite).map(item => (
                      <div
                        key={item.id}
                        className="flex items-center gap-2 p-2 bg-yellow-50 rounded-lg border border-yellow-200"
                      >
                        <img
                          src={item.skinDataUrl}
                          alt={item.prompt}
                          className="w-12 h-12 rounded border bg-gray-100"
                          style={{ imageRendering: 'pixelated' }}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{item.prompt}</p>
                          <p className="text-xs text-gray-500">{item.style}</p>
                        </div>
                        <div className="flex gap-1">
                          <button onClick={() => loadFromHistory(item)} className="p-1 text-xs bg-green-100 text-green-600 rounded hover:bg-green-200" title="Load this skin">✓</button>
                          <button onClick={() => regenerateFromHistory(item)} className="p-1 text-xs bg-purple-100 text-purple-600 rounded hover:bg-purple-200" title="Use this prompt">🔄</button>
                          <button onClick={() => toggleFavorite(item.id)} className="p-1 text-xs bg-yellow-100 text-yellow-600 rounded hover:bg-yellow-200" title="Remove from favorites">⭐</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Recent history */}
                <p className="text-xs text-gray-500 font-semibold mb-1">🕐 Recent</p>
                {aiHistory.filter(item => !item.isFavorite).map(item => (
                  <div
                    key={item.id}
                    className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg hover:bg-gray-100"
                  >
                    <img
                      src={item.skinDataUrl}
                      alt={item.prompt}
                      className="w-12 h-12 rounded border bg-white"
                      style={{ imageRendering: 'pixelated' }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.prompt}</p>
                      <p className="text-xs text-gray-400">
                        {item.style} • {new Date(item.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => loadFromHistory(item)} className="p-1 text-xs bg-green-100 text-green-600 rounded hover:bg-green-200" title="Load this skin">✓</button>
                      <button onClick={() => regenerateFromHistory(item)} className="p-1 text-xs bg-purple-100 text-purple-600 rounded hover:bg-purple-200" title="Use this prompt">🔄</button>
                      <button onClick={() => toggleFavorite(item.id)} className="p-1 text-xs bg-gray-100 text-gray-600 rounded hover:bg-gray-200" title="Add to favorites">☆</button>
                      <button onClick={() => deleteFromHistory(item.id)} className="p-1 text-xs bg-red-100 text-red-600 rounded hover:bg-red-200" title="Delete">✕</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Info text */}
        <p className="text-xs text-gray-400 mt-3 text-center">
          {useRealAI
            ? 'Real AI generates unique skins from your description'
            : 'Quick mode uses smart color matching based on keywords'}
        </p>
      </div>
    </div>
  );
}
