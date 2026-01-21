#!/usr/bin/env python3
"""
CORDE High Quality Generator
Uses illustrator profiles for maximum quality and consistency

Usage:
    python generate_hq.py --book marco-aurelio-bambini --illustrator pina_pennello --quality maximum
"""

import os
import sys
import json
import argparse
from pathlib import Path
from datetime import datetime

# Set cache directory to SSD BEFORE importing torch
os.environ['HF_HOME'] = '/Volumes/DATI-SSD/onde-ai/corde/cache'
os.environ['TORCH_HOME'] = '/Volumes/DATI-SSD/onde-ai/corde/cache'
os.environ['PYTORCH_MPS_HIGH_WATERMARK_RATIO'] = '0.0'

import torch
import gc
from diffusers import (
    StableDiffusionXLPipeline,
    DPMSolverMultistepScheduler,
    DPMSolverSinglestepScheduler,
    EulerDiscreteScheduler,
    EulerAncestralDiscreteScheduler,
)
from PIL import Image

# Paths
CORDE_ROOT = Path('/Users/mattiapetrucciani/CascadeProjects/corde')
BOOKS_DIR = CORDE_ROOT / 'books'
CONFIG_DIR = CORDE_ROOT / 'config'
OUTPUT_DIR = Path('/Volumes/DATI-SSD/onde-ai/corde/outputs')


def clear_memory():
    """Aggressively clear MPS and system memory"""
    gc.collect()
    if torch.backends.mps.is_available():
        torch.mps.empty_cache()
        torch.mps.synchronize()
    gc.collect()


def load_illustrator_profile(name: str) -> dict:
    """Load illustrator profile from config"""
    profile_path = CONFIG_DIR / 'illustrators' / f'{name}.json'
    if not profile_path.exists():
        raise FileNotFoundError(f"Illustrator profile not found: {profile_path}")

    with open(profile_path) as f:
        return json.load(f)


def get_scheduler(scheduler_name: str, config):
    """Get scheduler by name"""
    schedulers = {
        "DPM++ 2M Karras": lambda: DPMSolverMultistepScheduler.from_config(
            config, algorithm_type="dpmsolver++", use_karras_sigmas=True
        ),
        "DPM++ 2M SDE Karras": lambda: DPMSolverMultistepScheduler.from_config(
            config, algorithm_type="sde-dpmsolver++", use_karras_sigmas=True
        ),
        "DPM++ SDE Karras": lambda: DPMSolverSinglestepScheduler.from_config(
            config, use_karras_sigmas=True
        ),
        "Euler": lambda: EulerDiscreteScheduler.from_config(config),
        "Euler A": lambda: EulerAncestralDiscreteScheduler.from_config(config),
    }
    return schedulers.get(scheduler_name, schedulers["DPM++ 2M Karras"])()


def load_pipeline(profile: dict, quality_preset: str):
    """Load SDXL pipeline with profile settings"""

    quality = profile['quality_presets'][quality_preset]
    model = profile['model_preferences']['primary']

    print(f"\n{'='*60}")
    print(f"Loading pipeline for: {profile['name']}")
    print(f"Model: {model}")
    print(f"Quality preset: {quality_preset}")
    print(f"Resolution: {quality['resolution']}x{quality['resolution']}")
    print(f"Steps: {quality['steps']}")
    print(f"Guidance: {quality['guidance_scale']}")
    print(f"Scheduler: {quality['scheduler']}")
    print(f"{'='*60}\n")

    clear_memory()

    # Load pipeline with float32 for MPS stability
    pipe = StableDiffusionXLPipeline.from_pretrained(
        model,
        torch_dtype=torch.float32,
        use_safetensors=True,
    )

    # Set scheduler
    pipe.scheduler = get_scheduler(quality['scheduler'], pipe.scheduler.config)

    # Move to MPS
    pipe = pipe.to("mps")

    # Memory optimizations
    pipe.vae.enable_slicing()
    pipe.vae.enable_tiling()
    pipe.enable_attention_slicing("max")
    pipe.safety_checker = None

    print("Pipeline loaded!")
    return pipe, quality


def build_prompt(base_prompt: str, profile: dict) -> str:
    """Build full prompt with profile style"""
    style = profile['style_prompt']

    # Combine base prompt with style
    full_prompt = f"{base_prompt}, {style['base']}"

    # Add enhancers for maximum quality
    enhancers = ", ".join(style['enhancers'])
    full_prompt = f"{full_prompt}, {enhancers}, {style['technical']}"

    return full_prompt


def build_negative_prompt(profile: dict) -> str:
    """Build negative prompt from profile"""
    neg = profile['negative_prompt']
    return neg['full']


