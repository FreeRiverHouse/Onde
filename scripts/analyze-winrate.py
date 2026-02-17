#!/usr/bin/env python3
"""
Analyze Kalshi autotrader win rate from settlements and trade logs.
"""

import json
from pathlib import Path
from datetime import datetime
from collections import defaultdict

TRADES_FILE = Path(__file__).parent / "kalshi-trades.jsonl"
SETTLEMENTS_FILE = Path(__file__).parent / "kalshi-settlements.json"

def load_trades():
    """Load all executed trades from jsonl."""
    trades = []
    with open(TRADES_FILE) as f:
        for line in f:
            try:
                entry = json.loads(line.strip())
                if entry.get('type') == 'trade' and entry.get('order_status') == 'executed':
                    trades.append(entry)
            except json.JSONDecodeError:
                continue
    return trades

def load_settlements():
    """Load settlement data."""
    if SETTLEMENTS_FILE.exists():
        with open(SETTLEMENTS_FILE) as f:
            return json.load(f)
    return {}

def analyze():
    trades = load_trades()
    settlements = load_settlements()
    
    print("=" * 60)
    print("KALSHI AUTOTRADER ANALYSIS")
    print("=" * 60)
    
    # Trade summary
    print(f"\n📊 TRADE SUMMARY")
    print(f"   Total executed trades: {len(trades)}")
    
    total_cost = sum(t.get('cost_cents', 0) for t in trades)
    print(f"   Total cost: ${total_cost / 100:.2f}")
    
    # Group by hour
    by_hour = defaultdict(list)
    for t in trades:
        ts = datetime.fromisoformat(t['timestamp'].replace('Z', '+00:00'))
        hour = ts.strftime('%Y-%m-%d %H:00 UTC')
        by_hour[hour].append(t)
    
    print(f"\n📅 TRADES BY HOUR")
    for hour in sorted(by_hour.keys()):
        hour_trades = by_hour[hour]
        cost = sum(t.get('cost_cents', 0) for t in hour_trades)
        print(f"   {hour}: {len(hour_trades)} trades, ${cost/100:.2f}")
    
    # Settlement results
    print(f"\n✅ SETTLEMENT RESULTS")
    summary = settlements.get('summary', {})
    wins = summary.get('wins', 0)
    losses = summary.get('losses', 0)
    total_settled = wins + losses
    
    print(f"   Settled trades: {total_settled}")
    print(f"   Wins: {wins}")
    print(f"   Losses: {losses}")
    
    if total_settled > 0:
        win_rate = wins / total_settled * 100
        print(f"   Win Rate: {win_rate:.1f}%")
    
    pnl = summary.get('total_pnl_cents', 0)
    print(f"   Realized PnL: ${pnl / 100:.2f}")
    
    # Pending
    settled_tickers = {k for k, v in settlements.get('trades', {}).items() 
                       if v.get('status') == 'settled'}
    failed_tickers = {k for k, v in settlements.get('trades', {}).items() 
                      if v.get('status') == 'price_fetch_failed'}
    
    print(f"\n⏳ PENDING SETTLEMENTS")
    print(f"   Successfully settled: {len(settled_tickers)}")
    print(f"   Failed to fetch price: {len(failed_tickers)}")
    
    all_tickers = {t['ticker'] for t in trades}
    not_processed = all_tickers - settled_tickers - failed_tickers
    print(f"   Not yet processed: {len(not_processed)}")
    
    # Edge analysis
    print(f"\n📈 EDGE ANALYSIS")
    edges = [t.get('edge', 0) for t in trades]
    avg_edge = sum(edges) / len(edges) if edges else 0
    print(f"   Average expected edge: {avg_edge * 100:.1f}%")
    print(f"   Min edge: {min(edges) * 100:.1f}%")
    print(f"   Max edge: {max(edges) * 100:.1f}%")
    
    # Side distribution
    sides = [t.get('side', 'unknown') for t in trades]
    yes_count = sides.count('yes')
    no_count = sides.count('no')
    print(f"\n🎯 POSITION DISTRIBUTION")
    print(f"   YES bets: {yes_count}")
    print(f"   NO bets: {no_count}")
    
    # Price analysis for settled trades
    print(f"\n💰 SETTLED TRADE DETAILS")
    for ticker, data in settlements.get('trades', {}).items():
        if data.get('status') == 'settled':
            trade = data.get('trade', {})
            print(f"   {ticker[:30]}...")
            print(f"      Side: {data.get('trade', {}).get('side')} @ {trade.get('price_cents')}¢")
            print(f"      Strike: ${data.get('trade', {}).get('strike', 0):,.0f}")
            print(f"      Settlement: ${data.get('settlement_price', 0):,.0f}")
            print(f"      Result: {'✅ WIN' if data.get('won') else '❌ LOSS'}")
            print(f"      PnL: ${data.get('pnl_cents', 0) / 100:.2f}")
    
    # Recommendations
    print(f"\n💡 ANALYSIS")
    if total_settled > 0 and win_rate < 50:
        print("   ⚠️  Win rate below 50% - model may be miscalibrated")
        print("   ⚠️  Consider:")
        print("      - Increasing min_edge threshold")
        print("      - Reducing position sizes")
        print("      - Reviewing volatility model")
    
    if no_count > yes_count * 2:
        print("   📉 Heavy NO bias - may miss upward moves")
    elif yes_count > no_count * 2:
        print("   📈 Heavy YES bias - may miss downward moves")
    
    print("\n" + "=" * 60)

if __name__ == '__main__':
    analyze()
