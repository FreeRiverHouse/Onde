# ClawdBot + Local Qwen2.5-7B (M4 Setup)

**Status:** WORKING (2026-02-12)
**Machine:** Mac M4 (24GB RAM)
**Model:** `mlx-community/Qwen2.5-7B-Instruct-4bit` (Switched from 32B to avoid OOM)

## Service Architecture

1.  **MLX Server** (`port 8765`)
    - Script: `tools/translation-mlx/mlx_server.py`
    - Loads Qwen2.5-7B (requires ~5GB RAM)
    - Replaced 32B model because 24GB RAM is insufficient for 32B + OS + Apps.

2.  **Wrapper** (`port 11435`)
    - Script: `tools/clawdbot-local-llm/wrappers/m4-qwen-wrapper.js`
    - Translates OpenAI Chat API -> MLX Generate API
    - Handles prompt formatting (`<|im_start|>...`)

3.  **ClawdBot**
    - Configured to use provider `mlx` at `http://127.0.0.1:11435/v1`
    - Primary Agent Model: `mlx/mlx-community/Qwen2.5-7B-Instruct-4bit`

## How to Start

Use the start script to launch everything in correct order:

```bash
cd ~/Onde/tools/clawdbot-local-llm
./start-m4-qwen-local.sh
```

## Logs

- Server: `/tmp/clawdbot_qwen/mlx_server.log`
- Wrapper: `/tmp/clawdbot_qwen/wrapper.log`

## Troubleshooting

If you see "Insufficient Memory" errors in logs:
- Ensure no other heavy ML models are running.
- stick to the 7B model (32B requires ~20GB+ free RAM).
