#!/bin/bash
# Fast watchdog per onde.la - check ogni 2 minuti
# Crea alert immediato se il sito è down

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ALERT_FILE="$SCRIPT_DIR/onde-la-down.alert"
LOG_FILE="$SCRIPT_DIR/onde-la-fast.log"
STATE_FILE="$SCRIPT_DIR/.onde-la-state"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> "$LOG_FILE"
}

# Test principale
HTTP_CODE=$(curl -sI --connect-timeout 10 --max-time 15 -o /dev/null -w '%{http_code}' "https://onde.la" 2>/dev/null || echo "000")

if [[ "$HTTP_CODE" == "200" ]]; then
    log "✅ onde.la UP - HTTP $HTTP_CODE"
    # Reset state e rimuovi alert se esistente
    echo "UP" > "$STATE_FILE"
    if [[ -f "$ALERT_FILE" ]]; then
        rm -f "$ALERT_FILE"
        log "🔄 Alert cleared - site recovered"
    fi
else
    log "❌ onde.la DOWN - HTTP $HTTP_CODE"
    
    # Check previous state - alert solo se era UP prima (evita spam)
    PREV_STATE=$(cat "$STATE_FILE" 2>/dev/null || echo "UNKNOWN")
    
    if [[ "$PREV_STATE" != "DOWN" ]]; then
        # Nuovo downtime! Crea alert
        echo "DOWN" > "$STATE_FILE"
        
        # Double check per evitare false positive
        sleep 5
        HTTP_CODE2=$(curl -sI --connect-timeout 10 --max-time 15 -o /dev/null -w '%{http_code}' "https://onde.la" 2>/dev/null || echo "000")
        
        if [[ "$HTTP_CODE2" != "200" ]]; then
            cat > "$ALERT_FILE" << EOF
🚨 ONDE.LA È DOWN!

Time: $(date '+%Y-%m-%d %H:%M:%S PST')
HTTP Code: $HTTP_CODE (retry: $HTTP_CODE2)

Azione consigliata:
1. Controlla Cloudflare dashboard
2. Verifica apps/onde-portal per errori build
3. Redeploy se necessario: ./tools/tech-support/deploy-onde-la-prod.sh

Il watchdog continuerà a monitorare e ti avviserà quando torna UP.
EOF
            log "🚨 ALERT CREATED - onde.la is DOWN"
        else
            log "⚠️ Transient failure - recovered on retry"
            echo "UP" > "$STATE_FILE"
        fi
    else
        log "🔴 Still down (alert already sent)"
    fi
fi
