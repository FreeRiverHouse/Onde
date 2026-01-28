import { NextResponse } from 'next/server';

interface ServiceStatus {
  name: string;
  status: 'up' | 'down' | 'unknown';
  latency?: number;
  message?: string;
}

async function checkService(name: string, url: string): Promise<ServiceStatus> {
  const start = Date.now();
  try {
    const response = await fetch(url, { 
      method: 'HEAD',
      signal: AbortSignal.timeout(5000)
    });
    const latency = Date.now() - start;
    return {
      name,
      status: response.ok ? 'up' : 'down',
      latency,
      message: response.ok ? 'OK' : `HTTP ${response.status}`
    };
  } catch (error) {
    return {
      name,
      status: 'down',
      latency: Date.now() - start,
      message: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

export async function GET() {
  const services: ServiceStatus[] = [];
  
  // Check onde.la (this site)
  services.push({
    name: 'onde.la',
    status: 'up',
    message: 'Self check'
  });

  // Check external services
  const checks = [
    { name: 'onde.surf', url: 'https://onde.surf' },
    { name: 'GitHub API', url: 'https://api.github.com' },
  ];

  const results = await Promise.all(
    checks.map(({ name, url }) => checkService(name, url))
  );
  
  services.push(...results);

  // Calculate overall status
  const allUp = services.every(s => s.status === 'up');
  const anyDown = services.some(s => s.status === 'down');
  
  const response = {
    status: allUp ? 'healthy' : anyDown ? 'degraded' : 'unknown',
    timestamp: new Date().toISOString(),
    services,
    version: process.env.npm_package_version || '1.0.0',
    uptime: process.uptime ? `${Math.floor(process.uptime())}s` : 'N/A'
  };

  return NextResponse.json(response, {
    status: allUp ? 200 : 503,
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate'
    }
  });
}
