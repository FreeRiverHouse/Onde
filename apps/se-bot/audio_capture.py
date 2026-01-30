#!/usr/bin/env python3
"""
SE-Bot: macOS System Audio Capture
Captures system audio via BlackHole virtual audio driver for meeting transcription.

Requirements:
- BlackHole 2ch virtual audio driver (brew install blackhole-2ch - requires sudo)
- sounddevice, numpy

Usage:
    python audio_capture.py                    # List devices and start capture
    python audio_capture.py --device 3         # Use specific device by index
    python audio_capture.py --device "BlackHole 2ch"  # Use device by name
    python audio_capture.py --output test.wav  # Save to WAV file
    python audio_capture.py --stream           # Stream to stdout (for piping to Whisper)
"""

import argparse
import sys
import time
import threading
import queue
import wave
from pathlib import Path
from typing import Optional, Callable
import numpy as np
import sounddevice as sd

# Audio settings optimized for Whisper
SAMPLE_RATE = 16000  # Whisper expects 16kHz
CHANNELS = 1         # Mono for transcription
DTYPE = 'float32'    # Whisper uses float32
CHUNK_SIZE = 1024    # Samples per chunk
BUFFER_SECONDS = 30  # Rolling buffer size


class AudioCapture:
    """Real-time audio capture from system audio (via BlackHole)."""
    
    def __init__(
        self,
        device: Optional[int | str] = None,
        sample_rate: int = SAMPLE_RATE,
        channels: int = CHANNELS,
        callback: Optional[Callable[[np.ndarray], None]] = None
    ):
        self.sample_rate = sample_rate
        self.channels = channels
        self.callback = callback
        self.device = self._resolve_device(device)
        
        self._stream: Optional[sd.InputStream] = None
        self._buffer = queue.Queue()
        self._running = False
        self._thread: Optional[threading.Thread] = None
        
        # Rolling buffer for context
        self._rolling_buffer = np.array([], dtype=DTYPE)
        self._max_buffer_samples = sample_rate * BUFFER_SECONDS
    
    def _resolve_device(self, device: Optional[int | str]) -> int:
        """Resolve device name/index to device index."""
        if device is None:
            # Try to find BlackHole
            blackhole = self._find_blackhole()
            if blackhole is not None:
                return blackhole
            # Fall back to default input
            return sd.default.device[0]
        
        if isinstance(device, int):
            return device
        
        # Search by name
        devices = sd.query_devices()
        for i, d in enumerate(devices):
            if device.lower() in d['name'].lower():
                return i
        
        raise ValueError(f"Device '{device}' not found. Run with --list to see available devices.")
    
    def _find_blackhole(self) -> Optional[int]:
        """Find BlackHole virtual audio device."""
        devices = sd.query_devices()
        for i, d in enumerate(devices):
            if 'blackhole' in d['name'].lower() and d['max_input_channels'] > 0:
                return i
        return None
    
    def _audio_callback(self, indata: np.ndarray, frames: int, time_info, status):
        """Called for each audio chunk."""
        if status:
            print(f"Audio status: {status}", file=sys.stderr)
        
        # Convert to mono if needed
        if indata.shape[1] > 1:
            audio = indata.mean(axis=1).astype(DTYPE)
        else:
            audio = indata[:, 0].astype(DTYPE)
        
        # Add to buffer
        self._buffer.put(audio.copy())
        
        # Update rolling buffer
        self._rolling_buffer = np.concatenate([self._rolling_buffer, audio])
        if len(self._rolling_buffer) > self._max_buffer_samples:
            self._rolling_buffer = self._rolling_buffer[-self._max_buffer_samples:]
        
        # Call user callback if provided
        if self.callback:
            self.callback(audio)
    
    def start(self):
        """Start capturing audio."""
        if self._running:
            return
        
        device_info = sd.query_devices(self.device)
        print(f"Starting capture from: {device_info['name']}", file=sys.stderr)
        print(f"Sample rate: {self.sample_rate} Hz, Channels: {self.channels}", file=sys.stderr)
        
        # Check if device supports input
        if device_info['max_input_channels'] < 1:
            raise ValueError(f"Device '{device_info['name']}' has no input channels. "
                           "Make sure you've set up a Multi-Output Device in Audio MIDI Setup "
                           "that includes both your speakers and BlackHole.")
        
        self._stream = sd.InputStream(
            device=self.device,
            samplerate=self.sample_rate,
            channels=min(self.channels, device_info['max_input_channels']),
            dtype=DTYPE,
            blocksize=CHUNK_SIZE,
            callback=self._audio_callback
        )
        self._stream.start()
        self._running = True
    
    def stop(self):
        """Stop capturing audio."""
        if not self._running:
            return
        
        self._running = False
        if self._stream:
            self._stream.stop()
            self._stream.close()
            self._stream = None
    
    def get_chunk(self, timeout: float = 1.0) -> Optional[np.ndarray]:
        """Get next audio chunk from buffer."""
        try:
            return self._buffer.get(timeout=timeout)
        except queue.Empty:
            return None
    
    def get_rolling_buffer(self) -> np.ndarray:
        """Get current rolling buffer (last N seconds of audio)."""
        return self._rolling_buffer.copy()
    
    def get_buffer_seconds(self, seconds: float) -> np.ndarray:
        """Get last N seconds from rolling buffer."""
        samples = int(seconds * self.sample_rate)
        if len(self._rolling_buffer) < samples:
            return self._rolling_buffer.copy()
        return self._rolling_buffer[-samples:].copy()
    
    @property
    def is_running(self) -> bool:
        return self._running


