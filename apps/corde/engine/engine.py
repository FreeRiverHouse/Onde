#!/usr/bin/env python3
"""
CORDE Engine - Python ML Backend
Content ORchestration & Digital Experience

Executes generation pipelines using:
- SDXL + IP-Adapter for images
- LTX-Video 2 / SVD for video
- FFmpeg for assembly

Usage:
    python engine.py --job '{"type": "video", "params": {...}}'
    python engine.py --test
"""

import argparse
import json
import os
import sys
from pathlib import Path
from datetime import datetime

# ═══════════════════════════════════════════════════════════
# CONFIGURATION
# ═══════════════════════════════════════════════════════════

CONFIG = {
    'output_path': os.environ.get('CORDE_OUTPUT', './outputs'),
    'models_path': os.environ.get('CORDE_MODELS', '/Volumes/DATI-SSD/onde-ai/corde/models'),
    'device': 'mps',  # Apple Silicon
}

# ═══════════════════════════════════════════════════════════
# LOGGING (JSON for API communication)
# ═══════════════════════════════════════════════════════════

def log_progress(progress: int, message: str = None):
    """Send progress to API via stdout JSON"""
    output = {'progress': progress}
    if message:
        output['message'] = message
    print(json.dumps(output), flush=True)

def log_status(status: str):
    """Send status update to API"""
    print(json.dumps({'status': status}), flush=True)

def log_output(output_path: str, metadata: dict = None):
    """Send completion with output path"""
    result = {'output': output_path, 'status': 'completed'}
    if metadata:
        result['metadata'] = metadata
    print(json.dumps(result), flush=True)

def log_error(error: str):
    """Send error to API"""
    print(json.dumps({'status': 'failed', 'error': error}), flush=True)

# ═══════════════════════════════════════════════════════════
# MODEL LOADING (Lazy)
# ═══════════════════════════════════════════════════════════

_models = {}

def get_sdxl_pipeline():
    """Load SDXL pipeline (lazy)"""
    if 'sdxl' not in _models:
        log_progress(5, 'Loading SDXL model...')
        try:
            from diffusers import StableDiffusionXLPipeline
            import torch

            model_path = Path(CONFIG['models_path']) / 'sdxl' / 'sdxl-base-1.0.safetensors'

            if not model_path.exists():
                # Fallback to HuggingFace
                log_progress(10, 'Downloading SDXL from HuggingFace...')
                _models['sdxl'] = StableDiffusionXLPipeline.from_pretrained(
                    "stabilityai/stable-diffusion-xl-base-1.0",
                    torch_dtype=torch.float16,
                    variant="fp16",
                    use_safetensors=True
                ).to(CONFIG['device'])
            else:
                _models['sdxl'] = StableDiffusionXLPipeline.from_single_file(
                    str(model_path),
                    torch_dtype=torch.float16,
                ).to(CONFIG['device'])

            log_progress(20, 'SDXL loaded')
        except Exception as e:
            log_error(f'Failed to load SDXL: {str(e)}')
            raise

    return _models['sdxl']

def get_ip_adapter():
    """Load IP-Adapter for character consistency"""
    if 'ip_adapter' not in _models:
        log_progress(15, 'Loading IP-Adapter...')
        try:
            # IP-Adapter loading will be implemented
            # For now, return None (feature not ready)
            _models['ip_adapter'] = None
            log_progress(20, 'IP-Adapter ready (placeholder)')
        except Exception as e:
            log_error(f'Failed to load IP-Adapter: {str(e)}')
            raise

    return _models['ip_adapter']

# ═══════════════════════════════════════════════════════════
# GENERATION FUNCTIONS
# ═══════════════════════════════════════════════════════════

def generate_image(params: dict) -> str:
    """Generate single image with SDXL"""
    log_progress(0, 'Starting image generation...')

    prompt = params.get('prompt', '')
    negative_prompt = params.get('negative_prompt', '')
    width = params.get('width', 1024)
    height = params.get('height', 1024)
    steps = params.get('steps', 20)
    seed = params.get('seed', -1)

    # Get author style if specified
    author = params.get('author', {})
    if author:
        base_prompt = author.get('prompts', {}).get('base', '')
        if base_prompt:
            prompt = f"{prompt}, {base_prompt}"
        neg = author.get('prompts', {}).get('negative', '')
        if neg:
            negative_prompt = f"{negative_prompt}, {neg}" if negative_prompt else neg

    log_progress(10, f'Prompt: {prompt[:50]}...')

    try:
        import torch

        pipe = get_sdxl_pipeline()

        generator = None
        if seed >= 0:
            generator = torch.Generator(device=CONFIG['device']).manual_seed(seed)

        log_progress(30, 'Generating...')

        image = pipe(
            prompt=prompt,
            negative_prompt=negative_prompt,
            width=width,
            height=height,
            num_inference_steps=steps,
            generator=generator,
        ).images[0]

        log_progress(90, 'Saving...')

        # Save output
        output_dir = Path(CONFIG['output_path']) / 'images'
        output_dir.mkdir(parents=True, exist_ok=True)

        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        output_path = output_dir / f'corde_{timestamp}.png'
        image.save(str(output_path))

        log_output(str(output_path), {
            'width': width,
            'height': height,
            'steps': steps,
            'seed': seed,
        })

        return str(output_path)

    except Exception as e:
        log_error(f'Image generation failed: {str(e)}')
        raise

