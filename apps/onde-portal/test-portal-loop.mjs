#!/usr/bin/env node
/**
 * Programmatic test loop for Onde Portal
 * Tests all routes until they all pass
 *
 * Usage: node test-portal-loop.mjs [--once]
 * --once: Run once without loop (for CI)
 */

// Use onde-portal.pages.dev - the onde-71m project has Git integration issues
const BASE_URL = 'https://onde-portal.pages.dev';

// All routes to test
const routes = [
  '/',
  '/libri/',
  '/app/',
  '/giochi/',
  '/vr/',
  '/about/',
  '/catalogo/',
  '/account/',
  '/famiglia/',
  '/libreria/',
];

// Sample book routes to test
const bookRoutes = [
  '/libro/grimm-fairy-tales/',
  '/libro/andersen-fairy-tales/',
];

const allRoutes = [...routes, ...bookRoutes];

/**
 * Test a single route
 */
async function testRoute(route) {
  const url = `${BASE_URL}${route}`;
  try {
    const res = await fetch(url);
    const contentType = res.headers.get('content-type') || '';
    const isHtml = contentType.includes('text/html');

    // Check for error page content
    if (res.status === 200 && isHtml) {
      const text = await res.text();
      // Check if it's an error page
      if (text.includes('no nodejs_compat') || text.includes('Error -')) {
        return { route, status: 500, ok: false, error: 'nodejs_compat error page' };
      }
      // Check if it has actual content
      if (text.length < 100) {
        return { route, status: 204, ok: false, error: 'Empty or minimal content' };
      }
    }

    return {
      route,
      status: res.status,
      ok: res.status >= 200 && res.status < 400,
      contentType
    };
  } catch (error) {
    return { route, status: 0, ok: false, error: error.message };
  }
}

/**
 * Test all routes
 */
async function testAllRoutes() {
  console.log('\n========================================');
  console.log(`Testing ${allRoutes.length} routes at ${new Date().toISOString()}`);
  console.log('========================================\n');

  const results = [];
  let allPassed = true;

  for (const route of allRoutes) {
    const result = await testRoute(route);
    results.push(result);

    if (result.ok) {
      console.log(`  OK: ${route} (${result.status})`);
    } else {
      console.error(`  FAIL: ${route} = ${result.status} ${result.error || ''}`);
      allPassed = false;
    }
  }

  // Summary
  const passed = results.filter(r => r.ok).length;
  const failed = results.filter(r => !r.ok).length;

  console.log('\n----------------------------------------');
  console.log(`Summary: ${passed}/${results.length} passed, ${failed} failed`);
  console.log('----------------------------------------\n');

  return allPassed;
}

/**
 * Main loop
 */
async function main() {
  const runOnce = process.argv.includes('--once');
  const maxRetries = 30; // Max 30 retries (5 minutes with 10s delay)
  let retries = 0;

  console.log('Onde Portal Test Loop');
  console.log('======================');
  console.log(`Mode: ${runOnce ? 'Single run' : 'Loop until success'}`);
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Routes to test: ${allRoutes.length}`);

  while (true) {
    const success = await testAllRoutes();

    if (success) {
      console.log('ALL TESTS PASSED!');
      process.exit(0);
    }

    if (runOnce) {
      console.log('Tests failed (single run mode)');
      process.exit(1);
    }

    retries++;
    if (retries >= maxRetries) {
      console.error(`Max retries (${maxRetries}) reached. Giving up.`);
      process.exit(1);
    }

    console.log(`Retrying in 10 seconds... (attempt ${retries}/${maxRetries})`);
    await new Promise(r => setTimeout(r, 10000));
  }
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
