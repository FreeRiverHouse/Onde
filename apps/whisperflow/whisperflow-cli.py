#!/usr/bin/env python3
"""
WhisperFlow CLI - Real-time local transcription prototype
Uses whisper.cpp for fast on-device transcription

Usage:
  python3 whisperflow-cli.py              # Start live transcription
  python3 whisperflow-cli.py --file audio.wav  # Transcribe file
  python3 whisperflow-cli.py --benchmark  # Run speed benchmark
"""

import argparse
import subprocess
import tempfile
import time
import os
import sys
from pathlib import Path

# Configuration
WHISPER_CLI = "whisper-cli"  # whisper-cpp CLI command
WHISPER_STREAM = "whisper-stream"  # whisper-cpp streaming command
MODEL_PATH = Path.home() / ".whisper-cpp" / "models" / "ggml-base.bin"
SAMPLE_RATE = 16000

def check_dependencies():
    """Check if whisper-cpp is installed"""
    try:
        result = subprocess.run([WHISPER_CLI, "--help"], 
                              capture_output=True, timeout=5)
        return True
    except FileNotFoundError:
        print("❌ whisper-cpp not found. Install with: brew install whisper-cpp")
        return False
    except Exception as e:
        print(f"❌ Error checking whisper-cpp: {e}")
        return False

def check_model():
    """Check if model exists"""
    if not MODEL_PATH.exists():
        print(f"❌ Model not found at {MODEL_PATH}")
        print("Download with:")
        print(f'  curl -L -o "{MODEL_PATH}" "https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-base.bin"')
        return False
    return True

def transcribe_file(audio_file: str, language: str = "auto") -> str:
    """Transcribe an audio file using whisper.cpp"""
    
    # Convert to WAV if needed
    wav_file = audio_file
    temp_wav = None
    
    if not audio_file.lower().endswith('.wav'):
        temp_wav = tempfile.NamedTemporaryFile(suffix='.wav', delete=False)
        wav_file = temp_wav.name
        
        # Convert with ffmpeg
        result = subprocess.run([
            'ffmpeg', '-y', '-i', audio_file,
            '-ar', str(SAMPLE_RATE), '-ac', '1',
            wav_file
        ], capture_output=True)
        
        if result.returncode != 0:
            print(f"❌ Failed to convert audio: {result.stderr.decode()}")
            return ""
    
    # Build whisper-cpp command
    cmd = [
        WHISPER_CLI,
        '-m', str(MODEL_PATH),
        '-f', wav_file,
        '--no-timestamps',  # Cleaner output
        '-t', '4',  # Threads
    ]
    
    if language != "auto":
        cmd.extend(['-l', language])
    
    start = time.time()
    result = subprocess.run(cmd, capture_output=True, text=True)
    elapsed = time.time() - start
    
    # Cleanup temp file
    if temp_wav:
        os.unlink(wav_file)
    
    if result.returncode != 0:
        print(f"❌ Transcription failed: {result.stderr}")
        return ""
    
    # Parse output (whisper-cpp outputs to stderr, text to stdout)
    text = result.stdout.strip()
    
    # Remove whisper-cpp header lines
    lines = text.split('\n')
    clean_lines = [l for l in lines if l and not l.startswith('[') and not l.startswith('whisper_')]
    text = ' '.join(clean_lines).strip()
    
    print(f"⏱️  Transcribed in {elapsed:.2f}s")
    return text

def run_benchmark():
    """Benchmark transcription speed"""
    print("🏃 Running benchmark...")
    print(f"📦 Model: {MODEL_PATH}")
    print(f"💻 Threads: 4")
    
    # Create a test audio file (silence with some speech simulation)
    with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as f:
        test_file = f.name
    
    # Generate 10 seconds of audio
    subprocess.run([
        'ffmpeg', '-y', '-f', 'lavfi',
        '-i', 'anoisesrc=duration=10:sample_rate=16000:color=pink',
        test_file
    ], capture_output=True)
    
    # Benchmark
    times = []
    for i in range(3):
        start = time.time()
        subprocess.run([
            WHISPER_CLI, '-m', str(MODEL_PATH),
            '-f', test_file, '-t', '4'
        ], capture_output=True)
        elapsed = time.time() - start
        times.append(elapsed)
        print(f"  Run {i+1}: {elapsed:.2f}s")
    
    avg = sum(times) / len(times)
    rtf = avg / 10  # Real-time factor (10s audio)
    
    print(f"\n📊 Results:")
    print(f"  Average: {avg:.2f}s for 10s audio")
    print(f"  RTF: {rtf:.2f}x (< 1.0 = faster than real-time)")
    
    os.unlink(test_file)

def start_stream():
    """Start streaming transcription (requires microphone)"""
    print("🎤 Starting streaming transcription...")
    print("   Press Ctrl+C to stop")
    print()
    
    # Check if stream command exists
    try:
        # whisper-cpp stream mode
        cmd = [
            WHISPER_STREAM,
            '-m', str(MODEL_PATH),
            '-t', '4',
            '-c', '0',  # Capture device 0
        ]
        
        # Run interactively
        subprocess.run(cmd)
        
    except KeyboardInterrupt:
        print("\n👋 Stopped")

def main():
    parser = argparse.ArgumentParser(description="WhisperFlow CLI")
    parser.add_argument('--file', '-f', help='Audio file to transcribe')
    parser.add_argument('--language', '-l', default='auto', help='Language (auto, en, it, etc)')
    parser.add_argument('--benchmark', '-b', action='store_true', help='Run speed benchmark')
    parser.add_argument('--stream', '-s', action='store_true', help='Start streaming mode')
    
    args = parser.parse_args()
    
    # Check dependencies
    if not check_dependencies() or not check_model():
        sys.exit(1)
    
    if args.benchmark:
        run_benchmark()
    elif args.file:
        text = transcribe_file(args.file, args.language)
        if text:
            print(f"\n📝 Transcription:\n{text}")
    elif args.stream:
        start_stream()
    else:
        # Default: stream mode
        start_stream()

if __name__ == "__main__":
    main()
