#!/usr/bin/env python3
"""
REAL Browser Challenge Solver
Pure Playwright - NO external AI calls
Try ALL buttons until one advances the step
"""
import asyncio
import time
import sys
from playwright.async_api import async_playwright

sys.stdout.reconfigure(line_buffering=True)

URL = "https://serene-frangipane-7fd25b.netlify.app/"

async def solve():
    start = time.time()
    
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)
        page = await browser.new_page()
        page.on('dialog', lambda d: asyncio.create_task(d.dismiss()))
        
        print(f'🚀 GO!', flush=True)
        await page.goto(URL)
        await asyncio.sleep(0.3)
        
        # Click START
        await page.click('text=START', timeout=5000)
        print('✅ Started!', flush=True)
        
        current_step = 0
        
        while time.time() - start < 300:
            # Check if finished
            if '/finish' in page.url:
                elapsed = time.time() - start
                print(f'\n🎉🎉🎉 FINISHED! Time: {elapsed:.1f}s 🎉🎉🎉', flush=True)
                await page.screenshot(path='WINNER.png', full_page=True)
                print(f'📸 WINNER.png saved!', flush=True)
                await asyncio.sleep(3)
                break
            
            # Detect step from URL
            url = page.url
            if 'step' in url:
                try:
                    step_num = int(url.split('step')[1].split('?')[0].split('/')[0])
                    if step_num != current_step:
                        elapsed = time.time() - start
                        print(f'✅ Step {step_num}/30 ({elapsed:.1f}s)', flush=True)
                        current_step = step_num
                except:
                    pass
            
            # STRATEGY: Click ALL buttons we can find
            # First scroll to load everything
            await page.evaluate('window.scrollTo(0, document.body.scrollHeight)')
            await asyncio.sleep(0.05)
            await page.evaluate('window.scrollTo(0, 0)')
            await asyncio.sleep(0.05)
            
            # Get all buttons
            buttons = await page.query_selector_all('button')
            
            # Try clicking each one
            for btn in buttons:
                try:
                    if await btn.is_visible():
                        text = await btn.inner_text()
                        await btn.click(timeout=100)
                        # Check if step changed
                        await asyncio.sleep(0.02)
                        if page.url != url:
                            print(f'🖱️ Button "{text[:20]}" worked!', flush=True)
                            break
                except:
                    pass
            
            # Also try clicking links
            links = await page.query_selector_all('a')
            for link in links[:10]:
                try:
                    if await link.is_visible():
                        await link.click(timeout=100)
                        await asyncio.sleep(0.02)
                except:
                    pass
            
            # Try dismissing any modals
            for selector in ['.close', '.dismiss', '[aria-label="Close"]', '.modal button']:
                try:
                    el = await page.query_selector(selector)
                    if el and await el.is_visible():
                        await el.click(timeout=100)
                except:
                    pass
            
            await asyncio.sleep(0.01)
        
        total = time.time() - start
        print(f'\n⏱️ Total: {total:.1f}s | Steps: {current_step}/30', flush=True)
        await browser.close()

if __name__ == '__main__':
    print('🤖 REAL Challenge Solver - Trying ALL buttons!', flush=True)
    asyncio.run(solve())
