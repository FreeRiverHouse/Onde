'use client'

export const runtime = 'edge';

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
  HelpCircle,
  Keyboard,
  X,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

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

interface TradingStats {
  totalTrades: number;
  wonTrades: number;
  lostTrades: number;
  pendingTrades: number;
  winRate: number;
  totalPnlCents: number;
  grossProfitCents?: number;
  grossLossCents?: number;
  profitFactor?: number;  // gross profit / gross loss (>1 = profitable)
  sharpeRatio?: number;   // risk-adjusted return metric
  maxDrawdownCents?: number;  // largest peak-to-trough decline
  maxDrawdownPercent?: number;  // max drawdown as % of peak
  calmarRatio?: number;  // annualized return / max drawdown %
  sortinoRatio?: number;  // return / downside deviation
  avgTradeDurationHours?: number;  // average time to settlement
  avgReturnCents?: number;  // average profit/loss per trade
  longestWinStreak?: number;  // longest consecutive wins
  longestLossStreak?: number;  // longest consecutive losses
  currentStreak?: number;  // current streak (positive for wins, negative for losses)
  currentStreakType?: 'win' | 'loss' | 'none';  // type of current streak
  // Latency stats (order placement to fill)
  avgLatencyMs?: number | null;   // average order latency
  p95LatencyMs?: number | null;   // 95th percentile latency
  minLatencyMs?: number | null;   // fastest order
  maxLatencyMs?: number | null;   // slowest order
  latencyTradeCount?: number;     // trades with latency data
  todayTrades: number;
  todayWinRate: number;
  todayPnlCents: number;
  recentTrades: Array<{
    timestamp: string;
    ticker: string;
    side: string;
    contracts: number;
    price_cents: number;
    result_status?: string;
  }>;
  lastUpdated: string;
}

interface MomentumAsset {
  asset: string;
  symbol: string;
  currentPrice: number;
  momentum: {
    h1: number;
    h4: number;
    h24: number;
    composite: number;
  };
  signal: 'bullish' | 'bearish' | 'neutral';
  strength: 'strong' | 'moderate' | 'weak';
}

interface MomentumData {
  data: MomentumAsset[];
  lastUpdated: string;
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

// ============== KEYBOARD SHORTCUTS MODAL ==============
function KeyboardShortcutsModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null;

