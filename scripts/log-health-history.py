#!/usr/bin/env python3
"""
Health History Logger for Autotrader

Logs snapshots of autotrader health status to a JSONL file for historical tracking.
Run via cron every 5 minutes to build health timeline.

Usage:
    python3 log-health-history.py             # Log current health
    python3 log-health-history.py --stats     # Show health statistics
    python3 log-health-history.py --cleanup   # Remove entries older than 30 days

Cron example (every 5 minutes):
    */5 * * * * cd /Users/mattia/Projects/Onde && python3 scripts/log-health-history.py
"""

import json
import os
import sys
from datetime import datetime, timedelta, timezone
from pathlib import Path

# Paths
SCRIPT_DIR = Path(__file__).parent
DATA_DIR = SCRIPT_DIR.parent / "data" / "trading"
HEALTH_FILE = DATA_DIR / "autotrader-health.json"
HISTORY_FILE = DATA_DIR / "health-history.jsonl"
RETENTION_DAYS = 30


def load_current_health() -> dict:
    """Load current autotrader health status."""
    if not HEALTH_FILE.exists():
        return None
    try:
        with open(HEALTH_FILE, "r") as f:
            return json.load(f)
    except (json.JSONDecodeError, IOError) as e:
        print(f"Warning: Could not read health file: {e}", file=sys.stderr)
        return None


def log_snapshot(health: dict) -> bool:
    """Append a health snapshot to the history file."""
    if health is None:
        return False
    
    snapshot = {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "is_running": health.get("is_running", False),
        "cycle_count": health.get("cycle_count", 0),
        "dry_run": health.get("dry_run", True),
        "trades_today": health.get("trades_today", 0),
        "win_rate_today": health.get("win_rate_today", 0.0),
        "pnl_today_cents": health.get("pnl_today_cents", 0),
        "positions_count": health.get("positions_count", 0),
        "cash_cents": health.get("cash_cents", 0),
        "circuit_breaker_active": health.get("circuit_breaker_active", False),
        "consecutive_losses": health.get("consecutive_losses", 0),
        "status": health.get("status", "unknown"),
    }
    
    # Append to history file
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    with open(HISTORY_FILE, "a") as f:
        f.write(json.dumps(snapshot) + "\n")
    
    return True


def load_history(days: int = RETENTION_DAYS) -> list:
    """Load health history from JSONL file."""
    if not HISTORY_FILE.exists():
        return []
    
    cutoff = datetime.now(timezone.utc) - timedelta(days=days)
    history = []
    
    with open(HISTORY_FILE, "r") as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            try:
                entry = json.loads(line)
                entry_time = datetime.fromisoformat(entry["timestamp"].replace("Z", "+00:00"))
                if entry_time >= cutoff:
                    history.append(entry)
            except (json.JSONDecodeError, KeyError):
                continue
    
    return history


def cleanup_old_entries():
    """Remove entries older than retention period."""
    if not HISTORY_FILE.exists():
        print("No history file to clean up.")
        return
    
    history = load_history(RETENTION_DAYS)
    
    # Rewrite file with only recent entries
    with open(HISTORY_FILE, "w") as f:
        for entry in history:
            f.write(json.dumps(entry) + "\n")
    
    print(f"Kept {len(history)} entries (last {RETENTION_DAYS} days)")


def show_stats():
    """Display health history statistics."""
    history = load_history()
    
    if not history:
        print("No health history data available.")
        return
    
    # Calculate stats
    total_entries = len(history)
    running_count = sum(1 for h in history if h.get("is_running", False))
    circuit_breaker_count = sum(1 for h in history if h.get("circuit_breaker_active", False))
    
    # Calculate uptime percentage
    uptime_pct = (running_count / total_entries) * 100 if total_entries > 0 else 0
    
    # Find longest downtime
    downtimes = []
    current_downtime_start = None
    for entry in sorted(history, key=lambda x: x["timestamp"]):
        if not entry.get("is_running", False):
            if current_downtime_start is None:
                current_downtime_start = entry["timestamp"]
        else:
            if current_downtime_start is not None:
                downtimes.append((current_downtime_start, entry["timestamp"]))
                current_downtime_start = None
    
    # Calculate average trades per day
    if history:
        first = datetime.fromisoformat(history[0]["timestamp"].replace("Z", "+00:00"))
        last = datetime.fromisoformat(history[-1]["timestamp"].replace("Z", "+00:00"))
        days_span = max((last - first).days, 1)
        total_trades = sum(h.get("trades_today", 0) for h in history) / len(history) * days_span
    else:
        total_trades = 0
        days_span = 0
    
    print("=== Autotrader Health History Stats ===")
    print(f"Data points: {total_entries}")
    print(f"Time span: {days_span} days")
    print(f"Uptime: {uptime_pct:.1f}%")
    print(f"Running samples: {running_count}/{total_entries}")
    print(f"Circuit breaker activations: {circuit_breaker_count}")
    print(f"Downtime periods: {len(downtimes)}")
    
    # Latest status
    if history:
        latest = max(history, key=lambda x: x["timestamp"])
        print(f"\nLatest status: {latest.get('status', 'unknown')}")
        print(f"Latest timestamp: {latest['timestamp']}")
        print(f"Positions: {latest.get('positions_count', 0)}")
        print(f"Today's PnL: ${latest.get('pnl_today_cents', 0) / 100:.2f}")


def main():
    if len(sys.argv) > 1:
        if sys.argv[1] == "--stats":
            show_stats()
            return
        elif sys.argv[1] == "--cleanup":
            cleanup_old_entries()
            return
        elif sys.argv[1] == "--help":
            print(__doc__)
            return
    
    # Default: log current health snapshot
    health = load_current_health()
    if health is None:
        print("No health data available to log.", file=sys.stderr)
        sys.exit(1)
    
    if log_snapshot(health):
        print(f"Logged health snapshot: {health.get('status', 'unknown')}")
    else:
        print("Failed to log health snapshot.", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
