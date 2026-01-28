#!/usr/bin/env python3
"""
Kalshi AutoTrader - Automated BTC/ETH Trading Bot
Inspired by the Polymarket Clawdbot success ($100 → $347 overnight)

Features:
- Real-time price monitoring
- Volatility detection
- Sentiment analysis (Fear & Greed Index)
- Automated trading via Kalshi API
- Risk management with Kelly criterion

Usage:
    python kalshi-autotrader.py              # Run in monitor mode
    python kalshi-autotrader.py --live       # Run with live trading
    python kalshi-autotrader.py --backtest   # Backtest strategy
"""

import requests
import json
import sys
import time
from datetime import datetime, timezone, timedelta
import base64
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import padding
import statistics

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

# Trading parameters
MIN_EDGE = 0.05  # 5% minimum edge to trade
MAX_POSITION_PCT = 0.05  # Max 5% of portfolio per position (smaller bets!)
MAX_POSITIONS = 50  # More positions allowed
KELLY_FRACTION = 0.15  # Smaller Kelly for micro bets
MIN_BET_CENTS = 5  # Minimum bet size (micro!)
VOLATILITY_WINDOW = 10  # Minutes for volatility calc

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


def api_request(method: str, path: str, body: dict = None) -> dict:
    """Make authenticated API request"""
    timestamp = str(int(datetime.now(timezone.utc).timestamp() * 1000))
    signature = sign_request(method, path, timestamp)
    headers = {
        "KALSHI-ACCESS-KEY": API_KEY_ID,
        "KALSHI-ACCESS-SIGNATURE": signature,
        "KALSHI-ACCESS-TIMESTAMP": timestamp,
        "Content-Type": "application/json"
    }
    url = f"{BASE_URL}{path}"
    
    try:
        if method == "GET":
            resp = requests.get(url, headers=headers, timeout=10)
        elif method == "POST":
            resp = requests.post(url, headers=headers, json=body, timeout=10)
        else:
            raise ValueError(f"Unknown method: {method}")
        return resp.json()
    except Exception as e:
        return {"error": str(e)}


def get_balance() -> dict:
    """Get account balance"""
    return api_request("GET", "/trade-api/v2/portfolio/balance")


def get_positions() -> list:
    """Get current positions"""
    result = api_request("GET", "/trade-api/v2/portfolio/positions")
    return result.get("market_positions", [])


def search_markets(series: str = None, limit: int = 50) -> list:
    """Search for markets"""
    path = f"/trade-api/v2/markets?limit={limit}&status=open"
    if series:
        path += f"&series_ticker={series}"
    result = api_request("GET", path)
    return result.get("markets", [])


def place_order(ticker: str, side: str, count: int, price_cents: int) -> dict:
    """Place a limit order"""
    body = {
        "ticker": ticker,
        "action": "buy",
        "side": side,
        "count": count,
        "type": "limit",
        "yes_price": price_cents if side == "yes" else 100 - price_cents
    }
    return api_request("POST", "/trade-api/v2/portfolio/orders", body)


# ============== DATA FUNCTIONS ==============

def get_crypto_prices() -> dict:
    """Get current BTC/ETH prices"""
    try:
        resp = requests.get(
            "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd",
            timeout=5
        )
        data = resp.json()
        return {
            "btc": data["bitcoin"]["usd"],
            "eth": data["ethereum"]["usd"]
        }
    except:
        return None


def get_fear_greed_index() -> dict:
    """Get crypto Fear & Greed Index (sentiment)"""
    try:
        resp = requests.get("https://api.alternative.me/fng/?limit=1", timeout=5)
        data = resp.json()
        return {
            "value": int(data["data"][0]["value"]),
            "classification": data["data"][0]["value_classification"]
        }
    except:
        return {"value": 50, "classification": "Neutral"}


def get_btc_volatility() -> float:
    """Get BTC 24h volatility from price history"""
    try:
        resp = requests.get(
            "https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=1",
            timeout=10
        )
        data = resp.json()
        prices = [p[1] for p in data["prices"]]
        if len(prices) < 2:
            return 0.02
        returns = [(prices[i] - prices[i-1]) / prices[i-1] for i in range(1, len(prices))]
        return statistics.stdev(returns) * (24 ** 0.5)  # Annualize to daily
    except:
        return 0.02  # Default 2% volatility


# ============== STRATEGY FUNCTIONS ==============

def calculate_implied_prob(yes_price: int) -> float:
    """Convert yes price (cents) to implied probability"""
    return yes_price / 100.0


