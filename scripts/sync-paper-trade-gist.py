#!/usr/bin/env python3
"""
Sync Paper Trade State to GitHub Gist

Uploads the local paper trade state to a GitHub Gist so the
onde.surf dashboard can display real-time trading data.

Usage:
    python3 sync-paper-trade-gist.py

Requires GITHUB_TOKEN environment variable.
"""

import json
import os
import sys
from datetime import datetime, timezone
from pathlib import Path
import requests

# Configuration
STATE_FILE = Path(__file__).parent.parent / "data" / "trading" / "paper-trade-state.json"
GIST_ID = "43b0815cc640bba8ac799ecb27434579"  # onde-trading-stats gist
GIST_FILENAME = "paper-trade-state.json"

def get_github_token():
    """Get GitHub token from environment or gh CLI."""
    token = os.environ.get("GITHUB_TOKEN") or os.environ.get("GH_TOKEN")
    
    if not token:
        # Try to get token from gh CLI
        try:
            import subprocess
            result = subprocess.run(
                ["gh", "auth", "token"],
                capture_output=True,
                text=True
            )
            if result.returncode == 0:
                token = result.stdout.strip()
        except Exception:
            pass
    
    if not token:
        # Try to read from gh CLI config as fallback
        gh_config = Path.home() / ".config" / "gh" / "hosts.yml"
        if gh_config.exists():
            try:
                import yaml
                with open(gh_config) as f:
                    config = yaml.safe_load(f)
                    if config and "github.com" in config:
                        token = config["github.com"].get("oauth_token")
            except ImportError:
                # yaml not available, try simple parsing
                with open(gh_config) as f:
                    content = f.read()
                    for line in content.split('\n'):
                        if 'oauth_token:' in line:
                            token = line.split(':', 1)[1].strip()
                            break
    return token


def sync_to_gist():
    """Sync paper trade state to GitHub Gist."""
    
    if not STATE_FILE.exists():
        print("❌ No paper trade state file found.")
        print(f"   Expected: {STATE_FILE}")
        print("   Run: python3 paper-trading-fresh.py --fresh")
        return False
    
    # Load state
    with open(STATE_FILE) as f:
        state = json.load(f)
    
    # Add sync metadata
    state["synced_at"] = datetime.now(timezone.utc).isoformat()
    state["sync_source"] = "local"
    
    # Get GitHub token
    token = get_github_token()
    if not token:
        print("❌ No GitHub token found.")
        print("   Set GITHUB_TOKEN environment variable or login with 'gh auth login'")
        return False
    
    # Update gist
    headers = {
        "Authorization": f"token {token}",
        "Accept": "application/vnd.github.v3+json"
    }
    
    payload = {
        "files": {
            GIST_FILENAME: {
                "content": json.dumps(state, indent=2)
            }
        }
    }
    
    try:
        response = requests.patch(
            f"https://api.github.com/gists/{GIST_ID}",
            headers=headers,
            json=payload
        )
        
        if response.status_code == 200:
            print("✅ Synced paper trade state to Gist")
            print(f"   Session: {state.get('session_id', 'unknown')}")
            print(f"   Balance: ${state.get('current_balance_cents', 0) / 100:.2f}")
            print(f"   PnL: ${state.get('stats', {}).get('pnl_cents', 0) / 100:+.2f}")
            print(f"   Win Rate: {state.get('stats', {}).get('win_rate', 0):.1f}%")
            print(f"   Trades: {state.get('stats', {}).get('total_trades', 0)}")
            return True
        else:
            print(f"❌ Gist update failed: {response.status_code}")
            print(f"   {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Error syncing to Gist: {e}")
        return False


def main():
    """Main entry point."""
    import argparse
    
    parser = argparse.ArgumentParser(description="Sync paper trade state to Gist")
    parser.add_argument("--watch", action="store_true", help="Watch and sync on changes")
    parser.add_argument("--interval", type=int, default=60, help="Sync interval in seconds (default: 60)")
    args = parser.parse_args()
    
    if args.watch:
        import time
        print(f"👀 Watching for changes (syncing every {args.interval}s)...")
        try:
            while True:
                sync_to_gist()
                time.sleep(args.interval)
        except KeyboardInterrupt:
            print("\n⏹️ Stopped watching.")
    else:
        sync_to_gist()


if __name__ == "__main__":
    main()
