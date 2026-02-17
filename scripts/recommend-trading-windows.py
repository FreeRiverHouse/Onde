#!/usr/bin/env python3
"""
Auto-detect optimal trading hours from historical data.

Analyzes trading performance by hour and day of week, then provides
recommendations for optimal trading windows with confidence intervals.

Usage: 
    python3 recommend-trading-windows.py
    python3 recommend-trading-windows.py --json  # Output JSON for autotrader
    python3 recommend-trading-windows.py --min-trades 5  # Require more trades

Output:
    - Recommended trading hours
    - Days/hours to avoid
    - Confidence levels
    - JSON config for autotrader scheduling
"""

import json
import math
import argparse
from datetime import datetime, timezone
from collections import defaultdict
from pathlib import Path

SCRIPT_DIR = Path(__file__).parent
OUTPUT_FILE = SCRIPT_DIR.parent / "data" / "trading" / "trading-recommendations.json"

DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
DAY_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

def load_all_trades():
    """Load all trades from log files."""
    trades = []
    
    log_patterns = [
        SCRIPT_DIR / "kalshi-trades.jsonl",
        *SCRIPT_DIR.glob("kalshi-trades-*.jsonl"),
    ]
    
    for log_file in log_patterns:
        if not log_file.exists():
            continue
        
        with open(log_file, 'r') as f:
            for line in f:
                line = line.strip()
                if not line:
                    continue
                try:
                    trade = json.loads(line)
                    # Only include settled trades
                    if trade.get('result_status') in ['won', 'lost']:
                        trades.append(trade)
                except json.JSONDecodeError:
                    continue
    
    return trades


def wilson_score(wins, total, z=1.96):
    """
    Calculate Wilson score confidence interval for a proportion.
    z=1.96 for 95% confidence, z=1.645 for 90%, z=2.576 for 99%
    
    Returns (lower_bound, upper_bound, point_estimate)
    """
    if total == 0:
        return (0, 0, 0)
    
    p = wins / total
    
    # Wilson score interval
    denominator = 1 + z**2 / total
    center = (p + z**2 / (2 * total)) / denominator
    margin = z * math.sqrt((p * (1 - p) + z**2 / (4 * total)) / total) / denominator
    
    lower = max(0, center - margin)
    upper = min(1, center + margin)
    
    return (lower, upper, p)


def analyze_trading_windows(trades, min_trades=3):
    """
    Analyze trading performance by hour and day of week.
    Returns structured analysis with confidence intervals.
    """
    # Grid: day (0-6) x hour (0-23)
    grid = defaultdict(lambda: defaultdict(lambda: {'wins': 0, 'losses': 0, 'pnl': 0.0}))
    
    # Also track hourly and daily totals
    by_hour = defaultdict(lambda: {'wins': 0, 'losses': 0, 'pnl': 0.0})
    by_day = defaultdict(lambda: {'wins': 0, 'losses': 0, 'pnl': 0.0})
    
    for trade in trades:
        ts = trade.get('timestamp', trade.get('time', ''))
        if not ts:
            continue
        
        try:
            if 'T' in ts:
                dt = datetime.fromisoformat(ts.replace('Z', '+00:00'))
            else:
                dt = datetime.strptime(ts, '%Y-%m-%d %H:%M:%S')
        except:
            continue
        
        day = dt.weekday()
        hour = dt.hour
        won = trade.get('result_status') == 'won'
        
        price = trade.get('price', 50)
        contracts = trade.get('contracts', 1)
        pnl = ((100 - price) if won else -price) * contracts / 100
        
        # Update grid
        stats = grid[day][hour]
        if won:
            stats['wins'] += 1
        else:
            stats['losses'] += 1
        stats['pnl'] += pnl
        
        # Update totals
        if won:
            by_hour[hour]['wins'] += 1
            by_day[day]['wins'] += 1
        else:
            by_hour[hour]['losses'] += 1
            by_day[day]['losses'] += 1
        by_hour[hour]['pnl'] += pnl
        by_day[day]['pnl'] += pnl
    
    # Analyze each window with confidence intervals
    windows = []
    for day in range(7):
        for hour in range(24):
            stats = grid[day][hour]
            total = stats['wins'] + stats['losses']
            
            if total < min_trades:
                continue
            
            lower, upper, point = wilson_score(stats['wins'], total)
            
            windows.append({
                'day': day,
                'day_name': DAY_SHORT[day],
                'hour': hour,
                'wins': stats['wins'],
                'losses': stats['losses'],
                'total': total,
                'win_rate': round(point * 100, 1),
                'win_rate_lower': round(lower * 100, 1),
                'win_rate_upper': round(upper * 100, 1),
                'pnl': round(stats['pnl'], 2),
                'avg_pnl_per_trade': round(stats['pnl'] / total, 2) if total > 0 else 0
            })
    
    # Analyze by hour (aggregated across days)
    hourly = []
    for hour in range(24):
        stats = by_hour[hour]
        total = stats['wins'] + stats['losses']
        if total < min_trades:
            continue
        lower, upper, point = wilson_score(stats['wins'], total)
        hourly.append({
            'hour': hour,
            'total': total,
            'win_rate': round(point * 100, 1),
            'win_rate_lower': round(lower * 100, 1),
            'win_rate_upper': round(upper * 100, 1),
            'pnl': round(stats['pnl'], 2)
        })
    
    # Analyze by day (aggregated across hours)
    daily = []
    for day in range(7):
        stats = by_day[day]
        total = stats['wins'] + stats['losses']
        if total < min_trades:
            continue
        lower, upper, point = wilson_score(stats['wins'], total)
        daily.append({
            'day': day,
            'day_name': DAYS[day],
            'total': total,
            'win_rate': round(point * 100, 1),
            'win_rate_lower': round(lower * 100, 1),
            'win_rate_upper': round(upper * 100, 1),
            'pnl': round(stats['pnl'], 2)
        })
    
    return {
        'windows': windows,
        'by_hour': hourly,
        'by_day': daily
    }