def generate_image(pipe, prompt: str, negative_prompt: str, output_path: Path,
                   quality: dict, seed: int = -1) -> dict:
    """Generate a single high-quality image"""

    resolution = quality['resolution']
    steps = quality['steps']
    guidance = quality['guidance_scale']

    print(f"\nGenerating: {output_path.name}")
    print(f"Resolution: {resolution}x{resolution}, Steps: {steps}, Guidance: {guidance}")
    print(f"Prompt: {prompt[:100]}...")

    clear_memory()

    # Handle seed
    if seed < 0:
        seed = torch.randint(0, 2**32, (1,)).item()

    generator = torch.Generator(device="mps").manual_seed(seed)

    # Generate
    with torch.no_grad():
        result = pipe(
            prompt=prompt,
            negative_prompt=negative_prompt,
            width=resolution,
            height=resolution,
            num_inference_steps=steps,
            guidance_scale=guidance,
            generator=generator,
        )

    image = result.images[0]
    clear_memory()

    # Verify image is valid
    extrema = image.convert("L").getextrema()
    if extrema == (0, 0):
        print(f"ERROR: Black image generated!")
        return None

    # Save
    output_path.parent.mkdir(parents=True, exist_ok=True)
    image.save(output_path, quality=95)

    size_kb = output_path.stat().st_size / 1024
    print(f"Saved: {output_path.name} ({size_kb:.1f} KB)")
    print(f"Seed used: {seed}")

    return {
        'path': str(output_path),
        'seed': seed,
        'resolution': resolution,
        'steps': steps,
        'guidance': guidance,
        'size_kb': size_kb,
    }


def load_book_prompts(book_name: str) -> list:
    """Load prompts from book's prompts file"""
    prompts_file = BOOKS_DIR / book_name / "prompts-pina.md"
    if not prompts_file.exists():
        raise FileNotFoundError(f"Prompts file not found: {prompts_file}")

    content = prompts_file.read_text()

    prompts = []
    lines = content.split('\n')
    in_code_block = False
    current_prompt = []
    current_name = ""

    for line in lines:
        if line.startswith('### ') or line.startswith('## COPERTINA'):
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


def save_generation_log(output_dir: Path, profile: dict, quality_preset: str, results: list):
    """Save generation log for reproducibility"""
    log = {
        'timestamp': datetime.now().isoformat(),
        'illustrator': profile['id'],
        'quality_preset': quality_preset,
        'quality_settings': profile['quality_presets'][quality_preset],
        'style_prompt': profile['style_prompt'],
        'negative_prompt': profile['negative_prompt']['full'],
        'results': results,
    }

    log_path = output_dir / 'generation_log.json'
    with open(log_path, 'w') as f:
        json.dump(log, f, indent=2, ensure_ascii=False)

    print(f"\nGeneration log saved: {log_path}")


def main():
    parser = argparse.ArgumentParser(description='CORDE High Quality Generator')
    parser.add_argument('--book', type=str, required=True, help='Book folder name')
    parser.add_argument('--illustrator', type=str, default='pina_pennello', help='Illustrator profile')
    parser.add_argument('--quality', type=str, default='maximum',
                       choices=['draft', 'standard', 'high', 'maximum'],
                       help='Quality preset')
    parser.add_argument('--chapter', type=int, default=None, help='Generate specific chapter')
    parser.add_argument('--cover', action='store_true', help='Generate only cover')
    parser.add_argument('--test', action='store_true', help='Test mode - 1 image only')
    parser.add_argument('--seed', type=int, default=-1, help='Fixed seed for reproducibility')

    args = parser.parse_args()

    # Load illustrator profile
    profile = load_illustrator_profile(args.illustrator)

    # Create output directory
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    book_output = OUTPUT_DIR / args.book / f'{timestamp}_{args.quality}'
    book_output.mkdir(parents=True, exist_ok=True)

    print(f"\n{'='*60}")
    print(f"CORDE High Quality Generator")
    print(f"Book: {args.book}")
    print(f"Illustrator: {profile['name']}")
    print(f"Quality: {args.quality}")
    print(f"Output: {book_output}")
    print(f"{'='*60}\n")

    # Load prompts
    prompts = load_book_prompts(args.book)
    print(f"Found {len(prompts)} prompts")

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
    pipe, quality = load_pipeline(profile, args.quality)

    # Build negative prompt once
    negative_prompt = build_negative_prompt(profile)

    # Generate images
    results = []

    for i, prompt_data in enumerate(prompts):
        name = prompt_data['name'].lower()
        name = name.replace(' ', '-').replace('/', '-')
        for char in [':', '(', ')', ',', '\'', '"']:
            name = name.replace(char, '')

        output_path = book_output / f"{i+1:02d}-{name[:50]}.png"

        # Build full prompt with profile style
        full_prompt = build_prompt(prompt_data['prompt'], profile)

        try:
            result = generate_image(
                pipe,
                prompt=full_prompt,
                negative_prompt=negative_prompt,
                output_path=output_path,
                quality=quality,
                seed=args.seed,
            )
            if result:
                result['name'] = prompt_data['name']
                result['original_prompt'] = prompt_data['prompt']
                results.append(result)
        except Exception as e:
            print(f"Error generating {name}: {e}")
            clear_memory()
            continue

    # Save generation log
    save_generation_log(book_output, profile, args.quality, results)

    # Summary
    print(f"\n{'='*60}")
    print(f"Generation complete!")
    print(f"Generated: {len(results)}/{len(prompts)} images")
    print(f"Quality: {args.quality}")
    print(f"Output: {book_output}")
    print(f"{'='*60}\n")

    for r in results:
        print(f"  OK: {Path(r['path']).name} (seed: {r['seed']})")


if __name__ == '__main__':
    main()
