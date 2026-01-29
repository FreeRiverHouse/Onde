#!/usr/bin/env python3
"""
Push trading stats to GitHub Gist for static site consumption.

Creates/updates a public gist with trading stats JSON that the static site
can fetch at runtime, bypassing the static export limitation.

Usage:
    python push-stats-to-gist.py [--create]

Options:
    --create    Create a new gist (first run only)
"""

import json
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path

# Paths
SCRIPT_DIR = Path(__file__).parent
TRADES_FILE = SCRIPT_DIR / "kalshi-trades-v2.jsonl"
GIST_ID_FILE = SCRIPT_DIR.parent / "data" / "trading" / "stats-gist-id.txt"
STATS_FILENAME = "onde-trading-stats.json"

def load_trades():
    """Load trades from JSONL file."""
    trades = []
    if not TRADES_FILE.exists():
        return trades
    
    with open(TRADES_FILE, 'r') as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            try:
                trade = json.loads(line)
                trades.append(trade)
            except json.JSONDecodeError:
                continue
    return trades

def calculate_stats(trades):
    """Calculate trading statistics."""
    if not trades:
        return {
            "totalTrades": 0,
            "winRate": 0,
            "pnlCents": 0,
            "todayTrades": 0,
            "todayWinRate": 0,
            "todayPnlCents": 0,
            "byAsset": {},
            "lastUpdated": datetime.now(timezone.utc).isoformat()
        }
    
    # Filter settled trades
    settled = [t for t in trades if t.get('result_status') in ['won', 'lost']]
    
    # Calculate overall stats
    wins = sum(1 for t in settled if t.get('result_status') == 'won')
    total = len(settled)
    win_rate = (wins / total * 100) if total > 0 else 0
    
    # Calculate PnL
    total_pnl = 0
    gross_profit = 0
    gross_loss = 0
    
    for t in settled:
        price = t.get('price', 50)
        contracts = t.get('contracts', 1)
        won = t.get('result_status') == 'won'
        
        if won:
            profit = (100 - price) * contracts
            total_pnl += profit
            gross_profit += profit
        else:
            loss = price * contracts
            total_pnl -= loss
            gross_loss += loss
    
    # Today's stats
    today = datetime.now(timezone.utc).date().isoformat()
    today_trades = [t for t in settled if t.get('timestamp', '').startswith(today)]
    today_wins = sum(1 for t in today_trades if t.get('result_status') == 'won')
    today_total = len(today_trades)
    today_win_rate = (today_wins / today_total * 100) if today_total > 0 else 0
    
    today_pnl = 0
    for t in today_trades:
        price = t.get('price', 50)
        contracts = t.get('contracts', 1)
        if t.get('result_status') == 'won':
            today_pnl += (100 - price) * contracts
        else:
            today_pnl -= price * contracts
    
    # By asset breakdown
    by_asset = {}
    for asset in ['BTC', 'ETH']:
        asset_trades = [t for t in settled if t.get('asset', 'BTC') == asset]
        asset_wins = sum(1 for t in asset_trades if t.get('result_status') == 'won')
        asset_total = len(asset_trades)
        
        asset_pnl = 0
        for t in asset_trades:
            price = t.get('price', 50)
            contracts = t.get('contracts', 1)
            if t.get('result_status') == 'won':
                asset_pnl += (100 - price) * contracts
            else:
                asset_pnl -= price * contracts
        
        by_asset[asset] = {
            "trades": asset_total,
            "winRate": round(asset_wins / asset_total * 100, 1) if asset_total > 0 else 0,
            "pnlCents": asset_pnl
        }
    
    # Profit factor
    profit_factor = gross_profit / gross_loss if gross_loss > 0 else float('inf') if gross_profit > 0 else 0
    
    # Max drawdown
    cumulative = 0
    peak = 0
    max_drawdown = 0
    
    for t in settled:
        price = t.get('price', 50)
        contracts = t.get('contracts', 1)
        if t.get('result_status') == 'won':
            cumulative += (100 - price) * contracts
        else:
            cumulative -= price * contracts
        
        if cumulative > peak:
            peak = cumulative
        drawdown = peak - cumulative
        if drawdown > max_drawdown:
            max_drawdown = drawdown
    
    max_dd_percent = (max_drawdown / peak * 100) if peak > 0 else 0
    
    return {
        "totalTrades": total,
        "winRate": round(win_rate, 1),
        "pnlCents": total_pnl,
        "pnlDollars": round(total_pnl / 100, 2),
        "grossProfitCents": gross_profit,
        "grossLossCents": gross_loss,
        "profitFactor": round(profit_factor, 2) if profit_factor != float('inf') else "∞",
        "maxDrawdownCents": max_drawdown,
        "maxDrawdownPercent": round(max_dd_percent, 1),
        "todayTrades": today_total,
        "todayWinRate": round(today_win_rate, 1),
        "todayPnlCents": today_pnl,
        "byAsset": by_asset,
        "pendingTrades": len([t for t in trades if t.get('result_status') == 'pending']),
        "lastUpdated": datetime.now(timezone.utc).isoformat()
    }

