#!/usr/bin/env python3
"""Quick test for CORDE image generation on MPS"""

import os
os.environ['HF_HOME'] = '/Volumes/DATI-SSD/onde-ai/corde/cache'
os.environ['TORCH_HOME'] = '/Volumes/DATI-SSD/onde-ai/corde/cache'
os.environ['PYTORCH_MPS_HIGH_WATERMARK_RATIO'] = '0.0'

import torch
from diffusers import AutoPipelineForText2Image
from pathlib import Path
from datetime import datetime
import gc

def clear_memory():
    gc.collect()
    if torch.backends.mps.is_available():
        torch.mps.empty_cache()
        torch.mps.synchronize()

print(f"PyTorch: {torch.__version__}")
print(f"MPS available: {torch.backends.mps.is_available()}")

# Test with SDXL Turbo (float32 fix)
print("\nLoading SDXL Turbo (float32)...")

pipe = AutoPipelineForText2Image.from_pretrained(
    "stabilityai/sdxl-turbo",
    torch_dtype=torch.float32,  # Full precision for MPS
)
pipe = pipe.to("mps")
pipe.enable_attention_slicing("max")

print("Generating test image...")

prompt = "Young Roman boy around 8 years old with curly light brown hair, gentle brown eyes, simple white toga, studying under an olive tree, ancient Rome, European watercolor illustration, warm golden light, Beatrix Potter style"

with torch.no_grad():
    result = pipe(
        prompt=prompt,
        num_inference_steps=4,
        guidance_scale=0.0,
        width=512,
        height=512,
    )

image = result.images[0]

# Check if image is valid
extrema = image.convert("L").getextrema()
if extrema == (0, 0):
    print("ERROR: Black image generated!")
else:
    print(f"Image valid! Pixel range: {extrema}")

    output_dir = Path('/Volumes/DATI-SSD/onde-ai/corde/outputs/test')
    output_dir.mkdir(parents=True, exist_ok=True)
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    output_path = output_dir / f'test_{timestamp}.png'
    image.save(str(output_path))
    print(f"Saved: {output_path}")

clear_memory()
print("Done!")
