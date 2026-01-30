#!/usr/bin/env python3
"""
SE-Bot Main Integration

Orchestrates all SE-Bot components:
- Audio capture (BlackHole system audio)
- Real-time Whisper transcription
- Context analysis with RAG
- macOS overlay UI

Usage:
    python se_bot_main.py                # Start full system
    python se_bot_main.py --no-overlay   # Headless mode (CLI output)
    python se_bot_main.py --demo         # Demo mode with simulated meeting
    python se_bot_main.py --status       # Check system status
"""

import sys
import os
import time
import threading
import queue
import argparse
from pathlib import Path
from datetime import datetime

# Add current directory to path
sys.path.insert(0, str(Path(__file__).parent))

try:
    from audio_capture import AudioCapture
    from realtime_transcription import RealtimeTranscriber, find_whisper_executable
    from context_analyzer import ContextAnalyzer
except ImportError as e:
    print(f"Error importing modules: {e}")
    print("Make sure all dependencies are installed.")
    sys.exit(1)


class SEBot:
    """Main SE-Bot controller that orchestrates all components."""
    
    def __init__(self, use_overlay=True, position="right"):
        self.use_overlay = use_overlay
        self.position = position
        
        # Components
        self.audio = None
        self.transcriber = None
        self.analyzer = None
        self.overlay = None
        
        # State
        self.is_running = False
        self.transcript_buffer = ""
        self.last_analysis_time = 0
        self.analysis_interval = 5.0  # Seconds between analyses
        
        # Queues for thread communication
        self.transcript_queue = queue.Queue()
        self.suggestion_queue = queue.Queue()
        
        # Stats
        self.stats = {
            "start_time": None,
            "total_words": 0,
            "suggestions_generated": 0,
            "suggestions_copied": 0,
        }
        
        # Voice output (optional)
        self.voice_output = None
        self.voice_enabled = False
    
    def check_status(self):
        """Check status of all components."""
        status = {
            "whisper": False,
            "blackhole": False,
            "knowledge_base": False,
            "claude_api": False,
            "elevenlabs_api": False,
        }
        
        # Check Whisper
        whisper_path = find_whisper_executable()
        status["whisper"] = whisper_path is not None
        
        # Check BlackHole
        try:
            from audio_capture import AudioCapture
            ac = AudioCapture()
            devices = ac.list_devices()
            status["blackhole"] = any("blackhole" in d.lower() for d in devices)
        except:
            pass
        
        # Check knowledge base
        kb_path = Path(__file__).parent / "chroma_db"
        status["knowledge_base"] = kb_path.exists()
        
        # Check Claude API
        status["claude_api"] = bool(os.environ.get("ANTHROPIC_API_KEY"))
        
        # Check ElevenLabs API (for voice output)
        status["elevenlabs_api"] = bool(os.environ.get("ELEVENLABS_API_KEY"))
        
        return status
    
    def print_status(self):
        """Print status of all components."""
        status = self.check_status()
        
        print("\n🤖 SE-Bot System Status")
        print("=" * 40)
        
        for component, available in status.items():
            icon = "✅" if available else "❌"
            name = component.replace("_", " ").title()
            print(f"  {icon} {name}")
        
        print()
        
        if not status["whisper"]:
            print("⚠️  Whisper not found. Install: brew install whisper-cpp")
        if not status["blackhole"]:
            print("⚠️  BlackHole not detected. Install: brew install blackhole-2ch")
        if not status["knowledge_base"]:
            print("⚠️  Knowledge base not built. Run: python build_embeddings.py")
        if not status["claude_api"]:
            print("⚠️  Claude API key not set. Export ANTHROPIC_API_KEY or use KB-only mode.")
        if not status["elevenlabs_api"]:
            print("💡 Voice output disabled. Set ELEVENLABS_API_KEY to enable.")
        
        all_ready = all(status.values())
        print()
        if all_ready:
            print("✅ All systems ready! Run: python se_bot_main.py")
        else:
            print("⚠️  Some components missing. SE-Bot may run in limited mode.")
        
        return all_ready
    
    def _init_components(self):
        """Initialize all components."""
        print("🔧 Initializing SE-Bot components...")
        
        # Audio capture
        try:
            self.audio = AudioCapture()
            print("  ✓ Audio capture ready")
        except Exception as e:
            print(f"  ⚠ Audio capture failed: {e}")
            self.audio = None
        
        # Transcriber (will use audio capture internally)
        try:
            self.transcriber = RealtimeTranscriber(model="base", language="auto")
            print("  ✓ Transcriber ready")
        except Exception as e:
            print(f"  ⚠ Transcriber failed: {e}")
            self.transcriber = None
        
        # Context analyzer
        try:
            self.analyzer = ContextAnalyzer()
            print("  ✓ Context analyzer ready")
        except Exception as e:
            print(f"  ⚠ Context analyzer failed: {e}")
            self.analyzer = None
        
        # Overlay UI (imported here to avoid PyObjC on headless systems)
        if self.use_overlay:
            try:
                from overlay_ui import SEBotOverlayApp
                self.overlay = SEBotOverlayApp(position=self.position)
                self.overlay.on_suggestion_copied = self._on_suggestion_copied
                print("  ✓ Overlay UI ready")
            except Exception as e:
                print(f"  ⚠ Overlay UI failed: {e}")
                self.use_overlay = False
                self.overlay = None
        
        # Voice output (optional - requires ElevenLabs API key)
        try:
            from voice_output import VoiceOutput
            self.voice_output = VoiceOutput()
            if self.voice_output.api_key:
                self.voice_enabled = True
                print("  ✓ Voice output ready (ElevenLabs)")
            else:
                print("  ⚠ Voice output: No API key (voice disabled)")
        except Exception as e:
            print(f"  ⚠ Voice output failed: {e}")
            self.voice_output = None
        
        print()
    
    def _on_transcript_update(self, text, is_final=False):
        """Called when new transcript text is available."""
        self.transcript_buffer += " " + text.strip()
        self.stats["total_words"] += len(text.split())
        
        # Update overlay transcript
        if self.overlay:
            self.overlay.update_transcript(self.transcript_buffer[-300:])
        else:
            # CLI mode
            print(f"\r📝 {text.strip()[:80]}", end="", flush=True)
        
        # Trigger analysis if enough time has passed
        now = time.time()
        if now - self.last_analysis_time > self.analysis_interval:
            self._analyze_context()
    
    def _analyze_context(self):
        """Analyze current transcript and generate suggestions."""
        if not self.analyzer or not self.transcript_buffer.strip():
            return
        
        self.last_analysis_time = time.time()
        
        # Get last ~500 words for analysis
        words = self.transcript_buffer.split()[-500:]
        context = " ".join(words)
        
        try:
            # Run analysis in background thread
            def analyze():
                result = self.analyzer.analyze(context)
                if result and result.get("suggestions"):
                    self.suggestion_queue.put(result["suggestions"])
                    self.stats["suggestions_generated"] += len(result["suggestions"])
            
            thread = threading.Thread(target=analyze, daemon=True)
            thread.start()
        except Exception as e:
            print(f"\n⚠ Analysis error: {e}")
    
    def _process_suggestions(self):
        """Process suggestion queue and update overlay."""
        while self.is_running:
            try:
                suggestions = self.suggestion_queue.get(timeout=0.5)
                if self.overlay:
                    self.overlay.update_suggestions(suggestions)
                else:
                    # CLI mode
                    print("\n\n🎯 Suggestions:")
                    for i, s in enumerate(suggestions[:3], 1):
                        text = s.get('text', str(s))[:100]
                        print(f"  [{i}] {text}...")
                    print()
            except queue.Empty:
                pass
    
    def _on_suggestion_copied(self, index, text):
        """Called when user copies a suggestion."""
        self.stats["suggestions_copied"] += 1
        print(f"✓ Copied suggestion {index + 1}")
    
    def start(self, demo_mode=False):
        """Start SE-Bot."""
        self._init_components()
        
        self.is_running = True
        self.stats["start_time"] = datetime.now()
        
        print("🚀 SE-Bot starting...")
        print("=" * 40)
        print("  Hotkey: Cmd+Shift+S to toggle overlay")
        print("  Keys 1/2/3 to copy suggestions")
        print("  Ctrl+C to stop")
        print("=" * 40)
        print()
        
        if demo_mode:
            self._run_demo()
            return
        
        # Start suggestion processor thread
        suggestion_thread = threading.Thread(target=self._process_suggestions, daemon=True)
        suggestion_thread.start()
        
        # Start transcription (will call _on_transcript_update)
        if self.transcriber:
            self.transcriber.on_transcript = self._on_transcript_update
            
            # Start transcription in background thread
            def run_transcription():
                try:
                    self.transcriber.start()
                except KeyboardInterrupt:
                    pass
            
            transcription_thread = threading.Thread(target=run_transcription, daemon=True)
            transcription_thread.start()
        
        # Run overlay on main thread (required for macOS)
        if self.overlay:
            try:
                # Initial suggestions
                self.overlay.update_suggestions([
                    {"text": "Waiting for meeting audio..."},
                    {"text": "Make sure BlackHole is capturing system audio"},
                    {"text": "Speak or play audio to see transcription"},
                ])
                self.overlay.start()  # Blocks
            except KeyboardInterrupt:
                pass
        else:
            # CLI mode - just wait
            try:
                while self.is_running:
                    time.sleep(1)
            except KeyboardInterrupt:
                pass
        
        self.stop()
    
    def _run_demo(self):
        """Run demo mode with simulated meeting."""
        demo_transcript = [
            "Hi everyone, thanks for joining today's call about our network security upgrade.",
            "So we're currently evaluating several SASE vendors including Palo Alto, Zscaler, and others.",
            "Our main concern is the complexity of managing multiple point solutions.",
            "We have about 200 branch offices and 5000 remote workers.",
            "Can you explain how your SD-WAN handles application prioritization?",
            "We're also worried about the learning curve for our IT team.",
            "Our current VPN solution is really slow and users are complaining.",
            "What kind of ROI can we expect from this investment?",
            "How does your solution handle compliance with HIPAA and PCI-DSS?",
            "That's interesting. What about integration with our existing Cisco infrastructure?",
        ]
        
        if self.overlay:
            # Start overlay in background
            overlay_thread = threading.Thread(target=self.overlay.start, daemon=True)
            overlay_thread.start()
            time.sleep(1)  # Let overlay initialize
        
        # Start suggestion processor
        suggestion_thread = threading.Thread(target=self._process_suggestions, daemon=True)
        suggestion_thread.start()
        
        print("🎭 Demo Mode - Simulating meeting transcript...\n")
        
        try:
            for i, line in enumerate(demo_transcript):
                if not self.is_running:
                    break
                
                print(f"📢 Speaker: {line}")
                self._on_transcript_update(line, is_final=True)
                
                # Wait and analyze
                time.sleep(3)
                
                if self.analyzer and i % 2 == 1:  # Every 2 lines
                    self._analyze_context()
                    time.sleep(2)  # Wait for analysis
                    
                    # Check for suggestions
                    try:
                        suggestions = self.suggestion_queue.get(timeout=0.5)
                        if self.overlay:
                            self.overlay.update_suggestions(suggestions)
                        else:
                            print("\n🎯 Suggestions:")
                            for j, s in enumerate(suggestions[:3], 1):
                                text = s.get('text', str(s))[:80]
                                print(f"  [{j}] {text}...")
                            print()
                    except queue.Empty:
                        pass
            
            print("\n✅ Demo complete!")
            if self.overlay:
                print("Press Cmd+Shift+S to toggle overlay, or Ctrl+C to exit.")
                while True:
                    time.sleep(1)
        except KeyboardInterrupt:
            pass
        
        self.stop()
    
    def stop(self):
        """Stop SE-Bot."""
        print("\n\n🛑 Stopping SE-Bot...")
        self.is_running = False
        
        if self.transcriber:
            self.transcriber.stop()
        if self.audio:
            self.audio.stop()
        if self.overlay:
            self.overlay.stop()
        
        # Print stats
        if self.stats["start_time"]:
            duration = datetime.now() - self.stats["start_time"]
            print(f"\n📊 Session Stats:")
            print(f"  Duration: {duration}")
            print(f"  Words transcribed: {self.stats['total_words']}")
            print(f"  Suggestions generated: {self.stats['suggestions_generated']}")
            print(f"  Suggestions copied: {self.stats['suggestions_copied']}")
        
        print("\n👋 SE-Bot stopped.")


def main():
    parser = argparse.ArgumentParser(description="SE-Bot - AI Meeting Copilot")
    parser.add_argument("--no-overlay", action="store_true", help="Run without overlay (CLI mode)")
    parser.add_argument("--demo", action="store_true", help="Run demo mode with simulated meeting")
    parser.add_argument("--status", action="store_true", help="Check system status")
    parser.add_argument("--position", choices=["left", "right", "center"], default="right",
                       help="Overlay position (default: right)")
    
    args = parser.parse_args()
    
    bot = SEBot(use_overlay=not args.no_overlay, position=args.position)
    
    if args.status:
        bot.print_status()
        return
    
    bot.start(demo_mode=args.demo)


if __name__ == "__main__":
    main()
