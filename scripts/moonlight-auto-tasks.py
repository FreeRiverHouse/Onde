#!/usr/bin/env python3
"""
Moonlight Magic House - Automatic Task Generator

Analyzes the current codebase and generates new feature tasks based on:
1. Missing rooms or features
2. Incomplete interactive objects
3. Missing translations
4. Test coverage gaps
5. Performance improvements
6. UX enhancements

Run: python3 scripts/moonlight-auto-tasks.py
"""

import os
import re
import json
from datetime import datetime
from pathlib import Path
from typing import List, Dict, Optional

# Configuration
PROJECT_DIR = Path(__file__).parent.parent
MOONLIGHT_DIR = PROJECT_DIR / "apps" / "moonlight-house"
TASKS_FILE = PROJECT_DIR / "TASKS.md"
OUTPUT_FILE = PROJECT_DIR / "scripts" / "moonlight-auto-tasks-output.md"

# Feature ideas pool - things we can always add
FEATURE_IDEAS = [
    {
        "category": "rooms",
        "title": "Add Secret Garden area",
        "description": "Hidden garden area accessible from main garden with rare plants and fairy lights",
        "priority": "P3",
    },
    {
        "category": "rooms", 
        "title": "Add Treehouse area",
        "description": "Accessible from garden, a cozy treehouse with binoculars and bird watching",
        "priority": "P3",
    },
    {
        "category": "gameplay",
        "title": "Add pet customization",
        "description": "Allow Luna to wear different accessories (hats, bows, glasses)",
        "priority": "P2",
    },
    {
        "category": "gameplay",
        "title": "Add daily challenges",
        "description": "Daily mini-quests with bonus rewards (e.g., visit 5 rooms, do 3 activities)",
        "priority": "P2",
    },
    {
        "category": "gameplay",
        "title": "Add friend visits feature",
        "description": "Occasionally a friend pet visits, triggering special activities",
        "priority": "P3",
    },
    {
        "category": "minigames",
        "title": "Add cooking mini-game",
        "description": "Interactive cooking game in kitchen - follow recipe, mix ingredients",
        "priority": "P2",
    },
    {
        "category": "minigames",
        "title": "Add gardening mini-game",
        "description": "Plant seeds, water them, watch them grow over time",
        "priority": "P2",
    },
    {
        "category": "minigames",
        "title": "Add music mini-game",
        "description": "Play simple songs on piano/xylophone with touch interaction",
        "priority": "P3",
    },
    {
        "category": "social",
        "title": "Add sharing feature",
        "description": "Take screenshots of Luna and share to social media",
        "priority": "P3",
    },
    {
        "category": "accessibility",
        "title": "Add sound-only mode",
        "description": "Audio descriptions for visually impaired users",
        "priority": "P4",
    },
    {
        "category": "progression",
        "title": "Add seasonal events",
        "description": "Special decorations and activities for holidays (Christmas, Easter, Halloween)",
        "priority": "P3",
    },
    {
        "category": "progression",
        "title": "Add level unlocks",
        "description": "New rooms/items unlock as player levels up",
        "priority": "P2",
    },
    {
        "category": "books",
        "title": "Add reading animations",
        "description": "When Luna reads, show book pages turning animation",
        "priority": "P2",
    },
    {
        "category": "books",
        "title": "Add book collection system",
        "description": "Collect and display read books on shelf with completion badges",
        "priority": "P2",
    },
    {
        "category": "polish",
        "title": "Add haptic feedback",
        "description": "Vibration feedback for mobile when performing actions",
        "priority": "P4",
    },
    {
        "category": "polish",
        "title": "Add particle effects for rewards",
        "description": "Confetti/sparkles when getting coins or achievements",
        "priority": "P3",
    },
]


def get_existing_task_ids() -> set:
    """Get all existing task IDs from TASKS.md"""
    try:
        content = TASKS_FILE.read_text()
        ids = set(re.findall(r'\[T(\d+)\]', content))
        return {int(i) for i in ids}
    except Exception as e:
        print(f"Error reading TASKS.md: {e}")
        return set()


def get_next_task_id(existing_ids: set) -> int:
    """Get the next available task ID"""
    if not existing_ids:
        return 1000
    return max(existing_ids) + 1


