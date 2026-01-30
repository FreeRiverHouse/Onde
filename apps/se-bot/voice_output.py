#!/usr/bin/env python3
"""
SE-Bot Voice Output Module

Provides text-to-speech output using ElevenLabs API with configurable voices.
Can output to speakers or virtual microphone (BlackHole) for meeting injection.

Features:
- Multiple voice library support (premade + custom clones)
- Voice settings (stability, similarity, style)
- Audio streaming for low latency
- Virtual microphone output for meeting injection
- Local caching to reduce API calls
- Rate limiting protection

Usage:
    python voice_output.py --list-voices          # List available voices
    python voice_output.py --speak "Hello world"  # Speak text
    python voice_output.py --voice "Rachel"       # Use specific voice
    python voice_output.py --output blackhole     # Output to virtual mic
    python voice_output.py --test                 # Demo mode

Environment:
    ELEVENLABS_API_KEY: Your ElevenLabs API key
"""

import os
import sys
import io
import json
import time
import hashlib
import argparse
import threading
import queue
from pathlib import Path
from datetime import datetime
from typing import Optional, Dict, List, Any

try:
    import requests
except ImportError:
    print("Please install requests: pip install requests")
    sys.exit(1)

try:
    import sounddevice as sd
    import numpy as np
except ImportError:
    print("Please install sounddevice numpy: pip install sounddevice numpy")
    sys.exit(1)


# ElevenLabs API configuration
ELEVENLABS_API_URL = "https://api.elevenlabs.io/v1"
DEFAULT_VOICE_ID = "21m00Tcm4TlvDq8ikWAM"  # Rachel - professional, neutral
DEFAULT_MODEL_ID = "eleven_turbo_v2_5"  # Fast, good quality

# Cache directory for audio files
CACHE_DIR = Path(__file__).parent / "voice_cache"

# Voice settings presets
VOICE_PRESETS = {
    "professional": {
        "stability": 0.75,
        "similarity_boost": 0.75,
        "style": 0.0,
        "use_speaker_boost": True,
    },
    "expressive": {
        "stability": 0.35,
        "similarity_boost": 0.85,
        "style": 0.65,
        "use_speaker_boost": True,
    },
    "calm": {
        "stability": 0.85,
        "similarity_boost": 0.65,
        "style": 0.2,
        "use_speaker_boost": False,
    },
    "energetic": {
        "stability": 0.45,
        "similarity_boost": 0.80,
        "style": 0.80,
        "use_speaker_boost": True,
    },
}

# Popular premade voices for quick reference
POPULAR_VOICES = {
    "Rachel": "21m00Tcm4TlvDq8ikWAM",  # Young, professional American
    "Domi": "AZnzlk1XvdvUeBnXmlld",     # Strong, confident
    "Bella": "EXAVITQu4vr4xnSDxMaL",    # Soft, gentle
    "Antoni": "ErXwobaYiN019PkySvjV",   # Well-rounded, young male
    "Elli": "MF3mGyEYCl7XYWbV9V6O",     # Young, cheerful
    "Josh": "TxGEqnHWrfWFTfGW9XjX",     # Deep, authoritative
    "Arnold": "VR6AewLTigWG4xSOukaG",   # Strong, crisp
    "Adam": "pNInz6obpgDQGcFmaJgB",     # Deep, warm
    "Sam": "yoZ06aMxZJJ28mfd3POQ",      # Young, dynamic
}


