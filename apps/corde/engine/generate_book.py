#!/usr/bin/env python3
"""
CORDE Book Generator
Generates illustrations for books using SDXL on Apple Silicon

Usage:
    python generate_book.py --book marco-aurelio-bambini --resolution 768
"""

import os
import sys
import argparse
from pathlib import Path
from datetime import datetime

# Set cache directory to SSD BEFORE importing torch
os.environ['HF_HOME'] = '/Volumes/DATI-SSD/onde-ai/corde/cache'
os.environ['TORCH_HOME'] = '/Volumes/DATI-SSD/onde-ai/corde/cache'
# MPS memory settings
os.environ['PYTORCH_MPS_HIGH_WATERMARK_RATIO'] = '0.0'

import torch
import gc
from diffusers import StableDiffusionXLPipeline, DPMSolverMultistepScheduler
from PIL import Image

# Paths
BOOKS_DIR = Path('/Users/mattiapetrucciani/CascadeProjects/corde/books')
OUTPUT_DIR = Path('/Volumes/DATI-SSD/onde-ai/corde/outputs')

# SDXL Model
SDXL_MODEL = "stabilityai/stable-diffusion-xl-base-1.0"

# Onde Style
ONDE_STYLE_BASE = "European watercolor childrens book illustration, soft brushstrokes, warm golden light, elegant refined"
ONDE_STYLE_NEGATIVE = "Pixar, 3D, Disney, cartoon, American style, plastic, bright saturated colors, rosy cheeks, red cheeks, anime, manga, digital art look, harsh lighting"


def clear_memory():
    """Aggressively clear MPS and system memory"""
    gc.collect()
    if torch.backends.mps.is_available():
        torch.mps.empty_cache()
        torch.mps.synchronize()
    gc.collect()


def load_pipeline(use_cpu_offload: bool = False):
    """Load SDXL pipeline with MPS optimization"""
    print("Loading SDXL pipeline...")

    clear_memory()

    # Load with float32 for MPS stability (prevents black images)
    # float16 causes NaN issues on Apple Silicon
    pipe = StableDiffusionXLPipeline.from_pretrained(
        SDXL_MODEL,
        torch_dtype=torch.float32,
        use_safetensors=True,
    )

    # Use DPM++ scheduler for faster generation
    pipe.scheduler = DPMSolverMultistepScheduler.from_config(
        pipe.scheduler.config,
        algorithm_type="dpmsolver++",
        use_karras_sigmas=True,
    )

    if use_cpu_offload:
        # For very large images - keep model on CPU, move to MPS per-layer
        print("Using sequential CPU offload for large images...")
        pipe.enable_sequential_cpu_offload(device="mps")
    else:
        # Standard MPS loading
        pipe = pipe.to("mps")

    # VAE already in float32 (whole pipeline loaded as float32)

    # Memory optimizations
    pipe.vae.enable_slicing()
    pipe.vae.enable_tiling()
    pipe.enable_attention_slicing("max")  # Maximum slicing for lowest memory

    # Disable safety checker to save memory
    pipe.safety_checker = None

    print("Pipeline loaded!")
    return pipe


