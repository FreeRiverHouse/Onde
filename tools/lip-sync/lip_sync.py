#!/usr/bin/env python3
"""
Lip Sync Wrapper Script for Onde Video Factory
Uses Easy-Wav2Lip installed on external SSD.

Usage:
    python lip_sync.py --face gianni.jpg --audio storia.mp3 --output video.mp4

IMPORTANT: The SSD (DATI-SSD) must be connected!

Based on Easy-Wav2Lip (https://github.com/anothermartz/Easy-Wav2Lip)
"""

import argparse
import os
import sys
import subprocess
from pathlib import Path

# Paths on external SSD
SSD_BASE = Path("/Volumes/DATI-SSD/onde-ai/lip-sync/Easy-Wav2Lip")
VENV_PYTHON = SSD_BASE / "venv" / "bin" / "python"
INFERENCE_SCRIPT = SSD_BASE / "inference.py"
CHECKPOINTS_DIR = SSD_BASE / "checkpoints"

# Local paths
SCRIPT_DIR = Path(__file__).parent.absolute()
OUTPUT_DIR = SCRIPT_DIR / "output"


def check_ssd():
    """Check if the external SSD is connected."""
    if not SSD_BASE.exists():
        print("=" * 60)
        print("ERROR: External SSD not found!")
        print("=" * 60)
        print()
        print("The lip sync system is installed on an external SSD.")
        print(f"Expected path: {SSD_BASE}")
        print()
        print("Please:")
        print("1. Connect the 'DATI-SSD' external drive")
        print("2. Wait for it to mount")
        print("3. Try again")
        print()
        return False
    return True


def check_model():
    """Check if the model weights are properly downloaded."""
    wav2lip_pth = CHECKPOINTS_DIR / "wav2lip.pth"
    wav2lip_gan_pth = CHECKPOINTS_DIR / "wav2lip_gan.pth"

    # Check if files exist and have proper size (should be ~400MB)
    min_size = 100 * 1024 * 1024  # 100MB minimum

    if wav2lip_gan_pth.exists() and wav2lip_gan_pth.stat().st_size > min_size:
        return "wav2lip_gan"
    elif wav2lip_pth.exists() and wav2lip_pth.stat().st_size > min_size:
        return "wav2lip"
    else:
        print("=" * 60)
        print("ERROR: Model weights not found or corrupted!")
        print("=" * 60)
        print()
        print("The model weights need to be downloaded from Google Drive:")
        print()
        print("1. wav2lip_gan.pth (RECOMMENDED - clearer lips):")
        print("   https://drive.google.com/file/d/13Ktexq-nZOsAxqrTdMh3Q0ntPB3yiBtv/view")
        print()
        print("2. wav2lip.pth (more accurate, slightly blurry):")
        print("   https://drive.google.com/file/d/1qKU8HG8dR4nW4LvCqpEYmSy6LLpVkZ21/view")
        print()
        print(f"Download and place in: {CHECKPOINTS_DIR}/")
        print()
        return None


def main():
    parser = argparse.ArgumentParser(
        description="Lip Sync - Generate talking videos from images + audio",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Basic usage
  python lip_sync.py --face gianni.jpg --audio storia.mp3 --output video.mp4

  # With quality enhancement
  python lip_sync.py --face gianni.jpg --audio storia.mp3 --output video.mp4 --quality enhanced

  # Check setup only
  python lip_sync.py --check
        """
    )

    parser.add_argument("--face", "-f", help="Input face image or video")
    parser.add_argument("--audio", "-a", help="Input audio file")
    parser.add_argument("--output", "-o", help="Output video file")
    parser.add_argument("--quality", choices=["fast", "improved", "enhanced"],
                        default="improved", help="Output quality (default: improved)")
    parser.add_argument("--check", action="store_true", help="Only check setup")

    args = parser.parse_args()

    print("=" * 60)
    print("Lip Sync - Onde Video Factory")
    print("=" * 60)
    print()

    # Check SSD
    print("Checking external SSD...")
    if not check_ssd():
        return 1
    print(f"[OK] SSD found at {SSD_BASE}")

    # Check venv
    print("Checking Python environment...")
    if not VENV_PYTHON.exists():
        print(f"[ERROR] Python venv not found: {VENV_PYTHON}")
        return 1
    print(f"[OK] Python venv found")

    # Check model
    print("Checking model weights...")
    model = check_model()
    if not model:
        return 1
    print(f"[OK] Model found: {model}")

    if args.check:
        print()
        print("=" * 60)
        print("All checks passed! Ready to generate lip sync videos.")
        print("=" * 60)
        return 0

    # Validate required arguments
    if not args.face or not args.audio or not args.output:
        parser.error("--face, --audio, and --output are required")

    # Validate input files
    if not os.path.exists(args.face):
        print(f"[ERROR] Face file not found: {args.face}")
        return 1
    if not os.path.exists(args.audio):
        print(f"[ERROR] Audio file not found: {args.audio}")
        return 1

    # Create output directory
    OUTPUT_DIR.mkdir(exist_ok=True)
    output_path = Path(args.output)
    if not output_path.is_absolute():
        output_path = OUTPUT_DIR / output_path

    print()
    print(f"Face:   {args.face}")
    print(f"Audio:  {args.audio}")
    print(f"Output: {output_path}")
    print(f"Quality: {args.quality}")
    print()
    print("Processing... (this may take a few minutes)")
    print("-" * 60)

    # Build command
    cmd = [
        str(VENV_PYTHON),
        str(INFERENCE_SCRIPT),
        "--face", str(args.face),
        "--audio", str(args.audio),
        "--outfile", str(output_path),
        "--quality", args.quality,
    ]

    # Run Easy-Wav2Lip
    try:
        result = subprocess.run(
            cmd,
            cwd=str(SSD_BASE),
            capture_output=False,
            text=True,
        )

        if result.returncode != 0:
            print()
            print(f"[ERROR] Inference failed with code {result.returncode}")
            return 1

    except Exception as e:
        print(f"[ERROR] Failed to run inference: {e}")
        return 1

    print("-" * 60)

    if output_path.exists():
        size_mb = output_path.stat().st_size / (1024 * 1024)
        print()
        print(f"[SUCCESS] Video saved to: {output_path}")
        print(f"File size: {size_mb:.1f} MB")
    else:
        print("[WARNING] Output file not found. Check for errors above.")
        return 1

    return 0


if __name__ == "__main__":
    sys.exit(main())
