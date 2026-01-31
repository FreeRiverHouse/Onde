#!/usr/bin/env python3
"""
Push TASKS.md data to GitHub Gist for onde.surf Task Management Panel.
Parses TASKS.md and extracts individual task details.

Cron: */10 * * * * python3 /Users/mattia/Projects/Onde/scripts/push-tasks-to-gist.py
"""

import json
import os
import re
from datetime import datetime
from pathlib import Path
import requests

# Config
PROJECT_DIR = Path(__file__).parent.parent
GIST_ID = os.getenv("TASKS_GIST_ID", "12a07b9ed63e19f01d2693b69f8a0e3b")
GITHUB_TOKEN = os.getenv("GITHUB_GIST_TOKEN", "")
GIST_FILENAME = "onde-tasks-data.json"


def parse_task_block(task_text: str) -> dict | None:
    """Parse a task block into structured data."""
    lines = task_text.strip().split("\n")
    if not lines:
        return None
    
    task = {}
    
    # Parse task ID and title from header
    header_match = re.match(r"###\s*\[([^\]]+)\]\s*(.+)", lines[0])
    if header_match:
        task["id"] = header_match.group(1)
        task["title"] = header_match.group(2).strip()
    else:
        return None
    
    # Parse fields
    for line in lines[1:]:
        line = line.strip()
        if not line or not line.startswith("- "):
            continue
        
        # Remove leading "- " and "**" markers
        line = line[2:].strip()
        
        # Status
        status_match = re.match(r"\*\*Status\*\*:\s*(.+)", line)
        if status_match:
            status = status_match.group(1).strip()
            # Normalize status
            if "DONE" in status.upper() or "✅" in status:
                task["status"] = "DONE"
            elif "IN_PROGRESS" in status.upper():
                task["status"] = "IN_PROGRESS"
            elif "BLOCKED" in status.upper():
                task["status"] = "BLOCKED"
            else:
                task["status"] = "TODO"
            continue
        
        # Owner
        owner_match = re.match(r"\*\*Owner\*\*:\s*(.+)", line)
        if owner_match:
            owner = owner_match.group(1).strip()
            if owner != "-" and owner != "TBD":
                task["owner"] = owner
            continue
        
        # Priority
        priority_match = re.match(r"\*\*Priority\*\*:\s*(.+)", line)
        if priority_match:
            priority = priority_match.group(1).strip()
            # Extract P0, P1, etc.
            p_match = re.search(r"P(\d+)", priority)
            if p_match:
                task["priority"] = f"P{p_match.group(1)}"
            continue
        
        # Depends
        depends_match = re.match(r"\*\*Depends\*\*:\s*(.+)", line)
        if depends_match:
            depends = depends_match.group(1).strip()
            if depends != "-":
                # Extract task IDs
                dep_ids = re.findall(r"\[([^\]]+)\]", depends)
                task["depends"] = dep_ids
            continue
        
        # Blocks
        blocks_match = re.match(r"\*\*Blocks\*\*:\s*(.+)", line)
        if blocks_match:
            blocks = blocks_match.group(1).strip()
            if blocks != "-":
                block_ids = re.findall(r"\[([^\]]+)\]", blocks)
                task["blocks"] = block_ids
            continue
        
        # Created
        created_match = re.match(r"\*\*Created\*\*:\s*(.+)", line)
        if created_match:
            task["created"] = created_match.group(1).strip()
            continue
        
        # Completed
        completed_match = re.match(r"\*\*Completed\*\*:\s*(.+)", line)
        if completed_match:
            task["completed"] = completed_match.group(1).strip()
            continue
        
        # Started
        started_match = re.match(r"\*\*Started\*\*:\s*(.+)", line)
        if started_match:
            task["started"] = started_match.group(1).strip()
            continue
        
        # Created-by
        created_by_match = re.match(r"\*\*Created-by\*\*:\s*(.+)", line)
        if created_by_match:
            created_by = created_by_match.group(1).strip()
            if created_by != "-":
                task["created_by"] = created_by
            continue
    
    return task if task.get("id") else None


