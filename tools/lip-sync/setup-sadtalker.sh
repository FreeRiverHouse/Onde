#!/bin/bash

# SadTalker Setup Script for macOS Apple Silicon (M1/M2/M3)
# This script sets up SadTalker for local lip sync / talking head generation

set -e  # Exit on error

echo "============================================"
echo "SadTalker Setup for macOS Apple Silicon"
echo "============================================"
echo ""

# Configuration
INSTALL_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if running on macOS
if [[ "$OSTYPE" != "darwin"* ]]; then
    echo -e "${RED}Error: This script is designed for macOS only.${NC}"
    exit 1
fi

# Check for Apple Silicon
if [[ $(uname -m) != "arm64" ]]; then
    echo -e "${YELLOW}Warning: This script is optimized for Apple Silicon (M1/M2/M3).${NC}"
fi

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check for Homebrew
if ! command_exists brew; then
    echo -e "${RED}Error: Homebrew is required but not installed.${NC}"
    echo "Install with: /bin/bash -c \"\$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)\""
    exit 1
fi

# Check for conda
if ! command_exists conda; then
    echo -e "${RED}Error: Conda (Anaconda/Miniconda) is required but not installed.${NC}"
    echo ""
    echo "Install Miniconda with:"
    echo "  brew install --cask miniconda"
    echo ""
    echo "Or download from: https://docs.conda.io/en/latest/miniconda.html"
    exit 1
fi

echo ""
echo "Step 1: Installing LLVM (required for dlib compilation)..."
if ! brew list llvm &>/dev/null; then
    brew install llvm
else
    echo -e "${GREEN}LLVM already installed.${NC}"
fi

# Set up LLVM environment variables
export PATH="/opt/homebrew/opt/llvm/bin:$PATH"
export LDFLAGS="-L/opt/homebrew/opt/llvm/lib"
export CPPFLAGS="-I/opt/homebrew/opt/llvm/include"
export CC=/opt/homebrew/opt/llvm/bin/clang
export CXX=/opt/homebrew/opt/llvm/bin/clang++

echo ""
echo -e "${YELLOW}Important: Add these lines to your ~/.zshrc for permanent setup:${NC}"
echo ""
echo 'export PATH="/opt/homebrew/opt/llvm/bin:$PATH"'
echo 'export LDFLAGS="-L/opt/homebrew/opt/llvm/lib"'
echo 'export CPPFLAGS="-I/opt/homebrew/opt/llvm/include"'
echo 'export CC=/opt/homebrew/opt/llvm/bin/clang'
echo 'export CXX=/opt/homebrew/opt/llvm/bin/clang++'
echo ""

echo ""
echo "Step 2: Cloning SadTalker repository..."
cd "$INSTALL_DIR"

if [ -d "SadTalker" ]; then
    echo -e "${YELLOW}Repository already exists. Updating...${NC}"
    cd SadTalker
    git pull || true
else
    git clone https://github.com/OpenTalker/SadTalker.git
    cd SadTalker
fi

echo ""
echo "Step 3: Creating conda environment..."

# Remove existing environment if it exists
conda env remove -n sadtalker 2>/dev/null || true

conda create -n sadtalker python=3.8 -y

echo ""
echo "Step 4: Activating environment and installing dependencies..."

# Source conda for script use
eval "$(conda shell.bash hook)"
conda activate sadtalker

echo ""
echo "Step 5: Installing PyTorch with MPS support..."
pip install torch torchvision torchaudio

echo ""
echo "Step 6: Installing FFmpeg via conda..."
conda install ffmpeg -y

echo ""
echo "Step 7: Installing Python requirements..."

# Fix scipy version in requirements if needed
if grep -q "scipy" requirements.txt; then
    sed -i '' 's/scipy.*/scipy==1.10.1/' requirements.txt 2>/dev/null || true
fi

pip install -r requirements.txt

echo ""
echo "Step 8: Installing dlib (this may take a while)..."
pip install dlib

echo ""
echo "Step 9: Downloading pretrained models..."
echo ""
echo -e "${YELLOW}You need to download the pretrained models manually.${NC}"
echo ""
echo "1. Create checkpoints directory:"
echo "   mkdir -p checkpoints"
echo ""
echo "2. Download models from:"
echo "   https://github.com/OpenTalker/SadTalker#-2-download-trained-models"
echo ""
echo "3. Place them in the checkpoints folder"
echo ""

# Create checkpoints directory
mkdir -p checkpoints

echo "============================================"
echo -e "${GREEN}Installation Complete!${NC}"
echo "============================================"
echo ""
echo "To run SadTalker:"
echo ""
echo "  conda activate sadtalker"
echo "  cd ${INSTALL_DIR}/SadTalker"
echo ""
echo "  # Command line:"
echo "  python inference.py --driven_audio audio.wav --source_image image.png"
echo ""
echo "  # Web UI:"
echo "  python app_sadtalker.py"
echo ""
echo -e "${YELLOW}Note: SadTalker runs on CPU on Mac (MPS has limited support).${NC}"
echo "Processing will be slower than on NVIDIA GPUs."
echo ""
