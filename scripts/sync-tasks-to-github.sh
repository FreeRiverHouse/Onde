#!/usr/bin/env bash
###############################################################################
# sync-tasks-to-github.sh
# Reads TASKS.md → creates/closes GitHub Issues on FreeRiverHouse/Onde
# Dependencies: gh (GitHub CLI), grep, awk, sed
###############################################################################
set -euo pipefail

REPO="FreeRiverHouse/Onde"
TASKS_FILE="$(git rev-parse --show-toplevel)/TASKS.md"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
LOG_FILE="${SCRIPT_DIR}/sync-tasks-to-github.log"

log() { echo "[$(date '+%Y-%m-%d %H:%M:%S PST')] $*" | tee -a "$LOG_FILE"; }

# ── Preflight checks ─────────────────────────────────────────────────────────
if ! command -v gh &>/dev/null; then
  log "ERROR: gh CLI not found. Install with: brew install gh"
  exit 1
fi

if ! gh auth status &>/dev/null 2>&1; then
  log "ERROR: gh not authenticated. Run: gh auth login"
  exit 1
fi

if [[ ! -f "$TASKS_FILE" ]]; then
  log "ERROR: TASKS.md not found at $TASKS_FILE"
  exit 1
fi

# ── Cache existing GitHub issues (title → number) ────────────────────────────
log "Fetching existing GitHub issues..."
declare -A EXISTING_ISSUES
while IFS=$'\t' read -r number title state; do
  # Extract task ID from title (e.g., "[SEO-001] ..." → "SEO-001")
  task_id=$(echo "$title" | grep -oE '^\[[-A-Za-z0-9]+\]' | tr -d '[]' || true)
  if [[ -n "$task_id" ]]; then
    EXISTING_ISSUES["$task_id"]="${number}:${state}"
  fi
done < <(gh issue list --repo "$REPO" --state all --limit 500 --json number,title,state \
  --jq '.[] | [.number, .title, .state] | @tsv' 2>/dev/null || true)

log "Found ${#EXISTING_ISSUES[@]} existing issues with task IDs"

# ── Helper: map priority to label ────────────────────────────────────────────
priority_label() {
  case "$1" in
    P0) echo "priority:critical" ;;
    P1) echo "priority:high" ;;
    P2) echo "priority:medium" ;;
    P3) echo "priority:low" ;;
    *)  echo "" ;;
  esac
}

status_label() {
  case "$1" in
    TODO)        echo "status:todo" ;;
    IN_PROGRESS) echo "status:in-progress" ;;
    DONE)        echo "status:done" ;;
    BLOCKED)     echo "status:blocked" ;;
    *)           echo "" ;;
  esac
}

# ── Ensure labels exist ──────────────────────────────────────────────────────
ensure_labels() {
  local labels=("priority:critical" "priority:high" "priority:medium" "priority:low"
                 "status:todo" "status:in-progress" "status:done" "status:blocked")
  for label in "${labels[@]}"; do
    gh label create "$label" --repo "$REPO" --force 2>/dev/null || true
  done
}

log "Ensuring labels exist..."
ensure_labels

# ── Parse TASKS.md ───────────────────────────────────────────────────────────
# We look for table rows matching: | ... | TASK_ID | Task Name | ... | Status | Owner |
# and also for ### [ID] Name block format

CREATED=0
CLOSED=0
SKIPPED=0
ERRORS=0

process_task() {
  local task_id="$1"
  local task_name="$2"
  local status="$3"
  local owner="$4"
  local priority="$5"
  local notes="$6"

  # Normalize status
  local clean_status
  clean_status=$(echo "$status" | sed 's/[✅🔶🔥⭐🔧💡]//g; s/^ *//; s/ *$//' | tr -d ' ')
  # Handle common patterns
  if echo "$clean_status" | grep -qi "DONE"; then
    clean_status="DONE"
  elif echo "$clean_status" | grep -qi "IN_PROGRESS\|INPROGRESS"; then
    clean_status="IN_PROGRESS"
  elif echo "$clean_status" | grep -qi "TODO\|READY\|DRAFT"; then
    clean_status="TODO"
  elif echo "$clean_status" | grep -qi "BLOCKED"; then
    clean_status="BLOCKED"
  fi

  local existing="${EXISTING_ISSUES[$task_id]:-}"

  if [[ "$clean_status" == "DONE" ]]; then
    # ── Close issue if it exists and is open ──
    if [[ -n "$existing" ]]; then
      local issue_num="${existing%%:*}"
      local issue_state="${existing##*:}"
      if [[ "$issue_state" == "OPEN" ]]; then
        local close_comment="✅ Task closed by ${owner:-unknown} at $(date '+%Y-%m-%d %H:%M PST')"
        if gh issue close "$issue_num" --repo "$REPO" --comment "$close_comment" 2>/dev/null; then
          log "CLOSED: #$issue_num [$task_id] $task_name"
          ((CLOSED++))
        else
          log "ERROR closing #$issue_num [$task_id]"
          ((ERRORS++))
        fi
      else
        log "SKIP (already closed): [$task_id]"
        ((SKIPPED++))
      fi
    fi
    # If no issue exists for DONE tasks, do nothing
    return
  fi

  if [[ "$clean_status" == "TODO" || "$clean_status" == "IN_PROGRESS" ]]; then
    # ── Create issue if it doesn't exist ──
    if [[ -n "$existing" ]]; then
      log "SKIP (issue exists): [$task_id] → #${existing%%:*}"
      ((SKIPPED++))
      return
    fi

    local title="[${task_id}] ${task_name}"
    local body="## Task: ${task_id}\n\n"
    body+="**Name:** ${task_name}\n"
    body+="**Status:** ${clean_status}\n"
    body+="**Owner:** ${owner:-unassigned}\n"
    body+="**Priority:** ${priority:-P2}\n"
    if [[ -n "$notes" ]]; then
      body+="\n### Notes\n${notes}\n"
    fi
    body+="\n---\n*Synced from TASKS.md*"

    local labels_args=()
    local pl
    pl=$(priority_label "${priority:-P2}")
    local sl
    sl=$(status_label "$clean_status")
    [[ -n "$pl" ]] && labels_args+=(--label "$pl")
    [[ -n "$sl" ]] && labels_args+=(--label "$sl")

    if gh issue create --repo "$REPO" \
        --title "$title" \
        --body "$(echo -e "$body")" \
        "${labels_args[@]}" 2>/dev/null; then
      log "CREATED: [$task_id] $task_name"
      ((CREATED++))
    else
      log "ERROR creating issue for [$task_id]"
      ((ERRORS++))
    fi
  fi
}

