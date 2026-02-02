#!/usr/bin/env python3
"""
LLaMA 3.1 8B su AMD Radeon - Wrapper semplice

Usage:
    AMD=1 AMD_LLVM=1 python3 scripts/llama-amd.py "Translate to Italian: Hello world"
    AMD=1 AMD_LLVM=1 python3 scripts/llama-amd.py "Write a python function to sort a list"
    echo "What is 2+2?" | AMD=1 AMD_LLVM=1 python3 scripts/llama-amd.py
"""
import os
import sys
import time
import argparse

# Add tinygrad to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'tinygrad/apps'))

from tinygrad import Tensor, dtypes, Device, nn
from tinygrad.helpers import GlobalCounters
from llm import Transformer, SimpleTokenizer

# Default model path
MODEL_PATH = '/Volumes/DATI-SSD/llm-models/Meta-Llama-3.1-8B-Instruct-Q4_K_M.gguf'

def load_model(model_path: str, max_context: int = 512):
    """Load the LLaMA model and tokenizer."""
    print(f"Loading model from: {model_path}")
    print(f"Device: {Device.DEFAULT}")

    t0 = time.time()
    gguf_tensor = Tensor.empty(os.stat(model_path).st_size, dtype=dtypes.uint8, device=f'disk:{model_path}')
    model, kv = Transformer.from_gguf(gguf_tensor.to(None), max_context=max_context)
    tokenizer = SimpleTokenizer.from_gguf_kv(kv)

    print(f"Model loaded in {time.time()-t0:.1f}s")
    return model, tokenizer

def generate(model, tokenizer, prompt: str, max_tokens: int = 100, verbose: bool = True):
    """Generate response for a prompt."""
    # Format prompt for LLaMA 3.1 Instruct
    formatted = tokenizer.role('user') + tokenizer.encode(prompt) + tokenizer.end_turn(128009) + tokenizer.role('assistant')

    if verbose:
        print(f"\nPrompt: {prompt}")
        print(f"Input tokens: {len(formatted)}")
        print("Generating...\n")

    gen = model.generate(formatted, 0)
    output_tokens = []

    t0 = time.time()
    for i in range(max_tokens):
        GlobalCounters.reset()
        tok = next(gen)
        output_tokens.append(tok)

        if verbose:
            text = tokenizer.decode([tok])
            print(text, end='', flush=True)

        # Stop on end tokens
        if tok in [128009, 128001]:
            break

    elapsed = time.time() - t0

    if verbose:
        print(f"\n\n--- Stats ---")
        print(f"Tokens: {len(output_tokens)}")
        print(f"Time: {elapsed:.1f}s")
        print(f"Speed: {len(output_tokens)/elapsed:.2f} tok/s")

    return tokenizer.decode(output_tokens)

def main():
    parser = argparse.ArgumentParser(description="LLaMA 3.1 8B su AMD Radeon")
    parser.add_argument('prompt', nargs='?', help='Prompt (or pipe from stdin)')
    parser.add_argument('--model', default=MODEL_PATH, help='Path to GGUF model')
    parser.add_argument('--max-tokens', type=int, default=100, help='Max tokens to generate')
    parser.add_argument('--max-context', type=int, default=512, help='Max context length')
    parser.add_argument('-q', '--quiet', action='store_true', help='Quiet mode (less output)')
    args = parser.parse_args()

    # Get prompt from args or stdin
    if args.prompt:
        prompt = args.prompt
    elif not sys.stdin.isatty():
        prompt = sys.stdin.read().strip()
    else:
        print("Error: No prompt provided. Use: python llama-amd.py 'your prompt' or pipe input")
        sys.exit(1)

    # Check model exists
    if not os.path.exists(args.model):
        print(f"Error: Model not found at {args.model}")
        sys.exit(1)

    # Load and generate
    model, tokenizer = load_model(args.model, args.max_context)
    result = generate(model, tokenizer, prompt, args.max_tokens, verbose=not args.quiet)

    if args.quiet:
        print(result)

if __name__ == '__main__':
    main()
