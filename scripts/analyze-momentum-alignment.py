#!/usr/bin/env python3
"""
Analyze Win Rate by Momentum Alignment Status (T394)

Compares performance when trading during:
- Full alignment: all timeframes (1h/4h/24h) agree
- Partial alignment: some timeframes agree
- No alignment: timeframes disagree or neutral

Usage: python3 scripts/analyze-momentum-alignment.py [--v2]
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

def categorize_alignment(trade):
    """Categorize trade by momentum alignment status"""
    # Full alignment field added in T395
    full_alignment = trade.get("full_alignment", False)
    momentum_aligned = trade.get("momentum_aligned", False)
    
    if full_alignment:
        return "full"
    elif momentum_aligned:
        return "partial"
    else:
        return "none"

def analyze_by_alignment(trades):
    """Analyze performance by alignment category"""
    categories = defaultdict(lambda: {
        "trades": 0,
        "wins": 0,
        "losses": 0,
        "pnl_cents": 0,
        "total_cost": 0,
        "momentum_dirs": defaultdict(int),
        "regimes": defaultdict(int)
    })
    
    for trade in trades:
        cat = categorize_alignment(trade)
        
        categories[cat]["trades"] += 1
        categories[cat]["total_cost"] += trade.get("cost_cents", 0)
        categories[cat]["pnl_cents"] += calculate_pnl(trade)
        
        if trade.get("result_status") == "won":
            categories[cat]["wins"] += 1
        elif trade.get("result_status") == "lost":
            categories[cat]["losses"] += 1
        
        # Track momentum direction
        mom_dir = trade.get("momentum_dir", 0)
        if mom_dir > 0.1:
            categories[cat]["momentum_dirs"]["bullish"] += 1
        elif mom_dir < -0.1:
            categories[cat]["momentum_dirs"]["bearish"] += 1
        else:
            categories[cat]["momentum_dirs"]["neutral"] += 1
        
        # Track regime
        regime = trade.get("regime", "unknown")
        categories[cat]["regimes"][regime] += 1
    
    return dict(categories)

def print_report(analysis):
    """Print analysis report"""
    print("\n" + "="*70)
    print("WIN RATE BY MOMENTUM ALIGNMENT STATUS (T394)")
    print("="*70)
    
    total_trades = sum(cat["trades"] for cat in analysis.values())
    
    if total_trades == 0:
        print("\n⚠️  No settled trades found!")
        print("   Wait for settlement tracker to update results.")
        return
    
    print(f"\nTotal settled trades: {total_trades}")
    
    # Order: full → partial → none
    order = ["full", "partial", "none"]
    labels = {
        "full": "Full Alignment (1h+4h+24h)",
        "partial": "Partial Alignment", 
        "none": "No Alignment"
    }
    
    print("\n" + "-"*70)
    print(f"{'Alignment':<30} {'Trades':>8} {'Win Rate':>10} {'PnL':>12} {'ROI':>10}")
    print("-"*70)
    
    for cat in order:
        if cat not in analysis:
            continue
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
        
        print(f"{labels[cat]:<30} {n_trades:>8} {win_rate:>9.1%} {pnl_str:>12} {roi_sign}{roi:>9.1%}")
    
    print("-"*70)
    
    # Insights
    print("\n📊 INSIGHTS:")
    
    full = analysis.get("full", {"trades": 0, "wins": 0, "pnl_cents": 0})
    partial = analysis.get("partial", {"trades": 0, "wins": 0, "pnl_cents": 0})
    none = analysis.get("none", {"trades": 0, "wins": 0, "pnl_cents": 0})
    
    # Compare full vs no alignment
    if full["trades"] > 0 and none["trades"] > 0:
        full_wr = full["wins"] / full["trades"]
        none_wr = none["wins"] / none["trades"]
        
        if full_wr > none_wr + 0.1:
            print(f"✅ Full alignment MUCH better ({full_wr:.1%} vs {none_wr:.1%})")
            print("   Consider only trading when fully aligned!")
        elif full_wr > none_wr:
            print(f"🟢 Full alignment better ({full_wr:.1%} vs {none_wr:.1%})")
        elif none_wr > full_wr + 0.1:
            print(f"⚠️  No alignment has BETTER win rate ({none_wr:.1%} vs {full_wr:.1%})")
            print("   Momentum alignment may not be predictive!")
        else:
            print("🔄 Similar win rates across alignment categories")
    
    # Momentum direction breakdown
    print("\n📈 MOMENTUM DIRECTION BREAKDOWN:")
    for cat in order:
        if cat not in analysis or analysis[cat]["trades"] == 0:
            continue
        data = analysis[cat]
        dirs = data["momentum_dirs"]
        total = sum(dirs.values())
        if total == 0:
            continue
        
        parts = [f"{d}: {c} ({c/total:.0%})" for d, c in sorted(dirs.items()) if c > 0]
        print(f"  {labels[cat]}: {', '.join(parts)}")
    
    # Save to JSON
    output = {
        "timestamp": datetime.now().isoformat(),
        "total_trades": total_trades,
        "categories": {}
    }
    
    for cat, data in analysis.items():
        n = data["trades"]
        if n == 0:
            continue
        output["categories"][cat] = {
            "trades": n,
            "wins": data["wins"],
            "losses": data["losses"],
            "win_rate": data["wins"] / n if n > 0 else 0,
            "pnl_cents": data["pnl_cents"],
            "roi": data["pnl_cents"] / data["total_cost"] if data["total_cost"] > 0 else 0,
            "momentum_dirs": dict(data["momentum_dirs"]),
            "regimes": dict(data["regimes"])
        }
    
    output_path = Path("data/trading/momentum-alignment-analysis.json")
    output_path.parent.mkdir(parents=True, exist_ok=True)
    with open(output_path, "w") as f:
        json.dump(output, f, indent=2)
    print(f"\n💾 Results saved to {output_path}")

def main():
    parser = argparse.ArgumentParser(description="Analyze win rate by momentum alignment")
    parser.add_argument("--v2", action="store_true", help="Use v2 trade log")
    args = parser.parse_args()
    
    trades = load_trades(v2=args.v2)
    analysis = analyze_by_alignment(trades)
    print_report(analysis)

if __name__ == "__main__":
    main()
