#!/usr/bin/env python3
"""
Kalshi AutoTrader v2 - Fixed Algorithm with Proper Probability Model

FIXES:
1. Proper probability calculation using log-normal price model
2. Correct time-to-expiry handling (hourly contracts!)
3. Feedback loop - updates trade results automatically
4. Better edge calculation with realistic volatility
5. Trend detection to avoid betting against momentum

Author: Clawd (Fixed after 0% win rate disaster)
"""

import os
import requests
import json
import sys
import time
import math
from datetime import datetime, timezone, timedelta
import base64
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import padding
from pathlib import Path
from collections import defaultdict

# ============== CONFIG ==============
API_KEY_ID = "4308d1ca-585e-4b73-be82-5c0968b9a59a"
PRIVATE_KEY = """-----BEGIN RSA PRIVATE KEY-----
MIIEowIBAAKCAQEArvbCjuzAtVbmxZjlm5jglJTy6ZI8kOEGIktgl1KEgzgGr5mF
PE42QKSPdV2NQrvp14fIn2Y+sQ5Us2xrpJ348LiwB5QxfIG63cjblRZ7xvXH6svY
vVke4NShnB8l3uSdJrIvzbnlNEy86+vPaw+GjsODlKhQwm5v4rVEizG1yHxlC20e
SSPG7xyHxuNgDKLCCqERlwiDAhhM75KpPYlJ5OtFkSxNKbGn3PEv7veUbHB485y3
yAc/v6CxCYzbRmwIl9xXQp2F9unYkEJO3UEaxFvTO+G6RL10Q9whbWKrQpKCW0GI
XDRIima44BkT9MOAy5c1q2zXypwddsfUo4O32wIDAQABAoIBADlOFvEq9/8s5E7J
wkJRMxVXJ6x6uh2VpiWrXIqTe1VjD0WKWcojr79CZr5BEthNpcxy67HRkiz5jaJq
m2MCXpuxUe5Zik/GSccEV28gOxAyRfVQKL/zpZpr6jaxOP0lEZev+to9zaVwkNwQ
kxH0ttShksIo0rKr6zdsuXOBp5FvKaO/Cb9YFBjsSc0dzsWWtRBonh9EMrUKoP97
cjbN04vvBv9Xz8f+VmdyLJdLv3BrpdjAtI0oeAvDJjd6ruR1+OR06omSlW6XBPQy
1Ugzr6BZQ/9txGoblyHcpNGLyf+iS4n3IqPFhLkERBylsl2XWF77Ucy386exlYtZ
JIjYS+ECgYEA5krxSpQ4j9e54Sj/d1aID7jeLNy4BfjVcYEfvXSHFap6SsY42aZC
zwjL6tQ8aCAGgrjdkiq8GDdsPf8AG0w99o/jlUbDtaxy5fUgViguqu4P31lXKLc8
IUed89Qlt0sk9cQXxPBANVjFTSfIhGNNZ6si25zNECpxIQky7Vq7SksCgYEAwn6w
jDQUf8VQtHVeelb8T+/rxVO1NQWSZ90GbiZL3oEWIA7vBmnBCffPfrD82tbXrnOh
BGm5PphNnUPbeLovPzcSQaZllDcvq0iXuhrymG8iewCunKttrbQ42dA8QTh7nsl8
Bj8SkJr9CayU1tlMJDz/f+YsO4G3jDOWXCCXzrECgYB5m1NlTXW8x27ZbhvQubnp
i3aO/BKU3LxhTo0jLxhyIW6oc5nrnLckuoFrxJ0NYvPtLY+bMsPWidW3uyMkRxNl
UsAbwJ1yHtkhg1qLBHb4PfPVvkifMHspG7dV3U35R04CFYVzsmZFhVXSk1J4TjO+
rYkfrOJAShkpF8FzwviplwKBgQCTzo3C7u1JMJ2llrCnDqYO5cjqnDPQyJw7vHff
i9EKllVHJbI20HW4apBQupZehPlCBXOvk90ImdwaEPCgbfXr96EzLQ5zNgFPDQrp
jwMgHw04JwuL2qeuY5D0ztCLzC3+PSa45IPqSy7ThElUgazguU5+V2D0FB92N9oj
x0028QKBgElTmOkG9w7V8MUhBQdI79TERvrls9r0kDeqzC3LqRHkJFuYueFP2C6p
+OjRdeYnhHLtOH3+UkpCxUB4G0l5YVJtBcJUtNFSJMBKfaxqrd7awX2TZImfvgkb
YJZnQlMSeGK5ezv10pi0K5q7luyW8TNfknr5uafM5vq2c/LLcAJn
-----END RSA PRIVATE KEY-----"""

BASE_URL = "https://api.elections.kalshi.com"

# Trading parameters - MORE CONSERVATIVE
MIN_EDGE = 0.10  # 10% minimum edge (was 15% but with wrong probabilities)
MAX_POSITION_PCT = 0.03  # 3% max per position
KELLY_FRACTION = 0.05  # Very conservative Kelly
MIN_BET_CENTS = 5
MIN_TIME_TO_EXPIRY_MINUTES = 45  # Increased from 30
MAX_POSITIONS = 30

# Volatility assumptions
BTC_HOURLY_VOL = 0.005  # ~0.5% hourly volatility (empirical)
ETH_HOURLY_VOL = 0.007  # ~0.7% hourly volatility

# Momentum config
MOMENTUM_TIMEFRAMES = ["1h", "4h", "24h"]
MOMENTUM_WEIGHT = {"1h": 0.5, "4h": 0.3, "24h": 0.2}  # Short-term matters more for hourly contracts

# Logging
TRADE_LOG_FILE = "scripts/kalshi-trades-v2.jsonl"
SKIP_LOG_FILE = "scripts/kalshi-skips.jsonl"

# Dry run mode - log trades without executing
DRY_RUN = os.getenv("DRY_RUN", "false").lower() in ("true", "1", "yes")
DRY_RUN_LOG_FILE = "scripts/kalshi-trades-dryrun.jsonl"

# Circuit breaker config (consecutive losses)
CIRCUIT_BREAKER_THRESHOLD = int(os.getenv("CIRCUIT_BREAKER_THRESHOLD", "5"))  # Auto-pause after N consecutive losses
CIRCUIT_BREAKER_ALERT_FILE = "scripts/kalshi-circuit-breaker.alert"
CIRCUIT_BREAKER_STATE_FILE = "scripts/kalshi-circuit-breaker.json"

# Regime change alerting
REGIME_STATE_FILE = "scripts/kalshi-regime-state.json"
REGIME_ALERT_FILE = "scripts/kalshi-regime-change.alert"
REGIME_ALERT_COOLDOWN = 3600  # 1 hour cooldown between alerts

# Momentum direction change alerting
MOMENTUM_STATE_FILE = "scripts/kalshi-momentum-state.json"
MOMENTUM_ALERT_FILE = "scripts/kalshi-momentum-change.alert"
MOMENTUM_ALERT_COOLDOWN = 1800  # 30 min cooldown (more frequent than regime)

# Whipsaw detection (T393) - momentum flip twice in 24h
WHIPSAW_ALERT_FILE = "scripts/kalshi-whipsaw.alert"
WHIPSAW_ALERT_COOLDOWN = 7200  # 2 hour cooldown (rare event)
WHIPSAW_WINDOW_HOURS = 24  # Look for 2 flips within this window

# Latency alerting
LATENCY_ALERT_FILE = "scripts/kalshi-latency.alert"

# Extreme volatility alerting (T294)
EXTREME_VOL_ALERT_FILE = "scripts/kalshi-extreme-vol.alert"
EXTREME_VOL_ALERT_COOLDOWN = 3600  # 1 hour cooldown

# Full momentum alignment alerting (T301)
MOMENTUM_ALIGN_ALERT_FILE = "scripts/kalshi-momentum-aligned.alert"
MOMENTUM_ALIGN_ALERT_COOLDOWN = 7200  # 2 hour cooldown (rare event)
MOMENTUM_ALIGN_MIN_STRENGTH = 0.5  # Minimum composite strength to alert
LATENCY_THRESHOLD_MS = int(os.getenv("LATENCY_THRESHOLD_MS", "2000"))  # Alert if avg latency > 2s
LATENCY_ALERT_COOLDOWN = 3600  # 1 hour cooldown
LATENCY_CHECK_WINDOW = 10  # Check last N trades

# Streak record alerting (T288)
STREAK_STATE_FILE = "scripts/kalshi-streak-records.json"
STREAK_ALERT_FILE = "scripts/kalshi-streak-record.alert"

# API Latency Profiling (T279)
LATENCY_PROFILE_FILE = "scripts/kalshi-latency-profile.json"
LATENCY_PROFILE_WINDOW = 100  # Keep last N calls per endpoint
API_LATENCY_LOG = defaultdict(list)  # endpoint -> list of (timestamp, latency_ms)


# ============== API LATENCY PROFILING (T279) ==============

def record_api_latency(endpoint: str, latency_ms: float):
    """
    Record API call latency for profiling.
    
    Args:
        endpoint: API endpoint name (e.g., "balance", "positions", "order")
        latency_ms: Time taken for the call in milliseconds
    """
    global API_LATENCY_LOG
    timestamp = datetime.now(timezone.utc).isoformat()
    API_LATENCY_LOG[endpoint].append((timestamp, latency_ms))
    
    # Keep only last N entries per endpoint
    if len(API_LATENCY_LOG[endpoint]) > LATENCY_PROFILE_WINDOW:
        API_LATENCY_LOG[endpoint] = API_LATENCY_LOG[endpoint][-LATENCY_PROFILE_WINDOW:]


def calculate_latency_stats(latencies: list) -> dict:
    """
    Calculate latency statistics from a list of latency values.
    
    Args:
        latencies: List of latency values in ms
    
    Returns:
        Dict with min, avg, p50, p95, p99, max, count
    """
    if not latencies:
        return {"count": 0}
    
    sorted_latencies = sorted(latencies)
    count = len(sorted_latencies)
    
    return {
        "count": count,
        "min_ms": round(sorted_latencies[0], 1),
        "avg_ms": round(sum(sorted_latencies) / count, 1),
        "p50_ms": round(sorted_latencies[int(count * 0.5)], 1),
        "p95_ms": round(sorted_latencies[min(int(count * 0.95), count - 1)], 1),
        "p99_ms": round(sorted_latencies[min(int(count * 0.99), count - 1)], 1),
        "max_ms": round(sorted_latencies[-1], 1)
    }


def get_latency_profile() -> dict:
    """
    Get latency profile for all tracked endpoints.
    
    Returns:
        Dict with endpoint -> stats mapping
    """
    profile = {}
    for endpoint, entries in API_LATENCY_LOG.items():
        latencies = [lat for _, lat in entries]
        profile[endpoint] = calculate_latency_stats(latencies)
    return profile


def print_latency_summary():
    """Print formatted latency profiling summary to console."""
    profile = get_latency_profile()
    if not profile:
        return
    
    print("\n📊 API LATENCY PROFILE:")
    print("=" * 70)
    print(f"{'Endpoint':<25} {'Calls':>6} {'Min':>8} {'Avg':>8} {'P95':>8} {'Max':>8}")
    print("-" * 70)
    
    # Sort by avg latency descending (slowest first)
    sorted_endpoints = sorted(profile.items(), key=lambda x: x[1].get("avg_ms", 0), reverse=True)
    
    for endpoint, stats in sorted_endpoints:
        if stats["count"] > 0:
            print(f"{endpoint:<25} {stats['count']:>6} {stats['min_ms']:>7.1f}ms {stats['avg_ms']:>7.1f}ms "
                  f"{stats['p95_ms']:>7.1f}ms {stats['max_ms']:>7.1f}ms")
    
    print("=" * 70)
    
    # Calculate totals
    total_calls = sum(s.get("count", 0) for s in profile.values())
    all_latencies = []
    for entries in API_LATENCY_LOG.values():
        all_latencies.extend([lat for _, lat in entries])
    
    if all_latencies:
        total_stats = calculate_latency_stats(all_latencies)
        print(f"{'TOTAL':<25} {total_calls:>6} {total_stats['min_ms']:>7.1f}ms {total_stats['avg_ms']:>7.1f}ms "
              f"{total_stats['p95_ms']:>7.1f}ms {total_stats['max_ms']:>7.1f}ms")


def save_latency_profile():
    """Save latency profile to file for later analysis."""
    profile = get_latency_profile()
    if not profile:
        return
    
    data = {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "endpoints": profile,
        "raw_data": {endpoint: entries[-20:] for endpoint, entries in API_LATENCY_LOG.items()}  # Last 20 per endpoint
    }
    
    with open(LATENCY_PROFILE_FILE, "w") as f:
        json.dump(data, f, indent=2)


def identify_bottlenecks() -> list:
    """
    Identify API endpoints that may be bottlenecks.
    
    Returns:
        List of (endpoint, issue, details) tuples
    """
    profile = get_latency_profile()
    bottlenecks = []
    
    for endpoint, stats in profile.items():
        if stats["count"] < 3:
            continue  # Not enough data
        
        # Flag slow endpoints
        if stats["avg_ms"] > 1000:
            bottlenecks.append((endpoint, "slow_avg", f"Avg {stats['avg_ms']:.0f}ms > 1000ms threshold"))
        
        if stats["p95_ms"] > 2000:
            bottlenecks.append((endpoint, "slow_p95", f"P95 {stats['p95_ms']:.0f}ms > 2000ms threshold"))
        
        # Flag high variance (p95 >> avg)
        if stats["avg_ms"] > 0 and stats["p95_ms"] / stats["avg_ms"] > 3:
            bottlenecks.append((endpoint, "high_variance", f"P95/Avg ratio {stats['p95_ms']/stats['avg_ms']:.1f}x"))
    
    return bottlenecks


# ============== API RATE LIMIT MONITORING (T308) ==============

# Rate limit tracking
API_RATE_LIMITS = {
    "kalshi": {"calls_per_hour": 0, "limit": 1000, "remaining": None, "reset_time": None},
    "coingecko": {"calls_per_hour": 0, "limit": 30, "remaining": None, "reset_time": None},  # Free tier: 10-30/min
    "binance": {"calls_per_hour": 0, "limit": 1200, "remaining": None, "reset_time": None},
    "coinbase": {"calls_per_hour": 0, "limit": 10000, "remaining": None, "reset_time": None},
    "feargreed": {"calls_per_hour": 0, "limit": 100, "remaining": None, "reset_time": None}
}
API_RATE_WINDOW_START = time.time()
RATE_LIMIT_ALERT_FILE = "scripts/kalshi-rate-limit.alert"
RATE_LIMIT_ALERT_THRESHOLD = 0.8  # Alert at 80% of limit
RATE_LIMIT_LOG_FILE = "scripts/kalshi-api-rate-log.jsonl"


