#!/usr/bin/env python3
"""
split_chapters.py - Splitta libro in capitoli separati
Uso: python3 split_chapters.py input.txt output_dir/
"""

import sys
import os
import re
from pathlib import Path

def detect_chapter_pattern(text):
    """Rileva il pattern dei capitoli nel testo"""
    patterns = [
        (r'^Chapter\s+(\d+)', 'Chapter'),
        (r'^Capitolo\s+(\d+)', 'Capitolo'),
        (r'^CHAPTER\s+(\d+)', 'CHAPTER'),
        (r'^#\s+Chapter\s+(\d+)', '# Chapter'),
        (r'^##\s+Chapter\s+(\d+)', '## Chapter'),
    ]
    
    for pattern, name in patterns:
        matches = re.findall(pattern, text, re.MULTILINE)
        if len(matches) >= 2:
            return pattern, name
    
    return None, None

def split_book(input_file, output_dir):
    """Splitta libro in capitoli"""
    
    # Leggi input
    with open(input_file, 'r', encoding='utf-8') as f:
        text = f.read()
    
    # Crea output dir
    Path(output_dir).mkdir(parents=True, exist_ok=True)
    
    # Rileva pattern capitoli
    pattern, pattern_name = detect_chapter_pattern(text)
    
    if not pattern:
        print("⚠️ Nessun pattern capitoli rilevato!")
        print("   Provo split generico...")
        pattern = r'^(Chapter|Capitolo|CHAPTER)\s+'
    
    # Trova tutti i capitoli
    lines = text.split('\n')
    chapters = []
    current_chapter = []
    current_num = 0
    in_preamble = True
    
    for line in lines:
        match = re.match(pattern, line, re.IGNORECASE)
        if match:
            # Salva capitolo precedente
            if current_chapter:
                chapters.append((current_num, '\n'.join(current_chapter)))
            
            # Nuovo capitolo
            try:
                current_num = int(match.group(1)) if match.groups() else len(chapters) + 1
            except:
                current_num = len(chapters) + 1
            current_chapter = [line]
            in_preamble = False
        else:
            if in_preamble and not current_chapter:
                # Preamble (intro, prefazione, etc)
                if not chapters or chapters[0][0] != 0:
                    chapters.insert(0, (0, ''))
                chapters[0] = (0, chapters[0][1] + line + '\n')
            else:
                current_chapter.append(line)
    
    # Ultimo capitolo
    if current_chapter:
        chapters.append((current_num, '\n'.join(current_chapter)))
    
    # Scrivi file separati
    manifest = []
    for num, content in chapters:
        if num == 0:
            filename = "00_preamble.txt"
        else:
            filename = f"{num:02d}_chapter_{num}.txt"
        
        filepath = os.path.join(output_dir, filename)
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        
        lines_count = len(content.split('\n'))
        bytes_count = len(content.encode('utf-8'))
        manifest.append(f"{filename}: {lines_count} righe, {bytes_count} bytes")
        print(f"✅ {filename}: {lines_count} righe")
    
    # Scrivi manifest
    manifest_path = os.path.join(output_dir, "MANIFEST.txt")
    with open(manifest_path, 'w', encoding='utf-8') as f:
        f.write(f"Input: {input_file}\n")
        f.write(f"Capitoli: {len(chapters)}\n")
        f.write(f"Pattern: {pattern_name}\n\n")
        f.write('\n'.join(manifest))
    
    print(f"\n📋 Manifest: {manifest_path}")
    print(f"✅ Splittato in {len(chapters)} file")
    
    return len(chapters)

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Uso: python3 split_chapters.py input.txt output_dir/")
        sys.exit(1)
    
    input_file = sys.argv[1]
    output_dir = sys.argv[2]
    
    if not os.path.exists(input_file):
        print(f"🚨 File non trovato: {input_file}")
        sys.exit(1)
    
    split_book(input_file, output_dir)
