#!/usr/bin/env python3
"""
Analyze Win Rate by Momentum Direction (T418)

Compares performance of trades made during:
- Bullish momentum (composite direction > 0.1)
- Bearish momentum (composite direction < -0.1)
- Neutral momentum (-0.1 to 0.1)

May reveal if model performs better in one direction.

Usage: python3 scripts/analyze-momentum-direction.py [--v2]
"""

import json
import argparse
from pathlib import Path
from datetime import datetime
from collections import defaultdict

def load_trades(v2=False):
    """Load trade log"""
    log_file = Path("scripts") / ("kalshi-trades-v2.jsonl" if v2 else "kalshi-trades.jsonl")
    trades = []
    
    if not log_file.exists():
        return trades
    
    with open(log_file) as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            try:
                trade = json.loads(line)
                # Only include settled trades
                if trade.get("result_status") in ("won", "lost"):
                    trades.append(trade)
            except json.JSONDecodeError:
                continue
    
    return trades

def calculate_pnl(trade):
    """Calculate PnL for a trade"""
    price = trade.get("price_cents", 0)
    contracts = trade.get("contracts", 0)
    result = trade.get("result_status", "pending")
    
    if result == "won":
        return (100 - price) * contracts
    elif result == "lost":
        return -price * contracts
    return 0

def categorize_direction(trade):
    """Categorize trade by momentum direction at entry"""
    mom_dir = trade.get("momentum_dir", 0)
    
    if mom_dir > 0.1:
        return "bullish"
    elif mom_dir < -0.1:
        return "bearish"
    else:
        return "neutral"

def analyze_by_direction(trades):
    """Analyze performance by momentum direction"""
    categories = defaultdict(lambda: {
        "trades": 0,
        "wins": 0,
        "losses": 0,
        "pnl_cents": 0,
        "total_cost": 0,
        "sides": defaultdict(int),
        "regimes": defaultdict(int),
        "edges": []
    })
    
    for trade in trades:
        direction = categorize_direction(trade)
        
        categories[direction]["trades"] += 1
        categories[direction]["total_cost"] += trade.get("cost_cents", 0)
        categories[direction]["pnl_cents"] += calculate_pnl(trade)
        
        if trade.get("result_status") == "won":
            categories[direction]["wins"] += 1
        elif trade.get("result_status") == "lost":
            categories[direction]["losses"] += 1
        
        # Track trade side
        side = trade.get("side", "unknown")
        categories[direction]["sides"][side] += 1
        
        # Track regime
        regime = trade.get("regime", "unknown")
        categories[direction]["regimes"][regime] += 1
        
        # Track edge
        edge = trade.get("edge", 0)
        categories[direction]["edges"].append(edge)
    
    return dict(categories)

