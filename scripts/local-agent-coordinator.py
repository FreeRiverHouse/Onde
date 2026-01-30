#!/usr/bin/env python3
"""
Local Agent Coordinator - Unified interface for local LLMs

Routes tasks to appropriate backend:
- Ollama (M1 Metal): Quick queries, code generation, small tasks
- TinyGrad LLaMA 3 8B (Radeon 7900 XT): Heavy tasks, translation, long context

Usage:
    python local-agent-coordinator.py --query "Write a function to sort a list"
    python local-agent-coordinator.py --query "Translate to Italian" --backend tinygrad
    python local-agent-coordinator.py --task coding --query "Fix this bug..."
    python local-agent-coordinator.py --list-backends
    
Environment:
    OLLAMA_HOST: Ollama server URL (default: http://localhost:11434)
    TINYGRAD_PATH: Path to TinyGrad examples (default: ~/tinygrad/examples)
"""

import argparse
import json
import os
import subprocess
import sys
import time
from pathlib import Path
from typing import Optional, Dict, Any

# Backend configuration
OLLAMA_HOST = os.environ.get("OLLAMA_HOST", "http://localhost:11434")
TINYGRAD_PATH = Path(os.environ.get("TINYGRAD_PATH", os.path.expanduser("~/tinygrad/examples")))

# Task routing rules
TASK_ROUTING = {
    "coding": {"backend": "ollama", "model": "qwen2.5-coder:7b"},
    "quick": {"backend": "ollama", "model": "llama3.2:3b"},
    "translation": {"backend": "tinygrad", "model": "llama3-8b"},
    "analysis": {"backend": "ollama", "model": "llama31-8b:latest"},
    "creative": {"backend": "ollama", "model": "llama31-8b:latest"},
    "heavy": {"backend": "tinygrad", "model": "llama3-8b"},
}

# Ollama available models (from `ollama list`)
OLLAMA_MODELS = {
    "qwen2.5-coder:7b": {"size": "4.7GB", "specialty": "coding"},
    "llama31-8b:latest": {"size": "4.9GB", "specialty": "general"},
    "llama3.2:3b": {"size": "2.0GB", "specialty": "quick tasks"},
}


def check_ollama_available() -> bool:
    """Check if Ollama server is running."""
    try:
        import urllib.request
        req = urllib.request.urlopen(f"{OLLAMA_HOST}/api/tags", timeout=2)
        return req.status == 200
    except Exception:
        return False


def check_tinygrad_available() -> bool:
    """Check if TinyGrad LLaMA 3 is available."""
    llama_script = TINYGRAD_PATH / "llama3.py"
    return llama_script.exists()


def query_ollama(prompt: str, model: str = "qwen2.5-coder:7b", 
                 system_prompt: Optional[str] = None) -> Dict[str, Any]:
    """Send query to Ollama and return response."""
    import urllib.request
    import urllib.error
    
    start_time = time.time()
    
    payload = {
        "model": model,
        "prompt": prompt,
        "stream": False,
    }
    
    if system_prompt:
        payload["system"] = system_prompt
    
    try:
        req = urllib.request.Request(
            f"{OLLAMA_HOST}/api/generate",
            data=json.dumps(payload).encode(),
            headers={"Content-Type": "application/json"},
            method="POST"
        )
        
        with urllib.request.urlopen(req, timeout=120) as response:
            result = json.loads(response.read().decode())
            
        latency = time.time() - start_time
        
        return {
            "success": True,
            "backend": "ollama",
            "model": model,
            "response": result.get("response", ""),
            "latency_seconds": round(latency, 2),
            "tokens": result.get("eval_count", 0),
            "tokens_per_second": round(result.get("eval_count", 0) / latency, 1) if latency > 0 else 0,
        }
        
    except urllib.error.URLError as e:
        return {
            "success": False,
            "backend": "ollama",
            "model": model,
            "error": str(e),
            "latency_seconds": time.time() - start_time,
        }


