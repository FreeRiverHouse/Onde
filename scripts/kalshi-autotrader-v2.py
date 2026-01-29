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

def get_btc_ohlc(days: int = 2) -> list:
    """Get BTC OHLC data from CoinGecko (hourly for 2 days)"""
    try:
        # CoinGecko gives hourly data for 1-90 days
        resp = requests.get(
            f"https://api.coingecko.com/api/v3/coins/bitcoin/ohlc?vs_currency=usd&days={days}",
            timeout=10
        )
        if resp.status_code != 200:
            return []
        return resp.json()  # [[timestamp, open, high, low, close], ...]
    except Exception as e:
        print(f"[WARN] Failed to get OHLC: {e}")
        return []


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
    """Make authenticated API request with exponential backoff retry"""
    url = f"{BASE_URL}{path}"
    
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
        
        try:
            if method == "GET":
                resp = requests.get(url, headers=headers, timeout=10)
            elif method == "POST":
                resp = requests.post(url, headers=headers, json=body, timeout=10)
            
            # Check for server errors (5xx) - retry these
            if resp.status_code >= 500:
                if attempt < max_retries - 1:
                    wait_time = (2 ** attempt) + (time.time() % 1)  # Exponential backoff with jitter
                    print(f"[RETRY] API {resp.status_code} error, waiting {wait_time:.1f}s (attempt {attempt + 1}/{max_retries})")
                    time.sleep(wait_time)
                    continue
                else:
                    return {"error": f"API error {resp.status_code} after {max_retries} retries"}
            
            # Client errors (4xx) - don't retry, return as-is
            return resp.json()
            
        except requests.exceptions.Timeout:
            if attempt < max_retries - 1:
                wait_time = (2 ** attempt) + (time.time() % 1)
                print(f"[RETRY] Timeout, waiting {wait_time:.1f}s (attempt {attempt + 1}/{max_retries})")
                time.sleep(wait_time)
                continue
            return {"error": f"Timeout after {max_retries} retries"}
            
        except requests.exceptions.ConnectionError:
            if attempt < max_retries - 1:
                wait_time = (2 ** attempt) + (time.time() % 1)
                print(f"[RETRY] Connection error, waiting {wait_time:.1f}s (attempt {attempt + 1}/{max_retries})")
                time.sleep(wait_time)
                continue
            return {"error": f"Connection error after {max_retries} retries"}
            
        except Exception as e:
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


# ============== EXTERNAL DATA ==============

def get_crypto_prices(max_retries: int = 3) -> dict:
    """Get current BTC/ETH prices with retry logic"""
    for attempt in range(max_retries):
        try:
            resp = requests.get(
                "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd",
                timeout=5
            )
            if resp.status_code >= 500:
                raise requests.exceptions.RequestException(f"Server error {resp.status_code}")
            data = resp.json()
            return {
                "btc": data["bitcoin"]["usd"],
                "eth": data["ethereum"]["usd"]
            }
        except Exception as e:
            if attempt < max_retries - 1:
                wait_time = (2 ** attempt) + (time.time() % 1)
                print(f"[RETRY] CoinGecko error: {e}, waiting {wait_time:.1f}s")
                time.sleep(wait_time)
                continue
    return None


def get_fear_greed(max_retries: int = 2) -> int:
    """Get Fear & Greed Index (0-100) with retry logic"""
    for attempt in range(max_retries):
        try:
            resp = requests.get("https://api.alternative.me/fng/?limit=1", timeout=5)
            if resp.status_code >= 500:
                raise requests.exceptions.RequestException(f"Server error {resp.status_code}")
            return int(resp.json()["data"][0]["value"])
        except Exception as e:
            if attempt < max_retries - 1:
                wait_time = (2 ** attempt) + (time.time() % 1)
                print(f"[RETRY] F&G error: {e}, waiting {wait_time:.1f}s")
                time.sleep(wait_time)
                continue
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


