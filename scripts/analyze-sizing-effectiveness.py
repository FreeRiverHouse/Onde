#!/usr/bin/env python3
"""
Analyze Volatility-Adjusted Position Sizing Effectiveness (T391)

Compares win rate and PnL when position size was:
- Reduced (multiplier < 1.0): choppy regime, high vol without alignment
- Standard (multiplier = 1.0): normal conditions
- Increased (multiplier > 1.0): trending regime, volatility aligned

Usage: python3 scripts/analyze-sizing-effectiveness.py [--v2] [--threshold 0.1]
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
                # Only include settled trades with sizing data
                if trade.get("result_status") in ("won", "lost") and "size_multiplier_total" in trade:
                    trades.append(trade)
            except json.JSONDecodeError:
                continue
    
    return trades

def categorize_multiplier(mult, threshold=0.1):
    """Categorize multiplier as reduced/standard/increased"""
    if mult < 1.0 - threshold:
        return "reduced"
    elif mult > 1.0 + threshold:
        return "increased"
    else:
        return "standard"

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

def analyze_sizing(trades, threshold=0.1):
    """Analyze performance by sizing category"""
    categories = defaultdict(lambda: {
        "trades": [],
        "wins": 0,
        "losses": 0,
        "pnl_cents": 0,
        "total_cost": 0,
        "multipliers": [],
        "regime_breakdown": defaultdict(int),
        "vol_aligned_count": 0
    })
    
    for trade in trades:
        mult = trade.get("size_multiplier_total", 1.0)
        cat = categorize_multiplier(mult, threshold)
        
        categories[cat]["trades"].append(trade)
        categories[cat]["multipliers"].append(mult)
        categories[cat]["total_cost"] += trade.get("cost_cents", 0)
        
        pnl = calculate_pnl(trade)
        categories[cat]["pnl_cents"] += pnl
        
        if trade.get("result_status") == "won":
            categories[cat]["wins"] += 1
        elif trade.get("result_status") == "lost":
            categories[cat]["losses"] += 1
        
        regime = trade.get("regime", "unknown")
        categories[cat]["regime_breakdown"][regime] += 1
        
        if trade.get("vol_aligned", False):
            categories[cat]["vol_aligned_count"] += 1
    
    return dict(categories)

def print_report(analysis, threshold):
    """Print analysis report"""
    print("\n" + "="*70)
    print("POSITION SIZING EFFECTIVENESS ANALYSIS (T391)")
    print("="*70)
    print(f"\nThreshold for categorization: ±{threshold:.0%}")
    print("  • reduced  = multiplier < {:.0%}".format(1.0 - threshold))
    print("  • standard = {:.0%} - {:.0%}".format(1.0 - threshold, 1.0 + threshold))
    print("  • increased = multiplier > {:.0%}".format(1.0 + threshold))
    
    total_trades = sum(len(cat["trades"]) for cat in analysis.values())
    
    if total_trades == 0:
        print("\n⚠️  No trades with sizing data found!")
        print("   Sizing multipliers were added in T390.")
        print("   New trades will include this data automatically.")
        return
    
    print(f"\nTotal trades with sizing data: {total_trades}")
    
    # Order: reduced, standard, increased
    order = ["reduced", "standard", "increased"]
    
    print("\n" + "-"*70)
    print(f"{'Category':<12} {'Trades':>8} {'Win Rate':>10} {'PnL':>12} {'ROI':>10} {'Avg Mult':>10}")
    print("-"*70)
    
    for cat in order:
        if cat not in analysis:
            continue
        data = analysis[cat]
        
        n_trades = len(data["trades"])
        wins = data["wins"]
        losses = data["losses"]
        pnl = data["pnl_cents"]
        total_cost = data["total_cost"]
        multipliers = data["multipliers"]
        
        if n_trades == 0:
            continue
        
        win_rate = wins / n_trades if n_trades > 0 else 0
        roi = pnl / total_cost if total_cost > 0 else 0
        avg_mult = sum(multipliers) / len(multipliers) if multipliers else 1.0
        
        pnl_str = f"+${pnl/100:.2f}" if pnl >= 0 else f"-${abs(pnl)/100:.2f}"
        roi_color = "+" if roi >= 0 else ""
        
        print(f"{cat:<12} {n_trades:>8} {win_rate:>9.1%} {pnl_str:>12} {roi_color}{roi:>9.1%} {avg_mult:>9.2f}x")
    
    print("-"*70)
    
    # Insights
    print("\n📊 INSIGHTS:")
    
    # Compare reduced vs increased
    reduced = analysis.get("reduced", {"trades": [], "wins": 0, "pnl_cents": 0})
    standard = analysis.get("standard", {"trades": [], "wins": 0, "pnl_cents": 0})
    increased = analysis.get("increased", {"trades": [], "wins": 0, "pnl_cents": 0})
    
    if len(reduced["trades"]) > 0 and len(increased["trades"]) > 0:
        red_wr = reduced["wins"] / len(reduced["trades"])
        inc_wr = increased["wins"] / len(increased["trades"])
        
        if inc_wr > red_wr:
            print(f"✅ Higher sizing correlates with better win rate ({inc_wr:.1%} vs {red_wr:.1%})")
            print("   Confidence in momentum alignment appears justified!")
        elif red_wr > inc_wr:
            print(f"⚠️  Reduced sizing has BETTER win rate ({red_wr:.1%} vs {inc_wr:.1%})")
            print("   Consider being more conservative with size increases.")
        else:
            print("🔄 Similar win rates across sizing categories")
    
    # Regime breakdown
    print("\n📈 REGIME BREAKDOWN BY CATEGORY:")
    for cat in order:
        if cat not in analysis:
            continue
        data = analysis[cat]
        if len(data["trades"]) == 0:
            continue
        
        regime_str = ", ".join(f"{r}:{c}" for r, c in sorted(data["regime_breakdown"].items()))
        vol_pct = data["vol_aligned_count"] / len(data["trades"]) if data["trades"] else 0
        print(f"  {cat}: {regime_str} | Vol aligned: {vol_pct:.0%}")
    
    # Save to JSON
    output = {
        "timestamp": datetime.now().isoformat(),
        "threshold": threshold,
        "total_trades": total_trades,
        "categories": {}
    }
    
    for cat, data in analysis.items():
        n_trades = len(data["trades"])
        if n_trades == 0:
            continue
        output["categories"][cat] = {
            "trades": n_trades,
            "wins": data["wins"],
            "losses": data["losses"],
            "win_rate": data["wins"] / n_trades if n_trades > 0 else 0,
            "pnl_cents": data["pnl_cents"],
            "roi": data["pnl_cents"] / data["total_cost"] if data["total_cost"] > 0 else 0,
            "avg_multiplier": sum(data["multipliers"]) / len(data["multipliers"]) if data["multipliers"] else 1.0,
            "vol_aligned_pct": data["vol_aligned_count"] / n_trades if n_trades > 0 else 0
        }
    
    output_path = Path("data/trading/sizing-effectiveness.json")
    output_path.parent.mkdir(parents=True, exist_ok=True)
    with open(output_path, "w") as f:
        json.dump(output, f, indent=2)
    print(f"\n💾 Results saved to {output_path}")

def main():
    parser = argparse.ArgumentParser(description="Analyze position sizing effectiveness")
    parser.add_argument("--v2", action="store_true", help="Use v2 trade log")
    parser.add_argument("--threshold", type=float, default=0.1, 
                        help="Threshold for categorizing multipliers (default: 0.1 = ±10%%)")
    args = parser.parse_args()
    
    trades = load_trades(v2=args.v2)
    analysis = analyze_sizing(trades, threshold=args.threshold)
    print_report(analysis, args.threshold)

if __name__ == "__main__":
    main()
