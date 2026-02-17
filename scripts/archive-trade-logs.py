#!/usr/bin/env python3
"""
Archive old trade logs to prevent infinite growth.

Archives trade logs older than specified days (default 90) to:
- data/trading/archive/YYYY/kalshi-trades-YYYY-MM-DD.jsonl.gz

Features:
- Compresses archived logs with gzip
- Organizes by year for easy browsing
- Optional CSV export for analysis
- Dry-run mode to preview actions
- Preserves original file timestamps

Usage:
    python3 archive-trade-logs.py [--days 90] [--dry-run] [--export-csv] [--verbose]
"""

import os
import sys
import json
import gzip
import shutil
import argparse
import csv
from datetime import datetime, timedelta
from pathlib import Path

# Paths
SCRIPT_DIR = Path(__file__).parent.resolve()
PROJECT_ROOT = SCRIPT_DIR.parent
DATA_DIR = PROJECT_ROOT / "data" / "trading"
ARCHIVE_DIR = DATA_DIR / "archive"

def get_trade_log_files():
    """Find all trade log files (kalshi-trades-YYYY-MM-DD.jsonl)."""
    files = []
    pattern = "kalshi-trades-20"  # Pattern for dated files
    
    for f in DATA_DIR.glob("kalshi-trades-*.jsonl"):
        # Skip -latest.jsonl and non-dated files
        if "-latest" in f.name:
            continue
        # Extract date from filename
        try:
            date_str = f.stem.replace("kalshi-trades-", "")
            file_date = datetime.strptime(date_str, "%Y-%m-%d")
            files.append((f, file_date))
        except ValueError:
            continue
    
    return sorted(files, key=lambda x: x[1])

def archive_file(file_path: Path, file_date: datetime, dry_run: bool, verbose: bool) -> bool:
    """Archive a single trade log file with gzip compression."""
    year = file_date.strftime("%Y")
    archive_year_dir = ARCHIVE_DIR / year
    archive_path = archive_year_dir / f"{file_path.name}.gz"
    
    if verbose:
        print(f"  Archiving: {file_path.name} -> archive/{year}/{file_path.name}.gz")
    
    if dry_run:
        return True
    
    # Create archive directory
    archive_year_dir.mkdir(parents=True, exist_ok=True)
    
    # Compress file
    with open(file_path, 'rb') as f_in:
        with gzip.open(archive_path, 'wb') as f_out:
            shutil.copyfileobj(f_in, f_out)
    
    # Verify archive was created and has content
    if archive_path.exists() and archive_path.stat().st_size > 0:
        # Remove original file
        file_path.unlink()
        return True
    else:
        print(f"  ERROR: Failed to archive {file_path.name}")
        return False

def export_to_csv(files: list, output_path: Path, verbose: bool) -> int:
    """Export all archived trades to a single CSV file."""
    all_trades = []
    
    for file_path, file_date in files:
        if verbose:
            print(f"  Reading: {file_path.name}")
        
        with open(file_path, 'r') as f:
            for line in f:
                try:
                    trade = json.loads(line.strip())
                    # Flatten nested dicts for CSV
                    flat_trade = {}
                    for k, v in trade.items():
                        if isinstance(v, dict):
                            for k2, v2 in v.items():
                                flat_trade[f"{k}_{k2}"] = v2
                        else:
                            flat_trade[k] = v
                    all_trades.append(flat_trade)
                except json.JSONDecodeError:
                    continue
    
    if not all_trades:
        print("  No trades found to export")
        return 0
    
    # Get all unique keys
    all_keys = set()
    for trade in all_trades:
        all_keys.update(trade.keys())
    
    # Sort keys for consistent output
    fieldnames = sorted(all_keys)
    
    # Write CSV
    with open(output_path, 'w', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames, extrasaction='ignore')
        writer.writeheader()
        writer.writerows(all_trades)
    
    return len(all_trades)

def main():
    parser = argparse.ArgumentParser(description="Archive old trade logs")
    parser.add_argument("--days", type=int, default=90,
                        help="Archive files older than this many days (default: 90)")
    parser.add_argument("--dry-run", action="store_true",
                        help="Preview actions without making changes")
    parser.add_argument("--export-csv", action="store_true",
                        help="Export archived trades to CSV before archiving")
    parser.add_argument("--csv-output", type=str, default=None,
                        help="CSV output path (default: data/trading/archive/trades-export-YYYY-MM-DD.csv)")
    parser.add_argument("--verbose", "-v", action="store_true",
                        help="Verbose output")
    args = parser.parse_args()
    
    cutoff_date = datetime.now() - timedelta(days=args.days)
    
    print(f"📦 Trade Log Archiver")
    print(f"   Cutoff: {args.days} days ({cutoff_date.strftime('%Y-%m-%d')})")
    print(f"   Mode: {'DRY RUN' if args.dry_run else 'LIVE'}")
    print()
    
    # Find files to archive
    all_files = get_trade_log_files()
    files_to_archive = [(f, d) for f, d in all_files if d < cutoff_date]
    
    if not files_to_archive:
        print(f"✅ No files older than {args.days} days to archive")
        print(f"   Total files: {len(all_files)}")
        if all_files:
            oldest = all_files[0][1].strftime('%Y-%m-%d')
            newest = all_files[-1][1].strftime('%Y-%m-%d')
            print(f"   Date range: {oldest} to {newest}")
        return 0
    
    print(f"📁 Found {len(files_to_archive)} files to archive:")
    
    total_size = sum(f.stat().st_size for f, d in files_to_archive)
    print(f"   Total size: {total_size / 1024:.1f} KB")
    
    if args.verbose:
        for f, d in files_to_archive:
            print(f"   - {f.name} ({f.stat().st_size / 1024:.1f} KB)")
    print()
    
    # Export to CSV if requested
    if args.export_csv:
        csv_path = args.csv_output
        if not csv_path:
            ARCHIVE_DIR.mkdir(parents=True, exist_ok=True)
            csv_path = ARCHIVE_DIR / f"trades-export-{datetime.now().strftime('%Y-%m-%d')}.csv"
        else:
            csv_path = Path(csv_path)
        
        print(f"📊 Exporting to CSV: {csv_path}")
        if not args.dry_run:
            count = export_to_csv(files_to_archive, csv_path, args.verbose)
            print(f"   Exported {count} trade records")
        print()
    
    # Archive files
    print(f"🗜️ Archiving files...")
    archived = 0
    for file_path, file_date in files_to_archive:
        if archive_file(file_path, file_date, args.dry_run, args.verbose):
            archived += 1
    
    print()
    print(f"✅ {'Would archive' if args.dry_run else 'Archived'} {archived}/{len(files_to_archive)} files")
    
    if not args.dry_run:
        # Show archive size
        if ARCHIVE_DIR.exists():
            archive_size = sum(f.stat().st_size for f in ARCHIVE_DIR.rglob("*.gz"))
            print(f"   Archive size: {archive_size / 1024:.1f} KB")
    
    return 0

if __name__ == "__main__":
    sys.exit(main())