  const shortcuts = [
    { key: 'R', description: 'Refresh all data' },
    { key: '/', description: 'Focus message input' },
    { key: '?', description: 'Show keyboard shortcuts' },
    { key: 'Esc', description: 'Close this modal' },
    { key: 'K', description: 'Open Kalshi portfolio (new tab)' },
    { key: 'E', description: 'Expand/collapse stat cards' },
    { key: 'H', description: 'Toggle help overlay' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-gradient-to-br from-gray-900/95 to-gray-950/95 border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl shadow-purple-500/10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/30 to-cyan-500/30 flex items-center justify-center">
              <Keyboard className="w-5 h-5 text-purple-400" />
            </div>
            <h2 className="text-lg font-bold text-white">Keyboard Shortcuts</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="space-y-2">
          {shortcuts.map((shortcut) => (
            <div 
              key={shortcut.key}
              className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/[0.05]"
            >
              <span className="text-gray-300 text-sm">{shortcut.description}</span>
              <kbd className="px-2.5 py-1 rounded-lg bg-gradient-to-br from-gray-800 to-gray-900 border border-white/10 text-cyan-400 font-mono text-sm shadow-lg">
                {shortcut.key}
              </kbd>
            </div>
          ))}
        </div>

        <p className="text-gray-500 text-xs text-center mt-6">
          Press <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-gray-400">?</kbd> anytime to show this
        </p>
      </div>
    </div>
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

// ============== MAIN COMPONENT ==============
export default function BettingDashboard() {
  const [kalshiStatus, setKalshiStatus] = useState<KalshiStatus | null>(null);
  const [cryptoPrices, setCryptoPrices] = useState<CryptoPrices | null>(null);
  const [inbox, setInbox] = useState<InboxData | null>(null);
  const [tradingStats, setTradingStats] = useState<TradingStats | null>(null);
  const [momentum, setMomentum] = useState<MomentumData | null>(null);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showAllStats, setShowAllStats] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch all data
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [kalshiRes, cryptoRes, inboxRes, statsRes, momentumRes] = await Promise.all([
        fetch('/api/kalshi/status'),
        fetch('/api/crypto/prices'),
        fetch('/api/inbox'),
        fetch('/api/trading/stats'),
        fetch('/api/momentum')
      ]);

      if (kalshiRes.ok) setKalshiStatus(await kalshiRes.json());
      if (cryptoRes.ok) setCryptoPrices(await cryptoRes.json());
      if (inboxRes.ok) setInbox(await inboxRes.json());
      if (statsRes.ok) setTradingStats(await statsRes.json());
      if (momentumRes.ok) setMomentum(await momentumRes.json());

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

  // Keyboard shortcuts handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in input fields
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        // Only handle Escape in input fields
        if (e.key === 'Escape') {
          target.blur();
          setShowShortcuts(false);
        }
        return;
      }

      switch (e.key.toLowerCase()) {
        case 'r':
          e.preventDefault();
          fetchData();
          break;
        case '/':
          e.preventDefault();
          inputRef.current?.focus();
          break;
        case '?':
          e.preventDefault();
          setShowShortcuts(prev => !prev);
          break;
        case 'escape':
          setShowShortcuts(false);
          break;
        case 'k':
          e.preventDefault();
          window.open('https://kalshi.com/portfolio', '_blank');
          break;
        case 'h':
          e.preventDefault();
          setShowShortcuts(prev => !prev);
          break;
        case 'e':
          e.preventDefault();
          setShowAllStats(prev => !prev);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 md:mb-8 gap-4">
          <div className="flex items-center gap-3 md:gap-4">
            <div className="relative flex-shrink-0">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-gradient-to-br from-purple-500 via-cyan-500 to-emerald-500 p-[2px]">
                <div className="w-full h-full rounded-xl md:rounded-2xl bg-[#0a0a0f] flex items-center justify-center">
                  <Target className="w-5 h-5 md:w-6 md:h-6 text-cyan-400" />
                </div>
              </div>
              <div className="absolute -bottom-1 -right-1">
                <PulsingDot color="green" />
              </div>
            </div>
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-white via-cyan-200 to-purple-200 bg-clip-text text-transparent truncate">
                Trading Terminal
              </h1>
              <p className="text-gray-500 text-xs sm:text-sm">Kalshi • Polymarket • Live</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4 flex-wrap sm:flex-nowrap">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
              <PulsingDot color="green" label="Systems Online" />
            </div>
            <span className="text-gray-500 text-[10px] sm:text-xs font-mono">
              {lastRefresh.toLocaleTimeString()}
            </span>
            <button
              onClick={() => setShowShortcuts(true)}
              className="p-2 rounded-xl bg-white/5 border border-white/10 hover:border-purple-500/50 transition-all duration-300"
              title="Keyboard shortcuts (?)"
            >
              <HelpCircle className="w-4 h-4 text-gray-400" />
            </button>
            <button
              onClick={fetchData}
              disabled={isLoading}
              className="group flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-white/10 hover:border-cyan-500/50 transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,212,255,0.2)]"
              title="Refresh (R)"
            >
              <RefreshCw className={`w-4 h-4 text-cyan-400 transition-transform duration-500 ${isLoading ? 'animate-spin' : 'group-hover:rotate-180'}`} />
              <span className="text-xs sm:text-sm font-medium">Refresh</span>
            </button>
          </div>
        </div>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
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

        {/* Momentum Indicator Section */}
        {momentum && momentum.data && (
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/30 to-indigo-500/30 flex items-center justify-center">
                <Activity className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h2 className="text-lg font-bold">Market Momentum</h2>
                <p className="text-xs text-gray-500">1h / 4h / 24h price change</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {momentum.data.map((asset) => (
                <GlassCard 
                  key={asset.symbol} 
                  glowColor={asset.signal === 'bullish' ? 'green' : asset.signal === 'bearish' ? 'red' : 'cyan'} 
                  className="p-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        asset.symbol === 'BTC' 
                          ? 'bg-gradient-to-br from-orange-500/30 to-amber-500/30' 
                          : 'bg-gradient-to-br from-purple-500/30 to-blue-500/30'
                      }`}>
                        <span className={`font-bold text-sm ${asset.symbol === 'BTC' ? 'text-orange-400' : 'text-purple-400'}`}>
                          {asset.symbol === 'BTC' ? '₿' : '◆'}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-300 font-medium">{asset.asset}</span>
                        <p className="text-xs text-gray-600">${asset.currentPrice.toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {/* Signal Strength Bars */}
                      <div className="flex items-end gap-0.5 h-4" title={`Strength: ${asset.strength}`}>
                        <div className={`w-1 rounded-full transition-all ${
                          asset.strength !== 'weak' && asset.strength !== 'moderate' && asset.strength !== 'strong' ? 'h-1.5 bg-gray-600' :
                          asset.signal === 'bullish' ? 'h-1.5 bg-emerald-400' :
                          asset.signal === 'bearish' ? 'h-1.5 bg-red-400' :
                          'h-1.5 bg-gray-500'
                        }`} />
                        <div className={`w-1 rounded-full transition-all ${
                          asset.strength === 'moderate' || asset.strength === 'strong'
                            ? asset.signal === 'bullish' ? 'h-2.5 bg-emerald-400' :
                              asset.signal === 'bearish' ? 'h-2.5 bg-red-400' :
                              'h-2.5 bg-gray-500'
                            : 'h-2.5 bg-gray-700'
                        }`} />
                        <div className={`w-1 rounded-full transition-all ${
                          asset.strength === 'strong'
                            ? asset.signal === 'bullish' ? 'h-3.5 bg-emerald-400' :
                              asset.signal === 'bearish' ? 'h-3.5 bg-red-400' :
                              'h-3.5 bg-gray-500'
                            : 'h-3.5 bg-gray-700'
                        }`} />
                      </div>
                      {/* Signal Badge */}
                      <div className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium ${
                        asset.signal === 'bullish' 
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                          : asset.signal === 'bearish'
                          ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                          : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                      }`}>
                        {asset.signal === 'bullish' ? (
                          <TrendingUp className="w-4 h-4" />
                        ) : asset.signal === 'bearish' ? (
                          <TrendingDown className="w-4 h-4" />
                        ) : (
                          <span>→</span>
                        )}
                        <span className="capitalize">{asset.signal}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-4 gap-2">
                    <div className="text-center p-2 rounded-lg bg-white/[0.03]">
                      <div className="text-xs text-gray-500 mb-1">1H</div>
                      <div className={`text-sm font-mono font-bold ${
                        asset.momentum.h1 >= 0 ? 'text-emerald-400' : 'text-red-400'
                      }`}>
                        {asset.momentum.h1 >= 0 ? '+' : ''}{asset.momentum.h1.toFixed(2)}%
                      </div>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-white/[0.03]">
                      <div className="text-xs text-gray-500 mb-1">4H</div>
                      <div className={`text-sm font-mono font-bold ${
                        asset.momentum.h4 >= 0 ? 'text-emerald-400' : 'text-red-400'
                      }`}>
                        {asset.momentum.h4 >= 0 ? '+' : ''}{asset.momentum.h4.toFixed(2)}%
                      </div>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-white/[0.03]">
                      <div className="text-xs text-gray-500 mb-1">24H</div>
                      <div className={`text-sm font-mono font-bold ${
                        asset.momentum.h24 >= 0 ? 'text-emerald-400' : 'text-red-400'
                      }`}>
                        {asset.momentum.h24 >= 0 ? '+' : ''}{asset.momentum.h24.toFixed(2)}%
                      </div>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-white/[0.05] border border-white/[0.08]">
                      <div className="text-xs text-gray-500 mb-1">Score</div>
                      <div className={`text-sm font-mono font-bold ${
                        asset.momentum.composite >= 0.3 ? 'text-emerald-400' : 
                        asset.momentum.composite <= -0.3 ? 'text-red-400' : 'text-gray-400'
                      }`}>
                        {asset.momentum.composite >= 0 ? '+' : ''}{asset.momentum.composite.toFixed(2)}
                      </div>
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>
          </div>
        )}

        {/* Trading Stats Section */}
        {tradingStats && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-500/30 to-orange-500/30 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-yellow-400" />
                </div>
                <div>
                  <h2 className="text-lg font-bold">Trading Performance</h2>
                  <p className="text-xs text-gray-500">Win rate & PnL analysis</p>
                </div>
              </div>
              {/* Mobile expand/collapse button */}
              <button
                onClick={() => setShowAllStats(!showAllStats)}
                className="md:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-gray-400 text-xs hover:bg-white/10 transition-all"
              >
                {showAllStats ? (
                  <>
                    <ChevronUp className="w-4 h-4" />
                    <span>Less</span>
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-4 h-4" />
                    <span>More</span>
                  </>
                )}
              </button>
            </div>
            
            <div className={`grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-3 md:gap-4 ${!showAllStats ? 'max-md:[&>*:nth-child(n+7)]:hidden' : ''}`}>
              {/* Win Rate */}
              <GlassCard glowColor={tradingStats.winRate >= 50 ? 'green' : 'red'} className="p-3 sm:p-4">
                <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                  <Target className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
                  <span className="text-gray-400 text-[10px] sm:text-xs font-medium truncate">Win Rate</span>
                </div>
                <AnimatedNumber 
                  value={tradingStats.winRate} 
                  suffix="%"
                  decimals={1}
                  glowColor={tradingStats.winRate >= 50 ? 'green' : 'red'}
                  className="text-xl sm:text-2xl"
                />
                <p className="text-[10px] sm:text-xs text-gray-600 mt-1">
                  {tradingStats.wonTrades}W / {tradingStats.lostTrades}L
                </p>
              </GlassCard>

              {/* Total PnL */}
              <GlassCard glowColor={tradingStats.totalPnlCents >= 0 ? 'green' : 'red'} className="p-3 sm:p-4">
                <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                  <DollarSign className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
                  <span className="text-gray-400 text-[10px] sm:text-xs font-medium truncate">Total PnL</span>
                </div>
                <AnimatedNumber 
                  value={tradingStats.totalPnlCents / 100} 
                  prefix={tradingStats.totalPnlCents >= 0 ? '+$' : '-$'}
                  decimals={2}
                  glowColor={tradingStats.totalPnlCents >= 0 ? 'green' : 'red'}
                  className="text-lg sm:text-xl md:text-2xl"
                />
                <p className="text-[10px] sm:text-xs text-gray-600 mt-0.5 sm:mt-1">{tradingStats.totalTrades} trades</p>
              </GlassCard>

              {/* Today PnL */}
              <GlassCard glowColor={tradingStats.todayPnlCents >= 0 ? 'green' : 'red'} className="p-3 sm:p-4">
                <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                  <Activity className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
                  <span className="text-gray-400 text-[10px] sm:text-xs font-medium truncate">Today</span>
                </div>
                <AnimatedNumber 
                  value={Math.abs(tradingStats.todayPnlCents / 100)} 
                  prefix={tradingStats.todayPnlCents >= 0 ? '+$' : '-$'}
                  decimals={2}
                  glowColor={tradingStats.todayPnlCents >= 0 ? 'green' : 'red'}
                  className="text-lg sm:text-xl md:text-2xl"
                />
                <p className="text-[10px] sm:text-xs text-gray-600 mt-0.5 sm:mt-1">{tradingStats.todayTrades} trades</p>
              </GlassCard>

              {/* Today Win Rate */}
              <GlassCard glowColor={tradingStats.todayWinRate >= 50 ? 'green' : 'orange'} className="p-3 sm:p-4">
                <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                  <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
                  <span className="text-gray-400 text-[10px] sm:text-xs font-medium truncate">Today WR</span>
                </div>
                <AnimatedNumber 
                  value={tradingStats.todayWinRate || 0} 
                  suffix="%"
                  decimals={1}
                  glowColor={tradingStats.todayWinRate >= 50 ? 'green' : 'orange'}
                  className="text-lg sm:text-xl md:text-2xl"
                />
              </GlassCard>

              {/* Avg Return Per Trade */}
              <GlassCard glowColor={(tradingStats.avgReturnCents ?? 0) >= 0 ? 'green' : 'red'} className="p-3 sm:p-4">
                <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                  <Target className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
                  <span className="text-gray-400 text-[10px] sm:text-xs font-medium truncate">Avg Return</span>
                </div>
                <AnimatedNumber 
                  value={Math.abs((tradingStats.avgReturnCents ?? 0) / 100)} 
                  prefix={(tradingStats.avgReturnCents ?? 0) >= 0 ? '+$' : '-$'}
                  decimals={2}
                  glowColor={(tradingStats.avgReturnCents ?? 0) >= 0 ? 'green' : 'red'}
                  className="text-lg sm:text-xl md:text-2xl"
                />
                <p className="text-[10px] sm:text-xs text-gray-600 mt-0.5 sm:mt-1">per trade avg</p>
              </GlassCard>

              {/* Profit Factor */}
              <GlassCard glowColor={(tradingStats.profitFactor ?? 0) >= 1 ? 'green' : 'red'} className="p-3 sm:p-4">
                <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                  <BarChart3 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
                  <span className="text-gray-400 text-[10px] sm:text-xs font-medium truncate">Profit Factor</span>
                </div>
                <AnimatedNumber 
                  value={tradingStats.profitFactor ?? 0} 
                  decimals={2}
                  glowColor={(tradingStats.profitFactor ?? 0) >= 1 ? 'green' : 'red'}
                  className="text-lg sm:text-xl md:text-2xl"
                />
                <p className="text-[10px] sm:text-xs text-gray-600 mt-0.5 sm:mt-1">
                  {(tradingStats.profitFactor ?? 0) >= 1.5 ? 'strong' : (tradingStats.profitFactor ?? 0) >= 1 ? 'profitable' : 'needs work'}
                </p>
              </GlassCard>

              {/* Sharpe Ratio */}
              <GlassCard glowColor={(tradingStats.sharpeRatio ?? 0) >= 0 ? 'purple' : 'red'} className="p-3 sm:p-4">
                <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                  <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
                  <span className="text-gray-400 text-[10px] sm:text-xs font-medium truncate">Sharpe Ratio</span>
                </div>
                <AnimatedNumber 
                  value={tradingStats.sharpeRatio ?? 0} 
                  decimals={2}
                  glowColor={(tradingStats.sharpeRatio ?? 0) >= 1 ? 'green' : (tradingStats.sharpeRatio ?? 0) >= 0 ? 'purple' : 'red'}
                  className="text-lg sm:text-xl md:text-2xl"
                />
                <p className="text-[10px] sm:text-xs text-gray-600 mt-0.5 sm:mt-1">
                  {(tradingStats.sharpeRatio ?? 0) >= 2 ? 'excellent' : (tradingStats.sharpeRatio ?? 0) >= 1 ? 'good' : (tradingStats.sharpeRatio ?? 0) >= 0 ? 'fair' : 'poor'}
                </p>
              </GlassCard>

              {/* Sortino Ratio */}
              <GlassCard glowColor={(tradingStats.sortinoRatio ?? 0) >= 1 ? 'green' : 'purple'} className="p-3 sm:p-4">
                <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                  <TrendingDown className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
                  <span className="text-gray-400 text-[10px] sm:text-xs font-medium truncate">Sortino Ratio</span>
                </div>
                <AnimatedNumber 
                  value={tradingStats.sortinoRatio ?? 0} 
                  decimals={2}
                  glowColor={(tradingStats.sortinoRatio ?? 0) >= 2 ? 'green' : (tradingStats.sortinoRatio ?? 0) >= 1 ? 'purple' : 'orange'}
                  className="text-lg sm:text-xl md:text-2xl"
                />
                <p className="text-[10px] sm:text-xs text-gray-600 mt-0.5 sm:mt-1">
                  {(tradingStats.sortinoRatio ?? 0) >= 2 ? 'excellent' : (tradingStats.sortinoRatio ?? 0) >= 1 ? 'good' : (tradingStats.sortinoRatio ?? 0) > 0 ? 'fair' : 'n/a'}
                </p>
              </GlassCard>

              {/* Max Drawdown */}
              <GlassCard glowColor={(tradingStats.maxDrawdownPercent ?? 0) <= 20 ? 'orange' : 'red'} className="p-3 sm:p-4">
                <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                  <TrendingDown className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
                  <span className="text-gray-400 text-[10px] sm:text-xs font-medium truncate">Max Drawdown</span>
                </div>
                <AnimatedNumber 
                  value={tradingStats.maxDrawdownPercent ?? 0} 
                  suffix="%"
                  decimals={1}
                  glowColor={(tradingStats.maxDrawdownPercent ?? 0) <= 10 ? 'green' : (tradingStats.maxDrawdownPercent ?? 0) <= 20 ? 'orange' : 'red'}
                  className="text-lg sm:text-xl md:text-2xl"
                />
                <p className="text-[10px] sm:text-xs text-gray-600 mt-0.5 sm:mt-1">
                  ${((tradingStats.maxDrawdownCents ?? 0) / 100).toFixed(2)} from peak
                </p>
              </GlassCard>

              {/* Calmar Ratio */}
              <GlassCard glowColor={(tradingStats.calmarRatio ?? 0) >= 1 ? 'green' : 'orange'} className="p-3 sm:p-4">
                <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                  <Activity className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
                  <span className="text-gray-400 text-[10px] sm:text-xs font-medium truncate">Calmar Ratio</span>
                </div>
                <AnimatedNumber 
                  value={tradingStats.calmarRatio ?? 0} 
                  decimals={2}
                  glowColor={(tradingStats.calmarRatio ?? 0) >= 3 ? 'green' : (tradingStats.calmarRatio ?? 0) >= 1 ? 'purple' : 'orange'}
                  className="text-lg sm:text-xl md:text-2xl"
                />
                <p className="text-[10px] sm:text-xs text-gray-600 mt-0.5 sm:mt-1">
                  {(tradingStats.calmarRatio ?? 0) >= 3 ? 'excellent' : (tradingStats.calmarRatio ?? 0) >= 1 ? 'good' : (tradingStats.calmarRatio ?? 0) > 0 ? 'needs work' : 'n/a'}
                </p>
              </GlassCard>

              {/* Pending */}
              <GlassCard glowColor="cyan" className="p-3 sm:p-4">
                <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                  <RefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
                  <span className="text-gray-400 text-[10px] sm:text-xs font-medium truncate">Pending</span>
                </div>
                <AnimatedNumber 
                  value={tradingStats.pendingTrades} 
                  decimals={0}
                  glowColor="cyan"
                  className="text-lg sm:text-xl md:text-2xl"
                />
                <p className="text-[10px] sm:text-xs text-gray-600 mt-0.5 sm:mt-1">awaiting settlement</p>
              </GlassCard>

              {/* Avg Trade Duration */}
              <GlassCard glowColor="purple" className="p-3 sm:p-4">
                <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                  <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
                  <span className="text-gray-400 text-[10px] sm:text-xs font-medium truncate">Avg Duration</span>
                </div>
                <AnimatedNumber 
                  value={tradingStats.avgTradeDurationHours ?? 0} 
                  suffix="h"
                  decimals={1}
                  glowColor="purple"
                  className="text-lg sm:text-xl md:text-2xl"
                />
                <p className="text-[10px] sm:text-xs text-gray-600 mt-0.5 sm:mt-1">
                  {(tradingStats.avgTradeDurationHours ?? 0) < 1 ? 'short-term' : (tradingStats.avgTradeDurationHours ?? 0) < 4 ? 'medium-term' : 'longer holds'}
                </p>
              </GlassCard>

              {/* Current Streak */}
              <GlassCard glowColor={tradingStats.currentStreakType === 'win' ? 'green' : tradingStats.currentStreakType === 'loss' ? 'red' : 'cyan'} className="p-3 sm:p-4">
                <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                  <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
                  <span className="text-gray-400 text-[10px] sm:text-xs font-medium truncate">Current Streak</span>
                </div>
                <AnimatedNumber 
                  value={Math.abs(tradingStats.currentStreak ?? 0)} 
                  prefix={tradingStats.currentStreakType === 'win' ? '🔥 ' : tradingStats.currentStreakType === 'loss' ? '❄️ ' : ''}
                  decimals={0}
                  glowColor={tradingStats.currentStreakType === 'win' ? 'green' : tradingStats.currentStreakType === 'loss' ? 'red' : 'cyan'}
                  className="text-lg sm:text-xl md:text-2xl"
                />
                <p className="text-[10px] sm:text-xs text-gray-600 mt-0.5 sm:mt-1">
                  {tradingStats.currentStreakType === 'win' ? 'consecutive wins' : tradingStats.currentStreakType === 'loss' ? 'consecutive losses' : 'no streak'}
                </p>
              </GlassCard>

              {/* Best Streak */}
              <GlassCard glowColor="green" className="p-3 sm:p-4">
                <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                  <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
                  <span className="text-gray-400 text-[10px] sm:text-xs font-medium truncate">Best Streak</span>
                </div>
                <AnimatedNumber 
                  value={tradingStats.longestWinStreak ?? 0} 
                  prefix="🏆 "
                  decimals={0}
                  glowColor="green"
                  className="text-lg sm:text-xl md:text-2xl"
                />
                <p className="text-[10px] sm:text-xs text-gray-600 mt-0.5 sm:mt-1">longest win streak</p>
              </GlassCard>

              {/* Worst Streak */}
              <GlassCard glowColor="red" className="p-3 sm:p-4">
                <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                  <TrendingDown className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
                  <span className="text-gray-400 text-[10px] sm:text-xs font-medium truncate">Worst Streak</span>
                </div>
                <AnimatedNumber 
                  value={tradingStats.longestLossStreak ?? 0} 
                  prefix="💀 "
                  decimals={0}
                  glowColor="red"
                  className="text-lg sm:text-xl md:text-2xl"
                />
                <p className="text-[10px] sm:text-xs text-gray-600 mt-0.5 sm:mt-1">longest loss streak</p>
              </GlassCard>

              {/* Order Latency */}
              <GlassCard glowColor={
                (tradingStats.avgLatencyMs ?? 0) === 0 ? 'cyan' :
                (tradingStats.avgLatencyMs ?? 0) < 500 ? 'green' :
                (tradingStats.avgLatencyMs ?? 0) < 1000 ? 'orange' : 'red'
              } className="p-3 sm:p-4">
                <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                  <Activity className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
                  <span className="text-gray-400 text-[10px] sm:text-xs font-medium truncate">Avg Latency</span>
                </div>
                {tradingStats.latencyTradeCount && tradingStats.latencyTradeCount > 0 ? (
                  <>
                    <AnimatedNumber 
                      value={tradingStats.avgLatencyMs ?? 0} 
                      suffix="ms"
                      decimals={0}
                      glowColor={
                        (tradingStats.avgLatencyMs ?? 0) < 500 ? 'green' :
                        (tradingStats.avgLatencyMs ?? 0) < 1000 ? 'orange' : 'red'
                      }
                      className="text-lg sm:text-xl md:text-2xl"
                    />
                    <p className="text-[10px] sm:text-xs text-gray-600 mt-0.5 sm:mt-1">
                      p95: {tradingStats.p95LatencyMs ?? 0}ms · {tradingStats.latencyTradeCount} trades
                    </p>
                  </>
                ) : (
                  <>
                    <span className="text-lg sm:text-xl md:text-2xl font-bold text-gray-500">N/A</span>
                    <p className="text-[10px] sm:text-xs text-gray-600 mt-0.5 sm:mt-1">no latency data yet</p>
                  </>
                )}
              </GlassCard>
            </div>

            {/* Recent Trades */}
            {tradingStats.recentTrades && tradingStats.recentTrades.length > 0 && (
              <div className="mt-4">
                <h3 className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-3">
                  Recent Trades
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {tradingStats.recentTrades.slice(0, 6).map((trade, i) => (
                    <div 
                      key={i}
                      className={`flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/[0.05] ${
                        trade.result_status === 'won' ? 'border-l-2 border-l-emerald-500' :
                        trade.result_status === 'lost' ? 'border-l-2 border-l-red-500' :
                        'border-l-2 border-l-gray-500'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${
                          trade.result_status === 'won' ? 'bg-emerald-400' :
                          trade.result_status === 'lost' ? 'bg-red-400' :
                          'bg-gray-400 animate-pulse'
                        }`} />
                        <div>
                          <p className="text-sm font-mono text-gray-300">
                            {trade.side.toUpperCase()} {trade.contracts}x @ {trade.price_cents}¢
                          </p>
                          <p className="text-xs text-gray-600">
                            {trade.ticker.replace('KXBTCD-', '').slice(0, 15)}
                          </p>
                        </div>
                      </div>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        trade.result_status === 'won' ? 'bg-emerald-500/20 text-emerald-400' :
                        trade.result_status === 'lost' ? 'bg-red-500/20 text-red-400' :
                        'bg-gray-500/20 text-gray-400'
                      }`}>
                        {trade.result_status || 'pending'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                  <ExternalLink className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
                </a>
              </div>

              <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
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
                <p className="text-[10px] sm:text-xs text-gray-600 mt-0.5 sm:mt-1">(No browser access per TOOLS.md rules)</p>
              </div>
            </GlassCard>
          </div>

          {/* Right Column - Inbox */}
          <div className="space-y-6">
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
                      ref={inputRef}
                      type="text"
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                      placeholder="Type a message or paste a link... (press / to focus)"
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
                <div className="space-y-2 max-h-[350px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
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
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-gray-600 text-xs font-mono">
            AUTO-REFRESH 30s • BUILT FOR ONDE.SURF • v2.0 • Press <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-gray-500">?</kbd> for shortcuts
          </p>
        </div>
      </div>

      {/* Keyboard Shortcuts Modal */}
      <KeyboardShortcutsModal 
        isOpen={showShortcuts} 
        onClose={() => setShowShortcuts(false)} 
      />
    </div>
  );
}
