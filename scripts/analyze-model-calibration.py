#!/usr/bin/env python3
"""
Model Calibration Analysis

Analyzes how well our probability predictions match actual outcomes.
Perfect calibration: 30% predicted → ~30% actual wins

Calculates:
- Calibration curve (predicted vs actual by bucket)
- Brier score (lower = better)
- Expected Calibration Error (ECE)
- Over/under-confidence assessment

Usage: python3 scripts/analyze-model-calibration.py [--buckets N] [--verbose]
"""

import json
import os
import sys
import glob
import argparse
from collections import defaultdict
from datetime import datetime, timezone
import math

SCRIPTS_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(os.path.dirname(SCRIPTS_DIR), "data/trading")
OUTPUT_FILE = os.path.join(DATA_DIR, "calibration-analysis.json")


def load_all_trades():
    """Load trades from all kalshi-trades-*.jsonl files"""
    trades = []
    
    # Check for dated trade files
    pattern = os.path.join(DATA_DIR, "kalshi-trades-*.jsonl")
    files = glob.glob(pattern)
    
    # Also check scripts dir for legacy files
    legacy_pattern = os.path.join(SCRIPTS_DIR, "kalshi-trades*.jsonl")
    files.extend(glob.glob(legacy_pattern))
    
    for filepath in files:
        try:
            with open(filepath) as f:
                for line in f:
                    try:
                        trade = json.loads(line.strip())
                        trades.append(trade)
                    except json.JSONDecodeError:
                        continue
        except Exception as e:
            print(f"Warning: Could not read {filepath}: {e}")
    
    return trades


def filter_settled_trades_with_prob(trades):
    """Filter to settled trades that have our_prob"""
    settled = []
    
    for t in trades:
        if t.get("type") != "trade":
            continue
        
        status = t.get("result_status", "")
        our_prob = t.get("our_prob")
        
        if status in ("won", "lost") and our_prob is not None:
            settled.append({
                "our_prob": float(our_prob),
                "won": status == "won",
                "side": t.get("side", "unknown"),
                "ticker": t.get("ticker", ""),
                "timestamp": t.get("timestamp", ""),
                "market_prob": t.get("market_prob"),
                "edge": t.get("edge"),
            })
    
    return settled


def calculate_calibration(trades, num_buckets=5):
    """Calculate calibration curve with N buckets"""
    # Define bucket boundaries
    bucket_size = 1.0 / num_buckets
    buckets = defaultdict(lambda: {"count": 0, "wins": 0, "total_prob": 0.0, "trades": []})
    
    for t in trades:
        prob = t["our_prob"]
        
        # For "no" side, convert to effective probability
        # If we bet NO at our_prob=0.48, we expect NO to win with ~48% prob
        # but we WIN when the event does NOT happen, so effective prob = 1 - prob? 
        # Actually no - our_prob should already be the probability of our bet winning
        # Let's use it as-is for now
        
        # Determine bucket
        bucket_idx = min(int(prob / bucket_size), num_buckets - 1)
        bucket_low = bucket_idx * bucket_size
        bucket_high = (bucket_idx + 1) * bucket_size
        bucket_name = f"{int(bucket_low*100)}-{int(bucket_high*100)}%"
        
        buckets[bucket_name]["count"] += 1
        buckets[bucket_name]["wins"] += 1 if t["won"] else 0
        buckets[bucket_name]["total_prob"] += prob
        buckets[bucket_name]["trades"].append(t)
    
    # Calculate actual win rates
    calibration = []
    for bucket_name in sorted(buckets.keys(), key=lambda x: int(x.split("-")[0])):
        data = buckets[bucket_name]
        if data["count"] > 0:
            actual_rate = data["wins"] / data["count"]
            predicted_rate = data["total_prob"] / data["count"]
            
            calibration.append({
                "bucket": bucket_name,
                "count": data["count"],
                "wins": data["wins"],
                "predicted_prob": round(predicted_rate, 4),
                "actual_rate": round(actual_rate, 4),
                "gap": round(actual_rate - predicted_rate, 4),  # positive = underconfident
            })
    
    return calibration


def calculate_brier_score(trades):
    """
    Calculate Brier score: mean squared error between predictions and outcomes.
    Lower is better. Range: 0 (perfect) to 1 (worst).
    """
    if not trades:
        return None
    
    total = 0.0
    for t in trades:
        prob = t["our_prob"]
        outcome = 1.0 if t["won"] else 0.0
        total += (prob - outcome) ** 2
    
    return round(total / len(trades), 6)


def calculate_ece(calibration):
    """
    Calculate Expected Calibration Error.
    Weighted average of |predicted - actual| across buckets.
    Lower is better.
    """
    total_samples = sum(b["count"] for b in calibration)
    if total_samples == 0:
        return None
    
    ece = 0.0
    for bucket in calibration:
        weight = bucket["count"] / total_samples
        ece += weight * abs(bucket["gap"])
    
    return round(ece, 6)


