#!/usr/bin/env python3
"""
Push agent dashboard data to GitHub Gist for onde.surf API consumption.
Similar to push-stats-to-gist.py but for agent monitoring.

Cron: */5 * * * * python3 /Users/mattia/Projects/Onde/scripts/push-agent-status-to-gist.py
"""

import json
import os
import subprocess
from datetime import datetime, timezone
from pathlib import Path
import requests

# Config
PROJECT_DIR = Path(__file__).parent.parent
GIST_ID = os.getenv("AGENT_GIST_ID", "12a07b9ed63e19f01d2693b69f8a0e3b")  # Create if doesn't exist
GITHUB_TOKEN = os.getenv("GITHUB_GIST_TOKEN", "")
GIST_FILENAME = "onde-agent-status.json"

def run_command(cmd: list[str], cwd: str = None) -> str:
    """Run a shell command and return output."""
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, cwd=cwd or str(PROJECT_DIR), timeout=30)
        return result.stdout.strip()
    except Exception as e:
        return f"error: {e}"

def get_task_stats() -> dict:
    """Get task statistics from TASKS.md (pipe-delimited tables)."""
    tasks_file = PROJECT_DIR / "TASKS.md"
    if not tasks_file.exists():
        return {"total": 0, "done": 0, "in_progress": 0, "todo": 0}
    
    content = tasks_file.read_text()
    import re
    
    done = 0
    in_progress = 0
    todo = 0
    
    # Parse pipe-delimited table rows: | # | ID | Task | Impact | Status | Owner |
    for line in content.split("\n"):
        # Skip header/separator lines
        if not line.strip().startswith("|") or line.strip().startswith("|---") or line.strip().startswith("| #"):
            continue
        
        cells = [c.strip() for c in line.split("|")]
        # cells[0] is empty (before first |), actual data starts at cells[1]
        # We need at least 6 cells for a valid task row: empty, #, ID, Task, Impact, Status, Owner, ...
        if len(cells) < 6:
            continue
        
        # Status is typically the 5th cell (index 5)
        status_cell = cells[5] if len(cells) > 5 else ""
        
        if "✅ DONE" in status_cell or "DONE" in status_cell.upper():
            done += 1
        elif "IN_PROGRESS" in status_cell.upper():
            in_progress += 1
        elif "TODO" in status_cell.upper():
            todo += 1
        elif "BLOCKED" in status_cell.upper():
            todo += 1  # Count blocked as todo
        elif "READY" in status_cell.upper() or "DRAFT" in status_cell.upper() or "PARTIAL" in status_cell.upper():
            todo += 1  # Count various ready/draft/partial states as todo
    
    total = done + in_progress + todo
    return {
        "total": total,
        "done": done,
        "in_progress": in_progress,
        "todo": todo,
        "completion_rate": round(done / max(1, total) * 100, 1)
    }

def get_current_tasks_by_agent() -> dict:
    """Get current IN_PROGRESS tasks for each agent (from pipe-delimited tables)."""
    tasks_file = PROJECT_DIR / "TASKS.md"
    if not tasks_file.exists():
        return {"clawdinho": None, "ondinho": None}
    
    content = tasks_file.read_text()
    
    result = {"clawdinho": None, "ondinho": None}
    
    # Parse pipe-delimited table rows: | # | ID | Task | Impact | Status | Owner |
    for line in content.split("\n"):
        if not line.strip().startswith("|") or line.strip().startswith("|---") or line.strip().startswith("| #"):
            continue
        
        cells = [c.strip() for c in line.split("|")]
        if len(cells) < 7:
            continue
        
        task_id = cells[2]    # ID column
        task_name = cells[3]  # Task column
        status = cells[5]     # Status column
        owner = cells[6]      # Owner column
        
        # Only IN_PROGRESS tasks
        if "IN_PROGRESS" not in status.upper():
            continue
        
        owner_lower = owner.lower()
        
        if 'clawd' in owner_lower:
            if result["clawdinho"] is None:
                result["clawdinho"] = {"id": task_id, "title": task_name[:60]}
        elif 'onde' in owner_lower or 'bot' in owner_lower:
            if result["ondinho"] is None:
                result["ondinho"] = {"id": task_id, "title": task_name[:60]}
    
    return result