def record_api_call(source: str, response_headers: dict = None):
    """
    Record an API call for rate limit tracking.
    
    Args:
        source: API source name (kalshi, coingecko, binance, coinbase, feargreed)
        response_headers: Optional response headers to extract rate limit info
    """
    global API_RATE_LIMITS, API_RATE_WINDOW_START
    
    # Reset hourly counters if window expired
    if time.time() - API_RATE_WINDOW_START > 3600:
        for src in API_RATE_LIMITS:
            API_RATE_LIMITS[src]["calls_per_hour"] = 0
        API_RATE_WINDOW_START = time.time()
    
    if source not in API_RATE_LIMITS:
        return
    
    API_RATE_LIMITS[source]["calls_per_hour"] += 1
    
    # Extract rate limit headers if provided
    if response_headers:
        # Kalshi uses X-Ratelimit-* headers
        if "x-ratelimit-remaining" in response_headers:
            API_RATE_LIMITS[source]["remaining"] = int(response_headers.get("x-ratelimit-remaining", 0))
        if "x-ratelimit-limit" in response_headers:
            API_RATE_LIMITS[source]["limit"] = int(response_headers.get("x-ratelimit-limit", 1000))
        if "x-ratelimit-reset" in response_headers:
            API_RATE_LIMITS[source]["reset_time"] = response_headers.get("x-ratelimit-reset")
        
        # CoinGecko uses x-cg-* headers
        if "x-cg-demo-api-calls-left" in response_headers:
            API_RATE_LIMITS[source]["remaining"] = int(response_headers.get("x-cg-demo-api-calls-left", 0))


def check_rate_limits() -> list:
    """
    Check if any API is approaching rate limits.
    
    Returns:
        List of (source, usage_pct, message) for APIs near limit
    """
    warnings = []
    
    for source, data in API_RATE_LIMITS.items():
        calls = data["calls_per_hour"]
        limit = data["limit"]
        remaining = data["remaining"]
        
        # Check based on remaining (from headers) if available
        if remaining is not None and limit > 0:
            usage_pct = 1 - (remaining / limit)
            if usage_pct >= RATE_LIMIT_ALERT_THRESHOLD:
                warnings.append((source, usage_pct, f"{source}: {remaining}/{limit} remaining ({usage_pct*100:.0f}% used)"))
        # Otherwise check based on our hourly count
        elif calls > 0 and limit > 0:
            usage_pct = calls / limit
            if usage_pct >= RATE_LIMIT_ALERT_THRESHOLD:
                warnings.append((source, usage_pct, f"{source}: {calls}/{limit} calls/hour ({usage_pct*100:.0f}% used)"))
    
    return warnings


def write_rate_limit_alert(warnings: list):
    """Write rate limit alert file for heartbeat pickup."""
    alert_data = {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "warnings": [{"source": w[0], "usage_pct": round(w[1]*100, 1), "message": w[2]} for w in warnings],
        "full_status": {src: {k: v for k, v in data.items()} for src, data in API_RATE_LIMITS.items()}
    }
    
    try:
        with open(RATE_LIMIT_ALERT_FILE, "w") as f:
            json.dump(alert_data, f, indent=2)
        print(f"⚠️ RATE LIMIT ALERT written: {[w[2] for w in warnings]}")
    except Exception as e:
        print(f"Failed to write rate limit alert: {e}")


def log_rate_limits():
    """Log current rate limit status to JSONL file."""
    entry = {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "window_start": datetime.fromtimestamp(API_RATE_WINDOW_START, timezone.utc).isoformat(),
        "sources": {src: {
            "calls": data["calls_per_hour"],
            "limit": data["limit"],
            "remaining": data["remaining"],
            "usage_pct": round((data["calls_per_hour"] / data["limit"] * 100) if data["limit"] > 0 else 0, 1)
        } for src, data in API_RATE_LIMITS.items()}
    }
    
    try:
        with open(RATE_LIMIT_LOG_FILE, "a") as f:
            f.write(json.dumps(entry) + "\n")
    except Exception as e:
        print(f"Failed to log rate limits: {e}")


def get_rate_limit_summary() -> str:
    """Get formatted rate limit summary for console output."""
    lines = ["📊 API RATE LIMITS:"]
    for source, data in API_RATE_LIMITS.items():
        calls = data["calls_per_hour"]
        limit = data["limit"]
        remaining = data["remaining"]
        
        if remaining is not None:
            status = f"{remaining} remaining"
        else:
            status = f"{calls}/{limit} calls/hour"
        
        usage_pct = (calls / limit * 100) if limit > 0 else 0
        indicator = "🟢" if usage_pct < 50 else "🟡" if usage_pct < 80 else "🔴"
        lines.append(f"  {indicator} {source}: {status}")
    
    return "\n".join(lines)


# ============== REGIME CHANGE ALERTING ==============

def load_regime_state() -> dict:
    """Load previous regime state from file."""
    try:
        with open(REGIME_STATE_FILE, "r") as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return {"btc": None, "eth": None, "last_alert": 0}


def save_regime_state(state: dict):
    """Save current regime state to file."""
    with open(REGIME_STATE_FILE, "w") as f:
        json.dump(state, f, indent=2)


def check_regime_change(current_regimes: dict) -> list:
    """
    Check if regime changed for any asset and return changes.
    
    Args:
        current_regimes: Dict with btc and eth regime dicts from detect_market_regime()
    
    Returns:
        List of (asset, old_regime, new_regime) tuples for any changes
    """
    state = load_regime_state()
    changes = []
    
    for asset in ["btc", "eth"]:
        new_regime = current_regimes.get(asset, {}).get("regime", "unknown")
        old_regime = state.get(asset)
        
        if old_regime and old_regime != new_regime:
            changes.append((asset.upper(), old_regime, new_regime))
        
        # Update state
        state[asset] = new_regime
    
    save_regime_state(state)
    return changes


def write_regime_alert(changes: list, regime_details: dict):
    """
    Write regime change alert file for heartbeat pickup.
    
    Args:
        changes: List of (asset, old_regime, new_regime) tuples
        regime_details: Full regime data for context
    """
    state = load_regime_state()
    now = time.time()
    
    # Check cooldown
    if now - state.get("last_alert", 0) < REGIME_ALERT_COOLDOWN:
        print(f"   ⏳ Regime alert on cooldown ({int((REGIME_ALERT_COOLDOWN - (now - state['last_alert']))/60)}min left)")
        return
    
    alert_lines = ["🔄 MARKET REGIME CHANGE DETECTED\n"]
    
    for asset, old, new in changes:
        # Get direction indicator
        if new in ("trending_bullish",):
            emoji = "📈"
        elif new in ("trending_bearish",):
            emoji = "📉"
        elif new == "choppy":
            emoji = "⚡"
        else:
            emoji = "➡️"
        
        alert_lines.append(f"{emoji} {asset}: {old} → {new}")
        
        # Add context if available
        details = regime_details.get(asset.lower(), {}).get("details", {})
        if details:
            chg_4h = details.get("change_4h", 0) * 100
            chg_24h = details.get("change_24h", 0) * 100
            alert_lines.append(f"   4h: {chg_4h:+.2f}% | 24h: {chg_24h:+.2f}%")
        
        # Add trading implication
        new_edge = regime_details.get(asset.lower(), {}).get("dynamic_min_edge", MIN_EDGE)
        alert_lines.append(f"   New MIN_EDGE: {new_edge*100:.0f}%\n")
    
    alert_lines.append(f"Time: {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M UTC')}")
    
    with open(REGIME_ALERT_FILE, "w") as f:
        f.write("\n".join(alert_lines))
    
    # Update last alert time
    state["last_alert"] = now
    save_regime_state(state)
    
    print(f"   📢 Regime change alert written to {REGIME_ALERT_FILE}")


# ============== MOMENTUM DIRECTION CHANGE ALERTING ==============

def load_momentum_state() -> dict:
    """Load previous momentum direction state from file."""
    try:
        with open(MOMENTUM_STATE_FILE, "r") as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return {"btc": None, "eth": None, "last_alert": 0}


def save_momentum_state(state: dict):
    """Save current momentum direction state to file."""
    with open(MOMENTUM_STATE_FILE, "w") as f:
        json.dump(state, f, indent=2)


def get_momentum_direction_label(composite_dir: float) -> str:
    """Convert composite direction to label (bullish/bearish/neutral)."""
    if composite_dir > 0.1:
        return "bullish"
    elif composite_dir < -0.1:
        return "bearish"
    else:
        return "neutral"


def check_momentum_change(momentum_data: dict) -> list:
    """
    Check if momentum direction changed for any asset.
    
    Only alerts on significant direction flips:
    - bullish → bearish
    - bearish → bullish
    (Ignores neutral transitions to reduce noise)
    
    Returns:
        List of (asset, old_dir, new_dir, details) tuples for significant changes
    """
    state = load_momentum_state()
    changes = []
    
    for asset in ["btc", "eth"]:
        momentum = momentum_data.get(asset, {})
        composite_dir = momentum.get("composite_direction", 0)
        new_label = get_momentum_direction_label(composite_dir)
        old_label = state.get(asset)
        
        # Only alert on bullish↔bearish flips (not neutral transitions)
        if old_label and new_label != old_label:
            if (old_label == "bullish" and new_label == "bearish") or \
               (old_label == "bearish" and new_label == "bullish"):
                details = {
                    "composite_dir": composite_dir,
                    "composite_str": momentum.get("composite_strength", 0),
                    "alignment": momentum.get("alignment", False),
                    "timeframes": momentum.get("timeframes", {})
                }
                changes.append((asset.upper(), old_label, new_label, details))
        
        # Update state
        state[asset] = new_label
    
    save_momentum_state(state)
    return changes


def write_momentum_alert(changes: list):
    """
    Write momentum direction change alert file for heartbeat pickup.
    
    Args:
        changes: List of (asset, old_dir, new_dir, details) tuples
    """
    state = load_momentum_state()
    now = time.time()
    
    # Check cooldown
    if now - state.get("last_alert", 0) < MOMENTUM_ALERT_COOLDOWN:
        print(f"   ⏳ Momentum alert on cooldown ({int((MOMENTUM_ALERT_COOLDOWN - (now - state['last_alert']))/60)}min left)")
        return
    
    alert_lines = ["📊 MOMENTUM DIRECTION CHANGE\n"]
    
    for asset, old_dir, new_dir, details in changes:
        # Direction emoji
        if new_dir == "bullish":
            emoji = "🟢📈"
            action = "Consider YES bets"
        else:
            emoji = "🔴📉"
            action = "Consider NO bets"
        
        alert_lines.append(f"{emoji} {asset}: {old_dir.upper()} → {new_dir.upper()}")
        
        # Timeframe breakdown
        tfs = details.get("timeframes", {})
        tf_parts = []
        for tf in ["1h", "4h", "24h"]:
            tf_data = tfs.get(tf, {})
            pct = tf_data.get("pct_change", 0) * 100
            tf_parts.append(f"{tf}: {pct:+.2f}%")
        if tf_parts:
            alert_lines.append(f"   {' | '.join(tf_parts)}")
        
        alert_lines.append(f"   Composite: {details['composite_dir']:+.2f} | Strength: {details['composite_str']:.2f}")
        alert_lines.append(f"   💡 {action}\n")
    
    alert_lines.append(f"Time: {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M UTC')}")
    
    with open(MOMENTUM_ALERT_FILE, "w") as f:
        f.write("\n".join(alert_lines))
    
    # Update last alert time
    state["last_alert"] = now
    save_momentum_state(state)
    
    print(f"   📢 Momentum change alert written to {MOMENTUM_ALERT_FILE}")


# ============== WHIPSAW DETECTION (T393) ==============

def check_whipsaw(changes: list):
    """
    Detect whipsaw pattern: momentum flips direction twice within 24h.
    
    Whipsaw indicates choppy market conditions - consider reducing position sizes
    or pausing trading for that asset.
    
    Args:
        changes: List of (asset, old_dir, new_dir, details) tuples from current check
    """
    if not changes:
        return
    
    state = load_momentum_state()
    now = time.time()
    
    # Initialize history if not present
    if "direction_history" not in state:
        state["direction_history"] = {"btc": [], "eth": []}
    
    whipsaws_detected = []
    window_seconds = WHIPSAW_WINDOW_HOURS * 3600
    
    for asset, old_dir, new_dir, details in changes:
        asset_lower = asset.lower()
        history = state["direction_history"].get(asset_lower, [])
        
        # Add current change to history
        history.append({
            "timestamp": now,
            "old": old_dir,
            "new": new_dir
        })
        
        # Clean old entries (older than window)
        history = [h for h in history if now - h["timestamp"] < window_seconds]
        state["direction_history"][asset_lower] = history
        
        # Check for whipsaw: 2+ significant flips in window
        # Look for pattern: bullish→bearish→bullish or bearish→bullish→bearish
        if len(history) >= 2:
            # Count direction flips (not just changes - actual reversals)
            flip_count = 0
            for i, change in enumerate(history):
                if change["old"] in ("bullish", "bearish") and change["new"] in ("bullish", "bearish"):
                    # This is a significant flip (not involving neutral)
                    flip_count += 1
            
            if flip_count >= 2:
                # Whipsaw detected!
                hours_window = (now - history[0]["timestamp"]) / 3600
                whipsaws_detected.append({
                    "asset": asset,
                    "flips": flip_count,
                    "window_hours": hours_window,
                    "history": history[-3:],  # Last 3 changes
                    "latest_direction": new_dir
                })
    
    save_momentum_state(state)
    
    # Write alert if whipsaw detected
    if whipsaws_detected:
        write_whipsaw_alert(whipsaws_detected)


def write_whipsaw_alert(whipsaws: list):
    """Write whipsaw alert file for heartbeat pickup."""
    state = load_momentum_state()
    now = time.time()
    
    # Check cooldown
    if now - state.get("last_whipsaw_alert", 0) < WHIPSAW_ALERT_COOLDOWN:
        remaining = int((WHIPSAW_ALERT_COOLDOWN - (now - state["last_whipsaw_alert"])) / 60)
        print(f"   ⏳ Whipsaw alert on cooldown ({remaining}min left)")
        return
    
    alert_lines = ["⚠️ WHIPSAW DETECTED - CHOPPY MARKET\n"]
    
    for ws in whipsaws:
        alert_lines.append(f"🔀 {ws['asset']}: {ws['flips']} direction flips in {ws['window_hours']:.1f}h")
        alert_lines.append(f"   Current direction: {ws['latest_direction']}")
        alert_lines.append(f"   Recent changes: {' → '.join(h['new'] for h in ws['history'])}")
        alert_lines.append("")
    
    alert_lines.append("💡 RECOMMENDATION:")
    alert_lines.append("   • Reduce position sizes for affected assets")
    alert_lines.append("   • Consider pausing trading until momentum stabilizes")
    alert_lines.append("   • Higher MIN_EDGE may be appropriate")
    alert_lines.append("")
    alert_lines.append(f"Time: {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M UTC')}")
    
    with open(WHIPSAW_ALERT_FILE, "w") as f:
        f.write("\n".join(alert_lines))
    
    # Update last alert time
    state["last_whipsaw_alert"] = now
    save_momentum_state(state)
    
    print(f"   ⚠️ Whipsaw alert written to {WHIPSAW_ALERT_FILE}")


# ============== FULL MOMENTUM ALIGNMENT ALERTING (T301) ==============

