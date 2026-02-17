#!/usr/bin/env python3
"""
Analyze edge vs win rate correlation.
Tests if our probability model is well-calibrated:
- Higher calculated edge should correlate with higher win rate
- If not, model needs recalibration
"""

import json
from pathlib import Path
from collections import defaultdict

TRADE_LOG = Path(__file__).parent / "kalshi-trades-v2.jsonl"


def main():
    if not TRADE_LOG.exists():
        print("No trade log found")
        return
    
    # Group trades by edge bucket
    buckets = [
        (0.00, 0.10, "0-10%"),
        (0.10, 0.15, "10-15%"),
        (0.15, 0.20, "15-20%"),
        (0.20, 0.25, "20-25%"),
        (0.25, 0.30, "25-30%"),
        (0.30, 0.50, "30-50%"),
        (0.50, 1.00, "50%+"),
    ]
    
    by_bucket = defaultdict(lambda: {"won": 0, "lost": 0, "pending": 0, "edges": []})
    all_trades = []
    
    with open(TRADE_LOG) as f:
        for line in f:
            try:
                entry = json.loads(line.strip())
                if entry.get("type") != "trade":
                    continue
                
                edge = entry.get("edge", entry.get("edge_with_bonus", 0))
                status = entry.get("result_status", "pending")
                
                # Find bucket
                bucket_name = None
                for low, high, name in buckets:
                    if low <= edge < high:
                        bucket_name = name
                        break
                
                if not bucket_name:
                    continue
                
                by_bucket[bucket_name]["edges"].append(edge)
                if status == "won":
                    by_bucket[bucket_name]["won"] += 1
                elif status == "lost":
                    by_bucket[bucket_name]["lost"] += 1
                else:
                    by_bucket[bucket_name]["pending"] += 1
                
                if status in ("won", "lost"):
                    all_trades.append({
                        "edge": edge,
                        "won": status == "won"
                    })
            except:
                continue
    
    print("📊 Edge vs Win Rate Correlation Analysis")
    print("=" * 60)
    print()
    
    if not all_trades:
        print("No settled trades found in v2 log.")
        print("(Need settled trades for edge correlation analysis)")
        return
    
    total_won = sum(1 for t in all_trades if t["won"])
    total_lost = len(all_trades) - total_won
    overall_wr = total_won / len(all_trades) * 100 if all_trades else 0
    
    print(f"Total settled trades: {len(all_trades)}")
    print(f"Overall win rate: {overall_wr:.1f}% ({total_won}W / {total_lost}L)")
    print()
    
    print("Win Rate by Edge Bucket:")
    print("-" * 60)
    print(f"{'Edge Range':12s} | {'Won':>4s} | {'Lost':>4s} | {'WR%':>6s} | {'Avg Edge':>8s} | {'Bar'}")
    print("-" * 60)
    
    # Sort buckets by edge range
    for low, high, name in buckets:
        data = by_bucket[name]
        settled = data["won"] + data["lost"]
        
        if settled == 0:
            continue
        
        wr = data["won"] / settled * 100
        avg_edge = sum(data["edges"]) / len(data["edges"]) * 100 if data["edges"] else 0
        
        bar_len = int(wr / 2)
        bar = "█" * bar_len
        
        print(f"{name:12s} | {data['won']:4d} | {data['lost']:4d} | {wr:5.1f}% | {avg_edge:7.1f}% | {bar}")
    
    print("-" * 60)
    print()
    
    # Correlation check
    print("📈 Calibration Check:")
    print()
    
    # Calculate correlation between edge and win rate
    # A well-calibrated model should have: higher edge → higher win rate
    bucket_stats = []
    for low, high, name in buckets:
        data = by_bucket[name]
        settled = data["won"] + data["lost"]
        if settled >= 3:  # Need at least 3 trades for meaningful stat
            wr = data["won"] / settled
            avg_edge = sum(data["edges"]) / len(data["edges"]) if data["edges"] else 0
            bucket_stats.append((avg_edge, wr, name, settled))
    
    if len(bucket_stats) >= 2:
        # Check if win rate increases with edge
        sorted_stats = sorted(bucket_stats, key=lambda x: x[0])
        
        increasing = 0
        decreasing = 0
        for i in range(1, len(sorted_stats)):
            if sorted_stats[i][1] > sorted_stats[i-1][1]:
                increasing += 1
            elif sorted_stats[i][1] < sorted_stats[i-1][1]:
                decreasing += 1
        
        if increasing > decreasing:
            print("✅ POSITIVE CORRELATION: Higher edge → Higher win rate")
            print("   Model appears well-calibrated!")
        elif increasing < decreasing:
            print("⚠️  NEGATIVE CORRELATION: Higher edge → Lower win rate")
            print("   Model may be miscalibrated or overfitting!")
        else:
            print("〰️  NO CLEAR CORRELATION detected")
            print("   Need more data or model review needed")
        
        print()
        
        # Expected vs actual
        print("Expected vs Actual Win Rates:")
        print("-" * 40)
        for avg_edge, actual_wr, name, n in sorted(bucket_stats, key=lambda x: x[0]):
            # For a binary option with edge E, expected WR ≈ 50% + E/2
            # (simplified: if market is efficient, edge = prob advantage)
            expected_wr = 0.5 + avg_edge / 2
            
            diff = (actual_wr - expected_wr) * 100
            diff_str = f"+{diff:.0f}%" if diff >= 0 else f"{diff:.0f}%"
            
            print(f"  {name:10s}: Expected {expected_wr*100:4.0f}% | Actual {actual_wr*100:4.0f}% | Diff: {diff_str} (n={n})")
    else:
        print("Not enough data for correlation analysis.")
        print(f"(Need at least 2 buckets with 3+ trades each, have {len(bucket_stats)})")
    
    print()
    print("💡 Interpretation:")
    print("   - If actual > expected: model is conservative (edge is real)")
    print("   - If actual < expected: model is optimistic (reduce edge calc)")
    print("   - Big differences suggest probability model needs tuning")


if __name__ == "__main__":
    main()
