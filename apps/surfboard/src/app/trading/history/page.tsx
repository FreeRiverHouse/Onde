'use client'

export const runtime = 'edge';

import { useState, useEffect, useCallback } from 'react';
import { 
  ArrowLeft,
  ArrowRight,
  Filter,
  Download,
  FileJson,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Clock,
  X
} from 'lucide-react';
import Link from 'next/link';

interface Trade {
  timestamp: string;
  ticker: string;
  side: string;
  asset?: string;
  contracts?: number;
  price_cents?: number;
  cost_cents?: number;
  edge?: number;
  result_status?: string;
  pnl_cents?: number;
  minutes_to_expiry?: number;
  reason?: string;
  regime?: string;
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

export default function TradeHistoryPage() {
  const [data, setData] = useState<PaginatedResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Pagination
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  
  // Filters
  const [resultFilter, setResultFilter] = useState('all');
  const [assetFilter, setAssetFilter] = useState('all');
  const [sideFilter, setSideFilter] = useState('all');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const fetchTrades = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      
      if (resultFilter !== 'all') params.append('result', resultFilter);
      if (assetFilter !== 'all') params.append('asset', assetFilter);
      if (sideFilter !== 'all') params.append('side', sideFilter);
      if (fromDate) params.append('from', fromDate);
      if (toDate) params.append('to', toDate);
      
      const response = await fetch(`/api/trading/history?${params}`);
      if (!response.ok) throw new Error('Failed to fetch trades');
      
      const json = await response.json();
      setData(json);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [page, limit, resultFilter, assetFilter, sideFilter, fromDate, toDate]);

  useEffect(() => {
    fetchTrades();
  }, [fetchTrades]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [resultFilter, assetFilter, sideFilter, fromDate, toDate]);

