#!/usr/bin/env python3
"""
Analyze BTC/ETH price correlation over time.
Tracks correlation coefficient and detects divergence events.

Usage:
  python3 scripts/analyze-asset-correlation.py [--window 7] [--threshold 0.7]

Output:
  data/trading/asset-correlation.json
"""

import json
import os
import sys
from datetime import datetime, timezone
from pathlib import Path
import math

# Paths
SCRIPT_DIR = Path(__file__).parent
PROJECT_DIR = SCRIPT_DIR.parent
OHLC_DIR = PROJECT_DIR / "data" / "ohlc"
OUTPUT_DIR = PROJECT_DIR / "data" / "trading"
OUTPUT_FILE = OUTPUT_DIR / "asset-correlation.json"

def load_ohlc(asset: str) -> list:
    """Load cached OHLC data for an asset."""
    filepath = OHLC_DIR / f"{asset.lower()}-ohlc.json"
    if not filepath.exists():
        print(f"❌ OHLC cache not found: {filepath}")
        return []
    
    with open(filepath) as f:
        data = json.load(f)
    
    return data.get("candles", [])

def calculate_returns(candles: list) -> list:
    """Calculate period-over-period returns from candles."""
    returns = []
    for i in range(1, len(candles)):
        prev_close = candles[i-1]["close"]
        curr_close = candles[i]["close"]
        ret = (curr_close - prev_close) / prev_close if prev_close else 0
        returns.append({
            "timestamp": candles[i]["timestamp"],
            "datetime": candles[i]["datetime"],
            "return": ret,
            "close": curr_close
        })
    return returns

def pearson_correlation(x: list, y: list) -> float:
    """Calculate Pearson correlation coefficient."""
    n = len(x)
    if n < 2:
        return 0.0
    
    mean_x = sum(x) / n
    mean_y = sum(y) / n
    
    numerator = sum((x[i] - mean_x) * (y[i] - mean_y) for i in range(n))
    
    std_x = math.sqrt(sum((xi - mean_x) ** 2 for xi in x))
    std_y = math.sqrt(sum((yi - mean_y) ** 2 for yi in y))
    
    if std_x == 0 or std_y == 0:
        return 0.0
    
    return numerator / (std_x * std_y)

def rolling_correlation(btc_returns: list, eth_returns: list, window: int) -> list:
    """Calculate rolling correlation with specified window (in candles)."""
    correlations = []
    
    # Align by timestamp
    btc_by_ts = {r["timestamp"]: r["return"] for r in btc_returns}
    eth_by_ts = {r["timestamp"]: r["return"] for r in eth_returns}
    
    common_ts = sorted(set(btc_by_ts.keys()) & set(eth_by_ts.keys()))
    
    for i in range(window, len(common_ts) + 1):
        window_ts = common_ts[i-window:i]
        btc_window = [btc_by_ts[ts] for ts in window_ts]
        eth_window = [eth_by_ts[ts] for ts in window_ts]
        
        corr = pearson_correlation(btc_window, eth_window)
        
        last_ts = window_ts[-1]
        correlations.append({
            "timestamp": last_ts,
            "datetime": datetime.fromtimestamp(last_ts/1000, tz=timezone.utc).isoformat(),
            "correlation": round(corr, 4),
            "window_candles": window
        })
    
    return correlations

def detect_divergences(correlations: list, threshold: float) -> list:
    """Detect periods where correlation breaks down (below threshold)."""
    divergences = []
    in_divergence = False
    divergence_start = None
    
    for c in correlations:
        if c["correlation"] < threshold:
            if not in_divergence:
                in_divergence = True
                divergence_start = c
        else:
            if in_divergence:
                divergences.append({
                    "start": divergence_start["datetime"],
                    "end": c["datetime"],
                    "min_correlation": min(
                        x["correlation"] for x in correlations 
                        if divergence_start["timestamp"] <= x["timestamp"] <= c["timestamp"]
                    ),
                    "type": "decorrelation_event"
                })
                in_divergence = False
    
    # Handle ongoing divergence
    if in_divergence:
        divergences.append({
            "start": divergence_start["datetime"],
            "end": "ongoing",
            "min_correlation": min(
                x["correlation"] for x in correlations 
                if x["timestamp"] >= divergence_start["timestamp"]
            ),
            "type": "decorrelation_event"
        })
    
    return divergences

def analyze_correlation_stats(correlations: list) -> dict:
    """Calculate summary statistics for correlations."""
    if not correlations:
        return {}
    
    corr_values = [c["correlation"] for c in correlations]
    
    return {
        "mean": round(sum(corr_values) / len(corr_values), 4),
        "min": round(min(corr_values), 4),
        "max": round(max(corr_values), 4),
        "std_dev": round(
            math.sqrt(sum((x - sum(corr_values)/len(corr_values))**2 for x in corr_values) / len(corr_values)), 
            4
        ),
        "current": correlations[-1]["correlation"] if correlations else None,
        "samples": len(correlations)
    }

