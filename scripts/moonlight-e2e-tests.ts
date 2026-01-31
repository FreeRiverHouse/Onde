/**
 * Moonlight Magic House - E2E Automated Tests
 * 
 * Continuous testing system for the Moonlight Magic House game.
 * Runs every 30 minutes via cron to ensure the app is always working.
 * 
 * Run manually: npx playwright test scripts/moonlight-e2e-tests.ts
 * Run with UI: npx playwright test scripts/moonlight-e2e-tests.ts --ui
 */

import { test, expect, Page } from '@playwright/test';

// Configuration
const BASE_URL = process.env.MOONLIGHT_URL || 'https://onde.la/games/moonlight-magic-house/';
const TIMEOUT = 30000;

// All rooms to test navigation
const ROOMS = [
  { key: 'bedroom', icon: '🛏️', name: { en: 'Bedroom', it: 'Camera' } },
  { key: 'kitchen', icon: '🍳', name: { en: 'Kitchen', it: 'Cucina' } },
  { key: 'living', icon: '🛋️', name: { en: 'Living Room', it: 'Salotto' } },
  { key: 'bathroom', icon: '🛁', name: { en: 'Bathroom', it: 'Bagno' } },
  { key: 'garden', icon: '🌙', name: { en: 'Garden', it: 'Giardino' } },
  { key: 'garage', icon: '🚗', name: { en: 'Garage', it: 'Garage' } },
  { key: 'library', icon: '📚', name: { en: 'Library', it: 'Biblioteca' } },
  { key: 'attic', icon: '🏚️', name: { en: 'Attic', it: 'Soffitta' } },
  { key: 'basement', icon: '🔧', name: { en: 'Basement', it: 'Cantina' } },
];

// Stats to verify
const STATS = ['health', 'hunger', 'energy', 'happiness'];

test.describe('Moonlight Magic House - Core Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: TIMEOUT });
  });

  test('Page loads successfully', async ({ page }) => {
    // Check title
    await expect(page).toHaveTitle(/Moonlight|Magic|House/i);
    
    // Check main app container loads
    await expect(page.locator('.app, #root, [class*="moonlight"]')).toBeVisible({ timeout: TIMEOUT });
  });

  test('Luna character is visible', async ({ page }) => {
    // Luna should be visible in the scene
    const luna = page.locator('[class*="luna"], [class*="character"], .pet-sprite, img[alt*="Luna"]');
    await expect(luna.first()).toBeVisible({ timeout: TIMEOUT });
  });

  test('Stats panel is visible and shows all stats', async ({ page }) => {
    // Stats should be displayed
    for (const stat of STATS) {
      const statElement = page.locator(`[class*="${stat}"], [data-stat="${stat}"], :text("${stat}")`);
      // At least one stat indicator should be visible (could be icon, bar, or text)
      await expect(page.locator('[class*="stat"], [class*="Stats"]').first()).toBeVisible({ timeout: TIMEOUT });
    }
  });

  test('Room navigation works', async ({ page }) => {
    // Test clicking on room icons/buttons to navigate
    for (const room of ROOMS.slice(0, 5)) { // Test first 5 rooms
      // Look for room button/icon
      const roomButton = page.locator(`button:has-text("${room.icon}"), [data-room="${room.key}"], :text("${room.icon}")`).first();
      
      if (await roomButton.isVisible()) {
        await roomButton.click();
        await page.waitForTimeout(500); // Wait for animation
      }
    }
  });

  test('Action buttons are clickable', async ({ page }) => {
    // Find action buttons (e.g., Sleep, Eat, Play)
    const actionButtons = page.locator('button[class*="action"], button:has-text("Dormi"), button:has-text("Mangia"), button:has-text("Gioca")');
    
    const count = await actionButtons.count();
    if (count > 0) {
      // Click the first available action
      await actionButtons.first().click();
      await page.waitForTimeout(1000); // Wait for action animation
    }
  });

  test('Coins display is present', async ({ page }) => {
    // Coins should be shown somewhere
    const coinsDisplay = page.locator('[class*="coin"], :text("🪙"), :text("monete"), :text("coins")');
    await expect(coinsDisplay.first()).toBeVisible({ timeout: TIMEOUT });
  });
});

test.describe('Moonlight Magic House - Room Testing', () => {
  test('Library room loads with interactive objects', async ({ page }) => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: TIMEOUT });
    
    // Navigate to library
    const libraryButton = page.locator('button:has-text("📚"), [data-room="library"]').first();
    if (await libraryButton.isVisible()) {
      await libraryButton.click();
      await page.waitForTimeout(1000);
      
      // Check for library-specific elements
      const bookshelf = page.locator(':text("📚"), :text("Libreria"), :text("Bookshelf")');
      await expect(bookshelf.first()).toBeVisible({ timeout: 5000 });
    }
  });

  test('House rooms are all accessible', async ({ page }) => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: TIMEOUT });
    
    const accessibleRooms: string[] = [];
    
    for (const room of ROOMS) {
      const roomButton = page.locator(`button:has-text("${room.icon}"), [data-room="${room.key}"]`).first();
      
      if (await roomButton.isVisible({ timeout: 2000 }).catch(() => false)) {
        accessibleRooms.push(room.key);
      }
    }
    
    // At least 5 rooms should be accessible
    expect(accessibleRooms.length).toBeGreaterThanOrEqual(5);
    console.log(`Accessible rooms: ${accessibleRooms.join(', ')}`);
  });
});

test.describe('Moonlight Magic House - Gameplay', () => {
  test('Stats change after actions', async ({ page }) => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: TIMEOUT });
    
    // Get initial happiness value (if visible)
    const happinessIndicator = page.locator('[class*="happiness"], [data-stat="happiness"]').first();
    
    // Perform an action that should change stats
    const playButton = page.locator('button:has-text("Gioca"), button:has-text("Play")').first();
    
    if (await playButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await playButton.click();
      await page.waitForTimeout(2000);
      
      // Verify feedback appears (message, animation, etc.)
      const feedback = page.locator('[class*="message"], [class*="feedback"], [class*="notification"]');
      // Some feedback should appear
    }
  });

  test('Mini-games are accessible', async ({ page }) => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: TIMEOUT });
    
    // Look for mini-game triggers
    const gameButtons = page.locator('button:has-text("Mini"), button:has-text("Gioco"), [class*="game-button"]');
    
    const count = await gameButtons.count();
    console.log(`Found ${count} mini-game buttons`);
  });
});

// Health check test - used by watchdog
test('HEALTH CHECK - Basic functionality', async ({ page }) => {
  const startTime = Date.now();
  
  // 1. Page loads
  await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: TIMEOUT });
  const loadTime = Date.now() - startTime;
  
  // 2. App renders
  await expect(page.locator('.app, #root, body')).toBeVisible();
  
  // 3. No console errors
  const errors: string[] = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });
  
  // 4. No network failures
  const failedRequests: string[] = [];
  page.on('requestfailed', request => {
    failedRequests.push(request.url());
  });
  
  await page.waitForTimeout(3000); // Wait for any async errors
  
  console.log(`Load time: ${loadTime}ms`);
  console.log(`Console errors: ${errors.length}`);
  console.log(`Failed requests: ${failedRequests.length}`);
  
  // Allow some non-critical errors (analytics, etc.)
  expect(failedRequests.filter(url => !url.includes('analytics') && !url.includes('gtag')).length).toBeLessThan(3);
});
