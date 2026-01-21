#!/usr/bin/env python3
"""
VideoPoesia CLI - VISUALS-SYNC-WITH-MUSIC Engine
Generate music-synced videos from audio files

Usage:
    python generate_videopoesia.py --audio music.wav --style "dreamy watercolor"
    python generate_videopoesia.py --audio music.wav --preset dreamy_watercolor
    python generate_videopoesia.py --audio music.wav --config config.json

Examples:
    # Basic usage with style prompt
    python generate_videopoesia.py \\
        --audio "/path/to/music.wav" \\
        --style "dreamy watercolor, ethereal, soft colors" \\
        --narrative "ocean waves, sunset, peaceful journey"

    # Using a preset
    python generate_videopoesia.py \\
        --audio "/path/to/music.wav" \\
        --preset dark_surrealist

    # Full control
    python generate_videopoesia.py \\
        --audio "/path/to/music.wav" \\
        --style "cosmic abstract art" \\
        --keyframes 12 \\
        --resolution 1080x1920 \\
        --transition crossfade \\
        --quality high

    # Analyze audio only (no video generation)
    python generate_videopoesia.py \\
        --audio "/path/to/music.wav" \\
        --analyze-only

Optimized for Apple Silicon M4 Pro.
Uses open-source models only (no HuggingFace login required).
"""

import argparse
import json
import sys
import os
from pathlib import Path
from datetime import datetime

# Set environment before imports
os.environ['HF_HOME'] = '/Volumes/DATI-SSD/onde-ai/corde/cache'
os.environ['TORCH_HOME'] = '/Volumes/DATI-SSD/onde-ai/corde/cache'
os.environ['PYTORCH_MPS_HIGH_WATERMARK_RATIO'] = '0.0'

# Add corde root directory to path for proper imports
CORDE_ROOT = Path(__file__).parent.parent.absolute()
sys.path.insert(0, str(CORDE_ROOT))


def print_banner():
    """Print CLI banner"""
    print("""
    ╔══════════════════════════════════════════════════════════════╗
    ║                     VIDEOPOESIA                              ║
    ║           VISUALS-SYNC-WITH-MUSIC Engine                     ║
    ║                                                              ║
    ║   Generate music-synced videos with AI                       ║
    ║   Optimized for Apple Silicon M4 Pro                         ║
    ╚══════════════════════════════════════════════════════════════╝
    """)


def list_presets():
    """List available style presets"""
    from engine.pipelines.videopoesia import STYLE_PRESETS

    print("\nAvailable Style Presets:")
    print("=" * 60)

    for name, preset in STYLE_PRESETS.items():
        print(f"\n  {name}")
        print(f"    Style: {preset['style_prompt'][:60]}...")
        print(f"    Transition: {preset['transition_style']}, {preset['transition_duration']}s")

    print("\n")


def analyze_audio(audio_path: str, output_json: str = None):
    """Analyze audio and optionally save to JSON"""
    from engine.pipelines.videopoesia import analyze_audio_for_sync

    print(f"\nAnalyzing: {audio_path}")
    print("-" * 60)

    analysis = analyze_audio_for_sync(audio_path)

    print(f"\nDuration:    {analysis['duration']:.2f} seconds")
    print(f"Sample Rate: {analysis['sample_rate']} Hz")
    print(f"Tempo:       {analysis['tempo']:.1f} BPM")
    print(f"Beats:       {len(analysis['beats'])}")
    print(f"Downbeats:   {len(analysis['downbeats'])}")
    print(f"Sections:    {len(analysis['sections'])}")

    if analysis['speech_segments']:
        print(f"Speech:      {len(analysis['speech_segments'])} segments")
        for i, (start, end) in enumerate(analysis['speech_segments'][:5]):
            print(f"             [{start:.2f}s - {end:.2f}s]")
        if len(analysis['speech_segments']) > 5:
            print(f"             ... and {len(analysis['speech_segments'])-5} more")

    print(f"\nSync Markers: {len(analysis['markers'])}")
    marker_types = {}
    for m in analysis['markers']:
        t = m['type']
        marker_types[t] = marker_types.get(t, 0) + 1
    for t, count in sorted(marker_types.items()):
        print(f"  - {t}: {count}")

    if output_json:
        import numpy as np
        def convert_numpy(obj):
            if isinstance(obj, np.floating):
                return float(obj)
            elif isinstance(obj, np.integer):
                return int(obj)
            elif isinstance(obj, np.ndarray):
                return obj.tolist()
            elif isinstance(obj, dict):
                return {k: convert_numpy(v) for k, v in obj.items()}
            elif isinstance(obj, list):
                return [convert_numpy(i) for i in obj]
            return obj
        with open(output_json, 'w') as f:
            json.dump(convert_numpy(analysis), f, indent=2)
        print(f"\nAnalysis saved to: {output_json}")

    return analysis


