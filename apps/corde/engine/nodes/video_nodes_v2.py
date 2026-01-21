"""
CORDE Video Nodes v2 - Optimized for Apple Silicon M4 Pro
Open Source models only (no HF login required)

Models:
- LTX-Video: Text-to-video and Image-to-video
- FFmpeg: Video processing and effects
"""

import os
from typing import Dict, Any, Optional, List
from pathlib import Path
from datetime import datetime
import subprocess
import tempfile
from .base import BaseNode

# Set cache to SSD
os.environ['HF_HOME'] = '/Volumes/DATI-SSD/onde-ai/corde/cache'
os.environ['TORCH_HOME'] = '/Volumes/DATI-SSD/onde-ai/corde/cache'
os.environ['PYTORCH_MPS_HIGH_WATERMARK_RATIO'] = '0.0'

# Lazy loaded pipelines
_pipelines = {}


def clear_memory():
    """Clear MPS memory"""
    import gc
    import torch
    gc.collect()
    if torch.backends.mps.is_available():
        torch.mps.empty_cache()
        torch.mps.synchronize()


class LTXVideoNode(BaseNode):
    """LTX-Video - Open source video generation

    Supports:
    - Text-to-video
    - Image-to-video (with reference image)

    Open source from Lightricks, no login required.
    """

    NODE_ID = "ltx_video"
    NODE_NAME = "LTX Video"
    NODE_CATEGORY = "video"
    NODE_DESCRIPTION = "Generate video with LTX-Video (open source)"

    INPUTS = {
        'prompt': {'type': 'string', 'required': True},
        'negative_prompt': {'type': 'string', 'required': False, 'default': ''},
        'image': {'type': 'image', 'required': False, 'description': 'Reference image for img2vid'},
        'num_frames': {'type': 'int', 'required': False, 'default': 49, 'min': 9, 'max': 121},
        'fps': {'type': 'int', 'required': False, 'default': 24},
        'width': {'type': 'int', 'required': False, 'default': 704, 'options': [512, 704, 768]},
        'height': {'type': 'int', 'required': False, 'default': 480, 'options': [320, 480, 512]},
        'steps': {'type': 'int', 'required': False, 'default': 30, 'min': 10, 'max': 50},
        'guidance_scale': {'type': 'float', 'required': False, 'default': 3.0},
        'seed': {'type': 'int', 'required': False, 'default': -1},
    }

    OUTPUTS = {
        'video_path': {'type': 'string'},
        'frames': {'type': 'list'},
        'duration': {'type': 'float'},
    }

    def _load_pipeline(self, mode: str = 'text2video'):
        """Lazy load LTX-Video pipeline"""
        global _pipelines

        key = f'ltx_{mode}'

        if key not in _pipelines:
            self.log_progress(5, f'Loading LTX-Video ({mode})...')

            import torch
            from diffusers import LTXPipeline, LTXImageToVideoPipeline

            if mode == 'img2video':
                _pipelines[key] = LTXImageToVideoPipeline.from_pretrained(
                    "Lightricks/LTX-Video",
                    torch_dtype=torch.bfloat16,
                )
            else:
                _pipelines[key] = LTXPipeline.from_pretrained(
                    "Lightricks/LTX-Video",
                    torch_dtype=torch.bfloat16,
                )

            # Move to MPS
            _pipelines[key] = _pipelines[key].to("mps")

            self.log_progress(20, 'LTX-Video loaded')

        return _pipelines[key]

    def execute(self) -> Dict[str, Any]:
        import torch
        from diffusers.utils import export_to_video

        errors = self.validate_inputs()
        if errors:
            raise ValueError(", ".join(errors))

        prompt = self.inputs['prompt']
        negative_prompt = self.inputs.get('negative_prompt', '')
        image = self.inputs.get('image')
        num_frames = self.inputs.get('num_frames', 49)
        fps = self.inputs.get('fps', 24)
        width = self.inputs.get('width', 704)
        height = self.inputs.get('height', 480)
        steps = self.inputs.get('steps', 30)
        guidance = self.inputs.get('guidance_scale', 3.0)
        seed = self.inputs.get('seed', -1)

        # Determine mode
        mode = 'img2video' if image is not None else 'text2video'

        self.log_progress(10, f'Generating video ({mode}): {prompt[:50]}...')

        clear_memory()
        pipe = self._load_pipeline(mode)

        # Handle seed
        generator = None
        if seed >= 0:
            generator = torch.Generator(device="mps").manual_seed(seed)
        else:
            seed = torch.randint(0, 2**32, (1,)).item()
            generator = torch.Generator(device="mps").manual_seed(seed)

        self.log_progress(30, 'Running inference...')

        with torch.no_grad():
            if mode == 'img2video':
                result = pipe(
                    image=image,
                    prompt=prompt,
                    negative_prompt=negative_prompt,
                    width=width,
                    height=height,
                    num_frames=num_frames,
                    num_inference_steps=steps,
                    guidance_scale=guidance,
                    generator=generator,
                )
            else:
                result = pipe(
                    prompt=prompt,
                    negative_prompt=negative_prompt,
                    width=width,
                    height=height,
                    num_frames=num_frames,
                    num_inference_steps=steps,
                    guidance_scale=guidance,
                    generator=generator,
                )

        frames = result.frames[0]
        clear_memory()

        self.log_progress(90, 'Saving video...')

        # Save video
        output_dir = Path('/Volumes/DATI-SSD/onde-ai/corde/outputs/videos')
        output_dir.mkdir(parents=True, exist_ok=True)
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        output_path = output_dir / f'ltx_{timestamp}.mp4'

        export_to_video(frames, str(output_path), fps=fps)

        duration = num_frames / fps

        self.outputs = {
            'video_path': str(output_path),
            'frames': frames,
            'duration': duration,
        }

        self.log_progress(100, f'Done: {output_path.name} ({duration:.1f}s)')
        return self.outputs


