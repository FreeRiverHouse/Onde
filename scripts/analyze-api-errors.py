#!/usr/bin/env python3
"""
Analyze API errors from autotrader logs (T413)
Parses autotrader log files to track error rates per API source.
"""

import re
from datetime import datetime, timedelta
from pathlib import Path
from collections import defaultdict
import json
import argparse

SCRIPT_DIR = Path(__file__).parent
LOG_FILE = SCRIPT_DIR / "autotrader-v2.log"
STATS_FILE = SCRIPT_DIR.parent / "data" / "trading" / "api-error-stats.json"
ALERT_FILE = SCRIPT_DIR / "kalshi-api-error.alert"  # T475
COOLDOWN_FILE = SCRIPT_DIR / ".api-error-alert-cooldown"

# Configuration
ERROR_RATE_THRESHOLD = 10  # Alert if any source exceeds 10% error rate
ALERT_COOLDOWN_HOURS = 4   # Don't repeat alert for 4 hours

# Ensure data directory exists
STATS_FILE.parent.mkdir(parents=True, exist_ok=True)

# Error patterns to detect
ERROR_PATTERNS = {
    "kalshi": [
        r"\[RETRY\] API (\d+) error",
        r"API error (\d+) after",
        r"Kalshi.*(?:error|failed|timeout)",
    ],
    "coingecko": [
        r"CoinGecko.*(?:error|failed|timeout|429|rate)",
        r"Failed to fetch.*CoinGecko",
    ],
    "binance": [
        r"Binance.*(?:error|failed|timeout)",
        r"Failed to fetch.*Binance",
    ],
    "coinbase": [
        r"Coinbase.*(?:error|failed|timeout)",
        r"Failed to fetch.*Coinbase",
    ],
    "network": [
        r"Connection.*(?:error|refused|reset|timeout)",
        r"Timeout",
        r"socket.*error",
    ]
}

# Success patterns (to calculate success rate)
SUCCESS_PATTERNS = {
    "kalshi": [
        r"Balance:.*\$[\d.]+",
        r"Order.*placed",
        r"positions.*\d+",
    ],
    "coingecko": [
        r"CoinGecko.*success",
        r"OHLC.*candles",
    ],
    "binance": [
        r"Binance.*BTC",
        r"prices.*binance",
    ],
    "coinbase": [
        r"Coinbase.*\d+",
    ]
}

def parse_logs(days: int = 7) -> dict:
    """Parse log file for error/success patterns."""
    if not LOG_FILE.exists():
        return {"error": f"Log file not found: {LOG_FILE}"}
    
    stats = defaultdict(lambda: {"errors": 0, "successes": 0, "error_details": []})
    cutoff = datetime.now() - timedelta(days=days)
    
    with open(LOG_FILE, 'r', errors='ignore') as f:
        for line in f:
            # Try to parse timestamp
            try:
                # Common formats: 2026-01-31 or [2026-01-31]
                match = re.search(r'(\d{4}-\d{2}-\d{2})', line)
                if match:
                    log_date = datetime.strptime(match.group(1), '%Y-%m-%d')
                    if log_date < cutoff:
                        continue
            except ValueError:
                pass
            
            # Check error patterns
            for source, patterns in ERROR_PATTERNS.items():
                for pattern in patterns:
                    if re.search(pattern, line, re.IGNORECASE):
                        stats[source]["errors"] += 1
                        if len(stats[source]["error_details"]) < 10:
                            stats[source]["error_details"].append(line.strip()[:100])
                        break
            
            # Check success patterns (rough estimate)
            for source, patterns in SUCCESS_PATTERNS.items():
                for pattern in patterns:
                    if re.search(pattern, line, re.IGNORECASE):
                        stats[source]["successes"] += 1
                        break
    
    return dict(stats)

def calculate_rates(stats: dict) -> dict:
    """Calculate error rates from parsed stats."""
    result = {}
    for source, data in stats.items():
        if source == "error":
            continue
        total = data["errors"] + data["successes"]
        if total > 0:
            error_rate = data["errors"] / total * 100
            success_rate = data["successes"] / total * 100
        else:
            error_rate = 0
            success_rate = 100
        
        result[source] = {
            "total_events": total,
            "errors": data["errors"],
            "successes": data["successes"],
            "error_rate": round(error_rate, 2),
            "success_rate": round(success_rate, 2),
            "sample_errors": data.get("error_details", [])[:5]
        }
    
    return result

