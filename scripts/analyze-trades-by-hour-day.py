#!/usr/bin/env python3
"""
Analyze trading performance by hour of day and day of week.
Outputs JSON for dashboard heatmap visualization.

Usage: python3 analyze-trades-by-hour-day.py
"""

import json
from datetime import datetime
from collections import defaultdict
from pathlib import Path

TRADE_LOG_DIR = Path(__file__).parent
OUTPUT_FILE = TRADE_LOG_DIR.parent / "data" / "trading" / "hour-day-heatmap.json"

DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

def load_all_trades():
    """Load all trades from log files."""
    trades = []
    
    # Load from multiple log files
    log_patterns = [
        TRADE_LOG_DIR / "kalshi-trades.jsonl",
        *TRADE_LOG_DIR.glob("kalshi-trades-*.jsonl"),
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
                    trades.append(trade)
                except json.JSONDecodeError:
                    continue
    
    return trades

def analyze_by_hour_day(trades):
    """Analyze trades grouped by hour and day of week."""
    # Grid: day (0-6) x hour (0-23)
    grid = defaultdict(lambda: defaultdict(lambda: {
        'total': 0,
        'won': 0,
        'lost': 0,
        'pnl': 0.0
    }))
    
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
        
        day = dt.weekday()  # 0=Monday, 6=Sunday
        hour = dt.hour
        stats = grid[day][hour]
        stats['total'] += 1
        
        # Track result
        result = trade.get('result_status', 'pending').lower()
        if result == 'won':
            stats['won'] += 1
            price = trade.get('price', trade.get('avg_price', 50))
            contracts = trade.get('contracts', trade.get('count', 1))
            profit = (100 - price) * contracts / 100
            stats['pnl'] += profit
        elif result == 'lost':
            stats['lost'] += 1
            price = trade.get('price', trade.get('avg_price', 50))
            contracts = trade.get('contracts', trade.get('count', 1))
            loss = price * contracts / 100
            stats['pnl'] -= loss
    
    return grid

def build_heatmap_json(grid):
    """Build JSON structure for heatmap visualization."""
    heatmap = []
    
    # Total stats for normalization
    max_trades = 0
    best_win_rate = 0
    worst_win_rate = 100
    
    for day in range(7):
        for hour in range(24):
            stats = grid[day][hour]
            settled = stats['won'] + stats['lost']
            win_rate = (stats['won'] / settled * 100) if settled > 0 else None
            
            if stats['total'] > max_trades:
                max_trades = stats['total']
            
            if win_rate is not None:
                if win_rate > best_win_rate:
                    best_win_rate = win_rate
                if win_rate < worst_win_rate:
                    worst_win_rate = win_rate
            
            heatmap.append({
                'day': day,
                'day_name': DAYS[day],
                'hour': hour,
                'trades': stats['total'],
                'won': stats['won'],
                'lost': stats['lost'],
                'win_rate': round(win_rate, 1) if win_rate is not None else None,
                'pnl': round(stats['pnl'], 2)
            })
    
    # Find best/worst cells
    best_cells = []
    worst_cells = []
    
    for cell in heatmap:
        if cell['win_rate'] is not None and (cell['won'] + cell['lost']) >= 3:
            if cell['win_rate'] >= 60:
                best_cells.append({
                    'day': cell['day_name'],
                    'hour': cell['hour'],
                    'win_rate': cell['win_rate']
                })
            elif cell['win_rate'] <= 40:
                worst_cells.append({
                    'day': cell['day_name'],
                    'hour': cell['hour'],
                    'win_rate': cell['win_rate']
                })
    
    # Sort best/worst
    best_cells.sort(key=lambda x: x['win_rate'], reverse=True)
    worst_cells.sort(key=lambda x: x['win_rate'])
    
    return {
        'generated_at': datetime.now(tz=__import__('datetime').timezone.utc).isoformat().replace('+00:00', 'Z'),
        'total_trades': sum(c['trades'] for c in heatmap),
        'heatmap': heatmap,
        'summary': {
            'max_trades_in_cell': max_trades,
            'best_win_rate': best_win_rate if best_win_rate > 0 else None,
            'worst_win_rate': worst_win_rate if worst_win_rate < 100 else None,
            'best_cells': best_cells[:5],  # Top 5 best
            'worst_cells': worst_cells[:5]  # Top 5 worst
        },
        'days': DAYS,
        'hours': list(range(24))
    }

def main():
    trades = load_all_trades()
    if not trades:
        print("No trades to analyze.")
        return
    
    print(f"📊 Loaded {len(trades)} trades")
    
    grid = analyze_by_hour_day(trades)
    heatmap_json = build_heatmap_json(grid)
    
    # Ensure output directory exists
    OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)
    
    # Write JSON
    with open(OUTPUT_FILE, 'w') as f:
        json.dump(heatmap_json, f, indent=2)
    
    print(f"✅ Heatmap data written to: {OUTPUT_FILE}")
    print(f"   Total trades: {heatmap_json['total_trades']}")
    
    # Print summary
    if heatmap_json['summary']['best_cells']:
        print("\n🟢 Best trading windows (≥60% win rate):")
        for cell in heatmap_json['summary']['best_cells'][:3]:
            print(f"   {cell['day']} {cell['hour']:02d}:00 UTC - {cell['win_rate']:.1f}%")
    
    if heatmap_json['summary']['worst_cells']:
        print("\n🔴 Worst trading windows (≤40% win rate):")
        for cell in heatmap_json['summary']['worst_cells'][:3]:
            print(f"   {cell['day']} {cell['hour']:02d}:00 UTC - {cell['win_rate']:.1f}%")

if __name__ == "__main__":
    main()