class VoiceOutput:
    """Handles text-to-speech synthesis using ElevenLabs API."""
    
    def __init__(
        self,
        api_key: Optional[str] = None,
        voice_id: Optional[str] = None,
        model_id: str = DEFAULT_MODEL_ID,
        output_device: Optional[str] = None,
        cache_enabled: bool = True,
    ):
        self.api_key = api_key or os.environ.get("ELEVENLABS_API_KEY")
        if not self.api_key:
            print("⚠️  No ElevenLabs API key found. Set ELEVENLABS_API_KEY env var.")
        
        self.voice_id = voice_id or DEFAULT_VOICE_ID
        self.model_id = model_id
        self.output_device = output_device
        self.cache_enabled = cache_enabled
        
        # Voice settings
        self.voice_settings = VOICE_PRESETS["professional"].copy()
        
        # Audio playback state
        self.is_playing = False
        self.playback_thread = None
        self.audio_queue = queue.Queue()
        
        # Statistics
        self.stats = {
            "total_chars": 0,
            "api_calls": 0,
            "cache_hits": 0,
            "total_duration_ms": 0,
        }
        
        # Create cache directory
        if self.cache_enabled:
            CACHE_DIR.mkdir(parents=True, exist_ok=True)
    
    def get_headers(self) -> Dict[str, str]:
        """Get API request headers."""
        return {
            "Accept": "audio/mpeg",
            "Content-Type": "application/json",
            "xi-api-key": self.api_key,
        }
    
    def list_voices(self) -> List[Dict[str, Any]]:
        """Fetch available voices from ElevenLabs API."""
        if not self.api_key:
            print("❌ API key required to list voices")
            return []
        
        try:
            response = requests.get(
                f"{ELEVENLABS_API_URL}/voices",
                headers={"xi-api-key": self.api_key},
                timeout=10,
            )
            response.raise_for_status()
            data = response.json()
            return data.get("voices", [])
        except requests.RequestException as e:
            print(f"❌ Error fetching voices: {e}")
            return []
    
    def list_models(self) -> List[Dict[str, Any]]:
        """Fetch available TTS models from ElevenLabs API."""
        if not self.api_key:
            print("❌ API key required to list models")
            return []
        
        try:
            response = requests.get(
                f"{ELEVENLABS_API_URL}/models",
                headers={"xi-api-key": self.api_key},
                timeout=10,
            )
            response.raise_for_status()
            return response.json()
        except requests.RequestException as e:
            print(f"❌ Error fetching models: {e}")
            return []
    
    def set_voice(self, voice_name_or_id: str) -> bool:
        """Set the current voice by name or ID."""
        # Check if it's a known voice name
        if voice_name_or_id in POPULAR_VOICES:
            self.voice_id = POPULAR_VOICES[voice_name_or_id]
            print(f"✅ Voice set to: {voice_name_or_id}")
            return True
        
        # Check if it's a voice ID (alphanumeric, ~21 chars)
        if len(voice_name_or_id) > 15 and voice_name_or_id.isalnum():
            self.voice_id = voice_name_or_id
            print(f"✅ Voice ID set to: {voice_name_or_id}")
            return True
        
        # Try to find voice by name in API
        voices = self.list_voices()
        for voice in voices:
            if voice.get("name", "").lower() == voice_name_or_id.lower():
                self.voice_id = voice["voice_id"]
                print(f"✅ Voice set to: {voice['name']}")
                return True
        
        print(f"❌ Voice not found: {voice_name_or_id}")
        return False
    
    def set_preset(self, preset_name: str) -> bool:
        """Apply a voice settings preset."""
        if preset_name not in VOICE_PRESETS:
            print(f"❌ Unknown preset: {preset_name}")
            print(f"Available: {', '.join(VOICE_PRESETS.keys())}")
            return False
        
        self.voice_settings = VOICE_PRESETS[preset_name].copy()
        print(f"✅ Applied preset: {preset_name}")
        return True
    
    def _get_cache_key(self, text: str) -> str:
        """Generate cache key from text and settings."""
        settings_str = json.dumps({
            "voice_id": self.voice_id,
            "model_id": self.model_id,
            "settings": self.voice_settings,
        }, sort_keys=True)
        combined = f"{text}|{settings_str}"
        return hashlib.md5(combined.encode()).hexdigest()
    
    def _get_cached_audio(self, text: str) -> Optional[bytes]:
        """Check cache for existing audio."""
        if not self.cache_enabled:
            return None
        
        cache_key = self._get_cache_key(text)
        cache_file = CACHE_DIR / f"{cache_key}.mp3"
        
        if cache_file.exists():
            self.stats["cache_hits"] += 1
            return cache_file.read_bytes()
        return None
    
    def _cache_audio(self, text: str, audio_data: bytes):
        """Save audio to cache."""
        if not self.cache_enabled:
            return
        
        cache_key = self._get_cache_key(text)
        cache_file = CACHE_DIR / f"{cache_key}.mp3"
        cache_file.write_bytes(audio_data)
    
    def synthesize(self, text: str) -> Optional[bytes]:
        """Synthesize speech from text using ElevenLabs API."""
        if not text.strip():
            return None
        
        if not self.api_key:
            print("❌ No API key. Set ELEVENLABS_API_KEY environment variable.")
            return None
        
        # Check cache first
        cached = self._get_cached_audio(text)
        if cached:
            print("📦 Using cached audio")
            return cached
        
        # Prepare request
        url = f"{ELEVENLABS_API_URL}/text-to-speech/{self.voice_id}"
        
        payload = {
            "text": text,
            "model_id": self.model_id,
            "voice_settings": self.voice_settings,
        }
        
        start_time = time.time()
        
        try:
            response = requests.post(
                url,
                json=payload,
                headers=self.get_headers(),
                timeout=30,
            )
            response.raise_for_status()
            
            audio_data = response.content
            
            # Update stats
            elapsed_ms = int((time.time() - start_time) * 1000)
            self.stats["total_chars"] += len(text)
            self.stats["api_calls"] += 1
            self.stats["total_duration_ms"] += elapsed_ms
            
            # Cache the result
            self._cache_audio(text, audio_data)
            
            print(f"🎤 Synthesized {len(text)} chars in {elapsed_ms}ms")
            return audio_data
            
        except requests.exceptions.HTTPError as e:
            if e.response.status_code == 401:
                print("❌ Invalid API key")
            elif e.response.status_code == 429:
                print("⚠️  Rate limited. Please wait before trying again.")
            else:
                print(f"❌ HTTP error: {e}")
            return None
        except requests.RequestException as e:
            print(f"❌ Request error: {e}")
            return None
    
    def _find_output_device(self) -> Optional[int]:
        """Find output device index by name or pattern."""
        if self.output_device is None:
            return None
        
        devices = sd.query_devices()
        pattern = self.output_device.lower()
        
        for i, device in enumerate(devices):
            if pattern in device["name"].lower():
                if device["max_output_channels"] > 0:
                    return i
        
        return None
    
    def play_audio(self, audio_data: bytes, blocking: bool = True):
        """Play audio data through speakers or virtual microphone."""
        if not audio_data:
            return
        
        try:
            # Decode MP3 to PCM
            # Note: sounddevice doesn't support MP3 directly
            # We need to use pydub or ffmpeg for decoding
            import subprocess
            
            # Use ffmpeg to decode MP3 to raw PCM
            process = subprocess.Popen(
                [
                    "ffmpeg",
                    "-i", "pipe:0",
                    "-f", "f32le",
                    "-ar", "44100",
                    "-ac", "1",
                    "pipe:1",
                ],
                stdin=subprocess.PIPE,
                stdout=subprocess.PIPE,
                stderr=subprocess.DEVNULL,
            )
            pcm_data, _ = process.communicate(input=audio_data)
            
            if not pcm_data:
                print("❌ Failed to decode audio")
                return
            
            # Convert to numpy array
            audio_array = np.frombuffer(pcm_data, dtype=np.float32)
            
            # Find output device
            device_id = self._find_output_device()
            
            # Play audio
            if blocking:
                sd.play(audio_array, samplerate=44100, device=device_id)
                sd.wait()
            else:
                self.audio_queue.put(audio_array)
                if not self.is_playing:
                    self._start_playback_thread()
            
            print("🔊 Audio playback complete")
            
        except FileNotFoundError:
            print("❌ ffmpeg not found. Install with: brew install ffmpeg")
        except Exception as e:
            print(f"❌ Playback error: {e}")
    
    def _start_playback_thread(self):
        """Start background audio playback thread."""
        def playback_worker():
            self.is_playing = True
            while True:
                try:
                    audio_array = self.audio_queue.get(timeout=1.0)
                    device_id = self._find_output_device()
                    sd.play(audio_array, samplerate=44100, device=device_id)
                    sd.wait()
                    self.audio_queue.task_done()
                except queue.Empty:
                    if self.audio_queue.empty():
                        break
            self.is_playing = False
        
        self.playback_thread = threading.Thread(target=playback_worker, daemon=True)
        self.playback_thread.start()
    
    def speak(self, text: str, blocking: bool = True):
        """Synthesize and play speech from text."""
        audio_data = self.synthesize(text)
        if audio_data:
            self.play_audio(audio_data, blocking=blocking)
    
    def speak_streaming(self, text: str):
        """Stream text-to-speech with real-time playback (lower latency)."""
        if not self.api_key:
            print("❌ No API key for streaming")
            return
        
        url = f"{ELEVENLABS_API_URL}/text-to-speech/{self.voice_id}/stream"
        
        payload = {
            "text": text,
            "model_id": self.model_id,
            "voice_settings": self.voice_settings,
        }
        
        try:
            response = requests.post(
                url,
                json=payload,
                headers=self.get_headers(),
                stream=True,
                timeout=30,
            )
            response.raise_for_status()
            
            # Stream audio chunks to ffmpeg for decoding
            import subprocess
            
            process = subprocess.Popen(
                [
                    "ffmpeg",
                    "-i", "pipe:0",
                    "-f", "f32le",
                    "-ar", "44100",
                    "-ac", "1",
                    "pipe:1",
                ],
                stdin=subprocess.PIPE,
                stdout=subprocess.PIPE,
                stderr=subprocess.DEVNULL,
            )
            
            # Collect all chunks first (needed for ffmpeg)
            audio_buffer = io.BytesIO()
            for chunk in response.iter_content(chunk_size=1024):
                audio_buffer.write(chunk)
            
            pcm_data, _ = process.communicate(input=audio_buffer.getvalue())
            
            if pcm_data:
                audio_array = np.frombuffer(pcm_data, dtype=np.float32)
                device_id = self._find_output_device()
                sd.play(audio_array, samplerate=44100, device=device_id)
                sd.wait()
                print("🔊 Streaming playback complete")
            
        except Exception as e:
            print(f"❌ Streaming error: {e}")
    
    def get_subscription_info(self) -> Optional[Dict[str, Any]]:
        """Get ElevenLabs subscription/usage info."""
        if not self.api_key:
            return None
        
        try:
            response = requests.get(
                f"{ELEVENLABS_API_URL}/user/subscription",
                headers={"xi-api-key": self.api_key},
                timeout=10,
            )
            response.raise_for_status()
            return response.json()
        except Exception as e:
            print(f"❌ Error fetching subscription: {e}")
            return None
    
    def clone_voice(
        self,
        name: str,
        audio_files: List[str],
        description: str = "",
    ) -> Optional[str]:
        """Clone a voice from audio samples (requires paid plan)."""
        if not self.api_key:
            print("❌ API key required for voice cloning")
            return None
        
        if not audio_files:
            print("❌ At least one audio file required")
            return None
        
        url = f"{ELEVENLABS_API_URL}/voices/add"
        
        files = []
        for path in audio_files:
            if Path(path).exists():
                files.append(
                    ("files", (Path(path).name, open(path, "rb"), "audio/mpeg"))
                )
        
        if not files:
            print("❌ No valid audio files found")
            return None
        
        try:
            data = {"name": name, "description": description}
            headers = {"xi-api-key": self.api_key}
            
            response = requests.post(
                url,
                headers=headers,
                data=data,
                files=files,
                timeout=60,
            )
            response.raise_for_status()
            
            result = response.json()
            voice_id = result.get("voice_id")
            print(f"✅ Voice cloned! ID: {voice_id}")
            return voice_id
            
        except requests.exceptions.HTTPError as e:
            if e.response.status_code == 403:
                print("❌ Voice cloning requires a paid plan")
            else:
                print(f"❌ Error cloning voice: {e}")
            return None
        except Exception as e:
            print(f"❌ Clone error: {e}")
            return None
        finally:
            # Close file handles
            for _, (_, f, _) in files:
                f.close()
    
    def print_stats(self):
        """Print usage statistics."""
        print("\n📊 Voice Output Statistics:")
        print(f"   Total characters: {self.stats['total_chars']:,}")
        print(f"   API calls: {self.stats['api_calls']}")
        print(f"   Cache hits: {self.stats['cache_hits']}")
        if self.stats['api_calls'] > 0:
            avg_ms = self.stats['total_duration_ms'] // self.stats['api_calls']
            print(f"   Avg latency: {avg_ms}ms")


