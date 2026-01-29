'use client';

import { useMemo } from 'react';

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

interface UptimeHistoryChartProps {
  data: UptimeHistoryData | null;
  loading?: boolean;
}

// Format uptime percentage with color
function UptimeBadge({ value, size = 'md' }: { value: number; size?: 'sm' | 'md' | 'lg' }) {
  const colorClass = value >= 99.9 ? 'bg-green-500/20 text-green-400 border-green-500/40' :
                     value >= 99 ? 'bg-green-500/20 text-green-400 border-green-500/40' :
                     value >= 95 ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40' :
                     'bg-red-500/20 text-red-400 border-red-500/40';
  
  const sizeClass = size === 'lg' ? 'text-2xl px-4 py-2' :
                    size === 'md' ? 'text-lg px-3 py-1.5' :
                    'text-sm px-2 py-1';
  
  return (
    <span className={`font-bold rounded-lg border ${colorClass} ${sizeClass}`}>
      {value.toFixed(2)}%
    </span>
  );
}

// Mini bar for uptime visualization (like GitHub status page)
function UptimeBar({ checks, hours = 24 }: { checks: UptimeCheck[]; hours?: number }) {
  const bars = useMemo(() => {
    if (!checks || checks.length === 0) return [];
    
    const now = Date.now();
    const cutoff = now - hours * 60 * 60 * 1000;
    const barCount = hours; // One bar per hour
    const msPerBar = (hours * 60 * 60 * 1000) / barCount;
    
    // Group checks into hourly buckets
    const buckets: { ok: number; total: number; latencies: number[] }[] = Array.from(
      { length: barCount },
      () => ({ ok: 0, total: 0, latencies: [] })
    );
    
    for (const check of checks) {
      const ts = new Date(check.timestamp).getTime();
      if (ts < cutoff) continue;
      
      const bucketIndex = Math.floor((ts - cutoff) / msPerBar);
      if (bucketIndex >= 0 && bucketIndex < barCount) {
        buckets[bucketIndex].total++;
        if (check.ok) {
          buckets[bucketIndex].ok++;
          buckets[bucketIndex].latencies.push(check.latency_ms);
        }
      }
    }
    
    return buckets.map((bucket, i) => {
      if (bucket.total === 0) return { status: 'no-data', uptime: 0, avgLatency: 0 };
      
      const uptime = (bucket.ok / bucket.total) * 100;
      const avgLatency = bucket.latencies.length > 0
        ? bucket.latencies.reduce((a, b) => a + b, 0) / bucket.latencies.length
        : 0;
      
      return {
        status: uptime === 100 ? 'up' : uptime >= 50 ? 'degraded' : 'down',
        uptime,
        avgLatency: Math.round(avgLatency),
        hour: i,
      };
    });
  }, [checks, hours]);
  
  if (bars.length === 0) {
    return (
      <div className="flex gap-0.5 h-8 items-end">
        {Array.from({ length: 24 }).map((_, i) => (
          <div
            key={i}
            className="flex-1 bg-slate-700/50 rounded-sm min-w-[4px] h-full"
            title="No data"
          />
        ))}
      </div>
    );
  }
  
  return (
    <div className="flex gap-0.5 h-8 items-end group">
      {bars.map((bar, i) => (
        <div
          key={i}
          className={`flex-1 rounded-sm min-w-[4px] transition-all cursor-pointer hover:opacity-80 ${
            bar.status === 'up' ? 'bg-green-500' :
            bar.status === 'degraded' ? 'bg-yellow-500' :
            bar.status === 'down' ? 'bg-red-500' :
            'bg-slate-700/50'
          }`}
          style={{
            height: bar.status === 'no-data' ? '100%' : `${Math.max(20, bar.uptime)}%`,
          }}
          title={bar.status === 'no-data' 
            ? 'No data' 
            : `${bar.uptime.toFixed(0)}% uptime, ${bar.avgLatency}ms avg (${24 - bar.hour}h ago)`}
        />
      ))}
    </div>
  );
}

