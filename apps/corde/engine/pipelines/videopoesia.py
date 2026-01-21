"""
VideoPoesia Pipeline - VISUALS-SYNC-WITH-MUSIC Engine
End-to-end music video generation with audio-visual synchronization

Use Case: @magmatic__ VideoPoesia content
- WAV audio input (music/spoken word)
- Style and narrative prompts
- Optional reference images for style guidance

Output: High-quality MP4 synced to music beats/rhythm
"""

import os
import sys
from pathlib import Path
from typing import Dict, Any, List, Optional
from datetime import datetime
from dataclasses import dataclass
import json

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent.parent))

# Set environment before imports
os.environ['HF_HOME'] = '/Volumes/DATI-SSD/onde-ai/corde/cache'
os.environ['TORCH_HOME'] = '/Volumes/DATI-SSD/onde-ai/corde/cache'
os.environ['PYTORCH_MPS_HIGH_WATERMARK_RATIO'] = '0.0'


@dataclass
class VideoPoesiaConfig:
    """Configuration for VideoPoesia generation"""
    # Audio
    audio_path: str

    # Visual style
    style_prompt: str
    narrative_prompt: str = ""
    reference_images: List[str] = None

    # Generation parameters
    num_keyframes: int = 8
    image_generator: str = "pixart"  # pixart or sdxl_turbo

    # Output settings
    resolution: str = "1920x1080"  # 16:9, can be 1080x1920 (9:16), 1080x1080 (1:1)
    fps: int = 30
    quality: str = "high"  # high, medium, fast

    # Sync settings
    transition_mode: str = "beat_sync"  # beat_sync, energy_sync, section_sync, uniform
    transition_style: str = "crossfade"  # cut, crossfade, fade_black, ken_burns
    transition_duration: float = 0.5
    min_segment_duration: float = 2.0
    max_segment_duration: float = 8.0

    # Advanced
    use_img2vid: bool = False  # Use LTX-Video for animated segments (slower)
    energy_scaling: bool = True  # Scale visual intensity with audio energy
    detect_speech: bool = True  # Detect and mark speech segments

    def __post_init__(self):
        if self.reference_images is None:
            self.reference_images = []

    def to_dict(self) -> Dict:
        return {
            'audio_path': self.audio_path,
            'style_prompt': self.style_prompt,
            'narrative_prompt': self.narrative_prompt,
            'reference_images': self.reference_images,
            'num_keyframes': self.num_keyframes,
            'image_generator': self.image_generator,
            'resolution': self.resolution,
            'fps': self.fps,
            'quality': self.quality,
            'transition_mode': self.transition_mode,
            'transition_style': self.transition_style,
            'transition_duration': self.transition_duration,
            'min_segment_duration': self.min_segment_duration,
            'max_segment_duration': self.max_segment_duration,
            'use_img2vid': self.use_img2vid,
            'energy_scaling': self.energy_scaling,
            'detect_speech': self.detect_speech,
        }

    @classmethod
    def from_dict(cls, data: Dict) -> 'VideoPoesiaConfig':
        return cls(**data)

    @classmethod
    def from_json(cls, path: str) -> 'VideoPoesiaConfig':
        with open(path, 'r') as f:
            return cls.from_dict(json.load(f))


@dataclass
class VideoPoesiaResult:
    """Result from VideoPoesia generation"""
    video_path: str
    duration: float
    keyframe_paths: List[str]
    timeline: List[Dict]
    audio_analysis: Dict
    config: VideoPoesiaConfig
    generation_time: float

    def to_dict(self) -> Dict:
        return {
            'video_path': self.video_path,
            'duration': self.duration,
            'keyframe_paths': self.keyframe_paths,
            'timeline': self.timeline,
            'audio_analysis': self.audio_analysis,
            'config': self.config.to_dict(),
            'generation_time': self.generation_time,
        }

    def save_metadata(self, path: Optional[str] = None):
        """Save result metadata to JSON"""
        if path is None:
            path = self.video_path.replace('.mp4', '_metadata.json')
        with open(path, 'w') as f:
            json.dump(self.to_dict(), f, indent=2)
        return path


