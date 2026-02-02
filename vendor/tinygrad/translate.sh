#!/bin/bash
# Traduzioni su Radeon 7900 XT
TEXT="$1"
TARGET_LANG="${2:-English}"
cd ~/tinygrad
AMD=1 PYTHONPATH=. python3 examples/llama3.py \
  --model TriAiExperiments/SFR-Iterative-DPO-LLaMA-3-8B-R \
  --prompt "Translate to $TARGET_LANG: $TEXT" \
  --count 200 \
  --temperature 0.3
