#!/usr/bin/env python3
"""
T410: Holiday Trading Performance Analysis

Extends weekend analysis to US market holidays.
Lower liquidity during holidays may affect crypto volatility patterns.

Usage:
    python3 scripts/analyze-holiday-trading.py [--v2] [--year YEAR]
"""

import json
import argparse
from datetime import datetime, date
from collections import defaultdict
from pathlib import Path
from typing import Optional

# US Market Holidays (2024-2026)
# Format: (month, day, name, observance_rules)
US_HOLIDAYS = {
    # Fixed holidays
    "new_years": [(1, 1)],
    "juneteenth": [(6, 19)],
    "independence_day": [(7, 4)],
    "veterans_day": [(11, 11)],
    "christmas": [(12, 25)],
    
    # Thanksgiving: 4th Thursday of November
    "thanksgiving": "4th_thursday_november",
    
    # MLK Day: 3rd Monday of January
    "mlk_day": "3rd_monday_january",
    
    # Presidents Day: 3rd Monday of February
    "presidents_day": "3rd_monday_february",
    
    # Memorial Day: Last Monday of May
    "memorial_day": "last_monday_may",
    
    # Labor Day: 1st Monday of September
    "labor_day": "1st_monday_september",
}

# Pre-computed holiday dates for 2024-2026
HOLIDAY_DATES = {
    # 2024
    date(2024, 1, 1): "New Year's Day",
    date(2024, 1, 15): "MLK Day",
    date(2024, 2, 19): "Presidents Day",
    date(2024, 5, 27): "Memorial Day",
    date(2024, 6, 19): "Juneteenth",
    date(2024, 7, 4): "Independence Day",
    date(2024, 9, 2): "Labor Day",
    date(2024, 11, 11): "Veterans Day",
    date(2024, 11, 28): "Thanksgiving",
    date(2024, 12, 25): "Christmas",
    
    # 2025
    date(2025, 1, 1): "New Year's Day",
    date(2025, 1, 20): "MLK Day",
    date(2025, 2, 17): "Presidents Day",
    date(2025, 5, 26): "Memorial Day",
    date(2025, 6, 19): "Juneteenth",
    date(2025, 7, 4): "Independence Day",
    date(2025, 9, 1): "Labor Day",
    date(2025, 11, 11): "Veterans Day",
    date(2025, 11, 27): "Thanksgiving",
    date(2025, 12, 25): "Christmas",
    
    # 2026
    date(2026, 1, 1): "New Year's Day",
    date(2026, 1, 19): "MLK Day",
    date(2026, 2, 16): "Presidents Day",
    date(2026, 5, 25): "Memorial Day",
    date(2026, 6, 19): "Juneteenth",
    date(2026, 7, 4): "Independence Day (observed)",
    date(2026, 9, 7): "Labor Day",
    date(2026, 11, 11): "Veterans Day",
    date(2026, 11, 26): "Thanksgiving",
    date(2026, 12, 25): "Christmas",
}


def is_holiday(dt: datetime) -> tuple[bool, Optional[str]]:
    """Check if a date is a US market holiday."""
    d = dt.date()
    
    # Direct match
    if d in HOLIDAY_DATES:
        return True, HOLIDAY_DATES[d]
    
    # Check day before/after major holidays (reduced liquidity)
    for holiday_date, holiday_name in HOLIDAY_DATES.items():
        # Day before
        if (holiday_date - d).days == 1:
            return True, f"Day before {holiday_name}"
        # Day after
        if (d - holiday_date).days == 1 and holiday_name in ["Thanksgiving", "Christmas"]:
            return True, f"Day after {holiday_name}"
    
    return False, None


def is_holiday_week(dt: datetime) -> tuple[bool, Optional[str]]:
    """Check if date is in a holiday week (Mon-Sun containing holiday)."""
    d = dt.date()
    
    # Get week start (Monday) and end (Sunday)
    week_start = d - timedelta(days=d.weekday())
    week_end = week_start + timedelta(days=6)
    
    for holiday_date, holiday_name in HOLIDAY_DATES.items():
        if week_start <= holiday_date <= week_end:
            return True, f"{holiday_name} week"
    
    return False, None


from datetime import timedelta


