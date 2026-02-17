#!/usr/bin/env python3
"""
API Call Counter - Tracks Kalshi/CoinGecko/etc API calls per hour
Helps debug rate limiting issues and monitor API usage.

Usage:
  python3 scripts/track-api-calls.py --status     # Show current hour stats
  python3 scripts/track-api-calls.py --summary    # Show last 24h summary
  python3 scripts/track-api-calls.py --reset      # Reset all counters
  
Called from autotrader with:
  track_api_call('kalshi', '/markets/KXBTCD')
"""

import json
import os
import sys
from datetime import datetime, timezone
from pathlib import Path
from collections import defaultdict

SCRIPT_DIR = Path(__file__).parent
API_CALLS_FILE = SCRIPT_DIR / "api-calls.jsonl"
API_STATS_FILE = SCRIPT_DIR.parent / "data" / "trading" / "api-call-stats.json"

# Rate limits (approximate)
RATE_LIMITS = {
    "kalshi": 100,       # per minute (varies by endpoint)
    "coingecko": 30,     # per minute (free tier)
    "binance": 1200,     # per minute
    "coinbase": 10,      # per second
    "fear_greed": 50,    # per minute (no strict limit)
}


def log_api_call(service: str, endpoint: str = "", status_code: int = 200):
    """Log an API call to the JSONL file."""
    entry = {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "service": service.lower(),
        "endpoint": endpoint,
        "status_code": status_code,
    }
    
    API_CALLS_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(API_CALLS_FILE, "a") as f:
        f.write(json.dumps(entry) + "\n")


def load_calls(hours: int = 24) -> list:
    """Load API calls from the last N hours."""
    if not API_CALLS_FILE.exists():
        return []
    
    cutoff = datetime.now(timezone.utc).timestamp() - (hours * 3600)
    calls = []
    
    with open(API_CALLS_FILE, "r") as f:
        for line in f:
            try:
                entry = json.loads(line.strip())
                ts = datetime.fromisoformat(entry["timestamp"].replace("Z", "+00:00"))
                if ts.timestamp() >= cutoff:
                    calls.append(entry)
            except (json.JSONDecodeError, KeyError, ValueError):
                continue
    
    return calls


def get_hourly_stats(calls: list) -> dict:
    """Group calls by service and hour."""
    stats = defaultdict(lambda: defaultdict(int))
    
    for call in calls:
        service = call.get("service", "unknown")
        ts = datetime.fromisoformat(call["timestamp"].replace("Z", "+00:00"))
        hour_key = ts.strftime("%Y-%m-%d %H:00")
        stats[service][hour_key] += 1
        
        # Track errors
        if call.get("status_code", 200) >= 400:
            stats[f"{service}_errors"][hour_key] += 1
    
    return stats


def get_current_hour_stats(calls: list) -> dict:
    """Get stats for the current hour only."""
    current_hour = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:00")
    stats = defaultdict(int)
    errors = defaultdict(int)
    
    for call in calls:
        ts = datetime.fromisoformat(call["timestamp"].replace("Z", "+00:00"))
        if ts.strftime("%Y-%m-%d %H:00") == current_hour:
            service = call.get("service", "unknown")
            stats[service] += 1
            if call.get("status_code", 200) >= 400:
                errors[service] += 1
    
    return {"calls": dict(stats), "errors": dict(errors), "hour": current_hour}


def print_status():
    """Print current hour API usage."""
    calls = load_calls(hours=1)
    stats = get_current_hour_stats(calls)
    
    print(f"\n📊 API Calls - Current Hour ({stats['hour']} UTC)")
    print("=" * 50)
    
    if not stats["calls"]:
        print("No API calls logged this hour.")
        return
    
    total = 0
    for service, count in sorted(stats["calls"].items()):
        limit = RATE_LIMITS.get(service, "?")
        errors = stats["errors"].get(service, 0)
        pct = f"({count/limit*100:.0f}%)" if isinstance(limit, int) else ""
        error_str = f" ⚠️ {errors} errors" if errors else ""
        print(f"  {service:12}: {count:4} calls {pct:>6}{error_str}")
        total += count
    
    print("-" * 50)
    print(f"  {'TOTAL':12}: {total:4} calls")
    
    # Warnings
    for service, count in stats["calls"].items():
        limit = RATE_LIMITS.get(service)
        if limit and count > limit * 0.8:
            print(f"\n⚠️  WARNING: {service} at {count/limit*100:.0f}% of rate limit!")


def print_summary():
    """Print 24h summary."""
    calls = load_calls(hours=24)
    stats = get_hourly_stats(calls)
    
    print("\n📈 API Calls - Last 24 Hours Summary")
    print("=" * 50)
    
    if not calls:
        print("No API calls logged in the last 24 hours.")
        return
    
    # Aggregate by service
    totals = defaultdict(int)
    errors = defaultdict(int)
    
    for call in calls:
        service = call.get("service", "unknown")
        totals[service] += 1
        if call.get("status_code", 200) >= 400:
            errors[service] += 1
    
    for service, count in sorted(totals.items()):
        err_count = errors.get(service, 0)
        err_str = f" ({err_count} errors)" if err_count else ""
        per_hour = count / 24
        print(f"  {service:12}: {count:5} total ({per_hour:.1f}/hr){err_str}")
    
    print("-" * 50)
    print(f"  {'TOTAL':12}: {sum(totals.values()):5} calls")
    
    # Peak hour
    all_hours = defaultdict(int)
    for call in calls:
        ts = datetime.fromisoformat(call["timestamp"].replace("Z", "+00:00"))
        hour_key = ts.strftime("%Y-%m-%d %H:00")
        all_hours[hour_key] += 1
    
    if all_hours:
        peak_hour = max(all_hours.items(), key=lambda x: x[1])
        print(f"\n📍 Peak hour: {peak_hour[0]} UTC ({peak_hour[1]} calls)")


def reset_counters():
    """Reset all counters (archive old data)."""
    if API_CALLS_FILE.exists():
        archive_name = API_CALLS_FILE.with_suffix(f".{datetime.now().strftime('%Y%m%d%H%M%S')}.bak")
        API_CALLS_FILE.rename(archive_name)
        print(f"✅ Archived old data to {archive_name.name}")
    print("✅ Counters reset")


def save_stats_json():
    """Save current stats to JSON for API consumption."""
    calls = load_calls(hours=24)
    current = get_current_hour_stats(calls)
    hourly = get_hourly_stats(calls)
    
    # Calculate totals
    totals = defaultdict(int)
    for call in calls:
        totals[call.get("service", "unknown")] += 1
    
    stats = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "current_hour": current,
        "last_24h_totals": dict(totals),
        "rate_limits": RATE_LIMITS,
    }
    
    API_STATS_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(API_STATS_FILE, "w") as f:
        json.dump(stats, f, indent=2)
    
    return stats


def main():
    args = sys.argv[1:]
    
    if "--reset" in args:
        reset_counters()
    elif "--summary" in args:
        print_summary()
        save_stats_json()
    elif "--log" in args:
        # Log a call: --log kalshi /markets
        idx = args.index("--log")
        service = args[idx + 1] if len(args) > idx + 1 else "unknown"
        endpoint = args[idx + 2] if len(args) > idx + 2 else ""
        log_api_call(service, endpoint)
        print(f"✅ Logged {service} call")
    else:
        print_status()
        save_stats_json()


if __name__ == "__main__":
    main()
