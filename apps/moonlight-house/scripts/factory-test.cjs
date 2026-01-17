/**
 * Factory Test Script per Moonlight Tamagotchi
 * Onde Apps - Test Suite Completo con Puppeteer
 *
 * Usage: node scripts/factory-test.js [port]
 *
 * Requires: npm install puppeteer --save-dev
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const APP_NAME = 'moonlight-tamagotchi';
const PORT = process.argv[2] || 1112;
const URL = `http://localhost:${PORT}`;
const SCREENSHOTS_DIR = path.join(__dirname, '..', 'test-screenshots');

async function testApp() {
    console.log(`\n🧪 Factory Test: ${APP_NAME}`);
    console.log(`📍 URL: ${URL}`);
    console.log('='.repeat(50));

    // Ensure screenshots directory exists
    if (!fs.existsSync(SCREENSHOTS_DIR)) {
        fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
    }

    const results = {
        appName: APP_NAME,
        port: PORT,
        url: URL,
        timestamp: new Date().toISOString(),
        tests: [],
        errors: [],
        screenshots: []
    };

    let browser;
    try {
        browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const page = await browser.newPage();

        // Set viewport to mobile-like size
        await page.setViewport({ width: 480, height: 800 });

        // Collect console errors
        page.on('console', msg => {
            if (msg.type() === 'error') {
                results.errors.push(msg.text());
            }
        });

        // Test 1: Page loads
        console.log('\n1. Loading page...');
        await page.goto(URL, { waitUntil: 'networkidle2', timeout: 30000 });
        const screenshot1 = path.join(SCREENSHOTS_DIR, '01-initial-load.png');
        await page.screenshot({ path: screenshot1, fullPage: true });
        results.tests.push({ name: 'Page loads', status: 'PASS' });
        results.screenshots.push(screenshot1);
        console.log('   ✅ Page loaded');

        // Test 2: Check title
        console.log('\n2. Checking title...');
        const title = await page.title();
        if (title.includes('Moonlight') || title.includes('Vite')) {
            results.tests.push({ name: 'Title check', status: 'PASS', value: title });
            console.log(`   ✅ Title: ${title}`);
        } else {
            results.tests.push({ name: 'Title check', status: 'WARN', value: title });
            console.log(`   ⚠️ Title: ${title}`);
        }

        // Test 3: Check for main UI elements
        console.log('\n3. Checking UI elements...');

        // Wait for React to render
        await page.waitForSelector('.container', { timeout: 10000 });

        const elements = await page.evaluate(() => {
            return {
                hasContainer: !!document.querySelector('.container'),
                hasHeader: !!document.querySelector('.header'),
                hasTitle: !!document.querySelector('.title'),
                hasStats: !!document.querySelector('.stats-container'),
                hasActions: !!document.querySelector('.actions'),
                hasCharacter: !!document.querySelector('.character'),
                buttonCount: document.querySelectorAll('.action-btn').length,
                roomTabCount: document.querySelectorAll('.room-tab').length
            };
        });

        if (elements.hasContainer && elements.hasStats && elements.hasActions) {
            results.tests.push({ name: 'UI elements', status: 'PASS', elements });
            console.log('   ✅ All main UI elements found');
            console.log(`      - Buttons: ${elements.buttonCount}`);
            console.log(`      - Room tabs: ${elements.roomTabCount}`);
        } else {
            results.tests.push({ name: 'UI elements', status: 'FAIL', elements });
            console.log('   ❌ Missing UI elements');
        }

        // Test 4: Click action buttons
        console.log('\n4. Testing action buttons...');
        const buttons = await page.$$('.action-btn');

        for (let i = 0; i < buttons.length; i++) {
            const buttonText = await buttons[i].evaluate(el => {
                const label = el.querySelector('.action-label');
                return label ? label.innerText : 'Unknown';
            });

            console.log(`   Clicking: ${buttonText}...`);
            await buttons[i].click();
            await new Promise(r => setTimeout(r, 500)); // Wait for animation

            const screenshotPath = path.join(SCREENSHOTS_DIR, `02-click-${buttonText.toLowerCase()}.png`);
            await page.screenshot({ path: screenshotPath, fullPage: true });
            results.screenshots.push(screenshotPath);
            results.tests.push({ name: `Click: ${buttonText}`, status: 'PASS' });
            console.log(`   ✅ ${buttonText} clicked`);

            // Wait for action to complete
            await new Promise(r => setTimeout(r, 2000));
        }

        // Test 5: Click room tabs
        console.log('\n5. Testing room navigation...');
        const roomTabs = await page.$$('.room-tab');

        for (let i = 0; i < roomTabs.length; i++) {
            const tabIcon = await roomTabs[i].evaluate(el => {
                const icon = el.querySelector('.room-tab-icon');
                return icon ? icon.innerText : 'Tab';
            });

            console.log(`   Switching to room: ${tabIcon}...`);
            await roomTabs[i].click();
            await new Promise(r => setTimeout(r, 300));

            const screenshotPath = path.join(SCREENSHOTS_DIR, `03-room-${i + 1}.png`);
            await page.screenshot({ path: screenshotPath, fullPage: true });
            results.screenshots.push(screenshotPath);
            results.tests.push({ name: `Room: ${tabIcon}`, status: 'PASS' });
            console.log(`   ✅ Room ${tabIcon} loaded`);
        }

        // Test 6: Check for console errors
        console.log('\n6. Checking console errors...');
        if (results.errors.length === 0) {
            results.tests.push({ name: 'No console errors', status: 'PASS' });
            console.log('   ✅ No console errors');
        } else {
            results.tests.push({ name: 'Console errors', status: 'WARN', count: results.errors.length });
            console.log(`   ⚠️ ${results.errors.length} console error(s)`);
            results.errors.forEach(e => console.log(`      - ${e.substring(0, 80)}...`));
        }

        // Final screenshot
        const finalScreenshot = path.join(SCREENSHOTS_DIR, '04-final-state.png');
        await page.screenshot({ path: finalScreenshot, fullPage: true });
        results.screenshots.push(finalScreenshot);

    } catch (error) {
        results.tests.push({ name: 'Runtime', status: 'FAIL', error: error.message });
        console.log(`\n❌ Error: ${error.message}`);
    } finally {
        if (browser) {
            await browser.close();
        }
    }

    // Calculate summary
    const passed = results.tests.filter(t => t.status === 'PASS').length;
    const failed = results.tests.filter(t => t.status === 'FAIL').length;
    const warnings = results.tests.filter(t => t.status === 'WARN').length;

    results.summary = { passed, failed, warnings, total: results.tests.length };

    // Save results
    const resultsPath = path.join(SCREENSHOTS_DIR, 'results.json');
    fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));

    // Print summary
    console.log('\n' + '='.repeat(50));
    console.log(`📊 Test Results for ${APP_NAME}`);
    console.log('='.repeat(50));
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`⚠️ Warnings: ${warnings}`);
    console.log(`📸 Screenshots: ${results.screenshots.length}`);
    console.log(`\n📁 Results saved to: ${resultsPath}`);
    console.log(`📂 Screenshots in: ${SCREENSHOTS_DIR}`);

    if (failed > 0) {
        console.log('\n🚨 FACTORY MODE: App NOT ready - fix failures first');
        process.exit(1);
    } else {
        console.log('\n🎉 FACTORY MODE: App PASSED all tests!');
    }

    return results;
}

testApp().catch(console.error);
