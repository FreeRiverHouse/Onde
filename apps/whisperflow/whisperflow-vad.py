#!/usr/bin/env python3
"""
WhisperFlow VAD - Real-time voice-activated transcription

Uses:
- Silero VAD for voice activity detection
- whisper.cpp for fast local transcription

Usage:
  source venv/bin/activate
  python3 whisperflow-vad.py           # Start live transcription
  python3 whisperflow-vad.py --device  # List audio devices
"""

import argparse
import collections
import subprocess
import tempfile
import threading
import time
import os
import sys
import wave
from pathlib import Path
from typing import Optional

import numpy as np
import sounddevice as sd
import torch

# Configuration
WHISPER_CLI = "whisper-cli"
MODEL_PATH = Path.home() / ".whisper-cpp" / "models" / "ggml-base.bin"
SAMPLE_RATE = 16000
CHANNELS = 1
CHUNK_SIZE = 512  # Samples per chunk (32ms at 16kHz)

# VAD settings
VAD_THRESHOLD = 0.5  # Speech detection threshold (0-1)
SPEECH_PAD_MS = 300  # Padding around speech (ms)
MIN_SPEECH_MS = 250  # Minimum speech duration (ms)
MIN_SILENCE_MS = 500  # Silence duration to trigger transcription

class SileroVAD:
    """Voice Activity Detection using Silero VAD"""
    
    def __init__(self, threshold: float = VAD_THRESHOLD):
        self.threshold = threshold
        print("🔧 Loading Silero VAD model...")
        self.model, self.utils = torch.hub.load(
            repo_or_dir='snakers4/silero-vad',
            model='silero_vad',
            trust_repo=True
        )
        self.model.eval()
        # Reset state
        self.model.reset_states()
        print("✅ VAD ready")
    
    def is_speech(self, audio: np.ndarray) -> float:
        """Check if audio chunk contains speech. Returns confidence 0-1."""
        # Convert to torch tensor
        audio_tensor = torch.from_numpy(audio).float()
        # Get speech probability
        with torch.no_grad():
            speech_prob = self.model(audio_tensor, SAMPLE_RATE).item()
        return speech_prob
    
    def reset(self):
        """Reset VAD state (call between segments)"""
        self.model.reset_states()


