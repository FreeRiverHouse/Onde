#!/usr/bin/env python3
"""
CORDE Single Image Generator
Simple API-friendly image generation for network calls

Usage:
    python generate_single.py --prompt "a cat" --output /path/to/output.png
"""

import os
import sys
import json
import argparse
import gc
from pathlib import Path

# Set cache BEFORE importing torch
os.environ['HF_HOME'] = '/Volumes/DATI-SSD/onde-ai/corde/cache'
os.environ['TORCH_HOME'] = '/Volumes/DATI-SSD/onde-ai/corde/cache'
os.environ['PYTORCH_MPS_HIGH_WATERMARK_RATIO'] = '0.0'

import torch
from diffusers import StableDiffusionXLPipeline, DPMSolverMultistepScheduler
from PIL import Image


def progress(percent, message=""):
    """Print progress as JSON for API"""
    print(json.dumps({"progress": percent, "message": message}), flush=True)


def clear_memory():
    gc.collect()
    if torch.backends.mps.is_available():
        torch.mps.empty_cache()
        torch.mps.synchronize()
    gc.collect()


def generate(
    prompt: str,
    negative_prompt: str = "",
    width: int = 1024,
    height: int = 1024,
    steps: int = 30,
    guidance: float = 7.5,
    seed: int = 42,
    output: str = "output.png"
):
    progress(5, "Loading model...")

    # Device
    if torch.backends.mps.is_available():
        device = "mps"
        dtype = torch.float32  # MPS needs float32 for SDXL
    elif torch.cuda.is_available():
        device = "cuda"
        dtype = torch.float16
    else:
        device = "cpu"
        dtype = torch.float32

    progress(10, f"Using device: {device}")

    # Load pipeline
    pipe = StableDiffusionXLPipeline.from_pretrained(
        "stabilityai/stable-diffusion-xl-base-1.0",
        torch_dtype=dtype,
        use_safetensors=True,
        variant="fp16" if device == "cuda" else None,
    )

    # Scheduler
    pipe.scheduler = DPMSolverMultistepScheduler.from_config(
        pipe.scheduler.config,
        algorithm_type="dpmsolver++",
        use_karras_sigmas=True
    )

    pipe = pipe.to(device)

    # Memory optimization
    pipe.enable_attention_slicing()
    if hasattr(pipe, 'enable_vae_slicing'):
        pipe.enable_vae_slicing()

    progress(30, "Model loaded, generating...")

    # Generator
    generator = torch.Generator(device=device).manual_seed(seed)

    # Callback for progress
    def step_callback(pipe, step, timestep, callback_kwargs):
        pct = 30 + int((step / steps) * 60)
        progress(pct, f"Step {step}/{steps}")
        return callback_kwargs

    # Generate
    result = pipe(
        prompt=prompt,
        negative_prompt=negative_prompt,
        width=width,
        height=height,
        num_inference_steps=steps,
        guidance_scale=guidance,
        generator=generator,
        callback_on_step_end=step_callback,
    )

    progress(95, "Saving image...")

    # Save
    image = result.images[0]
    output_path = Path(output)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    image.save(output_path, quality=95)

    # Cleanup
    del pipe
    clear_memory()

    progress(100, f"Saved to {output}")
    print(json.dumps({"output": str(output_path), "status": "completed"}), flush=True)


def main():
    parser = argparse.ArgumentParser(description="Generate single image")
    parser.add_argument("--prompt", required=True, help="Image prompt")
    parser.add_argument("--negative", default="", help="Negative prompt")
    parser.add_argument("--width", type=int, default=1024)
    parser.add_argument("--height", type=int, default=1024)
    parser.add_argument("--steps", type=int, default=30)
    parser.add_argument("--guidance", type=float, default=7.5)
    parser.add_argument("--seed", type=int, default=42)
    parser.add_argument("--output", required=True, help="Output path")

    args = parser.parse_args()

    generate(
        prompt=args.prompt,
        negative_prompt=args.negative,
        width=args.width,
        height=args.height,
        steps=args.steps,
        guidance=args.guidance,
        seed=args.seed,
        output=args.output,
    )


if __name__ == "__main__":
    main()
