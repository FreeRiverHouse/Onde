'use client';

import dynamic from 'next/dynamic';
import Script from 'next/script';
import type { GameType, GameConfig, LayerType } from './components/types';
import {
  useSkinCreator,
  GAME_CONFIGS,
  TEMPLATES,
  COLORS,
  SKIN_TAGS,
  POSES,
  TINT_PRESETS,
  ACHIEVEMENTS_DEF,
} from './components/useSkinCreator';
import {
  KeyboardShortcutsModal,
  AchievementPopup,
  AchievementGallery,
  Toolbar,
  ColorPanel,
  LayerPanel,
  ExportPanel,
  MobileDrawer,
  WelcomeTutorial,
  URLImportModal,
  AIPanel,
  MobileToolbar,
  MobileColorPicker,
  Mobile3DPreview,
  TemplateSelector,
  CanvasEditor,
} from './components';

// Lazy load heavy components
const SkinPreview3D = dynamic(() => import('../components/SkinPreview3D'), { ssr: false });
const Confetti = dynamic(() => import('react-confetti'), { ssr: false });
const SkinGallery = dynamic(() => import('../components/SkinGallery'), { ssr: false });

// SEO structured data
const structuredData = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Skin Creator - Minecraft Skin Creator",
  "applicationCategory": "GameApplication",
  "operatingSystem": "Web Browser",
  "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
  "description": "Free online Minecraft skin creator with AI-powered tools, 3D preview, and layer system. Works with Java & Bedrock editions.",
  "screenshot": "https://onde.la/images/og-skin-creator.png",
  "url": "https://onde.la/games/skin-creator/",
  "author": { "@type": "Organization", "name": "Onde", "url": "https://onde.la" },
  "aggregateRating": { "@type": "AggregateRating", "ratingValue": "4.8", "ratingCount": "1250", "bestRating": "5", "worstRating": "1" },
};

