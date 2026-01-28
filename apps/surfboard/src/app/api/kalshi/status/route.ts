import { NextResponse } from 'next/server';

export const runtime = 'edge';

// Kalshi API credentials (read-only access for portfolio view)
const API_KEY_ID = "4308d1ca-585e-4b73-be82-5c0968b9a59a";
const PRIVATE_KEY_PEM = `-----BEGIN RSA PRIVATE KEY-----
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
-----END RSA PRIVATE KEY-----`;

const BASE_URL = "https://api.elections.kalshi.com";

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
  error?: string;
}

// Convert PEM to binary
function pemToBinary(pem: string): ArrayBuffer {
  const lines = pem.split('\n');
  const base64 = lines
    .filter(line => !line.startsWith('-----'))
    .join('');
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

// Import RSA private key for signing
async function importPrivateKey(): Promise<CryptoKey> {
  const binaryKey = pemToBinary(PRIVATE_KEY_PEM);
  return await crypto.subtle.importKey(
    'pkcs8',
    binaryKey,
    {
      name: 'RSA-PSS',
      hash: 'SHA-256',
    },
    false,
    ['sign']
  );
}

// Sign request
async function signRequest(method: string, path: string, timestamp: string): Promise<string> {
  const privateKey = await importPrivateKey();
  const message = `${timestamp}${method}${path}`;
  const encoder = new TextEncoder();
  const signature = await crypto.subtle.sign(
    {
      name: 'RSA-PSS',
      saltLength: 32, // Using fixed salt length for consistency
    },
    privateKey,
    encoder.encode(message)
  );
  return btoa(String.fromCharCode(...new Uint8Array(signature)));
}

// Make authenticated API request
async function apiRequest(method: string, path: string): Promise<any> {
  const timestamp = String(Date.now());
  const signature = await signRequest(method, path, timestamp);

  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      'KALSHI-ACCESS-KEY': API_KEY_ID,
      'KALSHI-ACCESS-SIGNATURE': signature,
      'KALSHI-ACCESS-TIMESTAMP': timestamp,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Kalshi API error: ${response.status}`);
  }

  return response.json();
}

export async function GET() {
  try {
    // Fetch balance and positions in parallel
    const [balanceData, positionsData] = await Promise.all([
      apiRequest('GET', '/trade-api/v2/portfolio/balance'),
      apiRequest('GET', '/trade-api/v2/portfolio/positions'),
    ]);

    const positions = positionsData.market_positions || [];

    const status: KalshiStatus = {
      cash: (balanceData.balance || 0) / 100,
      portfolioValue: (balanceData.portfolio_value || 0) / 100,
      positions: positions.map((p: any) => ({
        ticker: p.ticker || '',
        position: p.position || 0,
        exposure: (p.market_exposure || 0) / 100,
        pnl: p.realized_pnl ? p.realized_pnl / 100 : undefined,
      })),
      btcPrice: 0,
      ethPrice: 0,
      lastUpdated: new Date().toISOString(),
    };

    return NextResponse.json(status);
  } catch (error) {
    console.error('Kalshi API error:', error);

    return NextResponse.json({
      cash: 0,
      portfolioValue: 0,
      positions: [],
      btcPrice: 0,
      ethPrice: 0,
      lastUpdated: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
    } as KalshiStatus, { status: 500 });
  }
}
