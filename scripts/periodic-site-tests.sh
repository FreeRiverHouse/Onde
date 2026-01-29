#!/bin/bash
# ============================================
# PERIODIC SITE TESTS - Cron-friendly health checks
# ============================================
# Esegue test periodici sui nostri siti:
# - HTTP status check
# - Auth check (onde.surf)
# - API endpoints
# - Link integrity
# - SSL certificate validity
#
# Cron: */30 * * * * /Users/mattia/Projects/Onde/scripts/periodic-site-tests.sh
# ============================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ONDE_ROOT="$(dirname "$SCRIPT_DIR")"
LOG_FILE="$SCRIPT_DIR/periodic-site-tests.log"
ALERT_DIR="$SCRIPT_DIR"
REPORT_FILE="$SCRIPT_DIR/site-health-report.json"

# Colors for terminal output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Sites to test
SITES=(
    "https://onde.la"
    "https://onde.surf"
)

# Critical endpoints per site (bash 3 compatible)
ONDE_LA_ENDPOINTS="/ /libri /catalogo /about /health /feed.xml"
ONDE_LA_NAMES="Homepage Libri Catalogo About Health RSS_Feed"

ONDE_SURF_ENDPOINTS="/ /betting"
ONDE_SURF_NAMES="Homepage Betting_Dashboard"

# API endpoints to test
API_ENDPOINTS=(
    "https://onde.la/api/health/cron"
)

# Timestamp
NOW=$(date '+%Y-%m-%d %H:%M:%S')
NOW_ISO=$(date -u '+%Y-%m-%dT%H:%M:%SZ')

