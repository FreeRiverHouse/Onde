#!/usr/bin/env python3
"""
Generate character reference sheets for Marco Aurelio
4 ages: bambino, giovane, imperatore, anziano
"""

import os
os.environ['HF_HOME'] = '/Volumes/DATI-SSD/onde-ai/corde/cache'
os.environ['TORCH_HOME'] = '/Volumes/DATI-SSD/onde-ai/corde/cache'
os.environ['PYTORCH_MPS_HIGH_WATERMARK_RATIO'] = '0.0'

import torch
import gc
from diffusers import StableDiffusionXLPipeline, DPMSolverMultistepScheduler
from pathlib import Path
from datetime import datetime

# Character prompts for 4 ages of Marco Aurelio
CHARACTER_SHEETS = {
    "marco_bambino": """Young Roman boy around 8 years old with curly light brown hair and gentle brown eyes, wearing simple white toga, Mediterranean complexion, sitting under an olive tree with a papyrus scroll, Rome visible in background with columns and cypress trees, golden afternoon sunlight, European watercolor childrens book illustration, Beatrix Potter meets ancient Rome, soft brushstrokes, warm palette with terracotta gold and olive green, natural skin tone NO rosy cheeks, 4k""",

    "marco_giovane": """Young Roman man around 25 with curly light brown hair and short beard, gentle brown eyes, wearing white toga with gold trim, Mediterranean complexion, sitting with elderly teacher in Roman portico, surrounded by scrolls, golden sunset light, European watercolor childrens book illustration, warm and elegant, natural skin tone NO rosy cheeks, 4k""",

    "marco_imperatore": """Roman emperor Marcus Aurelius around 45 years old with curly hair and full beard, warm brown eyes, wearing purple toga with gold accents, laurel wreath optional, Mediterranean complexion, serene wise expression never angry, European watercolor childrens book illustration, dignified but approachable, warm golden Roman light, natural skin tone NO rosy cheeks, 4k""",

    "marco_anziano": """Elderly Roman emperor Marcus Aurelius with white curly hair and long white beard, wise gentle brown eyes, wearing simple white toga, writing by candlelight, surrounded by scrolls and papyrus, peaceful focused expression, European watercolor childrens book illustration, warm intimate atmosphere, night scene with stars visible through window, natural skin tone NO rosy cheeks, 4k""",
}

NEGATIVE_PROMPT = "Pixar, 3D, Disney, cartoon, American style, plastic, bright saturated colors, rosy cheeks, red cheeks, anime, manga, digital art look, harsh lighting, modern clothing, anachronistic elements"

OUTPUT_DIR = Path('/Volumes/DATI-SSD/onde-ai/corde/outputs/marco-aurelio-bambini/character-sheets')


def clear_memory():
    gc.collect()
    if torch.backends.mps.is_available():
        torch.mps.empty_cache()
        torch.mps.synchronize()


def load_pipeline():
    print("Loading SDXL pipeline (float32 for MPS)...")

    pipe = StableDiffusionXLPipeline.from_pretrained(
        "stabilityai/stable-diffusion-xl-base-1.0",
        torch_dtype=torch.float32,
        use_safetensors=True,
    )

    pipe.scheduler = DPMSolverMultistepScheduler.from_config(
        pipe.scheduler.config,
        algorithm_type="dpmsolver++",
        use_karras_sigmas=True,
    )

    pipe = pipe.to("mps")
    pipe.vae.enable_slicing()
    pipe.vae.enable_tiling()
    pipe.enable_attention_slicing("max")
    pipe.safety_checker = None

    print("Pipeline loaded!")
    return pipe


def generate_character(pipe, name: str, prompt: str, output_dir: Path, steps: int = 20, resolution: int = 768):
    """Generate a character sheet image"""

    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    output_path = output_dir / f"{name}_{timestamp}.png"

    print(f"\nGenerating: {name} ({resolution}x{resolution}, {steps} steps)")
    print(f"Prompt: {prompt[:80]}...")

    clear_memory()

    with torch.no_grad():
        result = pipe(
            prompt=prompt,
            negative_prompt=NEGATIVE_PROMPT,
            width=resolution,
            height=resolution,
            num_inference_steps=steps,
            guidance_scale=7.0,
        )

    image = result.images[0]
    clear_memory()

    # Verify image is valid
    extrema = image.convert("L").getextrema()
    if extrema == (0, 0):
        print(f"ERROR: Black image for {name}")
        return None

    output_path.parent.mkdir(parents=True, exist_ok=True)
    image.save(output_path, quality=95)

    size_kb = output_path.stat().st_size / 1024
    print(f"Saved: {output_path.name} ({size_kb:.1f} KB)")

    return output_path


def main():
    import argparse
    parser = argparse.ArgumentParser(description='Generate Marco Aurelio character sheets')
    parser.add_argument('--steps', type=int, default=20, help='Inference steps')
    parser.add_argument('--resolution', type=int, default=768, choices=[512, 768, 1024])
    parser.add_argument('--character', type=str, default=None,
                       choices=list(CHARACTER_SHEETS.keys()),
                       help='Generate specific character only')
    args = parser.parse_args()

    print(f"\n{'='*60}")
    print("Marco Aurelio Character Sheet Generator")
    print(f"Resolution: {args.resolution}x{args.resolution}")
    print(f"Steps: {args.steps}")
    print(f"Output: {OUTPUT_DIR}")
    print(f"{'='*60}\n")

    pipe = load_pipeline()

    characters = CHARACTER_SHEETS
    if args.character:
        characters = {args.character: CHARACTER_SHEETS[args.character]}

    generated = []
    failed = []

    for name, prompt in characters.items():
        try:
            path = generate_character(
                pipe, name, prompt, OUTPUT_DIR,
                steps=args.steps, resolution=args.resolution
            )
            if path:
                generated.append(path)
            else:
                failed.append(name)
        except Exception as e:
            print(f"Error generating {name}: {e}")
            failed.append(name)
            clear_memory()

    print(f"\n{'='*60}")
    print("Character sheets complete!")
    print(f"Generated: {len(generated)}/{len(characters)}")
    print(f"{'='*60}\n")

    for path in generated:
        print(f"  OK: {path.name}")
    for name in failed:
        print(f"  FAIL: {name}")


if __name__ == '__main__':
    main()
