#!/usr/bin/env python3
"""
CORDE Book Generator
Generates illustrations for Marco Aurelio children's book using SDXL

Usage:
    python generate_book.py --book marco-aurelio-bambini
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

# Paths
BOOKS_DIR = Path('/Users/mattia/Projects/Onde/books')
OUTPUT_DIR = Path('/Volumes/DATI-SSD/onde-ai/corde/outputs')

# SDXL Model
SDXL_MODEL = "stabilityai/stable-diffusion-xl-base-1.0"

# Onde Style - Base prompts
ONDE_STYLE_BASE = "European watercolor childrens book illustration, soft brushstrokes, warm golden light, elegant refined"
ONDE_STYLE_NEGATIVE = "Pixar, 3D, Disney, cartoon, American style, plastic, bright saturated colors, rosy cheeks, red cheeks, anime, manga, digital art look, harsh lighting"


def load_pipeline():
    """Load SDXL pipeline with MPS optimization"""
    print("Loading SDXL pipeline...")
    print("(First run will download ~6GB model)")

    pipe = StableDiffusionXLPipeline.from_pretrained(
        SDXL_MODEL,
        torch_dtype=torch.float16,
        variant="fp16",
        use_safetensors=True,
    )

    # Use DPM++ scheduler for faster generation
    pipe.scheduler = DPMSolverMultistepScheduler.from_config(pipe.scheduler.config)

    # Move to MPS (Apple Silicon)
    pipe = pipe.to("mps")

    # Enable memory optimizations
    pipe.enable_attention_slicing(1)  # Minimum slice for lowest memory
    pipe.enable_vae_slicing()  # Process VAE in slices
    pipe.enable_vae_tiling()   # Process VAE in tiles for large images

    print("Pipeline loaded!")
    return pipe


def generate_image(pipe, prompt: str, negative_prompt: str, output_path: Path,
                   width: int = 768, height: int = 768, steps: int = 20):
    """Generate a single image"""

    # Combine with Onde style
    full_prompt = f"{prompt}, {ONDE_STYLE_BASE}"
    full_negative = f"{negative_prompt}, {ONDE_STYLE_NEGATIVE}"

    print(f"\nGenerating: {output_path.name}")
    print(f"Prompt: {full_prompt[:100]}...")

    # Clear MPS cache before generation
    if torch.backends.mps.is_available():
        torch.mps.empty_cache()
    gc.collect()

    # Generate with lower memory settings
    image = pipe(
        prompt=full_prompt,
        negative_prompt=full_negative,
        width=width,
        height=height,
        num_inference_steps=steps,
        guidance_scale=7.0,
    ).images[0]

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

    for i, line in enumerate(lines):
        if line.startswith('### Capitolo') or line.startswith('### Marco') or line.startswith('## COPERTINA'):
            # Get chapter/section name
            current_name = line.strip('#').strip()

        if line.strip() == '```':
            if in_code_block:
                # End of code block
                prompt_text = '\n'.join(current_prompt).strip()
                if prompt_text and not prompt_text.startswith('Pixar'):  # Skip negative prompts
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

    args = parser.parse_args()

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

    # Load pipeline
    pipe = load_pipeline()

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
            )
            generated.append(output_path)
        except Exception as e:
            print(f"Error generating {name}: {e}")
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
