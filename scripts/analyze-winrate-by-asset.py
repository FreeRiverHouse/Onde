#!/usr/bin/env python3
"""
Kalshi Win Rate Analysis by Asset (BTC vs ETH)
Compares performance between different crypto assets.
"""

import json
from datetime import datetime, timezone
from pathlib import Path
from collections import defaultdict

TRADES_LOG = Path(__file__).parent / "kalshi-trades.jsonl"

def get_asset_from_ticker(ticker: str) -> str:
    """Extract asset type from ticker name."""
    if "KXETHD" in ticker:
        return "ETH"
    elif "KXBTCD" in ticker:
        return "BTC"
    else:
        return "OTHER"

def analyze_by_asset():
    """Analyze win rates separately for each asset."""
    
    if not TRADES_LOG.exists():
        print("❌ Trades log not found")
        return None
    
    # Stats per asset
    stats = defaultdict(lambda: {
        "won": 0,
        "lost": 0,
        "pending": 0,
        "total_cost": 0,
        "total_pnl": 0,
        "yes_count": 0,
        "no_count": 0,
        "yes_won": 0,
        "no_won": 0
    })
    
    with open(TRADES_LOG) as f:
        for line in f:
            try:
                entry = json.loads(line.strip())
                if entry.get('type') != 'trade':
                    continue
                if entry.get('order_status') != 'executed':
                    continue
                
                ticker = entry.get('ticker', '')
                asset = get_asset_from_ticker(ticker)
                side = entry.get('side', 'unknown')
                result = entry.get('result_status', 'pending')
                cost = entry.get('cost_cents', 0)
                contracts = entry.get('contracts', 1)
                price = entry.get('price_cents', 0)
                
                # Track by side
                if side == 'yes':
                    stats[asset]['yes_count'] += 1
                else:
                    stats[asset]['no_count'] += 1
                
                # Track results
                if result == 'won':
                    stats[asset]['won'] += 1
                    # PnL for winning: (100 - price) * contracts
                    pnl = (100 - price) * contracts
                    stats[asset]['total_pnl'] += pnl
                    if side == 'yes':
                        stats[asset]['yes_won'] += 1
                    else:
                        stats[asset]['no_won'] += 1
                elif result == 'lost':
                    stats[asset]['lost'] += 1
                    # PnL for losing: -cost
                    stats[asset]['total_pnl'] -= cost
                else:
                    stats[asset]['pending'] += 1
                
                stats[asset]['total_cost'] += cost
                
            except json.JSONDecodeError:
                continue
    
    # Print results
    print("📊 Win Rate Analysis by Asset")
    print("=" * 60)
    
    for asset in sorted(stats.keys()):
        s = stats[asset]
        total_settled = s['won'] + s['lost']
        win_rate = (s['won'] / total_settled * 100) if total_settled > 0 else 0
        total_trades = total_settled + s['pending']
        
        yes_total = s['yes_count']
        no_total = s['no_count']
        yes_wr = (s['yes_won'] / yes_total * 100) if yes_total > 0 else 0
        no_wr = (s['no_won'] / no_total * 100) if no_total > 0 else 0
        
        print(f"\n{'🟡' if asset == 'BTC' else '🔵' if asset == 'ETH' else '⚪'} {asset}")
        print(f"   Total trades: {total_trades} ({s['pending']} pending)")
        print(f"   Settled: {total_settled} ({s['won']} won, {s['lost']} lost)")
        print(f"   Win Rate: {win_rate:.1f}%")
        print(f"   PnL: ${s['total_pnl']/100:.2f}")
        print(f"   Cost: ${s['total_cost']/100:.2f}")
        print(f"   ---")
        print(f"   YES bets: {yes_total} (WR: {yes_wr:.1f}%)")
        print(f"   NO bets: {no_total} (WR: {no_wr:.1f}%)")
    
    print("\n" + "=" * 60)
    
    # Overall comparison
    if len(stats) > 1:
        print("\n📈 Asset Comparison:")
        for asset in sorted(stats.keys()):
            s = stats[asset]
            total_settled = s['won'] + s['lost']
            if total_settled > 0:
                wr = s['won'] / total_settled * 100
                roi = (s['total_pnl'] / s['total_cost'] * 100) if s['total_cost'] > 0 else 0
                print(f"   {asset}: {wr:.1f}% WR, {roi:.1f}% ROI")
    
    return dict(stats)


if __name__ == "__main__":
    analyze_by_asset()