class VideoPoesiaPipeline:
    """
    End-to-end pipeline for generating music-synced videos.

    Pipeline stages:
    1. Audio Analysis - Extract beats, tempo, energy, sections
    2. Prompt Generation - Create varied prompts for keyframes
    3. Image Generation - Generate keyframe images (PixArt or SDXL)
    4. Timeline Creation - Sync visuals to audio markers
    5. Video Synthesis - Create video segments with effects
    6. Final Composition - Combine segments with audio

    Optimized for Apple Silicon M4 Pro.
    Uses only open-source models (no HuggingFace login required).
    """

    # Quality presets
    QUALITY_PRESETS = {
        'high': {
            'image_generator': 'pixart',
            'num_keyframes': 12,
            'resolution': '1920x1080',
            'fps': 30,
            'steps': 25,
        },
        'medium': {
            'image_generator': 'pixart',
            'num_keyframes': 8,
            'resolution': '1920x1080',
            'fps': 30,
            'steps': 20,
        },
        'fast': {
            'image_generator': 'sdxl_turbo',
            'num_keyframes': 6,
            'resolution': '1280x720',
            'fps': 24,
            'steps': 4,
        },
    }

    # Aspect ratio presets
    ASPECT_RATIOS = {
        '16:9': '1920x1080',
        '9:16': '1080x1920',
        '1:1': '1080x1080',
        '4:3': '1440x1080',
        '21:9': '2560x1080',
        '4k': '3840x2160',
    }

    def __init__(self, verbose: bool = True):
        self.verbose = verbose
        self._progress_callback = None

    def set_progress_callback(self, callback):
        """Set callback for progress updates: callback(percent, message)"""
        self._progress_callback = callback

    def _log(self, percent: int, message: str):
        """Log progress"""
        if self.verbose:
            print(f"[{percent:3d}%] {message}")
        if self._progress_callback:
            self._progress_callback(percent, message)

    def analyze_audio(self, audio_path: str,
                     detect_speech: bool = True) -> Dict[str, Any]:
        """
        Analyze audio file for sync points.

        Returns dict with:
        - duration: float
        - tempo: float (BPM)
        - beats: List[float] (timestamps)
        - energy_curve: List[Tuple[float, float]]
        - sections: List[Dict]
        - markers: List[Dict]
        """
        from engine.nodes.music_video_nodes import AudioAnalyzerNode

        self._log(5, f"Analyzing audio: {Path(audio_path).name}")

        analyzer = AudioAnalyzerNode()
        analyzer.set_input('audio_path', audio_path)
        analyzer.set_input('detect_speech', detect_speech)

        result = analyzer.execute()

        analysis = result['analysis']
        self._log(15, f"Audio: {analysis.duration:.1f}s, {analysis.tempo:.1f} BPM, "
                     f"{len(analysis.beats)} beats, {len(analysis.sections)} sections")

        return analysis.to_dict()

    def generate(self, config: VideoPoesiaConfig) -> VideoPoesiaResult:
        """
        Generate complete music video from config.

        This is the main entry point for the pipeline.
        """
        import time
        start_time = time.time()

        from engine.nodes.music_video_nodes import (
            AudioAnalyzerNode,
            VisualSyncNode,
            MusicVideoNode,
        )

        # Validate inputs
        if not Path(config.audio_path).exists():
            raise FileNotFoundError(f"Audio file not found: {config.audio_path}")

        self._log(0, "Starting VideoPoesia generation")
        self._log(2, f"Style: {config.style_prompt[:50]}...")

        # Apply quality preset if specified
        if config.quality in self.QUALITY_PRESETS:
            preset = self.QUALITY_PRESETS[config.quality]
            # Only apply if not explicitly overridden
            if config.image_generator == 'pixart':
                config.image_generator = preset['image_generator']
            if config.num_keyframes == 8:
                config.num_keyframes = preset['num_keyframes']

        # Use MusicVideoNode for the heavy lifting
        self._log(5, "Initializing pipeline...")

        music_video_node = MusicVideoNode()
        music_video_node.set_input('audio_path', config.audio_path)
        music_video_node.set_input('style_prompt', config.style_prompt)
        music_video_node.set_input('narrative_prompt', config.narrative_prompt)
        music_video_node.set_input('reference_images', config.reference_images)
        music_video_node.set_input('num_keyframes', config.num_keyframes)
        music_video_node.set_input('resolution', config.resolution)
        music_video_node.set_input('fps', config.fps)
        music_video_node.set_input('image_generator', config.image_generator)
        music_video_node.set_input('use_img2vid', config.use_img2vid)
        music_video_node.set_input('transition_style', config.transition_style)

        # Execute the pipeline
        self._log(10, "Running generation pipeline...")
        result = music_video_node.execute()

        # Get audio analysis for metadata
        analyzer = AudioAnalyzerNode()
        analyzer.set_input('audio_path', config.audio_path)
        audio_result = analyzer.execute()
        audio_analysis = audio_result['analysis'].to_dict()

        generation_time = time.time() - start_time

        self._log(100, f"Complete! Generated in {generation_time:.1f}s")

        return VideoPoesiaResult(
            video_path=result['video_path'],
            duration=result['duration'],
            keyframe_paths=result['keyframes'],
            timeline=result['timeline'],
            audio_analysis=audio_analysis,
            config=config,
            generation_time=generation_time,
        )

    def generate_from_presets(self,
                             audio_path: str,
                             style: str,
                             narrative: str = "",
                             aspect_ratio: str = "16:9",
                             quality: str = "high") -> VideoPoesiaResult:
        """
        Simplified generation with presets.

        Args:
            audio_path: Path to WAV audio file
            style: Style description (e.g., "dreamy watercolor", "dark surrealist")
            narrative: Optional narrative/story elements
            aspect_ratio: "16:9", "9:16", "1:1", etc.
            quality: "high", "medium", "fast"
        """
        resolution = self.ASPECT_RATIOS.get(aspect_ratio, "1920x1080")

        config = VideoPoesiaConfig(
            audio_path=audio_path,
            style_prompt=style,
            narrative_prompt=narrative,
            resolution=resolution,
            quality=quality,
        )

        return self.generate(config)

    def batch_generate(self,
                      configs: List[VideoPoesiaConfig],
                      continue_on_error: bool = True) -> List[VideoPoesiaResult]:
        """
        Generate multiple videos in sequence.

        Useful for processing multiple audio files or variations.
        """
        results = []

        for i, config in enumerate(configs):
            self._log(0, f"Processing {i+1}/{len(configs)}: {Path(config.audio_path).name}")

            try:
                result = self.generate(config)
                results.append(result)
            except Exception as e:
                self._log(100, f"Error: {e}")
                if not continue_on_error:
                    raise
                results.append(None)

        return results


