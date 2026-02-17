#!/usr/bin/env python3
"""
Latency Anomaly Detection and Alerting (T397)

Monitors API latency and alerts when it exceeds historical baseline.
Calculates rolling avg + std dev and alerts when current avg > rolling_avg + 2*std_dev.

Usage:
    python3 latency-anomaly-detector.py [--dry-run] [--verbose]

Creates alert file: scripts/kalshi-latency.alert
"""

import json
import os
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional
import statistics

# Paths
LATENCY_PROFILE = Path("scripts/kalshi-latency-profile.json")
LATENCY_HISTORY = Path("data/trading/latency-history.jsonl")
ALERT_FILE = Path("scripts/kalshi-latency.alert")
COOLDOWN_FILE = Path("/tmp/latency-alert-cooldown.txt")

# Thresholds
ANOMALY_THRESHOLD_STD = 2.0  # Alert when > avg + 2*std_dev
MIN_HISTORY_ENTRIES = 10    # Need at least this many entries for baseline
COOLDOWN_HOURS = 2          # Don't alert more than once per 2 hours
WARNING_LATENCY_MS = 1000   # Absolute threshold for any endpoint
CRITICAL_LATENCY_MS = 2000  # Critical threshold
P95_CRITICAL_MS = 3000      # T824: Critical threshold for P95 latency

# Endpoints to monitor (ignore cache hits which are always fast)
MONITORED_ENDPOINTS = [
    "markets_search", "balance", "positions", "create_order",
    "ext_binance", "ext_coingecko", "ext_coinbase"
]


def load_latency_profile() -> Optional[dict]:
    """Load current latency profile."""
    if not LATENCY_PROFILE.exists():
        return None
    try:
        with open(LATENCY_PROFILE) as f:
            return json.load(f)
    except (json.JSONDecodeError, IOError) as e:
        print(f"⚠️  Error loading latency profile: {e}")
        return None


def load_latency_history() -> list[dict]:
    """Load historical latency entries."""
    if not LATENCY_HISTORY.exists():
        return []
    entries = []
    try:
        with open(LATENCY_HISTORY) as f:
            for line in f:
                line = line.strip()
                if line:
                    try:
                        entries.append(json.loads(line))
                    except json.JSONDecodeError:
                        continue
    except IOError:
        pass
    return entries


def save_latency_snapshot(profile: dict):
    """Save current latency to history for baseline tracking."""
    LATENCY_HISTORY.parent.mkdir(parents=True, exist_ok=True)
    
    # Extract key metrics for each endpoint (T820: added p50_ms, p99_ms)
    snapshot = {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "endpoints": {}
    }
    
    for endpoint, stats in profile.get("endpoints", {}).items():
        if endpoint in MONITORED_ENDPOINTS:
            snapshot["endpoints"][endpoint] = {
                "avg_ms": stats.get("avg_ms", 0),
                "p50_ms": stats.get("p50_ms", 0),  # T820
                "p95_ms": stats.get("p95_ms", 0),
                "p99_ms": stats.get("p99_ms", 0),  # T820
                "count": stats.get("count", 0)
            }
    
    with open(LATENCY_HISTORY, "a") as f:
        f.write(json.dumps(snapshot) + "\n")


def calculate_baseline(history: list[dict], endpoint: str) -> tuple[float, float]:
    """Calculate rolling avg and std dev for an endpoint from history."""
    values = []
    for entry in history[-50:]:  # Last 50 entries
        if endpoint in entry.get("endpoints", {}):
            avg = entry["endpoints"][endpoint].get("avg_ms", 0)
            if avg > 0:
                values.append(avg)
    
    if len(values) < MIN_HISTORY_ENTRIES:
        return 0, 0
    
    avg = statistics.mean(values)
    std = statistics.stdev(values) if len(values) > 1 else 0
    return avg, std