def calculate_edge(our_prob: float, market_prob: float, side: str) -> float:
    """Calculate our edge vs market"""
    if side == "yes":
        return our_prob - market_prob
    else:
        return (1 - our_prob) - (1 - market_prob)


def kelly_size(edge: float, odds: float, bankroll: float) -> int:
    """Calculate Kelly criterion bet size in cents"""
    if edge <= 0 or odds <= 0:
        return 0
    
    # Kelly formula: f = (bp - q) / b
    # where b = odds-1, p = win prob, q = 1-p
    p = edge + 0.5  # Our estimated win probability
    q = 1 - p
    b = odds
    
    kelly_pct = (b * p - q) / b
    kelly_pct = max(0, min(kelly_pct, 1))  # Bound between 0-1
    
    # Apply fraction and position limit
    bet_pct = kelly_pct * KELLY_FRACTION
    bet_pct = min(bet_pct, MAX_POSITION_PCT)
    
    bet_cents = int(bankroll * bet_pct)
    return max(MIN_BET_CENTS, bet_cents)


def estimate_btc_prob(current_price: float, strike: float, hours_to_expiry: float, volatility: float, sentiment: int) -> float:
    """
    Estimate probability BTC will be above strike at expiry
    Uses simplified model with volatility and sentiment adjustment
    """
    # Base case: current price vs strike
    if current_price >= strike:
        base_prob = 0.55  # Slightly above 50% if already above
    else:
        base_prob = 0.45  # Slightly below if currently below
    
    # Adjust for distance from strike
    pct_diff = (current_price - strike) / strike
    prob_adjustment = pct_diff * 2  # 1% diff = 2% prob adjustment
    
    # Adjust for volatility (higher vol = more uncertainty = closer to 50%)
    vol_adjustment = (0.5 - base_prob) * min(volatility * 10, 0.5)
    
    # Adjust for sentiment (Fear = bearish, Greed = bullish)
    sentiment_adjustment = (sentiment - 50) / 500  # Max ±10% adjustment
    
    # Combine
    prob = base_prob + prob_adjustment + vol_adjustment + sentiment_adjustment
    return max(0.05, min(0.95, prob))  # Bound between 5-95%


def find_opportunities(markets: list, btc_price: float, eth_price: float, volatility: float, sentiment: int) -> list:
    """Find trading opportunities in the markets"""
    opportunities = []
    
    for m in markets:
        ticker = m.get("ticker", "")
        yes_bid = m.get("yes_bid", 0)
        yes_ask = m.get("yes_ask", 0)
        subtitle = m.get("subtitle", "")
        
        if not yes_bid or not yes_ask:
            continue
        
        # Parse BTC markets
        if "KXBTCD" in ticker and "$" in subtitle:
            try:
                # Extract strike price from subtitle like "$88,750 or above"
                strike_str = subtitle.split("$")[1].split(" ")[0].replace(",", "")
                strike = float(strike_str)
                
                # Estimate our probability
                our_prob = estimate_btc_prob(btc_price, strike, 24, volatility, sentiment)
                market_prob_yes = calculate_implied_prob(yes_ask)
                market_prob_no = calculate_implied_prob(100 - yes_bid)
                
                # Check YES opportunity
                edge_yes = our_prob - market_prob_yes
                if edge_yes > MIN_EDGE:
                    opportunities.append({
                        "ticker": ticker,
                        "side": "yes",
                        "price": yes_ask,
                        "edge": edge_yes,
                        "our_prob": our_prob,
                        "market_prob": market_prob_yes,
                        "strike": strike,
                        "current": btc_price,
                        "asset": "BTC"
                    })
                
                # Check NO opportunity
                edge_no = (1 - our_prob) - market_prob_no
                if edge_no > MIN_EDGE:
                    opportunities.append({
                        "ticker": ticker,
                        "side": "no",
                        "price": 100 - yes_bid,
                        "edge": edge_no,
                        "our_prob": 1 - our_prob,
                        "market_prob": market_prob_no,
                        "strike": strike,
                        "current": btc_price,
                        "asset": "BTC"
                    })
            except:
                continue
    
    # Sort by edge (best first)
    opportunities.sort(key=lambda x: x["edge"], reverse=True)
    return opportunities


# ============== MAIN TRADING LOOP ==============

