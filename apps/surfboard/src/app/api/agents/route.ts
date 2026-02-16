import { NextResponse } from 'next/server';

export const runtime = 'edge'

// Fetch real agent data from the agent-status gist
const AGENT_GIST_ID = "12a07b9ed63e19f01d2693b69f8a0e3b";
const GIST_FILENAME = "onde-agent-status.json";
const GIST_URL = `https://gist.githubusercontent.com/raw/${AGENT_GIST_ID}/${GIST_FILENAME}`;
const GIST_URL_ALT = `https://gist.githubusercontent.com/ondeclawd/${AGENT_GIST_ID}/raw/${GIST_FILENAME}`;

// Also try the trading stats gist which has healthStatus with agent info
const TRADING_STATS_GIST_URL = 'https://gist.githubusercontent.com/FreeRiverHouse/43b0815cc640bba8ac799ecb27434579/raw/onde-trading-stats.json';

interface AgentInfo {
  id: string;
  status: 'running' | 'completed' | 'error' | 'active' | 'idle' | 'offline';
  description: string;
  startTime: string;
  lastActivity: string;
  tokensUsed: number;
  toolsUsed: number;
  host?: string;
  model?: string;
  currentTask?: { id: string; title: string } | null;
}

async function fetchAgentStatusFromGist(): Promise<Record<string, unknown> | null> {
  // Try agent-specific gist first
  for (const url of [GIST_URL, GIST_URL_ALT]) {
    try {
      const response = await fetch(url, {
        headers: { 'Accept': 'application/json', 'Cache-Control': 'no-cache' },
        next: { revalidate: 60 }
      });
      if (response.ok) {
        return await response.json();
      }
    } catch (e) {
      console.error(`Failed to fetch from ${url}:`, e);
    }
  }
  
  // Fallback: try trading stats gist which has healthStatus
  try {
    const response = await fetch(TRADING_STATS_GIST_URL, {
      headers: { 'Accept': 'application/json' },
      next: { revalidate: 120 }
    });
    if (response.ok) {
      const data = await response.json();
      if (data.healthStatus) {
        return { _fromTradingGist: true, healthStatus: data.healthStatus };
      }
    }
  } catch (e) {
    console.error('Failed to fetch from trading gist:', e);
  }
  
  return null;
}

export async function GET() {
  const gistData = await fetchAgentStatusFromGist();
  
  if (gistData && !gistData._fromTradingGist) {
    // Full agent status data from agent gist
    const agentsData = gistData.agents as Record<string, {
      host: string;
      model: string;
      status: string;
      current_task?: { id: string; title: string } | null;
    }> | undefined;
    
    const agents: AgentInfo[] = [];
    
    if (agentsData) {
      for (const [name, info] of Object.entries(agentsData)) {
        agents.push({
          id: name,
          status: (info.status as AgentInfo['status']) || 'idle',
          description: info.current_task?.title || `${name} agent on ${info.host}`,
          startTime: (gistData.timestamp as string) || new Date().toISOString(),
          lastActivity: (gistData.timestamp as string) || new Date().toISOString(),
          tokensUsed: 0,
          toolsUsed: 0,
          host: info.host,
          model: info.model,
          currentTask: info.current_task,
        });
      }
    }
    
    return NextResponse.json({
      agents: agents.length > 0 ? agents : undefined,
      agentStatus: gistData,
      timestamp: gistData.timestamp || new Date().toISOString(),
      activeCount: agents.filter(a => a.status === 'running' || a.status === 'active').length,
      source: 'gist'
    }, {
      headers: {
        'Cache-Control': 'public, max-age=60, stale-while-revalidate=120',
        'X-Data-Source': 'gist'
      }
    });
  }
  
  if (gistData?._fromTradingGist) {
    // Limited data from trading gist
    const health = gistData.healthStatus as Record<string, unknown>;
    const agents: AgentInfo[] = [{
      id: 'autotrader',
      status: health?.is_running ? 'running' : 'completed',
      description: `Autotrader - ${health?.status || 'unknown'}`,
      startTime: (health?.last_cycle_time as string) || new Date().toISOString(),
      lastActivity: (health?.last_cycle_time as string) || new Date().toISOString(),
      tokensUsed: 0,
      toolsUsed: (health?.cycle_count as number) || 0,
    }];
    
    return NextResponse.json({
      agents,
      timestamp: new Date().toISOString(),
      activeCount: agents.filter(a => a.status === 'running').length,
      source: 'trading-gist-fallback'
    }, {
      headers: {
        'Cache-Control': 'public, max-age=60, stale-while-revalidate=120',
        'X-Data-Source': 'trading-gist'
      }
    });
  }
  
  // Final fallback
  return NextResponse.json({
    agents: [],
    timestamp: new Date().toISOString(),
    activeCount: 0,
    source: 'fallback',
    note: 'Agent status gist unavailable. Run push-agent-status-to-gist.py to populate.'
  }, {
    headers: {
      'Cache-Control': 'no-cache',
      'X-Data-Source': 'fallback'
    }
  });
}
