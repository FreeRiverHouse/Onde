#!/bin/bash
# Start script for ClawdBot + Local Qwen3-32B (M4)
#
# Launches:
# 1. MLX Server (port 8765) - Loads Qwen3-32B
# 2. Wrapper (port 11435) - Adapts OpenAI <-> MLX
# 3. Restarts ClawdBot

set -e

# === CONFIGURATION ===
MLX_SERVER_SCRIPT="/Users/mattiapetrucciani/Onde/tools/translation-mlx/mlx_server.py"
WRAPPER_DIR="/Users/mattiapetrucciani/Onde/tools/clawdbot-local-llm/wrappers"
WRAPPER_SCRIPT="$WRAPPER_DIR/m4-qwen-wrapper.js"
LOG_DIR="/tmp/clawdbot_qwen"
mkdir -p "$LOG_DIR"

echo "=== STARTING CLAWDBOT LOCAL QWEN SETUP (M4) ==="

# 0. Environment Setup
echo "Checking environment..."
source ~/mlx-env/bin/activate

# 1. Install Node dependencies if needed
if [ ! -d "$WRAPPER_DIR/node_modules" ]; then
    echo "Installing Node dependencies..."
    cd "$WRAPPER_DIR"
    npm install
fi

# 2. Start MLX Server
echo "Starting MLX Server (Qwen3-32B)..."
if pgrep -f "mlx_server.py" > /dev/null; then
    echo "  -> MLX Server already running."
else
    # Start in background
    nohup python3 "$MLX_SERVER_SCRIPT" > "$LOG_DIR/mlx_server.log" 2>&1 &
    MLX_PID=$!
    echo "  -> Started with PID $MLX_PID. Waiting for startup..."
    sleep 5
fi

# Wait for MLX Server to be ready
echo "Waiting for MLX Server to be ready..."
MAX_RETRIES=30
COUNT=0
while ! curl -s http://127.0.0.1:8765/health > /dev/null; do
    sleep 2
    COUNT=$((COUNT+1))
    if [ $COUNT -ge $MAX_RETRIES ]; then
        echo "  -> Timeout waiting for MLX Server. Check logs at $LOG_DIR/mlx_server.log"
        exit 1
    fi
    echo -n "."
done
echo "  -> MLX Server is healthy!"

# 3. Start Wrapper
echo "Starting Wrapper (port 11435 -> 8765)..."
if pgrep -f "m4-qwen-wrapper.js" > /dev/null; then
    echo "  -> Wrapper already running."
else
    cd "$WRAPPER_DIR"
    nohup node "$WRAPPER_SCRIPT" > "$LOG_DIR/wrapper.log" 2>&1 &
    WRAPPER_PID=$!
    echo "  -> Started Wrapper with PID $WRAPPER_PID"
    sleep 2
fi

# Check wrapper health
if curl -s http://127.0.0.1:11435/health > /dev/null; then
    echo "  -> Wrapper is healthy!"
else
    echo "  -> WARNING: Wrapper not responding."
fi

# 4. Check ClawdBot Config
CLAWDBOT_CONFIG="$HOME/.clawdbot/clawdbot.json"
echo "Checking ClawdBot config..."
# Ensure mlx provider points to 11435
if grep -q "11435" "$CLAWDBOT_CONFIG"; then
    echo "  -> Config uses port 11435 (Correct)."
else
    echo "  -> WARNING: Config might be incorrect. Please check ~/.clawdbot/clawdbot.json"
fi

# 5. Restart ClawdBot Gateway (if needed)
echo "Restarting ClawdBot Gateway..."
launchctl stop com.clawdbot.gateway || true
sleep 1
launchctl start com.clawdbot.gateway || echo "  -> Failed to restart service 'com.clawdbot.gateway'. Is it installed?"

echo "=== ACTIVATION COMPLETE ==="
echo "Logs available at:"
echo "  - $LOG_DIR/mlx_server.log"
echo "  - $LOG_DIR/wrapper.log"
