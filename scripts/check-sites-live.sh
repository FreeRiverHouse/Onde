#!/bin/bash
# Check that main sites are live and responding with HTTP 200
# Creates .alert file if a site is down
# Usage: ./check-sites-live.sh

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Sites to check (name|url pairs)
SITES=(
    "onde.la|https://onde.la"
    "onde.surf|https://onde.surf"
)

# Results
FAILURES=()
SUCCESSES=()

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

check_site() {
    local name="$1"
    local url="$2"
    local timeout=10
    
    # Get HTTP status code
    local status
    status=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout "$timeout" --max-time 30 "$url" 2>/dev/null || echo "000")
    
    if [[ "$status" == "200" || "$status" == "301" || "$status" == "302" || "$status" == "307" || "$status" == "308" ]]; then
        log "✅ $name ($url) - HTTP $status"
        SUCCESSES+=("$name")
        return 0
    else
        log "❌ $name ($url) - HTTP $status"
        FAILURES+=("$name:$status:$url")
        return 1
    fi
}

# Main check
log "Starting site health check..."

for entry in "${SITES[@]}"; do
    name="${entry%%|*}"
    url="${entry##*|}"
    check_site "$name" "$url" || true
done

# Report results
echo ""
log "Results: ${#SUCCESSES[@]} up, ${#FAILURES[@]} down"

# Create alerts for failures
if [[ ${#FAILURES[@]} -gt 0 ]]; then
    for failure in "${FAILURES[@]}"; do
        # Parse failure: name:status:url
        site="${failure%%:*}"
        rest="${failure#*:}"
        status="${rest%%:*}"
        url="${rest#*:}"
        
        # Create specific alert file
        alert_file="$SCRIPT_DIR/${site//./-}-down.alert"
        
        cat > "$alert_file" << EOF
🚨 SITE DOWN ALERT

Site: $site
URL: $url
Status: HTTP $status
Time: $(date '+%Y-%m-%d %H:%M:%S %Z')

Action required: Check if site is deployed and accessible.
EOF
        
        log "Created alert: $alert_file"
    done
    
    exit 1
fi

exit 0
