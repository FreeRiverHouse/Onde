#!/usr/bin/env python3
"""
Trading Voice Alerts - Generate TTS announcements for significant trading events
Uses ElevenLabs (if ELEVENLABS_API_KEY set) or macOS `say` command as fallback.

Usage:
    python3 trading-voice-alerts.py --event circuit_breaker
    python3 trading-voice-alerts.py --event big_win --details "BTC YES +$50"
    python3 trading-voice-alerts.py --event regime_change --details "High vol → Low vol"
    python3 trading-voice-alerts.py --event streak --details "5 wins"
    python3 trading-voice-alerts.py --telegram  # Also send as voice message

Events:
    circuit_breaker - Trading paused by circuit breaker
    big_win        - Significant win (>$20)
    big_loss       - Significant loss (>$20)
    regime_change  - Volatility regime transition
    streak         - Win/loss streak notification
    daily_summary  - End of day summary

Environment:
    ELEVENLABS_API_KEY - ElevenLabs API key (optional, uses macOS say if not set)
    ELEVENLABS_VOICE   - Voice ID (default: Rachel)
    TELEGRAM_BOT_TOKEN - For sending voice messages
    TELEGRAM_CHAT_ID   - Destination chat
"""

import os
import sys
import json
import argparse
import tempfile
import subprocess
from datetime import datetime
from pathlib import Path

# Event message templates
EVENT_TEMPLATES = {
    "circuit_breaker": "⚠️ Circuit breaker triggered. Trading has been paused. {details}",
    "big_win": "🎉 Nice trade! {details}",
    "big_loss": "📉 Trade closed at a loss. {details}. Stay focused.",
    "regime_change": "📊 Volatility regime change detected. {details}. Strategy may need adjustment.",
    "streak": "🔥 {details} streak! {extra}",
    "daily_summary": "📈 Daily trading summary. {details}",
    "stop_loss": "🛑 Stop loss executed. {details}. Position closed to protect capital.",
    "low_winrate": "⚠️ Warning: Win rate has dropped to {details}. Consider reviewing recent trades.",
    "high_winrate": "✅ Excellent! Win rate is at {details}. Keep up the good work.",
}

# Streak messages
STREAK_MESSAGES = {
    "win": "You're on fire!",
    "loss": "Consider taking a break.",
}


def get_elevenlabs_voice(api_key: str, voice_id: str = "Rachel") -> str:
    """Resolve voice name to ID if needed."""
    voice_map = {
        "rachel": "21m00Tcm4TlvDq8ikWAM",
        "domi": "AZnzlk1XvdvUeBnXmlld",
        "bella": "EXAVITQu4vr4xnSDxMaL",
        "antoni": "ErXwobaYiN019PkySvjV",
        "elli": "MF3mGyEYCl7XYWbV9V6O",
        "josh": "TxGEqnHWrfWFTfGW9XjX",
        "arnold": "VR6AewLTigWG4xSOukaG",
        "adam": "pNInz6obpgDQGcFmaJgB",
        "sam": "yoZ06aMxZJJ28mfd3POQ",
    }
    return voice_map.get(voice_id.lower(), voice_id)


def generate_elevenlabs_tts(text: str, api_key: str, voice_id: str = "Rachel") -> bytes:
    """Generate TTS audio using ElevenLabs API."""
    import urllib.request
    import urllib.error
    
    voice = get_elevenlabs_voice(api_key, voice_id)
    url = f"https://api.elevenlabs.io/v1/text-to-speech/{voice}"
    
    headers = {
        "Accept": "audio/mpeg",
        "Content-Type": "application/json",
        "xi-api-key": api_key,
    }
    
    data = json.dumps({
        "text": text,
        "model_id": "eleven_monolingual_v1",
        "voice_settings": {
            "stability": 0.5,
            "similarity_boost": 0.5
        }
    }).encode("utf-8")
    
    req = urllib.request.Request(url, data=data, headers=headers)
    
    try:
        with urllib.request.urlopen(req, timeout=30) as response:
            return response.read()
    except urllib.error.HTTPError as e:
        print(f"ElevenLabs API error: {e.code} - {e.read().decode()}")
        raise


def generate_macos_tts(text: str, output_file: str) -> bool:
    """Generate TTS audio using macOS say command."""
    try:
        # Use say with AIFF output, then convert to mp3 with ffmpeg if available
        aiff_file = output_file.replace(".mp3", ".aiff")
        subprocess.run(
            ["say", "-o", aiff_file, text],
            check=True,
            capture_output=True
        )
        
        # Try to convert to mp3 with ffmpeg
        if subprocess.run(["which", "ffmpeg"], capture_output=True).returncode == 0:
            subprocess.run(
                ["ffmpeg", "-y", "-i", aiff_file, "-acodec", "libmp3lame", "-q:a", "2", output_file],
                check=True,
                capture_output=True
            )
            os.remove(aiff_file)
        else:
            # No ffmpeg, just rename
            os.rename(aiff_file, output_file)
        
        return True
    except subprocess.CalledProcessError as e:
        print(f"macOS TTS error: {e}")
        return False


