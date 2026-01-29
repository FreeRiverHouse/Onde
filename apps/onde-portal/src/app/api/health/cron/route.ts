import { NextResponse } from 'next/server';

// Static export compatibility
export const dynamic = 'force-static';

// For static export, return a message indicating this requires server deployment
// Real cron status monitoring requires server-side file access
export async function GET() {
  return NextResponse.json({
    status: 'unavailable',
    message: 'Cron status monitoring requires server-side deployment. This static export cannot access local files.',
    hint: 'Deploy with Node.js or use the CLI: scripts/check-heartbeat-state.sh',
    jobs: [],
    checkedAt: new Date().toISOString()
  });
}