def check_cooldown() -> bool:
    """Check if we're in cooldown period."""
    if not COOLDOWN_FILE.exists():
        return False
    try:
        with open(COOLDOWN_FILE) as f:
            last_alert = datetime.fromisoformat(f.read().strip())
        hours_since = (datetime.now(timezone.utc) - last_alert).total_seconds() / 3600
        return hours_since < COOLDOWN_HOURS
    except:
        return False


def set_cooldown():
    """Set cooldown timestamp."""
    with open(COOLDOWN_FILE, "w") as f:
        f.write(datetime.now(timezone.utc).isoformat())


def detect_anomalies(profile: dict, history: list[dict], verbose: bool = False) -> list[dict]:
    """Detect latency anomalies based on historical baseline."""
    anomalies = []
    
    for endpoint, stats in profile.get("endpoints", {}).items():
        if endpoint not in MONITORED_ENDPOINTS:
            continue
        
        current_avg = stats.get("avg_ms", 0)
        current_p95 = stats.get("p95_ms", 0)
        count = stats.get("count", 0)
        
        if count < 5:  # Not enough data for this endpoint
            continue
        
        baseline_avg, baseline_std = calculate_baseline(history, endpoint)
        
        if verbose:
            print(f"📊 {endpoint}: current={current_avg:.1f}ms, baseline={baseline_avg:.1f}ms ± {baseline_std:.1f}")
        
        # Check for anomaly
        anomaly = None
        
        # Statistical anomaly (> baseline + 2*std_dev)
        if baseline_avg > 0 and baseline_std > 0:
            threshold = baseline_avg + (ANOMALY_THRESHOLD_STD * baseline_std)
            if current_avg > threshold:
                anomaly = {
                    "endpoint": endpoint,
                    "type": "statistical",
                    "current_avg_ms": round(current_avg, 1),
                    "baseline_avg_ms": round(baseline_avg, 1),
                    "baseline_std_ms": round(baseline_std, 1),
                    "threshold_ms": round(threshold, 1),
                    "deviation": round((current_avg - baseline_avg) / baseline_std, 2) if baseline_std > 0 else 0
                }
        
        # Absolute threshold check - average latency
        if current_avg > CRITICAL_LATENCY_MS:
            anomaly = anomaly or {}
            anomaly.update({
                "endpoint": endpoint,
                "type": "critical",
                "current_avg_ms": round(current_avg, 1),
                "threshold_ms": CRITICAL_LATENCY_MS,
                "severity": "critical"
            })
        elif current_avg > WARNING_LATENCY_MS and not anomaly:
            anomaly = {
                "endpoint": endpoint,
                "type": "warning",
                "current_avg_ms": round(current_avg, 1),
                "threshold_ms": WARNING_LATENCY_MS,
                "severity": "warning"
            }
        
        # T824: P95 latency threshold check
        if current_p95 > P95_CRITICAL_MS:
            p95_anomaly = {
                "endpoint": endpoint,
                "type": "p95_critical",
                "current_p95_ms": round(current_p95, 1),
                "threshold_ms": P95_CRITICAL_MS,
                "severity": "critical"
            }
            # If we already have an anomaly, merge info; otherwise create new
            if anomaly:
                anomaly["current_p95_ms"] = round(current_p95, 1)
                anomaly["p95_threshold_ms"] = P95_CRITICAL_MS
            else:
                anomaly = p95_anomaly
        
        if anomaly:
            anomaly["severity"] = anomaly.get("severity", "warning")
            anomalies.append(anomaly)
    
    return anomalies


