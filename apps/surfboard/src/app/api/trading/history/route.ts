import { NextResponse } from 'next/server';
import { readFileSync, existsSync } from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

interface Trade {
  timestamp: string;
  type: string;
  ticker: string;
  side: string;
  asset?: string;
  contracts?: number;
  price_cents?: number;
  cost_cents?: number;
  edge?: number;
  our_prob?: number;
  market_prob?: number;
  strike?: number;
  current_price?: number;
  order_status?: string;
  result_status?: string;
  minutes_to_expiry?: number;
  latency_ms?: number;
  reason?: string;
  regime?: string;
  momentum?: number;
  volatility?: number;
  sentiment?: number;
}

interface PaginatedResponse {
  trades: Trade[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  filters: {
    result?: string;
    asset?: string;
    side?: string;
    from?: string;
    to?: string;
  };
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Pagination params
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20')));
    
    // Filter params
    const resultFilter = searchParams.get('result'); // won, lost, pending, all
    const assetFilter = searchParams.get('asset');   // BTC, ETH
    const sideFilter = searchParams.get('side');     // YES, NO
    const fromDate = searchParams.get('from');       // ISO date string
    const toDate = searchParams.get('to');           // ISO date string
    
    // Sort params
    const sortBy = searchParams.get('sort') || 'timestamp';
    const sortOrder = searchParams.get('order') || 'desc';

    const tradesPath = path.join(process.cwd(), '../../scripts/kalshi-trades.jsonl');
    
    if (!existsSync(tradesPath)) {
      return NextResponse.json({ 
        error: 'Trades file not found',
        path: tradesPath 
      }, { status: 404 });
    }

    const content = readFileSync(tradesPath, 'utf-8');
    const lines = content.trim().split('\n').filter(Boolean);
    
    // Parse all executed trades
    let trades: Trade[] = [];
    for (const line of lines) {
      try {
        const entry = JSON.parse(line);
        if (entry.type === 'trade' && entry.order_status === 'executed') {
          trades.push(entry);
        }
      } catch {
        // Skip invalid JSON lines
      }
    }

    // Apply filters
    if (resultFilter && resultFilter !== 'all') {
      trades = trades.filter(t => {
        if (resultFilter === 'pending') {
          return !t.result_status || t.result_status === 'pending';
        }
        return t.result_status === resultFilter;
      });
    }

    if (assetFilter) {
      trades = trades.filter(t => {
        // Infer asset from ticker if not explicitly set
        const asset = t.asset || (t.ticker?.includes('ETH') ? 'ETH' : 'BTC');
        return asset.toUpperCase() === assetFilter.toUpperCase();
      });
    }

    if (sideFilter) {
      trades = trades.filter(t => t.side?.toUpperCase() === sideFilter.toUpperCase());
    }

    if (fromDate) {
      const fromTimestamp = new Date(fromDate).getTime();
      trades = trades.filter(t => new Date(t.timestamp).getTime() >= fromTimestamp);
    }

    if (toDate) {
      const toTimestamp = new Date(toDate).getTime() + 86400000; // Include full day
      trades = trades.filter(t => new Date(t.timestamp).getTime() < toTimestamp);
    }

    // Sort trades
    trades.sort((a, b) => {
      let aVal: number | string = 0;
      let bVal: number | string = 0;
      
      switch (sortBy) {
        case 'timestamp':
          aVal = new Date(a.timestamp).getTime();
          bVal = new Date(b.timestamp).getTime();
          break;
        case 'price':
          aVal = a.price_cents || 0;
          bVal = b.price_cents || 0;
          break;
        case 'edge':
          aVal = a.edge || 0;
          bVal = b.edge || 0;
          break;
        case 'pnl':
          // Calculate PnL for sorting
          const aPnl = a.result_status === 'won' ? (100 - (a.price_cents || 0)) * (a.contracts || 1)
                     : a.result_status === 'lost' ? -((a.price_cents || 0) * (a.contracts || 1))
                     : 0;
          const bPnl = b.result_status === 'won' ? (100 - (b.price_cents || 0)) * (b.contracts || 1)
                     : b.result_status === 'lost' ? -((b.price_cents || 0) * (b.contracts || 1))
                     : 0;
          aVal = aPnl;
          bVal = bPnl;
          break;
        default:
          aVal = new Date(a.timestamp).getTime();
          bVal = new Date(b.timestamp).getTime();
      }
      
      return sortOrder === 'asc' ? (aVal > bVal ? 1 : -1) : (aVal < bVal ? 1 : -1);
    });

    // Calculate pagination
    const total = trades.length;
    const totalPages = Math.ceil(total / limit);
    const offset = (page - 1) * limit;
    
    // Slice for current page
    const paginatedTrades = trades.slice(offset, offset + limit);

    // Add calculated PnL to each trade for display
    const tradesWithPnl = paginatedTrades.map(t => ({
      ...t,
      pnl_cents: t.result_status === 'won' ? (100 - (t.price_cents || 0)) * (t.contracts || 1)
               : t.result_status === 'lost' ? -((t.price_cents || 0) * (t.contracts || 1))
               : null,
      asset: t.asset || (t.ticker?.includes('ETH') ? 'ETH' : 'BTC'),
    }));

    const response: PaginatedResponse = {
      trades: tradesWithPnl,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
      filters: {
        result: resultFilter || undefined,
        asset: assetFilter || undefined,
        side: sideFilter || undefined,
        from: fromDate || undefined,
        to: toDate || undefined,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error reading trades:', error);
    return NextResponse.json({ 
      error: 'Failed to read trades',
      details: String(error)
    }, { status: 500 });
  }
}
