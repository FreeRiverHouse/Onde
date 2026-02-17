#!/usr/bin/env python3
"""
REAL Solution - Enter codes to advance!
"""
import asyncio
import time
import sys
import re
from playwright.async_api import async_playwright

sys.stdout.reconfigure(line_buffering=True)

async def solve():
    start = time.time()
    
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)
        page = await browser.new_page()
        page.on('dialog', lambda d: asyncio.create_task(d.dismiss()))
        
        print('🚀 Starting!', flush=True)
        await page.goto('https://serene-frangipane-7fd25b.netlify.app/')
        await asyncio.sleep(0.3)
        
        # Click START
        await page.click('text=START', timeout=5000)
        print('✅ Challenge started!', flush=True)
        
        step = 0
        while time.time() - start < 300:
            # Check if finished
            if '/finish' in page.url:
                elapsed = time.time() - start
                print(f'\n🎉🎉🎉 FINISHED! Time: {elapsed:.1f}s 🎉🎉🎉', flush=True)
                await page.screenshot(path='WINNER.png', full_page=True)
                print('📸 WINNER.png saved!', flush=True)
                break
            
            # 1. Click "Reveal Code" if visible
            try:
                reveal_btn = page.locator('text=Reveal Code').first
                if await reveal_btn.is_visible(timeout=100):
                    await reveal_btn.click(timeout=500)
                    await asyncio.sleep(0.1)
            except:
                pass
            
            # 2. Find the code (usually 6 alphanumeric chars)
            try:
                # Look for code in various places
                body_text = await page.inner_text('body')
                # Codes are usually like "HC67EA" - 6 alphanumeric, uppercase
                codes = re.findall(r'\b[A-Z0-9]{6}\b', body_text)
                
                if codes:
                    code = codes[0]  # Take first code found
                    
                    # 3. Find input and enter code
                    input_field = page.locator('input').first
                    if await input_field.is_visible(timeout=100):
                        await input_field.fill(code)
                        await asyncio.sleep(0.05)
                        
                        # 4. Click Submit Code
                        submit_btn = page.locator('text=Submit Code').first
                        if await submit_btn.is_visible(timeout=100):
                            await submit_btn.click(timeout=500)
                            
                            # Check if advanced
                            await asyncio.sleep(0.1)
                            new_url = page.url
                            if 'step' in new_url:
                                try:
                                    new_step = int(re.search(r'step(\d+)', new_url).group(1))
                                    if new_step != step:
                                        elapsed = time.time() - start
                                        print(f'✅ Step {new_step}/30 ({elapsed:.1f}s) - Code: {code}', flush=True)
                                        step = new_step
                                except:
                                    pass
            except Exception as e:
                pass
            
            # Also try scrolling to reveal more content
            try:
                await page.evaluate('window.scrollBy(0, 300)')
            except:
                pass
            
            await asyncio.sleep(0.02)
        
        total = time.time() - start
        print(f'\n⏱️ Total: {total:.1f}s | Step: {step}/30', flush=True)
        await browser.close()

if __name__ == '__main__':
    print('🔐 Real Solution - Enter codes!', flush=True)
    asyncio.run(solve())
