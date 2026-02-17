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
COORDINATOR = SCRIPT_DIR / "local-agent-coordinator.py"

# Fallback chains by task type (fastest to slowest, or most capable to least)
FALLBACK_CHAINS = {
    "coding": ["qwen2.5-coder:7b", "deepseek-coder:6.7b", "llama3.2:3b"],
    "quick": ["llama3.2:3b"],  # Already fastest
    "analysis": ["llama31-8b:latest", "qwen2.5-coder:7b", "llama3.2:3b"],
    "translation": ["llama31-8b:latest"],  # Best for translation
    "creative": ["llama31-8b:latest", "qwen2.5-coder:7b"],
    "heavy": ["llama31-8b:latest"],
}

# Retry configuration
DEFAULT_MAX_RETRIES = 2
DEFAULT_RETRY_DELAY = 1.0  # seconds
TIMEOUT_MULTIPLIER = 0.7  # Reduce timeout for fallback models

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


def delegate_with_retry(
    query: str,
    task: str = "coding",
    timeout: int = 120,
    max_retries: int = DEFAULT_MAX_RETRIES,
    retry_delay: float = DEFAULT_RETRY_DELAY,
) -> LLMResponse:
    """
    Delegate with automatic retry and model fallback.
    
    On failure/timeout, tries fallback models from the chain.
    Logs all fallback attempts to metrics.
    
    Args:
        query: The prompt to send
        task: Task type (coding, quick, analysis, etc.)
        timeout: Initial timeout in seconds
        max_retries: Maximum retry attempts
        retry_delay: Delay between retries in seconds
        
    Returns:
        LLMResponse with result (may include fallback info)
    """
    chain = FALLBACK_CHAINS.get(task, FALLBACK_CHAINS["coding"])
    last_error = None
    
    for attempt in range(max_retries + 1):
        # Get model for this attempt (cycle through chain)
        model_idx = min(attempt, len(chain) - 1)
        model = chain[model_idx]
        
        # Reduce timeout for fallback attempts
        current_timeout = int(timeout * (TIMEOUT_MULTIPLIER ** attempt))
        current_timeout = max(current_timeout, 15)  # Minimum 15s
        
        # Try delegation with specific model
        result = _delegate_with_model(query, task, model, current_timeout)
        
        if result.success:
            # Log if this was a fallback
            if attempt > 0:
                _log_metrics(
                    task_type=f"{task}_fallback",
                    model=model,
                    latency_sec=result.latency_ms / 1000,
                    tokens_in=0,
                    tokens_out=0,
                    success=True,
                    error=f"Fallback from attempt {attempt}"
                )
            return result
        
        last_error = result.error
        
        # Don't retry on certain errors
        if "Invalid task type" in str(last_error):
            break
        
        # Delay before retry
        if attempt < max_retries:
            time.sleep(retry_delay)
    
    # All attempts failed
    return LLMResponse(
        text="",
        model="",
        backend="",
        latency_ms=0,
        tokens=0,
        tokens_per_sec=0,
        success=False,
        error=f"All {max_retries + 1} attempts failed. Last error: {last_error}",
    )


def _delegate_with_model(
    query: str,
    task: str,
    model: str,
    timeout: int,
) -> LLMResponse:
    """Internal: delegate to specific model."""
    cmd = [
        sys.executable, str(COORDINATOR),
        "--task", task,
        "--model", model,
        "--query", query,
        "--json",
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
                model=model,
                backend="ollama",
                latency_ms=latency,
                tokens=0,
                tokens_per_sec=0,
                success=False,
                error=result.stderr or f"Exit code {result.returncode}",
            )
        
        try:
            data = json.loads(result.stdout)
            return LLMResponse(
                text=data.get("response", ""),
                model=data.get("model", model),
                backend=data.get("backend", "ollama"),
                latency_ms=data.get("latency_ms", latency),
                tokens=data.get("tokens", 0),
                tokens_per_sec=data.get("tokens_per_sec", 0),
                success=True,
            )
        except json.JSONDecodeError:
            return LLMResponse(
                text=result.stdout.strip(),
                model=model,
                backend="ollama",
                latency_ms=latency,
                tokens=0,
                tokens_per_sec=0,
                success=True,
            )
            
    except subprocess.TimeoutExpired:
        return LLMResponse(
            text="",
            model=model,
            backend="ollama",
            latency_ms=timeout * 1000,
            tokens=0,
            tokens_per_sec=0,
            success=False,
            error=f"Timeout after {timeout}s",
        )
    except Exception as e:
        return LLMResponse(
            text="",
            model=model,
            backend="ollama",
            latency_ms=(time.time() - start) * 1000,
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
