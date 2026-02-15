import { NextResponse } from 'next/server';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

// Paper trading state API - fetches from GitHub Gist or returns cached state
// For production, this reads from a periodically-updated gist

// The paper trading state gist URL
const PAPER_TRADE_GIST_URL = 'https://gist.githubusercontent.com/FreeRiverHouse/43b0815cc640bba8ac799ecb27434579/raw/paper-trade-state.json';

interface PaperTradeState {
  session_id: string;
  started_at: string;
  starting_balance_cents: number;
  current_balance_cents: number;
  mode: 'paper' | 'live';
  strategy_version: string;
  safety_guards: {
    min_forecast_strike_gap: number;
    max_market_conviction: number;
    min_our_prob: number;
    uncertainty_override: number;
    kelly_fraction: number;
    min_edge: number;
  };
  stats: {
    total_trades: number;
    wins: number;
    losses: number;
    pending: number;
    win_rate: number;
    pnl_cents: number;
    gross_profit_cents: number;
    gross_loss_cents: number;
    current_streak: number;
    streak_type: 'win' | 'loss' | 'none';
    max_drawdown_cents: number;
    peak_balance_cents: number;
  };
  positions: Array<{
    ticker: string;
    side: string;
    contracts: number;
    price_cents: number;
    opened_at: string;
  }>;
  recent_trades: Array<{
    timestamp: string;
    ticker: string;
    asset: string;
    side: string;
    contracts: number;
    price_cents: number;
    result_status?: string;
    pnl_cents: number;
    edge: number;
    our_prob: number;
  }>;
  weather_stats: {
    trades: number;
    wins: number;
    losses: number;
    win_rate: number;
    pnl_cents: number;
    filtered_count: number;
    by_city: Record<string, { trades: number; wins: number; pnl_cents: number }>;
  };
  crypto_stats: {
    trades: number;
    wins: number;
    losses: number;
    win_rate: number;
    pnl_cents: number;
    by_asset: Record<string, { trades: number; wins: number; pnl_cents: number }>;
  };
  last_cycle: string | null;
  cycle_count: number;
  last_updated: string;
}

// Default state when no session exists
const DEFAULT_STATE: PaperTradeState = {
  session_id: 'not_started',
  started_at: new Date().toISOString(),
  starting_balance_cents: 5000,
  current_balance_cents: 5000,
  mode: 'paper',
  strategy_version: 'v2.1-improved',
  safety_guards: {
    min_forecast_strike_gap: 2.0,
    max_market_conviction: 0.85,
    min_our_prob: 0.05,
    uncertainty_override: 5.0,
    kelly_fraction: 0.03,
    min_edge: 0.12
  },
  stats: {
    total_trades: 0,
    wins: 0,
    losses: 0,
    pending: 0,
    win_rate: 0,
    pnl_cents: 0,
    gross_profit_cents: 0,
    gross_loss_cents: 0,
    current_streak: 0,
    streak_type: 'none',
    max_drawdown_cents: 0,
    peak_balance_cents: 5000
  },
  positions: [],
  recent_trades: [],
  weather_stats: {
    trades: 0,
    wins: 0,
    losses: 0,
    win_rate: 0,
    pnl_cents: 0,
    filtered_count: 0,
    by_city: {}
  },
  crypto_stats: {
    trades: 0,
    wins: 0,
    losses: 0,
    win_rate: 0,
    pnl_cents: 0,
    by_asset: {}
  },
  last_cycle: null,
  cycle_count: 0,
  last_updated: new Date().toISOString()
};

export async function GET() {
  try {
    // Try to fetch from gist
    const response = await fetch(PAPER_TRADE_GIST_URL, {
      next: { revalidate: 30 } // Cache for 30 seconds
    });
    
    if (!response.ok) {
      throw new Error(`Gist fetch failed: ${response.status}`);
    }
    
    const state: PaperTradeState = await response.json();
    
    // Calculate additional derived metrics
    const startedAt = new Date(state.started_at);
    const now = new Date();
    const hoursElapsed = (now.getTime() - startedAt.getTime()) / (1000 * 60 * 60);
    
    const returnPct = state.starting_balance_cents > 0 
      ? ((state.current_balance_cents - state.starting_balance_cents) / state.starting_balance_cents) * 100
      : 0;
    
    const profitFactor = state.stats.gross_loss_cents > 0
      ? state.stats.gross_profit_cents / state.stats.gross_loss_cents
      : state.stats.gross_profit_cents > 0 ? Infinity : 0;
    
    const maxDrawdownPct = state.stats.peak_balance_cents > 0
      ? (state.stats.max_drawdown_cents / state.stats.peak_balance_cents) * 100
      : 0;
    
    return NextResponse.json({
      ...state,
      // Derived metrics
      derived: {
        return_pct: returnPct,
        profit_factor: profitFactor,
        max_drawdown_pct: maxDrawdownPct,
        hours_elapsed: hoursElapsed,
        trades_per_hour: hoursElapsed > 0 ? state.stats.total_trades / hoursElapsed : 0,
        weather_vs_crypto: {
          weather_win_rate: state.weather_stats.win_rate,
          crypto_win_rate: state.crypto_stats.win_rate,
          better_performer: state.weather_stats.pnl_cents > state.crypto_stats.pnl_cents ? 'weather' : 'crypto'
        }
      },
      // API metadata
      api: {
        source: 'gist',
        fetched_at: new Date().toISOString(),
        gist_url: PAPER_TRADE_GIST_URL
      }
    });
    
  } catch (error) {
    // Return default state with error info
    console.error('Paper trade API error:', error);
    
    return NextResponse.json({
      ...DEFAULT_STATE,
      error: error instanceof Error ? error.message : 'Unknown error',
      api: {
        source: 'default',
        fetched_at: new Date().toISOString(),
        error: true
      }
    });
  }
}
