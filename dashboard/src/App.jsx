
import { useState, useEffect } from 'react'
import { Activity, ShieldCheck, Zap, DollarSign, TrendingUp, AlertTriangle, Play, Pause, Thermometer, Wind, CloudRain, Briefcase } from 'lucide-react'
import './index.css'

function App() {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('http://localhost:8089/health')
        const json = await res.json()
        setData(json)
        setError(null)
      } catch (err) {
        setError(err.message)
      }
    }

    fetchData()
    const interval = setInterval(fetchData, 1000)
    return () => clearInterval(interval)
  }, [])

  if (error) return (
    <div className="flex items-center justify-center min-h-screen bg-black text-red-500">
      <AlertTriangle className="w-12 h-12 mb-4" />
      <h1 className="text-2xl font-bold">Connection Error</h1>
      <p>Ensure Autotrader is running on port 8089</p>
    </div>
  )

  if (!data) return (
    <div className="flex items-center justify-center min-h-screen bg-black text-green-500">
      <Activity className="animate-spin w-12 h-12" />
    </div>
  )

  // Determine status color
  const statusColor = data.is_running
    ? (data.circuit_breaker_active ? 'text-yellow-400' : 'text-green-400')
    : 'text-red-400'

  const statusText = data.is_running
    ? (data.circuit_breaker_active ? 'PAUSED (Circuit Breaker)' : 'LIVE')
    : 'STOPPED'

  return (
    <div className="dashboard-container">
      <header className="header">
        <div className="logo">
          <Zap className="icon text-purple-400" />
          <h1>Kalshi Autotrader <span className="version">v2.0</span></h1>
        </div>
        <div className={`status-badge ${data.is_running ? 'running' : 'stopped'}`}>
          <div className="pulsing-dot"></div>
          {statusText}
        </div>
      </header>

      <div className="grid-container">
        {/* Metrics Cards */}
        <div className="card metric-card">
          <div className="card-header">
            <DollarSign className="icon text-green-400" />
            <h3>Today's PnL</h3>
          </div>
          <div className="metric-value">
            {data.pnl_today_cents > 0 ? '+' : ''}{(data.pnl_today_cents / 100).toFixed(2)}
            <span className="unit">$</span>
          </div>
          <div className="metric-sub">
            Balance: ${(data.cash_cents / 100).toFixed(2)}
          </div>
        </div>

        <div className="card metric-card">
          <div className="card-header">
            <TrendingUp className="icon text-blue-400" />
            <h3>Performance</h3>
          </div>
          <div className="metric-value">
            {data.trades_today} <span className="text-lg">Trades</span>
          </div>
          <div className="metric-sub">
            Win Rate: {data.win_rate_today ? data.win_rate_today.toFixed(1) : 0}%
            <span className={`pill ${data.win_rate_today > 50 ? 'good' : 'bad'}`}>
              {data.today_won}W - {data.today_lost}L
            </span>
          </div>
        </div>

        <div className="card metric-card">
          <div className="card-header">
            <ShieldCheck className="icon text-yellow-400" />
            <h3>Risk Status</h3>
          </div>
          <div className="metric-value">
            {data.positions_count || 0} <span className="text-lg">Positions</span>
          </div>
          <div className="metric-sub">
            Loss Streak: {data.consecutive_losses}
            {data.circuit_breaker_active && <span className="pill warning">BREAKER ACTIVE</span>}
          </div>
        </div>

        {/* Recent Trades List */}
        <div className="card wide-card trades-list">
          <div className="card-header">
            <Activity className="icon text-purple-400" />
            <h3>Recent Executions</h3>
          </div>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Ticker</th>
                  <th>Side</th>
                  <th>Price</th>
                  <th>Outcome</th>
                </tr>
              </thead>
              <tbody>
                {data.recent_trades && data.recent_trades.length > 0 ? (
                  data.recent_trades.map((trade, i) => (
                    <tr key={i}>
                      <td>{new Date(trade.timestamp).toLocaleTimeString()}</td>
                      <td className="font-mono">{trade.ticker}</td>
                      <td className={trade.side === 'yes' ? 'text-green-400' : 'text-red-400'}>
                        {trade.side.toUpperCase()}
                      </td>
                      <td>{trade.price_cents}¢</td>
                      <td>
                        <span className={`status-pill ${trade.status || 'pending'}`}>
                          {trade.status || 'PENDING'}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center text-gray-500 py-4">No recent trades</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
