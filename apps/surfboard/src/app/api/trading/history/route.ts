import { NextResponse } from 'next/server';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

// Trading history API - fetches settlement data from gist
// Individual trade-level data available through settlements

const TRADING_STATS_GIST_URL = 'https://gist.githubusercontent.com/FreeRiverHouse/43b0815cc640bba8ac799ecb27434579/raw/onde-trading-stats.json';

interface Settlement {
  totalSettled: number;
  totalPending: number;
  totalWon: number;
  totalLost: number;
  winRate: number;
  totalPnlCents: number;
  totalPayoutCents: number;
  byAsset: Record<string, {
    settled: number;
    won: number;
    lost: number;
    pending: number;
    pnlCents: number;
  }>;
  lastSettlementTime: string | null;
}

interface GistData {
  totalTrades: number;
  winRate: number;
  pnlCents: number;
  settlements?: {
    v1: Settlement;
    v2: Settlement;
    combined: Settlement;
  };
  winRateTrend?: {
    data: Array<{
      date: string;
      winRate: number;
      dailyWinRate: number;
      trades: number;
      won: number;
      lost: number;
      pnlCents: number;
    }>;
  };
  lastUpdated: string;
}

async function fetchTradeDataFromGist(): Promise<GistData | null> {
  try {
    const response = await fetch(TRADING_STATS_GIST_URL, {
      headers: { 'Accept': 'application/json' },
      next: { revalidate: 120 }
    });
    
    if (!response.ok) return null;
    return await response.json();
  } catch (e) {
    console.error('Failed to fetch trade data from gist:', e);
    return null;
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '20', 10);
  const source = searchParams.get('source') || 'combined';
  
  const gistData = await fetchTradeDataFromGist();
  
  if (gistData) {
    // Build trade-like records from winRateTrend (daily aggregates)
    const dailyTrades = gistData.winRateTrend?.data || [];
    const settlements = gistData.settlements;
    
    // Create aggregate trade records from daily data
    const tradeRecords = dailyTrades.map((day, index) => ({
      id: `day-${index}`,
      timestamp: `${day.date}T12:00:00Z`,
      type: 'daily_aggregate',
      date: day.date,
      trades: day.trades,
      won: day.won,
      lost: day.lost,
      winRate: day.winRate,
      dailyWinRate: day.dailyWinRate,
      pnl_cents: day.pnlCents,
    }));
    
    // Paginate
    const total = tradeRecords.length;
    const totalPages = Math.ceil(total / limit);
    const start = (page - 1) * limit;
    const paginatedTrades = tradeRecords.slice(start, start + limit);
    
    return NextResponse.json({
      trades: paginatedTrades,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
      settlements: settlements ? {
        v1: settlements.v1,
        v2: settlements.v2,
        combined: settlements.combined,
      } : null,
      summary: {
        totalTrades: gistData.totalTrades,
        winRate: gistData.winRate,
        pnlCents: gistData.pnlCents,
      },
      filters: { source },
      source: 'gist',
      lastUpdated: gistData.lastUpdated,
    }, {
      headers: {
        'Cache-Control': 'public, max-age=120, stale-while-revalidate=300',
        'X-Data-Source': 'gist'
      }
    });
  }

  // Fallback
  return NextResponse.json({
    trades: [],
    pagination: {
      page: 1,
      limit: 20,
      total: 0,
      totalPages: 0,
      hasNext: false,
      hasPrev: false,
    },
    filters: {},
    source: 'fallback',
    notice: 'Trade data unavailable from gist. Check gist push script.',
  }, {
    headers: {
      'Cache-Control': 'no-cache',
      'X-Data-Source': 'fallback'
    }
  });
}
