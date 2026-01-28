import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

interface KalshiStatus {
  cash: number;
  portfolioValue: number;
  positions: Array<{
    ticker: string;
    position: number;
    exposure: number;
    pnl?: number;
  }>;
  btcPrice: number;
  ethPrice: number;
  lastUpdated: string;
}

export async function GET() {
  try {
    // Create a standalone Python script to get Kalshi data as JSON
    const pythonScript = `
import requests
import json
from datetime import datetime, timezone
import base64
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

def api_request(method, path):
    timestamp = str(int(datetime.now(timezone.utc).timestamp() * 1000))
    signature = sign_request(method, path, timestamp)
    headers = {
        "KALSHI-ACCESS-KEY": API_KEY_ID,
        "KALSHI-ACCESS-SIGNATURE": signature,
        "KALSHI-ACCESS-TIMESTAMP": timestamp,
        "Content-Type": "application/json"
    }
    url = f"{BASE_URL}{path}"
    resp = requests.get(url, headers=headers, timeout=10)
    return resp.json()

try:
    balance = api_request("GET", "/trade-api/v2/portfolio/balance")
    positions_resp = api_request("GET", "/trade-api/v2/portfolio/positions")
    positions = positions_resp.get("market_positions", [])
    
    # Get crypto prices
    crypto_resp = requests.get("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd", timeout=5)
    crypto = crypto_resp.json()
    
    result = {
        "balance": balance.get("balance", 0),
        "portfolio_value": balance.get("portfolio_value", 0),
        "positions": positions,
        "btc_price": crypto.get("bitcoin", {}).get("usd", 0),
        "eth_price": crypto.get("ethereum", {}).get("usd", 0)
    }
    print(json.dumps(result))
except Exception as e:
    print(json.dumps({"error": str(e)}))
`;

    const { stdout } = await execAsync(`python3 -c '${pythonScript.replace(/'/g, "'\"'\"'")}'`, {
      timeout: 30000
    });

    const data = JSON.parse(stdout.trim());
    
    if (data.error) {
      throw new Error(data.error);
    }
    
    const status: KalshiStatus = {
      cash: (data.balance || 0) / 100,
      portfolioValue: (data.portfolio_value || 0) / 100,
      positions: (data.positions || []).map((p: any) => ({
        ticker: p.ticker || '',
        position: p.position || 0,
        exposure: (p.market_exposure || 0) / 100,
        pnl: p.realized_pnl ? p.realized_pnl / 100 : undefined
      })),
      btcPrice: data.btc_price || 0,
      ethPrice: data.eth_price || 0,
      lastUpdated: new Date().toISOString()
    };

    return NextResponse.json(status);
  } catch (error) {
    console.error('Kalshi API error:', error);
    
    // Return error response
    return NextResponse.json({
      cash: 0,
      portfolioValue: 0,
      positions: [],
      btcPrice: 0,
      ethPrice: 0,
      lastUpdated: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
