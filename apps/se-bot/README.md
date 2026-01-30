# SE-Bot: AI Meeting Copilot 🤖

Real-time AI assistant for sales engineering calls. Captures system audio, transcribes with Whisper, retrieves relevant knowledge via RAG, and displays actionable suggestions in a macOS overlay.

## ✨ Features

- **🎤 Real-time Audio Capture**: Hooks into macOS system audio via BlackHole virtual driver
- **🗣️ Live Transcription**: Whisper-powered speech-to-text with language detection
- **🧠 RAG Knowledge Base**: ChromaDB-indexed SASE/SD-WAN/Security content for instant retrieval
- **💡 Smart Suggestions**: Claude-powered response generation with context-aware styling
- **🖥️ Native macOS Overlay**: Always-on-top transparent window with hotkey toggle
- **🔊 Voice Output** (optional): ElevenLabs TTS for verbal responses

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              SE-Bot System                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│    ┌──────────────┐     ┌───────────────────┐     ┌───────────────────┐    │
│    │ System Audio │────▶│  BlackHole 2ch    │────▶│  audio_capture.py │    │
│    │ (Zoom/Meet)  │     │  Virtual Driver   │     │  (sounddevice)    │    │
│    └──────────────┘     └───────────────────┘     └─────────┬─────────┘    │
│                                                              │              │
│                                                              ▼              │
│    ┌──────────────────────────────────────────────────────────────────┐    │
│    │                    realtime_transcription.py                      │    │
│    │  ┌────────────────────────────────────────────────────────────┐  │    │
│    │  │  whisper-cpp (local)  │  VAD  │  Language Detection        │  │    │
│    │  └────────────────────────────────────────────────────────────┘  │    │
│    └────────────────────────────────────────────┬─────────────────────┘    │
│                                                 │                          │
│                                                 ▼                          │
│    ┌──────────────────────────────────────────────────────────────────┐    │
│    │                      context_analyzer.py                          │    │
│    │  ┌───────────────┐    ┌───────────────┐    ┌──────────────────┐  │    │
│    │  │ Style Detect  │───▶│  ChromaDB     │───▶│   Claude API     │  │    │
│    │  │ (tech/exec/   │    │  Knowledge    │    │   (response      │  │    │
│    │  │  competitive) │    │  Retrieval    │    │    generation)   │  │    │
│    │  └───────────────┘    └───────────────┘    └──────────────────┘  │    │
│    └────────────────────────────────────────────┬─────────────────────┘    │
│                                                 │                          │
│                         ┌───────────────────────┴───────────────────────┐  │
│                         ▼                                               ▼  │
│    ┌──────────────────────────────┐        ┌──────────────────────────────┐│
│    │       overlay_ui.py          │        │      voice_output.py         ││
│    │  ┌────────────────────────┐  │        │  ┌────────────────────────┐  ││
│    │  │ macOS NSPanel         │  │        │  │ ElevenLabs TTS         │  ││
│    │  │ Always-on-top         │  │        │  │ Virtual Mic Output     │  ││
│    │  │ Click-to-copy cards   │  │        │  │ (BlackHole)            │  ││
│    │  └────────────────────────┘  │        │  └────────────────────────┘  ││
│    └──────────────────────────────┘        └──────────────────────────────┘│
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 📋 Prerequisites

### Required
- **macOS** 12+ (Monterey or later)
- **Python** 3.9+
- **Homebrew** for package management
- **BlackHole** virtual audio driver

### Optional
- **ANTHROPIC_API_KEY** for Claude response generation (falls back to KB-only mode)
- **ELEVENLABS_API_KEY** for voice output

## 🚀 Installation

### 1. Install System Dependencies

```bash
# Install Homebrew if not present
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/master/install.sh)"

# Install whisper-cpp for local transcription
brew install whisper-cpp

# Install ffmpeg for audio processing
brew install ffmpeg

# Install BlackHole virtual audio driver (REQUIRES SUDO)
brew install blackhole-2ch
```

### 2. Configure Audio Routing

This is the crucial step to capture audio from Zoom/Meet/Teams.

#### Option A: Multi-Output Device (Recommended)

1. Open **Audio MIDI Setup** (Cmd+Space → "Audio MIDI Setup")
2. Click **+** at bottom-left → **Create Multi-Output Device**
3. Check these outputs:
   - ✅ Your speakers/headphones (e.g., "MacBook Pro Speakers")
   - ✅ **BlackHole 2ch**
4. Right-click → **Use This Device For Sound Output**
5. Name it "Meeting Audio" for easy identification

Now audio plays through your speakers AND routes to BlackHole for capture.

#### Option B: Per-App Routing (Advanced)

Use apps like **Loopback** ($99) or **Audio Hijack** for selective app routing.

### 3. Install Python Dependencies

```bash
cd apps/se-bot

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 4. Build Knowledge Base

```bash
# Build ChromaDB embeddings from knowledge base markdown files
python build_embeddings.py
```

This indexes all content in `knowledge-base/` for semantic search.

### 5. Download Whisper Model

```bash
# Download a Whisper model (options: tiny, base, small, medium, large)
python realtime_transcription.py --download-model base
```

Model size vs quality trade-off:
| Model | Size | Speed | Quality |
|-------|------|-------|---------|
| tiny | 75MB | Fastest | Basic |
| base | 142MB | Fast | Good |
| small | 466MB | Medium | Better |
| medium | 1.5GB | Slow | Great |
| large | 2.9GB | Slowest | Best |

### 6. Set API Keys (Optional)

```bash
# For Claude-powered responses
export ANTHROPIC_API_KEY="sk-ant-..."

