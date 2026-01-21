#!/usr/bin/env python3
"""
CORDE Book Generator
Generates illustrations for children's books using SDXL with IP-Adapter

Features:
- Character consistency via IP-Adapter reference images
- MPS (Apple Silicon) optimized
- Memory-efficient component loading

Usage:
    python generate_book.py --book milo-ai --reference ~/Downloads/master-milo.png
"""

import os
import sys
import json
import argparse
from pathlib import Path
from datetime import datetime

# Set cache directory to SSD
os.environ['HF_HOME'] = '/Volumes/DATI-SSD/onde-ai/corde/cache'
os.environ['TORCH_HOME'] = '/Volumes/DATI-SSD/onde-ai/corde/cache'
# Allow MPS to use more memory (may cause system instability)
os.environ['PYTORCH_MPS_HIGH_WATERMARK_RATIO'] = '0.0'

import torch
import gc
from diffusers import StableDiffusionXLPipeline, DPMSolverMultistepScheduler
from PIL import Image

# Global reference for IP-Adapter
REFERENCE_IMAGE = None
IP_ADAPTER_SCALE = 0.6  # Balance between reference and prompt (0.4-0.8 recommended)

# Paths
BOOKS_DIR = Path('/Users/mattiapetrucciani/CascadeProjects/Onde/apps/corde/books')
OUTPUT_DIR = Path('/Volumes/DATI-SSD/onde-ai/corde/outputs')

# SDXL Model
SDXL_MODEL = "stabilityai/stable-diffusion-xl-base-1.0"

# Onde Style - Base prompts (shortened for CLIP 77 token limit)
ONDE_STYLE_BASE = ""  # Style now included directly in prompts
ONDE_STYLE_NEGATIVE = "Pixar, 3D, Disney, cartoon, plastic, rosy cheeks, anime, manga"


def load_pipeline(use_ip_adapter=False):
    """Load SDXL pipeline with MPS optimization and optional IP-Adapter"""
    print("Loading SDXL pipeline...")
    print("(First run will download ~6GB model)")

    # Load model on CPU first with float32 for MPS compatibility
    pipe = StableDiffusionXLPipeline.from_pretrained(
        SDXL_MODEL,
        torch_dtype=torch.float32,
        use_safetensors=True,
        low_cpu_mem_usage=True,
    )

    # Use DPM++ scheduler for faster generation
    pipe.scheduler = DPMSolverMultistepScheduler.from_config(pipe.scheduler.config)

    # Enable memory optimizations BEFORE moving to device
    pipe.enable_attention_slicing("auto")

    # Load IP-Adapter for character consistency if requested
    if use_ip_adapter:
        print("Loading IP-Adapter for character consistency...")
        sys.stdout.flush()
        try:
            pipe.load_ip_adapter(
                "h94/IP-Adapter",
                subfolder="sdxl_models",
                weight_name="ip-adapter_sdxl.bin"
            )
            pipe.set_ip_adapter_scale(IP_ADAPTER_SCALE)
            print(f"  IP-Adapter loaded (scale: {IP_ADAPTER_SCALE})")
        except Exception as e:
            print(f"  Warning: Could not load IP-Adapter: {e}")
            print("  Falling back to prompt-only generation")
        sys.stdout.flush()

    print("Moving pipeline to MPS...")
    sys.stdout.flush()

    # Move components to MPS one at a time
    pipe.unet = pipe.unet.to("mps")
    print("  UNet moved to MPS")
    sys.stdout.flush()

    pipe.vae = pipe.vae.to("mps")
    print("  VAE moved to MPS")
    sys.stdout.flush()

    pipe.text_encoder = pipe.text_encoder.to("mps")
    print("  Text encoder moved to MPS")
    sys.stdout.flush()

    pipe.text_encoder_2 = pipe.text_encoder_2.to("mps")
    print("  Text encoder 2 moved to MPS")
    sys.stdout.flush()

    print("Pipeline loaded!")
    return pipe


def generate_image(pipe, prompt: str, negative_prompt: str, output_path: Path,
                   width: int = 768, height: int = 768, steps: int = 20,
                   reference_image: Image.Image = None):
    """Generate a single image with optional IP-Adapter reference"""

    # Combine with Onde style
    full_prompt = f"{prompt}, {ONDE_STYLE_BASE}"
    full_negative = f"{negative_prompt}, {ONDE_STYLE_NEGATIVE}"

    print(f"\nGenerating: {output_path.name}")
    print(f"Prompt: {full_prompt[:100]}...")
    if reference_image:
        print(f"Using reference image for character consistency")

    # Clear MPS cache before generation
    if torch.backends.mps.is_available():
        torch.mps.empty_cache()
    gc.collect()

    # Build generation kwargs
    gen_kwargs = {
        "prompt": full_prompt,
        "negative_prompt": full_negative,
        "width": width,
        "height": height,
        "num_inference_steps": steps,
        "guidance_scale": 7.0,
    }

    # Add IP-Adapter image if reference provided
    if reference_image is not None:
        gen_kwargs["ip_adapter_image"] = reference_image

    # Generate
    image = pipe(**gen_kwargs).images[0]

    # Clear cache after generation
    if torch.backends.mps.is_available():
        torch.mps.empty_cache()
    gc.collect()

    # Save
    output_path.parent.mkdir(parents=True, exist_ok=True)
    image.save(output_path)
    print(f"Saved: {output_path}")

    return image


