#!/usr/bin/env python3
"""
Price Source Reliability Tracking

Tracks which exchange API fails/succeeds over time.
Generates weekly reports showing uptime % per source.

Usage:
    python3 scripts/track-api-reliability.py [--check] [--report] [--days 7]

Options:
    --check   Run a reliability check and log results
    --report  Generate reliability report
    --days    Days to include in report (default: 7)
"""

import os
import sys
import json
import argparse
import requests
from datetime import datetime, timezone, timedelta
from pathlib import Path
from collections import defaultdict

# Paths
SCRIPT_DIR = Path(__file__).parent
PROJECT_DIR = SCRIPT_DIR.parent
DATA_DIR = PROJECT_DIR / "data" / "trading"
RELIABILITY_LOG = DATA_DIR / "api-reliability.jsonl"
REPORT_FILE = DATA_DIR / "api-reliability-report.json"


def ensure_dirs():
    """Ensure data directory exists."""
    DATA_DIR.mkdir(parents=True, exist_ok=True)


def check_binance() -> dict:
    """Check Binance API health."""
    result = {"source": "binance", "btc": False, "eth": False, "error": None, "latency_ms": None}
    
    try:
        start = datetime.now()
        resp = requests.get(
            "https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT",
            timeout=5
        )
        latency = (datetime.now() - start).total_seconds() * 1000
        result["latency_ms"] = round(latency, 2)
        
        if resp.ok and "price" in resp.json():
            result["btc"] = True
            
            # Also check ETH
            resp2 = requests.get(
                "https://api.binance.com/api/v3/ticker/price?symbol=ETHUSDT",
                timeout=5
            )
            if resp2.ok and "price" in resp2.json():
                result["eth"] = True
        else:
            result["error"] = f"HTTP {resp.status_code}"
    except requests.Timeout:
        result["error"] = "timeout"
    except requests.ConnectionError:
        result["error"] = "connection_error"
    except Exception as e:
        result["error"] = str(e)[:100]
    
    return result


def check_coingecko() -> dict:
    """Check CoinGecko API health."""
    result = {"source": "coingecko", "btc": False, "eth": False, "error": None, "latency_ms": None}
    
    try:
        start = datetime.now()
        resp = requests.get(
            "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd",
            timeout=10
        )
        latency = (datetime.now() - start).total_seconds() * 1000
        result["latency_ms"] = round(latency, 2)
        
        if resp.ok:
            data = resp.json()
            if "bitcoin" in data and "usd" in data["bitcoin"]:
                result["btc"] = True
            if "ethereum" in data and "usd" in data["ethereum"]:
                result["eth"] = True
        else:
            result["error"] = f"HTTP {resp.status_code}"
    except requests.Timeout:
        result["error"] = "timeout"
    except requests.ConnectionError:
        result["error"] = "connection_error"
    except Exception as e:
        result["error"] = str(e)[:100]
    
    return result


def check_coinbase() -> dict:
    """Check Coinbase API health."""
    result = {"source": "coinbase", "btc": False, "eth": False, "error": None, "latency_ms": None}
    
    try:
        start = datetime.now()
        resp = requests.get(
            "https://api.coinbase.com/v2/prices/BTC-USD/spot",
            timeout=5
        )
        latency = (datetime.now() - start).total_seconds() * 1000
        result["latency_ms"] = round(latency, 2)
        
        if resp.ok and "data" in resp.json():
            result["btc"] = True
            
            # Also check ETH
            resp2 = requests.get(
                "https://api.coinbase.com/v2/prices/ETH-USD/spot",
                timeout=5
            )
            if resp2.ok and "data" in resp2.json():
                result["eth"] = True
        else:
            result["error"] = f"HTTP {resp.status_code}"
    except requests.Timeout:
        result["error"] = "timeout"
    except requests.ConnectionError:
        result["error"] = "connection_error"
    except Exception as e:
        result["error"] = str(e)[:100]
    
    return result


def run_checks() -> list:
    """Run all API checks and return results."""
    results = []
    
    print("🔍 Checking API reliability...")
    
    # Binance
    print("  • Binance...", end=" ", flush=True)
    r = check_binance()
    status = "✅" if r["btc"] and r["eth"] else "⚠️" if r["btc"] or r["eth"] else "❌"
    print(f"{status} (BTC:{r['btc']}, ETH:{r['eth']}, {r['latency_ms']}ms)")
    results.append(r)
    
    # CoinGecko
    print("  • CoinGecko...", end=" ", flush=True)
    r = check_coingecko()
    status = "✅" if r["btc"] and r["eth"] else "⚠️" if r["btc"] or r["eth"] else "❌"
    print(f"{status} (BTC:{r['btc']}, ETH:{r['eth']}, {r['latency_ms']}ms)")
    results.append(r)
    
    # Coinbase
    print("  • Coinbase...", end=" ", flush=True)
    r = check_coinbase()
    status = "✅" if r["btc"] and r["eth"] else "⚠️" if r["btc"] or r["eth"] else "❌"
    print(f"{status} (BTC:{r['btc']}, ETH:{r['eth']}, {r['latency_ms']}ms)")
    results.append(r)
    
    return results


