#!/usr/bin/env python3
"""
T804: Analyze Latency Impact on Trade Outcomes

Analyzes correlation between API latency and trade results:
- Compare win rate when latency_multiplier < 1.0 vs = 1.0
- Calculate PnL impact of latency-adjusted trades
- Generate recommendations for threshold tuning

Usage:
    python3 analyze-latency-performance.py [--verbose] [--output PATH]

Cron: weekly
"""

import json
import os
import sys
from datetime import datetime, timezone, timedelta
from pathlib import Path
from collections import defaultdict
import argparse
from glob import glob

# === Configuration ===
DATA_DIR = Path(__file__).parent.parent / "data/trading"
OUTPUT_FILE = DATA_DIR / "latency-performance-analysis.json"

# Latency multiplier thresholds to analyze
MULTIPLIER_BUCKETS = {
    "normal": (1.0, 1.0),           # latency_multiplier = 1.0
    "reduced_25": (0.75, 0.99),     # 25% reduction
    "reduced_50": (0.50, 0.74),     # 50% reduction
}


def load_all_trades() -> list:
    """Load all trades from JSONL files."""
    trades = []
    
    # Load from all kalshi-trades-*.jsonl files
    pattern = str(DATA_DIR / "kalshi-trades-*.jsonl")
    for filepath in sorted(glob(pattern)):
        with open(filepath) as f:
            for line in f:
                try:
                    trade = json.loads(line.strip())
                    # Only include actual trades (not skips)
                    trade_type = trade.get("type", "")
                    # Include if type is "trade" or if there's no type but has trade-specific fields
                    if trade_type == "trade" or (trade_type not in ("skip", "latency_skip", "concentration_skip") and trade.get("order_uuid")):
                        trades.append(trade)
                except json.JSONDecodeError:
                    continue
    
    return trades


def load_skips() -> list:
    """Load skipped trades from JSONL file."""
    skips = []
    skip_file = DATA_DIR / "kalshi-skips.jsonl"
    
    if not skip_file.exists():
        return skips
    
    with open(skip_file) as f:
        for line in f:
            try:
                skip = json.loads(line.strip())
                skips.append(skip)
            except json.JSONDecodeError:
                continue
    
    return skips


def categorize_trade(trade: dict) -> dict:
    """Categorize trade by latency bucket and extract metrics."""
    multiplier = trade.get("latency_multiplier", 1.0)
    
    # Determine bucket
    bucket = "normal"
    for bucket_name, (low, high) in MULTIPLIER_BUCKETS.items():
        if low <= multiplier <= high:
            bucket = bucket_name
            break
    
    # Determine outcome
    result = trade.get("result_status", "pending")
    pnl = trade.get("pnl_cents", 0)
    
    # Calculate if trade was a win
    is_win = None
    if result in ("won", "loss"):
        is_win = result == "won"
    elif pnl != 0:
        is_win = pnl > 0
    
    return {
        "bucket": bucket,
        "multiplier": multiplier,
        "is_win": is_win,
        "pnl_cents": pnl,
        "latency_reason": trade.get("latency_reason", "unknown"),
        "ticker": trade.get("ticker", ""),
        "asset": trade.get("asset", "unknown"),
        "timestamp": trade.get("timestamp", ""),
    }


def analyze_by_bucket(categorized_trades: list) -> dict:
    """Analyze trades grouped by latency bucket."""
    buckets = defaultdict(lambda: {
        "trades": 0,
        "wins": 0,
        "losses": 0,
        "pending": 0,
        "pnl_cents": 0,
        "avg_multiplier": 0,
        "multipliers": [],
    })
    
    for t in categorized_trades:
        bucket = t["bucket"]
        buckets[bucket]["trades"] += 1
        buckets[bucket]["multipliers"].append(t["multiplier"])
        buckets[bucket]["pnl_cents"] += t["pnl_cents"]
        
        if t["is_win"] is True:
            buckets[bucket]["wins"] += 1
        elif t["is_win"] is False:
            buckets[bucket]["losses"] += 1
        else:
            buckets[bucket]["pending"] += 1
    
    # Calculate derived metrics
    for bucket, data in buckets.items():
        if data["multipliers"]:
            data["avg_multiplier"] = sum(data["multipliers"]) / len(data["multipliers"])
        del data["multipliers"]  # Remove raw data
        
        total_decided = data["wins"] + data["losses"]
        if total_decided > 0:
            data["win_rate"] = data["wins"] / total_decided
        else:
            data["win_rate"] = None
    
    return dict(buckets)


def analyze_latency_skips(skips: list) -> dict:
    """Analyze trades that were skipped due to latency."""
    latency_skips = [s for s in skips if s.get("type") == "latency_skip"]
    
    if not latency_skips:
        return {
            "count": 0,
            "reasons": {},
            "assets": {},
        }
    
    reasons = defaultdict(int)
    assets = defaultdict(int)
    
    for skip in latency_skips:
        reasons[skip.get("reason", "unknown")] += 1
        assets[skip.get("asset", "unknown")] += 1
    
    return {
        "count": len(latency_skips),
        "reasons": dict(reasons),
        "assets": dict(assets),
        "first_skip": latency_skips[0].get("timestamp") if latency_skips else None,
        "last_skip": latency_skips[-1].get("timestamp") if latency_skips else None,
    }