def get_gist_id():
    """Get existing gist ID or return None."""
    if GIST_ID_FILE.exists():
        return GIST_ID_FILE.read_text().strip()
    return None

def save_gist_id(gist_id):
    """Save gist ID for future updates."""
    GIST_ID_FILE.parent.mkdir(parents=True, exist_ok=True)
    GIST_ID_FILE.write_text(gist_id)

def create_gist(stats_json):
    """Create a new public gist."""
    # Write stats to temp file
    temp_file = Path("/tmp") / STATS_FILENAME
    temp_file.write_text(stats_json)
    
    # Create gist
    result = subprocess.run(
        ["gh", "gist", "create", str(temp_file), "--public", "--desc", "Onde Trading Stats (auto-updated)"],
        capture_output=True, text=True
    )
    
    if result.returncode != 0:
        print(f"Error creating gist: {result.stderr}")
        return None
    
    # Parse gist URL to get ID
    gist_url = result.stdout.strip()
    gist_id = gist_url.split("/")[-1]
    
    print(f"Created gist: {gist_url}")
    print(f"Raw URL: https://gist.githubusercontent.com/FreeRiverHouse/{gist_id}/raw/{STATS_FILENAME}")
    
    return gist_id

def update_gist(gist_id, stats_json):
    """Update existing gist."""
    # Write stats to temp file
    temp_file = Path("/tmp") / STATS_FILENAME
    temp_file.write_text(stats_json)
    
    # Update gist
    result = subprocess.run(
        ["gh", "gist", "edit", gist_id, "-f", str(temp_file)],
        capture_output=True, text=True
    )
    
    if result.returncode != 0:
        print(f"Error updating gist: {result.stderr}")
        return False
    
    print(f"Updated gist: https://gist.github.com/{gist_id}")
    return True

def main():
    create_new = "--create" in sys.argv
    
    # Load trades and calculate stats
    trades = load_trades()
    stats = calculate_stats(trades)
    stats_json = json.dumps(stats, indent=2)
    
    print(f"Stats: {stats['totalTrades']} trades, {stats['winRate']}% win rate, ${stats.get('pnlDollars', 0)} PnL")
    
    gist_id = get_gist_id()
    
    if create_new or not gist_id:
        print("Creating new gist...")
        gist_id = create_gist(stats_json)
        if gist_id:
            save_gist_id(gist_id)
            print(f"Saved gist ID to {GIST_ID_FILE}")
    else:
        print(f"Updating existing gist {gist_id}...")
        update_gist(gist_id, stats_json)
    
    # Print raw URL for static site
    if gist_id:
        raw_url = f"https://gist.githubusercontent.com/FreeRiverHouse/{gist_id}/raw/{STATS_FILENAME}"
        print(f"\nFetch URL for static site:\n{raw_url}")

if __name__ == "__main__":
    main()
