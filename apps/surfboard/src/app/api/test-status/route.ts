import { NextResponse } from 'next/server'

export const runtime = 'edge'

// Test status API - fetches from GitHub raw content
// The daily-test-suite.py commits results to scripts/daily-test-report.json
const REPORT_URL = 'https://raw.githubusercontent.com/FreeRiverHouse/Onde/main/scripts/daily-test-report.json'

export async function GET() {
  try {
    // Fetch latest report from GitHub
    const res = await fetch(REPORT_URL, {
      headers: {
        'Cache-Control': 'no-cache',
      },
      next: { revalidate: 300 }, // Revalidate every 5 minutes
    })

    if (!res.ok) {
      // Return mock data if file not found
      return NextResponse.json({
        timestamp: new Date().toISOString(),
        run_type: 'unknown',
        tests: [],
        summary: {
          total: 0,
          passed: 0,
          failed: 0,
          skipped: 0,
        },
        alerts: [],
        error: 'Report not found - tests may not have run yet',
      })
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({
      timestamp: new Date().toISOString(),
      run_type: 'error',
      tests: [],
      summary: {
        total: 0,
        passed: 0,
        failed: 0,
        skipped: 0,
      },
      alerts: [],
      error: error instanceof Error ? error.message : 'Failed to fetch test status',
    })
  }
}