def get_system_health() -> dict:
    """Get system CPU, memory, and disk metrics."""
    result = {"cpu_percent": 0, "memory_percent": 0, "gpu_temp": None}
    
    try:
        # CPU usage via top (macOS)
        cpu_out = run_command(["top", "-l", "1", "-n", "0"])
        for line in cpu_out.split("\n"):
            if "CPU usage" in line:
                # Parse "CPU usage: 5.26% user, 8.77% sys, 85.96% idle"
                parts = line.split(",")
                for part in parts:
                    part = part.strip()
                    if "idle" in part:
                        try:
                            idle = float(part.split("%")[0].strip().split()[-1])
                            result["cpu_percent"] = round(100 - idle, 1)
                        except (ValueError, IndexError):
                            pass
                break
    except Exception:
        pass
    
    try:
        # Memory usage via vm_stat (macOS)
        vm_out = run_command(["vm_stat"])
        page_size = 16384  # Default for Apple Silicon
        pages_free = 0
        pages_active = 0
        pages_inactive = 0
        pages_speculative = 0
        pages_wired = 0
        pages_compressor = 0
        
        for line in vm_out.split("\n"):
            if "page size of" in line:
                try:
                    page_size = int(line.split("page size of")[1].strip().split()[0])
                except (ValueError, IndexError):
                    pass
            elif "Pages free:" in line:
                try: pages_free = int(line.split(":")[1].strip().rstrip("."))
                except: pass
            elif "Pages active:" in line:
                try: pages_active = int(line.split(":")[1].strip().rstrip("."))
                except: pass
            elif "Pages inactive:" in line:
                try: pages_inactive = int(line.split(":")[1].strip().rstrip("."))
                except: pass
            elif "Pages speculative:" in line:
                try: pages_speculative = int(line.split(":")[1].strip().rstrip("."))
                except: pass
            elif "Pages wired down:" in line:
                try: pages_wired = int(line.split(":")[1].strip().rstrip("."))
                except: pass
            elif "Pages occupied by compressor:" in line:
                try: pages_compressor = int(line.split(":")[1].strip().rstrip("."))
                except: pass
        
        total_pages = pages_free + pages_active + pages_inactive + pages_speculative + pages_wired + pages_compressor
        if total_pages > 0:
            used_pages = pages_active + pages_wired + pages_compressor
            result["memory_percent"] = round((used_pages / total_pages) * 100, 1)
    except Exception:
        pass
    
    return result


def get_memory_stats() -> dict:
    """Get memory statistics for today."""
    today = datetime.now().strftime("%Y-%m-%d")
    memory_file = PROJECT_DIR / "memory" / f"{today}.md"
    
    if not memory_file.exists():
        return {"entries_today": 0, "file_exists": False, "size_bytes": 0}
    
    content = memory_file.read_text()
    entries = content.count("\n## ")
    
    return {
        "entries_today": entries,
        "file_exists": True,
        "size_bytes": memory_file.stat().st_size,
        "file_path": f"memory/{today}.md"
    }

def get_git_activity() -> dict:
    """Get recent git activity by author."""
    def get_last_commit(author_pattern: str) -> dict:
        # Get commits by various potential author names
        cmd = ["git", "log", f"--author={author_pattern}", "-1", "--format=%h|%s|%ci|%ar"]
        output = run_command(cmd)
        if output and not output.startswith("error") and "|" in output:
            parts = output.split("|")
            if len(parts) >= 4:
                return {
                    "hash": parts[0],
                    "message": parts[1][:50],
                    "date": parts[2],
                    "ago": parts[3]
                }
        return None
    
    # Try different author patterns
    clawdinho_commit = (
        get_last_commit("Clawdinho") or 
        get_last_commit("Clawd") or 
        get_last_commit("mattia") or
        get_last_commit("Mattia")
    )
    
    ondinho_commit = (
        get_last_commit("Ondinho") or 
        get_last_commit("onde-bot") or
        get_last_commit("Onde")
    )
    
    return {
        "clawdinho": clawdinho_commit,
        "ondinho": ondinho_commit,
        "total_commits_today": int(run_command([
            "git", "rev-list", "--count", 
            f"--since={datetime.now().strftime('%Y-%m-%d')}T00:00:00",
            "HEAD"
        ]) or 0)
    }

def get_autotrader_status() -> dict:
    """Get autotrader status."""
    # Check if running
    pid_output = run_command(["pgrep", "-f", "kalshi-autotrader"])
    running = bool(pid_output and not pid_output.startswith("error"))
    
    # Get health file if exists
    health_file = PROJECT_DIR / "data" / "trading" / "autotrader-health.json"
    health = {}
    if health_file.exists():
        try:
            health = json.loads(health_file.read_text())
        except:
            pass
    
    return {
        "running": running,
        "pid": pid_output if running else None,
        "circuit_breaker": health.get("circuit_breaker_active", False),
        "consecutive_losses": health.get("consecutive_losses", 0),
        "last_trade": health.get("last_trade_time"),
        "uptime_hours": health.get("uptime_hours")
    }

