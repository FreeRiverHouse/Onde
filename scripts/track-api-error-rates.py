#!/usr/bin/env python3
"""
Track API error rates per source (T413)
Logs success/failure for each API call and provides reliability metrics.
Usage:
  python3 scripts/track-api-error-rates.py --status     # Show current stats
  python3 scripts/track-api-error-rates.py --report     # Weekly report format
  python3 scripts/track-api-error-rates.py --reset      # Clear error log
"""

import json
import os
from datetime import datetime, timedelta
from pathlib import Path
from collections import defaultdict
import argparse

SCRIPT_DIR = Path(__file__).parent
ERROR_LOG = SCRIPT_DIR / "api-error-log.jsonl"
STATS_FILE = SCRIPT_DIR.parent / "data" / "trading" / "api-error-stats.json"

# Ensure data directory exists
STATS_FILE.parent.mkdir(parents=True, exist_ok=True)

def log_api_call(source: str, success: bool, endpoint: str = "", error_msg: str = ""):
    """Log an API call result. Call this from autotrader or other scripts."""
    entry = {
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "source": source,
        "success": success,
        "endpoint": endpoint,
        "error": error_msg if not success else ""
    }
    with open(ERROR_LOG, "a") as f:
        f.write(json.dumps(entry) + "\n")

def load_logs(days: int = 7) -> list:
    """Load API logs from the past N days."""
    if not ERROR_LOG.exists():
        return []
    
    cutoff = datetime.utcnow() - timedelta(days=days)
    logs = []
    
    with open(ERROR_LOG) as f:
        for line in f:
            try:
                entry = json.loads(line.strip())
                ts = datetime.fromisoformat(entry["timestamp"].replace("Z", "+00:00"))
                if ts.replace(tzinfo=None) >= cutoff:
                    logs.append(entry)
            except (json.JSONDecodeError, KeyError):
                continue
    
    return logs

def calculate_stats(logs: list) -> dict:
    """Calculate error rates per source."""
    stats = defaultdict(lambda: {"total": 0, "success": 0, "errors": 0, "error_types": defaultdict(int)})
    
    for log in logs:
        source = log["source"]
        stats[source]["total"] += 1
        if log["success"]:
            stats[source]["success"] += 1
        else:
            stats[source]["errors"] += 1
            error_type = log.get("error", "unknown")[:50]  # Truncate long errors
            stats[source]["error_types"][error_type] += 1
    
    # Calculate percentages
    result = {}
    for source, data in stats.items():
        total = data["total"]
        success_rate = (data["success"] / total * 100) if total > 0 else 0
        error_rate = (data["errors"] / total * 100) if total > 0 else 0
        
        result[source] = {
            "total_calls": total,
            "successful": data["success"],
            "errors": data["errors"],
            "success_rate": round(success_rate, 2),
            "error_rate": round(error_rate, 2),
            "top_errors": dict(sorted(data["error_types"].items(), key=lambda x: -x[1])[:5])
        }
    
    return result

def show_status():
    """Print current error rate status."""
    logs = load_logs(days=7)
    stats = calculate_stats(logs)
    
    print("\n📊 API Error Rates (Last 7 Days)")
    print("=" * 60)
    
    if not stats:
        print("  No API logs found. Run autotrader to generate data.")
        return
    
    # Sort by error rate (worst first)
    sorted_sources = sorted(stats.items(), key=lambda x: -x[1]["error_rate"])
    
    for source, data in sorted_sources:
        success_rate = data["success_rate"]
        if success_rate >= 99:
            status = "🟢"
        elif success_rate >= 95:
            status = "🟡"
        else:
            status = "🔴"
        
        print(f"\n{status} {source}")
        print(f"   Calls: {data['total_calls']} | Success: {data['success_rate']}% | Errors: {data['errors']}")
        
        if data["top_errors"]:
            print(f"   Top errors:")
            for err, count in list(data["top_errors"].items())[:3]:
                print(f"      - {err}: {count}")
    
    # Save stats
    stats["_generated"] = datetime.utcnow().isoformat() + "Z"
    with open(STATS_FILE, "w") as f:
        json.dump(stats, f, indent=2)
    
    print(f"\n📁 Stats saved to {STATS_FILE}")

def show_report():
    """Print weekly report format."""
    logs = load_logs(days=7)
    stats = calculate_stats(logs)
    
    print("\n📋 Weekly API Reliability Report")
    print("=" * 60)
    print(f"Period: Last 7 days | Generated: {datetime.utcnow().strftime('%Y-%m-%d %H:%M')} UTC")
    print()
    
    if not stats:
        print("No API activity recorded.")
        return
    
    # Overall stats
    total_calls = sum(s["total_calls"] for s in stats.values())
    total_errors = sum(s["errors"] for s in stats.values())
    overall_success = ((total_calls - total_errors) / total_calls * 100) if total_calls > 0 else 0
    
    print(f"📈 Overall: {total_calls} calls | {overall_success:.1f}% success rate")
    print()
    
    # Per-source breakdown
    print("Source Breakdown:")
    for source, data in sorted(stats.items()):
        if source.startswith("_"):
            continue
        bar_len = int(data["success_rate"] / 5)  # 20 char max
        bar = "█" * bar_len + "░" * (20 - bar_len)
        print(f"  {source:15} {bar} {data['success_rate']:5.1f}%")
    
    # Recommendations
    print("\n💡 Recommendations:")
    problem_sources = [s for s, d in stats.items() if not s.startswith("_") and d["error_rate"] > 5]
    if problem_sources:
        for source in problem_sources:
            print(f"  ⚠️  {source}: Consider adding fallback or retry logic")
    else:
        print("  ✅ All sources within acceptable error thresholds")

def reset_logs():
    """Clear error logs."""
    if ERROR_LOG.exists():
        ERROR_LOG.unlink()
        print("✅ Error log cleared")
    else:
        print("ℹ️  No log file to clear")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Track API error rates per source")
    parser.add_argument("--status", action="store_true", help="Show current stats")
    parser.add_argument("--report", action="store_true", help="Weekly report format")
    parser.add_argument("--reset", action="store_true", help="Clear error log")
    args = parser.parse_args()
    
    if args.reset:
        reset_logs()
    elif args.report:
        show_report()
    else:
        show_status()