def generate_video(args):
    """Generate video from arguments"""
    from engine.pipelines.videopoesia import (
        VideoPoesiaPipeline,
        VideoPoesiaConfig,
        STYLE_PRESETS,
        get_style_preset,
    )

    # Determine style
    style_prompt = args.style
    transition_style = args.transition
    transition_duration = args.transition_duration

    if args.preset:
        preset = get_style_preset(args.preset)
        style_prompt = preset['style_prompt']
        transition_style = preset.get('transition_style', transition_style)
        transition_duration = preset.get('transition_duration', transition_duration)

    if not style_prompt:
        print("Error: Either --style or --preset must be provided")
        sys.exit(1)

    # Build config
    config = VideoPoesiaConfig(
        audio_path=args.audio,
        style_prompt=style_prompt,
        narrative_prompt=args.narrative or "",
        num_keyframes=args.keyframes,
        image_generator=args.generator,
        resolution=args.resolution,
        fps=args.fps,
        quality=args.quality,
        transition_mode=args.sync_mode,
        transition_style=transition_style,
        transition_duration=transition_duration,
        min_segment_duration=args.min_duration,
        max_segment_duration=args.max_duration,
        detect_speech=not args.no_speech_detection,
    )

    # Reference images
    if args.reference:
        config.reference_images = args.reference

    print(f"\nConfiguration:")
    print(f"  Audio:      {Path(args.audio).name}")
    print(f"  Style:      {style_prompt[:50]}...")
    print(f"  Keyframes:  {config.num_keyframes}")
    print(f"  Resolution: {config.resolution}")
    print(f"  Quality:    {config.quality}")
    print(f"  Generator:  {config.image_generator}")
    print(f"  Transition: {transition_style}")
    print("-" * 60)

    # Generate
    pipeline = VideoPoesiaPipeline(verbose=True)

    try:
        result = pipeline.generate(config)

        print("\n" + "=" * 60)
        print("GENERATION COMPLETE")
        print("=" * 60)
        print(f"\nOutput:    {result.video_path}")
        print(f"Duration:  {result.duration:.2f} seconds")
        print(f"Keyframes: {len(result.keyframe_paths)}")
        print(f"Segments:  {len(result.timeline)}")
        print(f"Time:      {result.generation_time:.1f} seconds")

        # Save metadata
        metadata_path = result.save_metadata()
        print(f"Metadata:  {metadata_path}")

        # Save config for reproducibility
        if args.save_config:
            config_path = result.video_path.replace('.mp4', '_config.json')
            with open(config_path, 'w') as f:
                json.dump(config.to_dict(), f, indent=2)
            print(f"Config:    {config_path}")

        return result.video_path

    except Exception as e:
        print(f"\nError: {e}")
        if args.debug:
            import traceback
            traceback.print_exc()
        sys.exit(1)


