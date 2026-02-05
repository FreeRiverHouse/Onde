#!/usr/bin/env python3
"""
Browser Navigation Challenge Agent
Goal: Solve 30 challenges in under 5 minutes using Claude + Playwright
"""

import asyncio
import json
import time
import os
from datetime import datetime
from playwright.async_api import async_playwright
import anthropic

# Config
CHALLENGE_URL = "https://serene-frangipane-7fd25b.netlify.app/"
MAX_TIME_SECONDS = 300  # 5 minutes
MODEL = "claude-sonnet-4-20250514"  # Fast + capable

# Stats tracking
stats = {
    "start_time": None,
    "challenges_completed": 0,
    "total_tokens_in": 0,
    "total_tokens_out": 0,
    "actions_taken": 0,
    "errors": 0,
    "challenge_times": []
}

client = anthropic.Anthropic()

SYSTEM_PROMPT = """You are a browser automation agent solving UI challenges.

Given a page snapshot (simplified DOM), respond with ONE action in JSON format:
{"action": "click", "selector": "CSS selector or text"}
{"action": "type", "selector": "CSS selector", "text": "text to type"}
{"action": "scroll", "direction": "down" | "up", "amount": pixels}
{"action": "wait", "ms": milliseconds}
{"action": "dismiss_alert"}
{"action": "next_challenge"}  // When current challenge is complete

Rules:
- Be FAST - one action at a time, no explanations
- Look for buttons with text like "Next", "Continue", "Submit", navigation elements
- Dismiss popups/alerts/cookie banners quickly
- Scroll to find hidden elements if needed
- Output ONLY valid JSON, nothing else"""


async def get_page_snapshot(page):
    """Get simplified DOM snapshot for Claude"""
    snapshot = await page.evaluate("""() => {
        function getSnapshot(el, depth = 0) {
            if (depth > 5) return '';
            if (!el || el.nodeType !== 1) return '';
            
            const tag = el.tagName.toLowerCase();
            const skip = ['script', 'style', 'noscript', 'svg', 'path'];
            if (skip.includes(tag)) return '';
            
            let info = [];
            
            // Visible text
            if (el.innerText && el.innerText.trim().length < 100) {
                info.push(`text="${el.innerText.trim().substring(0, 50)}"`);
            }
            
            // Important attributes
            ['id', 'class', 'type', 'placeholder', 'href', 'role'].forEach(attr => {
                if (el.getAttribute(attr)) {
                    info.push(`${attr}="${el.getAttribute(attr).substring(0, 30)}"`);
                }
            });
            
            // Clickable?
            if (tag === 'button' || tag === 'a' || el.onclick || 
                el.getAttribute('role') === 'button') {
                info.push('clickable');
            }
            
            let result = `<${tag} ${info.join(' ')}>`;
            
            // Children
            for (const child of el.children) {
                result += getSnapshot(child, depth + 1);
            }
            
            return result;
        }
        return getSnapshot(document.body).substring(0, 8000);
    }""")
    return snapshot


async def execute_action(page, action):
    """Execute the action Claude decided on"""
    try:
        act = action.get("action")
        
        if act == "click":
            selector = action.get("selector", "")
            # Try multiple strategies
            try:
                if selector.startswith("text="):
                    await page.click(selector, timeout=3000)
                else:
                    # Try as CSS, then as text
                    try:
                        await page.click(selector, timeout=2000)
                    except:
                        await page.click(f"text={selector}", timeout=2000)
            except Exception as e:
                # Try button with text
                await page.click(f"button:has-text('{selector}')", timeout=2000)
                
        elif act == "type":
            await page.fill(action["selector"], action["text"])
            
        elif act == "scroll":
            direction = action.get("direction", "down")
            amount = action.get("amount", 500)
            if direction == "down":
                await page.evaluate(f"window.scrollBy(0, {amount})")
            else:
                await page.evaluate(f"window.scrollBy(0, -{amount})")
                
        elif act == "wait":
            await asyncio.sleep(action.get("ms", 500) / 1000)
            
        elif act == "dismiss_alert":
            try:
                page.on("dialog", lambda d: d.dismiss())
            except:
                pass
                
        elif act == "next_challenge":
            return "next"
            
        return "ok"
    except Exception as e:
        stats["errors"] += 1
        return f"error: {e}"


