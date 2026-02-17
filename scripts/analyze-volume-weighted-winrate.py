#!/usr/bin/env python3
"""
Volume-Weighted Win Rate Analysis [T808]

Analyzes if larger trades have different success rates.
Groups trades by size and calculates win rate per bucket.

Output: data/trading/volume-weighted-analysis.json
"""

import json
import glob
from pathlib import Path
from datetime import datetime, timezone
from collections import defaultdict

# Config
DATA_DIR = Path(__file__).parent.parent / "data" / "trading"
OUTPUT_FILE = DATA_DIR / "volume-weighted-analysis.json"

# Size buckets (in cents)
BUCKETS = {
    "tiny": (0, 25),       # < $0.25
    "small": (25, 50),     # $0.25 - $0.50
    "medium": (50, 100),   # $0.50 - $1.00
    "large": (100, 200),   # $1.00 - $2.00
    "xlarge": (200, float("inf")),  # > $2.00
}

def get_bucket(cost_cents: int) -> str:
    """Determine which bucket a trade belongs to."""
    for name, (low, high) in BUCKETS.items():
        if low <= cost_cents < high:
            return name
    return "xlarge"

def load_trades() -> list:
    """Load all trade records from JSONL files."""
    trades = []
    trade_files = sorted(glob.glob(str(DATA_DIR / "kalshi-trades-*.jsonl")))
    
    for filepath in trade_files:
        with open(filepath, "r") as f:
            for line in f:
                try:
                    record = json.loads(line.strip())
                    if record.get("type") == "trade" and record.get("result_status"):
                        trades.append(record)
                except json.JSONDecodeError:
                    continue
    
    return trades

def analyze_trades(trades: list) -> dict:
    """Analyze win rates by trade size bucket."""
    # Initialize stats per bucket
    stats = {bucket: {"wins": 0, "losses": 0, "total_cost": 0, "total_pnl": 0} 
             for bucket in BUCKETS}
    
    for trade in trades:
        cost = trade.get("cost_cents", 0)
        result = trade.get("result_status", "")
        contracts = trade.get("contracts", 0)
        price = trade.get("price_cents", 0)
        
        bucket = get_bucket(cost)
        stats[bucket]["total_cost"] += cost
        
        if result == "won":
            stats[bucket]["wins"] += 1
            # For NO bets at price X, win = (100-X) * contracts
            pnl = (100 - price) * contracts
            stats[bucket]["total_pnl"] += pnl
        elif result == "lost":
            stats[bucket]["losses"] += 1
            stats[bucket]["total_pnl"] -= cost
    
    # Calculate metrics per bucket
    results = {}
    for bucket, data in stats.items():
        total = data["wins"] + data["losses"]
        if total > 0:
            win_rate = data["wins"] / total * 100
            roi = (data["total_pnl"] / data["total_cost"] * 100) if data["total_cost"] > 0 else 0
            avg_trade_size = data["total_cost"] / total
        else:
            win_rate = 0
            roi = 0
            avg_trade_size = 0
        
        results[bucket] = {
            "trades": total,
            "wins": data["wins"],
            "losses": data["losses"],
            "win_rate_pct": round(win_rate, 2),
            "total_cost_cents": data["total_cost"],
            "total_pnl_cents": data["total_pnl"],
            "roi_pct": round(roi, 2),
            "avg_trade_size_cents": round(avg_trade_size, 2),
            "size_range": f"${BUCKETS[bucket][0]/100:.2f} - ${BUCKETS[bucket][1]/100:.2f}" if BUCKETS[bucket][1] != float("inf") else f">${BUCKETS[bucket][0]/100:.2f}",
        }
    
    return results

def find_optimal_size(results: dict) -> dict:
    """Find the optimal trade size based on analysis."""
    best_bucket = None
    best_roi = float("-inf")
    best_win_rate = 0
    
    for bucket, data in results.items():
        if data["trades"] >= 10:  # Minimum sample size
            if data["roi_pct"] > best_roi:
                best_roi = data["roi_pct"]
                best_bucket = bucket
                best_win_rate = data["win_rate_pct"]
    
    recommendation = "insufficient_data"
    if best_bucket:
        if best_roi > 10:
            recommendation = f"increase_to_{best_bucket}"
        elif best_roi < -10:
            recommendation = "reduce_size_or_improve_strategy"
        else:
            recommendation = "maintain_current_sizing"
    
    return {
        "optimal_bucket": best_bucket,
        "optimal_roi_pct": best_roi if best_bucket else None,
        "optimal_win_rate_pct": best_win_rate if best_bucket else None,
        "recommendation": recommendation,
    }

def main():
    print("📊 Volume-Weighted Win Rate Analysis")
    print("=" * 50)
    
    # Load trades
    trades = load_trades()
    print(f"Loaded {len(trades)} trade records")
    
    if not trades:
        print("❌ No trade data found!")
        return
    
    # Analyze
    results = analyze_trades(trades)
    optimal = find_optimal_size(results)
    
    # Print results
    print("\n📈 Win Rate by Trade Size:")
    print("-" * 50)
    for bucket, data in sorted(results.items(), key=lambda x: BUCKETS[x[0]][0]):
        if data["trades"] > 0:
            print(f"\n{bucket.upper()} ({data['size_range']}):")
            print(f"  Trades: {data['trades']} ({data['wins']}W / {data['losses']}L)")
            print(f"  Win Rate: {data['win_rate_pct']}%")
            print(f"  ROI: {data['roi_pct']}%")
            print(f"  Total PnL: ${data['total_pnl_cents']/100:.2f}")
    
    print("\n" + "=" * 50)
    print("🎯 OPTIMAL SIZING RECOMMENDATION:")
    print(f"  Best bucket: {optimal['optimal_bucket'] or 'N/A'}")
    print(f"  Best ROI: {optimal['optimal_roi_pct']}%" if optimal['optimal_roi_pct'] else "  Best ROI: N/A")
    print(f"  Recommendation: {optimal['recommendation']}")
    
    # Save results
    output = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "total_trades_analyzed": len(trades),
        "buckets": results,
        "optimal_sizing": optimal,
    }
    
    OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(OUTPUT_FILE, "w") as f:
        json.dump(output, f, indent=2)
    
    print(f"\n✅ Results saved to {OUTPUT_FILE}")

if __name__ == "__main__":
    main()
