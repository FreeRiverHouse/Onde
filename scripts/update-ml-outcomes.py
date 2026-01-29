#!/usr/bin/env python3
"""
Update ML Feature Log with Settlement Outcomes (T331)

This script reconciles the ML training data with settled trade results.
It reads settled trades from kalshi-trades-v2.jsonl and updates 
the corresponding records in ml-training-data.jsonl with actual outcomes.

Run after settlement tracker has updated trade results.
"""

import json
import os
from pathlib import Path
from datetime import datetime, timezone
import argparse

# Paths
ML_FEATURE_LOG = Path("data/trading/ml-training-data.jsonl")
TRADE_LOG = Path("scripts/kalshi-trades-v2.jsonl")
ML_FEATURE_LOG_UPDATED = Path("data/trading/ml-training-data-updated.jsonl")

def load_trades() -> dict:
    """Load settled trades into a dict keyed by ticker+timestamp"""
    trades = {}
    if not TRADE_LOG.exists():
        print(f"⚠️  Trade log not found: {TRADE_LOG}")
        return trades
    
    with open(TRADE_LOG) as f:
        for line in f:
            try:
                entry = json.loads(line.strip())
                if entry.get("type") != "trade":
                    continue
                
                # Only include settled trades
                status = entry.get("result_status", "pending")
                if status not in ("won", "lost"):
                    continue
                
                # Key: timestamp + ticker
                ts = entry.get("timestamp", "")
                ticker = entry.get("ticker", "")
                key = f"{ts}_{ticker}"
                
                trades[key] = {
                    "result_status": status,
                    "profit_cents": entry.get("profit_cents", 0),
                    "settlement_price": entry.get("settlement_price"),
                }
            except json.JSONDecodeError:
                continue
    
    return trades


def update_ml_log(dry_run: bool = False, verbose: bool = False):
    """Update ML feature log with settlement outcomes"""
    if not ML_FEATURE_LOG.exists():
        print(f"⚠️  ML feature log not found: {ML_FEATURE_LOG}")
        return
    
    trades = load_trades()
    print(f"📊 Loaded {len(trades)} settled trades")
    
    updated_count = 0
    already_filled = 0
    not_found = 0
    records = []
    
    with open(ML_FEATURE_LOG) as f:
        for line in f:
            try:
                record = json.loads(line.strip())
                trade_id = record.get("id", "")
                
                # Check if outcome already filled
                if record.get("actual_outcome") is not None:
                    already_filled += 1
                    records.append(record)
                    continue
                
                # Look for matching trade
                if trade_id in trades:
                    trade = trades[trade_id]
                    record["actual_outcome"] = 1 if trade["result_status"] == "won" else 0
                    record["profit_cents"] = trade.get("profit_cents")
                    record["settlement_price"] = trade.get("settlement_price")
                    updated_count += 1
                    
                    if verbose:
                        outcome = "✅ WON" if record["actual_outcome"] == 1 else "❌ LOST"
                        print(f"  Updated {trade_id[:30]}... → {outcome}")
                else:
                    not_found += 1
                
                records.append(record)
                
            except json.JSONDecodeError:
                continue
    
    print(f"\n📈 Results:")
    print(f"   Updated: {updated_count}")
    print(f"   Already filled: {already_filled}")
    print(f"   Pending (not settled): {not_found}")
    
    if dry_run:
        print(f"\n🧪 DRY RUN - no changes written")
        return
    
    # Write updated records back
    with open(ML_FEATURE_LOG_UPDATED, "w") as f:
        for record in records:
            f.write(json.dumps(record) + "\n")
    
    # Replace original with updated
    os.replace(ML_FEATURE_LOG_UPDATED, ML_FEATURE_LOG)
    print(f"\n✅ ML feature log updated: {ML_FEATURE_LOG}")


def analyze_ml_data():
    """Print summary statistics of the ML dataset"""
    if not ML_FEATURE_LOG.exists():
        print(f"⚠️  No ML data yet: {ML_FEATURE_LOG}")
        return
    
    total = 0
    with_outcomes = 0
    wins = 0
    losses = 0
    features_count = {}
    
    with open(ML_FEATURE_LOG) as f:
        for line in f:
            try:
                record = json.loads(line.strip())
                total += 1
                
                if record.get("actual_outcome") is not None:
                    with_outcomes += 1
                    if record["actual_outcome"] == 1:
                        wins += 1
                    else:
                        losses += 1
                
                # Count non-null features
                for key, val in record.items():
                    if val is not None:
                        features_count[key] = features_count.get(key, 0) + 1
                        
            except json.JSONDecodeError:
                continue
    
    print(f"\n📊 ML Dataset Summary")
    print(f"{'='*40}")
    print(f"Total records: {total}")
    print(f"With outcomes: {with_outcomes}")
    print(f"  Wins: {wins}")
    print(f"  Losses: {losses}")
    if with_outcomes > 0:
        print(f"  Win rate: {wins/with_outcomes*100:.1f}%")
    print(f"Pending: {total - with_outcomes}")
    print(f"\n📋 Features available: {len(features_count)}")
    
    # Show feature fill rates
    print(f"\n📈 Feature fill rates (top 10):")
    sorted_features = sorted(features_count.items(), key=lambda x: -x[1])
    for feat, count in sorted_features[:10]:
        pct = count/total*100 if total > 0 else 0
        print(f"   {feat}: {pct:.0f}%")


def export_training_csv(output: str = None):
    """Export ML data to CSV for model training"""
    import csv
    
    if not ML_FEATURE_LOG.exists():
        print(f"⚠️  No ML data: {ML_FEATURE_LOG}")
        return
    
    output_path = Path(output) if output else Path("data/trading/ml-training-data.csv")
    output_path.parent.mkdir(parents=True, exist_ok=True)
    
    records = []
    headers = set()
    
    with open(ML_FEATURE_LOG) as f:
        for line in f:
            try:
                record = json.loads(line.strip())
                # Only include records with outcomes for training
                if record.get("actual_outcome") is not None:
                    records.append(record)
                    headers.update(record.keys())
            except json.JSONDecodeError:
                continue
    
    if not records:
        print("⚠️  No records with outcomes to export")
        return
    
    # Sort headers for consistent output
    headers = sorted(headers)
    
    with open(output_path, "w", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=headers)
        writer.writeheader()
        for record in records:
            writer.writerow(record)
    
    print(f"✅ Exported {len(records)} records to {output_path}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Update ML features with settlement outcomes")
    parser.add_argument("--dry-run", action="store_true", help="Don't write changes")
    parser.add_argument("--verbose", "-v", action="store_true", help="Show individual updates")
    parser.add_argument("--analyze", action="store_true", help="Show dataset statistics")
    parser.add_argument("--export-csv", action="store_true", help="Export to CSV for training")
    parser.add_argument("--output", help="Output path for CSV export")
    
    args = parser.parse_args()
    
    if args.analyze:
        analyze_ml_data()
    elif args.export_csv:
        export_training_csv(args.output)
    else:
        update_ml_log(dry_run=args.dry_run, verbose=args.verbose)