def list_devices():
    """List all available audio devices."""
    devices = sd.query_devices()
    print("\n📢 Available Audio Devices:\n")
    
    blackhole_found = False
    for i, d in enumerate(devices):
        marker = ""
        if 'blackhole' in d['name'].lower():
            marker = " ⭐ (BlackHole)"
            blackhole_found = True
        elif d['max_input_channels'] > 0:
            marker = " 🎤"
        
        input_ch = d['max_input_channels']
        output_ch = d['max_output_channels']
        print(f"  [{i}] {d['name']}{marker}")
        print(f"      In: {input_ch} ch, Out: {output_ch} ch, Rate: {d['default_samplerate']:.0f} Hz")
    
    if not blackhole_found:
        print("\n⚠️  BlackHole not found! Install with:")
        print("   brew install blackhole-2ch")
        print("\n   After installing:")
        print("   1. Open 'Audio MIDI Setup' (Spotlight → Audio MIDI)")
        print("   2. Click '+' → 'Create Multi-Output Device'")
        print("   3. Check both your speakers AND BlackHole 2ch")
        print("   4. Right-click → 'Use This Device For Sound Output'")
        print("   5. This routes audio to both speakers AND BlackHole for capture")
    
    return devices


def save_to_wav(capture: AudioCapture, output_path: str, duration: Optional[float] = None):
    """Record audio and save to WAV file."""
    print(f"\n🎙️ Recording to {output_path}...")
    print("Press Ctrl+C to stop\n")
    
    all_audio = []
    start_time = time.time()
    
    try:
        capture.start()
        while True:
            chunk = capture.get_chunk()
            if chunk is not None:
                all_audio.append(chunk)
            
            elapsed = time.time() - start_time
            if duration and elapsed >= duration:
                break
            
            # Show progress
            sys.stderr.write(f"\r⏱️ Recording: {elapsed:.1f}s")
            sys.stderr.flush()
    
    except KeyboardInterrupt:
        print("\n\n⏹️ Stopped")
    
    finally:
        capture.stop()
    
    if all_audio:
        audio = np.concatenate(all_audio)
        
        # Save as WAV
        with wave.open(output_path, 'wb') as wf:
            wf.setnchannels(1)
            wf.setsampwidth(2)  # 16-bit
            wf.setframerate(capture.sample_rate)
            # Convert float32 to int16
            audio_int16 = (audio * 32767).astype(np.int16)
            wf.writeframes(audio_int16.tobytes())
        
        print(f"\n✅ Saved {len(audio) / capture.sample_rate:.1f}s to {output_path}")
    else:
        print("\n⚠️ No audio captured")