def generate_recommendations(analysis, confidence_threshold=50):
    """
    Generate actionable recommendations from analysis.
    
    confidence_threshold: Minimum win rate lower bound to consider "good"
    """
    windows = analysis['windows']
    by_hour = analysis['by_hour']
    by_day = analysis['by_day']
    
    # Find best/worst windows (95% CI lower bound)
    best_windows = sorted(
        [w for w in windows if w['win_rate_lower'] >= confidence_threshold],
        key=lambda x: x['win_rate_lower'],
        reverse=True
    )[:10]
    
    worst_windows = sorted(
        [w for w in windows if w['win_rate_upper'] <= 50],
        key=lambda x: x['win_rate_upper']
    )[:10]
    
    # Best/worst hours
    best_hours = sorted(
        [h for h in by_hour if h['win_rate_lower'] >= confidence_threshold - 5],
        key=lambda x: x['win_rate_lower'],
        reverse=True
    )[:5]
    
    worst_hours = sorted(
        [h for h in by_hour if h['win_rate_upper'] <= 50],
        key=lambda x: x['win_rate_upper']
    )[:5]
    
    # Best/worst days
    best_days = sorted(
        [d for d in by_day if d['win_rate_lower'] >= confidence_threshold - 5],
        key=lambda x: x['win_rate_lower'],
        reverse=True
    )
    
    worst_days = sorted(
        [d for d in by_day if d['win_rate_upper'] <= 50],
        key=lambda x: x['win_rate_upper']
    )
    
    # Generate schedule config for autotrader
    # Hours to trade (where 95% CI lower bound >= threshold)
    active_hours = set()
    for h in by_hour:
        if h['win_rate_lower'] >= confidence_threshold - 10:
            active_hours.add(h['hour'])
    
    # If no hours meet criteria, use all hours above 45% lower bound
    if not active_hours:
        for h in by_hour:
            if h['win_rate_lower'] >= 45:
                active_hours.add(h['hour'])
    
    # Days to avoid (where 95% CI upper bound <= 45%)
    avoid_days = [d['day'] for d in by_day if d['win_rate_upper'] <= 45]
    
    return {
        'best_windows': best_windows,
        'worst_windows': worst_windows,
        'best_hours': best_hours,
        'worst_hours': worst_hours,
        'best_days': best_days,
        'worst_days': worst_days,
        'schedule': {
            'active_hours': sorted(active_hours) if active_hours else list(range(24)),
            'avoid_days': avoid_days,
            'confidence_threshold': confidence_threshold
        }
    }