// Latency sparkline chart
function LatencySparkline({ checks, hours = 24 }: { checks: UptimeCheck[]; hours?: number }) {
  const points = useMemo(() => {
    if (!checks || checks.length === 0) return [];
    
    const now = Date.now();
    const cutoff = now - hours * 60 * 60 * 1000;
    
    // Get checks from the time period
    const recentChecks = checks
      .filter(c => new Date(c.timestamp).getTime() > cutoff && c.ok)
      .map(c => ({
        x: (new Date(c.timestamp).getTime() - cutoff) / (hours * 60 * 60 * 1000) * 100,
        y: c.latency_ms,
      }));
    
    if (recentChecks.length === 0) return [];
    
    // Normalize Y values
    const maxLatency = Math.max(...recentChecks.map(p => p.y));
    const minLatency = Math.min(...recentChecks.map(p => p.y));
    const range = maxLatency - minLatency || 1;
    
    return recentChecks.map(p => ({
      x: p.x,
      y: 100 - ((p.y - minLatency) / range * 80 + 10), // Invert Y, leave margins
      latency: p.y,
    }));
  }, [checks, hours]);
  
  if (points.length < 2) {
    return (
      <div className="h-12 bg-slate-800/50 rounded-lg flex items-center justify-center text-slate-500 text-xs">
        Not enough data
      </div>
    );
  }
  
  // Create SVG path
  const pathD = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
    .join(' ');
  
  return (
    <svg viewBox="0 0 100 100" className="h-12 w-full" preserveAspectRatio="none">
      {/* Grid lines */}
      <line x1="0" y1="25" x2="100" y2="25" stroke="currentColor" strokeOpacity="0.1" />
      <line x1="0" y1="50" x2="100" y2="50" stroke="currentColor" strokeOpacity="0.1" />
      <line x1="0" y1="75" x2="100" y2="75" stroke="currentColor" strokeOpacity="0.1" />
      
      {/* Latency line */}
      <path
        d={pathD}
        fill="none"
        stroke="url(#latencyGradient)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      
      {/* Gradient definition */}
      <defs>
        <linearGradient id="latencyGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#06b6d4" />
        </linearGradient>
      </defs>
    </svg>
  );
}

