"""
Image Generation Nodes
SDXL, IP-Adapter, etc.
"""

from typing import Dict, Any, Optional
from pathlib import Path
from datetime import datetime
from .base import BaseNode

# Lazy imports for heavy libraries
_sdxl_pipe = None
_ip_adapter = None


class SDXLNode(BaseNode):
    """Generate image with SDXL"""

    NODE_ID = "sdxl"
    NODE_NAME = "SDXL Generate"
    NODE_CATEGORY = "image"
    NODE_DESCRIPTION = "Generate image using Stable Diffusion XL"

    INPUTS = {
        'prompt': {'type': 'string', 'required': True, 'description': 'Text prompt'},
        'negative_prompt': {'type': 'string', 'required': False, 'default': ''},
        'width': {'type': 'int', 'required': False, 'default': 1024, 'min': 512, 'max': 2048},
        'height': {'type': 'int', 'required': False, 'default': 1024, 'min': 512, 'max': 2048},
        'steps': {'type': 'int', 'required': False, 'default': 20, 'min': 1, 'max': 100},
        'cfg_scale': {'type': 'float', 'required': False, 'default': 7.5, 'min': 1, 'max': 20},
        'seed': {'type': 'int', 'required': False, 'default': -1},
        'author_style': {'type': 'object', 'required': False, 'description': 'Author style prompts'},
    }

    OUTPUTS = {
        'image': {'type': 'image', 'description': 'Generated image'},
        'image_path': {'type': 'string', 'description': 'Path to saved image'},
        'seed_used': {'type': 'int', 'description': 'Seed that was used'},
    }

    def _load_pipeline(self):
        """Lazy load SDXL pipeline"""
        global _sdxl_pipe

        if _sdxl_pipe is None:
            self.log_progress(5, 'Loading SDXL...')

            import torch
            from diffusers import StableDiffusionXLPipeline

            _sdxl_pipe = StableDiffusionXLPipeline.from_pretrained(
                "stabilityai/stable-diffusion-xl-base-1.0",
                torch_dtype=torch.float16,
                variant="fp16",
                use_safetensors=True
            )

            # Use MPS on Mac
            if torch.backends.mps.is_available():
                _sdxl_pipe = _sdxl_pipe.to("mps")
            else:
                _sdxl_pipe = _sdxl_pipe.to("cuda" if torch.cuda.is_available() else "cpu")

            self.log_progress(20, 'SDXL loaded')

        return _sdxl_pipe

    def execute(self) -> Dict[str, Any]:
        """Execute SDXL generation"""
        import torch

        errors = self.validate_inputs()
        if errors:
            raise ValueError(", ".join(errors))

        prompt = self.inputs['prompt']
        negative_prompt = self.inputs.get('negative_prompt', '')
        width = self.inputs.get('width', 1024)
        height = self.inputs.get('height', 1024)
        steps = self.inputs.get('steps', 20)
        cfg_scale = self.inputs.get('cfg_scale', 7.5)
        seed = self.inputs.get('seed', -1)

        # Apply author style
        author_style = self.inputs.get('author_style', {})
        if author_style:
            base = author_style.get('prompts', {}).get('base', '')
            neg = author_style.get('prompts', {}).get('negative', '')
            if base:
                prompt = f"{prompt}, {base}"
            if neg:
                negative_prompt = f"{negative_prompt}, {neg}" if negative_prompt else neg

        self.log_progress(10, f'Generating: {prompt[:50]}...')

        pipe = self._load_pipeline()

        # Handle seed
        generator = None
        if seed >= 0:
            device = "mps" if torch.backends.mps.is_available() else "cuda" if torch.cuda.is_available() else "cpu"
            generator = torch.Generator(device=device).manual_seed(seed)
            seed_used = seed
        else:
            seed_used = torch.randint(0, 2**32, (1,)).item()

        self.log_progress(30, 'Running inference...')

        result = pipe(
            prompt=prompt,
            negative_prompt=negative_prompt,
            width=width,
            height=height,
            num_inference_steps=steps,
            guidance_scale=cfg_scale,
            generator=generator,
        )

        image = result.images[0]

        self.log_progress(90, 'Saving...')

        # Save image
        output_dir = Path('./outputs/images')
        output_dir.mkdir(parents=True, exist_ok=True)
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        output_path = output_dir / f'sdxl_{timestamp}.png'
        image.save(str(output_path))

        self.outputs = {
            'image': image,
            'image_path': str(output_path),
            'seed_used': seed_used,
        }

        self.log_progress(100, 'Done')
        return self.outputs


class IPAdapterNode(BaseNode):
    """Apply IP-Adapter for character consistency"""

    NODE_ID = "ip_adapter"
    NODE_NAME = "IP-Adapter"
    NODE_CATEGORY = "image"
    NODE_DESCRIPTION = "Apply reference image for character consistency"

    INPUTS = {
        'reference_image': {'type': 'image', 'required': True, 'description': 'Reference image'},
        'prompt': {'type': 'string', 'required': True},
        'strength': {'type': 'float', 'required': False, 'default': 0.8, 'min': 0, 'max': 1},
        'width': {'type': 'int', 'required': False, 'default': 1024},
        'height': {'type': 'int', 'required': False, 'default': 1024},
    }

    OUTPUTS = {
        'image': {'type': 'image'},
        'image_path': {'type': 'string'},
    }

    def execute(self) -> Dict[str, Any]:
        """Execute IP-Adapter generation"""
        # TODO: Implement IP-Adapter
        # For now, return placeholder
        self.log_progress(0, 'IP-Adapter not yet implemented')
        self.log_progress(100, 'Placeholder complete')

        self.outputs = {
            'image': None,
            'image_path': None,
        }
        return self.outputs


class LoadImageNode(BaseNode):
    """Load image from file"""

    NODE_ID = "load_image"
    NODE_NAME = "Load Image"
    NODE_CATEGORY = "input"
    NODE_DESCRIPTION = "Load image from file path"

    INPUTS = {
        'path': {'type': 'string', 'required': True, 'description': 'Image file path'},
    }

    OUTPUTS = {
        'image': {'type': 'image'},
        'width': {'type': 'int'},
        'height': {'type': 'int'},
    }

    def execute(self) -> Dict[str, Any]:
        from PIL import Image

        path = self.inputs['path']
        self.log_progress(50, f'Loading {path}...')

        image = Image.open(path)

        self.outputs = {
            'image': image,
            'width': image.width,
            'height': image.height,
        }

        self.log_progress(100, 'Loaded')
        return self.outputs
