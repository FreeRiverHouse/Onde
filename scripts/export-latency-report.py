#!/usr/bin/env python3
"""
T802: Export Weekly Exchange Latency Comparison Report

Generates a comprehensive latency report comparing exchange performance:
- Average, P95, Max latency per endpoint
- Week-over-week trends
- Degradation pattern detection
- Output: Markdown + JSON

Usage:
    python3 export-latency-report.py [--output-dir PATH] [--verbose] [--force]

Cron: 0 12 * * 0 (Sunday 12:00 UTC)
"""

import json
import os
import sys
from datetime import datetime, timezone, timedelta
from pathlib import Path
from collections import defaultdict
import argparse

# === Configuration ===
LATENCY_PROFILE_FILE = Path(__file__).parent / "kalshi-latency-profile.json"
LATENCY_HISTORY_FILE = Path(__file__).parent.parent / "data/trading/latency-history.jsonl"
OUTPUT_DIR = Path(__file__).parent.parent / "data/reports"
REPORT_HISTORY_FILE = Path(__file__).parent.parent / "data/trading/latency-reports-history.jsonl"

# Exchange endpoints to compare
EXCHANGE_ENDPOINTS = {
    "Binance": "ext_binance",
    "CoinGecko": "ext_coingecko",
    "Coinbase": "ext_coinbase",
}

# Kalshi API endpoints
KALSHI_ENDPOINTS = {
    "Markets Search": "markets_search",
    "Balance": "balance",
    "Positions": "positions",
    "Order": "order",
}

# Thresholds for performance rating
THRESHOLDS = {
    "excellent": 200,    # <200ms
    "good": 500,         # <500ms
    "acceptable": 1000,  # <1000ms
    "poor": 2000,        # <2000ms
    # >2000ms is critical
}


def load_current_profile() -> dict:
    """Load current latency profile."""
    if not LATENCY_PROFILE_FILE.exists():
        return {}
    
    with open(LATENCY_PROFILE_FILE) as f:
        return json.load(f)


def load_latency_history(days: int = 7) -> list:
    """Load latency history for the past N days."""
    if not LATENCY_HISTORY_FILE.exists():
        return []
    
    cutoff = datetime.now(timezone.utc) - timedelta(days=days)
    history = []
    
    with open(LATENCY_HISTORY_FILE) as f:
        for line in f:
            try:
                entry = json.loads(line.strip())
                ts = datetime.fromisoformat(entry.get("timestamp", "").replace("Z", "+00:00"))
                if ts >= cutoff:
                    history.append(entry)
            except (json.JSONDecodeError, ValueError):
                continue
    
    return history


def load_previous_report() -> dict:
    """Load the most recent previous report for comparison."""
    if not REPORT_HISTORY_FILE.exists():
        return {}
    
    last_report = None
    with open(REPORT_HISTORY_FILE) as f:
        for line in f:
            try:
                last_report = json.loads(line.strip())
            except json.JSONDecodeError:
                continue
    
    return last_report or {}


def rate_latency(avg_ms: float) -> tuple[str, str]:
    """Rate latency and return (rating, emoji)."""
    if avg_ms < THRESHOLDS["excellent"]:
        return "Excellent", "🟢"
    elif avg_ms < THRESHOLDS["good"]:
        return "Good", "🟡"
    elif avg_ms < THRESHOLDS["acceptable"]:
        return "Acceptable", "🟠"
    elif avg_ms < THRESHOLDS["poor"]:
        return "Poor", "🔴"
    else:
        return "Critical", "⛔"


def calculate_trend(current: float, previous: float) -> tuple[str, str]:
    """Calculate trend from previous value."""
    if previous == 0:
        return "new", "🆕"
    
    change_pct = ((current - previous) / previous) * 100
    
    if change_pct < -10:
        return "improved", "📈"
    elif change_pct > 20:
        return "degraded", "📉"
    elif change_pct > 10:
        return "slightly_worse", "⚠️"
    else:
        return "stable", "➡️"