# Convenience functions for quick usage

def create_videopoesia(audio_path: str,
                      style_prompt: str,
                      narrative_prompt: str = "",
                      output_resolution: str = "1920x1080",
                      num_keyframes: int = 8,
                      transition_style: str = "crossfade") -> str:
    """
    Quick function to create a VideoPoesia video.

    Returns the path to the generated video.

    Example:
        video_path = create_videopoesia(
            audio_path="/path/to/music.wav",
            style_prompt="dreamy watercolor, ethereal, soft colors",
            narrative_prompt="ocean waves, sunset, peaceful journey",
        )
    """
    config = VideoPoesiaConfig(
        audio_path=audio_path,
        style_prompt=style_prompt,
        narrative_prompt=narrative_prompt,
        resolution=output_resolution,
        num_keyframes=num_keyframes,
        transition_style=transition_style,
    )

    pipeline = VideoPoesiaPipeline(verbose=True)
    result = pipeline.generate(config)

    # Save metadata
    result.save_metadata()

    return result.video_path


def analyze_audio_for_sync(audio_path: str) -> Dict:
    """
    Standalone function to analyze audio without generating video.

    Useful for planning or debugging sync points.

    Returns analysis dict with beats, tempo, sections, etc.
    """
    pipeline = VideoPoesiaPipeline(verbose=True)
    return pipeline.analyze_audio(audio_path)


# Style presets for common use cases
STYLE_PRESETS = {
    'dreamy_watercolor': {
        'style_prompt': 'dreamy watercolor painting, soft ethereal colors, flowing brushstrokes, '
                       'artistic, delicate textures, impressionistic, warm golden light',
        'transition_style': 'crossfade',
        'transition_duration': 0.8,
    },
    'dark_surrealist': {
        'style_prompt': 'dark surrealist art, Salvador Dali style, dreamlike impossible landscapes, '
                       'melting forms, dramatic lighting, mysterious atmosphere, symbolic imagery',
        'transition_style': 'fade_black',
        'transition_duration': 0.5,
    },
    'cosmic_abstract': {
        'style_prompt': 'cosmic abstract art, nebula colors, flowing energy, sacred geometry, '
                       'deep space, stars and galaxies, mystical, transcendent',
        'transition_style': 'crossfade',
        'transition_duration': 1.0,
    },
    'noir_cinematic': {
        'style_prompt': 'film noir cinematography, high contrast black and white, dramatic shadows, '
                       'vintage cinema, moody atmosphere, mysterious, elegant composition',
        'transition_style': 'fade_black',
        'transition_duration': 0.3,
    },
    'nature_poetry': {
        'style_prompt': 'nature photography, golden hour light, serene landscapes, macro details, '
                       'organic textures, peaceful, meditative, natural beauty',
        'transition_style': 'ken_burns',
        'transition_duration': 0.6,
    },
    'urban_poetry': {
        'style_prompt': 'urban street photography, city lights, rain reflections, night scenes, '
                       'neon glow, concrete jungle, human moments, documentary style',
        'transition_style': 'cut',
        'transition_duration': 0.2,
    },
}


def get_style_preset(name: str) -> Dict:
    """Get a predefined style preset by name"""
    if name not in STYLE_PRESETS:
        available = ', '.join(STYLE_PRESETS.keys())
        raise ValueError(f"Unknown preset '{name}'. Available: {available}")
    return STYLE_PRESETS[name].copy()


if __name__ == "__main__":
    # Example usage
    print("VideoPoesia Pipeline")
    print("=" * 50)
    print("\nAvailable style presets:")
    for name, preset in STYLE_PRESETS.items():
        print(f"  - {name}")
    print("\nUsage:")
    print("  from engine.pipelines.videopoesia import create_videopoesia, STYLE_PRESETS")
    print("  video = create_videopoesia('audio.wav', STYLE_PRESETS['dreamy_watercolor']['style_prompt'])")