def query_tinygrad(prompt: str, max_tokens: int = 512) -> Dict[str, Any]:
    """Send query to TinyGrad LLaMA 3 8B via subprocess."""
    start_time = time.time()
    
    llama_script = TINYGRAD_PATH / "llama3.py"
    
    if not llama_script.exists():
        return {
            "success": False,
            "backend": "tinygrad",
            "model": "llama3-8b",
            "error": f"TinyGrad LLaMA script not found at {llama_script}",
        }
    
    # Activate TinyGrad venv and run
    venv_activate = Path(os.path.expanduser("~/.venv-tinygrad/bin/activate"))
    
    cmd = f"""
    source {venv_activate} 2>/dev/null || true
    cd {TINYGRAD_PATH}
    python llama3.py --prompt "{prompt.replace('"', '\\"')}" --max-tokens {max_tokens} 2>/dev/null
    """
    
    try:
        result = subprocess.run(
            ["bash", "-c", cmd],
            capture_output=True,
            text=True,
            timeout=300,  # 5 min timeout for heavy tasks
            cwd=str(TINYGRAD_PATH),
        )
        
        latency = time.time() - start_time
        
        if result.returncode == 0:
            return {
                "success": True,
                "backend": "tinygrad",
                "model": "llama3-8b (Radeon 7900 XT)",
                "response": result.stdout.strip(),
                "latency_seconds": round(latency, 2),
            }
        else:
            return {
                "success": False,
                "backend": "tinygrad",
                "model": "llama3-8b",
                "error": result.stderr or "Unknown error",
                "latency_seconds": round(latency, 2),
            }
            
    except subprocess.TimeoutExpired:
        return {
            "success": False,
            "backend": "tinygrad",
            "model": "llama3-8b",
            "error": "Query timed out after 5 minutes",
            "latency_seconds": 300,
        }


def route_query(query: str, task_type: Optional[str] = None, 
                backend: Optional[str] = None, model: Optional[str] = None) -> Dict[str, Any]:
    """Route query to appropriate backend based on task type or explicit choice."""
    
    # Explicit backend override
    if backend:
        if backend == "ollama":
            return query_ollama(query, model or "qwen2.5-coder:7b")
        elif backend == "tinygrad":
            return query_tinygrad(query)
        else:
            return {"success": False, "error": f"Unknown backend: {backend}"}
    
    # Task-based routing
    if task_type and task_type in TASK_ROUTING:
        route = TASK_ROUTING[task_type]
        if route["backend"] == "ollama":
            return query_ollama(query, route["model"])
        else:
            return query_tinygrad(query)
    
    # Default: use Ollama for quick response
    return query_ollama(query, model or "qwen2.5-coder:7b")


def list_backends() -> None:
    """Print available backends and their status."""
    print("🤖 Local Agent Coordinator - Backend Status\n")
    
    # Ollama
    ollama_ok = check_ollama_available()
    print(f"📦 Ollama (M1 Metal): {'🟢 Available' if ollama_ok else '🔴 Not Running'}")
    if ollama_ok:
        for model, info in OLLAMA_MODELS.items():
            print(f"   - {model}: {info['size']} ({info['specialty']})")
    
    print()
    
    # TinyGrad
    tinygrad_ok = check_tinygrad_available()
    print(f"🎮 TinyGrad (Radeon 7900 XT): {'🟢 Available' if tinygrad_ok else '🔴 Not Found'}")
    if tinygrad_ok:
        print(f"   - llama3-8b: ~16GB VRAM (translation, heavy tasks)")
    
    print("\n📋 Task Routing Rules:")
    for task, route in TASK_ROUTING.items():
        print(f"   --task {task}: {route['backend']} ({route['model']})")


def main():
    parser = argparse.ArgumentParser(
        description="Local Agent Coordinator - Route queries to local LLMs"
    )
    parser.add_argument("--query", "-q", help="Query to send to LLM")
    parser.add_argument("--task", "-t", choices=list(TASK_ROUTING.keys()),
                        help="Task type for automatic routing")
    parser.add_argument("--backend", "-b", choices=["ollama", "tinygrad"],
                        help="Force specific backend")
    parser.add_argument("--model", "-m", help="Specific model to use (Ollama)")
    parser.add_argument("--list-backends", "-l", action="store_true",
                        help="List available backends and models")
    parser.add_argument("--json", action="store_true",
                        help="Output as JSON")
    parser.add_argument("--system", "-s", help="System prompt (Ollama only)")
    
    args = parser.parse_args()
    
    if args.list_backends:
        list_backends()
        return
    
    if not args.query:
        parser.print_help()
        sys.exit(1)
    
    result = route_query(
        args.query,
        task_type=args.task,
        backend=args.backend,
        model=args.model,
    )
    
    if args.json:
        print(json.dumps(result, indent=2))
    else:
        if result["success"]:
            print(f"✅ [{result['backend']}:{result.get('model', 'unknown')}] "
                  f"({result['latency_seconds']}s)\n")
            print(result["response"])
        else:
            print(f"❌ Error: {result.get('error', 'Unknown error')}")
            sys.exit(1)


if __name__ == "__main__":
    main()