def check_momentum_alignment_alert(momentum_data: dict):
    """
    Check if all timeframes are aligned with strong signal.
    Alert for high-conviction opportunity when 1h/4h/24h all agree.
    """
    if not momentum_data:
        return
    
    alerts = []
    now = time.time()
    
    # Check cooldown
    try:
        if os.path.exists(MOMENTUM_ALIGN_ALERT_FILE):
            mtime = os.path.getmtime(MOMENTUM_ALIGN_ALERT_FILE)
            if now - mtime < MOMENTUM_ALIGN_ALERT_COOLDOWN:
                return  # On cooldown
    except Exception:
        pass
    
    for asset in ["btc", "eth"]:
        momentum = momentum_data.get(asset, {})
        
        # Check for full alignment with strong signal
        is_aligned = momentum.get("alignment", False)
        composite_dir = momentum.get("composite_direction", 0)
        composite_str = momentum.get("composite_strength", 0)
        timeframes = momentum.get("timeframes", {})
        
        if not is_aligned or composite_str < MOMENTUM_ALIGN_MIN_STRENGTH:
            continue
        
        # Determine direction
        if composite_dir > 0.3:
            direction = "🟢 BULLISH"
            signal = "Strong upward momentum across all timeframes"
            action = "Consider YES bets on upside targets"
        elif composite_dir < -0.3:
            direction = "🔴 BEARISH" 
            signal = "Strong downward momentum across all timeframes"
            action = "Consider NO bets on upside targets"
        else:
            continue  # Not strong enough
        
        alerts.append({
            "asset": asset.upper(),
            "direction": direction,
            "signal": signal,
            "action": action,
            "composite_dir": composite_dir,
            "composite_str": composite_str,
            "timeframes": timeframes
        })
    
    if alerts:
        write_momentum_alignment_alert(alerts)


def write_momentum_alignment_alert(alerts: list):
    """Write full momentum alignment alert file for heartbeat pickup."""
    alert_lines = [
        "🎯 FULL MOMENTUM ALIGNMENT DETECTED!\n",
        "All timeframes (1h/4h/24h) agree - HIGH CONVICTION signal\n"
    ]
    
    for alert in alerts:
        asset = alert["asset"]
        direction = alert["direction"]
        signal = alert["signal"]
        action = alert["action"]
        composite_dir = alert["composite_dir"]
        composite_str = alert["composite_str"]
        timeframes = alert["timeframes"]
        
        alert_lines.append(f"📊 {asset}: {direction}")
        alert_lines.append(f"   {signal}")
        alert_lines.append("")
        
        # Show individual timeframes
        for tf, data in timeframes.items():
            tf_dir = data.get("direction", 0)
            tf_str = data.get("strength", 0)
            tf_label = "↑" if tf_dir > 0 else "↓" if tf_dir < 0 else "→"
            alert_lines.append(f"   {tf}: {tf_label} dir={tf_dir:+.2f} str={tf_str:.2f}")
        
        alert_lines.append(f"\n   Composite: {composite_dir:+.2f} | Strength: {composite_str:.2f}")
        alert_lines.append(f"   💡 {action}\n")
    
    alert_lines.append(f"Time: {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M UTC')}")
    alert_lines.append("\n⚠️ This is a rare high-confidence signal. Use appropriate position sizing!")
    
    alert_data = {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "type": "momentum_alignment",
        "alerts": alerts,
        "message": "\n".join(alert_lines)
    }
    
    with open(MOMENTUM_ALIGN_ALERT_FILE, "w") as f:
        json.dump(alert_data, f, indent=2)
    
    print(f"   🎯 Full momentum alignment alert written!")


# ============== PROPER PROBABILITY MODEL ==============

def norm_cdf(x):
    """Standard normal CDF approximation (no scipy needed)"""
    # Abramowitz and Stegun approximation
    a1, a2, a3, a4, a5 = 0.254829592, -0.284496736, 1.421413741, -1.453152027, 1.061405429
    p = 0.3275911
    sign = 1 if x >= 0 else -1
    x = abs(x)
    t = 1.0 / (1.0 + p * x)
    y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * math.exp(-x * x / 2)
    return 0.5 * (1.0 + sign * y)


def calculate_prob_above_strike(current_price: float, strike: float, 
                                 minutes_to_expiry: float, hourly_vol: float) -> float:
    """
    Calculate probability that price will be ABOVE strike at expiry.
    Uses log-normal price model (simplified Black-Scholes).
    
    P(S_T > K) = N(d2) where:
    d2 = (ln(S/K) + (r - σ²/2)T) / (σ√T)
    
    For short-term crypto, r ≈ 0 (no drift assumption for hourly)
    """
    if minutes_to_expiry <= 0:
        return 1.0 if current_price > strike else 0.0
    
    # Time in hours
    T = minutes_to_expiry / 60.0
    
    # Annualized volatility (hourly vol * sqrt(24*365) for proper scaling)
    # But for short periods, we use hourly vol directly scaled by sqrt(time)
    sigma = hourly_vol * math.sqrt(T)  # Vol for this time period
    
    if sigma <= 0:
        return 1.0 if current_price > strike else 0.0
    
    # d2 with zero drift (conservative for hourly)
    # d2 = ln(S/K) / σ - σ/2
    log_ratio = math.log(current_price / strike)
    d2 = log_ratio / sigma - sigma / 2
    
    prob_above = norm_cdf(d2)
    
    return max(0.01, min(0.99, prob_above))


def get_trend_adjustment(prices_1h: list) -> float:
    """
    Calculate trend adjustment based on recent price action.
    Returns adjustment to probability (-0.1 to +0.1).
    Positive = bullish (price trending up)
    """
    if not prices_1h or len(prices_1h) < 3:
        return 0.0
    
    # Simple: compare current to average of last hour
    current = prices_1h[-1]
    avg = sum(prices_1h) / len(prices_1h)
    
    pct_change = (current - avg) / avg
    
    # Cap adjustment at ±10%
    return max(-0.1, min(0.1, pct_change * 5))


# ============== MULTI-TIMEFRAME MOMENTUM ==============

# Cached OHLC config (T381)
OHLC_CACHE_DIR = Path(__file__).parent.parent / "data" / "ohlc"
OHLC_CACHE_MAX_AGE_HOURS = 24  # Consider cache stale after 24h
COIN_ID_TO_CACHE_FILE = {
    "bitcoin": "btc-ohlc.json",
    "ethereum": "eth-ohlc.json"
}


def load_cached_ohlc(coin_id: str) -> tuple[list, bool]:
    """
    Load OHLC data from local cache file.
    
    Args:
        coin_id: CoinGecko coin id ("bitcoin" or "ethereum")
    
    Returns:
        (ohlc_data, is_fresh): OHLC list in CoinGecko format, whether cache is fresh
    """
    cache_file = COIN_ID_TO_CACHE_FILE.get(coin_id)
    if not cache_file:
        return [], False
    
    cache_path = OHLC_CACHE_DIR / cache_file
    if not cache_path.exists():
        return [], False
    
    try:
        with open(cache_path, "r") as f:
            data = json.load(f)
        
        # Check freshness
        updated_at = data.get("updated_at", "")
        is_fresh = False
        if updated_at:
            try:
                # Parse ISO timestamp
                updated_time = datetime.fromisoformat(updated_at.replace("Z", "+00:00"))
                age_hours = (datetime.now(timezone.utc) - updated_time).total_seconds() / 3600
                is_fresh = age_hours < OHLC_CACHE_MAX_AGE_HOURS
            except (ValueError, TypeError):
                pass
        
        # Convert cache format to CoinGecko API format: [[timestamp, open, high, low, close], ...]
        candles = data.get("candles", [])
        ohlc_data = []
        for c in candles:
            ohlc_data.append([
                c.get("timestamp"),
                c.get("open"),
                c.get("high"),
                c.get("low"),
                c.get("close")
            ])
        
        if ohlc_data:
            symbol = data.get("symbol", coin_id.upper())
            status = "fresh" if is_fresh else "stale"
            print(f"[OHLC] Loaded {len(ohlc_data)} cached {symbol} candles ({status})")
        
        return ohlc_data, is_fresh
    
    except (json.JSONDecodeError, KeyError, TypeError) as e:
        print(f"[WARN] Failed to load cached OHLC for {coin_id}: {e}")
        return [], False


def get_crypto_ohlc(coin_id: str = "bitcoin", days: int = 1) -> list:
    """Get crypto OHLC data, preferring local cache to reduce API calls.
    
    Args:
        coin_id: CoinGecko coin id ("bitcoin" or "ethereum")
        days: Number of days (valid: 1, 7, 14, 30, 90, 180, 365, max)
    
    Strategy:
        1. Try local cache first (data/ohlc/*.json)
        2. If cache is fresh (< 24h old), use it
        3. If cache is stale but exists, use it with warning
        4. Fall back to live CoinGecko API if cache unavailable
    """
    # Try cached data first (T381)
    cached_data, is_fresh = load_cached_ohlc(coin_id)
    if cached_data and is_fresh:
        record_api_latency("ohlc_cache_hit", 0)  # Track cache usage
        return cached_data
    
    # Try live API with latency tracking
    start = time.time()
    try:
        # CoinGecko OHLC endpoint - days=1 gives ~48 candles (30min intervals)
        # days=7 gives hourly candles - better for 24h momentum
        valid_days = min(7, max(1, days))  # Clamp to valid values
        resp = requests.get(
            f"https://api.coingecko.com/api/v3/coins/{coin_id}/ohlc?vs_currency=usd&days={valid_days}",
            timeout=10
        )
        latency = (time.time() - start) * 1000
        record_api_latency(f"ext_ohlc_{coin_id[:3]}", latency)
        if resp.status_code == 200:
            data = resp.json()
            if isinstance(data, list) and data:
                print(f"[OHLC] Fetched {len(data)} live {coin_id.upper()} candles from CoinGecko ({latency:.0f}ms)")
                return data
        print(f"[WARN] {coin_id.upper()} OHLC API returned {resp.status_code}")
    except Exception as e:
        latency = (time.time() - start) * 1000
        record_api_latency(f"ext_ohlc_{coin_id[:3]}_error", latency)
        print(f"[WARN] CoinGecko OHLC fetch failed: {e}")
    
    # Fall back to stale cache if available
    if cached_data:
        print(f"[WARN] Using stale cached OHLC for {coin_id} (API unavailable)")
        return cached_data
    
    return []


def get_btc_ohlc(days: int = 1) -> list:
    """Get BTC OHLC data (wrapper for backwards compatibility)"""
    return get_crypto_ohlc("bitcoin", days)


def get_eth_ohlc(days: int = 1) -> list:
    """Get ETH OHLC data"""
    return get_crypto_ohlc("ethereum", days)


def calculate_momentum(ohlc_data: list, timeframe: str) -> dict:
    """
    Calculate momentum metrics for a specific timeframe.
    
    Returns:
        direction: -1 (bearish), 0 (neutral), 1 (bullish)
        strength: 0.0 to 1.0
        pct_change: actual % change
    """
    if not ohlc_data or len(ohlc_data) < 4:
        return {"direction": 0, "strength": 0.0, "pct_change": 0.0}
    
    now_ms = time.time() * 1000
    
    # Map timeframe to hours
    hours_map = {"1h": 1, "4h": 4, "24h": 24}
    hours = hours_map.get(timeframe, 1)
    cutoff_ms = now_ms - (hours * 60 * 60 * 1000)
    
    # Get prices in timeframe
    prices_in_range = [c[4] for c in ohlc_data if c[0] >= cutoff_ms]  # Close prices
    
    if len(prices_in_range) < 2:
        # Fall back to last N candles
        n_candles = min(hours, len(ohlc_data))
        prices_in_range = [c[4] for c in ohlc_data[-n_candles:]]
    
    if len(prices_in_range) < 2:
        return {"direction": 0, "strength": 0.0, "pct_change": 0.0}
    
    start_price = prices_in_range[0]
    end_price = prices_in_range[-1]
    
    pct_change = (end_price - start_price) / start_price
    
    # Calculate direction and strength
    if abs(pct_change) < 0.001:  # <0.1% is neutral
        direction = 0
        strength = 0.0
    elif pct_change > 0:
        direction = 1
        strength = min(1.0, abs(pct_change) * 20)  # 5% = full strength
    else:
        direction = -1
        strength = min(1.0, abs(pct_change) * 20)
    
    return {
        "direction": direction,
        "strength": strength,
        "pct_change": pct_change
    }


def get_multi_timeframe_momentum(ohlc_data: list) -> dict:
    """
    Calculate momentum across multiple timeframes.
    
    Returns:
        composite_direction: weighted direction (-1 to 1)
        composite_strength: weighted strength (0 to 1)
        timeframes: individual timeframe data
        alignment: True if all timeframes agree
    """
    result = {
        "composite_direction": 0.0,
        "composite_strength": 0.0,
        "timeframes": {},
        "alignment": False
    }
    
    if not ohlc_data:
        return result
    
    directions = []
    total_weight = 0
    composite_dir = 0.0
    composite_str = 0.0
    
    for tf in MOMENTUM_TIMEFRAMES:
        mom = calculate_momentum(ohlc_data, tf)
        result["timeframes"][tf] = mom
        
        weight = MOMENTUM_WEIGHT.get(tf, 0.33)
        composite_dir += mom["direction"] * mom["strength"] * weight
        composite_str += mom["strength"] * weight
        total_weight += weight
        
        if mom["strength"] > 0.1:  # Only count if meaningful
            directions.append(mom["direction"])
    
    if total_weight > 0:
        result["composite_direction"] = composite_dir / total_weight
        result["composite_strength"] = composite_str / total_weight
    
    # Check alignment - all non-zero directions should match
    if len(directions) >= 2:
        result["alignment"] = len(set(directions)) == 1
    
    return result


def adjust_probability_with_momentum(prob: float, strike: float, current_price: float, 
                                     momentum: dict, side: str) -> float:
    """
    Adjust probability based on multi-timeframe momentum.
    
    For YES (betting price goes UP):
        - Bullish momentum increases our probability
        - Bearish momentum decreases it
    
    For NO (betting price stays DOWN/below):
        - Bearish momentum increases our probability
        - Bullish momentum decreases it
    """
    composite_dir = momentum.get("composite_direction", 0)
    composite_str = momentum.get("composite_strength", 0)
    alignment = momentum.get("alignment", False)
    
    # Max adjustment is ±15% with full alignment, ±8% without
    max_adj = 0.15 if alignment else 0.08
    
    # Calculate adjustment
    adjustment = composite_dir * composite_str * max_adj
    
    # Apply adjustment based on side
    if side == "yes":
        # Bullish momentum helps YES bets
        adjusted = prob + adjustment
    else:  # side == "no"
        # Bearish momentum helps NO bets (so we flip the sign)
        adjusted = prob - adjustment
    
    # Clamp to valid probability range
    return max(0.01, min(0.99, adjusted))


# ============== MARKET REGIME DETECTION ==============

