#!/bin/bash
# T377: Weekly volatility calibration check
# Creates alert if realized vol differs from model assumptions by >20%
# Cron: 0 8 * * 0 (Sunday 08:00 UTC)

set -e
cd "$(dirname "$0")/.."

ALERT_FILE="scripts/kalshi-vol-recalibration.alert"
VOL_STATS="data/ohlc/volatility-stats.json"

# First, update volatility stats from OHLC cache
echo "📊 Running volatility calculation..."
python3 scripts/calculate-historical-volatility.py > /dev/null 2>&1

# Check if stats file exists
if [[ ! -f "$VOL_STATS" ]]; then
    echo "❌ Volatility stats file not found"
    exit 1
fi

# Parse and check for >20% deviation (30d period)
check_calibration() {
    local asset=$1
    local deviation=$(python3 -c "
import json
with open('$VOL_STATS') as f:
    data = json.load(f)
    asset_data = data.get('assets', {}).get('$asset', {})
    period_30d = asset_data.get('periods', {}).get('30d', {})
    print(period_30d.get('deviation_from_model_pct', 0))
" 2>/dev/null || echo "0")
    
    echo "$deviation"
}

btc_dev=$(check_calibration "BTC")
eth_dev=$(check_calibration "ETH")

# Check if either needs recalibration (absolute deviation > 20%)
needs_alert=false
alert_message=""

if (( $(echo "$btc_dev < -20 || $btc_dev > 20" | bc -l) )); then
    needs_alert=true
    btc_actual=$(python3 -c "
import json
with open('$VOL_STATS') as f:
    data = json.load(f)
    print(data.get('assets',{}).get('BTC',{}).get('periods',{}).get('30d',{}).get('vol_hourly_decimal', 0.005))
")
    alert_message+="BTC: ${btc_dev}% deviation (30d realized: ${btc_actual}, model: 0.005)\n"
fi

if (( $(echo "$eth_dev < -20 || $eth_dev > 20" | bc -l) )); then
    needs_alert=true
    eth_actual=$(python3 -c "
import json
with open('$VOL_STATS') as f:
    data = json.load(f)
    print(data.get('assets',{}).get('ETH',{}).get('periods',{}).get('30d',{}).get('vol_hourly_decimal', 0.007))
")
    alert_message+="ETH: ${eth_dev}% deviation (30d realized: ${eth_actual}, model: 0.007)\n"
fi

if $needs_alert; then
    # Create alert file
    cat > "$ALERT_FILE" << EOF
{
    "type": "vol_recalibration",
    "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
    "btc_deviation_pct": $btc_dev,
    "eth_deviation_pct": $eth_dev,
    "message": "⚠️ VOLATILITY RECALIBRATION NEEDED\n\n$alert_message\nConsider adjusting BTC_HOURLY_VOL and/or ETH_HOURLY_VOL constants in autotrader-v2.py",
    "stats_file": "$VOL_STATS"
}
EOF
    echo "🔔 Alert created: $ALERT_FILE"
    echo "BTC deviation: ${btc_dev}%"
    echo "ETH deviation: ${eth_dev}%"
else
    echo "✅ Volatility calibration OK (BTC: ${btc_dev}%, ETH: ${eth_dev}%)"
    # Remove stale alert if exists
    [[ -f "$ALERT_FILE" ]] && rm "$ALERT_FILE"
fi
