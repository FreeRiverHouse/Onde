#!/usr/bin/env python3
"""
Analyze trade log duplicates per ticker/hour
Task: [T083]
"""

import json
from collections import defaultdict
from datetime import datetime
import sys

def analyze_duplicates(jsonl_file):
    """Analyze trades grouped by ticker and hour"""
    
    # Group trades by ticker+hour
    trades_by_ticker_hour = defaultdict(list)
    total_trades = 0
    
    with open(jsonl_file, 'r') as f:
        for line in f:
            try:
                entry = json.loads(line.strip())
                if entry.get('type') == 'trade':
                    total_trades += 1
                    ts = entry['timestamp']
                    # Extract hour: KXBTCD-26JAN2804 -> 04
                    ticker = entry['ticker']
                    hour = ticker.split('-')[1][-2:]  # Last 2 chars = hour
                    strike = ticker.split('-')[2]  # T88499.99
                    
                    key = f"{hour}:{strike}"
                    trades_by_ticker_hour[key].append({
                        'time': ts,
                        'contracts': entry.get('contracts', 0),
                        'cost': entry.get('cost_cents', 0),
                        'result': entry.get('result_status', 'unknown')
                    })
            except:
                continue
    
    # Analyze duplicates
    print(f"📊 TRADE DUPLICATES ANALYSIS")
    print(f"=" * 50)
    print(f"Total trades: {total_trades}")
    print(f"Unique ticker+hour combos: {len(trades_by_ticker_hour)}")
    print()
    
    # Find duplicates
    duplicates = {k: v for k, v in trades_by_ticker_hour.items() if len(v) > 1}
    
    print(f"🔄 DUPLICATES (same ticker in same hour): {len(duplicates)}")
    print()
    
    if duplicates:
        print("Top duplicates:")
        sorted_dups = sorted(duplicates.items(), key=lambda x: len(x[1]), reverse=True)
        for key, trades in sorted_dups[:10]:
            hour, strike = key.split(':')
            total_contracts = sum(t['contracts'] for t in trades)
            total_cost = sum(t['cost'] for t in trades)
            results = [t['result'] for t in trades]
            print(f"  {strike}@{hour}h: {len(trades)} trades, {total_contracts} contracts, ${total_cost/100:.2f}")
            print(f"    Results: {results}")
        
        print()
        print("📋 RECOMMENDATIONS:")
        print("1. CONSOLIDATE: Merge trades per ticker/hour into single entry")
        print("   - Sum contracts and cost")
        print("   - Use final result status")
        print("2. KEEP SEPARATE: Current behavior, shows trading frequency")
        print("3. ADD SUMMARY: Keep both, add hourly_summary type")
    
    # Stats
    print()
    print("📈 STATS BY HOUR:")
    hours = defaultdict(lambda: {'trades': 0, 'contracts': 0, 'cost': 0})
    for key, trades in trades_by_ticker_hour.items():
        hour = key.split(':')[0]
        hours[hour]['trades'] += len(trades)
        hours[hour]['contracts'] += sum(t['contracts'] for t in trades)
        hours[hour]['cost'] += sum(t['cost'] for t in trades)
    
    for hour in sorted(hours.keys()):
        h = hours[hour]
        print(f"  {hour}:00 - {h['trades']} trades, {h['contracts']} contracts, ${h['cost']/100:.2f}")
    
    return duplicates

if __name__ == "__main__":
    file = sys.argv[1] if len(sys.argv) > 1 else "data/trading/kalshi-trades-latest.jsonl"
    analyze_duplicates(file)