def load_book_prompts(book_name: str) -> list:
    """Load prompts from book's prompts-pina.md file"""

    prompts_file = BOOKS_DIR / book_name / "prompts-pina.md"
    if not prompts_file.exists():
        raise FileNotFoundError(f"Prompts file not found: {prompts_file}")

    content = prompts_file.read_text()

    # Extract prompts from markdown code blocks
    prompts = []
    lines = content.split('\n')
    in_code_block = False
    current_prompt = []
    current_name = ""
    in_character_section = False

    for i, line in enumerate(lines):
        # Skip CHARACTER REFERENCE sections
        if 'CHARACTER REFERENCE' in line.upper():
            in_character_section = True
            continue
        if line.startswith('## ILLUSTRATION') or line.startswith('## COPERTINA'):
            in_character_section = False

        if line.startswith('### Capitolo') or line.startswith('### Marco') or line.startswith('## COPERTINA') or line.startswith('### Copertina'):
            # Get chapter/section name
            current_name = line.strip('#').strip()
            in_character_section = False

        if line.strip() == '```':
            if in_code_block:
                # End of code block
                prompt_text = '\n'.join(current_prompt).strip()
                # Skip negative prompts, character references, and bash commands
                if (prompt_text and
                    not prompt_text.startswith('Pixar') and
                    not prompt_text.startswith('python') and
                    not prompt_text.startswith('#') and
                    not in_character_section):
                    prompts.append({
                        'name': current_name,
                        'prompt': prompt_text,
                    })
                current_prompt = []
            in_code_block = not in_code_block
        elif in_code_block:
            current_prompt.append(line)

    return prompts


def main():
    parser = argparse.ArgumentParser(description='Generate book illustrations with CORDE')
    parser.add_argument('--book', type=str, default='marco-aurelio-bambini', help='Book folder name')
    parser.add_argument('--chapter', type=int, default=None, help='Generate only specific chapter (1-10)')
    parser.add_argument('--cover', action='store_true', help='Generate only cover')
    parser.add_argument('--steps', type=int, default=25, help='Inference steps (default: 25)')
    parser.add_argument('--test', action='store_true', help='Test mode - generate 1 image only')
    parser.add_argument('--reference', type=str, default=None,
                        help='Reference image for character consistency (IP-Adapter)')
    parser.add_argument('--ip-scale', type=float, default=0.6,
                        help='IP-Adapter scale (0.0-1.0, default: 0.6)')

    args = parser.parse_args()

    # Load reference image if provided
    reference_image = None
    use_ip_adapter = False
    if args.reference:
        ref_path = Path(args.reference).expanduser()
        if ref_path.exists():
            print(f"Loading reference image: {ref_path}")
            reference_image = Image.open(ref_path).convert("RGB")
            # Resize to optimal size for IP-Adapter (224x224 for CLIP)
            reference_image = reference_image.resize((224, 224), Image.Resampling.LANCZOS)
            use_ip_adapter = True
            global IP_ADAPTER_SCALE
            IP_ADAPTER_SCALE = args.ip_scale
            print(f"Reference loaded! IP-Adapter scale: {IP_ADAPTER_SCALE}")
        else:
            print(f"Warning: Reference image not found: {ref_path}")
            print("Proceeding without character reference")

    # Create output directory for this book
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    book_output = OUTPUT_DIR / args.book / timestamp
    book_output.mkdir(parents=True, exist_ok=True)

    print(f"\n{'='*60}")
    print(f"CORDE Book Generator")
    print(f"Book: {args.book}")
    print(f"Output: {book_output}")
    print(f"{'='*60}\n")

    # Load prompts
    try:
        prompts = load_book_prompts(args.book)
        print(f"Found {len(prompts)} illustration prompts")
    except FileNotFoundError as e:
        print(f"Error: {e}")
        sys.exit(1)

    # Filter prompts based on args
    if args.test:
        prompts = prompts[:1]
        print("TEST MODE: Generating only 1 image")
    elif args.cover:
        prompts = [p for p in prompts if 'COPERTINA' in p['name'].upper()]
    elif args.chapter:
        prompts = [p for p in prompts if f'Capitolo {args.chapter}' in p['name']]

    if not prompts:
        print("No prompts to generate!")
        sys.exit(1)

    # Load pipeline (with IP-Adapter if reference provided)
    pipe = load_pipeline(use_ip_adapter=use_ip_adapter)

    # Generate images
    generated = []
    for i, prompt_data in enumerate(prompts):
        name = prompt_data['name'].lower()
        name = name.replace(' ', '-').replace('/', '-')
        # Clean filename
        for char in [':', '(', ')', ',', '\'', '"']:
            name = name.replace(char, '')

        output_path = book_output / f"{i+1:02d}-{name[:50]}.png"

        try:
            img = generate_image(
                pipe,
                prompt=prompt_data['prompt'],
                negative_prompt="",  # Already in ONDE_STYLE_NEGATIVE
                output_path=output_path,
                steps=args.steps,
                reference_image=reference_image,
            )
            generated.append(output_path)
        except Exception as e:
            print(f"Error generating {name}: {e}")
            import traceback
            traceback.print_exc()
            continue

    # Summary
    print(f"\n{'='*60}")
    print(f"Generation complete!")
    print(f"Generated {len(generated)} images")
    print(f"Output directory: {book_output}")
    print(f"{'='*60}\n")

    # List generated files
    for path in generated:
        print(f"  - {path.name}")


if __name__ == '__main__':
    main()
