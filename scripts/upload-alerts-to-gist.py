#!/usr/bin/env python3
"""
Upload recent alerts from data/finetuning/*.jsonl to the trading stats Gist.
This allows the /health page (edge runtime) to display alert history.

Usage: python3 scripts/upload-alerts-to-gist.py

Cron: Run hourly to keep alerts fresh
"""

import os
import sys
import json
import glob
from datetime import datetime, timedelta, timezone
from pathlib import Path

# Config
PROJECT_ROOT = Path(__file__).parent.parent
FINETUNING_DIR = PROJECT_ROOT / "data" / "finetuning"
GIST_ID = "43b0815cc640bba8ac799ecb27434579"
GIST_FILE = "onde-trading-stats.json"

def load_alerts_from_jsonl(hours: int = 24) -> list:
    """Load alerts from last N hours across all finetuning jsonl files."""
    alerts = []
    cutoff = datetime.now(timezone.utc) - timedelta(hours=hours)
    
    # Find all jsonl files
    jsonl_files = glob.glob(str(FINETUNING_DIR / "*.jsonl"))
    
    for filepath in jsonl_files:
        alert_type = Path(filepath).stem  # e.g., "momentum-divergence"
        
        try:
            with open(filepath, 'r') as f:
                for line in f:
                    line = line.strip()
                    if not line:
                        continue
                    
                    try:
                        data = json.loads(line)
                        
                        # Parse timestamp
                        ts_str = data.get('timestamp')
                        if not ts_str:
                            continue
                        
                        # Handle various timestamp formats
                        ts = None
                        for fmt in [
                            '%Y-%m-%dT%H:%M:%S.%f%z',
                            '%Y-%m-%dT%H:%M:%S%z',
                            '%Y-%m-%dT%H:%M:%S.%fZ',
                            '%Y-%m-%dT%H:%M:%SZ',
                        ]:
                            try:
                                ts = datetime.strptime(ts_str, fmt)
                                if ts.tzinfo is None:
                                    ts = ts.replace(tzinfo=timezone.utc)
                                break
                            except ValueError:
                                continue
                        
                        if ts is None:
                            continue
                        
                        # Only include recent alerts
                        if ts < cutoff:
                            continue
                        
                        # Build alert summary
                        alert = {
                            'timestamp': ts.isoformat(),
                            'type': data.get('type', alert_type),
                            'file': Path(filepath).name,
                        }
                        
                        # Add type-specific summary
                        if 'divergences' in data:
                            divs = data['divergences']
                            if divs:
                                alert['summary'] = f"{len(divs)} divergence(s) detected"
                                # Add first divergence details
                                first = divs[0]
                                alert['details'] = {
                                    'asset': first.get('asset'),
                                    'timeframe': first.get('timeframe'),
                                    'severity': first.get('severity'),
                                }
                        elif 'regime' in data:
                            alert['summary'] = f"Regime: {data['regime']}"
                            alert['details'] = {'regime': data['regime']}
                        elif 'message' in data:
                            alert['summary'] = data['message'][:100]
                        else:
                            alert['summary'] = f"Alert from {alert_type}"
                        
                        alerts.append(alert)
                        
                    except json.JSONDecodeError:
                        continue
                        
        except Exception as e:
            print(f"Warning: Error reading {filepath}: {e}", file=sys.stderr)
    
    # Sort by timestamp, newest first
    alerts.sort(key=lambda x: x['timestamp'], reverse=True)
    
    # Limit to 50 most recent
    return alerts[:50]


def update_gist_with_alerts(alerts: list) -> bool:
    """Update the trading stats Gist with alerts section."""
    import subprocess
    
    # Check for gh CLI
    result = subprocess.run(['which', 'gh'], capture_output=True)
    if result.returncode != 0:
        print("Error: gh CLI not found. Install with: brew install gh", file=sys.stderr)
        return False
    
    # Fetch current Gist content
    try:
        result = subprocess.run(
            ['gh', 'gist', 'view', GIST_ID, '-f', GIST_FILE, '--raw'],
            capture_output=True,
            text=True,
            timeout=30
        )
        if result.returncode != 0:
            print(f"Error fetching Gist: {result.stderr}", file=sys.stderr)
            return False
        
        current_data = json.loads(result.stdout)
    except Exception as e:
        print(f"Error parsing Gist: {e}", file=sys.stderr)
        # Start fresh
        current_data = {}
    
    # Add/update alerts section
    current_data['alerts'] = {
        'generated_at': datetime.now(timezone.utc).isoformat(),
        'count': len(alerts),
        'items': alerts,
    }
    
    # Write to temp file
    temp_file = '/tmp/onde-trading-stats-with-alerts.json'
    with open(temp_file, 'w') as f:
        json.dump(current_data, f, indent=2)
    
    # Update Gist - use the add command with filename
    try:
        result = subprocess.run(
            ['gh', 'gist', 'edit', GIST_ID, '-a', temp_file],
            capture_output=True,
            text=True,
            timeout=30
        )
        if result.returncode != 0:
            # Try alternative: direct API call
            import urllib.request
            import urllib.error
            
            # Get GitHub token
            token_result = subprocess.run(['gh', 'auth', 'token'], capture_output=True, text=True)
            if token_result.returncode != 0:
                print(f"Error getting GitHub token: {token_result.stderr}", file=sys.stderr)
                return False
            
            token = token_result.stdout.strip()
            
            # Prepare API request
            api_url = f"https://api.github.com/gists/{GIST_ID}"
            payload = json.dumps({
                "files": {
                    GIST_FILE: {
                        "content": json.dumps(current_data, indent=2)
                    }
                }
            })
            
            req = urllib.request.Request(
                api_url,
                data=payload.encode('utf-8'),
                method='PATCH',
                headers={
                    'Authorization': f'Bearer {token}',
                    'Accept': 'application/vnd.github+json',
                    'Content-Type': 'application/json',
                }
            )
            
            try:
                with urllib.request.urlopen(req, timeout=30) as resp:
                    if resp.status == 200:
                        print(f"✅ Updated Gist with {len(alerts)} alerts (via API)")
                        return True
            except urllib.error.HTTPError as e:
                print(f"Error updating Gist via API: {e.code} {e.reason}", file=sys.stderr)
                return False
        
        print(f"✅ Updated Gist with {len(alerts)} alerts")
        return True
        
    except Exception as e:
        print(f"Error updating Gist: {e}", file=sys.stderr)
        return False


def main():
    """Main entry point."""
    print(f"📊 Loading alerts from {FINETUNING_DIR}...")
    
    if not FINETUNING_DIR.exists():
        print(f"Warning: {FINETUNING_DIR} does not exist", file=sys.stderr)
        alerts = []
    else:
        alerts = load_alerts_from_jsonl(hours=24)
    
    print(f"Found {len(alerts)} alerts in last 24h")
    
    if alerts:
        for alert in alerts[:5]:
            print(f"  - [{alert['type']}] {alert['summary']} ({alert['timestamp'][:16]})")
        if len(alerts) > 5:
            print(f"  ... and {len(alerts) - 5} more")
    
    print("\n📤 Uploading to Gist...")
    success = update_gist_with_alerts(alerts)
    
    return 0 if success else 1


if __name__ == '__main__':
    sys.exit(main())
