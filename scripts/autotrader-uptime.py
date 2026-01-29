#!/usr/bin/env python3
"""
Track autotrader uptime percentage based on watchdog logs.
Parses watchdog.log for healthy/restart events to calculate uptime %.
"""

import re
import json
from datetime import datetime, timedelta, timezone
from pathlib import Path
from collections import defaultdict

WATCHDOG_LOG = Path('/Users/mattia/Projects/Onde/scripts/watchdog.log')
UPTIME_FILE = Path('/Users/mattia/Projects/Onde/data/trading/autotrader-uptime.json')

def parse_watchdog_log(hours=24):
    """Parse watchdog log entries from the last N hours."""
    if not WATCHDOG_LOG.exists():
        return [], []
    
    cutoff = datetime.now(timezone.utc) - timedelta(hours=hours)
    healthy_checks = []
    restart_events = []
    
    with open(WATCHDOG_LOG, 'r') as f:
        for line in f:
            # Try to extract timestamp from common log formats
            # Format 1: 2026-01-28 17:00:01 - message
            # Format 2: [2026-01-28T17:00:01] message
            timestamp_match = re.search(r'(\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}:\d{2})', line)
            if not timestamp_match:
                continue
            
            try:
                ts_str = timestamp_match.group(1).replace('T', ' ')
                ts = datetime.strptime(ts_str, '%Y-%m-%d %H:%M:%S')
                ts = ts.replace(tzinfo=timezone.utc)
                
                if ts < cutoff:
                    continue
                
                if 'running' in line.lower() or 'healthy' in line.lower() or 'pid' in line.lower():
                    healthy_checks.append(ts)
                elif 'restart' in line.lower() or 'start' in line.lower() or 'not running' in line.lower():
                    restart_events.append(ts)
            except ValueError:
                continue
    
    return healthy_checks, restart_events

def calculate_uptime(healthy_checks, restart_events, hours=24):
    """Calculate uptime percentage."""
    if not healthy_checks and not restart_events:
        return None  # No data
    
    total_checks = len(healthy_checks) + len(restart_events)
    if total_checks == 0:
        return None
    
    # Each healthy check is a 5-minute window of uptime
    # Each restart event means there was downtime before restart
    uptime_pct = (len(healthy_checks) / total_checks) * 100
    
    return {
        'uptime_pct': round(uptime_pct, 2),
        'healthy_checks': len(healthy_checks),
        'restart_events': len(restart_events),
        'total_checks': total_checks,
        'hours_analyzed': hours,
    }

def get_daily_uptime():
    """Get uptime stats grouped by day."""
    if not WATCHDOG_LOG.exists():
        return {}
    
    daily_stats = defaultdict(lambda: {'healthy': 0, 'restarts': 0})
    
    with open(WATCHDOG_LOG, 'r') as f:
        for line in f:
            timestamp_match = re.search(r'(\d{4}-\d{2}-\d{2})', line)
            if not timestamp_match:
                continue
            
            date_str = timestamp_match.group(1)
            
            if 'running' in line.lower() or 'healthy' in line.lower() or 'pid' in line.lower():
                daily_stats[date_str]['healthy'] += 1
            elif 'restart' in line.lower() or 'start' in line.lower() or 'not running' in line.lower():
                daily_stats[date_str]['restarts'] += 1
    
    # Calculate daily uptime percentages
    result = {}
    for date_str, counts in daily_stats.items():
        total = counts['healthy'] + counts['restarts']
        if total > 0:
            result[date_str] = {
                'uptime_pct': round((counts['healthy'] / total) * 100, 2),
                'healthy': counts['healthy'],
                'restarts': counts['restarts'],
            }
    
    return dict(sorted(result.items(), reverse=True)[:7])  # Last 7 days

def main():
    healthy_24h, restarts_24h = parse_watchdog_log(hours=24)
    stats_24h = calculate_uptime(healthy_24h, restarts_24h, hours=24)
    
    healthy_7d, restarts_7d = parse_watchdog_log(hours=168)
    stats_7d = calculate_uptime(healthy_7d, restarts_7d, hours=168)
    
    daily = get_daily_uptime()
    
    result = {
        'updated_at': datetime.now(timezone.utc).isoformat(),
        'last_24h': stats_24h,
        'last_7d': stats_7d,
        'daily': daily,
    }
    
    UPTIME_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(UPTIME_FILE, 'w') as f:
        json.dump(result, f, indent=2)
    
    print(f"Uptime stats saved to {UPTIME_FILE}")
    if stats_24h:
        print(f"  Last 24h: {stats_24h['uptime_pct']}% ({stats_24h['healthy_checks']} healthy, {stats_24h['restart_events']} restarts)")
    if stats_7d:
        print(f"  Last 7d:  {stats_7d['uptime_pct']}% ({stats_7d['healthy_checks']} healthy, {stats_7d['restart_events']} restarts)")

if __name__ == '__main__':
    main()