def load_trades(use_v2=False):
    """Load trades from JSONL file."""
    patterns = [
        'scripts/kalshi-trades-v2.jsonl' if use_v2 else 'scripts/kalshi-trades.jsonl',
        'data/trading/kalshi-trades-*.jsonl'
    ]
    
    trades = []
    
    # Try primary file first
    filename = patterns[0]
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
        pass
    
    # Also try data/trading files
    for p in Path('data/trading').glob('kalshi-trades-*.jsonl'):
        try:
            with open(p, 'r') as f:
                for line in f:
                    line = line.strip()
                    if line:
                        try:
                            trades.append(json.loads(line))
                        except json.JSONDecodeError:
                            continue
        except:
            continue
    
    # Deduplicate by timestamp + ticker
    seen = set()
    unique_trades = []
    for t in trades:
        key = (t.get('timestamp', ''), t.get('ticker', ''))
        if key not in seen:
            seen.add(key)
            unique_trades.append(t)
    
    return unique_trades


def analyze_holidays(trades, year_filter=None):
    """Analyze trades on holidays vs normal days."""
    
    holiday_stats = defaultdict(lambda: {
        'trades': 0, 'wins': 0, 'losses': 0, 'pending': 0,
        'pnl': 0, 'invested': 0
    })
    normal_stats = {
        'trades': 0, 'wins': 0, 'losses': 0, 'pending': 0,
        'pnl': 0, 'invested': 0
    }
    
    holiday_trades = []
    normal_trades = []
    
    for trade in trades:
        ts = trade.get('timestamp', '')
        if not ts:
            continue
        
        try:
            dt = datetime.fromisoformat(ts.replace('Z', '+00:00'))
        except:
            continue
        
        # Year filter
        if year_filter and dt.year != year_filter:
            continue
        
        is_hol, holiday_name = is_holiday(dt)
        result = trade.get('result_status', 'pending')
        
        # Calculate PnL
        price = trade.get('price', trade.get('yes_price', trade.get('no_price', 0)))
        contracts = trade.get('contracts', trade.get('count', 1))
        invested = price * contracts
        
        if result == 'won':
            pnl = (100 - price) * contracts
        elif result == 'lost':
            pnl = -price * contracts
        else:
            pnl = 0
        
        # Categorize
        if is_hol:
            stats = holiday_stats[holiday_name]
            holiday_trades.append({**trade, 'holiday': holiday_name})
        else:
            stats = normal_stats
            normal_trades.append(trade)
        
        stats['trades'] += 1
        stats['invested'] += invested
        stats['pnl'] += pnl
        
        if result == 'won':
            stats['wins'] += 1
        elif result == 'lost':
            stats['losses'] += 1
        else:
            stats['pending'] += 1
    
    return holiday_stats, normal_stats, holiday_trades, normal_trades