# ── Parse table-format tasks ─────────────────────────────────────────────────
# Table rows: | # | ID | Task | Impact | Status | Owner | Notes... |
log "Parsing TASKS.md..."

while IFS='|' read -r _ num id task impact status owner extra; do
  # Skip header/separator rows
  [[ -z "$id" ]] && continue
  id=$(echo "$id" | sed 's/^ *//;s/ *$//')
  [[ "$id" == "ID" || "$id" == "---"* || "$id" == "#" ]] && continue
  [[ -z "$id" || "$id" == "-" ]] && continue

  task=$(echo "$task" | sed 's/^ *//;s/ *$//')
  status=$(echo "$status" | sed 's/^ *//;s/ *$//')
  owner=$(echo "$owner" | sed 's/^ *//;s/ *$//')
  extra=$(echo "$extra" | sed 's/^ *//;s/ *$//')

  # Determine priority from impact or context
  local_priority="P2"
  if echo "$impact" | grep -qi "BLOCCANTE\|critical\|🚨"; then
    local_priority="P0"
  elif echo "$impact" | grep -qi "ALTA\|high\|🔥"; then
    local_priority="P1"
  elif echo "$impact" | grep -qi "MEDIA\|medium\|⭐"; then
    local_priority="P2"
  elif echo "$impact" | grep -qi "BASSA\|low\|🔧\|💡"; then
    local_priority="P3"
  fi

  process_task "$id" "$task" "$status" "$owner" "$local_priority" "$extra"
done < <(grep -E '^\|.*\|.*\|.*\|.*\|.*\|' "$TASKS_FILE" || true)

# ── Parse block-format tasks (### [ID] Name) ─────────────────────────────────
current_id=""
current_name=""
current_status=""
current_owner=""
current_priority=""
current_notes=""

flush_block_task() {
  if [[ -n "$current_id" && -n "$current_status" ]]; then
    process_task "$current_id" "$current_name" "$current_status" "$current_owner" "${current_priority:-P2}" "$current_notes"
  fi
  current_id=""
  current_name=""
  current_status=""
  current_owner=""
  current_priority=""
  current_notes=""
}

while IFS= read -r line; do
  if [[ "$line" =~ ^###[[:space:]]+\[([A-Za-z0-9_-]+)\][[:space:]]+(.*) ]]; then
    flush_block_task
    current_id="${BASH_REMATCH[1]}"
    current_name="${BASH_REMATCH[2]}"
  elif [[ -n "$current_id" ]]; then
    if [[ "$line" =~ \*\*Status\*\*:[[:space:]]*(.*) ]]; then
      current_status="${BASH_REMATCH[1]}"
    elif [[ "$line" =~ \*\*Owner\*\*:[[:space:]]*(.*) ]]; then
      current_owner="${BASH_REMATCH[1]}"
    elif [[ "$line" =~ \*\*Priority\*\*:[[:space:]]*(.*) ]]; then
      current_priority="${BASH_REMATCH[1]}"
    elif [[ "$line" =~ \*\*Notes\*\*:[[:space:]]*(.*) ]]; then
      current_notes="${BASH_REMATCH[1]}"
    fi
  fi
done < "$TASKS_FILE"
flush_block_task

# ── Summary ──────────────────────────────────────────────────────────────────
log "═══════════════════════════════════════"
log "SYNC COMPLETE"
log "  Created: $CREATED"
log "  Closed:  $CLOSED"
log "  Skipped: $SKIPPED"
log "  Errors:  $ERRORS"
log "═══════════════════════════════════════"