async def ask_claude(snapshot, context=""):
    """Get next action from Claude"""
    prompt = f"""Page state:
{snapshot}

{context}

What single action should I take? Respond with JSON only."""

    response = client.messages.create(
        model=MODEL,
        max_tokens=200,
        system=SYSTEM_PROMPT,
        messages=[{"role": "user", "content": prompt}]
    )
    
    # Track tokens
    stats["total_tokens_in"] += response.usage.input_tokens
    stats["total_tokens_out"] += response.usage.output_tokens
    
    # Parse response
    text = response.content[0].text.strip()
    # Extract JSON from response
    if "{" in text and "}" in text:
        json_str = text[text.find("{"):text.rfind("}")+1]
        return json.loads(json_str)
    return {"action": "wait", "ms": 500}


async def run_challenge():
    """Main challenge loop"""
    stats["start_time"] = time.time()
    
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)  # Show browser
        page = await browser.new_page()
        
        # Handle dialogs automatically
        page.on("dialog", lambda dialog: dialog.dismiss())
        
        await page.goto(CHALLENGE_URL)
        await asyncio.sleep(1)
        
        # Click START
        try:
            await page.click("text=START", timeout=5000)
        except:
            await page.click("button", timeout=5000)
        
        challenge_start = time.time()
        actions_this_challenge = 0
        
        while True:
            # Check time limit
            elapsed = time.time() - stats["start_time"]
            if elapsed > MAX_TIME_SECONDS:
                print(f"\n⏰ TIME LIMIT REACHED ({MAX_TIME_SECONDS}s)")
                break
            
            # Get snapshot
            snapshot = await get_page_snapshot(page)
            
            # Check if challenge complete (look for success indicators)
            page_text = await page.inner_text("body")
            if "challenge complete" in page_text.lower() or "congratulations" in page_text.lower():
                stats["challenges_completed"] += 1
                stats["challenge_times"].append(time.time() - challenge_start)
                print(f"✅ Challenge {stats['challenges_completed']} complete! ({time.time() - challenge_start:.1f}s)")
                challenge_start = time.time()
                actions_this_challenge = 0
                
                if stats["challenges_completed"] >= 30:
                    print("\n🎉 ALL 30 CHALLENGES COMPLETED!")
                    break
            
            # Ask Claude for action
            context = f"Challenge {stats['challenges_completed'] + 1}/30, {elapsed:.0f}s elapsed, {actions_this_challenge} actions taken"
            action = await ask_claude(snapshot, context)
            
            # Execute
            result = await execute_action(page, action)
            stats["actions_taken"] += 1
            actions_this_challenge += 1
            
            print(f"[{elapsed:.1f}s] {action.get('action')}: {result}")
            
            # Small delay to not hammer the page
            await asyncio.sleep(0.3)
            
            # Safety: max actions per challenge
            if actions_this_challenge > 50:
                print("⚠️ Too many actions, moving on...")
                break
        
        await browser.close()
    
    return stats


def print_stats():
    """Print final statistics"""
    total_time = time.time() - stats["start_time"]
    
    print("\n" + "="*50)
    print("📊 CHALLENGE STATISTICS")
    print("="*50)
    print(f"Total Time: {total_time:.1f}s ({total_time/60:.2f} min)")
    print(f"Challenges Completed: {stats['challenges_completed']}/30")
    print(f"Actions Taken: {stats['actions_taken']}")
    print(f"Errors: {stats['errors']}")
    print(f"Tokens (in): {stats['total_tokens_in']:,}")
    print(f"Tokens (out): {stats['total_tokens_out']:,}")
    print(f"Total Tokens: {stats['total_tokens_in'] + stats['total_tokens_out']:,}")
    
    # Estimate cost (Sonnet pricing)
    cost_in = stats["total_tokens_in"] * 0.003 / 1000
    cost_out = stats["total_tokens_out"] * 0.015 / 1000
    print(f"Estimated Cost: ${cost_in + cost_out:.4f}")
    
    if stats["challenge_times"]:
        avg_time = sum(stats["challenge_times"]) / len(stats["challenge_times"])
        print(f"Avg Time/Challenge: {avg_time:.1f}s")
    
    print("="*50)
    
    # Save to file
    with open("challenge_results.json", "w") as f:
        json.dump({
            **stats,
            "total_time": total_time,
            "timestamp": datetime.now().isoformat()
        }, f, indent=2)
    print("Results saved to challenge_results.json")


if __name__ == "__main__":
    print("🚀 Starting Browser Navigation Challenge Agent")
    print(f"Target: {CHALLENGE_URL}")
    print(f"Time Limit: {MAX_TIME_SECONDS}s")
    print("="*50)
    
    try:
        asyncio.run(run_challenge())
    except KeyboardInterrupt:
        print("\n⛔ Interrupted")
    finally:
        print_stats()
