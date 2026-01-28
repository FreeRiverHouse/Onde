'use client';

import { useEffect, useState } from 'react';

interface ServiceStatus {
  name: string;
  status: 'up' | 'down' | 'unknown';
  latency?: number;
  message?: string;
}

interface HealthData {
  status: string;
  timestamp: string;
  services: ServiceStatus[];
  version: string;
  uptime: string;
}

export default function HealthPage() {
  const [health, setHealth] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchHealth() {
      try {
        const res = await fetch('/api/health');
        const data = await res.json();
        setHealth(data);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to fetch health status');
      } finally {
        setLoading(false);
      }
    }

    fetchHealth();
    const interval = setInterval(fetchHealth, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'up':
      case 'healthy':
        return 'text-green-500';
      case 'down':
      case 'degraded':
        return 'text-red-500';
      default:
        return 'text-yellow-500';
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'up':
      case 'healthy':
        return 'bg-green-500/10 border-green-500/30';
      case 'down':
      case 'degraded':
        return 'bg-red-500/10 border-red-500/30';
      default:
        return 'bg-yellow-500/10 border-yellow-500/30';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-white text-xl">Loading health status...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-red-400 text-xl">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-2">🌊 Onde System Status</h1>
        <p className="text-slate-400 mb-8">Real-time health monitoring</p>

        {/* Overall Status */}
        <div className={`rounded-xl border p-6 mb-8 ${getStatusBg(health?.status || 'unknown')}`}>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-slate-400 uppercase tracking-wide">Overall Status</div>
              <div className={`text-2xl font-bold ${getStatusColor(health?.status || 'unknown')}`}>
                {health?.status === 'healthy' ? '✅ All Systems Operational' : 
                 health?.status === 'degraded' ? '⚠️ Degraded Performance' : 
                 '❓ Unknown'}
              </div>
            </div>
            <div className="text-right text-slate-400 text-sm">
              <div>v{health?.version}</div>
              <div>Uptime: {health?.uptime}</div>
            </div>
          </div>
        </div>

        {/* Services */}
        <div className="space-y-3">
          {health?.services.map((service) => (
            <div 
              key={service.name}
              className={`rounded-lg border p-4 flex items-center justify-between ${getStatusBg(service.status)}`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${service.status === 'up' ? 'bg-green-500' : 'bg-red-500'}`} />
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

        {/* Last Updated */}
        <div className="mt-8 text-center text-slate-500 text-sm">
          Last updated: {health?.timestamp ? new Date(health.timestamp).toLocaleString() : 'N/A'}
          <br />
          <span className="text-xs">Auto-refreshes every 30 seconds</span>
        </div>
      </div>
    </div>
  );
}
