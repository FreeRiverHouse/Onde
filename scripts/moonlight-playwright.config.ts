/**
 * Playwright Config for Moonlight Magic House E2E Tests
 */

import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './',
  testMatch: 'moonlight-e2e-tests.ts',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 1,
  workers: 1,
  reporter: [
    ['list'],
    ['html', { outputFolder: '../test-results/moonlight-report', open: 'never' }],
  ],
  use: {
    baseURL: process.env.MOONLIGHT_URL || 'https://onde.la/games/moonlight-magic-house/',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    headless: true,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  timeout: 60000,
  expect: {
    timeout: 10000,
  },
  outputDir: '../test-results/moonlight-artifacts',
});
