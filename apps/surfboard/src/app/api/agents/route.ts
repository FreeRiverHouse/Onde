import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

interface AgentInfo {
  id: string;
  status: 'running' | 'completed' | 'error';
  description: string;
  startTime: string;
  lastActivity: string;
  tokensUsed: number;
  toolsUsed: number;
}

const TASKS_DIR = '/private/tmp/claude/-Users-mattiapetrucciani/tasks';

function parseAgentOutput(filePath: string): Partial<AgentInfo> | null {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.trim().split('\n').filter(l => l.trim());

    if (lines.length === 0) return null;

    let description = '';
    let status: 'running' | 'completed' | 'error' = 'running';
    let startTime = '';
    let lastActivity = '';
    let tokensUsed = 0;
    let toolsUsed = 0;

    // Parse first and last lines for info
    for (const line of lines.slice(0, 10)) {
      try {
        const data = JSON.parse(line);
        if (data.timestamp && !startTime) {
          startTime = data.timestamp;
        }
        if (data.slug) {
          description = data.slug.replace(/-/g, ' ');
        }
        if (data.message?.content) {
          for (const block of data.message.content) {
            if (block.type === 'text' && block.text && !description) {
              description = block.text.slice(0, 100);
            }
          }
        }
      } catch { /* ignore parse errors */ }
    }

    // Parse last lines for status
    for (const line of lines.slice(-20).reverse()) {
      try {
        const data = JSON.parse(line);
        if (data.timestamp) {
          lastActivity = data.timestamp;
          break;
        }
      } catch { /* ignore parse errors */ }
    }

    // Check for completion indicators
    const fullContent = content.toLowerCase();
    if (fullContent.includes('"status":"completed"') ||
        fullContent.includes('all tasks completed') ||
        fullContent.includes('final report')) {
      status = 'completed';
    }
    if (fullContent.includes('error') && fullContent.includes('permission denied')) {
      status = 'error';
    }

    // Count tokens from progress messages
    const tokenMatches = content.match(/(\d+) new tokens/g);
    if (tokenMatches) {
      tokensUsed = tokenMatches.reduce((sum, m) => {
        const num = parseInt(m.match(/\d+/)?.[0] || '0');
        return sum + num;
      }, 0);
    }

    const toolMatches = content.match(/(\d+) new tools? used/g);
    if (toolMatches) {
      toolsUsed = toolMatches.reduce((sum, m) => {
        const num = parseInt(m.match(/\d+/)?.[0] || '0');
        return sum + num;
      }, 0);
    }

    return { description, status, startTime, lastActivity, tokensUsed, toolsUsed };
  } catch {
    return null;
  }
}

export async function GET() {
  try {
    if (!fs.existsSync(TASKS_DIR)) {
      return NextResponse.json({ agents: [], error: 'Tasks directory not found' });
    }

    const files = fs.readdirSync(TASKS_DIR)
      .filter(f => f.endsWith('.output'))
      .sort((a, b) => {
        const statA = fs.statSync(path.join(TASKS_DIR, a));
        const statB = fs.statSync(path.join(TASKS_DIR, b));
        return statB.mtime.getTime() - statA.mtime.getTime();
      })
      .slice(0, 20); // Last 20 agents

    const agents: AgentInfo[] = [];

    for (const file of files) {
      const id = file.replace('.output', '');
      const filePath = path.join(TASKS_DIR, file);
      const stat = fs.statSync(filePath);

      const parsed = parseAgentOutput(filePath);

      // Check if recently modified (running)
      const isRecent = Date.now() - stat.mtime.getTime() < 5 * 60 * 1000; // 5 min

      agents.push({
        id,
        status: parsed?.status === 'completed' ? 'completed' : (isRecent ? 'running' : 'completed'),
        description: parsed?.description || `Agent ${id}`,
        startTime: parsed?.startTime || stat.birthtime.toISOString(),
        lastActivity: parsed?.lastActivity || stat.mtime.toISOString(),
        tokensUsed: parsed?.tokensUsed || 0,
        toolsUsed: parsed?.toolsUsed || 0,
      });
    }

    return NextResponse.json({
      agents,
      timestamp: new Date().toISOString(),
      activeCount: agents.filter(a => a.status === 'running').length
    });
  } catch (error) {
    return NextResponse.json({
      agents: [],
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
