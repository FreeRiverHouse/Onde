#!/usr/bin/env python3
"""
Strategy Parameter Sweep - MIN_EDGE Optimization

Analyzes historical trades with different MIN_EDGE thresholds
to find the optimal edge cutoff for maximizing win rate and PnL.

Usage:
  python3 scripts/edge-parameter-sweep.py [--output FILE]

Task: T356
"""

import json
import os
from datetime import datetime, timezone
from pathlib import Path
from collections import defaultdict

# Config
SCRIPT_DIR = Path(__file__).parent
PROJECT_DIR = SCRIPT_DIR.parent
TRADE_LOG_V2 = SCRIPT_DIR / "kalshi-trades-v2.jsonl"
TRADE_LOG_V1 = SCRIPT_DIR / "kalshi-trades.jsonl"
OUTPUT_DIR = PROJECT_DIR / "data" / "backtests"
DEFAULT_OUTPUT = OUTPUT_DIR / "edge-sweep.json"

# Edge thresholds to test
EDGE_THRESHOLDS = [0.05, 0.08, 0.10, 0.12, 0.15, 0.20, 0.25, 0.30]


def load_trades(log_path: Path) -> list:
    """Load trades from JSONL file"""
    trades = []
    if not log_path.exists():
        return trades
    
    with open(log_path, 'r') as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            try:
                trade = json.loads(line)
                # Only include actual trades with results
                if trade.get("type") == "trade" and trade.get("result_status") in ("won", "lost"):
                    trades.append(trade)
            except json.JSONDecodeError:
                continue
    
    return trades


def calculate_stats(trades: list, min_edge: float) -> dict:
    """Calculate stats for trades filtered by min_edge threshold"""
    filtered = [t for t in trades if t.get("edge", 0) >= min_edge]
    
    if not filtered:
        return {
            "min_edge": min_edge,
            "total_trades": 0,
            "wins": 0,
            "losses": 0,
            "win_rate": 0.0,
            "pnl_cents": 0,
            "avg_edge": 0.0,
            "avg_cost": 0.0,
            "roi": 0.0
        }
    
    wins = sum(1 for t in filtered if t.get("result_status") == "won")
    losses = sum(1 for t in filtered if t.get("result_status") == "lost")
    total = wins + losses
    
    # Calculate PnL
    pnl_cents = 0
    total_cost = 0
    edges = []
    
    for t in filtered:
        cost = t.get("cost_cents", 0)
        contracts = t.get("contracts", 1)
        price = t.get("price_cents", 50)
        total_cost += cost
        edges.append(t.get("edge", 0))
        
        if t.get("result_status") == "won":
            # Win: get (100 - price) per contract (for YES), or price for NO
            side = t.get("side", "yes")
            if side == "yes":
                pnl_cents += contracts * (100 - price)  # Profit
            else:
                pnl_cents += contracts * price  # NO wins → get price back
        else:
            # Loss: lose cost
            pnl_cents -= cost
    
    win_rate = (wins / total * 100) if total > 0 else 0
    avg_edge = (sum(edges) / len(edges) * 100) if edges else 0
    avg_cost = (total_cost / total) if total > 0 else 0
    roi = (pnl_cents / total_cost * 100) if total_cost > 0 else 0
    
    return {
        "min_edge": min_edge,
        "min_edge_pct": f"{min_edge * 100:.0f}%",
        "total_trades": total,
        "wins": wins,
        "losses": losses,
        "win_rate": round(win_rate, 2),
        "pnl_cents": pnl_cents,
        "pnl_dollars": round(pnl_cents / 100, 2),
        "avg_edge_pct": round(avg_edge, 2),
        "avg_cost_cents": round(avg_cost, 2),
        "roi_pct": round(roi, 2)
    }


def analyze_by_asset_class(trades: list, min_edge: float) -> dict:
    """Break down stats by asset class (crypto vs weather)"""
    crypto_trades = [t for t in trades if t.get("asset") in ("BTC", "ETH", "crypto")]
    weather_trades = [t for t in trades if t.get("asset") == "weather"]
    
    return {
        "crypto": calculate_stats(crypto_trades, min_edge),
        "weather": calculate_stats(weather_trades, min_edge)
    }


