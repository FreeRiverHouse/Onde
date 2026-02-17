#!/usr/bin/env python3
"""
Kalshi Microbetting Bot
Automatically finds and executes +EV micro-bets on crypto markets

Usage:
    python kalshi-microbet.py          # Run once
    python kalshi-microbet.py --loop   # Run continuously
"""

import requests
import json
import sys
import time
from datetime import datetime, timezone
import base64
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import padding

# === CONFIG ===
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

# Betting parameters
MIN_EDGE = 0.15  # 15% minimum edge
MAX_PRICE = 90   # Don't buy above 90¢
MIN_BET = 0.10   # Minimum $0.10 per bet
MAX_BET = 0.50   # Maximum $0.50 per bet
BTC_BUFFER = 400  # $400 buffer for BTC (default)
ETH_BUFFER = 25   # $25 buffer for ETH (default)


def get_volatility_adjusted_buffer(asset, price):
    """
    Calculate dynamic buffer based on asset volatility
    
    Uses 2x daily volatility as buffer:
    - BTC ~3% daily vol → buffer = price * 0.03 * 2 = 6%
    - ETH ~4% daily vol → buffer = price * 0.04 * 2 = 8%
    """
    if asset == "btc":
        daily_vol = 0.03  # 3% typical daily volatility
    elif asset == "eth":
        daily_vol = 0.04  # 4% typical daily volatility  
    else:
        daily_vol = 0.05  # Conservative default
    
    # Buffer = 2 standard deviations of daily move
    buffer = price * daily_vol * 2
    
    return buffer
KELLY_FRACTION = 0.25  # Quarter Kelly for safety

# Risk Management (Grok-style)
MAX_POSITION_PCT = 0.05  # Max 5% of portfolio per position
MAX_DAILY_DRAWDOWN = 0.15  # Stop if down 15% today
MAX_OPEN_POSITIONS = 15  # Max concurrent positions
STARTING_PORTFOLIO = None  # Set at start of day


def check_risk_limits(cash, portfolio, positions_count):
    """
    Check if we're within risk limits
    Returns (ok, reason)
    """
    global STARTING_PORTFOLIO
    
    # Set starting portfolio on first check
    if STARTING_PORTFOLIO is None:
        STARTING_PORTFOLIO = portfolio
    
    # Check daily drawdown
    if STARTING_PORTFOLIO > 0:
        drawdown = (STARTING_PORTFOLIO - portfolio) / STARTING_PORTFOLIO
        if drawdown >= MAX_DAILY_DRAWDOWN:
            return False, f"Daily drawdown limit hit: {drawdown:.1%}"
    
    # Check position count
    if positions_count >= MAX_OPEN_POSITIONS:
        return False, f"Max positions reached: {positions_count}/{MAX_OPEN_POSITIONS}"
    
    return True, "OK"


def max_position_size(portfolio):
    """Calculate max bet size based on portfolio %"""
    return portfolio * MAX_POSITION_PCT


def kelly_bet_size(edge, price, bankroll):
    """
    Calculate optimal bet size using Kelly Criterion
    
    Kelly formula: f* = (bp - q) / b
    where:
        b = odds (potential profit / stake)
        p = probability of winning (estimated from edge)
        q = 1 - p
    
    We use quarter-Kelly for safety (reduces variance)
    """
    if edge <= 0 or price <= 0 or price >= 100:
        return 0
    
    # Odds: if we pay 60¢, we win 40¢, so b = 40/60 = 0.667
    b = (100 - price) / price
    
    # Estimated probability based on our edge calculation
    # edge = (100 - price) / price means we think true prob > implied prob
    # implied_prob = price / 100
    # If edge = 50%, we think true_prob = implied_prob * 1.5
    implied_prob = price / 100
    estimated_prob = min(0.95, implied_prob * (1 + edge))  # Cap at 95%
    
    p = estimated_prob
    q = 1 - p
    
    # Kelly fraction
    kelly_f = (b * p - q) / b
    
    if kelly_f <= 0:
        return 0
    
    # Apply safety factor (quarter Kelly)
    safe_f = kelly_f * KELLY_FRACTION
    
    # Calculate bet size in dollars
    bet_size = safe_f * bankroll
    
    # Apply min/max constraints
    return max(MIN_BET, min(MAX_BET, bet_size))


