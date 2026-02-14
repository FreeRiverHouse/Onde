import { useState, useEffect, useRef } from 'react'
import { Activity, ShieldCheck, Zap, DollarSign, TrendingUp, AlertTriangle } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, Legend } from 'recharts'
import './index.css'

function App() {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [history, setHistory] = useState([])
  const [tradeHistory, setTradeHistory] = useState([])
  const historyRef = useRef([])

  useEffect(() => {
    // Load trade history from autotrader logs
    const loadTradeHistory = async () => {
      try {
        const res = await fetch('/api/health')
        const json = await res.json()
        if (json.recent_trades && json.recent_trades.length > 0) {
          // Build cumulative PnL and win rate over time from recent trades
          const trades = [...json.recent_trades].reverse() // oldest first
          let cumPnl = 0
          let wins = 0
          let total = 0
          const tradeData = trades.map((t, i) => {
            total++
            const isWin = (t.result_status || '').toLowerCase().includes('win') || 
                          (t.result_status || '').toLowerCase().includes('won')
            if (isWin) {
              wins++
              cumPnl += (100 - (t.price_cents || 0))
            } else {
              cumPnl -= (t.price_cents || 0)
            }
            return {
              trade: i + 1,
              time: new Date(t.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
              pnl: cumPnl / 100,
              winRate: total > 0 ? (wins / total * 100) : 0,
              ticker: t.ticker || '',
              side: t.side || '',
              price: t.price_cents || 0,
              result: isWin ? 'WIN' : 'LOSS',
              edge: ((t.edge || 0) * 100).toFixed(1),
            }
          })
          setTradeHistory(tradeData)
        }
      } catch (e) {
        console.error('Failed to load trade history:', e)
      }
    }

    loadTradeHistory()
  }, [])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/health')
        const json = await res.json()
        setData(json)
        setError(null)

        // Add to time-series history (every poll)
        const now = new Date()
        const point = {
          time: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          timestamp: now.getTime(),
          winRate: json.win_rate_today || 0,
          pnl: (json.pnl_today_cents || 0) / 100,
          trades: json.trades_today || 0,
          positions: json.positions_count || 0,
          losses: json.consecutive_losses || 0,
        }
        
        // Keep last 300 data points (~5 min at 1s interval)
        historyRef.current = [...historyRef.current.slice(-299), point]
        setHistory([...historyRef.current])

        // Refresh trade history every 30 seconds
        if (historyRef.current.length % 30 === 0) {
          if (json.recent_trades && json.recent_trades.length > 0) {
            const trades = [...json.recent_trades].reverse()
            let cumPnl = 0, wins = 0, total = 0
            const tradeData = trades.map((t, i) => {
              total++
              const isWin = (t.result_status || '').toLowerCase().includes('win') || 
                            (t.result_status || '').toLowerCase().includes('won')
              if (isWin) { wins++; cumPnl += (100 - (t.price_cents || 0)) }
              else { cumPnl -= (t.price_cents || 0) }
              return {
                trade: i + 1,
                time: new Date(t.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                pnl: cumPnl / 100,
                winRate: total > 0 ? (wins / total * 100) : 0,
                ticker: t.ticker || '',
                side: t.side || '',
                price: t.price_cents || 0,
                result: isWin ? 'WIN' : 'LOSS',
                edge: ((t.edge || 0) * 100).toFixed(1),
              }
            })
            setTradeHistory(tradeData)
          }
        }
      } catch (err) {
        setError(err.message)
      }
    }

    fetchData()
    const interval = setInterval(fetchData, 1000)
    return () => clearInterval(interval)
  }, [])

  if (error) return (
    <div className="error-screen">
      <AlertTriangle className="w-12 h-12 mb-4" />
      <h1>Connection Error</h1>
      <p>Ensure Autotrader is running on port 8089</p>
      <p className="error-detail">{error}</p>
    </div>
  )

  if (!data) return (
    <div className="loading-screen">
      <Activity className="animate-spin w-12 h-12" />
      <p>Connecting to Autotrader...</p>
    </div>
  )

  const statusText = data.dry_run ? '🧪 PAPER MODE' : 
    (data.circuit_breaker_active ? '⏸️ PAUSED' : '✅ LIVE')

  return (
    <div className="dashboard-container">
      <header className="header">
        <div className="header-left">
          <Zap className="icon text-purple-400" />
          <h1>Kalshi Autotrader <span className="version">v2</span></h1>
        </div>
        <div className={`status-badge ${data.dry_run ? 'paper' : (data.is_running ? 'running' : 'stopped')}`}>
          <div className="pulsing-dot"></div>
          {statusText}
        </div>
      </header>

      {/* Metric Cards */}
      <div className="grid-3">
        <div className="card">
          <div className="card-header">
            <DollarSign className="icon text-green-400" />
            <span>Today's PnL</span>
          </div>
          <div className={`metric-value ${(data.pnl_today_cents || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {data.pnl_today_cents > 0 ? '+' : ''}${((data.pnl_today_cents || 0) / 100).toFixed(2)}
          </div>
          <div className="metric-sub">Balance: ${((data.cash_cents || 0) / 100).toFixed(2)}</div>
        </div>

        <div className="card">
          <div className="card-header">
            <TrendingUp className="icon text-blue-400" />
            <span>Win Rate</span>
          </div>
          <div className={`metric-value ${(data.win_rate_today || 0) >= 50 ? 'text-green-400' : 'text-yellow-400'}`}>
            {(data.win_rate_today || 0).toFixed(1)}%
          </div>
          <div className="metric-sub">
            {data.trades_today || 0} trades · {data.today_won || 0}W / {data.today_lost || 0}L
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <ShieldCheck className="icon text-yellow-400" />
            <span>Risk</span>
          </div>
          <div className="metric-value">{data.positions_count || 0} <span className="metric-unit">pos</span></div>
          <div className="metric-sub">
            Streak: {data.consecutive_losses || 0} losses
            {data.circuit_breaker_active && <span className="pill warning">BREAKER</span>}
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid-2">
        {/* Cumulative PnL Chart */}
        <div className="card chart-card">
          <div className="card-header">
            <DollarSign className="icon text-green-400" />
            <span>Cumulative PnL (Trade History)</span>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={tradeHistory}>
              <defs>
                <linearGradient id="pnlGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00ff9d" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#00ff9d" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="pnlGradNeg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ff4757" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#ff4757" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="trade" stroke="#666" fontSize={11} label={{ value: 'Trade #', position: 'insideBottom', offset: -5, fill: '#666' }} />
              <YAxis stroke="#666" fontSize={11} tickFormatter={(v) => `$${v.toFixed(2)}`} />
              <Tooltip 
                contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                formatter={(v, name) => [`$${v.toFixed(2)}`, 'PnL']}
                labelFormatter={(v) => `Trade #${v}`}
              />
              <Area type="monotone" dataKey="pnl" stroke="#00ff9d" fill="url(#pnlGrad)" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Win Rate Evolution Chart */}
        <div className="card chart-card">
          <div className="card-header">
            <TrendingUp className="icon text-blue-400" />
            <span>Win Rate Evolution</span>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={tradeHistory}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="trade" stroke="#666" fontSize={11} label={{ value: 'Trade #', position: 'insideBottom', offset: -5, fill: '#666' }} />
              <YAxis stroke="#666" fontSize={11} domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
              <Tooltip 
                contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                formatter={(v, name) => [`${v.toFixed(1)}%`, 'Win Rate']}
                labelFormatter={(v) => `Trade #${v}`}
              />
              {/* 50% reference line */}
              <Line type="monotone" dataKey={() => 50} stroke="rgba(255,255,255,0.15)" strokeDasharray="5 5" dot={false} name="50%" />
              <Line type="monotone" dataKey="winRate" stroke="#00d2ff" strokeWidth={2} dot={false} name="Win Rate" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Real-time session chart */}
      <div className="card chart-card wide">
        <div className="card-header">
          <Activity className="icon text-purple-400" />
          <span>Live Session (positions & losses)</span>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={history.filter((_, i) => i % 5 === 0)}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="time" stroke="#666" fontSize={10} interval="preserveStartEnd" />
            <YAxis stroke="#666" fontSize={11} />
            <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} />
            <Legend />
            <Line type="monotone" dataKey="positions" stroke="#bd00ff" strokeWidth={2} dot={false} name="Positions" />
            <Line type="monotone" dataKey="losses" stroke="#ff4757" strokeWidth={2} dot={false} name="Consec. Losses" />
            <Line type="monotone" dataKey="trades" stroke="#00ff9d" strokeWidth={2} dot={false} name="Trades Today" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Recent Trades Table */}
      <div className="card wide">
        <div className="card-header">
          <Activity className="icon text-purple-400" />
          <span>Recent Trades</span>
        </div>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Time</th>
                <th>Ticker</th>
                <th>Side</th>
                <th>Price</th>
                <th>Edge</th>
                <th>Result</th>
              </tr>
            </thead>
            <tbody>
              {data.recent_trades && data.recent_trades.length > 0 ? (
                data.recent_trades.map((trade, i) => {
                  const isWin = (trade.result_status || '').toLowerCase().includes('win') || 
                                (trade.result_status || '').toLowerCase().includes('won')
                  return (
                    <tr key={i}>
                      <td>{new Date(trade.timestamp).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                      <td className="font-mono">{(trade.ticker || '').slice(0, 25)}</td>
                      <td className={trade.side === 'yes' ? 'text-green-400' : 'text-red-400'}>
                        {(trade.side || '').toUpperCase()}
                      </td>
                      <td>{trade.price_cents}¢</td>
                      <td>{((trade.edge || 0) * 100).toFixed(0)}%</td>
                      <td>
                        <span className={`status-pill ${isWin ? 'win' : 'loss'}`}>
                          {isWin ? 'WIN' : 'LOSS'}
                        </span>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan="6" className="text-center text-gray-500 py-4">No recent trades</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <footer className="footer">
        <span>Cycle #{data.cycle_count || 0}</span>
        <span>Uptime: {data.uptime_human || 'N/A'}</span>
        <span>Last: {data.last_cycle_time ? new Date(data.last_cycle_time).toLocaleTimeString() : 'N/A'}</span>
      </footer>
    </div>
  )
}

export default App