def detect_market_regime(ohlc_data: list, momentum: dict) -> dict:
    """
    Detect market regime based on price action and momentum.
    
    Regimes:
        - "trending_bullish": Strong uptrend, predictable direction
        - "trending_bearish": Strong downtrend, predictable direction
        - "sideways": No clear trend, range-bound
        - "choppy": High volatility with no trend (hardest to trade)
    
    Returns:
        regime: str (one of above)
        confidence: float (0-1)
        volatility: str ("low", "normal", "high")
        dynamic_min_edge: float (adjusted MIN_EDGE for this regime)
    """
    result = {
        "regime": "sideways",
        "confidence": 0.5,
        "volatility": "normal",
        "dynamic_min_edge": MIN_EDGE,  # default
        "details": {}
    }
    
    if not ohlc_data or len(ohlc_data) < 24:
        return result
    
    # Calculate price changes over different periods
    current_price = ohlc_data[-1][4] if ohlc_data[-1] else None  # Close price
    if not current_price:
        return result
    
    # 4-hour price change (last ~4 hourly candles)
    price_4h_ago = ohlc_data[-4][4] if len(ohlc_data) >= 4 else current_price
    change_4h = (current_price - price_4h_ago) / price_4h_ago if price_4h_ago else 0
    
    # 24-hour price change
    price_24h_ago = ohlc_data[0][4] if len(ohlc_data) >= 24 else current_price
    change_24h = (current_price - price_24h_ago) / price_24h_ago if price_24h_ago else 0
    
    # Calculate volatility (using range-based proxy)
    ranges = []
    for candle in ohlc_data[-24:]:
        if candle and len(candle) >= 4:
            high, low = candle[2], candle[3]
            if low > 0:
                ranges.append((high - low) / low)
    
    avg_range = sum(ranges) / len(ranges) if ranges else 0
    
    # Classify volatility (buckets per T285)
    # very_low: <0.3%, low: 0.3-0.5%, normal: 0.5-1%, high: 1-2%, very_high: >2%
    if avg_range < 0.003:  # < 0.3% avg range
        vol_class = "very_low"
    elif avg_range < 0.005:  # 0.3% - 0.5%
        vol_class = "low"
    elif avg_range < 0.01:  # 0.5% - 1%
        vol_class = "normal"
    elif avg_range < 0.02:  # 1% - 2%
        vol_class = "high"
    else:  # > 2%
        vol_class = "very_high"
    
    result["volatility"] = vol_class
    result["details"]["avg_range"] = avg_range
    result["details"]["change_4h"] = change_4h
    result["details"]["change_24h"] = change_24h
    
    # Get momentum data
    mom_dir = momentum.get("composite_direction", 0) if momentum else 0
    mom_str = momentum.get("composite_strength", 0) if momentum else 0
    mom_aligned = momentum.get("alignment", False) if momentum else False
    
    result["details"]["momentum_dir"] = mom_dir
    result["details"]["momentum_str"] = mom_str
    result["details"]["momentum_aligned"] = mom_aligned
    
    # Determine regime
    abs_4h = abs(change_4h)
    abs_24h = abs(change_24h)
    
    # Strong trend: consistent direction + meaningful price change
    is_bullish = change_4h > 0.005 and change_24h > 0.01 and mom_dir > 0.2
    is_bearish = change_4h < -0.005 and change_24h < -0.01 and mom_dir < -0.2
    
    if is_bullish and mom_aligned:
        result["regime"] = "trending_bullish"
        result["confidence"] = min(0.9, 0.5 + abs_24h * 10 + mom_str * 0.3)
    elif is_bearish and mom_aligned:
        result["regime"] = "trending_bearish"
        result["confidence"] = min(0.9, 0.5 + abs_24h * 10 + mom_str * 0.3)
    elif vol_class == "high" and abs_24h < 0.02:
        # High volatility but no directional move = choppy
        result["regime"] = "choppy"
        result["confidence"] = 0.7
    else:
        result["regime"] = "sideways"
        result["confidence"] = 0.6
    
    # Calculate dynamic MIN_EDGE based on regime
    # Trending markets = easier to predict = lower edge required
    # Choppy/sideways = harder = higher edge required
    if result["regime"] in ("trending_bullish", "trending_bearish"):
        # Lower edge in trending (easier), even lower if high confidence
        base_edge = 0.07  # 7% base for trending
        confidence_adj = (1 - result["confidence"]) * 0.03  # up to 3% more if low confidence
        result["dynamic_min_edge"] = base_edge + confidence_adj
    elif result["regime"] == "choppy":
        # Choppy = highest edge required (hardest to trade)
        result["dynamic_min_edge"] = 0.15  # 15% minimum
    else:  # sideways
        # Sideways = moderate edge
        result["dynamic_min_edge"] = 0.12  # 12% minimum
    
    # Volatility adjustment
    if vol_class == "high":
        result["dynamic_min_edge"] += 0.02  # +2% for high vol
    elif vol_class == "low":
        result["dynamic_min_edge"] -= 0.01  # -1% for low vol (more predictable)
    
    # Ensure min edge stays in reasonable bounds
    result["dynamic_min_edge"] = max(0.05, min(0.20, result["dynamic_min_edge"]))
    
    return result


def get_regime_for_asset(asset: str, ohlc_cache: dict, momentum_cache: dict) -> dict:
    """Get market regime for a specific asset (btc or eth)."""
    ohlc = ohlc_cache.get(asset, [])
    momentum = momentum_cache.get(asset, {})
    return detect_market_regime(ohlc, momentum)


# ============== VOLATILITY REBALANCING (T237) ==============

def calculate_realized_volatility(ohlc_data: list, hours: int = 24) -> float:
    """
    Calculate realized volatility from OHLC data.
    
    Uses log returns of hourly close prices.
    
    Args:
        ohlc_data: List of [timestamp, open, high, low, close] from CoinGecko
        hours: Number of hours to use (default 24)
    
    Returns:
        Hourly realized volatility as decimal (e.g., 0.008 = 0.8%)
    """
    if not ohlc_data or len(ohlc_data) < 2:
        return None
    
    # Get last N candles
    candles = ohlc_data[-min(hours, len(ohlc_data)):]
    
    # Extract close prices
    closes = [c[4] for c in candles if len(c) >= 5 and c[4] and c[4] > 0]
    
    if len(closes) < 2:
        return None
    
    # Calculate log returns
    log_returns = []
    for i in range(1, len(closes)):
        if closes[i] > 0 and closes[i-1] > 0:
            log_returns.append(math.log(closes[i] / closes[i-1]))
    
    if not log_returns:
        return None
    
    # Calculate standard deviation of returns (realized volatility)
    mean = sum(log_returns) / len(log_returns)
    variance = sum((r - mean) ** 2 for r in log_returns) / len(log_returns)
    realized_vol = math.sqrt(variance)
    
    return realized_vol


def get_volatility_advantage(ohlc_data: dict) -> dict:
    """
    Compare realized vs assumed volatility for each asset.
    
    Returns advantage score for each asset:
    - Positive = realized > assumed (favor YES bets, more likely to break strikes)
    - Negative = realized < assumed (favor NO bets, less likely to break strikes)
    - Zero = neutral or no data
    
    Also determines which asset has better trading conditions overall.
    
    Returns:
        {
            "btc": {"realized": 0.006, "assumed": 0.005, "ratio": 1.2, "advantage": "yes"},
            "eth": {"realized": 0.008, "assumed": 0.007, "ratio": 1.14, "advantage": "yes"},
            "preferred_asset": "btc",  # Asset with higher vol ratio
            "vol_bonus": {"btc": 0.01, "eth": 0.005}  # Edge bonus for each asset
        }
    """
    result = {
        "btc": {"realized": None, "assumed": BTC_HOURLY_VOL, "ratio": 1.0, "advantage": "neutral"},
        "eth": {"realized": None, "assumed": ETH_HOURLY_VOL, "ratio": 1.0, "advantage": "neutral"},
        "preferred_asset": None,
        "vol_bonus": {"btc": 0, "eth": 0}
    }
    
    # Calculate realized volatility for each asset
    for asset in ["btc", "eth"]:
        ohlc = ohlc_data.get(asset, [])
        realized = calculate_realized_volatility(ohlc, hours=24)
        
        if realized is not None:
            assumed = BTC_HOURLY_VOL if asset == "btc" else ETH_HOURLY_VOL
            ratio = realized / assumed if assumed > 0 else 1.0
            
            result[asset]["realized"] = realized
            result[asset]["ratio"] = ratio
            
            # Determine advantage direction
            if ratio > 1.15:  # >15% higher realized vol
                result[asset]["advantage"] = "yes"  # Favor YES bets (more movement)
            elif ratio < 0.85:  # >15% lower realized vol
                result[asset]["advantage"] = "no"   # Favor NO bets (less movement)
            else:
                result[asset]["advantage"] = "neutral"
            
            # Calculate edge bonus (max ±2% bonus)
            # Higher ratio = bonus for YES, Lower ratio = bonus for NO
            vol_diff = (ratio - 1.0)  # Positive if realized > assumed
            result["vol_bonus"][asset] = min(0.02, max(-0.02, vol_diff * 0.1))
    
    # Determine preferred asset (one with higher vol ratio = more edge opportunities)
    btc_ratio = result["btc"]["ratio"]
    eth_ratio = result["eth"]["ratio"]
    
    if btc_ratio > eth_ratio * 1.1:  # BTC has 10%+ higher ratio
        result["preferred_asset"] = "btc"
    elif eth_ratio > btc_ratio * 1.1:  # ETH has 10%+ higher ratio
        result["preferred_asset"] = "eth"
    else:
        result["preferred_asset"] = None  # No clear preference
    
    return result


# ============== API FUNCTIONS ==============

def sign_request(method: str, path: str, timestamp: str) -> str:
    """Sign request with RSA-PSS"""
    private_key = serialization.load_pem_private_key(PRIVATE_KEY.encode(), password=None)
    message = f"{timestamp}{method}{path}".encode('utf-8')
    signature = private_key.sign(
        message,
        padding.PSS(mgf=padding.MGF1(hashes.SHA256()), salt_length=padding.PSS.MAX_LENGTH),
        hashes.SHA256()
    )
    return base64.b64encode(signature).decode('utf-8')


def api_request(method: str, path: str, body: dict = None, max_retries: int = 3) -> dict:
    """Make authenticated API request with exponential backoff retry and latency tracking"""
    url = f"{BASE_URL}{path}"
    
    # Extract endpoint name for profiling (e.g., "/trade-api/v2/portfolio/balance" -> "balance")
    endpoint_name = path.split("/")[-1].split("?")[0]
    if "orders" in path:
        endpoint_name = "order"
    elif "positions" in path:
        endpoint_name = "positions"
    elif "balance" in path:
        endpoint_name = "balance"
    elif "markets" in path and "{" not in path:
        endpoint_name = "markets_search"
    elif "fills" in path:
        endpoint_name = "fills"
    
    total_start = time.time()
    
    for attempt in range(max_retries):
        # Generate fresh signature for each attempt (timestamp changes)
        timestamp = str(int(datetime.now(timezone.utc).timestamp() * 1000))
        signature = sign_request(method, path.split('?')[0], timestamp)
        headers = {
            "KALSHI-ACCESS-KEY": API_KEY_ID,
            "KALSHI-ACCESS-SIGNATURE": signature,
            "KALSHI-ACCESS-TIMESTAMP": timestamp,
            "Content-Type": "application/json"
        }
        
        attempt_start = time.time()
        
        try:
            if method == "GET":
                resp = requests.get(url, headers=headers, timeout=10)
            elif method == "POST":
                resp = requests.post(url, headers=headers, json=body, timeout=10)
            
            attempt_latency = (time.time() - attempt_start) * 1000  # Convert to ms
            
            # Check for server errors (5xx) - retry these
            if resp.status_code >= 500:
                if attempt < max_retries - 1:
                    wait_time = (2 ** attempt) + (time.time() % 1)  # Exponential backoff with jitter
                    print(f"[RETRY] API {resp.status_code} error, waiting {wait_time:.1f}s (attempt {attempt + 1}/{max_retries})")
                    time.sleep(wait_time)
                    continue
                else:
                    total_latency = (time.time() - total_start) * 1000
                    record_api_latency(f"{endpoint_name}_failed", total_latency)
                    return {"error": f"API error {resp.status_code} after {max_retries} retries"}
            
            # Success - record latency and rate limit
            total_latency = (time.time() - total_start) * 1000
            record_api_latency(endpoint_name, total_latency)
            record_api_call("kalshi", dict(resp.headers))  # Track rate limit headers
            
            # Client errors (4xx) - don't retry, return as-is
            return resp.json()
            
        except requests.exceptions.Timeout:
            if attempt < max_retries - 1:
                wait_time = (2 ** attempt) + (time.time() % 1)
                print(f"[RETRY] Timeout, waiting {wait_time:.1f}s (attempt {attempt + 1}/{max_retries})")
                time.sleep(wait_time)
                continue
            total_latency = (time.time() - total_start) * 1000
            record_api_latency(f"{endpoint_name}_timeout", total_latency)
            return {"error": f"Timeout after {max_retries} retries"}
            
        except requests.exceptions.ConnectionError:
            if attempt < max_retries - 1:
                wait_time = (2 ** attempt) + (time.time() % 1)
                print(f"[RETRY] Connection error, waiting {wait_time:.1f}s (attempt {attempt + 1}/{max_retries})")
                time.sleep(wait_time)
                continue
            total_latency = (time.time() - total_start) * 1000
            record_api_latency(f"{endpoint_name}_conn_error", total_latency)
            return {"error": f"Connection error after {max_retries} retries"}
            
        except Exception as e:
            total_latency = (time.time() - total_start) * 1000
            record_api_latency(f"{endpoint_name}_error", total_latency)
            return {"error": str(e)}
    
    return {"error": "Max retries exceeded"}


def get_balance() -> dict:
    return api_request("GET", "/trade-api/v2/portfolio/balance")


def get_positions() -> list:
    result = api_request("GET", "/trade-api/v2/portfolio/positions")
    return result.get("market_positions", [])


def get_fills(limit=100) -> list:
    result = api_request("GET", f"/trade-api/v2/portfolio/fills?limit={limit}")
    return result.get("fills", [])


def get_market(ticker: str) -> dict:
    result = api_request("GET", f"/trade-api/v2/markets/{ticker}")
    return result.get("market", {})


def search_markets(series: str = None, limit: int = 50) -> list:
    path = f"/trade-api/v2/markets?limit={limit}&status=open"
    if series:
        path += f"&series_ticker={series}"
    result = api_request("GET", path)
    return result.get("markets", [])


def place_order(ticker: str, side: str, count: int, price_cents: int) -> dict:
    body = {
        "ticker": ticker,
        "action": "buy",
        "side": side,
        "count": count,
        "type": "limit",
        "yes_price": price_cents if side == "yes" else 100 - price_cents
    }
    return api_request("POST", "/trade-api/v2/portfolio/orders", body)


def sell_position(ticker: str, side: str, count: int, price_cents: int = None) -> dict:
    """
    Sell/exit an existing position.
    If price_cents is None, use market order (sell at best available price).
    """
    # For market-like execution, we use aggressive limit prices
    if price_cents is None:
        # Sell YES at 1 cent (aggressive), sell NO at 1 cent (which means yes_price = 99)
        price_cents = 1 if side == "yes" else 99
    
    body = {
        "ticker": ticker,
        "action": "sell",
        "side": side,
        "count": count,
        "type": "limit",
        "yes_price": price_cents if side == "yes" else 100 - price_cents
    }
    return api_request("POST", "/trade-api/v2/portfolio/orders", body)


