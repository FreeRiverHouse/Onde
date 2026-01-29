#!/usr/bin/env python3
"""
Analyze Win Rate by Volatility Alignment Status (T375)

Compares performance when trading during:
- vol_aligned=true: realized vol ratio aligns with position direction
- vol_aligned=false: realized vol ratio doesn't support position

Validates if T237 (volatility rebalancing) improves performance.

Usage: python3 scripts/analyze-vol-alignment.py [--v2]
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

def analyze_by_vol_alignment(trades):
    """Analyze performance by volatility alignment status"""
    categories = {
        "aligned": {
            "trades": 0,
            "wins": 0,
            "losses": 0,
            "pnl_cents": 0,
            "total_cost": 0,
            "vol_ratios": [],
            "vol_bonuses": [],
            "assets": defaultdict(int),
            "sides": defaultdict(int)
        },
        "not_aligned": {
            "trades": 0,
            "wins": 0,
            "losses": 0,
            "pnl_cents": 0,
            "total_cost": 0,
            "vol_ratios": [],
            "vol_bonuses": [],
            "assets": defaultdict(int),
            "sides": defaultdict(int)
        },
        "unknown": {
            "trades": 0,
            "wins": 0,
            "losses": 0,
            "pnl_cents": 0,
            "total_cost": 0,
            "vol_ratios": [],
            "vol_bonuses": [],
            "assets": defaultdict(int),
            "sides": defaultdict(int)
        }
    }
    
    for trade in trades:
        # Get vol_aligned field (added in T237)
        vol_aligned = trade.get("vol_aligned")
        
        if vol_aligned is True:
            cat = "aligned"
        elif vol_aligned is False:
            cat = "not_aligned"
        else:
            cat = "unknown"
        
        categories[cat]["trades"] += 1
        categories[cat]["total_cost"] += trade.get("cost_cents", 0)
        categories[cat]["pnl_cents"] += calculate_pnl(trade)
        
        if trade.get("result_status") == "won":
            categories[cat]["wins"] += 1
        elif trade.get("result_status") == "lost":
            categories[cat]["losses"] += 1
        
        # Track vol_ratio if available
        vol_ratio = trade.get("vol_ratio")
        if vol_ratio is not None:
            categories[cat]["vol_ratios"].append(vol_ratio)
        
        # Track vol_bonus if available
        vol_bonus = trade.get("vol_bonus")
        if vol_bonus is not None:
            categories[cat]["vol_bonuses"].append(vol_bonus)
        
        # Track by asset
        asset = trade.get("asset", "unknown")
        categories[cat]["assets"][asset] += 1
        
        # Track by side
        side = trade.get("side", "unknown")
        categories[cat]["sides"][side] += 1
    
    return categories

def analyze_vol_bonus_effectiveness(trades):
    """Analyze if higher vol_bonus correlates with better outcomes"""
    # Group by vol_bonus bucket
    buckets = {
        "negative": [],    # < 0 (sizing reduced)
        "zero": [],        # 0 (no adjustment)
        "small": [],       # 0-1%
        "medium": [],      # 1-2%
        "large": []        # > 2%
    }
    
    for trade in trades:
        vol_bonus = trade.get("vol_bonus", 0)
        result = 1 if trade.get("result_status") == "won" else 0
        
        if vol_bonus < 0:
            buckets["negative"].append(result)
        elif vol_bonus == 0:
            buckets["zero"].append(result)
        elif vol_bonus < 0.01:
            buckets["small"].append(result)
        elif vol_bonus < 0.02:
            buckets["medium"].append(result)
        else:
            buckets["large"].append(result)
    
    analysis = {}
    for name, results in buckets.items():
        if len(results) > 0:
            analysis[name] = {
                "count": len(results),
                "win_rate": sum(results) / len(results)
            }
    
    return analysis

def print_report(analysis, vol_bonus_analysis, v2=False):
    """Print analysis report"""
    print("\n" + "="*70)
    print("WIN RATE BY VOLATILITY ALIGNMENT STATUS (T375)")
    print("="*70)
    
    source = "v2" if v2 else "v1"
    total_trades = sum(cat["trades"] for cat in analysis.values())
    
    if total_trades == 0:
        print(f"\n⚠️  No settled trades found in {source} log!")
        print("   Wait for settlement tracker to update results.")
        return
    
    print(f"\nSource: kalshi-trades{'-v2' if v2 else ''}.jsonl")
    print(f"Total settled trades: {total_trades}")
    
    # Count how many have vol_aligned field
    known = analysis["aligned"]["trades"] + analysis["not_aligned"]["trades"]
    unknown = analysis["unknown"]["trades"]
    
    if unknown > 0 and known == 0:
        print(f"\n⚠️  All {unknown} trades are from BEFORE vol_aligned tracking (T237)")
        print("   Run analysis again after v2 autotrader makes trades with vol data.")
        return
    
    print(f"Trades with vol_aligned data: {known} ({known/total_trades:.1%})")
    if unknown > 0:
        print(f"Trades without vol data (legacy): {unknown}")
    
    # Main comparison
    print("\n" + "-"*70)
    print(f"{'Alignment':<25} {'Trades':>8} {'Win Rate':>10} {'PnL':>12} {'ROI':>10}")
    print("-"*70)
    
    order = ["aligned", "not_aligned", "unknown"]
    labels = {
        "aligned": "✅ Vol Aligned",
        "not_aligned": "❌ Not Aligned",
        "unknown": "❓ Unknown (legacy)"
    }
    
    for cat in order:
        data = analysis[cat]
        n_trades = data["trades"]
        
        if n_trades == 0:
            continue
        
        wins = data["wins"]
        pnl = data["pnl_cents"]
        total_cost = data["total_cost"]
        
        win_rate = wins / n_trades if n_trades > 0 else 0
        roi = pnl / total_cost if total_cost > 0 else 0
        
        pnl_str = f"+${pnl/100:.2f}" if pnl >= 0 else f"-${abs(pnl)/100:.2f}"
        roi_sign = "+" if roi >= 0 else ""
        
        print(f"{labels[cat]:<25} {n_trades:>8} {win_rate:>9.1%} {pnl_str:>12} {roi_sign}{roi:>9.1%}")
    
    print("-"*70)
    
    # Insights
    aligned = analysis["aligned"]
    not_aligned = analysis["not_aligned"]
    
    print("\n📊 INSIGHTS:")
    
    if aligned["trades"] > 0 and not_aligned["trades"] > 0:
        aligned_wr = aligned["wins"] / aligned["trades"]
        not_aligned_wr = not_aligned["wins"] / not_aligned["trades"]
        diff = aligned_wr - not_aligned_wr
        
        if diff > 0.15:
            print(f"🏆 STRONG SIGNAL: Aligned trades WIN {diff:.1%} more often!")
            print("   Volatility rebalancing (T237) is WORKING!")
        elif diff > 0.05:
            print(f"✅ Aligned trades perform better (+{diff:.1%} win rate)")
            print("   Volatility alignment provides positive edge.")
        elif diff > -0.05:
            print("🔄 Similar performance between aligned/not aligned")
            print("   Volatility alignment may not be predictive.")
        else:
            print(f"⚠️  WARNING: Not-aligned trades perform BETTER ({abs(diff):.1%})")
            print("   Review volatility rebalancing logic!")
    
    # Vol ratio stats
    print("\n📈 VOLATILITY RATIO STATS:")
    for cat in ["aligned", "not_aligned"]:
        data = analysis[cat]
        ratios = data["vol_ratios"]
        if len(ratios) > 0:
            avg_ratio = sum(ratios) / len(ratios)
            print(f"  {labels[cat]}: Avg vol_ratio = {avg_ratio:.2f}")
    
    # Vol bonus analysis
    if vol_bonus_analysis:
        print("\n📈 WIN RATE BY VOL_BONUS BUCKET:")
        bonus_labels = {
            "negative": "Reduced (<0)",
            "zero": "No adjustment (0)",
            "small": "Small (0-1%)",
            "medium": "Medium (1-2%)",
            "large": "Large (>2%)"
        }
        for bucket in ["negative", "zero", "small", "medium", "large"]:
            if bucket in vol_bonus_analysis:
                data = vol_bonus_analysis[bucket]
                print(f"  {bonus_labels[bucket]}: {data['win_rate']:.1%} ({data['count']} trades)")
    
    # Asset breakdown
    print("\n📊 BY ASSET:")
    for cat in ["aligned", "not_aligned"]:
        data = analysis[cat]
        if data["trades"] == 0:
            continue
        assets = data["assets"]
        if len(assets) > 0:
            parts = [f"{a}: {c}" for a, c in sorted(assets.items())]
            print(f"  {labels[cat]}: {', '.join(parts)}")
    
    # Side breakdown  
    print("\n📊 BY SIDE:")
    for cat in ["aligned", "not_aligned"]:
        data = analysis[cat]
        if data["trades"] == 0:
            continue
        sides = data["sides"]
        if len(sides) > 0:
            parts = [f"{s}: {c}" for s, c in sorted(sides.items())]
            print(f"  {labels[cat]}: {', '.join(parts)}")
    
    # Save to JSON
    output = {
        "timestamp": datetime.now().isoformat(),
        "source": f"kalshi-trades{'-v2' if v2 else ''}.jsonl",
        "total_trades": total_trades,
        "trades_with_vol_data": known,
        "categories": {}
    }
    
    for cat, data in analysis.items():
        n = data["trades"]
        if n == 0:
            continue
        
        avg_vol_ratio = None
        if len(data["vol_ratios"]) > 0:
            avg_vol_ratio = sum(data["vol_ratios"]) / len(data["vol_ratios"])
        
        avg_vol_bonus = None
        if len(data["vol_bonuses"]) > 0:
            avg_vol_bonus = sum(data["vol_bonuses"]) / len(data["vol_bonuses"])
        
        output["categories"][cat] = {
            "trades": n,
            "wins": data["wins"],
            "losses": data["losses"],
            "win_rate": data["wins"] / n if n > 0 else 0,
            "pnl_cents": data["pnl_cents"],
            "roi": data["pnl_cents"] / data["total_cost"] if data["total_cost"] > 0 else 0,
            "avg_vol_ratio": avg_vol_ratio,
            "avg_vol_bonus": avg_vol_bonus,
            "assets": dict(data["assets"]),
            "sides": dict(data["sides"])
        }
    
    if vol_bonus_analysis:
        output["vol_bonus_buckets"] = vol_bonus_analysis
    
    output_path = Path("data/trading/vol-alignment-analysis.json")
    output_path.parent.mkdir(parents=True, exist_ok=True)
    with open(output_path, "w") as f:
        json.dump(output, f, indent=2)
    print(f"\n💾 Results saved to {output_path}")

def main():
    parser = argparse.ArgumentParser(description="Analyze win rate by volatility alignment (T375)")
    parser.add_argument("--v2", action="store_true", help="Use v2 trade log")
    args = parser.parse_args()
    
    trades = load_trades(v2=args.v2)
    analysis = analyze_by_vol_alignment(trades)
    vol_bonus_analysis = analyze_vol_bonus_effectiveness(trades)
    print_report(analysis, vol_bonus_analysis, v2=args.v2)

if __name__ == "__main__":
    main()