def sign_request(method, path, timestamp):
    private_key = serialization.load_pem_private_key(PRIVATE_KEY.encode(), password=None)
    message = f"{timestamp}{method}{path}".encode('utf-8')
    signature = private_key.sign(
        message,
        padding.PSS(mgf=padding.MGF1(hashes.SHA256()), salt_length=padding.PSS.MAX_LENGTH),
        hashes.SHA256()
    )
    return base64.b64encode(signature).decode('utf-8')


def api_get(path):
    timestamp = str(int(datetime.now(timezone.utc).timestamp() * 1000))
    signature = sign_request("GET", path, timestamp)
    headers = {"KALSHI-ACCESS-KEY": API_KEY_ID, "KALSHI-ACCESS-SIGNATURE": signature, "KALSHI-ACCESS-TIMESTAMP": timestamp}
    try:
        return requests.get(f"{BASE_URL}{path}", headers=headers, timeout=10).json()
    except:
        return {}


def api_post(path, body):
    timestamp = str(int(datetime.now(timezone.utc).timestamp() * 1000))
    signature = sign_request("POST", path, timestamp)
    headers = {"KALSHI-ACCESS-KEY": API_KEY_ID, "KALSHI-ACCESS-SIGNATURE": signature, "KALSHI-ACCESS-TIMESTAMP": timestamp, "Content-Type": "application/json"}
    try:
        return requests.post(f"{BASE_URL}{path}", headers=headers, json=body, timeout=10).json()
    except:
        return {}


def get_crypto_prices():
    try:
        resp = requests.get("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd", timeout=5)
        data = resp.json()
        return {"btc": data["bitcoin"]["usd"], "eth": data["ethereum"]["usd"]}
    except:
        return {"btc": 0, "eth": 0}


def find_opportunities(prices):
    """Find +EV betting opportunities"""
    opportunities = []
    
    # BTC markets
    btc_markets = api_get("/trade-api/v2/markets?limit=50&status=open&series_ticker=KXBTCD")
    for m in btc_markets.get("markets", []):
        opp = analyze_market(m, prices["btc"], BTC_BUFFER, "BTC")
        if opp:
            opportunities.append(opp)
    
    # ETH markets  
    eth_markets = api_get("/trade-api/v2/markets?limit=50&status=open&series_ticker=KXETHD")
    for m in eth_markets.get("markets", []):
        opp = analyze_market(m, prices["eth"], ETH_BUFFER, "ETH")
        if opp:
            opportunities.append(opp)
    
    return sorted(opportunities, key=lambda x: x["edge"], reverse=True)


def analyze_market(market, asset_price, static_buffer, asset_name):
    # Use volatility-adjusted buffer
    buffer = get_volatility_adjusted_buffer(asset_name.lower(), asset_price)
    """Analyze a single market for opportunity"""
    ticker = market.get("ticker", "")
    if "-T" not in ticker:
        return None
    
    try:
        threshold = float(ticker.split("-T")[1])
    except:
        return None
    
    yes_ask = market.get("yes_ask", 0)
    yes_bid = market.get("yes_bid", 0)
    
    if yes_ask == 0:
        return None
    
    # Determine direction
    if asset_price > threshold + buffer:
        # Asset above threshold → YES should win
        if yes_ask > MAX_PRICE:
            return None
        edge = (100 - yes_ask) / yes_ask
        if edge < MIN_EDGE:
            return None
        return {
            "ticker": ticker,
            "side": "yes",
            "price": yes_ask,
            "threshold": threshold,
            "edge": edge,
            "asset": asset_name,
            "reason": f"{asset_name} ${asset_price:,.0f} > ${threshold:,.0f}"
        }
    
    elif asset_price < threshold - buffer:
        # Asset below threshold → NO should win
        no_price = 100 - yes_bid if yes_bid > 0 else 100
        if no_price > MAX_PRICE:
            return None
        edge = (100 - no_price) / no_price
        if edge < MIN_EDGE:
            return None
        return {
            "ticker": ticker,
            "side": "no",
            "price": no_price,
            "threshold": threshold,
            "edge": edge,
            "asset": asset_name,
            "reason": f"{asset_name} ${asset_price:,.0f} < ${threshold:,.0f}"
        }
    
    return None


