#!/usr/bin/env python3
"""
Local Vector Memory for Clawdbot
Offline-first semantic search over memory files using LanceDB + sentence-transformers
"""

import os
import re
import json
import hashlib
from pathlib import Path
from datetime import datetime
from typing import Optional

import lancedb
from sentence_transformers import SentenceTransformer

# Config
WORKSPACE = os.environ.get("CLAWDBOT_WORKSPACE", os.path.expanduser("~/Projects/Onde"))
DB_PATH = os.path.expanduser("~/.clawdbot/memory-vectors")
MODEL_NAME = "all-MiniLM-L6-v2"  # Fast, good quality, 384 dims
TABLE_NAME = "memory_chunks"

# Chunking config
CHUNK_SIZE = 500  # chars
CHUNK_OVERLAP = 100


def get_db():
    """Get or create LanceDB instance"""
    os.makedirs(DB_PATH, exist_ok=True)
    return lancedb.connect(DB_PATH)


def get_model():
    """Load embedding model (cached after first load)"""
    return SentenceTransformer(MODEL_NAME)


def chunk_text(text: str, source: str) -> list[dict]:
    """Split text into overlapping chunks with metadata"""
    chunks = []
    
    # Split by sections first (## headers)
    sections = re.split(r'\n(?=## )', text)
    
    for section in sections:
        if not section.strip():
            continue
            
        # Extract section title if present
        section_title = ""
        if section.startswith("## "):
            lines = section.split("\n", 1)
            section_title = lines[0].replace("## ", "").strip()
            section = lines[1] if len(lines) > 1 else ""
        
        # Chunk the section content
        words = section.split()
        current_chunk = []
        current_len = 0
        
        for word in words:
            current_chunk.append(word)
            current_len += len(word) + 1
            
            if current_len >= CHUNK_SIZE:
                chunk_text = " ".join(current_chunk)
                chunk_id = hashlib.md5(f"{source}:{chunk_text[:100]}".encode()).hexdigest()[:12]
                
                chunks.append({
                    "id": chunk_id,
                    "text": chunk_text,
                    "source": source,
                    "section": section_title,
                    "timestamp": datetime.now().isoformat(),
                })
                
                # Overlap: keep last N chars worth of words
                overlap_words = []
                overlap_len = 0
                for w in reversed(current_chunk):
                    if overlap_len + len(w) > CHUNK_OVERLAP:
                        break
                    overlap_words.insert(0, w)
                    overlap_len += len(w) + 1
                
                current_chunk = overlap_words
                current_len = overlap_len
        
        # Don't forget the last chunk
        if current_chunk:
            chunk_text = " ".join(current_chunk)
            if len(chunk_text) > 50:  # Skip tiny chunks
                chunk_id = hashlib.md5(f"{source}:{chunk_text[:100]}".encode()).hexdigest()[:12]
                chunks.append({
                    "id": chunk_id,
                    "text": chunk_text,
                    "source": source,
                    "section": section_title,
                    "timestamp": datetime.now().isoformat(),
                })
    
    return chunks


def index_memory_files(workspace: str = WORKSPACE, force: bool = False):
    """Index all memory files into vector DB"""
    db = get_db()
    model = get_model()
    
    # Find memory files
    memory_dir = Path(workspace) / "memory"
    memory_files = list(memory_dir.glob("*.md")) if memory_dir.exists() else []
    
    # Also index root md files
    root_files = [
        Path(workspace) / "MEMORY.md",
        Path(workspace) / "SOUL.md",
        Path(workspace) / "USER.md",
        Path(workspace) / "AGENTS.md",
    ]
    
    all_files = [f for f in memory_files + root_files if f.exists()]
    
    print(f"📚 Found {len(all_files)} files to index")
    
    # Collect all chunks
    all_chunks = []
    for file_path in all_files:
        relative_path = str(file_path.relative_to(workspace))
        print(f"  📄 {relative_path}")
        
        text = file_path.read_text()
        chunks = chunk_text(text, relative_path)
        all_chunks.extend(chunks)
    
    print(f"✂️  Created {len(all_chunks)} chunks")
    
    if not all_chunks:
        print("⚠️  No chunks to index!")
        return
    
    # Generate embeddings
    print("🧠 Generating embeddings...")
    texts = [c["text"] for c in all_chunks]
    embeddings = model.encode(texts, show_progress_bar=True)
    
    # Add vectors to chunks
    for i, chunk in enumerate(all_chunks):
        chunk["vector"] = embeddings[i].tolist()
    
    # Create or replace table
    if TABLE_NAME in db.table_names():
        db.drop_table(TABLE_NAME)
    
    table = db.create_table(TABLE_NAME, all_chunks)
    print(f"✅ Indexed {len(all_chunks)} chunks into {DB_PATH}")
    
    return table


def search(query: str, limit: int = 5, max_distance: float = 1.5) -> list[dict]:
    """Semantic search over memory"""
    db = get_db()
    model = get_model()
    
    if TABLE_NAME not in db.table_names():
        print("⚠️  No index found. Run: python memory_vectordb.py index")
        return []
    
    table = db.open_table(TABLE_NAME)
    
    # Embed query
    query_vector = model.encode(query).tolist()
    
    # Search
    results = table.search(query_vector).limit(limit).to_list()
    
    # Filter by distance (lower = better match) and format
    filtered = []
    for r in results:
        distance = r.get("_distance", float("inf"))
        if distance <= max_distance:
            # Convert L2 distance to similarity score (0-1, higher = better)
            score = 1 / (1 + distance)
            filtered.append({
                "text": r["text"],
                "source": r["source"],
                "section": r.get("section", ""),
                "score": round(score, 3),
                "distance": round(distance, 3),
            })
    
    return filtered


def search_cli(query: str, limit: int = 5):
    """CLI search with pretty output"""
    results = search(query, limit=limit)
    
    if not results:
        print("🔍 No relevant results found")
        return
    
    print(f"\n🔍 Found {len(results)} results for: '{query}'\n")
    
    for i, r in enumerate(results, 1):
        print(f"{'─' * 60}")
        print(f"#{i} [{r['source']}] (dist: {r['distance']}, score: {r['score']})")
        if r['section']:
            print(f"   Section: {r['section']}")
        print(f"\n{r['text'][:300]}{'...' if len(r['text']) > 300 else ''}\n")


if __name__ == "__main__":
    import sys
    
    if len(sys.argv) < 2:
        print("""
Usage:
  python memory_vectordb.py index          # Index memory files
  python memory_vectordb.py search "query" # Search memory
  python memory_vectordb.py status         # Show DB status
        """)
        sys.exit(1)
    
    cmd = sys.argv[1]
    
    if cmd == "index":
        index_memory_files()
    
    elif cmd == "search":
        if len(sys.argv) < 3:
            print("Usage: python memory_vectordb.py search 'your query'")
            sys.exit(1)
        query = " ".join(sys.argv[2:])
        search_cli(query)
    
    elif cmd == "status":
        db = get_db()
        if TABLE_NAME in db.table_names():
            table = db.open_table(TABLE_NAME)
            print(f"📊 Memory DB Status")
            print(f"   Path: {DB_PATH}")
            print(f"   Chunks: {len(table)}")
            print(f"   Model: {MODEL_NAME}")
        else:
            print("⚠️  No index found. Run: python memory_vectordb.py index")
    
    else:
        print(f"Unknown command: {cmd}")
        sys.exit(1)
