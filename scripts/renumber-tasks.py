#!/usr/bin/env python3
"""
Renumber duplicate task IDs in TASKS.md

Usage:
  python renumber-tasks.py --start-line 7338 --end-line 8692 --new-start-id 808

This will find all [TXXX] task definitions in the specified line range
and renumber them starting from the new ID, also updating any internal
Depends/Blocks references within that range.
"""

import re
import sys
import argparse
from pathlib import Path

def main():
    parser = argparse.ArgumentParser(description='Renumber duplicate task IDs in TASKS.md')
    parser.add_argument('--start-line', type=int, required=True, help='Starting line number')
    parser.add_argument('--end-line', type=int, required=True, help='Ending line number')
    parser.add_argument('--new-start-id', type=int, required=True, help='New starting task ID')
    parser.add_argument('--dry-run', action='store_true', help='Show changes without applying')
    parser.add_argument('--file', default='TASKS.md', help='Task file path')
    args = parser.parse_args()
    
    filepath = Path(args.file)
    if not filepath.exists():
        print(f"Error: {filepath} not found")
        sys.exit(1)
    
    lines = filepath.read_text().splitlines()
    total_lines = len(lines)
    
    if args.start_line < 1 or args.end_line > total_lines:
        print(f"Error: Line range must be within 1-{total_lines}")
        sys.exit(1)
    
    # Find all task definitions in range
    task_pattern = re.compile(r'^### \[T(\d+)\]')
    ref_pattern = re.compile(r'\[T(\d+)\]')
    
    # Map old ID -> new ID
    id_mapping = {}
    next_id = args.new_start_id
    
    # First pass: identify tasks to renumber
    for i in range(args.start_line - 1, args.end_line):
        match = task_pattern.match(lines[i])
        if match:
            old_id = int(match.group(1))
            if old_id not in id_mapping:
                id_mapping[old_id] = next_id
                next_id += 1
    
    if not id_mapping:
        print("No task definitions found in the specified range")
        sys.exit(0)
    
    print(f"Found {len(id_mapping)} tasks to renumber:")
    for old_id, new_id in sorted(id_mapping.items()):
        print(f"  T{old_id} -> T{new_id}")
    
    if args.dry_run:
        print("\n--dry-run: No changes made")
        return
    
    # Second pass: apply renumbering
    def replace_ids(text, only_definitions=False):
        """Replace task IDs based on mapping"""
        def replacer(match):
            old_id = int(match.group(1))
            if old_id in id_mapping:
                return f'[T{id_mapping[old_id]}]'
            return match.group(0)
        
        if only_definitions:
            # Only replace in task definition lines (### [TXXX])
            return task_pattern.sub(lambda m: f'### [T{id_mapping.get(int(m.group(1)), int(m.group(1)))}]', text)
        else:
            return ref_pattern.sub(replacer, text)
    
    # Apply changes to the specified range
    for i in range(args.start_line - 1, args.end_line):
        lines[i] = replace_ids(lines[i])
    
    # Write back
    filepath.write_text('\n'.join(lines) + '\n')
    print(f"\nApplied {len(id_mapping)} task renumberings to {filepath}")

if __name__ == '__main__':
    main()
