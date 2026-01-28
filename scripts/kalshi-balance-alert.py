#!/usr/bin/env python3
"""
Kalshi Balance Alert - Checks balance and creates alert file if low.
Used by heartbeat to send Telegram notifications.

Usage:
    python kalshi-balance-alert.py             # Check and update alert status
    python kalshi-balance-alert.py --status    # Just show status
"""

import requests
import json
import sys
import os
from datetime import datetime, timezone
import base64
from pathlib import Path
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import padding

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
LOW_BALANCE_THRESHOLD_CENTS = 500  # $5.00
ALERT_FILE = Path(__file__).parent / "kalshi-low-balance.alert"


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


def api_request(method: str, path: str) -> dict:
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
        resp = requests.get(url, headers=headers, timeout=10)
        return resp.json()
    except Exception as e:
        return {"error": str(e)}


def get_balance() -> dict:
    """Get account balance"""
    return api_request("GET", "/trade-api/v2/portfolio/balance")


def check_and_alert():
    """Check balance and update alert file"""
    balance = get_balance()
    
    if "error" in balance:
        print(f"❌ Error getting balance: {balance['error']}")
        return None
    
    cash_cents = balance.get("balance", 0)
    portfolio_cents = balance.get("portfolio_value", 0)
    total_cents = cash_cents + portfolio_cents
    
    result = {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "cash_cents": cash_cents,
        "portfolio_cents": portfolio_cents,
        "total_cents": total_cents,
        "threshold_cents": LOW_BALANCE_THRESHOLD_CENTS,
        "is_low": cash_cents < LOW_BALANCE_THRESHOLD_CENTS
    }
    
    print(f"💰 Cash Balance: ${cash_cents/100:.2f}")
    print(f"📊 Portfolio Value: ${portfolio_cents/100:.2f}")
    print(f"📈 Total: ${total_cents/100:.2f}")
    print(f"⚠️ Threshold: ${LOW_BALANCE_THRESHOLD_CENTS/100:.2f}")
    
    if result["is_low"]:
        print(f"\n🚨 LOW BALANCE ALERT! Cash (${cash_cents/100:.2f}) < ${LOW_BALANCE_THRESHOLD_CENTS/100:.2f}")
        # Write alert file
        with open(ALERT_FILE, "w") as f:
            json.dump(result, f, indent=2)
        print(f"📝 Alert written to {ALERT_FILE}")
    else:
        print(f"\n✅ Balance OK")
        # Remove alert file if exists
        if ALERT_FILE.exists():
            ALERT_FILE.unlink()
            print(f"🗑️ Cleared old alert")
    
    return result


def get_status():
    """Just show current status without writing alerts"""
    balance = get_balance()
    
    if "error" in balance:
        print(f"❌ Error: {balance['error']}")
        return
    
    cash = balance.get("balance", 0)
    portfolio = balance.get("portfolio_value", 0)
    
    print(f"💰 Kalshi Balance Status")
    print(f"   Cash: ${cash/100:.2f}")
    print(f"   Portfolio: ${portfolio/100:.2f}")
    print(f"   Total: ${(cash+portfolio)/100:.2f}")
    
    if ALERT_FILE.exists():
        print(f"\n⚠️ Active low balance alert!")
    else:
        print(f"\n✅ No active alerts")


if __name__ == "__main__":
    if "--status" in sys.argv:
        get_status()
    else:
        check_and_alert()