def trading_cycle(live_mode: bool = False):
    """Run one trading cycle"""
    print(f"\n{'='*60}")
    print(f"🤖 KALSHI AUTOTRADER - {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"{'='*60}")
    
    # Get account status
    balance = get_balance()
    cash_cents = balance.get("balance", 0)
    portfolio_cents = balance.get("portfolio_value", 0)
    print(f"\n💰 Cash: ${cash_cents/100:.2f}")
    print(f"📊 Portfolio: ${portfolio_cents/100:.2f}")
    
    if cash_cents < MIN_BET_CENTS:
        print("❌ Insufficient cash for trading")
        return
    
    # Get market data
    prices = get_crypto_prices()
    if not prices:
        print("❌ Failed to get crypto prices")
        return
    
    btc = prices["btc"]
    eth = prices["eth"]
    print(f"\n📈 BTC: ${btc:,.0f}")
    print(f"📈 ETH: ${eth:,.0f}")
    
    # Get sentiment
    fng = get_fear_greed_index()
    sentiment = fng["value"]
    print(f"😱 Fear & Greed: {sentiment} ({fng['classification']})")
    
    # Get volatility
    volatility = get_btc_volatility()
    print(f"📉 BTC Volatility (24h): {volatility*100:.1f}%")
    
    # Get current positions
    positions = get_positions()
    position_tickers = [p.get("ticker") for p in positions]
    print(f"\n📋 Current positions: {len(positions)}")
    
    if len(positions) >= MAX_POSITIONS:
        print("⚠️ Max positions reached")
        return
    
    # Search BTC markets
    btc_markets = search_markets(series="KXBTCD")
    print(f"🔍 Found {len(btc_markets)} BTC markets")
    
    # Find opportunities
    opportunities = find_opportunities(btc_markets, btc, eth, volatility, sentiment)
    print(f"🎯 Found {len(opportunities)} opportunities with edge > {MIN_EDGE*100:.0f}%")
    
    if not opportunities:
        print("No good opportunities right now")
        return
    
    # Show top opportunities
    print("\n🏆 Top Opportunities:")
    for i, opp in enumerate(opportunities[:5]):
        print(f"  {i+1}. {opp['ticker']}")
        print(f"     {opp['side'].upper()} @ {opp['price']}¢ | Edge: {opp['edge']*100:.1f}%")
        print(f"     Strike: ${opp['strike']:,.0f} | Current: ${opp['current']:,.0f}")
    
    if not live_mode:
        print("\n⚠️ DRY RUN - No trades executed (use --live for real trading)")
        return
    
    # Execute best trade
    best = opportunities[0]
    if best["ticker"] in position_tickers:
        print(f"⏭️ Already have position in {best['ticker']}")
        if len(opportunities) > 1:
            best = opportunities[1]
        else:
            return
    
    # Calculate bet size
    odds = (100 - best["price"]) / best["price"]  # Potential profit / cost
    bet_cents = kelly_size(best["edge"], odds, cash_cents)
    contracts = bet_cents // best["price"]
    
    if contracts < 1:
        print("❌ Bet size too small")
        return
    
    print(f"\n🚀 EXECUTING TRADE:")
    print(f"   {best['side'].upper()} {contracts} contracts @ {best['price']}¢")
    print(f"   Ticker: {best['ticker']}")
    print(f"   Edge: {best['edge']*100:.1f}%")
    
    result = place_order(best["ticker"], best["side"], contracts, best["price"])
    
    order = result.get("order", {})
    if order.get("status") == "executed":
        print(f"✅ EXECUTED! Cost: ${order.get('taker_fill_cost', 0)/100:.2f}")
    else:
        print(f"📋 Order status: {order.get('status', 'unknown')}")
        if "error" in result:
            print(f"❌ Error: {result['error']}")


def run_autotrader(live_mode: bool = False, interval_seconds: int = 300):
    """Run the autotrader continuously"""
    print("🤖 Starting Kalshi AutoTrader...")
    print(f"   Mode: {'LIVE' if live_mode else 'DRY RUN'}")
    print(f"   Interval: {interval_seconds}s")
    print("   Press Ctrl+C to stop\n")
    
    while True:
        try:
            trading_cycle(live_mode)
            print(f"\n⏰ Next cycle in {interval_seconds}s...")
            time.sleep(interval_seconds)
        except KeyboardInterrupt:
            print("\n\n👋 Stopping autotrader...")
            break
        except Exception as e:
            print(f"\n❌ Error: {e}")
            time.sleep(60)  # Wait 1 min on error


# ============== MAIN ==============

if __name__ == "__main__":
    if "--live" in sys.argv:
        run_autotrader(live_mode=True, interval_seconds=300)
    elif "--backtest" in sys.argv:
        print("Backtest mode not implemented yet")
    else:
        # Single dry run cycle
        trading_cycle(live_mode=False)
