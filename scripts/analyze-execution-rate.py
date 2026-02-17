#!/usr/bin/env python3
"""
Analyze trade execution success rate from autotrader logs.

Tracks:
- Successful order placements
- Failed orders (rejections, errors)
- Retry counts
- Success rate over time

Usage:
    python3 analyze-execution-rate.py [--v2] [--days N]
"""

import json
import os
from datetime import datetime, timezone, timedelta
from collections import defaultdict
import argparse

TRADES_V1 = os.path.expanduser("~/Projects/Onde/scripts/kalshi-trades.jsonl")
TRADES_V2 = os.path.expanduser("~/Projects/Onde/scripts/kalshi-trades-v2.jsonl")
EXECUTION_LOG = os.path.expanduser("~/Projects/Onde/scripts/kalshi-execution-log.jsonl")
OUTPUT_FILE = os.path.expanduser("~/Projects/Onde/data/trading/execution-rate-stats.json")


def load_trades(filepath, days=None):
    """Load trades from JSONL file."""
    trades = []
    if not os.path.exists(filepath):
        return trades
    
    cutoff = None
    if days:
        cutoff = datetime.now(timezone.utc) - timedelta(days=days)
    
    with open(filepath, 'r') as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            try:
                trade = json.loads(line)
                ts = trade.get("timestamp", trade.get("time", ""))
                if ts and cutoff:
                    try:
                        trade_time = datetime.fromisoformat(ts.replace('Z', '+00:00'))
                        if trade_time < cutoff:
                            continue
                    except:
                        pass
                trades.append(trade)
            except json.JSONDecodeError:
                continue
    return trades


def load_execution_log():
    """Load execution log entries."""
    entries = []
    if not os.path.exists(EXECUTION_LOG):
        return entries
    
    with open(EXECUTION_LOG, 'r') as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            try:
                entries.append(json.loads(line))
            except json.JSONDecodeError:
                continue
    return entries


