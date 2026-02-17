#!/usr/bin/env python3
"""
Record uptime checks and upload to trading stats Gist.
This enables the /health page to display uptime history charts.

Usage: python3 scripts/record-uptime.py

Cron: */5 * * * * /path/to/record-uptime.py

Data stored in: data/uptime/uptime-history.json (local backup)
Uploaded to: Gist onde-trading-stats.json (uptimeHistory section)
"""

import os
import sys
import json
import time
import requests
from datetime import datetime, timezone
from pathlib import Path

# Config
PROJECT_ROOT = Path(__file__).parent.parent
UPTIME_DIR = PROJECT_ROOT / "data" / "uptime"
HISTORY_FILE = UPTIME_DIR / "uptime-history.json"
GIST_ID = "43b0815cc640bba8ac799ecb27434579"
GIST_FILE = "onde-trading-stats.json"

# Sites to check
SITES = [
    {"name": "onde.la", "url": "https://onde.la"},
    {"name": "onde.surf", "url": "https://onde.surf"},
    {"name": "skin-studio", "url": "https://skin-studio.pages.dev"},
]

# Retention: keep 7 days of 5-min checks = 2016 data points per site
MAX_HISTORY_POINTS = 2016

def check_site(url: str, timeout: int = 10) -> dict:
    """Check a site and return status."""
    start = time.time()
    try:
        response = requests.head(url, timeout=timeout, allow_redirects=True)
        latency_ms = int((time.time() - start) * 1000)
        return {
            "status": response.status_code,
            "latency_ms": latency_ms,
            "ok": response.ok or response.status_code == 307,  # 307 is expected for auth
        }
    except requests.exceptions.Timeout:
        return {
            "status": 0,
            "latency_ms": timeout * 1000,
            "ok": False,
            "error": "timeout",
        }
    except requests.exceptions.RequestException as e:
        return {
            "status": 0,
            "latency_ms": int((time.time() - start) * 1000),
            "ok": False,
            "error": str(e)[:100],
        }

def load_history() -> dict:
    """Load existing history from local file."""
    if HISTORY_FILE.exists():
        try:
            with open(HISTORY_FILE, 'r') as f:
                return json.load(f)
        except (json.JSONDecodeError, IOError):
            pass
    
    # Initialize empty history structure
    return {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "sites": {site["name"]: {"checks": [], "stats": {}} for site in SITES}
    }

def calculate_stats(checks: list) -> dict:
    """Calculate uptime statistics from check history."""
    if not checks:
        return {
            "uptime_24h": 0,
            "uptime_7d": 0,
            "avg_latency_24h": 0,
            "avg_latency_7d": 0,
            "incidents_24h": 0,
            "incidents_7d": 0,
        }
    
    now = datetime.now(timezone.utc)
    day_ago = now.timestamp() - 24 * 60 * 60
    week_ago = now.timestamp() - 7 * 24 * 60 * 60
    
    checks_24h = []
    checks_7d = []
    incidents_24h = []
    incidents_7d = []
    
    prev_ok = True
    for check in checks:
        ts = datetime.fromisoformat(check["timestamp"].replace('Z', '+00:00')).timestamp()
        ok = check.get("ok", False)
        
        if ts > day_ago:
            checks_24h.append(check)
            if not ok and prev_ok:
                incidents_24h.append(check)
        
        if ts > week_ago:
            checks_7d.append(check)
            if not ok and prev_ok:
                incidents_7d.append(check)
        
        prev_ok = ok
    
    # Calculate uptime percentages
    uptime_24h = (sum(1 for c in checks_24h if c.get("ok", False)) / len(checks_24h) * 100) if checks_24h else 0
    uptime_7d = (sum(1 for c in checks_7d if c.get("ok", False)) / len(checks_7d) * 100) if checks_7d else 0
    
    # Calculate average latencies
    latencies_24h = [c["latency_ms"] for c in checks_24h if c.get("ok") and "latency_ms" in c]
    latencies_7d = [c["latency_ms"] for c in checks_7d if c.get("ok") and "latency_ms" in c]
    
    avg_latency_24h = sum(latencies_24h) / len(latencies_24h) if latencies_24h else 0
    avg_latency_7d = sum(latencies_7d) / len(latencies_7d) if latencies_7d else 0
    
    return {
        "uptime_24h": round(uptime_24h, 2),
        "uptime_7d": round(uptime_7d, 2),
        "avg_latency_24h": round(avg_latency_24h),
        "avg_latency_7d": round(avg_latency_7d),
        "incidents_24h": len(incidents_24h),
        "incidents_7d": len(incidents_7d),
        "total_checks_24h": len(checks_24h),
        "total_checks_7d": len(checks_7d),
    }

