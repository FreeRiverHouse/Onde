#!/usr/bin/env python3
"""
Local Code Review via LLM
Uses deepseek-coder or qwen2.5-coder via Ollama for automated code review.

Usage:
    from scripts.local_code_review import review_code, review_file, review_diff
    
    # Review a code string
    result = review_code("def foo(): pass")
    
    # Review a file
    result = review_file("path/to/file.py")
    
    # Review git diff
    result = review_diff()  # staged changes
    result = review_diff("HEAD~1")  # last commit
"""

import subprocess
import requests
import json
import sys
import os
from dataclasses import dataclass
from typing import Optional
from pathlib import Path

# Config
OLLAMA_HOST = os.getenv("OLLAMA_HOST", "http://localhost:11434")
DEFAULT_MODEL = os.getenv("CODE_REVIEW_MODEL", "deepseek-coder:6.7b")
MAX_CHARS = 15000

@dataclass
class ReviewResult:
    """Result of a code review."""
    review: str
    model: str
    duration_sec: float
    truncated: bool = False
    error: Optional[str] = None
    
    @property
    def ok(self) -> bool:
        return self.error is None


def is_ollama_running() -> bool:
    """Check if Ollama server is running."""
    try:
        resp = requests.get(f"{OLLAMA_HOST}/api/tags", timeout=2)
        return resp.status_code == 200
    except:
        return False


def call_ollama(prompt: str, model: str = DEFAULT_MODEL) -> str:
    """Call Ollama API for code review."""
    payload = {
        "model": model,
        "prompt": prompt,
        "stream": False,
        "options": {
            "temperature": 0.3,
            "num_predict": 1024
        }
    }
    
    resp = requests.post(
        f"{OLLAMA_HOST}/api/generate",
        json=payload,
        timeout=120
    )
    resp.raise_for_status()
    
    return resp.json().get("response", "")


def build_prompt(code: str) -> str:
    """Build the code review prompt."""
    return f"""You are an expert code reviewer. Analyze the following code/diff and provide a concise review.

Focus on:
1. 🐛 **Bugs**: Logic errors, edge cases, potential crashes
2. 🔒 **Security**: Injection, auth issues, data exposure
3. ⚡ **Performance**: Inefficiencies, memory leaks, O(n²) loops
4. 📝 **Style**: Naming, structure, readability issues
5. ✅ **Good**: What's done well (brief)

Format your response as markdown with clear sections. Be concise - only mention significant issues.

If the code looks good, say so briefly.

```
{code}
```"""


def review_code(code: str, model: str = DEFAULT_MODEL) -> ReviewResult:
    """Review a code string."""
    import time
    
    if not is_ollama_running():
        return ReviewResult(
            review="",
            model=model,
            duration_sec=0,
            error="Ollama is not running. Start with: ollama serve"
        )
    
    truncated = False
    if len(code) > MAX_CHARS:
        code = code[:MAX_CHARS] + "\n... (truncated)"
        truncated = True
    
    prompt = build_prompt(code)
    
    start = time.time()
    try:
        review = call_ollama(prompt, model)
        duration = time.time() - start
        
        return ReviewResult(
            review=review,
            model=model,
            duration_sec=duration,
            truncated=truncated
        )
    except Exception as e:
        return ReviewResult(
            review="",
            model=model,
            duration_sec=time.time() - start,
            error=str(e)
        )


def review_file(path: str, model: str = DEFAULT_MODEL) -> ReviewResult:
    """Review a file."""
    try:
        code = Path(path).read_text()
        return review_code(code, model)
    except Exception as e:
        return ReviewResult(
            review="",
            model=model,
            duration_sec=0,
            error=f"Failed to read file: {e}"
        )


def review_diff(ref: str = None, model: str = DEFAULT_MODEL) -> ReviewResult:
    """Review git diff."""
    try:
        if ref:
            result = subprocess.run(
                ["git", "diff", ref],
                capture_output=True,
                text=True
            )
        else:
            # Try staged first, then HEAD
            result = subprocess.run(
                ["git", "diff", "--cached"],
                capture_output=True,
                text=True
            )
            if not result.stdout.strip():
                result = subprocess.run(
                    ["git", "diff", "HEAD"],
                    capture_output=True,
                    text=True
                )
        
        diff = result.stdout.strip()
        if not diff:
            return ReviewResult(
                review="",
                model=model,
                duration_sec=0,
                error="No diff found"
            )
        
        return review_code(diff, model)
    except Exception as e:
        return ReviewResult(
            review="",
            model=model,
            duration_sec=0,
            error=f"Git error: {e}"
        )


def main():
    """CLI entry point."""
    import argparse
    
    parser = argparse.ArgumentParser(description="Local code review via LLM")
    parser.add_argument("file", nargs="?", help="File to review")
    parser.add_argument("--diff", "-d", action="store_true", 
                       help="Review staged/uncommitted changes")
    parser.add_argument("--ref", help="Git ref to diff against (e.g., HEAD~1)")
    parser.add_argument("--model", default=DEFAULT_MODEL,
                       help=f"Model to use (default: {DEFAULT_MODEL})")
    
    args = parser.parse_args()
    
    if args.diff or args.ref:
        result = review_diff(args.ref, args.model)
    elif args.file:
        result = review_file(args.file, args.model)
    elif not sys.stdin.isatty():
        code = sys.stdin.read()
        result = review_code(code, args.model)
    else:
        parser.print_help()
        sys.exit(1)
    
    if result.error:
        print(f"❌ Error: {result.error}", file=sys.stderr)
        sys.exit(1)
    
    print(f"🔍 Code Review (model: {result.model})")
    if result.truncated:
        print("⚠️  Input was truncated")
    print()
    print(result.review)
    print()
    print(f"✅ Completed in {result.duration_sec:.1f}s")


if __name__ == "__main__":
    main()