def analyze_from_trades(trades):
    """
    Analyze execution from trade logs.
    Assumes all logged trades were successful (logged after execution).
    Checks for latency and other indicators.
    """
    stats = {
        "total_trades": len(trades),
        "with_latency": 0,
        "latency_stats": {
            "min_ms": None,
            "max_ms": None,
            "avg_ms": None,
            "p50_ms": None,
            "p95_ms": None,
        },
        "by_asset": defaultdict(int),
        "by_side": defaultdict(int),
    }
    
    latencies = []
    for trade in trades:
        # Count by asset
        asset = trade.get("asset", "unknown")
        if "KXBTCD" in trade.get("ticker", "") or asset.upper() == "BTC":
            stats["by_asset"]["btc"] += 1
        elif "KXETHD" in trade.get("ticker", "") or asset.upper() == "ETH":
            stats["by_asset"]["eth"] += 1
        else:
            stats["by_asset"]["other"] += 1
        
        # Count by side
        side = trade.get("side", "unknown")
        stats["by_side"][side] += 1
        
        # Latency stats
        lat = trade.get("latency_ms")
        if lat is not None:
            stats["with_latency"] += 1
            latencies.append(lat)
    
    # Calculate latency stats
    if latencies:
        latencies.sort()
        stats["latency_stats"]["min_ms"] = min(latencies)
        stats["latency_stats"]["max_ms"] = max(latencies)
        stats["latency_stats"]["avg_ms"] = round(sum(latencies) / len(latencies), 1)
        stats["latency_stats"]["p50_ms"] = latencies[len(latencies) // 2]
        stats["latency_stats"]["p95_ms"] = latencies[int(len(latencies) * 0.95)] if len(latencies) >= 20 else latencies[-1]
    
    return stats


def analyze_execution_log(entries):
    """
    Analyze detailed execution log with success/failure tracking.
    """
    stats = {
        "total_attempts": len(entries),
        "successful": 0,
        "failed": 0,
        "retries": 0,
        "success_rate": 0,
        "by_status": defaultdict(int),
        "error_types": defaultdict(int),
        "by_hour": defaultdict(lambda: {"success": 0, "fail": 0}),
    }
    
    for entry in entries:
        status = entry.get("status", "unknown")
        stats["by_status"][status] += 1
        
        if status in ("executed", "success"):
            stats["successful"] += 1
        elif status in ("pending", "open"):
            pass  # Don't count as success or failure yet
        else:
            stats["failed"] += 1
            error = entry.get("error", "unknown")
            stats["error_types"][error] += 1
        
        retries = entry.get("retries", 0)
        stats["retries"] += retries
        
        # By hour
        ts = entry.get("timestamp", "")
        if ts:
            try:
                t = datetime.fromisoformat(ts.replace('Z', '+00:00'))
                hour = t.hour
                if status in ("executed", "success"):
                    stats["by_hour"][hour]["success"] += 1
                elif status not in ("pending", "open"):
                    stats["by_hour"][hour]["fail"] += 1
            except:
                pass
    
    if stats["successful"] + stats["failed"] > 0:
        stats["success_rate"] = round(stats["successful"] / (stats["successful"] + stats["failed"]) * 100, 1)
    
    return stats


def print_stats(stats, source="trades"):
    """Print formatted stats."""
    print(f"\n{'='*50}")
    print(f"📊 EXECUTION STATS (from {source})")
    print(f"{'='*50}")
    
    if source == "execution_log":
        print(f"\n📈 Overall:")
        print(f"   Total attempts: {stats['total_attempts']}")
        print(f"   Successful: {stats['successful']} ✅")
        print(f"   Failed: {stats['failed']} ❌")
        print(f"   Success rate: {stats['success_rate']}%")
        print(f"   Total retries: {stats['retries']}")
        
        if stats["error_types"]:
            print(f"\n❌ Error Types:")
            for error, count in sorted(stats["error_types"].items(), key=lambda x: -x[1]):
                print(f"   {error}: {count}")
        
        if stats["by_hour"]:
            print(f"\n⏰ By Hour (UTC):")
            for hour in sorted(stats["by_hour"].keys()):
                data = stats["by_hour"][hour]
                total = data["success"] + data["fail"]
                rate = data["success"] / total * 100 if total > 0 else 0
                print(f"   {hour:02d}:00 - {total} trades, {rate:.0f}% success")
    else:
        print(f"\n📈 Trades Analyzed: {stats['total_trades']}")
        print(f"   With latency data: {stats['with_latency']}")
        
        if stats["by_asset"]:
            print(f"\n💰 By Asset:")
            for asset, count in stats["by_asset"].items():
                print(f"   {asset.upper()}: {count}")
        
        if stats["by_side"]:
            print(f"\n📊 By Side:")
            for side, count in stats["by_side"].items():
                print(f"   {side.upper()}: {count}")
        
        lat = stats["latency_stats"]
        if lat["avg_ms"]:
            print(f"\n⏱️  Latency Stats:")
            print(f"   Min: {lat['min_ms']}ms")
            print(f"   Avg: {lat['avg_ms']}ms")
            print(f"   P50: {lat['p50_ms']}ms")
            print(f"   P95: {lat['p95_ms']}ms")
            print(f"   Max: {lat['max_ms']}ms")


def main():
    parser = argparse.ArgumentParser(description="Analyze trade execution success rate")
    parser.add_argument("--v2", action="store_true", help="Use v2 trades file")
    parser.add_argument("--days", type=int, help="Only analyze last N days")
    parser.add_argument("--json", action="store_true", help="Output JSON")
    args = parser.parse_args()
    
    # Load execution log if available
    exec_entries = load_execution_log()
    
    # Load trades
    trades_file = TRADES_V2 if args.v2 else TRADES_V1
    trades = load_trades(trades_file, args.days)
    
    results = {
        "analyzed_at": datetime.now(timezone.utc).isoformat(),
        "source": "v2" if args.v2 else "v1",
        "days_filter": args.days,
    }
    
    # Analyze from execution log if available
    if exec_entries:
        exec_stats = analyze_execution_log(exec_entries)
        results["execution_log"] = exec_stats
        if not args.json:
            print_stats(exec_stats, "execution_log")
    else:
        print("ℹ️  No execution log found (kalshi-execution-log.jsonl)")
        print("   Execution logging will be added by autotrader updates.")
    
    # Analyze from trades
    if trades:
        trade_stats = analyze_from_trades(trades)
        results["trades"] = trade_stats
        if not args.json:
            print_stats(trade_stats, "trades")
    else:
        print(f"ℹ️  No trades found in {trades_file}")
    
    # Summary
    if not args.json:
        print(f"\n{'='*50}")
        if trades:
            print(f"💡 All {len(trades)} logged trades were successfully executed")
            print(f"   (trades are only logged after successful execution)")
        if not exec_entries:
            print(f"\n📝 Note: For detailed success/failure tracking,")
            print(f"   execution logging has been added to autotrader-v2.")
    
    # Save results
    if results.get("execution_log") or results.get("trades"):
        os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)
        with open(OUTPUT_FILE, 'w') as f:
            json.dump(results, f, indent=2, default=str)
        if not args.json:
            print(f"\n💾 Results saved to {OUTPUT_FILE}")
    
    if args.json:
        print(json.dumps(results, indent=2, default=str))


if __name__ == "__main__":
    main()
