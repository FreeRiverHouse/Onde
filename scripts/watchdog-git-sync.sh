#!/bin/bash
# Git Sync Health Check
# Verifies agents are properly syncing git per Regola 0
# Creates alert if git workflow is stale

set -e

REPO_DIR="/Users/mattia/Projects/Onde"
ALERT_FILE="$REPO_DIR/scripts/git-sync-stale.alert"
LOG_FILE="$REPO_DIR/logs/git-sync-health.log"
MAX_PULL_AGE_MINUTES=15
MAX_UNCOMMITTED_AGE_MINUTES=30
MAX_PUSH_LAG_COMMITS=5

cd "$REPO_DIR"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> "$LOG_FILE"
}

# Create logs dir if needed
mkdir -p "$REPO_DIR/logs"

# 1. Check last pull (fetch) time
FETCH_HEAD="$REPO_DIR/.git/FETCH_HEAD"
if [ -f "$FETCH_HEAD" ]; then
    FETCH_AGE_SEC=$(($(date +%s) - $(stat -f %m "$FETCH_HEAD")))
    FETCH_AGE_MIN=$((FETCH_AGE_SEC / 60))
else
    FETCH_AGE_MIN=999
fi

# 2. Check for uncommitted changes
UNCOMMITTED=$(git status --porcelain | wc -l | tr -d ' ')

# 3. Check push lag (commits ahead of origin)
git fetch origin main --quiet 2>/dev/null || true
AHEAD=$(git rev-list --count origin/main..HEAD 2>/dev/null || echo "0")

# 4. Check last commit time
LAST_COMMIT_SEC=$(git log -1 --format=%ct 2>/dev/null || echo "0")
NOW_SEC=$(date +%s)
COMMIT_AGE_MIN=$(( (NOW_SEC - LAST_COMMIT_SEC) / 60 ))

# Determine health status
ISSUES=""

if [ "$FETCH_AGE_MIN" -gt "$MAX_PULL_AGE_MINUTES" ]; then
    ISSUES="$ISSUES\n- Git pull stale: ${FETCH_AGE_MIN}m ago (max ${MAX_PULL_AGE_MINUTES}m)"
fi

if [ "$UNCOMMITTED" -gt 0 ] && [ "$COMMIT_AGE_MIN" -gt "$MAX_UNCOMMITTED_AGE_MINUTES" ]; then
    ISSUES="$ISSUES\n- Uncommitted changes: $UNCOMMITTED files, last commit ${COMMIT_AGE_MIN}m ago"
fi

if [ "$AHEAD" -gt "$MAX_PUSH_LAG_COMMITS" ]; then
    ISSUES="$ISSUES\n- Push lag: $AHEAD commits ahead of origin (max $MAX_PUSH_LAG_COMMITS)"
fi

# Generate report
STATUS="healthy"
if [ -n "$ISSUES" ]; then
    STATUS="degraded"
fi

log "Status: $STATUS | Pull: ${FETCH_AGE_MIN}m | Uncommitted: $UNCOMMITTED | Ahead: $AHEAD"

# Create or remove alert
if [ -n "$ISSUES" ]; then
    echo -e "Git Sync Health Check DEGRADED\n\nIssues found:$ISSUES\n\nTimestamp: $(date)\nRepo: $REPO_DIR" > "$ALERT_FILE"
    log "Alert created: git-sync-stale.alert"
else
    rm -f "$ALERT_FILE"
fi

# Output status for caller
echo "{\"status\":\"$STATUS\",\"pull_age_min\":$FETCH_AGE_MIN,\"uncommitted\":$UNCOMMITTED,\"ahead\":$AHEAD,\"last_commit_age_min\":$COMMIT_AGE_MIN}"