def get_gpu_status() -> dict:
    """Get GPU status (Radeon eGPU)."""
    # Check for Radeon in Thunderbolt devices
    tb_output = run_command(["system_profiler", "SPThunderboltDataType"])
    radeon_connected = "Core X" in tb_output or "Razer" in tb_output
    
    return {
        "radeon_connected": radeon_connected,
        "type": "Radeon 7900 XTX" if radeon_connected else None,
        "vram_gb": 24 if radeon_connected else None
    }

def get_ollama_status() -> dict:
    """Get Ollama LLM server status."""
    # Check local Ollama
    try:
        r = requests.get("http://localhost:11434/api/tags", timeout=2)
        if r.ok:
            models = [m["name"] for m in r.json().get("models", [])]
            return {"running": True, "location": "local", "models": models[:5]}
    except:
        pass
    
    # Check remote Ollama (192.168.1.111)
    try:
        r = requests.get("http://192.168.1.111:11434/api/tags", timeout=2)
        if r.ok:
            models = [m["name"] for m in r.json().get("models", [])]
            return {"running": True, "location": "remote", "models": models[:5]}
    except:
        pass
    
    return {"running": False, "location": None, "models": []}

def get_alert_count() -> int:
    """Count pending alert files."""
    scripts_dir = PROJECT_DIR / "scripts"
    count = 0
    for f in scripts_dir.glob("*.alert"):
        count += 1
    return count

def build_dashboard_data() -> dict:
    """Build complete dashboard data."""
    git = get_git_activity()
    current_tasks = get_current_tasks_by_agent()
    
    # Determine agent status based on recent commits (active if committed in last 30 min)
    def is_active(commit_info):
        if not commit_info or not commit_info.get("ago"):
            return "idle"
        ago = commit_info["ago"].lower()
        # Parse "X minutes ago", "X seconds ago", etc.
        if "second" in ago or "minute" in ago:
            return "active"
        if "hour" in ago:
            try:
                hours = int(ago.split()[0])
                return "active" if hours < 1 else "idle"
            except:
                pass
        return "idle"
    
    return {
        "timestamp": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
        "tasks": get_task_stats(),
        "memory": get_memory_stats(),
        "git": git,
        "autotrader": get_autotrader_status(),
        "gpu": get_gpu_status(),
        "ollama": get_ollama_status(),
        "alerts_pending": get_alert_count(),
        "systemHealth": get_system_health(),
        "agents": {
            "clawdinho": {
                "host": "FRH-M1-PRO",
                "model": "claude-opus-4-5",
                "status": is_active(git.get("clawdinho")),
                "current_task": current_tasks.get("clawdinho")
            },
            "ondinho": {
                "host": "M4-Pro",
                "model": "claude-sonnet-4",
                "status": is_active(git.get("ondinho")),
                "current_task": current_tasks.get("ondinho")
            }
        }
    }

def push_to_gist(data: dict) -> bool:
    """Push data to GitHub Gist."""
    if not GITHUB_TOKEN:
        print("No GITHUB_GIST_TOKEN set, saving locally only")
        # Save locally for debugging
        local_file = PROJECT_DIR / "data" / "agent-status.json"
        local_file.parent.mkdir(parents=True, exist_ok=True)
        local_file.write_text(json.dumps(data, indent=2))
        print(f"Saved to {local_file}")
        return False
    
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
        response = requests.patch(url, headers=headers, json=payload, timeout=10)
        if response.ok:
            print(f"✅ Pushed to gist: {GIST_ID}")
            return True
        else:
            print(f"❌ Gist push failed: {response.status_code} - {response.text[:100]}")
            return False
    except Exception as e:
        print(f"❌ Gist push error: {e}")
        return False

def main():
    print(f"🤖 Agent Status Push - {datetime.now().isoformat()}")
    
    data = build_dashboard_data()
    print(f"Tasks: {data['tasks']['done']}/{data['tasks']['total']} done")
    print(f"Memory entries: {data['memory']['entries_today']}")
    print(f"Autotrader: {'🟢 running' if data['autotrader']['running'] else '🔴 stopped'}")
    print(f"GPU: {'🟢 connected' if data['gpu']['radeon_connected'] else '⚪ disconnected'}")
    print(f"Ollama: {'🟢 ' + data['ollama']['location'] if data['ollama']['running'] else '🔴 offline'}")
    print(f"Alerts: {data['alerts_pending']}")
    
    push_to_gist(data)

if __name__ == "__main__":
    main()
