#!/usr/bin/env python3
"""
Analyze trade latency from autotrader logs.
Shows latency distribution, percentiles, and trends.
"""

import json
from pathlib import Path
from datetime import datetime

TRADE_LOG = Path(__file__).parent / "kalshi-trades-v2.jsonl"


def main():
    if not TRADE_LOG.exists():
        print("No trade log found")
        return
    
    latencies = []
    
    with open(TRADE_LOG) as f:
        for line in f:
            try:
                entry = json.loads(line.strip())
                if entry.get("type") == "trade" and "latency_ms" in entry:
                    latencies.append({
                        "timestamp": entry.get("timestamp", ""),
                        "latency_ms": entry["latency_ms"],
                        "ticker": entry.get("ticker", ""),
                        "asset": entry.get("asset", "btc")
                    })
            except:
                continue
    
    if not latencies:
        print("📊 Trade Latency Analysis")
        print("=" * 40)
        print("No trades with latency data found yet.")
        print("(Latency tracking added 2026-01-28)")
        return
    
    # Sort by latency for percentiles
    sorted_latencies = sorted([l["latency_ms"] for l in latencies])
    n = len(sorted_latencies)
    
    avg = sum(sorted_latencies) / n
    p50 = sorted_latencies[int(n * 0.5)]
    p95 = sorted_latencies[int(n * 0.95)] if n >= 20 else sorted_latencies[-1]
    p99 = sorted_latencies[int(n * 0.99)] if n >= 100 else sorted_latencies[-1]
    min_lat = sorted_latencies[0]
    max_lat = sorted_latencies[-1]
    
    print("📊 Trade Latency Analysis")
    print("=" * 40)
    print(f"Trades analyzed: {n}")
    print()
    print("Latency Stats (ms):")
    print(f"  Min:   {min_lat}ms")
    print(f"  Avg:   {avg:.0f}ms")
    print(f"  P50:   {p50}ms")
    print(f"  P95:   {p95}ms")
    print(f"  P99:   {p99}ms")
    print(f"  Max:   {max_lat}ms")
    print()
    
    # Breakdown by asset
    by_asset = {}
    for l in latencies:
        asset = l["asset"]
        if asset not in by_asset:
            by_asset[asset] = []
        by_asset[asset].append(l["latency_ms"])
    
    if len(by_asset) > 1:
        print("By Asset:")
        for asset, lats in sorted(by_asset.items()):
            avg_lat = sum(lats) / len(lats)
            print(f"  {asset.upper()}: {len(lats)} trades, avg {avg_lat:.0f}ms")
        print()
    
    # Distribution
    print("Distribution:")
    buckets = [(0, 100), (100, 250), (250, 500), (500, 1000), (1000, float('inf'))]
    labels = ["<100ms", "100-250ms", "250-500ms", "500ms-1s", ">1s"]
    
    for (low, high), label in zip(buckets, labels):
        count = sum(1 for l in sorted_latencies if low <= l < high)
        pct = count / n * 100
        bar = "█" * int(pct / 2)
        print(f"  {label:10s} {count:3d} ({pct:5.1f}%) {bar}")
    
    # Recent trades
    print()
    print("Last 5 trades:")
    recent = latencies[-5:]
    for l in recent:
        ts = l["timestamp"][:19].replace("T", " ")
        print(f"  {ts} | {l['asset'].upper()} | {l['latency_ms']}ms")


if __name__ == "__main__":
    main()
