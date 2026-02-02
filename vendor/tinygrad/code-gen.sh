#!/bin/bash
# Generazione codice su Radeon 7900 XT
cd ~/tinygrad
AMD=1 PYTHONPATH=. python3 examples/llama3.py \
  --model TriAiExperiments/SFR-Iterative-DPO-LLaMA-3-8B-R \
  --prompt "$1" \
  --count ${2:-500} \
  --temperature ${3:-0.7}
