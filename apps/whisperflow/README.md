# WhisperFlow 🎙️

Real-time local speech-to-text transcription using whisper.cpp and Silero VAD.

**Zero cloud dependencies. 100% local. Faster than real-time.**

## Features

- 🎤 **Voice Activity Detection** - Only transcribes when you speak
- ⚡ **Fast** - 0.35x RTF (3x faster than real-time on M1 Pro)
- 🔒 **Private** - Everything runs locally, no API calls
- 🌍 **Multilingual** - Supports 99+ languages

## Requirements

- macOS (Apple Silicon recommended)
- Python 3.10+
- whisper-cpp (`brew install whisper-cpp`)

## Quick Start

```bash
# Install whisper-cpp
brew install whisper-cpp

# Download model (147MB)
mkdir -p ~/.whisper-cpp/models
curl -L -o ~/.whisper-cpp/models/ggml-base.bin \
  "https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-base.bin"

# Setup Python environment
cd apps/whisperflow
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Run!
python3 whisperflow-vad.py
```

## Usage

```bash
# Voice-activated transcription (default)
python3 whisperflow-vad.py

# Specify language
python3 whisperflow-vad.py --language it

# List audio devices
python3 whisperflow-vad.py --list-devices

# Use specific microphone
python3 whisperflow-vad.py --device 2

# Adjust VAD sensitivity (0-1, lower = more sensitive)
python3 whisperflow-vad.py --threshold 0.3
```

## CLI Tools

### whisperflow-cli.py
Basic CLI for file transcription and benchmarking:
```bash
python3 whisperflow-cli.py --file audio.wav  # Transcribe file
python3 whisperflow-cli.py --benchmark       # Speed test
python3 whisperflow-cli.py --stream          # Use whisper-cpp native stream
```

### whisperflow-vad.py
Voice-activated real-time transcription:
```bash
python3 whisperflow-vad.py  # Start listening
```

## Benchmarks (M1 Pro)

| Model | Size | RTF | 10s Audio |
|-------|------|-----|-----------|
| tiny | 39MB | ~0.1x | ~1s |
| base | 147MB | 0.35x | ~3.5s |
| small | 244MB | ~0.7x | ~7s |
| medium | 769MB | ~1.5x | ~15s |

RTF = Real-Time Factor. < 1.0 means faster than real-time.

## Architecture

```
Microphone → Silero VAD → whisper.cpp → Text Output
               ↓
        Speech Detection
        (only transcribe
         when speaking)
```

## macOS Menu Bar App (NEW!)

A native SwiftUI menu bar app is now available:

```bash
cd apps/whisperflow/WhisperFlowApp
swift build -c release
# Run the app
.build/release/WhisperFlowApp
```

### Features
- 🎯 **Menu bar icon** - Click to open transcription panel
- ⌨️ **Global hotkey** - ⌘⇧T to toggle recording from anywhere
- 📋 **One-click copy** - Copy transcription to clipboard
- ⚙️ **Settings** - Language, VAD sensitivity, audio device

### Note
The app wraps the Python VAD script, so you still need the Python environment set up.

## Future Plans

- [x] macOS menu bar app (SwiftUI) ✅
- [x] Global hotkey trigger ✅
- [ ] Copy to clipboard overlay
- [ ] VR integration (Quest via Clawdbot)

## License

MIT

---

Part of [Onde](https://github.com/FreeRiverHouse/Onde) 🌊
