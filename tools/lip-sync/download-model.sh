#!/bin/bash

# Download wav2lip_gan.pth model for Easy-Wav2Lip
# This is the recommended model (clearer lips)

CHECKPOINTS_DIR="/Volumes/DATI-SSD/onde-ai/lip-sync/Easy-Wav2Lip/checkpoints"
GDOWN="/Volumes/DATI-SSD/onde-ai/lip-sync/Easy-Wav2Lip/venv/bin/gdown"

echo "============================================"
echo "Downloading wav2lip_gan.pth model..."
echo "============================================"
echo ""

# Check if SSD is mounted
if [ ! -d "$CHECKPOINTS_DIR" ]; then
    echo "ERROR: SSD not mounted or checkpoints dir not found!"
    echo "Expected: $CHECKPOINTS_DIR"
    exit 1
fi

# Check if gdown exists
if [ ! -f "$GDOWN" ]; then
    echo "ERROR: gdown not found in venv!"
    echo "Install with: pip install gdown"
    exit 1
fi

# Download model
echo "Downloading from Google Drive..."
echo "File ID: 13Ktexq-nZOsAxqrTdMh3Q0ntPB3yiBtv"
echo ""

"$GDOWN" "13Ktexq-nZOsAxqrTdMh3Q0ntPB3yiBtv" -O "$CHECKPOINTS_DIR/wav2lip_gan.pth"

# Check if download succeeded
if [ -f "$CHECKPOINTS_DIR/wav2lip_gan.pth" ]; then
    SIZE=$(ls -lh "$CHECKPOINTS_DIR/wav2lip_gan.pth" | awk '{print $5}')
    echo ""
    echo "============================================"
    echo "Download complete!"
    echo "File: $CHECKPOINTS_DIR/wav2lip_gan.pth"
    echo "Size: $SIZE"
    echo "============================================"
else
    echo ""
    echo "ERROR: Download failed!"
    echo ""
    echo "Try manual download:"
    echo "1. Open: https://drive.google.com/file/d/13Ktexq-nZOsAxqrTdMh3Q0ntPB3yiBtv/view"
    echo "2. Click Download"
    echo "3. Move to: $CHECKPOINTS_DIR/wav2lip_gan.pth"
fi
