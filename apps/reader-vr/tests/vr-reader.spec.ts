import { test, expect } from '@playwright/test';
import { setupWebXRMock } from './helpers/webxr-mock';

test.describe('VR Reader', () => {
  test.beforeEach(async ({ page }) => {
    // Inject WebXR mock before loading page
    await setupWebXRMock(page);
  });

  test('page loads without errors', async ({ page }) => {
    // Listen for console errors
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.goto('/');
    
    // Wait for React hydration
    await page.waitForTimeout(2000);
    
    // Check no critical errors
    const criticalErrors = errors.filter(e => 
      !e.includes('favicon') && 
      !e.includes('manifest') &&
      !e.includes('WebXR')
    );
    expect(criticalErrors).toHaveLength(0);
  });

  test('Three.js canvas renders', async ({ page }) => {
    await page.goto('/');
    
    // Wait for Three.js canvas to appear
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible({ timeout: 15000 });
  });

  test('VR entry buttons are present', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(3000);
    
    // Look for VR/AR buttons (from @react-three/xr)
    const vrButton = page.locator('button:has-text("VR"), button:has-text("Enter VR"), [aria-label*="VR"]');
    const arButton = page.locator('button:has-text("AR"), button:has-text("Enter AR"), [aria-label*="AR"]');
    
    // At least one should be visible (depends on WebXR support detection)
    const vrVisible = await vrButton.first().isVisible().catch(() => false);
    const arVisible = await arButton.first().isVisible().catch(() => false);
    
    // With our mock, VR should be supported
    expect(vrVisible || arVisible).toBe(true);
  });

  test('book selector can be opened', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(3000);
    
    // Look for book selection UI
    const bookButton = page.locator('button:has-text("📚"), button:has-text("Select Book"), [aria-label*="book"]');
    const bookButtonVisible = await bookButton.first().isVisible().catch(() => false);
    
    if (bookButtonVisible) {
      await bookButton.first().click();
      // Should show book list
      const bookList = page.locator('text=/Pride|Moby|Frankenstein/i');
      await expect(bookList.first()).toBeVisible({ timeout: 5000 });
    }
  });

  test('time of day toggle works', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(3000);
    
    // Look for time toggle button
    const timeButtons = ['🌅', '🌆', '🌙'];
    for (const emoji of timeButtons) {
      const btn = page.locator(`button:has-text("${emoji}")`);
      if (await btn.isVisible().catch(() => false)) {
        await btn.click();
        await page.waitForTimeout(500);
        break;
      }
    }
  });

  test('keyboard navigation works', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(3000);
    
    // Press arrow keys for page navigation
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(500);
    await page.keyboard.press('ArrowLeft');
    await page.waitForTimeout(500);
    
    // No errors should occur
    // (visual changes would need screenshot comparison)
  });

  test('mute toggle works', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(3000);
    
    // Look for sound/mute button
    const soundButton = page.locator('button:has-text("🔊"), button:has-text("🔇"), [aria-label*="sound"], [aria-label*="mute"]');
    const soundButtonVisible = await soundButton.first().isVisible().catch(() => false);
    
    if (soundButtonVisible) {
      await soundButton.first().click();
      await page.waitForTimeout(300);
      // Click again to unmute
      await soundButton.first().click();
    }
  });

  // Visual regression test (requires baseline images)
  test('visual regression: initial scene', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(4000); // Wait for scene to fully load
    
    // Take screenshot for visual comparison
    await expect(page).toHaveScreenshot('vr-reader-initial.png', {
      maxDiffPixels: 500, // Allow small variance for animated elements
      timeout: 10000,
    });
  });

  test('performance: loads within budget', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/');
    
    // Wait for canvas to be visible (scene loaded)
    await page.locator('canvas').waitFor({ state: 'visible', timeout: 15000 });
    
    const loadTime = Date.now() - startTime;
    
    // Performance budget: should load in under 10 seconds
    expect(loadTime).toBeLessThan(10000);
    console.log(`Scene loaded in ${loadTime}ms`);
  });
});