def create_alert(anomalies: list[dict], dry_run: bool = False) -> str:
    """Create alert file with anomaly details."""
    # Sort by severity (critical first)
    anomalies.sort(key=lambda x: (x.get("severity") != "critical", -x.get("current_avg_ms", 0)))
    
    lines = [
        "🚨 API LATENCY ANOMALY DETECTED",
        f"Time: {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M UTC')}",
        ""
    ]
    
    critical_count = sum(1 for a in anomalies if a.get("severity") == "critical")
    
    for anomaly in anomalies:
        endpoint = anomaly["endpoint"]
        current = anomaly.get("current_avg_ms", 0)
        current_p95 = anomaly.get("current_p95_ms", 0)
        severity = anomaly.get("severity", "warning")
        emoji = "🔴" if severity == "critical" else "🟡"
        
        if anomaly["type"] == "statistical":
            baseline = anomaly["baseline_avg_ms"]
            deviation = anomaly["deviation"]
            lines.append(f"{emoji} {endpoint}: avg={current:.0f}ms (baseline: {baseline:.0f}ms, +{deviation:.1f}σ)")
        elif anomaly["type"] == "p95_critical":
            # T824: P95-specific alert
            lines.append(f"{emoji} {endpoint}: P95={current_p95:.0f}ms > {anomaly['threshold_ms']}ms threshold!")
        else:
            line = f"{emoji} {endpoint}: avg={current:.0f}ms (threshold: {anomaly['threshold_ms']}ms)"
            # Add P95 info if present
            if current_p95 > 0 and "p95_threshold_ms" in anomaly:
                line += f" | P95={current_p95:.0f}ms"
            lines.append(line)
    
    lines.append("")
    p95_critical = any(a.get("type") == "p95_critical" for a in anomalies)
    if critical_count > 0 or p95_critical:
        if p95_critical:
            lines.append("⚠️ CRITICAL: P95 latency exceeds 3s threshold!")
        else:
            lines.append("⚠️ CRITICAL: Some endpoints exceed 2s avg latency!")
        lines.append("Check: network issues, API throttling, or service degradation")
    else:
        lines.append("💡 Monitor for continued degradation")
    
    alert_text = "\n".join(lines)
    
    if not dry_run:
        with open(ALERT_FILE, "w") as f:
            f.write(alert_text)
        set_cooldown()
        print(f"✅ Alert created: {ALERT_FILE}")
    else:
        print("🔍 [DRY RUN] Would create alert:")
        print(alert_text)
    
    return alert_text


def main():
    import argparse
    parser = argparse.ArgumentParser(description="Latency anomaly detection")
    parser.add_argument("--dry-run", action="store_true", help="Don't create alert file")
    parser.add_argument("--verbose", "-v", action="store_true", help="Verbose output")
    parser.add_argument("--force", action="store_true", help="Ignore cooldown")
    args = parser.parse_args()
    
    print("🔍 Latency Anomaly Detector")
    print("=" * 40)
    
    # Load data
    profile = load_latency_profile()
    if not profile:
        print("❌ No latency profile found")
        sys.exit(1)
    
    profile_time = profile.get("timestamp", "unknown")
    print(f"📅 Profile timestamp: {profile_time[:19] if len(profile_time) > 19 else profile_time}")
    
    history = load_latency_history()
    print(f"📚 History entries: {len(history)}")
    
    # Save current snapshot to history
    save_latency_snapshot(profile)
    print("💾 Saved snapshot to history")
    
    # Check cooldown
    if not args.force and check_cooldown():
        print(f"⏳ In cooldown period ({COOLDOWN_HOURS}h)")
        # Still detect but don't alert
        anomalies = detect_anomalies(profile, history, args.verbose)
        if anomalies:
            print(f"\n⚠️  {len(anomalies)} anomalies detected (suppressed by cooldown)")
        else:
            print("\n✅ No anomalies detected")
        return
    
    # Detect anomalies
    anomalies = detect_anomalies(profile, history, args.verbose)
    
    if not anomalies:
        print("\n✅ No latency anomalies detected")
        # Clean up old alert if exists
        if ALERT_FILE.exists() and not args.dry_run:
            ALERT_FILE.unlink()
            print("🧹 Removed stale alert file")
        return
    
    print(f"\n🚨 {len(anomalies)} latency anomalies detected!")
    create_alert(anomalies, args.dry_run)


if __name__ == "__main__":
    main()
