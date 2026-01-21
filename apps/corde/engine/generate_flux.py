#!/usr/bin/env python3
"""
CORDE Flux Generator
Generates illustrations using Flux on Apple Silicon M4 Pro

Flux is optimized for Apple Silicon with:
- Lower memory footprint than SDXL
- Better prompt adherence
- Faster inference with fewer steps

Usage:
    python generate_flux.py --book marco-aurelio-bambini --test
    python generate_flux.py --book marco-aurelio-bambini --resolution 1024
"""

import os
import sys
import argparse
from pathlib import Path
from datetime import datetime

# Set cache directory to SSD BEFORE importing torch
os.environ['HF_HOME'] = '/Volumes/DATI-SSD/onde-ai/corde/cache'
os.environ['TORCH_HOME'] = '/Volumes/DATI-SSD/onde-ai/corde/cache'
os.environ['PYTORCH_MPS_HIGH_WATERMARK_RATIO'] = '0.0'

import torch
import gc

# Paths
BOOKS_DIR = Path('/Users/mattiapetrucciani/CascadeProjects/corde/books')
OUTPUT_DIR = Path('/Volumes/DATI-SSD/onde-ai/corde/outputs')

# Flux Models
FLUX_SCHNELL = "black-forest-labs/FLUX.1-schnell"  # Fast, 4 steps
FLUX_DEV = "black-forest-labs/FLUX.1-dev"          # Quality, 20-50 steps

# Onde Style
ONDE_STYLE = "European watercolor childrens book illustration, soft brushstrokes, warm golden light, elegant refined, Beatrix Potter style"
ONDE_NEGATIVE = "Pixar, 3D, Disney, cartoon, American style, plastic, bright saturated colors, rosy cheeks, anime, manga"


def clear_memory():
    """Clear MPS and system memory"""
    gc.collect()
    if torch.backends.mps.is_available():
        torch.mps.empty_cache()
        torch.mps.synchronize()
    gc.collect()


def load_flux_pipeline(model_type: str = "schnell", use_fp16: bool = True):
    """Load Flux pipeline optimized for M4 Pro"""
    from diffusers import FluxPipeline

    model_id = FLUX_SCHNELL if model_type == "schnell" else FLUX_DEV

    print(f"Loading Flux {model_type}...")
    print(f"Model: {model_id}")
    print("(First run downloads ~12GB)")

    clear_memory()

    # Determine dtype based on available memory
    dtype = torch.float16 if use_fp16 else torch.bfloat16

    try:
        pipe = FluxPipeline.from_pretrained(
            model_id,
            torch_dtype=dtype,
        )

        # Move to MPS
        pipe = pipe.to("mps")

        # Enable memory optimizations
        pipe.enable_attention_slicing("max")

        print(f"Pipeline loaded! (dtype: {dtype})")
        return pipe

    except Exception as e:
        print(f"Error loading Flux: {e}")
        print("\nFlux models require HuggingFace login for FLUX.1-dev")
        print("Try: huggingface-cli login")
        print("Or use --model schnell (no login required)")
        sys.exit(1)


def generate_image(pipe, prompt: str, output_path: Path,
                   width: int = 1024, height: int = 1024,
                   steps: int = 4, guidance: float = 0.0):
    """Generate image with Flux"""

    # Add Onde style to prompt
    full_prompt = f"{prompt}, {ONDE_STYLE}"

    print(f"\nGenerating: {output_path.name} ({width}x{height}, {steps} steps)")
    print(f"Prompt: {full_prompt[:80]}...")

    clear_memory()

    start_time = datetime.now()

    with torch.no_grad():
        # Flux schnell doesn't use guidance, dev uses guidance_scale
        if guidance > 0:
            result = pipe(
                prompt=full_prompt,
                width=width,
                height=height,
                num_inference_steps=steps,
                guidance_scale=guidance,
            )
        else:
            result = pipe(
                prompt=full_prompt,
                width=width,
                height=height,
                num_inference_steps=steps,
            )

    image = result.images[0]
    elapsed = (datetime.now() - start_time).total_seconds()

    clear_memory()

    # Verify image is valid
    extrema = image.convert("L").getextrema()
    if extrema == (0, 0):
        print(f"WARNING: Black image detected")
        return None

    # Save
    output_path.parent.mkdir(parents=True, exist_ok=True)
    image.save(output_path, quality=95)

    size_kb = output_path.stat().st_size / 1024
    print(f"Saved: {output_path.name} ({size_kb:.1f} KB, {elapsed:.1f}s)")

    return image


def load_book_prompts(book_name: str) -> list:
    """Load prompts from book's prompts-pina.md file"""
    prompts_file = BOOKS_DIR / book_name / "prompts-pina.md"
    if not prompts_file.exists():
        raise FileNotFoundError(f"Not found: {prompts_file}")

    content = prompts_file.read_text()
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
                    prompts.append({'name': current_name, 'prompt': prompt_text})
                current_prompt = []
            in_code_block = not in_code_block
        elif in_code_block:
            current_prompt.append(line)

    return prompts


def main():
    parser = argparse.ArgumentParser(description='CORDE Flux Generator')
    parser.add_argument('--book', type=str, default='marco-aurelio-bambini')
    parser.add_argument('--chapter', type=int, default=None)
    parser.add_argument('--cover', action='store_true')
    parser.add_argument('--model', type=str, default='schnell', choices=['schnell', 'dev'])
    parser.add_argument('--steps', type=int, default=None, help='Steps (default: 4 schnell, 28 dev)')
    parser.add_argument('--resolution', type=int, default=1024, choices=[512, 768, 1024])
    parser.add_argument('--test', action='store_true')
    parser.add_argument('--guidance', type=float, default=3.5, help='Guidance scale (dev only)')

    args = parser.parse_args()

    # Set default steps based on model
    if args.steps is None:
        args.steps = 4 if args.model == 'schnell' else 28

    # Schnell doesn't use guidance
    guidance = args.guidance if args.model == 'dev' else 0.0

    # Output directory
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    book_output = OUTPUT_DIR / args.book / f"flux-{timestamp}"
    book_output.mkdir(parents=True, exist_ok=True)

    print(f"\n{'='*60}")
    print(f"CORDE Flux Generator")
    print(f"Model: Flux {args.model}")
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

    # Filter
    if args.test:
        prompts = prompts[:1]
        print("TEST MODE: 1 image")
    elif args.cover:
        prompts = [p for p in prompts if 'COPERTINA' in p['name'].upper()]
    elif args.chapter:
        prompts = [p for p in prompts if f'Capitolo {args.chapter}' in p['name']]

    if not prompts:
        print("No prompts!")
        sys.exit(1)

    # Load pipeline
    pipe = load_flux_pipeline(model_type=args.model)

    # Generate
    generated = []
    failed = []

    for i, p in enumerate(prompts):
        name = p['name'].lower().replace(' ', '-').replace('/', '-')
        for c in [':', '(', ')', ',', '\'', '"']:
            name = name.replace(c, '')

        output_path = book_output / f"{i+1:02d}-{name[:50]}.png"

        try:
            img = generate_image(
                pipe, p['prompt'], output_path,
                width=args.resolution, height=args.resolution,
                steps=args.steps, guidance=guidance
            )
            if img:
                generated.append(output_path)
            else:
                failed.append(name)
        except Exception as e:
            print(f"Error: {e}")
            failed.append(name)
            clear_memory()

    # Summary
    print(f"\n{'='*60}")
    print(f"Done! Generated: {len(generated)}, Failed: {len(failed)}")
    print(f"Output: {book_output}")
    print(f"{'='*60}\n")


if __name__ == '__main__':
    main()
