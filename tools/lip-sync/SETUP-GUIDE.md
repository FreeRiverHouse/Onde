# Local Lip Sync Setup Guide for macOS (Apple Silicon)

Free alternatives to Hedra for local lip sync generation on Mac M1/M2/M3.

## Quick Comparison

| Tool | Mac M-series Support | Ease of Setup | Quality | Speed |
|------|---------------------|---------------|---------|-------|
| Easy-Wav2Lip | Yes (MPS) | Medium | Good | Fast |
| SadTalker | Yes (with workarounds) | Hard | Excellent | Slow |
| Original Wav2Lip | No (CUDA only) | N/A | Good | N/A |

## Recommendation: Easy-Wav2Lip

Easy-Wav2Lip is the best option for Mac users because:
- Native MPS (Metal Performance Shaders) support for Apple Silicon
- Faster processing (56s vs 6m53s for 9-second 720p video)
- GUI interface via config file
- Active development (though repo archived Jan 2025)

---

## Option 1: Easy-Wav2Lip (Recommended)

### Requirements
- macOS with Apple Silicon (M1/M2/M3)
- Python 3.10 (specifically 3.10.11 recommended)
- Git
- ~5GB disk space

### Installation Steps

```bash
# 1. Navigate to tools directory
cd /Users/mattia/Projects/Onde/tools/lip-sync

# 2. Create Python 3.10 virtual environment
python3.10 -m venv Easy-Wav2Lip-venv

# 3. Activate virtual environment
source Easy-Wav2Lip-venv/bin/activate

# 4. Upgrade pip
python -m pip install --upgrade pip

# 5. Install requests
python -m pip install requests

# 6. Download and install FFmpeg (macOS static builds)
for file in ffmpeg ffprobe ffplay; do
  curl -O "https://evermeet.cx/ffmpeg/${file}-7.1.zip"
  unzip "${file}-7.1.zip"
done

# 7. Move FFmpeg binaries to venv
mv -f ffmpeg ffprobe ffplay Easy-Wav2Lip-venv/bin/

# 8. Clean up zip files
rm -f ffmpeg-7.1.zip ffprobe-7.1.zip ffplay-7.1.zip

# 9. Clone Easy-Wav2Lip repository
git clone https://github.com/anothermartz/Easy-Wav2Lip.git

# 10. Enter directory and install requirements
cd Easy-Wav2Lip
pip install -r requirements.txt

# 11. Run installer (downloads models)
python install.py
```

### Running Easy-Wav2Lip

```bash
# Activate environment
source /Users/mattia/Projects/Onde/tools/lip-sync/Easy-Wav2Lip-venv/bin/activate

# Run the application
cd /Users/mattia/Projects/Onde/tools/lip-sync/Easy-Wav2Lip
./run_loop.sh
```

A `config.ini` file will open. Configure:
- `video_path`: Path to your video file
- `audio_path`: Path to your audio file
- Save the file to start processing

### Example Usage

```bash
# Direct inference (if available)
python run.py --video /path/to/video.mp4 --audio /path/to/audio.wav
```

---

## Option 2: SadTalker (Better Quality, Harder Setup)

SadTalker generates talking head videos from a single image + audio. Better quality but slower and more complex setup on Mac.

### Requirements
- Python 3.8
- Anaconda/Miniconda
- LLVM (for dlib compilation)
- ~10GB disk space

### Installation Steps

```bash
# 1. Install LLVM (required for dlib on Apple Silicon)
brew install llvm

# 2. Add LLVM to shell config (~/.zshrc)
echo 'export PATH="/opt/homebrew/opt/llvm/bin:$PATH"' >> ~/.zshrc
echo 'export LDFLAGS="-L/opt/homebrew/opt/llvm/lib"' >> ~/.zshrc
echo 'export CPPFLAGS="-I/opt/homebrew/opt/llvm/include"' >> ~/.zshrc
echo 'export CC=/opt/homebrew/opt/llvm/bin/clang' >> ~/.zshrc
echo 'export CXX=/opt/homebrew/opt/llvm/bin/clang++' >> ~/.zshrc
source ~/.zshrc

# 3. Clone SadTalker
cd /Users/mattia/Projects/Onde/tools/lip-sync
git clone https://github.com/OpenTalker/SadTalker.git
cd SadTalker

# 4. Create conda environment
conda create -n sadtalker python=3.8 -y
conda activate sadtalker

# 5. Install PyTorch with MPS support
pip install torch torchvision torchaudio

# 6. Install FFmpeg
conda install ffmpeg -y

# 7. Install requirements (may need scipy=1.10.1 fix)
pip install -r requirements.txt

# 8. Install dlib (compiles from source on Apple Silicon)
pip install dlib

# 9. Download pretrained models
# Follow instructions at: https://github.com/OpenTalker/SadTalker#-2-download-trained-models
```

### Known Issues on Apple Silicon

1. **MPS conv3d not supported**: SadTalker may fall back to CPU mode (slower)
2. **dlib compilation**: Requires LLVM setup above
3. **scipy version**: May need to pin to 1.10.1 in requirements.txt

### Running SadTalker

```bash
# Activate environment
conda activate sadtalker

# Basic usage
python inference.py \
  --driven_audio /path/to/audio.wav \
  --source_image /path/to/image.png \
  --enhancer gfpgan

# Full body mode
python inference.py \
  --driven_audio /path/to/audio.wav \
  --source_image /path/to/image.png \
  --still \
  --preprocess full \
  --enhancer gfpgan

# Web UI
python app_sadtalker.py
```

---

## Troubleshooting

### Python 3.10 Not Found
```bash
# Install via pyenv
brew install pyenv
pyenv install 3.10.11
pyenv global 3.10.11

# Or via Homebrew
brew install python@3.10
```

### FFmpeg Download Issues
```bash
# Alternative: Install via Homebrew
brew install ffmpeg
```

### MPS Not Available
Verify PyTorch MPS support:
```python
import torch
print(f"MPS available: {torch.backends.mps.is_available()}")
print(f"MPS built: {torch.backends.mps.is_built()}")
```

### Easy-Wav2Lip Models Not Downloading
Models are stored in `Easy-Wav2Lip/models/`. Check:
- `wav2lip_gan.pth`
- `s3fd.pth`
- `mobilenet.pth`

---

## Resources

- [Easy-Wav2Lip GitHub](https://github.com/anothermartz/Easy-Wav2Lip) (Archived Jan 2025)
- [SadTalker GitHub](https://github.com/OpenTalker/SadTalker)
- [Original Wav2Lip](https://github.com/Rudrabha/Wav2Lip) (CUDA only)
- [SadTalker macOS Installation Docs](https://github.com/OpenTalker/SadTalker/blob/main/docs/install.md)

---

## Summary

For free local lip sync on Mac M-series:

1. **Start with Easy-Wav2Lip** - Easiest to set up, good quality
2. **Try SadTalker** if you need better quality and have patience for setup
3. **Avoid Original Wav2Lip** - No native Mac support

Both tools are free and run entirely locally - no API costs or cloud processing needed.