def generate_recommendations(bucket_analysis: dict, skip_analysis: dict) -> list:
    """Generate actionable recommendations based on analysis."""
    recommendations = []
    
    normal = bucket_analysis.get("normal", {})
    reduced_25 = bucket_analysis.get("reduced_25", {})
    reduced_50 = bucket_analysis.get("reduced_50", {})
    
    normal_wr = normal.get("win_rate")
    reduced_25_wr = reduced_25.get("win_rate")
    reduced_50_wr = reduced_50.get("win_rate")
    
    # Compare win rates
    if normal_wr is not None and reduced_25_wr is not None:
        if reduced_25_wr > normal_wr + 0.05:
            recommendations.append({
                "type": "consider_stricter",
                "message": f"Reduced-size trades (25%) have higher win rate ({reduced_25_wr:.0%}) than normal ({normal_wr:.0%}). Consider lowering latency threshold from 500ms.",
                "priority": "medium",
            })
        elif reduced_25_wr < normal_wr - 0.1:
            recommendations.append({
                "type": "consider_relaxing",
                "message": f"Reduced-size trades (25%) have lower win rate ({reduced_25_wr:.0%}) than normal ({normal_wr:.0%}). Consider raising latency threshold above 500ms.",
                "priority": "low",
            })
    
    # Check skip impact
    if skip_analysis.get("count", 0) > 10:
        recommendations.append({
            "type": "high_skip_count",
            "message": f"{skip_analysis['count']} trades skipped due to high latency. Consider optimizing API calls or adjusting 2000ms threshold.",
            "priority": "high",
        })
    
    # Check if we have enough data
    total_adjusted = (reduced_25.get("trades", 0) + reduced_50.get("trades", 0))
    if total_adjusted < 20:
        recommendations.append({
            "type": "insufficient_data",
            "message": f"Only {total_adjusted} latency-adjusted trades. Need more data for reliable threshold tuning.",
            "priority": "info",
        })
    
    # PnL comparison
    normal_pnl = normal.get("pnl_cents", 0)
    adjusted_pnl = reduced_25.get("pnl_cents", 0) + reduced_50.get("pnl_cents", 0)
    
    if adjusted_pnl < 0 and normal_pnl >= 0:
        recommendations.append({
            "type": "latency_hurts",
            "message": f"Latency-adjusted trades have negative PnL ({adjusted_pnl/100:.2f}) while normal trades are positive ({normal_pnl/100:.2f}). Latency may correlate with bad market conditions.",
            "priority": "high",
        })
    
    if not recommendations:
        recommendations.append({
            "type": "thresholds_ok",
            "message": "Current latency thresholds appear appropriate based on available data.",
            "priority": "info",
        })
    
    return recommendations


def main():
    parser = argparse.ArgumentParser(description="Analyze latency impact on trade outcomes")
    parser.add_argument("--verbose", "-v", action="store_true", help="Verbose output")
    parser.add_argument("--output", "-o", type=Path, default=OUTPUT_FILE, help="Output file path")
    args = parser.parse_args()
    
    print("📊 Analyzing Latency Impact on Trade Outcomes...")
    
    # Load data
    trades = load_all_trades()
    skips = load_skips()
    
    if args.verbose:
        print(f"   Loaded {len(trades)} trades")
        print(f"   Loaded {len(skips)} skips")
    
    if not trades:
        print("❌ No trades found")
        sys.exit(1)
    
    # Categorize trades
    categorized = [categorize_trade(t) for t in trades]
    
    # Count trades with latency adjustments
    adjusted_count = sum(1 for t in categorized if t["multiplier"] != 1.0)
    
    if args.verbose:
        print(f"   Trades with latency adjustment: {adjusted_count}")
    
    # Analyze by bucket
    bucket_analysis = analyze_by_bucket(categorized)
    
    # Analyze skips
    skip_analysis = analyze_latency_skips(skips)
    
    # Generate recommendations
    recommendations = generate_recommendations(bucket_analysis, skip_analysis)
    
    # Build report
    report = {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "total_trades": len(trades),
        "buckets": bucket_analysis,
        "skips": skip_analysis,
        "recommendations": recommendations,
        "summary": {
            "trades_with_latency_adjustment": sum(
                bucket_analysis.get(b, {}).get("trades", 0) 
                for b in ["reduced_25", "reduced_50"]
            ),
            "trades_skipped_high_latency": skip_analysis.get("count", 0),
        },
    }
    
    # Save report
    args.output.parent.mkdir(parents=True, exist_ok=True)
    with open(args.output, "w") as f:
        json.dump(report, f, indent=2)
    
    print(f"✅ Analysis saved to: {args.output}")
    
    # Print summary
    print("\n📈 Summary:")
    for bucket, data in bucket_analysis.items():
        trades_count = data.get("trades", 0)
        wr = data.get("win_rate")
        pnl = data.get("pnl_cents", 0)
        wr_str = f"{wr:.0%}" if wr is not None else "N/A"
        print(f"   {bucket:15} | Trades: {trades_count:4} | Win Rate: {wr_str:5} | PnL: ${pnl/100:>8.2f}")
    
    if skip_analysis.get("count", 0) > 0:
        print(f"\n   ⛔ Latency skips: {skip_analysis['count']}")
    
    print("\n💡 Recommendations:")
    for rec in recommendations:
        priority_emoji = {"high": "🔴", "medium": "🟡", "low": "🟢", "info": "ℹ️"}.get(rec["priority"], "•")
        print(f"   {priority_emoji} {rec['message']}")


if __name__ == "__main__":
    main()
