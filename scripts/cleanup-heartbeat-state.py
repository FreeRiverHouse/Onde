#!/usr/bin/env python3
"""
Heartbeat State Cleanup Script (T424)

Checks memory/heartbeat-state.json for stale entries (>24h old) and resets them.
Logs cleanup to memory daily notes.

Run periodically via cron or manually to keep heartbeat state fresh.
"""

import json
import os
import sys
from datetime import datetime, timezone, timedelta
from pathlib import Path

WORKSPACE = Path(__file__).parent.parent
HEARTBEAT_STATE = WORKSPACE / "memory" / "heartbeat-state.json"
STALE_THRESHOLD_HOURS = 24

def get_today_memory_file() -> Path:
    """Get the path to today's memory file."""
    today = datetime.now().strftime("%Y-%m-%d")
    return WORKSPACE / "memory" / f"{today}.md"


def log_to_memory(message: str):
    """Log a message to today's memory file."""
    memory_file = get_today_memory_file()
    
    # Ensure memory directory exists
    memory_file.parent.mkdir(parents=True, exist_ok=True)
    
    timestamp = datetime.now().strftime("%H:%M")
    entry = f"\n## {datetime.now().strftime('%Y-%m-%d')} {timestamp} - Heartbeat State Cleanup\n\n{message}\n"
    
    with open(memory_file, "a") as f:
        f.write(entry)
    
    print(f"📝 Logged to {memory_file.name}")


def cleanup_heartbeat_state(dry_run: bool = False):
    """Check and cleanup stale heartbeat state entries."""
    
    if not HEARTBEAT_STATE.exists():
        print(f"ℹ️  No heartbeat state file found at {HEARTBEAT_STATE}")
        return False
    
    try:
        with open(HEARTBEAT_STATE, "r") as f:
            state = json.load(f)
    except (json.JSONDecodeError, IOError) as e:
        print(f"❌ Error reading heartbeat state: {e}")
        return False
    
    now = datetime.now(timezone.utc)
    stale_threshold = now - timedelta(hours=STALE_THRESHOLD_HOURS)
    stale_threshold_ts = int(stale_threshold.timestamp())
    
    changes = []
    last_checks = state.get("lastChecks", {})
    
    print(f"🔍 Checking heartbeat state (threshold: >{STALE_THRESHOLD_HOURS}h stale)")
    print(f"   Current time: {now.isoformat()}")
    print(f"   Stale if older than: {stale_threshold.isoformat()}")
    print()
    
    # Check each lastChecks timestamp
    for key, ts in list(last_checks.items()):
        if isinstance(ts, int):
            check_time = datetime.fromtimestamp(ts, tz=timezone.utc)
            age_hours = (now - check_time).total_seconds() / 3600
            
            if ts < stale_threshold_ts:
                print(f"   ⚠️  {key}: STALE ({age_hours:.1f}h old) - resetting")
                last_checks[key] = int(now.timestamp())
                changes.append(f"- Reset `{key}`: was {check_time.isoformat()} ({age_hours:.1f}h stale)")
            else:
                print(f"   ✅ {key}: OK ({age_hours:.1f}h old)")
    
    # Check lastHeartbeat string timestamp
    last_heartbeat = state.get("lastHeartbeat")
    if last_heartbeat:
        try:
            # Parse ISO format with timezone
            hb_time = datetime.fromisoformat(last_heartbeat.replace("Z", "+00:00"))
            if hb_time.tzinfo is None:
                hb_time = hb_time.replace(tzinfo=timezone.utc)
            
            age_hours = (now - hb_time).total_seconds() / 3600
            
            if hb_time < stale_threshold:
                print(f"   ⚠️  lastHeartbeat: STALE ({age_hours:.1f}h old) - resetting")
                state["lastHeartbeat"] = now.isoformat()
                changes.append(f"- Reset `lastHeartbeat`: was {last_heartbeat} ({age_hours:.1f}h stale)")
            else:
                print(f"   ✅ lastHeartbeat: OK ({age_hours:.1f}h old)")
        except (ValueError, TypeError) as e:
            print(f"   ⚠️  lastHeartbeat: Invalid format ({e}) - resetting")
            state["lastHeartbeat"] = now.isoformat()
            changes.append(f"- Reset `lastHeartbeat`: invalid format")
    
    # Write changes back if any
    if changes:
        print()
        print(f"📝 {len(changes)} stale entries {'would be' if dry_run else ''} reset")
        
        if not dry_run:
            state["lastChecks"] = last_checks
            state["cleanupNote"] = f"Cleaned {len(changes)} stale entries on {now.strftime('%Y-%m-%d %H:%M')}"
            
            with open(HEARTBEAT_STATE, "w") as f:
                json.dump(state, f, indent=2)
            
            # Log to memory file
            log_message = f"Cleaned up stale heartbeat state entries:\n\n" + "\n".join(changes)
            log_to_memory(log_message)
        else:
            print("   (dry run - no changes made)")
        
        return True
    else:
        print()
        print("✅ No stale entries found")
        return False


def main():
    """Main entry point."""
    global STALE_THRESHOLD_HOURS
    import argparse
    
    parser = argparse.ArgumentParser(description="Cleanup stale heartbeat state entries")
    parser.add_argument("--dry-run", action="store_true", help="Show what would be cleaned without making changes")
    parser.add_argument("--threshold", type=int, default=STALE_THRESHOLD_HOURS, 
                       help=f"Hours after which an entry is considered stale (default: {STALE_THRESHOLD_HOURS})")
    args = parser.parse_args()
    
    STALE_THRESHOLD_HOURS = args.threshold
    
    if args.dry_run:
        print("🔍 DRY RUN - no changes will be made\n")
    
    had_changes = cleanup_heartbeat_state(dry_run=args.dry_run)
    
    sys.exit(0 if not had_changes else 1)  # Exit 1 if changes were made (useful for cron alerts)


if __name__ == "__main__":
    main()
