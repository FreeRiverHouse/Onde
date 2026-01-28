'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Wallet, 
  BarChart3, 
  Send, 
  RefreshCw,
  ExternalLink,
  Trash2,
  MessageSquare,
  Link as LinkIcon,
  Terminal,
  Activity,
  Zap,
  Target,
  Cpu,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Flame,
  History
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';

// ============== TYPES ==============
interface KalshiPosition {
  ticker: string;
  position: number;
  exposure: number;
  pnl?: number;
}

interface KalshiStatus {
  cash: number;
  portfolioValue: number;
  positions: KalshiPosition[];
  btcPrice: number;
  ethPrice: number;
  lastUpdated: string;
  error?: string;
}

interface CryptoPrices {
  btc: number;
  eth: number;
  btc24hChange?: number;
  eth24hChange?: number;
  lastUpdated: string;
}

interface InboxMessage {
  id: string;
  content: string;
  type: 'message' | 'link' | 'command';
  timestamp: string;
  processed: boolean;
}

interface InboxData {
  messages: InboxMessage[];
  lastUpdated: string;
}

interface Fill {
  ticker: string;
  side: 'yes' | 'no';
  action: 'buy' | 'sell';
  count: number;
  price: number;
  cost: number;
  timestamp: string;
  orderId: string;
  tradeId: string;
}

interface FillsData {
  fills: Fill[];
  lastBet: Fill | null;
  portfolioHistory: Array<{
    timestamp: string;
    value: number;
  }>;
  error?: string;
}

// ============== ANIMATED NUMBER COMPONENT ==============
function AnimatedNumber({ 
  value, 
  prefix = '', 
  suffix = '',
  decimals = 2,
  className = '',
  glowColor = 'cyan'
}: { 
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  className?: string;
  glowColor?: 'cyan' | 'green' | 'red' | 'purple' | 'orange';
}) {
  const [displayValue, setDisplayValue] = useState(value);
  const [isAnimating, setIsAnimating] = useState(false);
  const prevValue = useRef(value);

  useEffect(() => {
    if (prevValue.current !== value) {
      setIsAnimating(true);
      const startValue = prevValue.current;
      const endValue = value;
      const duration = 1000;
      const startTime = Date.now();

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const current = startValue + (endValue - startValue) * easeOut;
        setDisplayValue(current);

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          setIsAnimating(false);
          prevValue.current = value;
        }
      };

      requestAnimationFrame(animate);
    }
  }, [value]);

  const glowClasses = {
    cyan: 'text-cyan-400 drop-shadow-[0_0_20px_rgba(0,212,255,0.8)]',
    green: 'text-emerald-400 drop-shadow-[0_0_20px_rgba(0,255,136,0.8)]',
    red: 'text-red-400 drop-shadow-[0_0_20px_rgba(255,68,68,0.8)]',
    purple: 'text-purple-400 drop-shadow-[0_0_20px_rgba(168,85,247,0.8)]',
    orange: 'text-orange-400 drop-shadow-[0_0_20px_rgba(251,146,60,0.8)]'
  };

  return (
    <span className={`font-mono font-bold transition-all duration-300 ${glowClasses[glowColor]} ${isAnimating ? 'scale-105' : ''} ${className}`}>
      {prefix}{displayValue.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}{suffix}
    </span>
  );
}

// ============== GLASS CARD COMPONENT ==============
function GlassCard({ 
  children, 
  className = '',
  glowColor = 'cyan',
  pulse = false
}: { 
  children: React.ReactNode; 
  className?: string;
  glowColor?: 'cyan' | 'green' | 'purple' | 'orange' | 'red';
  pulse?: boolean;
}) {
  const glowStyles = {
    cyan: 'before:bg-gradient-to-r before:from-cyan-500/20 before:to-blue-500/20 hover:shadow-[0_0_40px_rgba(0,212,255,0.15)]',
    green: 'before:bg-gradient-to-r before:from-emerald-500/20 before:to-green-500/20 hover:shadow-[0_0_40px_rgba(0,255,136,0.15)]',
    purple: 'before:bg-gradient-to-r before:from-purple-500/20 before:to-pink-500/20 hover:shadow-[0_0_40px_rgba(168,85,247,0.15)]',
    orange: 'before:bg-gradient-to-r before:from-orange-500/20 before:to-amber-500/20 hover:shadow-[0_0_40px_rgba(251,146,60,0.15)]',
    red: 'before:bg-gradient-to-r before:from-red-500/20 before:to-rose-500/20 hover:shadow-[0_0_40px_rgba(255,68,68,0.15)]'
  };

  return (
    <div className={`
      relative overflow-hidden rounded-2xl
      bg-gradient-to-br from-white/[0.08] to-white/[0.02]
      backdrop-blur-xl
      border border-white/[0.08]
      transition-all duration-500 ease-out
      hover:border-white/[0.15]
      hover:from-white/[0.12] hover:to-white/[0.04]
      before:absolute before:inset-0 before:opacity-0 before:transition-opacity before:duration-500
      hover:before:opacity-100
      ${glowStyles[glowColor]}
      ${pulse ? 'animate-pulse-glow' : ''}
      ${className}
    `}>
      <div className="relative z-10">{children}</div>
    </div>
  );
}