def generate_video_from_image(params: dict) -> str:
    """Generate video from image using SVD"""
    log_progress(0, 'Starting video generation...')

    source_image = params.get('source_image')
    duration = params.get('duration', 5)
    fps = params.get('fps', 24)

    if not source_image:
        log_error('source_image required')
        return None

    log_progress(10, f'Source: {source_image}')

    try:
        # SVD implementation will go here
        # For now, use FFmpeg Ken Burns as fallback
        log_progress(20, 'Using FFmpeg Ken Burns fallback...')

        import subprocess

        output_dir = Path(CONFIG['output_path']) / 'videos'
        output_dir.mkdir(parents=True, exist_ok=True)

        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        output_path = output_dir / f'corde_video_{timestamp}.mp4'

        # Ken Burns zoom effect
        total_frames = duration * fps
        cmd = [
            'ffmpeg', '-y',
            '-loop', '1',
            '-i', source_image,
            '-vf', f"zoompan=z='1+0.1*in/{total_frames}':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d={total_frames}:s=1080x1920:fps={fps},fade=t=in:st=0:d=0.5,fade=t=out:st={duration-0.5}:d=0.5",
            '-c:v', 'libx264',
            '-t', str(duration),
            '-pix_fmt', 'yuv420p',
            str(output_path)
        ]

        log_progress(50, 'Running FFmpeg...')

        subprocess.run(cmd, check=True, capture_output=True)

        log_output(str(output_path), {
            'duration': duration,
            'fps': fps,
            'source': source_image,
        })

        return str(output_path)

    except Exception as e:
        log_error(f'Video generation failed: {str(e)}')
        raise

def generate_video_poesia(params: dict) -> str:
    """Generate complete video poesia"""
    log_progress(0, 'Starting Video Poesia pipeline...')

    poem_text = params.get('poem_text', '')
    style = params.get('style', 'onde-watercolor')
    mood = params.get('mood', 'serene')
    duration = params.get('duration', 60)

    if not poem_text:
        log_error('poem_text required')
        return None

    # TODO: Full pipeline
    # 1. Parse poem into stanzas
    # 2. Generate illustration for each stanza
    # 3. Generate video from each illustration
    # 4. Add TTS narration
    # 5. Assemble final video

    log_progress(10, 'Parsing poem...')
    stanzas = poem_text.strip().split('\n\n')
    log_progress(20, f'Found {len(stanzas)} stanzas')

    # For MVP, just generate one image
    log_progress(30, 'Generating illustration...')

    image_params = {
        'prompt': f'{stanzas[0]}, {mood} mood, poetry illustration',
        'author': params.get('author', {}),
        'width': 1080,
        'height': 1920,
    }

    image_path = generate_image(image_params)

    log_progress(70, 'Creating video...')

    video_params = {
        'source_image': image_path,
        'duration': min(duration, 30),  # Cap for MVP
        'fps': 24,
    }

    video_path = generate_video_from_image(video_params)

    return video_path

# ═══════════════════════════════════════════════════════════
# JOB DISPATCHER
# ═══════════════════════════════════════════════════════════

def execute_job(job: dict):
    """Execute a job based on type"""
    job_type = job.get('type')
    params = job.get('params', {})

    log_status('running')

    try:
        if job_type == 'image':
            return generate_image(params)
        elif job_type == 'video':
            template = params.get('template', '')
            if template == 'video-poesia':
                return generate_video_poesia(params)
            else:
                return generate_video_from_image(params)
        elif job_type == 'book':
            log_error('Book generation not implemented yet')
            return None
        elif job_type == 'workflow':
            log_error('Custom workflow not implemented yet')
            return None
        else:
            log_error(f'Unknown job type: {job_type}')
            return None

    except Exception as e:
        log_error(str(e))
        return None

# ═══════════════════════════════════════════════════════════
# TEST MODE
# ═══════════════════════════════════════════════════════════

def run_test():
    """Run a simple test"""
    print("CORDE Engine Test Mode")
    print("=" * 50)
    print(f"Output path: {CONFIG['output_path']}")
    print(f"Models path: {CONFIG['models_path']}")
    print(f"Device: {CONFIG['device']}")
    print()

    # Check PyTorch
    try:
        import torch
        print(f"PyTorch version: {torch.__version__}")
        print(f"MPS available: {torch.backends.mps.is_available()}")
    except ImportError:
        print("PyTorch not installed")

    # Check diffusers
    try:
        import diffusers
        print(f"Diffusers version: {diffusers.__version__}")
    except ImportError:
        print("Diffusers not installed")

    # Check FFmpeg
    import subprocess
    try:
        result = subprocess.run(['ffmpeg', '-version'], capture_output=True, text=True)
        version_line = result.stdout.split('\n')[0]
        print(f"FFmpeg: {version_line}")
    except FileNotFoundError:
        print("FFmpeg not installed")

    print()
    print("Test complete!")

# ═══════════════════════════════════════════════════════════
# MAIN
# ═══════════════════════════════════════════════════════════

def main():
    parser = argparse.ArgumentParser(description='CORDE Engine')
    parser.add_argument('--job', type=str, help='Job JSON')
    parser.add_argument('--test', action='store_true', help='Run test mode')

    args = parser.parse_args()

    if args.test:
        run_test()
        return

    if args.job:
        try:
            job = json.loads(args.job)
            execute_job(job)
        except json.JSONDecodeError as e:
            log_error(f'Invalid job JSON: {str(e)}')
            sys.exit(1)
    else:
        print("Usage: python engine.py --job '{...}' or --test")
        sys.exit(1)

if __name__ == '__main__':
    main()
