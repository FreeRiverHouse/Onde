/**
 * Moonlight Magic House - Continuous Exploratory Testing
 * 
 * Runs in a loop, exploring the app with a visible Chrome window.
 * Not a fixed script - randomly navigates, clicks, and tests things.
 * 
 * Created: 2026-01-30 per Mattia (ID: 2888)
 */

import { chromium, Page, Browser } from 'playwright';

const BASE_URL = 'https://onde.la/games/moonlight-magic-house/'; // Vite dev server
const SCREENSHOT_DIR = './test-screenshots/continuous';

// Rooms we can navigate to
const ROOMS = ['bedroom', 'kitchen', 'garden', 'library'];

// Helper: random element from array
function randomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Helper: random delay
async function randomDelay(min: number, max: number) {
  const ms = Math.floor(Math.random() * (max - min) + min);
  await new Promise(r => setTimeout(r, ms));
}

// Helper: screenshot with timestamp
async function screenshot(page: Page, name: string) {
  const ts = new Date().toISOString().replace(/[:.]/g, '-');
  const path = `${SCREENSHOT_DIR}/${ts}-${name}.png`;
  await page.screenshot({ path, fullPage: true });
  console.log(`📸 Screenshot: ${path}`);
}

// Exploratory action: click random interactive element
async function exploreInteractiveObjects(page: Page) {
  // Look for clickable elements in the scene
  const objects = await page.$$('[data-interactive="true"], .interactive-object, button:not([disabled])');
  
  if (objects.length > 0) {
    const obj = randomChoice(objects);
    const box = await obj.boundingBox();
    if (box) {
      console.log(`👆 Clicking object at (${box.x}, ${box.y})`);
      await obj.click();
      await randomDelay(500, 1500);
      await screenshot(page, 'after-click');
    }
  }
}

// Exploratory action: navigate to random room
async function navigateRandomRoom(page: Page) {
  const room = randomChoice(ROOMS);
  console.log(`🚪 Navigating to room: ${room}`);
  
  // Click room navigation (look for room button or arrow)
  const roomBtn = await page.$(`[data-room="${room}"], button:has-text("${room}")`);
  if (roomBtn) {
    await roomBtn.click();
    await randomDelay(1000, 2000);
  } else {
    // Try arrow navigation
    const arrows = await page.$$('.room-arrow, .nav-arrow, [data-nav]');
    if (arrows.length > 0) {
      const arrow = randomChoice(arrows);
      await arrow.click();
      await randomDelay(1000, 2000);
    }
  }
  
  await screenshot(page, `room-${room}`);
}

// Exploratory action: check stats/UI
async function checkStats(page: Page) {
  console.log('📊 Checking stats visibility...');
  
  const stats = await page.$('.stats-container, .stat-bar, [data-stat]');
  if (stats) {
    const isVisible = await stats.isVisible();
    console.log(`  Stats visible: ${isVisible}`);
  }
  
  await screenshot(page, 'stats-check');
}

// Exploratory action: test 3D scene (if present)
async function test3DScene(page: Page) {
  console.log('🎮 Testing 3D scene...');
  
  const canvas = await page.$('canvas');
  if (canvas) {
    const box = await canvas.boundingBox();
    if (box) {
      // Click center of canvas
      await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
      await randomDelay(500, 1000);
      
      // Try camera rotation
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await page.mouse.down();
      await page.mouse.move(box.x + box.width / 2 + 100, box.y + box.height / 2);
      await page.mouse.up();
      
      await screenshot(page, '3d-interaction');
    }
  }
}

// Exploratory action: test keyboard controls
async function testKeyboardControls(page: Page) {
  console.log('⌨️ Testing keyboard controls...');
  
  const keys = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Space'];
  const key = randomChoice(keys);
  
  await page.keyboard.press(key);
  await randomDelay(500, 1000);
  await screenshot(page, `key-${key}`);
}

// Main exploratory loop
async function runExploratoryTests() {
  console.log('🌙 Moonlight Magic House - Continuous Exploratory Testing');
  console.log('=' .repeat(60));
  
  const browser = await chromium.launch({
    headless: false,  // VISIBLE BROWSER
    slowMo: 200,      // Slow down for visibility
  });
  
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
  });
  
  const page = await context.newPage();
  
  // Go to the app
  console.log(`🌐 Loading ${BASE_URL}...`);
  await page.goto(BASE_URL);
  await page.waitForLoadState('networkidle');
  await screenshot(page, 'initial-load');
  
  // List of exploratory actions
  const actions = [
    exploreInteractiveObjects,
    navigateRandomRoom,
    checkStats,
    test3DScene,
    testKeyboardControls,
  ];
  
  let iteration = 0;
  
  // Run forever (or until killed)
  while (true) {
    iteration++;
    console.log(`\n--- Iteration ${iteration} (${new Date().toLocaleTimeString()}) ---`);
    
    try {
      // Pick 2-4 random actions
      const numActions = Math.floor(Math.random() * 3) + 2;
      
      for (let i = 0; i < numActions; i++) {
        const action = randomChoice(actions);
        await action(page);
        await randomDelay(1000, 3000);
      }
      
      // Check for errors in console
      page.on('console', msg => {
        if (msg.type() === 'error') {
          console.error(`❌ Console error: ${msg.text()}`);
        }
      });
      
      // Wait before next iteration
      console.log('⏳ Waiting 30 seconds before next iteration...');
      await new Promise(r => setTimeout(r, 30000));
      
      // Occasionally refresh
      if (Math.random() < 0.2) {
        console.log('🔄 Refreshing page...');
        await page.reload();
        await page.waitForLoadState('networkidle');
      }
      
    } catch (err) {
      console.error(`❌ Error during exploration: ${err}`);
      await screenshot(page, 'error-state');
      
      // Try to recover
      await page.goto(BASE_URL);
      await page.waitForLoadState('networkidle');
    }
  }
}

// Run it
runExploratoryTests().catch(console.error);
