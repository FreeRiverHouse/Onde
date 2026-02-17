#!/usr/bin/env python3
"""
Migrate V1 trades to V2 format.

T484: Convert kalshi-trades.jsonl (v1) to kalshi-trades-v2.jsonl format.
Adds missing fields with sensible defaults for historical analysis.

Usage:
  python3 scripts/migrate-trades-v1-to-v2.py [--output FILE] [--dry-run] [--stats]

Options:
  --output FILE   Output file (default: scripts/kalshi-trades-v1-migrated.jsonl)
  --dry-run       Preview migration without writing
  --stats         Show statistics only, no migration
  --append-to-v2  Append migrated trades to existing v2 file (caution: may cause duplicates)
"""

import json
import sys
from datetime import datetime, timezone
from pathlib import Path

V1_FILE = "scripts/kalshi-trades.jsonl"
V2_FILE = "scripts/kalshi-trades-v2.jsonl"
DEFAULT_OUTPUT = "scripts/kalshi-trades-v1-migrated.jsonl"


def infer_asset_from_ticker(ticker: str) -> str:
    """Infer asset type from ticker name."""
    ticker_upper = ticker.upper()
    if "KXETHD" in ticker_upper:
        return "eth"
    elif "KXBTCD" in ticker_upper:
        return "btc"
    else:
        return "unknown"


def infer_reason_from_v1(trade: dict) -> str:
    """
    Generate a reason string based on v1 trade data.
    Since v1 didn't track this, we create a synthetic reason.
    """
    edge = trade.get("edge", 0)
    side = trade.get("side", "unknown")
    
    parts = []
    
    # Edge info
    if edge >= 0.3:
        parts.append(f"high edge ({edge:.0%})")
    else:
        parts.append(f"edge {edge:.0%}")
    
    # Side info
    parts.append(f"{side.upper()} bet")
    
    # V1 model note
    parts.append("v1 model (pre-fix)")
    
    return " | ".join(parts)


def migrate_trade(v1_trade: dict) -> dict:
    """
    Convert a V1 trade to V2 format.
    Adds missing fields with reasonable defaults.
    """
    # Skip non-trade entries
    if v1_trade.get("type") != "trade":
        return None
    
    ticker = v1_trade.get("ticker", "")
    asset = infer_asset_from_ticker(ticker)
    edge = v1_trade.get("edge", 0)
    
    # V2 format with defaults
    v2_trade = {
        # Preserved from V1
        "timestamp": v1_trade.get("timestamp"),
        "type": "trade",
        "ticker": ticker,
        "side": v1_trade.get("side"),
        "contracts": v1_trade.get("contracts"),
        "price_cents": v1_trade.get("price_cents"),
        "cost_cents": v1_trade.get("cost_cents", v1_trade.get("contracts", 0) * v1_trade.get("price_cents", 0)),
        "edge": edge,
        "our_prob": v1_trade.get("our_prob"),
        "market_prob": v1_trade.get("market_prob"),
        "strike": v1_trade.get("strike"),
        "current_price": v1_trade.get("current_price"),
        "minutes_to_expiry": v1_trade.get("minutes_to_expiry"),
        "result_status": v1_trade.get("result_status", "pending"),
        
        # Added in V2 - inferred or defaults
        "asset": asset,
        "reason": infer_reason_from_v1(v1_trade),
        "edge_with_bonus": edge,  # Same as edge (no bonus in v1)
        "base_prob": v1_trade.get("our_prob"),  # Same as our_prob (no adjustment in v1)
        
        # Momentum (unknown in v1 - use neutral defaults)
        "momentum_dir": 0,  # Neutral
        "momentum_str": 0,
        "momentum_aligned": False,
        "full_alignment": False,
        
        # Regime (unknown in v1)
        "regime": "unknown_v1",
        "regime_confidence": 0,
        "dynamic_min_edge": 0.15,  # V1 used 15% but was buggy
        
        # Volatility (unknown in v1)
        "vol_ratio": 1.0,
        "vol_aligned": False,
        "vol_bonus": 0,
        
        # Position sizing (V1 used different logic)
        "kelly_fraction_base": 0.10,  # V1 default
        "kelly_fraction_used": 0.10,
        "regime_multiplier": 1.0,
        "vol_multiplier": 1.0,
        "size_multiplier_total": 1.0,
        
        # Price sources (unknown in v1)
        "price_sources": [],
        
        # Migration metadata
        "migrated_from_v1": True,
        "migration_timestamp": datetime.now(timezone.utc).isoformat()
    }
    
    # Preserve order status if exists
    if "order_status" in v1_trade:
        v2_trade["order_status"] = v1_trade["order_status"]
    
    return v2_trade


def load_v1_trades():
    """Load V1 trades from file."""
    trades = []
    path = Path(V1_FILE)
    
    if not path.exists():
        print(f"❌ V1 file not found: {V1_FILE}")
        return trades
    
    with open(path) as f:
        for line_num, line in enumerate(f, 1):
            try:
                entry = json.loads(line.strip())
                trades.append(entry)
            except json.JSONDecodeError as e:
                print(f"⚠️ Skipping malformed line {line_num}: {e}")
    
    return trades


