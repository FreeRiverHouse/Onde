#!/bin/bash
# watchdog-ssl-expiry.sh - Proactive SSL certificate monitoring
# Part of T1023 - Infrastructure watchdog
#
# Cron: 0 9 * * * /Users/mattia/Projects/Onde/scripts/watchdog-ssl-expiry.sh
#
# Checks SSL expiry for key domains and creates alerts:
# - ssl-expiring.alert (30 days warning)
# - ssl-critical.alert (7 days critical)

set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
LOG_FILE="${SCRIPT_DIR}/../logs/ssl-expiry.log"
ALERT_EXPIRING="${SCRIPT_DIR}/ssl-expiring.alert"
ALERT_CRITICAL="${SCRIPT_DIR}/ssl-critical.alert"

# Domains to check
DOMAINS=(
  "onde.la"
  "onde.surf"
  "skin-studio.pages.dev"
  "clawd.bot"
)

# Warning thresholds (days)
WARNING_DAYS=30
CRITICAL_DAYS=7

# Ensure logs directory exists
mkdir -p "$(dirname "$LOG_FILE")"

log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" >> "$LOG_FILE"
}

get_ssl_expiry_days() {
  local domain="$1"
  local expiry_date
  local days_left
  
  # Get certificate expiry date (without timeout command which may not exist)
  expiry_date=$(echo | openssl s_client -servername "$domain" -connect "$domain:443" 2>/dev/null | openssl x509 -noout -enddate 2>/dev/null | cut -d= -f2)
  
  if [[ -z "$expiry_date" ]]; then
    echo "-1"  # Error getting certificate
    return
  fi
  
  # Convert to epoch timestamps (macOS compatible)
  local expiry_epoch today_epoch
  # Parse date like "Apr 10 18:57:10 2026 GMT"
  if [[ "$(uname)" == "Darwin" ]]; then
    expiry_epoch=$(date -j -f "%b %d %H:%M:%S %Y %Z" "$expiry_date" +%s 2>/dev/null)
  else
    expiry_epoch=$(date -d "$expiry_date" +%s 2>/dev/null)
  fi
  today_epoch=$(date +%s)
  
  if [[ -z "$expiry_epoch" ]]; then
    echo "-1"
    return
  fi
  
  # Calculate days remaining
  days_left=$(( (expiry_epoch - today_epoch) / 86400 ))
  echo "$days_left"
}

log "=== SSL Expiry Check Started ==="

# Track issues
expiring_domains=()
critical_domains=()
errors=()

for domain in "${DOMAINS[@]}"; do
  days=$(get_ssl_expiry_days "$domain")
  
  if [[ "$days" == "-1" ]]; then
    log "ERROR: Could not check SSL for $domain"
    errors+=("$domain: failed to check")
    continue
  fi
  
  log "$domain: $days days until expiry"
  
  if [[ "$days" -lt "$CRITICAL_DAYS" ]]; then
    critical_domains+=("$domain ($days days)")
  elif [[ "$days" -lt "$WARNING_DAYS" ]]; then
    expiring_domains+=("$domain ($days days)")
  fi
done

# Remove old alerts
rm -f "$ALERT_EXPIRING" "$ALERT_CRITICAL"

# Create alerts if needed
if [[ ${#critical_domains[@]} -gt 0 ]]; then
  {
    echo "🚨 SSL CRITICAL - Certificates expiring in <$CRITICAL_DAYS days!"
    echo ""
    echo "Domains:"
    for d in "${critical_domains[@]}"; do
      echo "  - $d"
    done
    echo ""
    echo "ACTION REQUIRED: Renew certificates immediately!"
    echo "Most Cloudflare sites auto-renew, but verify in dashboard."
    echo ""
    echo "Checked: $(date)"
  } > "$ALERT_CRITICAL"
  log "CRITICAL ALERT created: ${critical_domains[*]}"
fi

if [[ ${#expiring_domains[@]} -gt 0 ]]; then
  {
    echo "⚠️ SSL WARNING - Certificates expiring in <$WARNING_DAYS days"
    echo ""
    echo "Domains:"
    for d in "${expiring_domains[@]}"; do
      echo "  - $d"
    done
    echo ""
    echo "Monitor these for auto-renewal."
    echo "Most Cloudflare sites auto-renew 15 days before expiry."
    echo ""
    echo "Checked: $(date)"
  } > "$ALERT_EXPIRING"
  log "WARNING ALERT created: ${expiring_domains[*]}"
fi

if [[ ${#errors[@]} -gt 0 ]]; then
  log "Errors encountered: ${errors[*]}"
fi

log "=== SSL Expiry Check Complete ==="
log ""
