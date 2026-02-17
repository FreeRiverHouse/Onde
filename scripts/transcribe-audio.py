#!/usr/bin/env python3
"""
Transcribe audio files using faster-whisper (OpenAI Whisper optimized)
Supports: mp3, wav, ogg, m4a, etc.
Languages: auto-detect or specify (it, en, etc.)
"""

import sys
from faster_whisper import WhisperModel

# Model sizes: tiny, base, small, medium, large-v2, large-v3
# Smaller = faster but less accurate
# For M1 Mac, "small" is a good balance
MODEL_SIZE = "small"

def transcribe(audio_path, language=None):
    """
    Transcribe audio file to text
    
    Args:
        audio_path: path to audio file
        language: optional language code (e.g., 'it', 'en')
                  None = auto-detect
    
    Returns:
        dict with transcription and metadata
    """
    print(f"Loading model ({MODEL_SIZE})...")
    model = WhisperModel(MODEL_SIZE, device="cpu", compute_type="int8")
    
    print(f"Transcribing: {audio_path}")
    
    # Transcribe
    segments, info = model.transcribe(
        audio_path,
        language=language,
        beam_size=5,
        vad_filter=True,  # Filter out silence
    )
    
    # Collect text
    full_text = ""
    for segment in segments:
        full_text += segment.text + " "
    
    result = {
        "text": full_text.strip(),
        "language": info.language,
        "language_probability": info.language_probability,
        "duration": info.duration,
    }
    
    return result

def main():
    if len(sys.argv) < 2:
        print("Usage: python transcribe-audio.py <audio_file> [language]")
        print("Example: python transcribe-audio.py voice.ogg it")
        sys.exit(1)
    
    audio_path = sys.argv[1]
    language = sys.argv[2] if len(sys.argv) > 2 else None
    
    result = transcribe(audio_path, language)
    
    print(f"\n{'='*50}")
    print(f"Language: {result['language']} ({result['language_probability']:.0%})")
    print(f"Duration: {result['duration']:.1f}s")
    print(f"{'='*50}")
    print(f"\n{result['text']}\n")

if __name__ == "__main__":
    main()