  const handleExportCSV = () => {
    if (!data?.trades.length) return;
    
    const headers = ['Timestamp', 'Ticker', 'Asset', 'Side', 'Price', 'Contracts', 'Edge%', 'Result', 'PnL'];
    const rows = data.trades.map(t => [
      t.timestamp,
      t.ticker,
      t.asset || 'BTC',
      t.side,
      t.price_cents,
      t.contracts || 1,
      t.edge ? (t.edge * 100).toFixed(1) : '',
      t.result_status || 'pending',
      t.pnl_cents != null ? t.pnl_cents : ''
    ]);
    
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `trades-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportJSON = () => {
    if (!data?.trades.length) return;
    
    const exportData = {
      exported_at: new Date().toISOString(),
      total_trades: data.pagination.total,
      filters: data.filters,
      trades: data.trades.map(t => ({
        timestamp: t.timestamp,
        ticker: t.ticker,
        asset: t.asset || 'BTC',
        side: t.side,
        price_cents: t.price_cents,
        contracts: t.contracts || 1,
        edge: t.edge,
        result_status: t.result_status || 'pending',
        pnl_cents: t.pnl_cents,
        minutes_to_expiry: t.minutes_to_expiry,
        reason: t.reason,
        regime: t.regime
      }))
    };
    
    const json = JSON.stringify(exportData, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `trades-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatPnl = (cents: number | null | undefined) => {
    if (cents == null) return '—';
    const dollars = cents / 100;
    return dollars >= 0 ? `+$${dollars.toFixed(2)}` : `-$${Math.abs(dollars).toFixed(2)}`;
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/betting" className="text-gray-400 hover:text-white transition">
              <ArrowLeft size={20} />
            </Link>
            <h1 className="text-lg font-semibold">Trade History</h1>
            {data && (
              <span className="text-sm text-gray-400">
                {data.pagination.total} trades
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2 rounded transition ${showFilters ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'}`}
            >
              <Filter size={18} />
            </button>
            <button
              onClick={handleExportCSV}
              disabled={!data?.trades.length}
              className="p-2 bg-gray-700 hover:bg-gray-600 rounded transition disabled:opacity-50"
              title="Export CSV"
            >
              <Download size={18} />
            </button>
            <button
              onClick={handleExportJSON}
              disabled={!data?.trades.length}
              className="p-2 bg-gray-700 hover:bg-gray-600 rounded transition disabled:opacity-50"
              title="Export JSON"
            >
              <FileJson size={18} />
            </button>
            <button
              onClick={fetchTrades}
              disabled={loading}
              className="p-2 bg-gray-700 hover:bg-gray-600 rounded transition disabled:opacity-50"
            >
              <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>
        
        {/* Filters */}
        {showFilters && (
          <div className="border-t border-gray-700 bg-gray-850 px-4 py-3">
            <div className="max-w-6xl mx-auto flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-400">Result:</label>
                <select
                  value={resultFilter}
                  onChange={(e) => setResultFilter(e.target.value)}
                  className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm"
                >
                  <option value="all">All</option>
                  <option value="won">Won</option>
                  <option value="lost">Lost</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
              
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-400">Asset:</label>
                <select
                  value={assetFilter}
                  onChange={(e) => setAssetFilter(e.target.value)}
                  className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm"
                >
                  <option value="all">All</option>
                  <option value="BTC">BTC</option>
                  <option value="ETH">ETH</option>
                </select>
              </div>
              
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-400">Side:</label>
                <select
                  value={sideFilter}
                  onChange={(e) => setSideFilter(e.target.value)}
                  className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm"
                >
                  <option value="all">All</option>
                  <option value="YES">YES</option>
                  <option value="NO">NO</option>
                </select>
              </div>
              
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-400">From:</label>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm"
                />
              </div>
              
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-400">To:</label>
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm"
                />
              </div>
              
              {(resultFilter !== 'all' || assetFilter !== 'all' || sideFilter !== 'all' || fromDate || toDate) && (
                <button
                  onClick={() => {
                    setResultFilter('all');
                    setAssetFilter('all');
                    setSideFilter('all');
                    setFromDate('');
                    setToDate('');
                  }}
                  className="flex items-center gap-1 text-sm text-gray-400 hover:text-white"
                >
                  <X size={14} /> Clear
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-4 py-6">
        {error && (
          <div className="bg-red-900/50 border border-red-700 rounded p-4 mb-6">
            {error}
          </div>
        )}

        {loading && !data ? (
          <div className="text-center py-12 text-gray-400">Loading trades...</div>
        ) : data?.trades.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            No trades found with current filters
          </div>
        ) : (
          <>
            {/* Trade Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-sm text-gray-400 border-b border-gray-700">
                    <th className="pb-3 font-medium">Time</th>
                    <th className="pb-3 font-medium">Ticker</th>
                    <th className="pb-3 font-medium">Asset</th>
                    <th className="pb-3 font-medium">Side</th>
                    <th className="pb-3 font-medium text-right">Price</th>
                    <th className="pb-3 font-medium text-right">Edge</th>
                    <th className="pb-3 font-medium text-center">Result</th>
                    <th className="pb-3 font-medium text-right">PnL</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.trades.map((trade, i) => (
                    <tr 
                      key={`${trade.timestamp}-${i}`}
                      className="border-b border-gray-800 hover:bg-gray-800/50 transition"
                    >
                      <td className="py-3 text-sm">
                        <span className="text-gray-300">{formatTime(trade.timestamp)}</span>
                      </td>
                      <td className="py-3">
                        <span className="font-mono text-sm text-gray-200">
                          {trade.ticker?.replace('KXBTCD-', 'BTC-').replace('KXETHD-', 'ETH-').slice(0, 20)}
                        </span>
                      </td>
                      <td className="py-3">
                        <span className={`text-sm font-medium ${
                          trade.asset === 'ETH' ? 'text-purple-400' : 'text-orange-400'
                        }`}>
                          {trade.asset || 'BTC'}
                        </span>
                      </td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                          trade.side === 'YES' 
                            ? 'bg-green-900/50 text-green-400' 
                            : 'bg-red-900/50 text-red-400'
                        }`}>
                          {trade.side}
                        </span>
                      </td>
                      <td className="py-3 text-right text-sm">
                        {trade.price_cents}¢
                      </td>
                      <td className="py-3 text-right text-sm">
                        {trade.edge ? `${(trade.edge * 100).toFixed(1)}%` : '—'}
                      </td>
                      <td className="py-3 text-center">
                        {trade.result_status === 'won' ? (
                          <span className="inline-flex items-center gap-1 text-green-400">
                            <TrendingUp size={14} /> Won
                          </span>
                        ) : trade.result_status === 'lost' ? (
                          <span className="inline-flex items-center gap-1 text-red-400">
                            <TrendingDown size={14} /> Lost
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-gray-400">
                            <Clock size={14} /> Pending
                          </span>
                        )}
                      </td>
                      <td className="py-3 text-right">
                        <span className={`font-medium ${
                          trade.pnl_cents == null ? 'text-gray-500' :
                          trade.pnl_cents >= 0 ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {formatPnl(trade.pnl_cents)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {data && data.pagination.totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-800">
                <div className="text-sm text-gray-400">
                  Page {data.pagination.page} of {data.pagination.totalPages}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={!data.pagination.hasPrev}
                    className="flex items-center gap-1 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded transition disabled:opacity-50 disabled:hover:bg-gray-700"
                  >
                    <ArrowLeft size={16} /> Prev
                  </button>
                  <button
                    onClick={() => setPage(p => p + 1)}
                    disabled={!data.pagination.hasNext}
                    className="flex items-center gap-1 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded transition disabled:opacity-50 disabled:hover:bg-gray-700"
                  >
                    Next <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