# ============== STOP-LOSS MONITORING ==============

# Stop-loss parameters (configurable via environment)
STOP_LOSS_THRESHOLD = float(os.getenv("STOP_LOSS_THRESHOLD", "0.50"))  # Exit if position value drops X% (default 50%)
MIN_STOP_LOSS_VALUE = int(os.getenv("MIN_STOP_LOSS_VALUE", "5"))  # Don't exit positions worth less than X cents
STOP_LOSS_LOG_FILE = "scripts/kalshi-stop-loss.log"
STOP_LOSS_ALERT_FILE = Path(__file__).parent / "kalshi-stop-loss.alert"


def check_stop_losses(positions: list, prices: dict) -> list:
    """
    Check all open positions for stop-loss triggers.
    
    For Kalshi binary options:
    - We paid X cents to enter
    - Current market value is Y cents (current bid)
    - If Y < X * (1 - STOP_LOSS_THRESHOLD), exit
    
    Returns list of positions that should be exited.
    """
    positions_to_exit = []
    
    if not positions:
        return positions_to_exit
    
    for pos in positions:
        ticker = pos.get("ticker", "")
        position = pos.get("position", 0)  # Positive = YES, Negative = NO
        
        if position == 0:
            continue
        
        # Get current market info
        market = get_market(ticker)
        if not market:
            continue
        
        # Determine our side and current market value
        if position > 0:
            side = "yes"
            contracts = position
            # Current value is what we can sell for (yes_bid)
            current_value = market.get("yes_bid", 0)
        else:
            side = "no"
            contracts = abs(position)
            # For NO positions, value is 100 - yes_ask (what we can sell NO for)
            current_value = 100 - market.get("yes_ask", 100)
        
        # Get our entry price from trade log
        entry_price = get_entry_price_for_position(ticker, side)
        if entry_price is None:
            continue  # Can't find entry, skip
        
        # Calculate if we should exit
        # Stop-loss: if current value is below threshold of entry
        stop_loss_price = entry_price * (1 - STOP_LOSS_THRESHOLD)
        
        if current_value < stop_loss_price and current_value >= MIN_STOP_LOSS_VALUE:
            loss_pct = (entry_price - current_value) / entry_price * 100
            positions_to_exit.append({
                "ticker": ticker,
                "side": side,
                "contracts": contracts,
                "entry_price": entry_price,
                "current_value": current_value,
                "loss_pct": loss_pct,
                "stop_loss_trigger": stop_loss_price
            })
    
    return positions_to_exit


def get_entry_price_for_position(ticker: str, side: str) -> float:
    """
    Look up the entry price for a position from trade log.
    Returns average entry price if multiple entries, or None if not found.
    """
    log_path = Path(TRADE_LOG_FILE)
    if not log_path.exists():
        return None
    
    total_cost = 0
    total_contracts = 0
    
    with open(log_path) as f:
        for line in f:
            try:
                entry = json.loads(line.strip())
                if (entry.get("type") == "trade" and 
                    entry.get("ticker") == ticker and 
                    entry.get("side") == side and
                    entry.get("result_status") == "pending"):
                    total_cost += entry.get("price_cents", 0) * entry.get("contracts", 0)
                    total_contracts += entry.get("contracts", 0)
            except:
                continue
    
    if total_contracts > 0:
        return total_cost / total_contracts
    return None


def execute_stop_losses(stop_loss_positions: list) -> int:
    """
    Execute stop-loss orders for positions that triggered.
    Returns number of positions exited.
    """
    exited = 0
    
    for pos in stop_loss_positions:
        ticker = pos["ticker"]
        side = pos["side"]
        contracts = pos["contracts"]
        entry = pos["entry_price"]
        current = pos["current_value"]
        loss_pct = pos["loss_pct"]
        
        print(f"\n⚠️ STOP-LOSS TRIGGERED: {ticker}")
        print(f"   Side: {side.upper()} | Contracts: {contracts}")
        print(f"   Entry: {entry:.0f}¢ → Current: {current:.0f}¢ ({loss_pct:.1f}% loss)")
        
        # Execute sell order (with latency tracking)
        order_start = time.time()
        result = sell_position(ticker, side, contracts)
        order_end = time.time()
        latency_ms = int((order_end - order_start) * 1000)
        
        if "error" in result:
            print(f"   ❌ Failed to exit: {result['error']}")
            continue
        
        order = result.get("order", {})
        if order.get("status") in ["executed", "pending"]:
            print(f"   ✅ Stop-loss order placed (status: {order.get('status')}) ⏱️ {latency_ms}ms")
            exited += 1
            
            # Log the stop-loss (with latency)
            log_stop_loss({
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "type": "stop_loss",
                "ticker": ticker,
                "side": side,
                "contracts": contracts,
                "entry_price": entry,
                "exit_price": current,
                "loss_pct": loss_pct,
                "order_status": order.get("status"),
                "latency_ms": latency_ms
            })
            
            # Write Telegram alert file for heartbeat to pick up
            write_stop_loss_alert(ticker, side, contracts, entry, current, loss_pct)
    
    return exited


def log_stop_loss(data: dict):
    """Log stop-loss event to file"""
    log_path = Path(STOP_LOSS_LOG_FILE)
    with open(log_path, "a") as f:
        f.write(json.dumps(data) + "\n")
    
    # Also log to main trade file
    log_trade(data)


def write_stop_loss_alert(ticker: str, side: str, contracts: int, 
                          entry_price: float, exit_price: float, loss_pct: float):
    """
    Write stop-loss alert file for heartbeat to pick up and send to Telegram.
    Includes ticker, position info, and loss amount.
    """
    # Calculate loss in cents
    loss_cents = (entry_price - exit_price) * contracts
    
    # Determine asset from ticker
    asset = "ETH" if "KXETHD" in ticker else "BTC"
    
    alert_content = {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "type": "stop_loss",
        "ticker": ticker,
        "asset": asset,
        "side": side.upper(),
        "contracts": contracts,
        "entry_price_cents": entry_price,
        "exit_price_cents": exit_price,
        "loss_pct": round(loss_pct, 1),
        "loss_cents": round(loss_cents, 2),
        "message": f"🚨 STOP-LOSS TRIGGERED\n\n"
                   f"Ticker: {ticker}\n"
                   f"Side: {side.upper()} | Contracts: {contracts}\n"
                   f"Entry: {entry_price:.0f}¢ → Exit: {exit_price:.0f}¢\n"
                   f"Loss: {loss_pct:.1f}% (${loss_cents/100:.2f})"
    }
    
    with open(STOP_LOSS_ALERT_FILE, "w") as f:
        json.dump(alert_content, f, indent=2)
    
    print(f"📢 Alert file written: {STOP_LOSS_ALERT_FILE}")


# ============== EXTERNAL DATA ==============

def get_prices_coingecko() -> dict:
    """Get BTC/ETH prices from CoinGecko with latency tracking"""
    start = time.time()
    try:
        resp = requests.get(
            "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd",
            timeout=5
        )
        latency = (time.time() - start) * 1000
        record_api_latency("ext_coingecko", latency)
        record_api_call("coingecko", dict(resp.headers))  # Track rate limit
        if resp.status_code == 200:
            data = resp.json()
            return {
                "btc": data["bitcoin"]["usd"],
                "eth": data["ethereum"]["usd"],
                "source": "coingecko"
            }
    except Exception as e:
        latency = (time.time() - start) * 1000
        record_api_latency("ext_coingecko_error", latency)
        print(f"[PRICE] CoinGecko error: {e}")
    return None


def get_prices_binance() -> dict:
    """Get BTC/ETH prices from Binance with latency tracking"""
    start = time.time()
    try:
        resp = requests.get(
            "https://api.binance.com/api/v3/ticker/price?symbols=[\"BTCUSDT\",\"ETHUSDT\"]",
            timeout=5
        )
        latency = (time.time() - start) * 1000
        record_api_latency("ext_binance", latency)
        record_api_call("binance", dict(resp.headers))  # Track rate limit
        if resp.status_code == 200:
            data = resp.json()
            prices = {"source": "binance"}
            for item in data:
                if item["symbol"] == "BTCUSDT":
                    prices["btc"] = float(item["price"])
                elif item["symbol"] == "ETHUSDT":
                    prices["eth"] = float(item["price"])
            if "btc" in prices and "eth" in prices:
                return prices
    except Exception as e:
        latency = (time.time() - start) * 1000
        record_api_latency("ext_binance_error", latency)
        print(f"[PRICE] Binance error: {e}")
    return None


def get_prices_coinbase() -> dict:
    """Get BTC/ETH prices from Coinbase with latency tracking"""
    start = time.time()
    try:
        btc_resp = requests.get(
            "https://api.coinbase.com/v2/prices/BTC-USD/spot",
            timeout=5
        )
        eth_resp = requests.get(
            "https://api.coinbase.com/v2/prices/ETH-USD/spot",
            timeout=5
        )
        latency = (time.time() - start) * 1000
        record_api_latency("ext_coinbase", latency)
        record_api_call("coinbase", dict(btc_resp.headers))  # Track rate limit
        if btc_resp.status_code == 200 and eth_resp.status_code == 200:
            return {
                "btc": float(btc_resp.json()["data"]["amount"]),
                "eth": float(eth_resp.json()["data"]["amount"]),
                "source": "coinbase"
            }
    except Exception as e:
        latency = (time.time() - start) * 1000
        record_api_latency("ext_coinbase_error", latency)
        print(f"[PRICE] Coinbase error: {e}")
    return None


