#!/usr/bin/env python3
"""
SE-Bot: Real-Time Streaming Whisper Transcription
Integrates with audio_capture.py to provide live meeting transcription.

Uses whisper-cpp (via whisper-stream or whisper-cli) for local transcription.
No API keys required - fully offline operation.

Usage:
    python realtime_transcription.py                     # Auto-detect device, start transcribing
    python realtime_transcription.py --device "BlackHole" # Use specific audio device
    python realtime_transcription.py --model small       # Use different model size
    python realtime_transcription.py --language auto     # Auto-detect language
    python realtime_transcription.py --output transcript.txt  # Save to file
"""

import argparse
import sys
import time
import subprocess
import threading
import queue
import tempfile
import os
import json
import wave
from pathlib import Path
from typing import Optional, Callable, List, Dict, Any
from dataclasses import dataclass, field
from datetime import datetime
import numpy as np

from audio_capture import AudioCapture, SAMPLE_RATE, list_devices

# Model paths - check common locations
MODEL_PATHS = [
    Path.home() / ".cache/whisper-cpp",
    Path("/opt/homebrew/share/whisper-cpp"),
    Path("/usr/local/share/whisper-cpp"),
    Path("models"),
]

# Model sizes (download from https://huggingface.co/ggerganov/whisper.cpp)
MODEL_SIZES = {
    "tiny": "ggml-tiny.bin",
    "tiny.en": "ggml-tiny.en.bin",
    "base": "ggml-base.bin",
    "base.en": "ggml-base.en.bin",
    "small": "ggml-small.bin",
    "small.en": "ggml-small.en.bin",
    "medium": "ggml-medium.bin",
    "medium.en": "ggml-medium.en.bin",
    "large": "ggml-large.bin",
}

# Default settings
DEFAULT_MODEL = "base"
DEFAULT_LANGUAGE = "en"
CHUNK_DURATION = 5.0  # seconds per chunk for whisper-cli
VAD_THRESHOLD = 0.6   # Voice activity detection threshold


@dataclass
class TranscriptSegment:
    """A single transcription segment."""
    text: str
    start_time: float
    end_time: float
    language: str = ""
    confidence: float = 1.0


@dataclass
class TranscriptionContext:
    """Maintains context across transcription chunks."""
    segments: List[TranscriptSegment] = field(default_factory=list)
    full_text: str = ""
    start_timestamp: float = 0.0
    detected_language: str = ""
    
    def add_segment(self, segment: TranscriptSegment):
        self.segments.append(segment)
        if segment.text.strip():
            self.full_text += " " + segment.text.strip()
            self.full_text = self.full_text.strip()
    
    def get_recent_text(self, seconds: float = 120.0) -> str:
        """Get text from the last N seconds."""
        if not self.segments:
            return ""
        
        cutoff = self.segments[-1].end_time - seconds
        recent = [s.text for s in self.segments if s.start_time >= cutoff]
        return " ".join(recent).strip()


