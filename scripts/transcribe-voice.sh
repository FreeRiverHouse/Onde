#!/bin/bash
# Transcribe voice messages using Whisper
# Usage: transcribe-voice.sh <audio_file> [language]

AUDIO_FILE="$1"
LANG="${2:-it}"  # Default Italian

if [ -z "$AUDIO_FILE" ]; then
    echo "Usage: $0 <audio_file> [language]"
    exit 1
fi

if [ ! -f "$AUDIO_FILE" ]; then
    echo "Error: File not found: $AUDIO_FILE"
    exit 1
fi

# Create temp wav file
TEMP_WAV="/tmp/whisper_input_$$.wav"
OUTPUT_DIR="/tmp"

# Convert to wav (16kHz mono)
ffmpeg -y -i "$AUDIO_FILE" -ar 16000 -ac 1 "$TEMP_WAV" 2>/dev/null

if [ $? -ne 0 ]; then
    echo "Error: Failed to convert audio"
    exit 1
fi

# Transcribe with whisper (use small model for better accuracy)
whisper "$TEMP_WAV" \
    --model small \
    --language "$LANG" \
    --output_format txt \
    --output_dir "$OUTPUT_DIR" \
    2>/dev/null

# Output the transcription
BASENAME=$(basename "$TEMP_WAV" .wav)
if [ -f "$OUTPUT_DIR/$BASENAME.txt" ]; then
    cat "$OUTPUT_DIR/$BASENAME.txt"
    rm -f "$OUTPUT_DIR/$BASENAME.txt"
fi

# Cleanup
rm -f "$TEMP_WAV"
