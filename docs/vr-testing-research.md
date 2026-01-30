# VR/WebXR Testing Automation Research (T725)

*Goal: Enable automated testing so Mattia can put on headset → localhost → everything works*

## Executive Summary

For our WebXR-based VR Reader app, **Playwright + WebXR Device API Mock** is the recommended approach for automated testing. This allows us to:
1. Test without physical hardware
2. Run in CI/CD pipelines
3. Verify rendering, interactions, and performance

---

## Testing Approaches Compared

### 1. Playwright + WebXR Mock ⭐ RECOMMENDED

**Pros:**
- Native browser automation
- WebXR Device API can be mocked
- Works in CI without hardware
- Supports Chrome, Firefox, Edge
- Can screenshot/record sessions
- Already used in web ecosystem

**Cons:**
- Mocked XR != real device behavior
- Some WebXR features may not mock well
- Need separate real device smoke tests

**How it works:**
```javascript
// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  use: {
    // Inject WebXR mock
    contextOptions: {
      permissions: ['xr-spatial-tracking'],
    },
  },
});

// test/vr-reader.spec.ts
import { test, expect } from '@playwright/test';

test('VR scene loads correctly', async ({ page }) => {
  // Mock WebXR API
  await page.addInitScript(() => {
    // Mock navigator.xr
    (navigator as any).xr = {
      isSessionSupported: async (mode: string) => mode === 'immersive-vr',
      requestSession: async () => ({
        // Mock session...
      }),
    };
  });

  await page.goto('http://localhost:3000/reader-vr');
  
  // Verify scene loaded
  await expect(page.locator('canvas')).toBeVisible();
  
  // Take screenshot for visual regression
  await expect(page).toHaveScreenshot('vr-scene-loaded.png');
});
```

**Libraries:**
- `@playwright/test` - Core framework
- `immersive-web/webxr-polyfill` - WebXR polyfill for mocking
- Custom mock layer for XRSession, XRFrame, etc.

---

### 2. WebXR Emulator Extension

**Pros:**
- Chrome DevTools extension available
- Real browser, mocked device
- Can simulate different headsets (Quest, Vive, etc.)
- Interactive debugging

**Cons:**
- Manual testing, not fully automatable
- Extension must be manually installed

**Use case:** Developer debugging, manual QA

---

### 3. Quest Browser Remote Debugging

**Pros:**
- Tests on actual Quest hardware
- Real performance metrics
- Real WebXR API behavior

**Cons:**
- Requires physical device connected
- Slower test cycles
- Can't run in cloud CI

**Setup:**
```bash
# Enable developer mode on Quest
# Connect via USB
adb devices
# Open chrome://inspect on desktop
# Navigate to Quest browser tab
```

**Use case:** Final validation before release, performance testing

---

### 4. Unity Test Framework (Native VR)

**Not applicable** - We're using WebXR, not Unity. But noted for reference:
- Unity Test Runner for C# tests
- XR Interaction Toolkit test utilities
- Mock XR providers

---

### 5. Puppeteer + WebXR

Similar to Playwright but:
- Less maintained for XR use cases
- Playwright is preferred in 2025+

---

## Recommended Testing Strategy

### Tier 1: Automated CI (Every PR)
- **Tool:** Playwright + WebXR Mock
- **Tests:**
  - Scene loads without errors
  - Book content renders
  - UI elements visible (settings, TOC, etc.)
  - Basic navigation works
  - Visual regression screenshots
  - Performance budget (load time < 3s)

### Tier 2: Device Smoke Tests (Daily/Weekly)
- **Tool:** Quest Browser + ADB + Puppeteer
- **Tests:**
  - VR session starts
  - Controller input works
  - No crashes for 5 minutes
  - Frame rate > 60fps

### Tier 3: Manual QA (Before Release)
- **Tool:** Human with headset
- **Tests:**
  - Reading experience is comfortable
  - No motion sickness issues
  - Text legibility
  - Ambient sounds work

---

## Implementation Plan

### Phase 1: Playwright Setup (2-3 hours)
1. Add `@playwright/test` to reader-vr
2. Create WebXR mock helper
3. Write basic smoke tests
4. Add to npm scripts