def check_alert_cooldown() -> bool:
    """Check if we're within the alert cooldown period."""
    if not COOLDOWN_FILE.exists():
        return False
    
    try:
        last_alert_time = datetime.fromisoformat(COOLDOWN_FILE.read_text().strip())
        hours_since = (datetime.now() - last_alert_time).total_seconds() / 3600
        return hours_since < ALERT_COOLDOWN_HOURS
    except (ValueError, OSError):
        return False


def write_alert(high_error_sources: list) -> bool:
    """Write API error alert file for heartbeat pickup (T475).
    
    Args:
        high_error_sources: List of tuples (source_name, error_rate, error_count)
    
    Returns:
        bool: True if alert was written, False if skipped (cooldown)
    """
    if check_alert_cooldown():
        print(f"⏰ Alert cooldown active (< {ALERT_COOLDOWN_HOURS}h since last alert)")
        return False
    
    # Build alert message
    lines = ["🔴 HIGH API ERROR RATE DETECTED"]
    lines.append("")
    
    for source, rate, count in high_error_sources:
        lines.append(f"• {source.upper()}: {rate}% error rate ({count} errors)")
    
    lines.append("")
    lines.append("This may indicate:")
    lines.append("- API endpoint issues or downtime")
    lines.append("- Network connectivity problems")
    lines.append("- Rate limit exhaustion")
    lines.append("")
    lines.append("Check scripts/autotrader-v2.log for details.")
    
    alert_content = "\n".join(lines)
    
    try:
        ALERT_FILE.write_text(alert_content)
        COOLDOWN_FILE.write_text(datetime.now().isoformat())
        print(f"🚨 Alert written: {ALERT_FILE}")
        return True
    except OSError as e:
        print(f"⚠️ Failed to write alert: {e}")
        return False


def check_and_alert(rates: dict) -> bool:
    """Check error rates and trigger alert if threshold exceeded (T475).
    
    Returns:
        bool: True if alert was triggered
    """
    high_error_sources = []
    
    for source, data in rates.items():
        if data["error_rate"] >= ERROR_RATE_THRESHOLD and data["total_events"] >= 10:
            # Only alert if there's enough data to be meaningful
            high_error_sources.append((source, data["error_rate"], data["errors"]))
    
    if high_error_sources:
        # Sort by error rate (worst first)
        high_error_sources.sort(key=lambda x: -x[1])
        return write_alert(high_error_sources)
    
    return False


def show_report(days: int = 7):
    """Print API error rate report."""
    print(f"\n📊 API Error Rates (Last {days} Days)")
    print("=" * 60)
    
    stats = parse_logs(days)
    if "error" in stats:
        print(f"  ⚠️  {stats['error']}")
        return
    
    rates = calculate_rates(stats)
    
    if not rates:
        print("  No API activity detected in logs.")
        print("  Ensure autotrader-v2.log exists and contains recent data.")
        return
    
    # Sort by error count (most errors first)
    sorted_sources = sorted(rates.items(), key=lambda x: -x[1]["errors"])
    
    for source, data in sorted_sources:
        if data["error_rate"] == 0:
            status = "🟢"
        elif data["error_rate"] < 5:
            status = "🟡"
        else:
            status = "🔴"
        
        print(f"\n{status} {source.upper()}")
        print(f"   Events: {data['total_events']} | Errors: {data['errors']} | Error Rate: {data['error_rate']}%")
        
        if data["sample_errors"]:
            print(f"   Recent errors:")
            for err in data["sample_errors"][:3]:
                print(f"      • {err[:80]}")
    
    # Save stats
    output = {
        "generated": datetime.now().isoformat(),
        "period_days": days,
        "sources": rates
    }
    with open(STATS_FILE, "w") as f:
        json.dump(output, f, indent=2)
    
    print(f"\n📁 Stats saved: {STATS_FILE}")
    
    # Check and trigger alerts if needed (T475)
    check_and_alert(rates)

def main():
    parser = argparse.ArgumentParser(description="Analyze API errors from autotrader logs")
    parser.add_argument("--days", type=int, default=7, help="Days to analyze (default: 7)")
    args = parser.parse_args()
    
    show_report(args.days)

if __name__ == "__main__":
    main()
