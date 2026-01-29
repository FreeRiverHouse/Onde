#!/usr/bin/env python3
"""
T295: Weekend vs Weekday Performance Analysis

Analyzes trading performance by day of week.
Crypto trades 24/7 but patterns may differ weekend vs weekday.

Usage:
    python3 scripts/analyze-weekend-weekday.py [--v2]
"""

import json
import argparse
from datetime import datetime
from collections import defaultdict
from pathlib import Path

def load_trades(use_v2=False):
    """Load trades from JSONL file."""
    filename = 'scripts/kalshi-trades-v2.jsonl' if use_v2 else 'scripts/kalshi-trades.jsonl'
    trades = []
    
    try:
        with open(filename, 'r') as f:
            for line in f:
                line = line.strip()
                if line:
                    try:
                        trades.append(json.loads(line))
                    except json.JSONDecodeError:
                        continue
    except FileNotFoundError:
        print(f"⚠️  File not found: {filename}")
        return []
    
    return trades

def analyze_by_day(trades):
    """Analyze trades grouped by day of week."""
    # Day names
    days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    
    # Stats per day
    day_stats = defaultdict(lambda: {'trades': 0, 'wins': 0, 'losses': 0, 'pnl': 0, 'invested': 0})
    
    for trade in trades:
        # Parse timestamp
        ts = trade.get('timestamp', '')
        if not ts:
            continue
            
        try:
            dt = datetime.fromisoformat(ts.replace('Z', '+00:00'))
        except:
            continue
        
        day_name = days[dt.weekday()]
        result = trade.get('result_status', 'pending')
        
        day_stats[day_name]['trades'] += 1
        
        # Calculate PnL
        price = trade.get('price', trade.get('yes_price', trade.get('no_price', 0)))
        contracts = trade.get('contracts', trade.get('count', 1))
        side = trade.get('side', 'no')
        
        if result == 'won':
            day_stats[day_name]['wins'] += 1
            pnl = (100 - price) * contracts  # profit from win
            day_stats[day_name]['pnl'] += pnl
        elif result == 'lost':
            day_stats[day_name]['losses'] += 1
            pnl = -price * contracts  # loss
            day_stats[day_name]['pnl'] += pnl
        
        day_stats[day_name]['invested'] += price * contracts
    
    return day_stats, days

def analyze_weekend_vs_weekday(day_stats, days):
    """Compare weekend vs weekday performance."""
    weekend = {'trades': 0, 'wins': 0, 'losses': 0, 'pnl': 0, 'invested': 0}
    weekday = {'trades': 0, 'wins': 0, 'losses': 0, 'pnl': 0, 'invested': 0}
    
    for day in days:
        stats = day_stats[day]
        target = weekend if day in ['Saturday', 'Sunday'] else weekday
        
        for key in target:
            target[key] += stats[key]
    
    return weekend, weekday

def print_report(day_stats, days, weekend, weekday, use_v2):
    """Print formatted report."""
    print("\n" + "="*70)
    print(f"📊 WEEKEND VS WEEKDAY TRADING ANALYSIS {'(v2)' if use_v2 else '(v1)'}")
    print("="*70)
    
    # Per-day breakdown
    print("\n📅 By Day of Week:")
    print("-" * 60)
    print(f"{'Day':<12} {'Trades':>8} {'Wins':>6} {'Win%':>8} {'PnL':>12}")
    print("-" * 60)
    
    for day in days:
        stats = day_stats[day]
        trades = stats['trades']
        wins = stats['wins']
        settled = wins + stats['losses']
        win_rate = (wins / settled * 100) if settled > 0 else 0
        pnl = stats['pnl'] / 100  # cents to dollars
        
        marker = '🟢' if win_rate >= 50 else '🔴' if settled > 0 else '⚪'
        print(f"{marker} {day:<10} {trades:>8} {wins:>6} {win_rate:>7.1f}% ${pnl:>10.2f}")
    
    # Weekend vs Weekday summary
    print("\n" + "="*60)
    print("📊 WEEKEND VS WEEKDAY COMPARISON")
    print("="*60)
    
    for label, stats in [("Weekday (Mon-Fri)", weekday), ("Weekend (Sat-Sun)", weekend)]:
        trades = stats['trades']
        wins = stats['wins']
        settled = wins + stats['losses']
        win_rate = (wins / settled * 100) if settled > 0 else 0
        pnl = stats['pnl'] / 100
        roi = (stats['pnl'] / stats['invested'] * 100) if stats['invested'] > 0 else 0
        
        print(f"\n{label}:")
        print(f"  Trades: {trades}")
        print(f"  Settled: {settled} ({wins}W/{stats['losses']}L)")
        print(f"  Win Rate: {win_rate:.1f}%")
        print(f"  PnL: ${pnl:.2f}")
        print(f"  ROI: {roi:.1f}%")
    
    # Analysis insight
    print("\n" + "-"*60)
    print("💡 INSIGHTS:")
    
    weekend_settled = weekend['wins'] + weekend['losses']
    weekday_settled = weekday['wins'] + weekday['losses']
    
    if weekend_settled >= 5 and weekday_settled >= 5:
        weekend_wr = weekend['wins'] / weekend_settled * 100
        weekday_wr = weekday['wins'] / weekday_settled * 100
        diff = weekend_wr - weekday_wr
        
        if abs(diff) > 10:
            if diff > 0:
                print(f"  📈 WEEKEND OUTPERFORMS by {diff:.1f}% win rate")
                print("  → Consider increased position sizes on weekends")
            else:
                print(f"  📉 WEEKDAY OUTPERFORMS by {abs(diff):.1f}% win rate")
                print("  → Consider reduced position sizes on weekends")
        else:
            print("  ⚖️  No significant difference between weekend/weekday")
    else:
        print("  📊 Need more trades for statistically significant comparison")
        print(f"  → Weekend: {weekend_settled} settled, Weekday: {weekday_settled} settled")
    
    print("\n" + "="*70 + "\n")

def save_results(day_stats, weekend, weekday):
    """Save results to JSON for dashboard integration."""
    results = {
        'generated_at': datetime.now().isoformat(),
        'by_day': {day: dict(stats) for day, stats in day_stats.items()},
        'weekend': dict(weekend),
        'weekday': dict(weekday)
    }
    
    output_path = Path('data/trading/weekend-weekday-analysis.json')
    output_path.parent.mkdir(parents=True, exist_ok=True)
    
    with open(output_path, 'w') as f:
        json.dump(results, f, indent=2)
    
    print(f"✅ Results saved to {output_path}")

def main():
    parser = argparse.ArgumentParser(description='Analyze weekend vs weekday trading performance')
    parser.add_argument('--v2', action='store_true', help='Use v2 trade log')
    args = parser.parse_args()
    
    trades = load_trades(args.v2)
    
    if not trades:
        print("❌ No trades found")
        return
    
    print(f"📂 Loaded {len(trades)} trades")
    
    day_stats, days = analyze_by_day(trades)
    weekend, weekday = analyze_weekend_vs_weekday(day_stats, days)
    
    print_report(day_stats, days, weekend, weekday, args.v2)
    save_results(day_stats, weekend, weekday)

if __name__ == '__main__':
    main()
