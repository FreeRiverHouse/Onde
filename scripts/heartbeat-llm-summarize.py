#!/usr/bin/env python3
"""
heartbeat-llm-summarize.py - Use local LLM for summarization during heartbeat

Saves Claude API tokens by using local LLM for simple summarization tasks.

Usage:
    # Summarize a file
    python scripts/heartbeat-llm-summarize.py --file /path/to/log.txt
    
    # Summarize text from stdin
    echo "Long text here" | python scripts/heartbeat-llm-summarize.py
    
    # Generate task description from git diff
    python scripts/heartbeat-llm-summarize.py --git-diff HEAD~1
    
    # Summarize alert for human-readable notification
    python scripts/heartbeat-llm-summarize.py --alert scripts/kalshi-api-error.alert
"""

import argparse
import subprocess
import sys
from pathlib import Path

# Add parent dir to path for imports
sys.path.insert(0, str(Path(__file__).parent))

try:
    from local_llm import delegate, is_ollama_running, LLMResponse
except ImportError:
    print("ERROR: local_llm.py not found. Run from Onde directory.", file=sys.stderr)
    sys.exit(1)


def summarize_text(text: str, max_words: int = 50) -> str:
    """Summarize text using local LLM."""
    if not text.strip():
        return ""
    
    prompt = f"""Summarize the following text in {max_words} words or less. Be concise and extract key points only.

Text to summarize:
{text}

Summary:"""
    
    result = delegate(prompt, task="analysis")
    if result.success:
        return result.text.strip()
    else:
        return f"[Summarization failed: {result.error}]"


def summarize_file(filepath: str, max_words: int = 50) -> str:
    """Read and summarize a file."""
    try:
        with open(filepath, 'r') as f:
            content = f.read()
        
        # Truncate very long files to avoid overwhelming the LLM
        if len(content) > 8000:
            content = content[:8000] + "\n... [truncated]"
        
        return summarize_text(content, max_words)
    except FileNotFoundError:
        return f"[File not found: {filepath}]"
    except Exception as e:
        return f"[Error reading file: {e}]"


def summarize_git_diff(ref: str = "HEAD~1") -> str:
    """Generate task description from git diff."""
    try:
        result = subprocess.run(
            ["git", "diff", ref, "--stat"],
            capture_output=True, text=True, timeout=10
        )
        if result.returncode != 0:
            return f"[Git diff failed: {result.stderr}]"
        
        diff_stat = result.stdout.strip()
        if not diff_stat:
            return "[No changes detected]"
        
        prompt = f"""Based on this git diff summary, generate a brief task description (20 words max):

{diff_stat}

Task description:"""
        
        response = delegate(prompt, task="analysis")
        if response.success:
            return response.text.strip()
        else:
            return f"Changes in: {diff_stat.split(chr(10))[0]}"
            
    except Exception as e:
        return f"[Git diff error: {e}]"


def summarize_alert(alert_file: str) -> str:
    """Summarize an alert file for human-readable notification."""
    try:
        with open(alert_file, 'r') as f:
            content = f.read()
        
        prompt = f"""Convert this technical alert into a brief, human-readable notification (30 words max).
Keep the urgency level but make it understandable.

Alert content:
{content}

Human-readable notification:"""
        
        response = delegate(prompt, task="analysis")
        if response.success:
            return response.text.strip()
        else:
            # Fallback: just return first line of alert
            return content.split('\n')[0][:100]
            
    except FileNotFoundError:
        return f"[Alert file not found: {alert_file}]"
    except Exception as e:
        return f"[Error reading alert: {e}]"


def main():
    parser = argparse.ArgumentParser(
        description="Use local LLM for summarization during heartbeat"
    )
    parser.add_argument("--file", "-f", help="File to summarize")
    parser.add_argument("--git-diff", help="Git ref to diff against (e.g., HEAD~1)")
    parser.add_argument("--alert", "-a", help="Alert file to summarize for notification")
    parser.add_argument("--max-words", "-w", type=int, default=50,
                        help="Max words in summary (default: 50)")
    parser.add_argument("--check-only", action="store_true",
                        help="Only check if Ollama is running, don't summarize")
    
    args = parser.parse_args()
    
    # Check if Ollama is running
    if not is_ollama_running():
        print("WARNING: Ollama not running. Summarization unavailable.", file=sys.stderr)
        if args.check_only:
            sys.exit(1)
        # Return empty for graceful degradation
        sys.exit(0)
    
    if args.check_only:
        print("OK: Ollama running")
        sys.exit(0)
    
    # Handle different input modes
    if args.file:
        result = summarize_file(args.file, args.max_words)
    elif args.git_diff:
        result = summarize_git_diff(args.git_diff)
    elif args.alert:
        result = summarize_alert(args.alert)
    elif not sys.stdin.isatty():
        # Read from stdin
        text = sys.stdin.read()
        result = summarize_text(text, args.max_words)
    else:
        parser.print_help()
        sys.exit(1)
    
    print(result)


if __name__ == "__main__":
    main()
