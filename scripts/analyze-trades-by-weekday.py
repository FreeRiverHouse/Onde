#!/usr/bin/env python3
"""
Analyze trading performance by day of week.
Identifies patterns: some days may have higher volatility (more opportunity)
or lower liquidity (worse fills).

Usage: python3 analyze-trades-by-weekday.py
"""

import json
from datetime import datetime
from collections import defaultdict
import os

TRADE_LOG = os.path.expanduser("~/Projects/Onde/scripts/kalshi-trades-v2.jsonl")
TRADE_LOG_V1 = os.path.expanduser("~/Projects/Onde/scripts/kalshi-trades.jsonl")

def load_trades():
    """Load trades from v2 log (or v1 fallback)."""
    trades = []
    
    # Try v2 first
    if os.path.exists(TRADE_LOG):
        with open(TRADE_LOG, 'r') as f:
            for line in f:
                try:
                    trades.append(json.loads(line.strip()))
                except:
                    continue
    
    # Fallback to v1 if no v2 trades
    if not trades and os.path.exists(TRADE_LOG_V1):
        with open(TRADE_LOG_V1, 'r') as f:
            for line in f:
                try:
                    trades.append(json.loads(line.strip()))
                except:
                    continue
    
    return trades

def analyze_by_weekday(trades):
    """Group trades by day of week and calculate stats."""
    DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    
    stats = {day: {'trades': 0, 'wins': 0, 'pnl': 0} for day in DAYS}
    
    for trade in trades:
        # Get trade timestamp
        ts = trade.get('timestamp') or trade.get('time')
        if not ts:
            continue
            
        try:
            if isinstance(ts, str):
                dt = datetime.fromisoformat(ts.replace('Z', '+00:00'))
            else:
                dt = datetime.fromtimestamp(ts)
            
            day_name = DAYS[dt.weekday()]
        except:
            continue
        
        # Count trade
        stats[day_name]['trades'] += 1
        
        # Check result
        result = trade.get('result_status', trade.get('result', ''))
        if result == 'won':
            stats[day_name]['wins'] += 1
        
        # Calculate PnL
        price = trade.get('price', trade.get('avg_price', 50))
        contracts = trade.get('contracts', trade.get('quantity', 1))
        side = trade.get('side', 'no')
        
        if result == 'won':
            pnl = (100 - price) * contracts if side.lower() == 'no' else (100 - price) * contracts
        elif result == 'lost':
            pnl = -price * contracts
        else:
            pnl = 0
        
        stats[day_name]['pnl'] += pnl
    
    return stats

def print_report(stats):
    """Print formatted report."""
    DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    
    print("\n" + "=" * 60)
    print("📊 TRADING PERFORMANCE BY DAY OF WEEK")
    print("=" * 60)
    
    total_trades = sum(s['trades'] for s in stats.values())
    
    if total_trades == 0:
        print("\n⚠️ No trades found!")
        return
    
    print(f"\n{'Day':<12} {'Trades':>8} {'Win Rate':>10} {'PnL':>12} {'Avg PnL':>10}")
    print("-" * 52)
    
    best_day = None
    best_wr = -1
    worst_day = None
    worst_wr = 101
    
    for day in DAYS:
        s = stats[day]
        trades = s['trades']
        wins = s['wins']
        pnl = s['pnl']
        
        if trades > 0:
            wr = (wins / trades) * 100
            avg_pnl = pnl / trades
            
            if wr > best_wr and trades >= 3:
                best_wr = wr
                best_day = day
            if wr < worst_wr and trades >= 3:
                worst_wr = wr
                worst_day = day
            
            wr_str = f"{wr:.1f}%"
            pnl_str = f"${pnl/100:.2f}"
            avg_str = f"${avg_pnl/100:.2f}"
        else:
            wr_str = "-"
            pnl_str = "-"
            avg_str = "-"
        
        print(f"{day:<12} {trades:>8} {wr_str:>10} {pnl_str:>12} {avg_str:>10}")
    
    print("-" * 52)
    
    # Summary
    total_wins = sum(s['wins'] for s in stats.values())
    total_pnl = sum(s['pnl'] for s in stats.values())
    overall_wr = (total_wins / total_trades * 100) if total_trades > 0 else 0
    
    print(f"{'TOTAL':<12} {total_trades:>8} {overall_wr:.1f}%{'':<4} ${total_pnl/100:>10.2f}")
    
    print("\n📈 INSIGHTS:")
    if best_day and best_wr > 0:
        print(f"  ✅ Best day: {best_day} ({best_wr:.1f}% win rate)")
    if worst_day and worst_wr < 100:
        print(f"  ⚠️ Worst day: {worst_day} ({worst_wr:.1f}% win rate)")
    
    # Recommendations
    print("\n💡 RECOMMENDATIONS:")
    if best_day:
        print(f"  • Consider increasing position size on {best_day}s")
    if worst_day:
        print(f"  • Consider reducing activity or size on {worst_day}s")

if __name__ == '__main__':
    trades = load_trades()
    print(f"Loaded {len(trades)} trades")
    
    stats = analyze_by_weekday(trades)
    print_report(stats)
