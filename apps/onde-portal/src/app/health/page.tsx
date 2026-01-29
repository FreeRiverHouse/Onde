'use client';

import { useEffect, useState } from 'react';

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

const SERVICES_TO_CHECK = [
  { name: 'onde.la', url: 'https://onde.la' },
  { name: 'onde.surf', url: 'https://onde.surf' },
  { name: 'GitHub (FRH)', url: 'https://github.com/FreeRiverHouse' },
];

export default function HealthPage() {
  const [services, setServices] = useState<ServiceStatus[]>(
    SERVICES_TO_CHECK.map(s => ({ name: s.name, status: 'checking' as const }))
  );
  const [cronJobs, setCronJobs] = useState<CronJob[]>([]);
  const [cronStatus, setCronStatus] = useState<'checking' | 'healthy' | 'degraded' | 'error'>('checking');
  const [lastCheck, setLastCheck] = useState<Date | null>(null);

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
    const interval = setInterval(runChecks, 60000); // Check every 60s
    return () => clearInterval(interval);
  }, []);

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
