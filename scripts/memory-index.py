#!/usr/bin/env python3
"""
Local Memory Search with SQLite FTS5
NO API KEYS - 100% FREE - 100% LOCAL

Usage:
    python memory-index.py index    # Build/rebuild index
    python memory-index.py search "query"  # Search
"""

import sqlite3
import os
import sys
import re
import json
from pathlib import Path
from datetime import datetime

WORKSPACE = Path("/Users/mattia/Projects/Onde")
MEMORY_DIR = WORKSPACE / "memory"
DB_PATH = WORKSPACE / "data" / "memory-search.db"

def init_db():
    """Initialize SQLite with FTS5"""
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    
    # FTS5 virtual table for full-text search
    c.execute('''
        CREATE VIRTUAL TABLE IF NOT EXISTS memory_fts USING fts5(
            path,
            line_start,
            line_end,
            content,
            date_ref,
            tokenize='porter unicode61'
        )
    ''')
    
    # Metadata table
    c.execute('''
        CREATE TABLE IF NOT EXISTS index_meta (
            path TEXT PRIMARY KEY,
            mtime REAL,
            indexed_at TEXT
        )
    ''')
    
    conn.commit()
    return conn

def chunk_file(filepath: Path) -> list:
    """Split file into searchable chunks (by section/paragraph)"""
    chunks = []
    try:
        content = filepath.read_text(encoding='utf-8')
    except:
        return chunks
    
    lines = content.split('\n')
    current_chunk = []
    chunk_start = 1
    
    for i, line in enumerate(lines, 1):
        # New section on ## headers or empty line after content
        if line.startswith('## ') or (not line.strip() and current_chunk):
            if current_chunk:
                text = '\n'.join(current_chunk)
                if text.strip():
                    # Extract date references
                    date_refs = re.findall(r'\d{4}-\d{2}-\d{2}', text)
                    date_ref = date_refs[0] if date_refs else ''
                    chunks.append({
                        'path': str(filepath),
                        'line_start': chunk_start,
                        'line_end': i - 1,
                        'content': text,
                        'date_ref': date_ref
                    })
            current_chunk = [line] if line.strip() else []
            chunk_start = i
        else:
            current_chunk.append(line)
    
    # Last chunk
    if current_chunk:
        text = '\n'.join(current_chunk)
        if text.strip():
            date_refs = re.findall(r'\d{4}-\d{2}-\d{2}', text)
            date_ref = date_refs[0] if date_refs else ''
            chunks.append({
                'path': str(filepath),
                'line_start': chunk_start,
                'line_end': len(lines),
                'content': text,
                'date_ref': date_ref
            })
    
    return chunks

def index_files(conn):
    """Index all memory files"""
    c = conn.cursor()
    
    # Files to index
    files_to_index = list(MEMORY_DIR.glob('*.md'))
    files_to_index.append(WORKSPACE / 'MEMORY.md')
    
    indexed = 0
    for filepath in files_to_index:
        if not filepath.exists():
            continue
            
        mtime = filepath.stat().st_mtime
        
        # Check if already indexed and up to date
        c.execute('SELECT mtime FROM index_meta WHERE path = ?', (str(filepath),))
        row = c.fetchone()
        if row and row[0] >= mtime:
            continue
        
        # Remove old entries
        c.execute('DELETE FROM memory_fts WHERE path = ?', (str(filepath),))
        
        # Index chunks
        chunks = chunk_file(filepath)
        for chunk in chunks:
            c.execute('''
                INSERT INTO memory_fts (path, line_start, line_end, content, date_ref)
                VALUES (?, ?, ?, ?, ?)
            ''', (chunk['path'], chunk['line_start'], chunk['line_end'], 
                  chunk['content'], chunk['date_ref']))
        
        # Update metadata
        c.execute('''
            INSERT OR REPLACE INTO index_meta (path, mtime, indexed_at)
            VALUES (?, ?, ?)
        ''', (str(filepath), mtime, datetime.now().isoformat()))
        
        indexed += 1
        print(f"Indexed: {filepath.name} ({len(chunks)} chunks)")
    
    conn.commit()
    print(f"\nTotal files indexed: {indexed}")

def search(conn, query: str, max_results: int = 10):
    """Search memory with FTS5"""
    c = conn.cursor()
    
    # FTS5 search with BM25 ranking
    c.execute('''
        SELECT path, line_start, line_end, snippet(memory_fts, 3, '>>>', '<<<', '...', 64),
               bm25(memory_fts) as score
        FROM memory_fts
        WHERE memory_fts MATCH ?
        ORDER BY score
        LIMIT ?
    ''', (query, max_results))
    
    results = []
    for row in c.fetchall():
        results.append({
            'path': row[0],
            'lines': f"{row[1]}-{row[2]}",
            'snippet': row[3],
            'score': -row[4]  # BM25 returns negative scores
        })
    
    return results

def main():
    if len(sys.argv) < 2:
        print("Usage: memory-index.py [index|search] [query]")
        sys.exit(1)
    
    action = sys.argv[1]
    conn = init_db()
    
    if action == 'index':
        index_files(conn)
    elif action == 'search':
        if len(sys.argv) < 3:
            print("Usage: memory-index.py search <query>")
            sys.exit(1)
        
        query = ' '.join(sys.argv[2:])
        
        # Auto-index before search
        index_files(conn)
        
        results = search(conn, query)
        
        if not results:
            print(f"No results for: {query}")
        else:
            print(f"\n=== Results for: {query} ===\n")
            for i, r in enumerate(results, 1):
                print(f"{i}. {Path(r['path']).name} (lines {r['lines']}) [score: {r['score']:.2f}]")
                print(f"   {r['snippet']}")
                print()
        
        # Output JSON for programmatic use
        print("\n--- JSON ---")
        print(json.dumps(results, indent=2))
    
    conn.close()

if __name__ == '__main__':
    main()
