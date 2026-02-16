#!/bin/bash
export PATH="/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin"
export MLX_SERVER_SCRIPT="/Users/mattiapetrucciani/Onde/tools/translation-mlx/mlx_server_32b.py"
export WRAPPER_SCRIPT="/Users/mattiapetrucciani/Onde/tools/clawdbot-local-llm/wrappers/m4-qwen-32b-wrapper.js"
export LOG_DIR="/tmp/clawdbot_qwen_32b"

echo "=== STARTING QWEN 32B (HEAVY MODE) ==="
echo "⚠️  Ensure you have closed other heavy apps!"

mkdir -p "$LOG_DIR"
source ~/mlx-env/bin/activate

echo "Starting MLX Server (Qwen 32B)..."
nohup python3 "$MLX_SERVER_SCRIPT" > "$LOG_DIR/mlx_server.log" 2>&1 &
echo "  -> Started. This may take a minute to load variants..."

echo "Detailed logs: $LOG_DIR/mlx_server.log"

echo "Starting Wrapper (Port 11436)..."
nohup node "$WRAPPER_SCRIPT" > "$LOG_DIR/wrapper.log" 2>&1 &

echo "Done! You can now select 'mlx_32b' provider in ClawdBot config."