def print_report(analysis, recommendations, trades):
    """Print human-readable report."""
    print("\n" + "=" * 70)
    print("📊 TRADING WINDOW RECOMMENDATIONS")
    print("=" * 70)
    print(f"Based on {len(trades)} settled trades")
    print(f"Confidence level: 95% (Wilson score intervals)")
    print()
    
    # Best windows
    if recommendations['best_windows']:
        print("🟢 BEST TRADING WINDOWS (High confidence profitable)")
        print("-" * 50)
        print(f"{'Window':<20} {'Trades':<8} {'Win Rate':<15} {'95% CI':<15} {'PnL':<10}")
        for w in recommendations['best_windows'][:5]:
            window = f"{w['day_name']} {w['hour']:02d}:00"
            ci = f"[{w['win_rate_lower']:.0f}%-{w['win_rate_upper']:.0f}%]"
            print(f"{window:<20} {w['total']:<8} {w['win_rate']:.1f}%{'':<8} {ci:<15} ${w['pnl']:+.2f}")
        print()
    
    # Worst windows
    if recommendations['worst_windows']:
        print("🔴 WINDOWS TO AVOID (High confidence losing)")
        print("-" * 50)
        for w in recommendations['worst_windows'][:5]:
            window = f"{w['day_name']} {w['hour']:02d}:00"
            ci = f"[{w['win_rate_lower']:.0f}%-{w['win_rate_upper']:.0f}%]"
            print(f"{window:<20} {w['total']:<8} {w['win_rate']:.1f}%{'':<8} {ci:<15} ${w['pnl']:+.2f}")
        print()
    
    # Best hours
    if recommendations['best_hours']:
        print("⏰ BEST HOURS (Aggregated across all days)")
        print("-" * 50)
        for h in recommendations['best_hours']:
            ci = f"[{h['win_rate_lower']:.0f}%-{h['win_rate_upper']:.0f}%]"
            print(f"  {h['hour']:02d}:00 UTC - {h['win_rate']:.1f}% WR {ci}, {h['total']} trades, ${h['pnl']:+.2f}")
        print()
    
    # Worst hours
    if recommendations['worst_hours']:
        print("⚠️  HOURS TO AVOID")
        print("-" * 50)
        for h in recommendations['worst_hours']:
            ci = f"[{h['win_rate_lower']:.0f}%-{h['win_rate_upper']:.0f}%]"
            print(f"  {h['hour']:02d}:00 UTC - {h['win_rate']:.1f}% WR {ci}, {h['total']} trades, ${h['pnl']:+.2f}")
        print()
    
    # Best/worst days
    if recommendations['best_days'] or recommendations['worst_days']:
        print("📅 BY DAY OF WEEK")
        print("-" * 50)
        if recommendations['best_days']:
            print("  Best days:")
            for d in recommendations['best_days']:
                ci = f"[{d['win_rate_lower']:.0f}%-{d['win_rate_upper']:.0f}%]"
                print(f"    {d['day_name']:<10} - {d['win_rate']:.1f}% WR {ci}, {d['total']} trades")
        if recommendations['worst_days']:
            print("  Worst days:")
            for d in recommendations['worst_days']:
                ci = f"[{d['win_rate_lower']:.0f}%-{d['win_rate_upper']:.0f}%]"
                print(f"    {d['day_name']:<10} - {d['win_rate']:.1f}% WR {ci}, {d['total']} trades")
        print()
    
    # Schedule recommendation
    schedule = recommendations['schedule']
    print("⚡ RECOMMENDED SCHEDULE FOR AUTOTRADER")
    print("-" * 50)
    if schedule['active_hours']:
        hours_str = ', '.join(f"{h:02d}:00" for h in schedule['active_hours'])
        print(f"  Active hours (UTC): {hours_str}")
    if schedule['avoid_days']:
        days_str = ', '.join(DAYS[d] for d in schedule['avoid_days'])
        print(f"  Avoid days: {days_str}")
    else:
        print("  No days to avoid (insufficient confidence)")
    print()
    print("=" * 70)


def main():
    parser = argparse.ArgumentParser(description='Analyze optimal trading windows')
    parser.add_argument('--min-trades', type=int, default=3, 
                       help='Minimum trades per window for analysis (default: 3)')
    parser.add_argument('--json', action='store_true',
                       help='Output JSON only')
    parser.add_argument('--confidence', type=int, default=50,
                       help='Win rate lower bound threshold (default: 50)')
    args = parser.parse_args()
    
    trades = load_all_trades()
    if not trades:
        print("No settled trades to analyze.")
        return
    
    analysis = analyze_trading_windows(trades, min_trades=args.min_trades)
    recommendations = generate_recommendations(analysis, confidence_threshold=args.confidence)
    
    # Build output JSON
    output = {
        'generated_at': datetime.now(tz=timezone.utc).isoformat().replace('+00:00', 'Z'),
        'trades_analyzed': len(trades),
        'min_trades_threshold': args.min_trades,
        'confidence_level': '95%',
        'analysis': analysis,
        'recommendations': recommendations
    }
    
    # Ensure output directory exists
    OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)
    
    # Write JSON
    with open(OUTPUT_FILE, 'w') as f:
        json.dump(output, f, indent=2)
    
    if args.json:
        print(json.dumps(output, indent=2))
    else:
        print_report(analysis, recommendations, trades)
        print(f"\n📄 Recommendations saved to: {OUTPUT_FILE}")


if __name__ == "__main__":
    main()
