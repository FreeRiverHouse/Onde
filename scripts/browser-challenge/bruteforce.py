#!/usr/bin/env python3
"""
Browser Navigation Challenge - Brute Force Bot
No AI SDK needed - pure pattern matching + parallel clicking
"""

import asyncio
import time
import json
import sys
from datetime import datetime
from playwright.async_api import async_playwright

# Unbuffered output
sys.stdout.reconfigure(line_buffering=True)

CHALLENGE_URL = "https://serene-frangipane-7fd25b.netlify.app/"
MAX_TIME = 300  # 5 minutes

# Patterns for buttons to click (priority order)
CLICK_PATTERNS = [
    "text=Close", "text=Dismiss", "text=OK", "text=Got it", "text=Accept",
    "text=Continue", "text=Yes", "text=Confirm", "text=×", "text=✕",
    "text=Next", "text=Submit", "text=Start", "text=Begin", "text=Go",
    "text=Proceed", "text=Skip", "text=Done",
    "text=Accept cookies", "text=Accept all", "text=Allow",
    "button:visible",
]

stats = {"start_time": None, "challenges": 0, "clicks": 0, "scrolls": 0}


async def run_challenge():
    stats["start_time"] = time.time()
    
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)
        page = await browser.new_page()
        page.on("dialog", lambda d: asyncio.create_task(d.dismiss()))
        
        print(f"🚀 Starting...", flush=True)
        await page.goto(CHALLENGE_URL)
        await asyncio.sleep(0.5)
        
        try:
            await page.click("text=START", timeout=3000)
        except:
            await page.click("button", timeout=2000)
        
        print("✅ Challenge started!", flush=True)
        
        while True:
            elapsed = time.time() - stats["start_time"]
            if elapsed > MAX_TIME:
                print(f"\n⏰ TIME LIMIT", flush=True)
                break
            
            # Brute force click all buttons
            try:
                await page.evaluate("""() => {
                    document.querySelectorAll('button, [role="button"], .close, .dismiss').forEach(b => {
                        try { b.click(); } catch(e) {}
                    });
                }""")
                stats["clicks"] += 1
            except:
                pass
            
            # Try specific patterns
            for pattern in CLICK_PATTERNS[:5]:
                try:
                    loc = page.locator(pattern).first
                    if await loc.is_visible(timeout=50):
                        await loc.click(timeout=200)
                        stats["clicks"] += 1
                        break
                except:
                    continue
            
            # Check progress
            try:
                text = await page.inner_text("body", timeout=100)
                if "complete" in text.lower() or "congratulations" in text.lower():
                    stats["challenges"] += 1
                    print(f"✅ Challenge {stats['challenges']}/30 ({elapsed:.1f}s)", flush=True)
                    if stats["challenges"] >= 30:
                        print("\n🎉 ALL DONE!", flush=True)
                        break
            except:
                pass
            
            # Scroll
            try:
                await page.evaluate("window.scrollBy(0, 200)")
                stats["scrolls"] += 1
            except:
                pass
            
            await asyncio.sleep(0.02)
        
        await browser.close()


if __name__ == "__main__":
    print("🤖 Brute Force Bot", flush=True)
    try:
        asyncio.run(run_challenge())
    except KeyboardInterrupt:
        print("\n⛔ Stopped", flush=True)
    finally:
        total = time.time() - (stats["start_time"] or time.time())
        print(f"\n📊 Time: {total:.1f}s | Challenges: {stats['challenges']}/30 | Clicks: {stats['clicks']}", flush=True)
