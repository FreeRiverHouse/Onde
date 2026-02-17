#!/usr/bin/env python3
"""
CI/CD Auto-Improvement Feedback Script

Analyzes GitHub Actions run results and creates tasks/alerts
for the heartbeat system to handle.

Usage:
    python ci-auto-improve.py [--check] [--create-tasks] [--dry-run]

Features:
- Fetches latest CI run results from GitHub API
- Identifies patterns in failures (same test failing repeatedly)
- Creates tasks in TASKS.md for persistent issues
- Creates alerts for immediate attention items
- Generates improvement suggestions based on failure patterns
"""

import os
import sys
import json
import argparse
from datetime import datetime, timedelta
from pathlib import Path
import subprocess

# Try to import requests, fall back to urllib if not available
try:
    import requests
    HAS_REQUESTS = True
except ImportError:
    import urllib.request
    import urllib.error
    HAS_REQUESTS = False

REPO = "FreeRiverHouse/Onde"
WORKFLOW_NAME = "CI/CD Pipeline"
TASKS_FILE = Path(__file__).parent.parent / "TASKS.md"
ALERTS_DIR = Path(__file__).parent
CI_HISTORY_FILE = Path(__file__).parent.parent / "data" / "ci" / "run-history.jsonl"


def fetch_github_api(endpoint: str) -> dict | None:
    """Fetch from GitHub API."""
    url = f"https://api.github.com{endpoint}"
    headers = {"Accept": "application/vnd.github.v3+json"}
    
    token = os.environ.get("GITHUB_TOKEN") or os.environ.get("GH_TOKEN")
    if token:
        headers["Authorization"] = f"token {token}"
    
    try:
        if HAS_REQUESTS:
            resp = requests.get(url, headers=headers, timeout=30)
            resp.raise_for_status()
            return resp.json()
        else:
            req = urllib.request.Request(url, headers=headers)
            with urllib.request.urlopen(req, timeout=30) as resp:
                return json.loads(resp.read().decode())
    except Exception as e:
        print(f"Error fetching {endpoint}: {e}", file=sys.stderr)
        return None


def get_workflow_runs(limit: int = 10) -> list:
    """Get recent workflow runs."""
    data = fetch_github_api(f"/repos/{REPO}/actions/workflows")
    if not data:
        return []
    
    # Find CI/CD workflow
    workflow_id = None
    for wf in data.get("workflows", []):
        if wf["name"] == WORKFLOW_NAME:
            workflow_id = wf["id"]
            break
    
    if not workflow_id:
        print(f"Workflow '{WORKFLOW_NAME}' not found", file=sys.stderr)
        return []
    
    runs_data = fetch_github_api(f"/repos/{REPO}/actions/workflows/{workflow_id}/runs?per_page={limit}")
    return runs_data.get("workflow_runs", []) if runs_data else []


def get_run_jobs(run_id: int) -> list:
    """Get jobs for a specific run."""
    data = fetch_github_api(f"/repos/{REPO}/actions/runs/{run_id}/jobs")
    return data.get("jobs", []) if data else []


def analyze_failures(runs: list) -> dict:
    """Analyze failure patterns across runs."""
    analysis = {
        "total_runs": len(runs),
        "failed_runs": 0,
        "job_failures": {},  # job_name -> count
        "failure_streak": 0,
        "last_success": None,
        "patterns": [],
    }
    
    streak = 0
    for run in runs:
        if run["conclusion"] == "failure":
            analysis["failed_runs"] += 1
            streak += 1
            
            # Get job-level failures
            jobs = get_run_jobs(run["id"])
            for job in jobs:
                if job["conclusion"] == "failure":
                    name = job["name"]
                    analysis["job_failures"][name] = analysis["job_failures"].get(name, 0) + 1
        else:
            if streak > analysis["failure_streak"]:
                analysis["failure_streak"] = streak
            streak = 0
            if not analysis["last_success"]:
                analysis["last_success"] = run["created_at"]
    
    # Identify patterns
    if analysis["failure_streak"] >= 3:
        analysis["patterns"].append(f"🔴 {analysis['failure_streak']} consecutive failures")
    
    for job, count in analysis["job_failures"].items():
        if count >= 3:
            analysis["patterns"].append(f"⚠️ Job '{job}' failed {count} times")
    
    return analysis


def generate_improvement_suggestions(analysis: dict) -> list:
    """Generate actionable suggestions based on analysis."""
    suggestions = []
    
    # High failure rate
    if analysis["total_runs"] > 0:
        fail_rate = analysis["failed_runs"] / analysis["total_runs"]
        if fail_rate > 0.5:
            suggestions.append({
                "priority": "P1",
                "title": "High CI failure rate",
                "description": f"CI/CD pipeline failing {fail_rate:.0%} of runs. Investigate root cause.",
                "action": "Review recent commits and test changes",
            })
    
    # Specific job failures
    for job, count in analysis["job_failures"].items():
        if count >= 3:
            suggestions.append({
                "priority": "P2",
                "title": f"Flaky job: {job}",
                "description": f"Job '{job}' has failed {count} times in recent runs.",
                "action": f"Review and stabilize {job}",
            })
    
    # Long failure streak
    if analysis["failure_streak"] >= 5:
        suggestions.append({
            "priority": "P1",
            "title": "CI has been broken for extended period",
            "description": f"{analysis['failure_streak']} consecutive failures detected.",
            "action": "Immediate attention required to restore CI health",
        })
    
    return suggestions


