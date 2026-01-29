'use client';

import { useEffect, useState, useCallback } from 'react';
import { onCLS, onFCP, onINP, onLCP, onTTFB, Metric } from 'web-vitals';
import { useTranslations } from '@/i18n';
import UptimeHistoryChart from '@/components/UptimeHistoryChart';

interface WebVitalsMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  unit: string;
}

interface ServiceStatus {
  name: string;
  status: 'up' | 'down' | 'checking';
  latency?: number;
  message?: string;
}

interface CronJob {
  name: string;
  schedule: string;
  lastRun: string | null;
  status: 'healthy' | 'stale' | 'error' | 'unknown';
  ageMinutes: number | null;
  expectedIntervalMinutes: number;
}

interface CronHealthResponse {
  status: string;
  jobs: CronJob[];
  checkedAt: string;
}

interface ApiLatencyCategory {
  total_calls: number;
  endpoint_count: number;
  avg_latency_ms: number;
  endpoints: Array<{
    name: string;
    count: number;
    avgMs: number;
    p95Ms: number;
    maxMs: number;
  }>;
}

interface ApiLatencyData {
  generated_at: string;
  categories: Record<string, ApiLatencyCategory>;
  slowest: Array<{
    name: string;
    count: number;
    avgMs: number;
    p95Ms: number;
    maxMs: number;
  }>;
  overall: {
    total_calls: number;
    avg_latency_ms: number;
  };
}

interface AlertItem {
  timestamp: string;
  type: string;
  file: string;
  summary: string;
  details?: {
    asset?: string;
    timeframe?: string;
    severity?: string;
    regime?: string;
  };
}

interface AlertsData {
  generated_at: string;
  count: number;
  items: AlertItem[];
}

interface UptimeCheck {
  timestamp: string;
  status: number;
  latency_ms: number;
  ok: boolean;
  error?: string;
}

interface UptimeStats {
  uptime_24h: number;
  uptime_7d: number;
  avg_latency_24h: number;
  avg_latency_7d: number;
  incidents_24h: number;
  incidents_7d: number;
  total_checks_24h: number;
  total_checks_7d: number;
}

interface SiteUptime {
  checks: UptimeCheck[];
  stats: UptimeStats;
}

interface UptimeHistoryData {
  generated_at: string;
  sites: Record<string, SiteUptime>;
}

interface WebhookAlert {
  timestamp: string;
  type: string;
  status: string;
  details?: {
    ondeLaDown?: boolean;
    ondeSurfDown?: boolean;
    autotraderDown?: boolean;
  };
  resolved?: boolean;
}

interface WebhookAlertsData {
  generated_at: string;
  count: number;
  items: WebhookAlert[];
}

interface AutotraderHealth {
  is_running: boolean;
  last_cycle_time?: string;
  status: 'healthy' | 'warning' | 'error' | 'unknown';
  issues?: string[];
  trades_24h?: number;
  cycle_count?: number;
  trades_today?: number;
  today_won?: number;
  today_lost?: number;
  today_pending?: number;
  win_rate_today?: number;
  pnl_today_cents?: number;
  circuit_breaker_active?: boolean;
  consecutive_losses?: number;
  dry_run?: boolean;
  log_active?: boolean;
  log_age_minutes?: number;
  format?: string;
}

interface NetworkStatus {
  online: boolean;
  effectiveType?: string;
  downlink?: number;
  rtt?: number;
  swStatus: 'checking' | 'active' | 'installing' | 'waiting' | 'none' | 'error';
  swVersion?: string;
  cacheUsage?: { usage: number; quota: number };
}

interface CacheEntry {
  url: string;
  contentLength?: number;
  contentType?: string;
  date?: string;
  ageMinutes?: number;
}

interface CacheDiagnostics {
  caches: {
    name: string;
    entryCount: number;
    totalSize: number;
    entries: CacheEntry[];
  }[];
  totalEntries: number;
  staleEntries: number;  // > 24h old
  totalSize: number;
}

const SERVICES_TO_CHECK = [
  { name: 'onde.la', url: 'https://onde.la' },
  { name: 'onde.surf', url: 'https://onde.surf' },
  { name: 'GitHub (FRH)', url: 'https://github.com/FreeRiverHouse' },
];

// Format bytes to human-readable
const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
};

