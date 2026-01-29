# Whisper Menu Bar - Voice-to-Text Prototype

Fast local voice transcription using OpenAI Whisper.

## Day 1: CLI ✓

```bash
# Setup
cd tools/whisper-menu
python3 -m venv .venv
source .venv/bin/activate
pip install sounddevice numpy pyperclip

# Run
./whisper_cli.py              # Record → transcribe → clipboard
./whisper_cli.py --lang en    # Force English
./whisper_cli.py --model tiny # Faster, less accurate
./whisper_cli.py -f audio.wav # Transcribe existing file
```

## Day 2: Menu Bar (TODO)

- rumps/pystray for menu bar icon
- Click to record, release to transcribe
- Visual feedback

## Day 3: Hotkey (TODO)

- Global hotkey (e.g., Cmd+Shift+V)
- Auto-paste or clipboard

## Day 4: Polish (TODO)

- Settings (model, language, hotkey)
- Status indicator
- Error handling

## Dependencies

- OpenAI Whisper (via Homebrew: `brew install whisper`)
- Python 3.x with venv
- sounddevice, numpy, pyperclip