def create_task(title: str, priority: str, notes: str) -> str:
    """Generate a task entry for TASKS.md."""
    task_id = f"T{int(datetime.now().timestamp()) % 10000}"
    return f"""
### [{task_id}] {title}
- **Status**: TODO
- **Owner**: -
- **Depends**: -
- **Blocks**: -
- **Priority**: {priority}
- **Notes**: {notes}
  - Auto-generated by CI auto-improve script
  - Date: {datetime.now().strftime('%Y-%m-%d')}
"""


def append_task_to_file(task: str, dry_run: bool = False) -> bool:
    """Append a task to TASKS.md."""
    if dry_run:
        print(f"[DRY RUN] Would append task:\n{task}")
        return True
    
    try:
        with open(TASKS_FILE, "a") as f:
            f.write(task)
        return True
    except Exception as e:
        print(f"Error appending task: {e}", file=sys.stderr)
        return False


def create_alert(filename: str, message: str, dry_run: bool = False) -> bool:
    """Create an alert file for heartbeat pickup."""
    alert_path = ALERTS_DIR / filename
    
    if dry_run:
        print(f"[DRY RUN] Would create alert {alert_path}:\n{message}")
        return True
    
    try:
        with open(alert_path, "w") as f:
            f.write(message)
        return True
    except Exception as e:
        print(f"Error creating alert: {e}", file=sys.stderr)
        return False


def log_run_history(analysis: dict) -> None:
    """Log analysis to history file for trend tracking."""
    CI_HISTORY_FILE.parent.mkdir(parents=True, exist_ok=True)
    
    entry = {
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "total_runs": analysis["total_runs"],
        "failed_runs": analysis["failed_runs"],
        "failure_streak": analysis["failure_streak"],
        "job_failures": analysis["job_failures"],
    }
    
    try:
        with open(CI_HISTORY_FILE, "a") as f:
            f.write(json.dumps(entry) + "\n")
    except Exception as e:
        print(f"Error logging history: {e}", file=sys.stderr)


def main():
    parser = argparse.ArgumentParser(description="CI/CD Auto-Improvement Feedback")
    parser.add_argument("--check", action="store_true", help="Check CI status and print report")
    parser.add_argument("--create-tasks", action="store_true", help="Create tasks for failures")
    parser.add_argument("--dry-run", action="store_true", help="Don't actually create files")
    parser.add_argument("--verbose", "-v", action="store_true", help="Verbose output")
    args = parser.parse_args()
    
    print("🔍 Fetching CI/CD run history...")
    runs = get_workflow_runs(limit=10)
    
    if not runs:
        print("❌ Could not fetch workflow runs. Check GITHUB_TOKEN.")
        sys.exit(1)
    
    print(f"📊 Analyzing {len(runs)} recent runs...")
    analysis = analyze_failures(runs)
    
    # Print summary
    print("\n" + "=" * 50)
    print("CI/CD Health Report")
    print("=" * 50)
    print(f"Total runs analyzed: {analysis['total_runs']}")
    print(f"Failed runs: {analysis['failed_runs']}")
    print(f"Current failure streak: {analysis['failure_streak']}")
    print(f"Last success: {analysis['last_success'] or 'Unknown'}")
    
    if analysis["job_failures"]:
        print("\nJob failure counts:")
        for job, count in sorted(analysis["job_failures"].items(), key=lambda x: -x[1]):
            print(f"  - {job}: {count}")
    
    if analysis["patterns"]:
        print("\nPatterns detected:")
        for pattern in analysis["patterns"]:
            print(f"  {pattern}")
    
    # Generate suggestions
    suggestions = generate_improvement_suggestions(analysis)
    
    if suggestions:
        print("\n📝 Improvement Suggestions:")
        for s in suggestions:
            print(f"  [{s['priority']}] {s['title']}")
            if args.verbose:
                print(f"       {s['description']}")
    else:
        print("\n✅ No improvement suggestions - CI looks healthy!")
    
    # Log to history
    log_run_history(analysis)
    
    # Create tasks if requested
    if args.create_tasks and suggestions:
        print("\n📋 Creating tasks...")
        for s in suggestions:
            task = create_task(s["title"], s["priority"], s["description"])
            if append_task_to_file(task, dry_run=args.dry_run):
                print(f"  ✅ Created task: {s['title']}")
    
    # Create alert if critical
    if analysis["failure_streak"] >= 5 or analysis["failed_runs"] >= 7:
        msg = f"CI/CD Alert: {analysis['failed_runs']}/{analysis['total_runs']} runs failed. "
        msg += f"Failure streak: {analysis['failure_streak']}. "
        msg += "Check GitHub Actions immediately."
        create_alert("ci-failure.alert", msg, dry_run=args.dry_run)
        print("\n🚨 Created ci-failure.alert for heartbeat pickup")
    
    # Exit with failure code if CI is unhealthy
    if analysis["failure_streak"] >= 3:
        sys.exit(1)


if __name__ == "__main__":
    main()
