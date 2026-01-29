#!/usr/bin/env python3
"""
Analyze circuit breaker history to optimize threshold.

T471: Circuit breaker history logging
Reads kalshi-circuit-breaker-history.jsonl and shows:
- Total triggers
- Average pause duration
- Release reasons (win vs cooldown vs manual)
- Streak at trigger patterns
- Trades skipped analysis

Usage:
  python3 scripts/analyze-circuit-breaker-history.py [--json]
"""

import json
import sys
from datetime import datetime, timezone
from pathlib import Path
from collections import defaultdict

HISTORY_FILE = "scripts/kalshi-circuit-breaker-history.jsonl"


def load_history():
    """Load all circuit breaker events from history file."""
    events = []
    path = Path(HISTORY_FILE)
    if not path.exists():
        return events
    
    with open(path) as f:
        for line in f:
            try:
                events.append(json.loads(line.strip()))
            except:
                pass
    
    return events


def analyze_history():
    """Analyze circuit breaker history and return stats."""
    events = load_history()
    
    if not events:
        return {
            "status": "no_data",
            "message": "No circuit breaker events found. Either threshold hasn't been hit or file doesn't exist."
        }
    
    triggers = [e for e in events if e.get("event_type") == "trigger"]
    releases = [e for e in events if e.get("event_type") == "release"]
    
    # Calculate stats
    stats = {
        "total_triggers": len(triggers),
        "total_releases": len(releases),
        "release_reasons": defaultdict(int),
        "avg_pause_duration_hours": 0,
        "avg_trades_skipped": 0,
        "streaks_at_trigger": [],
        "recommendations": []
    }
    
    # Analyze releases
    pause_durations = []
    trades_skipped_total = 0
    
    for release in releases:
        reason = release.get("release_reason", "unknown")
        stats["release_reasons"][reason] += 1
        
        if "pause_duration_hours" in release:
            pause_durations.append(release["pause_duration_hours"])
        
        if "trades_skipped" in release:
            trades_skipped_total += release["trades_skipped"]
    
    # Analyze triggers
    for trigger in triggers:
        stats["streaks_at_trigger"].append(trigger.get("consecutive_losses", 0))
    
    # Calculate averages
    if pause_durations:
        stats["avg_pause_duration_hours"] = round(sum(pause_durations) / len(pause_durations), 2)
    
    if releases:
        stats["avg_trades_skipped"] = round(trades_skipped_total / len(releases), 1)
    
    # Convert release_reasons to regular dict
    stats["release_reasons"] = dict(stats["release_reasons"])
    
    # Generate recommendations
    if stats["total_triggers"] > 0:
        win_releases = stats["release_reasons"].get("win", 0)
        cooldown_releases = stats["release_reasons"].get("cooldown", 0)
        
        # Recommendation: If mostly released by cooldown, model might need work
        if cooldown_releases > win_releases and stats["total_triggers"] >= 3:
            stats["recommendations"].append(
                "⚠️ Most releases are by cooldown, not wins. Consider reviewing model performance."
            )
        
        # Recommendation: If avg pause is very short, threshold might be too low
        if stats["avg_pause_duration_hours"] < 1 and stats["total_triggers"] >= 3:
            stats["recommendations"].append(
                "⚠️ Average pause duration is short. Consider increasing CIRCUIT_BREAKER_COOLDOWN_HOURS."
            )
        
        # Recommendation: If streaks are all at threshold, threshold might be optimal
        avg_streak = sum(stats["streaks_at_trigger"]) / len(stats["streaks_at_trigger"]) if stats["streaks_at_trigger"] else 0
        if avg_streak == triggers[0].get("threshold", 5):
            stats["recommendations"].append(
                "✅ Circuit breaker consistently triggers at threshold - well calibrated."
            )
        
        # Recommendation: If many trades skipped, consider threshold adjustment
        if stats["avg_trades_skipped"] > 100:
            stats["recommendations"].append(
                "📉 Many trading opportunities skipped during pauses. Consider lower threshold or shorter cooldown."
            )
    
    if not stats["recommendations"]:
        stats["recommendations"].append("📊 Insufficient data for recommendations. Need more trigger/release cycles.")
    
    return stats


def print_report(stats):
    """Print human-readable report."""
    if stats.get("status") == "no_data":
        print("=" * 60)
        print("CIRCUIT BREAKER HISTORY ANALYSIS")
        print("=" * 60)
        print(f"\n{stats['message']}\n")
        return
    
    print("=" * 60)
    print("CIRCUIT BREAKER HISTORY ANALYSIS")
    print("=" * 60)
    
    print(f"\n📊 Overview")
    print(f"   Total triggers:  {stats['total_triggers']}")
    print(f"   Total releases:  {stats['total_releases']}")
    
    if stats['release_reasons']:
        print(f"\n🔓 Release Reasons")
        for reason, count in stats['release_reasons'].items():
            pct = round(count / stats['total_releases'] * 100) if stats['total_releases'] > 0 else 0
            emoji = "✅" if reason == "win" else "⏰" if reason == "cooldown" else "🔧"
            print(f"   {emoji} {reason}: {count} ({pct}%)")
    
    if stats['avg_pause_duration_hours'] > 0:
        print(f"\n⏱️ Pause Duration")
        print(f"   Average: {stats['avg_pause_duration_hours']:.2f} hours")
    
    if stats['avg_trades_skipped'] > 0:
        print(f"\n📉 Trades Skipped (estimated)")
        print(f"   Average per pause: {stats['avg_trades_skipped']:.0f}")
    
    if stats['streaks_at_trigger']:
        min_streak = min(stats['streaks_at_trigger'])
        max_streak = max(stats['streaks_at_trigger'])
        avg_streak = sum(stats['streaks_at_trigger']) / len(stats['streaks_at_trigger'])
        print(f"\n📈 Streak at Trigger")
        print(f"   Min: {min_streak}, Max: {max_streak}, Avg: {avg_streak:.1f}")
    
    print(f"\n💡 Recommendations")
    for rec in stats['recommendations']:
        print(f"   {rec}")
    
    print()


def main():
    stats = analyze_history()
    
    if "--json" in sys.argv:
        print(json.dumps(stats, indent=2))
    else:
        print_report(stats)


if __name__ == "__main__":
    main()