// Incident timeline
function IncidentTimeline({ checks, hours = 24 }: { checks: UptimeCheck[]; hours?: number }) {
  const incidents = useMemo(() => {
    if (!checks || checks.length === 0) return [];
    
    const now = Date.now();
    const cutoff = now - hours * 60 * 60 * 1000;
    
    const recentIncidents: Array<{
      start: string;
      end?: string;
      duration: number;
      error?: string;
    }> = [];
    
    let currentIncident: { start: string; end?: string; error?: string } | null = null;
    
    for (const check of checks.slice().reverse()) {
      const ts = new Date(check.timestamp).getTime();
      if (ts < cutoff) continue;
      
      if (!check.ok) {
        if (!currentIncident) {
          currentIncident = { start: check.timestamp, error: check.error };
        }
      } else {
        if (currentIncident) {
          currentIncident.end = check.timestamp;
          recentIncidents.push({
            ...currentIncident,
            duration: new Date(currentIncident.end).getTime() - new Date(currentIncident.start).getTime(),
          });
          currentIncident = null;
        }
      }
    }
    
    // If still in incident
    if (currentIncident) {
      recentIncidents.push({
        ...currentIncident,
        duration: Date.now() - new Date(currentIncident.start).getTime(),
      });
    }
    
    return recentIncidents.slice(0, 5); // Max 5 incidents
  }, [checks, hours]);
  
  if (incidents.length === 0) {
    return (
      <div className="text-center py-2 text-green-400 text-sm">
        ✅ No incidents in the last {hours}h
      </div>
    );
  }
  
  return (
    <div className="space-y-2">
      {incidents.map((incident, i) => (
        <div
          key={i}
          className="flex items-center justify-between bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2"
        >
          <div>
            <div className="text-red-400 text-sm font-medium">
              ⚠️ Downtime detected
            </div>
            <div className="text-xs text-slate-400">
              {new Date(incident.start).toLocaleTimeString()}
              {incident.end && ` - ${new Date(incident.end).toLocaleTimeString()}`}
            </div>
          </div>
          <div className="text-right">
            <div className="text-red-400 text-sm font-mono">
              {incident.duration < 60000
                ? `${Math.round(incident.duration / 1000)}s`
                : `${Math.round(incident.duration / 60000)}m`}
            </div>
            {incident.error && (
              <div className="text-xs text-slate-500 truncate max-w-[150px]">
                {incident.error}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function UptimeHistoryChart({ data, loading }: UptimeHistoryChartProps) {
  if (loading) {
    return (
      <div className="rounded-lg border bg-slate-500/10 border-slate-500/30 p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-slate-700 rounded w-1/3"></div>
          <div className="h-8 bg-slate-700 rounded"></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="h-20 bg-slate-700 rounded"></div>
            <div className="h-20 bg-slate-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }
  
  if (!data || Object.keys(data.sites || {}).length === 0) {
    return (
      <div className="rounded-lg border bg-slate-500/10 border-slate-500/30 p-4">
        <div className="text-slate-400 text-center py-4">
          <div>📊 No uptime history available</div>
          <div className="text-xs mt-2">
            Run <code className="bg-slate-700 px-1 rounded">scripts/record-uptime.py</code> to start collecting data
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {Object.entries(data.sites).map(([siteName, siteData]) => (
        <div
          key={siteName}
          className="rounded-lg border bg-slate-800/30 border-slate-700/50 p-4"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${
                siteData.stats.uptime_24h >= 99.9 ? 'bg-green-500' :
                siteData.stats.uptime_24h >= 99 ? 'bg-green-500' :
                siteData.stats.uptime_24h >= 95 ? 'bg-yellow-500' :
                'bg-red-500'
              }`} />
              <span className="text-white font-medium">{siteName}</span>
            </div>
            <UptimeBadge value={siteData.stats.uptime_24h} />
          </div>
          
          {/* Uptime bar */}
          <div className="mb-4">
            <div className="flex justify-between text-xs text-slate-500 mb-1">
              <span>24h ago</span>
              <span>Now</span>
            </div>
            <UptimeBar checks={siteData.checks} hours={24} />
          </div>
          
          {/* Stats grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            <div className="bg-slate-800/50 rounded-lg p-3">
              <div className="text-slate-400 text-xs mb-1">24h Uptime</div>
              <div className={`text-lg font-bold ${
                siteData.stats.uptime_24h >= 99 ? 'text-green-400' : 'text-yellow-400'
              }`}>
                {siteData.stats.uptime_24h.toFixed(2)}%
              </div>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-3">
              <div className="text-slate-400 text-xs mb-1">7d Uptime</div>
              <div className={`text-lg font-bold ${
                siteData.stats.uptime_7d >= 99 ? 'text-green-400' : 'text-yellow-400'
              }`}>
                {siteData.stats.uptime_7d.toFixed(2)}%
              </div>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-3">
              <div className="text-slate-400 text-xs mb-1">Avg Latency (24h)</div>
              <div className={`text-lg font-bold ${
                siteData.stats.avg_latency_24h < 200 ? 'text-green-400' :
                siteData.stats.avg_latency_24h < 500 ? 'text-blue-400' :
                'text-yellow-400'
              }`}>
                {siteData.stats.avg_latency_24h}ms
              </div>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-3">
              <div className="text-slate-400 text-xs mb-1">Incidents (7d)</div>
              <div className={`text-lg font-bold ${
                siteData.stats.incidents_7d === 0 ? 'text-green-400' :
                siteData.stats.incidents_7d <= 2 ? 'text-yellow-400' :
                'text-red-400'
              }`}>
                {siteData.stats.incidents_7d}
              </div>
            </div>
          </div>
          
          {/* Latency sparkline */}
          <div className="mb-4">
            <div className="text-xs text-slate-400 mb-2">Response Time (24h)</div>
            <LatencySparkline checks={siteData.checks} hours={24} />
          </div>
          
          {/* Incident timeline */}
          <div>
            <div className="text-xs text-slate-400 mb-2">Recent Incidents</div>
            <IncidentTimeline checks={siteData.checks} hours={24} />
          </div>
        </div>
      ))}
      
      {/* Last updated footer */}
      <div className="text-xs text-slate-500 text-center pt-2">
        Last updated: {new Date(data.generated_at).toLocaleString()}
      </div>
    </div>
  );
}
