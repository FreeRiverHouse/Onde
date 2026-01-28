import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export interface Fill {
  ticker: string;
  side: 'yes' | 'no';
  action: 'buy' | 'sell';
  count: number;
  price: number; // in cents
  cost: number; // total cost in cents
  timestamp: string;
  orderId: string;
  tradeId: string;
}

export interface FillsResponse {
  fills: Fill[];
  lastBet: Fill | null;
  portfolioHistory: Array<{
    timestamp: string;
    value: number;
  }>;
  error?: string;
}

export async function GET() {
  try {
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
    # Get fills (executed trades)
    fills_resp = api_request("GET", "/trade-api/v2/portfolio/fills?limit=100")
    fills = fills_resp.get("fills", [])
    
    # Get balance history for portfolio chart
    balance_resp = api_request("GET", "/trade-api/v2/portfolio/balance")
    
    result = {
        "fills": fills,
        "current_balance": balance_resp.get("balance", 0),
        "current_portfolio": balance_resp.get("portfolio_value", 0)
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

    // Process fills into our format
    const fills: Fill[] = (data.fills || []).map((f: any) => ({
      ticker: f.ticker || '',
      side: f.side || 'yes',
      action: f.action || 'buy',
      count: f.count || 0,
      price: f.yes_price || f.no_price || 0,
      cost: f.cost || 0,
      timestamp: f.created_time || new Date().toISOString(),
      orderId: f.order_id || '',
      tradeId: f.trade_id || ''
    }));

    // Sort by timestamp desc to get latest
    fills.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    // Build portfolio history from fills (cumulative P&L)
    // We'll create a simple timeline based on fills
    const portfolioHistory: Array<{ timestamp: string; value: number }> = [];
    let runningCost = 0;
    
    // Reverse to go chronologically
    const chronologicalFills = [...fills].reverse();
    for (const fill of chronologicalFills) {
      runningCost += fill.cost / 100;
      portfolioHistory.push({
        timestamp: fill.timestamp,
        value: runningCost
      });
    }

    // Add current portfolio value as last point
    const currentTotal = ((data.current_balance || 0) + (data.current_portfolio || 0)) / 100;
    if (portfolioHistory.length > 0) {
      portfolioHistory.push({
        timestamp: new Date().toISOString(),
        value: currentTotal
      });
    }

    const response: FillsResponse = {
      fills,
      lastBet: fills.length > 0 ? fills[0] : null,
      portfolioHistory
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Kalshi fills API error:', error);
    
    return NextResponse.json({
      fills: [],
      lastBet: null,
      portfolioHistory: [],
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