# For voice output
export ELEVENLABS_API_KEY="..."
```

## 🎮 Usage

### Start Full System

```bash
# Activate venv
source venv/bin/activate

# Start SE-Bot with overlay
python se_bot_main.py
```

### Demo Mode (No Live Audio)

```bash
# Test with simulated meeting transcript
python se_bot_main.py --demo
```

### Headless Mode (CLI Only)

```bash
# No overlay, just console output
python se_bot_main.py --no-overlay
```

### Check System Status

```bash
python se_bot_main.py --status
```

### Component Testing

```bash
# Test audio capture
python audio_capture.py --demo

# Test transcription
python realtime_transcription.py --language en

# Test knowledge base search
python kb_search.py "What is ZTNA?"

# Test context analyzer
python context_analyzer.py --test "Why should we choose Versa over Palo Alto?"

# Test overlay UI
python overlay_ui.py --test

# Run meeting simulator
python meeting_simulator.py --batch
```

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| **Cmd+Shift+S** | Toggle overlay visibility |
| **1** | Copy suggestion #1 |
| **2** | Copy suggestion #2 |
| **3** | Copy suggestion #3 |

## 🔧 Configuration

### Response Styles

SE-Bot auto-detects the appropriate response style based on transcript content:

| Style | Trigger Keywords | Output Format |
|-------|-----------------|---------------|
| `technical-deepdive` | "architecture", "protocol", "API" | Detailed, technical |
| `executive-summary` | "ROI", "budget", "timeline" | Business-focused |
| `competitive-battle-card` | Competitor names (Palo Alto, Zscaler, etc.) | Comparison, fair positioning |
| `objection-handling` | "expensive", "concern", "risk" | Empathetic, redirect |
| `demo-suggestion` | "show", "demo", "see" | Transition to demo |

Override style manually:
```bash
python context_analyzer.py --test "question" --style executive-summary
```

### Knowledge Base Structure

```
knowledge-base/
├── sase/
│   └── overview.md
├── sd-wan/
│   └── overview.md
├── security/
│   ├── ztna.md
│   ├── threat-protection.md
│   └── compliance.md
├── competitive/
│   ├── vs-paloalto.md
│   ├── vs-zscaler.md
│   └── objections.md
└── style-guide/
    └── mattia-style.md
```

Add your own content as `.md` files, then rebuild:
```bash
python build_embeddings.py
```

## 🔊 Voice Output (Optional)

Enable TTS responses via ElevenLabs:

```bash
# Set API key
export ELEVENLABS_API_KEY="your_key"

# Test voice output
python voice_output.py --test

# List available voices
python voice_output.py --list-voices

# Speak through virtual microphone (to meeting)
python voice_output.py --speak "Hello" --output blackhole
```

## 🐛 Troubleshooting

### "No BlackHole device found"

1. Verify installation: `brew info blackhole-2ch`
2. Check Audio MIDI Setup for "BlackHole 2ch"
3. Restart if needed after installation

### "whisper-cpp not found"

```bash
# Install or reinstall
brew install whisper-cpp

# Verify
which whisper-cpp
```

### "No audio being captured"

1. Check Multi-Output Device is set as system output
2. Play audio in Zoom/Meet and verify BlackHole receives it:
   ```bash
   python audio_capture.py --demo
   # Should show audio level bars when sound is playing
   ```

### "Knowledge base is empty"

```bash
# Rebuild embeddings
python build_embeddings.py

# Verify document count
python kb_search.py --stats
```

### "Claude API errors"

- Check `ANTHROPIC_API_KEY` is set and valid
- Falls back to KB-only mode if no API key

### Overlay not appearing

1. Grant Accessibility permissions: System Settings → Privacy & Security → Accessibility
2. Grant Screen Recording permissions for audio capture
3. Try running with `sudo` if hotkeys don't work

## 📊 Meeting Logs

Interactions are logged for analysis and fine-tuning:

```bash
# View log stats
python meeting_logger.py --log-stats

# Export for fine-tuning
python meeting_logger.py --export-finetune training_data.jsonl

# Add feedback to entries
python meeting_logger.py --feedback
```

Logs stored in: `data/se-bot/meeting-logs/YYYY-MM-DD.jsonl`

## 🧪 Testing

### Search Quality Test

```bash
python test_search_quality.py
# Runs 10 queries, reports relevance scores
```

### Full Simulator Test

```bash
python meeting_simulator.py --batch --with-claude
# Tests 10 scenarios, measures latency
```

### Expected Performance

- KB lookup: < 200ms
- Full analysis (with Claude): < 2s
- Overlay update: < 100ms

## 📁 File Reference

| File | Purpose |
|------|---------|
| `se_bot_main.py` | Main orchestrator |
| `audio_capture.py` | BlackHole audio capture |
| `realtime_transcription.py` | Whisper transcription |
| `context_analyzer.py` | RAG + Claude analysis |
| `overlay_ui.py` | macOS NSPanel overlay |
| `voice_output.py` | ElevenLabs TTS |
| `kb_search.py` | ChromaDB search module |
| `build_embeddings.py` | Knowledge base indexer |
| `meeting_simulator.py` | Testing tool |
| `meeting_logger.py` | Interaction logging |
| `prompts/` | Claude prompt templates |
| `knowledge-base/` | Markdown content for RAG |
| `chroma_db/` | ChromaDB index (generated) |

## 🚀 Future Roadmap

- [ ] Video avatar integration (HeyGen/D-ID)
- [ ] Multi-language support
- [ ] Meeting platform integrations (Zoom API)
- [ ] Team knowledge base sync
- [ ] Analytics dashboard

## 📄 License

Internal use only - Onde / Free River House

---

*Built with ❤️ for sales engineers who want AI superpowers in meetings*
