#!/usr/bin/env python3
"""
Whisper Voice-to-Text CLI
Day 1 Prototype - Records audio, transcribes with Whisper, copies to clipboard.

Usage:
    ./whisper_cli.py              # Record until Enter, transcribe
    ./whisper_cli.py --file X.wav # Transcribe existing file
    ./whisper_cli.py --lang en    # Force English
"""

import argparse
import subprocess
import sys
import tempfile
import os
from pathlib import Path

# Check for required packages
try:
    import sounddevice as sd
    import numpy as np
    import pyperclip
except ImportError as e:
    print(f"Missing package: {e}")
    print("Run: source .venv/bin/activate && pip install sounddevice numpy pyperclip")
    sys.exit(1)


def record_audio(sample_rate: int = 16000) -> np.ndarray:
    """Record audio until user presses Enter."""
    print("\n🎤 Recording... Press ENTER to stop.\n")
    
    recording = []
    
    def callback(indata, frames, time, status):
        if status:
            print(f"Status: {status}", file=sys.stderr)
        recording.append(indata.copy())
    
    with sd.InputStream(samplerate=sample_rate, channels=1, dtype='float32', callback=callback):
        input()  # Wait for Enter
    
    if not recording:
        return np.array([])
    
    return np.concatenate(recording, axis=0)


def save_wav(audio: np.ndarray, path: str, sample_rate: int = 16000):
    """Save audio as WAV file."""
    import wave
    
    # Convert float32 to int16
    audio_int16 = (audio * 32767).astype(np.int16)
    
    with wave.open(path, 'wb') as wf:
        wf.setnchannels(1)
        wf.setsampwidth(2)  # 16-bit
        wf.setframerate(sample_rate)
        wf.writeframes(audio_int16.tobytes())


def transcribe_whisper(audio_path: str, language: str = None, model: str = "small") -> str:
    """Transcribe audio using Whisper CLI."""
    
    # Build command
    cmd = [
        "whisper",
        audio_path,
        "--model", model,
        "--output_format", "txt",
        "--output_dir", os.path.dirname(audio_path) or ".",
    ]
    
    if language:
        cmd.extend(["--language", language])
    
    print(f"🔄 Transcribing with Whisper ({model})...")
    
    result = subprocess.run(cmd, capture_output=True, text=True)
    
    if result.returncode != 0:
        print(f"Whisper error: {result.stderr}", file=sys.stderr)
        return ""
    
    # Read output file
    txt_path = Path(audio_path).with_suffix('.txt')
    if txt_path.exists():
        text = txt_path.read_text().strip()
        txt_path.unlink()  # Clean up
        return text
    
    return ""


def main():
    parser = argparse.ArgumentParser(description="Voice-to-Text with Whisper")
    parser.add_argument("--file", "-f", help="Transcribe existing audio file")
    parser.add_argument("--lang", "-l", help="Language code (e.g., en, it, es)")
    parser.add_argument("--model", "-m", default="small", 
                       choices=["tiny", "base", "small", "medium", "large"],
                       help="Whisper model size (default: small)")
    parser.add_argument("--no-clipboard", "-n", action="store_true",
                       help="Don't copy to clipboard")
    
    args = parser.parse_args()
    
    if args.file:
        # Transcribe existing file
        audio_path = args.file
        if not os.path.exists(audio_path):
            print(f"File not found: {audio_path}", file=sys.stderr)
            sys.exit(1)
    else:
        # Record new audio
        audio = record_audio()
        
        if len(audio) == 0:
            print("No audio recorded!", file=sys.stderr)
            sys.exit(1)
        
        duration = len(audio) / 16000
        print(f"✓ Recorded {duration:.1f}s of audio")
        
        # Save to temp file
        with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as f:
            audio_path = f.name
        
        save_wav(audio, audio_path)
    
    # Transcribe
    text = transcribe_whisper(audio_path, args.lang, args.model)
    
    # Clean up temp file
    if not args.file and os.path.exists(audio_path):
        os.unlink(audio_path)
    
    if text:
        print(f"\n📝 Transcription:\n{'-'*40}")
        print(text)
        print(f"{'-'*40}")
        
        if not args.no_clipboard:
            pyperclip.copy(text)
            print("✓ Copied to clipboard!")
    else:
        print("No transcription generated.", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
