#!/usr/bin/env python3
"""
Test Scenarios for Onde QA Agent
Defines all test cases for navigation, links, responsive, and API testing
"""

import asyncio
import base64
import os
from dataclasses import dataclass, field
from datetime import datetime
from pathlib import Path
from typing import Optional
from urllib.parse import urljoin, urlparse

from browser_use import Agent, Browser, BrowserConfig
from langchain_anthropic import ChatAnthropic


@dataclass
class TestResult:
    """Result of a single test"""
    test_name: str
    passed: bool
    url: str
    error_message: Optional[str] = None
    screenshot_path: Optional[str] = None
    screenshot_base64: Optional[str] = None
    steps_to_reproduce: list[str] = field(default_factory=list)
    timestamp: str = field(default_factory=lambda: datetime.now().isoformat())
    response_time_ms: Optional[float] = None
    viewport: Optional[str] = None


class TestScenarios:
    """Test scenarios for Onde web properties"""

    def __init__(self, headless: bool = True):
        self.headless = headless
        self.screenshots_dir = Path(__file__).parent.parent / "screenshots"
        self.screenshots_dir.mkdir(exist_ok=True)

        # Initialize LLM for browser-use agent
        self.llm = ChatAnthropic(
            model_name="claude-sonnet-4-20250514",
            api_key=os.getenv("ANTHROPIC_API_KEY"),
            timeout=60,
            max_tokens=4096
        )

    async def run_all_tests(self, base_url: str, env_name: str) -> list[TestResult]:
        """Run all test scenarios for a given base URL"""
        results = []

        # Test 1: Homepage loads
        results.append(await self.test_homepage_loads(base_url, env_name))

        # Test 2: Check all links (no 404s)
        results.append(await self.test_links_work(base_url, env_name))

        # Test 3: Images load
        results.append(await self.test_images_load(base_url, env_name))

        # Test 4: Mobile responsive
        results.append(await self.test_mobile_responsive(base_url, env_name))

        # Test 5: API endpoints (only for onde.surf)
        if "onde.surf" in base_url:
            results.extend(await self.test_api_endpoints(base_url, env_name))

        return results

    async def test_homepage_loads(self, base_url: str, env_name: str) -> TestResult:
        """Test that the homepage loads correctly"""
        test_name = "Homepage Loads"
        print(f"  Running: {test_name}...")

        browser = None
        try:
            browser = Browser(
                config=BrowserConfig(
                    headless=self.headless,
                    disable_security=False
                )
            )

            agent = Agent(
                task=f"""
                Go to {base_url} and verify the page loads correctly.
                Check that:
                1. The page title is not empty
                2. There is content visible on the page
                3. No error messages are displayed (like 500, 404, or connection errors)

                Return PASS if everything looks good, or FAIL with the reason if something is wrong.
                """,
                llm=self.llm,
                browser=browser,
                max_actions_per_step=10
            )

            result = await agent.run(max_steps=5)

            # Take screenshot
            screenshot_path = await self._take_screenshot(browser, env_name, "homepage")

            # Check result
            result_text = str(result.final_result()).lower() if result.final_result() else ""
            passed = "pass" in result_text and "fail" not in result_text

            await browser.close()

            return TestResult(
                test_name=test_name,
                passed=passed,
                url=base_url,
                error_message=None if passed else f"Homepage check failed: {result.final_result()}",
                screenshot_path=screenshot_path,
                steps_to_reproduce=["Navigate to homepage", "Check page loads"]
            )

        except Exception as e:
            if browser:
                await browser.close()
            return TestResult(
                test_name=test_name,
                passed=False,
                url=base_url,
                error_message=str(e),
                steps_to_reproduce=["Navigate to homepage"]
            )

    async def test_links_work(self, base_url: str, env_name: str) -> TestResult:
        """Test that all links on the page work (no 404s)"""
        test_name = "Links Work (No 404s)"
        print(f"  Running: {test_name}...")

        browser = None
        try:
            browser = Browser(
                config=BrowserConfig(
                    headless=self.headless,
                    disable_security=False
                )
            )

            agent = Agent(
                task=f"""
                Go to {base_url} and check all the navigation links on the page.

                For each visible link/button in the navigation:
                1. Click on it
                2. Check if it leads to a valid page (not a 404 or error page)
                3. Go back to the homepage

                Return PASS if all links work, or FAIL with a list of broken links.
                """,
                llm=self.llm,
                browser=browser,
                max_actions_per_step=15
            )

            result = await agent.run(max_steps=10)

            screenshot_path = await self._take_screenshot(browser, env_name, "links")

            result_text = str(result.final_result()).lower() if result.final_result() else ""
            passed = "pass" in result_text and "fail" not in result_text

            await browser.close()

            return TestResult(
                test_name=test_name,
                passed=passed,
                url=base_url,
                error_message=None if passed else f"Link check failed: {result.final_result()}",
                screenshot_path=screenshot_path,
                steps_to_reproduce=[
                    "Navigate to homepage",
                    "Click each navigation link",
                    "Verify no 404 errors"
                ]
            )

        except Exception as e:
            if browser:
                await browser.close()
            return TestResult(
                test_name=test_name,
                passed=False,
                url=base_url,
                error_message=str(e),
                steps_to_reproduce=["Navigate to homepage", "Check links"]
            )

    async def test_images_load(self, base_url: str, env_name: str) -> TestResult:
        """Test that all images load correctly"""
        test_name = "Images Load"
        print(f"  Running: {test_name}...")

        browser = None
        try:
            browser = Browser(
                config=BrowserConfig(
                    headless=self.headless,
                    disable_security=False
                )
            )

            agent = Agent(
                task=f"""
                Go to {base_url} and check if all images on the page load correctly.

                Look for:
                1. Broken image icons (images that failed to load)
                2. Images with alt text showing instead of the image
                3. Missing images or placeholder images

                Return PASS if all images load correctly, or FAIL with details about broken images.
                """,
                llm=self.llm,
                browser=browser,
                max_actions_per_step=10
            )

            result = await agent.run(max_steps=5)

            screenshot_path = await self._take_screenshot(browser, env_name, "images")

            result_text = str(result.final_result()).lower() if result.final_result() else ""
            passed = "pass" in result_text and "fail" not in result_text

            await browser.close()

            return TestResult(
                test_name=test_name,
                passed=passed,
                url=base_url,
                error_message=None if passed else f"Image check failed: {result.final_result()}",
                screenshot_path=screenshot_path,
                steps_to_reproduce=[
                    "Navigate to homepage",
                    "Check all images load",
                    "Look for broken image icons"
                ]
            )

        except Exception as e:
            if browser:
                await browser.close()
            return TestResult(
                test_name=test_name,
                passed=False,
                url=base_url,
                error_message=str(e),
                steps_to_reproduce=["Navigate to homepage", "Check images"]
            )

    async def test_mobile_responsive(self, base_url: str, env_name: str) -> TestResult:
        """Test mobile responsive design (375px viewport)"""
        test_name = "Mobile Responsive (375px)"
        print(f"  Running: {test_name}...")

        browser = None
        try:
            browser = Browser(
                config=BrowserConfig(
                    headless=self.headless,
                    disable_security=False
                )
            )

            agent = Agent(
                task=f"""
                Go to {base_url} with a mobile viewport (375px width).

                Check for common responsive issues:
                1. Text is readable (not too small or cut off)
                2. Buttons and links are tappable (not too small or overlapping)
                3. Content fits within the screen (no horizontal scrolling needed)
                4. Navigation is accessible (hamburger menu or visible links)

                Return PASS if the page is mobile-friendly, or FAIL with specific issues.
                """,
                llm=self.llm,
                browser=browser,
                max_actions_per_step=10
            )

            # Set mobile viewport before running
            context = await browser.new_context(
                viewport={"width": 375, "height": 812}
            )

            result = await agent.run(max_steps=5)

            screenshot_path = await self._take_screenshot(browser, env_name, "mobile")

            result_text = str(result.final_result()).lower() if result.final_result() else ""
            passed = "pass" in result_text and "fail" not in result_text

            await browser.close()

            return TestResult(
                test_name=test_name,
                passed=passed,
                url=base_url,
                error_message=None if passed else f"Mobile responsive check failed: {result.final_result()}",
                screenshot_path=screenshot_path,
                steps_to_reproduce=[
                    "Set viewport to 375x812 (iPhone)",
                    "Navigate to homepage",
                    "Check layout and readability"
                ],
                viewport="375x812"
            )

        except Exception as e:
            if browser:
                await browser.close()
            return TestResult(
                test_name=test_name,
                passed=False,
                url=base_url,
                error_message=str(e),
                steps_to_reproduce=["Set mobile viewport", "Navigate to homepage"],
                viewport="375x812"
            )

    async def test_api_endpoints(self, base_url: str, env_name: str) -> list[TestResult]:
        """Test API endpoints respond correctly (for onde.surf)"""
        results = []

        endpoints = [
            "/api/house",
            "/api/pr/posts?status=pending",
            "/api/agents"
        ]

        import aiohttp

        for endpoint in endpoints:
            test_name = f"API: {endpoint}"
            print(f"  Running: {test_name}...")

            full_url = urljoin(base_url, endpoint)

            try:
                async with aiohttp.ClientSession() as session:
                    start_time = asyncio.get_event_loop().time()
                    async with session.get(full_url, timeout=aiohttp.ClientTimeout(total=10)) as resp:
                        end_time = asyncio.get_event_loop().time()
                        response_time = (end_time - start_time) * 1000

                        passed = resp.status == 200
                        error_msg = None if passed else f"Status code: {resp.status}"

                        results.append(TestResult(
                            test_name=test_name,
                            passed=passed,
                            url=full_url,
                            error_message=error_msg,
                            steps_to_reproduce=[f"GET {full_url}", f"Expected 200, got {resp.status}"],
                            response_time_ms=response_time
                        ))

            except asyncio.TimeoutError:
                results.append(TestResult(
                    test_name=test_name,
                    passed=False,
                    url=full_url,
                    error_message="Request timed out (>10s)",
                    steps_to_reproduce=[f"GET {full_url}", "Timeout after 10 seconds"]
                ))
            except Exception as e:
                results.append(TestResult(
                    test_name=test_name,
                    passed=False,
                    url=full_url,
                    error_message=str(e),
                    steps_to_reproduce=[f"GET {full_url}"]
                ))

        return results

    async def _take_screenshot(self, browser: Browser, env_name: str, test_name: str) -> Optional[str]:
        """Take a screenshot and save it"""
        try:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"{env_name}_{test_name}_{timestamp}.png"
            filepath = self.screenshots_dir / filename

            # Get the current page from browser context
            contexts = browser.playwright_browser.contexts
            if contexts and contexts[0].pages:
                page = contexts[0].pages[0]
                await page.screenshot(path=str(filepath))
                return str(filepath)
        except Exception as e:
            print(f"    Warning: Could not take screenshot: {e}")
        return None
