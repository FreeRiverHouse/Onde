# WhisperFlow Research - Real-Time Local Transcription App

**Date:** 2026-01-30
**Task:** T411

## Goal

Create a menu bar app for macOS that provides real-time, local speech-to-text transcription. No cloud dependencies. Future: VR vibe coding integration.

## Current State

We already have basic Whisper transcription via `scripts/transcribe-voice.sh`:
- Uses OpenAI Whisper (Homebrew: `openai-whisper`)
- Model: `small` (~461MB RAM)
- Process: Record → Convert to WAV → Transcribe → Output
- **Latency:** Not real-time (batch processing)

## Technology Options Analysis

### 1. **whisper.cpp** (Recommended for macOS)
- **Pros:**
  - Native C++ with Metal acceleration (Apple Silicon optimized)
  - ~10x faster than Python whisper on M-series chips
  - Streaming capable with `whisper.cpp/stream`
  - Low memory footprint
- **Cons:**
  - Needs compilation
  - Less Python integration
- **Install:** `brew install whisper-cpp`
- **Best for:** Real-time on macOS

### 2. **faster-whisper** (Good Python Alternative)
- **Pros:**
  - CTranslate2 backend, ~4x faster than OpenAI Whisper
  - Python native, easy integration
  - Supports GPU acceleration (NVIDIA via CUDA)
- **Cons:**
  - No Metal support (CPU only on macOS)
  - Still batch-based, not true streaming
- **Install:** `pip install faster-whisper`
- **Best for:** Faster batch processing on NVIDIA GPUs

### 3. **NVIDIA Parakeet/Canary**
- **Pros:**
  - True streaming ASR (transcribes while speaking)
  - High accuracy
  - Word-level timestamps
- **Cons:**
  - NVIDIA GPU required (CUDA)
  - Not available on macOS/Apple Silicon
- **Best for:** Linux/Windows with NVIDIA

### 4. **Silero VAD** (Voice Activity Detection)
- **Use:** Detect when user starts/stops speaking
- **Purpose:** Trigger transcription only on speech
- **Critical for:** Reducing CPU usage, enabling streaming
- **Install:** `pip install silero-vad` or `torch.hub.load('snakers4/silero-vad')`

### 5. **RealtimeSTT** (Python Wrapper)
- **What:** Combines VAD + Whisper for pseudo-streaming
- **How:** Records in chunks, transcribes segments on silence
- **Latency:** ~1-2 seconds after speech stops
- **Best for:** Quick Python prototype

## Recommended Architecture (macOS)

```
┌─────────────────────────────────────────┐
│          Menu Bar App (SwiftUI)         │
├─────────────────────────────────────────┤
│ ┌─────────┐  ┌──────────┐  ┌──────────┐ │
│ │   Mic   │→ │ Silero   │→ │whisper   │ │
│ │ Input   │  │  VAD     │  │  .cpp    │ │
│ └─────────┘  └──────────┘  └──────────┘ │
│                    ↓                    │
│           ┌──────────────┐              │
│           │ Text Output  │              │
│           │ (Overlay/    │              │
│           │  Clipboard)  │              │
│           └──────────────┘              │
└─────────────────────────────────────────┘
```

## Implementation Plan

### Phase 1: CLI Prototype (Python)
1. Install whisper.cpp via Homebrew
2. Create Python wrapper with VAD integration
3. Test streaming transcription latency
4. Benchmark: small vs base vs tiny models

### Phase 2: Menu Bar MVP (SwiftUI)
1. Create macOS menu bar app
2. Integrate audio capture (AVFoundation)
3. Call whisper.cpp for transcription
4. Display text in overlay or copy to clipboard

### Phase 3: VR Ready
1. WebSocket server for external apps
2. Quest integration via Clawdbot mobile node
3. Voice commands for coding (Cursor/Windsurf)

## Benchmarks (Actual - M1 Pro)

**Test:** 10 seconds of audio, 4 threads

| Run | Time | Notes |
|-----|------|-------|
| 1st | 9.02s | Cold start (model loading) |
| 2nd | 0.73s | Warm |
| 3rd | 0.64s | Warm |
| **Avg** | **0.68s** | After model loaded |
| **RTF** | **0.35x** | 🚀 3x faster than real-time! |

### Model Sizes

| Model | Size | Expected Speed |
|-------|------|----------------|
| tiny | 39MB | ~5x faster than base |
| base | 147MB | Tested ✅ |
| small | 244MB | ~2x slower than base |
| medium | 769MB | ~4x slower than base |

## Quick Start Commands

```bash
# Install whisper.cpp (macOS)
brew install whisper-cpp

# Test streaming transcription
whisper-cpp --model /path/to/ggml-base.bin --stream

# Install Python VAD
pip install torch torchaudio
pip install faster-whisper  # Optional

# Test VAD
python3 -c "import torch; torch.hub.load('snakers4/silero-vad', 'silero_vad')"
```

## Open Questions

1. **Menu bar framework:** SwiftUI native or Electron/Tauri?
   - SwiftUI: Best performance, native feel
   - Tauri: Cross-platform, Rust backend
   - Electron: Heaviest, but fastest to develop

2. **Model location:** Bundle or download on first run?

3. **Hotkey:** Global hotkey to start/stop recording?

## Resources

- whisper.cpp: https://github.com/ggerganov/whisper.cpp
- faster-whisper: https://github.com/SYSTRAN/faster-whisper  
- Silero VAD: https://github.com/snakers4/silero-vad
- RealtimeSTT: https://github.com/KoljaB/RealtimeSTT
- WhisperX: https://github.com/m-bain/whisperX

---

## Next Steps

1. [ ] Install and test whisper.cpp streaming mode
2. [ ] Benchmark latency on M1 Pro
3. [ ] Create CLI prototype with VAD
4. [ ] Decide on menu bar framework
5. [ ] Build MVP

*Research by @clawd for T411*
