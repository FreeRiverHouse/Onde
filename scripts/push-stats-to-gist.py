#!/usr/bin/env python3
"""
Push trading stats to GitHub Gist for static site consumption.

Creates/updates a public gist with trading stats JSON that the static site
can fetch at runtime, bypassing the static export limitation.

Usage:
    python push-stats-to-gist.py [--create] [--source v1|v2|v3|all] [--polymarket]

Options:
    --create        Create a new gist (first run only)
    --source X      Data source: v1, v2, v3, or all (combined). Default: v2
    --polymarket    Also push Polymarket positions data to gist
"""

import json
import subprocess
import sys
import time
from datetime import datetime, timezone
from pathlib import Path

# Paths
SCRIPT_DIR = Path(__file__).parent
TRADES_FILE_V1 = SCRIPT_DIR / "kalshi-trades.jsonl"
TRADES_FILE_V2 = SCRIPT_DIR / "kalshi-trades-v2.jsonl"
TRADES_FILE_V3 = SCRIPT_DIR.parent / "data" / "trading" / "kalshi-v3-trades.jsonl"
TRADES_FILE_UNIFIED = SCRIPT_DIR.parent / "data" / "trading" / "kalshi-unified-trades.jsonl"
POLYMARKET_POSITIONS_FILE = SCRIPT_DIR.parent / "data" / "memory-backups" / "2026-02-15" / "memory" / "polymarket-positions.json"
POLYMARKET_STATS_FILENAME = "onde-polymarket-stats.json"
SETTLEMENTS_FILE_V1 = SCRIPT_DIR / "kalshi-settlements.json"  # T349
SETTLEMENTS_FILE_V2 = SCRIPT_DIR / "kalshi-settlements-v2.json"  # T349
GIST_ID_FILE = SCRIPT_DIR.parent / "data" / "trading" / "stats-gist-id.txt"
VOLATILITY_FILE = SCRIPT_DIR.parent / "data" / "ohlc" / "volatility-stats.json"
HEALTH_STATUS_FILE = SCRIPT_DIR.parent / "data" / "trading" / "autotrader-health.json"  # T472
API_LATENCY_FILE = SCRIPT_DIR / "kalshi-latency-profile.json"  # T398
LATENCY_HISTORY_FILE = SCRIPT_DIR.parent / "data" / "trading" / "latency-history.jsonl"  # T800
CONCENTRATION_HISTORY_FILE = SCRIPT_DIR.parent / "data" / "trading" / "concentration-history.jsonl"  # T482
ASSET_CORRELATION_FILE = SCRIPT_DIR.parent / "data" / "trading" / "asset-correlation.json"  # T721
STREAK_POSITION_FILE = SCRIPT_DIR.parent / "data" / "trading" / "streak-position-analysis.json"  # T387
HOUR_DAY_HEATMAP_FILE = SCRIPT_DIR.parent / "data" / "trading" / "hour-day-heatmap.json"  # T411
TRADING_RECOMMENDATIONS_FILE = SCRIPT_DIR.parent / "data" / "trading" / "trading-recommendations.json"  # T412
GIST_PUSH_ERROR_LOG = SCRIPT_DIR.parent / "data" / "trading" / "gist-push-errors.log"  # T767
HEALTH_HISTORY_FILE = SCRIPT_DIR.parent / "data" / "trading" / "health-history.jsonl"  # T829
MOMENTUM_REGIME_FILE = SCRIPT_DIR.parent / "data" / "trading" / "momentum-regime.json"  # T853
STATS_FILENAME = "onde-trading-stats.json"

# Retry configuration (T767)
MAX_RETRIES = 3
INITIAL_BACKOFF_SECONDS = 2  # Doubles each retry: 2, 4, 8
CONSECUTIVE_FAILURES_FILE = SCRIPT_DIR.parent / "data" / "trading" / "gist-consecutive-failures.txt"


def log_gist_error(message: str):
    """Log gist push errors to file (T767)."""
    GIST_PUSH_ERROR_LOG.parent.mkdir(parents=True, exist_ok=True)
    timestamp = datetime.now(timezone.utc).isoformat()
    with open(GIST_PUSH_ERROR_LOG, "a") as f:
        f.write(f"{timestamp} | {message}\n")


def track_consecutive_failures(success: bool):
    """Track consecutive failures and alert if threshold exceeded (T767).
    
    Returns the current failure count.
    """
    CONSECUTIVE_FAILURES_FILE.parent.mkdir(parents=True, exist_ok=True)
    
    if success:
        # Reset on success
        if CONSECUTIVE_FAILURES_FILE.exists():
            CONSECUTIVE_FAILURES_FILE.unlink()
        return 0
    
    # Increment failure count
    count = 1
    if CONSECUTIVE_FAILURES_FILE.exists():
        try:
            count = int(CONSECUTIVE_FAILURES_FILE.read_text().strip()) + 1
        except ValueError:
            count = 1
    
    CONSECUTIVE_FAILURES_FILE.write_text(str(count))
    
    # Alert if 3 consecutive failures
    if count >= 3:
        alert_file = SCRIPT_DIR / "kalshi-gist-push-failed.alert"
        alert_file.write_text(f"Gist push failed {count} consecutive times. Check gist-push-errors.log for details.")
        print(f"⚠️ Created alert: {count} consecutive gist push failures")
    
    return count

def load_volatility_stats():
    """Load volatility stats from OHLC analysis."""
    if not VOLATILITY_FILE.exists():
        return None
    
    try:
        with open(VOLATILITY_FILE, 'r') as f:
            data = json.load(f)
        
        # Extract compact summary for each asset
        vol_summary = {
            "generated_at": data.get("generated_at"),
            "assets": {}
        }
        
        for asset, asset_data in data.get("assets", {}).items():
            periods = asset_data.get("periods", {})
            model_assumption = asset_data.get("model_assumption_hourly", 0) * 100
            
            # Get 7d, 14d, 30d volatility
            vol_summary["assets"][asset] = {
                "modelAssumption": round(model_assumption, 2),
                "periods": {}
            }
            
            for period in ["7d", "14d", "30d"]:
                if period in periods and "vol_hourly" not in periods[period].get("error", ""):
                    p = periods[period]
                    vol_summary["assets"][asset]["periods"][period] = {
                        "realized": round(p.get("vol_hourly", 0), 2),
                        "deviation": round(p.get("deviation_from_model_pct", 0), 1),
                        "priceRangePct": round(p.get("price_range_pct", 0), 2)
                    }
        
        return vol_summary
    except Exception as e:
        print(f"Warning: Could not load volatility stats: {e}")
        return None


def load_api_latency_stats():
    """Load API latency profile stats (T398).
    
    Reads the latency profile generated by the autotrader and creates
    a summary suitable for dashboard display.
    """
    if not API_LATENCY_FILE.exists():
        return None
    
    try:
        with open(API_LATENCY_FILE, 'r') as f:
            profile = json.load(f)
        
        endpoints = profile.get("endpoints", {})
        if not endpoints:
            return None
        
        # Categorize endpoints
        categories = {
            "kalshi": {"endpoints": [], "total_calls": 0, "latencies": []},
            "binance": {"endpoints": [], "total_calls": 0, "latencies": []},
            "coingecko": {"endpoints": [], "total_calls": 0, "latencies": []},
            "coinbase": {"endpoints": [], "total_calls": 0, "latencies": []},
            "other": {"endpoints": [], "total_calls": 0, "latencies": []}
        }
        
        for endpoint, stats in endpoints.items():
            count = stats.get("count", 0)
            if count == 0:
                continue
            
            avg_ms = stats.get("avg_ms", 0)
            
            # Categorize by endpoint name
            if "kalshi" in endpoint.lower():
                cat = "kalshi"
            elif "binance" in endpoint.lower():
                cat = "binance"
            elif "coingecko" in endpoint.lower() or "gecko" in endpoint.lower():
                cat = "coingecko"
            elif "coinbase" in endpoint.lower():
                cat = "coinbase"
            else:
                cat = "other"
            
            categories[cat]["endpoints"].append({
                "name": endpoint,
                "count": count,
                "avgMs": round(avg_ms, 1),
                "p95Ms": round(stats.get("p95_ms", avg_ms), 1),
                "maxMs": round(stats.get("max_ms", avg_ms), 1)
            })
            categories[cat]["total_calls"] += count
            categories[cat]["latencies"].append(avg_ms)
        
        # Calculate category summaries
        summary = {
            "generated_at": profile.get("generated_at", datetime.now(timezone.utc).isoformat()),
            "categories": {},
            "slowest": [],
            "overall": {
                "total_calls": 0,
                "avg_latency_ms": 0
            }
        }
        
        all_latencies = []
        for cat_name, cat_data in categories.items():
            if cat_data["total_calls"] > 0:
                cat_avg = sum(cat_data["latencies"]) / len(cat_data["latencies"])
                summary["categories"][cat_name] = {
                    "total_calls": cat_data["total_calls"],
                    "endpoint_count": len(cat_data["endpoints"]),
                    "avg_latency_ms": round(cat_avg, 1),
                    "endpoints": sorted(cat_data["endpoints"], key=lambda x: -x["avgMs"])[:5]  # Top 5 slowest
                }
                summary["overall"]["total_calls"] += cat_data["total_calls"]
                all_latencies.extend(cat_data["latencies"])
        
        if all_latencies:
            summary["overall"]["avg_latency_ms"] = round(sum(all_latencies) / len(all_latencies), 1)
        
        # Get top 5 slowest endpoints overall
        all_endpoints = []
        for cat_data in categories.values():
            all_endpoints.extend(cat_data["endpoints"])
        summary["slowest"] = sorted(all_endpoints, key=lambda x: -x["avgMs"])[:5]
        
        return summary
    except Exception as e:
        print(f"Warning: Could not load API latency stats: {e}")
        return None


