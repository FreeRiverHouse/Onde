import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';

const execAsync = promisify(exec);

interface CronJob {
  name: string;
  schedule: string;
  lastRun: string | null;
  status: 'healthy' | 'stale' | 'error' | 'unknown';
  ageMinutes: number | null;
  expectedIntervalMinutes: number;
}

const CRON_JOBS = [
  { name: 'Watchdog Autotrader', log: 'watchdog.log', expectedMin: 10 },
  { name: 'Settlement Tracker', log: 'settlement.log', expectedMin: 90 },
  { name: 'Hourly Snapshot', log: 'hourly-snapshot.log', expectedMin: 90 },
  { name: 'Win Rate Alert', log: 'winrate-alert.log', expectedMin: 400 },
  { name: 'Daily Summary', log: 'daily-notify.log', expectedMin: 1500 },
  { name: 'Backup Trades', log: 'backup-trades.log', expectedMin: 1500 },
  { name: 'Meta Watchdog', script: 'meta-watchdog.sh', expectedMin: 20 },
];

const SCRIPTS_DIR = process.env.SCRIPTS_DIR || '/Users/mattia/Projects/Onde/scripts';

async function getLogFileAge(logPath: string): Promise<{ ageMinutes: number | null; lastRun: string | null }> {
  try {
    const stats = await fs.promises.stat(logPath);
    const ageMs = Date.now() - stats.mtimeMs;
    const ageMinutes = Math.round(ageMs / (1000 * 60));
    return {
      ageMinutes,
      lastRun: stats.mtime.toISOString()
    };
  } catch {
    return { ageMinutes: null, lastRun: null };
  }
}

async function checkCronJobs(): Promise<CronJob[]> {
  const results: CronJob[] = [];

  for (const job of CRON_JOBS) {
    let logPath = '';
    if (job.log) {
      logPath = path.join(SCRIPTS_DIR, job.log);
    }

    const { ageMinutes, lastRun } = logPath 
      ? await getLogFileAge(logPath)
      : { ageMinutes: null, lastRun: null };

    let status: CronJob['status'] = 'unknown';
    
    if (ageMinutes !== null) {
      if (ageMinutes <= job.expectedMin * 1.5) {
        status = 'healthy';
      } else if (ageMinutes <= job.expectedMin * 3) {
        status = 'stale';
      } else {
        status = 'error';
      }
    }

    // Get schedule from crontab
    let schedule = '';
    try {
      const { stdout } = await execAsync(`crontab -l 2>/dev/null | grep -E "${job.log || job.script}" | head -1 | awk '{print $1, $2, $3, $4, $5}'`);
      schedule = stdout.trim() || 'unknown';
    } catch {
      schedule = 'unknown';
    }

    results.push({
      name: job.name,
      schedule,
      lastRun,
      status,
      ageMinutes,
      expectedIntervalMinutes: job.expectedMin
    });
  }

  return results;
}

export async function GET() {
  try {
    const cronJobs = await checkCronJobs();
    
    const allHealthy = cronJobs.every(j => j.status === 'healthy');
    const anyError = cronJobs.some(j => j.status === 'error');
    
    return NextResponse.json({
      status: anyError ? 'error' : allHealthy ? 'healthy' : 'degraded',
      jobs: cronJobs,
      checkedAt: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
      jobs: [],
      checkedAt: new Date().toISOString()
    }, { status: 500 });
  }
}
