'use client';

import { useEffect, useState } from 'react';

interface ServiceStatus {
  name: string;
  status: 'up' | 'down' | 'checking';
  latency?: number;
  message?: string;
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

  const runChecks = async () => {
    setServices(SERVICES_TO_CHECK.map(s => ({ name: s.name, status: 'checking' as const })));
    
    const results = await Promise.all(
      SERVICES_TO_CHECK.map(({ name, url }) => checkService(name, url))
    );
    
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
  
  const overallStatus = anyChecking ? 'checking' : allUp ? 'healthy' : anyDown ? 'degraded' : 'unknown';

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