def load_latency_history():
    """Load latency history for sparkline visualization (T800).
    
    Reads the latency history JSONL file and extracts time-series data
    for displaying a 24h latency trend sparkline on the dashboard.
    """
    if not LATENCY_HISTORY_FILE.exists():
        return None
    
    try:
        history = []
        with open(LATENCY_HISTORY_FILE, 'r') as f:
            for line in f:
                if line.strip():
                    entry = json.loads(line)
                    history.append(entry)
        
        if not history:
            return None
        
        # Sort by timestamp (most recent last)
        history.sort(key=lambda x: x.get("timestamp", ""))
        
        # Keep last 48 entries (24h at 30min intervals)
        history = history[-48:]
        
        # Extract data points for sparkline
        data_points = []
        for entry in history:
            endpoints = entry.get("endpoints", {})
            
            # Calculate overall average latency across all endpoints (T820: added p50, p99)
            total_latency = 0
            total_count = 0
            max_p50 = 0
            max_p95 = 0
            max_p99 = 0
            
            for endpoint_name, stats in endpoints.items():
                count = stats.get("count", 0)
                avg_ms = stats.get("avg_ms", 0)
                p50_ms = stats.get("p50_ms", 0)
                p95_ms = stats.get("p95_ms", 0)
                p99_ms = stats.get("p99_ms", 0)
                
                if count > 0:
                    total_latency += avg_ms * count
                    total_count += count
                    max_p50 = max(max_p50, p50_ms)
                    max_p95 = max(max_p95, p95_ms)
                    max_p99 = max(max_p99, p99_ms)
            
            if total_count > 0:
                data_points.append({
                    "timestamp": entry.get("timestamp"),
                    "avgMs": round(total_latency / total_count, 1),
                    "p50Ms": round(max_p50, 1),  # T820
                    "p95Ms": round(max_p95, 1),
                    "p99Ms": round(max_p99, 1),  # T820
                    "count": total_count
                })
        
        if not data_points:
            return None
        
        # Calculate summary stats (T820: added percentile stats)
        avg_values = [d["avgMs"] for d in data_points]
        p50_values = [d.get("p50Ms", 0) for d in data_points if d.get("p50Ms", 0) > 0]
        p95_values = [d["p95Ms"] for d in data_points]
        p99_values = [d.get("p99Ms", 0) for d in data_points if d.get("p99Ms", 0) > 0]
        
        return {
            "generated_at": datetime.now(timezone.utc).isoformat(),
            "dataPoints": data_points,
            "summary": {
                "avgLatencyMs": round(sum(avg_values) / len(avg_values), 1),
                "minLatencyMs": round(min(avg_values), 1),
                "maxLatencyMs": round(max(avg_values), 1),
                "avgP50Ms": round(sum(p50_values) / len(p50_values), 1) if p50_values else 0,  # T820
                "avgP95Ms": round(sum(p95_values) / len(p95_values), 1),
                "maxP95Ms": round(max(p95_values), 1),
                "avgP99Ms": round(sum(p99_values) / len(p99_values), 1) if p99_values else 0,  # T820
                "maxP99Ms": round(max(p99_values), 1) if p99_values else 0,  # T820
                "dataPointCount": len(data_points)
            }
        }
    except Exception as e:
        print(f"Warning: Could not load latency history: {e}")
        return None


def load_settlements_stats():
    """Load settlement statistics from v1 and v2 files (T349).
    
    Returns combined settlement stats for dashboard display.
    """
    def process_settlements_file(filepath):
        """Process a single settlements file."""
        if not filepath.exists():
            return {
                "totalSettled": 0,
                "totalPending": 0,
                "totalWon": 0,
                "totalLost": 0,
                "winRate": 0,
                "totalPnlCents": 0,
                "totalPayoutCents": 0,
                "byAsset": {
                    "BTC": {"settled": 0, "won": 0, "lost": 0, "pending": 0, "pnlCents": 0},
                    "ETH": {"settled": 0, "won": 0, "lost": 0, "pending": 0, "pnlCents": 0}
                },
                "lastSettlementTime": None,
                "oldestPendingTime": None
            }
        
        try:
            with open(filepath, 'r') as f:
                data = json.load(f)
            
            trades = data.get("trades", {})
            
            settled = [t for t in trades.values() if t.get("status") == "settled"]
            pending = [t for t in trades.values() if t.get("status") != "settled"]
            
            won = [t for t in settled if t.get("won", False)]
            lost = [t for t in settled if not t.get("won", False)]
            
            total_pnl = sum(t.get("pnl_cents", 0) for t in settled)
            total_payout = sum(t.get("payout_cents", 0) for t in settled)
            
            # By asset breakdown
            by_asset = {
                "BTC": {"settled": 0, "won": 0, "lost": 0, "pending": 0, "pnlCents": 0},
                "ETH": {"settled": 0, "won": 0, "lost": 0, "pending": 0, "pnlCents": 0}
            }
            
            for ticker, t in trades.items():
                asset = "ETH" if "KXETHD" in ticker else "BTC"
                if t.get("status") == "settled":
                    by_asset[asset]["settled"] += 1
                    by_asset[asset]["pnlCents"] += t.get("pnl_cents", 0)
                    if t.get("won"):
                        by_asset[asset]["won"] += 1
                    else:
                        by_asset[asset]["lost"] += 1
                else:
                    by_asset[asset]["pending"] += 1
            
            # Settlement times
            settlement_times = [t.get("expiry_time") for t in settled if t.get("expiry_time")]
            pending_times = [t.get("expiry_time") for t in pending if t.get("expiry_time")]
            
            return {
                "totalSettled": len(settled),
                "totalPending": len(pending),
                "totalWon": len(won),
                "totalLost": len(lost),
                "winRate": round(len(won) / len(settled) * 100, 1) if settled else 0,
                "totalPnlCents": total_pnl,
                "totalPayoutCents": total_payout,
                "byAsset": by_asset,
                "lastSettlementTime": max(settlement_times) if settlement_times else None,
                "oldestPendingTime": min(pending_times) if pending_times else None
            }
        except Exception as e:
            print(f"Warning: Could not load settlements from {filepath}: {e}")
            return None
    
    v1_stats = process_settlements_file(SETTLEMENTS_FILE_V1)
    v2_stats = process_settlements_file(SETTLEMENTS_FILE_V2)
    
    # Combine stats
    def combine_stats(a, b):
        if a is None and b is None:
            return None
        a = a or {"totalSettled": 0, "totalPending": 0, "totalWon": 0, "totalLost": 0, 
                  "totalPnlCents": 0, "totalPayoutCents": 0, "byAsset": {
                      "BTC": {"settled": 0, "won": 0, "lost": 0, "pending": 0, "pnlCents": 0},
                      "ETH": {"settled": 0, "won": 0, "lost": 0, "pending": 0, "pnlCents": 0}
                  }}
        b = b or {"totalSettled": 0, "totalPending": 0, "totalWon": 0, "totalLost": 0,
                  "totalPnlCents": 0, "totalPayoutCents": 0, "byAsset": {
                      "BTC": {"settled": 0, "won": 0, "lost": 0, "pending": 0, "pnlCents": 0},
                      "ETH": {"settled": 0, "won": 0, "lost": 0, "pending": 0, "pnlCents": 0}
                  }}
        
        combined = {
            "totalSettled": a["totalSettled"] + b["totalSettled"],
            "totalPending": a["totalPending"] + b["totalPending"],
            "totalWon": a["totalWon"] + b["totalWon"],
            "totalLost": a["totalLost"] + b["totalLost"],
            "totalPnlCents": a["totalPnlCents"] + b["totalPnlCents"],
            "totalPayoutCents": a["totalPayoutCents"] + b["totalPayoutCents"],
            "byAsset": {}
        }
        
        combined["winRate"] = round(combined["totalWon"] / combined["totalSettled"] * 100, 1) if combined["totalSettled"] > 0 else 0
        
        for asset in ["BTC", "ETH"]:
            combined["byAsset"][asset] = {
                "settled": a["byAsset"][asset]["settled"] + b["byAsset"][asset]["settled"],
                "won": a["byAsset"][asset]["won"] + b["byAsset"][asset]["won"],
                "lost": a["byAsset"][asset]["lost"] + b["byAsset"][asset]["lost"],
                "pending": a["byAsset"][asset]["pending"] + b["byAsset"][asset]["pending"],
                "pnlCents": a["byAsset"][asset]["pnlCents"] + b["byAsset"][asset]["pnlCents"]
            }
        
        # Use most recent settlement time
        times = [x for x in [a.get("lastSettlementTime"), b.get("lastSettlementTime")] if x]
        combined["lastSettlementTime"] = max(times) if times else None
        
        # Use oldest pending time
        pending_times = [x for x in [a.get("oldestPendingTime"), b.get("oldestPendingTime")] if x]
        combined["oldestPendingTime"] = min(pending_times) if pending_times else None
        
        return combined
    
    combined = combine_stats(v1_stats, v2_stats)
    
    return {
        "v1": v1_stats,
        "v2": v2_stats,
        "combined": combined
    }


