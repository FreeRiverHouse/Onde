#!/usr/bin/env python3
"""
Kalshi Daily Trading Summary
Generates a daily summary for Telegram notification.
Output is written to kalshi-daily-summary.txt for cron delivery.
"""

import json
from datetime import datetime, timedelta, timezone
from collections import defaultdict
from pathlib import Path

TRADES_FILE = Path(__file__).parent / "kalshi-trades.jsonl"
OUTPUT_FILE = Path(__file__).parent / "kalshi-daily-summary.txt"

def parse_timestamp(ts):
    """Parse ISO timestamp."""
    return datetime.fromisoformat(ts.replace('Z', '+00:00'))

def get_pst_date(dt):
    """Convert datetime to PST date string."""
    pst_offset = timedelta(hours=-8)
    pst_time = dt + pst_offset
    return pst_time.strftime('%Y-%m-%d')

def analyze_daily():
    """Analyze today's trades and generate summary."""
    # Get today's date in PST
    now_utc = datetime.now(timezone.utc)
    today_pst = get_pst_date(now_utc)
    
    trades = []
    settled_won = 0
    settled_lost = 0
    pending = 0
    total_cost = 0
    pnl = 0
    
    with open(TRADES_FILE) as f:
        for line in f:
            try:
                entry = json.loads(line.strip())
                if entry.get('type') != 'trade' or entry.get('order_status') != 'executed':
                    continue
                    
                trade_date = get_pst_date(parse_timestamp(entry['timestamp']))
                if trade_date != today_pst:
                    continue
                    
                trades.append(entry)
                cost = entry.get('cost_cents', 0)
                total_cost += cost
                
                result = entry.get('result_status', 'pending')
                if result == 'won':
                    settled_won += 1
                    # NO bet wins: payout = contracts * 100 - cost
                    contracts = entry.get('contracts', 1)
                    pnl += (contracts * 100) - cost
                elif result == 'lost':
                    settled_lost += 1
                    pnl -= cost
                else:
                    pending += 1
                    
            except (json.JSONDecodeError, KeyError):
                continue
    
    total_trades = len(trades)
    settled = settled_won + settled_lost
    win_rate = (settled_won / settled * 100) if settled > 0 else 0
    
    # Generate summary message
    summary = f"""📊 **Kalshi Daily Summary** ({today_pst})

🎯 **Trades Today:** {total_trades}
💰 **Total Wagered:** ${total_cost/100:.2f}

**Settled Results:**
✅ Won: {settled_won}
❌ Lost: {settled_lost}
⏳ Pending: {pending}

**Win Rate:** {win_rate:.1f}%
**Daily PnL:** ${pnl/100:+.2f}

---
_Autotrader v2 • Black-Scholes Model_"""
    
    # Write to file for cron
    with open(OUTPUT_FILE, 'w') as f:
        f.write(summary)
    
    print(summary)
    return summary

if __name__ == "__main__":
    analyze_daily()
