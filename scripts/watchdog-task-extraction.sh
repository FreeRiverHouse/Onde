#!/bin/bash
# watchdog-task-extraction.sh
# Checks if tasks are being extracted from Mattia's messages
# Run via cron every 15 min: */15 * * * * /Users/mattia/Projects/Onde/scripts/watchdog-task-extraction.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
MEMORY_DIR="$PROJECT_DIR/memory"
TASKS_FILE="$PROJECT_DIR/TASKS.md"
ALERT_FILE="$SCRIPT_DIR/task-not-extracted.alert"

TODAY=$(date +%Y-%m-%d)
MEMORY_FILE="$MEMORY_DIR/${TODAY}.md"

# Keywords that indicate a request/task
TASK_KEYWORDS=(
    "voglio"
    "fai"
    "crea"
    "aggiungi"
    "implementa"
    "taska"
    "task"
    "logg"
    "fix"
    "correggi"
    "risolvi"
    "deploy"
    "pubblica"
    "scrivi"
    "aggiungi"
    "modifica"
    "cambia"
    "aggiorna"
    "want"
    "create"
    "add"
    "implement"
    "write"
)

# Check if memory file exists
if [[ ! -f "$MEMORY_FILE" ]]; then
    echo "[WARN] No memory file for today: $MEMORY_FILE"
    exit 0
fi

# Get messages logged in the last 2 hours
CURRENT_HOUR=$(date +%H)
PREV_HOUR=$(printf "%02d" $(( (10#$CURRENT_HOUR - 2 + 24) % 24 )))

echo "Checking messages from ${PREV_HOUR}:00 to ${CURRENT_HOUR}:59..."

# Count recent messages with task keywords
SUSPICIOUS_MESSAGES=0
TASK_REQUESTS=()

# Read memory file and look for Mattia messages with task keywords
while IFS= read -r line; do
    # Check if line contains Mattia message (ID:xxx)
    if [[ "$line" =~ "ID:" ]] || [[ "$line" =~ "Messaggio" ]]; then
        # Check for task keywords
        line_lower=$(echo "$line" | tr '[:upper:]' '[:lower:]')
        for keyword in "${TASK_KEYWORDS[@]}"; do
            if [[ "$line_lower" == *"$keyword"* ]]; then
                TASK_REQUESTS+=("$line")
                ((SUSPICIOUS_MESSAGES++)) || true
                break
            fi
        done
    fi
done < "$MEMORY_FILE"

echo "Found $SUSPICIOUS_MESSAGES messages with task keywords"

# Check if recent task additions exist
RECENT_TASKS=$(git -C "$PROJECT_DIR" log --since="2 hours ago" --oneline -- TASKS.md | wc -l | tr -d ' ')

echo "Recent TASKS.md commits (last 2h): $RECENT_TASKS"

# Alert conditions:
# 1. Many messages with task keywords but no TASKS.md commits
# 2. Or messages explicitly asking to create tasks that weren't logged

if [[ $SUSPICIOUS_MESSAGES -gt 2 && $RECENT_TASKS -eq 0 ]]; then
    echo "[ALERT] Possible missed task extractions!"
    
    cat > "$ALERT_FILE" << EOF
🚨 TASK EXTRACTION WATCHDOG ALERT

Time: $(date)
Messages with task keywords: $SUSPICIOUS_MESSAGES
Recent TASKS.md commits: $RECENT_TASKS

⚠️ Possible missed task extractions detected!

Mattia may have asked for tasks that weren't logged.

Sample keywords found in today's messages:
$(printf '%s\n' "${TASK_REQUESTS[@]:0:5}" | head -c 500)

Action: Review $MEMORY_FILE and ensure all requests are in TASKS.md
EOF
    
    echo "Alert created: $ALERT_FILE"
    exit 1
fi

# Check for explicit "taska" or "task" requests without corresponding commits
if grep -qi "taska\|logg.*task\|crea.*task" "$MEMORY_FILE" 2>/dev/null; then
    if [[ $RECENT_TASKS -eq 0 ]]; then
        echo "[WARN] Explicit task requests found but no TASKS.md changes"
        cat > "$ALERT_FILE" << EOF
🚨 EXPLICIT TASK REQUEST NOT LOGGED

Time: $(date)

Mattia explicitly asked to create/log tasks, but TASKS.md has no recent commits.

Check $MEMORY_FILE for "taska" or "crea task" requests.

This is a REGOLA violation - tasks must be extracted immediately!
EOF
        echo "Alert created: $ALERT_FILE"
        exit 1
    fi
fi

echo "[OK] Task extraction watchdog passed"
rm -f "$ALERT_FILE" 2>/dev/null || true
exit 0
