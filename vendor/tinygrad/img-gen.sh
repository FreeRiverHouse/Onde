#!/bin/bash
# Generazione immagini su Radeon 7900 XT
cd ~/tinygrad
AMD=1 PYTHONPATH=. python3 examples/stable_diffusion.py \
  --prompt "$1" \
  --out "${2:-/tmp/generated.png}" \
  --steps ${3:-20}
echo "Saved to ${2:-/tmp/generated.png}"
