"""
CORDE Image Nodes v2 - Optimized for Apple Silicon M4 Pro
Open Source models only (no HF login required)

Models:
- PixArt-Sigma: High quality, 1024x1024
- SDXL Turbo: Fast, 4 steps
- SD 3.5: Coming soon
"""

import os
from typing import Dict, Any, Optional
from pathlib import Path
from datetime import datetime
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


class PixArtNode(BaseNode):
    """PixArt-Sigma - High quality image generation

    Open source, no login required.
    Excellent for detailed illustrations.
    """

    NODE_ID = "pixart"
    NODE_NAME = "PixArt Sigma"
    NODE_CATEGORY = "image"
    NODE_DESCRIPTION = "Generate high-quality images with PixArt-Sigma (open source)"

    INPUTS = {
        'prompt': {'type': 'string', 'required': True},
        'negative_prompt': {'type': 'string', 'required': False, 'default': ''},
        'width': {'type': 'int', 'required': False, 'default': 1024, 'options': [512, 768, 1024]},
        'height': {'type': 'int', 'required': False, 'default': 1024, 'options': [512, 768, 1024]},
        'steps': {'type': 'int', 'required': False, 'default': 20, 'min': 10, 'max': 50},
        'guidance_scale': {'type': 'float', 'required': False, 'default': 4.5},
        'seed': {'type': 'int', 'required': False, 'default': -1},
        'style_preset': {'type': 'string', 'required': False, 'default': 'onde',
                        'options': ['onde', 'watercolor', 'digital', 'photo', 'none']},
    }

    OUTPUTS = {
        'image': {'type': 'image'},
        'image_path': {'type': 'string'},
        'seed_used': {'type': 'int'},
    }

    # Style presets
    STYLE_PRESETS = {
        'onde': 'European watercolor childrens book illustration, soft brushstrokes, warm golden light, elegant refined, Beatrix Potter style',
        'watercolor': 'delicate watercolor painting, soft edges, artistic, traditional media',
        'digital': 'digital art, clean lines, vibrant colors, professional illustration',
        'photo': 'photorealistic, high detail, professional photography',
        'none': '',
    }

    NEGATIVE_PRESETS = {
        'onde': 'Pixar, 3D, Disney, cartoon, American style, plastic, bright saturated colors, rosy cheeks, anime, manga',
        'watercolor': '3D render, photo, digital art',
        'digital': 'blurry, low quality, bad anatomy',
        'photo': 'cartoon, illustration, painting, drawing',
        'none': '',
    }

    def _load_pipeline(self):
        """Lazy load PixArt pipeline"""
        global _pipelines

        if 'pixart' not in _pipelines:
            self.log_progress(5, 'Loading PixArt-Sigma...')

            import torch
            from diffusers import PixArtSigmaPipeline

            _pipelines['pixart'] = PixArtSigmaPipeline.from_pretrained(
                "PixArt-alpha/PixArt-Sigma-XL-2-1024-MS",
                torch_dtype=torch.float16,
                use_safetensors=True,
            )

            # Move to MPS
            _pipelines['pixart'] = _pipelines['pixart'].to("mps")

            # Memory optimizations
            _pipelines['pixart'].enable_attention_slicing("max")

            # Use float32 for VAE to prevent black images
            _pipelines['pixart'].vae = _pipelines['pixart'].vae.to(dtype=torch.float32)

            self.log_progress(20, 'PixArt loaded')

        return _pipelines['pixart']

    def execute(self) -> Dict[str, Any]:
        import torch

        errors = self.validate_inputs()
        if errors:
            raise ValueError(", ".join(errors))

        prompt = self.inputs['prompt']
        negative_prompt = self.inputs.get('negative_prompt', '')
        width = self.inputs.get('width', 1024)
        height = self.inputs.get('height', 1024)
        steps = self.inputs.get('steps', 20)
        guidance = self.inputs.get('guidance_scale', 4.5)
        seed = self.inputs.get('seed', -1)
        style = self.inputs.get('style_preset', 'onde')

        # Apply style preset
        style_suffix = self.STYLE_PRESETS.get(style, '')
        neg_suffix = self.NEGATIVE_PRESETS.get(style, '')

        if style_suffix:
            prompt = f"{prompt}, {style_suffix}"
        if neg_suffix:
            negative_prompt = f"{negative_prompt}, {neg_suffix}" if negative_prompt else neg_suffix

        self.log_progress(10, f'Generating: {prompt[:60]}...')

        clear_memory()
        pipe = self._load_pipeline()

        # Handle seed
        generator = None
        if seed >= 0:
            generator = torch.Generator(device="mps").manual_seed(seed)
            seed_used = seed
        else:
            seed_used = torch.randint(0, 2**32, (1,)).item()
            generator = torch.Generator(device="mps").manual_seed(seed_used)

        self.log_progress(30, 'Running inference...')

        with torch.no_grad():
            result = pipe(
                prompt=prompt,
                negative_prompt=negative_prompt,
                width=width,
                height=height,
                num_inference_steps=steps,
                guidance_scale=guidance,
                generator=generator,
            )

        image = result.images[0]
        clear_memory()

        # Verify image is valid
        extrema = image.convert("L").getextrema()
        if extrema == (0, 0):
            self.log_progress(100, 'ERROR: Black image - memory issue')
            raise RuntimeError("Generated black image - try lower resolution")

        self.log_progress(90, 'Saving...')

        # Save
        output_dir = Path('/Volumes/DATI-SSD/onde-ai/corde/outputs/images')
        output_dir.mkdir(parents=True, exist_ok=True)
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        output_path = output_dir / f'pixart_{timestamp}.png'
        image.save(str(output_path))

        self.outputs = {
            'image': image,
            'image_path': str(output_path),
            'seed_used': seed_used,
        }

        self.log_progress(100, f'Done: {output_path.name}')
        return self.outputs