def load_health_status():
    """Load autotrader health status (T620).
    
    Supports both formats:
    - T472 format (from autotrader internal): is_running, last_cycle_time, etc.
    - T488 format (from external script): process.running, status, issues, etc.
    """
    if not HEALTH_STATUS_FILE.exists():
        return None
    
    try:
        with open(HEALTH_STATUS_FILE, 'r') as f:
            data = json.load(f)
        
        # Detect format by checking for T472 field (is_running) vs T488 field (process)
        if "is_running" in data:
            # T472 format (autotrader internal - preferred)
            return {
                "is_running": data.get("is_running", False),
                "last_cycle_time": data.get("last_cycle_time"),
                "cycle_count": data.get("cycle_count", 0),
                "dry_run": data.get("dry_run", False),
                "trades_today": data.get("trades_today", 0),
                "today_won": data.get("today_won", 0),
                "today_lost": data.get("today_lost", 0),
                "today_pending": data.get("today_pending", 0),
                "win_rate_today": data.get("win_rate_today", 0),
                "pnl_today_cents": data.get("pnl_today_cents", 0),
                "circuit_breaker_active": data.get("circuit_breaker_active", False),
                "consecutive_losses": data.get("consecutive_losses", 0),
                "status": data.get("status", "unknown"),
                "format": "t472"
            }
        elif "process" in data:
            # T488 format (external script - backward compat)
            process = data.get("process", {})
            trades = data.get("trades", {})
            log = data.get("log", {})
            return {
                "is_running": process.get("running", False),
                "last_cycle_time": data.get("generated_at"),
                "status": data.get("status", "unknown"),
                "issues": data.get("issues", []),
                "trades_24h": trades.get("trades_24h", 0),
                "log_active": log.get("log_active", False),
                "log_age_minutes": log.get("log_age_minutes"),
                "format": "t488"
            }
        else:
            return None
    except Exception as e:
        print(f"Warning: Could not load health status: {e}")
        return None


def load_health_history(limit=200, days=7):
    """Load autotrader health history for dashboard chart (T829).
    
    Reads health-history.jsonl generated by log-health-history.py
    to display uptime timeline, circuit breaker events, etc.
    
    Args:
        limit: Maximum number of snapshots to return (default 200)
        days: Only include data from last N days (default 7)
    
    Returns:
        Health history data dict or None if not available
    """
    if not HEALTH_HISTORY_FILE.exists():
        return None
    
    try:
        from datetime import timedelta
        cutoff = datetime.now(timezone.utc) - timedelta(days=days)
        
        snapshots = []
        with open(HEALTH_HISTORY_FILE, 'r') as f:
            for line in f:
                line = line.strip()
                if not line:
                    continue
                try:
                    snapshot = json.loads(line)
                    # Filter by date
                    ts = snapshot.get("timestamp", "")
                    if ts:
                        entry_time = datetime.fromisoformat(ts.replace("Z", "+00:00"))
                        if entry_time >= cutoff:
                            snapshots.append(snapshot)
                except (json.JSONDecodeError, ValueError):
                    continue
        
        if not snapshots:
            return None
        
        # Sort by timestamp and limit
        snapshots.sort(key=lambda x: x.get("timestamp", ""))
        snapshots = snapshots[-limit:]  # Keep most recent
        
        # Calculate summary stats
        total = len(snapshots)
        running_count = sum(1 for s in snapshots if s.get("is_running", False))
        cb_count = sum(1 for s in snapshots if s.get("circuit_breaker_active", False))
        
        # Find downtime periods
        downtime_periods = []
        current_downtime_start = None
        for s in snapshots:
            if not s.get("is_running", False):
                if current_downtime_start is None:
                    current_downtime_start = s.get("timestamp")
            else:
                if current_downtime_start is not None:
                    downtime_periods.append({
                        "start": current_downtime_start,
                        "end": s.get("timestamp")
                    })
                    current_downtime_start = None
        
        # If still down, add ongoing period
        if current_downtime_start is not None:
            downtime_periods.append({
                "start": current_downtime_start,
                "end": None,
                "ongoing": True
            })
        
        # Calculate uptime percentage
        uptime_pct = (running_count / total * 100) if total > 0 else 0
        
        return {
            "snapshots": snapshots,
            "dataPoints": total,
            "uptimePct": round(uptime_pct, 1),
            "runningCount": running_count,
            "circuitBreakerCount": cb_count,
            "downtimePeriods": downtime_periods,
            "latestStatus": snapshots[-1].get("status") if snapshots else None,
            "lastUpdated": snapshots[-1].get("timestamp") if snapshots else None
        }
    except Exception as e:
        print(f"Warning: Could not load health history: {e}")
        return None


def load_concentration_history(limit=200):
    """Load portfolio concentration history for dashboard chart (T482).
    
    Reads the concentration-history.jsonl file and returns recent snapshots
    for the dashboard to display concentration trends over time.
    
    Args:
        limit: Maximum number of snapshots to return (default 200)
    
    Returns:
        List of concentration snapshots, most recent first
    """
    if not CONCENTRATION_HISTORY_FILE.exists():
        return None
    
    try:
        snapshots = []
        with open(CONCENTRATION_HISTORY_FILE, 'r') as f:
            for line in f:
                line = line.strip()
                if not line:
                    continue
                try:
                    snapshot = json.loads(line)
                    snapshots.append(snapshot)
                except json.JSONDecodeError:
                    continue
        
        if not snapshots:
            return None
        
        # Sort by timestamp descending and limit
        snapshots.sort(key=lambda x: x.get('timestamp', ''), reverse=True)
        snapshots = snapshots[:limit]
        
        # Reverse to get chronological order for charting
        snapshots.reverse()
        
        # Calculate summary stats
        latest = snapshots[-1] if snapshots else {}
        asset_classes = set()
        max_concentration = 0
        warning_count = 0
        
        for s in snapshots:
            asset_classes.update(s.get('by_asset_class', {}).keys())
            max_pct = max(s.get('by_asset_class', {}).values()) if s.get('by_asset_class') else 0
            max_concentration = max(max_concentration, max_pct)
            if max_pct > 0.4:  # Warning threshold
                warning_count += 1
        
        return {
            "snapshots": snapshots,
            "dataPoints": len(snapshots),
            "assetClasses": list(asset_classes),
            "maxConcentration": max_concentration,
            "warningPct": warning_count / len(snapshots) * 100 if snapshots else 0,
            "latestConcentrations": latest.get('by_asset_class', {}),
            "lastUpdated": latest.get('timestamp')
        }
    except Exception as e:
        print(f"Warning: Could not load concentration history: {e}")
        return None