def generate_report(profile: dict, history: list, prev_report: dict, verbose: bool = False) -> tuple[str, dict]:
    """Generate markdown and JSON report."""
    now = datetime.now(timezone.utc)
    report_date = now.strftime("%Y-%m-%d")
    
    endpoints = profile.get("endpoints", {})
    prev_endpoints = prev_report.get("endpoints_summary", {})
    
    # Build JSON summary
    json_report = {
        "timestamp": now.isoformat(),
        "report_date": report_date,
        "period": "weekly",
        "endpoints_summary": {},
        "exchange_comparison": {},
        "kalshi_endpoints": {},
        "trends": {},
        "alerts": [],
        "recommendations": [],
    }
    
    # Markdown report
    md_lines = [
        f"# 📊 Weekly Latency Report",
        f"**Generated:** {now.strftime('%Y-%m-%d %H:%M UTC')}",
        f"**Period:** Last 7 days",
        "",
        "---",
        "",
        "## 🏦 Exchange Comparison",
        "",
        "| Exchange | Avg (ms) | P95 (ms) | Max (ms) | Rating | Trend |",
        "|----------|----------|----------|----------|--------|-------|",
    ]
    
    # Exchange comparison
    exchanges_data = []
    for name, endpoint in EXCHANGE_ENDPOINTS.items():
        if endpoint in endpoints:
            stats = endpoints[endpoint]
            if stats["count"] >= 3:
                avg = stats["avg_ms"]
                p95 = stats["p95_ms"]
                max_val = stats["max_ms"]
                rating, emoji = rate_latency(avg)
                
                # Get previous value for trend
                prev_avg = prev_endpoints.get(endpoint, {}).get("avg_ms", 0)
                trend_name, trend_emoji = calculate_trend(avg, prev_avg)
                
                exchanges_data.append({
                    "name": name,
                    "endpoint": endpoint,
                    "avg_ms": avg,
                    "p95_ms": p95,
                    "max_ms": max_val,
                    "count": stats["count"],
                    "rating": rating,
                    "trend": trend_name,
                })
                
                json_report["exchange_comparison"][name] = {
                    "avg_ms": round(avg, 1),
                    "p95_ms": round(p95, 1),
                    "max_ms": round(max_val, 1),
                    "rating": rating,
                    "trend": trend_name,
                    "prev_avg_ms": round(prev_avg, 1),
                }
                json_report["endpoints_summary"][endpoint] = {
                    "avg_ms": round(avg, 1),
                    "p95_ms": round(p95, 1),
                    "max_ms": round(max_val, 1),
                }
                
                md_lines.append(f"| {name} | {avg:.0f} | {p95:.0f} | {max_val:.0f} | {emoji} {rating} | {trend_emoji} {trend_name.replace('_', ' ').title()} |")
    
    # Sort by avg latency to determine recommended order
    exchanges_data.sort(key=lambda x: x["avg_ms"])
    recommended_order = [e["name"] for e in exchanges_data]
    json_report["recommended_order"] = recommended_order
    
    md_lines.extend([
        "",
        f"**Recommended priority:** {' → '.join(recommended_order)}",
        "",
        "---",
        "",
        "## 📡 Kalshi API Endpoints",
        "",
        "| Endpoint | Avg (ms) | P95 (ms) | Max (ms) | Count | Rating |",
        "|----------|----------|----------|----------|-------|--------|",
    ])
    
    # Kalshi endpoints
    for name, endpoint in KALSHI_ENDPOINTS.items():
        if endpoint in endpoints:
            stats = endpoints[endpoint]
            if stats["count"] >= 3:
                avg = stats["avg_ms"]
                p95 = stats["p95_ms"]
                max_val = stats["max_ms"]
                count = stats["count"]
                rating, emoji = rate_latency(avg)
                
                json_report["kalshi_endpoints"][name] = {
                    "avg_ms": round(avg, 1),
                    "p95_ms": round(p95, 1),
                    "max_ms": round(max_val, 1),
                    "count": count,
                    "rating": rating,
                }
                json_report["endpoints_summary"][endpoint] = {
                    "avg_ms": round(avg, 1),
                    "p95_ms": round(p95, 1),
                    "max_ms": round(max_val, 1),
                }
                
                md_lines.append(f"| {name} | {avg:.0f} | {p95:.0f} | {max_val:.0f} | {count} | {emoji} {rating} |")
    
    # Detect issues and add recommendations
    md_lines.extend([
        "",
        "---",
        "",
        "## 🚨 Alerts & Recommendations",
        "",
    ])
    
    alerts = []
    recommendations = []
    
    # Check for degraded endpoints
    for name, data in json_report.get("exchange_comparison", {}).items():
        if data.get("trend") == "degraded":
            alert = f"⚠️ **{name}** latency degraded significantly (was {data['prev_avg_ms']:.0f}ms, now {data['avg_ms']:.0f}ms)"
            alerts.append(alert)
            md_lines.append(f"- {alert}")
    
    # Check for critical latencies
    for name, data in json_report.get("kalshi_endpoints", {}).items():
        if data.get("rating") == "Critical":
            alert = f"⛔ **{name}** has critical latency ({data['avg_ms']:.0f}ms avg)"
            alerts.append(alert)
            md_lines.append(f"- {alert}")
            recommendations.append(f"Investigate {name} endpoint performance - may impact trade execution")
    
    # Add recommendations based on analysis
    if exchanges_data:
        fastest = exchanges_data[0]
        slowest = exchanges_data[-1]
        if slowest["avg_ms"] > 2 * fastest["avg_ms"]:
            rec = f"Consider deprioritizing {slowest['name']} (2x+ slower than {fastest['name']})"
            recommendations.append(rec)
            md_lines.append(f"- 💡 {rec}")
    
    if not alerts and not recommendations:
        md_lines.append("- ✅ All endpoints performing within acceptable limits")
    
    json_report["alerts"] = alerts
    json_report["recommendations"] = recommendations
    
    # Add summary stats
    all_avgs = [e["avg_ms"] for e in exchanges_data]
    if all_avgs:
        json_report["summary"] = {
            "avg_exchange_latency_ms": round(sum(all_avgs) / len(all_avgs), 1),
            "min_exchange_latency_ms": round(min(all_avgs), 1),
            "max_exchange_latency_ms": round(max(all_avgs), 1),
        }
    
    md_lines.extend([
        "",
        "---",
        "",
        f"*Report generated by T802 export-latency-report.py*",
    ])
    
    return "\n".join(md_lines), json_report


