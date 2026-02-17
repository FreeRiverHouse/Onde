#!/usr/bin/env bash
###############################################################################
# watchdog-agent-stalled.sh
# Detects stalled agents by checking git commit recency + gist status.
# Writes .alert files for the heartbeat to pick up.
###############################################################################
set -euo pipefail

REPO_ROOT="$(git rev-parse --show-toplevel 2>/dev/null || echo '/Users/mattia/Projects/Onde')"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
GIST_URL="https://gist.githubusercontent.com/ondeclawd/12a07b9ed63e19f01d2693b69f8a0e3b/raw/onde-agent-status.json"
STALE_THRESHOLD_MINUTES=30
LOG_FILE="${SCRIPT_DIR}/watchdog-agent-stalled.log"

# Agents to monitor: name → git author pattern
declare -A AGENTS=(
  ["clawdinho"]="clawdinho\|Clawdinho\|clawd\|Clawd"
  ["ondinho"]="ondinho\|Ondinho\|onde-bot\|Onde-bot"
)

log() { echo "[$(date '+%Y-%m-%d %H:%M:%S PST')] $*" | tee -a "$LOG_FILE"; }

# ── Preflight ─────────────────────────────────────────────────────────────────
cd "$REPO_ROOT"

# Sync repo (non-fatal)
git fetch origin main --quiet 2>/dev/null || log "WARN: git fetch failed (offline?)"

# ── Fetch gist status (non-fatal) ────────────────────────────────────────────
GIST_JSON=""
if GIST_JSON=$(curl -sf --max-time 10 "$GIST_URL" 2>/dev/null); then
  log "Gist status fetched OK"
else
  log "WARN: Could not fetch gist status (continuing with git-only checks)"
  GIST_JSON="{}"
fi

# ── Helper: get agent status from gist JSON ──────────────────────────────────
get_gist_status() {
  local agent="$1"
  if [[ -z "$GIST_JSON" || "$GIST_JSON" == "{}" ]]; then
    echo "unknown"
    return
  fi
  # Try to extract status for the agent
  # Expected format: {"clawdinho": {"status": "active", ...}, "ondinho": {...}}
  local status
  status=$(echo "$GIST_JSON" | python3 -c "
import json, sys
try:
    data = json.load(sys.stdin)
    # Handle flat format: {\"clawdinho_status\": \"active\", ...}
    flat_key = '${agent}_status'
    if flat_key in data:
        print(data[flat_key])
    # Handle nested format: {\"clawdinho\": {\"status\": \"active\"}}
    elif '${agent}' in data:
        agent_data = data['${agent}']
        if isinstance(agent_data, dict):
            print(agent_data.get('status', 'unknown'))
        else:
            print(str(agent_data))
    # Handle top-level agents list
    elif 'agents' in data:
        for a in data['agents']:
            if a.get('name', '').lower() == '${agent}'.lower():
                print(a.get('status', 'unknown'))
                break
        else:
            print('unknown')
    else:
        print('unknown')
except Exception:
    print('unknown')
" 2>/dev/null || echo "unknown")
  echo "$status"
}

# ── Helper: minutes since last commit by author ──────────────────────────────
minutes_since_last_commit() {
  local author_pattern="$1"
  local last_commit_ts

  last_commit_ts=$(git log --all --author="$author_pattern" --format='%at' -1 2>/dev/null || echo "")

  if [[ -z "$last_commit_ts" ]]; then
    echo "999999"  # Never committed → very stale
    return
  fi

  local now_ts
  now_ts=$(date +%s)
  local diff=$(( (now_ts - last_commit_ts) / 60 ))
  echo "$diff"
}

# ── Check each agent ─────────────────────────────────────────────────────────
log "Starting watchdog check (threshold: ${STALE_THRESHOLD_MINUTES}min)..."

for agent in "${!AGENTS[@]}"; do
  author_pattern="${AGENTS[$agent]}"
  alert_file="${SCRIPT_DIR}/${agent}-stalled.alert"

  # Get minutes since last commit
  stale_minutes=$(minutes_since_last_commit "$author_pattern")
  log "  $agent: last commit ${stale_minutes}min ago"

  # Get gist status
  gist_status=$(get_gist_status "$agent")
  log "  $agent: gist status = $gist_status"

  if [[ "$stale_minutes" -gt "$STALE_THRESHOLD_MINUTES" ]] && [[ "$gist_status" != "active" ]]; then
    # STALLED! Write alert
    cat > "$alert_file" <<EOF
AGENT STALLED ALERT
====================
Agent:         $agent
Last commit:   ${stale_minutes} minutes ago
Gist status:   $gist_status
Threshold:     ${STALE_THRESHOLD_MINUTES} minutes
Detected at:   $(date '+%Y-%m-%d %H:%M:%S PST')
Action needed: Check if agent is stuck/crashed and restart if necessary.
EOF
    log "⚠️  ALERT: $agent is STALLED (${stale_minutes}min, status=$gist_status) → $alert_file"
  else
    # Agent is fine — remove stale alert if present
    if [[ -f "$alert_file" ]]; then
      rm -f "$alert_file"
      log "  $agent: cleared previous alert (agent recovered)"
    else
      log "  $agent: OK"
    fi
  fi
done

log "Watchdog check complete."