class SDXLTurboNode(BaseNode):
    """SDXL Turbo - Fast image generation (4 steps)

    Open source, no login required.
    Very fast but lower quality than PixArt.
    """

    NODE_ID = "sdxl_turbo"
    NODE_NAME = "SDXL Turbo"
    NODE_CATEGORY = "image"
    NODE_DESCRIPTION = "Fast image generation with SDXL Turbo (4 steps)"

    INPUTS = {
        'prompt': {'type': 'string', 'required': True},
        'width': {'type': 'int', 'required': False, 'default': 512, 'options': [512]},
        'height': {'type': 'int', 'required': False, 'default': 512, 'options': [512]},
        'steps': {'type': 'int', 'required': False, 'default': 4, 'min': 1, 'max': 8},
        'guidance_scale': {'type': 'float', 'required': False, 'default': 0.0},
        'seed': {'type': 'int', 'required': False, 'default': -1},
    }

    OUTPUTS = {
        'image': {'type': 'image'},
        'image_path': {'type': 'string'},
        'seed_used': {'type': 'int'},
    }

    def _load_pipeline(self):
        global _pipelines

        if 'sdxl_turbo' not in _pipelines:
            self.log_progress(5, 'Loading SDXL Turbo...')

            import torch
            from diffusers import AutoPipelineForText2Image

            # Load in float32 first, then optimize specific components
            _pipelines['sdxl_turbo'] = AutoPipelineForText2Image.from_pretrained(
                "stabilityai/sdxl-turbo",
                torch_dtype=torch.float32,  # Full precision for MPS stability
            )

            _pipelines['sdxl_turbo'] = _pipelines['sdxl_turbo'].to("mps")
            _pipelines['sdxl_turbo'].enable_attention_slicing("max")

            self.log_progress(20, 'SDXL Turbo loaded')

        return _pipelines['sdxl_turbo']

    def execute(self) -> Dict[str, Any]:
        import torch

        prompt = self.inputs['prompt']
        width = self.inputs.get('width', 512)
        height = self.inputs.get('height', 512)
        steps = self.inputs.get('steps', 4)
        guidance = self.inputs.get('guidance_scale', 0.0)
        seed = self.inputs.get('seed', -1)

        self.log_progress(10, f'Fast generating: {prompt[:60]}...')

        clear_memory()
        pipe = self._load_pipeline()

        generator = None
        if seed >= 0:
            generator = torch.Generator(device="mps").manual_seed(seed)
            seed_used = seed
        else:
            seed_used = torch.randint(0, 2**32, (1,)).item()
            generator = torch.Generator(device="mps").manual_seed(seed_used)

        self.log_progress(30, 'Running inference...')

        with torch.no_grad():
            result = pipe(
                prompt=prompt,
                width=width,
                height=height,
                num_inference_steps=steps,
                guidance_scale=guidance,
                generator=generator,
            )

        image = result.images[0]
        clear_memory()

        self.log_progress(90, 'Saving...')

        output_dir = Path('/Volumes/DATI-SSD/onde-ai/corde/outputs/images')
        output_dir.mkdir(parents=True, exist_ok=True)
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        output_path = output_dir / f'turbo_{timestamp}.png'
        image.save(str(output_path))

        self.outputs = {
            'image': image,
            'image_path': str(output_path),
            'seed_used': seed_used,
        }

        self.log_progress(100, f'Done: {output_path.name}')
        return self.outputs


# Node registry
IMAGE_NODES = {
    'pixart': PixArtNode,
    'sdxl_turbo': SDXLTurboNode,
}