export default function HealthPage() {
  const t = useTranslations();
  const [services, setServices] = useState<ServiceStatus[]>(
    SERVICES_TO_CHECK.map(s => ({ name: s.name, status: 'checking' as const }))
  );
  const [cronJobs, setCronJobs] = useState<CronJob[]>([]);
  const [cronStatus, setCronStatus] = useState<'checking' | 'healthy' | 'degraded' | 'error'>('checking');
  const [lastCheck, setLastCheck] = useState<Date | null>(null);
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({
    online: true,
    swStatus: 'checking',
  });
  const [swRegistration, setSwRegistration] = useState<ServiceWorkerRegistration | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [webVitals, setWebVitals] = useState<WebVitalsMetric[]>([]);
  const [apiLatency, setApiLatency] = useState<ApiLatencyData | null>(null);
  const [apiLatencyLoading, setApiLatencyLoading] = useState(true);
  const [autotraderHealth, setAutotraderHealth] = useState<AutotraderHealth | null>(null);
  const [alertsData, setAlertsData] = useState<AlertsData | null>(null);
  const [alertFilter, setAlertFilter] = useState<'all' | 'divergence' | 'regime' | 'vol' | 'whipsaw'>('all');
  const [cacheDiagnostics, setCacheDiagnostics] = useState<CacheDiagnostics | null>(null);
  const [cacheLoading, setCacheLoading] = useState(true);
  const [uptimeHistory, setUptimeHistory] = useState<UptimeHistoryData | null>(null);
  const [uptimeLoading, setUptimeLoading] = useState(true);
  const [webhookAlerts, setWebhookAlerts] = useState<WebhookAlertsData | null>(null);
  
  // Auto-refresh state (T456)
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Load auto-refresh preference from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('health-auto-refresh');
      if (saved !== null) {
        setAutoRefresh(saved === 'true');
      }
    }
  }, []);
  
  // Save auto-refresh preference to localStorage
  const toggleAutoRefresh = useCallback(() => {
    setAutoRefresh(prev => {
      const newValue = !prev;
      if (typeof window !== 'undefined') {
        localStorage.setItem('health-auto-refresh', String(newValue));
      }
      return newValue;
    });
  }, []);

  // Collect Core Web Vitals
  useEffect(() => {
    const vitalsCallback = (metric: Metric) => {
      // Rating thresholds per metric (based on Google's guidelines)
      const getRating = (name: string, value: number): 'good' | 'needs-improvement' | 'poor' => {
        const thresholds: Record<string, [number, number]> = {
          CLS: [0.1, 0.25],        // Cumulative Layout Shift
          FCP: [1800, 3000],       // First Contentful Paint (ms)
          INP: [200, 500],         // Interaction to Next Paint (ms)
          LCP: [2500, 4000],       // Largest Contentful Paint (ms)
          TTFB: [800, 1800],       // Time to First Byte (ms)
        };
        const [good, poor] = thresholds[name] || [0, 0];
        if (value <= good) return 'good';
        if (value <= poor) return 'needs-improvement';
        return 'poor';
      };

      const getUnit = (name: string): string => {
        if (name === 'CLS') return '';
        return 'ms';
      };

      setWebVitals(prev => {
        const filtered = prev.filter(v => v.name !== metric.name);
        return [...filtered, {
          name: metric.name,
          value: metric.value,
          rating: getRating(metric.name, metric.value),
          unit: getUnit(metric.name),
        }].sort((a, b) => a.name.localeCompare(b.name));
      });
    };

    // Register all web vitals callbacks
    onCLS(vitalsCallback);
    onFCP(vitalsCallback);
    onINP(vitalsCallback);
    onLCP(vitalsCallback);
    onTTFB(vitalsCallback);
  }, []);

  // Check network and service worker status
  const checkNetworkStatus = useCallback(async () => {
    const status: NetworkStatus = {
      online: typeof navigator !== 'undefined' ? navigator.onLine : true,
      swStatus: 'checking',
    };

    // Check connection info (Network Information API)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const nav = navigator as any;
    if (nav?.connection) {
      status.effectiveType = nav.connection.effectiveType;
      status.downlink = nav.connection.downlink;
      status.rtt = nav.connection.rtt;
    }

    // Check service worker status
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration) {
          setSwRegistration(registration);
          if (registration.waiting) {
            status.swStatus = 'waiting';
          } else if (registration.installing) {
            status.swStatus = 'installing';
          } else if (registration.active) {
            status.swStatus = 'active';
          }
          // Try to get version from SW cache name
          const cacheNames = await caches.keys();
          const versionedCache = cacheNames.find(n => n.startsWith('onde-v'));
          if (versionedCache) {
            status.swVersion = versionedCache.replace('onde-', '');
          }
        } else {
          status.swStatus = 'none';
          setSwRegistration(null);
        }
      } catch {
        status.swStatus = 'error';
        setSwRegistration(null);
      }
    } else {
      status.swStatus = 'none';
    }

    // Check cache storage usage
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      try {
        const estimate = await navigator.storage.estimate();
        status.cacheUsage = {
          usage: estimate.usage || 0,
          quota: estimate.quota || 0,
        };
      } catch {
        // Storage API not available
      }
    }

    setNetworkStatus(status);
  }, []);

  // Analyze cache entries for diagnostics (T427)
  const analyzeCaches = useCallback(async () => {
    setCacheLoading(true);
    try {
      if (!('caches' in window)) {
        setCacheDiagnostics(null);
        return;
      }

      const cacheNames = await caches.keys();
      const diagnostics: CacheDiagnostics = {
        caches: [],
        totalEntries: 0,
        staleEntries: 0,
        totalSize: 0,
      };

      const now = Date.now();
      const STALE_THRESHOLD_MS = 24 * 60 * 60 * 1000; // 24 hours

      for (const cacheName of cacheNames) {
        const cache = await caches.open(cacheName);
        const requests = await cache.keys();
        
        const cacheInfo = {
          name: cacheName,
          entryCount: requests.length,
          totalSize: 0,
          entries: [] as CacheEntry[],
        };

        // Sample up to 20 entries for details
        for (const request of requests.slice(0, 20)) {
          try {
            const response = await cache.match(request);
            if (response) {
              const entry: CacheEntry = {
                url: new URL(request.url).pathname || request.url,
              };
              
              const dateHeader = response.headers.get('date');
              if (dateHeader) {
                const cacheDate = new Date(dateHeader);
                entry.date = dateHeader;
                entry.ageMinutes = Math.round((now - cacheDate.getTime()) / 60000);
                
                if ((now - cacheDate.getTime()) > STALE_THRESHOLD_MS) {
                  diagnostics.staleEntries++;
                }
              }
              
              const contentLength = response.headers.get('content-length');
              if (contentLength) {
                const size = parseInt(contentLength, 10);
                entry.contentLength = size;
                cacheInfo.totalSize += size;
              }
              
              const contentType = response.headers.get('content-type');
              if (contentType) {
                entry.contentType = contentType.split(';')[0];
              }
              
              cacheInfo.entries.push(entry);
            }
          } catch {
            // Skip entries that can't be read
          }
        }

        diagnostics.totalEntries += cacheInfo.entryCount;
        diagnostics.totalSize += cacheInfo.totalSize;
        diagnostics.caches.push(cacheInfo);
      }

      setCacheDiagnostics(diagnostics);
    } catch (error) {
      console.error('Cache analysis failed:', error);
      setCacheDiagnostics(null);
    } finally {
      setCacheLoading(false);
    }
  }, []);

  // Trigger service worker update (skipWaiting)
  const updateServiceWorker = useCallback(async () => {
    if (!swRegistration?.waiting) return;
    
    setIsUpdating(true);
    
    try {
      // Tell the waiting service worker to skipWaiting
      swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
      
      // Listen for the new service worker to take over
      const handleControllerChange = () => {
        window.location.reload();
      };
      navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange);
      
      // Fallback: reload after 3 seconds if controllerchange doesn't fire
      setTimeout(() => {
        window.location.reload();
      }, 3000);
    } catch (error) {
      console.error('Failed to update service worker:', error);
      setIsUpdating(false);
    }
  }, [swRegistration]);

  const checkService = async (name: string, url: string): Promise<ServiceStatus> => {
    const start = Date.now();
    try {
      // Use a simple fetch with no-cors mode (can only check if request succeeds)
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);
      
      await fetch(url, { 
        mode: 'no-cors',
        signal: controller.signal 
      });
      
      clearTimeout(timeout);
      const latency = Date.now() - start;
      
      return {
        name,
        status: 'up',
        latency,
        message: 'Reachable'
      };
    } catch (error) {
      return {
        name,
        status: 'down',
        latency: Date.now() - start,
        message: error instanceof Error ? error.message : 'Unreachable'
      };
    }
  };

  const fetchCronHealth = async () => {
    try {
      const response = await fetch('/api/health/cron');
      const data: CronHealthResponse = await response.json();
      setCronJobs(data.jobs);
      setCronStatus(data.status as typeof cronStatus);
    } catch {
      setCronStatus('error');
    }
  };

  // Fetch API latency, autotrader health, alerts, and uptime history from trading stats gist (T398, T627, T428, T450)
  const fetchTradingStats = async () => {
    setApiLatencyLoading(true);
    setUptimeLoading(true);
    try {
      const gistUrl = 'https://gist.githubusercontent.com/FreeRiverHouse/43b0815cc640bba8ac799ecb27434579/raw/onde-trading-stats.json';
      const response = await fetch(gistUrl, { cache: 'no-store' });
      const data = await response.json();
      if (data.apiLatency) {
        setApiLatency(data.apiLatency);
      }
      if (data.healthStatus) {
        setAutotraderHealth(data.healthStatus);
      }
      if (data.alerts) {
        setAlertsData(data.alerts);
      }
      if (data.uptimeHistory) {
        setUptimeHistory(data.uptimeHistory);
      }
      if (data.webhookAlerts) {
        setWebhookAlerts(data.webhookAlerts);
      }
    } catch (error) {
      console.error('Failed to fetch trading stats:', error);
    } finally {
      setApiLatencyLoading(false);
      setUptimeLoading(false);
    }
  };

  const runChecks = useCallback(async () => {
    setIsRefreshing(true);
    setServices(SERVICES_TO_CHECK.map(s => ({ name: s.name, status: 'checking' as const })));
    setCronStatus('checking');
    
    try {
      const [results] = await Promise.all([
        Promise.all(SERVICES_TO_CHECK.map(({ name, url }) => checkService(name, url))),
        fetchCronHealth(),
        fetchTradingStats()
      ]);
      
      setServices(results);
      setLastCheck(new Date());
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    runChecks();
    checkNetworkStatus();
    analyzeCaches();
  }, [runChecks, checkNetworkStatus, analyzeCaches]);
  
  // Auto-refresh interval (T456) - respects toggle
  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(runChecks, 30000); // Auto-refresh every 30s when enabled
    const networkInterval = setInterval(checkNetworkStatus, 30000); // Check network every 30s
    const cacheInterval = setInterval(analyzeCaches, 120000); // Check cache every 2min

    return () => {
      clearInterval(interval);
      clearInterval(networkInterval);
      clearInterval(cacheInterval);
    };
  }, [autoRefresh, runChecks, checkNetworkStatus, analyzeCaches]);
  
  // Online/offline event listeners
  useEffect(() => {
    const handleOnline = () => setNetworkStatus(prev => ({ ...prev, online: true }));
    const handleOffline = () => setNetworkStatus(prev => ({ ...prev, online: false }));
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Keyboard shortcut for manual refresh (T459)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only trigger on 'R' key when not typing in an input
      if (
        e.key.toLowerCase() === 'r' &&
        !e.ctrlKey &&
        !e.metaKey &&
        !e.altKey &&
        !['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)
      ) {
        e.preventDefault();
        runChecks();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [runChecks]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'up': return 'text-green-500';
      case 'down': return 'text-red-500';
      default: return 'text-yellow-500';
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'up': return 'bg-green-500/10 border-green-500/30';
      case 'down': return 'bg-red-500/10 border-red-500/30';
      default: return 'bg-yellow-500/10 border-yellow-500/30';
    }
  };

  const allUp = services.every(s => s.status === 'up');
  const anyDown = services.some(s => s.status === 'down');
  const anyChecking = services.some(s => s.status === 'checking');
  
  const servicesOk = allUp;
  const cronOk = cronStatus === 'healthy';
  const overallStatus = anyChecking || cronStatus === 'checking' 
    ? 'checking' 
    : servicesOk && cronOk 
      ? 'healthy' 
      : anyDown || cronStatus === 'error' 
        ? 'degraded' 
        : 'unknown';

  const formatAge = (minutes: number | null): string => {
    if (minutes === null) return t.health.cron.never;
    if (minutes < 60) return `${minutes}m ${t.health.cron.ago}`;
    if (minutes < 1440) return `${Math.round(minutes / 60)}h ${t.health.cron.ago}`;
    return `${Math.round(minutes / 1440)}d ${t.health.cron.ago}`;
  };

  const getCronStatusColor = (status: CronJob['status']) => {
    switch (status) {
      case 'healthy': return 'text-green-500';
      case 'stale': return 'text-yellow-500';
      case 'error': return 'text-red-500';
      default: return 'text-slate-400';
    }
  };

  const getCronStatusBg = (status: CronJob['status']) => {
    switch (status) {
      case 'healthy': return 'bg-green-500/10 border-green-500/30';
      case 'stale': return 'bg-yellow-500/10 border-yellow-500/30';
      case 'error': return 'bg-red-500/10 border-red-500/30';
      default: return 'bg-slate-500/10 border-slate-500/30';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-2">🌊 {t.health.title}</h1>
        <p className="text-slate-400 mb-8">{t.health.subtitle}</p>

        {/* Overall Status */}
        <div className={`rounded-xl border p-6 mb-8 ${getStatusBg(overallStatus)}`}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-sm text-slate-400 uppercase tracking-wide">{t.health.overall.label}</div>
              <div className={`text-2xl font-bold ${getStatusColor(overallStatus)}`}>
                {overallStatus === 'healthy' ? `✅ ${t.health.overall.healthy}` : 
                 overallStatus === 'degraded' ? `⚠️ ${t.health.overall.degraded}` : 
                 overallStatus === 'checking' ? `🔄 ${t.health.overall.checking}` :
                 `❓ ${t.health.overall.unknown}`}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={runChecks}
                disabled={isRefreshing}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:cursor-wait text-white rounded-lg transition-colors flex items-center gap-2"
                title="Press R to refresh"
              >
                <span className={isRefreshing ? 'animate-spin' : ''}>↻</span>
                {isRefreshing ? 'Refreshing...' : t.health.refresh}
              </button>
              <kbd className="hidden sm:inline-block px-2 py-1 text-xs font-mono bg-slate-800 text-slate-400 border border-slate-600 rounded">R</kbd>
            </div>
          </div>
          
          {/* Auto-refresh toggle (T456) */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-700/50">
            <div className="flex items-center gap-3">
              <button
                onClick={toggleAutoRefresh}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  autoRefresh ? 'bg-green-500' : 'bg-slate-600'
                }`}
                aria-label="Toggle auto-refresh"
              >
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                  autoRefresh ? 'translate-x-7' : 'translate-x-1'
                }`} />
              </button>
              <span className="text-sm text-slate-300">
                Auto-refresh {autoRefresh ? 'on' : 'off'}
                {autoRefresh && <span className="text-slate-500 ml-1">(30s)</span>}
              </span>
            </div>
            <div className="text-xs text-slate-500">
              {lastCheck ? (
                <>Last: {lastCheck.toLocaleTimeString()}</>
              ) : (
                <>Never refreshed</>
              )}
            </div>
          </div>
        </div>

        {/* Services */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-white mb-3">🌐 {t.health.services.title}</h2>
          <div className="space-y-3">
            {services.map((service) => (
              <div 
                key={service.name}
                className={`rounded-lg border p-4 flex items-center justify-between ${getStatusBg(service.status)}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${
                    service.status === 'up' ? 'bg-green-500' : 
                    service.status === 'down' ? 'bg-red-500' : 
                    'bg-yellow-500 animate-pulse'
                  }`} />
                  <span className="text-white font-medium">{service.name}</span>
                </div>
                <div className="text-right">
                  <div className={`text-sm font-medium ${getStatusColor(service.status)}`}>
                    {service.status === 'up' ? t.health.services.up : 
                     service.status === 'down' ? t.health.services.down : 
                     t.health.services.checking}
                  </div>
                  {service.latency && (
                    <div className="text-xs text-slate-400">{service.latency}ms</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Uptime History (T450) */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-white mb-3">📈 Uptime History</h2>
          <UptimeHistoryChart data={uptimeHistory} loading={uptimeLoading} />
        </div>

        {/* Cron Jobs */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-white mb-3">⏰ {t.health.cron.title}</h2>
          <div className="space-y-3">
            {cronJobs.length === 0 && cronStatus === 'checking' ? (
              <div className="text-slate-400 text-center py-4">{t.health.cron.loading}</div>
            ) : cronJobs.length === 0 ? (
              <div className="text-slate-400 text-center py-4">{t.health.cron.noData}</div>
            ) : (
              cronJobs.map((job) => (
                <div 
                  key={job.name}
                  className={`rounded-lg border p-4 ${getCronStatusBg(job.status)}`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${
                        job.status === 'healthy' ? 'bg-green-500' : 
                        job.status === 'stale' ? 'bg-yellow-500' : 
                        job.status === 'error' ? 'bg-red-500' : 
                        'bg-slate-500'
                      }`} />
                      <span className="text-white font-medium">{job.name}</span>
                    </div>
                    <div className={`text-sm font-medium ${getCronStatusColor(job.status)}`}>
                      {job.status === 'healthy' ? t.health.cron.healthy :
                       job.status === 'stale' ? t.health.cron.stale :
                       job.status === 'error' ? t.health.cron.error :
                       t.health.cron.unknown}
                    </div>
                  </div>
                  <div className="flex justify-between text-xs text-slate-400 pl-6">
                    <span>{t.health.cron.schedule}: <code className="bg-slate-700 px-1 rounded">{job.schedule}</code></span>
                    <span>{formatAge(job.ageMinutes)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Autotrader Health Status (T627) */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-white mb-3">🤖 Autotrader Status</h2>
          <div className={`rounded-lg border p-4 ${
            !autotraderHealth ? 'bg-slate-500/10 border-slate-500/30' :
            autotraderHealth.status === 'healthy' ? 'bg-green-500/10 border-green-500/30' :
            autotraderHealth.status === 'warning' ? 'bg-yellow-500/10 border-yellow-500/30' :
            autotraderHealth.status === 'error' ? 'bg-red-500/10 border-red-500/30' :
            'bg-slate-500/10 border-slate-500/30'
          }`}>
            {!autotraderHealth ? (
              <div className="text-slate-400 text-center py-4">
                <div>🤖 No autotrader data available</div>
                <div className="text-xs mt-2">Health status will appear when autotrader is running</div>
              </div>
            ) : (
              <>
                {/* Status Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full ${
                      autotraderHealth.is_running ? 'bg-green-500 animate-pulse' : 'bg-red-500'
                    }`} />
                    <div>
                      <div className="text-white font-medium">
                        {autotraderHealth.is_running ? 'Running' : 'Stopped'}
                        {autotraderHealth.dry_run && ' (Dry Run 🧪)'}
                      </div>
                      <div className={`text-sm ${
                        autotraderHealth.status === 'healthy' ? 'text-green-400' :
                        autotraderHealth.status === 'warning' ? 'text-yellow-400' :
                        autotraderHealth.status === 'error' ? 'text-red-400' :
                        'text-slate-400'
                      }`}>
                        {autotraderHealth.status === 'healthy' ? '✅ Healthy' :
                         autotraderHealth.status === 'warning' ? '⚠️ Warning' :
                         autotraderHealth.status === 'error' ? '❌ Error' :
                         '❓ Unknown'}
                      </div>
                    </div>
                  </div>
                  {autotraderHealth.circuit_breaker_active && (
                    <div className="px-3 py-1 bg-red-500/20 border border-red-500/40 rounded-lg">
                      <span className="text-red-400 text-sm font-medium">🛑 Circuit Breaker Active</span>
                    </div>
                  )}
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                  {autotraderHealth.trades_today !== undefined && (
                    <div className="bg-slate-800/50 rounded-lg p-3">
                      <div className="text-slate-400 text-xs mb-1">Trades Today</div>
                      <div className="text-xl font-bold text-white">{autotraderHealth.trades_today}</div>
                    </div>
                  )}
                  {autotraderHealth.trades_24h !== undefined && !autotraderHealth.trades_today && (
                    <div className="bg-slate-800/50 rounded-lg p-3">
                      <div className="text-slate-400 text-xs mb-1">Trades (24h)</div>
                      <div className="text-xl font-bold text-white">{autotraderHealth.trades_24h}</div>
                    </div>
                  )}
                  {autotraderHealth.win_rate_today !== undefined && (
                    <div className="bg-slate-800/50 rounded-lg p-3">
                      <div className="text-slate-400 text-xs mb-1">Win Rate Today</div>
                      <div className={`text-xl font-bold ${
                        autotraderHealth.win_rate_today >= 50 ? 'text-green-400' :
                        autotraderHealth.win_rate_today >= 40 ? 'text-yellow-400' :
                        'text-red-400'
                      }`}>
                        {autotraderHealth.win_rate_today.toFixed(0)}%
                      </div>
                    </div>
                  )}
                  {autotraderHealth.pnl_today_cents !== undefined && (
                    <div className="bg-slate-800/50 rounded-lg p-3">
                      <div className="text-slate-400 text-xs mb-1">PnL Today</div>
                      <div className={`text-xl font-bold ${
                        autotraderHealth.pnl_today_cents >= 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {autotraderHealth.pnl_today_cents >= 0 ? '+' : ''}${(autotraderHealth.pnl_today_cents / 100).toFixed(2)}
                      </div>
                    </div>
                  )}
                  {autotraderHealth.consecutive_losses !== undefined && autotraderHealth.consecutive_losses > 0 && (
                    <div className="bg-slate-800/50 rounded-lg p-3">
                      <div className="text-slate-400 text-xs mb-1">Consecutive Losses</div>
                      <div className={`text-xl font-bold ${
                        autotraderHealth.consecutive_losses >= 5 ? 'text-red-400' :
                        autotraderHealth.consecutive_losses >= 3 ? 'text-yellow-400' :
                        'text-slate-300'
                      }`}>
                        {autotraderHealth.consecutive_losses}
                      </div>
                    </div>
                  )}
                  {autotraderHealth.cycle_count !== undefined && (
                    <div className="bg-slate-800/50 rounded-lg p-3">
                      <div className="text-slate-400 text-xs mb-1">Cycles</div>
                      <div className="text-xl font-bold text-white">{autotraderHealth.cycle_count.toLocaleString()}</div>
                    </div>
                  )}
                </div>

                {/* Issues */}
                {autotraderHealth.issues && autotraderHealth.issues.length > 0 && (
                  <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 mb-3">
                    <div className="text-yellow-400 text-xs font-medium mb-1">⚠️ Issues</div>
                    <ul className="text-yellow-300 text-sm space-y-1">
                      {autotraderHealth.issues.map((issue, i) => (
                        <li key={i}>• {issue}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Last Cycle Time */}
                {autotraderHealth.last_cycle_time && (
                  <div className="text-xs text-slate-500 text-center pt-2 border-t border-slate-700">
                    Last cycle: {new Date(autotraderHealth.last_cycle_time).toLocaleString()}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* API Latency Metrics (T398) */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-white mb-3">⚡ API Latency</h2>
          <div className={`rounded-lg border p-4 ${
            apiLatencyLoading ? 'bg-slate-500/10 border-slate-500/30' :
            !apiLatency ? 'bg-slate-500/10 border-slate-500/30' :
            apiLatency.overall.avg_latency_ms > 1000 ? 'bg-red-500/10 border-red-500/30' :
            apiLatency.overall.avg_latency_ms > 500 ? 'bg-yellow-500/10 border-yellow-500/30' :
            'bg-green-500/10 border-green-500/30'
          }`}>
            {apiLatencyLoading ? (
              <div className="text-slate-400 text-center py-4 animate-pulse">
                Loading API latency data...
              </div>
            ) : !apiLatency ? (
              <div className="text-slate-400 text-center py-4">
                <div>📊 No API latency data available</div>
                <div className="text-xs mt-2">Autotrader needs to run for ~30min to generate latency profile</div>
              </div>
            ) : (
              <>
                {/* Overall Summary */}
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-700">
                  <div>
                    <div className="text-sm text-slate-400">Overall Average</div>
                    <div className={`text-2xl font-bold ${
                      apiLatency.overall.avg_latency_ms < 200 ? 'text-green-400' :
                      apiLatency.overall.avg_latency_ms < 500 ? 'text-blue-400' :
                      apiLatency.overall.avg_latency_ms < 1000 ? 'text-yellow-400' :
                      'text-red-400'
                    }`}>
                      {apiLatency.overall.avg_latency_ms.toFixed(0)}ms
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-slate-400">Total Calls</div>
                    <div className="text-xl font-semibold text-white">
                      {apiLatency.overall.total_calls.toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* Category Breakdown */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                  {Object.entries(apiLatency.categories).map(([name, cat]) => (
                    <div key={name} className="bg-slate-800/50 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-slate-400 text-xs font-medium uppercase">
                          {name === 'kalshi' ? '📈 Kalshi' :
                           name === 'coingecko' ? '🦎 CoinGecko' :
                           name === 'binance' ? '🟡 Binance' :
                           name === 'coinbase' ? '🔵 Coinbase' :
                           `🔧 ${name}`}
                        </span>
                        <div className={`w-2 h-2 rounded-full ${
                          cat.avg_latency_ms < 200 ? 'bg-green-500' :
                          cat.avg_latency_ms < 500 ? 'bg-blue-500' :
                          cat.avg_latency_ms < 1000 ? 'bg-yellow-500' :
                          'bg-red-500'
                        }`} />
                      </div>
                      <div className={`text-lg font-bold ${
                        cat.avg_latency_ms < 200 ? 'text-green-400' :
                        cat.avg_latency_ms < 500 ? 'text-blue-400' :
                        cat.avg_latency_ms < 1000 ? 'text-yellow-400' :
                        'text-red-400'
                      }`}>
                        {cat.avg_latency_ms.toFixed(0)}ms
                      </div>
                      <div className="text-xs text-slate-500">
                        {cat.total_calls.toLocaleString()} calls • {cat.endpoint_count} endpoints
                      </div>
                    </div>
                  ))}
                </div>

                {/* Slowest Endpoints */}
                {apiLatency.slowest && apiLatency.slowest.length > 0 && (
                  <div className="border-t border-slate-700 pt-3">
                    <div className="text-xs text-slate-400 mb-2">🐢 Slowest Endpoints</div>
                    <div className="space-y-1">
                      {apiLatency.slowest.slice(0, 3).map((endpoint, i) => (
                        <div key={endpoint.name} className="flex items-center justify-between text-xs">
                          <span className="text-slate-300 truncate max-w-[60%]">
                            {i + 1}. {endpoint.name}
                          </span>
                          <span className={`font-mono ${
                            endpoint.avgMs < 500 ? 'text-slate-400' :
                            endpoint.avgMs < 1000 ? 'text-yellow-400' :
                            'text-red-400'
                          }`}>
                            {endpoint.avgMs.toFixed(0)}ms avg • p95: {endpoint.p95Ms.toFixed(0)}ms
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Last Updated */}
                <div className="mt-3 pt-2 border-t border-slate-700 text-xs text-slate-500 text-center">
                  Updated: {new Date(apiLatency.generated_at).toLocaleString()}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Alert Summary (T428) */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-white mb-3">🚨 Alert History (24h)</h2>
          <div className={`rounded-lg border p-4 ${
            !alertsData ? 'bg-slate-500/10 border-slate-500/30' :
            alertsData.count === 0 ? 'bg-green-500/10 border-green-500/30' :
            alertsData.count <= 5 ? 'bg-yellow-500/10 border-yellow-500/30' :
            'bg-red-500/10 border-red-500/30'
          }`}>
            {!alertsData ? (
              <div className="text-slate-400 text-center py-4">
                <div>🚨 No alert data available</div>
                <div className="text-xs mt-2">Run upload-alerts-to-gist.py to sync alerts</div>
              </div>
            ) : alertsData.count === 0 ? (
              <div className="text-center py-4">
                <div className="text-green-400 text-lg">✅ No alerts in the last 24h</div>
                <div className="text-xs text-slate-400 mt-2">
                  Last checked: {new Date(alertsData.generated_at).toLocaleString()}
                </div>
              </div>
            ) : (
              <>
                {/* Alert Count Header */}
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-700">
                  <div>
                    <div className="text-sm text-slate-400">Total Alerts</div>
                    <div className={`text-2xl font-bold ${
                      alertsData.count <= 3 ? 'text-yellow-400' :
                      alertsData.count <= 10 ? 'text-orange-400' :
                      'text-red-400'
                    }`}>
                      {alertsData.count}
                    </div>
                  </div>
                  <div className="text-right text-xs text-slate-500">
                    Last updated: {new Date(alertsData.generated_at).toLocaleString()}
                  </div>
                </div>

                {/* Alert Filter Buttons (T432) */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {(['all', 'divergence', 'regime', 'vol', 'whipsaw'] as const).map((filter) => {
                    const filterCount = filter === 'all' 
                      ? alertsData.items.length 
                      : alertsData.items.filter(a => 
                          filter === 'divergence' ? a.type.includes('divergence') :
                          filter === 'regime' ? a.type.includes('regime') :
                          filter === 'vol' ? a.type.includes('vol') :
                          a.type.includes('whipsaw')
                        ).length;
                    return (
                      <button
                        key={filter}
                        onClick={() => setAlertFilter(filter)}
                        className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                          alertFilter === filter
                            ? filter === 'all' ? 'bg-slate-600 text-white' :
                              filter === 'divergence' ? 'bg-yellow-500/30 text-yellow-300 border border-yellow-500/50' :
                              filter === 'regime' ? 'bg-purple-500/30 text-purple-300 border border-purple-500/50' :
                              filter === 'vol' ? 'bg-blue-500/30 text-blue-300 border border-blue-500/50' :
                              'bg-red-500/30 text-red-300 border border-red-500/50'
                            : 'bg-slate-700/50 text-slate-400 hover:bg-slate-700 hover:text-slate-300'
                        }`}
                      >
                        {filter === 'all' ? '📋 All' :
                         filter === 'divergence' ? '📉 Divergence' :
                         filter === 'regime' ? '🔄 Regime' :
                         filter === 'vol' ? '📊 Volatility' :
                         '⚡ Whipsaw'}
                        <span className="ml-1.5 opacity-70">({filterCount})</span>
                      </button>
                    );
                  })}
                </div>

                {/* Alert List */}
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {alertsData.items
                    .filter(alert => 
                      alertFilter === 'all' ? true :
                      alertFilter === 'divergence' ? alert.type.includes('divergence') :
                      alertFilter === 'regime' ? alert.type.includes('regime') :
                      alertFilter === 'vol' ? alert.type.includes('vol') :
                      alert.type.includes('whipsaw')
                    )
                    .slice(0, 10).map((alert, i) => (
                    <div key={`${alert.timestamp}-${i}`} className="bg-slate-800/50 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-mono px-2 py-0.5 rounded ${
                            alert.type.includes('divergence') ? 'bg-yellow-500/20 text-yellow-400' :
                            alert.type.includes('regime') ? 'bg-purple-500/20 text-purple-400' :
                            alert.type.includes('vol') ? 'bg-blue-500/20 text-blue-400' :
                            alert.type.includes('whipsaw') ? 'bg-red-500/20 text-red-400' :
                            'bg-slate-600/50 text-slate-300'
                          }`}>
                            {alert.type.replace(/_/g, ' ').replace('momentum ', '')}
                          </span>
                          {alert.details?.severity && (
                            <span className={`text-xs ${
                              alert.details.severity === 'high' ? 'text-red-400' :
                              alert.details.severity === 'medium' ? 'text-yellow-400' :
                              'text-slate-400'
                            }`}>
                              {alert.details.severity}
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-slate-500">
                          {new Date(alert.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <div className="text-sm text-slate-300">{alert.summary}</div>
                      {alert.details?.asset && (
                        <div className="text-xs text-slate-500 mt-1">
                          {alert.details.asset}
                          {alert.details.timeframe && ` • ${alert.details.timeframe}`}
                        </div>
                      )}
                    </div>
                  ))}
                  {(() => {
                    const filteredCount = alertsData.items.filter(alert => 
                      alertFilter === 'all' ? true :
                      alertFilter === 'divergence' ? alert.type.includes('divergence') :
                      alertFilter === 'regime' ? alert.type.includes('regime') :
                      alertFilter === 'vol' ? alert.type.includes('vol') :
                      alert.type.includes('whipsaw')
                    ).length;
                    return filteredCount > 10 ? (
                      <div className="text-center text-xs text-slate-500 pt-2">
                        ... and {filteredCount - 10} more {alertFilter !== 'all' ? alertFilter + ' ' : ''}alerts
                      </div>
                    ) : null;
                  })()}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Webhook Alerts (T454) - Critical health alerts sent via Discord/Telegram */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-white mb-3">📢 Webhook Alerts (7d)</h2>
          <div className={`rounded-lg border p-4 ${
            !webhookAlerts ? 'bg-slate-500/10 border-slate-500/30' :
            webhookAlerts.count === 0 ? 'bg-green-500/10 border-green-500/30' :
            'bg-red-500/10 border-red-500/30'
          }`}>
            {!webhookAlerts ? (
              <div className="text-slate-400 text-center py-4">
                <div>📢 No webhook alert data</div>
                <div className="text-xs mt-2">Webhook alerts appear when critical health issues are detected</div>
              </div>
            ) : webhookAlerts.count === 0 ? (
              <div className="text-center py-4">
                <div className="text-green-400 text-lg">✅ No critical alerts in the last 7 days</div>
                <div className="text-xs text-slate-400 mt-2">
                  All systems have been stable. Last checked: {new Date(webhookAlerts.generated_at).toLocaleString()}
                </div>
              </div>
            ) : (
              <>
                {/* Summary Header */}
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-700">
                  <div>
                    <div className="text-sm text-slate-400">Critical Alerts (7d)</div>
                    <div className="text-2xl font-bold text-red-400">{webhookAlerts.count}</div>
                  </div>
                  <div className="flex gap-3">
                    <div className="text-center">
                      <div className="text-xs text-slate-500">Sites Down</div>
                      <div className="text-lg font-bold text-red-400">
                        {webhookAlerts.items.filter(a => a.details?.ondeLaDown || a.details?.ondeSurfDown).length}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-slate-500">Autotrader</div>
                      <div className="text-lg font-bold text-yellow-400">
                        {webhookAlerts.items.filter(a => a.details?.autotraderDown).length}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Alert Timeline */}
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {webhookAlerts.items.slice(0, 10).map((alert, i) => (
                    <div key={`webhook-${i}`} className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono px-2 py-0.5 rounded bg-red-500/20 text-red-400">
                            CRITICAL
                          </span>
                          <div className="flex gap-1">
                            {alert.details?.ondeLaDown && (
                              <span className="text-xs px-1.5 py-0.5 bg-slate-700 rounded text-red-300">onde.la</span>
                            )}
                            {alert.details?.ondeSurfDown && (
                              <span className="text-xs px-1.5 py-0.5 bg-slate-700 rounded text-red-300">onde.surf</span>
                            )}
                            {alert.details?.autotraderDown && (
                              <span className="text-xs px-1.5 py-0.5 bg-slate-700 rounded text-yellow-300">autotrader</span>
                            )}
                          </div>
                        </div>
                        <span className="text-xs text-slate-500">
                          {new Date(alert.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <div className="text-sm text-red-300">
                        Health check detected critical issues
                        {alert.resolved && (
                          <span className="ml-2 text-green-400 text-xs">✅ Resolved</span>
                        )}
                      </div>
                    </div>
                  ))}
                  {webhookAlerts.count > 10 && (
                    <div className="text-center text-xs text-slate-500 pt-2">
                      ... and {webhookAlerts.count - 10} more alerts
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Network & PWA Status */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-white mb-3">📡 {t.health.network.title}</h2>
          <div className={`rounded-lg border p-4 space-y-3 ${
            networkStatus.online ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'
          }`}>
            {/* Connection Status */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${networkStatus.online ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className="text-white font-medium">{t.health.network.connection}</span>
              </div>
              <div className="text-right">
                <div className={`text-sm font-medium ${networkStatus.online ? 'text-green-500' : 'text-red-500'}`}>
                  {networkStatus.online ? t.health.network.online : t.health.network.offline}
                </div>
                {networkStatus.effectiveType && (
                  <div className="text-xs text-slate-400">
                    {networkStatus.effectiveType.toUpperCase()}
                    {networkStatus.downlink && ` • ${networkStatus.downlink}Mbps`}
                    {networkStatus.rtt && ` • ${networkStatus.rtt}ms RTT`}
                  </div>
                )}
              </div>
            </div>

            {/* Service Worker Status */}
            <div className="flex items-center justify-between border-t border-slate-700 pt-3">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${
                  networkStatus.swStatus === 'active' ? 'bg-green-500' :
                  networkStatus.swStatus === 'installing' || networkStatus.swStatus === 'waiting' ? 'bg-yellow-500 animate-pulse' :
                  networkStatus.swStatus === 'none' ? 'bg-slate-500' :
                  networkStatus.swStatus === 'checking' ? 'bg-yellow-500 animate-pulse' :
                  'bg-red-500'
                }`} />
                <span className="text-white font-medium">{t.health.network.serviceWorker}</span>
              </div>
              <div className="text-right flex items-center gap-2">
                {networkStatus.swStatus === 'waiting' && (
                  <button
                    onClick={updateServiceWorker}
                    disabled={isUpdating}
                    className="px-2 py-1 text-xs bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 border border-yellow-500/30 rounded transition-colors disabled:opacity-50"
                  >
                    {isUpdating ? `⏳ ${t.health.network.updating}` : `🔄 ${t.health.network.updateNow}`}
                  </button>
                )}
                <div>
                  <div className={`text-sm font-medium ${
                    networkStatus.swStatus === 'active' ? 'text-green-500' :
                    networkStatus.swStatus === 'installing' || networkStatus.swStatus === 'waiting' ? 'text-yellow-500' :
                    networkStatus.swStatus === 'none' ? 'text-slate-400' :
                    networkStatus.swStatus === 'checking' ? 'text-yellow-500' :
                    'text-red-500'
                  }`}>
                    {networkStatus.swStatus === 'active' ? t.health.network.active :
                     networkStatus.swStatus === 'installing' ? t.health.network.installing :
                     networkStatus.swStatus === 'waiting' ? t.health.network.waiting :
                     networkStatus.swStatus === 'none' ? t.health.network.none :
                     networkStatus.swStatus.toUpperCase()}
                  </div>
                  {networkStatus.swVersion && (
                    <div className="text-xs text-slate-400">{t.health.network.cache}: {networkStatus.swVersion}</div>
                  )}
                </div>
              </div>
            </div>

            {/* Cache Storage */}
            {networkStatus.cacheUsage && networkStatus.cacheUsage.quota > 0 && (
              <div className="border-t border-slate-700 pt-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-400 text-sm">{t.health.network.cacheStorage}</span>
                  <span className="text-slate-400 text-sm">
                    {formatBytes(networkStatus.cacheUsage.usage)} / {formatBytes(networkStatus.cacheUsage.quota)}
                  </span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all"
                    style={{ width: `${Math.min(100, (networkStatus.cacheUsage.usage / networkStatus.cacheUsage.quota) * 100)}%` }}
                  />
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  {((networkStatus.cacheUsage.usage / networkStatus.cacheUsage.quota) * 100).toFixed(2)}% {t.health.network.used}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Cache Diagnostics (T427) */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-white mb-3">💾 Cache Diagnostics</h2>
          <div className={`rounded-lg border p-4 ${
            cacheLoading ? 'bg-slate-500/10 border-slate-500/30' :
            !cacheDiagnostics ? 'bg-slate-500/10 border-slate-500/30' :
            cacheDiagnostics.staleEntries > 10 ? 'bg-yellow-500/10 border-yellow-500/30' :
            'bg-green-500/10 border-green-500/30'
          }`}>
            {cacheLoading ? (
              <div className="text-slate-400 text-center py-4 animate-pulse">
                Analyzing cache entries...
              </div>
            ) : !cacheDiagnostics ? (
              <div className="text-slate-400 text-center py-4">
                <div>💾 Cache API not available</div>
                <div className="text-xs mt-2">Browser may not support Cache API</div>
              </div>
            ) : (
              <>
                {/* Summary Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                  <div className="bg-slate-800/50 rounded-lg p-3">
                    <div className="text-slate-400 text-xs mb-1">Total Entries</div>
                    <div className="text-xl font-bold text-white">{cacheDiagnostics.totalEntries}</div>
                  </div>
                  <div className="bg-slate-800/50 rounded-lg p-3">
                    <div className="text-slate-400 text-xs mb-1">Cache Size</div>
                    <div className="text-xl font-bold text-white">{formatBytes(cacheDiagnostics.totalSize)}</div>
                  </div>
                  <div className="bg-slate-800/50 rounded-lg p-3">
                    <div className="text-slate-400 text-xs mb-1">Cache Buckets</div>
                    <div className="text-xl font-bold text-white">{cacheDiagnostics.caches.length}</div>
                  </div>
                  <div className="bg-slate-800/50 rounded-lg p-3">
                    <div className="text-slate-400 text-xs mb-1">Stale (&gt;24h)</div>
                    <div className={`text-xl font-bold ${
                      cacheDiagnostics.staleEntries === 0 ? 'text-green-400' :
                      cacheDiagnostics.staleEntries <= 5 ? 'text-yellow-400' :
                      'text-red-400'
                    }`}>{cacheDiagnostics.staleEntries}</div>
                  </div>
                </div>

                {/* Cache Buckets */}
                {cacheDiagnostics.caches.length > 0 && (
                  <div className="space-y-3">
                    {cacheDiagnostics.caches.map((cache) => (
                      <div key={cache.name} className="bg-slate-800/50 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-white font-medium text-sm">{cache.name}</span>
                            <span className="text-xs text-slate-500">({cache.entryCount} items)</span>
                          </div>
                          {cache.totalSize > 0 && (
                            <span className="text-xs text-slate-400">{formatBytes(cache.totalSize)}</span>
                          )}
                        </div>
                        {cache.entries.length > 0 && (
                          <div className="space-y-1 max-h-32 overflow-y-auto">
                            {cache.entries.slice(0, 10).map((entry, i) => (
                              <div key={i} className="flex items-center justify-between text-xs">
                                <span className="text-slate-300 truncate max-w-[50%]" title={entry.url}>
                                  {entry.url.length > 40 ? `...${entry.url.slice(-37)}` : entry.url}
                                </span>
                                <div className="flex items-center gap-2 text-slate-500">
                                  {entry.contentType && (
                                    <span className="bg-slate-700 px-1.5 py-0.5 rounded text-slate-400">
                                      {entry.contentType.split('/')[1] || entry.contentType}
                                    </span>
                                  )}
                                  {entry.ageMinutes !== undefined && (
                                    <span className={entry.ageMinutes > 1440 ? 'text-yellow-400' : ''}>
                                      {entry.ageMinutes < 60 ? `${entry.ageMinutes}m` :
                                       entry.ageMinutes < 1440 ? `${Math.round(entry.ageMinutes / 60)}h` :
                                       `${Math.round(entry.ageMinutes / 1440)}d`}
                                    </span>
                                  )}
                                  {entry.contentLength && (
                                    <span>{formatBytes(entry.contentLength)}</span>
                                  )}
                                </div>
                              </div>
                            ))}
                            {cache.entryCount > 10 && (
                              <div className="text-xs text-slate-500 text-center pt-1">
                                ... and {cache.entryCount - 10} more
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Refresh Button */}
                <div className="mt-3 pt-3 border-t border-slate-700 flex justify-center">
                  <button
                    onClick={analyzeCaches}
                    className="px-3 py-1.5 text-xs bg-slate-700 hover:bg-slate-600 text-white rounded transition-colors"
                  >
                    ↻ Refresh Cache Analysis
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Core Web Vitals */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-white mb-3">⚡ {t.health.webVitals.title}</h2>
          <div className={`rounded-lg border p-4 ${
            webVitals.length === 0 ? 'bg-slate-500/10 border-slate-500/30' :
            webVitals.some(v => v.rating === 'poor') ? 'bg-red-500/10 border-red-500/30' :
            webVitals.some(v => v.rating === 'needs-improvement') ? 'bg-yellow-500/10 border-yellow-500/30' :
            'bg-green-500/10 border-green-500/30'
          }`}>
            {webVitals.length === 0 ? (
              <div className="text-slate-400 text-center py-4">
                <div className="animate-pulse">📊 {t.health.webVitals.collecting}</div>
                <div className="text-xs mt-2">{t.health.webVitals.interactHint}</div>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {webVitals.map((metric) => (
                  <div key={metric.name} className="bg-slate-800/50 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-slate-400 text-xs font-medium">{metric.name}</span>
                      <div className={`w-2 h-2 rounded-full ${
                        metric.rating === 'good' ? 'bg-green-500' :
                        metric.rating === 'needs-improvement' ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`} />
                    </div>
                    <div className={`text-lg font-bold ${
                      metric.rating === 'good' ? 'text-green-400' :
                      metric.rating === 'needs-improvement' ? 'text-yellow-400' :
                      'text-red-400'
                    }`}>
                      {metric.name === 'CLS' 
                        ? metric.value.toFixed(3) 
                        : Math.round(metric.value)}{metric.unit}
                    </div>
                    <div className={`text-xs capitalize ${
                      metric.rating === 'good' ? 'text-green-500' :
                      metric.rating === 'needs-improvement' ? 'text-yellow-500' :
                      'text-red-500'
                    }`}>
                      {metric.rating === 'good' ? t.health.webVitals.good :
                       metric.rating === 'needs-improvement' ? t.health.webVitals.needsImprovement :
                       t.health.webVitals.poor}
                    </div>
                  </div>
                ))}
              </div>
            )}
            {webVitals.length > 0 && (
              <div className="mt-3 pt-3 border-t border-slate-700 text-xs text-slate-500 text-center">
                {t.health.webVitals.basedOn} <a href="https://web.dev/vitals/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">Google&apos;s Core Web Vitals</a> {t.health.webVitals.thresholds}
              </div>
            )}
          </div>
        </div>

        {/* Timezone Info */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-white mb-3">🕐 {t.health.timezone.title}</h2>
          <div className="rounded-lg border bg-slate-500/10 border-slate-500/30 p-4 grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-slate-400">{t.health.timezone.cronTz}:</span>
              <span className="text-white ml-2">UTC</span>
            </div>
            <div>
              <span className="text-slate-400">{t.health.timezone.yourTz}:</span>
              <span className="text-white ml-2">{Intl.DateTimeFormat().resolvedOptions().timeZone}</span>
            </div>
            <div>
              <span className="text-slate-400">{t.health.timezone.utc}:</span>
              <span className="text-white ml-2">{new Date().toISOString().slice(11, 19)}</span>
            </div>
            <div>
              <span className="text-slate-400">{t.health.timezone.local}:</span>
              <span className="text-white ml-2">{new Date().toLocaleTimeString()}</span>
            </div>
          </div>
        </div>

        {/* Last Updated */}
        <div className="mt-8 text-center text-slate-500 text-sm">
          {lastCheck ? (
            <>
              {t.health.lastChecked}: {lastCheck.toLocaleString()}
              <br />
              <span className="text-xs">
                {autoRefresh ? '🔄 Auto-refresh enabled (30s)' : '⏸️ Auto-refresh paused'}
              </span>
            </>
          ) : (
            <span className="text-xs">{t.health.cron.never}</span>
          )}
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <a href="/" className="text-blue-400 hover:text-blue-300">← {t.health.backToOnde}</a>
        </div>
      </div>
    </div>
  );
}