def get_existing_v2_timestamps():
    """Get set of timestamps from existing V2 file to avoid duplicates."""
    timestamps = set()
    path = Path(V2_FILE)
    
    if not path.exists():
        return timestamps
    
    with open(path) as f:
        for line in f:
            try:
                entry = json.loads(line.strip())
                if ts := entry.get("timestamp"):
                    timestamps.add(ts)
            except:
                pass
    
    return timestamps


def show_stats(v1_entries):
    """Show statistics about V1 data."""
    trades = [e for e in v1_entries if e.get("type") == "trade"]
    skips = [e for e in v1_entries if e.get("type") == "skip"]
    others = len(v1_entries) - len(trades) - len(skips)
    
    print("=" * 60)
    print("V1 TRADE LOG STATISTICS")
    print("=" * 60)
    print(f"\n📊 Entry Counts")
    print(f"   Total entries:  {len(v1_entries)}")
    print(f"   Trades:         {len(trades)}")
    print(f"   Skips:          {len(skips)}")
    print(f"   Other:          {others}")
    
    if trades:
        # Win/loss breakdown
        won = len([t for t in trades if t.get("result_status") == "won"])
        lost = len([t for t in trades if t.get("result_status") == "lost"])
        pending = len([t for t in trades if t.get("result_status") in ("pending", None)])
        
        print(f"\n📈 Trade Results")
        print(f"   Won:     {won}")
        print(f"   Lost:    {lost}")
        print(f"   Pending: {pending}")
        if won + lost > 0:
            print(f"   Win Rate: {won/(won+lost)*100:.1f}%")
        
        # Asset breakdown
        btc = len([t for t in trades if infer_asset_from_ticker(t.get("ticker", "")) == "btc"])
        eth = len([t for t in trades if infer_asset_from_ticker(t.get("ticker", "")) == "eth"])
        print(f"\n🪙 By Asset")
        print(f"   BTC: {btc}")
        print(f"   ETH: {eth}")
        
        # Side breakdown
        yes = len([t for t in trades if t.get("side") == "yes"])
        no = len([t for t in trades if t.get("side") == "no"])
        print(f"\n📌 By Side")
        print(f"   YES: {yes}")
        print(f"   NO:  {no}")
        
        # Date range
        timestamps = [t.get("timestamp", "") for t in trades if t.get("timestamp")]
        if timestamps:
            timestamps.sort()
            print(f"\n📅 Date Range")
            print(f"   First: {timestamps[0][:10]}")
            print(f"   Last:  {timestamps[-1][:10]}")
    
    print()


def migrate(output_file: str, dry_run: bool = False, append_to_v2: bool = False):
    """Run the migration."""
    v1_entries = load_v1_trades()
    
    if not v1_entries:
        print("No V1 entries to migrate.")
        return
    
    # Get trades only
    v1_trades = [e for e in v1_entries if e.get("type") == "trade"]
    
    if not v1_trades:
        print("No trades found in V1 file (only skips and other entries).")
        return
    
    print(f"📂 Found {len(v1_trades)} trades in V1 file")
    
    # Check for duplicates if appending
    existing_timestamps = set()
    if append_to_v2:
        existing_timestamps = get_existing_v2_timestamps()
        print(f"📂 Found {len(existing_timestamps)} existing entries in V2 file")
    
    # Migrate
    migrated = []
    skipped_duplicates = 0
    
    for v1_trade in v1_trades:
        v2_trade = migrate_trade(v1_trade)
        if v2_trade:
            # Check for duplicate
            if v2_trade["timestamp"] in existing_timestamps:
                skipped_duplicates += 1
                continue
            migrated.append(v2_trade)
    
    print(f"✅ Migrated {len(migrated)} trades to V2 format")
    if skipped_duplicates > 0:
        print(f"⏭️ Skipped {skipped_duplicates} duplicates (already in V2)")
    
    if dry_run:
        print("\n🧪 DRY RUN - no files written")
        print("\nSample migrated trade:")
        if migrated:
            print(json.dumps(migrated[0], indent=2))
        return
    
    # Write output
    target_file = V2_FILE if append_to_v2 else output_file
    mode = "a" if append_to_v2 else "w"
    
    with open(target_file, mode) as f:
        for trade in migrated:
            f.write(json.dumps(trade) + "\n")
    
    print(f"📝 Written to: {target_file}")
    
    if not append_to_v2:
        print(f"\n💡 To merge with V2 file, run:")
        print(f"   cat {output_file} >> {V2_FILE}")
        print(f"   # Or use: --append-to-v2 flag (be careful of duplicates!)")


def main():
    args = sys.argv[1:]
    
    output_file = DEFAULT_OUTPUT
    dry_run = "--dry-run" in args
    stats_only = "--stats" in args
    append_to_v2 = "--append-to-v2" in args
    
    # Parse --output
    for i, arg in enumerate(args):
        if arg == "--output" and i + 1 < len(args):
            output_file = args[i + 1]
    
    if stats_only:
        v1_entries = load_v1_trades()
        show_stats(v1_entries)
    else:
        migrate(output_file, dry_run, append_to_v2)


if __name__ == "__main__":
    main()
