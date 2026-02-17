#!/bin/bash
# =============================================================================
# Watchdog: onde.surf Auth Verification
# 
# Verifica che onde.surf RICHIEDA autenticazione.
# Se la pagina restituisce 200 (invece di 307 redirect to /login), 
# l'auth è rotta e crea un task P0.
#
# Schedule: */20 * * * * (ogni 20 minuti)
# =============================================================================

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
LOG_FILE="$SCRIPT_DIR/watchdog-onde-surf-auth.log"
ALERT_FILE="$SCRIPT_DIR/onde-surf-auth-broken.alert"
TASKS_FILE="$PROJECT_DIR/TASKS.md"
COOLDOWN_FILE="$SCRIPT_DIR/.onde-surf-auth-cooldown"

# Cooldown: 2 ore (evita spam se è rotto)
COOLDOWN_SECONDS=7200

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> "$LOG_FILE"
}

# Check cooldown
if [[ -f "$COOLDOWN_FILE" ]]; then
    last_alert=$(cat "$COOLDOWN_FILE")
    now=$(date +%s)
    diff=$((now - last_alert))
    if [[ $diff -lt $COOLDOWN_SECONDS ]]; then
        log "In cooldown ($diff/$COOLDOWN_SECONDS sec). Skipping."
        exit 0
    fi
fi

log "Checking onde.surf auth..."

# Test 1: Homepage should redirect (307) to /login
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "https://onde.surf")

log "onde.surf returned HTTP $HTTP_CODE"

if [[ "$HTTP_CODE" == "200" ]]; then
    # AUTH IS BROKEN!
    log "⚠️ AUTH BROKEN! Homepage returned 200 instead of redirect!"
    
    # Create alert file for heartbeat pickup
    cat > "$ALERT_FILE" << EOF
{
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "severity": "critical",
  "message": "🚨 ONDE.SURF AUTH BROKEN! Homepage loads without authentication (HTTP 200). Dashboard exposed!",
  "check_type": "auth_required",
  "expected": "307 redirect to /login",
  "actual": "$HTTP_CODE",
  "action_required": "Fix auth immediately and investigate what broke it"
}
EOF
    
    # Set cooldown
    date +%s > "$COOLDOWN_FILE"
    
    log "Alert file created: $ALERT_FILE"
    
elif [[ "$HTTP_CODE" == "307" ]]; then
    log "✅ Auth working correctly (redirects to login)"
    # Remove alert if it exists
    if [[ -f "$ALERT_FILE" ]]; then
        rm "$ALERT_FILE"
        log "Cleared previous alert"
    fi
elif [[ "$HTTP_CODE" == "000" ]]; then
    log "⚠️ Connection failed (timeout or DNS). Will retry next run."
else
    log "Unexpected HTTP code: $HTTP_CODE. Monitoring."
fi

# Test 2: Check /api/auth/session should also require auth
API_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "https://onde.surf/api/auth/session")
log "onde.surf/api/auth/session returned HTTP $API_CODE"

# Keep log file reasonable size
tail -n 500 "$LOG_FILE" > "$LOG_FILE.tmp" && mv "$LOG_FILE.tmp" "$LOG_FILE"

exit 0