def execute_bet(opp, bankroll):
    """Execute a single bet with Kelly sizing"""
    # Calculate optimal bet size
    bet_size = kelly_bet_size(opp["edge"], opp["price"], bankroll)
    
    if bet_size < MIN_BET:
        return {"error": "bet too small"}
    
    count = max(1, int(bet_size * 100 / opp["price"]))
    
    order = {
        "ticker": opp["ticker"],
        "action": "buy",
        "side": opp["side"],
        "count": count,
        "type": "limit",
        "yes_price": opp["price"] if opp["side"] == "yes" else 100 - opp["price"]
    }
    
    result = api_post("/trade-api/v2/portfolio/orders", order)
    return result


def run_once():
    """Run one betting cycle"""
    print(f"\n{'='*50}")
    print(f"KALSHI MICROBET - {datetime.now().strftime('%H:%M:%S')}")
    print(f"{'='*50}")
    
    # Get prices
    prices = get_crypto_prices()
    if prices["btc"] == 0:
        print("❌ Failed to get crypto prices")
        return
    print(f"📈 BTC: ${prices['btc']:,.0f} | ETH: ${prices['eth']:,.0f}")
    
    # Get balance
    balance = api_get("/trade-api/v2/portfolio/balance")
    cash = balance.get("balance", 0) / 100
    portfolio = balance.get("portfolio_value", 0) / 100
    print(f"💰 Cash: ${cash:.2f} | Portfolio: ${portfolio:.2f}")
    
    if cash < MIN_BET:
        print("⚠️ Insufficient cash for betting")
        return
    
    # Get positions count
    positions = api_get("/trade-api/v2/portfolio/positions")
    positions_count = len(positions.get("market_positions", []))
    
    # Check risk limits
    ok, reason = check_risk_limits(cash, portfolio, positions_count)
    if not ok:
        print(f"🛑 RISK LIMIT: {reason}")
        return
    
    print(f"📋 Positions: {positions_count}/{MAX_OPEN_POSITIONS}")
    
    # Find opportunities
    opportunities = find_opportunities(prices)
    print(f"\n🎯 Found {len(opportunities)} opportunities")
    
    if not opportunities:
        print("No +EV opportunities found")
        return
    
    # Show top opportunities
    for opp in opportunities[:5]:
        print(f"  • {opp['side'].upper()} @ {opp['price']}¢ | edge={opp['edge']:.1%} | {opp['reason']}")
    
    # Execute best bets
    executed = 0
    for opp in opportunities[:3]:  # Max 3 bets per cycle
        if cash < MIN_BET:
            break
        
        # Use Kelly sizing with current cash as bankroll
        result = execute_bet(opp, cash)
        
        order = result.get("order", {})
        status = order.get("status", "unknown")
        
        if status == "executed":
            cost = order.get("taker_fill_cost", 0) / 100
            fees = order.get("taker_fees", 0) / 100
            cash -= (cost + fees)
            executed += 1
            print(f"  ✅ {opp['side'].upper()} @ {opp['price']}¢ | ${cost:.2f}")
        else:
            print(f"  ⏳ {status}: {opp['side'].upper()} @ {opp['price']}¢")
    
    # Final balance
    balance = api_get("/trade-api/v2/portfolio/balance")
    print(f"\n💰 Final: ${balance.get('balance', 0)/100:.2f} cash, ${balance.get('portfolio_value', 0)/100:.2f} portfolio")
    print(f"📊 Executed {executed} bets")


def main():
    if "--loop" in sys.argv:
        print("🔄 Running in loop mode (Ctrl+C to stop)")
        while True:
            try:
                run_once()
                time.sleep(300)  # 5 minutes between cycles
            except KeyboardInterrupt:
                print("\n👋 Stopped")
                break
    else:
        run_once()


if __name__ == "__main__":
    main()