def load_asset_correlation():
    """Load asset correlation data for dashboard heatmap widget (T721).
    
    Reads asset-correlation.json generated by btc-eth-correlation.py
    to display correlation matrix and dynamic crypto limits on dashboard.
    
    Returns:
        Correlation data dict or None if not available
    """
    if not ASSET_CORRELATION_FILE.exists():
        return None
    
    try:
        with open(ASSET_CORRELATION_FILE, 'r') as f:
            data = json.load(f)
        
        # Validate required fields
        if 'correlation' not in data or 'adjustment' not in data:
            print(f"Warning: Asset correlation file missing required fields")
            return None
        
        return data
    except Exception as e:
        print(f"Warning: Could not load asset correlation: {e}")
        return None


def load_momentum_regime():
    """Load market momentum regime data for dashboard widget (T853).
    
    Reads momentum-regime.json generated by market-momentum-regime.py
    to display market regime (TRENDING/RANGING/VOLATILE) on dashboard.
    
    Returns:
        Momentum regime data dict or None if not available
    """
    if not MOMENTUM_REGIME_FILE.exists():
        return None
    
    try:
        with open(MOMENTUM_REGIME_FILE, 'r') as f:
            data = json.load(f)
        
        # Validate required fields
        if 'regime' not in data or 'aggregate_score' not in data:
            print(f"Warning: Momentum regime file missing required fields")
            return None
        
        return data
    except Exception as e:
        print(f"Warning: Could not load momentum regime: {e}")
        return None


def load_streak_position_analysis():
    """Load streak position analysis for dashboard widget (T387).
    
    Reads streak-position-analysis.json generated by analyze-streak-position.py
    to display streak patterns and continuation probabilities on dashboard.
    
    Returns:
        Streak position data dict or None if not available
    """
    if not STREAK_POSITION_FILE.exists():
        return None
    
    try:
        with open(STREAK_POSITION_FILE, 'r') as f:
            data = json.load(f)
        
        # Validate required fields
        if 'position_analysis' not in data:
            print(f"Warning: Streak position file missing required fields")
            return None
        
        return data
    except Exception as e:
        print(f"Warning: Could not load streak position analysis: {e}")
        return None


def load_hour_day_heatmap():
    """Load hour/day heatmap data for dashboard visualization (T411).
    
    Reads hour-day-heatmap.json generated by analyze-trades-by-hour-day.py
    to display time-of-day trading heatmap on dashboard.
    
    Returns:
        Heatmap data dict or None if not available
    """
    if not HOUR_DAY_HEATMAP_FILE.exists():
        return None
    
    try:
        with open(HOUR_DAY_HEATMAP_FILE, 'r') as f:
            data = json.load(f)
        
        # Validate required fields
        if 'heatmap' not in data:
            print(f"Warning: Hour/day heatmap file missing required fields")
            return None
        
        return data
    except Exception as e:
        print(f"Warning: Could not load hour/day heatmap: {e}")
        return None


def load_trading_recommendations():
    """Load trading window recommendations for dashboard widget (T790).
    
    Reads trading-recommendations.json generated by recommend-trading-windows.py
    to show optimal trading windows and schedule on dashboard.
    
    Returns:
        Trading recommendations dict or None if not available
    """
    if not TRADING_RECOMMENDATIONS_FILE.exists():
        return None
    
    try:
        with open(TRADING_RECOMMENDATIONS_FILE, 'r') as f:
            data = json.load(f)
        
        # Validate required fields
        if 'recommendations' not in data:
            print(f"Warning: Trading recommendations file missing required fields")
            return None
        
        return data
    except Exception as e:
        print(f"Warning: Could not load trading recommendations: {e}")
        return None


# Path for stop-loss log (T366)
STOP_LOSS_LOG = SCRIPT_DIR / "kalshi-stop-loss.log"


def load_stop_loss_stats():
    """Load stop-loss stats for dashboard widget (T366).
    
    Analyzes stop-loss events and calculates effectiveness metrics:
    - Total triggered
    - Estimated money saved (vs holding to settlement)
    - Positions that would have lost vs won if held
    """
    if not STOP_LOSS_LOG.exists():
        return None
    
    try:
        stop_losses = []
        with open(STOP_LOSS_LOG) as f:
            for line in f:
                try:
                    entry = json.loads(line.strip())
                    if entry.get('type') == 'stop_loss':
                        stop_losses.append(entry)
                except json.JSONDecodeError:
                    continue
        
        if not stop_losses:
            return None
        
        # Load settled trades to find final outcomes
        settled = {}
        for trades_file in [TRADES_FILE_V2, TRADES_FILE_V1]:
            if trades_file.exists():
                with open(trades_file) as f:
                    for line in f:
                        try:
                            entry = json.loads(line.strip())
                            if entry.get('result_status') in ['won', 'lost']:
                                ticker = entry.get('ticker')
                                if ticker:
                                    settled[ticker] = entry
                        except json.JSONDecodeError:
                            continue
        
        # Analyze each stop-loss
        total_triggered = len(stop_losses)
        total_actual_loss_cents = 0
        total_potential_loss_cents = 0
        would_have_lost = 0
        would_have_won = 0
        unknown_outcome = 0
        
        events = []  # For historical view
        
        for sl in stop_losses:
            ticker = sl.get('ticker', 'unknown')
            entry_price = sl.get('entry_price', 0)
            exit_price = sl.get('exit_price', 0)
            contracts = sl.get('contracts', 1)
            loss_pct = sl.get('loss_pct', 0)
            timestamp = sl.get('timestamp', '')
            
            # Actual loss at stop-loss exit
            actual_loss = (entry_price - exit_price) * contracts
            total_actual_loss_cents += actual_loss
            
            event = {
                "timestamp": timestamp,
                "ticker": ticker,
                "entryPrice": entry_price,
                "exitPrice": exit_price,
                "contracts": contracts,
                "lossPct": round(loss_pct, 1),
                "actualLossCents": round(actual_loss, 2),
                "outcome": "unknown"
            }
            
            # Check settlement outcome
            if ticker in settled:
                result = settled[ticker].get('result_status')
                if result == 'lost':
                    # Would have lost 100%
                    potential_loss = entry_price * contracts
                    saved = potential_loss - actual_loss
                    total_potential_loss_cents += potential_loss
                    would_have_lost += 1
                    event["outcome"] = "saved"
                    event["potentialLossCents"] = round(potential_loss, 2)
                    event["savedCents"] = round(saved, 2)
                else:
                    # Would have won
                    potential_profit = (100 - entry_price) * contracts
                    would_have_won += 1
                    event["outcome"] = "premature"
                    event["potentialProfitCents"] = round(potential_profit, 2)
            else:
                unknown_outcome += 1
            
            events.append(event)
        
        # Calculate savings
        total_saved_cents = total_potential_loss_cents - total_actual_loss_cents
        
        # Effectiveness metrics
        effectiveness_pct = 0
        if would_have_lost + would_have_won > 0:
            effectiveness_pct = round(would_have_lost / (would_have_lost + would_have_won) * 100, 1)
        
        return {
            "totalTriggered": total_triggered,
            "wouldHaveLost": would_have_lost,
            "wouldHaveWon": would_have_won,
            "unknownOutcome": unknown_outcome,
            "effectivenessPct": effectiveness_pct,
            "actualLossCents": round(total_actual_loss_cents, 2),
            "potentialLossCents": round(total_potential_loss_cents, 2),
            "savedCents": round(total_saved_cents, 2),
            "savedDollars": round(total_saved_cents / 100, 2),
            "events": events[-50:],  # Last 50 events for chart
            "generatedAt": datetime.now(timezone.utc).isoformat()
        }
        
    except Exception as e:
        print(f"Warning: Could not load stop-loss stats: {e}")
        return None