def log_results(results: list):
    """Log check results to JSONL file."""
    ensure_dirs()
    
    timestamp = datetime.now(timezone.utc).isoformat()
    
    with open(RELIABILITY_LOG, "a") as f:
        for r in results:
            entry = {
                "timestamp": timestamp,
                **r
            }
            f.write(json.dumps(entry) + "\n")
    
    print(f"\n📝 Logged to {RELIABILITY_LOG.name}")


def generate_report(days: int = 7):
    """Generate reliability report from historical data."""
    ensure_dirs()
    
    if not RELIABILITY_LOG.exists():
        print("❌ No reliability data yet. Run --check first.")
        return
    
    cutoff = datetime.now(timezone.utc) - timedelta(days=days)
    
    # Parse log file
    stats = defaultdict(lambda: {
        "total_checks": 0,
        "btc_success": 0,
        "eth_success": 0,
        "errors": defaultdict(int),
        "latencies": []
    })
    
    with open(RELIABILITY_LOG) as f:
        for line in f:
            try:
                entry = json.loads(line)
                ts = datetime.fromisoformat(entry["timestamp"].replace("Z", "+00:00"))
                
                if ts < cutoff:
                    continue
                
                source = entry["source"]
                stats[source]["total_checks"] += 1
                
                if entry.get("btc"):
                    stats[source]["btc_success"] += 1
                if entry.get("eth"):
                    stats[source]["eth_success"] += 1
                if entry.get("error"):
                    stats[source]["errors"][entry["error"]] += 1
                if entry.get("latency_ms"):
                    stats[source]["latencies"].append(entry["latency_ms"])
                    
            except:
                continue
    
    # Calculate metrics
    report = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "period_days": days,
        "sources": {}
    }
    
    print(f"\n📊 API Reliability Report (Last {days} days)\n")
    print("-" * 60)
    
    for source, data in sorted(stats.items()):
        total = data["total_checks"]
        if total == 0:
            continue
        
        btc_uptime = (data["btc_success"] / total) * 100
        eth_uptime = (data["eth_success"] / total) * 100
        overall_uptime = ((data["btc_success"] + data["eth_success"]) / (total * 2)) * 100
        
        latencies = data["latencies"]
        avg_latency = sum(latencies) / len(latencies) if latencies else 0
        
        # Determine status
        if overall_uptime >= 99:
            status = "🟢 Excellent"
        elif overall_uptime >= 95:
            status = "🟡 Good"
        elif overall_uptime >= 90:
            status = "🟠 Fair"
        else:
            status = "🔴 Poor"
        
        print(f"\n{source.upper()}")
        print(f"  Status:      {status}")
        print(f"  Total checks: {total}")
        print(f"  BTC uptime:  {btc_uptime:.1f}%")
        print(f"  ETH uptime:  {eth_uptime:.1f}%")
        print(f"  Overall:     {overall_uptime:.1f}%")
        print(f"  Avg latency: {avg_latency:.0f}ms")
        
        if data["errors"]:
            print(f"  Errors:")
            for err, count in sorted(data["errors"].items(), key=lambda x: -x[1]):
                print(f"    • {err}: {count}")
        
        report["sources"][source] = {
            "total_checks": total,
            "btc_uptime_pct": round(btc_uptime, 2),
            "eth_uptime_pct": round(eth_uptime, 2),
            "overall_uptime_pct": round(overall_uptime, 2),
            "avg_latency_ms": round(avg_latency, 2),
            "errors": dict(data["errors"])
        }
    
    print("-" * 60)
    
    # Recommendation
    if report["sources"]:
        best = max(report["sources"].items(), 
                   key=lambda x: x[1]["overall_uptime_pct"])
        print(f"\n💡 Recommendation: Prioritize {best[0].upper()} ({best[1]['overall_uptime_pct']:.1f}% uptime)")
    
    # Save report
    REPORT_FILE.write_text(json.dumps(report, indent=2))
    print(f"\n📁 Report saved to {REPORT_FILE.name}")


def main():
    parser = argparse.ArgumentParser(description="Track API reliability")
    parser.add_argument("--check", action="store_true",
                        help="Run reliability check")
    parser.add_argument("--report", action="store_true",
                        help="Generate reliability report")
    parser.add_argument("--days", type=int, default=7,
                        help="Days to include in report")
    
    args = parser.parse_args()
    
    if args.check:
        results = run_checks()
        log_results(results)
    
    if args.report:
        generate_report(args.days)
    
    if not args.check and not args.report:
        # Default: run check and show quick report
        results = run_checks()
        log_results(results)
        print("\nRun with --report for full historical report")


if __name__ == "__main__":
    main()