def find_optimal_threshold(results: list) -> dict:
    """Find the optimal MIN_EDGE threshold based on different criteria"""
    # Filter out zero-trade results
    valid = [r for r in results if r["total_trades"] > 0]
    
    if not valid:
        return {"message": "No trades to analyze"}
    
    # Best by win rate (with at least 5 trades)
    by_winrate = [r for r in valid if r["total_trades"] >= 5]
    best_winrate = max(by_winrate, key=lambda x: x["win_rate"]) if by_winrate else None
    
    # Best by total PnL
    best_pnl = max(valid, key=lambda x: x["pnl_cents"])
    
    # Best by ROI (with at least 5 trades)
    by_roi = [r for r in valid if r["total_trades"] >= 5]
    best_roi = max(by_roi, key=lambda x: x["roi_pct"]) if by_roi else None
    
    # Best trade count (most opportunities)
    most_trades = max(valid, key=lambda x: x["total_trades"])
    
    # Balanced score: (win_rate * 0.4) + (roi * 0.3) + (log(trades) * 0.3)
    import math
    for r in valid:
        trade_score = math.log(r["total_trades"] + 1) * 10  # Scale log to ~20-30 range
        r["balanced_score"] = (
            r["win_rate"] * 0.4 +
            r["roi_pct"] * 0.3 +
            trade_score * 0.3
        )
    
    by_balanced = [r for r in valid if r["total_trades"] >= 5]
    best_balanced = max(by_balanced, key=lambda x: x["balanced_score"]) if by_balanced else None
    
    return {
        "by_win_rate": best_winrate,
        "by_pnl": best_pnl,
        "by_roi": best_roi,
        "by_trade_volume": most_trades,
        "balanced_recommendation": best_balanced
    }


def main():
    import argparse
    parser = argparse.ArgumentParser(description="MIN_EDGE parameter sweep analysis")
    parser.add_argument("--output", "-o", type=Path, default=DEFAULT_OUTPUT,
                       help="Output file path")
    parser.add_argument("--v1", action="store_true", help="Use v1 trade log instead of v2")
    args = parser.parse_args()
    
    # Load trades
    log_path = TRADE_LOG_V1 if args.v1 else TRADE_LOG_V2
    print(f"📊 Loading trades from {log_path.name}...")
    trades = load_trades(log_path)
    
    if not trades:
        print("❌ No settled trades found")
        return
    
    print(f"✅ Loaded {len(trades)} settled trades")
    
    # Run sweep
    print(f"\n🔄 Running parameter sweep with thresholds: {[f'{t*100:.0f}%' for t in EDGE_THRESHOLDS]}")
    
    results = []
    for threshold in EDGE_THRESHOLDS:
        stats = calculate_stats(trades, threshold)
        results.append(stats)
        
        # Print inline
        emoji = "✅" if stats["win_rate"] >= 50 else "⚠️" if stats["win_rate"] >= 40 else "❌"
        print(f"  {stats['min_edge_pct']:>4} → {stats['total_trades']:>3} trades, "
              f"{stats['win_rate']:>5.1f}% WR, ${stats['pnl_dollars']:>7.2f} PnL, "
              f"{stats['roi_pct']:>6.1f}% ROI {emoji}")
    
    # Find optimal
    optimal = find_optimal_threshold(results)
    
    print("\n📈 Optimal Thresholds:")
    if optimal.get("by_win_rate"):
        print(f"  Best Win Rate: {optimal['by_win_rate']['min_edge_pct']} "
              f"({optimal['by_win_rate']['win_rate']}% WR)")
    if optimal.get("by_pnl"):
        print(f"  Best PnL: {optimal['by_pnl']['min_edge_pct']} "
              f"(${optimal['by_pnl']['pnl_dollars']:.2f})")
    if optimal.get("by_roi"):
        print(f"  Best ROI: {optimal['by_roi']['min_edge_pct']} "
              f"({optimal['by_roi']['roi_pct']}%)")
    if optimal.get("balanced_recommendation"):
        rec = optimal["balanced_recommendation"]
        print(f"\n  🎯 RECOMMENDED: {rec['min_edge_pct']} "
              f"(balanced: {rec['win_rate']}% WR, {rec['roi_pct']}% ROI, {rec['total_trades']} trades)")
    
    # Asset class breakdown for recommended threshold
    if optimal.get("balanced_recommendation"):
        rec_edge = optimal["balanced_recommendation"]["min_edge"]
        breakdown = analyze_by_asset_class(trades, rec_edge)
        
        print("\n📊 Asset Class Breakdown (at recommended threshold):")
        for asset, stats in breakdown.items():
            if stats["total_trades"] > 0:
                print(f"  {asset.upper():>8}: {stats['total_trades']} trades, "
                      f"{stats['win_rate']}% WR, ${stats['pnl_dollars']:.2f} PnL")
    
    # Save results
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    
    output = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "source_file": str(log_path.name),
        "total_trades_analyzed": len(trades),
        "thresholds_tested": EDGE_THRESHOLDS,
        "results": results,
        "optimal": optimal,
        "asset_breakdown": analyze_by_asset_class(trades, optimal.get("balanced_recommendation", {}).get("min_edge", 0.10))
    }
    
    with open(args.output, 'w') as f:
        json.dump(output, f, indent=2)
    
    print(f"\n💾 Results saved to {args.output}")


if __name__ == "__main__":
    main()
