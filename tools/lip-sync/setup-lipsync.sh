#!/bin/bash

# Lip Sync Setup Script for macOS Apple Silicon
# Based on the lipsync library (simplified Wav2Lip)
# https://github.com/mowshon/lipsync

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
VENV_DIR="$SCRIPT_DIR/venv"
WEIGHTS_DIR="$SCRIPT_DIR/weights"

echo "============================================"
echo "Lip Sync Setup for macOS Apple Silicon"
echo "============================================"
echo ""

# Check for Python 3.10+
if command -v python3.10 &> /dev/null; then
    PYTHON_CMD="python3.10"
elif command -v python3.11 &> /dev/null; then
    PYTHON_CMD="python3.11"
elif command -v python3.12 &> /dev/null; then
    PYTHON_CMD="python3.12"
else
    echo "ERROR: Python 3.10+ is required."
    echo "Install with: brew install python@3.10"
    exit 1
fi

echo "Using Python: $PYTHON_CMD ($($PYTHON_CMD --version))"
echo ""

# Check for FFmpeg
if ! command -v ffmpeg &> /dev/null; then
    echo "ERROR: FFmpeg is required."
    echo "Install with: brew install ffmpeg"
    exit 1
fi
echo "FFmpeg found: $(ffmpeg -version 2>&1 | head -1)"
echo ""

# Check disk space (need ~3GB)
AVAILABLE_SPACE=$(df -g "$SCRIPT_DIR" | tail -1 | awk '{print $4}')
if [ "$AVAILABLE_SPACE" -lt 3 ]; then
    echo "WARNING: Low disk space! Available: ${AVAILABLE_SPACE}GB"
    echo "You need at least 3GB for models and dependencies."
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Create virtual environment
echo "Step 1: Creating virtual environment..."
if [ -d "$VENV_DIR" ]; then
    echo "Removing existing venv..."
    rm -rf "$VENV_DIR"
fi
$PYTHON_CMD -m venv "$VENV_DIR"
source "$VENV_DIR/bin/activate"

# Upgrade pip
echo ""
echo "Step 2: Upgrading pip..."
python -m pip install --upgrade pip --quiet

# Install PyTorch with MPS support
echo ""
echo "Step 3: Installing PyTorch (with MPS support for Apple Silicon)..."
pip install torch torchvision torchaudio --quiet

# Install other dependencies
echo ""
echo "Step 4: Installing dependencies..."
pip install opencv-python face_alignment tqdm numpy librosa av --quiet

# Install lipsync from GitHub
echo ""
echo "Step 5: Installing lipsync library..."
if [ -d "$SCRIPT_DIR/lipsync-repo" ]; then
    rm -rf "$SCRIPT_DIR/lipsync-repo"
fi
git clone https://github.com/mowshon/lipsync.git "$SCRIPT_DIR/lipsync-repo"
pip install "$SCRIPT_DIR/lipsync-repo"

# Create weights directory
echo ""
echo "Step 6: Creating weights directory..."
mkdir -p "$WEIGHTS_DIR"

# Download models
echo ""
echo "Step 7: Downloading pre-trained models..."
echo ""
echo "You need to download the model weights manually from Google Drive:"
echo ""
echo "1. wav2lip.pth (more accurate, slightly blurry lips):"
echo "   https://drive.google.com/file/d/1qKU8HG8dR4nW4LvCqpEYmSy6LLpVkZ21/view"
echo ""
echo "2. wav2lip_gan.pth (clearer lips, slightly less accurate):"
echo "   https://drive.google.com/file/d/13Ktexq-nZOsAxqrTdMh3Q0ntPB3yiBtv/view"
echo ""
echo "Download at least one and place it in:"
echo "  $WEIGHTS_DIR/"
echo ""

# Verify MPS support
echo "Step 8: Verifying MPS (Metal) support..."
python -c "import torch; print(f'MPS available: {torch.backends.mps.is_available()}')"
python -c "import torch; print(f'MPS built: {torch.backends.mps.is_built()}')"

echo ""
echo "============================================"
echo "Setup Complete!"
echo "============================================"
echo ""
echo "NEXT STEPS:"
echo "1. Download model weights (see above)"
echo "2. Place weights in: $WEIGHTS_DIR/"
echo "3. Run: ./lip_sync.py --image input.jpg --audio audio.mp3 --output video.mp4"
echo ""
echo "To activate the environment manually:"
echo "  source $VENV_DIR/bin/activate"
echo ""