def print_report(analysis):
    """Print analysis report"""
    print("\n" + "="*70)
    print("WIN RATE BY MOMENTUM DIRECTION (T418)")
    print("="*70)
    
    total_trades = sum(cat["trades"] for cat in analysis.values())
    
    if total_trades == 0:
        print("\n⚠️  No settled trades found!")
        print("   Wait for settlement tracker to update results.")
        return
    
    print(f"\nTotal settled trades: {total_trades}")
    
    # Order: bullish → neutral → bearish
    order = ["bullish", "neutral", "bearish"]
    
    print("\n" + "-"*70)
    print(f"{'Direction':<12} {'Trades':>8} {'Win Rate':>10} {'PnL':>12} {'ROI':>10} {'Avg Edge':>10}")
    print("-"*70)
    
    for direction in order:
        if direction not in analysis:
            continue
        data = analysis[direction]
        n_trades = data["trades"]
        
        if n_trades == 0:
            continue
        
        wins = data["wins"]
        pnl = data["pnl_cents"]
        total_cost = data["total_cost"]
        edges = data["edges"]
        
        win_rate = wins / n_trades if n_trades > 0 else 0
        roi = pnl / total_cost if total_cost > 0 else 0
        avg_edge = sum(edges) / len(edges) if edges else 0
        
        pnl_str = f"+${pnl/100:.2f}" if pnl >= 0 else f"-${abs(pnl)/100:.2f}"
        roi_sign = "+" if roi >= 0 else ""
        
        emoji = "🟢" if direction == "bullish" else "🔴" if direction == "bearish" else "⚪"
        
        print(f"{emoji} {direction:<10} {n_trades:>8} {win_rate:>9.1%} {pnl_str:>12} {roi_sign}{roi:>9.1%} {avg_edge:>9.1%}")
    
    print("-"*70)
    
    # Insights
    print("\n📊 INSIGHTS:")
    
    bullish = analysis.get("bullish", {"trades": 0, "wins": 0, "pnl_cents": 0})
    bearish = analysis.get("bearish", {"trades": 0, "wins": 0, "pnl_cents": 0})
    neutral = analysis.get("neutral", {"trades": 0, "wins": 0, "pnl_cents": 0})
    
    # Compare bullish vs bearish
    if bullish["trades"] > 0 and bearish["trades"] > 0:
        bull_wr = bullish["wins"] / bullish["trades"]
        bear_wr = bearish["wins"] / bearish["trades"]
        
        if bull_wr > bear_wr + 0.15:
            print(f"✅ BULLISH momentum trades perform MUCH better ({bull_wr:.1%} vs {bear_wr:.1%})")
            print("   Consider focusing on bullish setups!")
        elif bear_wr > bull_wr + 0.15:
            print(f"✅ BEARISH momentum trades perform MUCH better ({bear_wr:.1%} vs {bull_wr:.1%})")
            print("   Model may have edge in downtrends!")
        elif abs(bull_wr - bear_wr) < 0.05:
            print(f"🔄 Similar win rates: bullish={bull_wr:.1%}, bearish={bear_wr:.1%}")
            print("   Model appears direction-neutral.")
        else:
            better = "bullish" if bull_wr > bear_wr else "bearish"
            print(f"🟢 {better.upper()} slightly better ({max(bull_wr, bear_wr):.1%} vs {min(bull_wr, bear_wr):.1%})")
    
    # Trade side breakdown
    print("\n📈 TRADE SIDE BREAKDOWN:")
    for direction in order:
        if direction not in analysis or analysis[direction]["trades"] == 0:
            continue
        data = analysis[direction]
        sides = data["sides"]
        total = sum(sides.values())
        if total == 0:
            continue
        
        parts = [f"{s.upper()}: {c} ({c/total:.0%})" for s, c in sorted(sides.items()) if c > 0]
        print(f"  {direction}: {', '.join(parts)}")
    
    # PnL by side during each direction
    print("\n💡 RECOMMENDATION:")
    if bullish["trades"] > 0 or bearish["trades"] > 0:
        bull_wr = bullish["wins"] / bullish["trades"] if bullish["trades"] > 0 else 0
        bear_wr = bearish["wins"] / bearish["trades"] if bearish["trades"] > 0 else 0
        
        if bull_wr > 0.5 and bear_wr < 0.5:
            print("   • Consider higher position sizes during bullish momentum")
            print("   • Be more conservative during bearish momentum")
        elif bear_wr > 0.5 and bull_wr < 0.5:
            print("   • Consider higher position sizes during bearish momentum")
            print("   • Be more conservative during bullish momentum")
        else:
            print("   • Both directions show similar performance")
            print("   • Continue trading directionally agnostic")
    
    # Save to JSON
    output = {
        "timestamp": datetime.now().isoformat(),
        "total_trades": total_trades,
        "directions": {}
    }
    
    for direction, data in analysis.items():
        n = data["trades"]
        if n == 0:
            continue
        output["directions"][direction] = {
            "trades": n,
            "wins": data["wins"],
            "losses": data["losses"],
            "win_rate": data["wins"] / n if n > 0 else 0,
            "pnl_cents": data["pnl_cents"],
            "roi": data["pnl_cents"] / data["total_cost"] if data["total_cost"] > 0 else 0,
            "avg_edge": sum(data["edges"]) / len(data["edges"]) if data["edges"] else 0,
            "sides": dict(data["sides"]),
            "regimes": dict(data["regimes"])
        }
    
    output_path = Path("data/trading/momentum-direction-analysis.json")
    output_path.parent.mkdir(parents=True, exist_ok=True)
    with open(output_path, "w") as f:
        json.dump(output, f, indent=2)
    print(f"\n💾 Results saved to {output_path}")

def main():
    parser = argparse.ArgumentParser(description="Analyze win rate by momentum direction")
    parser.add_argument("--v2", action="store_true", help="Use v2 trade log")
    args = parser.parse_args()
    
    trades = load_trades(v2=args.v2)
    analysis = analyze_by_direction(trades)
    print_report(analysis)

if __name__ == "__main__":
    main()