def stream_to_stdout(capture: AudioCapture):
    """Stream raw audio to stdout for piping to Whisper."""
    print("🎙️ Streaming audio to stdout...", file=sys.stderr)
    print("Pipe to whisper: python audio_capture.py --stream | whisper-cpp ...", file=sys.stderr)
    
    try:
        capture.start()
        while True:
            chunk = capture.get_chunk()
            if chunk is not None:
                # Output raw float32 samples
                sys.stdout.buffer.write(chunk.tobytes())
                sys.stdout.buffer.flush()
    
    except KeyboardInterrupt:
        pass
    
    finally:
        capture.stop()


def demo_capture(capture: AudioCapture, duration: float = 10.0):
    """Demo: capture and show audio levels."""
    print(f"\n🎙️ Demo capture for {duration}s - showing audio levels")
    print("Speak or play audio to see levels\n")
    
    start_time = time.time()
    
    def level_callback(audio: np.ndarray):
        rms = np.sqrt(np.mean(audio ** 2))
        db = 20 * np.log10(max(rms, 1e-10))
        bars = int(max(0, (db + 60) / 60 * 40))  # Scale -60dB to 0dB → 0 to 40 bars
        sys.stderr.write(f"\r[{'█' * bars}{' ' * (40 - bars)}] {db:+.1f} dB  ")
        sys.stderr.flush()
    
    capture.callback = level_callback
    
    try:
        capture.start()
        while time.time() - start_time < duration:
            time.sleep(0.1)
    
    except KeyboardInterrupt:
        pass
    
    finally:
        capture.stop()
        print("\n")


def main():
    parser = argparse.ArgumentParser(
        description="SE-Bot: macOS System Audio Capture",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  %(prog)s --list                    List available audio devices
  %(prog)s --demo                    Demo capture with audio level meter
  %(prog)s --output meeting.wav      Record to WAV file
  %(prog)s --stream                  Stream raw audio to stdout
  %(prog)s --device 3 --output x.wav Use specific device

Setup (requires sudo):
  brew install blackhole-2ch
  Then configure Multi-Output Device in Audio MIDI Setup.
        """
    )
    
    parser.add_argument('--list', '-l', action='store_true',
                       help='List available audio devices')
    parser.add_argument('--device', '-d', type=str,
                       help='Device index or name (default: BlackHole if found)')
    parser.add_argument('--output', '-o', type=str,
                       help='Output WAV file path')
    parser.add_argument('--duration', '-t', type=float,
                       help='Recording duration in seconds')
    parser.add_argument('--stream', '-s', action='store_true',
                       help='Stream raw audio to stdout')
    parser.add_argument('--demo', action='store_true',
                       help='Demo mode: show audio level meter')
    parser.add_argument('--sample-rate', '-r', type=int, default=SAMPLE_RATE,
                       help=f'Sample rate in Hz (default: {SAMPLE_RATE})')
    
    args = parser.parse_args()
    
    if args.list:
        list_devices()
        return 0
    
    # Resolve device
    try:
        device = int(args.device) if args.device and args.device.isdigit() else args.device
    except ValueError:
        device = args.device
    
    try:
        capture = AudioCapture(
            device=device,
            sample_rate=args.sample_rate
        )
    except ValueError as e:
        print(f"❌ Error: {e}", file=sys.stderr)
        print("Run with --list to see available devices", file=sys.stderr)
        return 1
    
    if args.demo:
        demo_capture(capture, duration=args.duration or 10.0)
    elif args.stream:
        stream_to_stdout(capture)
    elif args.output:
        save_to_wav(capture, args.output, duration=args.duration)
    else:
        # Default: list devices and demo
        list_devices()
        print("\n" + "=" * 60)
        demo_capture(capture, duration=5.0)
    
    return 0


if __name__ == '__main__':
    sys.exit(main())
