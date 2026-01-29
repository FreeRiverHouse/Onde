#!/usr/bin/env python3
"""
T253: Analyze win rate by market type.
Currently all trades are hourly KXBTCD contracts.
This script categorizes by: asset (BTC/ETH), time of day, strike distance.
"""

import json
import os
from collections import defaultdict
from datetime import datetime

TRADES_FILE = os.path.join(os.path.dirname(__file__), 'kalshi-trades.jsonl')
V2_TRADES_FILE = os.path.join(os.path.dirname(__file__), 'kalshi-trades-v2.jsonl')

def parse_ticker(ticker):
    """Extract info from ticker like KXBTCD-26JAN2803-T89249.99"""
    parts = ticker.split('-')
    if len(parts) < 3:
        return None
    
    asset_code = parts[0]
    asset = 'BTC' if 'BTC' in asset_code else 'ETH' if 'ETH' in asset_code else 'UNK'
    
    # Parse date/hour: 26JAN2803 = Jan 28, hour 03 UTC
    date_part = parts[1]
    try:
        hour = int(date_part[-2:])
    except:
        hour = -1
    
    # Parse strike: T89249.99
    strike_str = parts[2]
    try:
        strike = float(strike_str[1:])  # Remove 'T' prefix
    except:
        strike = 0
    
    return {
        'asset': asset,
        'hour_utc': hour,
        'strike': strike
    }

def categorize_hour(hour):
    """Categorize UTC hour into trading session"""
    if 0 <= hour < 8:
        return 'Asia/Late Night (00-08 UTC)'
    elif 8 <= hour < 14:
        return 'Europe (08-14 UTC)'
    elif 14 <= hour < 21:
        return 'US Market (14-21 UTC)'
    else:
        return 'Evening (21-24 UTC)'

def load_trades(filepath):
    """Load trades from JSONL file"""
    trades = []
    if not os.path.exists(filepath):
        return trades
    
    with open(filepath, 'r') as f:
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

def analyze_trades(trades, label=''):
    """Analyze trades by various categories"""
    if not trades:
        print(f"\n{label}: No trades to analyze")
        return
    
    print(f"\n{'='*60}")
    print(f" {label} - {len(trades)} total trades")
    print('='*60)
    
    # By asset
    by_asset = defaultdict(lambda: {'wins': 0, 'losses': 0, 'pending': 0, 'pnl': 0})
    # By session
    by_session = defaultdict(lambda: {'wins': 0, 'losses': 0, 'pending': 0, 'pnl': 0})
    # By side
    by_side = defaultdict(lambda: {'wins': 0, 'losses': 0, 'pending': 0, 'pnl': 0})
    # By hour
    by_hour = defaultdict(lambda: {'wins': 0, 'losses': 0, 'pending': 0, 'pnl': 0})
    
    for trade in trades:
        ticker = trade.get('ticker', '')
        parsed = parse_ticker(ticker)
        if not parsed:
            continue
        
        result = trade.get('result_status', 'pending')
        side = trade.get('side', 'unknown')
        price = trade.get('price_cents', 0)
        contracts = trade.get('contracts', 1)
        
        # Calculate PnL
        if result == 'won':
            pnl = (100 - price) * contracts
        elif result == 'lost':
            pnl = -price * contracts
        else:
            pnl = 0
        
        # Update counters
        for category, key in [
            (by_asset, parsed['asset']),
            (by_session, categorize_hour(parsed['hour_utc'])),
            (by_side, side.upper()),
            (by_hour, f"{parsed['hour_utc']:02d}:00 UTC")
        ]:
            if result == 'won':
                category[key]['wins'] += 1
            elif result == 'lost':
                category[key]['losses'] += 1
            else:
                category[key]['pending'] += 1
            category[key]['pnl'] += pnl
    
    def print_stats(title, data):
        print(f"\n📊 {title}")
        print("-" * 55)
        for key in sorted(data.keys()):
            stats = data[key]
            total = stats['wins'] + stats['losses']
            if total == 0:
                wr = 'N/A'
            else:
                wr = f"{stats['wins']/total*100:.1f}%"
            pnl_str = f"${stats['pnl']/100:+.2f}"
            print(f"  {key:30} | WR: {wr:6} | PnL: {pnl_str:8} | W:{stats['wins']} L:{stats['losses']} P:{stats['pending']}")
    
    print_stats("By Asset", by_asset)
    print_stats("By Trading Session", by_session)
    print_stats("By Side (YES/NO)", by_side)
    print_stats("By Hour (UTC)", by_hour)

def main():
    print("=" * 60)
    print(" KALSHI TRADE ANALYSIS BY MARKET TYPE")
    print(" Task: T253")
    print("=" * 60)
    
    # Load v1 trades
    v1_trades = load_trades(TRADES_FILE)
    if v1_trades:
        analyze_trades(v1_trades, "V1 Trades (Legacy)")
    
    # Load v2 trades  
    v2_trades = load_trades(V2_TRADES_FILE)
    if v2_trades:
        analyze_trades(v2_trades, "V2 Trades (Current)")
    
    if not v1_trades and not v2_trades:
        print("\n⚠️  No trade data found!")
        print(f"   Checked: {TRADES_FILE}")
        print(f"   Checked: {V2_TRADES_FILE}")
    
    print("\n" + "=" * 60)
    print(" Analysis complete!")
    print("=" * 60)

if __name__ == '__main__':
    main()