export default function SkinCreator() {
  const s = useSkinCreator();

  return (
    <div className={`min-h-screen p-3 md:p-6 flex flex-col items-center transition-all duration-700 ${
      s.darkMode
        ? 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900'
        : 'bg-gradient-to-br from-violet-500 via-fuchsia-500 to-cyan-500'
    }`} style={{ backgroundSize: '400% 400%', animation: 'gradient 15s ease infinite' }}>
      <Script id="structured-data" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <style jsx global>{`@keyframes gradient { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }`}</style>

      {/* Confetti */}
      {s.showConfetti && <Confetti width={s.windowSize.width} height={s.windowSize.height} recycle={false} numberOfPieces={500} gravity={0.3} />}

      {/* Modals */}
      <KeyboardShortcutsModal show={s.showShortcuts} onClose={() => s.setShowShortcuts(false)} />
      <AchievementPopup achievement={s.showAchievement} />
      <AchievementGallery show={s.showAchievementGallery} onClose={() => s.setShowAchievementGallery(false)} achievements={s.achievements} achievementDefs={ACHIEVEMENTS_DEF} />
      <WelcomeTutorial show={s.showTutorial} onClose={() => s.setShowTutorial(false)} tutorialStep={s.tutorialStep} setTutorialStep={s.setTutorialStep} />
      <URLImportModal show={s.showURLImport} onClose={() => s.setShowURLImport(false)} importURL={s.importURL} setImportURL={s.setImportURL} importLoading={s.importLoading} importError={s.importError} importFromURL={s.importFromURL} />
      <ExportPanel show={s.showExportPanel} onClose={() => s.setShowExportPanel(false)} layers={s.layers} exportLayers={s.exportLayers} setExportLayers={s.setExportLayers} downloadSkin={s.downloadSkin} downloadBaseOnly={s.downloadBaseOnly} downloadForRoblox={s.downloadForRoblox} />
      <MobileDrawer show={s.showMobileMenu} onClose={() => s.setShowMobileMenu(false)} viewMode={s.viewMode} setViewMode={s.setViewMode} setShowAIPanel={s.setShowAIPanel} showLayerPanel={s.showLayerPanel} setShowLayerPanel={s.setShowLayerPanel} setShowURLImport={s.setShowURLImport} setShowShortcuts={s.setShowShortcuts} darkMode={s.darkMode} setDarkMode={s.setDarkMode} setShowTutorial={s.setShowTutorial} />
      <AIPanel show={s.showAIPanel} onClose={() => s.setShowAIPanel(false)} aiPrompt={s.aiPrompt} setAiPrompt={s.setAiPrompt} aiStyle={s.aiStyle} setAiStyle={s.setAiStyle} aiLoading={s.aiLoading} aiError={s.aiError} setAiError={s.setAiError} useRealAI={s.useRealAI} setUseRealAI={s.setUseRealAI} enhancing={s.enhancing} enhancePrompt={s.enhancePrompt} generateAISkin={s.generateAISkin} localLLMAvailable={s.localLLMAvailable} aiHistory={s.aiHistory} showAIHistory={s.showAIHistory} setShowAIHistory={s.setShowAIHistory} loadFromHistory={s.loadFromHistory} regenerateFromHistory={s.regenerateFromHistory} toggleFavorite={s.toggleFavorite} deleteFromHistory={s.deleteFromHistory} />
      <LayerPanel show={s.showLayerPanel} onClose={() => s.setShowLayerPanel(false)} layers={s.layers} activeLayer={s.activeLayer} setActiveLayer={s.setActiveLayer} toggleLayerVisibility={s.toggleLayerVisibility} setLayerOpacity={s.setLayerOpacity} moveLayer={s.moveLayer} setLayerTint={s.setLayerTint} setLayerTintIntensity={s.setLayerTintIntensity} setLayers={s.setLayers} clearLayer={s.clearLayer} showDuplicateMenu={s.showDuplicateMenu} setShowDuplicateMenu={s.setShowDuplicateMenu} copyLayerTo={s.copyLayerTo} flattenLayers={s.flattenLayers} compositeLayersToMain={s.compositeLayersToMain} updatePreview={s.updatePreview} playSound={s.playSound} tintPresets={TINT_PRESETS} customTintColors={s.customTintColors} setCustomTintColors={s.setCustomTintColors} />
      <Mobile3DPreview show={s.showMobile3DPreview} onClose={() => s.setShowMobile3DPreview(false)} skinCanvas={s.canvasRef.current} skinVersion={s.skinVersion} selectedPose={s.selectedPose} setSelectedPose={s.setSelectedPose} poses={POSES} />

      {/* Milestone popup */}
      {s.showMilestone && (
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

      {/* Sparkle particles */}
      {s.particles.map(p => (
        <div key={p.id} className="fixed pointer-events-none animate-ping" style={{ left: p.x - 8, top: p.y - 8, width: 16, height: 16, backgroundColor: p.color, borderRadius: '50%', boxShadow: `0 0 10px ${p.color}, 0 0 20px ${p.color}`, zIndex: 9999 }} />
      ))}

      {/* Header */}
      <div className="text-center mb-4 md:mb-6 relative">
        <button onClick={() => s.setShowMobileMenu(!s.showMobileMenu)} className="md:hidden absolute left-0 top-0 p-3 min-w-[44px] min-h-[44px] bg-white/20 rounded-xl hover:bg-white/30 transition-all flex items-center justify-center" aria-label="Menu">
          <span className="text-2xl">{s.showMobileMenu ? '✕' : '☰'}</span>
        </button>
        <div className="hidden md:flex items-center justify-center gap-2 mb-1">
          <span className="text-sm font-semibold text-white/80 bg-white/20 px-2 py-0.5 rounded-full">🌙 Moonlight</span>
        </div>
        <h1 className="text-2xl md:text-6xl font-black text-white drop-shadow-2xl">🎨 Skin Creator</h1>
        <p className="text-sm md:text-lg text-white/90 mt-1">
          <span className="md:hidden">Minecraft & Roblox Skins ✨</span>
          <span className="hidden md:inline">
            AI Skin Creator for Minecraft & Roblox ✨
            <button onClick={() => s.setShowShortcuts(true)} className="ml-3 px-2 py-1 text-sm bg-white/20 hover:bg-white/30 rounded-full transition-all" title="Keyboard shortcuts (?)">⌨️ Help</button>
            <button onClick={() => s.setShowAchievementGallery(true)} className="ml-2 px-2 py-1 text-sm bg-yellow-500/30 hover:bg-yellow-500/50 rounded-full transition-all" title="View achievements">🏆 {Object.values(s.achievements).filter(Boolean).length}/{Object.keys(ACHIEVEMENTS_DEF).length}</button>
            <button onClick={() => s.setSoundMuted(!s.soundMuted)} className={`ml-2 px-2 py-1 text-sm rounded-full transition-all ${s.soundMuted ? 'bg-red-500/50 hover:bg-red-500/70' : 'bg-green-500/30 hover:bg-green-500/50'}`} title={s.soundMuted ? 'Unmute sounds' : 'Mute sounds'}>{s.soundMuted ? '🔇' : '🔊'}</button>
          </span>
        </p>

        {/* Daily Challenge */}
        <div className="hidden md:flex mt-3 bg-gradient-to-r from-orange-400 to-pink-500 rounded-xl px-4 py-2 text-white text-sm items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">📅</span>
            <span className="font-bold">Daily Challenge:</span>
            <span>{s.todayChallenge.theme}</span>
            <span className="opacity-80 text-xs hidden sm:inline">• {s.todayChallenge.hint}</span>
          </div>
          <span className="text-xs opacity-75">#SkinStudioChallenge</span>
        </div>

        {/* Game Selector */}
        <div className="flex gap-2 mt-3">
          {(Object.entries(GAME_CONFIGS) as [GameType, GameConfig][]).map(([key, config]) => (
            <button key={key} onClick={() => s.setSelectedGame(key)} className={`px-4 py-2 rounded-full font-bold transition-all ${s.selectedGame === key ? 'bg-white text-purple-600 scale-105 shadow-lg' : 'bg-white/20 text-white hover:bg-white/30'}`}>
              {config.emoji} {config.name}
            </button>
          ))}
        </div>

        {/* Model Selector */}
        {s.selectedGame === 'minecraft' && (
          <div className="flex gap-2 mt-2">
            <button onClick={() => s.setSkinModel('steve')} className={`px-3 py-2 min-h-[44px] rounded-full text-sm font-bold transition-all ${s.skinModel === 'steve' ? 'bg-blue-500 text-white shadow-lg' : 'bg-white/20 text-white hover:bg-white/30'}`} title="Steve model - 4px arms">👦 Steve</button>
            <button onClick={() => s.setSkinModel('alex')} className={`px-3 py-2 min-h-[44px] rounded-full text-sm font-bold transition-all ${s.skinModel === 'alex' ? 'bg-pink-500 text-white shadow-lg' : 'bg-white/20 text-white hover:bg-white/30'}`} title="Alex model - 3px slim arms">👧 Alex (slim)</button>
          </div>
        )}

        {/* View Mode Tabs */}
        <div className="flex gap-2 mt-4">
          <button onClick={() => s.setViewMode('editor')} className={`px-6 py-2 rounded-full font-bold transition-all ${s.viewMode === 'editor' ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white scale-105 shadow-lg' : 'bg-white/20 text-white hover:bg-white/30'}`}>🎨 Editor</button>
          <button onClick={() => s.setViewMode('gallery')} className={`px-6 py-2 rounded-full font-bold transition-all ${s.viewMode === 'gallery' ? 'bg-gradient-to-r from-green-500 to-teal-500 text-white scale-105 shadow-lg' : 'bg-white/20 text-white hover:bg-white/30'}`}>🖼️ Gallery</button>
        </div>
      </div>

      {/* Gallery View */}
      {s.viewMode === 'gallery' && (
        <div className="w-full max-w-6xl px-2 mt-4">
          <div className="mb-6 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-2xl p-4">
            <h3 className="text-lg font-bold flex items-center gap-2 mb-3">🏆 Top Creators This Week</h3>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {[{ rank: '🥇', name: 'PixelMaster', skins: 47 }, { rank: '🥈', name: 'SkinWizard', skins: 38 }, { rank: '🥉', name: 'BlockArtist', skins: 31 }, { rank: '4', name: 'CraftQueen', skins: 28 }, { rank: '5', name: 'You?', skins: '🚀' }].map((user, i) => (
                <div key={i} className="bg-white/80 rounded-xl p-2 text-center">
                  <div className="text-2xl">{user.rank}</div>
                  <div className="font-bold text-sm truncate">{user.name}</div>
                  <div className="text-xs text-gray-500">{user.skins} skins</div>
                </div>
              ))}
            </div>
          </div>
          <SkinGallery
            onSelectSkin={(imageData: string) => {
              const img = new Image();
              img.onload = () => {
                const tempCanvas = document.createElement('canvas');
                tempCanvas.width = 64; tempCanvas.height = 64;
                const tempCtx = tempCanvas.getContext('2d');
                if (tempCtx) {
                  tempCtx.drawImage(img, 0, 0, 64, 64);
                  s.setViewMode('editor');
                }
              };
              img.src = imageData;
            }}
            currentSkinData={s.canvasRef.current?.toDataURL('image/png')}
          />
        </div>
      )}

      {/* Editor View */}
      <div className={`flex flex-col lg:flex-row gap-2 md:gap-4 w-full max-w-6xl px-2 ${s.viewMode !== 'editor' ? 'hidden' : ''}`}>
        {/* Left Panel - Preview */}
        <div className="hidden md:block glass-card rounded-3xl p-6 shadow-2xl hover:shadow-3xl transition-shadow duration-300">
          <div className="flex items-center justify-center gap-2 mb-4">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2"><span className="animate-bounce-soft">👀</span> Preview</h2>
            <button onClick={() => s.setShow3D(!s.show3D)} className={`px-2 py-1 rounded-lg text-xs font-bold transition-all ${s.show3D ? 'bg-purple-500 text-white' : 'bg-gray-200 hover:bg-gray-300'}`} title="Toggle 3D view">
              {s.show3D ? '🎮 3D' : '📐 2D'}
            </button>
          </div>

          {/* Pose Selector */}
          {s.show3D && (
            <div className="flex flex-wrap justify-center gap-1 mb-2">
              {POSES.map(pose => (
                <button key={pose.id} onClick={() => s.setSelectedPose(pose.id)} className={`px-2 py-1 rounded-lg text-xs transition-all ${s.selectedPose === pose.id ? 'bg-purple-500 text-white' : 'bg-gray-100 hover:bg-gray-200'}`} title={pose.desc}>
                  {pose.name}
                </button>
              ))}
            </div>
          )}

          {s.show3D ? (
            <div className="rounded-xl mx-auto overflow-hidden" style={{ width: 200, height: 280 }}>
              <SkinPreview3D skinCanvas={s.canvasRef.current} textureVersion={s.skinVersion} />
            </div>
          ) : (
            <canvas ref={s.previewRef} width={200} height={280} className="rounded-xl mx-auto" style={{ imageRendering: 'pixelated' }} />
          )}

          {/* Templates */}
          <TemplateSelector
            templates={TEMPLATES}
            loadTemplate={s.loadTemplate}
            generateRandomSkin={s.generateRandomSkin}
            isWiggling={s.isWiggling}
            setIsWiggling={s.setIsWiggling}
            activeLayer={s.activeLayer}
            layerCanvasRefs={s.layerCanvasRefs}
            compositeLayersToMain={s.compositeLayersToMain}
            updatePreview={s.updatePreview}
            setLayers={s.setLayers}
            saveSkin={s.saveSkin}
            showMySkins={s.showMySkins}
            setShowMySkins={s.setShowMySkins}
            savedSkins={s.savedSkins}
            setSavedSkins={s.setSavedSkins}
            loadSavedSkin={s.loadSavedSkin}
            deleteSavedSkin={s.deleteSavedSkin}
            shareSkin={s.shareSkin}
            shareUrl={s.shareUrl}
            setShareUrl={s.setShareUrl}
            playSound={s.playSound}
            setShowConfetti={s.setShowConfetti}
            skinTags={SKIN_TAGS}
          />
        </div>

        {/* Center - Canvas Editor */}
        <div className="flex-1 glass-card rounded-2xl md:rounded-3xl p-3 md:p-6 shadow-2xl">
          <Toolbar
            tool={s.tool} setTool={s.setTool} stampShape={s.stampShape} setStampShape={s.setStampShape}
            historyIndex={s.historyIndex} historyLength={s.history.length}
            undo={s.undo} redo={s.redo}
            mirrorMode={s.mirrorMode} setMirrorMode={s.setMirrorMode}
            darkMode={s.darkMode} setDarkMode={s.setDarkMode}
            fileInputRef={s.fileInputRef} importSkin={s.importSkin}
            setShowURLImport={s.setShowURLImport}
            skinName={s.skinName} setSkinName={s.setSkinName}
            downloadSkin={s.downloadSkin} setShowExportPanel={s.setShowExportPanel}
            copyToClipboard={s.copyToClipboard} clearCanvas={s.clearCanvas}
            zoomLevel={s.zoomLevel} setZoomLevel={s.setZoomLevel}
            playSound={s.playSound}
          />

          <CanvasEditor
            canvasRef={s.canvasRef}
            zoomLevel={s.zoomLevel} setZoomLevel={s.setZoomLevel}
            showGrid={s.showGrid} setShowGrid={s.setShowGrid}
            brushSize={s.brushSize} setBrushSize={s.setBrushSize}
            selectedPart={s.selectedPart} setSelectedPart={s.setSelectedPart}
            tool={s.tool} setTool={s.setTool}
            contextMenu={s.contextMenu} setContextMenu={s.setContextMenu}
            helpTipDismissed={s.helpTipDismissed} dismissTip={s.dismissTip}
            isDrawing={s.isDrawing} setIsDrawing={s.setIsDrawing}
            draw={s.draw} drawTouch={s.drawTouch}
            saveState={s.saveState} addRecentColor={s.addRecentColor}
            selectedColor={s.selectedColor} lastPinchDistance={s.lastPinchDistance}
            undo={s.undo} redo={s.redo} clearCanvas={s.clearCanvas}
            playSound={s.playSound}
          />

          <p className="hidden md:block text-center mt-2 text-gray-500 text-sm">🎨 Draw here! See your character on the left! ✨</p>

          {/* Mobile templates */}
          <div className="md:hidden mt-3 px-2">
            <p className="text-xs font-semibold text-gray-600 mb-2 text-center">✨ Start from:</p>
            <div className="flex flex-wrap gap-1 justify-center">
              {Object.entries(TEMPLATES).slice(0, 6).map(([key, template]) => (
                <button key={key} onClick={() => s.loadTemplate(key)} className="px-2 py-1 bg-blue-500 text-white rounded-lg text-xs font-bold hover:bg-blue-600 active:scale-95 transition-all">
                  {template.name}
                </button>
              ))}
              <button onClick={() => { s.setIsWiggling(true); s.generateRandomSkin(); setTimeout(() => s.setIsWiggling(false), 500); }} className="px-2 py-1 bg-gradient-to-r from-pink-500 to-yellow-500 text-white rounded-lg text-xs font-bold active:scale-95 transition-all">
                🎲 Random!
              </button>
            </div>
          </div>
        </div>

        {/* Right Panel - Colors */}
        <ColorPanel
          colors={COLORS}
          selectedColor={s.selectedColor} setSelectedColor={s.setSelectedColor}
          secondaryColor={s.secondaryColor} setSecondaryColor={s.setSecondaryColor}
          recentColors={s.recentColors}
        />
      </div>

      {/* Help Modal */}
      {s.showHelp && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => s.setShowHelp(false)}>
          <div className="bg-white rounded-2xl p-6 max-w-md m-4 shadow-2xl max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-bold mb-4">⌨️ Keyboard Shortcuts</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <span className="font-mono bg-gray-100 px-2 py-1 rounded">B</span><span>Brush</span>
              <span className="font-mono bg-gray-100 px-2 py-1 rounded">E</span><span>Eraser</span>
              <span className="font-mono bg-gray-100 px-2 py-1 rounded">F</span><span>Fill</span>
              <span className="font-mono bg-gray-100 px-2 py-1 rounded">G</span><span>Gradient</span>
              <span className="font-mono bg-gray-100 px-2 py-1 rounded">I</span><span>Eyedropper</span>
              <span className="font-mono bg-gray-100 px-2 py-1 rounded">M</span><span>Mirror</span>
              <span className="font-mono bg-gray-100 px-2 py-1 rounded">1-3</span><span>Brush size</span>
              <span className="font-mono bg-gray-100 px-2 py-1 rounded">⌘Z</span><span>Undo</span>
              <span className="font-mono bg-gray-100 px-2 py-1 rounded">⌘Y</span><span>Redo</span>
              <span className="font-mono bg-gray-100 px-2 py-1 rounded">L</span><span>Layer panel</span>
            </div>
            <button onClick={() => s.setShowHelp(false)} className="mt-4 w-full py-2 bg-blue-500 text-white rounded-lg font-bold">Got it! 👍</button>
          </div>
        </div>
      )}

      {/* Mobile components */}
      <MobileToolbar tool={s.tool} setTool={s.setTool} historyIndex={s.historyIndex} undo={s.undo} downloadSkin={s.downloadSkin} setShowMobile3DPreview={s.setShowMobile3DPreview} playSound={s.playSound} />
      <MobileColorPicker show={s.showMobileColorPicker} onClose={() => s.setShowMobileColorPicker(!s.showMobileColorPicker)} colors={COLORS} selectedColor={s.selectedColor} setSelectedColor={s.setSelectedColor} />

      {/* Layer & AI toggle buttons */}
      <button onClick={() => s.setShowLayerPanel(!s.showLayerPanel)} className={`hidden md:flex fixed bottom-4 left-16 w-10 h-10 rounded-full shadow-lg text-xl hover:scale-110 transition-transform items-center justify-center ${s.showLayerPanel ? 'bg-blue-500 text-white' : 'bg-white/90'}`} title="Toggle Layers (L)">🎨</button>
      <button onClick={() => s.setShowAIPanel(true)} className="hidden md:flex fixed bottom-4 left-4 w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full shadow-lg text-xl hover:scale-110 transition-transform items-center justify-center" title="AI Skin Generator">🤖</button>
      <button onClick={() => s.setShowHelp(true)} className="hidden md:flex fixed bottom-4 right-4 w-10 h-10 bg-white/90 rounded-full shadow-lg text-xl font-bold hover:scale-110 transition-transform items-center justify-center" title="Keyboard shortcuts (?)">?</button>

      {/* Footer */}
      <div className="mt-6 w-full max-w-2xl mx-auto">
        <p className="text-white/70 text-sm text-center mb-4">Made with 💖 by Onde • Works with Minecraft Java & Bedrock!</p>
        <div className="flex flex-wrap justify-center gap-3">
          <a href="/games/" className="px-4 py-3 min-h-[44px] bg-white/10 hover:bg-white/20 rounded-full text-white/80 hover:text-white text-sm font-medium transition-all flex items-center gap-1.5">🎮 More Games</a>
          <a href="/libri/" className="px-4 py-3 min-h-[44px] bg-white/10 hover:bg-white/20 rounded-full text-white/80 hover:text-white text-sm font-medium transition-all flex items-center gap-1.5">📚 Free Books</a>
          <a href="/shop/" className="px-4 py-3 min-h-[44px] bg-white/10 hover:bg-white/20 rounded-full text-white/80 hover:text-white text-sm font-medium transition-all flex items-center gap-1.5">🛍️ Shop</a>
        </div>
      </div>
    </div>
  );
}
