#!/usr/bin/env python3
"""
Validate TASKS.md for duplicate IDs and orphan dependencies.
Usage:
  python3 scripts/validate-tasks.py              # Check for issues
  python3 scripts/validate-tasks.py --next-id    # Show next available ID
  python3 scripts/validate-tasks.py --json       # Output as JSON
"""

import re
import sys
import json
import argparse
from pathlib import Path
from collections import Counter

TASKS_FILE = Path(__file__).parent.parent / "TASKS.md"


def parse_tasks(content: str) -> dict:
    """Parse TASKS.md and extract task information."""
    tasks = {}
    current_id = None
    current_data = {}
    
    for line in content.split('\n'):
        # Match task header: ### [T123] Title
        match = re.match(r'^###\s+\[T(\d+)\]\s+(.+)', line)
        if match:
            # Save previous task
            if current_id:
                tasks[current_id] = current_data
            
            current_id = int(match.group(1))
            current_data = {
                'title': match.group(2),
                'depends': [],
                'blocks': [],
                'status': None
            }
        elif current_id:
            # Parse depends
            if '**Depends**:' in line:
                deps = re.findall(r'\[T(\d+)\]', line)
                current_data['depends'] = [int(d) for d in deps]
            # Parse blocks
            elif '**Blocks**:' in line:
                blocks = re.findall(r'\[T(\d+)\]', line)
                current_data['blocks'] = [int(b) for b in blocks]
            # Parse status
            elif '**Status**:' in line:
                if 'DONE' in line:
                    current_data['status'] = 'DONE'
                elif 'IN_PROGRESS' in line:
                    current_data['status'] = 'IN_PROGRESS'
                elif 'TODO' in line:
                    current_data['status'] = 'TODO'
                elif 'BLOCKED' in line:
                    current_data['status'] = 'BLOCKED'
    
    # Don't forget last task
    if current_id:
        tasks[current_id] = current_data
    
    return tasks


def find_duplicates(content: str) -> list:
    """Find duplicate task IDs."""
    ids = re.findall(r'^###\s+\[T(\d+)\]', content, re.MULTILINE)
    counter = Counter(ids)
    return [(int(id_), count) for id_, count in counter.items() if count > 1]


def find_orphan_dependencies(tasks: dict) -> list:
    """Find tasks that depend on non-existent tasks."""
    orphans = []
    all_ids = set(tasks.keys())
    
    for task_id, data in tasks.items():
        for dep in data['depends']:
            if dep not in all_ids:
                orphans.append({
                    'task_id': task_id,
                    'missing_dep': dep,
                    'title': data['title']
                })
        for block in data['blocks']:
            if block not in all_ids:
                orphans.append({
                    'task_id': task_id,
                    'missing_block': block,
                    'title': data['title']
                })
    
    return orphans


def get_next_id(tasks: dict) -> int:
    """Get the next available task ID."""
    if not tasks:
        return 1
    return max(tasks.keys()) + 1


def main():
    parser = argparse.ArgumentParser(description='Validate TASKS.md')
    parser.add_argument('--next-id', action='store_true', help='Show next available ID')
    parser.add_argument('--json', action='store_true', help='Output as JSON')
    parser.add_argument('--file', type=str, default=str(TASKS_FILE), help='Path to TASKS.md')
    args = parser.parse_args()
    
    tasks_path = Path(args.file)
    if not tasks_path.exists():
        print(f"❌ File not found: {tasks_path}", file=sys.stderr)
        sys.exit(1)
    
    content = tasks_path.read_text()
    tasks = parse_tasks(content)
    duplicates = find_duplicates(content)
    orphans = find_orphan_dependencies(tasks)
    next_id = get_next_id(tasks)
    
    if args.next_id:
        print(next_id)
        return
    
    result = {
        'total_tasks': len(tasks),
        'duplicates': duplicates,
        'orphan_dependencies': orphans,
        'next_available_id': next_id,
        'status_counts': {
            'DONE': sum(1 for t in tasks.values() if t['status'] == 'DONE'),
            'TODO': sum(1 for t in tasks.values() if t['status'] == 'TODO'),
            'IN_PROGRESS': sum(1 for t in tasks.values() if t['status'] == 'IN_PROGRESS'),
            'BLOCKED': sum(1 for t in tasks.values() if t['status'] == 'BLOCKED'),
            'other': sum(1 for t in tasks.values() if t['status'] not in ['DONE', 'TODO', 'IN_PROGRESS', 'BLOCKED'])
        }
    }
    
    if args.json:
        print(json.dumps(result, indent=2))
        return
    
    # Human-readable output
    print("📋 TASKS.md Validation Report")
    print("=" * 40)
    print(f"Total tasks: {result['total_tasks']}")
    print(f"Next available ID: T{result['next_available_id']}")
    print()
    
    print("📊 Status breakdown:")
    for status, count in result['status_counts'].items():
        if count > 0:
            print(f"   {status}: {count}")
    print()
    
    has_issues = False
    
    if duplicates:
        has_issues = True
        print("⚠️  Duplicate task IDs found:")
        for id_, count in duplicates:
            print(f"   T{id_}: appears {count} times")
        print()
    else:
        print("✅ No duplicate IDs")
    
    if orphans:
        has_issues = True
        print("⚠️  Orphan dependencies found:")
        for orphan in orphans:
            if 'missing_dep' in orphan:
                print(f"   T{orphan['task_id']} depends on missing T{orphan['missing_dep']}")
            if 'missing_block' in orphan:
                print(f"   T{orphan['task_id']} blocks missing T{orphan['missing_block']}")
        print()
    else:
        print("✅ No orphan dependencies")
    
    if has_issues:
        sys.exit(1)
    else:
        print("\n✅ All checks passed!")
        sys.exit(0)


if __name__ == '__main__':
    main()
