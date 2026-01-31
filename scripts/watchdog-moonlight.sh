#!/bin/bash
# Moonlight Magic House - Watchdog Script
# Runs E2E tests and creates alerts if they fail
# Add to cron: */30 * * * * /Users/mattia/Projects/Onde/scripts/watchdog-moonlight.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
LOG_FILE="$SCRIPT_DIR/watchdog-moonlight.log"
ALERT_FILE="$SCRIPT_DIR/moonlight-test-failure.alert"
HEALTH_FILE="$SCRIPT_DIR/moonlight-health.json"

# Timestamp
timestamp() {
  date "+%Y-%m-%d %H:%M:%S"
}

log() {
  echo "[$(timestamp)] $1" >> "$LOG_FILE"
}

# Rotate log file if too large (>1MB)
if [ -f "$LOG_FILE" ] && [ $(stat -f%z "$LOG_FILE" 2>/dev/null || stat -c%s "$LOG_FILE" 2>/dev/null) -gt 1048576 ]; then
  mv "$LOG_FILE" "$LOG_FILE.old"
  log "Log rotated"
fi

log "Starting Moonlight watchdog check..."

cd "$PROJECT_DIR"

# Run Playwright tests with minimal output
cd "$PROJECT_DIR/scripts"
TEST_OUTPUT=$(npx playwright test --config=moonlight-playwright.config.ts --reporter=list 2>&1) || TEST_FAILED=1
cd "$PROJECT_DIR"

# Parse results
PASSED=$(echo "$TEST_OUTPUT" | grep -E "passed|✓" | wc -l | tr -d ' ')
FAILED=$(echo "$TEST_OUTPUT" | grep -E "failed|✗" | wc -l | tr -d ' ')
SKIPPED=$(echo "$TEST_OUTPUT" | grep -i "skipped" | wc -l | tr -d ' ')

# Update health file
cat > "$HEALTH_FILE" << EOF
{
  "timestamp": "$(timestamp)",
  "status": "$([ -z "$TEST_FAILED" ] && echo 'healthy' || echo 'unhealthy')",
  "passed": $PASSED,
  "failed": $FAILED,
  "skipped": $SKIPPED,
  "url": "https://onde.la/games/moonlight-magic-house/"
}
EOF

log "Tests complete: passed=$PASSED, failed=$FAILED, skipped=$SKIPPED"

# Create alert if tests failed
if [ -n "$TEST_FAILED" ]; then
  log "ALERT: Tests failed!"
  
  cat > "$ALERT_FILE" << EOF
🚨 **MOONLIGHT MAGIC HOUSE - TEST FAILURE!**

**Time:** $(timestamp)
**URL:** https://onde.la/games/moonlight-magic-house/

**Results:**
- ✅ Passed: $PASSED
- ❌ Failed: $FAILED
- ⏭️ Skipped: $SKIPPED

**Error output:**
\`\`\`
$(echo "$TEST_OUTPUT" | grep -A5 "failed\|Error\|error:" | head -30)
\`\`\`

Please investigate immediately!
EOF
  
  log "Alert file created: $ALERT_FILE"
  exit 1
else
  # Remove old alert if tests pass
  if [ -f "$ALERT_FILE" ]; then
    rm "$ALERT_FILE"
    log "Previous alert cleared - tests passing now"
  fi
  log "All tests passed ✅"
  exit 0
fi
