#!/usr/bin/env python3
"""
Trade Outcome Prediction Confidence Calibration

Analyzes: when model predicts X% edge, does it actually win ~(50+X)% of the time?
Creates calibration curve for model tuning.

Usage: python3 scripts/analyze-edge-calibration.py [--v2] [--buckets N]
"""

import json
import os
import sys
from collections import defaultdict
from datetime import datetime, timezone

SCRIPTS_DIR = os.path.dirname(os.path.abspath(__file__))
V1_FILE = os.path.join(SCRIPTS_DIR, "kalshi-trades.jsonl")
V2_FILE = os.path.join(SCRIPTS_DIR, "kalshi-trades-v2.jsonl")
OUTPUT_DIR = os.path.join(os.path.dirname(SCRIPTS_DIR), "data/trading")

def load_trades(filepath):
    """Load trades from JSONL file"""
    trades = []
    if not os.path.exists(filepath):
        return trades
    
    with open(filepath) as f:
        for line in f:
            try:
                trade = json.loads(line.strip())
                trades.append(trade)
            except json.JSONDecodeError:
                continue
    return trades

def analyze_calibration(trades, num_buckets=5):
    """Analyze edge vs actual win rate by bucket"""
    # Filter to settled trades with edge data
    settled = []
    for t in trades:
        status = t.get("result_status", "")
        edge = t.get("edge", t.get("edge_yes", t.get("edge_no")))
        if status in ("won", "lost") and edge is not None:
            settled.append({
                "edge": float(edge) * 100,  # Convert to percent
                "won": status == "won",
                "side": t.get("side", "unknown"),
                "ticker": t.get("ticker", ""),
                "timestamp": t.get("timestamp", "")
            })
    
    if not settled:
        return None
    
    # Create edge buckets
    edges = [t["edge"] for t in settled]
    min_edge, max_edge = min(edges), max(edges)
    
    if min_edge == max_edge:
        bucket_size = 5.0
    else:
        bucket_size = (max_edge - min_edge) / num_buckets
    
    # Fixed buckets for consistency
    fixed_buckets = [
        (0, 5, "0-5%"),
        (5, 10, "5-10%"),
        (10, 15, "10-15%"),
        (15, 20, "15-20%"),
        (20, 100, "20%+")
    ]
    
    # Group trades by bucket
    bucket_data = defaultdict(lambda: {"trades": 0, "won": 0, "edges": []})
    
    for t in settled:
        edge = t["edge"]
        for low, high, label in fixed_buckets:
            if low <= edge < high or (high == 100 and edge >= low):
                bucket_data[label]["trades"] += 1
                bucket_data[label]["won"] += 1 if t["won"] else 0
                bucket_data[label]["edges"].append(edge)
                break
    
    # Calculate stats per bucket
    results = []
    for low, high, label in fixed_buckets:
        data = bucket_data[label]
        if data["trades"] > 0:
            actual_wr = (data["won"] / data["trades"]) * 100
            avg_edge = sum(data["edges"]) / len(data["edges"])
            expected_wr = 50 + avg_edge  # Edge represents expected advantage over 50%
            
            results.append({
                "bucket": label,
                "trades": data["trades"],
                "won": data["won"],
                "lost": data["trades"] - data["won"],
                "actual_win_rate": round(actual_wr, 1),
                "avg_edge": round(avg_edge, 1),
                "expected_win_rate": round(expected_wr, 1),
                "calibration_error": round(actual_wr - expected_wr, 1)
            })
    
    # Overall calibration stats
    total_trades = sum(r["trades"] for r in results)
    total_won = sum(r["won"] for r in results)
    overall_wr = (total_won / total_trades * 100) if total_trades > 0 else 0
    avg_calibration_error = sum(abs(r["calibration_error"]) for r in results) / len(results) if results else 0
    
    return {
        "analysis_time": datetime.now(timezone.utc).isoformat(),
        "total_trades": total_trades,
        "total_won": total_won,
        "overall_win_rate": round(overall_wr, 1),
        "avg_calibration_error": round(avg_calibration_error, 1),
        "buckets": results,
        "interpretation": interpret_calibration(results)
    }

def interpret_calibration(results):
    """Provide interpretation of calibration results"""
    if not results:
        return "No data available for calibration analysis."
    
    insights = []
    
    # Check if model is well-calibrated
    errors = [r["calibration_error"] for r in results]
    avg_error = sum(errors) / len(errors)
    
    if abs(avg_error) < 5:
        insights.append("✅ Model is well-calibrated overall (avg error < 5%)")
    elif avg_error > 10:
        insights.append("⚠️ Model is OVERCONFIDENT - predicting higher edges than actual performance")
    elif avg_error < -10:
        insights.append("📊 Model is UNDERCONFIDENT - actual performance exceeds predictions")
    
    # Check for specific bucket issues
    for r in results:
        if r["trades"] >= 5:  # Only flag with enough data
            if r["calibration_error"] > 15:
                insights.append(f"🔴 {r['bucket']} bucket: Actual WR {r['actual_win_rate']}% vs Expected {r['expected_win_rate']}% - OVERCONFIDENT")
            elif r["calibration_error"] < -15:
                insights.append(f"🟢 {r['bucket']} bucket: Actual WR {r['actual_win_rate']}% vs Expected {r['expected_win_rate']}% - Outperforming!")
    
    return "\n".join(insights) if insights else "Insufficient data for interpretation."

def main():
    use_v2 = "--v2" in sys.argv
    num_buckets = 5
    
    for i, arg in enumerate(sys.argv):
        if arg == "--buckets" and i + 1 < len(sys.argv):
            num_buckets = int(sys.argv[i + 1])
    
    filepath = V2_FILE if use_v2 else V1_FILE
    version = "v2" if use_v2 else "v1"
    
    print(f"\n📊 Edge Calibration Analysis ({version})")
    print("=" * 50)
    
    trades = load_trades(filepath)
    if not trades:
        print(f"No trades found in {filepath}")
        return
    
    print(f"Loaded {len(trades)} trades")
    
    analysis = analyze_calibration(trades, num_buckets)
    if not analysis:
        print("No settled trades with edge data found.")
        return
    
    # Display results
    print(f"\nTotal Settled: {analysis['total_trades']} ({analysis['total_won']}W/{analysis['total_trades']-analysis['total_won']}L)")
    print(f"Overall Win Rate: {analysis['overall_win_rate']}%")
    print(f"Avg Calibration Error: {analysis['avg_calibration_error']}%")
    
    print("\n📈 Calibration by Edge Bucket:")
    print("-" * 70)
    print(f"{'Bucket':<10} {'Trades':<8} {'W/L':<8} {'Actual WR':<10} {'Expected':<10} {'Error':<10}")
    print("-" * 70)
    
    for b in analysis["buckets"]:
        print(f"{b['bucket']:<10} {b['trades']:<8} {b['won']}/{b['lost']:<6} {b['actual_win_rate']:>6}%    {b['expected_win_rate']:>6}%    {b['calibration_error']:>+6}%")
    
    print("\n💡 Interpretation:")
    print(analysis["interpretation"])
    
    # Save to file
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    output_file = os.path.join(OUTPUT_DIR, f"edge-calibration-{version}.json")
    with open(output_file, 'w') as f:
        json.dump(analysis, f, indent=2)
    print(f"\n✅ Saved to {output_file}")

if __name__ == "__main__":
    main()
