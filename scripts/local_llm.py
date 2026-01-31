#!/usr/bin/env python3
"""
local_llm.py - Python module for delegating tasks to local LLMs

Usage as module:
    from local_llm import delegate, quick_code, quick_analysis
    
    result = delegate("Write a sorting function", task="coding")
    code = quick_code("Parse a JSON file in Python")
    analysis = quick_analysis("Summarize this text: ...")

Usage as CLI:
    python local_llm.py "Write a function"
    python local_llm.py --task analysis "Summarize: ..."
"""

import json
import subprocess
import sys
import time
from dataclasses import dataclass
from pathlib import Path
from typing import Optional, Dict, Any

SCRIPT_DIR = Path(__file__).parent

# Import metrics logging (lazy to avoid circular imports)
def _log_metrics(task_type: str, model: str, latency_sec: float, 
                 tokens_in: int, tokens_out: int, success: bool, error: str = None):
    """Log usage metrics."""
    try:
        from scripts.llm_metrics import log_usage
        log_usage(
            task_type=task_type,
            model=model,
            latency_sec=latency_sec,
            tokens_in=tokens_in,
            tokens_out=tokens_out,
            success=success,
            error=error
        )
    except Exception:
        pass  # Metrics logging should never break the main flow
COORDINATOR = SCRIPT_DIR / "local-agent-coordinator.py"

# Task types and their typical use cases
TASK_TYPES = {
    "coding": "Code generation, bug fixes, refactoring",
    "quick": "Simple questions, short answers (fastest)",
    "translation": "Language translation (uses TinyGrad)",
    "analysis": "Text analysis, summarization, reasoning",
    "creative": "Creative writing, brainstorming",
    "heavy": "Complex tasks requiring more compute (TinyGrad)",
}


@dataclass
class LLMResponse:
    """Response from local LLM delegation."""
    text: str
    model: str
    backend: str
    latency_ms: float
    tokens: int
    tokens_per_sec: float
    success: bool
    error: Optional[str] = None
    
    def __str__(self) -> str:
        return self.text
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "text": self.text,
            "model": self.model,
            "backend": self.backend,
            "latency_ms": self.latency_ms,
            "tokens": self.tokens,
            "tokens_per_sec": self.tokens_per_sec,
            "success": self.success,
            "error": self.error,
        }


def delegate(
    query: str,
    task: str = "coding",
    timeout: int = 120,
    json_output: bool = False,
) -> LLMResponse:
    """
    Delegate a task to local LLM via the coordinator.
    
    Args:
        query: The prompt/question to send
        task: Task type (coding, quick, translation, analysis, creative, heavy)
        timeout: Timeout in seconds
        json_output: Request JSON-formatted response
        
    Returns:
        LLMResponse with the result
    """
    if task not in TASK_TYPES:
        return LLMResponse(
            text="",
            model="",
            backend="",
            latency_ms=0,
            tokens=0,
            tokens_per_sec=0,
            success=False,
            error=f"Invalid task type: {task}. Valid: {list(TASK_TYPES.keys())}",
        )
    
    cmd = [
        sys.executable, str(COORDINATOR),
        "--task", task,
        "--query", query,
        "--json",  # Always get JSON for parsing
    ]
    
    start = time.time()
    try:
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=timeout,
        )
        latency = (time.time() - start) * 1000
        
        if result.returncode != 0:
            return LLMResponse(
                text="",
                model="",
                backend="",
                latency_ms=latency,
                tokens=0,
                tokens_per_sec=0,
                success=False,
                error=result.stderr or f"Exit code {result.returncode}",
            )
        
        # Parse JSON output
        try:
            data = json.loads(result.stdout)
            resp = LLMResponse(
                text=data.get("response", ""),
                model=data.get("model", "unknown"),
                backend=data.get("backend", "unknown"),
                latency_ms=data.get("latency_ms", latency),
                tokens=data.get("tokens", 0),
                tokens_per_sec=data.get("tokens_per_sec", 0),
                success=True,
            )
            # Log metrics
            _log_metrics(
                task_type=task,
                model=resp.model,
                latency_sec=resp.latency_ms / 1000,
                tokens_in=len(query.split()),  # Rough estimate
                tokens_out=resp.tokens,
                success=True
            )
            return resp
        except json.JSONDecodeError:
            # Fallback: treat as plain text
            resp = LLMResponse(
                text=result.stdout.strip(),
                model="unknown",
                backend="unknown",
                latency_ms=latency,
                tokens=0,
                tokens_per_sec=0,
                success=True,
            )
            _log_metrics(
                task_type=task,
                model="unknown",
                latency_sec=latency / 1000,
                tokens_in=len(query.split()),
                tokens_out=len(resp.text.split()),
                success=True
            )
            return resp
            
    except subprocess.TimeoutExpired:
        _log_metrics(task, "", timeout, len(query.split()), 0, False, f"Timeout after {timeout}s")
        return LLMResponse(
            text="",
            model="",
            backend="",
            latency_ms=timeout * 1000,
            tokens=0,
            tokens_per_sec=0,
            success=False,
            error=f"Timeout after {timeout}s",
        )
    except Exception as e:
        elapsed = time.time() - start
        _log_metrics(task, "", elapsed, len(query.split()), 0, False, str(e))
        return LLMResponse(
            text="",
            model="",
            backend="",
            latency_ms=elapsed * 1000,
            tokens=0,
            tokens_per_sec=0,
            success=False,
            error=str(e),
        )


def quick_code(query: str, timeout: int = 60) -> str:
    """Quick code generation. Returns just the text."""
    return delegate(query, task="coding", timeout=timeout).text


def quick_analysis(query: str, timeout: int = 90) -> str:
    """Quick text analysis. Returns just the text."""
    return delegate(query, task="analysis", timeout=timeout).text


def quick_answer(query: str, timeout: int = 30) -> str:
    """Quick simple answer (fastest model). Returns just the text."""
    return delegate(query, task="quick", timeout=timeout).text


def is_ollama_running() -> bool:
    """Check if Ollama server is running."""
    import urllib.request
    try:
        urllib.request.urlopen("http://localhost:11434/api/tags", timeout=2)
        return True
    except:
        return False


def start_ollama() -> bool:
    """Start Ollama server if not running."""
    if is_ollama_running():
        return True
    try:
        subprocess.Popen(
            ["ollama", "serve"],
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
        )
        time.sleep(3)
        return is_ollama_running()
    except:
        return False


# CLI interface
if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="Delegate tasks to local LLMs")
    parser.add_argument("query", nargs="?", help="Query/prompt to send")
    parser.add_argument("--task", "-t", default="coding", choices=list(TASK_TYPES.keys()))
    parser.add_argument("--timeout", type=int, default=120)
    parser.add_argument("--json", "-j", action="store_true", help="Output JSON")
    parser.add_argument("--check", action="store_true", help="Check if Ollama is running")
    
    args = parser.parse_args()
    
    if args.check:
        running = is_ollama_running()
        print(json.dumps({"ollama_running": running}))
        sys.exit(0 if running else 1)
    
    if not args.query:
        parser.print_help()
        sys.exit(1)
    
    # Ensure Ollama is running
    if not start_ollama():
        print("Error: Could not start Ollama", file=sys.stderr)
        sys.exit(1)
    
    response = delegate(args.query, task=args.task, timeout=args.timeout)
    
    if args.json:
        print(json.dumps(response.to_dict(), indent=2))
    else:
        if response.success:
            print(response.text)
        else:
            print(f"Error: {response.error}", file=sys.stderr)
            sys.exit(1)
