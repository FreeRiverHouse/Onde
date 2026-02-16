import { NextResponse } from 'next/server';

export const runtime = 'edge';

interface CryptoPrices {
  btc: number;
  eth: number;
  btc24hChange?: number;
  eth24hChange?: number;
  lastUpdated: string;
}

// Fallback: try multiple free price APIs
async function fetchFromCoinGecko(): Promise<{ btc: number; eth: number; btc24h?: number; eth24h?: number } | null> {
  try {
    const response = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd&include_24hr_change=true',
      { headers: { 'Accept': 'application/json' } }
    );
    if (!response.ok) return null;
    const data = await response.json();
    return {
      btc: data.bitcoin?.usd || 0,
      eth: data.ethereum?.usd || 0,
      btc24h: data.bitcoin?.usd_24h_change,
      eth24h: data.ethereum?.usd_24h_change,
    };
  } catch { return null; }
}

async function fetchFromCoinbase(): Promise<{ btc: number; eth: number } | null> {
  try {
    const [btcRes, ethRes] = await Promise.all([
      fetch('https://api.coinbase.com/v2/prices/BTC-USD/spot'),
      fetch('https://api.coinbase.com/v2/prices/ETH-USD/spot'),
    ]);
    if (!btcRes.ok || !ethRes.ok) return null;
    const btcData = await btcRes.json();
    const ethData = await ethRes.json();
    return {
      btc: parseFloat(btcData.data?.amount || '0'),
      eth: parseFloat(ethData.data?.amount || '0'),
    };
  } catch { return null; }
}

async function fetchFromBinance(): Promise<{ btc: number; eth: number } | null> {
  try {
    const response = await fetch(
      'https://api.binance.com/api/v3/ticker/price?symbols=["BTCUSDT","ETHUSDT"]'
    );
    if (!response.ok) return null;
    const data = await response.json();
    const btcEntry = data.find((d: { symbol: string; price: string }) => d.symbol === 'BTCUSDT');
    const ethEntry = data.find((d: { symbol: string; price: string }) => d.symbol === 'ETHUSDT');
    return {
      btc: parseFloat(btcEntry?.price || '0'),
      eth: parseFloat(ethEntry?.price || '0'),
    };
  } catch { return null; }
}

export async function GET() {
  try {
    // Try CoinGecko first (has 24h change), then fallbacks
    const cgData = await fetchFromCoinGecko();
    if (cgData && cgData.btc > 0) {
      return NextResponse.json({
        btc: cgData.btc,
        eth: cgData.eth,
        btc24hChange: cgData.btc24h,
        eth24hChange: cgData.eth24h,
        lastUpdated: new Date().toISOString()
      } as CryptoPrices, {
        headers: { 'Cache-Control': 'public, max-age=30' }
      });
    }

    // Fallback to Coinbase
    const cbData = await fetchFromCoinbase();
    if (cbData && cbData.btc > 0) {
      return NextResponse.json({
        btc: cbData.btc,
        eth: cbData.eth,
        lastUpdated: new Date().toISOString()
      } as CryptoPrices, {
        headers: { 'Cache-Control': 'public, max-age=30' }
      });
    }

    // Fallback to Binance
    const bnData = await fetchFromBinance();
    if (bnData && bnData.btc > 0) {
      return NextResponse.json({
        btc: bnData.btc,
        eth: bnData.eth,
        lastUpdated: new Date().toISOString()
      } as CryptoPrices, {
        headers: { 'Cache-Control': 'public, max-age=30' }
      });
    }

    throw new Error('All price APIs failed');
  } catch (error) {
    console.error('Crypto prices error:', error);
    return NextResponse.json({
      btc: 0,
      eth: 0,
      lastUpdated: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 200 }); // Return 200 with zero prices instead of 500
  }
}
