#!/usr/bin/env python3
"""
Helper per chiedere codice al LLM locale (Ollama).

Uso:
  python3 ask-coder.py "Write a function to..."
  python3 ask-coder.py -m llama3.2:3b "Quick question"  # Veloce
  python3 ask-coder.py -m deepseek-coder:6.7b "Complex code"  # Preciso
"""

import requests
import sys
import argparse

OLLAMA_URL = "http://192.168.1.111:11434/api/generate"

MODELS = {
    "fast": "llama3.2:3b",
    "coding": "deepseek-coder:6.7b",
    "qwen": "qwen2.5-coder:7b",
    "llama": "llama31-8b:latest"
}

def ask_coder(prompt, model="deepseek-coder:6.7b"):
    """Chiedi al LLM locale di scrivere codice."""
    try:
        r = requests.post(
            OLLAMA_URL,
            json={
                "model": model,
                "prompt": f"Write clean, working code. Be concise.\n\n{prompt}",
                "stream": False
            },
            timeout=300
        )
        data = r.json()
        if "error" in data:
            return f"Error: {data['error']}"
        return data["response"]
    except requests.exceptions.ConnectionError:
        return "Error: Ollama not running.\nStart with: OLLAMA_HOST=0.0.0.0:11434 ollama serve"
    except Exception as e:
        return f"Error: {e}"

def main():
    parser = argparse.ArgumentParser(description="Ask local LLM to write code")
    parser.add_argument("prompt", nargs="*", help="The coding prompt")
    parser.add_argument("-m", "--model", default="deepseek-coder:6.7b",
                        help="Model (fast/coding/qwen/llama or full name)")
    args = parser.parse_args()

    if not args.prompt:
        print("Usage: ask-coder.py 'Write a function to...'")
        print("\nModels:")
        print("  -m fast    = llama3.2:3b (2-3s)")
        print("  -m coding  = deepseek-coder:6.7b (1-3min, best for code)")
        print("  -m qwen    = qwen2.5-coder:7b")
        print("  -m llama   = llama31-8b:latest")
        print("\nExamples:")
        print("  ask-coder.py 'Write is_prime(n) in Python'")
        print("  ask-coder.py -m fast 'What is a list comprehension?'")
        sys.exit(1)

    model = MODELS.get(args.model, args.model)
    prompt = " ".join(args.prompt)
    print(f"Asking {model}...\n")
    result = ask_coder(prompt, model)
    print(result)

if __name__ == "__main__":
    main()
