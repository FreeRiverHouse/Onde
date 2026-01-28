#!/usr/bin/env python3
"""
Kalshi Trades PnL Analyzer
Analyzes kalshi-trades.jsonl to calculate win rate and PnL.
"""

import json
import sys
from datetime import datetime, timedelta
from collections import defaultdict
from pathlib import Path

TRADES_FILE = Path(__file__).parent / "kalshi-trades.jsonl"

def parse_timestamp(ts):
    """Parse ISO timestamp."""
    return datetime.fromisoformat(ts.replace('Z', '+00:00'))

def analyze_trades():
    """Analyze all trades and calculate PnL."""
    trades = []
    
    with open(TRADES_FILE) as f:
        for line in f:
            try:
                entry = json.loads(line.strip())
                if entry.get('type') == 'trade' and entry.get('order_status') == 'executed':
                    trades.append(entry)
            except json.JSONDecodeError:
                continue
    
    if not trades:
        print("No executed trades found.")
        return
    
    # Summary stats
    total_trades = len(trades)
    total_cost_cents = sum(t['cost_cents'] for t in trades)
    total_contracts = sum(t['contracts'] for t in trades)
    
    # Group by date
    by_date = defaultdict(list)
    for t in trades:
        date = parse_timestamp(t['timestamp']).strftime('%Y-%m-%d')
        by_date[date].append(t)
    
    # Calculate potential outcomes
    # For NO bets: win if final price < strike (payout = 100¢ - price)
    # For YES bets: win if final price >= strike (payout = 100¢ - price)
    
    wins = 0
    losses = 0
    pending = 0
    gross_pnl_cents = 0
    
    for t in trades:
        result = t.get('result_status', 'pending')
        if result == 'pending':
            pending += 1
            # Try to determine outcome based on expiry
            # Ticker format: KXBTCD-26JAN2804-T88499.99
            # 26JAN2804 = Jan 28, 2026, 04:00 UTC
            ticker = t['ticker']
            strike = t['strike']
            side = t['side']
            cost = t['cost_cents']
            contracts = t['contracts']
            
            # If we can determine final price, calculate PnL
            # For now, mark as pending
        elif result == 'win':
            wins += 1
            # Payout is (100 - price) * contracts for winning NO bets
            payout = (100 - t['price_cents']) * t['contracts']
            gross_pnl_cents += payout - t['cost_cents']
        elif result == 'loss':
            losses += 1
            gross_pnl_cents -= t['cost_cents']
    
    # Print report
    print("=" * 60)
    print("🎯 KALSHI AUTOTRADER PnL REPORT")
    print("=" * 60)
    print()
    print(f"📊 SUMMARY")
    print(f"   Total Trades: {total_trades}")
    print(f"   Total Contracts: {total_contracts}")
    print(f"   Total Cost: ${total_cost_cents/100:.2f}")
    print(f"   Avg Cost/Trade: ${total_cost_cents/total_trades/100:.2f}")
    print()
    
    print(f"📈 OUTCOMES")
    print(f"   Wins: {wins}")
    print(f"   Losses: {losses}")
    print(f"   Pending: {pending}")
    if wins + losses > 0:
        win_rate = wins / (wins + losses) * 100
        print(f"   Win Rate: {win_rate:.1f}%")
    print()
    
    if wins + losses > 0:
        print(f"💰 P&L (settled only)")
        print(f"   Gross P&L: ${gross_pnl_cents/100:.2f}")
    print()
    
    print(f"📅 BY DATE")
    for date in sorted(by_date.keys()):
        day_trades = by_date[date]
        day_cost = sum(t['cost_cents'] for t in day_trades)
        day_contracts = sum(t['contracts'] for t in day_trades)
        print(f"   {date}: {len(day_trades)} trades, {day_contracts} contracts, ${day_cost/100:.2f}")
    print()
    
    # Edge analysis
    edges = [t['edge'] for t in trades]
    avg_edge = sum(edges) / len(edges)
    
    print(f"📐 EDGE ANALYSIS")
    print(f"   Avg Edge: {avg_edge*100:.1f}%")
    print(f"   Min Edge: {min(edges)*100:.1f}%")
    print(f"   Max Edge: {max(edges)*100:.1f}%")
    print()
    
    # Latest trades
    print(f"🕐 LATEST 5 TRADES")
    for t in sorted(trades, key=lambda x: x['timestamp'], reverse=True)[:5]:
        ts = parse_timestamp(t['timestamp']).strftime('%H:%M')
        print(f"   {ts} | {t['side'].upper()} {t['contracts']}x @{t['price_cents']}¢ | strike ${t['strike']:.0f} | edge {t['edge']*100:.1f}%")
    print()
    print("=" * 60)

if __name__ == "__main__":
    analyze_trades()
