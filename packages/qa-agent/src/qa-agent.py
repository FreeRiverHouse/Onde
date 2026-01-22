#!/usr/bin/env python3
"""
Onde QA Agent - Automated testing with Browser Use
Tests onde.la, onde.surf, and localhost:3333 (PR dashboard)
Reports bugs to GitHub Issues automatically
"""

import asyncio
import argparse
import os
import sys
from datetime import datetime
from pathlib import Path
from typing import Optional

from dotenv import load_dotenv

# Add src to path for imports
sys.path.insert(0, str(Path(__file__).parent))

from test_scenarios import TestScenarios, TestResult
from github_reporter import GitHubReporter

# Load environment variables
load_dotenv(Path(__file__).parent.parent.parent.parent / ".env")

# Environment configurations
ENVIRONMENTS = {
    "production": {
        "name": "Production",
        "url": "https://onde.la",
        "description": "Onde Portal (onde.la)"
    },
    "staging": {
        "name": "Staging",
        "url": "https://onde.surf",
        "description": "Onde Surf (onde.surf)"
    },
    "local": {
        "name": "Local",
        "url": "http://localhost:3333",
        "description": "PR Dashboard (localhost:3333)"
    }
}


class QAAgent:
    """Main QA Agent orchestrator"""

    def __init__(self, environment: str = "all", headless: bool = True):
        self.environment = environment
        self.headless = headless
        self.test_scenarios = TestScenarios(headless=headless)
        self.github_reporter = GitHubReporter()
        self.results: list[TestResult] = []

    async def run_tests(self) -> list[TestResult]:
        """Run all test scenarios for selected environment(s)"""
        envs_to_test = []

        if self.environment == "all":
            envs_to_test = list(ENVIRONMENTS.keys())
        else:
            envs_to_test = [self.environment]

        print(f"\n{'='*60}")
        print(f"  ONDE QA AGENT - Automated Testing")
        print(f"  Started: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print(f"{'='*60}\n")

        for env_key in envs_to_test:
            env = ENVIRONMENTS[env_key]
            print(f"\n[Testing] {env['description']}")
            print(f"URL: {env['url']}")
            print("-" * 40)

            # Check if local server is running
            if env_key == "local":
                is_running = await self._check_local_server(env['url'])
                if not is_running:
                    print(f"  SKIP: Local server not running at {env['url']}")
                    continue

            # Run test scenarios
            env_results = await self.test_scenarios.run_all_tests(
                base_url=env['url'],
                env_name=env['name']
            )
            self.results.extend(env_results)

            # Report failures
            failures = [r for r in env_results if not r.passed]
            if failures:
                print(f"\n  Found {len(failures)} issue(s) - Creating GitHub issues...")
                for result in failures:
                    await self._report_failure(result, env)
            else:
                print(f"  All tests passed for {env['name']}")

        # Print summary
        self._print_summary()

        return self.results

    async def _check_local_server(self, url: str) -> bool:
        """Check if local server is running"""
        import aiohttp
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(url, timeout=aiohttp.ClientTimeout(total=3)) as resp:
                    return resp.status < 500
        except Exception:
            return False

    async def _report_failure(self, result: TestResult, env: dict):
        """Report a test failure to GitHub"""
        try:
            issue_url = await self.github_reporter.create_issue(
                title=f"[QA-Auto] {result.test_name} failed on {env['name']}",
                env_name=env['name'],
                env_url=env['url'],
                test_result=result
            )
            if issue_url:
                print(f"    Created issue: {issue_url}")
            else:
                print(f"    Failed to create GitHub issue for: {result.test_name}")
        except Exception as e:
            print(f"    Error creating issue: {e}")

    def _print_summary(self):
        """Print test summary"""
        total = len(self.results)
        passed = len([r for r in self.results if r.passed])
        failed = total - passed

        print(f"\n{'='*60}")
        print(f"  TEST SUMMARY")
        print(f"{'='*60}")
        print(f"  Total Tests: {total}")
        print(f"  Passed: {passed}")
        print(f"  Failed: {failed}")
        print(f"  Pass Rate: {(passed/total*100) if total > 0 else 0:.1f}%")
        print(f"{'='*60}\n")

        if failed > 0:
            print("  Failed Tests:")
            for r in self.results:
                if not r.passed:
                    print(f"    - {r.test_name}: {r.error_message}")
            print()


async def main():
    parser = argparse.ArgumentParser(description="Onde QA Agent - Automated Testing")
    parser.add_argument(
        "--env",
        choices=["production", "staging", "local", "all"],
        default="all",
        help="Environment to test (default: all)"
    )
    parser.add_argument(
        "--headless",
        action="store_true",
        default=True,
        help="Run browser in headless mode (default: True)"
    )
    parser.add_argument(
        "--visible",
        action="store_true",
        help="Run browser in visible mode (opposite of headless)"
    )

    args = parser.parse_args()

    headless = not args.visible

    agent = QAAgent(environment=args.env, headless=headless)
    results = await agent.run_tests()

    # Exit with error code if any tests failed
    failures = [r for r in results if not r.passed]
    sys.exit(1 if failures else 0)


if __name__ == "__main__":
    asyncio.run(main())