### Phase 2: Visual Regression (1-2 hours)
1. Configure Playwright screenshots
2. Store baseline images
3. Add comparison in CI

### Phase 3: Quest Remote Testing (Optional, 2-3 hours)
1. Script for ADB connection
2. Automated browser navigation
3. Performance capture

---

## Code Example: Full Playwright Setup

```bash
# Install
cd apps/reader-vr
npm install -D @playwright/test
npx playwright install chromium
```

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

```typescript
// tests/helpers/webxr-mock.ts
export async function setupWebXRMock(page: Page) {
  await page.addInitScript(() => {
    const mockXRSession = {
      requestReferenceSpace: async () => ({}),
      requestAnimationFrame: (cb: FrameRequestCallback) => requestAnimationFrame(cb),
      end: async () => {},
    };

    const mockXR = {
      isSessionSupported: async (mode: string) => 
        ['immersive-vr', 'immersive-ar', 'inline'].includes(mode),
      requestSession: async (mode: string) => mockXRSession,
      addEventListener: () => {},
      removeEventListener: () => {},
    };

    Object.defineProperty(navigator, 'xr', {
      value: mockXR,
      writable: true,
    });
  });
}
```

```typescript
// tests/vr-reader.spec.ts
import { test, expect } from '@playwright/test';
import { setupWebXRMock } from './helpers/webxr-mock';

test.describe('VR Reader', () => {
  test.beforeEach(async ({ page }) => {
    await setupWebXRMock(page);
  });

  test('loads library scene', async ({ page }) => {
    await page.goto('/reader-vr');
    
    // Wait for Three.js canvas
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible({ timeout: 10000 });
    
    // Check for VR button
    await expect(page.getByText(/enter vr/i)).toBeVisible();
  });

  test('displays book content', async ({ page }) => {
    await page.goto('/reader-vr');
    
    // Wait for scene load
    await page.waitForTimeout(2000);
    
    // Screenshot for visual regression
    await expect(page).toHaveScreenshot('library-scene.png', {
      maxDiffPixels: 100,
    });
  });

  test('settings panel opens', async ({ page }) => {
    await page.goto('/reader-vr');
    await page.waitForTimeout(2000);
    
    // Look for settings button in UI
    const settingsBtn = page.getByRole('button', { name: /settings/i });
    if (await settingsBtn.isVisible()) {
      await settingsBtn.click();
      await expect(page.getByText(/font size/i)).toBeVisible();
    }
  });

  test('page navigation works', async ({ page }) => {
    await page.goto('/reader-vr');
    await page.waitForTimeout(2000);
    
    // Simulate arrow key for page turn
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(500);
    
    // Take screenshot to verify content changed
    await expect(page).toHaveScreenshot('after-page-turn.png', {
      maxDiffPixels: 500, // Allow more variance for animated content
    });
  });
});
```

---

## npm Scripts to Add

```json
{
  "scripts": {
    "test": "playwright test",
    "test:ui": "playwright test --ui",
    "test:headed": "playwright test --headed",
    "test:update-snapshots": "playwright test --update-snapshots"
  }
}
```

---

## CI/CD Integration

```yaml
# .github/workflows/vr-tests.yml
name: VR Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - name: Install dependencies
        run: |
          cd apps/reader-vr
          npm ci
          npx playwright install --with-deps chromium
      - name: Run tests
        run: |
          cd apps/reader-vr
          npm test
      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-report
          path: apps/reader-vr/playwright-report/
```

---

## Success Criteria

✅ Mattia runs `npm test` → all green
✅ CI blocks bad PRs
✅ Visual regressions caught automatically
✅ No manual clicking required for basic validation
✅ Quest testing documented for deeper checks

---

## References

- [Playwright Docs](https://playwright.dev/)
- [WebXR Device API](https://immersive-web.github.io/webxr/)
- [WebXR Emulator](https://github.com/nicoraves/webxr-emulator)
- [Three.js Testing](https://threejs.org/docs/)
- [Meta Quest Developer Docs](https://developer.oculus.com/documentation/)

---

*Document created: 2026-01-31 by @clawd*
*Task: T725 - VR Testing Automatico Programmatico*