def generate_insights(stats: dict, divergences: list, threshold: float) -> list:
    """Generate actionable insights from correlation analysis."""
    insights = []
    
    current = stats.get("current", 0)
    mean = stats.get("mean", 0)
    
    # Current correlation status
    if current >= 0.9:
        insights.append("🔗 BTC and ETH highly correlated (>0.9). They move almost identically.")
    elif current >= 0.7:
        insights.append("📊 BTC/ETH correlation normal (0.7-0.9). Typical market behavior.")
    elif current >= 0.5:
        insights.append("⚠️ BTC/ETH correlation weakening (0.5-0.7). Some divergence occurring.")
    else:
        insights.append("🚨 BTC/ETH LOW correlation (<0.5). Major divergence - may indicate liquidations or isolated news.")
    
    # Divergence events
    if divergences:
        recent_divs = [d for d in divergences if d["end"] == "ongoing" or d["end"] > datetime.now(timezone.utc).isoformat()[:10]]
        if recent_divs:
            insights.append(f"⚡ {len(recent_divs)} active/recent divergence event(s). Consider asset-specific analysis.")
    
    # Compare to mean
    if current < mean - 0.15:
        insights.append("📉 Current correlation BELOW historical average. Market may be in unusual state.")
    elif current > mean + 0.1:
        insights.append("📈 Current correlation ABOVE historical average. Strong co-movement.")
    
    # Trading implications
    if current < threshold:
        insights.append("💡 Low correlation = opportunity for asset-specific edge. Don't assume BTC signal applies to ETH.")
    else:
        insights.append("💡 High correlation = treat BTC/ETH similarly. Momentum signals likely apply to both.")
    
    return insights

def main():
    import argparse
    
    parser = argparse.ArgumentParser(description="Analyze BTC/ETH correlation")
    parser.add_argument("--window", type=int, default=42, help="Rolling window in candles (default: 42 = 7 days at 4h candles)")
    parser.add_argument("--threshold", type=float, default=0.7, help="Correlation threshold for divergence detection")
    parser.add_argument("--json", action="store_true", help="Output raw JSON only")
    args = parser.parse_args()
    
    # Load data
    btc_candles = load_ohlc("btc")
    eth_candles = load_ohlc("eth")
    
    if not btc_candles or not eth_candles:
        print("❌ Missing OHLC data. Run cache-ohlc-data.py first.")
        sys.exit(1)
    
    # Calculate returns
    btc_returns = calculate_returns(btc_candles)
    eth_returns = calculate_returns(eth_candles)
    
    # Rolling correlations at multiple windows
    windows = {
        "7d": 42,   # 7 days * 6 candles/day (4h candles)
        "14d": 84,
        "30d": 180
    }
    
    all_correlations = {}
    for label, window in windows.items():
        if len(btc_returns) >= window:
            all_correlations[label] = rolling_correlation(btc_returns, eth_returns, window)
    
    # Use main window for divergence detection
    main_window = args.window
    main_correlations = rolling_correlation(btc_returns, eth_returns, main_window)
    
    # Detect divergences
    divergences = detect_divergences(main_correlations, args.threshold)
    
    # Stats for each window
    stats = {}
    for label, corrs in all_correlations.items():
        stats[label] = analyze_correlation_stats(corrs)
    
    # Current values
    current_stats = analyze_correlation_stats(main_correlations)
    
    # Insights
    insights = generate_insights(current_stats, divergences, args.threshold)
    
    # Build output
    result = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "btc_candles": len(btc_candles),
        "eth_candles": len(eth_candles),
        "analysis_window": f"{main_window} candles (~{main_window * 4}h)",
        "divergence_threshold": args.threshold,
        "current_correlation": current_stats.get("current"),
        "stats_by_window": stats,
        "divergence_events": divergences,
        "recent_correlations": main_correlations[-10:] if main_correlations else [],
        "insights": insights
    }
    
    # Save output
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    with open(OUTPUT_FILE, "w") as f:
        json.dump(result, f, indent=2)
    
    if args.json:
        print(json.dumps(result, indent=2))
        return
    
    # Pretty print
    print("\n" + "="*60)
    print("📊 BTC/ETH CORRELATION ANALYSIS")
    print("="*60)
    
    print(f"\n📅 Data: {len(btc_candles)} BTC candles, {len(eth_candles)} ETH candles")
    print(f"🔍 Window: {main_window} candles (~{main_window * 4}h)")
    print(f"📍 Divergence threshold: {args.threshold}")
    
    print("\n" + "-"*40)
    print("CURRENT CORRELATION")
    print("-"*40)
    
    current = current_stats.get("current", 0)
    corr_bar = "█" * int(abs(current) * 20) + "░" * (20 - int(abs(current) * 20))
    sign = "+" if current >= 0 else ""
    print(f"  [{corr_bar}] {sign}{current:.3f}")
    
    if current >= 0.9:
        print("  Status: 🔗 HIGHLY CORRELATED")
    elif current >= 0.7:
        print("  Status: 📊 NORMAL")
    elif current >= 0.5:
        print("  Status: ⚠️ WEAKENING")
    else:
        print("  Status: 🚨 DIVERGING")
    
    print("\n" + "-"*40)
    print("STATS BY WINDOW")
    print("-"*40)
    
    for label, s in stats.items():
        print(f"\n  {label}:")
        print(f"    Mean: {s['mean']:.3f}, Min: {s['min']:.3f}, Max: {s['max']:.3f}")
        print(f"    Std Dev: {s['std_dev']:.3f}, Current: {s['current']:.3f}")
    
    if divergences:
        print("\n" + "-"*40)
        print(f"DIVERGENCE EVENTS ({len(divergences)})")
        print("-"*40)
        
        for i, d in enumerate(divergences[-5:], 1):  # Show last 5
            print(f"\n  #{i}: {d['start'][:10]} → {d['end'][:10] if d['end'] != 'ongoing' else 'ONGOING'}")
            print(f"      Min correlation: {d['min_correlation']:.3f}")
    
    print("\n" + "-"*40)
    print("INSIGHTS")
    print("-"*40)
    for insight in insights:
        print(f"  {insight}")
    
    print(f"\n📁 Full analysis saved to: {OUTPUT_FILE}")
    print("="*60 + "\n")

if __name__ == "__main__":
    main()