// ============== STAT CARD COMPONENT ==============
function StatCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  trend,
  trendValue,
  glowColor = 'cyan',
  prefix = '',
  suffix = '',
  decimals = 2
}: { 
  title: string;
  value: number;
  subtitle?: string;
  icon: React.ComponentType<{ className?: string }>;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  glowColor?: 'cyan' | 'green' | 'purple' | 'orange' | 'red';
  prefix?: string;
  suffix?: string;
  decimals?: number;
}) {
  const iconColors = {
    cyan: 'text-cyan-400',
    green: 'text-emerald-400',
    purple: 'text-purple-400',
    orange: 'text-orange-400',
    red: 'text-red-400'
  };

  return (
    <GlassCard glowColor={glowColor} className="p-5">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-gray-400 text-xs font-medium uppercase tracking-wider">{title}</p>
          <div className="mt-2">
            <AnimatedNumber 
              value={value} 
              prefix={prefix}
              suffix={suffix}
              decimals={decimals}
              glowColor={glowColor}
              className="text-2xl md:text-3xl"
            />
          </div>
          {subtitle && (
            <p className="text-gray-500 text-xs mt-1">{subtitle}</p>
          )}
          {trendValue && (
            <div className={`flex items-center mt-2 text-sm font-medium ${
              trend === 'up' ? 'text-emerald-400' : 
              trend === 'down' ? 'text-red-400' : 'text-gray-400'
            }`}>
              {trend === 'up' ? <TrendingUp className="w-4 h-4 mr-1" /> : 
               trend === 'down' ? <TrendingDown className="w-4 h-4 mr-1" /> : null}
              {trendValue}
            </div>
          )}
        </div>
        <div className={`p-3 rounded-xl bg-gradient-to-br from-white/10 to-white/5 ${iconColors[glowColor]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </GlassCard>
  );
}

// ============== MINI CHART COMPONENT ==============
function MiniChart({ data, color = 'cyan' }: { data: number[]; color?: string }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  const colors = {
    cyan: 'stroke-cyan-400',
    green: 'stroke-emerald-400',
    orange: 'stroke-orange-400',
    purple: 'stroke-purple-400'
  };

  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * 100;
    const y = 100 - ((v - min) / range) * 100;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg viewBox="0 0 100 100" className="w-full h-12 opacity-60">
      <defs>
        <linearGradient id={`gradient-${color}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.3" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline
        points={points}
        fill="none"
        className={colors[color as keyof typeof colors]}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ============== PULSING DOT COMPONENT ==============
function PulsingDot({ color = 'green', label }: { color?: 'green' | 'red' | 'yellow'; label?: string }) {
  const colors = {
    green: 'bg-emerald-400 shadow-emerald-400/50',
    red: 'bg-red-400 shadow-red-400/50',
    yellow: 'bg-yellow-400 shadow-yellow-400/50'
  };

  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <div className={`w-2 h-2 rounded-full ${colors[color]} shadow-[0_0_10px_currentColor] animate-pulse`} />
        <div className={`absolute inset-0 w-2 h-2 rounded-full ${colors[color]} animate-ping opacity-75`} />
      </div>
      {label && <span className="text-xs text-gray-400">{label}</span>}
    </div>
  );
}

// ============== LAST BET CARD COMPONENT ==============
function LastBetCard({ lastBet }: { lastBet: Fill | null }) {
  if (!lastBet) {
    return (
      <GlassCard glowColor="orange" className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500/30 to-amber-500/30 flex items-center justify-center">
            <Flame className="w-5 h-5 text-orange-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold">Last Bet Placed</h2>
            <p className="text-xs text-gray-500">Most recent trade</p>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center py-8 text-gray-500">
          <Clock className="w-8 h-8 mb-3 opacity-30" />
          <p className="text-sm">No bets placed yet</p>
        </div>
      </GlassCard>
    );
  }

  // Parse ticker to extract info (e.g., KXBTCD-26JAN2803-T88499.99)
  const tickerParts = lastBet.ticker.split('-');
  const market = tickerParts[0] || lastBet.ticker;
  const strike = tickerParts[2]?.replace('T', '$') || '';
  
  // Calculate edge (simple estimate based on price vs 50%)
  const edge = Math.abs(50 - lastBet.price);
  
  const betTime = new Date(lastBet.timestamp);
  const timeAgo = getTimeAgo(betTime);

  return (
    <GlassCard glowColor="orange" className="p-6" pulse>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500/30 to-amber-500/30 flex items-center justify-center relative">
            <Flame className="w-5 h-5 text-orange-400" />
            <div className="absolute -top-1 -right-1">
              <PulsingDot color="green" />
            </div>
          </div>
          <div>
            <h2 className="text-lg font-bold">Last Bet Placed</h2>
            <p className="text-xs text-gray-500">{timeAgo}</p>
          </div>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-bold ${
          lastBet.side === 'yes' 
            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
            : 'bg-red-500/20 text-red-400 border border-red-500/30'
        }`}>
          {lastBet.side.toUpperCase()}
        </div>
      </div>

      {/* Bet Details Grid */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* Ticker */}
        <div className="bg-white/[0.03] rounded-xl p-4 border border-white/[0.05]">
          <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Market</p>
          <p className="text-white font-mono font-bold text-sm truncate" title={lastBet.ticker}>
            {market}
          </p>
          {strike && (
            <p className="text-orange-400 text-xs mt-1">{strike}</p>
          )}
        </div>

        {/* Price Paid */}
        <div className="bg-white/[0.03] rounded-xl p-4 border border-white/[0.05]">
          <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Price</p>
          <p className="text-cyan-400 font-mono font-bold text-2xl">
            {lastBet.price}¢
          </p>
        </div>

        {/* Quantity */}
        <div className="bg-white/[0.03] rounded-xl p-4 border border-white/[0.05]">
          <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Contracts</p>
          <p className="text-white font-mono font-bold text-2xl">
            {lastBet.count}
          </p>
        </div>

        {/* Total Cost */}
        <div className="bg-white/[0.03] rounded-xl p-4 border border-white/[0.05]">
          <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Total Cost</p>
          <p className="text-emerald-400 font-mono font-bold text-2xl">
            ${(lastBet.cost / 100).toFixed(2)}
          </p>
        </div>
      </div>

      {/* Edge Indicator */}
      <div className="flex items-center justify-between bg-gradient-to-r from-purple-500/10 to-cyan-500/10 rounded-xl p-4 border border-purple-500/20">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-purple-400" />
          <span className="text-gray-400 text-sm">Calculated Edge</span>
        </div>
        <span className="text-purple-400 font-mono font-bold text-xl drop-shadow-[0_0_10px_rgba(168,85,247,0.5)]">
          {edge.toFixed(1)}%
        </span>
      </div>

      {/* Timestamp */}
      <div className="mt-4 flex items-center justify-between text-xs text-gray-600 font-mono">
        <span>{betTime.toLocaleDateString()}</span>
        <span>{betTime.toLocaleTimeString()}</span>
      </div>
    </GlassCard>
  );
}

// ============== PORTFOLIO CHART COMPONENT ==============
function PortfolioChart({ data }: { data: Array<{ timestamp: string; value: number }> }) {
  // Format data for recharts
  const chartData = data.map(d => ({
    time: new Date(d.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    fullTime: new Date(d.timestamp).toLocaleString(),
    value: d.value
  }));

  // Calculate stats
  const values = data.map(d => d.value);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const latestValue = values[values.length - 1] || 0;
  const startValue = values[0] || 0;
  const pnlPercent = startValue > 0 ? ((latestValue - startValue) / startValue * 100) : 0;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#0a0a0f]/95 backdrop-blur-xl border border-white/10 rounded-xl p-3 shadow-2xl">
          <p className="text-gray-400 text-xs mb-1">{payload[0]?.payload?.fullTime}</p>
          <p className="text-cyan-400 font-mono font-bold text-lg">
            ${payload[0]?.value?.toFixed(2)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <GlassCard glowColor="cyan" className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/30 to-blue-500/30 flex items-center justify-center">
            <History className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold">Betting History</h2>
            <p className="text-xs text-gray-500">Cumulative investment over time</p>
          </div>
        </div>
        <div className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-bold ${
          pnlPercent >= 0 
            ? 'bg-emerald-500/20 text-emerald-400' 
            : 'bg-red-500/20 text-red-400'
        }`}>
          {pnlPercent >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
          {Math.abs(pnlPercent).toFixed(1)}%
        </div>
      </div>

      {data.length < 2 ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-500">
          <BarChart3 className="w-12 h-12 mb-4 opacity-30" />
          <p className="text-sm">Not enough data for chart</p>
          <p className="text-xs text-gray-600 mt-1">Place some bets to see history</p>
        </div>
      ) : (
        <>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="portfolioGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00d4ff" stopOpacity={0.4}/>
                    <stop offset="50%" stopColor="#00d4ff" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#00d4ff" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  stroke="rgba(255,255,255,0.05)" 
                  vertical={false}
                />
                <XAxis 
                  dataKey="time" 
                  stroke="rgba(255,255,255,0.2)"
                  tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  stroke="rgba(255,255,255,0.2)"
                  tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `$${value}`}
                />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine 
                  y={startValue} 
                  stroke="rgba(168,85,247,0.5)" 
                  strokeDasharray="5 5"
                  label={{ value: 'Start', fill: 'rgba(168,85,247,0.7)', fontSize: 10 }}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#00d4ff"
                  strokeWidth={2}
                  fill="url(#portfolioGradient)"
                  dot={false}
                  activeDot={{ 
                    r: 6, 
                    fill: '#00d4ff',
                    stroke: '#0a0a0f',
                    strokeWidth: 2
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-white/5">
            <div className="text-center">
              <p className="text-gray-500 text-xs uppercase tracking-wider">Min</p>
              <p className="text-gray-300 font-mono font-bold">${minValue.toFixed(2)}</p>
            </div>
            <div className="text-center">
              <p className="text-gray-500 text-xs uppercase tracking-wider">Max</p>
              <p className="text-gray-300 font-mono font-bold">${maxValue.toFixed(2)}</p>
            </div>
            <div className="text-center">
              <p className="text-gray-500 text-xs uppercase tracking-wider">Current</p>
              <p className="text-cyan-400 font-mono font-bold">${latestValue.toFixed(2)}</p>
            </div>
          </div>
        </>
      )}
    </GlassCard>
  );
}

// ============== RECENT FILLS TABLE ==============
function RecentFillsTable({ fills }: { fills: Fill[] }) {
  const recentFills = fills.slice(0, 10);

  return (
    <GlassCard glowColor="purple" className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/30 to-pink-500/30 flex items-center justify-center">
          <Activity className="w-5 h-5 text-purple-400" />
        </div>
        <div>
          <h2 className="text-lg font-bold">Recent Trades</h2>
          <p className="text-xs text-gray-500">{fills.length} total fills</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-gray-500 text-xs uppercase tracking-wider border-b border-white/5">
              <th className="text-left py-2 font-medium">Time</th>
              <th className="text-left py-2 font-medium">Ticker</th>
              <th className="text-center py-2 font-medium">Side</th>
              <th className="text-right py-2 font-medium">Qty</th>
              <th className="text-right py-2 font-medium">Price</th>
              <th className="text-right py-2 font-medium">Cost</th>
            </tr>
          </thead>
          <tbody>
            {recentFills.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-8 text-gray-500">
                  No trades yet
                </td>
              </tr>
            ) : (
              recentFills.map((fill, i) => (
                <tr 
                  key={fill.tradeId || i} 
                  className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors"
                >
                  <td className="py-3 font-mono text-gray-400 text-xs">
                    {new Date(fill.timestamp).toLocaleTimeString('en-US', { 
                      hour: '2-digit', 
                      minute: '2-digit'
                    })}
                  </td>
                  <td className="py-3 font-mono text-gray-300 text-xs truncate max-w-[120px]" title={fill.ticker}>
                    {fill.ticker.replace('KXBTCD-', '').replace('KXETHD-', '').substring(0, 15)}
                  </td>
                  <td className="py-3 text-center">
                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                      fill.side === 'yes' 
                        ? 'bg-emerald-500/20 text-emerald-400' 
                        : 'bg-red-500/20 text-red-400'
                    }`}>
                      {fill.side.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-3 text-right font-mono text-gray-300">
                    {fill.count}
                  </td>
                  <td className="py-3 text-right font-mono text-cyan-400">
                    {fill.price}¢
                  </td>
                  <td className="py-3 text-right font-mono text-emerald-400">
                    ${(fill.cost / 100).toFixed(2)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </GlassCard>
  );
}

// ============== HELPER FUNCTIONS ==============
function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
}

// ============== MAIN COMPONENT ==============
export default function BettingDashboard() {
  const [kalshiStatus, setKalshiStatus] = useState<KalshiStatus | null>(null);
  const [cryptoPrices, setCryptoPrices] = useState<CryptoPrices | null>(null);
  const [inbox, setInbox] = useState<InboxData | null>(null);
  const [fillsData, setFillsData] = useState<FillsData | null>(null);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  // Fetch all data
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [kalshiRes, cryptoRes, inboxRes, fillsRes] = await Promise.all([
        fetch('/api/kalshi/status'),
        fetch('/api/crypto/prices'),
        fetch('/api/inbox'),
        fetch('/api/kalshi/fills')
      ]);

      if (kalshiRes.ok) setKalshiStatus(await kalshiRes.json());
      if (cryptoRes.ok) setCryptoPrices(await cryptoRes.json());
      if (inboxRes.ok) setInbox(await inboxRes.json());
      if (fillsRes.ok) setFillsData(await fillsRes.json());

      setLastRefresh(new Date());
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;
    setIsSending(true);
    try {
      const res = await fetch('/api/inbox', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: inputMessage })
      });
      if (res.ok) {
        setInputMessage('');
        const inboxRes = await fetch('/api/inbox');
        if (inboxRes.ok) setInbox(await inboxRes.json());
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSending(false);
    }
  };

  const deleteMessage = async (id: string) => {
    try {
      const res = await fetch(`/api/inbox?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setInbox(prev => prev ? {
          ...prev,
          messages: prev.messages.filter(m => m.id !== id)
        } : null);
      }
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };

  const getMessageIcon = (type: InboxMessage['type']) => {
    switch (type) {
      case 'link': return <LinkIcon className="w-4 h-4 text-cyan-400" />;
      case 'command': return <Terminal className="w-4 h-4 text-emerald-400" />;
      default: return <MessageSquare className="w-4 h-4 text-purple-400" />;
    }
  };

  const totalValue = (kalshiStatus?.cash || 0) + (kalshiStatus?.portfolioValue || 0);
  const positionsCount = kalshiStatus?.positions?.length || 0;

  // Mock chart data
  const btcChartData = [88000, 88200, 87800, 88500, 88300, 88900, 89100, 88700, 88911];
  const ethChartData = [2950, 2980, 2960, 3010, 2990, 3020, 3000, 2995, 2999];

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[150px] animate-blob" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[150px] animate-blob animation-delay-2000" />
        <div className="absolute top-1/2 left-1/2 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[150px] animate-blob animation-delay-4000" />
        {/* Grid overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]" />
      </div>

      <div className="relative z-10 p-4 md:p-8 max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 via-cyan-500 to-emerald-500 p-[2px]">
                <div className="w-full h-full rounded-2xl bg-[#0a0a0f] flex items-center justify-center">
                  <Target className="w-6 h-6 text-cyan-400" />
                </div>
              </div>
              <div className="absolute -bottom-1 -right-1">
                <PulsingDot color="green" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-white via-cyan-200 to-purple-200 bg-clip-text text-transparent">
                Trading Terminal
              </h1>
              <p className="text-gray-500 text-sm">Kalshi • Polymarket • Live</p>
            </div>
          </div>

          <div className="flex items-center gap-4 mt-4 md:mt-0">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
              <PulsingDot color="green" label="Systems Online" />
            </div>
            <span className="text-gray-500 text-xs font-mono">
              {lastRefresh.toLocaleTimeString()}
            </span>
            <button
              onClick={fetchData}
              disabled={isLoading}
              className="group flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-white/10 hover:border-cyan-500/50 transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,212,255,0.2)]"
            >
              <RefreshCw className={`w-4 h-4 text-cyan-400 transition-transform duration-500 ${isLoading ? 'animate-spin' : 'group-hover:rotate-180'}`} />
              <span className="text-sm font-medium">Refresh</span>
            </button>
          </div>
        </div>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* BTC Card */}
          <GlassCard glowColor="orange" className="p-5">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500/30 to-amber-500/30 flex items-center justify-center">
                  <span className="text-orange-400 font-bold text-sm">₿</span>
                </div>
                <span className="text-gray-400 text-sm font-medium">Bitcoin</span>
              </div>
              {cryptoPrices?.btc24hChange && (
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                  cryptoPrices.btc24hChange >= 0 
                    ? 'bg-emerald-500/20 text-emerald-400' 
                    : 'bg-red-500/20 text-red-400'
                }`}>
                  {cryptoPrices.btc24hChange >= 0 ? '+' : ''}{cryptoPrices.btc24hChange.toFixed(2)}%
                </span>
              )}
            </div>
            <AnimatedNumber 
              value={cryptoPrices?.btc || 0} 
              prefix="$"
              decimals={0}
              glowColor="orange"
              className="text-2xl md:text-3xl"
            />
            <MiniChart data={btcChartData} color="orange" />
          </GlassCard>

          {/* ETH Card */}
          <GlassCard glowColor="purple" className="p-5">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500/30 to-blue-500/30 flex items-center justify-center">
                  <span className="text-purple-400 font-bold text-sm">◆</span>
                </div>
                <span className="text-gray-400 text-sm font-medium">Ethereum</span>
              </div>
              {cryptoPrices?.eth24hChange && (
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                  cryptoPrices.eth24hChange >= 0 
                    ? 'bg-emerald-500/20 text-emerald-400' 
                    : 'bg-red-500/20 text-red-400'
                }`}>
                  {cryptoPrices.eth24hChange >= 0 ? '+' : ''}{cryptoPrices.eth24hChange.toFixed(2)}%
                </span>
              )}
            </div>
            <AnimatedNumber 
              value={cryptoPrices?.eth || 0} 
              prefix="$"
              decimals={0}
              glowColor="purple"
              className="text-2xl md:text-3xl"
            />
            <MiniChart data={ethChartData} color="purple" />
          </GlassCard>

          {/* Cash Card */}
          <StatCard
            title="Available Cash"
            value={kalshiStatus?.cash || 0}
            icon={DollarSign}
            glowColor="green"
            prefix="$"
            decimals={2}
          />

          {/* Portfolio Card */}
          <StatCard
            title="Portfolio Value"
            value={totalValue}
            subtitle={`${positionsCount} active positions`}
            icon={Wallet}
            glowColor="cyan"
            prefix="$"
            decimals={2}
          />
        </div>

        {/* NEW: Last Bet + Chart Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <LastBetCard lastBet={fillsData?.lastBet || null} />
          <PortfolioChart data={fillsData?.portfolioHistory || []} />
        </div>

        {/* Three Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Positions */}
          <div className="space-y-6">
            {/* Kalshi Section */}
            <GlassCard glowColor="cyan" className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/30 to-blue-500/30 flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold">Kalshi Positions</h2>
                    <p className="text-xs text-gray-500">{positionsCount} active</p>
                  </div>
                </div>
                <a 
                  href="https://kalshi.com/portfolio" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <ExternalLink className="w-4 h-4 text-gray-400" />
                </a>
              </div>

              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                {kalshiStatus?.positions && kalshiStatus.positions.length > 0 ? (
                  kalshiStatus.positions.map((pos, i) => (
                    <div 
                      key={i}
                      className="group flex items-center justify-between p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.05] hover:border-cyan-500/30 transition-all duration-300"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className={`w-2 h-2 rounded-full ${pos.position >= 0 ? 'bg-emerald-400' : 'bg-red-400'} shadow-lg`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-mono text-gray-300 truncate group-hover:text-white transition-colors">
                            {pos.ticker.replace('KXBTCD-', '').replace('KXETHD-', '')}
                          </p>
                          <p className="text-xs text-gray-600">
                            {pos.position > 0 ? 'LONG' : 'SHORT'} {Math.abs(pos.position)} contracts
                          </p>
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <p className={`font-mono font-bold ${pos.exposure >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                          ${pos.exposure.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                    <Activity className="w-8 h-8 mb-3 opacity-50" />
                    <p>{isLoading ? 'Loading positions...' : 'No open positions'}</p>
                  </div>
                )}
              </div>

              {kalshiStatus?.error && (
                <div className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30">
                  <p className="text-red-400 text-sm flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    {kalshiStatus.error}
                  </p>
                </div>
              )}
            </GlassCard>

            {/* Polymarket Section */}
            <GlassCard glowColor="purple" className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/30 to-pink-500/30 flex items-center justify-center">
                  <div className="w-5 h-5 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full" />
                </div>
                <div>
                  <h2 className="text-lg font-bold">Polymarket</h2>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                      iPhone Mirror
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                <Cpu className="w-10 h-10 mb-3 opacity-30" />
                <p className="text-sm">Stats via iPhone mirroring only</p>
                <p className="text-xs text-gray-600 mt-1">(No browser access per TOOLS.md rules)</p>
              </div>
            </GlassCard>
          </div>

          {/* Middle Column - Recent Trades */}
          <RecentFillsTable fills={fillsData?.fills || []} />

          {/* Right Column - Inbox */}
          <GlassCard glowColor="green" className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/30 to-green-500/30 flex items-center justify-center">
                <Send className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h2 className="text-lg font-bold">Clawdinho Inbox</h2>
                <p className="text-xs text-gray-500">Drop messages, links, commands</p>
              </div>
            </div>

            {/* Input Box */}
            <div className="relative mb-6">
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="Type a message or paste a link..."
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 focus:shadow-[0_0_30px_rgba(0,255,136,0.1)] transition-all duration-300"
                  />
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-emerald-500/0 via-emerald-500/5 to-emerald-500/0 pointer-events-none opacity-0 focus-within:opacity-100 transition-opacity" />
                </div>
                <button
                  onClick={sendMessage}
                  disabled={isSending || !inputMessage.trim()}
                  className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 font-medium transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,255,136,0.3)] hover:scale-105 disabled:opacity-30 disabled:hover:scale-100 disabled:hover:shadow-none"
                >
                  {isSending ? (
                    <RefreshCw className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </button>
              </div>
              <p className="text-gray-600 text-xs mt-2 font-mono">
                → agents/betting/inbox.json
              </p>
            </div>

            {/* Messages List */}
            <div>
              <h3 className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-3">
                Recent Messages
              </h3>
              <div className="space-y-2 max-h-[250px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                {inbox?.messages && inbox.messages.length > 0 ? (
                  inbox.messages.map((msg) => (
                    <div 
                      key={msg.id}
                      className={`group flex items-start gap-3 p-3 rounded-xl transition-all duration-300 ${
                        msg.processed 
                          ? 'bg-white/[0.02] opacity-50' 
                          : 'bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.05] hover:border-emerald-500/30'
                      }`}
                    >
                      <div className="mt-0.5">{getMessageIcon(msg.type)}</div>
                      <div className="flex-1 min-w-0">
                        {msg.type === 'link' ? (
                          <a 
                            href={msg.content}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-cyan-400 hover:text-cyan-300 break-all transition-colors"
                          >
                            {msg.content}
                          </a>
                        ) : (
                          <p className="text-sm text-gray-300 break-words">{msg.content}</p>
                        )}
                        <p className="text-xs text-gray-600 mt-1 font-mono">
                          {new Date(msg.timestamp).toLocaleString()}
                        </p>
                      </div>
                      <button
                        onClick={() => deleteMessage(msg.id)}
                        className="p-1.5 rounded-lg text-gray-600 hover:text-red-400 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                    <MessageSquare className="w-8 h-8 mb-3 opacity-30" />
                    <p className="text-sm">No messages yet</p>
                  </div>
                )}
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-gray-600 text-xs font-mono">
            AUTO-REFRESH 30s • BUILT FOR ONDE.SURF • v3.0 🔥
          </p>
        </div>
      </div>

    </div>
  );
}