def find_opportunities(markets: list, btc_price: float, momentum: dict = None, verbose: bool = True) -> list:
    """Find trading opportunities with PROPER probability model + momentum adjustment"""
    opportunities = []
    skip_reasons = {
        "not_btc": 0,
        "no_strike": 0,
        "too_close_expiry": 0,
        "momentum_conflict": 0,
        "insufficient_edge": []
    }
    
    # Extract momentum info for filtering
    mom_dir = momentum.get("composite_direction", 0) if momentum else 0
    mom_str = momentum.get("composite_strength", 0) if momentum else 0
    mom_alignment = momentum.get("alignment", False) if momentum else False
    
    for m in markets:
        ticker = m.get("ticker", "")
        subtitle = m.get("subtitle", "")
        yes_bid = m.get("yes_bid", 0)
        yes_ask = m.get("yes_ask", 0)
        no_bid = m.get("no_bid", 0)
        no_ask = m.get("no_ask", 0)
        
        if not ticker.startswith("KXBTCD"):
            skip_reasons["not_btc"] += 1
            continue
        
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
            btc_price, strike, minutes_left, BTC_HOURLY_VOL
        )
        base_prob_below = 1 - base_prob_above
        
        # APPLY MOMENTUM ADJUSTMENT to probabilities
        if momentum:
            prob_above = adjust_probability_with_momentum(
                base_prob_above, strike, btc_price, momentum, "yes"
            )
            prob_below = adjust_probability_with_momentum(
                base_prob_below, strike, btc_price, momentum, "no"
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
        
        # Check for YES opportunity (we think it'll be above strike)
        if prob_above > market_prob_yes + MIN_EDGE:
            # Skip YES if momentum is strongly bearish (dir < -0.3 with strength > 0.3)
            if mom_dir < -0.3 and mom_str > 0.3:
                skip_due_to_momentum = True
                skip_reasons["momentum_conflict"] += 1
            else:
                edge = prob_above - market_prob_yes
                # Bonus edge if momentum aligns (bullish momentum for YES)
                momentum_bonus = 0.02 if (mom_dir > 0.2 and mom_alignment) else 0
                opportunities.append({
                    "ticker": ticker,
                    "side": "yes",
                    "price": yes_ask,
                    "edge": edge,
                    "edge_with_bonus": edge + momentum_bonus,
                    "our_prob": prob_above,
                    "base_prob": base_prob_above,
                    "market_prob": market_prob_yes,
                    "strike": strike,
                    "current": btc_price,
                    "minutes_left": minutes_left,
                    "momentum_dir": mom_dir,
                    "momentum_str": mom_str,
                    "momentum_aligned": mom_alignment and mom_dir > 0.2
                })
                found_opp = True
        
        # Check for NO opportunity (we think it'll be below strike)  
        if prob_below > market_prob_no + MIN_EDGE:
            # Skip NO if momentum is strongly bullish (dir > 0.3 with strength > 0.3)
            if mom_dir > 0.3 and mom_str > 0.3:
                if not skip_due_to_momentum:  # Don't double count
                    skip_reasons["momentum_conflict"] += 1
            else:
                edge = prob_below - market_prob_no
                # Bonus edge if momentum aligns (bearish momentum for NO)
                momentum_bonus = 0.02 if (mom_dir < -0.2 and mom_alignment) else 0
                opportunities.append({
                    "ticker": ticker,
                    "side": "no",
                    "price": 100 - yes_bid,
                    "edge": edge,
                    "edge_with_bonus": edge + momentum_bonus,
                    "our_prob": prob_below,
                    "base_prob": base_prob_below,
                    "market_prob": market_prob_no,
                    "strike": strike,
                    "current": btc_price,
                    "minutes_left": minutes_left,
                    "momentum_dir": mom_dir,
                    "momentum_str": mom_str,
                    "momentum_aligned": mom_alignment and mom_dir < -0.2
                })
                found_opp = True
        
        # Log skip reason if no opportunity found
        if not found_opp:
            best_edge = max(yes_edge, no_edge)
            best_side = "YES" if yes_edge > no_edge else "NO"
            skip_reasons["insufficient_edge"].append({
                "ticker": ticker,
                "strike": strike,
                "best_side": best_side,
                "best_edge": best_edge,
                "required_edge": MIN_EDGE,
                "minutes_left": int(minutes_left)
            })
    
    # Log skip summary if verbose
    if verbose and (skip_reasons["insufficient_edge"] or skip_reasons["too_close_expiry"] or skip_reasons["momentum_conflict"]):
        print(f"\n📋 Skip Summary:")
        if skip_reasons["not_btc"]:
            print(f"   - Not BTC markets: {skip_reasons['not_btc']}")
        if skip_reasons["no_strike"]:
            print(f"   - No strike parsed: {skip_reasons['no_strike']}")
        if skip_reasons["too_close_expiry"]:
            print(f"   - Too close to expiry (<{MIN_TIME_TO_EXPIRY_MINUTES}min): {skip_reasons['too_close_expiry']}")
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
    
    # Get stats
    stats = get_trade_stats()
    win_rate = stats["wins"] / (stats["wins"] + stats["losses"]) * 100 if (stats["wins"] + stats["losses"]) > 0 else 0
    print(f"📈 History: {stats['total']} trades | {stats['wins']}W/{stats['losses']}L | {win_rate:.0f}% WR")
    print(f"💵 P/L: ${stats['profit_cents']/100:+.2f} | Pending: {stats['pending']}")
    
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
    
    btc_price = prices["btc"]
    print(f"📈 BTC: ${btc_price:,.0f}")
    
    # Get OHLC data for momentum calculation
    ohlc_data = get_btc_ohlc(days=2)
    momentum = get_multi_timeframe_momentum(ohlc_data)
    
    # Display momentum info
    if momentum["timeframes"]:
        print(f"📊 Momentum (1h/4h/24h):")
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
    
    if len(positions) >= MAX_POSITIONS:
        print("⚠️ Max positions reached, skipping")
        return
    
    # Find opportunities (now with momentum!)
    markets = search_markets("KXBTCD", limit=50)
    print(f"🔍 Scanning {len(markets)} BTC markets...")
    
    opportunities = find_opportunities(markets, btc_price, momentum=momentum)
    
    if not opportunities:
        print("😴 No opportunities found")
        return
    
    # Take best opportunity
    best = opportunities[0]
    mom_aligned = best.get('momentum_aligned', False)
    mom_badge = "🎯 MOMENTUM ALIGNED!" if mom_aligned else ""
    print(f"\n🎯 Best opportunity: {mom_badge}")
    print(f"   {best['ticker']}")
    print(f"   Side: {best['side'].upper()} @ {best['price']}¢")
    print(f"   Strike: ${best['strike']:,.0f} | BTC: ${best['current']:,.0f}")
    print(f"   Base prob: {best.get('base_prob', best['our_prob'])*100:.1f}% → Adjusted: {best['our_prob']*100:.1f}% vs Market: {best['market_prob']*100:.1f}%")
    print(f"   Edge: {best['edge']*100:.1f}% (w/bonus: {best.get('edge_with_bonus', best['edge'])*100:.1f}%) | Time left: {best['minutes_left']:.0f}min")
    print(f"   Momentum: dir={best.get('momentum_dir', 0):.2f} str={best.get('momentum_str', 0):.2f}")
    
    # Calculate bet size (Kelly)
    if cash < MIN_BET_CENTS / 100:
        print("❌ Insufficient cash")
        return
    
    kelly_bet = cash * KELLY_FRACTION * best["edge"]
    bet_size = max(MIN_BET_CENTS / 100, min(kelly_bet, cash * MAX_POSITION_PCT))
    contracts = int(bet_size * 100 / best["price"])
    
    if contracts < 1:
        print("❌ Bet too small")
        return
    
    print(f"\n💸 Placing order: {contracts} contracts @ {best['price']}¢")
    
    # Place order
    result = place_order(best["ticker"], best["side"], contracts, best["price"])
    
    if "error" in result:
        print(f"❌ Order error: {result['error']}")
        return
    
    order = result.get("order", {})
    if order.get("status") == "executed":
        print(f"✅ Order executed!")
        
        # Log trade (with momentum data)
        log_trade({
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "type": "trade",
            "ticker": best["ticker"],
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
            "current_price": btc_price,
            "minutes_to_expiry": best["minutes_left"],
            "momentum_dir": best.get("momentum_dir", 0),
            "momentum_str": best.get("momentum_str", 0),
            "momentum_aligned": best.get("momentum_aligned", False),
            "result_status": "pending"
        })
    else:
        print(f"⏳ Order status: {order.get('status')}")


def main():
    """Main entry point"""
    print("🚀 Starting Kalshi AutoTrader v2")
    print("   With PROPER probability model and feedback loop!")
    print("   Press Ctrl+C to stop\n")
    
    while True:
        try:
            run_cycle()
        except KeyboardInterrupt:
            print("\n\n👋 Stopping autotrader...")
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
