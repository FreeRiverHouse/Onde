#!/usr/bin/env python3
"""
Compute latency trend data from trade logs.
Groups trades by day and calculates avg/p95/min/max latency per day.
Outputs JSON for dashboard consumption.

Usage:
    python3 scripts/compute-latency-trend.py [--days 14] [--output path]
"""

import json
import argparse
from pathlib import Path
from datetime import datetime, timedelta, timezone
from collections import defaultdict
import math

TRADE_LOG_V2 = Path(__file__).parent / "kalshi-trades-v2.jsonl"
OUTPUT_DIR = Path(__file__).parent.parent / "data" / "trading"


def percentile(data: list, p: float) -> float:
    """Calculate the p-th percentile of a sorted list."""
    if not data:
        return 0
    k = (len(data) - 1) * p / 100
    f = math.floor(k)
    c = math.ceil(k)
    if f == c:
        return data[int(k)]
    return data[f] * (c - k) + data[c] * (k - f)


def load_trades_with_latency(days: int = 14) -> list:
    """Load trades with latency data from the last N days."""
    trades = []
    cutoff = datetime.now(timezone.utc) - timedelta(days=days)
    
    if not TRADE_LOG_V2.exists():
        return trades
    
    with open(TRADE_LOG_V2) as f:
        for line in f:
            try:
                entry = json.loads(line.strip())
                if entry.get("type") != "trade":
                    continue
                if "latency_ms" not in entry:
                    continue
                
                ts_str = entry.get("timestamp", "")
                if not ts_str:
                    continue
                    
                # Parse timestamp
                try:
                    if "T" in ts_str:
                        ts = datetime.fromisoformat(ts_str.replace("Z", "+00:00"))
                    else:
                        ts = datetime.strptime(ts_str, "%Y-%m-%d %H:%M:%S")
                except:
                    continue
                
                if ts.replace(tzinfo=None) < cutoff:
                    continue
                
                trades.append({
                    "timestamp": ts,
                    "latency_ms": entry["latency_ms"],
                    "ticker": entry.get("ticker", ""),
                    "asset": entry.get("asset", "btc")
                })
            except json.JSONDecodeError:
                continue
    
    return trades


def compute_daily_stats(trades: list) -> list:
    """Group trades by day and compute latency stats."""
    by_day = defaultdict(list)
    
    for trade in trades:
        day_key = trade["timestamp"].strftime("%Y-%m-%d")
        by_day[day_key].append(trade["latency_ms"])
    
    results = []
    for day in sorted(by_day.keys()):
        latencies = sorted(by_day[day])
        n = len(latencies)
        
        if n == 0:
            continue
        
        results.append({
            "timestamp": f"{day}T12:00:00Z",  # Midday for display
            "avgMs": round(sum(latencies) / n),
            "p95Ms": round(percentile(latencies, 95)),
            "minMs": latencies[0],
            "maxMs": latencies[-1],
            "count": n
        })
    
    return results


def main():
    parser = argparse.ArgumentParser(description="Compute latency trend from trade logs")
    parser.add_argument("--days", type=int, default=14, help="Days to analyze (default: 14)")
    parser.add_argument("--output", type=str, help="Output JSON path")
    args = parser.parse_args()
    
    trades = load_trades_with_latency(args.days)
    
    if not trades:
        print("📊 Latency Trend Computation")
        print("=" * 40)
        print("No trades with latency data found.")
        print(f"(Looking in: {TRADE_LOG_V2})")
        
        # Write empty result
        result = {
            "trend": [],
            "totalTrades": 0,
            "message": "No trades with latency data yet",
            "generatedAt": datetime.now(timezone.utc).isoformat().replace('+00:00', 'Z')
        }
    else:
        daily_stats = compute_daily_stats(trades)
        
        # Calculate overall stats
        all_latencies = [t["latency_ms"] for t in trades]
        all_latencies_sorted = sorted(all_latencies)
        n = len(all_latencies)
        
        overall = {
            "avgMs": round(sum(all_latencies) / n),
            "p95Ms": round(percentile(all_latencies_sorted, 95)),
            "minMs": all_latencies_sorted[0],
            "maxMs": all_latencies_sorted[-1],
            "count": n
        }
        
        result = {
            "trend": daily_stats,
            "overall": overall,
            "totalTrades": n,
            "daysAnalyzed": args.days,
            "generatedAt": datetime.now(timezone.utc).isoformat().replace('+00:00', 'Z')
        }
        
        print("📊 Latency Trend Computation")
        print("=" * 40)
        print(f"Trades analyzed: {n}")
        print(f"Days with data: {len(daily_stats)}")
        print()
        print("Overall Stats:")
        print(f"  Avg:  {overall['avgMs']}ms")
        print(f"  P95:  {overall['p95Ms']}ms")
        print(f"  Min:  {overall['minMs']}ms")
        print(f"  Max:  {overall['maxMs']}ms")
    
    # Ensure output directory exists
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    
    # Write output
    output_path = args.output or str(OUTPUT_DIR / "latency-trend.json")
    with open(output_path, "w") as f:
        json.dump(result, f, indent=2)
    
    print()
    print(f"✅ Output written to: {output_path}")


if __name__ == "__main__":
    main()
