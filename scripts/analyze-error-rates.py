#!/usr/bin/env python3
"""
Autotrader Error Rate Tracking (T618)

Tracks API errors per hour from execution logs and price feed logs.
Alerts if error rate >10% in any hour.
"""

import json
import os
from datetime import datetime, timedelta, timezone
from collections import defaultdict
from pathlib import Path

# Paths
SCRIPT_DIR = Path(__file__).parent
EXECUTION_LOG = SCRIPT_DIR / "kalshi-execution-log.jsonl"
DATA_DIR = SCRIPT_DIR.parent / "data" / "trading"
OUTPUT_FILE = DATA_DIR / "error-rate-analysis.json"
ALERT_FILE = SCRIPT_DIR / "kalshi-api-error.alert"

# Thresholds
ERROR_RATE_THRESHOLD = 0.10  # 10%
ALERT_COOLDOWN_HOURS = 4


def load_execution_log():
    """Load execution log entries."""
    entries = []
    if not EXECUTION_LOG.exists():
        print(f"Execution log not found: {EXECUTION_LOG}")
        return entries
    
    with open(EXECUTION_LOG) as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            try:
                entry = json.loads(line)
                entries.append(entry)
            except json.JSONDecodeError:
                continue
    
    return entries


def analyze_hourly_errors(entries):
    """Analyze error rates by hour."""
    hourly_stats = defaultdict(lambda: {"total": 0, "errors": 0, "error_types": defaultdict(int)})
    
    for entry in entries:
        ts_str = entry.get("timestamp", "")
        status = entry.get("status", "")
        
        try:
            # Parse timestamp
            if "+" in ts_str:
                ts = datetime.fromisoformat(ts_str)
            else:
                ts = datetime.fromisoformat(ts_str.replace("Z", "+00:00"))
            
            # Round to hour
            hour_key = ts.strftime("%Y-%m-%d %H:00")
            
            hourly_stats[hour_key]["total"] += 1
            
            # Track errors
            if status != "executed":
                hourly_stats[hour_key]["errors"] += 1
                hourly_stats[hour_key]["error_types"][status] += 1
                
        except (ValueError, KeyError):
            continue
    
    return hourly_stats


def find_high_error_hours(hourly_stats, threshold=ERROR_RATE_THRESHOLD):
    """Find hours with error rate above threshold."""
    high_error_hours = []
    
    for hour, stats in sorted(hourly_stats.items()):
        if stats["total"] == 0:
            continue
        
        error_rate = stats["errors"] / stats["total"]
        
        if error_rate > threshold:
            high_error_hours.append({
                "hour": hour,
                "total": stats["total"],
                "errors": stats["errors"],
                "error_rate": round(error_rate * 100, 1),
                "error_types": dict(stats["error_types"])
            })
    
    return high_error_hours


def generate_report(hourly_stats, high_error_hours):
    """Generate analysis report."""
    # Overall stats
    total_calls = sum(s["total"] for s in hourly_stats.values())
    total_errors = sum(s["errors"] for s in hourly_stats.values())
    overall_rate = (total_errors / total_calls * 100) if total_calls > 0 else 0
    
    # Recent 24h stats
    now = datetime.now(timezone.utc)
    cutoff = now - timedelta(hours=24)
    recent_hours = {k: v for k, v in hourly_stats.items() 
                    if datetime.strptime(k, "%Y-%m-%d %H:00").replace(tzinfo=timezone.utc) > cutoff}
    
    recent_total = sum(s["total"] for s in recent_hours.values())
    recent_errors = sum(s["errors"] for s in recent_hours.values())
    recent_rate = (recent_errors / recent_total * 100) if recent_total > 0 else 0
    
    # Last 7 days daily breakdown
    daily_stats = defaultdict(lambda: {"total": 0, "errors": 0})
    for hour, stats in hourly_stats.items():
        day = hour.split()[0]
        daily_stats[day]["total"] += stats["total"]
        daily_stats[day]["errors"] += stats["errors"]
    
    daily_breakdown = []
    for day in sorted(daily_stats.keys())[-7:]:
        s = daily_stats[day]
        rate = (s["errors"] / s["total"] * 100) if s["total"] > 0 else 0
        daily_breakdown.append({
            "date": day,
            "total": s["total"],
            "errors": s["errors"],
            "error_rate": round(rate, 1)
        })
    
    report = {
        "generated_at": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
        "overall": {
            "total_calls": total_calls,
            "total_errors": total_errors,
            "error_rate_pct": round(overall_rate, 2)
        },
        "last_24h": {
            "total_calls": recent_total,
            "errors": recent_errors,
            "error_rate_pct": round(recent_rate, 2)
        },
        "daily_breakdown": daily_breakdown,
        "high_error_hours": high_error_hours,
        "threshold_pct": ERROR_RATE_THRESHOLD * 100
    }
    
    return report