def print_report(holiday_stats, normal_stats, use_v2, year_filter=None):
    """Print analysis report."""
    print("\n" + "=" * 70)
    title = f"📅 HOLIDAY TRADING ANALYSIS {'(v2)' if use_v2 else '(v1)'}"
    if year_filter:
        title += f" - {year_filter}"
    print(title)
    print("=" * 70)
    
    # Normal days summary
    print("\n📊 NORMAL DAYS (Non-Holiday):")
    print("-" * 40)
    n = normal_stats
    if n['trades'] > 0:
        settled = n['wins'] + n['losses']
        win_rate = (n['wins'] / settled * 100) if settled > 0 else 0
        roi = (n['pnl'] / n['invested'] * 100) if n['invested'] > 0 else 0
        print(f"  Trades: {n['trades']} ({n['wins']}W / {n['losses']}L / {n['pending']}P)")
        print(f"  Win Rate: {win_rate:.1f}%")
        print(f"  PnL: ${n['pnl']:.2f} (ROI: {roi:+.1f}%)")
    else:
        print("  No trades found")
    
    # Holiday breakdown
    print("\n📅 HOLIDAY PERIODS:")
    print("-" * 40)
    
    if not holiday_stats:
        print("  No holiday trades found")
    else:
        total_holiday = {
            'trades': 0, 'wins': 0, 'losses': 0, 'pending': 0,
            'pnl': 0, 'invested': 0
        }
        
        for holiday_name, stats in sorted(holiday_stats.items()):
            for k in total_holiday:
                total_holiday[k] += stats[k]
            
            if stats['trades'] > 0:
                settled = stats['wins'] + stats['losses']
                win_rate = (stats['wins'] / settled * 100) if settled > 0 else 0
                emoji = "🎄" if "Christmas" in holiday_name else "🦃" if "Thanksgiving" in holiday_name else "🎆" if "Independence" in holiday_name else "📅"
                print(f"\n  {emoji} {holiday_name}:")
                print(f"     Trades: {stats['trades']} ({stats['wins']}W / {stats['losses']}L)")
                print(f"     Win Rate: {win_rate:.1f}%")
                print(f"     PnL: ${stats['pnl']:.2f}")
        
        # Holiday total
        print("\n  " + "-" * 35)
        print("  📊 HOLIDAY TOTAL:")
        h = total_holiday
        if h['trades'] > 0:
            settled = h['wins'] + h['losses']
            win_rate = (h['wins'] / settled * 100) if settled > 0 else 0
            roi = (h['pnl'] / h['invested'] * 100) if h['invested'] > 0 else 0
            print(f"     Trades: {h['trades']} ({h['wins']}W / {h['losses']}L / {h['pending']}P)")
            print(f"     Win Rate: {win_rate:.1f}%")
            print(f"     PnL: ${h['pnl']:.2f} (ROI: {roi:+.1f}%)")
    
    # Comparison
    print("\n" + "=" * 70)
    print("📈 COMPARISON:")
    print("-" * 40)
    
    n = normal_stats
    h_total = {'trades': 0, 'wins': 0, 'losses': 0, 'pnl': 0, 'invested': 0}
    for stats in holiday_stats.values():
        for k in h_total:
            h_total[k] += stats.get(k, 0)
    
    n_settled = n['wins'] + n['losses']
    h_settled = h_total['wins'] + h_total['losses']
    
    n_wr = (n['wins'] / n_settled * 100) if n_settled > 0 else 0
    h_wr = (h_total['wins'] / h_settled * 100) if h_settled > 0 else 0
    
    wr_diff = h_wr - n_wr
    
    print(f"  Normal Days Win Rate: {n_wr:.1f}% ({n_settled} settled)")
    print(f"  Holiday Win Rate:     {h_wr:.1f}% ({h_settled} settled)")
    print(f"  Difference:           {wr_diff:+.1f}%")
    
    # Recommendations
    print("\n💡 INSIGHTS:")
    print("-" * 40)
    
    if h_total['trades'] == 0:
        print("  ⚠️  No holiday trades to analyze")
        print("  📝 Data will accumulate over time")
    elif h_settled < 5:
        print("  ⚠️  Limited holiday data (need more trades)")
    else:
        if h_wr > n_wr + 5:
            print("  ✅ Holidays show BETTER performance")
            print("  💡 Lower institutional activity may reduce manipulation")
        elif h_wr < n_wr - 5:
            print("  ⚠️  Holidays show WORSE performance")
            print("  💡 Consider reducing position sizes during holidays")
        else:
            print("  ➡️  No significant difference between holidays and normal days")
    
    print("\n" + "=" * 70)


def save_analysis(holiday_stats, normal_stats, year_filter=None):
    """Save analysis to JSON file."""
    output = {
        "timestamp": datetime.now().isoformat(),
        "year_filter": year_filter,
        "normal_days": dict(normal_stats),
        "holidays": {k: dict(v) for k, v in holiday_stats.items()},
        "holiday_total": {
            "trades": sum(s['trades'] for s in holiday_stats.values()),
            "wins": sum(s['wins'] for s in holiday_stats.values()),
            "losses": sum(s['losses'] for s in holiday_stats.values()),
            "pnl": sum(s['pnl'] for s in holiday_stats.values()),
            "invested": sum(s['invested'] for s in holiday_stats.values())
        }
    }
    
    # Calculate win rates
    n = normal_stats
    h = output["holiday_total"]
    
    n_settled = n['wins'] + n['losses']
    h_settled = h['wins'] + h['losses']
    
    output["comparison"] = {
        "normal_win_rate": round(n['wins'] / n_settled * 100, 1) if n_settled > 0 else None,
        "holiday_win_rate": round(h['wins'] / h_settled * 100, 1) if h_settled > 0 else None,
        "normal_trades": n_settled,
        "holiday_trades": h_settled
    }
    
    output_path = Path("data/trading/holiday-analysis.json")
    output_path.parent.mkdir(parents=True, exist_ok=True)
    
    with open(output_path, 'w') as f:
        json.dump(output, f, indent=2)
    
    print(f"\n💾 Saved analysis to {output_path}")


def main():
    parser = argparse.ArgumentParser(description="Holiday trading analysis")
    parser.add_argument("--v2", action="store_true", help="Use v2 trade log")
    parser.add_argument("--year", type=int, help="Filter by year")
    args = parser.parse_args()
    
    trades = load_trades(use_v2=args.v2)
    
    if not trades:
        print("❌ No trades found")
        return
    
    print(f"📊 Loaded {len(trades)} trades")
    
    holiday_stats, normal_stats, _, _ = analyze_holidays(trades, args.year)
    print_report(holiday_stats, normal_stats, args.v2, args.year)
    save_analysis(holiday_stats, normal_stats, args.year)


if __name__ == "__main__":
    main()