def get_crypto_prices(max_retries: int = 3) -> dict:
    """
    Get current BTC/ETH prices from multiple exchanges.
    Aggregates prices from Binance, CoinGecko, and Coinbase for accuracy.
    Uses median price when multiple sources available.
    """
    all_prices = []
    sources_used = []
    
    # Fetch from all sources in parallel order of reliability
    price_funcs = [
        ("binance", get_prices_binance),
        ("coingecko", get_prices_coingecko),
        ("coinbase", get_prices_coinbase),
    ]
    
    for source_name, fetch_func in price_funcs:
        for attempt in range(max_retries):
            result = fetch_func()
            if result:
                all_prices.append(result)
                sources_used.append(source_name)
                break
            if attempt < max_retries - 1:
                wait_time = (2 ** attempt) * 0.5 + (time.time() % 0.5)
                time.sleep(wait_time)
    
    if not all_prices:
        print("[PRICE] ERROR: All exchanges failed!")
        return None
    
    # Aggregate prices using median for robustness
    btc_prices = [p["btc"] for p in all_prices if "btc" in p]
    eth_prices = [p["eth"] for p in all_prices if "eth" in p]
    
    def median(values):
        sorted_vals = sorted(values)
        n = len(sorted_vals)
        if n == 0:
            return None
        if n % 2 == 1:
            return sorted_vals[n // 2]
        return (sorted_vals[n // 2 - 1] + sorted_vals[n // 2]) / 2
    
    btc_median = median(btc_prices) if btc_prices else None
    eth_median = median(eth_prices) if eth_prices else None
    
    if btc_median is None or eth_median is None:
        print(f"[PRICE] WARNING: Missing prices - BTC: {btc_prices}, ETH: {eth_prices}")
        return None
    
    # Log price spread for monitoring
    if len(btc_prices) > 1:
        btc_spread = (max(btc_prices) - min(btc_prices)) / btc_median * 100
        if btc_spread > 0.5:  # >0.5% spread is unusual
            print(f"[PRICE] WARNING: BTC spread {btc_spread:.2f}% across exchanges")
    
    print(f"[PRICE] BTC: ${btc_median:,.0f} | ETH: ${eth_median:,.0f} ({len(sources_used)} sources: {', '.join(sources_used)})")
    
    return {
        "btc": btc_median,
        "eth": eth_median,
        "sources": sources_used,
        "source_count": len(sources_used)
    }


def get_fear_greed(max_retries: int = 2) -> int:
    """Get Fear & Greed Index (0-100) with retry logic and latency tracking"""
    start = time.time()
    for attempt in range(max_retries):
        try:
            resp = requests.get("https://api.alternative.me/fng/?limit=1", timeout=5)
            latency = (time.time() - start) * 1000
            record_api_latency("ext_fear_greed", latency)
            record_api_call("feargreed", dict(resp.headers))  # Track rate limit
            if resp.status_code >= 500:
                raise requests.exceptions.RequestException(f"Server error {resp.status_code}")
            return int(resp.json()["data"][0]["value"])
        except Exception as e:
            if attempt < max_retries - 1:
                wait_time = (2 ** attempt) + (time.time() % 1)
                print(f"[RETRY] F&G error: {e}, waiting {wait_time:.1f}s")
                time.sleep(wait_time)
                continue
    latency = (time.time() - start) * 1000
    record_api_latency("ext_fear_greed_error", latency)
    return 50  # Default neutral


# ============== FEEDBACK LOOP ==============

def update_trade_results():
    """
    Check settled markets and update trade log with actual results.
    THIS IS THE MISSING PIECE!
    """
    log_path = Path(TRADE_LOG_FILE)
    if not log_path.exists():
        return {"updated": 0, "wins": 0, "losses": 0}
    
    # Read all trades
    trades = []
    with open(log_path) as f:
        for line in f:
            trades.append(json.loads(line.strip()))
    
    # Find pending trades
    pending_trades = [t for t in trades if t.get("type") == "trade" and t.get("result_status") == "pending"]
    
    updated = 0
    wins = 0
    losses = 0
    
    for trade in pending_trades:
        ticker = trade.get("ticker")
        if not ticker:
            continue
            
        # Check market status
        market = get_market(ticker)
        status = market.get("status")
        result = market.get("result")
        
        if status == "finalized" and result:
            # Market has settled!
            our_side = trade.get("side", "no")
            
            # Did we win?
            we_won = (our_side == result)
            
            # Update trade record
            trade["result_status"] = "win" if we_won else "loss"
            trade["market_result"] = result
            trade["settled_at"] = datetime.now(timezone.utc).isoformat()
            
            if we_won:
                # Win: we get $1 per contract
                trade["profit_cents"] = (100 * trade.get("contracts", 0)) - trade.get("cost_cents", 0)
                wins += 1
            else:
                # Loss: we lose our cost
                trade["profit_cents"] = -trade.get("cost_cents", 0)
                losses += 1
            
            updated += 1
    
    # Write back updated trades
    if updated > 0:
        with open(log_path, "w") as f:
            for trade in trades:
                f.write(json.dumps(trade) + "\n")
    
    return {"updated": updated, "wins": wins, "losses": losses}


def get_trade_stats() -> dict:
    """Calculate win/loss stats from trade log"""
    stats = {"total": 0, "wins": 0, "losses": 0, "pending": 0, "profit_cents": 0}
    log_path = Path(TRADE_LOG_FILE)
    if not log_path.exists():
        return stats
    
    with open(log_path) as f:
        for line in f:
            entry = json.loads(line.strip())
            if entry.get("type") == "trade":
                stats["total"] += 1
                status = entry.get("result_status", "pending")
                if status == "win":
                    stats["wins"] += 1
                    stats["profit_cents"] += entry.get("profit_cents", 0)
                elif status == "loss":
                    stats["losses"] += 1
                    stats["profit_cents"] += entry.get("profit_cents", 0)  # Already negative
                else:
                    stats["pending"] += 1
    
    return stats


def log_trade(trade_data: dict):
    """Log a trade"""
    log_path = Path(TRADE_LOG_FILE)
    log_path.parent.mkdir(exist_ok=True)
    with open(log_path, "a") as f:
        f.write(json.dumps(trade_data) + "\n")


def log_dry_run_trade(trade_data: dict):
    """Log a simulated trade (dry run mode)"""
    trade_data["dry_run"] = True
    log_path = Path(DRY_RUN_LOG_FILE)
    log_path.parent.mkdir(exist_ok=True)
    with open(log_path, "a") as f:
        f.write(json.dumps(trade_data) + "\n")


# ============== OPPORTUNITY FINDING ==============

def parse_time_to_expiry(market: dict) -> float:
    """Get minutes to expiry from market data"""
    try:
        close_time_str = market.get("close_time")
        if not close_time_str:
            return 999
        close_time = datetime.fromisoformat(close_time_str.replace("Z", "+00:00"))
        now = datetime.now(timezone.utc)
        return (close_time - now).total_seconds() / 60
    except:
        return 999


def find_opportunities(markets: list, prices: dict, momentum_data: dict = None, 
                       ohlc_data: dict = None, verbose: bool = True) -> list:
    """Find trading opportunities with PROPER probability model + momentum adjustment + regime detection + volatility rebalancing
    
    Args:
        markets: List of market dicts from Kalshi API
        prices: Dict with "btc" and "eth" prices
        momentum_data: Dict with "btc" and "eth" momentum dicts
        ohlc_data: Dict with "btc" and "eth" OHLC data for regime detection
    """
    opportunities = []
    skip_reasons = {
        "not_crypto": 0,
        "no_strike": 0,
        "too_close_expiry": 0,
        "momentum_conflict": 0,
        "insufficient_edge": []
    }
    
    # Calculate market regime for each asset to get dynamic MIN_EDGE
    regime_cache = {}
    if ohlc_data and momentum_data:
        for asset in ["btc", "eth"]:
            regime_cache[asset] = detect_market_regime(
                ohlc_data.get(asset, []), 
                momentum_data.get(asset, {})
            )
            if verbose and regime_cache[asset]:
                r = regime_cache[asset]
                print(f"   {asset.upper()} regime: {r['regime']} (conf={r['confidence']:.0%}, vol={r['volatility']}, edge={r['dynamic_min_edge']*100:.1f}%)")
    
    # Calculate volatility advantage for asset rebalancing (T237)
    vol_advantage = {}
    if ohlc_data:
        vol_advantage = get_volatility_advantage(ohlc_data)
        if verbose:
            btc_v = vol_advantage.get("btc", {})
            eth_v = vol_advantage.get("eth", {})
            pref = vol_advantage.get("preferred_asset")
            if btc_v.get("realized") and eth_v.get("realized"):
                pref_str = f" → Prefer {pref.upper()}" if pref else " → No preference"
                print(f"   📊 Vol Rebalance: BTC ratio={btc_v['ratio']:.2f} ({btc_v['advantage']}) | ETH ratio={eth_v['ratio']:.2f} ({eth_v['advantage']}){pref_str}")
    
    for m in markets:
        ticker = m.get("ticker", "")
        subtitle = m.get("subtitle", "")
        yes_bid = m.get("yes_bid", 0)
        yes_ask = m.get("yes_ask", 0)
        no_bid = m.get("no_bid", 0)
        no_ask = m.get("no_ask", 0)
        
        # Detect asset type from ticker
        if ticker.startswith("KXBTCD"):
            asset = "btc"
            current_price = prices.get("btc", 0)
            hourly_vol = BTC_HOURLY_VOL
        elif ticker.startswith("KXETHD"):
            asset = "eth"
            current_price = prices.get("eth", 0)
            hourly_vol = ETH_HOURLY_VOL
        else:
            skip_reasons["not_crypto"] += 1
            continue
        
        if not current_price:
            continue
        
        # Get momentum for this asset
        momentum = momentum_data.get(asset) if momentum_data else None
        
        # Extract momentum info for filtering
        mom_dir = momentum.get("composite_direction", 0) if momentum else 0
        mom_str = momentum.get("composite_strength", 0) if momentum else 0
        mom_alignment = momentum.get("alignment", False) if momentum else False
        
        # Parse strike from subtitle
        if "$" not in subtitle:
            skip_reasons["no_strike"] += 1
            continue
        
        try:
            strike_str = subtitle.split("$")[1].split(" ")[0].replace(",", "")
            strike = float(strike_str)
        except:
            skip_reasons["no_strike"] += 1
            continue
        
        # Get time to expiry
        minutes_left = parse_time_to_expiry(m)
        if minutes_left < MIN_TIME_TO_EXPIRY_MINUTES:
            skip_reasons["too_close_expiry"] += 1
            continue
        
        # Calculate BASE probability (from Black-Scholes model)
        base_prob_above = calculate_prob_above_strike(
            current_price, strike, minutes_left, hourly_vol
        )
        base_prob_below = 1 - base_prob_above
        
        # APPLY MOMENTUM ADJUSTMENT to probabilities
        if momentum:
            prob_above = adjust_probability_with_momentum(
                base_prob_above, strike, current_price, momentum, "yes"
            )
            prob_below = adjust_probability_with_momentum(
                base_prob_below, strike, current_price, momentum, "no"
            )
        else:
            prob_above = base_prob_above
            prob_below = base_prob_below
        
        # Market implied probabilities
        market_prob_yes = yes_ask / 100 if yes_ask else 0.5
        market_prob_no = (100 - yes_bid) / 100 if yes_bid else 0.5
        
        # Calculate edges for both sides (now momentum-adjusted)
        yes_edge = prob_above - market_prob_yes
        no_edge = prob_below - market_prob_no
        
        found_opp = False
        
        # MOMENTUM CONFLICT CHECK: Skip YES if strong bearish momentum
        # Skip NO if strong bullish momentum (unless we have alignment which gives confidence)
        skip_due_to_momentum = False
        
        # Get dynamic MIN_EDGE from regime detection (falls back to static MIN_EDGE)
        regime = regime_cache.get(asset, {})
        dynamic_edge = regime.get("dynamic_min_edge", MIN_EDGE)
        
        # Check for YES opportunity (we think it'll be above strike)
        # Skip extreme prices (no profit potential or bad risk/reward)
        yes_extreme = yes_ask and (yes_ask <= 5 or yes_ask >= 95)
        no_price = 100 - yes_bid if yes_bid else None
        no_extreme = not no_price or no_price <= 5 or no_price >= 95
        
        if yes_extreme:
            skip_reasons["extreme_price"] = skip_reasons.get("extreme_price", 0) + 1
        elif prob_above > market_prob_yes + dynamic_edge:
            # Skip YES if momentum is strongly bearish (dir < -0.3 with strength > 0.3)
            if mom_dir < -0.3 and mom_str > 0.3:
                skip_due_to_momentum = True
                skip_reasons["momentum_conflict"] += 1
            else:
                edge = prob_above - market_prob_yes
                # Bonus edge if momentum aligns (bullish momentum for YES)
                momentum_bonus = 0.02 if (mom_dir > 0.2 and mom_alignment) else 0
                # Volatility rebalance bonus (T237): favor YES when realized vol > assumed
                vol_info = vol_advantage.get(asset, {}) if vol_advantage else {}
                vol_bonus = max(0, vol_advantage.get("vol_bonus", {}).get(asset, 0)) if vol_info.get("advantage") == "yes" else 0
                vol_aligned = vol_info.get("advantage") == "yes"
                opportunities.append({
                    "ticker": ticker,
                    "asset": asset,
                    "side": "yes",
                    "price": yes_ask,
                    "edge": edge,
                    "edge_with_bonus": edge + momentum_bonus + vol_bonus,
                    "our_prob": prob_above,
                    "base_prob": base_prob_above,
                    "market_prob": market_prob_yes,
                    "strike": strike,
                    "current": current_price,
                    "minutes_left": minutes_left,
                    "momentum_dir": mom_dir,
                    "momentum_str": mom_str,
                    "momentum_aligned": mom_alignment and mom_dir > 0.2,
                    "full_alignment": mom_alignment,  # T395: all timeframes agree
                    "regime": regime.get("regime", "unknown"),
                    "regime_confidence": regime.get("confidence", 0),
                    "volatility": regime.get("volatility", "normal"),  # T293
                    "dynamic_min_edge": dynamic_edge,
                    "vol_ratio": vol_info.get("ratio", 1.0),
                    "vol_aligned": vol_aligned,
                    "vol_bonus": vol_bonus
                })
                found_opp = True
        
        # Check for NO opportunity (we think it'll be below strike)
        # Skip extreme NO prices (no profit potential or bad risk/reward)
        # Also skip if no_price is None (no bid available)
        if no_extreme:
            if no_price:  # Only count as extreme if we have a price
                skip_reasons["extreme_price"] = skip_reasons.get("extreme_price", 0) + 1
        elif prob_below > market_prob_no + dynamic_edge:
            # Skip NO if momentum is strongly bullish (dir > 0.3 with strength > 0.3)
            if mom_dir > 0.3 and mom_str > 0.3:
                if not skip_due_to_momentum:  # Don't double count
                    skip_reasons["momentum_conflict"] += 1
            else:
                edge = prob_below - market_prob_no
                # Bonus edge if momentum aligns (bearish momentum for NO)
                momentum_bonus = 0.02 if (mom_dir < -0.2 and mom_alignment) else 0
                # Volatility rebalance bonus (T237): favor NO when realized vol < assumed
                vol_info = vol_advantage.get(asset, {}) if vol_advantage else {}
                # For NO bets, we want NEGATIVE vol_bonus (realized < assumed = less movement = good for NO)
                vol_bonus = abs(min(0, vol_advantage.get("vol_bonus", {}).get(asset, 0))) if vol_info.get("advantage") == "no" else 0
                vol_aligned = vol_info.get("advantage") == "no"
                opportunities.append({
                    "ticker": ticker,
                    "asset": asset,
                    "side": "no",
                    "price": no_price,
                    "edge": edge,
                    "edge_with_bonus": edge + momentum_bonus + vol_bonus,
                    "our_prob": prob_below,
                    "base_prob": base_prob_below,
                    "market_prob": market_prob_no,
                    "strike": strike,
                    "current": current_price,
                    "minutes_left": minutes_left,
                    "momentum_dir": mom_dir,
                    "momentum_str": mom_str,
                    "momentum_aligned": mom_alignment and mom_dir < -0.2,
                    "full_alignment": mom_alignment,  # T395: all timeframes agree
                    "regime": regime.get("regime", "unknown"),
                    "regime_confidence": regime.get("confidence", 0),
                    "volatility": regime.get("volatility", "normal"),  # T293
                    "dynamic_min_edge": dynamic_edge,
                    "vol_ratio": vol_info.get("ratio", 1.0),
                    "vol_aligned": vol_aligned,
                    "vol_bonus": vol_bonus
                })
                found_opp = True
        
        # Log skip reason if no opportunity found (but not due to extreme price)
        if not found_opp and not (yes_extreme and no_extreme):
            best_edge = max(yes_edge, no_edge)
            best_side = "YES" if yes_edge > no_edge else "NO"
            # Only log if best side wasn't skipped due to extreme price
            skip_due_to_price = (best_side == "YES" and yes_extreme) or (best_side == "NO" and no_extreme)
            if not skip_due_to_price:
                skip_reasons["insufficient_edge"].append({
                    "ticker": ticker,
                    "strike": strike,
                    "best_side": best_side,
                    "best_edge": best_edge,
                    "required_edge": dynamic_edge,  # Use dynamic edge from regime
                    "regime": regime.get("regime", "unknown"),
                    "minutes_left": int(minutes_left)
                })
    
    # Log skip summary if verbose
    if verbose and (skip_reasons["insufficient_edge"] or skip_reasons["too_close_expiry"] or skip_reasons["momentum_conflict"] or skip_reasons.get("extreme_price")):
        print(f"\n📋 Skip Summary:")
        if skip_reasons["not_crypto"]:
            print(f"   - Not crypto markets: {skip_reasons['not_crypto']}")
        if skip_reasons["no_strike"]:
            print(f"   - No strike parsed: {skip_reasons['no_strike']}")
        if skip_reasons["too_close_expiry"]:
            print(f"   - Too close to expiry (<{MIN_TIME_TO_EXPIRY_MINUTES}min): {skip_reasons['too_close_expiry']}")
        if skip_reasons.get("extreme_price"):
            print(f"   - Extreme price (≤5¢ or ≥95¢): {skip_reasons['extreme_price']}")
        if skip_reasons["momentum_conflict"]:
            print(f"   - Momentum conflict (betting against trend): {skip_reasons['momentum_conflict']}")
        
        if skip_reasons["insufficient_edge"]:
            print(f"   - Insufficient edge (need >{MIN_EDGE*100:.0f}%): {len(skip_reasons['insufficient_edge'])}")
            # Show top 5 closest to having edge
            sorted_by_edge = sorted(skip_reasons["insufficient_edge"], key=lambda x: x["best_edge"], reverse=True)
            for skip in sorted_by_edge[:5]:
                edge_pct = skip["best_edge"] * 100
                gap = (MIN_EDGE - skip["best_edge"]) * 100
                print(f"      {skip['ticker']} | Strike ${skip['strike']:,.0f} | {skip['best_side']} edge {edge_pct:+.1f}% (need {gap:.1f}% more) | {skip['minutes_left']}min left")
    
    # Sort by edge (with momentum bonus for aligned trades)
    opportunities.sort(key=lambda x: x.get("edge_with_bonus", x["edge"]), reverse=True)
    return opportunities


# ============== MAIN LOOP ==============

def run_cycle():
    """Run one trading cycle"""
    now = datetime.now(timezone.utc)
    print(f"\n{'='*60}")
    print(f"🤖 KALSHI AUTOTRADER v2 - {now.strftime('%Y-%m-%d %H:%M:%S')} UTC")
    print(f"{'='*60}")
    
    # Update trade results first (FEEDBACK LOOP!)
    update_result = update_trade_results()
    if update_result["updated"] > 0:
        print(f"📊 Updated {update_result['updated']} trades: {update_result['wins']}W / {update_result['losses']}L")
        # Check for streak records when trades settle (T288)
        streak_status = check_streak_records()
        print(f"🎖️ {streak_status}")
    
    # Get stats
    stats = get_trade_stats()
    win_rate = stats["wins"] / (stats["wins"] + stats["losses"]) * 100 if (stats["wins"] + stats["losses"]) > 0 else 0
    print(f"📈 History: {stats['total']} trades | {stats['wins']}W/{stats['losses']}L | {win_rate:.0f}% WR")
    print(f"💵 P/L: ${stats['profit_cents']/100:+.2f} | Pending: {stats['pending']}")
    
    # Check circuit breaker (consecutive loss protection)
    cb_paused, cb_losses, cb_message = check_circuit_breaker()
    print(f"🔒 Circuit Breaker: {cb_message}")
    if cb_paused:
        print("⏸️ Trading paused by circuit breaker. Waiting for a win to settle...")
        return
    
    # Get balance
    bal = get_balance()
    if "error" in bal:
        print(f"❌ Balance error: {bal['error']}")
        return
    
    cash = bal.get("balance", 0) / 100
    portfolio = bal.get("portfolio_value", 0) / 100
    print(f"💰 Cash: ${cash:.2f} | Portfolio: ${portfolio:.2f}")
    
    # Get prices
    prices = get_crypto_prices()
    if not prices:
        print("❌ Failed to get crypto prices")
        return
    
    print(f"📈 BTC: ${prices['btc']:,.0f} | ETH: ${prices['eth']:,.0f}")
    
    # Get OHLC data for momentum calculation (7 days gives us hourly candles, enough for 24h momentum)
    btc_ohlc = get_btc_ohlc(days=7)
    eth_ohlc = get_eth_ohlc(days=7)
    
    btc_momentum = get_multi_timeframe_momentum(btc_ohlc)
    eth_momentum = get_multi_timeframe_momentum(eth_ohlc)
    
    momentum_data = {"btc": btc_momentum, "eth": eth_momentum}
    
    # Check for full momentum alignment (T301) - high-conviction signal
    check_momentum_alignment_alert(momentum_data)
    
    # Display momentum info for both
    for asset, momentum in [("BTC", btc_momentum), ("ETH", eth_momentum)]:
        if momentum["timeframes"]:
            print(f"📊 {asset} Momentum (1h/4h/24h):")
            for tf in ["1h", "4h", "24h"]:
                tf_data = momentum["timeframes"].get(tf, {})
                dir_symbol = "🟢" if tf_data.get("direction", 0) > 0 else ("🔴" if tf_data.get("direction", 0) < 0 else "⚪")
                pct = tf_data.get("pct_change", 0) * 100
                print(f"   {tf}: {dir_symbol} {pct:+.2f}% (str: {tf_data.get('strength', 0):.2f})")
            
            composite_dir = "BULLISH" if momentum["composite_direction"] > 0.1 else ("BEARISH" if momentum["composite_direction"] < -0.1 else "NEUTRAL")
            aligned_str = "✓ ALIGNED" if momentum["alignment"] else ""
            print(f"   → Composite: {composite_dir} (dir: {momentum['composite_direction']:.2f}, str: {momentum['composite_strength']:.2f}) {aligned_str}")
    
    # Get positions
    positions = get_positions()
    print(f"📋 Open positions: {len(positions)}")
    
    # CHECK STOP-LOSSES for open positions
    if positions:
        stop_loss_candidates = check_stop_losses(positions, prices)
        if stop_loss_candidates:
            print(f"\n🚨 Stop-loss check: {len(stop_loss_candidates)} position(s) below threshold")
            exited = execute_stop_losses(stop_loss_candidates)
            if exited > 0:
                print(f"✅ Exited {exited} position(s) via stop-loss")
                # Refresh positions after exits
                positions = get_positions()
    
    if len(positions) >= MAX_POSITIONS:
        print("⚠️ Max positions reached, skipping")
        return
    
    # Find opportunities from BOTH BTC and ETH markets
    btc_markets = search_markets("KXBTCD", limit=50)
    eth_markets = search_markets("KXETHD", limit=50)
    all_markets = btc_markets + eth_markets
    print(f"🔍 Scanning {len(btc_markets)} BTC + {len(eth_markets)} ETH = {len(all_markets)} total markets...")
    
    # Pass OHLC data for regime detection
    ohlc_data = {"btc": btc_ohlc, "eth": eth_ohlc}
    
    # CHECK FOR REGIME CHANGES (alert on shift)
    btc_regime = detect_market_regime(btc_ohlc, btc_momentum)
    eth_regime = detect_market_regime(eth_ohlc, eth_momentum)
    current_regimes = {"btc": btc_regime, "eth": eth_regime}
    
    print(f"📊 Market Regimes: BTC={btc_regime['regime']} ({btc_regime['confidence']:.0%}) | ETH={eth_regime['regime']} ({eth_regime['confidence']:.0%})")
    
    regime_changes = check_regime_change(current_regimes)
    if regime_changes:
        print(f"🔄 REGIME CHANGE: {', '.join([f'{a}: {old}→{new}' for a, old, new in regime_changes])}")
        write_regime_alert(regime_changes, current_regimes)
    
    # CHECK FOR MOMENTUM DIRECTION CHANGES (bullish↔bearish flips)
    momentum_changes = check_momentum_change(momentum_data)
    if momentum_changes:
        print(f"📊 MOMENTUM FLIP: {', '.join([f'{a}: {old}→{new}' for a, old, new, _ in momentum_changes])}")
        write_momentum_alert(momentum_changes)
        # Check for whipsaw pattern (T393) - 2+ flips in 24h
        check_whipsaw(momentum_changes)
    
    opportunities = find_opportunities(all_markets, prices, momentum_data=momentum_data, ohlc_data=ohlc_data)
    
    if not opportunities:
        print("😴 No opportunities found")
        return
    
    # Take best opportunity
    best = opportunities[0]
    mom_aligned = best.get('momentum_aligned', False)
    mom_badge = "🎯 MOMENTUM ALIGNED!" if mom_aligned else ""
    asset_label = best.get('asset', 'btc').upper()
    print(f"\n🎯 Best opportunity: {best['ticker']} {mom_badge}")
    print(f"   Side: {best['side'].upper()} @ {best['price']}¢")
    print(f"   Strike: ${best['strike']:,.0f} | {asset_label}: ${best['current']:,.0f}")
    print(f"   Base prob: {best.get('base_prob', best['our_prob'])*100:.1f}% → Adjusted: {best['our_prob']*100:.1f}% vs Market: {best['market_prob']*100:.1f}%")
    print(f"   Edge: {best['edge']*100:.1f}% (w/bonus: {best.get('edge_with_bonus', best['edge'])*100:.1f}%) | Time left: {best['minutes_left']:.0f}min")
    print(f"   Momentum: dir={best.get('momentum_dir', 0):.2f} str={best.get('momentum_str', 0):.2f}")
    regime_str = best.get('regime', 'unknown')
    regime_conf = best.get('regime_confidence', 0)
    dynamic_edge = best.get('dynamic_min_edge', MIN_EDGE)
    print(f"   Regime: {regime_str} (conf={regime_conf:.0%}) | Min edge: {dynamic_edge*100:.1f}%")
    # Volatility rebalance info (T237)
    vol_ratio = best.get('vol_ratio', 1.0)
    vol_aligned = best.get('vol_aligned', False)
    vol_bonus = best.get('vol_bonus', 0)
    vol_badge = "📊 VOL ALIGNED!" if vol_aligned else ""
    print(f"   Vol ratio: {vol_ratio:.2f} | Vol bonus: +{vol_bonus*100:.1f}% {vol_badge}")
    
    # Calculate bet size (Kelly with volatility adjustment - T293)
    if cash < MIN_BET_CENTS / 100:
        print("❌ Insufficient cash")
        return
    
    # Base Kelly calculation
    kelly_fraction = KELLY_FRACTION
    
    # Volatility-adjusted position sizing (T293)
    # Reduce size in choppy/high-vol regimes, increase when volatility aligns
    regime = best.get("regime", "unknown")
    volatility = best.get("volatility", "normal")
    vol_aligned = best.get("vol_aligned", False)
    
    # Regime adjustment: reduce in choppy markets, slight boost in trending
    regime_multiplier = 1.0
    if regime == "choppy":
        regime_multiplier = 0.5  # Half size in choppy (hardest to trade)
    elif regime == "sideways":
        regime_multiplier = 0.75  # Reduced size in sideways
    elif regime in ("trending_bullish", "trending_bearish"):
        regime_multiplier = 1.1  # Slight boost in trending (cleaner signals)
    
    # Volatility alignment bonus: increase size when vol favors our direction
    vol_multiplier = 1.0
    if vol_aligned:
        vol_multiplier = 1.15  # 15% boost when volatility aligns
    elif volatility == "high":
        vol_multiplier = 0.8  # Reduce in high vol if not aligned
    
    # Apply adjustments to Kelly fraction
    adjusted_kelly = kelly_fraction * regime_multiplier * vol_multiplier
    
    # Log the adjustment
    total_multiplier = regime_multiplier * vol_multiplier
    if abs(total_multiplier - 1.0) > 0.01:
        adj_direction = "↑" if total_multiplier > 1.0 else "↓"
        print(f"   Position size: {adj_direction} {total_multiplier:.0%} (regime={regime_multiplier:.0%}, vol={vol_multiplier:.0%})")
    
    kelly_bet = cash * adjusted_kelly * best["edge"]
    bet_size = max(MIN_BET_CENTS / 100, min(kelly_bet, cash * MAX_POSITION_PCT))
    contracts = int(bet_size * 100 / best["price"])
    
    if contracts < 1:
        print("❌ Bet too small")
        return
    
    # Build trade data for logging
    trade_data = {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "type": "trade",
        "ticker": best["ticker"],
        "asset": best.get("asset", "btc"),
        "side": best["side"],
        "contracts": contracts,
        "price_cents": best["price"],
        "cost_cents": contracts * best["price"],
        "edge": best["edge"],
        "edge_with_bonus": best.get("edge_with_bonus", best["edge"]),
        "our_prob": best["our_prob"],
        "base_prob": best.get("base_prob", best["our_prob"]),
        "market_prob": best["market_prob"],
        "strike": best["strike"],
        "current_price": best["current"],
        "minutes_to_expiry": best["minutes_left"],
        "momentum_dir": best.get("momentum_dir", 0),
        "momentum_str": best.get("momentum_str", 0),
        "momentum_aligned": best.get("momentum_aligned", False),
        "full_alignment": best.get("full_alignment", False),  # T395: all timeframes agree
        "regime": best.get("regime", "unknown"),
        "regime_confidence": best.get("regime_confidence", 0),
        "dynamic_min_edge": best.get("dynamic_min_edge", MIN_EDGE),
        # Volatility rebalance data (T237)
        "vol_ratio": best.get("vol_ratio", 1.0),
        "vol_aligned": best.get("vol_aligned", False),
        "vol_bonus": best.get("vol_bonus", 0),
        # Position sizing multipliers (T390)
        "kelly_fraction_base": KELLY_FRACTION,
        "kelly_fraction_used": adjusted_kelly,
        "regime_multiplier": regime_multiplier,
        "vol_multiplier": vol_multiplier,
        "size_multiplier_total": total_multiplier,
        # Price source data (T386)
        "price_sources": prices.get("sources", []),
        "result_status": "pending"
    }
    
    if DRY_RUN:
        # Dry run mode - log without executing
        print(f"\n🧪 [DRY RUN] Would place order: {contracts} contracts @ {best['price']}¢")
        print(f"   🧪 Simulating execution (no real money at risk)")
        log_dry_run_trade(trade_data)
        print(f"✅ [DRY RUN] Trade logged to {DRY_RUN_LOG_FILE}")
        return
    
    print(f"\n💸 Placing order: {contracts} contracts @ {best['price']}¢")
    
    # Place order (with latency tracking)
    order_start = time.time()
    result = place_order(best["ticker"], best["side"], contracts, best["price"])
    order_end = time.time()
    latency_ms = int((order_end - order_start) * 1000)
    
    if "error" in result:
        print(f"❌ Order error: {result['error']}")
        return
    
    order = result.get("order", {})
    if order.get("status") == "executed":
        print(f"✅ Order executed!")
        
        # Log trade (with momentum + regime data + latency)
        print(f"   ⏱️  Order latency: {latency_ms}ms")
        trade_data["latency_ms"] = latency_ms
        log_trade(trade_data)
        
        # Check for latency alerts (after logging trade with new latency data)
        check_latency_alert()
        
        # Check for extreme volatility alerts (T294)
        check_extreme_vol_alert(trade_data)
    else:
        print(f"⏳ Order status: {order.get('status')}")


def main():
    """Main entry point"""
    print("🚀 Starting Kalshi AutoTrader v2")
    print("   With PROPER probability model and feedback loop!")
    print("   Now trading: BTC (KXBTCD) + ETH (KXETHD) markets!")
    print("   📊 API latency profiling enabled (T279)")
    if DRY_RUN:
        print("   🧪 DRY RUN MODE - No real trades will be executed!")
        print(f"   📝 Trades logged to: {DRY_RUN_LOG_FILE}")
    print("   Press Ctrl+C to stop\n")
    
    cycle_count = 0
    
    while True:
        try:
            run_cycle()
            cycle_count += 1
            
            # Print and save latency profile every 6 cycles (30 mins)
            if cycle_count % 6 == 0:
                print_latency_summary()
                save_latency_profile()
                
                # Check for bottlenecks
                bottlenecks = identify_bottlenecks()
                if bottlenecks:
                    print("\n⚠️ BOTTLENECKS DETECTED:")
                    for endpoint, issue, details in bottlenecks:
                        print(f"   • {endpoint}: {issue} - {details}")
                
                # Check rate limits (T308)
                print(get_rate_limit_summary())
                log_rate_limits()
                rate_warnings = check_rate_limits()
                if rate_warnings:
                    print("\n⚠️ RATE LIMIT WARNING:")
                    for source, pct, msg in rate_warnings:
                        print(f"   • {msg}")
                    write_rate_limit_alert(rate_warnings)
                
        except KeyboardInterrupt:
            print("\n\n👋 Stopping autotrader...")
            # Print final latency summary
            print("\n📊 FINAL LATENCY REPORT:")
            print_latency_summary()
            save_latency_profile()
            break
        except Exception as e:
            print(f"\n❌ Error: {e}")
        
        # Wait 5 minutes between cycles
        print("\n💤 Sleeping 5 minutes...")
        time.sleep(300)


if __name__ == "__main__":
    main()


# ============== SAFETY LIMITS (Added after 0% WR disaster) ==============
MAX_DAILY_LOSS_CENTS = 500  # $5 max daily loss
MAX_TRADES_PER_HOUR = 3     # Limit trade frequency
PAPER_TRADE_MODE = True     # Start in paper trade mode!

def check_daily_loss():
    """Check if we've hit daily loss limit"""
    log_path = Path(TRADE_LOG_FILE)
    if not log_path.exists():
        return 0
    
    today = datetime.now(timezone.utc).date()
    daily_loss = 0
    
    with open(log_path) as f:
        for line in f:
            entry = json.loads(line.strip())
            if entry.get("type") == "trade":
                ts = entry.get("timestamp", "")
                if ts.startswith(str(today)):
                    pnl = entry.get("profit_cents", 0)
                    if pnl < 0:
                        daily_loss += abs(pnl)
    
    return daily_loss


def check_hourly_trades():
    """Count trades in last hour"""
    log_path = Path(TRADE_LOG_FILE)
    if not log_path.exists():
        return 0
    
    hour_ago = datetime.now(timezone.utc) - timedelta(hours=1)
    count = 0
    
    with open(log_path) as f:
        for line in f:
            entry = json.loads(line.strip())
            if entry.get("type") == "trade":
                ts = entry.get("timestamp", "")
                try:
                    trade_time = datetime.fromisoformat(ts.replace("Z", "+00:00"))
                    if trade_time > hour_ago:
                        count += 1
                except:
                    pass
    
    return count


def get_consecutive_losses() -> int:
    """
    Count consecutive losses from most recent settled trades.
    Returns the current loss streak count (0 if last trade was a win).
    """
    log_path = Path(TRADE_LOG_FILE)
    if not log_path.exists():
        return 0
    
    # Read all trades and get settled ones
    settled_trades = []
    with open(log_path) as f:
        for line in f:
            try:
                entry = json.loads(line.strip())
                if entry.get("type") == "trade" and entry.get("result_status") in ("won", "lost"):
                    settled_trades.append(entry)
            except:
                pass
    
    if not settled_trades:
        return 0
    
    # Sort by timestamp descending (most recent first)
    settled_trades.sort(key=lambda x: x.get("timestamp", ""), reverse=True)
    
    # Count consecutive losses from most recent
    consecutive_losses = 0
    for trade in settled_trades:
        if trade.get("result_status") == "lost":
            consecutive_losses += 1
        else:
            break  # Hit a win, stop counting
    
    return consecutive_losses


def load_circuit_breaker_state() -> dict:
    """Load circuit breaker state from file."""
    try:
        with open(CIRCUIT_BREAKER_STATE_FILE, "r") as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return {"paused": False, "pause_time": None, "streak_at_pause": 0}


def save_circuit_breaker_state(state: dict):
    """Save circuit breaker state to file."""
    with open(CIRCUIT_BREAKER_STATE_FILE, "w") as f:
        json.dump(state, f, indent=2)


def check_circuit_breaker() -> tuple:
    """
    Check if circuit breaker should trigger or is active.
    
    Returns:
        (should_pause: bool, consecutive_losses: int, message: str)
    """
    state = load_circuit_breaker_state()
    consecutive_losses = get_consecutive_losses()
    
    # If already paused, check if we should resume (after a win)
    if state.get("paused"):
        if consecutive_losses == 0:
            # We got a win! Resume trading
            state["paused"] = False
            state["pause_time"] = None
            state["streak_at_pause"] = 0
            save_circuit_breaker_state(state)
            return (False, 0, "✅ Circuit breaker released - got a win!")
        else:
            pause_time = state.get("pause_time", "unknown")
            return (True, consecutive_losses, f"⏸️ Circuit breaker ACTIVE (paused at {pause_time}, {consecutive_losses} consecutive losses)")
    
    # Check if we should trigger circuit breaker
    if consecutive_losses >= CIRCUIT_BREAKER_THRESHOLD:
        state["paused"] = True
        state["pause_time"] = datetime.now(timezone.utc).isoformat()
        state["streak_at_pause"] = consecutive_losses
        save_circuit_breaker_state(state)
        
        # Write alert file for heartbeat pickup
        write_circuit_breaker_alert(consecutive_losses)
        
        return (True, consecutive_losses, f"🚨 CIRCUIT BREAKER TRIGGERED! {consecutive_losses} consecutive losses")
    
    return (False, consecutive_losses, f"✓ Streak: {consecutive_losses} losses (threshold: {CIRCUIT_BREAKER_THRESHOLD})")


def write_circuit_breaker_alert(consecutive_losses: int):
    """Write circuit breaker alert file for heartbeat notification."""
    alert_data = {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "type": "circuit_breaker",
        "consecutive_losses": consecutive_losses,
        "threshold": CIRCUIT_BREAKER_THRESHOLD,
        "message": f"🚨 CIRCUIT BREAKER TRIGGERED!\n\n"
                   f"AutoTrader paused after {consecutive_losses} consecutive losses.\n\n"
                   f"This is a safety measure to prevent tilt trading.\n"
                   f"Trading will resume automatically after a winning trade settles.\n\n"
                   f"Actions you can take:\n"
                   f"• Wait for pending trades to settle (a win will resume)\n"
                   f"• Manually reset: `rm scripts/kalshi-circuit-breaker.json`\n"
                   f"• Adjust threshold: `export CIRCUIT_BREAKER_THRESHOLD=10`"
    }
    
    with open(CIRCUIT_BREAKER_ALERT_FILE, "w") as f:
        json.dump(alert_data, f, indent=2)
    
    print(f"📝 Circuit breaker alert written to {CIRCUIT_BREAKER_ALERT_FILE}")


# ============== LATENCY ALERTING (T295) ==============

def get_recent_latencies(n: int = LATENCY_CHECK_WINDOW) -> list:
    """
    Get latencies from the last N trades.
    Returns list of latency_ms values.
    """
    log_path = Path(TRADE_LOG_FILE)
    if not log_path.exists():
        return []
    
    trades_with_latency = []
    with open(log_path) as f:
        for line in f:
            try:
                entry = json.loads(line.strip())
                if entry.get("type") == "trade" and "latency_ms" in entry:
                    trades_with_latency.append(entry)
            except:
                pass
    
    # Sort by timestamp descending (most recent first)
    trades_with_latency.sort(key=lambda x: x.get("timestamp", ""), reverse=True)
    
    # Return latencies from last N trades
    return [t["latency_ms"] for t in trades_with_latency[:n]]


def check_latency_alert():
    """
    Check if average latency exceeds threshold and write alert if needed.
    Has cooldown to prevent alert spam.
    """
    latencies = get_recent_latencies()
    if len(latencies) < 3:
        # Not enough data to determine trend
        return
    
    avg_latency = sum(latencies) / len(latencies)
    
    if avg_latency <= LATENCY_THRESHOLD_MS:
        return  # All good
    
    # Check cooldown
    alert_path = Path(LATENCY_ALERT_FILE)
    if alert_path.exists():
        try:
            stat = alert_path.stat()
            age_seconds = time.time() - stat.st_mtime
            if age_seconds < LATENCY_ALERT_COOLDOWN:
                return  # Cooldown active
        except:
            pass
    
    # Write alert
    write_latency_alert(avg_latency, latencies)


def write_latency_alert(avg_latency: float, latencies: list):
    """Write latency alert file for heartbeat pickup."""
    max_latency = max(latencies) if latencies else 0
    min_latency = min(latencies) if latencies else 0
    
    alert_data = {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "type": "latency",
        "avg_latency_ms": round(avg_latency),
        "max_latency_ms": max_latency,
        "min_latency_ms": min_latency,
        "threshold_ms": LATENCY_THRESHOLD_MS,
        "sample_size": len(latencies),
        "message": f"⚠️ HIGH ORDER LATENCY\n\n"
                   f"Average latency: {avg_latency:.0f}ms (threshold: {LATENCY_THRESHOLD_MS}ms)\n"
                   f"Last {len(latencies)} trades: min {min_latency}ms / max {max_latency}ms\n\n"
                   f"This could indicate:\n"
                   f"• Kalshi API slowdown\n"
                   f"• Network connectivity issues\n"
                   f"• Rate limiting\n\n"
                   f"Check autotrader logs for details."
    }
    
    with open(LATENCY_ALERT_FILE, "w") as f:
        json.dump(alert_data, f, indent=2)
    
    print(f"📝 Latency alert written: avg {avg_latency:.0f}ms > {LATENCY_THRESHOLD_MS}ms threshold")


# ============== EXTREME VOLATILITY ALERTING (T294) ==============

def check_extreme_vol_alert(trade_data: dict):
    """
    Check if trade was placed during extreme volatility and alert if so.
    Alerts when volatility is "very_high" (>2% hourly range).
    """
    volatility = trade_data.get("volatility", "normal")
    
    # Only alert on very_high volatility
    if volatility != "very_high":
        return
    
    # Check cooldown
    try:
        if os.path.exists(EXTREME_VOL_ALERT_FILE):
            mtime = os.path.getmtime(EXTREME_VOL_ALERT_FILE)
            if time.time() - mtime < EXTREME_VOL_ALERT_COOLDOWN:
                print(f"   ℹ️ Extreme vol alert on cooldown ({(EXTREME_VOL_ALERT_COOLDOWN - (time.time() - mtime)):.0f}s remaining)")
                return
    except Exception:
        pass
    
    # Write alert
    write_extreme_vol_alert(trade_data)


def write_extreme_vol_alert(trade_data: dict):
    """Write extreme volatility alert file for heartbeat pickup."""
    ticker = trade_data.get("ticker", "unknown")
    asset = trade_data.get("asset", "btc").upper()
    side = trade_data.get("side", "unknown")
    edge = trade_data.get("edge", 0)
    price = trade_data.get("price_cents", 0)
    contracts = trade_data.get("contracts", 0)
    regime = trade_data.get("regime", "unknown")
    vol_ratio = trade_data.get("vol_ratio", 1.0)
    
    alert_data = {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "type": "extreme_volatility",
        "ticker": ticker,
        "asset": asset,
        "side": side,
        "edge_pct": round(edge * 100, 1),
        "regime": regime,
        "vol_ratio": round(vol_ratio, 2),
        "trade_details": {
            "contracts": contracts,
            "price_cents": price,
            "cost_cents": contracts * price
        },
        "message": f"⚠️ EXTREME VOLATILITY TRADE\n\n"
                   f"📊 {asset} is experiencing very high volatility (>2% hourly range)\n\n"
                   f"Trade placed:\n"
                   f"• Ticker: {ticker}\n"
                   f"• Side: {side.upper()}\n"
                   f"• Contracts: {contracts} @ {price}¢\n"
                   f"• Edge: {edge*100:.1f}%\n"
                   f"• Regime: {regime}\n"
                   f"• Vol ratio: {vol_ratio:.2f}x\n\n"
                   f"⚠️ High volatility increases both opportunity and risk.\n"
                   f"Monitor this position closely!"
    }
    
    with open(EXTREME_VOL_ALERT_FILE, "w") as f:
        json.dump(alert_data, f, indent=2)
    
    print(f"📝 🌋 Extreme volatility alert written: {asset} @ very_high vol")


# ============== STREAK RECORD ALERTING (T288) ==============

def load_streak_records() -> dict:
    """Load streak records from file."""
    try:
        with open(STREAK_STATE_FILE, "r") as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return {"longest_win_streak": 0, "longest_loss_streak": 0, "updated_at": None}


def save_streak_records(records: dict):
    """Save streak records to file."""
    records["updated_at"] = datetime.now(timezone.utc).isoformat()
    with open(STREAK_STATE_FILE, "w") as f:
        json.dump(records, f, indent=2)


def calculate_current_streaks() -> dict:
    """
    Calculate current win/loss streak and longest streaks from trade log.
    Returns dict with: current_streak, current_streak_type, longest_win_streak, longest_loss_streak
    """
    log_path = Path(TRADE_LOG_FILE)
    if not log_path.exists():
        return {
            "current_streak": 0,
            "current_streak_type": None,
            "longest_win_streak": 0,
            "longest_loss_streak": 0
        }
    
    # Read all settled trades
    settled_trades = []
    with open(log_path) as f:
        for line in f:
            try:
                entry = json.loads(line.strip())
                if entry.get("type") == "trade" and entry.get("result_status") in ("won", "lost", "win", "loss"):
                    settled_trades.append(entry)
            except:
                pass
    
    if not settled_trades:
        return {
            "current_streak": 0,
            "current_streak_type": None,
            "longest_win_streak": 0,
            "longest_loss_streak": 0
        }
    
    # Sort by timestamp ascending (oldest first)
    settled_trades.sort(key=lambda x: x.get("timestamp", ""))
    
    # Calculate streaks
    current_streak = 0
    current_type = None
    longest_win = 0
    longest_loss = 0
    
    for trade in settled_trades:
        # Normalize result status (win/won, loss/lost)
        result = trade.get("result_status", "")
        is_win = result in ("won", "win")
        is_loss = result in ("lost", "loss")
        
        if is_win:
            if current_type == "win":
                current_streak += 1
            else:
                current_streak = 1
                current_type = "win"
            longest_win = max(longest_win, current_streak)
        elif is_loss:
            if current_type == "loss":
                current_streak += 1
            else:
                current_streak = 1
                current_type = "loss"
            longest_loss = max(longest_loss, current_streak)
    
    return {
        "current_streak": current_streak,
        "current_streak_type": current_type,
        "longest_win_streak": longest_win,
        "longest_loss_streak": longest_loss
    }


def check_streak_records() -> str:
    """
    Check if current streaks have hit new records. Alert if so.
    Call this after trades settle.
    
    Returns: Status message
    """
    current = calculate_current_streaks()
    saved = load_streak_records()
    
    alerts = []
    
    # Check for new win streak record
    if current["longest_win_streak"] > saved["longest_win_streak"] and current["longest_win_streak"] >= 3:
        alerts.append({
            "type": "win_record",
            "new_record": current["longest_win_streak"],
            "old_record": saved["longest_win_streak"],
            "emoji": "🏆🔥"
        })
        saved["longest_win_streak"] = current["longest_win_streak"]
    
    # Check for new loss streak record (not something to celebrate, but important to track)
    if current["longest_loss_streak"] > saved["longest_loss_streak"] and current["longest_loss_streak"] >= 3:
        alerts.append({
            "type": "loss_record",
            "new_record": current["longest_loss_streak"],
            "old_record": saved["longest_loss_streak"],
            "emoji": "💀📉"
        })
        saved["longest_loss_streak"] = current["longest_loss_streak"]
    
    # Save updated records
    if alerts:
        save_streak_records(saved)
        write_streak_alert(alerts, current)
        msg = f"🎖️ New streak record(s): {', '.join([a['type'] for a in alerts])}"
        print(msg)
        return msg
    
    return f"✓ Streaks: current={current['current_streak']} ({current['current_streak_type']}), " \
           f"best win={current['longest_win_streak']}, worst loss={current['longest_loss_streak']}"


def write_streak_alert(alerts: list, current: dict):
    """Write streak record alert file for heartbeat pickup."""
    
    messages = []
    for alert in alerts:
        if alert["type"] == "win_record":
            messages.append(
                f"🏆🔥 NEW WIN STREAK RECORD!\n\n"
                f"Consecutive wins: {alert['new_record']}\n"
                f"Previous record: {alert['old_record']}\n\n"
                f"The strategy is on fire! 🎉"
            )
        elif alert["type"] == "loss_record":
            messages.append(
                f"💀📉 NEW LOSS STREAK RECORD\n\n"
                f"Consecutive losses: {alert['new_record']}\n"
                f"Previous worst: {alert['old_record']}\n\n"
                f"Consider pausing to review strategy.\n"
                f"Circuit breaker: {CIRCUIT_BREAKER_THRESHOLD} consecutive losses"
            )
    
    alert_data = {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "type": "streak_record",
        "alerts": alerts,
        "current_streak": current["current_streak"],
        "current_streak_type": current["current_streak_type"],
        "longest_win_streak": current["longest_win_streak"],
        "longest_loss_streak": current["longest_loss_streak"],
        "message": "\n\n---\n\n".join(messages)
    }
    
    with open(STREAK_ALERT_FILE, "w") as f:
        json.dump(alert_data, f, indent=2)
    
    print(f"📝 Streak record alert written to {STREAK_ALERT_FILE}")
