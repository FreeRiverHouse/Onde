# TASKS.md — Task Condivisi Multi-Agente

> ⚠️ **LEGGERE TASK-RULES.md PRIMA DI TOCCARE QUESTO FILE!**
> 
> Questo file è SHARED tra tutti gli agenti. Rispettare il protocollo di lock!

---

## 📚 READER APP / PORTALE VR (DA MATTIA 2026-01-29)

### [T668] Reader App: Prototype Web-Based Book Reader
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-31
- **Depends**: -
- **Blocks**: [T669]
- **Priority**: P1
- **Notes**: App portale per leggere contenuti (libri, etc.)
  - **Vision**: Portale VR + versione web-based per testing
  - **MVP web**: Lettore libri "superfigo" con UX moderna
  - **Features richieste:**
    - ✅ Lettura libri con pagination fluida (swipe + keyboard)
    - ✅ Font sizing, dark mode, sepia themes
    - ✅ Progress tracking per libro (localStorage + Zustand)
    - ⏳ Bookmarks e highlighting (structure ready)
    - ⏳ Sync tra dispositivi (future)
  - **Tech**: Next.js 15 + Tailwind + Zustand
  - **Test target**: Browser + PWA prima di VR
  - **Progress 2026-01-31:**
    - ✅ Created `apps/reader-app/` - full working prototype!
    - ✅ Library view with book covers, progress, "Continue Reading"
    - ✅ Reader view with customizable typography settings
    - ✅ Theme modes: Light, Dark, Sepia
    - ✅ Font controls: size (14-28px), family (serif/sans), line height
    - ✅ Margin controls: small/medium/large
    - ✅ Touch gestures: swipe left/right for pagination
    - ✅ Keyboard shortcuts: arrows, space, escape
    - ✅ Table of Contents slide-out panel
    - ✅ Settings bottom sheet panel
    - ✅ Progress bar at top
    - ✅ Auto-hide controls with tap to show
    - ✅ PWA manifest ready
    - ✅ IndexedDB setup for EPUB file storage
    - ✅ Sample content (Pride & Prejudice chapters)
    - ✅ Zustand store with localStorage persistence
    - **Run with:** `cd apps/reader-app && npm run dev`

### [T690] Reader App: Full EPUB Support
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-31
- **Depends**: [T668]
- **Blocks**: -
- **Priority**: P2
- **Notes**: ✅ Implemented real EPUB file reading in the Reader App!
  - ✅ Created EpubReader component using epub.js library
  - ✅ Extract metadata (title, author, cover) from EPUB
  - ✅ Render chapters with epub.js rendition (proper formatting, pagination)
  - ✅ Support embedded images and styles
  - ✅ Table of contents extracted from EPUB navigation
  - ✅ Progress tracking via epub.js locations
  - ✅ Theme support (light/dark/sepia) applied to EPUB content
  - ✅ Store uploaded EPUBs in IndexedDB (shared epubStorage module)
  - ✅ Gutenberg URLs for sample books (Pride & Prejudice, Moby Dick, Frankenstein)
  - ✅ TypeScript types for epub.js (src/types/epub.d.ts)
  - ✅ Touch gestures (swipe) and keyboard navigation
  - Build OK, ready for deploy

### [T691] Reader App: Bookmarks & Highlighting
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-31
- **Depends**: [T668]
- **Blocks**: -
- **Priority**: P2
- **Notes**: ✅ Implemented annotation features in Reader App!
  - ✅ HighlightMenu component: appears on text selection
  - ✅ 4 highlight colors: yellow, green, blue, pink
  - ✅ Add notes to highlights with inline editor
  - ✅ Copy text to clipboard option
  - ✅ Bookmark toggle button in header (🔖/🏷️)
  - ✅ AnnotationsPanel: slide-out panel with tabs
  - ✅ Search and color filter for highlights
  - ✅ Navigate to annotation location on click
  - ✅ Delete annotations with confirmation
  - ✅ Export annotations to Markdown
  - ✅ Annotation count badge on toolbar
  - ✅ Render existing highlights on page load (epub.js annotations API)
  - ✅ Zustand store with localStorage persistence

### [T692] Reader App: Deploy to onde.la/reader
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-29
- **Depends**: [T668]
- **Blocks**: -
- **Priority**: P2
- **Notes**: ✅ Deployed Reader App to onde.la/reader!
  - ✅ Build static export with basePath=/reader/
  - ✅ Copied to onde-portal/public/reader/
  - ✅ Deployed via wrangler: https://f94c0c0e.onde-portal.pages.dev
  - ✅ Verified: https://onde.la/reader/ returns 200 OK
  - ⏳ Add link from onde.la homepage/nav (future task)
  - ⏳ Verify PWA install works on deploy (manual testing)
  - ⏳ Test on mobile Safari and Chrome (manual testing)

### [T693] Reader App: Add link to onde.la navigation
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-31
- **Depends**: [T692]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Added Reader App link to onde.la!
  - ✅ Added "Read" / "Leggi" to main navigation (desktop + mobile)
  - ✅ Added to footer links under Explore section
  - ✅ Deployed: https://48afb914.onde-portal.pages.dev
  - ✅ Verified: https://onde.la and https://onde.la/reader/ both 200 OK
  - ⏳ Add card/banner on homepage (optional, future)
  - ⏳ Consider adding to /libri page as "Read in our app" CTA (future)

### [T694] Audit and fix npm vulnerabilities
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-29
- **Depends**: -
- **Blocks**: -
- **Priority**: P2
- **Notes**: npm audit shows 55 vulnerabilities remaining after safe fixes:
  - ✅ Fixed: diff, lodash (safe updates applied)
  - ⚠️ BLOCKED: Most vulnerabilities can't auto-fix due to peer dependency conflicts:
    - `@opennextjs/cloudflare` requires Next.js 15+ but `surfboard` uses 14.2.35
    - Breaking change upgrades needed for: next, elevenlabs, expo-router, expo, @supabase/ssr
  - 🚫 NO FIX AVAILABLE: ejs (via epub-gen), esbuild (dev only), lodash.pick (via cheerio), nth-check (via cheerio), undici
  - **Action needed**: Upgrade surfboard to Next.js 15+ (separate task [T696]) to unlock remaining fixes
  - **Risk assessment**:
    - CRITICAL in next, @remix-run/node, form-data - production impact
    - HIGH in ip, qs, tar, semver, nth-check - mixed impact
    - Most ejs/esbuild vulns are dev-only
  - **Mitigation**: Production apps should use latest Next.js 15+ when ready

### [T695] Reader App: PWA mobile testing
- **Status**: TODO
- **Owner**: -
- **Depends**: [T692]
- **Blocks**: -
- **Priority**: P3
- **Notes**: Test Reader App PWA functionality:
  - iOS Safari: Add to Home Screen, offline caching
  - Android Chrome: Install prompt, offline mode
  - Check manifest.json icons render correctly
  - Test touch gestures (swipe) on real devices
  - Verify font/theme settings persist
  - Screenshot or video of PWA install flow

### [T696] Surfboard: Upgrade to Next.js 15
- **Status**: BLOCKED
- **Owner**: @clawd
- **Depends**: @cloudflare/next-on-pages Next.js 15 support
- **Blocks**: -
- **Priority**: P2
- **Notes**: Upgrade surfboard app from Next.js 14.2.35 to 15.x to unlock security fixes:
  - @opennextjs/cloudflare requires Next 15+ (peer dependency)
  - Will fix ~30+ npm audit vulnerabilities
  - **Breaking changes to review:**
    - Async params/searchParams in pages
    - New caching defaults
    - fetch() behavior changes
  - **Test checklist:**
    - [ ] Auth flow (Supabase)
    - [ ] API routes
    - [ ] Cloudflare Pages deploy
  - Reference: https://nextjs.org/docs/app/building-your-application/upgrading/version-15
  - **Progress 2026-01-30:**
    - ✅ Installed Next.js 15.5.11 - `npm run build` passes!
    - ❌ `build:cf` fails: `@cloudflare/next-on-pages@1.13.16` doesn't support Next.js 15
    - **Error**: `/_not-found` route not configured for Edge Runtime
    - This is a known incompatibility - Next.js 15 generates internal `/_not-found` route
    - Adding `export const runtime = 'edge'` to `not-found.tsx` doesn't fix it
    - **BLOCKED** until @cloudflare/next-on-pages adds Next.js 15 support
    - **Workaround applied**: Added edge runtime to 2 API routes (polyroborto/status, tech-support/status)
    - Rolled back to Next.js 14.2 for production stability

### [T669] Reader App: VR/XR Version Planning
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-29
- **Depends**: [T668], [T690]
- **Blocks**: [T701], [T702], [T703]
- **Priority**: P2
- **Notes**: ✅ Comprehensive planning document created!
  - **Document**: `apps/reader-app/docs/VR-XR-PLANNING.md`
  - **Recommendation**: Phase 1 with React-Three-Fiber + WebXR
  - **Platforms**: Quest 3 (primary), Vision Pro (future)
  - **Tech stack**: R3F + @react-three/xr + troika-three-text
  - **MVP features**: 3 environments, floating text, page turns, settings
  - **Timeline**: 3 weeks for WebXR MVP
  - **Key decisions:**
    - Text: troika-three-text for crisp SDF rendering
    - Environments: Library, Mountain cabin, Floating clouds
    - Controls: Controller + hand tracking
  - **Risks identified**: VR text fatigue, Quest browser perf
  - **Next step**: Create minimal R3F prototype (T701)

### [T701] Reader App VR: Create R3F prototype with floating text
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-29
- **Depends**: [T669]
- **Blocks**: [T702]
- **Priority**: P2
- **Notes**: ✅ Created VR Reader prototype with R3F + WebXR!
  - ✅ Created `apps/reader-vr/` with Next.js 16 + React-Three-Fiber
  - ✅ Floating book panel with Pride & Prejudice sample text
  - ✅ Cozy library environment (bookshelves, reading chair, floating candles)
  - ✅ Warm ambient lighting, dust particles, stars
  - ✅ VR/AR entry buttons (WebXR compatible)
  - ✅ Page navigation: keyboard arrows, mouse click, VR controller triggers
  - ✅ Font size adjustment (+/- keys, VR grip)
  - ✅ Serif font (Merriweather) for comfortable reading
  - ✅ Build passes, dev server tested
  - **Run with:** `cd apps/reader-vr && npm run dev`
  - ⏳ TODO: Test on Quest 3 browser (manual)

### [T702] Reader App VR: Cozy library environment
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-31
- **Depends**: [T701]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Implemented enhanced cozy library environment!
  - ✅ 3D library scene with rich detail:
    - Walls with wainscoting panels and crown molding
    - Oriental rug under reading area
    - Tall corner bookshelves with colorful books
    - Fireplace with animated flames and ember glow
    - Window with curtains and time-based lighting
    - Grandfather clock with swinging pendulum
    - Decorative globe on stand (slowly rotating)
    - Potted plant
  - ✅ Leather armchair with tufted details
  - ✅ Side tables with Tiffany lamp, books, tea cup, whiskey glass
  - ✅ Enhanced floating candles with wax drips
  - ✅ **Time-of-day lighting system**:
    - Morning: Bright, warm sunlight
    - Afternoon: Clear daylight
    - Evening: Golden hour, fireplace prominent
    - Night: Moonlight, stars, cozy fireplace glow
  - ✅ UI button to cycle through times of day
  - ✅ Ceiling with crown molding
  - ⏳ Ambient sounds (future - see T488)
  - ⏳ Teleport spots (future - see T706)

### [T703] Reader App VR: EPUB text extraction for VR rendering
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-31
- **Depends**: [T701]
- **Blocks**: -
- **Priority**: P2
- **Notes**: ✅ Implemented EPUB support for VR Reader!
  - ✅ Created `lib/epubParser.ts` - extracts plain text from EPUB files
  - ✅ Created `store/bookStore.ts` - Zustand store for book state management
  - ✅ Added `BookSelector.tsx` - modal UI to select demo books
  - ✅ Updated `FloatingBook.tsx` to use dynamic EPUB content
  - ✅ Updated `VRScene.tsx` with book selector integration
  - ✅ Added epub.d.ts type definitions for epub.js
  - ✅ Demo books: Pride & Prejudice, Moby Dick, Frankenstein (Project Gutenberg)
  - ✅ Smart pagination: breaks at paragraphs/sentences for VR comfort (~800 chars/page)
  - ✅ Chapter info display: title, page in chapter, total
  - ✅ Progress persistence via Zustand + localStorage
  - ✅ Deployed: https://b938a9a1.onde-portal.pages.dev

### [T704] Reader App VR: Deploy to onde.la/reader-vr
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-31
- **Depends**: [T701]
- **Blocks**: -
- **Priority**: P2
- **Notes**: ✅ Deployed VR reader prototype!
  - ✅ Configured static export with basePath=/reader-vr/
  - ✅ Copied to onde-portal/public/reader-vr/
  - ✅ Deployed via wrangler: https://3dc1ab5c.onde-portal.pages.dev
  - ✅ Verified: https://onde.la/reader-vr/ returns 200 OK
  - ⏳ Test on Quest 3 browser (manual testing needed)
  - ⏳ Add link from main Reader App

### [T705] Reader App VR: Add environment switcher
- **Status**: TODO (DEPRIORITIZED - Mattia: "meno focus su VR" 2026-01-29)
- **Owner**: -
- **Depends**: [T701]
- **Blocks**: -
- **Priority**: P4
- **Notes**: Allow switching between different reading environments:
  - Cozy library (current)
  - Mountain cabin (nature view through windows)
  - Floating in clouds (minimal, dreamy)
  - Dark mode study (low light, focused)
  - Each environment needs: lighting, ambient sounds hook, atmosphere

### [T706] Reader App VR: Add hand tracking support
- **Status**: TODO (DEPRIORITIZED - Mattia: "meno focus su VR" 2026-01-29)
- **Owner**: -
- **Depends**: [T701]
- **Blocks**: -
- **Priority**: P4
- **Notes**: Enable hand tracking for Quest 3 controller-free reading:
  - Pinch gesture for page turn
  - Swipe gesture for navigation
  - Point at menu items to select
  - Grab gesture to move book panel
  - @react-three/xr hands API integration

### [T707] Reader App VR: Add ambient soundscapes
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-31
- **Depends**: [T702]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Implemented immersive ambient soundscapes for VR Reader!
  - **Component**: `apps/reader-vr/components/AmbientSoundscapes.tsx`
  - **Hook**: `useAmbientSoundscapes({ timeOfDay, isMuted, volume })`
  - **Features:**
    - ✅ Crackling fireplace (low pops, snaps, mid crackle)
    - ✅ Grandfather clock ticking (slow, resonant)
    - ✅ Page rustling sound on page turns via `playPageTurn()`
    - ✅ Soft ambient library drone (warm frequencies)
    - ✅ Wood settling/creaking sounds
    - ✅ Time-of-day variations through windows:
      - Morning: Birds chirping, gentle breeze
      - Afternoon: Fewer birds, soft wind, distant life
      - Evening: Crickets starting, last birds
      - Night: Cricket choir, distant owl, night wind
    - ✅ UI controls: Mute toggle + volume slider in header
    - ✅ All procedural Web Audio API (no audio files!)
    - ✅ Reverb for library room depth
  - **Deployed**: https://467e1086.onde-portal.pages.dev
  - **Verified**: https://onde.la/reader-vr/ returns 200 OK

### [T708] Reader App VR: Deploy enhanced version to onde.la
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-31
- **Depends**: [T702]
- **Blocks**: -
- **Priority**: P2
- **Notes**: ✅ Deployed! https://01d44bf8.onde-portal.pages.dev
  - ✅ Built static export with basePath=/reader-vr/
  - ✅ Copied to onde-portal/public/reader-vr/
  - ✅ Deployed via wrangler to Cloudflare Pages
  - ✅ Verified: https://onde.la/reader-vr/ returns 200 OK
  - Enhanced library now live with:
    - Fireplace with animated flames
    - Grandfather clock with pendulum
    - Time-of-day toggle (🌅🌆🌙)
    - Oriental rug, globe, potted plant
    - Wainscoting walls and crown molding

### [T709] Reader App VR: Add teleport spots for VR movement
- **Status**: TODO (DEPRIORITIZED - Mattia: "meno focus su VR" 2026-01-29)
- **Owner**: -
- **Depends**: [T702]
- **Blocks**: -
- **Priority**: P4
- **Notes**: Allow user to move around the library in VR:
  - 3-4 teleport spots: reading chair, fireplace area, window, bookshelf
  - Visual indicators (glowing circles on floor)
  - Controller trigger or gaze-select to teleport
  - Smooth transition animation
  - Book panel follows user position

### [T710] Reader VR: Add reading session statistics
- **Status**: TODO (DEPRIORITIZED - Mattia: "meno focus su VR" 2026-01-29)
- **Owner**: -
- **Depends**: [T701]
- **Blocks**: -
- **Priority**: P4
- **Notes**: Track VR reading session statistics:
  - Time spent reading per session
  - Pages read, words per minute estimate
  - Session history with dates
  - Display stats in 3D panel or overlay
  - Persist to localStorage for cross-session tracking
  - Optional: Achievements/milestones (first 100 pages, etc.)

### [T711] Reader VR: Add VR bookmark gestures
- **Status**: TODO (DEPRIORITIZED - Mattia: "meno focus su VR" 2026-01-29)
- **Owner**: -
- **Depends**: [T706], [T701]
- **Blocks**: -
- **Priority**: P4
- **Notes**: Add bookmark functionality with VR gestures:
  - Pinch gesture to create bookmark
  - Visual bookmark marker on current page
  - 3D bookmark list panel (accessible via menu)
  - Sync with web reader bookmarks (shared format)
  - Color-coded bookmark categories

### [T712] Reader App: Add text-to-speech audiobook mode
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-31
- **Depends**: [T690]
- **Blocks**: [T713]
- **Priority**: P2
- **Notes**: ✅ Implemented TTS audiobook mode for Reader App!
  - ✅ Created `TextToSpeech.tsx` component with Web Speech API
  - ✅ Voice selection (grouped by language) from system voices
  - ✅ Speed control (0.5x - 2x)
  - ✅ Pitch control (0.5 - 2.0)
  - ✅ Volume control (0-100%)
  - ✅ Play/Pause/Stop controls
  - ✅ Skip forward/backward by sentence
  - ✅ Progress bar showing current position
  - ✅ Current sentence display with sentence counter
  - ✅ Keyboard shortcuts hint (Space, arrows)
  - ✅ Smart sentence splitting on punctuation
  - ✅ Auto-advance to next sentence
  - ✅ 🎧 button added to reader header
  - ✅ Extracts text from current page via epub.js
  - ✅ Deployed: https://5f8ced56.onde-portal.pages.dev
  - ✅ Verified: https://onde.la/reader/ returns 200 OK
  - ⏳ VR spatial audio integration (future, see T713)

### [T713] Reader VR: Integrate TTS with spatial audio
- **Status**: TODO (DEPRIORITIZED - Mattia: "meno focus su VR" 2026-01-29)
- **Owner**: -
- **Depends**: [T712], [T701]
- **Blocks**: -
- **Priority**: P4
- **Notes**: Add TTS to VR reader with 3D spatial audio:
  - Positional audio from book location (Three.js PositionalAudio)
  - Voice appears to come from the floating book
  - Room reverb that matches library environment
  - Integration with existing AmbientSoundscapes
  - Duck ambient sounds while TTS is playing

### [T714] Reader App: TTS keyboard shortcuts in reader view
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-31
- **Depends**: [T712]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Implemented keyboard shortcuts in TTS panel!
  - ✅ Space: Play/Pause
  - ✅ Escape: Close TTS panel
  - ✅ Left/Right arrows: Previous/Next sentence
  - ✅ Up/Down arrows: Speed adjust (±0.1x)
  - ✅ M: Mute/unmute toggle
  - ✅ Updated shortcuts hint UI to show all shortcuts
  - ✅ Input element detection to avoid conflicts
  - Build passes, ready for deploy

### [T715] Reader App: Auto-page-turn during TTS playback
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-31
- **Depends**: [T712]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Implemented seamless audiobook experience!
  - ✅ Auto-detects when all sentences on page are spoken
  - ✅ Automatically calls goToNext() to flip page
  - ✅ Extracts new page text and continues TTS seamlessly
  - ✅ "Loading next page..." indicator shown during transition
  - ✅ Toggle switch to enable/disable auto page turn
  - ✅ Uses ref to track playing state across page transitions
  - Build passes, ready for deploy

### [T716] Reader App: Deploy TTS features to onde.la/reader
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-31
- **Depends**: [T714], [T715]
- **Blocks**: -
- **Priority**: P2
- **Notes**: ✅ Deployed! https://0146b182.onde-portal.pages.dev
  - ✅ Keyboard shortcuts (Space, Esc, arrows, M)
  - ✅ Auto page turn during TTS playback
  - ✅ Built static export with STATIC_EXPORT=1
  - ✅ Copied to onde-portal/public/reader/
  - ✅ Deployed via wrangler to Cloudflare Pages
  - ✅ Verified: https://onde.la/reader/ returns 200 OK

### [T717] Reader App: Save TTS settings to localStorage
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-29
- **Depends**: [T712]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Implemented TTS settings persistence!
  - ✅ Added `TTSSettings` interface to readerStore (voiceName, rate, pitch, volume, autoPageTurn)
  - ✅ Added `ttsSettings` state and `updateTtsSettings` action to Zustand store
  - ✅ Included in `partialize` for localStorage persistence
  - ✅ TextToSpeech component now uses store settings instead of local state
  - ✅ Voice restored by name on load (voices aren't serializable)
  - ✅ All settings persist: voice, speed, pitch, volume, auto page turn
  - ✅ Keyboard shortcuts (↑/↓/M) now update persisted settings
  - ✅ Deployed: https://df044574.onde-portal.pages.dev
  - ✅ Verified: https://onde.la/reader/ returns 200 OK

### [T718] Reader App: Add TTS speed presets (slow/normal/fast)
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-29
- **Depends**: [T714]
- **Blocks**: -
- **Priority**: P4
- **Notes**: ✅ Implemented TTS speed presets!
  - ✅ Preset buttons: 🐢 (0.75x) | ▶️ (1.0x) | 🐇 (1.5x) | ⚡ (2.0x)
  - ✅ Visual indication: active preset highlighted in blue
  - ✅ Keyboard shortcuts 1/2/3/4 for presets
  - ✅ Fine-tune slider still available below presets
  - ✅ Updated keyboard hints to show 1-4
  - ✅ Build passes

### [T719] Reader App: Add reading statistics dashboard
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-29
- **Depends**: [T668]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Implemented reading statistics dashboard!
  - ✅ Created `readingStatsStore.ts` with Zustand + localStorage persistence
  - ✅ Tracks: total reading time, pages read, sessions, books completed
  - ✅ Daily stats with 30-day history
  - ✅ Reading streaks (current + longest)
  - ✅ Auto-detect consecutive day reading
  - ✅ Created `ReadingStatsPanel.tsx` with beautiful UI:
    - Streak banner with 🔥/❄️ indicators
    - Today's progress (time, pages, sessions)
    - 7-day bar chart visualization
    - All-time stats grid
    - Averages (per day, per session)
    - Encouragement for new users
  - ✅ Integrated into EpubReader:
    - Session starts on book load
    - Session ends on close (tracks pages read)
    - 📊 button in header to open stats
  - ✅ Deployed: https://6ade5bfe.onde-portal.pages.dev
  - ✅ Verified: https://onde.la/reader/ returns 200 OK

### [T720] Reader App: Export/Import library data
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-29
- **Depends**: [T668]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Implemented export/import functionality!
  - ✅ Created `src/lib/dataTransfer.ts` - core export/import logic
    - Export version tracking for future migrations
    - Full data export: books, highlights, bookmarks, vocabulary, settings, TTS settings, reading stats
    - JSON validation with detailed error reporting
    - Two import strategies: "merge" (keep existing + add new) and "overwrite" (replace all)
    - Smart merge: updates books with higher progress, deduplicates by ID
    - Daily stats merge takes max values for each day
  - ✅ Created `src/components/DataTransferPanel.tsx` - UI component
    - Expandable "💾 Backup & Restore" section in settings
    - Export button downloads JSON file with date in filename
    - Import with file picker, validation preview, strategy selection
    - Progress states: validating → preview → importing → done/error
    - Success/error feedback with import summary
    - Theme-aware styling (light/dark/sepia)
  - ✅ Integrated into ReaderSettings.tsx
  - ✅ Build passes
  - ⏳ Needs deploy to onde.la/reader (separate task)

### [T721] Trading: Add asset correlation heatmap widget
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-31
- **Depends**: [T483]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Implemented asset correlation heatmap widget!
  - **Component**: `apps/surfboard/src/components/CorrelationHeatmapWidget.tsx`
  - **Features:**
    - Visual 3x3 correlation matrix (BTC, ETH, Weather)
    - Color-coded cells: red (high correlation) → green (diversified) → blue (hedging)
    - Risk level badge (high/medium/low)
    - BTC-ETH correlation percentage with interpretation
    - Dynamic crypto limit based on correlation
    - Current prices with 7d change
    - Data source and timestamp
  - **Integration:**
    - Added to /betting page after ConcentrationHistoryChart
    - Added `assetCorrelation` field to TradingStats interface
    - Updated push-stats-to-gist.py with `load_asset_correlation()` function
  - **Gist**: Correlation data now included in onde-trading-stats.json
  - Build passes, ready for deploy

### [T722] Deploy onde.surf with correlation heatmap widget
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-31
- **Depends**: [T721]
- **Blocks**: -
- **Priority**: P2
- **Notes**: ✅ Deployed correlation heatmap widget!
  - Deploy URL: https://3888e1b1.onde-surf.pages.dev
  - ✅ Build via `npm run build:cf` - passed
  - ✅ Deploy via wrangler to Cloudflare Pages
  - ✅ Site returns 307 (auth redirect) as expected
  - Correlation data now visible on /betting after login

### [T723] Trading: Track correlation history over time
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-31
- **Depends**: [T721]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Implemented correlation history tracking!
  - Modified `btc-eth-correlation.py` to log snapshots
  - ✅ `log_to_history()` function appends to correlation-history.jsonl
  - ✅ `load_previous_correlation()` reads last value for comparison
  - ✅ Cron job added: daily at 12:00 UTC
  - History includes: timestamp, correlation, adjustment, prices, source
  - ⏳ Dashboard sparkline (future enhancement)

### [T724] Trading: Alert when correlation changes significantly
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-31
- **Depends**: [T723]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Implemented correlation change alerts!
  - Added `check_and_alert_change()` function to btc-eth-correlation.py
  - ✅ Alerts when correlation crosses 0.7→0.9 threshold (regime change)
  - ✅ Alerts on any 15%+ change in correlation value
  - ✅ Creates `kalshi-correlation-change.alert` for heartbeat pickup
  - Alert includes: old value, new value, change, trading implication
  - Script compares current vs previous value from history file

### [T697] Reader App: Deploy with bookmarks & highlighting to onde.la
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-31
- **Depends**: [T691]
- **Blocks**: -
- **Priority**: P2
- **Notes**: ✅ Deployed! https://c0e6e423.onde-portal.pages.dev
  - ✅ Built static export with STATIC_EXPORT=1 (basePath=/reader/)
  - ✅ Copied to onde-portal/public/reader/
  - ✅ Deployed via wrangler to Cloudflare Pages
  - ✅ Verified: https://onde.la/reader/ returns 200 OK
  - Features now live: highlight menu, bookmarks, annotations panel, export

### [T698] Reader App: Sync annotations across devices
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-02-01
- **Depends**: [T691]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Implemented cloud sync for annotations!
  - ✅ **Supabase client**: `src/lib/supabase.ts` - Device ID management, sync code generation
  - ✅ **Sync service**: `src/lib/syncService.ts` - Full sync logic with conflict resolution
    - Enable/disable sync with 6-char alphanumeric code
    - Join existing sync groups
    - Push/pull data to/from cloud
    - Timestamp-based conflict resolution (newer wins per item)
    - Books merge: keeps higher progress, newer lastRead
    - Settings: keeps local preference
  - ✅ **React hook**: `src/lib/useSync.ts` - Connects sync to Zustand store
    - Auto-sync on data changes (5s debounce)
    - Manual sync trigger
    - Applies merged data back to store
  - ✅ **UI component**: `src/components/SyncPanel.tsx`
    - Enable sync (generates new code)
    - Join with existing code
    - Copy code to clipboard
    - Sync status display
    - Manual sync button
    - "Local Only" badge when Supabase not configured
  - ✅ Integrated into ReaderSettings above Backup & Restore
  - ✅ Build passes
  - ⏳ Needs Supabase project setup + env vars for cloud mode
  - ⏳ Needs deploy to onde.la/reader (see T800)

### [T699] Reader App: Dictionary lookup on word select
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-31
- **Depends**: [T691]
- **Blocks**: [T700]
- **Priority**: P3
- **Notes**: ✅ Implemented dictionary lookup feature!
  - ✅ `DictionaryPopup.tsx` - Fetches definitions from dictionaryapi.dev (free, no key)
  - ✅ Single word detection in HighlightMenu (allows hyphenated words like "self-aware")
  - ✅ Shows definition, part of speech, pronunciation, examples
  - ✅ Play audio pronunciation button (when available)
  - ✅ "Add to Vocabulary" button - saves word with definition to VocabularyWord store
  - ✅ "Save as Highlight" button - creates blue highlight with definition as note
  - ✅ `VocabularyPanel.tsx` - Side panel to view/manage saved vocabulary
  - ✅ Filter by all books or current book
  - ✅ Search vocabulary words
  - ✅ Export vocabulary list to Markdown
  - ✅ Vocabulary persisted in localStorage with other reader data
  - ✅ 📚 button added to reader header for quick access
  - Build OK, ready for deploy

### [T700] Reader App: Deploy dictionary feature to onde.la
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-31
- **Depends**: [T699]
- **Blocks**: -
- **Priority**: P2
- **Notes**: ✅ Deployed! https://f8d29668.onde-portal.pages.dev
  - ✅ Built static export with STATIC_EXPORT=1 (basePath=/reader/)
  - ✅ Copied to onde-portal/public/reader/
  - ✅ Deployed via wrangler to Cloudflare Pages
  - ✅ Verified: https://onde.la/reader/ returns 200 OK
  - Dictionary lookup, vocabulary panel, audio pronunciation all live!

### [T800] Reader App: Deploy sync feature to onde.la/reader
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-02-01
- **Depends**: [T698]
- **Blocks**: -
- **Priority**: P2
- **Notes**: ✅ Deployed! https://67b7dae4.onde-portal.pages.dev
  - ✅ Built static export with STATIC_EXPORT=1
  - ✅ Copied to onde-portal/public/reader/
  - ✅ Deployed via wrangler
  - ✅ Verified: https://onde.la/reader/ returns 200 OK
  - Sync panel now available in Settings
  - ⚠️ Note: Cloud sync shows "Local Only" until Supabase is configured (T801)

### [T801] Reader App: Setup Supabase project for cloud sync
- **Status**: TODO
- **Owner**: -
- **Depends**: [T698]
- **Blocks**: -
- **Priority**: P2
- **Notes**: Create Supabase project for Reader App cloud sync:
  - Create new Supabase project (free tier OK)
  - Create `reader_sync` table with columns:
    - sync_code (text, primary key)
    - device_id (text)
    - data (jsonb)
    - created_at (timestamp)
    - updated_at (timestamp)
  - Enable Row Level Security
  - Add RLS policies for anonymous access
  - Get URL and anon key
  - Add to reader-app .env.local
  - Document setup in README

### [T802] Reader App: Add offline reading indicator and cache status
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-02-01
- **Depends**: [T668]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Implemented offline status indicator!
  - ✅ **Hook**: `src/lib/useOnlineStatus.ts` - Tracks online/offline state with Navigator API
  - ✅ **Component**: `src/components/OfflineIndicator.tsx` - Visual indicator with animation
    - Yellow pulsing dot when offline
    - Green dot with "Back online" when reconnected
    - Compact mode for header integration
  - ✅ Integrated into Library header (next to title)
  - ✅ Integrated into EpubReader header (next to book title)
  - ✅ Build passes
  - ⏳ Future: "Downloaded" badges on book cards (T803)
  - ⏳ Future: "Download for offline" button (T804)
  - ⏳ Needs deploy to onde.la/reader (T805)

### [T803] Reader App: Show "Downloaded" badge on cached books
- **Status**: TODO
- **Owner**: -
- **Depends**: [T802]
- **Blocks**: -
- **Priority**: P4
- **Notes**: Show visual indicator for books cached in IndexedDB:
  - Check IndexedDB for stored EPUB data
  - Show small ✓ or "Downloaded" badge on book card
  - Different style for demo books (always available)
  - Update badge when book is removed from cache

### [T804] Reader App: Add "Download for offline" button
- **Status**: TODO
- **Owner**: -
- **Depends**: [T803]
- **Blocks**: -
- **Priority**: P4
- **Notes**: Allow users to explicitly cache books for offline:
  - Add download icon/button to book card
  - Download and store EPUB in IndexedDB
  - Show progress during download
  - Update cached badge on completion
  - Option to remove from cache

### [T805] Reader App: Deploy offline indicator to onde.la/reader
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-02-01
- **Depends**: [T802]
- **Blocks**: -
- **Priority**: P2
- **Notes**: ✅ Deployed! https://123baa41.onde-portal.pages.dev
  - ✅ Built with STATIC_EXPORT=1
  - ✅ Copied to onde-portal/public/reader/
  - ✅ Deployed via wrangler
  - ✅ Verified: https://onde.la/reader/ returns 200 OK
  - Offline indicator now live in Library and Reader headers

---

## 🤖 SE-BOT - AI Meeting Copilot (DA MATTIA 2026-01-29)

### [T470] SE-Bot: macOS System Audio Capture
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-31
- **Depends**: -
- **Blocks**: [T471]
- **Priority**: P1
- **Notes**: ✅ Implemented macOS system audio capture!
  - **Script**: `apps/se-bot/audio_capture.py`
  - **Tech**: sounddevice + numpy (BlackHole virtual audio driver)
  - **Features:**
    - Auto-detect BlackHole device if installed
    - Real-time audio streaming with callback support
    - Rolling buffer (30s) for context window
    - WAV file recording mode
    - Raw stream mode for piping to Whisper
    - Audio level meter demo mode
    - 16kHz mono output (Whisper-optimized)
  - **Usage:**
    - `python audio_capture.py --list` - List devices
    - `python audio_capture.py --demo` - Show audio levels
    - `python audio_capture.py --output meeting.wav` - Record
    - `python audio_capture.py --stream | whisper-cpp` - Pipe to Whisper
  - ⚠️ **Requires BlackHole installed (see T477)**

### [T471] SE-Bot: Streaming Whisper Real-Time Transcription
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-31
- **Depends**: [T470]
- **Blocks**: [T473]
- **Priority**: P1
- **Notes**: ✅ Implemented real-time Whisper transcription!
  - **Script**: `apps/se-bot/realtime_transcription.py`
  - **Features:**
    - Two modes: whisper-stream (real-time) or whisper-cli (chunk-based)
    - Auto-detect whisper-cpp installation
    - Rolling context window for meeting context
    - JSON output mode for structured data
    - Transcript file export
    - Model download helper (tiny/base/small/medium/large)
    - Language auto-detection or manual setting
    - VAD threshold for voice activity detection
  - **Usage:**
    - `python realtime_transcription.py` - Start transcribing
    - `python realtime_transcription.py --model small` - Use small model
    - `python realtime_transcription.py --language auto` - Auto-detect language
    - `python realtime_transcription.py --output transcript.txt` - Save to file
    - `python realtime_transcription.py --download-model base` - Download model
  - **Integration**: Uses AudioCapture from T470 for audio input
  - **whisper-cpp**: 1.8.3 installed via Homebrew ✅

### [T472] SE-Bot: Versa/SASE Knowledge Base
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-31
- **Depends**: -
- **Blocks**: [T473]
- **Priority**: P1
- **Notes**: ✅ Knowledge base complete with 120 documents!
  - **Structure**: `apps/se-bot/knowledge-base/`
  - **Content:**
    - ✅ SASE overview (architecture, concepts, comparisons)
    - ✅ SD-WAN overview (capabilities, metrics, deployment models)
    - ✅ Zero Trust/ZTNA deep dive
    - ✅ Security deep-dive (threat protection, DLP, CASB, compliance)
    - ✅ Competitive positioning (vs Palo Alto, Zscaler, Cato, Fortinet)
    - ✅ Objections handling playbook
    - ✅ Mattia style guide template
  - **Embeddings:**
    - ✅ `build_embeddings.py` - builds ChromaDB from markdown files
    - ✅ `kb_search.py` - semantic search module
    - ✅ 120 documents indexed
    - ✅ all-MiniLM-L6-v2 model (local, no API key)
    - ✅ Section-based chunking for better retrieval
  - **Search quality tested:** 10/10 queries passed (T478)
  - **Integration:** `get_context_for_topic()` for Claude prompts
  - ⏳ Future: Add Versa-specific proprietary content (Mattia to provide)

### [T473] SE-Bot: Meeting Context Analyzer + Claude RAG
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-31
- **Depends**: [T471], [T472]
- **Blocks**: [T474]
- **Priority**: P1
- **Notes**: ✅ Implemented meeting context analyzer with RAG!
  - **Script**: `apps/se-bot/context_analyzer.py`
  - **Pipeline**: Transcript → Style detection → KB lookup (RAG) → Claude API
  - **Features:**
    - Auto-detect response style (technical, executive, competitive, objection, demo)
    - Competitor detection (Palo Alto, Zscaler, Cato, Fortinet, etc.)
    - Knowledge base semantic search via ChromaDB
    - Claude API integration for response generation
    - KB-only fallback when API key not available
    - Background analysis mode with configurable interval
    - JSON output mode for integration
  - **Usage:**
    - `python context_analyzer.py --test "ZTNA vs VPN?"` - Test query
    - `python context_analyzer.py --status` - Check system status
    - `python context_analyzer.py --transcript file.txt` - Analyze file
    - `python context_analyzer.py --style executive-summary` - Force style
  - **Latency**: ~111ms KB lookup (target: <2s) ✅
  - **Integration**: Uses realtime_transcription.py for transcript input

### [T474] SE-Bot: macOS Overlay UI
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-31
- **Depends**: [T473]
- **Blocks**: -
- **Priority**: P1
- **Notes**: ✅ Implemented macOS overlay UI with PyObjC!
  - **Files created:**
    - `apps/se-bot/overlay_ui.py` - Native macOS overlay using PyObjC/AppKit
    - `apps/se-bot/se_bot_main.py` - Main integration controller
    - `apps/se-bot/requirements.txt` - Dependencies list
  - **Features:**
    - ✅ Always-on-top transparent window (NSPanel + NSVisualEffectView)
    - ✅ 3 suggestion cards with color-coded badges
    - ✅ Click to copy to clipboard with visual feedback
    - ✅ Keyboard shortcuts 1/2/3 to copy suggestions
    - ✅ Global hotkey Cmd+Shift+S to toggle visibility
    - ✅ Live transcript display at bottom
    - ✅ Status indicator (Listening/Copied)
    - ✅ Draggable window positioning
    - ✅ Position options: left/right/center
    - ✅ Vibrancy/blur effect for modern macOS look
    - ✅ Hover effects on suggestion cards
  - **Integration:**
    - `se_bot_main.py` orchestrates audio → transcription → RAG → overlay
    - Demo mode with simulated meeting transcript
    - Status check command to verify all components
  - **Usage:**
    - `python overlay_ui.py --test` - Demo mode
    - `python se_bot_main.py --demo` - Full system demo
    - `python se_bot_main.py --status` - Check components
  - ⚠️ Requires: `pip install pyobjc-framework-Cocoa pyobjc-framework-Quartz`

### [T475] SE-Bot Fase 2: Configurable Voice Output
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-31
- **Depends**: [T474]
- **Blocks**: [T476]
- **Priority**: P2
- **Notes**: ✅ Implemented ElevenLabs voice output module!
  - **Script**: `apps/se-bot/voice_output.py`
  - **Features:**
    - ✅ ElevenLabs TTS API integration
    - ✅ Multiple voice library (9 popular voices + full API catalog)
    - ✅ Voice settings presets (professional, expressive, calm, energetic)
    - ✅ Voice cloning support (paid plans only)
    - ✅ Audio caching to reduce API calls
    - ✅ Virtual microphone output (BlackHole) for meeting injection
    - ✅ Streaming mode for lower latency
    - ✅ macOS TTS fallback when no API key
    - ✅ Subscription info check
  - **Usage:**
    - `python voice_output.py --list-voices` - List available voices
    - `python voice_output.py --speak "Hello" --voice Rachel`
    - `python voice_output.py --output blackhole` - Output to virtual mic
    - `python voice_output.py --test` - Demo mode
  - **Integration:** Added to se_bot_main.py init
  - **Requirements:** ELEVENLABS_API_KEY env var, ffmpeg for audio decode

### [T476] SE-Bot Fase 3: Video Avatar Integration
- **Status**: TODO
- **Owner**: -
- **Depends**: [T475]
- **Blocks**: -
- **Priority**: P3
- **Notes**: 🎬 Avatar video real-time (come quello di Elon Musk!)
  - **Providers da valutare**:
    - HeyGen (API, real-time avatars)
    - Synthesia (enterprise, alta qualità)
    - D-ID (real-time, pricing OK)
  - **Features**:
    - Avatar che parla con lip sync
    - Espressioni facciali basate su sentiment
    - Virtual camera output (OBS Virtual Cam)
  - **Goal finale**: Partecipare a meeting video senza essere presente!

### [T477] SE-Bot: Install BlackHole Audio Driver
- **Status**: TODO
- **Owner**: -
- **Depends**: -
- **Blocks**: [T470]
- **Priority**: P0
- **Notes**: ⚠️ **RICHIEDE SUDO** - Mattia deve installare manualmente!
  - `brew install blackhole-2ch` (richiede password)
  - Configurare Multi-Output Device in Audio MIDI Setup
  - Test che audio di sistema passi attraverso BlackHole
  - Documentare setup per future reinstallazioni

### [T478] SE-Bot: Test embeddings search quality
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-29
- **Depends**: [T472]
- **Blocks**: -
- **Priority**: P2
- **Notes**: ✅ Embeddings search quality verified!
  - **Test script**: `apps/se-bot/test_search_quality.py`
  - **Results**: 10/10 queries passed (100% success rate)
  - **Score thresholds**: Top scores range 0.34-0.85 (>0.3 is good)
  - **Findings**:
    - ZTNA queries: excellent (0.65-0.85 relevance)
    - Competitive queries: good (0.34-0.46)
    - SD-WAN/SASE: very good (0.68-0.71)
  - **get_context_for_topic()**: Working (1649 chars context)
  - **Recommendations**: All tests pass, embeddings quality is good
  - **Fix**: Unique IDs using full relative path (not just filename stem)
  - **Report**: `apps/se-bot/search_quality_report.json`

### [T479] SE-Bot: Create meeting simulator for testing
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-31
- **Depends**: [T472], [T473]
- **Blocks**: -
- **Priority**: P2
- **Notes**: ✅ Implemented full meeting simulator!
  - **Script**: `apps/se-bot/meeting_simulator.py`
  - **Features:**
    - 10 sample scenarios (ZTNA, SD-WAN, competitive, objections, etc.)
    - RAG retrieval via ChromaDB + sentence-transformers
    - Latency tracking (<2s target)
    - Optional Claude API response generation (--with-claude)
    - Interactive mode for live testing
    - Batch mode for automated testing
    - JSON report output
  - **Test Results (2026-01-31):**
    - 10/10 scenarios passed
    - Avg latency: 0.17s (target: <2.0s) ✅
    - Max latency: 0.18s
    - Avg KB lookup: 0.025s
    - Top relevance scores: 0.28-0.75
  - **Usage:**
    - `python meeting_simulator.py` - Interactive mode
    - `python meeting_simulator.py --batch` - Run all scenarios
    - `python meeting_simulator.py --query "question"` - Single test
    - `python meeting_simulator.py --with-claude` - Enable Claude responses

### [T490] SE-Bot: Add security deep-dive content to knowledge base
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-31
- **Depends**: [T472]
- **Blocks**: -
- **Priority**: P2
- **Notes**: ✅ Added comprehensive security content to KB!
  - **Files created:**
    - `domains/security/threat-protection.md` - Ransomware, DLP, ATP, CASB
    - `domains/security/compliance.md` - HIPAA, PCI-DSS, GDPR, SOC 2, FedRAMP
  - **Content covers:**
    - ✅ Ransomware protection and lateral movement prevention
    - ✅ DLP (Data Loss Prevention) capabilities
    - ✅ CASB (Cloud Access Security Broker) features
    - ✅ Threat intelligence integration
    - ✅ SOC/SIEM integration and incident response
    - ✅ Compliance frameworks (HIPAA, PCI-DSS, GDPR, SOC 2, FedRAMP)
  - **KB now has 120 documents** (up from 78)
  - **Test results:**
    - Ransomware query: 0.66 relevance ✅
    - HIPAA query: 0.62 relevance ✅

### [T491] SE-Bot: Create response style templates
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-29
- **Depends**: [T479]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Implemented Claude prompt templates for different response styles!
  - **Location**: `apps/se-bot/prompts/`
  - **Templates created:**
    - `technical-deepdive.md` - For network engineers (detailed, protocol-level)
    - `executive-summary.md` - For C-level/business (ROI, outcomes)
    - `competitive-battle-card.md` - When competitor mentioned (fair positioning)
    - `objection-handling.md` - Empathetic + redirect (Feel-Felt-Found)
    - `demo-suggestion.md` - When interest detected (smooth transition)
  - **Loader module**: `prompts/loader.py` with:
    - `load_prompt()` / `format_prompt()` - Load and fill templates
    - `detect_style()` - Auto-detect style from transcript (keyword matching)
    - `detect_competitor()` - Identify mentioned competitors
    - `get_style_for_context()` - Simple wrapper for auto-detection
  - **Integration**: `meeting_simulator.py` updated with:
    - `--style` flag (auto|technical-deepdive|executive-summary|competitive-battle-card|objection-handling|demo-suggestion)
    - `--list-styles` flag to show available styles
    - Auto-detection when `--with-claude` enabled
    - Style and confidence shown in output
  - **Test results**: 100% detection accuracy on sample queries

### [T492] SE-Bot: Add meeting transcript logging for fine-tuning
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-29
- **Depends**: [T479]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Implemented meeting transcript logging!
  - **Logger module**: `apps/se-bot/meeting_logger.py`
  - **Features:**
    - Log interactions to JSONL: `data/se-bot/meeting-logs/YYYY-MM-DD.jsonl`
    - Includes: timestamp, scenario, transcript, KB results, response, latencies
    - `--anonymize` flag to redact emails, phones, IPs
    - `--feedback` flag to add 👍/👎 to interactions
    - `--log-stats` to show 7-day statistics
    - `--export-finetune PATH` to export for Claude fine-tuning
  - **Claude fine-tuning format:**
    - Messages array with user/assistant roles
    - Metadata: category, style, relevance, feedback
  - **Functions:**
    - `log_interaction()` - Log single interaction
    - `add_feedback()` - Add feedback to existing entry
    - `export_for_finetuning()` - Export filtered dataset
    - `get_log_stats()` - Get statistics
  - **Integration**: Added to meeting_simulator.py CLI

### [T769] SE-Bot: Test HeyGen API real-time latency
- **Status**: TODO
- **Owner**: -
- **Depends**: [T732]
- **Blocks**: [T770]
- **Priority**: P2
- **Notes**: Test HeyGen Avatar IV for real-time meeting use:
  - Sign up for HeyGen Creator tier ($29/mo)
  - Test Avatar IV real-time generation latency
  - Measure end-to-end: text input → video output
  - Target: <2s latency for conversational flow
  - Document findings in test report
  - Compare with D-ID streaming API as fallback

### [T770] SE-Bot: Build video_avatar.py API client module
- **Status**: TODO
- **Owner**: -
- **Depends**: [T769], [T475]
- **Blocks**: [T476]
- **Priority**: P2
- **Notes**: Create Python module for video avatar integration:
  - **File**: `apps/se-bot/video_avatar.py`
  - **Features:**
    - HeyGen API client (primary provider)
    - D-ID API client (fallback)
    - Voice input → avatar video generation
    - Sentiment-to-expression mapping
    - Output to virtual camera (OBS)
  - **Integration**: Connect to existing voice_output.py (T475)
  - **Testing**: Mock mode for development

### [T771] SE-Bot: Create Mattia voice profile for avatar
- **Status**: TODO
- **Owner**: -
- **Depends**: [T769]
- **Blocks**: [T476]
- **Priority**: P2
- **Notes**: Set up voice cloning for authentic avatar:
  - Record 3-5 min voice samples (various tones)
  - Upload to HeyGen voice cloning
  - Test cloned voice quality
  - Create backup in D-ID if HeyGen quality insufficient
  - Store voice profile ID in .env for SE-Bot

### [T480] Trading: Add portfolio-wide position concentration limits
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-31
- **Depends**: [T001]
- **Blocks**: -
- **Priority**: P2
- **Notes**: ✅ Implemented! Prevent over-concentration in correlated assets:
  - ✅ Max 50% of portfolio in any single asset class (crypto/weather)
  - ✅ Max 30% in highly correlated positions (e.g., BTC+ETH as "crypto" group)
  - ✅ Track total exposure across all open positions
  - ✅ Alert at 40% warning threshold (writes kalshi-concentration.alert)
  - ✅ Log concentration metrics in trade data (concentration_asset_pct, concentration_corr_group_pct)
  - ✅ Blocks trades that would exceed limits
  - ✅ Logs skipped trades to kalshi-skips.jsonl with concentration reason
  - ✅ Displays concentration summary each cycle

### [T481] Trading: Add rebalancing suggestions when concentration high
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-29
- **Depends**: [T480]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Implemented rebalancing suggestions!
  - **Function**: `get_rebalancing_suggestions()` + `print_rebalancing_suggestions()`
  - **Triggers**: When any asset/group exceeds 40% concentration warning
  - **Suggestions prioritized by**:
    - Oldest positions (free locked capital first)
    - Largest positions (biggest impact)
  - **Shows for each suggestion**:
    - Ticker, side, quantity to sell
    - Freed capital amount
    - Position age in hours
  - **Summary includes**:
    - Total freed capital
    - Projected concentration after rebalancing
  - **Integration**:
    - Shows in cycle summary when over-concentrated
    - Shows when trade blocked by concentration limits
    - Logged in skip data for analysis

### [T482] Trading: Historical concentration tracking dashboard widget
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-29
- **Depends**: [T480]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Implemented concentration history tracking!
  - ✅ Autotrader logs concentration snapshot each cycle to `data/trading/concentration-history.jsonl`
  - ✅ `push-stats-to-gist.py` includes concentration history in gist upload
  - ✅ `ConcentrationHistoryChart.tsx` dashboard widget with:
    - Line chart showing concentration by asset class over time
    - Time range filter (24h, 7d, 30d)
    - Warning threshold (40%) and max limit (50%) lines
    - Hover tooltips with detailed breakdown
    - Stats summary: max seen, time at warning, data points
  - ✅ Integrated into /betting page analytics section
  - Future: Add correlation with win/loss patterns (T483)

### [T483] Trading: Track correlation between BTC/ETH for smarter diversification
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-31
- **Depends**: [T480]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Implemented dynamic correlation tracking!
  - **Script**: `scripts/btc-eth-correlation.py` - fetches 7d price history, calculates Pearson correlation
  - **Data sources**: Binance (primary), CoinGecko (fallback)
  - **Output**: `data/trading/asset-correlation.json` with correlation value and limit recommendation
  - **Integration**: `kalshi-autotrader-v2.py` now uses `get_dynamic_crypto_correlation_limit()`
  - **Dynamic limits**:
    - Correlation ≥0.9 → 30% crypto limit (high risk)
    - Correlation 0.7-0.9 → 40% limit (medium)
    - Correlation 0.5-0.7 → 50% limit (normal)
    - Correlation <0.5 → 60% limit (good diversification)
  - **Current**: BTC/ETH correlation = 0.9075 (very high) → 30% limit enforced
  - **Caching**: 1h price cache to avoid API spam
  - When correlation is high (>0.9), treat BTC+ETH almost as single asset
  - Log correlation values in trade data for analysis

### [T484] Deploy onde.surf with concentration history widget
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-29
- **Depends**: [T482]
- **Blocks**: -
- **Priority**: P2
- **Notes**: ✅ Deployed! https://00f43697.onde-surf.pages.dev
  - ✅ Build + deploy via Wrangler OK
  - ✅ ConcentrationHistoryChart widget on /betting page
  - ⏳ Widget shows "No data yet" until concentration data populated
  - ✅ Site working (307 redirect to login as expected)

### [T485] Trading: Concentration vs win rate analysis
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-31
- **Depends**: [T482]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Implemented! `scripts/analyze-concentration-performance.py`:
  - Loads all trades from kalshi-trades-*.jsonl files
  - Classifies assets (crypto/weather/other)
  - Calculates retroactive concentration when no embedded data
  - Compares win rate when concentration >40% vs ≤40%
  - Tracks PnL by concentration level
  - Generates smart recommendations
  - Output: `data/trading/concentration-analysis.json`
  - **Initial findings**: 123 trades, 100% crypto concentration, 0% win rate → "diversify + review strategy"

### [T486] Push stats to gist with concentration history
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-29
- **Depends**: [T482]
- **Blocks**: [T484]
- **Priority**: P2
- **Notes**: ✅ Gist upload code in place!
  - ✅ `push-stats-to-gist.py` updated with `load_concentration_history()` function
  - ✅ Concentration history included in stats when data exists
  - ⏳ Data will populate after trading cycles with open positions run
  - ⏳ Dashboard widget shows "No data yet" until then (graceful fallback)

---

## 🎮 MOONLIGHT MAGIC HOUSE - DA MATTIA 2026-01-29

### [T461] Moonlight Magic House v2: Movimento + Oggetti Interattivi
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-29
- **Depends**: -
- **Blocks**: -
- **Priority**: P2
- **Notes**: ✅ COMPLETED! All 3 features implemented:
  1. **Più realismo nelle stanze** - ✅ IMPLEMENTED! Enhanced ambient effects
  2. **Moonlight si muove** - ✅ IMPLEMENTED! WASD + tap-to-move
  3. **Oggetti interattivi** - ✅ IMPLEMENTED! 20+ interactive objects
  - **Progress 2026-01-29 (interactive objects):**
    - ✅ Created `InteractiveObjects.tsx` component with 20+ objects across all rooms
    - ✅ Each room has 2-5 interactive objects (tablet, bookshelf, toybox, etc.)
    - ✅ Object types: mini-game triggers, rewards, stories, surprises
    - ✅ Cooldown system for reward objects
    - ✅ Level-lock system for advanced objects
    - ✅ Story modal for lore/narrative content
    - ✅ Visual feedback: glow, badges, animations
    - ✅ Sound integration
  - **Progress 2026-01-30 (movement system):**
    - ✅ WASD/Arrow key movement (desktop)
    - ✅ Tap-to-move (touch/mobile)
    - ✅ Walking animation while moving
    - ✅ Direction facing (flip sprite based on direction)
    - ✅ Smooth CSS transitions
  - **Progress 2026-01-29 (enhanced realism):**
    - ✅ Realistic sunlight rays (skewed light beams through windows)
    - ✅ Floating dust motes (8 particles with staggered animations)
    - ✅ Cinematic vignette effect (stronger at night)
    - ✅ Room-specific ambient effects:
      - Bedroom: warm cozy glow
      - Kitchen: steam rising from cooking
      - Garden: fireflies at night (6 particles)
      - Bathroom: moisture/steam overlay
      - Living Room: TV glow with flicker
      - Garage: industrial overhead light cone
      - Shop: glamour spotlights
      - Supermarket: fluorescent lighting with flicker
    - ✅ Window reflections (daylight only)
    - ✅ Depth shadows at floor level
    - ✅ Enhanced time-of-day lighting (golden hour, sunset, moonlight)
    - ✅ Mobile performance optimizations (fewer particles on small screens)
    - ✅ Accessibility: respects prefers-reduced-motion

---

## 🚨 NUOVO - DA CLAWD 2026-01-29 (17:32 HEARTBEAT)

### [T487] Deploy Moonlight House enhanced version to onde.la
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-29
- **Depends**: [T461]
- **Blocks**: -
- **Priority**: P2
- **Notes**: ✅ Deployed! https://d4aac734.onde-portal.pages.dev
  - Built static export with base path /static-games/moonlight-magic-house/
  - Copied all assets (backgrounds, character, sounds)
  - Deployed to Cloudflare Pages
  - Verified: https://onde.la/games/moonlight-magic-house/ returns 200 OK
  - All enhanced ambient effects now live!

### [T488] Moonlight House: Add ambient soundscapes per room
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-31
- **Depends**: [T461]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Implemented procedural ambient soundscapes using Web Audio API!
  - **Component**: `apps/moonlight-house/src/components/AmbientSoundscapes.tsx`
  - **Hook**: `useAmbientSoundscapes({ currentRoom, timeOfDay, isMuted, volume })`
  - **All 8 rooms have unique soundscapes:**
    - **Bedroom**: Soft music box tinkle, clock ticking, warm drone
    - **Kitchen**: Sizzling, bubbling pots, fridge compressor hum
    - **Garden**: Birds (morning), crickets (night), wind rustling - changes with timeOfDay!
    - **Living Room**: TV murmur, slow clock tick, cozy hum
    - **Bathroom**: Water dripping (echoey), steam hiss, reverb ambiance
    - **Garage**: Tool clanks, mechanical whir, distant engine idle
    - **Shop**: Glamorous sparkle chimes, soft piano notes, elegant vibe
    - **Supermarket**: Checkout beeps, cart squeaks, distant PA chimes
  - **Features:**
    - Procedural audio - no audio files needed!
    - Smooth crossfade between rooms
    - LFO modulation for natural movement
    - Convolver reverb for spatial depth
    - Dynamic accents with randomized timing
    - Respects existing mute/volume controls
    - Garden soundscape changes with time of day (birds→crickets)

### [T489] Moonlight House: Add more explorable areas (Attic & Basement)
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-31
- **Depends**: [T461]
- **Blocks**: [T728]
- **Priority**: P3
- **Notes**: ✅ Implemented Attic and Basement rooms!
  - **Attic** (🏚️ Soffitta):
    - Spooky/cozy atmosphere with dust and cobwebs CSS
    - Action: "Treasure hunt" - 30% chance of bonus coins!
    - Ambient: creaky floors, wind, mysterious chimes
    - 6 interactive objects incl. magic book (level 3 unlock)
  - **Basement** (🔧 Cantina):
    - Workshop theme with swinging industrial light
    - Action: "Build" - gain XP and happiness
    - Ambient: pipe clanks, furnace, dripping water
    - 6 interactive objects incl. secret door (level 5 unlock!)
  - Updated all 3 files: App.tsx, InteractiveObjects.tsx, AmbientSoundscapes.tsx
  - Added IT/EN translations for rooms, actions, messages
  - Explorer achievement now targets 8 rooms
  - Build passes ✅
  - ⏳ Future: Nursery, Patio rooms (separate task)

### [T728] Moonlight House: Deploy Attic & Basement to onde.la
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-30
- **Depends**: [T489]
- **Blocks**: -
- **Priority**: P2
- **Notes**: ✅ Deployed! https://5d2bce8b.onde-portal.pages.dev
  - ✅ Built static export (444 modules, 731ms)
  - ✅ Copied to apps/onde-portal/public/static-games/moonlight-magic-house/
  - ✅ Deployed via wrangler to Cloudflare Pages
  - ✅ Verified: https://onde.la/games/moonlight-magic-house/ returns 200 OK
  - Attic (🏚️ Soffitta) + Basement (🔧 Cantina) now live with all features!

### [T665] Deploy Moonlight House with ambient soundscapes to onde.la
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-29
- **Depends**: [T488]
- **Blocks**: -
- **Priority**: P2
- **Notes**: ✅ Deployed! https://6a54019d.onde-portal.pages.dev
  - Fixed 3 TypeScript build errors (hideMovementHint hoisting, SoundEffect type, vite plugin type)
  - Built static export with ambient soundscapes
  - Copied to onde-portal/public/static-games/moonlight-magic-house/
  - Deployed via wrangler to Cloudflare Pages
  - Verified: https://onde.la/games/moonlight-magic-house/ returns 200 OK
  - All 8 rooms have procedural Web Audio API soundscapes

### [T666] Moonlight House: Add ambient soundscape volume slider
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-29
- **Depends**: [T488]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Implemented ambient volume slider!
  - Added `ambientVolume` state separate from SFX volume
  - Independent slider next to mute button in header
  - Defaults to 50%, persists to localStorage
  - Disabled when muted (visual feedback)
  - Responsive: smaller on mobile
  - Gold gradient thumb, smooth hover effects
  - Deployed: https://cb2a5249.onde-portal.pages.dev

### [T667] Moonlight House: Add weather-based ambient variations
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-31
- **Depends**: [T488]
- **Blocks**: -
- **Priority**: P4
- **Notes**: ✅ Implemented real weather integration for immersive audio!
  - **New hook**: `src/hooks/useWeather.ts`
    - Fetches from wttr.in API (free, no key required)
    - Browser geolocation with IP fallback
    - Story weather when real weather disabled
    - 15-min auto-refresh
  - **Weather sound configs** in AmbientSoundscapes.tsx:
    - ✅ **Clear**: No extra sounds
    - ✅ **Rain**: Rain drops, puddle splashes, drone overlay
    - ✅ **Storm**: Heavy rain, thunder rumbles, thunder cracks, wind gusts
    - ✅ **Snow**: Muffled wind, crackling fireplace (stronger indoors)
    - ✅ **Hot**: Cicadas, AC hum, compressor cycles
    - ✅ **Windy**: Strong gusts, whistling, rattling, debris
    - ✅ **Cloudy**: Light wind gusts
  - **Room-aware intensity**: Outdoor rooms (garden) get full effect, indoor rooms get reduced
  - **UI toggle**: Weather button in header with LIVE badge when active
  - **Persistence**: Saves preference to localStorage
  - ⏳ Needs deploy to onde.la/games/moonlight-magic-house (T729)

### [T729] Moonlight House: Deploy weather integration to onde.la
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-31
- **Depends**: [T667]
- **Blocks**: -
- **Priority**: P2
- **Notes**: ✅ Deployed! https://a1eaf3e9.onde-portal.pages.dev
  - Weather-based ambient sounds now live
  - Weather toggle button with LIVE badge
  - Verified: https://onde.la/games/moonlight-magic-house/ returns 200 OK

### [T730] Reader VR: Run Playwright tests in CI with snapshot baselines
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-31
- **Depends**: [T725]
- **Blocks**: -
- **Priority**: P2
- **Notes**: ✅ Created GitHub Actions workflow for VR tests!
  - **Workflow**: `.github/workflows/vr-tests.yml`
  - **Triggers**: Push/PR to main on apps/reader-vr/**
  - **Steps:**
    - Checkout + Node 20 setup with npm cache
    - Install deps + Playwright Chromium
    - Run `npm test`
    - Upload playwright-report (always)
    - Upload test-results on failure
  - **Timeout**: 15 min
  - **Retention**: 30 days reports, 7 days failure screenshots

### [T731] Autotrader: Add hourly health check report to Telegram
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-30
- **Depends**: [T001]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Implemented hourly health report to Telegram!
  - **Script**: `scripts/autotrader-hourly-report.py`
  - **Cron**: `0 * * * *` (every hour)
  - **Features:**
    - Running status with PID (🟢/🔴)
    - Trades in last hour
    - 24h rolling win rate with emoji (🔥/✅/⚠️/❌)
    - 24h PnL with trend (📈/📉)
    - Portfolio value
    - Active alerts summary
    - Smart skip: no report if no changes and no activity
    - Saves last state to avoid spam
  - **Usage**: `python3 autotrader-hourly-report.py [--dry-run] [--verbose] [--force]`
  - **Env vars**: TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID

### [T732] SE-Bot: Create video avatar provider comparison doc
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-30
- **Depends**: [T476]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Created comprehensive video avatar provider comparison!
  - **Document**: `apps/se-bot/docs/VIDEO-AVATAR-COMPARISON.md`
  - **Providers compared**: HeyGen, D-ID, Synthesia
  - **Analysis includes:**
    - Pricing tiers and cost breakdown
    - Real-time streaming capability comparison
    - API features and documentation quality
    - Lip sync and voice cloning support
    - Languages and avatar customization
  - **Recommendation**: HeyGen (primary) for real-time Avatar IV
  - **Secondary**: D-ID for budget-conscious development
  - **Integration architecture** diagram included
  - **Cost estimate**: $29/mo for MVP testing

### [T733] Autotrader: Weekly performance summary report
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-30
- **Depends**: [T731]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Implemented weekly performance summary!
  - **Script**: `scripts/autotrader-weekly-report.py`
  - **Cron**: `0 20 * * 0` (Sunday 20:00 UTC / 12:00 PST)
  - **Features:**
    - Total trades (open/closed/settled)
    - Weekly win rate vs previous week with trend indicators
    - Weekly PnL vs previous week
    - Best/worst performing markets (min 2 trades to qualify)
    - Asset class breakdown (crypto/weather/event/other)
    - Auto-generated insights (concentration warnings, win rate alerts)
    - Portfolio value
    - Week-over-week comparison
  - **Usage**: `python3 autotrader-weekly-report.py [--dry-run] [--verbose] [--force]`
  - Supports both v1 and v2 trade log formats
  - Filters to actual trades only (ignores skips)

### [T734] Autotrader: Auto-restart with exponential backoff
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-30
- **Depends**: [T001]
- **Blocks**: -
- **Priority**: P2
- **Notes**: ✅ Improved watchdog-autotrader.sh with:
  - **State tracking**: JSON state file at /tmp/kalshi-watchdog-state.json
  - **Exponential backoff**: 1m → 2m → 4m → 8m → 16m → 30m max
  - **Stable reset**: Backoff resets after 1h of stable running
  - **Circuit breaker**: Trips if >3 restarts in 1 hour
    - Creates kalshi-circuit-breaker.alert
    - Stops auto-restart until manual intervention
  - **Uptime tracking**: Total uptime stats in state file
  - **Hourly restart counter**: Tracks restarts for circuit breaker
  - Prevents thrashing during API outages or persistent errors

### [T735] Dashboard: Add countdown timer for auto-refresh
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-31
- **Depends**: [T456]
- **Blocks**: -
- **Priority**: P4
- **Notes**: ✅ Implemented countdown timer for /health page auto-refresh!
  - ✅ Visual 30s countdown with circular SVG progress indicator
  - ✅ Countdown text showing seconds remaining
  - ✅ Pause on hover (turns yellow, shows ⏸) - prevents refresh while reading
  - ✅ Auto-resets after each refresh
  - ✅ Respects auto-refresh toggle
  - ✅ "Refreshing..." indicator during refresh
  - Build passes, ready for deploy

### [T736] Autotrader: Monthly performance summary report
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-30
- **Depends**: [T733]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Implemented monthly performance summary!
  - **Script**: `scripts/autotrader-monthly-report.py`
  - **Cron**: `0 12 1 * *` (1st of month, 12:00 UTC)
  - **Features:**
    - Total trades, win rate, PnL for the month
    - ROI calculation (PnL / invested)
    - Month-over-month comparison with trend indicators
    - Best/worst performing weeks within month
    - Asset class breakdown with per-class ROI
    - All-time cumulative stats
    - Auto-generated insights
  - **Usage**: `python3 autotrader-monthly-report.py [--dry-run] [--verbose] [--force] [--month N] [--year N]`
  - Supports both v1 and v2 trade log formats

### [T737] Dashboard: Add win rate trend sparkline to /betting
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-31 (discovered already implemented)
- **Depends**: [T482]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Already implemented!
  - **Component**: `apps/surfboard/src/components/WinRateSparkline.tsx`
  - **Integration**: Added to /betting page next to Win Rate stat card
  - **Features:**
    - Compact SVG sparkline (50x20px)
    - Color-coded: green if trending up, red if down
    - Uses parseWinRateTrendFromStats() to get data from trend API
    - Falls back to mock data when no data available
    - Optional trend icon (disabled in current integration)
  - Live at: https://onde.surf/betting (after login)

### [T738] Autotrader: Auto-archive old trade logs
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-31
- **Depends**: -
- **Blocks**: -
- **Priority**: P4
- **Notes**: ✅ Implemented trade log auto-archiving!
  - **Script**: `scripts/archive-trade-logs.py`
  - **Features:**
    - ✅ Archives files older than 90 days (configurable --days)
    - ✅ Compresses with gzip to archive/YYYY/ folder
    - ✅ Exports to CSV before archiving (--export-csv)
    - ✅ Dry-run mode to preview actions
    - ✅ Verbose output option
    - ✅ Preserves year-based organization
  - **Cron**: `0 10 1 * *` (1st of month, 02:00 PST)
  - **Usage:**
    - `python3 archive-trade-logs.py --dry-run` - Preview
    - `python3 archive-trade-logs.py --export-csv` - Archive + export
    - `python3 archive-trade-logs.py --days 60` - Custom retention

### [T739] Deploy onde.la with countdown timer on /health
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-31
- **Depends**: [T735]
- **Blocks**: -
- **Priority**: P2
- **Notes**: ✅ Deployed! https://e422ade3.onde-portal.pages.dev
  - ✅ Built and deployed onde-portal to Cloudflare Pages
  - ✅ Verified: https://onde.la/health/ returns 200 OK
  - Countdown timer with circular progress indicator now live

### [T740] Dashboard: Add countdown timer to /betting page
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-30
- **Depends**: [T735]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Ported countdown timer from /health to onde.surf /betting page!
  - ✅ Auto-refresh toggle (emerald switch)
  - ✅ 30-second countdown with circular SVG progress indicator
  - ✅ Pause on hover (turns yellow, shows ⏸)
  - ✅ "Refreshing..." indicator during fetch
  - ✅ localStorage persistence for auto-refresh preference
  - ✅ Reset countdown after each refresh
  - ✅ Deployed: https://29785e23.onde-surf.pages.dev
  - ✅ Verified: https://onde.surf/betting → 307 (auth redirect as expected)

### [T741] Health page: Add alert sound on status change
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-31
- **Depends**: [T460]
- **Blocks**: -
- **Priority**: P4
- **Notes**: ✅ Implemented alert sounds on status change!
  - **Hook**: `useAlertSound()` with Web Audio API
  - **Features:**
    - ✅ Toggle button (🔊/🔇) in health page header
    - ✅ Critical sound: Two-tone siren (880Hz/660Hz) on transition to DOWN
    - ✅ Warning sound: Soft beep (523Hz) on transition from healthy→degraded
    - ✅ Only plays on TRANSITION to critical/degraded, not every refresh
    - ✅ localStorage persistence for preference
    - ✅ Browser autoplay policy handled (context resume)
  - ✅ Deployed: https://a16750cf.onde-surf.pages.dev
  - ✅ Verified: https://onde.surf/health returns 200 OK

### [T742] Dashboard: Add keyboard hint badge to countdown timer
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-31
- **Depends**: [T740]
- **Blocks**: -
- **Priority**: P4
- **Notes**: ✅ Added 'R' kbd badge to refresh button on /betting page!
  - Show keyboard hint on desktop only (hidden sm:inline-block)
  - Consistent styling with health page
  - Tooltip already exists: "Refresh (R)"
  - Kbd element: px-1.5 py-0.5 text-[10px] font-mono bg-white/10 text-gray-400 rounded border border-white/20

### [T743] Dashboard: Show position age on open positions
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-31
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Implemented position expiry indicator on /betting page!
  - ✅ `parseTickerExpiration()` - parses KXBTCD/KXETHD ticker format (DDMMMYYHH)
  - ✅ `getPositionExpiryInfo()` - calculates time to expiry with color coding
  - ✅ `formatDuration()` - human-readable duration ("2h 15m", "3d 12h")
  - ✅ Visual indicator with Clock icon next to ticker
  - ✅ Color coding: green (>24h), yellow (4-24h), red (<4h with pulse animation)
  - ✅ Tooltip shows full expiry info
  - ✅ Build passes
  - ⏳ Needs deploy to onde.surf (see T745)

### [T744] Dashboard: Add quick stats comparison tooltip
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-02-01
- **Depends**: -
- **Blocks**: -
- **Priority**: P4
- **Notes**: ✅ Implemented hover tooltips for stat comparisons!
  - **Component**: `apps/surfboard/src/components/StatsComparisonTooltip.tsx`
  - **Features:**
    - ✅ Hover tooltip showing current vs previous values
    - ✅ Win Rate: current vs last week
    - ✅ Total PnL: this week vs last week
    - ✅ Today PnL: today vs yesterday
    - ✅ Today Win Rate: today vs yesterday
    - ✅ Toggle button "Compare" in header (desktop only)
    - ✅ localStorage persistence for preference
    - ✅ Default off to not overwhelm new users
    - ✅ Color-coded change indicators (green/red/neutral)
    - ✅ Percentage and absolute change display
    - ✅ Smooth hover animations
  - Build passes, needs deploy to onde.surf

### [T746] Dashboard: Deploy comparison tooltips to onde.surf
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-02-01
- **Depends**: [T744]
- **Blocks**: -
- **Priority**: P2
- **Notes**: ✅ Deployed! https://b3cff469.onde-surf.pages.dev
  - Build and deploy surfboard to Cloudflare Pages ✅
  - Site returns 307 redirect (auth protected) as expected
  - Comparison tooltips feature now live on /betting

### [T747] Dashboard: Add keyboard shortcut 'C' to toggle comparison tooltips
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-02-01
- **Depends**: [T744]
- **Blocks**: -
- **Priority**: P4
- **Notes**: ✅ Implemented keyboard shortcut for Compare toggle!
  - ✅ Press 'C' to toggle comparison tooltips on/off
  - ✅ Added to keyboard shortcuts modal
  - ✅ Added toggleCompare to useEffect dependencies
  - Build passes, needs deploy to onde.surf

### [T748] Dashboard: Add week-over-week trade count comparison
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-30
- **Depends**: [T744]
- **Blocks**: -
- **Priority**: P4
- **Notes**: ✅ Implemented trade count comparison tooltips!
  - ✅ Total PnL card: thisWeek.trades vs prevWeek.trades comparison
  - ✅ Today PnL card: todayTrades vs yesterdayTrades comparison
  - ✅ Hover hint styling (cursor-help, hover state)
  - ✅ Uses type="count" for proper integer formatting
  - Build passes, needs deploy to onde.surf

### [T768] Deploy onde.surf with trade count comparison tooltips
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-30
- **Depends**: [T748]
- **Blocks**: -
- **Priority**: P2
- **Notes**: ✅ Deployed! https://1231798a.onde-surf.pages.dev
  - ✅ Build via `npm run build:cf` - passed
  - ✅ Deploy via wrangler to Cloudflare Pages
  - ✅ Site returns 307 (auth redirect) as expected
  - Trade count comparison tooltips now live on /betting

---

## 🚨 NUOVO - DA CLAWD 2026-01-31 (16:00 HEARTBEAT)

### [T458] Deploy onde.la with auto-refresh toggle on /health
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-31
- **Depends**: [T456]
- **Blocks**: -
- **Priority**: P2
- **Notes**: ✅ Deployed! https://32e9d9dd.onde-portal.pages.dev
  - Auto-refresh toggle now live on onde.la/health
  - 16/17 tests passing (favicon.ico test is known false positive - we use SVG)
  - Deployed via wrangler pages deploy

### [T459] Health page: Add keyboard shortcut for manual refresh
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-29
- **Depends**: [T456]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Implemented! Press 'R' to trigger manual refresh on /health page.
  - Keyboard event listener added (skips when typing in inputs)
  - Shows `R` kbd element next to refresh button (desktop only)
  - Tooltip on button: "Press R to refresh"

### [T460] Health page: Browser notifications on status change
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-30
- **Depends**: [T456]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Implemented! Browser Notifications API integration:
  - **Toggle button** in header (🔔/🔕) with permission handling
  - **Permission states**: default (click to enable), granted, denied (shows Blocked)
  - **Detects status changes**: healthy↔degraded↔down transitions
  - **Smart notifications**: only on actual changes, not every refresh
  - **Tag deduplication**: prevents notification spam
  - **requireInteraction**: keeps "down" alerts visible until dismissed
  - **localStorage persistence**: remembers preference
  - **Keyboard shortcut**: R to refresh (already existed, added kbd hint)
  - Footer shows "🔔 Alerts enabled" when active

---

## 🚨 NUOVO - DA CLAWD 2026-01-31 (HEARTBEAT)

### [T446] Add health check JSON API for external monitoring
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-29
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Created `/api/health/status` endpoint!
  - **Location**: `apps/surfboard/src/app/api/health/status/route.ts`
  - **Returns JSON with:**
    - `autotrader`: running status, last cycle time, version
    - `sites.ondeLa/ondeSurf`: status code, latency, ok boolean
    - `trading`: win rate, PnL, trades today/total, last trade time
    - `alerts`: total 24h count, by type breakdown
    - `status`: overall health (healthy/degraded/critical)
  - **Caching**: 1 min public cache
  - **Status codes**: 200 (healthy/degraded), 503 (critical)
  - Ready for Uptime Robot or custom dashboards

### [T447] Deploy onde.surf with weather widget
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-31
- **Depends**: [T443]
- **Blocks**: -
- **Priority**: P2
- **Notes**: ✅ Deployed! WeatherPerformanceWidget now live on onde.surf/betting
  - Deploy URL: https://51993bc9.onde-surf.pages.dev
  - Site working with auth (307 redirect to login as expected)
  - Build + deploy via Wrangler OK

### [T448] Add PnL chart comparing weather vs crypto markets
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-30
- **Depends**: [T443]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Implemented! Created WeatherCryptoPnLChart component:
  - **Location**: `apps/surfboard/src/components/WeatherCryptoPnLChart.tsx`
  - **Features:**
    - SVG-based cumulative PnL line chart
    - 3 lines: Weather (amber), Crypto (blue), Combined (purple dashed)
    - Zero line reference for profit/loss visualization
    - Interactive legend with final PnL values
    - Summary stats grid (weather/crypto/total)
    - parsePnLByMarketType() helper to categorize trades
    - Mock data fallback for testing
  - **Theme-aware**: Works in light and dark mode
  - **Integration**: Added to /betting page after WeatherPerformanceWidget

### [T449] Deploy onde.surf with health/status API
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-29
- **Depends**: [T446]
- **Blocks**: -
- **Priority**: P2
- **Notes**: ✅ Deployed! https://0a328ab2.onde-surf.pages.dev
  - Both sites healthy (onde.la: 242ms, onde.surf: 318ms)
  - Endpoint live: `curl https://onde.surf/api/health/status | jq`
  - Returns JSON with sites, trading, alerts, autotrader status

### [T450] Add uptime history chart to /health page
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-29
- **Depends**: [T446]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Implemented full uptime monitoring system!
  - **Script**: `scripts/record-uptime.py` - records health checks every 5 min
  - **Component**: `apps/onde-portal/src/components/UptimeHistoryChart.tsx`
  - **Features:**
    - 24h uptime bar chart (one bar per hour, color-coded)
    - Uptime percentage badges (24h and 7d)
    - Average latency stats with color coding
    - Response time sparkline (24h trend)
    - Incident timeline showing recent downtime events
    - Incidents count (24h and 7d)
  - **Storage**: Local JSON + GitHub Gist for edge runtime access
  - **Cron**: `*/5 * * * *` for continuous monitoring
  - **Integration**: Added to /health page after Services section

### [T451] Add webhook notifications for critical alerts
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-29
- **Depends**: [T446]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Created `scripts/health-webhook-notifier.sh`!
  - Fetches /api/health/status every run
  - Only alerts on "critical" status (not degraded/healthy)
  - 30-min cooldown to avoid spam
  - Supports DISCORD_WEBHOOK and SLACK_WEBHOOK env vars
  - Creates health-critical.alert for heartbeat pickup
  - Cron: `*/5 * * * * /path/to/health-webhook-notifier.sh`
  - Tested: correctly detects degraded (no alert) vs critical (alert)

---

## 🚨 NUOVO - DA CLAWD 2026-01-29 (15:15)

### [T455] Add health alert history persistence to KV
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-30
- **Depends**: [T453]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Implemented! Health alert history API with KV storage:
  - **API endpoint**: `GET /api/health/alerts-history?days=7&limit=50`
  - **POST**: Store new alerts with status, affectedServices, message
  - **PATCH**: Mark alerts as resolved (tracks resolution time)
  - **KV namespace**: HEALTH_ALERTS_KV (id: 0afc4af3af8e48cd943be70bf3d06faf)
  - **Fallback**: Uses Gist webhookAlerts when KV not bound
  - **TTL**: 30 days auto-expiry
  - **Script**: `scripts/upload-health-alert-to-kv.sh` for CLI upload
  - **Webhook integration**: health-webhook-notifier.sh now uploads to KV
  - ⚠️ **Manual step**: Bind KV in Pages dashboard (Settings > Functions > KV bindings)

### [T456] Health dashboard: Add auto-refresh toggle
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-31
- **Depends**: [T446]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Implemented! /health page improvements:
  - Auto-refresh every 30s (toggleable switch in header)
  - Last refresh timestamp display in header and footer
  - Manual refresh button with loading/spinning state
  - Preference saved to localStorage (persists across sessions)
  - Visual toggle switch (green=on, gray=off)
  - Disabled refresh button while refreshing

### [T457] Autotrader: Add momentum divergence to trade decisions
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-29
- **Depends**: [T087]
- **Blocks**: -
- **Priority**: P2
- **Notes**: ✅ Integrated divergence signals into autotrader!
  - Uses existing `get_divergence_edge_adjustment()` function (was defined but never called)
  - Bearish divergence → bonus for NO bets, penalty for YES
  - Bullish divergence → bonus for YES bets, penalty for NO
  - Edge adjustment: +1-2% based on confidence level
  - Logged in trade data: divergence_bonus, divergence_aligned, divergence_type, divergence_reason
  - Verbose output shows divergence detection per asset each cycle

---

## 🚨 NUOVO - DA CLAWD 2026-01-29 (15:11)

### [T452] Add cron job for health-webhook-notifier.sh
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-29
- **Depends**: [T451]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Added to crontab!
  - Runs every 5 minutes
  - Logs to scripts/health-webhook.log
  - Supports TELEGRAM_BOT_TOKEN, DISCORD_WEBHOOK, SLACK_WEBHOOK env vars
  - 30-min cooldown to prevent spam

### [T453] Add Telegram integration to health webhook notifier
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-29
- **Depends**: [T451]
- **Blocks**: -
- **Priority**: P2
- **Notes**: ✅ Implemented! Extended health-webhook-notifier.sh:
  - Added Telegram Bot API support
  - Env vars: TELEGRAM_BOT_TOKEN + TELEGRAM_CHAT_ID
  - HTML parse mode for better formatting
  - Response validation with error logging
  - Works alongside Discord/Slack (can use all three)

### [T454] Create alert history dashboard widget
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-29
- **Depends**: [T451], [T428]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Implemented webhook alert history on /health page!
  - **New section**: "Webhook Alerts (7d)" showing critical health alerts
  - **Features:**
    - 7-day alert history (vs 24h for technical alerts)
    - Breakdown by affected service (onde.la, onde.surf, autotrader)
    - Alert timeline with timestamps
    - Visual distinction between site-down and autotrader issues
  - **Updated scripts:**
    - `health-webhook-notifier.sh` now records to `data/alerts/webhook-history.json`
    - `upload-alerts-to-gist.py` uploads webhook alerts to gist
  - **Integration**: Added webhookAlerts section to gist, displayed on /health page

---

## 🚨 NUOVO - DA CLAWD 2026-01-31 (14:38)

### [T443] Weather market performance widget on /betting
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-31
- **Depends**: [T422], [T424]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Implemented WeatherPerformanceWidget component!
  - **Component**: `apps/surfboard/src/components/WeatherPerformanceWidget.tsx`
  - **Features:**
    - Win rate for KXHIGH/KXLOW markets vs crypto comparison
    - NWS forecast accuracy tracking (shows ±2°F accuracy)
    - Best performing cities breakdown (NYC, MIA, DEN, CHI, etc.)
    - Weather vs Crypto edge comparison bar chart
    - City-level PnL and win rate stats
    - "Coming Soon" state when no weather trades yet
  - **Integration**: Added to /betting page after Model Comparison
  - **Parser**: parseWeatherPerformance() extracts weather trades from gist data
  - Also fixed lint errors in EdgeDistributionChart and LatencyTrendChart

### [T444] Current streak context indicator on /betting
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-31
- **Depends**: [T290], [T624]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Implemented StreakIndicator component!
  - **Compact badge** in header (🔥 3W or ❄️ 5L format)
  - **Full card** in analytics section with:
    - Best/Worst streak comparison
    - Intensity-based styling (low/medium/high/extreme)
    - Recommendations: "Tilt risk", "Hot streak", "Normal variance"
  - Color-coded: emerald for wins, red for losses
  - Uses longestWinStreak/longestLossStreak/currentStreak from gist

### [T445] API latency category breakdown widget
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-31
- **Depends**: [T398]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Implemented ApiLatencyChart component!
  - **Bar chart**: Shows all API categories (Binance, CoinGecko, Coinbase, Other)
  - **Per-category stats**: avg latency, p95 marker, max, call count
  - **Color coding**: green (<200ms), yellow (200-500ms), red (>500ms)
  - **Health indicator**: Overall avg with status badge
  - **Alert box**: Warns when any category has high latency
  - **Interactive**: Hover for detailed stats per bar
  - Uses apiLatency.categories from trading stats gist

---

## 🚨 NUOVO - DA CLAWD 2026-01-30 (14:05)

### [T440] WhisperFlow: Add language auto-detect display
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-30
- **Depends**: [T439]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Implemented language auto-detection display!
  - **Python VAD**: Updated to parse and output detected language from whisper-cpp
  - **TranscriptionManager**: Added detectedLanguage property, parses output for language
  - **MenuBarView**: Shows language flag emoji when auto-detect enabled (🇬🇧🇮🇹🇪🇸🇫🇷🇩🇪etc)
  - **OverlayView**: Shows language flag next to recording indicator
  - Only displays when language setting is "auto" (not when manually set)
  - Supports 15 languages with flag emojis

### [T441] Autotrader: Add position size limits per asset
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-29
- **Depends**: [T001]
- **Blocks**: -
- **Priority**: P2
- **Notes**: ✅ Implemented per-asset position sizing!
  - **ASSET_CONFIG dict**: Centralized config for Kelly fraction, max position %, min edge
  - **BTC**: 5% Kelly, 3% max position, 10% min edge (standard)
  - **ETH**: 4% Kelly, 2.5% max position, 12% min edge (more volatile)
  - **Weather**: 8% Kelly, 2% max position, 10% min edge (NWS reliable)
  - **Default**: 3% Kelly, 2% max position, 15% min edge (conservative for unknowns)
  - **get_asset_config()**: Helper function with fallback to default
  - **Logging**: Trade data now includes per-asset kelly_fraction_base and max_position_pct
  - **Display**: Shows per-asset config in trade output (e.g. "📊 BTC Kelly: 5.0% | Max: 3.0%")

### [T442] Daily test suite: Add visual regression tests
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-29
- **Depends**: [T413], [T417]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Integrated visual regression into daily test suite!
  - **run_visual_regression_tests()**: New method in TestSuite class
  - **Timing**: Only runs between 11:00-13:00 (1x/day at noon)
  - **Subprocess**: Calls visual-regression-tests.py with 2-min timeout
  - **Report parsing**: Reads visual-regression-report.json for detailed results
  - **Error handling**: Graceful fallback on timeout or missing script
  - **Dashboard**: Results appear in TestStatusPanel alongside other tests

---

## 🚨 NUOVO - DA CLAWD 2026-01-29 (21:15)

### [T431] Deploy onde.la with health page alert summary
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-29
- **Depends**: [T428]
- **Blocks**: -
- **Priority**: P2
- **Notes**: ✅ Deployed! Alert History (24h) section now live on onde.la/health. Deploy via wrangler (project: onde-portal). Note: Tests pass 16/17 - favicon.ico test fails because we use SVG favicon, not ICO.

### [T432] Add alert type filter to /health page
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-30
- **Depends**: [T428]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Added filter buttons to Alert History section! 5 filters: All, Divergence, Regime, Volatility, Whipsaw. Each shows count, color-coded when active, filtered alerts list updates dynamically. Mobile-friendly with flex-wrap.

### [T433] Add upload-alerts-to-gist.py health monitoring
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-30
- **Depends**: [T428]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Created `scripts/watchdog-alerts-upload.sh`:
  - Checks if Gist alerts section has been updated in last 2h
  - Uses gh CLI to avoid GitHub's raw file cache
  - Creates `alerts-upload-stale.alert` if stale
  - 2h cooldown to avoid spam
  - Also fixed upload-alerts-to-gist.py to use GitHub API directly (gh gist edit is interactive)

---

## 🚨 NUOVO - DA CLAWD 2026-01-29 (13:10)

### [T428] Add alert summary to /health page
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-29
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Implemented! 
  - Created `scripts/upload-alerts-to-gist.py` - aggregates alerts from data/finetuning/*.jsonl and uploads to Gist
  - Added Alert History (24h) section to /health page
  - Displays: alert count, type badges (divergence/regime/vol/whipsaw), severity, timestamps
  - Color-coded: green (0 alerts), yellow (1-5), red (6+)
  - Scrollable list with max 10 displayed
  - Run hourly via cron to keep alerts fresh

### [T429] Autotrader v2 trade count dashboard widget
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-30
- **Depends**: [T277]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Already implemented! ModelComparisonChart component on betting page shows v1 vs v2 trade counts, win rates, and PnL side-by-side. Data fetched from GitHub Gist. Currently shows v2 trades: 0 because autotrader v2 is conservative (high MIN_EDGE threshold). Will populate automatically when v2 makes trades.

### [T430] Test visual baselines need auto-commit when updated
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-30
- **Depends**: [T417]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Added auto_commit_baselines() function to visual-regression-tests.py. When running `--update-baseline`, automatically: git add baselines, commit with timestamp, push to origin. Use `--no-commit` flag to skip. Includes proper error handling for each git step.

---

## 🚨 NUOVO - DA CLAWD 2026-01-29 (13:07)

### [T425] Use LastUpdatedIndicator in TestStatusPanel
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-29
- **Depends**: [T322]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Updated TestStatusPanel to use shared LastUpdatedIndicator component. Removed local getTimeAgo() function. Now shows staleness indicator with refresh button when report is >1h old. Also fixed unused import lint error in LastUpdatedIndicator.tsx.

### [T426] Update Cloudflare API token with D1 permissions
- **Status**: TODO
- **Owner**: -
- **Depends**: -
- **Blocks**: [T661]
- **Priority**: P1
- **Notes**: MANUAL: Current API token lacks D1:read/write permissions. Go to Cloudflare Dashboard → API Tokens → Edit token → Add D1 permissions. Required for running D1 migrations (T661).

### [T427] Add cache diagnostic panel to /health page
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-30
- **Depends**: [T322]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Added Cache Diagnostics panel to /health page! Shows: total entries, cache size, cache buckets count, stale entries (>24h). Per-bucket breakdown with entry details: URL path, content type, age, size. Samples up to 20 entries per bucket. Auto-refreshes every 2min. Helps diagnose PWA caching issues.

---

## 🚨 NUOVO - DA MATTIA 2026-01-29 (09:43)

### [T413] Test Suite: Run 2x/day + Dashboard Integration
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-29
- **Depends**: -
- **Blocks**: -
- **Priority**: P1
- **Notes**: ✅ Implemented comprehensive daily test suite!
  - **Script**: `scripts/daily-test-suite.py`
  - **Tests (14 total):**
    - onde.la: Homepage, /libri, /catalogo, /about, /health, RSS, SSL, Performance, Content, API Health
    - onde.surf: Auth redirect, Login page, SSL, Performance
  - **Cron**: 09:00 and 21:00 PST (17:00 and 05:00 UTC)
  - **Dashboard**: TestStatusPanel component on onde.surf
  - **API**: /api/test-status (fetches report from GitHub)
  - **Alert**: test-failure.alert for heartbeat pickup
  - All 14 tests passing

---

## 🚨 NUOVO - DA CLAWD 2026-01-29 (11:15)

### [T419] Analyze news sentiment effectiveness on trade performance
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-29
- **Depends**: [T661]
- **Blocks**: -
- **Priority**: P2
- **Notes**: ✅ Implemented! Created `scripts/analyze-news-effectiveness.py`:
  - Categorizes trades: news-aligned, news-conflicting, neutral
  - Calculates win rate delta between categories
  - Tracks PnL by category
  - Auto-generates recommendations based on data
  - Output: `data/trading/news-effectiveness.json`
  - Currently awaiting v2 trades with news sentiment data (41 existing trades are from v1)

### [T420] Add RSS feed parsing for crypto news (free alternative)
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-29
- **Depends**: -
- **Blocks**: -
- **Priority**: P2
- **Notes**: ✅ Implemented! Created `scripts/fetch-crypto-rss.py`:
  - **Sources**: CoinDesk, CoinTelegraph, Bitcoin Magazine, Decrypt
  - **Caching**: 30-min TTL in `data/crypto-news-feed.json`
  - **Integration**: crypto-news-search.py now uses RSS as fallback
  - **Tested**: Detected BEARISH sentiment from "plunge" keywords in headlines
  - No API key required - works immediately!

### [T421] Autotrader dry-run mode with simulated PnL
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-29
- **Depends**: -
- **Blocks**: -
- **Priority**: P2
- **Notes**: ✅ Implemented! Created `scripts/dryrun-settlement-tracker.py`:
  - Simulated portfolio tracking ($10 initial capital)
  - Settlement simulation using CryptoCompare + CoinGecko historical prices
  - Compares dry-run PnL vs real trading performance
  - Outputs to `data/trading/dryrun-portfolio.json`
  - Updates trade log with settlement results
  - Usage: `python3 scripts/dryrun-settlement-tracker.py` or `--compare` for real vs dry-run comparison

---

## 🚨 NUOVO - DA MATTIA 2026-01-29 (09:36)

### [T412] VERIFICARE che logging memoria FUNZIONI DAVVERO
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-29
- **Depends**: -
- **Blocks**: -
- **Priority**: P0
- **Notes**: ✅ **RISOLTO 2026-01-29 12:15**
  - **Logging manuale**: ✅ FUNZIONA (Write tool scrive i file)
  - **Ricerca semantica**: ❌ Disabilitata (no embeddings API key)
  - **Workaround**: ✅ `scripts/memory-grep.sh "query"` per ricerca testuale
  - Vedi T414 per dettagli workaround

### [T414] 🚨 FIX memory_search - Aggiungere API key o fallback grep
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-29
- **Depends**: -
- **Blocks**: -
- **Priority**: P0
- **Notes**: ✅ WORKAROUND IMPLEMENTATO!
  - **Problema**: memory_search disabilitato (no embeddings API key)
  - **Soluzione**: Creato `scripts/memory-grep.sh` - fallback grep-based
  - **Usage**: `./scripts/memory-grep.sh "search terms"`
  - Cerca in MEMORY.md + memory/*.md files
  - Mostra file:linea:match per ogni risultato
  - **Per abilitare semantic search** (opzionale, costa):
    - `clawdbot agents add main` → aggiungi OPENAI_API_KEY
  - **Workaround funziona senza API key!**

---

## 🚨 NUOVO - DA MATTIA 2026-01-29 (09:32)

### [T411] Clone WhisperFlow - App Trascrizione Real-Time Open Source
- **Status**: IN_PROGRESS
- **Owner**: @clawd
- **Depends**: -
- **Blocks**: [T434], [T435], [T436]
- **Priority**: P1
- **Notes**: Creare app simile a WhisperFlow (menu bar Mac, live transcription). **VISIONE FUTURA: Vibe coding in VR!**
  - **✅ Research completed (2026-01-30):**
    - Installed whisper-cpp via Homebrew
    - Downloaded ggml-base.bin model (147MB)
    - **Benchmark: 0.35x RTF = 3x faster than real-time!**
    - Created CLI prototype: `apps/whisperflow/whisperflow-cli.py`
    - Research doc: `data/research/whisperflow-research-2026-01-30.md`
  - **✅ VAD integration (2026-01-29 13:48):**
    - Installed Silero VAD with PyTorch
    - Created `apps/whisperflow/whisperflow-vad.py`
    - Voice-activated transcription working!
    - Python venv with torch, torchaudio, sounddevice
    - README.md with full documentation
  - **Tech stack (decided):**
    - **Whisper.cpp** ✅ - Installed, benchmarked, works great
    - **Silero VAD** ✅ - Integrated for voice detection
    - SwiftUI for menu bar app
  - **Features MVP:**
    - [x] CLI prototype with transcription
    - [x] Benchmark on M1 Pro
    - [x] Streaming mode with VAD ✅
    - [x] Menu bar app (macOS) ✅ (T434)
    - [x] Global hotkey ⌘⇧T ✅ (T435)
    - [ ] Copy to clipboard overlay (T436)
  - **Future (VR ready):**
    - [ ] Streaming ASR (while speaking)
    - [ ] Multi-language
    - [ ] Speaker diarization
  - Se funziona → rilasciare gratis/freemium

### [T434] WhisperFlow: Create macOS menu bar app (SwiftUI)
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-30
- **Depends**: [T411]
- **Blocks**: -
- **Priority**: P2
- **Notes**: ✅ Created native SwiftUI menu bar app!
  - **Location**: `apps/whisperflow/WhisperFlowApp/`
  - **Features:**
    - Menu bar icon with popover panel
    - Start/Stop recording button
    - Live transcription display
    - Copy to clipboard + clear buttons
    - Settings panel (language, VAD threshold, device)
    - Integration with Python VAD backend
  - **Build**: `cd WhisperFlowApp && swift build -c release`
  - **Run**: `.build/release/WhisperFlowApp`

### [T435] WhisperFlow: Add global hotkey support
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-30
- **Depends**: [T434]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Global hotkey implemented!
  - **Hotkey**: ⌘⇧T (Cmd+Shift+T)
  - **Action**: Toggle recording from anywhere
  - **Tech**: Carbon API (EventHotKey)
  - Works even when app is in background

### [T436] WhisperFlow: Add text overlay mode
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-30
- **Depends**: [T434]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Floating overlay implemented!
  - **OverlayWindow.swift**: NSPanel-based floating window (stays on top, all spaces)
  - **OverlayView.swift**: Semi-transparent HUD with live transcription
  - **Features:**
    - Draggable position (click and drag anywhere)
    - Position presets: Top or Bottom of screen
    - Adjustable opacity (30%-100%)
    - Recording indicator with pulse animation
    - Copy to clipboard on hover
    - Shows last 200 chars of transcription
    - Hotkey hint when idle
  - **Settings**: Position picker + opacity slider in Settings panel
  - **Toggle**: Button in menu bar popover

### [T437] WhisperFlow: Launch at Login option
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-30
- **Depends**: [T434]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Implemented!
  - **LaunchAtLoginManager.swift**: Uses SMAppService (macOS 13+)
  - **Features:**
    - Toggle in Settings panel
    - Automatic status detection
    - Deep link to System Settings if approval required
    - Graceful fallback message for macOS 12 and earlier
  - **Usage**: Settings → Startup → Toggle "Launch at Login"

### [T438] WhisperFlow: Audio device hot-swap support
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-30
- **Depends**: [T434]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Full CoreAudio hot-swap implemented!
  - **AudioDeviceManager.swift**: CoreAudio device enumeration + change listener
  - **Features:**
    - Real-time device list with default indicator
    - Auto-switch to newly connected devices (AirPods, mics)
    - System notifications on device connect/disconnect
    - Current device indicator in menu bar
    - Manual refresh button
    - Toggle for auto-switch behavior
  - **Uses**: UserNotifications framework (modern API)
  - **Settings**: Device picker + auto-switch toggle in Audio section

### [T439] WhisperFlow: Export transcription history
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-30
- **Depends**: [T434]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Implemented! Full transcription history system:
  - **TranscriptionHistoryManager.swift**: Manages history persistence and export
  - **Persistence**: Saves to ~/Library/Application Support/WhisperFlow/transcription-history.json
  - **Export formats**: Plain text (.txt), Markdown (.md), JSON (.json)
  - **Auto-save**: Optional daily file append on recording stop
  - **UI**: History list in menu bar, export button, settings panel
  - **Settings**: Export format picker, location selector, clear history (with confirm)
  - **Stats**: Entry count, total word count displayed
  - History persists between app restarts

---

## ✅ COMPLETATO - DA MATTIA 2026-01-29 (09:42)

### [T413] Test periodici automatici per siti (health check, auth, links)
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-29
- **Depends**: -
- **Blocks**: -
- **Priority**: P1
- **Notes**: ✅ Script: `scripts/periodic-site-tests.sh`. Cron ogni 30min.
  - **Test implementati (13 totali):**
    - ✅ HTTP status check per tutti endpoint onde.la (/, /libri, /catalogo, /about, /health, /feed.xml)
    - ✅ Auth redirect check onde.surf (deve essere 307 → login)
    - ✅ Login page accessibile
    - ✅ Response time (<3s threshold)
    - ✅ SSL certificate validity (warning <30d, critical <7d)
    - ✅ Content check (verifica testo "Onde" presente)
    - ✅ API health check (/api/health/cron)
    - ✅ Link integrity check (2x al giorno, ore 00 e 12)
  - **Alert files:**
    - `onde-la-down.alert` - endpoint critico down
    - `onde-surf-auth-broken.alert` - auth non funziona
    - `ssl-expiring.alert` / `ssl-critical.alert` - certificato in scadenza
    - `broken-links.alert` - link rotti rilevati
  - **Output:** JSON report in `scripts/site-health-report.json`

---

## 🚨 NUOVO - DA CLAWD 2026-01-29 (10:15)

### [T415] Deploy onde.surf dopo modifiche Test Status Panel
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-29
- **Depends**: [T413]
- **Blocks**: [T418]
- **Priority**: P1
- **Notes**: ✅ Deployed! TestStatusPanel live su onde.surf.
  - Fixed ModelComparisonChart unused var lint error
  - Added /api/test-status to publicRoutes middleware
  - Build+deploy with Wrangler OK
  - ⚠️ **API shows fallback data** - GitHub repo is private, raw.githubusercontent.com returns 404
  - **NEW TASK T418**: Configure GitHub token or alternative data source

### [T418] Configure Test Status data source for onde.surf
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-29
- **Depends**: [T415]
- **Blocks**: -
- **Priority**: P2
- **Notes**: ✅ Implemented Cloudflare KV storage for test reports!
  - Created KV namespace: `TEST_REPORTS` (id: 4c58636ecde440cf9ac910cccce98690)
  - Updated API: GET reads from KV, POST writes to KV
  - Created upload script: `scripts/upload-test-report.sh`
  - Updated daily-test-suite.py to auto-upload after test run
  - Dashboard now shows real test data (14 tests passing)

### [T416] Autotrader: web search per dati fondamentali pre-trade
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-29
- **Depends**: [T661]
- **Blocks**: -
- **Priority**: P1
- **Notes**: ✅ Completed as part of T661! 
  - News search module: `scripts/crypto-news-search.py`
  - Integration in `kalshi-autotrader-v2.py`: get_crypto_sentiment() called each cycle
  - Edge adjustment: ±2% based on bullish/bearish news
  - Logged in trade data: news_bonus, news_sentiment, news_confidence, news_reasons
  - To enable web search: set BRAVE_API_KEY env var

### [T417] Test Suite: add Playwright visual regression tests
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-29
- **Depends**: [T413]
- **Blocks**: -
- **Priority**: P2
- **Notes**: ✅ Implemented! Created `scripts/visual-regression-tests.py`:
  - **Pages tested (7)**: homepage, libri, catalogo, about, surf-login + mobile variants
  - **Baselines**: `test-results/visual-baselines/` (7 PNGs created)
  - **Comparison**: File hash + size diff (threshold 5%)
  - **Alert**: `scripts/visual-regression.alert` on failure
  - **Usage**: 
    - `python3 scripts/visual-regression-tests.py` - Run comparison
    - `python3 scripts/visual-regression-tests.py --update-baseline` - Update baselines
  - All 7 tests passing!

---

## 🔥 IN PROGRESS

### [T001] Autotrader Kalshi Monitoring
- **Status**: IN_PROGRESS
- **Owner**: @clawd
- **Depends**: -
- **Blocks**: -
- **Priority**: P1
- **Notes**: Watchdog attivo, monitorare win rate

---

## 🚨 URGENTE - DA MATTIA 2026-01-29

### [T405] Watchdog onde.surf auth check ogni 20 min
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-29
- **Depends**: -
- **Blocks**: -
- **Priority**: P1
- **Notes**: ✅ Script: watchdog-onde-surf-auth.sh. Cron */20 min. Verifica che onde.surf richieda auth (307 redirect). Se restituisce 200 → alert P0 + task per fixare. Alert file: onde-surf-auth-broken.alert

### [T406] Rimuovere fake reviews/testimonials da onde.la
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-29
- **Depends**: -
- **Blocks**: -
- **Priority**: P1
- **Notes**: ✅ Rimossi testimonials finti (Sarah M., David L., Emily R., Marcus T.) da page.tsx. MAI PIÙ fake reviews!

### [T407] Bug: Agenti FRH non prendono task da onde.surf
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-29
- **Depends**: -
- **Blocks**: -
- **Priority**: P1
- **Notes**: ✅ ROOT CAUSE: onde.surf agent-executor API was blocked by middleware AND used wrong CF context import. FIX: 1) Added /api/agent-executor to publicRoutes in middleware.ts, 2) Fixed import from @opennextjs/cloudflare to @cloudflare/next-on-pages, 3) Created trigger-onde-surf-executor.sh for cron automation. ⚠️ MANUAL CONFIG NEEDED: Set ANTHROPIC_API_KEY in Cloudflare Pages → Settings → Environment Variables → Add secret. Then cron every 5min will auto-process tasks.

### [T661] 🚨 IMPLEMENTARE STRATEGIA GROK "FUNDAMENTAL" - FARE SOLDI!
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-29
- **Depends**: -
- **Blocks**: -
- **Priority**: P0
- **Notes**: ✅ Implemented! Created `scripts/crypto-news-search.py` module and integrated into autotrader-v2.py:
  - **News sentiment analysis** with bullish/bearish/neutral classification
  - **Keyword matching** for high-impact events (ETF approvals, Fed, hacks, etc.)
  - **Scheduled event awareness** (FOMC dates, CPI releases)
  - **Edge adjustment**: ±2% based on sentiment confidence
  - **Trade logging**: news_sentiment, news_confidence, news_reasons tracked per trade
  - **Caching**: 15-min cache to avoid repeated searches
  - **Graceful fallback**: Works without Brave API key, just returns neutral
  - **Integration**: YES bets get bonus from bullish news, NO bets from bearish

---

## 🚨 URGENTE - DA MATTIA 2026-01-28

### [T090] Creare REGOLE-AGENTI.md
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-29
- **Depends**: -
- **Blocks**: -
- **Priority**: P0
- **Notes**: ✅ Creato! 3 regole: Git (pull/push), Procedure (segui docs), Task extraction (estrai da conversazioni).

### [T091] Creare agente PM per review task
- **Status**: DUPLICATE
- **Owner**: @clawd
- **Completed**: 2026-01-29
- **Depends**: [T090]
- **Blocks**: -
- **Priority**: P1
- **Notes**: ⚠️ DUPLICATE di T402 (già completato 2026-01-28). PM Review già eseguita.

### [T400] Rollback onde.surf a PRIMA di Google Auth
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-28
- **Depends**: -
- **Blocks**: [T401]
- **Priority**: P0
- **Notes**: ✅ Rimosso auth(), sito ora pubblico. Deploy OK via Wrangler.

### [T401] Migrare onde.surf a stesso approccio di onde.la
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-28
- **Depends**: [T400]
- **Blocks**: -
- **Priority**: P0
- **Notes**: ✅ Middleware semplificato (no auth redirect), tutto pubblico come onde.la.

### [T402] Creare agente PM per review task/dipendenze/priorità
- **Status**: DONE
- **Owner**: @pm-agent
- **Completed**: 2026-01-28
- **Depends**: -
- **Blocks**: -
- **Priority**: P1
- **Notes**: ✅ PM Review completata! Report: memory/pm-review-2026-01-28.md. Analizzati 377 task, verificate dipendenze, identificati 2 blocked, 3 duplicati gestiti, 3 priorità da rivedere.

### [T403] Creare procedura ROLLBACK per deploy
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-28
- **Depends**: -
- **Blocks**: -
- **Priority**: P1
- **Notes**: ✅ Aggiunta sezione ROLLBACK a DEPLOY-PROCEDURES.md. 3 metodi: CF Dashboard, Git Revert, Wrangler.

### [T404] Fix onde.surf still redirecting to /login
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-29
- **Depends**: [T351]
- **Blocks**: -
- **Priority**: P0
- **Notes**: ✅ Regression fix! T351 fixed middleware but page.tsx still had auth() check. Removed auth import and session check from page.tsx. Now truly public. curl -sI https://onde.surf returns HTTP 200.

---

## 🤖 TODO - AI TRADING RESEARCH (DA MATTIA 2026-01-29)

### [T408] Ricerca metodi Grok su piattaforme prediction market
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-29
- **Depends**: -
- **Blocks**: [T409], [T410]
- **Priority**: P1
- **Notes**: ✅ COMPLETED! Full analysis in `data/research/predictionarena-analysis-2026-01-29.md`
  - **DEBUNKED:** Grok-4-1 has -15.94% return (WORST on leaderboard!)
  - **KEY FINDING:** Only 1 model is profitable (Mystery Model Alpha +10.61%)
  - **CRITICAL INSIGHT:** Winning strategy uses WEATHER MARKETS, not crypto!
  - **Edge Source:** NWS forecast accuracy + favorite-longshot bias
  - **Recommendation:** Add weather markets to autotrader (KXNYC, KXMIA, KXDEN)

### [T409] Replicare/migliorare strategie top modelli su Kalshi
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-29
- **Depends**: [T408]
- **Blocks**: -
- **Priority**: P1
- **Notes**: ✅ COMPLETATO via T422/T423!
  - ✅ Research done in T408 - winning strategy uses WEATHER markets!
  - ✅ Weather markets integrated into autotrader (T422, T423)
  - ✅ NWS forecast-based edge calculation
  - ✅ Favorite-longshot bias exploitation

### [T422] Add weather markets to autotrader (KXNYC, KXMIA, KXDEN)
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-29
- **Depends**: [T408]
- **Blocks**: -
- **Priority**: P0
- **Notes**: ✅ FULLY INTEGRATED! Based on PredictionArena research - weather markets have REAL edge!
  - ✅ **Module created**: `scripts/nws-weather-forecast.py`
  - ✅ **NWS API integration**: Fetches forecasts for NYC, MIA, DEN, CHI, LAX, HOU, AUS, PHI, SFO
  - ✅ **Probability model**: Normal distribution with forecast ±2-3°F uncertainty
  - ✅ **Edge calculator**: Compares our probabilities vs Kalshi prices
  - ✅ **Finding real edges**: Jan 30 NYC markets showing 15-25% edges!
  - ✅ **Integrated into autotrader**: `kalshi-autotrader-v2.py` now scans weather markets
  - ✅ **Weather-specific Kelly**: 8% Kelly (higher than crypto - NWS forecasts reliable)
  - ✅ **Time filter**: Only trades <48h to settlement (highest NWS accuracy)
  - ✅ **Cities**: NYC, MIA, DEN, CHI enabled (configurable via WEATHER_CITIES)
  - Edge source: NWS forecast accuracy + favorite-longshot bias

### [T423] Implement NWS weather forecast integration
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-29
- **Depends**: [T422]
- **Blocks**: -
- **Priority**: P1
- **Notes**: ✅ MERGED INTO T422! All NWS integration completed:
  - ✅ API: api.weather.gov (free, no key needed)
  - ✅ NYC: Central Park station
  - ✅ Miami: Miami International Airport
  - ✅ Denver: Denver International Airport
  - ✅ Parse high/low temp forecasts
  - ✅ Settlement uses OFFICIAL NWS Climatological Reports
  - ✅ 30-min cache to reduce API calls
  - See T422 for full implementation details

### [T410] Monitorare altre piattaforme AI prediction markets
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-29
- **Depends**: [T408]
- **Blocks**: -
- **Priority**: P2
- **Notes**: ✅ Initial monitoring report created! See `data/research/ai-prediction-platforms-2026-01-29.md`
  - **PredictionArena (Kalshi):** Only 1/6 AI models profitable, weather markets key
  - **Polymarket AI:** High volume ($28m+), Google dominates model rankings, monthly recurring markets
  - **Rallies.ai:** AI investing platform (needs deeper investigation)
  - **Key insight:** Cross-platform arbitrage potential, monthly AI model markets for momentum plays
  - Set up weekly monitoring cadence

---

## 📋 TODO - TRADUZIONI

### [T010] Installare modello traduzione su M4 Mac
- **Status**: DONE
- **Owner**: @ondinho
- **Completed**: 2026-01-28
- **Depends**: -
- **Blocks**: [T011], [T012], [T013]
- **Priority**: P1
- **Notes**: ✅ NLLB-200 (facebook/nllb-200-distilled-600M) installato. Script: ~/clawd/translator.py

### [T011] Tradurre libro Capussela IT→EN
- **Status**: DONE
- **Owner**: @ondinho
- **Completed**: 2026-01-28
- **Depends**: [T010]
- **Blocks**: -
- **Priority**: P2
- **Notes**: ✅ Già completato in T102! File: traduzioni/capussela-spirito-EN.txt (1622 righe). "Capussela spirito" = "Republic of Innovation"

### [T012] Tradurre Republic of Innovation cap 6+
- **Status**: DONE
- **Owner**: @ondinho
- **Completed**: 2026-01-28
- **Depends**: [T010]
- **Blocks**: -
- **Priority**: P2
- **Notes**: ✅ Capitolo 6 (finale) completato. File: traduzioni/republic-of-innovation-IT.md (887 righe totali)

### [T013] Verificare qualità traduzione vs cap 1-4
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-28
- **Depends**: [T012]
- **Blocks**: -
- **Priority**: P2
- **Notes**: ✅ QA completato. Voto 9/10. Report: traduzioni/QA-REPORT-republic-innovation.md

### [T015] Pipeline revisione 2 cicli (Capussela EN→IT)
- **Status**: IN_PROGRESS
- **Owner**: @ondinho
- **Depends**: [T012]
- **Blocks**: -
- **Priority**: P1
- **Notes**: 2 cicli RILETTTORE→REVISORE con llama3:70b locale. Script: scripts/translation-pipeline.py. ⛔ MAI TOKEN CLAUDE

---

## 📋 TODO - LIBRI (TIER 1)

### [T020] Frankenstein illustrato EN
- **Status**: IN_PROGRESS
- **Owner**: @ondinho
- **Depends**: -
- **Blocks**: -
- **Priority**: P2
- **Notes**: Da ROADMAP TIER 1. Libro pubblico dominio. Cerco testo + genero illustrazioni.

### [T021] Meditations illustrato EN
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: già pubblicato
- **Depends**: -
- **Blocks**: -
- **Priority**: P2
- **Notes**: ✅ GIÀ PUBBLICATO! Ondinho ha duplicato per errore - verificare sempre prima di iniziare.

### [T022] The Prophet illustrato EN
- **Status**: IN_PROGRESS
- **Owner**: @ondinho
- **Depends**: -
- **Blocks**: -
- **Priority**: P2
- **Notes**: Kahlil Gibran - pubblico dominio (1923). Setup + prompts.

### [T023] AIKO EN su KDP
- **Status**: TODO
- **Owner**: 
- **Depends**: -
- **Blocks**: -
- **Priority**: P2
- **Notes**: Pubblicare su Amazon

### [T024] Psalm 23 multilingua su KDP
- **Status**: IN_PROGRESS
- **Owner**: @ondinho
- **Depends**: -
- **Blocks**: -
- **Priority**: P2
- **Notes**: Versione multilingue. Checklist: books/salmo-23-kdp/KDP-CHECKLIST.md. SEGUENDO PROCEDURA.

### [T025] The Art of War illustrato EN
- **Status**: IN_PROGRESS
- **Owner**: @ondinho
- **Depends**: -
- **Blocks**: -
- **Priority**: P2
- **Notes**: Sun Tzu - pubblico dominio. Stile: Chinese ink wash + dramatic warfare

### [T026] Tao Te Ching illustrato EN
- **Status**: IN_PROGRESS
- **Owner**: @ondinho
- **Depends**: -
- **Blocks**: -
- **Priority**: P2
- **Notes**: Lao Tzu - pubblico dominio. Stile: Minimalist Chinese calligraphy + nature

### [T027] Divine Comedy illustrato EN
- **Status**: IN_PROGRESS
- **Owner**: @ondinho
- **Depends**: -
- **Blocks**: -
- **Priority**: P2
- **Notes**: Dante - pubblico dominio. Stile: Gustave Doré inspired, epic gothic

---

## 📋 TODO - TRADING

### [T032] Ottimizzare se win rate < 50%
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-28
- **Notes**: Fixed! Black-Scholes inspired model with momentum tracking. Higher min edge (25%) for NO bets. Removed bearish bias.

---

## 📋 TODO - AUTOTRADER V2

### [T033] Backtest del nuovo modello su dati storici
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-28
- **Depends**: -
- **Blocks**: -
- **Priority**: P2
- **Notes**: ✅ v2 model avrebbe SKIPPATO tutti 41 trade! v1 calcolava edge 45% quando era in realtà <10%. Script: backtest-v2-model.py

### [T034] Alert Telegram se balance < $5
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-28
- **Depends**: -
- **Blocks**: -
- **Priority**: P2
- **Notes**: ✅ kalshi-balance-alert.py + integrazione in autotrader. Scrive alert file se cash < $5, cooldown 1h

### [T035] Log win/loss settati via settlement tracker
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-28
- **Depends**: -
- **Blocks**: -
- **Priority**: P2
- **Notes**: ✅ Settlement tracker ora aggiorna automaticamente result_status in kalshi-trades.jsonl (won/lost)

---

## 📋 TODO - PORTAL & INFRA

### [T040] Analytics Google per onde.la
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-30
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ GA4 code added to layout.tsx! Set NEXT_PUBLIC_GA_ID env var with measurement ID (G-XXXXXXX) to activate. Gets from Google Analytics console.

### [T041] Sitemap.xml automatico per onde.la
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-28
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Created sitemap.ts + robots.ts for Next.js auto-generation. /sitemap.xml and /robots.txt now available.

### [T042] Favicon personalizzata Onde
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-28
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Wave icon SVG created for onde-portal and surfboard. icon.svg + apple-icon.svg in app/ directories.

### [T043] Health check in CI
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-28
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Already implemented! scripts/health/check.ts + smoke-test.ts exist. CI runs bot-health job with `npm run health:check`.

---

## 📋 TODO - MOONLIGHT HOUSE

### [T050] Sprite mood diversi
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-30
- **Depends**: -
- **Blocks**: -
- **Priority**: P2
- **Notes**: ✅ Added CSS-based mood visual effects! Luna now has distinct appearances for each mood: happy (golden glow, gentle bounce), neutral (soft blue), sad (desaturated, droop animation), sleepy (dim, slow nod), hungry (green tint, wobble), excited (rainbow glow, jump). Both map and room views updated. Foundation for real sprite images later.

### [T051] Sound effects
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-30
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Created full sound system! useSoundManager hook with: 12 sound effects (ui-click, action-eat/sleep/play/bath/shop/drive, coin-collect, level-up, achievement), 3 ambient tracks (home/garden/shop), mute toggle, volume control, localStorage persistence. Uses Web Audio API oscillator fallback when MP3s not available. Sounds play on all interactions. Mute button in header.

---

## 📋 TODO - CONTENT & SOCIAL

### [T060] Video Piccole Rime su @Onde_FRH
- **Status**: TODO
- **Owner**: 
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: Content per social

### [T061] Postare 3 video già pronti
- **Status**: TODO
- **Owner**: 
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: Video esistenti da pubblicare

### [T062] Bio @Onde_FRH update
- **Status**: TODO
- **Owner**: 
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: "AI Publishing House + PR Agency"

---

## 📋 TODO - APP & VR

### [T070] AIKO Interactive app
- **Status**: TODO
- **Owner**: 
- **Depends**: -
- **Blocks**: -
- **Priority**: P2
- **Notes**: App interattiva

### [T071] FreeRiver Flow voice prototype
- **Status**: TODO
- **Owner**: 
- **Depends**: -
- **Blocks**: -
- **Priority**: P2
- **Notes**: Voice AI prototype

### [T072] Onde Books VR per Quest
- **Status**: TODO
- **Owner**: 
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: VR reading experience

### [T725] VR Testing Automatico Programmatico
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-31
- **Depends**: -
- **Blocks**: [T726]
- **Priority**: P1
- **Notes**: ✅ Implemented Playwright + WebXR Mock testing for VR Reader!
  - **Research document**: `docs/vr-testing-research.md`
  - **Implementation**: `apps/reader-vr/tests/`
  - **Features:**
    - ✅ WebXR API mock (navigator.xr fully mocked)
    - ✅ Playwright config with dev server integration
    - ✅ 9 automated tests:
      - Page loads without errors
      - Three.js canvas renders
      - VR/AR entry buttons present
      - Book selector opens
      - Time of day toggle works
      - Keyboard navigation
      - Mute toggle
      - Visual regression baseline
      - Performance budget (<10s load)
  - **Run tests**: `cd apps/reader-vr && npm test`
  - **CI-ready**: Can run in GitHub Actions
  - ⏳ Next: T726 (CI/CD pipeline with auto-improvement)

### [T726] CI/CD Pipeline con Feedback Loop Auto-Miglioramento
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-31
- **Depends**: [T725]
- **Blocks**: -
- **Priority**: P1
- **Notes**: ✅ Implemented comprehensive CI/CD with auto-improvement!
  - **Workflow**: `.github/workflows/ci-cd.yml`
  - **Features:**
    - ✅ Multi-stage pipeline: lint → test → build → deploy → verify
    - ✅ Parallel builds for all apps (reader, reader-vr, surfboard, moonlight)
    - ✅ Auto-deploy to Cloudflare on main branch push
    - ✅ Nightly schedule at 4 AM UTC for auto-improvement cycles
    - ✅ Post-deploy verification (health checks on onde.la, onde.surf)
    - ✅ Auto-improvement stage analyzes failures, creates reports
    - ✅ Path-based triggers (only rebuilds changed apps)
    - ✅ Artifact caching and upload
  - **Local Script**: `scripts/ci-auto-improve.py`
    - Fetches GitHub Actions run history
    - Analyzes failure patterns across runs
    - Detects flaky jobs (3+ failures)
    - Creates tasks for persistent issues
    - Creates alerts for heartbeat pickup
    - Logs run history for trend tracking
    - Can auto-create TASKS.md entries with `--create-tasks`
  - **Cron integration**: Nightly runs trigger auto-analysis
  - **Secrets required**: CLOUDFLARE_API_TOKEN, CLOUDFLARE_ACCOUNT_ID

### [T670] Reader App Portale - Versione Web
- **Status**: DONE (duplicate of T668)
- **Owner**: @clawd
- **Completed**: 2026-01-31
- **Depends**: -
- **Blocks**: [T671], [T672]
- **Priority**: P1
- **Notes**: ✅ Completed as part of T668 (Reader App: Prototype)!
  - See T668-T720 for full implementation details
  - Live at: https://onde.la/reader/
  - Features: EPUB reading, highlights, bookmarks, TTS, dictionary, stats
  - Bel lettore libri "superfico"
  - Focus su UX lettura immersiva
  - Base per versioni mobile e VR

### [T671] Reader App - Mobile iOS/Android
- **Status**: TODO
- **Owner**: -
- **Depends**: [T670]
- **Blocks**: -
- **Priority**: P2
- **Notes**: App mobile con lettore libri (da Mattia 2026-01-29)
  - "App per i fond" (iPhone)
  - Lettore tipo Kindle/iBooks ma migliore
  - Offline reading support
  - Sync progressi tra devices

### [T672] Reader App - Integrazione VR
- **Status**: TODO
- **Owner**: -
- **Depends**: [T670], [T072]
- **Blocks**: -
- **Priority**: P2
- **Notes**: App portale anche in VR (da Mattia 2026-01-29)
  - Lettura immersiva in realtà virtuale
  - Ambiente 3D customizzabile
  - Hand tracking per girare pagine

---

## 📋 TODO - AUTOTRADER IMPROVEMENTS

### [T081] Alert Telegram se win rate < 40%
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-28
- **Depends**: -
- **Blocks**: -
- **Priority**: P2
- **Notes**: ✅ kalshi-winrate-alert.py + cron ogni 6h. Alert file kalshi-low-winrate.alert per heartbeat

### [T082] Dashboard trading stats su /trade
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-28
- **Depends**: -
- **Blocks**: -
- **Priority**: P2
- **Notes**: ✅ Added /api/trading/stats API + Trading Performance section in /betting with win rate, PnL, today stats, and recent trades grid.

### [T083] Trade log cleanup: rimuovere duplicati per stesso ticker/hour
- **Status**: DONE
- **Owner**: @ondinho
- **Completed**: 2026-01-28
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Script `scripts/analyze-trade-duplicates.py` creato. 41 trades → 21 unique combos → 11 duplicati. Raccomandazione: KEEP SEPARATE (mostra frequenza trading). Script può generare summaries se serve.

### [T084] API endpoint per trade stats JSON
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-28
- **Depends**: [T082]
- **Blocks**: -
- **Priority**: P2
- **Notes**: ✅ Created as part of T082. GET /api/trading/stats returns winRate, pnl, todayStats, recentTrades.

### [T085] Notifica Telegram riassunto giornaliero trade
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-28
- **Depends**: -
- **Blocks**: -
- **Priority**: P2
- **Notes**: ✅ Script: kalshi-daily-summary.py + kalshi-daily-notify.sh. Cron 07:00 UTC (23:00 PST). Alert file per heartbeat pickup.

### [T086] Autotrader: pausa se PnL giornaliero < -$1
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-28
- **Depends**: -
- **Blocks**: -
- **Priority**: P2
- **Notes**: ✅ Implementato! Autotrader ora pausa automaticamente se daily loss > $1. File pause: kalshi-daily-pause.json. Reset a mezzanotte UTC.

### [T087] Migliorare modello: momentum tracking multi-timeframe
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-29
- **Depends**: -
- **Blocks**: -
- **Priority**: P2
- **Notes**: ✅ INTEGRATED! Momentum was calculated but never used. Now: 1) get_btc_ohlc() fetches 2-day OHLC, 2) get_multi_timeframe_momentum() calculates 1h/4h/24h composite, 3) adjust_probability_with_momentum() adjusts edge calc, 4) Skip trades that conflict with strong momentum, 5) 2% edge bonus for aligned momentum trades

### [T088] Grafici trend BTC su /trade dashboard
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-29
- **Depends**: [T082]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Now uses real OHLC data! Extended /api/momentum to return priceHistory (last 24h close prices). BTC/ETH sparklines now show actual price trend with fallback to mock data.
- **Notes**: Chart con price action e trade markers

### [T089] Verificare v2 autotrader sta usando modello corretto
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-28
- **Depends**: -
- **Blocks**: -
- **Priority**: P1
- **Notes**: ✅ FIXED! Era in esecuzione v1 (broken). Killato e riavviato con v2 (PID 22269). Ora usa Black-Scholes corretto.

### [T090] Aggiungere YES bets quando trend bullish
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-29
- **Depends**: [T087]
- **Blocks**: -
- **Priority**: P2
- **Notes**: ✅ Already implemented! Autotrader makes YES bets when bullish (113 YES vs 821 NO in trade log). Logic: same MIN_EDGE, skips YES on bearish momentum, 2% bonus when momentum aligns.

### [T091] Log edge calcolato per ogni skip
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-28
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Added verbose skip logging to find_opportunities(). Shows breakdown by skip reason, and for insufficient edge shows top 5 closest opportunities with exact edge gap needed.

### [T092] PDF formattato "La Repubblica dell'Innovazione"
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-28
- **Depends**: [T013]
- **Blocks**: -
- **Priority**: P2
- **Notes**: ✅ Already exists! traduzioni/republic-of-innovation-IT.pdf (394KB, 8 pages). Created from Claude Opus translation.

### [T093] Backup automatico kalshi-trades.jsonl su git
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-28
- **Depends**: -
- **Blocks**: -
- **Priority**: P2
- **Notes**: ✅ Script: scripts/backup-trades-git.sh + cron 00:05 UTC daily. Backup in data/trading/. 2007 trades backed up.

### [T094] Grafana/Prometheus setup per trading metrics
- **Status**: TODO
- **Owner**: 
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: Dashboard real-time per win rate, PnL, open positions

### [T095] Weekly trading report (PDF summary)
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-28
- **Depends**: -
- **Blocks**: -
- **Priority**: P2
- **Notes**: ✅ Script: kalshi-weekly-report.py. PDF with daily breakdown, best/worst trades, PnL. Cron: Sunday 08:00 UTC. Output: data/reports/

### [T096] Trade history web viewer su /trading/history
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-28
- **Depends**: [T222]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Created /trading/history page with: paginated table, filters (result/asset/side), CSV export, responsive design. Uses new /api/trading/history endpoint.

### [T097] Cleanup vecchi backup > 30 giorni
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-28
- **Depends**: [T093]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Script: scripts/cleanup-old-backups.sh + cron 01:00 UTC daily. Keeps last 30 days of backups.

### [T205] Install Playwright for automated testing
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-28
- **Depends**: -
- **Blocks**: -
- **Priority**: P2
- **Notes**: ✅ Installed via npm: playwright + @playwright/test. Chromium + FFmpeg downloaded to ~/Library/Caches/ms-playwright/

### [T206] Fix onde.surf GH Actions deploy (billing issue)
- **Status**: OBSOLETE
- **Owner**: @clawd
- **Completed**: 2026-01-28
- **Depends**: -
- **Blocks**: -
- **Priority**: -
- **Notes**: ✅ OBSOLETE: Migrato a Wrangler diretto. GitHub Actions non più necessario per deploy. Procedura permanente: `npm run build && npm run build:cf && wrangler pages deploy`.

### [T800] Add latency trend sparkline to /betting dashboard
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-02-01
- **Depends**: [T397]
- **Blocks**: -
- **Priority**: P4
- **Notes**: ✅ Implemented latency trend sparkline!
  - **Component**: `apps/surfboard/src/components/LatencySparkline.tsx`
  - **Features:**
    - ✅ Mini sparkline showing latency history (24h)
    - ✅ Color-coded: green (<300ms), yellow (300-500ms), red (>500ms)
    - ✅ Hover tooltip with detailed stats (avg, min, max, P95)
    - ✅ Uses data from latency-history.jsonl via gist
    - ✅ Mock data generator for demo/testing
  - **Integration:**
    - Added `load_latency_history()` to push-stats-to-gist.py
    - Added `latencyHistory` field to TradingStats interface
    - Displayed in header bar next to streak indicator
    - Shows ⚡ icon with sparkline and current latency ms
  - ✅ Deployed: https://6a442338.onde-surf.pages.dev
  - ✅ Verified: onde.surf/betting returns 307 (auth redirect as expected)

### [T801] Auto-adjust position size based on current API latency
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-02-02
- **Depends**: [T396], [T397]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Implemented latency-based position sizing!
  - **Function**: `get_latency_position_multiplier()` in kalshi-autotrader-v2.py
  - **Features:**
    - ✅ Checks avg latency of critical endpoints (order, markets_search)
    - ✅ If avg latency >500ms: reduce Kelly fraction by 25%
    - ✅ If avg latency >1000ms: reduce Kelly fraction by 50%
    - ✅ If avg latency >2000ms: skip trade entirely with log
    - ✅ Prints adjustment reason when applied (⚡ Latency size adjustment)
    - ✅ Logs latency_multiplier and latency_reason in trade data
    - ✅ Includes latency in total_multiplier calculation
  - **Config:**
    - `LATENCY_POSITION_SIZING_ENABLED` env var (default: true)
    - `LATENCY_SIZE_THRESHOLDS` dict for configurable thresholds
    - `LATENCY_CRITICAL_ENDPOINTS` list for endpoints to monitor
  - Rationale: High latency = execution risk, stale prices

### [T802] Export weekly exchange latency comparison report
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-02-02
- **Depends**: [T396]
- **Blocks**: -
- **Priority**: P4
- **Notes**: ✅ Implemented weekly latency comparison report!
  - **Script**: `scripts/export-latency-report.py`
  - **Features:**
    - ✅ Compare avg/P95/max latency across exchanges (Binance, CoinGecko, Coinbase)
    - ✅ Kalshi API endpoint performance (Markets, Balance, Positions, Order)
    - ✅ Performance rating: Excellent/Good/Acceptable/Poor/Critical
    - ✅ Week-over-week trends (improved/stable/degraded)
    - ✅ Auto-generate recommendations
    - ✅ Output: Markdown + JSON reports
    - ✅ History tracking in latency-reports-history.jsonl
    - ✅ Recommended exchange priority order
  - **Usage**: `python3 export-latency-report.py [--dry-run] [--verbose]`
  - **Cron**: `0 12 * * 0` (Sunday 12:00 UTC)

### [T803] Dashboard: Display latency adjustment indicator on /betting
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-02-02
- **Depends**: [T801]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Implemented latency adjustment indicator!
  - **Component**: `apps/surfboard/src/components/LatencyAdjustmentIndicator.tsx`
  - **Features:**
    - ✅ Badge appears next to latency sparkline when multiplier <1.0
    - ✅ Color-coded: green (normal), yellow (25% reduction/500-1000ms), orange (50% reduction/1000-2000ms), red (paused/>2000ms)
    - ✅ Compact mode shows badge only, full shows percentage
    - ✅ Tooltip shows: current latency, adjustment description, Kelly fraction, threshold
    - ✅ Hidden when latency is normal (no visual clutter)
  - **Integration**: Added to /betting header next to LatencySparkline
  - Build passes, ready for deploy

### [T804] Trading: Analyze latency impact on trade outcomes
- **Status**: IN_PROGRESS
- **Owner**: @clawd
- **Depends**: [T801]
- **Blocks**: -
- **Priority**: P3
- **Notes**: Script to analyze correlation between latency and trade results:
  - Load all trades with latency_multiplier data
  - Compare win rate when latency_multiplier < 1.0 vs = 1.0
  - Calculate PnL impact of latency-adjusted trades
  - Output: JSON report + recommendations for threshold tuning
  - Run weekly to validate/adjust thresholds

### [T805] Trading: Add API timeout with retry for slow endpoints
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-02-02
- **Depends**: [T801]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Implemented endpoint-specific timeouts with alert system!
  - **Config**: `ENDPOINT_TIMEOUTS` dict with per-endpoint timeouts
    - order: 8s (fail fast for order placement)
    - balance/positions: 10s
    - markets_search: 15s (can be slower)
  - ✅ Retry with exponential backoff (already existed, now uses configurable timeout)
  - ✅ Log timeout events to latency profile (endpoint_timeout)
  - ✅ Track consecutive timeouts with `record_timeout()` function
  - ✅ Alert file `kalshi-timeout.alert` when 3+ timeouts in 5min window
  - ✅ Cooldown prevents alert spam (1h between alerts)
  - Syntax verified OK

---

## 🚨 PRIORITÀ MASSIMA - DEPLOY GRATIS

### [T350] Deploy GRATIS per tutti i siti FRH
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-28
- **Depends**: -
- **Blocks**: [T351], [T352]
- **Priority**: P0
- **Notes**: ✅ Solved! Both sites deploy free via Cloudflare Pages + Wrangler. onde.la uses deploy-onde-la-prod.sh. onde.surf uses wrangler pages deploy. No GH Actions needed.

### [T351] Fix onde.surf BROKEN dopo deploy sbagliato
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-29
- **Depends**: -
- **Blocks**: -
- **Priority**: P0
- **Notes**: ✅ FIXED (2 rounds)! Round 1 (Jan 28): basic wrangler redeploy. Round 2 (Jan 29): Fixed ThemeToggleMinimal export missing (caused global 500), simplified middleware (removed auth() wrapper), added login/layout.tsx with edge runtime. Deploy via Wrangler direct (GH Actions blocked for billing).

### [T352] Rimuovere "made with love" da onde.la
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-30
- **Depends**: -
- **Blocks**: -
- **Priority**: P1
- **Notes**: ✅ Removed "made with love" from hero, removed "Powered by Vercel" from footer. Cleaner branding.

### [T353] Sistemare onde.la mezzo italiano mezzo inglese
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-30
- **Depends**: -
- **Blocks**: -
- **Priority**: P1
- **Notes**: ✅ Fixed /catalogo page to use i18n system. Added catalog translations to en.json and it.json. Now respects user language preference via localStorage/browser detection.

### [T207] Create centralized test-pre-deploy.sh script
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-28
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Already exists as test-website-before-deploy.sh! Comprehensive Playwright tests + curl fallback. Used by deploy-onde-la-prod.sh.

### [T098] Generare favicon.ico da SVG per compatibilità legacy
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-28
- **Depends**: [T042]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Created PNG fallbacks (16px, 32px) in public/. Skipped .ico generation - IE is EOL (Jan 2022), all modern browsers support SVG/PNG.

### [T099] Meta tags Open Graph per onde.surf
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-28
- **Depends**: -
- **Blocks**: -
- **Priority**: P2
- **Notes**: ✅ Added OpenGraph, Twitter cards, and icon metadata to surfboard layout.tsx. Moved icons to public/.

### [T200] Verificare favicon appare su onde.la dopo deploy
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-28
- **Depends**: [T042]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Fixed stray app/ folder that broke homepage routing. Icons moved to src/app/. Deployed to onde.la successfully.

### [T204] Fix homepage 404 - stray app/ folder
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-28
- **Depends**: -
- **Blocks**: [T200]
- **Priority**: P1
- **Notes**: ✅ Next.js prefers app/ over src/app/. Empty app/ folder (only icons) caused homepage 404. Moved icons to src/app/, removed stray folder.

---

## ✅ DONE

### [T100] Deploy onde.surf
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-27
- **Notes**: GitHub Actions deploy completato

### [T101] Traduzione cap 5 Republic of Innovation
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-27
- **Notes**: 594 righe, ~12k parole

### [T102] Traduzione capussela-spirito-EN
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-27
- **Notes**: 1622 righe via translate-amd.py

### [T103] Watchdog autotrader + cron
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-28
- **Notes**: Script watchdog ogni 5 min

### [T104] Moonlight Framer Motion transitions
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-28
- **Notes**: Animazioni stanze

### [T105] Moonlight responsive CSS
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-28
- **Notes**: 768px, 480px, 360px, 600px-height breakpoints

### [T106] Health page /health
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-28
- **Notes**: Status tutti servizi

### [T107] Open Graph metadati /libri
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-28
- **Notes**: Preview social

### [T108] Script analisi PnL
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-28
- **Notes**: scripts/analyze-trades-pnl.py

### [T109] Settlement tracking automatico
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-28
- **Notes**: scripts/kalshi-settlement-tracker.py - multi-source BTC price fetching

### [T110] Cron settlement tracker ogni ora
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-28
- **Notes**: Cron job `0 * * * *` esegue settlement tracker

### [T111] Analisi win rate reale
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-28
- **Notes**: 41 trade NO, 0% win rate - BTC +2.3% ($88k→$90k). Script: analyze-winrate.py

### [T112] Fix duplicate runtime export surfboard
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-28
- **Notes**: betting/page.tsx aveva `export const runtime = 'edge'` duplicato. Fixed e pushed. ⚠️ Deploy fallito per GitHub billing issue!

---

### [T201] PnL calculation fix: handle YES bets correctly
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-28
- **Depends**: [T082]
- **Blocks**: -
- **Priority**: P2
- **Notes**: ✅ Analyzed - current formula is CORRECT for both YES and NO! profit = (100-price)*contracts when won, loss = price*contracts when lost. Same for both sides.

### [T202] Historical win rate trend chart
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-29
- **Depends**: [T082]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Added! WinRateTrendChart component (SVG-based, no external libs). Shows 30-day rolling average with tooltips, gradient fill, trend color. Uses mock data for now (edge runtime can't read local files).

### [T203] Trade filtering by date range
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-30
- **Depends**: [T082]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Added! API: period (today/week/month) + custom from/to params. UI: period selector buttons (All/Today/7D/30D) + custom calendar icon. Includes dateRange and filteredFromTotal in response.

---

### [T208] Test playwright integration in deploy verification
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-30
- **Depends**: [T205]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Created deploy-verification.spec.ts with 17 tests covering: homepage, navigation, critical pages, performance, assets, accessibility. Updated test-website-before-deploy.sh to use Node.js Playwright (preferred) → Python Playwright → curl fallback. Added npm scripts: test:playwright, test:playwright:ui, test:deploy.

### [T209] Canonical URLs for all pages
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-29
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Added metadataBase + alternates.canonical to root and all page layouts. Prevents duplicate content issues.

### [T210] Meta descriptions per page
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-29
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Added layout.tsx with Metadata for /about, /catalogo, /collezioni, /famiglia, /giochi, /health. Each has unique title+description for SEO.

### [T211] Telegram alert se autotrader crasha
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-28
- **Depends**: -
- **Blocks**: -
- **Priority**: P2
- **Notes**: ✅ Enhanced watchdog-autotrader.sh: creates kalshi-autotrader-crash.alert on crash detection. 30min cooldown. Heartbeat picks up alert and notifies.

### [T212] Backup memory files to git daily
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-28
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Script: backup-memory-git.sh. Cron 02:00 daily. Backs up MEMORY.md, memory/, SOUL.md, USER.md, TOOLS.md, IDENTITY.md, HEARTBEAT.md. 30-day retention.

### [T213] Kalshi API retry logic con exponential backoff
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-28
- **Depends**: -
- **Blocks**: -
- **Priority**: P2
- **Notes**: ✅ Added exponential backoff (2^n + jitter) to api_request(). Retries 5xx/timeout/conn errors up to 3x. Also added retry to CoinGecko and Fear&Greed APIs.

### [T214] Cleanup vecchi log autotrader > 7 giorni
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-28
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Script: scripts/cleanup-autotrader-logs.sh. Rotates logs >10MB, keeps last 1000 lines. Cron 03:00 daily.

### [T215] Watchdog health check - verify cron is running
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-28
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Script: meta-watchdog.sh. Cron */15 * * * *. Alerts if watchdog.log stale >15min. 1h cooldown.

### [T216] Trading stats hourly snapshot for trend analysis
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-28
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Script: kalshi-hourly-snapshot.py. Saves to data/trading/snapshots/YYYY-MM-DD.jsonl. Tracks all-time + today stats (trades, win rate, PnL, by asset/side). Cron: hourly at :00.

### [T217] Aggregate alert check in heartbeat pickup
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-28
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Added watchdog-stale.alert to HEARTBEAT.md alert file list

### [T218] Autotrader uptime percentage tracking
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-28
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Script: autotrader-uptime.py. Parses watchdog.log, calculates uptime % (24h + 7d). Saves to data/trading/autotrader-uptime.json. Cron: hourly at :30. Current: 95% uptime.

### [T219] Email notification fallback for critical alerts
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-30
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Implemented email fallback for critical health alerts!
  - Updated `scripts/health-webhook-notifier.sh` with email fallback
  - **Triggers when**: Telegram fails or is not configured
  - **Supported providers**:
    - SendGrid (via SENDGRID_API_KEY)
    - Mailgun (via MAILGUN_API_KEY + MAILGUN_DOMAIN)
    - Local `mail` command
    - msmtp
  - **Configuration**: Set ALERT_EMAIL env var + one of the provider keys
  - **Env vars**: EMAIL_FROM (default: alerts@onde.la), ALERT_EMAIL (recipient)

### [T220] A/B testing framework for trading strategies
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-02-01
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Implemented comprehensive A/B testing framework!
  - **Script**: `scripts/ab-testing-framework.py`
  - **Features:**
    - ✅ 7 pre-defined strategy variants (baseline, conservative, aggressive, momentum_heavy, no_momentum, high_frequency, safe_harbor)
    - ✅ Backtest against historical trades (`--backtest strategy1 strategy2 --days N`)
    - ✅ Paper trade Monte Carlo simulation (`--paper strategy1 strategy2 --cycles N`)
    - ✅ Statistical significance testing (`--compare A B`)
    - ✅ Create custom strategy variants (`--create NAME --params '{...}'`)
    - ✅ Metrics: win rate, PnL, ROI, Sharpe ratio, max drawdown, avg edge
    - ✅ Results persistence to JSON for historical comparison
  - **Usage examples:**
    - `python ab-testing-framework.py --list` - List strategies
    - `python ab-testing-framework.py --backtest baseline aggressive --days 30`
    - `python ab-testing-framework.py --paper baseline conservative --cycles 500`
    - `python ab-testing-framework.py --report` - Show history

### [T221] Export trading stats to CSV
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-28
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Script: kalshi-export-csv.py. Usage: `--days N` for last N days, `--output file.csv` for custom path. Output: data/exports/

### [T222] Trade history API with pagination
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-28
- **Depends**: [T096]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ /api/trading/history with pagination (page, limit), filters (result, asset, side, from, to), and sorting (sort, order). Returns trades with calculated PnL.

---

### [T223] Add ETH (KXETHD) market support to autotrader
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-28
- **Depends**: -
- **Blocks**: -
- **Priority**: P2
- **Notes**: ✅ Added! Now scans both KXBTCD (BTC) and KXETHD (ETH) markets. Uses ETH_HOURLY_VOL (0.7%) for ETH. Separate momentum tracking for each asset. Trade log now includes `asset` field.

### [T224] Save skip logs to file for pattern analysis
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-28
- **Depends**: [T091]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Added log_skip() function + SKIP_LOG_FILE constant. Logs to scripts/kalshi-skips.jsonl with: ticker, reason, edge, edge_needed, edge_gap, probabilities, strike, current_price, asset, minutes_to_expiry. Covers both low_edge_yes/no and expiry skips.

### [T225] Add trade entry reason field to trade logs
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-28
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Added "reason" field + full context to trade_log. Reason includes: edge %, momentum direction (bullish/bearish/neutral), extreme sentiment, high volatility. Also logs momentum, volatility, sentiment values for post-trade analysis.

### [T226] Add JSON-LD structured data for books
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-29
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Added Schema.org Book + ItemList + CollectionPage markup to /libri layout.tsx. Includes author, translator, datePublished, offers with price=0. Google rich snippets ready.

### [T227] Lighthouse CI check for performance regression
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-30
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Implemented! Created lighthouserc.js config + scripts/lighthouse-audit.sh. Thresholds: perf≥80%, a11y≥90%. npm scripts: `npm run lighthouse` (full) and `npm run lighthouse:quick` (curl-based). Core Web Vitals assertions: LCP≤2.5s, CLS≤0.1, TBT≤300ms.

### [T232] Add momentum analysis to weekly trading report
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-29
- **Depends**: [T095]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Added! Weekly report now includes: 1) Momentum Correlation Analysis section comparing aligned vs non-aligned trade win rates with insight, 2) Performance by Market Regime section showing win rate/PnL per regime (trending_bullish/bearish, sideways, choppy).

### [T233] Add Fear & Greed index to trade decision logging
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-28
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Completed as part of T225. Sentiment now logged in trade_log with value + included in reason string when extreme (<30 or >70).

### [T234] Implement trailing stop-loss for open positions
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-29
- **Depends**: -
- **Blocks**: -
- **Priority**: P2
- **Notes**: ✅ Added! check_stop_losses() monitors open positions every cycle. Exits if position value drops 50% from entry. Functions: sell_position(), check_stop_losses(), execute_stop_losses(), get_entry_price_for_position(). Logs to kalshi-stop-loss.log.

### [T235] ETH settlement tracker support
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-29
- **Depends**: [T223]
- **Blocks**: -
- **Priority**: P2
- **Notes**: ✅ Updated! Now handles KXETHD tickers. Functions renamed: get_price_at_time(), get_price_binance(), get_price_cryptocompare() with asset param. Logs asset type in settlement records.

### [T424] Weather market settlement tracker
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-29
- **Depends**: [T422]
- **Blocks**: -
- **Priority**: P1
- **Notes**: ✅ Created! `scripts/weather-settlement-tracker.py`:
  - Parses KXHIGH/KXLOW weather tickers
  - Fetches actual temps from NWS API (official settlement source)
  - Fallback to Open-Meteo historical API
  - Calculates win/loss based on temp vs threshold
  - Tracks forecast accuracy (NWS vs actual)
  - Updates kalshi-trades-v2.jsonl with results
  - Saves to weather-settlements.json
  - Ready for cron (hourly after market close)

### [T236] Separate win rate tracking per asset (BTC vs ETH)
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-29
- **Depends**: [T223]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Script: analyze-winrate-by-asset.py. Shows per-asset: total trades, win rate, PnL, ROI, YES/NO breakdown. Currently 41 BTC trades (old v1 data), ETH ready.

### [T237] Auto-rebalance between assets based on volatility
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-28
- **Depends**: [T223]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Added! Functions: calculate_realized_volatility(), get_volatility_advantage(). Compares 24h realized vol vs assumed hourly vol for BTC/ETH. When realized/assumed ratio >1.15 favors YES bets (+bonus), <0.85 favors NO bets (+bonus). Max ±2% edge bonus. Logs vol_ratio, vol_aligned, vol_bonus in trade data. Shows preferred_asset when one has 10%+ higher ratio.

### [T228] Add error boundary to ClientLayout
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-29
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Created ErrorBoundary.tsx with "Try Again" + "Go Home" buttons. Shows error details in dev mode. Wraps children in ClientLayout.

### [T229] Add hreflang tags for multilingual pages
- **Status**: BLOCKED
- **Owner**: 
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: ⏸️ Blocked: Site doesn't have separate language URLs (/en/, /it/) yet. hreflang requires actual alternate versions. Needs multilingual routing implementation first.

### [T230] Preload critical fonts for faster LCP
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-29
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Added preload for Playfair Display woff2 (latin subset). Reduces render-blocking on LCP.

### [T231] Add breadcrumb structured data
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-29
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Added Organization + WebSite schema to root layout. Added BreadcrumbList to /libri and /catalogo. SearchAction for catalog search.

---

## 📋 TODO - CHIEDIALO (AI Publishing)

### [T238] ChiedIAlo USA - Personaggi Editore Capo e Pina Pennello
- **Status**: TODO
- **Owner**: 
- **Depends**: -
- **Blocks**: -
- **Priority**: P2
- **Notes**: Creare versione USA di ChiedIAlo. Personaggi: Editore Capo + Pina Pennello per illustrazioni. Creare design personaggi.

### [T239] Stop-loss Telegram notification
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-29
- **Depends**: [T234]
- **Blocks**: -
- **Priority**: P2
- **Notes**: ✅ Added write_stop_loss_alert() to autotrader-v2. Creates kalshi-stop-loss.alert with JSON payload (ticker, side, entry/exit price, loss %). HEARTBEAT.md updated to check and forward to Telegram.

### [T240] Stop-loss performance tracking
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-29
- **Depends**: [T234]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Script: analyze-stop-loss.py. Compares actual loss at exit vs potential loss if held to settlement. Shows net savings. No stop-losses triggered yet (good!).

### [T241] Configurable stop-loss threshold via env
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-29
- **Depends**: [T234]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Added! STOP_LOSS_THRESHOLD (default 0.50) and MIN_STOP_LOSS_VALUE (default 5) now read from environment variables.

### [T242] Analyze skip log patterns - find optimal MIN_EDGE
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-29
- **Depends**: [T224]
- **Blocks**: -
- **Priority**: P2
- **Notes**: ✅ Script: analyze-skip-patterns.py. Findings: Old 15%/25% thresholds were too conservative. Current v2 uses 10% for both - appropriate since most skipped trades had <2% edge. 65% of NO skips had positive edge under old thresholds.

### [T243] Market regime detection (bullish/bearish/sideways)
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-28
- **Depends**: -
- **Blocks**: -
- **Priority**: P2
- **Notes**: ✅ Implemented! detect_market_regime() classifies: trending_bullish, trending_bearish, sideways, choppy. Dynamic MIN_EDGE: 7% trending, 12% sideways, 15% choppy + volatility adjustments. Integrated into find_opportunities() and trade logging.

### [T244] Implied volatility extraction from Kalshi prices
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-29
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Script: extract-implied-vol.py. Uses log-normal model to back-solve IV from market prices. Compares to 24h realized vol. Shows SELL_YES (IV>RV, overpriced) and BUY_YES (IV<RV, underpriced) signals. Output: data/trading/implied-vol-analysis.json. Finding: Near-ATM strikes show very high IV ratios.

### [T245] Filter extreme prices (≤5¢ or ≥95¢) from opportunities
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-29
- **Depends**: -
- **Blocks**: -
- **Priority**: P2
- **Notes**: ✅ Fixed "Bet too small" bug. Was selecting 100¢ NO contracts with no profit potential. Now skips prices ≤5¢ or ≥95¢ (bad risk/reward).

### [T246] Multi-exchange price feeds (Binance + CoinGecko + Coinbase)
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-30
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Implemented! get_crypto_prices() now fetches from 3 sources (Binance, CoinGecko, Coinbase). Uses median price for robustness. Logs source count and warns on >0.5% price spread. Separate functions: get_prices_binance(), get_prices_coingecko(), get_prices_coinbase().

### [T247] Daily stop-loss stats summary in report
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-30
- **Depends**: [T239], [T085]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Added! Daily summary (kalshi-daily-summary.py) shows: count triggered, total loss at exit, avg loss %. Weekly report (kalshi-weekly-report.py) includes: total stop-losses, loss breakdown, daily details if multiple days.

### [T248] Position sizing analysis (Kelly effectiveness tracking)
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-30
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Script: analyze-kelly-effectiveness.py. Analyzes: actual vs theoretical Kelly, win rate by position size bucket, bankroll simulation under different Kelly fractions. Generates recommendations. V1 data shows 0% WR (broken model), v2 awaiting trades.

---

### [T249] Trade analysis by hour of day
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-28
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Script: analyze-trades-by-hour.py. Shows win rate/PnL per hour UTC. Currently all trades from broken v1 model. V2 needs more data.

### [T250] Momentum indicator on /betting dashboard
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-28
- **Depends**: [T087]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ API: /api/momentum (CoinGecko OHLC). UI: BTC/ETH momentum cards with 1h/4h/24h changes + composite score + signal (bullish/bearish/neutral).

### [T251] Memory file search CLI tool
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-28
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Script: memory-search.sh. Case-insensitive grep with context. Searches MEMORY.md, memory/*.md, SOUL.md, USER.md, TOOLS.md, HEARTBEAT.md.

### [T252] Auto-cleanup stale alert files > 24h
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-28
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Script: cleanup-stale-alerts.sh. Removes alert files >24h old. Cron every 6h. Checks all 6 alert types.

### [T253] Win rate by market type (hourly vs daily)
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-29
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Script: analyze-market-types.py. Analyzes by asset (BTC/ETH), trading session, side (YES/NO), and hour UTC. V1 data: 0% WR (broken model). V2 awaiting trades.

### [T254] Dashboard last heartbeat timestamp
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-28
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Local monitoring: memory/heartbeat-state.json. Scripts: update-heartbeat-state.sh + check-heartbeat-state.sh. Run `scripts/check-heartbeat-state.sh` to verify bot is alive. Web dashboard integration would need GitHub API (future task).

### [T255] Alert file age warning (12h threshold)
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-30
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Script: check-alert-ages.sh. Integrated into meta-watchdog.sh. Logs warnings for alerts aged 12-24h to help debug heartbeat pickup issues.

### [T256] Cron job health dashboard on /health
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-28
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Added! API: /api/health/cron checks log file ages. UI: "Scheduled Jobs" section on /health shows each cron job with status (healthy/stale/error), schedule, and last run time.

### [T257] Trading PnL notification on market close
- **Status**: DONE (duplicate)
- **Owner**: @clawd
- **Completed**: 2026-01-29
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Superseded by T085 (daily summary at 07:00 UTC). Same functionality via kalshi-daily-summary.py.

---

### [T258] Momentum history chart (sparkline)
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-29
- **Depends**: [T250]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Added! 24h price trend sparkline on each momentum card. Shows priceHistory from /api/momentum. Includes % change label and color-coded chart (green/orange/cyan based on signal).

### [T259] Momentum alert when direction changes
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-28
- **Depends**: [T250]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Added! Functions: load_momentum_state(), check_momentum_change(), write_momentum_alert(). Only alerts on significant flips (bullish↔bearish, ignores neutral). 30min cooldown. Alert file: kalshi-momentum-change.alert. Added to HEARTBEAT.md pickup.

### [T260] Trading stats API caching
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-30
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ File-based caching with 60s TTL. Cache at data/trading/stats-cache.json. Validates by TTL + source file mtime. Response includes cached: true/false + cacheAge.

---

### [T261] Add JSON-LD structured data for /catalogo
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-29
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Added Schema.org CollectionPage + ItemList with 5 featured books (Alice, Meditations, Grimm, Pride&Prejudice, Pinocchio). numberOfItems: 1000. Multi-language support.

### [T262] RSS feed for book releases
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-29
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Created /feed.xml with 50 featured books. Added RSS autodiscovery to layout. Fixed static export for robots.ts, sitemap.ts, api/health/cron.

### [T263] Reading time estimate on book cards
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-30
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Added pages + readingTime fields to Book interface. Shows "X pages" and "~Xh" on /libri cards with icons. UX improvement for users to gauge content before download.

### [T264] Regime change Telegram alert
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-29
- **Depends**: [T243]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Integrated into autotrader-v2! Checks for regime changes each cycle. Alert file: kalshi-regime-change.alert. Shows old→new regime per asset with 4h/24h price changes and new MIN_EDGE. 1h cooldown between alerts. Added to HEARTBEAT.md pickup.

### [T265] Analyze win rate by regime
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-29
- **Depends**: [T243]
- **Blocks**: -
- **Priority**: P2
- **Notes**: ✅ Script: analyze-winrate-by-regime.py. Reads from kalshi-trades-v2.jsonl, groups by regime (trending_bullish/bearish, sideways, choppy), calculates win rate/PnL/ROI per regime, compares performance. Awaiting v2 trades for data.

### [T266] Backtest regime detection on historical data
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-30
- **Depends**: [T243]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Script: backtest-regime-detection.py. Uses cached OHLC (90 days). Analyzes: regime distribution, prediction accuracy (4h ahead), transitions. Findings: BTC/ETH mostly sideways (75-86%), sideways most accurate (83-90%), trend regimes show continuation. Results: data/trading/regime-backtest-{btc,eth}.json

---

### [T267] Add Atom feed alternative (/feed.atom)
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-29
- **Depends**: [T262]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Created /feed.atom with proper Atom 1.0 format. Same 50 books as RSS. Added autodiscovery links in layout metadata + explicit link tags.

### [T268] RSS feed with dynamic book descriptions
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-30
- **Depends**: [T262]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Enhanced both RSS and Atom feeds! Added category-specific descriptions, reading time estimates (pages + hours), and richer HTML content in Atom. 14 category descriptions defined.

### [T269] Deploy onde.la with RSS feed
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-29
- **Depends**: [T262]
- **Blocks**: -
- **Priority**: P2
- **Notes**: ✅ Deployed to Cloudflare Pages. RSS feed live at https://onde.la/feed.xml

---

### [T270] Fix curl redirect in verify-deployment-content.sh
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-29
- **Depends**: -
- **Blocks**: -
- **Priority**: P2
- **Notes**: ✅ Fixed! Script was using `curl -s` but /libri redirects to /libri/. Changed to `curl -sL` to follow redirects. False positive "Meditations not found" resolved.

### [T271] Make playwright optional in verification scripts
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-29
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Modified verify-deployment-content.sh to check if playwright module exists before using it. Falls back gracefully with warning. curl check is sufficient for verification.

### [T272] Add autotrader v2 trade count to /health page
- **Status**: BLOCKED
- **Owner**: 
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: ⏸️ Blocked: Static export to Cloudflare Pages cannot access local files at runtime. Needs server deployment or external API (GitHub API to read from repo, or dedicated monitoring endpoint).

### [T273] Profit factor calculation in trading stats
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-29
- **Depends**: [T082]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Added! API now returns grossProfitCents, grossLossCents, profitFactor. Dashboard shows Profit Factor card with color coding (>1.5=strong, >1=profitable). Grid expanded to 6 columns.

### [T274] Sharpe ratio calculation for trading strategy
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-29
- **Depends**: [T273]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Added! API returns sharpeRatio (avg return / std dev). Dashboard shows Sharpe Ratio card with color coding (≥2=excellent, ≥1=good, ≥0=fair, <0=poor). Grid changed to 4-column layout.

### [T275] Max drawdown tracking
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-29
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Added! API returns maxDrawdownCents and maxDrawdownPercent. Calculates largest peak-to-trough decline in cumulative PnL. Dashboard card shows % with color coding (≤10%=green, ≤20%=orange, >20%=red).

### [T276] Trade latency logging (order to fill time)
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-28
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Added latency_ms tracking to both regular trades and stop-loss exits. Prints latency to console, logs to trade file. Analysis script: analyze-trade-latency.py (shows min/avg/p50/p95/p99/max + distribution).

---

### [T277] External trade stats API (GitHub Gist or webhook)
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-29
- **Depends**: -
- **Blocks**: [T272]
- **Priority**: P3
- **Notes**: ✅ Done! Script: push-stats-to-gist.py. Gist: 43b0815cc640bba8ac799ecb27434579. Raw URL: https://gist.githubusercontent.com/FreeRiverHouse/43b0815cc640bba8ac799ecb27434579/raw/onde-trading-stats.json. Cron: hourly at :45. Static site can fetch this for real stats.

### [T278] Cache historical BTC/ETH OHLC data locally
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-29
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Script: cache-ohlc-data.py. Fetches 90 days OHLC from CoinGecko for BTC+ETH. Saves to data/ohlc/. Cron: 00:30 UTC daily. 180 candles per asset, JSON format with ISO timestamps.

### [T279] Trade entry latency profiling
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-30
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Comprehensive latency profiling added! 1) API_LATENCY_LOG tracks all API calls, 2) record_api_latency() records per-endpoint timing, 3) calculate_latency_stats() computes min/avg/p50/p95/p99/max, 4) print_latency_summary() shows formatted report, 5) identify_bottlenecks() detects slow endpoints, 6) External APIs tracked: Binance, CoinGecko, Coinbase, Fear&Greed, OHLC, 7) Profile saved to kalshi-latency-profile.json every 30min, 8) Analysis script: analyze-api-latency.py with detailed reporting.

### [T280] Calmar ratio calculation (return / max drawdown)
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-30
- **Depends**: [T275]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Added! API calculates: total invested, trading period, annualized return, then Calmar = annualized return / max drawdown %. Dashboard shows card with color coding (≥3=excellent, ≥1=good). Grid now has 9 stat cards.

### [T281] Rolling 30-day win rate trend chart
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-30
- **Depends**: [T202]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Implemented! API: /api/trading/trend returns 30-day rolling stats. Script: compute-winrate-trend.py calculates from real trades. Dashboard now shows real data with trend indicator (improving/declining/stable) and overall avg. Falls back to mock if API unavailable.

### [T282] Trade return distribution histogram on dashboard
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-30
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Created ReturnDistributionChart.tsx component! SVG-based histogram showing PnL distribution in buckets (<-$10, -$10 to -$5, ..., >$10). Shows avg/median return, max win/loss, color-coded bars (green=wins, red=losses). Integrated into /betting dashboard after Win Rate Trend. Falls back to simulated data when <5 real trades available.

---

### [T283] Sortino ratio calculation (downside risk adjusted)
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-30
- **Depends**: [T274]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Added! Sortino = avg return / downside deviation (only penalizes negative returns). Dashboard card shows excellent (≥2), good (≥1), fair (>0). Grid now has 10 stat cards.

### [T284] Average trade duration tracking
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-30
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Added! Uses minutes_to_expiry field from trades, converts to hours. Dashboard shows "Avg Duration" card with labels: short-term (<1h), medium-term (1-4h), longer holds (>4h). Grid now has 11 stat cards.

### [T285] Trade correlation with BTC volatility
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-29
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Script: analyze-volatility-correlation.py. Buckets trades by hourly volatility (very_low/<0.3%, low/0.3-0.5%, medium/0.5-1%, high/1-2%, very_high/>2%). Uses cached OHLC data. V1 trades: all 41 in medium-high vol periods with 0% WR (broken model). V2 will show real correlation. Saves to data/trading/volatility-correlation.json.

### [T286] Kelly criterion effectiveness tracking
- **Status**: DUPLICATE
- **Owner**: @clawd
- **Completed**: 2026-01-30
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: ⚠️ DUPLICATE of T248. Script analyze-kelly-effectiveness.py already covers this: theoretical vs actual Kelly, position size buckets, bankroll simulation.

### [T287] Add streak tracking (consecutive wins/losses)
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-29
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Added! API returns longestWinStreak, longestLossStreak, currentStreak, currentStreakType. Dashboard shows 3 new cards: Current Streak (🔥/❄️), Best Streak (🏆), Worst Streak (💀). Grid now has 14 stat cards.

---

### [T288] Streak alert when hitting new records
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-30
- **Depends**: [T287]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Added! Functions: calculate_current_streaks(), check_streak_records(), write_streak_alert(). Tracks longest win/loss streaks in kalshi-streak-records.json. Alerts when new record ≥3 is set. Win records celebrated 🏆🔥, loss records warned 💀📉. Alert file: kalshi-streak-record.alert. Integrated into update_trade_results() flow.

### [T289] Consecutive loss circuit breaker
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-28
- **Depends**: [T287]
- **Blocks**: -
- **Priority**: P2
- **Notes**: ✅ Implemented! Auto-pauses after CIRCUIT_BREAKER_THRESHOLD consecutive losses (default 5, env configurable). Resumes automatically when a trade wins. Functions: get_consecutive_losses(), check_circuit_breaker(), write_circuit_breaker_alert(). Alert file: kalshi-circuit-breaker.alert. State: kalshi-circuit-breaker.json.

### [T290] Win rate by streak position analysis
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-30
- **Depends**: [T287]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Script: analyze-streak-position.py. Analyzes win rate by preceding context (after N wins/losses) and streak continuation probability. Detects hot hand, tilt risk, mean reversion patterns. Usage: `python3 scripts/analyze-streak-position.py [--v2] [--min-trades N]`

### [T291] Average return per trade on dashboard
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-30
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Added avgReturnCents to API (route.ts) + Avg Return card to /betting dashboard. Shows +/- per trade average.

### [T292] Timezone indicator on /health page
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-30
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Added timezone info section showing: Cron TZ (UTC), user TZ, UTC time, local time. Helps debug cron scheduling.

### [T293] Volatility-adjusted position sizing
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-29
- **Depends**: [T285]
- **Blocks**: -
- **Priority**: P2
- **Notes**: ✅ Implemented! Kelly fraction now adjusts based on: 1) Regime (choppy=0.5x, sideways=0.75x, trending=1.1x), 2) Volatility alignment (aligned=1.15x, high-not-aligned=0.8x). Added volatility field to opportunity data. Prints size adjustment when not 1.0x.

### [T294] Alert on extreme volatility entry
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-30
- **Depends**: [T285]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Implemented! Volatility now classified into 5 buckets (very_low/low/normal/high/very_high). When trade placed during very_high vol (>2% hourly range), writes kalshi-extreme-vol.alert with full trade details. 1h cooldown. Added to HEARTBEAT.md pickup.

### [T295] Weekend vs weekday performance analysis
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-30
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Script: analyze-weekend-weekday.py. Analyzes by day of week, compares weekend vs weekday win rate/PnL/ROI. Shows day-by-day breakdown + actionable insights. Saves to data/trading/weekend-weekday-analysis.json. V1 data skewed (all Wed). V2 awaiting trades.

---

## 🔥 REGOLE SISTEMA - DA MATTIA 2026-01-28 22:35 PST

### [T405] Aggiornare AGENTS.md con REGOLA UNO (Procedure)
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-29
- **Depends**: -
- **Blocks**: [T406], [T407]
- **Priority**: P0
- **Notes**: ✅ Implementato via REGOLE-AGENTI.md + riferimento in AGENTS.md. REGOLA 1: Fai SEMPRE tutto usando procedure esistenti.

### [T406] Aggiornare AGENTS.md con REGOLA DUE (Estrai Task)
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-29
- **Depends**: [T405]
- **Blocks**: [T407]
- **Priority**: P0
- **Notes**: ✅ Implementato via REGOLE-AGENTI.md + riferimento in AGENTS.md. REGOLA 2: Estrai task da ogni messaggio!

### [T407] Propagare REGOLA UNO e DUE a Ondinho
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-29
- **Depends**: [T405], [T406]
- **Blocks**: -
- **Priority**: P0
- **Notes**: ✅ Regole già nel workspace condiviso! REGOLE-AGENTI.md + AGENTS.md sono letti da tutti gli agenti che lavorano in /Users/mattia/Projects/Onde.

### [T293] Trade confidence tracking (edge vs outcome)
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-30
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Script: analyze-edge-effectiveness.py. Analyzes: 1) Win rate by edge bucket, 2) Edge-outcome correlation coefficient, 3) Model calibration (predicted vs actual WR). Shows if higher edge → higher win rate. V1 data shows 0% WR with 0.4% edge (broken model). Usage: `python3 scripts/analyze-edge-effectiveness.py [--v2] [--buckets N]`

### [T294] Add latency stats to /betting dashboard
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-30
- **Depends**: [T276]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Added! API returns avgLatencyMs, p95LatencyMs, minLatencyMs, maxLatencyMs, latencyTradeCount. Dashboard shows "Avg Latency" card with color coding (<500ms=green, <1s=orange, >1s=red). Shows "N/A" until latency data available in trade logs.

### [T295] Alert if avg latency exceeds 2 seconds
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-30
- **Depends**: [T276]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Added! Checks avg latency of last 10 trades. Alert file kalshi-latency.alert when >2s (configurable via LATENCY_THRESHOLD_MS). 1h cooldown. Added to HEARTBEAT.md pickup.

---

## 📋 TODO - VIRTUAL OFFICE (Free River House 2.0)

> **Vision Doc:** docs/VIRTUAL-OFFICE-VISION.md
> **Goal:** Ufficio virtuale 2D → VR con agenti AI reali (Clawdinho, Onde-bot)

### [T500] Registrare Clawdinho come agent nel DB
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-29
- **Depends**: -
- **Blocks**: [T502], [T503]
- **Priority**: P1
- **Notes**: ✅ Clawdinho registrato! type=orchestrator, room=office, color=#00D4FF

### [T501] Registrare Onde-bot come agent nel DB
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-29
- **Depends**: -
- **Blocks**: [T502], [T503]
- **Priority**: P1
- **Notes**: ✅ Onde-bot (ex Ondinho) registrato! type=creative, room=lounge, color=#FF6B35

### [T502] Creare avatar Clawdinho (surfer emoji style)
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-29
- **Depends**: [T500]
- **Blocks**: -
- **Priority**: P2
- **Notes**: ✅ Created SVG avatar at /public/house/agents/clawdinho.svg. Robot surfista style con visor animato, antenna pulsante, surfboard giallo, colore cyan (#00D4FF). Animazioni CSS per glow effect.

### [T503] Creare avatar Onde-bot (wave emoji style)
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-29
- **Depends**: [T501]
- **Blocks**: -
- **Priority**: P2
- **Notes**: ✅ Created SVG avatar at /public/house/agents/onde-bot.svg. Wave character con faccia friendly, cresta onda animata, corpo acqua gradient, colore arancione (#FF6B35). Animazioni CSS per movimento onda.

### [T504] Connettere status Clawdinho a Clawdbot sessions reali
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-29
- **Depends**: [T500]
- **Blocks**: -
- **Priority**: P2
- **Notes**: ✅ Script agent-heartbeat.sh + cron */5. Checks LaunchAgent status, sends heartbeat to /api/sync. FreeRiverHouse shows "online" if last_seen < 5min. ⚠️ Funziona quando migration 0005 è applicata (aggiunge Clawdinho a DB).

### [T505] Activity log live per ogni agente
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-29
- **Depends**: [T500], [T501]
- **Blocks**: -
- **Priority**: P2
- **Notes**: ✅ Added Activity tab to FreeRiverHouse panel! 3 modes now: Tasks/Chat/Activity. Fetches from /api/activity, filters by agent name. Shows type-colored dots (deploy=green, image=purple, etc). Auto-refresh 30s.

### [T506] Voice input per assegnare task
- **Status**: TODO
- **Owner**: 
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: Whisper local → testo → create task. Bottone microfono nell'input

### [T507] TTS per risposte agenti
- **Status**: TODO
- **Owner**: 
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: ElevenLabs/sag per voce. Toggle "Read aloud" per chat responses

### [T508] Notifiche browser quando task completato
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-30
- **Depends**: -
- **Blocks**: -
- **Priority**: P2
- **Notes**: ✅ Added! Notification bell toggle in FreeRiverHouse header. Click to request permission (shows toast feedback). When enabled: receives browser notification on task completion with agent name and task description. Uses Web Notifications API, auto-closes after 5s.

### [T509] XP e livelli per agenti (gamification)
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-31
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Implemented full gamification system for agents!
  - **Database migration**: `0006_agent_gamification.sql`
    - Added xp, level, total_tasks_done, current_streak, longest_streak, badges to agents table
    - Created badges reference table with 13 default badges
    - Retroactive XP calculation based on completed tasks
  - **XP System**:
    - +10 XP per task completed
    - Level = floor(xp/100) + 1
    - Automatic level-up calculation
  - **Badges** (13 total):
    - Task milestones: 🎯 First Steps, 🔥 Warming Up (10), ⭐ Seasoned (50), 💯 Centurion (100), 🏆 Legend (500)
    - Level badges: 🌟 Rising Star (5), 💎 Expert (10), 👑 Master (25)
    - Streak badges: 🔗 Week Warrior (7), ⛓️ Monthly Master (30)
    - Time badges: 🦉 Night Owl, 🐦 Early Bird, ⚡ Speed Demon
  - **Streak tracking**: Consecutive days with completed tasks
  - **UI Updates** (FreeRiverHouse.tsx):
    - Level badge on agent avatar (color-coded by level)
    - XP progress bar with gradient
    - Badge display (up to 6 shown, hover for name)
    - Streak indicator with flame emoji
    - Tasks completed counter
  - **Auto-award**: XP automatically awarded on task completion via awardAgentXPInD1()
  - **Utility lib**: gamification.ts with helper functions
  - Build passes ✅

### [T750] Deploy onde.surf with agent gamification
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-31
- **Depends**: [T509]
- **Blocks**: -
- **Priority**: P2
- **Notes**: ✅ Deployed surfboard with gamification!
  - Deploy URL: https://ac73ff67.onde-surf.pages.dev
  - ✅ Build via `npm run build:cf` - passed
  - ✅ Deploy via wrangler to Cloudflare Pages
  - ✅ Site returns 307 (auth redirect) as expected
  - ⚠️ **D1 Migration needed**: Run `0006_agent_gamification.sql` via Cloudflare Dashboard
    - Dashboard → D1 → onde-surf-db → Console → paste migration
    - This adds xp/level/badges columns and initializes existing agents

### [T751] Agent Leaderboard widget for Free River House
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-02-01
- **Depends**: [T509]
- **Blocks**: [T753]
- **Priority**: P3
- **Notes**: ✅ Implemented agent leaderboard widget!
  - **Component**: `apps/surfboard/src/components/AgentLeaderboard.tsx`
  - **Features:**
    - ✅ Sorted by XP (highest first)
    - ✅ Top 3 with gold🥇/silver🥈/bronze🥉 medals
    - ✅ Shows avatar, name, level, XP, task count
    - ✅ Streak indicator (🔥) for active streaks
    - ✅ Status dot (working/idle)
    - ✅ Click agent to view their profile
    - ✅ Total stats footer (agents, tasks, combined XP)
  - **Integration:** Added 🏆 tab to FreeRiverHouse panel mode
  - Build passes ✅
  - ⏳ Needs deploy to onde.surf (see T753)

### [T753] Deploy onde.surf with Agent Leaderboard
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-02-01
- **Depends**: [T751]
- **Blocks**: -
- **Priority**: P2
- **Notes**: ✅ Deployed! https://16163c02.onde-surf.pages.dev
  - ✅ Build via `npm run build:cf` - passed
  - ✅ Deploy via wrangler to Cloudflare Pages
  - ✅ Verified: https://onde.surf/house returns 307 (auth redirect as expected)
  - Agent Leaderboard with 🏆 tab now live in Free River House panel

### [T752] Level-up celebration animation
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-02-01
- **Depends**: [T509]
- **Blocks**: -
- **Priority**: P4
- **Notes**: ✅ Implemented level-up celebration animation!
  - ✅ Confetti falling animation (50 particles, multiple colors)
  - ✅ Celebration overlay with agent name and new level
  - ✅ Browser notification "🎉 Level Up!" when enabled
  - ✅ Toast message "🎉 [Agent] ha raggiunto il livello X!"
  - ✅ Auto-dismisses after 3 seconds
  - ✅ CSS keyframe animations in globals.css
  - ✅ Level tracking via previousLevelsRef
  - Build passes ✅

### [T510] Mood indicator basato su workload
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-02-01
- **Depends**: -
- **Blocks**: [T754]
- **Priority**: P3
- **Notes**: ✅ Implemented agent mood indicator!
  - **Function**: `calculateAgentMood()` in gamification.ts
  - **Moods:**
    - 😴 Sleepy (Riposo) - idle >1h
    - 😰 Stressed (Sovraccarico) - >5 pending tasks
    - 😊 Happy (Contento) - streak ≥3 or 10+ tasks done while working
    - 🎯 Focused (Concentrato) - working on tasks
    - 😌 Neutral (Tranquillo) - default state
  - **Display:** Badge next to status in agent panel
  - **Color-coded:** Each mood has distinct color
  - Build passes ✅
  - ⏳ Needs deploy to onde.surf (see T754)

### [T754] Deploy onde.surf with Mood indicator
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-02-01
- **Depends**: [T510]
- **Blocks**: -
- **Priority**: P2
- **Notes**: ✅ Deployed! https://63fefb5f.onde-surf.pages.dev
  - ✅ Build via `npm run build:cf` - passed
  - ✅ Deploy via wrangler to Cloudflare Pages
  - ✅ Verified: https://onde.surf/house returns 307 (auth redirect as expected)
  - Agent mood indicators (😴😰😊🎯😌) now live in Free River House panel

### [T755] Deploy onde.surf with Level-up celebration
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-02-01
- **Depends**: [T752]
- **Blocks**: -
- **Priority**: P2
- **Notes**: ✅ Deployed level-up celebration to production!
  - ✅ Build surfboard with `npm run build:cf` - passed
  - ✅ Deploy via wrangler: https://28429e71.onde-surf.pages.dev
  - ✅ Verified: https://onde.surf returns 307 (auth redirect as expected)
  - Level-up confetti and celebration now live in Free River House

### [T756] Add sound effects to level-up celebration
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-02-01
- **Depends**: [T752]
- **Blocks**: -
- **Priority**: P4
- **Notes**: ✅ Implemented level-up sound effects in Free River House!
  - ✅ Web Audio API fanfare: C5→E5→G5→C6 major chord arpeggio + C7 sparkle
  - ✅ Sound toggle button (🔊/🔇) in FreeRiverHouse header
  - ✅ Emerald color when enabled, grey when disabled
  - ✅ localStorage persistence for preference
  - ✅ Graceful fallback if audio context blocked
  - ✅ playLevelUpSound() called in triggerLevelUpCelebration()
  - Build passes ✅
  - ⏳ Needs deploy to onde.surf (see T783)

### [T757] Agent stats export to CSV
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-02-01
- **Depends**: [T509]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Implemented agent stats CSV export!
  - ✅ Export button (📥) in Leaderboard header
  - ✅ CSV includes: Rank, Agent Name, Level, Level Title, XP, Tasks Done, Current Streak, Status, Badges
  - ✅ Summary footer with totals (agents, XP, tasks) and export timestamp
  - ✅ Proper CSV escaping for commas and quotes
  - ✅ Filename includes date: `agent-stats-YYYY-MM-DD.csv`
  - ✅ Loading spinner during export
  - Build passes, needs deploy to onde.surf

### [T511] WebXR export per futuro VR
- **Status**: TODO
- **Owner**: 
- **Depends**: -
- **Blocks**: -
- **Priority**: P4
- **Notes**: Three.js/R3F scene con stanze 3D. Beach office o futuristic HQ. Bender AI per generare ambienti

### [T512] Deploy Free River House su onde.surf/house
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-29
- **Depends**: [T500], [T501], [T502], [T503]
- **Blocks**: -
- **Priority**: P1
- **Notes**: ✅ Deployed! Onde-bot (ex Ondinho) visible in house. Both onde.surf and /house return HTTP 200.

### [T513] Setup Cloudflare D1 per Virtual Office persistenza
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-29
- **Depends**: -
- **Blocks**: [T504], [T505]
- **Priority**: P1
- **Notes**: ✅ D1 già configurato! DB: onde-surf-db. Schema includes: agents, agent_tasks, books, posts, users. Migration 0005 creata per aggiungere Clawdinho/Onde-bot. ⚠️ Token API non ha D1:import - applicare migration via CF Dashboard o con token aggiornato.

### [T296] Analyze edge vs win rate correlation
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-28
- **Depends**: -
- **Blocks**: -
- **Priority**: P2
- **Notes**: ✅ Script: analyze-edge-vs-winrate.py. Groups trades by edge bucket (0-10%, 10-15%, etc.), shows win rate per bucket, checks for positive correlation (higher edge → higher WR), compares expected vs actual WR. Awaiting v2 trade data.

### [T297] Reading time for /catalogo books (Gutenberg API integration)
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-30
- **Depends**: [T263]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Added! Category-based reading estimates (200 wpm, ~250 words/page). Added categoryReadingEstimates map + getBookReadingEstimate() helper to books.ts. Updated /catalogo cards to show pages + reading time with icons.

### [T298] Book preview modal (first 3 pages)
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-31
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Implemented! Created BookPreviewModal component with: image-based page navigation (cover + up to 3 preview pages), keyboard navigation (Escape to close), animated transitions via Framer Motion, info sidebar with book details, responsive design for mobile/desktop. Added Preview button to /libri book cards. Images loaded from /books/previews/{bookId}-page-{n}.jpg with graceful fallback to cover-only view.

### [T299] Download analytics (track popular books)
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-31
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Implemented! Created useDownloadTracker hook: tracks downloads in localStorage, counts per book + format (PDF/EPUB), sends beacon to analytics endpoint. Updated /libri page: shows download count per book, total downloads counter in hero, "Be the first to download!" for new books.

---

### [T300] Momentum strength indicator on dashboard
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-30
- **Depends**: [T250]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Added visual signal bars (like cell signal) next to momentum badge. 3 bars light up based on strength: weak (1), moderate (2), strong (3). Color matches signal direction. More intuitive than text labels.

### [T301] Alert when momentum aligns across all timeframes
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-30
- **Depends**: [T259]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Implemented! Checks alignment + minimum composite strength (0.5). When all timeframes agree with strong signal, writes kalshi-momentum-aligned.alert with details per asset. 2h cooldown (rare event). Added to HEARTBEAT.md pickup.

### [T302] Momentum reversion detection
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-30
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Implemented! Functions: detect_momentum_reversion(), check_reversion_alert(), write_reversion_alert(), get_reversion_edge_adjustment(). Triggers when 4h move >2% or 8h move >3% with strong momentum (>0.7). Alert file: kalshi-momentum-reversion.alert. Provides contrarian trading signals with confidence levels. Added to HEARTBEAT.md pickup.

### [T303] Momentum divergence alert (price vs momentum)
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-30
- **Depends**: [T250]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Implemented! Functions: calculate_rsi(), detect_momentum_divergence(), check_divergence_alert(), write_divergence_alert(), get_divergence_edge_adjustment(). Detects bullish (price lower low + RSI higher low) and bearish (price higher high + RSI lower high) divergences. Alert file: kalshi-momentum-divergence.alert. 1h cooldown. Confidence levels (medium/high/very_high) based on divergence strength. Edge bonus for trades aligned with divergence signal. Added to HEARTBEAT.md pickup.

### [T304] Trading dashboard mobile responsiveness audit
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-30
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Fixed! Added responsive breakpoints (sm/md/lg/xl) for stat cards grid, header, and text sizes. Reduced padding on mobile, added truncate for text overflow, smaller icons/labels on small screens.

### [T305] Autotrader dry-run mode for strategy testing
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-30
- **Depends**: -
- **Blocks**: -
- **Priority**: P2
- **Notes**: ✅ Implemented! DRY_RUN=true env flag logs trades to kalshi-trades-dryrun.jsonl without executing. Shows 🧪 indicator in console. Useful for backtesting new strategies without risking capital.

---

### [T306] Analyze dry-run trades vs actual outcomes
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-28
- **Depends**: [T305]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Script: analyze-dryrun-trades.py. Parses KXBTCD/KXETHD tickers, fetches settlement prices from CoinGecko, calculates win rate + theoretical PnL. Caches results. Use: `python3 scripts/analyze-dryrun-trades.py --days 7`

### [T307] Position sizing comparison (fixed vs Kelly)
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-29
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Script: analyze-position-sizing.py. Simulates Full/Half/Quarter Kelly + Fixed $1/2/5. Calculates: return %, max drawdown, Sharpe ratio, avg bet size. V1 data shows 0% WR killed all aggressive strategies. Recommendation: smaller sizing beats Kelly when edge is uncertain. Results: data/trading/position-sizing-comparison.json

### [T308] API rate limit monitoring
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-29
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Implemented! Tracks calls per hour for Kalshi, CoinGecko, Binance, Coinbase, Fear&Greed. Extracts rate limit headers from responses. Alerts at 80% threshold via kalshi-rate-limit.alert. Logs to kalshi-api-rate-log.jsonl every 30min. Analysis script: analyze-api-rate-limits.py. Console shows rate limit summary with 🟢🟡🔴 indicators.

---

### [T309] Add PWA manifest for mobile install
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-30
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Created manifest.json with app metadata, theme colors, SVG icons, and shortcuts (Trading Terminal, Moonlight House). Added PWA meta tags to layout.tsx. Users can now "Add to Home Screen" on mobile.

### [T310] Keyboard shortcuts for trading dashboard
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-30
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Added! Shortcuts: R (refresh), / (focus input), ? (show shortcuts help), K (open Kalshi), H (toggle help), Esc (close modal). Modal with kbd styling. Footer hint. Help button in header.

### [T311] Stat cards collapse/expand on mobile
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-30
- **Depends**: [T304]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Added! Mobile shows first 6 stats by default. "More/Less" button in header expands all 15 cards. Keyboard shortcut 'E' toggles expand. CSS selector `max-md:[&>*:nth-child(n+7)]:hidden` hides cards 7+ on mobile.

### [T312] Service worker for offline PWA caching
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-30
- **Depends**: [T309]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Created sw.js with 3 caching strategies: 1) Cache-first for static assets, 2) Network-first for API routes with cache fallback, 3) Network-first for HTML with offline support. Precaches /, /betting, /house. ServiceWorkerRegistration component auto-registers and handles updates. API responses cached for 60s TTL.

### [T313] Export trading stats to Google Sheets
- **Status**: TODO
- **Owner**: 
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: Script to push daily trading stats to Google Sheets for historical tracking and charting. Use Google Sheets API with service account.

### [T314] Voice TTS alerts for significant trading events
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-30
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Implemented trading voice alerts script!
  - **Script**: `scripts/trading-voice-alerts.py`
  - **TTS providers**: ElevenLabs (if configured) or macOS `say` fallback
  - **Event types**:
    - `circuit_breaker` - Trading paused
    - `big_win` / `big_loss` - Significant trades
    - `regime_change` - Volatility transitions
    - `streak` - Win/loss streaks
    - `daily_summary` - End of day summary
    - `stop_loss` - Stop loss executed
    - `low_winrate` / `high_winrate` - Performance alerts
  - **Features**:
    - `--telegram` flag sends voice message to Telegram
    - `--play` flag plays audio locally
    - Emoji stripped from TTS text for natural speech
  - **Usage**: `python3 scripts/trading-voice-alerts.py --event big_win --details "BTC +$50" --telegram`
  - **Env vars**: ELEVENLABS_API_KEY, ELEVENLABS_VOICE, TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID

### [T315] Light/dark mode toggle for trading dashboard
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-28
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Added! ThemeToggle component with animated sun/moon icons in header. Keyboard shortcut 'T' on /betting. Light mode CSS already existed. Persists to localStorage via ThemeProvider.

### [T316] Touch gestures for mobile dashboard
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-29
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Implemented! Created useTouchGestures.tsx hook with: pull-to-refresh with visual indicator (PullToRefreshIndicator component), swipe-down/left/right callbacks, configurable thresholds, ref-based fetchData pattern for proper hook ordering. Integrated into /betting page - pull down from top to refresh data.

### [T317] Position size display in Kalshi positions list
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-31
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Enhanced position cards! Now shows: 1) Asset type indicator (BTC/ETH), 2) YES/NO side (clearer than LONG/SHORT), 3) Contracts count with per-contract cost in cents, 4) PnL if available, 5) Max win potential calculation. Better visual hierarchy with grouped info.

### [T318] Offline indicator UI for PWA
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-30
- **Depends**: [T312]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Created OfflineIndicator component. Shows orange banner when offline ("showing cached data"), green toast when reconnected (auto-hides 3s). Uses navigator.onLine + online/offline events. Animated with Tailwind.

### [T319] SW cache version bump script
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-30
- **Depends**: [T312]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Created scripts/bump-sw-version.sh. Auto-increments cache version (v1→v2) or accepts custom version. Updates CACHE_NAME, STATIC_CACHE, API_CACHE. Run before deploy to force fresh caches.

### [T320] Background sync for trading dashboard refresh
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-31
- **Depends**: [T312]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Implemented! Updated sw.js (v1.1.0) with Background Sync support: sync tags for trading-stats/momentum/all, sync event handler, performSync() for batch API refresh, notifyClientsOfSync() for UI updates, fallback queue for browsers without Sync API. Created useBackgroundSync hook with: requestSync() for queueing, forceSync() for immediate refresh, smartSync() for online/offline-aware sync. Automatic processing of pending syncs when online.

### [T321] Precache additional routes in service worker
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-30
- **Depends**: [T312]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Added /corde, /pr, /robots.txt to PRECACHE_ASSETS. Added /api/health/cron to API_ROUTES. Better offline coverage for all main pages.

### [T322] Cache invalidation on API error recovery
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-29
- **Depends**: [T312]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Implemented! Created time utilities and LastUpdatedIndicator component:
  - **Files**: `lib/time-utils.ts`, `components/LastUpdatedIndicator.tsx`
  - **Features**: 
    - Relative time display (e.g., "2m ago", "1h ago")
    - Color-coded staleness (green=fresh, yellow=stale >5min, red=very stale >15min)
    - Cache indicator when serving from SW cache
    - Auto-updates every 10s to keep time current
    - Refresh button on stale data
  - **Integration**: Updated /betting page to track cache status and show indicator
  - Also fixed pre-existing `statsLoading` bug (should be `isLoading`)

### [T323] Network status in /health page
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-28
- **Depends**: [T318]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Added! Shows: 1) Online/offline status with Network Information API details (effectiveType, downlink, RTT), 2) Service Worker status (active/installing/waiting/none) with cache version, 3) Cache Storage usage bar with percentage. Auto-refreshes every 30s, responds to online/offline events.

### [T324] Performance metrics on /health page (Core Web Vitals)
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-29
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Added! Uses web-vitals library. Shows CLS, FCP, INP, LCP, TTFB with color-coded ratings (good/needs-improvement/poor) per Google's thresholds. Grid layout, auto-updates as metrics become available.

### [T325] Browser storage breakdown (cookies, localStorage, sessionStorage)
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-30
- **Depends**: [T323]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Added Browser Storage section to /health page. Shows localStorage, sessionStorage, cookies with size (formatted bytes) and item count. StorageCard component with emoji icons.

### [T326] SW update button when waiting version available
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-28
- **Depends**: [T323]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Added! When swStatus is 'waiting', shows "🔄 Update Now" button. Triggers postMessage({type:'SKIP_WAITING'}) to activate new SW. Added message handler to sw.js. Button shows loading state, auto-reloads page on update.

### [T327] Latency threshold alert (>2s avg)
- **Status**: DONE (duplicate of T295)
- **Owner**: @clawd
- **Completed**: 2026-01-30
- **Depends**: [T294]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Implemented in T295. Alert file kalshi-latency.alert when avg >2s. Heartbeat pickup enabled.

### [T328] Latency trend chart on dashboard
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-31
- **Depends**: [T294]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Implemented! Created LatencyTrendChart component (SVG-based, shows avg + P95 with area fill). Color-coded by latency quality (<500ms green, 500-1000ms orange, >1000ms red). Shows trend direction (faster/slower/stable). Script compute-latency-trend.py computes daily aggregates. Integrated into /betting dashboard + gist stats include latency trend data.

### [T329] Trade execution success rate tracking
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-29
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Implemented! Added EXECUTION_LOG_FILE + log_execution() function to autotrader-v2. Logs all order attempts (success/error/pending) with latency, ticker, side, count, status. Script: analyze-execution-rate.py analyzes success rate, latency stats, by-asset breakdown. Tracks both regular trades and stop-loss executions.

### [T330] API call count monitoring per hour
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-29
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Script: track-api-calls.py. Logs to api-calls.jsonl, shows current hour stats + 24h summary. Rate limit warnings. Flags: --status, --summary, --reset, --log. JSON output to data/trading/api-call-stats.json.

### [T331] Trade prediction accuracy logging for ML
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-29
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Implemented! log_ml_features() in autotrader-v2.py logs 30+ features per trade to data/trading/ml-training-data.jsonl. Features: price_*, momentum_*, regime_*, vol_*, time_*, prob_*. Script: update-ml-outcomes.py reconciles with settlement results. Exports to CSV for model training. Usage: `python3 scripts/update-ml-outcomes.py --analyze` or `--export-csv`.

### [T332] VIX correlation with crypto volatility
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-29
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Script: analyze-vix-correlation.py. Fetches VIX from Yahoo Finance, correlates with BTC/ETH daily vol. Shows: correlation coefficient, VIX regime (low_fear/moderate/elevated/high_fear), trading insights. Cache: data/trading/vix-history.json + vix-correlation.json. Usage: `python3 scripts/analyze-vix-correlation.py --days 30 --asset btc`

### [T333] Real-time trade ticker on /betting
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-30
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Created TradeTicker component! Smooth scrolling animation using requestAnimationFrame, pause on hover, shows: asset badge (BTC/ETH), side (YES/NO), strike price, contracts×price, result status (✓/✗/⏳). Integrated into /betting dashboard above stats grid. Also added TradeTickerStatic variant for non-scrolling displays.

### [T334] Book category filtering on /catalogo
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-31
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Added! Quick-filter pills for top 8 categories with counts, URL persistence for all filters (category, lang, search, sort), active filter indicator with clear button, Suspense fallback, dark mode support.

### [T335] WCAG accessibility audit
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-31
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Fixed! Lighthouse a11y audit 89%→100%: Added aria-label/aria-expanded to mobile menu button, fixed heading hierarchy (h4→h2 in footer), added aria-labels to social links, added aria-hidden to decorative icons.

---

### [T336] System theme preference detection (prefers-color-scheme)
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-29
- **Depends**: [T315]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Added! ThemeProvider now detects OS `prefers-color-scheme`. Theme cycles: dark → light → system. System mode auto-follows OS preference with real-time listener. Monitor icon for system mode. First-visit defaults to system.

### [T337] Smooth theme transition animations
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-29
- **Depends**: [T315]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Added! Body has 0.3s ease transition for background and color. Theme toggle icons already had animations. Smooth fade between dark/light/system modes.

### [T338] Theme-aware chart colors for trading graphs
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-30
- **Depends**: [T315], [T328]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Implemented theme-aware colors in WinRateTrendChart and LatencyTrendChart!
  - Both charts now use useTheme() hook to detect dark/light mode
  - Grid lines adapt: darker in light mode, lighter in dark mode
  - Labels have proper contrast in both modes
  - Trend colors (green/red/orange) adjusted for better light-mode contrast
  - Container backgrounds swap: zinc-800/50 (dark) → gray-100/80 (light)
  - Text colors adapt throughout: zinc-400/500 (dark) → gray-500/600 (light)

### [T339] Add link to /trading/history from /betting dashboard
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-28
- **Depends**: [T096]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Added "View All Trades" link with arrow icon below Recent Trades grid. Links to /trading/history. Styled consistently with glass design.

### [T340] Date range picker for trade history
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-28
- **Depends**: [T096]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Added From/To date pickers to /trading/history filters. Uses native date inputs. Auto-resets to page 1 when dates change. Clear button resets dates too. Styled consistent with existing filters.

### [T341] Keyboard navigation for trade history table
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-31
- **Depends**: [T096]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Added vim-style navigation! j/k for rows, g/G first/last, h/l or arrows for pages, r refresh, f filters, ? help modal. Click to select rows, Esc to clear. Blue highlight ring for selected row.

### [T342] Trading history API caching
- **Status**: N/A
- **Owner**: @clawd
- **Completed**: 2026-01-30
- **Depends**: [T260]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ⏭️ N/A: /api/trading/history runs on Edge runtime (Cloudflare), cannot access local files. Returns mock data on production. Caching not applicable for edge deployment.

### [T343] Cache invalidation endpoint for trading APIs
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-31
- **Depends**: [T260]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Script: invalidate-trading-cache.sh. Since static site uses GitHub Gist (T277), cache invalidation triggers push-stats-to-gist.py immediately. Supports --v1, --v2 (default), --all sources. Gist has no-cache headers so browsers get fresh data.

### [T344] Trading stats for v2 autotrader file
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-30
- **Depends**: -
- **Blocks**: -
- **Priority**: P2
- **Notes**: ✅ Added ?source=v2 param. Reads from kalshi-trades-v2.jsonl (v1 default). Separate cache files per source. Returns source in response.

### [T345] Dashboard toggle for v1/v2 stats
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-28
- **Depends**: [T344]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Added toggle button group in Trading Performance header. v1/v2 buttons with visual active state. Defaults to v2. Triggers refetch when changed. Styled consistent with existing UI.

### [T346] Combined v1+v2 trading stats view
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-29
- **Depends**: [T344]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Added --source v1|v2|all flag to push-stats-to-gist.py. Combined view shows total stats + bySource breakdown per version. Fixed gh gist API update to use REST endpoint. Gist now includes source field and v1/v2 comparison.

### [T347] V2 trades settlement tracking
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-30
- **Depends**: [T344]
- **Blocks**: -
- **Priority**: P2
- **Notes**: ✅ Updated! Now processes both v1 and v2 files by default. Separate settlements JSON per source. CLI flags: --v1, --v2, --stats (shows both).

### [T348] Settlement cron job for v2 trades
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-30
- **Depends**: [T347]
- **Blocks**: -
- **Priority**: P2
- **Notes**: ✅ Verified! Cron runs every hour. Script already processes both v1 and v2 files by default (T347). V2 file will be auto-processed when first v2 trades are made.

### [T349] Unified settlements dashboard
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-30
- **Depends**: [T347]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Implemented! Created /api/trading/settlements route (edge runtime placeholder) + added settlements stats to GitHub Gist via push-stats-to-gist.py. Gist now includes v1/v2/combined settlement stats with by-asset breakdown, win rates, PnL, and timestamps.

### [T350] V2 win rate comparison chart
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-30
- **Depends**: [T344], [T347]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Created ModelComparisonChart component! Shows side-by-side v1 vs v2 comparison with: win rate progress bars, PnL display, trade counts, improvement summary when both have data, model descriptions (v1=legacy, v2=Black-Scholes). Handles edge cases (no data, only v1, only v2). Added to /betting dashboard after volatility analysis.

### [T351] Real sprite images for Luna moods
- **Status**: TODO
- **Owner**: 
- **Depends**: [T050]
- **Blocks**: -
- **Priority**: P3
- **Notes**: Upgrade CSS-based mood effects to actual sprite images. 6 states: luna-happy.png, luna-neutral.png, luna-sad.png, luna-sleepy.png, luna-hungry.png, luna-excited.png. Use AI image generation or commission artist.

### [T352] Luna idle animations per room
- **Status**: TODO
- **Owner**: 
- **Depends**: [T050]
- **Blocks**: -
- **Priority**: P3
- **Notes**: Room-specific idle animations: bedroom (yawn), kitchen (look at food), garden (look at flowers), living (watch TV), etc. Make Luna feel more alive.

### [T353] Save game state to localStorage
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-30
- **Depends**: -
- **Blocks**: -
- **Priority**: P2
- **Notes**: ✅ Implemented! SaveData interface stores stats, achievements, gameState (with roomsVisited as array for JSON). loadSaveData() on mount initializes state. saveSaveData() in useEffect auto-saves on any change. Progress persists across browser refreshes.

### [T354] Verify settlement prices match Kalshi official
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-31
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Validated! Script: validate-settlement-prices.py. Compares CoinGecko prices with Coinbase at settlement times. Results: Mean Absolute Error = 0.04%, Max Error = 0.08%. Status: ✅ GOOD. Our settlement tracker is highly accurate. Binance unavailable (geo-blocked), uses Coinbase as validation source.

### [T355] Paper balance tracking in dry-run mode
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-30
- **Depends**: [T305]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Script: kalshi-dryrun-balance.py. Tracks virtual $100 balance for dry-run trades. Uses CoinGecko for settlement prices. Flags: --reset (restart), --status (show balance). State: kalshi-dryrun-balance.json. Shows win rate, PnL, pending trades.

### [T356] Strategy parameter sweep (MIN_EDGE optimization)
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-30
- **Depends**: [T306]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Implemented! Script: `scripts/edge-parameter-sweep.py`
  - Tests thresholds: 5%, 8%, 10%, 12%, 15%, 20%, 25%, 30%
  - Calculates: win rate, PnL, ROI, avg edge for each threshold
  - Finds optimal by: win rate, PnL, ROI, balanced score
  - Output: `data/backtests/edge-sweep.json`
  - **Key Finding**: All v2 trades have edge >60% (weather trades with high calculated edge)
    - V2: 40% WR regardless of threshold (all trades pass all thresholds)
    - V1: 0% WR (broken model confirmed)
  - **Insight**: Edge threshold is NOT the issue - probability model accuracy is
  - **Recommendation**: Focus on improving probability model, not edge threshold
  - Asset breakdown included (crypto vs weather)

### [T357] Add streak stats to daily summary report
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-30
- **Depends**: [T288], [T085]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Added streak section to daily summary! Shows: current streak (🔥 wins / ❄️ losses), best win streak 🏆, worst loss streak 💀. Added calculate_streaks() function to daily summary script. Prefers v2 trade log.

### [T358] Analyze win rate by day of week
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-30
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Script: analyze-trades-by-weekday.py. Shows per-day stats (trades, W/L, win rate, PnL, ROI). Includes weekend vs weekday comparison and insights. Usage: `python3 scripts/analyze-trades-by-weekday.py [--v2]`

### [T359] Add streak visualization to /betting dashboard
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-28
- **Depends**: [T287], [T288]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Added "Trade History Pattern" section with colored dots (green=won, red=lost, gray=pending). Shows last 10 trades. Dots have glow effect and hover tooltip with trade details. Responsive sizing.

### [T360] Quick date filter presets for trade history
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-30
- **Depends**: [T340]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Added! Preset buttons (All, Today, 7D, 30D) in filter bar. Auto-detects active preset, highlights with blue. Separated by border from other filters. Clicking sets from/to dates automatically.

### [T361] Daily PnL summary in trade history header
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-31
- **Depends**: [T340]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Added summary bar to /trading/history with: total PnL (color-coded), trades breakdown (W/L/P), win rate %, date range display. Shows pagination note when viewing partial results. Uses useMemo for efficient calculation.

### [T362] JSON export option for trade history
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-30
- **Depends**: [T096]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Added! FileJson icon button next to CSV export. Exports full trade data with metadata (timestamp, filters, all fields including regime/reason). Formatted JSON with indent.

### [T363] Date range display in trading stats header
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-30
- **Depends**: [T203]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Added! Shows active date filter in cyan under "Trading Performance" title. Formats: "Today", "Last 7 days", "Last 30 days", or custom "Jan 20 → Jan 27". Only shows when filter is not "All time".

### [T364] Date range comparison mode (vs previous period)
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-30
- **Depends**: [T203]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Implemented period comparison!
  - **Backend (push-stats-to-gist.py):** Added yesterdayTrades/WinRate/PnlCents, thisWeek/prevWeek stats
  - **Frontend (ComparisonIndicator.tsx):** New component showing +/- delta with icons
  - **UI:** Today PnL and Today WR cards now show "vs yesterday" comparison
  - **Types:** pnl (dollar change), rate (percentage point), count (absolute)
  - Comparison only shows when previous period has data

### [T365] URL sync for trading stats filters
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-30
- **Depends**: [T203]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Added! Filters sync to URL (?source=v1&period=week&from=...&to=...). Loads from URL on mount. Uses router.replace for history-friendly updates. Defaults omitted from URL.

### [T366] Stop-loss effectiveness over time dashboard widget
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-31
- **Depends**: [T247], [T240]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Implemented stop-loss effectiveness widget!
  - **Component**: `apps/surfboard/src/components/StopLossEffectivenessWidget.tsx`
  - **Backend**: `load_stop_loss_stats()` function added to `push-stats-to-gist.py`
  - **Features:**
    - Effectiveness percentage (correct exits / total known outcomes)
    - Estimated money saved vs holding to settlement
    - Outcome breakdown: saved (green), premature exits (red), pending (gray)
    - Net benefit calculation (saved - missed profit)
    - Expandable event list with last 10 stop-losses
    - Color-coded outcome badges and values
    - Empty state when no stop-losses triggered yet
  - **Data flow:** stop-loss.log → push-stats-to-gist.py → gist → widget
  - **Integrated into** /betting page after CorrelationHeatmapWidget
  - Build passes, ready for deploy

### [T772] Trading: Model calibration tracking - predicted vs actual probabilities
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-31
- **Depends**: [T356]
- **Blocks**: -
- **Priority**: P2
- **Notes**: ✅ Implemented model calibration analysis script!
  - **Script**: `scripts/analyze-model-calibration.py`
  - **Output**: `data/trading/calibration-analysis.json`
  - **Features:**
    - ✅ Loads trades from all kalshi-trades-*.jsonl files
    - ✅ Filters to settled trades with our_prob data
    - ✅ Buckets predictions (0-20%, 20-40%, etc.)
    - ✅ Calculates actual win rate per bucket
    - ✅ Brier score calculation (lower = better)
    - ✅ Expected Calibration Error (ECE)
    - ✅ Over/under-confidence assessment
    - ✅ Detailed report with interpretation
    - ✅ JSON output option (--json flag)
  - **Initial findings (276 trades):**
    - Brier score: 0.237 (mediocre)
    - 40-60% bucket: 246 trades, 0% actual win rate ⚠️
    - 0-20% bucket: 30 trades, 40% actual win rate
    - **Action needed**: Investigate probability calculation issues
  - ⏳ Dashboard widget (future)

### [T773] Trading: Weather forecast accuracy validator
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-31
- **Depends**: -
- **Blocks**: -
- **Priority**: P2
- **Notes**: ✅ Implemented weather forecast validation!
  - **Script**: `scripts/validate-weather-forecasts.py`
  - **Output**: `data/trading/weather-forecast-accuracy.json`
  - **Features:**
    - ✅ Loads weather trades from all trade files
    - ✅ Fetches actual temps from Open-Meteo historical archive
    - ✅ Calculates MAE, RMSE, bias by city and horizon
    - ✅ Identifies systematic over/under-prediction
    - ✅ Detailed validation report
    - ✅ JSON output option (--json)
  - **Initial findings (30 trades):**
    - MAE: 2.81°F (reasonable but not ideal)
    - **Bias: +2.8°F (over-predicting by ~3°F!)** ⚠️
    - CHI: 29 trades, +2.8°F bias
    - NY: 1 trade, +3.0°F bias
    - All within ±3°F
  - **Recommendation**: Adjust NWS forecast down by ~3°F for better edge calculation

### [T774] Trading: Add backtesting with historical OHLC data
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-30
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Implemented backtesting framework for crypto trades!
  - **Script**: `scripts/backtest-crypto-strategy.py`
  - **Features:**
    - ✅ Load historical OHLC data from cache (data/ohlc/*.json)
    - ✅ Simulate trade decisions using momentum + RSI signals
    - ✅ Track what trades WOULD have been taken and outcomes
    - ✅ Compare simulated entry vs settlement prices
    - ✅ Parameter sweep mode to find optimal edge thresholds
    - ✅ Analysis by momentum (bullish/bearish/neutral)
    - ✅ Analysis by RSI zone (oversold/neutral/overbought)
    - ✅ Recommendations based on win rate
  - **Output**: `data/backtests/crypto-backtest-{asset}-{timestamp}.json`
  - **Usage:**
    - `python backtest-crypto-strategy.py` - Default BTC backtest
    - `python backtest-crypto-strategy.py --all-assets` - BTC + ETH
    - `python backtest-crypto-strategy.py --sweep` - Parameter optimization
    - `python backtest-crypto-strategy.py --verbose --save` - Detailed output + save
  - **Initial findings:**
    - BTC: 75% win rate with edge_min=5.0
    - ETH: 100% win rate with edge_min=5.0 (limited sample)
    - Oversold RSI zones show highest win rates

### [T367] Circuit breaker cooldown configuration via env
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-31
- **Depends**: [T289]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Implemented! CIRCUIT_BREAKER_COOLDOWN_HOURS env var (default 4h). Circuit breaker now resumes after EITHER a win OR cooldown elapsed. Shows remaining hours in status message. Alert includes cooldown info.

### [T368] Trade edge confidence buckets on dashboard
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-31
- **Depends**: [T296]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Implemented! EdgeDistributionChart component on /betting dashboard:
  - **6 edge buckets**: 0-5%, 5-10%, 10-15%, 15-20%, 20-30%, 30%+
  - **Bar chart**: Height = trade count, color = win rate (green ≥50%, yellow 40-50%, red <40%)
  - **Correlation indicator**: Shows if model is calibrated (higher edge → higher WR)
  - **Data source**: push-stats-to-gist.py now includes edgeDistribution field
  - **Interactive**: Hover for win rate %, trade count per bucket
  - Insight box explains correlation status

### [T369] Analyze trades by volatility bucket
- **Status**: DUPLICATE
- **Owner**: @clawd
- **Completed**: 2026-01-29
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: ⚠️ DUPLICATE of T285 (analyze-volatility-correlation.py). Already buckets trades by hourly volatility (very_low to very_high) and compares win rates.

### [T370] Memory files age warning in heartbeat
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-30
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Script: check-memory-age.sh. Checks MEMORY.md, memory/*.md, SOUL.md, USER.md, TOOLS.md, HEARTBEAT.md for >7 days old. 24h cooldown. Alert file: memory-stale.alert. Added to HEARTBEAT.md pickup.

### [T371] Dark mode toggle for trading dashboard
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-30
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Added! Toggle button in header with Sun/Moon/Monitor icons for light/dark/system. Keyboard shortcut 'T'. Background, grid, and container adapt to theme. Persists in localStorage via ThemeProvider.

### [T372] Add language switcher UI to onde-portal header
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-30
- **Depends**: -
- **Blocks**: -
- **Priority**: P2
- **Notes**: ✅ Already implemented! LanguageSwitcher.tsx component with globe icon, dropdown menu showing EN/IT with checkmark for active. Integrated in Navigation.tsx for both desktop and mobile views. Uses useLocale() from i18n context.

### [T373] Convert homepage (page.tsx) to use i18n translations
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-30
- **Depends**: -
- **Blocks**: -
- **Priority**: P2
- **Notes**: ✅ Homepage now uses useTranslations()! Added hero.*, whyOnde.*, featuresNew.*, library.*, testimonials.*, ctaNew.*, footerNew.* translation keys to en.json and it.json. Respects user language preference via i18n system.

### [T374] Audit remaining pages for hardcoded strings
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-31
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ All pages converted to i18n! /famiglia (T422), /collezioni, /giochi (T423), /about (T424), /health (T425). Homepage + catalogo were already done. Full Italian localization complete.

### [T375] Analyze vol_aligned trades vs non-aligned
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-31
- **Depends**: [T237]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Script: analyze-vol-alignment.py. Compares aligned vs not_aligned win rate, PnL, ROI. Includes vol_bonus bucket analysis, asset/side breakdown. V1 trades lack vol_aligned field (pre-T237). V2 awaiting settled trades. Output: data/trading/vol-alignment-analysis.json

### [T376] Volatility preference alert (multi-day divergence)
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-02-01
- **Depends**: [T237]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Implemented volatility preference alerting!
  - **Script**: `scripts/volatility-preference-alert.py`
  - **Features:**
    - Tracks vol_ratio per asset (BTC, ETH) over consecutive cycles
    - Alerts when vol_ratio stays >1.2 for 3+ consecutive cycles
    - 6-hour cooldown per asset to avoid spam
    - State persistence in `data/trading/vol-preference-state.json`
    - Alert file: `scripts/kalshi-vol-preference.alert`
  - **Cron**: Every 4 hours (`0 */4 * * *`)
  - **Usage:**
    - `python3 volatility-preference-alert.py` - Check and update
    - `python3 volatility-preference-alert.py --status` - Show tracking state
    - `python3 volatility-preference-alert.py --reset` - Reset state
  - Helps identify sustained edge opportunities when realized vol exceeds model assumptions.

### [T377] Historical volatility vs model assumptions analysis
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-31
- **Depends**: [T237]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Script: check-vol-calibration.sh. Runs calculate-historical-volatility.py, checks 30d deviation >20%. Alert file: kalshi-vol-recalibration.alert. Cron: Sunday 08:00 UTC. Finding: Model currently overestimates vol (BTC -36%, ETH -34%).

### [T378] GA4 custom events for book downloads
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-31
- **Depends**: [T040]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Implemented! Added GA4 events: 1) book_download (bookId, format) in useDownloadTracker.tsx, 2) book_preview (bookId, title) in BookPreviewModal.tsx, 3) add_to_reading_list (bookId) in useReadingList.ts. All use gtag() with event_category: 'engagement'. Silently fail if GA not loaded.

### [T379] Trading PnL daily goal tracker
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-30
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Implemented! DailyGoalTracker component on /betting dashboard:
  - Configurable daily profit target (editable inline, persists to localStorage)
  - Progress bar showing current P&L vs goal (supports negative/behind)
  - Status indicators: Goal Met 🎉 (green), On Track (yellow), Behind (red)
  - Goal hit rate tracking with last 30 days history
  - Expandable history view showing daily goal vs achieved
  - Responsive design with glass morphism styling

### [T380] Reading list / bookmark feature for books
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-31
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Implemented! useReadingList hook (localStorage), bookmark buttons on /libri book cards, reading list counter in hero, dedicated /my-books page with empty state + bookmarked books grid. i18n translations added (EN/IT). Clear list button.

### [T381] Use cached OHLC in autotrader momentum calculation
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-29
- **Depends**: [T278]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Implemented! Added load_cached_ohlc() function to autotrader-v2. Strategy: 1) Try cache first, 2) If fresh (<24h), use it, 3) If stale but exists, try live API then fallback to cache, 4) Reduces CoinGecko calls from ~12/cycle to 0-2. Tested: BTC/ETH cache loading works, 180 candles each.

### [T382] OHLC cache health check in heartbeat
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-29
- **Depends**: [T278]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Implemented! Script: check-ohlc-cache.sh. Checks if data/ohlc/*.json >24h old or missing. Creates ohlc-cache-stale.alert for heartbeat pickup. 6h cooldown. Added to HEARTBEAT.md alert list.

### [T383] Calculate historical volatility from cached OHLC
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-29
- **Depends**: [T278]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Script: calculate-historical-volatility.py. Computes 7d/14d/30d/60d volatility from cached OHLC. Converts 4h candle vol to hourly. Compares to model assumptions. Output: data/ohlc/volatility-stats.json. Finding: Model currently OVERESTIMATES vol (BTC 0.32% actual vs 0.5% assumed, ETH 0.46% vs 0.7%).

### [T384] Price source reliability tracking
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-29
- **Depends**: [T246]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Script: track-api-reliability.py. Checks BTC/ETH availability from Binance, CoinGecko, Coinbase. Logs to api-reliability.jsonl. --report generates uptime % and recommendations. Cron: hourly check, weekly report (Sunday 10:00 UTC). Finding: Binance blocked (geo-restricted), CoinGecko/Coinbase 100%.

### [T385] Price spread anomaly detection
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-29
- **Depends**: [T246]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Script: detect-price-spread.py. Monitors BTC/ETH prices from Binance, CoinGecko, Coinbase. Alerts when spread >1%. Logs anomalies to price-anomalies.jsonl. Features: continuous mode, history view, 30min cooldown. Alert file: kalshi-price-spread.alert. Added to HEARTBEAT.md pickup.

### [T386] Add exchange sources to trade logs
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-30
- **Depends**: [T246]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Added "price_sources" field to trade_data. Shows which exchanges (binance, coingecko, coinbase) contributed to the price at trade entry. Enables future analysis of source-specific win rates.

### [T387] Streak position stats on /betting dashboard
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-30
- **Depends**: [T290]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Implemented streak position analysis widget!
  - **Script update**: `analyze-streak-position.py` now saves JSON to `data/trading/streak-position-analysis.json`
  - **Stats integration**: `push-stats-to-gist.py` includes `streakPosition` data
  - **Widget**: `StreakPositionWidget.tsx` with:
    - Win rate by context (after N wins/losses)
    - Streak continuation probability
    - Key insights (hot hand, tilt risk)
    - Progress bars with color-coded win rates
  - **Integration**: Added to /betting page after Correlation Heatmap
  - ⏳ Needs deploy to onde.surf (separate task)

### [T388] Streak-based position sizing adjustment
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-02-01
- **Depends**: [T290]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Implemented streak-based position sizing in kalshi-autotrader-v2.py!
  - ✅ New env var: `STREAK_SIZE_REDUCTION` (default 0.7 = 70% of normal size)
  - ✅ Applies reduction when tilt_risk (3+ consecutive losses) or hot_hand (3+ consecutive wins)
  - ✅ Logs `streak_multiplier` in trade data for analysis
  - ✅ Console output shows streak adjustment when applied
  - ✅ Integrated with existing regime/vol multipliers in total_multiplier
  - Prevents psychological trading errors during streaks.

### [T389] Historical streak analysis by asset (BTC vs ETH)
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-02-01
- **Depends**: [T290], [T236]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Extended analyze-streak-position.py with per-asset analysis!
  - ✅ New `analyze_by_asset()` function groups trades by asset (btc/eth/weather)
  - ✅ Calculates streak continuation rates per asset
  - ✅ Compares BTC vs ETH patterns (win rate diff, tilt patterns)
  - ✅ New `print_asset_analysis()` for formatted console output
  - ✅ JSON output now includes `by_asset` and `asset_comparison` fields
  - Usage: `python3 scripts/analyze-streak-position.py --v2 --min-trades 2`
  - Note: BTC/ETH comparison activates when both have sufficient data.

### [T390] Log position size multipliers in trade data
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-30
- **Depends**: [T293]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Added to trade_data: kelly_fraction_base, kelly_fraction_used, regime_multiplier, vol_multiplier, size_multiplier_total. Enables analysis of how sizing adjustments correlate with outcomes per T391.

### [T391] Analyze volatility-adjusted sizing effectiveness
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-30
- **Depends**: [T390]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Script: analyze-sizing-effectiveness.py. Categorizes trades by size multiplier (reduced/standard/increased), compares win rate, PnL, ROI. Usage: `python3 scripts/analyze-sizing-effectiveness.py [--v2] [--threshold 0.1]`. Output: data/trading/sizing-effectiveness.json. Awaiting trades with T390 data.

### [T392] Compare cached vs live OHLC momentum accuracy
- **Status**: TODO
- **Owner**: 
- **Depends**: [T381]
- **Blocks**: -
- **Priority**: P3
- **Notes**: Track when momentum calc uses cached vs live data. Compare accuracy of resulting trades. Validates that cached OHLC doesn't degrade performance.

### [T393] Whipsaw detection (momentum flip twice in same day)
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-30
- **Depends**: [T259]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Implemented! check_whipsaw() tracks direction_history in momentum state, detects 2+ bullish↔bearish flips within 24h. Alert file: kalshi-whipsaw.alert (2h cooldown). Recommends reduced position sizes for choppy conditions. Added to HEARTBEAT.md pickup.

### [T394] Analyze win rate by momentum alignment status
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-30
- **Depends**: [T301]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Script: analyze-momentum-alignment.py. Categorizes trades by alignment (full/partial/none), compares win rate, PnL, ROI. Usage: `python3 scripts/analyze-momentum-alignment.py [--v2]`. Output: data/trading/momentum-alignment-analysis.json. V2 trades will have proper alignment data.

### [T395] Log momentum alignment status in trade data
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-30
- **Depends**: [T301]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Added full_alignment field to opportunity data + trade_log. Captures when all timeframes (1h/4h/24h) agree regardless of direction. Enables T394 analysis of alignment effectiveness.

### [T396] Latency-based exchange source prioritization
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-02-01
- **Depends**: [T279]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Implemented dynamic exchange prioritization!
  - **Function**: `get_optimal_exchange_order()` in kalshi-autotrader-v2.py
  - **Features:**
    - ✅ Reads latency profile from kalshi-latency-profile.json
    - ✅ Sorts exchanges by avg latency (fastest first)
    - ✅ Requires min 3 calls per exchange for reliable data
    - ✅ Falls back to default order when insufficient data
    - ✅ `print_exchange_priority()` helper for debugging
  - **Integration**: Modified `get_crypto_prices()` to use dynamic order
  - **Current priority**: Binance (151ms) > CoinGecko (212ms) > Coinbase (446ms)
  - **Toggle**: `DYNAMIC_EXCHANGE_ORDER=false` to disable

### [T397] Latency anomaly detection and alerting
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-02-01
- **Depends**: [T279]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Implemented latency anomaly detection!
  - **Script**: `scripts/latency-anomaly-detector.py`
  - **Features:**
    - ✅ Tracks historical latency in `data/trading/latency-history.jsonl`
    - ✅ Calculates rolling avg + std dev from last 50 entries
    - ✅ Statistical anomaly: alerts when current > baseline + 2σ
    - ✅ Absolute thresholds: warning >1s, critical >2s
    - ✅ Per-endpoint monitoring (Kalshi, Binance, CoinGecko, Coinbase)
    - ✅ 2-hour cooldown to avoid spam
    - ✅ Alert file: `scripts/kalshi-latency.alert`
  - **Cron**: `*/30 * * * *` (every 30 min)
  - **Usage**: `python3 scripts/latency-anomaly-detector.py [--verbose] [--dry-run] [--force]`

### [T398] Latency dashboard on /health page
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-31
- **Depends**: [T279], [T256]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Implemented! Added API Latency section to /health page showing: overall avg latency, total calls, per-category breakdown (Kalshi, CoinGecko, Binance, Coinbase), color-coded performance indicators, top 3 slowest endpoints. Data fetched from trading stats gist (updated push-stats-to-gist.py to include apiLatency from kalshi-latency-profile.json). Shows loading state and graceful fallback when no data available.

### [T410] Holiday trading performance analysis
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-02-01
- **Depends**: [T295]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Implemented holiday trading analysis!
  - **Script**: `scripts/analyze-holiday-trading.py`
  - **Features:**
    - ✅ US market holidays for 2024-2026 pre-computed
    - ✅ Analyzes trades on holidays vs normal days
    - ✅ Includes day-before major holidays (reduced liquidity)
    - ✅ Per-holiday breakdown (Thanksgiving, Christmas, etc.)
    - ✅ Win rate and ROI comparison
    - ✅ Insights and recommendations
  - **Holidays tracked**: New Year's, MLK, Presidents Day, Memorial Day, Juneteenth, Independence Day, Labor Day, Veterans Day, Thanksgiving, Christmas
  - **Output**: `data/trading/holiday-analysis.json`
  - **Usage**: `python3 scripts/analyze-holiday-trading.py [--v2] [--year YEAR]`

### [T411] Time-of-day heatmap visualization on dashboard
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-30
- **Depends**: [T249]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Implemented time-of-day trading heatmap!
  - **Script**: `scripts/analyze-trades-by-hour-day.py` - generates heatmap data
  - **Component**: `apps/surfboard/src/components/TimeOfDayHeatmap.tsx`
  - **Features:**
    - 7 days × 24 hours grid visualization
    - Color-coded cells by win rate (green=profitable, red=losing)
    - Trade count displayed in each cell
    - Tooltips with detailed stats (trades, won/lost, win rate, PnL)
    - Best/worst trading windows highlighted
    - Legend and insights section
  - **Data**: Pushed to gist via `push-stats-to-gist.py`
  - **Deployed**: https://6b6bf566.onde-surf.pages.dev
  - **Verified**: https://onde.surf returns 307 (auth redirect OK)

### [T412] Auto-detect optimal trading hours from historical data
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-30
- **Depends**: [T249], [T295]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Implemented trading window recommendations!
  - **Script**: `scripts/recommend-trading-windows.py`
  - **Features:**
    - Wilson score 95% confidence intervals for win rates
    - Best/worst windows with statistical significance
    - Hourly and daily aggregated analysis
    - Recommended active hours and days to avoid
    - JSON output for autotrader integration
  - **Output**: `data/trading/trading-recommendations.json`
  - **Usage:**
    - `python3 scripts/recommend-trading-windows.py` - Print report
    - `python3 scripts/recommend-trading-windows.py --json` - JSON output
    - `python3 scripts/recommend-trading-windows.py --min-trades 5` - Higher threshold
  - Current findings: Wednesday to avoid (0% WR from v1), 21:00 UTC best (100% WR)

### [T413] Track API error rates per source
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-31
- **Depends**: [T384]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Script: analyze-api-errors.py. Parses autotrader-v2.log for error patterns per source (Kalshi, CoinGecko, Binance, Coinbase, network). Detects retry attempts, timeouts, rate limits. Outputs success/error rates with sample errors. Stats saved to data/trading/api-error-stats.json. Usage: `python3 scripts/analyze-api-errors.py --days 7`

### [T414] Auto-pause autotrader during market holidays
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-30
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Implemented market holiday detection and pause functionality!
  - **Script**: `scripts/check-market-holiday.py`
  - **Features:**
    - ✅ US market holiday detection (New Year's, MLK Day, Presidents' Day, Memorial Day, July 4th, Labor Day, Thanksgiving, Christmas, etc.)
    - ✅ Variable holidays calculated correctly (3rd Monday, last Monday, etc.)
    - ✅ Christmas Eve, New Year's Eve, Day After Thanksgiving (reduced liquidity days)
    - ✅ CLI: `--list` shows upcoming holidays, `--json` for programmatic use
    - ✅ Exit code 0=holiday, 1=not holiday (for shell scripts)
  - **Autotrader Integration:**
    - ✅ Holiday check in `check_trading_schedule()` function
    - ✅ `HOLIDAY_PAUSE_ENABLED` env var (default: true) - skips trading entirely
    - ✅ `HOLIDAY_REDUCE_SIZE` env var (default: true) - alternative: 50% position size
    - ✅ `is_holiday_trading()` helper function
    - ✅ Holiday multiplier logged in trade data for analysis
    - ✅ Visual indicator: 🎄 emoji in schedule output
  - **Rationale:** Crypto markets have unusual patterns during US holidays (lower liquidity, erratic price movements)

### [T415] Memory file auto-archiving for old daily notes
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-30
- **Depends**: [T370]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Script: archive-old-memory.sh. Cron: 1st of each month at midnight. Moves memory/YYYY-MM-DD.md files >30 days old to memory/archive/. Auto-commits changes. DAYS_OLD env configurable.

---

*Ultimo aggiornamento: 2026-01-30 17:00 UTC*
*Sistema coordinamento: vedi TASK-RULES.md*

### [T416] Auto-reduce position size during whipsaw
- **Status**: TODO
- **Owner**: 
- **Depends**: [T393]
- **Blocks**: -
- **Priority**: P3
- **Notes**: When whipsaw is detected, automatically reduce position sizes by 50% for affected asset until momentum stabilizes (no flip for 6h). Extend T293 sizing logic.

### [T417] Weekly volatility calibration check
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-30
- **Depends**: [T278]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Script: check-volatility-calibration.py. Compares 7d realized vol vs model assumptions. Alert if >20% deviation. Cron: Sundays 8 AM UTC. Alert file: kalshi-vol-calibration.alert. Initial run found BTC +28%, ETH +35% deviation - may need recalibration!

### [T418] Analyze win rate by momentum direction (bullish vs bearish)
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-30
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Script: analyze-momentum-direction.py. Compares bullish/bearish/neutral win rate, PnL, ROI, avg edge. Includes side breakdown (YES/NO) per direction. Usage: `python3 scripts/analyze-momentum-direction.py [--v2]`. Output: data/trading/momentum-direction-analysis.json.

### [T419] Integrate API call tracking into autotrader
- **Status**: TODO
- **Owner**: 
- **Depends**: [T330]
- **Blocks**: -
- **Priority**: P3
- **Notes**: Hook track-api-calls.py logging into autotrader for Kalshi, CoinGecko, Binance, Coinbase calls. Add import and call log_api_call() after each request. Enables rate limit monitoring.

### [T420] OHLC cache staleness alert
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-29
- **Depends**: [T278]
- **Blocks**: -
- **Priority**: P2
- **Notes**: ✅ Script: check-ohlc-cache-age.sh. Checks btc-ohlc.json + eth-ohlc.json age. Alert if >24h old or missing. Alert file: ohlc-cache-stale.alert. Added to HEARTBEAT.md. Run with meta-watchdog or separate cron.

### [T421] Autotrader health JSON endpoint
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-29
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Script: autotrader-health.py. Outputs JSON with: running, pid, uptime_24h/7d, last_trade_time, trade_count_today, won/lost/pending, win_rate_today, balance, status emoji. Flags: --pretty for human-readable, --json for raw. Usage: `python3 scripts/autotrader-health.py --pretty`

### [T422] i18n: /famiglia page translations
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-30
- **Depends**: [T374]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Converted! Added famiglia section to en.json/it.json with ~25 translation keys (title, years, parent, profile types, stats, form fields, buttons, info text). Page now uses useTranslations() hook.

### [T423] i18n: /giochi page translations
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-31
- **Depends**: [T374]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Converted! Added games.status (playNow/comingSoon/inDevelopment/inPlanning), games.features (15+ feature labels), games.gameTitles.moonlightMagicHouse to both en.json and it.json. Page now uses useTranslations() hook with translated game data.

### [T424] i18n: /about page translations
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-31
- **Depends**: [T374]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Converted! Added about section to it.json (badge, title, intro, whatWeDo, orchestra, team, values, contact). Updated page.tsx to use useTranslations() hook with t.about.* syntax.

### [T425] i18n: /health page translations
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-31
- **Depends**: [T374]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Converted! Added 60+ translation keys for health page: title, subtitle, overall status, services, cron jobs, network/PWA, web vitals, timezone, storage. Page now uses useTranslations() hook. Italian translations included.

### [T426] Multi-exchange price consistency alerting
- **Status**: TODO
- **Owner**: 
- **Depends**: [T246]
- **Blocks**: -
- **Priority**: P3
- **Notes**: Alert when price spread across exchanges (Binance/CoinGecko/Coinbase) exceeds 1%. Currently logs warning but no alert file. Potential arbitrage indicator or data quality issue.

### [T427] External API response caching (reduce redundant calls)
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-29
- **Depends**: [T308]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Implemented! Added 60s in-memory cache for: CoinGecko, Binance, Coinbase price fetches + Fear&Greed index. Functions: get_cached_response(), set_cached_response(), get_cache_stats(). Tracks cache hits via latency profiling (e.g., "prices_coingecko_cache_hit"). Reduces redundant API calls per cycle.

### [T428] Weekly rate limit usage report (trend analysis)
- **Status**: TODO
- **Owner**: 
- **Depends**: [T308]
- **Blocks**: -
- **Priority**: P3
- **Notes**: Generate weekly summary of API usage trends. Include avg/peak calls per source, busiest hours, comparison vs previous week. Email or Telegram delivery via cron.

### [T429] Autotrader health cron with alert
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-29
- **Depends**: [T421]
- **Blocks**: -
- **Priority**: P2
- **Notes**: ✅ Script: autotrader-health-cron.sh. Checks health, alerts if down >30min OR win rate <30% with 5+ settled trades. State tracking: kalshi-health-state.json. Alert file: kalshi-health.alert. 1h cooldown. Cron: `*/15 * * * *`. Added to HEARTBEAT.md pickup.

### [T430] Trading dashboard API health endpoint
- **Status**: TODO
- **Owner**: 
- **Depends**: [T421]
- **Blocks**: -
- **Priority**: P3
- **Notes**: Expose /api/trading/health endpoint that serves autotrader-health.py output. Enables /health page to show autotrader status without local file access. Requires server deployment or GitHub Gist sync.

### [T431] Trade outcome prediction confidence calibration
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-29
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Script: analyze-edge-calibration.py. Groups trades by edge bucket (0-5%, 5-10%, etc), compares actual WR vs expected (50%+edge). Shows calibration error per bucket with interpretation. Flags: --v2, --buckets N. V1 analysis: 0% WR with 45%+ edge = catastrophically overconfident (broken model). V2 awaiting data.

### [T432] API latency breakdown widget on /betting
- **Status**: TODO
- **Owner**: 
- **Depends**: [T279]
- **Blocks**: -
- **Priority**: P3
- **Notes**: Add expandable section showing per-endpoint latency breakdown: Kalshi API, Binance, CoinGecko, Coinbase, Fear&Greed. Bar chart or list with p50/p95/p99. Helps identify bottlenecks.

### [T433] Trade execution audit log viewer
- **Status**: TODO
- **Owner**: 
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: Web UI to view trade execution logs with full context: opportunity details, decision reason, API responses, timing breakdown. Useful for debugging why specific trades were taken/skipped.

### [T434] Weekly OHLC volatility summary report
- **Status**: TODO
- **Owner**: 
- **Depends**: [T278], [T383]
- **Blocks**: -
- **Priority**: P3
- **Notes**: Cron Sunday 08:00 UTC: compute 7d/30d realized vol from cached OHLC, compare to model assumptions, flag if >20% divergence. Output: data/reports/volatility-week-YYYY-WW.json. Alert if calibration needed.

### [T435] i18n: /app page translations
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-31
- **Depends**: [T374]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Converted! Added ~80 translation keys for /app page: badge, title, subtitle, comingSoon, futureApps section, status values, 12 feature labels, 8 app descriptions (upcoming + future), CTA section. Page now uses useTranslations() hook with translated data structures. Build verified ✅

### [T436] Add skeleton loading state for games grid
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-30
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Created Skeleton.tsx component with shimmer animation + GameCardSkeleton + GameCardsSkeletonGrid. Integrated into /giochi page with 300ms loading state. Improves perceived performance.

### [T437] Game card hover effects enhancement
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-31
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Enhanced AnimatedCard with: 1) scale(1.02) on hover with smooth easing, 2) variant-specific shadow depth (coral/gold/teal colors), 3) shine effect sweep animation, 4) whileTap scale(0.98) for tactile feedback, 5) card-icon class with wobble (scale+rotate) on hover. Updated /giochi play buttons with gradient swap, scale, and pulse animation.

### [T438] Cron job for historical volatility calculation
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-29
- **Depends**: [T383]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Added! Cron: `0 9 * * 0` (Sundays 09:00 UTC, after OHLC cache + calibration check). Logs to scripts/historical-vol.log. Keeps data/ohlc/volatility-stats.json fresh weekly.

### [T439] Auto-recalibrate model volatility assumptions
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-31
- **Depends**: [T383], [T417]
- **Blocks**: -
- **Priority**: P2
- **Notes**: ✅ Script: auto-calibrate-volatility.py. Compares 30d realized vs assumed vol, recommends new values if >25% divergence. Flags: --apply (update script), --threshold N, --no-alert. Alert file: kalshi-vol-recalibration.alert. Findings: BTC 0.50%→0.35%, ETH 0.70%→0.51% recommended. Adds 10% safety buffer above realized vol. Requires manual --apply to update (safety).

### [T440] Volatility trend visualization on dashboard
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-31
- **Depends**: [T383]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ VolatilityCard component showing BTC/ETH realized vs model volatility. Comparison bars for 7d/14d/30d periods with deviation %. Data from push-stats-to-gist.py (added volatility field). Color-coded: green if model overestimates (conservative), red if underestimates (risky).

### [T441] Reversion signal win rate tracking
- **Status**: TODO
- **Owner**: 
- **Depends**: [T302]
- **Blocks**: -
- **Priority**: P3
- **Notes**: Track win rate specifically for trades made during reversion signals (T302). Analyze if contrarian trades outperform or underperform. Script: analyze-reversion-trades.py. Log reversion_signal: true/false in trade data.

### [T442] Multi-asset correlation monitoring
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-31
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Script: analyze-asset-correlation.py. Calculates rolling correlation (7d/14d/30d windows), detects divergence events when correlation < threshold, generates insights. Current: 0.916 (highly correlated). Output: data/trading/asset-correlation.json. Usage: `python3 scripts/analyze-asset-correlation.py [--window 42] [--threshold 0.7]`

### [T443] Dashboard refresh rate configuration
- **Status**: TODO
- **Owner**: 
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: Add user setting for dashboard auto-refresh interval (30s/60s/5min/off). Currently hardcoded. Save preference to localStorage. Show countdown timer in header.

### [T444] Auto-adjust Kelly fraction based on rolling win rate
- **Status**: TODO
- **Owner**: 
- **Depends**: [T248]
- **Blocks**: -
- **Priority**: P3
- **Notes**: Dynamic Kelly adjustment using last 50 trades rolling win rate. If WR drops below 40%, reduce Kelly by 50%. If WR rises above 60%, allow 25% increase. Caps at 2x base Kelly. Prevents overleveraging during drawdowns.

### [T445] Trading strategy A/B test: momentum vs mean-reversion
- **Status**: TODO
- **Owner**: 
- **Depends**: [T220]
- **Blocks**: -
- **Priority**: P3
- **Notes**: Run parallel paper trades: one uses momentum-aligned strategy, other uses contrarian/mean-reversion. Compare win rates over 100+ trades to determine which performs better in current market regime.

### [T446] Alert: consecutive losing streak threshold
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-30
- **Depends**: -
- **Blocks**: -
- **Priority**: P2
- **Notes**: ✅ Already implemented! check_circuit_breaker() in autotrader-v2.py. Pauses trading on 5+ consecutive losses, writes kalshi-circuit-breaker.alert. State file: kalshi-circuit-breaker.json. Resumes on first win.

### [T447] Trade PnL breakdown by day of week
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-30
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Script: analyze-trades-by-weekday.py. Shows trades/win rate/PnL/avg PnL per day. Identifies best/worst days, gives recommendations. V1 data shows all trades on Wednesday (broken model batch). V2 awaiting more trades.

### [T448] Real-time trade notifications polling on dashboard
- **Status**: TODO
- **Owner**: 
- **Depends**: [T082]
- **Blocks**: -
- **Priority**: P3
- **Notes**: Add toast/notification on /betting when new trade is placed or settled. Poll /api/trading/stats every 30s, compare trade count, show notification with trade details (ticker, side, result). Use browser Notification API with permission.

### [T449] Backtest position sizing strategies
- **Status**: TODO
- **Owner**: 
- **Depends**: [T248]
- **Blocks**: -
- **Priority**: P3
- **Notes**: Compare historical performance using: fixed $5 per trade, Kelly criterion, half-Kelly, volatility-scaled sizing. Use settlement data to simulate each strategy. Report final PnL and max drawdown for each. Script: backtest-position-sizing.py.

### [T450] Book cover image generation for /catalogo
- **Status**: TODO
- **Owner**: 
- **Depends**: [T297]
- **Blocks**: -
- **Priority**: P2
- **Notes**: Replace placeholder 📖 emoji with AI-generated book covers. Use consistent style (minimalist, watercolor, or vintage). Generate on-demand or pre-cache top 50 books. Store in /public/covers/ or use image CDN.

### [T451] Sort options for /catalogo (title, author, reading time)
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-30
- **Depends**: [T297]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Added! Sort dropdown with 4 options: Title (A-Z), Author (A-Z), Shortest first, Longest first. Persists to localStorage. Added i18n translations (EN/IT). Builds on T297 reading time estimates.

### [T452] Autotrader: market hours optimization (skip low-volume times)
- **Status**: TODO
- **Owner**: 
- **Depends**: [T249]
- **Blocks**: -
- **Priority**: P3
- **Notes**: Analyze trade performance by hour (T249 exists). Automatically reduce position size or skip trades during historically low-WR hours (e.g., 03:00-06:00 UTC). Configurable via TRADING_HOURS_BONUS/PENALTY dict.

### [T449] Lighthouse score history tracking
- **Status**: TODO
- **Owner**: 
- **Depends**: [T227]
- **Blocks**: -
- **Priority**: P3
- **Notes**: Save Lighthouse scores to data/lighthouse/history.jsonl after each run. Track performance/a11y/seo/practices over time. Script: track-lighthouse-history.sh. Alerts if score drops >10% from 7-day average.

### [T450] Performance budget in build pipeline
- **Status**: TODO
- **Owner**: 
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: Add budgets.json config for asset size limits (e.g., JS bundle <300KB, CSS <50KB, images <500KB each). Script: check-bundle-sizes.sh. Fail deploy if exceeded. Uses `du` and `find` to check build output.

### [T451] SEO audit automation (broken links, alt text)
- **Status**: IN_PROGRESS
- **Owner**: @clawd
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: Script: seo-audit.sh. Crawl site for: broken internal links (404), images missing alt text, missing meta descriptions, orphan pages. Output report to data/seo/audit-YYYY-MM-DD.json. Integrate with deploy verification.

### [T453] Deploy onde.la with a11y + catalog improvements
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-31
- **Depends**: [T334], [T335]
- **Blocks**: -
- **Priority**: P2
- **Notes**: ✅ Deployed! Category pill filters, URL persistence, WCAG fixes all live on onde.la. Verified: HTTP 200, content correct.

### [T454] Skip-to-content link for keyboard accessibility
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-31
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Added! SkipToContent component in ClientLayout.tsx. Link visually hidden (sr-only) but appears on focus with styled appearance. Main element has id="main-content" and tabIndex={-1} for focus management. i18n translations added (EN/IT).

### [T455] Visible focus indicators for all interactive elements
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-31
- **Depends**: [T335]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Added! Global focus-visible styles in globals.css for all interactive elements (a, button, input, select, textarea, [role="button"], [tabindex]). Uses gold ring with dark offset for visibility on all backgrounds. Added utility classes: focus-ring-gold, focus-ring-teal, focus-ring-white, focus-ring-inset for custom styling.

### [T456] Weekly cron for volatility calibration check
- **Status**: TODO
- **Owner**: 
- **Depends**: [T439]
- **Blocks**: -
- **Priority**: P3
- **Notes**: Run auto-calibrate-volatility.py weekly (Sundays 10:00 UTC, after T417). Creates alert if recalibration needed. Cron: `0 10 * * 0`. Log to volatility-calibration.log.

### [T457] Auto-restart autotrader after manual calibration
- **Status**: TODO
- **Owner**: 
- **Depends**: [T439]
- **Blocks**: -
- **Priority**: P3
- **Notes**: Extend auto-calibrate-volatility.py --apply to optionally restart autotrader. Add --restart flag. Kill old process, wait 2s, start new one. Safer than leaving outdated model running.

### [T458] Track calibration accuracy over time
- **Status**: TODO
- **Owner**: 
- **Depends**: [T439]
- **Blocks**: -
- **Priority**: P3
- **Notes**: Script to analyze volatility-calibration.log. Compare recommended vs actual vol 30 days later. Shows if calibration improved model accuracy. Weekly report: avg prediction error before/after calibration.

### [T459] Backtest divergence signals on historical OHLC
- **Status**: TODO
- **Owner**: 
- **Depends**: [T303], [T278]
- **Blocks**: -
- **Priority**: P3
- **Notes**: Script: backtest-divergence.py. Analyze historical divergence signals (from cached OHLC) against actual price moves 1h/4h/24h later. Calculate hit rate by confidence level. Shows if divergence detection is predictive. Output: data/trading/divergence-backtest.json.

### [T460] Combined signal scoring (divergence + reversion + momentum)
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-31
- **Depends**: [T303], [T302], [T301]
- **Blocks**: -
- **Priority**: P2
- **Notes**: ✅ Implemented composite signal scoring!
  - **Function**: `calculate_composite_signal_score(asset, side, ohlc_data, momentum_data)`
  - **Combines**:
    - Momentum alignment (bullish confirms YES, bearish confirms NO)
    - Reversion signals (contrarian plays)
    - Divergence signals (RSI vs price disagreement)
  - **Features**:
    - Counts confirming signals (0-3)
    - Synergy bonus: +25% per additional signal above 1
    - Confidence levels: low/medium/high/very_high
    - Detailed signal reasons for display
  - **Integration**:
    - Added to YES and NO opportunity evaluation
    - Composite bonus added to edge_with_bonus calculation
    - Output: composite_signals, composite_confidence, composite_bonus, composite_reasons
    - Verbose display: shows ⭐⭐⭐ when multiple signals align
  - **Example**: 3 signals (momentum + reversion + divergence) → 1.25x synergy multiplier on base bonus

### [T461] Weekly divergence signal accuracy report
- **Status**: TODO
- **Owner**: 
- **Depends**: [T303], [T095]
- **Blocks**: -
- **Priority**: P3
- **Notes**: Extend kalshi-weekly-report.py to include divergence signals section: signals fired, hit rate (price moved in predicted direction), avg move size, best/worst signals. Helps calibrate confidence thresholds over time.

### [T462] OHLC cache freshness alert
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-29
- **Depends**: [T278]
- **Blocks**: -
- **Priority**: P2
- **Notes**: ✅ Script: check-ohlc-cache.sh. Checks newest JSON in data/ohlc/, alerts if >24h old. Cron every 6h. Alert file: ohlc-cache-stale.alert. Auto-clears when cache refreshed. Already in HEARTBEAT.md pickup list.

### [T463] Bankroll growth visualization script
- **Status**: TODO
- **Owner**: 
- **Depends**: [T307]
- **Blocks**: -
- **Priority**: P3
- **Notes**: Script: plot-bankroll-growth.py. Generate ASCII/SVG chart showing cumulative PnL over time from trade logs. Compare actual vs simulated strategies (Kelly/fixed). Output to data/trading/bankroll-chart.svg.

### [T464] Trade timing optimization analysis
- **Status**: TODO
- **Owner**: 
- **Depends**: [T249]
- **Blocks**: -
- **Priority**: P3
- **Notes**: Script: analyze-trade-timing.py. Analyze which hour of day and day of week have best edge/win rate. Recommend optimal trading windows. Could inform trading schedule (pause during poor hours). Uses historical trades + cached OHLC volatility data.

### [T465] Deploy onde.la with health page i18n
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-31
- **Depends**: [T425]
- **Blocks**: -
- **Priority**: P2
- **Notes**: ✅ Deployed! Built 1022 pages, passed tests, deployed to Cloudflare Pages. Verified HTTP 200, /libri page loads with Meditations book showing "Free". Download analytics (T299) also included in this deploy.

### [T466] Add i18n completeness check script
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-31
- **Depends**: [T374]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Script: scripts/check-i18n.sh. Extracts all nested keys from en.json and it.json, compares using comm. Shows key counts, lists missing keys (max 20), exits with error code if mismatched. npm script: `npm run i18n:check`. Current status: 511 keys in sync!

### [T467] Language preference persistence in cookie for SSR
- **Status**: TODO
- **Owner**: 
- **Depends**: [T374]
- **Blocks**: -
- **Priority**: P3
- **Notes**: Currently using localStorage which doesn't work for SSR. Add HTTP cookie fallback so server can render correct language on first load. Use next-cookies or similar. Prevents flash of wrong language.


### [T468] Most Downloaded section on /libri page
- **Status**: TODO
- **Owner**: 
- **Depends**: [T299]
- **Blocks**: -
- **Priority**: P3
- **Notes**: Add "Popular Books" or "Most Downloaded" section at top of /libri page. Uses download data from useDownloadTracker. Shows top 5 books by download count. Re-orders books dynamically based on popularity.

### [T469] Server-side download analytics with D1
- **Status**: TODO
- **Owner**: 
- **Depends**: [T299]
- **Blocks**: -
- **Priority**: P3
- **Notes**: Persist download counts server-side using Cloudflare D1. Create downloads table (book_id, format, count, last_download). Add API endpoint /api/analytics/track to increment. Aggregate counts across all users instead of just localStorage per-user.

### [T470] Book recommendation system based on downloads
- **Status**: TODO
- **Owner**: 
- **Depends**: [T299], [T469]
- **Blocks**: -
- **Priority**: P3
- **Notes**: Show "Readers also downloaded" on book detail pages. Track co-download patterns (users who downloaded A also downloaded B). Simple collaborative filtering without user accounts - just aggregate patterns.

### [T471] Circuit breaker history logging
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-31
- **Depends**: [T367]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Implemented! Added log_circuit_breaker_event() to autotrader-v2. Logs to kalshi-circuit-breaker-history.jsonl with: event_type, trigger_time, release_time, release_reason (win/cooldown), streak, trades_skipped (estimated), pause_duration_hours. Analysis script: analyze-circuit-breaker-history.py (shows patterns, recommendations).

### [T472] Autotrader health dashboard endpoint
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-31
- **Depends**: -
- **Blocks**: -
- **Priority**: P2
- **Notes**: ✅ Implemented! Added write_health_status() to autotrader-v2.py. Writes to data/trading/autotrader-health.json every cycle with: is_running, last_cycle_time, cycle_count, trades_today, won/lost/pending counts, win_rate_today, pnl_today_cents, positions_count, cash_cents, circuit_breaker status, consecutive_losses. Uses atomic write (temp file + rename). HEALTH_STATUS_FILE constant configurable.

### [T473] Trading session summary on process exit
- **Status**: TODO
- **Owner**: 
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: Add signal handler (SIGTERM/SIGINT) to autotrader that prints session summary before exit: trades made, win rate, PnL, hours running, positions left open. Log to file for crash analysis.

### [T474] Weekly API error rate cron job
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-31
- **Depends**: [T413]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Script: weekly-api-error-report.sh. Runs analyze-api-errors.py for 7 days. Triggers alert at 5% threshold (lower than real-time 10%). Alert file: kalshi-api-error-weekly.alert. Added to HEARTBEAT.md. Cron: `0 9 * * 0` (Sundays 09:00 UTC). Log: weekly-api-errors.log.

### [T475] Alert on high API error rate
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-31
- **Depends**: [T413]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Implemented! Added check_and_alert() to analyze-api-errors.py. Triggers when any source has ≥10% error rate with ≥10 events. Alert file: kalshi-api-error.alert. 4h cooldown via .api-error-alert-cooldown. Added to HEARTBEAT.md pickup list. Helps catch API degradation early.

### [T476] API error stats on /health page
- **Status**: TODO
- **Owner**: 
- **Depends**: [T413]
- **Blocks**: -
- **Priority**: P3
- **Notes**: Add API reliability section to /health page showing error rates per source from data/trading/api-error-stats.json. Color-coded status indicators (green/yellow/red). Requires server-side or GitHub Gist storage for static export.

### [T477] ARIA live regions for dynamic content
- **Status**: TODO
- **Owner**: 
- **Depends**: [T454]
- **Blocks**: -
- **Priority**: P3
- **Notes**: Add aria-live regions for dynamic updates (toast notifications, loading states, form validations). Ensures screen reader users are informed of changes. Use aria-live="polite" for non-urgent, "assertive" for errors.

### [T478] High contrast mode toggle
- **Status**: TODO
- **Owner**: 
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: Add optional high-contrast mode for users with visual impairments. Toggle in header/settings. CSS custom properties for contrast-safe color values. Respects prefers-contrast media query. Persist to localStorage.

### [T479] Reduce motion support (prefers-reduced-motion)
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-31
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Added! Global prefers-reduced-motion media query in globals.css. Disables/reduces: particles, floating orbs, blob animations, spotlight, holographic effects, gradient flows, hover transforms, scroll indicators. Keeps essential transitions instant. Added motion-safe/motion-reduce utility classes. WCAG 2.3.3 compliant.

### [T480] Price spread monitoring cron job
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-29
- **Depends**: [T385]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Cron job added: `*/15 * * * *`. Runs detect-price-spread.py with 1% threshold. Logs to price-spread.log. Alert file triggers Telegram notification via heartbeat.

### [T481] Multi-timeframe volatility dashboard widget
- **Status**: TODO
- **Owner**: 
- **Depends**: [T278]
- **Blocks**: -
- **Priority**: P3
- **Notes**: Add volatility widget to /betting showing realized vol for 1h/4h/24h timeframes vs model assumptions. Uses cached OHLC data. Color-coded: green when vol matches model, orange when diverging >20%. Helps traders understand current market conditions.

### [T482] Trade execution audit log
- **Status**: TODO
- **Owner**: 
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: Comprehensive audit log for all trade attempts (successful and failed). Include: timestamp, ticker, side, price, size, API response, latency, any errors. Store in kalshi-audit.jsonl. Useful for debugging failed trades and compliance.

### [T483] Fetch real stats from gist on /betting dashboard
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-30
- **Depends**: [T277]
- **Blocks**: -
- **Priority**: P2
- **Notes**: ✅ Added fetchTradingStatsWithFallback() to /betting page. Tries local API first (dev), then falls back to gist URL for static Cloudflare Pages deploy. Maps gist format to TradingStats interface. TRADING_STATS_GIST_URL constant added.

### [T484] Migrate V1 trades to V2 format
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-31
- **Depends**: -
- **Blocks**: -
- **Priority**: P2
- **Notes**: ✅ Script: migrate-trades-v1-to-v2.py. Converts 41 v1 trades to v2 format with: asset inference from ticker, reason string, defaults for momentum/regime/vol fields, migration metadata. Output: kalshi-trades-v1-migrated.jsonl. Flags: --stats, --dry-run, --append-to-v2. V1 context: 0% WR, all BTC NO bets, broken edge calculation.

### [T485] Auto-discovery of new Kalshi crypto markets
- **Status**: TODO
- **Owner**: 
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: Script to detect when Kalshi adds new crypto markets (SOL, DOGE, etc.). Check /markets API for series starting with KX. Alert when new tickers found. Could auto-expand autotrader coverage.

### [T486] E2E tests for onde.surf (surfboard)
- **Status**: TODO
- **Owner**: 
- **Depends**: [T208]
- **Blocks**: -
- **Priority**: P3
- **Notes**: Extend Playwright tests for surfboard environment. Test /betting dashboard, trading stats display, momentum cards, charts. Verify data loading and error states.

### [T487] Playwright visual regression tests
- **Status**: TODO
- **Owner**: 
- **Depends**: [T208]
- **Blocks**: -
- **Priority**: P3
- **Notes**: Add screenshot comparison tests using playwright.toHaveScreenshot(). Baseline screenshots for key pages (/libri, /catalogo, /betting). CI fails if visual diff >threshold. Catches unintended style regressions.

### [T488] Autotrader health endpoint API
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-30
- **Depends**: -
- **Blocks**: -
- **Priority**: P2
- **Notes**: ✅ Created scripts/autotrader-health.py. Outputs JSON to data/trading/autotrader-health.json with: process status, last trade info, 24h win rate, log activity, recent errors. Exit codes: 0=healthy, 1=warning, 2=critical. Can be pushed to gist for external monitoring.

### [T489] Shareable reading list URL
- **Status**: TODO
- **Owner**: 
- **Depends**: [T380]
- **Blocks**: -
- **Priority**: P3
- **Notes**: Add "Share List" button to /my-books page. Generates URL with bookmarked book IDs encoded (e.g., /my-books?books=meditations,shepherds-promise). Recipients can view shared list without it being added to their localStorage. Social sharing friendly.

### [T490] Recently viewed books tracking
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-31
- **Depends**: [T380]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Implemented! Created useRecentlyViewed hook (tracks last 5 books in localStorage). Integrated into BookReaderClient to track views. Added "Recently Viewed" horizontal scroll section on /libri page with compact book cards. Shows only if user has viewed books.

### [T491] Unified book data source for /libri and /my-books
- **Status**: TODO
- **Owner**: 
- **Depends**: [T380]
- **Blocks**: -
- **Priority**: P2
- **Notes**: Currently both pages have duplicate book arrays. Create shared books.ts data file with all book info. Import in both pages. Single source of truth. Easier to add new books and maintain consistency.

### [T492] Portfolio value history chart
- **Status**: TODO
- **Owner**: 
- **Depends**: [T277]
- **Blocks**: -
- **Priority**: P3
- **Notes**: Show historical portfolio value over time (7d/30d/all). Use trading snapshots data to calculate cumulative value at each point. Line chart with area fill. Includes cash + open positions value.

### [T493] Position risk indicator (exposure % of portfolio)
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-31
- **Depends**: [T317]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Added risk indicator badge to position cards! Shows exposure as % of portfolio (cash + positions). Color coded: emerald (<10%), yellow (10-25%), red (>25%). Tooltip shows exact %. Helps visualize concentration risk at a glance.

### [T494] Trade alert sound effects
- **Status**: TODO
- **Owner**: 
- **Depends**: [T051]
- **Blocks**: -
- **Priority**: P3
- **Notes**: Play subtle sound when new trade placed or position settled. Use existing useSoundManager pattern. Coin sound for wins, error sound for losses. Toggle in settings. Works in browser tab even when not focused.

### [T495] Alert when execution success rate drops below 95%
- **Status**: TODO
- **Owner**: 
- **Depends**: [T329]
- **Blocks**: -
- **Priority**: P3
- **Notes**: Analyze last 20 execution attempts. If success rate <95%, write kalshi-execution-fail.alert for heartbeat pickup. 4h cooldown. Helps detect API issues or account problems early.

### [T496] Execution performance by time of day analysis
- **Status**: TODO
- **Owner**: 
- **Depends**: [T329]
- **Blocks**: -
- **Priority**: P3
- **Notes**: Extend analyze-execution-rate.py to show success rate and latency by hour (UTC). Identify if certain times have worse execution. May reveal API congestion patterns or optimal trading windows.

### [T497] Execution latency correlation with market volatility
- **Status**: TODO
- **Owner**: 
- **Depends**: [T329], [T285]
- **Blocks**: -
- **Priority**: P3
- **Notes**: Analyze if high volatility periods have worse execution latency. Correlate execution_log latency_ms with cached OHLC volatility at trade time. Could inform position sizing during volatile periods.

### [T498] Fix cron Python version for OHLC cache
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-29
- **Depends**: -
- **Blocks**: -
- **Priority**: P2
- **Notes**: ✅ Fixed! Cron was using /usr/bin/python3 (3.9.6) but script uses 3.10+ syntax (`dict | None`). Updated crontab to use /opt/homebrew/bin/python3 (3.14.2). OHLC cache now updates correctly.

### [T499] Weekly circuit breaker history analysis cron
- **Status**: TODO
- **Owner**: 
- **Depends**: [T471]
- **Blocks**: -
- **Priority**: P3
- **Notes**: Add cron job (Sundays 10:00 UTC, after calibration) to run analyze-circuit-breaker-history.py. If multiple triggers detected, send summary to Telegram. Helps review trading psychology/model performance weekly.

### [T600] Autotrader startup session summary
- **Status**: TODO
- **Owner**: 
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: On autotrader-v2 startup, print summary of last session: previous run duration, trades made, win rate, final balance, any errors. Helps understand context when restarting. Add load_previous_session_summary() function.

### [T601] Skip trade logging improvements
- **Status**: TODO
- **Owner**: 
- **Depends**: [T224]
- **Blocks**: -
- **Priority**: P3
- **Notes**: Enhance kalshi-skips.jsonl to include momentum, regime, volatility context at skip time. Enables analysis of "what would have happened" if thresholds were lower. Backtest potential missed opportunities.

### [T602] Correlation-based position sizing adjustment
- **Status**: TODO
- **Owner**: 
- **Depends**: [T442]
- **Blocks**: -
- **Priority**: P3
- **Notes**: When BTC/ETH correlation is low (<0.7), increase position sizes for the asset with stronger momentum. When highly correlated (>0.9), reduce size to avoid overexposure. Read from asset-correlation.json.

### [T603] Correlation divergence alert
- **Status**: TODO
- **Owner**: 
- **Depends**: [T442]
- **Blocks**: -
- **Priority**: P3
- **Notes**: Alert when BTC/ETH correlation drops below 0.6 (unusual divergence). Creates kalshi-correlation-divergence.alert for heartbeat pickup. May indicate liquidations, exchange-specific events, or major news affecting one asset.

### [T604] Weekly correlation report in trading summary
- **Status**: TODO
- **Owner**: 
- **Depends**: [T442], [T095]
- **Blocks**: -
- **Priority**: P3
- **Notes**: Add correlation section to kalshi-weekly-report.py: avg correlation over week, any divergence events, comparison to historical norm. Helps understand if market structure is changing.

### [T605] Dashboard fetch trading stats from Gist API
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-31
- **Depends**: [T277]
- **Blocks**: -
- **Priority**: P2
- **Notes**: ✅ Enhanced gist fallback mapping! Dashboard now fetches from Gist when local API unavailable. Mapping includes: profitFactor, maxDrawdownCents/Percent, grossProfit/Loss, latency stats, volatility. Gist pushed with source=all for combined v1+v2 stats.

### [T606] Document autotrader-v2 trading model
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-31
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Created docs/trading/AUTOTRADER-V2-MODEL.md with 15 sections covering: probability model (Black-Scholes), momentum integration, regime detection, position sizing (Kelly), stop-loss, circuit breaker, data sources, alert system, trade logging, dry run mode, health status, configuration reference, known limitations, related scripts, monitoring.

### [T607] Archive old memory files (>30 days)
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-30
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Created scripts/archive-old-memory.sh. Moves memory/YYYY-MM-DD.md files >30 days old to memory/archive/. Skips non-date files. Tested OK. Cron: add `0 4 1 * * /Users/mattia/Projects/Onde/scripts/archive-old-memory.sh` for monthly run.

### [T608] Dashboard toggle for source=all combined view
- **Status**: TODO
- **Owner**: 
- **Depends**: [T346]
- **Blocks**: -
- **Priority**: P3
- **Notes**: Add "All" option to v1/v2 toggle on /betting dashboard. Shows combined stats from bySource. Useful for total portfolio view.

### [T609] V2 autotrader trades count indicator on dashboard
- **Status**: TODO
- **Owner**: 
- **Depends**: [T346], [T605]
- **Blocks**: -
- **Priority**: P3
- **Notes**: Show "V2: X trades" indicator when v2 autotrader starts making trades. Helps confirm v2 is active and working.

### [T610] Cron job to push stats to gist with source=all
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-29
- **Depends**: [T346]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Updated hourly cron (45 * * * *) to use --source all. Now pushes combined v1+v2 stats to gist every hour.

### [T611] Integrate VIX into autotrader regime detection
- **Status**: TODO
- **Owner**: 
- **Depends**: [T332]
- **Blocks**: -
- **Priority**: P2
- **Notes**: Use VIX data from T332 to enhance regime detection. VIX >25 suggests high fear = widen stop-losses. VIX <15 = normal sizing. Moderate positive correlation (0.40) means VIX spikes may precede crypto vol spikes.

### [T612] Add VIX indicator widget to /betting dashboard
- **Status**: TODO
- **Owner**: 
- **Depends**: [T332]
- **Blocks**: -
- **Priority**: P3
- **Notes**: Display current VIX level with regime indicator (🟢 low_fear / 🟡 moderate / 🟠 elevated / 🔴 high_fear). Show correlation with BTC vol. Fetch from cached vix-correlation.json via API or Gist.

### [T613] Cron job for daily VIX-crypto correlation refresh
- **Status**: TODO
- **Owner**: 
- **Depends**: [T332]
- **Blocks**: -
- **Priority**: P3
- **Notes**: Add cron to run analyze-vix-correlation.py daily. Update vix-history.json and vix-correlation.json. Suggested: `0 1 * * * python3 scripts/analyze-vix-correlation.py --days 30`

### [T614] Vol alignment performance widget on /betting dashboard
- **Status**: TODO
- **Owner**: 
- **Depends**: [T375]
- **Blocks**: -
- **Priority**: P3
- **Notes**: Display vol_aligned vs not_aligned win rate comparison from vol-alignment-analysis.json. Show when enough V2 data available. Color-coded bars showing performance difference. Helps validate T237 (volatility rebalancing) effectiveness visually.

### [T615] Cross-asset momentum divergence analysis
- **Status**: TODO
- **Owner**: 
- **Depends**: [T442]
- **Blocks**: -
- **Priority**: P3
- **Notes**: Script to analyze trades when BTC and ETH momentum signals diverge. Compare win rate for trades taken during divergent vs convergent momentum. May reveal if trading against cross-asset signal is risky.

### [T616] Auto-summarize old memory files into MEMORY.md
- **Status**: TODO
- **Owner**: 
- **Depends**: [T415]
- **Blocks**: -
- **Priority**: P3
- **Notes**: Monthly script to read memory/YYYY-MM-DD.md files 7-30 days old, extract key decisions/learnings via LLM or heuristics, append summary to MEMORY.md, then archive originals. Prevents important context from being lost during archival.

### [T617] GA4 custom event for catalog search queries
- **Status**: TODO
- **Owner**: 
- **Depends**: [T378]
- **Blocks**: -
- **Priority**: P3
- **Notes**: Track "catalog_search" event with query string (anonymized), results count, language. Helps understand what books users look for. Add to catalogo page search handler.

### [T618] Autotrader error rate tracking
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-30
- **Depends**: [T329]
- **Blocks**: -
- **Priority**: P2
- **Notes**: ✅ Implemented API error rate tracking!
  - **Script**: `scripts/analyze-error-rates.py`
  - **Features:**
    - Parses execution log from T329
    - Tracks errors per hour
    - Alerts if error rate >10% (creates kalshi-api-error.alert)
    - 4h alert cooldown
    - Daily breakdown (last 7 days)
    - JSON report: data/trading/error-rate-analysis.json
  - **Cron**: Every hour at :30 (30 * * * *)
  - **Current**: 0% error rate (29 calls, all executed)
  - Helps identify infrastructure issues before they impact trading

### [T619] Settlement price accuracy validation
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-31
- **Depends**: [T354]
- **Blocks**: -
- **Priority**: P2
- **Notes**: ✅ Completed via T354! validate-settlement-prices.py cross-checks CoinGecko vs Coinbase. Mean Absolute Error: 0.04% (threshold: 0.5%). Status: EXCELLENT. Results saved to data/trading/settlement-validation.json.

### [T620] Push autotrader health to GitHub Gist
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-31
- **Depends**: [T472]
- **Blocks**: -
- **Priority**: P2
- **Notes**: ✅ Extended push-stats-to-gist.py! Added load_health_status() that supports both T472 format (autotrader internal) and T488 format (external script). healthStatus field now included in gist JSON. Backward compatible with either health file format.

### [T621] Autotrader startup time tracking
- **Status**: TODO
- **Owner**: 
- **Depends**: [T472]
- **Blocks**: -
- **Priority**: P3
- **Notes**: Track autotrader startup timestamp in health status. Calculate uptime (hours running since last restart). Useful for debugging restarts and monitoring stability. Add startup_time, uptime_hours fields to write_health_status().

### [T622] All-time trading stats in health status
- **Status**: TODO
- **Owner**: 
- **Depends**: [T472]
- **Blocks**: -
- **Priority**: P3
- **Notes**: Extend write_health_status() to include all-time stats: total_trades, total_won, total_lost, all_time_pnl_cents. Provides complete trading performance context alongside daily stats.

### [T623] Dashboard autotrader health status indicator
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-31
- **Depends**: [T605], [T620]
- **Blocks**: -
- **Priority**: P2
- **Notes**: ✅ Implemented! Added autotrader status indicator to /betting dashboard header. Shows: running/offline status with animated dot, circuit breaker alert (red), dry run mode indicator, status color coding (green=healthy, yellow=warning, red=error/offline). Data from gist healthStatus field. Compact badge design that fits in header row.

### [T624] Add streak tracking to gist push script
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-31
- **Depends**: [T287], [T605]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Implemented! Added calculate_streak_stats() function to push-stats-to-gist.py. Calculates from trade log directly: longest win/loss streaks, current streak count and type. Gist now includes longestWinStreak, longestLossStreak, currentStreak, currentStreakType. V1 data shows 41-loss streak (0% WR from broken model).

### [T625] Dashboard bySource comparison view
- **Status**: TODO
- **Owner**: 
- **Depends**: [T605], [T346]
- **Blocks**: -
- **Priority**: P3
- **Notes**: When gist includes bySource field (source=all), show side-by-side v1 vs v2 performance comparison on dashboard. Cards showing: trades, win rate, PnL for each source. Helps evaluate model improvement.

### [T626] API latency regression detection and alerting
- **Status**: TODO
- **Owner**: 
- **Depends**: [T398], [T279]
- **Blocks**: -
- **Priority**: P3
- **Notes**: Script: detect-latency-regression.py. Compare current avg latency vs 7-day rolling baseline. Alert when avg increases by >50% or p95 exceeds 2s. Alert file: kalshi-latency-regression.alert. Helps catch API degradation early. 6h cooldown.

### [T627] Autotrader health status on /health page
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-31
- **Depends**: [T398], [T620]
- **Blocks**: -
- **Priority**: P2
- **Notes**: ✅ Implemented! Added Autotrader Status section to /health page showing: running indicator with pulse animation, status badge (healthy/warning/error), circuit breaker alert, stats grid (trades today/24h, win rate, PnL, consecutive losses, cycles), issues list, and last cycle time. Data from trading stats gist healthStatus field. Graceful fallback when no data available.

### [T628] API error rate section on /health page
- **Status**: TODO
- **Owner**: 
- **Depends**: [T398], [T413]
- **Blocks**: -
- **Priority**: P3
- **Notes**: Add API error rate section to /health page alongside latency. Show: success rate %, error count by source, common error types, last 5 errors. Data from gist (extend push-stats-to-gist.py to include error stats from api-error-stats.json).

### [T629] Autotrader cycle time visualization on /betting
- **Status**: TODO
- **Owner**: 
- **Depends**: [T623]
- **Blocks**: -
- **Priority**: P3
- **Notes**: Add small chart showing autotrader cycle times over last 24h. Helps identify slowdowns or bottlenecks. Use cycle_count from healthStatus, calculate avg cycle time from log timestamps.

### [T630] Trading stats refresh countdown timer
- **Status**: TODO
- **Owner**: 
- **Depends**: [T443]
- **Blocks**: -
- **Priority**: P3
- **Notes**: Add visual countdown timer showing seconds until next auto-refresh on /betting dashboard. Shows "Refreshing..." during fetch. Helps users know when fresh data is coming. Timer resets on manual refresh.

### [T631] Mobile autotrader status in bottom navigation
- **Status**: TODO
- **Owner**: 
- **Depends**: [T623]
- **Blocks**: -
- **Priority**: P3
- **Notes**: On mobile (/betting), show autotrader status dot in bottom navigation or floating action button. Currently only visible on desktop (hidden sm). Make status accessible on all screen sizes without cluttering UI.


### [T632] Probability model comparison backtest
- **Status**: TODO
- **Owner**: 
- **Depends**: [T606]
- **Blocks**: -
- **Priority**: P3
- **Notes**: Script: backtest-probability-models.py. Compare Black-Scholes vs naive (distance-based) vs ML-based probability models on historical settlements. Uses cached OHLC + settlement data. Output: model accuracy metrics, calibration plots. Helps identify if probability model needs refinement.

### [T633] Trading performance heatmap by hour/day
- **Status**: TODO
- **Owner**: 
- **Depends**: [T249], [T295]
- **Blocks**: -
- **Priority**: P3
- **Notes**: Create visual 7x24 heatmap showing win rate by day-of-week × hour-of-day. Uses trade history to identify optimal/worst trading windows. Export as SVG for dashboard integration. Script: generate-performance-heatmap.py.

### [T634] Autotrader parameter sweep utility
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-31
- **Depends**: [T305], [T606]
- **Blocks**: -
- **Priority**: P2
- **Notes**: ✅ Script: parameter-sweep.py. Analyzes settlement data, simulates different MIN_EDGE (5-20%), KELLY_FRACTION (2-10%), and vol assumptions (current/realized/aggressive/conservative). Shows actual trade analysis confirming v1 edge calc was broken (40%+ edge but 0% WR). Outputs optimal recommendations to data/backtests/.

### [T635] Swipe-to-dismiss modal on mobile
- **Status**: TODO
- **Owner**: 
- **Depends**: [T316]
- **Blocks**: -
- **Priority**: P3
- **Notes**: Extend useTouchGestures hook to add swipe-down-to-dismiss for modals on /betting (shortcuts modal, position details). Track modal-specific touch handlers, animate modal sliding out on swipe. Better mobile UX.

### [T636] Haptic feedback for mobile interactions
- **Status**: TODO
- **Owner**: 
- **Depends**: [T316]
- **Blocks**: -
- **Priority**: P3
- **Notes**: Add navigator.vibrate() calls for key mobile interactions: pull-to-refresh trigger, successful trade notification, circuit breaker alert. Short vibration patterns (50ms click, 200ms success, 400ms alert). Fallback silently on unsupported devices.

### [T637] Trading stats dashboard dark/light mode persistence
- **Status**: TODO
- **Owner**: 
- **Depends**: [T315]
- **Blocks**: -
- **Priority**: P3
- **Notes**: Verify theme persists correctly across page refreshes on /betting. Current ThemeProvider uses localStorage - check if edge runtime breaks this. Add explicit theme cookie as fallback if needed.

### [T638] Auto-apply volatility recalibration
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-30
- **Depends**: [T377]
- **Blocks**: -
- **Priority**: P2
- **Notes**: ✅ Implemented volatility auto-recalibration!
  - **Script**: `scripts/auto-recalibrate-volatility.py`
  - **Features:**
    - Reads volatility stats from T377
    - Detects >20% deviation for 14d+ 30d periods
    - Creates kalshi-vol-recalibration.alert for heartbeat
    - `--status`: Show current calibration status
    - `--apply`: Apply suggested values (creates backup first)
    - `--revert`: Restore from backup
  - **Current finding**: Model OVERESTIMATES volatility
    - BTC: 0.5% assumed vs 0.32% realized (-36%)
    - ETH: 0.7% assumed vs 0.46% realized (-34%)
  - Logs all recalibrations to history file
  - **Note**: Run `--apply` only after confirming via Telegram

### [T639] Model calibration status widget on /betting dashboard
- **Status**: TODO
- **Owner**: 
- **Depends**: [T377]
- **Blocks**: -
- **Priority**: P3
- **Notes**: Add card to /betting showing: BTC/ETH realized vol vs assumed, deviation %, last calibration date, health indicator (green/yellow/red). Fetches from volatility-stats.json via gist. Warns when model needs recalibration.

### [T640] Volatility regime transition alerts
- **Status**: TODO
- **Owner**: 
- **Depends**: [T377], [T243]
- **Blocks**: -
- **Priority**: P3
- **Notes**: Alert when 7d rolling volatility moves between regimes: very_low (<0.2%), low (0.2-0.4%), normal (0.4-0.8%), high (0.8-1.5%), very_high (>1.5%). Different from momentum - this tracks vol magnitude changes. Script: detect-vol-regime-change.py. Alert file: kalshi-vol-regime.alert.

### [T641] Parameter sweep for v2 trades (when available)
- **Status**: TODO
- **Owner**: 
- **Depends**: [T634]
- **Blocks**: -
- **Priority**: P3
- **Notes**: Once v2 autotrader has enough settled trades (>50), run parameter-sweep.py to find optimal MIN_EDGE and KELLY_FRACTION for the Black-Scholes model. Compare theoretical vs actual performance.

### [T642] Monte Carlo simulation for bankroll evolution
- **Status**: TODO
- **Owner**: 
- **Depends**: [T634]
- **Blocks**: -
- **Priority**: P3
- **Notes**: Extend parameter-sweep.py with Monte Carlo simulation. Given win rate and edge, simulate 1000 bankroll paths under different Kelly fractions. Show risk of ruin, expected value, and confidence intervals. Helps set conservative sizing.

### [T643] Optimal entry timing analysis
- **Status**: TODO
- **Owner**: 
- **Depends**: [T634], [T249]
- **Blocks**: -
- **Priority**: P3
- **Notes**: Using historical data, analyze if trades entered at certain times to expiry (30min vs 15min vs 5min) have different win rates. May reveal optimal entry timing for autotrader to maximize edge.

### [T644] i18n: /vr page translations
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-31
- **Depends**: [T374]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Converted! Added ~100 translation keys for /vr page: hero (badge, title, tagline, subtitle, CTAs), features (3 sections), Flow VR (badge, title, description, 4 features, code mockup text), Home School (problem/solution, values, subjects), Expansion (4 items), CTA section. Page now uses useTranslations() with dynamic data structures. Build verified ✅

### [T645] Book download stats page (/stats)
- **Status**: TODO
- **Owner**: 
- **Depends**: [T299]
- **Blocks**: -
- **Priority**: P3
- **Notes**: Create public /stats page showing download analytics: total downloads, popular books, downloads per day chart, format breakdown (PDF/EPUB). Uses localStorage aggregation or server-side analytics if available.

### [T646] Add "Recently Added" section to /libri
- **Status**: TODO
- **Owner**: 
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: Add carousel/grid showing last 10 books added to the library. Requires adding dateAdded field to book metadata. Sort by date, show "New" badge for <7 days. Helps users discover fresh content.

### [T647] Add "Run Executor" button to FreeRiverHouse UI
- **Status**: TODO
- **Owner**: 
- **Depends**: [T407]
- **Blocks**: -
- **Priority**: P2
- **Notes**: Add manual trigger button in FreeRiverHouse component to POST /api/agent-executor. Shows loading state, result count, and errors. Useful for testing and immediate task processing without waiting for cron.

### [T648] Configure ANTHROPIC_API_KEY in Cloudflare Pages
- **Status**: TODO
- **Owner**: 
- **Depends**: [T407]
- **Blocks**: -
- **Priority**: P1
- **Notes**: MANUAL: Go to Cloudflare Dashboard → Pages → onde-surf → Settings → Environment Variables → Add "ANTHROPIC_API_KEY" as encrypted secret. Without this, agent-executor can't process tasks. After adding, redeploy for changes to take effect.

### [T649] Agent heartbeat registration for onde.surf
- **Status**: TODO
- **Owner**: 
- **Depends**: [T407]
- **Blocks**: -
- **Priority**: P2
- **Notes**: Create mechanism for Clawdbot local agents (like clawd) to register themselves with onde.surf D1 database. Update last_seen timestamp via POST /api/agents/heartbeat. This would show real agent status in FreeRiverHouse UI rather than relying only on task activity.

### [T650] Streak stats breakdown by asset (BTC vs ETH)
- **Status**: TODO
- **Owner**: 
- **Depends**: [T624], [T236]
- **Blocks**: -
- **Priority**: P3
- **Notes**: Extend streak calculation to track separately for BTC and ETH assets. Add byAsset section to streak stats in gist. Shows if one asset has worse streak patterns (may indicate model calibration issues per asset). Script: analyze-streak-by-asset.py

### [T651] Weekly report streak summary section
- **Status**: TODO
- **Owner**: 
- **Depends**: [T624], [T095]
- **Blocks**: -
- **Priority**: P3
- **Notes**: Add streak summary to kalshi-weekly-report.py. Include: longest win/loss streaks this week, any new records set, comparison to all-time records, streak distribution (how many 2+, 3+, 4+ streaks occurred). Helps track trading psychology week-over-week.

### [T652] Dashboard streak record indicator badge
- **Status**: TODO
- **Owner**: 
- **Depends**: [T624], [T359]
- **Blocks**: -
- **Priority**: P3
- **Notes**: Show badge/indicator on dashboard when current streak equals or exceeds all-time record. Use streak stats from gist. Gold badge for approaching win record, red alert for approaching loss record. Provides at-a-glance awareness of exceptional performance/risk.

### [T653] ML model baseline: logistic regression on trade features
- **Status**: TODO
- **Owner**: 
- **Depends**: [T331]
- **Blocks**: [T654]
- **Priority**: P2
- **Notes**: Create first ML model using T331 logged features. Start with simple logistic regression (scikit-learn) as baseline. Use features: momentum, regime, vol, time-to-expiry, price_distance. Output: model accuracy, feature importance, confusion matrix. Script: train-baseline-model.py. Requires >100 settled trades with outcomes.

### [T654] ML model comparison: XGBoost vs baseline
- **Status**: TODO
- **Owner**: 
- **Depends**: [T653]
- **Blocks**: -
- **Priority**: P3
- **Notes**: Train XGBoost classifier on same T331 features, compare to logistic regression baseline. Use cross-validation. Track: AUC, precision/recall, Sharpe if using probability as confidence. May reveal nonlinear patterns baseline misses. Script: train-xgboost-model.py.

### [T655] Cron job to update ML outcomes daily
- **Status**: TODO
- **Owner**: 
- **Depends**: [T331]
- **Blocks**: -
- **Priority**: P3
- **Notes**: Add cron job (08:00 UTC daily) to run update-ml-outcomes.py --verbose. Ensures ML training data stays current with settlement results. Log output to data/trading/ml-update.log. Alerts if sync falls behind (>50 pending outcomes).

---

## 🧠 MEMORY - RULE N3: REMEMBER EVERYTHING!

> **REGOLA N3:** Ricordare TUTTO quello che l'utente dice e tutto quello che fai. Memory persistente è OBBLIGATORIA.

### [T656] Fix Clawdbot memory persistence
- **Status**: DONE
- **Owner**: @clawdbot 
- **Depends**: -
- **Blocks**: [T659]
- **Priority**: P0
- **Notes**: Implement proper memory hooks for Clawdbot (main). Options: 1) Use Clawdbot's built-in memory_search/memory_get tools properly, 2) Implement custom session summary → MEMORY.md pipeline, 3) Use vector DB (Chroma/Pinecone) for semantic search. MUST log all conversations and actions. Update AGENTS.md with memory protocol.

### [T657] Fix Clawdinho memory persistence  
- **Status**: DONE
- **Owner**: @clawdbot 
- **Depends**: -
- **Blocks**: [T659]
- **Priority**: P0
- **Notes**: Implement memory persistence for Clawdinho bot. Same approach as T656. Clawdinho workspace: check location. Needs: 1) Session summaries, 2) Conversation logging, 3) Action logging, 4) Memory search before answers. Update Clawdinho's AGENTS.md.

### [T658] Fix Onde-bot memory persistence
- **Status**: DONE
- **Owner**: @clawdbot
- **Completed**: 2026-01-29 
- **Depends**: -
- **Blocks**: [T659]
- **Priority**: P0
- **Notes**: Implement memory persistence for Onde-bot. Same approach as T656/T657. Needs proper memory protocol in onde.surf codebase. Check D1 database for conversation storage options.

### [T659] Create universal memory engagement rules
- **Status**: DONE
- **Owner**: @clawdbot
- **Completed**: 2026-01-29
- **Depends**: [T656], [T657], [T658]
- **Blocks**: -
- **Priority**: P0
- **Notes**: ✅ Created `templates/AGENTS-MEMORY-SECTION.md` with universal memory protocol. Updated AGENTS.md in Onde and clawd repos. Template includes: REGOLE FONDAMENTALI, memory protocol, logging format, checklist for new repos.

### [T660] Add RULE N3 to REGOLE-AGENTI.md
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-29
- **Depends**: -
- **Blocks**: -
- **Priority**: P0
- **Notes**: ✅ Updated REGOLE-AGENTI.md with REGOLA N3: Memory. Full section with logging requirements, memory structure, search-before-answer protocol, and checklist updates.

### [T661] Run D1 migration for agent_memory table
- **Status**: TODO
- **Owner**: 
- **Depends**: [T658]
- **Blocks**: [T662]
- **Priority**: P1
- **Notes**: Run `wrangler d1 execute ondaDB --file=./apps/surfboard/migrations/0003_agent_memory.sql` to create agent_memory table in D1. Requires wrangler auth.

### [T662] Integrate agent-memory.ts into agent-executor
- **Status**: TODO
- **Owner**: 
- **Depends**: [T661]
- **Blocks**: -
- **Priority**: P1
- **Notes**: Modify `apps/surfboard/src/app/api/agent-executor/route.ts` to use loadAgentContext() and saveTaskMemory() from lib/agent-memory.ts. See docs/AGENT-MEMORY.md for implementation guide.

### [T422] Add test report history (last 7 days) to dashboard
- **Status**: TODO
- **Owner**: -
- **Depends**: [T418]
- **Blocks**: -
- **Priority**: P3
- **Notes**: Store historical test reports in KV (keyed by date). Show trend chart on dashboard.
  - KV key pattern: `test-report-YYYY-MM-DD`
  - Keep last 7 days, auto-expire older
  - Add sparkline showing pass rate trend

### [T423] Autotrader: Add SOL (Solana) market support
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-02-01
- **Depends**: -
- **Blocks**: -
- **Priority**: P2
- **Notes**: ✅ Kalshi KXSOLD market (Solana) fully supported!
  - ✅ SOL_HOURLY_VOL constant (1.2% - more volatile than BTC/ETH)
  - ✅ Multi-exchange price feeds (CoinGecko, Binance, Coinbase)
  - ✅ Settlement tracking (kalshi-settlement-tracker.py - parses KXSOLD tickers)
  - ✅ Dashboard TradeTicker (shows SOL trades with cyan badge)
  - ✅ Asset config (4% Kelly, 2% max position, 13% min edge)
  - ✅ Crypto concentration group includes SOL

### [T424] Create memory cleanup script for stale heartbeat-state
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-02-01
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Created `scripts/cleanup-heartbeat-state.py`!
  - ✅ Checks lastChecks timestamps (Unix) and lastHeartbeat (ISO)
  - ✅ Flags entries older than 24h as stale
  - ✅ Resets stale entries to current time
  - ✅ Logs cleanup to memory daily notes
  - ✅ --dry-run flag to preview changes
  - ✅ --threshold flag to customize stale hours (default 24)

### [T425] Integrate news effectiveness into weekly trading report
- **Status**: TODO
- **Owner**: -
- **Depends**: [T419]
- **Blocks**: -
- **Priority**: P3
- **Notes**: Add news sentiment section to kalshi-weekly-report.py:
  - Show win rate: news-aligned vs neutral trades
  - Effectiveness delta (pp improvement)
  - Top news reasons that drove trades
  - Recommendation from analyze-news-effectiveness.py

### [T426] Add news effectiveness cron schedule
- **Status**: TODO
- **Owner**: -
- **Depends**: [T419]
- **Blocks**: -
- **Priority**: P3
- **Notes**: Schedule analyze-news-effectiveness.py to run weekly (Sundays with weekly report).
  - Output JSON refreshed weekly
  - Could trigger alert if news hurting performance

### [T427] News sentiment effectiveness widget on /betting dashboard
- **Status**: TODO
- **Owner**: -
- **Depends**: [T419]
- **Blocks**: -
- **Priority**: P3
- **Notes**: Add card showing:
  - News-aligned win rate vs neutral
  - Effectiveness delta with color coding
  - Last analysis timestamp
  - Uses data/trading/news-effectiveness.json

---

## 🚨 NUOVO - DA CLAWD 2026-01-30 (21:50)

### [T434] WhisperFlow: Add Silero VAD for voice detection
- **Status**: TODO
- **Owner**: -
- **Depends**: [T411]
- **Blocks**: -
- **Priority**: P2
- **Notes**: Integrate Silero VAD to detect speech start/stop. This enables:
  - Only transcribe when speaking (saves CPU)
  - Auto-segment audio for streaming
  - Better latency (start transcribing immediately on speech)
  - Install: `pip install silero-vad` or via torch.hub

### [T435] WhisperFlow: SwiftUI menu bar app skeleton
- **Status**: TODO
- **Owner**: -
- **Depends**: [T411]
- **Blocks**: -
- **Priority**: P2
- **Notes**: Create basic macOS menu bar app with:
  - System tray icon
  - Start/stop recording hotkey
  - Status indicator (idle/recording/transcribing)
  - Settings panel (model selection, language)
  - Xcode project in apps/whisperflow/macos/

### [T436] WhisperFlow: WebSocket server for VR integration
- **Status**: TODO
- **Owner**: -
- **Depends**: [T434]
- **Blocks**: -
- **Priority**: P3
- **Notes**: Create WebSocket server that broadcasts transcriptions in real-time:
  - Port 8765 default
  - JSON messages: {type: "partial"|"final", text: "..."}
  - Enables Quest/VR clients to receive live transcriptions
  - Foundation for vibe coding in VR!

---

## 🚨 NUOVO - DA CLAWD 2026-01-30 (00:15 HEARTBEAT)

### [T462] Bind HEALTH_ALERTS_KV in Cloudflare Pages dashboard
- **Status**: TODO
- **Owner**: -
- **Depends**: [T455]
- **Blocks**: -
- **Priority**: P2
- **Notes**: MANUAL: Enable KV persistence for health alerts
  - Go to Cloudflare Dashboard → Pages → onde-surf
  - Settings → Functions → KV namespace bindings
  - Add binding: Variable name = `HEALTH_ALERTS_KV`, KV namespace = HEALTH_ALERTS_KV
  - Redeploy to activate

### [T463] Add /health page widget for alert history timeline
- **Status**: TODO
- **Owner**: -
- **Depends**: [T455]
- **Blocks**: -
- **Priority**: P3
- **Notes**: Display KV health alerts on /health page:
  - Fetch from /api/health/alerts-history
  - Show timeline of critical events
  - Resolution time stats
  - Service breakdown chart
  - Filter by date range

### [T464] Weather market performance report (weekly cron)
- **Status**: TODO
- **Owner**: -
- **Depends**: [T422], [T443]
- **Blocks**: -
- **Priority**: P3
- **Notes**: Weekly digest of weather market trading:
  - Win rate by city (NYC, MIA, DEN, CHI)
  - NWS forecast accuracy correlation
  - Best/worst performing market types (KXHIGH vs KXLOW)
  - Edge realization stats
  - Cron: Sunday 12:00 UTC → creates kalshi-weather-weekly.alert

### [T663] onde.la: Create /privacy and /terms pages
- **Status**: TODO
- **Owner**: -
- **Depends**: -
- **Blocks**: -
- **Priority**: P2
- **Notes**: Both /privacy and /terms return 404 but are linked in the footer
  - Need to create Privacy Policy page
  - Need to create Terms of Service page
  - Discovered by watchdog-services.sh

---

## 🌊 ONDE PORTAL/APP - Visione Musk Tech/Entertainment (DA MATTIA 2026-01-29)

### [T600] Onde Portal: Visione e Architettura
- **Status**: TODO
- **Owner**: -
- **Depends**: -
- **Blocks**: [T601], [T602]
- **Priority**: P1
- **Notes**: Sviluppo app/portale per accesso a libri, giochi, e altro
  - **Visione**: Collegato alla previsione Musk sul futuro tech/entertainment
  - **Concetto**: Device (orologio, occhiali → chip neuralink) che genera e aiuta
  - **NON**: Visione superomistica/cyborg
  - **OBIETTIVO**: Espandere e realizzare la potenza creativa e vitale delle persone
  - **Phase 1**: Libri + Giochi
  - **Phase 2**: Tools, Learning, ...
  - **Platform**: Web first, poi native

### [T601] Onde Portal: UI/UX Design
- **Status**: TODO
- **Owner**: -
- **Depends**: [T600]
- **Blocks**: [T602]
- **Priority**: P2
- **Notes**: Design dell'interfaccia utente
  - Cool, moderno, accessibile
  - Focus su esperienza immersiva
  - Transizioni fluide
  - Dark mode nativo

### [T602] Onde Portal: Integrazione Libri
- **Status**: TODO
- **Owner**: -
- **Depends**: [T600]
- **Blocks**: -
- **Priority**: P2
- **Notes**: Integrazione libreria libri esistente
  - Reader integrato
  - Progress sync
  - Bookmarks e note

### [T603] Onde Portal: Integrazione Giochi
- **Status**: TODO
- **Owner**: -
- **Depends**: [T600]
- **Blocks**: -
- **Priority**: P2
- **Notes**: Hub giochi Onde
  - Moonlight House già live
  - Altri giochi da onde.la/giochi

---

## 🎢 ROLLER COASTER - Prototipo 3D (DA MATTIA 2026-01-29)

### [T664] Roller Coaster: Prototipo con Blender + Radeon
- **Status**: TODO
- **Owner**: -
- **Depends**: -
- **Blocks**: -
- **Priority**: P2
- **Notes**: Prototipo di roller coaster 3D
  - **Tool**: Blender (modeling + animation + physics)
  - **GPU**: Radeon 7900 XT (16GB VRAM) per rendering
  - **Features da esplorare**:
    - Track design (spline curves)
    - Physics simulation (velocità, forza G, inerzia)
    - Camera POV ride-along
    - Rendering cycles con Radeon
  - **Output**: Video/animazione prototipo

---

## 🚨 NUOVO - DA CLAWD 2026-01-29 (18:34 HEARTBEAT)

### [T690] Moonlight House: Add achievements gallery/showcase
- **Status**: TODO
- **Owner**: -
- **Depends**: [T461]
- **Blocks**: -
- **Priority**: P3
- **Notes**: Show off earned achievements in a dedicated view:
  - Gallery grid of all achievements (locked/unlocked)
  - Unlock animations with sparkle effects
  - Progress tracking (X/20 achievements earned)
  - Share achievement button (screenshot/social)
  - Secret achievements (hidden until unlocked)
  - Achievement rarity percentages (future: compare with other players)

### [T691] Health Dashboard: Add API response time percentiles
- **Status**: TODO
- **Owner**: -
- **Depends**: [T446]
- **Blocks**: -
- **Priority**: P3
- **Notes**: Enhanced latency monitoring on /health page:
  - Show p50, p95, p99 latency percentiles
  - Historical latency trend chart (last 24h)
  - Alert threshold visualization (green/yellow/red zones)
  - Compare latency across endpoints (onde.la vs onde.surf)
  - Export latency data as CSV for analysis

### [T692] Autotrader: Add circuit breaker status to dashboard
- **Status**: TODO
- **Owner**: -
- **Depends**: [T001]
- **Blocks**: -
- **Priority**: P2
- **Notes**: Show circuit breaker state on onde.surf betting page:
  - Current status: OPEN/CLOSED/HALF_OPEN
  - Time since last trip
  - Trip count (24h)
  - Manual reset button (requires auth)
  - Visual indicator in header (green/red dot)
  - Historical trips timeline

### [T697] Reader App: Deploy updated version with EPUB support
- **Status**: TODO
- **Owner**: -
- **Depends**: [T690]
- **Blocks**: -
- **Priority**: P2
- **Notes**: Deploy Reader App with EPUB support to onde.la/reader:
  - Build static export with basePath=/reader/
  - Copy to onde-portal/public/reader/
  - Deploy via wrangler
  - Test EPUB loading from Gutenberg URLs
  - Test file upload + IndexedDB storage

### [T698] Reader App: Add drag-and-drop EPUB upload
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-30
- **Depends**: [T690]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Implemented drag-and-drop EPUB upload!
  - ✅ Drag-and-drop zone covers entire Library view
  - ✅ Beautiful visual overlay when dragging files over Library
  - ✅ Support multiple file uploads (sequential processing)
  - ✅ Upload progress modal with per-file progress bars
  - ✅ Status indicators: pending → uploading → done/error
  - ✅ "Add EPUB(s)" card shows drop hint + animates on drag
  - ✅ File input also accepts multiple files now
  - ✅ Deployed: https://448f052e.onde-portal.pages.dev
  - ✅ Verified: https://onde.la/reader/ returns 200 OK

### [T699] Reader App: Add EPUB export to reading list
- **Status**: TODO
- **Owner**: -
- **Depends**: [T690]
- **Blocks**: -
- **Priority**: P3
- **Notes**: Allow exporting annotations from EPUB:
  - Export highlights to Markdown
  - Export bookmarks list
  - Include book metadata in export
  - Copy to clipboard or download as file

---

## 🎨 CORDE - INTERFACCIA GENERAZIONE (DA MATTIA 2026-01-29)

### [T700] Corde: UI Improvements stile ComfyUI
- **Status**: IN_PROGRESS
- **Owner**: @clawd
- **Depends**: -
- **Blocks**: [T701], [T702], [T703]
- **Priority**: P1
- **Notes**: Migliorare interfaccia Corde stile ComfyUI
  - [ ] Mini-previews thumbnail in ogni nodo
  - [ ] Progress bar animata durante generazione
  - [ ] Pannello settings globale (device, cache, etc.)
  - [ ] Connessioni animate tipo neon/wire
  - [ ] Node grouping/commenting
  - [ ] Copy/paste nodes
  - [ ] Undo/redo support

### [T701] Corde: Model Loader Node con Multi-Device
- **Status**: TODO
- **Owner**: -
- **Depends**: [T700]
- **Blocks**: [T704]
- **Priority**: P1
- **Notes**: Nodo per caricare modelli con selezione device
  - [ ] Dropdown modello (SDXL, Flux, SD1.5, etc.)
  - [ ] Dropdown device (Auto, Metal, CUDA, AMD/ROCm)
  - [ ] Mostra VRAM/memoria disponibile
  - [ ] LoRA selector opzionale
  - [ ] Config persistence

### [T702] Corde: Backend Abstraction Layer Multi-GPU
- **Status**: TODO
- **Owner**: -
- **Depends**: [T700]
- **Blocks**: -
- **Priority**: P1
- **Notes**: Abstraction layer per supportare Metal + AMD
  - [ ] GPU detector (Metal, CUDA, ROCm, CPU fallback)
  - [ ] Device manager class
  - [ ] Memory manager per VRAM
  - [ ] Config per device preference
  - [ ] Test su M1 (Metal)
  - [ ] Test su Radeon 7900 XT (ROCm/TinyGrad)

### [T703] Corde: Nuovi Nodi Generazione
- **Status**: TODO
- **Owner**: -
- **Depends**: [T700]
- **Blocks**: -
- **Priority**: P2
- **Notes**: Aggiungere nodi mancanti
  - [ ] ControlNet Node (canny, depth, pose)
  - [ ] LoRA Loader Node
  - [ ] Image Upscale Node (Real-ESRGAN, etc.)
  - [ ] Image Composite Node
  - [ ] Mask Editor Node
  - [ ] VAE Decode/Encode Nodes

### [T704] Corde: Video Generation Pipeline
- **Status**: TODO
- **Owner**: -
- **Depends**: [T701], [T702]
- **Blocks**: -
- **Priority**: P2
- **Notes**: Pipeline completa per video
  - [ ] Stable Video Diffusion integration
  - [ ] LTX-Video 2 support
  - [ ] AnimateDiff for loops
  - [ ] Frame interpolation
  - [ ] Audio sync node

---

## 🚨 NUOVO - DA CLAWD 2026-01-29 (22:16 HEARTBEAT)

### [T722] Reader App: Add OPDS catalog support
- **Status**: TODO
- **Owner**: -
- **Depends**: [T668]
- **Blocks**: -
- **Priority**: P3
- **Notes**: Enable importing books from OPDS catalogs:
  - Support OPDS 1.x and 2.0 feeds
  - Browse catalogs: Project Gutenberg, Standard Ebooks, Feedbooks
  - Search within catalogs
  - Add custom catalog URLs (Calibre servers)
  - Download and import EPUBs directly
  - Catalog history/favorites

### [T723] SE-Bot: CLI tool for testing RAG responses
- **Status**: TODO
- **Owner**: -
- **Depends**: [T472]
- **Blocks**: -
- **Priority**: P2
- **Notes**: Command-line tool to test SE-Bot RAG pipeline:
  - Input: question/scenario text
  - Output: KB search results, context, suggested response
  - Batch mode: test multiple scenarios from file
  - Latency tracking
  - Score thresholds configuration
  - Export results to JSON
  - Usage: `python cli_test.py "What is ZTNA?" --with-claude`

### [T724] Trading: Add Sharpe ratio to performance dashboard
- **Status**: TODO
- **Owner**: -
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: Calculate and display risk-adjusted returns:
  - Daily returns calculation from trade history
  - Sharpe ratio (annualized)
  - Sortino ratio (downside only)
  - Max drawdown percentage
  - Display on onde.surf/betting dashboard
  - Historical chart showing rolling Sharpe
  - Compare crypto vs weather markets

---

## 🚨 NUOVO - DA CLAWD 2026-01-29 (23:10 HEARTBEAT)

### [T727] Scripts: Fix remaining datetime.utcnow() deprecations
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-29
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Fixed Python 3.12+ deprecation warnings:
  - ✅ scripts/daily-test-suite.py - SSL expiry calculation
  - ✅ scripts/compute-latency-trend.py - timestamps and cutoff
  - ✅ scripts/track-api-error-rates.py - logging and reports
  - All now use timezone-aware `datetime.now(timezone.utc)`
  - Test suite runs clean without deprecation warnings

### [T728] TASKS.md: Add task ID validation script
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-29
- **Depends**: -
- **Blocks**: [T730]
- **Priority**: P3
- **Notes**: ✅ Implemented `scripts/validate-tasks.py`:
  - Detects duplicate task IDs (found 100+ duplicates!)
  - Shows next available ID (currently T730)
  - Reports orphan dependencies (none found)
  - Status breakdown: 310 DONE, 162 TODO, 9 IN_PROGRESS
  - JSON output mode (`--json`) for programmatic use
  - Suggests next available ID (`--next-id`)
  - ⚠️ Major finding: TASKS.md has many duplicate sections that need cleanup (T730)

### [T730] TASKS.md: Deduplicate task entries
- **Status**: IN_PROGRESS
- **Owner**: @clawd
- **Depends**: [T728]
- **Blocks**: -
- **Priority**: P2
- **Notes**: Clean up duplicate task IDs in TASKS.md:
  - **Analysis (2026-01-30):**
    - 122 duplicate task IDs found across file
    - NOT exact duplicate content - different tasks using same ID
    - IDs were reused in "NUOVO - DA CLAWD" heartbeat sections
    - Duplicates scattered at lines: 2450+, 3201+, 4343+, 5211+, 5711+, 7338+
  - **Helper script**: `scripts/renumber-tasks.py` created for incremental fix
    - Usage: `python scripts/renumber-tasks.py --start-line 7338 --end-line 8692 --new-start-id 808 --dry-run`
  - **Next steps**:
    1. Run renumber script on each duplicate section
    2. Start from bottom of file (highest line numbers) to avoid shifting
    3. Verify with validate-tasks.py after each section
    4. Update any external references to renumbered tasks
  - **Prevention**: Add pre-commit hook to check for duplicate IDs

### [T729] Autotrader: Add daily digest email summary
- **Status**: TODO
- **Owner**: -
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: Daily email with trading summary:
  - Total PnL for the day
  - Win rate and trade count
  - Notable events (circuit breaker triggers, streaks)
  - Comparison to previous day/week
  - Uses nodemailer or similar
  - Configurable send time (default: 9 AM PST)
  - Fallback for T219 (email notification for critical alerts)

### [T731] SE-Bot: Add suggestion feedback loop (thumbs up/down)
- **Status**: TODO
- **Owner**: -
- **Depends**: [T474]
- **Blocks**: -
- **Priority**: P2
- **Notes**: Add feedback mechanism to improve suggestions over time:
  - Add 👍/👎 buttons to each suggestion card
  - Log feedback with: suggestion text, transcript context, style, rating
  - Store in `data/se-bot/feedback.jsonl` for fine-tuning
  - Track which types of suggestions get positive feedback
  - Eventually use to fine-tune prompt templates
  - Stats display: "This suggestion type has 80% approval"

### [T732] SE-Bot: Create comprehensive README and setup guide
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-31
- **Depends**: [T474]
- **Blocks**: -
- **Priority**: P2
- **Notes**: ✅ Created comprehensive README for SE-Bot!
  - **File**: `apps/se-bot/README.md`
  - **Content:**
    - ✅ ASCII architecture diagram (full system flow)
    - ✅ Prerequisites and system requirements
    - ✅ Step-by-step installation guide (BlackHole, Whisper, PyObjC)
    - ✅ Audio routing setup with Multi-Output Device instructions
    - ✅ Usage examples (full system, demo mode, headless, status check)
    - ✅ Component testing commands
    - ✅ Keyboard shortcuts reference
    - ✅ Response styles configuration
    - ✅ Knowledge base structure guide
    - ✅ Voice output setup (ElevenLabs)
    - ✅ Troubleshooting section (7 common issues)
    - ✅ File reference table
    - ✅ Future roadmap
  - ⏳ Demo video/GIF (future - requires screen recording)

### [T733] SE-Bot: Add configurable hotkey and position persistence
- **Status**: TODO
- **Owner**: -
- **Depends**: [T474]
- **Blocks**: -
- **Priority**: P3
- **Notes**: Improve UX with persistent settings:
  - Remember window position after drag
  - Store settings in `~/.sebot/config.json`
  - Configurable global hotkey (not just Cmd+Shift+S)
  - Option to auto-start with meeting apps (Zoom detector?)
  - Theme options: dark/light/auto
  - Font size adjustment for suggestion cards

### [T734] SE-Bot: Add voice output to overlay suggestion cards
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-31
- **Depends**: [T475]
- **Blocks**: -
- **Priority**: P2
- **Notes**: ✅ Implemented voice output in overlay UI!
  - ✅ 🔊 button on each suggestion card (right side)
  - ✅ Click speaker button to speak suggestion
  - ✅ Uses ElevenLabs if API key set, macOS TTS fallback otherwise
  - ✅ Visual feedback while speaking (🔈 icon, yellow color)
  - ✅ Keyboard shortcut: Shift+1/2/3 to speak suggestion
  - ✅ Status updates: "🎤 Speaking..." → "● Listening"
  - ✅ Background thread for non-blocking playback
  - ✅ Updated footer hint with voice shortcuts
  - ⏳ Auto-speak option (future enhancement)
  - ⏳ Volume slider in overlay (future - see T736)

### [T735] SE-Bot: Add competitor detection and battle card mode
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-30
- **Depends**: [T473]
- **Blocks**: -
- **Priority**: P2
- **Notes**: ✅ Implemented enhanced competitive intelligence!
  - **Module**: `apps/se-bot/competitor_tracker.py`
  - **Features:**
    - ✅ Real-time competitor detection (8 competitors tracked)
    - ✅ Auto-switch to battle-card mode when competitor mentioned
    - ✅ 3 quick differentiators per competitor (strength/caution types)
    - ✅ Color-coded overlay cards (green=strength, yellow=caution)
    - ✅ Competitor mention logging to `data/se-bot/competitor-mentions.jsonl`
    - ✅ Stats command: `python competitor_tracker.py --stats`
    - ✅ UI updated with STYLE_COLORS for battle card types
  - **Competitors tracked**: Palo Alto, Zscaler, Cato, Fortinet, Cisco, VMware, Cloudflare, Netskope
  - **Differentiators**: 3-4 per competitor with type (strength/caution)
  - **Integration**: context_analyzer.py now logs mentions and generates styled suggestions

### [T736] Voice Output: Add speaking queue for multiple suggestions
- **Status**: TODO
- **Owner**: -
- **Depends**: [T475]
- **Blocks**: -
- **Priority**: P3
- **Notes**: Queue system for voice output:
  - Queue multiple text items for sequential playback
  - Skip/cancel buttons for current or queue
  - Priority levels (urgent = skip queue)
  - Natural pauses between items
  - Show queue status in UI
  - "Speak all suggestions" mode


### [T780] SE-Bot: Weekly competitor mention report
- **Status**: TODO
- **Owner**: -
- **Depends**: [T735]
- **Blocks**: -
- **Priority**: P3
- **Notes**: Generate weekly summary of competitor mentions:
  - Most mentioned competitor in meetings
  - Trend over time (increasing/decreasing mentions)
  - Which objections come up most with each competitor
  - Export to PDF/Markdown for sales team
  - Integrate with Telegram notification (optional)
  - Add to existing weekly report system

### [T781] SE-Bot: Add "Win the Deal" playbook generator
- **Status**: TODO
- **Owner**: -
- **Depends**: [T735], [T473]
- **Blocks**: -
- **Priority**: P3
- **Notes**: Generate deal-specific playbooks:
  - Input: Competitors being evaluated, customer industry, deal size
  - Output: Custom battle card with tailored differentiators
  - Include industry-specific use cases from KB
  - Suggested demo scenarios
  - Common objections for that competitor + responses
  - One-pager format for easy printing/sharing

### [T782] SE-Bot: Sentiment detection in meeting context
- **Status**: TODO
- **Owner**: -
- **Depends**: [T473]
- **Blocks**: -
- **Priority**: P3
- **Notes**: Detect customer sentiment during meetings:
  - Positive signals: "impressive", "like that", "makes sense"
  - Negative signals: "concerned about", "not sure", "expensive"
  - Neutral/probing: questions, clarifications
  - Show sentiment indicator in overlay (🟢/🟡/🔴)
  - Suggest response style based on sentiment
  - Log sentiment changes for post-meeting analysis

### [T745] CI/CD: Add Telegram notifications for pipeline failures
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-31
- **Depends**: [T726]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Implemented Telegram notifications in CI/CD!
  - Added to auto-improve job (triggers on any failure)
  - Uses TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID secrets
  - Notification includes: run ID, commit message, author, job results
  - Links to GitHub Actions run page
  - Markdown formatting for readability
  - Graceful fallback if credentials not configured

### [T746] CI/CD: Add deploy preview URLs for pull requests
- **Status**: TODO
- **Owner**: -
- **Depends**: [T726]
- **Blocks**: -
- **Priority**: P3
- **Notes**: Automatic preview deployments for PRs:
  - Deploy to unique Cloudflare Pages URL per PR
  - Comment on PR with preview links
  - Auto-cleanup when PR closed
  - Useful for review before merge

### [T747] CI/CD: Add test coverage tracking
- **Status**: TODO
- **Owner**: -
- **Depends**: [T726]
- **Blocks**: -
- **Priority**: P4
- **Notes**: Track and report test coverage over time:
  - Run coverage for reader-vr Playwright tests
  - Upload coverage to Codecov or similar
  - Show coverage badge in README
  - Fail CI if coverage drops significantly
  - Dashboard widget showing coverage trend


---

## 🚨 NUOVO - DA CLAWD 2026-01-31 (HEARTBEAT)

### [T748] Deploy onde.surf with position expiry indicator
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-31
- **Depends**: [T743]
- **Blocks**: -
- **Priority**: P2
- **Notes**: ✅ Deployed position expiry feature to production!
  - Deploy URL: https://b308a17a.onde-surf.pages.dev
  - ✅ Built surfboard with `npm run build:cf`
  - ✅ Deployed via wrangler to Cloudflare Pages
  - ✅ Verified: https://onde.surf/betting → 307 (auth redirect as expected)
  - Position cards now show Clock icon with expiry countdown

### [T749] Dashboard: Add position P&L percentage display
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-30
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Implemented P&L percentage display on position cards!
  - ✅ Calculate: (pnl / exposure) * 100
  - ✅ Display next to dollar P&L (e.g., "+$5.00 (+12.5%)")
  - ✅ Color matches P&L direction (emerald/red)
  - ✅ Opacity styling for secondary info
  - Helpful for comparing relative performance across positions

### [T750] Autotrader: Add position entry timestamp to status API
- **Status**: TODO
- **Owner**: -
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: Track when positions were opened:
  - Add `openedAt` timestamp to position data
  - Lookup from trade logs when position created
  - Return in /api/trading/kalshi endpoint
  - Enables "position age" display (time since opened)
  - Complements expiry indicator (T743)

### [T751] Dashboard: Add total daily volume indicator
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-31
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Implemented DailyVolumeWidget on /betting page!
  - **Component**: `apps/surfboard/src/components/DailyVolumeWidget.tsx`
  - **Features:**
    - ✅ Calculate volume from recentTrades (contracts * price_cents / 100)
    - ✅ Display in stats grid next to DailyGoalTracker
    - ✅ Compare to yesterday with % change indicator
    - ✅ Show trade count, avg trade size
    - ✅ Largest trade indicator when notable
    - ✅ Purple glow styling consistent with dashboard theme
  - Build passes, ready for deploy
  - ⏳ Needs deploy to onde.surf (see T752)

### [T752] Deploy onde.surf with DailyVolumeWidget
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-30
- **Depends**: [T751]
- **Blocks**: -
- **Priority**: P2
- **Notes**: ✅ Deployed! https://c1060b17.onde-surf.pages.dev
  - ✅ Built surfboard with `npm run build:cf`
  - ✅ Deployed via wrangler to Cloudflare Pages
  - ✅ Verified: https://onde.surf returns 307 (auth protected as expected)
  - Daily volume widget now live on /betting page

### [T753] Dashboard: Add volume trend sparkline
- **Status**: TODO
- **Owner**: -
- **Depends**: [T751]
- **Blocks**: -
- **Priority**: P4
- **Notes**: Show 7-day volume trend in DailyVolumeWidget:
  - Small sparkline showing daily volume for past 7 days
  - Requires tracking historical volume in gist
  - Visual indication of trading activity patterns

### [T754] Autotrader: Add daily volume to stats push
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-30
- **Depends**: [T751]
- **Blocks**: [T753]
- **Priority**: P3
- **Notes**: ✅ Implemented daily volume tracking in push-stats-to-gist.py!
  - ✅ `calculate_daily_volume()` function calculates volume from trades
  - ✅ Volume = sum(price * contracts) for ALL trades on a day
  - ✅ `todayVolumeCents`, `yesterdayVolumeCents` in gist
  - ✅ `todayTradeCount`, `yesterdayTradeCount` for comparison
  - ✅ `todayMaxTradeCents`, `todayAvgTradeCents` for details
  - ✅ 7-day `history` array for trend visualization
  - ✅ `weekVolumeCents`, `weekTradeCount` for weekly summary
  - Gist updated: https://gist.github.com/43b0815cc640bba8ac799ecb27434579
  - ⏳ Dashboard sparkline can now use this data (T753)

### [T755] Dashboard: Add trade velocity indicator
- **Status**: TODO
- **Owner**: -
- **Depends**: -
- **Blocks**: -
- **Priority**: P4
- **Notes**: Show trades per hour/minute in real-time:
  - Current trading velocity (trades/hour)
  - Compare to daily average
  - Useful for monitoring autotrader activity
  - Visual indicator: slow/normal/fast

### [T756] Dashboard: Mobile-responsive trading widgets
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-02-01
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Implemented mobile responsive improvements for /betting page!
  - ✅ Horizontally scrollable filter controls on mobile (no wrapping)
  - ✅ Larger touch targets (48px+ min) for filter buttons on mobile
  - ✅ Collapsible "Charts & Analysis" section (hidden by default on mobile)
  - ✅ Collapsible "Advanced Analytics" section (hidden by default on mobile)
  - ✅ Better text sizing for small screens (10px → 12px on mobile)
  - ✅ Expand/collapse button with larger tap area and better visual feedback
  - ✅ Build passes, ready for deploy
  - ⏳ Test on iOS Safari and Android Chrome (manual testing)

### [T757] Reader App: Add reading time estimate
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-30
- **Depends**: [T690]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Implemented reading time estimates for Reader App!
  - ✅ Added wordCount and estimatedReadingMinutes to Book interface
  - ✅ Created `readingTime.ts` utility with calculation functions
  - ✅ Show reading time badge on book cards (⏱️ 5h 30m)
  - ✅ Show remaining time on Continue Reading cards
  - ✅ Calculate from epub locations (150 words per location, 200 WPM)
  - ✅ Persist to store for future visits
  - ✅ Deployed: https://46aaab9b.onde-portal.pages.dev
  - ✅ Verified: https://onde.la/reader/ returns 200 OK

### [T758] Autotrader: Volume anomaly alerts
- **Status**: TODO
- **Owner**: -
- **Depends**: [T754]
- **Blocks**: -
- **Priority**: P3
- **Notes**: Alert when trading volume is unusual:
  - Track 7-day average volume
  - Alert if today > 2x average (high activity)
  - Alert if today < 0.5x average (low activity)
  - Create kalshi-volume-anomaly.alert for heartbeat
  - Useful for detecting autotrader issues or market changes

### [T759] Reader App: Track personal reading speed
- **Status**: TODO
- **Owner**: -
- **Depends**: [T757]
- **Blocks**: -
- **Priority**: P4
- **Notes**: Improve reading time estimates by tracking user's actual speed:
  - Record words read per session (from page text extraction)
  - Calculate actual WPM over time
  - Update reading time estimates to use personalized WPM
  - Show "Your reading speed: X WPM" in stats panel
  - More accurate "time remaining" as user reads more

### [T760] Reader App: Library summary stats
- **Status**: TODO
- **Owner**: -
- **Depends**: [T719]
- **Blocks**: -
- **Priority**: P4
- **Notes**: Show reading statistics summary on library page:
  - Total books in library
  - Total reading time this week/month
  - Books completed vs in progress
  - Current reading streak
  - Small widget/banner at top of library

### [T761] Reader App: Enhanced offline PWA caching
- **Status**: TODO
- **Owner**: -
- **Depends**: [T695]
- **Blocks**: -
- **Priority**: P3
- **Notes**: Improve PWA offline experience:
  - Cache uploaded EPUBs in IndexedDB (already done)
  - Cache book covers for offline display
  - Pre-cache font files and CSS
  - Show offline indicator in header
  - Graceful fallback when dictionary API unavailable

### [T762] Autotrader: Circuit breaker time-based cooldown decay
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-30
- **Depends**: [T734]
- **Blocks**: -
- **Priority**: P2
- **Notes**: ✅ Implemented circuit breaker time-based decay to fix deadlock!
  - **Problem**: After cooldown release, losses still counted → immediate re-trigger → loop
  - **Solution**: Added forgiveness + time-based decay system:
    - ✅ `get_effective_losses()` function calculates effective count
    - ✅ `forgiven_losses` state tracks losses forgiven after cooldown release
    - ✅ `last_cooldown_release` tracks time for decay calculation
    - ✅ Decay rate: -1 loss every 2 hours since last cooldown release
    - ✅ On cooldown release: forgive all current losses
    - ✅ On win: clear all forgiveness (fresh start)
    - ✅ Manual reset: `python3 kalshi-autotrader-v2.py --reset-circuit-breaker`
    - ✅ Enhanced logging with effective_losses and forgiven_losses
  - **Fixed**: 15-loss deadlock where autotrader was stuck in trigger→release→trigger loop

### [T763] Trading: Weather market post-mortem analysis
- **Status**: TODO
- **Owner**: -
- **Depends**: -
- **Blocks**: -
- **Priority**: P2
- **Notes**: Analyze the 2026-01-29 weather market losing streak:
  - 5+ consecutive losses on KXHIGHCHI (Chicago high temp) in ~25 min
  - Questions to answer:
    - Was the edge calculation correct?
    - Was NWS forecast data stale?
    - Time-to-expiry too short?
    - Did we enter at wrong times?
  - Review skip logic for weather markets
  - Compare weather win rate vs crypto win rate historically
  - Output: data/trading/postmortem-weather-2026-01-29.md

### [T764] Trading: Fix concentration history logging
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-02-01
- **Depends**: [T482]
- **Blocks**: -
- **Priority**: P2
- **Notes**: ✅ Fixed concentration history logging!
  - **Root cause**: Log only happened inside `if positions:` block
  - **Fix**: Moved log call outside positions check, always logs concentration
  - **Changes to kalshi-autotrader-v2.py:**
    - `log_concentration_snapshot()` now handles empty portfolio gracefully
    - Creates zero-concentration state when no positions exist
    - Always logs each cycle regardless of position count
  - **Data now tracked**: concentration-history.jsonl gets entry every cycle
  - **Dashboard benefit**: Can visualize portfolio concentration over time including idle periods


### [T765] Dashboard: Deploy 'C' keyboard shortcut to onde.surf
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-02-01
- **Depends**: [T747]
- **Blocks**: -
- **Priority**: P2
- **Notes**: ✅ Deployed T747 keyboard shortcut to production!
  - ✅ Build via `npm run build:cf`
  - ✅ Deploy via wrangler: https://1e050495.onde-surf.pages.dev
  - ✅ Verified: https://onde.surf → 307 (auth redirect as expected)
  - Press 'C' on /betting to toggle comparison tooltips

### [T766] Dashboard: Add position PnL sparkline to open positions
- **Status**: TODO
- **Owner**: -
- **Depends**: [T743]
- **Blocks**: -
- **Priority**: P3
- **Notes**: Show mini sparkline for each open position:
  - Track price history of each position since open
  - Display small inline sparkline (30x12px)
  - Color: green if current > open price, red if below
  - Shows trend direction at a glance

### [T767] Trading: Add retry logic for API errors in push-stats-to-gist.py
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-02-01
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Implemented retry logic for gist push reliability!
  - **Retry config**: MAX_RETRIES=3, exponential backoff (2s, 4s, 8s)
  - **Error logging**: Failures logged to `data/trading/gist-push-errors.log`
  - **Consecutive failure tracking**: Creates alert after 3 failures
  - **Alert file**: `scripts/kalshi-gist-push-failed.alert`
  - **Rate limit handling**: Detects and logs GitHub API rate limits
  - **Functions updated**: create_gist(), update_gist()
  - **Helper functions added**: log_gist_error(), track_consecutive_failures()

### [T769] Deploy onde.surf with streak position widget
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-30
- **Depends**: [T387]
- **Blocks**: -
- **Priority**: P2
- **Notes**: ✅ Deployed streak position widget to production!
  - ✅ Build via `npm run build:cf`
  - ✅ Deploy via wrangler: https://d44ce5d8.onde-surf.pages.dev
  - ✅ Verified: https://onde.surf/betting → 307 (auth redirect as expected)
  - Streak position analysis widget now live on /betting

### [T770] Trading: Add streak position data to autotrader alerts
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-02-01
- **Depends**: [T387]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Implemented streak position context in autotrader!
  - **Function**: `get_streak_position_context()` returns:
    - `streak_context`: string like "after_3_losses", "after_2_wins", "fresh_start"
    - `current_streak`: count of consecutive wins/losses
    - `streak_type`: "win" or "loss"
    - `tilt_risk`: bool (true if ≥3 consecutive losses)
    - `hot_hand`: bool (true if ≥3 consecutive wins)
    - `continuation_probability`: from streak-position-analysis.json
  - **Trade data fields**: streak_context, streak_current, streak_type, streak_tilt_risk, streak_hot_hand, streak_continuation_prob
  - **ML features**: streak_current, streak_type_win/loss, streak_tilt_risk, streak_hot_hand, streak_continuation_prob
  - **Console warnings**:
    - ⚠️ TILT RISK WARNING when entering after 3+ losses
    - 🔥 HOT HAND note when entering after 3+ wins
    - Shows historical continuation rate if available
  - **Constants**: STREAK_TILT_THRESHOLD=3, STREAK_HOT_HAND_THRESHOLD=3, STREAK_POSITION_ANALYSIS_FILE

### [T771] Trading: Add streak position to daily summary report
- **Status**: TODO
- **Owner**: -
- **Depends**: [T387]
- **Blocks**: -
- **Priority**: P3
- **Notes**: Include streak position stats in daily summary:
  - Best/worst performing contexts today
  - Context where most trades occurred
  - Any tilt warnings triggered
  - Streak continuation accuracy for the day

### [T772] Dashboard: Add streak position tooltip to Trade History Pattern
- **Status**: TODO
- **Owner**: -
- **Depends**: [T387]
- **Blocks**: -
- **Priority**: P4
- **Notes**: Enhance Trade History Pattern (colored dots) with streak context:
  - Hover on dot to see what streak context that trade was in
  - Show if trade was after N wins/losses
  - Show continuation probability at that time
  - Helps identify if tilt patterns affected decisions

### [T773] Trading: Configurable streak thresholds via environment
- **Status**: TODO
- **Owner**: -
- **Depends**: [T770]
- **Blocks**: -
- **Priority**: P4
- **Notes**: Make streak detection thresholds configurable:
  - STREAK_TILT_THRESHOLD env var (default 3)
  - STREAK_HOT_HAND_THRESHOLD env var (default 3)
  - Allow users to adjust sensitivity based on their trading style
  - Document in TOOLS.md or trading docs

### [T774] Trading: Telegram alert for high-tilt-risk trades
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-02-01
- **Depends**: [T770]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Implemented Telegram alert for tilt-risk trades!
  - **Function**: `write_tilt_risk_alert(trade_data, streak_ctx)`
  - **Alert file**: `scripts/kalshi-tilt-risk.alert`
  - **Triggers**: When trade is executed while tilt_risk=True (3+ consecutive losses)
  - **Alert content**: ticker, side, contracts, edge, streak context, consecutive losses, continuation probability
  - **Integration**: Called after successful trade execution if tilt_risk flag is set
  - **HEARTBEAT.md**: Updated to pick up kalshi-tilt-risk.alert files

### [T775] Trading: Analyze streak position vs outcome correlation
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-02-01
- **Depends**: [T770]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Implemented streak impact analysis script!
  - **Script**: `scripts/analyze-streak-impact.py`
  - **Features:**
    - ✅ Analyzes win rate by streak context (after_N_wins, after_N_losses, fresh_start)
    - ✅ Compares tilt_risk trades vs normal trades
    - ✅ Compares hot_hand trades vs normal trades
    - ✅ Calculates ROI and avg edge per category
    - ✅ Generates recommendations based on data patterns
    - ✅ Handles missing data gracefully (awaiting v2 trades with streak_context)
  - **Output**: `data/trading/streak-impact-analysis.json`
  - **Usage**: `python3 scripts/analyze-streak-impact.py [--v2]`
  - Currently awaiting trades with streak_context field (from T770)

### [T776] Deploy agent stats CSV export to onde.surf
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-02-01
- **Depends**: [T757]
- **Blocks**: -
- **Priority**: P2
- **Notes**: ✅ Deployed! https://9e152482.onde-surf.pages.dev
  - Build via `npm run build:cf` - passed
  - Deploy via wrangler to Cloudflare Pages
  - Site returns 307 (auth redirect as expected)
  - Agent stats CSV export now live on /house leaderboard

### [T777] Dashboard: Add streak impact analysis widget to /betting
- **Status**: TODO
- **Owner**: -
- **Depends**: [T775]
- **Blocks**: -
- **Priority**: P3
- **Notes**: Visualize streak impact analysis on dashboard:
  - Show win rate by streak context as bar chart
  - Highlight tilt_risk vs normal performance
  - Display recommendations from analysis
  - Auto-load from streak-impact-analysis.json gist

### [T778] Cron: Weekly streak impact report
- **Status**: TODO
- **Owner**: -
- **Depends**: [T775]
- **Blocks**: -
- **Priority**: P4
- **Notes**: Run streak analysis weekly and alert if patterns found:
  - Cron: Sunday after weekly report
  - Run analyze-streak-impact.py
  - Alert to Telegram if tilt_risk win rate significantly lower
  - Include streak summary in weekly report

### [T779] Trading: Alert when daily tilt trades exceed threshold
- **Status**: TODO
- **Owner**: -
- **Depends**: [T770], [T774]
- **Blocks**: -
- **Priority**: P3
- **Notes**: Track daily tilt trades and alert when exceeding threshold:
  - Count tilt_risk=True trades per day
  - Alert at TILT_ALERT_THRESHOLD env var (default 3)
  - Suggests taking a break from trading
  - Resets at midnight UTC

### [T780] Trading: Measure streak sizing effectiveness over time
- **Status**: TODO
- **Owner**: -
- **Depends**: [T388]
- **Blocks**: -
- **Priority**: P3
- **Notes**: Create analysis script to measure T388 impact:
  - Compare win rate of streak-reduced trades vs normal
  - Calculate money saved by reducing position during tilt
  - Compare before/after T388 implementation
  - Generate weekly report with findings
  - Output: data/trading/streak-sizing-analysis.json

### [T781] Dashboard: Show active position size adjustments
- **Status**: TODO
- **Owner**: -
- **Depends**: [T388]
- **Blocks**: -
- **Priority**: P4
- **Notes**: Add visual indicator to /betting when position sizing adjustments are active:
  - Show badge when streak_multiplier != 1.0 in recent trades
  - Tooltip with current streak context
  - Color-coded: yellow for hot_hand, red for tilt_risk
  - Helps user understand why positions may be smaller

### [T782] Reader App: Offline book download for PWA
- **Status**: TODO
- **Owner**: -
- **Depends**: [T690]
- **Blocks**: -
- **Priority**: P3
- **Notes**: Allow downloading books for offline reading:
  - "Download" button next to each book in library
  - Store full EPUB in IndexedDB cache
  - Show download status and storage used
  - Delete option to free space
  - Auto-download in background when on WiFi (optional)


### [T783] Deploy level-up sound effects to onde.surf
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-02-01
- **Depends**: [T756]
- **Blocks**: -
- **Priority**: P2
- **Notes**: ✅ Deployed! https://f96b2ca7.onde-surf.pages.dev
  - Build via `npm run build:cf` - passed
  - Deploy via wrangler to Cloudflare Pages
  - ✅ Verified: https://onde.surf → 307 (auth redirect as expected)
  - Level-up sound effects now live in Free River House!

### [T784] Add test coverage for FreeRiverHouse gamification features
- **Status**: TODO
- **Owner**: -
- **Depends**: -
- **Blocks**: -
- **Priority**: P4
- **Notes**: Create Playwright tests for Free River House:
  - Test agent level display
  - Test XP progress bar
  - Test level-up celebration animation
  - Test sound toggle persistence
  - Test notification toggle

### [T785] Agent mood tooltip with explanation
- **Status**: TODO
- **Owner**: -
- **Depends**: [T510]
- **Blocks**: -
- **Priority**: P4
- **Notes**: Add tooltip to agent mood emoji showing explanation:
  - "😴 Sleepy - Agent has been idle for >1 hour"
  - "😰 Stressed - Agent has >5 pending tasks"
  - "😊 Happy - Agent is on a winning streak!"
  - Helps users understand mood calculations

### [T786] Alert frequency analysis - track which alerts fire most
- **Status**: TODO
- **Owner**: -
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: Create script to analyze alert frequency:
  - Parse alert history from data/alerts/ and scripts/*.alert creations
  - Count alerts by type over 7/30 days
  - Identify most frequent alert types
  - Detect if certain alerts are too noisy (fire >3x/day)
  - Generate recommendations (adjust thresholds, consolidate, etc.)
  - Output: data/alerts/frequency-analysis.json
  - Could help reduce alert fatigue

### [T787] Trading lessons learned - analyze losing trade patterns
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-02-01
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Implemented trading lessons learned analysis!
  - **Script**: `scripts/analyze-lessons-learned.py`
  - **Patterns analyzed:**
    - By asset (BTC, ETH, weather)
    - By side (YES, NO)
    - By momentum state (bullish, bearish, neutral)
    - By hour of day (identifies bad trading hours)
    - By alignment status
    - By volatility ratio
    - By asset+side combination (worst combos)
  - **Lessons auto-generated:**
    - Asset underperformance warnings
    - Side bias detection
    - Momentum mismatch patterns
    - Time sensitivity alerts
    - Alignment effectiveness check
    - Worst combination identification
  - **Output**: `data/trading/lessons-learned.json`
  - **Usage:**
    - `python3 analyze-lessons-learned.py` - Analyze all trades
    - `python3 analyze-lessons-learned.py --v2` - V2 trades only
    - `python3 analyze-lessons-learned.py --days 7` - Last 7 days
    - `python3 analyze-lessons-learned.py --verbose` - Detailed output

### [T788] Dashboard: Correlation history sparkline on /betting
- **Status**: TODO
- **Owner**: -
- **Depends**: [T723]
- **Blocks**: -
- **Priority**: P3
- **Notes**: Add BTC-ETH correlation history visualization to dashboard:
  - Sparkline showing 7-day correlation trend
  - Current value with color coding (red >0.9, yellow 0.7-0.9, green <0.7)
  - Hover tooltip showing historical values
  - Uses correlation-history.jsonl data from T723
  - Helps visualize diversification opportunities over time

### [T789] Autotrader: Integrate trading window recommendations
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-30
- **Depends**: [T412]
- **Blocks**: -
- **Priority**: P2
- **Notes**: ✅ Implemented trading window schedule enforcement!
  - **Config:**
    - `TRADING_SCHEDULE_FILE` = `data/trading/trading-recommendations.json`
    - `TRADING_SCHEDULE_ENABLED` = env var (default: true)
  - **Functions:**
    - `load_trading_schedule()` - loads recommendations JSON
    - `check_trading_schedule()` - returns (should_trade, reason)
    - `log_schedule_skip()` - logs to kalshi-schedule-skips.jsonl
  - **Behavior:**
    - Checks schedule at start of each cycle
    - Skips cycle if current day is in `avoid_days`
    - Skips cycle if current hour not in `active_hours`
    - Logs reason for skip
    - Prints schedule status each cycle
  - **Override:** `--ignore-schedule` flag disables check
  - **Env:** `TRADING_SCHEDULE_ENABLED=false` also disables

### [T790] Dashboard: Trading window recommendations widget
- **Status**: IN_PROGRESS
- **Owner**: @clawd
- **Depends**: [T412]
- **Blocks**: -
- **Priority**: P3
- **Notes**: Show trading recommendations on dashboard:
  - Best/worst windows table with confidence intervals
  - Current hour highlighted (green if good, red if bad)
  - "Trading paused" indicator when in avoid period
  - Links to full heatmap (T411) for details
  - Add to /betting page analytics section

### [T791] Cron: Daily trading recommendations refresh
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-30
- **Depends**: [T412]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Implemented daily trading recommendations refresh!
  - **Script**: `scripts/cron-trading-recommendations.sh`
  - **Features:**
    - ✅ Runs `recommend-trading-windows.py` daily at 00:00 UTC
    - ✅ Logs history to `data/trading/trading-recommendations-history.jsonl`
    - ✅ Compares new vs previous recommendations
    - ✅ Creates `kalshi-recommendations-change.alert` if:
      - Avoid days list changed
      - Active hours changed by ≥4 hours
    - ✅ Alert includes: old/new values, best windows, details
    - ✅ Gist upload already integrated via push-stats-to-gist.py
  - **Cron**: `0 0 * * *` (added to system crontab)
  - **Alert**: Added to HEARTBEAT.md for pickup


### [T792] Dashboard: Trading window heatmap widget
- **Status**: TODO
- **Owner**: -
- **Depends**: [T790]
- **Blocks**: -
- **Priority**: P3
- **Notes**: Add interactive heatmap visualization for trading windows:
  - 7x24 grid showing win rate by day/hour
  - Color gradient: red (avoid) → yellow (neutral) → green (good)
  - Click to expand hour details (trades, win rate, PnL)
  - Toggle between win rate and PnL views
  - Highlight current hour with border
  - Show confidence intervals on hover

### [T793] SE-Bot: Add keyboard shortcuts overlay
- **Status**: TODO
- **Owner**: -
- **Depends**: [T474]
- **Blocks**: -
- **Priority**: P3
- **Notes**: Add keyboard shortcut guide to SE-Bot overlay:
  - Press '?' to show/hide shortcuts panel
  - Shortcuts: 1/2/3 (copy suggestions), Cmd+Shift+S (toggle), Esc (minimize)
  - Add 'M' to mute/unmute mic capture
  - Add 'Space' to pause/resume analysis
  - Show current state indicators (listening, paused, muted)

### [T794] Reader App: Add chapter jump dropdown
- **Status**: TODO
- **Owner**: -
- **Depends**: [T690]
- **Blocks**: -
- **Priority**: P3
- **Notes**: Improve navigation in Reader App:
  - Dropdown/modal showing all chapters from TOC
  - Current chapter highlighted
  - Search filter for long TOC lists
  - Quick jump buttons for +10/-10 pages
  - Keyboard shortcut 'G' for "go to" dialog
  - Remember last reading positions per book

### [T795] Trading: Add gist push health status to daily report
- **Status**: TODO
- **Owner**: -
- **Depends**: [T767]
- **Blocks**: -
- **Priority**: P4
- **Notes**: Include gist push health in autotrader daily report:
  - Count of gist push attempts/failures in last 24h
  - Parse gist-push-errors.log for recent entries
  - Show "✅ Gist sync healthy" or "⚠️ N gist push errors"
  - Include in hourly health report if failures detected
  - Track average retry count per push (efficiency metric)

### [T796] Dashboard: Add system health indicators bar
- **Status**: TODO
- **Owner**: -
- **Depends**: [T767]
- **Blocks**: -
- **Priority**: P3
- **Notes**: Add persistent health bar to onde.surf dashboard:
  - Small status icons at top: autotrader (🟢/🔴), gist sync (🟢/🔴), API (🟢/🔴)
  - Click icon to expand details
  - Gist sync: last successful push timestamp, failure count
  - API: current rate limit usage, latency
  - Autotrader: PID, uptime, last trade time
  - Auto-hide when all healthy, show on degraded

### [T797] Trading: Analyze optimal trade frequency
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-02-01
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Implemented trade frequency analysis!
  - **Script**: `scripts/analyze-trade-frequency.py`
  - **Features:**
    - ✅ Gap bucket analysis (immediate/short/medium/standard/long/very_long)
    - ✅ Activity level analysis (high/normal/low activity periods)
    - ✅ Consecutive results analysis (after win/loss/neutral)
    - ✅ Auto-generated recommendations
    - ✅ Summary statistics (avg/median/min/max gaps)
  - **Key findings from initial analysis:**
    - Medium gaps (15-30 min) outperform immediate trades
    - Low-activity periods have better win rates
    - Trades after losses severely underperform (1.7% vs 91.7% after wins)
  - **Output**: `data/trading/trade-frequency-analysis.json`
  - **Usage:**
    - `python analyze-trade-frequency.py` - Full analysis
    - `python analyze-trade-frequency.py --days 30` - Last N days
    - `python analyze-trade-frequency.py --json` - JSON output

### [T798] Dashboard: A/B testing results visualization widget
- **Status**: TODO
- **Owner**: -
- **Depends**: [T220]
- **Blocks**: -
- **Priority**: P3
- **Notes**: Add widget to onde.surf /betting to visualize A/B test results:
  - Show comparison chart of strategies tested
  - Bar chart comparing win rate, ROI, Sharpe ratio
  - Highlight statistically significant winners with ⭐
  - Filter by test type (backtest vs paper)
  - Show test date and parameters used
  - "Run New Test" button to trigger from dashboard

### [T799] Trading: Auto-alert when A/B test shows significant winner
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-02-01
- **Depends**: [T220]
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Implemented weekly A/B test auto-alert!
  - **Script**: `scripts/weekly-ab-test.py`
  - **Features:**
    - ✅ Runs baseline vs all 7 strategy variants
    - ✅ Analyzes last 30 days of historical trades
    - ✅ Statistical significance testing (z-test)
    - ✅ Creates alert when strategy improves win rate by 5%+
    - ✅ Alert file: `kalshi-strategy-recommendation.alert`
    - ✅ Results persistence: `data/trading/weekly-ab-test-results.json`
    - ✅ State tracking to avoid duplicate runs within week
    - ✅ Dry-run and verbose modes
  - **Cron**: `0 21 * * 0` (Sunday 21:00 UTC / 13:00 PST)
  - **Usage:**
    - `python weekly-ab-test.py` - Run test
    - `python weekly-ab-test.py --dry-run` - Preview
    - `python weekly-ab-test.py --force` - Run even if already ran this week

### [T800] Trading: Auto-tune strategy parameters based on recent performance
- **Status**: TODO
- **Owner**: -
- **Depends**: [T220], [T485]
- **Blocks**: -
- **Priority**: P2
- **Notes**: Implement adaptive parameter tuning:
  - Analyze last 7 days of trades daily
  - If win rate < 40%: increase MIN_EDGE by 0.02
  - If concentration > 50%: tighten CONCENTRATION_LIMIT
  - If max drawdown > 30%: reduce KELLY_FRACTION
  - Log parameter adjustments to `data/trading/auto-tune.jsonl`
  - Manual override via env vars
  - Limit: max 2 adjustments per week to avoid thrashing

### [T801] Fix 308 redirects on onde.la (4 test failures)
- **Priority**: P1
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-30
- **Depends**: -
- **Notes**: ✅ Fixed! Test URLs now use canonical trailing-slash format:
  - /libri/ → 200 ✅
  - /catalogo/ → 200 ✅
  - /about/ → 200 ✅
  - /health/ → 200 ✅
  - **Files fixed:**
    - scripts/daily-test-suite.py
    - scripts/lighthouse-audit.sh
    - scripts/watchdog-all-services.sh
    - scripts/visual-regression-tests.py
  - **Root cause**: Cloudflare/Next.js trailing slash redirect behavior (308 → canonical URL)
  - **Solution**: Updated tests to use canonical URLs with trailing slashes
  - Original issue: /libri → 308
  - /catalogo → 308
  - /about → 308
  - /health → 308
  Likely trailing slash or http→https redirect issue. Need to either:
  1. Fix the redirects in Cloudflare/server config, OR
  2. Update test script to follow redirects (-L flag)
  Reference: test-failure.alert 2025-01-30

### [T802] Trading: Analyze holiday trading performance retrospectively
- **Status**: TODO
- **Owner**: -
- **Depends**: [T414]
- **Blocks**: -
- **Priority**: P3
- **Notes**: Create script to analyze trading performance on vs off holidays:
  - Parse trade logs for trades with `is_holiday: true`
  - Compare win rate: holiday vs non-holiday
  - Compare PnL: holiday vs non-holiday
  - Validate if holiday pause logic is effective
  - Output: `data/trading/holiday-performance.json`
  - Script: `scripts/analyze-holiday-performance.py`

### [T803] SE-Bot: Add comprehensive integration tests
- **Status**: TODO
- **Owner**: -
- **Depends**: [T474]
- **Blocks**: -
- **Priority**: P3
- **Notes**: Create pytest test suite for SE-Bot modules:
  - Test audio capture (mock sounddevice)
  - Test transcription pipeline (mock whisper)
  - Test knowledge base search quality
  - Test context analyzer RAG retrieval
  - Test overlay UI rendering
  - CI/CD integration via GitHub Actions
  - Test file: `apps/se-bot/tests/test_integration.py`

### [T804] Trading: Weekly position diversity report
- **Status**: TODO
- **Owner**: -
- **Depends**: [T480], [T482]
- **Blocks**: -
- **Priority**: P3
- **Notes**: Generate weekly diversity report:
  - Average concentration by asset class
  - Time spent at >40% concentration (warning zone)
  - Correlation with win rate during concentrated periods
  - Recommendations for better diversification
  - Telegram delivery via cron Sunday evening
  - Script: `scripts/weekly-diversity-report.py`

### [T805] Trading: Stop-loss history trend chart
- **Status**: TODO
- **Owner**: -
- **Depends**: [T366]
- **Blocks**: -
- **Priority**: P3
- **Notes**: Add historical view to stop-loss widget:
  - Line chart showing monthly stop-loss counts
  - Effectiveness trend (% correct over time)
  - Compare stop-loss frequency vs volatility periods
  - Identify if stop-loss threshold needs seasonal adjustment
  - Data from kalshi-stop-loss.log aggregated by month

### [T806] Trading: Analyze premature stop-loss patterns
- **Status**: TODO
- **Owner**: -
- **Depends**: [T366]
- **Blocks**: -
- **Priority**: P3
- **Notes**: Identify when stop-losses exit too early:
  - Correlate premature exits with time of day
  - Check if volatility spike before recovery is common
  - Measure average recovery time for "would have won" trades
  - Suggest optimal stop-loss threshold based on data
  - Script: `scripts/analyze-premature-stops.py`

### [T807] Dashboard: System alerts feed widget
- **Status**: DONE
- **Owner**: @clawd
- **Completed**: 2026-01-30
- **Depends**: -
- **Blocks**: -
- **Priority**: P3
- **Notes**: ✅ Real-time alerts feed widget on /health:
  - ✅ Component: `apps/surfboard/src/components/SystemAlertsFeedWidget.tsx`
  - ✅ Shows last 10 alerts from `/api/health/alerts-history`
  - ✅ Color-coded by severity (critical=red, degraded=amber, resolved=green)
  - ✅ Emoji indicators: 🚨 Critical, ⚠️ Warning, ✅ Resolved
  - ✅ Timestamps with "X ago" format
  - ✅ Affected services badges per alert
  - ✅ Resolution time shown for resolved alerts
  - ✅ Auto-refresh every 30 seconds
  - ✅ Scrollable list with max-height
  - ✅ Loading skeleton, error state, empty state with 🎉
  - ✅ Active alerts badge counter in header
  - ✅ Data source indicator (KV vs cached)
  - ✅ Build passes, ready for deploy

### [T808] Trading: Volume-weighted win rate analysis
- **Status**: TODO
- **Owner**: -
- **Depends**: [T754]
- **Blocks**: -
- **Priority**: P3
- **Notes**: Analyze if larger trades have different success rates:
  - Group trades by size: small (<$0.50), medium ($0.50-$1), large (>$1)
  - Calculate win rate per size bucket
  - Check if PnL scales proportionally with trade size
  - Identify optimal position sizing strategy
  - Output: `data/trading/volume-weighted-analysis.json`
  - Script: `scripts/analyze-volume-weighted-winrate.py`

### [T809] Dashboard: DailyVolumeWidget with sparkline
- **Status**: TODO
- **Owner**: -
- **Depends**: [T754]
- **Blocks**: -
- **Priority**: P3
- **Notes**: Create dashboard widget showing daily trading volume:
  - Today's volume vs yesterday with % change
  - 7-day sparkline from dailyVolume.history
  - Trade count indicator
  - Week total volume
  - Match styling of WinRateSparkline
  - Component: `apps/surfboard/src/components/DailyVolumeSparkline.tsx`
  - Add to /betting page stats section

### [T810] Trading: Autotrader activity correlation analysis
- **Status**: TODO
- **Owner**: -
- **Depends**: [T754], [T482]
- **Blocks**: -
- **Priority**: P3
- **Notes**: Analyze how trading activity correlates with performance:
  - Compare win rate on high-volume vs low-volume days
  - Check if overtrading (high activity) hurts performance
  - Correlate with concentration metrics
  - Identify optimal trades-per-day target
  - Output: `data/trading/activity-correlation.json`
  - Script: `scripts/analyze-activity-correlation.py`

### [T811] SE-Bot: Create quickstart script with dependency checker
- **Status**: TODO
- **Owner**: -
- **Depends**: [T732]
- **Blocks**: -
- **Priority**: P3
- **Notes**: Create `quickstart.py` script that:
  - Checks all system dependencies (Python, whisper-cpp, ffmpeg, BlackHole)
  - Validates API keys (ANTHROPIC, ELEVENLABS)
  - Builds knowledge base if not present
  - Downloads Whisper model if missing
  - Runs component health checks
  - Shows step-by-step setup wizard for missing components
  - Single command to get SE-Bot ready: `python quickstart.py`

### [T812] Reader App: Add daily reading goal feature
- **Status**: TODO
- **Owner**: -
- **Depends**: [T719]
- **Blocks**: -
- **Priority**: P3
- **Notes**: Add reading goal tracking to Reader App:
  - Set daily goal (pages or minutes)
  - Progress ring/bar on library page
  - Streak bonus for consecutive goal days
  - Weekly goal summary
  - Notifications/encouragement at 50%/100%
  - Integrate with existing ReadingStatsStore
  - Optional: adjust goal based on historical averages

### [T813] Trading: Market regime detection for strategy switching
- **Status**: TODO
- **Owner**: -
- **Depends**: [T483]
- **Blocks**: -
- **Priority**: P2
- **Notes**: Detect market regime to auto-adjust trading strategy:
  - Regimes: trending (strong momentum), ranging (mean-reversion), volatile (reduce exposure)
  - Use BTC/ETH price action + volatility metrics
  - Adjust position sizing based on regime
  - Log regime changes to alert file
  - Consider disabling certain market types in volatile regime
  - Script: `scripts/market-regime-detector.py`
  - Output: `data/trading/market-regime.json`

### [T814] Trading: Track composite signal accuracy over time
- **Status**: TODO
- **Owner**: -
- **Depends**: [T460]
- **Blocks**: -
- **Priority**: P3
- **Notes**: Track how well composite signals predict trade outcomes:
  - Log composite_signals count with each trade
  - Compare win rate by signal count (0/1/2/3 signals)
  - Calculate ROI by composite confidence level
  - Weekly report section: "Composite Signal Performance"
  - Script: `scripts/analyze-composite-signals.py`
  - Output: `data/trading/composite-signal-stats.json`

### [T815] Dashboard: Composite signal hit rate widget
- **Status**: TODO
- **Owner**: -
- **Depends**: [T814]
- **Blocks**: -
- **Priority**: P3
- **Notes**: Dashboard widget showing composite signal effectiveness:
  - Win rate by signal count (bar chart)
  - ROI by confidence level (table)
  - Recent trades with signal info
  - Recommendation: optimal signal threshold
  - Component: `CompositeSignalWidget.tsx`
  - Pull data from gist (extend push-stats-to-gist.py)

### [T816] Trading: Add composite signal logging to trade data
- **Status**: TODO
- **Owner**: -
- **Depends**: [T460]
- **Blocks**: [T814]
- **Priority**: P2
- **Notes**: Ensure composite signal data is logged with each trade:
  - Add to trade log: composite_signals, composite_confidence, composite_reasons
  - Update log_trade() function to include new fields
  - Required for T814 analysis
  - Verify fields appear in kalshi-trades-*.jsonl

### [T817] Dashboard: Latency vs Win Rate correlation chart
- **Status**: TODO
- **Owner**: -
- **Depends**: [T804]
- **Blocks**: -
- **Priority**: P3
- **Notes**: Visualize relationship between API latency and trade outcomes:
  - Scatter plot: latency (x-axis) vs win rate bucket (y-axis)
  - Show trend line to identify correlation
  - Color-code by time period (morning/afternoon/night)
  - Use data from latency-performance-analysis.json
  - Help determine optimal latency thresholds

### [T818] Trading: Time-of-day latency pattern analysis
- **Status**: TODO
- **Owner**: -
- **Depends**: [T801]
- **Blocks**: -
- **Priority**: P3
- **Notes**: Analyze latency patterns by time of day:
  - Script: scripts/analyze-latency-patterns.py
  - Group latency data by hour (PST)
  - Identify peak latency hours
  - Calculate best/worst trading windows
  - Output: JSON with hourly averages + recommendations
  - Could inform trading schedule optimization

### [T819] Dashboard: Historical latency comparison widget
- **Status**: TODO
- **Owner**: -
- **Depends**: [T800]
- **Blocks**: -
- **Priority**: P3
- **Notes**: Compare today's latency vs historical averages:
  - Show today avg vs 7d avg vs 30d avg
  - Visual indicator: better/worse than usual
  - Sparkline showing trend direction
  - Quick glance widget for /betting or /health page
  - Data from latency-history.jsonl aggregation