class FFmpegNodeV2(BaseNode):
    """FFmpeg video processing - optimized for M4 Pro

    Supports:
    - Image to video (Ken Burns, zoom, pan effects)
    - Video concatenation
    - Audio overlay
    - Format conversion
    """

    NODE_ID = "ffmpeg_v2"
    NODE_NAME = "FFmpeg Process"
    NODE_CATEGORY = "video"
    NODE_DESCRIPTION = "Process video with FFmpeg (Apple VideoToolbox)"

    INPUTS = {
        'input_path': {'type': 'string', 'required': True},
        'effect': {'type': 'string', 'required': False, 'default': 'ken_burns',
                   'options': ['none', 'zoom_in', 'zoom_out', 'pan_left', 'pan_right', 'ken_burns', 'subtle_motion']},
        'duration': {'type': 'float', 'required': False, 'default': 5.0, 'min': 1, 'max': 60},
        'fps': {'type': 'int', 'required': False, 'default': 30, 'options': [24, 30, 60]},
        'resolution': {'type': 'string', 'required': False, 'default': '1080x1920',
                       'options': ['1080x1920', '1920x1080', '1080x1080', '720x1280']},
        'fade_in': {'type': 'float', 'required': False, 'default': 0.5},
        'fade_out': {'type': 'float', 'required': False, 'default': 0.5},
        'audio_path': {'type': 'string', 'required': False, 'description': 'Optional audio to overlay'},
        'use_hw_accel': {'type': 'bool', 'required': False, 'default': True, 'description': 'Use VideoToolbox'},
    }

    OUTPUTS = {
        'video_path': {'type': 'string'},
        'duration': {'type': 'float'},
    }

    def execute(self) -> Dict[str, Any]:
        input_path = self.inputs['input_path']
        effect = self.inputs.get('effect', 'ken_burns')
        duration = self.inputs.get('duration', 5.0)
        fps = self.inputs.get('fps', 30)
        resolution = self.inputs.get('resolution', '1080x1920')
        fade_in = self.inputs.get('fade_in', 0.5)
        fade_out = self.inputs.get('fade_out', 0.5)
        audio_path = self.inputs.get('audio_path')
        use_hw = self.inputs.get('use_hw_accel', True)

        self.log_progress(10, f'Processing with effect: {effect}')

        # Parse resolution
        width, height = map(int, resolution.split('x'))
        total_frames = int(duration * fps)

        # Build filter based on effect
        effects = {
            'zoom_in': f"zoompan=z='1+0.15*in/{total_frames}':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d={total_frames}:s={width}x{height}:fps={fps}",
            'zoom_out': f"zoompan=z='1.15-0.15*in/{total_frames}':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d={total_frames}:s={width}x{height}:fps={fps}",
            'pan_left': f"zoompan=z='1.05':x='iw*0.05*in/{total_frames}':y='ih*0.05':d={total_frames}:s={width}x{height}:fps={fps}",
            'pan_right': f"zoompan=z='1.05':x='iw*0.05-iw*0.05*in/{total_frames}':y='ih*0.05':d={total_frames}:s={width}x{height}:fps={fps}",
            'ken_burns': f"zoompan=z='1+0.08*in/{total_frames}':x='iw/4+iw/6*in/{total_frames}':y='ih/4':d={total_frames}:s={width}x{height}:fps={fps}",
            'subtle_motion': f"zoompan=z='1+0.02*sin(2*PI*in/{total_frames})':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d={total_frames}:s={width}x{height}:fps={fps}",
            'none': f"scale={width}:{height}:force_original_aspect_ratio=decrease,pad={width}:{height}:(ow-iw)/2:(oh-ih)/2",
        }

        zoom_filter = effects.get(effect, effects['ken_burns'])

        # Add fade effects
        fade_filter = f"fade=t=in:st=0:d={fade_in},fade=t=out:st={duration-fade_out}:d={fade_out}"
        vf = f"{zoom_filter},{fade_filter}"

        # Output path
        output_dir = Path('/Volumes/DATI-SSD/onde-ai/corde/outputs/videos')
        output_dir.mkdir(parents=True, exist_ok=True)
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        output_path = output_dir / f'ffmpeg_{timestamp}.mp4'

        self.log_progress(30, 'Running FFmpeg...')

        # Build command with optional HW acceleration
        cmd = ['ffmpeg', '-y']

        if use_hw:
            # Use VideoToolbox for encoding (Apple Silicon)
            encoder = 'h264_videotoolbox'
            quality_opts = ['-q:v', '65']  # Quality for VideoToolbox
        else:
            encoder = 'libx264'
            quality_opts = ['-crf', '23', '-preset', 'medium']

        cmd.extend([
            '-loop', '1',
            '-i', input_path,
            '-vf', vf,
            '-c:v', encoder,
            *quality_opts,
            '-t', str(duration),
            '-pix_fmt', 'yuv420p',
        ])

        # Add audio if provided
        if audio_path and Path(audio_path).exists():
            cmd.extend(['-i', audio_path, '-c:a', 'aac', '-shortest'])

        cmd.append(str(output_path))

        try:
            result = subprocess.run(cmd, check=True, capture_output=True, text=True)
        except subprocess.CalledProcessError as e:
            self.log_progress(100, f'FFmpeg error: {e.stderr}')
            raise RuntimeError(f"FFmpeg failed: {e.stderr}")

        self.log_progress(100, f'Done: {output_path.name}')

        self.outputs = {
            'video_path': str(output_path),
            'duration': duration,
        }
        return self.outputs


