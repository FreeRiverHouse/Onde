# Local LLM Sub-Agent System

Delegate tasks to local LLMs (Ollama) to save Claude API tokens while maintaining productivity.

## Architecture

```
┌─────────────────┐     ┌──────────────────────┐
│   Clawdinho     │────▶│ local-agent-         │
│   (Claude)      │     │ coordinator.py       │
└─────────────────┘     └──────────────────────┘
                                 │
                    ┌────────────┼────────────┐
                    ▼            ▼            ▼
              ┌─────────┐ ┌───────────┐ ┌──────────┐
              │ Ollama  │ │ Ollama    │ │ TinyGrad │
              │ (quick) │ │ (coding)  │ │ (heavy)  │
              └─────────┘ └───────────┘ └──────────┘
                  │            │             │
              llama3.2:3b  qwen2.5-coder  llama31-8b
                           deepseek-coder
```

## Quick Start

```bash
# Check available models
ollama list

# Simple delegation
python3 scripts/local_llm.py "Write a sorting function"

# With retry and fallback
python3 -c "from scripts.local_llm import delegate_with_retry; print(delegate_with_retry('Hello', task='quick'))"

# Code review
git diff HEAD~1 | ./scripts/local-code-review.sh

# Check metrics
python3 scripts/llm_metrics.py --days 7
```

## Available Models

| Model | Size | Best For | Speed |
|-------|------|----------|-------|
| `llama3.2:3b` | 2GB | Quick answers, simple tasks | ⚡⚡⚡ |
| `qwen2.5-coder:7b` | 4.7GB | Code generation, refactoring | ⚡⚡ |
| `deepseek-coder:6.7b` | 3.8GB | Code review, complex coding | ⚡⚡ |
| `llama31-8b:latest` | 4.9GB | Analysis, translation, reasoning | ⚡ |

## Task Types

| Task | Description | Default Model |
|------|-------------|---------------|
| `coding` | Code generation, bug fixes | qwen2.5-coder:7b |
| `quick` | Simple Q&A, fast responses | llama3.2:3b |
| `analysis` | Text analysis, summarization | llama31-8b |
| `translation` | Language translation | llama31-8b |
| `creative` | Creative writing, brainstorming | llama31-8b |
| `heavy` | Complex tasks (uses TinyGrad if available) | llama31-8b |

## Scripts

### Core
- **`local-agent-coordinator.py`** - Main routing script
- **`local_llm.py`** - Python module for delegation
- **`local-llm-delegate.sh`** - Shell wrapper

### Code Review
- **`local-code-review.sh`** - Shell script for code review
- **`local_code_review.py`** - Python module for code review

### Metrics
- **`llm_metrics.py`** - Usage tracking and cost estimation

## Python API

```python
from scripts.local_llm import (
    delegate,           # Basic delegation
    delegate_with_retry,  # With retry and fallback
    quick_code,         # Quick code generation
    quick_analysis,     # Quick text analysis
    quick_answer,       # Fastest simple answer
)

# Basic usage
result = delegate("Write a function", task="coding")
print(result.text)

# With retry (handles failures gracefully)
result = delegate_with_retry("Complex task", task="analysis", max_retries=3)

# Quick helpers
code = quick_code("Parse JSON in Python")
summary = quick_analysis("Summarize this text...")
answer = quick_answer("What is 2+2?")
```

### LLMResponse Object

```python
@dataclass
class LLMResponse:
    text: str           # The generated response
    model: str          # Model used (e.g., "qwen2.5-coder:7b")
    backend: str        # Backend (e.g., "ollama")
    latency_ms: float   # Time taken in milliseconds
    tokens: int         # Output tokens
    tokens_per_sec: float
    success: bool       # Whether the call succeeded
    error: Optional[str]  # Error message if failed
```

## Fallback Chains

When a model fails, the system automatically tries fallback models:

```python
FALLBACK_CHAINS = {
    "coding": ["qwen2.5-coder:7b", "deepseek-coder:6.7b", "llama3.2:3b"],
    "quick": ["llama3.2:3b"],
    "analysis": ["llama31-8b:latest", "qwen2.5-coder:7b", "llama3.2:3b"],
    "translation": ["llama31-8b:latest"],
    "creative": ["llama31-8b:latest", "qwen2.5-coder:7b"],
}
```

## Metrics & Cost Tracking

All delegations are logged to `data/metrics/local-llm-usage.jsonl`:

```json
{
  "timestamp": "2026-01-30T16:12:32.132Z",
  "task_type": "quick",
  "model": "llama3.2:3b",
  "latency_sec": 5.02,
  "tokens_in": 3,
  "tokens_out": 9,
  "success": true
}
```

