#!/usr/bin/env python3
"""
Kalshi API Trading Bot - FULLY TESTED AND WORKING
Auto-trades on Kalshi prediction markets via REST API

Usage:
    python kalshi-api-trader.py                    # Show status
    python kalshi-api-trader.py buy TICKER 5 75   # Buy 5 YES @ 75¢
    python kalshi-api-trader.py search btc        # Search markets
"""

import requests
import json
import sys
from datetime import datetime, timezone
import base64
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import padding

# Credentials
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
    
    if method == "GET":
        resp = requests.get(url, headers=headers)
    elif method == "POST":
        resp = requests.post(url, headers=headers, json=body)
    elif method == "DELETE":
        resp = requests.delete(url, headers=headers)
    else:
        raise ValueError(f"Unknown method: {method}")
    
    return resp.json()


# ============== API FUNCTIONS ==============

def get_balance() -> dict:
    """Get account balance and portfolio value"""
    return api_request("GET", "/trade-api/v2/portfolio/balance")


def get_positions() -> list:
    """Get current positions"""
    result = api_request("GET", "/trade-api/v2/portfolio/positions")
    return result.get("market_positions", [])


def search_markets(query: str = None, series: str = None, limit: int = 20) -> list:
    """Search for markets"""
    path = f"/trade-api/v2/markets?limit={limit}&status=open"
    if query:
        path += f"&query={query}"
    if series:
        path += f"&series_ticker={series}"
    result = api_request("GET", path)
    return result.get("markets", [])


def get_market(ticker: str) -> dict:
    """Get market details"""
    result = api_request("GET", f"/trade-api/v2/markets/{ticker}")
    return result.get("market", {})


def place_order(ticker: str, side: str, count: int, price_cents: int) -> dict:
    """
    Place a limit order
    
    Args:
        ticker: Market ticker (e.g., KXBTCD-26JAN2817-T88749.99)
        side: "yes" or "no"
        count: Number of contracts
        price_cents: Price in cents (1-99)
    
    Returns:
        Order result with status
    """
    body = {
        "ticker": ticker,
        "action": "buy",
        "side": side,
        "count": count,
        "type": "limit",
        "yes_price": price_cents if side == "yes" else 100 - price_cents
    }
    return api_request("POST", "/trade-api/v2/portfolio/orders", body)


def sell_position(ticker: str, count: int, price_cents: int) -> dict:
    """Sell contracts from a position"""
    body = {
        "ticker": ticker,
        "action": "sell",
        "side": "yes",
        "count": count,
        "type": "limit",
        "yes_price": price_cents
    }
    return api_request("POST", "/trade-api/v2/portfolio/orders", body)


def get_orders(ticker: str = None) -> list:
    """Get open orders"""
    path = "/trade-api/v2/portfolio/orders"
    if ticker:
        path += f"?ticker={ticker}"
    result = api_request("GET", path)
    return result.get("orders", [])


def cancel_order(order_id: str) -> dict:
    """Cancel an open order"""
    return api_request("DELETE", f"/trade-api/v2/portfolio/orders/{order_id}")


def get_crypto_prices() -> dict:
    """Get current BTC/ETH prices from CoinGecko"""
    resp = requests.get("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd")
    data = resp.json()
    return {
        "btc": data["bitcoin"]["usd"],
        "eth": data["ethereum"]["usd"]
    }


# ============== MAIN ==============

def show_status():
    """Show account status"""
    print("=" * 50)
    print("KALSHI API TRADER - STATUS")
    print("=" * 50)
    
    # Balance
    balance = get_balance()
    print(f"\n💰 Cash: ${balance.get('balance', 0)/100:.2f}")
    print(f"📊 Portfolio: ${balance.get('portfolio_value', 0)/100:.2f}")
    
    # Crypto prices
    prices = get_crypto_prices()
    print(f"\n📈 BTC: ${prices['btc']:,.0f}")
    print(f"📈 ETH: ${prices['eth']:,.0f}")
    
    # Positions
    positions = get_positions()
    print(f"\n📋 Posizioni ({len(positions)}):")
    for p in positions:
        ticker = p.get("ticker", "?")
        pos = p.get("position", 0)
        market_exposure = p.get("market_exposure", 0) / 100
        print(f"  • {ticker}: {pos} @ ${market_exposure:.2f}")


def cmd_search(query: str):
    """Search markets"""
    print(f"🔍 Searching: {query}")
    
    # Try as series ticker first
    series = None
    if query.lower() == "btc":
        series = "KXBTCD"
    elif query.lower() == "eth":
        series = "KXETHD"
    
    markets = search_markets(query=query if not series else None, series=series)
    
    for m in markets[:15]:
        ticker = m.get("ticker", "?")
        yes_bid = m.get("yes_bid", 0)
        yes_ask = m.get("yes_ask", 0)
        subtitle = m.get("subtitle", "?")[:40]
        print(f"  {ticker}")
        print(f"    {subtitle} | bid={yes_bid}¢ ask={yes_ask}¢")


def cmd_buy(ticker: str, count: int, price: int):
    """Buy contracts"""
    print(f"🚀 Buying {count} YES @ {price}¢ on {ticker}...")
    result = place_order(ticker, "yes", count, price)
    
    order = result.get("order", {})
    if order.get("status") == "executed":
        print(f"✅ EXECUTED! Order ID: {order.get('order_id')}")
        print(f"   Fill cost: ${order.get('taker_fill_cost', 0)/100:.2f}")
        print(f"   Fees: ${order.get('taker_fees', 0)/100:.2f}")
    else:
        print(f"📋 Status: {order.get('status', 'unknown')}")
        print(f"   Order ID: {order.get('order_id')}")
    
    if "error" in result:
        print(f"❌ Error: {result['error']}")


def main():
    if len(sys.argv) < 2:
        show_status()
        return
    
    cmd = sys.argv[1].lower()
    
    if cmd == "status":
        show_status()
    elif cmd == "search" and len(sys.argv) >= 3:
        cmd_search(sys.argv[2])
    elif cmd == "buy" and len(sys.argv) >= 5:
        cmd_buy(sys.argv[2], int(sys.argv[3]), int(sys.argv[4]))
    elif cmd == "positions":
        for p in get_positions():
            print(f"{p.get('ticker')}: {p.get('position')} contracts")
    else:
        print("Usage:")
        print("  python kalshi-api-trader.py                    # Status")
        print("  python kalshi-api-trader.py search btc         # Search BTC markets")
        print("  python kalshi-api-trader.py buy TICKER 5 75    # Buy 5 YES @ 75¢")
        print("  python kalshi-api-trader.py positions          # List positions")


if __name__ == "__main__":
    main()