class VideoConcatNode(BaseNode):
    """Concatenate multiple videos"""

    NODE_ID = "video_concat"
    NODE_NAME = "Video Concat"
    NODE_CATEGORY = "video"
    NODE_DESCRIPTION = "Concatenate multiple videos into one"

    INPUTS = {
        'video_paths': {'type': 'list', 'required': True, 'description': 'List of video paths'},
        'transition': {'type': 'string', 'required': False, 'default': 'none',
                       'options': ['none', 'fade', 'dissolve']},
        'transition_duration': {'type': 'float', 'required': False, 'default': 0.5},
    }

    OUTPUTS = {
        'video_path': {'type': 'string'},
        'duration': {'type': 'float'},
    }

    def execute(self) -> Dict[str, Any]:
        video_paths = self.inputs['video_paths']
        transition = self.inputs.get('transition', 'none')
        trans_dur = self.inputs.get('transition_duration', 0.5)

        if not video_paths:
            raise ValueError("No videos to concatenate")

        self.log_progress(10, f'Concatenating {len(video_paths)} videos...')

        # Create concat file
        output_dir = Path('/Volumes/DATI-SSD/onde-ai/corde/outputs/videos')
        output_dir.mkdir(parents=True, exist_ok=True)
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')

        with tempfile.NamedTemporaryFile(mode='w', suffix='.txt', delete=False) as f:
            for path in video_paths:
                f.write(f"file '{path}'\n")
            concat_file = f.name

        output_path = output_dir / f'concat_{timestamp}.mp4'

        self.log_progress(50, 'Running FFmpeg concat...')

        cmd = [
            'ffmpeg', '-y',
            '-f', 'concat',
            '-safe', '0',
            '-i', concat_file,
            '-c:v', 'h264_videotoolbox',
            '-q:v', '65',
            '-c:a', 'aac',
            str(output_path)
        ]

        try:
            subprocess.run(cmd, check=True, capture_output=True)
        finally:
            os.unlink(concat_file)

        # Get duration
        probe_cmd = ['ffprobe', '-v', 'error', '-show_entries', 'format=duration',
                     '-of', 'default=noprint_wrappers=1:nokey=1', str(output_path)]
        result = subprocess.run(probe_cmd, capture_output=True, text=True)
        duration = float(result.stdout.strip())

        self.log_progress(100, f'Done: {output_path.name}')

        self.outputs = {
            'video_path': str(output_path),
            'duration': duration,
        }
        return self.outputs


# Node registry
VIDEO_NODES = {
    'ltx_video': LTXVideoNode,
    'ffmpeg_v2': FFmpegNodeV2,
    'video_concat': VideoConcatNode,
}
