#!/bin/bash
# GROK-DASH-002: Dashboard data-quality monitoring
# Checks onde.surf APIs for stale data, zero metrics, PnL outliers
# Creates alert files when issues detected

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ALERT_DIR="$SCRIPT_DIR"
BASE_URL="https://onde.surf"
ISSUES=0

echo "📊 Dashboard Data Quality Check - $(date '+%Y-%m-%d %H:%M PST')"
echo "=============================================================="

# Helper: check HTTP response
check_api() {
  local endpoint="$1"
  local description="$2"
  local response
  response=$(curl -sf "${BASE_URL}${endpoint}" 2>/dev/null || echo "FETCH_ERROR")
  
  if [ "$response" = "FETCH_ERROR" ]; then
    echo "❌ $description: API unreachable ($endpoint)"
    ISSUES=$((ISSUES + 1))
    return 1
  fi
  
  echo "$response"
  return 0
}

# 1. Check trading stats freshness
echo ""
echo "🔍 1. Trading Stats Freshness..."
trading_data=$(check_api "/api/trading/history" "Trading History") || true
if [ -n "$trading_data" ] && [ "$trading_data" != "FETCH_ERROR" ]; then
  # Check if data exists and has recent entries
  trade_count=$(echo "$trading_data" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('totalTrades', d.get('total', 0)) if isinstance(d, dict) else len(d) if isinstance(d, list) else 0)" 2>/dev/null || echo "0")
  echo "   Trades found: $trade_count"
  if [ "$trade_count" = "0" ]; then
    echo "   ⚠️  Zero trades — dashboard may look empty"
  fi
fi

# 2. Check agent status
echo ""
echo "🔍 2. Agent Status..."
agent_data=$(check_api "/api/agents/status" "Agent Status") || true
if [ -n "$agent_data" ] && [ "$agent_data" != "FETCH_ERROR" ]; then
  agent_count=$(echo "$agent_data" | python3 -c "import sys,json; d=json.load(sys.stdin); print(len(d.get('agents',[])) if isinstance(d, dict) else len(d) if isinstance(d, list) else 0)" 2>/dev/null || echo "0")
  echo "   Agents found: $agent_count"
fi

# 3. Check analytics data 
echo ""
echo "🔍 3. Analytics..."
analytics_data=$(check_api "/api/analytics" "Analytics") || true
if [ -n "$analytics_data" ] && [ "$analytics_data" != "FETCH_ERROR" ]; then
  visitors=$(echo "$analytics_data" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('visitors',{}).get('daily',0) if isinstance(d, dict) else 0)" 2>/dev/null || echo "0")
  echo "   Daily visitors: $visitors"
fi

# 4. Check gist freshness (main data source)
echo ""
echo "🔍 4. Gist Data Freshness..."
GIST_ID="c8ab2c34b97dbca70393e5dec3bd11f9"
gist_data=$(curl -sf "https://api.github.com/gists/$GIST_ID" 2>/dev/null || echo "FETCH_ERROR")
if [ "$gist_data" != "FETCH_ERROR" ]; then
  last_updated=$(echo "$gist_data" | python3 -c "import sys,json; print(json.load(sys.stdin).get('updated_at','unknown'))" 2>/dev/null || echo "unknown")
  echo "   Last gist update: $last_updated"
  
  # Check if stale (>24h)
  if [ "$last_updated" != "unknown" ]; then
    stale_check=$(python3 -c "
from datetime import datetime, timezone, timedelta
try:
    updated = datetime.fromisoformat('$last_updated'.replace('Z','+00:00'))
    age = datetime.now(timezone.utc) - updated
    if age > timedelta(hours=24):
        print(f'STALE:{age.total_seconds()/3600:.1f}h')
    else:
        print(f'OK:{age.total_seconds()/3600:.1f}h')
except:
    print('UNKNOWN')
" 2>/dev/null || echo "UNKNOWN")
    
    if [[ "$stale_check" == STALE:* ]]; then
      hours="${stale_check#STALE:}"
      echo "   ⚠️  Gist stale! Last updated ${hours} ago"
      echo "Trading gist stale for ${hours}. Dashboard showing outdated data." > "$ALERT_DIR/dashboard-stale-data.alert"
      ISSUES=$((ISSUES + 1))
    else
      hours="${stale_check#OK:}"
      echo "   ✅ Fresh (${hours} ago)"
    fi
  fi
fi

# 5. Check main pages respond
echo ""
echo "🔍 5. Page Health..."
for page in "/" "/betting" "/trading" "/frh" "/health"; do
  status=$(curl -sf -o /dev/null -w "%{http_code}" "${BASE_URL}${page}" 2>/dev/null || echo "000")
  if [ "$status" = "200" ] || [ "$status" = "307" ] || [ "$status" = "302" ]; then
    echo "   ✅ ${page} → ${status}"
  else
    echo "   ❌ ${page} → ${status}"
    ISSUES=$((ISSUES + 1))
  fi
done

# 6. PnL outlier check
echo ""
echo "🔍 6. PnL Sanity Check..."
if [ -f "$SCRIPT_DIR/../data/trading/kalshi-trades.jsonl" ]; then
  outliers=$(python3 -c "
import json, os
trades_file = '$SCRIPT_DIR/../data/trading/kalshi-trades.jsonl'
if os.path.exists(trades_file):
    trades = []
    with open(trades_file) as f:
        for line in f:
            try:
                t = json.loads(line)
                if 'pnl_cents' in t:
                    trades.append(t['pnl_cents'])
            except: pass
    if trades:
        avg = sum(trades) / len(trades)
        outliers = [t for t in trades if abs(t - avg) > 3 * max(1, (sum((x-avg)**2 for x in trades)/len(trades))**0.5)]
        print(f'Total: {len(trades)}, Outliers (3σ): {len(outliers)}')
    else:
        print('No PnL data')
else:
    print('No trades file')
" 2>/dev/null || echo "Check failed")
  echo "   $outliers"
else
  echo "   No local trades file"
fi

echo ""
echo "=============================================================="
if [ $ISSUES -eq 0 ]; then
  echo "✅ ALL CHECKS PASSED — Dashboard data quality OK"
else
  echo "⚠️  $ISSUES issue(s) detected"
fi

exit 0
