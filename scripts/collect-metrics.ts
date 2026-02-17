#!/usr/bin/env npx ts-node

/**
 * Metrics Collection Script
 * 
 * Collects metrics from various sources and pushes them to onde.surf
 * Run this via cron or manually to keep dashboard data up to date.
 * 
 * Usage:
 *   npx ts-node scripts/collect-metrics.ts
 *   
 * Environment variables:
 *   SURFBOARD_API_URL - Base URL for surfboard API (default: https://onde.surf)
 *   SURFBOARD_API_KEY - API key for authentication
 *   GOOGLE_APPLICATION_CREDENTIALS - Path to Google service account JSON
 *   GA4_PROPERTY_ID - Google Analytics 4 property ID
 */

import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

interface MetricEntry {
  key: string
  value: number
  source: string
  date?: string
}

const API_URL = process.env.SURFBOARD_API_URL || 'https://onde.surf'

async function collectGitHubStats(): Promise<MetricEntry[]> {
  const metrics: MetricEntry[] = []
  
  try {
    // Get GitHub repo stats using gh CLI
    const { stdout } = await execAsync('gh api repos/FreeRiverHouse/Onde --jq ".stargazers_count, .forks_count, .open_issues_count"')
    const [stars, forks, issues] = stdout.trim().split('\n').map(Number)
    
    metrics.push(
      { key: 'github_stars', value: stars, source: 'github' },
      { key: 'github_forks', value: forks, source: 'github' },
      { key: 'github_issues', value: issues, source: 'github' }
    )
  } catch (error) {
    console.error('Failed to collect GitHub stats:', error)
  }
  
  return metrics
}

async function collectPublishingStats(): Promise<MetricEntry[]> {
  const metrics: MetricEntry[] = []
  
  try {
    // Count books in the books directory
    const { stdout: booksCount } = await execAsync('find ~/Projects/Onde/books -name "*.md" -type f | wc -l')
    metrics.push({
      key: 'books_published',
      value: parseInt(booksCount.trim()) || 0,
      source: 'local'
    })
  } catch (error) {
    console.error('Failed to count books:', error)
  }
  
  return metrics
}

async function collectTaskStats(): Promise<MetricEntry[]> {
  const metrics: MetricEntry[] = []
  
  try {
    // Read TASKS.md and count statuses
    const { stdout } = await execAsync('cat ~/Projects/Onde/TASKS.md 2>/dev/null || echo ""')
    
    const doneCount = (stdout.match(/Status:\s*DONE/gi) || []).length
    const inProgressCount = (stdout.match(/Status:\s*IN_PROGRESS/gi) || []).length
    const todoCount = (stdout.match(/Status:\s*TODO/gi) || []).length
    
    metrics.push(
      { key: 'tasks_completed', value: doneCount, source: 'local' },
      { key: 'tasks_in_progress', value: inProgressCount, source: 'local' },
      { key: 'tasks_total', value: doneCount + inProgressCount + todoCount, source: 'local' }
    )
  } catch (error) {
    console.error('Failed to collect task stats:', error)
  }
  
  return metrics
}

async function pushMetrics(metrics: MetricEntry[]): Promise<void> {
  if (metrics.length === 0) {
    console.log('No metrics to push')
    return
  }
  
  console.log(`Pushing ${metrics.length} metrics to ${API_URL}/api/metrics`)
  
  try {
    const response = await fetch(`${API_URL}/api/metrics`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Add auth header if needed
        // 'Authorization': `Bearer ${process.env.SURFBOARD_API_KEY}`
      },
      body: JSON.stringify({ metrics })
    })
    
    if (!response.ok) {
      const text = await response.text()
      throw new Error(`HTTP ${response.status}: ${text}`)
    }
    
    const result = await response.json()
    console.log('Metrics pushed successfully:', result)
  } catch (error) {
    console.error('Failed to push metrics:', error)
  }
}

async function main() {
  console.log('=== Metrics Collection Started ===')
  console.log(`Date: ${new Date().toISOString()}`)
  console.log('')
  
  const allMetrics: MetricEntry[] = []
  
  // Collect from all sources
  console.log('Collecting GitHub stats...')
  allMetrics.push(...await collectGitHubStats())
  
  console.log('Collecting publishing stats...')
  allMetrics.push(...await collectPublishingStats())
  
  console.log('Collecting task stats...')
  allMetrics.push(...await collectTaskStats())
  
  // Log collected metrics
  console.log('')
  console.log('Collected metrics:')
  for (const m of allMetrics) {
    console.log(`  ${m.key}: ${m.value} (from ${m.source})`)
  }
  
  // Push to API
  console.log('')
  await pushMetrics(allMetrics)
  
  console.log('')
  console.log('=== Metrics Collection Complete ===')
}

main().catch(console.error)