def save_report(md_content: str, json_report: dict, output_dir: Path):
    """Save report files."""
    output_dir.mkdir(parents=True, exist_ok=True)
    
    report_date = json_report["report_date"]
    
    # Save markdown
    md_path = output_dir / f"latency-report-{report_date}.md"
    with open(md_path, "w") as f:
        f.write(md_content)
    
    # Save JSON
    json_path = output_dir / f"latency-report-{report_date}.json"
    with open(json_path, "w") as f:
        json.dump(json_report, f, indent=2)
    
    # Append to history for future trend analysis
    REPORT_HISTORY_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(REPORT_HISTORY_FILE, "a") as f:
        f.write(json.dumps(json_report) + "\n")
    
    return md_path, json_path


def main():
    parser = argparse.ArgumentParser(description="Generate weekly exchange latency report")
    parser.add_argument("--output-dir", type=Path, default=OUTPUT_DIR, help="Output directory")
    parser.add_argument("--verbose", "-v", action="store_true", help="Verbose output")
    parser.add_argument("--force", "-f", action="store_true", help="Force generate even if recent")
    parser.add_argument("--dry-run", action="store_true", help="Show report without saving")
    args = parser.parse_args()
    
    print("📊 Generating Weekly Latency Report...")
    
    # Load data
    profile = load_current_profile()
    if not profile:
        print("❌ No latency profile found")
        sys.exit(1)
    
    history = load_latency_history(days=7)
    prev_report = load_previous_report()
    
    if args.verbose:
        print(f"   Endpoints in profile: {len(profile.get('endpoints', {}))}")
        print(f"   History entries (7d): {len(history)}")
        print(f"   Previous report: {'found' if prev_report else 'none'}")
    
    # Generate report
    md_content, json_report = generate_report(profile, history, prev_report, args.verbose)
    
    if args.dry_run:
        print("\n" + "="*60)
        print(md_content)
        print("="*60)
        print("\n📋 JSON Report Preview:")
        print(json.dumps(json_report, indent=2)[:500] + "...")
        return
    
    # Save report
    md_path, json_path = save_report(md_content, json_report, args.output_dir)
    
    print(f"✅ Report saved:")
    print(f"   📄 {md_path}")
    print(f"   📊 {json_path}")
    
    # Print summary
    if json_report.get("alerts"):
        print(f"\n⚠️ {len(json_report['alerts'])} alert(s) found!")
        for alert in json_report["alerts"]:
            print(f"   {alert}")
    else:
        print("\n✅ No issues detected")


if __name__ == "__main__":
    main()