def save_history(history: dict) -> None:
    """Save history to local file."""
    UPTIME_DIR.mkdir(parents=True, exist_ok=True)
    with open(HISTORY_FILE, 'w') as f:
        json.dump(history, f, indent=2)

def upload_to_gist(history: dict) -> bool:
    """Upload uptime history to GitHub Gist."""
    token = os.environ.get("GITHUB_TOKEN") or os.environ.get("GH_TOKEN")
    if not token:
        # Try to get from gh CLI
        import subprocess
        try:
            result = subprocess.run(
                ["gh", "auth", "token"],
                capture_output=True,
                text=True,
                check=True
            )
            token = result.stdout.strip()
        except (subprocess.CalledProcessError, FileNotFoundError):
            print("⚠️ No GitHub token available, skipping gist upload")
            return False
    
    # Fetch current gist content
    headers = {
        "Authorization": f"token {token}",
        "Accept": "application/vnd.github.v3+json"
    }
    
    try:
        response = requests.get(
            f"https://api.github.com/gists/{GIST_ID}",
            headers=headers
        )
        response.raise_for_status()
        gist_data = response.json()
        
        # Parse existing content
        current_content = gist_data["files"].get(GIST_FILE, {}).get("content", "{}")
        try:
            data = json.loads(current_content)
        except json.JSONDecodeError:
            data = {}
        
        # Update with uptime history (keep it minimal for edge runtime)
        # Only include last 24h for the gist (288 points per site at 5min intervals)
        minimal_history = {
            "generated_at": history["generated_at"],
            "sites": {}
        }
        
        for site_name, site_data in history.get("sites", {}).items():
            checks = site_data.get("checks", [])
            # Keep last 288 checks (24h of 5-min intervals)
            recent_checks = checks[-288:] if len(checks) > 288 else checks
            minimal_history["sites"][site_name] = {
                "checks": recent_checks,
                "stats": site_data.get("stats", {})
            }
        
        data["uptimeHistory"] = minimal_history
        
        # Update gist
        update_response = requests.patch(
            f"https://api.github.com/gists/{GIST_ID}",
            headers=headers,
            json={
                "files": {
                    GIST_FILE: {
                        "content": json.dumps(data, indent=2)
                    }
                }
            }
        )
        update_response.raise_for_status()
        print(f"✅ Uploaded uptime history to gist")
        return True
        
    except requests.exceptions.RequestException as e:
        print(f"❌ Failed to upload to gist: {e}")
        return False

def main():
    print(f"🕐 Recording uptime check at {datetime.now(timezone.utc).isoformat()}")
    
    # Load existing history
    history = load_history()
    timestamp = datetime.now(timezone.utc).isoformat()
    
    # Check each site
    for site in SITES:
        name = site["name"]
        url = site["url"]
        
        print(f"  Checking {name}...", end=" ")
        result = check_site(url)
        
        # Add check to history
        check = {
            "timestamp": timestamp,
            **result
        }
        
        if name not in history["sites"]:
            history["sites"][name] = {"checks": [], "stats": {}}
        
        history["sites"][name]["checks"].append(check)
        
        # Trim to max history
        if len(history["sites"][name]["checks"]) > MAX_HISTORY_POINTS:
            history["sites"][name]["checks"] = history["sites"][name]["checks"][-MAX_HISTORY_POINTS:]
        
        # Calculate stats
        history["sites"][name]["stats"] = calculate_stats(history["sites"][name]["checks"])
        
        status = "✅" if result["ok"] else "❌"
        print(f"{status} {result['status']} ({result['latency_ms']}ms)")
    
    # Update timestamp
    history["generated_at"] = timestamp
    
    # Save locally
    save_history(history)
    print(f"💾 Saved to {HISTORY_FILE}")
    
    # Upload to gist
    upload_to_gist(history)
    
    # Print summary
    print("\n📊 Uptime Summary:")
    for name, data in history["sites"].items():
        stats = data.get("stats", {})
        print(f"  {name}:")
        print(f"    24h: {stats.get('uptime_24h', 0):.1f}% uptime, {stats.get('avg_latency_24h', 0):.0f}ms avg")
        print(f"    7d:  {stats.get('uptime_7d', 0):.1f}% uptime, {stats.get('incidents_7d', 0)} incidents")

if __name__ == "__main__":
    main()
