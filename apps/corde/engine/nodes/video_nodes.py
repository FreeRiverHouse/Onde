"""
Video Generation Nodes
SVD, AnimateDiff, FFmpeg, LTX-Video
"""

from typing import Dict, Any
from pathlib import Path
from datetime import datetime
import subprocess
from .base import BaseNode


class FFmpegNode(BaseNode):
    """Video processing with FFmpeg"""

    NODE_ID = "ffmpeg"
    NODE_NAME = "FFmpeg Process"
    NODE_CATEGORY = "video"
    NODE_DESCRIPTION = "Process video with FFmpeg"

    INPUTS = {
        'input_path': {'type': 'string', 'required': True},
        'effect': {'type': 'string', 'required': False, 'default': 'none',
                   'options': ['none', 'zoom_in', 'zoom_out', 'pan_left', 'pan_right', 'ken_burns']},
        'duration': {'type': 'float', 'required': False, 'default': 5.0},
        'fps': {'type': 'int', 'required': False, 'default': 24},
        'resolution': {'type': 'string', 'required': False, 'default': '1080x1920'},
        'fade_in': {'type': 'float', 'required': False, 'default': 0.5},
        'fade_out': {'type': 'float', 'required': False, 'default': 0.5},
    }

    OUTPUTS = {
        'video_path': {'type': 'string'},
        'duration': {'type': 'float'},
    }

    def execute(self) -> Dict[str, Any]:
        input_path = self.inputs['input_path']
        effect = self.inputs.get('effect', 'ken_burns')
        duration = self.inputs.get('duration', 5.0)
        fps = self.inputs.get('fps', 24)
        resolution = self.inputs.get('resolution', '1080x1920')
        fade_in = self.inputs.get('fade_in', 0.5)
        fade_out = self.inputs.get('fade_out', 0.5)

        self.log_progress(10, f'Processing with effect: {effect}')

        # Parse resolution
        width, height = map(int, resolution.split('x'))
        total_frames = int(duration * fps)

        # Build filter based on effect
        if effect == 'zoom_in':
            zoom_filter = f"zoompan=z='1+0.1*in/{total_frames}':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d={total_frames}:s={width}x{height}:fps={fps}"
        elif effect == 'zoom_out':
            zoom_filter = f"zoompan=z='1.1-0.1*in/{total_frames}':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d={total_frames}:s={width}x{height}:fps={fps}"
        elif effect == 'pan_left':
            zoom_filter = f"zoompan=z='1':x='iw*in/{total_frames}':y='0':d={total_frames}:s={width}x{height}:fps={fps}"
        elif effect == 'pan_right':
            zoom_filter = f"zoompan=z='1':x='iw-iw*in/{total_frames}':y='0':d={total_frames}:s={width}x{height}:fps={fps}"
        elif effect == 'ken_burns':
            # Subtle zoom + pan
            zoom_filter = f"zoompan=z='1+0.05*in/{total_frames}':x='iw/4+iw/4*in/{total_frames}':y='ih/4':d={total_frames}:s={width}x{height}:fps={fps}"
        else:
            zoom_filter = f"scale={width}:{height}:force_original_aspect_ratio=decrease,pad={width}:{height}:(ow-iw)/2:(oh-ih)/2"

        # Add fade effects
        fade_filter = f"fade=t=in:st=0:d={fade_in},fade=t=out:st={duration-fade_out}:d={fade_out}"
        vf = f"{zoom_filter},{fade_filter}"

        # Output path
        output_dir = Path('./outputs/videos')
        output_dir.mkdir(parents=True, exist_ok=True)
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        output_path = output_dir / f'ffmpeg_{timestamp}.mp4'

        self.log_progress(30, 'Running FFmpeg...')

        cmd = [
            'ffmpeg', '-y',
            '-loop', '1',
            '-i', input_path,
            '-vf', vf,
            '-c:v', 'libx264',
            '-t', str(duration),
            '-pix_fmt', 'yuv420p',
            '-preset', 'medium',
            '-crf', '23',
            str(output_path)
        ]

        try:
            subprocess.run(cmd, check=True, capture_output=True)
        except subprocess.CalledProcessError as e:
            self.log_progress(100, f'FFmpeg error: {e.stderr.decode()}')
            raise

        self.log_progress(100, 'Done')

        self.outputs = {
            'video_path': str(output_path),
            'duration': duration,
        }
        return self.outputs


