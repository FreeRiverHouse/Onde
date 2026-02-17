#!/usr/bin/env python3
"""
Analyze API Rate Limit Usage (T308)

Reads kalshi-api-rate-log.jsonl and generates reports:
- Average usage per API source
- Peak usage times
- Trend analysis

Usage: python3 scripts/analyze-api-rate-limits.py [--days N]
"""

import json
import argparse
from datetime import datetime, timezone, timedelta
from collections import defaultdict
from pathlib import Path

RATE_LOG_FILE = "scripts/kalshi-api-rate-log.jsonl"


def load_rate_logs(days: int = 7) -> list:
    """Load rate limit log entries from the last N days."""
    log_path = Path(RATE_LOG_FILE)
    if not log_path.exists():
        return []
    
    cutoff = datetime.now(timezone.utc) - timedelta(days=days)
    entries = []
    
    with open(log_path) as f:
        for line in f:
            if not line.strip():
                continue
            try:
                entry = json.loads(line)
                ts = datetime.fromisoformat(entry["timestamp"].replace("Z", "+00:00"))
                if ts >= cutoff:
                    entries.append(entry)
            except (json.JSONDecodeError, KeyError):
                continue
    
    return entries


def analyze_usage(entries: list) -> dict:
    """Analyze API usage patterns."""
    if not entries:
        return {"error": "No data"}
    
    # Aggregate stats per source
    source_stats = defaultdict(lambda: {
        "total_calls": 0,
        "peak_calls": 0,
        "peak_usage_pct": 0,
        "samples": 0,
        "peak_time": None
    })
    
    # Hourly distribution
    hourly_usage = defaultdict(lambda: defaultdict(int))
    
    for entry in entries:
        ts = datetime.fromisoformat(entry["timestamp"].replace("Z", "+00:00"))
        hour = ts.hour
        
        for source, data in entry.get("sources", {}).items():
            calls = data.get("calls", 0)
            usage_pct = data.get("usage_pct", 0)
            
            stats = source_stats[source]
            stats["total_calls"] += calls
            stats["samples"] += 1
            
            if calls > stats["peak_calls"]:
                stats["peak_calls"] = calls
                stats["peak_time"] = ts.isoformat()
            
            if usage_pct > stats["peak_usage_pct"]:
                stats["peak_usage_pct"] = usage_pct
            
            hourly_usage[source][hour] += calls
    
    # Calculate averages
    for source, stats in source_stats.items():
        if stats["samples"] > 0:
            stats["avg_calls"] = round(stats["total_calls"] / stats["samples"], 1)
    
    # Find peak hours
    peak_hours = {}
    for source, hours in hourly_usage.items():
        if hours:
            peak_hour = max(hours.keys(), key=lambda h: hours[h])
            peak_hours[source] = {"hour": peak_hour, "calls": hours[peak_hour]}
    
    return {
        "period_days": (entries[-1]["timestamp"][:10] if entries else "N/A") + " to " + (entries[0]["timestamp"][:10] if entries else "N/A"),
        "total_samples": len(entries),
        "source_stats": dict(source_stats),
        "peak_hours": peak_hours
    }


def print_report(analysis: dict):
    """Print formatted report."""
    if "error" in analysis:
        print(f"❌ {analysis['error']}")
        return
    
    print("📊 API RATE LIMIT ANALYSIS")
    print("=" * 60)
    print(f"Period: {analysis['period_days']}")
    print(f"Total Samples: {analysis['total_samples']}")
    print()
    
    print("📈 USAGE BY SOURCE:")
    print("-" * 60)
    print(f"{'Source':<15} {'Avg Calls':>10} {'Peak Calls':>12} {'Peak %':>8}")
    print("-" * 60)
    
    for source, stats in analysis["source_stats"].items():
        avg = stats.get("avg_calls", 0)
        peak = stats.get("peak_calls", 0)
        peak_pct = stats.get("peak_usage_pct", 0)
        print(f"{source:<15} {avg:>10.1f} {peak:>12} {peak_pct:>7.1f}%")
    
    print()
    print("⏰ PEAK HOURS:")
    print("-" * 60)
    for source, data in analysis.get("peak_hours", {}).items():
        print(f"  {source}: {data['hour']:02d}:00 UTC ({data['calls']} calls)")
    
    # Warnings
    print()
    print("⚠️ WARNINGS:")
    warnings_found = False
    for source, stats in analysis["source_stats"].items():
        if stats.get("peak_usage_pct", 0) >= 80:
            print(f"  🔴 {source}: Peak usage {stats['peak_usage_pct']:.1f}% (>80% threshold)")
            warnings_found = True
        elif stats.get("peak_usage_pct", 0) >= 50:
            print(f"  🟡 {source}: Peak usage {stats['peak_usage_pct']:.1f}% (>50%)")
            warnings_found = True
    
    if not warnings_found:
        print("  🟢 All sources within normal limits")


def main():
    parser = argparse.ArgumentParser(description="Analyze API rate limit usage")
    parser.add_argument("--days", type=int, default=7, help="Number of days to analyze")
    args = parser.parse_args()
    
    entries = load_rate_logs(args.days)
    analysis = analyze_usage(entries)
    print_report(analysis)
    
    # Save to JSON
    output_file = f"data/trading/rate-limit-analysis.json"
    Path("data/trading").mkdir(parents=True, exist_ok=True)
    with open(output_file, "w") as f:
        json.dump(analysis, f, indent=2, default=str)
    print(f"\n💾 Saved to {output_file}")


if __name__ == "__main__":
    main()
