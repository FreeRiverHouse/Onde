#!/usr/bin/env python3
"""
Kalshi Opus Trader - Direct trading script for use by Clawdbot/Opus
No external LLM needed - the agent IS the forecaster.

Usage: python3 scripts/kalshi-opus-trader.py scan     # Scan and show opportunities
       python3 scripts/kalshi-opus-trader.py trade TICKER yes|no PRICE COUNT  # Place order
       python3 scripts/kalshi-opus-trader.py positions  # Show current positions
       python3 scripts/kalshi-opus-trader.py balance    # Show balance
"""

import sys
import json
import requests
import base64
from datetime import datetime, timezone
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import padding

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

def sign_request(method, path, timestamp):
    private_key = serialization.load_pem_private_key(PRIVATE_KEY.encode(), password=None)
    message = f"{timestamp}{method}{path}".encode('utf-8')
    signature = private_key.sign(
        message,
        padding.PSS(mgf=padding.MGF1(hashes.SHA256()), salt_length=padding.PSS.MAX_LENGTH),
        hashes.SHA256()
    )
    return base64.b64encode(signature).decode('utf-8')

def api(method, path, body=None):
    ts = str(int(datetime.now(timezone.utc).timestamp() * 1000))
    sig = sign_request(method, path, ts)
    headers = {
        "KALSHI-ACCESS-KEY": API_KEY_ID,
        "KALSHI-ACCESS-SIGNATURE": sig,
        "KALSHI-ACCESS-TIMESTAMP": ts,
        "Content-Type": "application/json"
    }
    url = BASE_URL + path
    if method == "POST":
        r = requests.post(url, headers=headers, json=body, timeout=10)
    else:
        r = requests.get(url, headers=headers, timeout=10)
    return r.json()

def get_balance():
    bal = api("GET", "/trade-api/v2/portfolio/balance")
    return bal.get('balance', 0), bal.get('portfolio_value', 0)

def get_positions():
    pos = api("GET", "/trade-api/v2/portfolio/positions?limit=50&settlement_status=unsettled")
    return pos.get("market_positions", [])

def scan_events(event_tickers):
    """Scan specific events for tradeable markets"""
    all_markets = []
    for ticker in event_tickers:
        resp = requests.get(f'{BASE_URL}/trade-api/v2/events/{ticker}?with_nested_markets=true')
        if resp.status_code == 200:
            event = resp.json().get('event', {})
            markets = event.get('markets', [])
            for m in markets:
                vol = m.get('volume', 0) or 0
                yb = m.get('yes_bid', 0) or 0
                ya = m.get('yes_ask', 0) or 0
                oi = m.get('open_interest', 0) or 0
                if vol > 0 and ya > 0:
                    all_markets.append({
                        'ticker': m['ticker'],
                        'title': m.get('title', '')[:80],
                        'yes_bid': yb,
                        'yes_ask': ya,
                        'no_bid': m.get('no_bid', 0) or 0,
                        'no_ask': m.get('no_ask', 0) or 0,
                        'volume': vol,
                        'oi': oi,
                        'event': ticker,
                        'event_title': event.get('title', '')[:60],
                        'close': m.get('close_time', ''),
                    })
    return sorted(all_markets, key=lambda x: x['volume'], reverse=True)

def place_order(ticker, side, price_cents, count):
    """Place a limit order"""
    body = {
        "ticker": ticker,
        "action": "buy",
        "side": side,
        "type": "limit",
        "count": count,
    }
    if side == "yes":
        body["yes_price"] = price_cents
    else:
        body["no_price"] = price_cents
    
    result = api("POST", "/trade-api/v2/portfolio/orders", body)
    return result

# Key event tickers to scan
DEFAULT_EVENTS = [
    # Economics
    'KXCPI-26FEB', 'KXCPI-26MAR', 'KXFED-26MAR', 'KXFED-26MAY',
    'KXPPI-26FEB', 'KXNFP-26FEB', 'KXNFP-26MAR',
    'KXRETAILSALES-26FEB', 'KXUMICH-26FEB', 'KXUMICH-26MAR',
    'KXJOBLESS-26FEB20', 'KXJOBLESS-26FEB27',
    'KXPCEPRICE-26JAN', 'KXGDP-26Q4',
    # Crypto daily
    'KXBTCD-26FEB16', 'KXBTCD-26FEB17', 'KXBTCD-26FEB18',
    'KXETHD-26FEB16', 'KXETHD-26FEB17',
    # Crypto range  
    'KXBTC-26FEB28', 'KXETH-26FEB28',
    # Weather
    'HIGHNY-26FEB16', 'HIGHLA-26FEB16', 'HIGHCHI-26FEB16',
    'RAINNYC-26FEB16', 'RAINLA-26FEB16',
    # Politics/World
    'KXNEWPOPE-70', 'KXNEWPOPE-35',
    'KXTRUMPAPPROVAL-26FEB', 'KXGOVTSHUTDOWN-26',
    # Tech
    'KXDEEPSEEKR2RELEASE',
]

if __name__ == "__main__":
    cmd = sys.argv[1] if len(sys.argv) > 1 else "scan"
    
    if cmd == "balance":
        bal, pv = get_balance()
        print(f"Balance: ${bal/100:.2f}")
        print(f"Portfolio value: ${pv/100:.2f}")
        
    elif cmd == "positions":
        positions = get_positions()
        if not positions:
            print("No open positions")
        for p in positions:
            print(json.dumps(p, indent=2))
            
    elif cmd == "scan":
        markets = scan_events(DEFAULT_EVENTS)
        print(f"Found {len(markets)} markets\n")
        for m in markets[:30]:
            spread = m['yes_ask'] - m['yes_bid']
            print(f"YES:{m['yes_bid']:3d}/{m['yes_ask']:3d}¢ (sp:{spread:2d}) Vol:{m['volume']:>8,} OI:{m['oi']:>6,} | {m['event']}")
            print(f"  {m['title']}")
            print()
            
    elif cmd == "trade":
        if len(sys.argv) < 6:
            print("Usage: trade TICKER yes|no PRICE COUNT")
            sys.exit(1)
        ticker = sys.argv[2]
        side = sys.argv[3]
        price = int(sys.argv[4])
        count = int(sys.argv[5])
        
        print(f"Placing order: {side.upper()} {ticker} x{count} @ {price}¢")
        result = place_order(ticker, side, price, count)
        if "order" in result:
            o = result["order"]
            print(f"✅ Status: {o.get('status')}")
            print(f"   Filled: {o.get('fill_count')}/{o.get('initial_count')}")
        else:
            print(f"❌ Error: {json.dumps(result)[:300]}")
    else:
        print(f"Unknown command: {cmd}")
        print("Commands: scan, trade, positions, balance")