def calculate_edge_distribution(trades):
    """Calculate edge distribution buckets with win rates (T368).
    
    Groups trades by edge bucket and calculates win rate per bucket.
    Used for the edge confidence chart on /betting dashboard.
    """
    buckets = [
        (0.00, 0.05, "0-5%"),
        (0.05, 0.10, "5-10%"),
        (0.10, 0.15, "10-15%"),
        (0.15, 0.20, "15-20%"),
        (0.20, 0.30, "20-30%"),
        (0.30, 1.00, "30%+"),
    ]
    
    # Filter to trades with edge data
    trades_with_edge = [t for t in trades if t.get('edge') is not None or t.get('edge_with_bonus') is not None]
    settled_with_edge = [t for t in trades_with_edge if t.get('result_status') in ['won', 'lost']]
    
    distribution = []
    
    for low, high, name in buckets:
        bucket_trades = []
        for t in settled_with_edge:
            edge = t.get('edge') or t.get('edge_with_bonus', 0)
            if low <= edge < high:
                bucket_trades.append(t)
        
        won = sum(1 for t in bucket_trades if t.get('result_status') == 'won')
        lost = len(bucket_trades) - won
        win_rate = (won / len(bucket_trades) * 100) if bucket_trades else 0
        
        # Calculate average edge in bucket
        if bucket_trades:
            avg_edge = sum(t.get('edge') or t.get('edge_with_bonus', 0) for t in bucket_trades) / len(bucket_trades)
        else:
            avg_edge = (low + high) / 2
        
        distribution.append({
            "bucket": name,
            "range": [low, high],
            "trades": len(bucket_trades),
            "won": won,
            "lost": lost,
            "winRate": round(win_rate, 1),
            "avgEdge": round(avg_edge * 100, 1)  # as percentage
        })
    
    # Calculate correlation (do higher edges correlate with higher win rates?)
    buckets_with_trades = [b for b in distribution if b['trades'] > 0]
    correlation = "insufficient_data"
    
    if len(buckets_with_trades) >= 2:
        # Simple check: is the last bucket win rate >= first bucket?
        first_wr = buckets_with_trades[0]['winRate']
        last_wr = buckets_with_trades[-1]['winRate']
        
        if last_wr > first_wr + 5:
            correlation = "positive"  # Higher edge = higher WR (model well-calibrated)
        elif first_wr > last_wr + 5:
            correlation = "negative"  # Lower edge = higher WR (model needs recalibration!)
        else:
            correlation = "neutral"  # No clear pattern
    
    return {
        "buckets": distribution,
        "totalSettled": len(settled_with_edge),
        "tradesWithEdge": len(trades_with_edge),
        "correlation": correlation
    }