def should_alert(high_error_hours):
    """Check if we should create an alert (respecting cooldown)."""
    if not high_error_hours:
        return False
    
    # Check cooldown
    if ALERT_FILE.exists():
        mtime = datetime.fromtimestamp(ALERT_FILE.stat().st_mtime)
        if datetime.now() - mtime < timedelta(hours=ALERT_COOLDOWN_HOURS):
            return False
    
    # Check if any high error hour is recent (last 2 hours)
    now = datetime.now(timezone.utc)
    for h in high_error_hours:
        hour_time = datetime.strptime(h["hour"], "%Y-%m-%d %H:00").replace(tzinfo=timezone.utc)
        if now - hour_time < timedelta(hours=2):
            return True
    
    return False


def create_alert(high_error_hours, report):
    """Create alert file for heartbeat pickup."""
    now = datetime.now(timezone.utc)
    recent_issues = [h for h in high_error_hours 
                     if now - datetime.strptime(h["hour"], "%Y-%m-%d %H:00").replace(tzinfo=timezone.utc) < timedelta(hours=2)]
    
    if not recent_issues:
        return
    
    worst = max(recent_issues, key=lambda x: x["error_rate"])
    
    alert_msg = f"""🚨 HIGH API ERROR RATE DETECTED!

Hour: {worst['hour']} UTC
Error Rate: {worst['error_rate']}% (threshold: {ERROR_RATE_THRESHOLD*100}%)
Errors: {worst['errors']} / {worst['total']} calls
Types: {', '.join(f"{k}: {v}" for k, v in worst['error_types'].items())}

Last 24h: {report['last_24h']['error_rate_pct']}% error rate
Total errors: {report['last_24h']['errors']}

Action: Check Kalshi API status, network issues, or rate limits."""
    
    ALERT_FILE.write_text(alert_msg)
    print(f"⚠️ Alert created: {ALERT_FILE}")


def main():
    print("=" * 60)
    print("Autotrader Error Rate Analysis (T618)")
    print("=" * 60)
    
    # Load data
    entries = load_execution_log()
    print(f"\nLoaded {len(entries)} execution log entries")
    
    if not entries:
        print("No data to analyze")
        return
    
    # Analyze
    hourly_stats = analyze_hourly_errors(entries)
    high_error_hours = find_high_error_hours(hourly_stats)
    
    # Generate report
    report = generate_report(hourly_stats, high_error_hours)
    
    # Save report
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    with open(OUTPUT_FILE, "w") as f:
        json.dump(report, f, indent=2)
    print(f"\nReport saved to: {OUTPUT_FILE}")
    
    # Print summary
    print(f"\n📊 SUMMARY")
    print(f"   Overall: {report['overall']['total_calls']} calls, "
          f"{report['overall']['error_rate_pct']}% error rate")
    print(f"   Last 24h: {report['last_24h']['total_calls']} calls, "
          f"{report['last_24h']['error_rate_pct']}% error rate")
    
    if high_error_hours:
        print(f"\n⚠️ HIGH ERROR HOURS ({len(high_error_hours)}):")
        for h in high_error_hours[-5:]:  # Show last 5
            print(f"   {h['hour']}: {h['error_rate']}% ({h['errors']}/{h['total']})")
    else:
        print("\n✅ No hours with error rate > 10%")
    
    # Check if alert needed
    if should_alert(high_error_hours):
        create_alert(high_error_hours, report)
    else:
        # Clean up old alert if error rate is now OK
        if ALERT_FILE.exists() and not high_error_hours:
            ALERT_FILE.unlink()
            print("✅ Cleared old alert (error rate now OK)")
    
    print("\n" + "=" * 60)


if __name__ == "__main__":
    main()