log() {
    echo -e "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

create_alert() {
    local alert_name="$1"
    local message="$2"
    local alert_file="$ALERT_DIR/$alert_name.alert"
    
    # Check cooldown (1 hour)
    if [ -f "$alert_file" ]; then
        local age=$(($(date +%s) - $(stat -f %m "$alert_file")))
        if [ $age -lt 3600 ]; then
            log "Alert $alert_name already sent recently, skipping"
            return
        fi
    fi
    
    echo "$message" > "$alert_file"
    log "🚨 Alert created: $alert_name"
}

# ============================================
# TEST FUNCTIONS
# ============================================

test_http_status() {
    local url="$1"
    local expected_status="${2:-200}"
    local timeout=10
    
    local status=$(curl -sLo /dev/null -w "%{http_code}" --connect-timeout $timeout "$url" 2>/dev/null || echo "000")
    
    if [ "$status" = "$expected_status" ]; then
        echo "pass"
        return 0
    else
        echo "$status"
        return 1
    fi
}

test_redirect() {
    local url="$1"
    local expected_status="${2:-307}"
    local timeout=10
    
    # Don't follow redirects to test redirect behavior
    local status=$(curl -so /dev/null -w "%{http_code}" --connect-timeout $timeout "$url" 2>/dev/null || echo "000")
    
    if [ "$status" = "$expected_status" ] || [ "$status" = "302" ] || [ "$status" = "303" ]; then
        echo "pass"
        return 0
    else
        echo "$status"
        return 1
    fi
}

test_ssl_cert() {
    local domain="$1"
    local timeout=10
    
    # Extract days until expiry
    local expiry_date=$(echo | openssl s_client -servername "$domain" -connect "$domain:443" 2>/dev/null | openssl x509 -noout -enddate 2>/dev/null | cut -d= -f2)
    
    if [ -z "$expiry_date" ]; then
        echo "error"
        return 1
    fi
    
    local expiry_epoch=$(date -j -f "%b %d %T %Y %Z" "$expiry_date" "+%s" 2>/dev/null || date -d "$expiry_date" "+%s" 2>/dev/null)
    local now_epoch=$(date +%s)
    local days_left=$(( (expiry_epoch - now_epoch) / 86400 ))
    
    if [ $days_left -lt 7 ]; then
        echo "critical:$days_left"
        return 1
    elif [ $days_left -lt 30 ]; then
        echo "warning:$days_left"
        return 0
    else
        echo "pass:$days_left"
        return 0
    fi
}

test_response_time() {
    local url="$1"
    local max_ms="${2:-5000}"
    local timeout=15
    
    local time_ms=$(curl -sLo /dev/null -w "%{time_total}" --connect-timeout $timeout "$url" 2>/dev/null || echo "999")
    local time_ms_int=$(echo "$time_ms * 1000" | bc | cut -d. -f1)
    
    if [ "$time_ms_int" -lt "$max_ms" ]; then
        echo "pass:${time_ms_int}ms"
        return 0
    else
        echo "slow:${time_ms_int}ms"
        return 1
    fi
}

test_content_contains() {
    local url="$1"
    local search_text="$2"
    local timeout=10
    
    local content=$(curl -sL --connect-timeout $timeout "$url" 2>/dev/null)
    
    if echo "$content" | grep -qi "$search_text"; then
        echo "pass"
        return 0
    else
        echo "missing"
        return 1
    fi
}

test_links_on_page() {
    local url="$1"
    local max_links="${2:-20}"
    local timeout=10
    
    local broken=0
    local checked=0
    
    # Get all links from page
    local links=$(curl -sL --connect-timeout $timeout "$url" 2>/dev/null | grep -oE 'href="[^"]*"' | sed 's/href="//g' | sed 's/"//g' | head -n $max_links)
    
    for link in $links; do
        # Skip anchors, javascript, mailto
        if [[ "$link" =~ ^# ]] || [[ "$link" =~ ^javascript: ]] || [[ "$link" =~ ^mailto: ]]; then
            continue
        fi
        
        # Make absolute URL
        if [[ "$link" =~ ^/ ]]; then
            local base_url=$(echo "$url" | grep -oE 'https?://[^/]+')
            link="${base_url}${link}"
        elif [[ ! "$link" =~ ^https?: ]]; then
            continue
        fi
        
        # Test link
        local status=$(curl -sLo /dev/null -w "%{http_code}" --connect-timeout 5 "$link" 2>/dev/null || echo "000")
        checked=$((checked + 1))
        
        if [ "$status" = "000" ] || [ "$status" -ge 400 ]; then
            broken=$((broken + 1))
            log "  ⚠️  Broken link: $link ($status)"
        fi
    done
    
    if [ $broken -eq 0 ]; then
        echo "pass:$checked"
        return 0
    else
        echo "broken:$broken/$checked"
        return 1
    fi
}

# ============================================
# MAIN TEST RUNNER
# ============================================

run_all_tests() {
    log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    log "🧪 PERIODIC SITE TESTS - $NOW"
    log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    local total_tests=0
    local passed_tests=0
    local failed_tests=0
    local results=()
    
    # ---- ONDE.LA TESTS ----
    log ""
    log "📌 Testing ONDE.LA"
    log "──────────────────────────────"
    
    # HTTP Status for all endpoints
    local endpoints=($ONDE_LA_ENDPOINTS)
    local names=($ONDE_LA_NAMES)
    local i=0
    for endpoint in "${endpoints[@]}"; do
        local name="${names[$i]}"
        name="${name//_/ }"  # Replace underscores with spaces
        local result=$(test_http_status "https://onde.la$endpoint")
        total_tests=$((total_tests + 1))
        
        if [ "$result" = "pass" ]; then
            log "  ✅ $name ($endpoint): OK"
            passed_tests=$((passed_tests + 1))
        else
            log "  ❌ $name ($endpoint): FAILED (HTTP $result)"
            failed_tests=$((failed_tests + 1))
            create_alert "onde-la-down" "🚨 ONDE.LA $name DOWN!\nEndpoint: $endpoint\nHTTP Status: $result\nTime: $NOW"
        fi
        i=$((i + 1))
    done
    
    # Response time
    local rt_result=$(test_response_time "https://onde.la" 3000)
    total_tests=$((total_tests + 1))
    if [[ "$rt_result" == pass:* ]]; then
        log "  ✅ Response time: ${rt_result#pass:}"
        passed_tests=$((passed_tests + 1))
    else
        log "  ⚠️  Response time: ${rt_result#slow:}"
        failed_tests=$((failed_tests + 1))
    fi
    
    # SSL Certificate
    local ssl_result=$(test_ssl_cert "onde.la")
    total_tests=$((total_tests + 1))
    if [[ "$ssl_result" == pass:* ]]; then
        log "  ✅ SSL cert: ${ssl_result#pass:} days left"
        passed_tests=$((passed_tests + 1))
    elif [[ "$ssl_result" == warning:* ]]; then
        log "  ⚠️  SSL cert: ${ssl_result#warning:} days left (expiring soon!)"
        passed_tests=$((passed_tests + 1))
        create_alert "ssl-expiring" "⚠️ SSL Certificate expiring soon!\nDomain: onde.la\nDays left: ${ssl_result#warning:}"
    else
        log "  ❌ SSL cert: CRITICAL (${ssl_result})"
        failed_tests=$((failed_tests + 1))
        create_alert "ssl-critical" "🚨 SSL Certificate CRITICAL!\nDomain: onde.la\nStatus: $ssl_result"
    fi
    
    # Content check
    local content_result=$(test_content_contains "https://onde.la" "Onde")
    total_tests=$((total_tests + 1))
    if [ "$content_result" = "pass" ]; then
        log "  ✅ Content check: 'Onde' found"
        passed_tests=$((passed_tests + 1))
    else
        log "  ❌ Content check: 'Onde' missing"
        failed_tests=$((failed_tests + 1))
    fi
    
    # ---- ONDE.SURF TESTS ----
    log ""
    log "📌 Testing ONDE.SURF"
    log "──────────────────────────────"
    
    # Auth check - should redirect to login (307)
    local auth_result=$(test_redirect "https://onde.surf" 307)
    total_tests=$((total_tests + 1))
    if [ "$auth_result" = "pass" ]; then
        log "  ✅ Auth redirect: Working (requires login)"
        passed_tests=$((passed_tests + 1))
    else
        log "  ❌ Auth redirect: BROKEN! (HTTP $auth_result - should be 307)"
        failed_tests=$((failed_tests + 1))
        create_alert "onde-surf-auth-broken" "🚨 ONDE.SURF AUTH BROKEN!\nExpected: 307 redirect to login\nGot: HTTP $auth_result\nSite may be publicly exposed!\nTime: $NOW"
    fi
    
    # Login page should exist
    local login_result=$(test_http_status "https://onde.surf/login" 200)
    total_tests=$((total_tests + 1))
    if [ "$login_result" = "pass" ]; then
        log "  ✅ Login page: Accessible"
        passed_tests=$((passed_tests + 1))
    else
        log "  ❌ Login page: Not accessible (HTTP $login_result)"
        failed_tests=$((failed_tests + 1))
    fi
    
    # SSL Certificate
    local ssl_surf=$(test_ssl_cert "onde.surf")
    total_tests=$((total_tests + 1))
    if [[ "$ssl_surf" == pass:* ]]; then
        log "  ✅ SSL cert: ${ssl_surf#pass:} days left"
        passed_tests=$((passed_tests + 1))
    else
        log "  ⚠️  SSL cert: $ssl_surf"
        failed_tests=$((failed_tests + 1))
    fi
    
    # ---- API TESTS ----
    log ""
    log "📌 Testing APIs"
    log "──────────────────────────────"
    
    for api in "${API_ENDPOINTS[@]}"; do
        local api_result=$(test_http_status "$api")
        total_tests=$((total_tests + 1))
        
        if [ "$api_result" = "pass" ]; then
            log "  ✅ $api: OK"
            passed_tests=$((passed_tests + 1))
        else
            log "  ❌ $api: FAILED (HTTP $api_result)"
            failed_tests=$((failed_tests + 1))
        fi
    done
    
    # ---- LINK INTEGRITY (hourly only) ----
    local hour=$(date +%H)
    if [ "$hour" = "00" ] || [ "$hour" = "12" ]; then
        log ""
        log "📌 Link Integrity Check (2x daily)"
        log "──────────────────────────────"
        
        local link_result=$(test_links_on_page "https://onde.la" 30)
        total_tests=$((total_tests + 1))
        if [[ "$link_result" == pass:* ]]; then
            log "  ✅ Links checked: ${link_result#pass:} OK"
            passed_tests=$((passed_tests + 1))
        else
            log "  ⚠️  Broken links: ${link_result#broken:}"
            failed_tests=$((failed_tests + 1))
            create_alert "broken-links" "⚠️ Broken links detected on onde.la\nDetails: ${link_result#broken:}\nTime: $NOW"
        fi
    fi
    
    # ---- SUMMARY ----
    log ""
    log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    log "📊 SUMMARY"
    log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    log "Total tests: $total_tests"
    log "Passed: $passed_tests"
    log "Failed: $failed_tests"
    
    # Save JSON report
    cat > "$REPORT_FILE" << EOF
{
    "timestamp": "$NOW_ISO",
    "total_tests": $total_tests,
    "passed": $passed_tests,
    "failed": $failed_tests,
    "success_rate": $(echo "scale=2; $passed_tests * 100 / $total_tests" | bc)
}
EOF
    
    if [ $failed_tests -gt 0 ]; then
        log ""
        log "❌ Some tests failed! Check alerts."
        return 1
    else
        log ""
        log "✅ All tests passed!"
        return 0
    fi
}

# ============================================
# ENTRY POINT
# ============================================

# Rotate log if > 1MB
if [ -f "$LOG_FILE" ] && [ $(stat -f%z "$LOG_FILE" 2>/dev/null || stat -c%s "$LOG_FILE" 2>/dev/null) -gt 1048576 ]; then
    mv "$LOG_FILE" "${LOG_FILE}.old"
fi

run_all_tests
exit $?
