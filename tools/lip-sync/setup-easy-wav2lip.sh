#!/bin/bash

# Easy-Wav2Lip Setup Script for macOS Apple Silicon (M1/M2/M3)
# This script sets up Easy-Wav2Lip for local lip sync generation

set -e  # Exit on error

echo "============================================"
echo "Easy-Wav2Lip Setup for macOS Apple Silicon"
echo "============================================"
echo ""

# Configuration
INSTALL_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
VENV_NAME="Easy-Wav2Lip-venv"
PYTHON_VERSION="3.10"

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
    echo "Intel Macs may have limited GPU acceleration."
fi

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check for Python 3.10
echo "Checking for Python ${PYTHON_VERSION}..."
if command_exists python${PYTHON_VERSION}; then
    PYTHON_CMD="python${PYTHON_VERSION}"
    echo -e "${GREEN}Found: $(${PYTHON_CMD} --version)${NC}"
elif command_exists python3 && [[ $(python3 --version 2>&1) == *"3.10"* ]]; then
    PYTHON_CMD="python3"
    echo -e "${GREEN}Found: $(${PYTHON_CMD} --version)${NC}"
else
    echo -e "${RED}Error: Python 3.10 is required but not found.${NC}"
    echo ""
    echo "Install Python 3.10 using one of these methods:"
    echo "  1. Homebrew: brew install python@3.10"
    echo "  2. pyenv:    pyenv install 3.10.11"
    echo "  3. Download: https://www.python.org/downloads/"
    exit 1
fi

# Check for git
if ! command_exists git; then
    echo -e "${RED}Error: git is not installed.${NC}"
    echo "Install with: brew install git"
    exit 1
fi

# Check for curl
if ! command_exists curl; then
    echo -e "${RED}Error: curl is not installed.${NC}"
    exit 1
fi

# Check for unzip
if ! command_exists unzip; then
    echo -e "${RED}Error: unzip is not installed.${NC}"
    exit 1
fi

echo ""
echo "Step 1: Creating virtual environment..."
cd "$INSTALL_DIR"

if [ -d "$VENV_NAME" ]; then
    echo -e "${YELLOW}Virtual environment already exists. Removing...${NC}"
    rm -rf "$VENV_NAME"
fi

$PYTHON_CMD -m venv "$VENV_NAME"
source "$VENV_NAME/bin/activate"
echo -e "${GREEN}Virtual environment created and activated.${NC}"

echo ""
echo "Step 2: Upgrading pip..."
python -m pip install --upgrade pip

echo ""
echo "Step 3: Installing requests..."
python -m pip install requests

echo ""
echo "Step 4: Downloading FFmpeg binaries..."

# Get latest FFmpeg version from evermeet.cx
FFMPEG_VERSION="7.1"

for file in ffmpeg ffprobe ffplay; do
    if [ -f "${file}-${FFMPEG_VERSION}.zip" ]; then
        rm "${file}-${FFMPEG_VERSION}.zip"
    fi
    echo "Downloading ${file}..."
    curl -L -O "https://evermeet.cx/ffmpeg/${file}-${FFMPEG_VERSION}.zip" || {
        echo -e "${YELLOW}Warning: Could not download from evermeet.cx${NC}"
        echo "Trying alternative: Installing FFmpeg via Homebrew..."
        brew install ffmpeg
        break
    }
    unzip -o "${file}-${FFMPEG_VERSION}.zip"
done

# Move binaries if downloaded
if [ -f "ffmpeg" ]; then
    mv -f ffmpeg ffprobe ffplay "$VENV_NAME/bin/" 2>/dev/null || true
    rm -f ffmpeg-*.zip ffprobe-*.zip ffplay-*.zip
    echo -e "${GREEN}FFmpeg installed to virtual environment.${NC}"
fi

echo ""
echo "Step 5: Cloning Easy-Wav2Lip repository..."

if [ -d "Easy-Wav2Lip" ]; then
    echo -e "${YELLOW}Repository already exists. Updating...${NC}"
    cd Easy-Wav2Lip
    git pull || true
else
    git clone https://github.com/anothermartz/Easy-Wav2Lip.git
    cd Easy-Wav2Lip
fi

echo ""
echo "Step 6: Installing Python requirements..."
pip install -r requirements.txt

echo ""
echo "Step 7: Running installer (downloading models)..."
python install.py

echo ""
echo "============================================"
echo -e "${GREEN}Installation Complete!${NC}"
echo "============================================"
echo ""
echo "To run Easy-Wav2Lip:"
echo ""
echo "  cd ${INSTALL_DIR}"
echo "  source ${VENV_NAME}/bin/activate"
echo "  cd Easy-Wav2Lip"
echo "  ./run_loop.sh"
echo ""
echo "Or use the run script:"
echo "  ./run-easy-wav2lip.sh"
echo ""