def analyze_codebase() -> Dict:
    """Analyze Moonlight codebase for gaps and improvements"""
    analysis = {
        "rooms": [],
        "objects": [],
        "translations_missing": [],
        "tests_missing": [],
        "suggestions": [],
    }
    
    # Check App.tsx for rooms
    app_file = MOONLIGHT_DIR / "src" / "App.tsx"
    if app_file.exists():
        content = app_file.read_text()
        
        # Find defined rooms
        rooms_match = re.search(r"type RoomKey = ([^;]+);", content)
        if rooms_match:
            rooms = re.findall(r"'(\w+)'", rooms_match.group(1))
            analysis["rooms"] = rooms
            
    # Check InteractiveObjects.tsx
    objects_file = MOONLIGHT_DIR / "src" / "components" / "InteractiveObjects.tsx"
    if objects_file.exists():
        content = objects_file.read_text()
        
        # Count objects per room
        for room in analysis.get("rooms", []):
            pattern = rf"{room}:\s*\[(.*?)\],"
            match = re.search(pattern, content, re.DOTALL)
            if match:
                objects = match.group(1).count("id:")
                analysis["objects"].append({"room": room, "count": objects})
                
    # Check for test coverage
    test_file = PROJECT_DIR / "scripts" / "moonlight-e2e-tests.ts"
    if test_file.exists():
        content = test_file.read_text()
        tests = len(re.findall(r"test\(", content))
        analysis["tests_count"] = tests
    else:
        analysis["tests_missing"].append("moonlight-e2e-tests.ts")
        
    return analysis


def generate_tasks(analysis: Dict, existing_ids: set) -> List[Dict]:
    """Generate new tasks based on analysis and feature ideas"""
    tasks = []
    next_id = get_next_task_id(existing_ids)
    
    # Check for rooms with few interactive objects
    for obj_info in analysis.get("objects", []):
        if obj_info["count"] < 3:
            tasks.append({
                "id": next_id,
                "title": f"Moonlight: Add more interactive objects to {obj_info['room']}",
                "priority": "P3",
                "notes": f"Room '{obj_info['room']}' only has {obj_info['count']} interactive objects. Add 2-3 more for variety.",
            })
            next_id += 1
            
    # Add random feature ideas (pick 3)
    import random
    random.shuffle(FEATURE_IDEAS)
    for idea in FEATURE_IDEAS[:3]:
        tasks.append({
            "id": next_id,
            "title": f"Moonlight: {idea['title']}",
            "priority": idea["priority"],
            "notes": idea["description"],
            "category": idea["category"],
        })
        next_id += 1
        
    return tasks


def format_task_md(task: Dict) -> str:
    """Format a task as Markdown"""
    return f"""### [T{task['id']}] {task['title']}
- **Status**: TODO
- **Owner**: @clawdinho
- **Created**: {datetime.now().strftime('%Y-%m-%d %H:%M')}
- **Depends**: -
- **Blocks**: -
- **Priority**: {task['priority']}
- **Notes**: {task['notes']}

"""


def main():
    print("🌙 Moonlight Magic House - Auto Task Generator")
    print("=" * 50)
    
    # Analyze codebase
    print("\n📊 Analyzing codebase...")
    analysis = analyze_codebase()
    
    print(f"  Found {len(analysis.get('rooms', []))} rooms")
    print(f"  Objects per room: {analysis.get('objects', [])}")
    
    # Get existing tasks
    existing_ids = get_existing_task_ids()
    print(f"  Existing task IDs: {len(existing_ids)}")
    
    # Generate new tasks
    print("\n✨ Generating new tasks...")
    new_tasks = generate_tasks(analysis, existing_ids)
    
    if not new_tasks:
        print("  No new tasks to generate!")
        return
        
    print(f"  Generated {len(new_tasks)} new tasks")
    
    # Write output
    output = "# Auto-Generated Moonlight Tasks\n\n"
    output += f"Generated: {datetime.now().isoformat()}\n\n"
    output += "---\n\n"
    
    for task in new_tasks:
        output += format_task_md(task)
        print(f"  - [T{task['id']}] {task['title']}")
        
    OUTPUT_FILE.write_text(output)
    print(f"\n📝 Written to: {OUTPUT_FILE}")
    print("\nReview and merge into TASKS.md if appropriate!")


if __name__ == "__main__":
    main()
