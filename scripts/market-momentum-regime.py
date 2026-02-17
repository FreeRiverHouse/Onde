#!/usr/bin/env python3
"""
Market Momentum Regime Indicator

Tracks aggregate momentum across BTC/ETH to identify market regimes:
- TRENDING: Strong directional moves, momentum strategies favored
- RANGING: Sideways chop, mean-reversion strategies favored
- VOLATILE: High volatility regime changes, caution advised

Uses ADX-like momentum scoring and regime classification.

Output: data/trading/momentum-regime.json
Alerts: scripts/kalshi-momentum-regime.alert (on regime change)
"""

import json
import os
import time
from datetime import datetime, timedelta, timezone
from pathlib import Path
import urllib.request
import urllib.error
from typing import Optional, Tuple, List
import statistics

# Configuration
PROJECT_ROOT = Path(__file__).parent.parent
DATA_DIR = PROJECT_ROOT / "data" / "trading"
OUTPUT_FILE = DATA_DIR / "momentum-regime.json"
HISTORY_FILE = DATA_DIR / "momentum-regime-history.jsonl"
ALERT_FILE = PROJECT_ROOT / "scripts" / "kalshi-momentum-regime.alert"
STATE_FILE = PROJECT_ROOT / "scripts" / "kalshi-momentum-regime-state.json"

BINANCE_BASE = "https://api.binance.com/api/v3"
COINGECKO_BASE = "https://api.coingecko.com/api/v3"

# Regime thresholds
TRENDING_THRESHOLD = 0.6   # Momentum score above this = trending
RANGING_THRESHOLD = 0.3    # Momentum score below this = ranging
# Between these = transitional/volatile


def fetch_json(url: str, timeout: int = 10) -> Optional[dict]:
    """Fetch JSON from URL with error handling."""
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "MomentumRegime/1.0"})
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            return json.loads(resp.read().decode())
    except Exception as e:
        print(f"⚠️ Error fetching {url}: {e}")
        return None


def get_hourly_ohlc_binance(symbol: str, hours: int = 168) -> Optional[List[dict]]:
    """
    Fetch hourly OHLC candles from Binance.
    Default 168 hours = 7 days of data.
    """
    end_time = int(time.time() * 1000)
    start_time = end_time - (hours * 60 * 60 * 1000)
    
    url = f"{BINANCE_BASE}/klines?symbol={symbol}&interval=1h&startTime={start_time}&endTime={end_time}&limit=500"
    data = fetch_json(url)
    
    if not data:
        return None
    
    # Parse klines: [open_time, open, high, low, close, volume, ...]
    candles = []
    for k in data:
        candles.append({
            "timestamp": k[0] / 1000,
            "open": float(k[1]),
            "high": float(k[2]),
            "low": float(k[3]),
            "close": float(k[4]),
            "volume": float(k[5])
        })
    
    return candles


def get_hourly_ohlc_coingecko(coin_id: str, days: int = 7) -> Optional[List[dict]]:
    """
    Fetch OHLC data from CoinGecko.
    Uses the OHLC endpoint which is free and doesn't need API key.
    """
    # CoinGecko OHLC endpoint: 1/7/14/30/90/180/365 days
    valid_days = [1, 7, 14, 30, 90, 180, 365]
    ohlc_days = min([d for d in valid_days if d >= days], default=7)
    
    url = f"{COINGECKO_BASE}/coins/{coin_id}/ohlc?vs_currency=usd&days={ohlc_days}"
    data = fetch_json(url)
    
    if not data:
        # Try market_chart as fallback (auto-determines granularity)
        url = f"{COINGECKO_BASE}/coins/{coin_id}/market_chart?vs_currency=usd&days={days}"
        data = fetch_json(url)
        
        if not data or "prices" not in data:
            return None
        
        # Convert prices to pseudo-OHLC
        prices = data.get("prices", [])
        candles = []
        for i, (ts, price) in enumerate(prices):
            prev_price = prices[i-1][1] if i > 0 else price
            next_price = prices[i+1][1] if i < len(prices)-1 else price
            
            candles.append({
                "timestamp": ts / 1000,
                "open": prev_price,
                "high": max(price, prev_price, next_price) * 1.001,
                "low": min(price, prev_price, next_price) * 0.999,
                "close": price,
                "volume": 0
            })
        return candles
    
    # Parse OHLC: [[timestamp, open, high, low, close], ...]
    candles = []
    for k in data:
        candles.append({
            "timestamp": k[0] / 1000,
            "open": float(k[1]),
            "high": float(k[2]),
            "low": float(k[3]),
            "close": float(k[4]),
            "volume": 0
        })
    
    return candles


