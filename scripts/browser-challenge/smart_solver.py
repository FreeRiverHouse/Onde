#!/usr/bin/env python3
"""Smart Browser Challenge Solver - Explores and clicks strategically"""
import asyncio
import time
import sys
from playwright.async_api import async_playwright

sys.stdout.reconfigure(line_buffering=True)

async def solve():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)
        page = await browser.new_page()
        page.on('dialog', lambda d: asyncio.create_task(d.dismiss()))
        
        print('🚀 Starting...', flush=True)
        await page.goto('https://serene-frangipane-7fd25b.netlify.app/')
        await asyncio.sleep(0.5)
        
        start = time.time()
        
        # Click START
        try:
            await page.click('text=START', timeout=3000)
            print('✅ Challenge started!', flush=True)
        except Exception as e:
            print(f'❌ Could not start: {e}', flush=True)
            return
        
        last_url = page.url
        clicks = 0
        
        while time.time() - start < 300:
            elapsed = time.time() - start
            
            # Check if finished
            if '/finish' in page.url:
                print(f'\n🎉 FINISHED! Time: {elapsed:.1f}s', flush=True)
                await page.screenshot(path='RECEIPT.png', full_page=True)
                print('📸 RECEIPT.png saved!', flush=True)
                await asyncio.sleep(3)
                break
            
            # Log URL changes (step progression)
            if page.url != last_url:
                print(f'📍 Step change: {page.url} ({elapsed:.1f}s)', flush=True)
                last_url = page.url
            
            # Strategy 1: Close modals/popups (high priority)
            close_texts = ['Close', 'OK', 'Accept', 'Got it', 'Dismiss', '×', '✕', 'I agree', 'Allow']
            for text in close_texts:
                try:
                    loc = page.locator(f'text="{text}"').first
                    if await loc.is_visible(timeout=30):
                        await loc.click(timeout=100)
                        clicks += 1
                except:
                    pass
            
            # Strategy 2: Click navigation buttons
            nav_texts = ['Next', 'Continue', 'Proceed', 'Submit', 'Go', 'Begin', 'Start']
            for text in nav_texts:
                try:
                    loc = page.locator(f'text="{text}"').first
                    if await loc.is_visible(timeout=30):
                        await loc.click(timeout=100)
                        clicks += 1
                        print(f'🖱️ Clicked: {text}', flush=True)
                except:
                    pass
            
            # Strategy 3: Click visible buttons
            try:
                buttons = page.locator('button')
                count = await buttons.count()
                for i in range(min(count, 10)):
                    try:
                        btn = buttons.nth(i)
                        if await btn.is_visible(timeout=20):
                            await btn.click(timeout=50)
                            clicks += 1
                    except:
                        pass
            except:
                pass
            
            # Strategy 4: Scroll to reveal more content
            try:
                await page.evaluate('window.scrollBy(0, 400)')
            except:
                pass
            
            # Fast loop
            await asyncio.sleep(0.02)
        
        total = time.time() - start
        print(f'\n⏱️ Total: {total:.1f}s | Clicks: {clicks}', flush=True)
        await browser.close()

if __name__ == '__main__':
    print('🤖 Smart Browser Challenge Solver', flush=True)
    asyncio.run(solve())