class RealtimeTranscriber:
    """Real-time streaming transcription using Whisper."""
    
    def __init__(
        self,
        model: str = DEFAULT_MODEL,
        language: str = DEFAULT_LANGUAGE,
        device: Optional[str | int] = None,
        callback: Optional[Callable[[TranscriptSegment], None]] = None,
        use_stream: bool = True  # Use whisper-stream if available
    ):
        self.model_path = self._find_model(model)
        self.language = language
        self.device = device
        self.callback = callback
        self.use_stream = use_stream
        
        self._capture: Optional[AudioCapture] = None
        self._running = False
        self._context = TranscriptionContext()
        self._transcript_queue = queue.Queue()
        self._thread: Optional[threading.Thread] = None
        
        # Check for whisper-cpp binaries
        self._whisper_cli = self._find_binary("whisper-cli")
        self._whisper_stream = self._find_binary("whisper-stream")
        
        if not self._whisper_cli:
            raise RuntimeError(
                "whisper-cpp not found. Install with: brew install whisper-cpp"
            )
    
    def _find_binary(self, name: str) -> Optional[str]:
        """Find a binary in PATH."""
        result = subprocess.run(
            ["which", name], 
            capture_output=True, 
            text=True
        )
        if result.returncode == 0:
            return result.stdout.strip()
        return None
    
    def _find_model(self, model: str) -> Path:
        """Find model file."""
        # If it's a path, use directly
        if "/" in model or model.endswith(".bin"):
            p = Path(model)
            if p.exists():
                return p
            raise FileNotFoundError(f"Model not found: {model}")
        
        # Look up by size name
        filename = MODEL_SIZES.get(model, f"ggml-{model}.bin")
        
        for base in MODEL_PATHS:
            p = base / filename
            if p.exists():
                return p
        
        # Check if any model exists
        for base in MODEL_PATHS:
            if base.exists():
                models = list(base.glob("ggml-*.bin"))
                if models:
                    print(f"⚠️ Model '{model}' not found. Using: {models[0].name}", 
                          file=sys.stderr)
                    return models[0]
        
        raise FileNotFoundError(
            f"Model '{model}' not found.\n"
            f"Download from: https://huggingface.co/ggerganov/whisper.cpp/tree/main\n"
            f"Place in: {MODEL_PATHS[0]}"
        )
    
    def start(self):
        """Start real-time transcription."""
        if self._running:
            return
        
        print(f"🎙️ Starting transcription with model: {self.model_path.name}", 
              file=sys.stderr)
        
        self._context = TranscriptionContext()
        self._context.start_timestamp = time.time()
        self._running = True
        
        if self.use_stream and self._whisper_stream:
            self._start_stream_mode()
        else:
            self._start_chunk_mode()
    
    def _start_stream_mode(self):
        """Use whisper-stream for real-time processing."""
        print("📡 Using whisper-stream (real-time mode)", file=sys.stderr)
        
        cmd = [
            self._whisper_stream,
            "--model", str(self.model_path),
            "--language", self.language if self.language != "auto" else "en",
            "--threads", "4",
            "--step", "3000",      # 3s steps
            "--length", "10000",   # 10s context
            "--keep", "200",       # 200ms overlap
            "--vad-thold", str(VAD_THRESHOLD),
        ]
        
        # Add capture device if specified
        if self.device is not None:
            cmd.extend(["--capture", str(self.device)])
        
        def stream_reader():
            try:
                proc = subprocess.Popen(
                    cmd,
                    stdout=subprocess.PIPE,
                    stderr=subprocess.PIPE,
                    text=True,
                    bufsize=1
                )
                
                start_time = time.time()
                
                for line in proc.stdout:
                    if not self._running:
                        break
                    
                    text = line.strip()
                    if text and not text.startswith("["):
                        segment = TranscriptSegment(
                            text=text,
                            start_time=time.time() - start_time,
                            end_time=time.time() - start_time,
                            language=self.language
                        )
                        self._context.add_segment(segment)
                        self._transcript_queue.put(segment)
                        
                        if self.callback:
                            self.callback(segment)
                
                proc.terminate()
            
            except Exception as e:
                print(f"❌ Stream error: {e}", file=sys.stderr)
        
        self._thread = threading.Thread(target=stream_reader, daemon=True)
        self._thread.start()
    
    def _start_chunk_mode(self):
        """Use whisper-cli with audio chunks."""
        print("📝 Using whisper-cli (chunk mode)", file=sys.stderr)
        
        # Initialize audio capture
        self._capture = AudioCapture(device=self.device)
        
        def chunk_processor():
            self._capture.start()
            
            chunk_samples = int(CHUNK_DURATION * SAMPLE_RATE)
            audio_buffer = np.array([], dtype=np.float32)
            
            try:
                while self._running:
                    chunk = self._capture.get_chunk(timeout=0.5)
                    if chunk is None:
                        continue
                    
                    audio_buffer = np.concatenate([audio_buffer, chunk])
                    
                    # Process when we have enough audio
                    if len(audio_buffer) >= chunk_samples:
                        # Check for voice activity (simple energy-based VAD)
                        rms = np.sqrt(np.mean(audio_buffer ** 2))
                        
                        if rms > 0.01:  # Threshold for "has audio"
                            segment = self._transcribe_chunk(audio_buffer[:chunk_samples])
                            if segment and segment.text.strip():
                                self._context.add_segment(segment)
                                self._transcript_queue.put(segment)
                                
                                if self.callback:
                                    self.callback(segment)
                        
                        # Keep overlap for continuity
                        overlap = int(0.5 * SAMPLE_RATE)
                        audio_buffer = audio_buffer[-overlap:]
            
            finally:
                self._capture.stop()
        
        self._thread = threading.Thread(target=chunk_processor, daemon=True)
        self._thread.start()
    
    def _transcribe_chunk(self, audio: np.ndarray) -> Optional[TranscriptSegment]:
        """Transcribe an audio chunk using whisper-cli."""
        # Write to temp WAV file
        with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as f:
            temp_path = f.name
            
            with wave.open(temp_path, 'wb') as wf:
                wf.setnchannels(1)
                wf.setsampwidth(2)
                wf.setframerate(SAMPLE_RATE)
                audio_int16 = (audio * 32767).astype(np.int16)
                wf.writeframes(audio_int16.tobytes())
        
        try:
            start_time = time.time()
            
            cmd = [
                self._whisper_cli,
                "--model", str(self.model_path),
                "--language", self.language if self.language != "auto" else "en",
                "--threads", "4",
                "--no-timestamps",
                "--output-txt",
                "--file", temp_path
            ]
            
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                timeout=30
            )
            
            # Read output
            txt_path = temp_path + ".txt"
            if os.path.exists(txt_path):
                with open(txt_path) as f:
                    text = f.read().strip()
                os.unlink(txt_path)
                
                if text:
                    return TranscriptSegment(
                        text=text,
                        start_time=self._context.segments[-1].end_time if self._context.segments else 0,
                        end_time=time.time() - self._context.start_timestamp,
                        language=self.language
                    )
        
        except subprocess.TimeoutExpired:
            print("⚠️ Transcription timeout", file=sys.stderr)
        
        except Exception as e:
            print(f"❌ Transcription error: {e}", file=sys.stderr)
        
        finally:
            if os.path.exists(temp_path):
                os.unlink(temp_path)
        
        return None
    
    def stop(self):
        """Stop transcription."""
        self._running = False
        
        if self._capture:
            self._capture.stop()
        
        if self._thread:
            self._thread.join(timeout=2.0)
    
    def get_segment(self, timeout: float = 1.0) -> Optional[TranscriptSegment]:
        """Get next transcript segment."""
        try:
            return self._transcript_queue.get(timeout=timeout)
        except queue.Empty:
            return None
    
    def get_full_transcript(self) -> str:
        """Get complete transcript so far."""
        return self._context.full_text
    
    def get_recent_context(self, seconds: float = 120.0) -> str:
        """Get transcript from last N seconds."""
        return self._context.get_recent_text(seconds)
    
    @property
    def is_running(self) -> bool:
        return self._running


