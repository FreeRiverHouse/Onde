#!/usr/bin/env python3
"""
Push TASKS.md data to GitHub Gist for onde.surf Task Management Panel.
Parses TASKS.md table format and extracts individual task details.

Cron: */10 * * * * python3 /Users/mattia/Projects/Onde/scripts/push-tasks-to-gist.py
"""

import json
import os
import re
import subprocess
from datetime import datetime
from pathlib import Path

# Config
PROJECT_DIR = Path(__file__).parent.parent
GIST_ID = os.getenv("TASKS_GIST_ID", "0c71303677d56c9f579b40094128b00b")
GIST_FILENAME = "onde-tasks-data.json"


def parse_table_row(line: str) -> list[str]:
    """Parse a markdown table row into cells."""
    if not line.strip().startswith("|"):
        return []
    cells = [c.strip() for c in line.strip().split("|")]
    # Remove empty first and last cells from | delimiters
    if cells and cells[0] == "":
        cells = cells[1:]
    if cells and cells[-1] == "":
        cells = cells[:-1]
    return cells


def normalize_status(status_str: str) -> str:
    """Normalize status string to a standard value."""
    s = status_str.upper().strip()
    if "✅" in s or "DONE" in s:
        return "DONE"
    if "IN_PROGRESS" in s or "IN PROGRESS" in s or "🔄" in s:
        return "IN_PROGRESS"
    if "BLOCKED" in s or "🚫" in s:
        return "BLOCKED"
    if "READY" in s or "DRAFT" in s or "SCRIPT" in s:
        return "TODO"
    return "TODO"


def parse_tasks_md() -> list[dict]:
    """Parse TASKS.md and return list of tasks."""
    tasks_file = PROJECT_DIR / "TASKS.md"
    if not tasks_file.exists():
        return []
    
    content = tasks_file.read_text()
    tasks = []
    current_section = ""
    in_table = False
    header_cols = []
    
    for line in content.split("\n"):
        stripped = line.strip()
        
        # Track sections for priority
        if stripped.startswith("### "):
            current_section = stripped
            in_table = False
            continue
        
        # Detect table headers
        if stripped.startswith("|") and "ID" in stripped and "Task" in stripped:
            header_cols = parse_table_row(stripped)
            in_table = True
            continue
        
        # Skip separator rows
        if stripped.startswith("|") and set(stripped.replace("|", "").replace("-", "").strip()) <= {" ", ""}:
            continue
        
        # Parse table data rows
        if in_table and stripped.startswith("|"):
            cells = parse_table_row(stripped)
            if len(cells) < 4:
                continue
            
            # Map cells to fields based on header
            task = {}
            for i, col_name in enumerate(header_cols):
                if i >= len(cells):
                    break
                val = cells[i].strip()
                col = col_name.strip().lower()
                
                if col == "#":
                    pass  # row number, skip
                elif col == "id":
                    task["id"] = val
                elif col == "task":
                    task["title"] = val
                elif col == "impact":
                    task["impact"] = val
                elif col == "status":
                    task["status"] = normalize_status(val)
                elif col == "owner":
                    if val and val != "-":
                        task["owner"] = val
            
            # Determine priority from section
            if "BLOCCANTE" in current_section:
                task["priority"] = "P0"
            elif "ALTA" in current_section:
                task["priority"] = "P1"
            elif "MEDIA" in current_section:
                task["priority"] = "P2"
            else:
                task["priority"] = "P3"
            
            if task.get("id"):
                tasks.append(task)
        elif not stripped.startswith("|"):
            in_table = False
    
    return tasks


def get_stats(tasks: list[dict]) -> dict:
    """Calculate statistics from tasks."""
    done = sum(1 for t in tasks if t.get("status") == "DONE")
    in_progress = sum(1 for t in tasks if t.get("status") == "IN_PROGRESS")
    blocked = sum(1 for t in tasks if t.get("status") == "BLOCKED")
    todo = sum(1 for t in tasks if t.get("status") == "TODO")
    
    by_priority = {}
    for t in tasks:
        if t.get("status") != "DONE":
            p = t.get("priority", "P3")
            by_priority[p] = by_priority.get(p, 0) + 1
    
    by_owner = {}
    for t in tasks:
        if t.get("status") in ("IN_PROGRESS", "TODO"):
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
    """Push data to GitHub Gist using gh CLI."""
    # Save locally first
    output_file = PROJECT_DIR / "data" / "tasks-dashboard.json"
    output_file.parent.mkdir(parents=True, exist_ok=True)
    content = json.dumps(data, indent=2)
    output_file.write_text(content)
    print(f"Saved locally to {output_file}")
    
    # Push via gh CLI
    try:
        result = subprocess.run(
            ["gh", "gist", "edit", GIST_ID, "-f", GIST_FILENAME, "-"],
            input=content, capture_output=True, text=True, timeout=15
        )
        if result.returncode == 0:
            print(f"✅ Pushed {len(data.get('tasks', []))} tasks to Gist {GIST_ID}")
            return True
        else:
            print(f"❌ Gist push failed: {result.stderr[:200]}")
            return False
    except Exception as e:
        print(f"❌ Error pushing to Gist: {e}")
        return False


def main():
    print(f"📋 Parsing TASKS.md at {datetime.now().isoformat()}")
    
    tasks = parse_tasks_md()
    stats = get_stats(tasks)
    
    active_tasks = [t for t in tasks if t.get("status") in ("TODO", "IN_PROGRESS", "BLOCKED")]
    done_tasks = [t for t in tasks if t.get("status") == "DONE"][-20:]
    
    data = {
        "timestamp": datetime.now().isoformat(),
        "stats": stats,
        "tasks": active_tasks + done_tasks,
        "recent_done": done_tasks
    }
    
    push_to_gist(data)
    
    print(f"Stats: {stats['done']} done, {stats['in_progress']} in progress, {stats['todo']} todo, {stats['blocked']} blocked")


if __name__ == "__main__":
    main()