Check your savings:

```bash
python3 scripts/llm_metrics.py --days 7

# Output:
# 📊 Local LLM Usage Metrics
#    Total calls: 42
#    Tokens: 1,234 in, 5,678 out
#    Avg latency: 8.3s
#
# 💰 Savings Estimate
#    Claude would cost: $0.0234
#    Local cost: $0.0012
#    Saved: $0.0222 (95%)
```

## Hardware

| Machine | Backend | GPU | Notes |
|---------|---------|-----|-------|
| M1 (Clawdinho) | Ollama | Radeon 7900 XTX (eGPU) | TinyGrad available |
| M4 Pro (Ondinho) | Ollama | Apple Silicon | Faster for most tasks |

### Using the Radeon GPU (TinyGrad)

The Radeon 7900 XTX can run LLMs via TinyGrad for heavy tasks:

```bash
# Requires TinyGPU.app to be running
AMD=1 AMD_LLVM=1 python3 examples/gpt2.py --prompt "Hello" --count 20
```

## Best Practices

1. **Choose the right task type** - Use `quick` for simple questions, `coding` for code tasks
2. **Use retry for important tasks** - `delegate_with_retry()` handles transient failures
3. **Monitor metrics** - Check `llm_metrics.py` periodically to track usage
4. **Don't over-delegate** - Some tasks are better handled by Claude directly
5. **Test fallbacks** - Ensure fallback models are available

## Troubleshooting

### Ollama not running
```bash
ollama serve  # Start Ollama server
ollama list   # Check available models
```

### Model not found
```bash
ollama pull qwen2.5-coder:7b
ollama pull deepseek-coder:6.7b
ollama pull llama3.2:3b
```

### Slow performance
- Check if Ollama is using GPU: `ollama ps`
- Try a smaller model for quick tasks
- Ensure no other heavy processes are running

## Bot/Clawdbot Integration

When to use local LLM vs Claude API in Clawdbot sessions:

### Use Local LLM When:
- Simple code generation (boilerplate, refactoring)
- Text summarization (logs, files)
- Code review (PR reviews, security checks)
- Translation tasks
- Quick Q&A that doesn't need conversation context
- Token-saving during heartbeats

### Use Claude API When:
- Complex multi-step reasoning
- Conversation context is important
- High-stakes decisions (trading, external actions)
- User-facing responses requiring tone/personality
- Tasks requiring tool use

### Example: Heartbeat Task Delegation

```python
# During heartbeat, delegate summarization to local LLM
from scripts.local_llm import quick_analysis

# Summarize log file before alerting
log_content = open("scripts/watchdog.log").read()[-2000:]  # Last 2KB
summary = quick_analysis(f"Summarize these log entries, highlight errors:\n{log_content}")

# Use summary in alert (saves Claude tokens)
if "error" in summary.text.lower():
    # Send alert with summary
    pass
```

### Example: Code Generation in Automation

```python
from scripts.local_llm import quick_code, delegate_with_retry

# Generate simple utility code
boilerplate = quick_code("Python function to parse ISO date string to datetime")

# For more complex code with retry
result = delegate_with_retry(
    "Write a Python class for rate limiting with sliding window",
    task="coding",
    max_retries=2
)
if result.success:
    print(result.text)
else:
    # Fall back to Claude for complex tasks
    pass
```

### Example: Batch Processing

```python
from scripts.local_llm import delegate
from concurrent.futures import ThreadPoolExecutor

# Process multiple items in parallel with local LLM
items = ["file1.py", "file2.py", "file3.py"]

def review_file(path):
    code = open(path).read()
    return delegate(f"Review this code for bugs:\n{code}", task="coding")

with ThreadPoolExecutor(max_workers=3) as executor:
    reviews = list(executor.map(review_file, items))
```

### Error Handling Best Practices

```python
from scripts.local_llm import delegate_with_retry, is_ollama_running, start_ollama

# Always check Ollama status first
if not is_ollama_running():
    start_ollama()
    import time
    time.sleep(3)  # Wait for startup

# Use retry for reliability
result = delegate_with_retry("Your query", task="quick", max_retries=2)

if result.success:
    # Use result.text
    pass
elif result.error:
    # Log error, consider fallback to Claude
    print(f"Local LLM failed: {result.error}")
```

## Adding New Models

1. Pull the model: `ollama pull model-name`
2. Add to `FALLBACK_CHAINS` in `local_llm.py`
3. Update task routing in `local-agent-coordinator.py`
4. Test with a sample query