def download_model(model: str = "base") -> Path:
    """Download a Whisper model if not present."""
    filename = MODEL_SIZES.get(model, f"ggml-{model}.bin")
    dest = MODEL_PATHS[0] / filename
    
    if dest.exists():
        print(f"✅ Model already exists: {dest}")
        return dest
    
    # Create directory
    dest.parent.mkdir(parents=True, exist_ok=True)
    
    url = f"https://huggingface.co/ggerganov/whisper.cpp/resolve/main/{filename}"
    print(f"📥 Downloading {model} model...")
    print(f"   From: {url}")
    print(f"   To: {dest}")
    
    try:
        import urllib.request
        urllib.request.urlretrieve(url, dest, reporthook=lambda b, bs, ts: 
            print(f"\r   Progress: {b * bs / 1024 / 1024:.1f} MB", end="", flush=True))
        print(f"\n✅ Downloaded: {dest}")
        return dest
    except Exception as e:
        print(f"\n❌ Download failed: {e}")
        print(f"   Manual download: {url}")
        raise


def main():
    parser = argparse.ArgumentParser(
        description="SE-Bot: Real-Time Streaming Whisper Transcription",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  %(prog)s                           Start transcribing (auto-detect device)
  %(prog)s --device "BlackHole"      Use specific audio device
  %(prog)s --model small             Use small model (more accurate)
  %(prog)s --language auto           Auto-detect language
  %(prog)s --output transcript.txt   Save transcript to file
  %(prog)s --download-model base     Download a model

Models (accuracy/speed tradeoff):
  tiny    - Fastest, least accurate (~1GB VRAM)
  base    - Good balance (default)
  small   - Better accuracy, slower
  medium  - High accuracy, slow
  large   - Best accuracy, very slow (~10GB VRAM)

Add ".en" suffix for English-only models (faster for English).
        """
    )
    
    parser.add_argument('--device', '-d', type=str,
                       help='Audio device index or name')
    parser.add_argument('--model', '-m', type=str, default=DEFAULT_MODEL,
                       help=f'Model size or path (default: {DEFAULT_MODEL})')
    parser.add_argument('--language', '-l', type=str, default=DEFAULT_LANGUAGE,
                       help=f'Language code or "auto" (default: {DEFAULT_LANGUAGE})')
    parser.add_argument('--output', '-o', type=str,
                       help='Output file for transcript')
    parser.add_argument('--no-stream', action='store_true',
                       help='Use chunk mode instead of whisper-stream')
    parser.add_argument('--list-devices', action='store_true',
                       help='List available audio devices')
    parser.add_argument('--download-model', type=str, metavar='SIZE',
                       help='Download a model (tiny/base/small/medium/large)')
    parser.add_argument('--json', action='store_true',
                       help='Output as JSON lines')
    
    args = parser.parse_args()
    
    if args.list_devices:
        list_devices()
        return 0
    
    if args.download_model:
        try:
            download_model(args.download_model)
            return 0
        except Exception:
            return 1
    
    # Output file
    output_file = None
    if args.output:
        output_file = open(args.output, 'w')
    
    # Resolve device
    device = None
    if args.device:
        try:
            device = int(args.device)
        except ValueError:
            device = args.device
    
    def on_segment(segment: TranscriptSegment):
        """Called for each new transcript segment."""
        timestamp = time.strftime("%H:%M:%S")
        
        if args.json:
            data = {
                "timestamp": timestamp,
                "text": segment.text,
                "start": segment.start_time,
                "end": segment.end_time,
                "language": segment.language
            }
            line = json.dumps(data)
            print(line)
            if output_file:
                output_file.write(line + "\n")
                output_file.flush()
        else:
            line = f"[{timestamp}] {segment.text}"
            print(line)
            if output_file:
                output_file.write(line + "\n")
                output_file.flush()
    
    try:
        transcriber = RealtimeTranscriber(
            model=args.model,
            language=args.language,
            device=device,
            callback=on_segment,
            use_stream=not args.no_stream
        )
    except FileNotFoundError as e:
        print(f"❌ {e}", file=sys.stderr)
        return 1
    except RuntimeError as e:
        print(f"❌ {e}", file=sys.stderr)
        return 1
    
    print("\n" + "=" * 60, file=sys.stderr)
    print("🎤 SE-Bot Real-Time Transcription", file=sys.stderr)
    print("=" * 60, file=sys.stderr)
    print(f"Model: {args.model}", file=sys.stderr)
    print(f"Language: {args.language}", file=sys.stderr)
    print(f"Press Ctrl+C to stop", file=sys.stderr)
    print("=" * 60 + "\n", file=sys.stderr)
    
    try:
        transcriber.start()
        
        while transcriber.is_running:
            time.sleep(0.1)
    
    except KeyboardInterrupt:
        print("\n\n⏹️ Stopping...", file=sys.stderr)
    
    finally:
        transcriber.stop()
        
        if output_file:
            output_file.close()
            print(f"\n📝 Transcript saved to: {args.output}", file=sys.stderr)
        
        # Print summary
        transcript = transcriber.get_full_transcript()
        if transcript:
            word_count = len(transcript.split())
            print(f"\n📊 Summary: {word_count} words transcribed", file=sys.stderr)
    
    return 0


if __name__ == '__main__':
    sys.exit(main())
