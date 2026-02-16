'use client';

import { useState, useEffect } from 'react';
import { TrendChart, TrendDataPoint } from './TrendChart';

const AGENT_STATUS_GIST_URL =
  'https://gist.githubusercontent.com/FreeRiverHouse/43b0815cc640bba8ac799ecb27434579/raw/onde-trading-stats.json';

interface AgentStatusData {
  timestamp: string;
  tasks?: {
    total: number;
    done: number;
    in_progress: number;
    todo: number;
    completion_rate: number;
  };
  git?: {
    total_commits_today: number;
    clawdinho?: { hash: string; message: string; ago: string } | null;
    ondinho?: { hash: string; message: string; ago: string } | null;
  };
  autotrader?: {
    running: boolean;
    circuit_breaker: boolean;
    consecutive_losses: number;
    uptime_hours?: number | null;
  };
  agents?: {
    clawdinho?: { host: string; model: string; status: string };
    ondinho?: { host: string; model: string; status: string };
  };
  healthStatus?: {
    is_running: boolean;
    cycle_count: number;
    trades_today: number;
    last_cycle_time?: string;
  };
}

export function AgentActivityWidget({ className = '' }: { className?: string }) {
  const [data, setData] = useState<TrendDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [agentInfo, setAgentInfo] = useState<{
    agents: { name: string; status: string; host: string }[];
    tasksCompleted: number;
    totalTasks: number;
    commitsToday: number;
  } | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch agent status gist and API
        const [gistRes, apiRes] = await Promise.all([
          fetch(AGENT_STATUS_GIST_URL, { cache: 'no-store' }),
          fetch('/api/agents/status').catch(() => null),
        ]);

        let agentData: AgentStatusData | null = null;

        // Try API first for freshest data
        if (apiRes && apiRes.ok) {
          agentData = await apiRes.json();
        }

        // Supplement with gist data
        let gistData: Record<string, unknown> | null = null;
        if (gistRes.ok) {
          gistData = await gistRes.json();
        }

        // Build agent info from available data
        const agents: { name: string; status: string; host: string }[] = [];
        const agentsMap = agentData?.agents || (gistData as AgentStatusData | null)?.agents;
        if (agentsMap) {
          if (agentsMap.clawdinho) {
            agents.push({
              name: 'Clawdinho',
              status: agentsMap.clawdinho.status || 'unknown',
              host: agentsMap.clawdinho.host || 'M1',
            });
          }
          if (agentsMap.ondinho) {
            agents.push({
              name: 'Ondinho',
              status: agentsMap.ondinho.status || 'unknown',
              host: agentsMap.ondinho.host || 'M4',
            });
          }
        }

        const tasks = agentData?.tasks || (gistData as AgentStatusData | null)?.tasks;
        const git = agentData?.git || (gistData as AgentStatusData | null)?.git;

        setAgentInfo({
          agents,
          tasksCompleted: tasks?.done ?? 0,
          totalTasks: tasks?.total ?? 0,
          commitsToday: git?.total_commits_today ?? 0,
        });

        // Build activity timeline from autotrader health history (if available)
        // The healthStatus has cycle_count and trades — we can use this
        // Also check healthHistory from gist for historical data
        const healthHistory = (gistData as Record<string, unknown>)?.healthHistory as {
          snapshots?: Array<{
            timestamp: string;
            cycle_count: number;
            trades_today: number;
            is_running: boolean;
          }>;
        } | null;

        if (healthHistory?.snapshots && healthHistory.snapshots.length > 0) {
          // Use healthHistory snapshots as activity timeline
          const snapshots = healthHistory.snapshots;
          const mapped: TrendDataPoint[] = snapshots.map(s => ({
            label: formatTime(s.timestamp),
            value: s.cycle_count,
            value2: s.trades_today,
          }));
          setData(mapped);
        } else {
          // No historical data — show empty
          setData([]);
        }
      } catch (err) {
        console.error('AgentActivityWidget: failed to fetch', err);
        setData([]);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  return (
    <div className={className}>
      {/* Agent status badges */}
      {agentInfo && !loading && (
        <div className="flex items-center gap-3 mb-2 px-1 flex-wrap">
          {agentInfo.agents.map(a => (
            <div key={a.name} className="flex items-center gap-1.5">
              <div
                className={`w-2 h-2 rounded-full ${
                  a.status === 'active'
                    ? 'bg-emerald-400 shadow-[0_0_6px_rgba(16,185,129,0.6)]'
                    : a.status === 'idle'
                    ? 'bg-amber-400 shadow-[0_0_6px_rgba(245,158,11,0.6)]'
                    : 'bg-white/20'
                }`}
              />
              <span className="text-xs text-white/60">{a.name}</span>
              <span className="text-[10px] text-white/30">({a.host})</span>
            </div>
          ))}
          {agentInfo.agents.length === 0 && (
            <span className="text-xs text-white/30">No agents reporting</span>
          )}
          <div className="ml-auto flex items-center gap-3">
            {agentInfo.totalTasks > 0 && (
              <div className="flex items-center gap-1">
                <span className="text-xs text-white/40">Tasks</span>
                <span className="text-xs font-mono text-purple-400">
                  {agentInfo.tasksCompleted}/{agentInfo.totalTasks}
                </span>
              </div>
            )}
            {agentInfo.commitsToday > 0 && (
              <div className="flex items-center gap-1">
                <span className="text-xs text-white/40">Commits</span>
                <span className="text-xs font-mono text-cyan-400">{agentInfo.commitsToday}</span>
              </div>
            )}
          </div>
        </div>
      )}

      <TrendChart
        data={data}
        loading={loading}
        title="🤖 Agent Activity"
        subtitle="Autotrader cycles"
        label2="Trades/day"
        color="purple"
        color2="emerald"
        height={180}
        showDots={true}
        fill={true}
        showGrid={true}
        formatValue={(v) => v.toFixed(0)}
        emptyMessage="Collecting agent activity data..."
      />
    </div>
  );
}

function formatTime(timestamp: string): string {
  try {
    const d = new Date(timestamp);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch {
    return timestamp;
  }
}

export default AgentActivityWidget;