def get_hourly_ohlc(symbol: str, hours: int = 168) -> Optional[List[dict]]:
    """Try Binance first, fall back to CoinGecko."""
    
    # Try Binance
    candles = get_hourly_ohlc_binance(symbol, hours)
    if candles:
        return candles
    
    # Fall back to CoinGecko
    print(f"   ↳ Binance unavailable, trying CoinGecko...")
    
    # Map symbol to CoinGecko coin_id
    symbol_map = {
        "BTCUSDT": "bitcoin",
        "ETHUSDT": "ethereum"
    }
    coin_id = symbol_map.get(symbol)
    if not coin_id:
        return None
    
    days = max(1, hours // 24)
    time.sleep(0.5)  # Rate limiting for CoinGecko
    return get_hourly_ohlc_coingecko(coin_id, days)


def calculate_atr(candles: List[dict], period: int = 14) -> float:
    """Calculate Average True Range (volatility measure)."""
    if len(candles) < period + 1:
        return 0
    
    true_ranges = []
    for i in range(1, len(candles)):
        high = candles[i]["high"]
        low = candles[i]["low"]
        prev_close = candles[i-1]["close"]
        
        tr = max(
            high - low,
            abs(high - prev_close),
            abs(low - prev_close)
        )
        true_ranges.append(tr)
    
    # Return average of last 'period' true ranges
    return statistics.mean(true_ranges[-period:])


def calculate_directional_movement(candles: List[dict], period: int = 14) -> Tuple[float, float]:
    """
    Calculate +DI and -DI (directional movement indicators).
    Returns (plus_di, minus_di) as percentages.
    """
    if len(candles) < period + 1:
        return 0, 0
    
    plus_dm_sum = 0
    minus_dm_sum = 0
    tr_sum = 0
    
    for i in range(len(candles) - period, len(candles)):
        if i < 1:
            continue
            
        high = candles[i]["high"]
        low = candles[i]["low"]
        prev_high = candles[i-1]["high"]
        prev_low = candles[i-1]["low"]
        prev_close = candles[i-1]["close"]
        
        # True range
        tr = max(
            high - low,
            abs(high - prev_close),
            abs(low - prev_close)
        )
        tr_sum += tr
        
        # Directional movement
        up_move = high - prev_high
        down_move = prev_low - low
        
        if up_move > down_move and up_move > 0:
            plus_dm_sum += up_move
        if down_move > up_move and down_move > 0:
            minus_dm_sum += down_move
    
    if tr_sum == 0:
        return 0, 0
    
    plus_di = (plus_dm_sum / tr_sum) * 100
    minus_di = (minus_dm_sum / tr_sum) * 100
    
    return plus_di, minus_di


def calculate_adx(candles: List[dict], period: int = 14) -> float:
    """
    Calculate ADX (Average Directional Index).
    High ADX (>25) = strong trend
    Low ADX (<20) = weak trend / ranging
    """
    if len(candles) < period * 2:
        return 0
    
    dx_values = []
    
    # Calculate DX for rolling periods
    for end_idx in range(period + 1, len(candles) + 1):
        window = candles[max(0, end_idx - period - 1):end_idx]
        plus_di, minus_di = calculate_directional_movement(window, period)
        
        if plus_di + minus_di == 0:
            dx = 0
        else:
            dx = abs(plus_di - minus_di) / (plus_di + minus_di) * 100
        dx_values.append(dx)
    
    if not dx_values:
        return 0
    
    # ADX is smoothed average of DX
    return statistics.mean(dx_values[-period:])


def calculate_momentum_score(candles: List[dict]) -> Tuple[float, dict]:
    """
    Calculate overall momentum score (0-1 scale).
    Combines:
    - ADX (trend strength)
    - Price momentum (rate of change)
    - Directional consistency
    
    Returns (score, details_dict)
    """
    if len(candles) < 20:
        return 0.5, {"error": "insufficient data"}
    
    # 1. ADX component (0-100 raw, normalize to 0-1)
    adx = calculate_adx(candles, 14)
    adx_score = min(adx / 50, 1.0)  # Cap at ADX=50
    
    # 2. Rate of change over different periods
    close_prices = [c["close"] for c in candles]
    
    roc_24h = (close_prices[-1] - close_prices[-24]) / close_prices[-24] if len(close_prices) >= 24 else 0
    roc_7d = (close_prices[-1] - close_prices[0]) / close_prices[0] if len(close_prices) > 1 else 0
    
    # Absolute momentum strength
    roc_strength = (abs(roc_24h) * 0.5 + abs(roc_7d) * 0.5) * 10  # Scale up
    roc_score = min(roc_strength, 1.0)
    
    # 3. Directional consistency (are moves in same direction?)
    plus_di, minus_di = calculate_directional_movement(candles, 14)
    di_diff = abs(plus_di - minus_di)
    consistency_score = min(di_diff / 30, 1.0)  # Cap at 30 diff
    
    # 4. Volatility check (ATR relative to price)
    atr = calculate_atr(candles, 14)
    atr_pct = (atr / close_prices[-1]) * 100 if close_prices[-1] > 0 else 0
    
    # Combined score (weighted average)
    momentum_score = (
        adx_score * 0.4 +
        roc_score * 0.3 +
        consistency_score * 0.3
    )
    
    details = {
        "adx": round(adx, 2),
        "adx_score": round(adx_score, 3),
        "roc_24h": round(roc_24h * 100, 2),  # As percentage
        "roc_7d": round(roc_7d * 100, 2),
        "roc_score": round(roc_score, 3),
        "plus_di": round(plus_di, 2),
        "minus_di": round(minus_di, 2),
        "consistency_score": round(consistency_score, 3),
        "atr_pct": round(atr_pct, 3),
        "direction": "bullish" if plus_di > minus_di else "bearish"
    }
    
    return round(momentum_score, 3), details


def classify_regime(score: float) -> str:
    """Classify market regime based on momentum score."""
    if score >= TRENDING_THRESHOLD:
        return "TRENDING"
    elif score <= RANGING_THRESHOLD:
        return "RANGING"
    else:
        return "VOLATILE"


def get_regime_recommendation(regime: str, direction: str) -> dict:
    """Get trading recommendations based on regime."""
    recs = {
        "TRENDING": {
            "strategy": "momentum",
            "description": f"Market is trending ({direction}). Favor momentum strategies.",
            "sizing": "normal",
            "hold_time": "longer",
            "contrarian_caution": True
        },
        "RANGING": {
            "strategy": "mean_reversion",
            "description": "Market is ranging/choppy. Favor mean-reversion strategies.",
            "sizing": "reduced",
            "hold_time": "shorter",
            "breakout_caution": True
        },
        "VOLATILE": {
            "strategy": "cautious",
            "description": "Market regime transitioning. Reduce exposure.",
            "sizing": "minimal",
            "hold_time": "shortest",
            "general_caution": True
        }
    }
    return recs.get(regime, recs["VOLATILE"])


def load_previous_state() -> Optional[dict]:
    """Load previous regime state for comparison."""
    if STATE_FILE.exists():
        try:
            return json.loads(STATE_FILE.read_text())
        except:
            pass
    return None


def save_state(state: dict):
    """Save current state for next comparison."""
    STATE_FILE.write_text(json.dumps(state, indent=2))


def log_to_history(entry: dict):
    """Append entry to history file."""
    HISTORY_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(HISTORY_FILE, "a") as f:
        f.write(json.dumps(entry) + "\n")


def check_and_alert_regime_change(current_regime: str, prev_state: Optional[dict], output: dict):
    """Create alert file if regime changed."""
    if not prev_state:
        return
    
    prev_regime = prev_state.get("regime")
    if prev_regime and prev_regime != current_regime:
        alert_msg = f"""🔄 MARKET REGIME CHANGE

**Previous:** {prev_regime}
**Current:** {current_regime}

**BTC Momentum Score:** {output['btc']['momentum_score']} ({output['btc']['direction']})
**ETH Momentum Score:** {output['eth']['momentum_score']} ({output['eth']['direction']})
**Aggregate Score:** {output['aggregate_score']}

**Recommendation:** {output['recommendation']['description']}

This is informational - adjust strategy if needed.
Timestamp: {output['timestamp']}
"""
        ALERT_FILE.write_text(alert_msg)
        print(f"🚨 ALERT: Regime changed from {prev_regime} to {current_regime}")


def main():
    """Main execution."""
    print("📊 Market Momentum Regime Indicator")
    print("=" * 40)
    
    # Ensure data directory exists
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    
    # Fetch OHLC data
    print("Fetching BTC hourly data...")
    btc_candles = get_hourly_ohlc("BTCUSDT", hours=168)
    time.sleep(0.2)
    
    print("Fetching ETH hourly data...")
    eth_candles = get_hourly_ohlc("ETHUSDT", hours=168)
    
    if not btc_candles or not eth_candles:
        print("❌ Failed to fetch market data")
        return 1
    
    print(f"✅ Got {len(btc_candles)} BTC candles, {len(eth_candles)} ETH candles")
    
    # Calculate momentum for each
    btc_score, btc_details = calculate_momentum_score(btc_candles)
    eth_score, eth_details = calculate_momentum_score(eth_candles)
    
    # Aggregate score (weighted by market cap - BTC heavier)
    aggregate_score = round(btc_score * 0.6 + eth_score * 0.4, 3)
    
    # Classify regime
    regime = classify_regime(aggregate_score)
    
    # Determine overall direction
    btc_bullish = btc_details.get("direction") == "bullish"
    eth_bullish = eth_details.get("direction") == "bullish"
    
    if btc_bullish and eth_bullish:
        direction = "bullish"
    elif not btc_bullish and not eth_bullish:
        direction = "bearish"
    else:
        direction = "mixed"
    
    # Get recommendation
    recommendation = get_regime_recommendation(regime, direction)
    
    # Build output
    output = {
        "timestamp": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
        "regime": regime,
        "aggregate_score": aggregate_score,
        "direction": direction,
        "btc": {
            "price": btc_candles[-1]["close"],
            "momentum_score": btc_score,
            "direction": btc_details.get("direction"),
            **btc_details
        },
        "eth": {
            "price": eth_candles[-1]["close"],
            "momentum_score": eth_score,
            "direction": eth_details.get("direction"),
            **eth_details
        },
        "recommendation": recommendation,
        "thresholds": {
            "trending": TRENDING_THRESHOLD,
            "ranging": RANGING_THRESHOLD
        },
        "source": "binance"
    }
    
    # Load previous state for comparison
    prev_state = load_previous_state()
    
    # Check for regime change and alert
    check_and_alert_regime_change(regime, prev_state, output)
    
    # Save output
    OUTPUT_FILE.write_text(json.dumps(output, indent=2))
    print(f"\n✅ Saved to {OUTPUT_FILE}")
    
    # Save current state
    save_state({
        "regime": regime,
        "aggregate_score": aggregate_score,
        "direction": direction,
        "timestamp": output["timestamp"]
    })
    
    # Log to history
    log_to_history({
        "timestamp": output["timestamp"],
        "regime": regime,
        "score": aggregate_score,
        "direction": direction,
        "btc_score": btc_score,
        "eth_score": eth_score
    })
    
    # Print summary
    print(f"\n🎯 MARKET REGIME: {regime}")
    print(f"   Aggregate Score: {aggregate_score} (>{TRENDING_THRESHOLD}=trending, <{RANGING_THRESHOLD}=ranging)")
    print(f"   Direction: {direction}")
    print(f"\n📈 BTC: Score={btc_score}, ADX={btc_details['adx']}, ROC_24h={btc_details['roc_24h']}%")
    print(f"📈 ETH: Score={eth_score}, ADX={eth_details['adx']}, ROC_24h={eth_details['roc_24h']}%")
    print(f"\n💡 Strategy: {recommendation['strategy'].upper()}")
    print(f"   {recommendation['description']}")
    
    return 0


if __name__ == "__main__":
    exit(main())
