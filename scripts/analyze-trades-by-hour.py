#!/usr/bin/env python3
"""
Analyze trading performance by hour of day.
Helps identify optimal trading windows.

Usage: python3 analyze-trades-by-hour.py
"""

import json
from datetime import datetime
from collections import defaultdict
from pathlib import Path

TRADE_LOG = Path(__file__).parent / "kalshi-trades.jsonl"

def load_trades():
    """Load all trades from log file."""
    trades = []
    if not TRADE_LOG.exists():
        print(f"❌ Trade log not found: {TRADE_LOG}")
        return trades
    
    with open(TRADE_LOG, 'r') as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            try:
                trade = json.loads(line)
                trades.append(trade)
            except json.JSONDecodeError:
                continue
    return trades

def analyze_by_hour(trades):
    """Analyze trades grouped by hour."""
    # Group trades by hour
    hourly_stats = defaultdict(lambda: {
        'total': 0,
        'won': 0,
        'lost': 0,
        'pending': 0,
        'pnl': 0.0,
        'yes_count': 0,
        'no_count': 0
    })
    
    for trade in trades:
        # Parse timestamp
        ts = trade.get('timestamp', trade.get('time', ''))
        if not ts:
            continue
        
        try:
            # Handle different timestamp formats
            if 'T' in ts:
                dt = datetime.fromisoformat(ts.replace('Z', '+00:00'))
            else:
                dt = datetime.strptime(ts, '%Y-%m-%d %H:%M:%S')
        except:
            continue
        
        hour = dt.hour
        stats = hourly_stats[hour]
        stats['total'] += 1
        
        # Count YES/NO
        side = trade.get('side', 'no').lower()
        if side == 'yes':
            stats['yes_count'] += 1
        else:
            stats['no_count'] += 1
        
        # Track result
        result = trade.get('result_status', 'pending').lower()
        if result == 'won':
            stats['won'] += 1
            # Calculate profit
            price = trade.get('price', trade.get('avg_price', 50))
            contracts = trade.get('contracts', trade.get('count', 1))
            profit = (100 - price) * contracts / 100  # Convert cents to dollars
            stats['pnl'] += profit
        elif result == 'lost':
            stats['lost'] += 1
            # Calculate loss
            price = trade.get('price', trade.get('avg_price', 50))
            contracts = trade.get('contracts', trade.get('count', 1))
            loss = price * contracts / 100
            stats['pnl'] -= loss
    
    return hourly_stats

def print_report(hourly_stats):
    """Print formatted report."""
    print("\n" + "=" * 70)
    print("📊 TRADING PERFORMANCE BY HOUR (UTC)")
    print("=" * 70)
    print(f"{'Hour':<6} {'Trades':<8} {'Won':<6} {'Lost':<6} {'Win%':<8} {'PnL':<10} {'YES/NO':<10}")
    print("-" * 70)
    
    total_trades = 0
    total_won = 0
    total_lost = 0
    total_pnl = 0.0
    
    # Sort by hour
    for hour in range(24):
        stats = hourly_stats.get(hour)
        if not stats or stats['total'] == 0:
            continue
        
        total_trades += stats['total']
        total_won += stats['won']
        total_lost += stats['lost']
        total_pnl += stats['pnl']
        
        settled = stats['won'] + stats['lost']
        win_rate = (stats['won'] / settled * 100) if settled > 0 else 0
        
        pnl_str = f"${stats['pnl']:+.2f}" if stats['pnl'] != 0 else "$0.00"
        yes_no = f"{stats['yes_count']}/{stats['no_count']}"
        
        # Color coding for win rate
        if win_rate >= 60:
            win_indicator = "🟢"
        elif win_rate >= 40:
            win_indicator = "🟡"
        else:
            win_indicator = "🔴"
        
        print(f"{hour:02d}:00  {stats['total']:<8} {stats['won']:<6} {stats['lost']:<6} {win_rate:>5.1f}%{win_indicator} {pnl_str:<10} {yes_no:<10}")
    
    print("-" * 70)
    
    # Summary
    settled_total = total_won + total_lost
    overall_win_rate = (total_won / settled_total * 100) if settled_total > 0 else 0
    
    print(f"{'TOTAL':<6} {total_trades:<8} {total_won:<6} {total_lost:<6} {overall_win_rate:>5.1f}%   ${total_pnl:+.2f}")
    print("=" * 70)
    
    # Find best and worst hours
    best_hour = None
    best_rate = 0
    worst_hour = None
    worst_rate = 100
    
    for hour, stats in hourly_stats.items():
        settled = stats['won'] + stats['lost']
        if settled >= 3:  # Minimum 3 settled trades to be significant
            win_rate = stats['won'] / settled * 100
            if win_rate > best_rate:
                best_rate = win_rate
                best_hour = hour
            if win_rate < worst_rate:
                worst_rate = win_rate
                worst_hour = hour
    
    print("\n📈 INSIGHTS:")
    if best_hour is not None:
        print(f"   Best hour:  {best_hour:02d}:00 UTC ({best_rate:.1f}% win rate)")
    if worst_hour is not None:
        print(f"   Worst hour: {worst_hour:02d}:00 UTC ({worst_rate:.1f}% win rate)")
    
    # High activity hours
    activity = [(h, s['total']) for h, s in hourly_stats.items()]
    activity.sort(key=lambda x: x[1], reverse=True)
    if activity:
        print(f"   Most active hours: {', '.join(f'{h:02d}:00' for h, _ in activity[:3])}")
    
    print()

def main():
    trades = load_trades()
    if not trades:
        print("No trades to analyze.")
        return
    
    print(f"Loaded {len(trades)} trades")
    
    hourly_stats = analyze_by_hour(trades)
    print_report(hourly_stats)

if __name__ == "__main__":
    main()
