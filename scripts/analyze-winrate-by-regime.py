#!/usr/bin/env python3
"""
Analyze win rate by market regime.

Validates if dynamic MIN_EDGE based on regime detection (T243) improves performance.
Groups trades by regime and compares win rates, PnL, and ROI.

Usage: python scripts/analyze-winrate-by-regime.py [--file PATH]
"""

import json
import argparse
from pathlib import Path
from collections import defaultdict
from datetime import datetime

# Default trade log (v2 has regime data)
DEFAULT_TRADE_LOG = Path(__file__).parent / "kalshi-trades-v2.jsonl"
FALLBACK_TRADE_LOG = Path(__file__).parent / "kalshi-trades.jsonl"


def load_trades(file_path: Path) -> list:
    """Load trades from JSONL file."""
    trades = []
    if not file_path.exists():
        return trades
    
    with open(file_path, "r") as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            try:
                entry = json.loads(line)
                if entry.get("type") == "trade":
                    trades.append(entry)
            except json.JSONDecodeError:
                continue
    return trades


def analyze_by_regime(trades: list) -> dict:
    """Group trades by regime and calculate stats."""
    
    regimes = defaultdict(lambda: {
        "total": 0,
        "won": 0,
        "lost": 0,
        "pending": 0,
        "pnl_cents": 0,
        "cost_cents": 0,
        "trades": [],
        "edges": [],
        "min_edges_used": [],
    })
    
    for trade in trades:
        regime = trade.get("regime", "unknown")
        result = trade.get("result_status", "pending")
        cost = trade.get("cost_cents", 0)
        contracts = trade.get("contracts", 0)
        
        regimes[regime]["total"] += 1
        regimes[regime]["cost_cents"] += cost
        regimes[regime]["trades"].append(trade)
        
        if "edge" in trade:
            regimes[regime]["edges"].append(trade["edge"])
        if "dynamic_min_edge" in trade:
            regimes[regime]["min_edges_used"].append(trade["dynamic_min_edge"])
        
        if result == "won":
            regimes[regime]["won"] += 1
            # Profit = (100 - price) * contracts for winning bets
            price = trade.get("price_cents", 0)
            profit = (100 - price) * contracts
            regimes[regime]["pnl_cents"] += profit
        elif result == "lost":
            regimes[regime]["lost"] += 1
            # Loss = cost (what we paid)
            regimes[regime]["pnl_cents"] -= cost
        else:
            regimes[regime]["pending"] += 1
    
    # Calculate derived stats
    for regime, stats in regimes.items():
        settled = stats["won"] + stats["lost"]
        stats["win_rate"] = stats["won"] / settled if settled > 0 else None
        stats["roi"] = stats["pnl_cents"] / stats["cost_cents"] if stats["cost_cents"] > 0 else None
        stats["avg_edge"] = sum(stats["edges"]) / len(stats["edges"]) if stats["edges"] else None
        stats["avg_min_edge"] = sum(stats["min_edges_used"]) / len(stats["min_edges_used"]) if stats["min_edges_used"] else None
    
    return dict(regimes)


