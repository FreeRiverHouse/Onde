#!/bin/bash

# Run Easy-Wav2Lip on macOS
# Usage: ./run-easy-wav2lip.sh [video_path] [audio_path]

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
VENV_PATH="${SCRIPT_DIR}/Easy-Wav2Lip-venv"
APP_PATH="${SCRIPT_DIR}/Easy-Wav2Lip"

# Check if virtual environment exists
if [ ! -d "$VENV_PATH" ]; then
    echo "Error: Virtual environment not found."
    echo "Run setup-easy-wav2lip.sh first."
    exit 1
fi

# Check if Easy-Wav2Lip is installed
if [ ! -d "$APP_PATH" ]; then
    echo "Error: Easy-Wav2Lip not found."
    echo "Run setup-easy-wav2lip.sh first."
    exit 1
fi

# Activate virtual environment
source "${VENV_PATH}/bin/activate"

# Navigate to Easy-Wav2Lip
cd "$APP_PATH"

# If arguments provided, update config
if [ -n "$1" ] && [ -n "$2" ]; then
    VIDEO_PATH="$1"
    AUDIO_PATH="$2"

    echo "Video: $VIDEO_PATH"
    echo "Audio: $AUDIO_PATH"

    # Check if files exist
    if [ ! -f "$VIDEO_PATH" ]; then
        echo "Error: Video file not found: $VIDEO_PATH"
        exit 1
    fi

    if [ ! -f "$AUDIO_PATH" ]; then
        echo "Error: Audio file not found: $AUDIO_PATH"
        exit 1
    fi

    # Update config.ini if it exists
    if [ -f "config.ini" ]; then
        # Create backup
        cp config.ini config.ini.bak

        # Update paths using sed
        sed -i '' "s|^video_path.*|video_path = ${VIDEO_PATH}|" config.ini
        sed -i '' "s|^audio_path.*|audio_path = ${AUDIO_PATH}|" config.ini

        echo "Config updated. Starting processing..."
    fi
fi

# Run Easy-Wav2Lip
if [ -f "run_loop.sh" ]; then
    ./run_loop.sh
elif [ -f "run.py" ]; then
    python run.py
else
    echo "Error: Could not find run script."
    echo "Available files:"
    ls -la
    exit 1
fi