class SVDNode(BaseNode):
    """Stable Video Diffusion - Image to Video"""

    NODE_ID = "svd"
    NODE_NAME = "Stable Video Diffusion"
    NODE_CATEGORY = "video"
    NODE_DESCRIPTION = "Generate video from image using SVD"

    INPUTS = {
        'image': {'type': 'image', 'required': True},
        'motion_bucket_id': {'type': 'int', 'required': False, 'default': 127, 'min': 1, 'max': 255},
        'fps': {'type': 'int', 'required': False, 'default': 7},
        'num_frames': {'type': 'int', 'required': False, 'default': 25},
    }

    OUTPUTS = {
        'video_path': {'type': 'string'},
        'frames': {'type': 'list'},
    }

    def execute(self) -> Dict[str, Any]:
        # TODO: Implement SVD
        self.log_progress(0, 'SVD not yet implemented - using FFmpeg fallback')

        # Fallback to FFmpeg
        from PIL import Image
        import tempfile

        image = self.inputs['image']

        # Save temp image
        with tempfile.NamedTemporaryFile(suffix='.png', delete=False) as f:
            if isinstance(image, Image.Image):
                image.save(f.name)
            temp_path = f.name

        # Use FFmpeg node
        ffmpeg = FFmpegNode()
        ffmpeg.set_input('input_path', temp_path)
        ffmpeg.set_input('effect', 'ken_burns')
        ffmpeg.set_input('duration', 4.0)
        result = ffmpeg.execute()

        self.outputs = {
            'video_path': result['video_path'],
            'frames': [],
        }

        self.log_progress(100, 'Done (FFmpeg fallback)')
        return self.outputs


class AnimateDiffNode(BaseNode):
    """AnimateDiff for infinite loops"""

    NODE_ID = "animatediff"
    NODE_NAME = "AnimateDiff"
    NODE_CATEGORY = "video"
    NODE_DESCRIPTION = "Generate looping animation"

    INPUTS = {
        'image': {'type': 'image', 'required': True},
        'prompt': {'type': 'string', 'required': False},
        'motion_module': {'type': 'string', 'required': False, 'default': 'mm_sd_v15_v2'},
        'num_frames': {'type': 'int', 'required': False, 'default': 16},
    }

    OUTPUTS = {
        'video_path': {'type': 'string'},
        'gif_path': {'type': 'string'},
    }

    def execute(self) -> Dict[str, Any]:
        # TODO: Implement AnimateDiff
        self.log_progress(0, 'AnimateDiff not yet implemented')
        self.log_progress(100, 'Placeholder complete')

        self.outputs = {
            'video_path': None,
            'gif_path': None,
        }
        return self.outputs


class LTXVideoNode(BaseNode):
    """LTX-Video 2 (Lightricks)"""

    NODE_ID = "ltx_video"
    NODE_NAME = "LTX Video 2"
    NODE_CATEGORY = "video"
    NODE_DESCRIPTION = "Generate video with LTX-Video 2"

    INPUTS = {
        'prompt': {'type': 'string', 'required': True},
        'image': {'type': 'image', 'required': False, 'description': 'Optional reference image'},
        'duration': {'type': 'float', 'required': False, 'default': 5.0},
        'fps': {'type': 'int', 'required': False, 'default': 24},
    }

    OUTPUTS = {
        'video_path': {'type': 'string'},
    }

    def execute(self) -> Dict[str, Any]:
        # TODO: Implement LTX-Video 2 when MLX port is ready
        self.log_progress(0, 'LTX-Video 2 not yet implemented')
        self.log_progress(100, 'Placeholder complete')

        self.outputs = {
            'video_path': None,
        }
        return self.outputs
