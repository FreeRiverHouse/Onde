#!/bin/bash
# Coder Agent v3 - Memory-Safe Model Swap
#
# WORKFLOW:
# 1. Salva stato su file
# 2. KILL TUTTO (libera memoria!)
# 3. Carica nuovo modello
# 4. Legge stato da file
# 5. Continua lavoro

set -e

TELEGRAM_BOT_TOKEN="8590199535:AAE-i7eBsC81SBqg6Sr1Pd-DzJ4xu8x8EG0"
TELEGRAM_CHAT_ID="7505631979"
MLX_ENV="$HOME/mlx-env/bin/activate"
MLX_PORT=8080

ORCHESTRATOR_MODEL="mlx-community/Qwen2.5-7B-Instruct-4bit"
CODER_MODEL="mlx-community/Qwen3-Coder-30B-A3B-Instruct-4bit"

# State files
STATE_DIR="/tmp/coder-agent-state"
TASK_FILE="$STATE_DIR/task.txt"
CODE_FILE="$STATE_DIR/code.txt"
LOG_FILE="$STATE_DIR/log.txt"
CONTEXT_FILE="$STATE_DIR/cervelletto.md"
SKILLS_DIR="$(dirname "$0")"

mkdir -p "$STATE_DIR"

# Generate cervelletto (repo context)
generate_cervelletto() {
    local repo_path="${1:-$(pwd)}"
    "$SKILLS_DIR/cervelletto.sh" "$repo_path" > /dev/null 2>&1
    if [ -f "$CONTEXT_FILE" ]; then
        log "🧠 Cervelletto loaded ($(wc -l < "$CONTEXT_FILE") lines)"
    fi
}

get_context() {
    if [ -f "$CONTEXT_FILE" ]; then
        head -100 "$CONTEXT_FILE"
    else
        echo "No repo context available"
    fi
}

log() {
    echo "[$(date '+%H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

send_telegram() {
    local msg="$1"
    curl -s -X POST "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage" \
        -d chat_id="${TELEGRAM_CHAT_ID}" \
        -d text="$msg" \
        -d parse_mode="Markdown" > /dev/null
}

kill_all_mlx() {
    log "🔪 Killing ALL MLX processes to free memory..."
    pkill -9 -f "mlx-openai-server" 2>/dev/null || true
    pkill -9 -f "mlx_lm" 2>/dev/null || true
    pkill -9 -f "mlx-coder-wrapper" 2>/dev/null || true
    sleep 5
    log "✅ Memory freed"
}

start_model() {
    local model="$1"
    local ctx_len="$2"
    local name="$3"

    log "🔄 Loading $name..."
    source "$MLX_ENV"

    nohup mlx-openai-server launch \
        --model-path "$model" \
        --model-type lm \
        --context-length "$ctx_len" \
        --host 127.0.0.1 \
        --port $MLX_PORT \
        > /tmp/mlx-current.log 2>&1 &

    # Wait for model
    for i in {1..45}; do
        if curl -s "http://127.0.0.1:${MLX_PORT}/v1/models" 2>/dev/null | grep -q "data"; then
            log "✅ $name ready!"
            return 0
        fi
        sleep 1
    done
    log "❌ $name failed to load"
    return 1
}

call_llm() {
    local prompt="$1"
    local max_tokens="${2:-500}"

    curl -s -X POST "http://127.0.0.1:${MLX_PORT}/v1/chat/completions" \
        -H "Content-Type: application/json" \
        -d "{
            \"model\": \".\",
            \"messages\": [{\"role\": \"user\", \"content\": $(echo "$prompt" | jq -Rs .)}],
            \"max_tokens\": $max_tokens,
            \"temperature\": 0.2
        }" | jq -r '.choices[0].message.content // "ERROR"'
}

# Main workflow
main() {
    local task="$1"

    if [ -z "$task" ]; then
        echo "Usage: $0 'coding task description'"
        exit 1
    fi

    echo "" > "$LOG_FILE"
    log "🚀 CODER AGENT v4 (with Cervelletto)"
    log "📋 Task: $task"

    # Generate cervelletto (repo context)
    generate_cervelletto "$(pwd)"

    # Save task state
    echo "$task" > "$TASK_FILE"

    # Notify start
    send_telegram "🤖 *Coder Agent v3*

📋 *Task:*
\`$task\`

⏳ Sveglio Qwen3-Coder (libero memoria prima)..."

    # PHASE 1: Kill everything, load Coder
    kill_all_mlx
    start_model "$CODER_MODEL" 4096 "Qwen3-Coder"

    # PHASE 2: Coder works (FAST!)
    log "🔧 Coder working..."
    local start_time=$(date +%s)

    local context=$(get_context)
    local code_result=$(call_llm "REPO CONTEXT:
$context

TASK: $task

Write clean, working code. Follow the repo's patterns. ONLY code, no explanations. /no_think" 1500)

    local end_time=$(date +%s)
    local duration=$((end_time - start_time))
    log "⚡ Coder finished in ${duration}s"

    # Save code to file
    echo "$code_result" > "$CODE_FILE"

    # PHASE 3: Kill Coder, load Orchestrator
    kill_all_mlx
    start_model "$ORCHESTRATOR_MODEL" 8192 "Orchestrator"

    # PHASE 4: Orchestrator reads state and reviews
    log "🔍 Orchestrator reviewing..."
    local saved_task=$(cat "$TASK_FILE")
    local saved_code=$(cat "$CODE_FILE")

    local context=$(get_context)
    local review=$(call_llm "CONTESTO REPO:
$context

Task originale: '$saved_task'

Sei il reviewer. Controlla il codice segue le convenzioni del repo. Max 2 frasi italiano:

$saved_code" 200)

    # PHASE 5: Notify completion
    log "📱 Notifying Telegram..."
    local safe_code=$(echo "$saved_code" | head -40 | sed 's/`/\\`/g')

    send_telegram "✅ *Coder Agent Completato* (${duration}s)

📝 *Codice:*
\`\`\`
${safe_code}
\`\`\`

🔍 *Review:*
${review}

_Orchestrator attivo. ClawdBot pronto._"

    # Restart wrapper for ClawdBot
    log "🔄 Restarting wrapper..."
    cd ~/CascadeProjects/Onde/tools/clawdbot-local-llm/wrappers
    nohup node mlx-coder-wrapper.js > /tmp/mlx-wrapper.log 2>&1 &
    sleep 2

    log "🎉 DONE! ClawdBot ready."

    echo ""
    echo "=== RESULT ==="
    echo "$saved_code"
}

main "$@"
