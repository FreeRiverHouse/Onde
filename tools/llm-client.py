#!/usr/bin/env python3
"""
LLM Client per Bot - Con error handling e GitHub issue creation

Uso:
  from llm_client import LLMClient

  client = LLMClient()
  response = client.ask("Write a function...")

  # O da CLI:
  python3 llm-client.py "Your prompt here"
  python3 llm-client.py -m deepseek-coder:6.7b "Complex coding task"
"""

import requests
import subprocess
import json
import sys
import os
from datetime import datetime
from typing import Optional, Dict, Any

# Config
OLLAMA_URL = "http://192.168.1.111:11434"
TASKS_FILE = os.path.expanduser("~/Projects/Onde/TASKS.md")
DEFAULT_MODEL = "llama3.2:3b"
CODING_MODEL = "deepseek-coder:6.7b"
TIMEOUT_FAST = 60
TIMEOUT_SLOW = 300

# Models config
MODELS = {
    "fast": {"name": "llama3.2:3b", "timeout": 60, "description": "Fast chat (2-3s)"},
    "chat": {"name": "llama31-8b:latest", "timeout": 120, "description": "Quality chat (15-30s)"},
    "coding": {"name": "deepseek-coder:6.7b", "timeout": 300, "description": "Coding (1-3min)"},
    "qwen": {"name": "qwen2.5-coder:7b", "timeout": 300, "description": "Alt coding (1-3min)"},
}


class LLMClient:
    """Client robusto per LLM locale con error handling e logging."""

    def __init__(self, base_url: str = OLLAMA_URL, auto_report_errors: bool = True):
        self.base_url = base_url
        self.auto_report_errors = auto_report_errors
        self.last_error = None
        self.request_count = 0
        self.error_count = 0

    def health_check(self) -> Dict[str, Any]:
        """Verifica se Ollama è attivo e quali modelli sono disponibili."""
        try:
            r = requests.get(f"{self.base_url}/api/tags", timeout=10)
            data = r.json()
            return {
                "status": "ok",
                "models": [m["name"] for m in data.get("models", [])],
                "url": self.base_url
            }
        except requests.exceptions.ConnectionError:
            return {"status": "error", "error": "Connection refused - Ollama not running"}
        except Exception as e:
            return {"status": "error", "error": str(e)}

    def ask(
        self,
        prompt: str,
        model: str = DEFAULT_MODEL,
        timeout: Optional[int] = None,
        system_prompt: Optional[str] = None,
        report_errors: bool = True
    ) -> Optional[str]:
        """
        Invia prompt al LLM e ritorna la risposta.

        Args:
            prompt: Il prompt da inviare
            model: Nome del modello (o alias: fast, chat, coding, qwen)
            timeout: Timeout in secondi (auto se None)
            system_prompt: System prompt opzionale
            report_errors: Se True, crea GitHub issue su errori

        Returns:
            Risposta del modello o None se errore
        """
        self.request_count += 1

        # Resolve model alias
        if model in MODELS:
            model_config = MODELS[model]
            model = model_config["name"]
            if timeout is None:
                timeout = model_config["timeout"]

        if timeout is None:
            timeout = TIMEOUT_FAST if "3b" in model else TIMEOUT_SLOW

        # Build request
        payload = {
            "model": model,
            "prompt": prompt,
            "stream": False
        }

        if system_prompt:
            payload["system"] = system_prompt

        try:
            r = requests.post(
                f"{self.base_url}/api/generate",
                json=payload,
                timeout=timeout
            )

            data = r.json()

            if "error" in data:
                self._handle_error(
                    error_type="API_ERROR",
                    error_msg=data["error"],
                    model=model,
                    prompt=prompt,
                    report=report_errors
                )
                return None

            return data.get("response", "")

        except requests.exceptions.Timeout:
            self._handle_error(
                error_type="TIMEOUT",
                error_msg=f"Request timed out after {timeout}s",
                model=model,
                prompt=prompt,
                report=report_errors
            )
            return None

        except requests.exceptions.ConnectionError:
            self._handle_error(
                error_type="CONNECTION_ERROR",
                error_msg="Cannot connect to Ollama - is it running?",
                model=model,
                prompt=prompt,
                report=report_errors
            )
            return None

        except Exception as e:
            self._handle_error(
                error_type="UNKNOWN_ERROR",
                error_msg=str(e),
                model=model,
                prompt=prompt,
                report=report_errors
            )
            return None

    def ask_coding(self, prompt: str, **kwargs) -> Optional[str]:
        """Shortcut per coding tasks con DeepSeek."""
        return self.ask(
            f"Write clean, working code. Be concise.\n\n{prompt}",
            model=CODING_MODEL,
            **kwargs
        )

    def ask_fast(self, prompt: str, **kwargs) -> Optional[str]:
        """Shortcut per risposte veloci."""
        return self.ask(prompt, model=DEFAULT_MODEL, **kwargs)

    def _handle_error(
        self,
        error_type: str,
        error_msg: str,
        model: str,
        prompt: str,
        report: bool = True
    ):
        """Gestisce errori: logga e opzionalmente crea GitHub issue."""
        self.error_count += 1
        timestamp = datetime.now().isoformat()

        self.last_error = {
            "type": error_type,
            "message": error_msg,
            "model": model,
            "prompt": prompt[:200] + "..." if len(prompt) > 200 else prompt,
            "timestamp": timestamp
        }

        # Log to stderr
        print(f"[LLM-ERROR] {timestamp} | {error_type}: {error_msg}", file=sys.stderr)

        # Log to TASKS.md if enabled
        if report and self.auto_report_errors:
            self._create_task_entry(error_type, error_msg, model, prompt)

    def _create_task_entry(
        self,
        error_type: str,
        error_msg: str,
        model: str,
        prompt: str
    ):
        """Logga errore in TASKS.md."""
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M")

        # Get next task number
        task_num = self._get_next_task_number()

        entry = f"""
### [T{task_num}] LLM-ERROR: {error_type}
- **Status**: TODO
- **Owner**: TBD
- **Created**: {timestamp}
- **Priority**: P2
- **Notes**: Auto-logged error from LLMClient
  - **Error**: {error_msg[:200]}
  - **Model**: {model}
  - **URL**: {self.base_url}
  - **Prompt**: {prompt[:100]}...
  - [ ] Investigate and fix
"""

        try:
            with open(TASKS_FILE, "a") as f:
                f.write(entry)
            print(f"[LLM-CLIENT] Error logged to TASKS.md as T{task_num}", file=sys.stderr)
        except Exception as e:
            print(f"[LLM-CLIENT] Failed to log to TASKS.md: {e}", file=sys.stderr)

    def _get_next_task_number(self) -> int:
        """Trova il prossimo numero di task disponibile."""
        try:
            with open(TASKS_FILE, "r") as f:
                content = f.read()
            import re
            numbers = re.findall(r'\[T(\d+)\]', content)
            if numbers:
                return max(int(n) for n in numbers) + 1
            return 1000
        except:
            return 9999

    def get_stats(self) -> Dict[str, Any]:
        """Ritorna statistiche del client."""
        return {
            "requests": self.request_count,
            "errors": self.error_count,
            "error_rate": self.error_count / max(1, self.request_count),
            "last_error": self.last_error
        }