def calculate_win_rate_trend(trades):
    """Calculate daily win rate trend data for dashboard chart (DASH-001).
    
    Groups settled trades by day and computes:
    - Daily win rate
    - Cumulative win rate (rolling)
    - Daily PnL and cumulative PnL
    - Trade count per day
    
    Returns:
        dict with 'data' array and 'summary' for the WinRateTrendChart component
    """
    from collections import defaultdict
    
    # Filter to settled trades only
    settled = [t for t in trades if t.get('result_status') in ('won', 'lost')]
    if not settled:
        return None
    
    # Sort by timestamp
    settled.sort(key=lambda t: t.get('timestamp', ''))
    
    # Group by date
    by_date = defaultdict(list)
    for t in settled:
        date = t.get('timestamp', '')[:10]
        if date:
            by_date[date].append(t)
    
    if not by_date:
        return None
    
    # Calculate daily and cumulative stats
    data_points = []
    cum_wins = 0
    cum_total = 0
    cum_pnl = 0
    
    for date in sorted(by_date.keys()):
        day_trades = by_date[date]
        wins = sum(1 for t in day_trades if t.get('result_status') == 'won')
        losses = len(day_trades) - wins
        
        # Daily PnL
        day_pnl = 0
        for t in day_trades:
            price = t.get('price', 50)
            contracts = t.get('contracts', 1)
            if t.get('result_status') == 'won':
                day_pnl += (100 - price) * contracts
            else:
                day_pnl -= price * contracts
        
        cum_wins += wins
        cum_total += len(day_trades)
        cum_pnl += day_pnl
        
        cum_wr = (cum_wins / cum_total * 100) if cum_total > 0 else 0
        day_wr = (wins / len(day_trades) * 100) if day_trades else 0
        
        data_points.append({
            "date": date,
            "winRate": round(cum_wr, 1),  # Cumulative win rate (smoother for chart)
            "dailyWinRate": round(day_wr, 1),
            "trades": len(day_trades),
            "won": wins,
            "lost": losses,
            "pnlCents": day_pnl,
            "cumulativePnlCents": cum_pnl,
        })
    
    if len(data_points) < 2:
        return None
    
    # Calculate trend direction (last 7 days vs previous 7 days)
    recent = data_points[-7:]
    previous = data_points[-14:-7] if len(data_points) >= 14 else data_points[:len(data_points)//2]
    
    recent_avg_wr = sum(d['winRate'] for d in recent) / len(recent) if recent else 0
    prev_avg_wr = sum(d['winRate'] for d in previous) / len(previous) if previous else recent_avg_wr
    
    if recent_avg_wr > prev_avg_wr + 2:
        trend = 'improving'
    elif recent_avg_wr < prev_avg_wr - 2:
        trend = 'declining'
    else:
        trend = 'stable'
    
    return {
        "data": data_points,
        "summary": {
            "days": len(data_points),
            "source": "v2",
            "totalTrades": cum_total,
            "totalWon": cum_wins,
            "totalLost": cum_total - cum_wins,
            "overallWinRate": round(cum_wins / cum_total * 100, 1) if cum_total > 0 else 0,
            "totalPnlCents": cum_pnl,
            "trend": trend,
            "recentAvgWinRate": round(recent_avg_wr, 1),
            "previousAvgWinRate": round(prev_avg_wr, 1),
        },
        "lastUpdated": datetime.now(timezone.utc).isoformat(),
    }


def calculate_daily_volume(trades):
    """Calculate daily trading volume stats (T754).
    
    Volume = sum of (price * contracts) for ALL trades on a given day.
    This represents total capital deployed, regardless of outcome.
    
    Returns:
        dict: todayVolumeCents, yesterdayVolumeCents, volumeHistory (7 days)
    """
    if not trades:
        return None
    
    from datetime import timedelta
    from collections import defaultdict
    
    # Group trades by day
    by_day = defaultdict(list)
    for t in trades:
        ts = t.get('timestamp', '')
        if not ts:
            continue
        day_key = ts[:10]  # YYYY-MM-DD
        by_day[day_key].append(t)
    
    def calc_day_volume(day_trades):
        """Calculate total volume for a day's trades."""
        volume = 0
        trade_count = 0
        max_trade = 0
        for t in day_trades:
            price = t.get('price', 50)
            contracts = t.get('contracts', 1)
            trade_value = price * contracts
            volume += trade_value
            trade_count += 1
            max_trade = max(max_trade, trade_value)
        return {
            "volumeCents": volume,
            "tradeCount": trade_count,
            "maxTradeCents": max_trade,
            "avgTradeCents": round(volume / trade_count) if trade_count > 0 else 0
        }
    
    today = datetime.now(timezone.utc).date().isoformat()
    yesterday = (datetime.now(timezone.utc).date() - timedelta(days=1)).isoformat()
    
    today_stats = calc_day_volume(by_day.get(today, []))
    yesterday_stats = calc_day_volume(by_day.get(yesterday, []))
    
    # Calculate 7-day history for trend
    history = []
    for i in range(7):
        day = (datetime.now(timezone.utc).date() - timedelta(days=i)).isoformat()
        day_stats = calc_day_volume(by_day.get(day, []))
        history.append({
            "date": day,
            "volumeCents": day_stats["volumeCents"],
            "tradeCount": day_stats["tradeCount"]
        })
    
    # Reverse so oldest is first (for sparkline)
    history.reverse()
    
    # Calculate 7-day total
    week_volume = sum(d["volumeCents"] for d in history)
    week_trades = sum(d["tradeCount"] for d in history)
    
    return {
        "todayVolumeCents": today_stats["volumeCents"],
        "todayTradeCount": today_stats["tradeCount"],
        "todayMaxTradeCents": today_stats["maxTradeCents"],
        "todayAvgTradeCents": today_stats["avgTradeCents"],
        "yesterdayVolumeCents": yesterday_stats["volumeCents"],
        "yesterdayTradeCount": yesterday_stats["tradeCount"],
        "weekVolumeCents": week_volume,
        "weekTradeCount": week_trades,
        "history": history,
        "lastUpdated": datetime.now(timezone.utc).isoformat()
    }


def calculate_streak_stats(trades):
    """Calculate streak statistics from trades (T624).
    
    Returns:
        dict: longestWinStreak, longestLossStreak, currentStreak, currentStreakType
    """
    # Filter to settled trades and sort by timestamp
    settled = [t for t in trades if t.get('result_status') in ['won', 'lost']]
    settled.sort(key=lambda t: t.get('timestamp', ''))
    
    if not settled:
        return {
            "longestWinStreak": 0,
            "longestLossStreak": 0,
            "currentStreak": 0,
            "currentStreakType": "none"
        }
    
    # Calculate streaks
    longest_win = 0
    longest_loss = 0
    current_streak = 0
    current_type = None
    
    for t in settled:
        is_win = t.get('result_status') == 'won'
        
        if current_type is None:
            # First trade
            current_type = 'win' if is_win else 'loss'
            current_streak = 1
        elif (current_type == 'win' and is_win) or (current_type == 'loss' and not is_win):
            # Streak continues
            current_streak += 1
        else:
            # Streak breaks - record and reset
            if current_type == 'win':
                longest_win = max(longest_win, current_streak)
            else:
                longest_loss = max(longest_loss, current_streak)
            current_type = 'win' if is_win else 'loss'
            current_streak = 1
    
    # Don't forget to check the final streak
    if current_type == 'win':
        longest_win = max(longest_win, current_streak)
    elif current_type == 'loss':
        longest_loss = max(longest_loss, current_streak)
    
    return {
        "longestWinStreak": longest_win,
        "longestLossStreak": longest_loss,
        "currentStreak": current_streak,
        "currentStreakType": current_type or "none"
    }


def load_trades_from_file(filepath, source_tag=None):
    """Load trades from a JSONL file, optionally tagging with source."""
    trades = []
    if not filepath.exists():
        return trades
    
    with open(filepath, 'r') as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            try:
                trade = json.loads(line)
                if source_tag:
                    trade['_source'] = source_tag
                trades.append(trade)
            except json.JSONDecodeError:
                continue
    return trades

def load_v3_trades_from_file(filepath, source_tag='v3'):
    """Load v3 trades from JSONL file.
    
    V3 trades have a different format (dry_run autotrader v3):
    - action: BUY_YES/BUY_NO/SKIP (we only want BUY_*)
    - price_cents instead of price (sometimes market_price_yes/market_price_no)
    - edge, kelly_size, forecast_prob fields
    - No result_status yet (all pending/dry_run)
    """
    trades = []
    if not filepath.exists():
        print(f"Warning: V3 trades file not found: {filepath}")
        return trades
    
    with open(filepath, 'r') as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            try:
                trade = json.loads(line)
                # Only include actual trades (BUY_YES or BUY_NO), skip SKIPs
                action = trade.get('action', '')
                if action not in ('BUY_YES', 'BUY_NO'):
                    continue
                
                # Normalize v3 format to match v2 for stats calculation
                normalized = {
                    'timestamp': trade.get('timestamp', ''),
                    'ticker': trade.get('ticker', ''),
                    'side': 'yes' if action == 'BUY_YES' else 'no',
                    'contracts': trade.get('contracts', 1),
                    'price': trade.get('price_cents', trade.get('market_price_yes', 50)),
                    'price_cents': trade.get('price_cents', trade.get('market_price_yes', 50)),
                    'result_status': 'pending',  # v3 dry run trades are all pending
                    'edge': trade.get('edge', 0),
                    'edge_with_bonus': trade.get('edge', 0),
                    'kelly_size': trade.get('kelly_size', 0),
                    'forecast_prob': trade.get('forecast_prob', 0),
                    'forecast_confidence': trade.get('forecast_confidence', ''),
                    'dry_run': trade.get('dry_run', True),
                    'title': trade.get('title', ''),
                    'category': trade.get('category', ''),
                    '_source': source_tag,
                }
                trades.append(normalized)
            except json.JSONDecodeError:
                continue
    return trades


def load_trades(source='v2'):
    """Load trades based on source selection."""
    if source == 'v1':
        return load_trades_from_file(TRADES_FILE_V1, 'v1')
    elif source == 'v2':
        return load_trades_from_file(TRADES_FILE_V2, 'v2')
    elif source == 'v3':
        return load_v3_trades_from_file(TRADES_FILE_V3, 'v3')
    elif source == 'all':
        v1_trades = load_trades_from_file(TRADES_FILE_V1, 'v1')
        v2_trades = load_trades_from_file(TRADES_FILE_V2, 'v2')
        v3_trades = load_v3_trades_from_file(TRADES_FILE_V3, 'v3')
        # Combine and sort by timestamp
        combined = v1_trades + v2_trades + v3_trades
        combined.sort(key=lambda t: t.get('timestamp', ''))
        return combined
    else:
        return load_trades_from_file(TRADES_FILE_V2, 'v2')

def calculate_stats(trades, source='v2'):
    """Calculate trading statistics."""
    if not trades:
        return {
            "source": source,
            "totalTrades": 0,
            "winRate": 0,
            "pnlCents": 0,
            "todayTrades": 0,
            "todayWinRate": 0,
            "todayPnlCents": 0,
            "byAsset": {},
            "bySource": {} if source == 'all' else None,
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
    
    # Yesterday's stats (for comparison) - T364
    from datetime import timedelta
    yesterday = (datetime.now(timezone.utc).date() - timedelta(days=1)).isoformat()
    yesterday_trades = [t for t in settled if t.get('timestamp', '').startswith(yesterday)]
    yesterday_wins = sum(1 for t in yesterday_trades if t.get('result_status') == 'won')
    yesterday_total = len(yesterday_trades)
    yesterday_win_rate = (yesterday_wins / yesterday_total * 100) if yesterday_total > 0 else 0
    
    yesterday_pnl = 0
    for t in yesterday_trades:
        price = t.get('price', 50)
        contracts = t.get('contracts', 1)
        if t.get('result_status') == 'won':
            yesterday_pnl += (100 - price) * contracts
        else:
            yesterday_pnl -= price * contracts
    
    # Last 7 days stats (for week comparison) - T364
    week_ago = (datetime.now(timezone.utc).date() - timedelta(days=7)).isoformat()
    prev_week_start = (datetime.now(timezone.utc).date() - timedelta(days=14)).isoformat()
    
    this_week_trades = [t for t in settled if t.get('timestamp', '') >= week_ago]
    prev_week_trades = [t for t in settled if prev_week_start <= t.get('timestamp', '') < week_ago]
    
    def calc_period_stats(period_trades):
        wins = sum(1 for t in period_trades if t.get('result_status') == 'won')
        total = len(period_trades)
        wr = (wins / total * 100) if total > 0 else 0
        pnl = 0
        for t in period_trades:
            price = t.get('price', 50)
            contracts = t.get('contracts', 1)
            if t.get('result_status') == 'won':
                pnl += (100 - price) * contracts
            else:
                pnl -= price * contracts
        return {"trades": total, "winRate": round(wr, 1), "pnlCents": pnl}
    
    this_week_stats = calc_period_stats(this_week_trades)
    prev_week_stats = calc_period_stats(prev_week_trades)
    
    # Latency stats
    latencies = [t.get('latency_ms') for t in trades if t.get('latency_ms') is not None]
    latency_stats = {}
    if latencies:
        latencies_sorted = sorted(latencies)
        n = len(latencies)
        latency_stats = {
            "avgLatencyMs": round(sum(latencies) / n),
            "p95LatencyMs": latencies_sorted[int(n * 0.95)] if n >= 20 else latencies_sorted[-1],
            "minLatencyMs": latencies_sorted[0],
            "maxLatencyMs": latencies_sorted[-1],
            "latencyTradeCount": n
        }
        
        # Compute daily latency trend (last 14 days)
        from collections import defaultdict
        by_day = defaultdict(list)
        for t in trades:
            if t.get('latency_ms') is None:
                continue
            ts = t.get('timestamp', '')
            if not ts:
                continue
            day_key = ts[:10]  # YYYY-MM-DD
            by_day[day_key].append(t['latency_ms'])
        
        latency_trend = []
        for day in sorted(by_day.keys())[-14:]:  # Last 14 days
            day_latencies = sorted(by_day[day])
            n_day = len(day_latencies)
            latency_trend.append({
                "timestamp": f"{day}T12:00:00Z",
                "avgMs": round(sum(day_latencies) / n_day),
                "p95Ms": day_latencies[int(n_day * 0.95)] if n_day >= 5 else day_latencies[-1],
                "minMs": day_latencies[0],
                "maxMs": day_latencies[-1],
                "count": n_day
            })
        latency_stats["trend"] = latency_trend
    
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
    
    # By source breakdown (only when source='all')
    by_source = None
    if source == 'all':
        by_source = {}
        for src in ['v1', 'v2', 'v3']:
            src_trades = [t for t in settled if t.get('_source') == src]
            src_wins = sum(1 for t in src_trades if t.get('result_status') == 'won')
            src_total = len(src_trades)
            
            src_pnl = 0
            for t in src_trades:
                price = t.get('price', 50)
                contracts = t.get('contracts', 1)
                if t.get('result_status') == 'won':
                    src_pnl += (100 - price) * contracts
                else:
                    src_pnl -= price * contracts
            
            by_source[src] = {
                "trades": src_total,
                "winRate": round(src_wins / src_total * 100, 1) if src_total > 0 else 0,
                "pnlCents": src_pnl,
                "pnlDollars": round(src_pnl / 100, 2)
            }
    
    result = {
        "source": source,
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
        # Yesterday comparison (T364)
        "yesterdayTrades": yesterday_total,
        "yesterdayWinRate": round(yesterday_win_rate, 1),
        "yesterdayPnlCents": yesterday_pnl,
        # Week comparison (T364)
        "thisWeek": this_week_stats,
        "prevWeek": prev_week_stats,
        "byAsset": by_asset,
        "pendingTrades": len([t for t in trades if t.get('result_status') == 'pending']),
        **latency_stats,
        "lastUpdated": datetime.now(timezone.utc).isoformat()
    }
    
    if by_source:
        result["bySource"] = by_source
    
    # Add volatility stats
    vol_stats = load_volatility_stats()
    if vol_stats:
        result["volatility"] = vol_stats
    
    # Add autotrader health status (T620)
    health_status = load_health_status()
    if health_status:
        result["healthStatus"] = health_status
    
    # Add health history for uptime chart (T829)
    health_history = load_health_history()
    if health_history:
        result["healthHistory"] = health_history
    
    # Add API latency stats (T398)
    api_latency = load_api_latency_stats()
    if api_latency:
        result["apiLatency"] = api_latency
    
    # Add latency history for sparkline (T800)
    latency_history = load_latency_history()
    if latency_history:
        result["latencyHistory"] = latency_history
    
    # Add settlement stats (T349)
    settlements = load_settlements_stats()
    if settlements:
        result["settlements"] = settlements
    
    # Add streak stats (T624)
    streak_stats = calculate_streak_stats(trades)
    result.update(streak_stats)
    
    # Add edge distribution (T368)
    edge_dist = calculate_edge_distribution(trades)
    result["edgeDistribution"] = edge_dist
    
    # Add concentration history (T482)
    concentration_history = load_concentration_history()
    if concentration_history:
        result["concentrationHistory"] = concentration_history
    
    # Add asset correlation (T721)
    asset_correlation = load_asset_correlation()
    if asset_correlation:
        result["assetCorrelation"] = asset_correlation
    
    # Add momentum regime (T853)
    momentum_regime = load_momentum_regime()
    if momentum_regime:
        result["momentumRegime"] = momentum_regime
    
    # Add streak position analysis (T387)
    streak_position = load_streak_position_analysis()
    if streak_position:
        result["streakPosition"] = streak_position
    
    # Add hour/day trading heatmap (T411)
    hour_day_heatmap = load_hour_day_heatmap()
    if hour_day_heatmap:
        result["hourDayHeatmap"] = hour_day_heatmap
    
    # Add trading window recommendations (T790)
    trading_recommendations = load_trading_recommendations()
    if trading_recommendations:
        result["tradingRecommendations"] = trading_recommendations
    
    # Add stop-loss effectiveness stats (T366)
    stop_loss_stats = load_stop_loss_stats()
    if stop_loss_stats:
        result["stopLossStats"] = stop_loss_stats
    
    # Add daily volume stats (T754)
    volume_stats = calculate_daily_volume(trades)
    if volume_stats:
        result["dailyVolume"] = volume_stats
    
    # Add win rate trend data for dashboard chart (DASH-001)
    win_rate_trend = calculate_win_rate_trend(trades)
    if win_rate_trend:
        result["winRateTrend"] = win_rate_trend
    
    return result

def load_polymarket_positions():
    """Load Polymarket positions from backup file.
    
    Also searches for most recent polymarket-positions.json in memory-backups.
    Returns structured data suitable for gist/dashboard consumption.
    """
    # Try the specific path first, then search for most recent
    pm_file = POLYMARKET_POSITIONS_FILE
    
    if not pm_file.exists():
        # Search for most recent backup
        backup_dir = SCRIPT_DIR.parent / "data" / "memory-backups"
        if backup_dir.exists():
            candidates = []
            for d in sorted(backup_dir.iterdir(), reverse=True):
                candidate = d / "memory" / "polymarket-positions.json"
                if candidate.exists():
                    candidates.append(candidate)
            if candidates:
                pm_file = candidates[0]
                print(f"Using Polymarket positions from: {pm_file}")
    
    if not pm_file.exists():
        print("Warning: No Polymarket positions file found")
        return None
    
    try:
        with open(pm_file, 'r') as f:
            data = json.load(f)
        
        positions = data.get('positions', [])
        bankroll = data.get('bankroll', 0)
        available = data.get('available', 0)
        total_pnl = data.get('total_pnl', 0)
        daily_pnl = data.get('daily_pnl', 0)
        
        # Calculate stats from positions
        open_positions = [p for p in positions if p.get('status') == 'open']
        total_cost = sum(p.get('cost', 0) for p in open_positions)
        total_potential_win = sum(p.get('to_win', 0) for p in open_positions)
        
        return {
            "generated_at": datetime.now(timezone.utc).isoformat(),
            "source_file": str(pm_file),
            "data_updated_at": data.get('updated_at', ''),
            "bankroll": bankroll,
            "available": available,
            "total_pnl": total_pnl,
            "daily_pnl": daily_pnl,
            "positions": [{
                "id": p.get('id', ''),
                "market": p.get('market', ''),
                "side": p.get('side', ''),
                "cost": p.get('cost', 0),
                "odds": p.get('odds', 0),
                "to_win": p.get('to_win', 0),
                "status": p.get('status', 'unknown'),
                "opened_at": p.get('opened_at', ''),
                "note": p.get('note', ''),
            } for p in positions],
            "summary": {
                "total_positions": len(positions),
                "open_positions": len(open_positions),
                "total_invested": round(total_cost, 2),
                "total_potential_win": round(total_potential_win, 2),
                "exposure_pct": round((total_cost / bankroll * 100) if bankroll > 0 else 0, 1),
            },
            "notes": data.get('notes', ''),
        }
    except Exception as e:
        print(f"Warning: Could not load Polymarket positions: {e}")
        return None


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
    """Create a new public gist with retry logic (T767)."""
    # Write stats to temp file
    temp_file = Path("/tmp") / STATS_FILENAME
    temp_file.write_text(stats_json)
    
    last_error = None
    for attempt in range(MAX_RETRIES):
        if attempt > 0:
            backoff = INITIAL_BACKOFF_SECONDS * (2 ** (attempt - 1))
            print(f"  Retry {attempt}/{MAX_RETRIES-1} in {backoff}s...")
            time.sleep(backoff)
        
        # Create gist
        result = subprocess.run(
            ["gh", "gist", "create", str(temp_file), "--public", "--desc", "Onde Trading Stats (auto-updated)"],
            capture_output=True, text=True
        )
        
        if result.returncode == 0:
            # Parse gist URL to get ID
            gist_url = result.stdout.strip()
            gist_id = gist_url.split("/")[-1]
            
            print(f"Created gist: {gist_url}")
            print(f"Raw URL: https://gist.githubusercontent.com/FreeRiverHouse/{gist_id}/raw/{STATS_FILENAME}")
            
            track_consecutive_failures(success=True)
            return gist_id
        
        last_error = result.stderr
        print(f"Error creating gist (attempt {attempt + 1}/{MAX_RETRIES}): {last_error}")
    
    # All retries failed
    log_gist_error(f"create_gist failed after {MAX_RETRIES} attempts: {last_error}")
    track_consecutive_failures(success=False)
    return None


def update_gist(gist_id, stats_json):
    """Update existing gist using GitHub API with retry logic (T767)."""
    last_error = None
    for attempt in range(MAX_RETRIES):
        if attempt > 0:
            backoff = INITIAL_BACKOFF_SECONDS * (2 ** (attempt - 1))
            print(f"  Retry {attempt}/{MAX_RETRIES-1} in {backoff}s...")
            time.sleep(backoff)
        
        # Update gist via gh api
        result = subprocess.run(
            ["gh", "api", "-X", "PATCH", f"/gists/{gist_id}", "-f", f"files[{STATS_FILENAME}][content]={stats_json}"],
            capture_output=True, text=True
        )
        
        if result.returncode == 0:
            print(f"Updated gist: https://gist.github.com/{gist_id}")
            track_consecutive_failures(success=True)
            return True
        
        last_error = result.stderr
        # Check for rate limit (common GitHub API error)
        if "rate limit" in last_error.lower():
            print(f"⚠️ GitHub API rate limit hit, backing off...")
        print(f"Error updating gist (attempt {attempt + 1}/{MAX_RETRIES}): {last_error}")
    
    # All retries failed
    log_gist_error(f"update_gist({gist_id}) failed after {MAX_RETRIES} attempts: {last_error}")
    track_consecutive_failures(success=False)
    return False

def update_gist_multi(gist_id, files_dict):
    """Update existing gist with multiple files using GitHub API (T767)."""
    import tempfile
    
    # Build the -f arguments for multiple files
    last_error = None
    for attempt in range(MAX_RETRIES):
        if attempt > 0:
            backoff = INITIAL_BACKOFF_SECONDS * (2 ** (attempt - 1))
            print(f"  Retry {attempt}/{MAX_RETRIES-1} in {backoff}s...")
            time.sleep(backoff)
        
        # Build gh api command with multiple file contents
        cmd = ["gh", "api", "-X", "PATCH", f"/gists/{gist_id}"]
        for filename, content in files_dict.items():
            cmd.extend(["-f", f"files[{filename}][content]={content}"])
        
        result = subprocess.run(cmd, capture_output=True, text=True)
        
        if result.returncode == 0:
            print(f"Updated gist with {len(files_dict)} files: https://gist.github.com/{gist_id}")
            track_consecutive_failures(success=True)
            return True
        
        last_error = result.stderr
        print(f"Error updating gist (attempt {attempt + 1}/{MAX_RETRIES}): {last_error}")
    
    log_gist_error(f"update_gist_multi({gist_id}) failed after {MAX_RETRIES} attempts: {last_error}")
    track_consecutive_failures(success=False)
    return False


def main():
    create_new = "--create" in sys.argv
    push_polymarket = "--polymarket" in sys.argv
    
    # Parse source argument
    source = 'v2'  # default
    for i, arg in enumerate(sys.argv):
        if arg == '--source' and i + 1 < len(sys.argv):
            source = sys.argv[i + 1]
            if source not in ['v1', 'v2', 'v3', 'all']:
                print(f"Invalid source '{source}'. Use v1, v2, v3, or all.")
                sys.exit(1)
    
    # Load trades and calculate stats
    trades = load_trades(source)
    stats = calculate_stats(trades, source)
    
    # Add v3 paper trading summary from paper-trade-state.json (primary source)
    paper_state_file = Path(__file__).parent.parent / "data" / "trading" / "paper-trade-state.json"
    paper_loaded = False
    if paper_state_file.exists():
        try:
            with open(paper_state_file) as f:
                paper_state = json.load(f)
            ps_stats = paper_state.get("stats", {})
            stats["v3PaperTrading"] = {
                "totalTrades": ps_stats.get("total_trades", 0),
                "wins": ps_stats.get("wins", 0),
                "losses": ps_stats.get("losses", 0),
                "pendingTrades": ps_stats.get("pending", 0),
                "winRate": round(ps_stats.get("win_rate", 0) * 100, 1),
                "pnlCents": ps_stats.get("pnl_cents", 0),
                "pnlDollars": round(ps_stats.get("pnl_cents", 0) / 100, 2),
                "bankrollCents": paper_state.get("current_balance_cents", 0),
                "bankrollDollars": round(paper_state.get("current_balance_cents", 0) / 100, 2),
                "startingBankrollCents": paper_state.get("starting_balance_cents", 5000),
                "peakBalanceCents": ps_stats.get("peak_balance_cents", 0),
                "maxDrawdownCents": ps_stats.get("max_drawdown_cents", 0),
                "dryRun": True,
                "mode": "paper",
                "updatedAt": paper_state.get("updated_at", ""),
                "openPositions": [{
                    "ticker": p.get("ticker"),
                    "action": p.get("action"),
                    "price_cents": p.get("price_cents"),
                    "contracts": p.get("contracts"),
                    "cost_cents": p.get("cost_cents"),
                    "edge": p.get("edge"),
                    "opened_at": p.get("opened_at"),
                    "title": p.get("title", ""),
                } for p in paper_state.get("positions", [])[:20]],
                "recentHistory": paper_state.get("trade_history", [])[-10:],
            }
            paper_loaded = True
            print(f"Paper portfolio: ${paper_state.get('current_balance_cents', 0)/100:.2f} "
                  f"({ps_stats.get('wins', 0)}W/{ps_stats.get('losses', 0)}L, "
                  f"{len(paper_state.get('positions', []))} open)")
        except Exception as e:
            print(f"⚠️ Paper state load error: {e}")

    # Fallback to v3 JSONL if no paper state
    if not paper_loaded:
        v3_trades = load_v3_trades_from_file(TRADES_FILE_V3, 'v3')
        if v3_trades:
            v3_buy_trades = [t for t in v3_trades if t.get('side') in ('yes', 'no')]
            stats["v3PaperTrading"] = {
                "totalTrades": len(v3_buy_trades),
                "pendingTrades": len(v3_buy_trades),
                "dryRun": True,
                "avgEdge": round(sum(t.get('edge', 0) for t in v3_buy_trades) / len(v3_buy_trades) * 100, 2) if v3_buy_trades else 0,
                "recentTrades": [{
                    "timestamp": t.get('timestamp'),
                    "ticker": t.get('ticker'),
                    "title": t.get('title', ''),
                    "side": t.get('side'),
                    "contracts": t.get('contracts'),
                    "price_cents": t.get('price_cents', t.get('price', 0)),
                    "edge": round(t.get('edge', 0) * 100, 1),
                } for t in sorted(v3_buy_trades, key=lambda x: x.get('timestamp', ''), reverse=True)[:10]],
            }
            print(f"V3 paper trades (fallback): {len(v3_buy_trades)} trades (dry run)")
    
    # Load and embed Polymarket data (always include for dashboard)
    pm_data = load_polymarket_positions()
    if pm_data:
        stats["polymarket"] = pm_data
        print(f"Polymarket: {pm_data['summary']['open_positions']} open positions, "
              f"${pm_data['bankroll']} bankroll")
    
    stats_json = json.dumps(stats, indent=2)
    
    source_label = f"[{source}] " if source != 'v2' else ""
    print(f"{source_label}Stats: {stats['totalTrades']} trades, {stats['winRate']}% win rate, ${stats.get('pnlDollars', 0)} PnL")
    
    # Show source breakdown when combined
    if source == 'all' and 'bySource' in stats:
        for src, src_stats in stats['bySource'].items():
            print(f"  {src}: {src_stats['trades']} trades, {src_stats['winRate']}% WR, ${src_stats['pnlDollars']} PnL")
    
    gist_id = get_gist_id()
    
    if create_new or not gist_id:
        print("Creating new gist...")
        gist_id = create_gist(stats_json)
        if gist_id:
            save_gist_id(gist_id)
            print(f"Saved gist ID to {GIST_ID_FILE}")
    else:
        print(f"Updating existing gist {gist_id}...")
        
        # Build files dict for multi-file gist update
        files = {STATS_FILENAME: stats_json}
        
        # Add Polymarket as separate file if requested
        if push_polymarket and pm_data:
            pm_json = json.dumps(pm_data, indent=2)
            files[POLYMARKET_STATS_FILENAME] = pm_json
            print(f"Also pushing Polymarket data as {POLYMARKET_STATS_FILENAME}")
        
        if len(files) > 1:
            update_gist_multi(gist_id, files)
        else:
            update_gist(gist_id, stats_json)
    
    # Print raw URL for static site
    if gist_id:
        raw_url = f"https://gist.githubusercontent.com/FreeRiverHouse/{gist_id}/raw/{STATS_FILENAME}"
        print(f"\nFetch URL for static site:\n{raw_url}")
        if push_polymarket and pm_data:
            pm_url = f"https://gist.githubusercontent.com/FreeRiverHouse/{gist_id}/raw/{POLYMARKET_STATS_FILENAME}"
            print(f"Polymarket URL:\n{pm_url}")

if __name__ == "__main__":
    main()