def send_telegram_voice(audio_file: str, bot_token: str, chat_id: str, caption: str = "") -> bool:
    """Send audio file as voice message to Telegram."""
    import urllib.request
    import urllib.error
    
    url = f"https://api.telegram.org/bot{bot_token}/sendVoice"
    
    # Build multipart form data manually
    boundary = "----WebKitFormBoundary7MA4YWxkTrZu0gW"
    
    with open(audio_file, "rb") as f:
        audio_data = f.read()
    
    body = []
    body.append(f"--{boundary}".encode())
    body.append(f'Content-Disposition: form-data; name="chat_id"\r\n'.encode())
    body.append(f"{chat_id}\r\n".encode())
    body.append(f"--{boundary}".encode())
    body.append(f'Content-Disposition: form-data; name="voice"; filename="alert.ogg"\r\n'.encode())
    body.append(b"Content-Type: audio/ogg\r\n\r\n")
    body.append(audio_data)
    body.append(f"\r\n--{boundary}".encode())
    
    if caption:
        body.append(f'Content-Disposition: form-data; name="caption"\r\n'.encode())
        body.append(f"{caption}\r\n--{boundary}".encode())
    
    body.append(f"--{boundary}--\r\n".encode())
    
    body_data = b"\r\n".join(body)
    
    headers = {
        "Content-Type": f"multipart/form-data; boundary={boundary}",
    }
    
    req = urllib.request.Request(url, data=body_data, headers=headers)
    
    try:
        with urllib.request.urlopen(req, timeout=30) as response:
            result = json.loads(response.read())
            return result.get("ok", False)
    except Exception as e:
        print(f"Telegram voice send error: {e}")
        return False


def play_audio(audio_file: str):
    """Play audio file using system player."""
    if sys.platform == "darwin":
        subprocess.run(["afplay", audio_file], check=False)
    elif sys.platform == "linux":
        subprocess.run(["aplay", audio_file], check=False)


def generate_alert(event: str, details: str = "", send_telegram: bool = False, play: bool = False):
    """Generate and optionally send a voice alert."""
    
    # Get template
    template = EVENT_TEMPLATES.get(event)
    if not template:
        print(f"Unknown event type: {event}")
        print(f"Available events: {', '.join(EVENT_TEMPLATES.keys())}")
        return
    
    # Build message
    extra = ""
    if event == "streak" and details:
        streak_type = "win" if "win" in details.lower() else "loss"
        extra = STREAK_MESSAGES.get(streak_type, "")
    
    message = template.format(details=details or "No details provided", extra=extra)
    
    # Clean emoji for TTS (they don't speak well)
    tts_message = message
    for emoji in ["⚠️", "🎉", "📉", "📊", "🔥", "📈", "🛑", "✅"]:
        tts_message = tts_message.replace(emoji, "")
    tts_message = tts_message.strip()
    
    print(f"Alert: {message}")
    print(f"TTS text: {tts_message}")
    
    # Get credentials
    elevenlabs_key = os.environ.get("ELEVENLABS_API_KEY")
    voice_id = os.environ.get("ELEVENLABS_VOICE", "Rachel")
    telegram_token = os.environ.get("TELEGRAM_BOT_TOKEN")
    telegram_chat = os.environ.get("TELEGRAM_CHAT_ID")
    
    # Generate audio
    with tempfile.NamedTemporaryFile(suffix=".mp3", delete=False) as f:
        audio_file = f.name
    
    try:
        if elevenlabs_key:
            print("Using ElevenLabs TTS...")
            audio_data = generate_elevenlabs_tts(tts_message, elevenlabs_key, voice_id)
            with open(audio_file, "wb") as f:
                f.write(audio_data)
            print(f"Generated audio: {audio_file} ({len(audio_data)} bytes)")
        else:
            print("ElevenLabs not configured, using macOS say...")
            if not generate_macos_tts(tts_message, audio_file):
                print("Failed to generate TTS audio")
                return
            print(f"Generated audio: {audio_file}")
        
        # Play locally if requested
        if play:
            print("Playing audio...")
            play_audio(audio_file)
        
        # Send to Telegram if requested
        if send_telegram:
            if not telegram_token or not telegram_chat:
                print("Telegram not configured (missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID)")
            else:
                print(f"Sending to Telegram chat {telegram_chat}...")
                if send_telegram_voice(audio_file, telegram_token, telegram_chat, message):
                    print("✅ Voice message sent to Telegram")
                else:
                    print("❌ Failed to send Telegram voice message")
    
    finally:
        # Clean up
        if os.path.exists(audio_file):
            os.remove(audio_file)


def main():
    parser = argparse.ArgumentParser(description="Trading Voice Alerts")
    parser.add_argument("--event", "-e", help="Event type")
    parser.add_argument("--details", "-d", default="", help="Event details")
    parser.add_argument("--telegram", "-t", action="store_true", help="Send to Telegram")
    parser.add_argument("--play", "-p", action="store_true", help="Play audio locally")
    parser.add_argument("--list", "-l", action="store_true", help="List event types")
    
    args = parser.parse_args()
    
    if args.list:
        print("Available event types:")
        for event, template in EVENT_TEMPLATES.items():
            print(f"  {event}: {template[:60]}...")
        return
    
    if not args.event:
        parser.error("--event/-e is required unless using --list")
    
    generate_alert(
        event=args.event,
        details=args.details,
        send_telegram=args.telegram,
        play=args.play
    )


if __name__ == "__main__":
    main()
