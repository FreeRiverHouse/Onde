'use client';

import { useEffect, useState, useCallback } from 'react';
import { onCLS, onFCP, onINP, onLCP, onTTFB, Metric } from 'web-vitals';

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

interface NetworkStatus {
  online: boolean;
  effectiveType?: string;
  downlink?: number;
  rtt?: number;
  swStatus: 'checking' | 'active' | 'installing' | 'waiting' | 'none' | 'error';
  swVersion?: string;
  cacheUsage?: { usage: number; quota: number };
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

  const runChecks = async () => {
    setServices(SERVICES_TO_CHECK.map(s => ({ name: s.name, status: 'checking' as const })));
    setCronStatus('checking');
    
    const [results] = await Promise.all([
      Promise.all(SERVICES_TO_CHECK.map(({ name, url }) => checkService(name, url))),
      fetchCronHealth()
    ]);
    
    setServices(results);
    setLastCheck(new Date());
  };

  useEffect(() => {
    runChecks();
    checkNetworkStatus();
    
    const interval = setInterval(runChecks, 60000); // Check every 60s
    const networkInterval = setInterval(checkNetworkStatus, 30000); // Check network every 30s

    // Listen for online/offline events
    const handleOnline = () => setNetworkStatus(prev => ({ ...prev, online: true }));
    const handleOffline = () => setNetworkStatus(prev => ({ ...prev, online: false }));
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      clearInterval(interval);
      clearInterval(networkInterval);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [checkNetworkStatus]);

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
    if (minutes === null) return 'Never';
    if (minutes < 60) return `${minutes}m ago`;
    if (minutes < 1440) return `${Math.round(minutes / 60)}h ago`;
    return `${Math.round(minutes / 1440)}d ago`;
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
        <h1 className="text-3xl font-bold text-white mb-2">🌊 Onde System Status</h1>
        <p className="text-slate-400 mb-8">Real-time health monitoring</p>

        {/* Overall Status */}
        <div className={`rounded-xl border p-6 mb-8 ${getStatusBg(overallStatus)}`}>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-slate-400 uppercase tracking-wide">Overall Status</div>
              <div className={`text-2xl font-bold ${getStatusColor(overallStatus)}`}>
                {overallStatus === 'healthy' ? '✅ All Systems Operational' : 
                 overallStatus === 'degraded' ? '⚠️ Some Issues Detected' : 
                 overallStatus === 'checking' ? '🔄 Checking...' :
                 '❓ Unknown'}
              </div>
            </div>
            <button 
              onClick={runChecks}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
            >
              ↻ Refresh
            </button>
          </div>
        </div>

        {/* Services */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-white mb-3">🌐 Web Services</h2>
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
                    {service.status.toUpperCase()}
                  </div>
                  {service.latency && (
                    <div className="text-xs text-slate-400">{service.latency}ms</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cron Jobs */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-white mb-3">⏰ Scheduled Jobs</h2>
          <div className="space-y-3">
            {cronJobs.length === 0 && cronStatus === 'checking' ? (
              <div className="text-slate-400 text-center py-4">Loading cron jobs...</div>
            ) : cronJobs.length === 0 ? (
              <div className="text-slate-400 text-center py-4">No cron job data available</div>
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
                      {job.status.toUpperCase()}
                    </div>
                  </div>
                  <div className="flex justify-between text-xs text-slate-400 pl-6">
                    <span>Schedule: <code className="bg-slate-700 px-1 rounded">{job.schedule}</code></span>
                    <span>{formatAge(job.ageMinutes)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Network & PWA Status */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-white mb-3">📡 Network & PWA</h2>
          <div className={`rounded-lg border p-4 space-y-3 ${
            networkStatus.online ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'
          }`}>
            {/* Connection Status */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${networkStatus.online ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className="text-white font-medium">Connection</span>
              </div>
              <div className="text-right">
                <div className={`text-sm font-medium ${networkStatus.online ? 'text-green-500' : 'text-red-500'}`}>
                  {networkStatus.online ? 'ONLINE' : 'OFFLINE'}
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
                <span className="text-white font-medium">Service Worker</span>
              </div>
              <div className="text-right flex items-center gap-2">
                {networkStatus.swStatus === 'waiting' && (
                  <button
                    onClick={updateServiceWorker}
                    disabled={isUpdating}
                    className="px-2 py-1 text-xs bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 border border-yellow-500/30 rounded transition-colors disabled:opacity-50"
                  >
                    {isUpdating ? '⏳ Updating...' : '🔄 Update Now'}
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
                    {networkStatus.swStatus.toUpperCase()}
                  </div>
                  {networkStatus.swVersion && (
                    <div className="text-xs text-slate-400">Cache: {networkStatus.swVersion}</div>
                  )}
                </div>
              </div>
            </div>

            {/* Cache Storage */}
            {networkStatus.cacheUsage && networkStatus.cacheUsage.quota > 0 && (
              <div className="border-t border-slate-700 pt-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-400 text-sm">Cache Storage</span>
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
                  {((networkStatus.cacheUsage.usage / networkStatus.cacheUsage.quota) * 100).toFixed(2)}% used
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Core Web Vitals */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-white mb-3">⚡ Core Web Vitals</h2>
          <div className={`rounded-lg border p-4 ${
            webVitals.length === 0 ? 'bg-slate-500/10 border-slate-500/30' :
            webVitals.some(v => v.rating === 'poor') ? 'bg-red-500/10 border-red-500/30' :
            webVitals.some(v => v.rating === 'needs-improvement') ? 'bg-yellow-500/10 border-yellow-500/30' :
            'bg-green-500/10 border-green-500/30'
          }`}>
            {webVitals.length === 0 ? (
              <div className="text-slate-400 text-center py-4">
                <div className="animate-pulse">📊 Collecting metrics...</div>
                <div className="text-xs mt-2">Interact with the page to capture INP</div>
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
                      {metric.rating.replace('-', ' ')}
                    </div>
                  </div>
                ))}
              </div>
            )}
            {webVitals.length > 0 && (
              <div className="mt-3 pt-3 border-t border-slate-700 text-xs text-slate-500 text-center">
                Based on <a href="https://web.dev/vitals/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">Google&apos;s Core Web Vitals</a> thresholds
              </div>
            )}
          </div>
        </div>

        {/* Timezone Info */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-white mb-3">🕐 Timezone Info</h2>
          <div className="rounded-lg border bg-slate-500/10 border-slate-500/30 p-4 grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-slate-400">Cron TZ:</span>
              <span className="text-white ml-2">UTC</span>
            </div>
            <div>
              <span className="text-slate-400">Your TZ:</span>
              <span className="text-white ml-2">{Intl.DateTimeFormat().resolvedOptions().timeZone}</span>
            </div>
            <div>
              <span className="text-slate-400">UTC:</span>
              <span className="text-white ml-2">{new Date().toISOString().slice(11, 19)}</span>
            </div>
            <div>
              <span className="text-slate-400">Local:</span>
              <span className="text-white ml-2">{new Date().toLocaleTimeString()}</span>
            </div>
          </div>
        </div>

        {/* Last Updated */}
        <div className="mt-8 text-center text-slate-500 text-sm">
          Last checked: {lastCheck?.toLocaleString() || 'Never'}
          <br />
          <span className="text-xs">Auto-refreshes every 60 seconds</span>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <a href="/" className="text-blue-400 hover:text-blue-300">← Back to Onde</a>
        </div>
      </div>
    </div>
  );
}