def main():
    parser = argparse.ArgumentParser(
        description="VideoPoesia - Generate music-synced videos with AI",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__
    )

    # Required
    parser.add_argument('--audio', '-a', type=str,
                       help='Path to WAV audio file')

    # Style options
    style_group = parser.add_mutually_exclusive_group()
    style_group.add_argument('--style', '-s', type=str,
                            help='Visual style prompt')
    style_group.add_argument('--preset', '-p', type=str,
                            help='Use predefined style preset')

    parser.add_argument('--narrative', '-n', type=str, default='',
                       help='Narrative/story elements to visualize')

    # Generation parameters
    parser.add_argument('--keyframes', '-k', type=int, default=8,
                       help='Number of keyframes to generate (default: 8)')
    parser.add_argument('--generator', '-g', type=str, default='pixart',
                       choices=['pixart', 'sdxl_turbo'],
                       help='Image generator to use (default: pixart)')
    parser.add_argument('--quality', '-q', type=str, default='high',
                       choices=['high', 'medium', 'fast'],
                       help='Quality preset (default: high)')

    # Output settings
    parser.add_argument('--resolution', '-r', type=str, default='1920x1080',
                       choices=['1920x1080', '1080x1920', '1080x1080',
                               '1280x720', '720x1280', '3840x2160'],
                       help='Output resolution (default: 1920x1080)')
    parser.add_argument('--fps', type=int, default=30,
                       choices=[24, 30, 60],
                       help='Frames per second (default: 30)')

    # Sync settings
    parser.add_argument('--sync-mode', type=str, default='beat_sync',
                       choices=['beat_sync', 'energy_sync', 'section_sync', 'uniform'],
                       help='How to sync visuals to audio (default: beat_sync)')
    parser.add_argument('--transition', '-t', type=str, default='crossfade',
                       choices=['cut', 'crossfade', 'fade_black', 'ken_burns'],
                       help='Transition style (default: crossfade)')
    parser.add_argument('--transition-duration', type=float, default=0.5,
                       help='Transition duration in seconds (default: 0.5)')
    parser.add_argument('--min-duration', type=float, default=2.0,
                       help='Minimum segment duration (default: 2.0)')
    parser.add_argument('--max-duration', type=float, default=8.0,
                       help='Maximum segment duration (default: 8.0)')

    # Reference images
    parser.add_argument('--reference', type=str, nargs='+',
                       help='Style reference image paths')

    # Utility options
    parser.add_argument('--analyze-only', action='store_true',
                       help='Only analyze audio, do not generate video')
    parser.add_argument('--list-presets', action='store_true',
                       help='List available style presets')
    parser.add_argument('--save-config', action='store_true',
                       help='Save configuration for reproducibility')
    parser.add_argument('--config', type=str,
                       help='Load configuration from JSON file')
    parser.add_argument('--output-analysis', type=str,
                       help='Save audio analysis to JSON file')

    # Advanced
    parser.add_argument('--no-speech-detection', action='store_true',
                       help='Disable speech segment detection')
    parser.add_argument('--debug', action='store_true',
                       help='Show debug information on error')

    args = parser.parse_args()

    print_banner()

    # Handle utility commands
    if args.list_presets:
        list_presets()
        return

    # Validate audio input
    if not args.audio:
        if not args.list_presets:
            parser.error("--audio is required")
        return

    if not Path(args.audio).exists():
        print(f"Error: Audio file not found: {args.audio}")
        sys.exit(1)

    # Analyze only mode
    if args.analyze_only:
        analyze_audio(args.audio, args.output_analysis)
        return

    # Load config from file if provided
    if args.config:
        from engine.pipelines.videopoesia import VideoPoesiaConfig
        config = VideoPoesiaConfig.from_json(args.config)
        # Override audio path if provided
        if args.audio:
            config.audio_path = args.audio
        print(f"Loaded configuration from: {args.config}")

    # Generate video
    generate_video(args)


if __name__ == "__main__":
    main()
