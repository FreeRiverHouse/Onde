#!/usr/bin/env python3
"""
GitHub Reporter for Onde QA Agent
Creates GitHub issues for test failures using gh CLI
"""

import asyncio
import json
import os
import subprocess
import tempfile
from datetime import datetime
from pathlib import Path
from typing import Optional

from test_scenarios import TestResult


class GitHubReporter:
    """Reports test failures to GitHub Issues using gh CLI"""

    def __init__(self, repo: str = "FreeRiverHouse/Onde"):
        self.repo = repo
        self.labels = ["bug", "qa-auto"]

    async def create_issue(
        self,
        title: str,
        env_name: str,
        env_url: str,
        test_result: TestResult
    ) -> Optional[str]:
        """Create a GitHub issue for a test failure"""

        # Check for duplicate issues first
        if await self._issue_exists(title):
            print(f"    Skipping duplicate issue: {title}")
            return None

        # Build issue body
        body = self._build_issue_body(env_name, env_url, test_result)

        # Create issue using gh CLI
        try:
            cmd = [
                "gh", "issue", "create",
                "--repo", self.repo,
                "--title", title,
                "--body", body,
                "--label", ",".join(self.labels)
            ]

            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                timeout=30
            )

            if result.returncode == 0:
                # Extract issue URL from output
                issue_url = result.stdout.strip()
                return issue_url
            else:
                print(f"    gh CLI error: {result.stderr}")
                return None

        except subprocess.TimeoutExpired:
            print("    gh CLI timed out")
            return None
        except FileNotFoundError:
            print("    gh CLI not found. Please install GitHub CLI.")
            return None
        except Exception as e:
            print(f"    Error creating issue: {e}")
            return None

    async def _issue_exists(self, title: str) -> bool:
        """Check if an issue with similar title already exists"""
        try:
            # Search for open issues with same title
            cmd = [
                "gh", "issue", "list",
                "--repo", self.repo,
                "--label", "qa-auto",
                "--state", "open",
                "--json", "title",
                "--limit", "100"
            ]

            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                timeout=15
            )

            if result.returncode == 0:
                issues = json.loads(result.stdout)
                # Check if similar title exists
                for issue in issues:
                    if self._titles_match(issue.get("title", ""), title):
                        return True
            return False

        except Exception:
            # If we can't check, assume it doesn't exist
            return False

    def _titles_match(self, existing: str, new: str) -> bool:
        """Check if two issue titles are similar enough to be duplicates"""
        # Remove [QA-Auto] prefix for comparison
        existing_clean = existing.replace("[QA-Auto]", "").strip().lower()
        new_clean = new.replace("[QA-Auto]", "").strip().lower()

        # Exact match
        if existing_clean == new_clean:
            return True

        # Similar enough (contains same test name and environment)
        return False

    def _build_issue_body(
        self,
        env_name: str,
        env_url: str,
        test_result: TestResult
    ) -> str:
        """Build the issue body with all relevant information"""

        steps_md = "\n".join([f"{i+1}. {step}" for i, step in enumerate(test_result.steps_to_reproduce)])

        body = f"""## QA Automated Test Failure

**Environment:** {env_name}
**URL:** {env_url}
**Test:** {test_result.test_name}
**Timestamp:** {test_result.timestamp}

### Error Details

```
{test_result.error_message or "No error message captured"}
```

### Steps to Reproduce

{steps_md}

### Additional Info

| Property | Value |
|----------|-------|
| URL Tested | `{test_result.url}` |
| Viewport | {test_result.viewport or "Desktop (default)"} |
| Response Time | {f"{test_result.response_time_ms:.0f}ms" if test_result.response_time_ms else "N/A"} |

"""

        # Add screenshot note if available
        if test_result.screenshot_path:
            body += f"""
### Screenshot

Screenshot saved at: `{test_result.screenshot_path}`

> Note: Upload screenshot manually if needed.
"""

        body += """
---
*This issue was created automatically by the Onde QA Agent.*
*Labels: bug, qa-auto*
"""

        return body

    async def upload_screenshot(self, issue_number: int, screenshot_path: str) -> bool:
        """Upload a screenshot to an existing issue (as a comment)"""
        # Note: gh CLI doesn't support file uploads directly
        # This would require using the GitHub API with a token
        # For now, we just note the path in the issue body
        return False


class IssueDeduplicator:
    """Helper class to manage duplicate issue detection"""

    def __init__(self, cache_file: Optional[str] = None):
        self.cache_file = cache_file or str(
            Path(__file__).parent.parent / ".issue_cache.json"
        )
        self.cache = self._load_cache()

    def _load_cache(self) -> dict:
        """Load the issue cache from disk"""
        try:
            if os.path.exists(self.cache_file):
                with open(self.cache_file, "r") as f:
                    return json.load(f)
        except Exception:
            pass
        return {"issues": [], "last_updated": None}

    def _save_cache(self):
        """Save the issue cache to disk"""
        try:
            self.cache["last_updated"] = datetime.now().isoformat()
            with open(self.cache_file, "w") as f:
                json.dump(self.cache, f, indent=2)
        except Exception:
            pass

    def add_issue(self, title: str, url: str):
        """Add an issue to the cache"""
        self.cache["issues"].append({
            "title": title,
            "url": url,
            "created": datetime.now().isoformat()
        })
        self._save_cache()

    def has_recent_issue(self, title: str, hours: int = 24) -> bool:
        """Check if a similar issue was created recently"""
        from datetime import timedelta

        cutoff = datetime.now() - timedelta(hours=hours)

        for issue in self.cache.get("issues", []):
            try:
                created = datetime.fromisoformat(issue.get("created", ""))
                if created > cutoff and self._titles_similar(issue.get("title", ""), title):
                    return True
            except Exception:
                continue

        return False

    def _titles_similar(self, a: str, b: str) -> bool:
        """Check if two titles are similar"""
        a_clean = a.replace("[QA-Auto]", "").strip().lower()
        b_clean = b.replace("[QA-Auto]", "").strip().lower()
        return a_clean == b_clean


if __name__ == "__main__":
    # Test the GitHub reporter
    import asyncio

    async def test():
        reporter = GitHubReporter()

        test_result = TestResult(
            test_name="Test Homepage",
            passed=False,
            url="https://onde.la",
            error_message="Page returned 500 error",
            steps_to_reproduce=["Navigate to homepage", "Observe error"]
        )

        # Dry run - just print what would be created
        body = reporter._build_issue_body("Production", "https://onde.la", test_result)
        print("Would create issue with body:")
        print(body)

    asyncio.run(test())