def generate_image(pipe, prompt: str, negative_prompt: str, output_path: Path,
                   width: int = 768, height: int = 768, steps: int = 20):
    """Generate a single image with memory-safe settings"""

    # Combine with Onde style
    full_prompt = f"{prompt}, {ONDE_STYLE_BASE}"
    full_negative = f"{negative_prompt}, {ONDE_STYLE_NEGATIVE}"

    print(f"\nGenerating: {output_path.name} ({width}x{height}, {steps} steps)")
    print(f"Prompt: {full_prompt[:80]}...")

    # Clear memory before generation
    clear_memory()

    # Generate
    with torch.no_grad():
        result = pipe(
            prompt=full_prompt,
            negative_prompt=full_negative,
            width=width,
            height=height,
            num_inference_steps=steps,
            guidance_scale=7.0,
        )

    image = result.images[0]

    # Clear memory after generation
    clear_memory()

    # Verify image is valid (not all black)
    extrema = image.convert("L").getextrema()
    if extrema == (0, 0):
        print(f"WARNING: Image appears to be all black. Memory issue likely.")
        return None

    # Save
    output_path.parent.mkdir(parents=True, exist_ok=True)
    image.save(output_path, quality=95)

    # Get file size
    size_kb = output_path.stat().st_size / 1024
    print(f"Saved: {output_path.name} ({size_kb:.1f} KB)")

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

    for line in lines:
        if line.startswith('### Capitolo') or line.startswith('### Marco') or line.startswith('## COPERTINA'):
            current_name = line.strip('#').strip()

        if line.strip() == '```':
            if in_code_block:
                prompt_text = '\n'.join(current_prompt).strip()
                if prompt_text and not prompt_text.startswith('Pixar'):
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
    parser = argparse.ArgumentParser(description='CORDE Book Generator')
    parser.add_argument('--book', type=str, default='marco-aurelio-bambini', help='Book folder name')
    parser.add_argument('--chapter', type=int, default=None, help='Generate specific chapter (1-10)')
    parser.add_argument('--cover', action='store_true', help='Generate only cover')
    parser.add_argument('--steps', type=int, default=20, help='Inference steps (default: 20)')
    parser.add_argument('--resolution', type=int, default=768, choices=[512, 768, 1024], help='Image resolution')
    parser.add_argument('--test', action='store_true', help='Test mode - 1 image only')
    parser.add_argument('--cpu-offload', action='store_true', help='Use CPU offload for large images')

    args = parser.parse_args()

    # Auto-enable CPU offload for 1024
    if args.resolution >= 1024:
        args.cpu_offload = True
        print("Auto-enabling CPU offload for 1024+ resolution")

    # Create output directory
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    book_output = OUTPUT_DIR / args.book / timestamp
    book_output.mkdir(parents=True, exist_ok=True)

    print(f"\n{'='*60}")
    print(f"CORDE Book Generator")
    print(f"Book: {args.book}")
    print(f"Resolution: {args.resolution}x{args.resolution}")
    print(f"Steps: {args.steps}")
    print(f"Output: {book_output}")
    print(f"{'='*60}\n")

    # Load prompts
    try:
        prompts = load_book_prompts(args.book)
        print(f"Found {len(prompts)} prompts")
    except FileNotFoundError as e:
        print(f"Error: {e}")
        sys.exit(1)

    # Filter prompts
    if args.test:
        prompts = prompts[:1]
        print("TEST MODE: 1 image only")
    elif args.cover:
        prompts = [p for p in prompts if 'COPERTINA' in p['name'].upper()]
    elif args.chapter:
        prompts = [p for p in prompts if f'Capitolo {args.chapter}' in p['name']]

    if not prompts:
        print("No prompts to generate!")
        sys.exit(1)

    # Load pipeline
    pipe = load_pipeline(use_cpu_offload=args.cpu_offload)

    # Generate images
    generated = []
    failed = []

    for i, prompt_data in enumerate(prompts):
        name = prompt_data['name'].lower()
        name = name.replace(' ', '-').replace('/', '-')
        for char in [':', '(', ')', ',', '\'', '"']:
            name = name.replace(char, '')

        output_path = book_output / f"{i+1:02d}-{name[:50]}.png"

        try:
            img = generate_image(
                pipe,
                prompt=prompt_data['prompt'],
                negative_prompt="",
                output_path=output_path,
                width=args.resolution,
                height=args.resolution,
                steps=args.steps,
            )
            if img:
                generated.append(output_path)
            else:
                failed.append(name)
        except Exception as e:
            print(f"Error generating {name}: {e}")
            failed.append(name)
            clear_memory()
            continue

    # Summary
    print(f"\n{'='*60}")
    print(f"Generation complete!")
    print(f"Generated: {len(generated)} images")
    if failed:
        print(f"Failed: {len(failed)} images")
    print(f"Output: {book_output}")
    print(f"{'='*60}\n")

    for path in generated:
        print(f"  OK: {path.name}")
    for name in failed:
        print(f"  FAIL: {name}")


if __name__ == '__main__':
    main()
