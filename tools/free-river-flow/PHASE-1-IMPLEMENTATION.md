# Free River Flow - Phase 1 Implementation Log

This document tracks the progress of the implementation based on the original master plan located at [PROMPT.md](./PROMPT.md) (Step 1 to 3 completed).

## What Has Been Completed

### STEP 1: Monorepo Skeleton 
- Initialized a Turborepo monorepo using npm workspaces (`apps/`, `packages/`).
- Scaffolded the Electron app in `apps/desktop` using Vite, React, and TypeScript.
- Created the `packages/shared-types` project containing baseline types (`Dictation`, `Project`, `SyncCommand`).
- Fixed TypeScript configuration and compilation errors to ensure a clean build pipeline with `turbo build`.

### STEP 2: Audio Capture & Whisper (Local ML)
- Created an audio capturing mechanism inside the React frontend using the `MediaRecorder` API. 
- Transcoded the WebM audio stream into a **16kHz mono PCM WAV** object directly in the browser via `AudioContext` to be perfectly compatible with Whisper C++.
- Hooked up `whisper.cpp`, cloned natively and built using `cmake` (Release configuration) with Apple Silicon (Metal) backend acceleration.
- Built a Node.js `spawn` engine within the main process (`apps/desktop/src/main/whisper/engine.ts`) to run `whisper-cli` inferences asynchronously in sub-300ms times. 

### STEP 3: Global Hotkey & Text Injection
- Added a `globalShortcut` listener to Electron for `CommandOrControl+Shift+Space`.
- Wired the system to pulse the UI record-button when the hotkey is held/toggled.
- Developed the `injectText` text-injection system using `@nut-tree-fork/nut-js` and the macOS `clipboard` API. It transparently copies the previous clipboard state, injects the new Whisper text string, performs a simulated `Cmd+V`, and restores the previous clipboard seamlessly.
- Constructed the AI **Post-Processing Pipeline** (`apps/desktop/src/main/pipeline/index.ts`) that strips filler words, corrects basic capitalization, and handles custom voice commands like *"new line"* or *"scratch that"*.
- Integrated `better-sqlite3` to dump the raw transcripts, processed transcripts, timings, and metadata locally right after inference.

## How to test locally
1. `cd /Users/mattia/Projects/Onde/free-river-flow/apps/desktop`
2. `npm run dev`
3. Press `Ctrl+Shift+Space` globally on your Mac anywhere (e.g., Cursor, Chrome), speak, and release it to see the text instantly injected.

## Next Up
- **STEP 4:** Floating Overlay + System Tray (stealth mode).
- **STEP 5:** Expanding the AI Post-Processing Pipeline further.
- **STEP 6:** Full SQLite DB Hookups (Search, Analytics). 
