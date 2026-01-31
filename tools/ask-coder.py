#!/usr/bin/env python3
"""
Helper per chiedere codice al LLM locale.

Uso:
  python3 ask-coder.py "Write a function to..."
  python3 ask-coder.py -t 500 "Write a class..."
"""

import requests
import sys
import argparse

LLM_URL = "http://192.168.1.111:8080/v1/chat/completions"

def ask_coder(prompt, max_tokens=400):
    """Chiedi al LLM locale di scrivere codice."""
    try:
        r = requests.post(
            LLM_URL,
            json={"messages": [{"role": "user", "content": prompt}], "max_tokens": max_tokens},
            timeout=120
        )
        data = r.json()
        if "error" in data:
            return f"Error: {data['error']}"
        return data["choices"][0]["message"]["content"]
    except requests.exceptions.ConnectionError:
        return "Error: LLM server not running. Start with:\ncd ~/Projects/tinygrad-fix && PYTHONPATH=. AMD=1 AMD_LLVM=1 python3.11 scripts/llm-api-server.py"
    except Exception as e:
        return f"Error: {e}"

def main():
    parser = argparse.ArgumentParser(description="Ask local LLM to write code")
    parser.add_argument("prompt", nargs="*", help="The coding prompt")
    parser.add_argument("-t", "--tokens", type=int, default=400, help="Max tokens (default: 400)")
    args = parser.parse_args()

    if not args.prompt:
        print("Usage: ask-coder.py 'Write a function to...'")
        print("\nExamples:")
        print("  ask-coder.py 'Write a Python function to validate email'")
        print("  ask-coder.py -t 500 'Write a class UserService with CRUD methods'")
        sys.exit(1)

    prompt = " ".join(args.prompt)
    print(f"Asking LLM ({args.tokens} max tokens)...\n")
    result = ask_coder(prompt, args.tokens)
    print(result)

if __name__ == "__main__":
    main()