def assess_confidence(calibration):
    """Assess if model is over or under confident"""
    overconfident_buckets = 0
    underconfident_buckets = 0
    
    for bucket in calibration:
        if bucket["gap"] < -0.05:  # Actual < predicted by >5%
            overconfident_buckets += 1
        elif bucket["gap"] > 0.05:  # Actual > predicted by >5%
            underconfident_buckets += 1
    
    if overconfident_buckets > underconfident_buckets:
        return "overconfident"
    elif underconfident_buckets > overconfident_buckets:
        return "underconfident"
    else:
        return "balanced"


def print_calibration_report(calibration, brier, ece, confidence, total_trades, verbose=False):
    """Print formatted calibration report"""
    print("\n" + "="*60)
    print("📊 MODEL CALIBRATION ANALYSIS")
    print("="*60)
    
    print(f"\n📈 Total settled trades analyzed: {total_trades}")
    print(f"🎯 Brier Score: {brier:.4f} (lower is better, 0=perfect)")
    print(f"📐 Expected Calibration Error (ECE): {ece:.4f}")
    print(f"💡 Confidence assessment: {confidence.upper()}")
    
    print("\n📊 Calibration Curve:")
    print("-"*60)
    print(f"{'Bucket':<12} {'Count':<8} {'Predicted':<12} {'Actual':<12} {'Gap':<10}")
    print("-"*60)
    
    for bucket in calibration:
        gap_str = f"{bucket['gap']:+.2%}"
        if bucket['gap'] > 0.05:
            gap_str += " 📈"  # Underconfident - actual > predicted
        elif bucket['gap'] < -0.05:
            gap_str += " 📉"  # Overconfident - actual < predicted
        else:
            gap_str += " ✅"  # Well calibrated
        
        print(f"{bucket['bucket']:<12} {bucket['count']:<8} "
              f"{bucket['predicted_prob']:.2%}{'':^5} {bucket['actual_rate']:.2%}{'':^5} {gap_str}")
    
    print("-"*60)
    
    # Interpretation
    print("\n📝 Interpretation:")
    if brier < 0.2:
        print("  ✅ Brier score is good (< 0.2)")
    elif brier < 0.3:
        print("  ⚠️ Brier score is mediocre (0.2-0.3)")
    else:
        print("  ❌ Brier score is poor (> 0.3)")
    
    if confidence == "overconfident":
        print("  📉 Model is OVERCONFIDENT - predicts higher win rates than actual")
        print("     → Consider: increase edge thresholds, reduce position sizes")
    elif confidence == "underconfident":
        print("  📈 Model is UNDERCONFIDENT - actual wins exceed predictions")
        print("     → Consider: may be leaving money on table, could be more aggressive")
    else:
        print("  ✅ Model confidence is well balanced")
    
    # Recommendations based on bucket analysis
    high_prob_buckets = [b for b in calibration if int(b['bucket'].split('-')[0]) >= 60]
    if high_prob_buckets:
        high_prob_performance = sum(b['wins'] for b in high_prob_buckets) / max(1, sum(b['count'] for b in high_prob_buckets))
        high_prob_predicted = sum(b['predicted_prob'] * b['count'] for b in high_prob_buckets) / max(1, sum(b['count'] for b in high_prob_buckets))
        print(f"\n  🎯 High-probability trades (60%+):")
        print(f"     Predicted: {high_prob_predicted:.1%}, Actual: {high_prob_performance:.1%}")


def main():
    parser = argparse.ArgumentParser(description="Analyze model probability calibration")
    parser.add_argument("--buckets", type=int, default=5, help="Number of probability buckets (default: 5)")
    parser.add_argument("--verbose", "-v", action="store_true", help="Show detailed output")
    parser.add_argument("--json", action="store_true", help="Output JSON only")
    args = parser.parse_args()
    
    # Load trades
    trades = load_all_trades()
    print(f"Loaded {len(trades)} total entries from trade files")
    
    # Filter to settled trades with probability data
    settled = filter_settled_trades_with_prob(trades)
    print(f"Found {len(settled)} settled trades with our_prob data")
    
    if len(settled) < 10:
        print("⚠️ Not enough settled trades for meaningful calibration analysis")
        print("   Need at least 10 trades with our_prob and result_status")
        return
    
    # Calculate metrics
    calibration = calculate_calibration(settled, args.buckets)
    brier = calculate_brier_score(settled)
    ece = calculate_ece(calibration)
    confidence = assess_confidence(calibration)
    
    # Build output
    output = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "total_trades": len(settled),
        "metrics": {
            "brier_score": brier,
            "expected_calibration_error": ece,
            "confidence_assessment": confidence,
        },
        "calibration_curve": calibration,
        "interpretation": {
            "brier_quality": "good" if brier < 0.2 else "mediocre" if brier < 0.3 else "poor",
        },
    }
    
    # Save output
    os.makedirs(DATA_DIR, exist_ok=True)
    with open(OUTPUT_FILE, "w") as f:
        json.dump(output, f, indent=2)
    print(f"\n💾 Saved calibration analysis to {OUTPUT_FILE}")
    
    # Print report
    if not args.json:
        print_calibration_report(calibration, brier, ece, confidence, len(settled), args.verbose)
    else:
        print(json.dumps(output, indent=2))


if __name__ == "__main__":
    main()