def print_voices_table(voices: List[Dict[str, Any]]):
    """Print voices in a nice table format."""
    if not voices:
        print("No voices found")
        return
    
    print("\n🎤 Available Voices:")
    print("-" * 70)
    print(f"{'Name':<20} {'Category':<15} {'Labels':<30}")
    print("-" * 70)
    
    for voice in sorted(voices, key=lambda v: v.get("name", "")):
        name = voice.get("name", "Unknown")[:19]
        category = voice.get("category", "")[:14]
        labels = voice.get("labels", {})
        labels_str = ", ".join(
            f"{k}:{v}" for k, v in list(labels.items())[:3]
        )[:29]
        print(f"{name:<20} {category:<15} {labels_str:<30}")
    
    print("-" * 70)
    print(f"Total: {len(voices)} voices")


def main():
    parser = argparse.ArgumentParser(description="SE-Bot Voice Output")
    parser.add_argument("--speak", type=str, help="Text to speak")
    parser.add_argument("--voice", type=str, help="Voice name or ID")
    parser.add_argument("--preset", type=str, choices=list(VOICE_PRESETS.keys()),
                       help="Voice settings preset")
    parser.add_argument("--list-voices", action="store_true", help="List available voices")
    parser.add_argument("--list-models", action="store_true", help="List available models")
    parser.add_argument("--output", type=str, help="Output device name (e.g., 'blackhole')")
    parser.add_argument("--stream", action="store_true", help="Use streaming mode")
    parser.add_argument("--test", action="store_true", help="Run demo mode")
    parser.add_argument("--subscription", action="store_true", help="Show subscription info")
    parser.add_argument("--no-cache", action="store_true", help="Disable audio caching")
    
    args = parser.parse_args()
    
    # Initialize voice output
    voice = VoiceOutput(
        output_device=args.output,
        cache_enabled=not args.no_cache,
    )
    
    # Set voice if specified
    if args.voice:
        voice.set_voice(args.voice)
    
    # Set preset if specified
    if args.preset:
        voice.set_preset(args.preset)
    
    # Handle commands
    if args.list_voices:
        voices = voice.list_voices()
        print_voices_table(voices)
        return
    
    if args.list_models:
        models = voice.list_models()
        print("\n🔧 Available Models:")
        for model in models:
            print(f"  - {model.get('model_id')}: {model.get('name')}")
        return
    
    if args.subscription:
        info = voice.get_subscription_info()
        if info:
            print("\n📊 Subscription Info:")
            print(f"   Characters used: {info.get('character_count', 0):,}")
            print(f"   Character limit: {info.get('character_limit', 0):,}")
            tier = info.get("tier", "unknown")
            print(f"   Plan: {tier}")
        return
    
    if args.speak:
        if args.stream:
            voice.speak_streaming(args.speak)
        else:
            voice.speak(args.speak)
        voice.print_stats()
        return
    
    if args.test:
        print("\n🧪 SE-Bot Voice Output Demo\n")
        
        # Check API key
        if not voice.api_key:
            print("⚠️  No API key found. Demo will use local fallback.\n")
            print("To use ElevenLabs, set the ELEVENLABS_API_KEY environment variable:")
            print("  export ELEVENLABS_API_KEY=your_api_key_here\n")
            
            # Try macOS built-in say command as fallback
            import subprocess
            test_text = "Hello! I am SE-Bot. This is a demo using macOS text to speech as a fallback."
            try:
                subprocess.run(["say", test_text], check=True)
                print("✅ Demo complete (using macOS TTS fallback)")
            except:
                print("❌ macOS 'say' command not available")
            return
        
        # Demo with ElevenLabs
        demo_text = (
            "Hello! I am SE-Bot, your AI sales engineering assistant. "
            "I can help you during customer meetings by providing real-time suggestions "
            "based on our knowledge base. This voice output feature allows me to speak "
            "my suggestions aloud or inject them directly into your meeting audio."
        )
        
        print("📝 Demo text:")
        print(f"   \"{demo_text[:60]}...\"\n")
        
        print("🎤 Speaking...")
        voice.speak(demo_text)
        voice.print_stats()
        
        print("\n✅ Demo complete!")
        return
    
    # Default: show help
    parser.print_help()


if __name__ == "__main__":
    main()