class WhisperFlowVAD:
    """Real-time voice-activated transcription"""
    
    def __init__(self, language: str = "auto", device: Optional[int] = None):
        self.language = language
        self.device = device
        
        # Initialize VAD
        self.vad = SileroVAD()
        
        # Audio buffers
        self.audio_buffer = []  # Full recording buffer
        self.is_recording = False
        self.speech_started = False
        self.last_speech_time = 0
        
        # Threading
        self.running = False
        self.transcribe_thread = None
        
        # Stats
        self.transcription_count = 0
        
    def check_dependencies(self) -> bool:
        """Check if whisper.cpp and model exist"""
        try:
            subprocess.run([WHISPER_CLI, "--help"], capture_output=True, timeout=5)
        except FileNotFoundError:
            print("❌ whisper-cpp not found. Install with: brew install whisper-cpp")
            return False
        
        if not MODEL_PATH.exists():
            print(f"❌ Model not found at {MODEL_PATH}")
            return False
        
        return True
    
    def audio_callback(self, indata, frames, time_info, status):
        """Called for each audio chunk from microphone"""
        if status:
            print(f"⚠️ Audio status: {status}")
        
        # Convert to mono float32
        audio = indata[:, 0].astype(np.float32)
        
        # Check for speech
        speech_prob = self.vad.is_speech(audio)
        is_speech = speech_prob > self.vad.threshold
        
        current_time = time.time()
        
        if is_speech:
            if not self.speech_started:
                self.speech_started = True
                print(f"\r🎤 Speech detected... ", end="", flush=True)
            self.last_speech_time = current_time
            self.audio_buffer.append(audio.copy())
            
        elif self.speech_started:
            # Still add audio during padding
            self.audio_buffer.append(audio.copy())
            
            # Check if silence is long enough to trigger transcription
            silence_duration = (current_time - self.last_speech_time) * 1000
            if silence_duration > MIN_SILENCE_MS:
                # Trigger transcription
                self._process_speech()
    
    def _process_speech(self):
        """Process accumulated speech buffer"""
        if not self.audio_buffer:
            return
        
        # Calculate speech duration
        speech_duration_ms = len(self.audio_buffer) * CHUNK_SIZE / SAMPLE_RATE * 1000
        
        if speech_duration_ms < MIN_SPEECH_MS:
            print(f"\r⏩ Too short ({speech_duration_ms:.0f}ms), skipping", end="        \n")
            self._reset_buffers()
            return
        
        # Save audio to temp file
        audio_data = np.concatenate(self.audio_buffer)
        
        # Save to WAV
        with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as f:
            wav_path = f.name
            with wave.open(wav_path, 'wb') as wav:
                wav.setnchannels(1)
                wav.setsampwidth(2)  # 16-bit
                wav.setframerate(SAMPLE_RATE)
                # Convert float32 to int16
                audio_int16 = (audio_data * 32767).astype(np.int16)
                wav.writeframes(audio_int16.tobytes())
        
        # Transcribe
        self._transcribe(wav_path, speech_duration_ms)
        
        # Cleanup
        os.unlink(wav_path)
        self._reset_buffers()
    
    def _transcribe(self, wav_path: str, duration_ms: float):
        """Transcribe audio file with whisper.cpp"""
        cmd = [
            WHISPER_CLI,
            '-m', str(MODEL_PATH),
            '-f', wav_path,
            '--no-timestamps',
            '-t', '4',
            '--print-special',  # Print special tokens including language
        ]
        
        if self.language != "auto":
            cmd.extend(['-l', self.language])
        
        start = time.time()
        result = subprocess.run(cmd, capture_output=True, text=True)
        elapsed = time.time() - start
        
        if result.returncode != 0:
            print(f"\r❌ Transcription failed: {result.stderr[:100]}", end="\n")
            return
        
        # Parse output for detected language
        detected_lang = None
        output_text = result.stdout + result.stderr
        
        # whisper.cpp outputs: "whisper_full_with_state: auto-detected language: en (p = 0.98)"
        import re
        lang_match = re.search(r'auto-detected language:\s*(\w+)', output_text)
        if lang_match:
            detected_lang = lang_match.group(1)
        
        # Parse transcription text
        text = result.stdout.strip()
        lines = text.split('\n')
        clean_lines = [l for l in lines if l and not l.startswith('[') and not l.startswith('whisper_')]
        text = ' '.join(clean_lines).strip()
        
        # Remove any special tokens that might have been included
        text = re.sub(r'\[_[A-Z_]+_\]', '', text).strip()
        
        if text and text not in ["[BLANK_AUDIO]", "(music)", "(Music)"]:
            self.transcription_count += 1
            rtf = elapsed / (duration_ms / 1000)
            
            # Format output with detected language if available
            lang_indicator = f"[{detected_lang}] " if detected_lang and self.language == "auto" else ""
            print(f"\r📝 [{self.transcription_count}] ({duration_ms/1000:.1f}s → {elapsed:.2f}s, RTF {rtf:.2f}x): {lang_indicator}{text}")
            
            # Also print in a format the Swift app can parse
            if detected_lang:
                print(f"🌍 Detected: {detected_lang}")
        else:
            print(f"\r🔇 No speech detected in segment", end="      \n")
    
    def _reset_buffers(self):
        """Reset audio buffers for next segment"""
        self.audio_buffer = []
        self.speech_started = False
        self.vad.reset()
    
    def start(self):
        """Start real-time transcription"""
        if not self.check_dependencies():
            return
        
        print("\n" + "="*60)
        print("🎙️  WhisperFlow VAD - Real-time Voice Transcription")
        print("="*60)
        print(f"📦 Model: {MODEL_PATH.name}")
        print(f"🎚️  VAD threshold: {self.vad.threshold}")
        print(f"🌍 Language: {self.language}")
        print("   Press Ctrl+C to stop")
        print("="*60 + "\n")
        
        self.running = True
        
        try:
            with sd.InputStream(
                samplerate=SAMPLE_RATE,
                channels=CHANNELS,
                dtype='float32',
                blocksize=CHUNK_SIZE,
                device=self.device,
                callback=self.audio_callback
            ):
                print("🎤 Listening... (speak now)")
                while self.running:
                    time.sleep(0.1)
                    
        except KeyboardInterrupt:
            pass
        finally:
            self.running = False
            # Process any remaining audio
            if self.audio_buffer:
                self._process_speech()
        
        print(f"\n\n👋 Stopped. Total transcriptions: {self.transcription_count}")
    
    def stop(self):
        """Stop transcription"""
        self.running = False


def list_devices():
    """List available audio input devices"""
    print("\n🎤 Available audio input devices:\n")
    devices = sd.query_devices()
    for i, dev in enumerate(devices):
        if dev['max_input_channels'] > 0:
            default = " (default)" if i == sd.default.device[0] else ""
            print(f"  [{i}] {dev['name']}{default}")
            print(f"      Channels: {dev['max_input_channels']}, Rate: {dev['default_samplerate']}Hz")
    print()


def main():
    parser = argparse.ArgumentParser(description="WhisperFlow VAD - Voice-activated transcription")
    parser.add_argument('--language', '-l', default='auto', help='Language (auto, en, it, etc)')
    parser.add_argument('--device', '-d', type=int, help='Audio input device index')
    parser.add_argument('--list-devices', action='store_true', help='List audio devices')
    parser.add_argument('--threshold', '-t', type=float, default=VAD_THRESHOLD,
                        help=f'VAD threshold 0-1 (default: {VAD_THRESHOLD})')
    
    args = parser.parse_args()
    
    if args.list_devices:
        list_devices()
        return
    
    # Update threshold if specified
    global VAD_THRESHOLD
    VAD_THRESHOLD = args.threshold
    
    flow = WhisperFlowVAD(language=args.language, device=args.device)
    flow.start()


if __name__ == "__main__":
    main()
