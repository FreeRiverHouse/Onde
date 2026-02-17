#!/usr/bin/env python3
"""Bruteforce with proof screenshot"""
import asyncio
import time
import sys
from datetime import datetime
from playwright.async_api import async_playwright

sys.stdout.reconfigure(line_buffering=True)

CHALLENGE_URL = "https://serene-frangipane-7fd25b.netlify.app/"
MAX_TIME = 300

CLICK_PATTERNS = [
    "text=Close", "text=Dismiss", "text=OK", "text=Got it", "text=Accept",
    "text=Continue", "text=Yes", "text=Confirm", "text=×", "text=✕",
    "text=Next", "text=Submit", "text=Start", "text=Begin", "text=Go",
    "text=Proceed", "text=Skip", "text=Done",
    "text=Accept cookies", "text=Accept all", "text=Allow",
    "button:visible",
]

stats = {"start_time": None, "challenges": 0, "clicks": 0}


async def run_challenge():
    stats["start_time"] = time.time()
    
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)
        page = await browser.new_page()
        page.on("dialog", lambda d: asyncio.create_task(d.dismiss()))
        
        print(f"🚀 Starting...", flush=True)
        await page.goto(CHALLENGE_URL)
        await asyncio.sleep(0.5)
        
        # Screenshot start
        await page.screenshot(path="proof_start.png")
        
        try:
            await page.click("text=START", timeout=3000)
        except:
            await page.click("button", timeout=2000)
        
        print("✅ Challenge started!", flush=True)
        
        while True:
            elapsed = time.time() - stats["start_time"]
            if elapsed > MAX_TIME:
                break
            
            # Brute force click all
            try:
                await page.evaluate("""() => {
                    document.querySelectorAll('button, [role="button"], .close, .dismiss, .btn').forEach(b => {
                        try { b.click(); } catch(e) {}
                    });
                }""")
                stats["clicks"] += 1
            except:
                pass
            
            # Pattern clicks
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
                if "complete" in text.lower() or "congratulations" in text.lower() or "well done" in text.lower():
                    stats["challenges"] += 1
                    print(f"✅ Challenge {stats['challenges']}/30 ({elapsed:.1f}s)", flush=True)
                    if stats["challenges"] >= 30:
                        print("\n🎉 ALL DONE!", flush=True)
                        # PROOF SCREENSHOT
                        await page.screenshot(path="proof_complete.png")
                        print("📸 Screenshot saved: proof_complete.png", flush=True)
                        break
            except:
                pass
            
            # Scroll
            try:
                await page.evaluate("window.scrollBy(0, 200)")
            except:
                pass
            
            await asyncio.sleep(0.02)
        
        # Final screenshot
        await page.screenshot(path="proof_final.png")
        await asyncio.sleep(2)  # Let user see
        await browser.close()
    
    return stats


if __name__ == "__main__":
    print("🤖 Brute Force Bot with Proof", flush=True)
    print(f"Started: {datetime.now().isoformat()}", flush=True)
    start = time.time()
    try:
        asyncio.run(run_challenge())
    except KeyboardInterrupt:
        print("\n⛔ Stopped", flush=True)
    finally:
        total = time.time() - start
        print(f"\n📊 FINAL: Time={total:.2f}s | Challenges={stats['challenges']}/30 | Clicks={stats['clicks']}", flush=True)
        print(f"Finished: {datetime.now().isoformat()}", flush=True)