def print_report(stats: dict, file_path: Path):
    """Print analysis report."""
    print("=" * 70)
    print(f"WIN RATE BY MARKET REGIME ANALYSIS")
    print(f"Source: {file_path}")
    print("=" * 70)
    
    total_trades = sum(s["total"] for s in stats.values())
    
    if total_trades == 0:
        print("\n⚠️  No trades found with regime data.")
        print("   v2 autotrader hasn't made any trades yet.")
        print("   This script will be useful once v2 starts trading.")
        return
    
    # Sort by trade count descending
    sorted_regimes = sorted(stats.items(), key=lambda x: x[1]["total"], reverse=True)
    
    print(f"\nTotal trades: {total_trades}")
    print("\n" + "-" * 70)
    
    for regime, s in sorted_regimes:
        settled = s["won"] + s["lost"]
        pending = s["pending"]
        
        print(f"\n📊 {regime.upper()}")
        print(f"   Trades: {s['total']} ({s['total']/total_trades*100:.1f}% of total)")
        
        if settled > 0:
            print(f"   Win Rate: {s['win_rate']*100:.1f}% ({s['won']}/{settled} settled)")
            print(f"   PnL: ${s['pnl_cents']/100:.2f}")
            print(f"   ROI: {s['roi']*100:.1f}%" if s['roi'] is not None else "   ROI: N/A")
        else:
            print(f"   Win Rate: N/A (no settled trades)")
        
        if pending > 0:
            print(f"   Pending: {pending}")
        
        if s['avg_edge'] is not None:
            print(f"   Avg Edge: {s['avg_edge']*100:.1f}%")
        if s['avg_min_edge'] is not None:
            print(f"   Avg MIN_EDGE used: {s['avg_min_edge']*100:.1f}%")
    
    # Summary comparison
    print("\n" + "=" * 70)
    print("REGIME COMPARISON SUMMARY")
    print("=" * 70)
    
    # Find best/worst performing regime
    settled_regimes = [(r, s) for r, s in sorted_regimes if s["won"] + s["lost"] > 0]
    
    if len(settled_regimes) >= 2:
        by_winrate = sorted(settled_regimes, key=lambda x: x[1]["win_rate"] or 0, reverse=True)
        best = by_winrate[0]
        worst = by_winrate[-1]
        
        print(f"\n🏆 Best Regime: {best[0]} ({best[1]['win_rate']*100:.1f}% win rate)")
        print(f"💀 Worst Regime: {worst[0]} ({worst[1]['win_rate']*100:.1f}% win rate)")
        
        diff = (best[1]['win_rate'] or 0) - (worst[1]['win_rate'] or 0)
        print(f"\n📈 Win rate spread: {diff*100:.1f}pp")
        
        if diff > 0.1:
            print("   ✅ Regime detection appears to differentiate market conditions!")
        elif diff > 0.05:
            print("   ⚠️ Modest differentiation - need more data to confirm")
        else:
            print("   ❓ Similar win rates across regimes - detection may need tuning")
    else:
        print("\n⚠️ Need trades in multiple regimes to compare performance.")
    
    # Check if dynamic MIN_EDGE is helping
    print("\n" + "-" * 70)
    print("DYNAMIC MIN_EDGE ANALYSIS")
    
    for regime, s in sorted_regimes:
        if s['avg_min_edge'] is not None and s['avg_edge'] is not None:
            edge_above_min = s['avg_edge'] - s['avg_min_edge']
            print(f"   {regime}: MIN_EDGE={s['avg_min_edge']*100:.0f}%, "
                  f"Avg actual edge={s['avg_edge']*100:.1f}% "
                  f"(+{edge_above_min*100:.1f}pp headroom)")


def main():
    parser = argparse.ArgumentParser(description="Analyze win rate by market regime")
    parser.add_argument("--file", "-f", type=Path, help="Trade log file path")
    args = parser.parse_args()
    
    # Determine file to use
    if args.file:
        file_path = args.file
    elif DEFAULT_TRADE_LOG.exists() and DEFAULT_TRADE_LOG.stat().st_size > 0:
        file_path = DEFAULT_TRADE_LOG
    else:
        file_path = FALLBACK_TRADE_LOG
        print(f"ℹ️  Using fallback: {file_path}")
        print("   (v2 trade log not found or empty)")
    
    trades = load_trades(file_path)
    
    # Filter to only trades with regime data
    trades_with_regime = [t for t in trades if t.get("regime") and t.get("regime") != "unknown"]
    
    if not trades_with_regime and trades:
        print(f"\n⚠️  Found {len(trades)} trades but none have regime data.")
        print("   These are likely from v1 autotrader (before regime detection).")
        print("   Wait for v2 to make trades with regime info.")
        return
    
    stats = analyze_by_regime(trades_with_regime)
    print_report(stats, file_path)


if __name__ == "__main__":
    main()