def log_feature_request(title: str, description: str):
    """Logga una feature request in TASKS.md."""
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M")

    # Get next task number
    try:
        with open(TASKS_FILE, "r") as f:
            content = f.read()
        import re
        numbers = re.findall(r'\[T(\d+)\]', content)
        task_num = max(int(n) for n in numbers) + 1 if numbers else 1000
    except:
        task_num = 9999

    entry = f"""
### [T{task_num}] LLM-FEATURE: {title}
- **Status**: TODO
- **Owner**: TBD
- **Created**: {timestamp}
- **Priority**: P3
- **Notes**: Auto-logged feature request
  - {description}
"""

    try:
        with open(TASKS_FILE, "a") as f:
            f.write(entry)
        print(f"Feature request logged to TASKS.md as T{task_num}")
        return f"T{task_num}"
    except Exception as e:
        print(f"Error logging feature request: {e}", file=sys.stderr)
        return None


# CLI Interface
def main():
    import argparse

    parser = argparse.ArgumentParser(description="LLM Client for bots")
    parser.add_argument("prompt", nargs="*", help="Prompt to send")
    parser.add_argument("-m", "--model", default="fast",
                        help="Model: fast, chat, coding, qwen (or full name)")
    parser.add_argument("--health", action="store_true", help="Check health")
    parser.add_argument("--no-report", action="store_true",
                        help="Don't create GitHub issues on errors")
    parser.add_argument("--feature", help="Log a feature request")

    args = parser.parse_args()

    client = LLMClient(auto_report_errors=not args.no_report)

    if args.health:
        health = client.health_check()
        print(json.dumps(health, indent=2))
        return

    if args.feature:
        log_feature_request(args.feature, " ".join(args.prompt) if args.prompt else "No description")
        return

    if not args.prompt:
        print("Usage: llm-client.py 'Your prompt here'")
        print("\nOptions:")
        print("  -m MODEL    Model: fast, chat, coding, qwen")
        print("  --health    Check if Ollama is running")
        print("  --feature   Log a feature request")
        print("  --no-report Don't create GitHub issues on errors")
        print("\nExamples:")
        print("  llm-client.py 'Hello'")
        print("  llm-client.py -m coding 'Write a sort function'")
        print("  llm-client.py --health")
        print("  llm-client.py --feature 'Add streaming support' 'Would be nice to have streaming'")
        return

    prompt = " ".join(args.prompt)
    print(f"Asking {args.model}...\n", file=sys.stderr)

    response = client.ask(prompt, model=args.model)

    if response:
        print(response)
    else:
        print("Error: No response received", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
