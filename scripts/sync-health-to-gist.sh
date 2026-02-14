#!/bin/bash
# Sync autotrader health endpoint to paper-trade-state.json and push to gist
# Run this periodically (e.g., every 60s via cron or watchdog)

cd "$(dirname "$0")/.."

STATE_FILE="data/trading/paper-trade-state.json"
HEALTH_URL="http://localhost:8089/health"

# Fetch health data
HEALTH=$(curl -s "$HEALTH_URL" 2>/dev/null)
if [ -z "$HEALTH" ]; then
    echo "$(date): Health endpoint not responding" >> /tmp/sync-health-gist.log
    exit 1
fi

# Convert health data to paper-trade-state format using Python
python3 -c "
import json, sys
from datetime import datetime, timezone

health = json.loads('''$HEALTH''')

# Read existing state for fields not in health
try:
    with open('$STATE_FILE') as f:
        existing = json.load(f)
except:
    existing = {}

# Build paper trade state from health endpoint
state = {
    'session_id': existing.get('session_id', 'autotrader-v2'),
    'started_at': existing.get('started_at', datetime.now(timezone.utc).isoformat()),
    'starting_balance_cents': existing.get('starting_balance_cents', 5000),
    'current_balance_cents': health.get('cash_cents', 0) + health.get('pnl_today_cents', 0) + existing.get('starting_balance_cents', 5000),
    'mode': 'paper' if health.get('dry_run') else 'live',
    'strategy_version': 'v2.1-improved',
    'safety_guards': existing.get('safety_guards', {
        'min_forecast_strike_gap': 2.0,
        'max_market_conviction': 0.85,
        'min_our_prob': 0.05,
        'uncertainty_override': 4.0,
        'kelly_fraction': 0.05,
        'min_edge': 0.04
    }),
    'stats': {
        'total_trades': health.get('trades_today', 0),
        'wins': health.get('today_won', 0),
        'losses': health.get('today_lost', 0),
        'pending': health.get('today_pending', 0),
        'win_rate': health.get('win_rate_today', 0),
        'pnl_cents': health.get('pnl_today_cents', 0),
        'gross_profit_cents': existing.get('stats', {}).get('gross_profit_cents', 0),
        'gross_loss_cents': existing.get('stats', {}).get('gross_loss_cents', 0),
        'current_streak': health.get('consecutive_losses', 0),
        'streak_type': 'loss' if health.get('consecutive_losses', 0) > 0 else 'none',
        'max_drawdown_cents': existing.get('stats', {}).get('max_drawdown_cents', 0),
        'peak_balance_cents': existing.get('stats', {}).get('peak_balance_cents', 5000)
    },
    'positions': [],
    'recent_trades': health.get('recent_trades', []),
    'weather_stats': existing.get('weather_stats', {'trades':0,'wins':0,'losses':0,'win_rate':0,'pnl_cents':0,'filtered_count':0,'by_city':{}}),
    'crypto_stats': existing.get('crypto_stats', {'trades':0,'wins':0,'losses':0,'win_rate':0,'pnl_cents':0,'by_asset':{}}),
    'last_cycle': health.get('last_cycle_time'),
    'cycle_count': health.get('cycle_count', 0),
    'last_updated': datetime.now(timezone.utc).isoformat(),
    'uptime_human': health.get('uptime_human', ''),
    'circuit_breaker_active': health.get('circuit_breaker_active', False),
    'status': health.get('status', 'unknown')
}

with open('$STATE_FILE', 'w') as f:
    json.dump(state, f, indent=2)

print(f'Updated: trades={state[\"stats\"][\"total_trades\"]}, mode={state[\"mode\"]}, cycle={state[\"cycle_count\"]}')
" 2>&1

# Now sync to gist
python3 scripts/sync-paper-trade-gist.py 2>&1 | tail -3
