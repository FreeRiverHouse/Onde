#!/usr/bin/env python3
"""
Bot LLM Integration - Simple wrapper for bots to use local LLMs.

Usage:
    from scripts.bot_llm import ask, ask_code, is_available, health_check

    # Quick question
    answer = ask("What is the capital of France?")

    # Code generation
    code = ask_code("Write a Python function to parse JSON")

    # Check availability
    if is_available():
        result = ask("Complex task...")
    else:
        # Fallback to Claude API or skip

Example in heartbeat/cron:
    from scripts.bot_llm import ask, health_check

    # Check health (logs to TASKS.md if issues)
    status = health_check()
    if not status['healthy']:
        print(f"LLM Warning: {status['error']}")

    # Use local LLM for simple tasks
    summary = ask("Summarize this log: " + log_content)
"""

import os
import sys
import requests
import subprocess
from datetime import datetime
from typing import Optional, Dict, Any, Tuple

# Add scripts to path for imports
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Config
OLLAMA_URL = os.environ.get("OLLAMA_URL", "http://127.0.0.1:11434")
TASKS_FILE = os.path.expanduser("~/Projects/Onde/TASKS.md")
HEALTH_STATE_FILE = os.path.expanduser("~/Projects/Onde/data/llm-health-state.json")

# Quick timeout for availability checks
PING_TIMEOUT = 2
# Normal request timeouts
TIMEOUT_FAST = 30
TIMEOUT_CODING = 120


def is_available() -> bool:
    """Quick check if Ollama is responding."""
    try:
        r = requests.get(f"{OLLAMA_URL}/", timeout=PING_TIMEOUT)
        return r.status_code == 200
    except:
        return False


def _ensure_ollama_running() -> bool:
    """Try to start Ollama if not running."""
    if is_available():
        return True
    
    try:
        # Try to start Ollama service (Mac-specific)
        subprocess.Popen(
            ["ollama", "serve"],
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
            start_new_session=True
        )
        # Wait a bit and check again
        import time
        time.sleep(3)
        return is_available()
    except:
        return False


def ask(prompt: str, model: str = "llama3.2:3b", timeout: int = TIMEOUT_FAST) -> Optional[str]:
    """
    Ask local LLM a question. Returns None if unavailable.
    
    Args:
        prompt: The question/prompt
        model: Model to use (default: llama3.2:3b for speed)
        timeout: Request timeout in seconds
    
    Returns:
        Response text or None if error
    """
    if not _ensure_ollama_running():
        _log_error("ask", "Ollama not available")
        return None
    
    try:
        r = requests.post(
            f"{OLLAMA_URL}/api/generate",
            json={"model": model, "prompt": prompt, "stream": False},
            timeout=timeout
        )
        if r.status_code == 200:
            return r.json().get("response", "")
        else:
            _log_error("ask", f"HTTP {r.status_code}")
            return None
    except requests.Timeout:
        _log_error("ask", f"Timeout after {timeout}s")
        return None
    except Exception as e:
        _log_error("ask", str(e))
        return None


def ask_code(prompt: str, model: str = "deepseek-coder:6.7b", timeout: int = TIMEOUT_CODING) -> Optional[str]:
    """
    Ask local LLM for code generation. Uses coding-optimized model.
    
    Args:
        prompt: The coding task
        model: Model to use (default: deepseek-coder for quality)
        timeout: Request timeout in seconds
    
    Returns:
        Generated code or None if error
    """
    return ask(prompt, model=model, timeout=timeout)


def ask_with_fallback(prompt: str, models: list = None) -> Tuple[Optional[str], str]:
    """
    Try multiple models in sequence until one succeeds.
    
    Args:
        prompt: The question/prompt
        models: List of models to try (default: fast -> coding)
    
    Returns:
        (response, model_used) or (None, "none") if all failed
    """
    if models is None:
        models = ["llama3.2:3b", "deepseek-coder:6.7b", "qwen2.5-coder:7b"]
    
    for model in models:
        result = ask(prompt, model=model)
        if result:
            return (result, model)
    
    return (None, "none")


def health_check() -> Dict[str, Any]:
    """
    Check LLM health and log issues.
    
    Returns:
        Dict with 'healthy', 'error', 'latency_ms', 'models' keys
    """
    status = {
        "healthy": False,
        "error": None,
        "latency_ms": None,
        "models": [],
        "checked_at": datetime.now().isoformat()
    }
    
    if not is_available():
        status["error"] = "Ollama not responding"
        return status
    
    # Check available models
    try:
        r = requests.get(f"{OLLAMA_URL}/api/tags", timeout=5)
        if r.status_code == 200:
            models = r.json().get("models", [])
            status["models"] = [m.get("name") for m in models]
    except:
        pass
    
    # Quick latency test
    try:
        import time
        start = time.time()
        r = requests.post(
            f"{OLLAMA_URL}/api/generate",
            json={"model": "llama3.2:3b", "prompt": "Say OK", "stream": False},
            timeout=30
        )
        latency = (time.time() - start) * 1000
        
        if r.status_code == 200 and "ok" in r.json().get("response", "").lower():
            status["healthy"] = True
            status["latency_ms"] = round(latency, 1)
        else:
            status["error"] = f"Unexpected response: {r.status_code}"
    except Exception as e:
        status["error"] = str(e)
    
    # Log if unhealthy
    if not status["healthy"] and status["error"]:
        _log_error("health_check", status["error"])
    
    # Save state
    _save_health_state(status)
    
    return status


def _log_error(context: str, error: str):
    """Log LLM error (for debugging, not TASKS.md spam)."""
    try:
        log_file = os.path.expanduser("~/Projects/Onde/data/llm-errors.log")
        os.makedirs(os.path.dirname(log_file), exist_ok=True)
        with open(log_file, "a") as f:
            f.write(f"[{datetime.now().isoformat()}] {context}: {error}\n")
    except:
        pass


def _save_health_state(status: Dict):
    """Save health state for monitoring."""
    try:
        import json
        os.makedirs(os.path.dirname(HEALTH_STATE_FILE), exist_ok=True)
        with open(HEALTH_STATE_FILE, "w") as f:
            json.dump(status, f, indent=2)
    except:
        pass


# Quick CLI for testing
if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="Bot LLM Integration")
    parser.add_argument("--check", action="store_true", help="Health check")
    parser.add_argument("--ask", type=str, help="Ask a question")
    parser.add_argument("--code", type=str, help="Code generation")
    args = parser.parse_args()
    
    if args.check:
        status = health_check()
        print(f"Healthy: {status['healthy']}")
        print(f"Latency: {status['latency_ms']}ms")
        print(f"Models: {', '.join(status['models'])}")
        if status['error']:
            print(f"Error: {status['error']}")
    elif args.ask:
        result = ask(args.ask)
        print(result or "(no response)")
    elif args.code:
        result = ask_code(args.code)
        print(result or "(no response)")
    else:
        print("Usage: python3 bot_llm.py --check | --ask 'prompt' | --code 'task'")
