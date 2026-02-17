#!/bin/bash
# Watchdog completo per tutti i servizi Onde
# Esegue test HTTP su tutti gli endpoint e crea alert se necessario

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOG_FILE="$SCRIPT_DIR/watchdog-services.log"
ALERT_FILE="$SCRIPT_DIR/services-health.alert"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> "$LOG_FILE"
    echo "$1"
}

FAILED=()
PASSED=()

# Funzione per testare un URL (segue redirect automaticamente)
test_url() {
    local name="$1"
    local url="$2"
    local expected_code="${3:-200}"
    
    # Segui tutti i redirect e prendi l'ultimo codice
    local final_code=$(curl -sIL --connect-timeout 10 --max-time 30 -o /dev/null -w '%{http_code}' "$url" 2>/dev/null)
    
    if [ "$final_code" = "$expected_code" ]; then
        PASSED+=("✅ $name ($url) - HTTP $final_code")
        log "PASS: $name - HTTP $final_code"
        return 0
    else
        FAILED+=("❌ $name ($url) - Expected $expected_code, got ${final_code:-timeout}")
        log "FAIL: $name - Expected $expected_code, got ${final_code:-timeout}"
        return 1
    fi
}

# Funzione per testare contenuto
test_content() {
    local name="$1"
    local url="$2"
    local expected_content="$3"
    
    local content=$(curl -sL --connect-timeout 10 --max-time 30 "$url" 2>/dev/null)
    
    if echo "$content" | grep -qi "$expected_content"; then
        PASSED+=("✅ $name - Content OK")
        log "PASS: $name - Content contains '$expected_content'"
        return 0
    else
        FAILED+=("❌ $name - Missing expected content: $expected_content")
        log "FAIL: $name - Missing content '$expected_content'"
        return 1
    fi
}

log "========== WATCHDOG START =========="

# ==========================================
# 1. SITI PRINCIPALI
# ==========================================
echo "🌐 Testing main sites..."

test_url "onde.la (main)" "https://onde.la" "200"
test_url "onde.la /libri" "https://onde.la/libri/" "200"
test_url "onde.la /catalogo" "https://onde.la/catalogo/" "200"
test_url "onde.la /about" "https://onde.la/about/" "200"
test_content "onde.la content" "https://onde.la" "Onde"

test_url "onde.surf (dashboard)" "https://onde.surf/login" "200"

# ==========================================
# 2. GIOCHI E APP
# ==========================================
echo "🎮 Testing games and apps..."

# Giochi linkati da onde.la/games
test_url "Games page" "https://onde.la/games/" "200"
test_url "Giochi page (IT)" "https://onde.la/giochi/" "200"

# Moonlight House (Tamagotchi game)
test_url "Moonlight House" "https://moonlight-house.pages.dev" "200"
test_content "Moonlight House content" "https://moonlight-house.pages.dev" "Moonlight"

# VR Books - removed: /vr/ route never existed, was causing false 404 alerts
# test_url "VR page" "https://onde.la/vr/" "200"

# Note: vecchio onde-dashboard.pages.dev non più usato, onde.surf è la dashboard attiva

# ==========================================
# 3. API ENDPOINTS
# ==========================================
echo "🔌 Testing API endpoints..."

# Health checks
test_url "onde.la /health" "https://onde.la/health/" "200" || test_url "onde.la /api/health" "https://onde.la/api/health" "200" || true

# ==========================================
# 4. LINK INTERNI (dal sitemap o menu)
# ==========================================
echo "🔗 Testing internal links..."

# Estrai tutti i link da onde.la e testa
LINKS=$(curl -sL "https://onde.la" 2>/dev/null | grep -oE 'href="(/[^"]*)"' | sed 's/href="//;s/"$//' | sort -u | head -20)
for link in $LINKS; do
    if [[ "$link" != "#"* ]] && [[ "$link" != "/"$ ]]; then
        test_url "onde.la $link" "https://onde.la$link" "200" || true
    fi
done

# ==========================================
# REPORT
# ==========================================
echo ""
echo "=========================================="
echo "📊 WATCHDOG REPORT - $(date '+%Y-%m-%d %H:%M')"
echo "=========================================="

echo ""
echo "✅ PASSED (${#PASSED[@]}):"
for p in "${PASSED[@]}"; do
    echo "  $p"
done

echo ""
if [ ${#FAILED[@]} -gt 0 ]; then
    echo "❌ FAILED (${#FAILED[@]}):"
    for f in "${FAILED[@]}"; do
        echo "  $f"
    done
    
    # Crea alert
    cat > "$ALERT_FILE" << EOF
{
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%S)Z",
  "failed_count": ${#FAILED[@]},
  "passed_count": ${#PASSED[@]},
  "failures": [
$(printf '    "%s",\n' "${FAILED[@]}" | sed '$ s/,$//')
  ],
  "message": "🚨 SERVICE HEALTH CHECK FAILED!\n\n${#FAILED[@]} services down:\n$(printf '• %s\\n' "${FAILED[@]}")"
}
EOF
    log "Alert created: $ALERT_FILE"
    exit 1
else
    echo "🎉 All services healthy!"
    # Rimuovi alert se esisteva
    [ -f "$ALERT_FILE" ] && rm "$ALERT_FILE"
    exit 0
fi