def parse_tasks_md() -> list[dict]:
    """Parse TASKS.md and return list of tasks."""
    tasks_file = PROJECT_DIR / "TASKS.md"
    if not tasks_file.exists():
        return []
    
    content = tasks_file.read_text()
    
    # Split by task headers
    task_blocks = re.split(r"(?=^### \[[^\]]+\])", content, flags=re.MULTILINE)
    
    tasks = []
    for block in task_blocks:
        if block.strip().startswith("### ["):
            task = parse_task_block(block)
            if task:
                tasks.append(task)
    
    return tasks


def get_stats(tasks: list[dict]) -> dict:
    """Calculate statistics from tasks."""
    done = sum(1 for t in tasks if t.get("status") == "DONE")
    in_progress = sum(1 for t in tasks if t.get("status") == "IN_PROGRESS")
    blocked = sum(1 for t in tasks if t.get("status") == "BLOCKED")
    todo = sum(1 for t in tasks if t.get("status") == "TODO")
    
    # Priority breakdown
    by_priority = {}
    for t in tasks:
        if t.get("status") != "DONE":
            p = t.get("priority", "P3")
            by_priority[p] = by_priority.get(p, 0) + 1
    
    # Owner breakdown
    by_owner = {}
    for t in tasks:
        if t.get("status") == "IN_PROGRESS":
            owner = t.get("owner", "unassigned")
            by_owner[owner] = by_owner.get(owner, 0) + 1
    
    return {
        "total": len(tasks),
        "done": done,
        "in_progress": in_progress,
        "blocked": blocked,
        "todo": todo,
        "completion_rate": round(done / max(1, len(tasks)) * 100, 1),
        "by_priority": by_priority,
        "by_owner": by_owner
    }


def push_to_gist(data: dict) -> bool:
    """Push data to GitHub Gist."""
    if not GITHUB_TOKEN:
        # Save locally if no token
        output_file = PROJECT_DIR / "data" / "tasks-dashboard.json"
        output_file.parent.mkdir(parents=True, exist_ok=True)
        output_file.write_text(json.dumps(data, indent=2))
        print(f"Saved locally to {output_file}")
        return True
    
    url = f"https://api.github.com/gists/{GIST_ID}"
    headers = {
        "Authorization": f"token {GITHUB_TOKEN}",
        "Accept": "application/vnd.github.v3+json"
    }
    payload = {
        "files": {
            GIST_FILENAME: {
                "content": json.dumps(data, indent=2)
            }
        }
    }
    
    try:
        resp = requests.patch(url, headers=headers, json=payload, timeout=10)
        if resp.status_code == 200:
            print(f"✅ Pushed {len(data.get('tasks', []))} tasks to Gist")
            return True
        else:
            print(f"❌ Gist push failed: {resp.status_code} {resp.text[:100]}")
            return False
    except Exception as e:
        print(f"❌ Error pushing to Gist: {e}")
        return False


def main():
    print(f"📋 Parsing TASKS.md at {datetime.now().isoformat()}")
    
    tasks = parse_tasks_md()
    stats = get_stats(tasks)
    
    # Only include recent/active tasks to keep payload small
    # Include: all TODO, all IN_PROGRESS, all BLOCKED, last 20 DONE
    active_tasks = [t for t in tasks if t.get("status") in ("TODO", "IN_PROGRESS", "BLOCKED")]
    done_tasks = [t for t in tasks if t.get("status") == "DONE"][-20:]
    
    data = {
        "timestamp": datetime.now().isoformat(),
        "stats": stats,
        "tasks": active_tasks + done_tasks,
        "recent_done": done_tasks
    }
    
    push_to_gist(data)
    
    print(f"Stats: {stats['done']} done, {stats['in_progress']} in progress, {stats['todo']} todo")


if __name__ == "__main__":
    main()
